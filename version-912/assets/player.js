(function () {
  var hlsScriptLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsCallbacks.push(callback);

    if (hlsScriptLoading) {
      return;
    }

    hlsScriptLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.async = true;
    script.onload = function () {
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      hlsCallbacks.splice(0).forEach(function (item) {
        item(true);
      });
    };
    document.head.appendChild(script);
  }

  function attach(video, stream, done) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      done();
      return;
    }

    loadHls(function (failed) {
      if (!failed && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, done);
      } else {
        video.src = stream;
        done();
      }
    });
  }

  document.querySelectorAll('video[data-stream]').forEach(function (video) {
    var stream = video.getAttribute('data-stream');
    var frame = video.closest('.video-frame');
    var trigger = frame ? frame.querySelector('.player-trigger') : null;
    var ready = false;

    function play() {
      if (!stream) {
        return;
      }

      function begin() {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (ready) {
        begin();
        return;
      }

      ready = true;
      attach(video, stream, begin);
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
  });
})();
