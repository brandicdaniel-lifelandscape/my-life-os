const areas = {
  Self: {
    title: "Self Roots",
    prompt: "What is your body, energy, or inner voice asking for today?",
    icons: ["🌰", "🌱", "🌿", "🌳", "🌺"]
  },
  Purpose: {
    title: "Purpose Tree",
    prompt: "What dream needs one real action instead of more discussion?",
    icons: ["🌰", "🌱", "🌳", "🌳✨", "🌳🦋"]
  },
  Creation: {
    title: "Creation Garden",
    prompt: "What are you making that feels alive, even if it is not finished?",
    icons: ["🌰", "🌱", "🌸", "💐", "🌺🦋"]
  },
  Tribe: {
    title: "Tribe Paths",
    prompt: "Who needs tending, connecting, or soft attention?",
    icons: ["🌰", "🌱", "🌿", "🍃", "🌿✨"]
  },
  Freedom: {
    title: "Freedom Trail",
    prompt: "What choice today buys more options for your future self?",
    icons: ["⛰️", "🥾", "🏔", "🏔✨", "🌄"]
  },
  Legacy: {
    title: "Legacy Forest",
    prompt: "What are you learning or building that could outlive this season?",
    icons: ["🌰", "🌱", "🌲", "🌲🌲", "🌲✨"]
  }
};

const STORAGE_KEY = "tendGardenEntries_v4_2";
let selectedArea = "Self";

const entryText = document.getElementById("entryText");
const archive = document.getElementById("archive");
const todayTitle = document.getElementById("todayTitle");
const dailyPrompt = document.getElementById("dailyPrompt");

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function setEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function growthIndex(count) {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 4) return 2;
  if (count >= 1) return 1;
  return 0;
}

function selectArea(area) {
  selectedArea = area;
  todayTitle.textContent = areas[area].title;
  dailyPrompt.textContent = areas[area].prompt;

  document.querySelectorAll(".estate-node").forEach(node => {
    node.classList.toggle("selected", node.dataset.area === area);
  });

  document.querySelector("#today").scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateGarden() {
  const entries = getEntries();

  Object.keys(areas).forEach(area => {
    const count = entries.filter(entry => entry.area === area).length;
    const icon = areas[area].icons[growthIndex(count)];
    const visual = document.getElementById(`visual-${area}`);
    const counter = document.getElementById(`count-${area}`);
    if (visual) visual.textContent = icon;
    if (counter) counter.textContent = `${count} saved`;
  });
}

function renderArchive() {
  const entries = getEntries().slice().reverse();

  if (!entries.length) {
    archive.innerHTML = `<div class="empty">No saved tending yet. Choose an area, write a reflection, and save it.</div>`;
    return;
  }

  archive.innerHTML = entries.map(entry => `
    <article class="entry">
      <div class="entry-top">
        <span>${entry.area}</span>
        <time>${entry.date}</time>
      </div>
      <p>${entry.text}</p>
    </article>
  `).join("");
}

function renderSuggestions() {
  const entries = getEntries();
  const ranked = Object.keys(areas).map(area => {
    const areaEntries = entries.filter(e => e.area === area);
    const last = areaEntries.length ? new Date(areaEntries[areaEntries.length - 1].rawDate).getTime() : 0;
    return { area, count: areaEntries.length, last };
  }).sort((a,b) => a.count - b.count || a.last - b.last).slice(0,3);

  document.getElementById("suggestions").innerHTML = ranked.map(item => `
    <button class="suggestion" data-area="${item.area}">
      <b>${areas[item.area].title}</b>
      <p>${areas[item.area].prompt}</p>
    </button>
  `).join("");

  document.querySelectorAll(".suggestion").forEach(btn => {
    btn.addEventListener("click", () => selectArea(btn.dataset.area));
  });
}

function renderAll() {
  updateGarden();
  renderArchive();
  renderSuggestions();
}

document.querySelectorAll(".estate-node").forEach(node => {
  node.addEventListener("click", () => selectArea(node.dataset.area));
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const text = entryText.value.trim();

  if (!text) {
    alert("Write a reflection first.");
    return;
  }

  const now = new Date();
  const entries = getEntries();
  entries.push({
    area: selectedArea,
    text,
    date: now.toLocaleString(),
    rawDate: now.toISOString()
  });
  setEntries(entries);
  entryText.value = "";
  renderAll();
  document.querySelector(".archive-panel").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("suggestBtn").addEventListener("click", () => {
  renderSuggestions();
  document.getElementById("suggestedPanel").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const entries = getEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tend-garden-backup.json";
  link.click();
  URL.revokeObjectURL(url);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  if (confirm("Clear all saved entries on this device?")) {
    localStorage.removeItem(STORAGE_KEY);
    renderAll();
  }
});

const seasons = [
  "Spring — What am I growing?",
  "Summer — What am I expanding?",
  "Fall — What am I harvesting?",
  "Winter — What am I releasing?"
];
let seasonIndex = 1;
document.getElementById("seasonBtn").addEventListener("click", () => {
  seasonIndex = (seasonIndex + 1) % seasons.length;
  document.getElementById("seasonBtn").textContent = seasons[seasonIndex];
});

renderAll();
