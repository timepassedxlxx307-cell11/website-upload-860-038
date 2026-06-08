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
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var isHidden = menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !isHidden);
      button.setAttribute("aria-expanded", String(isHidden));
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll(".site-search-form");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = "search.html";
        if (value) {
          target += "?q=" + encodeURIComponent(value);
        }
        window.location.href = target;
      });
    });
  }

  function setupHeroSliders() {
    var sliders = document.querySelectorAll("[data-hero-slider]");
    sliders.forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;
      if (!slides.length) {
        return;
      }
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }
      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });
      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function setupCategoryFilters() {
    var page = document.querySelector("[data-category-page]");
    if (!page) {
      return;
    }
    var input = page.querySelector(".category-filter-input");
    var typeSelect = page.querySelector(".category-type-select");
    var sortSelect = page.querySelector(".category-sort-select");
    var grid = page.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function apply() {
      var keyword = normalize(input && input.value);
      var typeValue = typeSelect ? typeSelect.value : "";
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-category")
        ].join(" "));
        var typeMatch = !typeValue || card.getAttribute("data-type").indexOf(typeValue) >= 0 || card.getAttribute("data-tags").indexOf(typeValue) >= 0 || card.getAttribute("data-genre").indexOf(typeValue) >= 0 || card.getAttribute("data-title").indexOf(typeValue) >= 0;
        var keywordMatch = !keyword || haystack.indexOf(keyword) >= 0;
        card.classList.toggle("hidden-by-filter", !(typeMatch && keywordMatch));
      });
    }
    function sortCards() {
      var value = sortSelect ? sortSelect.value : "default";
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        if (value === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (value === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }
        if (value === "title") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
        }
        return Number(a.getAttribute("data-index")) - Number(b.getAttribute("data-index"));
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", apply);
    }
    if (sortSelect) {
      sortSelect.addEventListener("change", sortCards);
    }
  }

  function createSearchCard(movie) {
    var card = document.createElement("a");
    card.className = "movie-card group";
    card.href = movie.file;
    card.innerHTML = [
      "<div class=\"movie-thumb\">",
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"movie-play-mask\"><span class=\"play-triangle small\" aria-hidden=\"true\"></span></span>",
      "</div>",
      "<div class=\"movie-card-body\">",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"movie-card-foot\"><span class=\"category-pill\">" + escapeHtml(movie.category) + "</span><span class=\"movie-year\">" + escapeHtml(movie.year) + "</span></div>",
      "</div>"
    ].join("");
    return card;
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
    var page = document.querySelector("[data-search-page]");
    var grid = document.getElementById("search-results");
    if (!page || !grid || !window.MovieSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = page.querySelector("input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query.trim()) {
      return;
    }
    var terms = normalize(query).split(/\s+/).filter(Boolean);
    var results = window.MovieSearchIndex.filter(function (movie) {
      var haystack = normalize([movie.title, movie.year, movie.region, movie.genre, movie.tags, movie.category, movie.oneLine].join(" "));
      return terms.every(function (term) {
        return haystack.indexOf(term) >= 0;
      });
    }).slice(0, 120);
    grid.innerHTML = "";
    if (!results.length) {
      var empty = document.createElement("div");
      empty.className = "detail-panel bg-slate-800/50 rounded-xl p-6";
      empty.innerHTML = "<h2>暂无匹配影片</h2><p>可以换一个片名、类型、年代或地区继续搜索。</p>";
      grid.appendChild(empty);
      return;
    }
    results.forEach(function (movie) {
      grid.appendChild(createSearchCard(movie));
    });
  }

  function setupPlayers() {
    var players = document.querySelectorAll(".movie-player");
    players.forEach(function (root) {
      var video = root.querySelector("video");
      var overlay = root.querySelector(".player-overlay");
      var source = root.getAttribute("data-hls");
      var hls = null;
      var loaded = false;
      if (!video || !source) {
        return;
      }
      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }
      function start() {
        load();
        root.classList.add("is-playing");
        video.play().catch(function () {});
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        root.classList.add("is-playing");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHeroSliders();
    setupCategoryFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
