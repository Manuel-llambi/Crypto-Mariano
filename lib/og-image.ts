import { statSync } from "node:fs";
import { resolve, sep } from "node:path";

const PUBLIC_DIR = resolve(process.cwd(), "public");

/**
 * Confirms the social preview image is in the repository, or throws (10.3).
 *
 * This runs while the metadata module is being imported, which happens during
 * `next build`, so a missing image stops the build instead of shipping a link
 * that unfurls as a blank card. It never runs in the browser: `app/layout.tsx`
 * is a server component.
 *
 * The path is checked for escaping `public/` as well. A content file that asks
 * for `/../package.json` would otherwise pass the existence check and point the
 * preview at something that is not an image.
 */
export function resolveOgImage(path: string): string {
  const file = resolve(PUBLIC_DIR, `.${path}`);

  if (file !== PUBLIC_DIR && !file.startsWith(PUBLIC_DIR + sep)) {
    throw new Error(
      `The social preview image must live inside public/: ${path} resolves outside it (10.3).`,
    );
  }

  const stats = statSync(file, { throwIfNoEntry: false });

  if (stats === undefined || !stats.isFile()) {
    throw new Error(
      `The social preview image is missing: expected a file at public${path}. ` +
        "Criterion 10.3 fails the build rather than ship a link that unfurls blank.",
    );
  }

  return path;
}
