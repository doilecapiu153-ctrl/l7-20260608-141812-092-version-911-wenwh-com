(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupNav() {
        var button = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var previous = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function move(step) {
            show(index + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupGlobalSearch() {
        var input = document.getElementById('globalSearch');
        var box = document.getElementById('searchResults');
        var list = window.MovieSearchData || [];
        if (!input || !box || !list.length) {
            return;
        }

        function render(items) {
            box.innerHTML = items.slice(0, 24).map(function (item) {
                return '<a class="search-result" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
                    '<span><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.region) + ' · ' + item.year + ' · ' + escapeHtml(item.genre) + '</small></span>' +
                    '</a>';
            }).join('');
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();
            if (!keyword) {
                box.innerHTML = '';
                return;
            }
            render(list.filter(function (item) {
                return String(item.title).toLowerCase().indexOf(keyword) > -1 ||
                    String(item.region).toLowerCase().indexOf(keyword) > -1 ||
                    String(item.genre).toLowerCase().indexOf(keyword) > -1 ||
                    String(item.year).indexOf(keyword) > -1;
            }));
        });
    }

    function setupCardFilter() {
        var input = document.querySelector('.filter-input');
        var year = document.querySelector('.filter-year');
        var region = document.querySelector('.filter-region');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.card-filter-scope .movie-card'));
        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    matched = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    matched = false;
                }
                card.classList.toggle('hide-card', !matched);
            });
        }

        [input, year, region].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    ready(function () {
        setupNav();
        setupHero();
        setupGlobalSearch();
        setupCardFilter();
    });
})();
