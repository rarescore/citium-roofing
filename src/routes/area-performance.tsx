import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { loadAreaStats } from "@/lib/area-stats";
import { pageHead } from "@/lib/site";
import { seoPage } from "@/lib/pages";

const PATH = "/area-performance";

export const Route = createFileRoute("/area-performance")({
  loader: () => loadAreaStats(),
  head: () => {
    const page = seoPage(PATH)!;
    return pageHead({ title: page.title, description: page.description, path: PATH, index: false });
  },
  component: AreaPerformancePage,
});

function AreaPerformancePage() {
  const data = Route.useLoaderData();
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <div className="page-intro">
          <span className="eyebrow">SERVICE AREAS</span>
          <h1>Estimated visits and inquiries</h1>
          <p>
            Cities are estimates from the connection, not street addresses. A VPN or mobile network can place a visit
            in another city. Local development has no location, so those visits count as unknown. Customer ZIP codes
            are counted only after someone types one on the estimate form. This table does not list people, IP
            addresses, or exact locations.
          </p>
        </div>
        <div className="prose">
          {!data.available ? <p>Area totals are not available right now.</p> : null}
          <table className="area-table">
            <caption>Aggregate performance by service area</caption>
            <thead>
              <tr>
                <th scope="col">Area</th>
                <th scope="col">Estimated visits</th>
                <th scope="col">Estimated inquiries</th>
                <th scope="col">Inquiries with a typed ZIP</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{row.label}</th>
                  <td>{row.visits}</td>
                  <td>{row.inquiries}</td>
                  <td>{row.zipInquiries}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Visits are counted only after analytics cookies are allowed. Inquiries are counted when a form is sent.
            Cities outside Glendale, Burbank, Pasadena, La Crescenta, Tujunga, Sunland, and Alhambra are grouped as
            outside the service area and are not stored individually.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
