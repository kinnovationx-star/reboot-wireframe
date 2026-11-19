/* A案（参考：spriggan-anime.jp）の動き。外部ライブラリなし。
   オープニング／KVの文字シャッフル／スクロール表示／ヘッダーの白黒切替／作品スライダー／背景グリッチとパララックス／マウスストーカー */
(function () {
  'use strict';
  var d = document, html = d.documentElement, pg = d.querySelector('.pg');
  if (!pg) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isPC = function () { return window.matchMedia('(min-width: 901px)').matches; };
  html.classList.add('js');

  /* ---------- オープニング（p-op：拡大→RGBずれ→ブラウン管が消えるように潰れる、3.1秒） ---------- */
  var seen = false;
  try { seen = sessionStorage.getItem('rb-op') === '1'; sessionStorage.setItem('rb-op', '1'); } catch (e) {}
  function opEnd() { html.classList.add('op-end'); }
  if (reduce || seen) {
    opEnd();
  } else {
    var op = d.createElement('div');
    op.className = 'op tx-deep';
    op.setAttribute('aria-hidden', 'true');
    var th = '';
    var cols = ['rgba(255,255,255,.9)', 'rgba(224,46,44,.85)', 'rgba(0,255,255,.6)', 'rgba(255,255,255,.7)', 'rgba(224,46,44,.7)', 'rgba(60,80,255,.6)'];
    for (var i = 0; i < 12; i++) {
      var y = Math.round(Math.random() * 90), h = 2 + Math.round(Math.random() * 14);
      th += '<div class="th" style="background:linear-gradient(180deg,transparent ' + y + '%,' + cols[i % 6] + ' ' + y + '%,' + cols[i % 6] + ' ' + (y + h) + '%,transparent ' + (y + h) + '%);animation-delay:' + (1.0 + i * 0.05).toFixed(2) + 's"></div>';
    }
    op.innerHTML = th + '<div class="lg"><div class="lw"><div class="li"><b>REBOOT</b><small>リブート</small>' +
      '<span style="color:cyan;right:-2px;left:auto">REBOOT</span><span style="color:red;left:-2px">REBOOT</span><span style="color:blue;left:-3px">REBOOT</span></div></div></div>';
    pg.appendChild(op);
    requestAnimationFrame(function () { requestAnimationFrame(function () { op.classList.add('go'); }); });
    setTimeout(function () { op.classList.add('end'); }, 2900);
    setTimeout(function () { opEnd(); }, 3100);
    setTimeout(function () { if (op.parentNode) op.parentNode.removeChild(op); }, 3400);
  }

  /* ---------- KV：キャプションの文字シャッフル（Chaffle：speed 20 / delay 40） ---------- */
  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function chaffle(el) {
    if (reduce || el._run) return;
    var txt = el._t || (el._t = el.textContent), n = txt.length, k = 0;
    el._run = true;
    var out = txt.split('').map(function (c) { return c === ' ' ? ' ' : ''; });
    var t = setInterval(function () {
      for (var i = 0; i < n; i++) {
        if (i < k) out[i] = txt[i];
        else if (txt[i] !== ' ' && i < k + 8) out[i] = CH[Math.floor(Math.random() * CH.length)];
      }
      el.textContent = out.join('');
      k += 0.5;
      if (k > n) { clearInterval(t); el.textContent = txt; el._run = false; }
    }, 20);
  }
  Array.prototype.forEach.call(d.querySelectorAll('.it'), function (li) {
    var b = li.querySelector('[data-chaffle]');
    if (!b) return;
    li.addEventListener('mouseenter', function () { chaffle(b); });
    var r = li.querySelector('.kr');
    if (r) r.addEventListener('change', function () {
      Array.prototype.forEach.call(d.querySelectorAll('.it [data-chaffle]'), function (x) { if (x !== b) chaffle(x); });
    });
  });

  /* ---------- スクロールで表示（js-scroll-effect-module：displayRatio .8 で is-active） ---------- */
  var targets = d.querySelectorAll('.rv, .bnr, .mv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-active'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -20% 0px' });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-active'); });
  }

  /* ---------- ヘッダー：KVを過ぎたらハンバーガーを白に、縦ロゴを出す ---------- */
  var hd = d.querySelector('.hd'), tw = d.querySelector('.tw');
  var shards = d.querySelectorAll('.sh');
  function onScroll() {
    if (tw && hd) hd.classList.toggle('is-white', tw.getBoundingClientRect().top < innerHeight * 0.05);
    /* 背景の破片のパララックス（0.08 / 0.02 / 0.015） */
    if (!reduce) Array.prototype.forEach.call(shards, function (s, i) {
      var r = s.parentNode.getBoundingClientRect();
      var pos = s.offsetTop + r.top + scrollY;
      var diff = scrollY - pos, rate = [0.02, 0.08, 0.015][i % 3];
      s.style.transform = 'translate3d(0,' + (-(diff * rate)).toFixed(1) + 'px,0)';
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* 背景の破片：ランダムにノイズ（RANDOM_MODULE：間隔 200±150ms・1100ms） */
  if (!reduce && shards.length) {
    (function tick() {
      var s = shards[Math.floor(Math.random() * shards.length)];
      s.classList.add('on');
      setTimeout(function () { s.classList.remove('on'); }, 550);
      setTimeout(tick, 900 + Math.random() * 1500);
    })();
  }

  /* メニュー内のリンクで閉じる */
  var mt = d.getElementById('mn');
  Array.prototype.forEach.call(d.querySelectorAll('.nv a'), function (a) {
    a.addEventListener('click', function () { if (mt) mt.checked = false; });
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mt) mt.checked = false; });

  /* ---------- 作品スライダー（Swiper：speed 800 / 自動 5000ms / 前後ボタン） ---------- */
  var sl = d.querySelector('[data-sl]');
  if (sl) {
    var st = sl.querySelector('.st'), items = st.querySelectorAll('.sli'), n = items.length, cur = 0, timer;
    sl.classList.add('on');
    st.scrollLeft = 0;
    function gap() { return parseFloat(getComputedStyle(st).columnGap) || 0; }
    function go(i) {
      cur = (i + n) % n;
      var w = items[0].getBoundingClientRect().width + gap();
      st.style.transform = 'translate3d(' + (-cur * w) + 'px,0,0)';
      Array.prototype.forEach.call(items, function (it, j) {
        it.classList.toggle('act', j === cur);
        it.setAttribute('tabindex', Math.abs(j - cur) <= 0 ? '0' : '-1');
      });
    }
    function auto() { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 5000); }
    sl.querySelector('.sbt.p').addEventListener('click', function () { go(cur - 1); auto(); });
    sl.querySelector('.sbt.n').addEventListener('click', function () { go(cur + 1); auto(); });
    var sx = null;
    st.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); auto(); }
    });
    addEventListener('resize', function () { go(cur); });
    go(0); auto();
  }

  /* ---------- マウスストーカー（PCのみ・リンク上で照準が回る） ---------- */
  if (!reduce && isPC() && matchMedia('(pointer: fine)').matches) {
    var c = d.createElement('div');
    c.className = 'ccur';
    c.setAttribute('aria-hidden', 'true');
    c.innerHTML = '<div class="rot"><div class="c1"></div><div class="pt"><i></i><i></i><i></i><i></i></div></div><div class="c2"></div>';
    pg.appendChild(c);
    var mx = -100, my = -100;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() { c.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)'; requestAnimationFrame(loop); })();
    d.addEventListener('mouseleave', function () { c.classList.add('hide'); });
    d.addEventListener('mouseenter', function () { c.classList.remove('hide'); });
    d.addEventListener('mouseover', function (e) {
      var t = e.target.closest && e.target.closest('a, label, button');
      c.classList.toggle('act', !!t);
    });
  }
})();
