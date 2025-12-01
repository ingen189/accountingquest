/**
 * AccountingQuest - Touch Drag & Drop Polyfill
 * 
 * Legg til denne scripten ETTER den eksisterende koden for å aktivere touch-støtte.
 * Dette er en "polyfill" som legger til touch-events til eksisterende drag & drop.
 * 
 * BRUK:
 * <script src="js/touch-dnd-polyfill.js"></script>
 */

(function() {
    'use strict';
    
    var touchState = {
        isDragging: false,
        dragElement: null,
        dragClone: null,
        offsetX: 0,
        offsetY: 0,
        startTime: 0
    };
    
    // Wait for DOM
    document.addEventListener('DOMContentLoaded', function() {
        // Setup touch for DnD items
        setupTouchDnD('.dnd-item');
        setupTouchDnD('.account-item');
        
        // Setup touch for fill handles
        setupTouchFillHandle();
        
        console.log('[TouchDnD] Touch polyfill initialized');
    });
    
    // Also setup when new elements are added (for dynamically rendered content)
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                setupTouchDnD('.dnd-item');
                setupTouchDnD('.account-item');
                setupTouchFillHandle();
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // ==================== DND ITEMS ====================
    
    function setupTouchDnD(selector) {
        var items = document.querySelectorAll(selector);
        
        items.forEach(function(item) {
            // Skip if already has touch handler
            if (item.dataset.touchEnabled) return;
            item.dataset.touchEnabled = 'true';
            
            item.addEventListener('touchstart', handleTouchStart, { passive: false });
        });
    }
    
    function handleTouchStart(e) {
        if (touchState.isDragging) return;
        
        var item = e.currentTarget;
        var touch = e.touches[0];
        
        touchState.isDragging = true;
        touchState.dragElement = item;
        touchState.startTime = Date.now();
        
        var rect = item.getBoundingClientRect();
        touchState.offsetX = touch.clientX - rect.left;
        touchState.offsetY = touch.clientY - rect.top;
        
        // Create drag clone
        var clone = item.cloneNode(true);
        clone.id = 'touch-drag-clone';
        clone.style.cssText = [
            'position: fixed',
            'z-index: 10000',
            'pointer-events: none',
            'opacity: 0.9',
            'transform: scale(1.05)',
            'box-shadow: 0 8px 25px rgba(0,0,0,0.4)',
            'border: 2px solid #4ade80',
            'border-radius: 8px',
            'width: ' + rect.width + 'px',
            'left: ' + (touch.clientX - touchState.offsetX) + 'px',
            'top: ' + (touch.clientY - touchState.offsetY) + 'px'
        ].join(';');
        
        document.body.appendChild(clone);
        touchState.dragClone = clone;
        
        item.classList.add('dragging');
        item.style.opacity = '0.5';
        
        e.preventDefault();
        
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchCancel);
    }
    
    function handleTouchMove(e) {
        if (!touchState.isDragging || !touchState.dragClone) return;
        e.preventDefault();
        
        var touch = e.touches[0];
        var clone = touchState.dragClone;
        
        clone.style.left = (touch.clientX - touchState.offsetX) + 'px';
        clone.style.top = (touch.clientY - touchState.offsetY) + 'px';
        
        // Find element under touch
        clone.style.display = 'none';
        var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        clone.style.display = '';
        
        // Clear all drag-over
        document.querySelectorAll('.drag-over').forEach(function(el) {
            el.classList.remove('drag-over');
        });
        
        if (elementBelow) {
            // Check for DnD target
            var target = elementBelow.closest('.dnd-target');
            if (target) {
                target.classList.add('drag-over');
                return;
            }
            
            // Check for DnD source
            var source = elementBelow.closest('#dnd-items, .dnd-items, .dnd-source');
            if (source) {
                source.classList.add('drag-over');
                return;
            }
            
            // Check for Excel cell (account drop)
            var cell = elementBelow.closest('.excel-cell.account-input, .excel-cell[data-col="account"]');
            if (cell && !cell.readOnly && !cell.classList.contains('readonly')) {
                cell.classList.add('drag-over');
            }
        }
    }
    
    function handleTouchEnd(e) {
        if (!touchState.isDragging) return;
        
        var item = touchState.dragElement;
        var clone = touchState.dragClone;
        var touch = e.changedTouches[0];
        
        // Find drop target
        if (clone) clone.style.display = 'none';
        var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        if (clone) clone.style.display = '';
        
        // Animate clone removal
        if (clone) {
            clone.style.transition = 'all 0.15s ease';
            clone.style.opacity = '0';
            clone.style.transform = 'scale(0.8)';
            setTimeout(function() {
                if (clone.parentNode) clone.parentNode.removeChild(clone);
            }, 150);
        }
        
        // Handle drop
        if (elementBelow && item) {
            // DnD target
            var target = elementBelow.closest('.dnd-target');
            if (target) {
                var itemsContainer = target.querySelector('.dnd-target-items') || target;
                itemsContainer.appendChild(item);
                playDropAnimation(item);
            }
            
            // DnD source (return)
            var source = elementBelow.closest('#dnd-items, .dnd-items, .dnd-source');
            if (source && !target) {
                source.appendChild(item);
            }
            
            // Excel cell (account)
            var cell = elementBelow.closest('.excel-cell.account-input, .excel-cell[data-col="account"]');
            if (cell && !cell.readOnly && !cell.classList.contains('readonly')) {
                var code = item.dataset.accountCode || item.dataset.code || item.textContent.split(' ')[0];
                cell.value = code;
                
                // Trigger updateAccountName if exists
                if (typeof updateAccountName === 'function') {
                    updateAccountName(cell);
                }
                // Trigger updateGridBalance if exists
                if (typeof updateGridBalance === 'function') {
                    updateGridBalance();
                }
                
                playDropAnimation(cell);
            }
        }
        
        // Cleanup
        cleanup();
    }
    
    function handleTouchCancel() {
        cleanup();
    }
    
    function cleanup() {
        if (touchState.dragElement) {
            touchState.dragElement.classList.remove('dragging');
            touchState.dragElement.style.opacity = '';
        }
        
        if (touchState.dragClone && touchState.dragClone.parentNode) {
            touchState.dragClone.parentNode.removeChild(touchState.dragClone);
        }
        
        document.querySelectorAll('.drag-over').forEach(function(el) {
            el.classList.remove('drag-over');
        });
        
        touchState.isDragging = false;
        touchState.dragElement = null;
        touchState.dragClone = null;
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchCancel);
    }
    
    function playDropAnimation(element) {
        element.classList.add('drop-success');
        setTimeout(function() {
            element.classList.remove('drop-success');
        }, 400);
    }
    
    // ==================== FILL HANDLE ====================
    
    var fillState = {
        isDragging: false,
        sourceCell: null,
        container: null
    };
    
    function setupTouchFillHandle() {
        var handles = document.querySelectorAll('.fill-handle');
        
        handles.forEach(function(handle) {
            if (handle.dataset.touchEnabled) return;
            handle.dataset.touchEnabled = 'true';
            
            handle.addEventListener('touchstart', handleFillTouchStart, { passive: false });
        });
    }
    
    function handleFillTouchStart(e) {
        if (fillState.isDragging) return;
        e.preventDefault();
        
        var handle = e.currentTarget;
        var wrapper = handle.closest('.cell-wrapper');
        var cell = wrapper ? wrapper.querySelector('.excel-cell') : handle.previousElementSibling;
        
        if (!cell) return;
        
        fillState.isDragging = true;
        fillState.sourceCell = cell;
        fillState.container = cell.closest('.excel-table, .excel-grid-wrapper');
        
        cell.classList.add('fill-source');
        
        document.addEventListener('touchmove', handleFillTouchMove, { passive: false });
        document.addEventListener('touchend', handleFillTouchEnd);
    }
    
    function handleFillTouchMove(e) {
        if (!fillState.isDragging) return;
        e.preventDefault();
        
        var touch = e.touches[0];
        
        // Clear previous filling
        document.querySelectorAll('.filling').forEach(function(el) {
            el.classList.remove('filling');
        });
        
        var elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elementBelow) {
            var cell = elementBelow.closest('.excel-cell:not(.readonly)');
            if (cell && cell !== fillState.sourceCell) {
                cell.classList.add('filling');
            }
        }
    }
    
    function handleFillTouchEnd() {
        if (!fillState.isDragging) return;
        
        var sourceValue = fillState.sourceCell.value;
        
        // Fill all marked cells
        document.querySelectorAll('.filling').forEach(function(cell) {
            cell.value = sourceValue;
            cell.classList.remove('filling');
            playDropAnimation(cell);
        });
        
        // Update balance if function exists
        if (typeof updateGridBalance === 'function') {
            updateGridBalance();
        }
        
        // Cleanup
        if (fillState.sourceCell) {
            fillState.sourceCell.classList.remove('fill-source');
        }
        
        fillState.isDragging = false;
        fillState.sourceCell = null;
        fillState.container = null;
        
        document.removeEventListener('touchmove', handleFillTouchMove);
        document.removeEventListener('touchend', handleFillTouchEnd);
    }
    
    // ==================== EXTRA CSS ====================
    
    // Add CSS if not already present
    if (!document.getElementById('touch-dnd-styles')) {
        var style = document.createElement('style');
        style.id = 'touch-dnd-styles';
        style.textContent = [
            '.dnd-item, .account-item, .fill-handle { touch-action: none; }',
            '.drop-success { animation: touchDropPulse 0.4s ease; }',
            '@keyframes touchDropPulse {',
            '  0% { background: rgba(74, 222, 128, 0.4); transform: scale(1.02); }',
            '  100% { background: inherit; transform: scale(1); }',
            '}',
            '@media (hover: none) and (pointer: coarse) {',
            '  .fill-handle { opacity: 1; width: 20px; height: 20px; }',
            '  .dnd-item { padding: 14px 20px; }',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }
    
})();
