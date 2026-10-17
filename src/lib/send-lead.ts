import { serviceLabel, type Lead } from "@/lib/integrations";

const COMPANY_EMAIL = "citiuminc@gmail.com";

function bodyText(lead: Lead) {
  return [
    `New ${lead.kind} inquiry from the Citium website`,
    "",
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Property: ${lead.address}`,
    lead.service ? `Service: ${serviceLabel(lead.service)}` : "",
    lead.design ? `Roof design: ${lead.design}` : "",
    lead.message ? `Message:\n${lead.message}` : "",
    "",
    `Received: ${new Date().toISOString()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendResend(lead: Lead) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Citium Website <onboarding@resend.dev>",
      to: [COMPANY_EMAIL],
      reply_to: lead.email,
      subject: `Citium website · ${lead.kind} · ${lead.name}`,
      text: bodyText(lead),
    }),
    signal: AbortSignal.timeout(10000),
  });
  return res.ok;
}

async function sendWebhook(lead: Lead) {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  const token = process.env.LEAD_WEBHOOK_TOKEN?.trim();
  if (!url) return false;
  if (new URL(url).protocol !== "https:") return false;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ version: 1, lead: { ...lead, website: undefined }, receivedAt: new Date().toISOString() }),
    signal: AbortSignal.timeout(10000),
  });
  return res.ok;
}

async function sendFormSubmit(lead: Lead) {
  const form = new FormData();
  form.set("_subject", `Citium website · ${lead.kind} · ${lead.name}`);
  form.set("_template", "table");
  form.set("_captcha", "false");
  form.set("_replyto", lead.email);
  form.set("name", lead.name);
  form.set("email", lead.email);
  form.set("phone", lead.phone);
  form.set("address", lead.address);
  form.set("kind", lead.kind);
  form.set("service", serviceLabel(lead.service));
  form.set("design", lead.design || "");
  form.set("message", lead.message || "");
  const res = await fetch(`https://formsubmit.co/ajax/${COMPANY_EMAIL}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Referer: "https://www.citiumroofing.com/",
      Origin: "https://www.citiumroofing.com",
    },
    body: form,
    signal: AbortSignal.timeout(12000),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  const ok = res.ok && (data.success === true || data.success === "true");
  return { ok, message: data.message || "" };
}

export async function deliverLead(lead: Lead) {
  const formSubmit = await sendFormSubmit(lead).catch(() => ({ ok: false, message: "" }));
  if (formSubmit.ok) return { ok: true, message: "" };
  const attempts = await Promise.allSettled([sendResend(lead), sendWebhook(lead)]);
  const ok = attempts.some((r) => r.status === "fulfilled" && r.value === true);
  return { ok, message: formSubmit.message };
}
