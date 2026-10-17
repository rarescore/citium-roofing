import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LocalPageView } from "@/components/local-page";
import { CITY_PAGES } from "@/lib/local-pages";
import { pageHead, jsonLd, faqSchema, serviceSchema } from "@/lib/site";
import { seoPage, crumbsFor } from "@/lib/pages";

export const Route = createFileRoute("/service-areas/$city")({
  beforeLoad: ({ params }) => {
    if (!CITY_PAGES[params.city] || !seoPage(`/service-areas/${params.city}`)) throw notFound();
  },
  loader: async ({ params }) => ({ page: (await CITY_PAGES[params.city]!()).default }),
  head: ({ params }) => {
    const p = seoPage(`/service-areas/${params.city}`);
    if (!p) return { meta: [{ title: "Page not found" }] };
    return pageHead({ title: p.title, description: p.description, path: p.path });
  },
  component: CityPage,
});

function CityPage() {
  const { page } = Route.useLoaderData();
  const p = seoPage(page.path)!;
  const schemas: unknown[] = [serviceSchema({ path: p.path, ...page.service })];
  const faq = faqSchema(page.faqs);
  if (faq) schemas.push(faq);
  return (
    <>
      <Header />
      <main id="main" className={"inner-page page-city page-city-" + page.slug}>
        <Breadcrumbs items={crumbsFor(p.path)} />
        <LocalPageView page={page} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }} />
      </main>
      <Footer />
    </>
  );
}
