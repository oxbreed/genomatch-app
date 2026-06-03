-- Read receipts: when the recipient opens the chat, their client sets read_at

alter table public.messages
  add column if not exists read_at timestamptz;

create policy "Recipients can mark messages as read"
  on public.messages for update to authenticated
  using (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  )
  with check (
    sender_id <> auth.uid()
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user_a_id = auth.uid() or m.user_b_id = auth.uid())
    )
  );
