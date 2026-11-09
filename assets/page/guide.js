/* Setup, option A "Follow along" (picked 2026-09-30). Clipboard Engine / Desktop Workspace tabs; numbered steps
   on the left auto-advance and a screen on the right shows each step where it happens.
   Usage: NusGuide.mount(el)  (el is an empty .guide element) */
(function () {
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const APPLE = '<svg class="os" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.37 12.64c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.29-3.52zM14.2 6.18c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.22z"/></svg>';
  const ext = (href, t) => `<a class="ext" href="https://${href}" target="_blank" rel="noopener">${t || href}</a>`;
  const K = (...k) => k.map((x) => `<kbd>${x}</kbd>`).join(" ");
  const KEYS = {
    snip: { name: "Win + Shift + S", role: "Screen Snip", unlocks: "Capture any screen region to clipboard.", where: "Global Windows shortcut" },
    paste: { name: "Ctrl + V", role: "Instant Paste", unlocks: "Paste clean OCR Markdown directly into any app.", where: "Any text input or IDE" },
    toggle: { name: "Ctrl + Alt + O", role: "OCR Toggle", unlocks: "Pause or resume background clipboard monitoring.", where: "Global hotkey" },
  };
  const GUIDES = {
    companion: [
      { t: "Download & Install", d: "Download ClipoTxt v1.0.3 for Windows 10 & 11. Run the installer and ClipoTxt opens directly—bundling all local OCR weights with zero external setup.", scene: "install", dur: 6 },
      { t: "Snip with Win + Shift + S", d: `Press ${K("Win", "Shift", "S")} to capture any code block, PDF, table, or slide. ClipoTxt automatically extracts the text in the background in ~600–800 ms.`, scene: "snip", dur: 6 },
      { t: "Instant Paste (Ctrl + V)", d: `Press ${K("Ctrl", "V")} directly in VS Code, Notion, Word, or your notes. Your screenshot is already converted into clean text or structured Smart Format Markdown.`, scene: "paste", dur: 6 },
      { t: "Verified Updates & History", d: "Open ClipoTxt from your system tray anytime to search your unlimited local SQLite capture history, export captures as .md, or run SHA-256 verified updates.", scene: "history", dur: 6 },
      { t: "Toggle Engine ON / OFF (Ctrl + Alt + O)", d: `Need to copy a normal screenshot image without extracting text? Press ${K("Ctrl", "Alt", "O")} anywhere in Windows to instantly switch the ClipoTxt OCR engine ON or OFF on the fly.`, scene: "toggle", dur: 7 },
    ],
    students: [
      { t: "Home & Live Status", d: "View active clipboard monitoring status, real-time OCR latency, confidence scores, and quick-copy preview of your latest extraction.", scene: "local", dur: 5 },
      { t: "Unlimited SQLite History", d: "Browse all past captures with full-text search. Export individual extractions or click <b>Export all (.md)</b> to generate a consolidated Markdown file.", scene: "review", dur: 6 },
      { t: "Hardware Benchmarks", d: "Run deterministic single-core and multi-core CPU SIMD mathematical benchmarks, plus fixed synthetic image OCR benchmarks with real ms timings.", scene: "prov", dur: 7 },
      { t: "Official Releases & Portable", d: "Choose between the standard Windows installer (with Start Menu integration and uninstaller) or the zero-install Portable ZIP.", scene: "dl", dur: 6 },
    ],
  };
  const WINCAP = (t) => `<div class="cap">${t}</div>`;

  function sceneHTML(name) {
    switch (name) {
      case "install":
        return WINCAP("Windows 10 / 11 • Direct Launch") + `<div class="g-install-scene">
          <div class="g-video-wrap">
            <video src="assets/installclip.mp4" autoplay loop muted playsinline class="g-install-video"></video>
          </div>
          <div class="gl g-install-toast">
            <img src="assets/app_icon.png" width="16" height="16" alt="ClipoTxt">
            <span>Direct Launch • Local Neural Weights Pre-bundled</span>
          </div>
        </div>`;
      case "snip":
        return WINCAP("Screen Snip (Win + Shift + S)") + `<div class="g-snip-scene">
          <div class="caps-row">${K("Win", "Shift", "S")}</div>
          <div class="g-snip-target">
            <div class="g-snip-bar"><span class="g-dot"></span><span>portal.edu/exam-schedule</span></div>
            <div class="g-snip-body">
              <div class="g-row-header">Exam Schedule 2026 (Copy Protected)</div>
              <div class="g-table-mock">
                <div class="g-tr"><span>CS401</span><span>Distributed Systems</span><span>9:00 AM</span></div>
                <div class="g-tr hot"><span>CS402</span><span>Neural Compilers</span><span>2:00 PM</span></div>
                <div class="g-tr"><span>CS403</span><span>Computer Vision</span><span>11:30 AM</span></div>
              </div>
            </div>
            <div class="g-snip-marquee"><span class="g-snip-badge">Region Captured</span></div>
          </div>
          <div class="gl g-snip-toast"><img src="assets/app_icon.png" width="14" height="14" alt="ClipoTxt"><span>Screenshot captured • Clipboard intercepted</span></div>
        </div>`;
      case "paste":
        return WINCAP("Instant Paste (Ctrl + V)") + `<div class="g-paste-scene">
          <div class="g-paste-target">
            <div class="g-paste-bar"><span class="p-app-icon">📝</span><span>Notes / Editor — Structured Paste</span></div>
            <div class="g-paste-editor">
              <div class="g-paste-prompt">Here is the exam schedule from the portal:</div>
              <div class="g-paste-block">
                <pre><code>| Course | Subject | Time |
|--------|---------|------|
| CS401  | Distributed Systems | 9:00 AM |
| CS402  | Neural Compilers   | 2:00 PM |
| CS403  | Computer Vision    | 11:30 AM |</code></pre>
              </div>
            </div>
          </div>
          <div class="g-paste-keys"><kbd>Ctrl</kbd><kbd>V</kbd><span>Pasted Clean Text</span></div>
          <div class="gl g-win-toast">
            <div class="gwt-head"><img src="assets/app_icon.png" width="14" height="14" alt="ClipoTxt"><span>ClipoTxt • now</span></div>
            <div class="gwt-msg">Your text has been extracted and copied to your clipboard.</div>
          </div>
        </div>`;
      case "history":
        return WINCAP("Desktop Workspace, History & Updates") + `<div class="g-hist-scene">
          <div class="g-app-img-wrap">
            <img src="assets/app-review.webp" alt="ClipoTxt History Screen" class="g-app-img">
            <div class="gl g-hist-overlay">
              <div class="gho-head">
                <span class="gho-title">SQLite WAL Archive</span>
                <span class="gho-btn">Export all (.md)</span>
              </div>
              <div class="gho-sha"><span class="chk-green">✓</span> SHA-256 Verified GitHub Release • v1.0.3</div>
              <div class="gho-path">Stored locally in %LOCALAPPDATA%\\ClipoTxt</div>
            </div>
          </div>
        </div>`;
      case "toggle":
        return WINCAP("Hotkey Engine Toggle (Ctrl + Alt + O)") + `<div class="g-toggle-scene">
          <div class="caps-row g-toggle-keys">
            <kbd>Ctrl</kbd> <kbd>Alt</kbd> <kbd>O</kbd>
          </div>
          <div class="gl g-engine-card">
            <div class="ge-head">
              <div style="display:flex;align-items:center;gap:10px">
                <img src="assets/app_icon.png" width="26" height="26" alt="ClipoTxt" class="ge-icon">
                <div>
                  <div class="ge-appname">ClipoTxt Engine</div>
                  <div class="ge-sub">Global Clipboard Interceptor</div>
                </div>
              </div>
              <div class="ge-status-pill on"><span class="ge-dot"></span><span class="ge-statustext">ENGINE ON</span></div>
            </div>
            <div class="ge-body">
              <div class="ge-mode-box ge-box-on">
                <div class="ge-mode-title">Monitoring Active</div>
                <div class="ge-mode-desc">Screenshots are automatically converted to text</div>
              </div>
              <div class="ge-mode-box ge-box-off" style="display:none">
                <div class="ge-mode-title">Monitoring Paused</div>
                <div class="ge-mode-desc">Screenshots remain normal clipboard images</div>
              </div>
            </div>
            <div class="ge-foot">
              <span class="ge-hint">Press <kbd>Ctrl+Alt+O</kbd> anywhere in Windows to toggle</span>
            </div>
          </div>
          <div class="gl g-toggle-toast">
            <img src="assets/app_icon.png" width="14" height="14" alt="ClipoTxt">
            <span class="gtt-msg">ClipoTxt: Monitoring Active • Screenshots auto-extracted</span>
          </div>
        </div>`;
      case "dl":
        return WINCAP("Pick your download") + `<div class="dl"><div class="b">Windows Installer (v1.0.3) <small>ClipoTxt-Setup-v1.0.3.exe (~206 MB)</small></div><div class="b">Portable ZIP (Zero-Install) <small>ClipoTxt-v1.0.3-windows-x64-portable.zip (~305 MB)</small></div><p class="note">Direct launch on Windows 10 & 11. Standalone package bundles all neural weights with zero external dependencies.</p></div>`;
      case "local":
        return WINCAP("Home / Live Status") + `<div class="win"><img src="assets/app-today.webp" alt="ClipoTxt Home view" style="width:100%;border-radius:10px"></div>`;
      case "prov":
        return WINCAP("Hardware Benchmarks") + `<div class="win"><img src="assets/app-map.webp" alt="ClipoTxt Benchmarks view" style="width:100%;border-radius:10px"></div>`;
      case "review":
        return WINCAP("SQLite History & Markdown Export") + `<div class="win"><img src="assets/app-review.webp" alt="ClipoTxt History view" style="width:100%;border-radius:10px"></div>`;
    }
  }

  const KEEP = { install: true };
  const PLAY = {
    async install(el, w) {
      const v = el.querySelector("video");
      if (v) { try { v.currentTime = 0; await v.play(); } catch (e) {} }
      const toast = el.querySelector(".g-install-toast");
      if (toast) { toast.classList.remove("on"); await w(400); toast.classList.add("on"); }
    },
    async snip(el, w) {
      const caps = el.querySelectorAll(".caps-row kbd"), marquee = el.querySelector(".g-snip-marquee"), toast = el.querySelector(".g-snip-toast");
      if (marquee) marquee.classList.remove("on");
      if (toast) toast.classList.remove("on");
      await w(400);
      caps.forEach((c) => c.classList.add("down"));
      await w(600);
      caps.forEach((c) => c.classList.remove("down"));
      if (marquee) marquee.classList.add("on");
      await w(800);
      if (toast) toast.classList.add("on");
    },
    async paste(el, w) {
      const block = el.querySelector(".g-paste-block"), toast = el.querySelector(".g-win-toast");
      if (block) block.classList.remove("on");
      if (toast) toast.classList.remove("on");
      await w(300);
      if (block) block.classList.add("on");
      await w(400);
      if (toast) toast.classList.add("on");
    },
    async history(el, w) {
      const overlay = el.querySelector(".g-hist-overlay"), btn = el.querySelector(".gho-btn");
      if (overlay) overlay.classList.remove("on");
      if (btn) btn.classList.remove("press");
      await w(500);
      if (overlay) overlay.classList.add("on");
      await w(1200);
      if (btn) btn.classList.add("press");
      await w(200);
      if (btn) btn.classList.remove("press");
    },
    async toggle(el, w) {
      const keys = el.querySelectorAll(".g-toggle-keys kbd"),
        pill = el.querySelector(".ge-status-pill"),
        statusText = el.querySelector(".ge-statustext"),
        boxOn = el.querySelector(".ge-box-on"),
        boxOff = el.querySelector(".ge-box-off"),
        toast = el.querySelector(".g-toggle-toast"),
        msg = el.querySelector(".gtt-msg");

      if (!pill || !boxOn || !boxOff) return;

      // Reset to ON
      pill.classList.remove("off");
      pill.classList.add("on");
      if (statusText) statusText.textContent = "ENGINE ON";
      boxOn.style.display = "block";
      boxOff.style.display = "none";
      if (toast) toast.classList.remove("on");

      await w(1200);
      // Hotkey press
      keys.forEach((k) => k.classList.add("down"));
      await w(450);
      keys.forEach((k) => k.classList.remove("down"));

      // Flip to OFF
      pill.classList.remove("on");
      pill.classList.add("off");
      if (statusText) statusText.textContent = "ENGINE OFF";
      boxOn.style.display = "none";
      boxOff.style.display = "block";
      if (msg) msg.textContent = "ClipoTxt: Monitoring Paused • Press Ctrl+Alt+O to resume";
      if (toast) toast.classList.add("on");

      await w(2000);
      // Hotkey press again to resume
      keys.forEach((k) => k.classList.add("down"));
      await w(450);
      keys.forEach((k) => k.classList.remove("down"));

      // Flip back to ON
      pill.classList.remove("off");
      pill.classList.add("on");
      if (statusText) statusText.textContent = "ENGINE ON";
      boxOff.style.display = "none";
      boxOn.style.display = "block";
      if (msg) msg.textContent = "ClipoTxt: Monitoring Active • Screenshots auto-extracted";
    },
    async map(el, w) {
      const mc = el.querySelector(".mapcard");
      if (mc) { mc.classList.remove("grown"); await w(200); mc.classList.add("grown"); }
    },
  };

  function ProdTabs(root, onPick) {
    const seg = root.querySelector(".prod .seg"), pill = seg.querySelector(".pill"), btns = [...seg.querySelectorAll("button")];
    const place = (b) => { pill.style.transform = `translateX(${b.offsetLeft}px)`; pill.style.width = b.offsetWidth + "px"; };   // glides on transform; the width snaps
    btns.forEach((b) => b.addEventListener("click", () => { btns.forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); place(b); onPick(b.dataset.p); }));
    requestAnimationFrame(() => place(btns[0])); addEventListener("resize", () => place(btns.find((b) => b.classList.contains("on"))));
  }

  function mount(root) {
    root.innerHTML = `<div class="sec">
      <div class="head reveal"><div class="mono">Setup</div><h2 class="serif">Up and running in <em>two minutes.</em></h2><p>Pick your workflow. Each step shows the screen where it happens.</p></div>
      <div class="prod reveal"><div class="seg" role="tablist" aria-label="Which workflow"><span class="pill" aria-hidden="true"></span><button type="button" role="tab" class="on" aria-selected="true" data-p="companion">Clipboard Engine</button><button type="button" role="tab" aria-selected="false" data-p="students">Desktop Workspace</button></div></div>
      <div class="fa reveal"><ol class="gsteps"></ol><div class="screen" aria-live="polite"></div></div></div>`;
    const list = root.querySelector(".gsteps"), screen = root.querySelector(".screen"), fa = root.querySelector(".fa");
    new ResizeObserver(() => screen.style.setProperty("--k", Math.min(1, screen.clientWidth / 660).toFixed(3))).observe(screen);
    // the Knot's thread lives inside the screen, so it scrolls with it
    let cvs = null;
    const ctx = { screen, threadFor() { if (!cvs) { cvs = document.createElement("canvas"); cvs.className = "guide-strand"; cvs.setAttribute("aria-hidden", "true"); } return cvs; }, strands: new Set(), rect: (el) => { const b = el.getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; },
      strandFor(knotCanvas) { const s = knotCanvas._knot && knotCanvas._knot.strand; if (s) this.strands.add(s); return s || null; } };
    const rewindAll = () => ctx.strands.forEach((s) => s.getState() !== "idle" && s.rewind());
    let prod = "companion", i = 0, timer = 0, run = 0, paused = false, visible = false, ticking = false;
    function build() {
      rewindAll(); const G = GUIDES[prod];
      list.innerHTML = G.map((s, k) => `<li><button type="button" style="--dur:${s.dur}s"><span class="n">${k + 1}</span><span><span class="ttl">${s.t}</span><span class="d">${s.d}</span></span><i></i></button></li>`).join("");
      screen.innerHTML = G.map((s) => `<div class="scene" data-s="${s.scene}">${sceneHTML(s.scene)}</div>`).join("");
      [...list.querySelectorAll("button")].forEach((b, k) => b.addEventListener("click", () => go(k, true)));
      go(0);
    }
    function go(k, user) {
      const G = GUIDES[prod]; i = k; const tok = ++run; rewindAll();
      [...list.querySelectorAll("button")].forEach((b, j) => { b.classList.toggle("on", j === i); b.setAttribute("aria-current", j === i ? "step" : "false"); const bar = b.querySelector("i"); bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; });
      const scenes = [...screen.querySelectorAll(".scene")]; scenes.forEach((s, j) => s.classList.toggle("on", j === i));
      const el = scenes[i], name = G[i].scene;
      if (!KEEP[name]) el.innerHTML = sceneHTML(name);
      const w = async (ms) => { await sleep(ms); if (tok !== run) throw 0; };
      if (visible && PLAY[name]) PLAY[name](el, w, ctx).catch(() => {});
      clearTimeout(timer); if (!reduce && !paused) timer = setTimeout(() => visible && go((i + 1) % G.length), (user ? G[i].dur * 1.6 : G[i].dur) * 1000);
    }
    fa.addEventListener("mouseenter", () => { paused = true; list.classList.add("paused"); clearTimeout(timer); });
    fa.addEventListener("mouseleave", () => { paused = false; list.classList.remove("paused"); if (!reduce) timer = setTimeout(() => go((i + 1) % GUIDES[prod].length), GUIDES[prod][i].dur * 1000); });
    new IntersectionObserver((es) => { const was = visible; visible = es[0].isIntersecting; if (visible && !was && !paused) go(i); if (!visible) { clearTimeout(timer); rewindAll(); } }, { threshold: 0.35 }).observe(screen);
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    ProdTabs(root, (p) => { prod = p; build(); });
    build();
  }
  window.NusGuide = { mount, KEYS, GUIDES, ProdTabs, ext, APPLE };
})();
