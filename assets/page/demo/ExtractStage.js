/* ClipoTxt Interactive Demo — Stage 02: Extract (ClipoTxt Real UI Style & Live OCR State) */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function createExtractStage(container, store, opts) {
    const { onAdvanceToPaste, onActionPulse } = opts;
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
            <span>100% Private · Local v1.0.3</span>
          </div>
        </aside>

        <div class="ct-app-main">
          <div class="ct-app-top">
            <div>
              <div class="ct-app-kicker mono">YOUR DESKTOP AGENT</div>
              <h3 class="ct-app-h">Screenshots, meet clarity.</h3>
            </div>
            <div class="ct-clip-indicator" data-clip-status>
              <span class="ct-clip-dot"></span>
              <span data-clip-label>Waiting to extract</span>
            </div>
          </div>

          <div class="ct-app-grid">
            <div class="ct-app-preview-card">
              <div class="ct-card-bar">
                <span>Captured Screenshot</span>
                <span class="mono">${DATA.imageDimensions}</span>
              </div>
              <div class="ct-preview-frame">
                <img src="${DATA.imageSrc}" alt="Captured comparison table ready for local OCR" />
                <div class="ct-scan-beam" aria-hidden="true"></div>
              </div>
              <div class="ct-format-row">
                <button type="button" class="ct-ctx-toggle" data-action="toggle-ai-mode" aria-pressed="true">
                  <span class="ct-ctx-pill">AI Context Mode</span>
                  <span data-ai-mode-lbl>Structured Markdown</span>
                </button>
                <button
                  type="button"
                  class="ct-extract-btn"
                  data-demo-target="extract-btn"
                >
                  Extract Text
                </button>
              </div>
            </div>

            <div class="ct-app-result-card" aria-live="polite">
              <div class="ct-card-bar">
                <span>Clipboard Text Output</span>
                <span class="ct-perf-chip mono" data-perf-chip>RapidOCR PP-OCRv4</span>
              </div>
              <div class="ct-result-body">
                <div class="ct-result-empty" data-result-empty>
                  <div class="ct-empty-badge">ONNX Runtime CPU · Ready</div>
                  <p>Click <strong>Extract Text</strong> to process the captured image locally and copy structured Markdown to your clipboard.</p>
                </div>
                <div class="ct-result-scanning" data-result-scanning hidden>
                  <div class="ct-scan-spinner" aria-hidden="true"></div>
                  <p>Running local RapidOCR PP-OCRv4 on CPU&hellip;</p>
                </div>
                <div class="ct-result-output" data-result-output hidden>
                  <pre class="ct-md-pre" data-md-pre></pre>
                </div>
              </div>
              <div class="ct-result-foot" data-result-foot hidden>
                <span class="ct-copied-pill" data-copied-pill>Text copied</span>
                <button type="button" class="ct-mini-next" data-action="go-paste">Paste into Workspace &rarr;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.appendChild(el);

    const extractBtn = el.querySelector('[data-demo-target="extract-btn"]');
    const aiToggleBtn = el.querySelector('[data-action="toggle-ai-mode"]');
    const aiModeLbl = el.querySelector("[data-ai-mode-lbl]");
    const clipStatusEl = el.querySelector("[data-clip-status]");
    const clipLabelEl = el.querySelector("[data-clip-label]");
    const perfChipEl = el.querySelector("[data-perf-chip]");
    const emptyEl = el.querySelector("[data-result-empty]");
    const scanningEl = el.querySelector("[data-result-scanning]");
    const outputEl = el.querySelector("[data-result-output]");
    const mdPreEl = el.querySelector("[data-md-pre]");
    const footEl = el.querySelector("[data-result-foot]");
    const goPasteBtn = el.querySelector('[data-action="go-paste"]');

    let scanTimer = 0;
    let streamTimer = 0;
    let advanceTimer = 0;

    function getOutputText(state) {
      return state.aiContextMode ? DATA.extractedMarkdown : DATA.extractedPlain;
    }

    function revealTextProgressively(fullText, doneCb) {
      clearInterval(streamTimer);
      const reduce =
        window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      }, 45);
    }

    function runExtraction() {
      const s = store.getState();
      if (s.extractPhase === "scanning") return;
      if (onActionPulse) onActionPulse();

      clearTimeout(scanTimer);
      clearTimeout(advanceTimer);
      clearInterval(streamTimer);

      const wasCopied = s.extractPhase === "copied";
      store.setState({
        captureDone: true,
        extractPhase: "scanning",
        clipboardStatus: "Processing locally...",
      });

      const reduce =
        window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      scanTimer = setTimeout(
        () => {
          const cur = store.getState();
          store.setState({
            extractPhase: "copied",
            clipboardStatus: "Text copied",
          });
          revealTextProgressively(getOutputText(cur), () => {
            // On initial extraction, give visitor a clear moment to inspect "Text copied", then enter Paste stage smoothly
            if (!wasCopied) {
              advanceTimer = setTimeout(
                () => {
                  if (
                    store.getState().stage === "extract" &&
                    store.getState().extractPhase === "copied"
                  ) {
                    onAdvanceToPaste();
                  }
                },
                reduce ? 150 : 1100,
              );
            }
          });
        },
        reduce ? 60 : 520,
      );
    }

    extractBtn.addEventListener("click", runExtraction);
    goPasteBtn.addEventListener("click", () => {
      clearTimeout(advanceTimer);
      onAdvanceToPaste();
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

      aiToggleBtn.setAttribute(
        "aria-pressed",
        state.aiContextMode ? "true" : "false",
      );
      aiModeLbl.textContent = state.aiContextMode
        ? "Structured Markdown"
        : "Plain Table Text";

      emptyEl.hidden = state.extractPhase !== "idle";
      scanningEl.hidden = state.extractPhase !== "scanning";
      outputEl.hidden = state.extractPhase !== "copied";
      footEl.hidden = state.extractPhase !== "copied";

      if (state.extractPhase === "copied" && mdPreEl.textContent === "") {
        mdPreEl.textContent = getOutputText(state);
      }

      clipStatusEl.classList.toggle("ready", state.extractPhase === "copied");
      clipStatusEl.classList.toggle("busy", state.extractPhase === "scanning");

      if (state.extractPhase === "copied") {
        clipLabelEl.textContent = "Text copied";
        perfChipEl.textContent = `${DATA.ocrElapsedMs} ms · ${DATA.ocrConfidencePct}% conf`;
        extractBtn.textContent = "Re-extract Text";
      } else if (state.extractPhase === "scanning") {
        clipLabelEl.textContent = "Extracting on CPU...";
        perfChipEl.textContent = "PP-OCRv4 active";
        extractBtn.textContent = "Extracting...";
      } else {
        clipLabelEl.textContent = state.captureDone
          ? "Image detected · Ready"
          : "Waiting to extract";
        perfChipEl.textContent = "RapidOCR PP-OCRv4";
        extractBtn.textContent = "Extract Text";
      }
      extractBtn.disabled = state.extractPhase === "scanning";
    }

    function getGuidanceTarget(state) {
      if (state.stage !== "extract") return null;
      if (state.extractPhase === "idle") {
        return {
          el: extractBtn,
          kicker: "STAGE 02 · LOCAL OCR",
          title: "Click Extract Text to run local OCR",
          hint: "ClipoTxt extracts the screenshot text locally using RapidOCR PP-OCRv4.",
          compactHint: "Click Extract Text",
        };
      }
      if (state.extractPhase === "copied") {
        return {
          el: goPasteBtn,
          kicker: "CLIPBOARD READY",
          title: "Text copied to demo clipboard",
          hint: "Proceed to your editor or AI chat to paste with Ctrl + V.",
          compactHint: "Next: Paste into Workspace",
        };
      }
      return null;
    }

    sync(store.getState());
    return {
      el,
      sync,
      getGuidanceTarget,
      destroy() {
        clearTimeout(scanTimer);
        clearTimeout(advanceTimer);
        clearInterval(streamTimer);
        el.remove();
      },
    };
  }

  window.ClipoDemo.ExtractStage = { create: createExtractStage };
})();
