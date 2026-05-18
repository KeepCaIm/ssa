import { ParadoxNameResolver } from './NameResolver.js';
import { SystemDataHelpers } from './SystemDataHelpers.js';

/**
 * ProcessorSystems
 * Assembles system data topologies by tracking Clausewitz object links, 
 * rotating coordinate values 180°, binding star types from the 0-th index of arrays,
 * and aggregating decentralized planet yields into granular totals.
 */
export class ProcessorSystems {
  static run(rootJson) {
    const systems = [];
    const galacticObjectNode = rootJson.galactic_object;
    if (!galacticObjectNode || typeof galacticObjectNode !== 'object') return systems;

    const planetsBlock = rootJson.planets?.planet || null;
    const depositDb = rootJson.deposit || null;
    const sbMap = {};
    const shipMap = {};
    const fleetMap = {};

    const hasStarbases = rootJson.starbase_mgr?.starbases !== undefined && rootJson.starbase_mgr?.starbases !== null;
    if (hasStarbases) {
      Object.keys(rootJson.starbase_mgr.starbases).forEach(id => {
        const st = rootJson.starbase_mgr.starbases[id].station;
        if (st !== undefined) {
          sbMap[String(id).trim()] = String(typeof st === 'object' ? st.key || st.value : st).trim();
        }
      });
    }
    
    if (rootJson.fleet !== undefined && rootJson.fleet !== null) {
      Object.keys(rootJson.fleet).forEach(id => {
        const targetSrc = rootJson.fleet[id].ships?._list || rootJson.fleet[id].ships;
        const arr = Array.isArray(targetSrc) ? targetSrc : [targetSrc];
        arr.forEach(sId => { 
          if (sId !== undefined && sId !== null) {
            shipMap[String(typeof sId === 'object' ? sId.key || sId.value : sId).trim()] = String(id).trim(); 
          }
        });
      });
    }
    
    if (rootJson.country !== undefined && rootJson.country !== null) {
      Object.keys(rootJson.country).forEach(id => {
        const targetSrc = rootJson.country[id].fleets_manager?.owned_fleets?._list || rootJson.country[id].fleets_manager?.owned_fleets;
        const arr = Array.isArray(targetSrc) ? targetSrc : [targetSrc];
        arr.forEach(f => { 
          if (f?.fleet !== undefined) {
            fleetMap[String(typeof f.fleet === 'object' ? f.fleet.key || f.fleet.value : f.fleet).trim()] = String(id).trim(); 
          }
        });
      });
    }

    Object.keys(galacticObjectNode).forEach(id => {
      const s = galacticObjectNode[id];
      if (!s || typeof s !== 'object') return;

      let ownerId = "none";
      let sbLevel = "none";
      let pSbId = "";
      
      if (s.starbases !== undefined && s.starbases !== null) {
        pSbId = String(s.starbases._list ? s.starbases._list : (Array.isArray(s.starbases) ? s.starbases : (s.starbases.key || s.starbases.value || s))).trim();
        if (pSbId !== "" && pSbId !== "4294967295") {
          const matchedShip = sbMap[pSbId];
          const matchedFleet = shipMap[matchedShip];
          if (fleetMap[matchedFleet] !== undefined) {
            ownerId = fleetMap[matchedFleet];
          }
          
          const hasStarbaseRecord = rootJson.starbase_mgr?.starbases[pSbId] !== undefined;
          if (hasStarbaseRecord) {
            let rawLvl = String(rootJson.starbase_mgr.starbases[pSbId].level || "outpost").toLowerCase();
            sbLevel = ParadoxNameResolver.cleanString(rawLvl.replace("starbase_level_", "").replace("starbase level ", ""));
          }
        }
      }

      const links = [];
      const lanes = Array.isArray(s.hyperlane) ? s.hyperlane : (s.hyperlane?._list || [s.hyperlane]);
      lanes.forEach(l => { 
        if (l?.to !== undefined) {
          links.push(String(typeof l.to === 'object' ? l.to.key || l.to.value : l.to).trim()); 
        }
      });

      const pOut = { planetCount: 0, hasMolten: false, arcEligibleCount: 0, celestialList: [], resBreakdown: { e:0, m:0, a:0, p:0, s:0, g:0, n:0 } };
      SystemDataHelpers.parsePlanets(s, rootJson, planetsBlock, pOut);

      let starType = ParadoxNameResolver.cleanString(String(s.star_class || "unknown"));
      let starName = ParadoxNameResolver.resolve(s.name || "Primary Star");
      const starBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      let totalStarResSum = 0;
      
      let pIdsList = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
      const hasPlanets = pIdsList.length !== 0 && pIdsList.length > 0;
      
      if (hasPlanets && planetsBlock !== null) {
        const firstNode = pIdsList[0];
        const primaryStarPlanetId = String(typeof firstNode === 'object' ? firstNode.key || firstNode.value : firstNode).trim();
        const starObj = planetsBlock[primaryStarPlanetId];
        
        if (starObj !== undefined && starObj !== null) {
          starType = ParadoxNameResolver.cleanString(String(starObj.planet_class || starType));
          starName = ParadoxNameResolver.resolve(starObj.name || starName);
          
          if (starObj.deposits !== undefined && starObj.deposits !== null) {
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
        if (isBlackHole === true) { 
          starBreakdown.p = 10; 
          totalStarResSum = 10; 
        } else { 
          starBreakdown.e = 4; 
          totalStarResSum = 4; 
        }
      }

      // FIXED: System resources are now driven entirely by pOut.resBreakdown.
      // Since parsePlanets processes ALL bodies in the system (including the star at index 0), 
      // adding starBreakdown a second time caused duplicate values.
      const systemResources = {
        e: pOut.resBreakdown.e, 
        m: pOut.resBreakdown.m, 
        a: pOut.resBreakdown.a,
        p: pOut.resBreakdown.p, 
        s: pOut.resBreakdown.s,
        g: pOut.resBreakdown.g, 
        n: pOut.resBreakdown.n
      };

      const megastructures = [];
      SystemDataHelpers.parseMegastructures(s, rootJson, megastructures);

      const fastTravel = { wormhole: false, gate: false, lgate: false, shroud: false, wormholeGlobalIndex: null, wormholeTargetIndex: null };
      SystemDataHelpers.parseBypasses(s, rootJson, fastTravel, String(id).trim());

      systems.push({
        id: String(id).trim(), 
        name: ParadoxNameResolver.resolve(s.name || `System ${id}`),
        owner: ownerId, 
        bodies: pOut.planetCount,
        mapX: -(parseFloat(s.coordinate?.x) || 0) * 2.8, 
        mapY: (parseFloat(s.coordinate?.y) || 0) * 2.8,
        linksArray: links, 
        starbaseLevel: sbLevel,
        star: { id: id, type: starType, name: starName, resourcesBreakdown: starBreakdown, totalStarRes: totalStarResSum },
        totalResources: systemResources.e + systemResources.m + systemResources.a + systemResources.p + systemResources.s + systemResources.g + systemResources.n, 
        resourcesPayload: systemResources, 
        celestialList: pOut.celestialList,
        hasMoltenWorld: pOut.hasMolten, 
        arcEligibleCount: pOut.arcEligibleCount, 
        megastructures: megastructures, 
        fastTravel: fastTravel
      });
    });
    return systems;
  }
}
