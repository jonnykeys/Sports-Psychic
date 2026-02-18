// Minimal UI interactions and mock data for the Sports Psychic homepage

const navButtons = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('.panel');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('username');
const leagueListEl = document.getElementById('leagueList');
const createLeagueBtn = document.getElementById('createLeagueBtn');
const createLeagueForm = document.getElementById('createLeagueForm');
const joinLeagueBtn = document.getElementById('joinLeagueBtn');
const joinLeagueInput = document.getElementById('joinLeagueName');
const leagueRank = document.getElementById('leagueRank');
const accuracy = document.getElementById('accuracy');
const totalPoints = document.getElementById('totalPoints');
const recentActivity = document.getElementById('recentActivity');

// Mock storage
let user = { name: localStorage.getItem('sp_user') || null };
let leagues = JSON.parse(localStorage.getItem('sp_leagues') || '[]');
let stats = JSON.parse(localStorage.getItem('sp_stats') || 'null') || {rank:'—',accuracy:'—',points:'—',activity:[]};

function showPanel(id){
  panels.forEach(p=> p.id === id ? p.classList.remove('hidden') : p.classList.add('hidden'));
}

navButtons.forEach(btn=> btn.addEventListener('click', ()=> showPanel(btn.dataset.target)));

// Login/create
loginForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = usernameInput.value.trim();
  if(!name) return alert('Please enter a display name');
  user.name = name;
  localStorage.setItem('sp_user', name);
  refreshUI();
  alert(`Welcome, ${name}`);
});
logoutBtn.addEventListener('click', ()=>{
  localStorage.removeItem('sp_user');
  user.name = null; usernameInput.value = '';
  refreshUI();
});

// Leagues
function renderLeagues(){
  leagueListEl.innerHTML = '';
  if(leagues.length === 0) leagueListEl.innerHTML = '<li class="muted">No leagues yet.</li>';
  leagues.forEach((l, i)=>{
    const li = document.createElement('li');
    li.textContent = `${l.name} — ${l.members.length} member(s)`;
    const btn = document.createElement('button'); btn.className='btn'; btn.textContent='Join';
    btn.addEventListener('click', ()=> joinLeague(l.name));
    li.appendChild(btn);
    leagueListEl.appendChild(li);
  });
}

createLeagueBtn.addEventListener('click', ()=>{
  const name = document.getElementById('leagueName').value.trim();
  if(!name) return alert('Enter a league name');
  if(leagues.find(l=>l.name.toLowerCase()===name.toLowerCase())) return alert('League exists');
  leagues.push({name, members: user.name ? [user.name] : []});
  localStorage.setItem('sp_leagues', JSON.stringify(leagues));
  document.getElementById('leagueName').value='';
  renderLeagues();
});

joinLeagueBtn.addEventListener('click', ()=>{
  const name = joinLeagueInput.value.trim();
  if(!name) return alert('Enter a league name to join');
  joinLeague(name);
});

function joinLeague(name){
  const league = leagues.find(l=> l.name.toLowerCase()===name.toLowerCase());
  if(!league) return alert('League not found');
  if(!user.name) return alert('Please sign in first');
  if(!league.members.includes(user.name)) league.members.push(user.name);
  localStorage.setItem('sp_leagues', JSON.stringify(leagues));
  renderLeagues();
  alert(`Joined ${league.name}`);
}

// Dashboard
function renderStats(){
  leagueRank.textContent = stats.rank;
  accuracy.textContent = stats.accuracy;
  totalPoints.textContent = stats.points;
  recentActivity.innerHTML = '';
  stats.activity.forEach(a=>{
    const li = document.createElement('li'); li.textContent = a; recentActivity.appendChild(li);
  });
}

function refreshUI(){
  if(user.name) usernameInput.value = user.name;
  renderLeagues();
  renderStats();
}

// Seed some demo data if empty
if(leagues.length === 0){
  leagues = [
    {name:'Friends League', members:[]},
    {name:'Office Pool', members:[]}
  ];
  localStorage.setItem('sp_leagues', JSON.stringify(leagues));
}
if(stats.points === '—'){
  stats = {rank:'12', accuracy:'68%', points:1240, activity:['Created account','Joined Friends League']};
  localStorage.setItem('sp_stats', JSON.stringify(stats));
}

refreshUI();
