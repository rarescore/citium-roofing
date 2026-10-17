import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/office/lead-photo/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const headers = { "Cache-Control": "private, no-store" };
        try {
          const { assertStaff, readLeadPhoto } = await import("@/lib/lead-store.server");
          await assertStaff();
          const photo = await readLeadPhoto(params.id);
          if (!photo) return new Response("Not found", { status: 404, headers });
          return new Response(photo.bytes as unknown as BodyInit, {
            headers: { ...headers, "Content-Type": photo.mime, "X-Content-Type-Options": "nosniff" },
          });
        } catch {
          return new Response("Unauthorized", { status: 401, headers });
        }
      },
    },
  },
});
