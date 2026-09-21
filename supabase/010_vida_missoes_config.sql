create table if not exists public.vida_missoes_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null,
  nome text not null,
  tipo text not null check (tipo in ('diaria', 'semanal')),
  xp integer not null,
  xp_semana_pesada integer,
  ativa boolean not null default true,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, codigo)
);

alter table public.vida_missoes_config enable row level security;

create policy "vida_missoes_config_own"
  on public.vida_missoes_config for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_missoes_config_updated_at
  before update on public.vida_missoes_config
  for each row execute procedure public.vida_set_updated_at();
