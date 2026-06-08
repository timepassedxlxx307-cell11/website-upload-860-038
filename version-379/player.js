(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupPlayer(video) {
        var stream = video.getAttribute("data-stream");
        var cover = document.querySelector("[data-player-cover]");
        var hls = null;
        if (!stream) {
            return;
        }
        function hideCover() {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        }
        function showCover() {
            if (cover) {
                cover.classList.remove("is-hidden");
            }
        }
        function startPlayback() {
            hideCover();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    showCover();
                });
            }
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                    hls = null;
                    video.src = stream;
                }
            });
        } else {
            video.src = stream;
        }
        if (cover) {
            cover.addEventListener("click", startPlayback);
        }
        video.addEventListener("play", hideCover);
        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                showCover();
            }
        });
        video.addEventListener("ended", showCover);
    }

    ready(function () {
        var video = document.querySelector("video[data-stream]");
        if (video) {
            setupPlayer(video);
        }
    });
})();
