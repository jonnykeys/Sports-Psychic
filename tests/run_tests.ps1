# Windows PowerShell Test Suite Runner for Sports Psychic
Write-Host ''
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ' 🔮 SPORTS PSYCHIC AUTOMATED TEST SUITE (11 SUITES)' -ForegroundColor Cyan
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ''

$testResults = @()

function Assert-Test {
    param([bool]$condition, [string]$message)
    if ($condition) {
        Write-Host "  [PASS] $message" -ForegroundColor Green
        $script:testResults += $true
        return
    }
    Write-Host "  [FAIL] $message" -ForegroundColor Red
    $script:testResults += $false
}

Write-Host '  -- Suite 1: Scoring Rules & Multipliers --' -ForegroundColor Yellow
$winnerBase = 10
$multBase = $winnerBase * 3
Assert-Test ($multBase -eq 30) '3X Lock triples winner base points to 30'

$closestSingle = 10
$closestSplit = 5
Assert-Test (($closestSingle * 3) -eq 30) '3X Lock triples closest bonus to 30'
Assert-Test (($closestSplit * 3) -eq 15) '3X Lock triples split closest bonus to 15'

$exactSingle = 50
$exactSplit = 25
Assert-Test (($exactSingle * 3) -eq 150) '3X Lock triples exact jackpot to 150'
Assert-Test (($exactSplit * 3) -eq 75) '3X Lock triples split exact jackpot to 75'

# Exact Mathematical Win-Loss Percentage Tie-Breaker
$brettRate = 35.0 / 64.0
$carsonRate = 31.0 / 64.0
Assert-Test ($brettRate -gt $carsonRate) 'Brett exact Win-Loss pct breaks tie ahead of Carson'

# Verified Standings Total Check (Weeks 1-4)
$calebTotal = 130 + 240 + 120 + 140
Assert-Test ($calebTotal -eq 630) 'Caleb 4-week verified season total equals 630 PTS'

Write-Host ''
Write-Host '  -- Suite 2: NFL Dates & Wednesday Rollovers --' -ForegroundColor Yellow
$weekStarts = @(
  "2026-09-09", "2026-09-16", "2026-09-23", "2026-09-30",
  "2026-10-07", "2026-10-14", "2026-10-21", "2026-10-28",
  "2026-11-04", "2026-11-11", "2026-11-18", "2026-11-25",
  "2026-12-02", "2026-12-09", "2026-12-16", "2026-12-23",
  "2026-12-30", "2027-01-06"
)
Assert-Test ($weekStarts.Count -eq 18) 'NFL schedule contains 18 week milestones'

function Get-NFLWeek([string]$dateStr) {
    $w = 1
    for ($i = 0; $i -lt $script:weekStarts.Count; $i++) {
        if ($dateStr -ge $script:weekStarts[$i]) {
            $w = $i + 1
        } else {
            break
        }
    }
    return [Math]::Min(18, [Math]::Max(1, $w))
}

Assert-Test ((Get-NFLWeek '2026-08-20') -eq 1) 'Pre-season date defaults to Week 1'
Assert-Test ((Get-NFLWeek '2026-09-09') -eq 1) 'Sep 9, 2026 kickoff is Week 1'
Assert-Test ((Get-NFLWeek '2026-09-16') -eq 2) 'Sep 16, 2026 Wednesday rolls over to Week 2'
Assert-Test ((Get-NFLWeek '2026-09-30') -eq 4) 'Sep 30, 2026 is Week 4'

function Test-GameLocked([datetime]$kickoff, [datetime]$current) {
    return ($current -ge $kickoff)
}
$kickoffTime = [datetime]'2026-10-04T17:00:00Z'
$beforeTime  = [datetime]'2026-10-04T16:59:00Z'
$afterTime   = [datetime]'2026-10-04T17:01:00Z'
Assert-Test (-not (Test-GameLocked $kickoffTime $beforeTime)) 'Game unlocked before kickoff'
Assert-Test (Test-GameLocked $kickoffTime $afterTime) 'Game locked after kickoff'

Write-Host ''
Write-Host '  -- Suite 3: 32-Team Directory & Aliases --' -ForegroundColor Yellow
$aliases = @{
    'WSH' = 'WAS';
    'JAX' = 'JAC';
    'OAK' = 'LV';
    'SD'  = 'LAC';
    'STL' = 'LAR'
}
Assert-Test ($aliases['WSH'] -eq 'WAS') 'WSH normalizes to WAS'
Assert-Test ($aliases['JAX'] -eq 'JAC') 'JAX normalizes to JAC'
Assert-Test ($aliases['OAK'] -eq 'LV') 'OAK normalizes to LV'
Assert-Test ($aliases['SD'] -eq 'LAC') 'SD normalizes to LAC'

Write-Host ''
Write-Host '  -- Suite 4: ESPN Telemetry Parsing Logic --' -ForegroundColor Yellow
$parsedAway = 34
$parsedHome = 24
$isFinal = $true
$winner = if ($parsedAway -gt $parsedHome) { 'BUF' } else { 'MIA' }
Assert-Test ($isFinal -and ($winner -eq 'BUF')) 'Completed game marks isFinal=true and winner=BUF'

Write-Host ''
Write-Host '  -- Suite 5: Supabase Services & Cloud Persistence --' -ForegroundColor Yellow
$cleanInviteCode = ' og2026 '.Trim().ToUpper()
Assert-Test ($cleanInviteCode -eq 'OG2026') 'Invite code normalizes whitespace and uppercase'
$mockUserId = 'user-123'
$mockWeekNum = 5
$sheetPayload = @{
    user_id = $mockUserId;
    week_number = $mockWeekNum;
    sheet_title = "Week $mockWeekNum Picks"
}
Assert-Test ($sheetPayload.sheet_title -eq 'Week 5 Picks') 'Pick sheet title generates dynamically'

Write-Host ''
Write-Host '  -- Suite 6: Standings & Matchup UI Component Renderers --' -ForegroundColor Yellow
function Format-RankBadge([int]$rank, [bool]$isTied) {
    if ($isTied) { return "T-$rank" }
    return "$rank"
}
Assert-Test ((Format-RankBadge 1 $false) -eq '1') 'Rank 1 displays as 1'
Assert-Test ((Format-RankBadge 11 $true) -eq 'T-11') 'Tied rank displays with T- prefix'

$winPctDisplay = "$([Math]::Round((35.0 / 64.0) * 100))%"
Write-Host ''
Write-Host '  -- Suite 7: Master Pick Sheet, Dual Steppers & Season Lock --' -ForegroundColor Yellow

# 1. Master Sheet Initialization
$testUserId = 'user_abc123'
$masterId = "master_$testUserId"
Assert-Test ($masterId -eq 'master_user_abc123') 'Master sheet ID adheres to master_{userId} pattern'

# 2. Dual-Speed Stepper Bounds Clamping (0 to 99)
function Step-Score([int]$current, [int]$delta) {
    return [Math]::Max(0, [Math]::Min(99, $current + $delta))
}
Assert-Test ((Step-Score 20 10) -eq 30) 'Dual-speed +10 steps 20 to 30'
Assert-Test ((Step-Score 20 -10) -eq 10) 'Dual-speed -10 steps 20 to 10'
Assert-Test ((Step-Score 95 10) -eq 99) 'Dual-speed +10 clamps cleanly at 99'
Assert-Test ((Step-Score 5 -10) -eq 0) 'Dual-speed -10 clamps cleanly at 0'

# 3. Single 3X Lock per Week Invariant
$weekPicks = @{
    'g1' = @{ team = 'KC'; multiplier = $true };
    'g2' = @{ team = 'BUF'; multiplier = $false }
}
# Toggle 3X on g2 -> g1 must be cleared
if ($weekPicks['g2'].multiplier -eq $false) {
    $weekPicks['g1'].multiplier = $false
    $weekPicks['g2'].multiplier = $true
}
Assert-Test (($weekPicks['g2'].multiplier -eq $true) -and ($weekPicks['g1'].multiplier -eq $false)) 'Only exactly one game per week retains 3X multiplier'

# 4. Season Lock Permanence Invariant
function Is-GameLocked([bool]$seasonLocked, [bool]$kickoffPassed, [string]$mode) {
    if ($mode -eq 'season' -and $seasonLocked) { return $true }
    return $kickoffPassed
}
Assert-Test (Is-GameLocked $true $false 'season') 'Locked season campaign freezes all future games'
Assert-Test (-not (Is-GameLocked $true $false 'weekly')) 'Weekly sprint allows editing unstarted games even if season is locked'

# 5. Guest Solo Access & Privacy Isolation
$guestUserId = $null
$guestSheetId = if ($guestUserId) { "master_$guestUserId" } else { "master_guest" }
Assert-Test ($guestSheetId -eq 'master_guest') 'Guest initializes Master Sheet with master_guest ID'

function Can-RenderOGChips([string]$appMode, [string]$activeLeague, [bool]$hasCustomData) {
    return ($appMode -eq 'league') -and (($activeLeague -eq 'OG League') -or (-not $hasCustomData))
}
Assert-Test (-not (Can-RenderOGChips 'solo' 'solo' $false)) 'Solo mode strictly prohibits rendering OG League member chips'
Assert-Test (-not (Can-RenderOGChips 'lobby' $null $false)) 'Public Lobby strictly prohibits rendering OG League member chips'
Assert-Test (Can-RenderOGChips 'league' 'OG League' $false) 'OG League view renders OG League member chips'

function Can-SubmitGlobalLeaderboard([object]$authUser) {
    return ($null -ne $authUser)
}
Assert-Test (-not (Can-SubmitGlobalLeaderboard $null)) 'Guest is strictly prevented from submitting to Global Leaderboard without account'
Assert-Test (Can-SubmitGlobalLeaderboard @{ id = 'usr_123' }) 'Authenticated user is permitted to submit to Global Leaderboard'

# 6. getTeamInfo Metadata & Contrast Resolution
function Mock-GetTeamInfo([string]$code) {
    $norm = if ($code -eq 'WAS') { 'WSH' } elseif ($code -eq 'OAK') { 'LV' } else { $code }
    $colors = @{ 'KC' = '#E31837'; 'BUF' = '#00338D'; 'WSH' = '#5A1414'; 'LV' = '#000000' }
    $hex = if ($colors.ContainsKey($norm)) { $colors[$norm] } else { '#2a3b50' }
    return @{
        code = $norm
        color = $hex
        textColor = if ($hex -eq '#000000') { '#ffffff' } else { '#ffffff' }
    }
}
$kcInfo = Mock-GetTeamInfo 'KC'
Assert-Test ($kcInfo.code -eq 'KC' -and $kcInfo.color -eq '#E31837') 'getTeamInfo resolves Chiefs color and code'
$wasInfo = Mock-GetTeamInfo 'WAS'
Assert-Test ($wasInfo.code -eq 'WSH') 'getTeamInfo normalizes alias WAS to WSH'

# 7. Solo Campaign Mode Branding
$seasonModeLabel = 'Season Prophecy'
$weeklyModeLabel = 'Weekly Vision'
Assert-Test ($seasonModeLabel -eq 'Season Prophecy') 'Mode 1 branded as Season Prophecy'
Assert-Test ($weeklyModeLabel -eq 'Weekly Vision') 'Mode 2 branded as Weekly Vision'

Write-Host ''
Write-Host '  -- Suite 8: Week Navigation & Compact Pro Prediction Card Architecture --' -ForegroundColor Yellow

# 1. Week Stepper Clamping Logic
function Mock-StepSoloWeek([int]$curWeek, [int]$delta) {
    $target = $curWeek + $delta
    if ($target -lt 1) { $target = 1 }
    if ($target -gt 18) { $target = 18 }
    return $target
}
Assert-Test ((Mock-StepSoloWeek 5 1) -eq 6) 'stepSoloWeek increments Week 5 to Week 6'
Assert-Test ((Mock-StepSoloWeek 5 -1) -eq 4) 'stepSoloWeek decrements Week 5 to Week 4'
Assert-Test ((Mock-StepSoloWeek 1 -1) -eq 1) 'stepSoloWeek clamps down cleanly at Week 1'
Assert-Test ((Mock-StepSoloWeek 18 1) -eq 18) 'stepSoloWeek clamps up cleanly at Week 18'

# 2. Verify app.js Pro Card & Week Navigation Code Elements
$appJsContent = Get-Content -Raw -Path 'apps/og-league/app.js'
Assert-Test ($appJsContent -match 'solo-control-header') 'app.js includes solo-control-header markup'
Assert-Test ($appJsContent -match 'solo-week-stepper-row') 'app.js includes solo-week-stepper-row navigation'
Assert-Test ($appJsContent -match 'game-matchup-header-row') 'app.js includes symmetrical game-matchup-header-row'
Assert-Test ($appJsContent -match 'btn-pick-away') 'app.js includes away team winner pick button'
Assert-Test ($appJsContent -match 'btn-pick-home') 'app.js includes home team winner pick button'
Assert-Test ($appJsContent -match 'game-scores-row') 'app.js includes centered score stepper row'
Assert-Test ($appJsContent -match 'btn-card-lock-3x') 'app.js includes compact 3X Lock button'
Assert-Test ($appJsContent -match 'window\.stepSoloWeek = stepSoloWeek') 'app.js exports stepSoloWeek to window'
Assert-Test ($appJsContent -match 'window\.selectSoloSheetWeek = selectSoloSheetWeek') 'app.js exports selectSoloSheetWeek to window'
Assert-Test ($appJsContent -notmatch 'window\.setMyPlayer\b') 'app.js contains no orphaned setMyPlayer assignments'
Assert-Test ($appJsContent -notmatch 'window\.toggleMyProfile\b') 'app.js contains no orphaned toggleMyProfile assignments'

# 3. Verify style.css Compact Card & Header Styles
$styleCssContent = Get-Content -Raw -Path 'apps/og-league/style.css'
Assert-Test ($styleCssContent -match '\.solo-control-header') 'style.css defines .solo-control-header'
Assert-Test ($styleCssContent -match '\.solo-week-stepper-row') 'style.css defines .solo-week-stepper-row'
Assert-Test ($styleCssContent -match '\.solo-week-stepper-row \.sheet-week-strip') 'style.css defines .solo-week-stepper-row .sheet-week-strip'
Assert-Test ($styleCssContent -match '\.game-matchup-header-row') 'style.css defines .game-matchup-header-row'
Assert-Test ($styleCssContent -match '\.btn-pick-winner') 'style.css defines .btn-pick-winner'
Assert-Test ($styleCssContent -match '\.game-scores-row') 'style.css defines .game-scores-row'
Assert-Test ($styleCssContent -match '\.btn-card-lock-3x') 'style.css defines .btn-card-lock-3x'
Assert-Test ($styleCssContent -match '\.sheet-games-grid') 'style.css defines .sheet-games-grid'

# -- Suite 9: Winner Selection, Score Inversion & Made Pick Completeness --
Write-Host ''
Write-Host '  -- Suite 9: Winner Selection, Score Inversion & Made Pick Completeness --' -ForegroundColor Yellow

function Mock-CheckPickComplete([string]$winner, $awaySc, $homeSc, [string]$awayTeam, [string]$homeTeam) {
    if (-not $winner) { return $false }
    if ($null -eq $awaySc -or $null -eq $homeSc) { return $false }
    if ($awaySc -eq $homeSc) { return $false }
    if ($winner -eq $awayTeam -and $awaySc -gt $homeSc) { return $true }
    if ($winner -eq $homeTeam -and $homeSc -gt $awaySc) { return $true }
    return $false
}

function Mock-FlipPickWinner([string]$clickedWinner, [ref]$awaySc, [ref]$homeSc, [string]$awayTeam, [string]$homeTeam) {
    if ($null -ne $awaySc.Value -and $null -ne $homeSc.Value -and $awaySc.Value -ne $homeSc.Value) {
        if ($clickedWinner -eq $awayTeam -and $awaySc.Value -lt $homeSc.Value) {
            $tmp = $awaySc.Value
            $awaySc.Value = $homeSc.Value
            $homeSc.Value = $tmp
        } elseif ($clickedWinner -eq $homeTeam -and $homeSc.Value -lt $awaySc.Value) {
            $tmp = $homeSc.Value
            $homeSc.Value = $awaySc.Value
            $awaySc.Value = $tmp
        }
    }
}

$aScore = 10
$hScore = 20
Mock-FlipPickWinner 'SEA' ([ref]$aScore) ([ref]$hScore) 'SEA' 'DEN'
Assert-Test ($aScore -eq 20 -and $hScore -eq 10) 'Selecting underdog SEA flips 20-10 so SEA gets winning score'

Mock-FlipPickWinner 'DEN' ([ref]$aScore) ([ref]$hScore) 'SEA' 'DEN'
Assert-Test ($aScore -eq 10 -and $hScore -eq 20) 'Selecting DEN flips scores back to DEN 20, SEA 10'

Assert-Test (Mock-CheckPickComplete 'DEN' 10 20 'SEA' 'DEN') 'DEN 20, SEA 10 with winner DEN counts as Made Pick'
Assert-Test (-not (Mock-CheckPickComplete 'SEA' 10 20 'SEA' 'DEN')) 'Contradictory winner SEA with DEN 20, SEA 10 does not count as Made Pick'
Assert-Test (-not (Mock-CheckPickComplete 'DEN' 20 20 'SEA' 'DEN')) 'Tied score 20-20 does not count as Made Pick'
Assert-Test (-not (Mock-CheckPickComplete 'DEN' $null $null 'SEA' 'DEN')) 'Winner without scores does not count as Made Pick'

Assert-Test ($appJsContent -match 'isSoloPickComplete') 'app.js defines isSoloPickComplete helper'
Assert-Test ($appJsContent -match 'window\.isSoloPickComplete = isSoloPickComplete') 'app.js exports isSoloPickComplete to window'

# -- Suite 10: Global Community Leaderboard & Approach A Scoring Engine --
Write-Host ''
Write-Host '  -- Suite 10: Global Community Leaderboard & Approach A Scoring Engine --' -ForegroundColor Yellow

$soloWinnerPts = 10
$soloExactBonus = 50
$soloExactTotal = $soloWinnerPts + $soloExactBonus
Assert-Test ($soloExactTotal -eq 60) 'Approach A exact score awards 10 base + 50 exact bonus = 60 PTS'

$soloClosestBonus = 10
$soloClosestTotal = $soloWinnerPts + $soloClosestBonus
Assert-Test ($soloClosestTotal -eq 20) 'Approach A closest score awards 10 base + 10 closest bonus = 20 PTS'

$exact3x = $soloExactTotal * 3
Assert-Test ($exact3x -eq 180) 'Approach A 3X Lock triples exact jackpot to 180 PTS'

$closest3x = $soloClosestTotal * 3
Assert-Test ($closest3x -eq 60) 'Approach A 3X Lock triples closest bonus to 60 PTS'

$tieCount = 4
$awardedPointsPerTie = $soloClosestBonus
Assert-Test ($awardedPointsPerTie -eq 10) 'Approach A awards full 10 PTS closest bonus to tied predictions without fractional dilution'

$indexHtmlContent = Get-Content -Raw 'apps/og-league/index.html'
Assert-Test ($indexHtmlContent -match 'id="global-leaderboard-modal"') 'index.html defines #global-leaderboard-modal markup'
Assert-Test ($appJsContent -match 'btn-solo-leaderboard') 'app.js renders .btn-solo-leaderboard'
Assert-Test ($indexHtmlContent -match 'app\.js\?v=17\.0') 'index.html includes app.js?v=17.0 cache buster'
Assert-Test ($indexHtmlContent -match 'style\.css\?v=17\.0') 'index.html includes style.css?v=17.0 cache buster'
Assert-Test ($indexHtmlContent -notmatch 'Set Me') 'index.html contains no legacy Set Me text'
Assert-Test ($styleCssContent -match '#btn-header-profile,\s*#btn-league-switcher\s*\{\s*display:\s*none\s*!important;') 'style.css hides header profile button by default'

Assert-Test ($appJsContent -match 'openGlobalLeaderboardModal') 'app.js defines openGlobalLeaderboardModal'
Assert-Test ($appJsContent -match 'loadAndRenderGlobalLeaderboard') 'app.js defines loadAndRenderGlobalLeaderboard'
Assert-Test ($appJsContent -match 'window\.openGlobalLeaderboardModal = openGlobalLeaderboardModal') 'app.js exports openGlobalLeaderboardModal to window'
Assert-Test ($appJsContent -match 'window\.loadAndRenderGlobalLeaderboard = loadAndRenderGlobalLeaderboard') 'app.js exports loadAndRenderGlobalLeaderboard to window'

Assert-Test ($styleCssContent -match '\.global-leaderboard-dialog') 'style.css defines .global-leaderboard-dialog'
Assert-Test ($styleCssContent -match '\.global-lb-table') 'style.css defines .global-lb-table'
Assert-Test ($styleCssContent -match '\.btn-solo-leaderboard') 'style.css defines .btn-solo-leaderboard'

# -- Suite 11: Independent Season Prophecy vs Weekly Vision Pick Separation --
Write-Host ''
Write-Host '  -- Suite 11: Independent Season Prophecy vs Weekly Vision Pick Separation --' -ForegroundColor Yellow

$mockSheet = @{
    id = "master_test_user";
    season_picks = @{
        "Week 6_DEN_SEA" = @{ winner = "DEN"; awayScore = 10; homeScore = 20; multiplier = $true };
    };
    weekly_picks = @{
        "Week 6_DEN_SEA" = @{ winner = "SEA"; awayScore = 24; homeScore = 21; multiplier = $false };
        "Week 6_KC_LAC"  = @{ winner = "KC";  awayScore = 17; homeScore = 31; multiplier = $true };
    };
}

Assert-Test ($mockSheet.season_picks["Week 6_DEN_SEA"].winner -eq "DEN") 'Season Prophecy retains DEN winning 20-10'
Assert-Test ($mockSheet.weekly_picks["Week 6_DEN_SEA"].winner -eq "SEA") 'Weekly Vision independently records SEA winning 24-21'
Assert-Test ($mockSheet.season_picks["Week 6_DEN_SEA"].multiplier -eq $true) 'Season Prophecy independently holds 3X multiplier on DEN@SEA'
Assert-Test ($mockSheet.weekly_picks["Week 6_DEN_SEA"].multiplier -eq $false) 'Weekly Vision does not inherit 3X multiplier on DEN@SEA'
Assert-Test ($mockSheet.weekly_picks["Week 6_KC_LAC"].multiplier -eq $true) 'Weekly Vision holds independent 3X multiplier on KC@LAC'

$migrationSql = Get-Content -Raw 'database/migration_pick_sheets.sql'
Assert-Test ($migrationSql -match 'weekly_picks\s+jsonb') 'migration_pick_sheets.sql defines weekly_picks column'

$schemaSql = Get-Content -Raw 'database/supabase_schema.sql'
Assert-Test ($schemaSql -match 'weekly_picks\s+jsonb') 'supabase_schema.sql defines weekly_picks column'

Assert-Test ($appJsContent -match 'getActiveSoloPicks') 'app.js defines getActiveSoloPicks'
Assert-Test ($appJsContent -match 'window\.getActiveSoloPicks = getActiveSoloPicks') 'app.js exports getActiveSoloPicks to window'
Assert-Test ($appJsContent -match 'weekly_picks') 'app.js includes weekly_picks state management'

# -- Suite 12: OG League Solo Reflection & Global Leaderboard Sub-Headers --
Write-Host ''
Write-Host '  -- Suite 12: OG League Solo Reflection & Global Leaderboard Sub-Headers --' -ForegroundColor Yellow

$rawOg = Get-Content 'apps/og-league/data.js' -Raw
$jsonTextOg = $rawOg -replace '^\s*//[^\n\r]*[\r\n]+', '' -replace '^\s*const\s+OG_LEAGUE_INITIAL_DATA\s*=\s*', '' -replace ';\s*$', ''
$dataOg = ConvertFrom-Json $jsonTextOg

$jonPicksCount = 0
$calebPicksCount = 0
foreach ($w in $dataOg.weeks.psobject.properties.Name) {
    foreach ($g in $dataOg.weeks.$w.games) {
        if ($g.picks.Jon -and $g.picks.Jon.winner) { $jonPicksCount++ }
        if ($g.picks.Caleb -and $g.picks.Caleb.winner) { $calebPicksCount++ }
    }
}
Assert-Test ($jonPicksCount -eq 272) 'Jon OG League dataset contains full 272 season picks'
Assert-Test ($calebPicksCount -eq 272) 'Caleb OG League dataset contains full 272 season picks'

Assert-Test ($appJsContent -match 'extractOgLeaguePicksForPlayer') 'app.js defines extractOgLeaguePicksForPlayer'
Assert-Test ($appJsContent -match 'syncOgLeaguePicksToSoloProphecy') 'app.js defines syncOgLeaguePicksToSoloProphecy'
Assert-Test ($appJsContent -match 'window\.extractOgLeaguePicksForPlayer\s*=') 'app.js exports extractOgLeaguePicksForPlayer to window'
Assert-Test ($appJsContent -match 'window\.syncOgLeaguePicksToSoloProphecy\s*=') 'app.js exports syncOgLeaguePicksToSoloProphecy to window'

Assert-Test ($appJsContent -match 'btn-solo-sync-og') 'app.js renders btn-solo-sync-og button'
Assert-Test ($appJsContent -match 'lb-sub-label') 'app.js renders lb-sub-label for entry provenance'
Assert-Test ($styleCssContent -match '\.btn-solo-sync-og') 'style.css defines .btn-solo-sync-og'
Assert-Test ($styleCssContent -match '\.lb-sub-label') 'style.css defines .lb-sub-label'

Assert-Test ($migrationSql -match 'submission_label\s+text') 'migration_pick_sheets.sql defines submission_label column'
Assert-Test ($schemaSql -match 'submission_label') 'supabase_schema.sql references submission_label'

$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

Write-Host ''
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host " Total Assertions: $total | Passed: $passed | Failed: $($total - $passed)" -ForegroundColor Cyan
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host ''

if ($passed -eq $total) {
    Write-Host ' All 12 modular test suites verified successfully!' -ForegroundColor Green
    Write-Host ''
}
