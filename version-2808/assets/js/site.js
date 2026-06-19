(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterBlocks = document.querySelectorAll('.js-card-filter');
  filterBlocks.forEach(function (block) {
    var section = block.closest('.content-section');
    var grid = section ? section.querySelector('[data-card-grid]') : null;
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var keyword = block.querySelector('[data-filter-keyword]');
    var year = block.querySelector('[data-filter-year]');
    var region = block.querySelector('[data-filter-region]');
    var sort = block.querySelector('[data-sort-mode]');
    var apply = function () {
      var q = (keyword && keyword.value ? keyword.value : '').trim().toLowerCase();
      var selectedYear = year ? year.value : '';
      var selectedRegion = region ? region.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year')
        ].join(' ').toLowerCase();
        var okKeyword = !q || text.indexOf(q) !== -1;
        var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var okRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
        card.hidden = !(okKeyword && okYear && okRegion);
      });
      var mode = sort ? sort.value : 'default';
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        });
      }
      if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
        });
      }
      if (mode === 'title') {
        sorted.sort(function (a, b) {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        });
      }
      if (mode !== 'default') {
        sorted.forEach(function (card) {
          grid.appendChild(card);
        });
      }
    };
    [keyword, year, region, sort].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });

  var player = document.querySelector('[data-player]');
  if (player) {
    var video = player.querySelector('video');
    var playButton = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-source');
    var hlsInstance = null;
    var prepare = function () {
      if (!video || video.getAttribute('data-ready') === '1') {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
      video.setAttribute('data-ready', '1');
      video.controls = true;
    };
    var start = function () {
      if (!source || !video) {
        if (status) {
          status.textContent = '暂时无法播放';
        }
        return;
      }
      prepare();
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
      if (status) {
        status.textContent = '正在加载';
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (playButton) {
            playButton.classList.remove('is-hidden');
          }
          if (status) {
            status.textContent = '再次点击播放';
          }
        });
      }
    };
    if (playButton) {
      playButton.addEventListener('click', start);
    }
    player.addEventListener('click', function (event) {
      if (event.target === video || event.target.closest('[data-play-button]')) {
        return;
      }
      start();
    });
    if (video) {
      video.addEventListener('error', function () {
        if (playButton) {
          playButton.classList.remove('is-hidden');
        }
        if (status) {
          status.textContent = '暂时无法播放';
        }
      });
      video.addEventListener('playing', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  if (searchForm && searchInput && searchResults && window.MOVIE_SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    var render = function () {
      var q = searchInput.value.trim().toLowerCase();
      var list = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        if (!q) {
          return true;
        }
        return [item.title, item.region, item.type, item.year, item.genre, item.tags].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      if (!list.length) {
        searchResults.innerHTML = '<div class="empty-state">未找到匹配内容</div>';
        return;
      }
      searchResults.innerHTML = list.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="movie-cover" href="detail/' + item.slug + '.html">' +
          '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
          '<span class="cover-fade"></span><span class="play-chip">播放</span></a>' +
          '<div class="movie-info"><a class="movie-title" href="detail/' + item.slug + '.html">' + item.title + '</a>' +
          '<p class="movie-line">' + item.oneLine + '</p>' +
          '<div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
          '</div></article>';
      }).join('');
    };
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var next = searchInput.value.trim();
      var url = next ? 'search.html?q=' + encodeURIComponent(next) : 'search.html';
      window.history.replaceState(null, '', url);
      render();
    });
    searchInput.addEventListener('input', render);
    render();
  }
})();
