-- Plano de treino semanal. Um registro por dia da semana (o usuário pode trocar
-- qual sessão cai em qual dia sem quebrar a missão semanal, que olha para
-- "4 treinos fixos concluídos", não para o dia específico).
create table if not exists public.vida_treinos_plano (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia_semana text not null check (
    dia_semana in ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')
  ),
  nome_sessao text not null,
  duracao_min_estimado integer,
  fixo boolean not null default false,
  ordem integer not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, dia_semana)
);

alter table public.vida_treinos_plano enable row level security;

create policy "vida_treinos_plano_own"
  on public.vida_treinos_plano for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_treinos_plano_updated_at
  before update on public.vida_treinos_plano
  for each row execute procedure public.vida_set_updated_at();

-- Exercícios de cada sessão. Fica pronta a estrutura, mas as sessões podem
-- começar vazias (Força A e B "em branco" para o usuário preencher depois).
create table if not exists public.vida_treinos_exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sessao_id uuid not null references public.vida_treinos_plano (id) on delete cascade,
  nome_exercicio text not null,
  series integer,
  repeticoes text,
  observacao text,
  ordem integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_treinos_exercicios_sessao_idx on public.vida_treinos_exercicios (sessao_id);

alter table public.vida_treinos_exercicios enable row level security;

create policy "vida_treinos_exercicios_own"
  on public.vida_treinos_exercicios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_treinos_exercicios_updated_at
  before update on public.vida_treinos_exercicios
  for each row execute procedure public.vida_set_updated_at();

-- Registro de que um treino foi feito num dia (referencia a sessão prevista,
-- mas sobrevive mesmo se a sessão for depois renomeada/excluída).
create table if not exists public.vida_treinos_feitos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  sessao_id uuid references public.vida_treinos_plano (id) on delete set null,
  duracao_real_min integer,
  observacao text,
  versao_minima boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_treinos_feitos_user_data_idx on public.vida_treinos_feitos (user_id, data desc);

alter table public.vida_treinos_feitos enable row level security;

create policy "vida_treinos_feitos_own"
  on public.vida_treinos_feitos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_treinos_feitos_updated_at
  before update on public.vida_treinos_feitos
  for each row execute procedure public.vida_set_updated_at();
