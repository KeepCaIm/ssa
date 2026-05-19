/**
 * SystemSortEngine
 * Pure functional evaluation layer managing calculation tasks and column subtraction 
 * logic for dense galactic system data grids.
 */
export class SystemSortEngine {
  static evaluateSort(a, b, sid, currentSortAsc, customFilterTargetValue) {
    const mult = currentSortAsc ? 1 : -1;
    let isNumericField = false;
    let numA = 0;
    let numB = 0;

    // Isolate structural integer variables safely
    if (sid === 'id' || sid === 'bodies') {
      isNumericField = true;
      numA = parseFloat(a[sid]) || 0;
      numB = parseFloat(b[sid]) || 0;
    } else if (sid === 'resourcesPayload') {
      isNumericField = true;
      numA = parseFloat(a.totalResources) || 0;
      numB = parseFloat(b.totalResources) || 0;
    } else if (sid === 'starYieldsPayload') {
      isNumericField = true;
      numA = a.star ? (parseFloat(a.star.totalStarRes) || 0) : 0;
      numB = b.star ? (parseFloat(b.star.totalStarRes) || 0) : 0;
    } else if (sid === 'moltenArc') {
      isNumericField = true;
      const hasA = a.hasMoltenWorld === true ? 1 : 0;
      const hasB = b.hasMoltenWorld === true ? 1 : 0;
      if (hasA !== hasB) return (hasA - hasB) * mult;
      numA = parseFloat(a.arcEligibleCount) || 0;
      numB = parseFloat(b.arcEligibleCount) || 0;
    } else if (sid === 'megastructures') {
      isNumericField = true;
      const hasA = a.megastructures?.length > 0 ? 1 : 0;
      const hasB = b.megastructures?.length > 0 ? 1 : 0;
      if (hasA !== hasB) return (hasA - hasB) * mult;
      numA = parseFloat(a.megastructures?.length) || 0;
      numB = parseFloat(b.megastructures?.length) || 0;
    } else if (sid === 'fastTravel') {
      isNumericField = true;
      let cA = 0, cB = 0;
      if (a.fastTravel) { if (a.fastTravel.wormhole) cA++; if (a.fastTravel.gate) cA++; if (a.fastTravel.lgate) cA++; if (a.fastTravel.shroud) cA++; }
      if (b.fastTravel) { if (b.fastTravel.wormhole) cB++; if (b.fastTravel.gate) cB++; if (b.fastTravel.lgate) cB++; if (b.fastTravel.shroud) cB++; }
      const hasA = cA > 0 ? 1 : 0; const hasB = cB > 0 ? 1 : 0;
      if (hasA !== hasB) return (hasA - hasB) * mult;
      numA = cA; numB = cB;
    }

    // Execute pure float math subtraction to avoid string sorting bugs
    if (isNumericField) {
      return (numA - numB) * mult;
    }

    // Handle interactive badge filtering event sort layers
    if (sid === 'mega_filter') {
      const hasA = a.megastructures?.some(m => String(m.rawType).toLowerCase() === String(customFilterTargetValue).toLowerCase()) ? 1 : 0;
      const hasB = b.megastructures?.some(m => String(m.rawType).toLowerCase() === String(customFilterTargetValue).toLowerCase()) ? 1 : 0;
      if (hasA !== hasB) return hasA ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    } 
    if (sid.startsWith('ft_')) {
      const flagKey = sid.replace('ft_', '');
      const hasA = a.fastTravel && a.fastTravel[flagKey] ? 1 : 0;
      const hasB = b.fastTravel && b.fastTravel[flagKey] ? 1 : 0;
      if (hasA !== hasB) return hasA ? -1 : 1;
      return String(a.name).localeCompare(String(b.name));
    }

    // Standard string fallback comparisons
    let valA = a[sid]; let valB = b[sid];
    if (sid === 'star_type') { valA = a.star ? a.star.type : ""; valB = b.star ? b.star.type : ""; }
    
    return String(valA || "").toLowerCase().localeCompare(String(valB || "").toLowerCase()) * mult;
  }
}
