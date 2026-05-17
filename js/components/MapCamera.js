// @ts-nocheck
// Manages map viewport camera transformations, cursor-relative scaling, and bounding box fits
export class MapCamera {
  constructor(canvas) {
    this.canvas = canvas;
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    
    // Tight security boundaries parameters protecting matrix math configurations
    this.minZoom = 0.05; // Lowered to guarantee the entire galaxy fits screen loops
    this.maxZoom = 4.0;
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  centerOnCoordinates(worldX, worldY) {
    this.panX = Math.round(this.canvas.width / 2 - worldX * this.zoom);
    this.panY = Math.round(this.canvas.height / 2 - worldY * this.zoom);
  }

  // FIXED: Advanced automatic structural bounds fitting to adapt entire galaxy inside viewport
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

  // FIXED: True mouse-relative zoom tracking locking coordinate point beneath active cursor
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

  screenToWorld(clientX, clientY, rect) {
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    return {
      x: (mouseX - this.panX) / this.zoom,
      y: (mouseY - this.panY) / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: Math.round(worldX * this.zoom + this.panX),
      y: Math.round(worldY * this.zoom + this.panY)
    };
  }
}
