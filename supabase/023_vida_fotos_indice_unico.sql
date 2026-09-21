-- Permite reenviar/substituir a foto de um ângulo no mesmo dia sem duplicar
-- a linha (o upload no Storage já sobrescreve o arquivo; isso garante que o
-- registro na tabela também seja um upsert em vez de sempre um insert novo).
create unique index if not exists vida_fotos_user_data_angulo_idx
  on public.vida_fotos (user_id, data, angulo);
