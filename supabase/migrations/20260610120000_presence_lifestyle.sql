-- Online presence + lifestyle fields (drinking, smoking, education)
-- Also exposes height_cm and religion on the public_profiles view.

alter table public.profiles
  add column if not exists height_cm smallint
    check (height_cm is null or (height_cm >= 120 and height_cm <= 230)),
  add column if not exists religion text,
  add column if not exists last_active_at timestamptz,
  add column if not exists drinking_status text,
  add column if not exists smoking_status text,
  add column if not exists education_status text;

comment on column public.profiles.height_cm is 'User height in centimetres';
comment on column public.profiles.religion is 'User religion / faith preference slug';
comment on column public.profiles.last_active_at is 'Last time the user was active in the app';
comment on column public.profiles.drinking_status is 'Drinking habit slug (never, socially, regularly, prefer_not)';
comment on column public.profiles.smoking_status is 'Smoking habit slug (never, socially, regularly, prefer_not)';
comment on column public.profiles.education_status is 'Education level slug';

drop view if exists public.public_profiles;

create view public.public_profiles
with (security_invoker = off) as
select
  id,
  display_name,
  date_of_birth,
  gender,
  city,
  country,
  bio,
  interests,
  relationship_goal,
  genotype,
  genotype_verified,
  avatar_url,
  photos,
  verification_status,
  height_cm,
  religion,
  drinking_status,
  smoking_status,
  education_status,
  last_active_at,
  created_at
from public.profiles;

comment on view public.public_profiles is
  'Safe, read-only projection of profiles for viewing other users. Never add email or other private columns here.';

revoke all on public.public_profiles from anon, authenticated, public;
grant select on public.public_profiles to authenticated;

notify pgrst, 'reload schema';
