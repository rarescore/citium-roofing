import { Link } from "@/lib/citium-link";
import { absoluteUrl, jsonLd } from "@/lib/site";
import type { Crumb } from "@/lib/pages";

/** Builds schema.org BreadcrumbList data for a trail of crumbs. */
export function breadcrumbSchema(items: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/**
 * Visible, crawlable breadcrumb trail (plain <a href> links rendered on the
 * server) plus matching BreadcrumbList JSON-LD. The last crumb is the current
 * page and is not linked.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.path + i}>
                {last ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <>
                    <Link href={c.path}>{c.name}</Link>
                    <span className="breadcrumb-sep" aria-hidden="true">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema(items)) }} />
    </>
  );
}
