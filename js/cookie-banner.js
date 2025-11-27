/**
 * AccountingQuest Cookie Banner
 * 
 * Enkel, utvidbar cookie-banner for GDPR-compliance.
 * 
 * Bruk: Legg til <script src="js/cookie-banner.js"></script> i alle sider
 * 
 * Konfigurasjon:
 * - Fase 1 (nå): Kun informasjon om nødvendige cookies
 * - Fase 2 (senere): Legg til analytics-valg ved å sette CookieBanner.enableAnalytics = true
 */

var CookieBanner = (function() {
    'use strict';
    
    // Konfigurasjon
    var config = {
        cookieName: 'aq_cookie_consent',
        cookieExpiry: 365, // dager
        enableAnalytics: false, // Sett til true for å vise analytics-valg
        privacyUrl: 'privacy.html',
        version: '1.0' // Øk versjonen for å vise banner på nytt
    };
    
    // CSS for banneret
    var styles = `
        .aq-cookie-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--bg-secondary, #1a1f26);
            border-top: 1px solid var(--border-color, #2d3748);
            padding: 15px 20px;
            z-index: 10000;
            box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
        }
        
        @keyframes slideUp {
            from {
                transform: translateY(100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        .aq-cookie-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
        }
        
        .aq-cookie-text {
            flex: 1;
            min-width: 250px;
            color: var(--text-secondary, #9ca3af);
            font-size: 0.9em;
            line-height: 1.5;
        }
        
        .aq-cookie-text a {
            color: var(--accent, #4ade80);
            text-decoration: underline;
        }
        
        .aq-cookie-text a:hover {
            opacity: 0.8;
        }
        
        .aq-cookie-icon {
            font-size: 1.3em;
            margin-right: 8px;
        }
        
        .aq-cookie-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .aq-cookie-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.9em;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            font-family: inherit;
        }
        
        .aq-cookie-btn-primary {
            background: var(--accent, #4ade80);
            color: #000;
        }
        
        .aq-cookie-btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .aq-cookie-btn-secondary {
            background: var(--bg-tertiary, #2d3748);
            color: var(--text-primary, #e0e0e0);
            border: 1px solid var(--border-color, #374151);
        }
        
        .aq-cookie-btn-secondary:hover {
            background: var(--border-color, #374151);
        }
        
        .aq-cookie-btn-link {
            background: transparent;
            color: var(--accent, #4ade80);
            padding: 10px 15px;
        }
        
        .aq-cookie-btn-link:hover {
            text-decoration: underline;
        }
        
        /* Analytics valg (Fase 2) */
        .aq-cookie-options {
            display: none;
            width: 100%;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-color, #2d3748);
        }
        
        .aq-cookie-options.show {
            display: block;
        }
        
        .aq-cookie-option {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
            color: var(--text-secondary, #9ca3af);
            font-size: 0.9em;
        }
        
        .aq-cookie-option input[type="checkbox"] {
            width: 18px;
            height: 18px;
            accent-color: var(--accent, #4ade80);
        }
        
        .aq-cookie-option.disabled {
            opacity: 0.6;
        }
        
        .aq-cookie-option.disabled input {
            pointer-events: none;
        }
        
        @media (max-width: 600px) {
            .aq-cookie-content {
                flex-direction: column;
                text-align: center;
            }
            
            .aq-cookie-buttons {
                width: 100%;
                justify-content: center;
            }
            
            .aq-cookie-btn {
                flex: 1;
                min-width: 100px;
            }
        }
    `;
    
    // Sjekk om samtykke allerede er gitt
    function hasConsent() {
        var consent = getCookie(config.cookieName);
        if (!consent) return false;
        
        try {
            var data = JSON.parse(consent);
            return data.version === config.version;
        } catch (e) {
            return consent === 'accepted';
        }
    }
    
    // Hent cookie-verdi
    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2) {
            return decodeURIComponent(parts.pop().split(';').shift());
        }
        return null;
    }
    
    // Sett cookie
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    }
    
    // Lagre samtykke
    function saveConsent(acceptAnalytics) {
        var data = {
            version: config.version,
            timestamp: new Date().toISOString(),
            necessary: true,
            analytics: acceptAnalytics || false
        };
        setCookie(config.cookieName, JSON.stringify(data), config.cookieExpiry);
        
        // Trigger event for analytics-oppsett
        if (acceptAnalytics && typeof window.enableAnalytics === 'function') {
            window.enableAnalytics();
        }
    }
    
    // Fjern banner
    function removeBanner() {
        var banner = document.querySelector('.aq-cookie-banner');
        if (banner) {
            banner.style.animation = 'slideUp 0.3s ease-out reverse';
            setTimeout(function() {
                banner.remove();
            }, 280);
        }
    }
    
    // Vis/skjul innstillinger
    function toggleOptions() {
        var options = document.querySelector('.aq-cookie-options');
        if (options) {
            options.classList.toggle('show');
        }
    }
    
    // Godta alle
    function acceptAll() {
        saveConsent(config.enableAnalytics);
        removeBanner();
    }
    
    // Kun nødvendige
    function acceptNecessary() {
        saveConsent(false);
        removeBanner();
    }
    
    // Lagre valg
    function saveSettings() {
        var analyticsCheckbox = document.getElementById('aq-analytics-checkbox');
        var acceptAnalytics = analyticsCheckbox ? analyticsCheckbox.checked : false;
        saveConsent(acceptAnalytics);
        removeBanner();
    }
    
    // Opprett banner HTML
    function createBanner() {
        // Legg til CSS
        var styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
        
        // Lag banner
        var banner = document.createElement('div');
        banner.className = 'aq-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie-samtykke');
        
        var html = '<div class="aq-cookie-content">';
        
        // Tekst
        html += '<div class="aq-cookie-text">';
        html += '<span class="aq-cookie-icon">🍪</span>';
        
        if (config.enableAnalytics) {
            html += 'Vi bruker informasjonskapsler for å levere tjenesten og forbedre brukeropplevelsen. ';
            html += 'Du kan velge hvilke du godtar. ';
        } else {
            html += 'Vi bruker kun nødvendige informasjonskapsler for innlogging og dine preferanser. ';
            html += 'Vi sporer ikke aktiviteten din. ';
        }
        html += '<a href="' + config.privacyUrl + '">Les mer i vår personvernerklæring</a>.';
        html += '</div>';
        
        // Knapper
        html += '<div class="aq-cookie-buttons">';
        
        if (config.enableAnalytics) {
            html += '<button class="aq-cookie-btn aq-cookie-btn-secondary" onclick="CookieBanner.toggleOptions()">Innstillinger</button>';
            html += '<button class="aq-cookie-btn aq-cookie-btn-secondary" onclick="CookieBanner.acceptNecessary()">Kun nødvendige</button>';
            html += '<button class="aq-cookie-btn aq-cookie-btn-primary" onclick="CookieBanner.acceptAll()">Godta alle</button>';
        } else {
            html += '<button class="aq-cookie-btn aq-cookie-btn-primary" onclick="CookieBanner.acceptAll()">OK, jeg forstår</button>';
        }
        
        html += '</div>';
        
        // Analytics-innstillinger (Fase 2)
        if (config.enableAnalytics) {
            html += '<div class="aq-cookie-options">';
            html += '<div class="aq-cookie-option disabled">';
            html += '<input type="checkbox" checked disabled>';
            html += '<span><strong>Nødvendige</strong> – Påkrevd for at tjenesten skal fungere</span>';
            html += '</div>';
            html += '<div class="aq-cookie-option">';
            html += '<input type="checkbox" id="aq-analytics-checkbox">';
            html += '<span><strong>Analyse</strong> – Hjelper oss forbedre tjenesten (anonymt)</span>';
            html += '</div>';
            html += '<div style="margin-top: 15px;">';
            html += '<button class="aq-cookie-btn aq-cookie-btn-primary" onclick="CookieBanner.saveSettings()">Lagre valg</button>';
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        
        banner.innerHTML = html;
        document.body.appendChild(banner);
    }
    
    // Initialiser
    function init(options) {
        // Overstyr konfig
        if (options) {
            for (var key in options) {
                if (config.hasOwnProperty(key)) {
                    config[key] = options[key];
                }
            }
        }
        
        // Vent på DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                if (!hasConsent()) {
                    createBanner();
                }
            });
        } else {
            if (!hasConsent()) {
                createBanner();
            }
        }
    }
    
    // Sjekk om analytics er godkjent
    function hasAnalyticsConsent() {
        var consent = getCookie(config.cookieName);
        if (!consent) return false;
        
        try {
            var data = JSON.parse(consent);
            return data.analytics === true;
        } catch (e) {
            return false;
        }
    }
    
    // Tilbakestill samtykke (for testing eller innstillinger)
    function resetConsent() {
        document.cookie = config.cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        location.reload();
    }
    
    // Auto-init
    init();
    
    // Public API
    return {
        init: init,
        acceptAll: acceptAll,
        acceptNecessary: acceptNecessary,
        saveSettings: saveSettings,
        toggleOptions: toggleOptions,
        hasConsent: hasConsent,
        hasAnalyticsConsent: hasAnalyticsConsent,
        resetConsent: resetConsent,
        config: config
    };
})();
