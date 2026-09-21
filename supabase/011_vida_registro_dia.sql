create table if not exists public.vida_registro_dia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  semana_pesada boolean not null default false,
  passos integer,
  sono_horas numeric,
  hora_dormir time,
  energia smallint check (energia between 1 and 5),
  conforto_digestivo smallint check (conforto_digestivo between 0 and 3),
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, data)
);

alter table public.vida_registro_dia enable row level security;

create policy "vida_registro_dia_own"
  on public.vida_registro_dia for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_registro_dia_updated_at
  before update on public.vida_registro_dia
  for each row execute procedure public.vida_set_updated_at();
