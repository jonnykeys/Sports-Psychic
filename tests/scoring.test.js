/**
 * Automated Unit Tests for Sports Psychic Scoring & Ranking Engine
 * Tests winner evaluation, error deltas, closest/exact bonuses,
 * 3X multipliers, exact-ratio tie-breaking, and cache reconciliation.
 */

const {
  normalizeTeamCode,
  calculateGamePicksPoints,
  getPlayerSeasonRecord,
  getPlayerWeekRecord,
  computeSeasonLeaderboard,
  computeWeeklyLeaderboard,
  getIncompletePastWeeks
} = require("../src/engine/scoring.js");

function runAllTests(assert) {
  // -----------------------------------------------------------
  // 1. Team Alias Normalization
  // -----------------------------------------------------------
  assert.equal(normalizeTeamCode("WSH"), "WAS", "WSH normalizes to WAS");
  assert.equal(normalizeTeamCode("JAX"), "JAC", "JAX normalizes to JAC");
  assert.equal(normalizeTeamCode("KC"), "KC", "KC remains canonical");

  // -----------------------------------------------------------
  // 2. Base Winner Points (10 pts) and Loss (0 pts)
  // -----------------------------------------------------------
  const testGame1 = {
    id: "g1",
    matchup: "KC @ BUF",
    awayScore: 24,
    homeScore: 31,
    winner: "BUF",
    isFinal: true,
    picks: {
      Alice: { winner: "BUF", awayScore: 20, homeScore: 30, multiplier: false },
      Bob: { winner: "KC", awayScore: 28, homeScore: 21, multiplier: false }
    }
  };
  calculateGamePicksPoints(testGame1, ["Alice", "Bob"]);
  assert.equal(testGame1.picks.Alice.basePoints, 10, "Alice gets 10 base points for picking winner");
  assert.equal(testGame1.picks.Bob.basePoints, 0, "Bob gets 0 base points for picking loser");

  // -----------------------------------------------------------
  // 3. Closest Final Score Prediction (+10 pts)
  // -----------------------------------------------------------
  const testGame2 = {
    id: "g2",
    matchup: "BAL @ CIN",
    awayScore: 28,
    homeScore: 20,
    winner: "BAL",
    isFinal: true,
    picks: {
      Alice: { winner: "BAL", awayScore: 27, homeScore: 20, multiplier: false }, // diff: |27-28| + |20-20| = 1
      Bob: { winner: "BAL", awayScore: 24, homeScore: 17, multiplier: false }    // diff: |24-28| + |17-20| = 7
    }
  };
  calculateGamePicksPoints(testGame2, ["Alice", "Bob"]);
  assert.equal(testGame2.picks.Alice.isClosest, true, "Alice is closest predictor");
  assert.equal(testGame2.picks.Alice.bonusPoints, 10, "Alice receives +10 closest bonus");
  assert.equal(testGame2.picks.Alice.points, 20, "Alice total points = 10 base + 10 closest");
  assert.equal(testGame2.picks.Bob.bonusPoints, 0, "Bob gets 0 bonus points");

  // -----------------------------------------------------------
  // 4. Split Pool for Tied Closest Predictors (+5 pts each)
  // -----------------------------------------------------------
  const testGame3 = {
    id: "g3",
    matchup: "SF @ LAR",
    awayScore: 21,
    homeScore: 14,
    winner: "SF",
    isFinal: true,
    picks: {
      Alice: { winner: "SF", awayScore: 20, homeScore: 14, multiplier: false }, // diff = 1
      Charlie: { winner: "SF", awayScore: 21, homeScore: 15, multiplier: false } // diff = 1
    }
  };
  calculateGamePicksPoints(testGame3, ["Alice", "Charlie"]);
  assert.equal(testGame3.picks.Alice.isClosest, true, "Alice marked closest");
  assert.equal(testGame3.picks.Charlie.isClosest, true, "Charlie marked closest");
  assert.equal(testGame3.picks.Alice.bonusPoints, 5, "Alice splits pool with 5 bonus points");
  assert.equal(testGame3.picks.Charlie.bonusPoints, 5, "Charlie splits pool with 5 bonus points");

  // -----------------------------------------------------------
  // 5. Exact Score Prediction Jackpot (+50 pts)
  // -----------------------------------------------------------
  const testGame4 = {
    id: "g4",
    matchup: "PHI @ NYG",
    awayScore: 27,
    homeScore: 24,
    winner: "PHI",
    isFinal: true,
    picks: {
      Alice: { winner: "PHI", awayScore: 27, homeScore: 24, multiplier: false }, // EXACT
      Bob: { winner: "PHI", awayScore: 24, homeScore: 20, multiplier: false }
    }
  };
  calculateGamePicksPoints(testGame4, ["Alice", "Bob"]);
  assert.equal(testGame4.picks.Alice.exact, true, "Alice hit exact score");
  assert.equal(testGame4.picks.Alice.bonusPoints, 50, "Alice awarded +50 exact jackpot");
  assert.equal(testGame4.picks.Alice.points, 60, "Alice total = 10 base + 50 exact jackpot = 60");

  // -----------------------------------------------------------
  // 6. Split Pool for Tied Exact Score Predictors (+25 pts each)
  // -----------------------------------------------------------
  const testGame5 = {
    id: "g5",
    matchup: "MIA @ NE",
    awayScore: 20,
    homeScore: 17,
    winner: "MIA",
    isFinal: true,
    picks: {
      Alice: { winner: "MIA", awayScore: 20, homeScore: 17, multiplier: false },
      Bob: { winner: "MIA", awayScore: 20, homeScore: 17, multiplier: false }
    }
  };
  calculateGamePicksPoints(testGame5, ["Alice", "Bob"]);
  assert.equal(testGame5.picks.Alice.bonusPoints, 25, "Alice splits exact jackpot: +25 pts");
  assert.equal(testGame5.picks.Bob.bonusPoints, 25, "Bob splits exact jackpot: +25 pts");

  // -----------------------------------------------------------
  // 7. 3X Lock of the Week Compounding
  // -----------------------------------------------------------
  const testGame6 = {
    id: "g6",
    matchup: "GB @ CHI",
    awayScore: 31,
    homeScore: 24,
    winner: "GB",
    isFinal: true,
    picks: {
      Caleb: { winner: "GB", awayScore: 31, homeScore: 24, multiplier: true } // 3X Lock + Exact Hit
    }
  };
  calculateGamePicksPoints(testGame6, ["Caleb"]);
  assert.equal(testGame6.picks.Caleb.basePoints, 30, "3X triples base points: 10 * 3 = 30");
  assert.equal(testGame6.picks.Caleb.bonusPoints, 150, "3X triples exact jackpot: 50 * 3 = 150");
  assert.equal(testGame6.picks.Caleb.points, 180, "Total = 30 + 150 = 180 pts");

  // -----------------------------------------------------------
  // 8. Unfinalized Game Awards Zero Points
  // -----------------------------------------------------------
  const testGame7 = {
    id: "g7",
    matchup: "DAL @ HOU",
    awayScore: 14,
    homeScore: 10,
    winner: "DAL",
    isLive: true,
    isFinal: false,
    picks: {
      Alice: { winner: "DAL", awayScore: 14, homeScore: 10, multiplier: true }
    }
  };
  calculateGamePicksPoints(testGame7, ["Alice"]);
  assert.equal(testGame7.picks.Alice.points, 0, "In-progress game awards 0 points until final");

  // -----------------------------------------------------------
  // 9. Exact Mathematical Win-Loss Percentage Tie-Breaker
  // -----------------------------------------------------------
  // Brett: 35-29 (54.7%), Carson: 31-33 (48.4%) — both at 400 pts
  const mockWeeks = {
    "Week 1": {
      games: [
        {
          id: "g1",
          matchup: "KC @ BUF",
          winner: "BUF",
          awayScore: 20,
          homeScore: 24,
          isFinal: true,
          picks: {
            Brett: { winner: "BUF", points: 400 },
            Carson: { winner: "BUF", points: 400 }
          }
        }
      ]
    }
  };

  // Construct mock season where Brett has 54.7% W-L and Carson has 48.4%
  const mockWeeksWithRecords = {
    "Week 1": {
      games: []
    }
  };
  // Brett: 35 wins, 29 losses
  for (let i = 1; i <= 35; i++) {
    mockWeeksWithRecords["Week 1"].games.push({
      id: `w_b_${i}`, matchup: "KC @ BUF", winner: "BUF", awayScore: 20, homeScore: 24, isFinal: true,
      picks: { Brett: { winner: "BUF", points: (i === 1 ? 400 : 0) } }
    });
  }
  for (let i = 1; i <= 29; i++) {
    mockWeeksWithRecords["Week 1"].games.push({
      id: `l_b_${i}`, matchup: "KC @ BUF", winner: "BUF", awayScore: 20, homeScore: 24, isFinal: true,
      picks: { Brett: { winner: "KC", points: 0 } }
    });
  }
  // Carson: 31 wins, 33 losses
  for (let i = 1; i <= 31; i++) {
    mockWeeksWithRecords["Week 1"].games.push({
      id: `w_c_${i}`, matchup: "KC @ BUF", winner: "BUF", awayScore: 20, homeScore: 24, isFinal: true,
      picks: { Carson: { winner: "BUF", points: (i === 1 ? 400 : 0) } }
    });
  }
  for (let i = 1; i <= 33; i++) {
    mockWeeksWithRecords["Week 1"].games.push({
      id: `l_c_${i}`, matchup: "KC @ BUF", winner: "BUF", awayScore: 20, homeScore: 24, isFinal: true,
      picks: { Carson: { winner: "KC", points: 0 } }
    });
  }

  const lb = computeSeasonLeaderboard(mockWeeksWithRecords, ["Carson", "Brett"]);
  assert.equal(lb[0].name, "Brett", "Brett wins tie-breaker with higher Win-Loss % (54.7% vs 48.4%)");
  assert.equal(lb[0].numericRank, 1, "Brett is Rank 1");
  assert.equal(lb[0].rankDisplay, "1", "Brett rankDisplay is clean '1' without T-");
  assert.equal(lb[1].name, "Carson", "Carson is Rank 2");
  assert.equal(lb[1].numericRank, 2, "Carson is Rank 2");
  assert.equal(lb[1].rankDisplay, "2", "Carson rankDisplay is clean '2'");

  // -----------------------------------------------------------
  // 10. True Tie (Identical Points AND Identical Win-Loss %)
  // -----------------------------------------------------------
  const mockTrueTieWeeks = {
    "Week 1": {
      games: [
        {
          id: "tt1", matchup: "KC @ BUF", winner: "BUF", awayScore: 20, homeScore: 24, isFinal: true,
          picks: {
            PlayerA: { winner: "BUF", points: 100 },
            PlayerB: { winner: "BUF", points: 100 }
          }
        }
      ]
    }
  };
  const tiedLb = computeSeasonLeaderboard(mockTrueTieWeeks, ["PlayerA", "PlayerB"]);
  assert.equal(tiedLb[0].numericRank, 1, "PlayerA numericRank is 1");
  assert.equal(tiedLb[1].numericRank, 1, "PlayerB numericRank is 1");
  assert.equal(tiedLb[0].rankDisplay, "T-1", "PlayerA rankDisplay is 'T-1'");
  assert.equal(tiedLb[1].rankDisplay, "T-1", "PlayerB rankDisplay is 'T-1'");

  // -----------------------------------------------------------
  // 11. Self-Healing Reconciliation Audit (getIncompletePastWeeks)
  // -----------------------------------------------------------
  const mockSyncAudit = {
    "Week 1": { games: [{ isFinal: true, awayScore: 20, homeScore: 24, matchup: "A @ B" }] },
    "Week 2": { games: [{ isFinal: true, awayScore: 17, homeScore: 21, matchup: "C @ D" }] },
    "Week 3": { games: [{ isFinal: false, awayScore: null, homeScore: null, matchup: "E @ F" }] }, // Incomplete!
    "Week 4": { games: [{ isFinal: true, awayScore: 10, homeScore: 14, matchup: "G @ H" }] }
  };
  const incompleteWeeks = getIncompletePastWeeks(mockSyncAudit, 5);
  assert.equal(incompleteWeeks.includes(3), true, "Identifies Week 3 as having unfinalized games");
  assert.equal(incompleteWeeks.includes(4), true, "Includes immediately preceding Week 4 for late verification");
  assert.equal(incompleteWeeks.includes(1), false, "Week 1 is complete and not flagged");
  assert.equal(incompleteWeeks.includes(2), false, "Week 2 is complete and not flagged");

  return true;
}

module.exports = { runAllTests };
