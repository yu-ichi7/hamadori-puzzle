// サービスワーカー: ゲーム一式を端末に保存して、電波が無くても遊べるようにする
// ゲームを更新したら CACHE_NAME の日付を変える（古いキャッシュは自動で捨てられる）
const CACHE_NAME = "toriatsume-v20260712b";

// 鳥の画像URLには ?v=... が付いて呼ばれるため、
// キャッシュ照合時はクエリを無視する（ignoreSearch）ことで確実にヒットさせる
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./vendor/matter.min.js",
  "./js/birds-data.js",
  "./js/draw-bird.js",
  "./js/audio.js",
  "./js/bgm.js",
  "./js/physics.js",
  "./js/merge.js",
  "./js/input.js",
  "./js/items.js",
  "./js/zukan.js",
  "./js/game.js",
  "./js/puzzle-select.js",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/birds/shigichidori/01-tounen.png",
  "./assets/birds/shigichidori/02-shirochidori.png",
  "./assets/birds/shigichidori/03-medaichidori.png",
  "./assets/birds/shigichidori/04-miyubishigi.png",
  "./assets/birds/shigichidori/05-hamashigi.png",
  "./assets/birds/shigichidori/06-kyoujoshigi.png",
  "./assets/birds/shigichidori/07-obashigi.png",
  "./assets/birds/shigichidori/08-daizen.png",
  "./assets/birds/shigichidori/09-ooban.png",
  "./assets/birds/shigichidori/10-oosorihashishigi.png",
  "./assets/birds/shigichidori/11-miyakodori.png",
  "./assets/birds/mori/01-kikuitadaki.png",
  "./assets/birds/mori/02-mejiro.png",
  "./assets/birds/mori/03-enaga.png",
  "./assets/birds/mori/04-yamagara.png",
  "./assets/birds/mori/05-shijuukara.png",
  "./assets/birds/mori/06-kogera.png",
  "./assets/birds/mori/07-shime.png",
  "./assets/birds/mori/08-mozu.png",
  "./assets/birds/mori/09-aogera.png",
  "./assets/birds/mori/10-kakesu.png",
  "./assets/birds/mori/11-fukurou.png",
  "./assets/birds/mizube/01-kaitsuburi.png",
  "./assets/birds/mizube/02-kogamo.png",
  "./assets/birds/mizube/03-kinkurohajiro.png",
  "./assets/birds/mizube/04-hoshihajiro.png",
  "./assets/birds/mizube/05-hidorigamo.png",
  "./assets/birds/mizube/06-oshidori.png",
  "./assets/birds/mizube/07-magamo.png",
  "./assets/birds/mizube/08-karugamo.png",
  "./assets/birds/mizube/09-goisagi.png",
  "./assets/birds/mizube/10-kosagi.png",
  "./assets/birds/mizube/11-aosagi.png",
  "./assets/birds/takaba/01-tsumi.png",
  "./assets/birds/takaba/02-haitaka.png",
  "./assets/birds/takaba/03-chougenbou.png",
  "./assets/birds/takaba/04-hayabusa.png",
  "./assets/birds/takaba/05-sashiba.png",
  "./assets/birds/takaba/06-ootaka.png",
  "./assets/birds/takaba/07-nosuri.png",
  "./assets/birds/takaba/08-tobi.png",
  "./assets/birds/takaba/09-kumataka.png",
  "./assets/birds/takaba/10-inuwashi.png",
  "./assets/birds/takaba/11-ojirowashi.png",
];

// インストール時: 全ファイルを端末に保存
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

// 有効化時: 古いバージョンのキャッシュを掃除
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NAME) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// 同じレスポンスをキャッシュに保存する（同一オリジンの正常応答のみ）
function saveToCache(request, res) {
  if (res && res.status === 200 && res.type === "basic") {
    const copy = res.clone();
    caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
  }
  return res;
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  // ページ本体（HTML）と中身のコード（js/css）は「ネット優先」。
  // これをキャッシュ優先にすると、ゲームを更新しても古い版が表示され続けてしまう。
  // 電波が無いときだけキャッシュに切り替わるので、オフライン再生は保たれる。
  const url = new URL(e.request.url);
  const isCode = /\.(js|css)$/.test(url.pathname);
  const isPage = e.request.mode === "navigate";

  if (isPage || isCode) {
    e.respondWith(
      fetch(e.request)
        .then(function (res) { return saveToCache(e.request, res); })
        .catch(function () {
          return caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
            return hit || caches.match("./index.html");
          });
        })
    );
    return;
  }

  // 画像などの重い素材は「キャッシュ優先」。一度取れば以後は通信しない。
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        return saveToCache(e.request, res);
      });
    })
  );
});
