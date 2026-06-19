(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function nextSlide() {
      show(current + 1);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(nextSlide, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function bindSearch(form) {
    var input = form.querySelector('[data-search-input]');
    var scope = document.querySelector('[data-filter-scope]');

    if (!input || !scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var message = document.querySelector('[data-no-result]');

    function filter() {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (message) {
        message.style.display = visible ? 'none' : 'block';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      filter();
    });

    input.addEventListener('input', filter);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(bindSearch);
})();
