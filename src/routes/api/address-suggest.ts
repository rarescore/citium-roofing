import { createFileRoute } from "@tanstack/react-router";

let last = 0;

export const Route = createFileRoute("/api/address-suggest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const headers = { "Cache-Control": "no-store" };
        const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
        if (q.length < 3 || q.length > 120) return Response.json({ suggestions: [] }, { headers });
        const now = Date.now();
        if (now - last < 180) return Response.json({ suggestions: [] }, { headers });
        last = now;
        try {
          const url = new URL("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest");
          url.searchParams.set("f", "json");
          url.searchParams.set("text", q);
          url.searchParams.set("maxSuggestions", "6");
          url.searchParams.set("countryCode", "USA");
          url.searchParams.set("category", "Address");
          url.searchParams.set("location", "-118.3,34.18");
          const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
          if (!res.ok) return Response.json({ suggestions: [] }, { headers });
          const data = (await res.json()) as { suggestions?: { text: string; magicKey: string }[] };
          return Response.json(
            {
              suggestions: (data.suggestions ?? [])
                .filter((s) => s.text && s.magicKey)
                .slice(0, 6)
                .map((s) => ({ text: s.text.replace(/, USA$/, ""), magicKey: s.magicKey })),
            },
            { headers },
          );
        } catch {
          return Response.json({ suggestions: [] }, { headers });
        }
      },
    },
  },
});
