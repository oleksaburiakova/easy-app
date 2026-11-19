-- Етап 2: дані користувача в Supabase.
-- Запуск: Supabase → SQL Editor → вставити весь файл → Run. Повторний запуск безпечний.

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  sex         text not null check (sex in ('female', 'male')),
  age         int  not null check (age between 1 and 120),
  height      int  not null check (height between 100 and 250),
  activity    text not null check (activity in ('base', 'mid')),
  wake        text not null default '07:00',
  sleep       text not null default '23:00',
  level       text not null,
  lang        text not null default 'uk',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.plates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  date        date not null,
  meal        text not null check (meal in ('breakfast', 'lunch', 'dinner')),
  level       text not null,
  selections  jsonb not null default '[]'::jsonb,
  status      text not null default 'planned' check (status in ('planned', 'eaten')),
  favorite    boolean not null default false,
  recipe_id   uuid,
  created_at  timestamptz not null default now()
);
create index if not exists plates_user_date on public.plates (user_id, date desc);

-- Кожен бачить і змінює лише свої дані.
alter table public.profiles enable row level security;
alter table public.plates   enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "own plates" on public.plates;
create policy "own plates" on public.plates
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
