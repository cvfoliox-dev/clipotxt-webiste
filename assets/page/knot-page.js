/* ClipoTxt 3D Companion Chatbot.
   1. Visual component: 3D unfolding ClipoTxt logo with spring physics (createClipoCompanion).
   2. Mechanics: 100% preserved pick-up, drag-anywhere, snap-back physics, waypoints & flight paths.
   3. Intelligence: Full knowledge of the D:\clipotxt codebase, connected to Grok API via .env or /api/chat. */
(function () {
  if (!window.NusKnot3D) return;
  const $ = (s) => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac =
    /Mac/.test(navigator.platform || "") && !(navigator.maxTouchPoints > 1);
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const clampTo = (v, a, b) => Math.min(b, Math.max(a, v));
  const count = (id) => {
    try {
      if (window.goatcounter && goatcounter.count)
        goatcounter.count({
          path: "knot-" + id,
          title: "Knot: " + id,
          event: true,
        });
    } catch (e) {}
  };
  const pillEl = () => {
    const p = $(".nfb-pill");
    return p && !p.closest(".nfb-away") ? p : null;
  };

  /* ===== Drop-in component: createClipoCompanion(containerElement, options) ===== */
  function createClipoCompanion(container, opts) {
    const o = Object.assign(
      { cream: "#f1ecdf", panel: "#8cc152", panelOpacity: 0.9, tilt: 20 },
      opts,
    );
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const root = document.createElement("div");
    root.style.cssText =
      "position:relative;width:100%;height:100%;perspective:700px;cursor:grab;touch-action:none;user-select:none;pointer-events:auto";
    const glow = document.createElement("div");
    glow.style.cssText =
      "position:absolute;inset:-25%;border-radius:50%;pointer-events:none;opacity:0;background:radial-gradient(circle," +
      o.cream +
      "55 0%,transparent 65%)";
    const stage = document.createElement("div");
    stage.style.cssText =
      "position:absolute;inset:0;transform-style:preserve-3d;will-change:transform;pointer-events:none";
    root.append(glow, stage);
    container.appendChild(root);

    const S = 'stroke="' + o.cream + '" stroke-width="30"';
    const parts = {
      panel: [
        '<path d="M52 92 L388 92 L396 168 L252 408 L52 418Z" fill="' +
          o.panel +
          '" fill-opacity="' +
          o.panelOpacity +
          '" stroke="none"/>',
        "50% 50%",
      ],
      spine: ['<path d="M38 80 V428" ' + S + "/>", "50% 50%"],
      top: ['<path d="M38 80 H436" ' + S + "/>", "7% 16%"],
      bottom: ['<path d="M38 430 H287" ' + S + "/>", "7% 84%"],
      chevL: ['<path d="M64 100 L96 132" ' + S + "/>", "16% 22%"],
      chevR: ['<path d="M438 84 L376 134" ' + S + "/>", "80% 21%"],
      bar1: ['<path d="M322 204 H476" ' + S + "/>", "50% 50%"],
      bar2: ['<path d="M252 281 H412" ' + S + "/>", "50% 50%"],
      bar3: ['<path d="M190 354 H348" ' + S + "/>", "50% 50%"],
    };
    const L = {};
    for (const k in parts) {
      const d = document.createElement("div");
      d.style.cssText =
        "position:absolute;inset:0;transform-style:preserve-3d;will-change:transform;transform-origin:" +
        parts[k][1];
      d.innerHTML =
        '<svg viewBox="0 0 512 512" width="100%" height="100%" style="display:block;overflow:visible" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
        parts[k][0] +
        "</svg>";
      stage.appendChild(d);
      L[k] = d;
    }

    // ---- spring physics ----
    const sp = (k, d) => ({ x: 0, v: 0, t: 0, k, d });
    const step = (s, dt) => {
      s.v += (s.k * (s.t - s.x) - s.d * s.v) * dt;
      s.x += s.v * dt;
    };
    const H = {
      panel: sp(120, 12),
      spine: sp(150, 13),
      top: sp(170, 11),
      bottom: sp(140, 11),
      chevL: sp(190, 10),
      chevR: sp(175, 10),
      bar1: sp(185, 11),
      bar2: sp(155, 11),
      bar3: sp(130, 11),
    };
    const tx = sp(110, 13),
      ty = sp(110, 13);
    const pulse = sp(320, 11),
      glw = sp(30, 7);
    let hover = 0,
      lock = false,
      lockT = 0;

    function onMove(e) {
      const r = root.getBoundingClientRect();
      const nx = Math.max(
        -1,
        Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2)),
      );
      const ny = Math.max(
        -1,
        Math.min(1, (e.clientY - r.top - r.height / 2) / (r.height / 2)),
      );
      tx.t = nx * o.tilt;
      ty.t = -ny * o.tilt;
      hover = 1;
    }
    function onLeave() {
      hover = 0;
      tx.t = 0;
      ty.t = 0;
    }
    function onClick() {
      pulse.x = -0.14;
      pulse.v = 0;
      glw.x = 1;
      glw.v = 0;
      lock = true;
      clearTimeout(lockT);
      lockT = setTimeout(() => {
        lock = false;
      }, 240);
    }
    root.addEventListener("pointerenter", onMove);
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick);

    let raf,
      last = performance.now();
    function frame(now) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const target = hover && !lock ? 1 : 0;
      for (let i = 0; i < 2; i++) {
        const h = dt / 2;
        for (const k in H) {
          H[k].t = target;
          step(H[k], h);
        }
        step(tx, h);
        step(ty, h);
        step(pulse, h);
        step(glw, h);
      }
      const t = now / 1000,
        a = reduceMotion ? 0.3 : 1;
      const fy = Math.sin(t * 1.6) * 3 * a,
        fr = Math.sin(t * 1.1) * 1.6 * a,
        fs = 1 + Math.sin(t * 1.9) * 0.012 * a;
      stage.style.transform =
        "translateY(" +
        fy +
        "px) rotateX(" +
        ty.x +
        "deg) rotateY(" +
        tx.x +
        "deg) rotateZ(" +
        fr +
        "deg) scale(" +
        (fs + pulse.x) +
        ")";
      glow.style.opacity = Math.max(0, Math.min(1, glw.x + hover * 0.12));

      const p = (k) => H[k].x;
      L.panel.style.transform =
        "translateZ(" +
        -70 * p("panel") +
        "px) scale(" +
        (1 + 0.04 * p("panel")) +
        ")";
      L.spine.style.transform =
        "translateZ(" +
        12 * p("spine") +
        "px) rotateY(" +
        10 * p("spine") +
        "deg)";
      L.top.style.transform =
        "translateZ(" +
        40 * p("top") +
        "px) rotateZ(" +
        -12 * p("top") +
        "deg) rotateY(" +
        -35 * p("top") +
        "deg)";
      L.bottom.style.transform =
        "translateZ(" +
        25 * p("bottom") +
        "px) rotateZ(" +
        10 * p("bottom") +
        "deg) rotateY(" +
        -30 * p("bottom") +
        "deg)";
      L.chevL.style.transform =
        "translateZ(" +
        60 * p("chevL") +
        "px) rotateY(" +
        -110 * p("chevL") +
        "deg)";
      L.chevR.style.transform =
        "translateZ(" +
        60 * p("chevR") +
        "px) rotateY(" +
        110 * p("chevR") +
        "deg)";
      ["bar1", "bar2", "bar3"].forEach((k, i) => {
        L[k].style.transform =
          "translateX(" +
          p(k) * (26 + i * 14) +
          "px) translateZ(" +
          p(k) * (40 + i * 30) +
          "px) rotateY(" +
          -8 * p(k) +
          "deg)";
      });
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      root,
      destroy() {
        cancelAnimationFrame(raf);
        clearTimeout(lockT);
        root.removeEventListener("pointerenter", onMove);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
        root.removeEventListener("click", onClick);
        root.remove();
      },
    };
  }
  window.createClipoCompanion = createClipoCompanion;

  /* Comprehensive ClipoTxt Local Knowledge Base */
  function getLocalClipoAnswer(text) {
    const q = text.toLowerCase().trim();

    // 1. Greetings & Pleasantries
    if (
      /^(hi|hello|hey|yo|sup|good (morning|afternoon|evening)|howdy)\b/.test(q)
    ) {
      return (
        "Hello! I am the **ClipoTxt Companion**.\n\n" +
        "I can answer any question about ClipoTxt—hotkeys, local RapidOCR PP-OCRv4 CPU inference, Smart Format Mode, SQLite history, or 100% offline privacy.\n\n" +
        "Try asking: *What shortcut captures text?* or *Where can I download the installer?*"
      );
    }
    if (/^(thanks|thank you|cool|awesome|great|nice|perfect)\b/.test(q)) {
      return "You're very welcome! Let me know if you need any other help with ClipoTxt.";
    }

    // 2. Who made it / Founder / Author / Bharath Thommandru / Contact
    if (
      anyMatch(q, [
        "bharath",
        "thommandru",
        "founder",
        "author",
        "creator",
        "who made",
        "who created",
        "who built",
        "contact",
        "email",
        "feedback",
        "support",
      ])
    ) {
      return (
        "### Created by Bharath Thommandru\n\n" +
        "**ClipoTxt** was created and engineered by **Bharath Thommandru**.\n\n" +
        "- **Direct Email:** [bharathtommandru1@gmail.com](mailto:bharathtommandru1@gmail.com)\n" +
        "- **Releases & Issues:** [github.com/cvfoliox-dev/clipotxt-releases](https://github.com/cvfoliox-dev/clipotxt-releases)\n\n" +
        "Bharath reads every feedback note and prioritizes community feature requests directly in new releases."
      );
    }

    // 3. Pricing / Cost / Free / Subscription / Commercial Use
    if (
      anyMatch(q, [
        "cost",
        "price",
        "pricing",
        "free",
        "pay",
        "buy",
        "subscription",
        "license",
        "commercial",
        "trial",
        "tier",
      ])
    ) {
      return (
        "### 100% Free Forever\n\n" +
        "- **Zero Subscriptions:** ClipoTxt is completely free for both personal and commercial use.\n" +
        "- **No Credit Cards or Accounts:** No sign-up, no login, no paywalls.\n" +
        "- **No Cloud API Bills:** All neural OCR weights run 100% locally on your CPU.\n\n" +
        "👉 [Download ClipoTxt v1.0.3 Installer](#ways)"
      );
    }

    // 4. Hotkeys / Shortcuts / Pause / Resume / Toggle
    if (
      anyMatch(q, [
        "shortcut",
        "hotkey",
        "keys",
        "pause",
        "resume",
        "toggle",
        "ctrl+alt+o",
        "win+shift+s",
        "ctrl+v",
        "how to pause",
        "stop monitoring",
      ])
    ) {
      return (
        "### ClipoTxt Hotkeys & Shortcuts:\n\n" +
        "- <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> — **Snip Anything:** Standard Windows capture. ClipoTxt automatically intercepts the copied image with 0% idle CPU polling.\n" +
        "- <kbd>Ctrl</kbd> + <kbd>V</kbd> — **Instant Paste:** Paste clean extracted text or reconstructed Markdown tables directly into your editor or notes.\n" +
        "- <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>O</kbd> — **Global Toggle:** Pause or resume clipboard monitoring on the fly anywhere in Windows without opening the app!"
      );
    }

    // 5. Smart Format Mode (reconstructed tables, markdown, code blocks, layout)
    if (
      anyMatch(q, [
        "smart format",
        "format mode",
        "format",
        "markdown",
        "table",
        "code block",
        "layout",
        "xy-cut",
        "reading order",
        "indent",
        "fences",
      ])
    ) {
      return (
        "### Smart Format Mode\n\n" +
        "ClipoTxt includes a deterministic layout reconstruction engine:\n\n" +
        "- **Recursive XY-Cut:** Decomposes columns, headings, and gutters to restore true reading order.\n" +
        "- **Table Reconstruction:** Aligns columnar text and renders formatted GitHub-flavored Markdown tables (`| Col1 | Col2 |`).\n" +
        "- **Fenced Code Blocks:** Automatically detects syntax indentation and wraps code inside fences (` ```python `, ` ```ts `).\n" +
        "- **Theme & Color Detection:** Analyzes light/dark UI themes and extracts dominant color palettes via K-Means (K=4)."
      );
    }

    // 6. Local OCR Engine / RapidOCR / PP-OCRv4 / Speed / Latency / CPU / ONNX
    if (
      anyMatch(q, [
        "ocr",
        "rapidocr",
        "pp-ocr",
        "onnx",
        "engine",
        "speed",
        "latency",
        "threads",
        "accuracy",
        "cpu",
        "gpu",
        "simd",
        "performance",
      ])
    ) {
      return (
        "### RapidOCR PP-OCRv4 CPU Engine\n\n" +
        "- **Local Neural Weights:** Uses PaddleOCR PP-OCRv4 optimized models bundled (~15 MB) inside the app.\n" +
        "- **CPU ONNX Runtime:** Runs across 4 intra-op CPU threads with AVX2 SIMD acceleration.\n" +
        "- **Sub-Second Latency:** Median warm execution is **~600–800 ms**.\n" +
        "- **Zero GPU Required:** Runs smoothly on any standard Intel or AMD 64-bit desktop/laptop processor.\n" +
        "- **Zero Cloud OCR Calls:** Never sends bitmaps over the internet."
      );
    }

    // 7. Privacy / Offline / Security / Telemetry / Cloud
    if (
      anyMatch(q, [
        "privacy",
        "offline",
        "data",
        "telemetry",
        "cloud",
        "security",
        "safe",
        "server",
        "upload",
        "track",
        "analytics",
      ])
    ) {
      return (
        "### 100% Local & Completely Private\n\n" +
        "- **0 Telemetry:** ClipoTxt contains zero analytics trackers, telemetry pings, or background logging.\n" +
        "- **0 Cloud Uploads:** Your screenshots and clipboard contents never leave your machine.\n" +
        "- **Local SQLite Storage:** All extraction records are stored strictly in `%LOCALAPPDATA%\\ClipoTxt\\history.db`.\n" +
        "- **Complete Air-Gap:** Fully functional even when your computer is disconnected from the internet."
      );
    }

    // 8. Download / Install / Setup / Portable / Windows Versions / v1.0.3
    if (
      anyMatch(q, [
        "download",
        "install",
        "portable",
        "setup",
        "exe",
        "zip",
        "version",
        "update",
        "get",
        "link",
        "installer",
        "smartscreen",
      ])
    ) {
      return (
        "### Download ClipoTxt v1.0.3:\n\n" +
        "- **Standard Installer:** `ClipoTxt-Setup-v1.0.3.exe` (~206 MB)\n" +
        "  *Full Windows setup with Start Menu shortcuts and automatic updates.*\n" +
        "- **Portable ZIP:** `ClipoTxt-v1.0.3-windows-x64-portable.zip` (~305 MB)\n" +
        "  *Zero-install standalone executable; run directly from any folder or USB.*\n" +
        "- **Releases Repo:** [github.com/cvfoliox-dev/clipotxt-releases](https://github.com/cvfoliox-dev/clipotxt-releases)\n\n" +
        "👉 [Jump to Downloads](#ways)"
      );
    }

    // 9. History / SQLite / Export / Database / Search
    if (
      anyMatch(q, [
        "history",
        "sqlite",
        "wal",
        "export",
        "saved",
        "archive",
        "database",
        "search history",
        "delete history",
        "clear history",
      ])
    ) {
      return (
        "### SQLite WAL History & Export\n\n" +
        "- **Local Persistence:** Extractions are logged in an SQLite Write-Ahead Logging database (`history.db`).\n" +
        "- **Full-Text Search:** Instant live filtering across all your past OCR captures.\n" +
        "- **One-Click Export:** Click **Export all (.md)** on the History tab to save all your extractions into a single UTF-8 Markdown file.\n" +
        "- **Privacy Controls:** Clear your history or reset settings anytime in Settings."
      );
    }

    // 10. System Tray / Background Operation / Loop Guard / How it Works
    if (
      anyMatch(q, [
        "tray",
        "background",
        "loop",
        "overwrite",
        "debounce",
        "sequence",
        "how it works",
        "overview",
        "what is clipotxt",
        "explain",
      ])
    ) {
      return (
        "### How ClipoTxt Works:\n\n" +
        "1. **Direct Win32 Listener:** Listens directly to Windows clipboard events with 0% idle CPU polling.\n" +
        "2. **Capture & Debounce:** When you press <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>, ClipoTxt grabs the image, hashes it with MD5 to prevent infinite clipboard loops, and verifies a sequence ID guard.\n" +
        "3. **Local OCR & Formatting:** RapidOCR extracts text on CPU (~600–800ms) and reconstructs layout with Smart Format Mode.\n" +
        "4. **Direct Paste:** Automatically replaces the clipboard so <kbd>Ctrl</kbd> + <kbd>V</kbd> pastes clean formatted text immediately!"
      );
    }

    // 11. System Requirements / Mac / Linux / Hardware
    if (
      anyMatch(q, [
        "mac",
        "macbook",
        "macos",
        "linux",
        "requirements",
        "specs",
        "windows 10",
        "windows 11",
        "system requirements",
        "ram",
        "hardware",
      ])
    ) {
      return (
        "### System Requirements:\n\n" +
        "- **OS:** Windows 10 or Windows 11 (64-bit x64).\n" +
        "- **Processor:** Any modern Intel or AMD CPU with AVX2 instruction support.\n" +
        "- **RAM:** ~150–250 MB operational memory.\n" +
        "- **GPU:** None needed (inference runs 100% on CPU).\n\n" +
        "*Note: ClipoTxt is built natively for Windows. There is currently no macOS or Linux release.*"
      );
    }

    // 12. Check if query is on-topic for ClipoTxt (broad check)
    const clipoKeywords = [
      "clipo",
      "ocr",
      "snip",
      "screenshot",
      "clipboard",
      "paste",
      "copy",
      "text",
      "image",
      "capture",
      "tool",
      "app",
      "desktop",
      "software",
      "window",
      "win32",
      "bharath",
      "onnx",
      "model",
      "rapidocr",
      "hotkey",
      "shortcut",
      "setting",
      "install",
      "download",
      "run",
      "benchmark",
    ];
    const isOnTopic = clipoKeywords.some((k) => q.includes(k));

    if (isOnTopic) {
      return (
        "**ClipoTxt** is a 100% free, local-first on-device Windows OCR utility created by **Bharath Thommandru**.\n\n" +
        "- Snip with <kbd>Win</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd>\n" +
        "- Extracts text locally with **RapidOCR PP-OCRv4 CPU** in ~600–800 ms\n" +
        "- Formats with **Smart Format Mode** (tables, code fences, layout)\n" +
        "- Paste anywhere with <kbd>Ctrl</kbd> + <kbd>V</kbd>\n" +
        "- Toggle on/off anytime with <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>O</kbd>\n" +
        "- 100% private, zero telemetry, local SQLite WAL history."
      );
    }

    // 13. RESTRICTED DOMAIN GUARD (for off-topic queries)
    return (
      "🛡️ **ClipoTxt Domain Guard**\n\n" +
      "I am the specialized assistant for **ClipoTxt** by **Bharath Thommandru**. I only answer questions regarding ClipoTxt features, shortcuts, local OCR, architecture, privacy, and installation.\n\n" +
      "💡 *You can ask me about:*\n" +
      "- **Hotkeys:** *“What shortcut captures text?”* or *“How to pause?”*\n" +
      "- **Engine:** *“How fast is RapidOCR PP-OCRv4 on CPU?”*\n" +
      "- **Privacy:** *“Is my data sent to any cloud?”*\n" +
      "- **Format:** *“What does Smart Format Mode do?”*\n" +
      "- **Download:** *“Where can I get the v1.0.3 installer?”*"
    );
  }

  function anyMatch(text, words) {
    return words.some((w) => text.includes(w));
  }

  function formatMarkdown(md) {
    if (!md) return "";
    return md
      .replace(/### (.*?)(?:\n|$)/g, "<h6>$1</h6>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      )
      .replace(/(?:^|\n)- (.*?)(?=(?:\n- |\n\n|$))/g, "<li>$1</li>")
      .replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
  }

  /* Waypoint destinations */
  const FIND = {
    download: isMac
      ? {
          el: () => $(".fork .card.stu [data-macfix-dl]"),
          say: "ClipoTxt is built for Windows 10 and 11 (64-bit).",
          enter: "download it",
        }
      : {
          el: () => $(".fork .card:not(.stu) [data-didit-dl]"),
          say: "ClipoTxt v1.0.3. Free for Windows 10 and 11.",
          enter: "download it",
        },
    students: {
      el: () => $(".fork .card.stu .acts .btn.solid"),
      say: "ClipoTxt Desktop Workspace with history and benchmarks.",
      enter: "view it",
    },
    mac: {
      el: () => $(".fork .card.stu [data-macfix-dl]"),
      say: "ClipoTxt is built natively for Windows 10 and 11 (64-bit).",
      enter: "download it",
    },
    cost: {
      el: () => $("#pricing .head h2"),
      tight: true,
      aim: 0.24,
      say: "ClipoTxt is 100% free and open. No subscription, no trial, no accounts.",
    },
    private: {
      el: () => $("#pricing .cols .card:last-child") || $("#now"),
      say: "100% Local-First Privacy: 0 telemetry, 0 cloud calls, all data stays strictly on your PC.",
    },
    setup: {
      el: () => $("#setup .seg"),
      say: "Quickstart guide: installation, shortcuts, and clipboard OCR setup.",
    },
    pranav: {
      el: () => pillEl() || $("#feedback .nfb-msg"),
      say: "Tell Bharath here. It goes straight to him.",
      stay: () => !!pillEl(),
      get enter() {
        return pillEl() ? "open it" : "";
      },
    },
    questions: {
      el: () => $("#faq .ask"),
      say: "Everything else about ClipoTxt and local OCR is answered here. Search it.",
    },
  };

  const WORDS = [
    [/\b(tour|show me around|show off)\b/, "tour"],
    [/\b(mac|macbook|macos|apple)\b/, "mac"],
    [/\b(workspace|benchmarks?)\b/, "students"],
    [/\b(cost|price|pricing|free|pro|subscription)\b/, "cost"],
    [/\b(set ?up|get started|start|guide)\b/, "setup"],
    [/\b(feedback|founder|bharath|pranav|contact)\b/, "pranav"],
    [/\b(download|install|exe|portable|get clipotxt)\b/, "download"],
  ];
  const TOUR = [
    {
      go: "setup",
      say: "Setup first. Learn how Win + Shift + S and local OCR work.",
    },
    {
      go: "cost",
      say: "ClipoTxt is 100% free. No API keys, no subscriptions.",
    },
    {
      go: "questions",
      say: "Got questions? Architecture, benchmarks, and privacy are answered here.",
    },
    {
      go: "download",
      say: "That’s the tour. Pick your download to get started.",
    },
  ];
  const CHIPS = [
    ["download", "Get the free download"],
    ["cost", "What does it cost?"],
    ["private", "Is my data private?"],
    ["tour", "Show me around"],
    ["pranav", "Tell Bharath something"],
  ];

  function start() {
    const box = document.createElement("div");
    box.className = "pk-box";
    box.innerHTML =
      '<button type="button" class="pk-knot" aria-label="Ask the ClipoTxt Companion where anything is on this page" aria-expanded="false" aria-controls="pkAsk">' +
      '<canvas style="display:block;width:100%;height:100%;opacity:0;pointer-events:none;position:absolute;inset:0"></canvas>' +
      '<span class="pk-hit" style="display:none;pointer-events:none"></span>' +
      "</button>";
    const ask = document.createElement("div");
    ask.className = "pk-ask";
    ask.id = "pkAsk";
    ask.innerHTML =
      '<div class="pk-say" role="status" aria-live="polite"></div>' +
      '<p class="pk-note">Ask anything about ClipoTxt, features, hotkeys, local OCR, or architecture.</p>' +
      '<div class="pk-chips">' +
      CHIPS.map(
        ([id, label]) =>
          `<button type="button" class="pk-chip" data-ask="${id}">${label}</button>`,
      ).join("") +
      "</div>" +
      '<form class="pk-line" autocomplete="off"><input type="text" maxlength="500" aria-label="Ask anything about ClipoTxt" placeholder="Ask anything about ClipoTxt..." spellcheck="false">' +
      '<button type="submit" class="pk-send" aria-label="Ask"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg></button></form>';
    const hint = document.createElement("div");
    hint.className = "pk-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.textContent = "What do you need help with?";
    const bub = document.createElement("div");
    bub.className = "pk-bub";
    bub.setAttribute("role", "status");
    bub.innerHTML =
      '<div class="k"></div><div class="t"></div><div class="h"></div>';
    const thread = document.createElement("canvas");
    thread.className = "pk-thread";
    thread.setAttribute("aria-hidden", "true");
    const ring = document.createElement("div");
    ring.className = "pk-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.append(thread, ring, box, ask, hint, bub);

    const btn = box.querySelector(".pk-knot"),
      input = ask.querySelector("input"),
      say = ask.querySelector(".pk-say");
    const knot = NusKnot3D.mount(box.querySelector("canvas"), { thread });
    if (!knot || !knot.strand) {
      [box, ask, hint, bub, thread, ring].forEach((n) => n.remove());
      return;
    }
    const strand = knot.strand;

    // Drop-in 3D unfolding ClipoTxt logo component
    const clipoComp = createClipoCompanion(btn);

    let mode = "home"; // home | open | run | hold | drag
    let runId = 0,
      heldAt = 0,
      holdTimer = 0,
      keyboard = false,
      cancelScroll = null;
    let chatHistory = [];
    const setExpanded = (on) =>
      btn.setAttribute("aria-expanded", on ? "true" : "false");
    const showHint = (on) => hint.classList.toggle("on", on);
    const clearHelp = () => {
      bub.classList.remove("on");
      ring.classList.remove("on");
    };
    let restTimer = 0,
      leaning = false;
    const rest = () => {
      clearTimeout(restTimer);
      restTimer = setTimeout(() => {
        if (mode === "home" && !leaning && !knot.isTravelling()) knot.sleep();
        else rest();
      }, 5000);
    };

    /* ---------- the ask line ---------- */
    function openAsk(typeNow) {
      mode = "open";
      showHint(false);
      ask.classList.add("on");
      setExpanded(true);
      knot.resetPose();
      knot.setState("ready");
      count("open");
      if (typeNow) input.focus({ preventScroll: true });
    }
    function closeAsk(focusKnot) {
      ask.classList.remove("on");
      setExpanded(false);
      if (mode === "open") {
        mode = "home";
        knot.setState("idle");
        rest();
      }
      if (focusKnot) btn.focus({ preventScroll: true });
    }

    let grokKey = "";
    let grokModel = "grok-beta";
    try {
      grokKey = localStorage.getItem("clipo_grok_key") || "";
    } catch (e) {}

    /* ---------- intelligent question answering ---------- */
    async function askClipo(query) {
      const q = query.trim();
      if (!q) return;

      // Allow setting or updating API key directly in chat if user provides an xAI key
      const keySetMatch = q.match(
        /^(?:set\s+)?(?:grok_?)?(?:api_?)?key[:=]\s*(xai-[a-zA-Z0-9_-]+)/i,
      );
      if (keySetMatch) {
        grokKey = keySetMatch[1].trim();
        try {
          localStorage.setItem("clipo_grok_key", grokKey);
        } catch (e) {}
        say.innerHTML =
          '<div class="pk-source-badge grok">⚡ Grok Key Saved</div><p>Your Grok API key has been saved! Answers will be augmented live when online.</p>';
        knot.setState("ready");
        knot.gesture("done");
        return;
      }

      mode = "open";
      say.innerHTML =
        '<div class="pk-loading"><span class="pk-dots"><span class="pk-dot"></span><span class="pk-dot"></span><span class="pk-dot"></span></span> <span>Thinking...</span></div>';
      knot.setState("thinking");

      // Give a brief natural pause so the interaction feels smooth
      await new Promise((r) => setTimeout(r, 60));

      // Client-side JavaScript knowledge engine: instant, offline, domain-guarded
      let replyText = getLocalClipoAnswer(q);
      let source = "local";

      // If user provided a live Grok key (starts with xai-) in localStorage, try live LLM
      if (grokKey && grokKey.startsWith("xai-")) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1200);
          const systemPrompt =
            "You are the official ClipoTxt assistant. ClipoTxt is a 100% free, local-first on-device Windows OCR utility created by Bharath Thommandru. It captures with Win+Shift+S, extracts text with RapidOCR PP-OCRv4 CPU in ~600-800ms, formats Smart Format Markdown, and pastes with Ctrl+V. Global toggle hotkey is Ctrl+Alt+O. History is stored in SQLite WAL. Zero telemetry, zero cloud calls, 100% offline. Be concise, helpful, format with Markdown.";
          const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.slice(-6),
            { role: "user", content: q },
          ];
          const r = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + grokKey,
            },
            body: JSON.stringify({
              model: grokModel || "grok-beta",
              messages: messages,
              temperature: 0.3,
              max_tokens: 800,
            }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (r.ok) {
            const resJson = await r.json();
            if (
              resJson.choices &&
              resJson.choices[0] &&
              resJson.choices[0].message
            ) {
              replyText = resJson.choices[0].message.content;
              source = "grok";
            }
          }
        } catch (e) {}
      }

      chatHistory.push(
        { role: "user", content: q },
        { role: "assistant", content: replyText },
      );
      if (chatHistory.length > 12) chatHistory = chatHistory.slice(-12);

      const badgeHtml =
        source === "grok"
          ? '<div class="pk-source-badge grok">⚡ Grok AI</div>'
          : '<div class="pk-source-badge local">✦ Clipo Knowledge</div>';

      say.innerHTML = badgeHtml + "<p>" + formatMarkdown(replyText) + "</p>";
      say.scrollTop = 0;
      knot.setState("ready");
      knot.gesture("done");
      count("reply");
    }

    function checkNavigation(text) {
      const q = text.toLowerCase().trim();
      if (/^(hi|hey|hello|yo|sup)\b/.test(q)) {
        return {
          reply:
            "Hi! I am the ClipoTxt Companion. Ask me anything about ClipoTxt, features, hotkeys, or architecture.",
        };
      }
      for (const [re, id] of WORDS) {
        if (re.test(q)) return id === "tour" ? { tour: true } : { go: id };
      }
      return null;
    }

    function askFor(what) {
      if (!what) return;
      if (what.reply) {
        say.innerHTML = "<p>" + formatMarkdown(what.reply) + "</p>";
        knot.gesture("nudge");
        return;
      }
      input.value = "";
      closeAsk();
      if (what.tour) {
        count("tour");
        tour();
        return;
      }
      if (what.faq) {
        count("faq");
        guide({
          el: () => what.faq.row.querySelector(".qh"),
          prepare: () => what.faq.open(),
          kicker: "Answered",
          say: "Opened the answer for you.",
          hint: true,
        });
        return;
      }
      count(what.go);
      guide(Object.assign({ hint: true }, FIND[what.go]));
    }

    function chip(id) {
      if (id === "tour") return { tour: true };
      return { go: id };
    }

    /* ---------- going there ---------- */
    const scrollRange = (top) =>
      clampTo(
        top,
        0,
        Math.max(0, document.documentElement.scrollHeight - innerHeight),
      );
    const aimFor = (el, at) => {
      const r = el.getBoundingClientRect();
      return scrollRange(
        scrollY + r.top + r.height / 2 - innerHeight * (at || 0.46),
      );
    };
    function glide(to, ms) {
      return new Promise((done) => {
        const from = scrollY;
        if (reduce || Math.abs(to - from) < 2) {
          scrollTo({ top: to, behavior: "instant" });
          done(true);
          return;
        }
        const t0 = performance.now();
        let raf = 0;
        cancelScroll = () => {
          cancelAnimationFrame(raf);
          cancelScroll = null;
          done(false);
        };
        const step = (now) => {
          const u = Math.min(1, (now - t0) / ms),
            e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          scrollTo({ top: from + (to - from) * e, behavior: "instant" });
          if (u < 1) raf = requestAnimationFrame(step);
          else {
            cancelScroll = null;
            done(true);
          }
        };
        raf = requestAnimationFrame(step);
      });
    }

    async function bringIntoView(el, id, at) {
      const dist = Math.abs(aimFor(el, at) - scrollY);
      if (!(await glide(aimFor(el, at), clampTo(300 + dist * 0.06, 380, 700))))
        return false;
      for (let i = 0; i < 3; i++) {
        await wait(70);
        if (id !== runId) return false;
        const off = aimFor(el, at) - scrollY;
        if (Math.abs(off) < 18) break;
        if (!(await glide(scrollY + off, 220))) return false;
      }
      let last = el.getBoundingClientRect();
      for (let i = 0, still = 0; i < 24 && still < 2 && !reduce; i++) {
        await wait(60);
        if (id !== runId) return false;
        const now = el.getBoundingClientRect();
        still =
          Math.abs(now.top - last.top) +
            Math.abs(now.left - last.left) +
            Math.abs(now.width - last.width) <
          0.5
            ? still + 1
            : 0;
        last = now;
      }
      return true;
    }

    function landingFor(r) {
      const W = innerWidth,
        H = innerHeight,
        m = 52,
        dx = 66,
        dy = 46;
      const spots = [
        [r.right + dx, r.bottom + dy],
        [r.left - dx, r.bottom + dy],
        [r.right + dx, r.top - dy],
        [r.left - dx, r.top - dy],
      ];
      for (const [x, y] of spots)
        if (x > m && x < W - m && y > m && y < H - m) return { x, y };
      return {
        x: clampTo(r.right + dx, m, W - m),
        y: clampTo(r.bottom + dy, m, H - m),
      };
    }

    function placeBubble(r, spot) {
      const b = bub.getBoundingClientRect(),
        W = innerWidth,
        H = innerHeight,
        gap = 18;
      let x = clampTo(r.left + r.width / 2 - b.width / 2, 12, W - b.width - 12);
      let y = r.top - b.height - gap;
      if (y < 12) y = r.bottom + gap;
      const hits =
        spot.x + 56 > x &&
        spot.x - 56 < x + b.width &&
        spot.y + 50 > y &&
        spot.y - 50 < y + b.height;
      if (hits)
        x =
          spot.x < W / 2
            ? Math.min(W - b.width - 12, spot.x + 62)
            : Math.max(12, spot.x - 62 - b.width);
      bub.style.translate = `${Math.round(x)}px ${Math.round(clampTo(y, 12, H - b.height - 12))}px`;
    }

    function lassoOn(el, tight) {
      return new Promise((done) => {
        let b = el.getBoundingClientRect();
        if (tight) {
          const words = document.createRange();
          words.selectNodeContents(el);
          b = words.getBoundingClientRect();
        }
        const r = { x: b.left, y: b.top, w: b.width, h: b.height },
          spot = landingFor(b);
        if (reduce) {
          ring.style.cssText = `left:${b.left - 8}px;top:${b.top - 8}px;width:${b.width + 16}px;height:${b.height + 16}px`;
          ring.classList.add("on");
          done({ rect: b, spot: { x: -999, y: -999 } });
          return;
        }
        let finished = false;
        const finish = () => {
          if (!finished) {
            finished = true;
            done({ rect: b, spot });
          }
        };
        strand.arrive(finish);
        setTimeout(finish, reduce ? 0 : 2400);
        strand.lasso(r, spot);
      });
    }

    function saidBy(item, skipped) {
      bub.querySelector(".k").textContent = item.kicker || "Found it";
      bub.querySelector(".t").textContent = item.say;
      const screens = Math.round(skipped / innerHeight),
        lines = [];
      if (item.hint && screens >= 1)
        lines.push(
          `One ask. ${screens} ${screens === 1 ? "screen" : "screens"} of scrolling skipped.`,
        );
      if (item.hint && keyboard && item.enter)
        lines.push(`Press Enter to ${item.enter}.`);
      bub.querySelector(".h").textContent = lines.join(" ");
    }

    async function stop(item, id) {
      const el = item.el();
      if (!el) return false;
      const y0 = scrollY;
      if (item.prepare) item.prepare();
      const rising = el.closest(".reveal");
      if (rising) rising.classList.add("in");
      knot.setState("thinking");
      if (
        !(item.stay && item.stay()) &&
        !(await bringIntoView(el, id, item.aim))
      )
        return false;
      if (id !== runId) return false;
      const { rect, spot } = await lassoOn(el, item.tight);
      if (id !== runId) return false;
      saidBy(item, Math.abs(scrollY - y0));
      knot.setState("ready");
      knot.gesture("done");
      placeBubble(rect, spot);
      bub.classList.add("on");
      heldAt = scrollY;
      mode = "hold";
      return true;
    }

    async function guide(item) {
      const id = ++runId;
      mode = "run";
      showHint(false);
      clearTimeout(holdTimer);
      const ok = await stop(item, id);
      if (id !== runId) return;
      if (!ok) {
        goHome();
        return;
      }
      const el = item.el();
      if (keyboard && el && el.matches("a,button,textarea"))
        el.focus({ preventScroll: true });
      holdTimer = setTimeout(goHome, 14000);
    }

    async function tour() {
      const id = ++runId;
      showHint(false);
      clearTimeout(holdTimer);
      keyboard = false;
      for (let i = 0; i < TOUR.length; i++) {
        mode = "run";
        clearHelp();
        const s = TOUR[i],
          ok = await stop(
            Object.assign({}, FIND[s.go], {
              say: s.say,
              kicker: `${i + 1} of ${TOUR.length}`,
            }),
            id,
          );
        if (id !== runId) return;
        if (!ok) {
          goHome();
          return;
        }
        if (i < TOUR.length - 1) {
          await wait(2600);
          if (id !== runId) return;
        }
      }
      holdTimer = setTimeout(goHome, 14000);
    }

    function goHome() {
      runId++;
      clearTimeout(holdTimer);
      if (cancelScroll) cancelScroll();
      clearHelp();
      mode = "home";
      knot.setState("idle");
      strand.flyHome();
      rest();
    }

    /* ---------- touching it & drag physics ---------- */
    let press = null;
    btn.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      btn.setPointerCapture(e.pointerId);
      press = {
        x: e.clientX,
        y: e.clientY,
        t: performance.now(),
        lx: e.clientX,
        ly: e.clientY,
        vx: 0,
        vy: 0,
        dragged: false,
      };
    });

    btn.addEventListener("pointermove", (e) => {
      if (!press) return;
      const now = performance.now(),
        dt = Math.max(1, now - press.t);
      if (
        !press.dragged &&
        Math.hypot(e.clientX - press.x, e.clientY - press.y) < 5
      )
        return;
      if (!press.dragged) {
        press.dragged = true;
        if (mode === "hold" || mode === "run") {
          runId++;
          clearTimeout(holdTimer);
          if (cancelScroll) cancelScroll();
          clearHelp();
          strand.rewind();
        }
        closeAsk();
        mode = "drag";
        showHint(false);
        btn.classList.add("held");
        knot.setState("ready");
        knot.resetPose();
        knot.cancelTravel();
        count("drag");
      }
      press.vx = ((e.clientX - press.lx) / dt) * 1000;
      press.vy = ((e.clientY - press.ly) / dt) * 1000;
      press.lx = e.clientX;
      press.ly = e.clientY;
      press.t = now;
      strand.placeAt({
        x: clampTo(e.clientX, 10, innerWidth - 10),
        y: clampTo(e.clientY, 10, innerHeight - 10),
      });
      knot.setDrag({ vx: press.vx, vy: press.vy });
    });

    function letGo() {
      if (!press) return;
      const p = press;
      press = null;
      if (!p.dragged) return;
      btn.classList.remove("held");
      knot.setDrag(null);
      mode = "home";
      knot.setState("idle");
      strand.flyHome({
        v0: {
          x: clampTo(p.vx, -2400, 2400) * 0.35,
          y: clampTo(p.vy, -2400, 2400) * 0.35,
        },
      });
      rest();
      btn.dataset.dragged = "1";
      setTimeout(() => {
        delete btn.dataset.dragged;
      }, 60);
    }

    btn.addEventListener("pointerup", letGo);
    btn.addEventListener("pointercancel", letGo);

    btn.addEventListener("click", (e) => {
      if (btn.dataset.dragged) return;
      const r = btn.getBoundingClientRect();
      knot.gesture("poke", {
        dx: (e.clientX - (r.left + r.width / 2)) / (r.width / 2) || 0,
        dy: (e.clientY - (r.top + r.height / 2)) / (r.height / 2) || 0,
      });
      if (mode === "hold" || mode === "run") {
        goHome();
        return;
      }
      if (mode === "open") {
        closeAsk(true);
        return;
      }
      keyboard = e.detail === 0;
      openAsk(matchMedia("(hover:hover)").matches || keyboard);
    });

    btn.addEventListener("pointerenter", (e) => {
      if (mode === "home" && e.pointerType === "mouse") {
        knot.setState("ready");
        showHint(false);
      }
    });
    btn.addEventListener("pointerleave", (e) => {
      if (mode === "home" && e.pointerType === "mouse") {
        knot.setState("idle");
        rest();
      }
    });

    let leanFrame = 0;
    addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse" || leanFrame) return;
        leanFrame = requestAnimationFrame(() => {
          leanFrame = 0;
          if (
            mode !== "home" ||
            !box.classList.contains("in") ||
            knot.isTravelling()
          ) {
            if (leaning) {
              leaning = false;
              knot.resetPose();
            }
            return;
          }
          const r = btn.getBoundingClientRect(),
            dx = e.clientX - (r.left + r.width / 2),
            dy = e.clientY - (r.top + r.height / 2),
            d = Math.hypot(dx, dy);
          if (d < 320 && d > 24) {
            leaning = true;
            clearTimeout(restTimer);
            const k = (0.3 * (1 - d / 320)) / d;
            knot.setPose({ leanX: dx * k, leanY: dy * k });
          } else if (leaning) {
            leaning = false;
            knot.resetPose();
            rest();
          }
        });
      },
      { passive: true },
    );

    /* ---------- ask line controls ---------- */
    ask.addEventListener("click", (e) => {
      const c = e.target.closest(".pk-chip");
      if (!c) return;
      keyboard = e.detail === 0;
      const nav = chip(c.dataset.ask);
      if (nav) askFor(nav);
    });

    ask.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      keyboard = true;
      const q = input.value.trim();
      if (!q) return;
      input.value = "";
      askClipo(q);
    });

    /* ---------- dismiss triggers ---------- */
    addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (mode === "hold" || mode === "run") {
          goHome();
          btn.focus({ preventScroll: true });
        } else if (mode === "open") closeAsk(true);
        return;
      }
      if (
        mode === "run" &&
        /^(Arrow|Page|Home|End| )/.test(e.key) &&
        e.target !== input
      )
        goHome();
    });
    const tookOver = () => {
      if (mode === "run") goHome();
    };
    addEventListener("wheel", tookOver, { passive: true });
    addEventListener("touchmove", tookOver, { passive: true });
    addEventListener("pointerdown", (e) => {
      if (box.contains(e.target) || ask.contains(e.target)) return;
      if (mode === "open") closeAsk();
      else if (mode === "hold" || mode === "run") goHome();
    });
    addEventListener(
      "scroll",
      () => {
        showHint(false);
        if (mode === "hold" && Math.abs(scrollY - heldAt) > 50) goHome();
      },
      { passive: true },
    );
    addEventListener("resize", () => {
      if (mode === "hold" || mode === "run") {
        runId++;
        clearTimeout(holdTimer);
        if (cancelScroll) cancelScroll();
        clearHelp();
        mode = "home";
        knot.setState("idle");
      }
      strand.resetHome();
    });

    const widget = $(".nfb-widget");
    if (widget) {
      const sync = () =>
        box.classList.toggle("low", widget.classList.contains("nfb-away"));
      new MutationObserver(sync).observe(widget, {
        attributes: true,
        attributeFilter: ["class"],
      });
      sync();
    }
    const stage = document.getElementById("aStage");
    if (stage && window.IntersectionObserver)
      new IntersectionObserver(
        (es) => {
          es.forEach((en) => {
            box.classList.toggle("duck", en.isIntersecting);
            if (en.isIntersecting) {
              showHint(false);
              if (mode === "open") closeAsk();
            }
          });
        },
        { threshold: 0.08 },
      ).observe(stage);

    /* ---------- entrance fly-in ---------- */
    setTimeout(
      () => {
        box.classList.add("in");
        if (reduce) {
          knot.gesture("arrive");
          return;
        }
        const r = btn.getBoundingClientRect();
        strand.placeAt({ x: innerWidth + 90, y: r.top + r.height / 2 - 120 });
        knot.setState("ready");
        strand.flyHome({
          onDone() {
            if (mode !== "home") return;
            knot.setState("idle");
            knot.gesture("arrive");
            let seen = false;
            try {
              seen = sessionStorage.getItem("pkHint") === "1";
              sessionStorage.setItem("pkHint", "1");
            } catch (e) {}
            if (!seen && scrollY < innerHeight * 0.5) {
              showHint(true);
              setTimeout(() => showHint(false), 5200);
            }
            rest();
          },
        });
      },
      reduce ? 300 : 1500,
    );
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start);
  else start();
})();
