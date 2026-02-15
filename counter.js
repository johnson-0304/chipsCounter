// === Data Layer (backward compatible with existing localStorage) ===

function getPlayers() {
  return JSON.parse(localStorage.getItem("listOfObjects") || "[]");
}

function savePlayers(list) {
  localStorage.setItem("listOfObjects", JSON.stringify(list));
}

function getDealer() {
  return localStorage.getItem("dealer") || "";
}

function saveDealer(name) {
  localStorage.setItem("dealer", name);
}

function getHistory() {
  return JSON.parse(localStorage.getItem("history") || "[]");
}

function saveHistory(list) {
  // Keep max 100 entries
  if (list.length > 100) list = list.slice(list.length - 100);
  localStorage.setItem("history", JSON.stringify(list));
}

function isNumeric(str) {
  if (typeof str !== "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

// === Clock ===

function updateClock() {
  var el = document.getElementById("clock");
  if (!el) return;
  var now = new Date();
  var h = String(now.getHours()).padStart(2, "0");
  var m = String(now.getMinutes()).padStart(2, "0");
  var s = String(now.getSeconds()).padStart(2, "0");
  el.textContent = h + ":" + m + ":" + s;
}

function pulseClock() {
  var el = document.getElementById("clock");
  if (!el) return;
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
  el.addEventListener("animationend", function handler() {
    el.classList.remove("pulse");
    el.removeEventListener("animationend", handler);
  });
}

// === Toast ===

var toastTimer = null;
function showToast(msg) {
  var el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.classList.remove("show");
  }, 2000);
}

// === Modal System (replaces prompt/confirm) ===

var modalResolve = null;
var modalMode = null; // "dealer", "addPlayer", "editBet"

function openModal(title, placeholder1, placeholder2, mode) {
  if (modalResolve) modalResolve(null);
  modalMode = mode;
  var overlay = document.getElementById("modal-overlay");
  var titleEl = document.getElementById("modal-title");
  var input1 = document.getElementById("modal-input");
  var input2 = document.getElementById("modal-input-2");

  titleEl.textContent = title;
  input1.value = "";
  input1.placeholder = placeholder1 || "";
  input1.classList.remove("hidden");

  if (placeholder2) {
    input2.value = "";
    input2.placeholder = placeholder2;
    input2.classList.remove("hidden");
    input2.type = "text";
  } else {
    input2.classList.add("hidden");
  }

  overlay.classList.remove("hidden");
  input1.focus();

  return new Promise(function (resolve) {
    modalResolve = resolve;
  });
}

function modalConfirm() {
  var input1 = document.getElementById("modal-input");
  var input2 = document.getElementById("modal-input-2");
  var val1 = input1.value.trim();
  var val2 = input2.value.trim();

  if (modalMode === "dealer") {
    if (!val1) return;
    modalResolve({ name: val1 });
  } else if (modalMode === "addPlayer") {
    if (!val1 || !isNumeric(val2) || parseFloat(val2) <= 0) {
      if (!val1) input1.focus();
      else input2.focus();
      return;
    }
    modalResolve({ name: val1, bet: val2 });
  } else if (modalMode === "editBet") {
    if (!isNumeric(val1) || parseFloat(val1) <= 0) {
      input1.focus();
      return;
    }
    modalResolve({ bet: val1 });
  }

  document.getElementById("modal-overlay").classList.add("hidden");
}

function modalCancel() {
  document.getElementById("modal-overlay").classList.add("hidden");
  if (modalResolve) modalResolve(null);
}

function closeModal(e) {
  if (e.target === e.currentTarget) modalCancel();
}

// Enter key support for modals
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !document.getElementById("modal-overlay").classList.contains("hidden")) {
    modalConfirm();
  }
  if (e.key === "Escape" && !document.getElementById("modal-overlay").classList.contains("hidden")) {
    modalCancel();
  }
  if (e.key === "Escape" && !document.getElementById("confirm-overlay").classList.contains("hidden")) {
    confirmNo();
  }
});

// === Confirm Dialog ===

var confirmResolve = null;

function openConfirm(title) {
  document.getElementById("confirm-title").textContent = title;
  document.getElementById("confirm-overlay").classList.remove("hidden");
  return new Promise(function (resolve) {
    confirmResolve = resolve;
  });
}

function confirmYes() {
  document.getElementById("confirm-overlay").classList.add("hidden");
  if (confirmResolve) confirmResolve(true);
}

function confirmNo() {
  document.getElementById("confirm-overlay").classList.add("hidden");
  if (confirmResolve) confirmResolve(false);
}

function closeConfirm(e) {
  if (e.target === e.currentTarget) confirmNo();
}

// === Dealer ===

function showDealerModal() {
  openModal("Set Dealer Name", "Dealer name", null, "dealer").then(function (result) {
    if (!result) return;
    saveDealer(result.name);
    renderDealer();
    render();
  });
}

function renderDealer() {
  var el = document.getElementById("dealer-name");
  var name = getDealer();
  el.textContent = name || "Click to set";
}

// === Player Actions ===

function playerWin(id) {
  var players = getPlayers();
  var idx = players.findIndex(function (p) { return p.id == id; });
  if (idx === -1) return;

  // Player wins = dealer loses money
  players[idx].curChips = Decimal.sub(players[idx].curChips, players[idx].curBet).toString();
  savePlayers(players);

  var dealer = getDealer() || "Dealer";
  addHistoryEntry(players[idx].name + " wins", "-" + players[idx].curBet);
  showToast(players[idx].name + " wins -RM" + players[idx].curBet);
  pulseClock();
  render();
  triggerAnimations(id);
}

function dealerWin(id) {
  var players = getPlayers();
  var idx = players.findIndex(function (p) { return p.id == id; });
  if (idx === -1) return;

  // Dealer wins = dealer gains money
  players[idx].curChips = Decimal.add(players[idx].curChips, players[idx].curBet).toString();
  savePlayers(players);

  var dealer = getDealer() || "Dealer";
  addHistoryEntry(dealer + " wins vs " + players[idx].name, "+" + players[idx].curBet);
  showToast(dealer + " wins +RM" + players[idx].curBet);
  pulseClock();
  render();
  triggerAnimations(id);
}

function triggerAnimations(id) {
  // Chip bounce
  var chipEl = document.querySelector('[data-chip-id="' + id + '"]');
  if (chipEl) {
    chipEl.classList.remove("bounce");
    void chipEl.offsetWidth;
    chipEl.classList.add("bounce");
  }
}

function showAddPlayerModal() {
  openModal("Add Player", "Player name", "Bet amount (number)", "addPlayer").then(function (result) {
    if (!result) return;
    var players = getPlayers();
    players.push({
      id: new Date().valueOf(),
      name: result.name,
      curChips: 0,
      curBet: result.bet
    });
    savePlayers(players);
    render();
  });
}

function editBet(id) {
  openModal("Edit Bet", "New bet amount", null, "editBet").then(function (result) {
    if (!result) return;
    var players = getPlayers();
    var idx = players.findIndex(function (p) { return p.id == id; });
    if (idx === -1) return;
    players[idx].curBet = result.bet;
    savePlayers(players);
    render();
  });
}

function deletePlayer(id) {
  openConfirm("Delete this player?").then(function (yes) {
    if (!yes) return;
    var players = getPlayers();
    players = players.filter(function (p) { return p.id != id; });
    savePlayers(players);
    render();
  });
}

// === History ===

function addHistoryEntry(desc, amount) {
  var history = getHistory();
  var now = new Date();
  var h = String(now.getHours()).padStart(2, "0");
  var m = String(now.getMinutes()).padStart(2, "0");
  var s = String(now.getSeconds()).padStart(2, "0");
  history.push({
    time: h + ":" + m + ":" + s,
    desc: desc,
    amount: amount
  });
  saveHistory(history);
}

function toggleHistory() {
  var body = document.getElementById("history-body");
  var icon = document.getElementById("history-toggle-icon");
  body.classList.toggle("hidden");
  icon.classList.toggle("open");
  if (!body.classList.contains("hidden")) {
    renderHistory();
  }
}

function renderHistory() {
  var list = document.getElementById("history-list");
  var history = getHistory();
  if (history.length === 0) {
    list.innerHTML = '<div class="history-empty">No records yet</div>';
    return;
  }
  var html = "";
  // Show newest first
  for (var i = history.length - 1; i >= 0; i--) {
    var h = history[i];
    html += '<div class="history-item">' +
      '<span class="history-time">' + escapeHtml(h.time) + '</span>' +
      '<span>' + escapeHtml(h.desc) + ' RM' + escapeHtml(String(h.amount)) + '</span>' +
      '</div>';
  }
  list.innerHTML = html;
}

function clearHistory() {
  openConfirm("Clear all history?").then(function (yes) {
    if (!yes) return;
    saveHistory([]);
    renderHistory();
  });
}

// === Render ===

function render() {
  var contentBody = document.getElementById("content-body");
  var players = getPlayers();
  var dealer = getDealer() || "Dealer";
  var html = "";

  for (var i = 0; i < players.length; i++) {
    var p = players[i];
    var chips = parseFloat(p.curChips) || 0;
    var chipClass = chips > 0 ? "positive" : chips < 0 ? "negative" : "zero";
    var chipDisplay = (chips >= 0 ? "+" : "") + new Decimal(p.curChips || 0).toFixed(1);

    html += '<div class="player-card">' +
      '<div class="card-top">' +
        '<div class="card-name">' + escapeHtml(p.name) + '</div>' +
        '<div class="card-controls">' +
          '<button class="btn-edit" onclick="editBet(' + p.id + ')">Edit</button>' +
          '<button class="btn-del" onclick="deletePlayer(' + p.id + ')">Del</button>' +
        '</div>' +
      '</div>' +
      '<div class="card-chips ' + chipClass + '" data-chip-id="' + p.id + '">RM ' + chipDisplay + '</div>' +
      '<div class="card-bet">Bet RM' + escapeHtml(String(p.curBet)) + '</div>' +
      '<div class="card-buttons">' +
        '<button class="btn-win btn-player-win" onclick="playerWin(' + p.id + ')">' + escapeHtml(p.name) + ' Wins</button>' +
        '<button class="btn-win btn-dealer-win" onclick="dealerWin(' + p.id + ')">' + escapeHtml(dealer) + ' Wins</button>' +
      '</div>' +
    '</div>';
  }

  contentBody.innerHTML = html;
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// === Legacy compatibility ===
// Keep old function names working in case they're called from somewhere
function add(id) { playerWin(id); }
function sub(id) { dealerWin(id); }
function edit(id) { editBet(id); }
function del(id) { deletePlayer(id); }
function addUser() { showAddPlayerModal(); }

// === Init ===

window.addEventListener("load", function () {
  renderDealer();
  render();
  updateClock();
  setInterval(updateClock, 1000);

  // Refresh history if panel is open
  var histBody = document.getElementById("history-body");
  if (histBody && !histBody.classList.contains("hidden")) {
    renderHistory();
  }

  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }
});
