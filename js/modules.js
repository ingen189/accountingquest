/**
 * AccountingQuest - Modules
 * All spillogikk for quiz, bokføring, corporate finance, etc.
 * 
 * @version 2.0.0
 */

// ==================== KONTOPLAN ====================

const KONTOPLAN = {
    "1000": "Forskning og utvikling",
    "1200": "Tomter og bygninger",
    "1250": "Maskiner og anlegg",
    "1280": "Kontormaskiner",
    "1400": "Varelager råvarer",
    "1460": "Varelager ferdigvarer",
    "1500": "Kundefordringer",
    "1580": "Avsetning tap på fordringer",
    "1700": "Forskuddsbetalt leie",
    "1720": "Forskuddsbetalt forsikring",
    "1900": "Kontanter",
    "1920": "Bankinnskudd",
    "1950": "Bankinnskudd skattetrekk",
    "2000": "Aksjekapital",
    "2050": "Annen egenkapital",
    "2400": "Leverandørgjeld",
    "2500": "Betalbar skatt",
    "2600": "Skattetrekk",
    "2700": "Utgående merverdiavgift",
    "2710": "Inngående merverdiavgift",
    "2740": "Oppgjørskonto MVA",
    "2770": "Skyldig arbeidsgiveravgift",
    "2780": "Påløpt arbeidsgiveravgift",
    "2930": "Påløpt lønn",
    "2940": "Påløpt feriepenger",
    "3000": "Salgsinntekt, avgiftspliktig",
    "3100": "Salgsinntekt, avgiftsfri",
    "4000": "Innkjøp av råvarer",
    "4300": "Innkjøp varer for videresalg",
    "4360": "Frakt og toll",
    "5000": "Lønn",
    "5180": "Feriepenger",
    "5400": "Arbeidsgiveravgift",
    "6000": "Avskrivning bygninger",
    "6010": "Avskrivning maskiner",
    "6300": "Leie lokaler",
    "6340": "Lys, varme",
    "6800": "Kontorrekvisita",
    "7000": "Bilkostnader",
    "7500": "Forsikringer",
    "7830": "Tap på fordringer",
    "8050": "Renteinntekt",
    "8150": "Rentekostnad",
    "8300": "Betalbar skatt",
    "8800": "Årsresultat"
};

// ==================== FORMLER ====================

const FORMULAS = {
    // Grunnleggende regnskap
    grunnleggende: [
        { name: 'Regnskapslikningen', latex: 'E = EK + G', desc: 'Eiendeler = Egenkapital + Gjeld' },
        { name: 'Balansekrav', latex: '\\sum Debet = \\sum Kredit', desc: 'Alle posteringer må balansere' }
    ],
    bokforing: [
        { name: 'Oppbevaringstid', latex: '5 \\text{ år}', desc: 'Regnskapsmateriale (BOKL § 13)' },
        { name: 'Bilagskrav', latex: '\\text{Dato} + \\text{Beløp} + \\text{Parter}', desc: 'Minstekrav til bilag' }
    ],
    mva: [
        { name: 'Alminnelig MVA', latex: '25\\%', desc: 'Standard sats' },
        { name: 'Mat-MVA', latex: '15\\%', desc: 'Næringsmidler' },
        { name: 'Lav MVA', latex: '12\\%', desc: 'Transport, overnatting' },
        { name: 'MVA-beregning', latex: '\\text{Brutto} = \\text{Netto} \\times 1.25', desc: 'Fra netto til brutto' }
    ],
    skatt: [
        { name: 'Selskapsskatt', latex: '22\\%', desc: 'Skatt på alminnelig inntekt' },
        { name: 'Betalbar skatt', latex: '\\text{Skatt} = \\text{Alm. inntekt} \\times 0.22', desc: 'Skatteberegning' }
    ],
    analyse: [
        { name: 'Likviditetsgrad 1', latex: 'LG_1 = \\frac{OM}{KG}', desc: 'Omløpsmidler / Kortsiktig gjeld' },
        { name: 'Likviditetsgrad 2', latex: 'LG_2 = \\frac{OM - \\text{Varelager}}{KG}', desc: 'Acid test' },
        { name: 'Egenkapitalandel', latex: 'EK\\% = \\frac{EK}{TK} \\times 100', desc: 'Soliditetsmål' },
        { name: 'Totalkapitalrentabilitet', latex: 'TKR = \\frac{DR + FI}{\\bar{TK}} \\times 100', desc: 'Avkastning på total kapital' },
        { name: 'Egenkapitalrentabilitet', latex: 'EKR = \\frac{\\text{Resultat}}{\\bar{EK}} \\times 100', desc: 'Avkastning på egenkapital' }
    ],
    // Corporate Finance
    npv: [
        { name: 'Netto nåverdi', latex: 'NPV = \\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t} - I_0', desc: 'Sum av diskonterte kontantstrømmer' },
        { name: 'Internrente', latex: '0 = \\sum_{t=0}^{n} \\frac{CF_t}{(1+IRR)^t}', desc: 'Renten som gir NPV = 0' },
        { name: 'Diskonteringsfaktor', latex: 'PVF = \\frac{1}{(1+r)^n}', desc: 'Nåverdifaktor' }
    ],
    wacc: [
        { name: 'WACC', latex: 'WACC = \\frac{E}{V} r_e + \\frac{D}{V} r_d (1-T_c)', desc: 'Vektet kapitalkostnad' },
        { name: 'CAPM', latex: 'r_e = r_f + \\beta (r_m - r_f)', desc: 'Avkastningskrav egenkapital' }
    ],
    annuity: [
        { name: 'Nåverdi annuitet', latex: 'PV = PMT \\times \\frac{1-(1+r)^{-n}}{r}', desc: 'Nåverdi av like betalinger' },
        { name: 'Perpetuitet', latex: 'PV = \\frac{PMT}{r}', desc: 'Evig annuitet' }
    ],
    bonds: [
        { name: 'Obligasjonspris', latex: 'P = \\sum_{t=1}^{n} \\frac{C}{(1+r)^t} + \\frac{FV}{(1+r)^n}', desc: 'Nåverdi av kuponger + pålydende' }
    ],
    stocks: [
        { name: 'Gordon Growth', latex: 'P_0 = \\frac{D_1}{r-g}', desc: 'Aksjeverdi med konstant vekst' }
    ],
    portfolio: [
        { name: 'Porteføljeavkastning', latex: 'R_p = \\sum w_i R_i', desc: 'Vektet snitt' },
        { name: 'Sharpe Ratio', latex: 'SR = \\frac{R_p - r_f}{\\sigma_p}', desc: 'Risikojustert avkastning' }
    ]
};

// ==================== TOPICS ====================

const TOPICS = {
    grunnleggende_regnskap: [
        { id: 'grunnleggende', name: 'Grunnleggende regnskap', icon: '📖' },
        { id: 'bokforing', name: 'Bokføring', icon: '📝' },
        { id: 'mva', name: 'Merverdiavgift', icon: '💰' },
        { id: 'skatt', name: 'Skatt', icon: '🏛️' },
        { id: 'arsavslutning', name: 'Årsavslutning', icon: '📅' },
        { id: 'analyse', name: 'Regnskapsanalyse', icon: '📊' },
        { id: 'driftsregnskap', name: 'Driftsregnskap', icon: '🏭' },
        { id: 'lonn', name: 'Lønn', icon: '💵' },
        { id: 'mixed', name: 'Blandet Quiz', icon: '🎲' }
    ],
    corporate_finance: [
        { id: 'npv', name: 'NPV & Tidsverdi', icon: '💰' },
        { id: 'bonds', name: 'Obligasjoner', icon: '📜' },
        { id: 'stocks', name: 'Aksjer & Dividende', icon: '📈' },
        { id: 'wacc', name: 'WACC & Kapitalstruktur', icon: '⚖️' },
        { id: 'portfolio', name: 'Portefølje & Risiko', icon: '📊' },
        { id: 'annuity', name: 'Annuiteter & Lån', icon: '🏦' },
        { id: 'forex', name: 'Valuta', icon: '💱' },
        { id: 'options', name: 'Opsjoner', icon: '📋' },
        { id: 'mixed', name: 'Blandet', icon: '🎲' }
    ]
};

// ==================== BASE MODULE CLASS ====================

class BaseModule {
    constructor(moduleId) {
        this.moduleId = moduleId;
        this.state = {
            questions: [],
            currentIndex: 0,
            currentQuestion: null,
            score: 0,
            correctCount: 0,
            answered: [],
            topic: null,
            difficulty: 'all'
        };
    }
    
    async loadQuestions(topic, limit = 10) {
        try {
            const filters = topic && topic !== 'mixed' ? { topic } : {};
            const data = await AQ.Questions.random(this.moduleId, limit, filters);
            this.state.questions = data.questions || [];
            this.state.topic = topic;
            this.state.currentIndex = 0;
            this.state.answered = [];
            this.state.score = 0;
            this.state.correctCount = 0;
            return this.state.questions;
        } catch (err) {
            console.error('Failed to load questions:', err);
            return [];
        }
    }
    
    getCurrentQuestion() {
        return this.state.questions[this.state.currentIndex] || null;
    }
    
    nextQuestion() {
        if (this.state.currentIndex < this.state.questions.length - 1) {
            this.state.currentIndex++;
            return this.getCurrentQuestion();
        }
        return null;
    }
    
    prevQuestion() {
        if (this.state.currentIndex > 0) {
            this.state.currentIndex--;
            return this.getCurrentQuestion();
        }
        return null;
    }
    
    recordAnswer(isCorrect, points = 10) {
        this.state.answered[this.state.currentIndex] = true;
        if (isCorrect) {
            this.state.correctCount++;
            this.state.score += points;
        }
    }
    
    getProgress() {
        return {
            current: this.state.currentIndex + 1,
            total: this.state.questions.length,
            answered: this.state.answered.filter(Boolean).length,
            correct: this.state.correctCount,
            score: this.state.score,
            percentage: Math.round((this.state.answered.filter(Boolean).length / this.state.questions.length) * 100)
        };
    }
    
    saveProgress() {
        const userId = AQ.User.getId();
        AQ.Progress.save(userId, this.moduleId, {
            score: this.state.score,
            correctCount: this.state.correctCount,
            totalAnswered: this.state.answered.filter(Boolean).length,
            lastTopic: this.state.topic,
            timestamp: Date.now()
        });
        // Også lokal backup
        AQ.Progress.saveLocal(this.moduleId, this.state);
    }
}

// ==================== GRUNNLEGGENDE REGNSKAP MODULE ====================

const GrunnleggendeRegnskapModule = {
    base: new BaseModule('grunnleggende_regnskap'),
    
    async init() {
        this.renderTopics();
        await this.loadCounts();
    },
    
    renderTopics() {
        const container = document.getElementById('topic-list');
        if (!container) return;
        
        container.innerHTML = TOPICS.grunnleggende_regnskap.map(t => `
            <button class="topic-btn" data-topic="${t.id}" onclick="GrunnleggendeRegnskapModule.selectTopic('${t.id}')">
                <span class="topic-icon">${t.icon}</span>
                <span class="topic-name">${t.name}</span>
                <span class="topic-count" id="count-${t.id}">-</span>
            </button>
        `).join('');
    },
    
    async loadCounts() {
        try {
            const data = await AQ.Questions.counts('grunnleggende_regnskap');
            if (data.byTopic) {
                Object.entries(data.byTopic).forEach(([topic, count]) => {
                    const el = document.getElementById(`count-${topic}`);
                    if (el) el.textContent = count;
                });
            }
        } catch (err) {
            console.warn('Could not load counts:', err);
        }
    },
    
    async selectTopic(topicId) {
        // Update UI
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.topic === topicId);
        });
        
        // Load questions
        await this.base.loadQuestions(topicId);
        
        if (this.base.state.questions.length === 0) {
            this.showNoQuestions();
            return;
        }
        
        this.renderQuestionSelector();
        this.loadQuestion(0);
        this.renderFormulas(topicId);
        
        // Show accounts for bokføring
        if (topicId === 'bokforing') {
            this.renderAccountList();
        }
    },
    
    renderQuestionSelector() {
        const container = document.getElementById('question-selector');
        if (!container) return;
        
        const progress = this.base.getProgress();
        container.innerHTML = this.base.state.questions.map((q, i) => {
            let cls = 'q-btn';
            if (i === this.base.state.currentIndex) cls += ' current';
            if (this.base.state.answered[i]) cls += ' answered';
            return `<button class="${cls}" onclick="GrunnleggendeRegnskapModule.loadQuestion(${i})">${i + 1}</button>`;
        }).join('');
        
        // Update progress bar
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.style.width = progress.percentage + '%';
            progressBar.textContent = progress.percentage + '%';
        }
        
        // Update header stats
        this.updateStats();
    },
    
    updateStats() {
        const progress = this.base.getProgress();
        const el = document.getElementById('q-progress');
        if (el) el.textContent = `${progress.current}/${progress.total}`;
        const scoreEl = document.getElementById('q-score');
        if (scoreEl) scoreEl.textContent = progress.score;
    },
    
    loadQuestion(index) {
        this.base.state.currentIndex = index;
        const q = this.base.getCurrentQuestion();
        if (!q) return;
        
        this.base.state.currentQuestion = q;
        this.renderQuestion(q);
        this.renderQuestionSelector();
    },
    
    renderQuestion(q) {
        const workspace = document.getElementById('workspace');
        if (!workspace) return;
        
        const type = q.type || 'multiple_choice';
        
        workspace.innerHTML = `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-num">Spørsmål ${this.base.state.currentIndex + 1}</span>
                    <div class="question-badges">
                        ${q.topic ? `<span class="badge badge-topic">${q.topic}</span>` : ''}
                        ${q.difficulty ? `<span class="badge badge-diff">${q.difficulty}</span>` : ''}
                    </div>
                </div>
                <div class="question-text">${q.question || q.title}</div>
                ${q.data ? this.renderData(q.data) : ''}
            </div>
            
            <div id="answer-area">
                ${this.renderAnswerArea(q, type)}
            </div>
            
            <div class="controls">
                <button class="btn" id="btn-check" onclick="GrunnleggendeRegnskapModule.checkAnswer()">Sjekk svar</button>
                <button class="btn btn-secondary" onclick="GrunnleggendeRegnskapModule.showHint()">💡 Hint</button>
                <button class="btn btn-primary" id="btn-next" onclick="GrunnleggendeRegnskapModule.nextQuestion()" style="display:none;">Neste →</button>
            </div>
            
            <div id="feedback-area" style="display:none;"></div>
        `;
        
        // Setup special features
        if (type === 'excel_entry' || type === 'journal_entry' || q.grid) {
            setTimeout(() => this.setupExcelGrid(q), 100);
        }
    },
    
    renderData(data) {
        if (!data || typeof data !== 'object') return '';
        
        const rows = Object.entries(data)
            .filter(([k, v]) => typeof v !== 'object')
            .map(([k, v]) => `
                <tr>
                    <td class="data-label">${this.formatLabel(k)}</td>
                    <td class="data-value">${this.formatNumber(v)}</td>
                </tr>
            `).join('');
        
        return `
            <div class="data-table-container">
                <h4>📊 Oppgavedata</h4>
                <table class="data-table">
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    },
    
    renderAnswerArea(q, type) {
        switch (type) {
            case 'multiple_choice':
            case 'mc':
                return this.renderMultipleChoice(q);
            case 'true_false':
            case 'tf':
                return this.renderTrueFalse(q);
            case 'calculation':
            case 'fill_blank':
                return this.renderCalculation(q);
            case 'excel_entry':
            case 'journal_entry':
                return this.renderExcelGrid(q);
            case 'drag_drop':
                return this.renderDragDrop(q);
            default:
                return this.renderMultipleChoice(q);
        }
    },
    
    renderMultipleChoice(q) {
        const options = q.options || q.data?.options || [];
        return `
            <div class="options-container">
                ${options.map((opt, i) => {
                    const text = typeof opt === 'string' ? opt : opt.text;
                    return `
                        <div class="option-item" data-index="${i}" onclick="GrunnleggendeRegnskapModule.selectOption(this, ${i})">
                            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="option-text">${text}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    renderTrueFalse(q) {
        return `
            <div class="tf-container">
                <button class="tf-btn" data-value="true" onclick="GrunnleggendeRegnskapModule.selectTF(this, true)">
                    ✓ Sant
                </button>
                <button class="tf-btn" data-value="false" onclick="GrunnleggendeRegnskapModule.selectTF(this, false)">
                    ✗ Usant
                </button>
            </div>
        `;
    },
    
    renderCalculation(q) {
        const fields = q.input_fields || [{ id: 'answer', label: 'Svar' }];
        return `
            <div class="calc-container">
                ${fields.map(f => `
                    <div class="calc-field">
                        <label for="input-${f.id}">${f.label || f.id}</label>
                        <input type="number" id="input-${f.id}" class="calc-input" placeholder="Skriv svar...">
                        ${f.unit ? `<span class="calc-unit">${f.unit}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    renderExcelGrid(q) {
        const grid = q.grid || q.excel_grid;
        const isTKonto = this.isTKontoQuestion(q);
        
        if (isTKonto) {
            return this.renderTKontoGrid(q, grid);
        } else if (grid && grid.rows) {
            return this.renderParameterGrid(q, grid);
        } else {
            return this.renderCalculation(q);
        }
    },
    
    isTKontoQuestion(q) {
        const topic = (q.topic || '').toLowerCase();
        const title = (q.title || '').toLowerCase();
        const question = (q.question || '').toLowerCase();
        
        return (
            topic === 'bokforing' ||
            topic === 'journal' ||
            title.includes('bokfør') ||
            title.includes('journalfør') ||
            question.includes('bokfør')
        );
    },
    
    renderTKontoGrid(q, grid) {
        const rows = grid?.rows || [
            { cells: [{ type: 'account', editable: true }, { type: 'number', editable: true }, { type: 'number', editable: true }] },
            { cells: [{ type: 'account', editable: true }, { type: 'number', editable: true }, { type: 'number', editable: true }] }
        ];
        
        return `
            <div class="excel-grid-container" id="excel-grid-container">
                <div class="excel-header-row">
                    <span class="excel-title">📊 T-konto</span>
                    <span class="excel-hint">Dra kontoer fra listen eller skriv direkte</span>
                </div>
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th style="width:40px">#</th>
                            <th>Konto</th>
                            <th>Debet</th>
                            <th>Kredit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map((row, ri) => `
                            <tr>
                                <td class="row-num">${ri + 1}</td>
                                ${(row.cells || []).map((cell, ci) => {
                                    const type = cell.type || 'text';
                                    const editable = cell.editable !== false;
                                    if (!editable) {
                                        return `<td><input class="excel-cell readonly" value="${cell.value || ''}" readonly></td>`;
                                    }
                                    if (type === 'account') {
                                        return `<td><input class="excel-cell account-input" data-row="${ri}" data-col="${ci}" placeholder="Konto"></td>`;
                                    }
                                    return `<td><input class="excel-cell number-input" data-row="${ri}" data-col="${ci}" type="number" inputmode="numeric"></td>`;
                                }).join('')}
                            </tr>
                        `).join('')}
                        <tr class="sum-row">
                            <td>Σ</td>
                            <td></td>
                            <td><input class="excel-cell readonly sum-debet" value="0" readonly></td>
                            <td><input class="excel-cell readonly sum-kredit" value="0" readonly></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },
    
    renderParameterGrid(q, grid) {
        return `
            <div class="excel-grid-container">
                <table class="excel-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Parameter</th>
                            <th>Verdi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${grid.rows.map((row, ri) => {
                            const label = row.label || row.cells?.[0]?.value || `Rad ${ri + 1}`;
                            const valueCell = row.cells?.[1] || row.cells?.[0] || {};
                            const editable = valueCell.editable === true;
                            
                            return `
                                <tr>
                                    <td class="row-num">${ri + 1}</td>
                                    <td><input class="excel-cell readonly" value="${label}" readonly></td>
                                    <td>
                                        ${editable 
                                            ? `<input class="excel-cell" data-row="${ri}" data-answer="${valueCell.answer || ''}" placeholder="?">`
                                            : `<input class="excel-cell readonly" value="${valueCell.value || ''}" readonly>`
                                        }
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    renderDragDrop(q) {
        const items = q.items || [];
        const categories = q.categories || [];
        
        return `
            <div class="dnd-container">
                <div class="dnd-source" id="dnd-items">
                    ${items.map((item, i) => `
                        <div class="dnd-item" draggable="true" data-index="${i}" data-category="${item.category}">
                            ${item.text}
                        </div>
                    `).join('')}
                </div>
                <div class="dnd-targets">
                    ${categories.map(cat => `
                        <div class="dnd-target" data-category="${cat}">
                            <div class="dnd-target-title">${cat}</div>
                            <div class="dnd-target-items"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    setupExcelGrid(q) {
        // Setup account input autocomplete
        document.querySelectorAll('.account-input').forEach(input => {
            input.addEventListener('input', (e) => this.handleAccountInput(e));
            input.addEventListener('blur', (e) => this.validateAccount(e));
        });
        
        // Setup number inputs for sum calculation
        document.querySelectorAll('.number-input').forEach(input => {
            input.addEventListener('input', () => this.updateSums());
        });
        
        // Setup drag & drop for accounts
        this.setupAccountDragDrop();
    },
    
    handleAccountInput(e) {
        const input = e.target;
        const value = input.value.trim();
        
        // Show autocomplete suggestions
        const matches = Object.entries(KONTOPLAN)
            .filter(([code, name]) => 
                code.startsWith(value) || 
                name.toLowerCase().includes(value.toLowerCase())
            )
            .slice(0, 5);
        
        // Could show dropdown here
    },
    
    validateAccount(e) {
        const input = e.target;
        const code = input.value.trim();
        
        if (code && KONTOPLAN[code]) {
            input.classList.remove('invalid');
            input.title = KONTOPLAN[code];
        } else if (code) {
            input.classList.add('invalid');
        }
    },
    
    updateSums() {
        let sumDebet = 0;
        let sumKredit = 0;
        
        document.querySelectorAll('.number-input').forEach(input => {
            const col = parseInt(input.dataset.col);
            const val = parseFloat(input.value) || 0;
            
            if (col === 1) sumDebet += val;
            else if (col === 2) sumKredit += val;
        });
        
        const debetEl = document.querySelector('.sum-debet');
        const kreditEl = document.querySelector('.sum-kredit');
        
        if (debetEl) debetEl.value = this.formatNumber(sumDebet);
        if (kreditEl) kreditEl.value = this.formatNumber(sumKredit);
        
        // Check balance
        const balanced = Math.abs(sumDebet - sumKredit) < 0.01;
        if (debetEl) debetEl.classList.toggle('balanced', balanced && sumDebet > 0);
        if (kreditEl) kreditEl.classList.toggle('balanced', balanced && sumKredit > 0);
    },
    
    setupAccountDragDrop() {
        // Touch support for drag and drop
        document.querySelectorAll('.account-item').forEach(item => {
            item.setAttribute('draggable', 'true');
            
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.code);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
        
        document.querySelectorAll('.account-input').forEach(input => {
            input.addEventListener('dragover', (e) => {
                e.preventDefault();
                input.classList.add('drag-over');
            });
            
            input.addEventListener('dragleave', () => {
                input.classList.remove('drag-over');
            });
            
            input.addEventListener('drop', (e) => {
                e.preventDefault();
                const code = e.dataTransfer.getData('text/plain');
                input.value = code;
                input.classList.remove('drag-over');
                this.validateAccount({ target: input });
            });
        });
    },
    
    renderAccountList() {
        const container = document.getElementById('account-list');
        if (!container) return;
        
        // Group by account class
        const groups = {};
        Object.entries(KONTOPLAN).forEach(([code, name]) => {
            const cls = code.charAt(0);
            if (!groups[cls]) groups[cls] = [];
            groups[cls].push({ code, name });
        });
        
        const classNames = {
            '1': 'Eiendeler',
            '2': 'EK & Gjeld',
            '3': 'Inntekter',
            '4': 'Varekost',
            '5': 'Lønn',
            '6': 'Andre kostn.',
            '7': 'Andre kostn.',
            '8': 'Finans'
        };
        
        container.innerHTML = Object.entries(groups).map(([cls, accounts]) => `
            <div class="account-group">
                <div class="account-group-title">${classNames[cls] || `Klasse ${cls}`}</div>
                <div class="account-group-items">
                    ${accounts.map(a => `
                        <div class="account-item" draggable="true" data-code="${a.code}" title="${a.name}">
                            ${a.code}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        this.setupAccountDragDrop();
    },
    
    renderFormulas(topicId) {
        const container = document.getElementById('formula-list');
        if (!container) return;
        
        const formulas = FORMULAS[topicId] || FORMULAS.grunnleggende || [];
        
        container.innerHTML = formulas.map(f => `
            <div class="formula-card">
                <div class="formula-card-header">
                    <span class="formula-card-name">${f.name}</span>
                </div>
                <div class="formula-card-body">
                    <div class="formula-latex" id="formula-${f.name.replace(/\s/g, '-')}"></div>
                    <div class="formula-description">${f.desc}</div>
                </div>
            </div>
        `).join('');
        
        // Render KaTeX if available
        if (typeof katex !== 'undefined') {
            formulas.forEach(f => {
                const el = document.getElementById(`formula-${f.name.replace(/\s/g, '-')}`);
                if (el) {
                    try {
                        katex.render(f.latex, el, { displayMode: true, throwOnError: false });
                    } catch (e) {
                        el.textContent = f.latex;
                    }
                }
            });
        }
    },
    
    selectOption(el, index) {
        document.querySelectorAll('.option-item').forEach(opt => opt.classList.remove('selected'));
        el.classList.add('selected');
        this.base.state.selectedAnswer = index;
    },
    
    selectTF(el, value) {
        document.querySelectorAll('.tf-btn').forEach(btn => btn.classList.remove('selected'));
        el.classList.add('selected');
        this.base.state.tfAnswer = value;
    },
    
    checkAnswer() {
        const q = this.base.getCurrentQuestion();
        if (!q) return;
        
        const type = q.type || 'multiple_choice';
        let isCorrect = false;
        let userAnswer = null;
        
        switch (type) {
            case 'multiple_choice':
            case 'mc':
                userAnswer = this.base.state.selectedAnswer;
                isCorrect = this.checkMultipleChoice(q, userAnswer);
                break;
            case 'true_false':
            case 'tf':
                userAnswer = this.base.state.tfAnswer;
                isCorrect = this.checkTrueFalse(q, userAnswer);
                break;
            case 'calculation':
            case 'fill_blank':
                userAnswer = this.getCalculationAnswers(q);
                isCorrect = this.checkCalculation(q, userAnswer);
                break;
            case 'excel_entry':
            case 'journal_entry':
                userAnswer = this.getExcelAnswers(q);
                isCorrect = this.checkExcelEntry(q, userAnswer);
                break;
        }
        
        this.base.recordAnswer(isCorrect);
        this.showFeedback(isCorrect, q);
        this.base.saveProgress();
    },
    
    checkMultipleChoice(q, answer) {
        if (answer === null) return false;
        const options = q.options || [];
        const correct = options.findIndex(opt => 
            (typeof opt === 'object' && opt.correct) || 
            opt === q.correct_answer
        );
        return answer === correct || answer === q.correct;
    },
    
    checkTrueFalse(q, answer) {
        if (answer === null) return false;
        const correct = q.correct === true || q.correct === 'true' || q.correct_answer === true;
        return answer === correct;
    },
    
    checkCalculation(q, answers) {
        const fields = q.input_fields || [{ id: 'answer' }];
        let allCorrect = true;
        
        fields.forEach(field => {
            const userVal = answers[field.id];
            const correctVal = field.answer || q.correct || q.correct_answer;
            
            if (!this.compareNumbers(userVal, correctVal, field.tolerance)) {
                allCorrect = false;
            }
        });
        
        return allCorrect;
    },
    
    checkExcelEntry(q, answers) {
        // Check T-konto entries
        const solution = q.solution || q.correct_answer || {};
        
        if (solution.postings) {
            // Check each posting
            return solution.postings.every((posting, i) => {
                const row = answers.rows?.[i];
                if (!row) return false;
                
                const accountMatch = row.account === posting.account || 
                    KONTOPLAN[row.account] === posting.accountName;
                const debetMatch = this.compareNumbers(row.debet, posting.debet);
                const kreditMatch = this.compareNumbers(row.kredit, posting.kredit);
                
                return accountMatch && debetMatch && kreditMatch;
            });
        }
        
        // Check balance
        const balanced = Math.abs(answers.sumDebet - answers.sumKredit) < 0.01;
        return balanced && answers.sumDebet > 0;
    },
    
    getCalculationAnswers(q) {
        const fields = q.input_fields || [{ id: 'answer' }];
        const answers = {};
        
        fields.forEach(field => {
            const input = document.getElementById(`input-${field.id}`);
            answers[field.id] = input ? parseFloat(input.value) || 0 : 0;
        });
        
        return answers;
    },
    
    getExcelAnswers(q) {
        const rows = [];
        let sumDebet = 0;
        let sumKredit = 0;
        
        document.querySelectorAll('.excel-table tbody tr:not(.sum-row)').forEach(tr => {
            const account = tr.querySelector('.account-input')?.value || '';
            const debet = parseFloat(tr.querySelector('.number-input[data-col="1"]')?.value) || 0;
            const kredit = parseFloat(tr.querySelector('.number-input[data-col="2"]')?.value) || 0;
            
            rows.push({ account, debet, kredit });
            sumDebet += debet;
            sumKredit += kredit;
        });
        
        return { rows, sumDebet, sumKredit };
    },
    
    compareNumbers(a, b, tolerance = 0.01) {
        const numA = parseFloat(a) || 0;
        const numB = parseFloat(b) || 0;
        return Math.abs(numA - numB) <= tolerance;
    },
    
    showFeedback(isCorrect, q) {
        const feedbackArea = document.getElementById('feedback-area');
        if (!feedbackArea) return;
        
        feedbackArea.style.display = 'block';
        feedbackArea.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        feedbackArea.innerHTML = `
            <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
            <div class="feedback-text">${isCorrect ? 'Riktig!' : 'Feil!'}</div>
            ${q.explanation ? `<div class="feedback-explanation">${q.explanation}</div>` : ''}
        `;
        
        // Show correct answer if wrong
        if (!isCorrect && q.correct_answer) {
            feedbackArea.innerHTML += `
                <div class="feedback-answer">Riktig svar: ${q.correct_answer}</div>
            `;
        }
        
        // Update UI
        document.getElementById('btn-check').style.display = 'none';
        document.getElementById('btn-next').style.display = 'inline-flex';
        
        // Mark options
        if (q.type === 'multiple_choice' || q.type === 'mc') {
            this.markCorrectOption(q);
        }
        
        this.renderQuestionSelector();
    },
    
    markCorrectOption(q) {
        const options = q.options || [];
        const correctIndex = options.findIndex(opt => 
            (typeof opt === 'object' && opt.correct) || 
            opt === q.correct_answer
        ) || q.correct;
        
        document.querySelectorAll('.option-item').forEach((opt, i) => {
            if (i === correctIndex) {
                opt.classList.add('correct');
            } else if (opt.classList.contains('selected')) {
                opt.classList.add('incorrect');
            }
        });
    },
    
    showHint() {
        const q = this.base.getCurrentQuestion();
        if (!q || !q.hint) {
            alert('Ingen hint tilgjengelig for dette spørsmålet.');
            return;
        }
        
        alert('💡 Hint: ' + q.hint);
    },
    
    nextQuestion() {
        const next = this.base.nextQuestion();
        if (next) {
            this.loadQuestion(this.base.state.currentIndex);
        } else {
            this.showResults();
        }
    },
    
    showResults() {
        const progress = this.base.getProgress();
        const workspace = document.getElementById('workspace');
        
        workspace.innerHTML = `
            <div class="results-card">
                <h2>🎉 Gratulerer!</h2>
                <p>Du har fullført alle spørsmålene.</p>
                
                <div class="results-stats">
                    <div class="stat">
                        <div class="stat-value">${progress.correct}/${progress.total}</div>
                        <div class="stat-label">Riktige</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${progress.score}</div>
                        <div class="stat-label">Poeng</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${Math.round((progress.correct / progress.total) * 100)}%</div>
                        <div class="stat-label">Prosent</div>
                    </div>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary" onclick="GrunnleggendeRegnskapModule.restart()">Prøv igjen</button>
                    <button class="btn" onclick="App.navigate('')">Tilbake til meny</button>
                </div>
            </div>
        `;
    },
    
    restart() {
        this.selectTopic(this.base.state.topic || 'grunnleggende');
    },
    
    showNoQuestions() {
        const workspace = document.getElementById('workspace');
        workspace.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>Ingen spørsmål funnet</h3>
                <p>Det er ingen spørsmål tilgjengelig for dette temaet ennå.</p>
                <button class="btn" onclick="App.navigate('')">Tilbake</button>
            </div>
        `;
    },
    
    formatLabel(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    },
    
    formatNumber(val) {
        if (typeof val === 'number') {
            return new Intl.NumberFormat('nb-NO').format(val);
        }
        return val;
    }
};

// ==================== CORPORATE FINANCE MODULE ====================

const CorporateFinanceModule = {
    base: new BaseModule('corporate_finance'),
    
    async init() {
        this.renderTopics();
        await this.loadCounts();
    },
    
    renderTopics() {
        const container = document.getElementById('topic-list');
        if (!container) return;
        
        container.innerHTML = TOPICS.corporate_finance.map(t => `
            <button class="topic-btn" data-topic="${t.id}" onclick="CorporateFinanceModule.selectTopic('${t.id}')">
                <span class="topic-icon">${t.icon}</span>
                <span class="topic-name">${t.name}</span>
                <span class="topic-count" id="cf-count-${t.id}">-</span>
            </button>
        `).join('');
    },
    
    async loadCounts() {
        try {
            const data = await AQ.Questions.counts('corporate_finance');
            if (data.byTopic) {
                Object.entries(data.byTopic).forEach(([topic, count]) => {
                    const el = document.getElementById(`cf-count-${topic}`);
                    if (el) el.textContent = count;
                });
            }
        } catch (err) {
            console.warn('Could not load counts:', err);
        }
    },
    
    async selectTopic(topicId) {
        document.querySelectorAll('.topic-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.topic === topicId);
        });
        
        await this.base.loadQuestions(topicId);
        
        if (this.base.state.questions.length === 0) {
            this.showNoQuestions();
            return;
        }
        
        this.renderQuestionSelector();
        this.loadQuestion(0);
        this.renderFormulas(topicId);
    },
    
    // Reuse many methods from GrunnleggendeRegnskapModule
    renderQuestionSelector: GrunnleggendeRegnskapModule.renderQuestionSelector,
    updateStats: GrunnleggendeRegnskapModule.updateStats,
    loadQuestion: GrunnleggendeRegnskapModule.loadQuestion,
    renderQuestion: GrunnleggendeRegnskapModule.renderQuestion,
    renderData: GrunnleggendeRegnskapModule.renderData,
    renderAnswerArea: GrunnleggendeRegnskapModule.renderAnswerArea,
    renderMultipleChoice: GrunnleggendeRegnskapModule.renderMultipleChoice,
    renderTrueFalse: GrunnleggendeRegnskapModule.renderTrueFalse,
    renderCalculation: GrunnleggendeRegnskapModule.renderCalculation,
    selectOption: GrunnleggendeRegnskapModule.selectOption,
    selectTF: GrunnleggendeRegnskapModule.selectTF,
    checkAnswer: GrunnleggendeRegnskapModule.checkAnswer,
    checkMultipleChoice: GrunnleggendeRegnskapModule.checkMultipleChoice,
    checkTrueFalse: GrunnleggendeRegnskapModule.checkTrueFalse,
    checkCalculation: GrunnleggendeRegnskapModule.checkCalculation,
    getCalculationAnswers: GrunnleggendeRegnskapModule.getCalculationAnswers,
    compareNumbers: GrunnleggendeRegnskapModule.compareNumbers,
    showFeedback: GrunnleggendeRegnskapModule.showFeedback,
    markCorrectOption: GrunnleggendeRegnskapModule.markCorrectOption,
    showHint: GrunnleggendeRegnskapModule.showHint,
    nextQuestion: GrunnleggendeRegnskapModule.nextQuestion,
    showResults: GrunnleggendeRegnskapModule.showResults,
    showNoQuestions: GrunnleggendeRegnskapModule.showNoQuestions,
    formatLabel: GrunnleggendeRegnskapModule.formatLabel,
    formatNumber: GrunnleggendeRegnskapModule.formatNumber,
    
    renderFormulas(topicId) {
        const container = document.getElementById('formula-list');
        if (!container) return;
        
        const formulas = FORMULAS[topicId] || FORMULAS.npv || [];
        
        container.innerHTML = formulas.map(f => `
            <div class="formula-card">
                <div class="formula-card-header">
                    <span class="formula-card-name">${f.name}</span>
                </div>
                <div class="formula-card-body">
                    <div class="formula-latex" id="cf-formula-${f.name.replace(/\s/g, '-')}"></div>
                    <div class="formula-description">${f.desc}</div>
                </div>
            </div>
        `).join('');
        
        if (typeof katex !== 'undefined') {
            formulas.forEach(f => {
                const el = document.getElementById(`cf-formula-${f.name.replace(/\s/g, '-')}`);
                if (el) {
                    try {
                        katex.render(f.latex, el, { displayMode: true, throwOnError: false });
                    } catch (e) {
                        el.textContent = f.latex;
                    }
                }
            });
        }
    },
    
    restart() {
        this.selectTopic(this.base.state.topic || 'npv');
    }
};

// ==================== EXPORTS ====================

window.GrunnleggendeRegnskapModule = GrunnleggendeRegnskapModule;
window.CorporateFinanceModule = CorporateFinanceModule;
window.KONTOPLAN = KONTOPLAN;
window.FORMULAS = FORMULAS;
window.TOPICS = TOPICS;

console.log('✅ Modules loaded');
