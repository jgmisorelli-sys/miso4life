create table if not exists public.vida_conquistas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  codigo text not null,
  nome text not null,
  data_conquista date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, codigo)
);

alter table public.vida_conquistas enable row level security;

create policy "vida_conquistas_select_own"
  on public.vida_conquistas for select
  using (auth.uid() = user_id);

create policy "vida_conquistas_insert_own"
  on public.vida_conquistas for insert
  with check (auth.uid() = user_id);
