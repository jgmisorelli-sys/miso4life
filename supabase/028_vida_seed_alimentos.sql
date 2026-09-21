-- Semeia o catálogo de alimentos com os itens do seu dia (tapioca, ovos,
-- filé mignon, peixe, arroz, brócolis, espinafre). Você pode adicionar mais
-- a qualquer momento pela tela Jornada → Guia → Catálogo de alimentos.
--
-- ANTES DE RODAR: troque 'SEU_EMAIL_AQUI' pelo e-mail que você usa para
-- entrar no miso4life. Seguro rodar mais de uma vez (idempotente).
-- Garante que dá pra rodar este script mais de uma vez sem duplicar o
-- mesmo alimento (não existia essa unicidade antes).
create unique index if not exists vida_alimentos_catalogo_user_nome_idx
  on public.vida_alimentos_catalogo (user_id, nome);

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'SEU_EMAIL_AQUI';

  if v_user_id is null then
    raise exception 'Usuário não encontrado. Troque SEU_EMAIL_AQUI pelo e-mail de login no miso4life.';
  end if;

  insert into public.vida_alimentos_catalogo
    (user_id, nome, categoria, porcao_label, kcal_por_porcao, proteina_g_por_porcao)
  values
    (v_user_id, 'Tapioca (goma hidratada, massa pronta)', 'carboidrato', '35 g', 85, 0),
    (v_user_id, 'Tapioca (fécula seca, antes de hidratar)', 'carboidrato', '35 g', 120, 0),
    (v_user_id, 'Ovos cozidos', 'proteina', '3 unidades (cerca de 150 g sem casca)', 220, 19),
    (v_user_id, 'Filé mignon grelhado', 'proteina', '75 g', 165, 25),
    (v_user_id, 'Filé de peixe grelhado (tilápia ou pescada)', 'proteina', '50 g', 65, 13),
    (v_user_id, 'Filé de peixe grelhado (salmão)', 'proteina', '50 g', 105, 11),
    (v_user_id, 'Arroz branco cozido', 'carboidrato', '3 colheres de sopa (cerca de 75 g)', 95, 2),
    (v_user_id, 'Brócolis no vapor', 'vegetal', '1 talo (cerca de 60 g)', 20, 2),
    (v_user_id, 'Espinafre no vapor', 'vegetal', '3 folhas (cerca de 30 g)', 7, 1)
  on conflict (user_id, nome) do nothing;
end $$;
