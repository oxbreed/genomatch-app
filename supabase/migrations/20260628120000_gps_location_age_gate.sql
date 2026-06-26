-- Persist real GPS coordinates for matching; fix country default; enforce 18+ age gate.

alter table public.profiles
  alter column country drop default,
  add column if not exists location_source text
    check (location_source is null or location_source in ('gps', 'city_centroid'));

comment on column public.profiles.location_source is
  'How approx_lat/lng were set: gps (device) or city_centroid (alias table fallback).';

create or replace function public.enforce_minimum_age_18()
returns trigger
language plpgsql
as $$
begin
  if new.date_of_birth is not null
    and new.date_of_birth > (current_date - interval '18 years') then
    raise exception 'MINIMUM_AGE_18';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_enforce_minimum_age on public.profiles;

create trigger profiles_enforce_minimum_age
  before insert or update of date_of_birth on public.profiles
  for each row
  execute function public.enforce_minimum_age_18();

create or replace function public.sync_profile_approx_location()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  key text;
begin
  if new.location_source = 'gps' then
    return new;
  end if;

  if tg_op = 'UPDATE' and new.city is not distinct from old.city then
    return new;
  end if;

  key := public.normalize_city_key(new.city);

  if key is null then
    new.approx_lat := null;
    new.approx_lng := null;
    new.location_source := null;
    return new;
  end if;

  select c.approx_lat, c.approx_lng
    into new.approx_lat, new.approx_lng
  from public.city_centroids c
  where c.city_key = key;

  if not found then
    new.approx_lat := null;
    new.approx_lng := null;
    new.location_source := null;
  else
    new.location_source := 'city_centroid';
  end if;

  return new;
end;
$$;

create or replace function public.save_profile_location(
  p_city text,
  p_country text,
  p_latitude numeric,
  p_longitude numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  normalized_city text;
  normalized_country text;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  if p_latitude is null or p_longitude is null then
    raise exception 'GPS coordinates are required';
  end if;

  if p_latitude < -90 or p_latitude > 90 or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Invalid coordinates';
  end if;

  normalized_city := nullif(trim(p_city), '');
  normalized_country := nullif(upper(trim(p_country)), '');

  if normalized_country is not null and length(normalized_country) <> 2 then
    raise exception 'Invalid country code';
  end if;

  perform set_config('app.allow_city_update', 'on', true);

  update public.profiles
  set
    city = coalesce(normalized_city, city),
    country = coalesce(normalized_country, country),
    approx_lat = round(p_latitude::numeric, 2),
    approx_lng = round(p_longitude::numeric, 2),
    location_source = 'gps'
  where id = uid;
end;
$$;

revoke all on function public.save_profile_location(text, text, numeric, numeric) from public;
grant execute on function public.save_profile_location(text, text, numeric, numeric) to authenticated;

drop function if exists public.update_my_verified_city(text, numeric, numeric);

create or replace function public.update_my_verified_city(
  p_city text,
  p_latitude numeric,
  p_longitude numeric,
  p_country text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.profiles%rowtype;
  key text;
  centroid_lat numeric;
  centroid_lng numeric;
  distance_km numeric;
  normalized_new text;
  normalized_country text;
  cooldown interval := interval '12 months';
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  select * into rec from public.profiles where id = uid;
  if not found then
    raise exception 'Profile not found';
  end if;

  if not (rec.genotype_verified = true or rec.verification_status = 'verified') then
    raise exception 'Verification is required before updating a locked city';
  end if;

  if rec.city_updated_at is not null and rec.city_updated_at > now() - cooldown then
    raise exception 'CITY_UPDATE_COOLDOWN';
  end if;

  normalized_new := trim(p_city);
  if normalized_new = '' then
    raise exception 'City is required';
  end if;

  if p_latitude is null or p_longitude is null then
    raise exception 'Location confirmation is required';
  end if;

  normalized_country := nullif(upper(trim(coalesce(p_country, ''))), '');
  if normalized_country is not null and length(normalized_country) <> 2 then
    raise exception 'Invalid country code';
  end if;

  key := public.normalize_city_key(normalized_new);

  if key is not null then
    select c.approx_lat, c.approx_lng
      into centroid_lat, centroid_lng
    from public.city_centroids c
    where c.city_key = key;

    if found then
      distance_km := public.haversine_km(p_latitude, p_longitude, centroid_lat, centroid_lng);
      if distance_km > 80 then
        raise exception 'GPS does not match the detected city';
      end if;
    end if;
  end if;

  if lower(trim(coalesce(rec.city, ''))) = lower(normalized_new) then
    raise exception 'You are already set to this city';
  end if;

  perform set_config('app.allow_city_update', 'on', true);

  update public.profiles
  set
    city = normalized_new,
    country = coalesce(normalized_country, country),
    approx_lat = round(p_latitude::numeric, 2),
    approx_lng = round(p_longitude::numeric, 2),
    location_source = 'gps',
    city_updated_at = now()
  where id = uid;

  begin
    perform public.log_security_event(
      'verified_city_update',
      uid,
      null,
      jsonb_build_object(
        'old_city', rec.city,
        'new_city', normalized_new,
        'distance_km', distance_km
      )
    );
  exception
    when undefined_function then
      null;
    when others then
      null;
  end;

  return jsonb_build_object(
    'city', normalized_new,
    'city_updated_at', now()
  );
end;
$$;

revoke all on function public.update_my_verified_city(text, numeric, numeric, text) from public;
grant execute on function public.update_my_verified_city(text, numeric, numeric, text) to authenticated;

notify pgrst, 'reload schema';
