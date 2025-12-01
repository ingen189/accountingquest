/**
 * AccountingQuest - Main Application
 * Single Page Application med alle views
 * 
 * @version 2.0.0
 */

const App = (function() {
    'use strict';
    
    // ==================== STATE ====================
    
    const state = {
        currentView: null,
        currentModule: null,
        gameState: null,
        user: null
    };
    
    // ==================== ROUTER ====================
    
    const Router = {
        routes: {},
        
        register(path, handler) {
            this.routes[path] = handler;
        },
        
        navigate(path, pushState = true) {
            if (pushState) {
                history.pushState(null, '', '#/' + path);
            }
            this.handleRoute(path);
        },
        
        handleRoute(path) {
            path = path || '';
            
            // Finn beste match
            let handler = this.routes[path];
            let params = {};
            
            if (!handler) {
                // Prøv pattern matching
                for (const route in this.routes) {
                    if (route.includes(':')) {
                        const regex = new RegExp('^' + route.replace(/:([^/]+)/g, '([^/]+)') + '$');
                        const match = path.match(regex);
                        if (match) {
                            handler = this.routes[route];
                            const paramNames = route.match(/:([^/]+)/g) || [];
                            paramNames.forEach((name, i) => {
                                params[name.slice(1)] = match[i + 1];
                            });
                            break;
                        }
                    }
                }
            }
            
            if (handler) {
                handler(params);
            } else {
                Views.notFound();
            }
        },
        
        init() {
            window.addEventListener('hashchange', () => {
                const path = location.hash.slice(2); // Remove #/
                this.handleRoute(path);
            });
            
            // Initial route
            const path = location.hash.slice(2) || '';
            this.handleRoute(path);
        }
    };
    
    // ==================== VIEWS ====================
    
    const Views = {
        // Container
        render(html) {
            document.getElementById('app').innerHTML = html;
        },
        
        // ========== HOME ==========
        home() {
            this.render(`
                <div class="home-container">
                    <header class="home-header">
                        <h1>📚 AccountingQuest</h1>
                        <p>Lær regnskap på en morsom måte</p>
                    </header>
                    
                    <section class="modules-grid">
                        <div class="module-card" onclick="App.navigate('module/bokforing')">
                            <span class="module-icon">📒</span>
                            <h3>Bokføringsspill</h3>
                            <p>Øv på debet og kredit</p>
                        </div>
                        
                        <div class="module-card" onclick="App.navigate('module/regnskap')">
                            <span class="module-icon">📚</span>
                            <h3>Grunnleggende Regnskap</h3>
                            <p>Lær det grunnleggende</p>
                        </div>
                        
                        <div class="module-card" onclick="App.navigate('module/corporate-finance')">
                            <span class="module-icon">💼</span>
                            <h3>Corporate Finance</h3>
                            <p>NPV, WACC, CAPM og mer</p>
                        </div>
                        
                        <div class="module-card" onclick="App.navigate('module/analyse')">
                            <span class="module-icon">📊</span>
                            <h3>Regnskapsanalyse</h3>
                            <p>Analyser nøkkeltall</p>
                        </div>
                        
                        <div class="module-card" onclick="App.navigate('module/case-studies')">
                            <span class="module-icon">📋</span>
                            <h3>Case-studier</h3>
                            <p>Realistiske scenarioer</p>
                        </div>
                        
                        <div class="module-card" onclick="App.navigate('quiz')">
                            <span class="module-icon">❓</span>
                            <h3>Quiz</h3>
                            <p>Test kunnskapene dine</p>
                        </div>
                    </section>
                    
                    <section class="quick-actions">
                        <button class="btn btn-primary" onclick="App.navigate('student/join')">
                            🎮 Bli med i spill
                        </button>
                        <button class="btn btn-secondary" onclick="App.navigate('teacher')">
                            👨‍🏫 Lærerportal
                        </button>
                    </section>
                </div>
            `);
        },
        
        // ========== QUIZ MODULE ==========
        async quiz() {
            this.render(`
                <div class="module-container">
                    <header class="module-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>❓ Quiz</h1>
                        <div class="header-stats">
                            <span id="score-display">Poeng: 0</span>
                        </div>
                    </header>
                    
                    <div class="topic-selector" id="topic-selector">
                        <h3>Velg tema</h3>
                        <div class="topic-grid" id="topic-grid">
                            <div class="topic-card loading">Laster...</div>
                        </div>
                    </div>
                    
                    <div class="question-area" id="question-area" style="display:none;">
                        <div class="question-box" id="question-box"></div>
                        <div class="options-container" id="options-container"></div>
                        <div class="question-controls">
                            <button class="btn" id="btn-check" onclick="Modules.Quiz.checkAnswer()">Sjekk svar</button>
                            <button class="btn btn-primary" id="btn-next" onclick="Modules.Quiz.nextQuestion()" style="display:none;">Neste →</button>
                        </div>
                    </div>
                </div>
            `);
            
            await Modules.Quiz.init();
        },
        
        // ========== CORPORATE FINANCE ==========
        async corporateFinance() {
            this.render(`
                <div class="module-container sidebar-layout">
                    <aside class="sidebar" id="sidebar">
                        <div class="sidebar-section">
                            <h3>📚 Temaer</h3>
                            <div class="topic-list" id="topic-list"></div>
                        </div>
                        <div class="sidebar-section">
                            <h3>📐 Formler</h3>
                            <div class="formula-list" id="formula-list"></div>
                        </div>
                    </aside>
                    
                    <main class="main-content">
                        <header class="module-header">
                            <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                            <h1>💼 Corporate Finance</h1>
                            <div class="header-stats">
                                <span>Spørsmål: <strong id="q-progress">0/0</strong></span>
                                <span>Poeng: <strong id="q-score">0</strong></span>
                            </div>
                        </header>
                        
                        <div class="question-selector" id="question-selector"></div>
                        <div class="progress-bar-container"><div class="progress-bar" id="progress-bar"></div></div>
                        
                        <div class="workspace" id="workspace">
                            <div class="welcome-message">
                                <h2>Velkommen til Corporate Finance!</h2>
                                <p>Velg et tema fra menyen til venstre for å starte.</p>
                            </div>
                        </div>
                    </main>
                </div>
            `);
            
            if (window.CorporateFinanceModule) {
                await window.CorporateFinanceModule.init();
            }
        },
        
        // ========== GRUNNLEGGENDE REGNSKAP ==========
        async grunnleggendeRegnskap() {
            this.render(`
                <div class="module-container sidebar-layout">
                    <aside class="sidebar" id="sidebar">
                        <div class="sidebar-section">
                            <h3>📚 Temaer</h3>
                            <div class="topic-list" id="topic-list"></div>
                        </div>
                        <div class="sidebar-section">
                            <h3>📐 Formler</h3>
                            <div class="formula-list" id="formula-list"></div>
                        </div>
                        <div class="sidebar-section" id="accounts-section" style="display:none;">
                            <h3>🏦 Kontoer</h3>
                            <div class="account-list" id="account-list"></div>
                        </div>
                    </aside>
                    
                    <main class="main-content">
                        <header class="module-header">
                            <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                            <h1>📚 Grunnleggende Regnskap</h1>
                            <div class="header-stats">
                                <span>Oppgave: <strong id="q-progress">0/0</strong></span>
                                <span>Poeng: <strong id="q-score">0</strong></span>
                            </div>
                        </header>
                        
                        <div class="question-selector" id="question-selector"></div>
                        <div class="progress-bar-container"><div class="progress-bar" id="progress-bar"></div></div>
                        
                        <div class="workspace" id="workspace">
                            <div class="welcome-message">
                                <h2>Velkommen!</h2>
                                <p>Velg et tema fra menyen til venstre for å starte.</p>
                            </div>
                        </div>
                    </main>
                </div>
            `);
            
            if (window.GrunnleggendeRegnskapModule) {
                await window.GrunnleggendeRegnskapModule.init();
            }
        },
        
        // ========== BOKFØRINGSSPILL ==========
        async bokforing() {
            this.render(`
                <div class="module-container">
                    <header class="module-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>📒 Bokføringsspill</h1>
                        <div class="header-stats">
                            <span>Oppgave: <strong id="task-num">1</strong>/<strong id="task-total">36</strong></span>
                            <span>Poeng: <strong id="score">0</strong></span>
                        </div>
                    </header>
                    
                    <div class="bokforing-workspace">
                        <div class="task-description" id="task-description">
                            Laster oppgave...
                        </div>
                        
                        <div class="excel-grid-container" id="excel-grid">
                            <!-- Excel grid rendres her -->
                        </div>
                        
                        <div class="account-selector" id="account-selector">
                            <h4>Kontoplan</h4>
                            <div class="account-list" id="account-list"></div>
                        </div>
                        
                        <div class="controls">
                            <button class="btn" onclick="Modules.Bokforing.checkAnswer()">Sjekk svar</button>
                            <button class="btn btn-secondary" onclick="Modules.Bokforing.showHint()">💡 Hint</button>
                            <button class="btn btn-primary" onclick="Modules.Bokforing.nextTask()">Neste →</button>
                        </div>
                    </div>
                </div>
            `);
            
            await Modules.Bokforing.init();
        },
        
        // ========== REGNSKAPSANALYSE ==========
        async regnskapsanalyse() {
            this.render(`
                <div class="module-container">
                    <header class="module-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>📊 Regnskapsanalyse</h1>
                    </header>
                    
                    <div class="analyse-workspace" id="workspace">
                        <p>Laster regnskapsanalyse-modulen...</p>
                    </div>
                </div>
            `);
            
            await Modules.Regnskapsanalyse.init();
        },
        
        // ========== CASE STUDIES ==========
        async caseStudies() {
            this.render(`
                <div class="module-container">
                    <header class="module-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>📋 Case-studier</h1>
                    </header>
                    
                    <div class="case-selector" id="case-selector">
                        <p>Laster case-studier...</p>
                    </div>
                </div>
            `);
            
            await Modules.CaseStudies.init();
        },
        
        // ========== STUDENT JOIN ==========
        studentJoin() {
            this.render(`
                <div class="center-container">
                    <div class="join-card">
                        <h1>🎮 Bli med i spill</h1>
                        <p>Skriv inn spillkoden fra læreren</p>
                        
                        <form id="join-form" onsubmit="return Modules.StudentJoin.submit(event)">
                            <input type="text" id="game-pin" placeholder="Spillkode (6 siffer)" 
                                   maxlength="6" pattern="[0-9]{6}" required>
                            <input type="text" id="player-name" placeholder="Ditt navn" required>
                            <button type="submit" class="btn btn-primary btn-large">Bli med!</button>
                        </form>
                        
                        <div id="join-status"></div>
                    </div>
                </div>
            `);
        },
        
        // ========== TEACHER PORTAL ==========
        async teacherPortal() {
            const user = AQ.User.get();
            if (!user || user.role !== 'teacher') {
                this.render(`
                    <div class="center-container">
                        <div class="login-card">
                            <h1>👨‍🏫 Lærerportal</h1>
                            <p>Logg inn for å administrere klasserom og quizer</p>
                            
                            <form id="teacher-login" onsubmit="return Modules.Teacher.login(event)">
                                <input type="email" id="teacher-email" placeholder="E-post" required>
                                <input type="password" id="teacher-password" placeholder="Passord" required>
                                <button type="submit" class="btn btn-primary">Logg inn</button>
                            </form>
                            
                            <p class="register-link">
                                Ny lærer? <a href="#/teacher/register">Registrer deg her</a>
                            </p>
                        </div>
                    </div>
                `);
                return;
            }
            
            this.render(`
                <div class="portal-container">
                    <header class="portal-header">
                        <h1>👨‍🏫 Lærerportal</h1>
                        <div class="user-info">
                            <span>${user.name || user.email}</span>
                            <button class="btn btn-small" onclick="Modules.Teacher.logout()">Logg ut</button>
                        </div>
                    </header>
                    
                    <nav class="portal-tabs">
                        <button class="tab active" data-tab="quizzes">📝 Mine Quizer</button>
                        <button class="tab" data-tab="classrooms">🏫 Klasserom</button>
                        <button class="tab" data-tab="games">🎮 Start Spill</button>
                        <button class="tab" data-tab="results">📊 Resultater</button>
                    </nav>
                    
                    <div class="portal-content" id="portal-content">
                        <!-- Tab content renders here -->
                    </div>
                </div>
            `);
            
            await Modules.Teacher.init();
        },
        
        // ========== CLASSROOM ==========
        async classroom() {
            this.render(`
                <div class="portal-container">
                    <header class="portal-header">
                        <button class="btn-back" onclick="App.navigate('teacher')">← Tilbake</button>
                        <h1>🏫 Klasserom</h1>
                    </header>
                    
                    <div class="classroom-grid" id="classroom-grid">
                        <p>Laster klasserom...</p>
                    </div>
                    
                    <button class="btn btn-primary fab" onclick="Modules.Classroom.showCreate()">
                        + Nytt klasserom
                    </button>
                </div>
            `);
            
            await Modules.Classroom.init();
        },
        
        // ========== STUDENT CLASSROOM ==========
        async studentClassroom() {
            this.render(`
                <div class="student-container">
                    <header class="student-header">
                        <h1>📚 Mine Klasserom</h1>
                    </header>
                    
                    <div class="classroom-list" id="classroom-list">
                        <p>Laster...</p>
                    </div>
                    
                    <div class="join-section">
                        <h3>Bli med i klasserom</h3>
                        <form id="join-classroom" onsubmit="return Modules.StudentClassroom.join(event)">
                            <input type="text" id="classroom-code" placeholder="Klasseromkode" required>
                            <button type="submit" class="btn btn-primary">Bli med</button>
                        </form>
                    </div>
                </div>
            `);
            
            await Modules.StudentClassroom.init();
        },
        
        // ========== WIKI ==========
        wiki() {
            this.render(`
                <div class="wiki-container">
                    <header class="wiki-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>📖 Wiki</h1>
                        <input type="search" id="wiki-search" placeholder="Søk..." onkeyup="Modules.Wiki.search(this.value)">
                    </header>
                    
                    <div class="wiki-content" id="wiki-content">
                        <p>Laster wiki...</p>
                    </div>
                </div>
            `);
            
            Modules.Wiki.init();
        },
        
        // ========== SETTINGS ==========
        settings() {
            const currentTheme = AQ.Theme.get();
            const currentAccent = AQ.Theme.getAccent();
            
            this.render(`
                <div class="settings-container">
                    <header class="settings-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>⚙️ Innstillinger</h1>
                    </header>
                    
                    <section class="settings-section">
                        <h3>🎨 Tema</h3>
                        <div class="theme-options">
                            ${['dark', 'light', 'cream', 'dark-blue', 'midnight', 'charcoal'].map(t => `
                                <label class="theme-option ${currentTheme === t ? 'active' : ''}">
                                    <input type="radio" name="theme" value="${t}" ${currentTheme === t ? 'checked' : ''} 
                                           onchange="App.setTheme('${t}')">
                                    <span class="theme-preview theme-${t}"></span>
                                    <span>${t.charAt(0).toUpperCase() + t.slice(1)}</span>
                                </label>
                            `).join('')}
                        </div>
                    </section>
                    
                    <section class="settings-section">
                        <h3>🌈 Aksentfarge</h3>
                        <div class="accent-options">
                            ${['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => `
                                <button class="accent-btn ${currentAccent === c ? 'active' : ''}" 
                                        style="background: ${c}" 
                                        onclick="App.setAccent('${c}')"></button>
                            `).join('')}
                        </div>
                    </section>
                    
                    <section class="settings-section">
                        <h3>💾 Data</h3>
                        <button class="btn" onclick="App.exportProgress()">Eksporter fremgang</button>
                        <button class="btn btn-danger" onclick="App.clearProgress()">Slett all fremgang</button>
                    </section>
                </div>
            `);
        },
        
        // ========== ADMIN ==========
        admin() {
            if (!AQ.User.isAdmin()) {
                this.render(`
                    <div class="center-container">
                        <div class="login-card">
                            <h1>🔐 Admin</h1>
                            <form onsubmit="return App.adminLogin(event)">
                                <input type="password" id="admin-key" placeholder="Admin-nøkkel" required>
                                <button type="submit" class="btn btn-primary">Logg inn</button>
                            </form>
                        </div>
                    </div>
                `);
                return;
            }
            
            this.render(`
                <div class="admin-container">
                    <header class="admin-header">
                        <button class="btn-back" onclick="App.navigate('')">← Tilbake</button>
                        <h1>🔐 Admin</h1>
                    </header>
                    
                    <nav class="admin-tabs">
                        <button class="tab active" onclick="Modules.Admin.showQuestions()">📝 Spørsmål</button>
                        <button class="tab" onclick="Modules.Admin.showImport()">📥 Import</button>
                        <button class="tab" onclick="Modules.Admin.showStats()">📊 Statistikk</button>
                    </nav>
                    
                    <div class="admin-content" id="admin-content"></div>
                </div>
            `);
            
            Modules.Admin.init();
        },
        
        // ========== 404 ==========
        notFound() {
            this.render(`
                <div class="center-container">
                    <div class="error-card">
                        <h1>404</h1>
                        <p>Siden ble ikke funnet</p>
                        <button class="btn btn-primary" onclick="App.navigate('')">Til forsiden</button>
                    </div>
                </div>
            `);
        }
    };
    
    // ==================== MODULES ====================
    // Koble til faktiske moduler fra modules.js
    
    const Modules = {
        // Hovedmoduler (fra modules.js)
        get GrunnleggendeRegnskap() { return window.GrunnleggendeRegnskapModule; },
        get CorporateFinance() { return window.CorporateFinanceModule; },
        
        // Quiz bruker samme som GrunnleggendeRegnskap med mixed topic
        Quiz: {
            async init() {
                if (window.GrunnleggendeRegnskapModule) {
                    await window.GrunnleggendeRegnskapModule.selectTopic('mixed');
                }
            },
            checkAnswer() {
                window.GrunnleggendeRegnskapModule?.checkAnswer();
            },
            nextQuestion() {
                window.GrunnleggendeRegnskapModule?.nextQuestion();
            }
        },
        
        // Bokføring er del av GrunnleggendeRegnskap
        Bokforing: {
            async init() {
                if (window.GrunnleggendeRegnskapModule) {
                    await window.GrunnleggendeRegnskapModule.selectTopic('bokforing');
                }
            },
            checkAnswer() { window.GrunnleggendeRegnskapModule?.checkAnswer(); },
            showHint() { window.GrunnleggendeRegnskapModule?.showHint(); },
            nextTask() { window.GrunnleggendeRegnskapModule?.nextQuestion(); }
        },
        
        Regnskapsanalyse: {
            async init() {
                if (window.GrunnleggendeRegnskapModule) {
                    await window.GrunnleggendeRegnskapModule.selectTopic('analyse');
                }
            }
        },
        
        CaseStudies: {
            async init() {
                // Case studies kan være egen modul eller del av quiz
                const workspace = document.getElementById('workspace') || document.getElementById('case-selector');
                if (workspace) {
                    workspace.innerHTML = `
                        <div class="case-list">
                            <div class="case-card" onclick="App.navigate('module/regnskap')">
                                <h3>📋 Årsregnskap AS</h3>
                                <p>Komplett årsregnskap med balanse og resultat</p>
                            </div>
                            <div class="case-card" onclick="App.navigate('module/analyse')">
                                <h3>📊 Nøkkeltallsanalyse</h3>
                                <p>Analyser et selskaps nøkkeltall</p>
                            </div>
                        </div>
                    `;
                }
            }
        },
        
        StudentJoin: {
            submit(e) {
                e.preventDefault();
                const pin = document.getElementById('game-pin').value;
                const name = document.getElementById('player-name').value;
                window.location.href = `game.html?pin=${pin}&name=${encodeURIComponent(name)}`;
                return false;
            }
        },
        
        Teacher: {
            user: null,
            
            async init() {
                this.user = AQ.User.get();
                this.showTab('quizzes');
                this.setupTabs();
            },
            
            setupTabs() {
                document.querySelectorAll('.portal-tabs .tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        this.showTab(tab.dataset.tab);
                    });
                });
            },
            
            async showTab(tabId) {
                const content = document.getElementById('portal-content');
                if (!content) return;
                
                switch (tabId) {
                    case 'quizzes':
                        content.innerHTML = '<p>Laster quizer...</p>';
                        try {
                            const data = await AQ.Quizzes.list(this.user?.id || 'demo');
                            content.innerHTML = this.renderQuizList(data.quizzes || []);
                        } catch (e) {
                            content.innerHTML = '<p>Kunne ikke laste quizer</p>';
                        }
                        break;
                    case 'classrooms':
                        content.innerHTML = '<p>Laster klasserom...</p>';
                        try {
                            const data = await AQ.Classrooms.list(this.user?.id || 'demo');
                            content.innerHTML = this.renderClassroomList(data.classrooms || []);
                        } catch (e) {
                            content.innerHTML = '<p>Kunne ikke laste klasserom</p>';
                        }
                        break;
                    case 'games':
                        content.innerHTML = this.renderStartGame();
                        break;
                    case 'results':
                        content.innerHTML = '<p>Resultater kommer snart...</p>';
                        break;
                }
            },
            
            renderQuizList(quizzes) {
                if (quizzes.length === 0) {
                    return `<div class="empty-state"><p>Ingen quizer ennå</p><button class="btn btn-primary" onclick="Modules.Teacher.createQuiz()">Lag ny quiz</button></div>`;
                }
                return `<div class="quiz-grid">${quizzes.map(q => `
                    <div class="quiz-card">
                        <h3>${q.name}</h3>
                        <p>${q.questions?.length || 0} spørsmål</p>
                        <button class="btn btn-small" onclick="Modules.Teacher.startGame('${q.id}')">Start spill</button>
                    </div>
                `).join('')}</div>`;
            },
            
            renderClassroomList(classrooms) {
                return `<div class="classroom-grid">${classrooms.map(c => `
                    <div class="classroom-card">
                        <h3>${c.name}</h3>
                        <div class="classroom-code">${c.code}</div>
                        <p>${c.studentCount || 0} elever</p>
                    </div>
                `).join('')}</div>
                <button class="btn btn-primary" onclick="Modules.Teacher.createClassroom()">+ Nytt klasserom</button>`;
            },
            
            renderStartGame() {
                return `
                    <div class="start-game-form">
                        <h3>🎮 Start nytt spill</h3>
                        <p>Velg en quiz å spille:</p>
                        <select id="quiz-select" class="form-select">
                            <option value="">Velg quiz...</option>
                        </select>
                        <button class="btn btn-primary btn-large" onclick="Modules.Teacher.launchGame()">Start spill</button>
                    </div>
                `;
            },
            
            async login(e) {
                e.preventDefault();
                const email = document.getElementById('teacher-email').value;
                const password = document.getElementById('teacher-password').value;
                
                // For nå: enkel demo-login
                AQ.User.set({ id: 'teacher_' + Date.now(), email, role: 'teacher' });
                App.navigate('teacher');
                return false;
            },
            
            logout() {
                AQ.User.clear();
                App.navigate('teacher');
            },
            
            createQuiz() {
                alert('Quiz-bygger kommer snart!');
            },
            
            createClassroom() {
                const name = prompt('Navn på klasserom:');
                if (name) {
                    AQ.Classrooms.create(name, '', this.user?.id || 'demo')
                        .then(() => this.showTab('classrooms'))
                        .catch(e => alert('Feil: ' + e.message));
                }
            },
            
            async startGame(quizId) {
                window.location.href = `game.html?host=true&quiz=${quizId}`;
            },
            
            launchGame() {
                const quizId = document.getElementById('quiz-select')?.value;
                if (quizId) {
                    this.startGame(quizId);
                } else {
                    alert('Velg en quiz først');
                }
            }
        },
        
        Classroom: {
            async init() {
                const grid = document.getElementById('classroom-grid');
                if (!grid) return;
                
                try {
                    const user = AQ.User.get();
                    const data = await AQ.Classrooms.list(user?.id || 'demo');
                    grid.innerHTML = (data.classrooms || []).map(c => `
                        <div class="classroom-card">
                            <h3>${c.name}</h3>
                            <div class="classroom-code">${c.code}</div>
                            <button class="btn" onclick="App.navigate('classroom/manage?id=${c.id}')">Administrer</button>
                        </div>
                    `).join('') || '<p>Ingen klasserom</p>';
                } catch (e) {
                    grid.innerHTML = '<p>Kunne ikke laste klasserom</p>';
                }
            },
            
            showCreate() {
                const name = prompt('Navn på klasserom:');
                if (name) {
                    const user = AQ.User.get();
                    AQ.Classrooms.create(name, '', user?.id || 'demo')
                        .then(() => this.init())
                        .catch(e => alert('Feil: ' + e.message));
                }
            }
        },
        
        StudentClassroom: {
            async init() {
                const list = document.getElementById('classroom-list');
                if (list) {
                    list.innerHTML = '<p>Logg inn for å se dine klasserom</p>';
                }
            },
            
            async join(e) {
                e.preventDefault();
                const code = document.getElementById('classroom-code').value;
                const name = prompt('Ditt navn:');
                
                if (code && name) {
                    try {
                        await AQ.Classrooms.join(code, name, '');
                        alert('Du er nå med i klasserommet!');
                        this.init();
                    } catch (e) {
                        alert('Feil: ' + e.message);
                    }
                }
                return false;
            }
        },
        
        Wiki: {
            articles: [],
            
            init() {
                this.loadArticles();
            },
            
            async loadArticles() {
                const content = document.getElementById('wiki-content');
                if (!content) return;
                
                // Demo-artikler
                this.articles = [
                    { id: 'regnskapslikningen', title: 'Regnskapslikningen', content: 'Eiendeler = Egenkapital + Gjeld...' },
                    { id: 'debet-kredit', title: 'Debet og Kredit', content: 'Debet øker eiendeler og kostnader...' },
                    { id: 'mva', title: 'Merverdiavgift', content: 'MVA er en avgift på varer og tjenester...' },
                    { id: 'avskrivning', title: 'Avskrivning', content: 'Avskrivning er fordeling av kostpris...' }
                ];
                
                content.innerHTML = this.articles.map(a => `
                    <div class="wiki-article" onclick="Modules.Wiki.showArticle('${a.id}')">
                        <h3>${a.title}</h3>
                        <p>${a.content.substring(0, 100)}...</p>
                    </div>
                `).join('');
            },
            
            search(query) {
                const content = document.getElementById('wiki-content');
                if (!content || !query) {
                    this.loadArticles();
                    return;
                }
                
                const filtered = this.articles.filter(a => 
                    a.title.toLowerCase().includes(query.toLowerCase()) ||
                    a.content.toLowerCase().includes(query.toLowerCase())
                );
                
                content.innerHTML = filtered.map(a => `
                    <div class="wiki-article" onclick="Modules.Wiki.showArticle('${a.id}')">
                        <h3>${a.title}</h3>
                        <p>${a.content.substring(0, 100)}...</p>
                    </div>
                `).join('') || '<p>Ingen treff</p>';
            },
            
            showArticle(id) {
                const article = this.articles.find(a => a.id === id);
                if (!article) return;
                
                const content = document.getElementById('wiki-content');
                content.innerHTML = `
                    <div class="wiki-article-full">
                        <button class="btn btn-back" onclick="Modules.Wiki.loadArticles()">← Tilbake</button>
                        <h2>${article.title}</h2>
                        <div class="article-content">${article.content}</div>
                    </div>
                `;
            }
        },
        
        Admin: {
            init() {
                this.showQuestions();
            },
            
            async showQuestions() {
                const content = document.getElementById('admin-content');
                if (!content) return;
                
                content.innerHTML = `
                    <div class="admin-section">
                        <h3>Spørsmål per modul</h3>
                        <div id="question-counts">Laster...</div>
                    </div>
                    <div class="admin-actions">
                        <button class="btn btn-primary" onclick="Modules.Admin.showImport()">📥 Importer spørsmål</button>
                    </div>
                `;
                
                try {
                    const modules = ['corporate_finance', 'grunnleggende_regnskap'];
                    let html = '';
                    for (const mod of modules) {
                        const data = await AQ.Questions.counts(mod);
                        html += `<div class="count-row"><strong>${mod}:</strong> ${data.total || 0} spørsmål</div>`;
                    }
                    document.getElementById('question-counts').innerHTML = html;
                } catch (e) {
                    document.getElementById('question-counts').innerHTML = 'Feil ved lasting';
                }
            },
            
            showImport() {
                const content = document.getElementById('admin-content');
                content.innerHTML = `
                    <div class="admin-section">
                        <h3>📥 Importer spørsmål</h3>
                        <select id="import-module">
                            <option value="corporate_finance">Corporate Finance</option>
                            <option value="grunnleggende_regnskap">Grunnleggende Regnskap</option>
                        </select>
                        <textarea id="import-json" rows="15" placeholder='[{"question": "...", "type": "mc", "options": [...]}]'></textarea>
                        <button class="btn btn-primary" onclick="Modules.Admin.doImport()">Importer</button>
                    </div>
                `;
            },
            
            async doImport() {
                const module = document.getElementById('import-module').value;
                const json = document.getElementById('import-json').value;
                
                try {
                    const questions = JSON.parse(json);
                    const result = await AQ.Questions.bulkImport(questions, module);
                    alert(`Importert ${result.imported} av ${result.total} spørsmål`);
                    this.showQuestions();
                } catch (e) {
                    alert('Feil: ' + e.message);
                }
            },
            
            showStats() {
                const content = document.getElementById('admin-content');
                content.innerHTML = '<p>Statistikk kommer snart...</p>';
            }
        }
    };
    
    // ==================== APP METHODS ====================
    
    function navigate(path) {
        Router.navigate(path);
    }
    
    function setTheme(theme) {
        AQ.Theme.set(theme);
        document.querySelectorAll('.theme-option').forEach(el => {
            el.classList.toggle('active', el.querySelector('input').value === theme);
        });
    }
    
    function setAccent(color) {
        AQ.Theme.setAccent(color);
        document.querySelectorAll('.accent-btn').forEach(el => {
            el.classList.toggle('active', el.style.background === color);
        });
    }
    
    function adminLogin(e) {
        e.preventDefault();
        const key = document.getElementById('admin-key').value;
        localStorage.setItem('aq_admin_key', key);
        Views.admin();
        return false;
    }
    
    function exportProgress() {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('aq_')) {
                data[key] = localStorage.getItem(key);
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'accountingquest-progress.json';
        a.click();
    }
    
    function clearProgress() {
        if (confirm('Er du sikker på at du vil slette all fremgang?')) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('aq_progress_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            alert('Fremgang slettet!');
        }
    }
    
    // ==================== INIT ====================
    
    function init() {
        // Register routes
        Router.register('', Views.home.bind(Views));
        Router.register('quiz', Views.quiz.bind(Views));
        Router.register('module/corporate-finance', Views.corporateFinance.bind(Views));
        Router.register('module/regnskap', Views.grunnleggendeRegnskap.bind(Views));
        Router.register('module/bokforing', Views.bokforing.bind(Views));
        Router.register('module/analyse', Views.regnskapsanalyse.bind(Views));
        Router.register('module/case-studies', Views.caseStudies.bind(Views));
        Router.register('student/join', Views.studentJoin.bind(Views));
        Router.register('student/classroom', Views.studentClassroom.bind(Views));
        Router.register('teacher', Views.teacherPortal.bind(Views));
        Router.register('classroom', Views.classroom.bind(Views));
        Router.register('wiki', Views.wiki.bind(Views));
        Router.register('settings', Views.settings.bind(Views));
        Router.register('admin', Views.admin.bind(Views));
        
        // Start router
        Router.init();
        
        console.log('✅ App initialized');
    }
    
    // Auto-init
    document.addEventListener('DOMContentLoaded', init);
    
    // ==================== PUBLIC ====================
    
    return {
        navigate,
        setTheme,
        setAccent,
        adminLogin,
        exportProgress,
        clearProgress,
        Modules,
        Views,
        Router,
        state
    };
})();

window.App = App;
