# Sports Psychic - OG League 2026 Seed Data Generator
param()

$dataFilePath = Join-Path $PSScriptRoot "..\OG League Live\data.js"
$raw = Get-Content -Raw -Path $dataFilePath
$jsonStr = $raw.Substring($raw.IndexOf('{')).Trim().TrimEnd(';')
$ogData = $jsonStr | ConvertFrom-Json

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

$gamesList = [System.Collections.Generic.List[PSObject]]::new()
$picksList = [System.Collections.Generic.List[PSObject]]::new()

$weeksProps = $ogData.weeks.PSObject.Properties

foreach ($wProp in $weeksProps) {
    $weekName = $wProp.Name
    $weekNum = [int]($weekName -replace "Week\s*", "")
    $games = $wProp.Value.games

    foreach ($g in $games) {
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

# Output JSON bundle
$seedBundle = @{
    league = @{
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

# Output SQL script
$sqlPath = Join-Path $PSScriptRoot "og_league_seed.sql"
$sb = [System.Text.StringBuilder]::new()

$sb.AppendLine("-- ==============================================================================") | Out-Null
$sb.AppendLine("-- SPORTS PSYCHIC - OG LEAGUE 2026 SEED DATA") | Out-Null
$sb.AppendLine("-- 12 Players • 272 Games • 3,264 Picks") | Out-Null
$sb.AppendLine("-- ==============================================================================") | Out-Null
$sb.AppendLine("") | Out-Null

$sb.AppendLine("INSERT INTO public.leagues (name, join_code, scoring_format, season_year, is_public, pts_winner, pts_closest, pts_closest_tie, pts_exact, pts_exact_tie, lock_of_week_multiplier, require_scores, lock_type) VALUES ('OG League', 'OG2026', 'classic_proximity', 2026, false, 10, 10, 5, 50, 25, 3, true, 'season_prekickoff') ON CONFLICT (join_code) DO NOTHING;") | Out-Null
$sb.AppendLine("") | Out-Null

$sb.AppendLine("-- Master Schedule ($($gamesList.Count) games)") | Out-Null
foreach ($g in $gamesList) {
    $w = if ($g.winner) { "'$($g.winner)'" } else { "NULL" }
    $as = if ($null -ne $g.away_score) { $g.away_score } else { "NULL" }
    $hs = if ($null -ne $g.home_score) { $g.home_score } else { "NULL" }
    $fin = if ($g.is_final) { "true" } else { "false" }
    $sb.AppendLine("INSERT INTO public.games (id, season_year, week_num, matchup, away_team, home_team, kickoff_time, winner, away_score, home_score, is_final) VALUES ('$($g.id)', 2026, $($g.week_num), '$($g.matchup)', '$($g.away_team)', '$($g.home_team)', now(), $w, $as, $hs, $fin) ON CONFLICT (id) DO NOTHING;") | Out-Null
}

$sb.ToString() | Set-Content -Path $sqlPath -Encoding UTF8
Write-Host "Wrote SQL seed script to $sqlPath"
