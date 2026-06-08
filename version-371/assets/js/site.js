(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initSearchForms() {
    bySelector("form.site-search, form.search-page-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = bySelector("[data-hero-slide]", root);
    var dots = bySelector("[data-hero-target]", root);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    };
    var start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute("data-hero-target")) || 0);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    bySelector("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var cards = bySelector("[data-filter-card]", scope);
      var buttons = bySelector("[data-filter-year]", scope);
      var empty = scope.querySelector("[data-filter-empty]");
      var selectedYear = "all";
      var apply = function () {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var year = card.getAttribute("data-filter-year") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = selectedYear === "all" || year === selectedYear;
          var show = matchedKeyword && matchedYear;
          card.style.display = show ? "" : "none";
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };
      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          selectedYear = button.getAttribute("data-filter-year") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("active", item === button);
          });
          apply();
        });
      });
      apply();
    });
  }

  function buildSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.one) + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[match];
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var heading = document.querySelector("[data-search-title]");
    var input = document.querySelector("[data-search-page-input]");
    if (!results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    if (!query) {
      return;
    }
    var lower = query.toLowerCase();
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category].concat(movie.tags || []).join(" ").toLowerCase();
      return text.indexOf(lower) !== -1;
    });
    if (heading) {
      heading.textContent = matched.length ? "搜索结果" : "没有找到匹配影片";
    }
    results.innerHTML = matched.slice(0, 120).map(buildSearchCard).join("") || "<div class=\"filter-empty is-visible\">没有找到匹配影片</div>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initSearchForms();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
