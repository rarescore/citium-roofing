import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { loadMarketing, saveJobRevenue } from "@/lib/office-marketing";
import type { CountRow, MarketingReport } from "@/lib/marketing-types";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/office/marketing")({
  loader: () => loadMarketing(),
  head: () =>
    pageHead({
      title: "Marketing | Citium Roofing",
      description: "Private marketing numbers for Citium Roofing.",
      path: "/office/marketing",
      index: false,
    }),
  component: MarketingPage,
});

function money(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function Rows({ rows, empty }: { rows: CountRow[]; empty: string }) {
  if (!rows.length) return <p className="dash-empty">{empty}</p>;
  return (
    <table className="area-table">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Gate() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/office/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(body.error || "Sign-in failed.");
      return;
    }
    setError("");
    await router.invalidate();
  }
  return (
    <form className="inquiry-form dash-gate" onSubmit={submit}>
      <span className="eyebrow">OFFICE</span>
      <h1>Marketing</h1>
      <p>The password is checked on the server. Opening this address is not enough.</p>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Open the dashboard"}
      </button>
    </form>
  );
}

function Dashboard({ report }: { report: MarketingReport }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  async function signOut() {
    await fetch("/api/office/session", { method: "DELETE" });
    await router.invalidate();
  }
  async function saveRevenue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await saveJobRevenue({
      data: { id: String(form.get("id") || ""), amount: String(form.get("amount") || "") },
    }).catch(() => ({ ok: false }));
    setNote(result.ok ? "Revenue saved." : "That amount was not saved.");
    if (result.ok) await router.invalidate();
  }
  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <span className="eyebrow">OFFICE</span>
          <h1>Marketing</h1>
        </div>
        <button className="button" type="button" onClick={signOut}>
          Sign out
        </button>
      </div>
      <div className="dash-grid">
        <section className="dash-card">
          <h2>Visitors</h2>
          {report.visitors.state === "value" ? (
            <>
              <p className="dash-metric">{report.visitors.value}</p>
              <p className="dash-empty">{report.visitors.note}</p>
            </>
          ) : (
            <p className="dash-empty">{report.visitors.reason}</p>
          )}
          <h3>Traffic sources</h3>
          <Rows rows={report.trafficSources} empty={report.trafficNote} />
          {report.trafficSources.length ? <p className="dash-empty">{report.trafficNote}</p> : null}
        </section>
        <section className="dash-card">
          <h2>Estimated city</h2>
          <Rows rows={report.cities} empty={report.citiesNote} />
          {report.cities.length ? <p className="dash-empty">{report.citiesNote}</p> : null}
        </section>
        <section className="dash-card">
          <h2>Service pages</h2>
          {report.pages.state === "value" ? (
            <Rows rows={report.pages.rows} empty="No service-page views in this report." />
          ) : (
            <p className="dash-empty">{report.pages.reason}</p>
          )}
        </section>
        <section className="dash-card">
          <h2>Calls and estimates</h2>
          {report.phoneClicks.state === "value" ? (
            <p className="dash-metric">
              {report.phoneClicks.value} <span>phone clicks</span>
            </p>
          ) : (
            <p className="dash-empty">{report.phoneClicks.reason}</p>
          )}
          <p className="dash-metric">
            {report.estimateRequests} <span>estimate requests</span>
          </p>
          <p className="dash-empty">Estimate requests are delivered forms in the lead database.</p>
        </section>
        <section className="dash-card">
          <h2>Landing pages</h2>
          {report.landing.length ? (
            <table className="area-table">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Requests</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {report.landing.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{row.leads}</td>
                    <td>Not available</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="dash-empty">No delivered requests yet.</p>
          )}
          <p className="dash-empty">{report.landingNote}</p>
        </section>
        <section className="dash-card">
          <h2>Lead sources</h2>
          <table className="area-table">
            <tbody>
              <tr>
                <th scope="row">Google</th>
                <td>{report.channels.google}</td>
              </tr>
              <tr>
                <th scope="row">Facebook</th>
                <td>{report.channels.facebook}</td>
              </tr>
              <tr>
                <th scope="row">Instagram</th>
                <td>{report.channels.instagram}</td>
              </tr>
              <tr>
                <th scope="row">Organic search</th>
                <td>{report.channels.organic}</td>
              </tr>
            </tbody>
          </table>
          <p className="dash-empty">Counted from delivered requests. Direct visits are not called organic.</p>
        </section>
        <section className="dash-card">
          <h2>Form abandonment</h2>
          {report.abandonment.state === "value" ? (
            <>
              <p className="dash-metric">{report.abandonment.abandoned}</p>
              <p className="dash-empty">
                {report.abandonment.started} starts, {report.abandonment.submitted} lead events. {report.abandonment.note}
              </p>
            </>
          ) : (
            <p className="dash-empty">{report.abandonment.reason}</p>
          )}
        </section>
        <section className="dash-card">
          <h2>Campaigns</h2>
          <Rows rows={report.campaigns} empty="No delivered requests yet." />
        </section>
        <section className="dash-card">
          <h2>Leads by city</h2>
          <Rows rows={report.leadCities} empty="No delivered requests yet." />
          <p className="dash-empty">City comes from the ZIP the customer typed, not from the connection.</p>
        </section>
        <section className="dash-card">
          <h2>Inspections and jobs</h2>
          <p className="dash-metric">
            {report.inspections} <span>inspections booked</span>
          </p>
          <p className="dash-metric">
            {report.won} <span>jobs won</span>
          </p>
          <p className="dash-empty">Taken from the lead stage. Move a request on the lead board to change these.</p>
        </section>
        <section className="dash-card">
          <h2>Revenue by campaign</h2>
          {report.revenue.length ? (
            <table className="area-table">
              <tbody>
                {report.revenue.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    <td>{money(row.cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="dash-empty">{report.revenueNote}</p>
          )}
          {report.wonJobs.map((job) => (
            <form key={job.id} className="dash-revenue" onSubmit={saveRevenue}>
              <input type="hidden" name="id" value={job.id} />
              <label>
                {job.name} · {job.campaign}
                <input name="amount" inputMode="decimal" placeholder={job.cents == null ? "Enter revenue" : money(job.cents)} />
              </label>
              <button className="button" type="submit">
                Save
              </button>
            </form>
          ))}
          {note ? <p role="status">{note}</p> : null}
        </section>
      </div>
    </div>
  );
}

function MarketingPage() {
  const report = Route.useLoaderData();
  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        {report ? <Dashboard report={report} /> : <Gate />}
      </main>
      <Footer />
    </>
  );
}
