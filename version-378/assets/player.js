(function () {
    window.setupMoviePlayer = function (videoId, coverId, source) {
        const video = document.getElementById(videoId);
        const cover = document.getElementById(coverId);
        let started = false;
        let hls = null;

        if (!video || !cover || !source) {
            return;
        }

        function startPlayback() {
            if (started) {
                if (video.paused) {
                    video.play().catch(function () {});
                }
                return;
            }

            started = true;
            cover.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {});
        }

        cover.addEventListener('click', startPlayback);

        video.addEventListener('click', function () {
            if (!started) {
                startPlayback();
            }
        });
    };
})();
