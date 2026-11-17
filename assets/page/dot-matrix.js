/* ClipoTxt — Interactive Dot-Matrix Wordmark Animation
   Ported directly from reference engine ("D:\web pages\logo cvfoliox.html").
   - Wordmark: "CLIPOTXT" (all letters constructed entirely from dynamic particle dots)
   - Edge-to-edge typography (fills 96% of container width)
   - Particle Movement: Exact physics from "D:\web pages\logo cvfoliox.html"
     * Fluid circular pointer repulsion: f = pow(1 - d / R, 1.4) * 3.4
     * Spring return: vx += (hx - x) * 0.045, vy += (hy - y) * 0.045
     * Exponential damping: vx *= 0.84, vy *= 0.84
     * Velocity-stretched round lineCap stroke (directional motion blur streaks)
   - Auto-demo cursor sweep loop when idle (keeps typography actively moving & alive)
   - Color: Pure brilliant white (#ffffff) on dark navy footer with luminous shadow
   - Immediate guaranteed visibility across laptop, desktop, tablet, and mobile */

(function () {
  "use strict";

  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  class DotMatrixTypography {
    constructor(container, options = {}) {
      this.container = container;
      this.text = options.text || "CLIPOTXT";
      this.fontFamily =
        options.fontFamily ||
        '"Instrument Serif", Georgia, "Times New Roman", serif';
      this.DOT_COLOR = options.color || "#ffffff";

      this.canvas = document.createElement("canvas");
      this.canvas.className = "clipo-particle-canvas";
      this.canvas.setAttribute("aria-label", this.text);
      this.ctx = this.canvas.getContext("2d", { alpha: true });

      this.offCanvas = document.createElement("canvas");
      this.offCtx = this.offCanvas.getContext("2d", { willReadFrequently: true });

      this.dots = [];
      this.width = 0;
      this.height = 0;
      this.step = 5;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Pointer tracking & auto-demo idle timing (directly from logo cvfoliox.html)
      this.mx = -1e4;
      this.my = -1e4;
      this.active = false;
      this.lastMove = performance.now();
      this.t0 = performance.now();

      this.animId = null;
      this.isDestroyed = false;

      this.initDOM();
      this.bindEvents();
      this.resize();

      // Ensure fonts trigger re-build when ready
      if (document.fonts) {
        document.fonts.ready.then(() => {
          if (!this.isDestroyed) {
            this.build();
          }
        });
      }

      // Safeguard layout updates for laptop reflow
      [60, 200, 600, 1200].forEach((ms) => {
        setTimeout(() => {
          if (!this.isDestroyed) {
            const currentW = this.container.getBoundingClientRect().width;
            if (currentW > 0 && Math.abs(currentW - this.width) > 6) {
              this.resize();
            } else if (!this.dots || this.dots.length === 0) {
              this.build();
            }
          }
        }, ms);
      });

      // Start continuous animation loop immediately
      this.startLoop();
    }

    initDOM() {
      this.container.innerHTML = "";
      this.container.style.position = "relative";
      this.container.style.width = "100%";
      this.container.style.boxSizing = "border-box";
      this.container.style.pointerEvents = "auto";
      this.container.style.touchAction = "pan-y";
      this.container.style.userSelect = "none";
      this.container.style.display = "block";
      this.container.style.overflow = "visible";

      this.canvas.style.display = "block";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "auto";
      this.canvas.style.margin = "0 auto";
      this.canvas.style.pointerEvents = "auto";
      this.canvas.style.cursor = "default";

      this.container.appendChild(this.canvas);
    }

    bindEvents() {
      const updatePointer = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const p = e.touches ? e.touches[0] : e;
        this.mx = p.clientX - rect.left;
        this.my = p.clientY - rect.top;
        this.active = true;
        this.lastMove = performance.now();
      };

      this.handlePointerMove = (e) => updatePointer(e);
      this.handlePointerDown = (e) => updatePointer(e);
      this.handlePointerLeave = () => {
        this.active = false;
        this.mx = -1e4;
        this.my = -1e4;
      };

      this.canvas.addEventListener("pointermove", this.handlePointerMove, {
        passive: true,
      });
      this.canvas.addEventListener("pointerdown", this.handlePointerDown, {
        passive: true,
      });
      this.canvas.addEventListener("touchmove", this.handlePointerMove, {
        passive: true,
      });
      this.canvas.addEventListener("touchstart", this.handlePointerDown, {
        passive: true,
      });
      this.canvas.addEventListener("pointerleave", this.handlePointerLeave, {
        passive: true,
      });
      this.canvas.addEventListener("pointercancel", this.handlePointerLeave, {
        passive: true,
      });
      this.canvas.addEventListener("touchend", this.handlePointerLeave, {
        passive: true,
      });

      // ResizeObserver to adapt dynamically on laptop viewports
      if (window.ResizeObserver) {
        this.ro = new ResizeObserver((entries) => {
          for (let entry of entries) {
            const cr = entry.contentRect;
            if (cr.width > 0 && Math.abs(cr.width - this.width) > 4) {
              this.resize();
            }
          }
        });
        this.ro.observe(this.container);
      }

      this.handleResize = () => {
        if (!this.isDestroyed) this.resize();
      };
      window.addEventListener("resize", this.handleResize, { passive: true });
      window.addEventListener("orientationchange", this.handleResize, {
        passive: true,
      });
    }

    resize() {
      const rect = this.container.getBoundingClientRect();
      const docW =
        document.documentElement.clientWidth || window.innerWidth || 1440;
      let w = rect.width;
      if (!w || !isFinite(w) || w <= 0) {
        w = docW;
      }
      this.width = Math.max(Math.round(w), 300);
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.build();
    }

    build() {
      const W = this.width;
      if (!W || !isFinite(W) || W <= 0) return;

      // Font selection with fallback
      const isFontReady =
        document.fonts && document.fonts.check('400 32px "Instrument Serif"');
      const currentFontFamily = isFontReady
        ? '"Instrument Serif", Georgia, serif'
        : 'Georgia, "Times New Roman", serif';

      // 1. Edge-to-edge target width (96% of container)
      const targetTextWidth =
        W < 600 ? W * 0.96 : Math.min(W * 0.96, W - 30);

      // 2. Measure trial font at 100px
      const off = this.offCtx;
      off.font = `400 100px ${currentFontFamily}`;
      let trialWidth = off.measureText(this.text).width;
      if (!trialWidth || !isFinite(trialWidth) || trialWidth < 10) {
        trialWidth = 350;
      }

      let fontSize = Math.round((targetTextWidth / trialWidth) * 100);
      if (!fontSize || !isFinite(fontSize) || fontSize <= 0) {
        fontSize = Math.round(W * 0.22);
      }
      fontSize = Math.max(48, Math.min(fontSize, Math.round(W * 0.36)));

      // 3. Exact vertical typography measurement (ascent + descent)
      off.font = `400 ${fontSize}px ${currentFontFamily}`;
      const metrics = off.measureText(this.text);
      const ascent =
        metrics.actualBoundingBoxAscent &&
        isFinite(metrics.actualBoundingBoxAscent)
          ? metrics.actualBoundingBoxAscent
          : fontSize * 0.74;
      const descent =
        metrics.actualBoundingBoxDescent &&
        isFinite(metrics.actualBoundingBoxDescent)
          ? metrics.actualBoundingBoxDescent
          : fontSize * 0.16;
      const textHeight = ascent + descent;

      // 4. Adapt canvas height to EXACT text dimensions with comfortable vertical padding
      const padY =
        W < 600 ? 25 : Math.max(35, Math.round(textHeight * 0.18));
      const H = Math.max(Math.round(textHeight + padY * 2), 150);
      this.height = H;

      // Synchronize canvas dimensions & DPR
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.canvas.style.width = "100%";
      this.canvas.style.height = `${this.height}px`;

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      this.offCanvas.width = this.width;
      this.offCanvas.height = this.height;

      // 5. Render glyph geometry on offscreen raster canvas
      off.clearRect(0, 0, W, H);
      off.fillStyle = "#ffffff";
      off.textAlign = "center";
      off.textBaseline = "alphabetic";
      off.font = `400 ${fontSize}px ${currentFontFamily}`;

      const baselineY = padY + ascent;
      off.fillText(this.text, W / 2, baselineY);

      // 6. Regular grid density step (matching cvfoliox dot density)
      let step;
      if (W < 480) step = 3;
      else if (W < 768) step = 4;
      else if (W < 1200) step = 5;
      else step = 5;

      this.step = step;
      const imgData = off.getImageData(0, 0, W, H).data;
      const dots = [];

      for (let y = Math.floor(step / 2); y < H; y += step) {
        const py = Math.floor(y);
        for (let x = Math.floor(step / 2); x < W; x += step) {
          const px = Math.floor(x);
          const idx = (py * W + px) * 4;
          const alpha = imgData[idx + 3];

          if (alpha > 40) {
            dots.push({
              hx: px,
              hy: py,
              x: px,
              y: py,
              vx: 0,
              vy: 0,
            });
          }
        }
      }

      // Fallback if font sampling yielded 0 dots
      if (dots.length === 0) {
        off.font = `700 ${fontSize}px sans-serif`;
        off.fillText(this.text, W / 2, baselineY);
        const retryData = off.getImageData(0, 0, W, H).data;
        for (let y = Math.floor(step / 2); y < H; y += step) {
          const py = Math.floor(y);
          for (let x = Math.floor(step / 2); x < W; x += step) {
            const px = Math.floor(x);
            const idx = (py * W + px) * 4;
            if (retryData[idx + 3] > 40) {
              dots.push({
                hx: px,
                hy: py,
                x: px,
                y: py,
                vx: 0,
                vy: 0,
              });
            }
          }
        }
      }

      this.dots = dots;

      // Draw initial static frame immediately so canvas is NEVER blank
      this.drawStaticFrame();
    }

    drawStaticFrame() {
      if (!this.dots || this.dots.length === 0) return;
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.width, this.height);

      const r = this.step * 0.36;
      ctx.strokeStyle = this.DOT_COLOR;
      ctx.lineCap = "round";
      ctx.lineWidth = r * 2;

      ctx.beginPath();
      for (let i = 0; i < this.dots.length; i++) {
        const p = this.dots[i];
        ctx.moveTo(p.hx, p.hy);
        ctx.lineTo(p.hx + 0.01, p.hy);
      }
      ctx.stroke();
    }

    startLoop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      const render = (now) => {
        if (this.isDestroyed) return;
        this.frame(now);
        this.animId = requestAnimationFrame(render);
      };
      this.animId = requestAnimationFrame(render);
    }

    frame(now) {
      const dots = this.dots;
      if (!dots || dots.length === 0) return;

      const W = this.width;
      const H = this.height;

      let cx = this.mx;
      let cy = this.my;

      // Auto-demo cursor sweep when idle (exact behavior from logo cvfoliox.html)
      if (!reduceMotion && now - this.lastMove > 2000) {
        const t = (now - this.t0) / 1000;
        cx =
          W / 2 +
          Math.sin(t * 0.9) * (W * 0.36) +
          Math.sin(t * 2.3) * (W * 0.08);
        cy =
          H / 2 +
          Math.cos(t * 0.7) * (H * 0.30) +
          Math.sin(t * 1.7) * (H * 0.08);
      }

      // Physics constants directly from logo cvfoliox.html
      const R = Math.max(75, Math.min(W * 0.13, 140));
      const R2 = R * R;
      const st = this.step;
      const r = st * 0.36;

      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Subtle radiant glow
      ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
      ctx.shadowBlur = 6;

      ctx.strokeStyle = this.DOT_COLOR;
      ctx.lineCap = "round";
      ctx.lineWidth = r * 2;
      ctx.beginPath();

      const len = dots.length;
      for (let i = 0; i < len; i++) {
        const p = dots[i];

        if (!reduceMotion) {
          const dx = p.x - cx;
          const dy = p.y - cy;
          const d2 = dx * dx + dy * dy;

          // Exact repulsion formula from logo cvfoliox.html
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const f = Math.pow(1 - d / R, 1.4) * 3.4;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }

          // Exact spring return & damping from logo cvfoliox.html
          p.vx += (p.hx - p.x) * 0.045;
          p.vy += (p.hy - p.y) * 0.045;
          p.vx *= 0.84;
          p.vy *= 0.84;
          p.x += p.vx;
          p.y += p.vy;
        }

        // Exact velocity-stretched lineCap stroke from logo cvfoliox.html
        const sp = Math.hypot(p.vx, p.vy);
        const k = Math.min(2.2, 1 + sp * 0.35);

        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * k + 0.01, p.y + p.vy * k);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    destroy() {
      this.isDestroyed = true;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      if (this.ro) this.ro.disconnect();
      this.canvas.removeEventListener("pointermove", this.handlePointerMove);
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
      this.canvas.removeEventListener("touchmove", this.handlePointerMove);
      this.canvas.removeEventListener("touchstart", this.handlePointerDown);
      this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
      this.canvas.removeEventListener("pointercancel", this.handlePointerLeave);
      this.canvas.removeEventListener("touchend", this.handlePointerLeave);
      window.removeEventListener("resize", this.handleResize);
      window.removeEventListener("orientationchange", this.handleResize);
    }
  }

  window.DotMatrixTypography = DotMatrixTypography;
})();
