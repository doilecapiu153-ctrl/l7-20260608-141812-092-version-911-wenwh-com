(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMenu() {
        var header = $(".site-header");
        var button = $(".menu-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var root = $("#heroCarousel");
        if (!root) {
            return;
        }
        var slides = $all(".hero-slide", root);
        var dots = $all(".hero-dot", root);
        var prev = $(".hero-prev", root);
        var next = $(".hero-next", root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

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
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        $all("[data-filter-scope]").forEach(function (scope) {
            var input = $("[data-filter-input]", scope);
            var typeSelect = $("[data-type-filter]", scope);
            var yearSelect = $("[data-year-filter]", scope);
            var cards = $all("[data-movie-card]", scope);
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";

            if (input && scope.hasAttribute("data-query-page")) {
                input.value = query;
            }

            function apply() {
                var keyword = normalize(input ? input.value : "");
                var typeValue = normalize(typeSelect ? typeSelect.value : "");
                var yearValue = normalize(yearSelect ? yearSelect.value : "");
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute("data-search"));
                    var type = normalize(card.getAttribute("data-type"));
                    var year = normalize(card.getAttribute("data-year"));
                    var matched = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && type !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && year !== yearValue) {
                        matched = false;
                    }
                    card.style.display = matched ? "" : "none";
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }
            if (yearSelect) {
                yearSelect.addEventListener("change", apply);
            }
            apply();
        });
    }

    function initMoviePlayer(videoId, layerId, sourceUrl) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var attached = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            attached = true;
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    if (layer) {
                        layer.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.initMoviePlayer = initMoviePlayer;
})();
