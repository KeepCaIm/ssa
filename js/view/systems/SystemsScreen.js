import { SciFiTable } from '../components/SciFiTable.js';
import { GET_SYSTEMS_COLUMNS } from './SystemsColumnConfig.js';

export class SystemsScreen {
  constructor(viewport, saveData, activeEmpireIdsSet, activeSystemIdsSet, onSystemSelectionChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; 
    this.saveData = saveData;
    this.activeEmpireIdsSet = activeEmpireIdsSet; 
    this.activeSystemIdsSet = activeSystemIdsSet;
    this.onSystemSelectionChange = onSystemSelectionChange; 
    this.tableInstance = null; 
    this.currentSortId = (initialSortId === 'id') ? 'numeric_metric' : (initialSortId || 'numeric_metric'); 
    this.currentSortProperty = 'id'; 
    this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange;
    this.customFilterTargetValue = null; 
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = GET_SYSTEMS_COLUMNS();

    this.tableInstance = new SciFiTable(cols, (rowData, isChecked) => {
      if (isChecked) this.activeSystemIdsSet.add(String(rowData.id).trim());
      else this.activeSystemIdsSet.delete(String(rowData.id).trim());
      if (this.onSystemSelectionChange) this.onSystemSelectionChange();
    });

    this.tableInstance.onSort((clickedColumnId, isAsc, clickedColumnProperty) => {
      this.customFilterTargetValue = null;
      this.tableInstance.activeBadgeFilter = null;
      const targetPropertyKey = clickedColumnProperty;
      
      if (targetPropertyKey !== this.currentSortProperty) {
        const descCols = ['star_type', '_starYieldsSum', '_systemYieldsSum', 'bodies', 'moltenArc', 'megastructures', 'fastTravel'];
        this.currentSortAsc = descCols.includes(targetPropertyKey) ? false : true;
      } else {
        this.currentSortAsc = isAsc;
      }

      const matchedColumn = cols.find(c => (c.dataKey || c.id) === targetPropertyKey);
      this.currentSortId = matchedColumn ? (matchedColumn.sortKey || clickedColumnId) : clickedColumnId;
      this.currentSortProperty = targetPropertyKey;
      
      Object.assign(this.tableInstance, { sortColumnId: this.currentSortId, sortColumnProperty: this.currentSortProperty, sortAscending: this.currentSortAsc });
      if (this.onSortStateChange) this.onSortStateChange(this.currentSortProperty, this.currentSortAsc); 
      this.tableInstance.executeInternalSort();
    });

    Object.assign(this.tableInstance, { sortColumnId: this.currentSortId, sortColumnProperty: this.currentSortProperty, sortAscending: this.currentSortAsc });
    if (this.customFilterTargetValue) this.tableInstance.activeBadgeFilter = this.customFilterTargetValue;

    this.viewport.appendChild(this.tableInstance.elNode); 
    this.refreshDataPayload();
  }

  executeCustomBadgeSort(sortType, targetValue) {
    this.currentSortId = sortType; this.currentSortProperty = sortType; this.currentSortAsc = false; this.customFilterTargetValue = targetValue;
    if (this.tableInstance) {
      Object.assign(this.tableInstance, { sortColumnId: sortType, sortColumnProperty: sortType, sortAscending: false, activeBadgeFilter: targetValue });
    }
    if (this.onSortStateChange) this.onSortStateChange(sortType, false);
    this.refreshDataPayload();
  }

  refreshDataPayload() {
    let list = this.saveData.systems || [];
    if (this.activeEmpireIdsSet.size > 0) {
      list = list.filter(sys => this.activeEmpireIdsSet.has(String(sys.owner).trim()));
    }

    const rows = list.map(sys => {
      const emp = (this.saveData.empires || []).find(e => String(e.id).trim() === String(sys.owner).trim());
      const totalStarRes = Array.isArray(sys.stars) ? sys.stars.reduce((sum, s) => sum + Number(s.totalStarRes || 0), 0) : Number(sys.star?.totalStarRes || 0);
      const sortedMegaList = Array.isArray(sys.megastructures) ? [...sys.megastructures] : [];
      sortedMegaList.sort((a, b) => String(a.rawType || a.type || "").localeCompare(String(b.rawType || b.type || "")));

      const tokens = [];
      if (sys.fastTravel) {
        ['wormhole', 'gate', 'lgate', 'shroud'].forEach(k => { if (sys.fastTravel[k]) tokens.push(k); });
      }
      tokens.sort();

      const starTokens = String(sys.star_type || sys.star?.type || "").split("/").map(s => s.trim()).filter(Boolean);
      starTokens.sort();

      return { 
        ...sys, ownerTag: emp ? `[${emp.tag}]` : "[None]", star_type: starTokens,
        resourcesPayload: sys.resourcesPayload || sys, megastructures: sortedMegaList, fastTravel: tokens,
        _rawFastTravel: sys._rawFastTravel || sys.fastTravel || {}, _starYieldsSum: totalStarRes, _systemYieldsSum: Number(sys.totalResources || 0)
      };
    });

    this.tableInstance.setData(rows, this.activeSystemIdsSet);
  }
}
