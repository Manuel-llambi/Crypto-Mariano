const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Splits `#rgb` or `#rrggbb` into its three 0-255 channels. */
function channels(hex: string): [number, number, number] {
  if (!HEX.test(hex)) {
    throw new Error(`Not a hex colour: ${JSON.stringify(hex)}`);
  }

  const digits =
    hex.length === 4
      ? hex
          .slice(1)
          .split("")
          .map((digit) => digit + digit)
          .join("")
      : hex.slice(1);

  const value = Number.parseInt(digits, 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

/** WCAG relative luminance: sRGB channels linearised, then weighted. */
function relativeLuminance(hex: string): number {
  const [red, green, blue] = channels(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * The WCAG contrast ratio of two colours, from 1:1 to 21:1 (9.4).
 *
 * The order of the pair does not matter: the lighter colour always ends up on
 * top of the fraction.
 */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (first, second) => second - first,
  ) as [number, number];

  return (lighter + 0.05) / (darker + 0.05);
}
