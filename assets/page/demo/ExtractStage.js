/* ClipoTxt Interactive Demo — Stage 02: Automatic Local OCR + Desktop Completion Notification */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function createExtractStage(container, store, opts) {
    const { onAdvanceToPaste } = opts;
    const DATA = store.SAMPLE_DATA;

    const el = document.createElement("div");
    el.className = "ct-stage-pane ct-ext-pane";
    el.dataset.stagePane = "extract";

    el.innerHTML = `
      <div class="ct-app-shell">
        <aside class="ct-app-sidebar" aria-label="ClipoTxt navigation">
          <div class="ct-app-brand">
            <img src="${DATA.logoSrc}" alt="ClipoTxt icon" width="22" height="22" />
            <span>ClipoTxt</span>
            <span class="ct-app-status-dot">Active</span>
          </div>
          <div class="ct-app-nav" role="navigation" aria-label="ClipoTxt screens">
            <span class="ct-nav-item on">Home</span>
            <span class="ct-nav-item">History</span>
            <span class="ct-nav-item">Settings</span>
            <span class="ct-nav-item">About</span>
          </div>
          <div class="ct-app-privacy">
            <strong>On-device processing</strong>
            <span>100% Private &middot; Local v1.0.3</span>
          </div>
        </aside>

        <div class="ct-app-main">
          <div class="ct-app-top">
            <div>
              <div class="ct-app-kicker mono">AUTOMATIC CLIPBOARD LISTENER</div>
              <h3 class="ct-app-h">Screenshots, meet clarity.</h3>
            </div>
            <div class="ct-clip-indicator" data-clip-status>
              <span class="ct-clip-dot"></span>
              <span data-clip-label>Image detected</span>
            </div>
          </div>

          <div class="ct-app-grid">
            <div class="ct-app-preview-card">
              <div class="ct-card-bar">
                <span>Detected Screenshot</span>
                <span class="mono">${DATA.imageDimensions}</span>
              </div>
              <div class="ct-preview-frame">
                <img src="${DATA.imageSrc}" alt="Captured comparison table processed locally by ClipoTxt" />
                <div class="ct-scan-beam" aria-hidden="true"></div>
              </div>
              <div class="ct-format-row">
                <button type="button" class="ct-ctx-toggle" data-action="toggle-ai-mode" aria-pressed="true">
                  <span class="ct-ctx-pill">AI Context Mode</span>
                  <span data-ai-mode-lbl>Structured Markdown</span>
                </button>
                <div class="ct-auto-badge" data-auto-badge>
                  <span class="ct-auto-dot" aria-hidden="true"></span>
                  <span data-auto-lbl>Auto-OCR enabled</span>
                </div>
              </div>
            </div>

            <div class="ct-app-result-card" aria-live="polite">
              <div class="ct-card-bar">
                <span>Clipboard Text Output</span>
                <span class="ct-perf-chip mono" data-perf-chip>RapidOCR PP-OCRv4</span>
              </div>
              <div class="ct-result-body">
                <div class="ct-result-empty" data-result-empty>
                  <div class="ct-empty-badge">Clipboard Image Detected</div>
                  <p>Starting RapidOCR PP-OCRv4 locally on CPU automatically&hellip;</p>
                </div>
                <div class="ct-result-scanning" data-result-scanning hidden>
                  <div class="ct-scan-spinner" aria-hidden="true"></div>
                  <p>Extracting screenshot text locally on CPU&hellip;</p>
                </div>
                <div class="ct-result-output" data-result-output hidden>
                  <pre class="ct-md-pre" data-md-pre></pre>
                </div>
              </div>
              <div class="ct-result-foot" data-result-foot hidden>
                <span class="ct-copied-pill" data-copied-pill>Text copied</span>
                <button type="button" class="ct-mini-next" data-action="go-paste">Continue to Paste &rarr;</button>
              </div>
            </div>
          </div>

          <div class="ct-desktop-toast" data-desktop-toast role="status" aria-live="polite" hidden>
            <img src="${DATA.logoSrc}" alt="" width="24" height="24" class="ct-toast-app-ico" />
            <div class="ct-toast-copy">
              <div class="ct-toast-head">
                <strong>ClipoTxt</strong>
                <span class="ct-toast-tag mono">NOTIFICATION</span>
              </div>
              <div class="ct-toast-title">Screenshot text extracted successfully.</div>
              <div class="ct-toast-msg">Your clipboard is ready to paste.</div>
            </div>
            <img src="assets/demo/toast-copied.png" alt="" class="ct-toast-pill-img" />
          </div>
        </div>
      </div>
    `;

    container.appendChild(el);

    const aiToggleBtn = el.querySelector('[data-action="toggle-ai-mode"]');
    const aiModeLbl = el.querySelector("[data-ai-mode-lbl]");
    const autoBadgeEl = el.querySelector("[data-auto-badge]");
    const autoLblEl = el.querySelector("[data-auto-lbl]");
    const clipStatusEl = el.querySelector("[data-clip-status]");
    const clipLabelEl = el.querySelector("[data-clip-label]");
    const perfChipEl = el.querySelector("[data-perf-chip]");
    const emptyEl = el.querySelector("[data-result-empty]");
    const scanningEl = el.querySelector("[data-result-scanning]");
    const outputEl = el.querySelector("[data-result-output]");
    const mdPreEl = el.querySelector("[data-md-pre]");
    const footEl = el.querySelector("[data-result-foot]");
    const toastEl = el.querySelector("[data-desktop-toast]");
    const goPasteBtn = el.querySelector('[data-action="go-paste"]');

    let kickTimer = 0;
    let scanTimer = 0;
    let streamTimer = 0;
    let advanceTimer = 0;
    let autoPipelineRunning = false;

    function clearAllTimers() {
      clearTimeout(kickTimer);
      clearTimeout(scanTimer);
      clearInterval(streamTimer);
      clearTimeout(advanceTimer);
    }

    function getOutputText(state) {
      return state.aiContextMode ? DATA.extractedMarkdown : DATA.extractedPlain;
    }

    function revealTextProgressively(fullText, doneCb) {
      clearInterval(streamTimer);
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        mdPreEl.textContent = fullText;
        doneCb();
        return;
      }
      const lines = fullText.split("\n");
      let count = 2;
      mdPreEl.textContent = lines.slice(0, count).join("\n");
      streamTimer = setInterval(() => {
        count += 2;
        if (count >= lines.length) {
          mdPreEl.textContent = fullText;
          clearInterval(streamTimer);
          doneCb();
        } else {
          mdPreEl.textContent = lines.slice(0, count).join("\n");
        }
      }, 38);
    }

    function runAutomaticExtraction() {
      const s = store.getState();
      if (autoPipelineRunning || s.extractPhase !== "idle") return;
      autoPipelineRunning = true;
      clearAllTimers();

      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

      kickTimer = setTimeout(() => {
        if (store.getState().stage !== "extract") {
          autoPipelineRunning = false;
          return;
        }
        store.setState({
          captureDone: true,
          extractPhase: "scanning",
          toastVisible: false,
          clipboardStatus: "Processing locally..."
        });

        scanTimer = setTimeout(() => {
          const cur = store.getState();
          if (cur.stage !== "extract") {
            autoPipelineRunning = false;
            return;
          }
          store.setState({
            extractPhase: "copied",
            toastVisible: true,
            clipboardStatus: "Text copied"
          });

          revealTextProgressively(getOutputText(cur), () => {
            autoPipelineRunning = false;
            // Hold completion notification visibly so visitor reads toast, then proceed into Stage 03
            advanceTimer = setTimeout(() => {
              const latest = store.getState();
              if (latest.stage === "extract" && latest.extractPhase === "copied") {
                onAdvanceToPaste();
              }
            }, reduce ? 300 : 1850);
          });
        }, reduce ? 70 : 580);
      }, reduce ? 40 : 200);
    }

    goPasteBtn.addEventListener("click", () => {
      clearTimeout(advanceTimer);
      if (store.getState().extractPhase === "copied") {
        onAdvanceToPaste();
      }
    });

    aiToggleBtn.addEventListener("click", () => {
      const next = !store.getState().aiContextMode;
      store.setState({ aiContextMode: next });
      if (store.getState().extractPhase === "copied") {
        mdPreEl.textContent = getOutputText(store.getState());
      }
    });

    function sync(state) {
      el.hidden = state.stage !== "extract";
      el.classList.toggle("is-scanning", state.extractPhase === "scanning");
      el.classList.toggle("is-copied", state.extractPhase === "copied");

      aiToggleBtn.setAttribute("aria-pressed", state.aiContextMode ? "true" : "false");
      aiModeLbl.textContent = state.aiContextMode ? "Structured Markdown" : "Plain Table Text";

      emptyEl.hidden = state.extractPhase !== "idle";
      scanningEl.hidden = state.extractPhase !== "scanning";
      outputEl.hidden = state.extractPhase !== "copied";
      footEl.hidden = state.extractPhase !== "copied";
      toastEl.hidden = !(state.extractPhase === "copied" && state.toastVisible);

      if (state.extractPhase === "copied" && mdPreEl.textContent === "") {
        mdPreEl.textContent = getOutputText(state);
      } else if (state.extractPhase === "idle") {
        mdPreEl.textContent = "";
      }

      clipStatusEl.classList.toggle("ready", state.extractPhase === "copied");
      clipStatusEl.classList.toggle("busy", state.extractPhase === "scanning");
      autoBadgeEl.classList.toggle("ready", state.extractPhase === "copied");
      autoBadgeEl.classList.toggle("busy", state.extractPhase === "scanning");

      if (state.extractPhase === "copied") {
        clipLabelEl.textContent = "Text copied";
        perfChipEl.textContent = `${DATA.ocrElapsedMs} ms \u00b7 ${DATA.ocrConfidencePct}% conf`;
        autoLblEl.textContent = "Auto-extracted & copied";
      } else if (state.extractPhase === "scanning") {
        clipLabelEl.textContent = "Extracting on CPU...";
        perfChipEl.textContent = "PP-OCRv4 active";
        autoLblEl.textContent = "Running local OCR...";
      } else {
        clipLabelEl.textContent = state.captureDone ? "Image detected" : "Waiting for screenshot";
        perfChipEl.textContent = "RapidOCR PP-OCRv4";
        autoLblEl.textContent = "Auto-OCR triggers on capture";
      }

      // Leaving Stage 02 while idle resets any stale queued auto-timer cleanly
      if (state.stage !== "extract" && state.extractPhase === "idle") {
        autoPipelineRunning = false;
        clearAllTimers();
      } else if (state.stage === "extract" && state.extractPhase === "idle" && !autoPipelineRunning) {
        runAutomaticExtraction();
      }
    }

    // No Extract button / manual click instruction in Stage 02 — OCR happens automatically
    function getGuidanceTarget() {
      return null;
    }

    sync(store.getState());
    return {
      el,
      sync,
      getGuidanceTarget,
      destroy() {
        clearAllTimers();
        el.remove();
      }
    };
  }

  window.ClipoDemo.ExtractStage = { create: createExtractStage };
})();
