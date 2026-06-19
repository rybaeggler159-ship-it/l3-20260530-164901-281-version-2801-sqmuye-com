(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var mobileButton = qs('[data-mobile-button]');
  var mobilePanel = qs('[data-mobile-panel]');
  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var backTop = qs('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.style.display = window.scrollY > 500 ? 'grid' : 'none';
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var heroSlides = qsa('[data-hero-slide]');
  var heroBackgrounds = qsa('[data-hero-bg]');
  var heroDots = qsa('[data-hero-dot]');
  if (heroSlides.length > 0) {
    var heroIndex = 0;
    function showHero(index) {
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroSlides.forEach(function (slide, slideIndex) {
        slide.hidden = slideIndex !== heroIndex;
      });
      heroBackgrounds.forEach(function (bg, bgIndex) {
        bg.classList.toggle('active', bgIndex === heroIndex);
      });
      heroDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === heroIndex);
      });
    }
    heroDots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
      });
    });
    showHero(0);
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  qsa('[data-filter-root]').forEach(function (root) {
    var input = qs('[data-filter-input]', root);
    var yearSelect = qs('[data-filter-year]', root);
    var typeSelect = qs('[data-filter-type]', root);
    var cards = qsa('[data-movie-card]', root);
    var counter = qs('[data-filter-count]', root);

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var year = yearSelect ? yearSelect.value : 'all';
      var type = typeSelect ? typeSelect.value : 'all';
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-genre'));
        var cardYear = card.getAttribute('data-year');
        var cardType = card.getAttribute('data-type');
        var matchKeyword = keyword === '' || text.indexOf(keyword) !== -1;
        var matchYear = year === 'all' || cardYear === year;
        var matchType = type === 'all' || cardType === type;
        var visibleNow = matchKeyword && matchYear && matchType;
        card.style.display = visibleNow ? '' : 'none';
        if (visibleNow) {
          visible += 1;
        }
      });

      if (counter) {
        counter.textContent = String(visible);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', applyFilter);
    }
    applyFilter();
  });

  function attachSearch(input) {
    var box = qs(input.getAttribute('data-search-results'));
    if (!box || !window.MOVIE_INDEX) {
      return;
    }

    function render() {
      var keyword = normalize(input.value);
      if (!keyword) {
        box.classList.remove('active');
        box.innerHTML = '';
        return;
      }
      var rows = window.MOVIE_INDEX.filter(function (item) {
        return normalize(item.title + ' ' + item.genre + ' ' + item.tags).indexOf(keyword) !== -1;
      }).slice(0, 18);
      box.innerHTML = rows.length ? rows.map(function (item) {
        return '<a class="search-result-item" href="' + item.url + '"><strong>' + item.title + '</strong><br><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></a>';
      }).join('') : '<div class="empty-state">没有找到匹配影片</div>';
      box.classList.add('active');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('active');
      }
    });
  }

  qsa('[data-global-search]').forEach(attachSearch);

  qsa('[data-player]').forEach(function (player) {
    var video = qs('video', player);
    var overlay = qs('[data-play-overlay]', player);
    var status = qs('[data-player-status]', player);
    var hlsUrl = player.getAttribute('data-hls');
    var poster = player.getAttribute('data-poster');

    if (overlay && poster) {
      overlay.style.setProperty('--poster', 'url(' + poster + ')');
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function start() {
      if (!video || !hlsUrl) {
        setStatus('当前影片暂无可用播放源');
        return;
      }

      if (overlay) {
        overlay.style.display = 'none';
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            setStatus('已加载播放源，点击视频开始播放');
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请稍后重试');
            try {
              hls.destroy();
            } catch (error) {}
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {
            setStatus('已加载播放源，点击视频开始播放');
          });
        });
      } else {
        video.src = hlsUrl;
        video.play().catch(function () {
          setStatus('当前浏览器需要 HLS 支持组件加载后播放');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
  });
})();
