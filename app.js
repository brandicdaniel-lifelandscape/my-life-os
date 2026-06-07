const seasons = {
  Spring: { question: "What am I growing?", accent: "#7b8f56" },
  Summer: { question: "What am I expanding?", accent: "#d08a3f" },
  Fall: { question: "What am I harvesting?", accent: "#9b5b3e" },
  Winter: { question: "What am I releasing and reimagining?", accent: "#64748b" }
};

const defaultState = {
  season: "Spring",
  northStarTitle: "Creating spaces where people reconnect with themselves.",
  northStarBody: "A spacious, creative, financially secure life where Camp, therapy, health, relationships, and joy all grow from the same root.",
  weeklyFocusTitle: "Most Important Moves",
  weekly: ["Move Camp one step forward", "Protect my body and energy", "Do one thing that supports my Amazon exit"],
  seasonNotes: "",
  branches: [
    { id: "camp", title: "Camp", subtitle: "Retreats, curriculum, community", growth: 34, purpose: "Build restorative spaces for mothers to reconnect with self before motherhood consumed the whole identity.", projects: "Pilot retreat\nCurriculum\nPricing model\nProperty vision", milestones: "First pilot planned\nFirst retreat sold out\nFirst profitable year", notes: "" },
    { id: "therapy", title: "Therapist", subtitle: "School, licensure, clinical path", growth: 22, purpose: "Become trained to support healing with depth, ethics, and skill.", projects: "School research\nLicensure map\nPractice model", milestones: "Choose program\nEnroll\nComplete practicum\nLicensed", notes: "" },
    { id: "health", title: "Self", subtitle: "Health, energy, spirit", growth: 48, purpose: "Feel strong, light, regulated, and present in my own life.", projects: "Fitness rhythm\nMeal system\nSleep and recovery", milestones: "Consistent workouts\nWeight goal\nBetter sleep", notes: "" },
    { id: "money", title: "Financial Freedom", subtitle: "Income, savings, exit plan", growth: 28, purpose: "Buy options, time, and peace for the life I am building.", projects: "Amazon exit strategy\nSavings plan\nSchool cost model\nCamp revenue", milestones: "$100K bridge plan\nDebt/savings targets\nCorporate exit", notes: "" },
    { id: "create", title: "Creativity", subtitle: "Cookbook, dinners, sewing", growth: 41, purpose: "Keep joy, beauty, taste, and expression alive as serious parts of the plan.", projects: "Seasoned Light\nCookbook\nSewing projects", milestones: "Summer dinner\nCookbook theme\nFirst printed recipe set", notes: "" },
    { id: "relationships", title: "Relationships", subtitle: "Friends, family, love, community", growth: 36, purpose: "Build and protect a life with real connection and mutual care.", projects: "Social rhythm\nDinner series\nQuality time", milestones: "Monthly gathering\nDeeper friendships\nPartnership clarity", notes: "" }
  ]
};

let state = JSON.parse(localStorage.getItem("lifeLandscape")) || defaultState;
let activeBranchId = null;

function save() { localStorage.setItem("lifeLandscape", JSON.stringify(state)); }
function $(id) { return document.getElementById(id); }

function applySeason() {
  const season = seasons[state.season];
  document.documentElement.style.setProperty("--accent", season.accent);
  $("seasonBadge").textContent = state.season;
  $("seasonQuestion").textContent = season.question;
  $("seasonNotes").value = state.seasonNotes || "";
}

function renderEditableText() {
  document.querySelectorAll("[contenteditable][data-key]").forEach(el => {
    el.textContent = state[el.dataset.key] || "";
    el.oninput = () => { state[el.dataset.key] = el.textContent; save(); };
  });
}

function renderWeekly() {
  const ul = $("weeklyList");
  ul.innerHTML = "";
  state.weekly.forEach((item, index) => {
    const li = document.createElement("li");
    li.contentEditable = true;
    li.textContent = item;
    li.oninput = () => { state.weekly[index] = li.textContent; save(); };
    li.ondblclick = () => { state.weekly.splice(index, 1); save(); renderWeekly(); };
    ul.appendChild(li);
  });
}

function branchPositions() {
  return window.innerWidth <= 900
    ? [[50,6],[12,22],[58,24],[14,46],[58,50],[31,70]]
    : [[42,8],[10,22],[68,22],[10,60],[68,60],[42,76]];
}

function renderBranches() {
  const wrap = $("branches");
  wrap.innerHTML = "";
  const positions = branchPositions();
  state.branches.forEach((branch, index) => {
    const card = document.createElement("button");
    card.className = "branch";
    card.style.left = `${positions[index][0]}%`;
    card.style.top = `${positions[index][1]}%`;
    card.style.setProperty("--growth", `${branch.growth}%`);
    card.innerHTML = `<strong>${branch.title}</strong><p>${branch.subtitle}</p><div class="growth"><span></span></div>`;
    card.onclick = () => openBranch(branch.id);
    wrap.appendChild(card);
  });
}

function openBranch(id) {
  activeBranchId = id;
  const b = state.branches.find(x => x.id === id);
  $("dialogPillar").textContent = "Life pillar";
  $("dialogTitle").textContent = b.title;
  $("branchPurpose").value = b.purpose || "";
  $("branchProjects").value = b.projects || "";
  $("branchMilestones").value = b.milestones || "";
  $("branchNotes").value = b.notes || "";
  $("branchDialog").showModal();
}

$("saveBranch").onclick = () => {
  const b = state.branches.find(x => x.id === activeBranchId);
  b.purpose = $("branchPurpose").value;
  b.projects = $("branchProjects").value;
  b.milestones = $("branchMilestones").value;
  b.notes = $("branchNotes").value;
  b.growth = Math.min(100, Math.max(8, b.projects.split("\n").filter(Boolean).length * 12 + b.milestones.split("\n").filter(Boolean).length * 8));
  save(); renderBranches();
};

$("seasonButton").onclick = () => {
  const names = Object.keys(seasons);
  state.season = names[(names.indexOf(state.season) + 1) % names.length];
  save(); applySeason();
};

$("addWeekly").onclick = () => {
  state.weekly.push("New move");
  save(); renderWeekly();
};

$("seasonNotes").oninput = () => { state.seasonNotes = $("seasonNotes").value; save(); };
$("resetButton").onclick = () => { if (confirm("Reset to the starter Life Landscape?")) { state = structuredClone(defaultState); save(); init(); } };
window.onresize = renderBranches;

function init() { applySeason(); renderEditableText(); renderWeekly(); renderBranches(); }
init();
