import { SciFiTable } from './components/SciFiTable.js';
import { SystemsRenderer } from './SystemsRenderer.js';

/**
 * SystemsScreen
 * Presentation view coordinator arranging columns and piping filtered data lists into the table framework.
 */
export class SystemsScreen {
  constructor(viewport, saveData, activeEmpireIdsSet, activeSystemIdsSet, onSystemSelectionChange, initialSortId, initialSortAsc, onSortStateChange) {
    this.viewport = viewport; 
    this.saveData = saveData;
    this.activeEmpireIdsSet = activeEmpireIdsSet; 
    this.activeSystemIdsSet = activeSystemIdsSet;
    this.onSystemSelectionChange = onSystemSelectionChange; 
    this.tableInstance = null; 
    
    // Convert generic 'id' sorting token to abstract calculation tag cleanly
    this.currentSortId = (initialSortId === 'id') ? 'numeric_metric' : (initialSortId || 'numeric_metric'); 
    this.currentSortProperty = 'id'; 
    this.currentSortAsc = initialSortAsc !== undefined ? initialSortAsc : true;
    this.onSortStateChange = onSortStateChange;
    this.customFilterTargetValue = null; 
  }

  render() {
    this.viewport.innerHTML = '';
    const cols = [
      { id: 'checkbox', title: '', width: '3%', sortable: false },
      { id: 'id', sortKey: 'numeric_metric', title: 'ID', width: '5%', sortable: true },
      { id: 'name', sortKey: 'string_lexical', title: 'System Node', width: '12%', sortable: true },
      { id: 'ownerTag', sortKey: 'string_lexical', title: 'Owner', width: '7%', sortable: true }, 
      
      { id: 'star_type', sortKey: 'badge', title: 'Star Type', width: '12%', sortable: true, render: (v, r, s) => SystemsRenderer.renderStar(v, r, s) },
      
      // FIXED: Restored id to original 'resourcesPayload' to bypass render crashes, added arrowKey for arrows identity mapping
      { id: 'resourcesPayload', arrowKey: 'star_yields', dataKey: '_starYieldsSum', sortKey: 'resource_metric', title: 'Star Yields', width: '12%', sortable: true, render: SystemsRenderer.renderStarYields },
      { id: 'resourcesPayload', arrowKey: 'system_yield_accum', dataKey: '_systemYieldsSum', sortKey: 'resource_metric', title: 'System Yields', width: '15%', sortable: true, render: SystemsRenderer.renderSplitResources },
      
      { id: 'bodies', sortKey: 'numeric_metric', title: 'Bodies', width: '5%', sortable: true, render: SystemsRenderer.renderBodies },
      { id: 'moltenArc', sortKey: 'molten_tier_matrix', title: 'Molten (Arc Deposits)', width: '10%', sortable: true, render: SystemsRenderer.renderMoltenArc },
      { id: 'megastructures', sortKey: 'badge', title: 'Megastructure', width: '12%', sortable: true, render: (v, r, s) => SystemsRenderer.renderMegastructures(v, r, s) },
      { id: 'starbaseLevel', sortKey: 'string_lexical', title: 'Starbase', width: '5%', sortable: true, render: v => {
          const s = document.createElement('span'); 
          s.innerText = String(v).toUpperCase();
          s.style.color = (v !== "none" && v !== "outpost") ? '#ffb900' : '#96b3af';
          if (v !== "none" && v !== "outpost") s.style.fontWeight = 'bold'; 
          return s;
      }},
      { id: 'fastTravel', sortKey: 'badge', title: 'Fast Transit', width: '10%', sortable: true, render: (v, r, s) => SystemsRenderer.renderFastTravel(r._rawFastTravel, r, s) }
    ];

    this.tableInstance = new SciFiTable(cols, (rowData, isChecked) => {
      if (isChecked) this.activeSystemIdsSet.add(String(rowData.id).trim());
      else this.activeSystemIdsSet.delete(String(rowData.id).trim());
      if (this.onSystemSelectionChange) this.onSystemSelectionChange();
    });

    this.tableInstance.onSort((clickedColumnId, isAsc, clickedColumnProperty) => {
      this.customFilterTargetValue = null;
      this.tableInstance.activeBadgeFilter = null;
      
      // Determine columns tracking targets safely using explicit position pointers
      const targetPropertyKey = clickedColumnProperty;
      
      if (targetPropertyKey !== this.currentSortProperty) {
        const descendingDefaultCols = ['star_type', '_starYieldsSum', '_systemYieldsSum', 'bodies', 'moltenArc', 'megastructures', 'fastTravel'];
        this.currentSortAsc = descendingDefaultCols.includes(targetPropertyKey) ? false : true;
      } else {
        this.currentSortAsc = isAsc;
      }

      // Re-map internal operational engine abstractions
      const matchedColumn = cols.find(c => (c.dataKey || c.id) === targetPropertyKey);
      this.currentSortId = matchedColumn ? (matchedColumn.sortKey || clickedColumnId) : clickedColumnId;
      this.currentSortProperty = targetPropertyKey;
      
      this.tableInstance.sortColumnId = this.currentSortId;
      this.tableInstance.sortColumnProperty = this.currentSortProperty;
      this.tableInstance.sortAscending = this.currentSortAsc;
      
      if (this.onSortStateChange) this.onSortStateChange(this.currentSortProperty, this.currentSortAsc); 
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
    let list = this.saveData.systems || [];
    if (this.activeEmpireIdsSet.size > 0) {
      list = list.filter(sys => this.activeEmpireIdsSet.has(String(sys.owner).trim()));
    }

    const rows = list.map(sys => {
      const emp = (this.saveData.empires || []).find(e => String(e.id).trim() === String(sys.owner).trim());
      
      let totalStarAccumulation = 0;
      if (Array.isArray(sys.stars)) {
        totalStarAccumulation = sys.stars.reduce((sum, s) => sum + Number(s.totalStarRes || 0), 0);
      } else if (sys.star) {
        totalStarAccumulation = Number(sys.star.totalStarRes || 0);
      }

      const totalSystemAccumulation = Number(sys.totalResources || 0);
      
      const sortedMegaList = Array.isArray(sys.megastructures) ? [...sys.megastructures] : [];
      sortedMegaList.sort((a, b) => String(a.rawType || a.type || "").localeCompare(String(b.rawType || b.type || "")));

      const travelTokens = [];
      if (sys.fastTravel) {
        if (sys.fastTravel.wormhole) travelTokens.push("wormhole");
        if (sys.fastTravel.gate) travelTokens.push("gate");
        if (sys.fastTravel.lgate) travelTokens.push("lgate");
        if (sys.fastTravel.shroud) travelTokens.push("shroud");
      }
      travelTokens.sort((a, b) => a.localeCompare(b));

      const rawStarString = sys.star_type || sys.star?.type || "";
      const starTokens = rawStarString.split("/").map(s => s.trim()).filter(Boolean);
      starTokens.sort((a, b) => a.localeCompare(b));

      return { 
        ...sys, 
        ownerTag: emp ? `[${emp.tag}]` : "[None]",
        
        star_type: starTokens,
        resourcesPayload: sys.resourcesPayload || sys, 
        megastructures: sortedMegaList,

        fastTravel: travelTokens,
        _rawFastTravel: sys._rawFastTravel || sys.fastTravel || {},
        
        // Dynamic summary math tags handled by TAG_RESOLVERS perfectly
        _starYieldsSum: totalStarAccumulation,
        _systemYieldsSum: totalSystemAccumulation
      };
    });

    this.tableInstance.setData(rows, this.activeSystemIdsSet);
    if (this.tableInstance && this.tableInstance.wrapper) this.tableInstance.wrapper.scrollTop = 0;
  }
}
