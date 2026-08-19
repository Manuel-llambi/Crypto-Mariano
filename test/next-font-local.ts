/**
 * Stand-in for `next/font/local` under Vitest.
 *
 * `localFont()` is not an ordinary function call. Next rewrites it during the
 * build: its SWC plugin reads the font files named in `src`, measures them,
 * emits the `@font-face` rules plus the metric-adjusted fallback, and replaces
 * the call with the resulting object. Vitest shares Vite's resolution with the
 * app but none of that pipeline, so the real module resolves to something that
 * is not callable and every test importing `app/layout.tsx` dies on import.
 *
 * Mocking it per file would mean repeating the same block in each test that
 * ever reaches the layout, so `vitest.config.ts` aliases the module here once.
 *
 * The shape is the contract the layout uses and nothing more. Nothing about the
 * real loader's output is asserted through this stub — that would only be
 * testing the stub. `app/fonts.test.ts` reads the layout source instead, which
 * is what keeps the declarations honest.
 */
type LocalFontOptions = {
  variable?: string;
  src: unknown;
};

type LocalFontResult = {
  className: string;
  variable: string;
  style: { fontFamily: string };
};

export default function localFont(options: LocalFontOptions): LocalFontResult {
  // The real `variable` is a class name that sets the custom property, not the
  // property itself. Deriving it from the requested name keeps the two apart
  // while still making the value recognisable when a test prints it.
  const name = options.variable ?? "--font-stub";
  return {
    className: `stub${name}`,
    variable: `stub${name}`,
    style: { fontFamily: name },
  };
}
