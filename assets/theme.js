// Applies the light or dark theme before the page draws, and wires up the
// header's theme button. With no stored choice the page follows the system
// setting. Loaded in <head> without defer, so the page never flashes the
// wrong theme.

(function () {
  var root = document.documentElement;
  var system = matchMedia("(prefers-color-scheme: dark)");
  var button = null;
  var stored = null;

  try {
    stored = localStorage.getItem("theme");
  } catch (e) {}

  function apply() {
    root.dataset.theme = stored || (system.matches ? "dark" : "light");
    if (button) {
      button.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
    }
  }

  apply();

  system.addEventListener("change", function () {
    if (!stored) apply();
  });

  document.addEventListener("DOMContentLoaded", function () {
    button = document.querySelector(".theme-toggle");
    if (!button) return;
    button.hidden = false;
    apply();

    button.addEventListener("click", function () {
      stored = root.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", stored);
      } catch (e) {}
      apply();
    });
  });
})();
