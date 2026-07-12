// パズル選択モーダルのDOM生成とイベント処理（難易度選択は廃止）
(function () {
  let selectedPuzzle = TORI.state.puzzleKey;
  let closable = false; // 初回起動時は必須選択（背景クリックで閉じない）

  const modal = document.getElementById("selectModal");
  const puzzlesEl = document.getElementById("selectPuzzles");
  const startBtn = document.getElementById("startBtn");

  function renderPuzzles() {
    puzzlesEl.innerHTML = "";
    TORI.PUZZLE_ORDER.forEach(function (key) {
      const puzzle = TORI.PUZZLES[key];
      const card = document.createElement("div");
      card.className = "puzzle-card" + (key === selectedPuzzle ? " selected" : "");

      // 文字だけの2行表記：「パズル」の直前で改行（例「干潟の鳥」＋「パズル」）
      const name = document.createElement("div");
      name.className = "puzzle-card-name";
      const base = puzzle.name.replace(/パズル$/, "");
      const line1 = document.createElement("span");
      line1.textContent = base;
      const line2 = document.createElement("span");
      line2.textContent = "パズル";
      name.appendChild(line1);
      name.appendChild(document.createElement("br"));
      name.appendChild(line2);

      const prog = document.createElement("div");
      prog.className = "puzzle-card-progress";
      prog.textContent = TORI.zukan.unlockedCountFor(key) + " / " + puzzle.birds.length;

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

  function updateStartBtn() {
    startBtn.disabled = !selectedPuzzle;
  }

  startBtn.addEventListener("click", function () {
    TORI.game.switchPuzzle(selectedPuzzle);
    closeModal();
  });

  modal.addEventListener("click", function (e) {
    if (e.target === modal && closable) closeModal();
  });

  function openModal(isReopen) {
    closable = !!isReopen;
    selectedPuzzle = TORI.state.puzzleKey;
    renderPuzzles();
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
