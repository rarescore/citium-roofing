import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { Header, Footer } from "@/components/site-chrome";
import { MobileCta } from "@/components/mobile-cta";
import { AnalyticsBoot } from "@/components/analytics-boot";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Link } from "@/lib/citium-link";
import { SITE_NAME, siteGraph, jsonLd } from "@/lib/site";
import appCss from "../styles.css?url";

/** True when this render is the global 404 (unknown URL or a route that threw notFound()). */
function isNotFoundRender(matches: ReadonlyArray<unknown>): boolean {
  return matches.some((m) => {
    const x = m as { status?: string; _notFound?: boolean; globalNotFound?: boolean };
    return x.status === "notFound" || x._notFound === true || x.globalNotFound === true;
  });
}

export const Route = createRootRoute({
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...(isNotFoundRender(matches)
        ? [
            { title: `Page Not Found | ${SITE_NAME}` },
            { name: "robots", content: "noindex, follow" },
          ]
        : [{ title: SITE_NAME }]),
      {
        name: "description",
        content:
          "Roof repair, installation and replacement in Glendale, Burbank, Pasadena and nearby cities. Explore roofing systems and request a roof assessment from Citium.",
      },
      { name: "theme-color", content: "#191715" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/images/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      // Display + body fonts used above the fold (hero H1/display line, nav).
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/HTxwL3I-JCGChYJ8VI-L6OO_au7B4-Lw_3E.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  notFoundComponent: NotFound,
  component: RootLayout,
});

function RootLayout() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(siteGraph()) }}
        />
        <a href="#main" className="skip">
          Skip to content
        </a>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <MobileCta />
        <AnalyticsBoot />
        <Scripts />
      </body>
    </html>
  );
}

function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <div className="page-intro">
          <span className="eyebrow">404</span>
          <h1 className="not-found-title">This page is not on the map.</h1>
          <p>The page you requested is not part of the Citium website.</p>
          <Link className="button" href="/">
            Return home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
