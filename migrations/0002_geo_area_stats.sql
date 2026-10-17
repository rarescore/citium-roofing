-- Aggregate visit and inquiry counts by service area.
-- No IP address, no coordinates, no visitor id, no street address.
create table if not exists geo_area_stats (
  area_key text primary key,
  label text not null,
  visits integer not null default 0,
  inquiries integer not null default 0,
  zip_inquiries integer not null default 0,
  updated_at timestamptz not null default now()
);
