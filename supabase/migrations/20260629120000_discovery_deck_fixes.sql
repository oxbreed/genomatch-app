-- Discovery: only show completed profiles; expose deck stats; allow clearing passes.

create or replace function public.discovery_profiles_for_viewer(max_rows integer default 50)
returns table (
  id uuid,
  display_name text,
  date_of_birth date,
  city text,
  country text,
  gender text,
  genotype public.genotype_type,
  genotype_verified boolean,
  photos text[],
  bio text,
  interests text[],
  relationship_goal text,
  verification_status text,
  height_cm smallint,
  religion text,
  drinking_status text,
  smoking_status text,
  education_status text,
  last_active_at timestamptz,
  created_at timestamptz,
  distance_band text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id,
    p.display_name,
    p.date_of_birth,
    p.city,
    p.country,
    p.gender,
    p.genotype,
    p.genotype_verified,
    p.photos,
    p.bio,
    p.interests,
    p.relationship_goal,
    p.verification_status,
    p.height_cm,
    p.religion,
    p.drinking_status,
    p.smoking_status,
    p.education_status,
    p.last_active_at,
    p.created_at,
    public.coarse_distance_band(
      viewer.approx_lat,
      viewer.approx_lng,
      p.approx_lat,
      p.approx_lng,
      public.normalize_city_key(viewer.city),
      public.normalize_city_key(p.city)
    ) as distance_band
  from public.profiles viewer
  join public.profiles p on p.id <> viewer.id
  where viewer.id = auth.uid()
    and viewer.account_status = 'active'
    and p.account_status = 'active'
    and p.onboarding_completed = true
    and p.display_name is not null
    and btrim(p.display_name) <> ''
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = viewer.id and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = viewer.id)
    )
    and not exists (
      select 1 from public.likes l
      where l.liker_id = viewer.id and l.liked_id = p.id
    )
    and not exists (
      select 1 from public.passes ps
      where ps.passer_id = viewer.id and ps.passed_id = p.id
    )
  order by p.created_at desc
  limit greatest(1, least(max_rows, 100));
$$;

create or replace function public.get_my_discovery_deck_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  eligible integer := 0;
  liked integer := 0;
  passed integer := 0;
  blocked integer := 0;
begin
  if uid is null then
    return jsonb_build_object('eligible', 0, 'liked', 0, 'passed', 0, 'blocked', 0);
  end if;

  select count(*)::integer into eligible
  from public.profiles p
  where p.id <> uid
    and p.account_status = 'active'
    and p.onboarding_completed = true
    and p.display_name is not null
    and btrim(p.display_name) <> '';

  select count(*)::integer into liked
  from public.likes l
  where l.liker_id = uid;

  select count(*)::integer into passed
  from public.passes ps
  where ps.passer_id = uid;

  select count(*)::integer into blocked
  from public.blocks b
  where b.blocker_id = uid or b.blocked_id = uid;

  return jsonb_build_object(
    'eligible', eligible,
    'liked', liked,
    'passed', passed,
    'blocked', blocked
  );
end;
$$;

create or replace function public.clear_my_passes()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  removed integer;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  delete from public.passes where passer_id = uid;
  get diagnostics removed = row_count;
  return removed;
end;
$$;

revoke all on function public.get_my_discovery_deck_stats() from public;
grant execute on function public.get_my_discovery_deck_stats() to authenticated;

revoke all on function public.clear_my_passes() from public;
grant execute on function public.clear_my_passes() to authenticated;

notify pgrst, 'reload schema';
