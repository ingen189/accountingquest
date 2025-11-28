/**
 * ExcelGrid - Reusable Excel-like spreadsheet component
 * Can be used across all AccountingQuest modules
 * 
 * Usage:
 * const grid = new ExcelGrid(containerId, options);
 * grid.loadData(rows);
 * grid.onCellChange((row, col, value) => { ... });
 */

class ExcelGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            headers: options.headers || [],
            allowFormulas: options.allowFormulas !== false,
            allowCellSelection: options.allowCellSelection !== false,
            allowFillHandle: options.allowFillHandle !== false,
            showRowNumbers: options.showRowNumbers !== false,
            readonlyColumns: options.readonlyColumns || [],
            ...options
        };
        
        this.data = [];
        this.cells = new Map(); // Map of "row-col" -> cell element
        this.state = {
            selectingCell: false,
            selectingForCell: null,
            fillHandleActive: false,
            fillStartCell: null,
            fillHandleStarted: false
        };
        
        this.callbacks = {
            onChange: null,
            onValidate: null
        };
        
        this.recalcTimer = null;
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = `
            <div class="excel-grid-wrapper">
                <table class="excel-table">
                    <thead id="${this.container.id}-thead"></thead>
                    <tbody id="${this.container.id}-tbody"></tbody>
                </table>
            </div>
        `;
        
        this.thead = document.getElementById(`${this.container.id}-thead`);
        this.tbody = document.getElementById(`${this.container.id}-tbody`);
        
        this.renderHeaders();
    }
    
    renderHeaders() {
        let headersHTML = '<tr>';
        
        if (this.options.showRowNumbers) {
            headersHTML += '<th class="row-number-header">#</th>';
        }
        
        // Add Parameter column header if we have rowLabels
        if (this.options.showRowLabels !== false) {
            headersHTML += '<th>Parameter</th>';
        }
        
        this.options.headers.forEach(header => {
            headersHTML += `<th>${header}</th>`;
        });
        
        headersHTML += '</tr>';
        this.thead.innerHTML = headersHTML;
    }
    
    loadData(rows) {
        this.data = rows;
        this.tbody.innerHTML = '';
        this.cells.clear();
        
        // Check if data has rowLabels
        if (rows.length > 0 && rows[0][0] && rows[0][0].rowLabel) {
            this.options.showRowLabels = true;
            // Re-render headers to include Parameter column
            this.renderHeaders();
        }
        
        rows.forEach((row, rowIndex) => {
            this.addRow(row, rowIndex);
        });
    }
    
    addRow(rowData, rowIndex) {
        const tr = document.createElement('tr');
        let cellHTML = '';
        
        // Row number
        if (this.options.showRowNumbers) {
            cellHTML += `<td class="row-number">${rowIndex + 1}</td>`;
        }
        
        // Check if first cell has rowLabel - add label column
        const firstCell = rowData[0];
        if (firstCell && firstCell.rowLabel) {
            const labelClass = firstCell.highlight ? 'row-label highlight' : 'row-label';
            cellHTML += `<td class="${labelClass}">${firstCell.rowLabel}</td>`;
        }
        
        // Data cells
        rowData.forEach((cellData, colIndex) => {
            const isReadonly = this.isColumnReadonly(colIndex) || cellData.readonly;
            const value = cellData.value !== undefined ? cellData.value : cellData;
            const cellId = `${rowIndex}-${colIndex}`;
            
            cellHTML += `
                <td>
                    <div class="cell-wrapper">
                        <input type="text"
                               class="excel-cell ${isReadonly ? 'readonly' : ''} ${cellData.highlight ? 'highlight' : ''}"
                               value="${value}"
                               data-row="${rowIndex}"
                               data-col="${colIndex}"
                               data-cell-id="${cellId}"
                               ${cellData.answer !== undefined ? `data-answer="${cellData.answer}"` : ''}
                               ${isReadonly ? 'readonly' : ''}
                               placeholder="${isReadonly ? '' : '?'}">
                        ${!isReadonly ? '<div class="fill-handle"></div>' : ''}
                    </div>
                </td>
            `;
        });
        
        tr.innerHTML = cellHTML;
        this.tbody.appendChild(tr);
        
        // Attach event listeners to all cells in this row
        const allCells = tr.querySelectorAll('.excel-cell');
        allCells.forEach(cell => {
            const cellId = cell.dataset.cellId;
            this.cells.set(cellId, cell);
            
            // Attach full listeners to non-readonly cells
            if (!cell.classList.contains('readonly')) {
                this.attachCellListeners(cell);
            }
        });
    }
    
    attachCellListeners(cell) {
        // Keydown for navigation
        cell.addEventListener('keydown', (e) => this.handleKeydown(cell, e));
        
        // Focus - show formula
        cell.addEventListener('focus', () => {
            if (cell.dataset.formula) {
                cell.value = cell.dataset.formula;
            }
        });
        
        // Blur - evaluate formula
        cell.addEventListener('blur', () => {
            if (cell.value.trim().startsWith('=')) {
                this.evaluateFormula(cell);
            }
        });
        
        // Input - recalculate all formulas when a value changes
        cell.addEventListener('input', () => {
            // Debounce to avoid too many recalculations
            if (this.recalcTimer) clearTimeout(this.recalcTimer);
            this.recalcTimer = setTimeout(() => {
                this.recalculateAll();
            }, 100);
        });
        
        // Click for cell selection in formulas
        cell.addEventListener('click', () => {
            if (this.state.selectingCell && cell !== this.state.selectingForCell) {
                this.selectCellForFormula(cell);
            }
        });
        
        // Fill handle (drag to copy)
        if (this.options.allowFillHandle) {
            // Add listener to the fill-handle div if it exists
            const fillHandle = cell.parentElement.querySelector('.fill-handle');
            if (fillHandle) {
                fillHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startFillHandle(cell);
                });
                fillHandle.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.startFillHandle(cell);
                }, { passive: false });
            }
        }
    }
    
    handleKeydown(cell, event) {
        const key = event.key;
        
        // Escape - end selection mode
        if (key === 'Escape' && this.state.selectingCell) {
            event.preventDefault();
            this.endCellSelection();
            return;
        }
        
        // Enter in selection mode
        if (key === 'Enter' && this.state.selectingCell) {
            event.preventDefault();
            if (cell === this.state.selectingForCell) {
                this.endCellSelection();
            } else {
                this.selectCellForFormula(cell);
            }
            return;
        }
        
        // Navigation keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(key)) {
            event.preventDefault();
            
            // Evaluate on Enter
            if (key === 'Enter' && cell.value.trim().startsWith('=')) {
                this.evaluateFormula(cell);
            }
            
            this.navigate(cell, key, event.shiftKey);
            return;
        }
        
        // Start cell selection when typing =
        if (key === '=' && cell.value === '' && this.options.allowCellSelection) {
            setTimeout(() => this.startCellSelection(cell), 10);
        }
    }
    
    navigate(cell, key, shiftKey) {
        // cell.parentElement = .cell-wrapper
        // cell.parentElement.parentElement = <td>
        // cell.parentElement.parentElement.parentElement = <tr>
        const td = cell.parentElement.parentElement;
        const row = td.parentElement;
        const cellIndex = Array.from(row.children).indexOf(td);
        const rowIndex = Array.from(this.tbody.children).indexOf(row);
        
        let targetCell = null;
        
        switch(key) {
            case 'ArrowRight':
                targetCell = td.nextElementSibling?.querySelector('.excel-cell');
                break;
            case 'ArrowLeft':
                targetCell = td.previousElementSibling?.querySelector('.excel-cell');
                break;
            case 'ArrowDown':
            case 'Enter':
                const nextRow = row.nextElementSibling;
                if (nextRow) targetCell = nextRow.children[cellIndex]?.querySelector('.excel-cell');
                break;
            case 'ArrowUp':
                const prevRow = row.previousElementSibling;
                if (prevRow) targetCell = prevRow.children[cellIndex]?.querySelector('.excel-cell');
                break;
            case 'Tab':
                targetCell = shiftKey ?
                    td.previousElementSibling?.querySelector('.excel-cell') :
                    td.nextElementSibling?.querySelector('.excel-cell');
                break;
        }
        
        if (targetCell) targetCell.focus();
    }
    
    // Formula evaluation
    evaluateFormula(cell) {
        const value = cell.value.trim();
        if (!value.startsWith('=')) return;
        
        const formula = value.substring(1);
        
        // Check for incomplete formulas
        if (/[\+\-\*\/\(]$/.test(formula.trim())) {
            cell.title = 'Ufullstendig formel';
            return;
        }
        
        try {
            const result = this.calculateFormula(formula);
            
            if (isNaN(result) || !isFinite(result)) {
                cell.dataset.result = '0';
                cell.title = 'Ugyldig formel';
            } else {
                cell.dataset.result = result.toString();
                cell.dataset.formula = value;
                cell.value = result.toFixed(2);
                cell.title = `Formel: ${value}\nResultat: ${result.toFixed(2)}`;
                
                // Trigger onChange callback
                if (this.callbacks.onChange) {
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    this.callbacks.onChange(row, col, result);
                }
                
                // Recalculate other formulas that might depend on this one
                setTimeout(() => this.recalculateAll(), 10);
            }
        } catch (e) {
            console.error('Formula error:', e);
            cell.dataset.result = '0';
            cell.title = 'Feil i formel';
        }
    }
    
    // Recalculate all formulas (when dependencies change)
    recalculateAll() {
        this.cells.forEach((cell, cellId) => {
            if (cell.dataset.formula) {
                // Re-evaluate this formula
                const formula = cell.dataset.formula.substring(1);
                try {
                    const result = this.calculateFormula(formula);
                    if (!isNaN(result) && isFinite(result)) {
                        cell.dataset.result = result.toString();
                        // Only update display if cell is not focused (not being edited)
                        if (document.activeElement !== cell) {
                            cell.value = result.toFixed(2);
                            cell.title = `Formel: ${cell.dataset.formula}\nResultat: ${result.toFixed(2)}`;
                        }
                    }
                } catch (e) {
                    console.error('Recalc error for', cellId, e);
                }
            }
        });
    }
    
    calculateFormula(formula) {
        // First, handle range functions like SUM(A1:C1), AVERAGE(A1:C1), etc.
        formula = this.expandRangeFunctions(formula);
        
        // Replace cell references (A1, B2, etc.) with values
        let processedFormula = formula.replace(/([A-Z]+)(\$?)(\d+)/gi, (match, col, lock, row) => {
            const value = this.getCellValue(col, parseInt(row) - 1);
            return `(${value})`;
        });
        
        // Replace functions
        processedFormula = processedFormula.replace(/ABS\(([^)]+)\)/gi, (match, expr) => {
            return `Math.abs(${expr})`;
        });
        
        processedFormula = processedFormula.replace(/×/g, '*').replace(/÷/g, '/');
        
        return eval(processedFormula);
    }
    
    expandRangeFunctions(formula) {
        // Handle SUM(A1:C1) -> SUM(A1,B1,C1)
        formula = formula.replace(/SUM\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (match, start, end) => {
            const cells = this.expandRange(start, end);
            return `(${cells.join('+')})`;
        });
        
        // Handle AVERAGE(A1:C1) -> (A1+B1+C1)/3
        formula = formula.replace(/AVERAGE\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (match, start, end) => {
            const cells = this.expandRange(start, end);
            return `((${cells.join('+')}))/${cells.length})`;
        });
        
        // Handle MIN(A1:C1) -> Math.min(A1,B1,C1)
        formula = formula.replace(/MIN\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (match, start, end) => {
            const cells = this.expandRange(start, end);
            return `Math.min(${cells.join(',')})`;
        });
        
        // Handle MAX(A1:C1) -> Math.max(A1,B1,C1)
        formula = formula.replace(/MAX\(([A-Z]+\$?\d+):([A-Z]+\$?\d+)\)/gi, (match, start, end) => {
            const cells = this.expandRange(start, end);
            return `Math.max(${cells.join(',')})`;
        });
        
        return formula;
    }
    
    expandRange(startRef, endRef) {
        // Parse start and end references (e.g., A1, C3)
        const startMatch = startRef.match(/([A-Z]+)(\$?)(\d+)/i);
        const endMatch = endRef.match(/([A-Z]+)(\$?)(\d+)/i);
        
        if (!startMatch || !endMatch) return [];
        
        const startCol = startMatch[1].toUpperCase();
        const startRow = parseInt(startMatch[3]);
        const endCol = endMatch[1].toUpperCase();
        const endRow = parseInt(endMatch[3]);
        
        const startColCode = startCol.charCodeAt(0);
        const endColCode = endCol.charCodeAt(0);
        
        const cells = [];
        
        // Handle horizontal range (same row, different columns)
        if (startRow === endRow) {
            for (let col = startColCode; col <= endColCode; col++) {
                cells.push(String.fromCharCode(col) + startRow);
            }
        }
        // Handle vertical range (same column, different rows)
        else if (startCol === endCol) {
            for (let row = startRow; row <= endRow; row++) {
                cells.push(startCol + row);
            }
        }
        // Handle rectangular range (multiple rows and columns)
        else {
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startColCode; col <= endColCode; col++) {
                    cells.push(String.fromCharCode(col) + row);
                }
            }
        }
        
        return cells;
    }
    
    getCellValue(colLetter, rowIndex) {
        const colIndex = colLetter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc
        const cellId = `${rowIndex}-${colIndex}`;
        const cell = this.cells.get(cellId);
        
        if (!cell) return 0;
        
        // If cell has evaluated result, use that
        if (cell.dataset.result !== undefined) {
            return parseFloat(cell.dataset.result);
        }
        
        // If cell contains formula, evaluate it recursively
        const value = cell.value.trim();
        if (value.startsWith('=')) {
            const formula = value.substring(1);
            return this.calculateFormula(formula);
        }
        
        // Parse as number
        return parseFloat(value.replace(/\s/g, '').replace(/,/g, '')) || 0;
    }
    
    // Cell selection for formulas
    startCellSelection(sourceCell) {
        this.state.selectingCell = true;
        this.state.selectingForCell = sourceCell;
        
        this.cells.forEach(cell => {
            if (cell !== sourceCell) {
                cell.classList.add('selecting-mode');
            }
        });
        
        this.showSelectionHint();
    }
    
    endCellSelection() {
        this.state.selectingCell = false;
        this.state.selectingForCell = null;
        
        this.cells.forEach(cell => {
            cell.classList.remove('selecting-mode', 'selected-for-formula');
        });
        
        this.hideSelectionHint();
    }
    
    selectCellForFormula(targetCell) {
        if (!this.state.selectingCell || !this.state.selectingForCell) return;
        
        const sourceCell = this.state.selectingForCell;
        const cellRef = this.getCellReference(targetCell);
        
        if (cellRef) {
            const cursorPos = sourceCell.selectionStart || sourceCell.value.length;
            const currentValue = sourceCell.value;
            sourceCell.value = currentValue.slice(0, cursorPos) + cellRef + currentValue.slice(cursorPos);
            
            targetCell.classList.add('selected-for-formula');
            setTimeout(() => targetCell.classList.remove('selected-for-formula'), 500);
        }
        
        setTimeout(() => {
            sourceCell.focus();
            sourceCell.setSelectionRange(sourceCell.value.length, sourceCell.value.length);
        }, 10);
    }
    
    getCellReference(cell) {
        const row = parseInt(cell.dataset.row) + 1; // 1-indexed for display
        const col = parseInt(cell.dataset.col);
        const colLetter = String.fromCharCode(65 + col); // 0=A, 1=B, etc
        return colLetter + row;
    }
    
    showSelectionHint() {
        // Hint disabled - was blocking the view
        // Users can still click cells to add them to formulas
    }
    
    hideSelectionHint() {
        const hint = document.getElementById('cell-selection-hint');
        if (hint) hint.remove();
    }
    
    // Fill handle (drag to copy formulas)
    handleFillStart(cell, e) {
        const rect = cell.getBoundingClientRect();
        const isBottomRight = (
            e.clientX > rect.right - 20 &&
            e.clientY > rect.bottom - 20
        );
        
        if (isBottomRight) {
            e.preventDefault();
            e.stopPropagation();
            this.startFillHandle(cell);
        }
    }
    
    handleFillStartTouch(cell, e) {
        const touch = e.touches[0];
        const rect = cell.getBoundingClientRect();
        const isBottomRight = (
            touch.clientX > rect.right - 25 &&
            touch.clientY > rect.bottom - 25
        );
        
        if (isBottomRight) {
            e.preventDefault();
            e.stopPropagation();
            this.startFillHandle(cell);
        }
    }
    
    startFillHandle(cell) {
        this.state.fillStartCell = cell;
        this.state.fillHandleStarted = false;
        
        document.addEventListener('mousemove', this.handleFillDrag.bind(this));
        document.addEventListener('mouseup', this.endFillHandle.bind(this));
        document.addEventListener('touchmove', this.handleFillDragTouch.bind(this), { passive: false });
        document.addEventListener('touchend', this.endFillHandle.bind(this));
    }
    
    handleFillDrag(e) {
        if (!this.state.fillStartCell) return;
        
        if (!this.state.fillHandleStarted) {
            this.state.fillHandleStarted = true;
            this.state.fillHandleActive = true;
            this.state.fillStartCell.classList.add('filling');
        }
        
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target && target.classList.contains('excel-cell')) {
            this.highlightFillRange(target);
        }
    }
    
    handleFillDragTouch(e) {
        if (!this.state.fillStartCell) return;
        e.preventDefault();
        
        if (!this.state.fillHandleStarted) {
            this.state.fillHandleStarted = true;
            this.state.fillHandleActive = true;
            this.state.fillStartCell.classList.add('filling');
        }
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains('excel-cell')) {
            this.highlightFillRange(target);
        }
    }
    
    highlightFillRange(target) {
        const startCell = this.state.fillStartCell;
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const targetRow = parseInt(target.dataset.row);
        const targetCol = parseInt(target.dataset.col);
        
        // Clear previous highlighting
        this.cells.forEach(cell => {
            if (cell !== startCell) cell.classList.remove('filling');
        });
        
        // Highlight range - allow both vertical and horizontal
        if (targetRow === startRow && targetCol > startCol) {
            // Horizontal (right)
            for (let i = startCol + 1; i <= targetCol; i++) {
                const cellId = `${startRow}-${i}`;
                const cell = this.cells.get(cellId);
                if (cell && !cell.classList.contains('readonly')) {
                    cell.classList.add('filling');
                }
            }
        } else if (targetCol === startCol && targetRow > startRow) {
            // Vertical (down)
            for (let i = startRow + 1; i <= targetRow; i++) {
                const cellId = `${i}-${startCol}`;
                const cell = this.cells.get(cellId);
                if (cell && !cell.classList.contains('readonly')) {
                    cell.classList.add('filling');
                }
            }
        }
    }
    
    endFillHandle(e) {
        if (!this.state.fillStartCell) return;
        
        if (this.state.fillHandleStarted) {
            let clientX, clientY;
            
            if (e.type === 'touchend' && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else if (e.type === 'mouseup') {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            if (clientX !== undefined) {
                const target = document.elementFromPoint(clientX, clientY);
                if (target && target.classList.contains('excel-cell')) {
                    this.copyFormula(this.state.fillStartCell, target);
                }
            }
        }
        
        this.cleanupFillHandle();
    }
    
    copyFormula(startCell, endCell) {
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const endRow = parseInt(endCell.dataset.row);
        const endCol = parseInt(endCell.dataset.col);
        
        const sourceValue = startCell.value.trim();
        const sourceFormula = startCell.dataset.formula || sourceValue;
        
        // Determine direction
        if (endRow > startRow && endCol === startCol) {
            // Vertical (down)
            this.copyFormulaVertical(startCell, startRow, endRow, startCol, sourceFormula, sourceValue);
        } else if (endCol > startCol && endRow === startRow) {
            // Horizontal (right)
            this.copyFormulaHorizontal(startCell, startRow, startCol, endCol, sourceFormula, sourceValue);
        }
    }
    
    copyFormulaVertical(startCell, startRow, endRow, col, sourceFormula, sourceValue) {
        if (sourceFormula.startsWith('=')) {
            const formula = sourceFormula.substring(1);
            
            for (let i = startRow + 1; i <= endRow; i++) {
                const cellId = `${i}-${col}`;
                const cell = this.cells.get(cellId);
                
                if (cell && !cell.classList.contains('readonly')) {
                    const rowOffset = i - startRow;
                    const adjustedFormula = this.adjustFormulaForRow(formula, rowOffset);
                    
                    cell.value = '=' + adjustedFormula;
                    cell.dataset.formula = '=' + adjustedFormula;
                    this.evaluateFormula(cell);
                }
            }
        } else {
            // Copy plain value
            for (let i = startRow + 1; i <= endRow; i++) {
                const cellId = `${i}-${col}`;
                const cell = this.cells.get(cellId);
                
                if (cell && !cell.classList.contains('readonly')) {
                    cell.value = sourceValue;
                }
            }
        }
    }
    
    copyFormulaHorizontal(startCell, row, startCol, endCol, sourceFormula, sourceValue) {
        if (sourceFormula.startsWith('=')) {
            const formula = sourceFormula.substring(1);
            
            for (let i = startCol + 1; i <= endCol; i++) {
                const cellId = `${row}-${i}`;
                const cell = this.cells.get(cellId);
                
                if (cell && !cell.classList.contains('readonly')) {
                    const colOffset = i - startCol;
                    const adjustedFormula = this.adjustFormulaForColumn(formula, colOffset);
                    
                    cell.value = '=' + adjustedFormula;
                    cell.dataset.formula = '=' + adjustedFormula;
                    this.evaluateFormula(cell);
                }
            }
        } else {
            // Copy plain value
            for (let i = startCol + 1; i <= endCol; i++) {
                const cellId = `${row}-${i}`;
                const cell = this.cells.get(cellId);
                
                if (cell && !cell.classList.contains('readonly')) {
                    cell.value = sourceValue;
                }
            }
        }
    }
    
    adjustFormula(formula, rowOffset) {
        // Legacy - keep for backwards compatibility
        return this.adjustFormulaForRow(formula, rowOffset);
    }
    
    adjustFormulaForRow(formula, rowOffset) {
        // Adjust row numbers (vertical copy)
        // B$1 keeps row locked, $B1 keeps column locked
        return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/gi, (match, colLock, col, rowLock, row) => {
            const newCol = colLock ? colLock + col : col;
            const newRow = rowLock ? row : (parseInt(row) + rowOffset).toString();
            return newCol + (rowLock ? '$' : '') + newRow;
        });
    }
    
    adjustFormulaForColumn(formula, colOffset) {
        // Adjust column letters (horizontal copy)
        // B$1 keeps row locked, $B1 keeps column locked
        return formula.replace(/(\$?)([A-Z]+)(\$?)(\d+)/gi, (match, colLock, col, rowLock, row) => {
            let newCol;
            if (colLock) {
                // Column is locked with $
                newCol = colLock + col;
            } else {
                // Adjust column letter
                const colCode = col.charCodeAt(0);
                newCol = String.fromCharCode(colCode + colOffset);
            }
            const newRow = rowLock ? '$' + row : row;
            return newCol + newRow;
        });
    }
    
    cleanupFillHandle() {
        this.cells.forEach(cell => cell.classList.remove('filling'));
        
        document.removeEventListener('mousemove', this.handleFillDrag);
        document.removeEventListener('mouseup', this.endFillHandle);
        document.removeEventListener('touchmove', this.handleFillDragTouch);
        document.removeEventListener('touchend', this.endFillHandle);
        
        this.state.fillHandleActive = false;
        this.state.fillStartCell = null;
        this.state.fillHandleStarted = false;
    }
    
    // Helper methods
    isColumnReadonly(colIndex) {
        return this.options.readonlyColumns.includes(colIndex);
    }
    
    // Public API
    onCellChange(callback) {
        this.callbacks.onChange = callback;
    }
    
    onValidate(callback) {
        this.callbacks.onValidate = callback;
    }
    
    getValue(row, col) {
        const cellId = `${row}-${col}`;
        const cell = this.cells.get(cellId);
        return cell ? this.getCellValue(String.fromCharCode(65 + col), row) : null;
    }
    
    setValue(row, col, value) {
        const cellId = `${row}-${col}`;
        const cell = this.cells.get(cellId);
        if (cell) {
            cell.value = value;
            if (value.toString().startsWith('=')) {
                this.evaluateFormula(cell);
            }
        }
    }
    
    getAllValues() {
        const values = [];
        this.data.forEach((row, rowIndex) => {
            const rowValues = [];
            row.forEach((cell, colIndex) => {
                rowValues.push(this.getValue(rowIndex, colIndex));
            });
            values.push(rowValues);
        });
        return values;
    }
    
    clear() {
        this.cells.forEach(cell => {
            if (!cell.classList.contains('readonly')) {
                cell.value = '';
                delete cell.dataset.formula;
                delete cell.dataset.result;
                cell.title = '';
            }
        });
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExcelGrid;
}
