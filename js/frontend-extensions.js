/**
 * AccountingQuest - Frontend Extensions
 * Legg til i grunnleggende_regnskap.html og corporate_finance.html
 * 
 * Nye funksjoner:
 * - LaTeX formler
 * - Timer/tidsbegrensning
 * - Poengberegning
 * - Lovhenvisninger
 * - Kontoplan-søk
 * - Progressive hints
 * 
 * BRUK:
 * 1. Legg til KaTeX CSS/JS i <head>:
 *    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
 *    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
 *    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
 * 
 * 2. Legg til denne filen før </body>:
 *    <script src="js/frontend-extensions.js"></script>
 * 
 * 3. Kall AQExtensions.init() etter DOMContentLoaded
 */

var AQExtensions = (function() {
    'use strict';
    
    // ============================================
    // LATEX SYSTEM
    // ============================================
    
    var LaTeX = {
        /**
         * Render all LaTeX in an element
         */
        render: function(element) {
            if (typeof renderMathInElement === 'undefined') {
                console.warn('KaTeX not loaded');
                return;
            }
            
            renderMathInElement(element || document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        },
        
        /**
         * Common formulas
         */
        formulas: {
            npv: 'NPV = \\sum_{t=0}^{n} \\frac{CF_t}{(1+r)^t}',
            wacc: 'WACC = \\frac{E}{V} \\cdot R_e + \\frac{D}{V} \\cdot R_d \\cdot (1-T_c)',
            capm: 'E(R_i) = R_f + \\beta_i (E(R_m) - R_f)',
            lg1: 'LG1 = \\frac{\\text{Omløpsmidler}}{\\text{Kortsiktig gjeld}}',
            lg2: 'LG2 = \\frac{\\text{OM} - \\text{Varelager}}{\\text{KG}}',
            ekr: 'EKR = \\frac{\\text{Resultat}}{\\text{Gj.snitt EK}} \\times 100\\%',
            tkr: 'TKR = \\frac{\\text{DR} + \\text{FI}}{\\text{Gj.snitt TK}} \\times 100\\%',
            dg: 'DG = \\frac{\\text{DB}}{\\text{Salgspris}} \\times 100\\%',
            nullpunkt: 'Nullpunkt = \\frac{\\text{Faste kostnader}}{\\text{DB per enhet}}',
            mva_inkl: 'Brutto = Netto \\times (1 + MVA\\%)',
            mva_ekskl: 'Netto = \\frac{Brutto}{1 + MVA\\%}'
        }
    };
    
    // ============================================
    // TIMER SYSTEM
    // ============================================
    
    var Timer = {
        interval: null,
        remaining: 0,
        callback: null,
        warningAt: 10,
        
        start: function(seconds, onTick, onEnd) {
            this.stop();
            this.remaining = seconds;
            this.callback = onEnd;
            
            this.interval = setInterval(function() {
                Timer.remaining--;
                
                if (onTick) onTick(Timer.remaining);
                
                if (Timer.remaining <= 0) {
                    Timer.stop();
                    if (Timer.callback) Timer.callback();
                }
            }, 1000);
            
            if (onTick) onTick(this.remaining);
        },
        
        stop: function() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        },
        
        format: function(seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = seconds % 60;
            return mins + ':' + (secs < 10 ? '0' : '') + secs;
        },
        
        isWarning: function() {
            return this.remaining > 0 && this.remaining <= this.warningAt;
        }
    };
    
    // ============================================
    // SCORING SYSTEM
    // ============================================
    
    var Scoring = {
        config: {
            maxPoints: 10,
            partialCredit: true,
            hintPenalty: 2,
            timeBonusPerSecond: 0.1,
            streakMultiplier: 0.1
        },
        
        calculate: function(correct, total, hintsUsed, timeBonus, streak) {
            var base = this.config.maxPoints;
            
            // Partial credit
            if (this.config.partialCredit && total > 0) {
                base = base * (correct / total);
            } else if (correct < total) {
                base = 0;
            }
            
            // Hint penalty
            base -= hintsUsed * this.config.hintPenalty;
            
            // Time bonus
            if (timeBonus > 0) {
                base += timeBonus * this.config.timeBonusPerSecond;
            }
            
            // Streak bonus
            if (streak > 0) {
                base *= (1 + streak * this.config.streakMultiplier);
            }
            
            return Math.max(0, Math.round(base * 10) / 10);
        },
        
        getGrade: function(percentage) {
            if (percentage >= 90) return { grade: 'A', label: 'Fremragende' };
            if (percentage >= 80) return { grade: 'B', label: 'Meget godt' };
            if (percentage >= 60) return { grade: 'C', label: 'Godt' };
            if (percentage >= 50) return { grade: 'D', label: 'Nokså godt' };
            if (percentage >= 40) return { grade: 'E', label: 'Tilstrekkelig' };
            return { grade: 'F', label: 'Ikke bestått' };
        }
    };
    
    // ============================================
    // LAW REFERENCES
    // ============================================
    
    var Laws = {
        data: {
            RSKL: {
                name: 'Regnskapsloven',
                sections: {
                    '§3-1': 'Årsregnskap og årsberetning',
                    '§4-1': 'Grunnleggende regnskapsprinsipper',
                    '§5-1': 'Vurdering av eiendeler og gjeld',
                    '§5-3': 'Virkelig verdi',
                    '§6-1': 'Resultatregnskap',
                    '§6-2': 'Balanse'
                }
            },
            BOKL: {
                name: 'Bokføringsloven',
                sections: {
                    '§4': 'Grunnleggende bokføringsprinsipper',
                    '§5': 'Regnskapssystem',
                    '§6': 'Bokføring og dokumentasjon',
                    '§10': 'Oppbevaring',
                    '§13': 'Oppbevaringstid (5 år)'
                }
            },
            SKTL: {
                name: 'Skatteloven',
                sections: {
                    '§5-1': 'Hovedregel om inntekt',
                    '§6-1': 'Hovedregel om fradrag',
                    '§14-41': 'Saldoavskrivning',
                    '§14-43': 'Avskrivningssatser'
                }
            },
            MVAL: {
                name: 'Merverdiavgiftsloven',
                sections: {
                    '§3-1': 'Avgiftsplikten',
                    '§5-1': 'Alminnelig sats (25%)',
                    '§5-2': 'Redusert sats (15%)',
                    '§5-3': 'Lav sats (12%)',
                    '§8-1': 'Fradragsrett'
                }
            }
        },
        
        format: function(lawCode, section) {
            var law = this.data[lawCode];
            if (!law) return '';
            var text = law.sections[section] || '';
            return lawCode + ' ' + section + (text ? ': ' + text : '');
        },
        
        getUrl: function(lawCode) {
            var urls = {
                RSKL: 'https://lovdata.no/dokument/NL/lov/1998-07-17-56',
                BOKL: 'https://lovdata.no/dokument/NL/lov/2004-11-19-73',
                SKTL: 'https://lovdata.no/dokument/NL/lov/1999-03-26-14',
                MVAL: 'https://lovdata.no/dokument/NL/lov/2009-06-19-58'
            };
            return urls[lawCode] || '';
        }
    };
    
    // ============================================
    // KONTOPLAN (NS 4102)
    // ============================================
    
    var Kontoplan = {
        accounts: {
            // Klasse 1: Eiendeler
            '1200': 'Maskiner og anlegg',
            '1250': 'Inventar',
            '1400': 'Varelager',
            '1500': 'Kundefordringer',
            '1580': 'Avsetning tap på fordringer',
            '1700': 'Forskuddsbetalt kostnad',
            '1900': 'Kontanter',
            '1920': 'Bankinnskudd',
            // Klasse 2: EK og Gjeld
            '2000': 'Aksjekapital',
            '2050': 'Annen egenkapital',
            '2400': 'Leverandørgjeld',
            '2500': 'Betalbar skatt',
            '2600': 'Skattetrekk',
            '2700': 'Utgående mva',
            '2710': 'Inngående mva',
            '2740': 'Oppgjørskonto mva',
            '2770': 'Skyldig AGA',
            '2780': 'Påløpt AGA',
            '2930': 'Skyldig lønn',
            '2940': 'Påløpt feriepenger',
            // Klasse 3: Inntekter
            '3000': 'Salgsinntekt, avgiftspliktig',
            '3100': 'Salgsinntekt, avgiftsfri',
            // Klasse 4: Varekost
            '4000': 'Varekostnad',
            '4300': 'Innkjøp varer',
            // Klasse 5: Lønn
            '5000': 'Lønn',
            '5180': 'Feriepenger',
            '5400': 'Arbeidsgiveravgift',
            // Klasse 6: Avskrivning/drift
            '6000': 'Avskrivning',
            '6300': 'Leie lokaler',
            '6800': 'Kontorrekvisita',
            // Klasse 7: Andre driftskostnader
            '7500': 'Forsikring',
            '7830': 'Tap på fordringer',
            // Klasse 8: Finans
            '8050': 'Renteinntekt',
            '8150': 'Rentekostnad',
            '8300': 'Skattekostnad'
        },
        
        search: function(query) {
            var results = [];
            var q = query.toLowerCase();
            
            for (var num in this.accounts) {
                if (num.includes(query) || this.accounts[num].toLowerCase().includes(q)) {
                    results.push({ number: num, name: this.accounts[num] });
                }
            }
            
            return results.sort(function(a, b) { return a.number.localeCompare(b.number); });
        },
        
        getName: function(accountNum) {
            return this.accounts[accountNum] || '';
        },
        
        isValid: function(accountNum) {
            return !!this.accounts[accountNum];
        }
    };
    
    // ============================================
    // PROGRESSIVE HINTS
    // ============================================
    
    var Hints = {
        current: 0,
        pointsCost: 2,
        
        reset: function() {
            this.current = 0;
        },
        
        getNext: function(hints) {
            if (!hints || this.current >= hints.length) return null;
            return hints[this.current++];
        },
        
        hasMore: function(hints) {
            return hints && this.current < hints.length;
        },
        
        getUsed: function() {
            return this.current;
        }
    };
    
    // ============================================
    // INFO TABLE RENDERING
    // ============================================
    
    var InfoTable = {
        render: function(table) {
            if (!table) return '';
            
            var style = table.style || 'default';
            var classNames = 'info-table';
            if (style === 'financial') classNames += ' info-table-financial';
            
            var html = '<div class="info-table-container">';
            if (table.title) {
                html += '<div class="info-table-title">' + table.title + '</div>';
            }
            html += '<table class="' + classNames + '">';
            
            // Header
            if (table.columns) {
                html += '<thead><tr>';
                table.columns.forEach(function(col) {
                    html += '<th>' + col + '</th>';
                });
                html += '</tr></thead>';
            }
            
            // Body
            html += '<tbody>';
            (table.rows || []).forEach(function(row) {
                html += '<tr>';
                row.forEach(function(cell) {
                    html += '<td>' + cell + '</td>';
                });
                html += '</tr>';
            });
            html += '</tbody></table></div>';
            
            return html;
        }
    };
    
    // ============================================
    // VARIABLE PROCESSING
    // ============================================
    
    var Variables = {
        /**
         * Parse and generate random values for variables in question
         */
        process: function(question) {
            var values = {};
            var text = question.question || '';
            
            // Find all {var:name:config} patterns
            var regex = /\{var:(\w+):([^}]+)\}/g;
            var match;
            
            while ((match = regex.exec(text)) !== null) {
                var name = match[1];
                var config = match[2];
                
                if (config.includes('-')) {
                    // Range: min-max or min-max:step
                    var parts = config.split(/[-:]/);
                    var min = parseFloat(parts[0]);
                    var max = parseFloat(parts[1]);
                    var step = parts[2] ? parseFloat(parts[2]) : 1;
                    
                    var range = max - min;
                    var steps = Math.floor(range / step);
                    values[name] = min + Math.floor(Math.random() * (steps + 1)) * step;
                } else if (config.includes(',')) {
                    // List of values
                    var options = config.split(',');
                    values[name] = options[Math.floor(Math.random() * options.length)];
                    // Try to parse as number
                    if (!isNaN(parseFloat(values[name]))) {
                        values[name] = parseFloat(values[name]);
                    }
                }
            }
            
            // Replace variables in text
            var processed = text;
            for (var name in values) {
                var val = values[name];
                var formatted = typeof val === 'number' ? val.toLocaleString('nb-NO') : val;
                
                // Replace {var:name:...} with value
                processed = processed.replace(
                    new RegExp('\\{var:' + name + ':[^}]+\\}', 'g'),
                    formatted
                );
                // Replace {name} references with value
                processed = processed.replace(
                    new RegExp('\\{' + name + '\\}', 'g'),
                    formatted
                );
            }
            
            // Process calculations {calc:expression}
            processed = processed.replace(/\{calc:([^}]+)\}/g, function(match, expr) {
                try {
                    var evalExpr = expr;
                    for (var n in values) {
                        evalExpr = evalExpr.replace(new RegExp(n, 'g'), values[n]);
                    }
                    var result = eval(evalExpr);
                    return typeof result === 'number' ? 
                        Math.round(result * 100) / 100 : 
                        result;
                } catch (e) {
                    return match;
                }
            });
            
            return {
                question: processed,
                values: values,
                original: question
            };
        },
        
        /**
         * Process solution with variable values
         */
        processSolution: function(solution, values) {
            if (!solution || !Array.isArray(solution)) return solution;
            
            return solution.map(function(row) {
                var processed = {};
                
                for (var key in row) {
                    var val = row[key];
                    
                    if (typeof val === 'string') {
                        // Replace variables
                        for (var name in values) {
                            val = val.replace(new RegExp('\\{' + name + '\\}', 'g'), values[name]);
                        }
                        
                        // Evaluate calculations
                        val = val.replace(/\{calc:([^}]+)\}/g, function(match, expr) {
                            try {
                                var evalExpr = expr;
                                for (var n in values) {
                                    evalExpr = evalExpr.replace(new RegExp(n, 'g'), values[n]);
                                }
                                return eval(evalExpr);
                            } catch (e) {
                                return 0;
                            }
                        });
                        
                        // Try to parse as number
                        if (!isNaN(parseFloat(val)) && isFinite(val)) {
                            val = parseFloat(val);
                        }
                    }
                    
                    processed[key] = val;
                }
                
                return processed;
            });
        }
    };
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        console.log('🚀 AQExtensions loaded');
        
        // Auto-render LaTeX when KaTeX is ready
        if (typeof renderMathInElement !== 'undefined') {
            LaTeX.render();
        } else {
            // Wait for KaTeX
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    if (typeof renderMathInElement !== 'undefined') {
                        LaTeX.render();
                    }
                }, 500);
            });
        }
    }
    
    // ============================================
    // PUBLIC API
    // ============================================
    
    return {
        init: init,
        LaTeX: LaTeX,
        Timer: Timer,
        Scoring: Scoring,
        Laws: Laws,
        Kontoplan: Kontoplan,
        Hints: Hints,
        InfoTable: InfoTable,
        Variables: Variables
    };
    
})();

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AQExtensions.init);
} else {
    AQExtensions.init();
}
