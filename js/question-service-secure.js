/**
 * AccountingQuest - Secure Question Service
 * 
 * Sikker arkitektur:
 * - Spørsmål lastes ved start (uten fasit/hints)
 * - Hints hentes ON-DEMAND når knappen trykkes
 * - Forklaringer hentes ON-DEMAND etter svar
 * - Fasit sjekkes server-side (eller hentes ved behov)
 * 
 * Firebase struktur:
 * - questions/{module}/{topic}/{difficulty}/{id} - Spørsmålsdata
 * - solutions/{module}/{id} - Hints, forklaring, fasit
 */

var QuestionServiceSecure = (function() {
    
    var db = null;
    var cache = {
        questions: {},
        solutions: {}  // Cache solutions etter de er hentet
    };
    
    /**
     * Initialiser med Firebase database referanse
     */
    function init(database) {
        db = database;
        console.log('[QuestionService] Secure service initialized');
    }
    
    /**
     * Hent spørsmål for et tema/vanskelighetsgrad
     * Returnerer UTEN hints/explanation/solution
     */
    function getQuestions(module, topic, difficulty) {
        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            var path = 'questions/' + module + '/' + topic + '/' + difficulty;
            
            db.ref(path).once('value')
                .then(function(snapshot) {
                    var questions = [];
                    snapshot.forEach(function(child) {
                        var q = child.val();
                        // Fjern eventuelle løsningsdata som ikke skal være her
                        delete q.solution;
                        delete q.hints;
                        delete q.explanation;
                        delete q.correct;
                        questions.push(q);
                    });
                    
                    // Cache spørsmålene
                    questions.forEach(function(q) {
                        cache.questions[q.id] = q;
                    });
                    
                    console.log('[QuestionService] Loaded ' + questions.length + ' questions from ' + path);
                    resolve(questions);
                })
                .catch(reject);
        });
    }
    
    /**
     * Hent HINT for et spørsmål
     * Hentes on-demand når bruker trykker hint-knappen
     * @param questionId - ID på spørsmålet
     * @param hintLevel - Hvilket hint-nivå (0, 1, 2...)
     */
    function getHint(module, questionId, hintLevel) {
        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            // Sjekk cache først
            var cacheKey = module + '_' + questionId;
            if (cache.solutions[cacheKey] && cache.solutions[cacheKey].hints) {
                var hints = cache.solutions[cacheKey].hints;
                if (hintLevel < hints.length) {
                    resolve({
                        hint: hints[hintLevel],
                        level: hintLevel + 1,
                        total: hints.length,
                        hasMore: hintLevel + 1 < hints.length
                    });
                    return;
                }
            }
            
            // Hent fra Firebase
            var path = 'solutions/' + module + '/' + questionId + '/hints';
            
            db.ref(path).once('value')
                .then(function(snapshot) {
                    var hints = snapshot.val() || [];
                    
                    // Cache for senere
                    if (!cache.solutions[cacheKey]) {
                        cache.solutions[cacheKey] = {};
                    }
                    cache.solutions[cacheKey].hints = hints;
                    
                    if (hintLevel < hints.length) {
                        resolve({
                            hint: hints[hintLevel],
                            level: hintLevel + 1,
                            total: hints.length,
                            hasMore: hintLevel + 1 < hints.length
                        });
                    } else {
                        resolve({
                            hint: null,
                            level: hintLevel,
                            total: hints.length,
                            hasMore: false
                        });
                    }
                })
                .catch(reject);
        });
    }
    
    /**
     * Hent FORKLARING for et spørsmål
     * Hentes on-demand etter bruker har svart
     */
    function getExplanation(module, questionId) {
        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            // Sjekk cache først
            var cacheKey = module + '_' + questionId;
            if (cache.solutions[cacheKey] && cache.solutions[cacheKey].explanation) {
                resolve(cache.solutions[cacheKey]);
                return;
            }
            
            // Hent fra Firebase
            var path = 'solutions/' + module + '/' + questionId;
            
            db.ref(path).once('value')
                .then(function(snapshot) {
                    var solution = snapshot.val() || {};
                    
                    // Cache
                    cache.solutions[cacheKey] = solution;
                    
                    resolve({
                        explanation: solution.explanation || '',
                        formula: solution.formula || '',
                        steps: solution.steps || null,
                        learning_objectives: solution.learning_objectives || []
                    });
                })
                .catch(reject);
        });
    }
    
    /**
     * Sjekk svar mot fasit
     * For ekstra sikkerhet kan dette gjøres via Cloud Function
     * Men for nå henter vi fasit og sjekker client-side
     */
    function checkAnswer(module, questionId, userAnswer) {
        return new Promise(function(resolve, reject) {
            if (!db) {
                reject(new Error('Database not initialized'));
                return;
            }
            
            var cacheKey = module + '_' + questionId;
            
            // Funksjon for å sjekke svar
            function doCheck(solution) {
                var result = {
                    correct: false,
                    correctAnswer: null,
                    tolerance: solution.tolerance || 0
                };
                
                var correctAnswer = solution.correct;
                
                // Multiple choice / true-false
                if (typeof correctAnswer === 'string') {
                    result.correct = (userAnswer === correctAnswer);
                    result.correctAnswer = correctAnswer;
                }
                // Numerisk svar
                else if (typeof correctAnswer === 'number') {
                    var tolerance = solution.tolerance || 1;
                    var userNum = parseFloat(userAnswer);
                    result.correct = Math.abs(userNum - correctAnswer) <= tolerance;
                    result.correctAnswer = correctAnswer;
                }
                // Objekt med flere felter
                else if (typeof correctAnswer === 'object') {
                    result.correct = true;
                    result.correctAnswer = correctAnswer;
                    
                    // Sjekk hvert felt
                    Object.keys(correctAnswer).forEach(function(key) {
                        if (key === 'tolerance') return;
                        
                        var expected = correctAnswer[key];
                        var actual = userAnswer[key];
                        var tolerance = solution.tolerance || 1;
                        
                        if (typeof expected === 'number') {
                            var actualNum = parseFloat(actual);
                            if (Math.abs(actualNum - expected) > tolerance) {
                                result.correct = false;
                            }
                        } else if (actual !== expected) {
                            result.correct = false;
                        }
                    });
                }
                
                return result;
            }
            
            // Sjekk cache først
            if (cache.solutions[cacheKey] && cache.solutions[cacheKey].correct !== undefined) {
                resolve(doCheck(cache.solutions[cacheKey]));
                return;
            }
            
            // Hent fra Firebase
            var path = 'solutions/' + module + '/' + questionId;
            
            db.ref(path).once('value')
                .then(function(snapshot) {
                    var solution = snapshot.val() || {};
                    
                    // Cache
                    cache.solutions[cacheKey] = solution;
                    
                    resolve(doCheck(solution));
                })
                .catch(reject);
        });
    }
    
    /**
     * Hent alle hints på en gang (for admin/testing)
     */
    function getAllHints(module, questionId) {
        return new Promise(function(resolve, reject) {
            var path = 'solutions/' + module + '/' + questionId + '/hints';
            
            db.ref(path).once('value')
                .then(function(snapshot) {
                    resolve(snapshot.val() || []);
                })
                .catch(reject);
        });
    }
    
    /**
     * Tøm cache (f.eks. ved bytte av tema)
     */
    function clearCache() {
        cache.solutions = {};
        console.log('[QuestionService] Cache cleared');
    }
    
    // Public API
    return {
        init: init,
        getQuestions: getQuestions,
        getHint: getHint,
        getExplanation: getExplanation,
        checkAnswer: checkAnswer,
        getAllHints: getAllHints,
        clearCache: clearCache
    };
    
})();

// Legacy compatibility
var QuestionService = QuestionServiceSecure;
