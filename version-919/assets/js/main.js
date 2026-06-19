(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      showSlide((current + 1) % slides.length);
    }, 5200);
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 500);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
  searchForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[type="search"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = './library.html';
      }
    });
  });

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var input = document.querySelector('[data-library-search]');
  var resultCount = document.querySelector('[data-result-count]');
  var empty = document.querySelector('[data-empty-result]');
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var state = {
    text: '',
    genre: '',
    year: '',
    region: ''
  };

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function updateButtons(type, value) {
    filters.forEach(function (button) {
      if (button.getAttribute('data-filter') === type) {
        button.classList.toggle('is-active', button.getAttribute('data-value') === value);
      }
    });
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchedText = !state.text || haystack.indexOf(normalize(state.text)) !== -1;
      var matchedGenre = !state.genre || normalize(card.getAttribute('data-genre')).indexOf(normalize(state.genre)) !== -1;
      var matchedYear = !state.year || card.getAttribute('data-year') === state.year;
      var matchedRegion = !state.region || card.getAttribute('data-region') === state.region;
      var matched = matchedText && matchedGenre && matchedYear && matchedRegion;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });
    if (resultCount) {
      resultCount.textContent = visible ? '匹配 ' + visible + ' 部' : '暂无匹配';
    }
    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  if (input && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;
    state.text = query;
    input.addEventListener('input', function () {
      state.text = input.value;
      applyFilters();
    });
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        var type = button.getAttribute('data-filter');
        var value = button.getAttribute('data-value') || '';
        state[type] = value;
        updateButtons(type, value);
        applyFilters();
      });
    });
    applyFilters();
  }

  Array.prototype.slice.call(document.querySelectorAll('img')).forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
    });
  });
}());
