-- Uma refeição por (usuário, dia, tipo) -- necessário para o upsert seguro
-- ao anexar um item do catálogo a uma refeição que ainda não existe.
create unique index if not exists vida_refeicoes_user_data_tipo_idx
  on public.vida_refeicoes (user_id, data, tipo_refeicao);
