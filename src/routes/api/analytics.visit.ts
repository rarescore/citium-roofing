import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/analytics/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        if (Number(request.headers.get("content-length") || 0) > 2000) {
          return Response.json({ ok: false }, { status: 413, headers });
        }
        try {
          const { recordEstimatedVisit } = await import("@/lib/geo-stats.server");
          const precision = await recordEstimatedVisit(request.headers);
          return Response.json({ ok: true, precision }, { headers });
        } catch {
          return Response.json({ ok: false, precision: "unknown" }, { status: 200, headers });
        }
      },
    },
  },
});
