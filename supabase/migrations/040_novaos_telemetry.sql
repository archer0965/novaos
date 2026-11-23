-- Unified NovaOS telemetry / error tracking (hub authority)
create table if not exists public.novaos_telemetry_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  kind text not null,
  severity text not null default 'info',
  message text not null,
  product text,
  user_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists novaos_telemetry_events_created_at_idx
  on public.novaos_telemetry_events (created_at desc);

create index if not exists novaos_telemetry_events_kind_idx
  on public.novaos_telemetry_events (kind, severity);

alter table public.novaos_telemetry_events enable row level security;

-- Service role inserts only; admins can read via service client
drop policy if exists "telemetry_no_public" on public.novaos_telemetry_events;
create policy "telemetry_no_public"
  on public.novaos_telemetry_events
  for all
  using (false)
  with check (false);
