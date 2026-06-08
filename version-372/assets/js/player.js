import { H as Hls } from './hls.js';

export function initMoviePlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const overlay = document.getElementById('playOverlay');

  if (!video || !streamUrl) {
    return;
  }

  let hlsInstance = null;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = streamUrl;
  } else if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
  } else {
    video.src = streamUrl;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function startPlayback() {
    hideOverlay();
    const playTask = video.play();

    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {
        video.setAttribute('controls', 'controls');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', hideOverlay);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
