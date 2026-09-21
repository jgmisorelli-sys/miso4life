-- Metas diárias de nutrição e atividade, usadas pelo resumo do Dashboard.
-- Valores padrão vêm da referência da Fase 1 (seção 6.1) e ficam
-- editáveis na tela Configurações, sem precisar de deploy.
alter table public.vida_perfil
  add column if not exists meta_calorias_kcal integer not null default 1950,
  add column if not exists meta_proteina_g numeric not null default 150,
  add column if not exists meta_gordura_g numeric not null default 62,
  add column if not exists meta_carboidrato_g numeric not null default 190,
  add column if not exists meta_fibra_g numeric not null default 30,
  add column if not exists meta_passos integer not null default 8000,
  add column if not exists meta_sono_horas numeric not null default 7;
