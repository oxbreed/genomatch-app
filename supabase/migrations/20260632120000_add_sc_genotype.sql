-- Add SC (HbSC disease) to the supported genotype set.
--
-- HbSC is one of the most common sickle cell disorders in West Africa. Until
-- now the enum only carried AA, AS, SS and AC, so a member living with HbSC
-- had no way to describe themselves and would either pick a genotype that is
-- not theirs or leave the field empty. Both outcomes produce wrong risk
-- information for the people they match with.
--
-- Postgres allows ALTER TYPE ... ADD VALUE inside a transaction from 12
-- onwards, but the new label cannot be USED in that same transaction. The
-- function below is only redefined, never executed here, so this is safe.

alter type public.genotype_type add value if not exists 'SC';
