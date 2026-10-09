/**
 * SPORTS PSYCHIC - Unified Engine & Multi-League Platform
 * Real-time sync with ESPN Scoreboard & Standings API, Supabase Cloud Storage,
 * player scorecards, live standings, split matchups, and closest score bonus calculations.
 */

// =========================================================
// CONFIGURATION & CONSTANTS
// =========================================================

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
  "Dishman": "avatars/dishman.jpg?v=2"
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

function getUserAvatarHtml(size = 28) {
  if (state.myPlayer && PLAYER_AVATARS[state.myPlayer]) {
    return getPlayerAvatarHtml(state.myPlayer, size);
  }
  const photo = state.userProfile?.avatar_url || (state.authUser?.user_metadata && state.authUser.user_metadata.avatar_url);
  const displayName = state.myPlayer || (state.userProfile && (state.userProfile.username || state.userProfile.full_name)) || (state.authUser?.user_metadata && state.authUser.user_metadata.username) || (state.authUser?.email ? state.authUser.email.split("@")[0] : "?");
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "?";
  const color = "var(--accent-blue)";
  const borderWidth = size <= 28 ? 1.5 : 2.5;
  const shadow = `0 1px 4px rgba(0, 0, 0, 0.4)`;

  if (photo) {
    return `
      <div class="player-avatar has-photo" style="width:${size}px; height:${size}px; min-width:${size}px; border: ${borderWidth}px solid ${color}; box-shadow: ${shadow};">
        <img src="${photo}" alt="${displayName}" class="player-avatar-img" onerror="this.parentElement.classList.remove('has-photo'); this.remove();" />
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

// The 32 Canonical NFL Teams (excluding alias keys like ARI, WAS, LA, JAC)
const CANONICAL_NFL_TEAMS = [
  "KC", "LV", "DEN", "LAC", "BUF", "MIA", "NYJ", "NE",
  "BAL", "CLE", "PIT", "CIN", "HOU", "JAX", "IND", "TEN",
  "SF", "LAR", "SEA", "AZ", "DAL", "PHI", "NYG", "WSH",
  "DET", "GB", "MIN", "CHI", "TB", "NO", "ATL", "CAR"
];

// Official 2026 NFL Regular Season Bye Weeks Schedule (matches NFL and ESPN official schedule)
// Exactly 1 bye per team across weeks 5, 6, 7, 8, 9, 10, 11, 13, and 14.
const NFL_OFFICIAL_BYES = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: ["CAR", "KC"],
  6: ["CIN", "DET", "MIA", "MIN"],
  7: ["BUF", "JAX", "LAC", "WSH"],
  8: ["HOU", "NO", "NYG", "SF"],
  9: ["PIT", "TEN"],
  10: ["CHI", "DEN", "PHI", "TB"],
  11: ["ATL", "CLE", "GB", "LAR", "NE", "SEA"],
  12: [],
  13: ["BAL", "IND", "LV", "NYJ"],
  14: ["AZ", "DAL"],
  15: [],
  16: [],
  17: [],
  18: []
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
const IS_PREVIEW = typeof window !== "undefined" && window.location.pathname.includes("/preview");
const SAVED_USER_KEY = IS_PREVIEW ? "sp_preview_my_player" : "og_league_my_player";
const CACHE_KEY = IS_PREVIEW ? "sp_preview_cache_v2" : "og_league_cache_v10";
let initialSavedPlayer = null;
try {
  const stored = localStorage.getItem(SAVED_USER_KEY);
  if (stored && PLAYERS.includes(stored)) {
    initialSavedPlayer = stored;
  }
} catch (e) {
  console.warn("localStorage unavailable:", e);
}

// Supabase Cloud Project Configuration (Live Production Engine)
const SUPABASE_CONFIG = {
  url: "https://linfhswrpzoniajhzssd.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbmZoc3dycHpvbmlhamh6c3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMjk4NzUsImV4cCI6MjEwNjkwNTg3NX0.E8Hszna2tKhrzNItZlw9N0PWlHD8DyBsKKj8ja6hKx0"
};
let supabaseClient = null;

function initSupabaseClient() {
  if (typeof window !== "undefined" && window.supabase && !supabaseClient) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    } catch (e) {
      console.warn("Error initializing Supabase client:", e);
    }
  }
  return supabaseClient;
}

let state = {
  appMode: "lobby", // "lobby" | "league"
  activeLeague: "OG League", // "OG League" | "solo"
  currentWeek: getCurrentNFLWeek(),
  myPlayer: initialSavedPlayer,
  selectedPlayer: initialSavedPlayer || "Caleb",
  activeTab: "matchups",
  leaderboardMode: "season", // "season" | "weekly"
  playerViewMode: "single", // "single" | "h2h"
  h2hPlayerA: null,
  h2hPlayerB: null,
  h2hFilter: "swing", // "swing" | "agreed" | "all"
  isSyncing: false,
  lastUpdated: null,
  data: null,
  nflStandings: null,
  collapsedMatchups: new Set(),
  playerPicksFilter: "all", // "all" | "upcoming" | "live" | "final"
  matchupsFilter: "all",    // "all" | "upcoming" | "live" | "final"
  authUser: null,           // Authenticated Supabase user object
  userProfile: null,        // Profile record from public.profiles
  cloudStandings: null,     // Live Standings directly from Supabase view public.league_standings
  pickSheets: [],           // User's custom Solo Play Pick Sheets
  activeSheetId: null,      // Active Pick Sheet selected for viewing/editing
  createSheetFormat: "season", // Format option in create sheet modal
  userLeagues: [],          // Custom leagues user owns or is a member of
  activeLeagueData: null,   // Full league record if active league is custom
  customLeagueMembers: [],  // Roster of members in active custom league
  customLeaguePicks: {},    // Picks submitted by members in active custom league
  myCustomLeaguePicks: {},  // Current user's picks in active custom league: { [gameId]: { winner, awayScore, homeScore, multiplier } }
  createLeagueScoring: "classic_proximity" // Scoring option in create league modal
};

// Navigation state persistence key for sessionStorage
const NAV_STATE_KEY = "og_league_nav_state";

/**
 * Saves current navigation snapshot into sessionStorage and synchronizes URL hash.
 */
function saveNavState() {
  try {
    const nav = {
      appMode: state.appMode,
      activeLeague: state.activeLeague,
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
    sessionStorage.setItem("sp_app_mode", state.appMode);
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

  // 0. Determine App Mode (Lobby vs League)
  let detectedMode = "lobby";
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash ? window.location.hash.replace(/^#/, "").trim() : "";
    const savedMode = sessionStorage.getItem("sp_app_mode");

    if (urlParams.get("mode") === "solo" || urlParams.get("league") === "solo" || rawHash.startsWith("solo") || savedMode === "solo") {
      detectedMode = "solo";
      state.activeLeague = "solo";
    } else if (urlParams.has("league")) {
      detectedMode = "league";
      state.activeLeague = "OG League";
    } else if (urlParams.get("tab") === "leaderboard" || urlParams.get("tab") === "players") {
      detectedMode = "league";
    } else if (rawHash.startsWith("leaderboard") || rawHash.startsWith("players") || rawHash.startsWith("league")) {
      detectedMode = "league";
    } else if (savedMode === "league") {
      detectedMode = "league";
    } else if (savedMode === "lobby") {
      detectedMode = "lobby";
    }
  } catch (e) {}

  state.appMode = detectedMode;

  // 1. Try URL Query Params (?tab=players&week=5&p=Jon)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("tab")) {
      const qTab = urlParams.get("tab");
      if (validTabs.includes(qTab)) {
        state.activeTab = qTab;
        restoredFromHash = true;
      }
    }
    if (urlParams.has("week")) {
      const w = parseInt(urlParams.get("week"), 10);
      if (w >= 1 && w <= 18) state.currentWeek = w;
    }
    if (urlParams.has("p") && PLAYERS.includes(urlParams.get("p"))) {
      state.selectedPlayer = urlParams.get("p");
    }
    if (urlParams.has("drawer") && urlParams.get("drawer") === "1") {
      setTimeout(() => openLeagueDrawer(), 100);
    }
    if (urlParams.has("auth") && urlParams.get("auth") === "1") {
      setTimeout(() => openAuthModal(), 100);
    }
  } catch (e) {}

  // 2. Try URL Hash
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

  // Default tab based on appMode
  if (state.appMode === "lobby") {
    if (state.activeTab !== "nfl" && state.activeTab !== "rules") {
      state.activeTab = "matchups";
    }
  } else {
    if (!state.activeTab) {
      state.activeTab = "leaderboard";
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

  // Build cloud standings lookup if available and viewing full season
  const cloudMap = {};
  if (state.cloudStandings && Array.isArray(state.cloudStandings) && (throughWeek === null || throughWeek >= 18)) {
    state.cloudStandings.forEach(row => {
      if (row.player_name && typeof row.total_points === "number") {
        cloudMap[row.player_name] = row.total_points;
      }
    });
  }

  const list = PLAYERS.map(pName => {
    let totalPts = 0;
    if (cloudMap[pName] !== undefined) {
      totalPts = cloudMap[pName];
    } else if (data && data.weeks) {
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
  initSupabaseAuth();
  initData();
  restoreNavState();
  setupNavigation();
  setupWeekStrip();
  setupRefresh();
  setupPullToRefresh();
  renderApp();
  
  // Background live sync
  syncWeek(state.currentWeek).then(() => {
    catchUpPastWeeks();
  });
  syncNFLStandings();

  // Auto-sync every 60 seconds (snappy live NFL score updates)
  setInterval(() => {
    if (!document.hidden && !state.isSyncing) {
      syncWeek(state.currentWeek, true);
    }
  }, 60000);

  // Sync immediately when returning to the tab or app
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !state.isSyncing) {
      syncWeek(state.currentWeek, true);
      catchUpPastWeeks();
    }
  });
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
    localStorage.removeItem("og_league_cache_v8");
    localStorage.removeItem("og_league_cache_v9");
    localStorage.removeItem("sp_preview_cache_v1");
  } catch (e) {}

  const cached = localStorage.getItem(CACHE_KEY);
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
      localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
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

  // Restore cached NFL standings if available
  try {
    const STANDINGS_CACHE_KEY = IS_PREVIEW ? "sp_preview_nfl_standings" : "og_league_nfl_standings";
    const cachedStandings = localStorage.getItem(STANDINGS_CACHE_KEY);
    if (cachedStandings) {
      state.nflStandings = JSON.parse(cachedStandings);
    }
  } catch (e) {}
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
  if (!validTabs.includes(tabId)) {
    tabId = state.appMode === "lobby" ? "matchups" : "leaderboard";
  }

  // In lobby mode, Standings and Players are restricted to league view
  if (state.appMode === "lobby" && (tabId === "leaderboard" || tabId === "players")) {
    tabId = "matchups";
  }

  state.activeTab = tabId;
  document.body.setAttribute("data-active-tab", tabId);
  closeWeekDropdown();
  
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

  // If opening NFL standings tab, ensure live records are fresh
  if (tabId === "nfl") {
    const lastSync = (state.nflStandings && state.nflStandings.lastSynced) || 0;
    if (Date.now() - lastSync > 120000) {
      syncNFLStandings(true);
    }
  }
}

function getWeekDateLabel(w) {
  const dateStr = NFL_2026_WEEK_STARTS[w - 1];
  if (!dateStr) return `Wk ${w}`;
  const parts = dateStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10) + 1; // Thursday TNF kickoff
  return `${monthNames[m]} ${d}`;
}

function isWeekActivelyLive(w) {
  if (!state.data || !state.data.weeks) return false;
  const weekData = state.data.weeks[`Week ${w}`];
  if (!weekData || !weekData.games || !Array.isArray(weekData.games)) return false;
  return weekData.games.some(g => {
    if (g.isFinal) return false;
    if (g.isLive) return true;
    const hasScores = (g.awayScore !== null && g.awayScore !== "" && !isNaN(g.awayScore)) &&
                      (g.homeScore !== null && g.homeScore !== "" && !isNaN(g.homeScore));
    return hasScores;
  });
}

function getWeekStatusInfo(w) {
  const currentNFL = getCurrentNFLWeek();
  const isLive = isWeekActivelyLive(w);

  if (isLive) {
    return { label: "Live", type: "live", isLive: true };
  }

  if (w === currentNFL) {
    return { label: "Current Week", type: "current", isLive: false };
  } else if (w < currentNFL) {
    return { label: "Final", type: "final", isLive: false };
  } else {
    return { label: getWeekDateLabel(w), type: "upcoming", isLive: false };
  }
}

function handleWeekDropdownOutsideClick(e) {
  const container = document.querySelector(".week-stepper-container");
  const popover = document.getElementById("week-dropdown-popover");
  if (popover && !popover.hidden && container && !container.contains(e.target)) {
    closeWeekDropdown();
  }
}

function handleWeekDropdownKeydown(e) {
  if (e.key === "Escape") {
    closeWeekDropdown();
  }
}

function toggleWeekDropdown() {
  const popover = document.getElementById("week-dropdown-popover");
  if (!popover) return;
  if (popover.hidden) {
    openWeekDropdown();
  } else {
    closeWeekDropdown();
  }
}

function openWeekDropdown() {
  const popover = document.getElementById("week-dropdown-popover");
  const backdrop = document.getElementById("week-dropdown-backdrop");
  const trigger = document.getElementById("week-dropdown-trigger");
  if (!popover) return;

  popover.hidden = false;
  if (backdrop) backdrop.hidden = false;
  if (trigger) {
    trigger.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }

  // Auto-scroll active cell into view in the grid
  setTimeout(() => {
    const activeCell = popover.querySelector(`.week-cell-btn[data-week="${state.currentWeek}"]`);
    if (activeCell && typeof activeCell.scrollIntoView === "function") {
      activeCell.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }, 40);
}

function closeWeekDropdown() {
  const popover = document.getElementById("week-dropdown-popover");
  const backdrop = document.getElementById("week-dropdown-backdrop");
  const trigger = document.getElementById("week-dropdown-trigger");
  if (popover) popover.hidden = true;
  if (backdrop) backdrop.hidden = true;
  if (trigger) {
    trigger.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }
}

function setupWeekStrip() {
  const grid = document.getElementById("week-grid-container");
  const currentNFL = getCurrentNFLWeek();

  if (grid) {
    grid.innerHTML = "";
    for (let w = 1; w <= 18; w++) {
      const status = getWeekStatusInfo(w);
      const isCurrent = (w === currentNFL);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `week-cell-btn strip-pill ${w === state.currentWeek ? "active-cell active" : ""} ${isCurrent ? "is-current-nfl-week" : ""}`;
      cell.setAttribute("data-week", w);

      const statusHtml = status.isLive
        ? `<span class="pulse-dot"></span><span>${status.label}</span>`
        : `<span>${status.label}</span>`;

      cell.innerHTML = `
        <span class="week-cell-name">Week ${w}</span>
        <span class="week-cell-status status-${status.type}">${statusHtml}</span>
      `;

      cell.addEventListener("click", () => {
        selectWeek(w);
        closeWeekDropdown();
      });

      grid.appendChild(cell);
    }
  }

  // Stepper arrow buttons
  const prevBtn = document.getElementById("week-prev-btn");
  const nextBtn = document.getElementById("week-next-btn");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (state.currentWeek > 1) {
        selectWeek(state.currentWeek - 1);
        closeWeekDropdown();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (state.currentWeek < 18) {
        selectWeek(state.currentWeek + 1);
        closeWeekDropdown();
      }
    };
  }

  // Center trigger button to toggle dropdown
  const trigger = document.getElementById("week-dropdown-trigger");
  if (trigger) {
    trigger.onclick = (e) => {
      e.stopPropagation();
      toggleWeekDropdown();
    };
  }

  // Quick Jump to Current Week button
  const jumpBtn = document.getElementById("btn-jump-current-week");
  if (jumpBtn) {
    jumpBtn.onclick = (e) => {
      e.stopPropagation();
      selectWeek(currentNFL);
      closeWeekDropdown();
    };
  }

  // Backdrop click to dismiss
  const backdrop = document.getElementById("week-dropdown-backdrop");
  if (backdrop) {
    backdrop.onclick = () => closeWeekDropdown();
  }

  // Dismiss on clicking outside or pressing Escape
  document.removeEventListener("click", handleWeekDropdownOutsideClick);
  document.addEventListener("click", handleWeekDropdownOutsideClick);
  document.removeEventListener("keydown", handleWeekDropdownKeydown);
  document.addEventListener("keydown", handleWeekDropdownKeydown);

  updateStripButtons();
  setTimeout(() => updateStripButtons(), 60);
}

function updateStripButtons() {
  const prevBtn = document.getElementById("week-prev-btn");
  const nextBtn = document.getElementById("week-next-btn");
  if (prevBtn) prevBtn.disabled = state.currentWeek <= 1;
  if (nextBtn) nextBtn.disabled = state.currentWeek >= 18;

  // Update trigger display
  const titleEl = document.getElementById("week-trigger-title");
  if (titleEl) {
    titleEl.textContent = `Week ${state.currentWeek}`;
  }

  const badgeEl = document.getElementById("week-trigger-badge");
  if (badgeEl) {
    const status = getWeekStatusInfo(state.currentWeek);
    badgeEl.className = `week-trigger-badge badge-${status.type}`;
    if (status.isLive) {
      badgeEl.innerHTML = `<span class="pulse-dot"></span><span id="week-badge-text">LIVE</span>`;
    } else if (status.type === "current") {
      badgeEl.innerHTML = `<span id="week-badge-text">CURRENT WEEK</span>`;
    } else if (status.type === "final") {
      badgeEl.innerHTML = `<span id="week-badge-text">FINAL</span>`;
    } else {
      badgeEl.innerHTML = `<span id="week-badge-text">${status.label.toUpperCase()}</span>`;
    }
  }

  // Update jump button in dropdown
  const jumpBtn = document.getElementById("btn-jump-current-week");
  if (jumpBtn) {
    const currentNFL = getCurrentNFLWeek();
    const currStatus = getWeekStatusInfo(currentNFL);
    if (currStatus.isLive) {
      jumpBtn.classList.add("is-live");
      jumpBtn.innerHTML = `<span class="pulse-dot"></span><span>Current Week (Live)</span>`;
    } else {
      jumpBtn.classList.remove("is-live");
      jumpBtn.innerHTML = `<span class="current-dot"></span><span>Current Week</span>`;
    }
  }

  // Highlight active week cell in popover & update status labels
  const currentNFL = getCurrentNFLWeek();
  document.querySelectorAll(".week-cell-btn, .strip-pill").forEach(p => {
    const w = parseInt(p.getAttribute("data-week"), 10);
    const isActive = w === state.currentWeek;
    p.classList.toggle("active-cell", isActive);
    p.classList.toggle("active", isActive);
    if (!isNaN(w)) {
      p.classList.toggle("is-current-nfl-week", w === currentNFL);
      const statusEl = p.querySelector(".week-cell-status");
      if (statusEl) {
        const status = getWeekStatusInfo(w);
        statusEl.className = `week-cell-status status-${status.type}`;
        statusEl.innerHTML = status.isLive
          ? `<span class="pulse-dot"></span><span>${status.label}</span>`
          : `<span>${status.label}</span>`;
      }
    }
  });
}

function selectWeek(weekNum) {
  state.currentWeek = weekNum;
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
      syncNFLStandings(false),
      catchUpPastWeeks()
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

    // Sync official NFL teams on bye directly from ESPN scoreboard API
    if (data.week && Array.isArray(data.week.teamsOnBye)) {
      const espnByeCodes = data.week.teamsOnBye
        .map(b => normalizeTeamCode(b.abbreviation || b.name))
        .filter(c => CANONICAL_NFL_TEAMS.includes(c));
      weekData.byeTeams = espnByeCodes;
    }

    if (updatedCount > 0) {
      recalculateAllWeeksPoints(state.data);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
      } catch (e) {}
    }
  } catch (err) {
    console.warn("ESPN Scoreboard sync warning (using cached/sheet data):", err);
  }
}

// =========================================================
// LIVE ESPN DATA & SCORING ENGINE SYNC
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

  try {
    // Sync real-time live NFL scores, clocks, and situations directly from ESPN scoreboard API
    await syncLiveNFLScores(weekNum, silent);

    state.lastUpdated = new Date();
    if (syncLabel) syncLabel.textContent = "Live";
    
    // Save state cache
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
    } catch (e) {}

    renderTabContent();
    updateStripButtons();
  } catch (err) {
    console.warn("Live ESPN sync notice (offline or network restricted):", err);
    if (syncLabel) syncLabel.textContent = "Offline";
  } finally {
    state.isSyncing = false;
    if (refreshBtn) refreshBtn.classList.remove("spinning");
  }
}

let isCatchingUpPastWeeks = false;

/**
 * Audits all past weeks (Week 1 through currentWeek - 1).
 * Detects any week cached with unfinalized games, missing scores, or incomplete status
 * (e.g. if the user visited mid-week and didn't open the app again for several weeks).
 * Automatically fetches the official final scores in the background,
 * recalculates points and season standings, and saves the verified state.
 */
async function catchUpPastWeeks() {
  if (isCatchingUpPastWeeks) return;
  if (!state.data || !state.data.weeks) return;

  const currentNFL = (typeof getCurrentNFLWeek === "function") ? getCurrentNFLWeek() : (state.currentWeek || 1);
  if (currentNFL <= 1) return;

  const weeksToCatchUp = [];

  for (let w = 1; w < currentNFL; w++) {
    const wKey = `Week ${w}`;
    const wData = state.data.weeks[wKey];
    if (!wData || !wData.games || wData.games.length === 0) {
      weeksToCatchUp.push(w);
      continue;
    }

    // Check if any game in a past week has missing scores or is not final
    const hasUnfinalized = wData.games.some(g => {
      if (!g || !g.matchup || !g.matchup.includes("@")) return false;
      return !g.isFinal || g.awayScore === null || g.homeScore === null;
    });

    if (hasUnfinalized) {
      weeksToCatchUp.push(w);
    }
  }

  // Also always verify the immediately preceding week (currentNFL - 1) on startup/resume
  // to ensure late Monday night games, stat corrections, or overtime finals are 100% captured
  const prevWeek = currentNFL - 1;
  if (prevWeek >= 1 && !weeksToCatchUp.includes(prevWeek)) {
    if (!state._verifiedPastWeeks || !state._verifiedPastWeeks[prevWeek]) {
      weeksToCatchUp.push(prevWeek);
    }
  }

  if (weeksToCatchUp.length === 0) return;

  isCatchingUpPastWeeks = true;
  if (!state._verifiedPastWeeks) state._verifiedPastWeeks = {};

  try {
    for (const w of weeksToCatchUp) {
      try {
        await syncWeek(w, true, false);
        state._verifiedPastWeeks[w] = true;
      } catch (err) {
        console.warn(`[catchUpPastWeeks] Could not sync Week ${w}:`, err);
      }
    }

    // Recalculate dynamic season leaderboard across all weeks
    if (typeof recalculateAllWeeksPoints === "function") {
      recalculateAllWeeksPoints(state.data);
    }

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state.data));
    } catch (e) {}

    // Update UI
    if (typeof renderTabContent === "function") {
      renderTabContent();
    }
    if (typeof updateStripButtons === "function") {
      updateStripButtons();
    }
  } finally {
    isCatchingUpPastWeeks = false;
  }
}

/**
 * Dynamically computes NFL team win-loss-tie records and point differentials
 * across all finalized games present in state.data.weeks.
 */
function computeTeamRecordsFromGames() {
  const records = {};
  CANONICAL_NFL_TEAMS.forEach(tm => {
    records[tm] = { w: 0, l: 0, t: 0, winPct: 0, diff: 0 };
  });

  if (state.data && state.data.weeks) {
    Object.values(state.data.weeks).forEach(wk => {
      if (!wk || !wk.games) return;
      wk.games.forEach(g => {
        if (!g.isFinal) return;
        const teams = (g.matchup || "").split("@").map(s => s.trim());
        if (teams.length < 2) return;
        const away = normalizeTeamCode(teams[0]);
        const home = normalizeTeamCode(teams[1]);

        const aScore = (g.awayScore !== null && g.awayScore !== undefined) ? parseInt(g.awayScore, 10) : null;
        const hScore = (g.homeScore !== null && g.homeScore !== undefined) ? parseInt(g.homeScore, 10) : null;

        if (aScore === null || hScore === null || isNaN(aScore) || isNaN(hScore)) return;

        if (records[away]) records[away].diff += (aScore - hScore);
        if (records[home]) records[home].diff += (hScore - aScore);

        const normWinner = normalizeTeamCode(g.winner);
        if (aScore === hScore || normWinner === "TIE") {
          if (records[away]) records[away].t += 1;
          if (records[home]) records[home].t += 1;
        } else if (normWinner === away || (!normWinner && aScore > hScore) || (normWinner !== home && aScore > hScore)) {
          if (records[away]) records[away].w += 1;
          if (records[home]) records[home].l += 1;
        } else if (normWinner === home || (!normWinner && hScore > aScore) || (normWinner !== away && hScore > aScore)) {
          if (records[home]) records[home].w += 1;
          if (records[away]) records[away].l += 1;
        }
      });
    });
  }

  CANONICAL_NFL_TEAMS.forEach(tm => {
    const total = records[tm].w + records[tm].l + records[tm].t;
    records[tm].winPct = total > 0 ? (records[tm].w + records[tm].t * 0.5) / total : 0;
  });

  return records;
}

/**
 * Synchronizes real-time NFL standings, division records, and playoff seeds
 * from ESPN's official Standings API, with automated fallbacks to Google Sheets
 * and dynamic calculations from all completed games.
 */
async function syncNFLStandings(forceNotice = false) {
  let synced = false;

  // 1. Primary: Fetch official live NFL Standings directly from ESPN
  try {
    const espnUrl = "https://site.api.espn.com/apis/v2/sports/football/nfl/standings";
    const res = await fetch(espnUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.children && data.children.length > 0) {
        const teamRecords = {};
        const afcPlayoffs = [];
        const nfcPlayoffs = [];

        data.children.forEach(conf => {
          const confName = String(conf.name || "");
          const isAFC = confName.includes("American");
          const isNFC = confName.includes("National");
          const entries = (conf.standings && conf.standings.entries) ? conf.standings.entries : [];

          entries.forEach(entry => {
            const rawAbbr = entry.team?.abbreviation || "";
            const teamCode = normalizeTeamCode(rawAbbr);
            if (!CANONICAL_NFL_TEAMS.includes(teamCode)) return;

            const stats = entry.stats || [];
            const getStat = (name) => {
              const item = stats.find(s => s.name === name);
              if (!item) return 0;
              return item.value !== undefined ? item.value : parseInt(item.displayValue, 10);
            };

            const wins = getStat("wins") || 0;
            const losses = getStat("losses") || 0;
            const ties = getStat("ties") || 0;
            const seed = getStat("playoffSeed") || 16;
            const winPct = getStat("winPercent") || 0;
            const diff = getStat("pointDifferential") || 0;

            teamRecords[teamCode] = {
              w: wins,
              l: losses,
              t: ties,
              seed: String(seed),
              winPct: winPct,
              diff: diff,
              conf: isAFC ? "AFC" : "NFC"
            };

            if (seed >= 1 && seed <= 7) {
              const pItem = { seed: String(seed), team: teamCode };
              if (isAFC) afcPlayoffs.push(pItem);
              if (isNFC) nfcPlayoffs.push(pItem);
            }
          });
        });

        afcPlayoffs.sort((a, b) => parseInt(a.seed, 10) - parseInt(b.seed, 10));
        nfcPlayoffs.sort((a, b) => parseInt(a.seed, 10) - parseInt(b.seed, 10));

        state.nflStandings = {
          teamRecords,
          afcPlayoffs,
          nfcPlayoffs,
          lastSynced: Date.now()
        };

        try {
          const STANDINGS_CACHE_KEY = IS_PREVIEW ? "sp_preview_nfl_standings" : "og_league_nfl_standings";
          localStorage.setItem(STANDINGS_CACHE_KEY, JSON.stringify(state.nflStandings));
        } catch (e) {}

        synced = true;
      }
    }
  } catch (err) {
    console.warn("ESPN Live Standings API sync notice:", err);
  }

  // 2. Offline fallback: dynamically compute from all finalized season games if team records missing
  if (!state.nflStandings || !state.nflStandings.teamRecords) {
    const computed = computeTeamRecordsFromGames();
    if (!state.nflStandings) state.nflStandings = {};
    state.nflStandings.teamRecords = computed;
  }

  if (state.activeTab === "nfl") {
    renderNFLStandings();
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

  // Parse Bye Teams from Spreadsheet if present in rows 15-20
  const byeTeamsFromSheet = [];
  let foundByeHeader = false;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row[0]) continue;
    const cellVal = String(row[0]).trim().toUpperCase();
    if (cellVal.includes("BYE WEEK")) {
      foundByeHeader = true;
      continue;
    }
    if (foundByeHeader) {
      if (cellVal.includes("SEASON") || cellVal.includes("CORRECT") || cellVal.includes("WRONG") || cellVal.includes("POINTS")) {
        break;
      }
      const code = normalizeTeamCode(cellVal);
      if (CANONICAL_NFL_TEAMS.includes(code)) {
        byeTeamsFromSheet.push(code);
      }
    }
  }

  const existingByeTeams = existingWeek && Array.isArray(existingWeek.byeTeams) ? existingWeek.byeTeams : [];
  const finalByeTeams = byeTeamsFromSheet.length > 0 ? byeTeamsFromSheet : existingByeTeams;

  state.data.weeks[weekKey] = { games, playerStats, byeTeams: finalByeTeams };

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
  updateAppShellForMode();
  renderHeaderProfile();
  if (state.appMode === "solo") {
    loadSoloPickSheets().then(() => renderSoloView());
  } else {
    switchTab(state.activeTab, false);
  }
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
  if (state.activeLeagueData) {
    renderCustomLeagueLeaderboard();
    return;
  }
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
/**
 * Calculates which NFL teams are on a bye week for a given week number.
 * Returns an array of team objects with { code, name, city, color }.
 */
function getByeTeamsForWeek(weekNum) {
  const weekKey = `Week ${weekNum}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;

  let byeCodes = null;

  // 1. Prioritize live bye data synced directly from ESPN API or Google Sheet
  if (weekData && Array.isArray(weekData.byeTeams) && weekData.byeTeams.length > 0) {
    byeCodes = weekData.byeTeams
      .map(c => normalizeTeamCode(c))
      .filter(c => CANONICAL_NFL_TEAMS.includes(c));
  }

  // 2. Dynamically determine missing teams from the scheduled games for this week
  if (!byeCodes || byeCodes.length === 0) {
    const games = weekData && weekData.games ? weekData.games : [];
    if (games && games.length > 0 && games.length < 16) {
      const playingTeams = new Set();
      games.forEach(g => {
        if (!g || !g.matchup || !g.matchup.includes("@")) return;
        const parts = g.matchup.split("@").map(s => s.trim());
        const away = normalizeTeamCode(parts[0]);
        const home = normalizeTeamCode(parts[1]);
        if (away) playingTeams.add(away);
        if (home) playingTeams.add(home);
      });

      // Filter against ONLY the 32 canonical NFL teams (never aliases like ARI, WAS, LA, JAC)
      const calculated = CANONICAL_NFL_TEAMS.filter(code => !playingTeams.has(code));
      if (calculated.length > 0 && calculated.length <= 8) {
        byeCodes = calculated;
      }
    }
  }

  // 3. Fallback to official 2026 NFL schedule baseline if games not loaded yet or offline
  if ((!byeCodes || byeCodes.length === 0) && NFL_OFFICIAL_BYES[weekNum]) {
    byeCodes = [...NFL_OFFICIAL_BYES[weekNum]];
  }

  if (!byeCodes || byeCodes.length === 0) {
    return [];
  }

  // Deduplicate and sort alphabetically by team city/name or code
  const uniqueCodes = Array.from(new Set(byeCodes));
  uniqueCodes.sort((a, b) => {
    const nameA = NFL_TEAMS[a] ? (NFL_TEAMS[a].city || NFL_TEAMS[a].name) : a;
    const nameB = NFL_TEAMS[b] ? (NFL_TEAMS[b].city || NFL_TEAMS[b].name) : b;
    return nameA.localeCompare(nameB);
  });

  return uniqueCodes.map(code => NFL_TEAMS[code] || { code, name: code, color: '#38bdf8' });
}

function renderLobbyMatchupSection(game, awayTeam, homeTeam, awayInfo, homeInfo) {
  const userSheets = (state.authUser && Array.isArray(state.pickSheets)) ? state.pickSheets : [];
  const hasSheets = userSheets.length > 0;
  const awayNorm = normalizeTeamCode(awayTeam);
  const homeNorm = normalizeTeamCode(homeTeam);
  const awayColor = awayInfo.color || "#06b6d4";
  const homeColor = homeInfo.color || "#3b82f6";

  if (!hasSheets) {
    const actionOnClick = state.authUser
      ? "openCreateSheetModal()"
      : `openAuthModal('Predict ${awayTeam} @ ${homeTeam}', 'signin')`;
    const actionBtnText = state.authUser ? "+ Predict in Solo Play" : "🔮 Sign In to Predict";
    const subText = state.authUser
      ? "You haven't made a pick for this game. Start a Pick Sheet in Solo Play to forecast winners and exact scores!"
      : "Sign in to start custom Pick Sheets, predict game scores, and test your psychic instincts.";

    return `
      <div class="lobby-no-picks-card">
        <div class="lobby-no-picks-content">
          <div class="lobby-no-picks-icon-wrap">
            <span class="lobby-no-picks-icon">🔮</span>
          </div>
          <div class="lobby-no-picks-text-block">
            <div class="lobby-no-picks-title">No Predictions Yet</div>
            <div class="lobby-no-picks-desc">${subText}</div>
          </div>
        </div>
        <button type="button" class="btn-lobby-predict-cta" onclick="${actionOnClick}">
          <span>${actionBtnText}</span>
        </button>
      </div>
    `;
  }

  // User has sheets! Group picks by team
  const awaySheetPicks = [];
  const homeSheetPicks = [];
  const unpickedSheets = [];

  userSheets.forEach(sheet => {
    const pk = sheet.picks && sheet.picks[game.id];
    if (pk && pk.winner) {
      const normWinner = normalizeTeamCode(pk.winner);
      const hasAwayScore = (pk.awayScore !== null && pk.awayScore !== undefined && !isNaN(pk.awayScore));
      const hasHomeScore = (pk.homeScore !== null && pk.homeScore !== undefined && !isNaN(pk.homeScore));
      const scoreStr = (hasAwayScore && hasHomeScore) ? `${pk.awayScore} - ${pk.homeScore}` : "";

      const sheetPickData = {
        sheetId: sheet.id,
        sheetName: sheet.name || "Pick Sheet",
        winner: pk.winner,
        scoreDisplay: scoreStr,
        multiplier: Boolean(pk.multiplier)
      };

      if (normWinner === awayNorm) {
        awaySheetPicks.push(sheetPickData);
      } else if (normWinner === homeNorm) {
        homeSheetPicks.push(sheetPickData);
      }
    } else {
      unpickedSheets.push(sheet);
    }
  });

  const totalMyPicks = awaySheetPicks.length + homeSheetPicks.length;

  if (totalMyPicks === 0) {
    const targetSheetId = userSheets[0].id;
    return `
      <div class="lobby-no-picks-card">
        <div class="lobby-no-picks-content">
          <div class="lobby-no-picks-icon-wrap">
            <span class="lobby-no-picks-icon">🔮</span>
          </div>
          <div class="lobby-no-picks-text-block">
            <div class="lobby-no-picks-title">No Predictions Logged</div>
            <div class="lobby-no-picks-desc">
              You have ${userSheets.length} active sheet${userSheets.length > 1 ? "s" : ""}, but haven't picked a winner for this game yet.
            </div>
          </div>
        </div>
        <button type="button" class="btn-lobby-predict-cta" onclick="openPickSheet('${targetSheetId}')">
          <span>+ Predict in Solo Play</span>
        </button>
      </div>
    `;
  }

  const myAwayPct = Math.round((awaySheetPicks.length / totalMyPicks) * 100);
  const myHomePct = 100 - myAwayPct;

  const renderSheetChip = (sp) => {
    const safeName = (sp.sheetName || "Sheet").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `
      <div class="player-pick-chip is-sheet-pick ${sp.multiplier ? "has-multiplier" : ""}"
        onclick="openPickSheet('${sp.sheetId}')" role="button" tabindex="0"
        title="Open & edit ${safeName}">
        <div class="chip-row-top">
          <span class="sheet-chip-icon">📋</span>
          <span class="chip-name" style="font-size:0.75rem; font-weight:800; color:#ffffff;">${safeName}</span>
          ${sp.multiplier ? `<span class="chip-mult-tag">⭐ 3X</span>` : ""}
        </div>
        ${sp.scoreDisplay ? `
          <div class="chip-row-bottom">
            <span class="chip-predicted-score">${sp.scoreDisplay}</span>
          </div>
        ` : ""}
      </div>
    `;
  };

  const targetSheetId = userSheets[0].id;

  return `
    <!-- Mini Consensus Bar for My Sheets -->
    <div class="matchup-consensus-container my-sheets-consensus" aria-label="My sheets consensus: ${awayTeam} ${myAwayPct}%, ${homeTeam} ${myHomePct}%">
      <div class="consensus-header-row">
        <div class="consensus-side away">
          <span class="consensus-dot" style="background-color: ${awayColor};"></span>
          <span class="consensus-team-code">${awayTeam}</span>
          <span class="consensus-pct" style="color: ${awayColor};">${myAwayPct}%</span>
          <span class="consensus-count">(${awaySheetPicks.length})</span>
        </div>

        <span class="consensus-badge my-sheets-tag">My Pick Sheets</span>

        <div class="consensus-side home">
          <span class="consensus-dot" style="background-color: ${homeColor};"></span>
          <span class="consensus-team-code">${homeTeam}</span>
          <span class="consensus-pct" style="color: ${homeColor};">${myHomePct}%</span>
          <span class="consensus-count">(${homeSheetPicks.length})</span>
        </div>
      </div>

      <div class="consensus-bar-track">
        <div class="consensus-bar-fill away" style="width: ${myAwayPct}%; background-color: ${awayColor};"></div>
        <div class="consensus-bar-fill home" style="width: ${myHomePct}%; background-color: ${homeColor};"></div>
      </div>
    </div>

    <!-- Dual Column Split Picks for My Sheets -->
    <div class="matchup-split-picks my-sheets-split">
      <!-- Left Side: Away Team Picks -->
      <div class="picks-column away-picks">
        <div class="picks-column-header away" style="border-left: 3px solid ${awayInfo.color};">
          <div class="column-team-label">
            <span class="column-swatch" style="background-color: ${awayInfo.color};"></span>
            <span>${awayTeam} Picks</span>
          </div>
          <span class="column-count-badge">${awaySheetPicks.length}</span>
        </div>
        <div class="picks-list">
          ${awaySheetPicks.length > 0 ? awaySheetPicks.map(renderSheetChip).join("") : `<div class="no-picks-muted">No sheet picks</div>`}
        </div>
      </div>

      <!-- Right Side: Home Team Picks -->
      <div class="picks-column home-picks">
        <div class="picks-column-header home" style="border-right: 3px solid ${homeInfo.color};">
          <span class="column-count-badge">${homeSheetPicks.length}</span>
          <div class="column-team-label">
            <span>${homeTeam} Picks</span>
            <span class="column-swatch" style="background-color: ${homeInfo.color};"></span>
          </div>
        </div>
        <div class="picks-list">
          ${homeSheetPicks.length > 0 ? homeSheetPicks.map(renderSheetChip).join("") : `<div class="no-picks-muted">No sheet picks</div>`}
        </div>
      </div>
    </div>

    <div class="my-sheets-matchup-footer">
      ${unpickedSheets.length > 0 ? `
        <div class="unpicked-footer" style="margin-top:0; padding:0; background:none; border:none;">
          <span class="unpicked-label">Unpicked (${unpickedSheets.length}):</span>
          <span class="unpicked-names">${unpickedSheets.map(s => (s.name || "Sheet").replace(/</g, "&lt;").replace(/>/g, "&gt;")).join(", ")}</span>
        </div>
      ` : `<span></span>`}
      <button type="button" class="btn-lobby-edit-sheet" onclick="openPickSheet('${targetSheetId}')">
        <span>✏️ Edit in Solo Play &rarr;</span>
      </button>
    </div>
  `;
}

function renderMatchups() {
  const container = document.getElementById("matchups-list");
  const filterBar = document.getElementById("matchups-filter-bar");
  const byeStripEl = document.getElementById("matchups-bye-strip");
  const bannerTitle = document.getElementById("matchup-banner-title");
  const bannerStat = document.getElementById("matchup-banner-stat");
  if (!container) return;

  const weekKey = `Week ${state.currentWeek}`;
  bannerTitle.textContent = `${weekKey} Matchups`;

  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  if (games.length === 0) {
    bannerStat.textContent = "0 Games";
    if (filterBar) filterBar.innerHTML = "";
    if (byeStripEl) {
      byeStripEl.hidden = true;
      byeStripEl.innerHTML = "";
    }
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

  const finalGamesList = games.filter(g => Boolean(g.isFinal));
  const liveGamesList = games.filter(g => Boolean(g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null)));
  const upcomingGamesList = games.filter(g => !g.isFinal && !(g.isLive || (g.awayScore !== null && g.homeScore !== null)));

  const totalGames = games.length;
  const finalsCount = finalGamesList.length;
  const liveCount = liveGamesList.length;
  const upcomingCount = upcomingGamesList.length;

  bannerStat.innerHTML = `${totalGames}&nbsp;Games • ${finalsCount}&nbsp;Final${liveCount > 0 ? ` • <span class="summary-live-tag" style="color:#f87171; font-weight:800; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;"><span class="live-pulse-dot"></span>${liveCount}&nbsp;Live</span>` : ""}`;

  // Render Concept 2 Bye Week Ticker Strip
  const byeTeams = getByeTeamsForWeek(state.currentWeek);
  if (byeStripEl) {
    if (byeTeams.length > 0) {
      const chipsHtml = byeTeams.map(t => `
        <div class="bye-mini-pill" title="${t.name || t.code} (Bye Week)">
          <span class="mini-color-dot" style="background:${t.color || '#ffd700'};"></span>
          <span class="bye-mini-code">${t.code}</span>
        </div>
      `).join("");

      byeStripEl.innerHTML = `
        <div class="bye-strip-left">
          <span class="bye-strip-icon">☕</span>
          <span class="bye-strip-label">BYE:</span>
        </div>
        <div class="bye-strip-chips">
          ${chipsHtml}
        </div>
      `;
      byeStripEl.hidden = false;
    } else {
      byeStripEl.hidden = true;
      byeStripEl.innerHTML = "";
    }
  }

  // Filter games based on selected status filter: All, Upcoming, Live, Final
  const currentFilter = state.matchupsFilter || "all";
  let filteredGames = games;
  if (currentFilter === "upcoming") {
    filteredGames = upcomingGamesList;
  } else if (currentFilter === "live") {
    filteredGames = liveGamesList;
  } else if (currentFilter === "final") {
    filteredGames = finalGamesList;
  }

  const filterChipsHtml = `
    <div class="filter-pills-row" role="group" aria-label="Matchup status filters">
      <button type="button" class="filter-chip ${currentFilter === "all" ? "active" : ""}" onclick="setMatchupsFilter('all')" aria-label="Show all matchups">
        All (${totalGames})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "upcoming" ? "active" : ""}" onclick="setMatchupsFilter('upcoming')" aria-label="Show upcoming matchups">
        Upcoming (${upcomingCount})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "live" ? "active" : ""}" onclick="setMatchupsFilter('live')" aria-label="Show live matchups">
        Live (${liveCount})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "final" ? "active" : ""}" onclick="setMatchupsFilter('final')" aria-label="Show final matchups">
        Final (${finalsCount})
      </button>
    </div>
  `;

  if (filterBar) {
    filterBar.innerHTML = filterChipsHtml;
  }

  if (filteredGames.length === 0) {
    container.innerHTML = `
      <div class="empty-filter-box" style="padding: 32px 16px; text-align: center; color: var(--text-dim); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: 12px; margin-top: 4px;">
        <p style="margin: 0; font-size: 0.88rem; font-weight: 700; color: #ffffff;">No ${currentFilter} matchups found for ${weekKey}</p>
        <div style="margin-top: 14px;">
          <button type="button" class="btn-back-bottom" style="max-width: 200px; display: inline-flex;" onclick="setMatchupsFilter('all')">
            Show All Matchups
          </button>
        </div>
      </div>
    `;
    updateToggleAllBtn();
    return;
  }

  container.innerHTML = filteredGames.map((game, idx) => {
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

    const isLobby = state.appMode === "lobby";
    const isCollapsed = !isLobby && state.collapsedMatchups && state.collapsedMatchups.has(game.id);

    return `
      <article class="matchup-card ${isCollapsed ? "collapsed" : ""} ${isLive ? "is-live" : ""}" id="${game.id}">
        <div class="matchup-card-header" ${!isLobby ? `onclick="toggleMatchupCollapse('${game.id}', event)"` : ""}>
          <span class="date-time">${game.dateTime || `Game ${idx + 1}`}</span>
          <div class="matchup-header-actions">
            <span class="matchup-badge ${badgeClass}">${badgeText}</span>
            ${!isLobby ? `
            <button type="button" class="matchup-collapse-btn ${isCollapsed ? "collapsed" : ""}" aria-label="${isCollapsed ? "Expand picks" : "Collapse picks"}" title="${isCollapsed ? "Expand picks" : "Collapse picks"}">
              <svg class="collapse-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>` : ""}
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

        ${isLobby
          ? renderLobbyMatchupSection(game, awayTeam, homeTeam, awayInfo, homeInfo)
          : (state.activeLeagueData
              ? renderCustomLeagueMatchupSection(game, awayTeam, homeTeam, awayInfo, homeInfo)
              : `
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
        `)}
      </article>
    `;
  }).join("");

  updateToggleAllBtn();
}

// =========================================================
// MATCHUP CARD COLLAPSE / EXPAND ENGINE & FILTERS
// =========================================================
function setMatchupsFilter(filter) {
  state.matchupsFilter = filter;
  renderMatchups();
}

function getMatchupsTargetGames(games) {
  const currentFilter = state.matchupsFilter || "all";
  if (currentFilter === "upcoming") {
    return games.filter(g => !g.isFinal && !(g.isLive || (g.awayScore !== null && g.homeScore !== null)));
  } else if (currentFilter === "live") {
    return games.filter(g => Boolean(g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null)));
  } else if (currentFilter === "final") {
    return games.filter(g => Boolean(g.isFinal));
  }
  return games;
}

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

  const targetGames = getMatchupsTargetGames(games);
  if (targetGames.length === 0) return;

  const allCollapsed = targetGames.every(g => state.collapsedMatchups.has(g.id));

  if (allCollapsed) {
    targetGames.forEach(g => {
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
    targetGames.forEach(g => {
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
  if (state.appMode === "lobby") {
    btn.style.display = "none";
    return;
  }
  const weekKey = `Week ${state.currentWeek}`;
  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];
  if (games.length === 0) {
    btn.style.display = "none";
    return;
  }
  const targetGames = getMatchupsTargetGames(games);
  if (targetGames.length === 0) {
    btn.style.display = "none";
    return;
  }
  btn.style.display = "inline-flex";
  const allCollapsed = targetGames.every(g => state.collapsedMatchups && state.collapsedMatchups.has(g.id));
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
      ${isMyProfile ? `
      <div class="badge-my-roster-tag" title="This is your official authenticated roster profile">
        <span>⭐ Your Roster Profile</span>
      </div>
      ` : ""}
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
  if (games.length === 0) {
    picksContainer.innerHTML = `
      <div class="loading-box"><p>No picks recorded for ${weekKey}</p></div>
      <button class="btn-back-bottom" onclick="switchTab('leaderboard')">← Back to Standings</button>
    `;
    return;
  }

  const totalPicks = games.length;
  const liveCount = games.filter(g => Boolean(g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null))).length;
  const upcomingCount = games.filter(g => !g.isFinal && !(g.isLive || (g.awayScore !== null && g.homeScore !== null))).length;

  // Filter games based on selected status filter: All, Upcoming, Live, Final
  const currentFilter = state.playerPicksFilter || "all";
  let filteredGames = games;
  if (currentFilter === "upcoming") {
    filteredGames = games.filter(g => !g.isFinal && !(g.isLive || (g.awayScore !== null && g.homeScore !== null)));
  } else if (currentFilter === "live") {
    filteredGames = games.filter(g => Boolean(g.isLive || (!g.isFinal && g.awayScore !== null && g.homeScore !== null)));
  } else if (currentFilter === "final") {
    filteredGames = games.filter(g => Boolean(g.isFinal));
  }

  const filterChipsHtml = `
    <div class="filter-pills-row" role="group" aria-label="Game status filters">
      <button type="button" class="filter-chip ${currentFilter === "all" ? "active" : ""}" onclick="setPlayerPicksFilter('all')" aria-label="Show all games">
        All (${totalPicks})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "upcoming" ? "active" : ""}" onclick="setPlayerPicksFilter('upcoming')" aria-label="Show upcoming games">
        Upcoming (${upcomingCount})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "live" ? "active" : ""}" onclick="setPlayerPicksFilter('live')" aria-label="Show live games">
        Live (${liveCount})
      </button>
      <button type="button" class="filter-chip ${currentFilter === "final" ? "active" : ""}" onclick="setPlayerPicksFilter('final')" aria-label="Show final games">
        Final (${finalCount})
      </button>
    </div>
  `;

  if (filteredGames.length === 0) {
    picksContainer.innerHTML = `
      ${filterChipsHtml}
      <div class="empty-filter-box" style="padding: 28px 12px; text-align: center; color: var(--text-dim); background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: 12px; margin-top: 4px;">
        <p style="margin: 0; font-size: 0.82rem; font-weight: 700;">No ${currentFilter} games found for ${weekKey}</p>
      </div>
      <div style="margin-top:16px; margin-bottom:8px;">
        <button class="btn-back-bottom" onclick="switchTab('leaderboard')">
          ← Back to Standings
        </button>
      </div>
    `;
    return;
  }

  picksContainer.innerHTML = `
    ${filterChipsHtml}
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
        ${filteredGames.map(g => {
          const pk = g.picks ? g.picks[state.selectedPlayer] : null;
          const isFinal = g.isFinal;
          const isLive = Boolean(g.isLive || (!isFinal && g.awayScore !== null && g.homeScore !== null));

          if (!pk || !pk.winner) {
            return `
              <tr class="clickable-matchup-row ${isLive ? "is-live-row" : ""}" onclick="navigateToMatchup('${g.id}')" title="View ${g.matchup} on Matchups tab">
                <td>
                  <div style="font-weight:800; color:#fff; display:flex; align-items:center; gap:3px;">
                    <span>${g.matchup}</span>
                    <span class="matchup-link-icon" title="View on Matchups tab">↗</span>
                  </div>
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
            <tr class="clickable-matchup-row ${isLive ? "is-live-row" : ""}" onclick="navigateToMatchup('${g.id}')" title="View ${g.matchup} on Matchups tab">
              <td>
                <div style="font-weight:800; color:#fff; display:flex; align-items:center; gap:3px;">
                  <span>${g.matchup}</span>
                  <span class="matchup-link-icon" title="View on Matchups tab">↗</span>
                </div>
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

function setPlayerPicksFilter(filter) {
  state.playerPicksFilter = filter;
  renderPlayers();
}

function renderSinglePlayer() {
  renderPlayers();
}

function navigateToMatchup(gameId) {
  if (!gameId) return;
  // If target game might be filtered out on matchups tab, ensure filter is set to 'all'
  if (state.matchupsFilter && state.matchupsFilter !== "all") {
    state.matchupsFilter = "all";
  }
  // Switch to the Matchups tab without auto-scrolling to top
  switchTab("matchups", false);

  // Allow tab view to render and smooth scroll to target card
  setTimeout(() => {
    const card = document.getElementById(gameId);
    if (card) {
      if (state.collapsedMatchups && state.collapsedMatchups.has(gameId)) {
        state.collapsedMatchups.delete(gameId);
        card.classList.remove("collapsed");
        const btn = card.querySelector(".matchup-collapse-btn");
        if (btn) {
          btn.classList.remove("collapsed");
          btn.setAttribute("aria-label", "Collapse picks");
          btn.setAttribute("title", "Collapse picks");
        }
        updateToggleAllBtn();
      }
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("matchup-highlight-target");
      setTimeout(() => {
        card.classList.remove("matchup-highlight-target");
      }, 2200);
    }
  }, 100);
}

function updateToggleAllButtonText() {
  updateToggleAllBtn();
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
    { seed: "3", team: "CLE" },
    { seed: "4", team: "JAX" },
    { seed: "5", team: "LV" },
    { seed: "6", team: "BAL" },
    { seed: "7", team: "DEN" }
  ];

  const fallbackNFC = [
    { seed: "1", team: "MIN" },
    { seed: "2", team: "SF" },
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

  // Dynamic Division Records from ESPN or dynamic game tallies
  const records = (state.nflStandings && state.nflStandings.teamRecords)
    ? state.nflStandings.teamRecords
    : computeTeamRecordsFromGames();

  // Standard NFL Divisions - Paired AFC (left) / NFC (right)
  const divisionConfigs = [
    { name: "AFC West", teams: ["KC", "LV", "DEN", "LAC"] },
    { name: "NFC West", teams: ["SF", "SEA", "LAR", "AZ"] },
    { name: "AFC East", teams: ["BUF", "NYJ", "NE", "MIA"] },
    { name: "NFC East", teams: ["PHI", "NYG", "DAL", "WSH"] },
    { name: "AFC North", teams: ["CLE", "BAL", "CIN", "PIT"] },
    { name: "NFC North", teams: ["MIN", "DET", "CHI", "GB"] },
    { name: "AFC South", teams: ["JAX", "IND", "HOU", "TEN"] },
    { name: "NFC South", teams: ["NO", "ATL", "CAR", "TB"] }
  ];

  divisionsContainer.innerHTML = divisionConfigs.map(div => {
    const isAfc = div.name.startsWith("AFC");
    const confClass = isAfc ? "afc" : "nfc";

    // Build and sort division teams dynamically by W-L records
    const divTeams = div.teams.map(tCode => {
      const rec = records[tCode] || { w: 0, l: 0, t: 0, winPct: 0, diff: 0 };
      return {
        t: tCode,
        w: rec.w,
        l: rec.l,
        tCount: rec.t || 0,
        winPct: rec.winPct !== undefined ? rec.winPct : (rec.w / Math.max(1, rec.w + rec.l)),
        diff: rec.diff || 0
      };
    });

    // Sort: 1) winPct descending, 2) wins descending, 3) point differential descending
    divTeams.sort((a, b) => {
      if (b.winPct !== a.winPct) return b.winPct - a.winPct;
      if (b.w !== a.w) return b.w - a.w;
      return b.diff - a.diff;
    });

    return `
      <div class="division-card">
        <div class="division-header">
          <span class="division-title ${confClass}">${div.name}</span>
          <span class="division-wl-header">W-L</span>
        </div>
        <table class="division-table">
          <tbody>
            ${divTeams.map(tm => {
              const tmInfo = NFL_TEAMS[tm.t] || { color: '#2a3b50' };
              const tmText = getTeamContrastColor(tmInfo.color);
              const recLabel = tm.tCount > 0 ? `${tm.w}-${tm.l}-${tm.tCount}` : `${tm.w} - ${tm.l}`;
              return `
                <tr>
                  <td>
                    <span class="team-badge-sm" style="background-color: ${tmInfo.color}; color: ${tmText}; font-size: 0.65rem; padding: 1.5px 6px; border-radius: 4px; min-width: 32px; text-align: center;">${tm.t}</span>
                  </td>
                  <td class="division-record">${recLabel}</td>
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
// AUTHENTICATED USER PROFILE & HEADER ENGINE
// =========================================================

function isUserInOGLeague() {
  if (!state.authUser) return false;
  if (state.myPlayer && PLAYERS.includes(state.myPlayer)) return true;
  const email = (state.authUser.email || "").toLowerCase().trim();
  const ogEmails = [
    "jonnylcolbert@gmail.com",
    "alishaklezmer16@gmail.com",
    "thatpkboy@gmail.com"
  ];
  return ogEmails.includes(email);
}

function renderHeaderProfile() {
  const btn = document.getElementById("btn-header-profile");
  if (!btn) return;

  if (state.authUser) {
    const displayName = state.myPlayer || (state.userProfile && (state.userProfile.username || state.userProfile.full_name)) || (state.authUser.user_metadata && state.authUser.user_metadata.username) || (state.authUser.email ? state.authUser.email.split("@")[0] : "Account");
    btn.className = "header-profile-btn has-user";
    btn.innerHTML = `
      <div class="header-profile-avatar-wrap">
        ${getUserAvatarHtml(26)}
      </div>
      <div class="header-profile-text-wrap">
        <span class="header-profile-name">${displayName}</span>
      </div>
    `;
    btn.title = `Signed in as ${state.authUser.email} (Click for Account Profile)`;
    btn.style.display = "inline-flex";
  } else {
    btn.className = "header-profile-btn not-set";
    btn.style.display = "none";
  }
}

function getFavoriteTeam() {
  const code = (state.userProfile && state.userProfile.favorite_team) || localStorage.getItem("sp_fav_team") || "KC";
  return NFL_TEAMS[code] || NFL_TEAMS["KC"];
}

/**
 * Calculates a team's actual NFL Win-Loss-Tie record for the current season.
 * Prioritizes official live synced ESPN standings, falling back to all finalized games in state.data.
 */
function getNFLTeamCurrentRecord(teamCode) {
  const norm = normalizeTeamCode(teamCode);
  if (!norm) return { wins: 0, losses: 0, ties: 0, text: "0-0", label: "0-0 Record" };

  // 1. Live or cached official ESPN NFL standings
  if (state.nflStandings && state.nflStandings.teamRecords && state.nflStandings.teamRecords[norm]) {
    const rec = state.nflStandings.teamRecords[norm];
    const wins = rec.w || 0;
    const losses = rec.l || 0;
    const ties = rec.t || 0;
    const text = ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
    return { wins, losses, ties, text, label: `${text} Record` };
  }

  // 2. Computed from all completed season games across all weeks
  const localRec = getNFLTeamRecord(norm);
  return {
    wins: localRec.wins,
    losses: localRec.losses,
    ties: localRec.ties,
    text: localRec.text,
    label: `${localRec.text} Record`
  };
}

async function setFavoriteTeam(teamCode) {
  const norm = normalizeTeamCode(teamCode);
  if (!norm || !NFL_TEAMS[norm]) return;

  if (!state.userProfile) state.userProfile = {};
  state.userProfile.favorite_team = norm;

  try {
    localStorage.setItem("sp_fav_team", norm);
  } catch (e) {}

  if (supabaseClient && state.authUser) {
    try {
      await supabaseClient
        .from("profiles")
        .update({ favorite_team: norm })
        .eq("id", state.authUser.id);
    } catch (err) {
      console.warn("Could not save favorite team to Supabase:", err);
    }
  }

  showToast(`⭐ Favorite team set to ${NFL_TEAMS[norm].name}!`);
  closeTeamPicker();
  renderAccountProfileModal();
}

function openTeamPicker() {
  const modal = document.getElementById("team-picker-modal");
  if (!modal) return;
  renderTeamPickerGrid();
  modal.classList.add("open");
  const searchInput = document.getElementById("team-picker-search");
  if (searchInput) {
    searchInput.value = "";
    setTimeout(() => searchInput.focus(), 150);
  }
}

function closeTeamPicker(event) {
  if (event && event.target && event.target.id !== "team-picker-modal" && !event.target.classList.contains("profile-modal-close") && !event.target.classList.contains("btn-modal-done")) {
    return;
  }
  const modal = document.getElementById("team-picker-modal");
  if (modal) modal.classList.remove("open");
}

function renderTeamPickerGrid(filterQuery = "") {
  const grid = document.getElementById("team-picker-grid");
  if (!grid) return;

  const currentFav = getFavoriteTeam().code;
  const q = (filterQuery || "").trim().toLowerCase();

  const sortedTeams = CANONICAL_NFL_TEAMS.map(code => NFL_TEAMS[code]).filter(t => {
    if (!q) return true;
    return t.code.toLowerCase().includes(q) ||
           t.name.toLowerCase().includes(q) ||
           t.city.toLowerCase().includes(q) ||
           t.conf.toLowerCase().includes(q) ||
           t.div.toLowerCase().includes(q);
  }).sort((a, b) => a.name.localeCompare(b.name));

  grid.innerHTML = sortedTeams.map(t => {
    const isSelected = (t.code === currentFav);
    const textColor = getTeamContrastColor(t.color);
    const rec = getNFLTeamCurrentRecord(t.code);
    return `
      <div class="team-picker-item ${isSelected ? "selected" : ""}" onclick="setFavoriteTeam('${t.code}')">
        <div class="team-picker-chip" style="background: ${t.color}; color: ${textColor};">
          ${t.code}
        </div>
        <div class="team-picker-details">
          <div class="team-picker-name">${t.name}</div>
          <div class="team-picker-meta">${rec.text} Record • ${t.conf} ${t.div}</div>
        </div>
        ${isSelected ? `<span class="team-picker-check">✓</span>` : ""}
      </div>
    `;
  }).join("");
}

function filterTeamPickerList(query) {
  renderTeamPickerGrid(query);
}

function renderAccountProfileModal() {
  const accountCard = document.getElementById("profile-account-card");
  if (!accountCard) return;

  if (!state.authUser) {
    accountCard.innerHTML = `
      <div class="account-profile-hero">
        <div class="account-avatar-large">
          <div class="player-avatar" style="width:64px; height:64px; font-size:26px;">👤</div>
        </div>
        <div class="account-name-lg">Browsing as Guest</div>
        <div class="account-email-sub">Sign in or create an account to customize your profile.</div>
      </div>
      <div style="margin-top:16px; text-align:center;">
        <button type="button" class="btn-hero-primary" onclick="closeProfileModal(); openAuthModal();">
          <span>🔮 Sign In / Join Free</span>
        </button>
      </div>
    `;
    return;
  }

  const email = state.authUser.email || "";
  const displayName = state.myPlayer || (state.userProfile && (state.userProfile.username || state.userProfile.full_name)) || (state.authUser?.user_metadata && state.authUser.user_metadata.username) || email.split("@")[0];
  const favTeam = getFavoriteTeam();
  const favTeamRec = getNFLTeamCurrentRecord(favTeam.code);

  let memberSinceFormatted = "October 2026";
  const rawDate = state.userProfile?.created_at || state.authUser?.created_at;
  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        memberSinceFormatted = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      }
    } catch (e) {}
  }

  accountCard.innerHTML = `
    <div class="account-profile-hero">
      <div class="account-avatar-large">
        ${getUserAvatarHtml(68)}
      </div>
      <div class="account-name-lg">${displayName}</div>
      <div class="account-email-sub">${email}</div>
    </div>

    <div class="account-details-list">
      <!-- 1. Username row -->
      <div class="account-detail-row">
        <div class="detail-label-col">
          <span class="detail-icon">👤</span>
          <span class="detail-title">Username</span>
        </div>
        <div class="detail-val-col">
          <span class="detail-val-text">${displayName}</span>
        </div>
      </div>

      <!-- 2. Favorite Team card -->
      <div class="account-detail-row fav-team-card-row">
        <div class="fav-team-row-top">
          <div class="detail-label-col">
            <span class="detail-icon">🏈</span>
            <span class="detail-title">Favorite Team</span>
          </div>
          <button type="button" class="btn-change-team" onclick="openTeamPicker()">
            <span>Change Team</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>
        <div class="fav-team-badge-full" onclick="openTeamPicker()" style="border-left: 4px solid ${favTeam.color};" title="Tap to choose from all 32 NFL teams">
          <span class="fav-team-chip-lg" style="background: ${favTeam.color}; color: ${getTeamContrastColor(favTeam.color)};">${favTeam.code}</span>
          <div class="fav-team-text-block">
            <span class="fav-team-name-lg">${favTeam.name}</span>
            <span class="fav-team-conf-sub">${favTeamRec.text} Record</span>
          </div>
          <span class="fav-team-edit-icon">✏️</span>
        </div>
      </div>

      <!-- 3. Member Since row -->
      <div class="account-detail-row">
        <div class="detail-label-col">
          <span class="detail-icon">📅</span>
          <span class="detail-title">Member Since</span>
        </div>
        <div class="detail-val-col">
          <span class="detail-val-text">${memberSinceFormatted}</span>
        </div>
      </div>
    </div>
  `;
}

function openProfileModal() {
  const modal = document.getElementById("profile-modal");
  if (!modal) return;
  renderAccountProfileModal();
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

// Close modals on ESC key & handle Enter on auth modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProfileModal();
    closeH2HPicker();
    closeAuthModal();
    closeCreateSheetModal();
  }
  if (e.key === "Enter") {
    const authModal = document.getElementById("auth-modal");
    if (authModal && authModal.classList.contains("active")) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.id === "auth-username-input" || activeEl.id === "auth-email-input" || activeEl.id === "auth-password-input")) {
        e.preventDefault();
        handleAuthSubmit();
        return;
      }
    }
    const createSheetModal = document.getElementById("create-sheet-modal");
    if (createSheetModal && createSheetModal.classList.contains("active")) {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.id === "sheet-name-input") {
        e.preventDefault();
        handleCreateSheetSubmit();
        return;
      }
    }
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

// =========================================================
// UNIFIED SPORTS PSYCHIC MERGED ENGINE
// League Switcher, Multi-League State & Psychic Forecaster
// =========================================================

state.activeLeague = "OG League"; // "OG League" | "solo"

function renderLeagueDrawerContent() {
  const container = document.getElementById("drawer-leagues-list");
  if (!container) return;

  const activeIsHome = (state.appMode === "lobby");
  const activeIsOG = (state.activeLeague === "OG League") && (state.appMode === "league") && !state.activeLeagueData;
  const activeIsSolo = (state.activeLeague === "solo" || state.activeLeague === "Solo Psychic") && (state.appMode === "solo");

  // Check if user has OG League access (either historic member or member in Supabase)
  const ogLeagueRecord = (state.userLeagues || []).find(l => 
    l.name === "OG League" || 
    l.join_code === "OG2026" || 
    l.id === "e0000000-0000-0000-0000-000000000001"
  );
  const hasOG = isUserInOGLeague() || Boolean(ogLeagueRecord);
  const isOGCommish = Boolean(ogLeagueRecord && (ogLeagueRecord.role === "commissioner" || (state.authUser && ogLeagueRecord.commissioner_id === state.authUser.id)));

  let html = "";

  // 1. Home Option
  html += `
    <div id="drawer-card-home" class="league-option-card ${activeIsHome ? "active" : ""}" onclick="closeLeagueDrawer(); exitToLobby();">
      <div class="league-card-left">
        <div class="league-icon-box" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35);">🏠</div>
        <div>
          <div class="league-title-row">
            <span class="league-name">Home</span>
            ${activeIsHome ? `<span class="league-status-tag">ACTIVE</span>` : ""}
          </div>
          <div class="league-meta-row">Game Matchups, NFL Scores & Ways to Play</div>
        </div>
      </div>
      ${activeIsHome ? `<span class="league-check-icon">✓</span>` : `<span class="league-switch-arrow">Go &rarr;</span>`}
    </div>
  `;

  // 2. ONE Unified OG League Option
  if (hasOG) {
    html += `
      <div id="drawer-card-og" class="league-option-card ${activeIsOG ? "active" : ""}" onclick="selectLeague('OG League')">
        <div class="league-card-left">
          <div class="league-icon-box" style="background: rgba(245, 184, 0, 0.15); border-color: rgba(245, 184, 0, 0.4);">🏆</div>
          <div>
            <div class="league-title-row">
              <span class="league-name">OG League</span>
              ${isOGCommish ? `<span class="league-role-tag commissioner">COMMISH</span>` : ""}
              ${activeIsOG ? `<span class="league-status-tag">ACTIVE</span>` : ""}
            </div>
            <div class="league-meta-row">
              <span class="league-join-code-tag">🔑 OG2026</span> • 12 Members • 2026 NFL Season
            </div>
          </div>
        </div>
        ${activeIsOG ? `<span class="league-check-icon">✓</span>` : `<span class="league-switch-arrow">Enter &rarr;</span>`}
      </div>
    `;
  }

  // 3. User's Custom Leagues (Excluding OG League!)
  const customLeaguesOnly = (state.userLeagues || []).filter(l => 
    l.name !== "OG League" && 
    l.join_code !== "OG2026" && 
    l.id !== "e0000000-0000-0000-0000-000000000001"
  );

  if (state.authUser && customLeaguesOnly.length > 0) {
    customLeaguesOnly.forEach(l => {
      const isCurrentActive = Boolean(state.activeLeagueData && state.activeLeagueData.id === l.id && state.appMode === "league");
      const isCommish = l.role === "commissioner" || (state.authUser && l.commissioner_id === state.authUser.id);
      const formatLabel = l.scoring_format === "winner_only" ? "Winner Only" : "Classic Proximity";

      html += `
        <div id="drawer-card-league-${l.id}" class="league-option-card ${isCurrentActive ? "active" : ""}" onclick="selectLeague('${l.id}')">
          <div class="league-card-left">
            <div class="league-icon-box" style="background: rgba(245, 184, 0, 0.15); border-color: rgba(245, 184, 0, 0.4);">🏆</div>
            <div>
              <div class="league-title-row">
                <span class="league-name">${l.name}</span>
                <span class="league-role-tag ${isCommish ? "commissioner" : "member"}">${isCommish ? "COMMISH" : "MEMBER"}</span>
                ${isCurrentActive ? `<span class="league-status-tag">ACTIVE</span>` : ""}
              </div>
              <div class="league-meta-row">
                <span class="league-join-code-tag">🔑 ${l.join_code}</span> • ${formatLabel}
              </div>
            </div>
          </div>
          ${isCurrentActive ? `<span class="league-check-icon">✓</span>` : `<span class="league-switch-arrow">Enter &rarr;</span>`}
        </div>
      `;
    });
  }

  // 4. Solo Psychic Play (Available to all users)
  html += `
    <div id="drawer-card-solo" class="league-option-card ${activeIsSolo ? "active" : ""}" onclick="enterSoloPlay()">
      <div class="league-card-left">
        <div class="league-icon-box icon-solo">🔮</div>
        <div>
          <div class="league-title-row">
            <span class="league-name">Solo Psychic Play</span>
            ${activeIsSolo ? `<span class="league-status-tag">ACTIVE</span>` : ""}
          </div>
          <div class="league-meta-row">Personal Full-Season Forecasting & Accuracies</div>
        </div>
      </div>
      ${activeIsSolo ? `<span class="league-check-icon">✓</span>` : `<span class="league-switch-arrow">Enter &rarr;</span>`}
    </div>
  `;

  container.innerHTML = html;
}

function openLeagueDrawer() {
  const drawer = document.getElementById("league-drawer");
  const btn = document.getElementById("btn-league-switcher");
  if (!drawer) return;
  renderLeagueDrawerContent();
  drawer.classList.add("open");
  if (btn) btn.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLeagueDrawer(event) {
  if (event && event.target && event.target.id !== "league-drawer" && !event.target.classList.contains("drawer-handle")) {
    return;
  }
  const drawer = document.getElementById("league-drawer");
  const btn = document.getElementById("btn-league-switcher");
  if (drawer) drawer.classList.remove("open");
  if (btn) btn.classList.remove("open");
  document.body.style.overflow = "";
}

function renderLobbyHero() {
  const guestBlock = document.getElementById("hero-guest-block");
  const authBlock = document.getElementById("hero-auth-block");
  const heroName = document.getElementById("hero-user-name");
  const quickLeagues = document.getElementById("hero-auth-quick-leagues");

  if (!state.authUser) {
    if (guestBlock) guestBlock.style.display = "block";
    if (authBlock) authBlock.style.display = "none";
    return;
  }

  if (guestBlock) guestBlock.style.display = "none";
  if (authBlock) authBlock.style.display = "block";

  const firstName = state.myPlayer || (state.userProfile && state.userProfile.username) || (state.userProfile && state.userProfile.full_name ? state.userProfile.full_name.split(" ")[0] : null) || (state.authUser.user_metadata && state.authUser.user_metadata.username) || (state.authUser.email ? state.authUser.email.split("@")[0] : "Psychic");
  if (heroName) heroName.textContent = firstName;

  if (quickLeagues) {
    quickLeagues.innerHTML = `
      <button type="button" class="btn-hero-secondary" onclick="openCreateLeagueModal()" style="margin-bottom: 8px;">
        <span>➕ Create a League</span>
      </button>
    `;
  }
}

function handleHubLeagueClick() {
  openLeagueDrawer();
}

function handleHubSoloClick() {
  if (!state.authUser) {
    state.postAuthAction = "solo";
    showToast("🔮 Please sign in to access Solo Play.");
    openAuthModal("Sign in or create an account to access Solo Psychic and manage pick sheets", "signin");
    return;
  }
  enterSoloPlay();
}

function updateAppShellForMode() {
  const isLobby = state.appMode === "lobby";
  const isSolo = state.appMode === "solo";
  const isLeague = state.appMode === "league";
  const isAuth = Boolean(state.authUser);

  document.body.classList.toggle("is-lobby-mode", isLobby);
  document.body.classList.toggle("is-solo-mode", isSolo);
  document.body.classList.toggle("is-league-mode", isLeague);
  document.body.classList.toggle("is-authenticated", isAuth);
  document.body.classList.toggle("is-guest", !isAuth);

  const brandTitle = document.getElementById("header-brand-title");
  const brandSub = document.getElementById("header-brand-sub");
  const activePill = document.getElementById("header-active-league-pill");

  if (isLobby) {
    if (brandTitle) brandTitle.textContent = "Sports Psychic";
    if (brandSub) brandSub.textContent = "Know the Game";
    if (activePill) {
      activePill.textContent = "Home";
    }
  } else if (isSolo) {
    if (brandTitle) brandTitle.textContent = "Solo Psychic";
    if (brandSub) brandSub.textContent = "SPORTS PSYCHIC";
    if (activePill) {
      activePill.textContent = "Solo Play";
    }
  } else {
    if (state.activeLeagueData) {
      if (brandTitle) brandTitle.textContent = state.activeLeagueData.name;
      if (brandSub) {
        brandSub.innerHTML = `<span class="cl-code-copy-pill" onclick="event.stopPropagation(); copyLeagueCode('${state.activeLeagueData.join_code}')" title="Click to copy invite code">🔑 ${state.activeLeagueData.join_code}</span>`;
      }
      if (activePill) {
        activePill.textContent = state.activeLeagueData.name;
      }
    } else {
      const isOG = (state.activeLeague === "OG League");
      if (brandTitle) brandTitle.textContent = isOG ? "OG League" : (state.activeLeague || "League");
      if (brandSub) {
        if (isOG) {
          brandSub.innerHTML = `<span class="cl-code-copy-pill" onclick="event.stopPropagation(); copyLeagueCode('OG2026')" title="Click to copy invite code">🔑 OG2026</span>`;
        } else {
          brandSub.textContent = "SPORTS PSYCHIC";
        }
      }
      if (activePill) {
        activePill.textContent = isOG ? "OG League" : (state.activeLeague || "League");
      }
    }
  }

  renderHeaderProfile();
  renderLobbyHero();
}

function selectLeague(leagueId) {
  closeLeagueDrawer();
  if (leagueId === "home" || leagueId === "lobby") {
    exitToLobby();
    return;
  }
  if (leagueId === "solo") {
    enterSoloPlay();
    return;
  }
  if (leagueId === "OG League" || leagueId === "OG2026" || leagueId === "e0000000-0000-0000-0000-000000000001") {
    state.activeLeagueData = null;
    enterLeagueView("OG League");
    return;
  }
  enterCustomLeague(leagueId);
}

function enterLeagueView(leagueId = "OG League") {
  if (leagueId !== "OG League" && leagueId !== "OG2026" && leagueId !== "e0000000-0000-0000-0000-000000000001") {
    enterCustomLeague(leagueId);
    return;
  }

  if (!state.authUser) {
    showToast("🔮 Please sign in or create an account to enter leagues.");
    openAuthModal("Sign in or create an account to access leagues");
    return;
  }

  const ogLeagueRecord = (state.userLeagues || []).find(l => 
    l.name === "OG League" || 
    l.join_code === "OG2026" || 
    l.id === "e0000000-0000-0000-0000-000000000001"
  );

  if (!isUserInOGLeague() && !ogLeagueRecord) {
    showToast("⚠️ OG League is private to official members. Entering Solo Play.");
    enterSoloPlay();
    return;
  }

  state.activeLeagueData = null;
  state.appMode = "league";
  state.activeLeague = "OG League";
  try {
    sessionStorage.setItem("sp_app_mode", "league");
    sessionStorage.removeItem("sp_active_league_id");
  } catch (e) {}

  closeLeagueDrawer();
  updateAppShellForMode();
  switchTab("leaderboard");
  showToast("🏆 Welcome to OG League!");
}

async function enterCustomLeague(leagueId) {
  if (leagueId === "OG League" || leagueId === "OG2026" || leagueId === "e0000000-0000-0000-0000-000000000001") {
    enterLeagueView("OG League");
    return;
  }

  if (!state.authUser) {
    showToast("🔮 Please sign in or create an account to enter leagues.");
    openAuthModal("Sign in or create an account to access leagues");
    return;
  }

  initSupabaseClient();
  let leagueObj = null;

  if (Array.isArray(state.userLeagues)) {
    leagueObj = state.userLeagues.find(l => l.id === leagueId || l.join_code === leagueId || l.name === leagueId);
  }

  if (!leagueObj && supabaseClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leagueId);
      const query = supabaseClient.from("leagues").select("*");
      const { data } = isUuid ? await query.eq("id", leagueId).maybeSingle() : await query.eq("join_code", leagueId).maybeSingle();
      if (data) leagueObj = data;
    } catch (e) {
      console.warn("Failed fetching league:", e);
    }
  }

  if (!leagueObj) {
    showToast("⚠️ Could not load league details.");
    return;
  }

  if (leagueObj.name === "OG League" || leagueObj.join_code === "OG2026" || leagueObj.id === "e0000000-0000-0000-0000-000000000001") {
    enterLeagueView("OG League");
    return;
  }

  // Ensure user is in league_members
  if (supabaseClient && state.authUser) {
    try {
      const { data: mem } = await supabaseClient
        .from("league_members")
        .select("role")
        .eq("league_id", leagueObj.id)
        .eq("user_id", state.authUser.id)
        .maybeSingle();

      if (!mem) {
        await supabaseClient
          .from("league_members")
          .insert({
            league_id: leagueObj.id,
            user_id: state.authUser.id,
            role: "member"
          });
        await loadUserLeagues();
      }
    } catch (err) {
      console.warn("Error verifying league membership:", err);
    }
  }

  state.activeLeagueData = leagueObj;
  state.activeLeague = leagueObj.name;
  state.appMode = "league";
  try {
    sessionStorage.setItem("sp_app_mode", "league");
    sessionStorage.setItem("sp_active_league_id", leagueObj.id);
  } catch (e) {}

  closeLeagueDrawer();
  updateAppShellForMode();
  await loadCustomLeagueData(leagueObj.id);
  switchTab("matchups");
  showToast(`🏆 Welcome to ${leagueObj.name}!`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function enterSoloPlay() {
  if (!state.authUser) {
    state.postAuthAction = "solo";
    closeLeagueDrawer();
    showToast("🔮 Please sign in to access Solo Play.");
    openAuthModal("Sign in or create an account to access Solo Psychic and manage pick sheets", "signin");
    return;
  }

  state.appMode = "solo";
  state.activeLeague = "solo";
  state.activeSheetId = null;
  try {
    sessionStorage.setItem("sp_app_mode", "solo");
  } catch (e) {}

  closeLeagueDrawer();
  updateAppShellForMode();
  await loadSoloPickSheets();
  renderSoloView();
  showToast("🔮 Entered Solo Psychic");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitToLobby() {
  state.appMode = "lobby";
  state.activeLeagueData = null;
  state.activeSheetId = null;
  try {
    sessionStorage.setItem("sp_app_mode", "lobby");
    sessionStorage.removeItem("sp_active_league_id");
  } catch (e) {}

  updateAppShellForMode();
  switchTab("matchups");
  showToast("🏠 Returned to Home Lobby");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleBrandClick() {
  if (state.appMode === "solo") {
    state.activeSheetId = null;
    renderSoloView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (state.appMode === "league") {
    switchTab("leaderboard");
  } else {
    switchTab("matchups");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// =========================================================
// SOLO PSYCHIC PLAY & PICK SHEETS ENGINE
// =========================================================

async function loadSoloPickSheets() {
  const userId = state.authUser ? state.authUser.id : "guest";
  let localSheets = [];
  try {
    const raw = localStorage.getItem(`sp_solo_sheets_${userId}`);
    if (raw) localSheets = JSON.parse(raw);
  } catch (e) {}

  if (supabaseClient && state.authUser) {
    try {
      const { data, error } = await supabaseClient
        .from("pick_sheets")
        .select("*")
        .eq("user_id", state.authUser.id)
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const map = new Map();
        data.forEach(s => map.set(s.id, s));
        localSheets.forEach(s => {
          if (!map.has(s.id)) map.set(s.id, s);
        });
        state.pickSheets = Array.from(map.values());
        try {
          localStorage.setItem(`sp_solo_sheets_${userId}`, JSON.stringify(state.pickSheets));
        } catch (e) {}
        return;
      }
    } catch (err) {
      console.warn("Notice: pick_sheets query falling back to local storage:", err);
    }
  }

  state.pickSheets = localSheets;
}

async function saveSoloPickSheet(sheet) {
  const userId = state.authUser ? state.authUser.id : "guest";
  if (!Array.isArray(state.pickSheets)) state.pickSheets = [];

  const existingIdx = state.pickSheets.findIndex(s => s.id === sheet.id);
  if (existingIdx >= 0) {
    state.pickSheets[existingIdx] = sheet;
  } else {
    state.pickSheets.unshift(sheet);
  }

  try {
    localStorage.setItem(`sp_solo_sheets_${userId}`, JSON.stringify(state.pickSheets));
  } catch (e) {}

  if (supabaseClient && state.authUser && sheet.user_id === state.authUser.id) {
    try {
      await supabaseClient.from("pick_sheets").upsert(sheet, { onConflict: "id" });
    } catch (e) {
      console.warn("Notice: Supabase pick_sheets upsert notice:", e);
    }
  }
}

/**
 * Parses kickoff string into Date object.
 * Supports "Thu 10/1 8:15 PM", "10/1 8:15 PM", ISO dates, etc.
 */
function parseGameKickoff(dateTimeStr) {
  if (!dateTimeStr || typeof dateTimeStr !== "string") return null;
  const parsedDirect = new Date(dateTimeStr);
  if (!isNaN(parsedDirect.getTime()) && parsedDirect.getFullYear() >= 2026) {
    return parsedDirect;
  }
  const m = dateTimeStr.match(/(\d{1,2})\/(\d{1,2})(?:\s+@\s+|\s+)(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (m) {
    const month = parseInt(m[1], 10);
    const day = parseInt(m[2], 10);
    let hours = parseInt(m[3], 10);
    const minutes = parseInt(m[4], 10);
    const ampm = (m[5] || "").toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    const year = (month <= 2) ? 2027 : 2026;
    return new Date(year, month - 1, day, hours, minutes, 0);
  }
  const dateOnlyMatch = dateTimeStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (dateOnlyMatch) {
    const month = parseInt(dateOnlyMatch[1], 10);
    const day = parseInt(dateOnlyMatch[2], 10);
    const year = (month <= 2) ? 2027 : 2026;
    return new Date(year, month - 1, day, 13, 0, 0);
  }
  return null;
}

/**
 * Determines if an NFL game is locked for user predictions:
 * 1. Final or live games are always locked.
 * 2. Games with recorded scores (>0) are locked.
 * 3. Games in past NFL weeks (prior to current NFL week) are 100% locked.
 * 4. Games whose official kickoff date/time has passed are locked.
 */
function isGameLockedForPicking(game, weekNum = null) {
  if (!game) return true;
  if (game.isFinal || game.isLive) return true;
  if (game.awayScore !== null && game.homeScore !== null && (game.awayScore > 0 || game.homeScore > 0)) {
    return true;
  }
  const currWk = getCurrentNFLWeek();
  let w = weekNum;
  if (!w && game.id) {
    const m = game.id.match(/Week\s*(\d+)/i);
    if (m) w = parseInt(m[1], 10);
  }
  if (w && w < currWk) return true;
  if (game.kickoffTime) {
    const d = new Date(game.kickoffTime);
    if (!isNaN(d.getTime()) && d.getTime() <= Date.now()) return true;
  }
  if (game.dateTime) {
    const ko = parseGameKickoff(game.dateTime);
    if (ko && ko.getTime() <= Date.now()) return true;
  }
  return false;
}

/**
 * Returns human-readable lock badge text and styling for a game.
 */
function getGameLockStatus(game, weekNum = null) {
  const locked = isGameLockedForPicking(game, weekNum);
  if (!locked) {
    return {
      isLocked: false,
      badgeText: "🟢 Open for Picks",
      badgeClass: "badge-open",
      detail: "Make your predictions before kickoff"
    };
  }
  if (game && game.isFinal) {
    return {
      isLocked: true,
      badgeText: "🔒 FINAL • Game Concluded",
      badgeClass: "badge-final",
      detail: "Picks locked — game is final"
    };
  }
  if (game && game.isLive) {
    return {
      isLocked: true,
      badgeText: "🔴 LIVE • In Progress",
      badgeClass: "badge-live",
      detail: "Picks locked — game in progress"
    };
  }
  return {
    isLocked: true,
    badgeText: "🔒 KICKOFF PASSED",
    badgeClass: "badge-started",
    detail: "Kickoff has passed — picks locked"
  };
}

/**
 * Finds game object by ID across state.data and initial schedule.
 */
function findGameById(gameId) {
  if (!gameId) return null;
  if (state.data && state.data.weeks) {
    for (const wKey in state.data.weeks) {
      const wk = state.data.weeks[wKey];
      if (wk && Array.isArray(wk.games)) {
        const found = wk.games.find(g => g.id === gameId);
        if (found) return found;
      }
    }
  }
  if (typeof OG_LEAGUE_INITIAL_DATA !== "undefined" && OG_LEAGUE_INITIAL_DATA.weeks) {
    for (const wKey in OG_LEAGUE_INITIAL_DATA.weeks) {
      const wk = OG_LEAGUE_INITIAL_DATA.weeks[wKey];
      if (wk && Array.isArray(wk.games)) {
        const found = wk.games.find(g => g.id === gameId);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * Computes live points, pick totals, and accuracy rate for a solo sheet.
 */
function calculateSheetStats(sheet) {
  if (!sheet) return { total_picks: 0, total_points: 0, accuracy_rate: null };
  const picks = sheet.picks || {};
  let totalPicks = 0;
  let correctWinners = 0;
  let evaluatedGames = 0;
  let totalPoints = 0;

  for (const [gameId, pick] of Object.entries(picks)) {
    if (!pick || !pick.winner) continue;
    totalPicks++;

    const game = findGameById(gameId);
    if (!game || !game.isFinal || !game.winner) continue;

    evaluatedGames++;
    const pickWinnerNorm = normalizeTeamCode(pick.winner);
    const actualWinnerNorm = normalizeTeamCode(game.winner);
    const isWinnerCorrect = (pickWinnerNorm === actualWinnerNorm);

    if (isWinnerCorrect) {
      correctWinners++;
      const mult = pick.multiplier ? 3 : 1;
      let pts = 10 * mult;

      const pAway = (pick.awayScore !== null && !isNaN(pick.awayScore)) ? parseInt(pick.awayScore, 10) : null;
      const pHome = (pick.homeScore !== null && !isNaN(pick.homeScore)) ? parseInt(pick.homeScore, 10) : null;
      if (pAway !== null && pHome !== null && game.awayScore !== null && game.homeScore !== null) {
        if (pAway === game.awayScore && pHome === game.homeScore) {
          pts += (50 * mult);
        }
      }
      totalPoints += pts;
    }
  }

  const accuracyRate = evaluatedGames > 0 ? Math.round((correctWinners / evaluatedGames) * 100) : null;
  sheet.total_picks = totalPicks;
  sheet.total_points = totalPoints;
  sheet.accuracy_rate = accuracyRate;
  return { total_picks: totalPicks, total_points: totalPoints, accuracy_rate: accuracyRate };
}

function updateSheetEditorStats(sheet) {
  const subtitleEl = document.getElementById("sheet-editor-stats-subtitle");
  if (subtitleEl && sheet) {
    subtitleEl.textContent = `${sheet.total_picks || 0} Picks Made • ${sheet.total_points || 0} Solo Points`;
  }
}

function renderSoloView() {
  if (!state.authUser) {
    exitToLobby();
    showToast("🔮 Please sign in to access Solo Play.");
    openAuthModal("Sign in or create an account to access Solo Psychic and manage pick sheets", "signin");
    return;
  }

  const dashSubview = document.getElementById("solo-dashboard-subview");
  const editorSubview = document.getElementById("solo-sheet-editor-subview");

  if (state.activeSheetId) {
    if (dashSubview) dashSubview.style.display = "none";
    if (editorSubview) {
      editorSubview.style.display = "block";
      renderSoloSheetEditor();
    }
    return;
  }

  if (dashSubview) dashSubview.style.display = "block";
  if (editorSubview) editorSubview.style.display = "none";

  const grid = document.getElementById("solo-sheets-grid");
  const statsBar = document.getElementById("solo-stats-bar");
  if (!grid) return;

  const sheets = Array.isArray(state.pickSheets) ? state.pickSheets : [];

  if (sheets.length === 0) {
    if (statsBar) statsBar.style.display = "none";
    grid.innerHTML = `
      <div class="solo-empty-card">
        <div class="solo-empty-icon-wrap">
          <span class="solo-empty-icon">🔮</span>
          <div class="solo-empty-glow"></div>
        </div>
        <h3 class="solo-empty-title">No Pick Sheets Created Yet</h3>
        <p class="solo-empty-desc">
          You haven't created any pick sheets yet. Start your first 2026 NFL prediction sheet to forecast weekly matchups, lock in exact scores, and test your psychic instincts!
        </p>
        <div class="solo-empty-features">
          <div class="empty-feature-item">
            <span class="empty-feature-icon">🎯</span>
            <span>Predict exact game scores & weekly winners</span>
          </div>
          <div class="empty-feature-item">
            <span class="empty-feature-icon">🔒</span>
            <span>Select your 3x Lock of the Week</span>
          </div>
          <div class="empty-feature-item">
            <span class="empty-feature-icon">📊</span>
            <span>Track your accuracy rate & scoring records</span>
          </div>
        </div>
        <button type="button" class="btn-hero-primary solo-empty-btn" onclick="openCreateSheetModal()">
          <span>✨ Create Your First Pick Sheet</span>
        </button>
      </div>
    `;
    return;
  }

  // Render Stats Bar
  if (statsBar) {
    statsBar.style.display = "grid";
    const totalPicks = sheets.reduce((acc, s) => acc + (s.total_picks || 0), 0);
    const totalPoints = sheets.reduce((acc, s) => acc + (s.total_points || 0), 0);

    statsBar.innerHTML = `
      <div class="solo-stat-card">
        <span class="solo-stat-label">Active Sheets</span>
        <span class="solo-stat-value">${sheets.length}</span>
      </div>
      <div class="solo-stat-card">
        <span class="solo-stat-label">Season Campaign</span>
        <span class="solo-stat-value">2026 NFL</span>
      </div>
      <div class="solo-stat-card">
        <span class="solo-stat-label">Predictions Logged</span>
        <span class="solo-stat-value">${totalPicks}</span>
      </div>
      <div class="solo-stat-card">
        <span class="solo-stat-label">Total Solo Points</span>
        <span class="solo-stat-value">${totalPoints} pts</span>
      </div>
    `;
  }

  // Render Sheets Grid
  grid.innerHTML = sheets.map(sheet => {
    const isSeason = (sheet.format === "season");
    const formatBadge = isSeason
      ? `<span class="sheet-card-badge badge-season">📅 Full Season (Weeks 1-18)</span>`
      : `<span class="sheet-card-badge badge-weekly">⚡ Week ${sheet.active_week || 5} Slate</span>`;

    let dateStr = "Recent";
    if (sheet.created_at) {
      try {
        const d = new Date(sheet.created_at);
        dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      } catch (e) {}
    }

    const safeTitle = (sheet.name || "Untitled Sheet").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return `
      <div class="solo-sheet-card" onclick="openPickSheet('${sheet.id}')">
        <div class="sheet-card-top">
          ${formatBadge}
          <div class="sheet-card-menu" onclick="event.stopPropagation()">
            <button type="button" class="btn-sheet-menu" onclick="deleteSoloSheet('${sheet.id}')" title="Delete sheet" aria-label="Delete sheet">🗑️</button>
          </div>
        </div>
        <div class="sheet-card-title">${safeTitle}</div>
        <div class="sheet-card-meta">
          <span>Created ${dateStr}</span>
          <span>•</span>
          <span>2026 NFL</span>
        </div>

        <div class="sheet-card-stats-row">
          <div class="sheet-stat-pill">
            <span class="stat-label">Picks Made</span>
            <span class="stat-val">${sheet.total_picks || 0}</span>
          </div>
          <div class="sheet-stat-pill">
            <span class="stat-label">Score</span>
            <span class="stat-val">${sheet.total_points || 0} pts</span>
          </div>
          <div class="sheet-stat-pill">
            <span class="stat-label">Accuracy</span>
            <span class="stat-val">${sheet.accuracy_rate ? sheet.accuracy_rate + "%" : "—"}</span>
          </div>
        </div>

        <div class="sheet-card-footer">
          <button type="button" class="btn-open-sheet" onclick="openPickSheet('${sheet.id}')">
            <span>Open Sheet</span>
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function openCreateSheetModal() {
  if (!state.authUser) {
    state.postAuthAction = "solo";
    showToast("🔮 Please sign in to create a pick sheet.");
    openAuthModal("Sign in or create an account to create custom pick sheets", "signin");
    return;
  }

  const modal = document.getElementById("create-sheet-modal");
  if (!modal) return;

  const nameInput = document.getElementById("sheet-name-input");
  if (nameInput) {
    const nextNum = (state.pickSheets ? state.pickSheets.length : 0) + 1;
    nameInput.value = `My 2026 Prophecy Sheet #${nextNum}`;
  }

  selectSheetFormat("season");

  const weekSelect = document.getElementById("sheet-target-week");
  if (weekSelect) weekSelect.value = state.currentWeek || "5";

  modal.classList.add("active");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  if (nameInput) setTimeout(() => nameInput.focus(), 150);
}

function closeCreateSheetModal(event) {
  if (event && event.target && !event.target.classList.contains("auth-modal-backdrop")) {
    return;
  }
  const modal = document.getElementById("create-sheet-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.style.display = "none";
  }
  document.body.style.overflow = "";
}

function selectSheetFormat(format) {
  state.createSheetFormat = format;
  const optSeason = document.getElementById("format-opt-season");
  const optWeekly = document.getElementById("format-opt-weekly");
  const weekRow = document.getElementById("sheet-week-select-row");

  if (optSeason) optSeason.classList.toggle("active", format === "season");
  if (optWeekly) optWeekly.classList.toggle("active", format === "weekly");
  if (weekRow) weekRow.style.display = (format === "weekly") ? "block" : "none";
}

async function handleCreateSheetSubmit() {
  const nameInput = document.getElementById("sheet-name-input");
  const weekSelect = document.getElementById("sheet-target-week");

  let sheetName = (nameInput && nameInput.value || "").trim();
  if (!sheetName) {
    const nextNum = (state.pickSheets ? state.pickSheets.length : 0) + 1;
    sheetName = `My 2026 Prophecy Sheet #${nextNum}`;
  }

  const format = state.createSheetFormat || "season";
  const activeWeek = (format === "weekly" && weekSelect) ? parseInt(weekSelect.value, 10) : (state.currentWeek || 5);

  const newSheet = {
    id: "sheet_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
    user_id: state.authUser ? state.authUser.id : "guest",
    name: sheetName,
    format: format,
    season_year: 2026,
    active_week: activeWeek,
    total_picks: 0,
    total_points: 0,
    accuracy_rate: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await saveSoloPickSheet(newSheet);
  closeCreateSheetModal();
  renderSoloView();
  showToast(`✨ Created "${sheetName}"!`);
}

function openPickSheet(sheetId) {
  if (!state.authUser) {
    state.postAuthAction = "solo";
    showToast("🔮 Please sign in to open pick sheets.");
    openAuthModal("Sign in to view and fill out your pick sheets", "signin");
    return;
  }

  state.activeSheetId = sheetId;
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  if (sheet) {
    if (sheet.format === "weekly") {
      state.selectedSheetWeek = sheet.active_week || state.currentWeek || 5;
    } else {
      if (!state.selectedSheetWeek) {
        state.selectedSheetWeek = sheet.active_week || state.currentWeek || 5;
      }
    }
  }
  renderSoloView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closePickSheetEditor() {
  state.activeSheetId = null;
  renderSoloView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectSoloSheetWeek(weekNum) {
  const w = parseInt(weekNum, 10);
  if (isNaN(w) || w < 1 || w > 18) return;
  state.selectedSheetWeek = w;
  const sheet = (state.pickSheets || []).find(s => s.id === state.activeSheetId);
  if (sheet) {
    sheet.active_week = w;
    saveSoloPickSheet(sheet);
  }
  renderSoloSheetEditor();
  const weekKey = `Week ${w}`;
  if (!state.data || !state.data.weeks || !state.data.weeks[weekKey]) {
    syncWeek(w, true).then(() => {
      if (state.activeSheetId) renderSoloSheetEditor();
    });
  }
}

function renderSoloSheetEditor() {
  const container = document.getElementById("solo-sheet-editor-subview");
  if (!container) return;

  const sheet = (state.pickSheets || []).find(s => s.id === state.activeSheetId);
  if (!sheet) {
    closePickSheetEditor();
    return;
  }

  const isSeason = (sheet.format === "season");
  const currentNFLWk = getCurrentNFLWeek();
  const selectedWk = state.selectedSheetWeek || sheet.active_week || currentNFLWk;
  state.selectedSheetWeek = selectedWk;

  calculateSheetStats(sheet);

  // 1. Week strip (only for Full Season sheets)
  let weekStripHtml = "";
  if (isSeason) {
    const pills = [];
    for (let w = 1; w <= 18; w++) {
      const isActive = (w === selectedWk);
      const isPast = (w < currentNFLWk);
      const label = isPast ? `🔒 Wk ${w}` : `Wk ${w}`;
      pills.push(`
        <button type="button" class="sheet-week-pill ${isActive ? "active" : ""} ${isPast ? "locked" : ""}"
          onclick="selectSoloSheetWeek(${w})" title="${isPast ? `Week ${w} (Concluded - Locked)` : `Week ${w}`}">
          <span>${label}</span>
        </button>
      `);
    }
    weekStripHtml = `
      <div class="sheet-week-strip-wrap">
        <div class="sheet-week-strip">
          ${pills.join("")}
        </div>
      </div>
    `;
  }

  // 2. Fetch games for selected week
  const weekKey = `Week ${selectedWk}`;
  let games = (state.data && state.data.weeks && state.data.weeks[weekKey] && state.data.weeks[weekKey].games)
    ? state.data.weeks[weekKey].games
    : [];

  if (games.length === 0 && typeof OG_LEAGUE_INITIAL_DATA !== "undefined" && OG_LEAGUE_INITIAL_DATA.weeks && OG_LEAGUE_INITIAL_DATA.weeks[weekKey]) {
    games = OG_LEAGUE_INITIAL_DATA.weeks[weekKey].games || [];
  }

  // Determine active 3X Lock in this week
  const picks = sheet.picks || {};
  let currentLockTeam = null;
  games.forEach(g => {
    const pk = picks[g.id];
    if (pk && pk.multiplier && pk.winner) {
      currentLockTeam = pk.winner;
    }
  });

  const isWeekPast = (selectedWk < currentNFLWk);
  const weekBannerLockStatus = isWeekPast
    ? `<span class="sheet-week-banner-lock-status">🔒 Concluded Week • All Picks Locked</span>`
    : `<span class="sheet-week-banner-lock-status">⚡ Rolling Kickoff Locks Active</span>`;

  const lockStatusCallout = currentLockTeam
    ? `<span style="font-size:0.75rem; font-weight:800; color:var(--accent-gold);">⭐ 3X Lock: <strong>${currentLockTeam}</strong></span>`
    : `<span style="font-size:0.75rem; color:var(--text-dim);">⭐ 3X Lock: None Selected</span>`;

  // 3. Build Games Grid
  const gamesHtml = games.map((game, idx) => {
    const parts = (game.matchup || "").split("@").map(s => s.trim().toUpperCase());
    const awayTeam = parts[0] || "AWAY";
    const homeTeam = parts[1] || "HOME";

    const awayInfo = getTeamInfo(awayTeam);
    const homeInfo = getTeamInfo(homeTeam);
    const awayRec = getNFLTeamRecord(awayTeam, selectedWk);
    const homeRec = getNFLTeamRecord(homeTeam, selectedWk);

    const lockStatus = getGameLockStatus(game, selectedWk);
    const isLocked = lockStatus.isLocked;

    const pick = picks[game.id] || {};
    const pickWinner = (pick.winner || "").toUpperCase().trim();
    const awaySelected = (pickWinner === awayTeam);
    const homeSelected = (pickWinner === homeTeam);

    const pickAwayScore = (pick.awayScore !== undefined && pick.awayScore !== null) ? pick.awayScore : "";
    const pickHomeScore = (pick.homeScore !== undefined && pick.homeScore !== null) ? pick.homeScore : "";
    const isMultiplier = Boolean(pick.multiplier);

    // Actual score bar if available
    let actualScoreBarHtml = "";
    if (game.isFinal || game.isLive || (game.awayScore !== null && game.homeScore !== null)) {
      const statusTitle = game.isFinal ? "Final Score" : (game.isLive ? "Live Score" : "Game Score");
      actualScoreBarHtml = `
        <div class="game-actual-score-bar">
          <span>${statusTitle}</span>
          <span class="actual-score-val">${awayTeam} ${game.awayScore} - ${game.homeScore} ${homeTeam}</span>
        </div>
      `;
    }

    // Notice if locked and no pick was made prior to kickoff
    let lockedNoticeHtml = "";
    if (isLocked && !pickWinner) {
      lockedNoticeHtml = `
        <div class="game-locked-notice">
          🔒 Kickoff has passed. No pick was submitted prior to game start.
        </div>
      `;
    }

    const cardClass = isLocked ? "is-locked-game" : "is-open-game";

    return `
      <div class="sheet-game-card ${cardClass}" id="sheet-card-${game.id}">
        <!-- Top Status & Kickoff Bar -->
        <div class="game-card-top-status">
          <span class="game-lock-badge ${lockStatus.badgeClass}">
            ${lockStatus.badgeText}
          </span>
          <span class="game-kickoff-time">${game.dateTime || `Game ${idx + 1}`}</span>
        </div>

        <!-- Matchup Header Row -->
        <div class="game-matchup-header-row">
          <div class="game-team-pill">
            <div class="game-team-chip" style="background-color: ${awayInfo.color}; color: ${awayInfo.textColor};">
              ${awayTeam}
            </div>
            <div class="game-team-name-block">
              <span class="game-team-abbr">${awayTeam}</span>
              <span class="game-team-rec">${awayRec.text}</span>
            </div>
          </div>

          <span class="game-vs-separator">@</span>

          <div class="game-team-pill" style="flex-direction: row-reverse;">
            <div class="game-team-chip" style="background-color: ${homeInfo.color}; color: ${homeInfo.textColor};">
              ${homeTeam}
            </div>
            <div class="game-team-name-block" style="text-align: right;">
              <span class="game-team-abbr">${homeTeam}</span>
              <span class="game-team-rec">${homeRec.text}</span>
            </div>
          </div>
        </div>

        ${actualScoreBarHtml}

        <!-- Winner Picker Buttons -->
        <div class="game-winner-picker">
          <button type="button" class="btn-pick-winner ${awaySelected ? "selected" : ""}"
            ${isLocked ? "disabled" : ""}
            onclick="setSoloPickWinner('${sheet.id}', '${game.id}', '${awayTeam}', ${isLocked})"
            title="${isLocked ? "Game is locked" : `Pick ${awayTeam} to win`}">
            <span>${awaySelected ? "✓ " : ""}${awayTeam}</span>
          </button>
          <button type="button" class="btn-pick-winner ${homeSelected ? "selected" : ""}"
            ${isLocked ? "disabled" : ""}
            onclick="setSoloPickWinner('${sheet.id}', '${game.id}', '${homeTeam}', ${isLocked})"
            title="${isLocked ? "Game is locked" : `Pick ${homeTeam} to win`}">
            <span>${homeSelected ? "✓ " : ""}${homeTeam}</span>
          </button>
        </div>

        <!-- Exact Score Prediction Row -->
        <div class="game-scores-row">
          <div class="score-col-item">
            <span class="score-col-label">${awayTeam}</span>
            <div class="score-input-wrap">
              <button type="button" class="btn-score-step" ${isLocked ? "disabled" : ""}
                onclick="stepSoloPickScore('${sheet.id}', '${game.id}', 'away', -1, ${isLocked})">-</button>
              <input type="number" min="0" max="99" class="score-input"
                value="${pickAwayScore}" ${isLocked ? "disabled" : ""} placeholder="—"
                onchange="handleSoloScoreInput('${sheet.id}', '${game.id}', 'away', this.value, ${isLocked})"
                oninput="handleSoloScoreInput('${sheet.id}', '${game.id}', 'away', this.value, ${isLocked})"
                aria-label="${awayTeam} Predicted Score" />
              <button type="button" class="btn-score-step" ${isLocked ? "disabled" : ""}
                onclick="stepSoloPickScore('${sheet.id}', '${game.id}', 'away', 1, ${isLocked})">+</button>
            </div>
          </div>

          <span class="score-vs-dash">-</span>

          <div class="score-col-item">
            <div class="score-input-wrap">
              <button type="button" class="btn-score-step" ${isLocked ? "disabled" : ""}
                onclick="stepSoloPickScore('${sheet.id}', '${game.id}', 'home', -1, ${isLocked})">-</button>
              <input type="number" min="0" max="99" class="score-input"
                value="${pickHomeScore}" ${isLocked ? "disabled" : ""} placeholder="—"
                onchange="handleSoloScoreInput('${sheet.id}', '${game.id}', 'home', this.value, ${isLocked})"
                oninput="handleSoloScoreInput('${sheet.id}', '${game.id}', 'home', this.value, ${isLocked})"
                aria-label="${homeTeam} Predicted Score" />
              <button type="button" class="btn-score-step" ${isLocked ? "disabled" : ""}
                onclick="stepSoloPickScore('${sheet.id}', '${game.id}', 'home', 1, ${isLocked})">+</button>
            </div>
            <span class="score-col-label">${homeTeam}</span>
          </div>
        </div>

        <!-- 3X Lock of the Week Toggle -->
        <div class="game-multiplier-row">
          <button type="button" class="btn-toggle-multiplier ${isMultiplier ? "active" : ""}"
            ${isLocked ? "disabled" : ""}
            onclick="toggleSoloPickMultiplier('${sheet.id}', '${game.id}', ${selectedWk}, ${isLocked})"
            title="${isLocked ? "Game is locked" : "Toggle 3X Lock of the Week"}">
            <span>${isMultiplier ? "⭐ 3X LOCK OF THE WEEK ACTIVE" : "⭐ Select as 3X Lock of the Week"}</span>
          </button>
        </div>

        ${lockedNoticeHtml}
      </div>
    `;
  }).join("");

  const formatPillClass = isSeason ? "pill-season" : "pill-weekly";
  const formatPillText = isSeason ? "Full Season (Weeks 1-18)" : `Week ${selectedWk} Slate`;
  const safeTitle = (sheet.name || "Untitled Sheet").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  container.innerHTML = `
    <div class="sheet-editor-container">
      <!-- Topbar Navigation -->
      <div class="sheet-editor-topbar">
        <div class="sheet-editor-top-left">
          <button type="button" class="btn-sheet-back" onclick="closePickSheetEditor()" aria-label="Back to pick sheets">
            <span class="btn-back-arrow">&larr;</span>
            <span>Back to My Sheets</span>
          </button>
          <div class="sheet-editor-title-wrap">
            <div class="sheet-editor-title-row">
              <h2 class="sheet-editor-title">${safeTitle}</h2>
              <span class="sheet-editor-meta-pill ${formatPillClass}">${formatPillText}</span>
            </div>
            <div class="sheet-editor-subtitle" id="sheet-editor-stats-subtitle">
              ${sheet.total_picks || 0} Picks Made • ${sheet.total_points || 0} Solo Points
            </div>
          </div>
        </div>

        <div class="sheet-editor-top-right">
          <div class="sheet-save-indicator">
            <span>✓</span>
            <span>Auto-Saved to Cloud</span>
          </div>
        </div>
      </div>

      <!-- Week Strip (if season sheet) -->
      ${weekStripHtml}

      <!-- Week Header Banner -->
      <div class="sheet-week-banner">
        <div class="sheet-week-banner-left">
          <div>
            <div class="sheet-week-banner-title">Week ${selectedWk} Slate</div>
            <div class="sheet-week-banner-sub">${games.length} Matchups • Select winners, forecast exact scores & lock your 3X play</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          ${lockStatusCallout}
          ${weekBannerLockStatus}
        </div>
      </div>

      <!-- Games Grid -->
      <div class="sheet-games-grid">
        ${gamesHtml}
      </div>
    </div>
  `;
}

async function setSoloPickWinner(sheetId, gameId, winnerTeam, isLocked) {
  if (isLocked) {
    showToast("🔒 Picks are locked for this game");
    return;
  }
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  if (!sheet) return;
  if (!sheet.picks) sheet.picks = {};
  if (!sheet.picks[gameId]) sheet.picks[gameId] = {};

  if (sheet.picks[gameId].winner === winnerTeam) {
    delete sheet.picks[gameId].winner;
  } else {
    sheet.picks[gameId].winner = winnerTeam;
  }

  calculateSheetStats(sheet);
  await saveSoloPickSheet(sheet);
  renderSoloSheetEditor();
}

async function stepSoloPickScore(sheetId, gameId, teamSide, delta, isLocked) {
  if (isLocked) {
    showToast("🔒 Scores are locked for this game");
    return;
  }
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  if (!sheet) return;
  if (!sheet.picks) sheet.picks = {};
  if (!sheet.picks[gameId]) sheet.picks[gameId] = {};

  const key = (teamSide === "away") ? "awayScore" : "homeScore";
  let cur = sheet.picks[gameId][key];
  if (cur === undefined || cur === null || isNaN(cur) || cur === "") {
    cur = delta > 0 ? 20 : 0;
  } else {
    cur = parseInt(cur, 10) + delta;
  }
  cur = Math.max(0, Math.min(99, cur));
  sheet.picks[gameId][key] = cur;

  calculateSheetStats(sheet);
  await saveSoloPickSheet(sheet);
  renderSoloSheetEditor();
}

async function handleSoloScoreInput(sheetId, gameId, teamSide, valStr, isLocked) {
  if (isLocked) return;
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  if (!sheet) return;
  if (!sheet.picks) sheet.picks = {};
  if (!sheet.picks[gameId]) sheet.picks[gameId] = {};

  const key = (teamSide === "away") ? "awayScore" : "homeScore";
  const cleaned = (valStr || "").trim();
  if (cleaned === "" || isNaN(cleaned)) {
    sheet.picks[gameId][key] = null;
  } else {
    sheet.picks[gameId][key] = Math.max(0, Math.min(99, parseInt(cleaned, 10)));
  }

  calculateSheetStats(sheet);
  await saveSoloPickSheet(sheet);
  updateSheetEditorStats(sheet);
}

async function toggleSoloPickMultiplier(sheetId, gameId, weekNum, isLocked) {
  if (isLocked) {
    showToast("🔒 3X multiplier is locked for this game");
    return;
  }
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  if (!sheet) return;
  if (!sheet.picks) sheet.picks = {};
  if (!sheet.picks[gameId]) sheet.picks[gameId] = {};

  const currentlyActive = Boolean(sheet.picks[gameId].multiplier);
  if (currentlyActive) {
    sheet.picks[gameId].multiplier = false;
    showToast("Removed 3X Lock of the Week");
  } else {
    // Clear 3X multiplier on all other games in this same week
    const weekPrefix = `Week ${weekNum}_`;
    for (const [k, p] of Object.entries(sheet.picks)) {
      if (k.startsWith(weekPrefix) && p && p.multiplier) {
        p.multiplier = false;
      }
    }
    sheet.picks[gameId].multiplier = true;
    showToast("⭐ Set as 3X Lock of the Week!");
  }

  calculateSheetStats(sheet);
  await saveSoloPickSheet(sheet);
  renderSoloSheetEditor();
}

async function deleteSoloSheet(sheetId) {
  const sheet = (state.pickSheets || []).find(s => s.id === sheetId);
  const name = sheet ? sheet.name : "this sheet";
  const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
  if (!confirmed) return;

  if (state.activeSheetId === sheetId) {
    state.activeSheetId = null;
  }

  state.pickSheets = (state.pickSheets || []).filter(s => s.id !== sheetId);
  const userId = state.authUser ? state.authUser.id : "guest";
  try {
    localStorage.setItem(`sp_solo_sheets_${userId}`, JSON.stringify(state.pickSheets));
  } catch (e) {}

  if (supabaseClient && state.authUser) {
    try {
      await supabaseClient.from("pick_sheets").delete().eq("id", sheetId);
    } catch (e) {}
  }

  renderSoloView();
  showToast(`🗑️ Deleted "${name}"`);
}

// =========================================================
// SUPABASE AUTHENTICATION & CLOUD SYNC ENGINE
// =========================================================

async function initSupabaseAuth() {
  initSupabaseClient();
  if (!supabaseClient) return;

  try {
    // 1. Check existing session
    const { data: sessionData, error: sessionErr } = await supabaseClient.auth.getSession();
    if (!sessionErr && sessionData && sessionData.session && sessionData.session.user) {
      await handleUserSession(sessionData.session.user);
    } else {
      if (state.appMode === "league" || state.appMode === "solo") {
        exitToLobby();
      }
    }

    // 2. Subscribe to auth lifecycle changes
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        await handleUserSession(session.user);
      } else if (event === "SIGNED_OUT") {
        state.authUser = null;
        state.userProfile = null;
        exitToLobby();
        updateAppShellForMode();
        renderHeaderProfile();
      }
    });

    // 3. Sync live cloud standings view
    await syncLeagueStandingsFromCloud();
  } catch (e) {
    console.warn("Supabase Auth initialization warning:", e);
  }
}

async function handleUserSession(user) {
  if (!user) return;
  state.authUser = user;

  try {
    // 1. Fetch user profile from public.profiles
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      state.userProfile = profile;
    }

    // 2. Resolve league member identity
    const userEmail = (user.email || "").toLowerCase().trim();
    let claimedPlayer = null;

    if (profile && profile.full_name && PLAYERS.includes(profile.full_name)) {
      claimedPlayer = profile.full_name;
    }

    if (!claimedPlayer && userEmail) {
      const { data: invite } = await supabaseClient
        .from("league_roster_invites")
        .select("player_name")
        .ilike("invited_email", userEmail)
        .maybeSingle();

      if (invite && invite.player_name && PLAYERS.includes(invite.player_name)) {
        claimedPlayer = invite.player_name;
      }
    }

    // Automatic pre-mapping fallbacks
    if (!claimedPlayer) {
      if (userEmail === "jonnylcolbert@gmail.com") claimedPlayer = "Jon";
      else if (userEmail === "alishaklezmer16@gmail.com") claimedPlayer = "Alisha";
      else if (userEmail === "thatpkboy@gmail.com") claimedPlayer = "Carson";
    }

    if (claimedPlayer) {
      state.myPlayer = claimedPlayer;
      state.selectedPlayer = claimedPlayer;
      try {
        localStorage.setItem(SAVED_USER_KEY, claimedPlayer);
      } catch (e) {}

      if (!state.userProfile) {
        state.userProfile = {
          id: user.id,
          username: claimedPlayer,
          full_name: claimedPlayer,
          email: user.email
        };
      } else if (!state.userProfile.username) {
        state.userProfile.username = claimedPlayer;
      }

      if (supabaseClient && (!profile || !profile.username)) {
        try {
          await supabaseClient
            .from("profiles")
            .upsert({
              id: user.id,
              username: claimedPlayer,
              full_name: claimedPlayer,
              favorite_team: getFavoriteTeam().code || "KC"
            }, { onConflict: "id" });
        } catch (e) {}
      }
    } else {
      if (state.userProfile && !state.userProfile.username && user.user_metadata && user.user_metadata.username) {
        state.userProfile.username = user.user_metadata.username;
      }
    }
  } catch (err) {
    console.warn("User session handling error:", err);
  }

  await loadSoloPickSheets();
  await loadUserLeagues();
  updateAppShellForMode();
  renderHeaderProfile();
  syncLeagueStandingsFromCloud();

  if (state.pendingJoinLeague) {
    const pending = state.pendingJoinLeague;
    state.pendingJoinLeague = null;
    if (pending.name === "OG League" || pending.join_code === "OG2026") {
      enterLeagueView("OG League");
    } else {
      await enterCustomLeague(pending.id || pending.join_code || pending.name);
    }
  } else if (state.postAuthAction === "solo") {
    state.postAuthAction = null;
    enterSoloPlay();
  }
}

async function syncLeagueStandingsFromCloud() {
  initSupabaseClient();
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from("league_standings")
      .select("*");

    if (!error && Array.isArray(data) && data.length > 0) {
      state.cloudStandings = data;
      if (state.activeTab === "leaderboard") {
        renderLeaderboard();
      }
    }
  } catch (e) {
    console.warn("Cloud standings fetch warning:", e);
  }
}

function setAuthAlert(message, type = "error") {
  const alertEl = document.getElementById("auth-alert");
  if (!alertEl) return;
  alertEl.className = `auth-alert-box ${type}`;
  alertEl.innerHTML = message;
  alertEl.style.display = "block";
}

state.authMode = "signin"; // "signin" | "signup"

function setAuthMode(mode = "signin") {
  state.authMode = mode;
  const tabSignIn = document.getElementById("tab-auth-signin");
  const tabSignUp = document.getElementById("tab-auth-signup");
  const usernameRow = document.getElementById("auth-username-row");
  const modalTitle = document.getElementById("auth-modal-title");
  const modalDesc = document.getElementById("auth-modal-desc");
  const submitBtn = document.getElementById("btn-auth-submit");
  const magicRow = document.getElementById("auth-magic-row");
  const switchText = document.getElementById("auth-switch-text");
  const switchBtn = document.getElementById("btn-auth-switch-mode");
  const alertEl = document.getElementById("auth-alert");

  if (alertEl) {
    alertEl.style.display = "none";
    alertEl.textContent = "";
  }

  const isSignUp = (mode === "signup");

  if (tabSignIn) tabSignIn.classList.toggle("active", !isSignUp);
  if (tabSignUp) tabSignUp.classList.toggle("active", isSignUp);

  if (usernameRow) {
    usernameRow.style.display = isSignUp ? "flex" : "none";
  }

  if (modalTitle) {
    modalTitle.textContent = isSignUp ? "Create Your Account" : "Welcome Back";
  }

  if (modalDesc) {
    modalDesc.textContent = isSignUp
      ? "Choose a unique username to start predicting NFL games and joining leagues."
      : "Sign in to make your predictions, claim your league picks, and play with friends.";
  }

  if (submitBtn) {
    submitBtn.textContent = isSignUp ? "Create Account" : "Sign In";
  }

  if (magicRow) {
    magicRow.style.display = isSignUp ? "none" : "block";
  }

  if (switchText) {
    switchText.textContent = isSignUp ? "Already have an account?" : "Don't have an account?";
  }

  if (switchBtn) {
    switchBtn.innerHTML = isSignUp ? "Sign in here &rarr;" : "Create one here &rarr;";
  }

  if (isSignUp) {
    const usernameInput = document.getElementById("auth-username-input");
    if (usernameInput) setTimeout(() => usernameInput.focus(), 120);
  } else {
    const emailInput = document.getElementById("auth-email-input");
    if (emailInput) setTimeout(() => emailInput.focus(), 120);
  }
}

function toggleAuthMode() {
  setAuthMode(state.authMode === "signup" ? "signin" : "signup");
}

function handleAuthSubmit() {
  if (state.authMode === "signup") {
    handleEmailSignUp();
  } else {
    handleEmailSignIn();
  }
}

let usernameCheckTimeout = null;
function handleUsernameInput(val) {
  const statusIcon = document.getElementById("username-status-icon");
  const feedback = document.getElementById("username-validation-msg");
  const count = document.getElementById("username-char-count");
  const clean = (val || "").trim();

  if (count) {
    count.textContent = `${clean.length}/20 chars`;
    count.style.color = (clean.length >= 3 && clean.length <= 20) ? "var(--accent-blue)" : "var(--text-dim)";
  }

  if (!statusIcon || !feedback) return;

  if (!clean) {
    statusIcon.textContent = "";
    feedback.className = "auth-field-feedback";
    feedback.textContent = "";
    return;
  }

  if (clean.length < 3) {
    statusIcon.textContent = "⚠️";
    feedback.className = "auth-field-feedback warn";
    feedback.textContent = "Must be at least 3 characters";
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    statusIcon.textContent = "❌";
    feedback.className = "auth-field-feedback error";
    feedback.textContent = "Letters, numbers, and underscores only (no spaces)";
    return;
  }

  // Pre-check against OG League reserved names (case-insensitive)
  const ogMatch = PLAYERS.find(p => p.toLowerCase() === clean.toLowerCase());
  if (ogMatch) {
    statusIcon.textContent = "❌";
    feedback.className = "auth-field-feedback error";
    feedback.textContent = `❌ Username '${clean}' is already taken`;
    return;
  }

  statusIcon.textContent = "⏳";
  feedback.className = "auth-field-feedback";
  feedback.textContent = "Checking availability...";

  if (usernameCheckTimeout) clearTimeout(usernameCheckTimeout);
  usernameCheckTimeout = setTimeout(async () => {
    const emailInput = document.getElementById("auth-email-input");
    const email = emailInput ? emailInput.value : "";
    const check = await validateUsernameAvailability(clean, email);

    const currentInput = document.getElementById("auth-username-input");
    if (currentInput && currentInput.value.trim().toLowerCase() !== clean.toLowerCase()) return;

    if (check.valid) {
      statusIcon.textContent = "✓";
      feedback.className = "auth-field-feedback success";
      feedback.textContent = `✓ @${clean} is available!`;
    } else {
      statusIcon.textContent = "❌";
      feedback.className = "auth-field-feedback error";
      feedback.textContent = `❌ ${check.error}`;
    }
  }, 280);
}

async function validateUsernameAvailability(rawUsername, email = "") {
  const clean = (rawUsername || "").trim();

  if (!clean) {
    return { valid: false, error: "Please enter a username.", cleanUsername: "" };
  }

  if (clean.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long.", cleanUsername: clean };
  }

  if (clean.length > 20) {
    return { valid: false, error: "Username cannot exceed 20 characters.", cleanUsername: clean };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores (no spaces).", cleanUsername: clean };
  }

  const lowerClean = clean.toLowerCase();

  // Rule: OG League members' current names are reserved as their usernames moving forward
  const ogMatch = PLAYERS.find(p => p.toLowerCase() === lowerClean);
  if (ogMatch) {
    const cleanEmail = (email || "").toLowerCase().trim();
    let isAllowedOGMember = false;

    if (cleanEmail) {
      if (ogMatch === "Jon" && cleanEmail === "jonnylcolbert@gmail.com") isAllowedOGMember = true;
      else if (ogMatch === "Alisha" && cleanEmail === "alishaklezmer16@gmail.com") isAllowedOGMember = true;
      else if (ogMatch === "Carson" && cleanEmail === "thatpkboy@gmail.com") isAllowedOGMember = true;

      if (!isAllowedOGMember && supabaseClient) {
        try {
          const { data: invite } = await supabaseClient
            .from("league_roster_invites")
            .select("player_name")
            .ilike("invited_email", cleanEmail)
            .ilike("player_name", ogMatch)
            .maybeSingle();
          if (invite) isAllowedOGMember = true;
        } catch (e) {}
      }
    }

    if (!isAllowedOGMember) {
      return {
        valid: false,
        error: `Username '${clean}' is already taken. Please choose another username.`,
        cleanUsername: clean
      };
    }
  }

  // Database Uniqueness Check against Supabase public.profiles
  if (supabaseClient) {
    try {
      const { data: existing, error } = await supabaseClient
        .from("profiles")
        .select("id, username")
        .ilike("username", clean)
        .maybeSingle();

      if (!error && existing) {
        if (state.authUser && existing.id === state.authUser.id) {
          return { valid: true, cleanUsername: clean };
        }
        return {
          valid: false,
          error: `Username '${clean}' is already taken. Please choose another username.`,
          cleanUsername: clean
        };
      }
    } catch (err) {
      console.warn("Username database uniqueness query notice:", err);
    }
  }

  return { valid: true, cleanUsername: clean };
}

function openAuthModal(contextMsg = "", defaultMode = null) {
  const modal = document.getElementById("auth-modal");
  if (!modal) return;

  const alertEl = document.getElementById("auth-alert");
  if (alertEl) {
    alertEl.style.display = "none";
    alertEl.textContent = "";
  }

  let mode = defaultMode;
  if (!mode) {
    const lower = (contextMsg || "").toLowerCase();
    if (lower.includes("create") || lower.includes("sign up") || lower.includes("join") || lower.includes("get started")) {
      mode = "signup";
    } else {
      mode = "signin";
    }
  }

  setAuthMode(mode);

  const desc = document.getElementById("auth-modal-desc");
  if (desc && contextMsg && !["sign in", "create account", "get started free"].includes(contextMsg.toLowerCase())) {
    desc.textContent = contextMsg;
  }

  const usernameInput = document.getElementById("auth-username-input");
  const emailInput = document.getElementById("auth-email-input");
  const passInput = document.getElementById("auth-password-input");

  if (usernameInput) usernameInput.value = "";
  if (emailInput && !emailInput.value && state.authUser) {
    emailInput.value = state.authUser.email || "";
  }
  if (passInput) passInput.value = "";

  const statusIcon = document.getElementById("username-status-icon");
  const feedback = document.getElementById("username-validation-msg");
  if (statusIcon) statusIcon.textContent = "";
  if (feedback) { feedback.className = "auth-field-feedback"; feedback.textContent = ""; }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeAuthModal(event) {
  if (event && event.target && event.target.id !== "auth-modal" && !event.target.classList.contains("profile-modal-close") && !event.target.classList.contains("btn-auth-cancel")) {
    return;
  }
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
}

async function handleEmailSignIn() {
  initSupabaseClient();
  if (!supabaseClient) {
    showToast("⚠️ Supabase connection unavailable");
    return;
  }

  const emailInput = document.getElementById("auth-email-input");
  const passInput = document.getElementById("auth-password-input");
  const email = (emailInput && emailInput.value || "").trim().toLowerCase();
  const password = (passInput && passInput.value || "").trim();

  if (!email || !email.includes("@")) {
    setAuthAlert("Please enter a valid email address.", "error");
    if (emailInput) emailInput.focus();
    return;
  }
  if (!password) {
    setAuthAlert("Please enter your account password.", "error");
    if (passInput) passInput.focus();
    return;
  }

  const btn = document.getElementById("btn-auth-submit");
  const origText = btn ? btn.textContent : "Sign In";
  if (btn) { btn.disabled = true; btn.textContent = "Signing In..."; }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthAlert(error.message, "error");
      return;
    }
    closeAuthModal();
    showToast("🔮 Welcome back! Signed in successfully.");
    if (data && data.user) {
      await handleUserSession(data.user);
    }
    renderApp();
  } catch (err) {
    setAuthAlert(err.message || "Failed to sign in. Please try again.", "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

async function handleEmailSignUp() {
  initSupabaseClient();
  if (!supabaseClient) {
    showToast("⚠️ Supabase connection unavailable");
    return;
  }

  const usernameInput = document.getElementById("auth-username-input");
  const emailInput = document.getElementById("auth-email-input");
  const passInput = document.getElementById("auth-password-input");

  const rawUsername = (usernameInput && usernameInput.value || "").trim();
  const email = (emailInput && emailInput.value || "").trim().toLowerCase();
  const password = (passInput && passInput.value || "").trim();

  // 1. Validate Username
  const usernameCheck = await validateUsernameAvailability(rawUsername, email);
  if (!usernameCheck.valid) {
    setAuthAlert(usernameCheck.error, "error");
    if (usernameInput) usernameInput.focus();
    return;
  }

  // 2. Validate Email
  if (!email || !email.includes("@")) {
    setAuthAlert("Please enter a valid email address.", "error");
    if (emailInput) emailInput.focus();
    return;
  }

  // 3. Validate Password
  if (!password || password.length < 6) {
    setAuthAlert("Password must be at least 6 characters.", "error");
    if (passInput) passInput.focus();
    return;
  }

  const cleanUsername = usernameCheck.cleanUsername;

  const btn = document.getElementById("btn-auth-submit");
  const origText = btn ? btn.textContent : "Create Account";
  if (btn) { btn.disabled = true; btn.textContent = "Creating Account..."; }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: cleanUsername,
          full_name: cleanUsername
        }
      }
    });

    // Detect if user account already exists:
    // 1. Error message indicates existing registration
    // 2. Or Supabase returns a user with empty identities array (email enumeration prevention)
    const isAlreadyRegistered = (
      (error && /already\s+(registered|exists|in use)/i.test(error.message || "")) ||
      (data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0)
    );

    if (isAlreadyRegistered) {
      setAuthMode("signin");
      const emailInput = document.getElementById("auth-email-input");
      const passInput = document.getElementById("auth-password-input");
      if (emailInput) emailInput.value = email;
      if (passInput) {
        passInput.value = "";
        setTimeout(() => passInput.focus(), 150);
      }
      setAuthAlert("⚠️ <strong>Account Already Exists</strong><br>An account is already registered with this email. We've switched you to Sign In — enter your password to continue.", "warning");
      showToast("Account already exists. Please sign in.");
      return;
    }

    if (error) {
      setAuthAlert(error.message, "error");
      return;
    }

    try {
      localStorage.setItem("sp_user_name", cleanUsername);
    } catch (e) {}

    if (data && data.user) {
      try {
        await supabaseClient.from("profiles").upsert({
          id: data.user.id,
          username: cleanUsername,
          full_name: cleanUsername,
          favorite_team: getFavoriteTeam().code || "KC"
        }, { onConflict: "id" });
      } catch (upsertErr) {
        console.warn("Profile upsert notice:", upsertErr);
      }
    }

    if (data && data.session) {
      closeAuthModal();
      showToast(`🔮 Welcome, @${cleanUsername}! Account created.`);
      if (data.user) {
        await handleUserSession(data.user);
      }
      renderApp();
    } else {
      setAuthAlert(`✨ Account created for @${cleanUsername}! Please check your email to confirm your account, then sign in.`, "success");
      showToast("✨ Confirmation email sent! Please check your inbox.");
    }
  } catch (err) {
    setAuthAlert(err.message || "Failed to create account.", "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = origText; }
  }
}

async function handleMagicLinkSignIn() {
  initSupabaseClient();
  if (!supabaseClient) {
    showToast("⚠️ Supabase connection unavailable");
    return;
  }

  const emailInput = document.getElementById("auth-email-input");
  const email = (emailInput && emailInput.value || "").trim();

  if (!email || !email.includes("@")) {
    setAuthAlert("Please enter your email address to receive a Magic Link.", "error");
    return;
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      setAuthAlert(error.message, "error");
      return;
    }

    setAuthAlert("📬 Magic Link sent! Check your inbox to sign in instantly without a password.", "success");
    showToast("📬 Magic Link sent to your email!");
  } catch (err) {
    setAuthAlert(err.message || "Failed to send magic link.", "error");
  }
}

async function handleGoogleSignIn() {
  initSupabaseClient();
  if (!supabaseClient) {
    showToast("⚠️ Supabase connection unavailable");
    return;
  }

  try {
    const redirectUrl = window.location.origin + window.location.pathname;
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      setAuthAlert(error.message, "error");
    }
  } catch (err) {
    setAuthAlert(err.message || "Google sign in failed.", "error");
  }
}

async function handleSignOut() {
  initSupabaseClient();
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
  }

  state.authUser = null;
  state.userProfile = null;
  closeProfileModal();
  updateAppShellForMode();
  renderHeaderProfile();
  showToast("👋 Signed out of Sports Psychic.");
  renderApp();
}

function handleLobbyCodeInput(val) {
  const input = document.getElementById("lobby-quick-code-input");
  const btn = document.getElementById("btn-lobby-join-league") || document.querySelector(".btn-invite-submit");
  const feedback = document.getElementById("lobby-code-feedback");

  if (feedback) {
    feedback.textContent = "";
    feedback.style.display = "none";
    feedback.className = "lobby-code-feedback";
  }
  if (input) {
    input.classList.remove("input-error");
  }

  const clean = (val || "").trim().toUpperCase();
  const hasSix = clean.length === 6;

  if (btn) {
    if (hasSix) {
      btn.removeAttribute("disabled");
      btn.classList.remove("disabled");
      btn.setAttribute("aria-disabled", "false");
    } else {
      btn.setAttribute("disabled", "true");
      btn.classList.add("disabled");
      btn.setAttribute("aria-disabled", "true");
    }
  }
}

async function handleQuickInviteSubmit() {
  const input = document.getElementById("lobby-quick-code-input");
  const btn = document.getElementById("btn-lobby-join-league") || document.querySelector(".btn-invite-submit");
  const feedback = document.getElementById("lobby-code-feedback");
  const code = (input && input.value) ? input.value.trim().toUpperCase() : "";

  // Requirement: Button should not be accessible until 6 digits are typed
  if (!code || code.length !== 6) {
    if (btn) {
      btn.setAttribute("disabled", "true");
      btn.classList.add("disabled");
      btn.setAttribute("aria-disabled", "true");
    }
    return;
  }

  // Loading state
  if (btn) {
    btn.setAttribute("disabled", "true");
    btn.classList.add("disabled");
    btn.innerHTML = `<span>Checking...</span>`;
  }

  try {
    let matchedLeague = null;

    // 1. Check built-in OG League code
    if (code === "OG2026") {
      matchedLeague = {
        name: "OG League",
        join_code: "OG2026"
      };
    }

    // 2. Query Supabase for league matching this join code
    initSupabaseClient();
    if (!matchedLeague && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from("leagues")
          .select("id, name, join_code, scoring_format, season_year")
          .eq("join_code", code)
          .maybeSingle();

        if (data && !error && data.name) {
          matchedLeague = data;
        }
      } catch (err) {
        console.warn("Error looking up league code:", err);
      }
    }

    // If there is no league that matches the code entered
    if (!matchedLeague) {
      // Notification toast
      showToast(`⚠️ League code "${code}" does not exist.`);

      // Inline notification below the search bar
      if (feedback) {
        feedback.innerHTML = `<span>⚠️ League code "<strong>${code}</strong>" does not exist. Please check your 6-digit code and try again.</span>`;
        feedback.className = "lobby-code-feedback error";
        feedback.style.display = "flex";
      }

      // Input visual highlight with shake animation
      if (input) {
        input.classList.remove("input-error");
        void input.offsetWidth;
        input.classList.add("input-error");
        input.focus();
      }

      return;
    }

    // League found! Clear feedback
    if (feedback) {
      feedback.textContent = "";
      feedback.style.display = "none";
    }
    if (input) {
      input.classList.remove("input-error");
    }

    // Require sign-in to join league
    if (!state.authUser) {
      state.pendingJoinLeague = matchedLeague;
      showToast(`🔮 Found "${matchedLeague.name}"! Please sign in or create an account to join.`);
      openAuthModal(`Sign in to join ${matchedLeague.name}`);
      return;
    }

    // Authenticated user joins league
    if (matchedLeague.name === "OG League" || matchedLeague.join_code === "OG2026") {
      state.activeLeagueData = null;
      enterLeagueView("OG League");
      if (!state.myPlayer) {
        setTimeout(() => {
          showToast("👋 Welcome to OG League! Select your name to claim your picks:");
          openProfileModal();
        }, 500);
      } else {
        showToast("🏆 Welcome to OG League!");
      }
    } else {
      if (supabaseClient && state.authUser) {
        try {
          const { data: existingMem } = await supabaseClient
            .from("league_members")
            .select("id")
            .eq("league_id", matchedLeague.id)
            .eq("user_id", state.authUser.id)
            .maybeSingle();

          if (!existingMem) {
            await supabaseClient
              .from("league_members")
              .insert({
                league_id: matchedLeague.id,
                user_id: state.authUser.id,
                role: "member"
              });
            await loadUserLeagues();
          }
        } catch (err) {
          console.warn("Error registering league membership:", err);
        }
      }
      showToast(`🏆 Welcome to ${matchedLeague.name}!`);
      await enterCustomLeague(matchedLeague.id);
    }

    if (input) {
      input.value = "";
      handleLobbyCodeInput("");
    }
  } finally {
    if (btn) {
      btn.innerHTML = `<span>Join League</span>`;
      const cur = (input && input.value) ? input.value.trim() : "";
      if (cur.length === 6) {
        btn.removeAttribute("disabled");
        btn.classList.remove("disabled");
        btn.setAttribute("aria-disabled", "false");
      } else {
        btn.setAttribute("disabled", "true");
        btn.classList.add("disabled");
        btn.setAttribute("aria-disabled", "true");
      }
    }
  }
}

async function processLeagueCode(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) return;

  if (cleanCode.length !== 6) {
    showToast("⚠️ League codes must be 6 characters.");
    return;
  }

  let matchedLeague = null;
  if (cleanCode === "OG2026") {
    matchedLeague = { id: "e0000000-0000-0000-0000-000000000001", name: "OG League", join_code: "OG2026" };
  }

  initSupabaseClient();
  if (!matchedLeague && supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("leagues")
        .select("id, name, join_code, scoring_format, season_year, commissioner_id")
        .eq("join_code", cleanCode)
        .maybeSingle();

      if (data && !error && data.name) {
        matchedLeague = data;
      }
    } catch (e) {
      console.warn("League lookup error:", e);
    }
  }

  if (!matchedLeague) {
    showToast(`⚠️ League code "${cleanCode}" does not exist.`);
    return;
  }

  if (!state.authUser) {
    state.pendingJoinLeague = matchedLeague;
    showToast(`🔮 Found "${matchedLeague.name}"! Please sign in or create an account to join.`);
    openAuthModal(`Sign in to join ${matchedLeague.name}`);
    return;
  }

  if (matchedLeague.name === "OG League" || matchedLeague.join_code === "OG2026") {
    state.activeLeagueData = null;
    enterLeagueView("OG League");
    if (!state.myPlayer) {
      setTimeout(() => {
        showToast("👋 Welcome to OG League! Select your name to claim your picks:");
        openProfileModal();
      }, 500);
    } else {
      showToast("🏆 Welcome to OG League!");
    }
  } else {
    if (supabaseClient && state.authUser) {
      try {
        const { data: existingMem } = await supabaseClient
          .from("league_members")
          .select("id")
          .eq("league_id", matchedLeague.id)
          .eq("user_id", state.authUser.id)
          .maybeSingle();

        if (!existingMem) {
          await supabaseClient
            .from("league_members")
            .insert({
              league_id: matchedLeague.id,
              user_id: state.authUser.id,
              role: "member"
            });
          await loadUserLeagues();
        }
      } catch (err) {
        console.warn("Error registering league membership:", err);
      }
    }
    showToast(`🏆 Welcome to ${matchedLeague.name}!`);
    await enterCustomLeague(matchedLeague.id);
  }
}

function copyLeagueCode(code) {
  if (!code) return;
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`📋 Copied league code "${code}" to clipboard!`);
    }).catch(() => {
      prompt("League Invite Code (Ctrl+C to copy):", code);
    });
  } else {
    prompt("League Invite Code (Ctrl+C to copy):", code);
  }
}

function generateNewLeagueCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "SP";
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const input = document.getElementById("league-code-input");
  if (input) {
    input.value = rand;
  }
  const feedback = document.getElementById("league-code-feedback");
  if (feedback) {
    feedback.textContent = "";
    feedback.style.display = "none";
  }
  return rand;
}

function selectLeagueScoring(format) {
  state.createLeagueScoring = format;
  const prox = document.getElementById("league-scoring-proximity");
  const win = document.getElementById("league-scoring-winner");
  if (prox) prox.classList.toggle("active", format === "classic_proximity");
  if (win) win.classList.toggle("active", format === "winner_only");
}

function openCreateLeagueModal() {
  closeLeagueDrawer();
  closeAuthModal();

  if (!state.authUser) {
    showToast("🔮 Please sign in or create an account to create a league.");
    openAuthModal("Sign in to create your own custom league");
    return;
  }

  const modal = document.getElementById("create-league-modal");
  const nameInput = document.getElementById("league-name-input");
  const feedback = document.getElementById("league-code-feedback");

  if (nameInput) nameInput.value = "";
  if (feedback) {
    feedback.textContent = "";
    feedback.style.display = "none";
  }

  generateNewLeagueCode();
  selectLeagueScoring("classic_proximity");

  if (modal) {
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  if (nameInput) {
    setTimeout(() => nameInput.focus(), 100);
  }
}

function closeCreateLeagueModal(event) {
  if (event && event.target && event.target.id !== "create-league-modal") {
    return;
  }
  const modal = document.getElementById("create-league-modal");
  if (modal) {
    modal.classList.remove("open");
  }
  document.body.style.overflow = "";
}

async function handleCreateLeagueSubmit() {
  if (!state.authUser) {
    closeCreateLeagueModal();
    openAuthModal("Sign in or create an account to create your custom league");
    return;
  }

  const nameInput = document.getElementById("league-name-input");
  const codeInput = document.getElementById("league-code-input");
  const feedback = document.getElementById("league-code-feedback");
  const btn = document.getElementById("btn-submit-create-league");

  const leagueName = (nameInput?.value || "").trim();
  const joinCode = (codeInput?.value || "").trim().toUpperCase();
  const scoringFormat = state.createLeagueScoring || "classic_proximity";

  if (!leagueName || leagueName.length < 3) {
    if (feedback) {
      feedback.textContent = "Please enter a league name (at least 3 characters).";
      feedback.className = "auth-field-feedback error";
      feedback.style.display = "block";
    }
    if (nameInput) nameInput.focus();
    return;
  }

  if (!joinCode || joinCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(joinCode)) {
    if (feedback) {
      feedback.textContent = "6-digit code must be 6 letters or numbers (e.g. SP2026).";
      feedback.className = "auth-field-feedback error";
      feedback.style.display = "block";
    }
    if (codeInput) codeInput.focus();
    return;
  }

  if (feedback) {
    feedback.textContent = "";
    feedback.style.display = "none";
  }

  const origBtnText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span>Creating League...</span>`;
  }

  try {
    initSupabaseClient();
    if (!supabaseClient) throw new Error("Supabase connection unavailable.");

    // Check if code is already taken
    const { data: existing } = await supabaseClient
      .from("leagues")
      .select("id")
      .eq("join_code", joinCode)
      .maybeSingle();

    if (existing) {
      if (feedback) {
        feedback.textContent = `Code "${joinCode}" is already taken. Try randomizing another code!`;
        feedback.className = "auth-field-feedback error";
        feedback.style.display = "block";
      }
      return;
    }

    // Insert new league
    const { data: newLeague, error: leagueErr } = await supabaseClient
      .from("leagues")
      .insert({
        name: leagueName,
        join_code: joinCode,
        commissioner_id: state.authUser.id,
        scoring_format: scoringFormat,
        season_year: 2026,
        is_public: false,
        lock_type: "rolling_kickoff",
        require_scores: scoringFormat !== "winner_only"
      })
      .select()
      .single();

    if (leagueErr || !newLeague) {
      throw new Error(leagueErr?.message || "Failed to create league.");
    }

    // Insert commissioner membership
    await supabaseClient
      .from("league_members")
      .insert({
        league_id: newLeague.id,
        user_id: state.authUser.id,
        role: "commissioner"
      });

    // Refresh user leagues
    await loadUserLeagues();

    closeCreateLeagueModal();
    showToast(`🏆 League "${newLeague.name}" created! Join code: ${newLeague.join_code}`);

    // Immediately enter the newly created league!
    await enterCustomLeague(newLeague.id);

  } catch (err) {
    console.error("League creation error:", err);
    if (feedback) {
      feedback.textContent = err.message || "Failed to create league. Please try again.";
      feedback.className = "auth-field-feedback error";
      feedback.style.display = "block";
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origBtnText;
    }
  }
}

function openJoinLeagueModal() {
  closeLeagueDrawer();
  closeAuthModal();

  if (!state.authUser) {
    showToast("🔮 Please sign in or create an account to join a league.");
    openAuthModal("Sign in to join a league with your invite code");
    return;
  }

  const code = prompt("Enter 6-character League Invite Code (e.g. SP2026):");
  if (code && code.trim()) {
    processLeagueCode(code.trim());
  }
}

// ---------------------------------------------------------
// CUSTOM LEAGUE DATA & IN-LEAGUE PICKS ENGINE (OPTION A)
// ---------------------------------------------------------

async function loadUserLeagues() {
  if (!state.authUser) {
    state.userLeagues = [];
    return;
  }
  initSupabaseClient();
  if (!supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from("league_members")
      .select("league_id, role, joined_at, leagues:league_id(id, name, join_code, scoring_format, season_year, commissioner_id)")
      .eq("user_id", state.authUser.id);

    if (!error && Array.isArray(data)) {
      state.userLeagues = data
        .filter(row => row.leagues && row.leagues.name)
        .map(row => ({
          id: row.leagues.id,
          name: row.leagues.name,
          join_code: row.leagues.join_code,
          scoring_format: row.leagues.scoring_format || "classic_proximity",
          season_year: row.leagues.season_year || 2026,
          commissioner_id: row.leagues.commissioner_id,
          role: row.role || "member",
          joined_at: row.joined_at
        }));

      try {
        localStorage.setItem(`sp_user_leagues_${state.authUser.id}`, JSON.stringify(state.userLeagues));
      } catch (e) {}
    } else {
      try {
        const cached = localStorage.getItem(`sp_user_leagues_${state.authUser.id}`);
        if (cached) state.userLeagues = JSON.parse(cached);
      } catch (e) {}
    }
  } catch (e) {
    try {
      const cached = localStorage.getItem(`sp_user_leagues_${state.authUser.id}`);
      if (cached) state.userLeagues = JSON.parse(cached);
    } catch (err) {}
  }

  renderLobbyHero();
}

async function loadCustomLeagueData(leagueId) {
  initSupabaseClient();
  if (!supabaseClient) return;

  try {
    // 1. Fetch roster members with profiles
    const { data: members, error: memErr } = await supabaseClient
      .from("league_members")
      .select("id, league_id, user_id, role, total_points, season_correct, season_closest, season_exact, joined_at, profiles:user_id(id, username, full_name, avatar_url, favorite_team)")
      .eq("league_id", leagueId);

    if (!memErr && Array.isArray(members)) {
      state.customLeagueMembers = members.map(m => {
        const prof = m.profiles || {};
        const displayName = prof.full_name || prof.username || (m.role === "commissioner" ? "Commissioner" : "Member");
        return {
          id: m.id,
          userId: m.user_id,
          role: m.role || "member",
          username: prof.username || displayName,
          fullName: prof.full_name || displayName,
          displayName: displayName,
          avatarUrl: prof.avatar_url || "",
          favoriteTeam: prof.favorite_team || "",
          totalPoints: m.total_points || 0,
          seasonCorrect: m.season_correct || 0,
          seasonClosest: m.season_closest || 0,
          seasonExact: m.season_exact || 0,
          joinedAt: m.joined_at
        };
      });
    }

    // 2. Fetch all picks for this custom league
    const { data: picks, error: picksErr } = await supabaseClient
      .from("picks")
      .select("*")
      .eq("league_id", leagueId);

    if (!picksErr && Array.isArray(picks)) {
      const picksByGame = {};
      const myPicks = {};

      picks.forEach(p => {
        if (!picksByGame[p.game_id]) {
          picksByGame[p.game_id] = [];
        }
        picksByGame[p.game_id].push(p);

        if (state.authUser && p.user_id === state.authUser.id) {
          myPicks[p.game_id] = {
            winner: p.picked_winner,
            awayScore: p.predicted_away,
            homeScore: p.predicted_home,
            multiplier: Boolean(p.is_multiplier),
            points: p.points_earned,
            bonusPoints: p.bonus_points,
            isClosest: p.is_closest,
            isExact: p.is_exact
          };
        }
      });

      state.customLeaguePicks = picksByGame;
      state.myCustomLeaguePicks = myPicks;
    }

    if (state.activeTab === "matchups") {
      renderMatchups();
    } else if (state.activeTab === "leaderboard") {
      renderLeaderboard();
    }
  } catch (err) {
    console.warn("Error loading custom league data:", err);
  }
}

async function setCustomLeaguePick(gameId, winnerTeam) {
  if (!state.activeLeagueData || !state.authUser) return;
  const game = findGameById(gameId);
  if (!game || isGameLockedForPicking(game, state.currentWeek)) {
    showToast("🔒 Picks are locked for this game (kickoff passed).");
    return;
  }

  const cur = state.myCustomLeaguePicks[gameId] || {
    awayScore: 24,
    homeScore: 21,
    multiplier: false
  };

  cur.winner = winnerTeam;
  state.myCustomLeaguePicks[gameId] = cur;

  updateCustomPickBarUI(gameId);
  saveCustomLeaguePickToCloud(gameId);
}

async function stepCustomLeagueScore(gameId, side, delta) {
  if (!state.activeLeagueData || !state.authUser) return;
  const game = findGameById(gameId);
  if (!game || isGameLockedForPicking(game, state.currentWeek)) {
    showToast("🔒 Picks are locked for this game.");
    return;
  }

  const cur = state.myCustomLeaguePicks[gameId] || {
    winner: null,
    awayScore: 24,
    homeScore: 21,
    multiplier: false
  };

  if (side === "away") {
    cur.awayScore = Math.max(0, Math.min(99, (Number(cur.awayScore) || 0) + delta));
  } else {
    cur.homeScore = Math.max(0, Math.min(99, (Number(cur.homeScore) || 0) + delta));
  }

  const parts = (game.matchup || "").split("@").map(s => s.trim());
  const awayTeam = parts[0] || "AWAY";
  const homeTeam = parts[1] || "HOME";
  if (!cur.winner) {
    if (cur.awayScore > cur.homeScore) cur.winner = awayTeam;
    else if (cur.homeScore > cur.awayScore) cur.winner = homeTeam;
  }

  state.myCustomLeaguePicks[gameId] = cur;
  updateCustomPickBarUI(gameId);
  saveCustomLeaguePickToCloud(gameId);
}

async function toggleCustomLeagueMultiplier(gameId, weekNum = state.currentWeek) {
  if (!state.activeLeagueData || !state.authUser) return;
  const game = findGameById(gameId);
  if (!game || isGameLockedForPicking(game, weekNum)) {
    showToast("🔒 Multiplier locked: kickoff has passed.");
    return;
  }

  const cur = state.myCustomLeaguePicks[gameId] || {
    winner: null,
    awayScore: 24,
    homeScore: 21,
    multiplier: false
  };

  const willBeActive = !cur.multiplier;

  if (willBeActive) {
    const weekKey = `Week ${weekNum}`;
    const weekGames = (state.data && state.data.weeks && state.data.weeks[weekKey] && state.data.weeks[weekKey].games) || [];
    weekGames.forEach(g => {
      if (g.id !== gameId && state.myCustomLeaguePicks[g.id] && state.myCustomLeaguePicks[g.id].multiplier) {
        state.myCustomLeaguePicks[g.id].multiplier = false;
        updateCustomPickBarUI(g.id);
        saveCustomLeaguePickToCloud(g.id);
      }
    });
    cur.multiplier = true;
    showToast("⭐ 3X Lock of the Week activated!");
  } else {
    cur.multiplier = false;
    showToast("⭐ 3X Lock removed.");
  }

  state.myCustomLeaguePicks[gameId] = cur;
  updateCustomPickBarUI(gameId);
  saveCustomLeaguePickToCloud(gameId);
}

const customPickSaveTimers = new Map();

function saveCustomLeaguePickToCloud(gameId) {
  if (!state.activeLeagueData || !state.authUser || !supabaseClient) return;

  if (customPickSaveTimers.has(gameId)) {
    clearTimeout(customPickSaveTimers.get(gameId));
  }

  const timer = setTimeout(async () => {
    customPickSaveTimers.delete(gameId);
    const pick = state.myCustomLeaguePicks[gameId];
    if (!pick || !pick.winner) return;

    const playerName = state.myPlayer ||
      (state.userProfile && (state.userProfile.username || state.userProfile.full_name)) ||
      (state.authUser.user_metadata && state.authUser.user_metadata.username) ||
      (state.authUser.email ? state.authUser.email.split("@")[0] : "Psychic");

    try {
      const awaySc = (pick.awayScore !== null && pick.awayScore !== undefined) ? Number(pick.awayScore) : 0;
      const homeSc = (pick.homeScore !== null && pick.homeScore !== undefined) ? Number(pick.homeScore) : 0;

      const { error } = await supabaseClient
        .from("picks")
        .upsert({
          league_id: state.activeLeagueData.id,
          user_id: state.authUser.id,
          player_name: playerName,
          game_id: gameId,
          week_num: state.currentWeek,
          picked_winner: pick.winner,
          predicted_away: awaySc,
          predicted_home: homeSc,
          is_multiplier: Boolean(pick.multiplier),
          updated_at: new Date().toISOString()
        }, { onConflict: "league_id, player_name, game_id" });

      if (error) {
        console.warn("Error saving custom pick to Supabase:", error);
      } else {
        if (!state.customLeaguePicks[gameId]) {
          state.customLeaguePicks[gameId] = [];
        }
        const existingIdx = state.customLeaguePicks[gameId].findIndex(p => p.user_id === state.authUser.id);
        const record = {
          league_id: state.activeLeagueData.id,
          user_id: state.authUser.id,
          player_name: playerName,
          game_id: gameId,
          week_num: state.currentWeek,
          picked_winner: pick.winner,
          predicted_away: awaySc,
          predicted_home: homeSc,
          is_multiplier: Boolean(pick.multiplier),
          points_earned: pick.points || 0,
          bonus_points: pick.bonusPoints || 0,
          is_closest: Boolean(pick.isClosest),
          is_exact: Boolean(pick.isExact)
        };
        if (existingIdx >= 0) {
          state.customLeaguePicks[gameId][existingIdx] = record;
        } else {
          state.customLeaguePicks[gameId].push(record);
        }
      }
    } catch (e) {
      console.warn("Exception saving custom pick:", e);
    }
  }, 400);

  customPickSaveTimers.set(gameId, timer);
}

function updateCustomPickBarUI(gameId) {
  const bar = document.getElementById(`cl-pick-bar-${gameId}`);
  if (!bar) {
    renderMatchups();
    return;
  }
  const game = findGameById(gameId);
  if (!game) return;
  const parts = (game.matchup || "").split("@").map(s => s.trim());
  const awayTeam = parts[0] || "AWAY";
  const homeTeam = parts[1] || "HOME";

  const awayInfo = NFL_TEAMS[awayTeam] || NFL_TEAMS[normalizeTeamCode(awayTeam)] || { color: '#2a3b50' };
  const homeInfo = NFL_TEAMS[homeTeam] || NFL_TEAMS[normalizeTeamCode(homeTeam)] || { color: '#2a3b50' };

  const temp = document.createElement("div");
  temp.innerHTML = renderCustomLeagueMatchupSection(game, awayTeam, homeTeam, awayInfo, homeInfo);
  const newBar = temp.querySelector(`#cl-pick-bar-${gameId}`);
  if (newBar) {
    bar.innerHTML = newBar.innerHTML;
    bar.className = newBar.className;
  }
}

function renderCustomLeagueMatchupSection(game, awayTeam, homeTeam, awayInfo, homeInfo) {
  const lockStatus = getGameLockStatus(game, state.currentWeek);
  const isLocked = lockStatus.isLocked;
  const isWinnerOnly = state.activeLeagueData && state.activeLeagueData.scoring_format === "winner_only";

  const myPick = state.myCustomLeaguePicks[game.id] || {};
  const selectedWinner = (myPick.winner || "").toUpperCase().trim();
  const awaySelected = (selectedWinner === awayTeam);
  const homeSelected = (selectedWinner === homeTeam);
  const awayScore = (myPick.awayScore !== undefined && myPick.awayScore !== null) ? myPick.awayScore : 24;
  const homeScore = (myPick.homeScore !== undefined && myPick.homeScore !== null) ? myPick.homeScore : 21;
  const isMultiplier = Boolean(myPick.multiplier);

  const allGamePicks = state.customLeaguePicks[game.id] || [];
  const totalSubmitted = allGamePicks.length;
  const totalMembers = (state.customLeagueMembers && state.customLeagueMembers.length) || 1;

  let memberPicksHtml = "";
  if (isLocked) {
    const awayPicks = [];
    const homePicks = [];

    allGamePicks.forEach(p => {
      const pName = p.player_name || "Member";
      const isMe = Boolean(state.authUser && p.user_id === state.authUser.id);
      const pickWin = (p.picked_winner || "").toUpperCase().trim();
      const scoreDisplay = (!isWinnerOnly && p.predicted_away !== null && p.predicted_home !== null)
        ? `${p.predicted_away}-${p.predicted_home}`
        : "";

      let chipClass = isMe ? "is-me" : "";
      let ptsBadge = "";

      if (game.isFinal) {
        if (p.is_exact) {
          chipClass += " exact";
          ptsBadge = `<span class="chip-pts-badge pts-exact">🔮 +${p.points_earned || 50}</span>`;
        } else if (p.is_closest) {
          chipClass += " closest";
          ptsBadge = `<span class="chip-pts-badge pts-closest">🎯 +${p.points_earned || 20}</span>`;
        } else if ((p.points_earned || 0) > 0) {
          chipClass += " correct";
          ptsBadge = `<span class="chip-pts-badge pts-win">+${p.points_earned}</span>`;
        } else {
          chipClass += " wrong";
          ptsBadge = `<span class="chip-pts-badge pts-zero">0</span>`;
        }
      }

      const pData = {
        name: pName,
        isMe,
        multiplier: p.is_multiplier,
        scoreDisplay,
        chipClass: chipClass.trim(),
        ptsBadge
      };

      if (pickWin === awayTeam) awayPicks.push(pData);
      else if (pickWin === homeTeam) homePicks.push(pData);
    });

    const totalPicks = awayPicks.length + homePicks.length;
    let awayPct = 50;
    let homePct = 50;
    if (totalPicks > 0) {
      awayPct = Math.round((awayPicks.length / totalPicks) * 100);
      homePct = 100 - awayPct;
    }

    const renderChip = (p) => `
      <div class="split-pick-chip ${p.chipClass}" title="${p.name}'s prediction">
        <div class="chip-avatar-col">
          ${getUserAvatarHtml(26)}
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

    memberPicksHtml = `
      ${totalPicks > 0 ? `
        <div class="matchup-consensus-container" aria-label="Consensus: ${awayTeam} ${awayPct}%, ${homeTeam} ${homePct}%">
          <div class="consensus-header-row">
            <div class="consensus-side away">
              <span class="consensus-dot" style="background-color: ${awayInfo.color};"></span>
              <span class="consensus-team-code">${awayTeam}</span>
              <span class="consensus-pct" style="color: ${awayInfo.color};">${awayPct}%</span>
              <span class="consensus-count">(${awayPicks.length})</span>
            </div>
            <div class="consensus-side home">
              <span class="consensus-dot" style="background-color: ${homeInfo.color};"></span>
              <span class="consensus-team-code">${homeTeam}</span>
              <span class="consensus-pct" style="color: ${homeInfo.color};">${homePct}%</span>
              <span class="consensus-count">(${homePicks.length})</span>
            </div>
          </div>
          <div class="consensus-bar-track">
            <div class="consensus-bar-fill away" style="width: ${awayPct}%; background-color: ${awayInfo.color};"></div>
            <div class="consensus-bar-fill home" style="width: ${homePct}%; background-color: ${homeInfo.color};"></div>
          </div>
        </div>
      ` : ""}

      <div class="matchup-split-picks">
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
    `;
  } else {
    memberPicksHtml = `
      <div class="cl-pending-privacy-box">
        <span>🔒</span>
        <span>Member predictions reveal at kickoff. <strong>${totalSubmitted} of ${totalMembers}</strong> members locked in.</span>
      </div>
    `;
  }

  return `
    <div class="custom-league-pick-bar ${isLocked ? "is-locked" : ""}" id="cl-pick-bar-${game.id}">
      <div class="cl-pick-header">
        <div class="cl-pick-title">Your League Prediction</div>
        <span class="${isLocked ? "cl-locked-tag" : "cl-open-tag"}">${isLocked ? "🔒 Locked" : "🟢 Open for Picks"}</span>
      </div>

      <div class="cl-team-pick-btns">
        <button type="button" class="btn-cl-pick-team ${awaySelected ? "selected" : ""}"
          ${isLocked ? "disabled" : ""}
          onclick="setCustomLeaguePick('${game.id}', '${awayTeam}')">
          <span>${awaySelected ? "✓ " : ""}${awayTeam}</span>
        </button>
        <span class="cl-pick-vs">VS</span>
        <button type="button" class="btn-cl-pick-team ${homeSelected ? "selected" : ""}"
          ${isLocked ? "disabled" : ""}
          onclick="setCustomLeaguePick('${game.id}', '${homeTeam}')">
          <span>${homeSelected ? "✓ " : ""}${homeTeam}</span>
        </button>
      </div>

      ${!isWinnerOnly ? `
        <div class="cl-score-stepper-row">
          <div class="cl-score-box">
            <span class="cl-score-lbl">${awayTeam}</span>
            <button type="button" class="btn-cl-step" ${isLocked ? "disabled" : ""} onclick="stepCustomLeagueScore('${game.id}', 'away', -1)">-</button>
            <span class="cl-score-val" id="cl-score-away-${game.id}">${awayScore}</span>
            <button type="button" class="btn-cl-step" ${isLocked ? "disabled" : ""} onclick="stepCustomLeagueScore('${game.id}', 'away', 1)">+</button>
          </div>
          <span class="cl-score-divider">-</span>
          <div class="cl-score-box">
            <button type="button" class="btn-cl-step" ${isLocked ? "disabled" : ""} onclick="stepCustomLeagueScore('${game.id}', 'home', -1)">-</button>
            <span class="cl-score-val" id="cl-score-home-${game.id}">${homeScore}</span>
            <button type="button" class="btn-cl-step" ${isLocked ? "disabled" : ""} onclick="stepCustomLeagueScore('${game.id}', 'home', 1)">+</button>
            <span class="cl-score-lbl">${homeTeam}</span>
          </div>
        </div>
      ` : ""}

      <button type="button" class="btn-cl-multiplier ${isMultiplier ? "active" : ""}"
        ${isLocked ? "disabled" : ""}
        onclick="toggleCustomLeagueMultiplier('${game.id}', ${state.currentWeek})">
        <span>${isMultiplier ? "⭐ 3X LOCK OF THE WEEK ACTIVE" : "⭐ Select as 3X Lock of the Week"}</span>
      </button>
    </div>

    ${memberPicksHtml}
  `;
}

function renderCustomLeagueLeaderboard() {
  const podiumEl = document.getElementById("podium-container");
  const listEl = document.getElementById("leaderboard-list");
  const sectionTitleEl = document.getElementById("leaderboard-section-title");
  const labelWeeklyBtn = document.getElementById("label-toggle-weekly");
  const btnSeason = document.getElementById("btn-toggle-season");
  const btnWeekly = document.getElementById("btn-toggle-weekly");
  if (!podiumEl || !listEl) return;

  const isWeekly = state.leaderboardMode === "weekly";
  if (btnSeason) btnSeason.classList.toggle("active", !isWeekly);
  if (btnWeekly) btnWeekly.classList.toggle("active", isWeekly);
  if (labelWeeklyBtn) labelWeeklyBtn.textContent = `Week ${state.currentWeek} Standings`;
  if (sectionTitleEl) {
    sectionTitleEl.textContent = isWeekly
      ? `${state.activeLeagueData.name} • Week ${state.currentWeek}`
      : `${state.activeLeagueData.name} • Season Standings`;
  }

  const members = state.customLeagueMembers || [];
  const memberScores = members.map(m => {
    let pts = 0;
    let wins = 0;
    let losses = 0;
    let weekPts = 0;

    const weeksToScan = isWeekly ? [`Week ${state.currentWeek}`] : Object.keys(state.data?.weeks || {});

    weeksToScan.forEach(wkKey => {
      const gList = state.data?.weeks?.[wkKey]?.games || [];
      gList.forEach(g => {
        const gamePicks = state.customLeaguePicks[g.id] || [];
        const mPick = gamePicks.find(p => p.user_id === m.userId);
        if (mPick && g.isFinal && g.winner) {
          const isCorrect = (mPick.picked_winner === g.winner);
          if (isCorrect) wins++; else losses++;
          const mult = mPick.is_multiplier ? 3 : 1;
          let earned = (mPick.points_earned || (isCorrect ? 10 * mult : 0));
          pts += earned;
          if (wkKey === `Week ${state.currentWeek}`) {
            weekPts += earned;
          }
        }
      });
    });

    const isMe = Boolean(state.authUser && m.userId === state.authUser.id);

    return {
      id: m.id,
      userId: m.userId,
      name: m.displayName,
      role: m.role,
      isMe,
      points: pts,
      weekPts,
      rec: {
        wins,
        losses,
        label: `${wins}-${losses} W-L`
      }
    };
  });

  memberScores.sort((a, b) => b.points - a.points || b.rec.wins - a.rec.wins);

  memberScores.forEach((m, idx) => {
    if (idx > 0 && m.points === memberScores[idx - 1].points) {
      m.numericRank = memberScores[idx - 1].numericRank;
      m.rankDisplay = `T-${m.numericRank}`;
    } else {
      m.numericRank = idx + 1;
      m.rankDisplay = String(idx + 1);
    }
  });

  const rank1 = memberScores[0] || { name: "No Members Yet", points: 0, rankDisplay: "1", rec: { label: "0-0" } };
  const rank2 = memberScores[1] || { name: "-", points: 0, rankDisplay: "2", rec: { label: "0-0" } };
  const rank3 = memberScores[2] || { name: "-", points: 0, rankDisplay: "3", rec: { label: "0-0" } };

  podiumEl.innerHTML = `
    <!-- 2nd Place Pedestal -->
    <div class="podium-card rank-2 ${rank2.isMe ? "is-my-rank" : ""}">
      <div class="podium-pedestal-header">
        <div class="podium-avatar-frame frame-silver">
          ${getUserAvatarHtml(44)}
          <div class="podium-rank-badge badge-silver">2</div>
        </div>
      </div>
      <div class="podium-body">
        <div class="podium-name">${rank2.name}${rank2.isMe ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
        <div class="podium-points-wrap rank-2-pts">
          <span class="podium-pts-val">${rank2.points}</span>
          <span class="podium-pts-lbl">PTS</span>
        </div>
        <div class="podium-footer-row">
          <div class="podium-record-pill">${rank2.rec.label}</div>
        </div>
      </div>
      <div class="podium-base-pedestal base-silver">
        <span class="pedestal-rank-num">2ND</span>
      </div>
    </div>

    <!-- 1st Place Pedestal -->
    <div class="podium-card rank-1 ${rank1.isMe ? "is-my-rank" : ""}">
      <div class="podium-pedestal-header">
        <div class="podium-avatar-frame frame-gold">
          ${getUserAvatarHtml(56)}
          <div class="podium-rank-badge badge-gold">1</div>
        </div>
      </div>
      <div class="podium-body">
        <div class="podium-name">${rank1.name}${rank1.isMe ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
        <div class="podium-points-wrap rank-1-pts">
          <span class="podium-pts-val">${rank1.points}</span>
          <span class="podium-pts-lbl">PTS</span>
        </div>
        <div class="podium-footer-row">
          <div class="podium-record-pill">${rank1.rec.label}</div>
        </div>
      </div>
      <div class="podium-base-pedestal base-gold">
        <span class="pedestal-rank-num">1ST</span>
      </div>
    </div>

    <!-- 3rd Place Pedestal -->
    <div class="podium-card rank-3 ${rank3.isMe ? "is-my-rank" : ""}">
      <div class="podium-pedestal-header">
        <div class="podium-avatar-frame frame-bronze">
          ${getUserAvatarHtml(42)}
          <div class="podium-rank-badge badge-bronze">3</div>
        </div>
      </div>
      <div class="podium-body">
        <div class="podium-name">${rank3.name}${rank3.isMe ? ` <span class="podium-you-pill">YOU</span>` : ""}</div>
        <div class="podium-points-wrap rank-3-pts">
          <span class="podium-pts-val">${rank3.points}</span>
          <span class="podium-pts-lbl">PTS</span>
        </div>
        <div class="podium-footer-row">
          <div class="podium-record-pill">${rank3.rec.label}</div>
        </div>
      </div>
      <div class="podium-base-pedestal base-bronze">
        <span class="pedestal-rank-num">3RD</span>
      </div>
    </div>
  `;

  listEl.innerHTML = memberScores.map(m => {
    let rankBadgeClass = "";
    if (m.numericRank === 1) rankBadgeClass = "top1";
    else if (m.numericRank === 2) rankBadgeClass = "top2";
    else if (m.numericRank === 3) rankBadgeClass = "top3";

    return `
      <div class="leaderboard-row ${m.isMe ? "is-my-row" : ""}">
        <div class="leader-left">
          <div class="rank-badge ${rankBadgeClass}">${m.rankDisplay}</div>
          <div class="leader-avatar-wrap">
            ${getUserAvatarHtml(38)}
          </div>
          <div class="leader-name-col">
            <div class="leader-name-row">
              <span class="leader-player-name">${m.name}</span>
              ${m.isMe ? `<span class="you-badge">YOU</span>` : ""}
              ${m.role === "commissioner" ? `<span class="league-role-tag commissioner">COMMISH</span>` : ""}
            </div>
            <div class="leader-rec-sub">${m.rec.label}</div>
          </div>
        </div>
        <div class="leader-right">
          <div class="leader-points-wrap pts-season">
            <span class="leader-pts-val">${m.points}</span>
            <span class="leader-pts-lbl">PTS</span>
          </div>
          ${!isWeekly ? `<div class="leader-sub-pill pill-emerald">+${m.weekPts} Wk ${state.currentWeek}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

// Global window bindings for inline HTML handlers
window.openLeagueDrawer = openLeagueDrawer;
window.closeLeagueDrawer = closeLeagueDrawer;
window.selectLeague = selectLeague;
window.enterLeagueView = enterLeagueView;
window.enterCustomLeague = enterCustomLeague;
window.exitToLobby = exitToLobby;
window.handleBrandClick = handleBrandClick;
window.updateAppShellForMode = updateAppShellForMode;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleEmailSignIn = handleEmailSignIn;
window.handleEmailSignUp = handleEmailSignUp;
window.handleMagicLinkSignIn = handleMagicLinkSignIn;
window.handleGoogleSignIn = handleGoogleSignIn;
window.handleSignOut = handleSignOut;
window.processLeagueCode = processLeagueCode;
window.copyLeagueCode = copyLeagueCode;
window.handleQuickInviteSubmit = handleQuickInviteSubmit;
window.handleLobbyCodeInput = handleLobbyCodeInput;
window.openCreateLeagueModal = openCreateLeagueModal;
window.closeCreateLeagueModal = closeCreateLeagueModal;
window.generateNewLeagueCode = generateNewLeagueCode;
window.selectLeagueScoring = selectLeagueScoring;
window.handleCreateLeagueSubmit = handleCreateLeagueSubmit;
window.openJoinLeagueModal = openJoinLeagueModal;
window.syncLeagueStandingsFromCloud = syncLeagueStandingsFromCloud;
window.renderLeagueDrawerContent = renderLeagueDrawerContent;
window.renderLobbyHero = renderLobbyHero;
window.handleHubLeagueClick = handleHubLeagueClick;
window.handleHubSoloClick = handleHubSoloClick;
window.renderAccountProfileModal = renderAccountProfileModal;
window.isUserInOGLeague = isUserInOGLeague;
window.getUserAvatarHtml = getUserAvatarHtml;
window.openTeamPicker = openTeamPicker;
window.closeTeamPicker = closeTeamPicker;
window.setFavoriteTeam = setFavoriteTeam;
window.renderTeamPickerGrid = renderTeamPickerGrid;
window.filterTeamPickerList = filterTeamPickerList;
window.getFavoriteTeam = getFavoriteTeam;
window.getNFLTeamCurrentRecord = getNFLTeamCurrentRecord;
window.setAuthMode = setAuthMode;
window.toggleAuthMode = toggleAuthMode;
window.handleAuthSubmit = handleAuthSubmit;
window.handleUsernameInput = handleUsernameInput;
window.validateUsernameAvailability = validateUsernameAvailability;
window.enterSoloPlay = enterSoloPlay;
window.renderSoloView = renderSoloView;
window.loadSoloPickSheets = loadSoloPickSheets;
window.saveSoloPickSheet = saveSoloPickSheet;
window.openCreateSheetModal = openCreateSheetModal;
window.closeCreateSheetModal = closeCreateSheetModal;
window.selectSheetFormat = selectSheetFormat;
window.handleCreateSheetSubmit = handleCreateSheetSubmit;
window.openPickSheet = openPickSheet;
window.closePickSheetEditor = closePickSheetEditor;
window.selectSoloSheetWeek = selectSoloSheetWeek;
window.renderSoloSheetEditor = renderSoloSheetEditor;
window.setSoloPickWinner = setSoloPickWinner;
window.stepSoloPickScore = stepSoloPickScore;
window.handleSoloScoreInput = handleSoloScoreInput;
window.toggleSoloPickMultiplier = toggleSoloPickMultiplier;
window.isGameLockedForPicking = isGameLockedForPicking;
window.getGameLockStatus = getGameLockStatus;
window.deleteSoloSheet = deleteSoloSheet;
window.loadUserLeagues = loadUserLeagues;
window.loadCustomLeagueData = loadCustomLeagueData;
window.setCustomLeaguePick = setCustomLeaguePick;
window.stepCustomLeagueScore = stepCustomLeagueScore;
window.toggleCustomLeagueMultiplier = toggleCustomLeagueMultiplier;
window.saveCustomLeaguePickToCloud = saveCustomLeaguePickToCloud;
window.updateCustomPickBarUI = updateCustomPickBarUI;
window.renderCustomLeagueMatchupSection = renderCustomLeagueMatchupSection;
window.renderCustomLeagueLeaderboard = renderCustomLeagueLeaderboard;



