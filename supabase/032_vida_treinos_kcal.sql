-- Meta de kcal do treino previsto no plano semanal.
alter table public.vida_treinos_plano
  add column if not exists kcal_estimado numeric;

-- Cada treino feito passa a poder vir de um exercício do catálogo (em vez
-- da sessão prevista) e carrega quantas calorias realmente valeram, pra
-- comparar com a meta do dia.
alter table public.vida_treinos_feitos
  add column if not exists exercicio_catalogo_id uuid references public.vida_exercicios_catalogo (id) on delete set null,
  add column if not exists kcal_realizado numeric;
