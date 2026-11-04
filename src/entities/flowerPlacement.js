// Posições aproximadas no auge da floração, no espaço local do buquê.
export function flowerCenter(flower) {
  return {
    x: flower.offset + 300 * flower.size * Math.sin(flower.angle),
    y: -300 * flower.size * Math.cos(flower.angle),
  };
}

export function placeAccentFlowers(roses, count, randomSource = Math.random) {
  const random = (min, max) => min + randomSource() * (max - min);
  const placed = [];
  const rosesWithCenters = roses.map((rose) => ({ ...flowerCenter(rose), radius: 57 * rose.size }));
  const left = Math.min(...rosesWithCenters.map((rose) => rose.x));
  const right = Math.max(...rosesWithCenters.map((rose) => rose.x));
  for (let index = 0; index < count; index++) {
    const candidates = [];
    // Amostras diversas permitem escolher lacunas sem congelar o desenho em slots.
    for (let attempt = 0; attempt < 300; attempt++) {
      const flower = { angle: random(-0.78, 0.78), size: random(0.50, 0.82), offset: random(-7, 7) };
      const center = flowerCenter(flower);
      const radius = 31 * flower.size;
      const ratios = rosesWithCenters.map((rose) =>
        Math.hypot(center.x - rose.x, center.y - rose.y) / (radius + rose.radius));
      const nearest = Math.min(...ratios);
      const separated = placed.every((other) => {
        const point = flowerCenter(other);
        return Math.hypot(center.x - point.x, center.y - point.y) >= 0.9 * (radius + 31 * other.size);
      });
      // Alguma interseção de bordas é possível, mas não no centro da outra flor.
      if (nearest < 0.88 || !separated) continue;
      const gapScore = Math.abs(nearest - 1.12);
      const exteriorPenalty = Math.max(0, Math.abs(center.x) - 165) / 180;
      const inside = center.x > left + 8 && center.x < right - 8;
      candidates.push({ flower, score: gapScore + exteriorPenalty, inside });
    }
    const interior = candidates.filter((candidate) => candidate.inside);
    // Normalmente buscamos o interior; às vezes escolhemos livremente.
    const pool = interior.length && randomSource() < 0.8 ? interior : candidates;
    pool.sort((a, b) => a.score - b.score);
    if (pool.length) {
      // Sorteio entre boas alternativas mantém sobreposições leves e diversidade.
      const poolSize = Math.min(16, pool.length);
      placed.push(pool[Math.floor(randomSource() * poolSize)].flower);
    }
  }
  return placed;
}
