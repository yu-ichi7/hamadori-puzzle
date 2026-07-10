// 合体判定（このゲームの核）
// - collisionStart では「フラグを立ててキューに積む」だけ
// - 実際の削除・生成は毎フレームのイベント外（processMerges）で行う
// - merging フラグで二重合体（3個同時接触での多重生成）を防ぐ
(function () {
  const { Events, Composite, Body } = Matter;

  let queue = [];

  function initMerge(engine) {
    Events.on(engine, "collisionStart", function (e) {
      const maxTier = TORI.BIRDS.length;
      for (let i = 0; i < e.pairs.length; i++) {
        const a = e.pairs[i].bodyA;
        const b = e.pairs[i].bodyB;
        if (a.label !== "bird" || b.label !== "bird") continue;
        const pa = a.plugin, pb = b.plugin;
        if (!pa || !pb) continue;
        if (pa.tier !== pb.tier) continue;        // 同種のみ
        if (pa.tier >= maxTier) continue;         // 最大段（アオサギ）は合体しない
        if (pa.merging || pb.merging) continue;   // ★二重合体防止
        pa.merging = true;
        pb.merging = true;
        queue.push({ a: a, b: b, tier: pa.tier });
      }
    });
  }

  // 毎フレーム呼ぶ。合体が起きたら onMerge(newTier, x, y) を呼んで新ボディを返す
  function processMerges(engine, onMerge) {
    if (queue.length === 0) return;
    const jobs = queue;
    queue = [];
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      // すでにワールドから消えていたらスキップ（保険）
      const bodies = Composite.allBodies(engine.world);
      if (bodies.indexOf(job.a) === -1 || bodies.indexOf(job.b) === -1) continue;

      const mx = (job.a.position.x + job.b.position.x) / 2;
      const my = (job.a.position.y + job.b.position.y) / 2;
      Composite.remove(engine.world, job.a);
      Composite.remove(engine.world, job.b);

      const newTier = job.tier + 1;
      const newBird = TORI.physics.createBird(mx, my, newTier);
      Body.setVelocity(newBird, { x: 0, y: -2 }); // 「ポンッ」と軽く上に生まれる
      Composite.add(engine.world, newBird);

      if (onMerge) onMerge(newTier, mx, my);
    }
  }

  function clearQueue() { queue = []; }

  TORI.merge = { initMerge, processMerges, clearQueue };
})();
