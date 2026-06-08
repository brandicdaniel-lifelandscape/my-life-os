
const areas = [
  { name: "Self", identity: "Magnolia Roots", icons: ["🌰","🌱","🌿","🌳","🌺"] },
  { name: "Purpose", identity: "Oak Tree", icons: ["🌰","🌱","🌳","🌳✨","🌳🦋"] },
  { name: "Creation", identity: "Wildflower Garden", icons: ["🌰","🌱","🌸","💐","🌺🦋"] },
  { name: "Tribe", identity: "Climbing Vine", icons: ["🌰","🌱","🌿","🍃","🌿✨"] },
  { name: "Freedom", identity: "Mountain Trail", icons: ["⛰️","🥾","🏔","🏔✨","🌄"] },
  { name: "Legacy", identity: "Forest Canopy", icons: ["🌰","🌱","🌲","🌲🌲","🌲✨"] }
];

const STORAGE_KEY = "tendGardenEntries_v4_1";
let selectedArea = "Self";

const areaPicker = document.getElementById("areaPicker");
const reflectionText = document.getElementById("reflectionText");
const archiveList = document.getElementById("archiveList");
const gardenGrid = document.getElementById("gardenGrid");

function getEntries(){
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveEntries(entries){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function growthIndex(count){
  if(count >= 20) return 4;
  if(count >= 10) return 3;
  if(count >= 4) return 2;
  if(count >= 1) return 1;
  return 0;
}

function renderAreaButtons(){
  [...areaPicker.querySelectorAll("button")].forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.area === selectedArea);
    btn.addEventListener("click", () => {
      selectedArea = btn.dataset.area;
      renderAreaButtons();
    }, { once: true });
  });
}

function renderGarden(){
  const entries = getEntries();
  gardenGrid.innerHTML = areas.map(area => {
    const count = entries.filter(entry => entry.area === area.name).length;
    const icon = area.icons[growthIndex(count)];
    return `
      <article class="garden-card">
        <span class="plant">${icon}</span>
        <h3>${area.name}</h3>
        <p>${area.identity}</p>
        <div class="count">${count} saved</div>
      </article>
    `;
  }).join("");
}

function renderArchive(){
  const entries = getEntries().slice().reverse();

  if(entries.length === 0){
    archiveList.innerHTML = `<div class="empty">No saved reflections yet. Save one above and it will appear here.</div>`;
    return;
  }

  archiveList.innerHTML = entries.map(entry => `
    <article class="entry">
      <div class="entry-top">
        <span>${entry.area}</span>
        <time>${entry.date}</time>
      </div>
      <p>${entry.text}</p>
    </article>
  `).join("");
}

function renderAll(){
  renderAreaButtons();
  renderGarden();
  renderArchive();
}

document.getElementById("saveEntry").addEventListener("click", () => {
  const text = reflectionText.value.trim();
  if(!text){
    alert("Write a reflection first.");
    return;
  }

  const entries = getEntries();
  entries.push({
    area: selectedArea,
    text,
    date: new Date().toLocaleString()
  });
  saveEntries(entries);
  reflectionText.value = "";
  renderAll();
  document.getElementById("archive").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("exportEntries").addEventListener("click", () => {
  const entries = getEntries();
  const data = JSON.stringify(entries, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tend-garden-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});

renderAll();
