/**
 * 📖 WikiPopup v2 - Kontekst-bevisst wiki med header-integrasjon
 * 
 * FEATURES:
 * - Global header-knapp som fungerer på alle sider
 * - Automatisk kontekst-deteksjon basert på nåværende oppgave
 * - Smart søk med relevante forslag
 * - Keyboard shortcuts (Ctrl+K for søk, Escape for lukk)
 * 
 * BRUK:
 * 1. Inkluder denne filen i head: <script src="js/wiki-popup.js"></script>
 * 2. Kall WikiPopup.addHeaderButton() etter DOM er klar
 * 3. Oppdater kontekst når oppgave endres: WikiPopup.updateContext({ ... })
 */

const WikiPopup = {
    // ===== STATE =====
    isOpen: false,
    isInitialized: false,
    
    currentContext: {
        module: null,        // 'quiz', 'bokforing', 'analyse', etc.
        topic: null,         // 'mva', 'avskrivning', etc.
        difficulty: null,    // 'easy', 'medium', 'hard'
        questionId: null,    // Spesifikk oppgave-ID
        tags: [],            // ['mva', 'fradrag', 'inngående']
        lawRefs: [],         // ['MVAL § 8-1', 'RSKL § 3-2']
        accounts: []         // ['2700', '2710', '1920']
    },
    
    // Cache
    cachedArticles: [],
    searchIndex: null,
    
    // Firebase ref
    db: null,
    
    // ===== INITIALIZATION =====
    init() {
        if (this.isInitialized) return;
        
        // Check for Firebase
        if (typeof firebase !== 'undefined' && firebase.database) {
            this.db = firebase.database();
        }
        
        // Create popup if not exists
        if (!document.getElementById('wiki-popup-container')) {
            this.createPopupHTML();
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+K or Cmd+K to open wiki search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
            }
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        this.isInitialized = true;
        console.log('📖 WikiPopup v2 initialized');
    },
    
    // ===== ADD HEADER BUTTON =====
    /**
     * Legger til wiki-knapp i header
     * @param {string} selector - CSS selector for header (default: '.header')
     * @param {string} position - 'left', 'right', eller 'auto' (default: 'auto')
     */
    addHeaderButton(selector = '.header', position = 'auto') {
        this.init();
        
        const header = document.querySelector(selector);
        if (!header) {
            console.warn('WikiPopup: Header not found with selector:', selector);
            return;
        }
        
        // Remove existing button if any
        const existing = header.querySelector('.wiki-header-btn');
        if (existing) existing.remove();
        
        // Create button
        const btn = document.createElement('button');
        btn.className = 'wiki-header-btn';
        btn.innerHTML = `
            <span class="wiki-btn-icon">📖</span>
            <span class="wiki-btn-text">Wiki</span>
            <span class="wiki-btn-shortcut">Ctrl+K</span>
        `;
        btn.onclick = () => this.open();
        btn.title = 'Åpne Regnskapswiki (Ctrl+K)';
        
        // Find insertion point
        if (position === 'left') {
            const leftSection = header.querySelector('.header-left') || header;
            leftSection.appendChild(btn);
        } else if (position === 'right') {
            const rightSection = header.querySelector('.header-right, .header-stats') || header;
            rightSection.insertBefore(btn, rightSection.firstChild);
        } else {
            // Auto: Try to find a good spot
            const headerLeft = header.querySelector('.header-left');
            const modeSelector = header.querySelector('.mode-selector');
            
            if (headerLeft && modeSelector) {
                headerLeft.insertBefore(btn, modeSelector);
            } else if (headerLeft) {
                headerLeft.appendChild(btn);
            } else {
                header.appendChild(btn);
            }
        }
        
        // Add button styles
        this.addHeaderButtonStyles();
    },
    
    // ===== HEADER BUTTON STYLES =====
    addHeaderButtonStyles() {
        if (document.getElementById('wiki-header-btn-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wiki-header-btn-styles';
        style.textContent = `
            .wiki-header-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                font-size: 0.95em;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
                position: relative;
                overflow: hidden;
            }
            
            .wiki-header-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                transition: left 0.5s;
            }
            
            .wiki-header-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            }
            
            .wiki-header-btn:hover::before {
                left: 100%;
            }
            
            .wiki-header-btn:active {
                transform: translateY(0);
            }
            
            .wiki-btn-icon {
                font-size: 1.2em;
            }
            
            .wiki-btn-shortcut {
                background: rgba(0,0,0,0.2);
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 0.75em;
                font-weight: 500;
                opacity: 0.8;
            }
            
            /* Context indicator dot */
            .wiki-header-btn.has-context::after {
                content: '';
                position: absolute;
                top: 6px;
                right: 6px;
                width: 8px;
                height: 8px;
                background: #22c55e;
                border-radius: 50%;
                animation: wiki-pulse 2s infinite;
            }
            
            @keyframes wiki-pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.6; transform: scale(1.2); }
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                .wiki-header-btn {
                    padding: 8px 12px;
                }
                .wiki-btn-text,
                .wiki-btn-shortcut {
                    display: none;
                }
                .wiki-btn-icon {
                    font-size: 1.4em;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // ===== UPDATE CONTEXT =====
    /**
     * Oppdater wiki-konteksten basert på nåværende oppgave
     * Kall denne når brukeren bytter oppgave
     * 
     * @param {Object} context - Kontekst-objekt
     * @param {string} context.module - Modul: 'quiz', 'bokforing', 'analyse', etc.
     * @param {string} context.topic - Emne: 'mva', 'avskrivning', etc.
     * @param {string} context.difficulty - Vanskelighetsgrad
     * @param {string} context.questionId - Oppgave-ID
     * @param {string[]} context.tags - Emneord for søk
     * @param {string[]} context.lawRefs - Lovhenvisninger
     * @param {string[]} context.accounts - Relevante kontoer
     */
    updateContext(context) {
        this.currentContext = {
            ...this.currentContext,
            ...context
        };
        
        // Update header button indicator
        const btn = document.querySelector('.wiki-header-btn');
        if (btn) {
            const hasContext = this.currentContext.tags?.length > 0 || 
                              this.currentContext.lawRefs?.length > 0 ||
                              this.currentContext.topic;
            btn.classList.toggle('has-context', hasContext);
        }
        
        console.log('📖 Wiki context updated:', this.currentContext);
    },
    
    // ===== CONTEXT HELPERS =====
    /**
     * Hjelpefunksjon for å sette kontekst fra quiz-spørsmål
     */
    setQuizContext(question) {
        const tags = [];
        const lawRefs = [];
        
        // Extract tags from question text
        if (question.q) {
            const termPatterns = [
                /mva|merverdiavgift/gi,
                /avskrivning/gi,
                /regnskap/gi,
                /balanse/gi,
                /resultat/gi,
                /egenkapital/gi,
                /gjeld/gi,
                /eiendeler/gi,
                /fradrag/gi,
                /skatt/gi,
                /bokføring/gi,
                /bilag/gi,
                /faktura/gi,
                /lønn/gi,
                /feriepenger/gi,
                /arbeidsgiveravgift|aga/gi,
                /kontantstrøm/gi
            ];
            
            termPatterns.forEach(pattern => {
                const match = question.q.match(pattern);
                if (match) tags.push(match[0].toLowerCase());
            });
        }
        
        // Extract law reference
        if (question.l) {
            lawRefs.push(question.l);
            
            // Parse law abbreviation for tags
            if (question.l.includes('MVAL')) tags.push('mva');
            if (question.l.includes('RSKL') || question.l.includes('RGL')) tags.push('regnskap');
            if (question.l.includes('SKTL')) tags.push('skatt');
            if (question.l.includes('BOKL')) tags.push('bokføring');
        }
        
        this.updateContext({
            module: 'quiz',
            tags: [...new Set(tags)],
            lawRefs,
            questionId: question.id || null
        });
    },
    
    /**
     * Hjelpefunksjon for å sette kontekst fra bokføringsoppgave
     */
    setBokforingContext(task) {
        const tags = [];
        const accounts = task.relevantAccounts || [];
        
        // Extract tags from description
        if (task.description) {
            const termPatterns = [
                { pattern: /mva|merverdiavgift/gi, tag: 'mva' },
                { pattern: /varekjøp|varesalg|varer/gi, tag: 'varer' },
                { pattern: /lønn|lønnskostnad/gi, tag: 'lønn' },
                { pattern: /avskrivning/gi, tag: 'avskrivning' },
                { pattern: /feriepenger/gi, tag: 'feriepenger' },
                { pattern: /arbeidsgiveravgift|aga/gi, tag: 'aga' },
                { pattern: /bank|kontant/gi, tag: 'bank' },
                { pattern: /kunde|kundefordring/gi, tag: 'kundefordring' },
                { pattern: /leverandør/gi, tag: 'leverandørgjeld' },
                { pattern: /husleie|leie/gi, tag: 'leie' },
                { pattern: /forsikring/gi, tag: 'forsikring' },
                { pattern: /aksje/gi, tag: 'aksjer' }
            ];
            
            termPatterns.forEach(({pattern, tag}) => {
                if (pattern.test(task.description)) tags.push(tag);
            });
        }
        
        // Map accounts to tags
        const accountTagMap = {
            '27': 'mva',
            '19': 'bank',
            '15': 'kundefordring',
            '24': 'leverandørgjeld',
            '50': 'lønn',
            '51': 'lønn',
            '54': 'aga',
            '14': 'varelager',
            '40': 'varekostnad',
            '30': 'salgsinntekt',
            '10': 'anleggsmidler',
            '60': 'avskrivning'
        };
        
        accounts.forEach(acc => {
            const prefix = acc.substring(0, 2);
            if (accountTagMap[prefix]) {
                tags.push(accountTagMap[prefix]);
            }
        });
        
        this.updateContext({
            module: 'bokforing',
            difficulty: task.difficulty || 'medium',
            tags: [...new Set(tags)],
            accounts
        });
    },
    
    /**
     * Hjelpefunksjon for regnskapsanalyse
     */
    setAnalyseContext(task) {
        const tags = [];
        
        const termPatterns = [
            { pattern: /rentabilitet|roe|roa/gi, tag: 'rentabilitet' },
            { pattern: /likviditet/gi, tag: 'likviditet' },
            { pattern: /soliditet|egenkapital/gi, tag: 'soliditet' },
            { pattern: /finansiering/gi, tag: 'finansiering' },
            { pattern: /nøkkeltall/gi, tag: 'nøkkeltall' },
            { pattern: /kontantstrøm/gi, tag: 'kontantstrøm' },
            { pattern: /resultatgrad/gi, tag: 'resultatgrad' },
            { pattern: /arbeidskapital/gi, tag: 'arbeidskapital' }
        ];
        
        if (task.description || task.title) {
            const text = (task.description || '') + ' ' + (task.title || '');
            termPatterns.forEach(({pattern, tag}) => {
                if (pattern.test(text)) tags.push(tag);
            });
        }
        
        this.updateContext({
            module: 'analyse',
            tags: [...new Set(tags)],
            topic: task.topic || null
        });
    },
    
    // ===== CREATE POPUP HTML =====
    createPopupHTML() {
        const container = document.createElement('div');
        container.id = 'wiki-popup-container';
        container.innerHTML = `
            <div class="wiki-popup-overlay" onclick="WikiPopup.close()"></div>
            <div class="wiki-popup">
                <div class="wiki-popup-header">
                    <div class="wiki-popup-title">
                        <span class="wiki-icon">📖</span>
                        <span>Regnskapswiki</span>
                    </div>
                    <button class="wiki-popup-close" onclick="WikiPopup.close()" title="Lukk (Esc)">×</button>
                </div>
                
                <div class="wiki-popup-search">
                    <input type="text" 
                           id="wiki-popup-search-input" 
                           placeholder="Søk etter lover, formler, begreper..."
                           oninput="WikiPopup.handleSearch(this.value)"
                           autocomplete="off">
                    <span class="wiki-search-icon">🔍</span>
                    <div class="wiki-search-hint">
                        Tips: Søk på lovparagrafer (§ 8-1), kontonummer (2700), eller begreper (mva)
                    </div>
                </div>
                
                <div class="wiki-popup-content" id="wiki-popup-content">
                    <!-- Content loaded dynamically -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
        
        this.addStyles();
    },
    
    // ===== POPUP STYLES =====
    addStyles() {
        if (document.getElementById('wiki-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wiki-popup-styles';
        style.textContent = `
            #wiki-popup-container {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            #wiki-popup-container.open {
                display: block;
            }
            
            .wiki-popup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: wikiFadeIn 0.2s ease-out;
            }
            
            @keyframes wikiFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .wiki-popup {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 850px;
                max-height: 85vh;
                background: var(--bg-secondary, #16213e);
                border: 2px solid var(--accent-primary, #4ade80);
                border-radius: 16px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 
                    0 25px 80px rgba(0, 0, 0, 0.5),
                    0 0 40px rgba(74, 222, 128, 0.15);
                animation: wikiSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            
            @keyframes wikiSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1) translateY(0);
                }
            }
            
            .wiki-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px;
                background: var(--bg-tertiary, #0f3460);
                border-bottom: 1px solid var(--border-color, #404040);
            }
            
            .wiki-popup-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 1.4em;
                font-weight: 700;
                color: var(--accent-primary, #4ade80);
            }
            
            .wiki-icon {
                font-size: 1.2em;
            }
            
            .wiki-popup-close {
                background: none;
                border: none;
                color: var(--text-secondary, #a0a0a0);
                font-size: 2em;
                cursor: pointer;
                padding: 0 8px;
                line-height: 1;
                transition: all 0.2s;
                border-radius: 8px;
            }
            
            .wiki-popup-close:hover {
                color: #ef4444;
                background: rgba(239, 68, 68, 0.1);
                transform: scale(1.1);
            }
            
            .wiki-popup-search {
                position: relative;
                padding: 16px 24px;
                background: var(--bg-secondary, #16213e);
                border-bottom: 1px solid var(--border-color, #404040);
            }
            
            #wiki-popup-search-input {
                width: 100%;
                padding: 14px 50px 14px 18px;
                background: var(--bg-primary, #1a1a2e);
                border: 2px solid var(--border-color, #404040);
                border-radius: 12px;
                color: var(--text-primary, #eaeaea);
                font-size: 1.05em;
                transition: all 0.2s;
            }
            
            #wiki-popup-search-input:focus {
                outline: none;
                border-color: var(--accent-primary, #4ade80);
                box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2);
            }
            
            #wiki-popup-search-input::placeholder {
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-search-icon {
                position: absolute;
                right: 40px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.3em;
                color: var(--text-secondary, #a0a0a0);
                pointer-events: none;
            }
            
            .wiki-search-hint {
                margin-top: 8px;
                font-size: 0.85em;
                color: var(--text-secondary, #a0a0a0);
                opacity: 0.7;
            }
            
            .wiki-popup-content {
                flex: 1;
                overflow-y: auto;
                padding: 24px;
                scrollbar-width: thin;
                scrollbar-color: var(--accent-primary, #4ade80) var(--bg-tertiary, #0f3460);
            }
            
            .wiki-popup-content::-webkit-scrollbar {
                width: 8px;
            }
            
            .wiki-popup-content::-webkit-scrollbar-track {
                background: var(--bg-tertiary, #0f3460);
            }
            
            .wiki-popup-content::-webkit-scrollbar-thumb {
                background: var(--accent-primary, #4ade80);
                border-radius: 4px;
            }
            
            .wiki-relevant-section {
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(74, 222, 128, 0.05));
                border: 2px solid var(--accent-primary, #4ade80);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 24px;
            }
            
            .wiki-relevant-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }
            
            .wiki-relevant-title {
                color: var(--accent-primary, #4ade80);
                font-weight: 700;
                font-size: 1.1em;
            }
            
            .wiki-relevant-badge {
                background: var(--accent-primary, #4ade80);
                color: #1a1a2e;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75em;
                font-weight: 600;
            }
            
            .wiki-relevant-items {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .wiki-relevant-item {
                background: var(--bg-tertiary, #0f3460);
                padding: 10px 14px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
                flex: 1;
                min-width: 180px;
                max-width: 250px;
            }
            
            .wiki-relevant-item:hover {
                border-color: var(--accent-primary, #4ade80);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(74, 222, 128, 0.2);
            }
            
            .wiki-relevant-item-title {
                font-weight: 600;
                color: var(--text-primary, #eaeaea);
                margin-bottom: 4px;
            }
            
            .wiki-relevant-item-meta {
                font-size: 0.85em;
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-category {
                margin-bottom: 20px;
            }
            
            .wiki-category-header {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 0;
                border-bottom: 2px solid var(--border-color, #404040);
                margin-bottom: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .wiki-category-header:hover {
                color: var(--accent-primary, #4ade80);
            }
            
            .wiki-category-icon {
                font-size: 1.4em;
            }
            
            .wiki-category-title {
                font-weight: 700;
                color: var(--accent-secondary, #3b82f6);
                font-size: 1.1em;
            }
            
            .wiki-category-count {
                background: var(--bg-tertiary, #0f3460);
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.8em;
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-category-toggle {
                margin-left: auto;
                color: var(--text-secondary, #a0a0a0);
                transition: transform 0.2s;
            }
            
            .wiki-category.collapsed .wiki-category-toggle {
                transform: rotate(-90deg);
            }
            
            .wiki-category.collapsed .wiki-category-items {
                display: none;
            }
            
            .wiki-category-items {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 10px;
            }
            
            .wiki-item {
                background: var(--bg-tertiary, #0f3460);
                padding: 12px 16px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 3px solid transparent;
            }
            
            .wiki-item:hover {
                border-left-color: var(--accent-primary, #4ade80);
                background: var(--card-bg, #2d2d2d);
                transform: translateX(4px);
            }
            
            .wiki-item-title {
                font-weight: 600;
                color: var(--text-primary, #eaeaea);
                margin-bottom: 4px;
            }
            
            .wiki-item-subtitle {
                font-size: 0.85em;
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-article-view {
                animation: wikiFadeIn 0.2s ease-out;
            }
            
            .wiki-article-back {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: var(--bg-tertiary, #0f3460);
                border: none;
                color: var(--text-secondary, #a0a0a0);
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                margin-bottom: 16px;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .wiki-article-back:hover {
                background: var(--accent-primary, #4ade80);
                color: #1a1a2e;
            }
            
            .wiki-article-header {
                background: var(--bg-tertiary, #0f3460);
                padding: 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid var(--border-color, #404040);
            }
            
            .wiki-article-title {
                font-size: 1.6em;
                color: var(--accent-primary, #4ade80);
                margin-bottom: 12px;
            }
            
            .wiki-article-meta {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
                color: var(--text-secondary, #a0a0a0);
                font-size: 0.9em;
            }
            
            .wiki-article-meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .wiki-article-body {
                background: var(--card-bg, #2d2d2d);
                padding: 24px;
                border-radius: 12px;
                line-height: 1.8;
                border: 1px solid var(--border-color, #404040);
            }
            
            .wiki-article-body h2 {
                color: var(--accent-primary, #4ade80);
                margin-top: 24px;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid var(--border-color, #404040);
            }
            
            .wiki-article-body h2:first-child {
                margin-top: 0;
            }
            
            .wiki-article-body h3 {
                color: var(--accent-secondary, #3b82f6);
                margin-top: 20px;
                margin-bottom: 10px;
            }
            
            .wiki-article-body p {
                margin-bottom: 16px;
            }
            
            .wiki-article-body ul, .wiki-article-body ol {
                margin-left: 24px;
                margin-bottom: 16px;
            }
            
            .wiki-article-body li {
                margin-bottom: 6px;
            }
            
            .wiki-article-body strong {
                color: var(--accent-primary, #4ade80);
            }
            
            .wiki-article-body code {
                background: var(--bg-primary, #1a1a2e);
                padding: 2px 8px;
                border-radius: 4px;
                color: var(--accent-secondary, #3b82f6);
                font-family: 'Consolas', 'Monaco', monospace;
            }
            
            .wiki-law-text {
                background: var(--bg-primary, #1a1a2e);
                border-left: 4px solid var(--accent-primary, #4ade80);
                padding: 16px 20px;
                margin: 16px 0;
                border-radius: 0 12px 12px 0;
                font-style: italic;
            }
            
            .wiki-law-text::before {
                content: "📜 Lovtekst:";
                display: block;
                color: var(--accent-primary, #4ade80);
                font-weight: 700;
                font-style: normal;
                margin-bottom: 8px;
            }
            
            .wiki-formula-box {
                background: var(--bg-primary, #1a1a2e);
                border: 2px solid var(--accent-secondary, #3b82f6);
                border-radius: 12px;
                padding: 20px;
                margin: 16px 0;
                text-align: center;
            }
            
            .wiki-formula-title {
                color: var(--accent-secondary, #3b82f6);
                font-weight: 700;
                margin-bottom: 10px;
            }
            
            .wiki-formula {
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 1.3em;
                color: var(--accent-primary, #4ade80);
                margin: 10px 0;
            }
            
            .wiki-info-box {
                padding: 16px;
                border-radius: 10px;
                margin: 16px 0;
            }
            
            .wiki-info-box.tip {
                background: rgba(34, 197, 94, 0.1);
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
            
            .wiki-info-box.info {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
            }
            
            .wiki-info-box.warning {
                background: rgba(245, 158, 11, 0.1);
                border: 1px solid rgba(245, 158, 11, 0.3);
            }
            
            .wiki-info-box-title {
                font-weight: 700;
                margin-bottom: 8px;
            }
            
            .wiki-info-box.tip .wiki-info-box-title { color: #22c55e; }
            .wiki-info-box.info .wiki-info-box-title { color: #3b82f6; }
            .wiki-info-box.warning .wiki-info-box-title { color: #f59e0b; }
            
            .wiki-related {
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color, #404040);
            }
            
            .wiki-related-title {
                font-weight: 700;
                color: var(--text-secondary, #a0a0a0);
                margin-bottom: 12px;
            }
            
            .wiki-related-items {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .wiki-related-link {
                background: var(--bg-tertiary, #0f3460);
                padding: 8px 14px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                color: var(--accent-secondary, #3b82f6);
                font-weight: 500;
            }
            
            .wiki-related-link:hover {
                background: var(--accent-secondary, #3b82f6);
                color: white;
            }
            
            .wiki-search-results-title {
                color: var(--text-secondary, #a0a0a0);
                margin-bottom: 16px;
                font-size: 0.95em;
            }
            
            .wiki-no-results {
                text-align: center;
                padding: 40px;
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-no-results-icon {
                font-size: 3em;
                margin-bottom: 16px;
                opacity: 0.5;
            }
            
            .wiki-loading {
                text-align: center;
                padding: 60px;
                color: var(--text-secondary, #a0a0a0);
            }
            
            .wiki-loading-spinner {
                font-size: 2.5em;
                animation: wikiSpin 1s linear infinite;
            }
            
            @keyframes wikiSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
                .wiki-popup {
                    width: 95%;
                    max-height: 90vh;
                    border-radius: 12px;
                }
                
                .wiki-popup-header {
                    padding: 12px 16px;
                }
                
                .wiki-popup-title {
                    font-size: 1.2em;
                }
                
                .wiki-popup-search {
                    padding: 12px 16px;
                }
                
                .wiki-search-hint {
                    display: none;
                }
                
                .wiki-popup-content {
                    padding: 16px;
                }
                
                .wiki-category-items {
                    grid-template-columns: 1fr;
                }
                
                .wiki-relevant-items {
                    flex-direction: column;
                }
                
                .wiki-relevant-item {
                    max-width: none;
                }
                
                .wiki-article-body {
                    padding: 16px;
                }
            }
            
            @media (max-width: 480px) {
                .wiki-popup {
                    width: 100%;
                    height: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                    border: none;
                }
                
                .wiki-article-meta {
                    flex-direction: column;
                    gap: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // ===== OPEN POPUP =====
    open(context = null) {
        this.init();
        
        if (context) {
            this.updateContext(context);
        }
        
        const container = document.getElementById('wiki-popup-container');
        if (container) {
            container.classList.add('open');
            this.isOpen = true;
            this.loadContent();
            
            setTimeout(() => {
                const searchInput = document.getElementById('wiki-popup-search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.value = '';
                }
            }, 100);
        }
    },
    
    // ===== CLOSE POPUP =====
    close() {
        const container = document.getElementById('wiki-popup-container');
        if (container) {
            container.classList.remove('open');
            this.isOpen = false;
        }
    },
    
    // ===== LOAD CONTENT =====
    async loadContent() {
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        contentEl.innerHTML = `
            <div class="wiki-loading">
                <div class="wiki-loading-spinner">⏳</div>
                <p>Laster wiki...</p>
            </div>
        `;
        
        try {
            const articles = await this.loadArticles();
            this.cachedArticles = articles;
            this.renderMainView();
        } catch (error) {
            console.error('Wiki load error:', error);
            contentEl.innerHTML = `
                <div class="wiki-no-results">
                    <div class="wiki-no-results-icon">❌</div>
                    <p>Kunne ikke laste wiki</p>
                </div>
            `;
        }
    },
    
    // ===== LOAD ARTICLES =====
    async loadArticles() {
        if (this.db) {
            try {
                const snapshot = await this.db.ref('wiki/articles').once('value');
                const data = snapshot.val();
                if (data) {
                    return Object.entries(data).map(([id, article]) => ({
                        id,
                        ...article
                    }));
                }
            } catch (e) {
                console.warn('Firebase wiki not available, using local data');
            }
        }
        
        if (typeof WikiData !== 'undefined' && WikiData.articles) {
            return WikiData.articles;
        }
        
        return this.getBuiltInArticles();
    },
    
    // ===== RENDER MAIN VIEW =====
    renderMainView() {
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        let html = '';
        
        const relevantArticles = this.getRelevantArticles();
        if (relevantArticles.length > 0) {
            html += `
                <div class="wiki-relevant-section">
                    <div class="wiki-relevant-header">
                        <span>🎯</span>
                        <span class="wiki-relevant-title">Relevant for denne oppgaven</span>
                        <span class="wiki-relevant-badge">${relevantArticles.length} treff</span>
                    </div>
                    <div class="wiki-relevant-items">
                        ${relevantArticles.map(article => `
                            <div class="wiki-relevant-item" onclick="WikiPopup.showArticle('${article.id}')">
                                <div class="wiki-relevant-item-title">${article.title}</div>
                                <div class="wiki-relevant-item-meta">
                                    ${article.law ? article.law + ' ' + (article.paragraph || '') : article.category || ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        const grouped = this.groupByCategory();
        for (const [category, articles] of Object.entries(grouped)) {
            html += `
                <div class="wiki-category" data-category="${category}">
                    <div class="wiki-category-header" onclick="WikiPopup.toggleCategory('${category}')">
                        <span class="wiki-category-icon">${this.getCategoryIcon(category)}</span>
                        <span class="wiki-category-title">${this.getCategoryTitle(category)}</span>
                        <span class="wiki-category-count">${articles.length}</span>
                        <span class="wiki-category-toggle">▼</span>
                    </div>
                    <div class="wiki-category-items">
                        ${articles.map(article => `
                            <div class="wiki-item" onclick="WikiPopup.showArticle('${article.id}')">
                                <div class="wiki-item-title">${article.title}</div>
                                <div class="wiki-item-subtitle">
                                    ${article.law ? article.law + ' ' + (article.paragraph || '') + ' • ' : ''}
                                    ${article.summary || ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        contentEl.innerHTML = html;
    },
    
    // ===== GET RELEVANT ARTICLES =====
    getRelevantArticles() {
        const { tags, module, topic, lawRefs, accounts } = this.currentContext;
        if (!tags?.length && !lawRefs?.length && !accounts?.length && !topic) {
            return [];
        }
        
        const scored = this.cachedArticles.map(article => {
            let score = 0;
            const articleTags = article.tags || [];
            
            for (const tag of (tags || [])) {
                const tagLower = tag.toLowerCase();
                if (articleTags.includes(tagLower)) {
                    score += 15;
                } else if (articleTags.some(t => t.includes(tagLower) || tagLower.includes(t))) {
                    score += 5;
                }
            }
            
            for (const lawRef of (lawRefs || [])) {
                if (article.law && lawRef.includes(article.law)) {
                    score += 20;
                }
                if (article.paragraph && lawRef.includes(article.paragraph)) {
                    score += 10;
                }
            }
            
            if (topic && article.title.toLowerCase().includes(topic.toLowerCase())) {
                score += 12;
            }
            
            if (module && article.category === module) {
                score += 3;
            }
            
            if (accounts?.length && article.accounts) {
                for (const acc of accounts) {
                    if (article.accounts.includes(acc)) {
                        score += 8;
                    }
                }
            }
            
            return { article, score };
        });
        
        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(s => s.article);
    },
    
    // ===== GROUP BY CATEGORY =====
    groupByCategory() {
        const groups = {};
        const order = ['lovverk', 'formler', 'kontoplan', 'konsepter', 'standarder', 'annet'];
        
        for (const article of this.cachedArticles) {
            const category = article.category || 'annet';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(article);
        }
        
        const sorted = {};
        for (const cat of order) {
            if (groups[cat]) {
                sorted[cat] = groups[cat];
            }
        }
        for (const [cat, articles] of Object.entries(groups)) {
            if (!sorted[cat]) {
                sorted[cat] = articles;
            }
        }
        
        return sorted;
    },
    
    getCategoryIcon(category) {
        const icons = {
            'lovverk': '📜',
            'formler': '🔢',
            'kontoplan': '📋',
            'konsepter': '💡',
            'standarder': '📊',
            'annet': '📁'
        };
        return icons[category] || '📄';
    },
    
    getCategoryTitle(category) {
        const titles = {
            'lovverk': 'Lovverk',
            'formler': 'Formler & Nøkkeltall',
            'kontoplan': 'Kontoplan',
            'konsepter': 'Konsepter & Begreper',
            'standarder': 'Regnskapsstandarder',
            'annet': 'Annet'
        };
        return titles[category] || category;
    },
    
    toggleCategory(category) {
        const el = document.querySelector(`.wiki-category[data-category="${category}"]`);
        if (el) {
            el.classList.toggle('collapsed');
        }
    },
    
    // ===== SHOW ARTICLE =====
    showArticle(articleId) {
        const article = this.cachedArticles.find(a => a.id === articleId);
        if (!article) return;
        
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        let html = `
            <div class="wiki-article-view">
                <button class="wiki-article-back" onclick="WikiPopup.renderMainView()">
                    ← Tilbake
                </button>
                
                <div class="wiki-article-header">
                    <h1 class="wiki-article-title">${article.title}</h1>
                    <div class="wiki-article-meta">
                        ${article.law ? `
                            <div class="wiki-article-meta-item">
                                <span>📜</span>
                                <span>${article.law} ${article.paragraph || ''}</span>
                            </div>
                        ` : ''}
                        <div class="wiki-article-meta-item">
                            <span>📁</span>
                            <span>${this.getCategoryTitle(article.category)}</span>
                        </div>
                        ${article.tags?.length ? `
                            <div class="wiki-article-meta-item">
                                <span>🏷️</span>
                                <span>${article.tags.slice(0, 4).join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="wiki-article-body">
                    ${article.content}
                </div>
        `;
        
        if (article.related?.length) {
            const relatedArticles = article.related
                .map(id => this.cachedArticles.find(a => a.id === id))
                .filter(a => a);
            
            if (relatedArticles.length) {
                html += `
                    <div class="wiki-related">
                        <div class="wiki-related-title">📎 Relaterte artikler</div>
                        <div class="wiki-related-items">
                            ${relatedArticles.map(a => `
                                <div class="wiki-related-link" onclick="WikiPopup.showArticle('${a.id}')">
                                    ${a.title}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        contentEl.innerHTML = html;
        contentEl.scrollTop = 0;
    },
    
    // ===== SEARCH =====
    handleSearch(query) {
        if (!query || query.length < 2) {
            this.renderMainView();
            return;
        }
        
        const results = this.searchArticles(query);
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        if (results.length === 0) {
            contentEl.innerHTML = `
                <div class="wiki-no-results">
                    <div class="wiki-no-results-icon">🔍</div>
                    <p>Ingen resultater for "${query}"</p>
                    <p style="font-size: 0.9em; margin-top: 10px; opacity: 0.7;">
                        Prøv et annet søkeord
                    </p>
                </div>
            `;
            return;
        }
        
        contentEl.innerHTML = `
            <div class="wiki-search-results">
                <div class="wiki-search-results-title">
                    ${results.length} resultat${results.length !== 1 ? 'er' : ''} for "${query}"
                </div>
                <div class="wiki-category-items">
                    ${results.map(article => `
                        <div class="wiki-item" onclick="WikiPopup.showArticle('${article.id}')">
                            <div class="wiki-item-title">${article.title}</div>
                            <div class="wiki-item-subtitle">
                                ${article.law ? article.law + ' ' + (article.paragraph || '') + ' • ' : ''}
                                ${article.summary || ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    searchArticles(query) {
        const q = query.toLowerCase().trim();
        const isLawSearch = q.includes('§') || /^\d+-\d+$/.test(q);
        const isAccountSearch = /^\d{4}$/.test(q);
        
        return this.cachedArticles.filter(article => {
            if (isAccountSearch && article.accounts?.includes(q)) return true;
            
            if (isLawSearch) {
                if (article.paragraph?.toLowerCase().includes(q)) return true;
                const combined = (article.law + ' ' + article.paragraph).toLowerCase();
                if (combined.includes(q.replace('§', '').trim())) return true;
            }
            
            if (article.title.toLowerCase().includes(q)) return true;
            if (article.tags?.some(t => t.includes(q))) return true;
            if (article.law?.toLowerCase().includes(q)) return true;
            if (article.summary?.toLowerCase().includes(q)) return true;
            if (article.content?.toLowerCase().includes(q)) return true;
            
            return false;
        });
    },
    
    // ===== BUILT-IN ARTICLES =====
    getBuiltInArticles() {
        return [
            {
                id: 'mval-8-1',
                title: 'Fradragsrett for inngående MVA',
                category: 'lovverk',
                law: 'MVAL',
                paragraph: '§ 8-1',
                tags: ['mva', 'fradrag', 'inngående', 'avgift', 'merverdiavgift'],
                accounts: ['2710', '2711'],
                summary: 'Regler for fradrag av inngående merverdiavgift',
                content: `
                    <h2>Fradragsrett</h2>
                    <p>Et registrert avgiftssubjekt har rett til fradrag for inngående merverdiavgift på anskaffelser til bruk i den registrerte virksomheten.</p>
                    
                    <div class="wiki-law-text">
                        Et registrert avgiftssubjekt har rett til fradrag for inngående merverdiavgift på anskaffelser av varer og tjenester som er til bruk i den registrerte virksomheten.
                    </div>
                    
                    <h3>Vilkår for fradrag</h3>
                    <ul>
                        <li>Virksomheten må være registrert i Merverdiavgiftsregisteret</li>
                        <li>Anskaffelsen må være til bruk i avgiftspliktig virksomhet</li>
                        <li>Det må foreligge gyldig dokumentasjon (faktura)</li>
                    </ul>
                    
                    <div class="wiki-info-box tip">
                        <div class="wiki-info-box-title">💡 Huskeregel</div>
                        Fradragsretten gjelder kun for anskaffelser som har direkte tilknytning til den avgiftspliktige virksomheten.
                    </div>
                `,
                related: ['mval-3-1']
            },
            {
                id: 'mval-3-1',
                title: 'Utgående merverdiavgift',
                category: 'lovverk',
                law: 'MVAL',
                paragraph: '§ 3-1',
                tags: ['mva', 'utgående', 'avgift', 'merverdiavgift', 'salg'],
                accounts: ['2700', '2701'],
                summary: 'Hovedregelen om avgiftsplikt ved omsetning',
                content: `
                    <h2>Avgiftsplikt ved omsetning</h2>
                    <p>Det skal beregnes merverdiavgift ved omsetning av varer og tjenester i Norge.</p>
                    
                    <div class="wiki-law-text">
                        Det skal beregnes og betales merverdiavgift av omsetning av varer og tjenester som er avgiftspliktige etter denne lov.
                    </div>
                    
                    <h3>Satser</h3>
                    <ul>
                        <li><strong>Alminnelig sats:</strong> 25%</li>
                        <li><strong>Redusert sats (mat):</strong> 15%</li>
                        <li><strong>Lav sats (transport, kultur):</strong> 12%</li>
                    </ul>
                `,
                related: ['mval-8-1']
            },
            {
                id: 'rgl-5-3',
                title: 'Avskrivning av anleggsmidler',
                category: 'lovverk',
                law: 'RSKL',
                paragraph: '§ 5-3',
                tags: ['avskrivning', 'anleggsmidler', 'regnskap', 'verdifall', 'levetid'],
                accounts: ['1000', '1200', '6000'],
                summary: 'Regnskapslovens regler om avskrivning',
                content: `
                    <h2>Avskrivning</h2>
                    <p>Anleggsmidler som har begrenset økonomisk levetid, skal avskrives etter en fornuftig avskrivningsplan.</p>
                    
                    <div class="wiki-formula-box">
                        <div class="wiki-formula-title">Lineær avskrivning</div>
                        <div class="wiki-formula">Årlig avskrivning = (Anskaffelseskost - Restverdi) / Levetid</div>
                    </div>
                    
                    <h3>Avskrivningsmetoder</h3>
                    <ul>
                        <li><strong>Lineær:</strong> Like store beløp hvert år</li>
                        <li><strong>Saldoavskrivning:</strong> Prosent av bokført verdi</li>
                        <li><strong>Produksjonsenhetsmetoden:</strong> Basert på bruk</li>
                    </ul>
                `
            },
            {
                id: 'formula-roe',
                title: 'Egenkapitalrentabilitet (ROE)',
                category: 'formler',
                tags: ['rentabilitet', 'nøkkeltall', 'analyse', 'roe', 'egenkapital', 'avkastning'],
                summary: 'Mål på avkastning på egenkapitalen',
                content: `
                    <h2>Egenkapitalrentabilitet (ROE)</h2>
                    <p>Egenkapitalrentabiliteten viser hvor mye avkastning eierne får på sin investerte kapital.</p>
                    
                    <div class="wiki-formula-box">
                        <div class="wiki-formula-title">Formel</div>
                        <div class="wiki-formula">ROE = (Årsresultat / Gjennomsnittlig EK) × 100%</div>
                    </div>
                    
                    <h3>Tolkning</h3>
                    <ul>
                        <li><strong>&gt; 15%:</strong> God rentabilitet</li>
                        <li><strong>10-15%:</strong> Akseptabel</li>
                        <li><strong>&lt; 10%:</strong> Svak - bør undersøkes</li>
                    </ul>
                `,
                related: ['formula-likviditetsgrad']
            },
            {
                id: 'formula-likviditetsgrad',
                title: 'Likviditetsgrad 1 og 2',
                category: 'formler',
                tags: ['likviditet', 'nøkkeltall', 'analyse', 'betalingsevne', 'omløpsmidler'],
                summary: 'Mål på kortsiktig betalingsevne',
                content: `
                    <h2>Likviditetsgrad</h2>
                    <p>Likviditetsgraden viser selskapets evne til å betale kortsiktig gjeld.</p>
                    
                    <div class="wiki-formula-box">
                        <div class="wiki-formula-title">Likviditetsgrad 1</div>
                        <div class="wiki-formula">LG1 = Omløpsmidler / Kortsiktig gjeld</div>
                    </div>
                    
                    <div class="wiki-formula-box">
                        <div class="wiki-formula-title">Likviditetsgrad 2</div>
                        <div class="wiki-formula">LG2 = (Omløpsmidler - Varelager) / Kortsiktig gjeld</div>
                    </div>
                    
                    <h3>Tommelfingerregler</h3>
                    <ul>
                        <li><strong>LG1 &gt; 2:</strong> God likviditet</li>
                        <li><strong>LG2 &gt; 1:</strong> God "acid test"</li>
                    </ul>
                `,
                related: ['formula-roe']
            },
            {
                id: 'concept-debet-kredit',
                title: 'Debet og Kredit',
                category: 'konsepter',
                tags: ['debet', 'kredit', 'bokføring', 't-konto', 'grunnleggende'],
                summary: 'Grunnleggende om debet og kredit i bokføring',
                content: `
                    <h2>Debet og Kredit</h2>
                    <p>Debet (venstre side) og kredit (høyre side) er grunnlaget for dobbelt bokføring.</p>
                    
                    <h3>Hovedregler</h3>
                    <ul>
                        <li><strong>Eiendeler:</strong> Øker i debet, reduseres i kredit</li>
                        <li><strong>Gjeld:</strong> Øker i kredit, reduseres i debet</li>
                        <li><strong>Egenkapital:</strong> Øker i kredit, reduseres i debet</li>
                        <li><strong>Inntekter:</strong> Føres i kredit</li>
                        <li><strong>Kostnader:</strong> Føres i debet</li>
                    </ul>
                    
                    <div class="wiki-info-box tip">
                        <div class="wiki-info-box-title">💡 Huskeregel</div>
                        "Alle kontoer må alltid balansere" - sum debet = sum kredit
                    </div>
                `
            },
            {
                id: 'account-1920',
                title: 'Konto 1920 - Bankinnskudd',
                category: 'kontoplan',
                tags: ['bank', 'bankinnskudd', '1920', 'kontanter', 'likvider'],
                accounts: ['1920'],
                summary: 'Bankinnskudd og kontanter i virksomheten',
                content: `
                    <h2>Konto 1920 - Bankinnskudd</h2>
                    <p>Brukes for virksomhetens bankkontoer og likvide midler.</p>
                    
                    <h3>Bruk</h3>
                    <ul>
                        <li><strong>Debet:</strong> Innbetalinger (fra kunder, kapitalinnskudd, lån)</li>
                        <li><strong>Kredit:</strong> Utbetalinger (til leverandører, lønn, avgifter)</li>
                    </ul>
                    
                    <h3>Relaterte kontoer</h3>
                    <ul>
                        <li>1900 - Kontanter</li>
                        <li>1910 - Bankinnskudd (alternativ)</li>
                        <li>1930 - Andre bankinnskudd</li>
                    </ul>
                `
            }
        ];
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WikiPopup.init());
} else {
    WikiPopup.init();
}
