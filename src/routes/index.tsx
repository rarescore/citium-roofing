import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import CinematicHome from "@/components/cinematic-home";
import { JOB_POSTER_PRELOAD } from "@/lib/premium-media";
import { pageHead } from "@/lib/site";
import { seoPage } from "@/lib/pages";

const page = seoPage("/")!;

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({ title: page.title, description: page.description, path: "/" });
    // Poster-first hero (ee68903): preload the LCP poster.
    return { ...head, links: [...head.links, { rel: "preload", as: "image", href: JOB_POSTER_PRELOAD }] };
  },
  component: Home,
});

function Home() {
  return (
    <div className="cinematic-page">
      <Header />
      <main id="main">
        <CinematicHome />
      </main>
      <Footer />
    </div>
  );
}
