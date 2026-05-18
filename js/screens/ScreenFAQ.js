import { STELLARIS_UI } from '../core/Theme.js';

/**
 * ScreenFAQ
 * Implements a clean, high-contrast tactical manual view displaying a structured, 
 * actionable guide for isolating peak efficiency Arc Furnace deployment coordinates.
 */
export class ScreenFAQ {
  constructor(viewport) {
    this.viewport = viewport;
  }

  render() {
    this.viewport.innerHTML = '';

    const container = document.createElement('div');
    container.style.cssText = `padding: 20px; box-sizing: border-box; font-family: ${STELLARIS_UI.font}; height: 100%; overflow-y: auto; color: ${STELLARIS_UI.colors.textMuted}; line-height: 1.6;`;

    // Overview Section Header
    const header = document.createElement('h2');
    header.innerText = "🌌 SYSTEM OVERVIEW & TACTICAL MANUAL";
    header.style.cssText = `color: ${STELLARIS_UI.colors.borderAccent}; margin-top: 0; font-size: 16px; letter-spacing: 1px; border-bottom: 1px solid ${STELLARIS_UI.colors.border}; padding-bottom: 8px;`;
    container.appendChild(header);

    const desc = document.createElement('p');
    desc.innerText = "Welcome to the Stellaris Save Analyzer. Use this tool to instantly unpack heavy save states, audit competing galactic empires, and optimize industrial megastructure placement parameters using targeted data filters.";
    desc.style.cssText = `font-size: 13px; color: ${STELLARIS_UI.colors.text}; margin-bottom: 25px;`;
    container.appendChild(desc);

    // Operational Instruction Guide Header
    const guideHeader = document.createElement('h3');
    guideHeader.innerText = "🔥 STEP-BY-STEP WORKFLOW: LOCATING OPTIMAL ARC FURNACE COORDINTATES";
    guideHeader.style.cssText = `color: ${STELLARIS_UI.colors.mid}; font-size: 13px; letter-spacing: 0.5px; margin-top: 20px; margin-bottom: 15px;`;
    container.appendChild(guideHeader);

    // Step Matrix List Elements Generation Block
    const list = document.createElement('ol');
    list.style.cssText = "padding-left: 20px; margin-bottom: 25px; font-size: 13px; list-style-type: decimal;";

    const operationalSteps = [
      "Isolate Your Domain: Navigate to the 'Empires Directory' tab and locate your empire. Left-click the row checkbox to highlight it. This instantly filters the next screen to display only your sovereign territory.",
      "Filter High-Efficiency Candidates: Switch over to the 'System Locator' tab screen. Left-click the 'MOLTEN (ARC DEPOSITS)' column header to sort your territory. Select the top 3 to 5 candidate systems showing the highest sub-body count indices. Note: Check the 'Megastructure' column first; if an Arc Furnace badge is already present in a candidate node, you can skip checking it.",
      "Trace Strategic Vectors on Galaxy Map: Open the 'Galaxy Map View' tab. All of your chosen high-value system nodes will be highlighted in sharp, high-contrast warning gold, letting you quickly plot construction fleets right to the best staging grounds."
    ];

    operationalSteps.forEach(stepText => {
      const li = document.createElement('li');
      li.innerText = stepText;
      li.style.cssText = `margin-bottom: 12px; color: ${STELLARIS_UI.colors.text};`;
      list.appendChild(li);
    });
    
    container.appendChild(list);
    this.viewport.appendChild(container);
  }
}
