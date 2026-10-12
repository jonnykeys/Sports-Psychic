/**
 * @fileoverview Unit tests for Standings and Matchups UI Component Renderers.
 */

const {
  renderRankBadge,
  renderRecordPill,
  renderLeaderboardRow,
  renderLeaderboardTable
} = require("../src/ui/standings.js");

const {
  renderGameStatusBadge,
  renderMatchupCard
} = require("../src/ui/matchups.js");

function runUiTests(assert) {
  // 1. Rank Badge rendering
  const rank1Html = renderRankBadge(1, false);
  assert.equal(rank1Html.includes("rank-1"), true, "Rank 1 badge includes rank-1 class");
  assert.equal(rank1Html.includes("🥇"), true, "Rank 1 badge includes gold medal icon");

  const rank2Html = renderRankBadge(2, false);
  assert.equal(rank2Html.includes("rank-2"), true, "Rank 2 badge includes rank-2 class");
  assert.equal(rank2Html.includes("🥈"), true, "Rank 2 badge includes silver medal icon");

  const rank3Html = renderRankBadge(3, false);
  assert.equal(rank3Html.includes("rank-3"), true, "Rank 3 badge includes rank-3 class");
  assert.equal(rank3Html.includes("🥉"), true, "Rank 3 badge includes bronze medal icon");

  const tiedRankHtml = renderRankBadge(11, true);
  assert.equal(tiedRankHtml.includes("T-11"), true, "Tied rank 11 renders with T-11 notation");

  // 2. Record Pill rendering
  const pillHtml = renderRecordPill(35, 29, 35 / 64);
  assert.equal(pillHtml.includes("35-29"), true, "Record pill includes 35-29 count");
  assert.equal(pillHtml.includes("55%"), true, "Record pill formats 0.546875 as 55%");

  // 3. Leaderboard Row rendering
  const mockPlayer = {
    name: "Caleb",
    points: 630,
    wins: 40,
    losses: 24,
    winRate: 40 / 64,
    isTied: false
  };

  const rowHtml = renderLeaderboardRow(mockPlayer, 1, true);
  assert.equal(rowHtml.includes("Caleb"), true, "Leaderboard row renders player name");
  assert.equal(rowHtml.includes("630"), true, "Leaderboard row renders 630 points");
  assert.equal(rowHtml.includes("is-current-user"), true, "Current user row includes is-current-user class");

  // 4. Empty Leaderboard Table
  const emptyTableHtml = renderLeaderboardTable([]);
  assert.equal(emptyTableHtml.includes("No leaderboard data available"), true, "Empty table renders fallback message");

  // 5. Game Status Badge rendering
  const finalBadgeHtml = renderGameStatusBadge({ isFinal: true });
  assert.equal(finalBadgeHtml.includes("FINAL"), true, "Final badge renders FINAL text");

  const liveBadgeHtml = renderGameStatusBadge({ isLive: true, shortDetail: "3rd 7:42" });
  assert.equal(liveBadgeHtml.includes("is-live"), true, "Live badge includes is-live class");
  assert.equal(liveBadgeHtml.includes("3rd 7:42"), true, "Live badge displays clock detail");

  const lockedBadgeHtml = renderGameStatusBadge({ isFinal: false, isLive: false, shortDetail: "Sun 1:00 PM" }, true);
  assert.equal(lockedBadgeHtml.includes("🔒"), true, "Locked badge includes lock icon");

  // 6. Matchup Card rendering
  const mockGame = {
    id: "gm-101",
    away: { code: "KC", name: "Kansas City Chiefs", score: 24 },
    home: { code: "BUF", name: "Buffalo Bills", score: 27 },
    status: { isFinal: true, isLive: false }
  };

  const mockPick = {
    awayScore: 24,
    homeScore: 27,
    isLock3x: true
  };

  const cardHtml = renderMatchupCard(mockGame, mockPick, { isLocked: true });
  assert.equal(cardHtml.includes("KC @ BUF"), true, "Matchup card renders matchup title");
  assert.equal(cardHtml.includes("3X LOCK"), true, "Matchup card displays 3X LOCK pill");
  assert.equal(cardHtml.includes("is-locked-card"), true, "Matchup card includes locked card class");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { runUiTests };
}
