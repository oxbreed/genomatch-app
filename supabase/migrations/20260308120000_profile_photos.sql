-- Additional profile photos (Cloudinary URLs); avatar_url remains the main photo

alter table public.profiles
  add column if not exists photos text[] not null default '{}';
