(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var topButton = document.querySelector('.back-top');

  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('visible', window.scrollY > 360);
    });

    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('.hero-prev');
    var next = carousel.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('.player-shell').forEach(function (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var source = video ? video.getAttribute('data-stream') : '';
    var hls = null;

    function bindVideo() {
      if (!video || !source || video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 45,
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', '1');
    }

    function startVideo() {
      bindVideo();
      shell.classList.add('is-playing');
      if (video) {
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });

      video.addEventListener('error', function () {
        shell.classList.remove('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });


  document.querySelectorAll('.category-movies').forEach(function (grid) {
    var section = grid.closest('.section-block');
    var input = section ? section.querySelector('.local-filter') : null;
    var select = section ? section.querySelector('.local-type') : null;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var type = select ? select.value : '';

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardType = card.getAttribute('data-type') || '';
        var matchedText = !term || text.indexOf(term) !== -1;
        var matchedType = !type || cardType === type;
        card.hidden = !(matchedText && matchedType);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });

  var searchResults = document.getElementById('searchResults');
  var searchInput = document.getElementById('searchInput');
  var searchTitle = document.getElementById('searchTitle');

  if (searchResults && searchInput && searchTitle) {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    searchInput.value = query;

    function renderResults(items, term) {
      if (!term) {
        return;
      }

      searchTitle.textContent = '“' + term + '”相关影片';

      if (!items.length) {
        searchResults.className = 'empty-result';
        searchResults.innerHTML = '<p>没有找到匹配影片，请尝试更换关键词。</p>';
        return;
      }

      searchResults.className = 'movie-grid';
      searchResults.innerHTML = items.slice(0, 120).map(function (item) {
        var tags = item.tags.map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
          '<a class="poster-link" href="./' + item.file + '" aria-label="观看' + escapeHtml(item.title) + '">' +
          '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-type">' + escapeHtml(item.type) + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<h3><a href="./' + item.file + '">' + escapeHtml(item.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</p>' +
          '<p class="movie-line">' + escapeHtml(item.line) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;'
        }[character];
      });
    }

    var index = window.searchIndex || [];
    var normalized = query.trim().toLowerCase();

    if (!normalized) {
      return;
    }

    var terms = normalized.split(/\s+/).filter(Boolean);
    var results = index.filter(function (item) {
      var haystack = [
        item.title,
        item.region,
        item.type,
        item.year,
        item.genre,
        item.line,
        item.tags.join(' ')
      ].join(' ').toLowerCase();

      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });

    renderResults(results, query.trim());
  }
})();
