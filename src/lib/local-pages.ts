/**
 * Glendale money pages and service-area (city) pages.
 *
 * Page copy lives in src/lib/local/*.ts, one module per page, generated from
 * the approved content drafts (Day 2 Glendale pages, Day 3 service areas).
 * Each module is loaded on demand by its route loader, so a page's copy is
 * only shipped with that page. Titles, meta descriptions, H1s and breadcrumb
 * labels are registered in src/lib/pages.ts (seoPages) like every other URL.
 *
 * The held emergency draft (/emergency-roof-repair-glendale-ca) is intentionally
 * not registered here and must not be linked: the live site makes no emergency
 * or 24/7 claim.
 */
export type LinkRef = { anchor: string; href: string };
export type SourceRef = { label: string; url: string };
export type Item = {
  title: string;
  text: string;
  link?: LinkRef;
  links?: LinkRef[];
  sources?: SourceRef[];
};
type SectionBase = { heading: string; intro?: string; links?: LinkRef[]; sources?: SourceRef[] };
export type Section =
  | (SectionBase & { type: "text" | "cta"; body: string[] })
  | (SectionBase & { type: "cards" | "accordion" | "process"; body: Item[] })
  | (SectionBase & { type: "comparison"; body: { columns: string[]; rows: string[][] } })
  | (SectionBase & { type: "linklist"; body: LinkRef[] })
  | (SectionBase & { type: "faq"; body: "faqs" });

export type Faq = { q: string; a: string; sources?: SourceRef[] };

export type LocalPage = {
  slug: string;
  path: string;
  kind: "service" | "city";
  city?: string;
  h1: string;
  support: string;
  trust: string;
  cta: { inspectionLabel: string };
  sections: Section[];
  faqs: Faq[];
  related: {
    hub?: LinkRef;
    parent?: LinkRef;
    next?: LinkRef;
    services: LinkRef[];
    articles: LinkRef[];
    pages: LinkRef[];
    cities: LinkRef[];
  };
  service: { name: string; serviceType: string; description: string; areaServed: string };
  crumbs: { name: string; path: string }[];
};

type Loader = () => Promise<{ default: LocalPage }>;

/** Glendale service pages, served at /{slug} by src/routes/$slug.tsx. */
export const SERVICE_PAGES: Record<string, Loader> = {
  "roofing-contractor-glendale-ca": () => import("./local/roofing-contractor-glendale-ca"),
  "roof-repair-glendale-ca": () => import("./local/roof-repair-glendale-ca"),
  "roof-replacement-glendale-ca": () => import("./local/roof-replacement-glendale-ca"),
  "roof-installation-glendale-ca": () => import("./local/roof-installation-glendale-ca"),
  "residential-roofing-glendale-ca": () => import("./local/residential-roofing-glendale-ca"),
  "roof-inspection-glendale-ca": () => import("./local/roof-inspection-glendale-ca"),
  "tile-roof-repair-glendale-ca": () => import("./local/tile-roof-repair-glendale-ca"),
  "flat-roof-repair-glendale-ca": () => import("./local/flat-roof-repair-glendale-ca"),
  "commercial-roofing-glendale-ca": () => import("./local/commercial-roofing-glendale-ca"),
};

/** City pages, served at /service-areas/{slug} by src/routes/service-areas.$city.tsx. */
export const CITY_PAGES: Record<string, Loader> = {
  "glendale-ca": () => import("./local/city-glendale-ca"),
  "burbank-ca": () => import("./local/city-burbank-ca"),
  "pasadena-ca": () => import("./local/city-pasadena-ca"),
  "la-crescenta-ca": () => import("./local/city-la-crescenta-ca"),
  "tujunga-ca": () => import("./local/city-tujunga-ca"),
  "sunland-ca": () => import("./local/city-sunland-ca"),
  "alhambra-ca": () => import("./local/city-alhambra-ca"),
};

/** City cards for the /service-areas index and the navigation. Order matches SERVICE_AREAS. */
export const CITY_CARDS: { slug: string; city: string; note: string }[] = [
  { slug: "glendale-ca", city: "Glendale", note: "Our home base on N Brand Blvd, from Rossmoyne to Verdugo Woodlands." },
  { slug: "burbank-ca", city: "Burbank", note: "Magnolia Park bungalows, the Rancho and hillside homes under the Verdugos." },
  { slug: "pasadena-ca", city: "Pasadena", note: "Craftsman and Period Revival homes, including landmark districts." },
  { slug: "la-crescenta-ca", city: "La Crescenta", note: "Foothill homes in La Crescenta and Montrose, where wind and fire zones shape the job." },
  { slug: "tujunga-ca", city: "Tujunga", note: "Homes against the San Gabriel Mountains, where re-roofs start with wind exposure and fire zones." },
  { slug: "sunland-ca", city: "Sunland", note: "Homes, patio covers and garages between the Verdugos and the San Gabriels." },
  { slug: "alhambra-ca", city: "Alhambra", note: "Early and mid-century homes, from Ramona Park Craftsman houses to Midwick Tract tile roofs." },
];

/** Service links used in the header and footer navigation. */
export const SERVICE_NAV: LinkRef[] = [
  { anchor: "Glendale roofing contractor", href: "/roofing-contractor-glendale-ca" },
  { anchor: "Roof repair", href: "/roof-repair-glendale-ca" },
  { anchor: "Roof replacement", href: "/roof-replacement-glendale-ca" },
  { anchor: "New roof installation", href: "/roof-installation-glendale-ca" },
  { anchor: "Residential roofing", href: "/residential-roofing-glendale-ca" },
  { anchor: "Roof inspection", href: "/roof-inspection-glendale-ca" },
  { anchor: "Tile roof repair", href: "/tile-roof-repair-glendale-ca" },
  { anchor: "Flat roof repair", href: "/flat-roof-repair-glendale-ca" },
  { anchor: "Commercial roofing", href: "/commercial-roofing-glendale-ca" },
];
