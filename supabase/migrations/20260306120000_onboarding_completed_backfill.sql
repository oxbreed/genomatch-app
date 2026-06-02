-- Ensure onboarding_completed exists and backfill existing profiles with display names
alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

update public.profiles
set onboarding_completed = true
where display_name is not null
  and trim(display_name) != ''
  and onboarding_completed = false;
