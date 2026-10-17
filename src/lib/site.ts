/**
 * Single source of truth for the canonical origin and the verified NAP
 * (name, address, phone). Every canonical, og:url, JSON-LD url, the sitemap
 * and robots.txt must use SITE_URL. Do not hard-code the host anywhere else.
 *
 * Business facts come only from what the live site states (owner rule, see
 * audit/live-site-facts.md). Live-backed items are allowed, worded as the site
 * words them: Owens Corning Preferred, warranty-backed work, "Citium offers
 * financing", residential and commercial properties, free estimate. Items the
 * site does not state stay out: hours, license number, emergency/24-7
 * response, free inspections, ratings/reviews, warranty terms.
 */
export const SITE_URL = "https://www.citiumroofing.com";
export const SITE_HOST = "www.citiumroofing.com";
export const SITE_NAME = "Citium Roofing Solutions";

export const NAP = {
  name: SITE_NAME,
  street: "401 N Brand Blvd",
  unit: "Unit L106B",
  streetAddress: "401 N Brand Blvd, Unit L106B",
  city: "Glendale",
  region: "CA",
  zip: "91203",
  country: "US",
  phoneDisplay: "818-531-1277",
  phoneE164: "+18185311277",
  phoneSchema: "+1-818-531-1277",
  tel: "tel:+18185311277",
  email: "citiuminc@gmail.com",
  mailto: "mailto:citiuminc@gmail.com",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=401+N+Brand+Blvd+Unit+L106B+Glendale+CA+91203",
} as const;

/** Verified service areas (owner-confirmed list of 7 cities). */
export const SERVICE_AREAS = [
  "Glendale",
  "Burbank",
  "Pasadena",
  "La Crescenta",
  "Tujunga",
  "Sunland",
  "Alhambra",
] as const;

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`;

/** Absolute canonical URL for a site path. "/" -> "https://www.…/", "/about" -> "https://www.…/about". */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path === "/" || path === "" ? "/" : "/" + path.replace(/^\/+/, "").replace(/\/+$/, "");
  return SITE_URL + clean;
}

export type HeadInput = {
  /** Full <title> text (50-60 chars recommended). */
  title: string;
  /** Meta description (140-160 chars recommended). */
  description: string;
  /** Site path of this page, e.g. "/" or "/tile". Used for the self-referencing canonical. */
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  /** false -> "noindex, follow" (page stays crawlable for links but out of the index). */
  index?: boolean;
  extraMeta?: Array<Record<string, string>>;
};

/** Builds the per-page head: title, description, robots, canonical, Open Graph and Twitter tags. */
export function pageHead(h: HeadInput) {
  const url = absoluteUrl(h.path);
  const image = h.image ? absoluteUrl(h.image) : DEFAULT_OG_IMAGE;
  const robots = h.index === false ? "noindex, follow" : "index, follow, max-image-preview:large";
  return {
    meta: [
      { title: h.title },
      { name: "description", content: h.description },
      { name: "robots", content: robots },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: h.type ?? "website" },
      { property: "og:title", content: h.title },
      { property: "og:description", content: h.description },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      ...(h.imageAlt ? [{ property: "og:image:alt", content: h.imageAlt }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: h.title },
      { name: "twitter:description", content: h.description },
      { name: "twitter:image", content: image },
      ...(h.extraMeta ?? []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** Serialize JSON-LD safely for inline <script type="application/ld+json">. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Services the live site states Citium offers. Add nothing here the owner has not published. */
export const OFFERED_SERVICES = [
  "Roof repair",
  "Roof installation",
  "Roof replacement",
  "Shingle roofing",
  "Tile roofing",
  "TPO roofing",
  "Modified bitumen (torch-down) roofing",
  "Residential roofing",
  "Commercial roofing",
] as const;

/**
 * Business description, worded as the live site words it (/about, homepage,
 * /faq, /financing). No hours, license number, ratings or response-time claims.
 */
export const BUSINESS_DESCRIPTION =
  "Based in Glendale, Citium provides roof repair, installation, and replacement for residential and commercial properties. Owens Corning Preferred contractor. Citium offers financing.";

export const BUSINESS_ID = `${SITE_URL}/#business`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: NAP.streetAddress,
  addressLocality: NAP.city,
  addressRegion: NAP.region,
  postalCode: NAP.zip,
  addressCountry: NAP.country,
} as const;

const LOGO = {
  "@type": "ImageObject",
  url: `${SITE_URL}/images/logo-512.png`,
  width: 481,
  height: 512,
} as const;

/** The seven service-area cities as schema.org City nodes. */
export function areaServedSchema() {
  return SERVICE_AREAS.map((city) => ({ "@type": "City", name: `${city}, CA` }));
}

/**
 * The RoofingContractor entity (same @id, NAP and areaServed everywhere).
 * Used as the site-wide LocalBusiness node and as `provider` on every Service.
 */
export function businessEntity() {
  return {
    "@type": "RoofingContractor",
    "@id": BUSINESS_ID,
    name: SITE_NAME,
    url: SITE_URL + "/",
    image: DEFAULT_OG_IMAGE,
    logo: LOGO,
    telephone: NAP.phoneSchema,
    email: NAP.email,
    address: POSTAL_ADDRESS,
    hasMap: NAP.mapsUrl,
    description: BUSINESS_DESCRIPTION,
    areaServed: areaServedSchema(),
    // Stated on the live homepage, /faq and /warranty ("Owens Corning Preferred").
    hasCredential: {
      "@type": "Credential",
      name: "Owens Corning Preferred Contractor",
      credentialCategory: "Manufacturer contractor program",
      recognizedBy: { "@type": "Organization", name: "Owens Corning" },
    },
  };
}

/** Publisher/author node for articles: the Organization, with name and logo inline. */
export function organizationRef() {
  return { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL + "/", logo: LOGO };
}

/**
 * Claims the live site does NOT make (emergency/24-7 response, hours, license
 * numbers, free inspections, ratings/reviews). FAQ answers that mention them
 * stay visible on the page but are left out of FAQPage JSON-LD. Anything the
 * live site states (Owens Corning Preferred, warranty-backed, financing,
 * commercial, free estimate) is allowed.
 */
export const SCHEMA_EXCLUDE =
  /emergenc|24\s*\/\s*7|24-hour|same[- ]day|after[- ]hours|licen[cs]e\s*(#|no\.|number)|business hours|free (roof )?inspection|\bratings?\b|\breviews\b|testimonial/i;

/** FAQPage JSON-LD built only from FAQs that are visible on the page. */
export function faqSchema(items: { q: string; a: string }[]) {
  const mainEntity = items
    .filter((f) => !SCHEMA_EXCLUDE.test(f.q + " " + f.a))
    .map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }));
  if (!mainEntity.length) return null;
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

/** Service JSON-LD. Provider is the site-wide RoofingContractor entity. */
export function serviceSchema(s: {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  areaServed?: string;
}) {
  const url = absoluteUrl(s.path);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: s.name,
    serviceType: s.serviceType,
    description: s.description,
    url,
    areaServed: s.areaServed ? { "@type": "City", name: `${s.areaServed}, CA` } : areaServedSchema(),
    provider: businessEntity(),
  };
}

/** Site-wide structured data: RoofingContractor (LocalBusiness), Organization and WebSite. Verified facts only. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        url: SITE_URL + "/",
        logo: LOGO,
        email: NAP.email,
        telephone: NAP.phoneSchema,
        address: POSTAL_ADDRESS,
      },
      {
        ...businessEntity(),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Roofing services",
          itemListElement: OFFERED_SERVICES.map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        },
        parentOrganization: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL + "/",
        inLanguage: "en-US",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}
