import { STELLARIS_UI } from '../StellarisUiConstants.js';
import { SYSTEM_STATIC_REGISTRY } from '../../semantic/SystemConstants.js';
import { SciFiBadge } from '../components/SciFiBadge.js';
import { toTitleCaseStar, getStarIcon, getResourceConfig } from './SystemsRendererHelper.js';

export class SystemsRenderer {
  static renderStar(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    const starTokens = Array.isArray(v) ? v : String(v || row?.star?.type || "").split("/").map(s => s.trim()).filter(Boolean);

    if (starTokens.length === 0) { 
      el.innerText = "✖"; el.style.color = STELLARIS_UI.colors.badgeEmpty; return el; 
    }

    starTokens.forEach(trimmedStar => {
      const ico = getStarIcon(trimmedStar);
      const displayLabel = toTitleCaseStar(trimmedStar);
      const finalLabel = (!displayLabel.toLowerCase().includes("star") && !displayLabel.toLowerCase().includes("hole") && !displayLabel.toLowerCase().includes("pulsar"))
        ? displayLabel + (displayLabel.toLowerCase().includes("world") ? " Star" : " World Star") : displayLabel;

      const starBadge = SciFiBadge.create(`${ico} ${finalLabel}`, trimmedStar, STELLARIS_UI.colors.textHeader, 'badge', onCustomSortTrigger);
      const b = row?.star?.resourcesBreakdown || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      starBadge.title = `Star ID(s): ${row?.star?.starIds?.join(", ") || row?.star?.id || "Unknown"}\nClassification: ${finalLabel}\n\nYields:\n⚡ Energy: +${b.e}\n⛏️ Minerals: +${b.m}\n⚛️ Physics: +${b.p}\n🍃 Society: +${b.s}\n⚙️ Engineering: +${b.g}`;
      el.appendChild(starBadge);
    });
    return el;
  }

  static renderBodies(v, row) {
    const el = document.createElement('div'); el.style.cssText = `cursor:help; font-weight:bold; color:${STELLARIS_UI.colors.textHeader};`;
    el.innerText = String(v || 0);
    el.title = !row?.celestialList?.length ? "No sub-bodies." : `Celestial Tree:\n${row.celestialList.map(c => `[ID: ${c.id}] ${c.name} (${c.type})`).join('\n')}`;
    return el;
  }

  static renderMoltenArc(v, row) {
    const s = document.createElement('span'); s.style.fontWeight = "bold";
    if (row?.hasMoltenWorld) {
      s.innerText = `✓ (${row.arcEligibleCount || 0})`; s.style.color = STELLARIS_UI.colors.high;
      s.title = `Molten World present. Eligible objects for Arc Furnace: ${row.arcEligibleCount || 0}`;
    } else { 
      s.innerText = "✖"; s.style.color = STELLARIS_UI.colors.badgeEmpty; 
    }
    return s;
  }

  static renderSplitResources(v) {
    const container = document.createElement('div'); container.style.cssText = 'display:flex; gap:6px; align-items:center; font-weight:bold; font-size:11px;';
    const p = (v && v.resourcesBreakdown) ? v.resourcesBreakdown : (v || { e:0, m:0, a:0, p:0, s:0, g:0, n:0 });
    let hasAny = false;

    getResourceConfig(p).forEach(it => {
      if (it.cond) {
        hasAny = true; const span = document.createElement('span'); span.innerText = `${it.ico}${it.val}`; span.style.color = it.col; container.appendChild(span);
      }
    });
    if (!hasAny) { container.innerText = "✖"; container.style.color = STELLARIS_UI.colors.badgeEmpty; }
    return container;
  }

  static renderStarYields(v, row) { 
    if (Array.isArray(row?.stars)) {
      const compiled = { e:0, m:0, a:0, p:0, s:0, g:0, n:0 };
      row.stars.forEach(s => {
        const b = s.resourcesBreakdown || {};
        ['e','m','a','p','s','g','n'].forEach(k => { compiled[k] += (b[k] || 0); });
      });
      return SystemsRenderer.renderSplitResources(compiled);
    }
    return SystemsRenderer.renderSplitResources(row?.star?.resourcesBreakdown || null); 
  }

  static renderMegastructures(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); if (!v?.length) { el.innerText = "✖"; el.style.color = STELLARIS_UI.colors.badgeEmpty; return el; }
    v.forEach(m => {
      const raw = String(m.rawType || "").toLowerCase();
      let icon = "🏗️", name = m.type;
      const match = SYSTEM_STATIC_REGISTRY.megastructures.find(cfg => raw.includes(cfg.key));
      if (match) { icon = match.icon; name = match.name; }
      
      const isRuined = raw.includes("ruined");
      if (isRuined) name += " [Ruined]";
      else if (raw.includes("_0") || raw.includes("_1") || raw.includes("framework") || raw.includes("core")) name += " [Frame]";

      const borderCol = isRuined ? 'rgba(160, 175, 185, 0.75)' : STELLARIS_UI.colors.borderAccent;
      const node = SciFiBadge.create(`${icon} ${name}`, m.rawType, borderCol, 'badge', onCustomSortTrigger);
      if (isRuined) node.style.color = '#7d8e95';
      el.appendChild(node);
    });
    return el;
  }

  static renderFastTravel(v, row, onCustomSortTrigger) {
    const el = document.createElement('div'); el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    if (!v || (!v.wormhole && !v.gate && !v.lgate && !v.shroud)) { el.innerText = "✖"; el.style.color = STELLARIS_UI.colors.badgeEmpty; return el; }
    
    [
      { cond: v.wormhole, token: 'wormhole', ico: "🌀", label: "Wormhole" },
      { cond: v.gate, token: 'gate', ico: "🚪", label: "Gateway" },
      { cond: v.lgate, token: 'lgate', ico: "🔒", label: "L-Gate" },
      { cond: v.shroud, token: 'shroud', ico: "🔮", label: "Shroud Tunnel" }
    ].forEach(n => {
      if (n.cond) el.appendChild(SciFiBadge.create(`${n.ico} ${n.label.toUpperCase()}`, n.token, STELLARIS_UI.colors.borderAccent, 'badge', onCustomSortTrigger));
    });
    return el;
  }
}
