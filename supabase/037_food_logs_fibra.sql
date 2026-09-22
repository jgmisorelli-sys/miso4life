-- Fibra na tela Registrar (food_logs), que não existia -- necessário pra
-- não precisar mais somar com o catálogo da Jornada (vida_refeicoes_itens)
-- pra ter o total de fibra do dia. Registrar passa a ser a única fonte de
-- verdade pra alimentação; a Jornada só lê os totais dali.
alter table public.food_logs
  add column if not exists fiber_g numeric;
