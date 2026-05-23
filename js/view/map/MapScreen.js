// js/view/map/MapScreen.js
import { STELLARIS_UI } from '../StellarisUiConstants.js';
import { MapCamera } from './MapCamera.js';
import { MapRenderer } from './MapRenderer.js';
import { MapInteractionManager } from './MapInteractionManager.js';

/**
 * MapScreen
 * Coordinates the tactical HTML5 Canvas galaxy viewport screen, hosting 
 * toolbar configurations, layout nodes, and triggering draw frame loops.
 */
export class MapScreen {
  constructor(viewport, saveData, activeSystemIdsSet, activeEmpireIdsSet, initialCameraState, onSystemNodeMapClick, onCameraStateMutation) {
    this.viewport = viewport;
    this.saveData = saveData;
    this.activeSystemIdsSet = activeSystemIdsSet; 
    this.activeEmpireIdsSet = activeEmpireIdsSet; 
    this.initialCameraState = initialCameraState; 
    this.onSystemNodeMapClick = onSystemNodeMapClick;
    this.onCameraStateMutation = onCameraStateMutation; 
    
    this.activeTransitFilter = 'none'; 
    this.systems = this.saveData.systems || [];
    this.empires = this.saveData.empires || [];

    this.el = document.createElement('canvas');
    this.ctx = this.el.getContext('2d');
    this.camera = new MapCamera(this.el);
    this.renderer = new MapRenderer(this.el, this.ctx, this.camera);
    
    // Wire up decoupled interactions manager block
    this.interactionManager = new MapInteractionManager(this);
  }

  render() {
    this.viewport.innerHTML = '';
    const container = document.createElement('div');
    container.style.cssText = STELLARIS_UI.styles.fullFrame + 'display:flex; flex-direction:column; position:relative;';

    const controlPanel = document.createElement('div');
    controlPanel.style.cssText = `padding:10px; background:${STELLARIS_UI.colors.panelBgLight}; border-bottom:1px solid ${STELLARIS_UI.colors.border}; display:flex; gap:15px; align-items:center; z-index:5; font-family:${STELLARIS_UI.font}; font-size:11px; font-weight:bold; color:${STELLARIS_UI.colors.textHeader}; letter-spacing:1px;`;
    controlPanel.innerText = "TACTICAL TRANSIT OVERLAY:";

    const options = [
      { id: 'none', label: 'STANDARD MAP' },
      { id: 'wormhole', label: '🌀 WORMHOLES' },
      { id: 'gate', label: '🚪 GATEWAYS' },
      { id: 'lgate', label: '🔲 L-GATES' },
      { id: 'shroud', label: '⛩️ SHROUD TUNNELS' }
    ];

    options.forEach(opt => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:5px; cursor:pointer; color:#fff;';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'transitFilter';
      radio.value = opt.id;
      radio.checked = this.activeTransitFilter === opt.id;
      radio.style.cursor = 'pointer';

      radio.addEventListener('change', (e) => {
        this.activeTransitFilter = e.target.value;
        this.renderer.activeTransitFilter = this.activeTransitFilter;
        this.drawFrame();
      });

      label.appendChild(radio);
      label.appendChild(document.createTextNode(opt.label));
      controlPanel.appendChild(label);
    });

    container.appendChild(controlPanel);
    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.cssText = 'flex:1; width:100%; height:100%; position:relative; overflow:hidden;';
    this.el.style.cssText = 'width:100%; height:100%; display:block;';
    
    canvasWrapper.appendChild(this.el);
    container.appendChild(canvasWrapper);
    this.viewport.appendChild(container);
    
    this.interactionManager.attach();

    requestAnimationFrame(() => {
      this.camera.resize();
      this.renderer.checkedEmpireIdsSet = this.activeEmpireIdsSet;
      this.renderer.activeTransitFilter = this.activeTransitFilter;

      if (this.initialCameraState) {
        this.camera.zoom = this.initialCameraState.zoom;
        this.camera.panX = this.initialCameraState.panX;
        this.camera.panY = this.initialCameraState.panY;
      } else {
        this.camera.fitBounds(this.systems);
      }
      this.drawFrame();
    });
  }

  drawFrame() {
    this.renderer.clear();
    this.renderer.drawGrid();
    this.renderer.drawHyperlanes(this.systems);
    if (this.activeTransitFilter === 'wormhole') this.renderer.drawWormholeLinks(this.systems);
    this.renderer.drawSystems(this.systems, this.activeSystemIdsSet, this.empires);
  }

  destroy() {
    this.interactionManager.detach();
  }
}
