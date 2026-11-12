/* Two ways in, option A "The fork" (picked 2026-09-30). A small NŪS orb splits its strands into two
   equal product cards: NŪS Companion (a live desk with the real Knot) and NŪS for Students (the real app
   screens in a Mac-style window). Shared by index.html and twoways.html.
   Usage: NusWays.mountFork(el)  where el holds .gap and two article.card with .media and .copy */
(function () {
  // Optional host-driven entry. Existing option pages retain their original entry.
  const entryProgress = new WeakMap();
  const reduce =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac =
    /Mac/.test(navigator.platform || navigator.userAgent) &&
    !/iPhone|iPad/.test(navigator.userAgent);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const REL = "https://github.com/cvfoliox-dev/clipotxt-releases";
  const L = {
    installer: `${REL}/releases/download/v1.0.3/ClipoTxt-Setup-v1.0.3.exe`,
    portable: `${REL}/releases/download/v1.0.3/ClipoTxt-v1.0.3-windows-x64-portable.zip`,
  };

  // "It did not install", then one question: what did you see. Each answer shows its fix right away.
  const SAW = [
    [
      "launch",
      "Installer did not start",
      "Ensure you are running 64-bit Windows 10 or 11, or try the Portable ZIP zero-install build.",
    ],
    [
      "blocked",
      "Blocked, no Run anyway",
      "That is Smart App Control or S mode blocking unsigned utilities. Telling Bharath helps track demand for signed binaries.",
    ],
    [
      "antivirus",
      "My antivirus took it",
      "Restore it from your antivirus quarantine, or allow it, then run it again.",
    ],
    [
      "error",
      "An error message",
      "Type what it said below, so Bharath can inspect and fix it.",
    ],
    [
      "nothing",
      "Nothing happened",
      "Look for <b>ClipoTxt</b> in the Start menu or system tray. Not there? Download again, the file may have stopped partway.",
    ],
    ["other", "Something else", "Type what you saw below."],
  ];

  const APPLE =
    '<svg class="os" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.37 12.64c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.29-3.52zM14.2 6.18c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.22z"/></svg>';

  /* ---------- the two products (shipped facts only) ---------- */
  function companionCopy() {
    return `<h3 class="serif">Clipboard Engine</h3>
      <p class="one">Convert any screenshot into usable text right in the background. Automatically detects newly copied captures, extracts their visible content on your CPU, and puts the result straight on your clipboard.</p>
      <ul>
        <li><span><b>Win + Shift + S to capture.</b> <span class="d">Automatic clipboard detection with zero CPU polling.</span></span></li>
        <li><span><b>Local OCR Engine.</b> <span class="d">Runs locally across multiple CPU cores for fast, sub-second text extraction.</span></span></li>
        <li><span><b>Smart Format Mode.</b> <span class="d">Preserves readable layout across paragraphs, headings, lists, tables, and code.</span></span></li>
        <li><span><b>Auto-replacement guard.</b> <span class="d">Replaces the clipboard screenshot with clean extracted text; sequence ID prevents overwriting newer copies.</span></span></li>
        <li><span><b>System Tray & Hotkeys.</b> <span class="d">Ctrl + Alt + O global toggle, non-intrusive notification toast, 0% idle CPU.</span></span></li>
      </ul>
      <div class="bottom">
        <div class="chips"><span class="chip hi">100% Free</span><span class="chip">Windows 10 & 11 (64-bit)</span><span class="chip">100% Offline / No Keys</span></div>
        <div class="acts"><a class="btn solid" href="${L.installer}" data-didit-dl>Download Installer (v1.0.3)</a><a class="link" href="#setup" data-guide="companion">Setup guide</a></div>
        <details class="didit" data-didit>
          <summary>Did it install?</summary>
          <div class="didit-body">
            <p>ClipoTxt installs directly in seconds and opens straight into your system tray and workspace.</p>
            <p class="didit-h">Troubleshooting</p>
            <ul class="didit-fixes">
              <li><b>Right file?</b> It is <b>ClipoTxt-Setup-v1.0.3.exe</b>, about 206 MB (includes the standalone local OCR engine). You can also use the Portable ZIP.</li>
              <li><b>Antivirus took it?</b> Restore it from your antivirus quarantine, or allow it, then run it again.</li>
              <li><b>Nothing happened?</b> It installs in a few seconds. Look for <b>ClipoTxt</b> in the Start menu or system tray.</li>
              <li>It needs Windows 10 or 11, 64-bit.</li>
            </ul>
            <button type="button" class="didit-no" data-goatcounter-click="companion-did-not-install">Need help installing?</button>
            <div class="didit-ask" hidden>
              <p class="didit-h">What did you see?</p>
              <div class="didit-saw" role="group" aria-label="What did you see?">${SAW.map((s) => `<button type="button" data-saw="${s[0]}" aria-pressed="false">${s[1]}</button>`).join("")}</div>
              <p class="didit-tip" aria-live="polite" hidden></p>
              <label class="didit-say"><span>What did it say? (optional)</span><input type="text" maxlength="300" autocomplete="off"></label>
              <button type="button" class="didit-send">Tell Bharath</button>
            </div>
            <p class="didit-note" aria-live="polite" hidden></p>
          </div>
        </details>
        <div class="small">Version 1.0.3 for Windows 10 and 11 (64-bit). No accounts, no subscriptions.</div>
      </div>`;
  }
  function studentsCopy() {
    return `<h3 class="serif">Desktop Workspace</h3>
      <p class="one">A dedicated desktop interface to search your unlimited capture history, copy or export past screenshot conversions, and benchmark your CPU.</p>
      <ul>
        <li><span><b>Home & Live Monitoring.</b> <span class="d">Real-time clipboard status, instant preview, one-click pause/resume.</span></span></li>
        <li><span><b>SQLite WAL History.</b> <span class="d">Unlimited local capture archive, instant search, combined .md Markdown export.</span></span></li>
        <li><span><b>Hardware Benchmarks.</b> <span class="d">Built-in CPU speed benchmark and local image OCR latency test.</span></span></li>
      </ul>
      <div class="bottom">
        <div class="chips"><span class="chip hi">Local SQLite</span><span class="chip hi">Export .md</span><span class="chip hi">Hardware Benchmarks</span></div>
        <div class="acts"><a class="btn solid" href="${L.installer}">Download Installer (v1.0.3)</a><a class="btn ghost" href="${L.portable}">Portable ZIP</a><a class="link" href="#setup" data-guide="students">Setup guide</a></div>
        <div class="small">All history and settings stay 100% on your PC in %LOCALAPPDATA%\\ClipoTxt.</div>
      </div>`;
  }
  const VIEWS = [
    ["Home", "Live Status", "assets/app-today.webp"],
    ["History", "Markdown Export", "assets/app-review.webp"],
    ["About", "Benchmarks", "assets/app-map.webp"],
  ];
  const SCENES = [
    ["Snip", "Win+Shift+S", 5.6],
    ["OCR", "Local OCR", 6.4],
    ["Paste", "Ctrl + V", 5.4],
    ["History", "SQLite .md", 6.2],
    ["Toggle", "Ctrl+Alt+O", 10.4],
  ];
  const tabRow = (items, label, cls) =>
    `<div class="tabs ${cls}" role="tablist" aria-label="${label}">${items.map((t, i) => `<button type="button" role="tab" aria-selected="${!i}" class="${i ? "" : "on"}">${t[0]}<small>${t[1]}</small><i></i></button>`).join("")}</div>`;
  function studentsMedia() {
    return `<div class="appwin"><div class="shots">${VIEWS.map((t, i) => `<img src="${t[2]}" alt="ClipoTxt Workspace, ${t[0]} view" class="${i ? "" : "on"}" loading="lazy">`).join("")}</div></div>
      ${tabRow(VIEWS, "ClipoTxt workspace views", "")}`;
  }
  function companionMedia() {
    return `<div class="desk" aria-label="ClipoTxt Clipboard Engine on desktop">
      <!-- Tab 1: Snip (Win + Shift + S) -->
      <div class="cdesk-scene s-snip on">
        <div class="gl cdesk-pill"><span class="dot"></span><span>Win + Shift + S • Region Captured</span></div>
        <div class="term-window">
          <div class="term-bar"><span class="t-dot red"></span><span class="t-dot yellow"></span><span class="t-dot green"></span><span class="t-title">Terminal — node server.js</span></div>
          <div class="term-body">
            <div class="term-line prompt">$ node dist/server.js</div>
            <div class="term-line err-block">
              <div class="err-text">[Error: ECONNREFUSED 127.0.0.1:5432]</div>
              <div class="err-sub">Failed to connect to local PostgreSQL instance</div>
              <div class="err-sub">at Connection.connect (/app/db/client.ts:42:15)</div>
            </div>
            <div class="term-line dim">Waiting for retry (attempt 3/5)...</div>
          </div>
          <div class="snip-overlay">
            <div class="snip-box">
              <span class="snip-dim">480 × 96 px</span>
            </div>
            <div class="snip-crosshair"></div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Local OCR -->
      <div class="cdesk-scene s-ocr">
        <div class="gl cdesk-pill"><span class="pulse-dot"></span><span>Local OCR Engine • 0.68s on CPU</span></div>
        <div class="ocr-card">
          <div class="ocr-bar"><span class="ocr-tag">LOCAL OCR</span><span class="ocr-info">4 threads • CPU Local</span></div>
          <div class="ocr-preview">
            <div class="ocr-laser"></div>
            <div class="ocr-line-box b1"><span>[Error: ECONNREFUSED 127.0.0.1:5432]</span><span class="conf">0.99</span></div>
            <div class="ocr-line-box b2"><span>Failed to connect to local PostgreSQL instance</span><span class="conf">0.98</span></div>
            <div class="ocr-line-box b3"><span>at Connection.connect (/app/db/client.ts:42:15)</span><span class="conf">0.99</span></div>
          </div>
          <div class="ocr-status-foot"><span class="ok-icon">✓</span> Text extracted in 680ms • 0 cloud calls</div>
        </div>
      </div>

      <!-- Tab 3: Paste (Ctrl + V) -->
      <div class="cdesk-scene s-paste">
        <div class="gl cdesk-badge"><kbd>Ctrl</kbd><kbd>V</kbd><span>Paste Anywhere</span></div>
        <div class="paste-window">
          <div class="paste-bar"><span class="p-dot"></span><span class="p-title">Destination App — Paste Context</span></div>
            <div class="paste-body">
            <div class="paste-prompt">Reviewing this captured content:</div>
            <div class="paste-code">
              <div class="code-header"><span>Usable Extracted Text (Smart Format)</span><span class="copy-tag">Pasted via Ctrl+V</span></div>
              <pre class="code-pre"><code><span class="c-h">### Extracted Screenshot Text</span>
<span class="c-k">&#x60;&#x60;&#x60;text</span>
<span class="c-err">[Error: ECONNREFUSED 127.0.0.1:5432]</span>
Failed to connect to local PostgreSQL instance
at Connection.connect (/app/db/client.ts:42:15)
<span class="c-k">&#x60;&#x60;&#x60;</span></code></pre>
            </div>
          </div>
          <div class="paste-foot"><span class="dot-green"></span> Clipboard updated with usable extracted text in 0.68s</div>
        </div>
      </div>

      <!-- Tab 4: History (SQLite .md) -->
      <div class="cdesk-scene s-hist">
        <div class="gl cdesk-badge"><span class="dot-green"></span><span>100% Local SQLite History</span></div>
        <div class="hist-card">
          <div class="hist-bar">
            <div class="hist-search"><span>🔍</span><span>Search captures...</span></div>
            <button type="button" class="hist-export-btn"><span>📥 Export all (.md)</span></button>
          </div>
          <div class="hist-list">
            <div class="hist-item hi">
              <div class="hi-time">Just now • 187 chars</div>
              <div class="hi-txt">[Error: ECONNREFUSED 127.0.0.1:5432] Failed to connect...</div>
            </div>
            <div class="hist-item">
              <div class="hi-time">10:14 AM • Table • 420 chars</div>
              <div class="hi-txt">| Item | Value | Processing | Status |</div>
            </div>
            <div class="hist-item">
              <div class="hi-time">Yesterday • Notes • 312 chars</div>
              <div class="hi-txt">Turn any screenshot into clean, usable text with Ctrl + V</div>
            </div>
          </div>
          <div class="hist-toast"><span class="ok-chk">✓</span> Saved locally in SQLite WAL mode (%LOCALAPPDATA%\\ClipoTxt)</div>
        </div>
      </div>

      <!-- Tab 5: Toggle (Ctrl+Alt+O) -->
      <div class="cdesk-scene s-tray">
        <div class="gl cdesk-badge"><kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>O</kbd><span>Global Hotkey Toggle</span></div>
        <div class="tray-stage">
          <div class="tray-toast">
            <div class="tt-header">
              <img src="assets/app_icon.png" width="16" height="16" alt="ClipoTxt" class="tt-icon">
              <span class="tt-app">ClipoTxt</span>
              <span class="tt-time">Just now</span>
            </div>
            <div class="tt-title">Monitoring Active</div>
            <div class="tt-desc">Press <kbd>Ctrl+Alt+O</kbd> to pause or resume background screenshot OCR.</div>
            <div class="tt-state-pill"><span class="tt-dot"></span><span>Clipboard Interception: ON</span></div>
          </div>
          <div class="taskbar-mock">
            <div class="tb-icons">
              <span class="tb-ic win"></span><span class="tb-ic"></span><span class="tb-ic"></span>
            </div>
            <div class="tb-tray">
              <span class="tray-clipotxt" title="ClipoTxt Active"><img src="assets/app_icon.png" width="14" height="14" alt="ClipoTxt"></span>
              <span class="tb-clock">10:42 PM</span>
            </div>
          </div>
        </div>
      </div>
      <div class="dknot" style="display:none" aria-hidden="true"><canvas></canvas></div>
    </div>
    ${tabRow(SCENES, "What the Clipboard Engine does", "cool")}`;
  }

  /* ---------- behaviours ---------- */
  function restartBar(b) {
    const i = b.querySelector("i");
    i.style.animation = "none";
    void i.offsetWidth;
    i.style.animation = "";
  }
  function mountTabs(root) {
    const btns = [...root.querySelectorAll(".tabs button")],
      imgs = [...root.querySelectorAll(".shots img")],
      bar = root.querySelector(".tabs");
    let i = 0,
      timer = 0,
      paused = false;
    const DUR = 4500;
    function go(n, user) {
      i = (n + btns.length) % btns.length;
      btns.forEach((b, k) => {
        b.classList.toggle("on", k === i);
        b.setAttribute("aria-selected", k === i);
      });
      restartBar(btns[i]);
      imgs.forEach((im, k) => im.classList.toggle("on", k === i));
      clearTimeout(timer);
      if (!reduce && !paused)
        timer = setTimeout(() => go(i + 1), user ? DUR * 2 : DUR);
    }
    btns.forEach((b, k) => b.addEventListener("click", () => go(k, true)));
    root.addEventListener("mouseenter", () => {
      paused = true;
      bar.classList.add("paused");
      clearTimeout(timer);
    });
    root.addEventListener("mouseleave", () => {
      paused = false;
      bar.classList.remove("paused");
      if (!reduce) timer = setTimeout(() => go(i + 1), DUR / 2);
    });
    go(0);
  }
  function mountDesk(root) {
    const desk = root.querySelector(".desk");
    const sceneEls = [...desk.querySelectorAll(".cdesk-scene")];
    const btns = [...root.querySelectorAll(".tabs button")];
    let visible = false,
      run = 0;
    new IntersectionObserver((es) => (visible = es[0].isIntersecting), {
      threshold: 0.3,
    }).observe(desk);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    function tab(k) {
      btns.forEach((b, j) => {
        b.classList.toggle("on", j === k);
        b.setAttribute("aria-selected", j === k);
      });
      btns[k].style.setProperty("--dur", SCENES[k][2] + "s");
      restartBar(btns[k]);
      sceneEls.forEach((el, j) => el.classList.toggle("on", j === k));
    }
    const scenes = [
      // Tab 1: Snip (Win + Shift + S)
      async (w) => {
        const sc = sceneEls[0];
        const snipBox = sc.querySelector(".snip-box");
        const crosshair = sc.querySelector(".snip-crosshair");
        if (snipBox) {
          snipBox.style.opacity = "0";
          snipBox.style.transform = "scale(0.95)";
        }
        if (crosshair) {
          crosshair.style.opacity = "0";
        }
        await w(400);
        if (crosshair) {
          crosshair.style.opacity = "1";
          crosshair.style.transform = "translate(10px, 8px)";
        }
        await w(600);
        if (snipBox) {
          snipBox.style.opacity = "1";
          snipBox.style.transform = "none";
        }
        await w(3500);
      },
      // Tab 2: Local OCR
      async (w) => {
        const sc = sceneEls[1];
        const boxes = [...sc.querySelectorAll(".ocr-line-box")];
        boxes.forEach((b) => b.classList.remove("active"));
        await w(500);
        for (let idx = 0; idx < boxes.length; idx++) {
          boxes[idx].classList.add("active");
          await w(700);
        }
        await w(2500);
      },
      // Tab 3: Paste (Ctrl + V)
      async (w, type) => {
        const sc = sceneEls[2];
        const codePre = sc.querySelector(".code-pre code");
        const full = `### Extracted Screenshot Text\n\`\`\`text\n[Error: ECONNREFUSED 127.0.0.1:5432]\nFailed to connect to PostgreSQL\nat Connection.connect (/app/db/client.ts:42:15)\n\`\`\``;
        if (codePre) {
          codePre.textContent = "";
          await w(400);
          await type(codePre, full, 24);
        }
        await w(2200);
      },
      // Tab 4: History (SQLite .md)
      async (w) => {
        const sc = sceneEls[3];
        const expBtn = sc.querySelector(".hist-export-btn");
        const toast = sc.querySelector(".hist-toast");
        if (expBtn) expBtn.classList.remove("press");
        await w(1200);
        if (expBtn) expBtn.classList.add("press");
        await w(200);
        if (expBtn) expBtn.classList.remove("press");
        if (toast) toast.style.color = "var(--c-4cc88c)";
        await w(3600);
      },
      // Tab 5: Toggle (Ctrl + Alt + O)
      async (w) => {
        const sc = sceneEls[4];
        const pill = sc.querySelector(".tt-state-pill");
        const title = sc.querySelector(".tt-title");
        const dotText = pill ? pill.querySelector("span:last-child") : null;
        if (pill) pill.classList.remove("paused");
        if (title) title.textContent = "Monitoring Active";
        if (dotText) dotText.textContent = "Clipboard Interception: ON";
        await w(2800);
        // Simulate toggle to paused
        if (pill) pill.classList.add("paused");
        if (title) title.textContent = "Monitoring Paused";
        if (dotText) dotText.textContent = "Clipboard Interception: PAUSED";
        await w(3200);
        // Simulate toggle back to active
        if (pill) pill.classList.remove("paused");
        if (title) title.textContent = "Monitoring Active";
        if (dotText) dotText.textContent = "Clipboard Interception: ON";
        await w(3200);
      },
    ];
    function play(k) {
      const tok = ++run;
      const w = async (ms) => {
        await sleep(ms);
        if (tok !== run) throw 0;
      };
      const type = async (el, s, ms) => {
        for (let n = 0; n <= s.length; n++) {
          el.textContent = s.slice(0, n);
          await w(ms);
        }
      };
      (async () => {
        try {
          let i = k;
          while (true) {
            while (!visible) await w(300);
            tab(i);
            await scenes[i](w, type);
            i = (i + 1) % scenes.length;
          }
        } catch (e) {}
      })();
    }
    btns.forEach((b, k) => b.addEventListener("click", () => play(k)));
    if (reduce) {
      tab(0);
      return;
    }
    play(0);
  }

  /* ---------- the orb and its strands ---------- */
  function StrandField(host, opts) {
    const c = document.createElement("canvas");
    c.className = "strands";
    c.setAttribute("aria-hidden", "true");
    host.prepend(c);
    const pen = NusDraw(c),
      N = 720,
      g = Math.PI * (3 - Math.sqrt(5)),
      P = []; // one draw call a frame (gl2d.js)
    const tag = document.createElement("span");
    tag.className = "orbtag";
    tag.setAttribute("aria-hidden", "true");
    tag.textContent = "Clipo";
    c.after(tag);
    let tagAt = "";
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2,
        r = Math.sqrt(1 - y * y),
        t = g * i;
      P.push([Math.cos(t) * r, y, Math.sin(t) * r]);
    }
    const S = [];
    for (let i = 0; i < opts.per * 2; i++)
      S.push({
        side: i % 2,
        s: Math.random(),
        sp: (Math.random() - 0.5) * 2,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
      });
    let W = 1,
      H = 1,
      dpr = 1,
      angle = 0,
      grow = reduce ? 1 : 0,
      lean = 0,
      visible = false,
      last = performance.now();
    const ptr = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0 },
      w = [1, 1];
    // the canvas stops where the strands end (opts.bottom), so it never sits under the blurred cards
    function size() {
      const r = host.getBoundingClientRect();
      W = r.width;
      H = opts.bottom
        ? Math.min(r.height, Math.max(1, opts.bottom()))
        : r.height;
      dpr = Math.min(1.5, devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
      c.style.height = H + "px";
    }
    size();
    new ResizeObserver(size).observe(host);
    new IntersectionObserver((es) => (visible = es[0].isIntersecting), {
      threshold: 0,
    }).observe(c); // the canvas itself, which stops where the strands end
    addEventListener(
      "pointermove",
      (e) => {
        if (!visible || document.hidden) return;
        const r = c.getBoundingClientRect(),
          x = e.clientX - r.left,
          y = e.clientY - r.top,
          now = performance.now(),
          dt = Math.max(1, now - ptr.t) / 1000;
        ptr.vx = ptr.vx * 0.5 + ((x - ptr.x) / dt) * 0.5;
        ptr.vy = ptr.vy * 0.5 + ((y - ptr.y) / dt) * 0.5;
        ptr.x = x;
        ptr.y = y;
        ptr.t = now;
      },
      { passive: true },
    );
    const bez = (a, b, c2, d, t) => {
      const u = 1 - t;
      return (
        u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c2 + t * t * t * d
      );
    };
    const COL = [
      [176, 190, 255],
      [232, 204, 150],
    ];
    NusMotion.loop(c, (now, dt) => {
      if (!visible || document.hidden) return;
      last = now;
      const st = opts.state();
      if (st.scrub) grow = reduce ? 1 : clamp(st.grow);
      else grow += ((reduce ? 1 : st.grow) - grow) * Math.min(1, dt * 2.2);
      lean +=
        ((st.focus === 0 ? -1 : st.focus === 1 ? 1 : 0) - lean) *
        Math.min(1, dt * 4);
      for (let k = 0; k < 2; k++) {
        const want = !st.targets[k]
          ? 0
          : st.focus < 0
            ? 1
            : st.focus === k
              ? 1.9
              : 0.35;
        w[k] += (want - w[k]) * Math.min(1, dt * 5);
      }
      if (!reduce) angle += dt * 0.12;
      pen.begin(W, H, dpr);
      const O = st.orb,
        ox = O.x + lean * 12,
        oy = O.y,
        R = O.r,
        K = 14,
        damp = Math.exp(-5 * dt),
        rad = 120;
      for (const s of S) {
        const T = st.targets[s.side];
        if (!T || w[s.side] < 0.02) continue;
        const dir = s.side ? 1 : -1,
          a0 = Math.PI / 2 - dir * (0.35 + 0.5 * ((s.sp + 1) / 2));
        const x0 = ox + Math.cos(a0) * R * 0.96,
          y0 = oy + Math.sin(a0) * R * 0.96,
          x3 = T.x + s.sp * T.w * 0.42,
          y3 = T.y;
        let x1 = x0 + dir * 30 + s.sp * 18,
          y1 = y0 + (y3 - y0) * 0.45,
          x2 = x3 - s.sp * 30,
          y2 = y3 - (y3 - y0) * 0.5;
        // the cursor parts the strands like hair, then they spring back
        const mx = bez(x0, x1, x2, x3, 0.5),
          my = bez(y0, y1, y2, y3, 0.5),
          dx = mx + s.ox - ptr.x,
          dy = my + s.oy - ptr.y,
          d2 = dx * dx + dy * dy;
        if (d2 < rad * rad && d2 > 1) {
          const d = Math.sqrt(d2),
            f = (1 - d / rad) ** 2;
          s.vx += (dx / d) * f * 2200 * dt + ptr.vx * f * 2 * dt;
          s.vy += (dy / d) * f * 2200 * dt + ptr.vy * f * 2 * dt;
        }
        s.vx = (s.vx - K * s.ox * dt) * damp;
        s.vy = (s.vy - K * s.oy * dt) * damp;
        s.ox += s.vx * dt;
        s.oy += s.vy * dt;
        x1 += s.ox;
        y1 += s.oy;
        x2 += s.ox;
        y2 += s.oy;
        const a =
          (0.05 + 0.16 * (1 - Math.abs(s.sp) * 0.6)) *
          Math.min(1, w[s.side]) *
          (0.6 + 0.4 * Math.min(2, w[s.side]));
        const col = COL[s.side];
        pen.rgb(col[0], col[1], col[2]);
        pen.start(x0, y0, Math.min(0.7, a), 0.6);
        const steps = 26,
          end = clamp(grow * 1.15 - s.s * 0.15);
        for (let k = 1; k <= steps * end; k++) {
          const t = k / steps;
          pen.to(bez(x0, x1, x2, x3, t), bez(y0, y1, y2, y3, t));
        }
        pen.stroke();
        if (!reduce && grow > 0.98 && s.s < (w[s.side] > 1.2 ? 0.16 : 0.05)) {
          const t = ((now / 1000) * 0.28 + s.s * 7) % 1,
            bx = bez(x0, x1, x2, x3, t),
            by = bez(y0, y1, y2, y3, t),
            gl = Math.sin(Math.PI * t);
          pen.rgb(255, 248, 235);
          pen.glow(bx, by, 0, 6, 0.85 * gl);
        }
      }
      pen.rgb(120, 140, 220);
      pen.glow(ox, oy, R * 0.1, R * 1.6, 0.12);
      pen.rgb(238, 240, 250);
      const ca = Math.cos(angle),
        sa = Math.sin(angle),
        ct = Math.cos(0.32),
        stt = Math.sin(0.32);
      for (const p of P) {
        const x1 = p[0] * ca + p[2] * sa,
          z1 = -p[0] * sa + p[2] * ca,
          y2 = p[1] * ct - z1 * stt,
          z2 = p[1] * stt + z1 * ct,
          d = (z2 + 1) / 2,
          r = 0.5 + d * 1.1;
        pen.rect(
          ox + x1 * R - r / 2,
          oy + y2 * R - r / 2,
          r,
          r,
          0.14 + 0.8 * d * d,
        );
      }
      pen.end();
      // the label over the orb is a page element now; it only moves when the orb leans
      const at = `translate(${Math.round(ox * 2) / 2}px,${Math.round((oy - R - 22) * 2) / 2}px) translateX(-50%)`;
      if (at !== tagAt) tag.style.transform = tagAt = at;
    });
  }
  /* "Did it install?" under the Companion download (feedback collector 4). It opens by itself a moment
     after the download click. "It did not install" asks one question (what did you see?), shows that
     answer's fix, and "Tell Bharath" sends one note to the same intake feedback.html uses. The note keeps
     the old fixed first sentence so the brief still groups it; while that endpoint is not deployed (or
     cannot be reached) it opens the GitHub issues page. */
  const FEEDBACK_API =
    "https://xnpkplcjurzwanotmwwt.supabase.co/functions/v1/submit-feedback";
  const FEEDBACK_KEY = "sb_publishable_yBEA9loOsDI9E_HMFIVCRQ_PZvTD8rB";
  const ISSUES =
    "https://github.com/cvfoliox-dev/clipotxt-releases/issues/new?title=";
  const DIDNT_NOTE =
    "ClipoTxt did not install (from the site's Did it install? box).";
  function siteId() {
    try {
      let id = localStorage.getItem("clipotxt-site-id");
      if (!id) {
        id =
          window.crypto && crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now() + "-" + Math.random().toString(16).slice(2);
        localStorage.setItem("clipotxt-site-id", id);
      }
      return id;
    } catch (e) {
      return null;
    }
  }
  function mountDidIt(card) {
    const box = card.querySelector("[data-didit]"),
      dl = card.querySelector("[data-didit-dl]");
    if (!box) return;
    if (dl)
      dl.addEventListener("click", () =>
        setTimeout(() => {
          box.open = true;
        }, 1200),
      );
    const btn = box.querySelector(".didit-no"),
      note = box.querySelector(".didit-note"),
      ask = box.querySelector(".didit-ask");
    const chips = [...ask.querySelectorAll("[data-saw]")],
      tip = ask.querySelector(".didit-tip"),
      say = ask.querySelector(".didit-say input"),
      send = ask.querySelector(".didit-send");
    let saw = null;
    btn.addEventListener("click", () => {
      btn.hidden = true;
      ask.hidden = false;
      note.hidden = true;
      chips[0].focus({ preventScroll: true });
    });
    chips.forEach((c) =>
      c.addEventListener("click", () => {
        saw = SAW.find((s) => s[0] === c.dataset.saw);
        chips.forEach((o) => o.setAttribute("aria-pressed", String(o === c)));
        tip.innerHTML = saw[2];
        tip.hidden = false;
      }),
    );
    send.addEventListener("click", () => {
      const words = say.value.trim().slice(0, 300);
      const message =
        DIDNT_NOTE +
        " Saw: " +
        (saw ? saw[1] : "not picked") +
        "." +
        (words ? " They wrote: " + words : "");
      send.disabled = true;
      note.hidden = false;
      note.textContent = "Telling Bharath...";
      const ctrl = window.AbortController ? new AbortController() : null;
      const timer = ctrl ? setTimeout(() => ctrl.abort(), 6000) : null;
      fetch(FEEDBACK_API, {
        method: "POST",
        headers: { apikey: FEEDBACK_KEY, "content-type": "application/json" },
        body: JSON.stringify({
          source: "site",
          kind: "bug",
          message,
          install_id: siteId(),
          website: "",
        }),
        signal: ctrl ? ctrl.signal : undefined,
      })
        .then((r) => {
          if (!r.ok) throw new Error("http " + r.status);
          ask.hidden = true;
          note.textContent =
            "Thanks. Bharath got your note. Only what you picked and typed was sent.";
        })
        .catch(() => {
          window.open(
            ISSUES +
              encodeURIComponent(
                "ClipoTxt did not install" + (saw ? ": " + saw[1] : ""),
              ),
            "_blank",
            "noopener",
          );
          note.textContent =
            "Opened a GitHub issue page. Say what you saw and Bharath will help.";
          send.disabled = false;
        })
        .finally(() => {
          if (timer) clearTimeout(timer);
        });
    });
  }
  /* "Mac won't open it?" under the student downloads: opens a moment after a Mac download click, and
     Copy puts the Terminal command (with its trailing space) on the clipboard. */
  function mountMacFix(card) {
    const box = card.querySelector("[data-macfix]");
    if (!box) return;
    card.querySelectorAll("[data-macfix-dl]").forEach((a) =>
      a.addEventListener("click", () =>
        setTimeout(() => {
          box.open = true;
        }, 1200),
      ),
    );
    const copy = box.querySelector(".didit-copy"),
      code = box.querySelector(".didit-cmd code");
    copy.addEventListener("click", () => {
      const done = () => {
        copy.textContent = "Copied";
        setTimeout(() => (copy.textContent = "Copy"), 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard
          .writeText(code.textContent)
          .then(done, () => getSelection().selectAllChildren(code));
      else getSelection().selectAllChildren(code);
    });
  }
  const rel = (el, host) => {
    const a = el.getBoundingClientRect(),
      h = host.getBoundingClientRect();
    return { x: a.left - h.left + a.width / 2, y: a.top - h.top, w: a.width };
  };

  function mountFork(root) {
    const cards = [...root.querySelectorAll(".card")];
    cards[0].querySelector(".media").innerHTML = companionMedia();
    cards[0].querySelector(".copy").innerHTML = companionCopy();
    mountDidIt(cards[0]);
    cards[1].querySelector(".media").innerHTML = studentsMedia();
    cards[1].querySelector(".copy").innerHTML = studentsCopy();
    mountMacFix(cards[1]);
    mountDesk(cards[0]);
    mountTabs(cards[1].querySelector(".media"));
    let focus = -1,
      seen = 0;
    // a phone cannot hover: say what a finger can do
    if (matchMedia("(hover: none)").matches) {
      const p = root.querySelector(".head p");
      if (p) p.textContent = p.textContent.replace("Hover one", "Tap one");
    }
    cards.forEach((cd, k) => {
      cd.addEventListener("mouseenter", () => (focus = k));
      cd.addEventListener("mouseleave", () => (focus = -1));
      cd.addEventListener("focusin", () => (focus = k));
      cd.addEventListener("focusout", () => (focus = -1));
    });
    new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) seen = 1;
      },
      { threshold: 0.25 },
    ).observe(root.querySelector(".pair"));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.15 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    StrandField(root, {
      per: 90,
      bottom: () => {
        const tops = cards.map((cd) => rel(cd.querySelector(".media"), root).y);
        return Math.abs(tops[0] - tops[1]) > 40
          ? rel(cards[0], root).y
          : Math.min(...tops) + 60;
      },
      /* stacked cards: the strands tuck in behind the first card */ state:
        () => ({
          orb: {
            x: root.clientWidth / 2,
            y: root.querySelector(".gap").offsetTop + 96,
            r: 58,
          },
          targets: cards.map((cd) => rel(cd.querySelector(".media"), root)),
          focus,
          grow: entryProgress.has(root) ? entryProgress.get(root) : seen,
          scrub: entryProgress.has(root),
        }),
    });
  }
  const setEntryProgress = (root, value) =>
    value == null
      ? entryProgress.delete(root)
      : entryProgress.set(root, clamp(value));
  window.NusWays = {
    mountFork,
    mountTabs,
    mountDesk,
    StrandField,
    companionCopy,
    mountDidIt,
    mountMacFix,
    studentsCopy,
    companionMedia,
    studentsMedia,
    rel,
    setEntryProgress,
  };
})();
