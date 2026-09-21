-- Catálogo de exercícios/atividades reutilizáveis, cada um com uma
-- estimativa de gasto calórico -- o mesmo padrão do catálogo de
-- alimentos. Permite trocar o treino previsto do dia por outro exercício
-- e o sistema avaliar pelo gasto energético, não pelo nome da sessão.
create table if not exists public.vida_exercicios_catalogo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  categoria text not null default 'outro' check (categoria in ('forca', 'aerobico', 'mobilidade', 'esporte', 'outro')),
  kcal_estimado numeric not null default 0,
  duracao_min_estimado integer,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, nome)
);

alter table public.vida_exercicios_catalogo enable row level security;

create policy "vida_exercicios_catalogo_own"
  on public.vida_exercicios_catalogo for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_exercicios_catalogo_updated_at
  before update on public.vida_exercicios_catalogo
  for each row execute procedure public.vida_set_updated_at();
