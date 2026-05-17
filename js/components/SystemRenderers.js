import { STELLARIS_UI } from '../core/Theme.js';

export class SystemRenderers {
  static renderStar(v) {
    const el = document.createElement('div');
    el.style.cursor = 'help';
    if (!v) {
      el.innerText = "☀️ Special Anomaly";
      el.title = "Non-standard cosmic anomaly or empty coordinate point.";
      return el;
    }
    let icon = "☀️";
    const low = String(v.type || "").toLowerCase();
    if (low.includes("black_hole") || low.includes("blackhole") || low.includes("black hole")) icon = "🕳️";
    else if (low.includes("neutron")) icon = "⚛️";
    else if (low.includes("pulsar")) icon = "⚡";
    else if (low.includes("giant") || low.includes("supergiant")) icon = "💥";
    
    el.innerText = `${icon} ${v.type || 'Unknown'}`;
    const b = v.resourcesBreakdown || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
    el.title = `Star ID: ${v.id}\nName: ${v.name}\nStar Yields:\n⚡ Energy: +${b.e}\n⛏️ Minerals: +${b.m}\n⚛️ Physics: +${b.p}\n🍃 Society: +${b.s}\n⚙️ Engineering: +${b.g}`;
    return el;
  }

  static renderBodies(v, row) {
    const el = document.createElement('div');
    el.style.cssText = 'cursor:help; font-weight:bold; color:#fff;';
    el.innerText = String(v || 0);
    el.title = (!row || !row.celestialList || row.celestialList.length === 0) ? "No sub-bodies tracked." : `Celestial Tree Details:\n${row.celestialList.map(c => `[ID: ${c.id}] ${c.name} (${c.type})`).join('\n')}`;
    return el;
  }

  static renderMolten(v) {
    const s = document.createElement('span');
    if (v) {
      s.innerText = "✓"; s.style.color = STELLARIS_UI.colors.high; s.style.fontWeight = "bold";
    } else {
      s.innerText = "✖"; s.style.color = 'rgba(255,255,255,0.15)';
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
        hasAny = true; const span = document.createElement('span');
        span.innerText = `${it.ico}${it.val}`; span.style.color = it.col;
        span.title = `${it.label} Value Node`; container.appendChild(span);
      }
    });
    if (!hasAny) { container.innerText = "✖"; container.style.color = 'rgba(255,255,255,0.15)'; }
    return container;
  }

  static renderStarYields(v, row) {
    return SystemRenderers.renderSplitResources(row && row.star ? row.star.resourcesBreakdown : null);
  }

  static renderMegastructures(v, row, onCustomSortTrigger) {
    const el = document.createElement('div');
    if (!v || v.length === 0) {
      el.innerText = "✖"; el.style.color = 'rgba(255,255,255,0.15)';
      return el;
    }

    v.forEach(m => {
      const b = document.createElement('span');
      const raw = String(m.rawType || "").toLowerCase();
      let icon = "🏗️", name = m.type;

      if (raw.includes("dyson_sphere")) { icon = "🟡"; name = "Dyson Sphere"; }
      else if (raw.includes("dyson_swarm")) { icon = "🐝"; name = "Dyson Swarm"; }
      else if (raw.includes("gateway")) { icon = "🚪"; name = "Gateway"; }
      else if (raw.includes("lgate")) { icon = "🔒"; name = "L-Gate Hub"; }
      else if (raw.includes("arc_furnace")) { icon = "🔥"; name = "Arc Furnace"; }
      else if (raw.includes("matter_decompressor")) { icon = "🗜️"; name = "Matter Decompressor"; }
      else if (raw.includes("quantum_catapult")) { icon = "🎯"; name = "Quantum Catapult"; }
      else if (raw.includes("habitat")) { icon = "🛸"; name = "Orbital Habitat"; }
      else if (raw.includes("hyper_relay")) { icon = "⛓️"; name = "Hyper Relay"; }
      else if (raw.includes("shipyard")) { icon = "⚓"; name = "Mega Shipyard"; }
      else if (raw.includes("spy_orb")) { icon = "👁️"; name = "Sentry Array"; }
      else if (raw.includes("strategic")) { icon = "⚔️"; name = "Strategic Coordination"; }
      else if (raw.includes("think_tank")) { icon = "🧠"; name = "Science Nexus"; }
      else if (raw.includes("orbital_ring")) { icon = "⭕"; name = "Orbital Ring"; }
      else if (raw.includes("ring_world")) { icon = "🪐"; name = "Ring World Segment"; }
      else if (raw.includes("interstellar_assembly")) { icon = "🏛️"; name = "Interstellar Assembly"; }
      else if (raw.includes("crisis_sphere")) { icon = "💀"; name = "Aetherophasic Engine"; }
      else if (raw.includes("grand_archive")) { icon = "📚"; name = "Grand Archive"; }
      else if (raw.includes("dyson_slingshot")) { icon = "☄️"; name = "Dyson Slingshot"; }

      if (raw.includes("ruined") || raw.includes("permanently_ruined")) name += " [Ruined]";
      else if (raw.includes("_0") || raw.includes("_1") || raw.includes("_2") || raw.includes("framework") || raw.includes("core")) name += " [Frame]";

      b.innerText = `${icon} ${name}`;
      const isMuted = raw.includes("ruined");
      
      b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${isMuted ? STELLARIS_UI.colors.border : STELLARIS_UI.colors.borderAccent};`;
      b.title = `Structure ID: ${m.id}\nRaw Class: ${m.rawType}\nEmpire ID: ${m.owner}\n\n[ CLICK TO SORT BY THIS STRUCTURE ]`;
      
      // FIXED: Passing m.rawType instead of localized name token to execute flawless binary evaluations inside sorting loops
      b.onclick = (e) => { e.stopPropagation(); if (onCustomSortTrigger) onCustomSortTrigger('mega_filter', m.rawType); };
      el.appendChild(b);
    });
    return el;
  }

  static renderFastTravel(v, row, onCustomSortTrigger) {
    const el = document.createElement('div');
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    if (!v) { el.innerText = "✖"; el.style.color = 'rgba(255,255,255,0.15)'; return el; }
    
    const nodes = [
      { cond: v.wormhole, id: 'ft_wormhole', ico: "🌀", label: "Wormhole" },
      { cond: v.gate, id: 'ft_gate', ico: "🚪", label: "Gateway" },
      { cond: v.lgate, id: 'ft_lgate', ico: "🔒", label: "L-Gate" },
      { cond: v.shroud, id: 'ft_shroud', ico: "👁️", label: "Shroud Tunnel" }
    ];

    let hasAny = false;
    nodes.forEach(n => {
      if (n.cond) {
        hasAny = true; const b = document.createElement('span');
        b.innerText = `${n.ico} ${n.label}`;
        b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${STELLARIS_UI.colors.borderAccent}; color:${STELLARIS_UI.colors.borderAccent};`;
        b.title = `${n.label} Transit Node Portal\n\n[ CLICK TO SORT BY THIS TRANSIT TYPE ]`;
        
        b.onclick = (e) => { e.stopPropagation(); if (onCustomSortTrigger) onCustomSortTrigger(n.id, n.label); };
        el.appendChild(b);
      }
    });

    if (!hasAny) { el.innerText = "✖"; el.style.color = 'rgba(255,255,255,0.15)'; }
    return el;
  }
}
