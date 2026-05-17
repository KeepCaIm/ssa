import { SciFiTable } from '../components/Table.js';

export class ScreenEmpires {
  constructor(viewport, saveData, activeSelectionStateSet, onSelectionMatrixChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; this.saveData = saveData;
    this.activeSelectionStateSet = activeSelectionStateSet; this.onSelectionMatrixChange = onSelectionMatrixChange;
    this.currentSortId = initialSortId || 'id'; this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange; this.tableInstance = null;
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = [
      { id: 'checkbox', title: '', width: '5%', sortable: false },
      { id: 'id', title: 'ID', width: '8%', sortable: true },
      { id: 'tag', title: 'TAG', width: '10%', sortable: true },
      { id: 'name', title: 'Empire Title / Name', width: '32%', sortable: true, render: v => {
          const d = document.createElement('div'); d.innerText = v; d.style.color = '#fff'; d.style.fontWeight = 'bold'; return d;
      }},
      { id: 'civics', title: 'Civic Models', width: '30%', sortable: true },
      { id: 'fleetsCount', title: 'Fleets', width: '15%', sortable: true, render: (v, row) => {
          const container = document.createElement('div');
          container.style.cursor = 'help'; container.style.textDecoration = 'underline dotted'; container.innerText = String(v);
          container.title = (row.fleetIdsArray && row.fleetIdsArray.length > 0) ? `Owned Fleet IDs:\n${row.fleetIdsArray.join(', ')}` : "No registered fleets allocated.";
          return container;
      }}
    ];

    this.tableInstance = new SciFiTable(cols, (rowData, isChecked) => {
      if (isChecked) this.activeSelectionStateSet.add(String(rowData.id));
      else this.activeSelectionStateSet.delete(String(rowData.id));
      this.onSelectionMatrixChange();
    });

    this.tableInstance.onSort((sortId, isAsc) => {
      this.currentSortId = sortId; this.currentSortAsc = isAsc;
      if (this.onSortStateChange) this.onSortStateChange(sortId, isAsc); this.refreshDataPayload();
    });

    this.viewport.appendChild(this.tableInstance.elNode); this.refreshDataPayload();
  }

  refreshDataPayload() {
    let rows = (this.saveData.empires || []).map(emp => ({ ...emp, fleetsCount: emp.fleetIdsArray ? emp.fleetIdsArray.length : 0 }));
    const sid = this.currentSortId; const mult = this.currentSortAsc ? 1 : -1;

    rows.sort((a, b) => {
      if (sid === 'id' || sid === 'fleetsCount') return (parseFloat(a[sid] || 0) - parseFloat(b[sid] || 0)) * mult;
      return String(a[sid] || "").toLowerCase().localeCompare(String(b[sid] || "").toLowerCase()) * mult;
    });

    this.tableInstance.sortColumnId = this.currentSortId; this.tableInstance.sortAscending = this.currentSortAsc;
    this.tableInstance.buildHeader(); this.tableInstance.setData(rows, this.activeSelectionStateSet);
  }
}
