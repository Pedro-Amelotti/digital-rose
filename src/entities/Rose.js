import { Petal } from './Petal.js';
import { Stem } from './Stem.js';
import { Leaf } from './Leaf.js';
import { clamp, easeOut, stemX } from '../utils/math.js';

export class Rose {
  constructor(variant = 0, paletteIndex = 0) {
    this.stem = new Stem();
    this.leaves = [0.31, 0.51, 0.69].map((height, index) => {
      const variation = Math.sin(variant * 2.31 + index * 4.7);
      const shape = Math.floor((variation + 1) * 1.49);
      const shade = (shape + index) % 3;
      const side = index % 2 === 0 ? -1 : 1;
      return new Leaf(side, height + variation * 0.025, [57, 66, 48][index] * (1 + variation * 0.16), shape, shade);
    });
    this.petals = [];
    // Anéis sobrepostos constroem a flor proceduralmente, do exterior ao centro.
    const rings = [
      { count: 8, distance: 36, size: 38, color: '#531020', edge: '#a34453' },
      { count: 7, distance: 25, size: 30, color: '#741329', edge: '#bf5865' },
      { count: 6, distance: 15, size: 23, color: '#922037', edge: '#d07b7e' },
      { count: 5, distance: 7, size: 16, color: '#a53143', edge: '#e1aaa0' },
    ];
    const palettes = [
      [['#531020', '#a34453'], ['#741329', '#bf5865'], ['#922037', '#d07b7e'], ['#a53143', '#e1aaa0']],
      [['#420e1d', '#914052'], ['#63152a', '#af5364'], ['#822037', '#c4727d'], ['#9b3045', '#d59a96']],
      [['#59101b', '#a13a47'], ['#801826', '#be5260'], ['#9d2633', '#d27275'], ['#b43d49', '#df9b92']],
    ];
    rings.forEach((ring, index) => {
      for (let i = 0; i < ring.count; i++) {
        const variation = Math.sin(i * 7.17 + index * 3.41 + variant * 2.73);
        this.petals.push(new Petal({
          angle: i * Math.PI * 2 / ring.count + index * 0.48 + variation * 0.09 + variant * 0.15,
          distance: ring.distance * (1 + variation * 0.1),
          size: ring.size * (1 + variation * 0.1),
          color: palettes[paletteIndex][index][0],
          edge: palettes[paletteIndex][index][1],
          variation,
        }));
      }
    });
  }

  draw(ctx, state, { angle, size, offset, tilt = 0, openness = 1, perspective = 1, depth = 1 }, layer) {
    const length = 300;
    ctx.save();
    ctx.translate(offset, 0);
    ctx.rotate(angle);
    ctx.scale(size, size);
    if (layer === 'foliage') {
      this.stem.draw(ctx, length, state.growth);
      this.leaves.forEach((leaf) => leaf.draw(ctx, length, easeOut((state.growth - leaf.height) / 0.2)));
    }
    const bud = easeOut((state.growth - 0.75) / 0.25);
    if (layer === 'flower' && bud > 0) {
      ctx.save();
      ctx.translate(stemX(state.growth, length), -length * state.growth);
      ctx.rotate(tilt);
      ctx.globalAlpha *= depth;
      ctx.scale(bud * 0.78, bud * 0.78 * perspective);
      this.petals.forEach((petal, i) => petal.draw(ctx, clamp(state.bloom * openness * 1.3 - i / this.petals.length * 0.3)));
      ctx.beginPath();
      ctx.arc(0, 0, 2 + state.bloom * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#bc7775';
      ctx.fill();
      // Pontos discretos evocam uma textura de impressão digital.
      ctx.fillStyle = 'rgba(255, 214, 197, .5)';
      const flowerOpenness = clamp(state.bloom * openness);
      for (let i = 0; i < 24; i++) {
        const angle = i * 2.4;
        const radius = Math.sqrt(i) * 5 * flowerOpenness;
        ctx.fillRect(Math.cos(angle) * radius, Math.sin(angle) * radius, 1, 1);
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
