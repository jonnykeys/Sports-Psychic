-- ==============================================================================
-- SPORTS PSYCHIC - PRODUCTION DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- Version 2.0 • Supports Pre-Mapped Rosters, Auto-Claiming & Season/Rolling Locks
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS PROFILE (Synchronized with Supabase Auth auth.users)
-- ------------------------------------------------------------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  favorite_team text default 'KC',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. LEAGUES TABLE
-- ------------------------------------------------------------------------------
create table public.leagues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  join_code text unique not null, -- 6-character code (e.g. 'OG2026')
  commissioner_id uuid references public.profiles(id) on delete set null,
  avatar_url text,
  scoring_format text default 'classic_proximity', -- 'classic_proximity' | 'winner_only' | 'custom'
  season_year integer default 2026 not null,
  is_public boolean default false not null,
  max_members integer default 100,

  -- League Scoring Rules (Defaults aligned with OG League verified rules)
  pts_winner integer default 10 not null,
  pts_closest integer default 10 not null,
  pts_closest_tie integer default 5 not null,
  pts_exact integer default 50 not null,
  pts_exact_tie integer default 25 not null,
  lock_of_week_multiplier integer default 3 not null,
  require_scores boolean default true not null,

  -- League Lock Settings
  lock_type text default 'season_prekickoff' not null, -- 'season_prekickoff' | 'rolling_kickoff'
  season_lock_time timestamp with time zone,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.leagues enable row level security;
create policy "Leagues are viewable by everyone" on public.leagues for select using (true);
create policy "Commissioners can create leagues" on public.leagues for insert with check (auth.uid() = commissioner_id);
create policy "Commissioners can update own league" on public.leagues for update using (auth.uid() = commissioner_id);

-- ------------------------------------------------------------------------------
-- 3. LEAGUE ROSTER INVITES (Pre-Mapping for Zero-Friction Account Linking)
-- Allows commissioners to preload player names & emails so picks bind automatically
-- ------------------------------------------------------------------------------
create table public.league_roster_invites (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade not null,
  player_name text not null,
  invited_email text, -- commissioner can populate before or after friend registers
  favorite_team text,
  avatar_url text,
  claimed_user_id uuid references public.profiles(id) on delete set null,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_league_roster_player unique (league_id, player_name)
);

create index idx_roster_invites_email on public.league_roster_invites(lower(invited_email));

alter table public.league_roster_invites enable row level security;
create policy "Roster invites viewable by everyone" on public.league_roster_invites for select using (true);
create policy "Commissioners can manage roster invites" on public.league_roster_invites for all using (
  exists (select 1 from public.leagues where leagues.id = league_roster_invites.league_id and leagues.commissioner_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- 4. LEAGUE MEMBERSHIP
-- ------------------------------------------------------------------------------
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
create policy "League members viewable by everyone" on public.league_members for select using (true);
create policy "Users can join leagues" on public.league_members for insert with check (auth.uid() = user_id);
create policy "Commissioners can manage members" on public.league_members for delete using (
  exists (select 1 from public.leagues where leagues.id = league_members.league_id and leagues.commissioner_id = auth.uid())
);

-- ------------------------------------------------------------------------------
-- 5. NFL GAMES MASTER SCHEDULE
-- ------------------------------------------------------------------------------
create table public.games (
  id text primary key, -- e.g. 'Week 1_g1'
  season_year integer default 2026 not null,
  week_num integer not null, -- 1 to 18
  matchup text not null, -- 'TB @ DAL'
  away_team text not null,
  home_team text not null,
  kickoff_time timestamp with time zone not null,
  broadcast text,
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

-- ------------------------------------------------------------------------------
-- 6. USER PICKS & PREDICTIONS
-- Supports pre-seeded roster picks (user_id is initially null until claimed)
-- ------------------------------------------------------------------------------
create table public.picks (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade, -- null = solo play
  user_id uuid references public.profiles(id) on delete set null default null,
  player_name text not null, -- 'Jon', 'Carson', or user's display name
  game_id text references public.games(id) on delete cascade not null,
  week_num integer not null,
  picked_winner text not null,
  predicted_away integer default 24 not null,
  predicted_home integer default 21 not null,
  is_multiplier boolean default false not null,
  points_earned integer default 0 not null,
  base_points integer default 0 not null,
  bonus_points integer default 0 not null,
  is_closest boolean default false not null,
  is_exact boolean default false not null,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_league_player_game unique (league_id, player_name, game_id)
);

-- Solo play unique constraint (where league_id is null)
create unique index idx_unique_solo_pick on public.picks(user_id, game_id) where league_id is null;

alter table public.picks enable row level security;

-- Users can always edit/create their own picks
create policy "Users can manage own picks" on public.picks for all using (auth.uid() = user_id);

-- Picks visibility rules:
-- 1. Own picks are always visible
-- 2. League picks visible if season_prekickoff (OG League) or after kickoff (rolling)
create policy "Picks visibility policy" on public.picks for select using (
  (auth.uid() is not null and auth.uid() = user_id)
  or (
    league_id is not null and exists (
      select 1 from public.leagues
      where leagues.id = picks.league_id
      and (
        (leagues.lock_type = 'season_prekickoff' and (leagues.season_lock_time is null or leagues.season_lock_time <= now()))
        or (
          leagues.lock_type = 'rolling_kickoff' and exists (
            select 1 from public.games
            where games.id = picks.game_id
            and (games.kickoff_time <= now() or games.is_live = true or games.is_final = true)
          )
        )
      )
    )
  )
);

-- ------------------------------------------------------------------------------
-- 7. LIVE LEAGUE STANDINGS VIEW
-- Real-time aggregation directly from picks (works seamlessly before & after signup)
-- ------------------------------------------------------------------------------
create or replace view public.league_standings as
select
  p.league_id,
  p.player_name,
  p.user_id,
  coalesce(prof.avatar_url, inv.avatar_url) as avatar_url,
  coalesce(prof.favorite_team, inv.favorite_team, 'KC') as favorite_team,
  coalesce(sum(p.points_earned), 0)::integer as total_points,
  count(case when p.points_earned > 0 then 1 end)::integer as correct_picks,
  count(case when p.is_closest then 1 end)::integer as closest_picks,
  count(case when p.is_exact then 1 end)::integer as exact_picks
from public.picks p
left join public.profiles prof on prof.id = p.user_id
left join public.league_roster_invites inv on inv.league_id = p.league_id and inv.player_name = p.player_name
where p.league_id is not null
group by p.league_id, p.player_name, p.user_id, prof.avatar_url, inv.avatar_url, prof.favorite_team, inv.favorite_team
order by total_points desc;

-- ------------------------------------------------------------------------------
-- 8. AUTOMATIC ROSTER LINKING & USER ONBOARDING TRIGGERS
-- ------------------------------------------------------------------------------

-- Trigger Function 1: When a new user registers in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_username text;
  v_invite record;
begin
  v_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));

  -- Handle rare duplicate username collision by appending random digits
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || floor(random() * 10000)::text;
  end if;

  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    v_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );

  -- Automatically claim any pre-mapped roster invites for this user's email
  if new.email is not null then
    for v_invite in
      select id, league_id, player_name, favorite_team, avatar_url
      from public.league_roster_invites
      where lower(invited_email) = lower(new.email)
        and claimed_user_id is null
    loop
      -- 1. Mark invite claimed
      update public.league_roster_invites
      set claimed_user_id = new.id,
          claimed_at = timezone('utc'::text, now())
      where id = v_invite.id;

      -- 2. Add to league_members
      insert into public.league_members (league_id, user_id, role)
      values (
        v_invite.league_id,
        new.id,
        case when lower(v_invite.player_name) = 'jon' then 'commissioner' else 'member' end
      )
      on conflict (league_id, user_id) do nothing;

      -- 3. If Jon, assign commissioner to the league record
      if lower(v_invite.player_name) = 'jon' then
        update public.leagues
        set commissioner_id = new.id
        where id = v_invite.league_id and commissioner_id is null;
      end if;

      -- 4. Re-bind all historical picks to this new registered account
      update public.picks
      set user_id = new.id
      where league_id = v_invite.league_id
        and player_name = v_invite.player_name
        and user_id is null;

      -- 5. Enrich profile with team and avatar
      update public.profiles
      set full_name = coalesce(nullif(full_name, ''), v_invite.player_name),
          favorite_team = coalesce(v_invite.favorite_team, favorite_team),
          avatar_url = coalesce(nullif(avatar_url, ''), v_invite.avatar_url)
      where id = new.id;
    end loop;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop existing trigger if present to ensure clean reload
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger Function 2: Retroactive Link when Commissioner updates an invited_email in league_roster_invites
create or replace function public.handle_roster_invite_email_updated()
returns trigger as $$
declare
  v_user_id uuid;
begin
  if new.invited_email is not null and (old is null or old.invited_email is distinct from new.invited_email) then
    -- Check if user already exists in auth.users
    select id into v_user_id from auth.users where lower(email) = lower(new.invited_email) limit 1;

    if v_user_id is not null then
      new.claimed_user_id := v_user_id;
      new.claimed_at := timezone('utc'::text, now());

      -- Insert into league members
      insert into public.league_members (league_id, user_id, role)
      values (
        new.league_id,
        v_user_id,
        case when lower(new.player_name) = 'jon' then 'commissioner' else 'member' end
      )
      on conflict (league_id, user_id) do nothing;

      -- If Jon, set as league commissioner
      if lower(new.player_name) = 'jon' then
        update public.leagues
        set commissioner_id = v_user_id
        where id = new.league_id and commissioner_id is null;
      end if;

      -- Link picks
      update public.picks
      set user_id = v_user_id
      where league_id = new.league_id
        and player_name = new.player_name
        and user_id is null;

      -- Sync profile
      update public.profiles
      set full_name = coalesce(nullif(full_name, ''), new.player_name),
          favorite_team = coalesce(new.favorite_team, favorite_team),
          avatar_url = coalesce(nullif(avatar_url, ''), new.avatar_url)
      where id = v_user_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_roster_invite_email_change on public.league_roster_invites;
create trigger on_roster_invite_email_change
  before insert or update on public.league_roster_invites
  for each row execute procedure public.handle_roster_invite_email_updated();

-- ------------------------------------------------------------------------------
-- 9. COMMISSIONER SQL HELPER: One-line tool to link friends by email anytime
-- Usage: SELECT public.link_league_member_by_email('OG2026', 'Carson', 'carson@gmail.com');
-- ------------------------------------------------------------------------------
create or replace function public.link_league_member_by_email(
  p_join_code text,
  p_player_name text,
  p_email text
) returns text as $$
declare
  v_league_id uuid;
begin
  select id into v_league_id from public.leagues where join_code = p_join_code;
  if v_league_id is null then
    return 'Error: League with join_code ' || p_join_code || ' not found.';
  end if;

  update public.league_roster_invites
  set invited_email = lower(trim(p_email))
  where league_id = v_league_id
    and lower(player_name) = lower(trim(p_player_name));

  return 'Success: Pre-mapped ' || p_player_name || ' to ' || p_email || ' for league ' || p_join_code;
end;
$$ language plpgsql security definer;

-- ------------------------------------------------------------------------------
-- 10. SCORING ENGINE: Recalculates pick scores & bonuses on game finalization
-- ------------------------------------------------------------------------------
create or replace function public.score_game_picks(p_game_id text)
returns void as $$
declare
  v_game record;
  v_league record;
  v_min_diff integer;
  v_tie_count integer;
begin
  select * into v_game from public.games where id = p_game_id;
  if v_game is null or not v_game.is_final or v_game.winner is null or v_game.away_score is null or v_game.home_score is null then
    return;
  end if;

  -- Process each league that has picks on this game
  for v_league in select distinct l.* from public.leagues l join public.picks p on p.league_id = l.id where p.game_id = p_game_id
  loop
    -- Reset all picks for this game in this league
    update public.picks
    set points_earned = 0, base_points = 0, bonus_points = 0, is_closest = false, is_exact = false
    where league_id = v_league.id and game_id = p_game_id;

    -- Find min_diff among pickers who picked the winner
    select
      min(abs(predicted_away - v_game.away_score) + abs(predicted_home - v_game.home_score))
    into v_min_diff
    from public.picks
    where league_id = v_league.id and game_id = p_game_id and upper(trim(picked_winner)) = upper(trim(v_game.winner));

    if v_min_diff is not null then
      select
        count(*)
      into v_tie_count
      from public.picks
      where league_id = v_league.id and game_id = p_game_id
        and upper(trim(picked_winner)) = upper(trim(v_game.winner))
        and (abs(predicted_away - v_game.away_score) + abs(predicted_home - v_game.home_score)) = v_min_diff;

      -- Update winners without closest bonus
      update public.picks
      set
        base_points = case when is_multiplier then v_league.pts_winner * v_league.lock_of_week_multiplier else v_league.pts_winner end,
        bonus_points = 0,
        points_earned = case when is_multiplier then v_league.pts_winner * v_league.lock_of_week_multiplier else v_league.pts_winner end,
        is_closest = false,
        is_exact = false
      where league_id = v_league.id and game_id = p_game_id
        and upper(trim(picked_winner)) = upper(trim(v_game.winner))
        and (abs(predicted_away - v_game.away_score) + abs(predicted_home - v_game.home_score)) > v_min_diff;

      -- Update closest/exact pickers
      update public.picks
      set
        base_points = case when is_multiplier then v_league.pts_winner * v_league.lock_of_week_multiplier else v_league.pts_winner end,
        is_closest = true,
        is_exact = (v_min_diff = 0),
        bonus_points = (
          case
            when v_min_diff = 0 then (case when v_tie_count > 1 then v_league.pts_exact_tie else v_league.pts_exact end)
            else (case when v_tie_count > 1 then v_league.pts_closest_tie else v_league.pts_closest end)
          end
        ) * (case when is_multiplier then v_league.lock_of_week_multiplier else 1 end),
        points_earned = (
          case when is_multiplier then v_league.pts_winner * v_league.lock_of_week_multiplier else v_league.pts_winner end
        ) + (
          (case
            when v_min_diff = 0 then (case when v_tie_count > 1 then v_league.pts_exact_tie else v_league.pts_exact end)
            else (case when v_tie_count > 1 then v_league.pts_closest_tie else v_league.pts_closest end)
          end) * (case when is_multiplier then v_league.lock_of_week_multiplier else 1 end)
        )
      where league_id = v_league.id and game_id = p_game_id
        and upper(trim(picked_winner)) = upper(trim(v_game.winner))
        and (abs(predicted_away - v_game.away_score) + abs(predicted_home - v_game.home_score)) = v_min_diff;
    end if;

    -- Update member season totals for users in this league
    update public.league_members lm
    set
      total_points = coalesce(s.total_pts, 0),
      season_correct = coalesce(s.correct_cnt, 0),
      season_closest = coalesce(s.closest_cnt, 0),
      season_exact = coalesce(s.exact_cnt, 0)
    from (
      select
        user_id,
        sum(points_earned) as total_pts,
        count(case when points_earned > 0 then 1 end) as correct_cnt,
        count(case when is_closest then 1 end) as closest_cnt,
        count(case when is_exact then 1 end) as exact_cnt
      from public.picks
      where league_id = v_league.id and user_id is not null
      group by user_id
    ) s
    where lm.league_id = v_league.id and lm.user_id = s.user_id;

  end loop;

  -- Solo play picks scoring (where league_id is null)
  update public.picks
  set
    points_earned = case when upper(trim(picked_winner)) = upper(trim(v_game.winner)) then 10 else 0 end,
    base_points = case when upper(trim(picked_winner)) = upper(trim(v_game.winner)) then 10 else 0 end,
    bonus_points = 0,
    is_closest = false,
    is_exact = (upper(trim(picked_winner)) = upper(trim(v_game.winner)) and predicted_away = v_game.away_score and predicted_home = v_game.home_score)
  where league_id is null and game_id = p_game_id;
end;
$$ language plpgsql security definer;

-- Trigger to automatically score picks whenever game results are finalized or updated
create or replace function public.handle_game_score_updated()
returns trigger as $$
begin
  if (new.is_final and (old is null or not old.is_final or old.away_score is distinct from new.away_score or old.home_score is distinct from new.home_score or old.winner is distinct from new.winner)) then
    perform public.score_game_picks(new.id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_game_score_updated on public.games;
create trigger on_game_score_updated
  after insert or update on public.games
  for each row execute procedure public.handle_game_score_updated();

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
create index if not exists idx_picks_user_week on public.picks(user_id, week_num);
create index if not exists idx_picks_league_game on public.picks(league_id, game_id);
create index if not exists idx_picks_league_player on public.picks(league_id, player_name);
create index if not exists idx_games_week on public.games(season_year, week_num);
create index if not exists idx_league_members_points on public.league_members(league_id, total_points desc);
