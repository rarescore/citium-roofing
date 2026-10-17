import { createFileRoute } from "@tanstack/react-router";
import { loginResult, logoutCookie } from "@/lib/admin-session.server";

export const Route = createFileRoute("/api/office/session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        try {
          const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
          assertSameSiteRequest();
        } catch {
          return Response.json({ error: "Forbidden." }, { status: 403, headers });
        }
        let password = "";
        try {
          const body = (await request.json()) as { password?: unknown };
          password = typeof body.password === "string" ? body.password : "";
        } catch {
          return Response.json({ error: "Enter the office password." }, { status: 400, headers });
        }
        const result = loginResult(password, request.url);
        if (!result.ok) return Response.json({ error: result.error }, { status: result.status, headers });
        return Response.json({ ok: true }, { headers: { ...headers, "set-cookie": result.cookie } });
      },
      DELETE: async ({ request }) => {
        return new Response(null, {
          status: 204,
          headers: { "Cache-Control": "no-store", "set-cookie": logoutCookie(request.url) },
        });
      },
    },
  },
});
