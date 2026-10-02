/**
 * OG LEAGUE LIVE - Standalone View-Only Mobile Engine
 * Real-time sync with Google Sheets, mobile navigation, week switching,
 * player scorecards, live standings, split matchups, and closest score bonus calculations.
 */

// =========================================================
// CONFIGURATION & CONSTANTS
// =========================================================
const SPREADSHEET_ID = "1BkP2oqUWAo5U8b0AItv5Y6kR8kttj3jREvmkx9Sk8B4";

const WEEK_GIDS = {
  1: "0",
  2: "1638561232",
  3: "1384709317",
  4: "2071520596",
  5: "1478203859",
  6: "2011037307",
  7: "1916327315",
  8: "1228224528",
  9: "104523996",
  10: "1729015843",
  11: "1716385848",
  12: "1546765721",
  13: "405391307",
  14: "671043818",
  15: "1109040338",
  16: "62232532",
  17: "297779354",
  18: "657231217"
};

const NFL_STANDINGS_GID = "497949847";

/**
 * Official 2026 NFL Regular Season Week Start Dates.
 * Every week begins on Wednesday (the day before Thursday Night Football) at 00:00:00 local time:
 * - Week 1: Wed Sep 9, 2026
 * - Week 2: Wed Sep 16, 2026
 * - Week 3: Wed Sep 23, 2026
 * - Week 4: Wed Sep 30, 2026 (Today)
 * - Week 5: Wed Oct 7, 2026
 * ...
 * - Week 18: Wed Jan 6, 2027
 */
const NFL_2026_WEEK_STARTS = [
  "2026-09-09", // Week 1 (Wed)
  "2026-09-16", // Week 2 (Wed)
  "2026-09-23", // Week 3 (Wed)
  "2026-09-30", // Week 4 (Wed)
  "2026-10-07", // Week 5 (Wed)
  "2026-10-14", // Week 6 (Wed)
  "2026-10-21", // Week 7 (Wed)
  "2026-10-28", // Week 8 (Wed)
  "2026-11-04", // Week 9 (Wed)
  "2026-11-11", // Week 10 (Wed)
  "2026-11-18", // Week 11 (Wed)
  "2026-11-25", // Week 12 (Wed)
  "2026-12-02", // Week 13 (Wed)
  "2026-12-09", // Week 14 (Wed)
  "2026-12-16", // Week 15 (Wed)
  "2026-12-23", // Week 16 (Wed)
  "2026-12-30", // Week 17 (Wed)
  "2027-01-06"  // Week 18 (Wed)
];

/**
 * Returns the current NFL week number (1 to 18) based on today's local date.
 * Switches to the upcoming week every Wednesday at midnight.
 */
function getCurrentNFLWeek(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${day}`;

  let week = 1;
  for (let i = 0; i < NFL_2026_WEEK_STARTS.length; i++) {
    if (todayStr >= NFL_2026_WEEK_STARTS[i]) {
      week = i + 1;
    } else {
      break;
    }
  }
  return Math.min(18, Math.max(1, week));
}

// 12 Players in exact spreadsheet column sequence (Jon at Col 6 / 0-indexed)
const PLAYERS = [
  "Jon", "Alisha", "Carson", "Nok", "Mango", "Caleb",
  "Ross", "Dishman", "Ethan", "Brett", "Wells", "Rob"
];

const PLAYER_COLORS = {
  "Jon": "#00338D", // Buffalo Bills Blue (BUF)
  "Alisha": "#c084fc", // Lilac Purple
  "Carson": "#E31837", // Kansas City Chiefs Red (KC)
  "Nok": "#241773", // Baltimore Ravens Purple (BAL)
  "Mango": "#AA0000", // San Francisco 49ers Red (SF)
  "Caleb": "#007AC1",
  "Ross": "#FFD700", // Gold
  "Dishman": "#00e5ff",
  "Ethan": "#125740", // New York Jets Green (NYJ)
  "Brett": "#F9649B", // Headband Pink
  "Wells": "#002C5F", // Indianapolis Colts Blue (IND)
  "Rob": "#000000" // Las Vegas Raiders Black (LV)
};

// Player Avatars / Profile Pictures
// Extensible mapping for all 12 league players. Fallbacks to initial avatar if image not set or fails to load.
const PLAYER_AVATARS = {
  "Jon": "avatars/jon.jpg",
  "Alisha": "avatars/alisha.jpg",
  "Carson": "avatars/carson.jpg?v=2",
  "Nok": "avatars/nok.jpg?v=2",
  "Mango": "avatars/mango.jpg",
  "Ross": "avatars/ross.jpg",
  "Caleb": "avatars/caleb.jpg",
  "Ethan": "avatars/ethan.jpg",
  "Wells": "avatars/wells.jpg",
  "Brett": "avatars/brett.jpg",
  "Rob": "avatars/rob.jpg",
  "Dishman": "avatars/dishman.jpg"
};

function getPlayerAvatarHtml(playerName, size = 36) {
  const avatarUrl = PLAYER_AVATARS[playerName];
  const color = PLAYER_COLORS[playerName] || "var(--accent-blue)";
  const initial = playerName ? playerName.charAt(0).toUpperCase() : "?";
  const borderWidth = size <= 28 ? 1.5 : 2.5;
  const shadow = size <= 28
    ? `0 1px 4px rgba(0, 0, 0, 0.4)`
    : `0 0 10px ${color}55, 0 2px 8px rgba(0, 0, 0, 0.45)`;

  if (avatarUrl) {
    return `
      <div class="player-avatar has-photo" style="width:${size}px; height:${size}px; min-width:${size}px; border: ${borderWidth}px solid ${color}; box-shadow: ${shadow};">
        <img src="${avatarUrl}" alt="${playerName}" class="player-avatar-img" onerror="this.parentElement.classList.remove('has-photo'); this.remove();" />
        <span class="player-avatar-fallback" style="background: linear-gradient(135deg, ${color} 0%, #182337 100%); font-size:${Math.max(9, Math.round(size * 0.42))}px;">${initial}</span>
      </div>
    `;
  }

  return `
    <div class="player-avatar" style="width:${size}px; height:${size}px; min-width:${size}px; background: linear-gradient(135deg, ${color} 0%, #182337 100%); font-size:${Math.max(9, Math.round(size * 0.42))}px; border:${borderWidth}px solid ${color};">
      ${initial}
    </div>
  `;
}

// Official NFL Team Colors and Metadata (matching Main Project & Spreadsheet)
const NFL_TEAMS = {
  KC:  { code: 'KC',  name: 'Kansas City Chiefs',     city: 'Kansas City', conf: 'AFC', div: 'West',  color: '#E31837', alt: '#FFB81C' },
  LV:  { code: 'LV',  name: 'Las Vegas Raiders',      city: 'Las Vegas',   conf: 'AFC', div: 'West',  color: '#000000', alt: '#A5ACAF' },
  DEN: { code: 'DEN', name: 'Denver Broncos',         city: 'Denver',      conf: 'AFC', div: 'West',  color: '#FB4F14', alt: '#002244' },
  LAC: { code: 'LAC', name: 'Los Angeles Chargers',   city: 'Los Angeles', conf: 'AFC', div: 'West',  color: '#0080C6', alt: '#FFC20E' },
  BUF: { code: 'BUF', name: 'Buffalo Bills',          city: 'Buffalo',     conf: 'AFC', div: 'East',  color: '#00338D', alt: '#C60C30' },
  MIA: { code: 'MIA', name: 'Miami Dolphins',         city: 'Miami',       conf: 'AFC', div: 'East',  color: '#008E97', alt: '#FC4C02' },
  NYJ: { code: 'NYJ', name: 'New York Jets',          city: 'New York',    conf: 'AFC', div: 'East',  color: '#125740', alt: '#000000' },
  NE:  { code: 'NE',  name: 'New England Patriots',    city: 'New England', conf: 'AFC', div: 'East',  color: '#002244', alt: '#C60C30' },
  BAL: { code: 'BAL', name: 'Baltimore Ravens',       city: 'Baltimore',   conf: 'AFC', div: 'North', color: '#241773', alt: '#000000' },
  CLE: { code: 'CLE', name: 'Cleveland Browns',       city: 'Cleveland',   conf: 'AFC', div: 'North', color: '#311D00', alt: '#FF3C00' },
  PIT: { code: 'PIT', name: 'Pittsburgh Steelers',    city: 'Pittsburgh',  conf: 'AFC', div: 'North', color: '#FFB612', alt: '#101820' },
  CIN: { code: 'CIN', name: 'Cincinnati Bengals',     city: 'Cincinnati',  conf: 'AFC', div: 'North', color: '#FB4F14', alt: '#000000' },
  HOU: { code: 'HOU', name: 'Houston Texans',         city: 'Houston',     conf: 'AFC', div: 'South', color: '#A71930', alt: '#042131' },
  JAX: { code: 'JAX', name: 'Jacksonville Jaguars',   city: 'Jacksonville',conf: 'AFC', div: 'South', color: '#006778', alt: '#D7A22A' },
  IND: { code: 'IND', name: 'Indianapolis Colts',     city: 'Indianapolis',conf: 'AFC', div: 'South', color: '#002C5F', alt: '#A2AAAD' },
  TEN: { code: 'TEN', name: 'Tennessee Titans',       city: 'Tennessee',   conf: 'AFC', div: 'South', color: '#4B92DB', alt: '#0C2340' },
  SF:  { code: 'SF',  name: 'San Francisco 49ers',    city: 'San Francisco',conf: 'NFC', div: 'West', color: '#AA0000', alt: '#B3995D' },
  LAR: { code: 'LAR', name: 'Los Angeles Rams',       city: 'Los Angeles', conf: 'NFC', div: 'West',  color: '#003594', alt: '#FFA300' },
  SEA: { code: 'SEA', name: 'Seattle Seahawks',       city: 'Seattle',     conf: 'NFC', div: 'West',  color: '#69BE28', alt: '#002244' },
  AZ:  { code: 'AZ',  name: 'Arizona Cardinals',      city: 'Arizona',     conf: 'NFC', div: 'West',  color: '#97233F', alt: '#000000' },
  DAL: { code: 'DAL', name: 'Dallas Cowboys',         city: 'Dallas',      conf: 'NFC', div: 'East',  color: '#041E42', alt: '#869397' },
  PHI: { code: 'PHI', name: 'Philadelphia Eagles',    city: 'Philadelphia',conf: 'NFC', div: 'East',  color: '#004C54', alt: '#A5ACAF' },
  NYG: { code: 'NYG', name: 'New York Giants',        city: 'New York',    conf: 'NFC', div: 'East',  color: '#0B2265', alt: '#A71930' },
  WSH: { code: 'WSH', name: 'Washington Commanders',  city: 'Washington',  conf: 'NFC', div: 'East',  color: '#5A1414', alt: '#FFB612' },
  DET: { code: 'DET', name: 'Detroit Lions',          city: 'Detroit',     conf: 'NFC', div: 'North', color: '#0076B6', alt: '#B0B7BC' },
  GB:  { code: 'GB',  name: 'Green Bay Packers',      city: 'Green Bay',   conf: 'NFC', div: 'North', color: '#203731', alt: '#FFB612' },
  MIN: { code: 'MIN', name: 'Minnesota Vikings',      city: 'Minnesota',   conf: 'NFC', div: 'North', color: '#4F2683', alt: '#FFC62F' },
  CHI: { code: 'CHI', name: 'Chicago Bears',          city: 'Chicago',     conf: 'NFC', div: 'North', color: '#C83803', alt: '#0B162A' },
  TB:  { code: 'TB',  name: 'Tampa Bay Buccaneers',   city: 'Tampa Bay',   conf: 'NFC', div: 'South', color: '#D50A0A', alt: '#0A0A08' },
  NO:  { code: 'NO',  name: 'New Orleans Saints',     city: 'New Orleans', conf: 'NFC', div: 'South', color: '#D3BC8D', alt: '#101820' },
  ATL: { code: 'ATL', name: 'Atlanta Falcons',        city: 'Atlanta',     conf: 'NFC', div: 'South', color: '#A71930', alt: '#000000' },
  CAR: { code: 'CAR', name: 'Carolina Panthers',      city: 'Carolina',    conf: 'NFC', div: 'South', color: '#0085CA', alt: '#101820' },
  // Aliases
  ARI: { code: 'AZ',  name: 'Arizona Cardinals',      city: 'Arizona',     conf: 'NFC', div: 'West',  color: '#97233F', alt: '#000000' },
  WAS: { code: 'WSH', name: 'Washington Commanders',  city: 'Washington',  conf: 'NFC', div: 'East',  color: '#5A1414', alt: '#FFB612' },
  LA:  { code: 'LAR', name: 'Los Angeles Rams',       city: 'Los Angeles', conf: 'NFC', div: 'West',  color: '#003594', alt: '#FFA300' },
  JAC: { code: 'JAX', name: 'Jacksonville Jaguars',   city: 'Jacksonville',conf: 'AFC', div: 'South', color: '#006778', alt: '#D7A22A' }
};

function getTeamContrastColor(hexColor) {
  if (!hexColor || hexColor.charAt(0) !== '#') return '#ffffff';
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 140) ? '#0a0e17' : '#ffffff';
}

// Robust Team Code Aliases Dictionary
// Normalizes team abbreviations across different data sources (ESPN vs Sheets vs Project)
// E.g., WAS -> WSH, ARI -> AZ, LA -> LAR, JAC -> JAX, etc.
const TEAM_ALIASES = {
  // Arizona Cardinals
  ARI: "AZ",
  AZ: "AZ",
  // Washington Commanders / Football Team / Redskins
  WAS: "WSH",
  WSH: "WSH",
  // Jacksonville Jaguars
  JAC: "JAX",
  JAX: "JAX",
  // Los Angeles Rams
  LA: "LAR",
  LAR: "LAR",
  RAMS: "LAR",
  // Los Angeles Chargers
  SD: "LAC",
  LAC: "LAC",
  CHARGERS: "LAC",
  // Las Vegas Raiders
  OAK: "LV",
  LV: "LV",
  RAIDERS: "LV"
};

/**
 * Returns canonical team abbreviation (matching NFL_TEAMS keys).
 */
function normalizeTeamCode(code) {
  if (!code) return "";
  const cleaned = String(code).trim().toUpperCase();
  return TEAM_ALIASES[cleaned] || cleaned;
}

// =========================================================
// APPLICATION STATE
// =========================================================
const SAVED_USER_KEY = "og_league_my_player";
let initialSavedPlayer = null;
try {
  const stored = localStorage.getItem(SAVED_USER_KEY);
  if (stored && PLAYERS.includes(stored)) {
    initialSavedPlayer = stored;
  }
} catch (e) {
  console.warn("localStorage unavailable:", e);
}

let state = {
  currentWeek: getCurrentNFLWeek(),
  myPlayer: initialSavedPlayer,
  selectedPlayer: initialSavedPlayer || "Caleb",
  activeTab: "leaderboard",
  leaderboardMode: "season", // "season" | "weekly"
  playerViewMode: "single", // "single" | "h2h"
  h2hPlayerA: null,
  h2hPlayerB: null,
  h2hFilter: "swing", // "swing" | "agreed" | "all"
  isSyncing: false,
  lastUpdated: null,
  data: null,
  nflStandings: null,
  collapsedMatchups: new Set()
};

// Navigation state persistence key for sessionStorage
const NAV_STATE_KEY = "og_league_nav_state";

/**
 * Saves current navigation snapshot into sessionStorage and synchronizes URL hash.
 */
function saveNavState() {
  try {
    const nav = {
      activeTab: state.activeTab,
      currentWeek: state.currentWeek,
      leaderboardMode: state.leaderboardMode,
      playerViewMode: state.playerViewMode,
      selectedPlayer: state.selectedPlayer,
      h2hPlayerA: state.h2hPlayerA,
      h2hPlayerB: state.h2hPlayerB,
      h2hFilter: state.h2hFilter
    };
    sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(nav));
  } catch (e) {
    // sessionStorage unavailable in private mode or quota exceeded
  }
  syncUrlHash();
}

/**
 * Synchronizes browser URL hash without cluttering browser history.
 */
function syncUrlHash() {
  try {
    const tab = state.activeTab || "leaderboard";
    const params = new URLSearchParams();
    if (state.currentWeek && state.currentWeek !== getCurrentNFLWeek()) {
      params.set("week", state.currentWeek);
    }
    if (tab === "players") {
      if (state.playerViewMode === "h2h") {
        params.set("mode", "h2h");
        if (state.h2hPlayerA) params.set("a", state.h2hPlayerA);
        if (state.h2hPlayerB) params.set("b", state.h2hPlayerB);
        if (state.h2hFilter && state.h2hFilter !== "swing") params.set("f", state.h2hFilter);
      } else {
        if (state.selectedPlayer) params.set("p", state.selectedPlayer);
      }
    } else if (tab === "leaderboard") {
      if (state.leaderboardMode === "weekly") {
        params.set("mode", "weekly");
      }
    }
    const q = params.toString();
    const targetHash = q ? `#${tab}?${q}` : `#${tab}`;
    if (window.location.hash !== targetHash) {
      history.replaceState(null, "", targetHash);
    }
  } catch (e) {}
}

/**
 * Restores navigation snapshot from URL hash or sessionStorage.
 */
function restoreNavState() {
  const validTabs = ["leaderboard", "matchups", "players", "nfl", "rules"];
  let restoredFromHash = false;

  // 1. Try URL Hash first
  try {
    const rawHash = window.location.hash ? window.location.hash.replace(/^#/, "").trim() : "";
    if (rawHash) {
      const parts = rawHash.split("?");
      const tab = parts[0];
      if (validTabs.includes(tab)) {
        state.activeTab = tab;
        restoredFromHash = true;

        if (parts[1]) {
          const params = new URLSearchParams(parts[1]);
          if (params.has("week")) {
            const w = parseInt(params.get("week"), 10);
            if (w >= 1 && w <= 18) state.currentWeek = w;
          }
          if (params.has("p") && PLAYERS.includes(params.get("p"))) {
            state.selectedPlayer = params.get("p");
          }
          if (params.has("mode")) {
            const m = params.get("mode");
            if (m === "h2h" || m === "single") state.playerViewMode = m;
            if (m === "season" || m === "weekly") state.leaderboardMode = m;
          }
          if (params.has("a") && PLAYERS.includes(params.get("a"))) {
            state.h2hPlayerA = params.get("a");
          }
          if (params.has("b") && PLAYERS.includes(params.get("b"))) {
            state.h2hPlayerB = params.get("b");
          }
          if (params.has("f") && ["swing", "agreed", "all"].includes(params.get("f"))) {
            state.h2hFilter = params.get("f");
          }
        }
      }
    }
  } catch (e) {
    console.warn("Error parsing URL hash:", e);
  }

  // 2. Fallback to sessionStorage
  if (!restoredFromHash) {
    try {
      const raw = sessionStorage.getItem(NAV_STATE_KEY);
      if (raw) {
        const nav = JSON.parse(raw);
        if (nav.activeTab && validTabs.includes(nav.activeTab)) {
          state.activeTab = nav.activeTab;
        }
        if (typeof nav.currentWeek === "number" && nav.currentWeek >= 1 && nav.currentWeek <= 18) {
          state.currentWeek = nav.currentWeek;
        }
        if (nav.leaderboardMode === "season" || nav.leaderboardMode === "weekly") {
          state.leaderboardMode = nav.leaderboardMode;
        }
        if (nav.playerViewMode === "single" || nav.playerViewMode === "h2h") {
          state.playerViewMode = nav.playerViewMode;
        }
        if (nav.selectedPlayer && PLAYERS.includes(nav.selectedPlayer)) {
          state.selectedPlayer = nav.selectedPlayer;
        }
        if (nav.h2hPlayerA && PLAYERS.includes(nav.h2hPlayerA)) {
          state.h2hPlayerA = nav.h2hPlayerA;
        }
        if (nav.h2hPlayerB && PLAYERS.includes(nav.h2hPlayerB)) {
          state.h2hPlayerB = nav.h2hPlayerB;
        }
        if (nav.h2hFilter && ["swing", "agreed", "all"].includes(nav.h2hFilter)) {
          state.h2hFilter = nav.h2hFilter;
        }
      }
    } catch (e) {
      console.warn("Error restoring nav state from sessionStorage:", e);
    }
  }

  // Ensure activeWeek in data matches restored currentWeek
  if (state.data) {
    state.data.activeWeek = `Week ${state.currentWeek}`;
  }

  // Ensure valid H2H players if in H2H mode
  if (state.playerViewMode === "h2h") {
    if (!state.h2hPlayerA) state.h2hPlayerA = state.selectedPlayer || PLAYERS[0];
    if (!state.h2hPlayerB) {
      state.h2hPlayerB = (state.myPlayer && state.myPlayer !== state.h2hPlayerA)
        ? state.myPlayer
        : (PLAYERS.find(p => p !== state.h2hPlayerA) || PLAYERS[1]);
    }
  }
}

// =========================================================
// CORE SCORING & CLOSEST BONUS ENGINE
// =========================================================

/**
 * Calculates pick points, closest score bonus, and exact score bonus for a single game.
 * Exact formula from Master.xlsx:
 * - Base points: 10 PTS for picking winner (30 PTS if 3X multiplier).
 * - Closest bonus: Only players who picked the winner are eligible.
 *   diff = |pAway - actualAway| + |pHome - actualHome|
 *   minDiff = min(diffs of winner pickers).
 *   If minDiff === 0 (Exact Score): +50 bonus pts (or 25 pts each if tied; tripled on 3X).
 *   If minDiff > 0 (Closest Score): +10 bonus pts (or 5 pts each if tied; tripled on 3X).
 *   Total pick points = basePoints + bonusPoints.
 */
function calculateGamePicksPoints(game) {
  if (!game || !game.picks || !game.matchup || !game.matchup.includes("@")) return;

  const parts = game.matchup.split("@").map(s => s.trim().toUpperCase());
  if (parts.length !== 2) return;
  const awayTeam = parts[0];
  const homeTeam = parts[1];

  const awayScore = (game.awayScore !== null && game.awayScore !== "" && !isNaN(game.awayScore)) ? Number(game.awayScore) : null;
  const homeScore = (game.homeScore !== null && game.homeScore !== "" && !isNaN(game.homeScore)) ? Number(game.homeScore) : null;
  let winner = (game.winner || "").toUpperCase().trim();

  // If winner is missing but scores exist, determine winner from matchup
  if (!winner && awayScore !== null && homeScore !== null) {
    if (awayScore > homeScore) winner = awayTeam;
    else if (homeScore > awayScore) winner = homeTeam;
    else if (awayScore === homeScore) winner = "TIE";
    game.winner = winner;
  }

  const isValidWinner = (
    winner === awayTeam || winner === homeTeam || winner === "TIE" ||
    normalizeTeamCode(winner) === normalizeTeamCode(awayTeam) ||
    normalizeTeamCode(winner) === normalizeTeamCode(homeTeam)
  );

  // If game is actively live (in progress), it is NOT final yet
  if (game.isLive) {
    game.isFinal = false;
  } else if (game.isFinal) {
    // Retain explicitly finalized state
    game.isFinal = true;
  } else if (awayScore !== null && homeScore !== null && isValidWinner) {
    game.isFinal = true;
  } else {
    game.isFinal = false;
  }

  const isFinal = !!game.isFinal;

  // Reset defaults for all players
  PLAYERS.forEach(pName => {
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
    return;
  }

  const normWinner = normalizeTeamCode(winner);

  // 1. Identify all players who picked the winning team and compute error diff
  const winningPickers = [];
  PLAYERS.forEach(pName => {
    const pk = game.picks[pName];
    if (!pk || !pk.winner) return;

    const pkWinnerNorm = normalizeTeamCode(pk.winner);
    if (pk.winner.toUpperCase().trim() === winner || pkWinnerNorm === normWinner) {
      const pAway = (pk.awayScore !== null && pk.awayScore !== "" && !isNaN(pk.awayScore)) ? Number(pk.awayScore) : null;
      const pHome = (pk.homeScore !== null && pk.homeScore !== "" && !isNaN(pk.homeScore)) ? Number(pk.homeScore) : null;

      if (pAway !== null && pHome !== null) {
        const diff = Math.abs(pAway - awayScore) + Math.abs(pHome - homeScore);
        pk.diff = diff;
        winningPickers.push({ name: pName, diff });
      } else {
        winningPickers.push({ name: pName, diff: Infinity });
      }
    }
  });

  if (winningPickers.length === 0) return;

  // 2. Find minDiff among winning pickers
  let minDiff = Infinity;
  let closestPickers = [];

  winningPickers.forEach(wp => {
    if (wp.diff < minDiff) {
      minDiff = wp.diff;
      closestPickers = [wp.name];
    } else if (wp.diff === minDiff && minDiff !== Infinity) {
      closestPickers.push(wp.name);
    }
  });

  const tieCount = closestPickers.length;
  const isExact = (minDiff === 0);

  // 3. Award base points + closest / exact bonus points
  PLAYERS.forEach(pName => {
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
          pk.exact = false;
          const bonusPool = (tieCount > 1) ? 5 : 10;
          bonusPoints = bonusPool * mult;
        }
      }

      pk.basePoints = basePoints;
      pk.bonusPoints = bonusPoints;
      pk.points = basePoints + bonusPoints;
    } else {
      pk.points = 0;
      pk.basePoints = 0;
      pk.bonusPoints = 0;
      pk.isClosest = false;
      pk.exact = false;
    }
  });
}

/**
 * Dynamically computes overall Season Leaderboard by summing pick points across all weeks in data.
 * Optionally limits accumulation up to throughWeek (e.g. for historical week standings).
 */
function computeSeasonLeaderboard(dataObj, throughWeek = null) {
  const data = dataObj || state.data;
  const maxW = (throughWeek !== null && throughWeek !== undefined) ? throughWeek : 18;
  const list = PLAYERS.map(pName => {
    let totalPts = 0;
    if (data && data.weeks) {
      for (let w = 1; w <= maxW; w++) {
        const week = data.weeks[`Week ${w}`];
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

    return {
      name: pName,
      points: totalPts,
      rec: getPlayerSeasonRecord(pName, throughWeek)
    };
  });

  // Sort descending by points
  list.sort((a, b) => b.points - a.points);

  // Assign shared ranks based off of points only
  let currentRank = 1;
  for (let i = 0; i < list.length; i++) {
    if (i > 0 && list[i].points < list[i - 1].points) {
      currentRank = i + 1;
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
 * Recalculates all game picks points across all weeks in data and updates dynamic season leaderboard.
 */
function recalculateAllWeeksPoints(dataObj) {
  if (!dataObj || !dataObj.weeks) return;
  Object.keys(dataObj.weeks).forEach(wKey => {
    const w = dataObj.weeks[wKey];
    if (w && w.games && Array.isArray(w.games)) {
      w.games.forEach(g => calculateGamePicksPoints(g));
    }
  });

  // Keep leaderboard dynamically synchronized with game points
  dataObj.leaderboard = computeSeasonLeaderboard(dataObj);
}

/**
 * Calculates season-long Win-Loss record for a player across all finalized games.
 * Optionally limits accumulation up to throughWeek.
 */
function getPlayerSeasonRecord(playerName, throughWeek = null) {
  let wins = 0;
  let losses = 0;

  if (state.data && state.data.weeks) {
    const maxW = (throughWeek !== null && throughWeek !== undefined) ? throughWeek : 18;
    for (let w = 1; w <= maxW; w++) {
      const weekKey = `Week ${w}`;
      const week = state.data.weeks[weekKey];
      if (!week || !week.games) continue;
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
  const pct = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";
  const label = `${wins}-${losses} W-L`;
  return {
    wins,
    losses,
    total,
    pct,
    label,
    text: label
  };
}

/**
 * Calculates a player's Win-Loss record specifically for a single week.
 */
function getPlayerWeekRecord(playerName, weekNum) {
  let wins = 0;
  let losses = 0;
  const weekKey = `Week ${weekNum}`;
  if (state.data && state.data.weeks && state.data.weeks[weekKey] && state.data.weeks[weekKey].games) {
    const week = state.data.weeks[weekKey];
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
  const total = wins + losses;
  const pct = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";
  const label = `${wins}-${losses} W-L`;
  return {
    wins,
    losses,
    total,
    pct,
    label,
    text: label
  };
}

/**
 * Calculates actual NFL team Win-Loss record entering the specified week (or through all completed games).
 */
function getNFLTeamRecord(teamCode, targetWeek = null) {
  let wins = 0;
  let losses = 0;
  let ties = 0;
  const normTarget = normalizeTeamCode(teamCode);

  if (state.data && state.data.weeks) {
    const maxWeek = (targetWeek !== null) ? Math.max(0, targetWeek - 1) : 18;

    for (let w = 1; w <= maxWeek; w++) {
      const wKey = `Week ${w}`;
      const wData = state.data.weeks[wKey];
      if (!wData || !wData.games) continue;

      for (let g of wData.games) {
        if (!g || !g.matchup || !g.isFinal) continue;
        const parts = g.matchup.split("@").map(s => s.trim());
        if (parts.length !== 2) continue;
        const away = normalizeTeamCode(parts[0]);
        const home = normalizeTeamCode(parts[1]);

        if (away !== normTarget && home !== normTarget) continue;

        const normWinner = normalizeTeamCode(g.winner);
        if (normWinner === normTarget) {
          wins++;
        } else if (normWinner === "TIE" || (g.awayScore !== null && g.awayScore === g.homeScore)) {
          ties++;
        } else if (normWinner) {
          losses++;
        } else if (g.awayScore !== null && g.homeScore !== null) {
          if (away === normTarget) {
            if (g.awayScore > g.homeScore) wins++;
            else losses++;
          } else if (home === normTarget) {
            if (g.homeScore > g.awayScore) wins++;
            else losses++;
          }
        }
      }
    }
  }

  const text = ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
  return { wins, losses, ties, text };
}

// =========================================================
// INITIALIZATION
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  initData();
  restoreNavState();
  setupNavigation();
  setupWeekStrip();
  setupRefresh();
  setupPullToRefresh();
  renderApp();
  
  // Background live sync
  syncWeek(state.currentWeek);
  syncNFLStandings();

  // Auto-sync every 60 seconds (snappy live NFL score updates)
  setInterval(() => {
    if (!document.hidden && !state.isSyncing) {
      syncWeek(state.currentWeek, true);
    }
  }, 60000);
});

function sanitizeData(dataObj) {
  if (!dataObj || !dataObj.weeks) return;
  Object.keys(dataObj.weeks).forEach(wKey => {
    const w = dataObj.weeks[wKey];
    if (w && w.games && Array.isArray(w.games)) {
      // Filter out any non-NFL matchup rows (bye week summary rows, etc.)
      w.games = w.games.filter(g => g && g.matchup && g.matchup.includes("@"));

      // Validate that final games have valid teams and scores
      w.games.forEach(g => {
        const parts = g.matchup.split("@").map(s => s.trim().toUpperCase());
        const winner = (g.winner || "").toUpperCase().trim();
        const normWinner = normalizeTeamCode(winner);
        const normAway = normalizeTeamCode(parts[0]);
        const normHome = normalizeTeamCode(parts[1]);
        const isValidWinner = parts.length === 2 && (
          normWinner === normAway || normWinner === normHome || normWinner === "TIE"
        );
        const hasScores = (g.awayScore !== null && g.awayScore !== "" && !isNaN(g.awayScore) &&
                           g.homeScore !== null && g.homeScore !== "" && !isNaN(g.homeScore));

        if (g.isLive) {
          g.isFinal = false;
        } else if (!isValidWinner || !hasScores) {
          g.isFinal = false;
          if (!hasScores) {
            g.awayScore = null;
            g.homeScore = null;
            g.winner = "";
          }
        }
      });
    }
  });
}

/**
 * Initialize data from local storage or baseline data.js
 */
function initData() {
  // Purge legacy un-sanitized cache
  try {
    localStorage.removeItem("og_league_cache");
    localStorage.removeItem("og_league_cache_v6");
  } catch (e) {}

  const cached = localStorage.getItem("og_league_cache_v9") || localStorage.getItem("og_league_cache_v8");
  if (cached) {
    try {
      state.data = JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse error", e);
    }
  }

  if (!state.data && typeof OG_LEAGUE_INITIAL_DATA !== "undefined") {
    state.data = JSON.parse(JSON.stringify(OG_LEAGUE_INITIAL_DATA));
  }

  // Sanitize any phantom rows or invalid finals and recalculate
  if (state.data) {
    sanitizeData(state.data);
    recalculateAllWeeksPoints(state.data);
    try {
      localStorage.setItem("og_league_cache_v9", JSON.stringify(state.data));
    } catch (e) {}
  }

  // Default to current NFL week based on Wednesday rollover schedule
  state.currentWeek = getCurrentNFLWeek();

  if (state.data) {
    state.data.activeWeek = `Week ${state.currentWeek}`;
  }

  // Pre-seed default top player if no profile remembered
  if (state.data && state.data.leaderboard && state.data.leaderboard.length > 0) {
    if (!state.myPlayer) {
      state.selectedPlayer = state.data.leaderboard[0].name;
    }
  }
}

// =========================================================
// NAVIGATION & EVENT LISTENERS
// =========================================================
function setupNavigation() {
  const navBtns = document.querySelectorAll(".bottom-nav .nav-item");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab");
      // When tapping bottom nav 'Players' tab directly, take user home to their own profile
      if (tabId === "players" && state.myPlayer) {
        state.selectedPlayer = state.myPlayer;
        state.playerViewMode = "single";
      }
      switchTab(tabId);
    });
  });
}

function switchTab(tabId, smoothScroll = true) {
  const validTabs = ["leaderboard", "matchups", "players", "nfl", "rules"];
  if (!validTabs.includes(tabId)) tabId = "leaderboard";
  state.activeTab = tabId;
  
  // Update nav buttons
  document.querySelectorAll(".bottom-nav .nav-item").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
  });

  // Update tab views
  document.querySelectorAll(".tab-view").forEach(view => {
    view.classList.toggle("active", view.id === `tab-${tabId}`);
  });

  if (smoothScroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  renderTabContent();
  saveNavState();
}

function setupWeekStrip() {
  const strip = document.getElementById("week-strip-scroll");
  if (!strip) return;
  strip.innerHTML = "";

  for (let w = 1; w <= 18; w++) {
    const pill = document.createElement("button");
    pill.className = `strip-pill ${w === state.currentWeek ? "active" : ""}`;
    pill.textContent = `Week ${w}`;
    pill.setAttribute("data-week", w);
    pill.addEventListener("click", () => {
      selectWeek(w);
    });
    strip.appendChild(pill);
  }

  // Arrow buttons
  const prevBtn = document.getElementById("week-prev-btn");
  const nextBtn = document.getElementById("week-next-btn");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (state.currentWeek > 1) {
        selectWeek(state.currentWeek - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (state.currentWeek < 18) {
        selectWeek(state.currentWeek + 1);
      }
    });
  }

  updateStripButtons();
  setTimeout(() => updateStripButtons(), 60);
}

function updateStripButtons() {
  const prevBtn = document.getElementById("week-prev-btn");
  const nextBtn = document.getElementById("week-next-btn");
  if (prevBtn) prevBtn.disabled = state.currentWeek <= 1;
  if (nextBtn) nextBtn.disabled = state.currentWeek >= 18;

  // Center active week pill
  const activePill = document.querySelector(`.strip-pill[data-week="${state.currentWeek}"]`);
  if (activePill) {
    activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
}

function selectWeek(weekNum) {
  state.currentWeek = weekNum;
  document.querySelectorAll(".strip-pill").forEach(p => {
    p.classList.toggle("active", parseInt(p.getAttribute("data-week"), 10) === weekNum);
  });

  updateStripButtons();
  renderTabContent();
  saveNavState();

  // Sync this week's live data if not yet fetched or stale
  syncWeek(weekNum);
}

let isScoresRefreshing = false;

async function triggerScoresRefresh() {
  if (isScoresRefreshing) return;
  isScoresRefreshing = true;

  const indicator = document.getElementById("ptr-indicator");
  const textEl = indicator ? indicator.querySelector(".ptr-text") : null;
  const refreshBtn = document.getElementById("btn-refresh");

  if (refreshBtn) refreshBtn.classList.add("spinning");

  if (indicator) {
    indicator.classList.remove("is-pulling", "is-ready", "is-success");
    indicator.classList.add("is-refreshing");
    if (textEl) textEl.textContent = "Refreshing Scores...";
  }

  // Light haptic pulse on iPhone if supported
  try {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
  } catch (err) {}

  const startTime = Date.now();

  try {
    await Promise.all([
      syncWeek(state.currentWeek, false, false),
      syncNFLStandings(false)
    ]);
  } catch (err) {
    console.warn("Scores refresh error:", err);
  }

  // Ensure at least 650ms for smooth user visual confirmation
  const elapsed = Date.now() - startTime;
  if (elapsed < 650) {
    await new Promise(r => setTimeout(r, 650 - elapsed));
  }

  if (indicator) {
    indicator.classList.remove("is-refreshing");
    indicator.classList.add("is-success");
    if (textEl) textEl.textContent = "✓ Updated!";

    setTimeout(() => {
      indicator.classList.remove("is-success");
      indicator.style.transform = "";
      indicator.style.opacity = "";
      isScoresRefreshing = false;
      if (refreshBtn) refreshBtn.classList.remove("spinning");
    }, 700);
  } else {
    isScoresRefreshing = false;
    if (refreshBtn) refreshBtn.classList.remove("spinning");
  }
}

function setupRefresh() {
  const refreshBtn = document.getElementById("btn-refresh");
  if (!refreshBtn) return;
  refreshBtn.addEventListener("click", () => {
    triggerScoresRefresh();
  });
}

/**
 * Native touch-based Pull-to-Refresh gesture handler.
 * Provides a fluid native iOS app feel inside mobile Safari and standalone Home Screen PWA mode.
 */
function setupPullToRefresh() {
  const indicator = document.getElementById("ptr-indicator");
  if (!indicator) return;

  const textEl = indicator.querySelector(".ptr-text");
  let startY = 0;
  let startX = 0;
  let isTracking = false;
  const THRESHOLD = 65;
  const MAX_PULL = 90;

  window.addEventListener("touchstart", (e) => {
    // Only allow pull to refresh when user is at the very top of the page
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 2 || isScoresRefreshing) {
      isTracking = false;
      return;
    }
    // Don't intercept touches inside open modals
    if (document.querySelector(".profile-modal.open") || document.querySelector(".h2h-picker-modal.open")) {
      isTracking = false;
      return;
    }

    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    isTracking = true;
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isTracking || isScoresRefreshing) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - startY;
    const deltaX = Math.abs(currentX - startX);

    // If horizontal scroll is dominant, don't trigger pull to refresh
    if (deltaX > deltaY) {
      return;
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop > 2) {
      isTracking = false;
      indicator.style.transform = "";
      indicator.style.opacity = "";
      indicator.classList.remove("is-pulling", "is-ready");
      return;
    }

    if (deltaY > 0) {
      // Damping curve for smooth iOS rubber-band feel
      const pull = Math.min(deltaY * 0.45, MAX_PULL);
      indicator.classList.add("is-pulling");
      indicator.style.transform = `translateY(${pull}px)`;
      indicator.style.opacity = `${Math.min(pull / 30, 1)}`;

      if (pull >= THRESHOLD) {
        indicator.classList.add("is-ready");
        if (textEl) textEl.textContent = "Release to refresh";
      } else {
        indicator.classList.remove("is-ready");
        if (textEl) textEl.textContent = "Pull to refresh";
      }
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    if (!isTracking || isScoresRefreshing) {
      isTracking = false;
      return;
    }
    isTracking = false;

    const isReady = indicator.classList.contains("is-ready");
    indicator.classList.remove("is-pulling", "is-ready");

    if (isReady) {
      triggerScoresRefresh();
    } else {
      indicator.style.transform = "";
      indicator.style.opacity = "";
    }
  }, { passive: true });
}

// =========================================================
// AUTOMATED LIVE NFL SCORES (ESPN SCOREBOARD ENGINE)
// =========================================================
/**
 * Formats game quarter references to clean, compact notation (Q1, Q2, Q3, Q4)
 * to avoid confusion with down & distance text (e.g. "12:14 - Q2 • 2nd & 7").
 */
function formatQuarterStatus(text) {
  if (!text || typeof text !== "string") return text || "";
  return text
    .replace(/\b1st\s+Quarter\b/gi, "Q1")
    .replace(/\b2nd\s+Quarter\b/gi, "Q2")
    .replace(/\b3rd\s+Quarter\b/gi, "Q3")
    .replace(/\b4th\s+Quarter\b/gi, "Q4")
    .replace(/\b1st\s+Qtr\b/gi, "Q1")
    .replace(/\b2nd\s+Qtr\b/gi, "Q2")
    .replace(/\b3rd\s+Qtr\b/gi, "Q3")
    .replace(/\b4th\s+Qtr\b/gi, "Q4")
    .replace(/\b1st\b(?!\s*(?:OT|Half|and|&))/gi, "Q1")
    .replace(/\b2nd\b(?!\s*(?:OT|Half|and|&))/gi, "Q2")
    .replace(/\b3rd\b(?!\s*(?:OT|Half|and|&))/gi, "Q3")
    .replace(/\b4th\b(?!\s*(?:OT|Half|and|&))/gi, "Q4");
}

/**
 * Formats ESPN event date and kickoff time in a clean, user-friendly format (e.g. "Thu 10/1 • 7:15 PM").
 * Prioritizes ESPN's official ISO timestamp converted to local time, with fallback to ESPN's shortDetail.
 */
function formatEspnGameTime(event) {
  if (!event) return "";
  if (event.date) {
    try {
      const d = new Date(event.date);
      if (!isNaN(d.getTime())) {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const day = days[d.getDay()];
        const month = d.getMonth() + 1;
        const date = d.getDate();
        let hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;
        return `${day} ${month}/${date} • ${hours}:${minutes} ${ampm}`;
      }
    } catch (e) {}
  }
  if (event.status?.type?.detail) {
    return formatQuarterStatus(event.status.type.detail);
  }
  if (event.status?.type?.shortDetail) {
    return formatQuarterStatus(event.status.type.shortDetail.replace(" - ", " • "));
  }
  return "";
}

/**
 * Automatically fetches real-time scores, clocks, and final outcomes directly from ESPN.
 * Dynamic matchup mapping: handles bye weeks dynamically (varying games per week) and
 * reconciles team acronym differences (WSH/WAS, AZ/ARI, LAR/LA, JAX/JAC).
 */
async function syncLiveNFLScores(weekNum, silent = false) {
  if (!weekNum || weekNum < 1 || weekNum > 18) return;
  const weekKey = `Week ${weekNum}`;
  if (!state.data || !state.data.weeks || !state.data.weeks[weekKey]) return;

  const weekData = state.data.weeks[weekKey];
  if (!weekData.games || !Array.isArray(weekData.games) || weekData.games.length === 0) return;

  const espnUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype=2&week=${weekNum}`;

  try {
    const res = await fetch(espnUrl);
    if (!res.ok) throw new Error(`ESPN API HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !data.events || !Array.isArray(data.events)) return;

    let updatedCount = 0;

    // Dynamically iterate over this week's games (adapts automatically to bye weeks)
    weekData.games.forEach(game => {
      if (!game || !game.matchup || !game.matchup.includes("@")) return;

      const rawParts = game.matchup.split("@").map(s => s.trim());
      if (rawParts.length !== 2) return;
      const gameAwayRaw = rawParts[0];
      const gameHomeRaw = rawParts[1];

      const awayNorm = normalizeTeamCode(gameAwayRaw);
      const homeNorm = normalizeTeamCode(gameHomeRaw);

      // Search ESPN events for matching matchup (checking both direct and flipped neutral sites)
      const matchedEvent = data.events.find(ev => {
        if (!ev.competitions || !ev.competitions[0] || !ev.competitions[0].competitors) return false;
        const comps = ev.competitions[0].competitors;
        const evAway = comps.find(c => c.homeAway === "away");
        const evHome = comps.find(c => c.homeAway === "home");
        if (!evAway || !evHome) return false;

        const aCode = normalizeTeamCode(evAway.team?.abbreviation);
        const hCode = normalizeTeamCode(evHome.team?.abbreviation);

        return (awayNorm === aCode && homeNorm === hCode) ||
               (awayNorm === hCode && homeNorm === aCode);
      });

      if (!matchedEvent) return;

      const comp = matchedEvent.competitions[0];
      const evAway = comp.competitors.find(c => c.homeAway === "away");
      const evHome = comp.competitors.find(c => c.homeAway === "home");
      if (!evAway || !evHome) return;

      const aCode = normalizeTeamCode(evAway.team?.abbreviation);
      const awayComp = (aCode === awayNorm) ? evAway : evHome;
      const homeComp = (aCode === awayNorm) ? evHome : evAway;

      const status = matchedEvent.status || {};
      const statusType = status.type || {};
      const stateCode = (statusType.state || "").toLowerCase(); // "pre" | "in" | "post"
      const shortDetail = statusType.shortDetail || "";

      // Prioritize ESPN official kickoff date & time for real-time accuracy
      const espnFormattedTime = formatEspnGameTime(matchedEvent);
      if (espnFormattedTime) {
        game.dateTime = espnFormattedTime;
      }

      // Parse score integers (or null if pre-game)
      const parsedAway = (awayComp.score !== undefined && awayComp.score !== null && awayComp.score !== "")
        ? parseInt(awayComp.score, 10)
        : null;
      const parsedHome = (homeComp.score !== undefined && homeComp.score !== null && homeComp.score !== "")
        ? parseInt(homeComp.score, 10)
        : null;

      // Extract real-time possession and situation from ESPN
      let possession = null; // "away" | "home" | null
      let downDistance = null;
      let isRedZone = false;

      if (comp.situation) {
        const possId = String(comp.situation.possession || "").trim();
        const awayId = String(awayComp.id || awayComp.team?.id || "").trim();
        const homeId = String(homeComp.id || homeComp.team?.id || "").trim();

        if (possId && possId === awayId) {
          possession = "away";
        } else if (possId && possId === homeId) {
          possession = "home";
        }

        // Prioritize full down & distance with ball yard line (e.g. "1st & 10 at PIT 35")
        const rawDownDist = comp.situation.downDistanceText;
        const shortDownDist = comp.situation.shortDownDistanceText;
        const possText = comp.situation.possessionText;

        if (rawDownDist && typeof rawDownDist === "string" && rawDownDist.trim()) {
          downDistance = rawDownDist.trim();
        } else if (shortDownDist && typeof shortDownDist === "string" && shortDownDist.trim()) {
          if (possText && typeof possText === "string" && possText.trim()) {
            downDistance = `${shortDownDist.trim()} at ${possText.trim()}`;
          } else {
            downDistance = shortDownDist.trim();
          }
        } else if (possText && typeof possText === "string" && possText.trim()) {
          downDistance = `Ball at ${possText.trim()}`;
        }

        isRedZone = Boolean(comp.situation.isRedZone);
      }

      if (stateCode === "post" || statusType.completed === true) {
        // Game is completed / FINAL
        game.isFinal = true;
        game.isLive = false;
        game.statusDetail = formatQuarterStatus(shortDetail) || "Final";
        game.awayScore = parsedAway;
        game.homeScore = parsedHome;
        game.possession = null;
        game.downDistance = null;
        game.isRedZone = false;

        if (awayComp.winner === true) {
          game.winner = gameAwayRaw;
        } else if (homeComp.winner === true) {
          game.winner = gameHomeRaw;
        } else if (parsedAway !== null && parsedHome !== null) {
          if (parsedAway > parsedHome) game.winner = gameAwayRaw;
          else if (parsedHome > parsedAway) game.winner = gameHomeRaw;
          else game.winner = "TIE";
        }
      } else if (stateCode === "in") {
        // Game is actively IN PROGRESS / LIVE
        game.isFinal = false;
        game.isLive = true;
        game.statusDetail = formatQuarterStatus(shortDetail) || "Live";
        game.awayScore = parsedAway;
        game.homeScore = parsedHome;
        game.possession = possession;
        game.downDistance = downDistance;
        game.isRedZone = isRedZone;
      } else {
        // Game is PRE / UPCOMING
        game.statusDetail = "Scheduled";
        if (!game.isFinal) {
          game.isLive = false;
          game.possession = null;
          game.downDistance = null;
          game.isRedZone = false;
        }
      }

      // Calculate pick points, closest bonuses, and exact scores for this game
      calculateGamePicksPoints(game);
      updatedCount++;
    });

    if (updatedCount > 0) {
      recalculateAllWeeksPoints(state.data);
      try {
        localStorage.setItem("og_league_cache_v9", JSON.stringify(state.data));
      } catch (e) {}
    }
  } catch (err) {
    console.warn("ESPN Scoreboard sync warning (using cached/sheet data):", err);
  }
}

// =========================================================
// GOOGLE SHEETS LIVE DATA SYNC
// =========================================================
async function syncWeek(weekNum, silent = false, forceNotice = false) {
  if (!weekNum || weekNum < 1 || weekNum > 18) return;

  const refreshBtn = document.getElementById("btn-refresh");
  const syncLabel = document.getElementById("sync-label");

  if (!silent && refreshBtn && syncLabel) {
    refreshBtn.classList.add("spinning");
    syncLabel.textContent = "Syncing...";
  }

  state.isSyncing = true;
  const sheetParam = encodeURIComponent(`Week ${weekNum}`);
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetParam}&t=${Date.now()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    
    parseWeekCSV(weekNum, csvText);

    // Sync real-time live NFL scores from ESPN scoreboard
    await syncLiveNFLScores(weekNum, silent);

    state.lastUpdated = new Date();
    if (syncLabel) syncLabel.textContent = "Live";
    
    // Save state cache
    try {
      localStorage.setItem("og_league_cache_v9", JSON.stringify(state.data));
    } catch (e) {}

    renderTabContent();
  } catch (err) {
    console.warn("Live sync error (offline or network restricted):", err);
    // If sheets failed, attempt ESPN sync directly so live game day updates still function
    try {
      await syncLiveNFLScores(weekNum, silent);
      renderTabContent();
    } catch (e2) {}

    if (syncLabel) syncLabel.textContent = "Offline";
  } finally {
    state.isSyncing = false;
    if (refreshBtn) refreshBtn.classList.remove("spinning");
  }
}

async function syncNFLStandings(forceNotice = false) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${NFL_STANDINGS_GID}&t=${Date.now()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const csv = await res.text();
    parseNFLStandingsCSV(csv);
    if (state.activeTab === "nfl") {
      renderNFLStandings();
    }
  } catch (e) {
    console.warn("NFL Standings sync warning:", e);
  }
}

// =========================================================
// CSV PARSING UTILITIES
// =========================================================
function parseCSV(text) {
  const lines = text.split(/\r\n|\n/);
  const rows = [];
  for (let line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let insideQuote = false;
    let entry = "";
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry);
        entry = "";
      } else {
        entry += char;
      }
    }
    row.push(entry);
    rows.push(row);
  }
  return rows;
}

function parseWeekCSV(weekNum, csvText) {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 15) return;

  const weekKey = `Week ${weekNum}`;
  if (!state.data) state.data = { weeks: {}, leaderboard: [] };
  if (!state.data.weeks) state.data.weeks = {};

  const existingWeek = (state.data && state.data.weeks) ? state.data.weeks[weekKey] : null;
  const existingGames = (existingWeek && Array.isArray(existingWeek.games)) ? existingWeek.games : [];
  const games = [];

  // Rows 1 to 16 are the 16 NFL Games
  for (let r = 1; r <= 16; r++) {
    const row = rows[r];
    if (!row || row.length < 6) continue;

    const dateTime = (row[0] || "").trim();
    const matchup = (row[1] || "").trim();
    if (!matchup || !matchup.includes("@")) continue;

    const parts = matchup.split("@").map(s => s.trim().toUpperCase());
    if (parts.length !== 2) continue;
    const awayTeam = parts[0];
    const homeTeam = parts[1];

    let winner = (row[2] || "").trim().toUpperCase();
    const awayScore = row[4] !== "" && !isNaN(row[4]) ? parseInt(row[4], 10) : null;
    const homeScore = row[5] !== "" && !isNaN(row[5]) ? parseInt(row[5], 10) : null;

    // Automatically derive winner from scores if not explicitly provided in the spreadsheet
    if (!winner && awayScore !== null && homeScore !== null) {
      if (awayScore > homeScore) {
        winner = awayTeam;
      } else if (homeScore > awayScore) {
        winner = homeTeam;
      } else if (awayScore === homeScore) {
        winner = "TIE";
      }
    }

    const isValidWinner = (winner === awayTeam || winner === homeTeam || winner === "TIE");
    const isFinal = (awayScore !== null && homeScore !== null && isValidWinner);

    // Look for existing game state (e.g. updated by ESPN)
    const existingGame = existingGames.find(eg => eg.id === `${weekKey}_g${r}` || (eg.matchup && eg.matchup === matchup));

    let finalAwayScore = awayScore;
    let finalHomeScore = homeScore;
    let finalWinner = winner;
    let finalIsFinal = isFinal;
    let finalDateTime = dateTime;
    let finalPossession = null;
    let finalDownDistance = null;
    let finalIsRedZone = false;
    let finalStatusDetail = "";
    let finalIsLive = false;

    if (existingGame) {
      // If spreadsheet has no score yet but game was already updated by ESPN, preserve live/final ESPN data
      if (finalAwayScore === null && existingGame.awayScore !== null) {
        finalAwayScore = existingGame.awayScore;
        finalHomeScore = existingGame.homeScore;
        finalWinner = existingGame.winner;
        finalIsFinal = existingGame.isFinal;
        finalIsLive = Boolean(existingGame.isLive);
      }
      if (existingGame.dateTime) finalDateTime = existingGame.dateTime;
      finalPossession = existingGame.possession || null;
      finalDownDistance = existingGame.downDistance || null;
      finalIsRedZone = Boolean(existingGame.isRedZone);
      finalStatusDetail = existingGame.statusDetail || "";
    }

    const picks = {};

    // 12 players starting at col 6, step 5
    for (let p = 0; p < PLAYERS.length; p++) {
      const pName = PLAYERS[p];
      const colBase = 6 + p * 5;

      const pickWinner = (row[colBase] || "").trim().toUpperCase();
      const pickAway = row[colBase + 2] !== "" && !isNaN(row[colBase + 2]) ? parseInt(row[colBase + 2], 10) : null;
      const pickHome = row[colBase + 3] !== "" && !isNaN(row[colBase + 3]) ? parseInt(row[colBase + 3], 10) : null;
      const multiplier = (row[colBase + 4] || "").trim().toUpperCase() === "TRUE";

      picks[pName] = {
        winner: pickWinner,
        awayScore: pickAway,
        homeScore: pickHome,
        multiplier,
        points: 0,
        basePoints: 0,
        bonusPoints: 0,
        isClosest: false,
        exact: false
      };
    }

    const gameObj = {
      id: `${weekKey}_g${r}`,
      dateTime: finalDateTime,
      matchup,
      winner: finalWinner,
      awayScore: finalAwayScore,
      homeScore: finalHomeScore,
      isFinal: finalIsFinal,
      isLive: finalIsLive,
      possession: finalPossession,
      downDistance: finalDownDistance,
      isRedZone: finalIsRedZone,
      statusDetail: finalStatusDetail,
      picks
    };

    // Dynamically calculate accurate pick points & closest bonus
    calculateGamePicksPoints(gameObj);
    games.push(gameObj);
  }

  // Parse Player weekly stats from rows 17-21 if present
  const playerStats = {};
  if (rows.length > 21) {
    const pointsRow = rows[18];
    const correctRow = rows[19];
    const recordRow = rows[22];

    for (let p = 0; p < PLAYERS.length; p++) {
      const pName = PLAYERS[p];
      const pIdx = rows[17] ? rows[17].indexOf(pName) : -1;
      const colIdx = pIdx !== -1 ? pIdx : (2 + p);

      playerStats[pName] = {
        weeklyPoints: pointsRow && pointsRow[colIdx] ? parseInt(pointsRow[colIdx], 10) : 0,
        correct: correctRow && correctRow[colIdx] ? parseInt(correctRow[colIdx], 10) : 0,
        record: recordRow && recordRow[colIdx] ? recordRow[colIdx].trim() : ""
      };
    }
  }

  state.data.weeks[weekKey] = { games, playerStats };

  // Dynamically compute season leaderboard from all games
  state.data.leaderboard = computeSeasonLeaderboard(state.data);
}

function parseNFLStandingsCSV(csvText) {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 8) return;

  const afcPlayoffs = [];
  const nfcPlayoffs = [];

  for (let r = 1; r <= 7; r++) {
    const row = rows[r];
    if (!row) continue;
    // AFC: columns 0 (seed) and 1 (team)
    if (row[0] && row[1]) afcPlayoffs.push({ seed: row[0].trim(), team: row[1].trim() });
    // NFC: columns 5 (seed) and 6 (team) in the spreadsheet, with fallback to 3 & 4
    if (row[5] && row[6]) nfcPlayoffs.push({ seed: row[5].trim(), team: row[6].trim() });
    else if (row[3] && row[4]) nfcPlayoffs.push({ seed: row[3].trim(), team: row[4].trim() });
  }

  state.nflStandings = { afcPlayoffs, nfcPlayoffs };
}

// =========================================================
// UI RENDERING - APP MASTER
// =========================================================
function renderApp() {
  renderHeaderProfile();
  switchTab(state.activeTab, false);
}

function renderTabContent() {
  switch (state.activeTab) {
    case "leaderboard":
      renderLeaderboard();
      break;
    case "matchups":
      renderMatchups();
      break;
    case "players":
      renderPlayers();
      break;
    case "nfl":
      renderNFLStandings();
      break;
    case "rules":
      // Static rules in HTML
      break;
  }
}

// =========================================================
// TAB 1: LEADERBOARD RENDERING (Season Total & Weekly Toggle)
// =========================================================

function setLeaderboardMode(mode) {
  state.leaderboardMode = mode;
  renderLeaderboard();
  saveNavState();
}
window.setLeaderboardMode = setLeaderboardMode;

/**
 * Returns overall Season Leaderboard with shared ranks based strictly on points.
 * Dynamically computes season standings across all finalized games in all weeks.
 * Optionally limits accumulation up to throughWeek.
 */
function getSeasonLeaderboard(throughWeek = null) {
  return computeSeasonLeaderboard(state.data, throughWeek);
}

/**
 * Returns Weekly Leaderboard for a specific week with shared ranks based strictly on points.
 */
function getWeeklyLeaderboard(weekNum) {
  const weekKey = `Week ${weekNum}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  const list = PLAYERS.map(pName => {
    let pts = 0;
    games.forEach(g => {
      const pk = g.picks && g.picks[pName];
      if (pk) {
        pts += (pk.points || 0);
      }
    });

    const rec = getPlayerWeekRecord(pName, weekNum);

    return {
      name: pName,
      points: pts,
      rec
    };
  });

  // Sort descending by points
  list.sort((a, b) => b.points - a.points);

  // Assign shared ranks based off of points only
  let currentRank = 1;
  for (let i = 0; i < list.length; i++) {
    if (i > 0 && list[i].points < list[i - 1].points) {
      currentRank = i + 1;
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
 * Calculates rank movements for all players for a given week.
 * Compares rank entering the week (points summed for weeks < weekNum)
 * against live rank in the week (points summed for weeks <= weekNum).
 *
 * If weekNum <= 1 (Week 1 of the season), or if no games in the week
 * have reached a final score yet, all players show a neutral dash (—) with delta 0.
 */
function getWeeklyRankMovements(weekNum = state.currentWeek) {
  const result = {};
  PLAYERS.forEach(p => {
    result[p] = {
      delta: 0,
      html: '<span class="rank-shift-pill shift-neutral">—</span>'
    };
  });

  // Week 1 has no prior week to compare against: always neutral
  if (weekNum <= 1) {
    return result;
  }

  const weekKey = `Week ${weekNum}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  // Requirement: no movement until at least one game for the week has reached a final score
  const hasFinal = games.some(g => Boolean(g.isFinal));
  if (!hasFinal) {
    return result;
  }

  // Pre-week rank: points accumulated strictly in prior weeks (weeks 1 to weekNum - 1)
  const preWeekList = PLAYERS.map(pName => {
    let pts = 0;
    if (state.data && state.data.weeks) {
      for (let w = 1; w < weekNum; w++) {
        const wk = state.data.weeks[`Week ${w}`];
        if (wk && wk.games && Array.isArray(wk.games)) {
          wk.games.forEach(g => {
            const pk = g.picks ? g.picks[pName] : null;
            if (pk && typeof pk.points === "number") {
              pts += pk.points;
            }
          });
        }
      }
    }
    return { name: pName, points: pts };
  });

  preWeekList.sort((a, b) => b.points - a.points);
  let preRank = 1;
  for (let i = 0; i < preWeekList.length; i++) {
    if (i > 0 && preWeekList[i].points < preWeekList[i - 1].points) {
      preRank = i + 1;
    }
    preWeekList[i].numericRank = preRank;
  }
  const preRankMap = {};
  preWeekList.forEach(p => {
    preRankMap[p.name] = p.numericRank;
  });

  // Current rank: points accumulated through weekNum (weeks 1 to weekNum)
  const currWeekList = PLAYERS.map(pName => {
    let pts = 0;
    if (state.data && state.data.weeks) {
      for (let w = 1; w <= weekNum; w++) {
        const wk = state.data.weeks[`Week ${w}`];
        if (wk && wk.games && Array.isArray(wk.games)) {
          wk.games.forEach(g => {
            const pk = g.picks ? g.picks[pName] : null;
            if (pk && typeof pk.points === "number") {
              pts += pk.points;
            }
          });
        }
      }
    }
    return { name: pName, points: pts };
  });

  currWeekList.sort((a, b) => b.points - a.points);
  let currRank = 1;
  for (let i = 0; i < currWeekList.length; i++) {
    if (i > 0 && currWeekList[i].points < currWeekList[i - 1].points) {
      currRank = i + 1;
    }
    currWeekList[i].numericRank = currRank;
  }
  const currRankMap = {};
  currWeekList.forEach(p => {
    currRankMap[p.name] = p.numericRank;
  });

  // Compute movement delta for each player
  PLAYERS.forEach(pName => {
    const prior = preRankMap[pName] !== undefined ? preRankMap[pName] : 1;
    const current = currRankMap[pName] !== undefined ? currRankMap[pName] : 1;
    // Lower numeric rank is better (e.g. rank 6 -> rank 2 is +4 improvement)
    const delta = prior - current;

    let html = '<span class="rank-shift-pill shift-neutral">—</span>';
    if (delta > 0) {
      html = `<span class="rank-shift-pill shift-up"><span class="shift-arrow">▲</span>${delta}</span>`;
    } else if (delta < 0) {
      html = `<span class="rank-shift-pill shift-down"><span class="shift-arrow">▼</span>${Math.abs(delta)}</span>`;
    }

    result[pName] = {
      delta,
      preRank: prior,
      currentRank: current,
      html
    };
  });

  return result;
}

function renderLeaderboard() {
  const podiumEl = document.getElementById("podium-container");
  const listEl = document.getElementById("leaderboard-list");
  const sectionTitleEl = document.getElementById("leaderboard-section-title");
  const labelWeeklyBtn = document.getElementById("label-toggle-weekly");
  const btnSeason = document.getElementById("btn-toggle-season");
  const btnWeekly = document.getElementById("btn-toggle-weekly");
  if (!podiumEl || !listEl) return;

  const isWeekly = state.leaderboardMode === "weekly";

  // Sync toggle button states & labels
  if (btnSeason) btnSeason.classList.toggle("active", !isWeekly);
  if (btnWeekly) btnWeekly.classList.toggle("active", isWeekly);
  if (labelWeeklyBtn) labelWeeklyBtn.textContent = `Week ${state.currentWeek} Standings`;

  if (sectionTitleEl) {
    sectionTitleEl.textContent = isWeekly
      ? `Week ${state.currentWeek} Standings`
      : "League Standings";
  }

  const sorted = isWeekly
    ? getWeeklyLeaderboard(state.currentWeek)
    : getSeasonLeaderboard(state.currentWeek);

  const rankMovements = getWeeklyRankMovements(state.currentWeek);

  const leader = sorted[0] || { name: "-", points: 0 };
  const rank1 = sorted[0] || { name: "-", points: 0 };
  const rank2 = sorted[1] || { name: "-", points: 0 };
  const rank3 = sorted[2] || { name: "-", points: 0 };

  const rec1 = rank1.rec || { label: "0-0 W-L", wins: 0, losses: 0, pct: "0.0" };
  const rec2 = rank2.rec || { label: "0-0 W-L", wins: 0, losses: 0, pct: "0.0" };
  const rec3 = rank3.rec || { label: "0-0 W-L", wins: 0, losses: 0, pct: "0.0" };

  const isMeRank1 = Boolean(state.myPlayer && rank1.name === state.myPlayer);
  const isMeRank2 = Boolean(state.myPlayer && rank2.name === state.myPlayer);
  const isMeRank3 = Boolean(state.myPlayer && rank3.name === state.myPlayer);

  // Podium pedestal labels

  const getPedestalRankText = (p, defaultLabel) => {
    if (!p || !p.rankDisplay || p.rankDisplay === "-") return defaultLabel;
    const str = String(p.rankDisplay);
    if (str.startsWith("T-")) {
      const num = str.slice(2);
      const sfx = num === "1" ? "ST" : (num === "2" ? "ND" : (num === "3" ? "RD" : "TH"));
      return `T-${num}${sfx}`;
    }
    const sfx = str === "1" ? "ST" : (str === "2" ? "ND" : (str === "3" ? "RD" : "TH"));
    return `${str}${sfx}`;
  };

  const getBadgeRankText = (p, defaultVal) => {
    if (!p || !p.rankDisplay || p.rankDisplay === "-") return defaultVal;
    return String(p.rankDisplay).replace("T-", "T");
  };

  const ped1Text = getPedestalRankText(rank1, "1ST");
  const ped2Text = getPedestalRankText(rank2, "2ND");
  const ped3Text = getPedestalRankText(rank3, "3RD");

  const badge1Text = getBadgeRankText(rank1, "1");
  const badge2Text = getBadgeRankText(rank2, "2");
  const badge3Text = getBadgeRankText(rank3, "3");

  // If in weekly mode and no points scored yet (future or in-progress week)
  const isWeekUnplayed = isWeekly && leader.points === 0;

  if (isWeekUnplayed) {
    podiumEl.innerHTML = `
      <div style="grid-column: 1 / -1; width: 100%;">
        <div class="week-empty-banner">
          <span class="week-empty-icon">⏳</span>
          <div class="week-empty-body">
            <div class="week-empty-title">Week ${state.currentWeek} Games In Progress / Upcoming</div>
            <div class="week-empty-desc">No final scores recorded yet for Week ${state.currentWeek}. Standings and the podium will update live as games conclude!</div>
          </div>
        </div>
      </div>
    `;
  } else {
    podiumEl.innerHTML = `
      <!-- 2nd Place Pedestal (Silver) -->
      <div class="podium-card rank-2 ${isMeRank2 ? "is-my-rank" : ""}" onclick="${rank2.name && rank2.name !== '-' ? `openPlayer('${rank2.name}')` : ''}">
        <div class="podium-pedestal-header">
          <div class="podium-avatar-frame frame-silver">
            ${rank2.name && rank2.name !== "-" ? getPlayerAvatarHtml(rank2.name, 44) : '<div class="player-avatar" style="width:44px; height:44px;">?</div>'}
            <div class="podium-rank-badge badge-silver">${badge2Text}</div>
          </div>
        </div>
        <div class="podium-body">
          <div class="podium-name">${rank2.name}${isMeRank2 ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
          <div class="podium-points-wrap rank-2-pts">
            <span class="podium-pts-val">${rank2.points}</span>
            <span class="podium-pts-lbl">PTS</span>
          </div>
          <div class="podium-footer-row">
            <div class="podium-record-pill">${rec2.label}</div>
            ${rankMovements[rank2.name]?.html || ''}
          </div>
        </div>
        <div class="podium-base-pedestal base-silver">
          <span class="pedestal-rank-num">${ped2Text}</span>
        </div>
      </div>

      <!-- 1st Place Pedestal (Gold - Champion) -->
      <div class="podium-card rank-1 first ${isMeRank1 ? "is-my-rank" : ""}" onclick="${rank1.name && rank1.name !== '-' ? `openPlayer('${rank1.name}')` : ''}">
        <div class="podium-pedestal-header">
          <div class="podium-crown-wrap">
            <svg class="podium-crown-svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
            </svg>
          </div>
          <div class="podium-avatar-frame frame-gold">
            ${rank1.name && rank1.name !== "-" ? getPlayerAvatarHtml(rank1.name, 54) : '<div class="player-avatar" style="width:54px; height:54px;">?</div>'}
            <div class="podium-rank-badge badge-gold">${badge1Text}</div>
          </div>
        </div>
        <div class="podium-body">
          <div class="podium-name rank-1-name">${rank1.name}${isMeRank1 ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
          <div class="podium-points-wrap rank-1-pts">
            <span class="podium-pts-val">${rank1.points}</span>
            <span class="podium-pts-lbl">PTS</span>
          </div>
          <div class="podium-footer-row">
            <div class="podium-record-pill rank-1-rec">${rec1.label}</div>
            ${rankMovements[rank1.name]?.html || ''}
          </div>
        </div>
        <div class="podium-base-pedestal base-gold">
          <span class="pedestal-rank-num">${ped1Text}</span>
        </div>
      </div>

      <!-- 3rd Place Pedestal (Bronze) -->
      <div class="podium-card rank-3 ${isMeRank3 ? "is-my-rank" : ""}" onclick="${rank3.name && rank3.name !== '-' ? `openPlayer('${rank3.name}')` : ''}">
        <div class="podium-pedestal-header">
          <div class="podium-avatar-frame frame-bronze">
            ${rank3.name && rank3.name !== "-" ? getPlayerAvatarHtml(rank3.name, 42) : '<div class="player-avatar" style="width:42px; height:42px;">?</div>'}
            <div class="podium-rank-badge badge-bronze">${badge3Text}</div>
          </div>
        </div>
        <div class="podium-body">
          <div class="podium-name">${rank3.name}${isMeRank3 ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
          <div class="podium-points-wrap rank-3-pts">
            <span class="podium-pts-val">${rank3.points}</span>
            <span class="podium-pts-lbl">PTS</span>
          </div>
          <div class="podium-footer-row">
            <div class="podium-record-pill">${rec3.label}</div>
            ${rankMovements[rank3.name]?.html || ''}
          </div>
        </div>
        <div class="podium-base-pedestal base-bronze">
          <span class="pedestal-rank-num">${ped3Text}</span>
        </div>
      </div>
    `;
  }

  // Full Leaderboard Rows (1 to 12)
  const seasonPtsMap = {};
  if (isWeekly) {
    const seasonLeaderboard = getSeasonLeaderboard();
    seasonLeaderboard.forEach(p => {
      seasonPtsMap[p.name] = p.points;
    });
  }

  listEl.innerHTML = sorted.map((player) => {
    let rankBadgeClass = "";
    if (player.numericRank === 1) rankBadgeClass = "top1";
    else if (player.numericRank === 2) rankBadgeClass = "top2";
    else if (player.numericRank === 3) rankBadgeClass = "top3";

    const isMe = Boolean(state.myPlayer && player.name === state.myPlayer);
    const rec = player.rec || { wins: 0, losses: 0, pct: "0.0", label: "0-0" };
    const movementHtml = rankMovements[player.name]?.html || '<span class="rank-shift-pill shift-neutral">—</span>';

    let rightSideHtml = "";
    if (!isWeekly) {
      // Season Total Tab:
      // Points in Athletic Gold; sub-pill in Neon Emerald (+X in Wk Y)
      let weekPts = 0;
      const weekKey = `Week ${state.currentWeek}`;
      if (state.data && state.data.weeks && state.data.weeks[weekKey] && state.data.weeks[weekKey].games) {
        const gList = state.data.weeks[weekKey].games;
        weekPts = gList.reduce((sum, g) => {
          const pk = g.picks && g.picks[player.name];
          return sum + (pk ? (pk.points || 0) : 0);
        }, 0);
      }
      rightSideHtml = `
        <div class="leader-points-wrap pts-season">
          <span class="leader-pts-val">${player.points}</span>
          <span class="leader-pts-lbl">PTS</span>
        </div>
        <div class="leader-sub-pill pill-emerald">+${weekPts} Wk ${state.currentWeek}</div>
      `;
    } else {
      // Week # Standings Tab:
      // Points in Neon Emerald; sub-pill in Light Blue (X Total)
      const seasonPts = seasonPtsMap[player.name] !== undefined ? seasonPtsMap[player.name] : player.points;
      rightSideHtml = `
        <div class="leader-points-wrap pts-weekly">
          <span class="leader-pts-val">${player.points}</span>
          <span class="leader-pts-lbl">PTS</span>
        </div>
        <div class="leader-sub-pill pill-blue">${seasonPts} Total</div>
      `;
    }

    return `
      <div class="leader-row ${isMe ? "is-my-rank" : ""}" onclick="openPlayer('${player.name}')">
        <div class="leader-left">
          <div class="rank-badge ${rankBadgeClass}">${player.rankDisplay}</div>
          ${movementHtml}
          ${getPlayerAvatarHtml(player.name, 36)}
          <div class="player-info-block">
            <div class="player-title">
              <span>${player.name}</span>
              ${isMe ? `<span class="leader-you-pill">YOU</span>` : ""}
            </div>
            <div class="leader-rec-capsule">
              <span>${rec.wins}-${rec.losses}</span>
              <span class="rec-dot">•</span>
              <span>${Math.round(parseFloat(rec.pct) || 0)}%</span>
            </div>
          </div>
        </div>
        <div class="leader-right">
          ${rightSideHtml}
        </div>
      </div>
    `;
  }).join("");
}

// =========================================================
// TAB 2: MATCHUPS & SPLIT PICKS RENDERING
// =========================================================
function renderMatchups() {
  const container = document.getElementById("matchups-list");
  const bannerTitle = document.getElementById("matchup-banner-title");
  const bannerStat = document.getElementById("matchup-banner-stat");
  if (!container) return;

  const weekKey = `Week ${state.currentWeek}`;
  bannerTitle.textContent = `${weekKey} Matchups`;

  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  if (games.length === 0) {
    bannerStat.textContent = "0 Games";
    container.innerHTML = `
      <div class="loading-box">
        <div class="loading-spinner"></div>
        <p>Loading ${weekKey} from live spreadsheet...</p>
      </div>
    `;
    return;
  }

  // Ensure points and closest bonuses are fully calculated for every game
  games.forEach(g => calculateGamePicksPoints(g));

  const finalsCount = games.filter(g => g.isFinal).length;
  const liveCount = games.filter(g => g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null)).length;
  bannerStat.innerHTML = `${games.length}&nbsp;Games • ${finalsCount}&nbsp;Final${liveCount > 0 ? ` • <span class="summary-live-tag" style="color:#f87171; font-weight:800; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;"><span class="live-pulse-dot"></span>${liveCount}&nbsp;Live</span>` : ""}`;

  container.innerHTML = games.map((game, idx) => {
    const parts = (game.matchup || "").split("@").map(s => s.trim());
    const awayTeam = parts[0] || "AWAY";
    const homeTeam = parts[1] || "HOME";

    const awayInfo = NFL_TEAMS[awayTeam] || NFL_TEAMS[normalizeTeamCode(awayTeam)] || { code: awayTeam, name: awayTeam, city: awayTeam, color: '#2a3b50' };
    const homeInfo = NFL_TEAMS[homeTeam] || NFL_TEAMS[normalizeTeamCode(homeTeam)] || { code: homeTeam, name: homeTeam, city: homeTeam, color: '#2a3b50' };

    const awayTextColor = getTeamContrastColor(awayInfo.color);
    const homeTextColor = getTeamContrastColor(homeInfo.color);

    const awayRecord = getNFLTeamRecord(awayTeam, state.currentWeek);
    const homeRecord = getNFLTeamRecord(homeTeam, state.currentWeek);

    const isFinal = game.isFinal;
    const isLive = Boolean(game.isLive || (!isFinal && game.awayScore !== null && game.homeScore !== null));

    let badgeText = "SCHEDULED";
    let badgeClass = "scheduled";

    if (isFinal) {
      badgeText = (game.statusDetail && game.statusDetail.toUpperCase().includes("FINAL"))
        ? game.statusDetail.toUpperCase()
        : "FINAL";
      badgeClass = "final";
    } else if (isLive) {
      let liveText = formatQuarterStatus(game.statusDetail) || "LIVE";
      if (game.downDistance) {
        liveText += ` • ${game.downDistance}`;
      }
      if (game.isRedZone) {
        liveText += ` • <span class="redzone-tag">🔴 RZ</span>`;
      }
      badgeText = `<span class="live-pulse-dot"></span> ${liveText}`;
      badgeClass = "live";
    } else {
      badgeText = "SCHEDULED";
      badgeClass = "scheduled";
    }

    const awayWinning = Boolean(isFinal && (game.winner === awayTeam || normalizeTeamCode(game.winner) === normalizeTeamCode(awayTeam)));
    const homeWinning = Boolean(isFinal && (game.winner === homeTeam || normalizeTeamCode(game.winner) === normalizeTeamCode(homeTeam)));

    // Group picks by team: Away, Home, and Unpicked
    const awayPicks = [];
    const homePicks = [];
    const unpicked = [];

    PLAYERS.forEach(pName => {
      const pick = game.picks ? game.picks[pName] : null;
      if (!pick || !pick.winner) {
        unpicked.push({ name: pName });
        return;
      }

      const isMe = Boolean(state.myPlayer && pName === state.myPlayer);
      let chipClass = pick.multiplier ? "has-multiplier" : "";
      if (isMe) {
        chipClass += " is-my-pick";
      }
      let ptsBadge = "";

      if (isFinal) {
        if (pick.exact) {
          chipClass += " exact";
          ptsBadge = `<span class="chip-pts-badge pts-exact" title="Exact Score (+${pick.bonusPoints} PTS)">🔮 +${pick.points}</span>`;
        } else if (pick.isClosest) {
          chipClass += " closest";
          ptsBadge = `<span class="chip-pts-badge pts-closest" title="Closest Score (+${pick.bonusPoints} PTS)">🎯 +${pick.points}</span>`;
        } else if (pick.points > 0) {
          chipClass += " correct";
          ptsBadge = `<span class="chip-pts-badge pts-win">+${pick.points}</span>`;
        } else {
          chipClass += " wrong";
          ptsBadge = `<span class="chip-pts-badge pts-zero">0</span>`;
        }
      }

      const scoreDisplay = (pick.awayScore !== null && pick.homeScore !== null)
        ? `${pick.awayScore}-${pick.homeScore}`
        : "";

      const pData = {
        name: pName,
        isMe,
        multiplier: pick.multiplier,
        scoreDisplay,
        chipClass: chipClass.trim(),
        ptsBadge
      };

      const pickWinNorm = normalizeTeamCode(pick.winner);
      const awayNorm = normalizeTeamCode(awayTeam);
      const homeNorm = normalizeTeamCode(homeTeam);

      if (pick.winner === awayTeam || pickWinNorm === awayNorm) {
        awayPicks.push(pData);
      } else if (pick.winner === homeTeam || pickWinNorm === homeNorm) {
        homePicks.push(pData);
      } else {
        unpicked.push({ name: pName, winner: pick.winner });
      }
    });

    // Calculate pick consensus
    const totalPicks = awayPicks.length + homePicks.length;
    const awayColor = (awayInfo.color === '#000000') ? (awayInfo.alt || '#A5ACAF') : (awayInfo.color || '#2a3b50');
    const homeColor = (homeInfo.color === '#000000') ? (homeInfo.alt || '#A5ACAF') : (homeInfo.color || '#2a3b50');

    let awayPct = 50;
    let homePct = 50;
    let isUnanimous = false;
    let isDeadHeat = false;

    if (totalPicks > 0) {
      awayPct = Math.round((awayPicks.length / totalPicks) * 100);
      homePct = 100 - awayPct;
      if (awayPicks.length === 0 || homePicks.length === 0) {
        isUnanimous = true;
      } else if (awayPicks.length === homePicks.length) {
        isDeadHeat = true;
      }
    }

    const renderChip = (p) => `
      <div class="split-pick-chip ${p.chipClass}" onclick="openPlayer('${p.name}')" title="View ${p.name}'s predictions">
        <div class="chip-avatar-col">
          ${getPlayerAvatarHtml(p.name, 26)}
        </div>
        <div class="chip-body">
          <div class="chip-row-top">
            <span class="chip-player-name">${p.name}</span>
            <div class="chip-badges-group">
              ${p.isMe ? `<span class="chip-you-badge">YOU</span>` : ""}
              ${p.multiplier ? `<span class="chip-mult-tag">⭐ 3X</span>` : ""}
            </div>
          </div>
          <div class="chip-row-bottom">
            <span class="chip-predicted-score">${p.scoreDisplay}</span>
            ${p.ptsBadge}
          </div>
        </div>
      </div>
    `;

    const isCollapsed = state.collapsedMatchups && state.collapsedMatchups.has(game.id);

    return `
      <article class="matchup-card ${isCollapsed ? "collapsed" : ""} ${isLive ? "is-live" : ""}" id="${game.id}">
        <div class="matchup-card-header" onclick="toggleMatchupCollapse('${game.id}', event)">
          <span class="date-time">${game.dateTime || `Game ${idx + 1}`}</span>
          <div class="matchup-header-actions">
            <span class="matchup-badge ${badgeClass}">${badgeText}</span>
            <button type="button" class="matchup-collapse-btn ${isCollapsed ? "collapsed" : ""}" aria-label="${isCollapsed ? "Expand picks" : "Collapse picks"}" title="${isCollapsed ? "Expand picks" : "Collapse picks"}">
              <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div class="matchup-teams-display">
          <!-- Away Team (Left) -->
          <div class="team-box away ${isLive && game.possession === 'away' ? 'has-possession' : ''}">
            <div class="team-badge" style="background-color: ${awayInfo.color}; color: ${awayTextColor};">${awayTeam}</div>
            <div class="team-details">
              <div class="team-code">
                <span>${awayTeam}</span>
                ${isLive && game.possession === 'away' ? '<span class="possession-football" title="Possession: ' + awayTeam + '">🏈</span>' : ''}
              </div>
              <div class="team-name-sub">${awayInfo.city || awayInfo.name || ""}</div>
              <div class="team-record-sub">${awayRecord.text}</div>
            </div>
            <div class="team-score ${awayWinning ? "winning" : ""}">${game.awayScore !== null ? game.awayScore : "-"}</div>
          </div>

          <!-- Center VS -->
          <div class="matchup-center">
            <span class="vs-tag">@</span>
          </div>

          <!-- Home Team (Right) -->
          <div class="team-box home ${isLive && game.possession === 'home' ? 'has-possession' : ''}">
            <div class="team-badge" style="background-color: ${homeInfo.color}; color: ${homeTextColor};">${homeTeam}</div>
            <div class="team-details">
              <div class="team-code">
                ${isLive && game.possession === 'home' ? '<span class="possession-football" title="Possession: ' + homeTeam + '">🏈</span>' : ''}
                <span>${homeTeam}</span>
              </div>
              <div class="team-name-sub">${homeInfo.city || homeInfo.name || ""}</div>
              <div class="team-record-sub">${homeRecord.text}</div>
            </div>
            <div class="team-score ${homeWinning ? "winning" : ""}">${game.homeScore !== null ? game.homeScore : "-"}</div>
          </div>
        </div>

        <!-- League Pick Consensus Bar -->
        ${totalPicks > 0 ? `
          <div class="matchup-consensus-container" aria-label="League pick consensus: ${awayTeam} ${awayPct}%, ${homeTeam} ${homePct}%">
            <div class="consensus-header-row">
              <div class="consensus-side away">
                <span class="consensus-dot" style="background-color: ${awayColor};"></span>
                <span class="consensus-team-code">${awayTeam}</span>
                <span class="consensus-pct" style="color: ${awayColor};">${awayPct}%</span>
                <span class="consensus-count">(${awayPicks.length})</span>
              </div>

              ${isUnanimous ? `<span class="consensus-badge unanimous">🔥 Unanimous</span>` :
                isDeadHeat ? `<span class="consensus-badge split">⚡ 50/50 Split</span>` : ""}

              <div class="consensus-side home">
                <span class="consensus-dot" style="background-color: ${homeColor};"></span>
                <span class="consensus-team-code">${homeTeam}</span>
                <span class="consensus-pct" style="color: ${homeColor};">${homePct}%</span>
                <span class="consensus-count">(${homePicks.length})</span>
              </div>
            </div>

            <div class="consensus-bar-track">
              <div class="consensus-bar-fill away" style="width: ${awayPct}%; background-color: ${awayColor};"></div>
              <div class="consensus-bar-fill home" style="width: ${homePct}%; background-color: ${homeColor};"></div>
            </div>
          </div>
        ` : ""}

        <!-- Split Picks Breakdown (Away on Left, Home on Right) -->
        <div class="matchup-split-picks">
          <!-- Left Side: Away Team Picks -->
          <div class="picks-column away-picks">
            <div class="picks-column-header away" style="border-left: 3px solid ${awayInfo.color};">
              <div class="column-team-label">
                <span class="column-swatch" style="background-color: ${awayInfo.color};"></span>
                <span>${awayTeam} Picks</span>
              </div>
              <span class="column-count-badge">${awayPicks.length}</span>
            </div>
            <div class="picks-list">
              ${awayPicks.length > 0 ? awayPicks.map(renderChip).join("") : `<div class="no-picks-muted">No picks</div>`}
            </div>
          </div>

          <!-- Right Side: Home Team Picks -->
          <div class="picks-column home-picks">
            <div class="picks-column-header home" style="border-right: 3px solid ${homeInfo.color};">
              <span class="column-count-badge">${homePicks.length}</span>
              <div class="column-team-label">
                <span>${homeTeam} Picks</span>
                <span class="column-swatch" style="background-color: ${homeInfo.color};"></span>
              </div>
            </div>
            <div class="picks-list">
              ${homePicks.length > 0 ? homePicks.map(renderChip).join("") : `<div class="no-picks-muted">No picks</div>`}
            </div>
          </div>
        </div>

        ${unpicked.length > 0 ? `
          <div class="unpicked-footer">
            <span class="unpicked-label">No Pick (${unpicked.length}):</span>
            <span class="unpicked-names">${unpicked.map(u => u.name).join(", ")}</span>
          </div>
        ` : ""}
      </article>
    `;
  }).join("");

  updateToggleAllBtn();
}

// =========================================================
// MATCHUP CARD COLLAPSE / EXPAND ENGINE
// =========================================================
function toggleMatchupCollapse(gameId, event) {
  if (event) event.stopPropagation();
  if (!state.collapsedMatchups) {
    state.collapsedMatchups = new Set();
  }

  const card = document.getElementById(gameId);
  const isCurrentlyCollapsed = state.collapsedMatchups.has(gameId);

  if (isCurrentlyCollapsed) {
    state.collapsedMatchups.delete(gameId);
    if (card) {
      card.classList.remove("collapsed");
      const btn = card.querySelector(".matchup-collapse-btn");
      if (btn) {
        btn.classList.remove("collapsed");
        btn.setAttribute("aria-label", "Collapse picks");
        btn.setAttribute("title", "Collapse picks");
      }
    }
  } else {
    state.collapsedMatchups.add(gameId);
    if (card) {
      card.classList.add("collapsed");
      const btn = card.querySelector(".matchup-collapse-btn");
      if (btn) {
        btn.classList.add("collapsed");
        btn.setAttribute("aria-label", "Expand picks");
        btn.setAttribute("title", "Expand picks");
      }
    }
  }

  updateToggleAllBtn();
}

function toggleAllMatchups() {
  if (!state.collapsedMatchups) {
    state.collapsedMatchups = new Set();
  }

  const weekKey = `Week ${state.currentWeek}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];
  if (games.length === 0) return;

  const allCollapsed = games.every(g => state.collapsedMatchups.has(g.id));

  if (allCollapsed) {
    games.forEach(g => {
      state.collapsedMatchups.delete(g.id);
      const card = document.getElementById(g.id);
      if (card) {
        card.classList.remove("collapsed");
        const btn = card.querySelector(".matchup-collapse-btn");
        if (btn) {
          btn.classList.remove("collapsed");
          btn.setAttribute("aria-label", "Collapse picks");
          btn.setAttribute("title", "Collapse picks");
        }
      }
    });
  } else {
    games.forEach(g => {
      state.collapsedMatchups.add(g.id);
      const card = document.getElementById(g.id);
      if (card) {
        card.classList.add("collapsed");
        const btn = card.querySelector(".matchup-collapse-btn");
        if (btn) {
          btn.classList.add("collapsed");
          btn.setAttribute("aria-label", "Expand picks");
          btn.setAttribute("title", "Expand picks");
        }
      }
    });
  }

  updateToggleAllBtn();
}

function updateToggleAllBtn() {
  const btn = document.getElementById("toggle-all-matchups-btn");
  if (!btn) return;
  const weekKey = `Week ${state.currentWeek}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];
  if (games.length === 0) {
    btn.style.display = "none";
    return;
  }
  btn.style.display = "inline-flex";
  const allCollapsed = games.every(g => state.collapsedMatchups && state.collapsedMatchups.has(g.id));
  btn.textContent = allCollapsed ? "Expand All" : "Collapse All";
}

// =========================================================
// TAB 3: PLAYER ROSTERS RENDERING
// =========================================================
function renderPlayers() {
  const singleBtn = document.getElementById("btn-player-mode-single");
  const h2hBtn = document.getElementById("btn-player-mode-h2h");
  const singleView = document.getElementById("player-single-view");
  const h2hView = document.getElementById("player-h2h-view");

  const isH2H = (state.playerViewMode === "h2h");
  if (singleBtn) singleBtn.classList.toggle("active", !isH2H);
  if (h2hBtn) h2hBtn.classList.toggle("active", isH2H);

  if (isH2H) {
    if (singleView) singleView.style.display = "none";
    if (h2hView) h2hView.style.display = "block";
    renderH2H();
    return;
  }

  if (singleView) singleView.style.display = "block";
  if (h2hView) h2hView.style.display = "none";

  const pillsContainer = document.getElementById("player-scroller-pills");
  const heroContainer = document.getElementById("player-hero-card");
  const picksContainer = document.getElementById("player-picks-container");
  const weekTitle = document.getElementById("player-week-title");
  if (!pillsContainer || !heroContainer || !picksContainer) return;

  const weekKey = `Week ${state.currentWeek}`;
  if (weekTitle) weekTitle.textContent = `${state.selectedPlayer}’s ${weekKey} Picks`;

  // Render Horizontal Filter Pills
  pillsContainer.innerHTML = PLAYERS.map(pName => {
    const isActive = pName === state.selectedPlayer;
    const isMe = Boolean(state.myPlayer && pName === state.myPlayer);
    return `
      <button class="player-filter-pill ${isActive ? "active" : ""} ${isMe ? "is-my-profile" : ""}" onclick="openPlayer('${pName}')">
        ${getPlayerAvatarHtml(pName, 20)}
        <span>${pName}${isMe ? " (You)" : ""}</span>
      </button>
    `;
  }).join("");

  // Ensure active player pill is scrolled into view
  setTimeout(() => {
    const activePill = pillsContainer.querySelector(".player-filter-pill.active");
    if (activePill) {
      activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, 60);

  // Get Player Standings & Stats
  const seasonLb = getSeasonLeaderboard();
  const playerRankObj = seasonLb.find(p => p.name === state.selectedPlayer) || { numericRank: 0, rankDisplay: "-", points: 0 };

  let rankBadgeClass = "";
  if (playerRankObj.numericRank === 1) rankBadgeClass = "top1";
  else if (playerRankObj.numericRank === 2) rankBadgeClass = "top2";
  else if (playerRankObj.numericRank === 3) rankBadgeClass = "top3";

  const rankText = playerRankObj.rankDisplay ? (String(playerRankObj.rankDisplay).startsWith("T-") ? `T-#${String(playerRankObj.rankDisplay).slice(2)}` : `#${playerRankObj.rankDisplay}`) : "#-";

  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  // Ensure game pick points and closest bonuses are up-to-date
  games.forEach(g => calculateGamePicksPoints(g));

  let weekPts = 0;
  let correctCount = 0;

  games.forEach(g => {
    const pk = g.picks ? g.picks[state.selectedPlayer] : null;
    if (pk) {
      weekPts += pk.points || 0;
      if (g.isFinal && pk.points > 0) correctCount++;
    }
  });

  const finalGames = games.filter(g => Boolean(g.isFinal));
  const finalCount = finalGames.length;
  const pickPct = finalCount > 0 ? Math.round((correctCount / finalCount) * 100) : 0;
  const pickUnitText = finalCount > 0 ? `/ ${finalCount}` : `/ 0`;
  const pickPillText = finalCount > 0 ? `${pickPct}% Accuracy` : `—% Accuracy`;

  const weeklyLb = getWeeklyLeaderboard(state.currentWeek);
  const weekRankObj = weeklyLb.find(p => p.name === state.selectedPlayer) || { rankDisplay: "-" };
  const weekRankText = weekRankObj.rankDisplay && weekRankObj.rankDisplay !== "-"
    ? (String(weekRankObj.rankDisplay).startsWith("T-") ? `T-#${String(weekRankObj.rankDisplay).slice(2)}` : `#${weekRankObj.rankDisplay}`)
    : "#-";
  const weekPillText = weekPts > 0 ? `Week ${weekRankText}` : `Week ${state.currentWeek}`;

  const pColor = PLAYER_COLORS[state.selectedPlayer] || "var(--accent-blue)";
  const seasonRec = getPlayerSeasonRecord(state.selectedPlayer);
  const isMyProfile = Boolean(state.myPlayer && state.myPlayer === state.selectedPlayer);

  // Render Player Hero
  heroContainer.className = `player-hero-card ${isMyProfile ? "is-my-profile" : ""}`;
  heroContainer.innerHTML = `
    <div class="player-hero-header">
      <div class="player-hero-identity">
        <div class="player-hero-avatar-wrap">
          ${getPlayerAvatarHtml(state.selectedPlayer, 52)}
        </div>
        <div class="player-hero-info">
          <div class="player-hero-title">
            <span>${state.selectedPlayer}</span>
            ${isMyProfile ? '<span class="leader-you-pill">YOU</span>' : ""}
          </div>
          <div class="player-hero-sub">
            <span class="hero-record-badge">${seasonRec.wins}-${seasonRec.losses} W-L</span>
            <span class="hero-record-pct">(${seasonRec.pct}%)</span>
          </div>
        </div>
      </div>
      <div class="player-hero-rank-badge ${rankBadgeClass}">
        <span class="rank-badge-prefix">RANK</span>
        <span class="rank-badge-value">${rankText}</span>
      </div>
    </div>

    <div class="player-hero-actions-bar">
      <button type="button" class="btn-hero-action btn-hero-compare" onclick="startH2HComparison('${state.selectedPlayer}')" title="Compare against another player in Head-to-Head">
        <span class="action-btn-icon">⚔️</span>
        <span>Compare Players</span>
      </button>
      <button type="button" class="btn-hero-action btn-hero-profile ${isMyProfile ? "is-active" : ""}" onclick="toggleMyProfile('${state.selectedPlayer}')" title="${isMyProfile ? 'You are remembered as this player' : 'Remember me as this player'}">
        <span class="action-btn-icon">${isMyProfile ? "★" : "☆"}</span>
        <span>${isMyProfile ? "Active Profile" : "Set as Me"}</span>
      </button>
    </div>

    <div class="player-stats-row">
      <!-- 1: Season Total Points (Light Blue) -->
      <div class="pstat-tile tile-season">
        <div class="pstat-header-label">SEASON TOTAL</div>
        <div class="pstat-value val-blue">
          <span class="pstat-num">${playerRankObj.points}</span>
          <span class="pstat-unit">PTS</span>
        </div>
        <div class="pstat-footer-pill pill-blue">${rankText}</div>
      </div>

      <!-- 2: Current Week Points (Neon Emerald) -->
      <div class="pstat-tile tile-week">
        <div class="pstat-header-label">${weekKey.toUpperCase()} PTS</div>
        <div class="pstat-value val-green">
          <span class="pstat-num">${weekPts > 0 ? `+${weekPts}` : weekPts}</span>
          <span class="pstat-unit">PTS</span>
        </div>
        <div class="pstat-footer-pill pill-green">${weekPillText}</div>
      </div>

      <!-- 3: Correct Picks & Hit Rate (Athletic Gold) -->
      <div class="pstat-tile tile-picks">
        <div class="pstat-header-label">CORRECT PICKS</div>
        <div class="pstat-value val-gold">
          <span class="pstat-num">${correctCount}</span>
          <span class="pstat-unit">${pickUnitText}</span>
        </div>
        <div class="pstat-footer-pill pill-gold">${pickPillText}</div>
      </div>
    </div>
  `;

  // Render Weekly Picks List
  const weekStat = document.getElementById("player-week-stat");
  if (games.length === 0) {
    if (weekStat) weekStat.innerHTML = "";
    picksContainer.innerHTML = `
      <div class="loading-box"><p>No picks recorded for ${weekKey}</p></div>
      <button class="btn-back-bottom" onclick="switchTab('leaderboard')">← Back to Standings</button>
    `;
    return;
  }

  const totalPicks = games.length;
  const liveCount = games.filter(g => Boolean(g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null))).length;

  if (weekStat) {
    if (liveCount > 0) {
      weekStat.innerHTML = `<span>${totalPicks} Picks</span> &bull; <span class="stat-live-count"><span class="live-pulse-dot"></span>${liveCount} Live</span>`;
    } else {
      weekStat.innerHTML = `<span>${totalPicks} Picks</span> &bull; <span>${finalCount} Final</span>`;
    }
  }

  picksContainer.innerHTML = `
    <table class="player-picks-table">
      <thead>
        <tr>
          <th>Matchup</th>
          <th style="text-align:center;">Pick</th>
          <th style="text-align:center;">Predicted</th>
          <th style="text-align:center;">Result</th>
          <th style="text-align:center;">Pts</th>
        </tr>
      </thead>
      <tbody>
        ${games.map(g => {
          const pk = g.picks ? g.picks[state.selectedPlayer] : null;
          const isFinal = g.isFinal;
          const isLive = Boolean(g.isLive || (!isFinal && g.awayScore !== null && g.homeScore !== null));

          if (!pk || !pk.winner) {
            return `
              <tr class="${isLive ? "is-live-row" : ""}">
                <td>
                  <div style="font-weight:800; color:#fff;">${g.matchup}</div>
                  <div style="font-size:0.68rem; color:var(--text-dim);">${g.dateTime || ""}</div>
                </td>
                <td colspan="4" style="text-align:center; color:var(--text-dim);">No pick submitted</td>
              </tr>
            `;
          }

          const winTeamInfo = NFL_TEAMS[pk.winner] || NFL_TEAMS[normalizeTeamCode(pk.winner)] || { color: '#2a3b50' };
          const winTeamText = getTeamContrastColor(winTeamInfo.color);

          const actualWinnerInfo = NFL_TEAMS[g.winner] || NFL_TEAMS[normalizeTeamCode(g.winner)] || { color: '#2a3b50' };
          const actualWinnerText = getTeamContrastColor(actualWinnerInfo.color);

          let outcomeHtml = "";
          let ptsHtml = "";

          if (isFinal) {
            let resPillClass = "res-lost";
            let resLabel = "LOST";
            if (pk.exact) {
              resPillClass = "res-exact";
              resLabel = `🔮 EXACT (+${pk.bonusPoints})`;
            } else if (pk.isClosest) {
              resPillClass = "res-closest";
              resLabel = `🎯 CLOSEST (+${pk.bonusPoints})`;
            } else if (pk.points > 0) {
              resPillClass = "res-won";
              resLabel = "✅ WON";
            } else {
              resPillClass = "res-lost";
              resLabel = "❌ LOST";
            }

            outcomeHtml = `
              <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;">
                <span class="res-outcome-pill ${resPillClass}">${resLabel}</span>
                <div style="font-size:0.66rem; color:var(--text-dim); display:flex; align-items:center; justify-content:center; gap:4px; flex-wrap:wrap;">
                  <span>Actual:</span>
                  <span class="team-badge-micro" style="background-color: ${actualWinnerInfo.color}; color: ${actualWinnerText};">${g.winner}</span>
                  <span style="font-weight:700; color:var(--text-muted);">${g.awayScore}-${g.homeScore}</span>
                </div>
              </div>
            `;

            ptsHtml = pk.points > 0
              ? `<span class="pts-score-pill pts-won">+${pk.points}</span>`
              : `<span class="pts-score-pill pts-lost">0</span>`;
          } else if (isLive) {
            const possAway = g.possession === 'away';
            const possHome = g.possession === 'home';
            const scoreDisplay = g.awayScore !== null
              ? `${possAway ? '<span class="possession-football-sm" title="Possession">🏈</span> ' : ''}${g.awayScore} - ${g.homeScore}${possHome ? ' <span class="possession-football-sm" title="Possession">🏈</span>' : ''}`
              : '';

            outcomeHtml = `
              <div style="display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <div style="display:inline-flex; align-items:center; justify-content:center; gap:5px; font-size:0.72rem; font-weight:800; white-space:nowrap;">
                  <span class="live-pulse-dot"></span>
                  <span style="color:#f87171;">(${formatQuarterStatus(g.statusDetail) || "LIVE"})</span>
                </div>
                <div style="font-size:0.84rem; font-weight:900; color:#fff; margin-top:2px; display:inline-flex; align-items:center; justify-content:center; gap:4px; white-space:nowrap;">
                  ${scoreDisplay}
                </div>
                ${(g.downDistance || g.isRedZone) ? `
                  <div style="font-size:0.62rem; color:var(--text-muted); margin-top:2px; display:inline-flex; align-items:center; justify-content:center; gap:3px; font-weight:600; white-space:nowrap;">
                    ${g.downDistance ? `<span>${g.downDistance}</span>` : ''}
                    ${g.isRedZone ? `<span class="redzone-tag" style="font-size:0.6rem;">🔴 RZ</span>` : ''}
                  </div>
                ` : ''}
              </div>
            `;

            ptsHtml = `<span class="pts-score-pill pts-pending" title="In progress">—</span>`;
          } else {
            outcomeHtml = `<span class="res-outcome-pill res-pending">Upcoming</span>`;
            ptsHtml = `<span class="pts-score-pill pts-pending">—</span>`;
          }

          const hasPredScores = pk.awayScore !== null && pk.awayScore !== "" && !isNaN(pk.awayScore);

          return `
            <tr class="${isLive ? "is-live-row" : ""}">
              <td>
                <div style="font-weight:800; color:#fff;">${g.matchup}</div>
                <div style="font-size:0.68rem; color:var(--text-dim);">${g.dateTime || ""}</div>
              </td>
              <td style="text-align:center;">
                <div style="display:inline-flex; flex-direction:column; align-items:center; gap:3px;">
                  <span class="team-badge-sm" style="background-color: ${winTeamInfo.color}; color: ${winTeamText};">${pk.winner}</span>
                  ${pk.multiplier ? `<span class="chip-mult" style="font-size:0.60rem; padding:1px 4px; border-radius:3px;">⭐ 3X</span>` : ""}
                </div>
              </td>
              <td style="text-align:center;">
                ${hasPredScores ? `
                  <span class="pred-score-capsule">${pk.awayScore}-${pk.homeScore}</span>
                ` : `<span style="color:var(--text-dim);">-</span>`}
              </td>
              <td style="text-align:center;">
                ${outcomeHtml}
              </td>
              <td style="text-align:center;">
                ${ptsHtml}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>

    <div style="margin-top:16px; margin-bottom:8px;">
      <button class="btn-back-bottom" onclick="switchTab('leaderboard')">
        ← Back to Standings
      </button>
    </div>
  `;
}

function openPlayer(playerName) {
  state.selectedPlayer = playerName;
  state.playerViewMode = "single";
  switchTab("players");
  
  // Center active player pill
  setTimeout(() => {
    const activePill = document.querySelector(`.player-filter-pill.active`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, 100);
}

// =========================================================
// HEAD-TO-HEAD (H2H) RIVALRY DIVERGENCE ENGINE
// =========================================================

function setPlayerViewMode(mode) {
  state.playerViewMode = mode;
  renderPlayers();
  saveNavState();
}

function startH2HComparison(playerA, playerB) {
  state.h2hPlayerA = playerA || state.selectedPlayer || PLAYERS[0];
  if (playerB) {
    state.h2hPlayerB = playerB;
  } else if (state.myPlayer && state.myPlayer !== state.h2hPlayerA) {
    state.h2hPlayerB = state.myPlayer;
  } else {
    state.h2hPlayerB = PLAYERS.find(p => p !== state.h2hPlayerA) || PLAYERS[1];
  }
  state.playerViewMode = "h2h";
  switchTab("players");
}

function swapH2HPlayers() {
  const temp = state.h2hPlayerA;
  state.h2hPlayerA = state.h2hPlayerB;
  state.h2hPlayerB = temp;
  renderH2H();
  saveNavState();
}

function setH2HFilter(filter) {
  state.h2hFilter = filter;
  renderH2H();
  saveNavState();
}

function openH2HPicker(slot) {
  state.h2hPickerSlot = slot;
  const modal = document.getElementById("h2h-picker-modal");
  const title = document.getElementById("h2h-picker-title");
  const grid = document.getElementById("h2h-picker-grid");
  if (!modal || !grid) return;

  const currentSelected = slot === 'A' ? state.h2hPlayerA : state.h2hPlayerB;
  const otherSelected = slot === 'A' ? state.h2hPlayerB : state.h2hPlayerA;

  if (title) {
    title.textContent = `Select Player ${slot === 'A' ? 'A (Left)' : 'B (Right)'}`;
  }

  const seasonLb = getSeasonLeaderboard();

  grid.innerHTML = PLAYERS.map(pName => {
    const isSelected = pName === currentSelected;
    const isOther = pName === otherSelected;
    const isMe = Boolean(state.myPlayer && state.myPlayer === pName);
    const pObj = seasonLb.find(p => p.name === pName) || { rankDisplay: "-", points: 0 };

    return `
      <div class="h2h-picker-item ${isSelected ? "active" : ""}" onclick="selectH2HPlayer('${pName}')">
        ${getPlayerAvatarHtml(pName, 32)}
        <div style="min-width:0; flex:1;">
          <div style="display:flex; align-items:center; gap:4px; overflow:hidden;">
            <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:800;">${pName}</span>
            ${isMe ? `<span style="font-size:0.6rem; background:rgba(56,189,248,0.25); color:var(--accent-cyan); padding:1px 4px; border-radius:4px; font-weight:800;">YOU</span>` : ""}
          </div>
          <div style="font-size:0.68rem; color:var(--text-muted); font-weight:600; margin-top:2px;">
            Rank #${pObj.rankDisplay} • ${pObj.points} pts
          </div>
        </div>
        ${isSelected ? `<span style="color:var(--accent-cyan); font-weight:900;">✓</span>` : isOther ? `<span style="font-size:0.65rem; color:var(--text-dim);">(Slot ${slot === 'A' ? 'B' : 'A'})</span>` : ""}
      </div>
    `;
  }).join("");

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function selectH2HPlayer(pName) {
  if (state.h2hPickerSlot === 'A') {
    if (pName === state.h2hPlayerB) {
      state.h2hPlayerB = state.h2hPlayerA;
    }
    state.h2hPlayerA = pName;
  } else {
    if (pName === state.h2hPlayerA) {
      state.h2hPlayerA = state.h2hPlayerB;
    }
    state.h2hPlayerB = pName;
  }

  closeH2HPicker();
  renderH2H();
  saveNavState();
}

function closeH2HPicker(event) {
  if (event && event.target && event.target.id !== "h2h-picker-modal" && !event.target.classList.contains("h2h-picker-close")) {
    return;
  }
  const modal = document.getElementById("h2h-picker-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

function renderH2H() {
  const container = document.getElementById("player-h2h-view");
  if (!container) return;

  if (!state.data) {
    container.innerHTML = `
      <div class="loading-box"><p>Loading player data...</p></div>
    `;
    return;
  }

  // Initialize and validate selected players
  if (!state.h2hPlayerA) {
    state.h2hPlayerA = state.selectedPlayer || PLAYERS[0];
  }
  if (!state.h2hPlayerB || state.h2hPlayerB === state.h2hPlayerA) {
    if (state.myPlayer && state.myPlayer !== state.h2hPlayerA) {
      state.h2hPlayerB = state.myPlayer;
    } else {
      state.h2hPlayerB = PLAYERS.find(p => p !== state.h2hPlayerA) || PLAYERS[1];
    }
  }

  const playerA = state.h2hPlayerA;
  const playerB = state.h2hPlayerB;
  const isMeA = Boolean(state.myPlayer && state.myPlayer === playerA);
  const isMeB = Boolean(state.myPlayer && state.myPlayer === playerB);

  // Season Stats
  const seasonLb = getSeasonLeaderboard();
  const statA = seasonLb.find(p => p.name === playerA) || { rankDisplay: "-", points: 0, rec: { label: "0-0 W-L", text: "0-0 W-L" } };
  const statB = seasonLb.find(p => p.name === playerB) || { rankDisplay: "-", points: 0, rec: { label: "0-0 W-L", text: "0-0 W-L" } };

  const recTextA = statA.rec ? (statA.rec.label || statA.rec.text || `${statA.rec.wins ?? 0}-${statA.rec.losses ?? 0} W-L`) : "0-0 W-L";
  const recTextB = statB.rec ? (statB.rec.label || statB.rec.text || `${statB.rec.wins ?? 0}-${statB.rec.losses ?? 0} W-L`) : "0-0 W-L";
  const rankA = statA.rankDisplay ? (String(statA.rankDisplay).startsWith("T-") ? `T-#${String(statA.rankDisplay).slice(2)}` : `#${statA.rankDisplay}`) : "#-";
  const rankB = statB.rankDisplay ? (String(statB.rankDisplay).startsWith("T-") ? `T-#${String(statB.rankDisplay).slice(2)}` : `#${statB.rankDisplay}`) : "#-";

  const seasonDiff = (statA.points || 0) - (statB.points || 0);

  // Week Data & Calculations
  const weekKey = `Week ${state.currentWeek}`;
  const wkShort = `Wk ${state.currentWeek}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  games.forEach(g => calculateGamePicksPoints(g));

  let weekPtsA = 0;
  let weekPtsB = 0;
  let swingGamesCount = 0;
  let agreedGamesCount = 0;

  const comparisonGames = games.map((g, idx) => {
    const pkA = g.picks ? g.picks[playerA] : null;
    const pkB = g.picks ? g.picks[playerB] : null;

    const pickAWinner = pkA && pkA.winner ? pkA.winner : "";
    const pickBWinner = pkB && pkB.winner ? pkB.winner : "";

    const ptsA = pkA ? pkA.points || 0 : 0;
    const ptsB = pkB ? pkB.points || 0 : 0;

    weekPtsA += ptsA;
    weekPtsB += ptsB;

    const isSwing = Boolean(pickAWinner && pickBWinner && normalizeTeamCode(pickAWinner) !== normalizeTeamCode(pickBWinner));
    const isAgreed = Boolean(pickAWinner && pickBWinner && normalizeTeamCode(pickAWinner) === normalizeTeamCode(pickBWinner));

    if (isSwing) swingGamesCount++;
    if (isAgreed) agreedGamesCount++;

    return {
      game: g,
      idx,
      pkA,
      pkB,
      isSwing,
      isAgreed
    };
  });

  const weekDiff = weekPtsA - weekPtsB;
  const totalDecided = swingGamesCount + agreedGamesCount;
  const agreedPct = totalDecided > 0 ? Math.round((agreedGamesCount / totalDecided) * 100) : 50;
  const swingPct = totalDecided > 0 ? (100 - agreedPct) : 50;

  // Filter games based on selected filter
  const filter = state.h2hFilter || "swing";
  const displayGames = comparisonGames.filter(cg => {
    if (filter === "swing") return cg.isSwing;
    if (filter === "agreed") return cg.isAgreed;
    return true; // "all"
  });

  // Build HTML
  let html = `
    <!-- 1. DUAL PLAYER SELECTORS & SWAP BUTTON -->
    <div class="h2h-selectors-card">
      <div class="h2h-player-select-wrap">
        <span class="h2h-select-label">Player A</span>
        <button type="button" class="h2h-select-btn" onclick="openH2HPicker('A')" title="Change Player A">
          ${getPlayerAvatarHtml(playerA, 28)}
          <span class="h2h-select-name">${playerA}${isMeA ? " (You)" : ""}</span>
          <span class="h2h-select-arrow">▼</span>
        </button>
      </div>

      <button type="button" class="h2h-swap-btn" onclick="swapH2HPlayers()" title="Swap Player A and Player B" aria-label="Swap Player A and Player B">
        ⇄
      </button>

      <div class="h2h-player-select-wrap">
        <span class="h2h-select-label" style="text-align:right;">Player B</span>
        <button type="button" class="h2h-select-btn" onclick="openH2HPicker('B')" title="Change Player B">
          ${getPlayerAvatarHtml(playerB, 28)}
          <span class="h2h-select-name">${playerB}${isMeB ? " (You)" : ""}</span>
          <span class="h2h-select-arrow">▼</span>
        </button>
      </div>
    </div>

    <!-- 2. TALE OF THE TAPE SHOWDOWN HERO -->
    <div class="h2h-hero-showdown">
      <div class="h2h-tale-tape">
        <!-- Fighter A (Left) -->
        <div class="h2h-fighter">
          <div class="h2h-fighter-rank-badge ${statA.numericRank === 1 ? 'rank-gold' : statA.numericRank === 2 ? 'rank-silver' : statA.numericRank === 3 ? 'rank-bronze' : ''}">
            Rank ${rankA}
          </div>
          ${getPlayerAvatarHtml(playerA, 52)}
          <div class="h2h-fighter-name">
            <span>${playerA}</span>
            ${isMeA ? `<span class="leader-you-pill">YOU</span>` : ""}
          </div>
          <div class="h2h-fighter-points-wrap">
            <span class="h2h-fighter-pts-num">${statA.points}</span>
            <span class="h2h-fighter-pts-lbl">PTS</span>
          </div>
          <div class="h2h-fighter-rec-capsule">${recTextA}</div>
          <div class="h2h-fighter-week-gain">+${weekPtsA} in ${wkShort}</div>
        </div>

        <!-- Center Clash & Net Differentials -->
        <div class="h2h-center-clash">
          <div class="h2h-vs-badge">⚔️ VS ⚔️</div>
          <div class="h2h-lead-chip lead-season">
            <span class="lead-chip-tag">SEASON</span>
            <span class="lead-chip-val">${seasonDiff > 0 ? `+${seasonDiff} ${playerA}` : seasonDiff < 0 ? `+${Math.abs(seasonDiff)} ${playerB}` : "TIED"}</span>
          </div>
          <div class="h2h-lead-chip lead-week">
            <span class="lead-chip-tag">${weekKey.toUpperCase()}</span>
            <span class="lead-chip-val">${weekDiff > 0 ? `+${weekDiff} ${playerA}` : weekDiff < 0 ? `+${Math.abs(weekDiff)} ${playerB}` : "TIED"}</span>
          </div>
        </div>

        <!-- Fighter B (Right) -->
        <div class="h2h-fighter">
          <div class="h2h-fighter-rank-badge ${statB.numericRank === 1 ? 'rank-gold' : statB.numericRank === 2 ? 'rank-silver' : statB.numericRank === 3 ? 'rank-bronze' : ''}">
            Rank ${rankB}
          </div>
          ${getPlayerAvatarHtml(playerB, 52)}
          <div class="h2h-fighter-name">
            <span>${playerB}</span>
            ${isMeB ? `<span class="leader-you-pill">YOU</span>` : ""}
          </div>
          <div class="h2h-fighter-points-wrap">
            <span class="h2h-fighter-pts-num">${statB.points}</span>
            <span class="h2h-fighter-pts-lbl">PTS</span>
          </div>
          <div class="h2h-fighter-rec-capsule">${recTextB}</div>
          <div class="h2h-fighter-week-gain">+${weekPtsB} in ${wkShort}</div>
        </div>
      </div>
    </div>

    <!-- 3. AGREEMENT VS DIVERGENCE METER -->
    <div class="h2h-divergence-card">
      <div class="h2h-divergence-row">
        <span class="h2h-meter-pill pill-agreed">
          <span class="meter-pill-dot dot-agreed"></span> <strong>${agreedGamesCount} Agreed</strong> (${agreedPct}%)
        </span>
        <span class="h2h-meter-pill pill-swing">
          <span class="meter-pill-dot dot-swing"></span> <strong>${swingGamesCount} Swing Games</strong> (${swingPct}%)
        </span>
      </div>
      <div class="h2h-meter-track" title="${agreedGamesCount} agreed (${agreedPct}%), ${swingGamesCount} swing (${swingPct}%)">
        <div class="h2h-meter-agreed" style="width: ${agreedPct}%;"></div>
        <div class="h2h-meter-swing" style="width: ${swingPct}%;"></div>
      </div>
      <div style="font-size:0.72rem; color:var(--text-muted); margin-top:6px; text-align:center;">
        ${swingGamesCount === 0
          ? `🤝 Full Consensus — Both players made identical winner predictions for all games in ${weekKey}!`
          : `⚡ <strong>${swingGamesCount}</strong> game${swingGamesCount === 1 ? '' : 's'} where picks differ will determine this matchup in ${weekKey}.`}
      </div>
    </div>

    <!-- 4. FILTER PILLS: SWING GAMES VS AGREED VS ALL GAMES -->
    <div class="h2h-filter-row">
      <div style="font-size:0.78rem; font-weight:800; color:#fff; text-transform:uppercase; letter-spacing:0.5px;">
        ${filter === "swing" ? `⚡ Swing Games (${swingGamesCount})` : filter === "agreed" ? `🤝 Agreed Picks (${agreedGamesCount})` : `📋 All Games (${games.length})`}
      </div>
      <div class="h2h-filter-group">
        <button type="button" class="h2h-filter-btn ${filter === "swing" ? "active" : ""}" onclick="setH2HFilter('swing')">
          ⚡ Swings (${swingGamesCount})
        </button>
        <button type="button" class="h2h-filter-btn ${filter === "agreed" ? "active" : ""}" onclick="setH2HFilter('agreed')">
          🤝 Agreed (${agreedGamesCount})
        </button>
        <button type="button" class="h2h-filter-btn ${filter === "all" ? "active" : ""}" onclick="setH2HFilter('all')">
          All (${games.length})
        </button>
      </div>
    </div>
  `;

  // 5. SIDE-BY-SIDE MATCHUP CARDS
  if (filter === "swing" && swingGamesCount === 0) {
    html += `
      <div class="loading-box" style="padding:28px 16px; text-align:center; background:var(--bg-card); border-radius:var(--border-radius); border:1px solid var(--border-color); margin-bottom:14px;">
        <div style="font-size:2.2rem; margin-bottom:8px;">🤝</div>
        <div style="font-size:0.95rem; font-weight:900; color:#fff; margin-bottom:4px;">No Swing Games in ${weekKey}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:14px;">Both ${playerA} and ${playerB} submitted identical winner picks for every game this week!</div>
        <button type="button" class="h2h-filter-btn active" onclick="setH2HFilter('all')" style="padding:6px 14px; font-size:0.76rem;">
          📋 View All ${games.length} Games
        </button>
      </div>
    `;
  } else if (filter === "agreed" && agreedGamesCount === 0) {
    html += `
      <div class="loading-box" style="padding:28px 16px; text-align:center; background:var(--bg-card); border-radius:var(--border-radius); border:1px solid var(--border-color); margin-bottom:14px;">
        <div style="font-size:2.2rem; margin-bottom:8px;">⚡</div>
        <div style="font-size:0.95rem; font-weight:900; color:#fff; margin-bottom:4px;">No Agreed Games in ${weekKey}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:14px;">Total divergence! ${playerA} and ${playerB} picked different winners on every single game this week.</div>
        <button type="button" class="h2h-filter-btn active" onclick="setH2HFilter('all')" style="padding:6px 14px; font-size:0.76rem;">
          📋 View All ${games.length} Games
        </button>
      </div>
    `;
  } else if (displayGames.length === 0) {
    html += `
      <div class="loading-box" style="padding:24px 16px; text-align:center;">
        <p style="color:var(--text-dim);">No games recorded for ${weekKey}</p>
      </div>
    `;
  } else {
    html += displayGames.map(({ game, idx, pkA, pkB, isSwing, isAgreed }) => {
      const isFinal = game.isFinal;

      // Helper to generate player pick display
      const getPickColHtml = (pk, isPlayerB = false) => {
        if (!pk || !pk.winner) {
          return `
            <div class="h2h-pick-col ${isPlayerB ? 'player-b' : ''}">
              <div class="h2h-pick-chip-box">
                <span style="color:var(--text-dim); font-size:0.72rem;">No pick</span>
              </div>
              <div class="h2h-pick-outcome pending">-</div>
            </div>
          `;
        }

        const tmInfo = NFL_TEAMS[pk.winner] || NFL_TEAMS[normalizeTeamCode(pk.winner)] || { color: '#2a3b50' };
        const tmText = getTeamContrastColor(tmInfo.color);
        const scoreStr = (pk.awayScore !== null && pk.homeScore !== null) ? `${pk.awayScore}-${pk.homeScore}` : "-";

        let outcomeText = "Pending";
        let outcomeClass = "pending";

        if (isFinal) {
          if (pk.exact) {
            outcomeText = `🔮 EXACT (+${pk.points})`;
            outcomeClass = "win";
          } else if (pk.isClosest) {
            outcomeText = `🎯 CLOSEST (+${pk.points})`;
            outcomeClass = "win";
          } else if (pk.points > 0) {
            outcomeText = `🎯 WON (+${pk.points})`;
            outcomeClass = "win";
          } else {
            outcomeText = `❌ MISSED`;
            outcomeClass = "loss";
          }
        }

        const badgeHtml = `<span class="h2h-pick-team-badge" style="background-color: ${tmInfo.color}; color: ${tmText};">${pk.winner}</span>`;
        const scoreHtml = `<span class="h2h-pick-score-text">${scoreStr}</span>`;

        // For player B, score on left, badge on right; for Player A, badge on left, score on right
        const chipContent = isPlayerB
          ? `${scoreHtml} ${badgeHtml}`
          : `${badgeHtml} ${scoreHtml}`;

        return `
          <div class="h2h-pick-col ${isPlayerB ? 'player-b' : ''}">
            <div class="h2h-pick-chip-box">
              ${chipContent}
            </div>
            <div class="h2h-pick-outcome ${outcomeClass}">${outcomeText}</div>
          </div>
        `;
      };

      // Middle Actual Score / Game Status
      const isLive = Boolean(game.isLive || (!isFinal && game.awayScore !== null && game.homeScore !== null));
      let centerScoreHtml = "";
      if (isFinal) {
        centerScoreHtml = `
          <span class="h2h-game-actual-score">${game.awayScore} - ${game.homeScore}</span>
          <span style="font-size:0.62rem; color:var(--accent-green); font-weight:800; text-transform:uppercase;">${formatQuarterStatus(game.statusDetail) || "FINAL"}</span>
        `;
      } else if (isLive) {
        let liveDetail = formatQuarterStatus(game.statusDetail) || "LIVE";
        if (game.downDistance) liveDetail += ` • ${game.downDistance}`;
        const possAway = game.possession === 'away';
        const possHome = game.possession === 'home';
        centerScoreHtml = `
          <span class="h2h-game-actual-score" style="color:#f87171;">
            ${possAway ? '<span class="possession-football-sm" title="Possession">🏈</span> ' : ''}${game.awayScore} - ${game.homeScore}${possHome ? ' <span class="possession-football-sm" title="Possession">🏈</span>' : ''}
          </span>
          <span class="h2h-live-tag"><span class="live-pulse-dot"></span> ${liveDetail}</span>
        `;
      } else {
        centerScoreHtml = `
          <span style="font-size:0.85rem; font-weight:800; color:var(--text-dim);">@</span>
          <span style="font-size:0.62rem; color:var(--text-muted); font-weight:700;">${game.dateTime || "Upcoming"}</span>
        `;
      }

      // Footer callout
      let footerHtml = "";
      if (isSwing) {
        const pkAWinner = pkA ? pkA.winner : "None";
        const pkBWinner = pkB ? pkB.winner : "None";
        let swingResult = "";
        if (isFinal) {
          const normWinner = normalizeTeamCode(game.winner);
          if (normWinner === normalizeTeamCode(pkAWinner)) {
            swingResult = `<strong style="color:var(--accent-green);">+${pkA ? pkA.points : 0} pts to ${playerA}</strong>`;
          } else if (normWinner === normalizeTeamCode(pkBWinner)) {
            swingResult = `<strong style="color:var(--accent-green);">+${pkB ? pkB.points : 0} pts to ${playerB}</strong>`;
          } else {
            swingResult = `<span style="color:var(--text-dim);">0 pts awarded</span>`;
          }
        } else if (isLive) {
          swingResult = `<span style="color:#f87171; font-weight:700;"><span class="live-pulse-dot"></span> Live in progress</span>`;
        } else {
          swingResult = `<span style="color:var(--text-muted);">Points at stake</span>`;
        }

        footerHtml = `
          <div class="h2h-card-footer">
            <span class="h2h-swing-callout">
              <span>⚡</span> Swing: ${playerA} (${pkAWinner}) vs ${playerB} (${pkBWinner})
            </span>
            <span>${swingResult}</span>
          </div>
        `;
      } else if (isAgreed) {
        const agreedWinner = pkA ? pkA.winner : "";
        let agreedResult = "";
        if (isFinal) {
          const normWinner = normalizeTeamCode(game.winner);
          if (normWinner === normalizeTeamCode(agreedWinner)) {
            const ptsEarnedA = pkA ? pkA.points : 0;
            const ptsEarnedB = pkB ? pkB.points : 0;
            agreedResult = `<strong style="color:var(--accent-green);">+${ptsEarnedA} / +${ptsEarnedB} earned</strong>`;
          } else {
            agreedResult = `<span style="color:#f87171;">Both missed</span>`;
          }
        } else if (isLive) {
          agreedResult = `<span style="color:#f87171; font-weight:700;"><span class="live-pulse-dot"></span> Live in progress</span>`;
        } else {
          agreedResult = `<span style="color:var(--text-muted);">Points shared</span>`;
        }

        footerHtml = `
          <div class="h2h-card-footer">
            <span class="h2h-agreed-callout">
              <span>🤝</span> Both picked ${agreedWinner}
            </span>
            <span>${agreedResult}</span>
          </div>
        `;
      }

      return `
        <article class="h2h-game-card ${isSwing ? 'is-swing' : 'is-agreed'}">
          <div class="h2h-game-header">
            <span style="font-weight:800; color:#fff;">${game.matchup}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="color:var(--text-dim); font-size:0.68rem;">${game.dateTime}</span>
              ${isSwing
                ? `<span style="font-size:0.62rem; background:rgba(245,158,11,0.2); color:var(--accent-gold); border:1px solid rgba(245,158,11,0.4); padding:1px 6px; border-radius:10px; font-weight:800;">SWING</span>`
                : `<span style="font-size:0.62rem; background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); padding:1px 6px; border-radius:10px; font-weight:800;">AGREED</span>`}
            </div>
          </div>
          <div class="h2h-card-body">
            ${getPickColHtml(pkA, false)}
            <div class="h2h-card-center-score">
              ${centerScoreHtml}
            </div>
            ${getPickColHtml(pkB, true)}
          </div>
          ${footerHtml}
        </article>
      `;
    }).join("");
  }

  html += `
    <div style="margin-top:16px; margin-bottom:8px; display:flex; gap:10px;">
      <button type="button" class="btn-back-bottom" onclick="setPlayerViewMode('single')" style="flex:1;">
        👤 View ${playerA} Scorecard
      </button>
      <button type="button" class="btn-back-bottom" onclick="switchTab('leaderboard')" style="flex:1;">
        ← Standings
      </button>
    </div>
  `;

  container.innerHTML = html;
}

// =========================================================
// TAB 4: NFL STANDINGS RENDERING
// =========================================================
function renderNFLStandings() {
  const playoffContainer = document.getElementById("nfl-playoff-container");
  const divisionsContainer = document.getElementById("nfl-divisions-container");
  if (!playoffContainer || !divisionsContainer) return;

  const fallbackAFC = [
    { seed: "1", team: "KC" },
    { seed: "2", team: "BUF" },
    { seed: "3", team: "PIT" },
    { seed: "4", team: "JAX" },
    { seed: "5", team: "LV" },
    { seed: "6", team: "BAL" },
    { seed: "7", team: "CIN" }
  ];

  const fallbackNFC = [
    { seed: "1", team: "SF" },
    { seed: "2", team: "MIN" },
    { seed: "3", team: "NYG" },
    { seed: "4", team: "CAR" },
    { seed: "5", team: "DET" },
    { seed: "6", team: "CHI" },
    { seed: "7", team: "SEA" }
  ];

  const afcPlayoffs = (state.nflStandings && state.nflStandings.afcPlayoffs && state.nflStandings.afcPlayoffs.length > 0)
    ? state.nflStandings.afcPlayoffs
    : fallbackAFC;

  const nfcPlayoffs = (state.nflStandings && state.nflStandings.nfcPlayoffs && state.nflStandings.nfcPlayoffs.length > 0)
    ? state.nflStandings.nfcPlayoffs
    : fallbackNFC;

  playoffContainer.innerHTML = `
    <!-- AFC Conference -->
    <div class="conference-card">
      <div class="conference-title afc">
        <span>AFC Seeds</span>
        <span style="font-size:0.7rem;">7 In</span>
      </div>
      <div class="playoff-seed-list">
        ${afcPlayoffs.map(s => {
          const tmInfo = NFL_TEAMS[s.team] || { color: '#2a3b50' };
          const tmText = getTeamContrastColor(tmInfo.color);
          return `
            <div class="seed-row">
              <div class="seed-left">
                <span class="seed-num">#${s.seed}</span>
                <span class="team-badge-sm" style="background-color: ${tmInfo.color}; color: ${tmText}; font-size:0.65rem; padding: 1px 5px; border-radius:4px;">${s.team}</span>
              </div>
              <span class="seed-tag ${s.seed === "1" ? "bye" : ""}">${s.seed === "1" ? "BYE" : "WILD CARD"}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- NFC Conference -->
    <div class="conference-card">
      <div class="conference-title nfc">
        <span>NFC Seeds</span>
        <span style="font-size:0.7rem;">7 In</span>
      </div>
      <div class="playoff-seed-list">
        ${nfcPlayoffs.map(s => {
          const tmInfo = NFL_TEAMS[s.team] || { color: '#2a3b50' };
          const tmText = getTeamContrastColor(tmInfo.color);
          return `
            <div class="seed-row">
              <div class="seed-left">
                <span class="seed-num">#${s.seed}</span>
                <span class="team-badge-sm" style="background-color: ${tmInfo.color}; color: ${tmText}; font-size:0.65rem; padding: 1px 5px; border-radius:4px;">${s.team}</span>
              </div>
              <span class="seed-tag ${s.seed === "1" ? "bye" : ""}">${s.seed === "1" ? "BYE" : "WILD CARD"}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  // Standard NFL Divisions - Paired AFC (left) / NFC (right)
  const divisions = [
    { name: "AFC West", teams: [ { t: "KC", w: 3, l: 0 }, { t: "LV", w: 3, l: 0 }, { t: "DEN", w: 2, l: 1 }, { t: "LAC", w: 0, l: 3 } ] },
    { name: "NFC West", teams: [ { t: "SF", w: 3, l: 0 }, { t: "SEA", w: 2, l: 1 }, { t: "LAR", w: 1, l: 2 }, { t: "AZ", w: 1, l: 2 } ] },
    { name: "AFC East", teams: [ { t: "BUF", w: 3, l: 0 }, { t: "NYJ", w: 1, l: 2 }, { t: "NE", w: 1, l: 2 }, { t: "MIA", w: 0, l: 3 } ] },
    { name: "NFC East", teams: [ { t: "PHI", w: 2, l: 0 }, { t: "NYG", w: 2, l: 1 }, { t: "DAL", w: 1, l: 2 }, { t: "WSH", w: 1, l: 2 } ] },
    { name: "AFC North", teams: [ { t: "BAL", w: 2, l: 1 }, { t: "CLE", w: 2, l: 1 }, { t: "PIT", w: 2, l: 1 }, { t: "CIN", w: 2, l: 1 } ] },
    { name: "NFC North", teams: [ { t: "MIN", w: 3, l: 0 }, { t: "DET", w: 2, l: 1 }, { t: "CHI", w: 1, l: 1 }, { t: "GB", w: 1, l: 2 } ] },
    { name: "AFC South", teams: [ { t: "JAX", w: 2, l: 1 }, { t: "IND", w: 1, l: 2 }, { t: "HOU", w: 0, l: 3 }, { t: "TEN", w: 0, l: 3 } ] },
    { name: "NFC South", teams: [ { t: "NO", w: 1, l: 2 }, { t: "ATL", w: 1, l: 2 }, { t: "CAR", w: 1, l: 2 }, { t: "TB", w: 0, l: 3 } ] }
  ];

  divisionsContainer.innerHTML = divisions.map(div => {
    const isAfc = div.name.startsWith("AFC");
    const confClass = isAfc ? "afc" : "nfc";
    return `
      <div class="division-card">
        <div class="division-header">
          <span class="division-title ${confClass}">${div.name}</span>
          <span class="division-wl-header">W-L</span>
        </div>
        <table class="division-table">
          <tbody>
            ${div.teams.map(tm => {
              const tmInfo = NFL_TEAMS[tm.t] || { color: '#2a3b50' };
              const tmText = getTeamContrastColor(tmInfo.color);
              return `
                <tr>
                  <td>
                    <span class="team-badge-sm" style="background-color: ${tmInfo.color}; color: ${tmText}; font-size: 0.65rem; padding: 1.5px 6px; border-radius: 4px; min-width: 32px; text-align: center;">${tm.t}</span>
                  </td>
                  <td class="division-record">${tm.w} - ${tm.l}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }).join("");
}

// =========================================================
// TOAST NOTIFICATION UTILITY
// =========================================================
let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById("toast-notice");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// =========================================================
// PERSONALIZATION & "REMEMBER ME" ENGINE
// =========================================================
function renderHeaderProfile() {
  const btn = document.getElementById("btn-header-profile");
  if (!btn) return;

  if (state.myPlayer) {
    btn.className = "header-profile-btn has-user";
    btn.innerHTML = `
      <div class="header-profile-avatar-wrap">
        ${getPlayerAvatarHtml(state.myPlayer, 26)}
      </div>
      <div class="header-profile-text-wrap">
        <span class="header-profile-name">${state.myPlayer}</span>
        <span class="header-profile-tag">YOU</span>
      </div>
    `;
    btn.title = `Remembered as ${state.myPlayer} (Tap to change)`;
  } else {
    btn.className = "header-profile-btn not-set";
    btn.innerHTML = `
      <span class="header-profile-icon">👤</span>
      <span class="header-profile-text">Set Me</span>
    `;
    btn.title = "Personalize: Choose your profile on this device";
  }
}

function setMyPlayer(playerName) {
  if (playerName && PLAYERS.includes(playerName)) {
    state.myPlayer = playerName;
    state.selectedPlayer = playerName;
    try {
      localStorage.setItem(SAVED_USER_KEY, playerName);
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    showToast(`⭐ Remembered as ${playerName}! Your picks are highlighted.`);
  } else {
    state.myPlayer = null;
    try {
      localStorage.removeItem(SAVED_USER_KEY);
    } catch (e) {
      console.warn("Could not remove from localStorage:", e);
    }
    showToast("👤 Profile cleared (Browsing as Guest)");
  }

  closeProfileModal();
  renderApp();
}

function toggleMyProfile(playerName) {
  if (state.myPlayer === playerName) {
    openProfileModal();
  } else {
    setMyPlayer(playerName);
  }
}

function openProfileModal() {
  const modal = document.getElementById("profile-modal");
  const grid = document.getElementById("profile-modal-grid");
  if (!modal || !grid) return;

  const lb = getSeasonLeaderboard();

  grid.innerHTML = PLAYERS.map(pName => {
    const isCurrent = Boolean(state.myPlayer && state.myPlayer === pName);
    const playerRankObj = lb.find(p => p.name === pName) || { rankDisplay: "-", points: 0 };
    const rankLabel = playerRankObj.rankDisplay ? (String(playerRankObj.rankDisplay).startsWith("T-") ? `T-#${String(playerRankObj.rankDisplay).slice(2)}` : `#${playerRankObj.rankDisplay}`) : "#-";
    return `
      <div class="profile-choice-card ${isCurrent ? "active" : ""}" onclick="setMyPlayer('${pName}')">
        <div class="choice-avatar">
          ${getPlayerAvatarHtml(pName, 40)}
        </div>
        <div class="choice-info">
          <div class="choice-name">
            <span>${pName}</span>
            ${isCurrent ? `<span class="choice-current-badge">YOU</span>` : ""}
          </div>
          <div class="choice-stats">Rank ${rankLabel} • ${playerRankObj.points} PTS</div>
        </div>
        <div class="choice-action">
          ${isCurrent ? `<span class="choice-check">✓</span>` : `<span class="choice-select-btn">Select</span>`}
        </div>
      </div>
    `;
  }).join("");

  const clearBtn = document.getElementById("btn-clear-profile");
  if (clearBtn) {
    clearBtn.style.display = state.myPlayer ? "inline-block" : "none";
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeProfileModal(event) {
  if (event && event.target && event.target.id !== "profile-modal" && !event.target.classList.contains("profile-modal-close") && !event.target.classList.contains("btn-modal-done")) {
    return;
  }
  const modal = document.getElementById("profile-modal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
}

// Close modals on ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProfileModal();
    closeH2HPicker();
  }
});

// Expose navigation handlers globally for inline HTML onclicks
window.openPlayer = openPlayer;
window.switchTab = switchTab;
window.saveNavState = saveNavState;
window.restoreNavState = restoreNavState;
window.toggleMatchupCollapse = toggleMatchupCollapse;
window.toggleAllMatchups = toggleAllMatchups;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.setMyPlayer = setMyPlayer;
window.toggleMyProfile = toggleMyProfile;
window.setPlayerViewMode = setPlayerViewMode;
window.startH2HComparison = startH2HComparison;
window.openH2HPicker = openH2HPicker;
window.selectH2HPlayer = selectH2HPlayer;
window.closeH2HPicker = closeH2HPicker;
window.swapH2HPlayers = swapH2HPlayers;
window.setH2HFilter = setH2HFilter;

// Browser Back / Forward navigation support
window.addEventListener("hashchange", () => {
  restoreNavState();
  switchTab(state.activeTab, false);
});
