(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function setSlide(index) {
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

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setSlide(index);
            if (timer) {
                window.clearInterval(timer);
                timer = null;
                startHero();
            }
        });
    });

    setSlide(0);
    startHero();

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    const searchInputs = Array.from(document.querySelectorAll('[data-card-search]'));

    searchInputs.forEach(function (input) {
        const scopeSelector = input.getAttribute('data-card-search');
        const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        const typeSelect = document.querySelector('[data-filter-type]');
        const yearSelect = document.querySelector('[data-filter-year]');
        const cards = scope ? Array.from(scope.querySelectorAll('[data-movie-card]')) : [];
        const empty = document.querySelector('[data-empty-state]');

        const params = new URLSearchParams(window.location.search);
        const presetKeyword = params.get('q');

        if (presetKeyword && !input.value) {
            input.value = presetKeyword;
        }

        function applyFilter() {
            const keyword = normalize(input.value);
            const typeValue = typeSelect ? normalize(typeSelect.value) : '';
            const yearValue = yearSelect ? normalize(yearSelect.value) : '';
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize(card.getAttribute('data-search-text'));
                const cardType = normalize(card.getAttribute('data-type'));
                const cardYear = normalize(card.getAttribute('data-year'));
                const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchedType = !typeValue || cardType === typeValue;
                const matchedYear = !yearValue || cardYear === yearValue;
                const matched = matchedKeyword && matchedType && matchedYear;

                card.style.display = matched ? '' : 'none';

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', applyFilter);

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        applyFilter();
    });
})();
