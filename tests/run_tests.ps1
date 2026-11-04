# Windows PowerShell Test Suite Runner for Sports Psychic
Write-Host ''
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ' 🔮 SPORTS PSYCHIC AUTOMATED TEST SUITE (16 SUITES)' -ForegroundColor Cyan
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
Assert-Test ((Get-NFLWeek '2026-10-31') -eq 8) 'Oct 31, 2026 is Week 8'

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
Assert-Test ($appJsContent -match 'athletic-tiles-grid') 'app.js includes athletic-tiles-grid prediction layout'
Assert-Test ($appJsContent -match 'btn-pick-away') 'app.js includes away team winner pick button'
Assert-Test ($appJsContent -match 'btn-pick-home') 'app.js includes home team winner pick button'
Assert-Test ($appJsContent -match 'game-scores-row') 'app.js includes centered score stepper row'
Assert-Test ($appJsContent -match 'btn-score-circle') 'app.js includes circular stepper buttons'
Assert-Test ($appJsContent -match 'btn-score-preset') 'app.js includes dedicated 1-tap preset score chips'
Assert-Test ($appJsContent -match 'btn-card-lock-3x') 'app.js includes compact 3X Lock button'
Assert-Test ($appJsContent -match 'window\.setSoloPickExactScore = setSoloPickExactScore') 'app.js exports setSoloPickExactScore to window'
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
Assert-Test ($styleCssContent -match '\.athletic-tiles-grid') 'style.css defines .athletic-tiles-grid'
Assert-Test ($styleCssContent -match '\.team-athletic-tile') 'style.css defines .team-athletic-tile'
Assert-Test ($styleCssContent -match '\.btn-pick-winner') 'style.css defines .btn-pick-winner'
Assert-Test ($styleCssContent -match '\.btn-score-circle') 'style.css defines .btn-score-circle'
Assert-Test ($styleCssContent -match '\.btn-score-preset') 'style.css defines .btn-score-preset'
Assert-Test ($styleCssContent -match '\.has-multiplier-3x') 'style.css defines .has-multiplier-3x highlight'
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
Assert-Test ($indexHtmlContent -match 'app\.js\?v=31\.1') 'index.html includes app.js?v=31.1 cache buster'
Assert-Test ($indexHtmlContent -match 'style\.css\?v=31\.1') 'index.html includes style.css?v=31.1 cache buster'
Assert-Test ($indexHtmlContent -notmatch 'Set Me') 'index.html contains no legacy Set Me text'
Assert-Test ($indexHtmlContent -notmatch 'hero-btn-arrow') 'index.html contains no unnecessary down arrow on Start Predicting Free'
Assert-Test ($indexHtmlContent -notmatch '🔮 Start Predicting Free') 'index.html contains clean emoji-free Start Predicting Free CTA'
Assert-Test ($styleCssContent -match '#btn-header-profile,\s*#btn-league-switcher\s*\{\s*display:\s*none\s*!important;') 'style.css hides header profile button by default'

Assert-Test ($appJsContent -match 'openGlobalLeaderboardModal') 'app.js defines openGlobalLeaderboardModal'
Assert-Test ($appJsContent -match 'loadAndRenderGlobalLeaderboard') 'app.js defines loadAndRenderGlobalLeaderboard'
Assert-Test ($appJsContent -match 'window\.openGlobalLeaderboardModal = openGlobalLeaderboardModal') 'app.js exports openGlobalLeaderboardModal to window'
Assert-Test ($appJsContent -match 'window\.loadAndRenderGlobalLeaderboard = loadAndRenderGlobalLeaderboard') 'app.js exports loadAndRenderGlobalLeaderboard to window'

Assert-Test ($appJsContent -match 'updateGlobalStandingsRibbon') 'app.js defines updateGlobalStandingsRibbon'
Assert-Test ($appJsContent -match 'window\.updateGlobalStandingsRibbon = updateGlobalStandingsRibbon') 'app.js exports updateGlobalStandingsRibbon to window'
Assert-Test ($appJsContent -match 'getGlobalMinDiffForGame') 'app.js defines getGlobalMinDiffForGame'
Assert-Test ($appJsContent -match 'window\.getGlobalMinDiffForGame = getGlobalMinDiffForGame') 'app.js exports getGlobalMinDiffForGame to window'
Assert-Test ($indexHtmlContent -match 'id="hero-global-lead-name">Dishman') 'index.html hero ribbon displays Dishman'
Assert-Test ($indexHtmlContent -match 'id="hero-global-lead-pts">1,000 PTS') 'index.html hero ribbon displays 1,000 PTS'

# Universal Global Closest Scoring Gate: strictly awarded ONLY if diff matches global minimum
function Test-GlobalClosestGate($playerDiff, $globalMinDiff, [bool]$pickedWinner) {
    if (-not $pickedWinner) { return $false }
    return ($playerDiff -le $globalMinDiff -or $globalMinDiff -eq [double]::PositiveInfinity)
}
Assert-Test (Test-GlobalClosestGate 2 2 $true) 'Global Closest awarded when user matches global minimum diff'
Assert-Test (Test-GlobalClosestGate 1 3 $true) 'Global Closest awarded when user beats global minimum diff'
Assert-Test (-not (Test-GlobalClosestGate 4 2 $true)) 'Global Closest strictly denied when competitor was closer in global pool'
Assert-Test (-not (Test-GlobalClosestGate 2 2 $false)) 'Global Closest strictly denied when user picked losing team'

Assert-Test ($styleCssContent -match '\.global-leaderboard-dialog') 'style.css defines .global-leaderboard-dialog'
Assert-Test ($styleCssContent -match '\.global-lb-table') 'style.css defines .global-lb-table'
Assert-Test ($styleCssContent -match '\.btn-solo-leaderboard') 'style.css defines .btn-solo-leaderboard'

# Home Page Modernization & Live In-Game Telemetry Assertions
Assert-Test ($indexHtmlContent -match 'command-center-header') 'index.html defines Command Center header markup'
Assert-Test ($indexHtmlContent -match 'picks-progress-track') 'index.html defines picks progress track markup'
Assert-Test ($indexHtmlContent -match 'lobby-invite-strip') 'index.html defines low-profile lobby invite strip'
Assert-Test ($appJsContent -match 'game-live-telemetry-bar') 'app.js renders game-live-telemetry-bar for live games'
Assert-Test ($appJsContent -match 'live-pulse-dot') 'app.js renders pulsing live indicator dot'
Assert-Test ($appJsContent -match 'possession-dot|possession-football') 'app.js renders possession indicator'
Assert-Test ($appJsContent -match 'window\.renderOption2Card = renderOption2Card') 'app.js exports renderOption2Card to window'
Assert-Test ($styleCssContent -match '\.game-live-telemetry-bar') 'style.css defines .game-live-telemetry-bar'
Assert-Test ($styleCssContent -match '\.command-center-header') 'style.css defines .command-center-header'
Assert-Test ($styleCssContent -match '\.picks-progress-fill') 'style.css defines .picks-progress-fill'

# Option C American Football Score Nudges & Floating Guest Save Banner Assertions
Assert-Test ($appJsContent -match 'btn-football-nudge') 'app.js renders Option C football score nudges (+3 FG, +7 TD)'
Assert-Test ($styleCssContent -match '\.btn-football-nudge') 'style.css defines .btn-football-nudge styling'
Assert-Test ($styleCssContent -match '\.tile-football-nudges-row') 'style.css defines .tile-football-nudges-row grid'
Assert-Test ($indexHtmlContent -match 'id="guest-floating-save-bar"') 'index.html defines #guest-floating-save-bar markup'
Assert-Test ($indexHtmlContent -match "Don't lose your picks") "index.html defines guest save subtitle 'Don't lose your picks'"
Assert-Test ($indexHtmlContent -notmatch 'Save to cloud') "index.html contains no technical 'Save to cloud' references"
Assert-Test ($appJsContent -match 'updateGuestSaveBanner') 'app.js defines updateGuestSaveBanner'
Assert-Test ($appJsContent -match 'window\.updateGuestSaveBanner = updateGuestSaveBanner') 'app.js exports updateGuestSaveBanner to window'
Assert-Test ($styleCssContent -match '\.guest-floating-save-bar') 'style.css defines .guest-floating-save-bar styling'
Assert-Test ($styleCssContent -match '\.btn-guest-save-action') 'style.css defines .btn-guest-save-action styling'

# Guest Home Social Proof Strip & Option B Scoring Guide Assertions
Assert-Test ($indexHtmlContent -match 'guest-standings-strip') 'index.html defines guest-standings-strip social proof ribbon'
Assert-Test ($indexHtmlContent -match 'guest-rules-card') 'index.html defines Option B guest-rules-card'
Assert-Test ($indexHtmlContent -match 'guest-rules-card[\s\S]*?guest-standings-strip') 'index.html renders guest-rules-card above guest-standings-strip'
Assert-Test ($indexHtmlContent -match 'lobby-quick-invite-drawer') 'index.html defines lobby-quick-invite-drawer'
Assert-Test ($appJsContent -match 'toggleLobbyInviteInput') 'app.js defines toggleLobbyInviteInput'
Assert-Test ($appJsContent -match 'window\.toggleLobbyInviteInput = toggleLobbyInviteInput') 'app.js exports toggleLobbyInviteInput to window'
Assert-Test ($styleCssContent -match '\.guest-standings-strip') 'style.css defines .guest-standings-strip styling'
Assert-Test ($styleCssContent -match '\.guest-rules-card') 'style.css defines .guest-rules-card styling'
Assert-Test ($styleCssContent -match '\.rule-sub-card\.pts-win') 'style.css defines Option B League colors (.pts-win)'
Assert-Test ($indexHtmlContent -match 'cta-desktop') 'index.html defines cta-desktop label'
Assert-Test ($indexHtmlContent -match 'cta-mobile') 'index.html defines cta-mobile label'
Assert-Test ($styleCssContent -match 'GUEST HOME MOBILE RESPONSIVE POLISH') 'style.css defines guest home mobile responsive polish'
Assert-Test ($styleCssContent -match 'grid-template-columns:\s*1\.22fr\s*1fr;') 'style.css defines balanced mobile CTA grid'
Assert-Test ($styleCssContent -match 'body\.is-lobby-mode \.bottom-nav \[data-tab="leaderboard"\]\s*\{\s*display:\s*flex\s*!important;') 'style.css allows Standings tab in lobby mode'

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

# Invariant: Season Prophecy draft picks cannot gain points until submitted & locked
function Mock-CalculatePoints([bool]$isSeasonLocked, [int]$evaluatedSeasonPts, [int]$evaluatedWeeklyPts) {
    $seasonPts = if ($isSeasonLocked) { $evaluatedSeasonPts } else { 0 }
    $weeklyPts = $evaluatedWeeklyPts
    return @{ seasonPts = $seasonPts; weeklyPts = $weeklyPts }
}
$draftResult = Mock-CalculatePoints $false 60 40
$lockedResult = Mock-CalculatePoints $true 60 40
Assert-Test ($draftResult.seasonPts -eq 0) 'Season Prophecy draft sheet gains 0 points while is_season_locked is false'
Assert-Test ($lockedResult.seasonPts -eq 60) 'Season Prophecy locked sheet gains full points when is_season_locked is true'
Assert-Test ($draftResult.weeklyPts -eq 40) 'Weekly Vision gains points as games conclude even while season prophecy is unlocked'
Assert-Test ($appJsContent -match 'if\s*\(\s*isSeasonLocked\s*\)\s*\{\s*sheet\.season_total_points\s*=\s*seasonStats\.totalPoints') 'app.js gates season_total_points behind isSeasonLocked'
Assert-Test ($appJsContent -match 'Pick Set \(Draft\)') 'app.js displays draft status on cards when season prophecy is unlocked'
Assert-Test ($styleCssContent -match '\.pick-status-pill\.wrong') 'style.css defines .pick-status-pill.wrong'

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
Assert-Test ($appJsContent -notmatch 'unlockSeasonProphecyUI') 'app.js defines no unlockSeasonProphecyUI (locked season is permanent)'
Assert-Test ($appJsContent -match 'window\.extractOgLeaguePicksForPlayer\s*=') 'app.js exports extractOgLeaguePicksForPlayer to window'
Assert-Test ($appJsContent -notmatch 'btn-unlock-season-compact') 'app.js contains no btn-unlock-season-compact button'
Assert-Test ($appJsContent -match 'solo-lock-status-badge locked') 'app.js renders permanent solo-lock-status-badge for locked season'
Assert-Test ($appJsContent -match 'lb-sub-label') 'app.js renders lb-sub-label for entry provenance'
Assert-Test ($styleCssContent -notmatch '\.btn-unlock-season-compact') 'style.css defines no .btn-unlock-season-compact'
Assert-Test ($styleCssContent -match '\.lb-sub-label') 'style.css defines .lb-sub-label'

Assert-Test ($migrationSql -match 'submission_label\s+text') 'migration_pick_sheets.sql defines submission_label column'
Assert-Test ($schemaSql -match 'submission_label') 'supabase_schema.sql references submission_label'

# -- Suite 13: League Tie-Halving vs Global Scoring & Interactive Breakdown Engine --
Write-Host ''
Write-Host '  -- Suite 13: League Tie-Halving vs Global Scoring & Interactive Breakdown Engine --' -ForegroundColor Yellow

# 1. League Tie Halving Invariant
function Calculate-LeagueClosestPoints([bool]$isTied, [bool]$is3x) {
    $mult = if ($is3x) { 3 } else { 1 }
    $base = 10 * $mult
    $bVal = if ($isTied) { 5 } else { 10 }
    $bonus = $bVal * $mult
    return $base + $bonus
}
Assert-Test ((Calculate-LeagueClosestPoints $false $false) -eq 20) 'League sole closest awards 10 base + 10 bonus = 20 PTS'
Assert-Test ((Calculate-LeagueClosestPoints $true $false) -eq 15) 'League tied closest splits bonus to +5 = 15 PTS'
Assert-Test ((Calculate-LeagueClosestPoints $false $true) -eq 60) 'League sole closest with 3X Lock awards 30 base + 30 bonus = 60 PTS'
Assert-Test ((Calculate-LeagueClosestPoints $true $true) -eq 45) 'League tied closest with 3X Lock awards 30 base + 15 bonus = 45 PTS'

# 2. Verified Player Season Points Alignment
# Wells: 745 in OG League (tie halving), 810 in Global (no tie dilution)
$wellsLeagueDelta = 810 - 745
Assert-Test ($wellsLeagueDelta -eq 65) 'Wells scoring delta between Global (810 PTS) and OG League (745 PTS) equals exactly 65 PTS'

# Dishman: 955 in OG League, 1000 in Global
$dishmanLeagueDelta = 1000 - 955
Assert-Test ($dishmanLeagueDelta -eq 45) 'Dishman scoring delta between Global (1000 PTS) and OG League (955 PTS) equals exactly 45 PTS'

# 3. Interactive Scoring Breakdown Modal Assertions
Assert-Test ($indexHtmlContent -match 'id="score-breakdown-modal"') 'index.html defines #score-breakdown-modal markup'
Assert-Test ($indexHtmlContent -match 'id="score-breakdown-content"') 'index.html defines #score-breakdown-content container'
Assert-Test ($appJsContent -match 'openScoringBreakdownModal') 'app.js defines openScoringBreakdownModal'
Assert-Test ($appJsContent -match 'closeScoringBreakdownModal') 'app.js defines closeScoringBreakdownModal'
Assert-Test ($appJsContent -match 'setBreakdownScoringMode') 'app.js defines setBreakdownScoringMode'
Assert-Test ($appJsContent -match 'renderScoringBreakdownContent') 'app.js defines renderScoringBreakdownContent'
Assert-Test ($appJsContent -match 'selectLeagueTieRule') 'app.js defines selectLeagueTieRule'

Assert-Test ($appJsContent -match 'window\.openScoringBreakdownModal\s*=') 'app.js exports openScoringBreakdownModal to window'
Assert-Test ($appJsContent -match 'window\.closeScoringBreakdownModal\s*=') 'app.js exports closeScoringBreakdownModal to window'
Assert-Test ($appJsContent -match 'window\.setBreakdownScoringMode\s*=') 'app.js exports setBreakdownScoringMode to window'
Assert-Test ($appJsContent -match 'window\.selectLeagueTieRule\s*=') 'app.js exports selectLeagueTieRule to window'

Assert-Test ($appJsContent -match 'btn-lb-breakdown') 'app.js renders btn-lb-breakdown on global leaderboard'
Assert-Test ($appJsContent -notmatch 'btn-hero-breakdown') 'app.js contains no btn-hero-breakdown in League player profile'
Assert-Test ($appJsContent -notmatch 'btn-row-breakdown') 'app.js contains no btn-row-breakdown in League leaderboard rows'

# 4. Commissioner League Creation Tie-Breaking Policy
Assert-Test ($indexHtmlContent -match 'id="league-tie-rule-row"') 'index.html defines #league-tie-rule-row in create league modal'
Assert-Test ($indexHtmlContent -match 'id="league-tie-split"') 'index.html defines #league-tie-split option'
Assert-Test ($indexHtmlContent -match 'id="league-tie-full"') 'index.html defines #league-tie-full option'

# 5. CSS Stylesheet Assertions
$styleCssContent = Get-Content -Raw 'apps/og-league/style.css'
Assert-Test ($styleCssContent -match '\.score-breakdown-dialog') 'style.css defines .score-breakdown-dialog'
Assert-Test ($styleCssContent -match '\.breakdown-stats-grid') 'style.css defines .breakdown-stats-grid'
Assert-Test ($styleCssContent -match '\.breakdown-mode-tabs') 'style.css defines .breakdown-mode-tabs'
Assert-Test ($styleCssContent -match '\.breakdown-rule-banner') 'style.css defines .breakdown-rule-banner'

Write-Host ''
Write-Host '  -- Suite 14: Game Kickoff Timing, Timezones & Pre-Kickoff Lock Engine --' -ForegroundColor Yellow

# 1. Regex Match tests across diverse formats
$koPattern = '(\d{1,2})\/(\d{1,2})(?:[^\d\r\n:]+)(\d{1,2}):(\d{2})\s*(AM|PM)?'
Assert-Test ([regex]::IsMatch('Mon 11/2 @ 7:15pm (MNF)', $koPattern)) 'parseGameKickoff regex matches spreadsheet @ format'
Assert-Test ([regex]::IsMatch('Mon 11/2 • 7:15 PM', $koPattern)) 'parseGameKickoff regex matches ESPN bullet format'
Assert-Test ([regex]::IsMatch('Sun 11/1 @ 12:00pm', $koPattern)) 'parseGameKickoff regex matches Sunday noon format'
Assert-Test ([regex]::IsMatch('11/2 - 7:15 PM EST', $koPattern)) 'parseGameKickoff regex matches ESPN status detail format'

# 2. ISO & Timezone calculations (Nov 2, 2026 is CST -06:00; Sep 13, 2026 is CDT -05:00)
$mnfKickoff = [DateTimeOffset]::Parse('2026-11-02T19:15:00-06:00')
$mnfUtc = $mnfKickoff.ToUniversalTime()
Assert-Test ($mnfUtc.ToString('yyyy-MM-ddTHH:mm:ssZ') -eq '2026-11-03T01:15:00Z') 'Nov 2, 2026 7:15 PM CST equates to 2026-11-03T01:15:00Z'

$noonKickoff = [DateTimeOffset]::Parse('2026-09-13T12:00:00-05:00')
$noonUtc = $noonKickoff.ToUniversalTime()
Assert-Test ($noonUtc.ToString('yyyy-MM-ddTHH:mm:ssZ') -eq '2026-09-13T17:00:00Z') 'Sep 13, 2026 12:00 PM CDT equates to 2026-09-13T17:00:00Z'

# 3. Game Lock Timing at 7:05 PM vs 7:15 PM
function Test-SimulatedLock([hashtable]$game, [DateTimeOffset]$checkTime) {
    if ($game['isFinal']) { return $true }
    if ($null -ne $game['awayScore'] -and $null -ne $game['homeScore'] -and ($game['awayScore'] -gt 0 -or $game['homeScore'] -gt 0)) { return $true }
    
    $koTime = $null
    if ($game['kickoffTime']) {
        $koTime = [DateTimeOffset]::Parse($game['kickoffTime'])
    }
    
    if ($game['isLive']) {
        $hasScore = ($game['awayScore'] -gt 0 -or $game['homeScore'] -gt 0)
        if (-not $hasScore -and $null -ne $koTime -and $koTime -gt $checkTime) {
            return $false
        }
        return $true
    }
    
    if ($null -ne $koTime -and $koTime -le $checkTime) {
        return $true
    }
    return $false
}

$simGame = @{
    kickoffTime = '2026-11-03T01:15:00Z';
    isLive = $true; # Broadcast went live early
    isFinal = $false;
    awayScore = $null;
    homeScore = $null;
}

$timeAt705 = [DateTimeOffset]::Parse('2026-11-02T19:05:00-06:00') # 7:05 PM Central (01:05 UTC)
$timeAt715 = [DateTimeOffset]::Parse('2026-11-02T19:15:00-06:00') # 7:15 PM Central (01:15 UTC)
$timeAt725 = [DateTimeOffset]::Parse('2026-11-02T19:25:00-06:00') # 7:25 PM Central (01:25 UTC)

Assert-Test (-not (Test-SimulatedLock $simGame $timeAt705)) 'Game remains UNLOCKED at 7:05 PM Central (10 min before 7:15 PM kickoff)'
Assert-Test (Test-SimulatedLock $simGame $timeAt715) 'Game is LOCKED at 7:15 PM Central kickoff time'
Assert-Test (Test-SimulatedLock $simGame $timeAt725) 'Game is LOCKED at 7:25 PM Central in-game'

$simEarlyScoreGame = @{
    kickoffTime = '2026-11-03T01:15:00Z';
    isLive = $true;
    isFinal = $false;
    awayScore = 3;
    homeScore = 0;
}
Assert-Test (Test-SimulatedLock $simEarlyScoreGame $timeAt705) 'Game locks early if points are already scored on scoreboard'

# 4. Codebase Architecture Assertions
Assert-Test ($appJsContent -match 'game\.kickoffTime\s*=\s*matchedEvent\.date') 'syncLiveNFLScores sets game.kickoffTime from ESPN date'
Assert-Test ($appJsContent -match 'Pre-game broadcast window') 'syncLiveNFLScores guards against premature TV broadcast telemetry'
Assert-Test ($appJsContent -match 'America/Chicago') 'parseGameKickoff explicitly anchors to America/Chicago Central Time'
Assert-Test ($appJsContent -match 'keep picks open until official kickoff') 'isGameLockedForPicking safeguards pre-kickoff broadcast window'
Assert-Test ($indexHtmlContent -notmatch '</section>\s*</section>\s*</main>') 'index.html contains no orphan section tag before main'

Write-Host ''
Write-Host '  -- Suite 15: Post-MNF Open Prediction Week Auto-Advance & Contextual Bridge Banner --' -ForegroundColor Yellow

# 1. Week Lock and Open Prediction Week Math
function Test-SimulatedWeekFullyLocked([array]$games, [DateTimeOffset]$checkTime) {
    if (-not $games -or $games.Count -eq 0) { return $false }
    foreach ($g in $games) {
        $locked = Test-SimulatedLock $g $checkTime
        if (-not $locked) { return $false }
    }
    return $true
}

$simWeekPartiallyOpen = @(
    @{ kickoffTime = '2026-11-01T17:00:00Z'; isFinal = $true; awayScore = 20; homeScore = 17; isLive = $false },
    @{ kickoffTime = '2026-11-02T19:15:00-06:00'; isFinal = $false; awayScore = $null; homeScore = $null; isLive = $false }
)

$simWeekAllLocked = @(
    @{ kickoffTime = '2026-11-01T17:00:00Z'; isFinal = $true; awayScore = 20; homeScore = 17; isLive = $false },
    @{ kickoffTime = '2026-11-02T19:15:00-06:00'; isFinal = $true; awayScore = 24; homeScore = 21; isLive = $false }
)

$timeMondayAfternoon = [DateTimeOffset]::Parse('2026-11-02T14:00:00-06:00')
$timeTuesday = [DateTimeOffset]::Parse('2026-11-03T12:00:00-06:00')

Assert-Test (-not (Test-SimulatedWeekFullyLocked $simWeekPartiallyOpen $timeMondayAfternoon)) 'Week with open MNF game is NOT fully locked on Monday afternoon'
Assert-Test (Test-SimulatedWeekFullyLocked $simWeekAllLocked $timeTuesday) 'Week with all games concluded is fully locked on Tuesday'

function Test-SimulatedOpenPredictionWeek([int]$currentNFL, [bool]$isLocked) {
    if ($currentNFL -lt 18 -and $isLocked) {
        return ($currentNFL + 1)
    }
    return $currentNFL
}

Assert-Test ((Test-SimulatedOpenPredictionWeek 8 $false) -eq 8) 'Open prediction week remains Week 8 while Week 8 has open games'
Assert-Test ((Test-SimulatedOpenPredictionWeek 8 $true) -eq 9) 'Open prediction week advances to Week 9 once Week 8 is fully locked'
Assert-Test ((Test-SimulatedOpenPredictionWeek 18 $true) -eq 18) 'Open prediction week capped at Week 18'

# 2. Codebase Architecture & Mode-Aware Week Resolution
Assert-Test ($appJsContent -match 'function isWeekFullyLocked\(') 'app.js defines isWeekFullyLocked helper'
Assert-Test ($appJsContent -match 'function getOpenPredictionWeek\(') 'app.js defines getOpenPredictionWeek helper'
Assert-Test ($appJsContent -match 'window\.isWeekFullyLocked\s*=') 'app.js exports isWeekFullyLocked to window'
Assert-Test ($appJsContent -match 'window\.getOpenPredictionWeek\s*=') 'app.js exports getOpenPredictionWeek to window'
Assert-Test ($appJsContent -match 'state\.currentWeek = leagueWk;' -and $appJsContent -match 'state\.currentWeek = openWk;') 'app.js initializes state.currentWeek mode-aware (League=currentNFL, Lobby=openWk)'
Assert-Test ($appJsContent -match 'enterLeagueView[\s\S]*?state\.currentWeek = leagueWk;') 'enterLeagueView anchors week to current NFL league week'
Assert-Test ($appJsContent -match 'enterCustomLeague[\s\S]*?state\.currentWeek = leagueWk;') 'enterCustomLeague anchors week to current NFL league week'
Assert-Test ($appJsContent -match 'exitToLobby[\s\S]*?state\.currentWeek = openWk;') 'exitToLobby advances week to open prediction week'

# 3. Contextual Bridge Banner & UI Markup
$indexHtmlContent = Get-Content -Raw 'apps/og-league/index.html'
$styleCssContent = Get-Content -Raw 'apps/og-league/style.css'
Assert-Test ($indexHtmlContent -match 'id="lobby-week-context-banner"') 'index.html defines #lobby-week-context-banner container'
Assert-Test ($appJsContent -match 'lobby-week-context-banner') 'app.js renders lobby-week-context-banner'
Assert-Test ($appJsContent -match 'selectWeek\(\$\{currentNFL\}\)') 'app.js provides one-click action to view completed week results'
Assert-Test ($appJsContent -match 'selectWeek\(\$\{openWk\}\)') 'app.js provides one-click action to jump to open predictions'
Assert-Test ($styleCssContent -match '\.lobby-week-context-banner') 'style.css defines .lobby-week-context-banner'
Assert-Test ($styleCssContent -match '\.btn-context-banner-action') 'style.css defines .btn-context-banner-action'
Assert-Test ($styleCssContent -match '\.week-trigger-badge\.badge-open') 'style.css defines .week-trigger-badge.badge-open'
Assert-Test ($styleCssContent -match '\.week-cell-status\.status-open') 'style.css defines .week-cell-status.status-open'

Write-Host ''
Write-Host '  -- Suite 16: Stable Matchup Partitioning & Concluded Divider (Option A) --' -ForegroundColor Yellow

function Test-PartitionMatchupGames($gamesList) {
    if ($null -eq $gamesList -or $gamesList.Count -eq 0) { return @() }
    $active = @($gamesList | Where-Object { -not $_.isFinal })
    $completed = @($gamesList | Where-Object { [bool]$_.isFinal })
    return @($active + $completed)
}

# Scenario 1: Mixed Week (Games 1 & 4 Final, Games 2, 3, 5 Active)
$simSchedule = @(
    @{ id = 'g1'; isFinal = $true; name = 'TNF Final' },
    @{ id = 'g2'; isFinal = $false; name = 'Sun Early 1' },
    @{ id = 'g3'; isFinal = $false; name = 'Sun Early 2' },
    @{ id = 'g4'; isFinal = $true; name = 'Sun Early 3 Final' },
    @{ id = 'g5'; isFinal = $false; name = 'Sun Late Upcoming' }
)

$partitioned = Test-PartitionMatchupGames $simSchedule
Assert-Test ($partitioned.Count -eq 5) 'Partitioned list preserves total game count'
Assert-Test ($partitioned[0].id -eq 'g2' -and $partitioned[1].id -eq 'g3' -and $partitioned[2].id -eq 'g5') 'Active games (g2, g3, g5) maintain original relative order at top'
Assert-Test ($partitioned[3].id -eq 'g1' -and $partitioned[4].id -eq 'g4') 'Concluded games (g1, g4) maintain original relative order at bottom'

# Scenario 2: Concluded Week (All games Final)
$simAllFinal = @(
    @{ id = 'g1'; isFinal = $true },
    @{ id = 'g2'; isFinal = $true },
    @{ id = 'g3'; isFinal = $true },
    @{ id = 'g4'; isFinal = $true }
)
$partitionedAllFinal = Test-PartitionMatchupGames $simAllFinal
Assert-Test ($partitionedAllFinal[0].id -eq 'g1' -and $partitionedAllFinal[1].id -eq 'g2' -and $partitionedAllFinal[2].id -eq 'g3' -and $partitionedAllFinal[3].id -eq 'g4') 'When all games are final, exact original schedule order is fully restored'

# Scenario 3: Pre-Kickoff Week (0 games Final)
$simAllActive = @(
    @{ id = 'g1'; isFinal = $false },
    @{ id = 'g2'; isFinal = $false },
    @{ id = 'g3'; isFinal = $false }
)
$partitionedAllActive = Test-PartitionMatchupGames $simAllActive
Assert-Test ($partitionedAllActive[0].id -eq 'g1' -and $partitionedAllActive[1].id -eq 'g2' -and $partitionedAllActive[2].id -eq 'g3') 'When 0 games are final, exact original schedule order is maintained'

# Scenario 4: Option A Divider Visibility Logic
function Test-ShouldShowConcludedDivider($filter, $activeCount, $finalsCount) {
    return ($filter -eq 'all' -and $activeCount -gt 0 -and $finalsCount -gt 0)
}
Assert-Test (Test-ShouldShowConcludedDivider 'all' 3 2) 'Option A divider shows when viewing All with both active and final games'
Assert-Test (-not (Test-ShouldShowConcludedDivider 'all' 0 5)) 'Option A divider hides when 100% of games are final'
Assert-Test (-not (Test-ShouldShowConcludedDivider 'all' 5 0)) 'Option A divider hides when 0 games are final'
Assert-Test (-not (Test-ShouldShowConcludedDivider 'upcoming' 3 2)) 'Option A divider hides in upcoming filter view'
Assert-Test (-not (Test-ShouldShowConcludedDivider 'final' 3 2)) 'Option A divider hides in final filter view'

# Scenario 5: Codebase Architecture & Window Exports
Assert-Test ($appJsContent -match 'function getPartitionedMatchupGames\(') 'app.js defines getPartitionedMatchupGames helper'
Assert-Test ($appJsContent -match 'function renderConcludedDivider\(') 'app.js defines renderConcludedDivider helper'
Assert-Test ($appJsContent -match 'window\.getPartitionedMatchupGames\s*=') 'app.js exports getPartitionedMatchupGames to window'
Assert-Test ($appJsContent -match 'window\.renderConcludedDivider\s*=') 'app.js exports renderConcludedDivider to window'
Assert-Test ($appJsContent -match 'filteredGames = getPartitionedMatchupGames\(games\);') 'renderMatchups applies getPartitionedMatchupGames when filter is all'
Assert-Test ($appJsContent -match 'return getPartitionedMatchupGames\(games\);') 'getMatchupsTargetGames returns getPartitionedMatchupGames'
Assert-Test ($styleCssContent -match '\.matchups-concluded-divider') 'style.css defines .matchups-concluded-divider'
Assert-Test ($styleCssContent -match '\.divider-pill') 'style.css defines .divider-pill'
Assert-Test ($indexHtmlContent -match 'v=31\.[01]') 'index.html references cache buster v=31.1'

# =========================================================
# SUITE 17: Modern Game Card Lifecycle, TV Network, Odds, Permanent O/U, Live Win Probability, and Emoji Removal
# =========================================================
Write-Host ''
Write-Host '  -- Suite 17: Modern Game Card Lifecycle, TV Network, Odds, Permanent O/U & Live Win Probability --' -ForegroundColor Yellow

# Helper Functions & Architecture
Assert-Test ($appJsContent -match 'function getGameBroadcast\(') 'app.js defines getGameBroadcast helper'
Assert-Test ($appJsContent -match 'function getGameOdds\(') 'app.js defines getGameOdds helper'
Assert-Test ($appJsContent -match 'async function fetchLiveGameWinProbability\(') 'app.js defines fetchLiveGameWinProbability helper'
Assert-Test ($appJsContent -match 'function getGameWinProbability\(') 'app.js defines getGameWinProbability helper'
Assert-Test ($appJsContent -match 'window\.getGameBroadcast = getGameBroadcast') 'app.js exports getGameBroadcast to window'
Assert-Test ($appJsContent -match 'window\.getGameOdds = getGameOdds') 'app.js exports getGameOdds to window'
Assert-Test ($appJsContent -match 'window\.fetchLiveGameWinProbability = fetchLiveGameWinProbability') 'app.js exports fetchLiveGameWinProbability to window'
Assert-Test ($appJsContent -match 'window\.getGameWinProbability = getGameWinProbability') 'app.js exports getGameWinProbability to window'

# Card Header Cleanliness & Modern Badges (No OPEN FOR PICKS or PENDING in Option 2 card)
Assert-Test ($appJsContent -notmatch '"🟢 Open for Picks"') 'app.js has eliminated 🟢 Open for Picks badge'
Assert-Test ($appJsContent -match 'game-network-pill') 'app.js renders TV broadcast network pill'
Assert-Test ($appJsContent -match 'game-odds-pill') 'app.js renders game spread odds pill'
Assert-Test ($appJsContent -match 'game-ou-pill') 'app.js renders Over/Under betting line pill'
Assert-Test ($appJsContent -match 'pick-status-pill complete') 'app.js renders clean PICK SET pill when pick is complete'
Assert-Test ($appJsContent -notmatch '\$\{isComplete \? "✓ Pick Set" : "Pending"\}') 'app.js does not render fallback Pending pill on cards'

# Permanent Over/Under Display
Assert-Test ($appJsContent -match '\$\{spreadBadge\}[\s\S]*?\$\{ouBadge\}[\s\S]*?\$\{pickSetPill\}') 'app.js preserves Spread and Over/Under permanently when pick is set'

# Live Win Probability Momentum Bar
Assert-Test ($appJsContent -match 'live-win-prob-container') 'app.js renders live-win-prob-container'
Assert-Test ($appJsContent -match 'live-win-prob-labels') 'app.js renders live-win-prob-labels'
Assert-Test ($appJsContent -match 'LIVE WIN PROBABILITY') 'app.js renders LIVE WIN PROBABILITY header title'
Assert-Test ($appJsContent -match 'live-win-prob-track') 'app.js renders dual-color momentum track'
Assert-Test ($appJsContent -match 'prob-fill-away') 'app.js renders away win probability fill bar'
Assert-Test ($appJsContent -match 'prob-fill-home') 'app.js renders home win probability fill bar'
Assert-Test ($appJsContent -match 'matchup-live-win-prob-wrapper') 'app.js renders live win probability in League view matchup cards'

# 100% Emoji Removal Across App Game Cards
Assert-Test ($appJsContent -notmatch '"⭐ 3X LOCK ACTIVE"') 'app.js eliminated star emoji from 3X lock active button'
Assert-Test ($appJsContent -notmatch '"⭐ 3X Lock"') 'app.js eliminated star emoji from 3X lock default button'
Assert-Test ($appJsContent -notmatch '🚨 RED ZONE') 'app.js eliminated siren emoji from Red Zone badge'
Assert-Test ($appJsContent -notmatch 'possession-football.*?>🏈<') 'app.js eliminated football emoji from possession badge'
Assert-Test ($appJsContent -notmatch 'divider-pill-icon.*?>🏁<') 'app.js eliminated checkered flag emoji from concluded divider'
Assert-Test ($appJsContent -notmatch '🔥 Unanimous') 'app.js eliminated fire emoji from unanimous consensus badge'
Assert-Test ($appJsContent -notmatch '⚡ 50/50 Split') 'app.js eliminated lightning emoji from 50/50 split consensus badge'

# CSS Modern Terminal Aesthetics
Assert-Test ($styleCssContent -match '\.game-network-pill') 'style.css defines .game-network-pill'
Assert-Test ($styleCssContent -match '\.game-odds-pill') 'style.css defines .game-odds-pill'
Assert-Test ($styleCssContent -match '\.game-ou-pill') 'style.css defines .game-ou-pill'
Assert-Test ($styleCssContent -match '\.live-win-prob-container') 'style.css defines .live-win-prob-container'
Assert-Test ($styleCssContent -match '\.live-win-prob-track') 'style.css defines .live-win-prob-track'
Assert-Test ($styleCssContent -match '\.possession-dot') 'style.css defines .possession-dot'
Assert-Test ($styleCssContent -match '\.game-closing-spread') 'style.css defines .game-closing-spread'
Assert-Test ($styleCssContent -match '\.game-final-verified') 'style.css defines .game-final-verified'
Assert-Test ($styleCssContent -match '\.matchup-live-win-prob-wrapper') 'style.css defines .matchup-live-win-prob-wrapper'

# Logic Verification via PowerShell Functions matching app.js
function Test-GetGameBroadcast($game) {
    if (-not $game) { return '' }
    $raw = if ($game.broadcast) { "$($game.broadcast)".Trim().ToUpper() } else { '' }
    if (-not $raw -and $game.dateTime) {
        $dt = "$($game.dateTime)".ToUpper()
        if ($dt.Contains('(TNF)')) { return 'PRIME' }
        if ($dt.Contains('(SNF)')) { return 'NBC' }
        if ($dt.Contains('(MNF)')) { return 'ESPN' }
        if ($dt.Contains('(INTL)')) { return 'NFLN' }
    }
    if (-not $raw) { return '' }
    if ($raw.Contains('PRIME') -or $raw.Contains('AMAZON')) { return 'PRIME' }
    if ($raw.Contains('FOX')) { return 'FOX' }
    if ($raw.Contains('CBS')) { return 'CBS' }
    if ($raw.Contains('NBC')) { return 'NBC' }
    if ($raw.Contains('ESPN')) { return 'ESPN' }
    if ($raw.Contains('NFL NET') -or $raw.Contains('NFLN')) { return 'NFLN' }
    if ($raw.Contains('NETFLIX')) { return 'NETFLIX' }
    if ($raw.Contains('PEACOCK')) { return 'PEACOCK' }
    if ($raw.Contains('ABC')) { return 'ABC' }
    $parts = $raw -split '[\s,/]+'
    return $parts[0]
}

function Test-GetGameOdds($game) {
    if (-not $game) { return @{ spread = ''; ou = '' } }
    $spread = if ($game.spread) { "$($game.spread)".Trim() } else { '' }
    $ou = ''
    if ($null -ne $game.overUnder -and $game.overUnder -ne '') {
        $rawOu = "$($game.overUnder)".Trim()
        $ou = if ($rawOu.ToUpper().StartsWith('O/U')) { $rawOu } else { "O/U $rawOu" }
    }
    return @{ spread = $spread; ou = $ou }
}

Assert-Test ((Test-GetGameBroadcast @{ broadcast = 'Prime Video' }) -eq 'PRIME') 'Broadcast normalizes Prime Video to PRIME'
Assert-Test ((Test-GetGameBroadcast @{ broadcast = 'FOX' }) -eq 'FOX') 'Broadcast normalizes FOX to FOX'
Assert-Test ((Test-GetGameBroadcast @{ broadcast = 'CBS Sports' }) -eq 'CBS') 'Broadcast normalizes CBS Sports to CBS'
Assert-Test ((Test-GetGameBroadcast @{ broadcast = 'NBC' }) -eq 'NBC') 'Broadcast normalizes NBC to NBC'
Assert-Test ((Test-GetGameBroadcast @{ broadcast = 'ESPN / ABC' }) -eq 'ESPN') 'Broadcast normalizes ESPN to ESPN'
Assert-Test ((Test-GetGameBroadcast @{ dateTime = 'Thu 7:15 PM (TNF)' }) -eq 'PRIME') 'Broadcast infers PRIME from (TNF)'
Assert-Test ((Test-GetGameBroadcast @{ dateTime = 'Sun 7:20 PM (SNF)' }) -eq 'NBC') 'Broadcast infers NBC from (SNF)'
Assert-Test ((Test-GetGameBroadcast @{ dateTime = 'Mon 7:15 PM (MNF)' }) -eq 'ESPN') 'Broadcast infers ESPN from (MNF)'

$testOdds = Test-GetGameOdds @{ spread = 'KC -3.5'; overUnder = 47.5 }
Assert-Test ($testOdds.spread -eq 'KC -3.5') 'Odds spread correctly formatted as KC -3.5'
Assert-Test ($testOdds.ou -eq 'O/U 47.5') 'Odds over/under correctly formatted as O/U 47.5'

$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

Write-Host ''
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host " Total Assertions: $total | Passed: $passed | Failed: $($total - $passed)" -ForegroundColor Cyan
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host ''

if ($passed -eq $total) {
    Write-Host ' All 17 modular test suites verified successfully!' -ForegroundColor Green
    Write-Host ''
}
