import { Stem } from './Stem.js';
import { clamp, easeOut, stemX } from '../utils/math.js';

// Flor de preenchimento inspirada na escabiosa, com pequenas pétalas e centro texturizado.
export class AccentFlower {
  constructor(variant) {
    this.stem = new Stem();
    this.variant = variant;
  }

  draw(ctx, state, { angle, size, offset }, layer) {
    const length = 300;
    ctx.save();
    ctx.translate(offset, 0);
    ctx.rotate(angle);
    ctx.scale(size, size);
    if (layer === 'foliage') this.stem.draw(ctx, length, state.growth);
    const bud = easeOut((state.growth - 0.78) / 0.22);
    if (layer === 'flower' && bud > 0) {
      ctx.translate(stemX(state.growth, length), -length * state.growth);
      const open = easeOut(state.bloom);
      ctx.scale(bud * (0.3 + 0.7 * open), bud * (0.3 + 0.7 * open));
      const petals = 12;
      for (let i = 0; i < petals; i++) {
        const a = i * Math.PI * 2 / petals + this.variant;
        ctx.save();
        ctx.rotate(a);
        ctx.beginPath();
        ctx.ellipse(0, -15, 6.5, 15 + Math.sin(i * 3 + this.variant) * 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 ? '#8c4963' : '#bd8191';
        ctx.fill();
        ctx.strokeStyle = '#dcafb1';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#321926';
      ctx.fill();
      ctx.fillStyle = '#e0b4a8';
      for (let i = 0; i < 15; i++) {
        const a = i * 2.4, r = Math.sqrt(i) * 1.7;
        ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 1.4, 1.4);
      }
    }
    ctx.restore();
  }
}
