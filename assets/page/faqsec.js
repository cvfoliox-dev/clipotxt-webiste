/* FAQ, option B "Ask it" (picked 2026-09-30). A Companion-style ask pill with the real Knot; typing filters the
   real-comment questions, highlights the words and opens the best match as a NŪS answer. All of them show when
   empty. Answers updated to shipped facts on 2026-09-30. Usage: NusFaq.mount(el)  (el is an empty .faqsec) */
(function () {
  const reduce =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FEEDBACK = "feedback.html";
  const K = (...k) => k.map((x) => `<kbd>${x}</kbd>`).join(" ");
  const FAQ = [
    {
      q: "What is ClipoTxt and how does it work?",
      k: "what is clipotxt how it works ocr desktop overview",
      a: "ClipoTxt is a free, local-first Windows desktop utility that converts any screenshot with readable content into clean, usable text using on-device Optical Character Recognition (OCR). Capture a screenshot with <b>Win + Shift + S</b>, and ClipoTxt immediately extracts its visible content and puts the result on your clipboard so you can press <b>Ctrl + V</b> wherever you work.",
    },
    {
      q: "How does the Win + Shift + S screenshot capture work?",
      k: "win shift s snipping tool shortcut capture monitor",
      a: "ClipoTxt connects directly to the Windows clipboard listener API. When Snipping Tool puts a new screenshot on your clipboard, ClipoTxt detects it with a 350ms debounce and processes the bitmap in a background thread. There is zero polling, so idle CPU usage is 0.00%.",
    },
    {
      q: "What is Automatic Clipboard Replacement?",
      k: "auto replace clipboard image paste ctrl v",
      a: "By default, ClipoTxt replaces the screenshot on your clipboard with its extracted usable text. This lets you immediately press <b>Ctrl + V</b> wherever you work—documents, emails, browsers, chats, or editors. If an image contains no recognizable text, your clipboard is left untouched. You can toggle auto-replacement on or off in Settings.",
    },
    {
      q: "What is Smart Format Mode?",
      k: "smart format mode markdown formatting layout tables code blocks",
      a: "Smart Format Mode preserves the natural reading structure of any screenshot—paragraphs, headings, lists, layout regions, tables, and indented code—so the pasted text stays clean and readable wherever you drop it.",
    },
    {
      q: "Is ClipoTxt 100% offline and private? Does anything leave my computer?",
      k: "local privacy offline telemetry data server cloud leave security",
      a: "Yes, 100% local and offline. ClipoTxt makes <b>zero telemetry calls</b> and sends zero data to external servers. All OCR processing runs directly on your Windows CPU. Your screenshots and extracted text never leave your machine.",
    },
    {
      q: "Do I need an account, subscription, or API key?",
      k: "key api account subscription free cost offline",
      a: "No accounts, subscriptions, or API keys are required. ClipoTxt is a standalone desktop tool with local OCR built in and makes zero cloud calls.",
    },
    {
      q: "How does ClipoTxt prevent clipboard loops and accidental overwrites?",
      k: "loop concurrency overwrite sequence id hash collision",
      a: "ClipoTxt uses raw buffer MD5 image hashing to detect and ignore its own clipboard writes, preventing infinite write loops. A monotonic sequence ID guard ensures that if you copy newer text while an OCR task is running, the newer clipboard content is never overwritten.",
    },
    {
      q: "How does SQLite History and Markdown export work?",
      k: "history sqlite wal export md markdown save",
      a: "Every extraction is stored locally in an SQLite database (in WAL mode for high concurrency) under <code>%LOCALAPPDATA%\\ClipoTxt\\history.db</code>. You can search past captures, copy individual entries, or click <b>Export all (.md)</b> to generate a consolidated UTF-8 Markdown file.",
    },
    {
      q: "What is the difference between the CPU benchmark and the OCR benchmark?",
      k: "cpu benchmark ocr hardware test latency ops sec",
      a: "The CPU Benchmark measures sustained single-core and multi-core processor performance. The OCR Benchmark runs an isolated local recognition pass on a built-in test image to measure how quickly ClipoTxt extracts text on your PC in milliseconds.",
    },
    {
      q: "What does the model confidence percentage mean?",
      k: "confidence percentage accuracy score probability",
      a: "Confidence is the local OCR engine's certainty estimate (0–100%) for detected text. A faster or slower CPU affects processing speed, not recognition accuracy.",
    },
    {
      q: "What does the Ctrl + Alt + O shortcut do?",
      k: "ctrl alt o hotkey shortcut toggle pause resume",
      a: "<b>Ctrl + Alt + O</b> is the global hotkey to pause or resume ClipoTxt's clipboard monitoring from anywhere on your PC without opening the main window.",
    },
    {
      q: "How do I install ClipoTxt on Windows 10 & 11?",
      k: "windows install setup download requirements direct launch",
      a: "Download <b>ClipoTxt-Setup-v1.0.3.exe</b> and run it. The standalone installer bundles everything needed for local OCR and launches ClipoTxt directly into your system tray and workspace with zero external dependencies.",
    },
    {
      q: "How do I completely clear my history or reset application data?",
      k: "clear history reset data factory default delete sqlite",
      a: "In Settings, you have two isolated controls: <b>Clear History</b> permanently removes all saved captures from the local SQLite archive while preserving your preferences; <b>Reset Application Data</b> resets settings back to defaults while keeping your capture history.",
    },
    {
      q: "How do in-app software updates work?",
      k: "updates sha256 update version upgrade installer",
      a: "ClipoTxt checks <code>version.json</code> on the public GitHub releases repository. When an update is available, it downloads the installer in the background, verifies its cryptographic <b>SHA-256 checksum</b>, and executes the installer with an automatic restart hook while preserving your data.",
    },
  ];
  const plain = (h) => h.replace(/<[^>]+>/g, "");
  const STOP = [
    "is",
    "it",
    "the",
    "a",
    "an",
    "do",
    "does",
    "can",
    "how",
    "what",
    "i",
    "my",
    "to",
    "of",
    "on",
    "in",
    "there",
    "for",
  ];
  const CLIPO_ICON = `<svg viewBox="0 0 512 512" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M52 92 L388 92 L396 168 L252 408 L52 418Z" fill="#8cc152" fill-opacity="0.9"/>
    <path d="M38 80 V428 M38 80 H436 M38 430 H287 M64 100 L96 132 M438 84 L376 134 M322 204 H476 M252 281 H412 M190 354 H348" stroke="#f1ecdf" stroke-width="34"/>
  </svg>`;
  function mount(root) {
    root.innerHTML = `<div class="sec">
      <div class="head reveal"><div class="mono">Questions & Answers</div><h2 class="serif">Everything about ClipoTxt, <em>answered here.</em></h2><p>Search questions about offline OCR, formats, and performance.</p></div>
      <label class="ask reveal"><span class="fknot" aria-hidden="true" data-state="idle">${CLIPO_ICON}</span><span class="sr">Search the questions</span><input type="text" placeholder="What do you need help with?" autocomplete="off" spellcheck="false"><span class="count">${FAQ.length} questions</span></label>
      <div class="tries reveal" aria-label="Try"><button type="button">Is it free?</button><button type="button">Win + Shift + S</button><button type="button">Is it local?</button><button type="button">Smart Format Mode</button><button type="button">Won’t install</button></div>
      <div class="qlist reveal">${FAQ.map(
        (
          f,
          i,
        ) => `<div class="qrow" data-i="${i}"><button type="button" class="qh" aria-expanded="false"><span class="qt">${f.q}</span><span class="pl" aria-hidden="true"></span></button>
        <div class="body"><div><div class="bub"><div class="k">ClipoTxt</div><div class="ans">${f.a}</div></div></div></div></div>`,
      ).join("")}</div>
      <p class="none">Nothing matched. Ask us directly below.</p>
      <div class="more reveal"><div><b>Didn’t see yours?</b><p>Send it to Bharath. Questions get answered here, and feature requests get built first.</p></div><a class="fbtn" href="mailto:bharathtommandru1@gmail.com">Ask Bharath</a></div></div>`;
    const input = root.querySelector(".ask input"),
      count = root.querySelector(".ask .count"),
      none = root.querySelector(".none"),
      rows = [...root.querySelectorAll(".qrow")];
    const fknot = root.querySelector(".fknot"),
      st = (s) => {
        if (fknot) fknot.dataset.state = s || "idle";
      };
    const open = (r, on) => {
      r.classList.toggle("open", on);
      r.querySelector(".qh").setAttribute("aria-expanded", on);
    };
    rows.forEach((r) =>
      r
        .querySelector(".qh")
        .addEventListener("click", () =>
          open(r, !r.classList.contains("open")),
        ),
    );
    const words = (s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOP.includes(w));
    let t = 0;
    function run() {
      const ws = words(input.value.trim());
      if (!ws.length) {
        rows.forEach((r) => {
          r.classList.remove("hide");
          r.querySelector(".qt").innerHTML = FAQ[+r.dataset.i].q;
        });
        count.textContent = FAQ.length + " questions";
        none.classList.remove("on");
        st("idle");
        return;
      }
      st("thinking");
      const scored = rows.map((r) => {
        const f = FAQ[+r.dataset.i],
          hay = (f.q + " " + f.k + " " + plain(f.a)).toLowerCase();
        let s = 0;
        ws.forEach((w) => {
          if (f.q.toLowerCase().includes(w)) s += 3;
          if (f.k.includes(w)) s += 2;
          else if (hay.includes(w)) s += 1;
        });
        return { r, s, f };
      });
      let shown = 0;
      scored.forEach(({ r, s, f }) => {
        const hit = s > 0;
        r.classList.toggle("hide", !hit);
        if (hit) shown++;
        open(r, false);
        let qt = f.q;
        ws.forEach((w) => {
          qt = qt.replace(
            new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"),
            "<mark>$1</mark>",
          );
        });
        r.querySelector(".qt").innerHTML = qt;
      });
      const best = scored.filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0];
      count.textContent = shown
        ? `${shown} ${shown === 1 ? "answer" : "answers"}`
        : "No match";
      none.classList.toggle("on", !shown);
      clearTimeout(t);
      t = setTimeout(
        () => {
          if (best) {
            open(best.r, true);
            st("ready");
          } else st("idle");
        },
        reduce ? 0 : 350,
      );
    }
    // the corner Knot asks here too: the best row for these words, and a way to open it with the list unfiltered
    window.NusFaq.find = (text) => {
      const flat = (x) => x.toLowerCase().replace(/[’']/g, ""); // so "wont" and "won't" both find "won’t"
      const vague = [
        "clipo",
        "clipotxt",
        "have",
        "has",
        "version",
        "get",
        "use",
        "need",
        "you",
        "your",
        "me",
        "be",
        "with",
        "about",
        "will",
        "if",
        "and",
        "or",
        "this",
        "that",
        "app",
        "work",
        "works",
      ];
      const ws = words(flat(text)).filter((w) => !vague.includes(w));
      if (!ws.length) return null;
      const best = rows
        .map((r) => {
          const f = FAQ[+r.dataset.i];
          let s = 0;
          ws.forEach((w) => {
            if (flat(f.q).includes(w)) s += 3;
            if (f.k.includes(w)) s += 2;
            else if ((f.q + " " + plain(f.a)).toLowerCase().includes(w)) s += 1;
          });
          return { r, s };
        })
        .sort((a, b) => b.s - a.s)[0];
      return best.s >= 2
        ? {
            row: best.r,
            open() {
              if (input.value) {
                input.value = "";
                run();
              }
              rows.forEach((x) => open(x, x === best.r));
            },
          }
        : null;
    };
    input.addEventListener("input", run);
    root.querySelectorAll(".tries button").forEach((b) =>
      b.addEventListener("click", () => {
        input.value = b.textContent;
        run();
        input.focus({ preventScroll: true });
      }),
    );
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.1 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }
  window.NusFaq = { mount };
})();
