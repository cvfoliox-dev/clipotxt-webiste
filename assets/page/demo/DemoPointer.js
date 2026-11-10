/* ClipoTxt Interactive Demo — Animated Guidance Pointer (Guided mode only, transform-safe local coords) */
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

  function createDemoPointer(stageRoot, reduceMotion) {
    const pointer = document.createElement("div");
    pointer.className = "ct-demo-pointer";
    pointer.setAttribute("aria-hidden", "true");
    pointer.hidden = true;
    pointer.innerHTML = `
      <svg class="ct-ptr-svg" viewBox="0 0 28 28" fill="none">
        <path d="M5 3L23 14.5L13.5 16.5L9.5 25L5 3Z" fill="#f1ecdf" stroke="#060810" stroke-width="2" stroke-linejoin="round"/>
      </svg>
      <span class="ct-ptr-ripple"></span>
    `;
    stageRoot.appendChild(pointer);

    let lastTarget = null;
    let currentTarget = null;
    let currentMode = "guided";
    let rafId = 0;

    function positionNow() {
      if (
        reduceMotion ||
        currentMode !== "guided" ||
        !currentTarget ||
        !currentTarget.isConnected
      ) {
        pointer.hidden = true;
        return;
      }
      const w = stageRoot.clientWidth;
      const h = stageRoot.clientHeight;
      const r = localRect(currentTarget, stageRoot);
      if (r.width < 4 || r.height < 4 || w < 10) {
        pointer.hidden = true;
        return;
      }
      const x = Math.min(w - 32, Math.max(12, r.left + r.width * 0.62));
      const y = Math.min(h - 32, Math.max(12, r.top + r.height * 0.56));
      pointer.hidden = false;
      pointer.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    }

    function updatePosition(targetEl, mode) {
      cancelAnimationFrame(rafId);
      currentTarget = targetEl;
      currentMode = mode;
      if (
        reduceMotion ||
        mode !== "guided" ||
        !targetEl ||
        !targetEl.isConnected
      ) {
        pointer.hidden = true;
        lastTarget = null;
        return;
      }
      rafId = requestAnimationFrame(() => {
        positionNow();
        if (lastTarget !== targetEl) {
          pointer.classList.remove("nudge");
          void pointer.offsetWidth;
          pointer.classList.add("nudge");
          lastTarget = targetEl;
        }
      });
    }

    const ro =
      "ResizeObserver" in window
        ? new ResizeObserver(() => positionNow())
        : null;
    if (ro) ro.observe(stageRoot);

    function pulseClick() {
      if (pointer.hidden) return;
      pointer.classList.remove("clicking");
      void pointer.offsetWidth;
      pointer.classList.add("clicking");
    }

    return {
      updatePosition,
      pulseClick,
      destroy() {
        cancelAnimationFrame(rafId);
        if (ro) ro.disconnect();
        pointer.remove();
      },
    };
  }

  window.ClipoDemo.DemoPointer = { create: createDemoPointer };
})();
