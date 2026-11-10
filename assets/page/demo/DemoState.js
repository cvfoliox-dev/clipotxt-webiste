/* ClipoTxt Interactive Demo — Genuine Product Assets & State Store */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  const SAMPLE_DATA = {
    imageSrc: "assets/demo/sample-table.png",
    appHomeSrc: "assets/demo/app-home-active.png",
    claudeCodeShotSrc: "assets/demo/claude-code-new-chat.png",
    claudeLogoSrc: "assets/demo/claude-logo.svg",
    logoSrc: "assets/logo.png",
    imageDimensions: "900 × 340 px",
    imageResolutionLabel: "0.31 MP · Light Table",
    ocrElapsedMs: 571.5,
    ocrConfidencePct: 98.6,
    engineLabel: "RapidOCR · PP-OCRv4 · ONNX CPU",
    extractedMarkdown: [
      "# Screenshot Analysis",
      "",
      "## Extracted Content",
      "### Data Table",
      "",
      "| Capability | Standard Flow | ClipoTxt Local |",
      "| :--- | :--- | :--- |",
      "| Processing | Cloud upload required | ONNX Runtime CPU |",
      "| Workflow | Retype or send image | Win + Shift + S -> Ctrl + V |",
      "| Output Format | Unstructured snippet | Clean Markdown & Code |",
      "| History Storage | External sync account | Local SQLite archive |"
    ].join("\n"),
    extractedPlain: [
      "Capability | Standard Flow | ClipoTxt Local",
      "Processing | Cloud upload required | ONNX Runtime CPU",
      "Workflow | Retype or send image | Win + Shift + S -> Ctrl + V",
      "Output Format | Unstructured snippet | Clean Markdown & Code",
      "History Storage | External sync account | Local SQLite archive"
    ].join("\n")
  };

  const INITIAL_STATE = () => ({
    stage: "capture",          // "capture" | "extract" | "paste"
    guidanceMode: "guided",    // "guided" | "hints" | "explore"
    captureDone: false,
    captureAnimating: false,
    extractPhase: "idle",      // "idle" | "scanning" | "copied"
    toastVisible: false,
    aiContextMode: true,
    pastePhase: "idle",        // "idle" | "pasted"
    finishDone: false,
    tourPlaying: false,
    guideUsedOnce: false,
    clipboardStatus: "Empty",  // "Empty" | "Image detected" | "Text copied"
    startedAt: { capture: 0, extract: 0, paste: 0 },
    timings: { capture: null, extract: null, paste: null }
  });

  function createDemoStore() {
    let state = INITIAL_STATE();
    const listeners = new Set();

    return {
      getState: () => state,
      SAMPLE_DATA,
      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      setState(patch) {
        const prev = state;
        state = Object.assign({}, state, patch);
        listeners.forEach((fn) => fn(state, prev));
      },
      reset(keepMode = true) {
        const used = Boolean(state.guideUsedOnce);
        const mode = used ? "explore" : (keepMode ? state.guidanceMode : "guided");
        state = Object.assign(INITIAL_STATE(), {
          guidanceMode: mode,
          guideUsedOnce: used
        });
        listeners.forEach((fn) => fn(state, null));
      }
    };
  }

  window.ClipoDemo.SAMPLE_DATA = SAMPLE_DATA;
  window.ClipoDemo.createDemoStore = createDemoStore;
})();

