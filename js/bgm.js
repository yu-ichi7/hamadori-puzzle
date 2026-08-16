// BGM: WebAudioでその場合成するループ音楽（音源ファイル不要・通信量ゼロ）
// パズルごとにテーマを変える。効果音(audio.js)とは別系統で、ミュートは共有する。
(function () {
  let ctx = null;
  let master = null;     // BGM全体の音量つまみ
  let timer = null;      // 次の小節を予約するためのタイマー
  let nextNoteTime = 0;  // 次に鳴らす音の予定時刻
  let step = 0;          // 何個目の音か
  let current = null;    // 再生中のテーマ
  let playing = false;

  // ---- 音階（周波数）。数値は音名から算出 ----
  // A4=440Hz を基準に、半音を12等分で計算する
  function note(name) {
    const table = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    const m = /^([A-G])(#?)(\d)$/.exec(name);
    if (!m) return 440;
    const semitone = table[m[1]] + (m[2] ? 1 : 0);
    const octave = parseInt(m[3], 10);
    // MIDIノート番号に換算してから周波数へ
    const midi = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // ---- パズルごとのテーマ ----
  // scale: 使う音階、bass: 低音の進行、tempo: 1音あたりの秒数、
  // wave: 音色、reverb: 余韻の長さ、bird: 鳥のさえずり風の装飾を入れるか
  const THEMES = {
    // 干潟：波の音のような揺らぎ＋ゆったりした五音音階
    shigichidori: {
      tempo: 0.42, wave: "sine", vol: 0.10, decay: 1.6,
      scale: ["C4", "D4", "F4", "G4", "A4", "C5", "D5", "F5"],
      bass: ["C2", "C2", "A1", "A1", "F2", "F2", "G2", "G2"],
      chirp: 0.10, chirpHigh: ["C6", "D6", "F6"],
      pattern: [0, 2, 4, 2, 5, 4, 2, 0, 1, 3, 5, 3, 4, 2, 1, 0],
    },
    // 森：木琴のようなコロコロした音＋小鳥のさえずり多め
    mori: {
      tempo: 0.30, wave: "triangle", vol: 0.09, decay: 0.9,
      scale: ["G4", "A4", "B4", "D5", "E5", "G5", "A5", "B5"],
      bass: ["G2", "G2", "E2", "E2", "C2", "C2", "D2", "D2"],
      chirp: 0.22, chirpHigh: ["B6", "D7", "E6", "G6"],
      pattern: [0, 2, 4, 5, 4, 2, 1, 3, 5, 7, 5, 3, 2, 4, 1, 0],
    },
    // 水辺：水滴が落ちるような、静かで間のある音
    mizube: {
      tempo: 0.50, wave: "sine", vol: 0.11, decay: 2.2,
      scale: ["D4", "F4", "G4", "A4", "C5", "D5", "F5", "A5"],
      bass: ["D2", "D2", "B1", "B1", "G2", "G2", "A2", "A2"],
      chirp: 0.08, chirpHigh: ["D6", "F6", "A6"],
      pattern: [0, 3, 5, 3, 2, 4, 6, 4, 1, 3, 5, 7, 4, 2, 3, 0],
    },
    // 猛禽：空を渡るような、低く広がりのある荘厳な音
    takaba: {
      tempo: 0.56, wave: "sawtooth", vol: 0.07, decay: 2.6,
      scale: ["A3", "C4", "D4", "E4", "G4", "A4", "C5", "E5"],
      bass: ["A1", "A1", "F1", "F1", "D2", "D2", "E2", "E2"],
      chirp: 0.05, chirpHigh: ["A5", "C6"],
      pattern: [0, 2, 4, 5, 4, 2, 0, 3, 5, 7, 5, 3, 2, 4, 2, 0],
    },
  };

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
      master = ctx.createGain();
      master.gain.value = 1;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // 1音を鳴らす（やわらかい立ち上がりと長い余韻）
  function voice(freq, at, dur, wave, vol) {
    const a = ctx;
    const osc = a.createOscillator();
    const gain = a.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + 0.04); // ふわっと入る
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  // 予定時刻より少し先の音を先回りして予約していく（途切れ防止）
  function scheduler() {
    const a = ac();
    if (!a || !current) return;
    const th = current;

    while (nextNoteTime < a.currentTime + 0.25) {
      const i = step % th.pattern.length;
      const deg = th.pattern[i];
      const freq = note(th.scale[deg % th.scale.length]);

      // メロディ
      voice(freq, nextNoteTime, th.decay, th.wave, th.vol);

      // 低音（2音ごとに変わる。土台になる響き）
      if (i % 2 === 0) {
        const bIdx = Math.floor(i / 2) % th.bass.length;
        voice(note(th.bass[bIdx]), nextNoteTime, th.decay * 1.6, "sine", th.vol * 0.85);
      }

      // 鳥のさえずり風の装飾（テーマごとに頻度が違う）
      if (Math.random() < th.chirp) {
        const hi = th.chirpHigh[Math.floor(Math.random() * th.chirpHigh.length)];
        voice(note(hi), nextNoteTime + th.tempo * 0.5, 0.18, "sine", th.vol * 0.5);
      }

      nextNoteTime += th.tempo;
      step++;
    }
    timer = setTimeout(scheduler, 60);
  }

  function play(puzzleKey) {
    const th = THEMES[puzzleKey];
    if (!th) return;
    current = th;
    if (TORI.audio && TORI.audio.isMuted()) return; // 消音中は鳴らさない
    const a = ac();
    if (!a) return;
    if (playing) stopLoop();
    playing = true;
    step = 0;
    nextNoteTime = a.currentTime + 0.1;
    master.gain.setValueAtTime(0.0001, a.currentTime);
    master.gain.exponentialRampToValueAtTime(1, a.currentTime + 1.2); // そっと始まる
    scheduler();
  }

  function stopLoop() {
    playing = false;
    if (timer) { clearTimeout(timer); timer = null; }
  }

  function stop() {
    if (!ctx || !playing) { stopLoop(); return; }
    // ふわっと消えてから止める
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    setTimeout(stopLoop, 450);
  }

  // 消音ボタンと連動
  function syncMute(muted) {
    if (muted) stop();
    else if (current) play(TORI.state.puzzleKey);
  }

  // 実際に音が出ているかを測る（動作確認用。0に近ければ無音）
  let analyser = null;
  function level() {
    if (!ctx || !master) return 0;
    if (!analyser) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      master.connect(analyser);
    }
    const buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = (buf[i] - 128) / 128;
      sum += v * v;
    }
    return Math.sqrt(sum / buf.length); // 音量の実効値
  }

  TORI.bgm = {
    play, stop, syncMute, level,
    isPlaying: function () { return playing; },
    themeOf: function (key) { return THEMES[key] || null; },
  };
})();
