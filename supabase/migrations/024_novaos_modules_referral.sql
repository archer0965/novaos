-- NovaOS: modules, referral, reserved payment gateway fields, booking MVP

alter table public.profiles
  add column if not exists active_modules text[] default array['store']::text[],
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references public.profiles(id) on delete set null,
  add column if not exists referral_discount_used boolean default false,
  add column if not exists referral_credit_balance integer default 0,
  add column if not exists deposit_enabled boolean default false,
  add column if not exists ecpay_merchant_id text,
  add column if not exists ecpay_hash_key text,
  add column if not exists ecpay_hash_iv text,
  add column if not exists line_pay_channel_id text,
  add column if not exists line_pay_channel_secret text;

create unique index if not exists profiles_referral_code_uidx
  on public.profiles (referral_code)
  where referral_code is not null;

-- Booking services (美業拓脈)
create table if not exists public.booking_services (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  price integer not null default 0 check (price >= 0),
  offpeak_discount_pct integer default 0 check (offpeak_discount_pct >= 0 and offpeak_discount_pct <= 90),
  buffer_minutes integer not null default 10 check (buffer_minutes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_services_seller_idx on public.booking_services (seller_id);

create table if not exists public.booking_appointments (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid references public.booking_services(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'booked' check (status in ('booked', 'completed', 'cancelled', 'no_show')),
  pay_mode text not null default 'pay_at_store' check (pay_mode in ('pay_at_store', 'manual_transfer', 'deposit')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists booking_appointments_seller_starts_idx
  on public.booking_appointments (seller_id, starts_at);

-- AI Doc drafts
create table if not exists public.ai_doc_drafts (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  doc_type text not null default 'waiver',
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_doc_drafts_seller_idx on public.ai_doc_drafts (seller_id);

-- Referral ledger
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null references public.profiles(id) on delete cascade,
  credit_amount integer not null default 100,
  created_at timestamptz not null default now(),
  unique (referee_id)
);

alter table public.booking_services enable row level security;
alter table public.booking_appointments enable row level security;
alter table public.ai_doc_drafts enable row level security;
alter table public.referral_events enable row level security;

drop policy if exists booking_services_owner on public.booking_services;
create policy booking_services_owner on public.booking_services
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists booking_services_public_read on public.booking_services;
create policy booking_services_public_read on public.booking_services
  for select using (is_active = true);

drop policy if exists booking_appointments_owner on public.booking_appointments;
create policy booking_appointments_owner on public.booking_appointments
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists booking_appointments_public_insert on public.booking_appointments;
create policy booking_appointments_public_insert on public.booking_appointments
  for insert with check (true);

drop policy if exists ai_doc_drafts_owner on public.ai_doc_drafts;
create policy ai_doc_drafts_owner on public.ai_doc_drafts
  for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists referral_events_owner on public.referral_events;
create policy referral_events_owner on public.referral_events
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);
