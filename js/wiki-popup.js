/**
 * 📖 WikiPopup - Kontekst-bevisst wiki-popup for AccountingQuest
 * 
 * Brukes i alle moduler for å vise relevant hjelp basert på:
 * - Spørsmålets emneord (tags)
 * - Modulen brukeren er i
 * - Søk i hele wiki-basen
 * 
 * BRUK:
 * 1. Inkluder denne filen: <script src="js/wiki-popup.js"></script>
 * 2. Legg til knapp: <button onclick="WikiPopup.open()">📖 Wiki</button>
 * 3. Sett kontekst: WikiPopup.setContext({ tags: ['mva', 'fradrag'], module: 'quiz' })
 */

const WikiPopup = {
    // ===== STATE =====
    isOpen: false,
    currentContext: {
        tags: [],
        module: null,
        questionId: null,
        topic: null
    },
    cachedArticles: {},
    allArticles: [],
    
    // ===== FIREBASE REFERENCE =====
    db: null,
    
    // ===== INITIALIZATION =====
    init() {
        // Check for Firebase
        if (typeof firebase !== 'undefined' && firebase.database) {
            this.db = firebase.database();
        }
        
        // Create popup container if not exists
        if (!document.getElementById('wiki-popup-container')) {
            this.createPopupHTML();
        }
        
        // Add keyboard listener for Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        console.log('📖 WikiPopup initialized');
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
                    <button class="wiki-popup-close" onclick="WikiPopup.close()">×</button>
                </div>
                
                <div class="wiki-popup-search">
                    <input type="text" 
                           id="wiki-popup-search-input" 
                           placeholder="Søk etter lover, formler, begreper..."
                           oninput="WikiPopup.handleSearch(this.value)">
                    <span class="wiki-search-icon">🔍</span>
                </div>
                
                <div class="wiki-popup-content" id="wiki-popup-content">
                    <!-- Content loaded dynamically -->
                </div>
            </div>
        `;
        document.body.appendChild(container);
        
        // Add styles
        this.addStyles();
    },
    
    // ===== ADD STYLES =====
    addStyles() {
        if (document.getElementById('wiki-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wiki-popup-styles';
        style.textContent = `
            /* ===== WIKI POPUP STYLES =====
               Følger main.css designsystem
               Bruker CSS-variabler fra :root
            ===== */
            
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
                animation: aq-fade-in var(--transition-normal);
            }
            
            .wiki-popup-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            
            .wiki-popup {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 800px;
                max-height: 85vh;
                background: var(--bg-secondary);
                border: 2px solid var(--accent);
                border-radius: var(--radius-xl);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: var(--shadow-lg), 0 0 30px var(--accent-glow);
                animation: wikiPopupSlideIn var(--transition-normal);
            }
            
            @keyframes wikiPopupSlideIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            
            .wiki-popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-md) var(--space-lg);
                background: var(--bg-tertiary);
                border-bottom: 1px solid var(--border-color);
            }
            
            .wiki-popup-title {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                font-size: 1.4em;
                font-weight: bold;
                color: var(--accent);
            }
            
            .wiki-icon {
                font-size: 1.3em;
            }
            
            .wiki-popup-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 2em;
                cursor: pointer;
                padding: 0 var(--space-sm);
                line-height: 1;
                transition: all var(--transition-fast);
            }
            
            .wiki-popup-close:hover {
                color: var(--error);
                transform: scale(1.1);
            }
            
            .wiki-popup-search {
                position: relative;
                padding: var(--space-md) var(--space-lg);
                background: var(--bg-secondary);
                border-bottom: 1px solid var(--border-color);
            }
            
            #wiki-popup-search-input {
                width: 100%;
                padding: var(--space-sm) 45px var(--space-sm) var(--space-md);
                background: var(--bg-input);
                border: 2px solid var(--border-color);
                border-radius: var(--radius-md);
                color: var(--text-primary);
                font-size: 1em;
                transition: border-color var(--transition-fast);
            }
            
            #wiki-popup-search-input:focus {
                outline: none;
                border-color: var(--accent);
            }
            
            #wiki-popup-search-input::placeholder {
                color: var(--text-muted);
            }
            
            .wiki-search-icon {
                position: absolute;
                right: 35px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.2em;
                color: var(--text-muted);
            }
            
            .wiki-popup-content {
                flex: 1;
                overflow-y: auto;
                padding: var(--space-lg);
            }
            
            /* ===== RELEVANT SECTION ===== */
            .wiki-relevant-section {
                background: rgba(34, 197, 94, 0.1);
                border: 2px solid var(--accent);
                border-radius: var(--radius-lg);
                padding: var(--space-md);
                margin-bottom: var(--space-lg);
            }
            
            .wiki-relevant-title {
                color: var(--accent);
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: var(--space-sm);
                display: flex;
                align-items: center;
                gap: var(--space-xs);
            }
            
            .wiki-relevant-items {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-sm);
            }
            
            .wiki-relevant-item {
                background: var(--bg-tertiary);
                padding: var(--space-sm) var(--space-md);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                border: 1px solid transparent;
            }
            
            .wiki-relevant-item:hover {
                border-color: var(--accent);
                transform: translateY(-2px);
                box-shadow: var(--shadow-sm);
            }
            
            .wiki-relevant-item-title {
                font-weight: bold;
                color: var(--text-primary);
                margin-bottom: 4px;
            }
            
            .wiki-relevant-item-type {
                font-size: 0.85em;
                color: var(--text-secondary);
            }
            
            /* ===== CATEGORIES ===== */
            .wiki-category {
                margin-bottom: var(--space-lg);
            }
            
            .wiki-category-header {
                display: flex;
                align-items: center;
                gap: var(--space-sm);
                padding: var(--space-sm) 0;
                border-bottom: 2px solid var(--border-color);
                margin-bottom: var(--space-sm);
                cursor: pointer;
                transition: color var(--transition-fast);
            }
            
            .wiki-category-header:hover {
                color: var(--accent);
            }
            
            .wiki-category-icon {
                font-size: 1.3em;
            }
            
            .wiki-category-title {
                font-weight: bold;
                color: var(--info);
                font-size: 1.1em;
            }
            
            .wiki-category-toggle {
                margin-left: auto;
                color: var(--text-secondary);
                transition: transform var(--transition-fast);
            }
            
            .wiki-category.collapsed .wiki-category-toggle {
                transform: rotate(-90deg);
            }
            
            .wiki-category.collapsed .wiki-category-items {
                display: none;
            }
            
            .wiki-category-items {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: var(--space-sm);
            }
            
            .wiki-item {
                background: var(--bg-tertiary);
                padding: var(--space-sm) var(--space-md);
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                border-left: 3px solid transparent;
            }
            
            .wiki-item:hover {
                border-left-color: var(--accent);
                background: var(--bg-card);
                transform: translateX(3px);
            }
            
            .wiki-item-title {
                font-weight: 600;
                color: var(--text-primary);
                margin-bottom: 4px;
            }
            
            .wiki-item-subtitle {
                font-size: 0.85em;
                color: var(--text-secondary);
            }
            
            /* ===== ARTICLE VIEW ===== */
            .wiki-article-view {
                animation: aq-fade-in var(--transition-fast);
            }
            
            .wiki-article-back {
                background: var(--bg-tertiary);
                border: none;
                color: var(--text-secondary);
                padding: var(--space-xs) var(--space-md);
                border-radius: var(--radius-sm);
                cursor: pointer;
                margin-bottom: var(--space-md);
                transition: all var(--transition-fast);
                font-weight: 600;
            }
            
            .wiki-article-back:hover {
                background: var(--accent);
                color: var(--bg-primary);
            }
            
            .wiki-article-header {
                background: var(--bg-tertiary);
                padding: var(--space-lg);
                border-radius: var(--radius-lg);
                margin-bottom: var(--space-lg);
                border: 1px solid var(--border-color);
            }
            
            .wiki-article-title {
                font-size: 1.6em;
                color: var(--accent);
                margin-bottom: var(--space-sm);
            }
            
            .wiki-article-meta {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-md);
                color: var(--text-secondary);
                font-size: 0.9em;
            }
            
            .wiki-article-meta-item {
                display: flex;
                align-items: center;
                gap: var(--space-xs);
            }
            
            .wiki-article-body {
                background: var(--bg-card);
                padding: var(--space-xl);
                border-radius: var(--radius-lg);
                line-height: 1.8;
                border: 1px solid var(--border-color);
            }
            
            .wiki-article-body h2 {
                color: var(--accent);
                margin-top: var(--space-xl);
                margin-bottom: var(--space-sm);
                padding-bottom: var(--space-xs);
                border-bottom: 1px solid var(--border-color);
            }
            
            .wiki-article-body h2:first-child {
                margin-top: 0;
            }
            
            .wiki-article-body h3 {
                color: var(--info);
                margin-top: var(--space-lg);
                margin-bottom: var(--space-sm);
            }
            
            .wiki-article-body p {
                margin-bottom: var(--space-md);
            }
            
            .wiki-article-body ul, .wiki-article-body ol {
                margin-left: var(--space-xl);
                margin-bottom: var(--space-md);
            }
            
            .wiki-article-body li {
                margin-bottom: var(--space-xs);
            }
            
            .wiki-article-body strong {
                color: var(--accent);
            }
            
            .wiki-article-body code {
                background: var(--bg-primary);
                padding: 2px 8px;
                border-radius: var(--radius-sm);
                color: var(--info);
                font-family: 'Consolas', 'Monaco', monospace;
            }
            
            /* Law text box */
            .wiki-law-text {
                background: var(--bg-primary);
                border-left: 4px solid var(--accent);
                padding: var(--space-md) var(--space-lg);
                margin: var(--space-md) 0;
                border-radius: 0 var(--radius-md) var(--radius-md) 0;
                font-style: italic;
            }
            
            .wiki-law-text::before {
                content: "📜 Lovtekst:";
                display: block;
                color: var(--accent);
                font-weight: bold;
                font-style: normal;
                margin-bottom: var(--space-xs);
            }
            
            /* Formula box */
            .wiki-formula-box {
                background: var(--bg-primary);
                border: 2px solid var(--info);
                border-radius: var(--radius-md);
                padding: var(--space-lg);
                margin: var(--space-md) 0;
                text-align: center;
            }
            
            .wiki-formula-title {
                color: var(--info);
                font-weight: bold;
                margin-bottom: var(--space-sm);
            }
            
            .wiki-formula {
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 1.3em;
                color: var(--accent);
                margin: var(--space-sm) 0;
            }
            
            /* Info boxes - følger .aq-alert fra main.css */
            .wiki-info-box {
                padding: var(--space-md);
                margin: var(--space-md) 0;
                border-radius: var(--radius-md);
                border-left: 4px solid;
            }
            
            .wiki-info-box.tip {
                background: rgba(34, 197, 94, 0.15);
                border-color: var(--success);
            }
            
            .wiki-info-box.warning {
                background: rgba(245, 158, 11, 0.15);
                border-color: var(--warning);
            }
            
            .wiki-info-box.info {
                background: rgba(59, 130, 246, 0.15);
                border-color: var(--info);
            }
            
            .wiki-info-box-title {
                font-weight: bold;
                margin-bottom: var(--space-xs);
                display: flex;
                align-items: center;
                gap: var(--space-xs);
            }
            
            /* Related articles */
            .wiki-related {
                background: var(--bg-tertiary);
                padding: var(--space-md);
                border-radius: var(--radius-md);
                margin-top: var(--space-lg);
                border: 1px solid var(--border-color);
            }
            
            .wiki-related-title {
                color: var(--accent);
                font-weight: bold;
                margin-bottom: var(--space-sm);
            }
            
            .wiki-related-items {
                display: flex;
                flex-wrap: wrap;
                gap: var(--space-sm);
            }
            
            .wiki-related-link {
                background: var(--bg-primary);
                padding: var(--space-xs) var(--space-md);
                border-radius: var(--radius-sm);
                cursor: pointer;
                color: var(--info);
                transition: all var(--transition-fast);
                border: 1px solid var(--border-color);
            }
            
            .wiki-related-link:hover {
                background: var(--accent);
                color: var(--bg-primary);
                border-color: var(--accent);
            }
            
            /* Search results */
            .wiki-search-results {
                margin-bottom: var(--space-lg);
            }
            
            .wiki-search-results-title {
                color: var(--text-secondary);
                margin-bottom: var(--space-sm);
                font-size: 0.95em;
            }
            
            .wiki-no-results {
                text-align: center;
                padding: var(--space-2xl);
                color: var(--text-secondary);
            }
            
            .wiki-no-results-icon {
                font-size: 3em;
                margin-bottom: var(--space-md);
            }
            
            /* Loading state */
            .wiki-loading {
                text-align: center;
                padding: var(--space-2xl);
                color: var(--text-secondary);
            }
            
            .wiki-loading-spinner {
                font-size: 2em;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            /* Mobile responsive - følger main.css breakpoints */
            @media (max-width: 768px) {
                .wiki-popup {
                    width: 95%;
                    max-height: 90vh;
                    border-radius: var(--radius-lg);
                }
                
                .wiki-popup-header {
                    padding: var(--space-sm) var(--space-md);
                }
                
                .wiki-popup-title {
                    font-size: 1.2em;
                }
                
                .wiki-popup-content {
                    padding: var(--space-md);
                }
                
                .wiki-category-items {
                    grid-template-columns: 1fr;
                }
                
                .wiki-relevant-items {
                    flex-direction: column;
                }
                
                .wiki-article-body {
                    padding: var(--space-md);
                }
            }
            
            @media (max-width: 480px) {
                .wiki-popup {
                    width: 100%;
                    height: 100%;
                    max-height: 100vh;
                    border-radius: 0;
                }
                
                .wiki-article-meta {
                    flex-direction: column;
                    gap: var(--space-xs);
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // ===== OPEN POPUP =====
    open(context = null) {
        if (context) {
            this.setContext(context);
        }
        
        const container = document.getElementById('wiki-popup-container');
        if (container) {
            container.classList.add('open');
            this.isOpen = true;
            this.loadContent();
            
            // Focus search
            setTimeout(() => {
                const searchInput = document.getElementById('wiki-popup-search-input');
                if (searchInput) searchInput.focus();
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
    
    // ===== SET CONTEXT =====
    setContext(context) {
        this.currentContext = {
            tags: context.tags || [],
            module: context.module || null,
            questionId: context.questionId || null,
            topic: context.topic || null
        };
        console.log('📖 Wiki context set:', this.currentContext);
    },
    
    // ===== LOAD CONTENT =====
    async loadContent() {
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        // Show loading
        contentEl.innerHTML = `
            <div class="wiki-loading">
                <div class="wiki-loading-spinner">⏳</div>
                <p>Laster wiki...</p>
            </div>
        `;
        
        try {
            // Load articles from Firebase or fallback to local
            const articles = await this.loadArticles();
            this.allArticles = articles;
            
            // Render main view
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
        // Try Firebase first
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
        
        // Fallback to local WikiData
        if (typeof WikiData !== 'undefined') {
            return WikiData.articles || [];
        }
        
        // Return built-in minimal data
        return this.getBuiltInArticles();
    },
    
    // ===== BUILT-IN ARTICLES (FALLBACK) =====
    getBuiltInArticles() {
        return [
            {
                id: 'mval-8-1',
                title: 'Fradragsrett for inngående MVA',
                category: 'lovverk',
                law: 'MVAL',
                paragraph: '§ 8-1',
                tags: ['mva', 'fradrag', 'inngående', 'avgift'],
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
                related: ['mval-3-1', 'mval-5-1']
            },
            {
                id: 'rgl-5-3',
                title: 'Avskrivning av anleggsmidler',
                category: 'lovverk',
                law: 'RGL',
                paragraph: '§ 5-3',
                tags: ['avskrivning', 'anleggsmidler', 'regnskap', 'verdifall'],
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
                `,
                related: ['sktl-14-43', 'nrs-2']
            },
            {
                id: 'formula-roe',
                title: 'Egenkapitalrentabilitet (ROE)',
                category: 'formler',
                law: null,
                paragraph: null,
                tags: ['rentabilitet', 'nøkkeltall', 'analyse', 'roe', 'egenkapital'],
                summary: 'Mål på avkastning på egenkapitalen',
                content: `
                    <h2>Egenkapitalrentabilitet (ROE)</h2>
                    <p>Egenkapitalrentabiliteten viser hvor mye avkastning eierne får på sin investerte kapital.</p>
                    
                    <div class="wiki-formula-box">
                        <div class="wiki-formula-title">Formel</div>
                        <div class="wiki-formula">ROE = (Årsresultat / Gjennomsnittlig egenkapital) × 100%</div>
                    </div>
                    
                    <h3>Tolkning</h3>
                    <ul>
                        <li><strong>&gt; 15%:</strong> God rentabilitet</li>
                        <li><strong>10-15%:</strong> Akseptabel</li>
                        <li><strong>&lt; 10%:</strong> Svak - bør undersøkes</li>
                    </ul>
                    
                    <div class="wiki-info-box info">
                        <div class="wiki-info-box-title">ℹ️ Sammenligning</div>
                        Sammenlign alltid med bransjegjennomsnitt og selskapets historikk.
                    </div>
                `,
                related: ['formula-roa', 'formula-eq-ratio']
            },
            {
                id: 'concept-dobbelt',
                title: 'Dobbelt bokføring',
                category: 'konsepter',
                law: null,
                paragraph: null,
                tags: ['bokføring', 'debet', 'kredit', 'grunnleggende'],
                summary: 'Prinsippet om debet og kredit',
                content: `
                    <h2>Dobbelt bokføring</h2>
                    <p>Dobbelt bokføring er et grunnleggende prinsipp der hver transaksjon registreres på minst to kontoer - en debet og en kredit.</p>
                    
                    <h3>Hovedregelen</h3>
                    <ul>
                        <li><strong>Debet:</strong> Økning i eiendeler og kostnader</li>
                        <li><strong>Kredit:</strong> Økning i gjeld, egenkapital og inntekter</li>
                    </ul>
                    
                    <div class="wiki-info-box tip">
                        <div class="wiki-info-box-title">💡 Huskeregel</div>
                        Sum debet = Sum kredit (alltid!)
                    </div>
                    
                    <h3>Eksempel</h3>
                    <p>Kjøp av varer for 10.000 kr kontant:</p>
                    <ul>
                        <li>Debet 4000 Varekostnad: 10.000</li>
                        <li>Kredit 1920 Bank: 10.000</li>
                    </ul>
                `,
                related: ['bokl-5', 'concept-transaksjon']
            },
            {
                id: 'kontoplan-1',
                title: 'Klasse 1: Eiendeler',
                category: 'kontoplan',
                law: null,
                paragraph: null,
                tags: ['kontoplan', 'eiendeler', 'balanse', 'aktiva'],
                summary: 'Oversikt over kontoklasse 1',
                content: `
                    <h2>Kontoklasse 1: Eiendeler</h2>
                    <p>Kontoklasse 1 dekker alle eiendeler i balansen, fra anleggsmidler til omløpsmidler.</p>
                    
                    <h3>Hovedgrupper</h3>
                    <ul>
                        <li><strong>10:</strong> Immaterielle eiendeler</li>
                        <li><strong>11:</strong> Tomter, bygninger</li>
                        <li><strong>12:</strong> Transportmidler, maskiner</li>
                        <li><strong>13:</strong> Finansielle anleggsmidler</li>
                        <li><strong>14:</strong> Varelager</li>
                        <li><strong>15:</strong> Kundefordringer</li>
                        <li><strong>17:</strong> Andre fordringer</li>
                        <li><strong>19:</strong> Bankinnskudd, kontanter</li>
                    </ul>
                    
                    <div class="wiki-info-box tip">
                        <div class="wiki-info-box-title">💡 Tips</div>
                        Kontoer i klasse 1 debiteres når eiendeler øker, og krediteres når de minker.
                    </div>
                `,
                related: ['kontoplan-2', 'concept-dobbelt']
            }
        ];
    },
    
    // ===== RENDER MAIN VIEW =====
    renderMainView() {
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        let html = '';
        
        // Relevant articles section (if context has tags)
        if (this.currentContext.tags && this.currentContext.tags.length > 0) {
            const relevantArticles = this.findRelevantArticles();
            if (relevantArticles.length > 0) {
                html += `
                    <div class="wiki-relevant-section">
                        <div class="wiki-relevant-title">
                            <span>🎯</span>
                            <span>Relevant for denne oppgaven</span>
                        </div>
                        <div class="wiki-relevant-items">
                            ${relevantArticles.map(article => `
                                <div class="wiki-relevant-item" onclick="WikiPopup.showArticle('${article.id}')">
                                    <div class="wiki-relevant-item-title">${article.title}</div>
                                    <div class="wiki-relevant-item-type">${article.law ? article.law + ' ' + article.paragraph : article.category}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        // Categories
        const categories = this.groupByCategory();
        
        for (const [category, articles] of Object.entries(categories)) {
            const icon = this.getCategoryIcon(category);
            const title = this.getCategoryTitle(category);
            
            html += `
                <div class="wiki-category" data-category="${category}">
                    <div class="wiki-category-header" onclick="WikiPopup.toggleCategory('${category}')">
                        <span class="wiki-category-icon">${icon}</span>
                        <span class="wiki-category-title">${title}</span>
                        <span class="wiki-category-toggle">▼</span>
                    </div>
                    <div class="wiki-category-items">
                        ${articles.map(article => `
                            <div class="wiki-item" onclick="WikiPopup.showArticle('${article.id}')">
                                <div class="wiki-item-title">${article.title}</div>
                                <div class="wiki-item-subtitle">${article.summary || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        contentEl.innerHTML = html;
    },
    
    // ===== FIND RELEVANT ARTICLES =====
    findRelevantArticles() {
        const { tags, module, topic } = this.currentContext;
        if (!tags || tags.length === 0) return [];
        
        // Score each article
        const scored = this.allArticles.map(article => {
            let score = 0;
            const articleTags = article.tags || [];
            
            // Match tags
            for (const tag of tags) {
                if (articleTags.includes(tag.toLowerCase())) {
                    score += 10;
                }
                // Partial match
                if (articleTags.some(t => t.includes(tag.toLowerCase()) || tag.toLowerCase().includes(t))) {
                    score += 3;
                }
            }
            
            // Match module
            if (module && article.category === module) {
                score += 5;
            }
            
            // Match topic in title
            if (topic && article.title.toLowerCase().includes(topic.toLowerCase())) {
                score += 8;
            }
            
            return { article, score };
        });
        
        // Return top matches
        return scored
            .filter(s => s.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(s => s.article);
    },
    
    // ===== GROUP BY CATEGORY =====
    groupByCategory() {
        const groups = {};
        
        for (const article of this.allArticles) {
            const category = article.category || 'annet';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(article);
        }
        
        return groups;
    },
    
    // ===== GET CATEGORY ICON =====
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
    
    // ===== GET CATEGORY TITLE =====
    getCategoryTitle(category) {
        const titles = {
            'lovverk': 'Lovverk',
            'formler': 'Formler & Nøkkeltall',
            'kontoplan': 'Kontoplan',
            'konsepter': 'Konsepter',
            'standarder': 'Regnskapsstandarder',
            'annet': 'Annet'
        };
        return titles[category] || category;
    },
    
    // ===== TOGGLE CATEGORY =====
    toggleCategory(category) {
        const el = document.querySelector(`.wiki-category[data-category="${category}"]`);
        if (el) {
            el.classList.toggle('collapsed');
        }
    },
    
    // ===== SHOW ARTICLE =====
    showArticle(articleId) {
        const article = this.allArticles.find(a => a.id === articleId);
        if (!article) return;
        
        const contentEl = document.getElementById('wiki-popup-content');
        if (!contentEl) return;
        
        let html = `
            <div class="wiki-article-view">
                <button class="wiki-article-back" onclick="WikiPopup.renderMainView()">
                    ← Tilbake til oversikt
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
                        ${article.tags ? `
                            <div class="wiki-article-meta-item">
                                <span>🏷️</span>
                                <span>${article.tags.slice(0, 3).join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="wiki-article-body">
                    ${article.content}
                </div>
        `;
        
        // Related articles
        if (article.related && article.related.length > 0) {
            const relatedArticles = article.related
                .map(id => this.allArticles.find(a => a.id === id))
                .filter(a => a);
            
            if (relatedArticles.length > 0) {
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
        
        // Scroll to top
        contentEl.scrollTop = 0;
    },
    
    // ===== HANDLE SEARCH =====
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
                    <p style="font-size: 0.9em; margin-top: 10px;">Prøv et annet søkeord</p>
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
    
    // ===== SEARCH ARTICLES =====
    searchArticles(query) {
        const q = query.toLowerCase();
        
        return this.allArticles.filter(article => {
            // Search in title
            if (article.title.toLowerCase().includes(q)) return true;
            
            // Search in tags
            if (article.tags && article.tags.some(t => t.includes(q))) return true;
            
            // Search in law/paragraph
            if (article.law && article.law.toLowerCase().includes(q)) return true;
            if (article.paragraph && article.paragraph.toLowerCase().includes(q)) return true;
            
            // Search in summary
            if (article.summary && article.summary.toLowerCase().includes(q)) return true;
            
            // Search in content (less weight)
            if (article.content && article.content.toLowerCase().includes(q)) return true;
            
            return false;
        });
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => WikiPopup.init());
} else {
    WikiPopup.init();
}
