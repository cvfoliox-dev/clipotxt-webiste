/* ClipoTxt Interactive Demo — Stage Progress, Top Step Cards & Controls */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  const STAGES = ["capture", "extract", "paste"];
  const META = {
    capture: { stepNum: "01", label: "Capture" },
    extract: { stepNum: "02", label: "Extract" },
    paste: { stepNum: "03", label: "Paste" }
  };

  function createDemoProgress(opts) {
    const { stepEls, footerEl, statusEl, store, onNavigateStage, onFinish, onReplay } = opts;
    const stepBtns = stepEls.map((li) => li.querySelector(".step-btn"));

    footerEl.innerHTML = `
      <div class="ct-prog-crumbs" aria-label="Stage navigation">
        ${STAGES.map((s) => `
          <button type="button" class="ct-crumb" data-nav-stage="${s}">
            <span class="ct-crumb-num mono">${META[s].stepNum}</span>
            <span>${META[s].label}</span>
          </button>
        `).join("")}
      </div>
      <div class="ct-prog-actions">
        <button type="button" class="ct-nav-btn" data-action="prev">Previous</button>
        <button type="button" class="ct-nav-btn" data-action="next">Next</button>
        <button type="button" class="ct-nav-btn ct-replay-btn" data-action="replay">Replay</button>
      </div>
    `;

    const crumbs = [...footerEl.querySelectorAll("[data-nav-stage]")];
    const prevBtn = footerEl.querySelector('[data-action="prev"]');
    const nextBtn = footerEl.querySelector('[data-action="next"]');
    const replayBtn = footerEl.querySelector('[data-action="replay"]');

    stepBtns.forEach((btn, i) => {
      if (!btn) return;
      btn.addEventListener("click", () => {
        const s = store.getState();
        if (STAGES[i] === "paste" && s.extractPhase !== "copied") return;
        onNavigateStage(STAGES[i]);
      });
    });

    footerEl.addEventListener("click", (e) => {
      const nav = e.target.closest("[data-nav-stage]");
      if (nav) {
        const s = store.getState();
        if (nav.dataset.navStage === "paste" && s.extractPhase !== "copied") return;
        onNavigateStage(nav.dataset.navStage);
        return;
      }
      const act = e.target.closest("[data-action]");
      if (!act) return;
      const action = act.dataset.action;
      const s = store.getState();
      const idx = STAGES.indexOf(s.stage);
      if (action === "prev" && idx > 0) {
        onNavigateStage(STAGES[idx - 1]);
      } else if (action === "next") {
        if (s.stage === "paste" && s.pastePhase === "pasted" && !s.finishDone) {
          if (onFinish) onFinish();
        } else if (idx < STAGES.length - 1) {
          const targetStage = STAGES[idx + 1];
          if (targetStage === "paste" && s.extractPhase !== "copied") return;
          onNavigateStage(targetStage);
        }
      } else if (action === "replay") {
        onReplay();
      }
    });

    function render(state) {
      const activeIdx = STAGES.indexOf(state.stage);
      const doneFlags = [
        state.captureDone,
        state.extractPhase === "copied",
        state.pastePhase === "pasted"
      ];

      const ocrReady = state.extractPhase === "copied";
      stepEls.forEach((li, i) => {
        const active = i === activeIdx;
        const done = doneFlags[i];
        li.classList.toggle("on", active);
        li.classList.toggle("done", done);
        const btn = stepBtns[i];
        if (btn) {
          btn.setAttribute("aria-current", active ? "step" : "false");
          btn.disabled = i === 2 && !ocrReady;
        }
        const badge = li.querySelector(".t");
        if (badge) {
          if (done) badge.textContent = "Done";
          else if (active) badge.textContent = "Active";
          else badge.textContent = META[STAGES[i]].stepNum;
        }
      });

      crumbs.forEach((c, i) => {
        c.classList.toggle("on", i === activeIdx);
        c.classList.toggle("done", doneFlags[i]);
        c.disabled = i === 2 && !ocrReady;
        c.setAttribute("aria-current", i === activeIdx ? "step" : "false");
      });

      const allComplete = doneFlags[0] && doneFlags[1] && doneFlags[2];
      const onLastDone = state.stage === "paste" && state.pastePhase === "pasted";
      prevBtn.disabled = activeIdx === 0;
      if (onLastDone || (state.stage === "paste" && allComplete)) {
        nextBtn.textContent = state.finishDone ? "Finished" : "Finish";
        nextBtn.disabled = state.finishDone;
        nextBtn.classList.toggle("hi", !state.finishDone);
        nextBtn.classList.add("ct-finish-nav");
      } else {
        nextBtn.textContent = "Next";
        const nextStage = STAGES[activeIdx + 1];
        nextBtn.disabled = activeIdx === STAGES.length - 1 || (nextStage === "paste" && !ocrReady);
        nextBtn.classList.remove("hi", "ct-finish-nav");
      }
      replayBtn.classList.toggle("hi", Boolean(state.finishDone));

      if (statusEl) {
        if (state.finishDone) {
          statusEl.innerHTML = `<b>Tour finished:</b> Screenshot &rarr; Automatic PP-OCRv4 (571.5 ms) &rarr; Clean Markdown pasted into Claude Code.`;
        } else if (state.pastePhase === "pasted") {
          statusEl.innerHTML = `<b>All 3 stages complete:</b> Extracted Markdown pasted into Claude Code. Click <b>Finish</b> to wrap up.<br><button type="button" class="cta" data-status-finish>Finish</button>`;
        } else if (state.stage === "capture") {
          statusEl.textContent = state.captureDone
            ? "Screenshot detected on ClipoTxt clipboard — opening local OCR..."
            : state.guideUsedOnce
              ? "Manual replay — click the capture area on your own (refresh page to replay logo guide)."
              : "Stage 01 — Click the highlighted region inside the desktop workspace to capture.";
        } else if (state.stage === "extract") {
          statusEl.textContent = state.extractPhase === "copied"
            ? "Stage 02 — Screenshot text extracted automatically and copied to clipboard."
            : "Stage 02 — Detecting clipboard image and extracting text locally on CPU...";
        } else {
          statusEl.textContent = "Stage 03 — Focus Claude Code's prompt box and press Ctrl + V (or tap Paste Text) to insert Markdown.";
        }
      }
    }

    if (statusEl) {
      statusEl.addEventListener("click", (e) => {
        if (e.target.closest("[data-status-finish]") && onFinish) onFinish();
        if (e.target.closest("[data-status-replay]")) onReplay();
      });
    }

    render(store.getState());
    const unsub = store.subscribe(render);
    return {
      render,
      destroy: unsub
    };
  }

  window.ClipoDemo.DemoProgress = { create: createDemoProgress, STAGES };
})();

