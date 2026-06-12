-- Lock down profiles: own-row-only SELECT on the base table,
-- plus a column-safe view (public_profiles) for viewing other users.
-- The view intentionally excludes: email, onboarding_completed, updated_at.

-- 1) Remove the over-permissive SELECT policy
drop policy if exists "Authenticated users can view profiles" on public.profiles;

-- 2) Users can read their OWN full row (including email).
--    Existing insert/update own-row policies are untouched.
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- 3) Column-safe view for discovery / matches / messaging.
--    security_invoker = off (the default, stated explicitly): the view runs
--    with the owner's (postgres) privileges and therefore bypasses profiles
--    RLS. Column safety is enforced by the view definition itself.
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
  created_at            -- required: Discovery orders by created_at
from public.profiles;

comment on view public.public_profiles is
  'Safe, read-only projection of profiles for viewing other users. Never add email or other private columns here.';

-- 4) Grants: read-only, authenticated users only.
--    Supabase default privileges grant broadly on new objects, so revoke
--    everything first. No INSERT/UPDATE/DELETE grants — this matters because
--    a security-definer view over an auto-updatable base table would
--    otherwise allow writes that bypass RLS.
revoke all on public.public_profiles from anon, authenticated, public;
grant select on public.public_profiles to authenticated;

-- 5) Make PostgREST pick up the new view immediately.
notify pgrst, 'reload schema';
