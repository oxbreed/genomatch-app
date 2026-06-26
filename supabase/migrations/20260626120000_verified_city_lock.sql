-- Lock city after profile verification; allow GPS-confirmed updates once per 12 months.

alter table public.profiles
  add column if not exists city_updated_at timestamptz;

comment on column public.profiles.city_updated_at is
  'When a verified member last changed city via update_my_verified_city (12-month cooldown).';

-- Extend genotype lock to also protect verified city (unless RPC sets bypass flag).
create or replace function public.protect_verified_genotype()
returns trigger
language plpgsql
as $$
begin
  if old.genotype_verified = true and new.genotype is distinct from old.genotype then
    raise exception 'Genotype cannot be changed after verification';
  end if;

  if (
      old.genotype_verified = true
      or old.verification_status = 'verified'
    )
    and new.city is distinct from old.city
    and coalesce(current_setting('app.allow_city_update', true), '') <> 'on'
  then
    raise exception 'CITY_LOCKED';
  end if;

  return new;
end;
$$;

-- Require city before self-verification.
create or replace function public.verify_own_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.profiles%rowtype;
  has_photo boolean;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  select * into rec from public.profiles where id = uid;
  if not found then
    raise exception 'Profile not found';
  end if;

  if rec.genotype_verified = true or rec.verification_status = 'verified' then
    raise exception 'Your profile is already verified.';
  end if;

  if rec.display_name is null or trim(rec.display_name) = '' then
    raise exception 'Add your display name before verifying.';
  end if;

  if rec.genotype is null then
    raise exception 'Set your genotype before verifying.';
  end if;

  if rec.city is null or trim(rec.city) = '' then
    raise exception 'Set your city before verifying.';
  end if;

  has_photo := coalesce(array_length(rec.photos, 1), 0) > 0
    or (rec.avatar_url is not null and trim(rec.avatar_url) <> '');

  if not has_photo then
    raise exception 'Add at least one profile photo before verifying — matches need to see the real you.';
  end if;

  update public.profiles
  set
    genotype_verified = true,
    verification_status = 'verified'
  where id = uid;
end;
$$;

create or replace function public.get_my_city_update_eligibility()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec public.profiles%rowtype;
  verified boolean;
  cooldown interval := interval '12 months';
begin
  if uid is null then
    return jsonb_build_object('can_update', false, 'reason', 'not_signed_in');
  end if;

  select * into rec from public.profiles where id = uid;
  if not found then
    return jsonb_build_object('can_update', false, 'reason', 'not_found');
  end if;

  verified := rec.genotype_verified = true or rec.verification_status = 'verified';
  if not verified then
    return jsonb_build_object('can_update', false, 'reason', 'not_verified');
  end if;

  if rec.city_updated_at is not null and rec.city_updated_at > now() - cooldown then
    return jsonb_build_object(
      'can_update', false,
      'reason', 'cooldown',
      'next_eligible_at', rec.city_updated_at + cooldown
    );
  end if;

  return jsonb_build_object('can_update', true);
end;
$$;

revoke all on function public.get_my_city_update_eligibility() from public;
grant execute on function public.get_my_city_update_eligibility() to authenticated;

create or replace function public.update_my_verified_city(
  p_city text,
  p_latitude numeric,
  p_longitude numeric
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

  key := public.normalize_city_key(normalized_new);
  if key is null then
    raise exception 'Invalid city';
  end if;

  select c.approx_lat, c.approx_lng
    into centroid_lat, centroid_lng
  from public.city_centroids c
  where c.city_key = key;

  if not found then
    raise exception 'CITY_NOT_SUPPORTED';
  end if;

  distance_km := public.haversine_km(p_latitude, p_longitude, centroid_lat, centroid_lng);
  if distance_km > 80 then
    raise exception 'GPS does not match the detected city';
  end if;

  if lower(trim(coalesce(rec.city, ''))) = lower(normalized_new) then
    raise exception 'You are already set to this city';
  end if;

  perform set_config('app.allow_city_update', 'on', true);

  update public.profiles
  set
    city = normalized_new,
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

revoke all on function public.update_my_verified_city(text, numeric, numeric) from public;
grant execute on function public.update_my_verified_city(text, numeric, numeric) to authenticated;

notify pgrst, 'reload schema';
