(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");

    if (navToggle && mainNav) {
      navToggle.addEventListener("click", function () {
        mainNav.classList.toggle("is-open");
      });
    }

    var redirectForms = document.querySelectorAll("[data-search-redirect]");
    redirectForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = "./search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });

    var hero = document.querySelector("[data-hero-slider]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5800);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }

    var localForms = document.querySelectorAll("[data-local-search]");
    var activeType = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applyLocalSearch(scope) {
      var input = scope.querySelector("input[type='search']") || document.querySelector("[data-global-search-input]");
      var list = document.querySelector("[data-search-list]");
      var empty = document.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var query = normalize(input ? input.value : "");
      var visible = 0;
      Array.prototype.slice.call(list.querySelectorAll(".movie-card")).forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var type = card.getAttribute("data-type") || "";
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesType = activeType === "all" || type === activeType;
        var matched = matchesText && matchesType;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    localForms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyLocalSearch(document);
      });
      if (input) {
        input.addEventListener("input", function () {
          applyLocalSearch(document);
        });
      }
    });

    var filterRow = document.querySelector("[data-filter-row]");
    if (filterRow) {
      filterRow.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter-type]");
        if (!button) {
          return;
        }
        activeType = button.getAttribute("data-filter-type") || "all";
        Array.prototype.slice.call(filterRow.querySelectorAll("[data-filter-type]")).forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyLocalSearch(document);
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var globalInput = document.querySelector("[data-global-search-input]");
    if (query && globalInput) {
      globalInput.value = query;
      applyLocalSearch(document);
    }
  });
})();
