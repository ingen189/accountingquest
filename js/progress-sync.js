/**
 * AccountingQuest - Progress Sync Module
 * Synkroniserer brukerens fremgang med Firebase
 * 
 * Bruk:
 * 1. Inkluder Firebase SDK først
 * 2. Inkluder denne filen
 * 3. Kall ProgressSync.init() etter Firebase er initialisert
 */

var ProgressSync = (function() {
    var db = null;
    var auth = null;
    var userId = null;
    var isOnline = navigator.onLine;
    var pendingUpdates = [];
    var listeners = [];

    // Cache for raskere tilgang
    var progressCache = {
        bokforing: {},
        quiz: {},
        analyse: {},
        case_studies: {},
        hjernetrim: {},
        achievements: {},
        stats: {}
    };

    /**
     * Initialiser Progress Sync
     */
    function init() {
        if (typeof firebase === 'undefined') {
            console.error('ProgressSync: Firebase ikke lastet');
            return Promise.reject('Firebase not loaded');
        }

        db = firebase.database();
        auth = firebase.auth();

        // Lytt på online/offline status
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Logg inn anonymt hvis ikke innlogget
        return auth.signInAnonymously()
            .then(function(result) {
                userId = result.user.uid;
                console.log('ProgressSync: Innlogget som', userId);
                
                // Last inn eksisterende progress
                return loadProgress();
            })
            .then(function() {
                // Sync pending updates hvis online
                if (isOnline) {
                    syncPendingUpdates();
                }
                return userId;
            })
            .catch(function(error) {
                console.error('ProgressSync: Feil ved init', error);
                // Fallback til localStorage
                loadFromLocalStorage();
                return null;
            });
    }

    /**
     * Last inn progress fra Firebase
     */
    function loadProgress() {
        if (!userId || !db) return Promise.resolve();

        return db.ref('user_progress/' + userId).once('value')
            .then(function(snapshot) {
                var data = snapshot.val();
                if (data) {
                    progressCache = Object.assign(progressCache, data);
                    saveToLocalStorage();
                } else {
                    // Migrer fra localStorage hvis finnes
                    migrateFromLocalStorage();
                }
                notifyListeners('loaded', progressCache);
            });
    }

    /**
     * Migrer data fra localStorage til Firebase
     */
    function migrateFromLocalStorage() {
        var localData = {};
        
        // Bokføring progress
        var bokforingProgress = localStorage.getItem('bokforingProgress');
        if (bokforingProgress) {
            try {
                var parsed = JSON.parse(bokforingProgress);
                Object.keys(parsed).forEach(function(key) {
                    localData['bokforing/' + key] = {
                        completed: true,
                        score: parsed[key].score || 100,
                        attempts: parsed[key].attempts || 1,
                        lastAttempt: Date.now()
                    };
                });
            } catch(e) {}
        }

        // Quiz progress
        var quizProgress = localStorage.getItem('quizProgress');
        if (quizProgress) {
            try {
                var parsed = JSON.parse(quizProgress);
                Object.keys(parsed).forEach(function(cat) {
                    localData['quiz/' + cat] = {
                        completed: parsed[cat].completed || 0,
                        correct: parsed[cat].correct || 0,
                        lastAttempt: Date.now()
                    };
                });
            } catch(e) {}
        }

        // Oppdater Firebase med migrert data
        if (Object.keys(localData).length > 0 && userId && db) {
            var updates = {};
            Object.keys(localData).forEach(function(path) {
                updates[path] = localData[path];
            });
            db.ref('user_progress/' + userId).update(updates);
            console.log('ProgressSync: Migrerte', Object.keys(localData).length, 'entries fra localStorage');
        }
    }

    /**
     * Lagre progress for en modul
     * @param {string} module - bokforing, quiz, analyse, case_studies, hjernetrim
     * @param {string} itemId - ID for oppgaven/quizen
     * @param {object} data - Data å lagre (completed, score, etc.)
     */
    function saveProgress(module, itemId, data) {
        // Oppdater cache
        if (!progressCache[module]) progressCache[module] = {};
        progressCache[module][itemId] = Object.assign(
            progressCache[module][itemId] || {},
            data,
            { lastAttempt: Date.now() }
        );

        // Lagre til localStorage som backup
        saveToLocalStorage();

        // Sync til Firebase
        if (isOnline && userId && db) {
            var path = 'user_progress/' + userId + '/' + module + '/' + itemId;
            return db.ref(path).update(progressCache[module][itemId])
                .then(function() {
                    notifyListeners('saved', { module: module, itemId: itemId, data: data });
                })
                .catch(function(error) {
                    console.error('ProgressSync: Feil ved lagring', error);
                    queueUpdate(module, itemId, data);
                });
        } else {
            queueUpdate(module, itemId, data);
            return Promise.resolve();
        }
    }

    /**
     * Hent progress for en modul
     */
    function getProgress(module, itemId) {
        if (itemId) {
            return progressCache[module] ? progressCache[module][itemId] : null;
        }
        return progressCache[module] || {};
    }

    /**
     * Hent all progress
     */
    function getAllProgress() {
        return progressCache;
    }

    /**
     * Oppdater statistikk
     */
    function updateStats(statUpdates) {
        progressCache.stats = Object.assign(progressCache.stats || {}, statUpdates, {
            lastActive: Date.now()
        });

        saveToLocalStorage();

        if (isOnline && userId && db) {
            return db.ref('user_progress/' + userId + '/stats').update(progressCache.stats);
        }
        return Promise.resolve();
    }

    /**
     * Unlock achievement
     */
    function unlockAchievement(achievementId) {
        if (progressCache.achievements[achievementId]) {
            return Promise.resolve(false); // Allerede unlocked
        }

        progressCache.achievements[achievementId] = {
            unlockedAt: Date.now()
        };

        saveToLocalStorage();
        notifyListeners('achievement', achievementId);

        if (isOnline && userId && db) {
            return db.ref('user_progress/' + userId + '/achievements/' + achievementId)
                .set(progressCache.achievements[achievementId])
                .then(function() { return true; });
        }
        return Promise.resolve(true);
    }

    /**
     * Beregn total fremgang
     */
    function calculateOverallProgress() {
        var totals = {
            bokforing: { completed: 0, total: 36 },
            quiz: { completed: 0, total: 245 },
            analyse: { completed: 0, total: 11 },
            case_studies: { completed: 0, total: 15 },
            hjernetrim: { completed: 0, total: 10 }
        };

        // Tell fullførte
        Object.keys(progressCache.bokforing || {}).forEach(function(id) {
            if (progressCache.bokforing[id].completed) totals.bokforing.completed++;
        });

        Object.keys(progressCache.quiz || {}).forEach(function(cat) {
            totals.quiz.completed += progressCache.quiz[cat].completed || 0;
        });

        Object.keys(progressCache.analyse || {}).forEach(function(id) {
            if (progressCache.analyse[id].completed) totals.analyse.completed++;
        });

        Object.keys(progressCache.case_studies || {}).forEach(function(id) {
            if (progressCache.case_studies[id].completed) totals.case_studies.completed++;
        });

        Object.keys(progressCache.hjernetrim || {}).forEach(function(id) {
            if (progressCache.hjernetrim[id].completed) totals.hjernetrim.completed++;
        });

        // Beregn prosent
        var overallCompleted = 
            totals.bokforing.completed + 
            totals.quiz.completed + 
            totals.analyse.completed + 
            totals.case_studies.completed + 
            totals.hjernetrim.completed;
        
        var overallTotal = 
            totals.bokforing.total + 
            totals.quiz.total + 
            totals.analyse.total + 
            totals.case_studies.total + 
            totals.hjernetrim.total;

        return {
            modules: totals,
            overall: {
                completed: overallCompleted,
                total: overallTotal,
                percent: Math.round((overallCompleted / overallTotal) * 100)
            }
        };
    }

    // === Private helpers ===

    function saveToLocalStorage() {
        try {
            localStorage.setItem('aq_progress_cache', JSON.stringify(progressCache));
        } catch(e) {
            console.warn('ProgressSync: Kunne ikke lagre til localStorage');
        }
    }

    function loadFromLocalStorage() {
        try {
            var cached = localStorage.getItem('aq_progress_cache');
            if (cached) {
                progressCache = JSON.parse(cached);
            }
        } catch(e) {}
    }

    function queueUpdate(module, itemId, data) {
        pendingUpdates.push({ module: module, itemId: itemId, data: data });
        try {
            localStorage.setItem('aq_pending_updates', JSON.stringify(pendingUpdates));
        } catch(e) {}
    }

    function syncPendingUpdates() {
        if (!isOnline || !userId || !db || pendingUpdates.length === 0) return;

        var updates = {};
        pendingUpdates.forEach(function(update) {
            var path = update.module + '/' + update.itemId;
            updates[path] = Object.assign(
                progressCache[update.module][update.itemId] || {},
                update.data
            );
        });

        db.ref('user_progress/' + userId).update(updates)
            .then(function() {
                pendingUpdates = [];
                localStorage.removeItem('aq_pending_updates');
                console.log('ProgressSync: Synkroniserte', Object.keys(updates).length, 'oppdateringer');
            })
            .catch(function(error) {
                console.error('ProgressSync: Sync feilet', error);
            });
    }

    function handleOnline() {
        isOnline = true;
        console.log('ProgressSync: Online - synkroniserer...');
        syncPendingUpdates();
    }

    function handleOffline() {
        isOnline = false;
        console.log('ProgressSync: Offline - bruker lokal cache');
    }

    function addListener(callback) {
        listeners.push(callback);
        return function() {
            listeners = listeners.filter(function(l) { return l !== callback; });
        };
    }

    function notifyListeners(event, data) {
        listeners.forEach(function(callback) {
            try { callback(event, data); } catch(e) {}
        });
    }

    // Public API
    return {
        init: init,
        saveProgress: saveProgress,
        getProgress: getProgress,
        getAllProgress: getAllProgress,
        updateStats: updateStats,
        unlockAchievement: unlockAchievement,
        calculateOverallProgress: calculateOverallProgress,
        addListener: addListener,
        getUserId: function() { return userId; },
        isOnline: function() { return isOnline; }
    };
})();

// Auto-init hvis Firebase allerede er lastet
if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
    ProgressSync.init();
}
