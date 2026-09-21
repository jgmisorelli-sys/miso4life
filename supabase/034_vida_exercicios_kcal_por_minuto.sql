-- Exercícios passam a ser cadastrados por kcal/minuto -- com a duração
-- real do treino, o app calcula o total gasto. kcal_estimado continua
-- existindo como cache/estimativa (duração padrão × kcal/min), calculado
-- no momento do cadastro.
alter table public.vida_exercicios_catalogo
  add column if not exists kcal_por_minuto numeric;

-- Retrocompatibilidade: para os exercícios já semeados (031/033) com
-- kcal fixo e duração, deriva um kcal/min equivalente.
update public.vida_exercicios_catalogo
set kcal_por_minuto = round((kcal_estimado / duracao_min_estimado)::numeric, 2)
where kcal_por_minuto is null
  and duracao_min_estimado is not null
  and duracao_min_estimado > 0;
