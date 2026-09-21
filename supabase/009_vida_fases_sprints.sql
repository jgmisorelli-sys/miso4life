create table if not exists public.vida_fases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  numero integer not null,
  nome text not null,
  meta_percentual_gordura numeric,
  peso_estimado_kg numeric,
  prazo_dias integer not null,
  status text not null default 'planejada' check (status in ('planejada', 'ativa', 'concluida')),
  data_inicio date,
  data_fim date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero)
);

alter table public.vida_fases enable row level security;

create policy "vida_fases_own"
  on public.vida_fases for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_fases_updated_at
  before update on public.vida_fases
  for each row execute procedure public.vida_set_updated_at();

create table if not exists public.vida_sprints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  fase_id uuid not null references public.vida_fases (id) on delete cascade,
  numero integer not null,
  tema text not null,
  foco_missao_codigo text,
  data_inicio date not null,
  data_fim date not null,
  meta_xp integer not null default 800,
  status text not null default 'planejada' check (status in ('planejada', 'ativa', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (fase_id, numero)
);

create index if not exists vida_sprints_user_idx on public.vida_sprints (user_id);

alter table public.vida_sprints enable row level security;

create policy "vida_sprints_own"
  on public.vida_sprints for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_sprints_updated_at
  before update on public.vida_sprints
  for each row execute procedure public.vida_set_updated_at();
