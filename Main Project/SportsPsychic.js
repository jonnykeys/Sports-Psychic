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
  projectedStandings: {},
  globalActuals: {}, // Unified official game outcomes
  scorekeeperWeek: 1,
  scorekeeperFilter: 'all'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initActuals();
  initAccounts();
  populateFavoriteTeamsDropdown();
  setupNavigation();
  setupWeekScroller();
  updateAuthUI();
  renderHomeTab();
});

// Load and unify global actual results
function initActuals() {
  const saved = localStorage.getItem('sp_global_actuals');
  let actuals = {};
  if (saved) {
    try { actuals = JSON.parse(saved); } catch (e) { actuals = {}; }
  }

  // Merge baseline from NFL_2026_SCHEDULE
  const baseline = NFL_2026_SCHEDULE?.actuals || {};
  const schedule = NFL_2026_SCHEDULE?.schedule || {};

  for (let w = 1; w <= 18; w++) {
    const weekKey = `Week ${w}`;
    const baseList = baseline[weekKey] || [];
    const schedList = schedule[weekKey] || [];

    if (!actuals[weekKey]) actuals[weekKey] = [];

    // First ensure baseline actuals are present or upgraded
    baseList.forEach(baseGame => {
      const existingIdx = actuals[weekKey].findIndex(g => g.id === baseGame.id);
      if (existingIdx === -1) {
        actuals[weekKey].push({
          ...baseGame,
          isLocked: baseGame.isLocked || baseGame.isFinal || false
        });
      } else if (!actuals[weekKey][existingIdx].isFinal && baseGame.isFinal) {
        actuals[weekKey][existingIdx] = {
          ...baseGame,
          isLocked: true
        };
      }
    });

    // Also ensure every scheduled game has a record in actuals[weekKey]
    schedList.forEach(sGame => {
      const existing = actuals[weekKey].find(g => g.id === sGame.id);
      if (!existing) {
        actuals[weekKey].push({
          id: sGame.id,
          matchup: sGame.matchup,
          awayScore: null,
          homeScore: null,
          winner: '',
          isLocked: false,
          isFinal: false
        });
      }
    });
  }
  AppState.globalActuals = actuals;
}

function isUserAdmin() {
  if (!AppState.currentUser) return false;
  if (localStorage.getItem('sp_admin_unlocked') === 'true') return true;
  const uname = (AppState.currentUser.username || '').toLowerCase();
  return uname === 'jonny' || uname === 'jon' || uname === 'admin' || AppState.currentUser.isAdmin === true;
}

// Helper to check if a game is locked from predictions (live kickoff lock OR finalized)
function isGameLocked(gameId, weekNum = null) {
  if (weekNum) {
    const list = AppState.globalActuals[`Week ${weekNum}`] || [];
    const found = list.find(g => g.id === gameId);
    return found ? (found.isLocked === true || found.isFinal === true) : false;
  }
  for (let w = 1; w <= 18; w++) {
    const list = AppState.globalActuals[`Week ${w}`] || [];
    const found = list.find(g => g.id === gameId);
    if (found && (found.isLocked === true || found.isFinal === true)) return true;
  }
  return false;
}

// Helper to check if an official game result has finalized
function isGameFinalized(gameId, weekNum = null) {
  if (weekNum) {
    const list = AppState.globalActuals[`Week ${weekNum}`] || [];
    const found = list.find(g => g.id === gameId);
    return found ? found.isFinal === true : false;
  }
  for (let w = 1; w <= 18; w++) {
    const list = AppState.globalActuals[`Week ${w}`] || [];
    const found = list.find(g => g.id === gameId);
    if (found && found.isFinal === true) return true;
  }
  return false;
}

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

  updateAuthUI();

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

window.promptAdminUnlock = function() {
  const code = prompt('Enter Commissioner Passcode to unlock admin controls:');
  if (code === null) return;
  if (code.trim() === 'psychic2026') {
    localStorage.setItem('sp_admin_unlocked', 'true');
    if (AppState.currentUser) {
      AppState.currentUser.isAdmin = true;
      saveState();
    }
    updateAuthUI();
    alert('Commissioner access granted! The Scorekeeper tool is now available in the top header.');
  } else {
    alert('Incorrect passcode. Access denied.');
  }
};

// Update Header & Home UI based on Auth State
function updateAuthUI() {
  const authArea = document.getElementById('headerAuthArea');
  const homeUsernameDisplay = document.getElementById('homeUsernameDisplay');
  const homeStatusBadge = document.getElementById('userAccountStatusBadge');
  const adminBtn = document.getElementById('headerAdminBtn');
  const adminStatusDisplay = document.getElementById('profileAdminStatusDisplay');
  const adminPasscodeBox = document.getElementById('adminPasscodeBox');

  const isAdmin = isUserAdmin();

  // Admin button in header
  if (adminBtn) {
    if (isAdmin) {
      adminBtn.classList.add('visible');
    } else {
      adminBtn.classList.remove('visible');
    }
  }

  // Profile modal admin status
  if (adminStatusDisplay) {
    if (isAdmin) {
      adminStatusDisplay.innerHTML = '<span style="color:var(--accent-gold);font-weight:800;">🛡️ Commissioner (Admin)</span>';
    } else {
      adminStatusDisplay.innerHTML = '<span style="color:var(--text-muted);font-weight:700;">Player</span>';
    }
  }

  // Admin passcode box inside profile modal
  if (adminPasscodeBox) {
    if (isAdmin) {
      adminPasscodeBox.innerHTML = '<div style="font-size:0.75rem;color:var(--accent-gold);font-weight:700;padding:6px 12px;background:rgba(255,179,0,0.1);border-radius:6px;border:1px solid rgba(255,179,0,0.25);">🛡️ Commissioner Access Active</div>';
    } else {
      adminPasscodeBox.innerHTML = '<button id="btnUnlockAdminPrompt" class="btn-sm" style="font-size:0.75rem;" onclick="promptAdminUnlock()">🛡️ Unlock Commissioner / Admin Access</button>';
    }
  }

  if (AppState.currentUser) {
    // Authenticated
    if (authArea) {
      authArea.innerHTML = `
        <button class="user-profile-chip" onclick="openProfileModal()">
          <span>👤</span>
          <span>${AppState.currentUser.username}</span>
          ${isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
        </button>
      `;
    }
    if (homeUsernameDisplay) homeUsernameDisplay.textContent = AppState.currentUser.username;
    if (homeStatusBadge) {
      homeStatusBadge.textContent = isAdmin ? 'COMMISSIONER' : 'MEMBER';
      homeStatusBadge.style.color = isAdmin ? 'var(--accent-gold)' : 'var(--accent-green)';
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
    if (tabName === 'picks') {
      renderPicksTab();
      setTimeout(() => {
        const activePill = document.getElementById(`week-pill-${AppState.currentWeek}`);
        if (activePill) {
          activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        if (window.updateWeekNavButtons) window.updateWeekNavButtons();
      }, 80);
    }
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

  const actuals = AppState.globalActuals || {};

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

  const actuals = AppState.globalActuals || {};
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
// TAB 2: PREDICTIONS (Weeks 1 to 18) - WITH SEAMLESS SCROLLER & CONTROLS
// -------------------------------------------------------------
window.selectWeek = function(weekNum, shouldScrollPill = true) {
  const w = Math.max(1, Math.min(18, parseInt(weekNum) || 1));
  AppState.currentWeek = w;

  // 1. Update week pills active class
  document.querySelectorAll('.week-pill').forEach(p => {
    const pWeek = parseInt(p.dataset.week);
    p.classList.toggle('active', pWeek === w);
  });

  // 2. Synchronize jump dropdown
  const dropdown = document.getElementById('weekSelectDropdown');
  if (dropdown && dropdown.value !== String(w)) {
    dropdown.value = String(w);
  }

  // 3. Update Prev / Next buttons disabled states
  const prevBtn = document.getElementById('btnPrevWeek');
  const nextBtn = document.getElementById('btnNextWeek');
  if (prevBtn) prevBtn.disabled = (w <= 1);
  if (nextBtn) nextBtn.disabled = (w >= 18);

  // 4. Smoothly center active pill in view
  if (shouldScrollPill) {
    const activePill = document.getElementById(`week-pill-${w}`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  updateWeekNavButtons();
  renderPicksTab();
};

window.stepWeek = function(delta) {
  const current = AppState.currentWeek || 1;
  const target = Math.max(1, Math.min(18, current + delta));
  selectWeek(target, true);
};

window.scrollWeekCarousel = function(direction) {
  const scroller = document.getElementById('weekScroller');
  if (!scroller) return;
  const scrollAmount = 260;
  scroller.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  setTimeout(updateWeekNavButtons, 350);
};

window.updateWeekNavButtons = function() {
  const scroller = document.getElementById('weekScroller');
  const prevBtn = document.getElementById('weekScrollPrev');
  const nextBtn = document.getElementById('weekScrollNext');
  if (!scroller) return;

  if (prevBtn) {
    prevBtn.disabled = scroller.scrollLeft <= 6;
  }
  if (nextBtn) {
    nextBtn.disabled = (scroller.scrollLeft + scroller.clientWidth) >= (scroller.scrollWidth - 6);
  }
};

function setupWeekScroller() {
  const scroller = document.getElementById('weekScroller');
  const dropdown = document.getElementById('weekSelectDropdown');
  if (!scroller) return;

  scroller.innerHTML = '';

  // Setup dropdown options (Weeks 1 to 18)
  if (dropdown) {
    dropdown.innerHTML = '';
    for (let w = 1; w <= 18; w++) {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = `Week ${w}`;
      if (w === AppState.currentWeek) opt.selected = true;
      dropdown.appendChild(opt);
    }
  }

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let hasDragged = false;

  for (let w = 1; w <= 18; w++) {
    const pill = document.createElement('button');
    pill.className = `week-pill ${w === AppState.currentWeek ? 'active' : ''}`;
    pill.id = `week-pill-${w}`;
    pill.dataset.week = w;
    pill.innerHTML = `<span>Week ${w}</span>`;

    pill.addEventListener('click', (e) => {
      if (hasDragged) {
        e.stopPropagation();
        return;
      }
      selectWeek(w, true);
    });

    scroller.appendChild(pill);
  }

  // 1. Mouse wheel horizontal scrolling (translates wheel down/up to carousel scroll right/left)
  scroller.addEventListener('wheel', (e) => {
    if (e.deltaY !== 0) {
      e.preventDefault();
      scroller.scrollLeft += e.deltaY * 1.4;
      updateWeekNavButtons();
    }
  }, { passive: false });

  // 2. Click & drag mouse dragging (Grab & Drag)
  scroller.addEventListener('mousedown', (e) => {
    isDown = true;
    hasDragged = false;
    scroller.classList.add('dragging');
    startX = e.pageX - scroller.offsetLeft;
    scrollLeft = scroller.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (isDown) {
      isDown = false;
      scroller.classList.remove('dragging');
      setTimeout(() => { hasDragged = false; }, 60);
      updateWeekNavButtons();
    }
  });

  scroller.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scroller.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 4) hasDragged = true;
    scroller.scrollLeft = scrollLeft - walk;
    updateWeekNavButtons();
  });

  // 3. Scroll event to update left/right button states
  scroller.addEventListener('scroll', () => {
    updateWeekNavButtons();
  }, { passive: true });

  // Initial update
  setTimeout(() => {
    updateWeekNavButtons();
    const activePill = document.getElementById(`week-pill-${AppState.currentWeek}`);
    if (activePill) {
      activePill.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    }
  }, 100);
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

  // Synchronize jump dropdown & step buttons with current week
  const dropdown = document.getElementById('weekSelectDropdown');
  if (dropdown && dropdown.value !== String(AppState.currentWeek)) {
    dropdown.value = String(AppState.currentWeek);
  }
  const prevBtn = document.getElementById('btnPrevWeek');
  const nextBtn = document.getElementById('btnNextWeek');
  if (prevBtn) prevBtn.disabled = (AppState.currentWeek <= 1);
  if (nextBtn) nextBtn.disabled = (AppState.currentWeek >= 18);

  const container = document.getElementById('matchupsContainer');
  const counterEl = document.getElementById('picksCounter');
  if (!container) return;

  const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
  const weekActuals = AppState.globalActuals?.[`Week ${AppState.currentWeek}`] || [];
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

    const actual = weekActuals.find(a => a.id === game.id) || { isFinal: false, isLocked: false };
    const isFinal = actual.isFinal === true;
    const isLocked = isGameLocked(game.id, AppState.currentWeek);
    const awayTeam = NFL_TEAMS[game.awayTeam] || { name: game.awayTeam, color: '#2a3b50' };
    const homeTeam = NFL_TEAMS[game.homeTeam] || { name: game.homeTeam, color: '#2a3b50' };

    const awayRecord = AppState.projectedStandings[game.awayTeam] ? `${AppState.projectedStandings[game.awayTeam].w}-${AppState.projectedStandings[game.awayTeam].l}` : '';
    const homeRecord = AppState.projectedStandings[game.homeTeam] ? `${AppState.projectedStandings[game.homeTeam].w}-${AppState.projectedStandings[game.homeTeam].l}` : '';

    const card = document.createElement('div');
    card.className = `matchup-card ${pick.multiplier ? 'has-mult' : ''} ${isLocked ? 'game-locked' : ''}`;

    card.innerHTML = `
      <div class="card-top-bar">
        <div style="display:flex;align-items:center;gap:6px;">
          <span>${game.dateTime || `Game ${game.gameNum}`}</span>
          ${isFinal ? '<span class="locked-pill">🔒 FINAL • LOCKED</span>' : (isLocked ? '<span class="locked-pill live">🔒 IN PROGRESS • LOCKED</span>' : '')}
        </div>
        <button class="mult-btn ${pick.multiplier ? 'active' : ''} ${isLocked ? 'disabled' : ''}" 
          data-game-id="${game.id}"
          ${isLocked ? 'disabled title="Game is locked - predictions closed"' : ''}>
          ★ 3x Multiplier
        </button>
      </div>

      <div class="teams-row">
        <!-- Away Team -->
        <button class="team-btn ${pick.winner === game.awayTeam ? 'selected' : ''} ${isLocked ? 'disabled' : ''}" 
          data-team="${game.awayTeam}" 
          data-game-id="${game.id}"
          ${isLocked ? 'disabled title="Game is locked - predictions closed"' : ''}>
          <div class="team-badge" style="background-color: ${awayTeam.color}">${game.awayTeam}</div>
          <div class="team-name">${game.awayTeam}</div>
          <div class="team-record-sub">${awayRecord ? `(${awayRecord})` : ''}</div>
        </button>

        <div class="vs-divider">@</div>

        <!-- Home Team -->
        <button class="team-btn ${pick.winner === game.homeTeam ? 'selected' : ''} ${isLocked ? 'disabled' : ''}" 
          data-team="${game.homeTeam}" 
          data-game-id="${game.id}"
          ${isLocked ? 'disabled title="Game is locked - predictions closed"' : ''}>
          <div class="team-badge" style="background-color: ${homeTeam.color}">${game.homeTeam}</div>
          <div class="team-name">${game.homeTeam}</div>
          <div class="team-record-sub">${homeRecord ? `(${homeRecord})` : ''}</div>
        </button>
      </div>

      <div class="scores-row ${isLocked ? 'disabled' : ''}">
        <div class="score-control">
          <button class="stepper-btn ${isLocked ? 'disabled' : ''}" data-action="dec-away" data-game-id="${game.id}" ${isLocked ? 'disabled' : ''}>−</button>
          <input type="number" class="score-input ${isLocked ? 'disabled' : ''}" data-field="away" data-game-id="${game.id}" value="${pick.awayScore ?? 0}" min="0" max="99" ${isLocked ? 'disabled readonly' : ''} />
          <button class="stepper-btn ${isLocked ? 'disabled' : ''}" data-action="inc-away" data-game-id="${game.id}" ${isLocked ? 'disabled' : ''}>+</button>
        </div>
        <div class="scores-label">${isLocked ? 'LOCKED<br>PICK' : 'PREDICTED<br>SCORE'}</div>
        <div class="score-control">
          <button class="stepper-btn ${isLocked ? 'disabled' : ''}" data-action="dec-home" data-game-id="${game.id}" ${isLocked ? 'disabled' : ''}>−</button>
          <input type="number" class="score-input ${isLocked ? 'disabled' : ''}" data-field="home" data-game-id="${game.id}" value="${pick.homeScore ?? 0}" min="0" max="99" ${isLocked ? 'disabled readonly' : ''} />
          <button class="stepper-btn ${isLocked ? 'disabled' : ''}" data-action="inc-home" data-game-id="${game.id}" ${isLocked ? 'disabled' : ''}>+</button>
        </div>
      </div>

      ${isFinal ? `
        <div class="actual-result-banner ${pick.winner ? (pick.winner === actual.winner ? 'win' : 'loss') : 'locked-unpicked'}">
          <span>Official: ${game.awayTeam} ${actual.awayScore} - ${actual.homeScore} ${game.homeTeam} (${actual.winner} Win)</span>
          <span style="font-weight:800;">${
            pick.winner
              ? (pick.winner === actual.winner
                  ? (Math.abs((pick.awayScore ?? 0) - actual.awayScore) + Math.abs((pick.homeScore ?? 0) - actual.homeScore) === 0
                      ? `★ EXACT SCORE (+${50 * (pick.multiplier ? 3 : 1)} PTS)`
                      : `+${10 * (pick.multiplier ? 3 : 1)} PTS`)
                  : '0 PTS')
              : 'UNPICKED (0 PTS)'
          }</span>
        </div>
      ` : (isLocked ? `
        <div class="actual-result-banner ${pick.winner ? 'in-progress' : 'locked-unpicked'}">
          <span>🏈 Kickoff Started • Game In Progress</span>
          <span style="font-weight:800;">${
            pick.winner
              ? `LOCKED PICK: ${pick.winner} (${pick.awayScore ?? 0} - ${pick.homeScore ?? 0})`
              : 'LOCKED / UNPICKED (0 PTS)'
          }</span>
        </div>
      ` : '')}
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
      if (isGameLocked(gameId)) return;
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
      if (isGameLocked(gameId)) return;
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
      if (isGameLocked(gameId)) return;
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
      if (isGameLocked(gameId)) return;
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
        if (AppState.userPicks[g.id]?.multiplier) multSet = true;
      });

      const openGames = weekGames.filter(g => !isGameLocked(g.id));

      if (openGames.length === 0) {
        alert('All games for this week are already finalized or locked for kickoff.');
        return;
      }

      openGames.forEach(g => {
        if (!AppState.userPicks[g.id]) {
          AppState.userPicks[g.id] = { winner: '', awayScore: 0, homeScore: 0, multiplier: false };
        }
        if (!AppState.userPicks[g.id].winner) {
          AppState.userPicks[g.id].winner = Math.random() > 0.5 ? g.homeTeam : g.awayTeam;
          AppState.userPicks[g.id].awayScore = commonScores[Math.floor(Math.random() * commonScores.length)];
          AppState.userPicks[g.id].homeScore = commonScores[Math.floor(Math.random() * commonScores.length)];
        }
      });

      if (!multSet && openGames.length > 0) {
        const randIdx = Math.floor(Math.random() * openGames.length);
        AppState.userPicks[openGames[randIdx].id].multiplier = true;
      }

      saveState();
      calculateProjectedStandings();
      renderPicksTab();
    };
  }

  const clearBtn = document.getElementById('btnClearWeek');
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm(`Clear all open predictions for Week ${AppState.currentWeek}? (Locked and finalized games will remain untouched)`)) {
        const weekGames = NFL_2026_SCHEDULE?.schedule?.[`Week ${AppState.currentWeek}`] || [];
        weekGames.forEach(g => {
          if (isGameLocked(g.id)) return;
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

  const actuals = AppState.globalActuals || {};

  for (let w = 1; w <= 18; w++) {
    const games = NFL_2026_SCHEDULE?.schedule?.[`Week ${w}`] || [];
    const weekActuals = actuals[`Week ${w}`] || [];

    games.forEach(g => {
      const act = weekActuals.find(a => a.id === g.id);
      let winner = '';
      let aScore = 0;
      let hScore = 0;

      if (act && act.isFinal && act.winner) {
        winner = act.winner;
        aScore = act.awayScore || 0;
        hScore = act.homeScore || 0;
      } else {
        const pick = AppState.userPicks[g.id];
        if (pick && pick.winner) {
          winner = pick.winner;
          aScore = pick.awayScore || 0;
          hScore = pick.homeScore || 0;
        }
      }

      if (winner) {
        const away = standings[g.awayTeam];
        const home = standings[g.homeTeam];
        const isDiv = away.conf === home.conf && away.div === home.div;

        if (winner === g.awayTeam) {
          away.w++; home.l++;
          if (isDiv) { away.divW++; home.divL++; }
        } else if (winner === g.homeTeam) {
          home.w++; away.l++;
          if (isDiv) { home.divW++; away.divL++; }
        }

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
    const actuals = AppState.globalActuals || {};

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
              const err = Math.abs((p.awayScore ?? 0) - a.awayScore) + Math.abs((p.homeScore ?? 0) - a.homeScore);
              if (err === 0) {
                points += (40 * mult);
              }
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

    const memberStats = activeLeague.members.map(m => {
      const mPicks = (AppState.currentUser && m === AppState.currentUser.username)
        ? AppState.userPicks
        : (AppState.accounts[m]?.picks || {});
      let pts = 0, mWins = 0, mTotal = 0;

      for (let w = 1; w <= 18; w++) {
        const list = actuals[`Week ${w}`] || [];
        list.forEach(a => {
          if (a.isFinal && a.winner) {
            const p = mPicks[a.id];
            if (p && p.winner) {
              mTotal++;
              if (p.winner === a.winner) {
                mWins++;
                const mult = p.multiplier ? 3 : 1;
                pts += (10 * mult);
                const err = Math.abs((p.awayScore ?? 0) - a.awayScore) + Math.abs((p.homeScore ?? 0) - a.homeScore);
                if (err === 0) pts += (40 * mult);
              }
            }
          }
        });
      }

      return {
        username: m,
        wins: mWins,
        total: mTotal,
        losses: mTotal - mWins,
        pctDisplay: mTotal > 0 ? `${Math.round((mWins / mTotal) * 100)}%` : '—',
        points: pts
      };
    });

    memberStats.sort((a, b) => b.points - a.points || b.wins - a.wins);

    if (container) {
      container.innerHTML = memberStats.map((st, idx) => `
        <tr>
          <td>#${idx + 1}</td>
          <td style="font-weight:700;">${st.username} ${st.username === currentDisplayName ? '(You)' : ''}</td>
          <td>${st.wins} - ${st.losses}</td>
          <td>${st.pctDisplay}</td>
          <td style="text-align:right;font-weight:900;color:var(--accent-green);">${st.points}</td>
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

// =========================================================
// ADMIN OFFICIAL SCOREKEEPER TOOL
// =========================================================

window.openAdminScorekeeperModal = function() {
  if (!isUserAdmin()) {
    alert('Access Denied: The Official Scorekeeper portal is restricted to the Commissioner / Admin.');
    return;
  }

  const modal = document.getElementById('adminScorekeeperModal');
  const select = document.getElementById('scorekeeperWeekSelect');
  if (select) {
    select.innerHTML = '';
    for (let w = 1; w <= 18; w++) {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = `Week ${w}`;
      if (w === (AppState.scorekeeperWeek || AppState.currentWeek || 1)) {
        opt.selected = true;
      }
      select.appendChild(opt);
    }
  }

  AppState.scorekeeperWeek = parseInt(select?.value) || AppState.currentWeek || 1;
  renderScorekeeperGames(AppState.scorekeeperWeek);

  if (modal) modal.classList.add('open');
};

window.closeAdminScorekeeperModal = function(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains('close-btn')) return;
  const modal = document.getElementById('adminScorekeeperModal');
  if (modal) modal.classList.remove('open');
};

window.setScorekeeperFilter = function(filter) {
  AppState.scorekeeperFilter = filter;
  const allBtn = document.getElementById('filterAllGames');
  const pendBtn = document.getElementById('filterPendingGames');
  const liveBtn = document.getElementById('filterLiveGames');
  const finBtn = document.getElementById('filterFinalGames');

  if (allBtn) allBtn.className = `btn-sm ${filter === 'all' ? 'primary' : ''}`;
  if (pendBtn) pendBtn.className = `btn-sm ${filter === 'pending' ? 'primary' : ''}`;
  if (liveBtn) liveBtn.className = `btn-sm ${filter === 'live' ? 'primary' : ''}`;
  if (finBtn) finBtn.className = `btn-sm ${filter === 'final' ? 'primary' : ''}`;

  renderScorekeeperGames(AppState.scorekeeperWeek);
};

window.renderScorekeeperGames = function(weekVal) {
  const weekNum = parseInt(weekVal) || AppState.scorekeeperWeek || 1;
  AppState.scorekeeperWeek = weekNum;

  const container = document.getElementById('scorekeeperGamesList');
  if (!container) return;

  const weekKey = `Week ${weekNum}`;
  const schedGames = NFL_2026_SCHEDULE?.schedule?.[weekKey] || [];
  const weekActuals = AppState.globalActuals[weekKey] || [];

  const filtered = schedGames.filter(g => {
    const act = weekActuals.find(a => a.id === g.id) || { isFinal: false, isLocked: false };
    if (AppState.scorekeeperFilter === 'pending') return !act.isFinal && !act.isLocked;
    if (AppState.scorekeeperFilter === 'live') return act.isLocked && !act.isFinal;
    if (AppState.scorekeeperFilter === 'final') return act.isFinal;
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.85rem;">No games found matching "${AppState.scorekeeperFilter}" for Week ${weekNum}.</div>`;
    return;
  }

  container.innerHTML = filtered.map(game => {
    let act = weekActuals.find(a => a.id === game.id);
    if (!act) {
      act = { id: game.id, matchup: game.matchup, awayScore: null, homeScore: null, winner: '', isLocked: false, isFinal: false };
      weekActuals.push(act);
    }

    const awayTeam = NFL_TEAMS[game.awayTeam] || { name: game.awayTeam, color: '#2a3b50' };
    const homeTeam = NFL_TEAMS[game.homeTeam] || { name: game.homeTeam, color: '#2a3b50' };

    let statusBadgeHtml = '';
    if (act.isFinal) {
      statusBadgeHtml = `<span id="status-badge-${game.id}" class="status-indicator final">FINAL</span>`;
    } else if (act.isLocked) {
      statusBadgeHtml = `<span id="status-badge-${game.id}" class="status-indicator live">🔒 LOCKED (LIVE)</span>`;
    } else {
      statusBadgeHtml = `<span id="status-badge-${game.id}" class="status-indicator pending">PENDING</span>`;
    }

    return `
      <div class="scorekeeper-card" style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:10px;overflow:hidden;">
        <div class="admin-card-header">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-weight:700;color:var(--text-main);">${game.matchup}</span>
            <span style="color:var(--text-muted);font-size:0.75rem;">${game.dateTime || `Game ${game.gameNum}`}</span>
          </div>
          ${statusBadgeHtml}
        </div>

        <div class="scorekeeper-row" style="padding:12px;background:var(--bg-card);">
          <div class="scorekeeper-team away" style="display:flex;align-items:center;gap:10px;">
            <div class="team-badge" style="background-color:${awayTeam.color};font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.85rem;">${game.awayTeam}</div>
            <div style="flex:1;">
              <div style="font-size:0.85rem;font-weight:700;">${awayTeam.name}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Away</div>
            </div>
            <input type="number" min="0" max="99" class="scorekeeper-input" id="away-score-${game.id}" 
              value="${act.awayScore !== null && act.awayScore !== undefined ? act.awayScore : ''}" 
              placeholder="0"
              oninput="updateScorekeeperScore(${weekNum}, '${game.id}', 'away', this.value)"
              onchange="updateScorekeeperScore(${weekNum}, '${game.id}', 'away', this.value)" />
          </div>

          <div style="font-weight:800;color:var(--text-muted);font-size:0.9rem;padding:0 8px;">@</div>

          <div class="scorekeeper-team home" style="display:flex;align-items:center;gap:10px;flex-direction:row-reverse;text-align:right;">
            <div class="team-badge" style="background-color:${homeTeam.color};font-weight:800;padding:4px 8px;border-radius:6px;font-size:0.85rem;">${game.homeTeam}</div>
            <div style="flex:1;">
              <div style="font-size:0.85rem;font-weight:700;">${homeTeam.name}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">Home</div>
            </div>
            <input type="number" min="0" max="99" class="scorekeeper-input" id="home-score-${game.id}" 
              value="${act.homeScore !== null && act.homeScore !== undefined ? act.homeScore : ''}" 
              placeholder="0"
              oninput="updateScorekeeperScore(${weekNum}, '${game.id}', 'home', this.value)"
              onchange="updateScorekeeperScore(${weekNum}, '${game.id}', 'home', this.value)" />
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--bg-secondary);border-top:1px solid var(--border-color);flex-wrap:wrap;gap:12px;">
          <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;">
            <span style="color:var(--text-muted);font-weight:600;">Winner:</span>
            <select id="winner-select-${game.id}" class="form-input" style="width:auto;padding:4px 10px;font-size:0.82rem;" onchange="updateScorekeeperWinner(${weekNum}, '${game.id}', this.value)">
              <option value="" ${!act.winner ? 'selected' : ''}>-- Auto / Unset --</option>
              <option value="${game.awayTeam}" ${act.winner === game.awayTeam ? 'selected' : ''}>${game.awayTeam} (${awayTeam.name})</option>
              <option value="${game.homeTeam}" ${act.winner === game.homeTeam ? 'selected' : ''}>${game.homeTeam} (${homeTeam.name})</option>
              <option value="TIE" ${act.winner === 'TIE' ? 'selected' : ''}>TIE</option>
            </select>
          </div>

          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <label style="display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;user-select:none;" title="Lock predictions for this game at kickoff">
              <input type="checkbox" id="lock-checkbox-${game.id}" ${act.isLocked || act.isFinal ? 'checked' : ''} onchange="toggleScorekeeperLock(${weekNum}, '${game.id}', this.checked)" style="width:16px;height:16px;cursor:pointer;" />
              <span style="font-weight:700;color:${act.isLocked || act.isFinal ? 'var(--accent-gold)' : 'var(--text-muted)'};" id="lock-label-${game.id}">
                🔒 Lock Picks (Kickoff)
              </span>
            </label>

            <label style="display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;cursor:pointer;user-select:none;" title="Mark this game result as official final and score points">
              <input type="checkbox" id="final-checkbox-${game.id}" ${act.isFinal ? 'checked' : ''} onchange="toggleScorekeeperFinal(${weekNum}, '${game.id}', this.checked)" style="width:16px;height:16px;cursor:pointer;" />
              <span style="font-weight:700;color:${act.isFinal ? 'var(--accent-green)' : 'var(--text-muted)'};" id="final-label-${game.id}">
                Mark as Official Final
              </span>
            </label>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.toggleScorekeeperLock = function(weekNum, gameId, isLocked) {
  const weekKey = `Week ${weekNum}`;
  let actual = AppState.globalActuals[weekKey]?.find(g => g.id === gameId);
  if (!actual) return;

  actual.isLocked = isLocked;

  // If unlocking, and it was marked final, unmark final as well
  if (!isLocked && actual.isFinal) {
    actual.isFinal = false;
    const finalBox = document.getElementById(`final-checkbox-${gameId}`);
    const finalLbl = document.getElementById(`final-label-${gameId}`);
    if (finalBox) finalBox.checked = false;
    if (finalLbl) finalLbl.style.color = 'var(--text-muted)';
  }

  const badge = document.getElementById(`status-badge-${gameId}`);
  const lockLabel = document.getElementById(`lock-label-${gameId}`);

  if (badge) {
    if (actual.isFinal) {
      badge.className = 'status-indicator final';
      badge.textContent = 'FINAL';
    } else if (actual.isLocked) {
      badge.className = 'status-indicator live';
      badge.textContent = '🔒 LOCKED (LIVE)';
    } else {
      badge.className = 'status-indicator pending';
      badge.textContent = 'PENDING';
    }
  }

  if (lockLabel) {
    lockLabel.style.color = (actual.isLocked || actual.isFinal) ? 'var(--accent-gold)' : 'var(--text-muted)';
  }
};

window.batchToggleWeekLock = function(lockAll) {
  const weekNum = AppState.scorekeeperWeek || 1;
  const weekKey = `Week ${weekNum}`;
  const weekActuals = AppState.globalActuals[weekKey] || [];
  const schedGames = NFL_2026_SCHEDULE?.schedule?.[weekKey] || [];

  let count = 0;
  schedGames.forEach(game => {
    let act = weekActuals.find(a => a.id === game.id);
    if (!act) {
      act = { id: game.id, matchup: game.matchup, awayScore: null, homeScore: null, winner: '', isLocked: false, isFinal: false };
      weekActuals.push(act);
    }
    // Only alter games that are not already finalized
    if (!act.isFinal) {
      act.isLocked = lockAll;
      count++;
    }
  });

  renderScorekeeperGames(weekNum);

  const toast = document.getElementById('scorekeeperStatusToast');
  if (toast) {
    toast.textContent = lockAll 
      ? `🔒 Locked ${count} pending/live game(s) for Week ${weekNum}. Predictions are closed!` 
      : `🔓 Unlocked ${count} non-final game(s) for Week ${weekNum}. Predictions reopened.`;
    setTimeout(() => {
      if (toast) toast.textContent = '';
    }, 3500);
  }
};

window.updateScorekeeperScore = function(weekNum, gameId, field, val) {
  const weekKey = `Week ${weekNum}`;
  if (!AppState.globalActuals[weekKey]) AppState.globalActuals[weekKey] = [];
  
  let actual = AppState.globalActuals[weekKey].find(g => g.id === gameId);
  const sched = (NFL_2026_SCHEDULE?.schedule?.[weekKey] || []).find(g => g.id === gameId);

  if (!actual) {
    actual = {
      id: gameId,
      matchup: sched?.matchup || '',
      awayScore: null,
      homeScore: null,
      winner: '',
      isLocked: false,
      isFinal: false
    };
    AppState.globalActuals[weekKey].push(actual);
  }

  const scoreVal = val === '' ? null : parseInt(val);
  if (field === 'away') actual.awayScore = isNaN(scoreVal) ? null : scoreVal;
  if (field === 'home') actual.homeScore = isNaN(scoreVal) ? null : scoreVal;

  const winnerSelect = document.getElementById(`winner-select-${gameId}`);
  if (actual.awayScore !== null && actual.homeScore !== null && sched) {
    if (actual.awayScore > actual.homeScore) {
      actual.winner = sched.awayTeam;
    } else if (actual.homeScore > actual.awayScore) {
      actual.winner = sched.homeTeam;
    } else {
      actual.winner = 'TIE';
    }
    if (winnerSelect) winnerSelect.value = actual.winner;
  }
};

window.updateScorekeeperWinner = function(weekNum, gameId, winnerVal) {
  const weekKey = `Week ${weekNum}`;
  let actual = AppState.globalActuals[weekKey]?.find(g => g.id === gameId);
  if (actual) {
    actual.winner = winnerVal;
  }
};

window.toggleScorekeeperFinal = function(weekNum, gameId, isFinal) {
  const weekKey = `Week ${weekNum}`;
  let actual = AppState.globalActuals[weekKey]?.find(g => g.id === gameId);
  const sched = (NFL_2026_SCHEDULE?.schedule?.[weekKey] || []).find(g => g.id === gameId);
  if (!actual) return;

  actual.isFinal = isFinal;
  if (isFinal) {
    actual.isLocked = true;
  }

  if (isFinal && (!actual.winner || actual.winner === '') && sched && actual.awayScore !== null && actual.homeScore !== null) {
    if (actual.awayScore > actual.homeScore) actual.winner = sched.awayTeam;
    else if (actual.homeScore > actual.awayScore) actual.winner = sched.homeTeam;
    else actual.winner = 'TIE';

    const winnerSelect = document.getElementById(`winner-select-${gameId}`);
    if (winnerSelect) winnerSelect.value = actual.winner;
  }

  const badge = document.getElementById(`status-badge-${gameId}`);
  const finalLabel = document.getElementById(`final-label-${gameId}`);
  const lockCheckbox = document.getElementById(`lock-checkbox-${gameId}`);
  const lockLabel = document.getElementById(`lock-label-${gameId}`);

  if (badge) {
    if (isFinal) {
      badge.className = 'status-indicator final';
      badge.textContent = 'FINAL';
    } else if (actual.isLocked) {
      badge.className = 'status-indicator live';
      badge.textContent = '🔒 LOCKED (LIVE)';
    } else {
      badge.className = 'status-indicator pending';
      badge.textContent = 'PENDING';
    }
  }

  if (finalLabel) {
    finalLabel.style.color = isFinal ? 'var(--accent-green)' : 'var(--text-muted)';
  }

  if (lockCheckbox && isFinal) {
    lockCheckbox.checked = true;
  }
  if (lockLabel) {
    lockLabel.style.color = (actual.isLocked || isFinal) ? 'var(--accent-gold)' : 'var(--text-muted)';
  }
};

window.publishAllScorekeeperChanges = function() {
  localStorage.setItem('sp_global_actuals', JSON.stringify(AppState.globalActuals));

  // Re-calculate projected standings and all views
  calculateProjectedStandings();
  renderHomeTab();
  if (AppState.currentTab === 'picks') renderPicksTab();
  if (AppState.currentTab === 'standings') renderStandingsTab();
  if (AppState.currentTab === 'leagues') renderLeaguesTab();

  const toast = document.getElementById('scorekeeperStatusToast');
  if (toast) {
    toast.textContent = '✅ Scores published globally! All leaderboards & tickers updated.';
    setTimeout(() => {
      if (toast) toast.textContent = '';
    }, 3500);
  }

  renderScorekeeperGames(AppState.scorekeeperWeek);
};
