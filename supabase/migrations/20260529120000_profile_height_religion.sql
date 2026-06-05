-- Profile details: height and religion for matching & discovery filters

alter table public.profiles
  add column if not exists height_cm smallint
    check (height_cm is null or (height_cm >= 120 and height_cm <= 230)),
  add column if not exists religion text;

comment on column public.profiles.height_cm is 'User height in centimetres';
comment on column public.profiles.religion is 'User religion / faith preference slug';
