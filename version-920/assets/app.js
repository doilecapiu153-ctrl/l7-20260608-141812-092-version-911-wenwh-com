(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var root = document.querySelector(".hero-carousel");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var active = slides.findIndex(function (slide) {
            return slide.classList.contains("is-active");
        });
        if (active < 0) {
            active = 0;
        }
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-targets .movie-card"));
        if (!panel || !cards.length) {
            return;
        }
        var search = panel.querySelector(".local-search");
        var empty = document.querySelector(".empty-state");
        var state = {
            category: "all",
            year: "all"
        };
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && search) {
            search.value = query;
        }
        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }
        function apply() {
            var keyword = normalize(search ? search.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchCategory = state.category === "all" || card.getAttribute("data-category") === state.category;
                var matchYear = state.year === "all" || card.getAttribute("data-year") === state.year;
                var show = matchKeyword && matchCategory && matchYear;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (search) {
            search.addEventListener("input", apply);
        }
        panel.querySelectorAll("[data-filter-group]").forEach(function (group) {
            group.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-filter-value]");
                if (!button) {
                    return;
                }
                var key = group.getAttribute("data-filter-group");
                state[key] = button.getAttribute("data-filter-value");
                group.querySelectorAll("button").forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                apply();
            });
        });
        apply();
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector(".player-cover");
            var source = video ? video.querySelector("source") : null;
            if (!video || !source) {
                return;
            }
            var streamUrl = source.getAttribute("src");
            var prepared = false;
            function prepare() {
                if (prepared) {
                    return Promise.resolve();
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return Promise.resolve();
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                    box.hls = hls;
                    return new Promise(function (resolve) {
                        hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
                    });
                }
                video.src = streamUrl;
                return Promise.resolve();
            }
            function play() {
                box.classList.add("is-playing");
                prepare().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            box.classList.remove("is-playing");
                        });
                    }
                });
            }
            if (button) {
                button.addEventListener("click", play);
            }
            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                if (video.currentTime === 0 || video.ended) {
                    box.classList.remove("is-playing");
                }
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
