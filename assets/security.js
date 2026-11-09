/**
 * ClipoTxt Client-Side Code & Asset Protection Gates
 * Enforces anti-scraping, anti-inspection, and keyboard shortcut protection.
 */
(function () {
  "use strict";

  // 1. Disable Right-Click Context Menu
  document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Block DevTools & Source Inspection Shortcuts
  document.addEventListener("keydown", function (e) {
    // F12 (DevTools)
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect/Console)
    if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+U (View Page Source)
    if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+S (Save Web Page)
    if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Prevent dragging on media and sensitive UI elements
  document.addEventListener("dragstart", function (e) {
    if (e.target.tagName === "IMG" || e.target.tagName === "CANVAS" || e.target.tagName === "VIDEO") {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  // 4. Console Security Banner
  try {
    const bannerTitle = "color: #8cc152; font-size: 22px; font-weight: 800; text-shadow: 0 0 10px rgba(140,193,82,0.5);";
    const bannerBody = "color: #eef0fa; font-size: 13px; line-height: 1.6;";
    setTimeout(function () {
      console.clear();
      console.log("%c🛡️ ClipoTxt Official — Protected Software", bannerTitle);
      console.log(
        "%cCreated by Bharath Thommandru.\nAll rights reserved. Unauthorized reproduction, scraping, or extraction of assets is strictly prohibited.",
        bannerBody
      );
    }, 1000);
  } catch (err) {}
})();

