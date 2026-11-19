/* E案（ref-06）参考：miraiz-persol.jp の動きを再現
   - 出だし：手描き線が描かれる／ヒーローのボタンが 1.6s 後に下から／ヘッダーが 1s 後にフェード
   - ヒーロー写真：3秒ごとに 1秒のフェードで切り替え（表示中は 4秒かけて 1.06→1 に戻る）
   - スクロールで表示：角丸パネルは 0.95→1 に拡大、写真ループは下から、カードは 0.85→1
   - 写真ループ・お客様の声：横に流れ続ける（声はマウスを乗せると止まる）
   - お知らせ：はみ出す幅のときだけ 前へ／次へ ボタン
   JS が無い時は、すべて最初から表示されている（隠す処理はここで html に .js を付けた時だけ）。 */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function ready(fn) { if (d.readyState !== 'loading') fn(); else d.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    var pg = d.querySelector('.pg');
    if (!pg) return;

    /* 1) 出だし */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        pg.querySelectorAll('.hbt[data-in], .hd[data-in]').forEach(function (el) { el.classList.add('on'); });
      });
    });

    /* 2) ヒーローのフェード切り替え */
    var fade = pg.querySelector('[data-fade]');
    if (fade) {
      var imgs = fade.querySelectorAll('img'), cur = 0;
      if (imgs.length) {
        imgs[0].classList.add('on');
        if (!reduce && imgs.length > 1) {
          setInterval(function () {
            imgs[cur].classList.remove('on');
            cur = (cur + 1) % imgs.length;
            imgs[cur].classList.add('on');
          }, 4000);
        }
      }
    }

    /* 3) スクロールで表示 */
    var aps = pg.querySelectorAll('[data-ap], .msg[data-in]');
    if (reduce || !('IntersectionObserver' in window)) {
      aps.forEach(function (el) { el.classList.add('on'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
      aps.forEach(function (el) { io.observe(el); });
      /* 念のため：表示されないまま残った要素は 4 秒後に出す */
      setTimeout(function () {
        aps.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < innerHeight && r.bottom > 0) el.classList.add('on');
        });
      }, 4000);
    }

    /* 4) 横に流れ続けるループ */
    var loops = [];
    pg.querySelectorAll('[data-loop]').forEach(function (box) {
      var track = box.firstElementChild;
      if (!track) return;
      var items = Array.prototype.slice.call(track.children);
      var setW = track.scrollWidth;
      if (!setW) return;
      var copies = Math.max(2, Math.ceil((box.clientWidth * 2) / setW) + 1);
      for (var c = 1; c < copies; c++) {
        items.forEach(function (it) {
          var cl = it.cloneNode(true);
          cl.setAttribute('aria-hidden', 'true');
          cl.querySelectorAll('img').forEach(function (im) { im.alt = ''; });
          track.appendChild(cl);
        });
      }
      var L = { box: box, track: track, w: setW, x: 0, speed: parseFloat(box.getAttribute('data-loop')) || 40, paused: false };
      L.w = track.scrollWidth / copies;
      if (box.hasAttribute('data-pause')) {
        box.addEventListener('mouseenter', function () { L.paused = true; });
        box.addEventListener('mouseleave', function () { L.paused = false; });
      }
      loops.push(L);
    });
    if (loops.length && !reduce) {
      var last = performance.now();
      (function step(t) {
        var dt = Math.min(64, t - last) / 1000; last = t;
        loops.forEach(function (L) {
          if (!L.paused) { L.x -= L.speed * dt; if (-L.x >= L.w) L.x += L.w; }
          L.track.style.transform = 'translate3d(' + L.x.toFixed(2) + 'px,0,0)';
        });
        requestAnimationFrame(step);
      })(last);
    }
    window.addEventListener('resize', function () {
      loops.forEach(function (L) { var n = L.track.children.length, k = L.track.querySelectorAll('[aria-hidden="true"]').length; L.w = L.track.scrollWidth / (n / (n - k)); });
    });

    /* 5) お知らせのスライダー */
    pg.querySelectorAll('[data-slider]').forEach(function (w) {
      var list = w.querySelector('.nct');
      if (!list) return;
      function check() { w.classList.toggle('of', list.scrollWidth > list.clientWidth + 4); }
      check(); window.addEventListener('resize', check);
      function go(dir) {
        var card = list.querySelector('.nc');
        var step = card ? card.getBoundingClientRect().width + 24 : list.clientWidth * .8;
        list.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' });
      }
      var pv = w.querySelector('.pv'), nx = w.querySelector('.nx');
      if (pv) pv.addEventListener('click', function () { go(-1); });
      if (nx) nx.addEventListener('click', function () { go(1); });
    });
  });
})();
