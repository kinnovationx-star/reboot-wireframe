// QA: 文字の重なり・切れ・非表示・点滅系アニメーションを検出（iframe内で実行）
window.__qa = async function (pages, widths) {
  const out = {};
  for (const W of widths) {
    for (const p of pages) {
      const f = document.createElement('iframe');
      f.style.cssText = `width:${W}px;height:900px;border:0;position:fixed;left:0;top:0;opacity:0;pointer-events:none`;
      f.src = p + '.html?qa=' + Date.now();
      document.body.appendChild(f);
      await new Promise(r => { f.onload = r; setTimeout(r, 8000); });
      const w = f.contentWindow, d = f.contentDocument;
      await new Promise(r => setTimeout(r, 400));
      // 1回きりのアニメーションを終わらせる（スクロール連動も可能なら）
      const fin = () => w.document.getAnimations().forEach(a => { try { const t = a.effect.getTiming(); if (t.iterations !== Infinity) a.finish(); } catch (e) {} });
      fin();
      // ページ全体を表示させるため高い iframe にしてスクロール連動を全部通過させる
      const H = d.documentElement.scrollHeight;
      for (let y = 0; y < H; y += 700) { w.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); fin(); }
      w.scrollTo(0, 0); await new Promise(r => setTimeout(r, 60)); fin();
      const vw = d.documentElement.clientWidth;
      const res = { overlap: [], clipped: [], hidden: [], flicker: [] };
      const skip = el => el.closest('[aria-hidden="true"],script,style,.ddm,nav,label.hb') ;
      const effOp = el => { let o = 1, a = el; while (a && a.nodeType === 1) { const s = w.getComputedStyle(a); if (s.display === 'none') return 0; if (s.visibility === 'hidden') return 0; o *= +s.opacity; a = a.parentElement; } return o; };
      const isFixed = el => { let a = el; while (a && a.nodeType === 1) { const s = w.getComputedStyle(a).position; if (s === 'fixed' || s === 'sticky') return true; a = a.parentElement; } return false; };
      const items = [];
      const walker = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = walker.nextNode())) {
        const t = n.textContent.replace(/\s+/g, '');
        if (!t) continue;
        const el = n.parentElement;
        if (!el || skip(el)) continue;
        const rg = d.createRange(); rg.selectNodeContents(n);
        const rects = [...rg.getClientRects()].filter(r => r.width > 1 && r.height > 1);
        if (!rects.length) continue;
        const sY = w.scrollY;
        const box = rects.reduce((a, r) => ({ l: Math.min(a.l, r.left), t: Math.min(a.t, r.top + sY), r: Math.max(a.r, r.right), b: Math.max(a.b, r.bottom + sY) }), { l: 1e9, t: 1e9, r: -1e9, b: -1e9 });
        const op = effOp(el);
        const txt = n.textContent.trim().slice(0, 18);
        if (op < 0.2 && box.r - box.l > 4) { if (!el.closest('a.fab')) res.hidden.push(`${txt}(op${op.toFixed(2)})`); continue; }
        if (isFixed(el)) continue;
        // 切れ：overflow hidden の祖先からはみ出す / 画面外
        let a = el, cut = false;
        if (box.l < -2 || box.r > vw + 2) cut = true;
        while (!cut && a && a !== d.body) {
          const s = w.getComputedStyle(a);
          if (/hidden|clip/.test(s.overflowX + s.overflowY) || s.clipPath !== 'none') {
            const ar = a.getBoundingClientRect(); const at = ar.top + w.scrollY, ab = ar.bottom + w.scrollY;
            if (box.l < ar.left - 3 || box.r > ar.right + 3 || box.t < at - 3 || box.b > ab + 3) { if (!/auto|scroll/.test(s.overflowX)) cut = true; }
          }
          a = a.parentElement;
        }
        if (cut) res.clipped.push(txt);
        items.push({ el, box, txt, fs: parseFloat(w.getComputedStyle(el).fontSize) });
      }
      for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
        const A = items[i], B = items[j];
        if (A.el === B.el || A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const ix = Math.min(A.box.r, B.box.r) - Math.max(A.box.l, B.box.l), iy = Math.min(A.box.b, B.box.b) - Math.max(A.box.t, B.box.t);
        if (ix <= 2 || iy <= 2) continue;
        const ar = Math.min((A.box.r - A.box.l) * (A.box.b - A.box.t), (B.box.r - B.box.l) * (B.box.b - B.box.t));
        if (ix * iy > ar * 0.15) res.overlap.push(`「${A.txt}」×「${B.txt}」@y${Math.round(Math.max(A.box.t, B.box.t))}`);
      }
      w.document.getAnimations().forEach(an => { try { const t = an.effect.getTiming(); if (t.iterations === Infinity) { const kf = an.effect.getKeyframes ? an.effect.getKeyframes() : []; const props = new Set(); kf.forEach(k => Object.keys(k).forEach(x => props.add(x))); const op = kf.map(k => k.opacity).filter(x => x !== undefined); const jumpy = (t.duration < 1200 && (props.has('opacity') || props.has('clipPath') || props.has('transform') || props.has('backgroundColor') || props.has('color'))) || (op.length && Math.max(...op) - Math.min(...op) > 0.5 && t.duration < 2500) || /step/.test(t.easing || ''); if (jumpy) res.flicker.push(`${an.animationName}:${t.duration}ms:${[...props].filter(x => !/offset|easing|composite|computedOffset/.test(x)).join('/')}`); } } catch (e) {} });
      res.flicker = [...new Set(res.flicker)];
      res.overlap = [...new Set(res.overlap)].slice(0, 15);
      res.clipped = [...new Set(res.clipped)].slice(0, 15);
      res.hidden = [...new Set(res.hidden)].slice(0, 12);
      out[`${W} ${p}`] = res;
      f.remove();
    }
  }
  return out;
};
