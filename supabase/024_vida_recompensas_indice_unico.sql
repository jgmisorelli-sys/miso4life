-- Evita duplicar a mesma recompensa (ex: a recompensa semanal da semana de
-- 2026-09-21) se a condição de liberação for checada mais de uma vez.
create unique index if not exists vida_recompensas_dedupe_idx
  on public.vida_recompensas (user_id, recompensa_config_id, referencia_tipo, referencia_id);
