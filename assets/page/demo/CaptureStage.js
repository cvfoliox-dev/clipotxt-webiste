/* ClipoTxt Interactive Demo — Stage 01: Capture */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function createCaptureStage(container, store, opts) {
    const { onAdvanceToExtract, onActionPulse } = opts;
    const DATA = store.SAMPLE_DATA;

    const el = document.createElement("div");
    el.className = "ct-stage-pane ct-cap-pane";
    el.dataset.stagePane = "capture";

    el.innerHTML = `
      <div class="ct-desktop-space">
        <div class="ct-desktop-bar">
          <div class="ct-desk-title">
            <span class="ct-desk-dot"></span>
            <span>Guided Desktop Sample · ClipoTxt Architecture Notes</span>
          </div>
          <div class="ct-desk-status mono" data-cap-listener>Clipboard Monitor: Waiting for selection</div>
        </div>

        <div class="ct-workspace-body">
          <div class="ct-doc-context" aria-hidden="true">
            <div class="ct-doc-line w60"></div>
            <div class="ct-doc-line w45"></div>
          </div>

          <button
            type="button"
            class="ct-capture-region"
            data-demo-target="capture-region"
            aria-label="Select area to capture sample table screenshot"
          >
            <img class="ct-sample-img" src="${DATA.imageSrc}" alt="Sample comparison table: Capability, Standard Flow, ClipoTxt Local" />
            <span class="ct-marquee-frame" aria-hidden="true">
              <span class="ct-handle tl"></span>
              <span class="ct-handle tr"></span>
              <span class="ct-handle bl"></span>
              <span class="ct-handle br"></span>
            </span>
            <span class="ct-shutter-flash" aria-hidden="true"></span>
          </button>

          <div class="ct-cap-actions">
            <div class="ct-hotkey-hint">
              <span class="ct-hotkey-lbl">Sample (${DATA.imageDimensions}):</span>
              <kbd>Win</kbd><span>+</span><kbd>Shift</kbd><span>+</span><kbd>S</kbd>
            </div>
            <button type="button" class="ct-primary-action" data-action="trigger-capture">
              Capture Selection
            </button>
          </div>

          <div class="ct-detect-banner" data-detect-banner hidden>
            <img class="ct-detect-logo" src="${DATA.logoSrc}" alt="" width="24" height="24" />
            <div class="ct-detect-copy">
              <strong>Screenshot captured · ClipoTxt detected clipboard bitmap</strong>
              <span>900 &times; 340 px bitmap queued for local CPU OCR</span>
            </div>
            <button type="button" class="ct-mini-next" data-action="go-extract">Open ClipoTxt &rarr;</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(el);

    const regionBtn = el.querySelector('[data-demo-target="capture-region"]');
    const triggerBtn = el.querySelector('[data-action="trigger-capture"]');
    const goExtractBtn = el.querySelector('[data-action="go-extract"]');
    const listenerEl = el.querySelector("[data-cap-listener]");
    const detectBanner = el.querySelector("[data-detect-banner]");

    let advanceTimer = 0;

    function triggerCapture() {
      const s = store.getState();
      if (s.captureAnimating) return;

      if (onActionPulse) onActionPulse();
      clearTimeout(advanceTimer);

      const wasDone = s.captureDone;
      el.classList.remove("is-captured");
      void el.offsetWidth;

      store.setState({
        captureAnimating: true,
        clipboardStatus: "Image detected",
      });
      el.classList.add("is-snapping");

      const reduce =
        window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      const snapWait = reduce ? 60 : 380;

      setTimeout(() => {
        el.classList.remove("is-snapping");
        el.classList.add("is-captured");
        store.setState({
          captureAnimating: false,
          captureDone: true,
          clipboardStatus: "Image detected",
        });

        // Auto-open ClipoTxt on first capture so the visitor immediately lands on Extract Text (Second click)
        if (!wasDone) {
          advanceTimer = setTimeout(
            () => {
              if (store.getState().stage === "capture") {
                onAdvanceToExtract();
              }
            },
            reduce ? 120 : 620,
          );
        }
      }, snapWait);
    }

    regionBtn.addEventListener("click", triggerCapture);
    triggerBtn.addEventListener("click", triggerCapture);
    goExtractBtn.addEventListener("click", () => {
      clearTimeout(advanceTimer);
      onAdvanceToExtract();
    });

    function sync(state) {
      el.hidden = state.stage !== "capture";
      el.classList.toggle("is-captured", state.captureDone);
      detectBanner.hidden = !state.captureDone;
      listenerEl.textContent = state.captureDone
        ? "ClipoTxt Listener: Clipboard bitmap intercepted"
        : "Clipboard Monitor: Select highlighted region";
      triggerBtn.textContent = state.captureDone
        ? "Capture Again"
        : "Capture Selection";
    }

    function getGuidanceTarget(state) {
      if (state.stage !== "capture") return null;
      if (state.captureDone) {
        return {
          el: goExtractBtn,
          kicker: "STAGE 01 · CAPTURE COMPLETE",
          title: "ClipoTxt detected the screenshot",
          hint: "Open ClipoTxt to extract text on your CPU.",
          compactHint: "Next: Open ClipoTxt",
        };
      }
      return {
        el: regionBtn,
        kicker: "STAGE 01 · CAPTURE",
        title: "Select an area to capture",
        hint: "Click the highlighted table region to simulate Win + Shift + S.",
        compactHint: "Click region to capture",
      };
    }

    sync(store.getState());
    return {
      el,
      sync,
      getGuidanceTarget,
      destroy() {
        clearTimeout(advanceTimer);
        el.remove();
      },
    };
  }

  window.ClipoDemo.CaptureStage = { create: createCaptureStage };
})();
