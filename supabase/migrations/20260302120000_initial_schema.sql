-- GenoMatch initial schema: profiles + auth sync

create extension if not exists "pgcrypto";

-- Genotype values used in the app
create type public.genotype_type as enum ('AA', 'AS', 'SS', 'AC');

-- User profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  genotype public.genotype_type,
  display_name text,
  avatar_url text,
  bio text,
  date_of_birth date,
  city text,
  country text default 'NG',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'GenoMatch user profiles for genotype-aware matching';

create index profiles_genotype_idx on public.profiles (genotype);

-- Keep updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Create profile row when a user signs up (genotype from signUp metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_genotype text;
begin
  meta_genotype := new.raw_user_meta_data ->> 'genotype';

  insert into public.profiles (id, email, genotype)
  values (
    new.id,
    new.email,
    case
      when meta_genotype in ('AA', 'AS', 'SS', 'AC')
      then meta_genotype::public.genotype_type
      else null
    end
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

create policy "Authenticated users can view profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
