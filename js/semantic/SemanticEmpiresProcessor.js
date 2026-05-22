// js/semantic/SemanticEmpiresProcessor.js
import { ParadoxNameResolver } from '../parser/ParadoxNameResolver.js';

/**
 * SemanticEmpiresProcessor
 * Extracts and processes empire entities from raw tokenized Clausewitz country blocks.
 */
export class SemanticEmpiresProcessor {
  static run(countryNode) {
    const empires = [];
    if (!countryNode || typeof countryNode !== 'object') return empires;

    Object.keys(countryNode).forEach(id => {
      const c = countryNode[id];
      if (!c || typeof c !== 'object') return;

      const resolvedName = ParadoxNameResolver.resolve(c.name);
      const tag = ParadoxNameResolver.getEmpireTag(resolvedName);

      const fleetIdsArray = [];
      if (c.fleets_manager && c.fleets_manager.owned_fleets) {
        const listSrc = c.fleets_manager.owned_fleets._list || c.fleets_manager.owned_fleets;
        const fleetsList = Array.isArray(listSrc) ? listSrc : [listSrc];
        
        fleetsList.forEach(f => {
          if (f && f.fleet !== undefined) {
            const rawFleetId = typeof f.fleet === 'object' ? f.fleet.key || f.fleet.value : f.fleet;
            if (rawFleetId !== undefined && rawFleetId !== null) {
              fleetIdsArray.push(String(rawFleetId).trim());
            }
          }
        });
      }

      let ethicsArray = [];
      if (c.ethos && c.ethos.ethic) {
        ethicsArray = Array.isArray(c.ethos.ethic) ? c.ethos.ethic : [c.ethos.ethic];
      }

      let civicsArray = [];
      if (c.government && c.government.civics) {
        const civListSrc = c.government.civics._list || c.government.civics;
        civicsArray = Array.isArray(civListSrc) ? civListSrc : [civListSrc];
      }

      const rawEmpireType = c.type !== undefined ? String(c.type).trim() : "default";
      const rawScore = c.victory_score !== undefined ? parseFloat(c.victory_score) : 0;

      empires.push({
        id: String(id).trim(),
        tag: tag,
        name: resolvedName || `Empire ${id}`,
        type: rawEmpireType,
        ethics: ethicsArray,
        civics: civicsArray,
        score: rawScore,
        fleetIdsArray: fleetIdsArray
      });
    });

    return empires;
  }
}
