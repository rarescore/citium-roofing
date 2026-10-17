import { ArrowUpRight, Phone, MapPin } from "lucide-react";
import { Link } from "@/lib/citium-link";
import { Inquiry } from "@/components/site-experiences";
import { NAP } from "@/lib/site";
import type { LocalPage, Section, Item, LinkRef, SourceRef, Faq } from "@/lib/local-pages";

/**
 * Renderer for the Glendale service pages and the service-area pages.
 * Everything (accordion answers, FAQ answers, tables, sources) is plain
 * server-rendered HTML so the full copy is crawlable without JavaScript.
 */

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function Arrow() {
  return <ArrowUpRight size={16} aria-hidden="true" />;
}

function A({ l, className }: { l: LinkRef; className?: string }) {
  return (
    <Link className={className ?? "lp-link"} href={l.href}>
      {l.anchor} <Arrow />
    </Link>
  );
}

function Sources({ items }: { items?: SourceRef[] }) {
  if (!items?.length) return null;
  return (
    <p className="lp-sources">
      <span>Source{items.length > 1 ? "s" : ""}:</span>{" "}
      {items.map((s, i) => (
        <span key={s.url + i}>
          {i > 0 && "; "}
          <a href={s.url} rel="noopener" target="_blank">
            {s.label}
          </a>
        </span>
      ))}
    </p>
  );
}

function Links({ items }: { items?: LinkRef[] }) {
  if (!items?.length) return null;
  return (
    <div className="lp-links">
      {items.map((l) => (
        <A key={l.href} l={l} />
      ))}
    </div>
  );
}

function ItemExtras({ it }: { it: Item }) {
  return (
    <>
      {it.link && <A l={it.link} />}
      {it.links?.map((l) => <A key={l.href} l={l} />)}
      <Sources items={it.sources} />
    </>
  );
}

function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="lp-faq">
      {faqs.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
          <Sources items={f.sources} />
        </details>
      ))}
    </div>
  );
}

/** Lead-form service value for each Glendale service page (?service= on the estimate link, preset on the embedded form). */
const PAGE_SERVICE: Record<string, string> = {
  "roof-repair-glendale-ca": "repair",
  "roof-replacement-glendale-ca": "replacement",
  "roof-installation-glendale-ca": "installation",
  "residential-roofing-glendale-ca": "residential",
  "roof-inspection-glendale-ca": "inspection",
  "tile-roof-repair-glendale-ca": "tile-repair",
  "flat-roof-repair-glendale-ca": "flat-repair",
  "commercial-roofing-glendale-ca": "commercial",
};

export function CtaActions({
  inspectionLabel = "Request a roof inspection",
  service,
}: {
  inspectionLabel?: string;
  service?: string;
}) {
  const estimateHref = service && service !== "inspection" ? `/estimate?service=${service}` : "/estimate";
  return (
    <div className="lp-actions">
      <Link className="button" href={estimateHref} data-analytics="estimate">
        Get a free estimate <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
      <a className="text-link" href={NAP.tel} data-analytics="phone">
        <Phone size={15} aria-hidden="true" /> Call {NAP.phoneDisplay}
      </a>
      <Link className="text-link" href="/estimate?service=inspection" data-analytics="inspection">
        {inspectionLabel} <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function NapBlock() {
  return (
    <address className="lp-nap">
      <strong>{NAP.name}</strong>
      <span>
        <MapPin size={15} aria-hidden="true" /> {NAP.streetAddress}, {NAP.city}, {NAP.region} {NAP.zip}
      </span>
      <a href={NAP.tel}>{NAP.phoneDisplay}</a>
      <a href={NAP.mailto}>{NAP.email}</a>
    </address>
  );
}

function SectionBody({ s, page }: { s: Section; page: LocalPage }) {
  switch (s.type) {
    case "text":
      return (
        <div className="lp-text">
          {s.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      );
    case "cards":
      return (
        <div className="lp-cards">
          {s.body.map((it) => (
            <article key={it.title}>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
              <ItemExtras it={it} />
            </article>
          ))}
        </div>
      );
    case "accordion":
      return (
        <div className="lp-accordion">
          {s.body.map((it) => (
            <details key={it.title}>
              <summary>{it.title}</summary>
              <div>
                <p>{it.text}</p>
                <ItemExtras it={it} />
              </div>
            </details>
          ))}
        </div>
      );
    case "process":
      return (
        <ol className="lp-process">
          {s.body.map((it, i) => (
            <li key={it.title}>
              <span className="lp-step">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
                <ItemExtras it={it} />
              </div>
            </li>
          ))}
        </ol>
      );
    case "comparison":
      return (
        <div className="lp-table" role="region" aria-label={s.heading} tabIndex={0}>
          <table>
            <thead>
              <tr>
                {s.body.columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.body.rows.map((r) => (
                <tr key={r.join("|")}>
                  {r.map((c, i) =>
                    i === 0 ? (
                      <th key={i} scope="row">
                        {c}
                      </th>
                    ) : (
                      <td key={i}>{c}</td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "linklist":
      return (
        <ul className="lp-linklist">
          {s.body.map((l) => (
            <li key={l.href}>
              <A l={l} />
            </li>
          ))}
        </ul>
      );
    case "faq":
      return <FaqList faqs={page.faqs} />;
    case "cta":
      return (
        <div className="lp-cta-copy">
          {s.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <CtaActions inspectionLabel={page.cta.inspectionLabel} service={PAGE_SERVICE[page.slug]} />
        </div>
      );
  }
}

function RelatedCol({ title, items: raw }: { title: string; items?: LinkRef[] }) {
  const items = raw?.filter((l, i, all) => all.findIndex((x) => x.href === l.href) === i);
  if (!items?.length) return null;
  return (
    <div>
      <span className="eyebrow">{title}</span>
      <ul>
        {items.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>{l.anchor}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LocalPageView({ page }: { page: LocalPage }) {
  const eyebrow =
    page.kind === "city"
      ? `SERVICE AREA · ${page.city!.toUpperCase()}, CA`
      : page.crumbs.length === 2
        ? "ROOFING SERVICES · GLENDALE, CA"
        : `GLENDALE, CA · ${page.crumbs[page.crumbs.length - 1].name.toUpperCase()}`;
  const content = page.sections.filter((s) => s.type !== "cta");
  const cta = page.sections.find((s) => s.type === "cta");
  const r = page.related;
  const firstLinks = [r.hub, r.parent].filter((l): l is LinkRef => Boolean(l));
  return (
    <div className={"local-page local-" + page.kind}>
      <section className="lp-hero">
        <div className="page-intro lp-intro">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="lp-h1">{page.h1}</h1>
          <p>{page.support}</p>
          <CtaActions inspectionLabel={page.cta.inspectionLabel} service={PAGE_SERVICE[page.slug]} />
          {firstLinks.length > 0 && (
            <p className="lp-backlinks">
              {firstLinks.map((l, i) => (
                <span key={l.href}>
                  {i > 0 && " · "}
                  <Link href={l.href}>{l.anchor}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
        <aside className="lp-hero-card" aria-label="On this page">
          <span className="eyebrow">ON THIS PAGE</span>
          <ol>
            {content.map((s) => (
              <li key={s.heading}>
                <a href={"#" + slugify(s.heading)}>{s.heading}</a>
              </li>
            ))}
          </ol>
          <p className="lp-trust">{page.trust}</p>
        </aside>
      </section>

      {content.map((s, i) => (
        <section key={s.heading} className={"lp-section lp-s-" + s.type} id={slugify(s.heading)}>
          <div className="lp-head">
            <span className="lp-index">{String(i + 1).padStart(2, "0")} /</span>
            <h2>{s.heading}</h2>
            {s.intro && <p>{s.intro}</p>}
          </div>
          <div className="lp-body">
            <SectionBody s={s} page={page} />
            <Links items={s.links} />
            <Sources items={s.sources} />
          </div>
        </section>
      ))}

      <nav className="lp-related" aria-label="Related pages">
        {r.next && (
          <p className="lp-next">
            <span className="eyebrow">NEXT</span> <A l={r.next} className="lp-next-link" />
          </p>
        )}
        <div className="lp-related-grid">
          <RelatedCol title={page.kind === "city" ? "GLENDALE SERVICE PAGES" : "RELATED SERVICES"} items={[...(r.hub ? [r.hub] : []), ...r.services]} />
          <RelatedCol title="GUIDES" items={r.articles} />
          <RelatedCol title={page.kind === "city" ? "NEARBY CITIES" : "AREAS WE SERVE"} items={r.cities} />
          <RelatedCol title="MORE FROM CITIUM" items={r.pages} />
        </div>
      </nav>

      {cta && (
        <section className="lp-cta" id={slugify(cta.heading)}>
          <div>
            <span className="eyebrow">GET STARTED</span>
            <h2>{cta.heading}</h2>
            <SectionBody s={cta} page={page} />
            <NapBlock />
          </div>
          <div className="lp-form">
            <Inquiry kind="estimate" presetService={PAGE_SERVICE[page.slug]} />
          </div>
        </section>
      )}
    </div>
  );
}
