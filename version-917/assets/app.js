(function () {
  function queryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-btn]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  queryAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      if (!value) {
        event.preventDefault();
      }
    });
  });

  queryAll('[data-hero]').forEach(function (hero) {
    var slides = queryAll('[data-hero-slide]', hero);
    var dots = queryAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  });

  queryAll('[data-catalog]').forEach(function (catalog) {
    var searchInput = catalog.querySelector('[data-filter-search]');
    var yearSelect = catalog.querySelector('[data-filter-year]');
    var typeSelect = catalog.querySelector('[data-filter-type]');
    var resetButton = catalog.querySelector('[data-filter-reset]');
    var cards = queryAll('.movie-card', catalog);
    var empty = catalog.querySelector('[data-empty-state]');

    if (catalog.hasAttribute('data-search-page') && searchInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      searchInput.value = q;
    }

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !year || card.dataset.year === year;
        var matchType = !type || card.dataset.type === type;
        var ok = matchKeyword && matchYear && matchType;
        card.classList.toggle('is-hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', filterCards);
    }
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        filterCards();
      });
    }

    filterCards();
  });

  queryAll('[data-rank-page]').forEach(function (page) {
    var input = page.querySelector('[data-rank-search]');
    var items = queryAll('[data-rank-list] li', page);
    var empty = page.querySelector('[data-rank-empty]');

    function filterRank() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;
      items.forEach(function (item) {
        var text = [item.dataset.title, item.dataset.region, item.dataset.year, item.dataset.type, item.dataset.genre, item.textContent].join(' ').toLowerCase();
        var ok = !keyword || text.indexOf(keyword) !== -1;
        item.classList.toggle('is-hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', filterRank);
      filterRank();
    }
  });

  queryAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-play');
    var started = false;
    var hlsInstance = null;

    function start() {
      if (!video || !stream) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {});
          }, { once: true });
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
        }
      }
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
