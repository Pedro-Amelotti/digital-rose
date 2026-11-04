export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
export const easeOut = (value) => 1 - (1 - clamp(value)) ** 3;

// Curva compartilhada por caule, folhas e botão para manter as conexões.
export const stemX = (t, length) => length * (0.13 * Math.sin(Math.PI * t) + 0.045 * Math.sin(2 * Math.PI * t));
