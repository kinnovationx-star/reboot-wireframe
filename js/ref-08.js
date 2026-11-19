/* G案（ref-08）参考：axis-ov-films.co.jp の動きを素の JS で再現 */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.add('js');

  /* ---------- オープニング（黒い幕＋回転する円の文字 → 5本の幕が順に上へ） ---------- */
  function intro() {
    if (reduce) return;
    var box = document.createElement('div');
    box.className = 'g-in';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML =
      '<div class="bg"></div>' +
      '<svg class="rg" viewBox="0 0 84 84"><defs><path id="g-c" d="M42 42 m-30 0 a30 30 0 1 1 60 0 a30 30 0 1 1 -60 0"/></defs>' +
      '<text><textPath href="#g-c" textLength="186">reboot. reboot. reboot.</textPath></text></svg>' +
      '<div class="ru"><i></i><i></i><i></i><i></i><i></i></div>';
    var pg = document.querySelector('.pg');
    (pg || document.body).appendChild(box);
    var rg = box.querySelector('.rg');
    var bg = box.querySelector('.bg');
    setTimeout(function () { rg.style.opacity = '0'; }, 1600);
    setTimeout(function () { bg.style.opacity = '0'; }, 2300);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 3000);
    /* ページ移動時：5本の幕が下から順に上がって画面を覆う */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target) return;
      var h = a.getAttribute('href');
      if (!h || h.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(h)) return;
      e.preventDefault();
      var ov = document.createElement('div');
      ov.className = 'g-in';
      ov.innerHTML = '<div class="ru"><i></i><i></i><i></i><i></i><i></i></div>';
      (pg || document.body).appendChild(ov);
      var cols = ov.querySelectorAll('.ru i');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          cols.forEach(function (c, i) {
            c.style.transitionDelay = (i * 0.15) + 's';
            c.style.transform = 'translateY(0)';
          });
        });
      });
      setTimeout(function () { location.href = a.href; }, 1300);
    });
  }

  /* ---------- スクロールで表示（clip / top / hidden） ---------- */
  function reveals() {
    var els = document.querySelectorAll('[data-st]');
    if (!('IntersectionObserver' in window) || reduce) {
      els.forEach(function (el) { el.classList.add('v'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('v'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- ヘッダー：ヒーローを過ぎたらメニューを消してロゴとハンバーガーだけ／暗い面では白 ---------- */
  function header() {
    var hd = document.querySelector('[data-hd]');
    var hero = document.querySelector('.hero');
    var stu = document.querySelector('.stu');
    if (!hd || !hero) return;
    var darks = document.querySelectorAll('[data-dark]');
    var tick = false;
    function upd() {
      tick = false;
      var hh = hd.offsetHeight;
      var y = window.scrollY;
      var past = stu ? (stu.getBoundingClientRect().bottom - hh <= 0) : (y > hero.offsetHeight);
      var mid = hh / 2, inDark = false;
      for (var i = 0; i < darks.length; i++) {
        var r = darks[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { inDark = true; break; }
      }
      var top = !past;
      hd.classList.toggle('nt', !top && !inDark);
      hd.classList.toggle('iw', !top && inDark);
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* ---------- 実績のタブ（All / 年） ---------- */
  function tabs() {
    var t = document.querySelector('[data-tabs]');
    if (!t) return;
    var cards = document.querySelectorAll('.wc[data-y]');
    t.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      t.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var y = b.getAttribute('data-y');
      cards.forEach(function (c) {
        var show = y === 'all' || c.getAttribute('data-y') === y;
        c.classList.toggle('hide', !show);
        if (show) { var ph = c.querySelector('[data-st]'); if (ph) ph.classList.add('v'); }
      });
    });
  }

  /* ---------- ドロワー内のリンクで閉じる ---------- */
  function drawer() {
    var mt = document.getElementById('mn');
    document.querySelectorAll('.drw a').forEach(function (a) {
      a.addEventListener('click', function () { if (mt) mt.checked = false; });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mt) mt.checked = false; });
  }

  function init() { intro(); reveals(); header(); tabs(); drawer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
