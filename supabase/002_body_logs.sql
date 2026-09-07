create table if not exists public.body_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  weight_kg numeric not null,
  body_fat_pct numeric,
  waist_cm numeric,
  hip_cm numeric,
  logged_at date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists body_logs_user_logged_at_idx
  on public.body_logs (user_id, logged_at desc);

alter table public.body_logs enable row level security;

create policy "Users manage their own body logs"
  on public.body_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
