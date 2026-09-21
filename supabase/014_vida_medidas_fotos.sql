-- Medidas: peso (a cada 3 dias), cintura (semanal), bioimpedância completa
-- (a cada 14 dias) e condicionamento (dia 1, chefes de fase, dia 60). Os
-- valores específicos de cada tipo vão em JSON validado pela aplicação, já
-- que cada tipo tem campos bem diferentes entre si.
create table if not exists public.vida_medidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('peso', 'cintura', 'bioimpedancia', 'condicionamento')),
  valores jsonb not null default '{}'::jsonb,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, data, tipo)
);

create index if not exists vida_medidas_user_tipo_data_idx on public.vida_medidas (user_id, tipo, data desc);

alter table public.vida_medidas enable row level security;

create policy "vida_medidas_own"
  on public.vida_medidas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger vida_medidas_updated_at
  before update on public.vida_medidas
  for each row execute procedure public.vida_set_updated_at();

create table if not exists public.vida_fotos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null,
  angulo text not null check (angulo in ('frente', 'lado', 'costas')),
  caminho_storage text not null,
  created_at timestamptz not null default now()
);

create index if not exists vida_fotos_user_data_idx on public.vida_fotos (user_id, data desc);

alter table public.vida_fotos enable row level security;

create policy "vida_fotos_own"
  on public.vida_fotos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Bucket privado de fotos. Convenção de caminho: "<user_id>/<arquivo>",
-- para que as policies de storage.objects isolem por pasta = dono.
insert into storage.buckets (id, name, public)
values ('vida-fotos', 'vida-fotos', false)
on conflict (id) do nothing;

create policy "vida_fotos_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'vida-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "vida_fotos_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'vida-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "vida_fotos_storage_delete_own"
  on storage.objects for delete
  using (bucket_id = 'vida-fotos' and auth.uid()::text = (storage.foldername(name))[1]);
