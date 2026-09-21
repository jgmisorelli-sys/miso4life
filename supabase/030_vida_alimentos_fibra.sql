-- Adiciona fibra ao catálogo e completa os alimentos semeados na 028 com a
-- informação nutricional inteira (proteína, gordura, carboidrato, fibra) da
-- tabela da dieta sugerida.
alter table public.vida_alimentos_catalogo
  add column if not exists fibra_g_por_porcao numeric;

-- ANTES DE RODAR: troque 'SEU_EMAIL_AQUI' pelo e-mail que você usa para
-- entrar no miso4life. Seguro rodar mais de uma vez (idempotente) -- faz
-- upsert pelo nome do alimento, então atualiza em vez de duplicar.
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'SEU_EMAIL_AQUI';

  if v_user_id is null then
    raise exception 'Usuário não encontrado. Troque SEU_EMAIL_AQUI pelo e-mail de login no miso4life.';
  end if;

  insert into public.vida_alimentos_catalogo
    (user_id, nome, categoria, porcao_label, kcal_por_porcao, proteina_g_por_porcao, gordura_g_por_porcao, carboidrato_g_por_porcao, fibra_g_por_porcao)
  values
    (v_user_id, 'Tapioca (goma hidratada, massa pronta)', 'carboidrato', '35 g', 85, 0, 0, 21, 0),
    (v_user_id, 'Ovos cozidos', 'proteina', '3 unidades (cerca de 150 g sem casca)', 220, 19, 14, 1, 0),
    (v_user_id, 'Filé mignon grelhado', 'proteina', '75 g', 165, 25, 7, 0, 0),
    (v_user_id, 'Filé de peixe grelhado (tilápia ou pescada)', 'proteina', '50 g', 65, 13, 1, 0, 0),
    (v_user_id, 'Arroz branco cozido', 'carboidrato', '3 colheres de sopa (cerca de 75 g)', 95, 2, 0, 21, 1),
    (v_user_id, 'Brócolis no vapor', 'vegetal', '1 talo (cerca de 70 g)', 18, 2, 0, 3, 2),
    (v_user_id, 'Espinafre no vapor', 'vegetal', '3 folhas (cerca de 30 g)', 7, 1, 0, 1, 1)
  on conflict (user_id, nome) do update set
    categoria = excluded.categoria,
    porcao_label = excluded.porcao_label,
    kcal_por_porcao = excluded.kcal_por_porcao,
    proteina_g_por_porcao = excluded.proteina_g_por_porcao,
    gordura_g_por_porcao = excluded.gordura_g_por_porcao,
    carboidrato_g_por_porcao = excluded.carboidrato_g_por_porcao,
    fibra_g_por_porcao = excluded.fibra_g_por_porcao;

  -- Não estava na tabela nova, mas fica com uma estimativa de gordura pra
  -- não ficar zerada (salmão é uma proteína mais gordurosa).
  update public.vida_alimentos_catalogo
  set gordura_g_por_porcao = 6, fibra_g_por_porcao = 0
  where user_id = v_user_id and nome = 'Filé de peixe grelhado (salmão)';
end $$;
