/* ClipoTxt Interactive Demo — Mode-Aware Guidance Strip, Hints Pill & Transform-Safe Highlight Ring */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function localRect(el, ancestor) {
    let left = 0,
      top = 0,
      node = el;
    while (node && node !== ancestor) {
      left += node.offsetLeft - (node.scrollLeft || 0);
      top += node.offsetTop - (node.scrollTop || 0);
      node = node.offsetParent;
    }
    return { left, top, width: el.offsetWidth, height: el.offsetHeight };
  }

  function createDemoOverlay(stageRoot) {
    const coach = document.createElement("div");
    coach.className = "ct-demo-coach";
    coach.setAttribute("role", "status");
    coach.setAttribute("aria-live", "polite");
    coach.hidden = true;
    coach.innerHTML = `
      <div class="ct-coach-main">
        <span class="ct-coach-kicker mono" data-kicker></span>
        <strong class="ct-coach-title" data-title></strong>
        <span class="ct-coach-hint" data-hint></span>
      </div>
    `;

    const hintPill = document.createElement("div");
    hintPill.className = "ct-mode-hint-pill";
    hintPill.setAttribute("aria-hidden", "true");
    hintPill.hidden = true;

    const ring = document.createElement("div");
    ring.className = "ct-demo-ring";
    ring.setAttribute("aria-hidden", "true");
    ring.hidden = true;

    stageRoot.prepend(coach);
    stageRoot.append(hintPill, ring);

    const kEl = coach.querySelector("[data-kicker]");
    const tEl = coach.querySelector("[data-title]");
    const hEl = coach.querySelector("[data-hint]");
    let rafId = 0;
    let lastOpts = null;

    function syncRing() {
      if (!lastOpts || lastOpts.mode === "explore" || !lastOpts.title) {
        ring.hidden = true;
        return;
      }
      const { mode, targetEl } = lastOpts;
      if (!targetEl || !targetEl.isConnected || stageRoot.clientWidth < 10) {
        ring.hidden = true;
        return;
      }
      const r = localRect(targetEl, stageRoot);
      if (r.width < 4 || r.height < 4) {
        ring.hidden = true;
        return;
      }
      const left = r.left - 5;
      const top = r.top - 5;
      ring.style.cssText = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${Math.round(r.width + 10)}px;height:${Math.round(r.height + 10)}px;`;
      ring.className = `ct-demo-ring is-${mode}`;
      ring.hidden = false;
    }

    function update(opts) {
      cancelAnimationFrame(rafId);
      lastOpts = opts;
      const { mode, kicker, title, hint, compactHint } = opts;

      if (mode === "explore" || !title) {
        ring.hidden = true;
        coach.hidden = true;
        hintPill.hidden = true;
        stageRoot.dataset.guidance = "explore";
        return;
      }

      stageRoot.dataset.guidance = mode;

      if (mode === "hints") {
        coach.hidden = true;
        hintPill.hidden = !compactHint;
        if (compactHint) hintPill.textContent = compactHint;
      } else {
        hintPill.hidden = true;
        kEl.textContent = kicker || "";
        tEl.textContent = title;
        hEl.textContent = hint ? `— ${hint}` : "";
        coach.hidden = false;
      }

      rafId = requestAnimationFrame(syncRing);
    }

    const ro =
      "ResizeObserver" in window ? new ResizeObserver(() => syncRing()) : null;
    if (ro) ro.observe(stageRoot);

    return {
      update,
      destroy() {
        cancelAnimationFrame(rafId);
        if (ro) ro.disconnect();
        coach.remove();
        hintPill.remove();
        ring.remove();
      },
    };
  }

  window.ClipoDemo.DemoOverlay = { create: createDemoOverlay };
})();
