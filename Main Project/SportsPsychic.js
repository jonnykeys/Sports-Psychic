/**
 * Sports Psychic - Clean Multi-Sport Platform Engine with Account Authentication
 * Accounts, guest browsing, prediction gate, and live scoring.
 */

// Global Application State
const AppState = {
  currentTab: 'home',
  currentWeek: 1,
  currentUser: null, // Null when guest/logged out, or user object when authenticated
  accounts: JSON.parse(localStorage.getItem('sp_accounts') || '{}'),
  playMode: localStorage.getItem('sp_mode') || 'solo', // 'solo' or 'league'
  activeLeagueId: localStorage.getItem('sp_active_league') || null,
  leagues: JSON.parse(localStorage.getItem('sp_leagues') || '[]'),
  userPicks: {}, // Active picks for the logged-in user
  projectedStandings: {}
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initAccounts();
  populateFavoriteTeamsDropdown();
  setupNavigation();
  setupWeekScroller();
  updateAuthUI();
  renderHomeTab();
});

// Load active session from localStorage
function initAccounts() {
  const activeUsername = localStorage.getItem('sp_session_user');
  if (activeUsername && AppState.accounts[activeUsername]) {
    AppState.currentUser = AppState.accounts[activeUsername];
    AppState.userPicks = AppState.currentUser.picks || {};
    // Sanitize any previously cached unpicked games
    Object.keys(AppState.userPicks).forEach(gId => {
      const p = AppState.userPicks[gId];
      if (p && !p.winner) {
        p.awayScore = 0;
        p.homeScore = 0;
      }
    });
  } else {
    AppState.currentUser = null;
    AppState.userPicks = {};
  }
}

// Persist State to LocalStorage
function saveState() {
  if (AppState.currentUser) {
    AppState.currentUser.picks = AppState.userPicks;
    AppState.accounts[AppState.currentUser.username] = AppState.currentUser;
    localStorage.setItem('sp_session_user', AppState.currentUser.username);
  } else {
    localStorage.removeItem('sp_session_user');
  }

  localStorage.setItem('sp_accounts', JSON.stringify(AppState.accounts));
  localStorage.setItem('sp_mode', AppState.playMode);
  localStorage.setItem('sp_active_league', AppState.activeLeagueId || '');
  localStorage.setItem('sp_leagues', JSON.stringify(AppState.leagues));
}

// Populate Favorite Teams Dropdown in Sign Up Modal
function populateFavoriteTeamsDropdown() {
  const select = document.getElementById('signUpFavTeam');
  if (!select) return;
  select.innerHTML = '<option value="">Select Favorite Team</option>';
  Object.keys(NFL_TEAMS).sort().forEach(code => {
    const t = NFL_TEAMS[code];
    select.innerHTML += `<option value="${code}">${t.name} (${code})</option>`;
  });
}

// =========================================================
// AUTHENTICATION LOGIC & MODALS
// =========================================================

window.openAuthModal = function(initialTab = 'signin') {
  const modal = document.getElementById('authModal');
  const errorBox = document.getElementById('authErrorMessage');
  if (errorBox) errorBox.style.display = 'none';

  switchAuthTab(initialTab);
  if (modal) modal.classList.add('open');
};

window.closeAuthModal = function(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('close-btn')) return;
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
};

window.switchAuthTab = function(tab) {
  const tabSignIn = document.getElementById('authTabSignIn');
  const tabSignUp = document.getElementById('authTabSignUp');
  const formSignIn = document.getElementById('signInForm');
  const formSignUp = document.getElementById('signUpForm');
  const title = document.getElementById('authModalTitle');
  const errorBox = document.getElementById('authErrorMessage');

  if (errorBox) errorBox.style.display = 'none';

  if (tab === 'signup') {
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    formSignUp.style.display = 'block';
    formSignIn.style.display = 'none';
    if (title) title.textContent = 'Create Your Sports Psychic Account';
  } else {
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    formSignIn.style.display = 'block';
    formSignUp.style.display = 'none';
    if (title) title.textContent = 'Sign In to Sports Psychic';
  }
};

window.handleSignUpSubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('signUpUsername').value.trim();
  const email = document.getElementById('signUpEmail').value.trim().toLowerCase();
  const password = document.getElementById('signUpPassword').value;
  const favTeam = document.getElementById('signUpFavTeam').value;
  const errorBox = document.getElementById('authErrorMessage');

  if (username.length < 3) {
    showAuthError('Username must be at least 3 characters.');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }
  if (AppState.accounts[username]) {
    showAuthError('That username is already taken. Please choose another.');
    return;
  }

  // Check email collision
  const emailExists = Object.values(AppState.accounts).some(acc => acc.email === email);
  if (emailExists) {
    showAuthError('An account with that email already exists. Please sign in.');
    return;
  }

  // Create New Account
  const newAccount = {
    username,
    email,
    password, // Stored locally
    favoriteTeam: favTeam || 'None',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    picks: {},
    leagues: []
  };

  AppState.accounts[username] = newAccount;
  AppState.currentUser = newAccount;
  AppState.userPicks = newAccount.picks;
  saveState();

  closeAuthModal();
  updateAuthUI();
  renderHomeTab();

  if (AppState.currentTab === 'picks') {
    renderPicksTab();
  }

  alert(`Welcome, ${username}! Your account has been created.`);
};

window.handleSignInSubmit = function(e) {
  e.preventDefault();
  const identifier = document.getElementById('signInUsername').value.trim();
  const password = document.getElementById('signInPassword').value;

  // Search by username or email
  let matchedUser = AppState.accounts[identifier];
  if (!matchedUser) {
    matchedUser = Object.values(AppState.accounts).find(acc => acc.email === identifier.toLowerCase());
  }

  if (!matchedUser || matchedUser.password !== password) {
    showAuthError('Invalid username/email or password. Please try again.');
    return;
  }

  AppState.currentUser = matchedUser;
  AppState.userPicks = matchedUser.picks || {};
  saveState();

  closeAuthModal();
  updateAuthUI();
  renderHomeTab();

  if (AppState.currentTab === 'picks') {
    renderPicksTab();
  }
};

function showAuthError(msg) {
  const errorBox = document.getElementById('authErrorMessage');
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }
}

// User Profile Modal & Sign Out
window.openProfileModal = function() {
  if (!AppState.currentUser) return;
  const modal = document.getElementById('profileModal');
  const avatar = document.getElementById('profileAvatar');
  const name = document.getElementById('profileNameDisplay');
  const email = document.getElementById('profileEmailDisplay');
  const fav = document.getElementById('profileFavTeamDisplay');
  const created = document.getElementById('profileCreatedDisplay');

  if (avatar) avatar.textContent = AppState.currentUser.username.charAt(0).toUpperCase();
  if (name) name.textContent = AppState.currentUser.username;
  if (email) email.textContent = AppState.currentUser.email;
  if (fav) fav.textContent = AppState.currentUser.favoriteTeam !== 'None' ? (NFL_TEAMS[AppState.currentUser.favoriteTeam]?.name || AppState.currentUser.favoriteTeam) : 'None';
  if (created) created.textContent = AppState.currentUser.createdAt;

  if (modal) modal.classList.add('open');
};

window.closeProfileModal = function(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('close-btn')) return;
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.remove('open');
};

window.handleSignOut = function() {
  if (confirm('Are you sure you want to sign out?')) {
    AppState.currentUser = null;
    AppState.userPicks = {};
    saveState();
    closeProfileModal();
    updateAuthUI();
    renderHomeTab();
    if (AppState.currentTab === 'picks') {
      renderPicksTab();
    }
  }
};

// Update Header & Home UI based on Auth State
function updateAuthUI() {
  const authArea = document.getElementById('headerAuthArea');
  const homeUsernameDisplay = document.getElementById('homeUsernameDisplay');
  const homeStatusBadge = document.getElementById('userAccountStatusBadge');

  if (AppState.currentUser) {
    // Authenticated
    if (authArea) {
      authArea.innerHTML = `
        <button class="user-profile-chip" onclick="openProfileModal()">
          <span>👤</span>
          <span>${AppState.currentUser.username}</span>
        </button>
      `;
    }
    if (homeUsernameDisplay) homeUsernameDisplay.textContent = AppState.currentUser.username;
    if (homeStatusBadge) {
      homeStatusBadge.textContent = 'MEMBER';
      homeStatusBadge.style.color = 'var(--accent-green)';
    }
  } else {
    // Guest
    if (authArea) {
      authArea.innerHTML = `
        <button class="auth-header-btn" onclick="openAuthModal('signin')">Sign In</button>
      `;
    }
    if (homeUsernameDisplay) homeUsernameDisplay.textContent = 'Not Signed In';
    if (homeStatusBadge) {
      homeStatusBadge.textContent = 'GUEST';
      homeStatusBadge.style.color = 'var(--text-muted)';
    }
  }

  updateModeBadge();
}

// Intercept Picks Navigation (Require Sign In)
window.handlePicksAction = function() {
  if (!AppState.currentUser) {
    switchTab('picks');
    openAuthModal('signup');
  } else {
    switchTab('picks');
  }
};

// =========================================================
// NAVIGATION & TABS
// =========================================================

function setupNavigation() {
  window.switchTab = function(tabName) {
    AppState.currentTab = tabName;
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tabName}`);
    });

    if (tabName === 'home') renderHomeTab();
    if (tabName === 'picks') renderPicksTab();
    if (tabName === 'standings') renderStandingsTab();
    if (tabName === 'leagues') renderLeaguesTab();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.setPlayMode = function(mode) {
    AppState.playMode = mode;
    saveState();
    updateModeBadge();
    renderHomeTab();
    renderLeaguesTab();
  };
}

function updateModeBadge() {
  const badge = document.getElementById('activeModeBadge');
  const icon = document.getElementById('modeIcon');
  const label = document.getElementById('modeLabel');
  if (!badge) return;

  if (AppState.playMode === 'solo') {
    badge.className = 'mode-badge solo';
    if (icon) icon.textContent = '🛡️';
    if (label) label.textContent = 'Solo Play';
  } else {
    badge.className = 'mode-badge league';
    if (icon) icon.textContent = '👥';
    const activeLeague = AppState.leagues.find(l => l.id === AppState.activeLeagueId);
    if (label) label.textContent = activeLeague ? activeLeague.name : 'League Mode';
  }
}

// -------------------------------------------------------------
// TAB 1: HOME PAGE
// -------------------------------------------------------------
function renderHomeTab() {
  updateAuthUI();

  let totalPoints = 0;
  let correctPicks = 0;
  let finalGamesPicked = 0;
  let totalPicksMade = 0;

  const actuals = NFL_2026_SCHEDULE?.actuals || {};

  for (let w = 1; w <= 18; w++) {
    const games = NFL_2026_SCHEDULE?.schedule?.[`Week ${w}`] || [];
    const weekActuals = actuals[`Week ${w}`] || [];

    games.forEach(g => {
      const pick = AppState.userPicks[g.id];
      if (pick && pick.winner) {
        totalPicksMade++;
        const act = weekActuals.find(a => a.id === g.id);
        if (act && act.isFinal && act.winner) {
          finalGamesPicked++;
          if (pick.winner === act.winner) {
            correctPicks++;
            const mult = pick.multiplier ? 3 : 1;
            totalPoints += (10 * mult);

            const err = Math.abs((pick.awayScore ?? 0) - act.awayScore) + Math.abs((pick.homeScore ?? 0) - act.homeScore);
            if (err === 0) {
              totalPoints += (40 * mult); // 50 pts total for exact score
            }
          }
        }
      }
    });
  }

  const accuracy = finalGamesPicked > 0 ? `${Math.round((correctPicks / finalGamesPicked) * 100)}%` : '—';

  const statPts = document.getElementById('homeStatPoints');
  const statAcc = document.getElementById('homeStatAccuracy');
  const statPkd = document.getElementById('homeStatPicked');

  if (statPts) statPts.textContent = totalPoints;
  if (statAcc) statAcc.textContent = accuracy;
  if (statPkd) statPkd.textContent = totalPicksMade;

  renderScoresTicker();
}

function renderScoresTicker() {
  const tickerContainer = document.getElementById('homeScoresTicker');
  if (!tickerContainer) return;

  const actuals = NFL_2026_SCHEDULE?.actuals || {};
  const completedGames = [];

  for (let w = 1; w <= 18; w++) {
    const list = actuals[`Week ${w}`] || [];
    list.forEach(item => {
      if (item.isFinal && item.winner) {
        completedGames.push({ week: w, ...item });
      }
    });
  }

  if (completedGames.length === 0) {
    tickerContainer.innerHTML = '<div style="font-size:0.8rem;color:var(--text-muted);padding:8px 0;">Upcoming season matchups waiting for kickoff.</div>';
    return;
  }

  const latestGames = completedGames.slice(-4).reverse();
  tickerContainer.innerHTML = latestGames.map(g => `
    <div class="ticker-item">
      <span class="ticker-matchup">${g.matchup}</span>
      <span class="ticker-score">${g.awayScore} - ${g.homeScore} (${g.winner})</span>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// TAB 2: PREDICTIONS (Weeks 1 to 18) - WITH AUTHENTICATION GATE
// -------------------------------------------------------------
function setupWeekScroller() {
  const scroller = document.getElementById('weekScroller');
  if (!scroller) return;
  scroller.innerHTML = '';

  for (let w = 1; w <= 18; w++) {
    const pill = document.createElement('button');
    pill.className = `week-pill ${w === AppState.currentWeek ? 'active' : ''}`;
    pill.id = `week-pill-${w}`;
    pill.innerHTML = `<span>Week ${w}</span>`;
    pill.addEventListener('click', () => {
      AppState.currentWeek = w;
      document.querySelectorAll('.week-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderPicksTab();
    });
    scroller.appendChild(pill);
  }
}

function renderPicksTab() {
  const lockedGate = document.getElementById('picksLockedGate');
  const unlockedContent = document.getElementById('picksUnlockedContent');

  // AUTH GATE: If user is not authenticated, lock predictions
  if (!AppState.currentUser) {
    if (lockedGate) lockedGate.style.display = 'block';
    if (unlockedContent) unlockedContent.style.display = 'none';
    return;
  }

  if (lockedGate) lockedGate.style.display = 'none';
  if (unlockedContent) unlockedContent.style.display = 'block';

  const container = document.getElementById('matchupsContainer');
  const counterEl = document.getElementById('picksCounter');
  if (!container) return;

  const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
  const weekActuals = NFL_2026_SCHEDULE?.actuals?.[`Week ${AppState.currentWeek}`] || [];
  let pickedCount = 0;

  container.innerHTML = '';

  weekGames.forEach(game => {
    const pick = AppState.userPicks[game.id] || {
      winner: '',
      awayScore: 0,
      homeScore: 0,
      multiplier: false
    };

    if (pick.winner) pickedCount++;

    const actual = weekActuals.find(a => a.id === game.id) || { isFinal: false };
    const awayTeam = NFL_TEAMS[game.awayTeam] || { name: game.awayTeam, color: '#2a3b50' };
    const homeTeam = NFL_TEAMS[game.homeTeam] || { name: game.homeTeam, color: '#2a3b50' };

    const awayRecord = AppState.projectedStandings[game.awayTeam] ? `${AppState.projectedStandings[game.awayTeam].w}-${AppState.projectedStandings[game.awayTeam].l}` : '';
    const homeRecord = AppState.projectedStandings[game.homeTeam] ? `${AppState.projectedStandings[game.homeTeam].w}-${AppState.projectedStandings[game.homeTeam].l}` : '';

    const card = document.createElement('div');
    card.className = `matchup-card ${pick.multiplier ? 'has-mult' : ''}`;

    card.innerHTML = `
      <div class="card-top-bar">
        <span>${game.dateTime || `Game ${game.gameNum}`}</span>
        <button class="mult-btn ${pick.multiplier ? 'active' : ''}" data-game-id="${game.id}">
          ★ 3x Multiplier
        </button>
      </div>

      <div class="teams-row">
        <!-- Away Team -->
        <button class="team-btn ${pick.winner === game.awayTeam ? 'selected' : ''}" data-team="${game.awayTeam}" data-game-id="${game.id}">
          <div class="team-badge" style="background-color: ${awayTeam.color}">${game.awayTeam}</div>
          <div class="team-name">${game.awayTeam}</div>
          <div class="team-record-sub">${awayRecord ? `(${awayRecord})` : ''}</div>
        </button>

        <div class="vs-divider">@</div>

        <!-- Home Team -->
        <button class="team-btn ${pick.winner === game.homeTeam ? 'selected' : ''}" data-team="${game.homeTeam}" data-game-id="${game.id}">
          <div class="team-badge" style="background-color: ${homeTeam.color}">${game.homeTeam}</div>
          <div class="team-name">${game.homeTeam}</div>
          <div class="team-record-sub">${homeRecord ? `(${homeRecord})` : ''}</div>
        </button>
      </div>

      <div class="scores-row">
        <div class="score-control">
          <button class="stepper-btn" data-action="dec-away" data-game-id="${game.id}">−</button>
          <input type="number" class="score-input" data-field="away" data-game-id="${game.id}" value="${pick.awayScore ?? 0}" min="0" max="99" />
          <button class="stepper-btn" data-action="inc-away" data-game-id="${game.id}">+</button>
        </div>
        <div class="scores-label">PREDICTED<br>SCORE</div>
        <div class="score-control">
          <button class="stepper-btn" data-action="dec-home" data-game-id="${game.id}">−</button>
          <input type="number" class="score-input" data-field="home" data-game-id="${game.id}" value="${pick.homeScore ?? 0}" min="0" max="99" />
          <button class="stepper-btn" data-action="inc-home" data-game-id="${game.id}">+</button>
        </div>
      </div>

      ${actual.isFinal ? `
        <div class="actual-result-banner ${pick.winner === actual.winner ? 'win' : 'loss'}">
          <span>Actual: ${game.awayTeam} ${actual.awayScore} - ${actual.homeScore} ${game.homeTeam} (${actual.winner} Win)</span>
          <span style="font-weight:800;">${pick.winner === actual.winner ? `+10 PTS ${pick.multiplier ? '(3x = 30)' : ''}` : '0 PTS'}</span>
        </div>
      ` : ''}
    `;

    container.appendChild(card);
  });

  if (counterEl) {
    counterEl.textContent = `${pickedCount} / ${weekGames.length}`;
  }

  attachPicksEvents();
}

function attachPicksEvents() {
  document.querySelectorAll('.team-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.gameId;
      const team = btn.dataset.team;
      if (!AppState.userPicks[gameId]) {
        AppState.userPicks[gameId] = { winner: '', awayScore: 0, homeScore: 0, multiplier: false };
      }
      AppState.userPicks[gameId].winner = team;
      saveState();
      calculateProjectedStandings();
      renderPicksTab();
    });
  });

  document.querySelectorAll('.mult-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.gameId;
      const currentVal = AppState.userPicks[gameId]?.multiplier || false;

      if (!currentVal) {
        const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
        weekGames.forEach(g => {
          if (AppState.userPicks[g.id]) AppState.userPicks[g.id].multiplier = false;
        });
      }

      if (!AppState.userPicks[gameId]) {
        AppState.userPicks[gameId] = { winner: '', awayScore: 0, homeScore: 0, multiplier: true };
      } else {
        AppState.userPicks[gameId].multiplier = !currentVal;
      }

      saveState();
      renderPicksTab();
    });
  });

  document.querySelectorAll('.stepper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.gameId;
      const action = btn.dataset.action;
      if (!AppState.userPicks[gameId]) {
        AppState.userPicks[gameId] = { winner: '', awayScore: 0, homeScore: 0, multiplier: false };
      }
      if (action === 'dec-away') AppState.userPicks[gameId].awayScore = Math.max(0, (AppState.userPicks[gameId].awayScore || 0) - 1);
      if (action === 'inc-away') AppState.userPicks[gameId].awayScore = (AppState.userPicks[gameId].awayScore || 0) + 1;
      if (action === 'dec-home') AppState.userPicks[gameId].homeScore = Math.max(0, (AppState.userPicks[gameId].homeScore || 0) - 1);
      if (action === 'inc-home') AppState.userPicks[gameId].homeScore = (AppState.userPicks[gameId].homeScore || 0) + 1;
      saveState();
      renderPicksTab();
    });
  });

  document.querySelectorAll('.score-input').forEach(input => {
    input.addEventListener('change', () => {
      const gameId = input.dataset.gameId;
      const field = input.dataset.field;
      const val = parseInt(input.value) || 0;
      if (!AppState.userPicks[gameId]) {
        AppState.userPicks[gameId] = { winner: '', awayScore: 0, homeScore: 0, multiplier: false };
      }
      if (field === 'away') AppState.userPicks[gameId].awayScore = val;
      if (field === 'home') AppState.userPicks[gameId].homeScore = val;
      saveState();
    });
  });

  const randBtn = document.getElementById('btnRandomize');
  if (randBtn) {
    randBtn.onclick = () => {
      const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
      const commonScores = [14, 17, 20, 21, 24, 27, 28, 31, 34];
      let multSet = false;

      weekGames.forEach(g => {
        if (!AppState.userPicks[g.id]) {
          AppState.userPicks[g.id] = { winner: '', awayScore: 0, homeScore: 0, multiplier: false };
        }
        if (!AppState.userPicks[g.id].winner) {
          AppState.userPicks[g.id].winner = Math.random() > 0.5 ? g.homeTeam : g.awayTeam;
          AppState.userPicks[g.id].awayScore = commonScores[Math.floor(Math.random() * commonScores.length)];
          AppState.userPicks[g.id].homeScore = commonScores[Math.floor(Math.random() * commonScores.length)];
        }
        if (AppState.userPicks[g.id].multiplier) multSet = true;
      });

      if (!multSet && weekGames.length > 0) {
        const randIdx = Math.floor(Math.random() * weekGames.length);
        AppState.userPicks[weekGames[randIdx].id].multiplier = true;
      }

      saveState();
      calculateProjectedStandings();
      renderPicksTab();
    };
  }

  const clearBtn = document.getElementById('btnClearWeek');
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm(`Clear all predictions for Week ${AppState.currentWeek}?`)) {
        const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
        weekGames.forEach(g => {
          if (AppState.userPicks[g.id]) {
            AppState.userPicks[g.id].winner = '';
            AppState.userPicks[g.id].multiplier = false;
          }
        });
        saveState();
        calculateProjectedStandings();
        renderPicksTab();
      }
    };
  }
}

// -------------------------------------------------------------
// TAB 3: STANDINGS & STATS
// -------------------------------------------------------------
function calculateProjectedStandings() {
  const standings = {};
  Object.keys(NFL_TEAMS).forEach(code => {
    standings[code] = {
      code,
      conf: NFL_TEAMS[code].conf,
      div: NFL_TEAMS[code].div,
      w: 0, l: 0,
      divW: 0, divL: 0,
      pf: 0, pa: 0
    };
  });

  for (let w = 1; w <= 18; w++) {
    const games = NFL_2026_SCHEDULE?.schedule?.[`Week ${w}`] || [];
    games.forEach(g => {
      const pick = AppState.userPicks[g.id];
      if (pick && pick.winner) {
        const away = standings[g.awayTeam];
        const home = standings[g.homeTeam];
        const isDiv = away.conf === home.conf && away.div === home.div;

        if (pick.winner === g.awayTeam) {
          away.w++; home.l++;
          if (isDiv) { away.divW++; home.divL++; }
        } else if (pick.winner === g.homeTeam) {
          home.w++; away.l++;
          if (isDiv) { home.divW++; away.divL++; }
        }

        const aScore = pick.awayScore || 0;
        const hScore = pick.homeScore || 0;
        away.pf += aScore; away.pa += hScore;
        home.pf += hScore; home.pa += aScore;
      }
    });
  }

  AppState.projectedStandings = standings;
}

function renderStandingsTab() {
  calculateProjectedStandings();
  const container = document.getElementById('divisionsContainer');
  if (!container) return;
  container.innerHTML = '';

  Object.keys(DIVISIONS).forEach(divName => {
    const teams = DIVISIONS[divName].map(c => AppState.projectedStandings[c]);
    teams.sort((a, b) => {
      const pctA = (a.w + a.l) > 0 ? a.w / (a.w + a.l) : 0;
      const pctB = (b.w + b.l) > 0 ? b.w / (b.w + b.l) : 0;
      if (pctB !== pctA) return pctB - pctA;
      return (b.pf - b.pa) - (a.pf - a.pa);
    });

    const card = document.createElement('div');
    card.className = 'division-card';
    card.innerHTML = `
      <div class="division-header">
        <span>${divName}</span>
        <span>RECORD</span>
      </div>
      <table class="standings-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>W-L</th>
            <th>Div</th>
            <th>Diff</th>
          </tr>
        </thead>
        <tbody>
          ${teams.map(t => `
            <tr>
              <td>
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${NFL_TEAMS[t.code].color};margin-right:6px;"></span>
                ${t.code}
              </td>
              <td>${t.w} - ${t.l}</td>
              <td>${t.divW} - ${t.divL}</td>
              <td style="color:${(t.pf - t.pa) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${(t.pf - t.pa) > 0 ? '+' : ''}${t.pf - t.pa}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });

  renderPlayoffPicture();
}

function renderPlayoffPicture() {
  const afc = computeConferenceSeeds('AFC');
  const nfc = computeConferenceSeeds('NFC');

  const afcEl = document.getElementById('afcSeedsList');
  const nfcEl = document.getElementById('nfcSeedsList');

  if (afcEl) {
    afcEl.innerHTML = afc.map((t, idx) => `
      <li style="display:flex;justify-content:space-between;padding:6px 10px;margin-bottom:4px;background:var(--bg-secondary);border-radius:6px;font-size:0.85rem;">
        <span style="font-weight:800;color:var(--accent-gold);">#${idx + 1}</span>
        <span style="font-weight:700;">${t.code}</span>
        <span>${t.w} - ${t.l}</span>
      </li>
    `).join('');
  }

  if (nfcEl) {
    nfcEl.innerHTML = nfc.map((t, idx) => `
      <li style="display:flex;justify-content:space-between;padding:6px 10px;margin-bottom:4px;background:var(--bg-secondary);border-radius:6px;font-size:0.85rem;">
        <span style="font-weight:800;color:var(--accent-gold);">#${idx + 1}</span>
        <span style="font-weight:700;">${t.code}</span>
        <span>${t.w} - ${t.l}</span>
      </li>
    `).join('');
  }
}

function computeConferenceSeeds(conf) {
  const confDivs = Object.keys(DIVISIONS).filter(d => d.startsWith(conf));
  const divWinners = [];
  const wildcards = [];

  confDivs.forEach(d => {
    const dTeams = DIVISIONS[d].map(c => AppState.projectedStandings[c]);
    dTeams.sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa));
    divWinners.push(dTeams[0]);
    for (let i = 1; i < dTeams.length; i++) wildcards.push(dTeams[i]);
  });

  divWinners.sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa));
  wildcards.sort((a, b) => b.w - a.w || (b.pf - b.pa) - (a.pf - a.pa));

  return [...divWinners.slice(0, 4), ...wildcards.slice(0, 3)];
}

// -------------------------------------------------------------
// TAB 4: LEAGUES & SOLO MODE
// -------------------------------------------------------------
function renderLeaguesTab() {
  const btnSolo = document.getElementById('btnSetSolo');
  const btnLeague = document.getElementById('btnSetLeague');
  if (btnSolo && btnLeague) {
    btnSolo.className = `btn-sm ${AppState.playMode === 'solo' ? 'primary' : ''}`;
    btnLeague.className = `btn-sm ${AppState.playMode === 'league' ? 'primary' : ''}`;
  }

  const container = document.getElementById('leagueStandingsRows');
  const titleDisplay = document.getElementById('leagueTitleDisplay');
  const rosterList = document.getElementById('leagueRosterList');

  const currentDisplayName = AppState.currentUser ? AppState.currentUser.username : 'Guest Player';

  if (AppState.playMode === 'solo') {
    if (titleDisplay) titleDisplay.textContent = 'Solo Play Career Record';
    if (rosterList) rosterList.textContent = 'Competing against yourself. Climb accuracy levels as the season progresses!';

    let points = 0;
    let wins = 0;
    let total = 0;
    const actuals = NFL_2026_SCHEDULE?.actuals || {};

    for (let w = 1; w <= 18; w++) {
      const list = actuals[`Week ${w}`] || [];
      list.forEach(a => {
        if (a.isFinal && a.winner) {
          const p = AppState.userPicks[a.id];
          if (p && p.winner) {
            total++;
            if (p.winner === a.winner) {
              wins++;
              const mult = p.multiplier ? 3 : 1;
              points += (10 * mult);
            }
          }
        }
      });
    }

    if (container) {
      container.innerHTML = `
        <tr>
          <td>#1</td>
          <td style="font-weight:700;">${currentDisplayName} (You)</td>
          <td>${wins} - ${total - wins}</td>
          <td>${total > 0 ? `${Math.round((wins / total) * 100)}%` : '—'}</td>
          <td style="text-align:right;font-weight:900;color:var(--accent-green);">${points}</td>
        </tr>
      `;
    }
  } else {
    const activeLeague = AppState.leagues.find(l => l.id === AppState.activeLeagueId);
    if (!activeLeague) {
      if (titleDisplay) titleDisplay.textContent = 'No Active League Selected';
      if (rosterList) rosterList.textContent = 'Create a new league above or join an existing league to begin competing!';
      if (container) container.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No active league yet. Create one above!</td></tr>';
      return;
    }

    if (titleDisplay) titleDisplay.textContent = `League: ${activeLeague.name}`;
    if (rosterList) rosterList.textContent = `Members (${activeLeague.members.length}): ${activeLeague.members.join(', ')}`;

    if (container) {
      container.innerHTML = activeLeague.members.map((m, idx) => `
        <tr>
          <td>#${idx + 1}</td>
          <td style="font-weight:700;">${m} ${m === currentDisplayName ? '(You)' : ''}</td>
          <td>0 - 0</td>
          <td>—</td>
          <td style="text-align:right;font-weight:900;color:var(--accent-green);">0</td>
        </tr>
      `).join('');
    }
  }
}

window.createNewLeague = function() {
  if (!AppState.currentUser) {
    openAuthModal('signup');
    return;
  }

  const nameInput = document.getElementById('createLeagueNameInput');
  const membersInput = document.getElementById('createLeagueMembersInput');
  const name = nameInput?.value.trim();
  const membersRaw = membersInput?.value.trim();

  if (!name) return alert('Please enter a league name');

  let members = membersRaw ? membersRaw.split(',').map(m => m.trim()).filter(m => m.length > 0) : [];
  if (!members.includes(AppState.currentUser.username)) {
    members.unshift(AppState.currentUser.username);
  }

  const newLeague = {
    id: 'league-' + Date.now(),
    name,
    members,
    admin: AppState.currentUser.username
  };

  AppState.leagues.push(newLeague);
  AppState.activeLeagueId = newLeague.id;
  AppState.playMode = 'league';
  saveState();

  if (nameInput) nameInput.value = '';
  if (membersInput) membersInput.value = '';

  updateModeBadge();
  renderLeaguesTab();
  alert(`League "${name}" created with ${members.length} players!`);
};
