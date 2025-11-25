/**
 * AccountingQuest - Firebase Configuration
 * Delt konfigurasjonsfil for alle sider
 * 
 * BRUK:
 * <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
 * <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
 * <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
 * <script src="js/firebase-config.js"></script>
 * 
 * API:
 * FirebaseConfig.init()           - Initialiser Firebase
 * FirebaseConfig.getDb()          - Hent database-referanse
 * FirebaseConfig.getAuth()        - Hent auth-referanse
 * FirebaseConfig.isReady()        - Sjekk om Firebase er klar
 * FirebaseConfig.signInAnon()     - Logg inn anonymt
 * FirebaseConfig.getCurrentUser() - Hent nÃ¥vÃ¦rende bruker
 */

var FirebaseConfig = (function() {
    // Firebase konfigurasjon
    var config = {
        apiKey: "AIzaSyAPuacYOSf4Hv-h36yA5Hav67SlpIFMIIQ",
        authDomain: "accountingquest-multiplayer.firebaseapp.com",
        databaseURL: "https://accountingquest-multiplayer-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "accountingquest-multiplayer",
        storageBucket: "accountingquest-multiplayer.firebasestorage.app",
        messagingSenderId: "525417361926",
        appId: "1:525417361926:web:ec9b737f82af9b21700987"
    };
    
    var db = null;
    var auth = null;
    var ready = false;
    var initPromise = null;
    var listeners = [];
    
    /**
     * Initialiser Firebase med retry-logikk
     */
    function init() {
        if (initPromise) return initPromise;
        
        initPromise = new Promise(function(resolve, reject) {
            var attempts = 0;
            var maxAttempts = 50; // 5 sekunder maks
            
            function tryInit() {
                attempts++;
                
                // Sjekk om Firebase SDK er lastet
                if (typeof firebase === 'undefined') {
                    if (attempts < maxAttempts) {
                        setTimeout(tryInit, 100);
                    } else {
                        reject(new Error('Firebase SDK ikke lastet etter 5 sekunder'));
                    }
                    return;
                }
                
                try {
                    // Initialiser hvis ikke allerede gjort
                    if (!firebase.apps.length) {
                        firebase.initializeApp(config);
                    }
                    
                    db = firebase.database();
                    auth = firebase.auth();
                    ready = true;
                    
                    console.log('ðŸ”¥ Firebase initialisert');
                    
                    // Varsle listeners
                    listeners.forEach(function(cb) {
                        try { cb(); } catch(e) { console.error(e); }
                    });
                    
                    resolve({ db: db, auth: auth });
                } catch (error) {
                    console.error('Firebase init feil:', error);
                    if (attempts < maxAttempts) {
                        setTimeout(tryInit, 200);
                    } else {
                        reject(error);
                    }
                }
            }
            
            tryInit();
        });
        
        return initPromise;
    }
    
    /**
     * Hent database-referanse
     */
    function getDb() {
        if (!ready) {
            console.warn('Firebase ikke klar ennÃ¥. Kall init() fÃ¸rst.');
        }
        return db;
    }
    
    /**
     * Hent auth-referanse
     */
    function getAuth() {
        if (!ready) {
            console.warn('Firebase ikke klar ennÃ¥. Kall init() fÃ¸rst.');
        }
        return auth;
    }
    
    /**
     * Sjekk om Firebase er klar
     */
    function isReady() {
        return ready;
    }
    
    /**
     * Logg inn anonymt
     */
    function signInAnon() {
        return init().then(function() {
            return auth.signInAnonymously();
        }).then(function(result) {
            console.log('ðŸ‘¤ Logget inn anonymt:', result.user.uid);
            return result.user;
        });
    }
    
    /**
     * Hent nÃ¥vÃ¦rende bruker
     */
    function getCurrentUser() {
        return auth ? auth.currentUser : null;
    }
    
    /**
     * Vent pÃ¥ at Firebase er klar
     */
    function onReady(callback) {
        if (ready) {
            callback();
        } else {
            listeners.push(callback);
        }
    }
    
    /**
     * KjÃ¸r database-operasjon med sikkerhet
     */
    function withDb(callback) {
        return init().then(function() {
            return callback(db);
        });
    }
    
    /**
     * KjÃ¸r auth-operasjon med sikkerhet
     */
    function withAuth(callback) {
        return init().then(function() {
            return callback(auth);
        });
    }
    
    // Auto-init nÃ¥r script lastes
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init().catch(function(err) {
                console.warn('Firebase auto-init feilet:', err);
            });
        });
    } else {
        init().catch(function(err) {
            console.warn('Firebase auto-init feilet:', err);
        });
    }
    
    // Public API
    return {
        init: init,
        getDb: getDb,
        getAuth: getAuth,
        isReady: isReady,
        signInAnon: signInAnon,
        getCurrentUser: getCurrentUser,
        onReady: onReady,
        withDb: withDb,
        withAuth: withAuth,
        config: config
    };
})();

// Eksporter for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseConfig;
}
