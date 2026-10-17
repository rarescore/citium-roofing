import { createFileRoute } from "@tanstack/react-router";
import { validateLead, type Lead } from "@/lib/integrations";
import { deliverLead } from "@/lib/send-lead";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, sniffImage } from "@/lib/lead-fields";

const JSON_LIMIT = 12000;
const UPLOAD_LIMIT = 12_000_000;

function knownLead(v: Lead): Lead {
  return {
    kind: v.kind,
    name: v.name,
    email: v.email,
    phone: v.phone,
    address: v.address,
    message: v.message,
    design: v.design,
    service: v.service,
    consent: v.consent,
    website: v.website,
    elapsedMs: v.elapsedMs,
    zip: v.zip,
    urgency: v.urgency,
    contactMethod: v.contactMethod,
    landingPage: v.landingPage,
    trafficSource: v.trafficSource,
    campaign: v.campaign,
    utmMedium: v.utmMedium,
  };
}

async function photosFrom(form: FormData) {
  const files = form.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length > MAX_PHOTOS) throw new Error("You can attach up to 3 photos.");
  const photos: { mime: "image/jpeg" | "image/png" | "image/webp"; bytes: Uint8Array }[] = [];
  for (const file of files) {
    if (file.size > MAX_PHOTO_BYTES) throw new Error("Each photo must be under 4 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffImage(bytes);
    if (!mime) throw new Error("Photos must be JPG, PNG, or WEBP.");
    photos.push({ mime, bytes });
  }
  return photos;
}

function leadFromForm(form: FormData) {
  const elapsed = Number(form.get("elapsedMs"));
  const consent = form.get("consent");
  return validateLead({
    kind: form.get("kind"),
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    address: form.get("address"),
    zip: form.get("zip"),
    message: form.get("message") || "",
    design: form.get("design") || "",
    service: form.get("service") || undefined,
    website: String(form.get("citium_hp") || form.get("website") || ""),
    consent: consent === "1" || consent === "true",
    elapsedMs: elapsed,
    urgency: form.get("urgency") || undefined,
    contactMethod: form.get("contactMethod") || undefined,
    landingPage: form.get("landingPage") || "",
    trafficSource: form.get("trafficSource") || "",
    campaign: form.get("campaign") || "",
    utmMedium: form.get("utmMedium") || "",
  });
}

async function finish(lead: Lead, photos: { mime: "image/jpeg" | "image/png" | "image/webp"; bytes: Uint8Array }[], request: Request) {
  const headers = { "Cache-Control": "no-store" };
  if (lead.website) return Response.json({ error: "Request could not be sent." }, { status: 400, headers });
  try {
    const sent = await deliverLead(lead);
    if (!sent.ok) {
      return Response.json(
        { status: "undelivered", error: "The message did not go through.", message: sent.message },
        { status: 502, headers },
      );
    }
  } catch {
    return Response.json({ status: "undelivered", error: "The message did not go through." }, { status: 502, headers });
  }
  try {
    const { saveDeliveredLead } = await import("@/lib/lead-store.server");
    await saveDeliveredLead(lead, photos);
  } catch {
    /* The office email already went out. A database miss must not turn it into a failed request. */
  }
  try {
    const { recordInquiryGeo } = await import("@/lib/geo-stats.server");
    await recordInquiryGeo(request.headers, lead.zip);
  } catch {
    /* Area totals are optional. */
  }
  return Response.json({ status: "sent" }, { headers });
}

export const Route = createFileRoute("/api/leads")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const type = request.headers.get("content-type") || "";
        const upload = type.includes("multipart/form-data");
        const limit = upload ? UPLOAD_LIMIT : JSON_LIMIT;
        if (Number(request.headers.get("content-length") || 0) > limit) {
          return Response.json({ error: "Request is too large." }, { status: 413, headers });
        }
        try {
          if (upload) {
            const form = await request.formData();
            const photos = await photosFrom(form);
            const lead = leadFromForm(form);
            return finish(knownLead(lead), photos, request);
          }
          const raw = await request.text();
          if (raw.length > JSON_LIMIT) return Response.json({ error: "Request is too large." }, { status: 413, headers });
          const parsed = JSON.parse(raw) as Lead & { citium_hp?: unknown };
          const honeypot = typeof parsed.citium_hp === "string" && parsed.citium_hp.trim() !== "";
          const lead = knownLead(validateLead(parsed));
          if (honeypot) lead.website = "spam";
          return finish(lead, [], request);
        } catch (error) {
          return Response.json(
            { error: error instanceof Error ? error.message : "Check your details." },
            { status: 400, headers },
          );
        }
      },
    },
  },
});
