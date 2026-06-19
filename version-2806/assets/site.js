(function () {
    var header = document.querySelector('.site-header');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 36) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-card'));
    var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-chip]'));
    var activeChip = 'all';

    function getQueryFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function applyFilter() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = card.getAttribute('data-filter') || '';
            var category = card.getAttribute('data-category') || '';
            var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
            var chipMatch = activeChip === 'all' || category === activeChip;
            card.classList.toggle('is-hidden', !(keywordMatch && chipMatch));
        });
    }

    if (filterInput) {
        var query = getQueryFromUrl();
        if (query) {
            filterInput.value = query;
        }
        filterInput.addEventListener('input', applyFilter);
        applyFilter();
    }

    chipButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeChip = button.getAttribute('data-chip') || 'all';
            chipButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.play-cover');
        var stream = player.getAttribute('data-stream');
        var attached = false;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function play() {
            attach();
            player.classList.add('is-playing');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        if (button && video) {
            button.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
