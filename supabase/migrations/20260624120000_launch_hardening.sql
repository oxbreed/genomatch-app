-- Launch hardening: private push tokens + secure save RPC

create or replace function public.save_expo_push_token(token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set expo_push_token = nullif(trim(token), '')
  where id = auth.uid();
end;
$$;

revoke all on function public.save_expo_push_token(text) from public;
grant execute on function public.save_expo_push_token(text) to authenticated;

comment on function public.save_expo_push_token(text) is
  'Persist the caller''s Expo push token without exposing tokens via profile reads.';
