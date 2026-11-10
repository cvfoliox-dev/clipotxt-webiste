/* ClipoTxt Interactive Demo — Main State Machine, Stage Orchestrator & Line-Wise Logo Tour */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function InteractiveDemo(sectionRoot) {
    if (!sectionRoot) return;
    const CD = window.ClipoDemo;
    const reduce =
      window.matchMedia &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;

    const stageEl = sectionRoot.querySelector("#aStage");
    const statusEl = sectionRoot.querySelector("#aStatus");
    const stepEls = [...sectionRoot.querySelectorAll(".step")];
    const knotWrap = stageEl ? stageEl.querySelector(".knot") : null;
    const knotEl = knotWrap ? knotWrap.querySelector("canvas") : null;
    const strandCanvas = document.getElementById("strandLayer");

    if (!stageEl) return;

    // Remove unused reference placeholders cleanly if present in DOM
    stageEl
      .querySelectorAll(".gb, .keep, .khint, .hring")
      .forEach((n) => n.remove());

    const store = CD.createDemoStore();

    // Build .mac interactive workspace window immediately so motion-options.js & lesson-ways-options.js find it synchronously
    const shell = document.createElement("div");
    shell.className = "mac ct-demo-shell";
    shell.innerHTML = `
      <div class="mac-title">
        <div class="ct-mac-dots" aria-hidden="true"><span></span><span></span><span></span></div>
        <div class="mac-name">
          <img src="assets/logo.png" alt="" width="15" height="15" class="ct-win-ico" />
          <span>ClipoTxt Interactive Demo</span>
        </div>
        <div class="ct-mode-host" data-mode-host></div>
      </div>
      <div class="ct-viewport" data-viewport></div>
      <div class="ct-footer" data-footer></div>
    `;
    stageEl.prepend(shell);

    const modeHost = shell.querySelector("[data-mode-host]");
    const viewport = shell.querySelector("[data-viewport]");
    const footerEl = shell.querySelector("[data-footer]");

    // Mount Companion Knot cleanly in corner (preserves motion-options.js particle handoff & strand bridges)
    const knot =
      window.NusKnot3D && knotEl
        ? NusKnot3D.mount(knotEl, { thread: strandCanvas, origin: stageEl })
        : null;

    // Mount ClipoTxt's 3D unfolding companion logo inside .knot corner dock (clickable to launch Logo Tour)
    let companionLogo = null;
    function mountBrandLogo() {
      if (
        companionLogo ||
        !knotWrap ||
        typeof window.createClipoCompanion !== "function"
      )
        return;
      let brandSlot = knotWrap.querySelector("#ctStageBrand");
      if (!brandSlot) {
        brandSlot = document.createElement("div");
        brandSlot.id = "ctStageBrand";
        brandSlot.className = "ct-stage-brand";
        knotWrap.appendChild(brandSlot);
      }
      knotWrap.setAttribute("role", "button");
      knotWrap.setAttribute("tabindex", "0");
      knotWrap.setAttribute(
        "aria-label",
        "Watch ClipoTxt logo guided walkthrough",
      );
      knotWrap.title = "Click to watch ClipoTxt logo walk through every step";
      companionLogo = window.createClipoCompanion(brandSlot, { tilt: 22 });
    }
    mountBrandLogo();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mountBrandLogo, {
        once: true,
      });
    }
    window.addEventListener("load", mountBrandLogo, { once: true });

    const setKnotState = (s) => {
      if (knot && knot.setState) knot.setState(s);
    };

    const pointer = CD.DemoPointer.create(stageEl, knotWrap, knot, reduce);
    const overlay = CD.DemoOverlay.create(viewport);

    let tourRunId = 0;
    let programmaticTourAction = false;

    function cancelLogoTour() {
      tourRunId++;
      if (store.getState().tourPlaying) {
        store.setState({ tourPlaying: false });
      }
    }

    function advanceStage(stageName) {
      store.setState({ stage: stageName, finishDone: false });
    }

    function navigateStage(stageName) {
      cancelLogoTour();
      if (stageName === "paste" && store.getState().extractPhase !== "copied")
        return;
      store.setState({ stage: stageName, finishDone: false });
    }

    function replayDemo() {
      cancelLogoTour();
      store.reset(true);
      setKnotState("ready");
    }

    function finishDemo() {
      if (!programmaticTourAction) cancelLogoTour();
      store.setState({
        finishDone: true,
        tourPlaying: false,
        guideUsedOnce: true,
        guidanceMode: "explore"
      });
      setKnotState("ready");
    }

    const captureStage = CD.CaptureStage.create(viewport, store, {
      onAdvanceToExtract: () => advanceStage("extract"),
      onActionPulse: () => pointer.pulseClick(),
    });

    const extractStage = CD.ExtractStage.create(viewport, store, {
      onAdvanceToPaste: () => advanceStage("paste"),
      onActionPulse: () => pointer.pulseClick(),
    });

    const pasteStage = CD.PasteStage.create(viewport, store, {
      onReplay: replayDemo,
      onFinish: finishDemo,
      onGoExtract: () => advanceStage("extract"),
      onActionPulse: () => pointer.pulseClick(),
    });

    const guidance = CD.GuidanceMode.create(modeHost, store, {
      onToggleTour: () => toggleLogoTour(),
    });

    const progress = CD.DemoProgress.create({
      stepEls,
      footerEl,
      statusEl,
      store,
      onNavigateStage: navigateStage,
      onFinish: finishDemo,
      onReplay: replayDemo,
    });

    // Any real manual user click/keydown inside the workspace cancels an active automated Logo Tour cleanly
    viewport.addEventListener("pointerdown", () => {
      if (!programmaticTourAction && store.getState().tourPlaying)
        cancelLogoTour();
    });
    viewport.addEventListener("keydown", (e) => {
      if (
        !programmaticTourAction &&
        store.getState().tourPlaying &&
        e.key === "Escape"
      ) {
        cancelLogoTour();
      }
    });

    function sleep(ms) {
      return new Promise((res) => setTimeout(res, ms));
    }

    function waitForState(id, pred, timeoutMs) {
      return new Promise((res) => {
        if (id !== tourRunId) return res(false);
        if (pred(store.getState())) return res(true);
        let done = false;
        const timer = setTimeout(() => {
          if (!done) {
            done = true;
            unsub();
            res(id === tourRunId && pred(store.getState()));
          }
        }, timeoutMs || 5000);
        const unsub = store.subscribe((st) => {
          if (done) return;
          if (id !== tourRunId || pred(st)) {
            done = true;
            clearTimeout(timer);
            unsub();
            res(id === tourRunId);
          }
        });
      });
    }

    async function startLogoTour() {
      if (store.getState().guideUsedOnce) return;
      const id = ++tourRunId;
      revealed = true;
      stageEl.classList.add("in");
      store.reset(false);
      store.setState({ guidanceMode: "guided", tourPlaying: true });

      const stepGap = reduce ? 220 : 1200;

      // 1/3: Real corner ClipoTxt logo flies out with white lasso onto Capture region & clicks
      await sleep(reduce ? 180 : 1200);
      if (id !== tourRunId) return;
      programmaticTourAction = true;
      captureStage.triggerCapture();
      programmaticTourAction = false;

      // Stage 02: Automatic OCR runs & displays completion notification -> advances to Stage 03
      if (!(await waitForState(id, (st) => st.stage === "paste", 6500))) return;

      // 2/3: ClipoTxt logo wraps Claude Code prompt box in white lasso & pastes Markdown
      await sleep(stepGap);
      if (id !== tourRunId) return;
      if (pasteStage.editor) pasteStage.editor.focus({ preventScroll: true });
      programmaticTourAction = true;
      pasteStage.triggerPaste();
      programmaticTourAction = false;

      if (!(await waitForState(id, (st) => st.pastePhase === "pasted", 3000)))
        return;

      // 3/3: ClipoTxt logo wraps Finish button -> completes tour & flies back to corner dock
      await sleep(reduce ? 240 : 1250);
      if (id !== tourRunId) return;
      pointer.pulseClick();
      await sleep(reduce ? 80 : 300);
      if (id !== tourRunId) return;
      programmaticTourAction = true;
      finishDemo();
      programmaticTourAction = false;
    }

    function toggleLogoTour() {
      if (store.getState().tourPlaying) cancelLogoTour();
      else startLogoTour();
    }

    if (knotWrap) {
      knotWrap.addEventListener("click", (e) => {
        e.stopPropagation();
        if (store.getState().guideUsedOnce) {
          if (knot && knot.gesture) knot.gesture("poke");
          return;
        }
        toggleLogoTour();
      });
      knotWrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (store.getState().guideUsedOnce) return;
          toggleLogoTour();
        }
      });
    }

    let revealed = false;

    function syncAll(state) {
      captureStage.sync(state);
      extractStage.sync(state);
      pasteStage.sync(state);
      progress.render(state);

      let guideInfo = null;
      if (state.stage === "capture")
        guideInfo = captureStage.getGuidanceTarget(state);
      else if (state.stage === "extract")
        guideInfo = extractStage.getGuidanceTarget(state);
      else if (state.stage === "paste")
        guideInfo = pasteStage.getGuidanceTarget(state);

      const targetEl = guideInfo ? guideInfo.el : null;
      const effectiveMode = state.guideUsedOnce
        ? "explore"
        : (revealed ? state.guidanceMode : "explore");

      overlay.update({
        mode: effectiveMode,
        targetEl,
        kicker: guideInfo ? guideInfo.kicker : "",
        title: guideInfo ? guideInfo.title : "",
        hint: guideInfo ? guideInfo.hint : "",
        compactHint: guideInfo ? guideInfo.compactHint : "",
      });
      pointer.updatePosition(
        targetEl,
        effectiveMode,
        guideInfo,
      );

      if (!targetEl) {
        if (state.extractPhase === "scanning") setKnotState("thinking");
        else if (state.guidanceMode === "explore") setKnotState("idle");
        else setKnotState("ready");
      }
    }

    store.subscribe(syncAll);
    syncAll(store.getState());

    addEventListener("resize", () => {
      if (pointer.resetHome) pointer.resetHome();
      syncAll(store.getState());
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        revealObserver.disconnect();
        stageEl.classList.add("in");
        let launched = false;
        const launch = () => {
          if (launched) return;
          launched = true;
          revealed = true;
          syncAll(store.getState());
        };
        if (reduce) {
          launch();
        } else {
          shell.addEventListener(
            "transitionend",
            (e) => {
              if (e.target === shell && e.propertyName === "transform")
                launch();
            },
            { once: true },
          );
          setTimeout(launch, 1180);
        }
      },
      { threshold: 0.25 },
    );
    revealObserver.observe(shell);

    return {
      store,
      navigateStage,
      startLogoTour,
      cancelLogoTour,
      replay: replayDemo,
    };
  }

  window.ClipoDemo.InteractiveDemo = InteractiveDemo;
})();
