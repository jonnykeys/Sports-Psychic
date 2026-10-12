/**
 * @fileoverview Unit tests for ESPN REST API Adapter and Event Parser.
 */

const {
  buildScoreboardUrl,
  buildStandingsUrl,
  parseESPNEvent
} = require("../src/api/espn.js");

function runEspnTests(assert) {
  // Scoreboard URL builder
  const url = buildScoreboardUrl(5, 2026);
  assert.equal(url.includes("dates=2026"), true, "Scoreboard URL includes dates=2026");
  assert.equal(url.includes("week=5"), true, "Scoreboard URL includes week=5");

  // Standings URL builder
  const standingsUrl = buildStandingsUrl();
  assert.equal(standingsUrl, "https://site.api.espn.com/apis/v2/sports/football/nfl/standings", "Standings URL matches official ESPN v2 endpoint");

  // Mock Event 1: Pre-game matchup
  const mockPreGameEvent = {
    id: "401671780",
    date: "2026-10-11T17:00:00Z",
    status: {
      period: 0,
      displayClock: "0:00",
      type: { state: "pre", name: "STATUS_SCHEDULED", shortDetail: "Sun, Oct 11 - 1:00 PM EDT" }
    },
    competitions: [{
      competitors: [
        { id: "28", homeAway: "away", score: null, team: { abbreviation: "WSH", displayName: "Washington Commanders" } },
        { id: "1",  homeAway: "home", score: null, team: { abbreviation: "ATL", displayName: "Atlanta Falcons" } }
      ]
    }]
  };

  const parsedPre = parseESPNEvent(mockPreGameEvent);
  assert.equal(parsedPre.matchup, "WAS @ ATL", "Matchup normalizes WSH to WAS");
  assert.equal(parsedPre.away.score, null, "Pre-game away score is null");
  assert.equal(parsedPre.home.score, null, "Pre-game home score is null");
  assert.equal(parsedPre.status.isFinal, false, "Pre-game is not final");
  assert.equal(parsedPre.status.isLive, false, "Pre-game is not live");
  assert.equal(parsedPre.winner, null, "Pre-game has no winner");

  // Mock Event 2: In-progress Live Game
  const mockLiveGameEvent = {
    id: "401671781",
    date: "2026-10-11T20:25:00Z",
    status: {
      period: 3,
      displayClock: "7:42",
      type: { state: "in", name: "STATUS_IN_PROGRESS", shortDetail: "3rd - 7:42" }
    },
    competitions: [{
      competitors: [
        { id: "12", homeAway: "away", score: "21", team: { abbreviation: "KC", displayName: "Kansas City Chiefs" } },
        { id: "14", homeAway: "home", score: "17", team: { abbreviation: "LAC", displayName: "Los Angeles Chargers" } }
      ],
      situation: {
        possession: "12",
        downDistanceText: "2nd & 4",
        isRedZone: false
      }
    }]
  };

  const parsedLive = parseESPNEvent(mockLiveGameEvent);
  assert.equal(parsedLive.status.isLive, true, "In-progress game is live");
  assert.equal(parsedLive.status.isFinal, false, "In-progress game is not final");
  assert.equal(parsedLive.away.score, 21, "Parsed live away score equals 21");
  assert.equal(parsedLive.home.score, 17, "Parsed live home score equals 17");
  assert.equal(parsedLive.situation.possession, "KC", "Possession matches away team KC");
  assert.equal(parsedLive.situation.downDistance, "2nd & 4", "Down & distance matches 2nd & 4");

  // Mock Event 3: Final Completed Game
  const mockFinalEvent = {
    id: "401671782",
    date: "2026-10-04T17:00:00Z",
    status: {
      period: 4,
      displayClock: "0:00",
      type: { state: "post", name: "STATUS_FINAL", shortDetail: "Final" }
    },
    competitions: [{
      competitors: [
        { id: "2",  homeAway: "away", score: "34", team: { abbreviation: "BUF", displayName: "Buffalo Bills" } },
        { id: "15", homeAway: "home", score: "24", team: { abbreviation: "MIA", displayName: "Miami Dolphins" } }
      ],
      odds: [{ details: "BUF -3.5", overUnder: 48.5 }]
    }]
  };

  const parsedFinal = parseESPNEvent(mockFinalEvent);
  assert.equal(parsedFinal.status.isFinal, true, "Completed game is marked final");
  assert.equal(parsedFinal.status.isLive, false, "Completed game is not live");
  assert.equal(parsedFinal.away.score, 34, "Away score is 34");
  assert.equal(parsedFinal.home.score, 24, "Home score is 24");
  assert.equal(parsedFinal.winner, "BUF", "Winner correctly determined as BUF");
  assert.equal(parsedFinal.odds.details, "BUF -3.5", "Odds details captured correctly");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { runEspnTests };
}
