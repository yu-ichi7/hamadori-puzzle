// 正面顔デザインの確認用スクリプト（本番の index.html からは参照されない）
const fs = require("fs");
const path = require("path");
const { createCanvas } = require("C:/Users/user/Documents/02.system-make/illusto/node_modules/@napi-rs/canvas");

global.window = global;
const GAME = path.join(__dirname, "..");
eval(fs.readFileSync(path.join(GAME, "js/birds-data.js"), "utf8"));
eval(fs.readFileSync(path.join(GAME, "js/draw-bird.js"), "utf8"));

function render(name, tier, fn) {
  const size = 240;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#EFEBDC";
  ctx.fillRect(0, 0, size, size);
  fn(ctx, tier, size / 2, size / 2, size * 0.42, 0);
  const out = path.join(__dirname, name + ".png");
  fs.writeFileSync(out, canvas.toBuffer("image/png"));
  console.log("saved:", out);
}

render("shirochidori-front", 2, TORI.drawBirdFront);
