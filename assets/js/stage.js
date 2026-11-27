/* =========================================================
   WEBZLY — accueil : le MacBook s'ouvre tout seul, puis les
   pages sortent de l'écran au fil du défilement.
   Les images viennent d'une vidéo découpée (assets/video) :
   16/9 pour l'ordinateur, 9/16 pour le téléphone.
   ========================================================= */
(() => {
  'use strict';
  const root = document.documentElement;
  const stage = document.querySelector('[data-stage]');
  if (!stage || !root.classList.contains('stage-live')) return;
  window.__stageOK = 1;

  const q = (s) => stage.querySelector(s);
  const pin = q('.stage__pin'), cv = q('canvas'), copy = q('.stage__copy'), slot = q('.stage__slot');
  const beat = q('[data-beat]'), end = q('[data-end]');
  const ctx = cv.getContext('2d', { alpha: false });
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(3, '0');

  // box : le MacBook ouvert, en fraction de l'image (gauche, droite, haut de l'écran, bas du clavier)
  // shift : décalage de l'écran allumé par rapport au centre, à la fin de l'intro
  const CUTS = {
    d: { fw: 1600, fh: 900, intro: [72, 30], run: [98, 16], box: [.19, .81, .13, .93], wf: .86, k0: .7, bleed: .1, shift: .08 },
    m: { fw: 810, fh: 1440, intro: [58, 24], run: [73, 12], box: [.054, .977, .26, .62], wf: .96, k0: .9, bleed: 0, shift: .1 },
  };
  const key = innerWidth < 700 || innerHeight > innerWidth * 1.15 ? 'm' : 'd';
  const C = CUTS[key];
  const T_OPEN = 2.4; // l'écran est allumé : la suite se joue au défilement
  const frames = [];
  for (let k = 0; k < C.intro[0]; k++) frames.push({ t: k / C.intro[1], url: `assets/video/${key}/i${pad(k + 1)}.webp` });
  for (let j = 0; j < C.run[0]; j++) frames.push({ t: T_OPEN + j / C.run[1], url: `assets/video/${key}/s${pad(j + 1)}.webp` });
  const T_END = frames[frames.length - 1].t;

  const locate = (t) => {
    let lo = 0, hi = frames.length - 1;
    if (t <= frames[0].t) return [0, 0];
    if (t >= frames[hi].t) return [hi, 0];
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid].t <= t) lo = mid; else hi = mid; }
    return [lo, (t - frames[lo].t) / (frames[hi].t - frames[lo].t)];
  };

  /* ---------- Chargement : les images arrivent dans l'ordre, et on décode d'avance celles qui entourent la position ---------- */
  const bitmaps = 'createImageBitmap' in window;
  let queue = [], fetching = 0, decoding = 0, focus = 0;
  const WIN = key === 'm' ? 7 : 9;
  const asImage = (fr) => { const im = new Image(); im.onload = wake; im.src = URL.createObjectURL(fr.blob); fr.img = im; };
  const drawable = (fr) => (fr ? fr.bmp || (fr.img && fr.img.complete && fr.img.naturalWidth ? fr.img : null) : null);
  const fetchNext = () => {
    while (fetching < 6 && queue.length) {
      const i = queue.shift(), fr = frames[i];
      if (fr.blob || fr.failed) continue;
      fetching++;
      fetch(fr.url)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then((b) => { fr.blob = b; if (!bitmaps) asImage(fr); })
        .catch(() => { fr.failed = true; })
        .finally(() => { fetching--; fetchNext(); decodeAround(); wake(); });
    }
  };
  const decodeAround = () => {
    if (!bitmaps) return;
    for (let d = 0; d <= WIN && decoding < 3; d++) {
      for (const i of d ? [focus + d, focus - d] : [focus]) {
        const fr = frames[i];
        if (!fr || !fr.blob || fr.bmp || fr.img || fr.busy || decoding >= 3) continue;
        fr.busy = true; decoding++;
        createImageBitmap(fr.blob)
          .then((b) => { if (Math.abs(i - focus) > WIN * 2) b.close(); else { fr.bmp = b; wake(); } })
          .catch(() => asImage(fr))
          .finally(() => { fr.busy = false; decoding--; decodeAround(); });
      }
    }
    frames.forEach((fr, i) => { if (fr.bmp && Math.abs(i - focus) > WIN * 2) { fr.bmp.close(); fr.bmp = null; } });
  };

  /* ---------- Mise en place : au départ sous le texte, à la fin au milieu de la scène ---------- */
  let W = 0, H = 0, D = 1, zoom = 1, s0 = 1, s1 = 1, top0 = 0, top1 = 0, stageTop = 0, dirty = true;
  const measure = () => {
    const w = pin.clientWidth, h = pin.clientHeight;
    if (!w || !h) return;
    if (w !== W || h !== H) {
      W = w; H = h;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    }
    const [bx0, bx1, by0, by1] = C.box;
    const bw = (bx1 - bx0) * C.fw, bh = (by1 - by0) * C.fh;
    const sr = stage.getBoundingClientRect();
    stageTop = sr.top + scrollY;
    const wfit = (W * C.wf) / bw;
    const topMin = Math.max(H * .18, 120), botMin = H * .04; // de la place au-dessus pour la phrase
    s1 = Math.min((H - topMin - botMin) / bh, wfit, 1.45);
    top1 = topMin + Math.max(0, H - topMin - botMin - bh * s1) * .42;
    top0 = slot.getBoundingClientRect().top - sr.top + Math.min(28, H * .03);
    s0 = clamp(((H - top0) * (1 + C.bleed)) / bh, s1 * .6, Math.min(s1, wfit * C.k0));
    zoom = Math.max(1, top0 - top1);
    D = Math.max(1, stage.offsetHeight - H);
    pin.style.setProperty('--top1', `${top1}px`);
    pin.style.setProperty('--bot1', `${top1 + bh * s1}px`);
    dirty = true;
  };
  const geo = (y) => {
    // au départ, l'écran allumé est centré sous le titre (le Mac est vu de trois quarts)
    const z = clamp(y / zoom), s = s0 + (s1 - s0) * z, top = top0 + (top1 - top0) * z;
    const cx = (C.box[0] + C.box[1]) / 2 + C.shift * (1 - z);
    return [W / 2 - cx * C.fw * s, top - C.box[2] * C.fh * s, s];
  };
  // Défilement → moment de la vidéo. On garde un temps d'arrêt à la fin, avant de libérer la scène.
  const LEAD = .25, HOLD = .1;
  const timeAt = (y) => {
    if (y <= zoom) return T_OPEN + (y / zoom) * LEAD;
    const run = Math.max(1, D * (1 - HOLD) - zoom);
    return T_OPEN + LEAD + clamp((y - zoom) / run) * (T_END - T_OPEN - LEAD);
  };

  /* ---------- Dessin : fondu entre deux images voisines, bords adoucis ---------- */
  const fades = (x, y, w, h) => {
    const e = w * .06, eb = h * .09, b = y + h;
    let g;
    if (x > -e) { g = ctx.createLinearGradient(x, 0, x + e, 0); g.addColorStop(0, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 1, y, e + 1, h); }
    if (x + w < W + e) { g = ctx.createLinearGradient(x + w - e, 0, x + w, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); ctx.fillStyle = g; ctx.fillRect(x + w - e, y, e + 1, h); }
    if (b < H + eb) { g = ctx.createLinearGradient(0, b - eb, 0, b); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000'); ctx.fillStyle = g; ctx.fillRect(x, b - eb, w, eb + 1); }
  };
  const nearest = (i) => {
    for (let d = 1; d <= 10; d++) { const a = drawable(frames[i - d]) || drawable(frames[i + d]); if (a) return a; }
    return null;
  };
  const paint = (time, [x, y, s]) => {
    const [i, f] = locate(time);
    let base = drawable(frames[i]), mix = null;
    if (base) { if (f > .02) mix = drawable(frames[i + 1]); } else base = nearest(i);
    if (!base) return false;
    const w = C.fw * s, h = C.fh * s;
    ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(base, x, y, w, h);
    if (mix) { ctx.globalAlpha = f; ctx.drawImage(mix, x, y, w, h); ctx.globalAlpha = 1; }
    fades(x, y, w, h);
    return true;
  };
  const show = (el, v, lift = 0) => {
    if (!el || Math.abs((el._o ?? -1) - v) < .004) return;
    el._o = v; el.style.opacity = v.toFixed(3); el.style.visibility = v < .02 ? 'hidden' : 'visible';
    if (lift) el.style.transform = `translate3d(0, ${((1 - v) * lift).toFixed(1)}px, 0)`;
  };
  const band = (t, a, b, f) => Math.min(clamp((t - a) / f), clamp((b - t) / f));

  /* ---------- Boucle : elle ne tourne que lorsque quelque chose bouge ---------- */
  const born = performance.now();
  let raf = 0, last = 0, tS = T_OPEN, introT = 0, introDone = false, started = false, drawn = false, lastKey = '', dead = false;
  function wake() { if (!raf && !dead) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(now) {
    raf = 0;
    const dt = Math.min(50, now - last); last = now;
    const y = clamp(scrollY - stageTop, 0, D);
    let busy = false;
    if (!introDone) {
      // l'intro part quand le début est prêt (ou au bout de 2,5 s avec ce qui est arrivé)
      if (!started && frames.slice(0, 6).every(drawable) && (frames.slice(0, 30).every((fr) => fr.blob || fr.failed) || now - born > 2500)) started = true;
      if (started) { introT += (dt / 1000) * (y > 4 ? 2.4 : 1); if (introT >= T_OPEN) introDone = true; }
      tS = Math.min(introT, T_OPEN);
      busy = true;
    } else {
      const goal = timeAt(y);
      tS += (goal - tS) * (1 - Math.pow(.84, dt / 16.7));
      if (Math.abs(goal - tS) < .002) tS = goal; else busy = true;
    }
    const f = locate(tS)[0];
    if (f !== focus) { focus = f; decodeAround(); }
    const visible = scrollY < stageTop + D + H;
    if (visible) {
      const g = geo(y);
      const k = `${tS.toFixed(4)}|${g[0].toFixed(1)}|${g[1].toFixed(1)}|${g[2].toFixed(4)}`;
      if ((dirty || k !== lastKey) && paint(tS, g)) { lastKey = k; dirty = false; drawn = true; }
      const was = copy._o, oc = 1 - clamp((y - zoom * .3) / (zoom * .7));
      show(copy, oc);
      if (was !== undefined && (was < .5) !== (oc < .5)) dispatchEvent(new Event('scroll')); // la barre du bas du téléphone suit
      show(beat, band(tS, 2.85, 5.6, .35), 14);
      show(end, clamp((tS - 7.1) / .5), 10);
    }
    if (busy) wake();
  }

  /* ---------- Démarrage ---------- */
  measure();
  const y0 = clamp(scrollY - stageTop, 0, D);
  if (y0 > 40) { // page rechargée au milieu de la scène : pas d'intro
    introDone = started = true; tS = timeAt(y0);
    const at = locate(tS)[0];
    queue = frames.map((_, i) => i).sort((a, b) => Math.abs(a - at) - Math.abs(b - at));
  } else queue = frames.map((_, i) => i);
  fetchNext();
  wake();
  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', () => { measure(); wake(); });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); wake(); }).observe(copy);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); wake(); });
  // Si rien n'a pu s'afficher (réseau coupé), on montre l'image fixe
  setTimeout(() => { if (!drawn) { dead = true; root.classList.remove('stage-live'); } }, 9000);
})();
