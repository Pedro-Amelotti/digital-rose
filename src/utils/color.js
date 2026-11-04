// Mantém o brilho do ASCII e preserva o vermelho das pétalas contra o fundo escuro.
export function asciiColor(r, g, b, alpha) {
  const roseTone = r > 25 && r > g * 1.2 && r > b * 1.05;
  const red = Math.min(255, r + (roseTone ? 105 : 95));
  const green = Math.min(255, g + (roseTone ? 58 : 80));
  const blue = Math.min(255, b + (roseTone ? 60 : 75));
  return `rgba(${red}, ${green}, ${blue}, ${Math.max(0.55, alpha / 255)})`;
}
