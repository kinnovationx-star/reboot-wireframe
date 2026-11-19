/* J案（ref-12）egaco の動きの再現：js-enter（画面に入ったら is-enter）、
   見出しのマスク表示・ブラシの線を描く動き・カードのスライドイン、ヘッダーの出入り、作品スライダー */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1) 画面に入ったら is-enter（egaco と同じ rootMargin 0）
  var els = document.querySelectorAll('.pg .je');
  function enter(el) { el.classList.add('is-enter'); }
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(enter);
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); enter(e.target); }
      });
    }, { rootMargin: '0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // 2) ヘッダー：スクロールしたら白地、下へスクロールで隠れ、上へで戻る
  var hd = document.querySelector('.pg .hd');
  var mt = document.getElementById('mn');
  var last = window.pageYOffset || 0;
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (!hd) return;
    hd.classList.toggle('is-scroll', y > 0);
    var open = mt && mt.checked;
    hd.classList.toggle('is-hide', !open && y > last && y > 112);
    last = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3) 作品のスライダー（egaco のレッスン一覧：左右の丸い矢印＋ドット）
  document.querySelectorAll('.pg .sl').forEach(function (sl) {
    var list = sl.querySelector('.ls-list');
    if (!list) return;
    var items = list.children;
    var vp = document.createElement('div');
    vp.className = 'sl-vp';
    list.parentNode.insertBefore(vp, list);
    vp.appendChild(list);
    var nav = document.createElement('div');
    nav.className = 'sl-nav';
    nav.innerHTML = '<button type="button" class="sl-btn sl-prev" aria-label="前へ"><i class="tri"></i></button>' +
      '<button type="button" class="sl-btn sl-next" aria-label="次へ"><i class="tri"></i></button><div class="sl-dots"></div>';
    sl.appendChild(nav);
    sl.classList.add('on');
    var prev = nav.querySelector('.sl-prev'), next = nav.querySelector('.sl-next'), dots = nav.querySelector('.sl-dots');
    var idx = 0, max = 0;
    function step() {
      if (items.length < 2) return 0;
      return items[1].offsetLeft - items[0].offsetLeft;
    }
    function build() {
      var w = step() || 1;
      var visible = Math.max(1, Math.floor((sl.clientWidth + 20) / w));
      max = Math.max(0, items.length - visible);
      dots.innerHTML = '';
      for (var i = 0; i <= max; i++) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', (i + 1) + '枚目へ');
        (function (n) { b.addEventListener('click', function () { go(n); }); })(i);
        dots.appendChild(b);
      }
      go(Math.min(idx, max));
    }
    function go(n) {
      idx = Math.max(0, Math.min(max, n));
      list.style.transform = 'translateX(' + (-idx * step()) + 'px)';
      prev.disabled = idx === 0;
      next.disabled = idx === max;
      Array.prototype.forEach.call(dots.children, function (d, i) { d.classList.toggle('cur', i === idx); });
    }
    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
    build();
    // スワイプ
    var sx = null;
    vp.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    vp.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      sx = null;
    });
  });
})();
