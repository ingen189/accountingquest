/**
 * AccountingQuest - Theme Manager
 * HÃ¥ndterer tema-bytte og brukerpreferanser
 * 
 * BRUK:
 * <script src="js/theme-manager.js"></script>
 * 
 * API:
 * ThemeManager.setTheme('dark')     // dark, light, dark-blue, midnight
 * ThemeManager.setAccent('green')   // green, blue, purple, pink, orange, cyan, red
 * ThemeManager.toggle()             // Bytt mellom dark/light
 * ThemeManager.getTheme()           // Hent nÃ¥vÃ¦rende tema
 * ThemeManager.getAccent()          // Hent nÃ¥vÃ¦rende accent
 */

var ThemeManager = (function() {
    // Tilgjengelige temaer
    var themes = [
        'dark',         // Standard mÃ¸rk
        'light',        // Myk lys
        'cream',        // Varm kremfarget
        'dark-blue',    // Navy blÃ¥
        'midnight',     // Ekte svart
        'charcoal',     // MÃ¸rk grÃ¥
        'slate',        // BlÃ¥grÃ¥
        'forest',       // MÃ¸rk grÃ¸nn
        'purple-night'  // MÃ¸rk lilla
    ];
    
    var accents = [
        'green',    // ðŸ’š Standard
        'blue',     // ðŸ’™ 
        'purple',   // ðŸ’œ
        'pink',     // ðŸ’—
        'orange',   // ðŸ§¡
        'cyan',     // ðŸ©µ
        'red',      // â¤ï¸
        'yellow',   // ðŸ’›
        'teal',     // ðŸŒŠ
        'indigo'    // ðŸ’Ž
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
        
        // Lytt pÃ¥ system-endringer
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
        if (!themes.includes(theme)) {
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
                'light': '#f0f2f5',
                'dark-blue': '#0a192f',
                'midnight': '#0d0d0d'
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
        if (!accents.includes(accent)) {
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
        var newTheme = (current === 'light') ? 'dark' : 'light';
        setTheme(newTheme);
        return newTheme;
    }
    
    /**
     * Hent nÃ¥vÃ¦rende tema
     */
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || defaultTheme;
    }
    
    /**
     * Hent nÃ¥vÃ¦rende accent
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
        return getTheme() !== 'light';
    }
    
    /**
     * Generer tema-velger HTML
     * @param {string} containerId - ID til container-element
     */
    function renderThemeSelector(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        
        var themeLabels = {
            'dark': 'ðŸŒ™ MÃ¸rk',
            'light': 'â˜€ï¸ Lys',
            'dark-blue': 'ðŸŒŠ BlÃ¥',
            'midnight': 'ðŸŒ‘ Midnight'
        };
        
        var accentLabels = {
            'green': 'ðŸ’š GrÃ¸nn',
            'blue': 'ðŸ’™ BlÃ¥',
            'purple': 'ðŸ’œ Lilla',
            'pink': 'ðŸ’— Rosa',
            'orange': 'ðŸ§¡ Oransje',
            'cyan': 'ðŸ©µ Cyan',
            'red': 'â¤ï¸ RÃ¸d'
        };
        
        var currentTheme = getTheme();
        var currentAccent = getAccent();
        
        var html = '<div class="theme-selector">';
        
        // Tema-valg
        html += '<div class="theme-section">';
        html += '<h4>ðŸŽ¨ Tema</h4>';
        html += '<div class="theme-options">';
        themes.forEach(function(theme) {
            var isActive = theme === currentTheme ? ' active' : '';
            html += '<button class="theme-option' + isActive + '" data-theme="' + theme + '">' + themeLabels[theme] + '</button>';
        });
        html += '</div></div>';
        
        // Accent-valg
        html += '<div class="theme-section">';
        html += '<h4>âœ¨ Accent-farge</h4>';
        html += '<div class="accent-options">';
        accents.forEach(function(accent) {
            var isActive = accent === currentAccent ? ' active' : '';
            html += '<button class="accent-option' + isActive + '" data-accent="' + accent + '" style="--preview-color: var(--accent);">' + accentLabels[accent] + '</button>';
        });
        html += '</div></div>';
        
        html += '</div>';
        
        container.innerHTML = html;
        
        // Legg til event listeners
        container.querySelectorAll('.theme-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                setTheme(this.dataset.theme);
                renderThemeSelector(containerId); // Re-render for Ã¥ oppdatere active state
            });
        });
        
        container.querySelectorAll('.accent-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                setAccent(this.dataset.accent);
                renderThemeSelector(containerId);
            });
        });
    }
    
    // Auto-init nÃ¥r DOM er klar
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
