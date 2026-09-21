create table if not exists public.vida_desejos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  valor_estimado numeric,
  link text,
  prioridade integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vida_desejos enable row level security;

create policy "vida_desejos_own"
  on public.vida_desejos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_desejos_updated_at
  before update on public.vida_desejos
  for each row execute procedure public.vida_set_updated_at();

-- Regra de cada gatilho de recompensa (valor, condição em JSON) --
-- configurável sem precisar de deploy.
create table if not exists public.vida_recompensas_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  gatilho text not null,
  nome text not null,
  valor numeric not null default 0,
  regra jsonb not null default '{}'::jsonb,
  ativa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, gatilho)
);

alter table public.vida_recompensas_config enable row level security;

create policy "vida_recompensas_config_own"
  on public.vida_recompensas_config for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_recompensas_config_updated_at
  before update on public.vida_recompensas_config
  for each row execute procedure public.vida_set_updated_at();

-- Instâncias de recompensa conquistadas/resgatadas ao longo do tempo
-- (uma por semana/sprint/mês/fase, conforme o gatilho).
create table if not exists public.vida_recompensas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  recompensa_config_id uuid references public.vida_recompensas_config (id) on delete set null,
  referencia_tipo text,
  referencia_id text,
  estado text not null default 'bloqueada' check (estado in ('bloqueada', 'disponivel', 'resgatada')),
  valor numeric,
  desejo_id uuid references public.vida_desejos (id) on delete set null,
  data_conquista date,
  data_resgate date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_recompensas_user_idx on public.vida_recompensas (user_id, estado);

alter table public.vida_recompensas enable row level security;

create policy "vida_recompensas_own"
  on public.vida_recompensas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_recompensas_updated_at
  before update on public.vida_recompensas
  for each row execute procedure public.vida_set_updated_at();
