-- Realtime for live chat, faster conversation previews, and Expo push on match/message

create extension if not exists pg_net with schema extensions;

-- Enable postgres_changes for messages and matches (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;
end $$;

-- Latest message per match without scanning the full messages table on the client
create or replace function public.get_my_conversation_previews()
returns table (
  match_id uuid,
  other_user_id uuid,
  last_message_body text,
  last_message_at timestamptz,
  last_sender_id uuid,
  last_read_at timestamptz,
  match_created_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    m.id,
    case when m.user_a_id = auth.uid() then m.user_b_id else m.user_a_id end,
    lm.body,
    coalesce(lm.created_at, m.created_at),
    lm.sender_id,
    lm.read_at,
    m.created_at
  from public.matches m
  left join lateral (
    select msg.body, msg.created_at, msg.sender_id, msg.read_at
    from public.messages msg
    where msg.match_id = m.id
    order by msg.created_at desc
    limit 1
  ) lm on true
  where m.user_a_id = auth.uid() or m.user_b_id = auth.uid()
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

grant execute on function public.get_my_conversation_previews() to authenticated;

create or replace function public.send_expo_push(
  push_token text,
  title text,
  body text,
  data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if push_token is null or length(trim(push_token)) = 0 then
    return;
  end if;

  perform net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    ),
    body := jsonb_build_object(
      'to', push_token,
      'title', title,
      'body', body,
      'sound', 'default',
      'priority', 'high',
      'data', data
    )
  );
end;
$$;

create or replace function public.notify_message_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_id uuid;
  recipient_token text;
  sender_name text;
begin
  select case
    when m.user_a_id = new.sender_id then m.user_b_id
    else m.user_a_id
  end
  into recipient_id
  from public.matches m
  where m.id = new.match_id;

  if recipient_id is null then
    return new;
  end if;

  select p.expo_push_token
  into recipient_token
  from public.profiles p
  where p.id = recipient_id
    and (
      p.last_active_at is null
      or p.last_active_at < now() - interval '45 seconds'
    );

  if recipient_token is null then
    return new;
  end if;

  select coalesce(nullif(trim(p.display_name), ''), 'Someone')
  into sender_name
  from public.profiles p
  where p.id = new.sender_id;

  perform public.send_expo_push(
    recipient_token,
    sender_name,
    left(new.body, 180),
    jsonb_build_object('type', 'message', 'matchId', new.match_id)
  );

  return new;
end;
$$;

drop trigger if exists notify_message_push_after_insert on public.messages;
create trigger notify_message_push_after_insert
  after insert on public.messages
  for each row execute function public.notify_message_push();

create or replace function public.notify_match_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_token text;
  other_name text;
begin
  select p.expo_push_token
  into recipient_token
  from public.profiles p
  where p.id = new.user_a_id
    and (
      p.last_active_at is null
      or p.last_active_at < now() - interval '45 seconds'
    );

  if recipient_token is not null then
    select coalesce(nullif(trim(op.display_name), ''), 'Someone')
    into other_name
    from public.profiles op
    where op.id = new.user_b_id;

    perform public.send_expo_push(
      recipient_token,
      'New match on GenoMatch',
      'You matched with ' || other_name || '. Say hello!',
      jsonb_build_object('type', 'match', 'matchId', new.id)
    );
  end if;

  select p.expo_push_token
  into recipient_token
  from public.profiles p
  where p.id = new.user_b_id
    and (
      p.last_active_at is null
      or p.last_active_at < now() - interval '45 seconds'
    );

  if recipient_token is not null then
    select coalesce(nullif(trim(op.display_name), ''), 'Someone')
    into other_name
    from public.profiles op
    where op.id = new.user_a_id;

    perform public.send_expo_push(
      recipient_token,
      'New match on GenoMatch',
      'You matched with ' || other_name || '. Say hello!',
      jsonb_build_object('type', 'match', 'matchId', new.id)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists notify_match_push_after_insert on public.matches;
create trigger notify_match_push_after_insert
  after insert on public.matches
  for each row execute function public.notify_match_push();
