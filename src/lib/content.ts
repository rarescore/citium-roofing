import { packedArticles } from "@/lib/articles-data";
import { NAP, SERVICE_AREAS, SITE_URL, SITE_NAME } from "@/lib/site";
import { seoPages } from "@/lib/pages";

export const company = {
  name: SITE_NAME,
  phone: NAP.phoneDisplay,
  email: NAP.email,
  street: NAP.streetAddress,
  city: NAP.city,
  region: NAP.region,
  zip: NAP.zip,
  area: [...SERVICE_AREAS],
  source: SITE_URL + "/",
};

export const services = [
  {
    slug: "shingles",
    name: "Shingle roofing",
    short: "Shingles",
    tag: "TEXTURE, COLOR, CHARACTER",
    headline: "A roof with\ndimension.",
    intro:
      "Architectural shingles bring layered texture to pitched roofs. Explore Owens Corning materials and find a finish that works with your home.",
    tone: "shingle",
    image: "trudefinition-duration-estate-gray.webp",
    details: [
      [
        "A complete assembly",
        "Shingles work with underlayment, flashing, starter strips, ridge caps, and ventilation. A good selection considers the whole system.",
      ],
      [
        "Choose in real light",
        "Explore the visualizer, then ask for a physical sample. Roof pitch, sunlight, and surrounding materials all affect how a color looks.",
      ],
      [
        "Plan for your property",
        "Citium can assess the existing roof, decking condition, drainage, and transitions before recommending a repair or replacement.",
      ],
    ],
    questions: [
      [
        "Can I choose any shingle color?",
        "Availability varies by region and product. Confirm the local product, color, and applicable requirements with Citium before ordering.",
      ],
      [
        "Will a new roof cover existing damage?",
        "The roof assessment should identify visible damage and explain how concealed decking issues will be handled in the written scope.",
      ],
    ],
  },
  {
    slug: "tile",
    name: "Tile roofing",
    short: "Tile",
    tag: "A SOUTHERN CALIFORNIA CLASSIC",
    headline: "Character that\nruns deep.",
    intro:
      "The rhythm of tile gives a roof its unmistakable silhouette. Beneath it, underlayment and carefully detailed transitions do the essential work.",
    tone: "tile",
    image: "tile.webp",
    details: [
      [
        "Start below the tile",
        "A roof can need attention even when its tiles look intact. The inspection should consider underlayment condition, broken pieces, and leak paths.",
      ],
      [
        "Repair with the right match",
        "Profile, size, and fastening matter when replacing damaged tiles. Discuss matching options and availability before work begins.",
      ],
      [
        "Respect the structure",
        "Changing roofing materials can change loading. Any proposed change should account for the supporting structure and project requirements.",
      ],
    ],
    questions: [
      [
        "Does one broken tile mean I need a replacement roof?",
        "Not necessarily. An inspection can help distinguish a local repair from a wider underlayment or drainage problem.",
      ],
      [
        "Can existing tiles be reused?",
        "Condition, compatibility, and the project scope determine whether reuse is practical. Ask Citium to assess your roof.",
      ],
    ],
  },
  {
    slug: "tpo",
    name: "TPO roofing",
    short: "TPO",
    tag: "LOW SLOPE. CAREFUL DETAIL.",
    headline: "Clean lines.\nContinuous protection.",
    intro:
      "TPO is a single-ply membrane option for low-slope roofs. Seams, penetrations, drainage, and edge details deserve as much attention as the field of the roof.",
    tone: "tpo",
    image: "tpo-macro.webp",
    details: [
      [
        "Plan the drainage",
        "Low-slope does not mean no slope. Ponding, drains, and scuppers should be assessed as part of the proposed assembly.",
      ],
      [
        "Make the seams count",
        "TPO seams are joined with heat welding. Proper preparation and installation help create a continuous membrane.",
      ],
      [
        "Check compatibility",
        "The substrate, insulation, attachment method, and rooftop equipment all shape the project specification. Confirm TPO suitability with Citium.",
      ],
    ],
    questions: [
      [
        "Is TPO right for my building?",
        "That depends on the roof assembly, use, condition, and project requirements. Request an assessment before choosing a membrane.",
      ],
      [
        "Can a membrane roof be repaired?",
        "Some localized issues can be repaired. Age, contamination, and extent of damage help determine the appropriate approach.",
      ],
    ],
  },
  {
    slug: "modified-bitumen",
    name: "Modified bitumen / torch-down roofing",
    short: "Modified bitumen",
    tag: "LAYERED LOW-SLOPE PROTECTION",
    headline: "Strength,\nlayer upon layer.",
    intro:
      "Modified bitumen systems combine reinforced asphalt sheets in a specified assembly. The right application method depends on the property and selected product.",
    tone: "bitumen",
    image: "bitumen-macro.webp",
    details: [
      [
        "Choose the assembly",
        "Base and cap sheets, surfacing, attachment, and detailing work together. The written proposal should identify the specified system.",
      ],
      [
        "Understand torch-down",
        "Torch-applied roofing is one installation method, not a universal choice. Site conditions and fire precautions require qualified assessment.",
      ],
      [
        "Look closely at transitions",
        "Parapets, drains, edges, and equipment curbs are essential details. Review how each will be addressed before installation.",
      ],
    ],
    questions: [
      [
        "Are all modified bitumen roofs torch-applied?",
        "No. Application methods differ by product and assembly. Confirm the exact method and suitability during project planning.",
      ],
      [
        "What should my estimate include?",
        "Ask for the layers, surface preparation, flashing scope, drainage work, and warranty terms in writing.",
      ],
    ],
  },
  {
    slug: "gutters",
    name: "Gutters",
    short: "Gutters",
    tag: "FOLLOW THE WATER",
    headline: "A clear path\naway from home.",
    intro:
      "A roof sheds water. Gutters and downspouts decide where it goes next. Discuss drainage improvements alongside your roof assessment.",
    tone: "gutters",
    image: "hero.webp",
    details: [
      [
        "Consider the whole route",
        "Collection is only the first step. Downspout positioning and discharge areas matter to the overall drainage plan.",
      ],
      [
        "Review existing problems",
        "Overflow, visible sagging, or leaking joints are useful observations to share with Citium. Photos taken safely from the ground can help.",
      ],
      [
        "Coordinate the details",
        "Roof edges, fascia condition, and gutter placement should be considered together. Ask Citium to confirm the available scope for your property.",
      ],
    ],
    questions: [
      [
        "Should gutters be discussed during reroofing?",
        "Yes. It is a useful time to review the roof edge and any drainage concerns as part of the project scope.",
      ],
    ],
  },
  {
    slug: "siding",
    name: "Siding",
    short: "Siding",
    tag: "WHERE ROOF MEETS WALL",
    headline: "One considered\nexterior.",
    intro:
      "Your roof connects to walls, trim, and exterior finishes. Bring siding questions to Citium so the available scope and roof-to-wall details can be reviewed together.",
    tone: "siding",
    image: "hero.webp",
    details: [
      [
        "Begin at the transitions",
        "Roof-to-wall flashing and exterior cladding need a coordinated approach to shed water correctly.",
      ],
      [
        "Identify the material",
        "Existing siding type and condition affect repair options. Share photos and your goals before selecting a finish.",
      ],
      [
        "Confirm your scope",
        "Ask Citium to confirm siding service availability, material options, and the written scope for your address.",
      ],
    ],
    questions: [
      [
        "Can I discuss siding with my roofing estimate?",
        "Yes. Include your exterior concerns in the request so Citium can confirm what can be included.",
      ],
    ],
  },
];

/**
 * Slug → {title, description} for every single-segment URL served by /$slug.
 * Built from seoPages so adding a page to src/lib/pages.ts is enough for
 * beforeLoad validation. Prefer seoPage("/"+slug) for titles/metas/H1s.
 */
export const pageInfo: Record<string, { title: string; description: string }> = Object.fromEntries(
  seoPages
    .filter((p) => p.path !== "/" && !p.path.includes("/", 1) && !p.path.startsWith("/articles/"))
    .map((p) => [p.path.slice(1), { title: p.label, description: p.description }]),
);

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  author: { name: string; url?: string };
  publishedAt: string;
  updatedAt?: string;
  image?: { src: string; alt: string };
  sections: { heading: string; paragraphs: string[] }[];
  relatedServices: string[];
  relatedArticles: string[];
  html?: string;
  seoTitle?: string;
  /** FAQs that are visible in the article HTML; used for FAQPage JSON-LD. */
  faqs?: { q: string; a: string }[];
};
export const articles: Article[] = packedArticles;
export const articleCategories = [
  "All resources",
  "Materials",
  "Maintenance",
  "Planning",
  "Warranties",
];
