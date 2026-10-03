-- ==============================================================================
-- SPORTS PSYCHIC - PRODUCTION DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS PROFILE (Synchronized with Supabase Auth auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  favorite_team text default 'KC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS: Public read, user can update their own profile
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. LEAGUES TABLE
create table public.leagues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  join_code text unique not null, -- 6-character code (e.g. 'OG2026')
  commissioner_id uuid references public.profiles(id) on delete set null,
  avatar_url text,
  scoring_format text default 'classic_proximity', -- 'classic_proximity' | 'standard'
  season_year integer default 2026 not null,
  is_public boolean default false not null,
  max_members integer default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leagues enable row level security;
create policy "Leagues are viewable by authenticated users" on public.leagues for select using (auth.role() = 'authenticated');
create policy "Commissioners can create leagues" on public.leagues for insert with check (auth.uid() = commissioner_id);
create policy "Commissioners can update own league" on public.leagues for update using (auth.uid() = commissioner_id);

-- 3. LEAGUE MEMBERSHIP
create table public.league_members (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' not null, -- 'commissioner' | 'co_commish' | 'member'
  total_points integer default 0 not null,
  season_correct integer default 0 not null,
  season_closest integer default 0 not null,
  season_exact integer default 0 not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (league_id, user_id)
);

alter table public.league_members enable row level security;
create policy "League members viewable by league participants" on public.league_members for select using (true);
create policy "Users can join leagues" on public.league_members for insert with check (auth.uid() = user_id);
create policy "Commissioners can manage members" on public.league_members for delete using (
  exists (select 1 from public.leagues where leagues.id = league_members.league_id and leagues.commissioner_id = auth.uid())
);

-- 4. NFL GAMES MASTER SCHEDULE
create table public.games (
  id text primary key, -- e.g. 'Week 5_g1' or '2026_w05_tb_dal'
  season_year integer default 2026 not null,
  week_num integer not null, -- 1 to 18
  matchup text not null, -- 'TB @ DAL'
  away_team text not null,
  home_team text not null,
  kickoff_time timestamp with time zone not null,
  broadcast text, -- 'TNF', 'SNF', 'MNF', 'CBS', 'FOX'
  away_score integer default null,
  home_score integer default null,
  winner text default null,
  is_live boolean default false not null,
  is_final boolean default false not null,
  status_detail text default 'Scheduled',
  possession text default null,
  down_distance text default null,
  is_red_zone boolean default false not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.games enable row level security;
create policy "Games are public viewable" on public.games for select using (true);

-- 5. USER PICKS & PREDICTIONS
create table public.picks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  league_id uuid references public.leagues(id) on delete cascade, -- null = solo play
  game_id text references public.games(id) on delete cascade not null,
  week_num integer not null,
  picked_winner text not null,
  predicted_away integer default 24 not null,
  predicted_home integer default 21 not null,
  is_multiplier boolean default false not null, -- 1 per week
  points_earned integer default 0 not null,
  base_points integer default 0 not null,
  bonus_points integer default 0 not null,
  is_closest boolean default false not null,
  is_exact boolean default false not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, league_id, game_id)
);

alter table public.picks enable row level security;

-- SECURITY RULE: Users can always view their own picks.
-- Other league members can ONLY view picks once the game has kicked off (kickoff_time <= now())
create policy "Users can manage own picks" on public.picks for all using (auth.uid() = user_id);

create policy "League members see picks after kickoff" on public.picks for select using (
  auth.uid() = user_id
  or (
    exists (
      select 1 from public.games
      where games.id = picks.game_id
      and (games.kickoff_time <= now() or games.is_live = true or games.is_final = true)
    )
  )
);

-- 6. INDEXES FOR LIGHTNING FAST LEAGUE QUERIES
create index idx_picks_user_week on public.picks(user_id, week_num);
create index idx_picks_league_game on public.picks(league_id, game_id);
create index idx_games_week on public.games(season_year, week_num);
create index idx_league_members_points on public.league_members(league_id, total_points desc);
