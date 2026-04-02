// Minimal UI interactions and mock data for the Sports Psychic pages

document.addEventListener('DOMContentLoaded', () => {
  // highlight active nav link based on file name
  const links = document.querySelectorAll('.main-nav a');
  const current = location.pathname.split('/').pop() || 'AIHomePage.html';
  links.forEach(l => {
    if(l.getAttribute('href') === current) l.classList.add('active');
  });

  // shared state
  let user = { name: localStorage.getItem('sp_user') || null };
  let leagues = JSON.parse(localStorage.getItem('sp_leagues') || '[]');
  let stats = JSON.parse(localStorage.getItem('sp_stats') || 'null') || {rank:'—',accuracy:'—',points:'—',activity:[]};

  function saveState(){
    localStorage.setItem('sp_user', user.name || '');
    localStorage.setItem('sp_leagues', JSON.stringify(leagues));
    localStorage.setItem('sp_stats', JSON.stringify(stats));
  }

  // login page logic
  const loginForm = document.getElementById('loginForm');
  if(loginForm){
    const usernameInput = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');

    loginForm.addEventListener('submit', e=>{
      e.preventDefault();
      const name = usernameInput.value.trim();
      if(!name) return alert('Please enter a display name');
      user.name = name;
      saveState();
      alert(`Welcome, ${name}`);
    });

    logoutBtn.addEventListener('click', ()=>{
      user.name = null;
      saveState();
      usernameInput.value = '';
    });

    // prefills
    if(user.name) usernameInput.value = user.name;
  }

  // leagues page logic
  const leagueListEl = document.getElementById('leagueList');
  const createLeagueBtn = document.getElementById('createLeagueBtn');
  const joinLeagueBtn = document.getElementById('joinLeagueBtn');
  const joinLeagueInput = document.getElementById('joinLeagueName');

  function renderLeagues(){
    if(!leagueListEl) return;
    leagueListEl.innerHTML = '';
    if(leagues.length === 0) leagueListEl.innerHTML = '<li class="muted">No leagues yet.</li>';
    leagues.forEach(l=>{
      const li = document.createElement('li');
      li.textContent = `${l.name} — ${l.members.length} member(s)`;
      const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Join';
      btn.addEventListener('click', ()=> joinLeague(l.name));
      li.appendChild(btn);
      leagueListEl.appendChild(li);
    });
  }

  function joinLeague(name){
    const league = leagues.find(l=> l.name.toLowerCase()===name.toLowerCase());
    if(!league) return alert('League not found');
    if(!user.name) return alert('Please sign in first');
    if(!league.members.includes(user.name)) league.members.push(user.name);
    saveState();
    renderLeagues();
    alert(`Joined ${league.name}`);
  }

  if(createLeagueBtn){
    createLeagueBtn.addEventListener('click', ()=>{
      const name = document.getElementById('leagueName').value.trim();
      if(!name) return alert('Enter a league name');
      if(leagues.find(l=>l.name.toLowerCase()===name.toLowerCase())) return alert('League exists');
      leagues.push({name, members: user.name ? [user.name] : []});
      saveState();
      document.getElementById('leagueName').value='';
      renderLeagues();
    });
  }
  if(joinLeagueBtn){
    joinLeagueBtn.addEventListener('click', ()=>{
      const name = joinLeagueInput.value.trim();
      if(!name) return alert('Enter a league name to join');
      joinLeague(name);
    });
  }

  if(leagueListEl){ renderLeagues(); }

  // dashboard page logic
  const leagueRank = document.getElementById('leagueRank');
  const accuracy = document.getElementById('accuracy');
  const totalPoints = document.getElementById('totalPoints');
  const recentActivity = document.getElementById('recentActivity');

  function renderStats(){
    if(leagueRank) leagueRank.textContent = stats.rank;
    if(accuracy) accuracy.textContent = stats.accuracy;
    if(totalPoints) totalPoints.textContent = stats.points;
    if(recentActivity){
      recentActivity.innerHTML = '';
      stats.activity.forEach(a=>{
        const li = document.createElement('li'); li.textContent = a; recentActivity.appendChild(li);
      });
    }
  }

  if(leagueRank) renderStats();

  // home page dashboard logic
  const homeLeaguesList = document.getElementById('homeLeaguesList');
  const homeLeagueCount = document.getElementById('homeLeagueCount');
  const homeRankEl = document.getElementById('homeRank');
  const homeAccuracyEl = document.getElementById('homeAccuracy');
  const homePointsEl = document.getElementById('homePoints');
  const nflUpdatesEl = document.getElementById('nflUpdates');
  const appUpdatesEl = document.getElementById('appUpdates');
  const socialLinksEl = document.getElementById('socialLinks');

  function renderHome(){
    if(homeLeaguesList){
      homeLeaguesList.innerHTML = '';
      // show leagues the user is in, or sample leagues if none
      const userLeagues = user.name ? leagues.filter(l => l.members.includes(user.name)) : [];
      const display = (userLeagues.length ? userLeagues : leagues).slice(0,6);
      display.forEach(l=>{
        const li = document.createElement('li');
        li.textContent = `${l.name} — ${l.members.length} member(s)`;
        homeLeaguesList.appendChild(li);
      });
      if(homeLeagueCount) homeLeagueCount.textContent = `(${userLeagues.length || leagues.length})`;
    }

    if(homeRankEl) homeRankEl.textContent = stats.rank;
    if(homeAccuracyEl) homeAccuracyEl.textContent = stats.accuracy;
    if(homePointsEl) homePointsEl.textContent = stats.points;

    if(nflUpdatesEl){
      const nfl = [
        {team:'Patriots', update:'Win 27-20 vs Jets'},
        {team:'Cowboys', update:'Loss 21-24 at Eagles'},
        {team:'Packers', update:'QB questionable for Sunday'}
      ];
      nflUpdatesEl.innerHTML = '';
      nfl.forEach(u=>{ const li = document.createElement('li'); li.textContent = `${u.team}: ${u.update}`; nflUpdatesEl.appendChild(li); });
    }

    if(appUpdatesEl){
      const updates = [
        'Leaderboard redesign rolling out next week',
        'Mobile push notifications (beta)',
        'New weekly challenge feature coming soon'
      ];
      appUpdatesEl.innerHTML = '';
      updates.forEach(u=>{ const li = document.createElement('li'); li.textContent = u; appUpdatesEl.appendChild(li); });
    }

    if(socialLinksEl){
      const socials = [
        {platform:'Twitter', handle:'@SportsPsychicOfficial'},
        {platform:'Instagram', handle:'@SportsPsychicOfficial'},
        {platform:'Facebook', handle:'SportsPsychicOfficial'}
      ];
      socialLinksEl.innerHTML = '';
      socials.forEach(s=>{ const li = document.createElement('li'); li.innerHTML = `<strong>${s.platform}:</strong> ${s.handle}`; socialLinksEl.appendChild(li); });
    }
+
+    // sidebar scores mock
+    const liveScoresEl = document.getElementById('liveScores');
+    const weekScoresEl = document.getElementById('weekScores');
+    if(liveScoresEl){
+      const live = [
+        'NE 14 - 7 NYJ  (2Q)',
+        'DAL 21 - 24 PHI (3Q)',
+        'GB 3 - 0 MIN  (1Q)'
+      ];
+      liveScoresEl.innerHTML = '';
+      live.forEach(s=>{ const li = document.createElement('li'); li.textContent = s; liveScoresEl.appendChild(li); });
+    }
+    if(weekScoresEl){
+      const week = [
+        'NE vs NYJ 14-7',
+        'DAL vs PHI 21-24',
+        'GB vs MIN 3-0'
+      ];
+      weekScoresEl.innerHTML = '';
+      week.forEach(s=>{ const li = document.createElement('li'); li.textContent = s; weekScoresEl.appendChild(li); });
+    }
  }

  // render home if any home elements exist
  if(document.getElementById('home') || homeLeaguesList) renderHome();

  // seed some demo data if empty
  if(leagues.length === 0){
    leagues = [
      {name:'Friends League', members:[]},
      {name:'Office Pool', members:[]}
    ];
  }
  if(stats.points === '—'){
    stats = {rank:'12', accuracy:'68%', points:1240, activity:['Created account','Joined Friends League']};
  }
  saveState();
});
