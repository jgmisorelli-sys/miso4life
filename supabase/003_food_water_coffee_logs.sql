create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'snack', 'dinner', 'extra')),
  food_name text not null,
  quantity text,
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists food_logs_user_logged_at_idx
  on public.food_logs (user_id, logged_at desc);

alter table public.food_logs enable row level security;

create policy "Users manage their own food logs"
  on public.food_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount_ml integer not null,
  logged_at timestamptz not null default now()
);

create index if not exists water_logs_user_logged_at_idx
  on public.water_logs (user_id, logged_at desc);

alter table public.water_logs enable row level security;

create policy "Users manage their own water logs"
  on public.water_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.coffee_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  unit text not null default 'cups' check (unit in ('cups', 'ml')),
  logged_at timestamptz not null default now()
);

create index if not exists coffee_logs_user_logged_at_idx
  on public.coffee_logs (user_id, logged_at desc);

alter table public.coffee_logs enable row level security;

create policy "Users manage their own coffee logs"
  on public.coffee_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
