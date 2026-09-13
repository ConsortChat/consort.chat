// The home page hero, for what CSS can't do on its own: the scroll effect
// in browsers without CSS scroll-driven animations (Firefox), a faint tilt
// of the app mockup toward the mouse, and the call's Minimize and Restore
// buttons.

(function () {
  var main = document.querySelector("main");
  var copy = document.querySelector(".hero-copy");
  var stage = document.querySelector(".stage");
  var scene = document.querySelector(".scene");
  if (!main || !copy || !stage || !scene) return;

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  // Sets --hero-scroll on <main>: 0 until the text reaches the top of the
  // page, 1 once it has scrolled off, matching the exit-crossing range in
  // style.css. Browsers with scroll-driven animations set it there.
  if (!CSS.supports("animation-timeline: view()")) {
    var pending = false;

    var update = function () {
      pending = false;
      var progress = -copy.getBoundingClientRect().top / copy.offsetHeight;
      main.style.setProperty("--hero-scroll", clamp(progress, 0, 1));
    };

    var schedule = function () {
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    };

    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
  }

  // Tilts the scene up to TILT degrees, pressing the side under the mouse
  // away from the viewer.
  var TILT = 2.5;

  stage.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;
    var box = stage.getBoundingClientRect();
    var x = clamp(((event.clientX - box.left) / box.width) * 2 - 1, -1, 1);
    var y = clamp(((event.clientY - box.top) / box.height) * 2 - 1, -1, 1);
    scene.style.setProperty("--tilt-x", String(-y));
    scene.style.setProperty("--tilt-y", String(x || 0.001));
    scene.style.setProperty("--tilt", Math.min(Math.hypot(x, y), 1) * TILT + "deg");
  });

  stage.addEventListener("pointerleave", function () {
    scene.style.setProperty("--tilt", "0deg");
  });

  // Minimize shrinks the call into the dock under the message box, and
  // Restore brings it back.
  scene.addEventListener("click", function (event) {
    var button = event.target.closest("[data-call]");
    if (button) {
      scene.classList.toggle("call-minimized", button.dataset.call === "minimize");
    }
  });
})();
