-- Self-service identity verification: server-side eligibility + trusted update.

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

revoke all on function public.verify_own_profile() from public;
grant execute on function public.verify_own_profile() to authenticated;

notify pgrst, 'reload schema';
