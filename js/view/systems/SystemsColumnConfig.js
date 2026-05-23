import { SystemsRenderer } from './SystemsRenderer.js';

/**
 * SystemsColumnConfig
 * Declarative configuration mapping table columns to abstract sorting engines and renderers.
 */
export const GET_SYSTEMS_COLUMNS = () => [
  { id: 'checkbox', title: '', width: '3%', sortable: false },
  { id: 'id', sortKey: 'numeric_metric', title: 'ID', width: '5%', sortable: true },
  { id: 'name', sortKey: 'string_lexical', title: 'System Name', width: '12%', sortable: true },
  { id: 'ownerTag', sortKey: 'string_lexical', title: 'Owner', width: '7%', sortable: true }, 
  { id: 'star_type', sortKey: 'badge', title: 'Star Type', width: '12%', sortable: true, render: (v, r, s) => SystemsRenderer.renderStar(v, r, s) },
  { id: 'resourcesPayload', arrowKey: 'star_yields', dataKey: '_starYieldsSum', sortKey: 'resource_metric', title: 'Star Yields', width: '12%', sortable: true, render: SystemsRenderer.renderStarYields },
  { id: 'resourcesPayload', arrowKey: 'system_yield_accum', dataKey: '_systemYieldsSum', sortKey: 'resource_metric', title: 'System Yields', width: '15%', sortable: true, render: SystemsRenderer.renderSplitResources },
  { id: 'bodies', sortKey: 'numeric_metric', title: 'Bodies', width: '5%', sortable: true, render: SystemsRenderer.renderBodies },
  { id: 'moltenArc', sortKey: 'molten_tier_matrix', title: 'Molten (Arc Deposits)', width: '10%', sortable: true, render: SystemsRenderer.renderMoltenArc },
  { id: 'megastructures', sortKey: 'badge', title: 'Megastructures', width: '12%', sortable: true, render: (v, r, s) => SystemsRenderer.renderMegastructures(v, r, s) },
  { id: 'starbaseLevel', sortKey: 'string_lexical', title: 'Starbase', width: '5%', sortable: true, render: v => {
      const s = document.createElement('span'); 
      s.innerText = String(v).toUpperCase();
      s.style.color = (v !== "none" && v !== "outpost") ? '#ffb900' : '#96b3af';
      if (v !== "none" && v !== "outpost") s.style.fontWeight = 'bold'; 
      return s;
  }},
  { id: 'fastTravel', sortKey: 'badge', title: 'Fast Transit', width: '10%', sortable: true, render: (v, r, s) => SystemsRenderer.renderFastTravel(r._rawFastTravel, r, s) }
];
