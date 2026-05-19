import { ParadoxNameResolver } from './NameResolver.js';
import { ArcFurnaceEvaluator } from './ArcFurnaceEvaluator.js';
import { SYSTEM_STATIC_REGISTRY } from './SystemConstants.js';

export class SystemDataHelpers {
  static extractValueFromDepositType(typeStr) {
    if (!typeStr) return { val: 0, cat: "unknown" };
    const low = typeStr.replace(/"/g, '').trim().toLowerCase();
    if (low.includes("arc_furnace")) return { val: 0, cat: "unknown" };
    if (low.includes("nanite_harvester") || low.includes("nanites")) return { val: 6, cat: "n" };
    if (low.includes("rich_mountain")) return { val: 4, cat: "m" };
    if (low.includes("ore_rich_caverns")) return { val: 2, cat: "m" };

    let cat = "unknown"; let baseVal = 0;
    const matchCat = SYSTEM_STATIC_REGISTRY.depositCategories.find(c => low.includes(c.key));
    
    if (matchCat) {
      cat = matchCat.cat; baseVal = matchCat.defVal;
    } else if (SYSTEM_STATIC_REGISTRY.specials.some(s => low.includes(s))) {
      cat = "n"; baseVal = 2;
    }

    if (cat === "unknown") return { val: 0, cat: "unknown" };
    const match = low.match(/_(\d+)$/);
    const val = match ? (parseInt(match[1], 10) || 0) : baseVal;
    return { val, cat };
  }

  static parsePlanets(s, rootJson, planetsBlock, out) {
    let pIds = Array.isArray(s.planet) ? s.planet : (s.planet?._list || (s.planet ? [s.planet] : []));
    let depDb = rootJson.deposit || rootJson.deposits || null;
    if (depDb && depDb.deposit) depDb = depDb.deposit;
    
    out.arcEligibleCount = 0;
    const yieldsMap = {};
    
    if (depDb && typeof depDb === 'object') {
      const keys = Array.isArray(depDb) ? depDb : (depDb._list ? depDb._list : Object.keys(depDb));
      keys.forEach(k => {
        const dObj = (typeof k === 'object') ? k : depDb[k];
        if (dObj?.deposit_holder?.type !== undefined && dObj.type) {
          const hType = String(dObj.deposit_holder.type).trim();
          if (hType === "0" || hType === "pc" || hType === "planet") {
            const hId = String(dObj.deposit_holder.id).trim();
            if (!yieldsMap[hId]) yieldsMap[hId] = [];
            yieldsMap[hId].push({ type: String(dObj.type) });
          }
        }
      });
    }

    pIds.forEach((pId, index) => {
      const cleanId = String(typeof pId === 'object' ? pId.key || pId.value : pId).trim();
      if (!cleanId || cleanId === "undefined") return;
      out.planetCount++;
      const pObj = planetsBlock ? planetsBlock[cleanId] : null;
      if (!pObj) { out.celestialList.push({ id: cleanId, name: `Body ${cleanId}`, type: "Unscanned" }); return; }

      const pName = ParadoxNameResolver.resolve(pObj.name || "Unknown");
      const pClass = ParadoxNameResolver.cleanString(String(pObj.planet_class || "unknown"));
      if (pClass.toLowerCase().includes("molten")) out.hasMolten = true;
      
      let localBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      const activeDeps = yieldsMap[cleanId] || [];
      const rOwn = pObj.owner !== undefined ? String(pObj.owner).trim() : "none";
      const isCol = rOwn !== "none" && rOwn !== "" && rOwn !== "4294967295" || pObj.colonize_date || pObj.final_designation || pObj.colony_level || pObj.pop;

      activeDeps.forEach(d => {
        const res = SystemDataHelpers.extractValueFromDepositType(d.type);
        if (res.cat === "unknown" || res.val <= 0) return;
        const cType = d.type.replace(/"/g, '').trim().toLowerCase();
        if (isCol && !cType.includes("d_minerals_") && !cType.includes("d_energy_") && !cType.includes("d_alloys_") && !cType.includes("d_physics_") && !cType.includes("d_engineering_") && !cType.includes("d_society_")) return;
        out.resBreakdown[res.cat] += res.val; localBreakdown[res.cat] += res.val;
      });

      if (ArcFurnaceEvaluator.isPlanetEligible(pObj, index, pClass.toLowerCase(), localBreakdown)) out.arcEligibleCount++;
      out.celestialList.push({ id: cleanId, name: pName, type: pClass });
    });
  }

  static parseMegastructures(s, rootJson, found) {
    let mIds = Array.isArray(s.megastructures) ? s.megastructures : (s.megastructures?._list || (s.megastructures ? [s.megastructures] : []));
    let db = rootJson.megastructures || rootJson.megastructure || null;
    mIds.forEach(mId => {
      const cId = String(typeof mId === 'object' ? mId.key || mId.value : mId).trim();
      if (!cId) return;
      let obj = (db && typeof db === 'object') ? db[cId] : null;
      if (!obj && rootJson.megastructure) obj = rootJson.megastructure[cId];
      if (obj?.type) {
        found.push({ id: cId, type: ParadoxNameResolver.cleanString(String(obj.type).trim()), rawType: String(obj.type).trim(), owner: obj.owner !== undefined ? String(obj.owner).trim() : "none" });
      } else { found.push({ id: cId, type: "Facility Structure", rawType: "unknown", owner: "none" }); }
    });
  }

  static parseBypasses(s, rootJson, ft, sysId) {
    if (s.natural_wormholes !== undefined) ft.wormhole = true;
    if (s.flags) {
      Object.keys(s.flags).forEach(fk => {
        const low = fk.toLowerCase();
        if (low.includes("lgate") || low.includes("l_gate")) ft.lgate = true;
        if (low.includes("shroud")) ft.shroud = true;
        if (low.includes("gateway")) ft.gate = true;
      });
    }
    let bIds = Array.isArray(s.bypasses) ? s.bypasses : (s.bypasses?._list || (s.bypasses ? [s.bypasses] : []));
    bIds.forEach(bId => {
      const cId = String(typeof bId === 'object' ? bId.key || bId.value : bId).trim();
      const bp = rootJson.bypasses ? rootJson.bypasses[cId] : null;
      if (bp?.type) {
        const t = String(bp.type).toLowerCase();
        if (t.includes("wormhole")) {
          ft.wormhole = true; ft.wormholeGlobalIndex = cId;
          if (bp.linked_to !== undefined) ft.wormholeTargetIndex = String(typeof bp.linked_to === 'object' ? bp.linked_to.key || bp.linked_to.value : bp.linked_to).trim();
        }
        if (t.includes("gateway")) ft.gate = true;
        if (t.includes("lgate") || t.includes("l-gate")) ft.lgate = true;
        if (t.includes("shroud")) ft.shroud = true;
      }
    });
  }
}
