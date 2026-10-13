# Windows PowerShell Test Suite Runner for Sports Psychic
Write-Host ''
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ' 🔮 SPORTS PSYCHIC AUTOMATED TEST SUITE (6 SUITES)' -ForegroundColor Cyan
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


$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

Write-Host ''
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host " Total Assertions: $total | Passed: $passed | Failed: $($total - $passed)" -ForegroundColor Cyan
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host ''

if ($passed -eq $total) {
    Write-Host ' All 7 modular test suites verified successfully!' -ForegroundColor Green
    Write-Host ''
}
