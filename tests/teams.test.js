/**
 * @fileoverview Unit tests for NFL 32-Team Directory and Abbreviation Normalizer.
 */

const {
  NFL_TEAMS,
  normalizeTeamCode,
  isValidTeam,
  getTeam,
  getTeamLogoUrl,
  getAllTeams,
  getTeamsByDivision
} = require("../src/utils/teams.js");

function runTeamsTests(assert) {
  // 32 Active Franchises
  const allTeams = getAllTeams();
  assert.equal(allTeams.length, 32, "NFL contains exactly 32 canonical franchises");

  // Normalization aliases
  assert.equal(normalizeTeamCode("wsh"), "WAS", "Lowercase 'wsh' normalizes to WAS");
  assert.equal(normalizeTeamCode("WSH"), "WAS", "Uppercase 'WSH' normalizes to WAS");
  assert.equal(normalizeTeamCode("JAX"), "JAC", "'JAX' normalizes to JAC");
  assert.equal(normalizeTeamCode("OAK"), "LV", "'OAK' normalizes to LV");
  assert.equal(normalizeTeamCode("SD"), "LAC", "'SD' normalizes to LAC");
  assert.equal(normalizeTeamCode("STL"), "LAR", "'STL' normalizes to LAR");
  assert.equal(normalizeTeamCode("KC"), "KC", "'KC' remains canonical KC");

  // Team Validation
  assert.equal(isValidTeam("BUF"), true, "BUF is valid team");
  assert.equal(isValidTeam("WSH"), true, "WSH alias resolves to valid team");
  assert.equal(isValidTeam("XYZ"), false, "Non-existent code 'XYZ' is invalid");

  // Metadata retrieval
  const kc = getTeam("KC");
  assert.equal(kc.name, "Kansas City Chiefs", "KC team name is Kansas City Chiefs");
  assert.equal(kc.conference, "AFC", "KC conference is AFC");
  assert.equal(kc.division, "West", "KC division is West");
  assert.equal(kc.primaryColor, "#E31837", "KC primary color matches hex");

  // Division groupings
  const nfcEast = getTeamsByDivision("NFC", "East");
  assert.equal(nfcEast.length, 4, "NFC East contains exactly 4 teams");
  const nfcEastCodes = nfcEast.map(t => t.code).sort();
  assert.deepEqual(nfcEastCodes, ["DAL", "NYG", "PHI", "WAS"], "NFC East contains DAL, NYG, PHI, WAS");

  // Logo URL endpoint
  const wasLogo = getTeamLogoUrl("WAS");
  assert.equal(wasLogo.includes("espncdn.com"), true, "Logo URL references official ESPN CDN");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { runTeamsTests };
}

