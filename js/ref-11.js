/* I案（ref-11）の動き：参考 corporate.beforward.jp/recruit の main.bundle.js と同じ順番・時間で再現（外部ライブラリなし） */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  }

  ready(function () {
    /* 1) ファーストビュー：筆跡→コピーと本文→写真→下の筆跡→左下・右の筆跡 の順に左からスライドイン
          （参考：300ms 後に pattern-a、+100 copy/main、+100 bg、+100 pattern-d、+150 pattern-b/c） */
    var items = document.querySelectorAll('.hero .h-a');
    items.forEach(function (el) {
      var d = reduce ? 0 : parseInt(el.getAttribute('data-d') || '0', 10);
      setTimeout(function () { el.classList.add('on'); }, d);
    });

    /* 2) 背景の筆跡：33% 見えたら表示（.bg-animate / .bg-animate-right） */
    var bgs = document.querySelectorAll('.ba,.bar');
    if (reduce || !('IntersectionObserver' in window)) {
      bgs.forEach(function (el) { el.classList.add('on'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.intersectionRatio > 0.33) { e.target.classList.add('on'); io.unobserve(e.target); }
        });
      }, { threshold: [0, 0.33, 0.5, 1] });
      bgs.forEach(function (el) { io.observe(el); });
    }

    /* 3) ヘッダー：50px 以上で隠し、上にスクロールした時だけ白地で出す（150px 以上で色を反転） */
    var hd = document.getElementById('hd');
    if (hd) {
      var last = window.scrollY;
      var upd = function () {
        var y = window.scrollY;
        if (y >= 50) hd.classList.add('sc'); else { hd.classList.remove('sc'); hd.classList.remove('up'); }
        if (y >= 150) hd.classList.add('setc'); else hd.classList.remove('setc');
        if (y < last) hd.classList.add('up'); else hd.classList.remove('up');
        last = y;
      };
      upd();
      document.addEventListener('scroll', upd, { passive: true });
    }

    /* 4) スマホのメニュー：開いている間は本文をスクロールさせない */
    var mn = document.getElementById('mn');
    if (mn) {
      mn.addEventListener('change', function () { document.body.style.overflow = mn.checked ? 'hidden' : ''; });
      document.querySelectorAll('.nv a').forEach(function (a) {
        a.addEventListener('click', function () { if (mn.checked) { mn.checked = false; document.body.style.overflow = ''; } });
      });
    }
  });
})();
