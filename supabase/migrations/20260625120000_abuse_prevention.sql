-- Server-side abuse prevention: IP bans, account suspension, rate limits, block enforcement.
-- Enable auth hooks in Dashboard (or config.toml) after applying:
--   before-user-created  -> public.hook_before_user_created
--   custom-access-token  -> public.hook_custom_access_token

-- ---------------------------------------------------------------------------
-- Account status
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.account_status as enum ('active', 'suspended', 'banned');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists account_status public.account_status not null default 'active';

create index if not exists profiles_account_status_idx on public.profiles (account_status);

-- ---------------------------------------------------------------------------
-- Banned IPs (service / auth admin only — no client access)
-- ---------------------------------------------------------------------------

create table if not exists public.banned_ips (
  ip inet primary key,
  reason text,
  banned_until timestamptz,
  created_at timestamptz not null default now(),
  created_by text default 'admin'
);

comment on table public.banned_ips is 'Blocked client IPs; banned_until null = permanent';
comment on column public.banned_ips.banned_until is 'Null = permanent ban';

alter table public.banned_ips enable row level security;

revoke all on table public.banned_ips from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Security audit log (no client access)
-- ---------------------------------------------------------------------------

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid references public.profiles (id) on delete set null,
  ip_address inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_events_type_created_idx
  on public.security_events (event_type, created_at desc);

alter table public.security_events enable row level security;

revoke all on table public.security_events from anon, authenticated;

-- ---------------------------------------------------------------------------
-- User ↔ IP tracking (auth hooks only)
-- ---------------------------------------------------------------------------

create table if not exists public.user_ip_addresses (
  user_id uuid not null references public.profiles (id) on delete cascade,
  ip inet not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (user_id, ip)
);

create index if not exists user_ip_addresses_ip_idx on public.user_ip_addresses (ip);

alter table public.user_ip_addresses enable row level security;

revoke all on table public.user_ip_addresses from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_ip_banned(p_ip text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.banned_ips b
    where b.ip = p_ip::inet
      and (b.banned_until is null or b.banned_until > now())
  );
$$;

revoke all on function public.is_ip_banned(text) from public;
grant execute on function public.is_ip_banned(text) to supabase_auth_admin;

create or replace function public.log_security_event(
  p_event_type text,
  p_user_id uuid default null,
  p_ip text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.security_events (event_type, user_id, ip_address, metadata)
  values (
    p_event_type,
    p_user_id,
    case when p_ip is null or length(trim(p_ip)) = 0 then null else p_ip::inet end,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.log_security_event(text, uuid, text, jsonb) from public;
grant execute on function public.log_security_event(text, uuid, text, jsonb) to supabase_auth_admin;

create or replace function public.record_user_ip(p_user_id uuid, p_ip text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_ip is null or length(trim(p_ip)) = 0 then
    return;
  end if;

  insert into public.user_ip_addresses (user_id, ip, first_seen_at, last_seen_at)
  values (p_user_id, p_ip::inet, now(), now())
  on conflict (user_id, ip) do update
    set last_seen_at = excluded.last_seen_at;
end;
$$;

revoke all on function public.record_user_ip(uuid, text) from public;
grant execute on function public.record_user_ip(uuid, text) to supabase_auth_admin;

create or replace function public.assert_active_account(p_user_id uuid default auth.uid())
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status public.account_status;
begin
  if p_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select account_status into v_status
  from public.profiles
  where id = p_user_id;

  if v_status is null then
    return;
  end if;

  if v_status = 'banned' then
    raise exception 'ACCOUNT_BANNED';
  end if;

  if v_status = 'suspended' then
    raise exception 'ACCOUNT_SUSPENDED';
  end if;
end;
$$;

revoke all on function public.assert_active_account(uuid) from public;
grant execute on function public.assert_active_account(uuid) to authenticated;

create or replace function public.users_are_blocked(p_user_a uuid, p_user_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocks b
    where (b.blocker_id = p_user_a and b.blocked_id = p_user_b)
       or (b.blocker_id = p_user_b and b.blocked_id = p_user_a)
  );
$$;

revoke all on function public.users_are_blocked(uuid, uuid) from public;
grant execute on function public.users_are_blocked(uuid, uuid) to authenticated;

create or replace function public.assert_rate_limit(
  p_user_id uuid,
  p_action text,
  p_max_count integer,
  p_window_seconds integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_since timestamptz := now() - make_interval(secs => p_window_seconds);
begin
  if p_action = 'swipe' then
    select count(*)::integer into v_count
    from (
      select 1 from public.likes where liker_id = p_user_id and created_at >= v_since
      union all
      select 1 from public.passes where passer_id = p_user_id and created_at >= v_since
    ) actions;
  elsif p_action = 'message' then
    select count(*)::integer into v_count
    from public.messages
    where sender_id = p_user_id
      and created_at >= v_since;
  else
    raise exception 'Unknown rate limit action: %', p_action;
  end if;

  if v_count >= p_max_count then
    raise exception 'RATE_LIMIT_EXCEEDED';
  end if;
end;
$$;

revoke all on function public.assert_rate_limit(uuid, text, integer, integer) from public;
grant execute on function public.assert_rate_limit(uuid, text, integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Write guards (triggers — cannot be bypassed from the client)
-- ---------------------------------------------------------------------------

create or replace function public.guard_like_insert()
returns trigger
language plpgsql
as $$
begin
  perform public.assert_active_account(new.liker_id);

  if public.users_are_blocked(new.liker_id, new.liked_id) then
    raise exception 'USER_BLOCKED';
  end if;

  perform public.assert_rate_limit(new.liker_id, 'swipe', 100, 3600);
  return new;
end;
$$;

drop trigger if exists guard_like_insert on public.likes;
create trigger guard_like_insert
  before insert on public.likes
  for each row execute function public.guard_like_insert();

create or replace function public.guard_pass_insert()
returns trigger
language plpgsql
as $$
begin
  perform public.assert_active_account(new.passer_id);

  if public.users_are_blocked(new.passer_id, new.passed_id) then
    raise exception 'USER_BLOCKED';
  end if;

  perform public.assert_rate_limit(new.passer_id, 'swipe', 100, 3600);
  return new;
end;
$$;

drop trigger if exists guard_pass_insert on public.passes;
create trigger guard_pass_insert
  before insert on public.passes
  for each row execute function public.guard_pass_insert();

create or replace function public.guard_message_insert()
returns trigger
language plpgsql
as $$
declare
  v_other_id uuid;
begin
  perform public.assert_active_account(new.sender_id);
  perform public.assert_rate_limit(new.sender_id, 'message', 50, 3600);

  select case
    when m.user_a_id = new.sender_id then m.user_b_id
    else m.user_a_id
  end
  into v_other_id
  from public.matches m
  where m.id = new.match_id;

  if v_other_id is not null and public.users_are_blocked(new.sender_id, v_other_id) then
    raise exception 'USER_BLOCKED';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_message_insert on public.messages;
create trigger guard_message_insert
  before insert on public.messages
  for each row execute function public.guard_message_insert();

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
as $$
begin
  if new.account_status is distinct from old.account_status then
    raise exception 'account_status is managed by administrators';
  end if;

  perform public.assert_active_account(old.id);
  return new;
end;
$$;

drop trigger if exists guard_profile_update on public.profiles;
create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Auth hooks (Postgres — enable in Supabase Dashboard after migration)
-- ---------------------------------------------------------------------------

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
    perform public.log_security_event('signup_blocked_ip', null, ip, jsonb_build_object('email', event->'user'->>'email'));
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Sign-ups are not allowed from your network.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

revoke all on function public.hook_before_user_created(jsonb) from public;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;

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
  user_id := (event->>'user_id')::uuid;
  ip := event->'metadata'->>'ip_address';

  if ip is not null and public.is_ip_banned(ip) then
    perform public.log_security_event('token_blocked_ip', user_id, ip);
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Access from your network is not allowed.'
      )
    );
  end if;

  select account_status into v_status
  from public.profiles
  where id = user_id;

  if v_status = 'banned' then
    perform public.log_security_event('token_blocked_account', user_id, ip, jsonb_build_object('status', 'banned'));
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'This account has been permanently banned.'
      )
    );
  end if;

  if v_status = 'suspended' then
    perform public.log_security_event('token_blocked_account', user_id, ip, jsonb_build_object('status', 'suspended'));
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'This account is temporarily suspended.'
      )
    );
  end if;

  if user_id is not null and ip is not null then
    perform public.record_user_ip(user_id, ip);
  end if;

  return jsonb_build_object('claims', event->'claims');
end;
$$;

revoke all on function public.hook_custom_access_token(jsonb) from public;
grant execute on function public.hook_custom_access_token(jsonb) to supabase_auth_admin;

grant select on table public.profiles to supabase_auth_admin;
grant select, insert on table public.banned_ips to supabase_auth_admin;
grant insert on table public.security_events to supabase_auth_admin;
grant select, insert, update on table public.user_ip_addresses to supabase_auth_admin;

-- ---------------------------------------------------------------------------
-- Client-safe account status check
-- ---------------------------------------------------------------------------

create or replace function public.get_my_account_status()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select account_status::text from public.profiles where id = auth.uid()),
    'active'
  );
$$;

revoke all on function public.get_my_account_status() from public;
grant execute on function public.get_my_account_status() to authenticated;

-- ---------------------------------------------------------------------------
-- Discovery: exclude banned/suspended/blocked/already-swiped profiles
-- ---------------------------------------------------------------------------

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

notify pgrst, 'reload schema';
