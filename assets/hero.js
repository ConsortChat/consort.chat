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
  // page, 1 once the top 70% of it has scrolled off, matching the
  // exit-crossing range in style.css. Browsers with scroll-driven animations
  // set it there.
  if (!CSS.supports("animation-timeline: view()")) {
    var pending = false;

    var update = function () {
      pending = false;
      var progress = -copy.getBoundingClientRect().top / (copy.offsetHeight * 0.7);
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
  // away from the viewer. The tilt moves like a critically damped spring,
  // so it speeds up and slows down smoothly and never overshoots. It gets
  // most of the way to the mouse in about FOLLOW seconds, and when the
  // mouse leaves it drifts back to flat, most of the way in about RETURN
  // seconds, instead of snapping away.
  var TILT = 6;
  var FOLLOW = 0.12;
  var RETURN = 0.6;
  var target = { x: 0, y: 0 };
  var current = { x: 0, y: 0 };
  var velocity = { x: 0, y: 0 };
  var settle = FOLLOW;
  var frame = 0;
  var last = 0;

  function render() {
    var x = current.x;
    var y = current.y;
    scene.style.setProperty("--tilt-x", String(-y));
    scene.style.setProperty("--tilt-y", String(x || 0.001));
    scene.style.setProperty("--tilt", Math.min(Math.hypot(x, y), 1) * TILT + "deg");
  }

  function step(time) {
    // Frame-rate independent: the same feel at 60Hz and 144Hz.
    var dt = last ? Math.min((time - last) / 1000, 0.1) : 1 / 60;
    last = time;

    // The spring covers 63% of a step in 2.15 / omega seconds. Small fixed
    // substeps keep it stable after a long frame.
    var omega = 2.15 / settle;
    var steps = Math.ceil(dt * 240);
    var h = dt / steps;
    for (var i = 0; i < steps; i++) {
      velocity.x += (omega * omega * (target.x - current.x) - 2 * omega * velocity.x) * h;
      velocity.y += (omega * omega * (target.y - current.y) - 2 * omega * velocity.y) * h;
      current.x += velocity.x * h;
      current.y += velocity.y * h;
    }

    if (
      Math.abs(target.x - current.x) < 0.001 && Math.abs(target.y - current.y) < 0.001 &&
      Math.abs(velocity.x) < 0.01 && Math.abs(velocity.y) < 0.01
    ) {
      current.x = target.x;
      current.y = target.y;
      velocity.x = 0;
      velocity.y = 0;
      render();
      frame = 0;
      last = 0;
      return;
    }

    render();
    frame = requestAnimationFrame(step);
  }

  function moveTo(x, y, time) {
    target.x = x;
    target.y = y;
    settle = time;
    if (!frame) frame = requestAnimationFrame(step);
  }

  // The page's content scrolls over the stage, and over it the scene goes
  // flat, even where the content lets the mouse through to the stage or
  // the stage reaches past the content's sides. Scrolling moves the
  // content under a still mouse, so it checks again then.
  var content = document.querySelector(".stage-wrap + .wrap");
  var pointer = null;

  function follow() {
    if (content && pointer.y >= content.getBoundingClientRect().top) {
      moveTo(0, 0, RETURN);
      return;
    }
    var box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    moveTo(
      clamp(((pointer.x - box.left) / box.width) * 2 - 1, -1, 1),
      clamp(((pointer.y - box.top) / box.height) * 2 - 1, -1, 1),
      FOLLOW
    );
  }

  stage.addEventListener("pointermove", function (event) {
    if (event.pointerType !== "mouse") return;
    pointer = { x: event.clientX, y: event.clientY };
    follow();
  });

  stage.addEventListener("pointerleave", function () {
    pointer = null;
    moveTo(0, 0, RETURN);
  });

  addEventListener("scroll", function () {
    if (pointer) follow();
  }, { passive: true });

  // Minimize shrinks the call into the dock under the message box, and
  // Restore brings it back.
  scene.addEventListener("click", function (event) {
    var button = event.target.closest("[data-call]");
    if (button) {
      scene.classList.toggle("call-minimized", button.dataset.call === "minimize");
    }
  });
})();
