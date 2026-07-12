// 鳥あつめパズル: 鳥の全定義
// TIER（半径・スコア＝段位の形）と PUZZLES（見た目・生態＝種）を分離。
// バランス調整は TORI.TIER の数字を、鳥の入れ替えは各 PUZZLES の birds 配列を触るだけでOK
window.TORI = window.TORI || {};

// 段位ごとの物理形状（4パズル共通）。radius=物理円の半径(px)、score=三角数（合体で生まれた時の加点）
TORI.TIER = {
  radius: [18, 22, 27, 33, 40, 48, 58, 69, 82, 96, 112],
  score: [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66],
};

// slug は assets/birds/<puzzleKey>/<番号>-<slug>.png の画像ファイル名と対応
TORI.PUZZLES = {
  shigichidori: {
    key: "shigichidori", name: "干潟の鳥パズル",
    subtitle: "〜浜辺の鳥をくっつけて、大きく育てよう〜",
    bg: { sky1: "#DDEAF0", sky2: "#EFEBDC", sky3: "#E4D5B5" },
    birds: [
      { name: "トウネン", slug: "tounen", len: "13〜16cm", color: "#C97A4A",
        trivia: "名前は「当年（その年生まれ）の子のように小さい」ことから。スズメサイズなのに年間約2万5千kmも渡る、小さな大旅行家。" },
      { name: "シロチドリ", slug: "shirochidori", len: "15〜17cm", color: "#D9C9A3",
        trivia: "砂浜そっくりの色をした「保護色の名手」。胸の黒帯が左右で途切れているのが最大の見分けポイント。" },
      { name: "メダイチドリ", slug: "medaichidori", len: "19〜22cm", color: "#B9895E",
        trivia: "大きな目が名前の由来（目大千鳥）。渡りの直前は体重の約半分が脂肪になるほど食いだめして海を越える。" },
      { name: "ミユビシギ", slug: "miyubishigi", len: "18〜21cm", color: "#D6D2C4",
        trivia: "後ろ指（第1趾）がなく、指が3本だけ。波打ち際を小走りで行ったり来たりする、渚のせわしないダンサー。冬羽は全身が白っぽくなる。" },
      { name: "ハマシギ", slug: "hamashigi", len: "19〜22cm", color: "#C97A4A",
        trivia: "夏羽はおなかに黒いエプロンのような斑が出るのが目印。くちばしの先がわずかに下にカーブしている。" },
      { name: "キョウジョシギ", slug: "kyoujoshigi", len: "22〜24cm", color: "#8A5A3C",
        trivia: "「京女」は夏羽の華やかなまだら模様を京都の女性の着物に見立てた名前。石をひっくり返してエサを探す名人。" },
      { name: "オバシギ", slug: "obashigi", len: "26〜28cm", color: "#9BA39B",
        trivia: "漢字では「姥鷸」。灰色がかった落ち着いた羽色をおばあさんに見立てたという説がある、ずんぐり体型のシギ。" },
      { name: "ダイゼン", slug: "daizen", len: "28〜30cm", color: "#AEB4B8",
        trivia: "名前は宮中の食事を司る「大膳職」に由来（それほど美味だったらしい）。夏羽は顔からおなかが真っ黒になる。" },
      { name: "オオバン", slug: "ooban", len: "32〜39cm", color: "#2E2E2C",
        trivia: "水面を上手に泳ぐクイナの仲間。額の白い板（額板）が名前の由来で、これまでの浜辺の鳥たちとはひと味違う「泳ぐ鳥」。" },
      { name: "オオソリハシシギ", slug: "oosorihashishigi", len: "37〜41cm", color: "#C1633B",
        trivia: "上に反ったくちばしが名前の由来（反嘴＝そりはし）。夏羽のオスは全身が美しいレンガ色に染まる、渡りの距離では鳥類屈指ともいわれる健脚の旅鳥。" },
      { name: "ミヤコドリ", slug: "miyakodori", len: "40〜47cm", color: "#3A3A38",
        trivia: "黒・白・赤のコントラストが鮮やか。英名は「牡蠣捕り」だが、実際はムール貝やハマグリの方をよく食べる、浜の主役。" },
    ],
  },

  mori: {
    key: "mori", name: "森の鳥パズル",
    subtitle: "〜森の小鳥をくっつけて、フクロウを目指そう〜",
    bg: { sky1: "#D9E8D4", sky2: "#E8EBD8", sky3: "#C9D9B8" },
    birds: [
      { name: "キクイタダキ", slug: "kikuitadaki", len: "9〜10cm", color: "#7A8A6A",
        trivia: "日本最小級の鳥。頭の中央にある黄色（オスは橙色）の模様が名前の由来で「菊を戴く」姿に見立てられた。" },
      { name: "メジロ", slug: "mejiro", len: "11〜12cm", color: "#A8C97A",
        trivia: "目のまわりの白いふちどりが名前の由来。花の蜜が大好きで、梅や桜の枝にとまる姿は春の風物詩。" },
      { name: "エナガ", slug: "enaga", len: "13〜14cm", color: "#E8DED0",
        trivia: "体の割に長い尾羽が「柄杓（ひしゃく）の柄」に見えることが名前の由来。ふわふわの丸い体で「シマエナガ」の仲間として人気者。" },
      { name: "ヤマガラ", slug: "yamagara", len: "13〜14cm", color: "#C9895E",
        trivia: "おなかのオレンジ色が目印。人によく慣れる賢さで、江戸時代には芸を仕込まれる鳥として親しまれていた。" },
      { name: "シジュウカラ", slug: "shijuukara", len: "14〜15cm", color: "#3A3A38",
        trivia: "胸の黒いネクタイ模様が特徴。鳴き声を単語のように組み合わせて会話する「文法」を持つことが研究でわかっている。" },
      { name: "コゲラ", slug: "kogera", len: "15cm", color: "#8A7A5E",
        trivia: "日本最小のキツツキ。木をつつく「ドラミング」の音は身近な林でもよく聞こえる、森の大工さん。" },
      { name: "シメ", slug: "shime", len: "19cm", color: "#B9895E",
        trivia: "太くがっしりしたくちばしが特徴で、硬い木の実の殻も割って食べられる力持ち。冬に群れで日本にやってくる。" },
      { name: "モズ", slug: "mozu", len: "20cm", color: "#8A6A4A",
        trivia: "捕らえた獲物を木の枝に突き刺しておく「はやにえ」の習性で有名。鋭い鳴き声から「モズの高鳴き」という秋の言葉もある。" },
      { name: "アオゲラ", slug: "aogera", len: "29cm", color: "#6A8A5A",
        trivia: "日本固有種の緑色のキツツキ。「ケレケレケレ」という大きな声で鳴き、森の中でもよく響く。" },
      { name: "カケス", slug: "kakesu", len: "33cm", color: "#9A7A6A",
        trivia: "翼の鮮やかな水色の模様が目印。他の鳥や動物の声真似が得意で、どんぐりを土に埋めて隠す習性が森の木を増やす手助けにもなっている。" },
      { name: "フクロウ", slug: "fukurou", len: "50cm", color: "#8A7355",
        trivia: "首を270度近くも回せる森の王者。音を立てずに飛べる特殊な羽根で、夜の闇の中でもネズミなどの小さな物音を逃さない。" },
    ],
  },

  mizube: {
    key: "mizube", name: "水辺の鳥パズル",
    subtitle: "〜池や川の水鳥をくっつけよう〜",
    bg: { sky1: "#D6E6EC", sky2: "#E8EDE0", sky3: "#C4D8C0" },
    birds: [
      { name: "カイツブリ", slug: "kaitsuburi", len: "25〜29cm", color: "#7A5A3E",
        trivia: "日本で一番小さな水鳥のなかま。水に潜るのが得意で、危険を感じるとすぐに水中に隠れてしまう。" },
      { name: "コガモ", slug: "kogamo", len: "34〜38cm", color: "#8A5A3E",
        trivia: "日本にいるカモの中では最小級。オスの頭は栗色に緑の帯が入り、まるでアイマスクをつけたような模様。" },
      { name: "キンクロハジロ", slug: "kinkurohajiro", len: "40〜47cm", color: "#2E2E2C",
        trivia: "後頭部の長い冠羽と黄色い目が目印。「金黒羽白」の名の通り、黒い体に白い羽の模様がアクセントになっている。" },
      { name: "ホシハジロ", slug: "hoshihajiro", len: "42〜49cm", color: "#9A4A3A",
        trivia: "オスは赤茶色の頭と赤い目が鮮やか。水に潜って水草や貝を食べる、素潜りが得意なカモ。" },
      { name: "ヒドリガモ", slug: "hidorigamo", len: "42〜52cm", color: "#B9895E",
        trivia: "オスの額から頭頂にかけてクリーム色の筋が入るのが特徴。「ヒュー」という口笛のような鳴き声が名前の由来。" },
      { name: "オシドリ", slug: "oshidori", len: "41〜49cm", color: "#C9895E",
        trivia: "繁殖期のオスは金色の銀杏羽など、カモ類随一の華やかな姿になる。仲むつまじい夫婦の象徴として古くから親しまれてきた。" },
      { name: "マガモ", slug: "magamo", len: "59cm", color: "#4A6A4A",
        trivia: "光沢のある緑色の頭が目印で、アヒルの原種でもある。日本の水辺で最もよく見られるカモの代表格。" },
      { name: "カルガモ", slug: "karugamo", len: "58〜63cm", color: "#6A5A3E",
        trivia: "都会の池や川でも一年中見られる身近なカモ。くちばしの先の黄色いワンポイントが目印で、親子で行進する姿でも有名。" },
      { name: "ゴイサギ", slug: "goisagi", len: "57〜65cm", color: "#3A5A4A",
        trivia: "夜に活動する「夜ガラス」の異名を持つサギ。丸っこい体と赤い目が特徴で、若鳥はまだら模様の姿から「ホシゴイ」と呼ばれる。" },
      { name: "コサギ", slug: "kosagi", len: "55〜65cm", color: "#F2F2EC",
        trivia: "全身まっ白でくちばしは黒、足の指だけが黄色いのが目印。この黄色い足で水底をかき混ぜて魚を追い出して捕る。" },
      { name: "アオサギ", slug: "aosagi", len: "88〜98cm", color: "#8FA3AD",
        trivia: "「アオ」は古語で灰色のこと。飛ぶときは長い首をS字に折りたたむ、日本最大級のサギで水辺の王様。" },
    ],
  },

  takaba: {
    key: "takaba", name: "猛禽類パズル",
    subtitle: "〜猛禽をくっつけて空の王者へ〜",
    bg: { sky1: "#C9DCE8", sky2: "#DCE4D8", sky3: "#B8C9D4" },
    birds: [
      { name: "ツミ", slug: "tsumi", len: "27〜30cm", color: "#8A8A7A",
        trivia: "日本最小級のタカ。小鳥を狩る俊敏なハンターだが、近年は都市部の緑地でも繁殖するようになった。" },
      { name: "ハイタカ", slug: "haitaka", len: "32〜39cm", color: "#7A7A6A",
        trivia: "森の中を素早く飛び回り、小鳥を追い詰めて捕らえる狩りの名手。オスよりメスの方がひとまわり大きい。" },
      { name: "チョウゲンボウ", slug: "chougenbou", len: "33〜39cm", color: "#B9895E",
        trivia: "羽ばたきながら空中の一点に静止する「ホバリング」が得意で、上空から獲物を探す姿がよく見られる。" },
      { name: "ハヤブサ", slug: "hayabusa", len: "42〜49cm", color: "#5A5A5A",
        trivia: "急降下時の速度は時速300kmを超えるとも言われ、地球上で最も速い生き物のひとつ。断崖絶壁で子育てをする。" },
      { name: "サシバ", slug: "sashiba", len: "47〜51cm", color: "#8A6A4A",
        trivia: "秋になると群れをなして東南アジアへ渡る「タカの渡り」の代表種。里山の田んぼや畑でカエルやヘビを狩る。" },
      { name: "オオタカ", slug: "ootaka", len: "50〜56cm", color: "#6A6A5A",
        trivia: "鋭い目つきと精悍な姿から「鷹狩り」で古くから重用されてきた。名前は「大きなタカ」の意味。" },
      { name: "ノスリ", slug: "nosuri", len: "52〜59cm", color: "#9A8A6A",
        trivia: "上空を旋回しながら獲物を探す「鳥の見張り台」の異名を持つ。ネズミなどの小動物を主に狩る、身近な猛禽。" },
      { name: "トビ", slug: "tobi", len: "59〜69cm", color: "#7A6A4A",
        trivia: "「トンビ」の名でも親しまれる、日本で最も身近な猛禽。V字に開いた尾羽が上空での見分けポイント。" },
      { name: "クマタカ", slug: "kumataka", len: "71〜83cm", color: "#5A4A3A",
        trivia: "深い森にすむ「森の王者」。翼を広げると2mに達し、ウサギやヘビなど大きめの獲物も狩る力を持つ。" },
      { name: "イヌワシ", slug: "inuwashi", len: "75〜92cm", color: "#4A3A2A",
        trivia: "後頭部の金色がかった羽毛が名前の由来（英名Golden Eagle）。広大な縄張りを持ち、日本では絶滅が心配される希少種。" },
      { name: "オジロワシ", slug: "ojirowashi", len: "80〜94cm", color: "#4A4A48",
        trivia: "名前の通り、成鳥は尾羽が真っ白になるのが目印。北海道などで見られる、翼を広げると2m超にもなる日本最大級の猛禽。" },
    ],
  },
};

TORI.PUZZLE_ORDER = ["shigichidori", "mori", "mizube", "takaba"];

// 現在の選択状態（難易度は廃止＝常に11段）
TORI.state = { puzzleKey: "shigichidori", maxTier: 11 };

// 重み付き抽選ヘルパー
function toriWeightedPick(cands) {
  let total = 0;
  for (let i = 0; i < cands.length; i++) total += (cands[i].weight || 1);
  let r = Math.random() * total;
  for (let i = 0; i < cands.length; i++) {
    r -= (cands[i].weight || 1);
    if (r < 0) return cands[i].bird;
  }
  return cands[0].bird;
}

// アクティブなパズルを切り替える。TORI.BIRDS は「現在のパズルの11段」を指す派生キャッシュ。
// puzzle.pool = { <tier>: [ {bird:{name,slug,len,color,trivia}, weight:数字}, ... ] } が
// 定義されている段は、呼ぶたびに重み付き抽選で顔ぶれが変わる（社長の出現表を後から差し込める）。
// pool が無い段は birds[i] 固定。リスタートごとに呼び直すことで「毎回変わる」を実現する。
TORI.setPuzzle = function (key) {
  const puzzle = TORI.PUZZLES[key];
  TORI.state.puzzleKey = key;
  TORI.BIRDS = puzzle.birds.map(function (b, i) {
    const tier = i + 1;
    let chosen = b;
    if (puzzle.pool && puzzle.pool[tier] && puzzle.pool[tier].length > 0) {
      chosen = toriWeightedPick(puzzle.pool[tier]);
    }
    return Object.assign({}, chosen, {
      tier: tier,
      radius: TORI.TIER.radius[i],
      score: TORI.TIER.score[i],
    });
  });
};
TORI.setPuzzle(TORI.state.puzzleKey); // 初期化

// 落下で出てくるのは下位5段のみ（上位は合体でしか出ない）
TORI.DROPPABLE_MAX = 5;
// 落下の出やすさ（tier1〜5 の重み。社長の出現表で差し替え可能）
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
