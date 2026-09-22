-- Taxa metabólica basal (calorias que o corpo queima parado), pra dar a
-- visão real do saldo do dia (consumido - basal - exercício) no Dashboard.
alter table public.vida_perfil
  add column if not exists tmb_kcal integer;

-- Cada meta agora diz se é um mínimo a bater (proteína, fibra, passos,
-- sono) ou um máximo a não ultrapassar (calorias, gordura, carboidrato)
-- -- sem isso, o Dashboard não sabia se "acima da meta" era bom ou ruim.
alter table public.vida_perfil
  add column if not exists meta_calorias_tipo text not null default 'maximo' check (meta_calorias_tipo in ('minimo', 'maximo')),
  add column if not exists meta_proteina_tipo text not null default 'minimo' check (meta_proteina_tipo in ('minimo', 'maximo')),
  add column if not exists meta_gordura_tipo text not null default 'maximo' check (meta_gordura_tipo in ('minimo', 'maximo')),
  add column if not exists meta_carboidrato_tipo text not null default 'maximo' check (meta_carboidrato_tipo in ('minimo', 'maximo')),
  add column if not exists meta_fibra_tipo text not null default 'minimo' check (meta_fibra_tipo in ('minimo', 'maximo')),
  add column if not exists meta_passos_tipo text not null default 'minimo' check (meta_passos_tipo in ('minimo', 'maximo')),
  add column if not exists meta_sono_tipo text not null default 'minimo' check (meta_sono_tipo in ('minimo', 'maximo'));

-- Preenche a TMB com a referência do seed inicial (bioimpedância Fitdays).
update public.vida_perfil set tmb_kcal = 1709 where tmb_kcal is null;
