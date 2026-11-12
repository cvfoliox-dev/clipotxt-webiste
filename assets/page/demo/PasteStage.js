/* ClipoTxt Interactive Demo — Stage 03: Paste into Simulated Destination Editor */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  const DOC_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ct-cc-spark" style="color:#8cc152" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;

  function createPasteStage(container, store, opts) {
    const { onReplay, onFinish, onGoExtract, onActionPulse } = opts;
    const DATA = store.SAMPLE_DATA;

    const el = document.createElement("div");
    el.className = "ct-stage-pane ct-paste-pane";
    el.dataset.stagePane = "paste";

    el.innerHTML = `
      <div class="ct-dest-app ct-cc-app" data-cc-app>
        <div class="ct-dest-bar ct-cc-bar">
          <div class="ct-dest-title">
            ${DOC_ICON}
            <span class="ct-cc-name">Destination Editor</span>
            <span class="ct-dest-badge mono">SIMULATED WORKSPACE</span>
          </div>
          <div class="ct-dest-clip mono" data-dest-clip>Simulated Clipboard: Text copied</div>
        </div>

        <div class="ct-cc-workspace" data-cc-workspace>
          <div class="ct-cc-visual-col">
            <div class="ct-cc-shot-frame">
              <div class="ct-cc-shot-bar mono">
                <span>CLIPOTXT APP · READY IN BACKGROUND</span>
                <span>100% LOCAL</span>
              </div>
              <img
                src="${DATA.appHomeSrc}"
                alt="ClipoTxt desktop workspace showing extracted text ready to paste"
                class="ct-cc-shot"
                decoding="async"
              />
            </div>

            <div class="ct-rendered-preview" data-rendered-preview hidden>
              <div class="ct-rp-head mono">
                <span>PASTED IN DESTINATION EDITOR</span>
                <span>Formatting preserved &middot; Ctrl + V</span>
              </div>
              <table class="ct-rp-table">
                <thead>
                  <tr><th>Capability</th><th>Standard Flow</th><th>ClipoTxt Local</th></tr>
                </thead>
                <tbody>
                  <tr><td>Processing</td><td>Cloud upload required</td><td>ONNX Runtime CPU</td></tr>
                  <tr><td>Workflow</td><td>Retype or send image</td><td>Win + Shift + S &rarr; Ctrl + V</td></tr>
                  <tr><td>Output Format</td><td>Unstructured snippet</td><td>Clean Markdown &amp; Code</td></tr>
                  <tr><td>History Storage</td><td>External sync account</td><td>Local SQLite archive</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="ct-cc-chat-col">
            <div class="ct-dest-prompt-row">
              <span class="ct-user-pill mono">DESTINATION INPUT</span>
              <span>Click inside the simulated editor and press <b>Ctrl + V</b>:</span>
            </div>

            <div class="ct-editor-box ct-cc-composer" data-editor-box>
              <textarea
                id="ctDemoEditor"
                class="ct-demo-editor"
                data-demo-target="paste-input"
                rows="8"
                spellcheck="false"
                placeholder="Click here and press Ctrl + V to paste extracted text..."
                aria-label="Simulated destination editor. Click and press Ctrl + V or tap Paste Text to insert the extracted content."
              ></textarea>
              <div class="ct-editor-toolbar ct-cc-toolbar">
                <div class="ct-cc-chips mono" aria-hidden="true">
                  <span class="ct-cc-chip">Document</span>
                  <span class="ct-cc-chip">Notes</span>
                  <span class="ct-cc-chip model">Clean Output</span>
                  <span class="ct-cc-chip">Browser Demo</span>
                </div>
                <div class="ct-editor-btns">
                  <button type="button" class="ct-primary-action ct-cc-paste-btn" data-action="paste-btn">
                    Paste Text
                  </button>
                  <button type="button" class="ct-primary-action ct-finish-btn" data-action="finish-btn" hidden>
                    Finish
                  </button>
                  <button type="button" class="ct-secondary-action" data-action="replay-from-paste" hidden>
                    Replay
                  </button>
                </div>
              </div>
            </div>

            <div class="ct-paste-instr" data-paste-instr>
              <kbd>Ctrl</kbd><span>+</span><kbd>V</kbd>
              <span>inside the simulated editor above, or tap <b>Paste Text</b></span>
            </div>

            <div class="ct-need-extract" data-need-extract hidden>
              <span>Waiting for automatic Stage 02 OCR to prepare the simulated clipboard.</span>
              <button type="button" class="ct-mini-next" data-action="jump-extract">View Stage 02 Status</button>
            </div>
          </div>
        </div>

        <div class="ct-finish-card" data-finish-card hidden>
          <div class="ct-finish-badge mono">ALL 3 STAGES COMPLETED</div>
          <div class="ct-finish-logos" aria-hidden="true">
            <img src="${DATA.logoSrc}" alt="" width="34" height="34" />
            <span class="ct-finish-arrow mono">&rarr;</span>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8cc152" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>
          </div>
          <h4>Capture &rarr; Local OCR &rarr; Paste</h4>
          <p>
            You captured a screenshot, watched local OCR extract its content automatically,
            and pasted clean, usable text right into the simulated editor.
          </p>
          <div class="ct-finish-stats mono">
            <span>Sub-second local OCR</span>
            <span>98.6% confidence</span>
            <span>100% local &middot; paste anywhere</span>
          </div>
          <div class="ct-finish-actions">
            <a href="#ways" class="ct-primary-action ct-finish-dl">Pick your download</a>
            <button type="button" class="ct-secondary-action" data-action="replay-from-finish">Replay Experience</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(el);

    const workspaceEl = el.querySelector("[data-cc-workspace]");
    const finishCardEl = el.querySelector("[data-finish-card]");
    const editor = el.querySelector("#ctDemoEditor");
    const editorBox = el.querySelector("[data-editor-box]");
    const destClipEl = el.querySelector("[data-dest-clip]");
    const pasteBtn = el.querySelector('[data-action="paste-btn"]');
    const finishBtn = el.querySelector('[data-action="finish-btn"]');
    const replayBtn = el.querySelector('[data-action="replay-from-paste"]');
    const replayFinishBtn = el.querySelector(
      '[data-action="replay-from-finish"]',
    );
    const pasteInstrEl = el.querySelector("[data-paste-instr]");
    const previewEl = el.querySelector("[data-rendered-preview]");
    const needExtractEl = el.querySelector("[data-need-extract]");
    const jumpExtractBtn = el.querySelector('[data-action="jump-extract"]');

    let typeTimer = 0;

    function getClipText(state) {
      return state.smartFormatting
        ? DATA.extractedMarkdown
        : DATA.extractedPlain;
    }

    function performPaste() {
      const s = store.getState();
      if (s.extractPhase !== "copied") {
        store.setState({
          captureDone: true,
          extractPhase: "copied",
          clipboardStatus: "Text copied",
        });
      }
      if (onActionPulse) onActionPulse();
      clearInterval(typeTimer);

      const text = getClipText(store.getState());
      const reduce =
        window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
      store.setState({ pastePhase: "pasted" });

      if (reduce) {
        editor.value = text;
        return;
      }

      const lines = text.split("\n");
      let idx = 2;
      editor.value = lines.slice(0, idx).join("\n");
      typeTimer = setInterval(() => {
        idx += 2;
        if (idx >= lines.length) {
          editor.value = text;
          clearInterval(typeTimer);
        } else {
          editor.value = lines.slice(0, idx).join("\n");
        }
      }, 36);
    }

    // Intercept Ctrl + V / Cmd + V ONLY when focused inside the destination editor / Stage 03 box
    el.addEventListener("keydown", (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        !e.shiftKey &&
        !e.altKey &&
        e.key.toLowerCase() === "v"
      ) {
        if (
          document.activeElement === editor ||
          editorBox.contains(document.activeElement)
        ) {
          e.preventDefault();
          performPaste();
        }
      }
    });

    editor.addEventListener("paste", (e) => {
      e.preventDefault();
      performPaste();
    });

    pasteBtn.addEventListener("click", () => {
      editor.focus({ preventScroll: true });
      performPaste();
    });

    finishBtn.addEventListener("click", () => {
      if (onActionPulse) onActionPulse();
      if (onFinish) onFinish();
    });

    const handleReplay = () => {
      clearInterval(typeTimer);
      editor.value = "";
      onReplay();
    };
    replayBtn.addEventListener("click", handleReplay);
    replayFinishBtn.addEventListener("click", handleReplay);
    jumpExtractBtn.addEventListener("click", onGoExtract);

    function sync(state) {
      el.hidden = state.stage !== "paste";
      const ready = state.extractPhase === "copied";
      const pasted = state.pastePhase === "pasted";
      const finished = Boolean(state.finishDone);

      el.classList.toggle("is-pasted", pasted);
      el.classList.toggle("is-finished", finished);
      workspaceEl.hidden = finished;
      finishCardEl.hidden = !finished;

      if (!pasted) {
        editor.value = "";
      } else if (editor.value === "" && ready) {
        editor.value = getClipText(state);
      }

      destClipEl.textContent = finished
        ? "Session ready · Tour completed"
        : ready
          ? `Simulated Clipboard: Text copied (${state.smartFormatting ? "Markdown" : "Clean Text"})`
          : "Simulated Clipboard: Waiting for Stage 02 OCR";
      destClipEl.classList.toggle("ready", ready || finished);

      pasteBtn.hidden = pasted;
      pasteBtn.disabled = pasted;
      finishBtn.hidden = !pasted || finished;
      replayBtn.hidden = !pasted || finished;
      pasteInstrEl.hidden = pasted;
      previewEl.hidden = !pasted;
      needExtractEl.hidden = ready || state.guidanceMode === "explore";
    }

    function getGuidanceTarget(state) {
      if (state.stage !== "paste" || state.finishDone) return null;
      if (state.pastePhase === "pasted") {
        return {
          el: finishBtn,
          stepLabel: "3 / 3",
          ptrText: "Click Finish",
          kicker: "ALL 3 STAGES DONE",
          title: "Click Finish to complete",
          hint: "Text is pasted cleanly. Click Finish to wrap up the walkthrough.",
          compactHint: "Click Finish",
        };
      }
      return {
        el: editor,
        stepLabel: "2 / 3",
        ptrText: "Press Ctrl + V to paste",
        kicker: "STAGE 03 · PASTE",
        title: "Press Ctrl + V to paste",
        hint: "Click the simulated editor and press Ctrl + V (or tap Paste Text).",
        compactHint: "Focus editor & press Ctrl + V",
      };
    }

    sync(store.getState());
    return {
      el,
      editor,
      sync,
      triggerPaste: performPaste,
      getGuidanceTarget,
      destroy() {
        clearInterval(typeTimer);
        el.remove();
      },
    };
  }

  window.ClipoDemo.PasteStage = { create: createPasteStage };
})();
