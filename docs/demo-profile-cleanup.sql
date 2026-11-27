-- Reversible cleanup for App Review demo profiles seeded on 27 Nov 2026 (UK time).
-- Deletes only auth users whose email is on the demo.genomatch.app domain.
-- Related profiles, photos, likes, passes, matches, messages, reports, blocks,
-- and moderation queue rows cascade from those auth users.
-- Does not touch any other accounts.

delete from auth.identities
where user_id in (
  select id from auth.users
  where email like '%@demo.genomatch.app'
);

delete from auth.users
where email like '%@demo.genomatch.app';
