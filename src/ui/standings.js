/**
 * @fileoverview Pure UI Component Renderers for Leaderboards and Standings
 * Decoupled from global DOM state. Takes pure data structures and returns sanitized HTML strings.
 * @module ui/standings
 */

/**
 * Escapes unsafe HTML characters to prevent XSS.
 * @param {string} str Raw string
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Renders a rank badge with tier-appropriate styling (Gold, Silver, Bronze, or Numeric).
 * Handles tied rank notation (e.g. "T-11").
 * 
 * @param {number|string} rank Numeric rank or formatted rank string
 * @param {boolean} [isTied=false] Whether the player is tied with another
 * @returns {string} HTML string
 */
function renderRankBadge(rank, isTied = false) {
  const numericRank = typeof rank === "number" ? rank : parseInt(String(rank).replace(/\D/g, ""), 10);
  const displayRank = isTied ? `T-${numericRank}` : `${numericRank}`;

  let tierClass = "rank-other";
  let medalIcon = "";

  if (numericRank === 1) {
    tierClass = "rank-1";
    medalIcon = `<span class="rank-medal gold" aria-label="1st Place">🥇</span>`;
  } else if (numericRank === 2) {
    tierClass = "rank-2";
    medalIcon = `<span class="rank-medal silver" aria-label="2nd Place">🥈</span>`;
  } else if (numericRank === 3) {
    tierClass = "rank-3";
    medalIcon = `<span class="rank-medal bronze" aria-label="3rd Place">🥉</span>`;
  }

  return `
    <div class="standings-rank-badge ${tierClass}" data-rank="${numericRank}">
      ${medalIcon}
      <span class="rank-number">${escapeHtml(displayRank)}</span>
    </div>
  `.trim();
}

/**
 * Renders a Win-Loss record pill with formatted percentage.
 * 
 * @param {number} wins Total wins
 * @param {number} losses Total losses
 * @param {number} [winRate] Exact mathematical win rate (0.0 to 1.0)
 * @returns {string} HTML string
 */
function renderRecordPill(wins, losses, winRate) {
  const safeWins = Number(wins) || 0;
  const safeLosses = Number(losses) || 0;
  const total = safeWins + safeLosses;
  const computedRate = (winRate !== undefined && winRate !== null)
    ? winRate
    : (total > 0 ? (safeWins / total) : 0);

  const pctDisplay = `${Math.round(computedRate * 100)}%`;

  return `
    <div class="record-pill" title="Exact Win Rate: ${(computedRate * 100).toFixed(2)}%">
      <span class="record-counts">${safeWins}-${safeLosses}</span>
      <span class="record-divider">•</span>
      <span class="record-pct">${pctDisplay}</span>
    </div>
  `.trim();
}

/**
 * Renders a single leaderboard row card.
 * 
 * @param {object} player Player record object
 * @param {number} rank Assigned rank number
 * @param {boolean} [isCurrentUser=false] Whether this row is the authenticated user
 * @param {object} [options]
 * @returns {string} HTML string
 */
function renderLeaderboardRow(player, rank, isCurrentUser = false, options = {}) {
  if (!player) return "";

  const name = escapeHtml(player.name || "Unknown");
  const points = Number(player.points ?? player.seasonPoints ?? 0);
  const isTied = Boolean(player.isTied);
  const wins = player.wins ?? player.seasonWins ?? 0;
  const losses = player.losses ?? player.seasonLosses ?? 0;
  const winRate = player.winRate ?? player.exactWinRate;

  const currentClass = isCurrentUser ? "is-current-user" : "";
  const rankBadgeHtml = renderRankBadge(rank, isTied);
  const recordPillHtml = renderRecordPill(wins, losses, winRate);

  return `
    <div class="leaderboard-row ${currentClass}" data-player="${name}">
      <div class="leaderboard-left">
        ${rankBadgeHtml}
        <div class="player-info">
          <span class="player-name">${name}</span>
          ${recordPillHtml}
        </div>
      </div>
      <div class="leaderboard-right">
        <span class="points-val">${points}</span>
        <span class="points-label">PTS</span>
      </div>
    </div>
  `.trim();
}

/**
 * Renders a complete leaderboard table container.
 * 
 * @param {Array<object>} players Sorted array of player records
 * @param {string} [currentUserName] Name of current authenticated player
 * @returns {string} HTML string
 */
function renderLeaderboardTable(players, currentUserName = "") {
  if (!Array.isArray(players) || players.length === 0) {
    return `<div class="leaderboard-empty"><p>No leaderboard data available.</p></div>`;
  }

  const rowsHtml = players.map((p, idx) => {
    const isCurrent = Boolean(currentUserName && p.name && p.name.toLowerCase() === currentUserName.toLowerCase());
    const rank = p.rank || (idx + 1);
    return renderLeaderboardRow(p, rank, isCurrent);
  }).join("\n");

  return `
    <div class="leaderboard-container">
      <div class="leaderboard-header">
        <span class="col-rank">RANK & PLAYER</span>
        <span class="col-points">POINTS</span>
      </div>
      <div class="leaderboard-body">
        ${rowsHtml}
      </div>
    </div>
  `.trim();
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    escapeHtml,
    renderRankBadge,
    renderRecordPill,
    renderLeaderboardRow,
    renderLeaderboardTable
  };
}
if (typeof window !== "undefined") {
  window.StandingsUI = {
    escapeHtml,
    renderRankBadge,
    renderRecordPill,
    renderLeaderboardRow,
    renderLeaderboardTable
  };
}
