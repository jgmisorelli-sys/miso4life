-- Função utilitária reaproveitada por todas as tabelas do módulo vida_ que têm updated_at.
create or replace function public.vida_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
