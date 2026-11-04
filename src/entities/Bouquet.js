import { Rose } from './Rose.js';
import { AccentFlower } from './AccentFlower.js';
import { FillerSprig } from './FillerSprig.js';
import { OrnamentalSprig } from './OrnamentalSprig.js';
import { flowerCenter, placeAccentFlowers } from './flowerPlacement.js';
import { clamp } from '../utils/math.js';

export class Bouquet {
  constructor(randomSource = Math.random) {
    const random = (min, max) => min + randomSource() * (max - min);
    const pick = (items) => items[Math.floor(randomSource() * items.length)];
    const shuffle = (items) => {
      const result = [...items];
      for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(randomSource() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    };
    const seed = random(0, 1000);
    this.ribbon = { width: random(12, 15), leftTail: random(27, 36), rightTail: random(24, 36), spread: random(15, 21) };
    // Perfis preservam a base reunida e alteram a silhueta do arranjo.
    this.profile = pick(['rounded', 'upright', 'leaning']);
    const sweep = this.profile === 'leaning' ? pick([-1, 1]) * random(0.09, 0.14) : random(-0.045, 0.045);
    const spread = this.profile === 'rounded' ? random(1.04, 1.10) : this.profile === 'upright' ? random(0.80, 0.9) : random(0.90, 0.98);
    // Rosas sempre predominam em quantidade e em escala sobre as flores de apoio.
    const roseCount = Math.floor(random(5, 9));
    // Posições em alturas diferentes criam arranjos abertos e assimétricos.
    const slots = [
      { angle: -0.56, size: 0.78 }, { angle: 0.56, size: 0.78 },
      { angle: -0.30, size: 0.98 }, { angle: 0.30, size: 0.98 },
      { angle: -0.40, size: 0.68 }, { angle: 0.40, size: 0.68 },
      { angle: -0.10, size: 0.76 }, { angle: 0.10, size: 0.76 },
    ];
    // Prefere rosas próximas, como em um buquê de mão, sem reunir seus centros.
    const options = [];
    for (let attempt = 0; attempt < 24; attempt++) {
      const chosen = shuffle(slots).slice(0, roseCount - 1);
      chosen.sort((a, b) => a.size - b.size);
      chosen.push({ angle: random(-0.09, 0.09), size: random(1.0, 1.07) });
      const flowers = chosen.map((flower, index) => ({
        angle: flower.angle * spread + sweep + random(-0.055, 0.055),
        size: flower.size * random(0.88, 1.06),
        offset: random(-7, 7),
        delay: random(0, 0.24),
        tilt: random(-0.52, 0.52),
        openness: index === chosen.length - 1 ? 1 : (randomSource() < 0.28 ? random(0.43, 0.68) : random(0.78, 1)),
        perspective: random(0.70, 1),
        depth: index === chosen.length - 1 ? 1 : random(0.86, 1),
        palette: Math.floor(random(0, 3)),
      }));
      let penalty = 0;
      const nearest = Array(flowers.length).fill(Infinity);
      for (let i = 0; i < flowers.length; i++) {
        for (let j = 0; j < i; j++) {
          const a = flowers[i], b = flowers[j];
          const p = flowerCenter(a), q = flowerCenter(b);
          const ratio = Math.hypot(p.x - q.x, p.y - q.y) / (57 * (a.size + b.size));
          nearest[i] = Math.min(nearest[i], ratio);
          nearest[j] = Math.min(nearest[j], ratio);
          // Permite que as pétalas se toquem, evitando centros quase coincidentes.
          penalty += 2 * Math.max(0, 0.58 - ratio) ** 2;
        }
      }
      // Desfavorece flores muito isoladas sem impor simetria ao arranjo.
      penalty += nearest.reduce((sum, distance) => sum + 0.2 * Math.max(0, distance - 0.95) ** 2, 0);
      options.push({ flowers, penalty });
    }
    options.sort((a, b) => a.penalty - b.penalty);
    const chosen = options[Math.floor(randomSource() * 3)].flowers;
    this.flowers = chosen.map((flower, index) => ({
      ...flower,
      rose: new Rose(index + seed, flower.palette),
    }));
    const accentCount = Math.floor(random(1, 4));
    const accentSlots = placeAccentFlowers(this.flowers, accentCount, randomSource);
    const firstAccentInFront = randomSource() < 0.5;
    this.accents = accentSlots.map((placement, index) => ({
      ...placement,
      delay: random(0.06, 0.24),
      inFront: index % 2 === 0 ? firstAccentInFront : !firstAccentInFront,
      rose: new AccentFlower(seed + index),
    }));
    const sides = shuffle([-1, 1]);
    const sprigCount = pick([1, 2, 2, 3]);
    this.sprigs = Array.from({ length: sprigCount }, (_, i) => new FillerSprig(
      sides[i % 2], seed + i * 4, random(0.7, 1.05), random(-0.20, 0.20),
    ));
    this.ornamentals = [
      new OrnamentalSprig(sides[0], random(0.82, 1.05), random(-0.16, 0.10), 'wine', seed),
      new OrnamentalSprig(sides[1], random(0.72, 0.98), random(-0.10, 0.16), 'silver', seed + 5),
    ];
  }

  draw(ctx, width, height, state, scale = Math.min(width / 430, height / 690, 1.3), originY = height * 0.79) {
    ctx.save();
    ctx.translate(width / 2, originY);
    ctx.scale(scale, scale);
    // Folhagem atrás das flores evita caules cruzando as pétalas em primeiro plano.
    this.ornamentals.forEach((sprig) => sprig.draw(ctx, state.growth));
    this.sprigs.forEach((sprig) => sprig.draw(ctx, state.growth, state.bloom));
    const behind = this.accents.filter((flower) => !flower.inFront);
    const inFront = this.accents.filter((flower) => flower.inFront);
    const drawFlowers = (flowers, layer) => {
      flowers.forEach((flower) => {
        const local = {
          growth: clamp((state.growth - flower.delay * 0.55) / (1 - flower.delay * 0.55)),
          bloom: clamp((state.bloom - flower.delay) / (1 - flower.delay)),
        };
        flower.rose.draw(ctx, local, flower, layer);
      });
    };
    drawFlowers([...this.accents, ...this.flowers], 'foliage');
    drawFlowers(behind, 'flower');
    drawFlowers(this.flowers, 'flower');
    drawFlowers(inFront, 'flower');
    // A fita reúne os caules, mas só aparece depois que começam a crescer.
    if (state.growth > 0.15) {
      ctx.globalAlpha = clamp((state.growth - 0.15) / 0.3);
      const { width, leftTail, rightTail, spread } = this.ribbon;
      ctx.fillStyle = '#632532';
      ctx.strokeStyle = '#c08a8d';
      ctx.lineWidth = 1;
      // Fita enrolada em torno da origem dos caules.
      ctx.beginPath();
      ctx.moveTo(-width, -7);
      ctx.quadraticCurveTo(0, -4, width, -8);
      ctx.lineTo(width, 5);
      ctx.quadraticCurveTo(0, 9, -width, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Pontas com caimento levemente diferente.
      ctx.fillStyle = '#51202c';
      ctx.beginPath();
      ctx.moveTo(-5, 5);
      ctx.quadraticCurveTo(-spread * 0.55, leftTail * 0.6, -spread, leftTail);
      ctx.lineTo(-spread + 8, leftTail - 4);
      ctx.quadraticCurveTo(0, leftTail * 0.5, 3, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, 5);
      ctx.quadraticCurveTo(spread * 0.5, rightTail * 0.55, spread, rightTail);
      ctx.lineTo(spread - 8, rightTail - 3);
      ctx.quadraticCurveTo(0, rightTail * 0.55, -2, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Um pequeno nó ilumina a união da fita.
      ctx.fillStyle = '#8c4953';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}
