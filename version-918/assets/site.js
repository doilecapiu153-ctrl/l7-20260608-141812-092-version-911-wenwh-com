(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function clean(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function toggleHeader() {
        var header = $(".site-header");
        var button = $(".mobile-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = $("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = $all(".hero-slide", hero);
        var dots = $all(".hero-dots button", hero);
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(i);
                start();
            });
        });
        start();
    }

    function cardText(card) {
        return clean([
            card.dataset.title,
            card.dataset.category,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.textContent
        ].join(" "));
    }

    function setupFilters() {
        var page = $("[data-filter-page]");
        if (!page) {
            return;
        }
        var cards = $all(".movie-card", page);
        var queryInput = $("[data-filter-query]", page);
        var categorySelect = $("[data-filter-category]", page);
        var yearSelect = $("[data-filter-year]", page);
        var empty = $(".empty-state", page);
        var params = new URLSearchParams(window.location.search);
        var firstQuery = params.get("q");
        if (firstQuery && queryInput) {
            queryInput.value = firstQuery;
        }
        function filter() {
            var query = clean(queryInput && queryInput.value);
            var category = clean(categorySelect && categorySelect.value);
            var year = clean(yearSelect && yearSelect.value);
            var visible = 0;
            cards.forEach(function (card) {
                var okQuery = !query || cardText(card).indexOf(query) >= 0;
                var okCategory = !category || clean(card.dataset.category) === category;
                var okYear = !year || clean(card.dataset.year) === year;
                var ok = okQuery && okCategory && okYear;
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }
        [queryInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", filter);
                control.addEventListener("change", filter);
            }
        });
        filter();
    }

    window.initMoviePlayer = function (streamUrl) {
        var holder = $("[data-player]");
        if (!holder) {
            return;
        }
        var video = $("video", holder);
        var trigger = $(".player-trigger", holder);
        var started = false;
        var hlsInstance = null;
        function attach() {
            if (started || !video) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            holder.classList.add("is-playing");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }
        if (trigger) {
            trigger.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!started) {
                    play();
                }
            });
        }
        window.addEventListener("pagehide", function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        toggleHeader();
        setupHero();
        setupFilters();
    });
})();
