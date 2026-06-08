(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (slides.length === 0) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var previous = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function setupCardFilter() {
        var input = document.querySelector("[data-filter-input]");
        var select = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!input && !select) {
            return;
        }

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var year = select ? select.value : "";
            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var category = (card.getAttribute("data-category") || "").toLowerCase();
                var matchedKeyword = !keyword || title.indexOf(keyword) !== -1 || category.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                card.style.display = matchedKeyword && matchedYear ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        if (select) {
            select.addEventListener("change", apply);
        }
        apply();
    }

    function movieCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="' + escapeHtml(movie.link) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-shade"></span>',
            '<span class="play-mark">▶</span>',
            '<span class="poster-category">' + escapeHtml(movie.category) + '</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<h3 class="movie-card-title"><a href="' + escapeHtml(movie.link) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.one) + '</p>',
            '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<div class="movie-tags">' + tags + '</div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var category = document.querySelector("[data-search-category]");
        var button = document.querySelector("[data-search-button]");
        if (!results || !input || !window.SITE_MOVIES) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var cat = category ? category.value : "";
            var pool = window.SITE_MOVIES.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.one,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.category,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedCategory = !cat || movie.category === cat;
                return matchedKeyword && matchedCategory;
            }).slice(0, 96);

            if (pool.length === 0) {
                results.innerHTML = '<div class="empty-state">没有找到匹配的影片，请尝试其他关键词。</div>';
                return;
            }

            results.innerHTML = pool.map(movieCard).join("");
        }

        input.addEventListener("input", render);
        if (category) {
            category.addEventListener("change", render);
        }
        if (button) {
            button.addEventListener("click", render);
        }
        render();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCardFilter();
        setupSearchPage();
    });
})();
