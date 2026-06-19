(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  var filterForm = document.querySelector('[data-filter-form]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter() {
    if (!filterForm || !cards.length) {
      return;
    }

    var keyword = normalizeText(filterForm.querySelector('[name="q"]') && filterForm.querySelector('[name="q"]').value);
    var year = normalizeText(filterForm.querySelector('[name="year"]') && filterForm.querySelector('[name="year"]').value);
    var genre = normalizeText(filterForm.querySelector('[name="genre"]') && filterForm.querySelector('[name="genre"]').value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.category
      ].join(' '));
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || normalizeText(card.dataset.year).indexOf(year) !== -1;
      var matchedGenre = !genre || haystack.indexOf(genre) !== -1;
      var matched = matchedKeyword && matchedYear && matchedGenre;

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visibleCount ? 'none' : 'block';
    }
  }

  if (filterForm) {
    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(filterForm.elements).forEach(function (element) {
      element.addEventListener('input', applyFilter);
      element.addEventListener('change', applyFilter);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && filterForm.querySelector('[name="q"]')) {
      filterForm.querySelector('[name="q"]').value = q;
    }

    applyFilter();
  }

  var video = document.querySelector('[data-player]');
  var playerShell = document.querySelector('[data-player-shell]');
  var playButton = document.querySelector('[data-play-button]');

  if (video) {
    var source = video.getAttribute('data-src');
    var initialized = false;

    function initializeVideo() {
      if (initialized || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      initialized = true;
    }

    function startPlayback() {
      initializeVideo();
      var playPromise = video.play();

      if (playerShell) {
        playerShell.classList.add('is-playing');
      }

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (playerShell) {
            playerShell.classList.remove('is-playing');
          }
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (playerShell) {
        playerShell.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (playerShell) {
        playerShell.classList.remove('is-playing');
      }
    });
  }
})();
