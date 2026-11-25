/* =========================================================
   WEBZLY — interactions (version haut de gamme)
   ========================================================= */
(() => {
  'use strict';

  const doc = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (fine) doc.classList.add('fine');
  if (!hasGSAP) doc.classList.remove('js');

  // palette choisie via ?theme= (pour comparer les propositions)
  const theme = new URLSearchParams(location.search).get('theme');
  if (theme && /^(braise|moutarde|fuchsia)$/.test(theme)) doc.dataset.theme = theme;

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (!reduced && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const target = id.length > 1 && document.querySelector(id);
    if (!target) return;
    e.preventDefault(); closeMenu();
    if (lenis) lenis.scrollTo(target, { offset: -90 }); else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- Préchargeur ---------- */
  const pl = $('[data-pl]');
  let introDone = Promise.resolve();
  if (pl) {
    let seen = false;
    try { seen = sessionStorage.getItem('wz-seen') === '1'; sessionStorage.setItem('wz-seen', '1'); } catch (e) {}
    if (!hasGSAP || reduced || seen) pl.classList.add('is-gone');
    else {
      introDone = new Promise((done) => {
        const n = $('[data-pl-n]'), bar = $('[data-pl-bar]'), o = { v: 0 };
        gsap.timeline({ onComplete: () => { pl.classList.add('is-gone'); done(); } })
          .to(o, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { n.textContent = Math.round(o.v); bar.style.width = o.v + '%'; } })
          .to(pl, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.1');
      });
    }
  }

  /* ---------- En-tête ---------- */
  const header = $('[data-header]'), mbar = $('[data-mbar]');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    if (header) header.classList.toggle('is-hidden', y > 300 && y > lastY && !document.body.classList.contains('menu-open'));
    if (mbar) mbar.classList.toggle('is-visible', y > innerHeight * 0.6);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); burger.querySelector('.sr').textContent = 'Ouvrir le menu';
    lenis && lenis.start();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      if (!menu.hidden) return closeMenu();
      menu.hidden = false; document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true'); burger.querySelector('.sr').textContent = 'Fermer le menu';
      lenis && lenis.stop();
      if (hasGSAP && !reduced) gsap.from($$('.menu__nav a', menu), { yPercent: 60, opacity: 0, duration: 0.7, stagger: 0.04, ease: 'expo.out' });
      $('a', menu).focus();
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); burger.focus(); } });
    $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- Curseur ---------- */
  const cur = $('[data-cur]');
  if (cur && fine && !reduced) {
    const dot = $('.cur__dot', cur), ring = $('.cur__ring', cur), lab = $('[data-cur-label]', cur);
    let x = -100, y = -100, rx = -100, ry = -100;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const tick = () => { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; dot.style.transform = `translate3d(${x}px,${y}px,0)`; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(tick); };
    tick();
    document.addEventListener('pointerover', (e) => {
      const t = e.target, l = t.closest('[data-cursor]');
      cur.classList.toggle('is-label', !!l); lab.textContent = l ? l.dataset.cursor : '';
      cur.classList.toggle('is-link', !l && !!t.closest('a, button, summary, label, input[type="range"]'));
      cur.classList.toggle('is-hidden', !!t.closest('input:not([type="range"]), textarea'));
    });
    document.documentElement.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    document.documentElement.addEventListener('pointerenter', () => cur.classList.remove('is-hidden'));
  }

  /* ---------- Boutons aimantés (position de repos fixe : pas de tremblement) ---------- */
  if (fine && !reduced && hasGSAP) {
    $$('[data-magnetic]').forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      let box = null;
      el.addEventListener('pointerenter', () => { const r = el.getBoundingClientRect(); box = { cx: r.left + r.width / 2 - gsap.getProperty(el, 'x'), cy: r.top + r.height / 2 - gsap.getProperty(el, 'y') }; });
      el.addEventListener('pointermove', (e) => { if (!box) return; xTo((e.clientX - box.cx) * 0.25); yTo((e.clientY - box.cy) * 0.3); });
      el.addEventListener('pointerleave', () => { box = null; xTo(0); yTo(0); });
    });
  }

  /* ---------- Titres : mots qui montent ---------- */
  const splitWords = (el, cls) => {
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(part));
          const w = document.createElement('span'); w.className = cls;
          if (cls === 'w') { const i = document.createElement('span'); i.textContent = part; w.appendChild(i); } else w.textContent = part;
          frag.appendChild(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
  };
  $$('[data-split]').forEach((el) => splitWords(el, 'w'));
  $$('[data-manif]').forEach((el) => splitWords(el, 'mw'));

  /* ---------- Illustrations : tracé ---------- */
  $$('.ill[data-draw]').forEach((svg) => $$('.s', svg).forEach((p, i) => {
    let len = 600; try { len = Math.ceil(p.getTotalLength()) + 2; } catch (e) {}
    p.style.setProperty('--len', len); p.style.transitionDelay = `${i * 0.08}s`;
  }));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-drawn'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.ill[data-draw]').forEach((s) => io.observe(s));

  /* ---------- Animations au défilement ---------- */
  if (hasGSAP) {
    const revealed = (el) => { el.classList.add('is-revealed'); gsap.set(el, { clearProps: 'transform,opacity' }); };
    if (reduced) {
      $$('[data-reveal]').forEach(revealed);
      $$('[data-split]').forEach((el) => el.classList.add('is-split-done'));
      $$('.mw').forEach((w) => w.classList.add('on'));
    } else {
      introDone.then(() => {
        ScrollTrigger.batch('[data-reveal]', { start: 'top bottom', once: true,
          onEnter: (els) => els.forEach((el, i) => gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: i * 0.08, overwrite: true, onComplete: () => revealed(el) })) });
        $$('[data-split]').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true,
          onEnter: () => gsap.to($$('.w > span', el), { y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, onComplete: () => el.classList.add('is-split-done') }) }));
      });

      // manifeste : les mots s'allument
      $$('[data-manif]').forEach((el) => {
        const words = $$('.mw', el);
        ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
          onUpdate: (st) => { const k = Math.round(st.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < k)); } });
      });

      // cartes empilées : la carte du dessous recule
      const cards = $$('.scard');
      if (matchMedia('(min-width: 901px)').matches) cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.to(c, { scale: 0.94, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true } });
      });

      // méthode : défilement horizontal épinglé
      const hs = $('[data-hs]'), track = $('[data-hs-track]');
      if (hs && track && matchMedia('(min-width: 901px)').matches) {
        const dist = () => Math.max(0, track.scrollWidth - innerWidth);
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: hs, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true,
          onUpdate: (st) => { const b = $('[data-hs-bar]'); if (b) b.style.width = st.progress * 100 + '%'; } } });
      }

      // image du client : ouverture en fondu
      $$('[data-clip]').forEach((el) => {
        gsap.to(el, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 35%', scrub: true } });
        gsap.to($('img', el), { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }

    // compteurs
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.decimals || '0', 10), fmt = (v) => v.toFixed(dec).replace('.', ',');
      if (reduced) return (el.textContent = fmt(end));
      const o = { v: 0 }; el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }) });
    });
  }

  /* ---------- Avant / après ---------- */
  $$('[data-ba]').forEach((ba) => {
    const range = $('[data-ba-range]', ba), set = (v) => ba.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => set(range.value)); set(range.value);
    if (hasGSAP && !reduced) {
      const o = { v: 50 };
      ScrollTrigger.create({ trigger: ba, start: 'top 70%', once: true, onEnter: () => gsap.timeline()
        .to(o, { v: 76, duration: 1, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 28, duration: 1.2, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 50, duration: 0.9, ease: 'power2.inOut', onUpdate: () => set(o.v), onComplete: () => (range.value = 50) }) });
    }
  });

  /* ---------- Formulaire de devis ---------- */
  const form = $('[data-form]');
  if (form) {
    const steps = $$('[data-step]', form), label = $('[data-step-label]', form), bar = $('[data-bar]', form);
    const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form), err = $('[data-err]', form);
    let cur = 1;
    const pre = new URLSearchParams(location.search).get('formule');
    if (pre) { const r = $(`input[name="formule"][value="${CSS.escape(pre)}"]`, form); if (r) r.checked = true; }
    const show = (n, focus = true) => {
      cur = n; steps.forEach((s) => (s.hidden = +s.dataset.step !== n));
      label.textContent = `Étape ${n} / ${steps.length}`; bar.style.width = `${(n / steps.length) * 100}%`;
      prev.hidden = n === 1; next.hidden = n === steps.length; submit.hidden = n !== steps.length; err.textContent = '';
      if (focus) { const f = $('input, textarea', steps[n - 1]); f && f.focus({ preventScroll: true }); }
    };
    const validate = () => {
      const nom = form.nom.value.trim(), tel = form.telephone.value.trim(), mail = form.email.value.trim();
      $$('.is-invalid', form).forEach((x) => x.classList.remove('is-invalid'));
      const fail = (input, msg) => { input.classList.add('is-invalid'); err.textContent = msg; input.focus(); return false; };
      if (!nom) return fail(form.nom, 'Indiquez votre nom.');
      if (!tel && !mail) return fail(form.telephone, 'Laissez un téléphone ou un e-mail pour que je puisse vous répondre.');
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail(form.email, 'Cette adresse e-mail semble incomplète.');
      if (tel && tel.replace(/\D/g, '').length < 9) return fail(form.telephone, 'Ce numéro semble incomplet.');
      if (!form.consent.checked) { err.textContent = 'Merci de cocher la case pour que je puisse vous répondre.'; form.consent.focus(); return false; }
      return true;
    };
    next.addEventListener('click', () => show(cur + 1));
    prev.addEventListener('click', () => show(cur - 1));
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && cur < steps.length) { e.preventDefault(); show(cur + 1); } });
    const mailto = () => {
      const fd = new FormData(form);
      const lines = [`Métier : ${fd.get('metier') || ''}`, `Besoins : ${fd.getAll('besoins[]').join(', ')}`, `Formule : ${fd.get('formule') || ''}`, `Délai : ${fd.get('delai') || ''}`, '',
        `Nom : ${fd.get('nom') || ''}`, `Entreprise : ${fd.get('entreprise') || ''}`, `Téléphone : ${fd.get('telephone') || ''}`, `E-mail : ${fd.get('email') || ''}`, '', fd.get('message') || ''];
      return 'mailto:thibault.lbrt21@gmail.com?subject=' + encodeURIComponent('Demande de devis — ' + (fd.get('nom') || '')) + '&body=' + encodeURIComponent(lines.join('\n'));
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cur < steps.length || !validate()) return;
      form.classList.add('is-sending');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'send');
        form.classList.add('is-done'); $('[data-done]', form).focus({ preventScroll: true });
      } catch (ex) {
        form.classList.add('is-failed'); $('[data-mailto]', form).href = mailto(); $('[data-fail]', form).focus({ preventScroll: true });
      } finally { form.classList.remove('is-sending'); }
    });
    if (location.hash === '#merci') form.classList.add('is-done');
    if (location.hash === '#erreur') form.classList.add('is-failed');
    show(1, false);
  }
})();
