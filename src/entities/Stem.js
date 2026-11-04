import { clamp, stemX } from '../utils/math.js';

export class Stem {
  draw(ctx, length, progress) {
    const p = clamp(progress);
    if (!p) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // A curva cresce da base em direção à flor.
    for (let i = 1; i <= 40 * p; i++) {
      const t = i / 40;
      ctx.lineTo(stemX(t, length), -length * t);
    }
    ctx.lineTo(stemX(p, length), -length * p);
    ctx.strokeStyle = '#526b4e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}
