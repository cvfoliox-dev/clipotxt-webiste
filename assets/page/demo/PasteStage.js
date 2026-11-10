/* ClipoTxt Interactive Demo — Stage 03: Paste into Claude Code New Chat */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

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
            <img src="${DATA.claudeLogoSrc}" alt="" width="16" height="16" class="ct-cc-spark" />
            <span class="ct-cc-name">Claude Code</span>
            <span class="ct-dest-badge mono">NEW CHAT</span>
          </div>
          <div class="ct-dest-clip mono" data-dest-clip>Clipboard: Text copied</div>
        </div>

        <div class="ct-cc-workspace" data-cc-workspace>
          <div class="ct-cc-visual-col">
            <div class="ct-cc-shot-frame">
              <div class="ct-cc-shot-bar mono">
                <span>CLAUDE CODE · NEW CHAT SESSION</span>
                <span>D:\\clipotxt</span>
              </div>
              <img
                src="${DATA.claudeCodeShotSrc}"
                alt="Claude Code New Chat interface"
                class="ct-cc-shot"
                decoding="async"
              />
            </div>

            <div class="ct-rendered-preview" data-rendered-preview hidden>
              <div class="ct-rp-head mono">
                <span>PASTED INTO CLAUDE CODE</span>
                <span>Markdown preserved &middot; 0 image uploads spent</span>
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
              <span class="ct-user-pill mono">CHAT INPUT</span>
              <span>Paste extracted table into Claude Code (0 screenshot uploads):</span>
            </div>

            <div class="ct-editor-box ct-cc-composer" data-editor-box>
              <textarea
                id="ctDemoEditor"
                class="ct-demo-editor"
                data-demo-target="paste-input"
                rows="8"
                spellcheck="false"
                placeholder="Ask Claude to edit... Click here and press Ctrl + V to paste extracted Markdown"
                aria-label="Claude Code prompt composer. Press Ctrl + V or click Paste Text to insert extracted Markdown."
              ></textarea>
              <div class="ct-editor-toolbar ct-cc-toolbar">
                <div class="ct-cc-chips mono" aria-hidden="true">
                  <span class="ct-cc-chip">+</span>
                  <span class="ct-cc-chip">/</span>
                  <span class="ct-cc-chip model">Sonnet 4.6</span>
                  <span class="ct-cc-chip">Manual</span>
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
              <span>inside the Claude Code box above, or click <b>Paste Text</b></span>
            </div>

            <div class="ct-need-extract" data-need-extract hidden>
              <span>No extracted text is on the demo clipboard yet.</span>
              <button type="button" class="ct-mini-next" data-action="jump-extract">Go to Extract Text (Stage 02)</button>
            </div>
          </div>
        </div>

        <div class="ct-finish-card" data-finish-card hidden>
          <div class="ct-finish-badge mono">ALL 3 STAGES COMPLETED</div>
          <div class="ct-finish-logos" aria-hidden="true">
            <img src="${DATA.logoSrc}" alt="" width="34" height="34" />
            <span class="ct-finish-arrow mono">&rarr;</span>
            <img src="${DATA.claudeLogoSrc}" alt="" width="30" height="30" />
          </div>
          <h4>Capture &rarr; Local OCR &rarr; Claude Code</h4>
          <p>
            You captured a desktop region, extracted a clean Markdown table locally via RapidOCR PP-OCRv4,
            and pasted straight into Claude Code without spending an image upload.
          </p>
          <div class="ct-finish-stats mono">
            <span>571.5 ms local OCR</span>
            <span>98.6% confidence</span>
            <span>0 screenshot uploads used</span>
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
    const replayFinishBtn = el.querySelector('[data-action="replay-from-finish"]');
    const pasteInstrEl = el.querySelector("[data-paste-instr]");
    const previewEl = el.querySelector("[data-rendered-preview]");
    const needExtractEl = el.querySelector("[data-need-extract]");
    const jumpExtractBtn = el.querySelector('[data-action="jump-extract"]');

    let typeTimer = 0;

    function getClipText(state) {
      return state.aiContextMode ? DATA.extractedMarkdown : DATA.extractedPlain;
    }

    function performPaste() {
      const s = store.getState();
      if (s.extractPhase !== "copied") {
        store.setState({ captureDone: true, extractPhase: "copied", clipboardStatus: "Text copied" });
      }
      if (onActionPulse) onActionPulse();
      clearInterval(typeTimer);

      const text = getClipText(store.getState());
      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "v") {
        if (document.activeElement === editor || editorBox.contains(document.activeElement)) {
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
          ? `Clipboard: Text copied (${state.aiContextMode ? "Markdown" : "Plain"})`
          : "Clipboard: Empty (run Stage 02)";
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
          kicker: "ALL 3 STAGES DONE",
          title: "Click Finish to complete",
          hint: "Text is pasted in Claude Code. Click Finish to wrap up the walkthrough.",
          compactHint: "Click Finish"
        };
      }
      return {
        el: editor,
        kicker: "STAGE 03 · CLAUDE CODE PASTE",
        title: "Press Ctrl + V to paste",
        hint: "Focus the Claude Code composer and press Ctrl + V (or click Paste Text).",
        compactHint: "Focus prompt & press Ctrl + V"
      };
    }

    sync(store.getState());
    return {
      el,
      editor,
      sync,
      getGuidanceTarget,
      destroy() {
        clearInterval(typeTimer);
        el.remove();
      }
    };
  }

  window.ClipoDemo.PasteStage = { create: createPasteStage };
})();
