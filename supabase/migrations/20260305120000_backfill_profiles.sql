-- Backfill profiles for auth users created before the signup trigger existed
insert into public.profiles (id, email, genotype)
select
  u.id,
  u.email,
  case
    when u.raw_user_meta_data ->> 'genotype' in ('AA', 'AS', 'SS', 'AC')
    then (u.raw_user_meta_data ->> 'genotype')::public.genotype_type
    else null
  end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
