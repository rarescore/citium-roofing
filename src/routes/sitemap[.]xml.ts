import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/site";
import { sitemapEntries } from "@/lib/pages";

/**
 * Generated sitemap. Driven by src/lib/pages.ts (seoPages) + articles.
 * To add a page: add an entry to seoPages (or a new article in
 * src/lib/articles/). Do NOT hand-edit this file.
 */
function buildXml(): string {
  const urls = sitemapEntries()
    .map((e) => {
      const loc = e.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${e.path}`;
      const lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : "";
      const changefreq = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : "";
      const priority =
        e.priority != null ? `\n    <priority>${e.priority.toFixed(1)}</priority>` : "";
      return `  <url>\n    <loc>${loc}</loc>${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildXml(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
