(function () {
  function closestScope(element) {
    return element.closest('[data-filter-scope]') || document;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateFilters(scope) {
    var root = scope === document ? document : scope.parentElement || document;
    var searchInput = scope.querySelector('[data-search-input]');
    var query = normalize(searchInput ? searchInput.value : '');
    var filters = {};
    scope.querySelectorAll('[data-filter-type].active').forEach(function (button) {
      filters[button.dataset.filterType] = button.dataset.filterValue;
    });
    var cards = root.querySelectorAll('[data-card]');
    var visibleCount = 0;
    cards.forEach(function (card) {
      var matched = true;
      if (query && normalize(card.dataset.search).indexOf(query) === -1) {
        matched = false;
      }
      Object.keys(filters).forEach(function (key) {
        var value = filters[key];
        if (value && value !== 'all' && String(card.dataset[key]) !== value) {
          matched = false;
        }
      });
      card.classList.toggle('hidden', !matched);
      if (matched) {
        visibleCount += 1;
      }
    });
    var emptyState = root.querySelector('[data-empty-state]');
    if (emptyState) {
      emptyState.classList.toggle('show', visibleCount === 0);
    }
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  document.querySelectorAll('[data-menu-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var nav = document.querySelector('[data-mobile-nav]');
      if (nav) {
        nav.classList.toggle('open');
      }
    });
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    scope.querySelectorAll('[data-filter-type]').forEach(function (button) {
      button.addEventListener('click', function () {
        var type = button.dataset.filterType;
        scope.querySelectorAll('[data-filter-type="' + type + '"]').forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        updateFilters(scope);
      });
    });
    scope.querySelectorAll('[data-search-input]').forEach(function (input) {
      input.addEventListener('input', function () {
        updateFilters(scope);
      });
    });
    scope.querySelectorAll('[data-clear-filters]').forEach(function (button) {
      button.addEventListener('click', function () {
        var input = scope.querySelector('[data-search-input]');
        if (input) {
          input.value = '';
        }
        scope.querySelectorAll('[data-filter-type]').forEach(function (item) {
          item.classList.toggle('active', item.dataset.filterValue === 'all');
        });
        updateFilters(scope);
      });
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot));
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  });

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var track = rail.querySelector('[data-rail-track]');
    var left = rail.querySelector('[data-rail-left]');
    var right = rail.querySelector('[data-rail-right]');
    function move(direction) {
      if (track) {
        track.scrollBy({
          left: direction * Math.min(520, track.clientWidth * 0.75),
          behavior: 'smooth'
        });
      }
    }
    if (left) {
      left.addEventListener('click', function () {
        move(-1);
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        move(1);
      });
    }
  });
})();
