(function () {
    function initMoviePlayer(sourceUrl) {
        var video = document.querySelector("[data-player-video]");
        var shell = document.querySelector("[data-player-shell]");
        var overlay = document.querySelector("[data-player-overlay]");
        var playButton = document.querySelector("[data-play-button]");
        var attached = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function beginPlayback() {
            attachSource();
            video.controls = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                beginPlayback();
            });
        }

        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === video && !video.paused) {
                    return;
                }
                if (event.target && event.target.closest && event.target.closest("button")) {
                    return;
                }
                beginPlayback();
            });
        }

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (!video.currentTime && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
