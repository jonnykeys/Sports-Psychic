/**
 * Sports Psychic — Core Scoring & Ranking Engine
 *
 * Pure mathematical business logic for evaluating NFL game predictions,
 * error differentials, closest/exact score bonuses, confidence multipliers,
 * and exact-ratio Win-Loss tie-breaking.
 *
 * @module engine/scoring
 */

const TEAM_ALIASES = {
  WSH: "WAS",
  JAX: "JAC"
};

/**
 * Returns canonical 2-3 letter team abbreviation matching standard NFL conventions.
 * @param {string} code
 * @returns {string}
 */
function normalizeTeamCode(code) {
  if (!code) return "";
  const cleaned = String(code).trim().toUpperCase();
  return TEAM_ALIASES[cleaned] || cleaned;
}

/**
 * Evaluates all player picks for a given game and calculates points,
 * error differentials, closest score bonuses, and exact score jackpots.
 *
 * Scoring Rules:
 *  - Correct Winner: 10 base points (multiplied by 3 if 3X Lock is active: 30 pts)
 *  - Closest Final Score Prediction:
 *      * Single Winner: +10 bonus points (+30 pts if 3X)
 *      * Tied Closest: +5 bonus points each (+15 pts if 3X)
 *  - Exact Final Score Prediction:
 *      * Single Exact: +50 jackpot bonus (+150 pts if 3X)
 *      * Tied Exact: +25 jackpot bonus each (+75 pts if 3X)
 *
 * @param {Object} game - Game matchup and score state
 * @param {Array<string>} [playerList] - Optional array of player names to evaluate
 * @returns {Object} The evaluated game object
 */
function calculateGamePicksPoints(game, playerList = null) {
  if (!game || !game.picks || !game.matchup || !game.matchup.includes("@")) {
    return game;
  }

  const parts = game.matchup.split("@").map(s => s.trim().toUpperCase());
  if (parts.length !== 2) return game;
  const awayTeam = parts[0];
  const homeTeam = parts[1];

  const awayScore = (game.awayScore !== null && game.awayScore !== "" && !isNaN(game.awayScore))
    ? Number(game.awayScore)
    : null;
  const homeScore = (game.homeScore !== null && game.homeScore !== "" && !isNaN(game.homeScore))
    ? Number(game.homeScore)
    : null;
  let winner = (game.winner || "").toUpperCase().trim();

  // If winner is missing but scores exist, determine winner from matchup
  if (!winner && awayScore !== null && homeScore !== null) {
    if (awayScore > homeScore) winner = awayTeam;
    else if (homeScore > awayScore) winner = homeTeam;
    else if (awayScore === homeScore) winner = "TIE";
    game.winner = winner;
  }

  const normWinner = normalizeTeamCode(winner);
  const isValidWinner = (
    winner === awayTeam || winner === homeTeam || winner === "TIE" ||
    normalizeTeamCode(awayTeam) === normWinner ||
    normalizeTeamCode(homeTeam) === normWinner
  );

  // Determine final status
  let isFinal = false;
  if (game.isLive) {
    isFinal = false;
  } else if (game.isFinal) {
    isFinal = true;
  } else if (awayScore !== null && homeScore !== null && isValidWinner) {
    isFinal = true;
    game.isFinal = true;
  }

  const players = playerList || Object.keys(game.picks);

  // Reset pick defaults for this game
  players.forEach(pName => {
    const pk = game.picks[pName];
    if (!pk) return;
    pk.points = 0;
    pk.basePoints = 0;
    pk.bonusPoints = 0;
    pk.isClosest = false;
    pk.exact = false;
    pk.diff = null;
  });

  if (!isFinal || !winner || awayScore === null || homeScore === null) {
    return game;
  }

  // 1. Identify all players who picked the winning team and compute score error diff
  const winningPickers = [];
  players.forEach(pName => {
    const pk = game.picks[pName];
    if (!pk || !pk.winner) return;

    const pkWinnerNorm = normalizeTeamCode(pk.winner);
    if (pk.winner.toUpperCase().trim() === winner || pkWinnerNorm === normWinner) {
      const pAway = (pk.awayScore !== null && pk.awayScore !== "" && !isNaN(pk.awayScore))
        ? Number(pk.awayScore)
        : null;
      const pHome = (pk.homeScore !== null && pk.homeScore !== "" && !isNaN(pk.homeScore))
        ? Number(pk.homeScore)
        : null;

      if (pAway !== null && pHome !== null) {
        const diff = Math.abs(pAway - awayScore) + Math.abs(pHome - homeScore);
        pk.diff = diff;
        winningPickers.push({ name: pName, diff });
      } else {
        winningPickers.push({ name: pName, diff: Infinity });
      }
    }
  });

  // 2. Identify the closest pick(s)
  let minDiff = Infinity;
  let closestPickers = [];

  if (winningPickers.length > 0) {
    winningPickers.forEach(wp => {
      if (wp.diff < minDiff) {
        minDiff = wp.diff;
        closestPickers = [wp.name];
      } else if (wp.diff === minDiff && minDiff !== Infinity) {
        closestPickers.push(wp.name);
      }
    });
  }

  const tieCount = closestPickers.length;
  const isExact = (minDiff === 0);

  // 3. Award points to pickers
  players.forEach(pName => {
    const pk = game.picks[pName];
    if (!pk || !pk.winner) return;

    const pkWinnerNorm = normalizeTeamCode(pk.winner);
    if (pk.winner.toUpperCase().trim() === winner || pkWinnerNorm === normWinner) {
      const mult = pk.multiplier ? 3 : 1;
      const basePoints = 10 * mult;
      let bonusPoints = 0;

      if (closestPickers.includes(pName)) {
        pk.isClosest = true;
        if (isExact) {
          pk.exact = true;
          const bonusPool = (tieCount > 1) ? 25 : 50;
          bonusPoints = bonusPool * mult;
        } else {
          const bonusPool = (tieCount > 1) ? 5 : 10;
          bonusPoints = bonusPool * mult;
        }
      }

      pk.basePoints = basePoints;
      pk.bonusPoints = bonusPoints;
      pk.points = basePoints + bonusPoints;
    }
  });

  return game;
}

/**
 * Calculates a player's Win-Loss record and win percentage across all finalized games
 * up through an optional maximum week.
 *
 * @param {Object} weeksData - The league weeks container { "Week 1": { games: [] }, ... }
 * @param {string} playerName - The player's name
 * @param {number|null} [throughWeek=null] - Maximum week to accumulate through
 * @returns {{ wins: number, losses: number, total: number, pct: string, winRate: number, label: string }}
 */
function getPlayerSeasonRecord(weeksData, playerName, throughWeek = null) {
  let wins = 0;
  let losses = 0;

  if (weeksData) {
    const maxW = (throughWeek !== null && throughWeek !== undefined) ? throughWeek : 18;
    for (let w = 1; w <= maxW; w++) {
      const weekKey = `Week ${w}`;
      const week = weeksData[weekKey];
      if (!week || !week.games || !Array.isArray(week.games)) continue;

      week.games.forEach(game => {
        if (!game || !game.matchup || !game.matchup.includes("@") || !game.isFinal || !game.winner) return;
        const parts = game.matchup.split("@").map(s => s.trim().toUpperCase());
        if (parts.length !== 2) return;
        const winner = game.winner.toUpperCase().trim();
        const normWinner = normalizeTeamCode(winner);
        const normAway = normalizeTeamCode(parts[0]);
        const normHome = normalizeTeamCode(parts[1]);
        if (normWinner !== normAway && normWinner !== normHome && normWinner !== "TIE") return;

        const pick = game.picks ? game.picks[playerName] : null;
        if (pick && pick.winner) {
          const normPick = normalizeTeamCode(pick.winner);
          if (pick.winner.toUpperCase().trim() === winner || normPick === normWinner) {
            wins++;
          } else {
            losses++;
          }
        } else {
          losses++;
        }
      });
    }
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) : 0;
  const pct = (winRate * 100).toFixed(1);
  const label = `${wins}-${losses} W-L`;

  return { wins, losses, total, winRate, pct, label };
}

/**
 * Calculates a player's Win-Loss record for a single specific week.
 *
 * @param {Object} weekData - Single week data object with games array
 * @param {string} playerName - The player's name
 * @returns {{ wins: number, losses: number, total: number, pct: string, winRate: number, label: string }}
 */
function getPlayerWeekRecord(weekData, playerName) {
  let wins = 0;
  let losses = 0;

  if (weekData && weekData.games && Array.isArray(weekData.games)) {
    weekData.games.forEach(game => {
      if (!game || !game.matchup || !game.matchup.includes("@") || !game.isFinal || !game.winner) return;
      const parts = game.matchup.split("@").map(s => s.trim().toUpperCase());
      if (parts.length !== 2) return;
      const winner = game.winner.toUpperCase().trim();
      const normWinner = normalizeTeamCode(winner);
      const normAway = normalizeTeamCode(parts[0]);
      const normHome = normalizeTeamCode(parts[1]);
      if (normWinner !== normAway && normWinner !== normHome && normWinner !== "TIE") return;

      const pick = game.picks ? game.picks[playerName] : null;
      if (pick && pick.winner) {
        const normPick = normalizeTeamCode(pick.winner);
        if (pick.winner.toUpperCase().trim() === winner || normPick === normWinner) {
          wins++;
        } else {
          losses++;
        }
      } else {
        losses++;
      }
    });
  }

  const total = wins + losses;
  const winRate = total > 0 ? (wins / total) : 0;
  const pct = (winRate * 100).toFixed(1);
  const label = `${wins}-${losses} W-L`;

  return { wins, losses, total, winRate, pct, label };
}

/**
 * Computes overall Season Leaderboard with exact mathematical Win-Loss percentage tie-breaking.
 * Ranks are assigned with "T-#" notation ONLY if both points and win percentage are identical.
 *
 * @param {Object} weeksData - The league weeks object { "Week 1": ..., "Week 2": ... }
 * @param {Array<string>} players - Array of player names
 * @param {number|null} [throughWeek=null] - Maximum week limit (for historical rank comparison)
 * @returns {Array<Object>} Sorted and ranked player standings
 */
function computeSeasonLeaderboard(weeksData, players, throughWeek = null) {
  const maxW = (throughWeek !== null && throughWeek !== undefined) ? throughWeek : 18;

  const list = players.map(pName => {
    let totalPts = 0;
    if (weeksData) {
      for (let w = 1; w <= maxW; w++) {
        const week = weeksData[`Week ${w}`];
        if (week && week.games && Array.isArray(week.games)) {
          week.games.forEach(g => {
            const pk = g.picks ? g.picks[pName] : null;
            if (pk && typeof pk.points === "number") {
              totalPts += pk.points;
            }
          });
        }
      }
    }

    const rec = getPlayerSeasonRecord(weeksData, pName, throughWeek);

    return {
      name: pName,
      points: totalPts,
      rec
    };
  });

  // Sort descending by points (primary), then exact Win-Loss percentage (secondary tie-breaker)
  list.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const aWinRate = a.rec && a.rec.total > 0 ? (a.rec.wins / a.rec.total) : 0;
    const bWinRate = b.rec && b.rec.total > 0 ? (b.rec.wins / b.rec.total) : 0;
    return bWinRate - aWinRate;
  });

  // Assign ranks: players share a tied rank (T-#) ONLY if points AND Win-Loss percentage are identical
  let currentRank = 1;
  for (let i = 0; i < list.length; i++) {
    if (i > 0) {
      const prev = list[i - 1];
      const curr = list[i];
      const prevWinRate = prev.rec && prev.rec.total > 0 ? (prev.rec.wins / prev.rec.total) : 0;
      const currWinRate = curr.rec && curr.rec.total > 0 ? (curr.rec.wins / curr.rec.total) : 0;
      const isExactTie = (curr.points === prev.points && currWinRate === prevWinRate);
      if (!isExactTie) {
        currentRank = i + 1;
      }
    }
    list[i].numericRank = currentRank;
  }

  const rankCounts = {};
  list.forEach(p => {
    rankCounts[p.numericRank] = (rankCounts[p.numericRank] || 0) + 1;
  });

  list.forEach(p => {
    const isTied = rankCounts[p.numericRank] > 1;
    p.rankDisplay = isTied ? `T-${p.numericRank}` : `${p.numericRank}`;
    p.rank = p.numericRank;
  });

  return list;
}

/**
 * Computes weekly leaderboard with exact single-week Win-Loss percentage tie-breaker.
 *
 * @param {Object} weekData - Single week data object
 * @param {Array<string>} players - Array of player names
 * @returns {Array<Object>} Sorted and ranked player standings for this week
 */
function computeWeeklyLeaderboard(weekData, players) {
  const games = weekData && weekData.games ? weekData.games : [];

  const list = players.map(pName => {
    let pts = 0;
    games.forEach(g => {
      const pk = g.picks && g.picks[pName];
      if (pk) {
        pts += (pk.points || 0);
      }
    });

    const rec = getPlayerWeekRecord(weekData, pName);

    return {
      name: pName,
      points: pts,
      rec
    };
  });

  // Sort descending by points (primary), then exact single-week Win-Loss percentage (secondary tie-breaker)
  list.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    const aWinRate = a.rec && a.rec.total > 0 ? (a.rec.wins / a.rec.total) : 0;
    const bWinRate = b.rec && b.rec.total > 0 ? (b.rec.wins / b.rec.total) : 0;
    return bWinRate - aWinRate;
  });

  // Assign shared ranks based off points and single-week Win-Loss percentage
  let currentRank = 1;
  for (let i = 0; i < list.length; i++) {
    if (i > 0) {
      const prev = list[i - 1];
      const curr = list[i];
      const prevWinRate = prev.rec && prev.rec.total > 0 ? (prev.rec.wins / prev.rec.total) : 0;
      const currWinRate = curr.rec && curr.rec.total > 0 ? (curr.rec.wins / curr.rec.total) : 0;
      const isExactTie = (curr.points === prev.points && currWinRate === prevWinRate);
      if (!isExactTie) {
        currentRank = i + 1;
      }
    }
    list[i].numericRank = currentRank;
  }

  const rankCounts = {};
  list.forEach(p => {
    rankCounts[p.numericRank] = (rankCounts[p.numericRank] || 0) + 1;
  });

  list.forEach(p => {
    const isTied = rankCounts[p.numericRank] > 1;
    p.rankDisplay = isTied ? `T-${p.numericRank}` : `${p.numericRank}`;
    p.rank = p.numericRank;
  });

  return list;
}

/**
 * Audits all past weeks (Week 1 through currentWeek - 1) and returns an array of
 * week numbers that have missing scores or unfinalized games requiring background reconciliation.
 *
 * @param {Object} weeksData - The league weeks object
 * @param {number} currentWeek - Current active NFL week
 * @returns {Array<number>} List of week numbers that require catch-up synchronization
 */
function getIncompletePastWeeks(weeksData, currentWeek) {
  if (!weeksData || currentWeek <= 1) return [];

  const incomplete = [];

  for (let w = 1; w < currentWeek; w++) {
    const wKey = `Week ${w}`;
    const wData = weeksData[wKey];
    if (!wData || !wData.games || wData.games.length === 0) {
      incomplete.push(w);
      continue;
    }

    const hasUnfinalized = wData.games.some(g => {
      if (!g || !g.matchup || !g.matchup.includes("@")) return false;
      return !g.isFinal || g.awayScore === null || g.homeScore === null;
    });

    if (hasUnfinalized) {
      incomplete.push(w);
    }
  }

  // Also verify immediately preceding week (currentWeek - 1) to catch late Monday games / stat corrections
  const prevWeek = currentWeek - 1;
  if (prevWeek >= 1 && !incomplete.includes(prevWeek)) {
    incomplete.push(prevWeek);
  }

  return incomplete;
}

// Universal module export supporting CommonJS, ES Modules, and browser environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    normalizeTeamCode,
    calculateGamePicksPoints,
    getPlayerSeasonRecord,
    getPlayerWeekRecord,
    computeSeasonLeaderboard,
    computeWeeklyLeaderboard,
    getIncompletePastWeeks
  };
}
