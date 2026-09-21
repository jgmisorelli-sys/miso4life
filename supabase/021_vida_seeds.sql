-- Seed inicial do Plano 60 Dias (Jornada) para o seu usuário.
--
-- ANTES DE RODAR: troque 'SEU_EMAIL_AQUI' pelo e-mail que você usa para
-- entrar no miso4life. Rode este script inteiro de uma vez no SQL Editor.
-- É seguro rodar mais de uma vez (todo insert é idempotente).
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from auth.users where email = 'SEU_EMAIL_AQUI';

  if v_user_id is null then
    raise exception 'Usuário não encontrado. Troque SEU_EMAIL_AQUI pelo e-mail de login no miso4life.';
  end if;

  -- Perfil. Ajuste data_nascimento e data_inicio_plano se quiser outra data de início.
  insert into public.vida_perfil (user_id, altura_cm, data_inicio_plano)
  values (v_user_id, 172, current_date)
  on conflict (user_id) do nothing;

  insert into public.vida_streak (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  insert into public.vida_familia_participantes (user_id, nome)
  values (v_user_id, 'Victor'), (v_user_id, 'Taciane'), (v_user_id, 'Joaquim')
  on conflict do nothing;

  -- Fases
  insert into public.vida_fases (user_id, numero, nome, meta_percentual_gordura, peso_estimado_kg, prazo_dias, status, data_inicio)
  values
    (v_user_id, 1, 'Ignição', 28, 86, 60, 'ativa', current_date),
    (v_user_id, 2, 'Consolidação', 25, 82.7, 60, 'planejada', null),
    (v_user_id, 3, 'Aceleração', 22, 79.5, 60, 'planejada', null),
    (v_user_id, 4, 'Maestria', 20, 77.5, 60, 'planejada', null)
  on conflict (user_id, numero) do nothing;

  -- Sprints de 10 dias da Fase 1
  insert into public.vida_sprints (user_id, fase_id, numero, tema, data_inicio, data_fim, meta_xp, status)
  select
    v_user_id,
    f.id,
    s.numero,
    s.tema,
    current_date + (s.numero - 1) * 10,
    current_date + s.numero * 10 - 1,
    800,
    case when s.numero = 1 then 'ativa' else 'planejada' end
  from public.vida_fases f
  cross join (values
    (1, 'Base (sono, água, horários)'),
    (2, 'Proteína e prato'),
    (3, 'Café e jantar cedo'),
    (4, 'Progressão de força'),
    (5, 'Eventos sociais'),
    (6, 'Chefe da fase')
  ) as s(numero, tema)
  where f.user_id = v_user_id and f.numero = 1
  on conflict (fase_id, numero) do nothing;

  -- Missões diárias (somam 100 XP)
  insert into public.vida_missoes_config (user_id, codigo, nome, tipo, xp, ordem)
  values
    (v_user_id, 'minimo_dia', 'Mínimo do dia (5 minutos)', 'diaria', 10, 1),
    (v_user_id, 'treino_previsto', 'Treino previsto do dia', 'diaria', 25, 2),
    (v_user_id, 'meta_passos', 'Meta de passos do dia', 'diaria', 10, 3),
    (v_user_id, 'proteina_refeicoes', 'Proteína em todas as refeições', 'diaria', 15, 4),
    (v_user_id, 'regra_prato', 'Regra do prato no almoço e jantar', 'diaria', 15, 5),
    (v_user_id, 'zero_liquido_calorico', 'Zero líquido calórico', 'diaria', 5, 6),
    (v_user_id, 'jantar_cedo', 'Jantar até 3h antes de deitar', 'diaria', 10, 7),
    (v_user_id, 'dormir_2330', 'Na cama até 23:30', 'diaria', 10, 8)
  on conflict (user_id, codigo) do nothing;

  -- Missões semanais
  insert into public.vida_missoes_config (user_id, codigo, nome, tipo, xp, ordem)
  values
    (v_user_id, 'semana_4_treinos', '4 treinos fixos da semana concluídos', 'semanal', 60, 1),
    (v_user_id, 'semana_7_minimos', '7 de 7 mínimos do dia cumpridos', 'semanal', 40, 2),
    (v_user_id, 'semana_media_passos', 'Média de passos da semana acima da meta', 'semanal', 30, 3),
    (v_user_id, 'semana_evento_social', 'Evento social vencido', 'semanal', 50, 4),
    (v_user_id, 'semana_bonus_familia', 'Bônus de família', 'semanal', 20, 5),
    (v_user_id, 'semana_bioimpedancia', 'Bioimpedância nas condições padrão', 'semanal', 50, 6)
  on conflict (user_id, codigo) do nothing;

  -- Plano de treino semanal inicial (seção 8 do plano)
  insert into public.vida_treinos_plano (user_id, dia_semana, nome_sessao, duracao_min_estimado, fixo, ordem)
  values
    (v_user_id, 'segunda', 'Circuito funcional A', 40, true, 1),
    (v_user_id, 'terca', 'Cardio leve', 30, false, 2),
    (v_user_id, 'quarta', 'Dia mínimo: mobilidade ou caminhada', 15, false, 3),
    (v_user_id, 'quinta', 'HIT', 25, true, 4),
    (v_user_id, 'sexta', 'Circuito funcional B', 40, true, 5),
    (v_user_id, 'sabado', 'Esporte em família', 60, true, 6),
    (v_user_id, 'domingo', 'Caminhada com a Taciane', 40, false, 7)
  on conflict (user_id, dia_semana) do nothing;

  -- Lembretes (push, ainda sem canal WhatsApp implementado)
  insert into public.vida_lembretes_config (user_id, tipo, horario, canal, mensagem)
  values
    (v_user_id, 'manha', '06:45', 'push', 'Bom dia! Sua missão do dia está pronta.'),
    (v_user_id, 'janela_treino', '17:30', 'push', 'Ainda dá tempo de treinar hoje.'),
    (v_user_id, 'fechamento_dia', '21:00', 'push', 'Como foi o dia? Confira seu XP.'),
    (v_user_id, 'resumo_semana', '20:00', 'push', 'Resumo da sua semana está pronto.'),
    (v_user_id, 'pre_bioimpedancia', null, 'push', 'Lembrete: bioimpedância pela manhã, em jejum, sem treino nas últimas 12h.')
  on conflict (user_id, tipo, canal) do nothing;

  -- Recompensas
  insert into public.vida_recompensas_config (user_id, gatilho, nome, valor, regra)
  values
    (v_user_id, 'semana_650_xp_4_treinos', 'Refeição livre planejada + 2h de tempo livre', 0, '{"xp_min": 650, "treinos_min": 4}'::jsonb),
    (v_user_id, 'sprint_800_xp', 'Prêmio de sprint', 100, '{"xp_min": 800}'::jsonb),
    (v_user_id, 'chefe_mes', 'Chefe do mês', 200, '{}'::jsonb),
    (v_user_id, 'fase_concluida', 'Cofre da fase concluída', 500, '{}'::jsonb)
  on conflict (user_id, gatilho) do nothing;

  -- Medida inicial: bioimpedância Fitdays de 21/09/2026, 08:32, em jejum.
  insert into public.vida_medidas (user_id, data, tipo, valores, observacao)
  values (
    v_user_id,
    '2026-09-21',
    'bioimpedancia',
    jsonb_build_object(
      'peso_kg', 89.6,
      'massa_gorda_kg', 27.6,
      'massa_gorda_pct', 30.8,
      'massa_muscular_esqueletica_kg', 35.3,
      'massa_livre_gordura_kg', 62.0,
      'gordura_visceral', 11,
      'tmb_kcal', 1709,
      'imc', 30.3,
      'whr', 0.89
    ),
    'Medição Fitdays, manhã, jejum, sem treino nas 12h anteriores'
  )
  on conflict (user_id, data, tipo) do nothing;

end $$;
