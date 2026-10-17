import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { InnerPage } from "@/components/inner-pages";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LocalPageView } from "@/components/local-page";
import { company, pageInfo, services } from "@/lib/content";
import { SERVICE_PAGES } from "@/lib/local-pages";
import { pageHead, absoluteUrl, jsonLd, BUSINESS_ID, faqSchema, serviceSchema } from "@/lib/site";
import { seoPage, crumbsFor } from "@/lib/pages";

export const Route = createFileRoute("/$slug")({
  validateSearch: (s: Record<string, unknown>) => ({
    address: typeof s.address === "string" ? s.address : undefined,
    design: typeof s.design === "string" ? s.design : undefined,
    service: typeof s.service === "string" ? s.service : undefined,
  }),
  beforeLoad: ({ params }) => {
    if (!pageInfo[params.slug] && !seoPage("/" + params.slug)) {
      throw notFound();
    }
  },
  // Glendale service pages load their copy on demand (one chunk per page).
  loader: async ({ params }) => {
    const load = SERVICE_PAGES[params.slug];
    return { local: load ? (await load()).default : null };
  },
  head: ({ params }) => {
    const p = seoPage("/" + params.slug);
    if (!p) return { meta: [{ title: "Page not found" }] };
    return pageHead({
      title: p.title,
      description: p.description,
      path: p.path,
      index: p.index !== false,
    });
  },
  component: SlugPage,
});

function SlugPage() {
  const { slug } = Route.useParams();
  const { local } = Route.useLoaderData();
  const p = seoPage("/" + slug);
  if (!p) return null;
  const crumbs = crumbsFor(p.path);
  const schemas: unknown[] = [];
  if (local) {
    schemas.push(serviceSchema({ path: p.path, ...local.service }));
    const faq = faqSchema(local.faqs);
    if (faq) schemas.push(faq);
  } else {
    const service = services.find((s) => s.slug === slug);
    if (service && p.index !== false) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.name,
        serviceType: service.name,
        description: p.description,
        areaServed: company.area.map((city) => ({ "@type": "City", name: `${city}, CA` })),
        provider: { "@id": BUSINESS_ID },
        url: absoluteUrl("/" + slug),
      });
    }
  }
  return (
    <>
      <Header />
      <main id="main" className={"inner-page page-" + slug}>
        <Breadcrumbs items={crumbs} />
        {local ? <LocalPageView page={local} /> : <InnerPage slug={slug} />}
        {schemas.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
