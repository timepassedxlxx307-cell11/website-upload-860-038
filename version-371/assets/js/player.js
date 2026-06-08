(function () {
  var localHlsPromise = null;

  function loadLocalHls() {
    if (!localHlsPromise) {
      localHlsPromise = import("./hls.js").then(function (module) {
        return module.H;
      }).catch(function () {
        return null;
      });
    }
    return localHlsPromise;
  }

  function attachStream(video, streamUrl) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return Promise.resolve();
    }
    return loadLocalHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = streamUrl;
      }
    });
  }

  window.startMoviePlayback = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !streamUrl) {
      return;
    }
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    if (!video.getAttribute("data-ready")) {
      attachStream(video, streamUrl).then(function () {
        video.setAttribute("data-ready", "1");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      });
    } else {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
  };
})();
