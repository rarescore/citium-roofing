import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Header, Footer } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CtaActions, NapBlock } from "@/components/local-page";
import { Link } from "@/lib/citium-link";
import { CITY_CARDS, SERVICE_NAV } from "@/lib/local-pages";
import { pageHead } from "@/lib/site";
import { seoPage, crumbsFor } from "@/lib/pages";

const PATH = "/service-areas";

export const Route = createFileRoute("/service-areas/")({
  head: () => {
    const p = seoPage(PATH)!;
    return pageHead({ title: p.title, description: p.description, path: PATH });
  },
  component: ServiceAreasIndex,
});

function ServiceAreasIndex() {
  const p = seoPage(PATH)!;
  return (
    <>
      <Header />
      <main id="main" className="inner-page page-service-areas">
        <Breadcrumbs items={crumbsFor(PATH)} />
        <div className="local-page local-index">
          <section className="lp-hero">
            <div className="page-intro lp-intro">
              <span className="eyebrow">SERVICE AREAS · SEVEN CITIES</span>
              <h1 className="lp-h1">{p.h1}</h1>
              <p>
                Citium Roofing Solutions is based at 401 N Brand Blvd in Glendale and serves these seven cities. Pick
                yours for local roof types, weather and permit notes, then open the service you need.{" "}
                <Link href="/about">Who we are</Link>.
              </p>
              <CtaActions />
            </div>
            <aside className="lp-hero-card" aria-label="Contact">
              <span className="eyebrow">OUR OFFICE</span>
              <NapBlock />
            </aside>
          </section>
          <section className="lp-section lp-s-cities" id="cities">
            <div className="lp-head">
              <span className="lp-index">01 /</span>
              <h2>Cities we serve</h2>
            </div>
            <div className="lp-body">
              <div className="lp-city-grid">
                {CITY_CARDS.map((c, i) => (
                  <Link key={c.slug} className="lp-city-card" href={`/service-areas/${c.slug}`}>
                    <span className="lp-index">{String(i + 1).padStart(2, "0")}</span>
                    <h3>{c.city}, CA</h3>
                    <p>{c.note}</p>
                    <span className="lp-link">
                      Roofing in {c.city} <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <section className="lp-section lp-s-linklist" id="services">
            <div className="lp-head">
              <span className="lp-index">02 /</span>
              <h2>Roofing services</h2>
              <p>Every city page routes to the same service guides, written for our Glendale base.</p>
            </div>
            <div className="lp-body">
              <ul className="lp-linklist">
                {SERVICE_NAV.map((l) => (
                  <li key={l.href}>
                    <Link className="lp-link" href={l.href}>
                      {l.anchor} <ArrowUpRight size={16} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
