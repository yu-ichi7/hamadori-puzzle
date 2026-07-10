// Matter.js の初期化と鳥ボディ生成
(function () {
  const { Engine, Bodies, Composite, Body } = Matter;

  let uid = 0;

  function createEngine() {
    const engine = Engine.create();
    engine.gravity.y = TORI.PHYS.gravityY;
    // 積み上げの安定性を上げる
    engine.positionIterations = 8;
    engine.velocityIterations = 6;
    return engine;
  }

  function addWalls(engine) {
    const B = TORI.BOARD;
    const t = B.WALL;
    const opts = { isStatic: true, label: "wall", friction: 0.6 };
    const walls = [
      Bodies.rectangle(-t / 2, B.H / 2, t, B.H * 3, opts),          // 左
      Bodies.rectangle(B.W + t / 2, B.H / 2, t, B.H * 3, opts),     // 右
      Bodies.rectangle(B.W / 2, B.H + t / 2, B.W + t * 2, t, opts), // 床
    ];
    Composite.add(engine.world, walls);
  }

  // 鳥ボディ生成（label='bird'、plugin に tier / id / merging を持たせる）
  function createBird(x, y, tier, extra) {
    const def = TORI.BIRDS[tier - 1];
    const body = Bodies.circle(x, y, def.radius, {
      label: "bird",
      restitution: TORI.PHYS.restitution,
      friction: TORI.PHYS.friction,
      frictionStatic: TORI.PHYS.frictionStatic,
      density: TORI.PHYS.density,
    });
    body.plugin = body.plugin || {};
    body.plugin.tier = tier;
    body.plugin.id = ++uid;
    body.plugin.merging = false;
    body.plugin.bornAt = performance.now(); // ポップアニメ用
    if (extra && extra.velocity) Body.setVelocity(body, extra.velocity);
    return body;
  }

  TORI.physics = { createEngine, addWalls, createBird };
})();
