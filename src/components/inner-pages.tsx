import { Link } from "@/lib/citium-link";
import { Projects, ArticleIndex } from "@/components/site-experiences";
import { pageInfo, services, articles } from "@/lib/content";
import { Intro, FormPage } from "@/components/inner-forms";
import { seoPage } from "@/lib/pages";
import { Service, Catalog, StudioPage, Systems } from "@/components/inner-services";
import { Process, Warranty, About, Faq, Terms, Privacy } from "@/components/inner-story";

export { StudioPage } from "@/components/inner-services";

export function InnerPage({ slug }: { slug: string }) {
  const p = pageInfo[slug];
  const service = services.find((s) => s.slug === slug);
  if (!p) return null;
  return (
    <>
      {service ? (
        <Service slug={slug} />
      ) : slug === "roofing-systems" ? (
        <Systems />
      ) : slug === "projects" ? (
        <>
          <Intro
            tag="DESIGN EXAMPLES"
            title={"Roof looks to\nexplore near you."}
            copy="Illustrative before-and-after roof visualizations across Glendale-area home styles. Drag the photo to compare looks, then request an estimate for your property."
            h1={seoPage("/projects")?.h1}
          />
          <Projects />
        </>
      ) : slug === "design-your-roof" ? (
        <StudioPage />
      ) : slug === "estimate" ? (
        <FormPage kind="estimate" />
      ) : slug === "financing" ? (
        <FormPage kind="financing" />
      ) : slug === "contact" ? (
        <FormPage kind="contact" />
      ) : slug === "customer-service" ? (
        <FormPage kind="service" />
      ) : slug === "installation-process" ? (
        <Process />
      ) : slug === "warranty" ? (
        <Warranty />
      ) : slug === "about" ? (
        <About />
      ) : slug === "articles" ? (
        <>
          <Intro
            tag="ROOFING RESOURCES"
            title={"A little knowledge.\nA better decision."}
            copy="Guides for Glendale and Los Angeles homeowners: replacement cost, Cool Roofs, tile, wind, and how a reroof actually happens."
            h1={seoPage("/articles")?.h1}
          />
          <ArticleIndex />
        </>
      ) : slug === "faq" ? (
        <Faq />
      ) : slug === "terms" ? (
        <Terms />
      ) : slug === "privacy" ? (
        <Privacy />
      ) : null}

    </>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });

export function ArticleBody({ slug }: { slug: string }) {
  const a = articles.find((x) => x.slug === slug);
  if (!a) return null;
  return (
    <article className="prose article-body">
      <span className="eyebrow">{a.category}</span>
      <h1>{a.title}</h1>
      <p>
        {a.author.name} ·{" "}
        <time dateTime={a.publishedAt}>{fmtDate(a.publishedAt)}</time>
        {a.updatedAt && a.updatedAt !== a.publishedAt && (
          <>
            {" "}
            · Updated <time dateTime={a.updatedAt}>{fmtDate(a.updatedAt)}</time>
          </>
        )}
      </p>
      {a.image && (
        <picture>
          <source
            type="image/webp"
            srcSet={[800, 1200, 1600].map((w) => `${a.image!.src.replace("1600.jpg", `${w}.webp`)} ${w}w`).join(", ")}
            sizes="(max-width: 900px) 100vw, 900px"
          />
          <img src={a.image.src} alt={a.image.alt} width="1600" height="1067" fetchPriority="high" decoding="async" />
        </picture>
      )}
      {a.html ? (
        <div className="article-html" dangerouslySetInnerHTML={{ __html: a.html }} />
      ) : (
        a.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))
      )}
      {a.relatedArticles.length > 0 && !a.html?.includes('class="related-links"') && (
        <section className="related-links">
          <span className="eyebrow">KEEP READING</span>
          {a.relatedArticles.map((slug) => {
            const r = articles.find((x) => x.slug === slug);
            return r ? (
              <Link key={slug} href={"/articles/" + slug}>
                {r.title} ↗
              </Link>
            ) : null;
          })}
        </section>
      )}
    </article>
  );
}
