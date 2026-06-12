-- Coarse city-centroid location (server-side only) + distance-band RPCs.
-- approx_lat / approx_lng are NOT exposed via public_profiles.

alter table public.profiles
  add column if not exists approx_lat numeric(5, 2)
    check (approx_lat is null or (approx_lat >= -90 and approx_lat <= 90)),
  add column if not exists approx_lng numeric(6, 2)
    check (approx_lng is null or (approx_lng >= -180 and approx_lng <= 180));

comment on column public.profiles.approx_lat is
  'City-centroid latitude (~1 km grid). Server-side only — never expose via public_profiles.';
comment on column public.profiles.approx_lng is
  'City-centroid longitude (~1 km grid). Server-side only — never expose via public_profiles.';

create table if not exists public.city_centroids (
  city_key text primary key,
  display_name text not null,
  approx_lat numeric(5, 2) not null
    check (approx_lat >= -90 and approx_lat <= 90),
  approx_lng numeric(6, 2) not null
    check (approx_lng >= -180 and approx_lng <= 180)
);

comment on table public.city_centroids is
  'Known city centroids for approx location sync. No RLS policies — not readable by clients.';

alter table public.city_centroids enable row level security;

insert into public.city_centroids (city_key, display_name, approx_lat, approx_lng)
values
  ('lagos',         'Lagos',          6.52,   3.38),
  ('abuja',         'Abuja',          9.08,   7.40),
  ('nairobi',       'Nairobi',       -1.29,  36.82),
  ('ibadan',        'Ibadan',         7.38,   3.90),
  ('kano',          'Kano',          12.00,   8.52),
  ('port_harcourt', 'Port Harcourt',  4.82,   7.05),
  ('benin_city',    'Benin City',     6.34,   5.60),
  ('kaduna',        'Kaduna',        10.51,   7.44),
  ('enugu',         'Enugu',          6.44,   7.50),
  ('accra',         'Accra',          5.56,  -0.20)
on conflict (city_key) do update
set
  display_name = excluded.display_name,
  approx_lat = excluded.approx_lat,
  approx_lng = excluded.approx_lng;

create or replace function public.normalize_city_key(raw text)
returns text
language sql
immutable
as $$
  select case
    when raw is null or btrim(raw) = '' then null
    else (
      select coalesce(
        (select aliases.city_key
         from (values
           ('lagos', 'lagos'),
           ('abuja', 'abuja'),
           ('fct', 'abuja'),
           ('nairobi', 'nairobi'),
           ('ibadan', 'ibadan'),
           ('kano', 'kano'),
           ('port harcourt', 'port_harcourt'),
           ('ph', 'port_harcourt'),
           ('benin city', 'benin_city'),
           ('benin', 'benin_city'),
           ('kaduna', 'kaduna'),
           ('enugu', 'enugu'),
           ('accra', 'accra')
         ) as aliases (alias, city_key)
         where aliases.alias = lower(btrim(raw))
         limit 1),
        lower(regexp_replace(btrim(raw), '\s+', '_', 'g'))
      )
    )
  end;
$$;

create or replace function public.sync_profile_approx_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  key text;
begin
  if tg_op = 'UPDATE' and new.city is not distinct from old.city then
    return new;
  end if;

  key := public.normalize_city_key(new.city);

  if key is null then
    new.approx_lat := null;
    new.approx_lng := null;
    return new;
  end if;

  select c.approx_lat, c.approx_lng
    into new.approx_lat, new.approx_lng
  from public.city_centroids c
  where c.city_key = key;

  if not found then
    new.approx_lat := null;
    new.approx_lng := null;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_approx_location on public.profiles;

create trigger profiles_sync_approx_location
  before insert or update of city on public.profiles
  for each row
  execute function public.sync_profile_approx_location();

update public.profiles p
set
  approx_lat = c.approx_lat,
  approx_lng = c.approx_lng
from public.city_centroids c
where public.normalize_city_key(p.city) = c.city_key
  and p.city is not null;

-- Haversine distance in km (coarse bands only; not exposed to clients).
create or replace function public.haversine_km(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
)
returns numeric
language sql
immutable
as $$
  select case
    when lat1 is null or lng1 is null or lat2 is null or lng2 is null then null
    else (
      6371 * 2 * asin(sqrt(
        power(sin(radians((lat2 - lat1) / 2)), 2) +
        cos(radians(lat1)) * cos(radians(lat2)) *
        power(sin(radians((lng2 - lng1) / 2)), 2)
      ))
    )::numeric
  end;
$$;

-- Four coarse bands: same_city | nearby (<=80km) | regional (<=400km) | distant.
create or replace function public.coarse_distance_band(
  viewer_lat numeric,
  viewer_lng numeric,
  target_lat numeric,
  target_lng numeric,
  viewer_city_key text,
  target_city_key text
)
returns text
language sql
immutable
as $$
  select case
    when viewer_city_key is not null
      and target_city_key is not null
      and viewer_city_key = target_city_key
      then 'same_city'
    when viewer_lat is null or viewer_lng is null or target_lat is null or target_lng is null
      then 'unknown'
    when public.haversine_km(viewer_lat, viewer_lng, target_lat, target_lng) <= 80
      then 'nearby'
    when public.haversine_km(viewer_lat, viewer_lng, target_lat, target_lng) <= 400
      then 'regional'
    else 'distant'
  end;
$$;

create or replace function public.coarse_distance_bands_for_profiles(target_ids uuid[])
returns table (
  profile_id uuid,
  distance_band text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    target.id as profile_id,
    public.coarse_distance_band(
      viewer.approx_lat,
      viewer.approx_lng,
      target.approx_lat,
      target.approx_lng,
      public.normalize_city_key(viewer.city),
      public.normalize_city_key(target.city)
    ) as distance_band
  from public.profiles viewer
  cross join public.profiles target
  where viewer.id = auth.uid()
    and target.id = any (target_ids)
    and target.id <> viewer.id;
$$;

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
  order by p.created_at desc
  limit greatest(1, least(max_rows, 100));
$$;

revoke all on function public.coarse_distance_bands_for_profiles(uuid[]) from public;
grant execute on function public.coarse_distance_bands_for_profiles(uuid[]) to authenticated;

revoke all on function public.discovery_profiles_for_viewer(integer) from public;
grant execute on function public.discovery_profiles_for_viewer(integer) to authenticated;

notify pgrst, 'reload schema';
