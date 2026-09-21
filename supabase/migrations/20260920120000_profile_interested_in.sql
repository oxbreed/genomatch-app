-- Discovery preference stored on the member's own profile (not a public filter column).
-- Client gates first-run with InterestedInGate and persists FilterSheet "Show me".

alter table public.profiles
  add column if not exists interested_in text[];

comment on column public.profiles.interested_in is
  'Who this member wants to see in Discover: women, men, everyone, beyond_binary.';
