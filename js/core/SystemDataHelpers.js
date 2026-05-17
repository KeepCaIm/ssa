// @ts-nocheck
import { ParadoxNameResolver } from './NameResolver.js';

export class SystemDataHelpers {
  static extractValueFromDepositType(typeStr) {
    if (!typeStr) return { val: 0, cat: "m" };
    const low = typeStr.toLowerCase();
    
    if (low.includes("arc_furnace")) return { val: 15, cat: "m" };
    if (low.includes("nanite_harvester") || low.includes("nanites")) return { val: 6, cat: "n" };
    if (low.includes("rich_mountain")) return { val: 4, cat: "m" };

    let val = 2; 
    const match = low.match(/_(\d+)$/);
    if (match && match[1]) {
      val = parseInt(match[1], 10) || 2;
    }

    let cat = "m"; 
    if (low.includes("energy")) cat = "e";
    else if (low.includes("minerals")) cat = "m";
    else if (low.includes("alloys")) cat = "a";
    else if (low.includes("physics")) cat = "p";
    else if (low.includes("society")) cat = "s";
    else if (low.includes("engineering")) cat = "g";
    else if (low.includes("research")) cat = "p"; 
    else if (low.includes("dark_matter") || low.includes("living_metal") || low.includes("volatile_motes") || low.includes("rare_crystals") || low.includes("exotic_gases")) cat = "n"; 

    return { val, cat };
  }

  static parsePlanets(s, rootJson, planetsBlock, out) {
    let pIds = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
    const depositDb = rootJson.deposit || null;

    pIds.forEach(pId => {
      const cleanId = String(typeof pId === 'object' ? pId.key || pId.value : pId).trim();
      if (!cleanId || cleanId === "undefined") return;
      out.planetCount++;
      
      const pObj = planetsBlock ? planetsBlock[cleanId] : null;
      if (pObj) {
        const pName = ParadoxNameResolver.resolve(pObj.name || "Unknown");
        const pClass = ParadoxNameResolver.cleanString(String(pObj.planet_class || "unknown"));
        if (pClass.toLowerCase().includes("molten")) out.hasMolten = true;
        
        if (pObj.deposits) {
          let depIds = Array.isArray(pObj.deposits) ? pObj.deposits : (pObj.deposits._list || [pObj.deposits]);
          depIds.forEach(dId => {
            const cleanDId = String(typeof dId === 'object' ? dId.key || dId.value : dId).trim();
            const depObj = depositDb ? depositDb[cleanDId] : null;
            if (depObj && depObj.type) {
              const res = SystemDataHelpers.extractValueFromDepositType(String(depObj.type));
              out.resBreakdown[res.cat] += res.val;
            }
          });
        }
        out.celestialList.push({ id: cleanId, name: pName, type: pClass });
      } else {
        out.celestialList.push({ id: cleanId, name: `Body ${cleanId}`, type: "Unscanned" });
      }
    });
  }

  static parseMegastructures(s, rootJson, megastructuresFound) {
    let mIds = Array.isArray(s.megastructures) ? s.megastructures : (s.megastructures?._list || (s.megastructures ? [s.megastructures] : []));
    let megaDb = rootJson.megastructures || null;
    
    if (megaDb && megaDb._list && !megaDb['24']) megaDb = rootJson.megastructures;
    if (!megaDb && Array.isArray(rootJson.megastructures)) {
      megaDb = rootJson.megastructures.find(m => typeof m === 'object' && !m.coordinate);
    }

    mIds.forEach(mId => {
      const cleanId = String(typeof mId === 'object' ? mId.key || mId.value : mId).trim();
      if (!cleanId) return;
      
      let mObj = (megaDb && typeof megaDb === 'object') ? megaDb[cleanId] : null;
      if (!mObj && rootJson.megastructure) mObj = rootJson.megastructure[cleanId];

      if (mObj && mObj.type) {
        const rawTypeString = String(mObj.type).trim();
        megastructuresFound.push({
          id: cleanId, type: ParadoxNameResolver.cleanString(rawTypeString), rawType: rawTypeString,
          owner: mObj.owner !== undefined ? String(mObj.owner).trim() : "none"
        });
      } else {
        megastructuresFound.push({ id: cleanId, type: "Facility Structure", rawType: "unknown", owner: "none" });
      }
    });
  }

  // FIXED: Flawless relational system mapping linking bypass indices to owner system IDs
  static parseBypasses(s, rootJson, fastTravel, systemId) {
    if (s.natural_wormholes) fastTravel.wormhole = true;
    if (s.flags) {
      Object.keys(s.flags).forEach(fk => {
        const low = fk.toLowerCase();
        if (low.includes("lgate") || low.includes("l_gate")) fastTravel.lgate = true;
        if (low.includes("shroud")) fastTravel.shroud = true;
        if (low.includes("gateway")) fastTravel.gate = true;
      });
    }
    
    // Process bypasses tracking array inside systems blocks
    let bIds = Array.isArray(s.bypasses) ? s.bypasses : (s.bypasses?._list || (s.bypasses ? [s.bypasses] : []));
    
    bIds.forEach(bId => {
      const cleanId = String(typeof bId === 'object' ? bId.key || bId.value : bId).trim();
      const bpObj = rootJson.bypasses ? rootJson.bypasses[cleanId] : null;
      
      if (bpObj) {
        const type = String(bpObj.type || "").toLowerCase();
        
        if (type.includes("wormhole")) {
          fastTravel.wormhole = true;
          fastTravel.wormholeGlobalIndex = parseInt(cleanId, 10);
          
          // Pull true Paradox relational 'linked_to' link ID pointing to target bypass node
          if (bpObj.linked_to !== undefined) {
            const lTo = bpObj.linked_to;
            fastTravel.wormholeTargetIndex = parseInt(typeof lTo === 'object' ? lTo.key || lTo.value : lTo, 10);
          }
        }
        if (type.includes("gateway")) fastTravel.gate = true;
        if (type.includes("lgate") || type.includes("l-gate")) fastTravel.lgate = true;
        if (type.includes("shroud")) fastTravel.shroud = true;
      }
    });
  }
}
