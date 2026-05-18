import { ParadoxNameResolver } from './NameResolver.js';
import { ArcFurnaceEvaluator } from './ArcFurnaceEvaluator.js';

/**
 * SystemDataHelpers
 * Service utility suite extracting mineral breakdowns from deposit structures,
 * tracking nested megastructures across fallback containers, and isolating
 * index-bound spatial bypass paths directly from Clausewitz objects.
 */
export class SystemDataHelpers {
  static extractValueFromDepositType(typeStr) {
    if (!typeStr) return { val: 0, cat: "m" };
    const low = typeStr.toLowerCase();
    
    // FIXED: Totally ignore any deposit blocks containing the "arc_furnace" substring.
    // This removes pre-built event anchors, phantom AI layout spikes, and active megastructure 
    // multipliers, ensuring you see strictly the natural, un-modded base tile yields.
    if (low.includes("arc_furnace")) {
      return { val: 0, cat: "m" };
    }
    
    if (low.includes("nanite_harvester") || low.includes("nanites")) return { val: 6, cat: "n" };
    if (low.includes("rich_mountain")) return { val: 4, cat: "m" };

    let cat = "m"; 
    if (low.includes("energy")) {
      cat = "e";
    } else if (low.includes("minerals") || low.includes("mineral")) {
      cat = "m";
    } else if (low.includes("alloys") || low.includes("alloy")) {
      cat = "a";
    } else if (low.includes("physics")) {
      cat = "p";
    } else if (low.includes("society")) {
      cat = "s";
    } else if (low.includes("engineering")) {
      cat = "g";
    } else if (low.includes("research")) {
      cat = "p"; 
    } else if (low.includes("dark_matter") || low.includes("living_metal") || low.includes("volatile_motes") || low.includes("rare_crystals") || low.includes("exotic_gases")) {
      cat = "n"; 
    }

    let val = 2; 
    const match = low.match(/_(\d+)$/);
    
    if (match !== null && match !== undefined) {
      val = parseInt(match[1], 10) || 2;
    } else {
      if (cat === "p" || cat === "s" || cat === "g") {
        val = 3; 
      } else if (cat === "e" || cat === "m") {
        val = 2; 
      }
    }

    return { val, cat };
  }

  static parsePlanets(s, rootJson, planetsBlock, out) {
    let pIds = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
    const depositDb = rootJson.deposit || null;
    
    out.arcEligibleCount = 0;

    pIds.forEach((pId, index) => {
      const cleanId = String(typeof pId === 'object' ? pId.key || pId.value : pId).trim();
      if (!cleanId || cleanId === "undefined") return;
      out.planetCount++;
      
      const pObj = planetsBlock ? planetsBlock[cleanId] : null;
      if (pObj !== null && pObj !== undefined) {
        const pName = ParadoxNameResolver.resolve(pObj.name || "Unknown");
        const pClass = ParadoxNameResolver.cleanString(String(pObj.planet_class || "unknown"));
        const lowClass = pClass.toLowerCase();

        if (lowClass.includes("molten")) {
          out.hasMolten = true;
        }
        
        let localBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };

        if (pObj.deposits !== undefined && pObj.deposits !== null) {
          let depIds = Array.isArray(pObj.deposits) ? pObj.deposits : (pObj.deposits._list || [pObj.deposits]);
          depIds.forEach(dId => {
            const cleanDId = String(typeof dId === 'object' ? dId.key || dId.value : dId).trim();
            const depObj = depositDb ? depositDb[cleanDId] : null;
            if (depObj !== null && depObj.type !== undefined) {
              const res = SystemDataHelpers.extractValueFromDepositType(String(depObj.type));
              out.resBreakdown[res.cat] += res.val;
              localBreakdown[res.cat] += res.val;
            }
          });
        }

        const isEligible = ArcFurnaceEvaluator.isPlanetEligible(pObj, index, lowClass, localBreakdown);
        if (isEligible === true) {
          out.arcEligibleCount++;
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
    
    if (megaDb !== null && megaDb._list !== undefined && !megaDb['24']) {
      megaDb = rootJson.megastructures;
    }
    if (megaDb === null && Array.isArray(rootJson.megastructures)) {
      megaDb = rootJson.megastructures.find(m => typeof m === 'object' && !m.coordinate);
    }

    mIds.forEach(mId => {
      const cleanId = String(typeof mId === 'object' ? mId.key || mId.value : mId).trim();
      if (cleanId === "") return;
      
      let mObj = (megaDb !== null && typeof megaDb === 'object') ? megaDb[cleanId] : null;
      if (mObj === null && rootJson.megastructure !== undefined) {
        mObj = rootJson.megastructure[cleanId];
      }

      if (mObj !== null && mObj !== undefined && mObj.type !== undefined) {
        const rawTypeString = String(mObj.type).trim();
        megastructuresFound.push({
          id: cleanId, 
          type: ParadoxNameResolver.cleanString(rawTypeString), 
          rawType: rawTypeString,
          owner: mObj.owner !== undefined ? String(mObj.owner).trim() : "none"
        });
      } else {
        megastructuresFound.push({ id: cleanId, type: "Facility Structure", rawType: "unknown", owner: "none" });
      }
    });
  }

  static parseBypasses(s, rootJson, fastTravel, systemId) {
    if (s.natural_wormholes !== undefined) fastTravel.wormhole = true;
    if (s.flags !== undefined && s.flags !== null) {
      Object.keys(s.flags).forEach(fk => {
        const low = fk.toLowerCase();
        if (low.includes("lgate") || low.includes("l_gate")) fastTravel.lgate = true;
        if (low.includes("shroud")) fastTravel.shroud = true;
        if (low.includes("gateway")) fastTravel.gate = true;
      });
    }
    
    let bIds = Array.isArray(s.bypasses) ? s.bypasses : (s.bypasses?._list || (s.bypasses ? [s.bypasses] : []));
    
    bIds.forEach(bId => {
      const cleanId = String(typeof bId === 'object' ? bId.key || bId.value : bId).trim();
      const bpObj = rootJson.bypasses ? rootJson.bypasses[cleanId] : null;
      
      if (bpObj !== null && bpObj !== undefined) {
        const type = String(bpObj.type || "").toLowerCase();
        
        if (type.includes("wormhole")) {
          fastTravel.wormhole = true;
          fastTravel.wormholeGlobalIndex = parseInt(cleanId, 10);
          
          if (bpObj.linked_to !== undefined && bpObj.linked_to !== null) {
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
