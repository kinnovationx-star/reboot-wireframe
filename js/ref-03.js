/* B案（参考：kawamoto5610.com）の動き。公開用HTMLだけで読み込む。
   JSが無いときは全部そのまま見える。最初に隠す状態は html.js の時だけCSSで効かせる。 */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- ヘッダー：スクロールしたら影、FVを過ぎたらロゴと文字のメニューをしまう ---- */
  var hd = document.querySelector('.hd');
  var mt = document.getElementById('mn');
  if (hd) {
    var mark = function () {
      hd.classList.toggle('is-scrolled', scrollY > 40);
      var compact = scrollY > innerHeight * 0.6;
      if (!compact && hd.classList.contains('is-compact') && innerWidth > 900 && mt) mt.checked = false;
      hd.classList.toggle('is-compact', compact);
    };
    addEventListener('scroll', mark, { passive: true });
    mark();
    if (mt) hd.querySelectorAll('.nv a').forEach(function (a) {
      a.addEventListener('click', function () { mt.checked = false; });
    });
  }

  /* ---- 見出しを1行ずつに分け、画面に入ったら下からマスクで出す ---- */
  function split(el) {
    if (el.dataset.split) return;
    var parts = el.innerHTML.split(/<br\s*\/?>/i).map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) return;
    el.innerHTML = parts.map(function (p, i) {
      return '<span class="rl"><span class="rli" style="--i:' + i + '">' + p + '</span></span>';
    }).join('');
    el.dataset.split = '1';
    el.classList.add('reveal-lines');
  }
  if (!reduce) ['.sdh', '.shc', '.wtl', '.vot h2', '.stt', '.ctl', '.ott', '.oce', '.gen'].forEach(function (s) {
    document.querySelectorAll(s).forEach(split);
  });

  /* ---- スムーススクロール（ホイールの動きをなめらかに。タッチ端末はそのまま） ---- */
  (function () {
    if (reduce || matchMedia('(hover: none)').matches) return;
    var EASE = 0.085, target = scrollY, current = scrollY, running = false;
    root.style.scrollBehavior = 'auto';
    var limit = function () { return root.scrollHeight - innerHeight; };
    var clamp = function (v) { return Math.max(0, Math.min(limit(), v)); };
    function loop() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.35) { current = target; running = false; }
      scrollTo(0, current);
      if (running) requestAnimationFrame(loop);
    }
    function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
    addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      target = clamp(target + e.deltaY);
      start();
    }, { passive: false });
    addEventListener('scroll', function () { if (!running) { target = scrollY; current = scrollY; } }, { passive: true });
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      a.addEventListener('click', function (e) {
        var el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        target = clamp(el.getBoundingClientRect().top + scrollY - 90);
        start();
      });
    });
  })();

  /* ---- スクロールに合わせて動かすもの（汎用パララックス・スタジオ写真のすれ違い・紙芝居） ---- */
  var px = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var her = document.querySelector('.her');
  var tvs = [].slice.call(document.querySelectorAll('.tv'));
  var under = document.querySelector('.oc1');
  var over = document.querySelector('.oc2');
  var ticking = false;
  function apply() {
    ticking = false;
    px.forEach(function (el) {
      var b = el.parentElement.getBoundingClientRect();
      var span = innerHeight / 2 + b.height / 2;
      var p = Math.max(-1, Math.min(1, (b.top + b.height / 2 - innerHeight / 2) / span));
      el.style.transform = 'translateY(' + (p * parseFloat(el.dataset.parallax)) + 'px)';
    });
    if (her && tvs.length) {
      var r = her.getBoundingClientRect();
      var sp = innerHeight / 2 + r.height / 2;
      var pr = Math.max(-1, Math.min(1, (r.top + r.height / 2 - innerHeight / 2) / sp));
      tvs.forEach(function (el) {
        var cs = getComputedStyle(el);
        var scale = el.offsetHeight / 597.3;
        var rest = parseFloat(cs.getPropertyValue('--rest') || 0) * scale;
        var dir = parseFloat(cs.getPropertyValue('--dir') || 0);
        el.style.transform = 'translateY(' + (rest + dir * 70 * pr) + 'px)';
      });
    }
    if (under && over) {
      var u = under.getBoundingClientRect(), o = over.getBoundingClientRect();
      var k = Math.min(1, Math.max(0, 1 - (o.top - u.top) / u.height));
      under.style.transform = 'scale(' + (1 - k * 0.06) + ')';
      under.style.filter = 'brightness(' + (1 - k * 0.35) + ')';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }
  if (!reduce) {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    addEventListener('visibilitychange', function () { if (!document.hidden) apply(); });
    apply();
  }

  /* ---- 画面に入ったら表示（ふわっと上がる／行マスク／写真が下から開く／キャラのポップイン） ---- */
  var st = document.createElement('style');
  st.textContent =
    '.js .reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}' +
    '.js .reveal.visible{opacity:1;transform:none}' +
    '.rl{display:block;overflow:hidden;padding-bottom:.14em;margin-bottom:-.14em}' +
    '.rli{display:inline-block;transform:translateY(115%)}' +
    '.reveal-lines.visible .rli{animation:up 1.1s cubic-bezier(.22,1,.36,1) forwards;animation-delay:calc(var(--i,0) * .13s)}' +
    '.oce.reveal-lines .rl,.gen.reveal-lines .rl{display:block}' +
    '.js .mi .mv,.js .shv .chr{transform:scale(0);opacity:0}' +
    '.js .mi.visible .mv{animation:pop .8s cubic-bezier(.34,1.45,.5,1) .15s forwards}' +
    '.js .sh.visible .shv .chr{animation:pop .9s cubic-bezier(.34,1.45,.5,1) .3s forwards}' +
    '@media (prefers-reduced-motion:reduce){.js .reveal{opacity:1;transform:none;transition:none}.js .mi .mv,.js .shv .chr{transform:none;opacity:1}}';
  document.head.appendChild(st);

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-lines,.cc,.cfc,.mi,.sh,.git').forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  var fades = document.querySelectorAll('.sdi, .sh, .mi, .spn, .vb, .dr, .cnt, .oc, .cqa, .nm li');
  fades.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  document.querySelectorAll('.reveal-lines, .cc, .cfc, .git').forEach(function (el) { io.observe(el); });

  /* ---- 右下の相談キャラ：開いて4秒後と、FVを過ぎたときにひとこと声をかける ---- */
  var bud = document.querySelector('.bud');
  if (bud) {
    var greet = function () {
      bud.classList.add('is-greeting');
      setTimeout(function () { bud.classList.remove('is-greeting'); }, 4000);
    };
    setTimeout(greet, 4000);
    var passed = false;
    addEventListener('scroll', function () {
      if (!passed && scrollY > innerHeight) { passed = true; greet(); }
    }, { passive: true });
  }
})();
