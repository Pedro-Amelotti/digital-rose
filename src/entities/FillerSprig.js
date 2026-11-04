import { clamp } from '../utils/math.js';

// Ramos finos com pequenas flores claras, inspirados em mosquitinho.
export class FillerSprig {
  constructor(side, seed, size = 1, angle = 0) {
    this.side = side;
    this.seed = seed;
    this.size = size;
    this.angle = angle;
  }

  draw(ctx, growth, bloom) {
    const p = clamp((growth - 0.18) / 0.65);
    if (!p) return;
    ctx.save();
    ctx.rotate(this.angle);
    ctx.scale(this.side * this.size, this.size);
    ctx.strokeStyle = '#82917a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(90 * p, -120 * p, 180 * p - 5 * p * p, -240 * p - 20 * p * p);
    ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const variation = Math.sin(i * 4.3 + this.seed);
      const t = 0.34 + i * 0.09 + variation * 0.025;
      if (t > p) continue;
      const x = 180 * t - 5 * t * t, y = -240 * t - 20 * t * t;
      const branch = 18 + 5 * Math.sin(i * 7 + this.seed);
      const direction = i % 2 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 8, y - 8, x + direction * branch, y - 20);
      ctx.stroke();
      ctx.fillStyle = '#d9c4b7';
      const radius = (1.4 + clamp(bloom) * 1.1) * (0.75 + 0.25 * (variation + 1));
      ctx.beginPath();
      ctx.arc(x + direction * branch, y - 20, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + direction * branch + 5, y - 25, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
