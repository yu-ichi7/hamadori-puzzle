// アイテム「ゆらす」の在庫管理
// 仕様: 1日1回ぶん回復（毎日最初の起動時に daily=1）＋ 5回プレー（ゲームオーバー）するごとに1回ぶん追加
(function () {
  const KEY = "torisuika_shake";
  const PLAYS_PER_BONUS = 5;

  const store = {
    get: function () {
      try { return JSON.parse(localStorage.getItem(KEY) || "null"); }
      catch (e) { return this._mem; }
    },
    set: function (v) {
      try { localStorage.setItem(KEY, JSON.stringify(v)); }
      catch (e) { this._mem = v; }
    },
    _mem: null,
  };

  function today() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // 読み込み＋日次回復
  function load() {
    let s = store.get();
    if (!s || typeof s !== "object") {
      s = { date: today(), daily: 1, bonus: 0, plays: 0 };
      store.set(s);
      return s;
    }
    if (s.date !== today()) {
      s.date = today();
      s.daily = 1; // 日が変わったら1回ぶん回復
      store.set(s);
    }
    return s;
  }

  function shakeStock() {
    const s = load();
    return (s.daily || 0) + (s.bonus || 0);
  }

  // 1回消費。在庫が無ければ false
  function useShake() {
    const s = load();
    if ((s.daily || 0) > 0) s.daily--;
    else if ((s.bonus || 0) > 0) s.bonus--;
    else return false;
    store.set(s);
    return true;
  }

  // ゲームオーバー1回＝1プレー。5プレーごとにボーナス在庫+1
  function onPlayFinished() {
    const s = load();
    s.plays = (s.plays || 0) + 1;
    if (s.plays >= PLAYS_PER_BONUS) {
      s.plays = 0;
      s.bonus = (s.bonus || 0) + 1;
    }
    store.set(s);
  }

  TORI.items = { shakeStock, useShake, onPlayFinished };
})();
