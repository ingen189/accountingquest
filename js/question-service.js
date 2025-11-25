/**
 * AccountingQuest - Question Service
 * 
 * Sentral tjeneste for å hente, lagre og administrere spørsmål fra Firebase.
 * Støtter caching, randomisering, og variabel-substitusjon.
 * 
 * BRUK:
 * <script src="firebase-config.js"></script>
 * <script src="question-service.js"></script>
 * 
 * // Hent spørsmål
 * QuestionService.getQuestion('cf_npv_001').then(q => console.log(q));
 * 
 * // Hent liste for modul
 * QuestionService.getQuestionsByModule('corporate_finance', 'npv', 'medium')
 *   .then(questions => console.log(questions));
 * 
 * // Hent randomisert versjon
 * QuestionService.getRandomizedQuestion('cf_npv_001')
 *   .then(q => console.log(q));
 */

var QuestionService = (function() {
    'use strict';
    
    // ==================== KONFIGURASJON ====================
    
    var CONFIG = {
        CACHE_DURATION: 5 * 60 * 1000,  // 5 minutter cache
        MAX_CACHE_SIZE: 500,             // Maks antall spørsmål i cache
        DB_PATH: 'questions',
        STATS_PATH: 'question_stats'
    };
    
    // ==================== INTERN STATE ====================
    
    var cache = {
        questions: {},      // id -> { data, timestamp }
        indexes: {},        // module/topic -> { ids, timestamp }
        metadata: null
    };
    
    var db = null;
    var initialized = false;
    var initPromise = null;
    
    // ==================== INITIALISERING ====================
    
    /**
     * Initialiser tjenesten
     */
    function init() {
        if (initPromise) return initPromise;
        
        initPromise = new Promise(function(resolve, reject) {
            if (typeof FirebaseConfig === 'undefined') {
                reject(new Error('FirebaseConfig ikke lastet'));
                return;
            }
            
            FirebaseConfig.init().then(function(firebase) {
                db = firebase.db;
                initialized = true;
                console.log('📚 QuestionService initialisert');
                resolve();
            }).catch(reject);
        });
        
        return initPromise;
    }
    
    /**
     * Sjekk at tjenesten er klar
     */
    function ensureInitialized() {
        if (!initialized) {
            return init();
        }
        return Promise.resolve();
    }
    
    // ==================== CACHE HÅNDTERING ====================
    
    /**
     * Sjekk om cache-entry er gyldig
     */
    function isCacheValid(entry) {
        if (!entry) return false;
        return (Date.now() - entry.timestamp) < CONFIG.CACHE_DURATION;
    }
    
    /**
     * Legg til i cache
     */
    function addToCache(key, data) {
        // Rydd cache hvis for stor
        var keys = Object.keys(cache.questions);
        if (keys.length >= CONFIG.MAX_CACHE_SIZE) {
            // Fjern eldste 20%
            var sorted = keys.sort(function(a, b) {
                return cache.questions[a].timestamp - cache.questions[b].timestamp;
            });
            var toRemove = sorted.slice(0, Math.floor(CONFIG.MAX_CACHE_SIZE * 0.2));
            toRemove.forEach(function(k) {
                delete cache.questions[k];
            });
        }
        
        cache.questions[key] = {
            data: data,
            timestamp: Date.now()
        };
    }
    
    /**
     * Hent fra cache
     */
    function getFromCache(key) {
        var entry = cache.questions[key];
        if (isCacheValid(entry)) {
            return entry.data;
        }
        return null;
    }
    
    /**
     * Tøm cache
     */
    function clearCache() {
        cache.questions = {};
        cache.indexes = {};
        cache.metadata = null;
    }
    
    // ==================== HENT SPØRSMÅL ====================
    
    /**
     * Hent ett spørsmål etter ID
     * @param {string} questionId - Spørsmålets ID
     * @returns {Promise<Object>} Spørsmålsobjekt
     */
    function getQuestion(questionId) {
        return ensureInitialized().then(function() {
            // Sjekk cache først
            var cached = getFromCache(questionId);
            if (cached) {
                return Promise.resolve(JSON.parse(JSON.stringify(cached)));
            }
            
            // Hent fra Firebase
            // ID format: module_topic_number (f.eks. cf_npv_001)
            var parts = questionId.split('_');
            var module = getModuleFromPrefix(parts[0]);
            var topic = parts[1];
            var difficulty = getDifficultyFromId(questionId);
            
            var path = CONFIG.DB_PATH + '/' + module + '/' + topic + '/' + difficulty + '/' + questionId;
            
            return db.ref(path).once('value').then(function(snapshot) {
                var data = snapshot.val();
                if (!data) {
                    // Prøv alternativ path (flat struktur)
                    return db.ref(CONFIG.DB_PATH + '/' + module + '/' + questionId).once('value');
                }
                return { val: function() { return data; } };
            }).then(function(snapshot) {
                var data = snapshot.val ? snapshot.val() : snapshot;
                if (!data) {
                    throw new Error('Spørsmål ikke funnet: ' + questionId);
                }
                addToCache(questionId, data);
                return JSON.parse(JSON.stringify(data));
            });
        });
    }
    
    /**
     * Hent flere spørsmål etter ID-liste
     * @param {string[]} questionIds - Liste med spørsmål-IDer
     * @returns {Promise<Object[]>} Liste med spørsmål
     */
    function getQuestions(questionIds) {
        var promises = questionIds.map(function(id) {
            return getQuestion(id).catch(function(err) {
                console.warn('Kunne ikke hente spørsmål ' + id + ':', err);
                return null;
            });
        });
        
        return Promise.all(promises).then(function(results) {
            return results.filter(function(q) { return q !== null; });
        });
    }
    
    /**
     * Hent spørsmål for en modul
     * @param {string} module - Modulnavn (f.eks. 'corporate_finance')
     * @param {string} [topic] - Valgfritt emne (f.eks. 'npv')
     * @param {string} [difficulty] - Valgfritt vanskelighetsgrad
     * @returns {Promise<Object[]>} Liste med spørsmål
     */
    function getQuestionsByModule(module, topic, difficulty) {
        return ensureInitialized().then(function() {
            var cacheKey = 'idx_' + module + '_' + (topic || 'all') + '_' + (difficulty || 'all');
            
            // Sjekk index-cache
            var cachedIndex = cache.indexes[cacheKey];
            if (isCacheValid(cachedIndex)) {
                return getQuestions(cachedIndex.data);
            }
            
            // Bygg path
            var path = CONFIG.DB_PATH + '/' + module;
            if (topic) path += '/' + topic;
            if (difficulty) path += '/' + difficulty;
            
            return db.ref(path).once('value').then(function(snapshot) {
                var data = snapshot.val();
                if (!data) return [];
                
                var questions = [];
                
                // Rekursivt hent alle spørsmål
                function extractQuestions(obj, currentPath) {
                    if (!obj || typeof obj !== 'object') return;
                    
                    // Sjekk om dette er et spørsmål (har 'id' og 'type')
                    if (obj.id && obj.type) {
                        questions.push(obj);
                        addToCache(obj.id, obj);
                        return;
                    }
                    
                    // Ellers, rekursivt gå gjennom
                    Object.keys(obj).forEach(function(key) {
                        if (key.startsWith('_')) return; // Skip metadata
                        extractQuestions(obj[key], currentPath + '/' + key);
                    });
                }
                
                extractQuestions(data, path);
                
                // Cache index
                var ids = questions.map(function(q) { return q.id; });
                cache.indexes[cacheKey] = {
                    data: ids,
                    timestamp: Date.now()
                };
                
                return questions;
            });
        });
    }
    
    /**
     * Hent tilfeldige spørsmål
     * @param {Object} options - Alternativer
     * @param {string} options.module - Modul
     * @param {string} [options.topic] - Emne
     * @param {string} [options.difficulty] - Vanskelighetsgrad
     * @param {number} [options.count=10] - Antall spørsmål
     * @param {string[]} [options.exclude] - IDer å ekskludere
     * @returns {Promise<Object[]>} Tilfeldige spørsmål
     */
    function getRandomQuestions(options) {
        return getQuestionsByModule(options.module, options.topic, options.difficulty)
            .then(function(questions) {
                // Filtrer ut ekskluderte
                if (options.exclude && options.exclude.length > 0) {
                    questions = questions.filter(function(q) {
                        return options.exclude.indexOf(q.id) === -1;
                    });
                }
                
                // Bland
                shuffleArray(questions);
                
                // Begrens antall
                var count = options.count || 10;
                return questions.slice(0, count);
            });
    }
    
    // ==================== VARIABEL SUBSTITUSJON ====================
    
    /**
     * Generer randomiserte verdier for et spørsmål
     * @param {Object} question - Spørsmålet
     * @returns {Object} Genererte verdier
     */
    function generateVariables(question) {
        if (!question.variables) return {};
        
        var values = {};
        
        Object.keys(question.variables).forEach(function(key) {
            var spec = question.variables[key];
            
            if (spec.values && Array.isArray(spec.values)) {
                // Velg fra liste
                values[key] = spec.values[Math.floor(Math.random() * spec.values.length)];
            } else if (spec.min !== undefined && spec.max !== undefined) {
                // Generer i range
                var step = spec.step || 1;
                var steps = Math.floor((spec.max - spec.min) / step);
                var randomStep = Math.floor(Math.random() * (steps + 1));
                values[key] = spec.min + (randomStep * step);
            } else if (spec.formula) {
                // Beregn fra formel (evalueres senere)
                values[key] = spec.formula;
            }
        });
        
        // Evaluer formler som avhenger av andre verdier
        Object.keys(values).forEach(function(key) {
            if (typeof values[key] === 'string' && values[key].startsWith('=')) {
                values[key] = evaluateFormula(values[key].substring(1), values);
            }
        });
        
        return values;
    }
    
    /**
     * Substituer variabler i tekst
     * @param {string} text - Tekst med {variabel} plassholdere
     * @param {Object} variables - Variabelverdier
     * @returns {string} Tekst med substituerte verdier
     */
    function substituteVariables(text, variables) {
        if (!text || typeof text !== 'string') return text;
        
        return text.replace(/\{([^}]+)\}/g, function(match, expr) {
            // Enkel variabel
            if (variables.hasOwnProperty(expr)) {
                var val = variables[expr];
                // Formater tall pent
                if (typeof val === 'number') {
                    return formatNumber(val);
                }
                return val;
            }
            
            // Uttrykk (f.eks. {amount*1.25})
            try {
                var result = evaluateFormula(expr, variables);
                if (typeof result === 'number') {
                    return formatNumber(result);
                }
                return result;
            } catch (e) {
                return match; // Behold original hvis feil
            }
        });
    }
    
    /**
     * Evaluer matematisk formel med variabler
     */
    function evaluateFormula(formula, variables) {
        // Erstatt variabelnavn med verdier
        var expr = formula;
        Object.keys(variables).forEach(function(key) {
            var regex = new RegExp('\\b' + key + '\\b', 'g');
            expr = expr.replace(regex, variables[key]);
        });
        
        // Sikker evaluering (kun matematikk)
        try {
            // Fjern alt unntatt tall og operatorer
            if (!/^[\d\s\+\-\*\/\(\)\.\,]+$/.test(expr)) {
                throw new Error('Ugyldig uttrykk');
            }
            return eval(expr);
        } catch (e) {
            console.warn('Kunne ikke evaluere formel:', formula, e);
            return 0;
        }
    }
    
    /**
     * Hent randomisert versjon av spørsmål
     * @param {string} questionId - Spørsmåls-ID
     * @returns {Promise<Object>} Randomisert spørsmål med generatedValues
     */
    function getRandomizedQuestion(questionId) {
        return getQuestion(questionId).then(function(question) {
            return randomizeQuestion(question);
        });
    }
    
    /**
     * Randomiser et spørsmål
     * @param {Object} question - Spørsmålet
     * @returns {Object} Randomisert kopi
     */
    function randomizeQuestion(question) {
        var q = JSON.parse(JSON.stringify(question));
        
        // Generer variabler
        var vars = generateVariables(q);
        q.generatedValues = vars;
        
        // Substituer i tekster
        q.description = substituteVariables(q.description, vars);
        q.scenario = substituteVariables(q.scenario, vars);
        q.question = substituteVariables(q.question, vars);
        
        // Substituer i hints
        if (q.hints) {
            q.hints = q.hints.map(function(hint) {
                if (typeof hint === 'string') {
                    return substituteVariables(hint, vars);
                }
                return {
                    level: hint.level,
                    text: substituteVariables(hint.text, vars)
                };
            });
        }
        
        // Substituer i løsning
        q.solution = substituteInSolution(q.solution, vars);
        
        // Substituer i data
        if (q.data) {
            q.data = substituteInObject(q.data, vars);
        }
        
        return q;
    }
    
    /**
     * Substituer variabler i løsningsobjekt
     */
    function substituteInSolution(solution, vars) {
        if (!solution) return solution;
        
        if (Array.isArray(solution)) {
            return solution.map(function(item) {
                return substituteInSolution(item, vars);
            });
        }
        
        if (typeof solution === 'object') {
            var result = {};
            Object.keys(solution).forEach(function(key) {
                var val = solution[key];
                if (typeof val === 'string') {
                    // Sjekk om det er en formel
                    if (val.startsWith('{') || /^[\d\s\+\-\*\/\(\)\.]+$/.test(val)) {
                        var evaluated = evaluateFormula(
                            val.replace(/[{}]/g, ''), 
                            vars
                        );
                        result[key] = evaluated;
                    } else {
                        result[key] = substituteVariables(val, vars);
                    }
                } else if (typeof val === 'object') {
                    result[key] = substituteInSolution(val, vars);
                } else {
                    result[key] = val;
                }
            });
            return result;
        }
        
        return solution;
    }
    
    /**
     * Substituer variabler i et objekt rekursivt
     */
    function substituteInObject(obj, vars) {
        if (!obj) return obj;
        
        if (Array.isArray(obj)) {
            return obj.map(function(item) {
                return substituteInObject(item, vars);
            });
        }
        
        if (typeof obj === 'object') {
            var result = {};
            Object.keys(obj).forEach(function(key) {
                result[key] = substituteInObject(obj[key], vars);
            });
            return result;
        }
        
        if (typeof obj === 'string') {
            // Prøv å evaluere som formel hvis det ser numerisk ut
            var substituted = substituteVariables(obj, vars);
            if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(substituted)) {
                try {
                    return eval(substituted);
                } catch (e) {
                    return substituted;
                }
            }
            return substituted;
        }
        
        return obj;
    }
    
    // ==================== STATISTIKK ====================
    
    /**
     * Registrer forsøk på spørsmål
     * @param {string} questionId - Spørsmåls-ID
     * @param {Object} result - Resultat
     * @param {boolean} result.correct - Om svaret var riktig
     * @param {number} result.timeSeconds - Tid brukt
     * @param {number} result.hintsUsed - Antall hints brukt
     */
    function recordAttempt(questionId, result) {
        return ensureInitialized().then(function() {
            var statsRef = db.ref(CONFIG.STATS_PATH + '/' + questionId);
            
            return statsRef.transaction(function(stats) {
                if (!stats) {
                    stats = {
                        question_id: questionId,
                        total_attempts: 0,
                        correct_attempts: 0,
                        total_time_seconds: 0,
                        total_hints_used: 0
                    };
                }
                
                stats.total_attempts++;
                if (result.correct) {
                    stats.correct_attempts++;
                }
                if (result.timeSeconds) {
                    stats.total_time_seconds += result.timeSeconds;
                }
                if (result.hintsUsed) {
                    stats.total_hints_used += result.hintsUsed;
                }
                
                // Beregn avledede verdier
                stats.success_rate = stats.correct_attempts / stats.total_attempts;
                stats.avg_time_seconds = stats.total_time_seconds / stats.total_attempts;
                stats.avg_hints_used = stats.total_hints_used / stats.total_attempts;
                stats.last_updated = new Date().toISOString();
                
                return stats;
            });
        });
    }
    
    /**
     * Hent statistikk for spørsmål
     * @param {string} questionId - Spørsmåls-ID
     * @returns {Promise<Object>} Statistikk
     */
    function getQuestionStats(questionId) {
        return ensureInitialized().then(function() {
            return db.ref(CONFIG.STATS_PATH + '/' + questionId).once('value');
        }).then(function(snapshot) {
            return snapshot.val() || {
                total_attempts: 0,
                correct_attempts: 0,
                success_rate: 0
            };
        });
    }
    
    // ==================== ADMIN FUNKSJONER ====================
    
    /**
     * Lagre nytt spørsmål (krever admin)
     * @param {Object} question - Spørsmålsobjekt
     * @returns {Promise<string>} Spørsmåls-ID
     */
    function saveQuestion(question) {
        return ensureInitialized().then(function() {
            // Valider påkrevde felt
            if (!question.id || !question.module || !question.type) {
                throw new Error('Mangler påkrevde felt: id, module, type');
            }
            
            // Sett metadata
            question.updated_at = new Date().toISOString();
            if (!question.created_at) {
                question.created_at = question.updated_at;
            }
            question.version = (question.version || 0) + 1;
            
            // Bestem path
            var path = CONFIG.DB_PATH + '/' + question.module;
            if (question.topic) path += '/' + question.topic;
            if (question.difficulty) path += '/' + question.difficulty;
            path += '/' + question.id;
            
            return db.ref(path).set(question).then(function() {
                // Oppdater cache
                addToCache(question.id, question);
                // Invalider index-cache
                cache.indexes = {};
                
                return question.id;
            });
        });
    }
    
    /**
     * Slett spørsmål (krever admin)
     * @param {string} questionId - Spørsmåls-ID
     */
    function deleteQuestion(questionId) {
        return getQuestion(questionId).then(function(question) {
            var path = CONFIG.DB_PATH + '/' + question.module;
            if (question.topic) path += '/' + question.topic;
            if (question.difficulty) path += '/' + question.difficulty;
            path += '/' + questionId;
            
            return db.ref(path).remove();
        }).then(function() {
            // Fjern fra cache
            delete cache.questions[questionId];
            cache.indexes = {};
        });
    }
    
    /**
     * Bulk-import spørsmål
     * @param {Object[]} questions - Liste med spørsmål
     * @returns {Promise<Object>} Resultat med antall suksess/feil
     */
    function bulkImport(questions) {
        var results = {
            success: 0,
            failed: 0,
            errors: []
        };
        
        var promises = questions.map(function(q) {
            return saveQuestion(q).then(function() {
                results.success++;
            }).catch(function(err) {
                results.failed++;
                results.errors.push({ id: q.id, error: err.message });
            });
        });
        
        return Promise.all(promises).then(function() {
            return results;
        });
    }
    
    // ==================== HJELPEFUNKSJONER ====================
    
    /**
     * Få modulnavn fra ID-prefiks
     */
    function getModuleFromPrefix(prefix) {
        var map = {
            'cf': 'corporate_finance',
            'bok': 'bokforing',
            'quiz': 'quiz',
            'ra': 'regnskapsanalyse',
            'case': 'case_studies',
            'hj': 'hjernetrim'
        };
        return map[prefix] || prefix;
    }
    
    /**
     * Hent vanskelighetsgrad fra ID
     */
    function getDifficultyFromId(questionId) {
        // Prøv å finne difficulty i ID (f.eks. cf_npv_easy_001)
        var parts = questionId.split('_');
        var difficulties = ['tutorial', 'easy', 'medium', 'hard', 'challenge'];
        for (var i = 0; i < parts.length; i++) {
            if (difficulties.indexOf(parts[i]) !== -1) {
                return parts[i];
            }
        }
        return 'medium'; // Default
    }
    
    /**
     * Bland array (Fisher-Yates)
     */
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    
    /**
     * Formater tall med tusenskilletegn
     */
    function formatNumber(num) {
        if (typeof num !== 'number') return num;
        
        // Rund til 2 desimaler hvis nødvendig
        if (num % 1 !== 0) {
            num = Math.round(num * 100) / 100;
        }
        
        // Formater med mellomrom som tusenskilletegn (norsk)
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    /**
     * Hent metadata om alle moduler
     */
    function getMetadata() {
        return ensureInitialized().then(function() {
            if (cache.metadata && isCacheValid(cache.metadata)) {
                return cache.metadata.data;
            }
            
            return db.ref(CONFIG.DB_PATH + '/_metadata').once('value')
                .then(function(snapshot) {
                    var data = snapshot.val() || {};
                    cache.metadata = {
                        data: data,
                        timestamp: Date.now()
                    };
                    return data;
                });
        });
    }
    
    // ==================== PUBLIC API ====================
    
    return {
        // Initialisering
        init: init,
        clearCache: clearCache,
        
        // Hent spørsmål
        getQuestion: getQuestion,
        getQuestions: getQuestions,
        getQuestionsByModule: getQuestionsByModule,
        getRandomQuestions: getRandomQuestions,
        getRandomizedQuestion: getRandomizedQuestion,
        randomizeQuestion: randomizeQuestion,
        
        // Metadata
        getMetadata: getMetadata,
        
        // Statistikk
        recordAttempt: recordAttempt,
        getQuestionStats: getQuestionStats,
        
        // Admin
        saveQuestion: saveQuestion,
        deleteQuestion: deleteQuestion,
        bulkImport: bulkImport,
        
        // Hjelpefunksjoner (eksponert for testing)
        generateVariables: generateVariables,
        substituteVariables: substituteVariables,
        formatNumber: formatNumber
    };
})();

// Eksporter for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionService;
}
