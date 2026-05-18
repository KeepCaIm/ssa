import { SciFiTable } from '../components/Table.js';
import { SystemRenderers } from '../components/SystemRenderers.js';

export class ScreenSystems {
  constructor(viewport, saveData, activeEmpireIdsSet, activeSystemIdsSet, onSystemSelectionChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; this.saveData = saveData;
    this.activeEmpireIdsSet = activeEmpireIdsSet; this.activeSystemIdsSet = activeSystemIdsSet;
    this.onSystemSelectionChange = onSystemSelectionChange; this.tableInstance = null; 
    this.currentSortId = initialSortId || 'id'; this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange;
    this.customFilterTargetValue = null; 
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = [
      { id: 'checkbox', title: '', width: '3%', sortable: false },
      { id: 'id', title: 'ID', width: '5%', sortable: true },
      { id: 'name', title: 'System Node', width: '12%', sortable: true },
      { id: 'ownerTag', title: 'Owner', width: '7%', sortable: true }, 
      { id: 'star_type', title: 'Star Type', width: '12%', sortable: true, render: SystemRenderers.renderStar },
      { id: 'starYieldsPayload', title: 'Star Yields', width: '12%', sortable: true, render: SystemRenderers.renderStarYields },
      { id: 'resourcesPayload', title: 'System Yields', width: '15%', sortable: true, render: SystemRenderers.renderSplitResources },
      { id: 'bodies', title: 'Bodies', width: '5%', sortable: true, render: SystemRenderers.renderBodies },
      { id: 'moltenArc', title: 'Molten (Arc Deposits)', width: '10%', sortable: true, render: SystemRenderers.renderMoltenArc },
      { id: 'megastructures', title: 'Megastructure', width: '12%', sortable: true, render: (v, r) => SystemRenderers.renderMegastructures(v, r, (type, name) => this.executeCustomBadgeSort(type, name)) },
      { id: 'starbaseLevel', title: 'Starbase', width: '5%', sortable: true, render: v => {
          const s = document.createElement('span'); 
          s.innerText = String(v).toUpperCase();
          s.style.color = (v !== "none" && v !== "outpost") ? '#ffb900' : '#96b3af';
          if (v !== "none" && v !== "outpost") s.style.fontWeight = 'bold'; 
          return s;
      }},
      { id: 'fastTravel', title: 'Fast Transit', width: '10%', sortable: true, render: (v, r) => SystemRenderers.renderFastTravel(v, r, (type, name) => this.executeCustomBadgeSort(type, name)) }
    ];

    this.tableInstance = new SciFiTable(cols, (rowData, isChecked) => {
      if (isChecked) this.activeSystemIdsSet.add(String(rowData.id).trim());
      else this.activeSystemIdsSet.delete(String(rowData.id).trim());
      if (this.onSystemSelectionChange) this.onSystemSelectionChange();
    });

    this.tableInstance.onSort((sortId, isAsc) => {
      this.customFilterTargetValue = null; this.currentSortId = sortId; 
      const targetReverseArray = ['starYieldsPayload', 'resourcesPayload', 'bodies', 'moltenArc'];
      this.currentSortAsc = targetReverseArray.includes(sortId) ? !isAsc : isAsc; 
      if (this.onSortStateChange) this.onSortStateChange(this.currentSortId, this.currentSortAsc); 
      this.refreshDataPayload();
    });

    this.viewport.appendChild(this.tableInstance.elNode); this.refreshDataPayload();
  }

  executeCustomBadgeSort(sortType, targetValue) {
    this.currentSortId = sortType; this.currentSortAsc = false; this.customFilterTargetValue = targetValue;
    if (this.onSortStateChange) this.onSortStateChange(sortType, false); this.refreshDataPayload();
  }

  refreshDataPayload() {
    let list = this.saveData.systems || [];
    if (this.activeEmpireIdsSet.size > 0) {
      list = list.filter(sys => this.activeEmpireIdsSet.has(String(sys.owner).trim()));
    }

    let rows = list.map(sys => {
      const emp = (this.saveData.empires || []).find(e => String(e.id).trim() === String(sys.owner).trim());
      return { ...sys, ownerTag: emp ? `[${emp.tag}]` : "[None]" };
    });

    const sid = this.currentSortId; const mult = this.currentSortAsc ? 1 : -1;

    rows.sort((a, b) => {
      let valA = a[sid]; let valB = b[sid];
      if (sid === 'star_type') { valA = a.star ? a.star.type : ""; valB = b.star ? b.star.type : ""; }
      else if (sid === 'resourcesPayload') { valA = a.totalResources; valB = b.totalResources; }
      else if (sid === 'starYieldsPayload') { valA = a.star ? a.star.totalStarRes : 0; valB = b.star ? b.star.totalStarRes : 0; } 
      else if (sid === 'moltenArc') {
        const hasMoltenA = a.hasMoltenWorld === true ? 1 : 0;
        const hasMoltenB = b.hasMoltenWorld === true ? 1 : 0;
        if (hasMoltenA !== hasMoltenB) return (hasMoltenA - hasMoltenB) * mult; 
        return ((a.arcEligibleCount || 0) - (b.arcEligibleCount || 0)) * mult;
      }
      else if (sid === 'megastructures') {
        const hasA = a.megastructures?.length > 0 ? 1 : 0; const hasB = b.megastructures?.length > 0 ? 1 : 0;
        if (hasA !== hasB) return hasA ? -1 : 1;
        return ((a.megastructures?.length || 0) - (b.megastructures?.length || 0)) * mult;
      } 
      else if (sid === 'fastTravel') {
        let cA = 0, cB = 0;
        if (a.fastTravel) { if (a.fastTravel.wormhole) cA++; if (a.fastTravel.gate) cA++; if (a.fastTravel.lgate) cA++; if (a.fastTravel.shroud) cA++; }
        if (b.fastTravel) { if (b.fastTravel.wormhole) cB++; if (b.fastTravel.gate) cB++; if (b.fastTravel.lgate) cB++; if (b.fastTravel.shroud) cB++; }
        if ((cA > 0 ? 1 : 0) !== (cB > 0 ? 1 : 0)) return cA > 0 ? -1 : 1;
        return (cA - cB) * mult;
      } else if (sid === 'mega_filter') {
        const hasA = a.megastructures?.some(m => String(m.rawType).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        const hasB = b.megastructures?.some(m => String(m.rawType).toLowerCase() === String(this.customFilterTargetValue).toLowerCase()) ? 1 : 0;
        if (hasA === hasB) return String(a.name).localeCompare(String(b.name));
        return (hasA - hasB) * mult;
      } else if (sid.startsWith('ft_')) {
        const flagKey = sid.replace('ft_', '');
        const hasA = a.fastTravel && a.fastTravel[flagKey] ? 1 : 0;
        const hasB = b.fastTravel && b.fastTravel[flagKey] ? 1 : 0;
        if (hasA === hasB) return String(a.name).localeCompare(String(b.name));
        return (hasA - hasB) * mult;
      }

      if (sid === 'id' || sid === 'bodies' || sid === 'resourcesPayload' || sid === 'starYieldsPayload') {
        return (parseFloat(valA || 0) - parseFloat(valB || 0)) * mult;
      }
      return String(valA || "").toLowerCase().localeCompare(String(valB || "").toLowerCase()) * mult;
    });

    this.tableInstance.sortColumnId = this.currentSortId; this.tableInstance.sortAscending = this.currentSortAsc;
    this.tableInstance.buildHeader(); this.tableInstance.setData(rows, this.activeSystemIdsSet);
    if (this.tableInstance && this.tableInstance.wrapper) this.tableInstance.wrapper.scrollTop = 0;
  }
}
