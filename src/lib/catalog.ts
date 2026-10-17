export type Family = "shingles" | "tile" | "tpo" | "torch";

export type Finish = {
  id: string;
  name: string;
  hex: string;
  texture: string;
  swatch?: string;
  reflectance?: number;
  sri?: number;
};

export type Product = {
  id: string;
  family: Family;
  maker: string;
  name: string;
  style: string;
  summary: string;
  construction: string;
  warranty: string;
  finishes: Finish[];
};

export const families: { id: Family; label: string; pitch: string }[] = [
  { id: "shingles", label: "Shingles", pitch: "Steep slope" },
  { id: "tile", label: "Tile", pitch: "Steep slope" },
  { id: "tpo", label: "TPO", pitch: "Low slope" },
  { id: "torch", label: "Torch-down", pitch: "Low slope" },
];

const shingle = (
  id: string,
  name: string,
  hex: string,
  tex: string,
  extra?: { swatch?: string; reflectance?: number; sri?: number },
): Finish => ({
  id,
  name,
  hex,
  texture: tex,
  swatch: extra?.swatch,
  reflectance: extra?.reflectance,
  sri: extra?.sri,
});

export const products: Product[] = [
  {
    id: "duration-cool",
    family: "shingles",
    maker: "Owens Corning",
    name: "TruDefinition® Duration® COOL",
    style: "Cool Roof architectural laminate",
    summary:
      "Duration® performance with solar-reflecting granules. In Southern California this is the Duration line Citium specifies when a Cool Roof is required or wanted. Granules bounce a measured share of sunlight instead of soaking it in as heat.",
    construction:
      "Laminated fiberglass shingle with SureNail® Technology. Same 13-1/4\" × 39-3/8\", 5-5/8\" exposure as Duration®. Class 3 impact. CRRC-rated colors; aged solar reflectance and SRI vary by color — see each finish.",
    warranty:
      "Limited Lifetime product warranty · 130-mph wind · 25-year StreakGuard® algae resistance. Cool Roof compliance is confirmed for the address and the selected color. Confirm exact terms for your property.",
    finishes: [
      shingle("cool-shasta-white", "Shasta White", "#e8e4d8", "/images/textures/cool-shasta-white.jpg", {
        reflectance: 0.29,
        sri: 29,
      }),
      shingle("cool-amber", "Amber", "#c4a574", "/images/textures/cool-amber.jpg", { reflectance: 0.23, sri: 24 }),
      shingle("cool-oyster-shell", "Oyster Shell", "#d4cfc4", "/images/textures/cool-oyster-shell.jpg", {
        reflectance: 0.23,
        sri: 24,
      }),
      shingle("cool-sierra-gray", "Sierra Gray", "#8a8e90", "/images/textures/cool-sierra-gray.jpg", {
        reflectance: 0.2,
        sri: 20,
      }),
      shingle("cool-mountainside", "Mountainside", "#6a6560", "/images/textures/cool-mountainside.jpg", {
        reflectance: 0.19,
        sri: 19,
      }),
      shingle("cool-mojave", "Mojave", "#c4a06a", "/images/textures/cool-mojave.jpg", { reflectance: 0.19, sri: 18 }),
      shingle("cool-summerwood", "Summerwood", "#9a7a58", "/images/textures/cool-summerwood.jpg", {
        reflectance: 0.18,
        sri: 17,
      }),
      shingle("cool-forest-brown", "Forest Brown", "#4a3728", "/images/textures/cool-forest-brown.jpg", {
        reflectance: 0.18,
        sri: 17,
      }),
      shingle("cool-sand-castle", "Sand Castle", "#cbb892", "/images/textures/shingle-desert-tan.jpg", {
        reflectance: 0.18,
        sri: 17,
      }),
      shingle("cool-night-sky", "Night Sky", "#2c3238", "/images/textures/cool-night-sky.jpg", {
        reflectance: 0.18,
        sri: 16,
      }),
    ],
  },
  {
    id: "duration",
    family: "shingles",
    maker: "Owens Corning",
    name: "TruDefinition® Duration®",
    style: "Architectural laminate",
    summary:
      "Flagship dimensional shingle with SureNail® Technology and TruDefinition® color contrast. Specified when a Cool Roof color is not required.",
    construction:
      "Laminated fiberglass shingle, 13-1/4\" × 39-3/8\", 5-5/8\" exposure. Class 3 impact. SureNail nailing zone.",
    warranty:
      "Limited Lifetime product warranty · 130-mph wind · 25-year StreakGuard® algae resistance. Confirm exact terms for your address.",
    finishes: [
      shingle("onyx-black", "Onyx Black", "#1c1c1c", "/images/textures/shingle-onyx.jpg", {
        swatch: "/images/trudefinition-duration-onyx-black.jpg",
      }),
      shingle("estate-gray", "Estate Gray", "#6b6e70", "/images/textures/shingle-estate.jpg", {
        swatch: "/images/trudefinition-duration-estate-gray.jpg",
      }),
      shingle("brownwood", "Brownwood", "#5a3d2b", "/images/textures/shingle-brownwood.jpg", {
        swatch: "/images/trudefinition-duration-brownwood.jpg",
      }),
      shingle("driftwood", "Driftwood", "#8a7d6e", "/images/textures/shingle-driftwood.jpg", {
        swatch: "/images/trudefinition-duration-driftwood.jpg",
      }),
      shingle("teak", "Teak", "#4a3728", "/images/textures/shingle-teak.jpg"),
      shingle("williamsburg-gray", "Williamsburg Gray", "#7a7d80", "/images/textures/shingle-williamsburg.jpg"),
      shingle("harbor-blue", "Harbor Blue", "#3d4d5c", "/images/textures/shingle-harbor.jpg"),
      shingle("slatestone-gray", "Slatestone Gray", "#5c5f62", "/images/textures/shingle-slatestone.jpg"),
      shingle("desert-tan", "Desert Tan", "#b59a72", "/images/textures/shingle-desert-tan.jpg"),
    ],
  },
  {
    id: "oakridge",
    family: "shingles",
    maker: "Owens Corning",
    name: "Oakridge®",
    style: "Architectural laminate",
    summary: "Entry architectural shingle with dimensional shadow lines. A practical choice when Duration’s SureNail system is not specified.",
    construction: "Laminated fiberglass shingle. Typical 110-mph wind rating. Confirm local availability.",
    warranty: "Limited Lifetime product warranty on qualifying installations. Ask Citium which coverage applies.",
    finishes: [
      shingle("oak-onyx", "Onyx Black", "#222221", "/images/textures/shingle-onyx.jpg", {
        swatch: "/images/oakridge-onyx-black.jpg",
      }),
      shingle("oak-estate", "Estate Gray", "#6d6f70", "/images/textures/shingle-estate.jpg", {
        swatch: "/images/oakridge-estate-gray.jpg",
      }),
      shingle("oak-brownwood", "Brownwood", "#5c402e", "/images/textures/shingle-brownwood.jpg", {
        swatch: "/images/oakridge-brownwood.jpg",
      }),
      shingle("oak-driftwood", "Driftwood", "#8b8072", "/images/textures/shingle-driftwood.jpg"),
    ],
  },
  {
    id: "mission-clay",
    family: "tile",
    maker: "Clay · two-piece",
    name: "Mission clay",
    style: "Two-piece pan and cover",
    summary: "The Southern California silhouette. Cover and pan tiles create deep shadow and a thick, historic profile.",
    construction: "Fired clay two-piece. Heavier than concrete. Structure must be confirmed before specifying.",
    warranty: "Product coverage varies by manufacturer. Citium reviews workmanship coverage in the written scope.",
    finishes: [
      { id: "terracotta", name: "Terracotta", hex: "#c45a2a", texture: "/images/textures/tile-roof-terracotta.jpg" },
      { id: "mission-red", name: "Mission Red", hex: "#9b2f1a", texture: "/images/textures/tile-roof-terracotta.jpg" },
      { id: "sand", name: "Sand", hex: "#c4a574", texture: "/images/textures/tile-roof-sand.jpg" },
      { id: "charcoal", name: "Charcoal", hex: "#3f4144", texture: "/images/textures/tile-roof-charcoal.jpg" },
    ],
  },
  {
    id: "s-tile-clay",
    family: "tile",
    maker: "Clay · one-piece",
    name: "Clay S-tile",
    style: "One-piece S-curve",
    summary: "A single rolled profile. Lighter visual rhythm than two-piece Mission, still unmistakably tile.",
    construction: "One-piece clay S-profile. Fastening and underlayment specified per the assembly.",
    warranty: "Manufacturer and workmanship terms confirmed with the selected product.",
    finishes: [
      { id: "s-terracotta", name: "Terracotta", hex: "#c45a2a", texture: "/images/textures/tile-roof-terracotta.jpg" },
      { id: "s-charcoal", name: "Charcoal", hex: "#3f4144", texture: "/images/textures/tile-roof-charcoal.jpg" },
      { id: "s-slate", name: "Slate Blend", hex: "#5a5d62", texture: "/images/textures/tile-roof-charcoal.jpg" },
    ],
  },
  {
    id: "concrete-s",
    family: "tile",
    maker: "Concrete",
    name: "Concrete S-tile",
    style: "One-piece concrete",
    summary: "A durable, widely available profile for Mediterranean and ranch homes. Color-through body with surface slurry.",
    construction: "Concrete S-profile. Weight is significant — decking and structure are part of the assessment.",
    warranty: "Confirm product and installation coverage before work begins.",
    finishes: [
      { id: "c-sand", name: "Sand", hex: "#c4a574", texture: "/images/textures/tile-roof-sand.jpg" },
      { id: "c-terracotta", name: "Terracotta", hex: "#b85a32", texture: "/images/textures/tile-roof-terracotta.jpg" },
      { id: "c-charcoal", name: "Charcoal", hex: "#3f4144", texture: "/images/textures/tile-roof-charcoal.jpg" },
    ],
  },
  {
    id: "tpo-60",
    family: "tpo",
    maker: "Single-ply membrane",
    name: "60-mil TPO",
    style: "Heat-welded membrane",
    summary: "A continuous white or gray membrane for low-slope roofs. Seams, drains, and penetrations decide the result.",
    construction: "60-mil TPO over specified insulation and cover board. Mechanically attached or fully adhered.",
    warranty: "Manufacturer system warranties depend on the exact assembly and installer credentials.",
    finishes: [
      { id: "tpo-white", name: "White", hex: "#f2f4f3", texture: "/images/textures/tpo-white.jpg" },
      { id: "tpo-gray", name: "Light Gray", hex: "#c9cdcf", texture: "/images/textures/tpo-gray.jpg" },
      { id: "tpo-tan", name: "Tan", hex: "#d7c4a5", texture: "/images/textures/tpo-white.jpg" },
    ],
  },
  {
    id: "torch-3",
    family: "torch",
    maker: "Modified bitumen",
    name: "Three-layer torch-down",
    style: "SBS / APP cap sheet",
    summary: "Base, ply, and mineral cap sheet. Torch application is one method — not a default for every property.",
    construction: "Multi-ply modified bitumen. Surfacing is granule-surfaced cap. Fire precautions required for torch work.",
    warranty: "Coverage follows the specified system. Ask Citium for the written assembly.",
    finishes: [
      { id: "mineral-brown", name: "Mineral Brown", hex: "#4a3a2e", texture: "/images/textures/torch-brown.jpg" },
      { id: "white-granule", name: "White Granule", hex: "#e8e6e0", texture: "/images/textures/torch-white.jpg" },
      { id: "black-granule", name: "Black Granule", hex: "#2a2a2a", texture: "/images/textures/torch-brown.jpg" },
    ],
  },
];

// Serve compressed WebP derivatives of the 1408px JPG masters (see public/images/textures):
// "-1024.webp" (~150-400 KB) for the photo view and three.js maps, "-sw.webp" (240px) for swatch chips.
for (const p of products) {
  for (const f of p.finishes) {
    if (!f.texture.endsWith(".jpg")) continue;
    const base = f.texture.slice(0, -4);
    f.swatch ??= `${base}-sw.webp`;
    f.texture = `${base}-1024.webp`;
  }
}

export function productsFor(family: Family) {
  return products.filter((p) => p.family === family);
}

export function findProduct(id: string) {
  return products.find((p) => p.id === id);
}
