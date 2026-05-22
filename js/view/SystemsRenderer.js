import { STELLARIS_UI } from './StellarisUiConstants.js';
import { SYSTEM_STATIC_REGISTRY } from '../semantic/SystemConstants.js';
import { SciFiBadge } from './components/SciFiBadge.js';

/**
 * SystemsRenderer
 * Presentation layer subroutines mapping solar properties, resource vectors,
 * and activated hyperlane transit channels into stylized badges and grids.
 */
export class SystemsRenderer {
  static renderStar(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); 
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    
    const starObj = row?.star || null;
    
    let starTokens = [];
    if (Array.isArray(v)) {
      starTokens = v;
    } else if (typeof v === 'string' && v.trim() !== "") {
      starTokens = v.split("/").map(s => s.trim()).filter(Boolean);
    } else if (starObj?.type) {
      starTokens = String(starObj.type).split("/").map(s => s.trim()).filter(Boolean);
    }

    if (starTokens.length === 0) { 
      el.innerText = "✖"; 
      el.style.color = STELLARIS_UI.colors.badgeEmpty; 
      return el; 
    }

    starTokens.forEach(trimmedStar => {
      let ico = "☀️"; 
      const low = trimmedStar.toLowerCase();
      if (low.includes("black_hole") || low.includes("blackhole") || low.includes("black hole")) ico = "🕳️";
      else if (low.includes("neutron")) ico = "⚛️";
      else if (low.includes("pulsar")) ico = "⚡";
      else if (low.includes("giant") || low.includes("supergiant") || low.includes("nova")) ico = "💥";

      // FIXED: Advanced Title Casing supporting descriptive words (e.g. 'M Giant Star')
      let displayLabel = trimmedStar
        .split('_')
        .map(word => {
          const cleanWord = word.trim();
          // Ensure special game keywords expand to full text parameters correctly
          if (cleanWord.toLowerCase() === "star") return "Star";
          if (cleanWord.toLowerCase() === "hole") return "Hole";
          return cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
        })
        .join(' ');

      // FIXED: Append missing structural suffix tokens for shorthand game engines assets definitions
      if (!displayLabel.toLowerCase().includes("star") && 
          !displayLabel.toLowerCase().includes("hole") && 
          !displayLabel.toLowerCase().includes("pulsar")) {
        displayLabel += displayLabel.toLowerCase().includes("world") ? " Star" : " World Star";
      }

      const starBadge = SciFiBadge.create(
        `${ico} ${displayLabel}`,
        trimmedStar,
        STELLARIS_UI.colors.textHeader,
        'badge',
        onCustomSortTrigger
      );
      
      const bBreakdown = starObj?.resourcesBreakdown || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      const idsStr = starObj?.starIds?.length > 0 ? starObj.starIds.join(", ") : (starObj ? starObj.id : "Unknown");
      starBadge.title = `Star ID(s): ${idsStr}\nClassification: ${displayLabel}\n\nStellar Resource Payload:\n⚡ Energy: +${bBreakdown.e}\n⛏️ Minerals: +${bBreakdown.m}\n⚛️ Physics: +${bBreakdown.p}\n🍃 Society: +${bBreakdown.s}\n⚙️ Engineering: +${bBreakdown.g}\n\n[ CLICK TO CLUSTER ROWS MATCHING THIS CLASS ]`;
      
      el.appendChild(starBadge);
    });

    return el;
  }

  static renderBodies(v, row) {
    const el = document.createElement('div'); 
    el.style.cssText = `cursor:help; font-weight:bold; color:${STELLARIS_UI.colors.textHeader};`;
    el.innerText = String(v || 0);
    el.title = !row?.celestialList?.length ? "No sub-bodies tracked." : `Celestial Tree Details:\n${row.celestialList.map(c => `[ID: ${c.id}] ${c.name} (${c.type})`).join('\n')}`;
    return el;
  }

  static renderMoltenArc(v, row) {
    const s = document.createElement('span'); 
    s.style.fontWeight = "bold";
    if (row?.hasMoltenWorld) {
      s.innerText = `✓ (${row.arcEligibleCount || 0})`; 
      // FIXED: Swapped out broken variable assignment loop shorthand with standard global token pointer path
      s.style.color = STELLARIS_UI.colors.high;
      s.title = `System contains a Molten World.\nTotal celestial objects eligible for Arc Furnace deposits: ${row.arcEligibleCount || 0}`;
    } else { 
      s.innerText = "✖"; 
      s.style.color = STELLARIS_UI.colors.badgeEmpty; 
      s.title = "System lacks a Molten World baseline qualification factor."; 
    }
    return s;
  }

  static renderSplitResources(v) {
    const container = document.createElement('div'); 
    container.style.cssText = 'display:flex; gap:6px; align-items:center; font-weight:bold; font-size:11px;';
    const p = (v && v.resourcesBreakdown) ? v.resourcesBreakdown : (v || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 });
    
    const items = [
      { cond: p.e > 0, val: p.e, ico: "⚡", col: STELLARIS_UI.colors.mid, label: "Energy" },
      { cond: p.m > 0, val: p.m, ico: "⛏️", col: "#e88024", label: "Minerals" },
      { cond: p.a > 0, val: p.a, ico: "🛡️", col: STELLARIS_UI.colors.high, label: "Alloys" },
      { cond: p.p > 0, val: p.p, ico: "⚛️", col: STELLARIS_UI.colors.textSub, label: "Physics" },
      { cond: p.s > 0, val: p.s, ico: "🍃", col: "#5ce681", label: "Society" },
      { cond: p.g > 0, val: p.g, ico: "⚙️", col: "#e6b65c", label: "Engineering" },
      { cond: p.n > 0, val: p.n, ico: "🔮", col: "#b446e3", label: "Specials" }
    ];
    let hasAny = false;
    items.forEach(it => {
      if (it.cond) {
        hasAny = true; 
        const span = document.createElement('span'); 
        span.innerText = `${it.ico}${it.val}`; 
        span.style.color = it.col; 
        span.title = `${it.label} Value Node`; 
        container.appendChild(span);
      }
    });
    if (!hasAny) { 
      container.innerText = "✖"; 
      container.style.color = STELLARIS_UI.colors.badgeEmpty; 
    }
    return container;
  }

  static renderStarYields(v, row) { 
    if (Array.isArray(row?.stars)) {
      const compiledBreakdown = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      row.stars.forEach(s => {
        const b = s.resourcesBreakdown || {};
        compiledBreakdown.e += (b.e || 0); compiledBreakdown.m += (b.m || 0);
        compiledBreakdown.a += (b.a || 0); compiledBreakdown.p += (b.p || 0);
        compiledBreakdown.s += (b.s || 0); compiledBreakdown.g += (b.g || 0);
        compiledBreakdown.n += (b.n || 0);
      });
      return SystemsRenderer.renderSplitResources(compiledBreakdown);
    }
    return SystemsRenderer.renderSplitResources(row?.star?.resourcesBreakdown || null); 
  }

  static renderMegastructures(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); 
    if (!v?.length) { 
      el.innerText = "✖"; 
      el.style.color = STELLARIS_UI.colors.badgeEmpty; 
      return el; 
    }
    v.forEach(m => {
      const raw = String(m.rawType || "").toLowerCase();
      let icon = "🏗️"; 
      let name = m.type;
      const match = SYSTEM_STATIC_REGISTRY.megastructures.find(cfg => raw.includes(cfg.key));
      if (match) { 
        icon = match.icon; 
        name = match.name; 
      }
      
      const isRuined = raw.includes("ruined");
      if (isRuined) name += " [Ruined]";
      else if (raw.includes("_0") || raw.includes("_1") || raw.includes("framework") || raw.includes("core")) name += " [Frame]";

      const borderCol = isRuined ? 'rgba(160, 175, 185, 0.75)' : STELLARIS_UI.colors.borderAccent;
      const badgeNode = SciFiBadge.create(`${icon} ${name}`, m.rawType, borderCol, 'badge', onCustomSortTrigger);
      
      if (isRuined) {
        badgeNode.style.color = '#7d8e95'; 
      }
      
      badgeNode.title = `Structure ID: ${m.id}\nRaw Class: ${m.rawType}\nEmpire ID: ${m.owner}\n\n[ CLICK TO SORT BY THIS STRUCTURE ]`;
      el.appendChild(badgeNode);
    });
    return el;
  }

  static renderFastTravel(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); 
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    if (!v || (!v.wormhole && !v.gate && !v.lgate && !v.shroud)) { 
      el.innerText = "✖"; 
      el.style.color = STELLARIS_UI.colors.badgeEmpty; 
      return el; 
    }
    const nodes = [
      { cond: v.wormhole, token: 'wormhole', ico: "🌀", label: "Wormhole" },
      { cond: v.gate, token: 'gate', ico: "🚪", label: "Gateway" },
      { cond: v.lgate, token: 'lgate', ico: "🔒", label: "L-Gate" },
      { cond: v.shroud, token: 'shroud', ico: "🔮", label: "Shroud Tunnel" }
    ];
    nodes.forEach(n => {
      if (n.cond) {
        const badgeNode = SciFiBadge.create(
          `${n.ico} ${n.label.toUpperCase()}`, 
          n.token, 
          STELLARIS_UI.colors.borderAccent, 
          'badge', 
          onCustomSortTrigger
        );
        el.appendChild(badgeNode);
      }
    });
    return el;
  }
}
