-- Fix login failures: harden auth hooks (safe IP parsing, fail-open on hook errors).

create or replace function public.is_ip_banned(p_ip text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  parsed inet;
begin
  if p_ip is null or length(trim(p_ip)) = 0 then
    return false;
  end if;

  begin
    parsed := trim(p_ip)::inet;
  exception
    when others then
      return false;
  end;

  return exists (
    select 1
    from public.banned_ips b
    where b.ip = parsed
      and (b.banned_until is null or b.banned_until > now())
  );
end;
$$;

revoke all on function public.is_ip_banned(text) from public;
grant execute on function public.is_ip_banned(text) to supabase_auth_admin;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ip text;
begin
  ip := event->'metadata'->>'ip_address';

  if ip is not null and public.is_ip_banned(ip) then
    begin
      perform public.log_security_event(
        'signup_blocked_ip',
        null,
        ip,
        jsonb_build_object('email', event->'user'->>'email')
      );
    exception
      when others then
        null;
    end;

    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Sign-ups are not allowed from your network.'
      )
    );
  end if;

  return '{}'::jsonb;
exception
  when others then
    return '{}'::jsonb;
end;
$$;

create or replace function public.hook_custom_access_token(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ip text;
  user_id uuid;
  v_status public.account_status;
begin
  user_id := nullif(event->>'user_id', '')::uuid;
  ip := event->'metadata'->>'ip_address';

  if ip is not null and public.is_ip_banned(ip) then
    begin
      perform public.log_security_event('token_blocked_ip', user_id, ip);
    exception
      when others then
        null;
    end;

    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Access from your network is not allowed.'
      )
    );
  end if;

  if user_id is not null then
    select account_status into v_status
    from public.profiles
    where id = user_id;

    if v_status = 'banned' then
      return jsonb_build_object(
        'error', jsonb_build_object(
          'http_code', 403,
          'message', 'This account has been permanently banned.'
        )
      );
    end if;

    if v_status = 'suspended' then
      return jsonb_build_object(
        'error', jsonb_build_object(
          'http_code', 403,
          'message', 'This account is temporarily suspended.'
        )
      );
    end if;

    if ip is not null and length(trim(ip)) > 0 then
      begin
        perform public.record_user_ip(user_id, ip);
      exception
        when others then
          null;
      end;
    end if;
  end if;

  return event;
exception
  when others then
    return event;
end;
$$;

revoke all on function public.hook_before_user_created(jsonb) from public;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

revoke all on function public.hook_custom_access_token(jsonb) from public;
grant execute on function public.hook_custom_access_token(jsonb) to supabase_auth_admin;

notify pgrst, 'reload schema';
