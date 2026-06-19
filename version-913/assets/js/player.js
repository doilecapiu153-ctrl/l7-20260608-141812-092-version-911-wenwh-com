(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-overlay]');
    if (!video) {
      return;
    }
    var source = video.dataset.src;
    var hlsInstance = null;
    var ready = false;
    function bindSource() {
      if (ready || !source) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      ready = true;
    }
    function playVideo() {
      bindSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    video.addEventListener('error', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      ready = false;
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
