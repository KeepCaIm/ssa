// js/view/map/MapInteractionManager.js

/**
 * MapInteractionManager
 * Decoupled event router managing canvas coordinate dragging vectors, 
 * cursor-relative scrolling multipliers, and precise orbital system targeting click hits.
 */
export class MapInteractionManager {
  /**
   * @param {MapScreen} screenInstance - Parent map screen context.
   */
  constructor(screenInstance) {
    this.s = screenInstance;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.resizeHandler = () => this.handleResize();
    this.mouseDownHandler = (e) => this.handleMouseDown(e);
    this.mouseMoveHandler = (e) => this.handleMouseMove(e);
    this.mouseUpHandler = () => this.handleMouseUp();
    this.wheelHandler = (e) => this.handleWheel(e);
    this.clickHandler = (e) => this.handleCanvasClick(e);
  }

  attach() {
    window.addEventListener('resize', this.resizeHandler);
    this.s.el.addEventListener('mousedown', this.mouseDownHandler);
    this.s.el.addEventListener('mousemove', this.mouseMoveHandler);
    this.s.el.addEventListener('mouseup', this.mouseUpHandler);
    this.s.el.addEventListener('wheel', this.wheelHandler, { passive: false });
    this.s.el.addEventListener('click', this.clickHandler);
  }

  detach() {
    window.removeEventListener('resize', this.resizeHandler);
    if (!this.s.el) return;
    this.s.el.removeEventListener('mousedown', this.mouseDownHandler);
    this.s.el.removeEventListener('mousemove', this.mouseMoveHandler);
    this.s.el.removeEventListener('mouseup', this.mouseUpHandler);
    this.s.el.removeEventListener('wheel', this.wheelHandler);
    this.s.el.removeEventListener('click', this.clickHandler);
  }

  handleResize() {
    this.s.camera.resize();
    this.s.drawFrame();
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.startX = e.clientX - this.s.camera.panX;
    this.startY = e.clientY - this.s.camera.panY;
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.s.camera.panX = e.clientX - this.startX;
    this.s.camera.panY = e.clientY - this.startY;
    this.s.drawFrame();
    this.notifyCamera();
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleWheel(e) {
    e.preventDefault();
    const rect = this.s.el.getBoundingClientRect();
    this.s.camera.applyZoomStep(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
    this.s.drawFrame();
    this.notifyCamera();
  }

  handleCanvasClick(e) {
    if (Math.abs(e.clientX - (this.startX + this.s.camera.panX)) > 3) return;
    const rect = this.s.el.getBoundingClientRect();
    const worldPos = this.s.camera.screenToWorld(e.clientX, e.clientY, rect);
    const clickTolerance = 12 / this.s.camera.zoom;

    const targetNode = this.s.systems.find(sys => {
      const dx = sys.mapX - worldPos.x;
      const dy = sys.mapY - worldPos.y;
      return Math.sqrt(dx * dx + dy * dy) <= clickTolerance;
    });

    if (targetNode) this.s.onSystemNodeMapClick(targetNode);
  }

  notifyCamera() {
    if (this.s.onCameraStateMutation) {
      this.s.onCameraStateMutation({
        zoom: this.s.camera.zoom,
        panX: this.s.camera.panX,
        panY: this.s.camera.panY
      });
    }
  }
}
