// @ts-nocheck
import { ParadoxNameResolver } from './NameResolver.js';
import { SystemDataHelpers } from './SystemDataHelpers.js';

export class ProcessorSystems {
  static run(rootJson) {
    const systems = [];
    const galacticObjectNode = rootJson.galactic_object;
    if (!galacticObjectNode || typeof galacticObjectNode !== 'object') return systems;

    const planetsBlock = rootJson.planets?.planet || null;
    const depositDb = rootJson.deposit || null;
    const sbMap = {}, shipMap = {}, fleetMap = {};

    if (rootJson.starbase_mgr?.starbases) {
      Object.keys(rootJson.starbase_mgr.starbases).forEach(id => {
        const st = rootJson.starbase_mgr.starbases[id].station;
        if (st !== undefined) sbMap[String(id).trim()] = String(typeof st === 'object' ? st.key || st.value : st).trim();
      });
    }
    if (rootJson.fleet) {
      Object.keys(rootJson.fleet).forEach(id => {
        const arr = Array.isArray(rootJson.fleet[id].ships?._list || rootJson.fleet[id].ships) ? (rootJson.fleet[id].ships?._list || rootJson.fleet[id].ships) : [rootJson.fleet[id].ships];
        arr.forEach(sId => { if (sId) shipMap[String(typeof sId === 'object' ? sId.key || sId.value : sId).trim()] = String(id).trim(); });
      });
    }
    if (rootJson.country) {
      Object.keys(rootJson.country).forEach(id => {
        const arr = Array.isArray(rootJson.country[id].fleets_manager?.owned_fleets?._list || rootJson.country[id].fleets_manager?.owned_fleets) ? (rootJson.country[id].fleets_manager?.owned_fleets?._list || rootJson.country[id].fleets_manager?.owned_fleets) : [rootJson.country[id].fleets_manager?.owned_fleets];
        arr.forEach(f => { if (f?.fleet !== undefined) fleetMap[String(typeof f.fleet === 'object' ? f.fleet.key || f.fleet.value : f.fleet).trim()] = String(id).trim(); });
      });
    }

    Object.keys(galacticObjectNode).forEach(id => {
      const s = galacticObjectNode[id];
      if (!s || typeof s !== 'object') return;

      let ownerId = "none", sbLevel = "none", pSbId = "";
      if (s.starbases) {
        pSbId = String(s.starbases._list ? s.starbases._list : (Array.isArray(s.starbases) ? s.starbases : (s.starbases.key || s.starbases.value || s))).trim();
        if (pSbId && pSbId !== "4294967295") {
          if (fleetMap[shipMap[sbMap[pSbId]]]) ownerId = fleetMap[shipMap[sbMap[pSbId]]];
          if (rootJson.starbase_mgr?.starbases[pSbId]) {
            let rawLvl = String(rootJson.starbase_mgr.starbases[pSbId].level || "outpost").toLowerCase();
            sbLevel = ParadoxNameResolver.cleanString(rawLvl.replace("starbase_level_", "").replace("starbase level ", ""));
          }
        }
      }

      const links = [];
      const lanes = Array.isArray(s.hyperlane) ? s.hyperlane : (s.hyperlane?._list || [s.hyperlane]);
      lanes.forEach(l => { if (l?.to !== undefined) links.push(String(typeof l.to === 'object' ? l.to.key || l.to.value : l.to).trim()); });

      const pOut = { planetCount: 0, hasMolten: false, celestialList: [], resBreakdown: { e:0, m:0, a:0, p:0, s:0, g:0, n:0 } };
      SystemDataHelpers.parsePlanets(s, rootJson, planetsBlock, pOut);

      let starType = ParadoxNameResolver.cleanString(String(s.star_class || "unknown"));
      let starName = ParadoxNameResolver.resolve(s.name || "Primary Star");
      const starBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      let totalStarResSum = 0;
      
      let pIdsList = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
      if (pIdsList.length > 0 && planetsBlock) {
        const firstNode = pIdsList[0];
        const primaryStarPlanetId = String(typeof firstNode === 'object' ? firstNode.key || firstNode.value : firstNode).trim();
        const starObj = planetsBlock[primaryStarPlanetId];
        
        if (starObj) {
          starType = ParadoxNameResolver.cleanString(String(starObj.planet_class || starType));
          starName = ParadoxNameResolver.resolve(starObj.name || starName);
          
          if (starObj.deposits) {
            let sDepIds = Array.isArray(starObj.deposits) ? starObj.deposits : (starObj.deposits._list || [starObj.deposits]);
            sDepIds.forEach(sdId => {
              const cleanSdId = String(typeof sdId === 'object' ? sdId.key || sdId.value : sdId).trim();
              const dObj = depositDb ? depositDb[cleanSdId] : null;
              if (dObj && dObj.type) {
                const res = SystemDataHelpers.extractValueFromDepositType(String(dObj.type));
                starBreakdown[res.cat] += res.val;
                totalStarResSum += res.val;
              }
            });
          }
        }
      }

      if (totalStarResSum === 0) {
        const isBlackHole = starType.includes("black hole") || starType.includes("black_hole") || starType.includes("blackhole");
        if (isBlackHole) { starBreakdown.p = 10; totalStarResSum = 10; } 
        else { starBreakdown.e = 4; totalStarResSum = 4; }
      }

      const systemResources = {
        e: pOut.resBreakdown.e, m: pOut.resBreakdown.m, a: pOut.resBreakdown.a,
        p: pOut.resBreakdown.p + starBreakdown.p, s: pOut.resBreakdown.s + starBreakdown.s,
        g: pOut.resBreakdown.g + starBreakdown.g, n: pOut.resBreakdown.n + starBreakdown.n
      };

      if (pOut.resBreakdown.e === 0) systemResources.e += starBreakdown.e;
      if (pOut.resBreakdown.m === 0) systemResources.m += starBreakdown.m;
      if (pOut.resBreakdown.a === 0) systemResources.a += starBreakdown.a;
      if (pOut.resBreakdown.n === 0) systemResources.n += starBreakdown.n;

      const megastructures = [];
      SystemDataHelpers.parseMegastructures(s, rootJson, megastructures);

      const fastTravel = { wormhole: false, gate: false, lgate: false, shroud: false, wormholeGlobalIndex: null, wormholeTargetIndex: null };
      // FIXED: Passed precise clear system integer tracking ID down into bypass analytical compiler loops
      SystemDataHelpers.parseBypasses(s, rootJson, fastTravel, String(id).trim());

      systems.push({
        id: String(id).trim(), name: ParadoxNameResolver.resolve(s.name || `System ${id}`),
        owner: ownerId, bodies: pOut.planetCount,
        mapX: -(parseFloat(s.coordinate?.x) || 0) * 2.8, mapY: (parseFloat(s.coordinate?.y) || 0) * 2.8,
        linksArray: links, starbaseLevel: sbLevel,
        star: { id: id, type: starType, name: starName, resourcesBreakdown: starBreakdown, totalStarRes: totalStarResSum },
        totalResources: systemResources.e + systemResources.m + systemResources.a + systemResources.p + systemResources.s + systemResources.g + systemResources.n, 
        resourcesPayload: systemResources, celestialList: pOut.celestialList,
        hasMoltenWorld: pOut.hasMolten, megastructures: megastructures, fastTravel: fastTravel
      });
    });
    return systems;
  }
}
