import { H as Hls } from './hls.js';

function bindPlayer(box) {
  var video = box.querySelector('video');
  var button = box.querySelector('[data-play-button]');
  var stream = box.getAttribute('data-stream');
  var ready = false;
  var hls = null;

  function attach() {
    if (ready || !video || !stream) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    box.classList.add('is-playing');
  }

  function start() {
    attach();
    video.controls = true;
    var task = video.play();

    if (task && typeof task.catch === 'function') {
      task.catch(function () {
        video.controls = true;
        box.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);
