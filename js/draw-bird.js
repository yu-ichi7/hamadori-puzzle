// 鳥の描画: AI生成イラスト（透過PNG）を読み込んで描く。ゲーム盤面と図鑑モーダルで共用
(function () {
  const cache = {}; // key: "puzzleKey|tier" -> { loaded, img, color }

  function getEntry(puzzleKey, tier) {
    const key = puzzleKey + "|" + tier;
    let e = cache[key];
    if (e) return e;
    const puzzle = TORI.PUZZLES[puzzleKey];
    const bird = puzzle && puzzle.birds[tier - 1];
    e = { loaded: false, img: null, color: (bird && bird.color) || "#B9B4A8" };
    if (bird) {
      const num = String(tier).padStart(2, "0");
      const slug = TORI_SLUGS[puzzleKey][tier - 1];
      const im = new Image();
      im.onload = function () { e.loaded = true; };
      im.onerror = function () { console.warn("鳥画像の読み込み失敗:", key); };
      im.src = "./assets/birds/" + puzzleKey + "/" + num + "-" + slug + ".png";
      e.img = im;
    }
    cache[key] = e;
    return e;
  }

  // ファイル名のスラッグ（ローマ字）。パズル追加時はここにも追記する
  const TORI_SLUGS = {
    shigichidori: ["tounen", "shirochidori", "medaichidori", "miyubishigi", "hamashigi",
      "kyoujoshigi", "obashigi", "daizen", "ooban", "oosorihashishigi", "miyakodori"],
    mori: ["kikuitadaki", "mejiro", "enaga", "yamagara", "shijuukara",
      "kogera", "shime", "mozu", "aogera", "kakesu", "fukurou"],
    mizube: ["kaitsuburi", "kogamo", "kinkurohajiro", "hoshihajiro", "hidorigamo",
      "oshidori", "magamo", "karugamo", "goisagi", "kosagi", "aosagi"],
    takaba: ["tsumi", "haitaka", "chougenbou", "hayabusa", "sashiba",
      "ootaka", "nosuri", "tobi", "kumataka", "inuwashi", "ojirowashi"],
  };

  // メイン: puzzleKey（省略時は現在選択中）の tier の鳥を (x,y) に半径 r・回転 angle で描く
  function drawBird(ctx, tier, x, y, r, angle, puzzleKey) {
    const pk = puzzleKey || TORI.state.puzzleKey;
    const e = getEntry(pk, tier);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    if (e.loaded) {
      ctx.drawImage(e.img, -r, -r, r * 2, r * 2);
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
