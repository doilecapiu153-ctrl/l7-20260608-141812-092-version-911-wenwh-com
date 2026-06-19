(function () {
    window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(buttonId);
        var hls = null;
        var attached = false;

        if (!video || !cover || !streamUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            cover.classList.add('hidden');
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    cover.classList.remove('hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.currentTime) {
                cover.classList.remove('hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
