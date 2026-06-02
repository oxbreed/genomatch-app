-- Likes + passes for Discovery (replaces swipes for like/match flow)

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  liker_id uuid not null references public.profiles (id) on delete cascade,
  liked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint likes_no_self check (liker_id <> liked_id),
  unique (liker_id, liked_id)
);

create index if not exists likes_liker_idx on public.likes (liker_id);
create index if not exists likes_liked_idx on public.likes (liked_id);

create table if not exists public.passes (
  id uuid primary key default gen_random_uuid(),
  passer_id uuid not null references public.profiles (id) on delete cascade,
  passed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint passes_no_self check (passer_id <> passed_id),
  unique (passer_id, passed_id)
);

create index if not exists passes_passer_idx on public.passes (passer_id);

alter table public.likes enable row level security;
alter table public.passes enable row level security;

create policy "Users can view likes they sent or received"
  on public.likes for select to authenticated
  using (auth.uid() = liker_id or auth.uid() = liked_id);

create policy "Users can insert their own likes"
  on public.likes for insert to authenticated
  with check (auth.uid() = liker_id);

create policy "Users can update their own likes"
  on public.likes for update to authenticated
  using (auth.uid() = liker_id)
  with check (auth.uid() = liker_id);

create policy "Users can view their own passes"
  on public.passes for select to authenticated
  using (auth.uid() = passer_id);

create policy "Users can insert their own passes"
  on public.passes for insert to authenticated
  with check (auth.uid() = passer_id);

create policy "Users can update their own passes"
  on public.passes for update to authenticated
  using (auth.uid() = passer_id)
  with check (auth.uid() = passer_id);

-- Ensure matches table exists (from prior migration; safe if already applied)
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.profiles (id) on delete cascade,
  user_b_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint matches_no_self check (user_a_id <> user_b_id),
  constraint matches_ordered check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

alter table public.matches enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'matches'
      and policyname = 'Users can view their matches'
  ) then
    create policy "Users can view their matches"
      on public.matches for select to authenticated
      using (auth.uid() = user_a_id or auth.uid() = user_b_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'matches'
      and policyname = 'Users can create matches they participate in'
  ) then
    create policy "Users can create matches they participate in"
      on public.matches for insert to authenticated
      with check (auth.uid() = user_a_id or auth.uid() = user_b_id);
  end if;
end $$;
