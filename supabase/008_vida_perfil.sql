create table if not exists public.vida_perfil (
  user_id uuid primary key references auth.users (id) on delete cascade,
  altura_cm numeric,
  data_nascimento date,
  data_inicio_plano date not null default current_date,
  fuso_horario text not null default 'America/Sao_Paulo',
  aceitou_aviso_saude boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vida_perfil enable row level security;

create policy "vida_perfil_own"
  on public.vida_perfil for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_perfil_updated_at
  before update on public.vida_perfil
  for each row execute procedure public.vida_set_updated_at();
