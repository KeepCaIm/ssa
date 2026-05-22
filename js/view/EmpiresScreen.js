// js/view/EmpiresScreen.js
import { SciFiTable } from './components/SciFiTable.js';
import { EmpiresRenderer } from './EmpiresRenderer.js';
import { STELLARIS_UI } from './StellarisUiConstants.js';

/**
 * EmpiresScreen
 * Coordinates the empires overview matrix grid, manages sorting caches persistent 
 * across view switches, and binds custom presentation token maps.
 */
export class EmpiresScreen {
  constructor(viewport, saveData, activeSelectionStateSet, onSelectionMatrixChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; 
    this.saveData = saveData;
    this.activeSelectionStateSet = activeSelectionStateSet; 
    this.onSelectionMatrixChange = onSelectionMatrixChange;
    this.currentSortId = initialSortId || 'id'; 
    this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange; 
    this.tableInstance = null;
    this.customFilterTargetValue = null;
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = [
      { id: 'checkbox', title: '', width: '3%', sortable: false },
      { id: 'id', title: 'ID', width: '5%', sortable: true },
      { id: 'tag', title: 'TAG', width: '8%', sortable: true },
      { id: 'name', title: 'Empire Title / Name', width: '22%', sortable: true, render: v => {
          const d = document.createElement('div'); 
          d.innerText = v; 
          d.style.cssText = `color:${STELLARIS_UI.colors.text}; font-weight:bold;`; 
          return d;
      }},
      { id: 'type', title: 'Classification Type', width: '14%', sortable: true, render: (v, r) => EmpiresRenderer.renderType(v, r, (type, val) => this.executeCustomBadgeSort(type, val)) },
      { id: 'ethics', title: 'Governing Ethics Profile', width: '22%', sortable: true, render: (v, r) => EmpiresRenderer.renderEthics(v, r, (type, val) => this.executeCustomBadgeSort(type, val)) },
      { id: 'civics', title: 'Active Civic Models', width: '20%', sortable: true, render: (v, r) => EmpiresRenderer.renderCivics(v, r, (type, val) => this.executeCustomBadgeSort(type, val)) },
      { id: 'score', title: 'Score', width: '6%', sortable: true, render: v => {
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
      if (this.onSelectionMatrixChange !== null && this.onSelectionMatrixChange !== undefined) {
        this.onSelectionMatrixChange();
      }
    });

    this.tableInstance.onSort((sortId, isAsc) => {
      this.customFilterTargetValue = null;
      this.currentSortId = sortId; 
      this.currentSortAsc = (sortId === 'score') ? !isAsc : isAsc;
      
      if (this.onSortStateChange !== null && this.onSortStateChange !== undefined) {
        this.onSortStateChange(this.currentSortId, this.currentSortAsc); 
      }
      this.refreshDataPayload();
    });

    this.viewport.appendChild(this.tableInstance.elNode); 
    this.refreshDataPayload();
  }

  executeCustomBadgeSort(sortType, targetValue) {
    this.currentSortId = sortType;
    this.currentSortAsc = false;
    this.customFilterTargetValue = targetValue;
    if (this.onSortStateChange !== null && this.onSortStateChange !== undefined) {
      this.onSortStateChange(sortType, false);
    }
    this.refreshDataPayload();
  }

  refreshDataPayload() {
    let rows = (this.saveData.empires || []).map(emp => ({ ...emp }));
    const sid = this.currentSortId; 
    const mult = this.currentSortAsc ? 1 : -1;

    rows.sort((a, b) => {
      if (sid === 'ethics') {
        const hasA = a.ethics !== undefined && a.ethics.length !== 0 && a.ethics.length > 0;
        const hasB = b.ethics !== undefined && b.ethics.length !== 0 && b.ethics.length > 0;
        if (hasA !== hasB) return hasA ? -1 : 1;
        return (parseFloat(a.ethics?.length || 0) - parseFloat(b.ethics?.length || 0)) * mult;
      }
      else if (sid === 'civics') {
        const hasA = a.civics !== undefined && a.civics.length !== 0 && a.civics.length > 0;
        const hasB = b.civics !== undefined && b.civics.length !== 0 && b.civics.length > 0;
        if (hasA !== hasB) return hasA ? -1 : 1;
        return (parseFloat(a.civics?.length || 0) - parseFloat(b.civics?.length || 0)) * mult;
      }
      else if (sid === 'type_filter') {
        const hasA = String(a.type).toLowerCase() === String(this.customFilterTargetValue).toLowerCase() ? 1 : 0;
        const hasB = String(b.type).toLowerCase() === String(this.customFilterTargetValue).toLowerCase() ? 1 : 0;
        if (hasA === hasB) return String(a.name).localeCompare(String(b.name));
        return (hasA - hasB) * mult;
      }
      else if (sid === 'ethic_filter') {
        const hasA = a.ethics?.some(e => String(e).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        const hasB = b.ethics?.some(e => String(e).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        if (hasA === hasB) return String(a.name).localeCompare(String(b.name));
        return (hasA - hasB) * mult;
      }
      else if (sid === 'civic_filter') {
        const hasA = a.civics?.some(c => String(c).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        const hasB = b.civics?.some(c => String(c).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        if (hasA === hasB) return String(a.name).localeCompare(String(b.name));
        return (hasA - hasB) * mult;
      }

      if (sid === 'id' || sid === 'score') {
        return (parseFloat(a[sid] || 0) - parseFloat(b[sid] || 0)) * mult;
      }
      return String(a[sid] || "").toLowerCase().localeCompare(String(b[sid] || "").toLowerCase()) * mult;
    });

    this.tableInstance.sortColumnId = this.currentSortId; 
    this.tableInstance.sortAscending = this.currentSortAsc;
    this.tableInstance.buildHeader(); 
    this.tableInstance.setData(rows, this.activeSelectionStateSet);

    if (this.tableInstance !== null && this.tableInstance.wrapper !== null) {
      this.tableInstance.wrapper.scrollTop = 0;
    }
  }
}
