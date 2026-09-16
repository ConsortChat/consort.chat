// The home page hero, for what CSS can't do on its own: holding the app
// mockup where it rests from the first scroll and sizing the scroll effect
// to fit, the scroll effect itself in browsers without CSS scroll-driven
// animations (Firefox), a tilt of the mockup toward the mouse, pausing the
// speaking rings under the page's glass, and the call's dragging,
// Minimize, and Restore interactions.

(function () {
  var main = document.querySelector("main");
  var copy = document.querySelector(".hero-copy");
  var stage = document.querySelector(".stage");
  var scene = document.querySelector(".scene");
  if (!main || !copy || !stage || !scene) return;

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  // Sets the stage's sticky top to its resting distance from the top of the
  // page, so it's held there from the first scroll while the page's content
  // scrolls up over it. In a window too short to show half the stage there,
  // it's held higher. The scroll effect in style.css runs over the space
  // between the header and the stage (--hero-travel), while the stage rises
  // half of it (--hero-rise), so it starts rising at the page's speed and
  // eases to a stop. All of it follows the hero's height, so it's measured
  // again when the hero resizes. Without this, style.css holds the stage
  // mid-window and uses default distances. Values are whole pixels and
  // only written when they change: a phone's address bar resizes the
  // window over and over as it collapses, and rewriting them each time
  // would restyle the page mid-scroll. It also sets --header-height, under
  // which the hero's text is held (see .hero-hold).
  var stageWrap = document.querySelector(".stage-wrap");
  var hero = document.querySelector(".hero");
  var header = document.querySelector(".site-header");
  var travel = 0;
  var fade = 0;
  var headerHeight = -1;

  function pin() {
    var rest = hero.getBoundingClientRect().bottom + scrollY +
      parseFloat(getComputedStyle(stageWrap).marginTop);
    var top = Math.floor(Math.min(rest, Math.max(0, innerHeight - stage.offsetHeight / 2)));
    // Exact, not rounded: the text rests at a fraction of a pixel, and
    // holding it a fraction lower would shift it.
    var height = header ? header.getBoundingClientRect().height : 0;
    var next = Math.max(2, top - Math.round(height));
    if (stageWrap.style.top !== top + "px") stageWrap.style.top = top + "px";
    if (height !== headerHeight) {
      headerHeight = height;
      main.style.setProperty("--header-height", height + "px");
    }
    if (next !== travel) {
      travel = next;
      main.style.setProperty("--hero-travel", travel + "px");
      main.style.setProperty("--hero-rise", travel / 2 + "px");
    }
    // The text fades over the same distance, or the space it's held in
    // where that's shorter, as --hero-fade does in style.css.
    var hold = parseFloat(getComputedStyle(copy, "::after").height) || travel;
    fade = Math.max(1, Math.min(travel, Math.floor(hold)));
  }

  if (stageWrap && hero) {
    pin();
    new ResizeObserver(pin).observe(hero);
    addEventListener("resize", pin);
  }

  // Sets --hero-scroll on the stage, the call and the voice panel, from 0
  // at the top of the page to 1 once it has scrolled --hero-travel, and on
  // the text, to 1 once it has scrolled its fade, and hides the text once
  // it has faded, matching the scroll-driven animations in style.css,
  // which do all of it in browsers that have them. Each is written only
  // when it changes, and restyles only its own element.
  if (!CSS.supports("animation-timeline: scroll()")) {
    var pending = false;
    var moving = [stage, scene.querySelector(".call"), scene.querySelector(".callout")];
    var risen = -1;
    var faded = -1;

    var update = function () {
      pending = false;
      var progress = travel ? clamp(scrollY / travel, 0, 1) : 0;
      var fading = fade ? clamp(scrollY / fade, 0, 1) : 0;
      if (progress !== risen) {
        risen = progress;
        moving.forEach(function (el) {
          if (el) el.style.setProperty("--hero-scroll", progress);
        });
      }
      if (fading !== faded) {
        faded = fading;
        copy.style.setProperty("--hero-scroll", fading);
        copy.style.visibility = fading < 1 ? "" : "hidden";
      }
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
    if (event.pointerType !== "mouse" || scene.classList.contains("call-dragging")) return;
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

  // Pauses the speaking rings once the glass is at full strength over all
  // of them, at the first heading. They barely show through it, and while
  // anything under the glass changes, the browser blurs the window again
  // every frame.
  var rings = scene.querySelectorAll(".ring");
  var heading = content && content.querySelector("h2");
  var checking = false;

  function cover() {
    checking = false;
    var top = Infinity;
    rings.forEach(function (ring) {
      top = Math.min(top, ring.getBoundingClientRect().top);
    });
    scene.classList.toggle("rings-paused", heading.getBoundingClientRect().top <= top);
  }

  if (heading && rings.length) {
    addEventListener("scroll", function () {
      if (!checking) {
        checking = true;
        requestAnimationFrame(cover);
      }
    }, { passive: true });
    addEventListener("resize", cover);
    cover();
  }

  // Drag the floating call by its header. The whole mockup is scaled,
  // tilted, and drawn in perspective, so screen pixels do not line up with
  // the call's own x and y axes. Measure those projected axes once at the
  // start of each drag, then invert them so the header follows the pointer
  // in screen space. Store the result in em so a dragged call stays in the
  // same relative place if the responsive mockup changes size.
  var call = scene.querySelector(".call");
  var callHead = call && call.querySelector(".call-head");
  var callAnchor = call && document.createElement("span");
  var drag = { x: 0, y: 0 };
  if (callAnchor) {
    callAnchor.className = "call-drag-anchor";
    call.appendChild(callAnchor);
  }

  function anchorPoint() {
    var box = callAnchor.getBoundingClientRect();
    return { x: box.left, y: box.top };
  }

  function setCallPosition(x, y) {
    drag.x = x;
    drag.y = y;
    call.style.setProperty("--call-drag-x", x + "em");
    call.style.setProperty("--call-drag-y", y + "em");
  }

  // Return the homography from a square on the call's local plane to its
  // projected quadrilateral on screen. Unlike a pair of axis vectors, this
  // remains exact when perspective makes the call grow or shrink as it
  // crosses the scene.
  function projectedCallPlane() {
    var PROBE = 10;
    var originX = drag.x;
    var originY = drag.y;
    var p0 = anchorPoint();

    setCallPosition(originX + PROBE, originY);
    var p1 = anchorPoint();
    setCallPosition(originX + PROBE, originY + PROBE);
    var p2 = anchorPoint();
    setCallPosition(originX, originY + PROBE);
    var p3 = anchorPoint();
    setCallPosition(originX, originY);

    var dx1 = p1.x - p2.x;
    var dx2 = p3.x - p2.x;
    var dy1 = p1.y - p2.y;
    var dy2 = p3.y - p2.y;
    var sx = p0.x - p1.x + p2.x - p3.x;
    var sy = p0.y - p1.y + p2.y - p3.y;
    var denominator = dx1 * dy2 - dx2 * dy1;
    var g = denominator ? (sx * dy2 - dx2 * sy) / denominator : 0;
    var h = denominator ? (dx1 * sy - sx * dy1) / denominator : 0;

    return {
      probe: PROBE,
      matrix: [
        p1.x - p0.x + g * p1.x, p3.x - p0.x + h * p3.x, p0.x,
        p1.y - p0.y + g * p1.y, p3.y - p0.y + h * p3.y, p0.y,
        g, h, 1
      ],
      origin: p0
    };
  }

  function invertMatrix(m) {
    var determinant =
      m[0] * (m[4] * m[8] - m[5] * m[7]) -
      m[1] * (m[3] * m[8] - m[5] * m[6]) +
      m[2] * (m[3] * m[7] - m[4] * m[6]);
    if (Math.abs(determinant) < 0.001) return null;

    return [
      (m[4] * m[8] - m[5] * m[7]) / determinant,
      (m[2] * m[7] - m[1] * m[8]) / determinant,
      (m[1] * m[5] - m[2] * m[4]) / determinant,
      (m[5] * m[6] - m[3] * m[8]) / determinant,
      (m[0] * m[8] - m[2] * m[6]) / determinant,
      (m[2] * m[3] - m[0] * m[5]) / determinant,
      (m[3] * m[7] - m[4] * m[6]) / determinant,
      (m[1] * m[6] - m[0] * m[7]) / determinant,
      (m[0] * m[4] - m[1] * m[3]) / determinant
    ];
  }

  function unproject(point, inverse, probe) {
    var w = inverse[6] * point.x + inverse[7] * point.y + inverse[8];
    if (Math.abs(w) < 0.001) return null;
    var local = {
      x: (inverse[0] * point.x + inverse[1] * point.y + inverse[2]) / w * probe,
      y: (inverse[3] * point.x + inverse[4] * point.y + inverse[5]) / w * probe
    };
    return Number.isFinite(local.x) && Number.isFinite(local.y) ? local : null;
  }

  if (callHead) {
    callHead.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || event.target.closest(".pill")) return;

      var start = { pointerX: event.clientX, pointerY: event.clientY, x: drag.x, y: drag.y };
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      target.x = current.x;
      target.y = current.y;
      velocity.x = 0;
      velocity.y = 0;
      var plane = projectedCallPlane();
      var inverse = invertMatrix(plane.matrix);
      if (!inverse) return;

      callHead.setPointerCapture(event.pointerId);
      scene.classList.add("call-dragging");

      function move(moveEvent) {
        pointer = { x: moveEvent.clientX, y: moveEvent.clientY };
        var screenX = moveEvent.clientX - start.pointerX;
        var screenY = moveEvent.clientY - start.pointerY;
        var local = unproject({
          x: plane.origin.x + screenX,
          y: plane.origin.y + screenY
        }, inverse, plane.probe);
        if (!local) return;
        setCallPosition(start.x + local.x, start.y + local.y);
      }

      function stop() {
        scene.classList.remove("call-dragging");
        if (pointer) follow();
        callHead.removeEventListener("pointermove", move);
        callHead.removeEventListener("pointerup", stop);
        callHead.removeEventListener("pointercancel", stop);
        callHead.removeEventListener("lostpointercapture", stop);
      }

      callHead.addEventListener("pointermove", move);
      callHead.addEventListener("pointerup", stop);
      callHead.addEventListener("pointercancel", stop);
      callHead.addEventListener("lostpointercapture", stop);
      event.preventDefault();
    });
  }

  // Minimize shrinks the call into the dock under the message box, and
  // Restore brings it back.
  scene.addEventListener("click", function (event) {
    var button = event.target.closest("[data-call]");
    if (button) {
      scene.classList.toggle("call-minimized", button.dataset.call === "minimize");
    }
  });
})();
