export class CanvasManager {
  constructor(canvas, onResize = () => {}) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('Canvas 2D is not available.');
    this.onResize = onResize;
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  resize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.width = width;
    this.height = height;
    this.onResize();
  }

  dispose() { window.removeEventListener('resize', this.resize); }
}
