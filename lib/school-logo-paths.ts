/**
 * Local paths under /public for school logos (one-time imports).
 * Run `pnpm fetch:moe-logos` to populate `school-logo-manifest.json` and image files.
 */
import manifest from './school-logo-manifest.json';

/** Manual entries override manifest (e.g. before a full fetch completes). */
const SLUG_TO_LOGO_OVERRIDES: Record<string, string> = {};

type Manifest = Record<string, string>;
const M = manifest as Manifest;

export function schoolLogoPathForSlug(slug: string): string | undefined {
  return SLUG_TO_LOGO_OVERRIDES[slug] ?? M[slug];
}
