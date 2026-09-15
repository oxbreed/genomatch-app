-- Accept 'SC' from signup metadata.
--
-- Separate migration from the ALTER TYPE that introduces the label: Postgres
-- will not let a new enum value be used in the same transaction that added it.

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
      when meta_genotype in ('AA', 'AS', 'SS', 'AC', 'SC')
      then meta_genotype::public.genotype_type
      else null
    end
  );

  return new;
end;
$$;
