import { SciFiTable } from './components/SciFiTable.js';
import { EmpiresRenderer } from './EmpiresRenderer.js';
import { STELLARIS_UI } from './StellarisUiConstants.js';

/**
 * EmpiresScreen
 * Coordinates the empires overview matrix grid, handles sorting updates via 
 * unified engine integration, and displays ideology vector tokens.
 */
export class EmpiresScreen {
  constructor(viewport, saveData, activeSelectionStateSet, onSelectionMatrixChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; 
    this.saveData = saveData;
    this.activeSelectionStateSet = activeSelectionStateSet; 
    this.onSelectionMatrixChange = onSelectionMatrixChange;
    
    this.currentSortId = (initialSortId === 'id') ? 'numeric_metric' : (initialSortId || 'numeric_metric'); 
    this.currentSortProperty = 'id'; 
    this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange; 
    this.tableInstance = null;
    this.customFilterTargetValue = null;
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = [
      { id: 'checkbox', title: '', width: '3%', sortable: false },
      { id: 'id', sortKey: 'numeric_metric', title: 'ID', width: '5%', sortable: true },
      { id: 'tag', sortKey: 'string_lexical', title: 'TAG', width: '8%', sortable: true },
      { id: 'name', sortKey: 'string_lexical', title: 'Empire Name', width: '22%', sortable: true, render: v => {
          const d = document.createElement('div'); 
          d.innerText = v; 
          d.style.cssText = `color:${STELLARIS_UI.colors.text}; font-weight:bold;`; 
          return d;
      }},
      { id: 'type', sortKey: 'badge', title: 'Classification Type', width: '14%', sortable: true, render: (v, r, s) => EmpiresRenderer.renderType(v, r, s) },
      { id: 'ethics', sortKey: 'badge', title: 'Governing Ethics Profile', width: '22%', sortable: true, render: (v, r, s) => EmpiresRenderer.renderEthics(v, r, s) },
      { id: 'civics', sortKey: 'badge', title: 'Active Civic Models', width: '20%', sortable: true, render: (v, r, s) => EmpiresRenderer.renderCivics(v, r, s) },
      { id: 'score', sortKey: 'numeric_metric', title: 'Score', width: '6%', sortable: true, render: v => {
          const s = document.createElement('span');
          s.innerText = Math.round(v).toLocaleString();
          s.style.cssText = `color:${STELLARIS_UI.colors.textHeader}; font-weight:bold;`;
          return s;
      }}
    ];

    this.tableInstance = new SciFiTable(cols, (rowData, isChecked) => {
      if (isChecked) {
        this.activeSelectionStateSet.add(String(rowData.id));
      } else {
        this.activeSelectionStateSet.delete(String(rowData.id));
      }
      if (this.onSelectionMatrixChange) {
        this.onSelectionMatrixChange();
      }
    });

    this.tableInstance.onSort((sortPropertyId, isAsc) => {
      this.customFilterTargetValue = null;
      this.tableInstance.activeBadgeFilter = null;
      
      const matchedColumn = cols.find(c => c.id === sortPropertyId);
      const operationalTag = matchedColumn ? (matchedColumn.sortKey || sortPropertyId) : sortPropertyId;

      if (sortPropertyId !== this.currentSortProperty) {
        const descendingDefaultProperties = ['score', 'type', 'ethics', 'civics'];
        this.currentSortAsc = descendingDefaultProperties.includes(sortPropertyId) ? false : true;
      } else {
        this.currentSortAsc = isAsc;
      }

      this.currentSortId = operationalTag;
      this.currentSortProperty = sortPropertyId;
      
      this.tableInstance.sortColumnId = this.currentSortId;
      this.tableInstance.sortColumnProperty = this.currentSortProperty;
      this.tableInstance.sortAscending = this.currentSortAsc;

      if (this.onSortStateChange) {
        this.onSortStateChange(this.currentSortProperty, this.currentSortAsc); 
      }
      this.tableInstance.executeInternalSort();
    });

    this.tableInstance.sortColumnId = this.currentSortId;
    this.tableInstance.sortColumnProperty = this.currentSortProperty;
    this.tableInstance.sortAscending = this.currentSortAsc;
    
    if (this.customFilterTargetValue) {
      this.tableInstance.activeBadgeFilter = this.customFilterTargetValue;
    }

    this.viewport.appendChild(this.tableInstance.elNode); 
    this.refreshDataPayload();
  }

  executeCustomBadgeSort(sortType, targetValue) {
    this.currentSortId = sortType;
    this.currentSortProperty = sortType;
    this.currentSortAsc = false;
    this.customFilterTargetValue = targetValue;
    
    if (this.tableInstance) {
      this.tableInstance.sortColumnId = sortType;
      this.tableInstance.sortColumnProperty = sortType;
      this.tableInstance.sortAscending = false;
      this.tableInstance.activeBadgeFilter = targetValue;
    }
    
    if (this.onSortStateChange) {
      this.onSortStateChange(sortType, false);
    }
    this.refreshDataPayload();
  }

  refreshDataPayload() {
    const rows = (this.saveData.empires || []).map(emp => {
      // FIXED: Force alphabetical sort inside the row variables prior to rendering visual elements
      const rawEthics = Array.isArray(emp.ethics) ? [...emp.ethics] : [];
      const rawCivics = Array.isArray(emp.civics) ? [...emp.civics] : [];
      
      return {
        ...emp,
        type: emp.type || "",
        ethics: rawEthics.sort((a, b) => String(a).localeCompare(String(b))),
        civics: rawCivics.sort((a, b) => String(a).localeCompare(String(b)))
      };
    });

    this.tableInstance.setData(rows, this.activeSelectionStateSet);

    if (this.tableInstance && this.tableInstance.wrapper) {
      this.tableInstance.wrapper.scrollTop = 0;
    }
  }
}
