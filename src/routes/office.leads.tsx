import { Link } from "@/lib/citium-link";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header, Footer } from "@/components/site-chrome";
import { LEAD_STAGES, isLeadStage } from "@/lib/lead-fields";
import { loadOfficeLeads, updateOfficeLead, type OfficeBoard } from "@/lib/office-leads";
import { pageHead } from "@/lib/site";

export const Route = createFileRoute("/office/leads")({
  loader: async (): Promise<OfficeBoard> => {
    try {
      return await loadOfficeLeads();
    } catch {
      return { authorized: false, rows: [] };
    }
  },
  head: () =>
    pageHead({
      title: "Lead board | Citium Roofing",
      description: "Staff-only lead stages for Citium Roofing. Not for public indexing.",
      path: "/office/leads",
      index: false,
    }),
  component: OfficeLeads,
});

function OfficeLeads() {
  const initial = Route.useLoaderData();
  const [rows, setRows] = useState(initial.rows);
  const [note, setNote] = useState("");

  async function change(id: string, stage: string) {
    setNote("");
    const result = await updateOfficeLead({ data: { id, stage } }).catch(() => ({ ok: false }));
    if (!result.ok || !isLeadStage(stage)) {
      setNote("That stage was not saved.");
      return;
    }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, stage } : row)));
  }

  return (
    <>
      <Header />
      <main id="main" className="inner-page">
        <div className="page-intro">
          <span className="eyebrow">OFFICE</span>
          <h1>Lead board</h1>
          <p>Stages move from a new inquiry to contacted, inspection booked, estimate sent, then job won or lost.</p>
        </div>
        <div className="prose">
          {!initial.authorized ? (
            <p>
              This board is locked. Open it with the office password on <Link href="/office/marketing">Marketing</Link>, or
              with a staff account once sign-in is turned on.
            </p>
          ) : null}
          {note ? <p role="alert">{note}</p> : null}
          {initial.authorized && rows.length === 0 ? <p>No delivered requests yet.</p> : null}
          {rows.map((row) => (
            <article key={row.id} className="office-lead">
              <h2>
                {row.name} · {row.urgency === "emergency" ? "Emergency leak" : "Standard request"}
              </h2>
              <p>
                {row.phone} · {row.email} · prefers {row.contactMethod}
              </p>
              <p>
                {row.address}
                {row.zip ? `, ${row.zip}` : ""}
              </p>
              <p>
                {row.service || "Service not chosen"} · {row.kind} · {new Date(row.submittedAt).toLocaleString()}
              </p>
              <p>
                {row.trafficSource || "direct"}
                {row.campaign ? ` · ${row.campaign}` : ""} · {row.landingPage || "landing page not recorded"}
              </p>
              {row.message ? <p>{row.message}</p> : null}
              <label>
                Stage
                <select value={row.stage} onChange={(event) => change(row.id, event.target.value)}>
                  {LEAD_STAGES.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {row.photos.length > 0 ? (
                <div className="office-photos">
                  {row.photos.map((photo) => (
                    <img key={photo.id} src={`/api/office/lead-photo/${photo.id}`} alt="Roof photo submitted with the request" />
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
