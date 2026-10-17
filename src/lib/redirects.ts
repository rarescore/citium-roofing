/**
 * Permanent (308) redirects for URLs that moved. Applied by
 * server/middleware/seo.ts in a single hop (a trailing-slash variant of an
 * old URL goes straight to the final target, never through a chain).
 * Keep targets canonical (no trailing slash) and never point at another source.
 */
export const REDIRECTS: Record<string, string> = {
  // Day 4 rewrites of a05 and a08 (new slugs match the target queries).
  "/articles/the-real-2026-price-of-a-new-roof-in-los-angeles": "/articles/roof-replacement-cost-los-angeles",
  "/articles/those-pretty-tiles-are-quietly-failing": "/articles/why-is-my-tile-roof-leaking",
};
