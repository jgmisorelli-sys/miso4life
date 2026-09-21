create table if not exists public.vida_eventos_sociais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  descricao text,
  cumprido boolean,
  xp_concedido integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vida_eventos_sociais_user_data_idx on public.vida_eventos_sociais (user_id, data desc);

alter table public.vida_eventos_sociais enable row level security;

create policy "vida_eventos_sociais_own"
  on public.vida_eventos_sociais for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_eventos_sociais_updated_at
  before update on public.vida_eventos_sociais
  for each row execute procedure public.vida_set_updated_at();
