import { STELLARIS_UI } from '../core/Theme.js';

/**
 * EmpireRenderers
 * Presentation layer component isolating custom DOM badge logic and interactive 
 * click sort vectors driven entirely by the centralized STELLARIS_UI color matrix.
 */
export class EmpireRenderers {
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
      label = "STANDARD";
      icon = "🚀";
      badgeColor = STELLARIS_UI.colors.empStandard; 
    } else if (clean.includes("fallen") || clean.includes("awakened")) {
      label = "FALLEN EMPIRE";
      icon = "🏛️";
      badgeColor = STELLARIS_UI.colors.empFallen;
    } else if (clean.includes("enclave")) {
      label = "ENCLAVE";
      icon = "🔬";
      badgeColor = STELLARIS_UI.colors.empEnclave;
    } else if (clean.includes("crisis") || clean.includes("marauder")) {
      icon = "💀";
      badgeColor = STELLARIS_UI.colors.empCrisis;
    }

    const b = document.createElement('span');
    b.innerText = `${icon} ${label}`;
    b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${badgeColor}; color:${badgeColor};`;
    b.title = `Raw Class Type: ${v}\n\n[ CLICK TO SORT BY THIS EMPIRE TYPE ]`;
    
    b.onclick = (e) => {
      e.stopPropagation();
      if (onCustomSortTrigger) {
        // Aligned with the screen's custom filter key tracking signatures
        onCustomSortTrigger('type_filter', v);
      }
    };
    
    el.appendChild(b);
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
      const b = document.createElement('span');
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

      b.innerText = `${icon} ${clean.toUpperCase()}`;
      b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${STELLARIS_UI.colors.borderAccent}; color:${STELLARIS_UI.colors.borderAccent};`;
      b.title = `Raw Key: ${eth}\n\n[ CLICK TO SORT BY THIS ETHIC ]`;
      
      b.onclick = (e) => {
        e.stopPropagation();
        if (onCustomSortTrigger) {
          onCustomSortTrigger('ethic_filter', eth);
        }
      };
      el.appendChild(b);
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
      const b = document.createElement('span');
      const clean = String(civ).replace('civic_', '').split('_').join(' ');
      
      b.innerText = `🏛️ ${clean.toUpperCase()}`;
      b.style.cssText = STELLARIS_UI.styles.interactiveBadge + `background:${STELLARIS_UI.colors.panelBgLight}; border:1px solid ${STELLARIS_UI.colors.textSub}; color:${STELLARIS_UI.colors.textSub};`;
      b.title = `Raw Key: ${civ}\n\n[ CLICK TO SORT BY THIS CIVIC ]`;
      
      b.onclick = (e) => {
        e.stopPropagation();
        if (onCustomSortTrigger) {
          onCustomSortTrigger('civic_filter', civ);
        }
      };
      el.appendChild(b);
    });
    return el;
  }
}
