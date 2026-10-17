-- Outcome timestamps and revenue entered by staff. Null revenue means "not entered".
alter table leads add column if not exists inspection_booked_at timestamptz;
alter table leads add column if not exists won_at timestamptz;
alter table leads add column if not exists revenue_cents integer;
