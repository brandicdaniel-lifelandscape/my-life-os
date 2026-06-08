const AREAS = [
  { id: 'self', name: 'Self', emoji: ['🌰','🌱','🌿','🌳'], question: 'Am I connected to myself?', x: 45, y: 73, prompts: ['What gave my body or spirit light today?', 'Where do I need a boundary?', 'What would caring for myself look like today?'] },
  { id: 'purpose', name: 'Purpose', emoji: ['🌰','🌱','🌺','🔥'], question: 'Am I using my gifts?', x: 20, y: 45, prompts: ['What is one small move for Camp, therapy, or speaking?', 'Where am I talking more than doing?', 'What dream wants a first version?'] },
  { id: 'creation', name: 'Creation', emoji: ['🌰','🌱','🌸','🌻'], question: 'What am I making?', x: 67, y: 50, prompts: ['What wants to be made, cooked, sewn, written, or tested?', 'What can be beautiful without becoming expensive?', 'What creative idea needs a container?'] },
  { id: 'tribe', name: 'Tribe', emoji: ['🌰','🌱','🪴','🌲'], question: 'Who am I growing with?', x: 14, y: 69, prompts: ['Who needs love, invitation, or attention?', 'Where do I want to be hosted instead of hosting?', 'What relationship feels nourishing right now?'] },
  { id: 'freedom', name: 'Freedom', emoji: ['⛰️','🏔️','🗻','🌄'], question: 'What options am I creating?', x: 73, y: 70, prompts: ['What move supports my Amazon exit?', 'What is the simplest profitable version?', 'Where am I protecting future freedom?'] },
  { id: 'legacy', name: 'Legacy', emoji: ['🌰','🌱','🌳','🌍'], question: 'What survives my involvement?', x: 45, y: 22, prompts: ['What lesson from the garden am I learning?', 'What idea could become a talk, book, or framework?', 'What impact do I want to leave behind?'] }
];

const STORAGE_KEY = 'theGardenV3';
let state = loadState();
let activeArea = state.activeArea || 'self';

function loadState(){
  const existing = localStorage.getItem(STORAGE_KEY);
  if(existing){ return JSON.parse(existing); }
  return { season: 'Summer', entries: [], activeArea: 'self', lastPromptDate: null };
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function todayKey(){ return new Date().toISOString().slice(0,10); }
function fmtDate(iso){ return new Date(iso).toLocaleString([], { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }); }
function entriesFor(areaId){ return state.entries.filter(e => e.area === areaId); }
function stageFor(areaId){
  const count = entriesFor(areaId).length;
  if(count >= 12) return 3;
  if(count >= 6) return 2;
  if(count >= 1) return 1;
  return 0;
}
function stageName(i){ return ['Seed','Sprout','Blooming','Rooted'][i]; }

function renderGarden(){
  const map = document.getElementById('gardenMap');
  map.innerHTML = '<div class="sun" aria-hidden="true"></div><div class="you-tree"><div class="canopy">ME<br/>becoming</div><div class="trunk"></div></div>';
  AREAS.forEach(area => {
    const stage = stageFor(area.id);
    const btn = document.createElement('button');
    btn.className = 'plant' + (area.id === activeArea ? ' active' : '');
    btn.style.left = area.x + '%';
    btn.style.top = area.y + '%';
    btn.style.transform = 'translate(-50%, -50%)';
    btn.innerHTML = `<div class="plant-emoji">${area.emoji[stage]}</div><div class="plant-name">${area.name}</div><div class="plant-stage">${stageName(stage)}</div><div class="plant-count">${entriesFor(area.id).length} saved</div>`;
    btn.addEventListener('click', () => setActive(area.id));
    map.appendChild(btn);
  });
}
function setActive(areaId){
  activeArea = areaId;
  state.activeArea = areaId;
  saveState();
  const area = AREAS.find(a => a.id === areaId);
  document.getElementById('activeTitle').textContent = area.name;
  document.getElementById('activeQuestion').textContent = area.question;
  document.getElementById('activeGrowth').textContent = stageName(stageFor(areaId));
  document.getElementById('entryFilter').value = areaId;
  renderGarden(); renderEntries();
}
function renderFilters(){
  const filter = document.getElementById('entryFilter');
  filter.innerHTML = '<option value="All">All areas</option>' + AREAS.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
}
function renderEntries(){
  const list = document.getElementById('entriesList');
  const filter = document.getElementById('entryFilter').value || 'All';
  const entries = state.entries.filter(e => filter === 'All' || e.area === filter).slice().reverse();
  if(!entries.length){ list.innerHTML = '<p class="soft">No saved entries yet. Choose a plant, write something, and save it.</p>'; return; }
  list.innerHTML = '';
  entries.forEach(entry => {
    const area = AREAS.find(a => a.id === entry.area);
    const item = document.createElement('article');
    item.className = 'entry';
    item.innerHTML = `<div class="entry-meta"><strong>${area.name} · ${entry.type}</strong><span>${fmtDate(entry.createdAt)}</span></div><p>${escapeHtml(entry.text)}</p><button class="secondary" data-delete="${entry.id}">Delete</button>`;
    list.appendChild(item);
  });
  list.querySelectorAll('[data-delete]').forEach(btn => btn.addEventListener('click', () => {
    state.entries = state.entries.filter(e => e.id !== btn.dataset.delete);
    saveState(); renderGarden(); renderEntries(); setActive(activeArea);
  }));
}
function saveEntry(areaId, text, type='Reflection'){
  if(!text.trim()) return;
  state.entries.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), area: areaId, type, text: text.trim(), createdAt: new Date().toISOString() });
  saveState(); renderGarden(); renderEntries(); setActive(areaId);
}
function renderPrompts(containerId, randomize=false){
  const container = document.getElementById(containerId);
  let chosen = [...AREAS];
  if(randomize) chosen = chosen.sort(() => Math.random() - 0.5);
  chosen = chosen.slice(0,3);
  container.innerHTML = '';
  chosen.forEach(area => {
    const prompt = area.prompts[Math.floor(Math.random() * area.prompts.length)];
    const card = document.createElement('div');
    card.className = 'prompt-card';
    card.innerHTML = `<strong>${area.emoji[stageFor(area.id)]} ${area.name}</strong><span>${prompt}</span><textarea placeholder="Answer for ${area.name}..."></textarea><button class="primary">Save to ${area.name}</button>`;
    card.querySelector('button').addEventListener('click', () => {
      const text = card.querySelector('textarea').value;
      saveEntry(area.id, `${prompt}\n\n${text}`, 'Daily Prompt');
      card.querySelector('textarea').value = '';
    });
    container.appendChild(card);
  });
}
function escapeHtml(text){ return text.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function exportBackup(){
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `the-garden-backup-${todayKey()}.json`; a.click(); URL.revokeObjectURL(url);
}
function maybeShowDailyPrompt(){
  if(state.lastPromptDate !== todayKey()){
    state.lastPromptDate = todayKey(); saveState();
    openPromptModal();
  }
}
function openPromptModal(){
  renderPrompts('modalPrompts', true);
  document.getElementById('promptModal').classList.add('show');
  document.getElementById('promptModal').setAttribute('aria-hidden','false');
}
function closePromptModal(){
  document.getElementById('promptModal').classList.remove('show');
  document.getElementById('promptModal').setAttribute('aria-hidden','true');
}

function init(){
  renderFilters();
  document.getElementById('seasonSelect').value = state.season || 'Summer';
  document.getElementById('seasonSelect').addEventListener('change', e => { state.season = e.target.value; saveState(); });
  document.getElementById('saveEntryBtn').addEventListener('click', () => {
    const text = document.getElementById('entryText').value;
    const type = document.getElementById('entryType').value;
    saveEntry(activeArea, text, type);
    document.getElementById('entryText').value = '';
  });
  document.getElementById('entryFilter').addEventListener('change', renderEntries);
  document.getElementById('exportBtn').addEventListener('click', exportBackup);
  document.getElementById('dailyPromptBtn').addEventListener('click', openPromptModal);
  document.getElementById('newPromptBtn').addEventListener('click', () => renderPrompts('dailyPrompts', true));
  document.getElementById('closeModalBtn').addEventListener('click', closePromptModal);
  document.getElementById('promptModal').addEventListener('click', e => { if(e.target.id === 'promptModal') closePromptModal(); });
  renderPrompts('dailyPrompts', true);
  setActive(activeArea);
  maybeShowDailyPrompt();
}

document.addEventListener('DOMContentLoaded', init);
