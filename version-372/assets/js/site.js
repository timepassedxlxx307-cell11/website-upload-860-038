(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const topSearch = document.querySelector('.top-search');

  if (navToggle && siteNav && topSearch) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
      topSearch.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('.hero-carousel');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  const filterPanel = document.querySelector('.filter-panel');

  if (filterPanel) {
    const keywordInput = filterPanel.querySelector('input[name="keyword"]');
    const regionSelect = filterPanel.querySelector('select[name="region"]');
    const typeSelect = filterPanel.querySelector('select[name="type"]');
    const yearSelect = filterPanel.querySelector('select[name="year"]');
    const cards = Array.from(document.querySelectorAll('.filter-grid .movie-card'));
    const emptyState = document.querySelector('.empty-state');
    const resetButton = filterPanel.querySelector('.reset-filter');

    function includesText(value, keyword) {
      return value.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    }

    function applyFilters() {
      const keyword = keywordInput ? keywordInput.value.trim() : '';
      const region = regionSelect ? regionSelect.value : '';
      const type = typeSelect ? typeSelect.value : '';
      const year = yearSelect ? yearSelect.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || '',
          card.dataset.genre || '',
          card.textContent || ''
        ].join(' ');
        const matched = (!keyword || includesText(haystack, keyword)) &&
          (!region || card.dataset.region === region) &&
          (!type || card.dataset.type === type) &&
          (!year || card.dataset.year === year);

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) {
          keywordInput.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilters();
      });
    }
  }
})();
