import { clamp, stemX } from '../utils/math.js';

export class Leaf {
  constructor(side, height, size, shape = 0, shade = 0) {
    Object.assign(this, { side, height, size, shape, shade });
  }

  draw(ctx, length, progress) {
    const p = clamp(progress);
    if (!p) return;
    const x = stemX(this.height, length);
    const y = -length * this.height;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(this.side * p, p);
    const s = this.size;
    const fullness = [0.28, 0.4, 0.55][this.shape];
    const tip = [0.72, 0.6, 0.48][this.shape];
    const fills = ['#344c3b', '#405447', '#3b4840'];
    const edges = ['#98a789', '#a5af92', '#a3ad9a'];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(s * 0.25, -s * fullness, s * 0.72, -s * (tip - 0.05), s, -s * tip);
    ctx.bezierCurveTo(s * 0.78, -s * (tip - 0.48), s * 0.35, s * 0.16, 0, 0);
    ctx.fillStyle = fills[this.shade];
    ctx.fill();
    ctx.strokeStyle = edges[this.shade];
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.45, -s * 0.22, s * 0.9, -s * (tip - 0.04));
    ctx.strokeStyle = 'rgba(205, 214, 182, .60)';
    ctx.stroke();
    ctx.restore();
  }
}
