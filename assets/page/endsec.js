/* Final CTA options + footer. NusEnd.mount(el, "full" | "words" | "card") builds a CTA; NusEnd.footer(el) the footer.
   Download links are the real release files; Mac visitors get the Mac beta for the student app. */
(function () {
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMac = /Mac/.test(navigator.platform || navigator.userAgent) && !/iPhone|iPad/.test(navigator.userAgent);
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const sm = (x, a, b) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const REL = "https://github.com/cvfoliox-dev/clipotxt-releases";
  const L = {
    installer: `${REL}/releases/download/v1.0.3/ClipoTxt-Setup-v1.0.3.exe`,
    portable: `${REL}/releases/download/v1.0.3/ClipoTxt-v1.0.3-windows-x64-portable.zip`,
    repo: REL,
    releases: `${REL}/releases`,
    feedback: "mailto:bharathtommandru1@gmail.com",
    privacy: "#now",
  };
  const APPLE = '<svg class="os" viewBox="0 0 24 24" aria-hidden="true"><path d="M16.37 12.64c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.24 2.73 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.41 1.2-2.47-.03-.01-2.3-.88-2.29-3.52zM14.2 6.18c.6-.73 1.01-1.74.9-2.75-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.08 1.96-.49 2.56-1.22z"/></svg>';
  const buttons = () => `<div class="btns">
    <a class="cbtn solid" href="${L.installer}">Download Installer (v1.0.3)</a>
    <a class="cbtn ghost" href="${L.portable}">Download Portable ZIP</a>
  </div>
  <p class="fine">Windows 10 and 11 (64-bit). 100% on-device OCR. No accounts, no subscriptions, zero cloud telemetry.</p>`;
  const HEAD = `<div class="kick mono">Your move</div><h2 class="serif">Download ClipoTxt, <em>free.</em></h2>`;   // short enough to clear the orb label "you" at every width

  function full(root) {
    root.innerHTML = `<div class="track"><div class="stage"><div class="orbbox"></div><div class="copy">${HEAD}${buttons()}</div></div></div>`;
    const track = root.querySelector(".track"), copy = root.querySelector(".copy");
    const orb = window.NusOrb ? new NusOrb(root.querySelector(".orbbox"), { tasks: false }) : null;
    let trackTop = 0, trackHeight = 1, pending = 0, lastProgress = -1;
    function measure() { trackTop = track.getBoundingClientRect().top + scrollY; trackHeight = track.offsetHeight; lastProgress = -1; queue(); }
    function queue() { if (!pending) pending = requestAnimationFrame(onScroll); }
    function onScroll() {
      pending = 0;
      const p = clamp((scrollY - trackTop) / Math.max(1, trackHeight - innerHeight));
      if (p === lastProgress) return;
      lastProgress = p;
      if (orb) orb.setStory(reduce ? 1 : 0.5 + 0.5 * sm(p, 0, 0.7));
      const a = reduce ? 1 : sm(p, 0.45, 0.75); copy.style.opacity = a; copy.style.transform = `translateY(${(1 - a) * 24}px)`; copy.style.pointerEvents = a > 0.5 ? "" : "none";
    }
    // read layout only while the ending is near, so scrolling elsewhere never forces a reflow here
    let near = false; new IntersectionObserver((es) => { near = es[0].isIntersecting; if (near) onScroll(); }, { rootMargin: "100% 0px" }).observe(track);
    addEventListener("scroll", () => near && queue(), { passive: true });
    NusMotion.onLayout(measure); measure();
  }
  function words(root) {
    const W = ["Start", "with", "step", "one."];
    root.innerHTML = `<div class="track"><div class="stage"><h2 class="serif">${W.map((w) => `<span>${w}</span>`).join("")}</h2><div class="after">${buttons()}</div></div></div>`;
    const track = root.querySelector(".track"), spans = [...root.querySelectorAll("h2 span")], after = root.querySelector(".after");
    function onScroll() { const r = track.getBoundingClientRect(), p = reduce ? 1 : clamp(-r.top / Math.max(1, track.offsetHeight - innerHeight) + 0.15);
      spans.forEach((s, i) => s.classList.toggle("on", p > 0.12 + i * 0.13)); after.classList.toggle("on", p > 0.7); }
    addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  function card(root) {
    root.innerHTML = `<div class="wrap"><div class="box"><div class="inner"><div>${HEAD}<p class="fine" style="margin-top:14px;font-size:16px;color:var(--mist)">Instant screenshot-to-text OCR, entirely on your computer.</p>${buttons()}</div><div class="knotbig"><canvas aria-hidden="true"></canvas></div></div></div></div>`;
    const cv = root.querySelector(".knotbig canvas");
    if (window.NusKnot3D) { const k = NusKnot3D.mount(cv); cv.parentElement.addEventListener("mouseenter", () => k.setState && k.setState("listening")); cv.parentElement.addEventListener("mouseleave", () => k.setState && k.setState("idle")); }
  }
  function footer(root) {
    root.innerHTML = `<div class="top">
      <div class="brand">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <img src="assets/app_icon.png" width="28" height="28" alt="ClipoTxt" style="border-radius:6px;display:block">
          <b style="font-size:20px">ClipoTxt</b>
        </div>
        <p>Copy. Extract. <em>Paste.</em> Local on-device screenshot-to-text OCR utility for Windows.</p>
        <div class="status mono"><span>ClipoTxt 1.0.3 for Windows 10 & 11 (64-bit)</span><span>RapidOCR • PP-OCRv4 ONNX CPU</span></div>
      </div>
      <div><h4 class="mono">Get it</h4><ul><li><a href="${L.installer}">Windows Installer (v1.0.3)</a></li><li><a href="${L.portable}">Portable ZIP</a></li><li><a href="${L.releases}">All releases</a></li><li><a href="https://github.com/cvfoliox-dev/clipotxt-releases/releases/tag/v1.0.3">Release notes</a></li></ul></div>
      <div><h4 class="mono">Set up</h4><ul><li><a href="#setup">Setup guide</a></li><li><a href="#pricing">Free & Local</a></li><li><a href="#faq">Questions & Answers</a></li><li><a href="#next">How it works</a></li></ul></div>
      <div><h4 class="mono">Open</h4><ul><li><a href="${L.repo}">GitHub Releases</a></li><li><a href="${L.releases}">SHA256SUMS.txt</a></li><li><a href="#now">Privacy & Architecture</a></li></ul></div>
      <div><h4 class="mono">Talk to us</h4><ul><li><a href="mailto:bharathtommandru1@gmail.com">Email Bharath</a></li><li><a href="#feedback">Give feedback</a></li><li><a href="#now">Roadmap</a></li></ul></div></div>
      <div class="meta"><span>ClipoTxt, 2026</span><span>Your screenshots stay on your computer. 100% local OCR processing.</span></div>
      <div class="mark" aria-hidden="true"><div class="w" style="font-size:18vw">CLIPOTXT</div><div class="m" style="display:none"></div></div>`;
    const mark = root.querySelector(".mark");
    const w = mark.querySelector(".w"), m = mark.querySelector(".m");
    function placeMacron() {
      if (!m || m.style.display === "none") return;
      const rg = document.createRange(); rg.setStart(w.firstChild, 1); rg.setEnd(w.firstChild, 2); const u = rg.getBoundingClientRect(), mr = mark.getBoundingClientRect();
      if (!u.width) return; const mw = u.width * 0.5; m.style.left = u.left - mr.left + (u.width - mw) / 2 + "px"; m.style.width = mw + "px";
    }
    let rise = -1;
    function onScroll() { const r = mark.getBoundingClientRect(), v = reduce ? 1 : +clamp((innerHeight - r.top) / (r.height + 200)).toFixed(3); if (v !== rise) mark.style.setProperty("--rise", (rise = v)); }
    addEventListener("resize", placeMacron); (document.fonts ? document.fonts.ready : Promise.resolve()).then(placeMacron); placeMacron();
    let near = false; new IntersectionObserver((es) => { near = es[0].isIntersecting; if (near) onScroll(); }, { rootMargin: "100% 0px" }).observe(mark);
    addEventListener("scroll", () => near && onScroll(), { passive: true }); addEventListener("resize", onScroll); onScroll();
  }
  window.NusEnd = { mount: (el, kind) => ({ full, words, card })[kind](el), footer };
})();
