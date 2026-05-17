import { MapCamera } from './MapCamera.js';
import { MapRenderer } from './MapRenderer.js';

export class GalaxyMap {
  constructor(onSystemClick, onCameraChange = null) {
    this.onSystemClick = onSystemClick;
    this.onCameraChange = onCameraChange; 
    this.el = document.createElement('canvas');
    
    this.camera = new MapCamera(this.el);
    this.renderer = new MapRenderer(this.el, this.el.getContext('2d'), this.camera);
    
    this.systems = [];
    this.empires = [];
    this.activeTransitFilter = 'none'; // FIXED: Forward transit selector state down

    Object.assign(this.el.style, { 
      width: '100%', height: '100%', cursor: 'grab', display: 'block' 
    });
    
    this.isDragging = false;
    this.startX = 0; this.startY = 0;
    this.totalMoveDist = 0; 
    
    this.initEvents();
  }

  setViewport(systems, checkedIdsSet = new Set(), empiresList = [], cachedState = null, checkedEmpireIdsSet = new Set()) {
    this.empires = empiresList;
    this.renderer.checkedIdsSet = checkedIdsSet;
    this.renderer.checkedEmpireIdsSet = checkedEmpireIdsSet; 
    this.systems = systems;

    this.camera.resize();
    
    if (cachedState) {
      this.camera.zoom = cachedState.zoom;
      this.camera.panX = cachedState.panX;
      this.camera.panY = cachedState.panY;
    } else {
      this.camera.fitBounds(this.systems);
    }
    
    this.render();
  }

  notifyCameraMutation() {
    if (this.onCameraChange) {
      this.onCameraChange({ zoom: this.camera.zoom, panX: this.camera.panX, panY: this.camera.panY });
    }
  }

  initEvents() {
    window.addEventListener('resize', () => { this.camera.resize(); this.render(); });
    this.el.addEventListener('mousedown', (e) => {
      this.isDragging = true; this.el.style.cursor = 'grabbing';
      this.startX = e.clientX - this.camera.panX; this.startY = e.clientY - this.camera.panY;
      this.totalMoveDist = 0; 
    });
    window.addEventListener('mouseup', () => { this.isDragging = false; this.el.style.cursor = 'grab'; });
    this.el.addEventListener('mousemove', (e) => {
      const rect = this.el.getBoundingClientRect();
      if (this.isDragging) {
        const newPanX = e.clientX - this.startX; const newPanY = e.clientY - this.startY;
        this.totalMoveDist += Math.hypot(newPanX - this.camera.panX, newPanY - this.camera.panY);
        this.camera.panX = newPanX; this.camera.panY = newPanY;
        this.notifyCameraMutation(); this.render(); return;
      }
      const worldPos = this.camera.screenToWorld(e.clientX, e.clientY, rect);
      let isHoveringNode = this.systems.some(s => Math.hypot(s.mapX - worldPos.x, s.mapY - worldPos.y) < 25 / this.camera.zoom);
      this.el.style.cursor = isHoveringNode ? 'default' : 'grab';
    });
    this.el.addEventListener('wheel', (e) => {
      e.preventDefault(); const rect = this.el.getBoundingClientRect();
      this.camera.applyZoomStep(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
      this.notifyCameraMutation(); this.render();
    }, { passive: false });
    this.el.addEventListener('click', (e) => {
      if (this.totalMoveDist > 6) return;
      const rect = this.el.getBoundingClientRect();
      const worldPos = this.camera.screenToWorld(e.clientX, e.clientY, rect);
      const detectedNode = this.systems.find(s => Math.hypot(s.mapX - worldPos.x, s.mapY - worldPos.y) < 25 / this.camera.zoom);
      if (detectedNode) this.onSystemClick(detectedNode);
    });
  }

  render() {
    this.renderer.clear();
    this.renderer.drawGrid();
    
    // FIXED: Forwarded filter query down to specialized renderer engines
    this.renderer.activeTransitFilter = this.activeTransitFilter;
    
    this.renderer.drawHyperlanes(this.systems);
    
    // FIXED: Wormholes dynamic link connector engine execution step
    if (this.activeTransitFilter === 'wormhole') {
      this.renderer.drawWormholeLinks(this.systems);
    }
    
    this.renderer.drawSystems(this.systems, this.renderer.checkedIdsSet, this.empires);
  }
}
