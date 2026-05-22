import { STELLARIS_UI } from '../StellarisUiConstants.js';
import { UniversalSortEngine } from '../../semantic/UniversalSortEngine.js';

export class SciFiTable {
  constructor(columns, onCheckChange = null, onBatchCheckChange = null) {
    this.columns = columns; this.onCheckChange = onCheckChange; this.onBatchCheckChange = onBatchCheckChange;
    this.sortColumnId = null; this.sortColumnProperty = null; this.sortAscending = true; this.onSortCallback = null;
    this.rawRowsData = []; this.currentCheckedIds = new Set(); this.activeBadgeFilter = null; 
    this.wrapper = document.createElement('div'); this.el = document.createElement('table');
    this.tbody = document.createElement('tbody'); this.rowsCache = []; 
    this.initContainerStyles(); this.buildHeader();
    this.el.appendChild(this.tbody); this.wrapper.appendChild(this.el);
  }

  get elNode() { return this.wrapper; }

  initContainerStyles() {
    const colors = STELLARIS_UI.colors;
    Object.assign(this.wrapper.style, { width: '100%', height: '100%', overflowX: 'auto', overflowY: 'auto', boxSizing: 'border-box', backgroundColor: colors.panelBg });
    Object.assign(this.el.style, { width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontFamily: STELLARIS_UI.font, backgroundColor: 'transparent', border: `1px solid ${colors.border}` });
  }

  onSort(callback) { this.onSortCallback = callback; return this; }

  buildHeader() {
    this.el.innerHTML = ''; const colors = STELLARIS_UI.colors;
    const thead = document.createElement('thead'); thead.style.cssText = `background-color: ${colors.panelBgLight}; border-bottom: 2px solid ${colors.border}; position: sticky; top: 0; z-index: 2;`;
    const tr = document.createElement('tr');

    this.columns.forEach(col => {
      const th = document.createElement('th');
      Object.assign(th.style, { padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 'bold', color: colors.textHeader, letterSpacing: '1px', width: col.width || 'auto', borderRight: `1px solid ${colors.border}`, backgroundColor: colors.panelBgLight, cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' });

      if (col.id === 'checkbox') {
        const chk = document.createElement('input'); chk.type = 'checkbox'; chk.style.cursor = 'pointer';
        chk.addEventListener('change', (e) => this.toggleAllRows(e.target.checked)); th.appendChild(chk);
      } else {
        const opKey = col.sortKey || col.id; const targetPropKey = col.dataKey || col.id;
        let title = col.title.toUpperCase();
        
        // Match active indicator state cleanly across baseline IDs, dynamic keys, and custom arrows mappings
        const isCurrentActive = (this.sortColumnProperty === col.id || this.sortColumnProperty === targetPropKey || (col.arrowKey && this.sortColumnProperty === col.dataKey));
        if (col.sortable && isCurrentActive) {
          title += this.sortAscending ? ' ▲' : ' ▼';
        }
        th.innerText = title;

        if (col.sortable) {
          th.addEventListener('mouseenter', () => { th.style.color = colors.borderAccent; });
          th.addEventListener('mouseleave', () => { th.style.color = colors.textHeader; });
          th.addEventListener('click', () => {
            if (this.sortColumnProperty === targetPropKey) this.sortAscending = !this.sortAscending;
            else { this.sortColumnId = opKey; this.sortColumnProperty = targetPropKey; this.sortAscending = true; }
            if (this.onSortCallback) this.onSortCallback(col.id, this.sortAscending, targetPropKey);
          });
        }
      }
      tr.appendChild(th);
    });
    thead.appendChild(tr); this.el.appendChild(thead); this.el.appendChild(this.tbody);
  }

  executeInternalSort() {
    if (!this.sortColumnId) return;
    const sorted = UniversalSortEngine.sort(this.rawRowsData, this.sortColumnId, this.sortAscending, this.activeBadgeFilter, this.sortColumnProperty);
    this.renderRows(sorted); this.buildHeader(); 
    
    // Safely reset the vertical scroll offset to the top whenever any sorting layout runs
    if (this.wrapper) this.wrapper.scrollTop = 0;
  }

  setBadgeSortFilter(tag, val) {
    this.sortColumnId = tag; this.sortColumnProperty = tag; this.activeBadgeFilter = val; this.sortAscending = false; this.executeInternalSort();
  }

  setData(rows, checked = new Set()) {
    this.rawRowsData = rows; this.currentCheckedIds = checked;
    if (this.sortColumnId) this.executeInternalSort(); else this.renderRows(this.rawRowsData);
  }

  renderRows(rows) {
    this.tbody.innerHTML = ''; this.rowsCache = []; const colors = STELLARIS_UI.colors;
    rows.forEach(rowData => {
      const tr = document.createElement('tr'); tr.style.cssText = `border-bottom: 1px solid ${colors.border}; transition: background 0.1s;`; tr.setAttribute('data-row-id', String(rowData.id));
      tr.addEventListener('mouseenter', () => { tr.style.backgroundColor = colors.rowHoverBg; });
      tr.addEventListener('mouseleave', () => { tr.style.backgroundColor = 'transparent'; });

      this.columns.forEach(col => {
        const td = document.createElement('td'); Object.assign(td.style, { padding: '10px 14px', verticalAlign: 'middle', borderRight: `1px solid ${colors.border}`, fontSize: '12px' });
        if (col.id === 'checkbox') {
          const chk = document.createElement('input'); chk.type = 'checkbox'; chk.style.cursor = 'pointer'; chk.checked = this.currentCheckedIds.has(String(rowData.id));
          chk.addEventListener('change', () => {
            if (chk.checked) this.currentCheckedIds.add(String(rowData.id)); else this.currentCheckedIds.delete(String(rowData.id));
            if (this.onCheckChange) this.onCheckChange(rowData, chk.checked);
          });
          td.appendChild(chk); this.rowsCache.push({ id: String(rowData.id), input: chk });
        } else {
          if (col.render) td.appendChild(col.render(rowData[col.id], rowData, (t, v) => this.setBadgeSortFilter(t, v)));
          else { td.innerText = rowData[col.id] !== undefined ? rowData[col.id] : ''; Object.assign(td.style, { color: colors.textMuted, fontWeight: 'bold', fontSize: '12px' }); }
        }
        tr.appendChild(td);
      });
      this.tbody.appendChild(tr);
    });
  }

  toggleAllRows(isChecked) {
    const batched = [];
    this.rowsCache.forEach(r => {
      if (r.input.checked !== isChecked) {
        r.input.checked = isChecked; batched.push(r.id);
        if (isChecked) this.currentCheckedIds.add(r.id); else this.currentCheckedIds.delete(r.id);
      }
    });
    if (this.onBatchCheckChange && batched.length > 0) this.onBatchCheckChange(batched, isChecked);
  }

  scrollToRowId(id) {
    const colors = STELLARIS_UI.colors; const el = this.tbody.querySelector(`[data-row-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.style.backgroundColor = colors.rowHighlightBg;
      setTimeout(() => { el.style.backgroundColor = 'transparent'; }, 800);
    }
  }
}
