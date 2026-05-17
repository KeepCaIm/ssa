// Standalone design system configuration mapping terminal aesthetics
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
    textSub: '#4fe3da',        
    textMuted: '#96b3af',      
    high: '#32e632', 
    mid: '#ffb900',  
    low: '#ff4a4a',  
    hyperlane: '#12302b',
    selected: '#ffb900'
  },
  styles: {
    fullFrame: 'width:100%; height:100%; box-sizing:border-box;',
    flexCenterWrap: 'display:flex; gap:6px; flex-wrap:wrap; align-items:center;',
    interactiveBadge: 'margin-right:4px; padding:2px 6px; border-radius:3px; cursor:pointer; font-size:10px; color:#fff; display:inline-block; margin-top:2px; user-select:none; font-weight:bold; transition: transform 0.05s ease;'
  }
};
