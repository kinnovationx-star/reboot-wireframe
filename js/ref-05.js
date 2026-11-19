/* D案（ref-05）参考：tyo.co.jp/recruit の動きを素の JS で再現
   ・ローディング（下線のバーと数字、上下に割れて消える）
   ・ヒーローの文字が1文字ずつ下から出る
   ・ヒーローのスクロール演出（全画面→左に説明の列→枠に縮む）
   ・スクロールでふわっと出る／作品のスライダー／灰色の面に入ると背景が灰色に */
(function () {
  var root = document.documentElement;
  var pg = document.querySelector('.pg');
  if (!pg) return;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hc = document.querySelector('.hc');

  /* 文字を1文字ずつに分ける（要素はそのまま残す） */
  var n = 0;
  document.querySelectorAll('[data-split]').forEach(function (el) {
    Array.prototype.slice.call(el.childNodes).forEach(function (nd) {
      if (nd.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      nd.textContent.split(/(\s+)/).forEach(function (w) {
        if (!w) return;
        if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
        var ascii = /^[\x00-\x7f]+$/.test(w);
        var groups = ascii ? [w] : Array.from(w);
        groups.forEach(function (g) {
          var wd = document.createElement('span'); wd.className = 'wd'; if (el.tagName === 'H1') wd.setAttribute('aria-hidden', 'true');
          Array.from(g).forEach(function (c) {
            var ch = document.createElement('span'); ch.className = 'ch'; ch.textContent = c;
            ch.style.setProperty('--i', n++); wd.appendChild(ch);
          });
          frag.appendChild(wd);
        });
      });
      nd.parentNode.replaceChild(frag, nd);
    });
  });
  function showHero() { if (hc) hc.classList.add('go'); }

  /* ローディング */
  if (true) { showHero(); } else { /* ローディングは使わない */
    var ld = document.createElement('div');
    ld.className = 'ld'; ld.setAttribute('aria-hidden', 'true');
    ld.innerHTML = '<div class="up"><span class="cube cb q2"></span></div><div class="bar"></div><div class="lo"><span class="pc">00</span></div>';
    pg.appendChild(ld);
    /* setTimeout だけで進める（rAF が止まる環境でも必ず終わる） */
    var pc = ld.querySelector('.pc'), step = 0, steps = 25;
    var iv = setInterval(function () {
      step++;
      var p = Math.min(1, step / steps), v = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      ld.style.setProperty('--lp', v); pc.textContent = (v < 10 ? '0' : '') + v;
      if (p >= 1) {
        clearInterval(iv);
        setTimeout(function () {
          ld.classList.add('out'); setTimeout(showHero, 300);
          setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 1100);
        }, 200);
      }
    }, 56);
  }
  /* 念のため：何があっても 3.2 秒後にはヒーローの文字を出し、ローディングを消す */
  setTimeout(function () {
    showHero();
    var l = document.querySelector('.ld'); if (l && l.parentNode) l.parentNode.removeChild(l);
  }, 3200);

  /* スクロールでふわっと出る */
  var rv = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* 灰色の面に入ったら背景全体を灰色に（footer-recruit_bg） */
  var gz = document.querySelector('[data-gz]');
  var gbg = document.createElement('div'); gbg.className = 'gbg'; gbg.setAttribute('aria-hidden', 'true');
  pg.insertBefore(gbg, pg.firstChild);

  /* ヒーローのスクロール演出（PC幅のみ） */
  var hv = document.querySelector('.hv');
  var mq = window.matchMedia('(min-width: 821px)');
  function ramp(t, a, b) { return t <= a ? 0 : t >= b ? 1 : (t - a) / (b - a); }
  function setMode() { if (hv) hv.classList.toggle('sc', mq.matches && !reduce); }
  setMode();
  if (mq.addEventListener) mq.addEventListener('change', function () { setMode(); onScroll(); });

  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight;
    if (hv && hv.classList.contains('sc')) {
      var r = hv.getBoundingClientRect();
      var t = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - vh)));
      var s = ramp(t, .10, .28) - ramp(t, .62, .80);
      var o2 = ramp(t, .22, .32) - ramp(t, .56, .64);
      var st = hv.style;
      st.setProperty('--p', t.toFixed(4));
      st.setProperty('--s', s.toFixed(4));
      st.setProperty('--o2', o2.toFixed(4));
      st.setProperty('--ty', (1 - ramp(t, .22, .6)).toFixed(4));
      st.setProperty('--b2', ramp(t, .12, .28).toFixed(4));
      st.setProperty('--b3', ramp(t, .52, .64).toFixed(4));
      st.setProperty('--k', ramp(t, .70, .94).toFixed(4));
    }
    if (gz) {
      var g = gz.getBoundingClientRect();
      gbg.classList.toggle('on', g.top < vh * .6 && g.bottom > 0);
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* 作品のスライダー（un-recruit-interview の swiper 相当） */
  var trk = document.querySelector('[data-trk]');
  if (trk) {
    var pv = document.querySelector('[data-pv]'), nx = document.querySelector('[data-nx]');
    var cur = document.querySelector('[data-cur]'), prg = document.querySelector('[data-prg]');
    var items = trk.querySelectorAll('.wk');
    function step() { return items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : trk.clientWidth; }
    function sync() {
      var max = trk.scrollWidth - trk.clientWidth;
      var i = Math.round(trk.scrollLeft / step());
      if (trk.scrollLeft >= max - 2) i = items.length - 1;
      i = Math.max(0, Math.min(items.length - 1, i));
      cur.textContent = (i < 9 ? '0' : '') + (i + 1);
      prg.style.setProperty('--sp', max > 0 ? Math.max(.08, (trk.scrollLeft + trk.clientWidth) / trk.scrollWidth) : 1);
      pv.disabled = trk.scrollLeft <= 2; nx.disabled = trk.scrollLeft >= max - 2;
    }
    pv.addEventListener('click', function () { trk.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    nx.addEventListener('click', function () { trk.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    trk.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* スマホのメニュー：リンクを押したら閉じる */
  var mt = document.getElementById('mn');
  document.querySelectorAll('.spm a').forEach(function (a) { a.addEventListener('click', function () { if (mt) mt.checked = false; }); });
})();
