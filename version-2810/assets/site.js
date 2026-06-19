(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length > 1) {
      var current = 0;
      var show = function (index) {
        current = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
        });
      });
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    searchInputs.forEach(function (input) {
      var target = input.getAttribute("data-search-input") || "body";
      var scope = document.querySelector(target) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
      var empty = scope.querySelector(".empty-tip");
      var apply = function () {
        var key = input.value.trim().toLowerCase();
        var shown = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-keywords") || card.textContent || "").toLowerCase();
          var ok = !key || text.indexOf(key) !== -1;
          card.style.display = ok ? "" : "none";
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      };
      input.addEventListener("input", apply);
    });

    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var group = chip.closest(".filter-chips");
        var value = chip.getAttribute("data-filter-chip");
        var target = chip.getAttribute("data-target") || "#movie-list";
        var scope = document.querySelector(target) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
        if (group) {
          Array.prototype.slice.call(group.querySelectorAll(".chip")).forEach(function (item) {
            item.classList.remove("active");
          });
        }
        chip.classList.add("active");
        cards.forEach(function (card) {
          var key = card.getAttribute("data-filter") || "";
          var ok = value === "all" || key.indexOf(value) !== -1;
          card.style.display = ok ? "" : "none";
        });
      });
    });
  });

  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    if (!video || !streamUrl) {
      return;
    }

    var started = false;
    var bind = function () {
      if (started) {
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ maxBufferLength: 40 });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    var play = function () {
      bind();
      if (layer) {
        layer.classList.add("hidden");
      }
      var p = video.play();
      if (p && typeof p.catch === "function") {
        p.catch(function () {});
      }
    };

    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
