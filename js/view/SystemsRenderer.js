// js/view/SystemsRenderer.js
import { STELLARIS_UI } from './StellarisUiConstants.js';
import { SYSTEM_STATIC_REGISTRY } from '../semantic/SystemConstants.js';

/**
 * SystemsRenderer
 * Presentation layer subroutines mapping solar properties, resource vectors,
 * and activated hyperlane transit channels into stylized badges and grids.
 */
export class SystemsRenderer {
  static renderStar(v, row) {
    const el = document.createElement('div'); 
    el.style.cursor = 'help';
    const starObj = row?.star || null;
    const currentType = v || starObj?.type || null;
    if (!currentType) { el.innerText = "☀️ Special Anomaly"; return el; }

    const tokens = currentType.split(" / "); 
    const icons = [];
    tokens.forEach(t => {
      let ico = "☀️"; 
      const low = t.toLowerCase();
      if (low.includes("black_hole") || low.includes("blackhole") || low.includes("black hole")) ico = "🕳️";
      else if (low.includes("neutron")) ico = "⚛️";
      else if (low.includes("pulsar")) ico = "⚡";
      else if (low.includes("giant") || low.includes("supergiant") || low.includes("nova")) ico = "💥";
      icons.push(ico);
    });

    el.innerText = `${icons.join(" ")} ${currentType}`;
    const b = starObj?.resourcesBreakdown || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
    const idsStr = starObj?.starIds?.length > 0 ? starObj.starIds.join(", ") : (starObj ? starObj.id : "Unknown");
    el.title = `Star ID(s): ${idsStr}\nName: ${starObj?.name || "Unknown"}\nStar Yields:\n⚡ Energy: +${b.e}\n⛏️ Minerals: +${b.m}\n⚛️ Physics: +${b.p}\n🍃 Society: +${b.s}\n⚙️ Engineering: +${b.g}`;
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
    const p = v || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
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
      const b = document.createElement('span'); 
      const raw = String(m.rawType || "").toLowerCase();
      let icon = "🏗️"; 
      let name = m.type;
      const match = SYSTEM_STATIC_REGISTRY.megastructures.find(cfg => raw.includes(cfg.key));
      if (match) { 
        icon = match.icon; 
        name = match.name; 
      }
      if (raw.includes("ruined")) name += " [Ruined]";
      else if (raw.includes("_0") || raw.includes("_1") || raw.includes("framework") || raw.includes("core")) name += " [Frame]";

      b.innerText = `${icon} ${name}`;
      b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${raw.includes("ruined") ? STELLARIS_UI.colors.border : STELLARIS_UI.colors.borderAccent};`;
      b.title = `Structure ID: ${m.id}\nRaw Class: ${m.rawType}\nEmpire ID: ${m.owner}\n\n[ CLICK TO SORT BY THIS STRUCTURE ]`;
      b.onclick = (e) => { 
        e.stopPropagation(); 
        if (onCustomSortTrigger) onCustomSortTrigger('mega_filter', m.rawType); 
      };
      el.appendChild(b);
    });
    return el;
  }

  static renderFastTravel(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); 
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    if (!v) { 
      el.innerText = "✖"; 
      el.style.color = STELLARIS_UI.colors.badgeEmpty; 
      return el; 
    }
    const nodes = [
      { cond: v.wormhole, id: 'ft_wormhole', ico: "🌀", label: "Wormhole" },
      { cond: v.gate, id: 'ft_gate', ico: "🚪", label: "Gateway" },
      { cond: v.lgate, id: 'ft_lgate', ico: "🔒", label: "L-Gate" },
      { cond: v.shroud, id: 'ft_shroud', ico: "🔮", label: "Shroud Tunnel" }
    ];
    let hasAny = false;
    nodes.forEach(n => {
      if (n.cond) {
        hasAny = true; 
        const b = document.createElement('span'); 
        b.innerText = `${n.ico} ${n.label.toUpperCase()}`;
        b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${STELLARIS_UI.colors.borderAccent}; color:${STELLARIS_UI.colors.borderAccent};`;
        b.title = `Transit Node Type: ${n.label}\n\n[ CLICK TO FILTER BY THIS TRANSIT NETWORK ]`;
        b.onclick = (e) => { 
          e.stopPropagation(); 
          if (onCustomSortTrigger) onCustomSortTrigger(n.id, true); 
        };
        el.appendChild(b);
      }
    });
    if (!hasAny) { 
      el.innerText = "✖"; 
      el.style.color = STELLARIS_UI.colors.badgeEmpty; 
    }
    return el;
  }
}
