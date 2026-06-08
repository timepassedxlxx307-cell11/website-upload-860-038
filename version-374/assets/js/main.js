(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-main-nav]");
  var headerSearch = document.querySelector(".header-search");

  if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
      nav.classList.toggle("open");
      if (headerSearch) {
        headerSearch.classList.toggle("open");
      }
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startAuto() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restartAuto() {
      if (timer) {
        window.clearInterval(timer);
      }
      startAuto();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartAuto();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartAuto();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restartAuto();
      });
    });

    showSlide(0);
    startAuto();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-empty-state]");

  function applySearch(value) {
    var term = String(value || "").trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = String(card.getAttribute("data-search-text") || "").toLowerCase();
      var matched = term === "" || text.indexOf(term) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    document.body.classList.toggle("has-search-empty", term !== "" && visible === 0 && Boolean(empty));
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", function () {
      var value = input.value;
      searchInputs.forEach(function (other) {
        if (other !== input) {
          other.value = value;
        }
      });
      applySearch(value);
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var layer = player.querySelector(".play-layer");
    var button = player.querySelector(".play-button");
    var stream = player.getAttribute("data-stream");
    var started = false;
    var hlsInstance = null;

    function beginPlay() {
      if (!video || !stream) {
        return;
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
        started = true;
      }

      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (button) {
            button.textContent = "▶";
          }
        });
      }
      player.classList.add("playing");
    }

    if (layer) {
      layer.addEventListener("click", beginPlay);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginPlay();
      });
    }

    if (video) {
      video.addEventListener("play", function () {
        player.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("playing");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  });
})();
