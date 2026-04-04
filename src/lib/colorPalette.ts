/**
 * Generate a full color palette (50-900) from a single hex color.
 * The input color is treated as the 400 shade.
 */

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Target lightness values modeled after Tailwind's default sky palette
const SHADE_LIGHTNESS: Record<string, number> = {
  '50': 97,
  '100': 94,
  '200': 86,
  '300': 74,
  '400': 60,
  '500': 49,
  '600': 39,
  '700': 33,
  '800': 28,
  '900': 24,
};

export function generatePalette(baseHex: string): Record<string, string> {
  const { h, s } = hexToHSL(baseHex);

  const palette: Record<string, string> = {};
  for (const [shade, targetL] of Object.entries(SHADE_LIGHTNESS)) {
    // Reduce saturation for lighter shades, increase for darker
    const satFactor =
      targetL > 70 ? 0.3 + (1 - targetL / 100) * 1.4 : 0.85 + ((50 - targetL) / 50) * 0.15;
    const adjustedS = Math.min(100, s * Math.max(0.3, satFactor));
    palette[shade] = hslToHex(h, adjustedS, targetL);
  }
  return palette;
}

/**
 * Generate CSS custom property declarations for a palette.
 * Returns a string like: --azure-50: #f0f9ff; --azure-100: ...;
 */
export function paletteToCSS(baseHex: string): string {
  const palette = generatePalette(baseHex);
  return Object.entries(palette)
    .map(([shade, hex]) => `--azure-${shade}: ${hex};`)
    .join('\n  ');
}
