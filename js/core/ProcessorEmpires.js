// @ts-nocheck
import { ParadoxNameResolver } from './NameResolver.js';

export class ProcessorEmpires {
  static run(countryNode) {
    const empires = [];
    if (!countryNode || typeof countryNode !== 'object') return empires;

    console.log("[EMPIRES PROCESSOR] Running structured node analysis...");
    let loggedCount = 0;

    Object.keys(countryNode).forEach(id => {
      const c = countryNode[id];
      if (!c || typeof c !== 'object') return;

      const resolvedName = ParadoxNameResolver.resolve(c.name);
      const tag = ParadoxNameResolver.getEmpireTag(resolvedName);

      // Extract raw fleet IDs from flocks manager sub-lists
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

      // DIAGNOSTIC LOG: Print first 3 empires and their assigned fleet arrays to console
      if (loggedCount < 3) {
        console.log(`[EMPIRE DIAGNOSTIC] ID: ${id} | Tag: ${tag} | Name: "${resolvedName}" | Total Fleet IDs found: ${fleetIdsArray.length}`, fleetIdsArray);
        loggedCount++;
      }

      let civics = [];
      if (c.civic) {
        const civList = Array.isArray(c.civic) ? c.civic : [c.civic];
        civList.forEach(civ => { 
          if (civ) civics.push(String(civ).replace('civic_', '').split('_').join(' ')); 
        });
      }

      let tech = "Tier 1";
      if (c.tech_status && c.tech_status.level) {
        tech = `Tier ${Math.round(parseFloat(c.tech_status.level)) || 1}`;
      }

      empires.push({
        id: String(id).trim(),
        tag: tag,
        name: resolvedName || `Empire ${id}`,
        civics: civics.join(', ') || 'Gestalt Profile',
        tech: tech,
        fleetIdsArray: fleetIdsArray
      });
    });

    return empires;
  }
}
