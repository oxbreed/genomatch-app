-- User reports and blocks for moderation

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(trim(reason)) > 0),
  details text,
  created_at timestamptz not null default now(),
  constraint reports_no_self check (reporter_id <> reported_id)
);

create index if not exists reports_reporter_idx on public.reports (reporter_id);
create index if not exists reports_reported_idx on public.reports (reported_id);

create table if not exists public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on public.blocks (blocker_id);
create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

alter table public.reports enable row level security;
alter table public.blocks enable row level security;

drop policy if exists "Users can insert their own reports" on public.reports;
create policy "Users can insert their own reports"
  on public.reports for insert to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "Users can view their own reports" on public.reports;
create policy "Users can view their own reports"
  on public.reports for select to authenticated
  using (auth.uid() = reporter_id);

drop policy if exists "Users can insert their own blocks" on public.blocks;
create policy "Users can insert their own blocks"
  on public.blocks for insert to authenticated
  with check (auth.uid() = blocker_id);

drop policy if exists "Users can view their own blocks" on public.blocks;
create policy "Users can view their own blocks"
  on public.blocks for select to authenticated
  using (auth.uid() = blocker_id);

drop policy if exists "Users can delete their own blocks" on public.blocks;
create policy "Users can delete their own blocks"
  on public.blocks for delete to authenticated
  using (auth.uid() = blocker_id);
