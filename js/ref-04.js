/* C案（参考：pulpo.jp）の動き。外部ライブラリなし。
   ローディング → ファーストビューの文字と写真が弾んで出る／見出しの英字が1文字ずつ色つきで下から出て白に戻る／
   要素が下から弾んで出る（bounceInUp）／強みのカードが縦スクロールに合わせて横に流れる（PC）／
   スタジオの写真のパララックス／募集の写真が順に弾んで出る／右下 SCROLL の帯はフッターで消える */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pg = d.querySelector('.pg');
  if (!pg) return;

  var css = d.createElement('style');
  css.textContent = [
    '.js .rv{opacity:0;transform:translateY(50px)}',
    '.js .rv.-move{animation:bounceInUp .4s forwards}',
    '.js .bi{opacity:0;transform:scale(.5) translateY(50px)}',
    '.js .bi.-move{animation:bounceIn .8s forwards}',
    '.js .bu>div{opacity:0;transform:scale(.5) translateY(100px)}',
    '.js .bu.-move>div{animation:bounceIn .8s forwards}',
    '.js .fl>div{opacity:0;transform:scale(.5) translateY(50px)}',
    '.js .fl.-move>div{animation:bounceIn .8s forwards}',
    '.js .lt .letter{transform:translateY(200%)}',
    '.js .lt.-move .letter{transition:transform .6s cubic-bezier(.075,.82,.165,1),color .3s cubic-bezier(.6,.04,.98,.335)}',
    '.ld{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#e2365d;transition:opacity .5s,visibility .5s}',
    '.ld.out{opacity:0;visibility:hidden}',
    '.ld svg{position:absolute;left:50%;top:50%;width:min(78vw,780px);aspect-ratio:1;translate:-50% -50%;animation:rot 50s linear infinite}',
    '.ld p{position:relative;color:#fff;font-family:Antonio,sans-serif;font-weight:700;font-size:clamp(56px,8.8vw,120px);line-height:1.2;letter-spacing:.02em}',
    '.ld p span{opacity:0;animation:ldd 1.1s infinite}',
    '.ld p span:nth-child(2){animation-delay:.2s}.ld p span:nth-child(3){animation-delay:.4s}',
    '@keyframes ldd{0%,20%{opacity:0}40%,80%{opacity:1}100%{opacity:0}}'
  ].join('');
  d.head.appendChild(css);
  root.classList.add('js');

  var COLORS = ['#f8f711', '#14f7f8', '#11f811', '#f816f8', '#ea1413', '#1616f7'];

  /* 英字見出しを1文字ずつに分ける */
  d.querySelectorAll('.pg .lt').forEach(function (el) {
    var t = el.textContent;
    el.textContent = '';
    var w = d.createElement('span');
    w.className = 'ltw';
    t.split('').forEach(function (ch, i) {
      var s = d.createElement('span');
      s.className = 'letter';
      s.textContent = ch === ' ' ? ' ' : ch;
      s.style.color = COLORS[i % 6];
      w.appendChild(s);
    });
    el.appendChild(w);
  });

  function letters(el) {
    var ls = el.querySelectorAll('.letter');
    el.classList.add('-move');
    ls.forEach(function (s, i) {
      s.style.transitionDelay = (i * 0.05) + 's, ' + (0.45 + i * 0.05) + 's';
      requestAnimationFrame(function () {
        s.style.transform = 'translateY(0)';
        s.style.color = '#fff';
      });
    });
  }

  function show(el) {
    if (el.classList.contains('lt')) { letters(el); return; }
    var delay = parseFloat(el.dataset.delay || 0);
    if (delay) setTimeout(function () { el.classList.add('-move'); }, delay * 1000);
    else el.classList.add('-move');
  }

  /* 募集の写真は 0.3 秒ずつずらす（参考の data-delay） */
  d.querySelectorAll('.pg .rc .bu').forEach(function (el, i) { el.dataset.delay = (0.3 * (i + 1)).toFixed(1); });
  /* 強みのカードも順に */
  d.querySelectorAll('.pg .svc .rv').forEach(function (el, i) { el.dataset.delay = (0.2 * (i + 1)).toFixed(1); });

  var targets = d.querySelectorAll('.pg .rv, .pg .bi, .pg .bu, .pg .lt');
  var mvEls = d.querySelectorAll('.pg .mv .rv, .pg .mv .bi, .pg .mv .lt');

  function startObserver() {
    if (!('IntersectionObserver' in window)) { targets.forEach(show); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -25% 0px' });
    targets.forEach(function (el) { if (!el.closest('.mv')) io.observe(el); });
  }

  /* ファーストビューの登場（ローディングが消えたあと） */
  function opening() {
    var fl = d.querySelectorAll('.pg .fl');
    fl.forEach(function (el, i) { setTimeout(function () { el.classList.add('-move'); }, 600 + i * 150); });
    var t = d.querySelector('.pg .mvt');
    if (t) setTimeout(function () { t.classList.add('-move'); }, 600);
    var r = d.querySelectorAll('.pg .mv .rv');
    r.forEach(function (el, i) { setTimeout(function () { el.classList.add('-move'); }, 1100 + i * 200); });
    startObserver();
  }

  if (reduce) {
    targets.forEach(function (el) {
      if (el.classList.contains('lt')) { el.querySelectorAll('.letter').forEach(function (s) { s.style.transform = 'none'; s.style.color = '#fff'; }); }
      el.classList.add('-move');
    });
    d.querySelectorAll('.pg .fl').forEach(function (el) { el.classList.add('-move'); });
  } else {
    /* ローディングは使わない：すぐにファーストビューを出す */
    opening();
  }
  if (false) {
    var ld = d.createElement('div');
    ld.className = 'ld';
    ld.setAttribute('aria-hidden', 'true');
    ld.innerHTML = '<svg viewBox="0 0 1000 1000"><polygon fill="#cb1944" points="500,0 552,103 629,17 653,130 750,67 744,183 854,146 817,256 933,250 870,347 983,371 897,448 1000,500 897,552 983,629 870,653 933,750 817,744 854,854 744,817 750,933 653,870 629,983 552,897 500,1000 448,897 371,983 347,870 250,933 256,817 146,854 183,744 67,750 130,653 17,629 103,552 0,500 103,448 17,371 130,347 67,250 183,256 146,146 256,183 250,67 347,130 371,17 448,103"/></svg><p>LOADING<span>.</span><span>.</span><span>.</span></p>';
    pg.appendChild(ld);
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      ld.classList.add('out');
      setTimeout(function () { ld.remove(); }, 600);
      opening();
    };
    if (d.readyState === 'complete') setTimeout(finish, 700);
    else window.addEventListener('load', function () { setTimeout(finish, 400); });
    setTimeout(finish, 3000);
  }

  /* 強み：縦スクロールで横に流す（参考：.p_top_service_horizontal、PCのみ） */
  var hzw = d.querySelector('.pg .hzw'), hzs = d.querySelector('.pg .hzs'), hz = d.querySelector('.pg .hz');
  var dist = 0;
  function setupHz() {
    if (!hzw) return;
    hzw.style.height = ''; hzs.style.cssText = ''; hz.style.cssText = '';
    dist = 0;
    if (reduce || innerWidth < 768) return;
    hz.style.flexWrap = 'nowrap';
    hz.style.width = 'max-content';
    var svc = hz.querySelector('.svc');
    if (svc) svc.style.marginLeft = 'calc(100vw / 1366 * 239)';
    dist = Math.max(0, hz.scrollWidth - innerWidth);
    if (!dist) return;
    hzw.style.height = (hzs.offsetHeight + dist) + 'px';
    hzs.style.position = 'sticky';
    hzs.style.top = Math.max(0, (innerHeight - hzs.offsetHeight) / 2) + 'px';
  }

  /* スタジオの写真のパララックス（参考：aboutParallax） */
  var abx = d.querySelector('.pg .abx'), abImg = d.querySelector('.pg .abg img');
  var nsc = d.querySelector('.pg .nsc'), ft = d.querySelector('.pg .ft');

  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = innerHeight;
    if (dist && hzw) {
      var r = hzw.getBoundingClientRect();
      var top0 = parseFloat(hzs.style.top) || 0;
      var p = Math.min(1, Math.max(0, (top0 - r.top) / dist));
      hz.style.transform = 'translate3d(' + (-p * dist) + 'px,0,0)';
    }
    if (abx && abImg && !reduce) {
      var a = abx.getBoundingClientRect();
      var q = Math.min(1, Math.max(0, (vh - a.top) / (vh + a.height)));
      var y = q < .5 ? -10 * (1 - q * 2) : -10 * (q - .5) * 2;
      abImg.style.transform = 'translateY(' + y.toFixed(2) + '%)';
    }
    if (nsc && ft) {
      nsc.classList.toggle('is-hidden', ft.getBoundingClientRect().top < vh - 40);
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }

  setupHz();
  onScroll();
  addEventListener('scroll', req, { passive: true });
  var rt;
  addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { setupHz(); onScroll(); }, 150); });
  addEventListener('load', function () { setupHz(); onScroll(); });

  /* スマホのメニュー：中のリンクを押したら閉じる */
  var mt = d.getElementById('mn');
  d.querySelectorAll('.pg .fm a').forEach(function (a) { a.addEventListener('click', function () { if (mt) mt.checked = false; }); });
})();
