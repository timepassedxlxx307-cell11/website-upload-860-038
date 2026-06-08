(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('is-menu-open', panel.classList.contains('is-open'));
        });
        selectAll('[data-mobile-panel] a').forEach(function (link) {
            link.addEventListener('click', function () {
                panel.classList.remove('is-open');
                document.body.classList.remove('is-menu-open');
            });
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (next) {
            next.addEventListener('click', function () {
                setSlide(current + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                setSlide(current - 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        setSlide(0);
        start();
    }

    function initFilters() {
        selectAll('[data-grid-filter]').forEach(function (panel) {
            var grid = document.querySelector(panel.getAttribute('data-grid-filter'));
            if (!grid) {
                return;
            }
            var keyword = panel.querySelector('[data-filter-keyword]');
            var year = panel.querySelector('[data-filter-year]');
            var urlParam = grid.getAttribute('data-url-query');
            if (urlParam && keyword) {
                var params = new URLSearchParams(window.location.search);
                var value = params.get(urlParam);
                if (value) {
                    keyword.value = value;
                }
            }

            function update() {
                var term = normalize(keyword ? keyword.value : '');
                var selectedYear = year ? year.value : '';
                selectAll('.movie-card', grid).forEach(function (card) {
                    var searchable = normalize(card.getAttribute('data-searchable'));
                    var cardYear = card.getAttribute('data-year') || '';
                    var visible = true;
                    if (term && searchable.indexOf(term) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear !== selectedYear) {
                        visible = false;
                    }
                    card.classList.toggle('is-hidden', !visible);
                });
            }

            if (keyword) {
                keyword.addEventListener('input', update);
            }
            if (year) {
                year.addEventListener('change', update);
            }
            update();
        });
    }

    function bindPlayer(streamUrl) {
        var video = document.querySelector('[data-player-video]');
        var cover = document.querySelector('[data-player-cover]');
        if (!video || !cover || !streamUrl) {
            return;
        }
        var hls = null;
        var initialized = false;

        function attach() {
            if (initialized) {
                return;
            }
            initialized = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            attach();
            cover.classList.add('is-hidden');
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    cover.classList.remove('is-hidden');
                });
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            cover.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.MovieSite = {
        bootPlayer: bindPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
}());
