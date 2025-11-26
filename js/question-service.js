/**
 * AccountingQuest - Question Service (Sikker versjon)
 * 
 * ARKITEKTUR:
 * - questions/ - Spørsmål UTEN svar (åpen lesing)
 * - solutions/ - Fasit og forklaringer (IKKE tilgjengelig for klient)
 * - submissions/ - Brukerens svar (write-trigger for validering)
 * - validated_answers/ - Resultater med hint/forklaring (kun etter svar)
 * 
 * FLYT:
 * 1. Klient henter spørsmål fra questions/
 * 2. Klient sender svar til submissions/
 * 3. Firebase Rules validerer mot solutions/
 * 4. Klient leser resultat fra validated_answers/
 * 
 * BRUK:
 * <script src="js/firebase-config.js"></script>
 * <script src="js/question-service.js"></script>
 * 
 * QuestionService.getQuestion(type, id) - Hent spørsmål
 * QuestionService.submitAnswer(type, id, answer) - Send svar
 * QuestionService.getCategories(type) - Hent kategorier
 */

var QuestionService = (function() {
    'use strict';
    
    // Cache for spørsmål
    var questionCache = {};
    var categoryCache = {};
    
    /**
     * Hent database-referanse
     */
    function getDb() {
        if (typeof FirebaseConfig !== 'undefined') {
            return FirebaseConfig.getDb();
        }
        if (typeof firebase !== 'undefined' && firebase.database) {
            return firebase.database();
        }
        throw new Error('Firebase ikke initialisert');
    }
    
    /**
     * Hent bruker-ID
     */
    function getUserId() {
        if (typeof FirebaseConfig !== 'undefined') {
            var user = FirebaseConfig.getCurrentUser();
            return user ? user.uid : null;
        }
        if (typeof firebase !== 'undefined' && firebase.auth) {
            var currentUser = firebase.auth().currentUser;
            return currentUser ? currentUser.uid : null;
        }
        return null;
    }
    
    // =========================================
    // QUIZ SPØRSMÅL
    // =========================================
    
    /**
     * Hent quiz-spørsmål etter kategori
     * @param {string} category - Kategori (mva, regnskap, etc.)
     * @returns {Promise<Array>} Spørsmål uten fasit
     */
    function getQuizQuestions(category) {
        var cacheKey = 'quiz_' + category;
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        return getDb().ref('questions/quiz/' + category).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var questions = [];
                snapshot.forEach(function(child) {
                    var q = child.val();
                    // Fjern sensitiv info (ekstra sikkerhet)
                    questions.push({
                        id: child.key,
                        type: q.type,
                        question: q.question || q.q,
                        options: q.options || q.opts,
                        category: category,
                        difficulty: q.difficulty,
                        tags: q.tags,
                        law: q.law || q.l,
                        wiki: q.wiki || q.w
                        // IKKE: answer, a, explanation, exp, hint
                    });
                });
                
                questionCache[cacheKey] = questions;
                return questions;
            });
    }
    
    /**
     * Hent alle quiz-kategorier
     */
    function getQuizCategories() {
        if (categoryCache.quiz) {
            return Promise.resolve(categoryCache.quiz);
        }
        
        return getDb().ref('questions/quiz').once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var categories = [];
                snapshot.forEach(function(child) {
                    var count = child.numChildren();
                    categories.push({
                        id: child.key,
                        name: formatCategoryName(child.key),
                        count: count
                    });
                });
                
                categoryCache.quiz = categories;
                return categories;
            });
    }
    
    /**
     * Send quiz-svar og få resultat
     * @param {string} category - Kategori
     * @param {string} questionId - Spørsmåls-ID
     * @param {*} answer - Brukerens svar
     * @returns {Promise<Object>} Resultat med isCorrect, hint, explanation
     */
    function submitQuizAnswer(category, questionId, answer) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Må være innlogget'));
        }
        
        var submissionRef = getDb().ref('quiz_submissions/' + userId + '/' + category + '/' + questionId);
        var resultRef = getDb().ref('quiz_results/' + userId + '/' + category + '/' + questionId);
        
        // Skriv svar
        return submissionRef.set({
            answer: answer,
            submittedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            // Vent litt og les resultat (settes av Cloud Function eller Rules)
            return new Promise(function(resolve) {
                // Prøv å lese resultat etter kort delay
                setTimeout(function() {
                    resultRef.once('value').then(function(snap) {
                        if (snap.exists()) {
                            resolve(snap.val());
                        } else {
                            // Fallback: Sjekk lokalt (for utvikling)
                            checkAnswerLocally(category, questionId, answer).then(resolve);
                        }
                    });
                }, 100);
            });
        });
    }
    
    /**
     * Lokal svarsjekking (kun for utvikling/fallback)
     * I produksjon skal dette ALDRI brukes - Cloud Function gjør jobben
     */
    function checkAnswerLocally(category, questionId, userAnswer) {
        return getDb().ref('solutions/quiz/' + category + '/' + questionId).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return { isCorrect: false, error: 'Løsning ikke funnet' };
                }
                
                var solution = snapshot.val();
                var isCorrect = checkAnswer(userAnswer, solution.answer, solution.type);
                
                return {
                    isCorrect: isCorrect,
                    correctAnswer: isCorrect ? solution.answer : null,
                    hint: solution.hint,
                    explanation: solution.explanation,
                    law: solution.law,
                    wiki: solution.wiki
                };
            })
            .catch(function(error) {
                // Forventet feil hvis rules blokkerer
                console.log('Kan ikke lese løsning direkte (som forventet):', error.message);
                return { isCorrect: false, error: 'Kunne ikke validere' };
            });
    }
    
    // =========================================
    // BOKFØRING OPPGAVER
    // =========================================
    
    /**
     * Hent bokføringsoppgaver etter vanskelighetsgrad
     * @param {string} difficulty - easy/medium/hard
     */
    function getBokforingTasks(difficulty) {
        var cacheKey = 'bokforing_' + difficulty;
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        return getDb().ref('questions/bokforing/' + difficulty).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var tasks = [];
                snapshot.forEach(function(child) {
                    var t = child.val();
                    tasks.push({
                        id: child.key,
                        description: t.description,
                        difficulty: difficulty,
                        relevantAccounts: t.relevantAccounts,
                        prefill: t.prefill,
                        // IKKE: solution, hint
                    });
                });
                
                questionCache[cacheKey] = tasks;
                return tasks;
            });
    }
    
    /**
     * Send bokføring-svar
     * @param {string} taskId - Oppgave-ID
     * @param {Array} entries - Brukerens posteringer [{account, debit, credit}]
     */
    function submitBokforingAnswer(taskId, entries) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Må være innlogget'));
        }
        
        var submissionRef = getDb().ref('bokforing_submissions/' + userId + '/' + taskId);
        
        return submissionRef.set({
            entries: entries,
            submittedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            // Les resultat
            return getDb().ref('bokforing_results/' + userId + '/' + taskId).once('value');
        }).then(function(snap) {
            if (snap.exists()) {
                return snap.val();
            }
            // Fallback for utvikling
            return checkBokforingLocally(taskId, entries);
        });
    }
    
    /**
     * Lokal bokføring-sjekking (fallback)
     */
    function checkBokforingLocally(taskId, userEntries) {
        // Finn difficulty fra taskId
        var difficulties = ['easy', 'medium', 'hard'];
        
        return Promise.all(difficulties.map(function(diff) {
            return getDb().ref('solutions/bokforing/' + diff + '/' + taskId).once('value');
        })).then(function(snapshots) {
            for (var i = 0; i < snapshots.length; i++) {
                if (snapshots[i].exists()) {
                    var solution = snapshots[i].val();
                    var result = validateBokforingEntries(userEntries, solution.solution);
                    
                    return {
                        isCorrect: result.isCorrect,
                        correctEntries: result.isCorrect ? null : solution.solution,
                        hint: solution.hint,
                        errors: result.errors
                    };
                }
            }
            return { isCorrect: false, error: 'Oppgave ikke funnet' };
        });
    }
    
    /**
     * Valider bokføringsposteringer
     */
    function validateBokforingEntries(userEntries, correctSolution) {
        var errors = [];
        
        // Sjekk at debet = kredit
        var totalDebit = 0, totalCredit = 0;
        userEntries.forEach(function(e) {
            totalDebit += parseFloat(e.debit) || 0;
            totalCredit += parseFloat(e.credit) || 0;
        });
        
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            errors.push('Debet (' + totalDebit + ') er ikke lik kredit (' + totalCredit + ')');
        }
        
        // Sjekk mot løsning
        var isCorrect = true;
        
        // Normaliser og sammenlign
        var userNorm = normalizeEntries(userEntries);
        var correctNorm = normalizeEntries(correctSolution);
        
        if (userNorm.length !== correctNorm.length) {
            isCorrect = false;
            errors.push('Feil antall posteringer');
        } else {
            // Sjekk hver postering
            for (var i = 0; i < correctNorm.length; i++) {
                var found = false;
                for (var j = 0; j < userNorm.length; j++) {
                    if (entriesMatch(userNorm[j], correctNorm[i])) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    isCorrect = false;
                    errors.push('Mangler postering for konto ' + correctNorm[i].account);
                }
            }
        }
        
        return { isCorrect: isCorrect, errors: errors };
    }
    
    function normalizeEntries(entries) {
        return entries.map(function(e) {
            return {
                account: String(e.account).trim(),
                debit: parseFloat(e.debit) || 0,
                credit: parseFloat(e.credit) || 0
            };
        }).filter(function(e) {
            return e.debit > 0 || e.credit > 0;
        });
    }
    
    function entriesMatch(a, b) {
        return a.account === b.account &&
               Math.abs(a.debit - b.debit) < 0.01 &&
               Math.abs(a.credit - b.credit) < 0.01;
    }
    
    // =========================================
    // CORPORATE FINANCE
    // =========================================
    
    /**
     * Hent corporate finance spørsmål
     * @param {string} topic - time_value/valuation/capital_budgeting/etc.
     * @param {string} difficulty - beginner/intermediate/advanced
     */
    function getCorpFinQuestions(topic, difficulty) {
        var cacheKey = 'corpfin_' + topic + '_' + difficulty;
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        var path = difficulty 
            ? 'questions/corporate_finance/' + topic + '/' + difficulty
            : 'questions/corporate_finance/' + topic;
        
        return getDb().ref(path).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var questions = [];
                
                if (difficulty) {
                    // Direkte liste
                    snapshot.forEach(function(child) {
                        questions.push(sanitizeQuestion(child.key, child.val(), topic));
                    });
                } else {
                    // Har difficulty-nivåer
                    snapshot.forEach(function(diffSnap) {
                        diffSnap.forEach(function(child) {
                            var q = sanitizeQuestion(child.key, child.val(), topic);
                            q.difficulty = diffSnap.key;
                            questions.push(q);
                        });
                    });
                }
                
                questionCache[cacheKey] = questions;
                return questions;
            });
    }
    
    /**
     * Hent corp fin topics
     */
    function getCorpFinTopics() {
        if (categoryCache.corpfin) {
            return Promise.resolve(categoryCache.corpfin);
        }
        
        return getDb().ref('questions/corporate_finance').once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var topics = [];
                snapshot.forEach(function(child) {
                    topics.push({
                        id: child.key,
                        name: formatCategoryName(child.key)
                    });
                });
                
                categoryCache.corpfin = topics;
                return topics;
            });
    }
    
    /**
     * Submit corp fin answer
     */
    function submitCorpFinAnswer(topic, questionId, answer) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Må være innlogget'));
        }
        
        return getDb().ref('corpfin_submissions/' + userId + '/' + topic + '/' + questionId).set({
            answer: answer,
            submittedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            return getDb().ref('corpfin_results/' + userId + '/' + topic + '/' + questionId).once('value');
        }).then(function(snap) {
            return snap.exists() ? snap.val() : { validated: false };
        });
    }
    
    // =========================================
    // HJELPEFUNKSJONER
    // =========================================
    
    /**
     * Fjern sensitiv info fra spørsmål
     */
    function sanitizeQuestion(id, q, category) {
        return {
            id: id,
            type: q.type,
            question: q.question || q.q,
            options: q.options || q.opts,
            category: category,
            difficulty: q.difficulty,
            tags: q.tags,
            formula: q.formula,
            image: q.image
            // Fjernet: answer, a, explanation, exp, hint, solution
        };
    }
    
    /**
     * Generisk svarsjekk
     */
    function checkAnswer(userAnswer, correctAnswer, type) {
        switch (type) {
            case 'mc':
            case 'multiple_choice':
                return parseInt(userAnswer) === parseInt(correctAnswer);
                
            case 'tf':
            case 'true_false':
                return Boolean(userAnswer) === Boolean(correctAnswer);
                
            case 'multi':
            case 'multiple_select':
                if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
                    return false;
                }
                var userSorted = userAnswer.slice().sort();
                var correctSorted = correctAnswer.slice().sort();
                return JSON.stringify(userSorted) === JSON.stringify(correctSorted);
                
            case 'para':
            case 'input':
            case 'text':
                var userStr = String(userAnswer).toLowerCase().trim();
                if (Array.isArray(correctAnswer)) {
                    // Flere gyldige svar
                    return correctAnswer.some(function(valid) {
                        return userStr === String(valid).toLowerCase().trim();
                    });
                }
                return userStr === String(correctAnswer).toLowerCase().trim();
                
            case 'numeric':
            case 'number':
                var tolerance = 0.01;
                return Math.abs(parseFloat(userAnswer) - parseFloat(correctAnswer)) <= tolerance;
                
            default:
                return userAnswer === correctAnswer;
        }
    }
    
    /**
     * Formater kategorinavn
     */
    function formatCategoryName(key) {
        var names = {
            'grunnleggende_regnskap': 'Grunnleggende Regnskap',
            'mva': 'Merverdiavgift (MVA)',
            'bokforing': 'Bokføring',
            'skatt': 'Skatt',
            'revisjon': 'Revisjon og Kontroll',
            'regnskapsanalyse': 'Regnskapsanalyse',
            'arsregnskap': 'Årsregnskap og Noter',
            'regnskapsforing': 'Regnskapsføring',
            'ekonomistyring': 'Økonomistyring',
            'regnskapsavslutning': 'Regnskapsavslutning',
            'time_value': 'Tidsverdien av penger',
            'valuation': 'Verdsettelse',
            'capital_budgeting': 'Kapitalbudsjettering',
            'risk_return': 'Risiko og avkastning',
            'cost_of_capital': 'Kapitalkostnad',
            'capital_structure': 'Kapitalstruktur'
        };
        return names[key] || key.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
    }
    
    /**
     * Tøm cache
     */
    function clearCache() {
        questionCache = {};
        categoryCache = {};
    }
    
    /**
     * Hent hint for spørsmål (kun etter forsøk)
     */
    function getHint(type, category, questionId) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Må være innlogget'));
        }
        
        // Sjekk at bruker har prøvd å svare
        var submissionPath = type + '_submissions/' + userId + '/' + category + '/' + questionId;
        
        return getDb().ref(submissionPath).once('value')
            .then(function(snap) {
                if (!snap.exists()) {
                    return { error: 'Du må prøve å svare først' };
                }
                
                // Hent hint fra results
                var resultPath = type + '_results/' + userId + '/' + category + '/' + questionId;
                return getDb().ref(resultPath + '/hint').once('value');
            })
            .then(function(snap) {
                return { hint: snap.val() };
            });
    }
    
    // =========================================
    // PUBLIC API
    // =========================================
    
    return {
        // Quiz
        getQuizQuestions: getQuizQuestions,
        getQuizCategories: getQuizCategories,
        submitQuizAnswer: submitQuizAnswer,
        
        // Bokføring
        getBokforingTasks: getBokforingTasks,
        submitBokforingAnswer: submitBokforingAnswer,
        
        // Corporate Finance
        getCorpFinQuestions: getCorpFinQuestions,
        getCorpFinTopics: getCorpFinTopics,
        submitCorpFinAnswer: submitCorpFinAnswer,
        
        // Utilities
        getHint: getHint,
        clearCache: clearCache,
        checkAnswer: checkAnswer,
        formatCategoryName: formatCategoryName
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionService;
}
