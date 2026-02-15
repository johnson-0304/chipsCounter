// Theme switcher - persist and apply theme
(function () {
  var saved = localStorage.getItem("theme");
  if (saved && saved !== "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var radios = document.querySelectorAll('input[name="theme"]');
    var saved = localStorage.getItem("theme");

    if (saved) {
      if (saved !== "dark") {
        document.documentElement.setAttribute("data-theme", saved);
      }
      radios.forEach(function (r) {
        r.checked = r.value === saved;
      });
    }

    radios.forEach(function (radio) {
      radio.addEventListener("change", function () {
        var val = this.value;
        if (val === "dark") {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", val);
        }
        localStorage.setItem("theme", val);
      });
    });
  });
})();
