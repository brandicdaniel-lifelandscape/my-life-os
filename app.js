const STORAGE_KEY = 'the-garden-v2';
const ENTRY_KEY = 'the-garden-v2-entries';

const seasons = [
  { name: 'Spring', question: 'What am I growing?' },
  { name: 'Summer', question: 'What am I expanding?' },
  { name: 'Fall', question: 'What am I harvesting?' },
  { name: 'Winter', question: 'What am I releasing and reimagining?' }
];

const defaultState = {
  seasonIndex: 1,
  beds: [
    { id:'self', icon:'🌱', name:'Self', question:'Am I connected to myself?', score:7, prompt:'Health, energy, joy, identity, boundaries. Protect the source.' },
    { id:'purpose', icon:'🔥', name:'Purpose', question:'Am I using my gifts?', score:8, prompt:'Camp, therapy, speaking, future apps. Vehicles for impact.' },
    { id:'creation', icon:'🎨', name:'Creation', question:'What am I making?', score:7, prompt:'Cookbook, dinner series, sewing, writing, business ideas.' },
    { id:'tribe', icon:'🤝', name:'Tribe', question:'Who am I growing with?', score:8, prompt:'Friends, family, community, and future romantic partnership.' },
    { id:'freedom', icon:'🕊️', name:'Freedom', question:'What options am I creating?', score:6, prompt:'Amazon exit, investments, savings, additional homes, travel freedom.' },
    { id:'legacy', icon:'🌍', name:'Legacy', question:'What survives my involvement?', score:5, prompt:'Camp expansion, books, teaching, speaking, frameworks, ideas that outlive effort.' }
  ],
  moves: [
    { text:'Ship one visible thing for Camp', done:false },
    { text:'Protect body and energy', done:false },
    { text:'Take one Amazon exit step', done:false },
    { text:'Create something for cookbook / dinner / sewing', done:false },
    { text:'Nurture one relationship', done:false }
  ],
  questions: [
    'How do I leave corporate America intentionally?',
    'What can Amazon still teach me before I leave?',
    'What is the smallest profitable Camp?',
    'How can Camp support me through school?',
    'What kind of therapist am I becoming?',
    'How do I attract partnership without chasing it?',
    'How do I create meaningful community I can rely on?'
  ]
};

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultState;
let entries = JSON.parse(localStorage.getItem(ENTRY_KEY) || 'null') || {};
let activeBedId = null;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function saveEntries(){ localStorage.setItem(ENTRY_KEY, JSON.stringify(entries)); }
function $(id){ return document.getElementById(id); }
function entryId(){ return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function formatDate(iso){ return new Date(iso).toLocaleString([], { month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit' }); }
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }

function renderSeason(){
  const season = seasons[state.seasonIndex];
  $('seasonName').textContent = season.name;
  $('seasonQuestion').textContent = season.question;
}

function renderBeds(){
  $('beds').innerHTML = state.beds.map(b => `
    <div class="bed" data-id="${b.id}">
      <div class="icon">${b.icon}</div>
      <h3>${b.name}</h3>
      <p>${b.question}</p>
      <span class="score">Alignment ${b.score}/10</span>
    </div>
  `).join('');
  document.querySelectorAll('.bed').forEach(el => el.addEventListener('click', () => openBed(el.dataset.id)));
}

function renderMoves(){
  $('movesList').innerHTML = state.moves.map((m,i) => `
    <div class="move">
      <input type="checkbox" ${m.done?'checked':''} data-move-check="${i}">
      <input type="text" value="${escapeHtml(m.text)}" data-move-text="${i}">
      <button class="delete" data-move-delete="${i}">×</button>
    </div>
  `).join('');
}

function renderQuestions(){
  $('questionsList').innerHTML = state.questions.map((q,i) => `
    <div class="question">
      <span>?</span>
      <input value="${escapeHtml(q)}" data-question-text="${i}">
      <button class="delete" data-question-delete="${i}">×</button>
    </div>
  `).join('');
}

function renderAlignment(){
  $('alignmentList').innerHTML = state.beds.map((b,i) => `
    <div class="alignment-row">
      <strong>${b.name}</strong>
      <input type="range" min="1" max="10" value="${b.score}" data-score="${i}">
      <span>${b.score}</span>
    </div>
  `).join('');
}

function upgradeTextareasToEntries(){
  document.querySelectorAll('textarea[data-key]').forEach(t => {
    if (t.dataset.entryReady) return;
    const key = t.dataset.key;
    const defaultText = t.value.trim();
    t.value = '';
    t.placeholder = defaultText || 'Write a new entry...';
    t.classList.add('entry-input');
    t.dataset.entryReady = 'true';

    const actions = document.createElement('div');
    actions.className = 'entry-actions';
    actions.innerHTML = `<button type="button" class="save-entry" data-save-entry="${key}">Save entry</button>`;

    const list = document.createElement('div');
    list.className = 'saved-entries';
    list.dataset.entryList = key;

    t.insertAdjacentElement('afterend', actions);
    actions.insertAdjacentElement('afterend', list);
    renderEntryList(key);
  });
}

function addEntry(key, text){
  const trimmed = text.trim();
  if(!trimmed) return;
  entries[key] = entries[key] || [];
  entries[key].unshift({ id: entryId(), text: trimmed, createdAt: new Date().toISOString() });
  saveEntries();
  renderEntryList(key);
}

function deleteEntry(key, id){
  entries[key] = (entries[key] || []).filter(e => e.id !== id);
  saveEntries();
  renderEntryList(key);
}

function renderEntryList(key){
  document.querySelectorAll(`[data-entry-list="${key}"]`).forEach(list => {
    const data = entries[key] || [];
    list.innerHTML = data.length ? data.map(e => `
      <article class="saved-entry">
        <header>
          <time>${formatDate(e.createdAt)}</time>
          <button type="button" class="delete-entry" data-delete-entry="${key}" data-entry-id="${e.id}">×</button>
        </header>
        <p>${escapeHtml(e.text)}</p>
      </article>
    `).join('') : `<p class="hint">No saved entries yet.</p>`;
  });
}

function openBed(id){
  activeBedId = id;
  const bed = state.beds.find(b => b.id === id);
  $('modalTitle').textContent = `${bed.icon} ${bed.name}`;
  $('modalQuestion').textContent = bed.question;
  $('modalNotes').value = '';
  $('modalNotes').placeholder = bed.prompt || 'Write a new entry...';
  renderModalEntries();
  $('bedDialog').showModal();
}

function renderModalEntries(){
  const key = `bed-${activeBedId}`;
  const data = entries[key] || [];
  $('modalEntries').innerHTML = data.length ? data.map(e => `
    <article class="saved-entry">
      <header>
        <time>${formatDate(e.createdAt)}</time>
        <button type="button" class="delete-entry" data-delete-entry="${key}" data-entry-id="${e.id}">×</button>
      </header>
      <p>${escapeHtml(e.text)}</p>
    </article>
  `).join('') : `<p class="hint">No saved entries yet for this garden bed.</p>`;
}

function wireEvents(){
  document.body.addEventListener('input', e => {
    if(e.target.dataset.moveText){ state.moves[+e.target.dataset.moveText].text = e.target.value; save(); }
    if(e.target.dataset.questionText){ state.questions[+e.target.dataset.questionText] = e.target.value; save(); }
    if(e.target.dataset.score){ state.beds[+e.target.dataset.score].score = +e.target.value; save(); renderBeds(); renderAlignment(); }
  });

  document.body.addEventListener('change', e => {
    if(e.target.dataset.moveCheck){ state.moves[+e.target.dataset.moveCheck].done = e.target.checked; save(); }
  });

  document.body.addEventListener('click', e => {
    if(e.target.dataset.moveDelete){ state.moves.splice(+e.target.dataset.moveDelete,1); save(); renderMoves(); }
    if(e.target.dataset.questionDelete){ state.questions.splice(+e.target.dataset.questionDelete,1); save(); renderQuestions(); }
    if(e.target.dataset.saveEntry){
      const key = e.target.dataset.saveEntry;
      const textarea = document.querySelector(`textarea[data-key="${key}"]`);
      addEntry(key, textarea.value);
      textarea.value = '';
    }
    if(e.target.dataset.deleteEntry){
      deleteEntry(e.target.dataset.deleteEntry, e.target.dataset.entryId);
      if(e.target.dataset.deleteEntry.startsWith('bed-')) renderModalEntries();
    }
  });

  $('seasonBtn').addEventListener('click', () => { state.seasonIndex = (state.seasonIndex + 1) % seasons.length; save(); renderSeason(); });
  $('addMove').addEventListener('click', () => { state.moves.push({text:'New aligned move',done:false}); save(); renderMoves(); });
  $('addQuestion').addEventListener('click', () => { state.questions.push('What question am I living now?'); save(); renderQuestions(); });
  $('saveBed').addEventListener('click', () => {
    const key = `bed-${activeBedId}`;
    addEntry(key, $('modalNotes').value);
    $('modalNotes').value = '';
    renderModalEntries();
  });
  $('resetBtn').addEventListener('click', () => {
    if(confirm('Reset the Garden to demo data? This also clears saved entries.')){
      localStorage.clear();
      state = structuredClone ? structuredClone(defaultState) : JSON.parse(JSON.stringify(defaultState));
      entries = {};
      save();
      saveEntries();
      location.reload();
    }
  });
}

function init(){
  renderSeason();
  renderBeds();
  renderMoves();
  renderQuestions();
  renderAlignment();
  upgradeTextareasToEntries();
}

wireEvents();
init();
