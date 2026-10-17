import { getSql } from "@/lib/db";
import { AREA_ROWS, bucketForEstimate, bucketForZip, geoFromHeaders, type AreaBucket, type AreaStat } from "@/lib/geo";

async function add(bucket: AreaBucket, column: "visits" | "inquiries" | "zip_inquiries") {
  const sql = await getSql();
  const visits = column === "visits" ? 1 : 0;
  const inquiries = column === "inquiries" ? 1 : 0;
  const zipInquiries = column === "zip_inquiries" ? 1 : 0;
  await sql`
    insert into geo_area_stats (area_key, label, visits, inquiries, zip_inquiries)
    values (${bucket.key}, ${bucket.label}, ${visits}, ${inquiries}, ${zipInquiries})
    on conflict (area_key) do update set
      visits = geo_area_stats.visits + ${visits},
      inquiries = geo_area_stats.inquiries + ${inquiries},
      zip_inquiries = geo_area_stats.zip_inquiries + ${zipInquiries},
      label = ${bucket.label},
      updated_at = now()
  `;
}

export async function recordEstimatedVisit(headers: Headers): Promise<"estimated" | "unknown"> {
  const geo = geoFromHeaders(headers);
  await add(bucketForEstimate(geo), "visits");
  return geo.precision;
}

export async function recordInquiryGeo(headers: Headers, zip: unknown) {
  const geo = geoFromHeaders(headers);
  await add(bucketForEstimate(geo), "inquiries");
  const fromZip = bucketForZip(zip);
  if (fromZip) await add(fromZip, "zip_inquiries");
}

export async function readAreaStats(): Promise<AreaStat[]> {
  const sql = await getSql();
  const rows = await sql<{
    area_key: string;
    visits: number | string;
    inquiries: number | string;
    zip_inquiries: number | string;
  }>`
    select area_key, visits, inquiries, zip_inquiries from geo_area_stats
  `;
  const byKey = new Map(rows.map((row) => [row.area_key, row]));
  return AREA_ROWS.map((area) => {
    const row = byKey.get(area.key);
    return {
      ...area,
      visits: Number(row?.visits ?? 0),
      inquiries: Number(row?.inquiries ?? 0),
      zipInquiries: Number(row?.zip_inquiries ?? 0),
    };
  });
}
