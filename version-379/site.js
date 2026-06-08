(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var isOpen = panel.hasAttribute("hidden");
            if (isOpen) {
                panel.removeAttribute("hidden");
                button.setAttribute("aria-expanded", "true");
                button.textContent = "×";
            } else {
                panel.setAttribute("hidden", "");
                button.setAttribute("aria-expanded", "false");
                button.textContent = "☰";
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === active);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === active);
            });
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var grid = document.querySelector("[data-filterable]");
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var keywordInput = document.querySelector(".content-search");
        var typeSelect = document.querySelector(".type-filter");
        var regionSelect = document.querySelector(".region-filter");
        var yearSelect = document.querySelector(".year-filter");
        var emptyState = document.querySelector(".empty-state");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (keywordInput && query) {
            keywordInput.value = query;
        }
        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }
        function apply() {
            var keyword = normalize(keywordInput ? keywordInput.value : "");
            var selectedType = typeSelect ? typeSelect.value : "";
            var selectedRegion = regionSelect ? regionSelect.value : "";
            var selectedYear = yearSelect ? yearSelect.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var searchText = normalize(card.getAttribute("data-search"));
                var type = card.getAttribute("data-type") || "";
                var region = card.getAttribute("data-region") || "";
                var year = card.getAttribute("data-year") || "";
                var match = true;
                if (keyword && searchText.indexOf(keyword) === -1) {
                    match = false;
                }
                if (selectedType && type !== selectedType) {
                    match = false;
                }
                if (selectedRegion && region !== selectedRegion) {
                    match = false;
                }
                if (selectedYear && year !== selectedYear) {
                    match = false;
                }
                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }
        [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
