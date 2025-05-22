let lines = [];
let stations = [];
let currentLineId = "";
let currentStationIndex = 0;
let player = new Audio();

window.onload = async function () {
  const res = await fetch("data/lines.json");
  lines = await res.json();
  renderLineButtons();
};

function renderLineButtons() {
  const container = document.getElementById("line-buttons");
  container.innerHTML = "";

  lines.forEach(line => {
    const btn = document.createElement("div");
    btn.className = "line-button";
    btn.onclick = () => selectLine(line.line_id, line.line_name);

    const img = document.createElement("img");
    img.src = `img/${line.line_id}.png`;
    img.alt = line.line_name;

    const label = document.createElement("div");
    label.className = "line-label";
    label.textContent = line.line_name;

    btn.appendChild(img);
    btn.appendChild(label);
    container.appendChild(btn);
  });
}

async function selectLine(lineId, lineName) {
  currentLineId = lineId;
  document.getElementById("line-name").textContent = lineName;

  const res = await fetch("data/stations.json");
  const allStations = await res.json();
  stations = allStations.find(line => line.line_id === lineId)?.stations || [];

  currentStationIndex = 0;
  updateStationDisplay();

  document.getElementById("menu-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
}

function updateStationDisplay() {
  const station = stations[currentStationIndex];
  document.getElementById("station-name").textContent = station.sta_name;

  // ボタン表示制御
  document.getElementById("prev-button").style.visibility = currentStationIndex === 0 ? "hidden" : "visible";
  document.getElementById("next-button").style.visibility = currentStationIndex === stations.length - 1 ? "hidden" : "visible";

  // セレクトボックス更新
  const select = document.getElementById("station-select");
  select.innerHTML = "";
  stations.forEach((sta, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.text = sta.sta_name;
    if (index === currentStationIndex) option.selected = true;
    select.appendChild(option);
  });
}

function jumpToStation() {
  const select = document.getElementById("station-select");
  currentStationIndex = parseInt(select.value, 10);
  updateStationDisplay();
}

function playMelody() {
  const station = stations[currentStationIndex];
  const path = `audio/${currentLineId}/${station.sta_id}_01.wav`;
  const onButton = document.getElementById("on-button");

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error();
      player.src = path;
      player.loop = true;
      player.play();
      onButton.classList.add("active");
    })
    .catch(() => {
      alert("音声ファイルが存在しません");
    });
}

function stopMelody() {
  const station = stations[currentStationIndex];
  const path = `audio/${currentLineId}/${station.sta_id}_02.wav`;

  player.pause();
  player.currentTime = 0;
  player.loop = false;

  const onButton = document.getElementById("on-button");
  const offButton = document.getElementById("off-button");
  onButton.classList.remove("active");

  fetch(path)
    .then(res => {
      if (!res.ok) throw new Error();
      const door = new Audio(path);
      door.play();

      offButton.classList.add("pressed");
      setTimeout(() => {
        offButton.classList.remove("pressed");
      }, 150);
    })
    .catch(() => {
      alert("音声ファイルが存在しません");
    });
}

function nextStation() {
  if (currentStationIndex < stations.length - 1) {
    currentStationIndex++;
    updateStationDisplay();
  }
}

function prevStation() {
  if (currentStationIndex > 0) {
    currentStationIndex--;
    updateStationDisplay();
  }
}

function showMenu() {
  document.getElementById("menu-screen").style.display = "block";
  document.getElementById("main-screen").style.display = "none";
  player.pause();
  player.currentTime = 0;
}
