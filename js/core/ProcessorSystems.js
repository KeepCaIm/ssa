import { ParadoxNameResolver } from './NameResolver.js';
import { SystemDataHelpers } from './SystemDataHelpers.js';

export class ProcessorSystems {
  static run(rootJson) {
    const systems = []; const objectNode = rootJson.galactic_object;
    if (!objectNode || typeof objectNode !== 'object') return systems;
    const planetsBlock = rootJson.planets?.planet || null;
    const sbMap = {}; const shipMap = {}; const fleetMap = {};

    // FIXED: Correctly grab master deposit dictionary references matching the top level payload
    const masterDepositDb = rootJson.deposit || rootJson.deposits || null;
    const cleanDepositDb = masterDepositDb?.deposit ? masterDepositDb.deposit : masterDepositDb;

    if (rootJson.starbase_mgr?.starbases) {
      Object.keys(rootJson.starbase_mgr.starbases).forEach(id => {
        const st = rootJson.starbase_mgr.starbases[id].station;
        if (st) sbMap[String(id).trim()] = String(typeof st === 'object' ? st.key || st.value : st).trim();
      });
    }
    if (rootJson.fleet) {
      Object.keys(rootJson.fleet).forEach(id => {
        const src = rootJson.fleet[id].ships?._list || rootJson.fleet[id].ships;
        (Array.isArray(src) ? src : [src]).forEach(sId => {
          if (sId) shipMap[String(typeof sId === 'object' ? sId.key || sId.value : sId).trim()] = String(id).trim();
        });
      });
    }
    if (rootJson.country) {
      Object.keys(rootJson.country).forEach(id => {
        const src = rootJson.country[id].fleets_manager?.owned_fleets?._list || rootJson.country[id].fleets_manager?.owned_fleets;
        (Array.isArray(src) ? src : [src]).forEach(f => {
          if (f?.fleet) fleetMap[String(typeof f.fleet === 'object' ? f.fleet.key || f.fleet.value : f.fleet).trim()] = String(id).trim();
        });
      });
    }

    Object.keys(objectNode).forEach(id => {
      const s = objectNode[id]; if (!s || typeof s !== 'object') return;
      let ownerId = "none"; let sbLevel = "none";
      if (s.starbases) {
        const pSbId = String(s.starbases._list ? s.starbases._list : (Array.isArray(s.starbases) ? s.starbases : (s.starbases.key || s.starbases.value || s))).trim();
        if (pSbId && pSbId !== "4294967295") {
          if (fleetMap[shipMap[sbMap[pSbId]]]) ownerId = fleetMap[shipMap[sbMap[pSbId]]];
          const rec = rootJson.starbase_mgr?.starbases?.[pSbId];
          if (rec && typeof rec === 'object') sbLevel = ParadoxNameResolver.cleanString(String(rec.level || "outpost").toLowerCase().replace("starbase_level_", "").replace("starbase level ", ""));
        }
      }

      const links = [];
      (Array.isArray(s.hyperlane) ? s.hyperlane : (s.hyperlane?._list || [s.hyperlane])).forEach(l => {
        if (l?.to) links.push(String(typeof l.to === 'object' ? l.to.key || l.to.value : l.to).trim());
      });

      const pOut = { planetCount: 0, hasMolten: false, arcEligibleCount: 0, celestialList: [], resBreakdown: { e:0, m:0, a:0, p:0, s:0, g:0, n:0 } };
      SystemDataHelpers.parsePlanets(s, rootJson, planetsBlock, pOut);

      const rClass = String(s.star_class || "unknown").toLowerCase();
      let starType = ParadoxNameResolver.cleanString(rClass);
      let starName = ParadoxNameResolver.resolve(s.name || "Primary Star");
      const starBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 }; let starResSum = 0;
      let pList = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
      const starIds = [];

      if (pList.length > 0 && planetsBlock) {
        let maxStars = rClass.includes("binary") ? 2 : (rClass.includes("trinary") ? 3 : 1);
        const types = []; const names = []; const limit = Math.min(maxStars, pList.length);
        for (let i = 0; i < limit; i++) {
          const sPlanetId = String(typeof pList[i] === 'object' ? pList[i].key || pList[i].value : pList[i]).trim();
          const starObj = planetsBlock[sPlanetId];
          if (starObj) {
            starIds.push(sPlanetId);
            types.push(ParadoxNameResolver.cleanString(String(starObj.planet_class || "unknown")));
            names.push(ParadoxNameResolver.resolve(starObj.name || "Star"));
            
            // FIXED: Scan using corrected master cleanDepositDb references mapped to star entities
            if (cleanDepositDb && typeof cleanDepositDb === 'object') {
              Object.keys(cleanDepositDb).forEach(depId => {
                const dObj = cleanDepositDb[depId];
                if (dObj && dObj.deposit_holder && dObj.type) {
                  const holderType = String(dObj.deposit_holder.type).trim();
                  if ((holderType === "0" || holderType === "pc" || holderType === "planet") && String(dObj.deposit_holder.id).trim() === sPlanetId) {
                    const res = SystemDataHelpers.extractValueFromDepositType(String(dObj.type));
                    starBreakdown[res.cat] += res.val;
                    starResSum += res.val;
                  }
                }
              });
            }
          }
        }
        if (types.length > 0) { starType = types.join(" / "); starName = names.join(" / "); }
      }

      if (starResSum === 0) {
        const isBlackHole = rClass.includes("black hole") || rClass.includes("black_hole") || rClass.includes("blackhole");
        if (isBlackHole === true) { 
          starBreakdown.p = 10; starResSum = 10; 
        } else { 
          starBreakdown.e = 4; starResSum = 4; 
        }
      }

      const sysRes = { ...pOut.resBreakdown };
      const megas = []; SystemDataHelpers.parseMegastructures(s, rootJson, megas);
      const ft = { wormhole: false, gate: false, lgate: false, shroud: false, wormholeGlobalIndex: null, wormholeTargetIndex: null };
      SystemDataHelpers.parseBypasses(s, rootJson, ft, String(id).trim());

      systems.push({
        id: String(id).trim(), name: ParadoxNameResolver.resolve(s.name || `System ${id}`), owner: ownerId, bodies: pOut.planetCount,
        mapX: -(parseFloat(s.coordinate?.x) || 0) * 2.8, mapY: (parseFloat(s.coordinate?.y) || 0) * 2.8, linksArray: links, starbaseLevel: sbLevel,
        star: { id: id, starIds, type: starType, name: starName, resourcesBreakdown: starBreakdown, totalStarRes: starResSum },
        totalResources: sysRes.e + sysRes.m + sysRes.a + sysRes.p + sysRes.s + sysRes.g + sysRes.n, resourcesPayload: sysRes,
        celestialList: pOut.celestialList, hasMoltenWorld: pOut.hasMolten, arcEligibleCount: pOut.arcEligibleCount, megastructures: megas, fastTravel: ft
      });
    });
    return systems;
  }
}
