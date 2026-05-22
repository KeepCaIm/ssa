// js/view/SciFiNavGroup.js
import { SciFiButton } from './components/SciFiButton.js';

/**
 * SciFiNavGroup
 * Extracted layout component coordinating top-bar application tabs and screen switching links.
 */
export class SciFiNavGroup {
  /**
   * @param {HTMLDivElement} navContainerNode - Target container element to populate.
   * @param {Function} onTabSelectionCallback - Callback executing active view switching state changes.
   */
  constructor(navContainerNode, onTabSelectionCallback) {
    this.container = navContainerNode;
    this.onSelection = onTabSelectionCallback;
    this.tabsDefinition = [
      { id: 1, label: 'Empires Directory' }, 
      { id: 2, label: 'System Locator' }, 
      { id: 3, label: 'Galaxy Map View' },
      { id: 4, label: 'FAQ & Guides' }
    ];
  }

  /**
   * Builds and maps sub-button layout arrays onto the target navigation container.
   * @param {number} activeScreenId - The currently selected screen layout identifier.
   */
  updateTabs(activeScreenId) {
    this.container.innerHTML = '';
    this.tabsDefinition.forEach(tab => {
      const isSelected = activeScreenId === tab.id;
      const buttonInstance = new SciFiButton(tab.label, isSelected ? 'primary' : 'muted');
      
      buttonInstance.onClick(() => this.onSelection(tab.id));
      this.container.appendChild(buttonInstance.el);
    });
  }
}
