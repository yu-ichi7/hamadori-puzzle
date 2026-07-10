// 鳥のCanvas描画（ゲーム盤面と図鑑モーダルで共用）
// スタイル: 「コロン・フィールド」テイスト
//   - 丸いフォルム / フラット塗り / 均一チャコール線 / 白抜きの目 / アースカラー2〜3色
(function () {
  const OUTLINE = "#2E3A2C";

  function circle(ctx, x, y, r, fill, stroke) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) ctx.stroke();
  }

  // くちばし: len=長さ係数, droop=下がり具合, color
  function beak(ctx, r, color, len, droop) {
    ctx.fillStyle = color;
    ctx.beginPath();
    const bx = r * 0.78, by = -r * 0.14;
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + r * len * 0.7, by + r * droop * 0.5,
      bx + r * len, by + r * 0.1 + r * droop
    );
    ctx.quadraticCurveTo(bx + r * len * 0.5, by + r * 0.22, bx - r * 0.05, by + r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function eye(ctx, r, opts) {
    const ex = r * 0.42, ey = -r * 0.34;
    const ring = (opts && opts.ring) || "#FBF9F5";
    circle(ctx, ex, ey, r * 0.2, ring, true);   // 白抜き（または赤リング）
    circle(ctx, ex, ey, r * 0.1, "#2E3A2C", false); // 黒目
  }

  // 翼の切れ込みライン（内側ラインは最小限に）
  function wingLine(ctx, r, color) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.05);
    ctx.quadraticCurveTo(-r * 0.15, r * 0.35, r * 0.35, r * 0.28);
    ctx.strokeStyle = color || OUTLINE;
    ctx.stroke();
    ctx.strokeStyle = OUTLINE;
  }

  // メイン: tier の鳥を (x,y) に半径 r・回転 angle で描く
  function drawBird(ctx, tier, x, y, r, angle) {
    const b = TORI.BIRDS[tier - 1];
    if (!b) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle || 0);
    const lw = Math.max(1.4, r * 0.055);
    ctx.lineWidth = lw;
    ctx.strokeStyle = OUTLINE;
    ctx.lineJoin = "round";

    const R = r * 0.96;

    // ---- くちばし（体の後ろに描いて重ねる。先端が円の外に出る長さにする）----
    switch (tier) {
      case 4:  beak(ctx, r, b.c.beak, 0.65, 0.22); break;       // ハマシギ: 長め下カーブ
      case 8:  beak(ctx, r, b.c.beak, 0.68, 0.05); break;       // ミヤコドリ: 長い赤
      case 11: beak(ctx, r, b.c.beak, 0.62, 0.02); break;       // アオサギ: 長い黄
      case 9:  beak(ctx, r, b.c.beak, 0.45, 0.05); break;       // ユリカモメ: 赤
      case 10: beak(ctx, r, b.c.beak, 0.5, 0.05); break;        // ウミネコ: 黄
      default: beak(ctx, r, b.c.beak, 0.42, 0.08); break;       // 小型シギチ: 短い黒
    }

    // ---- 体（ベース円）----
    circle(ctx, 0, 0, R, b.c.body, false);

    // ---- 体内の模様（円でクリップして描く）----
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, R - lw * 0.4, 0, Math.PI * 2);
    ctx.clip();

    // 腹（下半分の淡色）: ダイゼンだけは「黒腹」
    ctx.fillStyle = b.c.belly;
    ctx.beginPath();
    ctx.ellipse(r * 0.12, r * 0.62, r * 0.95, r * 0.62, 0, 0, Math.PI * 2);
    ctx.fill();

    // 種ごとの描き分け
    switch (tier) {
      case 1: // トウネン: 赤褐色＋白腹のシンプル形
        wingLine(ctx, r);
        break;
      case 2: { // シロチドリ: 途切れた黒帯（左右の短い弧）
        ctx.strokeStyle = "#3A3A38";
        ctx.lineWidth = lw * 1.8;
        ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.62, Math.PI * 0.62, Math.PI * 0.88); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, r * 0.1, r * 0.62, Math.PI * 0.12, Math.PI * 0.38); ctx.stroke();
        ctx.lineWidth = lw; ctx.strokeStyle = OUTLINE;
        wingLine(ctx, r);
        break;
      }
      case 3: { // メダイチドリ: 胸のオレンジ帯
        ctx.fillStyle = b.c.band;
        ctx.beginPath();
        ctx.ellipse(r * 0.15, r * 0.18, r * 0.8, r * 0.3, -0.1, 0, Math.PI * 2);
        ctx.fill();
        wingLine(ctx, r);
        break;
      }
      case 4: { // ハマシギ: 腹の黒斑
        ctx.fillStyle = b.c.patch;
        ctx.beginPath();
        ctx.ellipse(r * 0.25, r * 0.55, r * 0.38, r * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        wingLine(ctx, r);
        break;
      }
      case 5: { // キョウジョシギ: 白顔＋黒胸帯＋赤褐まだら
        ctx.fillStyle = "#FBF9F5"; // 顔まわり白
        ctx.beginPath(); ctx.ellipse(r * 0.42, -r * 0.36, r * 0.42, r * 0.34, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3A3A38"; // 胸帯
        ctx.beginPath(); ctx.ellipse(r * 0.2, r * 0.12, r * 0.7, r * 0.22, -0.15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.c.mottle; // 背のまだら
        circle(ctx, -r * 0.45, -r * 0.35, r * 0.2, b.c.mottle, false);
        circle(ctx, -r * 0.1, -r * 0.55, r * 0.15, b.c.mottle, false);
        break;
      }
      case 6: { // オバシギ: 胸の黒斑点列
        ctx.fillStyle = b.c.spot;
        [[-0.25, 0.1], [0.05, 0.2], [0.35, 0.12], [-0.05, 0.38], [0.28, 0.4]].forEach(function (p) {
          circle(ctx, r * p[0], r * p[1], r * 0.07, b.c.spot, false);
        });
        wingLine(ctx, r);
        break;
      }
      case 7: { // ダイゼン: 夏羽の黒い顔〜腹（前半分黒）
        ctx.fillStyle = "#3A3A38";
        ctx.beginPath();
        ctx.ellipse(r * 0.42, r * 0.18, r * 0.62, r * 0.85, 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 8: // ミヤコドリ: 黒体＋白腹（ベースで表現済み）
        wingLine(ctx, r, "#FBF9F5");
        break;
      case 9: { // ユリカモメ: 頭の黒褐フード＋灰翼
        ctx.fillStyle = b.c.wing;
        ctx.beginPath(); ctx.ellipse(-r * 0.35, r * 0.1, r * 0.55, r * 0.4, 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = b.c.hood;
        ctx.beginPath(); ctx.ellipse(r * 0.38, -r * 0.38, r * 0.5, r * 0.42, 0, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 10: { // ウミネコ: 灰色の背＋くちばし先の赤点（くちばしは外側描画済み）
        ctx.fillStyle = b.c.wing;
        ctx.beginPath(); ctx.ellipse(-r * 0.3, -r * 0.05, r * 0.62, r * 0.45, 0.25, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 11: { // アオサギ: 白い顔＋黒い眉ライン
        ctx.fillStyle = "#F2F2EC";
        ctx.beginPath(); ctx.ellipse(r * 0.4, -r * 0.34, r * 0.46, r * 0.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = b.c.brow;
        ctx.lineWidth = lw * 1.6;
        ctx.beginPath();
        ctx.moveTo(r * 0.3, -r * 0.5);
        ctx.quadraticCurveTo(r * 0.05, -r * 0.62, -r * 0.12, -r * 0.42);
        ctx.stroke();
        ctx.lineWidth = lw; ctx.strokeStyle = OUTLINE;
        break;
      }
    }
    ctx.restore();

    // ---- 輪郭 ----
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();

    // ---- 目 ----
    if (tier === 8) eye(ctx, r, { ring: b.c.eyering }); // ミヤコドリは赤いアイリング
    else eye(ctx, r);

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
