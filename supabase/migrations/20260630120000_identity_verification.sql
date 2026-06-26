-- Identity (selfie) verification — manual admin review, v1
-- Separate from genotype verification (verification_status / genotype_verified).

-- 1. Status + selfie storage on profiles
alter table public.profiles
  add column if not exists identity_status text not null default 'unverified',
  add column if not exists identity_selfie_url text,
  add column if not exists identity_requested_at timestamptz,
  add column if not exists identity_reviewed_at timestamptz,
  add column if not exists identity_rejection_reason text;

alter table public.profiles
  drop constraint if exists profiles_identity_status_check;

alter table public.profiles
  add constraint profiles_identity_status_check
  check (identity_status in ('unverified', 'pending', 'verified', 'rejected'));

-- 2. User-facing RPC: submit a selfie for review.
-- Users can only ever set themselves to 'pending' — never 'verified' or 'rejected'.
-- That decision is admin-only (see admin_review_identity below).
create or replace function public.submit_identity_verification(p_selfie_url text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not signed in';
  end if;

  if p_selfie_url is null or btrim(p_selfie_url) = '' then
    raise exception 'A selfie photo is required';
  end if;

  update public.profiles
  set
    identity_selfie_url = p_selfie_url,
    identity_status = 'pending',
    identity_requested_at = now(),
    identity_reviewed_at = null,
    identity_rejection_reason = null
  where id = uid;

  return jsonb_build_object('status', 'pending');
end;
$$;

-- 3. Admin-only RPC: approve or reject a pending submission.
-- Restricted to service_role (i.e. only callable from the admin panel's
-- server-side code with the service key — never from the mobile app).
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

  update public.profiles
  set
    identity_status = case when p_approved then 'verified' else 'rejected' end,
    identity_reviewed_at = now(),
    identity_rejection_reason = case when p_approved then null else p_reason end
  where id = p_profile_id;

  return jsonb_build_object(
    'profile_id', p_profile_id,
    'status', case when p_approved then 'verified' else 'rejected' end
  );
end;
$$;

-- 4. Helper the mobile app can call to check current status quickly.
create or replace function public.get_my_identity_status()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  rec record;
begin
  if uid is null then
    return jsonb_build_object('status', 'unverified');
  end if;

  select identity_status, identity_rejection_reason
    into rec
  from public.profiles
  where id = uid;

  if not found then
    return jsonb_build_object('status', 'unverified');
  end if;

  return jsonb_build_object(
    'status', rec.identity_status,
    'rejection_reason', rec.identity_rejection_reason
  );
end;
$$;

grant execute on function public.submit_identity_verification(text) to authenticated;
grant execute on function public.get_my_identity_status() to authenticated;
-- admin_review_identity intentionally NOT granted to authenticated — service_role only.
