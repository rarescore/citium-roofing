/**
 * THE ROUTE LIST. One entry per public URL (except articles, which are read
 * from src/lib/articles-data.ts automatically).
 *
 * This list drives:
 *   - <title>, meta description, canonical, OG/Twitter tags (src/lib/site.ts pageHead)
 *   - the visible H1 on each page
 *   - breadcrumb labels + BreadcrumbList JSON-LD
 *   - /sitemap.xml (src/routes/sitemap[.]xml.ts): every entry with index !== false
 *
 * HOW TO ADD A PAGE
 *   1. Add an entry below (path, title 50-60 chars, description 140-160 chars, h1).
 *   2. Build the page: either a branch in src/components/inner-pages.tsx
 *      (single-segment URLs served by src/routes/$slug.tsx), or an explicit
 *      file route in src/routes/ (e.g. src/routes/service-areas.$city.tsx),
 *      reading its head from `seoPage(path)` + `pageHead(...)`.
 *   3. That's it: the sitemap picks it up automatically. Link it from the
 *      header/footer (src/components/site-chrome.tsx) so it is within 2-3 clicks.
 *   Set index: false for utility or unverified pages (they get noindex,follow
 *   and are left out of the sitemap).
 */
import { packedArticles as articles } from "@/lib/articles-data";

export type SeoPage = {
  path: string;
  /** Full <title>. */
  title: string;
  description: string;
  /** Visible keyword H1. Omit to keep the page's original H1 unchanged. */
  h1?: string;
  /** Short breadcrumb/nav label. */
  label: string;
  /** Parent path for breadcrumbs (defaults to "/"). */
  parent?: string;
  index?: boolean;
  priority?: number;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  /** Last meaningful content change (YYYY-MM-DD). */
  updated: string;
};

const U = "2026-09-28";

export const seoPages: SeoPage[] = [
  {
    path: "/",
    // Brand + broad positioning. The exact "roofing contractor in Glendale"
    // query belongs to /roofing-contractor-glendale-ca (the hub).
    title: "Citium Roofing | Roofing Company in Glendale & Nearby Cities",
    description:
      "Citium Roofing Solutions is a Glendale roofing company for roof repair, replacement and new roofs in Burbank, Pasadena and nearby cities. Get a free estimate.",
    h1: "Roof Repair & Replacement in Glendale and Nearby Cities",
    label: "Home",
    priority: 1,
    changefreq: "weekly",
    updated: U,
  },
  {
    path: "/roofing-systems",
    title: "Roofing Systems: Shingle, Tile, TPO & Flat | Citium Roofing",
    description:
      "Compare shingle, tile, TPO and modified bitumen roofing systems for Glendale, Burbank and Pasadena homes. See how each one is built, then request an estimate.",
    h1: "Roofing Systems for Glendale & Los Angeles Properties",
    label: "Roofing Systems",
    priority: 0.9,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/shingles",
    title: "Shingle Roof Installation in Glendale, CA | Citium Roofing",
    description:
      "Architectural shingle roof installation and replacement for Glendale, Burbank and Pasadena homes. Compare shingle colors and SRI, then request an estimate.",
    h1: "Shingle Roof Installation & Replacement in Glendale",
    label: "Shingle Roofing",
    parent: "/roofing-systems",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/tile",
    title: "Tile Roofing in Glendale, CA: Clay & Concrete | Citium",
    description:
      "Clay and concrete tile roofing in Glendale: Mission clay, clay S-tile and concrete S-tile, with underlayment and flashing done right. Request an estimate today.",
    h1: "Tile Roofing in Glendale: Clay & Concrete Tile",
    label: "Tile Roofing",
    parent: "/roofing-systems",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/tpo",
    title: "TPO Flat Roofing in Glendale, CA | Citium Roofing Solutions",
    description:
      "60-mil TPO membrane roofing for low-slope and flat roofs in Glendale and nearby cities. Heat-welded seams, drainage and edge details explained. Get an estimate.",
    h1: "TPO Flat Roofing in Glendale",
    label: "TPO Roofing",
    parent: "/roofing-systems",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/modified-bitumen",
    title: "Torch-Down Roofing in Glendale, CA | Citium Roofing",
    description:
      "Modified bitumen and torch-down flat roofing in Glendale: base, ply and mineral cap sheet assemblies for low-slope roofs. Request an estimate from Citium.",
    h1: "Modified Bitumen & Torch-Down Roofing in Glendale",
    label: "Modified Bitumen",
    parent: "/roofing-systems",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/installation-process",
    title: "How a Roof Installation Works, Step by Step | Citium Roofing",
    description:
      "How a Citium roof installation project runs, step by step: an assessment, a written scope, preparation, building the roof system and a final walkthrough.",
    h1: "Our Roof Installation Process, Step by Step",
    label: "Installation Process",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    // Demo visualizations (not verified Citium jobs): noindex until the owner confirms real projects.
    path: "/projects",
    title: "Roof Design Examples Near Glendale, CA | Citium Roofing",
    description:
      "Illustrative before-and-after roof visualizations for shingle, tile, TPO and torch-down systems on Glendale-area homes. Compare looks, then request an estimate.",
    h1: "Roof Design Examples for Glendale-Area Homes",
    label: "Design Examples",
    index: false,
    updated: U,
  },
  {
    // Interactive tool that duplicates the homepage studio: noindex (kept for UX).
    path: "/design-your-roof",
    title: "Design Your Roof: Shingle, Tile & TPO Visualizer | Citium",
    description:
      "Preview shingle, tile, TPO and torch-down roof colors on a house, then send your design to Citium Roofing Solutions in Glendale to request an estimate.",
    h1: "Design Your Roof: Shingle, Tile & TPO Visualizer",
    label: "Design Your Roof",
    index: false,
    updated: U,
  },
  {
    path: "/about",
    title: "About Citium Roofing | Glendale, CA Roofing Company",
    description:
      "Citium Roofing Solutions is based at 401 N Brand Blvd in Glendale, CA, providing roof repair, replacement and installation for Glendale, Burbank and Pasadena.",
    h1: "About Citium Roofing Solutions, Based in Glendale",
    label: "About",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/articles",
    title: "Roofing Guides for Glendale & Los Angeles | Citium Roofing",
    description:
      "Practical roofing guides for Glendale and Los Angeles homeowners: replacement cost, cool roofs, tile repair, Santa Ana wind damage and contractor red flags.",
    h1: "Roofing Guides for Glendale & Los Angeles Homeowners",
    label: "Resources",
    priority: 0.7,
    changefreq: "weekly",
    updated: U,
  },
  {
    path: "/faq",
    title: "Roofing FAQ: Glendale & Los Angeles | Citium Roofing",
    description:
      "Answers to common roofing questions in Glendale and Los Angeles: repair vs. replace, cool roofs, permits, tile, TPO, service areas and how estimates work.",
    h1: "Roofing FAQ for Glendale & Los Angeles Homeowners",
    label: "FAQ",
    priority: 0.6,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/contact",
    title: "Contact Citium Roofing | Glendale, CA | 818-531-1277",
    description:
      "Contact Citium Roofing Solutions at 401 N Brand Blvd, Unit L106B, Glendale, CA 91203. Call 818-531-1277 or email us about roof repair and roof replacement.",
    h1: "Contact Citium Roofing in Glendale, CA",
    label: "Contact",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/estimate",
    title: "Roof Estimate in Glendale, CA | Citium Roofing Solutions",
    description:
      "Request a roof estimate in Glendale, Burbank, Pasadena and nearby cities. Share your address and Citium confirms measurements, condition and pricing on site.",
    h1: "Request a Roof Estimate in Glendale, CA",
    label: "Request an Estimate",
    priority: 0.9,
    changefreq: "monthly",
    updated: U,
  },
  {
    // Near-duplicate of /contact for existing customers.
    path: "/customer-service",
    title: "Roofing Customer Service | Citium Roofing Solutions",
    description:
      "Existing Citium customer? Contact us about a repair, an active project or roof maintenance. Call 818-531-1277 or send your request online at any time.",
    h1: "Customer Service for Citium Roofing Clients",
    label: "Customer Service",
    index: false,
    updated: U,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Citium Roofing Solutions, Glendale CA",
    description:
      "How Citium Roofing Solutions in Glendale, CA collects, uses and protects the contact details you share through the estimate, contact and service forms.",
    h1: "Privacy Policy",
    label: "Privacy",
    index: false,
    updated: U,
  },
  {
    path: "/terms",
    title: "Terms of Use | Citium Roofing Solutions, Glendale CA",
    description:
      "Terms for using the Citium Roofing Solutions website, including how estimates, articles and cost ranges relate to written project scopes and contracts.",
    h1: "Terms of Use",
    label: "Terms",
    index: false,
    updated: U,
  },
  // ---- Batch 2: Glendale service pages (content from the Day 2 drafts). ----
  {
    path: "/roofing-contractor-glendale-ca",
    title: "Roofing Contractor in Glendale, CA | Citium Roofing",
    description:
      "Citium Roofing Solutions is a Glendale roofing contractor for roof repair, replacement, new installs and inspections. Call 818-531-1277 for a free estimate.",
    h1: "Roofing Contractor in Glendale, CA",
    label: "Glendale Roofing Contractor",
    priority: 0.9,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/roof-repair-glendale-ca",
    title: "Roof Repair in Glendale, CA | Citium Roofing Solutions",
    description:
      "Roof repair in Glendale, CA for leaks, failed flashing, wind damage and worn shingles. Citium traces the leak to its source. Call 818-531-1277 today.",
    h1: "Roof Repair in Glendale, CA",
    label: "Roof Repair",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/roof-replacement-glendale-ca",
    title: "Roof Replacement in Glendale, CA | Citium Roofing Solutions",
    description:
      "Planning a roof replacement in Glendale, CA? Citium covers tear-off, decking, underlayment, flashing and the permit in one written scope. Free estimate.",
    h1: "Roof Replacement in Glendale, CA",
    label: "Roof Replacement",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/roof-installation-glendale-ca",
    title: "New Roof Installation in Glendale, CA | Citium Roofing",
    description:
      "New roof installation in Glendale, CA for ADUs, additions and new homes. Citium installs shingle, tile, TPO and torch-down roofs. Call 818-531-1277.",
    h1: "New Roof Installation in Glendale, CA",
    label: "New Roof Installation",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/residential-roofing-glendale-ca",
    title: "Residential Roofing in Glendale, CA | Citium Roofing",
    description:
      "Residential roofing in Glendale, CA: shingle, tile and low-slope systems matched to your home, plus repair, replacement and inspections. Free estimate.",
    h1: "Residential Roofing in Glendale, CA",
    label: "Residential Roofing",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/roof-inspection-glendale-ca",
    title: "Roof Inspection in Glendale, CA | Citium Roofing Solutions",
    description:
      "Roof inspection in Glendale, CA before you buy or sell, after Santa Ana winds, or on an aging roof, with plain findings on what needs work. Call 818-531-1277.",
    h1: "Roof Inspection in Glendale, CA",
    label: "Roof Inspection",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/tile-roof-repair-glendale-ca",
    title: "Tile Roof Repair in Glendale, CA | Citium Roofing Solutions",
    description:
      "Tile roof repair in Glendale, CA for cracked or slipped clay and concrete tiles, underlayment leaks and flashing. Citium checks under the tile. Free estimate.",
    h1: "Tile Roof Repair in Glendale, CA",
    label: "Tile Roof Repair",
    parent: "/roof-repair-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/flat-roof-repair-glendale-ca",
    title: "Flat Roof Repair in Glendale, CA | Citium Roofing Solutions",
    description:
      "Flat roof repair in Glendale, CA for leaks, ponding, open seams and flashing on TPO, torch-down and older low-slope roofs. Call Citium at 818-531-1277.",
    h1: "Flat Roof Repair in Glendale, CA",
    label: "Flat Roof Repair",
    parent: "/roof-repair-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/commercial-roofing-glendale-ca",
    title: "Commercial Roofing in Glendale, CA | Citium Roofing",
    description:
      "Commercial roofing in Glendale, CA: repair, replacement and new TPO or torch-down roofs for commercial properties. Call 818-531-1277 for a free estimate.",
    h1: "Commercial Roofing in Glendale, CA",
    label: "Commercial Roofing",
    parent: "/roofing-contractor-glendale-ca",
    priority: 0.8,
    changefreq: "monthly",
    updated: U,
  },
  // ---- Batch 2: service areas (content from the Day 3 drafts). ----
  {
    path: "/service-areas",
    title: "Roofing Service Areas: Glendale, Burbank & Pasadena | Citium",
    description:
      "Citium Roofing Solutions serves Glendale, Burbank, Pasadena, La Crescenta, Tujunga, Sunland and Alhambra from Brand Blvd in Glendale. Find your city's notes.",
    h1: "Roofing Service Areas Near Glendale, CA",
    label: "Service Areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/glendale-ca",
    title: "Glendale, CA Roofing by Neighborhood | Citium Roofing",
    description:
      "Roofing in Glendale neighborhoods from Rossmoyne to Verdugo Woodlands: common roof types, foothill weather, permits and service links. Call 818-531-1277.",
    h1: "Roofing Across Glendale Neighborhoods",
    label: "Glendale",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/burbank-ca",
    title: "Roofing Services in Burbank, CA | Citium Roofing Solutions",
    description:
      "Roof repair, replacement and inspections for Burbank homes in Magnolia Park, the Rancho and the hillside, from a Glendale roofer. Call 818-531-1277.",
    h1: "Roofing in Burbank, CA",
    label: "Burbank",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/pasadena-ca",
    title: "Roofing Services in Pasadena, CA | Citium Roofing Solutions",
    description:
      "Roof repair and replacement for Pasadena Craftsman, Spanish and hillside homes, including historic districts, from a Glendale roofer. Call 818-531-1277.",
    h1: "Roofing in Pasadena, CA",
    label: "Pasadena",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/la-crescenta-ca",
    title: "Roofing in La Crescenta, CA | Citium Roofing Solutions",
    description:
      "Roof repair, replacement and inspections for La Crescenta and Montrose foothill homes, including wind and fire-zone re-roofs. Call 818-531-1277 today.",
    h1: "Roofing in La Crescenta, CA",
    label: "La Crescenta",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/tujunga-ca",
    title: "Roofing Services in Tujunga, CA | Citium Roofing Solutions",
    description:
      "Roof repair, replacement and inspections for Tujunga foothill homes near Big Tujunga Canyon, including fire-zone re-roofs. Call 818-531-1277 today.",
    h1: "Roofing in Tujunga, CA",
    label: "Tujunga",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/sunland-ca",
    title: "Roofing Services in Sunland, CA | Citium Roofing Solutions",
    description:
      "Roof repair, replacement and inspections for Sunland homes, patio covers and garages near the Verdugos and Tujunga Wash. Call 818-531-1277 for an estimate.",
    h1: "Roofing in Sunland, CA",
    label: "Sunland",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  {
    path: "/service-areas/alhambra-ca",
    title: "Roofing Services in Alhambra, CA | Citium Roofing Solutions",
    description:
      "Roof repair, replacement and inspections for Alhambra homes, from Ramona Park Craftsman houses to Midwick Tract tile roofs. Call 818-531-1277 today.",
    h1: "Roofing in Alhambra, CA",
    label: "Alhambra",
    parent: "/service-areas",
    priority: 0.7,
    changefreq: "monthly",
    updated: U,
  },
  // Existing owner pages kept exactly as they are on the live site (original
  // title, description and body copy). They describe services/terms that this
  // batch does not promote, so they are noindex, left out of the sitemap, and
  // get no Service schema or keyword H1.
  {
    path: "/gutters",
    title: "Gutters | Citium Roofing Solutions",
    description:
      "A roof sheds water. Gutters and downspouts decide where it goes next. Discuss drainage improvements alongside your roof assessment.",
    label: "Gutters",
    parent: "/roofing-systems",
    index: false,
    updated: U,
  },
  {
    path: "/siding",
    title: "Siding | Citium Roofing Solutions",
    description:
      "Your roof connects to walls, trim, and exterior finishes. Bring siding questions to Citium so the available scope and roof-to-wall details can be reviewed together.",
    label: "Siding",
    parent: "/roofing-systems",
    index: false,
    updated: U,
  },
  {
    path: "/warranty",
    title: "Roof Warranty | Citium Roofing Solutions",
    description:
      "Understand product and workmanship warranty questions, documents, coverage, and exclusions before choosing a roof.",
    label: "Warranty",
    index: false,
    updated: U,
  },
  {
    path: "/financing",
    title: "Roof Financing Inquiry | Citium Roofing Solutions",
    description:
      "Ask Citium about roof financing. Send your contact information for a follow-up about available options.",
    label: "Financing",
    index: false,
    updated: U,
  },
];

const byPath = new Map(seoPages.map((p) => [p.path, p]));

export function seoPage(path: string): SeoPage | undefined {
  return byPath.get(path);
}

export type Crumb = { name: string; path: string };

/** Breadcrumb trail for a registered path, e.g. /tile -> Home / Roofing Systems / Tile Roofing. */
export function crumbsFor(path: string, leafName?: string): Crumb[] {
  const trail: Crumb[] = [];
  let cur = seoPage(path);
  const seen = new Set<string>();
  while (cur && cur.path !== "/" && !seen.has(cur.path)) {
    seen.add(cur.path);
    trail.unshift({ name: cur.label, path: cur.path });
    cur = seoPage(cur.parent ?? "/");
  }
  trail.unshift({ name: "Home", path: "/" });
  if (leafName && trail.length) trail[trail.length - 1] = { ...trail[trail.length - 1], name: leafName };
  return trail;
}

export type SitemapEntry = { path: string; lastmod: string; changefreq?: string; priority?: number };

/** Canonical, indexable URLs only. New seoPages entries and new articles appear automatically. */
export function sitemapEntries(): SitemapEntry[] {
  const pages = seoPages
    .filter((p) => p.index !== false)
    .map((p) => ({ path: p.path, lastmod: p.updated, changefreq: p.changefreq, priority: p.priority }));
  const posts = articles.map((a) => ({
    path: `/articles/${a.slug}`,
    lastmod: (a.updatedAt || a.publishedAt).slice(0, 10),
    changefreq: "monthly",
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
