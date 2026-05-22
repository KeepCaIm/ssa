// js/view/map/MapCamera.js

/**
 * MapCamera
 * Manages map viewport camera transformations, cursor-relative scaling, 
 * and automatic bounding box fits.
 */
export class MapCamera {
  /**
   * @param {HTMLCanvasElement} canvas - Target viewport Canvas reference node.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    
    // Tight parameter boundaries protecting matrix math configurations
    this.minZoom = 0.05; // Lowered to guarantee the entire galaxy fits screen loops
    this.maxZoom = 4.0;
  }

  /**
   * Syncs internal canvas element size properties to match viewport bounding dimensions.
   */
  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  /**
   * Centers the viewport offset camera matrices directly over specified coordinate points.
   * @param {number} worldX - Spatial abstract world coordinate position on X-axis.
   * @param {number} worldY - Spatial abstract world coordinate position on Y-axis.
   */
  centerOnCoordinates(worldX, worldY) {
    this.panX = Math.round(this.canvas.width / 2 - worldX * this.zoom);
    this.panY = Math.round(this.canvas.height / 2 - worldY * this.zoom);
  }

  /**
   * Scans system boundaries to dynamically squeeze the entire galactic graph inside visible frames.
   * @param {Array<Object>} systems - Extracted systems matrix repository collection.
   */
  fitBounds(systems) {
    if (!systems || systems.length === 0) return;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    systems.forEach(s => {
      if (s.mapX < minX) minX = s.mapX;
      if (s.mapX > maxX) maxX = s.mapX;
      if (s.mapY < minY) minY = s.mapY;
      if (s.mapY > maxY) maxY = s.mapY;
    });

    // Compute explicit center points vectors
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Compute dimensions size properties
    const graphWidth = Math.max(100, maxX - minX);
    const graphHeight = Math.max(100, maxY - minY);

    // Pick appropriate scale factor leaving safe 15% padding margins around borders
    const scaleX = (this.canvas.width * 0.85) / graphWidth;
    const scaleY = (this.canvas.height * 0.85) / graphHeight;
    
    this.zoom = Math.max(this.minZoom, Math.min(scaleX, scaleY, 1.5));
    
    // Center viewport matrix directly over calculated abstract spatial center coordinates
    this.centerOnCoordinates(centerX, centerY);
  }

  /**
   * Locks spatial focus vectors during mousewheel zoom ticks to pin points beneath the cursor.
   * @param {number} deltaY - Raw scrolling layout vector distance multiplier.
   * @param {number} targetX - Hover position anchor coordinate on X-axis.
   * @param {number} targetY - Hover position anchor coordinate on Y-axis.
   */
  applyZoomStep(deltaY, targetX, targetY) {
    const scaleFactor = 1.15;
    const prevZoom = this.zoom;

    // Convert mouse pixels coordinates inversely into spatial world scalar vectors
    const worldX = (targetX - this.panX) / prevZoom;
    const worldY = (targetY - this.panY) / prevZoom;

    if (deltaY < 0) this.zoom *= scaleFactor;
    else this.zoom /= scaleFactor;

    this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));

    // Recalculate camera offsets positioning anchor exactly matching mouse location
    this.panX = Math.round(targetX - worldX * this.zoom);
    this.panY = Math.round(targetY - worldY * this.zoom);
  }

  /**
   * Projects viewport client pixels into inverse abstract coordinate graph points.
   * @param {number} clientX - Absolute cursor pixel placement coordinate on X-axis.
   * @param {number} clientY - Absolute cursor pixel placement coordinate on Y-axis.
   * @param {DOMRect} rect - Canvas layout coordinate bounds information tracking.
   * @returns {Object} Extracted abstract world x/y spatial vector.
   */
  screenToWorld(clientX, clientY, rect) {
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    return {
      x: (mouseX - this.panX) / this.zoom,
      y: (mouseY - this.panY) / this.zoom
    };
  }

  /**
   * Projects abstract scalar coordinates into explicit pixel positions mapped onto the canvas.
   * @param {number} worldX - Spatial map coordinate position on X-axis.
   * @param {number} worldY - Spatial map coordinate position on Y-axis.
   * @returns {Object} Extracted canvas pixel point element tracking.
   */
  worldToScreen(worldX, worldY) {
    return {
      x: Math.round(worldX * this.zoom + this.panX),
      y: Math.round(worldY * this.zoom + this.panY)
    };
  }
}
