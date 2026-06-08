(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));

        if (!input || !cards.length) {
            return;
        }

        input.addEventListener('input', function () {
            var keyword = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-meta') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();

                card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        });
    });

    function clean(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    var globalSearch = document.querySelector('[data-global-search]');
    var globalResults = document.querySelector('[data-search-results]');

    if (globalSearch && globalResults && Array.isArray(window.SITE_SEARCH_INDEX)) {
        globalSearch.addEventListener('input', function () {
            var keyword = globalSearch.value.trim().toLowerCase();

            if (!keyword) {
                globalResults.classList.remove('is-active');
                globalResults.innerHTML = '';
                return;
            }

            var results = window.SITE_SEARCH_INDEX.filter(function (item) {
                return item.search.indexOf(keyword) !== -1;
            }).slice(0, 12);

            globalResults.innerHTML = results.map(function (item) {
                return '<a class="search-result-item" href="./' + clean(item.url) + '">' +
                    '<img src="' + clean(item.cover) + '" alt="' + clean(item.title) + '">' +
                    '<span><strong>' + clean(item.title) + '</strong>' +
                    '<span>' + clean(item.meta) + '</span></span>' +
                    '</a>';
            }).join('');

            globalResults.classList.toggle('is-active', results.length > 0);
        });
    }

    document.querySelectorAll('[data-player]').forEach(function (frame) {
        var video = frame.querySelector('video');
        var playButton = frame.querySelector('[data-play-button]');
        var stream = frame.getAttribute('data-stream');
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (!video || !stream || loaded) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                loaded = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                loaded = true;
                return;
            }

            video.src = stream;
            loaded = true;
        }

        function startPlayback() {
            attach();
            frame.classList.add('is-playing');
            var action = video.play();

            if (action && typeof action.catch === 'function') {
                action.catch(function () {
                    frame.classList.remove('is-playing');
                });
            }
        }

        if (playButton) {
            playButton.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    frame.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                frame.classList.remove('is-playing');
                if (hlsInstance && typeof hlsInstance.stopLoad === 'function') {
                    hlsInstance.stopLoad();
                }
            });
        }
    });
})();
