(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }

    var video = player.querySelector("video");
    var startButton = player.querySelector(".player-start");
    var stream = player.getAttribute("data-stream");
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || video.getAttribute("data-ready") === "true") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.setAttribute("data-ready", "true");
    }

    function startPlayback() {
      attachStream();
      player.classList.add("is-playing");
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener("click", function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    player.addEventListener("click", function (event) {
      if (player.classList.contains("is-playing")) {
        return;
      }
      if (event.target === video) {
        return;
      }
      startPlayback();
    });

    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
