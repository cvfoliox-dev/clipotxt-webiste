/* ClipoTxt Interactive Product Demonstration Entry Point
   Exposes window.NusLesson backed by ClipoDemo.InteractiveDemo so index.html initialization remains intact. */
(function () {
  function NusLesson(root) {
    if (!root || !window.ClipoDemo || !window.ClipoDemo.InteractiveDemo) return;
    return window.ClipoDemo.InteractiveDemo(root);
  }
  window.NusLesson = NusLesson;
})();
