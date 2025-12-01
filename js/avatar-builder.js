/**
 * AccountingQuest - Avatar Builder System
 * Bruker PNG-bilder i stedet for emojis
 * 
 * @version 1.0.0
 */

var AvatarBuilder = (function() {
    'use strict';

    // ==================== CONFIG ====================
    var CONFIG = {
        basePath: 'assets/avatar/',
        size: 256,
        previewSize: 150,
        thumbnailSize: 50
    };

    // ==================== ASSET DEFINITIONS ====================
    // Alle tilgjengelige avatar-deler
    // locked: true = må låses opp, unlockType: 'level-10' eller 'achievement-xyz'
    
    var ASSETS = {
        base: [
            { id: 'default', name: 'Standard', file: 'base/face_default.png', locked: false },
            { id: 'happy', name: 'Glad', file: 'base/face_happy.png', locked: false },
            { id: 'cool', name: 'Kul', file: 'base/face_cool.png', locked: false },
            { id: 'serious', name: 'Seriøs', file: 'base/face_serious.png', locked: false },
            { id: 'lion', name: 'Løve', file: 'base/face_lion.png', locked: true, unlockType: 'level', unlockValue: 10 },
            { id: 'wolf', name: 'Ulv', file: 'base/face_wolf.png', locked: true, unlockType: 'level', unlockValue: 20 },
            { id: 'fox', name: 'Rev', file: 'base/face_fox.png', locked: true, unlockType: 'level', unlockValue: 30 },
            { id: 'dragon', name: 'Drage', file: 'base/face_dragon.png', locked: true, unlockType: 'level', unlockValue: 50 }
        ],
        hair: [
            { id: 'none', name: 'Ingen', file: 'hair/hair_none.png', locked: false },
            { id: 'short', name: 'Kort', file: 'hair/hair_short.png', locked: false },
            { id: 'long', name: 'Langt', file: 'hair/hair_long.png', locked: false },
            { id: 'curly', name: 'Krøllete', file: 'hair/hair_curly.png', locked: false },
            { id: 'mohawk', name: 'Mohawk', file: 'hair/hair_mohawk.png', locked: true, unlockType: 'level', unlockValue: 15 },
            { id: 'punk', name: 'Punk', file: 'hair/hair_punk.png', locked: true, unlockType: 'achievement', unlockValue: 'streak_30' }
        ],
        accessories: [
            { id: 'none', name: 'Ingen', file: 'accessories/acc_none.png', locked: false },
            { id: 'glasses', name: 'Briller', file: 'accessories/acc_glasses.png', locked: false },
            { id: 'sunglasses', name: 'Solbriller', file: 'accessories/acc_sunglasses.png', locked: false },
            { id: 'monocle', name: 'Monokel', file: 'accessories/acc_monocle.png', locked: true, unlockType: 'level', unlockValue: 25 },
            { id: 'eyepatch', name: 'Øyelapp', file: 'accessories/acc_eyepatch.png', locked: true, unlockType: 'achievement', unlockValue: 'completionist' }
        ],
        hats: [
            { id: 'none', name: 'Ingen', file: 'hats/hat_none.png', locked: false },
            { id: 'cap', name: 'Caps', file: 'hats/hat_cap.png', locked: false },
            { id: 'tophat', name: 'Flosshatt', file: 'hats/hat_tophat.png', locked: false },
            { id: 'graduation', name: 'Student', file: 'hats/hat_graduation.png', locked: true, unlockType: 'level', unlockValue: 25 },
            { id: 'crown', name: 'Krone', file: 'hats/hat_crown.png', locked: true, unlockType: 'achievement', unlockValue: 'completionist' },
            { id: 'viking', name: 'Viking', file: 'hats/hat_viking.png', locked: true, unlockType: 'level', unlockValue: 50 }
        ],
        backgrounds: [
            { id: 'default', name: 'Standard', file: 'backgrounds/bg_default.png', locked: false },
            { id: 'gradient_purple', name: 'Lilla', file: 'backgrounds/bg_gradient_purple.png', locked: true, unlockType: 'level', unlockValue: 5 },
            { id: 'gradient_blue', name: 'Blå', file: 'backgrounds/bg_gradient_blue.png', locked: true, unlockType: 'level', unlockValue: 10 },
            { id: 'gradient_sunset', name: 'Solnedgang', file: 'backgrounds/bg_sunset.png', locked: true, unlockType: 'achievement', unlockValue: 'early_bird' },
            { id: 'stars', name: 'Stjerner', file: 'backgrounds/bg_stars.png', locked: true, unlockType: 'achievement', unlockValue: 'night_owl' },
            { id: 'forest', name: 'Skog', file: 'backgrounds/bg_forest.png', locked: true, unlockType: 'level', unlockValue: 40 }
        ],
        frames: [
            { id: 'none', name: 'Ingen', file: 'frames/frame_none.png', locked: false },
            { id: 'bronze', name: 'Bronse', file: 'frames/frame_bronze.png', locked: true, unlockType: 'level', unlockValue: 10 },
            { id: 'silver', name: 'Sølv', file: 'frames/frame_silver.png', locked: true, unlockType: 'level', unlockValue: 25 },
            { id: 'gold', name: 'Gull', file: 'frames/frame_gold.png', locked: true, unlockType: 'level', unlockValue: 50 },
            { id: 'diamond', name: 'Diamant', file: 'frames/frame_diamond.png', locked: true, unlockType: 'level', unlockValue: 100 }
        ]
    };

    // ==================== STATE ====================
    var currentAvatar = {
        base: 'default',
        hair: 'none',
        accessories: 'none',
        hats: 'none',
        backgrounds: 'default',
        frames: 'none'
    };

    var playerLevel = 1;
    var playerAchievements = [];

    // ==================== INIT ====================
    function init(options) {
        if (options) {
            if (options.basePath) CONFIG.basePath = options.basePath;
            if (options.level) playerLevel = options.level;
            if (options.achievements) playerAchievements = options.achievements;
        }

        // Load saved avatar
        var saved = localStorage.getItem('aq_avatar');
        if (saved) {
            currentAvatar = JSON.parse(saved);
        }

        console.log('[AvatarBuilder] Initialized');
    }

    // ==================== UNLOCK CHECK ====================
    function isUnlocked(asset) {
        if (!asset.locked) return true;

        if (asset.unlockType === 'level') {
            return playerLevel >= asset.unlockValue;
        }

        if (asset.unlockType === 'achievement') {
            return playerAchievements.includes(asset.unlockValue);
        }

        return false;
    }

    function getUnlockText(asset) {
        if (!asset.locked) return '';
        
        if (asset.unlockType === 'level') {
            return 'Level ' + asset.unlockValue;
        }
        
        if (asset.unlockType === 'achievement') {
            return 'Achievement: ' + asset.unlockValue;
        }
        
        return 'Låst';
    }

    // ==================== SELECTION ====================
    function selectAsset(category, assetId) {
        var asset = ASSETS[category].find(function(a) { return a.id === assetId; });
        
        if (!asset) {
            console.warn('[AvatarBuilder] Asset not found:', category, assetId);
            return false;
        }

        if (!isUnlocked(asset)) {
            console.log('[AvatarBuilder] Asset locked:', asset.name);
            return false;
        }

        currentAvatar[category] = assetId;
        save();
        
        return true;
    }

    function getSelected(category) {
        return currentAvatar[category];
    }

    // ==================== SAVE/LOAD ====================
    function save() {
        localStorage.setItem('aq_avatar', JSON.stringify(currentAvatar));
    }

    function load() {
        var saved = localStorage.getItem('aq_avatar');
        if (saved) {
            currentAvatar = JSON.parse(saved);
        }
        return currentAvatar;
    }

    // ==================== RENDERING ====================
    function getAssetUrl(category, assetId) {
        var asset = ASSETS[category].find(function(a) { return a.id === assetId; });
        if (!asset) return null;
        return CONFIG.basePath + asset.file;
    }

    /**
     * Render avatar til et container-element
     * Bruker stacked images (bakgrunn → base → hår → tilbehør → hatt → ramme)
     */
    function renderAvatar(containerId, size) {
        var container = document.getElementById(containerId);
        if (!container) return;

        size = size || CONFIG.previewSize;

        // Lag HTML med stacked layers
        var layers = [
            { category: 'backgrounds', zIndex: 1 },
            { category: 'base', zIndex: 2 },
            { category: 'hair', zIndex: 3 },
            { category: 'accessories', zIndex: 4 },
            { category: 'hats', zIndex: 5 },
            { category: 'frames', zIndex: 6 }
        ];

        var html = '<div class="avatar-stack" style="position:relative;width:' + size + 'px;height:' + size + 'px;">';
        
        layers.forEach(function(layer) {
            var assetId = currentAvatar[layer.category];
            var url = getAssetUrl(layer.category, assetId);
            
            if (url && assetId !== 'none') {
                html += '<img src="' + url + '" ' +
                    'class="avatar-layer avatar-layer-' + layer.category + '" ' +
                    'style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:' + layer.zIndex + ';" ' +
                    'alt="' + layer.category + '" ' +
                    'onerror="this.style.display=\'none\'">';
            }
        });

        html += '</div>';
        container.innerHTML = html;
    }

    /**
     * Render avatar som canvas (for eksport)
     */
    function renderToCanvas(callback, size) {
        size = size || CONFIG.size;
        
        var canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        var ctx = canvas.getContext('2d');

        var layers = ['backgrounds', 'base', 'hair', 'accessories', 'hats', 'frames'];
        var loadedCount = 0;
        var images = {};

        // Preload all images
        layers.forEach(function(category) {
            var assetId = currentAvatar[category];
            var url = getAssetUrl(category, assetId);
            
            if (url && assetId !== 'none') {
                var img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    images[category] = img;
                    loadedCount++;
                    checkDone();
                };
                img.onerror = function() {
                    loadedCount++;
                    checkDone();
                };
                img.src = url;
            } else {
                loadedCount++;
            }
        });

        function checkDone() {
            if (loadedCount >= layers.length) {
                // Draw in order
                layers.forEach(function(category) {
                    if (images[category]) {
                        ctx.drawImage(images[category], 0, 0, size, size);
                    }
                });
                
                if (callback) callback(canvas);
            }
        }

        // In case no images to load
        if (loadedCount >= layers.length) {
            checkDone();
        }
    }

    /**
     * Eksporter avatar som PNG data URL
     */
    function exportAsDataUrl(callback, size) {
        renderToCanvas(function(canvas) {
            callback(canvas.toDataURL('image/png'));
        }, size);
    }

    /**
     * Eksporter avatar som Blob for opplasting
     */
    function exportAsBlob(callback, size) {
        renderToCanvas(function(canvas) {
            canvas.toBlob(function(blob) {
                callback(blob);
            }, 'image/png');
        }, size);
    }

    // ==================== UI BUILDER ====================
    /**
     * Render komplett avatar-builder UI
     */
    function renderBuilder(containerId, options) {
        var container = document.getElementById(containerId);
        if (!container) return;

        options = options || {};
        var previewId = options.previewId || 'avatar-preview';
        var onSelect = options.onSelect || function() {};

        var html = '';

        // Preview
        html += '<div class="avatar-builder-preview">';
        html += '<div id="' + previewId + '" class="avatar-preview-container"></div>';
        html += '</div>';

        // Category tabs
        var categories = [
            { key: 'base', label: 'Ansikt', icon: '👤' },
            { key: 'hair', label: 'Hår', icon: '💇' },
            { key: 'accessories', label: 'Tilbehør', icon: '👓' },
            { key: 'hats', label: 'Hatter', icon: '🎩' },
            { key: 'backgrounds', label: 'Bakgrunn', icon: '🖼️' },
            { key: 'frames', label: 'Ramme', icon: '⭕' }
        ];

        categories.forEach(function(cat) {
            html += '<div class="avatar-category">';
            html += '<label class="avatar-category-label">' + cat.icon + ' ' + cat.label + '</label>';
            html += '<div class="avatar-options" data-category="' + cat.key + '">';
            
            ASSETS[cat.key].forEach(function(asset) {
                var unlocked = isUnlocked(asset);
                var selected = currentAvatar[cat.key] === asset.id;
                var url = CONFIG.basePath + asset.file;
                
                html += '<button class="avatar-option' + 
                    (selected ? ' selected' : '') + 
                    (unlocked ? '' : ' locked') + 
                    '" data-category="' + cat.key + 
                    '" data-id="' + asset.id + 
                    '" title="' + asset.name + (unlocked ? '' : ' (' + getUnlockText(asset) + ')') + '">';
                
                if (asset.id === 'none') {
                    html += '<span class="no-selection">✕</span>';
                } else {
                    html += '<img src="' + url + '" alt="' + asset.name + '" onerror="this.parentElement.innerHTML=\'❌\'">';
                }
                
                if (!unlocked) {
                    html += '<span class="lock-icon">🔒</span>';
                }
                
                html += '</button>';
            });
            
            html += '</div></div>';
        });

        container.innerHTML = html;

        // Render initial preview
        renderAvatar(previewId, CONFIG.previewSize);

        // Add click handlers
        container.querySelectorAll('.avatar-option').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var category = this.dataset.category;
                var id = this.dataset.id;
                
                if (this.classList.contains('locked')) {
                    var asset = ASSETS[category].find(function(a) { return a.id === id; });
                    onSelect({ locked: true, asset: asset, unlockText: getUnlockText(asset) });
                    return;
                }
                
                // Update selection
                selectAsset(category, id);
                
                // Update UI
                container.querySelectorAll('.avatar-option[data-category="' + category + '"]').forEach(function(b) {
                    b.classList.remove('selected');
                });
                this.classList.add('selected');
                
                // Re-render preview
                renderAvatar(previewId, CONFIG.previewSize);
                
                onSelect({ locked: false, category: category, id: id });
            });
        });
    }

    // ==================== PUBLIC API ====================
    return {
        init: init,
        
        // Selection
        select: selectAsset,
        getSelected: getSelected,
        getCurrentAvatar: function() { return Object.assign({}, currentAvatar); },
        
        // Unlock check
        isUnlocked: isUnlocked,
        getUnlockText: getUnlockText,
        
        // Update player data (for checking unlocks)
        setPlayerLevel: function(level) { playerLevel = level; },
        setAchievements: function(achievements) { playerAchievements = achievements; },
        
        // Rendering
        render: renderAvatar,
        renderBuilder: renderBuilder,
        
        // Export
        toDataUrl: exportAsDataUrl,
        toBlob: exportAsBlob,
        
        // Data
        save: save,
        load: load,
        
        // Assets (read-only)
        getAssets: function() { return ASSETS; },
        getConfig: function() { return CONFIG; }
    };
})();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AvatarBuilder;
}
