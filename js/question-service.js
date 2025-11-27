/**
 * AccountingQuest - Question Service (Sikker versjon)
 * 
 * OPPDATERT: Lagt til getQuestionsByModule() wrapper for corporate_finance.html
 * 
 * ARKITEKTUR:
 * - questions/ - Spørsmål UTEN svar (åpen lesing)
 * - solutions/ - Fasit og forklaringer (IKKE tilgjengelig for klient)
 * - submissions/ - Brukerens svar (write-trigger for validering)
 * - validated_answers/ - Resultater med hint/forklaring (kun etter svar)
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
    
    /**
     * Sanitize spørsmål - fjern løsningsdata
     */
    function sanitizeQuestion(id, data, category) {
        return {
            id: id,
            category: category || data.category,
            topic: data.topic || category,
            difficulty: data.difficulty,
            type: data.type || 'mc',
            title: data.title || '',
            q: data.q || data.question || '',
            question: data.question || data.q || '',
            options: data.options || null,
            data: data.data || null,
            scenarioData: data.scenarioData || null,
            linkedTo: data.linkedTo || null,
            tags: data.tags || [],
            source: data.source || '',
            wiki: data.wiki || data.w || []
        };
    }
    
    /**
     * Formater kategorinavn
     */
    function formatCategoryName(key) {
        var names = {
            'mva': 'MVA',
            'regnskap': 'Regnskap',
            'skatt': 'Skatt',
            'bokforing': 'Bokføring',
            'revision': 'Revisjon',
            'npv': 'NPV & IRR',
            'bonds': 'Obligasjoner',
            'stocks': 'Aksjer & Utbytte',
            'wacc': 'WACC',
            'portfolio': 'Portefølje',
            'annuity': 'Annuiteter',
            'forex': 'Valuta',
            'options': 'Opsjoner',
            'leverage': 'Gearing',
            'capm': 'CAPM',
            'macro': 'Makro'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }
    
    // =========================================
    // QUIZ SPØRSMÅL
    // =========================================
    
    function getQuizQuestions(category) {
        var cacheKey = 'quiz_' + category;
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        var path = category ? 'quizQuestions' : 'quizQuestions';
        
        return getDb().ref(path).orderByChild('category').equalTo(category).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var questions = [];
                snapshot.forEach(function(child) {
                    questions.push(sanitizeQuestion(child.key, child.val(), category));
                });
                
                questionCache[cacheKey] = questions;
                return questions;
            });
    }
    
    function getQuizCategories() {
        if (categoryCache.quiz) {
            return Promise.resolve(categoryCache.quiz);
        }
        
        return getDb().ref('quizQuestions').once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var categories = {};
                snapshot.forEach(function(child) {
                    var cat = child.val().category;
                    if (cat && !categories[cat]) {
                        categories[cat] = {
                            id: cat,
                            name: formatCategoryName(cat)
                        };
                    }
                });
                
                var result = Object.values(categories);
                categoryCache.quiz = result;
                return result;
            });
    }
    
    function submitQuizAnswer(questionId, answer, category) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Ikke innlogget'));
        }
        
        var path = 'quiz_submissions/' + userId + '/' + category + '/' + questionId;
        
        return getDb().ref(path).set({
            answer: answer,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            var resultPath = 'quiz_results/' + userId + '/' + category + '/' + questionId;
            return getDb().ref(resultPath).once('value');
        }).then(function(snap) {
            return snap.val() || { pending: true };
        });
    }
    
    // =========================================
    // BOKFØRING
    // =========================================
    
    function getBokforingTasks(difficulty) {
        var cacheKey = 'bokforing_' + difficulty;
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        var path = 'bokforingTasks/' + difficulty;
        
        return getDb().ref(path).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return [];
                }
                
                var tasks = [];
                snapshot.forEach(function(child) {
                    var task = child.val();
                    task.id = child.key;
                    tasks.push(task);
                });
                
                questionCache[cacheKey] = tasks;
                return tasks;
            });
    }
    
    function submitBokforingAnswer(taskId, answer, difficulty) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Ikke innlogget'));
        }
        
        var path = 'bokforing_submissions/' + userId + '/' + difficulty + '/' + taskId;
        
        return getDb().ref(path).set({
            answer: answer,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            var resultPath = 'bokforing_results/' + userId + '/' + difficulty + '/' + taskId;
            return getDb().ref(resultPath).once('value');
        }).then(function(snap) {
            return snap.val() || { pending: true };
        });
    }
    
    // =========================================
    // CORPORATE FINANCE
    // =========================================
    
    /**
     * Hent Corporate Finance spørsmål
     * Firebase-sti: questions/corporate_finance/{topic}/{difficulty}/{id}
     */
    function getCorpFinQuestions(topic, difficulty) {
        var cacheKey = 'corpfin_' + (topic || 'all') + '_' + (difficulty || 'all');
        if (questionCache[cacheKey]) {
            return Promise.resolve(questionCache[cacheKey]);
        }
        
        var path;
        if (topic && difficulty) {
            path = 'questions/corporate_finance/' + topic + '/' + difficulty;
        } else if (topic) {
            path = 'questions/corporate_finance/' + topic;
        } else {
            path = 'questions/corporate_finance';
        }
        
        console.log('[QuestionService] Loading CF questions from:', path);
        
        return getDb().ref(path).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    console.log('[QuestionService] No questions found at:', path);
                    return [];
                }
                
                var questions = [];
                
                if (topic && difficulty) {
                    // Direkte liste: questions/corporate_finance/npv/medium/{id}
                    snapshot.forEach(function(child) {
                        var q = sanitizeQuestion(child.key, child.val(), topic);
                        q.difficulty = difficulty;
                        questions.push(q);
                    });
                } else if (topic) {
                    // Har difficulty-nivåer: questions/corporate_finance/npv/{difficulty}/{id}
                    snapshot.forEach(function(diffSnap) {
                        diffSnap.forEach(function(child) {
                            var q = sanitizeQuestion(child.key, child.val(), topic);
                            q.difficulty = diffSnap.key;
                            questions.push(q);
                        });
                    });
                } else {
                    // Hent alle: questions/corporate_finance/{topic}/{difficulty}/{id}
                    snapshot.forEach(function(topicSnap) {
                        topicSnap.forEach(function(diffSnap) {
                            diffSnap.forEach(function(child) {
                                var q = sanitizeQuestion(child.key, child.val(), topicSnap.key);
                                q.difficulty = diffSnap.key;
                                q.topic = topicSnap.key;
                                questions.push(q);
                            });
                        });
                    });
                }
                
                console.log('[QuestionService] Loaded', questions.length, 'CF questions');
                questionCache[cacheKey] = questions;
                return questions;
            })
            .catch(function(err) {
                console.error('[QuestionService] Error loading CF questions:', err);
                return [];
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
    
    function submitCorpFinAnswer(questionId, answer, topic, difficulty) {
        var userId = getUserId();
        if (!userId) {
            return Promise.reject(new Error('Ikke innlogget'));
        }
        
        var path = 'corpfin_submissions/' + userId + '/' + topic + '/' + questionId;
        
        return getDb().ref(path).set({
            answer: answer,
            difficulty: difficulty,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }).then(function() {
            var resultPath = 'corpfin_results/' + userId + '/' + topic + '/' + questionId;
            return getDb().ref(resultPath).once('value');
        }).then(function(snap) {
            return snap.val() || { pending: true };
        });
    }
    
    // =========================================
    // WRAPPER: getQuestionsByModule
    // Brukes av corporate_finance.html
    // =========================================
    
    /**
     * Universell wrapper for å hente spørsmål etter modul
     * @param {string} module - 'corporate_finance', 'quiz', 'bokforing'
     * @param {string} topic - Emne/kategori (kan være null for alle)
     * @param {string} difficulty - Vanskelighetsgrad (kan være null for alle)
     */
    function getQuestionsByModule(module, topic, difficulty) {
        console.log('[QuestionService] getQuestionsByModule:', module, topic, difficulty);
        
        if (module === 'corporate_finance') {
            return getCorpFinQuestions(topic, difficulty);
        } else if (module === 'quiz') {
            return getQuizQuestions(topic);
        } else if (module === 'bokforing') {
            return getBokforingTasks(difficulty);
        }
        
        console.warn('[QuestionService] Unknown module:', module);
        return Promise.resolve([]);
    }
    
    // =========================================
    // UTILITIES
    // =========================================
    
    function clearCache() {
        questionCache = {};
        categoryCache = {};
        console.log('[QuestionService] Cache cleared');
    }
    
    /**
     * Sjekk svar mot solutions/ i Firebase
     */
    function checkAnswer(module, questionId, userAnswer) {
        var solutionPath = 'solutions/' + module + '/' + questionId;
        
        return getDb().ref(solutionPath).once('value')
            .then(function(snapshot) {
                if (!snapshot.exists()) {
                    return { error: 'Løsning ikke funnet', correct: false };
                }
                
                var solution = snapshot.val();
                var correctAnswer = solution.correct || solution.answer || solution.a;
                var tolerance = solution.tolerance || 0;
                var result = { correct: false, correctAnswer: correctAnswer };
                
                // String/multiple choice
                if (typeof correctAnswer === 'string') {
                    result.correct = (String(userAnswer).toLowerCase() === correctAnswer.toLowerCase());
                }
                // Number
                else if (typeof correctAnswer === 'number') {
                    var userNum = parseFloat(userAnswer);
                    result.correct = !isNaN(userNum) && Math.abs(userNum - correctAnswer) <= tolerance;
                }
                // Boolean
                else if (typeof correctAnswer === 'boolean') {
                    result.correct = (userAnswer === correctAnswer || 
                                      String(userAnswer).toLowerCase() === String(correctAnswer));
                }
                // Object (multi-field)
                else if (typeof correctAnswer === 'object' && correctAnswer !== null) {
                    result.correct = true;
                    Object.keys(correctAnswer).forEach(function(key) {
                        var expected = correctAnswer[key];
                        var actual = userAnswer ? userAnswer[key] : null;
                        
                        if (typeof expected === 'number') {
                            var actualNum = parseFloat(actual);
                            if (isNaN(actualNum) || Math.abs(actualNum - expected) > tolerance) {
                                result.correct = false;
                            }
                        } else if (String(actual) !== String(expected)) {
                            result.correct = false;
                        }
                    });
                }
                
                return result;
            })
            .catch(function(err) {
                console.error('[QuestionService] checkAnswer error:', err);
                return { error: err.message, correct: false };
            });
    }
    
    /**
     * Hent hint
     */
    function getHint(module, questionId, hintLevel) {
        var path = 'solutions/' + module + '/' + questionId + '/hints';
        
        return getDb().ref(path).once('value')
            .then(function(snapshot) {
                var hints = snapshot.val() || [];
                var level = hintLevel || 0;
                
                return {
                    hint: hints[level] || null,
                    level: level + 1,
                    total: hints.length,
                    hasMore: level + 1 < hints.length
                };
            });
    }
    
    /**
     * Hent forklaring
     */
    function getExplanation(module, questionId) {
        var path = 'solutions/' + module + '/' + questionId;
        
        return getDb().ref(path).once('value')
            .then(function(snapshot) {
                var solution = snapshot.val() || {};
                return {
                    explanation: solution.explanation || solution.exp || '',
                    formula: solution.formula || '',
                    steps: solution.steps || [],
                    learning_objectives: solution.learning_objectives || []
                };
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
        
        // NYTT: Universal modul-wrapper (brukes av corporate_finance.html)
        getQuestionsByModule: getQuestionsByModule,
        
        // Utilities
        getHint: getHint,
        getExplanation: getExplanation,
        clearCache: clearCache,
        checkAnswer: checkAnswer,
        formatCategoryName: formatCategoryName
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionService;
}
