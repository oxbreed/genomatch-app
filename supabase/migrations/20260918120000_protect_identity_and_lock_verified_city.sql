-- Lock identity selfie columns against client self-grant, and stop
-- genotype-verified members from rewriting city via save_profile_location.
-- Verified city changes remain on update_my_verified_city (cooldown + GPS).

create or replace function public.protect_identity_columns()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if (
      new.identity_status is distinct from 'unverified'
      or new.identity_selfie_url is not null
      or new.identity_requested_at is not null
      or new.identity_reviewed_at is not null
      or new.identity_rejection_reason is not null
    )
    and coalesce(current_setting('app.allow_identity_update', true), '') <> 'on'
    then
      raise exception 'IDENTITY_LOCKED';
    end if;

    return new;
  end if;

  if (
    new.identity_status is distinct from old.identity_status
    or new.identity_selfie_url is distinct from old.identity_selfie_url
    or new.identity_requested_at is distinct from old.identity_requested_at
    or new.identity_reviewed_at is distinct from old.identity_reviewed_at
    or new.identity_rejection_reason is distinct from old.identity_rejection_reason
  )
  and coalesce(current_setting('app.allow_identity_update', true), '') <> 'on'
  then
    raise exception 'IDENTITY_LOCKED';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_identity_columns_before_insert on public.profiles;

create trigger protect_identity_columns_before_insert
  before insert on public.profiles
  for each row
  execute function public.protect_identity_columns();

drop trigger if exists protect_identity_columns_before_update on public.profiles;

create trigger protect_identity_columns_before_update
  before update on public.profiles
  for each row
  execute function public.protect_identity_columns();

create or replace function public.is_cloudinary_upload_url(url text)
returns boolean
language sql
immutable
as $$
  select
    url is not null
    and btrim(url) ~ '^https://res\.cloudinary\.com/[^/]+/image/upload/.+';
$$;

create or replace function public.submit_identity_verification(p_selfie_url text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  normalized_url text;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  normalized_url := btrim(p_selfie_url);
  if normalized_url = '' then
    raise exception 'A selfie photo is required';
  end if;

  if not public.is_cloudinary_upload_url(normalized_url) then
    raise exception 'Invalid selfie URL';
  end if;

  perform set_config('app.allow_identity_update', 'on', true);

  update public.profiles
  set
    identity_selfie_url = normalized_url,
    identity_status = 'pending',
    identity_requested_at = now(),
    identity_reviewed_at = null,
    identity_rejection_reason = null
  where id = uid;

  return jsonb_build_object('status', 'pending');
end;
$$;

create or replace function public.admin_review_identity(
  p_profile_id uuid,
  p_approved boolean,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'Not authorized';
  end if;

  perform set_config('app.allow_identity_update', 'on', true);

  update public.profiles
  set
    identity_status = case when p_approved then 'verified' else 'rejected' end,
    identity_reviewed_at = now(),
    identity_rejection_reason = case when p_approved then null else p_reason end
  where id = p_profile_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'status', case when p_approved then 'verified' else 'rejected' end
  );
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
  rec public.profiles%rowtype;
  normalized_city text;
  normalized_country text;
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  select * into rec from public.profiles where id = uid;
  if not found then
    raise exception 'Profile not found';
  end if;

  if rec.genotype_verified = true or rec.verification_status = 'verified' then
    raise exception 'CITY_LOCKED';
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

revoke all on function public.submit_identity_verification(text) from public;
grant execute on function public.submit_identity_verification(text) to authenticated;

revoke all on function public.get_my_identity_status() from public;
grant execute on function public.get_my_identity_status() to authenticated;

revoke all on function public.admin_review_identity(uuid, boolean, text) from public;
revoke all on function public.admin_review_identity(uuid, boolean, text) from authenticated;
revoke all on function public.admin_review_identity(uuid, boolean, text) from anon;
grant execute on function public.admin_review_identity(uuid, boolean, text) to service_role;

revoke all on function public.save_profile_location(text, text, numeric, numeric) from public;
grant execute on function public.save_profile_location(text, text, numeric, numeric) to authenticated;

notify pgrst, 'reload schema';
