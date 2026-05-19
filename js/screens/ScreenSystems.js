import { SciFiTable } from '../components/Table.js';
import { SystemRenderers } from '../components/SystemRenderers.js';
import { SystemSortEngine } from '../core/SystemSortEngine.js';

/**
 * ScreenSystems
 * Presentation view coordinator arranging columns and piping data lists into the sort engine.
 */
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
      this.customFilterTargetValue = null;
      
      if (sortId !== this.currentSortId) {
        const reverseCols = ['starYieldsPayload', 'resourcesPayload', 'bodies', 'moltenArc', 'megastructures', 'fastTravel'];
        this.currentSortAsc = reverseCols.includes(sortId) ? false : true;
      } else {
        this.currentSortAsc = isAsc;
      }

      this.currentSortId = sortId;
      if (this.onSortStateChange) this.onSortStateChange(this.currentSortId, this.currentSortAsc); 
      this.refreshDataPayload();
    });

    this.viewport.appendChild(this.tableInstance.elNode); 
    this.refreshDataPayload();
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

    // Pipe sorting calculation checks out into specialized static processor
    rows.sort((a, b) => SystemSortEngine.evaluateSort(a, b, this.currentSortId, this.currentSortAsc, this.customFilterTargetValue));

    this.tableInstance.sortColumnId = this.currentSortId; 
    this.tableInstance.sortAscending = this.currentSortAsc;
    this.tableInstance.buildHeader(); 
    this.tableInstance.setData(rows, this.activeSystemIdsSet);
    if (this.tableInstance && this.tableInstance.wrapper) this.tableInstance.wrapper.scrollTop = 0;
  }
}
