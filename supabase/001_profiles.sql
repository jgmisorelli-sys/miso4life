-- Profiles: one row per user, holds personal goals/settings.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  target_weight_kg numeric,
  daily_calorie_goal integer,
  daily_water_ml_goal integer not null default 2500,
  glass_size_ml integer not null default 250,
  daily_coffee_limit numeric not null default 3,
  coffee_unit text not null default 'cups' check (coffee_unit in ('cups', 'ml')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Auto-create a profile row when a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
