create table if not exists public.vida_lembretes_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo text not null check (
    tipo in ('manha', 'janela_treino', 'fechamento_dia', 'resumo_semana', 'pre_bioimpedancia')
  ),
  horario time,
  canal text not null default 'push' check (canal in ('push', 'whatsapp')),
  ativo boolean not null default true,
  mensagem text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tipo, canal)
);

alter table public.vida_lembretes_config enable row level security;

create policy "vida_lembretes_config_own"
  on public.vida_lembretes_config for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_lembretes_config_updated_at
  before update on public.vida_lembretes_config
  for each row execute procedure public.vida_set_updated_at();

create table if not exists public.vida_familia_participantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vida_familia_participantes enable row level security;

create policy "vida_familia_participantes_own"
  on public.vida_familia_participantes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_familia_participantes_updated_at
  before update on public.vida_familia_participantes
  for each row execute procedure public.vida_set_updated_at();
