// js/semantic/ArcFurnaceEvaluator.js

/**
 * ArcFurnaceEvaluator
 * Dedicated service layer verifying placement rules and computing potential for Arc Furnaces.
 * Isolates deep Clausewitz mechanics from visual presentation modules.
 */
export class ArcFurnaceEvaluator {
  /**
   * Verifies if a specific celestial body is eligible to receive arc furnace deposits.
   * @param {Object} pObj - Raw tokenized planet database reference block.
   * @param {number} index - Planetary listing position inside the solar group array loop.
   * @param {string} lowClass - Sanitized lowercase string identifying the celestial planet class.
   * @param {Object} localBreakdown - Pre-aggregated specific strategic resource yield map.
   * @returns {boolean} True if the orbital segment fits optimal extraction metrics.
   */
  static isPlanetEligible(pObj, index, lowClass, localBreakdown) {
    // 1. Skip the 0-th index planet slot (this represents the primary central star class descriptor)
    if (index === 0) return false;

    // 2. Filter out research station targets (Physics, Society, or Engineering yields)
    const hasResearchStation = localBreakdown.p > 0 || localBreakdown.s > 0 || localBreakdown.g > 0;
    if (hasResearchStation === true) return false;

    // 3. Skip colonizable space segments (habitable planet signatures)
    const isColonizable = pObj.colonizable === "yes" || 
                          lowClass.includes("pc_") || 
                          lowClass.includes("continental") || 
                          lowClass.includes("ocean") || 
                          lowClass.includes("desert") || 
                          lowClass.includes("tropical") || 
                          lowClass.includes("arid") || 
                          lowClass.includes("tundra") || 
                          lowClass.includes("arctic") || 
                          lowClass.includes("alpine");
    if (isColonizable === true) return false;

    // 4. Skip other anomalous star bodies or cosmic signatures inside the system
    const isStarNode = lowClass.includes("star") || 
                       lowClass.includes("black_hole") || 
                       lowClass.includes("pulsar") || 
                       lowClass.includes("neutron");
    if (isStarNode === true) return false;

    return true;
  }
}
