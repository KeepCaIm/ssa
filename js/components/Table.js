import { STELLARIS_UI } from '../core/Theme.js';

/**
 * SciFiTable
 * Reusable data grid utilizing global design tokens for dynamic row hovers, 
 * sticky headers, and pixel-perfect smooth vertical offset targeting.
 */
export class SciFiTable {
  constructor(columns, onCheckChange = null, onBatchCheckChange = null) {
    this.columns = columns;
    this.onCheckChange = onCheckChange;
    this.onBatchCheckChange = onBatchCheckChange; // Added batch handler capability
    this.sortColumnId = null;
    this.sortAscending = true;
    this.onSortCallback = null;
    
    this.wrapper = document.createElement('div');
    this.el = document.createElement('table');
    this.tbody = document.createElement('tbody');
    this.rowsCache = []; 

    this.initContainerStyles();
    this.buildHeader();
    
    this.el.appendChild(this.tbody);
    this.wrapper.appendChild(this.el);
  }

  get elNode() {
    return this.wrapper;
  }

  initContainerStyles() {
    const colors = STELLARIS_UI.colors;
    Object.assign(this.wrapper.style, {
      width: '100%',
      height: '100%',
      overflowX: 'auto', 
      overflowY: 'auto', 
      boxSizing: 'border-box',
      backgroundColor: colors.panelBg
    });

    Object.assign(this.el.style, {
      width: '100%',
      minWidth: '1100px', 
      borderCollapse: 'collapse',
      fontFamily: STELLARIS_UI.font,
      backgroundColor: 'transparent',
      border: `1px solid ${colors.border}`
    });
  }

  onSort(callback) {
    this.onSortCallback = callback;
    return this;
  }

  buildHeader() {
    this.el.innerHTML = '';
    const colors = STELLARIS_UI.colors;
    const thead = document.createElement('thead');
    thead.style.backgroundColor = colors.panelBgLight;
    thead.style.borderBottom = `2px solid ${colors.border}`;
    thead.style.position = 'sticky';
    thead.style.top = '0';
    thead.style.zIndex = '2';

    const tr = document.createElement('tr');
    this.columns.forEach(col => {
      const th = document.createElement('th');
      Object.assign(th.style, {
        padding: '12px 14px',
        textAlign: 'left',
        fontSize: '11px',
        fontWeight: 'bold',
        color: colors.textHeader,
        letterSpacing: '1px',
        width: col.width || 'auto',
        borderRight: `1px solid ${colors.border}`,
        backgroundColor: colors.panelBgLight,
        cursor: col.sortable ? 'pointer' : 'default',
        userSelect: 'none'
      });

      if (col.id === 'checkbox') {
        const headerCheck = document.createElement('input');
        headerCheck.type = 'checkbox';
        headerCheck.style.cursor = 'pointer';
        headerCheck.addEventListener('change', (e) => this.toggleAllRows(e.target.checked));
        th.appendChild(headerCheck);
      } else {
        let titleText = col.title.toUpperCase();
        if (col.sortable && this.sortColumnId === col.id) {
          titleText += this.sortAscending ? ' ▲' : ' ▼';
        }
        th.innerText = titleText;

        if (col.sortable) {
          th.addEventListener('mouseenter', () => { th.style.color = colors.borderAccent; });
          th.addEventListener('mouseleave', () => { th.style.color = colors.textHeader; });
          th.addEventListener('click', () => {
            if (this.sortColumnId === col.id) {
              this.sortAscending = !this.sortAscending;
            } else {
              this.sortColumnId = col.id;
              this.sortAscending = true;
            }
            if (this.onSortCallback !== null) {
              this.onSortCallback(this.sortColumnId, this.sortAscending);
            }
          });
        }
      }
      tr.appendChild(th);
    });
    
    thead.appendChild(tr);
    this.el.appendChild(thead);
    this.el.appendChild(this.tbody);
  }

  setData(rows, checkedIdsSet = new Set()) {
    this.tbody.innerHTML = '';
    this.rowsCache = [];
    const colors = STELLARIS_UI.colors;

    rows.forEach(rowData => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = `1px solid ${colors.border}`;
      tr.style.transition = 'background 0.1s';
      tr.setAttribute('data-row-id', String(rowData.id));

      tr.addEventListener('mouseenter', () => { tr.style.backgroundColor = colors.rowHoverBg; });
      tr.addEventListener('mouseleave', () => { tr.style.backgroundColor = 'transparent'; });

      this.columns.forEach(col => {
        const td = document.createElement('td');
        Object.assign(td.style, {
          padding: '10px 14px',
          verticalAlign: 'middle',
          borderRight: `1px solid ${colors.border}`,
          fontSize: '12px'
        });

        if (col.id === 'checkbox') {
          const rowCheck = document.createElement('input');
          rowCheck.type = 'checkbox';
          rowCheck.style.cursor = 'pointer';
          rowCheck.checked = checkedIdsSet.has(String(rowData.id));
          
          rowCheck.addEventListener('change', () => {
            if (this.onCheckChange !== null) this.onCheckChange(rowData, rowCheck.checked);
          });
          
          td.appendChild(rowCheck);
          this.rowsCache.push({ id: String(rowData.id), input: rowCheck });
        } else {
          if (col.render !== undefined && col.render !== null) {
            td.appendChild(col.render(rowData[col.id], rowData));
          } else {
            td.innerText = rowData[col.id] !== undefined ? rowData[col.id] : '';
            td.style.color = colors.textMuted;
            td.style.fontWeight = 'bold';
          }
        }
        tr.appendChild(td);
      });

      this.tbody.appendChild(tr);
    });
  }

  toggleAllRows(isChecked) {
    const batchedIds = [];
    
    // Perform rapid visual update to input nodes without firing expensive DOM events
    this.rowsCache.forEach(row => {
      if (row.input.checked !== isChecked) {
        row.input.checked = isChecked;
        batchedIds.push(row.id);
      }
    });

    // Fire a single localized atomic array change upward to the parent view
    if (this.onBatchCheckChange && batchedIds.length > 0) {
      this.onBatchCheckChange(batchedIds, isChecked);
    }
  }

  scrollToRowId(id) {
    const colors = STELLARIS_UI.colors;
    const targetElement = this.tbody.querySelector(`[data-row-id="${id}"]`);
    if (targetElement !== null) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.style.backgroundColor = colors.rowHighlightBg;
      setTimeout(() => { targetElement.style.backgroundColor = 'transparent'; }, 800);
    }
  }
}
