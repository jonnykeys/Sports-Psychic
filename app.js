/**
 * OG LEAGUE LIVE - Standalone View-Only Mobile Engine
 * Real-time sync with Google Sheets, mobile navigation, week switching,
 * player scorecards, and live standings.
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

// 12 Players in exact spreadsheet column sequence (Jon at Col 6 / 0-indexed)
const PLAYERS = [
  "Jon", "Alisha", "Carson", "Nok", "Mango", "Caleb",
  "Ross", "Dishman", "Ethan", "Brett", "Wells", "Rob"
];

const PLAYER_COLORS = {
  "Jon": "#2979ff",
  "Alisha": "#e91e63",
  "Carson": "#00e676",
  "Nok": "#ff9100",
  "Mango": "#ffab00",
  "Caleb": "#ffd600",
  "Ross": "#00b0ff",
  "Dishman": "#00e5ff",
  "Ethan": "#76ff03",
  "Brett": "#d500f9",
  "Wells": "#651fff",
  "Rob": "#f50057"
};

// =========================================================
// APPLICATION STATE
// =========================================================
let state = {
  currentWeek: 3,
  selectedPlayer: "Caleb",
  activeTab: "leaderboard",
  isSyncing: false,
  lastUpdated: null,
  data: null,
  nflStandings: null
};

// =========================================================
// INITIALIZATION
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  initData();
  setupNavigation();
  setupWeekStrip();
  setupRefresh();
  renderApp();
  
  // Background live sync
  syncWeek(state.currentWeek);
  syncNFLStandings();

  // Auto-sync every 90 seconds
  setInterval(() => {
    if (!document.hidden && !state.isSyncing) {
      syncWeek(state.currentWeek, true);
    }
  }, 90000);
});

/**
 * Initialize data from local storage or baseline data.js
 */
function initData() {
  const cached = localStorage.getItem("og_league_cache");
  if (cached) {
    try {
      state.data = JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse error", e);
    }
  }

  if (!state.data && typeof OG_LEAGUE_INITIAL_DATA !== "undefined") {
    state.data = OG_LEAGUE_INITIAL_DATA;
  }

  if (state.data && state.data.activeWeek) {
    const num = parseInt(state.data.activeWeek.replace(/[^0-9]/g, ""), 10);
    if (num && num >= 1 && num <= 18) {
      state.currentWeek = num;
    }
  }

  // Pre-seed default top player
  if (state.data && state.data.leaderboard && state.data.leaderboard.length > 0) {
    state.selectedPlayer = state.data.leaderboard[0].name;
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
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  
  // Update nav buttons
  document.querySelectorAll(".bottom-nav .nav-item").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-tab") === tabId);
  });

  // Update tab views
  document.querySelectorAll(".tab-view").forEach(view => {
    view.classList.toggle("active", view.id === `tab-${tabId}`);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
  renderTabContent();
}

function setupWeekStrip() {
  const strip = document.getElementById("week-strip-scroll");
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

  prevBtn.addEventListener("click", () => {
    if (state.currentWeek > 1) {
      selectWeek(state.currentWeek - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    if (state.currentWeek < 18) {
      selectWeek(state.currentWeek + 1);
    }
  });

  updateStripButtons();
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

  // Sync this week's live data if not yet fetched or stale
  syncWeek(weekNum);
}

function setupRefresh() {
  const refreshBtn = document.getElementById("btn-refresh");
  refreshBtn.addEventListener("click", () => {
    showToast("Syncing with Google Sheets...");
    syncWeek(state.currentWeek, false, true);
    syncNFLStandings(true);
  });
}

// =========================================================
// GOOGLE SHEETS LIVE DATA SYNC
// =========================================================
async function syncWeek(weekNum, silent = false, forceNotice = false) {
  const gid = WEEK_GIDS[weekNum];
  if (!gid) return;

  const refreshBtn = document.getElementById("btn-refresh");
  const syncLabel = document.getElementById("sync-label");

  if (!silent) {
    refreshBtn.classList.add("spinning");
    syncLabel.textContent = "Syncing...";
  }

  state.isSyncing = true;
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}&t=${Date.now()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    
    parseWeekCSV(weekNum, csvText);

    state.lastUpdated = new Date();
    syncLabel.textContent = "Live";
    
    // Save state cache
    localStorage.setItem("og_league_cache", JSON.stringify(state.data));

    renderTabContent();

    if (forceNotice) {
      showToast(`Synced Week ${weekNum} successfully!`);
    }
  } catch (err) {
    console.warn("Live sync error (offline or network restricted):", err);
    syncLabel.textContent = "Offline";
    if (forceNotice) {
      showToast("Using local cached scores");
    }
  } finally {
    state.isSyncing = false;
    refreshBtn.classList.remove("spinning");
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

  const games = [];

  // Rows 1 to 16 are the 16 NFL Games
  for (let r = 1; r <= 16; r++) {
    const row = rows[r];
    if (!row || row.length < 6) continue;

    const dateTime = (row[0] || "").trim();
    const matchup = (row[1] || "").trim();
    if (!matchup) continue;

    const winner = (row[2] || "").trim().toUpperCase();
    const awayScore = row[4] !== "" && !isNaN(row[4]) ? parseInt(row[4], 10) : null;
    const homeScore = row[5] !== "" && !isNaN(row[5]) ? parseInt(row[5], 10) : null;
    const isFinal = (winner.length > 0 && awayScore !== null && homeScore !== null);

    const picks = {};

    // 12 players starting at col 6, step 5
    for (let p = 0; p < PLAYERS.length; p++) {
      const pName = PLAYERS[p];
      const colBase = 6 + p * 5;

      const pickWinner = (row[colBase] || "").trim().toUpperCase();
      const pickAway = row[colBase + 2] !== "" && !isNaN(row[colBase + 2]) ? parseInt(row[colBase + 2], 10) : null;
      const pickHome = row[colBase + 3] !== "" && !isNaN(row[colBase + 3]) ? parseInt(row[colBase + 3], 10) : null;
      const multiplier = (row[colBase + 4] || "").trim().toUpperCase() === "TRUE";

      let points = 0;
      let exact = false;

      if (isFinal && pickWinner) {
        if (pickWinner === winner) {
          if (pickAway !== null && pickHome !== null && pickAway === awayScore && pickHome === homeScore) {
            exact = true;
            points = 50;
          } else {
            points = 10;
          }

          if (multiplier) {
            points *= 3;
          }
        }
      }

      picks[pName] = {
        winner: pickWinner,
        awayScore: pickAway,
        homeScore: pickHome,
        multiplier,
        points,
        exact
      };
    }

    games.push({
      id: `${weekKey}_g${r}`,
      dateTime,
      matchup,
      winner,
      awayScore,
      homeScore,
      isFinal,
      picks
    });
  }

  // Parse season leaderboard from rows 23-34
  const leaderboard = [];
  for (let r = 22; r <= 35; r++) {
    const row = rows[r];
    if (!row) continue;
    const rankStr = (row[2] || "").trim();
    const nameStr = (row[3] || "").trim();
    const ptsStr = (row[4] || "").trim();

    if (nameStr && ptsStr && !isNaN(ptsStr)) {
      leaderboard.push({
        rank: parseInt(rankStr, 10) || leaderboard.length + 1,
        name: nameStr,
        points: parseInt(ptsStr, 10)
      });
    }
  }

  // Parse Player weekly stats from rows 17-21 if present
  const playerStats = {};
  if (rows.length > 21) {
    const pointsRow = rows[18];
    const correctRow = rows[19];
    const recordRow = rows[22];

    for (let p = 0; p < PLAYERS.length; p++) {
      const pName = PLAYERS[p];
      // Search matching column for this player in row 17
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
  if (leaderboard.length > 0) {
    state.data.leaderboard = leaderboard;
  }
}

function parseNFLStandingsCSV(csvText) {
  const rows = parseCSV(csvText);
  if (!rows || rows.length < 8) return;

  const afcPlayoffs = [];
  const nfcPlayoffs = [];

  for (let r = 1; r <= 7; r++) {
    const row = rows[r];
    if (!row) continue;
    if (row[0] && row[1]) {
      afcPlayoffs.push({ seed: row[0].trim(), team: row[1].trim() });
    }
    if (row[5] && row[6]) {
      nfcPlayoffs.push({ seed: row[5].trim(), team: row[6].trim() });
    }
  }

  state.nflStandings = {
    afcPlayoffs,
    nfcPlayoffs,
    rawText: rows[0] ? rows[0][1] : ""
  };
}

// =========================================================
// RENDERING MAIN APP
// =========================================================
function renderApp() {
  renderLeaderboard();
  renderMatchups();
  renderPlayers();
  renderNFLStandings();
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
      // Static rules
      break;
  }
}

// =========================================================
// TAB 1: LEADERBOARD RENDERING
// =========================================================
function renderLeaderboard() {
  const podiumEl = document.getElementById("podium-container");
  const listEl = document.getElementById("leaderboard-list");
  if (!podiumEl || !listEl) return;

  const lb = (state.data && state.data.leaderboard && state.data.leaderboard.length > 0)
    ? state.data.leaderboard
    : PLAYERS.map((p, idx) => ({ rank: idx + 1, name: p, points: 0 }));

  // Sort by rank ascending
  const sorted = [...lb].sort((a, b) => a.rank - b.rank);

  // Top 3 Podium
  const rank1 = sorted[0] || { name: "-", points: 0 };
  const rank2 = sorted[1] || { name: "-", points: 0 };
  const rank3 = sorted[2] || { name: "-", points: 0 };

  podiumEl.innerHTML = `
    <!-- 2nd Place -->
    <div class="podium-card" onclick="openPlayer('${rank2.name}')">
      <div class="podium-medal">🥈</div>
      <div class="podium-name">${rank2.name}</div>
      <div class="podium-points">${rank2.points} <span style="font-size:0.7rem; font-weight:700;">PTS</span></div>
      <div class="podium-sub">Rank #2</div>
    </div>

    <!-- 1st Place (Center Crown) -->
    <div class="podium-card first" onclick="openPlayer('${rank1.name}')">
      <div class="podium-medal">👑</div>
      <div class="podium-name" style="font-size:1.1rem; color:#fff;">${rank1.name}</div>
      <div class="podium-points" style="font-size:1.4rem;">${rank1.points} <span style="font-size:0.75rem; font-weight:700;">PTS</span></div>
      <div class="podium-sub" style="color:var(--accent-gold); font-weight:800;">LEAGUE LEADER</div>
    </div>

    <!-- 3rd Place -->
    <div class="podium-card" onclick="openPlayer('${rank3.name}')">
      <div class="podium-medal">🥉</div>
      <div class="podium-name">${rank3.name}</div>
      <div class="podium-points">${rank3.points} <span style="font-size:0.7rem; font-weight:700;">PTS</span></div>
      <div class="podium-sub">Rank #3</div>
    </div>
  `;

  // Full Leaderboard Rows (1 to 12)
  listEl.innerHTML = sorted.map((player) => {
    let rankBadgeClass = "";
    if (player.rank === 1) rankBadgeClass = "top1";
    else if (player.rank === 2) rankBadgeClass = "top2";
    else if (player.rank === 3) rankBadgeClass = "top3";

    const initial = player.name.charAt(0);
    const color = PLAYER_COLORS[player.name] || "var(--accent-blue)";

    // Calculate weekly pts if available
    const weekKey = `Week ${state.currentWeek}`;
    let weekPts = null;
    if (state.data && state.data.weeks && state.data.weeks[weekKey] && state.data.weeks[weekKey].games) {
      const gList = state.data.weeks[weekKey].games;
      weekPts = gList.reduce((sum, g) => {
        const pk = g.picks && g.picks[player.name];
        return sum + (pk ? (pk.points || 0) : 0);
      }, 0);
    }

    return `
      <div class="leader-row" onclick="openPlayer('${player.name}')">
        <div class="leader-left">
          <div class="rank-badge ${rankBadgeClass}">${player.rank}</div>
          <div class="player-avatar" style="background: linear-gradient(135deg, ${color} 0%, #182337 100%);">
            ${initial}
          </div>
          <div class="player-info-block">
            <div class="player-title">${player.name}</div>
            <div class="player-sub">OG League Contender</div>
          </div>
        </div>
        <div class="leader-right">
          <div class="leader-total-points">${player.points} <span style="font-size:0.7rem;">PTS</span></div>
          ${weekPts !== null ? `<div class="leader-week-pts">Wk ${state.currentWeek}: +${weekPts} pts</div>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

// =========================================================
// TAB 2: MATCHUPS & PICKS RENDERING
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

  const finalsCount = games.filter(g => g.isFinal).length;
  bannerStat.textContent = `${games.length} Games • ${finalsCount} Final`;

  container.innerHTML = games.map((game, idx) => {
    const parts = (game.matchup || "").split("@").map(s => s.trim());
    const awayTeam = parts[0] || "AWAY";
    const homeTeam = parts[1] || "HOME";

    const isFinal = game.isFinal;
    const badgeText = isFinal ? "FINAL" : (game.awayScore !== null ? "LIVE" : "SCHEDULED");
    const badgeClass = isFinal ? "final" : (game.awayScore !== null ? "live" : "scheduled");

    const awayWinning = isFinal && game.winner === awayTeam;
    const homeWinning = isFinal && game.winner === homeTeam;

    // Build Picks Chips
    const chipsHtml = PLAYERS.map(pName => {
      const pick = game.picks ? game.picks[pName] : null;
      if (!pick || !pick.winner) {
        return `
          <div class="pick-chip wrong">
            <div class="chip-top">
              <span class="chip-player">${pName}</span>
            </div>
            <div class="chip-pick-line">
              <span>No Pick</span>
            </div>
          </div>
        `;
      }

      let chipStatusClass = "";
      if (isFinal) {
        if (pick.exact) chipStatusClass = "exact";
        else if (pick.points > 0) chipStatusClass = "correct";
        else chipStatusClass = "wrong";
      }

      const scoreDisplay = (pick.awayScore !== null && pick.homeScore !== null)
        ? `${pick.awayScore}-${pick.homeScore}`
        : "";

      return `
        <div class="pick-chip ${chipStatusClass}">
          <div class="chip-top">
            <span class="chip-player">${pName}</span>
            ${pick.multiplier ? `<span class="chip-mult">⭐ 3X</span>` : ""}
          </div>
          <div class="chip-pick-line">
            <span style="font-weight:700; color:#fff;">${pick.winner} ${scoreDisplay}</span>
            ${isFinal ? `<span class="chip-points ${pick.points === 0 ? "zero" : ""}">${pick.points > 0 ? `+${pick.points}` : "0"}</span>` : ""}
          </div>
        </div>
      `;
    }).join("");

    return `
      <article class="matchup-card" id="${game.id}">
        <div class="matchup-card-header">
          <span class="date-time">${game.dateTime || `Game ${idx + 1}`}</span>
          <span class="matchup-badge ${badgeClass}">${badgeText}</span>
        </div>

        <div class="matchup-teams-display">
          <!-- Away Team -->
          <div class="team-box away">
            <span class="team-pill">${awayTeam}</span>
            <div class="team-details">
              <div class="team-code">${awayTeam}</div>
            </div>
            <div class="team-score ${awayWinning ? "winning" : ""}">${game.awayScore !== null ? game.awayScore : "-"}</div>
          </div>

          <!-- Center VS -->
          <div class="matchup-center">
            <span class="vs-tag">@</span>
          </div>

          <!-- Home Team -->
          <div class="team-box home">
            <span class="team-pill">${homeTeam}</span>
            <div class="team-details">
              <div class="team-code">${homeTeam}</div>
            </div>
            <div class="team-score ${homeWinning ? "winning" : ""}">${game.homeScore !== null ? game.homeScore : "-"}</div>
          </div>
        </div>

        <!-- Picks Breakdown -->
        <div class="picks-breakdown-section">
          <div class="picks-breakdown-title">
            <span>League Picks (${PLAYERS.length})</span>
            <span style="font-size:0.68rem; color:var(--accent-gold);">⭐ = Multiplier</span>
          </div>
          <div class="picks-chips-grid">
            ${chipsHtml}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// =========================================================
// TAB 3: PLAYER ROSTERS RENDERING
// =========================================================
function renderPlayers() {
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
    return `
      <button class="player-filter-pill ${isActive ? "active" : ""}" onclick="openPlayer('${pName}')">
        ${pName}
      </button>
    `;
  }).join("");

  // Get Player Standings & Stats
  const lb = (state.data && state.data.leaderboard) ? state.data.leaderboard : [];
  const playerRankObj = lb.find(p => p.name === state.selectedPlayer) || { rank: "-", points: 0 };

  const weekData = state.data && state.data.weeks ? state.data.weeks[weekKey] : null;
  const games = weekData && weekData.games ? weekData.games : [];

  let weekPts = 0;
  let correctCount = 0;
  let multiplierGame = null;

  games.forEach(g => {
    const pk = g.picks ? g.picks[state.selectedPlayer] : null;
    if (pk) {
      weekPts += pk.points || 0;
      if (pk.points > 0) correctCount++;
      if (pk.multiplier) multiplierGame = g;
    }
  });

  const pColor = PLAYER_COLORS[state.selectedPlayer] || "var(--accent-blue)";

  // Render Player Hero
  heroContainer.innerHTML = `
    <div class="player-hero-header">
      <div style="display:flex; align-items:center; gap:12px;">
        <div class="player-avatar" style="width:44px; height:44px; font-size:1.1rem; background:linear-gradient(135deg, ${pColor} 0%, #131b2a 100%);">
          ${state.selectedPlayer.charAt(0)}
        </div>
        <div>
          <div class="player-hero-title">${state.selectedPlayer}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">OG League Season Tracker</div>
        </div>
      </div>
      <div class="player-hero-rank">Rank #${playerRankObj.rank}</div>
    </div>

    <div class="player-stats-row">
      <div class="pstat-box">
        <div class="pstat-val" style="color:var(--accent-gold);">${playerRankObj.points}</div>
        <div class="pstat-lbl">Season Pts</div>
      </div>
      <div class="pstat-box">
        <div class="pstat-val">+${weekPts}</div>
        <div class="pstat-lbl">${weekKey} Pts</div>
      </div>
      <div class="pstat-box">
        <div class="pstat-val" style="color:var(--accent-blue);">${correctCount} / ${games.length}</div>
        <div class="pstat-lbl">Correct Picks</div>
      </div>
    </div>
  `;

  // Render Weekly Picks List
  if (games.length === 0) {
    picksContainer.innerHTML = `<div class="loading-box"><p>No picks recorded for ${weekKey}</p></div>`;
    return;
  }

  picksContainer.innerHTML = `
    <table class="player-picks-table">
      <thead>
        <tr>
          <th>Matchup</th>
          <th>Pick</th>
          <th>Score</th>
          <th>Result</th>
          <th style="text-align:right;">Pts</th>
        </tr>
      </thead>
      <tbody>
        ${games.map(g => {
          const pk = g.picks ? g.picks[state.selectedPlayer] : null;
          if (!pk || !pk.winner) {
            return `
              <tr>
                <td><strong>${g.matchup}</strong></td>
                <td colspan="4" style="color:var(--text-dim);">No pick submitted</td>
              </tr>
            `;
          }

          const isFinal = g.isFinal;
          let resText = "Pending";
          let ptsColor = "var(--text-dim)";

          if (isFinal) {
            if (pk.exact) {
              resText = "🎯 EXACT";
              ptsColor = "var(--accent-gold)";
            } else if (pk.points > 0) {
              resText = "✅ WON";
              ptsColor = "var(--accent-green)";
            } else {
              resText = "❌ LOST";
              ptsColor = "var(--text-dim)";
            }
          }

          return `
            <tr>
              <td>
                <div style="font-weight:800; color:#fff;">${g.matchup}</div>
                <div style="font-size:0.68rem; color:var(--text-dim);">${g.dateTime}</div>
              </td>
              <td>
                <div style="font-weight:900; color:#fff;">${pk.winner}</div>
                ${pk.multiplier ? `<span class="chip-mult" style="font-size:0.62rem;">⭐ 3X</span>` : ""}
              </td>
              <td style="color:var(--text-muted); font-weight:700;">
                ${pk.awayScore !== null ? `${pk.awayScore}-${pk.homeScore}` : "-"}
              </td>
              <td>
                <span style="font-size:0.75rem; font-weight:800;">${resText}</span>
                ${isFinal ? `<div style="font-size:0.68rem; color:var(--text-dim);">Actual: ${g.awayScore}-${g.homeScore}</div>` : ""}
              </td>
              <td style="text-align:right; font-weight:900; font-size:1rem; color:${ptsColor};">
                ${pk.points > 0 ? `+${pk.points}` : "0"}
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
}

function openPlayer(playerName) {
  state.selectedPlayer = playerName;
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
// TAB 4: NFL STANDINGS RENDERING
// =========================================================
function renderNFLStandings() {
  const playoffContainer = document.getElementById("nfl-playoff-container");
  const divisionsContainer = document.getElementById("nfl-divisions-container");
  if (!playoffContainer || !divisionsContainer) return;

  const data = state.nflStandings || {
    afcPlayoffs: [
      { seed: "1", team: "KC" },
      { seed: "2", team: "BUF" },
      { seed: "3", team: "PIT" },
      { seed: "4", team: "JAX" },
      { seed: "5", team: "LV" },
      { seed: "6", team: "BAL" },
      { seed: "7", team: "CIN" }
    ],
    nfcPlayoffs: [
      { seed: "1", team: "SF" },
      { seed: "2", team: "MIN" },
      { seed: "3", team: "PHI" },
      { seed: "4", team: "CAR" },
      { seed: "5", team: "DET" },
      { seed: "6", team: "SEA" },
      { seed: "7", team: "NYG" }
    ]
  };

  playoffContainer.innerHTML = `
    <!-- AFC Conference -->
    <div class="conference-card">
      <div class="conference-title afc">
        <span>AFC Seeds</span>
        <span style="font-size:0.7rem;">7 In</span>
      </div>
      <div class="playoff-seed-list">
        ${data.afcPlayoffs.map(s => `
          <div class="seed-row">
            <div class="seed-left">
              <span class="seed-num">#${s.seed}</span>
              <span class="seed-team">${s.team}</span>
            </div>
            <span class="seed-tag ${s.seed === "1" ? "bye" : ""}">${s.seed === "1" ? "BYE" : "WILD CARD"}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- NFC Conference -->
    <div class="conference-card">
      <div class="conference-title nfc">
        <span>NFC Seeds</span>
        <span style="font-size:0.7rem;">7 In</span>
      </div>
      <div class="playoff-seed-list">
        ${data.nfcPlayoffs.map(s => `
          <div class="seed-row">
            <div class="seed-left">
              <span class="seed-num">#${s.seed}</span>
              <span class="seed-team">${s.team}</span>
            </div>
            <span class="seed-tag ${s.seed === "1" ? "bye" : ""}">${s.seed === "1" ? "BYE" : "WILD CARD"}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // Standard NFL Divisions
  const divisions = [
    { name: "AFC West", teams: [ { t: "KC", w: 3, l: 0 }, { t: "LV", w: 3, l: 0 }, { t: "DEN", w: 2, l: 1 }, { t: "LAC", w: 0, l: 3 } ] },
    { name: "AFC East", teams: [ { t: "BUF", w: 3, l: 0 }, { t: "NYJ", w: 1, l: 2 }, { t: "NE", w: 1, l: 2 }, { t: "MIA", w: 0, l: 3 } ] },
    { name: "AFC North", teams: [ { t: "BAL", w: 2, l: 1 }, { t: "CLE", w: 2, l: 1 }, { t: "PIT", w: 2, l: 1 }, { t: "CIN", w: 2, l: 1 } ] },
    { name: "AFC South", teams: [ { t: "JAX", w: 2, l: 1 }, { t: "IND", w: 1, l: 2 }, { t: "HOU", w: 0, l: 3 }, { t: "TEN", w: 0, l: 3 } ] },
    { name: "NFC West", teams: [ { t: "SF", w: 3, l: 0 }, { t: "SEA", w: 2, l: 1 }, { t: "LAR", w: 1, l: 2 }, { t: "AZ", w: 1, l: 2 } ] },
    { name: "NFC East", teams: [ { t: "PHI", w: 2, l: 0 }, { t: "NYG", w: 2, l: 1 }, { t: "DAL", w: 1, l: 2 }, { t: "WSH", w: 1, l: 2 } ] },
    { name: "NFC North", teams: [ { t: "MIN", w: 3, l: 0 }, { t: "DET", w: 2, l: 1 }, { t: "CHI", w: 1, l: 1 }, { t: "GB", w: 1, l: 2 } ] },
    { name: "NFC South", teams: [ { t: "NO", w: 1, l: 2 }, { t: "ATL", w: 1, l: 2 }, { t: "CAR", w: 1, l: 2 }, { t: "TB", w: 0, l: 3 } ] }
  ];

  divisionsContainer.innerHTML = divisions.map(div => `
    <div class="division-card">
      <div class="division-header">
        <span>${div.name}</span>
        <span style="font-size:0.7rem; color:var(--text-muted);">W-L</span>
      </div>
      <table class="division-table">
        <tbody>
          ${div.teams.map(tm => `
            <tr>
              <td><strong style="color:#fff;">${tm.t}</strong></td>
              <td style="text-align:right; font-weight:800; color:var(--accent-green);">${tm.w} - ${tm.l}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `).join("");
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

// Global window exposure for inline onclick handlers
window.openPlayer = openPlayer;
