-- Audit hardening: push tokens, deletion requests, DB integrity triggers, RLS gaps

alter table public.profiles
  add column if not exists expo_push_token text,
  add column if not exists deletion_requested_at timestamptz;

comment on column public.profiles.expo_push_token is 'Expo push token for match/message notifications';
comment on column public.profiles.deletion_requested_at is 'When the member requested account deletion';

-- Matches require bilateral likes (blocks forged match inserts)
create or replace function public.validate_match_mutual_like()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.likes l1
    where l1.liker_id = new.user_a_id and l1.liked_id = new.user_b_id
  ) or not exists (
    select 1 from public.likes l2
    where l2.liker_id = new.user_b_id and l2.liked_id = new.user_a_id
  ) then
    raise exception 'Match requires mutual likes';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_match_mutual_like_before_insert on public.matches;
create trigger validate_match_mutual_like_before_insert
  before insert on public.matches
  for each row execute function public.validate_match_mutual_like();

-- Message updates limited to read_at (recipients marking read)
create or replace function public.messages_update_read_at_only()
returns trigger
language plpgsql
as $$
begin
  if new.body is distinct from old.body
     or new.sender_id is distinct from old.sender_id
     or new.match_id is distinct from old.match_id
     or new.created_at is distinct from old.created_at
  then
    raise exception 'Only read_at may be updated on messages';
  end if;
  return new;
end;
$$;

drop trigger if exists messages_update_read_at_only on public.messages;
create trigger messages_update_read_at_only
  before update on public.messages
  for each row execute function public.messages_update_read_at_only();

-- Genotype cannot change after self-declared verification
create or replace function public.protect_verified_genotype()
returns trigger
language plpgsql
as $$
begin
  if old.genotype_verified = true and new.genotype is distinct from old.genotype then
    raise exception 'Genotype cannot be changed after verification';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_verified_genotype_before_update on public.profiles;
create trigger protect_verified_genotype_before_update
  before update on public.profiles
  for each row execute function public.protect_verified_genotype();

-- Allow users to remove their own likes/passes (unmatch / sever connection)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'likes'
      and policyname = 'Users can delete their own likes'
  ) then
    create policy "Users can delete their own likes"
      on public.likes for delete to authenticated
      using (auth.uid() = liker_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'passes'
      and policyname = 'Users can delete their own passes'
  ) then
    create policy "Users can delete their own passes"
      on public.passes for delete to authenticated
      using (auth.uid() = passer_id);
  end if;
end $$;
