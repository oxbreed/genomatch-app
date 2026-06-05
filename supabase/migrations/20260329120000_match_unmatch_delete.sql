-- Allow participants to remove a mutual match (unmatch)

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'Users can delete their matches'
  ) then
    create policy "Users can delete their matches"
      on public.matches for delete to authenticated
      using (auth.uid() = user_a_id or auth.uid() = user_b_id);
  end if;
end $$;
