// js/view/map/MapRenderer.js
import { STELLARIS_UI } from '../StellarisUiConstants.js';
import { ParadoxNameResolver } from '../../parser/ParadoxNameResolver.js';

/**
 * MapRenderer
 * Renders the structural background canvas components, handles view transformations, 
 * draws interconnected systems, dynamic transit networks, and specific wormhole matrices.
 */
export class MapRenderer {
  /**
   * @param {HTMLCanvasElement} canvas - Viewport HTML5 Canvas target node reference.
   * @param {CanvasRenderingContext2D} ctx - Drawing engine graphics context instance.
   * @param {Object} camera - Pan and zoom coordinate space transformation camera object.
   */
  constructor(canvas, ctx, camera) {
    this.canvas = canvas; 
    this.ctx = ctx; 
    this.camera = camera;
    this.interval = 100;
    this.checkedIdsSet = new Set(); 
    this.checkedEmpireIdsSet = new Set(); 
    this.activeTransitFilter = 'none'; 
  }

  /**
   * Generates background grid matrix guidelines optimized dynamically for active camera scales.
   */
  drawGrid() {
    const ctx = this.ctx;
    const colors = STELLARIS_UI.colors;
    
    // Skip rendering dense overlapping grids when zooming far out
    const adaptiveInterval = this.camera.zoom < 0.15 ? this.interval * 5 : this.interval;
    const step = Math.round(adaptiveInterval * this.camera.zoom);
    
    if (step < 8) return; 
    
    ctx.strokeStyle = colors.grid; 
    ctx.lineWidth = 1; 
    ctx.beginPath();
    
    const startX = Math.round(this.camera.panX % step); 
    const startY = Math.round(this.camera.panY % step);
    
    for (let x = startX; x <= this.canvas.width; x += step) { 
      ctx.moveTo(x, 0); 
      ctx.lineTo(x, this.canvas.height); 
    }
    for (let y = startY; y <= this.canvas.height; y += step) { 
      ctx.moveTo(0, y); 
      ctx.lineTo(this.canvas.width, y); 
    }
    ctx.stroke();
  }

  /**
   * Renders the native Clausewitz cosmic network lines linking solar spaces.
   * @param {Array<Object>} systems - Extracted systems repository items collection.
   */
  drawHyperlanes(systems) {
    const ctx = this.ctx;
    const colors = STELLARIS_UI.colors;

    systems.forEach(s => {
      if (!s.linksArray) return;
      const srcScreen = this.camera.worldToScreen(s.mapX, s.mapY);

      s.linksArray.forEach(targetId => {
        const target = systems.find(t => String(t.id) === String(targetId));
        if (target) {
          const destScreen = this.camera.worldToScreen(target.mapX, target.mapY);
          
          if (srcScreen.x < 0 && destScreen.x < 0) return;
          if (srcScreen.x > this.canvas.width && destScreen.x > this.canvas.width) return;
          
          ctx.beginPath(); 
          ctx.lineWidth = 1;
          ctx.strokeStyle = colors.hyperlane; 
          
          ctx.moveTo(srcScreen.x, srcScreen.y); 
          ctx.lineTo(destScreen.x, destScreen.y); 
          ctx.stroke();
        }
      });
    });
  }

  /**
   * Links natural wormhole anomalies using distinctive high-contrast vectors.
   * @param {Array<Object>} systems - Extracted systems repository items collection.
   */
  drawWormholeLinks(systems) {
    const ctx = this.ctx;
    const whSystems = systems.filter(s => s.fastTravel && s.fastTravel.wormholeGlobalIndex !== null && s.fastTravel.wormholeGlobalIndex !== undefined);
    
    ctx.save();
    ctx.strokeStyle = '#e88024'; 
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]); 

    const drawnPairsTrack = new Set();

    whSystems.forEach(s => {
      if (drawnPairsTrack.has(s.id)) return;
      
      const targetIndex = s.fastTravel.wormholeTargetIndex;
      if (targetIndex === null || targetIndex === undefined) return;

      // Safely matches strings instead of integers to preserve large modded maps
      const partner = whSystems.find(t => t.fastTravel && String(t.fastTravel.wormholeGlobalIndex) === String(targetIndex));

      if (partner) {
        const p1 = this.camera.worldToScreen(s.mapX, s.mapY);
        const p2 = this.camera.worldToScreen(partner.mapX, partner.mapY);
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); 
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        drawnPairsTrack.add(s.id);
        drawnPairsTrack.add(partner.id);
      }
    });
    ctx.restore();
  }

  /**
   * Draws coordinate planet system dot markers applying customized fade properties on filtered scopes.
   */
  drawSystems(systems, checkedIdsSet, empires) {
    const ctx = this.ctx;
    const colors = STELLARIS_UI.colors;
    const filterKey = this.activeTransitFilter;
    const isTransitActive = filterKey !== 'none';
    const isFilter = this.checkedEmpireIdsSet.size > 0;
    
    systems.forEach(s => {
      const pos = this.camera.worldToScreen(s.mapX, s.mapY);
      const offset = 150;
      
      if (pos.x < -offset || pos.x > this.canvas.width + offset || pos.y < -offset || pos.y > this.canvas.height + offset) return;

      const isChecked = checkedIdsSet.has(String(s.id));
      const isVis = !isFilter || this.checkedEmpireIdsSet.has(String(s.owner).trim());
      const hasTargetTransit = isTransitActive && s.fastTravel && s.fastTravel[filterKey] === true;
      const r = 4;

      if (isTransitActive) {
        if (hasTargetTransit) {
          ctx.fillStyle = colors.selected; 
          ctx.beginPath(); 
          ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2); 
          ctx.fill();
          
          ctx.fillStyle = '#ffffff'; 
          ctx.font = `bold 12px ${STELLARIS_UI.font}`;
          ctx.textAlign = 'center';
          const emp = empires.find(e => String(e.id).trim() === String(s.owner).trim());
          const tag = emp ? `[${ParadoxNameResolver.getEmpireTag(emp.name)}] ` : "";
          ctx.fillText(`${tag}${s.name}`, pos.x, pos.y - 14);
        } else {
          ctx.fillStyle = 'rgba(60, 219, 180, 0.20)'; 
          ctx.beginPath(); 
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2); 
          ctx.fill();
          
          ctx.fillStyle = 'rgba(150, 179, 175, 0.25)'; 
          ctx.font = `9px ${STELLARIS_UI.font}`;
          ctx.textAlign = 'center';
          ctx.fillText(s.name, pos.x, pos.y - 14);
        }
      } else {
        if (!isVis) {
          ctx.fillStyle = 'rgba(60, 219, 180, 0.20)'; 
          ctx.beginPath(); 
          ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2); 
          ctx.fill();
          
          ctx.fillStyle = 'rgba(150, 179, 175, 0.25)'; 
          ctx.font = `9px ${STELLARIS_UI.font}`;
          ctx.textAlign = 'center';
          ctx.fillText(s.name, pos.x, pos.y - 14);
        } else {
          if (isChecked) {
            ctx.fillStyle = colors.selected; 
            ctx.beginPath(); 
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); 
            ctx.fill();
            ctx.fillStyle = colors.selected; 
            ctx.font = `bold 12px ${STELLARIS_UI.font}`;
          } else {
            ctx.fillStyle = colors.borderAccent; 
            ctx.beginPath(); 
            ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); 
            ctx.fill();
            ctx.fillStyle = colors.textMuted; 
            ctx.font = `bold 11px ${STELLARIS_UI.font}`;
          }
          ctx.textAlign = 'center';
          const emp = empires.find(e => String(e.id).trim() === String(s.owner).trim());
          const tag = emp ? `[${ParadoxNameResolver.getEmpireTag(emp.name)}] ` : "";
          ctx.fillText(`${tag}${s.name}`, pos.x, pos.y - 14);
        }
      }
    });
  }

  /**
   * Resets viewport visual canvases to baseline deep-space terminal colors.
   */
  clear() {
    this.ctx.fillStyle = STELLARIS_UI.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
