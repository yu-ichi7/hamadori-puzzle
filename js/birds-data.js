// はまどりパズル: 鳥の全定義（バランス調整はこのファイルの数字を触るだけでOK）
window.TORI = window.TORI || {};

TORI.BIRDS = [
  // tier 1〜11（小さい順）。radius=物理円の半径(px)、score=この鳥が「合体で生まれた」ときの加点
  {
    tier: 1, name: "トウネン", len: "13〜16cm", radius: 18, score: 1,
    c: { body: "#C97A4A", belly: "#F7F1E3", beak: "#3A3A38" },
    trivia: "名前は「当年（その年生まれ）の子のように小さい」ことから。スズメサイズなのに年間約2万5千kmも渡る、小さな大旅行家。",
  },
  {
    tier: 2, name: "シロチドリ", len: "15〜17cm", radius: 22, score: 3,
    c: { body: "#D9C9A3", belly: "#FBF9F5", beak: "#3A3A38" },
    trivia: "砂浜そっくりの色をした「保護色の名手」。胸の黒帯が左右で途切れているのが最大の見分けポイント。",
  },
  {
    tier: 3, name: "メダイチドリ", len: "19〜22cm", radius: 27, score: 6,
    c: { body: "#B9895E", belly: "#F7F1E3", beak: "#3A3A38", band: "#E8823C" },
    trivia: "大きな目が名前の由来（目大千鳥）。渡りの直前は体重の約半分が脂肪になるほど食いだめして海を越える。",
  },
  {
    tier: 4, name: "ハマシギ", len: "19〜22cm", radius: 33, score: 10,
    c: { body: "#C97A4A", belly: "#FBF9F5", beak: "#3A3A38", patch: "#3A3A38" },
    trivia: "夏羽はおなかに黒いエプロンのような斑が出るのが目印。くちばしの先がわずかに下にカーブしている。",
  },
  {
    tier: 5, name: "キョウジョシギ", len: "22〜24cm", radius: 40, score: 15,
    c: { body: "#8A5A3C", belly: "#FBF9F5", beak: "#3A3A38", mottle: "#C97A4A" },
    trivia: "「京女」は夏羽の華やかなまだら模様を京都の女性の着物に見立てた名前。石をひっくり返してエサを探す名人。",
  },
  {
    tier: 6, name: "オバシギ", len: "26〜28cm", radius: 48, score: 21,
    c: { body: "#9BA39B", belly: "#FBF9F5", beak: "#3A3A38", spot: "#4A4A48" },
    trivia: "漢字では「姥鷸」。灰色がかった落ち着いた羽色をおばあさんに見立てたという説がある、ずんぐり体型のシギ。",
  },
  {
    tier: 7, name: "ダイゼン", len: "28〜30cm", radius: 58, score: 28,
    c: { body: "#AEB4B8", belly: "#3A3A38", beak: "#3A3A38" },
    trivia: "名前は宮中の食事を司る「大膳職」に由来（それほど美味だったらしい）。夏羽は顔からおなかが真っ黒になる。",
  },
  {
    tier: 8, name: "ミヤコドリ", len: "40〜47cm", radius: 69, score: 36,
    c: { body: "#3A3A38", belly: "#FBF9F5", beak: "#D94F30", eyering: "#D94F30" },
    trivia: "黒・白・赤のコントラストが鮮やか。英名は「牡蠣捕り」だが、実際はムール貝やハマグリの方をよく食べる。",
  },
  {
    tier: 9, name: "ユリカモメ", len: "37〜44cm", radius: 82, score: 45,
    c: { body: "#F7F1E3", belly: "#FBF9F5", beak: "#D94F30", hood: "#5A4638", wing: "#C9CFD2" },
    trivia: "東京都の「都民の鳥」。学名は「よく笑うカモメ」という意味で、にぎやかな鳴き声に由来する。",
  },
  {
    tier: 10, name: "ウミネコ", len: "44〜48cm", radius: 96, score: 55,
    c: { body: "#FBF9F5", belly: "#FBF9F5", beak: "#E8B93C", wing: "#B0B8BC", tip: "#D94F30" },
    trivia: "「ミャーオ」と猫のように鳴くのが名前の由来。日本の沿岸で夏も見られるカモメは、たいていこの鳥。",
  },
  {
    tier: 11, name: "アオサギ", len: "88〜98cm", radius: 112, score: 66,
    c: { body: "#8FA3AD", belly: "#E8EBE6", beak: "#E8B93C", brow: "#3A3A38" },
    trivia: "「アオ」は古語で灰色のこと。飛ぶときは長い首をS字に折りたたむ。日本最大級のサギで、これぞ浜の王様。",
  },
];

// 落下で出てくるのは下位5段のみ（上位は合体でしか出ない）
TORI.DROPPABLE_MAX = 5;
// 落下の出やすさ（tier1〜5 の重み）
TORI.DROP_WEIGHTS = [30, 25, 20, 15, 10];

// 盤面設計
TORI.BOARD = {
  W: 420,          // 論理幅
  H: 640,          // 論理高さ
  DROP_Y: 64,      // 落下スタンバイの高さ
  LINE_Y: 118,     // ゲームオーバーライン
  WALL: 80,        // 壁の厚み（画面外）
};

// 物理パラメータ（ヌルヌル感の調整はここ）
TORI.PHYS = {
  gravityY: 1.0,
  restitution: 0.2,
  friction: 0.4,
  frictionStatic: 0.5,
  density: 0.001,
  dropCooldownMs: 550,   // 連打防止
  overGraceMs: 1500,     // ライン越えの猶予
  stillSpeed: 1.2,       // 「ほぼ静止」とみなす速度（落下通過はこれより速いので誤判定しない）
};
