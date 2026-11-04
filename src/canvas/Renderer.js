import { asciiColor } from '../utils/color.js';

export class Renderer {
  constructor(canvasManager, bouquet, state, { emphasize = false } = {}) {
    Object.assign(this, { canvasManager, bouquet, state, emphasize });
    this.cells = [];
    this.frameId = null;
    this.source = document.createElement('canvas');
    this.sourceContext = this.source.getContext('2d', { willReadFrequently: true });
    if (!this.sourceContext) throw new Error('Canvas 2D is not available.');
    this.render = this.render.bind(this);
  }

  requestRender() {
    if (this.frameId === null) this.frameId = requestAnimationFrame(this.render);
  }

  render() {
    this.frameId = null;
    const { context, width, height } = this.canvasManager;
    context.clearRect(0, 0, width, height);
    if (!width || !height) return;

    // Amostra a ilustração em uma grade pequena e a reconstrói com caracteres.
    const cellWidth = Math.max(1.8, Math.min(3, width / 210));
    const cellHeight = cellWidth * 1.45;
    const columns = Math.ceil(width / cellWidth);
    const rows = Math.ceil(height / cellHeight);
    if (this.source.width !== columns || this.source.height !== rows) {
      this.source.width = columns;
      this.source.height = rows;
    }
    const source = this.sourceContext;
    source.setTransform(1, 0, 0, 1, 0, 0);
    source.clearRect(0, 0, columns, rows);
    source.setTransform(columns / width, 0, 0, rows / height, 0, 0);
    const baseScale = Math.min(width / 430, height / 690, 1.3);
    // Na página principal, a área já exclui título e controles; encaixa a arte nela.
    const margin = Math.min(24, width * 0.04, height * 0.04);
    const scale = this.emphasize
      ? Math.max(0.01, Math.min((width - 2 * margin) / 500, (height - 2 * margin) / 450, 1.8))
      : baseScale;
    const originY = this.emphasize ? (height - 450 * scale) / 2 + 405 * scale : height * 0.79;
    this.bouquet.draw(source, width, height, this.state, scale, originY);
    const pixels = source.getImageData(0, 0, columns, rows).data;
    const glyphs = ':;*ox#%@';
    this.cells = [];
    this.cellWidth = cellWidth;
    this.cellHeight = cellHeight;
    // A composição ocupa apenas o centro da grade; não varrer as margens vazias.
    const xStart = Math.max(0, Math.floor((width / 2 - 275 * scale) / cellWidth));
    const xEnd = Math.min(columns, Math.ceil((width / 2 + 275 * scale) / cellWidth));
    const yStart = Math.max(0, Math.floor((originY - 430 * scale) / cellHeight));
    const yEnd = Math.min(rows, Math.ceil((originY + 45 * scale) / cellHeight));
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const index = (y * columns + x) * 4;
        const alpha = pixels[index + 3];
        if (alpha < 28) continue;
        const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
        const light = (r * 0.299 + g * 0.587 + b * 0.114) * alpha / 255;
        const glyph = glyphs[Math.min(glyphs.length - 1, Math.floor(light / 120 * glyphs.length))];
        const color = asciiColor(r, g, b, alpha);
        this.cells.push({ x, y, glyph, color });
      }
    }
    this.paint(context);
  }

  // Redesenha os mesmos caracteres em qualquer resolução, sem ampliar pixels.
  paint(context) {
    context.save();
    context.font = `${this.cellHeight}px monospace`;
    context.textBaseline = 'middle';
    for (const cell of this.cells) {
      context.fillStyle = cell.color;
      context.fillText(cell.glyph, cell.x * this.cellWidth, (cell.y + 0.5) * this.cellHeight);
    }
    context.restore();
  }

  getArtBounds() {
    if (!this.cells.length) return null;
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (const { x, y } of this.cells) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    const artWidth = (right - left + 1) * this.cellWidth;
    const artHeight = (bottom - top + 1) * this.cellHeight;
    // A margem inclui espaço para a fonte e preserva um respiro ao redor do desenho.
    const padding = Math.max(24, Math.max(artWidth, artHeight) * 0.08);
    return {
      x: left * this.cellWidth - padding,
      y: top * this.cellHeight - padding,
      width: artWidth + padding * 2,
      height: artHeight + padding * 2,
    };
  }

  toText() {
    if (!this.cells.length) return '';
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (const { x, y } of this.cells) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    const lines = Array.from({ length: bottom - top + 1 }, () => Array(right - left + 1).fill(' '));
    for (const cell of this.cells) lines[cell.y - top][cell.x - left] = cell.glyph;
    return lines.map((line) => line.join('').trimEnd()).join('\n');
  }

  dispose() {
    if (this.frameId !== null) cancelAnimationFrame(this.frameId);
    this.frameId = null;
    this.cells = [];
    this.source.width = 0;
    this.source.height = 0;
  }
}
