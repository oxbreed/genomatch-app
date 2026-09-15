-- Proactive content moderation (App Store Guideline 1.2).
--
-- The client screens text before sending, but anyone holding the anon key can
-- insert straight into the table, so the same rules are enforced here. The
-- trigger rejects hard-blocked content and records everything else that needs
-- a human look.

-- 1. Review queue -----------------------------------------------------------

create table if not exists public.moderation_queue (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('message', 'profile', 'photo', 'report')),
  subject_id uuid,
  author_id uuid references public.profiles (id) on delete cascade,
  category text,
  excerpt text,
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  resolution_note text
);

create index if not exists moderation_queue_status_idx
  on public.moderation_queue (status, created_at desc);
create index if not exists moderation_queue_author_idx
  on public.moderation_queue (author_id);

alter table public.moderation_queue enable row level security;

-- No member-facing policies: the queue is service-role only. Without a policy
-- RLS denies everything to anon and authenticated, which is what we want.

-- 2. Report lifecycle -------------------------------------------------------

alter table public.reports
  add column if not exists status text not null default 'open'
    check (status in ('open', 'actioned', 'dismissed')),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles (id) on delete set null,
  add column if not exists resolution_note text;

create index if not exists reports_status_idx on public.reports (status, created_at desc);

-- 3. Message moderation column ---------------------------------------------

alter table public.messages
  add column if not exists moderation_category text;

-- 4. Server-side screening --------------------------------------------------

-- Mirrors normaliseForMatching() in src/lib/contentModeration.ts: fold case,
-- undo common character substitution, collapse runs and strip punctuation so
-- "s3nd  m0ney!!!" and "send money" land on the same string.
create or replace function public.normalise_for_matching(input text)
returns text
language sql
immutable
as $$
  select trim(regexp_replace(
    regexp_replace(
      translate(lower(coalesce(input, '')), '0@1!|354 7', 'ooiiiesa t'),
      '[^a-z0-9[:space:]]', ' ', 'g'
    ),
    '\s+', ' ', 'g'
  ));
$$;

comment on function public.normalise_for_matching(text) is
  'Keep in sync with normaliseForMatching() in src/lib/contentModeration.ts';

create table if not exists public.moderation_rules (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  pattern text not null,
  action text not null default 'block' check (action in ('block', 'flag')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.moderation_rules enable row level security;
-- Service role only, same as the queue.

insert into public.moderation_rules (category, pattern, action)
select * from (values
  ('minor_safety',        '(^|\s)(underage|under age|jailbait|school girl|school boy)(\s|$)', 'block'),
  ('sexual_solicitation', '(^|\s)(send nudes?|nude pics?|nude photos?|naked pics?|dick pic|sex chat|want sex|for sex|horny)(\s|$)', 'block'),
  ('threat',              '(^|\s)(i will kill you|kill yourself|kys|i will hurt you|i will find you|rape you|you will die)(\s|$)', 'block'),
  ('scam_or_payment',     '(^|\s)(send me money|send money|gift card|bitcoin|btc wallet|usdt|crypto wallet|western union|wire transfer|bank details|account number|atm pin|bvn)(\s|$)', 'block'),
  ('slur',                '(^|\s)(nigg[ae]rs?|fagg?[oe]ts?|trann(y|ies)|ret[a]rds?|cunts?)(\s|$)', 'block'),
  ('contact_details',     '((\+?234|0)[0-9]{10}|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}|wa\.me|t\.me|telegram|whatsapp|snapchat|cashapp|paypal)', 'flag')
) as seed(category, pattern, action)
where not exists (select 1 from public.moderation_rules);

-- Screen a message on insert. Blocked content raises, so the row is never
-- written; flagged content is written and queued for review.
create or replace function public.screen_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalised text;
  rule record;
begin
  normalised := public.normalise_for_matching(new.body);

  for rule in
    select category, pattern, action
    from public.moderation_rules
    where active
    order by case action when 'block' then 0 else 1 end
  loop
    if normalised ~ rule.pattern or new.body ~* rule.pattern then
      if rule.action = 'block' then
        raise exception 'content_blocked:%', rule.category
          using errcode = 'check_violation';
      end if;

      new.moderation_category := rule.category;

      insert into public.moderation_queue (subject_type, subject_id, author_id, category, excerpt)
      values ('message', new.id, new.sender_id, rule.category, left(new.body, 280));

      exit;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists screen_message_before_insert on public.messages;
create trigger screen_message_before_insert
  before insert on public.messages
  for each row execute function public.screen_message();

-- Same screening for the public-facing profile text fields.
create or replace function public.screen_profile_text()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  combined text;
  normalised text;
  rule record;
begin
  combined := concat_ws(' ', new.display_name, new.bio);
  if combined is null or btrim(combined) = '' then
    return new;
  end if;

  normalised := public.normalise_for_matching(combined);

  for rule in
    select category, pattern from public.moderation_rules where active
  loop
    if normalised ~ rule.pattern or combined ~* rule.pattern then
      -- Profiles are public, so contact details are blocked here even though
      -- they are only flagged in chat.
      raise exception 'content_blocked:%', rule.category
        using errcode = 'check_violation';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists screen_profile_text_before_write on public.profiles;
create trigger screen_profile_text_before_write
  before insert or update of display_name, bio on public.profiles
  for each row execute function public.screen_profile_text();

-- Every report lands in the queue too, so one surface shows all outstanding work.
create or replace function public.queue_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.moderation_queue (subject_type, subject_id, author_id, category, excerpt)
  values ('report', new.id, new.reported_id, 'report', left(coalesce(new.details, new.reason), 280));
  return new;
end;
$$;

drop trigger if exists queue_report_after_insert on public.reports;
create trigger queue_report_after_insert
  after insert on public.reports
  for each row execute function public.queue_report();

-- Photos cannot be screened by pattern, so every newly added photo is queued
-- for a human. This is the filtering method for images: automated screening for
-- text, human review for pictures, report and block for anything that slips
-- through.
create or replace function public.queue_new_photos()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  added text[];
  previous text[];
begin
  -- OLD is unassigned on INSERT and referencing it raises, so branch first
  -- rather than relying on SQL short-circuiting inside the query below.
  if tg_op = 'INSERT' then
    previous := '{}';
  else
    previous := coalesce(old.photos, '{}');
  end if;

  select coalesce(array_agg(p), '{}')
  into added
  from unnest(coalesce(new.photos, '{}')) as p
  where p <> all (previous);

  if array_length(added, 1) is null then
    return new;
  end if;

  insert into public.moderation_queue (subject_type, subject_id, author_id, category, excerpt)
  values ('photo', new.id, new.id, 'photo_review', left(array_to_string(added, ' '), 280));

  return new;
end;
$$;

drop trigger if exists queue_new_photos_after_write on public.profiles;
create trigger queue_new_photos_after_write
  after insert or update of photos on public.profiles
  for each row execute function public.queue_new_photos();
