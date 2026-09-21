-- Cada missão marcada num dia gera uma linha aqui. O par (data, missão) é
-- único por usuário para a marcação ser idempotente (marcar de novo não
-- duplica XP).
create table if not exists public.vida_missoes_feitas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  missao_codigo text not null,
  xp_concedido integer not null,
  origem text not null default 'manual',
  created_at timestamptz not null default now(),
  unique (user_id, data, missao_codigo)
);

create index if not exists vida_missoes_feitas_user_data_idx on public.vida_missoes_feitas (user_id, data desc);

alter table public.vida_missoes_feitas enable row level security;

create policy "vida_missoes_feitas_own"
  on public.vida_missoes_feitas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Extrato de XP: só insere, nunca atualiza nem apaga (o XP acumulado nunca
-- some). Sem policy de update/delete -- o RLS nega por padrão o que não tem
-- policy correspondente.
create table if not exists public.vida_xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  xp integer not null,
  motivo text not null,
  referencia_tipo text,
  referencia_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists vida_xp_ledger_user_data_idx on public.vida_xp_ledger (user_id, data desc);

alter table public.vida_xp_ledger enable row level security;

create policy "vida_xp_ledger_select_own"
  on public.vida_xp_ledger for select
  using (auth.uid() = user_id);

create policy "vida_xp_ledger_insert_own"
  on public.vida_xp_ledger for insert
  with check (auth.uid() = user_id);

-- Estado de sequência: um único registro por usuário, atualizado pelo motor
-- de regras (Fase 2). escudos_disponiveis renova para 2 a cada novo mês.
create table if not exists public.vida_streak (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sequencia_atual integer not null default 0,
  recorde integer not null default 0,
  dias_sem_falhar_duas_seguidas integer not null default 0,
  escudos_disponiveis integer not null default 2,
  escudos_mes_referencia date not null default date_trunc('month', current_date)::date,
  ultima_data_avaliada date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vida_streak enable row level security;

create policy "vida_streak_own"
  on public.vida_streak for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_streak_updated_at
  before update on public.vida_streak
  for each row execute procedure public.vida_set_updated_at();
