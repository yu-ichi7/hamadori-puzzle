// 入力: Pointer Events に一本化（マウス・タッチ・ペン共通）
(function () {
  // canvas のCSS表示サイズ → 論理座標(420x640) へ変換して handlers に渡す
  function initInput(canvas, handlers) {
    function toLogicalX(ev) {
      const rect = canvas.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width * TORI.BOARD.W;
      return Math.max(0, Math.min(TORI.BOARD.W, x));
    }

    canvas.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      if (handlers.onMove) handlers.onMove(toLogicalX(ev));
      canvas.setPointerCapture(ev.pointerId);
    });

    canvas.addEventListener("pointermove", function (ev) {
      if (handlers.onMove) handlers.onMove(toLogicalX(ev));
    });

    canvas.addEventListener("pointerup", function (ev) {
      ev.preventDefault();
      if (handlers.onRelease) handlers.onRelease(toLogicalX(ev));
    });
  }

  TORI.initInput = initInput;
})();
