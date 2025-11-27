/**
 * AccountingQuest - Theme Manager
 * Håndterer tema-bytte og brukerpreferanser
 * 
 * BRUK:
 * <script src="js/theme-manager.js"></script>
 * 
 * API:
 * ThemeManager.setTheme('dark')     // dark, light, dark-blue, midnight
 * ThemeManager.setAccent('green')   // green, blue, purple, pink, orange, cyan, red
 * ThemeManager.toggle()             // Bytt mellom dark/light
 * ThemeManager.getTheme()           // Hent nåværende tema
 * ThemeManager.getAccent()          // Hent nåværende accent
 */

var ThemeManager = (function() {
    // Tilgjengelige temaer
    var themes = [
        'dark',         // Standard mørk
        'light',        // Myk lys
        'cream',        // Varm kremfarget
        'dark-blue',    // Navy blå
        'midnight',     // Ekte svart
        'charcoal',     // Mørk grå
        'slate',        // Blågrå
        'forest',       // Mørk grønn
        'purple-night'  // Mørk lilla
    ];
    
    var accents = [
        'green',    // Standard
        'blue',     
        'purple',   
        'pink',     
        'orange',   
        'cyan',     
        'red',      
        'yellow',   
        'teal',     
        'indigo'    
    ];
    
    // Storage keys
    var THEME_KEY = 'aq_theme';
    var ACCENT_KEY = 'aq_accent';
    
    // Standard verdier
    var defaultTheme = 'dark';
    var defaultAccent = 'green';
    
    /**
     * Initialiser tema fra localStorage eller system-preferanse
     */
    function init() {
        var savedTheme = localStorage.getItem(THEME_KEY);
        var savedAccent = localStorage.getItem(ACCENT_KEY);
        
        // Sjekk system-preferanse for dark mode
        if (!savedTheme) {
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            savedTheme = prefersDark ? 'dark' : 'light';
        }
        
        setTheme(savedTheme || defaultTheme);
        setAccent(savedAccent || defaultAccent);
        
        // Lytt på system-endringer
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem(THEME_KEY)) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    /**
     * Sett tema
     * @param {string} theme - dark, light, dark-blue, midnight
     */
    function setTheme(theme) {
        if (themes.indexOf(theme) === -1) {
            console.warn('ThemeManager: Ukjent tema "' + theme + '". Bruker "dark".');
            theme = defaultTheme;
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        
        // Oppdater meta theme-color for mobil
        var metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            var colors = {
                'dark': '#0f1419',
                'light': '#f5f5f0',
                'cream': '#f9f6f1',
                'dark-blue': '#0a192f',
                'midnight': '#000000',
                'charcoal': '#1a1a1a',
                'slate': '#1e293b',
                'forest': '#0d1f17',
                'purple-night': '#1a0f26'
            };
            metaTheme.setAttribute('content', colors[theme] || colors.dark);
        }
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } }));
    }
    
    /**
     * Sett accent-farge
     * @param {string} accent - green, blue, purple, pink, orange, cyan, red
     */
    function setAccent(accent) {
        if (accents.indexOf(accent) === -1) {
            console.warn('ThemeManager: Ukjent accent "' + accent + '". Bruker "green".');
            accent = defaultAccent;
        }
        
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem(ACCENT_KEY, accent);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('accentchange', { detail: { accent: accent } }));
    }
    
    /**
     * Toggle mellom dark og light
     */
    function toggle() {
        var current = getTheme();
        var newTheme = (current === 'light' || current === 'cream') ? 'dark' : 'light';
        setTheme(newTheme);
        return newTheme;
    }
    
    /**
     * Hent nåværende tema
     */
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || defaultTheme;
    }
    
    /**
     * Hent nåværende accent
     */
    function getAccent() {
        return document.documentElement.getAttribute('data-accent') || defaultAccent;
    }
    
    /**
     * Hent alle tilgjengelige temaer
     */
    function getThemes() {
        return themes.slice();
    }
    
    /**
     * Hent alle tilgjengelige accents
     */
    function getAccents() {
        return accents.slice();
    }
    
    /**
     * Sjekk om tema er dark-variant
     */
    function isDark() {
        var theme = getTheme();
        return theme !== 'light' && theme !== 'cream';
    }
    
    /**
     * Generer tema-velger HTML
     * @param {string} containerId - ID til container-element
     */
    function renderThemeSelector(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        
        var themeLabels = {
            'dark': '🌙 Mørk',
            'light': '☀️ Lys',
            'cream': '🍦 Krem',
            'dark-blue': '🌊 Blå',
            'midnight': '🌑 Midnight',
            'charcoal': '⬛ Charcoal',
            'slate': '🪨 Slate',
            'forest': '🌲 Forest',
            'purple-night': '💜 Purple'
        };
        
        var accentLabels = {
            'green': '💚 Grønn',
            'blue': '💙 Blå',
            'purple': '💜 Lilla',
            'pink': '💗 Rosa',
            'orange': '🧡 Oransje',
            'cyan': '🩵 Cyan',
            'red': '❤️ Rød',
            'yellow': '💛 Gul',
            'teal': '🌊 Teal',
            'indigo': '💎 Indigo'
        };
        
        var currentTheme = getTheme();
        var currentAccent = getAccent();
        
        var html = '<div class="theme-selector">';
        
        // Tema-valg
        html += '<div class="theme-section">';
        html += '<h4>🎨 Tema</h4>';
        html += '<div class="theme-options">';
        for (var i = 0; i < themes.length; i++) {
            var theme = themes[i];
            var isActive = theme === currentTheme ? ' active' : '';
            html += '<button class="theme-option' + isActive + '" data-theme="' + theme + '">' + (themeLabels[theme] || theme) + '</button>';
        }
        html += '</div></div>';
        
        // Accent-valg
        html += '<div class="theme-section">';
        html += '<h4>✨ Accent-farge</h4>';
        html += '<div class="accent-options">';
        for (var j = 0; j < accents.length; j++) {
            var accent = accents[j];
            var isActiveAccent = accent === currentAccent ? ' active' : '';
            html += '<button class="accent-option' + isActiveAccent + '" data-accent="' + accent + '">' + (accentLabels[accent] || accent) + '</button>';
        }
        html += '</div></div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Legg til event listeners
        var themeButtons = container.querySelectorAll('.theme-option');
        for (var k = 0; k < themeButtons.length; k++) {
            themeButtons[k].addEventListener('click', function() {
                setTheme(this.dataset.theme);
                renderThemeSelector(containerId);
            });
        }
        
        var accentButtons = container.querySelectorAll('.accent-option');
        for (var l = 0; l < accentButtons.length; l++) {
            accentButtons[l].addEventListener('click', function() {
                setAccent(this.dataset.accent);
                renderThemeSelector(containerId);
            });
        }
    }
    
    // Auto-init når DOM er klar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Public API
    return {
        init: init,
        setTheme: setTheme,
        setAccent: setAccent,
        toggle: toggle,
        getTheme: getTheme,
        getAccent: getAccent,
        getThemes: getThemes,
        getAccents: getAccents,
        isDark: isDark,
        renderThemeSelector: renderThemeSelector
    };
})();

// Eksporter for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
