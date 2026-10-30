/**
 * Permanent (301) redirects for URLs that moved or never existed but were
 * crawled (GSC "Not found (404)" report, 2026-10-29). Applied by
 * server/middleware/00-seo-redirects.ts in a single hop: host (apex -> www),
 * trailing slash and path mapping are all resolved into one Location.
 * Keep targets canonical (no trailing slash) and never point at another source.
 */
export const REDIRECTS: Record<string, string> = {
  // Day 4 rewrites of a05 and a08 (new slugs match the target queries).
  "/articles/the-real-2026-price-of-a-new-roof-in-los-angeles": "/articles/roof-replacement-cost-los-angeles",
  "/articles/those-pretty-tiles-are-quietly-failing": "/articles/why-is-my-tile-roof-leaking",
  // Old site URLs (GSC 404 report 2026-10-29).
  "/contact-us": "/contact",
  "/commercial": "/commercial-roofing-glendale-ca",
  "/residential": "/residential-roofing-glendale-ca",
  "/roofing-process": "/installation-process",
  "/blog/f/how-roof-material-choices-impact-energy-bills": "/articles/la-will-pay-you-to-make-your-roof-whiter",
  "/blog/f/the-citium-roofing-difference-your-guide-to-a-lasting-roof": "/about",
  "/blog/f/the-roof-over-your-head-a-game-changer-for-home-resale-value": "/articles",
  "/blog": "/articles",
  "/&": "/",
  "/$slug": "/",
};

/** Prefixes whose unknown children go to one hub (old Wix blog). */
export const PREFIX_REDIRECTS: Array<[string, string]> = [["/blog/f/", "/articles"]];
