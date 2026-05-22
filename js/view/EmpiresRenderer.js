import { STELLARIS_UI } from './StellarisUiConstants.js';
import { SciFiBadge } from './components/SciFiBadge.js'; // Linked shared component

/**
 * EmpiresRenderer
 * Presentation layer component isolating custom DOM badge logic and interactive 
 * click sort vectors driven entirely by the centralized STELLARIS_UI color matrix.
 */
export class EmpiresRenderer {
  static renderType(v, row, onCustomSortTrigger) {
    const el = document.createElement('div');
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    
    if (v === undefined || v === null || v === "") {
      el.innerText = "✖";
      el.style.color = STELLARIS_UI.colors.badgeEmpty;
      return el;
    }

    const clean = String(v).toLowerCase();
    let label = clean.split('_').join(' ').toUpperCase();
    let icon = "🌐";
    let badgeColor = STELLARIS_UI.colors.empGeneric; 

    if (clean === "default") {
      label = "STANDARD"; icon = "🚀"; badgeColor = STELLARIS_UI.colors.empStandard; 
    } else if (clean.includes("fallen") || clean.includes("awakened")) {
      label = "FALLEN EMPIRE"; icon = "🏛️"; badgeColor = STELLARIS_UI.colors.empFallen;
    } else if (clean.includes("enclave")) {
      label = "ENCLAVE"; icon = "🔬"; badgeColor = STELLARIS_UI.colors.empEnclave;
    } else if (clean.includes("crisis") || clean.includes("marauder")) {
      icon = "💀"; badgeColor = STELLARIS_UI.colors.empCrisis;
    }

    // Clean Component Hook Replacement
    const badgeNode = SciFiBadge.create(`${icon} ${label}`, v, badgeColor, 'badge', onCustomSortTrigger);
    el.appendChild(badgeNode);
    return el;
  }

  static renderEthics(v, row, onCustomSortTrigger) {
    const el = document.createElement('div');
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    
    if (v === undefined || v === null || v.length === 0) {
      el.innerText = "✖";
      el.style.color = STELLARIS_UI.colors.badgeEmpty;
      return el;
    }

    v.forEach(eth => {
      const clean = String(eth).replace('ethic_', '').split('_').join(' ');
      let icon = "⚖️";
      const low = clean.toLowerCase();
      if (low.includes("authoritarian")) icon = "👑";
      else if (low.includes("egalitarian")) icon = "✊";
      else if (low.includes("xenophile")) icon = "🤝";
      else if (low.includes("xenophobe")) icon = "🛡️";
      else if (low.includes("militarist")) icon = "⚔️";
      else if (low.includes("pacifist")) icon = "🕊️";
      else if (low.includes("spiritualist")) icon = "🔮";
      else if (low.includes("materialist")) icon = "🔬";
      else if (low.includes("gestalt")) icon = "🧠";

      // Clean Component Hook Replacement
      const badgeNode = SciFiBadge.create(`${icon} ${clean.toUpperCase()}`, eth, STELLARIS_UI.colors.borderAccent, 'badge', onCustomSortTrigger);
      el.appendChild(badgeNode);
    });
    return el;
  }

  static renderCivics(v, row, onCustomSortTrigger) {
    const el = document.createElement('div');
    el.style.cssText = STELLARIS_UI.styles.flexCenterWrap;
    
    if (v === undefined || v === null || v.length === 0) {
      el.innerText = "✖";
      el.style.color = STELLARIS_UI.colors.badgeEmpty;
      return el;
    }

    v.forEach(civ => {
      const clean = String(civ).replace('civic_', '').split('_').join(' ');
      
      // Clean Component Hook Replacement
      const badgeNode = SciFiBadge.create(`🏛️ ${clean.toUpperCase()}`, civ, STELLARIS_UI.colors.textSub, 'badge', onCustomSortTrigger);
      el.appendChild(badgeNode);
    });
    return el;
  }
}
