import { createFileRoute, notFound } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { ArticleBody } from "@/components/inner-pages";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { articles } from "@/lib/content";
import { pageHead, absoluteUrl, jsonLd, SITE_NAME, faqSchema, organizationRef, DEFAULT_OG_IMAGE } from "@/lib/site";
import { crumbsFor } from "@/lib/pages";

export const Route = createFileRoute("/articles/$slug")({
  beforeLoad: ({ params }) => {
    if (!articles.find((a) => a.slug === params.slug)) throw notFound();
  },
  head: ({ params }) => {
    const a = articles.find((x) => x.slug === params.slug);
    if (!a) return { meta: [{ title: "Article not found" }] };
    const title = a.seoTitle || `${a.title} | ${SITE_NAME}`;
    return pageHead({
      title,
      description: a.description,
      path: `/articles/${a.slug}`,
      image: a.image?.src,
      imageAlt: a.image?.alt,
      type: "article",
      extraMeta: [
        { property: "article:published_time", content: a.publishedAt },
        { property: "article:modified_time", content: a.updatedAt || a.publishedAt },
      ],
    });
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const a = articles.find((x) => x.slug === slug)!;
  const crumbs = [
    ...crumbsFor("/articles").slice(0, -1),
    { name: "Resources", path: "/articles" },
    { name: a.title, path: `/articles/${a.slug}` },
  ];
  const org = organizationRef();
  const schemas: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.description,
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      author: org,
      publisher: org,
      image: a.image ? absoluteUrl(a.image.src) : DEFAULT_OG_IMAGE,
      mainEntityOfPage: absoluteUrl(`/articles/${a.slug}`),
      inLanguage: "en-US",
    },
  ];
  const faq = a.faqs ? faqSchema(a.faqs) : null;
  if (faq) schemas.push(faq);
  return (
    <>
      <Header />
      <main id="main">
        <Breadcrumbs items={crumbs} />
        <ArticleBody slug={slug} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schemas) }}
        />
      </main>
      <Footer />
    </>
  );
}
