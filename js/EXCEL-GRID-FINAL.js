/**
 * ExcelGrid - Komplett Excel-lignende regneark-komponent
 * AccountingQuest - Gjenbrukbar på tvers av alle moduler
 * 
 * FUNKSJONER:
 * - Formler: =SUM(), =AVERAGE(), =MIN(), =MAX(), =ABS(), +, -, *, /
 * - Celle-referanser: A1, B2, $A1 (låst kolonne), A$1 (låst rad)
 * - Fill handle: Dra grønn sirkel for å kopiere formler/verdier
 * - Navigasjon: Piltaster, Tab, Enter
 * - Celle-klikk: Skriv = og klikk på celler for referanser
 * - Drag & drop: Støtte for å dra kontoer inn i celler
 * - Auto-beregning: Live oppdatering av avhengige formler
 * 
 * BRUK:
 * const grid = new ExcelGrid('container-id', {
 *     headers: ['Konto', 'Debet', 'Kredit'],
 *     showRowNumbers: true,
 *     allowFormulas: true,
 *     allowFillHandle: true,
 *     readonlyColumns: [0],
 *     autoSum: true,
 *     sumColumns: [1, 2]
 * });
 * 
 * grid.loadData([
 *     ['1920', 1000, ''],
 *     ['2400', '', 1000]
 * ]);
 * 
 * grid.onCellChange((row, col, value) => console.log('Changed'));
 * grid.onBalanceChange((sums) => console.log('Balance:', sums));
 * 
 * @version 2.0.0
 * @author AccountingQuest
 */

class ExcelGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('ExcelGrid: Container not found:', containerId);
            return;
        }
        
        this.options = {
            headers: options.headers || [],
            allowFormulas: options.allowFormulas !== false,
            allowCellSelection: options.allowCellSelection !== false,
            allowFillHandle: options.allowFillHandle !== false,
            allowDragDrop: options.allowDragDrop !== false,
            showRowNumbers: options.showRowNumbers !== false,
            showRowLabels: options.showRowLabels || false,
            readonlyColumns: options.readonlyColumns || [],
            columnTypes: options.columnTypes || {},
            autoSum: options.autoSum || false,
            sumColumns: options.sumColumns || [],
            formatNumbers: options.formatNumbers !== false,
            decimalPlaces: options.decimalPlaces || 2,
            ...options
        };
        
        this.data = [];
        this.cells = new Map();
        this.state = {
            selectingCell: false,
            selectingForCell: null,
            fillHandleActive: false,
            fillStartCell: null,
            fillHandleStarted: false,
            selectedCell: null
        };
        
        this.callbacks = {
            onChange: null,
            onValidate: null,
            onBalanceChange: null
        };
        
        this.recalcTimer = null;
        
        // Bind methods
        this.handleFillDrag = this.handleFillDrag.bind(this);
        this.handleFillDragTouch = this.handleFillDragTouch.bind(this);
        this.endFillHandle = this.endFillHandle.bind(this);
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = `
            <div class="excel-grid-wrapper">
                <table class="excel-table" id="${this.container.id}-table">
                    <thead id="${this.container.id}-thead"></thead>
                    <tbody id="${this.container.id}-tbody"></tbody>
                </table>
            </div>
        `;
        
        this.table = document.getElementById(`${this.container.id}-table`);
        this.thead = document.getElementById(`${this.container.id}-thead`);
        this.tbody = document.getElementById(`${this.container.id}-tbody`);
        
        this.renderHeaders();
    }
    
    renderHeaders() {
        let html = '<tr>';
        
        if (this.options.showRowNumbers) {
            html += '<th class="row-number-header">#</th>';
        }
        
        if (this.options.showRowLabels) {
            html += '<th class="row-label-header"></th>';
        }
        
        this.options.headers.forEach((header, i) => {
            const col = String.fromCharCode(65 + i);
            html += `<th data-col="${i}" title="Kolonne ${col}">${header}</th>`;
        });
        
        html += '</tr>';
        this.thead.innerHTML = html;
    }
    
    loadData(rows) {
        this.data = rows;
        this.tbody.innerHTML = '';
        this.cells.clear();
        
        rows.forEach((row, i) => this.addRow(row, i));
        
        if (this.options.autoSum && this.options.sumColumns.length > 0) {
            this.addSumRow();
        }
        
        setTimeout(() => {
            this.recalculateAll();
            this.updateSumRow();
        }, 10);
    }
    
    addRow(rowData, rowIndex) {
        const tr = document.createElement('tr');
        tr.dataset.row = rowIndex;
        let html = '';
        
        if (this.options.showRowNumbers) {
            html += `<td class="row-number">${rowIndex + 1}</td>`;
        }
        
        if (this.options.showRowLabels) {
            const first = rowData[0];
            const label = first?.rowLabel || `Rad ${rowIndex + 1}`;
            const hl = first?.highlight ? ' highlight' : '';
            html += `<td class="row-label${hl}">${label}</td>`;
        }
        
        rowData.forEach((cellData, colIndex) => {
            const readonly = this.isColumnReadonly(colIndex) || cellData?.readonly;
            const value = cellData?.value !== undefined ? cellData.value : 
                         (typeof cellData === 'object' ? '' : cellData);
            const cellId = `${rowIndex}-${colIndex}`;
            const type = this.getCellType(colIndex, cellData);
            const ph = readonly ? '' : (type === 'account' ? 'Konto' : '?');
            
            html += `
                <td class="cell-td" data-row="${rowIndex}" data-col="${colIndex}">
                    <div class="cell-wrapper">
                        <input type="text"
                               class="excel-cell ${readonly ? 'readonly' : ''} ${type}-cell"
                               value="${this.escapeHtml(value)}"
                               data-row="${rowIndex}"
                               data-col="${colIndex}"
                               data-cell-id="${cellId}"
                               data-type="${type}"
                               ${readonly ? 'readonly tabindex="-1"' : ''}
                               placeholder="${ph}"
                               autocomplete="off"
                               spellcheck="false">
                        ${!readonly && this.options.allowFillHandle ? '<div class="fill-handle" title="Dra for å kopiere"></div>' : ''}
                    </div>
                </td>
            `;
        });
        
        tr.innerHTML = html;
        this.tbody.appendChild(tr);
        
        tr.querySelectorAll('.excel-cell').forEach(cell => {
            this.cells.set(cell.dataset.cellId, cell);
            if (!cell.classList.contains('readonly')) {
                this.attachCellListeners(cell);
            }
        });
    }
    
    addSumRow() {
        const tr = document.createElement('tr');
        tr.className = 'sum-row';
        let html = '';
        
        if (this.options.showRowNumbers) html += '<td class="row-number sum-symbol">Σ</td>';
        if (this.options.showRowLabels) html += '<td class="row-label sum-label">Sum</td>';
        
        this.options.headers.forEach((_, i) => {
            if (this.options.sumColumns.includes(i)) {
                html += `<td class="cell-td sum-cell-td"><input class="excel-cell readonly sum-cell" data-sum-col="${i}" value="0" readonly tabindex="-1"></td>`;
            } else {
                html += '<td class="cell-td"></td>';
            }
        });
        
        tr.innerHTML = html;
        this.tbody.appendChild(tr);
    }
    
    updateSumRow() {
        if (!this.options.autoSum) return;
        
        const sums = {};
        this.options.sumColumns.forEach(col => {
            let sum = 0;
            this.data.forEach((_, row) => {
                const cell = this.cells.get(`${row}-${col}`);
                if (cell) sum += this.getCellNumericValue(cell);
            });
            
            const sumCell = this.tbody.querySelector(`[data-sum-col="${col}"]`);
            if (sumCell) {
                sumCell.value = this.formatValue(sum);
                sums[col] = sum;
            }
        });
        
        if (this.callbacks.onBalanceChange) {
            this.callbacks.onBalanceChange(sums);
        }
    }
    
    getCellType(col, data) {
        if (data?.type) return data.type;
        if (this.options.columnTypes[col]) return this.options.columnTypes[col];
        return 'text';
    }
    
    escapeHtml(text) {
        return text == null ? '' : String(text).replace(/"/g, '&quot;');
    }
    
    attachCellListeners(cell) {
        cell.addEventListener('keydown', e => this.handleKeydown(cell, e));
        
        cell.addEventListener('focus', () => {
            this.state.selectedCell = cell;
            cell.classList.add('selected');
            if (cell.dataset.formula) {
                cell.value = cell.dataset.formula;
                cell.select();
            }
        });
        
        cell.addEventListener('blur', () => {
            cell.classList.remove('selected');
            if (cell.value.trim().startsWith('=')) {
                this.evaluateFormula(cell);
            } else if (cell.dataset.type === 'number' && cell.value.trim()) {
                const num = this.parseNumber(cell.value);
                if (!isNaN(num)) cell.value = this.formatValue(num);
            }
            this.updateSumRow();
        });
        
        cell.addEventListener('input', () => {
            if (!cell.value.startsWith('=') && cell.dataset.formula) {
                delete cell.dataset.formula;
                delete cell.dataset.result;
            }
            
            if (cell.value === '=' && this.options.allowCellSelection) {
                this.startCellSelection(cell);
            }
            
            if (this.callbacks.onChange) {
                this.callbacks.onChange(+cell.dataset.row, +cell.dataset.col, cell.value);
            }
            
            if (this.recalcTimer) clearTimeout(this.recalcTimer);
            this.recalcTimer = setTimeout(() => {
                this.recalculateAll();
                this.updateSumRow();
            }, 100);
        });
        
        cell.addEventListener('click', e => {
            if (this.state.selectingCell && cell !== this.state.selectingForCell) {
                e.preventDefault();
                this.selectCellForFormula(cell);
            }
        });
        
        if (this.options.allowDragDrop) {
            cell.addEventListener('dragover', e => {
                e.preventDefault();
                cell.classList.add('drag-over');
            });
            cell.addEventListener('dragleave', () => cell.classList.remove('drag-over'));
            cell.addEventListener('drop', e => {
                e.preventDefault();
                cell.classList.remove('drag-over');
                const data = e.dataTransfer.getData('text/plain');
                if (data) {
                    cell.value = data;
                    cell.classList.add('drop-success');
                    setTimeout(() => cell.classList.remove('drop-success'), 500);
                    cell.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        }
        
        if (this.options.allowFillHandle) {
            const handle = cell.parentElement.querySelector('.fill-handle');
            if (handle) {
                handle.addEventListener('mousedown', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startFillHandle(cell);
                });
                handle.addEventListener('touchstart', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startFillHandle(cell);
                }, { passive: false });
            }
        }
    }
    
    handleKeydown(cell, e) {
        const key = e.key;
        
        if (key === 'Escape') {
            if (this.state.selectingCell) {
                e.preventDefault();
                this.endCellSelection();
            }
            return;
        }
        
        if (this.state.selectingCell) {
            if (key === 'Enter') {
                e.preventDefault();
                this.endCellSelection();
                this.evaluateFormula(cell);
                return;
            }
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
                e.preventDefault();
                const target = this.getAdjacentCell(cell, key);
                if (target && !target.classList.contains('readonly')) {
                    this.selectCellForFormula(target);
                }
                return;
            }
            return;
        }
        
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) {
            const pos = cell.selectionStart;
            const len = cell.value.length;
            
            if (key === 'ArrowLeft' && pos > 0) return;
            if (key === 'ArrowRight' && pos < len) return;
            
            e.preventDefault();
            
            if (key === 'Enter' && cell.value.trim().startsWith('=')) {
                this.evaluateFormula(cell);
            }
            
            this.navigate(cell, key, e.shiftKey);
            return;
        }
        
        if (key === '=' && cell.value === '' && this.options.allowCellSelection) {
            setTimeout(() => this.startCellSelection(cell), 50);
        }
    }
    
    navigate(cell, key, shift) {
        const target = this.getAdjacentCell(cell, key, shift);
        if (target) target.focus();
    }
    
    getAdjacentCell(cell, key, shift = false) {
        const td = cell.closest('td');
        const tr = td.parentElement;
        const idx = Array.from(tr.children).indexOf(td);
        
        let targetTd = null;
        
        switch(key) {
            case 'ArrowRight':
            case 'Tab':
                targetTd = shift ? td.previousElementSibling : td.nextElementSibling;
                break;
            case 'ArrowLeft':
                targetTd = td.previousElementSibling;
                break;
            case 'ArrowDown':
            case 'Enter':
                const next = tr.nextElementSibling;
                if (next && !next.classList.contains('sum-row')) targetTd = next.children[idx];
                break;
            case 'ArrowUp':
                const prev = tr.previousElementSibling;
                if (prev) targetTd = prev.children[idx];
                break;
        }
        
        return targetTd?.querySelector('.excel-cell:not(.readonly)');
    }
    
    // Formula engine
    evaluateFormula(cell) {
        const value = cell.value.trim();
        if (!value.startsWith('=')) return;
        
        const formula = value.substring(1);
        if (/[\+\-\*\/\(]$/.test(formula.trim())) {
            cell.title = 'Ufullstendig formel';
            return;
        }
        
        try {
            const result = this.calculateFormula(formula);
            
            if (isNaN(result) || !isFinite(result)) {
                cell.value = '#FEIL';
                cell.dataset.result = '0';
                cell.title = 'Ugyldig formel';
            } else {
                cell.dataset.result = result.toString();
                cell.dataset.formula = value;
                cell.value = this.formatValue(result);
                cell.title = `Formel: ${value}\nResultat: ${this.formatValue(result)}`;
                
                if (this.callbacks.onChange) {
                    this.callbacks.onChange(+cell.dataset.row, +cell.dataset.col, result);
                }
            }
        } catch (e) {
            cell.value = '#FEIL';
            cell.dataset.result = '0';
            cell.title = `Feil: ${e.message}`;
        }
        
        setTimeout(() => this.recalculateAll(), 10);
    }
    
    recalculateAll() {
        this.cells.forEach((cell, id) => {
            if (cell.dataset.formula) {
                try {
                    const result = this.calculateFormula(cell.dataset.formula.substring(1));
                    if (!isNaN(result) && isFinite(result)) {
                        cell.dataset.result = result.toString();
                        if (document.activeElement !== cell) {
                            cell.value = this.formatValue(result);
                        }
                    }
                } catch (e) {}
            }
        });
    }
    
    calculateFormula(formula) {
        formula = this.expandRangeFunctions(formula);
        
        let proc = formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/gi, (m, cl, c, rl, r) => {
            return `(${this.getCellValueByRef(c, parseInt(r) - 1)})`;
        });
        
        proc = proc.replace(/ABS\(([^)]+)\)/gi, 'Math.abs($1)');
        proc = proc.replace(/SQRT\(([^)]+)\)/gi, 'Math.sqrt($1)');
        proc = proc.replace(/×/g, '*').replace(/÷/g, '/');
        
        return eval(proc);
    }
    
    expandRangeFunctions(formula) {
        formula = formula.replace(/SUM\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (m, s, e) => {
            const cells = this.expandRange(s, e);
            return `(${cells.join('+') || '0'})`;
        });
        
        formula = formula.replace(/AVERAGE\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (m, s, e) => {
            const cells = this.expandRange(s, e);
            return cells.length ? `((${cells.join('+')})/${cells.length})` : '0';
        });
        
        formula = formula.replace(/MIN\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (m, s, e) => {
            const cells = this.expandRange(s, e);
            return `Math.min(${cells.join(',') || '0'})`;
        });
        
        formula = formula.replace(/MAX\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (m, s, e) => {
            const cells = this.expandRange(s, e);
            return `Math.max(${cells.join(',') || '0'})`;
        });
        
        return formula;
    }
    
    expandRange(start, end) {
        const sm = start.match(/([A-Z]+)(\$?)(\d+)/i);
        const em = end.match(/([A-Z]+)(\$?)(\d+)/i);
        if (!sm || !em) return [];
        
        const sc = sm[1].toUpperCase().charCodeAt(0);
        const sr = parseInt(sm[3]);
        const ec = em[1].toUpperCase().charCodeAt(0);
        const er = parseInt(em[3]);
        
        const cells = [];
        for (let r = sr; r <= er; r++) {
            for (let c = sc; c <= ec; c++) {
                cells.push(String.fromCharCode(c) + r);
            }
        }
        return cells;
    }
    
    getCellValueByRef(col, row) {
        const cell = this.cells.get(`${row}-${col.toUpperCase().charCodeAt(0) - 65}`);
        return cell ? this.getCellNumericValue(cell) : 0;
    }
    
    getCellNumericValue(cell) {
        if (cell.dataset.result !== undefined) return parseFloat(cell.dataset.result);
        const v = cell.value.trim();
        if (v.startsWith('=')) {
            try { return this.calculateFormula(v.substring(1)); }
            catch { return 0; }
        }
        return this.parseNumber(v);
    }
    
    // Cell selection for formulas
    startCellSelection(cell) {
        this.state.selectingCell = true;
        this.state.selectingForCell = cell;
        
        this.cells.forEach(c => {
            if (c !== cell && !c.classList.contains('readonly')) {
                c.classList.add('selecting-mode');
            }
        });
        
        this.showSelectionHint();
    }
    
    endCellSelection() {
        this.state.selectingCell = false;
        this.state.selectingForCell = null;
        this.cells.forEach(c => c.classList.remove('selecting-mode', 'selected-for-formula'));
        this.hideSelectionHint();
    }
    
    selectCellForFormula(target) {
        if (!this.state.selectingCell || !this.state.selectingForCell) return;
        
        const src = this.state.selectingForCell;
        const ref = this.getCellReference(target);
        
        if (ref) {
            const pos = src.selectionStart || src.value.length;
            src.value = src.value.slice(0, pos) + ref + src.value.slice(pos);
            
            target.classList.add('selected-for-formula');
            setTimeout(() => target.classList.remove('selected-for-formula'), 400);
        }
        
        setTimeout(() => {
            src.focus();
            src.setSelectionRange(src.value.length, src.value.length);
        }, 10);
    }
    
    getCellReference(cell) {
        return String.fromCharCode(65 + parseInt(cell.dataset.col)) + (parseInt(cell.dataset.row) + 1);
    }
    
    showSelectionHint() {
        this.hideSelectionHint();
        const hint = document.createElement('div');
        hint.id = 'excel-selection-hint';
        hint.className = 'cell-selection-hint';
        hint.innerHTML = '<div class="hint-icon">🎯</div><div class="hint-text"><strong>Formel-modus</strong><br>Klikk på celler eller bruk piltaster<br><small>+, -, *, / mellom • Enter = beregn • ESC = avslutt</small></div>';
        document.body.appendChild(hint);
    }
    
    hideSelectionHint() {
        document.getElementById('excel-selection-hint')?.remove();
    }
    
    // Fill handle
    startFillHandle(cell) {
        this.state.fillStartCell = cell;
        this.state.fillHandleStarted = false;
        cell.classList.add('fill-source');
        
        document.addEventListener('mousemove', this.handleFillDrag);
        document.addEventListener('mouseup', this.endFillHandle);
        document.addEventListener('touchmove', this.handleFillDragTouch, { passive: false });
        document.addEventListener('touchend', this.endFillHandle);
    }
    
    handleFillDrag(e) {
        if (!this.state.fillStartCell) return;
        this.state.fillHandleStarted = true;
        this.state.fillHandleActive = true;
        
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target?.classList.contains('excel-cell')) this.highlightFillRange(target);
    }
    
    handleFillDragTouch(e) {
        if (!this.state.fillStartCell) return;
        e.preventDefault();
        this.state.fillHandleStarted = true;
        this.state.fillHandleActive = true;
        
        const t = e.touches[0];
        const target = document.elementFromPoint(t.clientX, t.clientY);
        if (target?.classList.contains('excel-cell')) this.highlightFillRange(target);
    }
    
    highlightFillRange(target) {
        const start = this.state.fillStartCell;
        const sr = +start.dataset.row, sc = +start.dataset.col;
        const tr = +target.dataset.row, tc = +target.dataset.col;
        
        this.cells.forEach(c => { if (c !== start) c.classList.remove('filling'); });
        
        if (tc === sc && tr !== sr) {
            const [min, max] = tr > sr ? [sr + 1, tr] : [tr, sr - 1];
            for (let r = min; r <= max; r++) {
                const c = this.cells.get(`${r}-${sc}`);
                if (c && !c.classList.contains('readonly')) c.classList.add('filling');
            }
        } else if (tr === sr && tc !== sc) {
            const [min, max] = tc > sc ? [sc + 1, tc] : [tc, sc - 1];
            for (let c = min; c <= max; c++) {
                const cell = this.cells.get(`${sr}-${c}`);
                if (cell && !cell.classList.contains('readonly')) cell.classList.add('filling');
            }
        }
    }
    
    endFillHandle(e) {
        if (!this.state.fillStartCell) return;
        
        if (this.state.fillHandleStarted) {
            let x, y;
            if (e.type === 'touchend' && e.changedTouches?.length) {
                x = e.changedTouches[0].clientX;
                y = e.changedTouches[0].clientY;
            } else if (e.clientX !== undefined) {
                x = e.clientX;
                y = e.clientY;
            }
            
            if (x !== undefined) {
                const target = document.elementFromPoint(x, y);
                if (target?.classList.contains('excel-cell')) {
                    this.executeFill(this.state.fillStartCell, target);
                }
            }
        }
        
        this.cleanupFillHandle();
    }
    
    executeFill(start, end) {
        const sr = +start.dataset.row, sc = +start.dataset.col;
        const er = +end.dataset.row, ec = +end.dataset.col;
        const srcVal = start.value.trim();
        const srcFormula = start.dataset.formula || srcVal;
        
        if (ec === sc && er !== sr) {
            const dir = er > sr ? 1 : -1;
            for (let r = sr + dir; dir > 0 ? r <= er : r >= er; r += dir) {
                const cell = this.cells.get(`${r}-${sc}`);
                if (cell && !cell.classList.contains('readonly')) {
                    this.fillCell(cell, srcFormula, srcVal, r - sr, 0);
                }
            }
        } else if (er === sr && ec !== sc) {
            const dir = ec > sc ? 1 : -1;
            for (let c = sc + dir; dir > 0 ? c <= ec : c >= ec; c += dir) {
                const cell = this.cells.get(`${sr}-${c}`);
                if (cell && !cell.classList.contains('readonly')) {
                    this.fillCell(cell, srcFormula, srcVal, 0, c - sc);
                }
            }
        }
        
        this.recalculateAll();
        this.updateSumRow();
    }
    
    fillCell(cell, srcFormula, srcVal, rOff, cOff) {
        if (srcFormula.startsWith('=')) {
            const adj = this.adjustFormula(srcFormula.substring(1), rOff, cOff);
            cell.value = '=' + adj;
            cell.dataset.formula = '=' + adj;
            this.evaluateFormula(cell);
        } else {
            const num = this.parseNumber(srcVal);
            if (!isNaN(num) && (rOff || cOff)) {
                cell.value = this.formatValue(num + rOff + cOff);
            } else {
                cell.value = srcVal;
            }
        }
    }
    
    adjustFormula(formula, rOff, cOff) {
        return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/gi, (m, cl, c, rl, r) => {
            let nc = c, nr = parseInt(r);
            if (!cl && cOff) nc = String.fromCharCode(c.charCodeAt(0) + cOff);
            if (!rl && rOff) nr = parseInt(r) + rOff;
            return (cl || '') + nc + (rl || '') + nr;
        });
    }
    
    cleanupFillHandle() {
        this.state.fillStartCell?.classList.remove('fill-source');
        this.cells.forEach(c => c.classList.remove('filling'));
        
        document.removeEventListener('mousemove', this.handleFillDrag);
        document.removeEventListener('mouseup', this.endFillHandle);
        document.removeEventListener('touchmove', this.handleFillDragTouch);
        document.removeEventListener('touchend', this.endFillHandle);
        
        this.state.fillHandleActive = false;
        this.state.fillStartCell = null;
        this.state.fillHandleStarted = false;
    }
    
    // Utilities
    parseNumber(v) {
        if (v == null || v === '') return 0;
        return parseFloat(String(v).replace(/\s/g, '').replace(/,/g, '.')) || 0;
    }
    
    formatValue(num) {
        if (!this.options.formatNumbers) return num.toString();
        const fixed = num.toFixed(this.options.decimalPlaces);
        const [int, dec] = fixed.split('.');
        const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        if (!dec || dec === '00') return intFormatted;
        return intFormatted + ',' + dec.replace(/0+$/, '');
    }
    
    isColumnReadonly(col) {
        return this.options.readonlyColumns.includes(col);
    }
    
    // Public API
    onCellChange(cb) { this.callbacks.onChange = cb; }
    onBalanceChange(cb) { this.callbacks.onBalanceChange = cb; }
    
    getValue(row, col) {
        const cell = this.cells.get(`${row}-${col}`);
        return cell ? this.getCellNumericValue(cell) : 0;
    }
    
    setValue(row, col, value) {
        const cell = this.cells.get(`${row}-${col}`);
        if (cell && !cell.classList.contains('readonly')) {
            cell.value = value;
            if (String(value).startsWith('=')) this.evaluateFormula(cell);
            this.recalculateAll();
            this.updateSumRow();
        }
    }
    
    getAllValues() {
        return this.data.map((row, ri) => 
            row.map((_, ci) => this.cells.get(`${ri}-${ci}`)?.value || '')
        );
    }
    
    getRowObjects() {
        return this.data.map((_, ri) => {
            const obj = {};
            this.options.headers.forEach((h, ci) => {
                obj[h] = this.cells.get(`${ri}-${ci}`)?.value || '';
            });
            return obj;
        });
    }
    
    addNewRow(rowData = null) {
        const idx = this.data.length;
        const row = rowData || this.options.headers.map(() => '');
        this.data.push(row);
        
        this.tbody.querySelector('.sum-row')?.remove();
        this.addRow(row, idx);
        if (this.options.autoSum) this.addSumRow();
        this.updateSumRow();
        
        const first = this.cells.get(`${idx}-0`);
        if (first && !first.classList.contains('readonly')) first.focus();
    }
    
    removeRow(idx) {
        if (idx < 0 || idx >= this.data.length) return;
        this.data.splice(idx, 1);
        this.loadData(this.data);
    }
    
    clear() {
        this.cells.forEach(c => {
            if (!c.classList.contains('readonly')) {
                c.value = '';
                delete c.dataset.formula;
                delete c.dataset.result;
                c.title = '';
                c.classList.remove('correct', 'incorrect');
            }
        });
        this.updateSumRow();
    }
    
    markCell(row, col, ok) {
        const cell = this.cells.get(`${row}-${col}`);
        if (cell) {
            cell.classList.remove('correct', 'incorrect');
            cell.classList.add(ok ? 'correct' : 'incorrect');
        }
    }
    
    clearMarks() {
        this.cells.forEach(c => c.classList.remove('correct', 'incorrect'));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) module.exports = ExcelGrid;
if (typeof window !== 'undefined') window.ExcelGrid = ExcelGrid;
