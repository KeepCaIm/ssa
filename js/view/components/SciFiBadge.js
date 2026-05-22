import { STELLARIS_UI } from '../StellarisUiConstants.js';

/**
 * SciFiBadge
 * Reusable, self-contained interactive tactical badge element.
 */
export class SciFiBadge {
  /**
   * Generates a stylized glowing interface badge component.
   * @param {string} labelText - Visual text displayed inside the badge node.
   * @param {string} rawTokenValue - Raw matching database key token used for engine clustering sorts.
   * @param {string} borderColor - Hex/RGB style outline color code token.
   * @param {string} sortTagContextId - Active programmatic column strategy identifier tag (e.g., 'badge').
   * @param {Function|null} onCustomSortTrigger - Parent callback router forwarding click events upwards.
   * @returns {HTMLElement} Prepared DOM span block node element ready for append operations.
   */
  static create(labelText, rawTokenValue, borderColor, sortTagContextId = 'badge', onCustomSortTrigger = null) {
    const b = document.createElement('span');
    b.innerText = labelText;
    
    // Bind shared functional style matrices explicitly
    b.style.cssText = STELLARIS_UI.styles.interactiveBadge + 
      `background: ${STELLARIS_UI.colors.panelBgLight}; ` +
      `border: 1px solid ${borderColor || STELLARIS_UI.colors.borderAccent}; ` +
      `color: ${borderColor || STELLARIS_UI.colors.borderAccent};`;
      
    b.title = `Raw Key: ${rawTokenValue}\n\n[ CLICK TO CLUSTER COVERT ROW VALUES BY THIS METRIC ]`;
    
    b.onclick = (e) => {
      e.stopPropagation();
      if (onCustomSortTrigger) {
        onCustomSortTrigger(sortTagContextId, rawTokenValue);
      }
    };
    
    return b;
  }
}
