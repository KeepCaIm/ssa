/**
 * UniversalSortEngine
 * Functional evaluation layer driving data matrix ordering using explicit abstract sort tags.
 * Clean data separation: Extracts badges directly from the target row property.
 */

// Maps programmatic sort keys to data normalization routines
const TAG_RESOLVERS = {
  'numeric_metric': (x, sortTag, realPropertyKey) => {
    const rawVal = x[realPropertyKey || sortTag];
    return rawVal !== undefined ? (parseFloat(rawVal) || 0) : 0;
  },
  
  'string_lexical': (x, sortTag, realPropertyKey) => String(x[realPropertyKey || sortTag] || "").toLowerCase(),
  
  'resource_metric': (x, sortTag, realPropertyKey) => {
    const targetKey = realPropertyKey || sortTag;
    const rawVal = x[targetKey];
    return rawVal !== undefined ? (parseFloat(rawVal) || 0) : 0;
  },
  
  'molten_tier_matrix': (x) => ({
    primary: x.hasMoltenWorld === true ? 1 : 0,
    secondary: Number(x.arcEligibleCount || 0)
  }),

  // Extracts array tokens directly from the requested property field (e.g., x['ethics'], x['star_type'], x['megastructures'])
  'badge': (x, sortTag, realPropertyKey) => {
    const targetField = realPropertyKey || sortTag;
    
    let rawBadges = (targetField === 'fastTravel' && x._fastTravelBadges) 
      ? x._fastTravelBadges 
      : x[targetField];

    if (rawBadges && !Array.isArray(rawBadges)) {
      rawBadges = [rawBadges];
    }

    if (!Array.isArray(rawBadges) || rawBadges.length === 0) {
      return { count: 0, normalizedText: "" };
    }

    const stringTokens = rawBadges.map(item => {
      if (typeof item === 'object' && item !== null) {
        return String(item.rawType || item.type || "").toLowerCase();
      }
      return String(item).toLowerCase();
    }).filter(Boolean);

    if (stringTokens.length === 0) {
      return { count: 0, normalizedText: "" };
    }

    const sortedTokens = stringTokens.sort();
    return {
      count: sortedTokens.length,
      normalizedText: sortedTokens.join(" | ")
    };
  }
};

export class UniversalSortEngine {
  /**
   * Sorts array maps out-of-place using abstract configuration tags.
   * @param {Array<Object>} dataset - Target array layout rows.
   * @param {string} sortTag - Operational active sortKey identifier tag.
   * @param {boolean} isAscending - Inversion direction flag logic multiplier.
   * @param {string|null} [badgeFilterValue=null] - Interactive cell text asset targeting matches.
   * @param {string|null} [realPropertyKey=null] - Real column target data attribute property key name.
   * @returns {Array<Object>} Re-ordered output vector framework copy.
   */
  static sort(dataset, sortTag, isAscending, badgeFilterValue = null, realPropertyKey = null) {
    if (!Array.isArray(dataset)) return [];
    
    const mult = isAscending ? 1 : -1;
    const targetBadge = badgeFilterValue ? String(badgeFilterValue).toLowerCase() : null;

    return [...dataset].sort((a, b) => {
      // 1. UNIFIED BADGE BEHAVIOR DISPATCHER (When left-clicking an individual inline cell badge node)
      if (targetBadge && sortTag === 'badge') {
        const targetField = realPropertyKey || sortTag;
        
        const checkHasBadge = (row) => {
          let fieldsToInspect = [];
          if (targetField === 'badge') {
            fieldsToInspect = ['type', 'ethics', 'civics', 'megastructures', 'fastTravel', 'star_type'];
          } else {
            fieldsToInspect = [targetField];
          }

          return fieldsToInspect.some(field => {
            let items = row[field];
            if (items && !Array.isArray(items)) items = [items];
            if (!Array.isArray(items)) return false;
            
            return items.some(item => {
              const token = (typeof item === 'object' && item !== null) ? (item.rawType || item.type) : item;
              return String(token || "").toLowerCase() === targetBadge;
            });
          }) ? 1 : 0;
        };

        const hasA = checkHasBadge(a);
        const hasB = checkHasBadge(b);

        if (hasA !== hasB) return hasB - hasA; 
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      // 2. STANDARD PROPERTY CONFIGURATION RESOLVERS
      const resolver = TAG_RESOLVERS[sortTag] || ((x, tag, prop) => String(x[prop || tag] !== undefined ? x[prop || tag] : "").toLowerCase());
      const valA = resolver(a, sortTag, realPropertyKey);
      const valB = resolver(b, sortTag, realPropertyKey);

      // Handle standard header clicks on badge columns
      if (sortTag === 'badge') {
        if (valA.count === 0 && valB.count > 0) return 1;
        if (valB.count === 0 && valA.count > 0) return -1;
        if (valA.count === 0 && valB.count === 0) {
          return String(a.name || "").localeCompare(String(b.name || "")) * mult;
        }

        if (valA.count !== valB.count) {
          return isAscending ? (valA.count - valB.count) : (valB.count - valA.count);
        }

        if (valA.normalizedText !== valB.normalizedText) {
          return valA.normalizedText.localeCompare(valB.normalizedText);
        }
        
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      // Handle Compound Object Matrices (molten_tier_matrix checks)
      if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
        if (valA.primary !== valB.primary) return (valA.primary - valB.primary) * mult;
        if (valA.secondary !== valB.secondary) return (valA.secondary - valB.secondary) * mult;
        return String(a.name || "").localeCompare(String(b.name || ""));
      }

      // Handle Standard Numeric Columns Ordering
      if (typeof valA === 'number' && typeof valB === 'number') {
        if (valA !== valB) return (valA - valB) * mult;
        return String(a.name || "").localeCompare(String(b.name || "")) * mult;
      }

      // Standard Lexical Collation Fallback
      return String(valA).localeCompare(String(valB)) * mult;
    });
  }
}
