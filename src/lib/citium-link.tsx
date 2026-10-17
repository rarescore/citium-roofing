import { Link as RouterLink } from "@tanstack/react-router";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  children?: ReactNode;
};

/**
 * Internal link wrapper. Routes:
 *   /                       → /
 *   /articles[/...]         → /articles or /articles/$slug
 *   /service-areas[/...]    → /service-areas or /service-areas/$city
 *   /projects/$slug         → /projects/$slug (future detail pages)
 *   /anything-else          → /$slug (flat pageInfo pages)
 *
 * External / mailto / tel / hash links stay as plain <a>.
 * Nested paths with a slash after the first segment fall through as a plain
 * <a href> so future explicit file routes work without this wrapper knowing them.
 */
export function Link({ href, children, ...rest }: Props) {
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#")
  ) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  const [pathAndQuery, hash] = href.split("#");
  const [pathname, query] = pathAndQuery.split("?");
  const params = query ? Object.fromEntries(new URLSearchParams(query)) : {};
  // /$slug validates { address?, design?, service? }; undefined values are omitted from the URL.
  const search = {
    address: typeof params.address === "string" ? params.address : undefined,
    design: typeof params.design === "string" ? params.design : undefined,
    service: typeof params.service === "string" ? params.service : undefined,
  };

  if (pathname === "/" || pathname === "") {
    return (
      <RouterLink to="/" hash={hash} {...rest}>
        {children}
      </RouterLink>
    );
  }

  if (pathname === "/articles") {
    return (
      <RouterLink to="/$slug" params={{ slug: "articles" }} search={search} hash={hash} {...rest}>
        {children}
      </RouterLink>
    );
  }

  if (pathname.startsWith("/articles/")) {
    return (
      <RouterLink
        to="/articles/$slug"
        params={{ slug: pathname.replace("/articles/", "") }}
        hash={hash}
        {...rest}
      >
        {children}
      </RouterLink>
    );
  }

  if (pathname === "/service-areas") {
    return (
      <RouterLink to="/service-areas" hash={hash} {...rest}>
        {children}
      </RouterLink>
    );
  }

  if (/^\/service-areas\/[a-z0-9-]+$/.test(pathname)) {
    return (
      <RouterLink
        to="/service-areas/$city"
        params={{ city: pathname.replace("/service-areas/", "") }}
        hash={hash}
        {...rest}
      >
        {children}
      </RouterLink>
    );
  }

  // Other nested paths (/projects/foo): plain <a> so the
  // real file route wins without forcing everything through /$slug.
  const restPath = pathname.replace(/^\//, "");
  if (restPath.includes("/")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink to="/$slug" params={{ slug: restPath }} search={search} hash={hash} {...rest}>
      {children}
    </RouterLink>
  );
}
