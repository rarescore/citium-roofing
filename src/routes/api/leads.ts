import { createFileRoute } from "@tanstack/react-router";
import { validateLead, type Lead } from "@/lib/integrations";
import { deliverLead } from "@/lib/send-lead";

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        if (Number(request.headers.get("content-length") || 0) > 12000) {
          return Response.json({ error: "Request is too large." }, { status: 413, headers });
        }
        let lead: Lead;
        let honeypot = false;
        try {
          const raw = await request.text();
          if (raw.length > 12000) {
            return Response.json({ error: "Request is too large." }, { status: 413, headers });
          }
          const v = validateLead(JSON.parse(raw));
          const hp = (v as { citium_hp?: unknown }).citium_hp;
          honeypot = typeof hp === "string" && hp.trim() !== "";
          // Forward only known fields (including the optional service) to the lead email/webhook.
          lead = {
            kind: v.kind, name: v.name, email: v.email, phone: v.phone, address: v.address,
            message: v.message, design: v.design, service: v.service, consent: v.consent,
            website: v.website, elapsedMs: v.elapsedMs,
          };
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Check your details." },
            { status: 400, headers },
          );
        }
        const spam = Boolean(lead.website) || honeypot;
        if (spam) {
          return Response.json({ error: "Request could not be sent." }, { status: 400, headers });
        }
        try {
          const sent = await deliverLead(lead);
          if (sent.ok) return Response.json({ status: "sent" }, { headers });
          return Response.json(
            { status: "undelivered", error: "The message did not go through.", message: sent.message },
            { status: 502, headers },
          );
        } catch {
          return Response.json(
            { status: "undelivered", error: "The message did not go through." },
            { status: 502, headers },
          );
        }
      },
    },
  },
});
