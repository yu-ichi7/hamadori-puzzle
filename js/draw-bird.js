// 鳥の描画: AI生成イラスト（透過PNG）を読み込んで描く。ゲーム盤面と図鑑モーダルで共用
(function () {
  // 物理円に対する絵の描画倍率。画像はトリム済みでフレームいっぱいだが、
  // 絵の輪郭は完全な円ではないため、少し大きめに描いて隙間を目立たなくする
  const IMG_SCALE = 1.02;

  const cache = {}; // key: "puzzleKey|slug" -> { loaded, img, color }

  function getEntry(puzzleKey, bird, tier) {
    const key = puzzleKey + "|" + bird.slug;
    let e = cache[key];
    if (e) return e;
    e = { loaded: false, img: null, color: bird.color || "#B9B4A8" };
    // 画像ファイルの番号は「定義順（birds配列の位置）」。pool抽選で tier とズレることが
    // あるため、slug から定義位置を逆引きする（見つからなければ tier をそのまま使う）
    const defs = TORI.PUZZLES[puzzleKey].birds;
    let defIndex = -1;
    for (let i = 0; i < defs.length; i++) {
      if (defs[i].slug === bird.slug) { defIndex = i; break; }
    }
    const num = String(defIndex >= 0 ? defIndex + 1 : tier).padStart(2, "0");
    const im = new Image();
    im.onload = function () { e.loaded = true; };
    im.onerror = function () { console.warn("鳥画像の読み込み失敗:", key); };
    // ?v= はイラスト更新時にブラウザキャッシュを回避するためのバスター。
    // 画像を差し替えたらこの値を変える（例: 日付）
    im.src = "./assets/birds/" + puzzleKey + "/" + num + "-" + bird.slug + ".png?v=20260712d";
    e.img = im;
    cache[key] = e;
    return e;
  }

  // メイン: tier の鳥を (x,y) に半径 r・回転 angle で描く
  // puzzleKey を明示した呼び出し（図鑑）は定義順の birds を、
  // 省略した呼び出し（盤面・つぎプレビュー）は抽選済みの TORI.BIRDS を参照する
  function drawBird(ctx, tier, x, y, r, angle, puzzleKey) {
    const pk = puzzleKey || TORI.state.puzzleKey;
    const bird = puzzleKey
      ? TORI.PUZZLES[pk].birds[tier - 1]
      : TORI.BIRDS[tier - 1];
    if (!bird) return;
    const e = getEntry(pk, bird, tier);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    if (e.loaded) {
      const s = r * IMG_SCALE;
      ctx.drawImage(e.img, -s, -s, s * 2, s * 2);
    } else {
      // 読み込み待ち・失敗時のプレースホルダー
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.fill();
    }
    ctx.restore();
  }

  // 図鑑用: シルエット（未解放）
  function drawSilhouette(ctx, tier, x, y, r) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#B9B4A8";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.96, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FBF9F5";
    ctx.font = "bold " + Math.round(r * 0.9) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", 0, r * 0.05);
    ctx.restore();
  }

  TORI.drawBird = drawBird;
  TORI.drawSilhouette = drawSilhouette;
})();
