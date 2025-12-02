/**
 * AccountingQuest - Advanced Question Builder
 * Kraftig verktøy for å lage komplekse oppgavesett
 * 
 * Features:
 * - Randomisering av tall med variabler
 * - Flere moduler (Bokføring, Corporate Finance, Hjernetrim, Matte, Revisor)
 * - Komplekse oppgaver med flere ark/dokumenter
 * - Deloppgaver (a, b, c, d)
 * - Progressive hints
 * - Forklaringer med steg-for-steg
 * 
 * @version 2.0.0
 */

var QuestionBuilder = (function() {
    'use strict';
    
    // ============================================
    // CONFIGURATION
    // ============================================
    
    var CONFIG = {
        API_URL: 'https://api.accountingquest.app',
        STORAGE_KEY: 'aq_question_builder_state',
        MAX_HINTS: 5,
        MAX_SUBQUESTIONS: 10,
        MAX_DOCUMENTS: 5,
        MAX_GRID_ROWS: 20,
        MAX_INFO_TABLES: 5,
        MAX_INPUT_FIELDS: 10
    };
    
    // ============================================
    // LATEX SYSTEM
    // ============================================
    
    var LaTeXSystem = {
        /**
         * Common formulas library
         */
        formulas: {
            // Finance
            npv: { name: 'NPV', latex: 'NPV = \\sum_{t=0}^{n} \\frac{CF_t}{(1+r)^t}', description: 'Netto nåverdi' },
            irr: { name: 'IRR', latex: 'NPV = \\sum_{t=0}^{n} \\frac{CF_t}{(1+IRR)^t} = 0', description: 'Internrente' },
            wacc: { name: 'WACC', latex: 'WACC = \\frac{E}{V} \\cdot R_e + \\frac{D}{V} \\cdot R_d \\cdot (1-T_c)', description: 'Vektet kapitalkostnad' },
            capm: { name: 'CAPM', latex: 'E(R_i) = R_f + \\beta_i (E(R_m) - R_f)', description: 'Kapitalprisingsmodellen' },
            pv: { name: 'PV', latex: 'PV = \\frac{FV}{(1+r)^n}', description: 'Nåverdi' },
            fv: { name: 'FV', latex: 'FV = PV \\cdot (1+r)^n', description: 'Fremtidig verdi' },
            annuity: { name: 'Annuitet', latex: 'PV = PMT \\cdot \\frac{1-(1+r)^{-n}}{r}', description: 'Nåverdi av annuitet' },
            perpetuity: { name: 'Evigvarende', latex: 'PV = \\frac{C}{r}', description: 'Nåverdi av evigvarende kontantstrøm' },
            gordon: { name: 'Gordon Growth', latex: 'P_0 = \\frac{D_1}{r-g}', description: 'Gordons vekstmodell' },
            ev_ebitda: { name: 'EV/EBITDA', latex: 'EV = \\text{Market Cap} + \\text{Debt} - \\text{Cash}', description: 'Enterprise Value' },
            
            // Accounting ratios
            current_ratio: { name: 'Likviditetsgrad 1', latex: 'LG1 = \\frac{\\text{Omløpsmidler}}{\\text{Kortsiktig gjeld}}', description: 'Current ratio' },
            quick_ratio: { name: 'Likviditetsgrad 2', latex: 'LG2 = \\frac{\\text{Omløpsmidler} - \\text{Varelager}}{\\text{Kortsiktig gjeld}}', description: 'Quick ratio' },
            debt_ratio: { name: 'Gjeldsgrad', latex: 'Gjeldsgrad = \\frac{\\text{Gjeld}}{\\text{Egenkapital}}', description: 'Debt to equity' },
            roe: { name: 'ROE', latex: 'ROE = \\frac{\\text{Resultat}}{\\text{Egenkapital}} \\cdot 100\\%', description: 'Egenkapitalrentabilitet' },
            roa: { name: 'ROA', latex: 'ROA = \\frac{\\text{Resultat}}{\\text{Totalkapital}} \\cdot 100\\%', description: 'Totalkapitalrentabilitet' },
            profit_margin: { name: 'Resultatgrad', latex: 'Resultatgrad = \\frac{\\text{Resultat}}{\\text{Omsetning}} \\cdot 100\\%', description: 'Profit margin' },
            
            // Math
            derivative_power: { name: 'Derivasjon potens', latex: '\\frac{d}{dx}x^n = nx^{n-1}', description: 'Potensregelen' },
            derivative_chain: { name: 'Kjerneregelen', latex: '\\frac{d}{dx}f(g(x)) = f\'(g(x)) \\cdot g\'(x)', description: 'Chain rule' },
            integral_power: { name: 'Integral potens', latex: '\\int x^n dx = \\frac{x^{n+1}}{n+1} + C', description: 'Potensregelen for integrasjon' },
            quadratic: { name: 'Andregradsformel', latex: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}', description: 'Løsning av ax² + bx + c = 0' },
            
            // Statistics
            mean: { name: 'Gjennomsnitt', latex: '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n}x_i', description: 'Aritmetisk gjennomsnitt' },
            variance: { name: 'Varians', latex: '\\sigma^2 = \\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\bar{x})^2', description: 'Varians' },
            std_dev: { name: 'Standardavvik', latex: '\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\bar{x})^2}', description: 'Standardavvik' },
            
            // Tax/MVA
            mva_inkl: { name: 'MVA inkl.', latex: 'Pris_{inkl} = Pris_{ekskl} \\cdot (1 + MVA\\%)', description: 'Pris inkludert MVA' },
            mva_ekskl: { name: 'MVA ekskl.', latex: 'Pris_{ekskl} = \\frac{Pris_{inkl}}{1 + MVA\\%}', description: 'Pris ekskludert MVA' },
            depreciation_linear: { name: 'Lineær avskr.', latex: 'Avskrivning = \\frac{Kostpris - Restverdi}{Levetid}', description: 'Lineær avskrivning' },
            depreciation_declining: { name: 'Saldoavskr.', latex: 'Avskrivning_t = Saldo_{t-1} \\cdot Sats\\%', description: 'Saldoavskrivning' }
        },
        
        /**
         * Insert LaTeX into text
         */
        insertFormula: function(formulaKey) {
            var formula = this.formulas[formulaKey];
            return formula ? '$' + formula.latex + '$' : '';
        },
        
        /**
         * Render LaTeX preview (requires KaTeX/MathJax)
         */
        renderPreview: function(text) {
            // Replace $...$ with rendered LaTeX
            return text.replace(/\$([^$]+)\$/g, function(match, latex) {
                return '<span class="latex-formula" data-latex="' + latex + '">' + latex + '</span>';
            });
        },
        
        /**
         * Get all formulas by category
         */
        getByCategory: function(category) {
            var categories = {
                finance: ['npv', 'irr', 'wacc', 'capm', 'pv', 'fv', 'annuity', 'perpetuity', 'gordon', 'ev_ebitda'],
                ratios: ['current_ratio', 'quick_ratio', 'debt_ratio', 'roe', 'roa', 'profit_margin'],
                math: ['derivative_power', 'derivative_chain', 'integral_power', 'quadratic'],
                statistics: ['mean', 'variance', 'std_dev'],
                tax: ['mva_inkl', 'mva_ekskl', 'depreciation_linear', 'depreciation_declining']
            };
            var keys = categories[category] || [];
            var self = this;
            return keys.map(function(k) { return { key: k, ...self.formulas[k] }; });
        }
    };
    
    // ============================================
    // GRAPH SYSTEM (Funksjonsgrafer)
    // ============================================
    
    var GraphSystem = {
        /**
         * Standard farger for grafer
         */
        colors: {
            primary: '#4ade80',      // Grønn - hovedfunksjon
            secondary: '#3b82f6',    // Blå - derivert
            tertiary: '#f59e0b',     // Oransje - integral
            danger: '#ef4444',       // Rød - kostnad
            purple: '#8b5cf6',       // Lilla - alternativ
            grid: 'rgba(255,255,255,0.1)',
            axis: 'rgba(255,255,255,0.3)'
        },
        
        /**
         * Standard graf-innstillinger
         */
        defaultSettings: {
            xMin: -10,
            xMax: 10,
            yMin: -10,
            yMax: 10,
            step: 0.1,
            showGrid: true,
            showAxis: true,
            showDerivative: false,
            showZeros: false,
            showExtrema: false,
            showIntersection: false,
            showElasticity: false,
            interactive: true
        },
        
        /**
         * Lag graf-konfigurasjon for en spørsmål
         */
        createGraphConfig: function(functionExpr, label, settings) {
            return {
                function: functionExpr,
                functionLabel: label || 'f(x)',
                variableLabel: settings?.variableLabel || 'x',
                settings: Object.assign({}, this.defaultSettings, settings || {}),
                color: settings?.color || this.colors.primary
            };
        },
        
        /**
         * Lag multi-funksjon konfigurasjon
         */
        createMultiFunctionConfig: function(functions, settings) {
            var self = this;
            var colorKeys = ['primary', 'danger', 'secondary', 'tertiary', 'purple'];
            
            return {
                functions: functions.map(function(f, i) {
                    return {
                        expr: f.expr,
                        label: f.label || 'f' + (i + 1) + '(x)',
                        color: f.color || self.colors[colorKeys[i % colorKeys.length]],
                        dashed: f.dashed || false
                    };
                }),
                settings: Object.assign({}, this.defaultSettings, settings || {})
            };
        },
        
        /**
         * Vanlige funksjonstyper for økonomi
         */
        economicFunctions: {
            revenue: {
                name: 'Inntektsfunksjon',
                template: 'a*x^2 + b*x',
                description: 'I(x) = ax² + bx (typisk a < 0)',
                defaultVars: { a: -2, b: 100 }
            },
            cost: {
                name: 'Kostnadsfunksjon',
                template: 'a*x^3 - b*x^2 + c*x + d',
                description: 'K(x) = ax³ - bx² + cx + d',
                defaultVars: { a: 0.01, b: 2, c: 100, d: 5000 }
            },
            linear_cost: {
                name: 'Lineær kostnad',
                template: 'a + b*x',
                description: 'K(x) = a + bx (faste + variable)',
                defaultVars: { a: 5000, b: 50 }
            },
            demand: {
                name: 'Etterspørselsfunksjon',
                template: 'a - b*x',
                description: 'p(x) = a - bx eller x(p) = c - dp',
                defaultVars: { a: 100, b: 2 }
            },
            supply: {
                name: 'Tilbudsfunksjon',
                template: 'a + b*x',
                description: 'p(x) = a + bx',
                defaultVars: { a: 10, b: 1 }
            },
            profit: {
                name: 'Fortjenestefunksjon',
                template: '-a*x^2 + b*x - c',
                description: 'F(x) = I(x) - K(x)',
                defaultVars: { a: 2, b: 80, c: 200 }
            },
            marginal: {
                name: 'Grensefunksjon',
                template: '3*a*x^2 - 2*b*x + c',
                description: 'K\'(x), I\'(x), etc.',
                defaultVars: { a: 0.01, b: 2, c: 100 }
            }
        },
        
        /**
         * Generer standard analysepunkter
         */
        getAnalysisPoints: function(type) {
            var points = {
                zeros: { name: 'Nullpunkter', description: 'Hvor f(x) = 0' },
                extrema: { name: 'Ekstremalpunkter', description: 'Topp- og bunnpunkter' },
                inflection: { name: 'Vendepunkter', description: 'Hvor f\'\'(x) = 0' },
                intercepts: { name: 'Akseknisningspunkter', description: 'Hvor grafen krysser aksene' },
                derivative: { name: 'Derivert', description: 'f\'(x) - stigningstall' },
                integral: { name: 'Integral', description: 'Areal under kurven' },
                intersection: { name: 'Skjæringspunkt', description: 'Hvor to funksjoner møtes' },
                elasticity: { name: 'Elastisitet', description: 'Prosentvis endring' }
            };
            
            return type ? points[type] : points;
        },
        
        /**
         * Spørsmålstyper for graf-oppgaver
         */
        questionSubtypes: {
            analyze: {
                name: 'Full analyse',
                description: 'Finn nullpunkter, ekstremalpunkter, definisjonsmengde',
                requiredAnswers: ['zeros', 'extrema', 'domain']
            },
            derivative: {
                name: 'Derivasjon',
                description: 'Finn derivert og tolkning',
                requiredAnswers: ['derivative', 'derivativeValue']
            },
            extrema: {
                name: 'Ekstremalpunkter',
                description: 'Finn topp- og bunnpunkter',
                requiredAnswers: ['extremaX', 'extremaY', 'extremaType']
            },
            zeros: {
                name: 'Nullpunkter',
                description: 'Finn hvor funksjonen er null',
                requiredAnswers: ['zeros']
            },
            sketch: {
                name: 'Skisser graf',
                description: 'Tegn grafen basert på egenskaper',
                requiredAnswers: ['sketch']
            },
            intersection: {
                name: 'Skjæringspunkt',
                description: 'Finn hvor funksjoner krysser',
                requiredAnswers: ['intersectionX', 'intersectionY']
            }
        }
    };
    
    // ============================================
    // TIMER SYSTEM
    // ============================================
    
    var TimerSystem = {
        /**
         * Create timer config for question/set
         */
        createTimer: function(seconds, type) {
            return {
                enabled: true,
                duration: seconds || 60,
                type: type || 'countdown', // countdown, countup, hidden
                showWarning: true,
                warningAt: 10, // seconds remaining
                autoSubmit: false,
                penaltyPerSecond: 0 // deduct points per second over time
            };
        },
        
        /**
         * Suggested times by difficulty
         */
        suggestedTimes: {
            easy: { single: 30, set: 300 },
            medium: { single: 60, set: 600 },
            hard: { single: 120, set: 900 },
            exam: { single: 180, set: 1800 }
        },
        
        /**
         * Format seconds to mm:ss
         */
        formatTime: function(seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        }
    };
    
    // ============================================
    // POINTS/SCORING SYSTEM
    // ============================================
    
    var ScoringSystem = {
        /**
         * Create scoring config
         */
        createScoring: function(maxPoints) {
            return {
                maxPoints: maxPoints || 10,
                partialCredit: true,
                negativePoints: false,
                negativeAmount: 0,
                bonusTime: false,
                bonusPointsPerSecond: 0,
                showPointsToStudent: true,
                passingThreshold: 0.6 // 60% to pass
            };
        },
        
        /**
         * Calculate score based on answer
         */
        calculateScore: function(config, correctPercentage, timeTaken, timeLimit) {
            var baseScore = config.maxPoints * correctPercentage;
            
            // Apply time bonus if enabled
            if (config.bonusTime && timeTaken < timeLimit) {
                var timeBonus = (timeLimit - timeTaken) * config.bonusPointsPerSecond;
                baseScore += timeBonus;
            }
            
            // Apply negative points if wrong and enabled
            if (correctPercentage === 0 && config.negativePoints) {
                baseScore = -config.negativeAmount;
            }
            
            return Math.max(0, Math.round(baseScore * 10) / 10);
        },
        
        /**
         * Grading scale
         */
        grades: {
            A: { min: 0.9, label: 'Fremragende' },
            B: { min: 0.8, label: 'Meget godt' },
            C: { min: 0.6, label: 'Godt' },
            D: { min: 0.5, label: 'Nokså godt' },
            E: { min: 0.4, label: 'Tilstrekkelig' },
            F: { min: 0, label: 'Ikke bestått' }
        },
        
        getGrade: function(percentage) {
            for (var grade in this.grades) {
                if (percentage >= this.grades[grade].min) {
                    return { grade: grade, label: this.grades[grade].label };
                }
            }
            return { grade: 'F', label: 'Ikke bestått' };
        }
    };
    
    // ============================================
    // LAW REFERENCE SYSTEM (Norwegian)
    // ============================================
    
    var LawReferenceSystem = {
        /**
         * Norwegian accounting laws
         */
        laws: {
            RSKL: {
                name: 'Regnskapsloven',
                fullName: 'Lov om årsregnskap m.v.',
                shortCode: 'RSKL',
                year: 1998,
                url: 'https://lovdata.no/dokument/NL/lov/1998-07-17-56',
                sections: {
                    '§3-1': 'Årsregnskap og årsberetning',
                    '§3-2': 'Plikt til å utarbeide konsernregnskap',
                    '§3-2a': 'Unntak fra plikten til å utarbeide konsernregnskap',
                    '§4-1': 'Grunnleggende regnskapsprinsipper',
                    '§5-1': 'Vurdering av eiendeler og gjeld',
                    '§5-2': 'Anskaffelseskost',
                    '§5-3': 'Virkelig verdi',
                    '§5-4': 'Nedskrivning av anleggsmidler',
                    '§5-5': 'Varelager og oppdrag under utførelse',
                    '§6-1': 'Resultatregnskap',
                    '§6-2': 'Balanse',
                    '§7-1': 'Noter'
                }
            },
            BOKL: {
                name: 'Bokføringsloven',
                fullName: 'Lov om bokføring',
                shortCode: 'BOKL',
                year: 2004,
                url: 'https://lovdata.no/dokument/NL/lov/2004-11-19-73',
                sections: {
                    '§3': 'Bokføringspliktige',
                    '§4': 'Grunnleggende bokføringsprinsipper',
                    '§5': 'Regnskapssystem',
                    '§6': 'Bokføring og dokumentasjon',
                    '§7': 'Dokumentasjon av balansen',
                    '§8': 'Spesifikasjoner av pliktig regnskapsrapportering',
                    '§10': 'Oppbevaring',
                    '§13': 'Oppbevaringstid'
                }
            },
            SKTL: {
                name: 'Skatteloven',
                fullName: 'Lov om skatt av formue og inntekt',
                shortCode: 'SKTL',
                year: 1999,
                url: 'https://lovdata.no/dokument/NL/lov/1999-03-26-14',
                sections: {
                    '§5-1': 'Hovedregel om inntekt',
                    '§5-20': 'Fordel vunnet ved arbeid',
                    '§5-30': 'Fordel vunnet ved kapital',
                    '§6-1': 'Hovedregel om fradrag',
                    '§6-10': 'Minstefradrag',
                    '§6-40': 'Rentekostnader',
                    '§10-30': 'Gevinst og tap på aksjer mv.',
                    '§14-40': 'Tidfesting av inntekt',
                    '§14-41': 'Saldoavskrivning',
                    '§14-43': 'Avskrivningssatser'
                }
            },
            MVAL: {
                name: 'Merverdiavgiftsloven',
                fullName: 'Lov om merverdiavgift',
                shortCode: 'MVAL',
                year: 2009,
                url: 'https://lovdata.no/dokument/NL/lov/2009-06-19-58',
                sections: {
                    '§1-1': 'Saklig virkeområde',
                    '§2-1': 'Registreringsplikt',
                    '§3-1': 'Avgiftsplikten',
                    '§4-1': 'Hovedregel om beregningsgrunnlag',
                    '§5-1': 'Alminnelig sats (25%)',
                    '§5-2': 'Redusert sats (15%)',
                    '§5-3': 'Lav sats (12%)',
                    '§6-1': 'Fritak for eksport',
                    '§8-1': 'Fradragsrett',
                    '§8-3': 'Avskåret fradragsrett'
                }
            },
            ASAL: {
                name: 'Allmennaksjeloven',
                fullName: 'Lov om allmennaksjeselskaper',
                shortCode: 'ASAL',
                year: 1997,
                url: 'https://lovdata.no/dokument/NL/lov/1997-06-13-45',
                sections: {
                    '§3-1': 'Krav til aksjekapital',
                    '§8-1': 'Utbytte',
                    '§3-4': 'Krav til forsvarlig egenkapital',
                    '§3-5': 'Handleplikt ved tap av egenkapital'
                }
            },
            ASL: {
                name: 'Aksjeloven',
                fullName: 'Lov om aksjeselskaper',
                shortCode: 'ASL',
                year: 1997,
                url: 'https://lovdata.no/dokument/NL/lov/1997-06-13-44',
                sections: {
                    '§3-1': 'Krav til aksjekapital (30 000)',
                    '§3-4': 'Krav til forsvarlig egenkapital',
                    '§3-5': 'Handleplikt ved tap av egenkapital',
                    '§8-1': 'Hva kan deles ut som utbytte',
                    '§8-2': 'Beregning av utbytte'
                }
            }
        },
        
        /**
         * Format law reference
         */
        formatReference: function(lawCode, section) {
            var law = this.laws[lawCode];
            if (!law) return '';
            
            var sectionText = law.sections[section] || '';
            return law.shortCode + ' ' + section + (sectionText ? ': ' + sectionText : '');
        },
        
        /**
         * Get URL for law section
         */
        getUrl: function(lawCode, section) {
            var law = this.laws[lawCode];
            if (!law) return '';
            
            var sectionNum = section.replace('§', '').replace('-', '/');
            return law.url + '/' + sectionNum;
        },
        
        /**
         * Search for relevant sections
         */
        searchSections: function(query) {
            var results = [];
            var queryLower = query.toLowerCase();
            
            for (var lawCode in this.laws) {
                var law = this.laws[lawCode];
                for (var section in law.sections) {
                    var text = law.sections[section].toLowerCase();
                    if (text.includes(queryLower) || section.includes(query)) {
                        results.push({
                            law: lawCode,
                            lawName: law.name,
                            section: section,
                            text: law.sections[section],
                            formatted: this.formatReference(lawCode, section)
                        });
                    }
                }
            }
            
            return results;
        }
    };
    
    // ============================================
    // KONTOPLAN (NS 4102)
    // ============================================
    
    var KontoplanSystem = {
        /**
         * Norwegian Standard Chart of Accounts (NS 4102) - Main accounts
         */
        accounts: {
            // Klasse 1: Eiendeler
            '1000': { name: 'Forskning og utvikling', class: 1, type: 'asset' },
            '1020': { name: 'Konsesjoner', class: 1, type: 'asset' },
            '1030': { name: 'Patenter', class: 1, type: 'asset' },
            '1070': { name: 'Utsatt skattefordel', class: 1, type: 'asset' },
            '1080': { name: 'Goodwill', class: 1, type: 'asset' },
            '1100': { name: 'Bygninger', class: 1, type: 'asset' },
            '1120': { name: 'Bygningsmessige anlegg', class: 1, type: 'asset' },
            '1200': { name: 'Maskiner og anlegg', class: 1, type: 'asset' },
            '1220': { name: 'Transportmidler', class: 1, type: 'asset' },
            '1250': { name: 'Inventar', class: 1, type: 'asset' },
            '1280': { name: 'Kontormaskiner', class: 1, type: 'asset' },
            '1300': { name: 'Aksjer i datterselskap', class: 1, type: 'asset' },
            '1350': { name: 'Aksjer i tilknyttet selskap', class: 1, type: 'asset' },
            '1380': { name: 'Aksjer og andeler', class: 1, type: 'asset' },
            '1400': { name: 'Varelager', class: 1, type: 'asset' },
            '1440': { name: 'Varer under tilvirkning', class: 1, type: 'asset' },
            '1460': { name: 'Ferdigvarer', class: 1, type: 'asset' },
            '1500': { name: 'Kundefordringer', class: 1, type: 'asset' },
            '1530': { name: 'Opptjent, ikke fakturert', class: 1, type: 'asset' },
            '1570': { name: 'Andre fordringer', class: 1, type: 'asset' },
            '1580': { name: 'Avsetning tap på fordringer', class: 1, type: 'asset' },
            '1700': { name: 'Forskuddsbetalt kostnad', class: 1, type: 'asset' },
            '1750': { name: 'Påløpt inntekt', class: 1, type: 'asset' },
            '1800': { name: 'Aksjer og andeler (omløp)', class: 1, type: 'asset' },
            '1880': { name: 'Markedsbaserte verdipapirer', class: 1, type: 'asset' },
            '1900': { name: 'Kontanter', class: 1, type: 'asset' },
            '1920': { name: 'Bankinnskudd', class: 1, type: 'asset' },
            
            // Klasse 2: Egenkapital og gjeld
            '2000': { name: 'Aksjekapital', class: 2, type: 'equity' },
            '2020': { name: 'Egne aksjer', class: 2, type: 'equity' },
            '2040': { name: 'Overkursfond', class: 2, type: 'equity' },
            '2050': { name: 'Annen innskutt EK', class: 2, type: 'equity' },
            '2080': { name: 'Udekket tap', class: 2, type: 'equity' },
            '2090': { name: 'Annen egenkapital', class: 2, type: 'equity' },
            '2100': { name: 'Fond for vurderingsforskjeller', class: 2, type: 'equity' },
            '2120': { name: 'Annen fond', class: 2, type: 'equity' },
            '2200': { name: 'Pensjonsforpliktelser', class: 2, type: 'liability' },
            '2220': { name: 'Utsatt skatt', class: 2, type: 'liability' },
            '2250': { name: 'Andre avsetninger', class: 2, type: 'liability' },
            '2300': { name: 'Konvertible lån', class: 2, type: 'liability' },
            '2320': { name: 'Obligasjonslån', class: 2, type: 'liability' },
            '2350': { name: 'Gjeld til kredittinstitusjoner', class: 2, type: 'liability' },
            '2380': { name: 'Pantegjeld', class: 2, type: 'liability' },
            '2400': { name: 'Leverandørgjeld', class: 2, type: 'liability' },
            '2500': { name: 'Betalbar skatt', class: 2, type: 'liability' },
            '2600': { name: 'Skattetrekk', class: 2, type: 'liability' },
            '2700': { name: 'Utgående merverdiavgift', class: 2, type: 'liability' },
            '2710': { name: 'Inngående merverdiavgift', class: 2, type: 'liability' },
            '2740': { name: 'Oppgjørskonto merverdiavgift', class: 2, type: 'liability' },
            '2770': { name: 'Skyldig arbeidsgiveravgift', class: 2, type: 'liability' },
            '2780': { name: 'Påløpt arbeidsgiveravgift', class: 2, type: 'liability' },
            '2800': { name: 'Utbytte', class: 2, type: 'liability' },
            '2900': { name: 'Annen kortsiktig gjeld', class: 2, type: 'liability' },
            '2910': { name: 'Gjeld til ansatte', class: 2, type: 'liability' },
            '2960': { name: 'Påløpte kostnader', class: 2, type: 'liability' },
            '2990': { name: 'Annen kortsiktig gjeld', class: 2, type: 'liability' },
            
            // Klasse 3: Driftsinntekter
            '3000': { name: 'Salgsinntekt, avgiftspliktig', class: 3, type: 'revenue' },
            '3100': { name: 'Salgsinntekt, avgiftsfri', class: 3, type: 'revenue' },
            '3200': { name: 'Salgsinntekt, utenfor avgiftsområdet', class: 3, type: 'revenue' },
            '3400': { name: 'Offentlig tilskudd', class: 3, type: 'revenue' },
            '3600': { name: 'Leieinntekt', class: 3, type: 'revenue' },
            '3700': { name: 'Provisjonsinntekt', class: 3, type: 'revenue' },
            '3900': { name: 'Annen driftsinntekt', class: 3, type: 'revenue' },
            
            // Klasse 4: Varekostnad
            '4000': { name: 'Varekostnad', class: 4, type: 'expense' },
            '4100': { name: 'Innkjøp av råvarer', class: 4, type: 'expense' },
            '4200': { name: 'Innkjøp av handelsvarer', class: 4, type: 'expense' },
            '4300': { name: 'Innkjøp av varer for videresalg', class: 4, type: 'expense' },
            '4500': { name: 'Fremmedytelser', class: 4, type: 'expense' },
            '4600': { name: 'Frakt og transport', class: 4, type: 'expense' },
            '4700': { name: 'Beholdningsendring', class: 4, type: 'expense' },
            
            // Klasse 5: Lønnskostnader
            '5000': { name: 'Lønn til ansatte', class: 5, type: 'expense' },
            '5010': { name: 'Feriepenger', class: 5, type: 'expense' },
            '5020': { name: 'Påløpte feriepenger', class: 5, type: 'expense' },
            '5090': { name: 'Annen lønn', class: 5, type: 'expense' },
            '5190': { name: 'Påløpt arbeidsgiveravgift', class: 5, type: 'expense' },
            '5200': { name: 'Fri bil', class: 5, type: 'expense' },
            '5210': { name: 'Fri telefon', class: 5, type: 'expense' },
            '5290': { name: 'Motkonto naturalytelser', class: 5, type: 'expense' },
            '5300': { name: 'Annen godtgjørelse', class: 5, type: 'expense' },
            '5400': { name: 'Arbeidsgiveravgift', class: 5, type: 'expense' },
            '5420': { name: 'Innberetningspliktig pensjonskostnad', class: 5, type: 'expense' },
            '5500': { name: 'Annen kostnadsgodtgjørelse', class: 5, type: 'expense' },
            '5900': { name: 'Annen personalkostnad', class: 5, type: 'expense' },
            
            // Klasse 6: Andre driftskostnader
            '6000': { name: 'Avskrivning', class: 6, type: 'expense' },
            '6010': { name: 'Avskrivning bygninger', class: 6, type: 'expense' },
            '6015': { name: 'Avskrivning bygningsmessige anlegg', class: 6, type: 'expense' },
            '6020': { name: 'Avskrivning maskiner', class: 6, type: 'expense' },
            '6050': { name: 'Avskrivning inventar', class: 6, type: 'expense' },
            '6100': { name: 'Frakt og transportkostnad', class: 6, type: 'expense' },
            '6200': { name: 'Elektrisitet', class: 6, type: 'expense' },
            '6300': { name: 'Leie lokaler', class: 6, type: 'expense' },
            '6340': { name: 'Lys og varme', class: 6, type: 'expense' },
            '6400': { name: 'Leie maskiner', class: 6, type: 'expense' },
            '6500': { name: 'Verktøy inventar', class: 6, type: 'expense' },
            '6540': { name: 'Inventar', class: 6, type: 'expense' },
            '6600': { name: 'Reparasjon og vedlikehold', class: 6, type: 'expense' },
            '6700': { name: 'Revisjon', class: 6, type: 'expense' },
            '6720': { name: 'Regnskap', class: 6, type: 'expense' },
            '6790': { name: 'Annen fremmed tjeneste', class: 6, type: 'expense' },
            '6800': { name: 'Kontorrekvisita', class: 6, type: 'expense' },
            '6840': { name: 'Aviser, tidsskrifter', class: 6, type: 'expense' },
            '6860': { name: 'Møte, kurs, oppdatering', class: 6, type: 'expense' },
            '6900': { name: 'Telefon', class: 6, type: 'expense' },
            '6940': { name: 'Porto', class: 6, type: 'expense' },
            
            // Klasse 7: Andre driftskostnader (forts.)
            '7000': { name: 'Drivstoff bil', class: 7, type: 'expense' },
            '7020': { name: 'Vedlikehold bil', class: 7, type: 'expense' },
            '7040': { name: 'Forsikring bil', class: 7, type: 'expense' },
            '7100': { name: 'Bilgodtgjørelse', class: 7, type: 'expense' },
            '7130': { name: 'Reisekostnad', class: 7, type: 'expense' },
            '7140': { name: 'Diettkostnad', class: 7, type: 'expense' },
            '7300': { name: 'Markedsføring', class: 7, type: 'expense' },
            '7320': { name: 'Reklame', class: 7, type: 'expense' },
            '7350': { name: 'Representasjon', class: 7, type: 'expense' },
            '7400': { name: 'Kontingent', class: 7, type: 'expense' },
            '7500': { name: 'Forsikring', class: 7, type: 'expense' },
            '7600': { name: 'Lisens/royalty', class: 7, type: 'expense' },
            '7700': { name: 'Annen kostnad', class: 7, type: 'expense' },
            '7770': { name: 'Bank og kortgebyr', class: 7, type: 'expense' },
            '7790': { name: 'Annen kostnad', class: 7, type: 'expense' },
            '7800': { name: 'Tap på fordringer', class: 7, type: 'expense' },
            '7830': { name: 'Innkommet på tidligere tap', class: 7, type: 'expense' },
            
            // Klasse 8: Finansposter og skatt
            '8000': { name: 'Finansinntekt', class: 8, type: 'financial' },
            '8040': { name: 'Renteinntekt', class: 8, type: 'financial' },
            '8050': { name: 'Annen finansinntekt', class: 8, type: 'financial' },
            '8060': { name: 'Valutagevinst', class: 8, type: 'financial' },
            '8070': { name: 'Aksjeutbytte', class: 8, type: 'financial' },
            '8080': { name: 'Gevinst ved salg av aksjer', class: 8, type: 'financial' },
            '8100': { name: 'Finanskostnad', class: 8, type: 'financial' },
            '8140': { name: 'Rentekostnad', class: 8, type: 'financial' },
            '8150': { name: 'Annen finanskostnad', class: 8, type: 'financial' },
            '8160': { name: 'Valutatap', class: 8, type: 'financial' },
            '8170': { name: 'Tap ved salg av aksjer', class: 8, type: 'financial' },
            '8300': { name: 'Skattekostnad på ordinært resultat', class: 8, type: 'tax' },
            '8320': { name: 'Endring utsatt skatt', class: 8, type: 'tax' },
            '8800': { name: 'Årsresultat', class: 8, type: 'result' },
            '8900': { name: 'Overføringer og disponeringer', class: 8, type: 'result' },
            '8960': { name: 'Overført til/fra annen EK', class: 8, type: 'result' }
        },
        
        /**
         * Account classes
         */
        classes: {
            1: { name: 'Eiendeler', type: 'balance', side: 'debit' },
            2: { name: 'Egenkapital og gjeld', type: 'balance', side: 'credit' },
            3: { name: 'Salgs- og driftsinntekter', type: 'result', side: 'credit' },
            4: { name: 'Varekostnad', type: 'result', side: 'debit' },
            5: { name: 'Lønnskostnad', type: 'result', side: 'debit' },
            6: { name: 'Avskrivninger og andre driftskostnader', type: 'result', side: 'debit' },
            7: { name: 'Andre driftskostnader', type: 'result', side: 'debit' },
            8: { name: 'Finansposter og skatt', type: 'result', side: 'varies' }
        },
        
        /**
         * Search accounts
         */
        search: function(query) {
            var results = [];
            var queryLower = query.toLowerCase();
            var queryNum = query.replace(/\D/g, '');
            
            for (var accountNum in this.accounts) {
                var account = this.accounts[accountNum];
                var matches = accountNum.startsWith(queryNum) || 
                              account.name.toLowerCase().includes(queryLower);
                
                if (matches) {
                    results.push({
                        number: accountNum,
                        name: account.name,
                        class: account.class,
                        type: account.type,
                        className: this.classes[account.class].name
                    });
                }
            }
            
            return results.sort(function(a, b) { return a.number.localeCompare(b.number); });
        },
        
        /**
         * Get account info
         */
        getAccount: function(accountNum) {
            var account = this.accounts[accountNum];
            if (!account) return null;
            
            return {
                number: accountNum,
                name: account.name,
                class: account.class,
                type: account.type,
                className: this.classes[account.class].name,
                normalSide: this.classes[account.class].side
            };
        },
        
        /**
         * Validate account number
         */
        isValidAccount: function(accountNum) {
            return !!this.accounts[accountNum];
        },
        
        /**
         * Get accounts by class
         */
        getByClass: function(classNum) {
            var results = [];
            for (var accountNum in this.accounts) {
                if (this.accounts[accountNum].class === classNum) {
                    results.push({
                        number: accountNum,
                        name: this.accounts[accountNum].name
                    });
                }
            }
            return results;
        }
    };
    
    // ============================================
    // INFO TABLE SYSTEM
    // ============================================
    
    var InfoTableSystem = {
        /**
         * Create a new info table (read-only data for student)
         */
        createTable: function(title, columns, rows) {
            return {
                id: generateId(),
                title: title || 'Data',
                columns: columns || ['Parameter', 'Verdi'],
                rows: rows || [],
                style: 'default' // default, compact, financial
            };
        },
        
        /**
         * Add row to info table
         */
        addRow: function(table) {
            var newRow = table.columns.map(function() { return ''; });
            table.rows.push(newRow);
            return table;
        },
        
        /**
         * Render info table to HTML (for preview/display)
         */
        renderHTML: function(table, variables) {
            var html = '<div class="info-table-container">';
            if (table.title) {
                html += '<div class="info-table-title">' + table.title + '</div>';
            }
            html += '<table class="info-table info-table-' + (table.style || 'default') + '">';
            html += '<thead><tr>';
            table.columns.forEach(function(col) {
                html += '<th>' + col + '</th>';
            });
            html += '</tr></thead><tbody>';
            table.rows.forEach(function(row) {
                html += '<tr>';
                row.forEach(function(cell) {
                    var value = cell;
                    // Replace variables if provided
                    if (variables) {
                        value = VariableSystem.replaceVariables(String(value), variables);
                        value = VariableSystem.evaluateFormulas(value, variables);
                    }
                    html += '<td>' + value + '</td>';
                });
                html += '</tr>';
            });
            html += '</tbody></table></div>';
            return html;
        }
    };
    
    // ============================================
    // INPUT FIELD SYSTEM (inline inputs in question text)
    // ============================================
    
    var InputFieldSystem = {
        /**
         * Parse input fields from text
         * Format: [___fieldname___] or [___fieldname:type___]
         * Types: text, number, account, percent, currency
         */
        parseFields: function(text) {
            var fields = [];
            var regex = /\[___(\w+)(?::(\w+))?___\]/g;
            var match;
            
            while ((match = regex.exec(text)) !== null) {
                fields.push({
                    name: match[1],
                    type: match[2] || 'text',
                    fullMatch: match[0]
                });
            }
            
            return fields;
        },
        
        /**
         * Render text with input fields as HTML
         */
        renderHTML: function(text, fieldAnswers) {
            return text.replace(/\[___(\w+)(?::(\w+))?___\]/g, function(match, name, type) {
                var inputType = type || 'text';
                var className = 'inline-input inline-input-' + inputType;
                var answer = fieldAnswers && fieldAnswers[name] ? fieldAnswers[name] : '';
                
                if (inputType === 'number' || inputType === 'currency' || inputType === 'percent') {
                    return '<input type="number" class="' + className + '" data-field="' + name + '" data-answer="' + answer + '" placeholder="?">';
                } else if (inputType === 'account') {
                    return '<input type="text" class="' + className + ' account-input" data-field="' + name + '" data-answer="' + answer + '" placeholder="Konto" maxlength="4">';
                } else {
                    return '<input type="text" class="' + className + '" data-field="' + name + '" data-answer="' + answer + '" placeholder="...">';
                }
            });
        },
        
        /**
         * Create field definition for solution
         */
        createFieldSolution: function(name, answer, tolerance) {
            return {
                name: name,
                answer: answer,
                tolerance: tolerance || 0
            };
        }
    };
    
    // ============================================
    // STATE
    // ============================================
    
    var state = {
        sets: [],
        currentSetIndex: -1,
        modules: [],
        templates: {},
        variables: {},
        previewMode: 'desktop',
        unsavedChanges: false
    };
    
    // ============================================
    // MODULES DEFINITION
    // ============================================
    
    var MODULES = {
        grunnleggende: {
            id: 'grunnleggende',
            name: 'Grunnleggende Regnskap',
            icon: '📚',
            topics: ['bokforing', 'bilag', 'kontoplan', 'arsavslutning', 'mva', 'lonn', 'skatt', 'avskrivning', 'varelager', 'kundefordringer']
        },
        corporate_finance: {
            id: 'corporate_finance',
            name: 'Corporate Finance',
            icon: '📊',
            topics: ['npv', 'irr', 'wacc', 'capm', 'obligasjoner', 'aksjer', 'dividender', 'kapitalstruktur', 'portefolje', 'risiko', 'opsjoner', 'valuta', 'hedging']
        },
        hjernetrim: {
            id: 'hjernetrim',
            name: 'Hjernetrim',
            icon: '🧠',
            topics: ['mental_math', 'logikk', 'patterns', 'memory', 'speed']
        },
        matte_okonomer: {
            id: 'matte_okonomer',
            name: 'Matte for Økonomer',
            icon: '🔢',
            topics: ['linear', 'derivasjon', 'analyse', 'integrasjon', 'flervariabel', 'finans']
        },
        revisor: {
            id: 'revisor',
            name: 'Revisjon',
            icon: '🔍',
            topics: ['intern_kontroll', 'risikovurdering', 'vesentlighet', 'revisjonsbevis', 'rapportering', 'etikk', 'standarder', 'isa']
        },
        skatt_avgift: {
            id: 'skatt_avgift',
            name: 'Skatt & Avgift',
            icon: '🏛️',
            topics: ['personskatt', 'selskapsskatt', 'mva', 'arbeidsgiveravgift', 'formuesskatt', 'gevinstbeskatning', 'skattemelding']
        },
        juss: {
            id: 'juss',
            name: 'Forretningsjuss',
            icon: '⚖️',
            topics: ['selskapsrett', 'avtalerett', 'arbeidsrett', 'konkurs', 'pant', 'regnskapsloven', 'aksjeloven']
        },
        excel_skills: {
            id: 'excel_skills',
            name: 'Excel Ferdigheter',
            icon: '📗',
            topics: ['formler', 'funksjoner', 'pivot', 'makroer', 'datavalidering', 'formatering', 'diagrammer']
        }
    };
    
    // ============================================
    // TOPIC LABELS (user-friendly names)
    // ============================================
    
    var TOPIC_LABELS = {
        // Matte for Økonomer
        'linear': 'Lineære funksjoner',
        'derivasjon': 'Derivasjon',
        'analyse': 'Økonomisk analyse',
        'integrasjon': 'Integrasjon',
        'flervariabel': 'To variabler',
        'finans': 'Finansmatematikk',
        // Grunnleggende Regnskap
        'bokforing': 'Bokføring',
        'bilag': 'Bilag',
        'kontoplan': 'Kontoplan',
        'arsavslutning': 'Årsavslutning',
        'mva': 'MVA',
        'lonn': 'Lønn',
        'skatt': 'Skatt',
        'avskrivning': 'Avskrivning',
        'varelager': 'Varelager',
        'kundefordringer': 'Kundefordringer',
        // Corporate Finance
        'npv': 'Nåverdi (NPV)',
        'irr': 'Internrente (IRR)',
        'wacc': 'WACC',
        'capm': 'CAPM',
        'obligasjoner': 'Obligasjoner',
        'aksjer': 'Aksjer',
        'dividender': 'Dividender',
        'kapitalstruktur': 'Kapitalstruktur',
        'portefolje': 'Portefølje',
        'risiko': 'Risiko',
        'opsjoner': 'Opsjoner',
        'valuta': 'Valuta',
        'hedging': 'Hedging'
    };
    
    // ============================================
    // QUESTION TYPES
    // ============================================
    
    var QUESTION_TYPES = {
        excel_grid: {
            id: 'excel_grid',
            name: 'Excel Grid',
            icon: '📊',
            description: 'Regneark med formler og beregninger',
            subtypes: ['tkonto', 'parameter', 'cashflow', 'budget', 'custom']
        },
        mc: {
            id: 'mc',
            name: 'Flervalg',
            icon: '✅',
            description: 'Velg ett riktig alternativ',
            subtypes: ['single', 'multi']
        },
        drag_drop: {
            id: 'drag_drop',
            name: 'Drag & Drop',
            icon: '🎯',
            description: 'Dra elementer til riktig kategori',
            subtypes: ['categorize', 'order', 'match', 'formula']
        },
        calculation: {
            id: 'calculation',
            name: 'Beregning',
            icon: '🔢',
            description: 'Skriv inn numerisk svar',
            subtypes: ['single', 'multiple', 'formula']
        },
        inline_input: {
            id: 'inline_input',
            name: 'Inline Input',
            icon: '✏️',
            description: 'Tekstfelt direkte i oppgaveteksten',
            subtypes: ['text', 'number', 'account', 'mixed']
        },
        case_study: {
            id: 'case_study',
            name: 'Case Study',
            icon: '🔍',
            description: 'Kompleks oppgave med flere dokumenter og delspørsmål',
            subtypes: ['standard', 'exam', 'practical']
        },
        paragraph: {
            id: 'paragraph',
            name: 'Paragraf/Lov',
            icon: '📜',
            description: 'Finn riktig lovhenvisning',
            subtypes: ['single', 'multiple']
        },
        tf: {
            id: 'tf',
            name: 'Sant/Usant',
            icon: '⚡',
            description: 'Velg sant eller usant',
            subtypes: ['single', 'multiple']
        },
        function_graph: {
            id: 'function_graph',
            name: 'Graf/Funksjon',
            icon: '📈',
            description: 'Analyser funksjoner med interaktiv graf',
            subtypes: ['analyze', 'derivative', 'integral', 'extrema', 'zeros', 'sketch']
        }
    };
    
    // ============================================
    // VARIABLE SYSTEM (Randomisering)
    // ============================================
    
    var VariableSystem = {
        /**
         * Parse variable-definisjoner fra tekst
         * Format: {var:navn:min-max} eller {var:navn:verdi1,verdi2,verdi3}
         */
        parseVariables: function(text) {
            var variables = {};
            var regex = /\{var:(\w+):([^}]+)\}/g;
            var match;
            
            while ((match = regex.exec(text)) !== null) {
                var name = match[1];
                var definition = match[2];
                
                if (definition.includes('-')) {
                    // Range: min-max
                    var parts = definition.split('-');
                    variables[name] = {
                        type: 'range',
                        min: parseFloat(parts[0]),
                        max: parseFloat(parts[1]),
                        step: parts[2] ? parseFloat(parts[2]) : 1
                    };
                } else if (definition.includes(',')) {
                    // List of values
                    variables[name] = {
                        type: 'list',
                        values: definition.split(',').map(function(v) { return v.trim(); })
                    };
                } else {
                    // Fixed value
                    variables[name] = {
                        type: 'fixed',
                        value: definition
                    };
                }
            }
            
            return variables;
        },
        
        /**
         * Generer tilfeldige verdier for variabler
         */
        generateValues: function(variables) {
            var values = {};
            
            Object.keys(variables).forEach(function(name) {
                var def = variables[name];
                
                if (def.type === 'range') {
                    var range = def.max - def.min;
                    var steps = Math.floor(range / def.step);
                    var randomStep = Math.floor(Math.random() * (steps + 1));
                    values[name] = def.min + (randomStep * def.step);
                } else if (def.type === 'list') {
                    var randomIndex = Math.floor(Math.random() * def.values.length);
                    values[name] = def.values[randomIndex];
                } else {
                    values[name] = def.value;
                }
            });
            
            return values;
        },
        
        /**
         * Erstatt variabler i tekst med verdier
         */
        replaceVariables: function(text, values) {
            var result = text;
            
            // Erstatt variable-definisjoner med verdier
            result = result.replace(/\{var:(\w+):[^}]+\}/g, function(match, name) {
                return values[name] !== undefined ? values[name] : match;
            });
            
            // Erstatt variable-referanser
            result = result.replace(/\{(\w+)\}/g, function(match, name) {
                return values[name] !== undefined ? values[name] : match;
            });
            
            return result;
        },
        
        /**
         * Evaluer formler med variabler
         * Format: {calc:formel}
         */
        evaluateFormulas: function(text, values) {
            return text.replace(/\{calc:([^}]+)\}/g, function(match, formula) {
                try {
                    // Erstatt variabelnavn med verdier
                    var evalFormula = formula;
                    Object.keys(values).forEach(function(name) {
                        var regex = new RegExp('\\b' + name + '\\b', 'g');
                        evalFormula = evalFormula.replace(regex, values[name]);
                    });
                    
                    // Evaluer formelen
                    var result = eval(evalFormula);
                    return typeof result === 'number' ? Math.round(result * 100) / 100 : result;
                } catch (e) {
                    console.error('Formula error:', e);
                    return match;
                }
            });
        },
        
        /**
         * Prosesser en hel oppgave med variabler
         */
        processQuestion: function(question) {
            // Parse variabler fra spørsmålsteksten
            var variables = this.parseVariables(question.question || '');
            
            // Generer verdier
            var values = this.generateValues(variables);
            
            // Erstatt i alle tekstfelter
            var processed = JSON.parse(JSON.stringify(question));
            
            processed.question = this.replaceVariables(processed.question || '', values);
            processed.question = this.evaluateFormulas(processed.question, values);
            
            if (processed.title) {
                processed.title = this.replaceVariables(processed.title, values);
            }
            
            // Prosesser hints
            if (processed.hints) {
                processed.hints = processed.hints.map(function(hint) {
                    var result = VariableSystem.replaceVariables(hint, values);
                    return VariableSystem.evaluateFormulas(result, values);
                });
            }
            
            // Prosesser forklaring
            if (processed.explanation) {
                processed.explanation = this.replaceVariables(processed.explanation, values);
                processed.explanation = this.evaluateFormulas(processed.explanation, values);
            }
            
            // Prosesser grid-verdier
            if (processed.grid && processed.grid.rows) {
                processed.grid.rows.forEach(function(row) {
                    if (row.cells) {
                        row.cells.forEach(function(cell) {
                            if (cell.value) {
                                cell.value = VariableSystem.replaceVariables(String(cell.value), values);
                                cell.value = VariableSystem.evaluateFormulas(cell.value, values);
                            }
                            if (cell.answer !== undefined) {
                                var answerStr = String(cell.answer);
                                answerStr = VariableSystem.replaceVariables(answerStr, values);
                                answerStr = VariableSystem.evaluateFormulas(answerStr, values);
                                cell.answer = parseFloat(answerStr) || answerStr;
                            }
                        });
                    }
                });
            }
            
            // Prosesser løsning
            if (processed.solution) {
                if (Array.isArray(processed.solution)) {
                    processed.solution = processed.solution.map(function(sol) {
                        if (typeof sol === 'object') {
                            var newSol = {};
                            Object.keys(sol).forEach(function(key) {
                                var val = String(sol[key]);
                                val = VariableSystem.replaceVariables(val, values);
                                val = VariableSystem.evaluateFormulas(val, values);
                                newSol[key] = parseFloat(val) || val;
                            });
                            return newSol;
                        }
                        return sol;
                    });
                } else if (typeof processed.solution === 'object') {
                    Object.keys(processed.solution).forEach(function(key) {
                        var val = String(processed.solution[key]);
                        val = VariableSystem.replaceVariables(val, values);
                        val = VariableSystem.evaluateFormulas(val, values);
                        processed.solution[key] = parseFloat(val) || val;
                    });
                } else {
                    var solStr = String(processed.solution);
                    solStr = VariableSystem.replaceVariables(solStr, values);
                    solStr = VariableSystem.evaluateFormulas(solStr, values);
                    processed.solution = parseFloat(solStr) || solStr;
                }
            }
            
            // Lagre genererte verdier for referanse
            processed._generatedValues = values;
            processed._variableDefinitions = variables;
            
            return processed;
        }
    };
    
    // ============================================
    // DOCUMENT SYSTEM (For Case Studies)
    // ============================================
    
    var DocumentSystem = {
        types: {
            bilag: { icon: '🧾', name: 'Bilag' },
            faktura: { icon: '📄', name: 'Faktura' },
            balanse: { icon: '📊', name: 'Balanse' },
            resultat: { icon: '📈', name: 'Resultatregnskap' },
            noter: { icon: '📝', name: 'Noter' },
            kontoplan: { icon: '📋', name: 'Kontoplan' },
            kontoutskrift: { icon: '🏦', name: 'Kontoutskrift' },
            kontrakt: { icon: '📃', name: 'Kontrakt' },
            brev: { icon: '✉️', name: 'Brev' },
            rapport: { icon: '📒', name: 'Rapport' },
            kalkyle: { icon: '🔢', name: 'Kalkyle' },
            skattemelding: { icon: '🏛️', name: 'Skattemelding' },
            arsmelding: { icon: '📚', name: 'Årsmelding' }
        },
        
        createDocument: function(type, title, content) {
            return {
                id: generateId(),
                type: type,
                title: title || this.types[type]?.name || 'Dokument',
                content: content || '',
                grid: null, // For regneark-dokumenter
                image: null, // For bilde-bilag
                created: Date.now()
            };
        },
        
        renderDocumentEditor: function(doc, index, questionIndex) {
            var typeOptions = Object.keys(this.types).map(function(key) {
                var type = DocumentSystem.types[key];
                var selected = doc.type === key ? 'selected' : '';
                return '<option value="' + key + '" ' + selected + '>' + type.icon + ' ' + type.name + '</option>';
            }).join('');
            
            return '\
                <div class="document-editor" data-doc-index="' + index + '">\
                    <div class="document-header">\
                        <select class="doc-type" onchange="QuestionBuilder.updateDocument(' + questionIndex + ', ' + index + ', \'type\', this.value)">\
                            ' + typeOptions + '\
                        </select>\
                        <input type="text" class="doc-title" value="' + escapeHtml(doc.title) + '" \
                               placeholder="Dokumenttittel"\
                               onchange="QuestionBuilder.updateDocument(' + questionIndex + ', ' + index + ', \'title\', this.value)">\
                        <button class="btn btn-sm btn-danger" onclick="QuestionBuilder.deleteDocument(' + questionIndex + ', ' + index + ')">×</button>\
                    </div>\
                    <div class="document-content">\
                        <textarea placeholder="Dokumentinnhold... Bruk variabler som {bruttolonn} eller {var:belop:10000-50000}"\
                                  onchange="QuestionBuilder.updateDocument(' + questionIndex + ', ' + index + ', \'content\', this.value)">' + escapeHtml(doc.content) + '</textarea>\
                    </div>\
                    <div class="document-actions">\
                        <button class="btn btn-sm btn-secondary" onclick="QuestionBuilder.addGridToDocument(' + questionIndex + ', ' + index + ')">📊 Legg til tabell</button>\
                        <button class="btn btn-sm btn-secondary" onclick="QuestionBuilder.uploadImageToDocument(' + questionIndex + ', ' + index + ')">🖼️ Last opp bilde</button>\
                    </div>\
                </div>\
            ';
        }
    };
    
    // ============================================
    // SUBQUESTION SYSTEM
    // ============================================
    
    var SubquestionSystem = {
        letters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
        
        createSubquestion: function(letter) {
            return {
                id: generateId(),
                letter: letter || 'a',
                question: '',
                type: 'calculation',
                points: 5,
                solution: null,
                tolerance: 0.5,
                hints: [],
                explanation: ''
            };
        },
        
        renderSubquestionEditor: function(subq, index, questionIndex) {
            var letter = this.letters[index] || String.fromCharCode(97 + index);
            
            // Bygg løsnings-seksjon basert på type
            var solutionHtml = '';
            if (subq.type === 'mc') {
                // Flervalg - vis alternativer
                var options = subq.options || ['', '', '', ''];
                var correctIndex = subq.correctIndex || 0;
                solutionHtml = '\
                    <div class="mc-options-editor">\
                        <label>Alternativer:</label>\
                        ' + options.map(function(opt, i) {
                            return '<div class="mc-option-row">\
                                <input type="radio" name="mc-correct-' + questionIndex + '-' + index + '" value="' + i + '" ' + (i === correctIndex ? 'checked' : '') + '\
                                       onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'correctIndex\', ' + i + ')">\
                                <input type="text" value="' + escapeHtml(opt) + '" placeholder="Alternativ ' + String.fromCharCode(65 + i) + '"\
                                       onchange="QuestionBuilder.updateSubquestionOption(' + questionIndex + ', ' + index + ', ' + i + ', this.value)">\
                            </div>';
                        }).join('') + '\
                        <button class="btn btn-sm btn-secondary" onclick="QuestionBuilder.addSubquestionOption(' + questionIndex + ', ' + index + ')">+ Alternativ</button>\
                    </div>';
            } else if (subq.type === 'text') {
                // Tekst - kun fasit-felt, ingen toleranse
                solutionHtml = '\
                    <div class="subq-solution">\
                        <label>Forventet svar (valgfritt):</label>\
                        <input type="text" value="' + escapeHtml(subq.solution || '') + '"\
                               placeholder="Stikkord eller fullstendig svar"\
                               onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'solution\', this.value)">\
                    </div>';
            } else {
                // Beregning/Grid - numerisk fasit med toleranse
                solutionHtml = '\
                    <div class="subq-solution">\
                        <label>Fasit:</label>\
                        <input type="text" value="' + escapeHtml(subq.solution || '') + '"\
                               placeholder="Riktig svar"\
                               onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'solution\', this.value)">\
                        <label>Toleranse ±</label>\
                        <input type="number" class="tolerance" value="' + (subq.tolerance || 0.5) + '" step="0.1"\
                               onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'tolerance\', parseFloat(this.value))">\
                    </div>';
            }
            
            return '\
                <div class="subquestion-editor" data-subq-index="' + index + '">\
                    <div class="subquestion-header">\
                        <span class="subq-letter">' + letter + ')</span>\
                        <select class="subq-type" onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'type\', this.value); QuestionBuilder.rerenderSubquestions(' + questionIndex + ');">\
                            <option value="calculation" ' + (subq.type === 'calculation' ? 'selected' : '') + '>🔢 Beregning</option>\
                            <option value="mc" ' + (subq.type === 'mc' ? 'selected' : '') + '>✅ Flervalg</option>\
                            <option value="text" ' + (subq.type === 'text' ? 'selected' : '') + '>📝 Tekst</option>\
                            <option value="excel_grid" ' + (subq.type === 'excel_grid' ? 'selected' : '') + '>📊 Grid</option>\
                        </select>\
                        <input type="number" class="subq-points" value="' + (subq.points || 5) + '" min="1" max="50"\
                               onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'points\', parseInt(this.value))">\
                        <span class="points-label">poeng</span>\
                        <button class="btn btn-sm btn-danger" onclick="QuestionBuilder.deleteSubquestion(' + questionIndex + ', ' + index + ')">×</button>\
                    </div>\
                    <div class="subquestion-body">\
                        <textarea placeholder="Skriv delspørsmål ' + letter + ')..."\
                                  onchange="QuestionBuilder.updateSubquestion(' + questionIndex + ', ' + index + ', \'question\', this.value)">' + escapeHtml(subq.question) + '</textarea>\
                        ' + solutionHtml + '\
                    </div>\
                </div>\
            ';
        }
    };
    
    // ============================================
    // TEMPLATES
    // ============================================
    
    var TEMPLATES = {
        // Bokføring templates
        bokforing_enkel: {
            name: 'Enkel bokføring',
            module: 'grunnleggende',
            topic: 'bokforing',
            type: 'excel_grid',
            template: {
                title: 'Bokfør transaksjonen',
                question: 'Bedriften kjøper varer for kr {var:belop:5000-50000:1000} kontant. Bokfør transaksjonen.',
                grid: {
                    type: 'tkonto',
                    columns: ['Konto', 'Debet', 'Kredit'],
                    rows: [
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] },
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] }
                    ]
                },
                solution: [
                    { account: '4300', debet: '{belop}', kredit: 0 },
                    { account: '1920', debet: 0, kredit: '{belop}' }
                ],
                hints: [
                    'Varekjøp er en kostnad - hvilken side øker kostnader?',
                    'Bank er en eiendel som reduseres',
                    'Konto 4300 = Varekostnad, Konto 1920 = Bank'
                ],
                explanation: 'Ved kontant varekjøp debiteres konto 4300 (Varekostnad) med {belop} fordi kostnader øker på debet. Bank (1920) krediteres med {belop} fordi vi betaler ut penger.'
            }
        },
        
        bokforing_mva: {
            name: 'Bokføring med MVA',
            module: 'grunnleggende',
            topic: 'mva',
            type: 'excel_grid',
            template: {
                title: 'Varekjøp med mva',
                question: 'Bedriften kjøper varer på kreditt for kr {var:netto:10000-100000:5000} + mva 25%. Bokfør transaksjonen.',
                grid: {
                    type: 'tkonto',
                    columns: ['Konto', 'Debet', 'Kredit'],
                    rows: [
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] },
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] },
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] }
                    ]
                },
                solution: [
                    { account: '4300', debet: '{netto}', kredit: 0 },
                    { account: '2710', debet: '{calc:netto*0.25}', kredit: 0 },
                    { account: '2400', debet: 0, kredit: '{calc:netto*1.25}' }
                ],
                hints: [
                    'Varekjøp føres ekskl. mva på konto 4300',
                    'Inngående mva (2710) gir oss fradrag - det er et krav',
                    'Leverandørgjeld = netto + mva = {calc:netto*1.25}'
                ]
            }
        },
        
        lonn_enkel: {
            name: 'Lønnsutbetaling',
            module: 'grunnleggende',
            topic: 'lonn',
            type: 'excel_grid',
            template: {
                title: 'Bokfør lønnsutbetaling',
                question: 'Bedriften utbetaler lønn: Bruttolønn kr {var:brutto:30000-60000:5000}, skattetrekk {var:skatteprosent:25,30,35}%. Bokfør lønnsutbetalingen.',
                grid: {
                    type: 'tkonto',
                    columns: ['Konto', 'Debet', 'Kredit'],
                    rows: [
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] },
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] },
                        { cells: [{ editable: true, type: 'account' }, { editable: true }, { editable: true }] }
                    ]
                },
                solution: [
                    { account: '5000', debet: '{brutto}', kredit: 0 },
                    { account: '2600', debet: 0, kredit: '{calc:brutto*skatteprosent/100}' },
                    { account: '1920', debet: 0, kredit: '{calc:brutto*(1-skatteprosent/100)}' }
                ]
            }
        },
        
        // Corporate Finance templates
        wacc_guided: {
            name: 'WACC Beregning',
            module: 'corporate_finance',
            topic: 'wacc',
            type: 'excel_grid',
            template: {
                title: 'Beregn WACC',
                question: 'Et selskap har egenkapital på {var:ek:40-80:10} MNOK og gjeld på {var:gjeld:20-60:10} MNOK. Avkastningskrav EK er {var:re:10-15}%, gjeldskostnad er {var:rd:4-8}%, skattesats er {var:skatt:20,22,25}%. Beregn WACC.',
                grid: {
                    type: 'parameter',
                    columns: ['Parameter', 'Verdi'],
                    rows: [
                        { cells: [{ value: 'Egenkapital (E)', editable: false }, { value: '{ek} MNOK', editable: false }] },
                        { cells: [{ value: 'Gjeld (D)', editable: false }, { value: '{gjeld} MNOK', editable: false }] },
                        { cells: [{ value: 'Total (V)', editable: false }, { value: '{calc:ek+gjeld} MNOK', editable: false }] },
                        { cells: [{ value: 'E/V', editable: false }, { value: '{calc:Math.round(ek/(ek+gjeld)*100)/100}', editable: false }] },
                        { cells: [{ value: 'D/V', editable: false }, { value: '{calc:Math.round(gjeld/(ek+gjeld)*100)/100}', editable: false }] },
                        { cells: [{ value: 'Re', editable: false }, { value: '{re}%', editable: false }] },
                        { cells: [{ value: 'Rd', editable: false }, { value: '{rd}%', editable: false }] },
                        { cells: [{ value: 'Skattesats', editable: false }, { value: '{skatt}%', editable: false }] },
                        { cells: [{ value: 'WACC', editable: false }, { value: '', editable: true, answer: '{calc:Math.round(((ek/(ek+gjeld))*re + (gjeld/(ek+gjeld))*rd*(1-skatt/100))*100)/100}' }] }
                    ]
                },
                hints: [
                    'WACC = (E/V)*Re + (D/V)*Rd*(1-T)',
                    'E/V = {ek}/({ek}+{gjeld}) = {calc:Math.round(ek/(ek+gjeld)*100)/100}',
                    'Gjeldskostnaden justeres for skatt: {rd}%*(1-{skatt}%) = {calc:Math.round(rd*(1-skatt/100)*100)/100}%'
                ]
            }
        },
        
        npv_simple: {
            name: 'NPV Beregning',
            module: 'corporate_finance',
            topic: 'npv',
            type: 'excel_grid',
            template: {
                title: 'Beregn NPV',
                question: 'Et prosjekt krever investering på kr {var:invest:100000-500000:50000} og gir årlige kontantstrømmer på kr {var:cf:20000-100000:10000} i {var:n:3,4,5} år. Avkastningskrav er {var:r:8,10,12}%. Beregn NPV.',
                grid: {
                    type: 'parameter',
                    columns: ['Parameter', 'Verdi'],
                    rows: [
                        { cells: [{ value: 'Investering (I₀)', editable: false }, { value: '-{invest}', editable: false }] },
                        { cells: [{ value: 'Årlig CF', editable: false }, { value: '{cf}', editable: false }] },
                        { cells: [{ value: 'Perioder (n)', editable: false }, { value: '{n}', editable: false }] },
                        { cells: [{ value: 'Rente (r)', editable: false }, { value: '{r}%', editable: false }] },
                        { cells: [{ value: 'NPV', editable: false }, { value: '', editable: true }] }
                    ]
                },
                solution: '{calc:Math.round(-invest + cf * ((1-Math.pow(1+r/100,-n))/(r/100)))}'
            }
        },
        
        // Case Study template
        case_arsoppgjor: {
            name: 'Årsoppgjør Case',
            module: 'grunnleggende',
            topic: 'arsavslutning',
            type: 'case_study',
            template: {
                title: 'Årsoppgjør for Eksempel AS',
                question: 'Du er regnskapsfører for Eksempel AS og skal gjennomføre årsoppgjøret. Se vedlagte dokumenter og svar på delspørsmålene.',
                documents: [
                    {
                        type: 'balanse',
                        title: 'Saldobalanse pr. 31.12',
                        content: 'Konto 1920 Bank: {var:bank:50000-200000:10000}\nKonto 1500 Kundefordringer: {var:kunder:30000-100000:10000}\nKonto 4300 Varekostnad: {var:varekost:100000-500000:50000}'
                    },
                    {
                        type: 'bilag',
                        title: 'Bilag - Ubetalt faktura',
                        content: 'Faktura til kunde Ola Hansen\nBeløp: {var:utestaaende:15000-50000:5000}\nForfalt: Ja, over 90 dager'
                    }
                ],
                subquestions: [
                    {
                        letter: 'a',
                        question: 'Bør kundefordringen på {utestaaende} avskrives? Begrunn svaret.',
                        type: 'text',
                        points: 5
                    },
                    {
                        letter: 'b',
                        question: 'Hvis ja, bokfør avskrivningen.',
                        type: 'excel_grid',
                        points: 10,
                        grid: {
                            type: 'tkonto',
                            columns: ['Konto', 'Debet', 'Kredit'],
                            rows: [
                                { cells: [{ editable: true }, { editable: true }, { editable: true }] },
                                { cells: [{ editable: true }, { editable: true }, { editable: true }] }
                            ]
                        }
                    }
                ]
            }
        },
        
        // WACC with info table
        wacc_with_table: {
            name: 'WACC med tabell',
            module: 'corporate_finance',
            topic: 'wacc',
            type: 'excel_grid',
            template: {
                title: 'Beregn WACC',
                question: 'Gitt følgende informasjon om selskapets kapitalstruktur, beregn WACC. Avkastningskrav på EK er {var:re:10-15}%, gjeldskostnad er {var:rd:4-8}%, og skattesats er {var:skatt:22}%.',
                infoTables: [
                    {
                        title: 'Kapitalstruktur',
                        columns: ['Source of Capital', 'Market Value'],
                        rows: [
                            ['Ordinary shares', '{var:ek:100000-300000:50000}'],
                            ['Debt', '{var:gjeld:50000-150000:25000}']
                        ],
                        style: 'financial'
                    }
                ],
                grid: {
                    type: 'parameter',
                    columns: ['Beregning', 'Verdi'],
                    rows: [
                        { cells: [{ value: 'E/V', editable: false }, { value: '', editable: true, answer: '{calc:Math.round(ek/(ek+gjeld)*100)/100}' }] },
                        { cells: [{ value: 'D/V', editable: false }, { value: '', editable: true, answer: '{calc:Math.round(gjeld/(ek+gjeld)*100)/100}' }] },
                        { cells: [{ value: 'WACC (%)', editable: false }, { value: '', editable: true, answer: '{calc:Math.round(((ek/(ek+gjeld))*re + (gjeld/(ek+gjeld))*rd*(1-skatt/100))*100)/100}' }] }
                    ]
                },
                hints: [
                    'WACC = (E/V) × Re + (D/V) × Rd × (1-T)',
                    'E/V = EK / (EK + Gjeld)',
                    'Husk å justere gjeldskostnaden for skatt'
                ],
                explanation: 'WACC beregnes ved å vekte kostnadene for egenkapital og gjeld etter deres andel av total kapital.'
            }
        },
        
        // Inline input example
        inline_calculation: {
            name: 'Inline beregning',
            module: 'grunnleggende',
            topic: 'beregning',
            type: 'inline_input',
            template: {
                title: 'Beregn bruttofortjeneste',
                question: 'Salgspris er kr {var:salg:500-2000:100} inkl. mva (25%). Innkjøpspris er kr {var:innkjop:200-800:50} ekskl. mva.\n\nSalgspris ekskl. mva: [___salgeksmva:currency___]\nBruttofortjeneste: [___bruttofortjeneste:currency___]',
                fieldAnswers: {
                    salgeksmva: '{calc:salg/1.25}',
                    bruttofortjeneste: '{calc:salg/1.25 - innkjop}'
                },
                hints: [
                    'Salgspris ekskl. mva = Salgspris inkl. / 1.25',
                    'Bruttofortjeneste = Salgspris ekskl. - Innkjøpspris'
                ]
            }
        },
        
        // Hjernetrim templates
        mental_math: {
            name: 'Hoderegning',
            module: 'hjernetrim',
            topic: 'mental_math',
            type: 'calculation',
            template: {
                title: 'Rask regning',
                question: 'Regn ut: {var:a:10-99} × {var:b:2-9} + {var:c:10-50}',
                solution: '{calc:a*b+c}',
                timeLimit: 30
            }
        },
        
        // Matte templates
        derivasjon: {
            name: 'Derivasjon',
            module: 'matte_okonomer',
            topic: 'derivasjon',
            type: 'calculation',
            template: {
                title: 'Deriver funksjonen',
                question: 'Gitt f(x) = {var:a:2-5}xÂ³ + {var:b:3-8}x² - {var:c:1-10}x. Finn f\'(x) når x = {var:x:1-5}.',
                solution: '{calc:3*a*Math.pow(x,2) + 2*b*x - c}',
                hints: [
                    'f\'(x) = {calc:3*a}x² + {calc:2*b}x - {c}',
                    'Sett inn x = {x}'
                ]
            }
        },
        
        // Graf-templates
        graf_andregradsfunksjon: {
            name: 'Andregradsfunksjon - Graf',
            module: 'matte_okonomer',
            topic: 'funksjonsanalyse',
            type: 'function_graph',
            template: {
                title: 'Analyser andregradsfunksjonen',
                question: 'Gitt inntektsfunksjonen $I(p) = {var:a:-5,-4,-3,-2}p^2 + {var:b:40,50,60,80}p$ der p er pris.\n\na) Finn nullpunktene\nb) Finn toppunktet\nc) For hvilke verdier av p gir funksjonen positiv inntekt?',
                function: '{a}*p^2 + {b}*p',
                functionLabel: 'I(p)',
                variableLabel: 'p',
                graphSettings: {
                    xMin: -5,
                    xMax: 30,
                    yMin: -100,
                    yMax: 500,
                    showDerivative: true,
                    showZeros: true,
                    showExtrema: true
                },
                solution: {
                    zeros: [0, '{calc:-b/a}'],
                    extrema: { x: '{calc:-b/(2*a)}', y: '{calc:-b*b/(4*a)}', type: 'max' },
                    positiveInterval: '[0, {calc:-b/a}]'
                },
                hints: [
                    'Sett I(p) = 0 og løs likningen',
                    'Symmetrilinjen er p = -b/(2a)',
                    'Funksjonen er positiv mellom nullpunktene'
                ],
                explanation: 'Nullpunkter: p = 0 og p = {calc:-b/a}\nToppunkt: ({calc:-b/(2*a)}, {calc:-b*b/(4*a)})\nPositiv inntekt når 0 < p < {calc:-b/a}'
            }
        },
        
        graf_kostnad_inntekt: {
            name: 'Kostnad og Inntekt',
            module: 'matte_okonomer',
            topic: 'funksjonsanalyse',
            type: 'function_graph',
            template: {
                title: 'Kostnad- og inntektsanalyse',
                question: 'En bedrift har:\n- Inntektsfunksjon: $I(x) = {var:pris:80,100,120}x$\n- Kostnadsfunksjon: $K(x) = {var:fast:5000,8000,10000} + {var:variabel:30,40,50}x$\n\nFinn nullpunktet (break-even) og maksimal fortjeneste hvis kapasiteten er {var:kapasitet:100,150,200} enheter.',
                variableLabel: 'x',
                functions: [
                    { expr: '{pris}*x', label: 'I(x)', color: '#4ade80' },
                    { expr: '{fast} + {variabel}*x', label: 'K(x)', color: '#ef4444' },
                    { expr: '{pris}*x - ({fast} + {variabel}*x)', label: 'F(x)', color: '#3b82f6' }
                ],
                graphSettings: {
                    xMin: 0,
                    xMax: 250,
                    yMin: -5000,
                    yMax: 25000,
                    showIntersection: true
                },
                solution: {
                    breakeven: '{calc:fast/(pris-variabel)}',
                    maxProfit: '{calc:(pris-variabel)*kapasitet - fast}'
                },
                hints: [
                    'Break-even: I(x) = K(x)',
                    'Fortjeneste F(x) = I(x) - K(x)',
                    'Maksimal fortjeneste ved x = kapasitet'
                ]
            }
        },
        
        graf_derivasjon_tolkning: {
            name: 'Derivasjon med graf',
            module: 'matte_okonomer',
            topic: 'derivasjon',
            type: 'function_graph',
            template: {
                title: 'Tolkning av derivert',
                question: 'Produksjonskostnaden for x enheter er gitt ved:\n$K(x) = {var:a:0.01,0.02,0.05}x^3 - {var:b:2,3,4}x^2 + {var:c:100,150,200}x + {var:d:1000,2000,5000}$\n\na) Finn grensekostnaden K\'(x)\nb) For hvilken x er grensekostnaden lavest?\nc) Beregn grensekostnaden når x = {var:x:50,60,80}',
                function: '{a}*x^3 - {b}*x^2 + {c}*x + {d}',
                functionLabel: 'K(x)',
                variableLabel: 'x',
                graphSettings: {
                    xMin: 0,
                    xMax: 150,
                    yMin: 0,
                    yMax: 50000,
                    showDerivative: true,
                    showExtrema: true
                },
                solution: {
                    derivative: '3*{a}*x^2 - 2*{b}*x + {c}',
                    minDerivativeAt: '{calc:b/(3*a)}',
                    derivativeAtX: '{calc:3*a*x*x - 2*b*x + c}'
                }
            }
        },
        
        graf_tilbud_ettersporsel: {
            name: 'Tilbud og Etterspørsel',
            module: 'matte_okonomer',
            topic: 'funksjonsanalyse',
            type: 'function_graph',
            template: {
                title: 'Markedslikevekt',
                question: 'I et marked er:\n- Etterspørselsfunksjonen: $x_D = {var:a:200,300,400} - {var:b:2,3,4}p$\n- Tilbudsfunksjonen: $x_S = {var:c:20,40,50} + {var:d:3,4,5}p$\n\nFinn likevektspris og likevektskvantum. Tegn grafene.',
                variableLabel: 'p',
                functions: [
                    { expr: '{a} - {b}*p', label: 'Etterspørsel x_D(p)', color: '#3b82f6' },
                    { expr: '{c} + {d}*p', label: 'Tilbud x_S(p)', color: '#4ade80' }
                ],
                graphSettings: {
                    xLabel: 'Pris (p)',
                    yLabel: 'Kvantum (x)',
                    xMin: 0,
                    xMax: 100,
                    yMin: 0,
                    yMax: 500,
                    showIntersection: true
                },
                solution: {
                    equilibriumPrice: '{calc:(a-c)/(b+d)}',
                    equilibriumQuantity: '{calc:c + d*((a-c)/(b+d))}'
                },
                hints: [
                    'Likevekt: x_D = x_S',
                    'Sett uttrykkene lik hverandre og løs for p',
                    'Sett p inn i én av funksjonene for å finne x'
                ]
            }
        },
        
        graf_elastisitet: {
            name: 'Priselastisitet',
            module: 'matte_okonomer',
            topic: 'elastisitet',
            type: 'function_graph',
            template: {
                title: 'Beregn priselastisitet',
                question: 'Etterspørselsfunksjonen er gitt ved:\n$x(p) = {var:a:1000,2000,5000} - {var:b:10,20,50}p$\n\na) Finn priselastisiteten som funksjon av p\nb) Beregn elastisiteten når p = {var:p:20,30,40}\nc) Er etterspørselen elastisk eller uelastisk ved denne prisen?',
                function: '{a} - {b}*p',
                functionLabel: 'x(p)',
                variableLabel: 'p',
                graphSettings: {
                    xMin: 0,
                    xMax: '{calc:a/b + 10}',
                    yMin: 0,
                    yMax: '{calc:a + 100}',
                    showElasticity: true
                },
                solution: {
                    elasticityFormula: 'E_p = (dx/dp) * (p/x) = -{b} * p / ({a} - {b}p)',
                    elasticityAtP: '{calc:-b * p / (a - b*p)}',
                    interpretation: '{calc:Math.abs(-b * p / (a - b*p)) > 1 ? "elastisk" : "uelastisk"}'
                }
            }
        }
    };
    
    // ============================================
    // CORE FUNCTIONS
    // ============================================
    
    function init() {
        loadFromStorage();
        checkApiConnection();
        renderModuleSelector();
        
        // Auto-save
        setInterval(saveToStorage, 30000);
        
        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', function(e) {
            if (state.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        console.log('[QuestionBuilder] Initialized with', Object.keys(TEMPLATES).length, 'templates');
    }
    
    function createNewSet(moduleId, name) {
        var module = MODULES[moduleId] || MODULES.grunnleggende;
        
        var newSet = {
            id: generateId(),
            name: name || 'Nytt oppgavesett',
            module: moduleId || 'grunnleggende',
            topic: module.topics[0] || '',
            difficulty: 'medium',
            questions: [],
            documents: [],
            created: Date.now(),
            updated: Date.now()
        };
        
        state.sets.push(newSet);
        state.currentSetIndex = state.sets.length - 1;
        state.unsavedChanges = true;
        
        saveToStorage();
        return newSet;
    }
    
    function useTemplate(templateId) {
        var template = TEMPLATES[templateId];
        if (!template) {
            showToast('Mal ikke funnet', 'error');
            return null;
        }
        
        // Create set from template
        var set = createNewSet(template.module, template.name);
        set.topic = template.topic;
        
        // Create question from template
        var question = JSON.parse(JSON.stringify(template.template));
        question.id = generateId();
        question.type = template.type;
        question.topic = template.topic;
        question.difficulty = 'medium';
        question.points = 10;
        
        set.questions.push(question);
        state.unsavedChanges = true;
        
        saveToStorage();
        return set;
    }
    
    function addQuestion(type) {
        if (state.currentSetIndex < 0) {
            showToast('Opprett et sett først', 'error');
            return null;
        }
        
        var set = state.sets[state.currentSetIndex];
        var questionType = QUESTION_TYPES[type] || QUESTION_TYPES.calculation;
        
        var question = {
            id: generateId(),
            type: type || 'calculation',
            title: 'Nytt spørsmål',
            question: '',
            topic: set.topic,
            difficulty: set.difficulty || 'medium',
            points: 10,
            hints: [],
            explanation: '',
            documents: [],
            subquestions: [],
            infoTables: [],
            fieldAnswers: {}
        };
        
        // Add type-specific fields
        if (type === 'excel_grid') {
            question.grid = {
                type: 'parameter',
                columns: ['Parameter', 'Verdi'],
                rows: [
                    { cells: [{ value: 'Parameter 1', editable: false }, { value: '', editable: true }] }
                ]
            };
        } else if (type === 'mc') {
            question.options = [
                { text: 'Alternativ A', correct: true },
                { text: 'Alternativ B', correct: false },
                { text: 'Alternativ C', correct: false },
                { text: 'Alternativ D', correct: false }
            ];
        } else if (type === 'drag_drop') {
            question.categories = ['Kategori 1', 'Kategori 2'];
            question.items = [];
        } else if (type === 'case_study') {
            question.documents = [];
            question.subquestions = [];
        } else if (type === 'inline_input') {
            question.question = 'Skriv inn svaret: [___svar:number___]';
            question.fieldAnswers = { svar: '' };
        }
        
        set.questions.push(question);
        set.updated = Date.now();
        state.unsavedChanges = true;
        
        saveToStorage();
        return question;
    }
    
    function updateQuestion(questionIndex, property, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        set.questions[questionIndex][property] = value;
        set.updated = Date.now();
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteQuestion(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set) return;
        
        set.questions.splice(questionIndex, 1);
        set.updated = Date.now();
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    // ============================================
    // DOCUMENT MANAGEMENT
    // ============================================
    
    function addDocument(questionIndex, type) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.documents) question.documents = [];
        
        var doc = DocumentSystem.createDocument(type || 'bilag');
        question.documents.push(doc);
        state.unsavedChanges = true;
        
        saveToStorage();
        return doc;
    }
    
    function updateDocument(questionIndex, docIndex, property, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.documents || !question.documents[docIndex]) return;
        
        question.documents[docIndex][property] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteDocument(questionIndex, docIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.documents) return;
        
        question.documents.splice(docIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    // ============================================
    // SUBQUESTION MANAGEMENT
    // ============================================
    
    function addSubquestion(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.subquestions) question.subquestions = [];
        
        var letter = SubquestionSystem.letters[question.subquestions.length] || 'x';
        var subq = SubquestionSystem.createSubquestion(letter);
        question.subquestions.push(subq);
        state.unsavedChanges = true;
        
        saveToStorage();
        return subq;
    }
    
    function updateSubquestion(questionIndex, subqIndex, property, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.subquestions || !question.subquestions[subqIndex]) return;
        
        question.subquestions[subqIndex][property] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteSubquestion(questionIndex, subqIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.subquestions) return;
        
        question.subquestions.splice(subqIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function updateSubquestionOption(questionIndex, subqIndex, optionIndex, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.subquestions || !question.subquestions[subqIndex]) return;
        
        var subq = question.subquestions[subqIndex];
        if (!subq.options) subq.options = ['', '', '', ''];
        
        subq.options[optionIndex] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function addSubquestionOption(questionIndex, subqIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.subquestions || !question.subquestions[subqIndex]) return;
        
        var subq = question.subquestions[subqIndex];
        if (!subq.options) subq.options = ['', '', '', ''];
        
        if (subq.options.length < 8) {
            subq.options.push('');
            state.unsavedChanges = true;
            saveToStorage();
            
            // Trigger re-render of subquestions
            if (typeof window.renderEditor === 'function') {
                window.renderEditor();
            }
        } else {
            showToast('Maks 8 alternativer', 'warning');
        }
    }
    
    function rerenderSubquestions(questionIndex) {
        // Trigger full re-render to update MC fields
        if (typeof window.renderEditor === 'function') {
            window.renderEditor();
        }
    }
    
    // ============================================
    // INFO TABLE MANAGEMENT
    // ============================================
    
    function addInfoTable(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables) question.infoTables = [];
        
        if (question.infoTables.length >= CONFIG.MAX_INFO_TABLES) {
            showToast('Maks ' + CONFIG.MAX_INFO_TABLES + ' tabeller', 'warning');
            return;
        }
        
        var table = {
            id: generateId(),
            title: 'Data',
            columns: ['Kolonne 1', 'Kolonne 2'],
            rows: [['', '']],
            style: 'default'
        };
        
        question.infoTables.push(table);
        state.unsavedChanges = true;
        
        saveToStorage();
        return table;
    }
    
    function updateInfoTable(questionIndex, tableIndex, property, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables || !question.infoTables[tableIndex]) return;
        
        question.infoTables[tableIndex][property] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function addInfoTableRow(questionIndex, tableIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables || !question.infoTables[tableIndex]) return;
        
        var table = question.infoTables[tableIndex];
        var newRow = table.columns.map(function() { return ''; });
        table.rows.push(newRow);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function updateInfoTableCell(questionIndex, tableIndex, rowIndex, colIndex, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables || !question.infoTables[tableIndex]) return;
        if (!question.infoTables[tableIndex].rows[rowIndex]) return;
        
        question.infoTables[tableIndex].rows[rowIndex][colIndex] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteInfoTableRow(questionIndex, tableIndex, rowIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables || !question.infoTables[tableIndex]) return;
        
        question.infoTables[tableIndex].rows.splice(rowIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteInfoTable(questionIndex, tableIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables) return;
        
        question.infoTables.splice(tableIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function addInfoTableColumn(questionIndex, tableIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.infoTables || !question.infoTables[tableIndex]) return;
        
        var table = question.infoTables[tableIndex];
        table.columns.push('Ny kolonne');
        table.rows.forEach(function(row) {
            row.push('');
        });
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    // ============================================
    // GRID MANAGEMENT
    // ============================================
    
    function setGridType(questionIndex, gridType) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        
        if (gridType === 'tkonto') {
            question.grid = {
                type: 'tkonto',
                columns: ['Konto', 'Debet', 'Kredit'],
                rows: [
                    { cells: [{ value: '', editable: true, type: 'account' }, { value: '', editable: true }, { value: '', editable: true }] },
                    { cells: [{ value: '', editable: true, type: 'account' }, { value: '', editable: true }, { value: '', editable: true }] }
                ]
            };
        } else {
            question.grid = {
                type: 'parameter',
                columns: ['Parameter', 'Verdi'],
                rows: [
                    { cells: [{ value: 'Parameter 1', editable: false }, { value: '', editable: true }] },
                    { cells: [{ value: 'Parameter 2', editable: false }, { value: '', editable: true }] }
                ]
            };
        }
        
        state.unsavedChanges = true;
        saveToStorage();
    }
    
    function addGridRow(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.grid) return;
        
        var numCols = question.grid.columns.length;
        var newRow = {
            cells: Array(numCols).fill(null).map(function() {
                return { value: '', editable: true };
            })
        };
        
        question.grid.rows.push(newRow);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteGridRow(questionIndex, rowIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.grid || !question.grid.rows) return;
        
        question.grid.rows.splice(rowIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function updateGridCell(questionIndex, rowIndex, colIndex, property, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.grid || !question.grid.rows[rowIndex]) return;
        
        var cell = question.grid.rows[rowIndex].cells[colIndex];
        if (!cell) return;
        
        cell[property] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    // ============================================
    // HINT MANAGEMENT
    // ============================================
    
    function addHint(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.hints) question.hints = [];
        
        if (question.hints.length >= CONFIG.MAX_HINTS) {
            showToast('Maksimalt ' + CONFIG.MAX_HINTS + ' hints', 'warning');
            return;
        }
        
        question.hints.push('');
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function updateHint(questionIndex, hintIndex, value) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.hints) return;
        
        question.hints[hintIndex] = value;
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    function deleteHint(questionIndex, hintIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return;
        
        var question = set.questions[questionIndex];
        if (!question.hints) return;
        
        question.hints.splice(hintIndex, 1);
        state.unsavedChanges = true;
        
        saveToStorage();
    }
    
    // ============================================
    // PREVIEW
    // ============================================
    
    function generatePreview(questionIndex) {
        var set = state.sets[state.currentSetIndex];
        if (!set || !set.questions[questionIndex]) return null;
        
        var question = set.questions[questionIndex];
        
        // Process variables
        var processed = VariableSystem.processQuestion(question);
        
        return processed;
    }
    
    function regeneratePreview(questionIndex) {
        // Regenerate with new random values
        return generatePreview(questionIndex);
    }
    
    // ============================================
    // EXPORT
    // ============================================
    
    function exportToJSON() {
        var set = state.sets[state.currentSetIndex];
        if (!set) return null;
        
        var output = {
            metadata: {
                name: set.name,
                module: set.module,
                topic: set.topic,
                difficulty: set.difficulty,
                created: set.created,
                exported: Date.now()
            },
            questions: set.questions.map(function(q) {
                return {
                    id: q.id,
                    type: q.type,
                    topic: q.topic || set.topic,
                    title: q.title,
                    question: q.question,
                    difficulty: q.difficulty || set.difficulty,
                    points: q.points || 10,
                    grid: q.grid,
                    options: q.options,
                    categories: q.categories,
                    items: q.items,
                    documents: q.documents,
                    subquestions: q.subquestions,
                    solution: q.solution,
                    tolerance: q.tolerance,
                    hints: q.hints,
                    explanation: q.explanation
                };
            })
        };
        
        return JSON.stringify(output, null, 2);
    }
    
    function exportToSQL() {
        var set = state.sets[state.currentSetIndex];
        if (!set) return '';
        
        var sql = '-- Oppgavesett: ' + set.name + '\n';
        sql += '-- Generert: ' + new Date().toISOString() + '\n';
        sql += '-- Modul: ' + set.module + '\n\n';
        
        set.questions.forEach(function(q, i) {
            var id = q.id || set.module + '_' + set.topic + '_' + (i + 1);
            
            sql += '-- Spørsmål ' + (i + 1) + ': ' + q.title + '\n';
            sql += 'INSERT OR REPLACE INTO questions (id, module_id, type, topic, title, question, difficulty, points) VALUES\n';
            sql += "('" + id + "', '" + set.module + "', '" + q.type + "', '" + (q.topic || set.topic) + "', ";
            sql += "'" + escapeSql(q.title) + "', '" + escapeSql(q.question) + "', '" + (q.difficulty || 'medium') + "', " + (q.points || 10) + ");\n\n";
            
            // Question data
            var gridJson = q.grid ? JSON.stringify(q.grid) : null;
            var hintsJson = q.hints && q.hints.length > 0 ? JSON.stringify(q.hints) : null;
            var docsJson = q.documents && q.documents.length > 0 ? JSON.stringify(q.documents) : null;
            var subqJson = q.subquestions && q.subquestions.length > 0 ? JSON.stringify(q.subquestions) : null;
            
            if (gridJson || hintsJson || q.explanation || docsJson || subqJson) {
                sql += 'INSERT OR REPLACE INTO question_data (question_id, grid_json, hints, explanation, documents, subquestions) VALUES\n';
                sql += "('" + id + "', ";
                sql += gridJson ? "'" + escapeSql(gridJson) + "'" : 'NULL';
                sql += ', ';
                sql += hintsJson ? "'" + escapeSql(hintsJson) + "'" : 'NULL';
                sql += ', ';
                sql += q.explanation ? "'" + escapeSql(q.explanation) + "'" : 'NULL';
                sql += ', ';
                sql += docsJson ? "'" + escapeSql(docsJson) + "'" : 'NULL';
                sql += ', ';
                sql += subqJson ? "'" + escapeSql(subqJson) + "'" : 'NULL';
                sql += ');\n\n';
            }
            
            // MC Options
            if (q.type === 'mc' && q.options) {
                q.options.forEach(function(opt, oi) {
                    sql += "INSERT OR REPLACE INTO mc_options (question_id, option_text, is_correct, option_order) VALUES\n";
                    sql += "('" + id + "', '" + escapeSql(opt.text) + "', " + (opt.correct ? 1 : 0) + ", " + oi + ");\n";
                });
                sql += '\n';
            }
            
            // Solutions
            if (q.solution !== undefined && q.solution !== null) {
                var solutionJson = typeof q.solution === 'object' ? JSON.stringify(q.solution) : String(q.solution);
                var format = q.type === 'excel_grid' ? (Array.isArray(q.solution) ? 'bokforing' : 'json') : 'number';
                sql += "INSERT OR REPLACE INTO solutions (question_id, correct_answer, tolerance, answer_format) VALUES\n";
                sql += "('" + id + "', '" + escapeSql(solutionJson) + "', " + (q.tolerance || 0) + ", '" + format + "');\n\n";
            }
        });
        
        return sql;
    }
    
    // ============================================
    // API OPERATIONS
    // ============================================
    
    function checkApiConnection() {
        return fetch(CONFIG.API_URL + '/api/health')
            .then(function(response) {
                if (response.ok) {
                    updateApiStatus(true);
                    return true;
                }
                throw new Error('API not OK');
            })
            .catch(function(err) {
                updateApiStatus(false);
                return false;
            });
    }
    
    function updateApiStatus(connected) {
        var statusEl = document.getElementById('apiStatus');
        if (statusEl) {
            if (connected) {
                statusEl.innerHTML = '<span class="status-dot connected"></span> API tilkoblet';
                statusEl.className = 'api-status connected';
            } else {
                statusEl.innerHTML = '<span class="status-dot"></span> API frakoblet';
                statusEl.className = 'api-status disconnected';
            }
        }
    }
    
    function saveToApi() {
        var set = state.sets[state.currentSetIndex];
        if (!set || set.questions.length === 0) {
            showToast('Ingen spørsmål å lagre', 'error');
            return Promise.reject('No questions');
        }
        
        showToast('Lagrer til API...');
        
        var questions = set.questions.map(function(q) {
            return {
                id: q.id,
                module_id: set.module,
                type: q.type,
                topic: q.topic || set.topic,
                title: q.title,
                question: q.question,
                difficulty: q.difficulty || set.difficulty || 'medium',
                points: q.points || 10,
                grid_json: q.grid ? JSON.stringify(q.grid) : null,
                hints: q.hints,
                explanation: q.explanation,
                options: q.options,
                solution: q.solution,
                tolerance: q.tolerance,
                documents: q.documents,
                subquestions: q.subquestions
            };
        });
        
        return fetch(CONFIG.API_URL + '/api/questions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questions })
        })
        .then(function(response) {
            if (!response.ok) throw new Error('API error');
            return response.json();
        })
        .then(function(result) {
            state.unsavedChanges = false;
            showToast('Lagret ' + (result.imported || questions.length) + ' spørsmål!', 'success');
            return result;
        })
        .catch(function(err) {
            showToast('Feil ved lagring: ' + err.message, 'error');
            throw err;
        });
    }
    
    function loadFromApi(moduleId, topic) {
        showToast('Laster fra API...');
        
        var url = CONFIG.API_URL + '/api/questions?limit=100';
        if (moduleId) url += '&module=' + moduleId;
        if (topic) url += '&topic=' + topic;
        
        return fetch(url)
            .then(function(response) {
                if (!response.ok) throw new Error('API error');
                return response.json();
            })
            .then(function(questions) {
                if (questions.length === 0) {
                    showToast('Ingen spørsmål funnet', 'warning');
                    return [];
                }
                
                // Group by topic
                var grouped = {};
                questions.forEach(function(q) {
                    var key = q.topic || 'ukjent';
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(q);
                });
                
                // Create sets from groups
                Object.keys(grouped).forEach(function(topic) {
                    var set = createNewSet(moduleId || 'grunnleggende', topic + ' (importert)');
                    set.topic = topic;
                    set.questions = grouped[topic].map(function(q) {
                        return {
                            id: q.id,
                            title: q.title,
                            question: q.question,
                            type: q.type,
                            topic: q.topic,
                            difficulty: q.difficulty,
                            points: q.points,
                            grid: q.grid || (q.grid_json ? JSON.parse(q.grid_json) : null),
                            options: q.options,
                            hints: q.hints,
                            explanation: q.explanation
                        };
                    });
                });
                
                saveToStorage();
                showToast('Lastet ' + questions.length + ' spørsmål!', 'success');
                return questions;
            })
            .catch(function(err) {
                showToast('Feil ved lasting: ' + err.message, 'error');
                throw err;
            });
    }
    
    // ============================================
    // STORAGE
    // ============================================
    
    function saveToStorage() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
                sets: state.sets,
                currentSetIndex: state.currentSetIndex
            }));
        } catch (e) {
            console.error('Storage save failed:', e);
        }
    }
    
    function loadFromStorage() {
        try {
            var saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                var data = JSON.parse(saved);
                state.sets = data.sets || [];
                state.currentSetIndex = data.currentSetIndex !== undefined ? data.currentSetIndex : -1;
            }
        } catch (e) {
            console.error('Storage load failed:', e);
        }
    }
    
    // ============================================
    // UI HELPERS
    // ============================================
    
    function renderModuleSelector() {
        var container = document.getElementById('moduleSelector');
        if (!container) return;
        
        var html = Object.keys(MODULES).map(function(key) {
            var mod = MODULES[key];
            return '<option value="' + key + '">' + mod.icon + ' ' + mod.name + '</option>';
        }).join('');
        
        container.innerHTML = html;
    }
    
    function showToast(message, type) {
        var toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'toast show ' + (type || 'success');
        
        setTimeout(function() {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // ============================================
    // UTILITIES
    // ============================================
    
    function generateId() {
        return 'q_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }
    
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    
    function escapeSql(str) {
        if (!str) return '';
        return String(str).replace(/'/g, "''");
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    return {
        // Core
        init: init,
        getState: function() { return state; },
        getModules: function() { return MODULES; },
        getTopicLabels: function() { return TOPIC_LABELS; },
        getTopicLabel: function(topic) { return TOPIC_LABELS[topic] || topic; },
        getQuestionTypes: function() { return QUESTION_TYPES; },
        getTemplates: function() { return TEMPLATES; },
        
        // Set management
        createNewSet: createNewSet,
        useTemplate: useTemplate,
        selectSet: function(index) { state.currentSetIndex = index; },
        deleteSet: function(index) {
            state.sets.splice(index, 1);
            if (state.currentSetIndex >= state.sets.length) {
                state.currentSetIndex = state.sets.length - 1;
            }
            saveToStorage();
        },
        
        // Question management
        addQuestion: addQuestion,
        updateQuestion: updateQuestion,
        deleteQuestion: deleteQuestion,
        duplicateQuestion: function(index) {
            var set = state.sets[state.currentSetIndex];
            if (!set) return;
            var copy = JSON.parse(JSON.stringify(set.questions[index]));
            copy.id = generateId();
            copy.title = copy.title + ' (kopi)';
            set.questions.splice(index + 1, 0, copy);
            state.unsavedChanges = true;
            saveToStorage();
        },
        
        // Grid management
        setGridType: setGridType,
        addGridRow: addGridRow,
        deleteGridRow: deleteGridRow,
        updateGridCell: updateGridCell,
        
        // Document management
        addDocument: addDocument,
        updateDocument: updateDocument,
        deleteDocument: deleteDocument,
        
        // Subquestion management
        addSubquestion: addSubquestion,
        updateSubquestion: updateSubquestion,
        deleteSubquestion: deleteSubquestion,
        updateSubquestionOption: updateSubquestionOption,
        addSubquestionOption: addSubquestionOption,
        rerenderSubquestions: rerenderSubquestions,
        
        // Info Table management
        addInfoTable: addInfoTable,
        updateInfoTable: updateInfoTable,
        addInfoTableRow: addInfoTableRow,
        updateInfoTableCell: updateInfoTableCell,
        deleteInfoTableRow: deleteInfoTableRow,
        deleteInfoTable: deleteInfoTable,
        addInfoTableColumn: addInfoTableColumn,
        
        // Systems
        InfoTableSystem: InfoTableSystem,
        InputFieldSystem: InputFieldSystem,
        LaTeXSystem: LaTeXSystem,
        TimerSystem: TimerSystem,
        ScoringSystem: ScoringSystem,
        LawReferenceSystem: LawReferenceSystem,
        KontoplanSystem: KontoplanSystem,
        GraphSystem: GraphSystem,
        
        // Hint management
        addHint: addHint,
        updateHint: updateHint,
        deleteHint: deleteHint,
        
        // Preview
        generatePreview: generatePreview,
        regeneratePreview: regeneratePreview,
        
        // Variable system
        VariableSystem: VariableSystem,
        
        // Export
        exportToJSON: exportToJSON,
        exportToSQL: exportToSQL,
        downloadJSON: function() {
            var json = exportToJSON();
            if (!json) return;
            var blob = new Blob([json], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = (state.sets[state.currentSetIndex]?.name || 'questions') + '.json';
            a.click();
            URL.revokeObjectURL(url);
        },
        copySQL: function() {
            var sql = exportToSQL();
            if (!sql) return;
            navigator.clipboard.writeText(sql);
            showToast('SQL kopiert!');
        },
        
        // API
        saveToApi: saveToApi,
        loadFromApi: loadFromApi,
        checkApiConnection: checkApiConnection,
        
        // Storage
        saveToStorage: saveToStorage,
        loadFromStorage: loadFromStorage,
        
        // UI
        showToast: showToast,
        renderModuleSelector: renderModuleSelector
    };
    
})();

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        QuestionBuilder.init();
    });
} else {
    QuestionBuilder.init();
}
