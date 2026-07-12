// パズル・難易度選択モーダルのDOM生成とイベント処理
(function () {
  let selectedPuzzle = TORI.state.puzzleKey;
  let selectedLevel = TORI.state.level;
  let closable = false; // 初回起動時は必須選択（背景クリックで閉じない）

  const modal = document.getElementById("selectModal");
  const puzzlesEl = document.getElementById("selectPuzzles");
  const levelsEl = document.getElementById("selectLevels");
  const startBtn = document.getElementById("startBtn");

  function renderPuzzles() {
    puzzlesEl.innerHTML = "";
    TORI.PUZZLE_ORDER.forEach(function (key) {
      const puzzle = TORI.PUZZLES[key];
      const card = document.createElement("div");
      card.className = "puzzle-card" + (key === selectedPuzzle ? " selected" : "");
      const progress = TORI.zukan.unlockedCountFor(key) + " / " + puzzle.birds.length;
      const icon = document.createElement("div");
      icon.className = "puzzle-card-icon";
      icon.textContent = puzzle.icon;
      const name = document.createElement("div");
      name.className = "puzzle-card-name";
      name.textContent = puzzle.name;
      const prog = document.createElement("div");
      prog.className = "puzzle-card-progress";
      prog.textContent = progress;
      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(prog);
      card.addEventListener("click", function () {
        selectedPuzzle = key;
        renderPuzzles();
        updateStartBtn();
      });
      puzzlesEl.appendChild(card);
    });
  }

  function renderLevels() {
    Array.prototype.forEach.call(levelsEl.querySelectorAll(".level-btn"), function (btn) {
      const lv = parseInt(btn.dataset.level, 10);
      btn.classList.toggle("selected", lv === selectedLevel);
    });
  }
  Array.prototype.forEach.call(levelsEl.querySelectorAll(".level-btn"), function (btn) {
    btn.addEventListener("click", function () {
      selectedLevel = parseInt(btn.dataset.level, 10);
      renderLevels();
      updateStartBtn();
    });
  });

  function updateStartBtn() {
    startBtn.disabled = !(selectedPuzzle && selectedLevel);
  }

  startBtn.addEventListener("click", function () {
    TORI.game.switchPuzzle(selectedPuzzle, selectedLevel);
    closeModal();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal && closable) closeModal();
  });

  function openModal(isReopen) {
    closable = !!isReopen;
    selectedPuzzle = TORI.state.puzzleKey;
    selectedLevel = TORI.state.level;
    renderPuzzles();
    renderLevels();
    updateStartBtn();
    modal.classList.add("open");
  }
  function closeModal() {
    modal.classList.remove("open");
  }

  const switchBtn = document.getElementById("puzzleSwitchBtn");
  if (switchBtn) {
    switchBtn.addEventListener("click", function () {
      const scoreEl = document.getElementById("score");
      const currentScore = scoreEl ? (parseInt(scoreEl.textContent, 10) || 0) : 0;
      if (currentScore > 0 && !confirm("スコアがリセットされます。よろしいですか？")) return;
      openModal(true);
    });
  }

  TORI.puzzleSelect = { open: openModal };

  // 起動時: 必須選択モーダルを開く
  openModal(false);
})();
