import { randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";
import type { Lead } from "@/lib/integrations";
import { isLeadStage, type LeadStage } from "@/lib/lead-fields";
import { DEV_USER_ID, UnauthorizedError, getSessionUser, requireUserId } from "@/lib/auth/verify.server";
import { adminCookieValid } from "@/lib/admin-session.server";

export type StoredPhoto = { id: string; contentType: string; byteSize: number };
export type StoredLead = {
  id: string;
  stage: LeadStage;
  kind: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  service: string;
  urgency: string;
  contactMethod: string;
  message: string;
  landingPage: string;
  trafficSource: string;
  campaign: string;
  utmMedium: string;
  submittedAt: string;
  photos: StoredPhoto[];
};

type PhotoIn = { mime: "image/jpeg" | "image/png" | "image/webp"; bytes: Uint8Array };

/** Office cookie, or a signed-in staff email. The shared dev user is not enough. */
export async function assertStaff(bearerToken?: string): Promise<string> {
  if (adminCookieValid()) return "office";
  const userId = await requireUserId(bearerToken);
  if (userId === DEV_USER_ID) throw new UnauthorizedError();
  const user = await getSessionUser(bearerToken);
  const allow = (process.env.STAFF_EMAILS || "citiuminc@gmail.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (!user?.email || !allow.includes(user.email.toLowerCase())) throw new UnauthorizedError();
  return userId;
}

export async function saveDeliveredLead(lead: Lead, photos: PhotoIn[]): Promise<string> {
  const sql = await getSql();
  const id = randomUUID();
  await sql`
    insert into leads (
      id, stage, kind, name, email, phone, address, zip, service, urgency, contact_method,
      message, landing_page, traffic_source, campaign, utm_medium, submitted_at
    ) values (
      ${id}, 'new', ${lead.kind}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.address},
      ${lead.zip || ""}, ${lead.service || ""}, ${lead.urgency || "standard"}, ${lead.contactMethod || "phone"},
      ${lead.message || ""}, ${lead.landingPage || ""}, ${lead.trafficSource || "direct"},
      ${lead.campaign || ""}, ${lead.utmMedium || ""}, now()
    )
  `;
  for (const photo of photos) {
    await sql`
      insert into lead_photos (id, lead_id, content_type, byte_size, data)
      values (${randomUUID()}, ${id}, ${photo.mime}, ${photo.bytes.byteLength}, ${photo.bytes})
    `;
  }
  return id;
}

function text(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return value == null ? "" : String(value);
}

export async function listLeads(): Promise<StoredLead[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    stage: string;
    kind: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    zip: string;
    service: string;
    urgency: string;
    contact_method: string;
    message: string;
    landing_page: string;
    traffic_source: string;
    campaign: string;
    utm_medium: string;
    submitted_at: unknown;
  }>`
    select id, stage, kind, name, email, phone, address, zip, service, urgency, contact_method,
      message, landing_page, traffic_source, campaign, utm_medium, submitted_at
    from leads
    order by submitted_at desc
    limit 100
  `;
  const photos = await sql<{ id: string; lead_id: string; content_type: string; byte_size: number | string }>`
    select id, lead_id, content_type, byte_size from lead_photos
  `;
  const byLead = new Map<string, StoredPhoto[]>();
  for (const photo of photos) {
    const list = byLead.get(photo.lead_id) || [];
    list.push({ id: photo.id, contentType: photo.content_type, byteSize: Number(photo.byte_size) });
    byLead.set(photo.lead_id, list);
  }
  return rows.map((row) => ({
    id: row.id,
    stage: isLeadStage(row.stage) ? row.stage : "new",
    kind: row.kind,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    zip: row.zip,
    service: row.service,
    urgency: row.urgency,
    contactMethod: row.contact_method,
    message: row.message,
    landingPage: row.landing_page,
    trafficSource: row.traffic_source,
    campaign: row.campaign,
    utmMedium: row.utm_medium,
    submittedAt: text(row.submitted_at),
    photos: byLead.get(row.id) || [],
  }));
}

export async function updateLeadStage(id: string, stage: LeadStage, staffId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update leads set
      stage = ${stage},
      updated_by = ${staffId},
      updated_at = now(),
      inspection_booked_at = case
        when ${stage} in ('inspection', 'estimate', 'won') and inspection_booked_at is null then now()
        else inspection_booked_at
      end,
      won_at = case when ${stage} = 'won' then coalesce(won_at, now()) else null end
    where id = ${id}
    returning id
  `;
  return rows.length > 0;
}

export async function setLeadRevenue(id: string, cents: number, staffId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return false;
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update leads set revenue_cents = ${cents}, updated_by = ${staffId}, updated_at = now()
    where id = ${id} and stage = 'won'
    returning id
  `;
  return rows.length > 0;
}

export async function readLeadPhoto(id: string): Promise<{ mime: string; bytes: Uint8Array } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const sql = await getSql();
  const rows = await sql<{ content_type: string; data: Uint8Array }>`
    select content_type, data from lead_photos where id = ${id} limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  const bytes = row.data instanceof Uint8Array ? row.data : new Uint8Array(row.data);
  return { mime: row.content_type, bytes };
}
