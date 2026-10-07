-- ==============================================================================
-- SPORTS PSYCHIC - PICK SHEETS MIGRATION (SUPABASE / POSTGRESQL)
-- Creates the pick_sheets table for Solo Play campaigns and weekly prediction slates
-- ==============================================================================

create table if not exists public.pick_sheets (
  id text primary key, -- client-generated or uuid
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  format text default 'season' not null, -- 'season' (weeks 1-18) | 'weekly'
  season_year integer default 2026 not null,
  active_week integer default 5,
  is_locked boolean default false not null,
  total_picks integer default 0,
  total_points integer default 0,
  accuracy_rate numeric(5,2) default null,
  picks jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security
alter table public.pick_sheets enable row level security;

-- Policies
create policy "Users can view own pick sheets"
  on public.pick_sheets for select
  using (auth.uid() = user_id);

create policy "Users can create own pick sheets"
  on public.pick_sheets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own pick sheets"
  on public.pick_sheets for update
  using (auth.uid() = user_id);

create policy "Users can delete own pick sheets"
  on public.pick_sheets for delete
  using (auth.uid() = user_id);

-- Optional index for fast user query
create index if not exists idx_pick_sheets_user on public.pick_sheets(user_id, created_at desc);

