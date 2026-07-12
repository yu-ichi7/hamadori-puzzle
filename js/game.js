// メイン: 状態機械・スコア・ゲームオーバー・描画ループ
(function () {
  const { Engine, Composite } = Matter;
  const B = TORI.BOARD;
  const P = TORI.PHYS;

  // ---- Canvas（devicePixelRatio 対応）----
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = B.W * dpr;
  canvas.height = B.H * dpr;
  ctx.scale(dpr, dpr);

  // ---- 物理 ----
  const engine = TORI.physics.createEngine();
  TORI.physics.addWalls(engine);
  TORI.merge.initMerge(engine);

  // ---- 状態 ----
  let score = 0;
  let best = TORI.zukan.getHighscore(TORI.state.level);
  let aimX = B.W / 2;
  let currentTier = pickTier();
  let nextTier = pickTier();
  let canDrop = true;
  let overTimer = 0;     // ライン越え累積時間(ms)
  let isOver = false;
  let lastT = performance.now();
  let particles = [];

  function pickTier() {
    const w = TORI.DROP_WEIGHTS;
    let total = 0;
    for (let i = 0; i < w.length; i++) total += w[i];
    let r = Math.random() * total;
    for (let i = 0; i < w.length; i++) {
      r -= w[i];
      if (r < 0) return i + 1;
    }
    return 1;
  }

  function clampAim(x, tier) {
    const r = TORI.BIRDS[tier - 1].radius;
    return Math.max(r + 4, Math.min(B.W - r - 4, x));
  }

  // ---- UI 表示 ----
  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const puzzleLabelEl = document.getElementById("puzzleLabel");
  function updateUI() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
  }
  function updatePuzzleLabel() {
    const puzzle = TORI.PUZZLES[TORI.state.puzzleKey];
    if (puzzleLabelEl) {
      puzzleLabelEl.textContent = puzzle.icon + " " + puzzle.name + " ・ Lv" + TORI.state.level;
    }
  }

  // ---- 落下 ----
  function drop(x) {
    if (!canDrop || isOver) return;
    const tier = currentTier;
    const cx = clampAim(x, tier);
    const bird = TORI.physics.createBird(cx, B.DROP_Y, tier);
    Composite.add(engine.world, bird);
    TORI.zukan.unlock(TORI.state.puzzleKey, tier); // 落下でも初出会いは解放
    TORI.audio.drop();

    currentTier = nextTier;
    nextTier = pickTier();
    renderNext();

    canDrop = false;
    setTimeout(function () { canDrop = true; }, P.dropCooldownMs);
  }

  // 「つぎ」プレビュー（DOM上の小canvas）
  function renderNext() {
    const cv = document.getElementById("next");
    const c2 = cv.getContext("2d");
    c2.clearRect(0, 0, cv.width, cv.height);
    TORI.drawBird(c2, nextTier, cv.width / 2, cv.height / 2, 20, 0);
  }

  // ---- 合体コールバック ----
  function onMerge(newTier, x, y) {
    const def = TORI.BIRDS[newTier - 1];
    score += def.score;
    if (score > best) { best = score; }
    updateUI();
    TORI.zukan.unlock(TORI.state.puzzleKey, newTier);
    TORI.audio.merge(newTier);
    spawnParticles(x, y, def.radius);
  }

  // ---- パーティクル（羽が舞う演出）----
  function spawnParticles(x, y, r) {
    for (let i = 0; i < 10; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 1.5 + Math.random() * 2.5;
      particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1,
        life: 1,
        size: 2 + Math.random() * (r * 0.12),
        color: ["#F7F1E3", "#E8823C", "#A9C99A"][i % 3],
      });
    }
  }
  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.06;
      p.life -= dt / 700;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ---- ゲームオーバー判定 ----
  function checkGameOver(dt) {
    if (isOver) return;
    const bodies = Composite.allBodies(engine.world);
    let overflow = false;
    for (let i = 0; i < bodies.length; i++) {
      const b = bodies[i];
      if (b.label !== "bird") continue;
      const r = TORI.BIRDS[b.plugin.tier - 1].radius;
      // 「ほぼ静止」した鳥がラインより上に居座っているときだけカウント（落下直後の猶予）
      if (b.position.y - r < B.LINE_Y && b.speed < P.stillSpeed) {
        overflow = true;
        break;
      }
    }
    overTimer = overflow ? overTimer + dt : 0;
    if (overTimer >= P.overGraceMs) gameOver();
  }

  function gameOver() {
    isOver = true;
    TORI.audio.gameover();
    const isNewBest = TORI.zukan.saveHighscore(score, TORI.state.level);
    document.getElementById("finalScore").textContent = score;
    document.getElementById("newBest").style.display = isNewBest ? "block" : "none";
    document.getElementById("overModal").classList.add("open");
  }

  function restart() {
    TORI.zukan.saveHighscore(score, TORI.state.level); // 途中リタイアでもベストは残す
    // 鳥だけ消す（壁は残す）
    Composite.allBodies(engine.world).forEach(function (b) {
      if (b.label === "bird") Composite.remove(engine.world, b);
    });
    TORI.merge.clearQueue();
    particles = [];
    score = 0;
    best = TORI.zukan.getHighscore(TORI.state.level);
    overTimer = 0;
    isOver = false;
    canDrop = true;
    currentTier = pickTier();
    nextTier = pickTier();
    renderNext();
    updateUI();
    updatePuzzleLabel();
    document.getElementById("overModal").classList.remove("open");
  }

  // パズル・難易度を切り替えて最初から始める
  function switchPuzzle(puzzleKey, level) {
    TORI.state.level = level;
    TORI.state.maxTier = TORI.LEVEL_MAX_TIER[level];
    TORI.setPuzzle(puzzleKey);
    restart();
  }

  // ---- 描画 ----
  function draw() {
    // 背景（現在のパズルのテーマカラー。上=空、下=地面）
    const bg = TORI.PUZZLES[TORI.state.puzzleKey].bg;
    const sky = ctx.createLinearGradient(0, 0, 0, B.H);
    sky.addColorStop(0, bg.sky1);
    sky.addColorStop(0.55, bg.sky2);
    sky.addColorStop(1, bg.sky3);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, B.W, B.H);

    // ゲームオーバーライン（危険が近いと赤く）
    const danger = overTimer > 0;
    ctx.strokeStyle = danger ? "rgba(217,79,48,0.8)" : "rgba(58,58,56,0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(0, B.LINE_Y);
    ctx.lineTo(B.W, B.LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // 落下ガイド（スタンバイ鳥の真下に点線）
    if (!isOver && canDrop) {
      const r = TORI.BIRDS[currentTier - 1].radius;
      const gx = clampAim(aimX, currentTier);
      ctx.strokeStyle = "rgba(58,58,56,0.18)";
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.moveTo(gx, B.DROP_Y + r);
      ctx.lineTo(gx, B.H);
      ctx.stroke();
      ctx.setLineDash([]);
      // スタンバイ鳥
      TORI.drawBird(ctx, currentTier, gx, B.DROP_Y, r, 0);
    }

    // ワールドの鳥（生まれた直後はポップアニメ）
    const now = performance.now();
    Composite.allBodies(engine.world).forEach(function (b) {
      if (b.label !== "bird") return;
      const def = TORI.BIRDS[b.plugin.tier - 1];
      let r = def.radius;
      const age = now - (b.plugin.bornAt || 0);
      if (age < 180) {
        const t = age / 180;
        r = r * (0.6 + 0.4 * (1 - Math.pow(1 - t, 3))); // easeOutCubic
      }
      TORI.drawBird(ctx, b.plugin.tier, b.position.x, b.position.y, r, b.angle);
    });

    // パーティクル
    particles.forEach(function (p) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ---- メインループ ----
  function loop(t) {
    const dt = Math.min(33, t - lastT);
    lastT = t;
    if (!isOver) {
      Engine.update(engine, dt);
      TORI.merge.processMerges(engine, onMerge);
      checkGameOver(dt);
    }
    updateParticles(dt);
    draw();
    requestAnimationFrame(loop);
  }

  // ---- 入力・ボタン ----
  TORI.initInput(canvas, {
    onMove: function (x) { aimX = x; },
    onRelease: function (x) { aimX = x; drop(x); },
  });

  document.getElementById("zukanBtn").addEventListener("click", TORI.zukan.openZukan);
  document.getElementById("zukanClose").addEventListener("click", TORI.zukan.closeZukan);
  document.getElementById("zukanModal").addEventListener("click", function (e) {
    if (e.target === this) TORI.zukan.closeZukan();
  });
  document.getElementById("retryBtn").addEventListener("click", restart);
  document.getElementById("muteBtn").addEventListener("click", function () {
    const m = TORI.audio.toggleMute();
    this.textContent = m ? "🔇" : "🔊";
  });

  // ---- 開始 ----
  renderNext();
  updateUI();
  updatePuzzleLabel();
  requestAnimationFrame(loop);

  TORI.game = { restart: restart, switchPuzzle: switchPuzzle };

  // 開発検証用フック（ゲームプレイでは使わない）
  TORI._debug = {
    engine: engine,
    drop: drop,
    setTier: function (t) { currentTier = t; },
    step: function (n) { // rAFが止まる環境での手動フレーム送り
      for (var i = 0; i < (n || 1); i++) {
        Engine.update(engine, 1000 / 60);
        TORI.merge.processMerges(engine, onMerge);
        checkGameOver(1000 / 60);
      }
    },
    draw: function () { draw(); },
    state: function () {
      return {
        score: score, isOver: isOver, canDrop: canDrop,
        birds: Composite.allBodies(engine.world)
          .filter(function (b) { return b.label === "bird"; })
          .map(function (b) { return b.plugin.tier; }),
      };
    },
  };
})();
