-- Allow sellers (esp. test shops) to opt out of daily LINE accounting digests
alter table public.profiles
  add column if not exists daily_digest_enabled boolean not null default true;

comment on column public.profiles.daily_digest_enabled is
  'When false, cron / LINE daily accounting digest is skipped for this seller.';
