import { clamp } from '../utils/math.js';

export class Petal {
  constructor({ angle, distance, size, color, edge, variation }) {
    Object.assign(this, { angle, distance, size, color, edge, variation });
  }

  draw(ctx, bloom) {
    const p = clamp(bloom);
    const spread = 0.22 + p * 0.78;
    const v = this.variation;
    ctx.save();
    // A abertura altera o tamanho e a distância, preservando o anel completo.
    ctx.rotate(this.angle);
    ctx.translate(0, -this.distance * spread);
    ctx.rotate(v * 0.12);
    ctx.scale((0.48 + p * 0.52) * (1 + v * 0.12), 0.55 + p * 0.45);
    const s = this.size;
    const gradient = ctx.createLinearGradient(0, -s, 0, s * 0.5);
    gradient.addColorStop(0, this.edge);
    gradient.addColorStop(0.36, this.color);
    gradient.addColorStop(1, '#250915');
    ctx.beginPath();
    ctx.moveTo(0, s * 0.58);
    ctx.bezierCurveTo(-s * (0.82 + v * 0.1), s * 0.17, -s * 0.94, -s * 0.58, -s * (0.25 + v * 0.08), -s * 0.95);
    ctx.bezierCurveTo(-s * 0.12, -s * 1.05, s * 0.02, -s * (0.93 + v * 0.08), s * 0.16, -s);
    ctx.bezierCurveTo(s * 0.8, -s * 0.91, s * (0.94 - v * 0.08), -s * 0.2, 0, s * 0.58);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(238, 158, 158, .48)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // Dobras e nervuras acompanham o contorno assimétrico da pétala.
    ctx.strokeStyle = 'rgba(255, 194, 181, .30)';
    ctx.lineWidth = 0.6;
    for (const bend of [-0.38, -0.16, 0.12, 0.32]) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.38);
      ctx.quadraticCurveTo(s * bend * 0.4, -s * 0.05, s * (bend + v * 0.04), -s * 0.72);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(-s * 0.57, -s * 0.55);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.79, s * 0.18, -s * 0.86);
    ctx.strokeStyle = 'rgba(255, 198, 185, .26)';
    ctx.stroke();
    ctx.restore();
  }
}
