// assets/birds/**/*.png の透過余白を「少しだけ残して」トリムし、300px正方形で上書きする
// 前回は余白ゼロまでtrim()してしまい、翼の輪郭線がフレーム端で切れる不具合が出た。
// 今回は trim 後に一定率のパディングを足してから正方形化・リサイズする。
const fs = require("fs");
const path = require("path");
const sharp = require("C:/Users/user/Documents/02.system-make/illusto/node_modules/sharp");

const ROOT = path.join(__dirname, "..", "assets", "birds");
const SIZE = 300;
const PAD_RATIO = 0.05; // トリム後の長辺に対して、各辺に足す余白の割合

async function main() {
  const puzzles = fs.readdirSync(ROOT);
  for (const pz of puzzles) {
    const dir = path.join(ROOT, pz);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith(".png"); });
    for (const f of files) {
      const p = path.join(dir, f);
      // 1) まず輪郭ぎりぎりまでtrim（既存ファイルが余白ゼロでも安全）
      const trimmed = await sharp(p).trim().toBuffer();
      const meta = await sharp(trimmed).metadata();
      const rawSide = Math.max(meta.width, meta.height);
      // 2) 余白を追加した上で正方形の辺の長さを決める
      const pad = Math.round(rawSide * PAD_RATIO);
      const side = rawSide + pad * 2;
      const padded = await sharp(trimmed)
        .extend({
          top: Math.floor((side - meta.height) / 2),
          bottom: Math.ceil((side - meta.height) / 2),
          left: Math.floor((side - meta.width) / 2),
          right: Math.ceil((side - meta.width) / 2),
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .resize(SIZE, SIZE)
        .png({ compressionLevel: 9, palette: true })
        .toBuffer();
      fs.writeFileSync(p, padded);
      console.log("padded:", pz + "/" + f, meta.width + "x" + meta.height, "-> side" + side, "->", SIZE);
    }
  }
}

main().catch(function (e) { console.error(e); process.exit(1); });
