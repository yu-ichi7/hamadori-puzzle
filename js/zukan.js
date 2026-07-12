// ゲーム内図鑑: 解放（アンロック）・モーダル表示・localStorage 永続化
// 4パズル共通の1つのコレクション（最大44種）として管理する
(function () {
  const KEY_UNLOCKED = "torisuika_unlocked";
  const KEY_HISCORE_PREFIX = "torisuika_highscore_lv"; // + level(1/2/3)
  const KEY_HISCORE_LEGACY = "torisuika_highscore"; // 旧・単一パズル時代のキー

  // localStorage が使えない環境（file:// の一部設定等）でも動くフォールバック
  const store = {
    get: function (key) {
      try { return localStorage.getItem(key); } catch (e) { return this._mem[key] || null; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, val); } catch (e) { this._mem[key] = val; }
    },
    remove: function (key) {
      try { localStorage.removeItem(key); } catch (e) { delete this._mem[key]; }
    },
    _mem: {},
  };

  // 一意識別子: "puzzleKey:tier"
  function idOf(puzzleKey, tier) { return puzzleKey + ":" + tier; }

  let unlocked = new Set();
  try {
    const raw = JSON.parse(store.get(KEY_UNLOCKED) || "[]");
    if (Array.isArray(raw)) {
      // マイグレーション: 旧データは [1,2,3,...] という数値配列（当時はシギチドリのみ）
      const migrated = raw.map(function (v) {
        return typeof v === "number" ? idOf("shigichidori", v) : v;
      });
      unlocked = new Set(migrated);
      if (raw.some(function (v) { return typeof v === "number"; })) {
        store.set(KEY_UNLOCKED, JSON.stringify(Array.from(unlocked)));
      }
    }
  } catch (e) { /* 壊れていたら空から */ }

  function isUnlocked(puzzleKey, tier) { return unlocked.has(idOf(puzzleKey, tier)); }

  // 初めて出会った鳥を解放。新規解放なら true
  function unlock(puzzleKey, tier) {
    const id = idOf(puzzleKey, tier);
    if (unlocked.has(id)) return false;
    unlocked.add(id);
    store.set(KEY_UNLOCKED, JSON.stringify(Array.from(unlocked)));
    showToast(puzzleKey, tier);
    if (TORI.audio) TORI.audio.unlock();
    return true;
  }

  function unlockedCountFor(puzzleKey) {
    let n = 0;
    TORI.PUZZLES[puzzleKey].birds.forEach(function (_, i) {
      if (isUnlocked(puzzleKey, i + 1)) n++;
    });
    return n;
  }
  function unlockedCount() { return unlocked.size; }
  function totalCount() {
    return TORI.PUZZLE_ORDER.reduce(function (sum, key) {
      return sum + TORI.PUZZLES[key].birds.length;
    }, 0);
  }

  // ---- ハイスコア（難易度レベル単位） ----
  function migrateLegacyHighscore() {
    const legacy = store.get(KEY_HISCORE_LEGACY);
    if (legacy == null) return;
    const lv3Key = KEY_HISCORE_PREFIX + "3";
    if (store.get(lv3Key) == null) store.set(lv3Key, legacy);
    store.remove(KEY_HISCORE_LEGACY);
  }
  migrateLegacyHighscore();

  function getHighscore(level) {
    const v = parseInt(store.get(KEY_HISCORE_PREFIX + level) || "0", 10);
    return isNaN(v) ? 0 : v;
  }
  function saveHighscore(score, level) {
    if (score > getHighscore(level)) {
      store.set(KEY_HISCORE_PREFIX + level, String(score));
      return true;
    }
    return false;
  }

  // ---- トースト ----
  let toastTimer = null;
  function showToast(puzzleKey, tier) {
    const el = document.getElementById("toast");
    const def = TORI.PUZZLES[puzzleKey] && TORI.PUZZLES[puzzleKey].birds[tier - 1];
    if (!el || !def) return;
    el.textContent = "🎉 新しい鳥に出会った！ 「" + def.name + "」";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  // ---- 図鑑モーダル（4パズルをセクション分けして表示） ----
  function renderZukan() {
    const grid = document.getElementById("zukanGrid");
    const countEl = document.getElementById("zukanCount");
    if (!grid) return;
    grid.innerHTML = "";

    TORI.PUZZLE_ORDER.forEach(function (puzzleKey) {
      const puzzle = TORI.PUZZLES[puzzleKey];
      const section = document.createElement("div");
      section.className = "zukan-section";

      const title = document.createElement("div");
      title.className = "zukan-section-title";
      title.textContent = puzzle.icon + " " + puzzle.name + "（" + unlockedCountFor(puzzleKey) + " / " + puzzle.birds.length + "）";
      section.appendChild(title);

      const sectionGrid = document.createElement("div");
      sectionGrid.className = "zukan-grid";

      puzzle.birds.forEach(function (b, i) {
        const tier = i + 1;
        const unlockedFlag = isUnlocked(puzzleKey, tier);
        const cell = document.createElement("div");
        cell.className = "zukan-cell" + (unlockedFlag ? "" : " locked");

        const cv = document.createElement("canvas");
        const size = 96;
        cv.width = size; cv.height = size;
        const ctx = cv.getContext("2d");
        if (unlockedFlag) {
          TORI.drawBird(ctx, tier, size / 2, size / 2, size * 0.4, 0, puzzleKey);
        } else {
          TORI.drawSilhouette(ctx, tier, size / 2, size / 2, size * 0.4);
        }
        cell.appendChild(cv);

        const name = document.createElement("div");
        name.className = "zukan-name";
        name.textContent = unlockedFlag ? (tier + ". " + b.name) : (tier + ". ？？？");
        cell.appendChild(name);

        const len = document.createElement("div");
        len.className = "zukan-len";
        len.textContent = unlockedFlag ? ("全長 " + b.len) : "---";
        cell.appendChild(len);

        const trivia = document.createElement("div");
        trivia.className = "zukan-trivia";
        trivia.textContent = unlockedFlag ? b.trivia : "合体で出会うと解放されます";
        cell.appendChild(trivia);

        sectionGrid.appendChild(cell);
      });

      section.appendChild(sectionGrid);
      grid.appendChild(section);
    });

    if (countEl) {
      const n = unlockedCount();
      const total = totalCount();
      countEl.textContent = n + " / " + total + (n === total ? "　🏆 コンプリート！" : "");
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
    isUnlocked, unlock, unlockedCount, unlockedCountFor, totalCount,
    getHighscore, saveHighscore,
    openZukan, closeZukan,
  };
})();
