/* ClipoTxt Interactive Demo — Guidance Mode Selector & Chatbot-Style Logo Tour Toggle */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  const MODES = [
    { id: "guided", label: "Guided", desc: "ClipoTxt logo points step by step" },
    { id: "hints", label: "Hints", desc: "Subtle highlights only" },
    { id: "explore", label: "Explore", desc: "Free hands-on controls" }
  ];

  function createGuidanceMode(mountEl, store, opts) {
    const { onToggleTour } = opts || {};

    const ctrls = document.createElement("div");
    ctrls.className = "ct-mode-bar";

    const tourBtn = document.createElement("button");
    tourBtn.type = "button";
    tourBtn.className = "ct-tour-btn";
    tourBtn.dataset.action = "logo-tour";
    tourBtn.title = "Watch the ClipoTxt logo walk through each click step by step";
    tourBtn.innerHTML = `<span class="ct-tour-dot" aria-hidden="true"></span><span data-tour-lbl>Logo Tour</span>`;

    const wrap = document.createElement("div");
    wrap.className = "ct-mode-switch";
    wrap.setAttribute("role", "tablist");
    wrap.setAttribute("aria-label", "Demonstration guidance mode");

    wrap.innerHTML = MODES.map((m) => `
      <button
        type="button"
        class="ct-mode-btn"
        role="tab"
        data-guidance-mode="${m.id}"
        aria-selected="false"
        title="${m.desc}"
      >${m.label}</button>
    `).join("");

    ctrls.append(tourBtn, wrap);
    mountEl.appendChild(ctrls);

    const tourLbl = tourBtn.querySelector("[data-tour-lbl]");
    const buttons = [...wrap.querySelectorAll(".ct-mode-btn")];

    function sync(state) {
      const lockedOnce = Boolean(state.guideUsedOnce);
      buttons.forEach((btn) => {
        const isManualExplore = btn.dataset.guidanceMode === "explore";
        const active = btn.dataset.guidanceMode === state.guidanceMode;
        btn.classList.toggle("on", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.disabled = lockedOnce && !isManualExplore;
        btn.tabIndex = active ? 0 : -1;
      });
      const playing = Boolean(state.tourPlaying);
      tourBtn.classList.toggle("is-playing", playing);
      tourBtn.setAttribute("aria-pressed", playing ? "true" : "false");
      tourBtn.disabled = lockedOnce;
      tourBtn.title = lockedOnce
        ? "One-time logo walkthrough finished — refresh page to replay guide"
        : "Watch the ClipoTxt logo walk through each click step by step";
      tourLbl.textContent = lockedOnce ? "Refresh for Guide" : (playing ? "Stop Tour" : "Logo Tour");
    }

    tourBtn.addEventListener("click", () => {
      if (store.getState().guideUsedOnce) return;
      if (onToggleTour) onToggleTour();
    });

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guidance-mode]");
      if (!btn || btn.disabled) return;
      if (store.getState().guideUsedOnce && btn.dataset.guidanceMode !== "explore") return;
      store.setState({ guidanceMode: btn.dataset.guidanceMode, tourPlaying: false });
    });

    wrap.addEventListener("keydown", (e) => {
      if (store.getState().guideUsedOnce) return;
      const idx = buttons.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = buttons[(idx + 1) % buttons.length];
        next.focus();
        store.setState({ guidanceMode: next.dataset.guidanceMode, tourPlaying: false });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
        prev.focus();
        store.setState({ guidanceMode: prev.dataset.guidanceMode, tourPlaying: false });
      }
    });

    sync(store.getState());
    const unsub = store.subscribe(sync);
    return { el: ctrls, destroy: unsub };
  }

  window.ClipoDemo.GuidanceMode = { create: createGuidanceMode, MODES };
})();
