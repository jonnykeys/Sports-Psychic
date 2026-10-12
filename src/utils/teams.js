/**
 * @fileoverview NFL 32-Team Canonical Directory and Abbreviation Normalizer
 * Provides standard team metadata, conference/division hierarchy, and bidirectional alias mappings.
 * @module utils/teams
 */

/**
 * Historical and third-party API alias mappings to standard canonical NFL codes.
 * @type {Readonly<Record<string, string>>}
 */
const TEAM_ALIASES = Object.freeze({
  "WSH": "WAS", // ESPN uses WSH; canonical is WAS
  "JAX": "JAC", // ESPN often uses JAX; canonical is JAC
  "OAK": "LV",  // Historical Oakland Raiders
  "SD": "LAC",  // Historical San Diego Chargers
  "STL": "LAR", // Historical St. Louis Rams
  "LA": "LAR",  // Ambiguous Los Angeles alias defaults to Rams
  "WFT": "WAS"  // Washington Football Team
});

/**
 * The 32 Canonical NFL Franchises with complete conference, division, and color metadata.
 * @type {Readonly<Record<string, { code: string, name: string, city: string, mascot: string, conference: 'AFC'|'NFC', division: 'East'|'North'|'South'|'West', primaryColor: string, secondaryColor: string }>>}
 */
const NFL_TEAMS = Object.freeze({
  // AFC East
  "BUF": { code: "BUF", name: "Buffalo Bills", city: "Buffalo", mascot: "Bills", conference: "AFC", division: "East", primaryColor: "#00338D", secondaryColor: "#C60C30" },
  "MIA": { code: "MIA", name: "Miami Dolphins", city: "Miami", mascot: "Dolphins", conference: "AFC", division: "East", primaryColor: "#008E97", secondaryColor: "#FC4C02" },
  "NE":  { code: "NE",  name: "New England Patriots", city: "New England", mascot: "Patriots", conference: "AFC", division: "East", primaryColor: "#002244", secondaryColor: "#C60C30" },
  "NYJ": { code: "NYJ", name: "New York Jets", city: "New York", mascot: "Jets", conference: "AFC", division: "East", primaryColor: "#125740", secondaryColor: "#FFFFFF" },

  // AFC North
  "BAL": { code: "BAL", name: "Baltimore Ravens", city: "Baltimore", mascot: "Ravens", conference: "AFC", division: "North", primaryColor: "#241773", secondaryColor: "#000000" },
  "CIN": { code: "CIN", name: "Cincinnati Bengals", city: "Cincinnati", mascot: "Bengals", conference: "AFC", division: "North", primaryColor: "#FB4F14", secondaryColor: "#000000" },
  "CLE": { code: "CLE", name: "Cleveland Browns", city: "Cleveland", mascot: "Browns", conference: "AFC", division: "North", primaryColor: "#311D00", secondaryColor: "#FF3C00" },
  "PIT": { code: "PIT", name: "Pittsburgh Steelers", city: "Pittsburgh", mascot: "Steelers", conference: "AFC", division: "North", primaryColor: "#FFB612", secondaryColor: "#101820" },

  // AFC South
  "HOU": { code: "HOU", name: "Houston Texans", city: "Houston", mascot: "Texans", conference: "AFC", division: "South", primaryColor: "#03202F", secondaryColor: "#A71930" },
  "IND": { code: "IND", name: "Indianapolis Colts", city: "Indianapolis", mascot: "Colts", conference: "AFC", division: "South", primaryColor: "#002C5F", secondaryColor: "#A2AAAD" },
  "JAC": { code: "JAC", name: "Jacksonville Jaguars", city: "Jacksonville", mascot: "Jaguars", conference: "AFC", division: "South", primaryColor: "#006778", secondaryColor: "#D7A22A" },
  "TEN": { code: "TEN", name: "Tennessee Titans", city: "Tennessee", mascot: "Titans", conference: "AFC", division: "South", primaryColor: "#0C2340", secondaryColor: "#4B92DB" },

  // AFC West
  "DEN": { code: "DEN", name: "Denver Broncos", city: "Denver", mascot: "Broncos", conference: "AFC", division: "West", primaryColor: "#FB4F14", secondaryColor: "#002244" },
  "KC":  { code: "KC",  name: "Kansas City Chiefs", city: "Kansas City", mascot: "Chiefs", conference: "AFC", division: "West", primaryColor: "#E31837", secondaryColor: "#FFB81C" },
  "LV":  { code: "LV",  name: "Las Vegas Raiders", city: "Las Vegas", mascot: "Raiders", conference: "AFC", division: "West", primaryColor: "#000000", secondaryColor: "#A5ACAF" },
  "LAC": { code: "LAC", name: "Los Angeles Chargers", city: "Los Angeles", mascot: "Chargers", conference: "AFC", division: "West", primaryColor: "#0080C6", secondaryColor: "#FFC20E" },

  // NFC East
  "DAL": { code: "DAL", name: "Dallas Cowboys", city: "Dallas", mascot: "Cowboys", conference: "NFC", division: "East", primaryColor: "#003594", secondaryColor: "#041E42" },
  "NYG": { code: "NYG", name: "New York Giants", city: "New York", mascot: "Giants", conference: "NFC", division: "East", primaryColor: "#0B2265", secondaryColor: "#A71930" },
  "PHI": { code: "PHI", name: "Philadelphia Eagles", city: "Philadelphia", mascot: "Eagles", conference: "NFC", division: "East", primaryColor: "#004C54", secondaryColor: "#A5ACAF" },
  "WAS": { code: "WAS", name: "Washington Commanders", city: "Washington", mascot: "Commanders", conference: "NFC", division: "East", primaryColor: "#5A1414", secondaryColor: "#FFB612" },

  // NFC North
  "CHI": { code: "CHI", name: "Chicago Bears", city: "Chicago", mascot: "Bears", conference: "NFC", division: "North", primaryColor: "#0B162A", secondaryColor: "#C83803" },
  "DET": { code: "DET", name: "Detroit Lions", city: "Detroit", mascot: "Lions", conference: "NFC", division: "North", primaryColor: "#0076B6", secondaryColor: "#B0B7BC" },
  "GB":  { code: "GB",  name: "Green Bay Packers", city: "Green Bay", mascot: "Packers", conference: "NFC", division: "North", primaryColor: "#203731", secondaryColor: "#FFB612" },
  "MIN": { code: "MIN", name: "Minnesota Vikings", city: "Minnesota", mascot: "Vikings", conference: "NFC", division: "North", primaryColor: "#4F2683", secondaryColor: "#FFC62F" },

  // NFC South
  "ATL": { code: "ATL", name: "Atlanta Falcons", city: "Atlanta", mascot: "Falcons", conference: "NFC", division: "South", primaryColor: "#A71930", secondaryColor: "#000000" },
  "CAR": { code: "CAR", name: "Carolina Panthers", city: "Carolina", mascot: "Panthers", conference: "NFC", division: "South", primaryColor: "#0085CA", secondaryColor: "#101820" },
  "NO":  { code: "NO",  name: "New Orleans Saints", city: "New Orleans", mascot: "Saints", conference: "NFC", division: "South", primaryColor: "#D3BC8D", secondaryColor: "#101820" },
  "TB":  { code: "TB",  name: "Tampa Bay Buccaneers", city: "Tampa Bay", mascot: "Buccaneers", conference: "NFC", division: "South", primaryColor: "#D50A0A", secondaryColor: "#0A0A08" },

  // NFC West
  "ARI": { code: "ARI", name: "Arizona Cardinals", city: "Arizona", mascot: "Cardinals", conference: "NFC", division: "West", primaryColor: "#97233F", secondaryColor: "#000000" },
  "LAR": { code: "LAR", name: "Los Angeles Rams", city: "Los Angeles", mascot: "Rams", conference: "NFC", division: "West", primaryColor: "#003594", secondaryColor: "#FFA300" },
  "SF":  { code: "SF",  name: "San Francisco 49ers", city: "San Francisco", mascot: "49ers", conference: "NFC", division: "West", primaryColor: "#AA0000", secondaryColor: "#B3995D" },
  "SEA": { code: "SEA", name: "Seattle Seahawks", city: "Seattle", mascot: "Seahawks", conference: "NFC", division: "West", primaryColor: "#002244", secondaryColor: "#69BE28" }
});

/**
 * Normalizes any team abbreviation string to its canonical 2-to-3 letter NFL code.
 * 
 * @param {string} code Raw team abbreviation
 * @returns {string} Normalized canonical uppercase code
 */
function normalizeTeamCode(code) {
  if (!code || typeof code !== "string") return "";
  const cleaned = code.trim().toUpperCase();
  return TEAM_ALIASES[cleaned] || cleaned;
}

/**
 * Validates if an abbreviation corresponds to an active NFL franchise.
 * 
 * @param {string} code Team code to test
 * @returns {boolean} True if team exists
 */
function isValidTeam(code) {
  const norm = normalizeTeamCode(code);
  return Boolean(NFL_TEAMS[norm]);
}

/**
 * Returns metadata for a given team code.
 * 
 * @param {string} code Team code or alias
 * @returns {typeof NFL_TEAMS[keyof typeof NFL_TEAMS] | null} Team metadata or null if not found
 */
function getTeam(code) {
  const norm = normalizeTeamCode(code);
  return NFL_TEAMS[norm] || null;
}

/**
 * Returns the CDN logo URL for an NFL franchise.
 * 
 * @param {string} code Team code
 * @returns {string} HTTPS URL to high-resolution PNG logo
 */
function getTeamLogoUrl(code) {
  const norm = normalizeTeamCode(code);
  // ESPN CDN team logo endpoint format
  const espnLookup = (norm === "WAS") ? "wsh" : (norm === "JAC") ? "jax" : norm.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${espnLookup}.png`;
}

/**
 * Returns all 32 teams as an array.
 * 
 * @returns {Array<typeof NFL_TEAMS[keyof typeof NFL_TEAMS]>}
 */
function getAllTeams() {
  return Object.values(NFL_TEAMS);
}

/**
 * Returns all teams within a specific conference and division.
 * 
 * @param {'AFC'|'NFC'} conference Conference filter
 * @param {'East'|'North'|'South'|'West'} division Division filter
 * @returns {Array<typeof NFL_TEAMS[keyof typeof NFL_TEAMS]>}
 */
function getTeamsByDivision(conference, division) {
  return Object.values(NFL_TEAMS).filter(
    t => t.conference === conference && t.division === division
  );
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NFL_TEAMS,
    TEAM_ALIASES,
    normalizeTeamCode,
    isValidTeam,
    getTeam,
    getTeamLogoUrl,
    getAllTeams,
    getTeamsByDivision
  };
}
if (typeof window !== "undefined") {
  window.TeamsUtil = {
    NFL_TEAMS,
    TEAM_ALIASES,
    normalizeTeamCode,
    isValidTeam,
    getTeam,
    getTeamLogoUrl,
    getAllTeams,
    getTeamsByDivision
  };
}
