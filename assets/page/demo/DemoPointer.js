/* ClipoTxt Interactive Demo — Chatbot-Signature Lasso & Travelling ClipoTxt Companion Logo */
(function () {
  window.ClipoDemo = window.ClipoDemo || {};

  function createDemoPointer(stageRoot, knotWrap, knot, reduceMotion) {
    // Crisp dark translucent step badge matching .pk-bub right inside #aStage
    const bub = document.createElement("div");
    bub.className = "ct-guide-bub";
    bub.setAttribute("aria-hidden", "true");
    bub.hidden = true;
    bub.innerHTML = `
      <span class="ct-gb-kicker mono" data-step-tag></span>
      <span class="ct-gb-text" data-bub-txt></span>
    `;
    stageRoot.appendChild(bub);

    const stepTagEl = bub.querySelector("[data-step-tag]");
    const bubTxtEl = bub.querySelector("[data-bub-txt]");

    let lastTarget = null;
    let isDeployed = false;
    let rafId = 0;

    function computeLanding(rect, stageRect, compact, isFinish) {
      const m = compact ? 42 : 56;
      const dx = compact ? 44 : 64;
      const dy = compact ? 36 : 44;

      const candidates = isFinish
        ? [
            [rect.right + dx, rect.bottom + dy],
            [rect.left + rect.width * 0.5, rect.bottom + dy + 10],
            [rect.left - dx, rect.bottom + dy]
          ]
        : [
            [rect.right + dx, rect.bottom + dy],
            [rect.left - dx, rect.bottom + dy],
            [rect.right + dx, rect.top - dy],
            [rect.left - dx, rect.top - dy]
          ];

      for (const [x, y] of candidates) {
        if (
          x > stageRect.left + m &&
          x < stageRect.right - m &&
          y > stageRect.top + m &&
          y < stageRect.bottom - m
        ) {
          return { x, y };
        }
      }

      return {
        x: Math.min(stageRect.right - m, Math.max(stageRect.left + m, rect.right + (compact ? 24 : dx))),
        y: Math.min(stageRect.bottom - m, Math.max(stageRect.top + m, rect.bottom + (compact ? 26 : dy)))
      };
    }

    function placeBubble(rect, spot, stageRect, targetEl) {
      const bw = bub.offsetWidth || 190;
      const bh = bub.offsetHeight || 34;
      const gap = 12;

      const preferBelow = targetEl && targetEl.tagName === "TEXTAREA";
      let bx = rect.left + rect.width / 2 - bw / 2;
      let by = preferBelow ? rect.bottom + gap : rect.top - bh - gap;
      if (preferBelow && by + bh > stageRect.bottom - 10) {
        by = rect.top - bh - gap;
      } else if (!preferBelow && by < stageRect.top + 8) {
        by = rect.bottom + gap;
      }

      // Avoid covering the ClipoTxt corner companion resting at spot
      const overlapsKnot =
        spot.x + 54 > bx &&
        spot.x - 54 < bx + bw &&
        spot.y + 48 > by &&
        spot.y - 48 < by + bh;

      if (overlapsKnot) {
        bx = spot.x < stageRect.left + stageRect.width / 2
          ? Math.min(stageRect.right - bw - 10, spot.x + 56)
          : Math.max(stageRect.left + 10, spot.x - 56 - bw);
      }

      const relX = Math.round(Math.min(Math.max(8, bx - stageRect.left), Math.max(8, stageRect.width - bw - 8)));
      const relY = Math.round(Math.min(Math.max(8, by - stageRect.top), Math.max(8, stageRect.height - bh - 8)));
      bub.style.translate = `${relX}px ${relY}px`;
    }

    function goHome() {
      bub.hidden = true;
      bub.classList.remove("on");
      lastTarget = null;
      if (knot && knot.strand && isDeployed) {
        isDeployed = false;
        knot.setState && knot.setState("ready");
        knot.strand.rewind();
        knot.strand.arrive(() => {
          if (!isDeployed && knot && knot.strand) {
            knot.strand.resetHome();
          }
        });
        knot.strand.flyHome();
      }
      if (knotWrap) knotWrap.classList.remove("is-travelling");
    }

    function updatePosition(targetEl, mode, meta) {
      cancelAnimationFrame(rafId);

      if (reduceMotion || mode !== "guided" || !targetEl || !targetEl.isConnected) {
        goHome();
        return;
      }

      const isFresh = lastTarget !== targetEl;
      lastTarget = targetEl;

      rafId = requestAnimationFrame(() => {
        if (!targetEl.isConnected) return;
        const b = targetEl.getBoundingClientRect();
        const s = stageRoot.getBoundingClientRect();
        if (b.width < 4 || b.height < 4 || s.width < 10) {
          goHome();
          return;
        }

        const compact = s.width < 640;
        const isFinish = targetEl.dataset && targetEl.dataset.action === "finish-btn";
        const r = { x: b.left, y: b.top, w: b.width, h: b.height };
        const spot = computeLanding(b, s, compact, isFinish);

        if (meta && (meta.stepLabel || meta.ptrText || meta.compactHint)) {
          stepTagEl.textContent = meta.stepLabel || "";
          stepTagEl.hidden = !meta.stepLabel;
          bubTxtEl.textContent = meta.ptrText || meta.compactHint || "";
          bub.hidden = false;
          placeBubble(b, spot, s, targetEl);
          requestAnimationFrame(() => bub.classList.add("on"));
        } else {
          bub.hidden = true;
          bub.classList.remove("on");
        }

        if (knot && knot.strand) {
          isDeployed = true;
          if (knotWrap) knotWrap.classList.add("is-travelling");
          if (isFresh) {
            knot.setState && knot.setState("thinking");
            knot.strand.arrive(() => {
              if (!isDeployed) return;
              knot.setState && knot.setState("ready");
              knot.gesture && knot.gesture("done");
            });
          }
          knot.strand.lasso(r, spot);
        }
      });
    }

    function pulseClick() {
      if (knot && knot.gesture && isDeployed) {
        knot.gesture("done");
      }
      if (!bub.hidden) {
        bub.classList.remove("pulse");
        void bub.offsetWidth;
        bub.classList.add("pulse");
      }
    }

    function resetHome() {
      if (knot && knot.strand) {
        isDeployed = false;
        knot.strand.resetHome();
      }
    }

    return {
      updatePosition,
      pulseClick,
      resetHome,
      destroy() {
        cancelAnimationFrame(rafId);
        goHome();
        bub.remove();
      }
    };
  }

  window.ClipoDemo.DemoPointer = { create: createDemoPointer };
})();
