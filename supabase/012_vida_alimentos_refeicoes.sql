-- Catálogo de alimentos: o usuário cadastra o alimento uma vez com quanto vale
-- em calorias/macros por porção (palma, punho, polegar, prato), e nunca mais
-- precisa digitar número nenhum ao registrar uma refeição.
create table if not exists public.vida_alimentos_catalogo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  categoria text not null check (categoria in ('proteina', 'carboidrato', 'gordura', 'vegetal', 'outro')),
  porcao_label text not null default '1 porção',
  kcal_por_porcao numeric not null default 0,
  proteina_g_por_porcao numeric,
  carboidrato_g_por_porcao numeric,
  gordura_g_por_porcao numeric,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_alimentos_catalogo_user_idx on public.vida_alimentos_catalogo (user_id);

alter table public.vida_alimentos_catalogo enable row level security;

create policy "vida_alimentos_catalogo_own"
  on public.vida_alimentos_catalogo for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_alimentos_catalogo_updated_at
  before update on public.vida_alimentos_catalogo
  for each row execute procedure public.vida_set_updated_at();

-- Uma refeição registrada (café, almoço, lanche, jantar) num dia.
create table if not exists public.vida_refeicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  tipo_refeicao text not null check (tipo_refeicao in ('cafe', 'almoco', 'lanche', 'jantar')),
  proteina_ok boolean not null default false,
  prato_ok boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_refeicoes_user_data_idx on public.vida_refeicoes (user_id, data desc);

alter table public.vida_refeicoes enable row level security;

create policy "vida_refeicoes_own"
  on public.vida_refeicoes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_refeicoes_updated_at
  before update on public.vida_refeicoes
  for each row execute procedure public.vida_set_updated_at();

-- Itens da refeição: alimento do catálogo + quantas porções, para o total de
-- calorias/macros ser calculado automaticamente (soma de porcoes * kcal_por_porcao).
create table if not exists public.vida_refeicoes_itens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  refeicao_id uuid not null references public.vida_refeicoes (id) on delete cascade,
  alimento_id uuid not null references public.vida_alimentos_catalogo (id),
  porcoes numeric not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists vida_refeicoes_itens_refeicao_idx on public.vida_refeicoes_itens (refeicao_id);

alter table public.vida_refeicoes_itens enable row level security;

create policy "vida_refeicoes_itens_own"
  on public.vida_refeicoes_itens for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
