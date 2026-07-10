// 効果音: WebAudioでその場で合成（外部音声ファイル不要）
(function () {
  let ctx = null;
  let muted = false;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // 基本ビープ（freqHz から endFreq へスライド）
  function tone(freq, endFreq, dur, type, vol, delay) {
    if (muted) return;
    const a = ac();
    if (!a) return;
    const t0 = a.currentTime + (delay || 0);
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq || freq), t0 + dur);
    gain.gain.setValueAtTime(vol || 0.2, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const audio = {
    drop: function () {                       // ポコッ
      tone(240, 120, 0.09, "sine", 0.22);
    },
    merge: function (tier) {                  // ポンッ（大きい鳥ほど音程が上がる2音）
      const f = 300 + tier * 45;
      tone(f, f, 0.09, "triangle", 0.22);
      tone(f * 1.5, f * 1.5, 0.12, "sine", 0.18, 0.07);
    },
    unlock: function () {                     // 図鑑解放のキラッ
      tone(660, 660, 0.08, "sine", 0.15);
      tone(880, 880, 0.1, "sine", 0.15, 0.08);
      tone(1320, 1320, 0.16, "sine", 0.12, 0.16);
    },
    gameover: function () {                   // 残念…（下降音）
      tone(440, 110, 0.6, "sawtooth", 0.12);
    },
    toggleMute: function () {
      muted = !muted;
      return muted;
    },
    isMuted: function () { return muted; },
  };

  TORI.audio = audio;
})();
