-- Self-declared genotype verification (trust signal for matches)

alter table public.profiles
  add column if not exists verification_status text not null default 'unverified',
  add column if not exists genotype_verified boolean not null default false;
