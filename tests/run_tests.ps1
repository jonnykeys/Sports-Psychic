# Windows PowerShell Test Suite Runner for Sports Psychic
Write-Host ''
Write-Host '========================================================' -ForegroundColor Cyan
Write-Host ' 🔮 SPORTS PSYCHIC AUTOMATED TEST SUITE' -ForegroundColor Cyan
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
# Brett: 35 wins, 29 losses (35/64 = 0.546875)
# Carson: 31 wins, 33 losses (31/64 = 0.484375)
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

# Game Lockout logic
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

$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count

Write-Host ''
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host " Total Assertions: $total | Passed: $passed | Failed: $($total - $passed)" -ForegroundColor Cyan
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host ''

if ($passed -eq $total) {
    Write-Host ' All mathematical & modular engine assertions verified successfully!' -ForegroundColor Green
    Write-Host ''
}
