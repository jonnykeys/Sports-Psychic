/**
 * @fileoverview Pure UI Component Renderers for NFL Matchups and Pick Sheets
 * Decoupled from global DOM state. Takes pure game telemetry and pick data and returns sanitized HTML strings.
 * @module ui/matchups
 */

const { escapeHtml } = (typeof require !== "undefined")
  ? require("./standings.js")
  : (window.StandingsUI || { escapeHtml: s => String(s ?? "") });

/**
 * Renders a game status badge (e.g. "FINAL", "LIVE - 3rd 7:42", "Sun, Oct 11 - 1:00 PM").
 * 
 * @param {object} status Game status object
 * @param {boolean} [isLocked=false] Whether predictions are locked
 * @returns {string} HTML string
 */
function renderGameStatusBadge(status = {}, isLocked = false) {
  if (status.isFinal) {
    return `<span class="game-status-badge is-final">FINAL</span>`;
  }

  if (status.isLive) {
    const clockText = status.shortDetail || `${status.period}Q ${status.clock || ""}`.trim();
    return `
      <span class="game-status-badge is-live">
        <span class="live-dot" aria-hidden="true"></span>
        <span class="live-text">${escapeHtml(clockText || "LIVE")}</span>
      </span>
    `.trim();
  }

  const scheduledText = status.shortDetail || "SCHEDULED";
  const lockIcon = isLocked ? `<span class="lock-icon" aria-label="Picks Locked">🔒 </span>` : "";
  const lockClass = isLocked ? "is-locked" : "is-scheduled";

  return `<span class="game-status-badge ${lockClass}">${lockIcon}${escapeHtml(scheduledText)}</span>`;
}

/**
 * Renders a complete NFL matchup card with team info, live telemetry, and user prediction state.
 * 
 * @param {object} game Normalized game object
 * @param {object} [userPick] User prediction object { awayScore, homeScore, isLock3x }
 * @param {object} [options] Display options { isLocked, isCommish }
 * @returns {string} HTML string
 */
function renderMatchupCard(game, userPick = null, options = {}) {
  if (!game) return "";

  const awayCode = escapeHtml(game.away?.code || "AWAY");
  const homeCode = escapeHtml(game.home?.code || "HOME");
  const awayName = escapeHtml(game.away?.name || awayCode);
  const homeName = escapeHtml(game.home?.name || homeCode);

  const awayScore = game.away?.score !== null && game.away?.score !== undefined ? game.away.score : "-";
  const homeScore = game.home?.score !== null && game.home?.score !== undefined ? game.home.score : "-";

  const isLocked = Boolean(options.isLocked);
  const isLive = Boolean(game.status?.isLive);
  const isFinal = Boolean(game.status?.isFinal);

  const statusBadgeHtml = renderGameStatusBadge(game.status, isLocked);

  // User prediction display
  let pickHtml = "";
  if (userPick) {
    const pickAway = userPick.awayScore ?? "-";
    const pickHome = userPick.homeScore ?? "-";
    const is3x = Boolean(userPick.isLock3x);
    const lockPill = is3x ? `<span class="pill-3x" title="3X Confidence Multiplier">3X LOCK</span>` : "";

    pickHtml = `
      <div class="user-pick-box">
        <span class="pick-label">Your Forecast:</span>
        <span class="pick-score">${awayCode} ${pickAway} - ${pickHome} ${homeCode}</span>
        ${lockPill}
      </div>
    `.trim();
  } else {
    pickHtml = `
      <div class="user-pick-box is-empty">
        <span class="pick-placeholder">${isLocked ? "No pick submitted" : "Tap to make pick"}</span>
      </div>
    `.trim();
  }

  const cardClasses = [
    "matchup-card",
    isLive ? "is-live-card" : "",
    isFinal ? "is-final-card" : "",
    isLocked ? "is-locked-card" : "is-open-card"
  ].filter(Boolean).join(" ");

  return `
    <div class="${cardClasses}" data-game-id="${escapeHtml(game.id || "")}">
      <div class="matchup-header">
        <span class="matchup-title">${awayCode} @ ${homeCode}</span>
        ${statusBadgeHtml}
      </div>
      <div class="matchup-teams">
        <div class="team-side away-side">
          <span class="team-code">${awayCode}</span>
          <span class="team-name">${awayName}</span>
          <span class="team-actual-score">${awayScore}</span>
        </div>
        <div class="matchup-vs">@</div>
        <div class="team-side home-side">
          <span class="team-actual-score">${homeScore}</span>
          <span class="team-name">${homeName}</span>
          <span class="team-code">${homeCode}</span>
        </div>
      </div>
      ${pickHtml}
    </div>
  `.trim();
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    renderGameStatusBadge,
    renderMatchupCard
  };
}
if (typeof window !== "undefined") {
  window.MatchupsUI = {
    renderGameStatusBadge,
    renderMatchupCard
  };
}
