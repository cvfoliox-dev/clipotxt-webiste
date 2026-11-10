/* ClipoTxt Interactive Demo — Guidance Mode Selector (Guided / Hints / Explore) */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  const MODES = [
    { id: "guided", label: "Guided", desc: "Pointer & step instructions" },
    { id: "hints", label: "Hints", desc: "Subtle highlights only" },
    { id: "explore", label: "Explore", desc: "Free hands-on controls" }
  ];

  function createGuidanceMode(mountEl, store) {
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

    mountEl.appendChild(wrap);
    const buttons = [...wrap.querySelectorAll(".ct-mode-btn")];

    function sync(state) {
      buttons.forEach((btn) => {
        const active = btn.dataset.guidanceMode === state.guidanceMode;
        btn.classList.toggle("on", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.tabIndex = active ? 0 : -1;
      });
    }

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guidance-mode]");
      if (!btn) return;
      store.setState({ guidanceMode: btn.dataset.guidanceMode });
    });

    wrap.addEventListener("keydown", (e) => {
      const idx = buttons.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = buttons[(idx + 1) % buttons.length];
        next.focus();
        store.setState({ guidanceMode: next.dataset.guidanceMode });
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = buttons[(idx - 1 + buttons.length) % buttons.length];
        prev.focus();
        store.setState({ guidanceMode: prev.dataset.guidanceMode });
      }
    });

    sync(store.getState());
    const unsub = store.subscribe(sync);
    return { el: wrap, destroy: unsub };
  }

  window.ClipoDemo.GuidanceMode = { create: createGuidanceMode, MODES };
})();

