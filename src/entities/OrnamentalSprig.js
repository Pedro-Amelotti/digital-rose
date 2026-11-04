import { clamp } from '../utils/math.js';

// Folhas finas cor de vinho e folhas arredondadas acinzentadas, ancoradas à fita.
export class OrnamentalSprig {
  constructor(side, size, angle, kind, variant = 0) {
    Object.assign(this, { side, size, angle, kind, variant });
  }

  draw(ctx, growth) {
    const p = clamp((growth - 0.12) / 0.7);
    if (!p) return;
    ctx.save();
    ctx.rotate(this.angle);
    ctx.scale(this.side * this.size, this.size);
    ctx.strokeStyle = this.kind === 'wine' ? '#89515e' : '#9aaa98';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(80 * p, -80 * p, 160 * p + 15 * p * p, -160 * p - 15 * p * p);
    ctx.stroke();
    for (let i = 1; i <= 6; i++) {
      const variation = Math.sin(this.variant + i * 4.2);
      const t = 0.2 + i * 0.115 + variation * 0.02;
      if (t > p) continue;
      const x = 160 * t + 15 * t * t;
      const y = -160 * t - 15 * t * t;
      const sign = i % 2 ? -1 : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(sign * 0.6 - 0.5 + variation * 0.12);
      const leafScale = 0.82 + (variation + 1) * 0.14;
      ctx.scale(leafScale, leafScale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      if (this.kind === 'wine') {
        ctx.quadraticCurveTo(sign * 14, -18, sign * 9, -48);
        ctx.quadraticCurveTo(-sign * 4, -19, 0, 0);
        ctx.fillStyle = '#59303d';
      } else {
        ctx.bezierCurveTo(sign * 18, -6, sign * 20, -27, sign * 6, -31);
        ctx.bezierCurveTo(-sign * 8, -29, -sign * 10, -10, 0, 0);
        ctx.fillStyle = '#66786b';
      }
      ctx.fill();
      ctx.stroke();
      // Uma nervura discreta separa a folha do grupo ao fundo.
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(sign * (this.kind === 'wine' ? 8 : 5), this.kind === 'wine' ? -37 : -24);
      ctx.strokeStyle = this.kind === 'wine' ? 'rgba(211, 154, 155, .45)' : 'rgba(204, 217, 195, .5)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
