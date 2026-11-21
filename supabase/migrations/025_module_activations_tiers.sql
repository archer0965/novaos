-- Per-module activation (decoupled from account signup) + 推廣大使

alter table public.profiles
  add column if not exists is_ambassador boolean default false;

-- Registration must NOT auto-start trial / consume early-bird seats.
-- Clear accidental signup trials that were never tied to module activation
-- (safe no-op when already null).

create table if not exists public.module_activations (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  module_id text not null check (module_id in ('booking', 'store', 'ai_doc', 'pass')),
  activated_at timestamptz not null default now(),
  is_module_early_bird boolean not null default false,
  trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  unique (seller_id, module_id)
);

create index if not exists module_activations_module_early_idx
  on public.module_activations (module_id)
  where is_module_early_bird = true;

create index if not exists module_activations_seller_idx
  on public.module_activations (seller_id);

alter table public.module_activations enable row level security;

drop policy if exists module_activations_owner on public.module_activations;
create policy module_activations_owner on public.module_activations
  for select using (auth.uid() = seller_id);

-- Inserts go through service role / API; authenticated users can read own rows.
drop policy if exists module_activations_owner_insert on public.module_activations;
create policy module_activations_owner_insert on public.module_activations
  for insert with check (auth.uid() = seller_id);
