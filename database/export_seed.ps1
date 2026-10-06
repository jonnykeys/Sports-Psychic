# Sports Psychic - OG League 2026 Seed Data Generator
# Extracts all 272 games and 3,264 verified picks from data.js into turnkey SQL & JSON
param()

$dataFilePath = Join-Path $PSScriptRoot "..\OG League Live\data.js"
if (-not (Test-Path $dataFilePath)) {
    Write-Error "Could not find $dataFilePath"
    exit 1
}

$raw = Get-Content -Raw -Path $dataFilePath
$jsonStr = $raw.Substring($raw.IndexOf('{')).Trim().TrimEnd(';')
$ogData = $jsonStr | ConvertFrom-Json

$ogLeagueId = "e0000000-0000-0000-0000-000000000001"

$playerConfig = @{
    "Jon"     = @{ team = "BUF"; avatar = "avatars/jon.jpg" }
    "Carson"  = @{ team = "KC";  avatar = "avatars/carson.jpg" }
    "Alisha"  = @{ team = "MIN"; avatar = "avatars/alisha.jpg" }
    "Dishman" = @{ team = "MIA"; avatar = "avatars/dishman.jpg" }
    "Mango"   = @{ team = "SF";  avatar = "avatars/mango.jpg" }
    "Nok"     = @{ team = "LAR"; avatar = "avatars/nok.jpg" }
    "Caleb"   = @{ team = "LAC"; avatar = "avatars/caleb.jpg" }
    "Ross"    = @{ team = "PIT"; avatar = "avatars/ross.jpg" }
    "Ethan"   = @{ team = "PHI"; avatar = "avatars/ethan.jpg" }
    "Brett"   = @{ team = "GB";  avatar = "avatars/brett.jpg" }
    "Wells"   = @{ team = "DAL"; avatar = "avatars/wells.jpg" }
    "Rob"     = @{ team = "BAL"; avatar = "avatars/rob.jpg" }
}

$playerNames = @("Jon", "Carson", "Alisha", "Dishman", "Mango", "Nok", "Caleb", "Ross", "Ethan", "Brett", "Wells", "Rob")

# Function to calculate official points for a finalized game
function Calculate-GamePicks($g) {
    if (-not $g.isFinal -or -not $g.winner -or $null -eq $g.awayScore -or $null -eq $g.homeScore) {
        return
    }
    $actualWinner = $g.winner.Trim().ToUpper()
    $actualAway = [int]$g.awayScore
    $actualHome = [int]$g.homeScore

    $winningPickers = @()
    foreach ($pName in $playerNames) {
        $pk = $g.picks.$pName
        if ($pk -and $pk.winner -and $pk.winner.Trim().ToUpper() -eq $actualWinner) {
            $pAway = if ($null -ne $pk.awayScore) { [int]$pk.awayScore } else { $null }
            $pHome = if ($null -ne $pk.homeScore) { [int]$pk.homeScore } else { $null }
            if ($null -ne $pAway -and $null -ne $pHome) {
                $diff = [Math]::Abs($pAway - $actualAway) + [Math]::Abs($pHome - $actualHome)
                $winningPickers += [PSCustomObject]@{ name = $pName; diff = $diff }
            }
        }
    }

    $minDiff = [int]::MaxValue
    $closestPickers = @()
    foreach ($wp in $winningPickers) {
        if ($wp.diff -lt $minDiff) {
            $minDiff = $wp.diff
            $closestPickers = @($wp.name)
        } elseif ($wp.diff -eq $minDiff) {
            $closestPickers += $wp.name
        }
    }

    $tieCount = $closestPickers.Count
    $isExact = ($minDiff -eq 0)

    foreach ($pName in $playerNames) {
        $pk = $g.picks.$pName
        if (-not $pk) { continue }
        $pk.points = 0
        $pk.basePoints = 0
        $pk.bonusPoints = 0
        $pk.isClosest = $false
        $pk.exact = $false

        if ($pk.winner -and $pk.winner.Trim().ToUpper() -eq $actualWinner) {
            $mult = if ($pk.multiplier) { 3 } else { 1 }
            $basePoints = 10 * $mult
            $bonusPoints = 0

            if ($closestPickers -contains $pName) {
                $pk.isClosest = $true
                if ($isExact) {
                    $pk.exact = $true
                    $pool = if ($tieCount -gt 1) { 25 } else { 50 }
                    $bonusPoints = $pool * $mult
                } else {
                    $pool = if ($tieCount -gt 1) { 5 } else { 10 }
                    $bonusPoints = $pool * $mult
                }
            }

            $pk.basePoints = $basePoints
            $pk.bonusPoints = $bonusPoints
            $pk.points = $basePoints + $bonusPoints
        }
    }
}

$gamesList = [System.Collections.Generic.List[PSObject]]::new()
$picksList = [System.Collections.Generic.List[PSObject]]::new()

$weeksProps = $ogData.weeks.PSObject.Properties

foreach ($wProp in $weeksProps) {
    $weekName = $wProp.Name
    $weekNum = [int]($weekName -replace "Week\s*", "")
    $games = $wProp.Value.games

    foreach ($g in $games) {
        # Calculate official score/closest bonuses if finalized
        Calculate-GamePicks($g)

        $teams = $g.matchup -split " @ "
        $awayTeam = if ($teams.Count -gt 0) { $teams[0].Trim() } else { "" }
        $homeTeam = if ($teams.Count -gt 1) { $teams[1].Trim() } else { "" }

        $gameObj = [PSCustomObject]@{
            id          = $g.id
            week_num    = $weekNum
            matchup     = $g.matchup
            away_team   = $awayTeam
            home_team   = $homeTeam
            dateTime    = $g.dateTime
            winner      = $g.winner
            away_score  = $g.awayScore
            home_score  = $g.homeScore
            is_final    = [bool]$g.isFinal
        }
        $gamesList.Add($gameObj)

        if ($g.picks) {
            foreach ($pName in $playerNames) {
                $pProp = $g.picks.PSObject.Properties[$pName]
                if ($pProp) {
                    $p = $pProp.Value
                    $pickObj = [PSCustomObject]@{
                        player_name    = $pName
                        game_id        = $g.id
                        week_num       = $weekNum
                        picked_winner  = if ($p.winner) { $p.winner } else { "" }
                        predicted_away = if ($null -ne $p.awayScore) { [int]$p.awayScore } else { 24 }
                        predicted_home = if ($null -ne $p.homeScore) { [int]$p.homeScore } else { 21 }
                        is_multiplier  = [bool]$p.multiplier
                        points_earned  = if ($null -ne $p.points) { [int]$p.points } else { 0 }
                        base_points    = if ($null -ne $p.basePoints) { [int]$p.basePoints } else { 0 }
                        bonus_points   = if ($null -ne $p.bonusPoints) { [int]$p.bonusPoints } else { 0 }
                        is_closest     = [bool]$p.isClosest
                        is_exact       = [bool]$p.exact
                    }
                    $picksList.Add($pickObj)
                }
            }
        }
    }
}

Write-Host "Extracted $($playerNames.Count) players, $($gamesList.Count) games, and $($picksList.Count) picks."

# 1. Output JSON bundle
$seedBundle = @{
    league = @{
        id                      = $ogLeagueId
        name                    = "OG League"
        join_code               = "OG2026"
        season_year             = 2026
        scoring_format          = "classic_proximity"
        pts_winner              = 10
        pts_closest             = 10
        pts_closest_tie         = 5
        pts_exact               = 50
        pts_exact_tie           = 25
        lock_of_week_multiplier = 3
        require_scores          = $true
        lock_type               = "season_prekickoff"
    }
    players = @($playerNames | ForEach-Object {
        @{
            name         = $_
            favoriteTeam = $playerConfig[$_].team
            avatar       = $playerConfig[$_].avatar
        }
    })
    games = $gamesList
    picks = $picksList
}

$jsonPath = Join-Path $PSScriptRoot "og_league_seed.json"
$seedBundle | ConvertTo-Json -Depth 6 | Set-Content -Path $jsonPath -Encoding UTF8
Write-Host "Wrote JSON seed bundle to $jsonPath"

# 2. Output SQL script
$sqlPath = Join-Path $PSScriptRoot "og_league_seed.sql"
$sb = [System.Text.StringBuilder]::new()

$sb.AppendLine("-- ==============================================================================") | Out-Null
$sb.AppendLine("-- SPORTS PSYCHIC - OG LEAGUE 2026 COMPLETE SEED DATA") | Out-Null
$sb.AppendLine("-- 12 Players • 272 Games • 3,264 Historical Season Picks (Pre-Scored)") | Out-Null
$sb.AppendLine("-- Run this in Supabase SQL Editor AFTER running supabase_schema.sql") | Out-Null
$sb.AppendLine("-- ==============================================================================") | Out-Null
$sb.AppendLine("") | Out-Null

$sb.AppendLine("-- 1. Insert OG League Master Record") | Out-Null
$sb.AppendLine("INSERT INTO public.leagues (id, name, join_code, scoring_format, season_year, is_public, pts_winner, pts_closest, pts_closest_tie, pts_exact, pts_exact_tie, lock_of_week_multiplier, require_scores, lock_type) VALUES ('$ogLeagueId', 'OG League', 'OG2026', 'classic_proximity', 2026, false, 10, 10, 5, 50, 25, 3, true, 'season_prekickoff') ON CONFLICT (join_code) DO NOTHING;") | Out-Null
$sb.AppendLine("") | Out-Null

$sb.AppendLine("-- 2. Insert 12 Pre-Mapped Roster Invites") | Out-Null
$sb.AppendLine("-- (Commissioner can populate invited_email anytime to auto-link accounts)") | Out-Null
$sb.AppendLine("INSERT INTO public.league_roster_invites (league_id, player_name, invited_email, favorite_team, avatar_url) VALUES") | Out-Null
$inviteLines = @()
foreach ($pName in $playerNames) {
    $cfg = $playerConfig[$pName]
    $inviteLines += "  ('$ogLeagueId', '$pName', NULL, '$($cfg.team)', '$($cfg.avatar)')"
}
$sb.AppendLine(($inviteLines -join ",`n") + "`nON CONFLICT (league_id, player_name) DO NOTHING;") | Out-Null
$sb.AppendLine("") | Out-Null

$sb.AppendLine("-- 3. Master Schedule (272 NFL Regular Season Games)") | Out-Null
# Batch games in groups of 50
$batchSize = 50
for ($i = 0; $i -lt $gamesList.Count; $i += $batchSize) {
    $batch = $gamesList.GetRange($i, [Math]::Min($batchSize, $gamesList.Count - $i))
    $gameRows = @()
    foreach ($g in $batch) {
        $w = if ($g.winner) { "'$($g.winner)'" } else { "NULL" }
        $as = if ($null -ne $g.away_score) { $g.away_score } else { "NULL" }
        $hs = if ($null -ne $g.home_score) { $g.home_score } else { "NULL" }
        $fin = if ($g.is_final) { "true" } else { "false" }
        $gameRows += "  ('$($g.id)', 2026, $($g.week_num), '$($g.matchup)', '$($g.away_team)', '$($g.home_team)', now(), $w, $as, $hs, $fin)"
    }
    $sb.AppendLine("INSERT INTO public.games (id, season_year, week_num, matchup, away_team, home_team, kickoff_time, winner, away_score, home_score, is_final) VALUES") | Out-Null
    $sb.AppendLine(($gameRows -join ",`n") + "`nON CONFLICT (id) DO NOTHING;") | Out-Null
    $sb.AppendLine("") | Out-Null
}

$sb.AppendLine("-- 4. Pre-Recorded Historical Predictions (3,264 Picks Across 18 Weeks)") | Out-Null
# Batch picks in groups of 250
$pickBatchSize = 250
for ($i = 0; $i -lt $picksList.Count; $i += $pickBatchSize) {
    $batch = $picksList.GetRange($i, [Math]::Min($pickBatchSize, $picksList.Count - $i))
    $pickRows = @()
    foreach ($p in $batch) {
        $mult = if ($p.is_multiplier) { "true" } else { "false" }
        $close = if ($p.is_closest) { "true" } else { "false" }
        $ex = if ($p.is_exact) { "true" } else { "false" }
        $w = if ($p.picked_winner) { "'$($p.picked_winner)'" } else { "''" }
        $pickRows += "  ('$ogLeagueId', '$($p.player_name)', '$($p.game_id)', $($p.week_num), $w, $($p.predicted_away), $($p.predicted_home), $mult, $($p.points_earned), $($p.base_points), $($p.bonus_points), $close, $ex)"
    }
    $sb.AppendLine("INSERT INTO public.picks (league_id, player_name, game_id, week_num, picked_winner, predicted_away, predicted_home, is_multiplier, points_earned, base_points, bonus_points, is_closest, is_exact) VALUES") | Out-Null
    $sb.AppendLine(($pickRows -join ",`n") + "`nON CONFLICT (league_id, player_name, game_id) DO NOTHING;") | Out-Null
    $sb.AppendLine("") | Out-Null
}

$sb.ToString() | Set-Content -Path $sqlPath -Encoding UTF8
Write-Host "Wrote complete SQL seed script to $sqlPath"
