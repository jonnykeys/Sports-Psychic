/**
 * @fileoverview ESPN REST API Adapter & Telemetry Parser
 * Decouples external network calls and raw JSON transformation from the UI layer.
 * @module api/espn
 */

const { normalizeTeamCode } = (typeof require !== "undefined")
  ? require("../utils/teams.js")
  : (window.TeamsUtil || {});

/**
 * Generates the official ESPN NFL Scoreboard API endpoint for a specific week and year.
 * 
 * @param {number} week NFL week number (1-18)
 * @param {number} [year=2026] Season calendar year
 * @param {number} [seasonType=2] Season type (1=preseason, 2=regular season, 3=postseason)
 * @returns {string} Fully qualified HTTPS endpoint
 */
function buildScoreboardUrl(week, year = 2026, seasonType = 2) {
  return `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${year}&seasontype=${seasonType}&week=${week}`;
}

/**
 * Generates the official ESPN NFL Standings API endpoint.
 * 
 * @returns {string} Fully qualified HTTPS endpoint
 */
function buildStandingsUrl() {
  return "https://site.api.espn.com/apis/v2/sports/football/nfl/standings";
}

/**
 * Parses a single raw event object from ESPN's scoreboard payload into a clean, normalized Game model.
 * 
 * @param {object} event Raw ESPN event object
 * @returns {object|null} Normalized game object or null if malformed
 */
function parseESPNEvent(event) {
  if (!event || !event.competitions || !Array.isArray(event.competitions) || !event.competitions[0]) {
    return null;
  }

  const comp = event.competitions[0];
  const competitors = comp.competitors || [];
  const rawAway = competitors.find(c => c.homeAway === "away");
  const rawHome = competitors.find(c => c.homeAway === "home");

  if (!rawAway || !rawHome) return null;

  const awayCode = (typeof normalizeTeamCode === "function")
    ? normalizeTeamCode(rawAway.team?.abbreviation)
    : (rawAway.team?.abbreviation || "").toUpperCase();

  const homeCode = (typeof normalizeTeamCode === "function")
    ? normalizeTeamCode(rawHome.team?.abbreviation)
    : (rawHome.team?.abbreviation || "").toUpperCase();

  const statusObj = event.status || {};
  const statusType = statusObj.type || {};
  const stateCode = (statusType.state || "pre").toLowerCase(); // "pre", "in", "post"

  const isFinal = (stateCode === "post" || (statusType.name || "").includes("STATUS_FINAL"));
  const isLive = (stateCode === "in");

  // Parse scores (integer or null if pregame)
  const awayScore = (rawAway.score !== undefined && rawAway.score !== null && rawAway.score !== "")
    ? parseInt(rawAway.score, 10)
    : null;
  const homeScore = (rawHome.score !== undefined && rawHome.score !== null && rawHome.score !== "")
    ? parseInt(rawHome.score, 10)
    : null;

  // Determine winner if final
  let winner = null;
  if (isFinal && awayScore !== null && homeScore !== null) {
    if (awayScore > homeScore) winner = awayCode;
    else if (homeScore > awayScore) winner = homeCode;
    else winner = "TIE";
  }

  // Real-time situational telemetry
  const situation = comp.situation || {};
  const possessionId = situation.possession;
  let possession = null;
  if (possessionId) {
    if (rawAway.id === possessionId) possession = awayCode;
    else if (rawHome.id === possessionId) possession = homeCode;
  }

  // Betting odds
  let odds = null;
  if (comp.odds && Array.isArray(comp.odds) && comp.odds[0]) {
    odds = {
      details: comp.odds[0].details || null,
      overUnder: comp.odds[0].overUnder || null,
      spread: comp.odds[0].spread || null
    };
  }

  return {
    id: event.id,
    matchup: `${awayCode} @ ${homeCode}`,
    kickoff: event.date || null,
    status: {
      state: stateCode,
      isFinal,
      isLive,
      shortDetail: statusType.shortDetail || "",
      clock: statusObj.displayClock || "0:00",
      period: statusObj.period || 0
    },
    away: {
      code: awayCode,
      name: rawAway.team?.displayName || awayCode,
      score: awayScore,
      record: rawAway.records?.[0]?.summary || null
    },
    home: {
      code: homeCode,
      name: rawHome.team?.displayName || homeCode,
      score: homeScore,
      record: rawHome.records?.[0]?.summary || null
    },
    winner,
    situation: {
      possession,
      downDistance: situation.downDistanceText || null,
      isRedZone: Boolean(situation.isRedZone)
    },
    odds
  };
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    buildScoreboardUrl,
    buildStandingsUrl,
    parseESPNEvent
  };
}
if (typeof window !== "undefined") {
  window.EspnApi = {
    buildScoreboardUrl,
    buildStandingsUrl,
    parseESPNEvent
  };
}
