-- Social graph: swipes, matches, messages + profile fields

alter table public.profiles
  add column if not exists gender text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists relationship_goal text;

create type public.swipe_direction as enum ('like', 'pass');

create table public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid not null references public.profiles (id) on delete cascade,
  swiped_id uuid not null references public.profiles (id) on delete cascade,
  direction public.swipe_direction not null,
  created_at timestamptz not null default now(),
  constraint swipes_no_self check (swiper_id <> swiped_id),
  unique (swiper_id, swiped_id)
);

create index swipes_swiper_idx on public.swipes (swiper_id);
create index swipes_swiped_idx on public.swipes (swiped_id);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint matches_no_self check (user_a_id <> user_b_id),
  constraint matches_ordered check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index matches_user_a_idx on public.matches (user_a_id);
create index matches_user_b_idx on public.matches (user_b_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index messages_match_created_idx on public.messages (match_id, created_at);

-- RLS
alter table public.swipes enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;

create policy "Users can view their own swipes"
  on public.swipes for select to authenticated
  using (auth.uid() = swiper_id or auth.uid() = swiped_id);

create policy "Users can insert their own swipes"
  on public.swipes for insert to authenticated
  with check (auth.uid() = swiper_id);

create policy "Users can view their matches"
  on public.matches for select to authenticated
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can create matches they participate in"
  on public.matches for insert to authenticated
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Users can view messages in their matches"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

create policy "Users can send messages in their matches"
  on public.messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );

-- Enable Realtime for messages in Supabase Dashboard:
-- Database → Replication → supabase_realtime → add public.messages
