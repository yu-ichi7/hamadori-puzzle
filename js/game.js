// メイン: 状態機械・スコア・ゲームオーバー・描画ループ
(function () {
  const { Engine, Composite, Body } = Matter;
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
  let best = TORI.zukan.getHighscore();
  let aimX = B.W / 2;
  let currentTier = pickTier();
  let nextTier = pickTier();
  let canDrop = true;
  let overTimer = 0;     // ライン越え累積時間(ms)
  let isOver = false;
  let lastT = performance.now();
  let particles = [];
  let shakeT = 0;        // 画面シェイク演出の残り時間(ms)

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
    if (puzzleLabelEl) puzzleLabelEl.textContent = puzzle.name;
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

  // 「つぎ」プレビュー（絵＋名前。まだ図鑑に無い鳥の名前は？？？）
  function renderNext() {
    const cv = document.getElementById("next");
    const c2 = cv.getContext("2d");
    c2.clearRect(0, 0, cv.width, cv.height);
    TORI.drawBird(c2, nextTier, cv.width / 2, cv.height / 2, 20, 0);
    const nameEl = document.getElementById("nextName");
    if (nameEl) {
      const known = TORI.zukan.isUnlocked(TORI.state.puzzleKey, nextTier);
      nameEl.textContent = known ? TORI.BIRDS[nextTier - 1].name : "？？？";
    }
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
    renderNext(); // 解放で「？？？」が名前に変わることがある
  }

  // ---- パーティクル（羽が舞う演出）----
  function spawnParticles(x, y, r) {
    for (let i = 0; i < 14; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = 2.2 + Math.random() * 3.8;
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

  // ---- ゆらすアイテム ----
  const shakeBtn = document.getElementById("shakeBtn");
  const shakeCountEl = document.getElementById("shakeCount");
  function updateShakeUI() {
    const n = TORI.items.shakeStock();
    if (shakeCountEl) shakeCountEl.textContent = "×" + n;
    if (shakeBtn) shakeBtn.disabled = (n <= 0);
  }
  function doShake() {
    if (isOver) return;
    if (!TORI.items.useShake()) return; // 在庫なし
    // 全部の鳥に上向き＋ランダム横の速度を与えて盤面をほぐす
    Composite.allBodies(engine.world).forEach(function (b) {
      if (b.label !== "bird") return;
      Body.setVelocity(b, {
        x: (Math.random() - 0.5) * 14,
        y: -(5 + Math.random() * 5),
      });
    });
    shakeT = 600; // 画面シェイク演出
    TORI.audio.shake();
    updateShakeUI();
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
    const isNewBest = TORI.zukan.saveHighscore(score);
    TORI.items.onPlayFinished(); // 5プレーごとのボーナス在庫カウント
    updateShakeUI();
    document.getElementById("finalScore").textContent = score;
    document.getElementById("newBest").style.display = isNewBest ? "block" : "none";
    document.getElementById("overModal").classList.add("open");
  }

  function restart() {
    TORI.zukan.saveHighscore(score); // 途中リタイアでもベストは残す
    // 鳥だけ消す（壁は残す）
    Composite.allBodies(engine.world).forEach(function (b) {
      if (b.label === "bird") Composite.remove(engine.world, b);
    });
    TORI.merge.clearQueue();
    TORI.setPuzzle(TORI.state.puzzleKey); // pool定義があれば顔ぶれを再抽選
    particles = [];
    score = 0;
    best = TORI.zukan.getHighscore();
    overTimer = 0;
    isOver = false;
    canDrop = true;
    currentTier = pickTier();
    nextTier = pickTier();
    renderNext();
    updateUI();
    updatePuzzleLabel();
    updateShakeUI();
    document.getElementById("overModal").classList.remove("open");
  }

  // パズルを切り替えて最初から始める
  function switchPuzzle(puzzleKey) {
    TORI.setPuzzle(puzzleKey);
    restart();
  }

  // ---- 描画 ----
  function draw() {
    ctx.save();
    if (shakeT > 0) {
      // 画面シェイク演出
      const mag = Math.min(12, shakeT / 40);
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    // 背景（現在のパズルのテーマカラー。上=空、下=地面）
    const bg = TORI.PUZZLES[TORI.state.puzzleKey].bg;
    const sky = ctx.createLinearGradient(0, 0, 0, B.H);
    sky.addColorStop(0, bg.sky1);
    sky.addColorStop(0.55, bg.sky2);
    sky.addColorStop(1, bg.sky3);
    ctx.fillStyle = sky;
    ctx.fillRect(-8, -8, B.W + 16, B.H + 16);

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
      const POP_DUR = 280;
      if (age < POP_DUR) {
        const t = age / POP_DUR;
        let scale;
        if (t < 0.55) {
          // 0.6倍 → 1.35倍まで一気に膨らむ（ポンッ）
          const tt = t / 0.55;
          scale = 0.6 + 0.75 * (1 - Math.pow(1 - tt, 3));
        } else {
          // 1.35倍 → 1.0倍に弾み戻る
          const tt = (t - 0.55) / 0.45;
          const eased = tt < 0.5 ? 2 * tt * tt : 1 - Math.pow(-2 * tt + 2, 2) / 2;
          scale = 1.35 - 0.35 * eased;
        }
        r = r * scale;
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
    ctx.restore();
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
    if (shakeT > 0) shakeT -= dt;
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
  if (shakeBtn) shakeBtn.addEventListener("click", doShake);

  // ---- 開始 ----
  renderNext();
  updateUI();
  updatePuzzleLabel();
  updateShakeUI();
  requestAnimationFrame(loop);

  TORI.game = { restart: restart, switchPuzzle: switchPuzzle };

  // 開発検証用フック（ゲームプレイでは使わない）
  TORI._debug = {
    engine: engine,
    drop: drop,
    doShake: doShake,
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
