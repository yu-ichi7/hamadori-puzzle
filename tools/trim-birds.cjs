// assets/birds/**/*.png の透過余白をトリムして300px正方形で上書きする
// （AI生成PNGは余白が広く、物理円より絵が小さく見えて鳥同士の隙間が目立つため）
const fs = require("fs");
const path = require("path");
const sharp = require("C:/Users/user/Documents/02.system-make/illusto/node_modules/sharp");

const ROOT = path.join(__dirname, "..", "assets", "birds");
const SIZE = 300;

async function main() {
  const puzzles = fs.readdirSync(ROOT);
  for (const pz of puzzles) {
    const dir = path.join(ROOT, pz);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = fs.readdirSync(dir).filter(function (f) { return f.endsWith(".png"); });
    for (const f of files) {
      const p = path.join(dir, f);
      // trim: 透過(アルファ0)の余白を切り落とす → 长辺基準で正方形にパディング → SIZEに縮小
      const trimmed = await sharp(p).trim().toBuffer();
      const meta = await sharp(trimmed).metadata();
      const side = Math.max(meta.width, meta.height);
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
      console.log("trimmed:", pz + "/" + f, meta.width + "x" + meta.height, "->", SIZE);
    }
  }
}

main().catch(function (e) { console.error(e); process.exit(1); });
