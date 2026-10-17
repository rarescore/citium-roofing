-- Office lead records. No advertising id, no IP address, no visitor profile.
create table if not exists leads (
  id text primary key,
  stage text not null default 'new',
  kind text not null,
  name text not null,
  email text not null,
  phone text not null,
  address text not null,
  zip text not null default '',
  service text not null default '',
  urgency text not null default 'standard',
  contact_method text not null default 'phone',
  message text not null default '',
  landing_page text not null default '',
  traffic_source text not null default '',
  campaign text not null default '',
  utm_medium text not null default '',
  updated_by text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_stage_check check (stage in ('new', 'contacted', 'inspection', 'estimate', 'won', 'lost')),
  constraint leads_urgency_check check (urgency in ('standard', 'emergency')),
  constraint leads_contact_check check (contact_method in ('phone', 'email', 'text'))
);

create table if not exists lead_photos (
  id text primary key,
  lead_id text not null references leads (id) on delete cascade,
  content_type text not null,
  byte_size integer not null,
  data bytea not null
);
