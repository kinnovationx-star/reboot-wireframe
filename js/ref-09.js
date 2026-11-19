/* H案（ref-09）参考：toei.co.jp の動きの再現。外部ライブラリなし。 */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pg = d.querySelector('.pg');
  if (!pg) return;
  root.classList.add('js');
  var isSP = function () { return window.innerWidth <= 768; };

  /* ---------- 1. ローディング（三角が回る黒い画面）→ キービジュアルの登場 ---------- */
  var hd = d.querySelector('.hd');
  var kvi = [].slice.call(d.querySelectorAll('.kv .kvi'));
  var kvf = [].slice.call(d.querySelectorAll('.kv .kvf'));
  var tri = '<svg viewBox="0 0 56 56" aria-hidden="true"><path d="M28 6 52 48H4Z"/></svg>';
  function intro() {
    kvi.forEach(function (el, i) { setTimeout(function () { el.classList.add('on'); }, 1000 + i * 350); });
    var t2 = 1000 + kvi.length * 350 + 500;
    setTimeout(function () {
      kvf.forEach(function (el) { el.classList.add('on'); });
      if (hd) hd.classList.remove('pre');
    }, t2);
  }
  if (true) { /* ローディングは使わない */
    kvi.concat(kvf).forEach(function (el) { el.classList.add('on'); });
  } else {
    if (hd) hd.classList.add('pre');
    var ld = d.createElement('div');
    ld.className = 'hload';
    ld.setAttribute('aria-hidden', 'true');
    ld.innerHTML = '<div class="ld">' + tri + tri + tri + '</div>';
    d.body.appendChild(ld);
    var started = false;
    var go = function () {
      if (started) return; started = true;
      setTimeout(function () {
        ld.classList.add('out');
        setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 600);
        intro();
      }, 1000);
    };
    if (d.readyState === 'complete') go(); else window.addEventListener('load', go);
    setTimeout(go, 4000); // 画像が遅くても止まらないように
  }

  /* ---------- 2. 横に流れる写真（キービジュアル3層・採用） ---------- */
  function loop(track, dur) {
    if (!track || track.dataset.cloned) return;
    var kids = [].slice.call(track.children);
    kids.forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      [].slice.call(c.querySelectorAll('img')).forEach(function (im) { im.alt = ''; });
      track.appendChild(c);
    });
    track.dataset.cloned = '1';
    if (dur) track.style.setProperty('--d', dur);
    if (!reduce) track.classList.add('run');
  }
  [].slice.call(d.querySelectorAll('.kv .trk')).forEach(function (t) { loop(t); });
  var rtr = d.querySelector('.rtr');
  if (rtr) loop(rtr, '60s');

  /* ---------- 3. 実績：ぼかした作品の帯 ＋ 三角の窓の中だけくっきり ---------- */
  var wkv = d.querySelector('.wkv'), wr = d.querySelector('.wr');
  var poly = null;
  if (wkv && wr) {
    [].slice.call(wr.querySelectorAll('.wtr')).forEach(function (t) {
      var n = t.children.length;
      loop(t, (n * 2 * 3) + 's'); // 1枚あたり約3秒
      if (t.dataset.dir === '-1') t.classList.add('rev');
    });
    var blur = wr.cloneNode(true);
    blur.className = 'wblur';
    [].slice.call(blur.querySelectorAll('img')).forEach(function (im) { im.alt = ''; });
    wkv.insertBefore(blur, wr);
    var ns = 'http://www.w3.org/2000/svg';
    var svg = d.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'wstk');
    svg.setAttribute('aria-hidden', 'true');
    poly = d.createElementNS(ns, 'polygon');
    svg.appendChild(poly);
    wkv.appendChild(svg);
  }
  function triPts(cx, cy, r, deg) {
    var p = [];
    for (var i = 0; i < 3; i++) {
      var a = (deg - 90 + i * 120) * Math.PI / 180;
      p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return p;
  }
  function updWorks(prog) {
    if (!wkv || !poly) return;
    var w = wkv.clientWidth, h = wkv.clientHeight;
    var r = Math.min(w, h * 1.15) * (isSP() ? 0.6 : 0.43);
    var cx = w * (isSP() ? 0.5 : 0.56), cy = h * 0.46;
    var deg = 35 + (prog - 0.5) * 50;
    var pts = triPts(cx, cy, r, deg);
    wr.style.clipPath = 'polygon(' + pts.map(function (q) { return q[0].toFixed(1) + 'px ' + q[1].toFixed(1) + 'px'; }).join(',') + ')';
    poly.setAttribute('points', pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '));
    svg && svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  }

  /* カーソルに付いてくる円（PCのみ） */
  var cur = d.querySelector('.cur');
  if (cur && wkv && !reduce && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var on = false;
    var place = function (e) { cur.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)'; };
    wkv.addEventListener('mouseenter', function (e) {
      if (isSP()) return;
      on = true; cur.classList.add('fix', 'show'); wkv.classList.add('cursor-on'); place(e);
    });
    wkv.addEventListener('mousemove', function (e) { if (on) place(e); });
    wkv.addEventListener('mouseleave', function () {
      on = false; cur.classList.remove('fix', 'show'); wkv.classList.remove('cursor-on'); cur.style.transform = '';
    });
  }

  /* ---------- 4. 見出しの文字が下からせり上がる ---------- */
  function split(el, perChar) {
    if (el.dataset.split) return;
    var text = el.textContent;
    el.dataset.split = '1';
    el.setAttribute('aria-label', text);
    var parts = perChar ? Array.from(text) : [text];
    el.innerHTML = '';
    parts.forEach(function (ch, i) {
      var s = d.createElement('span'); s.className = 'fu'; s.setAttribute('aria-hidden', 'true');
      var b = d.createElement('b'); b.textContent = ch === ' ' ? ' ' : ch;
      b.style.transitionDelay = (i * 0.03) + 's';
      s.appendChild(b); el.appendChild(s);
    });
  }
  if (!reduce) {
    [].slice.call(d.querySelectorAll('.sch .ln')).forEach(function (el) { split(el, true); });
    [].slice.call(d.querySelectorAll('.tt1')).forEach(function (el) { split(el, false); });
  }

  /* ---------- 5. 画面に入ったら表示（文字・三角の写真） ---------- */
  var watch = [].slice.call(d.querySelectorAll('.fu, .ap'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(function (el) { el.classList.add('on'); });
  }

  /* ---------- 6. スクロールに合わせて三角が回る ＋ ヘッダーの出入り・色 ---------- */
  var stks = [].slice.call(d.querySelectorAll('.sc .stk'));
  var figs = [].slice.call(d.querySelectorAll('.sc .scfig'));
  var secs = [].slice.call(d.querySelectorAll('[data-tone]')).filter(function (s) { return s !== hd; });
  var last = 0, ticking = false;
  if (hd) { hd.style.position = 'fixed'; }
  function prog(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
  }
  function frame() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop;
    if (!reduce) {
      stks.forEach(function (s) {
        var p = prog(s.parentNode), base = parseFloat(s.dataset.rot || 0);
        if (!isSP()) s.style.transform = 'rotate(' + (base + (p - 0.5) * 40) + 'deg)';
      });
      figs.forEach(function (f) {
        if (isSP()) { f.style.translate = ''; return; }
        var p = prog(f.parentNode);
        f.style.translate = '0 ' + ((0.5 - p) * 80).toFixed(1) + 'px';
      });
    }
    if (wkv) updWorks(reduce ? 0.5 : prog(wkv));
    // IntersectionObserver が働かない環境でも必ず表示されるように
    var vh = window.innerHeight;
    for (var k = watch.length - 1; k >= 0; k--) {
      var el = watch[k];
      if (el.classList.contains('on')) { watch.splice(k, 1); continue; }
      if (el.getBoundingClientRect().top < vh * 0.92) { el.classList.add('on'); watch.splice(k, 1); }
    }
    if (hd) {
      if (!reduce && !d.getElementById('mn').checked) {
        if (y > last && y > 120) hd.classList.add('hide'); else hd.classList.remove('hide');
      }
      last = y <= 0 ? 0 : y;
      var tone = '';
      if (y > 40) {
        var hb = hd.offsetHeight;
        for (var i = 0; i < secs.length; i++) {
          var r = secs[i].getBoundingClientRect();
          if (r.top <= hb && r.bottom > hb) { tone = secs[i].getAttribute('data-tone'); break; }
        }
        if (!tone) tone = 'black';
      }
      hd.setAttribute('data-tone', tone);
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();
})();
