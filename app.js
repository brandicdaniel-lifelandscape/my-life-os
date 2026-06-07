const STORAGE_KEY = 'the-garden-v2';
const seasons = [
  { name: 'Spring', question: 'What am I growing?' },
  { name: 'Summer', question: 'What am I expanding?' },
  { name: 'Fall', question: 'What am I harvesting?' },
  { name: 'Winter', question: 'What am I releasing and reimagining?' }
];

const defaultState = {
  seasonIndex: 1,
  beds: [
    { id:'self', icon:'🌱', name:'Self', question:'Am I connected to myself?', score:7, notes:'Health, energy, joy, identity, boundaries. Protect the source.' },
    { id:'purpose', icon:'🔥', name:'Purpose', question:'Am I using my gifts?', score:8, notes:'Camp, therapy, speaking, future apps. Vehicles for impact.' },
    { id:'creation', icon:'🎨', name:'Creation', question:'What am I making?', score:7, notes:'Cookbook, dinner series, sewing, writing, business ideas.' },
    { id:'tribe', icon:'🤝', name:'Tribe', question:'Who am I growing with?', score:8, notes:'Friends, family, community, and future romantic partnership.' },
    { id:'freedom', icon:'🕊️', name:'Freedom', question:'What options am I creating?', score:6, notes:'Amazon exit, investments, savings, additional homes, travel freedom.' },
    { id:'legacy', icon:'🌍', name:'Legacy', question:'What survives my involvement?', score:5, notes:'Camp expansion, books, teaching, speaking, frameworks, ideas that outlive effort.' }
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
let activeBedId = null;

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function $(id){ return document.getElementById(id); }

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

function openBed(id){
  activeBedId = id;
  const bed = state.beds.find(b => b.id === id);
  $('modalTitle').textContent = `${bed.icon} ${bed.name}`;
  $('modalQuestion').textContent = bed.question;
  $('modalNotes').value = bed.notes;
  $('bedDialog').showModal();
}

function wireEvents(){
  document.body.addEventListener('input', e => {
    const key = e.target.dataset.key;
    if(key){ localStorage.setItem(`garden-field-${key}`, e.target.value); }
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
  });
  $('seasonBtn').addEventListener('click', () => { state.seasonIndex = (state.seasonIndex + 1) % seasons.length; save(); renderSeason(); });
  $('addMove').addEventListener('click', () => { state.moves.push({text:'New aligned move',done:false}); save(); renderMoves(); });
  $('addQuestion').addEventListener('click', () => { state.questions.push('What question am I living now?'); save(); renderQuestions(); });
  $('saveBed').addEventListener('click', () => { const bed = state.beds.find(b => b.id === activeBedId); bed.notes = $('modalNotes').value; save(); });
  $('resetBtn').addEventListener('click', () => { if(confirm('Reset the Garden to demo data?')){ localStorage.clear(); state = defaultState; init(); }});
}

function loadTextareas(){
  document.querySelectorAll('textarea[data-key]').forEach(t => {
    const saved = localStorage.getItem(`garden-field-${t.dataset.key}`);
    if(saved !== null) t.value = saved;
    t.addEventListener('input', () => localStorage.setItem(`garden-field-${t.dataset.key}`, t.value));
  });
}

function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }

function init(){ renderSeason(); renderBeds(); renderMoves(); renderQuestions(); renderAlignment(); loadTextareas(); }
wireEvents();
init();
