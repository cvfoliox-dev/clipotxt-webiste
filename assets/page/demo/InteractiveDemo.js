/* ClipoTxt Interactive Demo — Main State Machine & Stage Orchestrator */
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

    // Replace visible corner knot loop with ClipoTxt's 3D animated companion logo once knot-page.js loads
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
        brandSlot.setAttribute("aria-hidden", "true");
        knotWrap.appendChild(brandSlot);
      }
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

    const pointer = CD.DemoPointer.create(viewport, reduce);
    const overlay = CD.DemoOverlay.create(viewport);
    const guidance = CD.GuidanceMode.create(modeHost, store);

    function navigateStage(stageName) {
      store.setState({ stage: stageName, finishDone: false });
    }

    function replayDemo() {
      store.reset(true);
      setKnotState("ready");
    }

    function finishDemo() {
      store.setState({ finishDone: true });
      setKnotState("ready");
    }

    const captureStage = CD.CaptureStage.create(viewport, store, {
      onAdvanceToExtract: () => navigateStage("extract"),
      onActionPulse: () => pointer.pulseClick(),
    });

    const extractStage = CD.ExtractStage.create(viewport, store, {
      onAdvanceToPaste: () => navigateStage("paste"),
      onActionPulse: () => pointer.pulseClick(),
    });

    const pasteStage = CD.PasteStage.create(viewport, store, {
      onReplay: replayDemo,
      onFinish: finishDemo,
      onGoExtract: () => navigateStage("extract"),
      onActionPulse: () => pointer.pulseClick(),
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
      overlay.update({
        mode: state.guidanceMode,
        targetEl,
        kicker: guideInfo ? guideInfo.kicker : "",
        title: guideInfo ? guideInfo.title : "",
        hint: guideInfo ? guideInfo.hint : "",
        compactHint: guideInfo ? guideInfo.compactHint : "",
      });
      pointer.updatePosition(
        targetEl,
        revealed ? state.guidanceMode : "explore",
      );

      if (state.pastePhase === "pasted") setKnotState("ready");
      else if (state.extractPhase === "scanning") setKnotState("thinking");
      else if (state.guidanceMode === "explore") setKnotState("idle");
      else setKnotState("ready");
    }

    store.subscribe(syncAll);
    syncAll(store.getState());

    addEventListener("resize", () => syncAll(store.getState()));

    const revealObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        revealObserver.disconnect();
        stageEl.classList.add("in");
        revealed = true;
        setTimeout(
          () => {
            syncAll(store.getState());
          },
          reduce ? 0 : 450,
        );
      },
      { threshold: 0.25 },
    );
    revealObserver.observe(shell);

    return {
      store,
      navigateStage,
      replay: replayDemo,
    };
  }

  window.ClipoDemo.InteractiveDemo = InteractiveDemo;
})();
