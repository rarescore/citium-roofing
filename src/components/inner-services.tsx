import { ArrowUpRight } from "lucide-react";
import { Link } from "@/lib/citium-link";
import RoofStudio from "@/components/roof-studio";
import { ShingleAnatomy } from "@/components/shingle-anatomy";
import { services } from "@/lib/content";
import { productsFor, type Family } from "@/lib/catalog";
import { Intro } from "@/components/inner-forms";
import { seoPage } from "@/lib/pages";

/** Page-specific "Keep exploring" links: each material page points at its repair and replacement pages (Day 5 L08-L17). */
const KEEP_EXPLORING: Record<string, [string, string][]> = {
  shingles: [
    ["/roof-replacement-glendale-ca", "Planning a full shingle re-roof"],
    ["/roof-repair-glendale-ca", "Shingle and flashing repairs"],
    ["/roofing-systems", "Compare all four roof systems"],
    ["/warranty", "Understanding warranties"],
  ],
  tile: [
    ["/tile-roof-repair-glendale-ca", "Repairing cracked or slipped tile"],
    ["/roof-replacement-glendale-ca", "Re-roofing a tile house"],
    ["/articles/why-is-my-tile-roof-leaking", "Why tile roofs leak"],
    ["/articles/how-long-does-a-tile-roof-last", "How long a tile roof lasts"],
    ["/roofing-systems", "Compare all four roof systems"],
  ],
  tpo: [
    ["/flat-roof-repair-glendale-ca", "Repairing a leaking flat roof"],
    ["/commercial-roofing-glendale-ca", "Commercial low-slope roofing"],
    ["/articles/flat-roofs-in-la-are-a-different-sport", "What a flat-roof bid should include"],
    ["/roofing-systems", "Compare all four roof systems"],
  ],
  "modified-bitumen": [
    ["/flat-roof-repair-glendale-ca", "Torch-down seam and flashing repairs"],
    ["/commercial-roofing-glendale-ca", "Torch-down on commercial roofs"],
    ["/articles/flat-roofs-in-la-are-a-different-sport", "Flat roofs in L.A., explained"],
    ["/roofing-systems", "Compare all four roof systems"],
  ],
  default: [
    ["/installation-process", "The installation process"],
    ["/roofing-contractor-glendale-ca", "Glendale roofing services"],
    ["/articles", "Roofing resources"],
  ],
};

export function Service({ slug }: { slug: string }) {
  const s = services.find((x) => x.slug === slug)!;
  return (
    <>
      <section className={"service-hero " + s.tone}>
        <div>
          <Intro tag={s.tag} title={s.headline} copy={s.intro} h1={seoPage("/" + slug)?.h1} />
          <Link className="button" href={"/estimate?design=" + encodeURIComponent(s.name)}>
            Discuss {s.short.toLowerCase()} <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className={"service-material material-for-" + slug}>
          {slug === "shingles" ? (
            <ShingleAnatomy />
          ) : (
            !["gutters", "siding"].includes(slug) && (
              <>
                <img
                  src={"/images/" + s.image}
                  alt={
                    slug === "tile"
                      ? "Tile roof shown on Citium’s company website"
                      : "Illustrative roof assembly and exterior context"
                  }
                  width="900"
                  height="700"
                  loading="lazy"
                  decoding="async"
                />
                <span>{slug === "tile" ? "TILE ROOFING" : "ROOF SYSTEM / DETAIL STUDY"}</span>
              </>
            )
          )}
        </div>
      </section>
      <section className="service-details">
        <div>
          <span className="eyebrow">WHAT TO CONSIDER</span>
          <h2>
            {slug === "gutters"
              ? "The route matters."
              : slug === "siding"
                ? "Every connection counts."
                : "Beyond the surface."}
          </h2>
        </div>
        <div>
          {s.details.map(([h, p]) => (
            <article key={h}>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      {slug === "shingles" && <Catalog family="shingles" />}
      {slug === "tile" && <Catalog family="tile" />}
      {slug === "tpo" && <Catalog family="tpo" />}
      {slug === "modified-bitumen" && <Catalog family="torch" />}
      <section className="faq-section">
        <h2>Before you decide.</h2>
        <div>
          {s.questions.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
          <Link href="/contact" className="text-link">
            Ask another question <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="related-links">
        <span className="eyebrow">KEEP EXPLORING</span>
        {(KEEP_EXPLORING[slug] ?? KEEP_EXPLORING.default).map(([href, label]) => (
          <Link key={href} href={href}>
            {label} ↗
          </Link>
        ))}
      </section>
    </>
  );
}

export function Catalog({ family }: { family: Family }) {
  const list = productsFor(family);
  return (
    <section className="catalog">
      <div className="catalog-heading">
        <span className="eyebrow">PRODUCT LIBRARY</span>
        <h2>
          {family === "shingles"
            ? "Every shingle. Every color we specify."
            : family === "tile"
              ? "Profiles and colors, not just “tile.”"
              : family === "tpo"
                ? "A membrane is a system."
                : "Layer by layer."}
        </h2>
        <Link className="text-link" href="/design-your-roof">
          Turn it in 3D <ArrowUpRight size={17} />
        </Link>
      </div>
      {list.map((p) => (
        <article key={p.id} className="catalog-product">
          <div>
            <span className="eyebrow">{p.maker}</span>
            <h3>{p.name}</h3>
            <p>{p.summary}</p>
            <p className="studio-spec">{p.construction}</p>
            <p className="studio-spec">{p.warranty}</p>
          </div>
          <div className="catalog-swatches">
            {p.finishes.map((f) => (
              <Link
                key={f.id}
                href={
                  "/design-your-roof?design=" +
                  encodeURIComponent(p.name + " / " + f.name)
                }
                className="catalog-swatch"
              >
                <img
                  src={f.swatch || f.texture}
                  alt={`${p.name} in ${f.name}`}
                  width="280"
                  height="180"
                  loading="lazy"
                  decoding="async"
                />
                <span>
                  {f.name}
                  {f.sri != null ? ` · SRI ${f.sri}` : ""}
                </span>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

export function StudioPage() {
  const seo = seoPage("/design-your-roof");
  return (
    <>
      <div className="studio-page-intro">
        <h1 className="seo-h1">{seo?.h1 || "Design Your Roof"}</h1>
        <div className="display-line">
          Preview finishes. Send your design.
        </div>
        <p>
          Choose a system and color, inspect the surface, then send the design with your estimate request.
        </p>
      </div>
      <RoofStudio />
    </>
  );
}

export function Systems() {
  return (
    <>
      <Intro
        tag="ROOFING SYSTEMS"
        title={"The right system.\nFrom the ground up."}
        copy="Begin with the way your property is built. Compare the materials, then talk through the details with Citium."
        h1={seoPage("/roofing-systems")?.h1}
      />
      <div className="systems-index">
        {services.map((s) => (
          <Link href={"/" + s.slug} key={s.slug} className={s.tone}>
            <span className="eyebrow">{s.tag}</span>
            <h2>{s.short}</h2>
            <p>{s.intro}</p>
            <span className="text-link">
              Explore {s.short.toLowerCase()} <ArrowUpRight size={17} />
            </span>
          </Link>
        ))}
      </div>
      <p className="service-availability">
        Roof repair, installation, and replacement are offered by Citium. Specific materials, gutters, and
        siding scope are confirmed for your property during consultation.
      </p>
    </>
  );
}
