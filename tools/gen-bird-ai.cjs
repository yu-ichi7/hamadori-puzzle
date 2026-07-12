// AI生成イラスト（gpt-image-1）で正面顔の丸い鳥スプライトを作るワンオフスクリプト
// illusto の node_modules / .env を流用（本番の index.html からは参照されない）
const fs = require("fs");
const path = require("path");

const ILLUSTO = "C:/Users/user/Documents/02.system-make/illusto";
const OpenAI = require(path.join(ILLUSTO, "node_modules/openai"));
const sharp = require(path.join(ILLUSTO, "node_modules/sharp"));

// .env から OPENAI_API_KEY を読む（値はログに出さない）
const envText = fs.readFileSync(path.join(ILLUSTO, ".env"), "utf8");
const m = /OPENAI_API_KEY\s*=\s*(\S+)/.exec(envText);
if (!m) { console.error("OPENAI_API_KEY が見つかりません"); process.exit(1); }
const client = new OpenAI({ apiKey: m[1] });

// 共通スタイル（コロン・フィールド × ゲームスプライト仕様。確定した案Aベース）
const STYLE = [
  "A cute round bird character sprite for a physics puzzle game, viewed directly from the front.",
  "The bird's plump body is a nearly perfect circle that fills the frame, like a ball. Minimal small wings tucked on each side, no visible legs or feet.",
  "Symmetrical front-facing face in the upper half: two round black eyes.",
  "Flat colors only, no gradients. Bold, uniform dark charcoal-green outline like a die-cut sticker.",
  "Minimal detail, kawaii but field-guide accurate. Earth-tone palette.",
  "Isolated on a fully transparent background. No text, no shadow, no ground, no branch.",
].join(" ");

// 種ごとの特徴（11種フル）。tier順。
const SPECIES = {
  tounen: [
    "The species is a Red-necked Stint (トウネン).",
    "Crown and back are a warm reddish-brown / rufous color. Face and belly are white.",
    "Throat and upper chest show a warm brick-red/rufous wash blending softly into the white belly below (a soft gradient patch, no hard line).",
    "Small black beak, short and straight, pointing slightly downward.",
  ].join(" "),
  shirochidori: [
    "The species is a Kentish Plover (シロチドリ).",
    "Crown color patch is a warm brick-red / terracotta color (a richer reddish-brown tone, not pale beige), but keep this colored patch NARROW — only a small cap on the very top of the head, not extending down the sides of the face or covering the cheeks.",
    "Face and belly/underside are a bright, nearly pure white.",
    "Two separate black patches sit on the upper chest, one on each side, like a necklace that is broken in the middle: each patch is THICKEST near the center and tapers narrower toward the outside, but they must NOT touch or connect — leave a clearly visible gap of white belly between them at the center.",
    "Thin black eye-stripe, small black beak.",
  ].join(" "),
  medaichidori: [
    "The species is a Lesser Sand Plover (メダイチドリ).",
    "Crown is grayish-brown. Face and belly are white.",
    "A thick, bold orange-red band sits across the upper chest like a necklace, wide and solid — one continuous unbroken band, NOT split in the middle.",
    "Beak is thick and short with a slightly swollen/bulbous black tip, pointing downward.",
  ].join(" "),
  miyubishigi: [
    "The species is a Sanderling (ミユビシギ).",
    "Overall very pale, almost entirely white and very pale silvery-gray body with no strong markings, like a small snowball.",
    "Crown is very pale silvery-gray. Face and belly are bright white.",
    "Beak is black, short, straight and slightly thick, pointing downward.",
  ].join(" "),
  hamashigi: [
    "The species is a Dunlin (ハマシギ).",
    "Crown and back are reddish-brown/rufous. Face is white.",
    "Belly has one large solid black patch covering the lower-center area, like a black bib.",
    "Beak is black, noticeably long, drooping gently downward at the tip.",
  ].join(" "),
  kyoujoshigi: [
    "The species is a Ruddy Turnstone (キョウジョシギ).",
    "Bold harlequin pattern: crown and back are a patchwork of black, white, and rich chestnut-brown mottled patches.",
    "Chest has a solid black band. Belly is white.",
    "Beak is short, sturdy, black, with a very slight upward tilt at the tip.",
  ].join(" "),
  obashigi: [
    "The species is a Great Knot (オバシギ).",
    "Crown and back are a plain soft gray. Face and belly are white.",
    "A row of small round black spots is scattered across the upper chest, NOT a solid band — individual dots.",
    "Beak is black, medium length, straight, slightly thick, pointing downward.",
  ].join(" "),
  daizen: [
    "The species is a Grey Plover (ダイゼン).",
    "Crown and back are mottled silvery-gray and white (speckled pattern).",
    "Face, throat, chest and belly are entirely solid black, like wearing a black mask and bib down to the belly, with a thin white band separating the black face from the gray crown.",
    "Beak is black, short, thick, with a rounded tip.",
  ].join(" "),
  ooban: [
    "The species is a Common Coot (オオバン), a swimming waterbird, visually distinct from the other shorebirds.",
    "The entire body is solid black / dark charcoal-gray (crown, face, and belly all the same dark color, no white belly patch).",
    "A small white frontal shield patch sits right above the beak on the forehead.",
    "Beak is pale ivory-white, short, and slightly conical.",
  ].join(" "),
  oosorihashishigi: [
    "The species is a Bar-tailed Godwit (オオソリハシシギ).",
    "Crown and back are a rich brick-red / rufous color, deeply saturated.",
    "Face and belly are also warm reddish-orange, only slightly paler than the crown (NOT white).",
    "Beak is long, thin, and distinctly upturned/upcurved, pink at the base and black at the tip.",
  ].join(" "),
  miyakodori: [
    "The species is a Eurasian Oystercatcher (ミヤコドリ).",
    "Crown, face and back are solid black. Belly is bright white, with a crisp, clean, mostly straight boundary between the black chest and white belly.",
    "Eyes have a bold red ring around them.",
    "Beak is long, thick, and bright orange-red, pointing downward — the most prominent feature of the bird.",
  ].join(" "),
};

// もりパズル（森の小鳥→フクロウ）
const SPECIES_MORI = {
  kikuitadaki: [
    "The species is a Goldcrest (キクイタダキ), Japan's smallest bird.",
    "Overall body is olive-green. A bright yellow-orange stripe runs along the very top of the head (a small crest patch), bordered by thin black lines on each side.",
    "Face and belly are pale yellowish-green. Tiny black beak, very short and thin, pointing slightly downward.",
  ].join(" "),
  mejiro: [
    "The species is a Japanese White-eye (メジロ).",
    "Overall body is a fresh yellow-green. Belly is pale grayish-white.",
    "The single most important feature: a bold, thick white ring encircling each eye (white eye-ring), standing out sharply against the green face.",
    "Small black beak, thin and slightly curved, pointing downward.",
  ].join(" "),
  enaga: [
    "The species is a Long-tailed Tit (エナガ), very round and fluffy.",
    "Face and belly are almost entirely fluffy white. Back and sides have a soft dusty-pink blush.",
    "A thin black stripe runs above each eye toward the back of the head.",
    "Tiny stubby black beak, very short, almost cute and inconspicuous.",
  ].join(" "),
  yamagara: [
    "The species is a Varied Tit (ヤマガラ).",
    "Crown is black. Cheeks/face are cream-white. Nape is buffy orange.",
    "Belly and chest are a warm rich orange/chestnut color, a strong contrast against the black head.",
    "Small black beak, short and straight, pointing downward.",
  ].join(" "),
  shijuukara: [
    "The species is a Japanese Tit (シジュウカラ).",
    "Head is glossy black, cheeks are bright white (an oval white patch on each side of the face). Back is olive-green to gray.",
    "A bold black stripe runs down the center of the white/yellow belly like a necktie, widening toward the bottom.",
    "Small black beak, short, pointing downward.",
  ].join(" "),
  kogera: [
    "The species is a Japanese Pygmy Woodpecker (コゲラ), Japan's smallest woodpecker.",
    "Overall body has fine horizontal black-and-white barred/striped pattern across the back and wings, like a ladder pattern. Face and belly are pale grayish-white with light streaking.",
    "Beak is black, short, straight, and chisel-like (slightly more pointed than other small birds), pointing downward.",
  ].join(" "),
  shime: [
    "The species is a Japanese Grosbeak (シメ).",
    "Head is warm orange-brown. Body/belly is a soft pinkish-buff/tan color. Throat has a small black patch just under the beak.",
    "The single most important feature: an extremely thick, massive, pale pinkish-ivory conical beak, much bigger and heavier than a typical small bird's beak — this powerful seed-cracking beak dominates the face.",
  ].join(" "),
  mozu: [
    "The species is a Bull-headed Shrike (モズ).",
    "Crown and nape are soft gray. Back is reddish-brown/rufous.",
    "A bold black mask (eye-stripe) runs through each eye like a bandit mask, contrasting with the pale gray head.",
    "Beak is black, short, sturdy, with a slight hook at the very tip, pointing downward.",
  ].join(" "),
  aogera: [
    "The species is a Japanese Green Woodpecker (アオゲラ).",
    "Overall body is a mossy olive-green. A patch of red feathers sits on the top of the head (crown).",
    "Face has a black mustache-like stripe near the beak. Belly is pale green with faint scaly markings.",
    "Beak is dark gray, medium-long, straight, and chisel-like, pointing downward.",
  ].join(" "),
  kakesu: [
    "The species is a Eurasian Jay (カケス).",
    "Overall body is a soft pinkish-grayish-brown. A small patch of vivid sky-blue with fine black barring sits on each side near the wings (like small blue patches at the edges of the circle).",
    "Face has a black mustache-like stripe. A short black crest/streaks on top of the head.",
    "Beak is black, short, sturdy, pointing downward.",
  ].join(" "),
  fukurou: [
    "The species is a Ural Owl (フクロウ), the king of the forest.",
    "The entire face is a large round pale facial disc (grayish-white) that fills most of the head, bordered by a thin dark rim — this large flat facial disc is the most defining feature, much bigger and rounder than any other bird's face.",
    "Body/belly below the face is streaked brown and white. Overall coloring is warm brown and cream.",
    "Beak is small, pale yellowish, short, mostly hidden beneath facial feathers, pointing downward. Eyes are notably large and dark.",
  ].join(" "),
};

// みずべパズル（池・川の水鳥→アオサギ）
const SPECIES_MIZUBE = {
  kaitsuburi: [
    "The species is a Little Grebe (カイツブリ).",
    "Overall body is dark chestnut-brown. Cheeks and neck sides are a warm reddish-chestnut color, contrasting with a darker cap on top of the head.",
    "A small pale yellowish spot sits at the base of the beak.",
    "Beak is dark gray, short, thin, and pointed, pointing downward.",
  ].join(" "),
  kogamo: [
    "The species is a Eurasian Teal (コガモ), the smallest dabbling duck.",
    "Head is rich chestnut/reddish-brown overall, with a bold glossy green band running through and behind each eye like a mask, outlined with a thin cream/yellow line.",
    "Body/belly is pale gray.",
    "Beak is dark gray, flat and duck-like, medium width, pointing downward.",
  ].join(" "),
  kinkurohajiro: [
    "The species is a Tufted Duck (キンクロハジロ).",
    "Overall body is glossy black. A long thin drooping crest/tuft hangs from the back of the head.",
    "Eyes are bright golden-yellow, very striking against the black head.",
    "A small patch of white is visible on the flanks/sides near the bottom edge.",
    "Beak is bluish-gray with a black tip, medium width, flat, pointing downward.",
  ].join(" "),
  hoshihajiro: [
    "The species is a Common Pochard (ホシハジロ).",
    "Head and neck are a rich reddish-chestnut color, rounded and smooth.",
    "Eyes are red. Chest is black, body/belly is pale gray.",
    "Beak is bluish-gray with a black tip and a black base, flat and duck-like, pointing downward.",
  ].join(" "),
  hidorigamo: [
    "The species is a Eurasian Wigeon (ヒドリガモ).",
    "Head is reddish-chestnut overall, with a bold cream-yellow stripe running from the beak up over the top of the head (forehead to crown).",
    "Body/belly is soft pinkish-gray.",
    "Beak is small, pale bluish-gray with a black tip, pointing downward.",
  ].join(" "),
  oshidori: [
    "The species is a Mandarin Duck (オシドリ), the most colorful and ornate of all.",
    "Head has a rich mix of colors: greenish-purple crown, long reddish-orange and white face stripes swept back like hair, and orange whisker feathers on the cheeks.",
    "One large upright orange-and-cream fan-shaped 'sail' feather is visible on each side near the wings.",
    "Belly is white, chest is deep purplish-blue with two vertical white bars.",
    "Beak is small, reddish-pink at the base fading to pale tip, pointing downward.",
  ].join(" "),
  magamo: [
    "The species is a Mallard (マガモ).",
    "Head and neck are glossy iridescent bottle-green, with a thin white ring encircling the base of the neck.",
    "Chest is rich chestnut-brown, belly is pale gray.",
    "Beak is yellowish-green (olive-yellow), flat and duck-like, medium width, pointing downward.",
  ].join(" "),
  karugamo: [
    "The species is a Eastern Spot-billed Duck (カルガモ).",
    "Overall body is plain warm brown with subtle scaly feather-edge patterning. Face is pale cream with a dark cap on top of the head and a dark stripe through the eye.",
    "The single most important feature: the black beak has a bright yellow tip, like it was dipped in yellow paint — this two-tone beak is the key identifier.",
  ].join(" "),
  goisagi: [
    "The species is a Black-crowned Night Heron (ゴイサギ).",
    "Crown and back are a deep glossy blue-black. Face and belly are pale gray-white.",
    "Eyes are large and bright red, very striking.",
    "Two thin white plume feathers trail from the back of the head.",
    "Beak is black, thick, sturdy, dagger-like, pointing downward.",
  ].join(" "),
  kosagi: [
    "The species is a Little Egret (コサギ).",
    "Entire body is pure white with no markings. A couple of thin wispy white plume feathers droop from the back of the head.",
    "Beak is black, long, thin, and sharply pointed, pointing downward.",
    "(Note: the bird's signature yellow foot-feet are not visible in this front-facing head/body portrait, so keep the design purely white and black.)",
  ].join(" "),
  aosagi: [
    "The species is a Grey Heron (アオサギ), the largest and most majestic here.",
    "Crown center is white, with a bold black stripe sweeping back from above each eye into a thin drooping black plume at the back of the head.",
    "Face and neck are pale gray-white with fine dark streaking. Body is soft blue-gray.",
    "Beak is pale yellowish-orange, very long, thick, and dagger-like, pointing downward — the most prominent and imposing beak of all the birds.",
  ].join(" "),
};

// たかばパズル（猛禽→オジロワシ）
const SPECIES_TAKABA = {
  tsumi: [
    "The species is a Japanese Sparrowhawk (ツミ), the smallest here.",
    "Crown and back are soft blue-gray. Eyes are yellow-orange with a sharp, focused predator gaze.",
    "Chest and belly have fine, dense orange-rufous horizontal barring on a white background.",
    "Beak is small, dark gray-black, sharply hooked at the tip, pointing downward.",
  ].join(" "),
  haitaka: [
    "The species is a Eurasian Sparrowhawk (ハイタカ).",
    "Crown and back are slate gray. Eyes are yellow, intense and alert.",
    "Chest and belly have fine, narrow gray-brown horizontal barring on white.",
    "Beak is dark gray-black, hooked at the tip, pointing downward.",
  ].join(" "),
  chougenbou: [
    "The species is a Common Kestrel (チョウゲンボウ).",
    "Crown and nape are soft blue-gray. Back is warm reddish-brown with small black spots.",
    "Face has a thin dark mustache mark below the eye. Chest/belly is buffy-cream with small black streaks.",
    "Beak is small, blue-gray with a black tip, hooked, pointing downward.",
  ].join(" "),
  hayabusa: [
    "The species is a Peregrine Falcon (ハヤブサ), the fastest animal on Earth.",
    "Crown and back are dark blue-slate gray, almost blackish on top of the head like a hood.",
    "Cheeks are white with a bold thick black mustache/sideburn mark below each eye — this bold facial marking is the key identifier.",
    "Chest is white, belly has fine dark barring.",
    "Beak is blue-gray with a black hooked tip, pointing downward.",
  ].join(" "),
  sashiba: [
    "The species is a Grey-faced Buzzard (サシバ).",
    "Crown and back are warm brown. Face/cheeks have a distinct pale bluish-gray wash.",
    "Chest has bold reddish-brown horizontal barring on a white/cream background.",
    "Beak is dark gray-black, hooked, pointing downward.",
  ].join(" "),
  ootaka: [
    "The species is a Northern Goshawk (オオタカ).",
    "Crown and back are slate gray. A bold white stripe (supercilium) arches above each fierce orange-red eye like an eyebrow.",
    "Chest and belly have fine, dense gray horizontal barring on white — a very neat, precise pattern.",
    "Beak is dark gray-black, strongly hooked, pointing downward.",
  ].join(" "),
  nosuri: [
    "The species is a Eastern Buzzard (ノスリ).",
    "Crown and back are warm mid-brown. Face is paler brown with a dark patch around each eye.",
    "Chest/belly is a mottled cream and brown patchwork, irregular and blotchy rather than neat barring.",
    "Beak is dark gray, hooked, medium size, pointing downward.",
  ].join(" "),
  tobi: [
    "The species is a Black Kite (トビ), the most familiar raptor.",
    "Overall body is plain warm brown with subtle darker streaking. Face is brown with a pale grayish patch near the beak.",
    "Eyes are dark brown.",
    "Beak is black, hooked, with a small patch of bare yellow skin (cere) at the base near the nostrils, pointing downward.",
  ].join(" "),
  kumataka: [
    "The species is a Mountain Hawk-Eagle (クマタカ), forest king.",
    "Crown has a short dark crest of feathers standing up slightly. Overall coloring is deep dark brown.",
    "A bold thick dark brown mustache/sideburn mark runs below each fierce yellow-orange eye.",
    "Chest/belly has bold dark brown streaking on a cream background.",
    "Beak is dark gray-black, large, powerfully hooked, pointing downward.",
  ].join(" "),
  inuwashi: [
    "The species is a Golden Eagle (イヌワシ).",
    "Crown and nape have a warm golden-buff wash (like light shining on the back of the head), while the rest of the face and back are deep dark brown.",
    "Eyes are dark brown with a fierce, powerful gaze.",
    "Chest/belly is uniform deep dark brown.",
    "Beak is dark gray-black at the tip fading to yellow at the base, large and powerfully hooked, pointing downward.",
  ].join(" "),
  ojirowashi: [
    "The species is a White-tailed Eagle (オジロワシ), the largest and most majestic of all, the sky king.",
    "Head and neck are pale sandy-buff/cream, contrasting with a dark brown body — like wearing a pale hood.",
    "Eyes are pale yellow, piercing.",
    "Chest/belly is deep dark brown.",
    "The single most important feature: an enormous, massive bright yellow beak, thick and powerfully hooked, much larger and more prominent than any other bird's beak — dominating the face.",
  ].join(" "),
};

const PUZZLES = {
  shigichidori: { species: SPECIES, order: ["tounen", "shirochidori", "medaichidori", "miyubishigi", "hamashigi",
    "kyoujoshigi", "obashigi", "daizen", "ooban", "oosorihashishigi", "miyakodori"] },
  mori: { species: SPECIES_MORI, order: ["kikuitadaki", "mejiro", "enaga", "yamagara", "shijuukara",
    "kogera", "shime", "mozu", "aogera", "kakesu", "fukurou"] },
  mizube: { species: SPECIES_MIZUBE, order: ["kaitsuburi", "kogamo", "kinkurohajiro", "hoshihajiro", "hidorigamo",
    "oshidori", "magamo", "karugamo", "goisagi", "kosagi", "aosagi"] },
  takaba: { species: SPECIES_TAKABA, order: ["tsumi", "haitaka", "chougenbou", "hayabusa", "sashiba",
    "ootaka", "nosuri", "tobi", "kumataka", "inuwashi", "ojirowashi"] },
};

async function genOne(puzzleKey, name, speciesText, n, outDir) {
  const prompt = STYLE + " " + speciesText;
  console.log("生成中:", puzzleKey + "/" + name, "x" + n);
  const res = await client.images.generate({
    model: "gpt-image-1",
    prompt: prompt,
    size: "1024x1024",
    quality: "medium",
    background: "transparent",
    n: n,
  });
  for (let i = 0; i < res.data.length; i++) {
    const buf = Buffer.from(res.data[i].b64_json, "base64");
    const raw = path.join(outDir, name + "-ai-" + (i + 1) + ".png");
    await sharp(buf).resize(512, 512).png().toFile(raw);
    console.log("saved:", raw);
  }
}

async function main() {
  const arg = process.argv[2]; // "puzzleKey" | "puzzleKey:species" | "puzzleKey:species1,species2" | "all"
  const n = parseInt(process.argv[3] || "1", 10);
  const outDir = __dirname; // tools/ 直下（レビュー用。確定後に assets/ へ手動配置）

  if (!arg || arg === "all") {
    for (const puzzleKey of Object.keys(PUZZLES)) {
      const { species, order } = PUZZLES[puzzleKey];
      for (const name of order) await genOne(puzzleKey, name, species[name], n, outDir);
    }
    return;
  }

  const [puzzleKey, namesArg] = arg.split(":");
  const puzzle = PUZZLES[puzzleKey];
  if (!puzzle) { console.error("不明なパズル:", puzzleKey); process.exit(1); }
  const names = namesArg ? namesArg.split(",") : puzzle.order;
  for (const name of names) {
    if (!puzzle.species[name]) { console.error("不明な種:", name); continue; }
    await genOne(puzzleKey, name, puzzle.species[name], n, outDir);
  }
}

main().catch(function (e) {
  console.error("エラー:", e.message);
  process.exit(1);
});
