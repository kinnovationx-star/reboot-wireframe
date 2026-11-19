/* F案（ref-07）参考：mov-kuramae.kokuyo.com の動きを素の JS で再現 */
(function () {
  'use strict';
  var pg = document.querySelector('.pg');
  if (!pg) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  var isSp = function () { return window.innerWidth <= 767; };
  document.documentElement.classList.add('js');
  pg.classList.add('js');

  /* 1. ヘッダー：200px スクロールしたら白い固定ヘッダーをフェードで出す */
  var onScroll = function () { pg.classList.toggle('is-scrolled', window.scrollY > 200); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  /* スマホメニュー：リンクを押したら閉じる */
  var mt = document.getElementById('mn');
  if (mt) pg.querySelectorAll('.nv a').forEach(function (a) { a.addEventListener('click', function () { mt.checked = false; }); });

  /* 2. メインビジュアル：フェードのスライダー（切替 2 秒・間隔 5 秒）、左右半分クリックで前後 */
  var slides = Array.prototype.slice.call(pg.querySelectorAll('.mv .sl'));
  var cur = 0, timer = null;
  function go(n) {
    slides[cur].classList.remove('on');
    cur = (n + slides.length) % slides.length;
    slides[cur].classList.add('on');
  }
  function play() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 5000); }
  if (slides.length > 1) {
    var mv = pg.querySelector('.mv');
    [['p', '前の写真', -1], ['n', '次の写真', 1]].forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'mvn ' + d[0]; b.setAttribute('aria-label', d[1]);
      b.dataset.cursor = d[0] === 'p' ? 'slider-prev' : 'slider-next';
      b.addEventListener('click', function () { go(cur + d[2]); play(); });
      mv.insertBefore(b, mv.querySelector('.bn'));
    });
    play();
  }

  /* 3. 見出しの英字：1 文字ずつに分け、順番をばらばらにして下からふわっと出す（stagger .06s / .4s） */
  var heads = pg.querySelectorAll('.hd2 .sb');
  heads.forEach(function (el) {
    var t = el.textContent; el.textContent = '';
    var chars = [];
    Array.from(t).forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'ch';
      if (c === ' ') { s.innerHTML = '&nbsp;'; } else { s.textContent = c; }
      el.appendChild(s); chars.push(s);
    });
    var order = chars.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var k = order[i]; order[i] = order[j]; order[j] = k; }
    order.forEach(function (ci, n) { chars[ci].style.setProperty('--d', (n * 0.06).toFixed(2) + 's'); });
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -20% 0px' });
    heads.forEach(function (el) { io.observe(el); });
  } else { heads.forEach(function (el) { el.classList.add('in'); }); }

  /* 4. コンセプトのロゴ文字：スクロールに合わせて「く」の字の線の上をすべって定位置へ（scrub 1.2） */
  var sec = pg.querySelector('.cp');
  var letters = Array.prototype.slice.call(pg.querySelectorAll('.lsv .lt'));
  var T = [515.819, 3.368], A = [7.595, 332.421], B = [515.819, 635.893];
  function pt(t) {
    if (t <= 0.5) { var e = t / 0.5; return [T[0] + (A[0] - T[0]) * e, T[1] + (A[1] - T[1]) * e]; }
    var f = (t - 0.5) / 0.5; return [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f];
  }
  if (sec && letters.length && !reduce) {
    var target = 0, shown = 0, raf = null;
    var draw = function () {
      shown += (target - shown) * 0.08;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      letters.forEach(function (l) {
        var t0 = +l.dataset.t0, t1 = +l.dataset.t1;
        var p = pt(t0 + (t1 - t0) * shown), q = pt(t1);
        l.setAttribute('transform', 'translate(' + (p[0] - q[0]).toFixed(2) + ' ' + (p[1] - q[1]).toFixed(2) + ')');
      });
      raf = shown !== target ? requestAnimationFrame(draw) : null;
    };
    var measure = function () {
      var r = sec.getBoundingClientRect(), vh = window.innerHeight, p;
      if (isSp()) { var s = sec.querySelector('.lsv').getBoundingClientRect(); p = (vh - 100 - s.top) / (vh - 200); }
      else { p = (vh - r.top) / (vh + r.height); }
      target = Math.max(0, Math.min(1, p));
      if (!raf) raf = requestAnimationFrame(draw);
    };
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure(); shown = target; draw();
  }

  /* 5. 強み：カードのスライダー（PC・タブレット 2 枚／スマホ 1 枚、4 秒ごと、移動 1 秒、端で先頭へ戻る） */
  var ssv = pg.querySelector('.ssv');
  if (ssv) {
    var list = ssv.querySelector('.ssl'), items = Array.prototype.slice.call(list.children), idx = 0, st = null;
    var prev = document.createElement('button'), next = document.createElement('button');
    prev.type = next.type = 'button'; prev.className = 'ssa p'; next.className = 'ssa n';
    prev.setAttribute('aria-label', '前へ'); next.setAttribute('aria-label', '次へ');
    ssv.appendChild(prev); ssv.appendChild(next); ssv.classList.add('on');
    var per = function () { return window.innerWidth >= 768 ? 2 : 1; };
    var gap = function () { return window.innerWidth >= 1200 ? 20 : 10; };
    var layout = function () {
      var w = ssv.clientWidth, g = gap(), n = per(), sw = (w - g * (n - 1)) / n;
      items.forEach(function (it, i) { it.style.width = sw + 'px'; it.style.marginRight = (i < items.length - 1 ? g : 0) + 'px'; });
      var max = items.length - n; if (idx > max) idx = max;
      list.style.transform = 'translateX(' + (-(sw + g) * idx) + 'px)';
      prev.disabled = idx === 0; next.disabled = idx === max;
      items.forEach(function (it, i) { it.setAttribute('aria-hidden', i < idx - 1 || i > idx + n ? 'true' : 'false'); });
    };
    var move = function (d) { var max = items.length - per(); idx = idx + d > max ? 0 : (idx + d < 0 ? max : idx + d); layout(); };
    prev.addEventListener('click', function () { move(-1); auto(); });
    next.addEventListener('click', function () { move(1); auto(); });
    var auto = function () { clearInterval(st); if (!reduce) st = setInterval(function () { move(1); }, 4000); };
    window.addEventListener('resize', layout);
    layout(); auto();
  }

  /* 6. 実績のギャラリー：横にゆっくり流れ続ける（1 フレーム 0.6px、1200px 以下は 0.5px） */
  var glt = pg.querySelector('.glt');
  if (glt && !reduce) {
    Array.prototype.slice.call(glt.children).forEach(function (g) {
      var c = g.cloneNode(true); c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      glt.appendChild(c);
    });
    glt.classList.add('on');
    var x = 0, half = 0;
    var size = function () { half = glt.scrollWidth / 2; };
    size(); window.addEventListener('resize', size);
    window.addEventListener('load', size);
    (function loop() {
      x -= window.innerWidth <= 1200 ? 0.5 : 0.6;
      if (half && x <= -half) x = 0;
      glt.style.transform = 'translateX(' + x + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* 7. お客様の声：アコーディオン（高さをなめらかに開閉、最初の 1 件だけ開く） */
  pg.querySelectorAll('.vl details').forEach(function (d, i) {
    var sum = d.querySelector('summary'), ans = d.querySelector('.ans');
    var pnl = document.createElement('div'); pnl.className = 'pnl';
    d.insertBefore(pnl, ans); pnl.appendChild(ans);
    if (i > 0) d.open = false;
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (reduce) { d.open = !d.open; return; }
      if (d.open) {
        pnl.style.height = pnl.scrollHeight + 'px';
        requestAnimationFrame(function () { pnl.style.transition = 'height .4s ease'; pnl.style.height = '0px'; });
        setTimeout(function () { d.open = false; pnl.style.cssText = ''; }, 420);
      } else {
        d.open = true; pnl.style.height = '0px';
        requestAnimationFrame(function () { pnl.style.transition = 'height .4s ease'; pnl.style.height = pnl.scrollHeight + 'px'; });
        setTimeout(function () { pnl.style.cssText = ''; }, 420);
      }
    });
  });

  /* 8. ボタンの文字：ホバーで 1 文字ずつ波打つ（.6s、1 文字 .07s ずらし） */
  pg.querySelectorAll('.b1 a, .cta, .nvc').forEach(function (a) {
    var txt = a.textContent.trim(); if (!txt) return;
    a.setAttribute('aria-label', txt); a.textContent = '';
    var w = document.createElement('span'); w.className = 'wv'; w.setAttribute('aria-hidden', 'true');
    Array.from(txt).forEach(function (c, i) {
      var s = document.createElement('span'); s.className = 'wc';
      if (c === ' ') s.innerHTML = '&nbsp;'; else s.textContent = c;
      s.style.animationDelay = (i * 0.07) + 's'; w.appendChild(s);
    });
    a.appendChild(w);
    var busy = false;
    a.addEventListener('mouseenter', function () {
      if (busy || reduce) return; busy = true;
      w.classList.remove('on'); void w.offsetWidth; w.classList.add('on');
      setTimeout(function () { w.classList.remove('on'); busy = false; }, 600 + 70 * (txt.length - 1));
    });
  });

  /* 9. マウスストーカー：カード・お知らせ・ボタンの上で「く」の字の矢印がカーソルに付いてくる */
  if (fine) {
    var cur2 = document.createElement('div'); cur2.className = 'c-cursor'; cur2.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur2);
    var mx = 0, my = 0, fr = null;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!fr) fr = requestAnimationFrame(function () { cur2.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; fr = null; });
    }, { passive: true });
    pg.querySelectorAll('.b1.cv a').forEach(function (a) { a.dataset.cursor = 'default'; });
    pg.querySelectorAll('.b1:not(.cv) a').forEach(function (a) { a.dataset.cursor = 'default-reverse'; });
    pg.querySelectorAll('[data-cursor], .pl .cd a, .nwl a').forEach(function (el) {
      if (!el.dataset.cursor) el.dataset.cursor = 'default';
      el.style.cursor = 'none';
      el.addEventListener('mouseenter', function (e) {
        cur2.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0)';
        cur2.dataset.cursor = el.dataset.cursor; cur2.classList.add('is-visible');
      });
      el.addEventListener('mouseleave', function () { cur2.classList.remove('is-visible'); });
    });
  }
})();
