import { STELLARIS_UI } from '../core/Theme.js';

// Reusable sci-fi button with original stellaris hover glow effects
export class SciFiButton {
  constructor(text, type = 'primary') {
    this.el = document.createElement('button');
    this.el.innerText = text.toUpperCase();
    
    const colors = STELLARIS_UI.colors;
    const accent = type === 'danger' ? colors.low : colors.borderAccent;

    Object.assign(this.el.style, {
      background: 'rgba(0, 0, 0, 0.4)',
      border: `1px solid ${colors.border}`,
      borderColor: accent,
      color: accent,
      padding: '6px 14px',
      fontFamily: STELLARIS_UI.font,
      fontSize: '11px',
      fontWeight: 'bold',
      letterSpacing: '1.5px',
      cursor: 'pointer',
      boxShadow: `inset 0 0 4px ${colors.borderGlow}`,
      transition: 'all 0.1s ease-in-out',
      outline: 'none',
      margin: '2px'
    });

    this.initEvents(accent);
  }

  initEvents(accent) {
    const colors = STELLARIS_UI.colors;
    this.el.addEventListener('mouseenter', () => {
      this.el.style.background = 'rgba(60, 219, 180, 0.12)';
      this.el.style.color = '#ffffff';
      this.el.style.boxShadow = `0 0 10px ${accent}, inset 0 0 6px ${accent}`;
      this.el.style.textShadow = `0 0 4px #ffffff`;
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.style.background = 'rgba(0, 0, 0, 0.4)';
      this.el.style.color = accent;
      this.el.style.boxShadow = `inset 0 0 4px ${colors.borderGlow}`;
      this.el.style.textShadow = 'none';
    });
  }

  onClick(callback) {
    this.el.addEventListener('click', callback);
    return this;
  }
}
