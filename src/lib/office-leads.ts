import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { isLeadStage } from "@/lib/lead-fields";
import type { StoredLead } from "@/lib/lead-store.server";

export type OfficeBoard = { authorized: boolean; rows: StoredLead[] };

export const loadOfficeLeads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<OfficeBoard> => {
    const { assertStaff, listLeads } = await import("@/lib/lead-store.server");
    await assertStaff(context.bearerToken);
    try {
      return { authorized: true, rows: await listLeads() };
    } catch {
      return { authorized: true, rows: [] };
    }
  });

export const updateOfficeLead = createServerFn({ method: "POST" })
  .validator((data: { id: string; stage: string }) => data)
  .middleware([authMiddleware])
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    if (!isLeadStage(data.stage)) return { ok: false };
    const { assertStaff, updateLeadStage } = await import("@/lib/lead-store.server");
    const staffId = await assertStaff(context.bearerToken);
    const ok = await updateLeadStage(data.id, data.stage, staffId);
    return { ok };
  });
