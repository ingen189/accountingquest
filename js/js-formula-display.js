/**
 * AccountingQuest - Formula Display Module
 * Profesjonell visning av matematiske formler med KaTeX
 * 
 * @version 1.0.0
 * 
 * BRUK:
 * 1. Inkluder KaTeX CSS og JS fra CDN
 * 2. Inkluder denne filen
 * 3. Kall FormulaDisplay.render() for å konvertere formler
 */

var FormulaDisplay = (function() {
    'use strict';
    
    var isKaTeXReady = false;
    var pendingRenders = [];
    
    // Formel-mappinger for Corporate Finance
    var formulaMap = {
        // NPV & Time Value
        npv: [
            { 
                name: 'Netto nåverdi (NPV)', 
                latex: 'NPV = \\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t} - I_0',
                description: 'Sum av diskonterte kontantstrømmer minus investering'
            },
            { 
                name: 'Diskonteringsfaktor', 
                latex: 'PVF = \\frac{1}{(1+r)^n}',
                description: 'Nåverdifaktor for enkeltbeløp'
            },
            { 
                name: 'Fremtidig verdi', 
                latex: 'FV = PV \\times (1+r)^n',
                description: 'Sluttverdi av investering'
            },
            { 
                name: 'Nåverdi', 
                latex: 'PV = \\frac{FV}{(1+r)^n}',
                description: 'Dagens verdi av fremtidig beløp'
            },
            { 
                name: 'Internrente (IRR)', 
                latex: '0 = \\sum_{t=0}^{n} \\frac{CF_t}{(1+IRR)^t}',
                description: 'Renten som gir NPV = 0'
            }
        ],
        
        // Bonds
        bonds: [
            { 
                name: 'Obligasjonspris', 
                latex: 'P = \\sum_{t=1}^{n} \\frac{C}{(1+r)^t} + \\frac{FV}{(1+r)^n}',
                description: 'Nåverdi av kuponger + pålydende'
            },
            { 
                name: 'Løpende avkastning', 
                latex: 'CY = \\frac{C}{P}',
                description: 'Årlig kupong delt på pris'
            },
            { 
                name: 'Yield to Maturity', 
                latex: 'P = \\sum_{t=1}^{n} \\frac{C}{(1+YTM)^t} + \\frac{FV}{(1+YTM)^n}',
                description: 'Effektiv rente til forfall'
            },
            { 
                name: 'Duration (Macaulay)', 
                latex: 'D = \\frac{\\sum_{t=1}^{n} t \\times \\frac{CF_t}{(1+y)^t}}{P}',
                description: 'Vektet gjennomsnittlig løpetid'
            }
        ],
        
        // Stocks & Dividends
        stocks: [
            { 
                name: 'Gordon Growth Model', 
                latex: 'P_0 = \\frac{D_1}{r - g}',
                description: 'Aksjeverdi med konstant vekst'
            },
            { 
                name: 'Avkastningskrav fra DDM', 
                latex: 'r = \\frac{D_1}{P_0} + g',
                description: 'Dividenderente + vekst'
            },
            { 
                name: 'Forventet avkastning', 
                latex: 'E(R) = \\sum_{i=1}^{n} p_i \\times R_i',
                description: 'Sannsynlighetsvektet avkastning'
            },
            { 
                name: 'Flerstegsvekst', 
                latex: 'P_0 = \\sum_{t=1}^{T} \\frac{D_t}{(1+r)^t} + \\frac{P_T}{(1+r)^T}',
                description: 'Nåverdi av dividender + terminalverdi'
            }
        ],
        
        // WACC & Capital Structure
        wacc: [
            { 
                name: 'WACC', 
                latex: 'WACC = \\frac{E}{V} \\times r_e + \\frac{D}{V} \\times r_d \\times (1-T_c)',
                description: 'Vektet gjennomsnittlig kapitalkostnad'
            },
            { 
                name: 'CAPM', 
                latex: 'r_e = r_f + \\beta \\times (r_m - r_f)',
                description: 'Avkastningskrav for egenkapital'
            },
            { 
                name: 'Gjeldskostnad etter skatt', 
                latex: 'r_d^{\\text{etter skatt}} = r_d \\times (1 - T_c)',
                description: 'Effektiv rentekostnad'
            },
            { 
                name: 'Skattefordel av gjeld', 
                latex: 'TS = D \\times r_d \\times T_c',
                description: 'Årlig skattebesparelse'
            }
        ],
        
        // Portfolio & Risk
        portfolio: [
            { 
                name: 'Porteføljeavkastning', 
                latex: 'R_p = \\sum_{i=1}^{n} w_i \\times R_i',
                description: 'Vektet snitt av avkastninger'
            },
            { 
                name: 'Porteføljebeta', 
                latex: '\\beta_p = \\sum_{i=1}^{n} w_i \\times \\beta_i',
                description: 'Vektet snitt av betaer'
            },
            { 
                name: 'Varians', 
                latex: '\\sigma^2 = \\sum_{i=1}^{n} p_i \\times (R_i - E(R))^2',
                description: 'Mål på spredning'
            },
            { 
                name: 'Standardavvik', 
                latex: '\\sigma = \\sqrt{\\sigma^2}',
                description: 'Kvadratrot av varians'
            },
            { 
                name: 'Kovarians', 
                latex: 'Cov(R_A, R_B) = \\sum p_i \\times (R_{A,i} - E(R_A)) \\times (R_{B,i} - E(R_B))',
                description: 'Samvariasjon mellom to aktiva'
            },
            { 
                name: 'Sharpe Ratio', 
                latex: 'SR = \\frac{R_p - r_f}{\\sigma_p}',
                description: 'Risikojustert avkastning'
            }
        ],
        
        // Annuities & Loans
        annuity: [
            { 
                name: 'Nåverdi annuitet', 
                latex: 'PV = PMT \\times \\frac{1 - (1+r)^{-n}}{r}',
                description: 'Nåverdi av like betalinger'
            },
            { 
                name: 'Sluttverdi annuitet', 
                latex: 'FV = PMT \\times \\frac{(1+r)^n - 1}{r}',
                description: 'Fremtidig verdi av like betalinger'
            },
            { 
                name: 'Annuitetsbetaling', 
                latex: 'PMT = PV \\times \\frac{r}{1 - (1+r)^{-n}}',
                description: 'Beregn periodisk betaling'
            },
            { 
                name: 'Evig annuitet (Perpetuitet)', 
                latex: 'PV = \\frac{PMT}{r}',
                description: 'Uendelig rekke av betalinger'
            },
            { 
                name: 'Voksende perpetuitet', 
                latex: 'PV = \\frac{PMT}{r - g}',
                description: 'Med konstant vekst g'
            }
        ],
        
        // Forex
        forex: [
            { 
                name: 'Terminpremie', 
                latex: 'FP = \\frac{F - S}{S} \\times 100\\%',
                description: 'Prosentvis avvik fra spot'
            },
            { 
                name: 'Renteparitet', 
                latex: '\\frac{F}{S} = \\frac{1 + r_d}{1 + r_f}',
                description: 'Sammenheng mellom renter og kurs'
            },
            { 
                name: 'Kjøpekraftsparitet', 
                latex: '\\frac{S_1}{S_0} = \\frac{1 + \\pi_d}{1 + \\pi_f}',
                description: 'Inflasjonseffekt på valutakurs'
            }
        ],
        
        // Options
        options: [
            { 
                name: 'Call utbetaling', 
                latex: 'Payoff = \\max(S_T - K, 0)',
                description: 'Verdi ved forfall'
            },
            { 
                name: 'Put utbetaling', 
                latex: 'Payoff = \\max(K - S_T, 0)',
                description: 'Verdi ved forfall'
            },
            { 
                name: 'Put-Call paritet', 
                latex: 'C + Ke^{-rT} = P + S',
                description: 'Sammenheng mellom opsjoner'
            },
            { 
                name: 'Black-Scholes (Call)', 
                latex: 'C = S \\cdot N(d_1) - Ke^{-rT} \\cdot N(d_2)',
                description: 'Opsjonsprising'
            }
        ],
        
        // Grunnleggende (felles)
        grunnleggende: [
            { 
                name: 'Renters rente', 
                latex: 'FV = PV \\times (1 + r)^n',
                description: 'Fremtidig verdi med renters rente'
            },
            { 
                name: 'Diskontering', 
                latex: 'PV = \\frac{FV}{(1 + r)^n}',
                description: 'Nåverdi av fremtidig beløp'
            },
            { 
                name: 'Effektiv rente', 
                latex: 'EAR = \\left(1 + \\frac{r}{m}\\right)^m - 1',
                description: 'Med m perioder per år'
            }
        ]
    };
    
    /**
     * Last KaTeX fra CDN
     */
    function loadKaTeX() {
        return new Promise(function(resolve, reject) {
            if (isKaTeXReady) {
                resolve();
                return;
            }
            
            // Sjekk om allerede lastet
            if (typeof katex !== 'undefined') {
                isKaTeXReady = true;
                resolve();
                return;
            }
            
            // Last CSS
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
            
            // Last JS
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
            script.crossOrigin = 'anonymous';
            script.onload = function() {
                isKaTeXReady = true;
                console.log('[FormulaDisplay] KaTeX loaded');
                
                // Render pending
                pendingRenders.forEach(function(fn) { fn(); });
                pendingRenders = [];
                
                resolve();
            };
            script.onerror = function() {
                console.error('[FormulaDisplay] Failed to load KaTeX');
                reject(new Error('Failed to load KaTeX'));
            };
            document.head.appendChild(script);
        });
    }
    
    /**
     * Render LaTeX til HTML
     */
    function renderLatex(latex, displayMode) {
        if (!isKaTeXReady || typeof katex === 'undefined') {
            return '<span class="formula-fallback">' + escapeHtml(latex) + '</span>';
        }
        
        try {
            return katex.renderToString(latex, {
                displayMode: displayMode !== false,
                throwOnError: false,
                strict: false
            });
        } catch (e) {
            console.warn('[FormulaDisplay] KaTeX error:', e);
            return '<span class="formula-fallback">' + escapeHtml(latex) + '</span>';
        }
    }
    
    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Render formel-liste for et tema
     */
    function renderFormulaList(topicId, containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        
        var formulas = formulaMap[topicId] || formulaMap.grunnleggende;
        
        // Hvis mixed, ta første fra hver kategori
        if (topicId === 'mixed') {
            formulas = [];
            Object.keys(formulaMap).forEach(function(t) {
                if (t !== 'mixed' && t !== 'grunnleggende' && formulaMap[t].length > 0) {
                    formulas.push(formulaMap[t][0]);
                }
            });
        }
        
        var doRender = function() {
            var html = '';
            formulas.forEach(function(f, i) {
                html += '<div class="formula-card" data-index="' + i + '">';
                html += '<div class="formula-card-header">';
                html += '<span class="formula-card-name">' + escapeHtml(f.name) + '</span>';
                html += '<button class="formula-expand-btn" onclick="FormulaDisplay.toggleFormula(this)" title="Vis/skjul">▼</button>';
                html += '</div>';
                html += '<div class="formula-card-body">';
                html += '<div class="formula-latex">' + renderLatex(f.latex) + '</div>';
                html += '<div class="formula-description">' + escapeHtml(f.description) + '</div>';
                html += '</div>';
                html += '</div>';
            });
            container.innerHTML = html;
        };
        
        if (isKaTeXReady) {
            doRender();
        } else {
            loadKaTeX().then(doRender).catch(function() {
                // Fallback uten KaTeX
                var html = '';
                formulas.forEach(function(f) {
                    html += '<div class="formula-card">';
                    html += '<div class="formula-card-header">';
                    html += '<span class="formula-card-name">' + escapeHtml(f.name) + '</span>';
                    html += '</div>';
                    html += '<div class="formula-card-body">';
                    html += '<div class="formula-latex formula-fallback">' + escapeHtml(f.latex) + '</div>';
                    html += '<div class="formula-description">' + escapeHtml(f.description) + '</div>';
                    html += '</div>';
                    html += '</div>';
                });
                container.innerHTML = html;
            });
        }
    }
    
    /**
     * Toggle formel-visning
     */
    function toggleFormula(btn) {
        var card = btn.closest('.formula-card');
        card.classList.toggle('collapsed');
        btn.textContent = card.classList.contains('collapsed') ? '▶' : '▼';
    }
    
    /**
     * Render inline formel i tekst
     */
    function renderInlineFormula(latex) {
        if (!isKaTeXReady) {
            pendingRenders.push(function() {
                // Re-render etter KaTeX er klar
            });
            return '<span class="formula-inline-pending" data-latex="' + escapeHtml(latex) + '">' + escapeHtml(latex) + '</span>';
        }
        
        return renderLatex(latex, false);
    }
    
    /**
     * Render alle ventende inline formler
     */
    function renderPendingFormulas() {
        document.querySelectorAll('.formula-inline-pending').forEach(function(el) {
            var latex = el.dataset.latex;
            el.innerHTML = renderLatex(latex, false);
            el.classList.remove('formula-inline-pending');
            el.classList.add('formula-inline');
        });
    }
    
    /**
     * Konverter gammel formel-format til KaTeX
     */
    function convertLegacyFormula(oldFormula) {
        // Konverter Unicode subscripts/superscripts til LaTeX
        return oldFormula
            .replace(/₀/g, '_0').replace(/₁/g, '_1').replace(/₂/g, '_2')
            .replace(/₃/g, '_3').replace(/₄/g, '_4').replace(/₅/g, '_5')
            .replace(/ₜ/g, '_t').replace(/ₙ/g, '_n').replace(/ᵢ/g, '_i')
            .replace(/⁰/g, '^0').replace(/¹/g, '^1').replace(/²/g, '^2')
            .replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5')
            .replace(/ⁿ/g, '^n').replace(/ᵗ/g, '^t')
            .replace(/⁻/g, '^{-')
            .replace(/Σ/g, '\\sum ')
            .replace(/×/g, '\\times ')
            .replace(/÷/g, '\\div ')
            .replace(/√/g, '\\sqrt{')
            .replace(/≤/g, '\\leq ')
            .replace(/≥/g, '\\geq ')
            .replace(/≠/g, '\\neq ')
            .replace(/π/g, '\\pi ')
            .replace(/β/g, '\\beta ')
            .replace(/σ/g, '\\sigma ')
            .replace(/μ/g, '\\mu ');
    }
    
    /**
     * Hent formler for tema
     */
    function getFormulas(topicId) {
        return formulaMap[topicId] || formulaMap.grunnleggende;
    }
    
    /**
     * Init - last KaTeX
     */
    function init() {
        loadKaTeX().catch(function(e) {
            console.warn('[FormulaDisplay] Running without KaTeX');
        });
    }
    
    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        init: init,
        loadKaTeX: loadKaTeX,
        renderLatex: renderLatex,
        renderFormulaList: renderFormulaList,
        renderInlineFormula: renderInlineFormula,
        renderPendingFormulas: renderPendingFormulas,
        convertLegacyFormula: convertLegacyFormula,
        getFormulas: getFormulas,
        toggleFormula: toggleFormula,
        formulaMap: formulaMap
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormulaDisplay;
}
