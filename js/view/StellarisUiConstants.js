// js/view/StellarisUiConstants.js

/**
 * STELLARIS_UI
 * Centralized design system token archive mapping typography, specific asset color channels,
 * dashboard border glow primitives, and presentation style mixins.
 * UI designers can modify colors and badge sizes here without touching lower-level mechanics.
 */
export const STELLARIS_UI = {
  font: '"Lucida Grande", "Lucida Sans Unicode", "DejaVu Sans", Arial, sans-serif',
  colors: {
    bg: '#040d0f',             
    panelBg: '#061112',        
    panelBgLight: '#0b1d1e',   
    border: '#1c3d39',         
    borderAccent: '#3cdbb4',   
    borderGlow: 'rgba(60, 219, 180, 0.25)', 
    grid: '#0a1d1b',           
    textHeader: '#8bbfa8',     
    text: '#ffffff',           
    textSub: '#5cb3e6',        // High-contrast Slate/Sky Blue for Civics
    textMuted: '#96b3af',      
    high: '#32e632', 
    mid: '#ffb900',  
    low: '#ff4a4a',  
    hyperlane: '#12302b',
    selected: '#ffb900',
    
    // Core Semantic Empire Type Palette
    empStandard: '#3cdbb4',    // Vibrant terminal Teal-Green
    empGeneric: '#8ba5bf',     // Low-saturation Slate Grey for general factions
    empFallen: '#ffb900',      // Deep cosmic gold
    empEnclave: '#cf5ce6',     // Mystic violet/magenta
    empCrisis: '#ff3b3b',      // Aggressive war red
    
    // Interactive Layout Primitives
    badgeEmpty: 'rgba(255, 255, 255, 0.15)',
    rowHoverBg: 'rgba(60, 219, 180, 0.04)',
    rowHighlightBg: 'rgba(60, 219, 180, 0.15)'
  },
  styles: {
    fullFrame: 'width:100%; height:100%; box-sizing:border-box;',
    flexCenterWrap: 'display:flex; gap:6px; flex-wrap:wrap; align-items:center;',
    interactiveBadge: 'margin-right:4px; padding:2px 6px; border-radius:3px; cursor:pointer; font-size:10px; color:#fff; display:inline-block; margin-top:2px; user-select:none; font-weight:bold; transition: transform 0.05s ease;'
  }
};
