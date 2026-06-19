(function () {
  const body = document.body;
  const base = body ? body.dataset.base || "" : "";
  const movies = Array.isArray(window.SiteMovies) ? window.SiteMovies : [];

  function joinPath(path) {
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    return base + path;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>\"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initMenu() {
    const button = document.querySelector("[data-menu-toggle]");
    const panel = document.querySelector("[data-mobile-menu]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function renderSearchResults(input, panel, results) {
    if (!input.value.trim() || results.length === 0) {
      panel.classList.remove("is-open");
      panel.innerHTML = "";
      return;
    }
    panel.innerHTML = results.slice(0, 8).map(function (item) {
      const image = escapeHTML(joinPath(item.cover));
      const url = escapeHTML(joinPath(item.url));
      const title = escapeHTML(item.title);
      const meta = escapeHTML(item.year + " · " + item.region + " · " + item.genre);
      return [
        "<a class=\"search-result-item\" href=\"" + url + "\">",
        "<img class=\"search-result-thumb\" src=\"" + image + "\" alt=\"" + title + "\">",
        "<span>",
        "<span class=\"search-result-title\">" + title + "</span>",
        "<span class=\"search-result-meta\">" + meta + "</span>",
        "</span>",
        "</a>"
      ].join("");
    }).join("");
    panel.classList.add("is-open");
  }

  function initGlobalSearch() {
    const inputs = document.querySelectorAll("[data-site-search]");
    inputs.forEach(function (input) {
      const panel = input.parentElement.querySelector("[data-search-results]");
      if (!panel) {
        return;
      }
      input.addEventListener("input", function () {
        const query = input.value.trim().toLowerCase();
        const results = movies.filter(function (item) {
          return item.keywords.toLowerCase().includes(query);
        });
        renderSearchResults(input, panel, results);
      });
      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          const query = input.value.trim().toLowerCase();
          const first = movies.find(function (item) {
            return item.keywords.toLowerCase().includes(query);
          });
          if (first) {
            event.preventDefault();
            window.location.href = joinPath(first.url);
          }
        }
      });
      document.addEventListener("click", function (event) {
        if (!input.parentElement.contains(event.target)) {
          panel.classList.remove("is-open");
        }
      });
    });
  }

  function initHero() {
    const root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function initFilters() {
    const panels = document.querySelectorAll(".filter-panel");
    panels.forEach(function (panel) {
      const input = panel.querySelector("[data-filter-input]");
      const buttons = Array.from(panel.querySelectorAll("[data-filter-button]"));
      const section = panel.closest("section") || document;
      const localCards = Array.from(section.querySelectorAll("[data-card]"));
      const cards = localCards.length ? localCards : Array.from(document.querySelectorAll("[data-card]"));
      const empty = section.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
      let active = "all";

      function apply() {
        const query = input ? input.value.trim().toLowerCase() : "";
        let visible = 0;
        cards.forEach(function (card) {
          const matchesKind = active === "all" || card.dataset.kind === active;
          const matchesText = !query || (card.dataset.search || "").toLowerCase().includes(query);
          const shouldShow = matchesKind && matchesText;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          active = button.dataset.filter || "all";
          apply();
        });
      });

      if (input) {
        input.addEventListener("input", apply);
      }
    });
  }

  function initPlayers() {
    const boxes = document.querySelectorAll("[data-player]");
    boxes.forEach(function (box) {
      const video = box.querySelector("video[data-hls]");
      const button = box.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }
      const url = video.dataset.hls;
      let attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function play() {
        attach();
        button.classList.add("is-hidden");
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!attached) {
          play();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initGlobalSearch();
    initHero();
    initFilters();
    initPlayers();
  });
})();
