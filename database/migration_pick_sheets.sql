-- ==============================================================================
-- SPORTS PSYCHIC - PICK SHEETS & GLOBAL LEADERBOARD MIGRATION (SUPABASE / POSTGRESQL)
-- Creates the pick_sheets table for Solo Play campaigns and global community standings
-- ==============================================================================

create table if not exists public.pick_sheets (
  id text primary key, -- client-generated or uuid
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  format text default 'season' not null, -- 'season' (weeks 1-18) | 'weekly'
  season_year integer default 2026 not null,
  active_week integer default 5,
  is_locked boolean default false not null,
  is_season_locked boolean default false not null,
  season_locked_at timestamp with time zone,
  season_picks jsonb default '{}'::jsonb,
  weekly_picks jsonb default '{}'::jsonb,
  total_picks integer default 0,
  total_points integer default 0,
  accuracy_rate numeric(5,2) default null,
  picks jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist if table was already created
alter table public.pick_sheets add column if not exists is_season_locked boolean default false not null;
alter table public.pick_sheets add column if not exists season_locked_at timestamp with time zone;
alter table public.pick_sheets add column if not exists season_picks jsonb default '{}'::jsonb;
alter table public.pick_sheets add column if not exists weekly_picks jsonb default '{}'::jsonb;

-- Row Level Security
alter table public.pick_sheets enable row level security;

-- Policies
drop policy if exists "Users can view own pick sheets" on public.pick_sheets;
drop policy if exists "Users can view own or locked pick sheets" on public.pick_sheets;
create policy "Users can view own or locked pick sheets"
  on public.pick_sheets for select
  using (
    (auth.uid() = user_id)
    or (is_locked = true)
    or (is_season_locked = true)
  );

drop policy if exists "Users can create own pick sheets" on public.pick_sheets;
create policy "Users can create own pick sheets"
  on public.pick_sheets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own pick sheets" on public.pick_sheets;
create policy "Users can update own pick sheets"
  on public.pick_sheets for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own pick sheets" on public.pick_sheets;
create policy "Users can delete own pick sheets"
  on public.pick_sheets for delete
  using (auth.uid() = user_id);

alter table public.pick_sheets add column if not exists league_id text;
alter table public.pick_sheets add column if not exists is_master boolean default false;
alter table public.pick_sheets add column if not exists submission_label text;

-- Indexes for performance
create index if not exists idx_pick_sheets_user on public.pick_sheets(user_id, created_at desc);
create index if not exists idx_pick_sheets_leaderboard on public.pick_sheets(format, season_year, is_season_locked, total_points desc);

-- ------------------------------------------------------------------------------
-- GLOBAL COMMUNITY LEADERBOARD VIEW
-- Real-time rankings of locked Season Prophecy and Weekly Vision submissions
-- ------------------------------------------------------------------------------
create or replace view public.global_leaderboard as
select
  s.id as sheet_id,
  s.user_id,
  s.league_id,
  s.format,
  s.season_year,
  s.total_picks,
  s.total_points,
  s.accuracy_rate,
  s.is_season_locked,
  s.season_locked_at,
  coalesce(
    s.submission_label, 
    case 
      when s.id like 'master_%' or s.is_master = true then 'Solo Prophecy' 
      when s.name is not null and s.name != 'Master Pick Sheet' then s.name || ' Prophecy' 
      else 'Solo Prophecy' 
    end
  ) as submission_label,
  coalesce(p.username, p.full_name, 'Psychic Forecaster') as username,
  p.full_name,
  p.avatar_url,
  p.favorite_team,
  dense_rank() over (
    partition by s.format, s.season_year 
    order by s.total_points desc, s.accuracy_rate desc nulls last, s.total_picks desc
  ) as rank
from public.pick_sheets s
left join public.profiles p on p.id = s.user_id
where s.is_season_locked = true or s.is_locked = true;

grant select on public.global_leaderboard to anon, authenticated, service_role;

