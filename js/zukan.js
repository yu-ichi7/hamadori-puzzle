// ゲーム内図鑑: 解放（アンロック）・モーダル表示・localStorage 永続化
(function () {
  const KEY_UNLOCKED = "torisuika_unlocked";
  const KEY_HISCORE = "torisuika_highscore";

  // localStorage が使えない環境（file:// の一部設定等）でも動くフォールバック
  const store = {
    get: function (key) {
      try { return localStorage.getItem(key); } catch (e) { return this._mem[key] || null; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, val); } catch (e) { this._mem[key] = val; }
    },
    _mem: {},
  };

  let unlocked = new Set();
  try {
    const saved = JSON.parse(store.get(KEY_UNLOCKED) || "[]");
    if (Array.isArray(saved)) unlocked = new Set(saved);
  } catch (e) { /* 壊れていたら空から */ }

  function isUnlocked(tier) { return unlocked.has(tier); }

  // 初めて出会った鳥を解放。新規解放なら true
  function unlock(tier) {
    if (unlocked.has(tier)) return false;
    unlocked.add(tier);
    store.set(KEY_UNLOCKED, JSON.stringify(Array.from(unlocked)));
    showToast(tier);
    if (TORI.audio) TORI.audio.unlock();
    return true;
  }

  function unlockedCount() { return unlocked.size; }

  // ---- ハイスコア ----
  function getHighscore() {
    const v = parseInt(store.get(KEY_HISCORE) || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function saveHighscore(score) {
    if (score > getHighscore()) {
      store.set(KEY_HISCORE, String(score));
      return true;
    }
    return false;
  }

  // ---- トースト ----
  let toastTimer = null;
  function showToast(tier) {
    const el = document.getElementById("toast");
    const def = TORI.BIRDS[tier - 1];
    if (!el || !def) return;
    el.textContent = "🎉 新しい鳥に出会った！ 「" + def.name + "」";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  // ---- 図鑑モーダル ----
  function renderZukan() {
    const grid = document.getElementById("zukanGrid");
    const countEl = document.getElementById("zukanCount");
    if (!grid) return;
    grid.innerHTML = "";
    TORI.BIRDS.forEach(function (b) {
      const cell = document.createElement("div");
      cell.className = "zukan-cell" + (isUnlocked(b.tier) ? "" : " locked");

      const cv = document.createElement("canvas");
      const size = 96;
      cv.width = size; cv.height = size;
      const ctx = cv.getContext("2d");
      if (isUnlocked(b.tier)) {
        TORI.drawBird(ctx, b.tier, size / 2, size / 2, size * 0.4, 0);
      } else {
        TORI.drawSilhouette(ctx, b.tier, size / 2, size / 2, size * 0.4);
      }
      cell.appendChild(cv);

      const name = document.createElement("div");
      name.className = "zukan-name";
      name.textContent = isUnlocked(b.tier) ? (b.tier + ". " + b.name) : (b.tier + ". ？？？");
      cell.appendChild(name);

      const len = document.createElement("div");
      len.className = "zukan-len";
      len.textContent = isUnlocked(b.tier) ? ("全長 " + b.len) : "---";
      cell.appendChild(len);

      const trivia = document.createElement("div");
      trivia.className = "zukan-trivia";
      trivia.textContent = isUnlocked(b.tier) ? b.trivia : "合体で出会うと解放されます";
      cell.appendChild(trivia);

      grid.appendChild(cell);
    });
    if (countEl) {
      const n = unlockedCount();
      countEl.textContent = n + " / " + TORI.BIRDS.length +
        (n === TORI.BIRDS.length ? "　🏆 コンプリート！" : "");
    }
  }

  function openZukan() {
    renderZukan();
    document.getElementById("zukanModal").classList.add("open");
  }
  function closeZukan() {
    document.getElementById("zukanModal").classList.remove("open");
  }

  TORI.zukan = {
    isUnlocked, unlock, unlockedCount,
    getHighscore, saveHighscore,
    openZukan, closeZukan,
  };
})();
