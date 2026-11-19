/* =========================================================
   WEBZLY — interactions
   ========================================================= */
(() => {
  'use strict';

  const doc = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  if (reduced) doc.classList.add('reduced');

  // Sans GSAP : on affiche tout, proprement.
  if (!hasGSAP) {
    doc.classList.remove('js');
    finishLoader(true);
    initBasics();
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  // Liens d'ancre
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -10, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id === '#top' ? location.pathname : id);
    });
  });

  /* ---------- Préchargement ---------- */
  let seen = false;
  try { seen = sessionStorage.getItem('w21-seen') === '1'; } catch (e) {}
  if (reduced || seen) {
    finishLoader(true);
  } else {
    const counter = $('[data-loader-count]');
    const obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.1, ease: 'power2.inOut',
      onUpdate: () => { if (counter) counter.textContent = Math.round(obj.v); },
      onComplete: () => finishLoader(false),
    });
    try { sessionStorage.setItem('w21-seen', '1'); } catch (e) {}
  }

  function finishLoader(instant) {
    const loader = $('.loader');
    body.classList.remove('is-loading');
    if (instant) {
      doc.classList.add('no-loader');
      if (loader) loader.remove();
      requestAnimationFrame(() => heroIntro && heroIntro(0));
      return;
    }
    loader.classList.add('is-done');
    heroIntro && heroIntro(0.25);
    setTimeout(() => loader.remove(), 1100);
  }

  /* ---------- Intro du hero ---------- */
  function heroIntro(delay) {
    window.__w21intro = true;
    window.dispatchEvent(new CustomEvent('w21:intro'));
    if (reduced || !hasGSAP) return;
    const tl = gsap.timeline({ delay });
    tl.to('.hero__title .line > span', { y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.09 })
      .to('[data-hero-in]', { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.25)
      .add(() => ringLoop(), 1.1);
  }

  // « sonner » qui sonne
  function ringLoop() {
    const ring = $('.ring');
    if (!ring || reduced) return;
    const go = () => {
      ring.classList.remove('is-ringing');
      void ring.offsetWidth;
      ring.classList.add('is-ringing');
    };
    go();
    setInterval(() => { if (!document.hidden && window.scrollY < window.innerHeight) go(); }, 4200);
  }

  /* ---------- Titres découpés en mots ---------- */
  $$('[data-split]').forEach((el) => {
    splitWords(el);
    if (reduced) { el.classList.add('is-in'); return; }
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.to(el.querySelectorAll('.wd > span'), { y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.04 });
        el.classList.add('is-in');
      },
    });
  });

  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'wd';
            const inner = document.createElement('span');
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  /* ---------- Apparitions ---------- */
  // Une fois apparu, l'élément reçoit .is-revealed et GSAP rend la main sur « transform » :
  // l'inclinaison au survol peut alors l'utiliser sans faire redescendre la carte.
  const revealed = (el) => { el.classList.add('is-revealed'); gsap.set(el, { clearProps: 'transform,opacity' }); };
  if (reduced) {
    $$('[data-reveal]').forEach(revealed);
  } else {
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => els.forEach((el, i) => gsap.to(el, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay: i * 0.08, overwrite: true,
        onComplete: () => revealed(el),
      })),
    });
  }

  /* ---------- Phrase qui s'allume au défilement ---------- */
  const statement = $('[data-statement]');
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const spans = $$('.w', statement);
    if (!reduced) {
      ScrollTrigger.create({
        trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: true,
        onUpdate: (self) => {
          const n = Math.round(self.progress * spans.length);
          spans.forEach((s, i) => s.classList.toggle('is-on', i < n));
        },
      });
    } else spans.forEach((s) => s.classList.add('is-on'));
  }

  /* ---------- Compteurs ---------- */
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const fmt = (v) => v.toFixed(dec).replace('.', ',');
    if (reduced) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = fmt(o.v)) }),
    });
  });

  /* ---------- Barre de progression ---------- */
  gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

  /* ---------- Méthode : défilement horizontal ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const track = $('.method__track');
    const section = $('.method');
    if (!track || !section) return;
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => '+=' + dist(),
        pin: '.method__pin', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    gsap.to('.method__bar span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top top', end: () => '+=' + dist(), scrub: 0.6 } });
    $$('.step', track).forEach((step) => {
      gsap.from(step, {
        opacity: 0.25, scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: step, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true },
      });
    });
    return () => gsap.set(track, { x: 0 });
  });
  mm.add('(max-width: 900px)', () => {
    gsap.utils.toArray('.step').forEach((s) => gsap.from(s, { opacity: 0, y: 40, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 88%', once: true } }));
  });

  /* ---------- Parallaxe légère ---------- */
  if (!reduced) {
    gsap.to('.footer__word', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    gsap.from('.portrait', { y: 60, rotate: -2, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'bottom top', scrub: true } });
    $$('.case__shot').forEach((s, i) => gsap.to(s, { y: (i - 1) * -24, ease: 'none', scrollTrigger: { trigger: '.case', start: 'top bottom', end: 'bottom top', scrub: true } }));
  }

  initBasics();

  /* =========================================================
     Fonctions qui marchent avec ou sans GSAP
     ========================================================= */
  function initBasics() {
    initHeader();
    initMenu();
    initBeforeAfter();
    initConcepts();
    initForm();
    initPlanLinks();
    initTilt();
    initCursor();
    initMobileBar();
    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
    if (!hasGSAP) {
      const st = $('[data-statement]');
      $$('[data-count]').forEach((el) => (el.textContent = String(el.dataset.count).replace('.', ',')));
      window.dispatchEvent(new CustomEvent('w21:intro'));
    }
  }

  /* ---------- En-tête : couleur selon la section ---------- */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    const darkSections = $$('[data-theme="dark"]');
    const navLinks = $$('.nav a');
    let lastY = window.scrollY;
    const update = () => {
      const y = window.scrollY;
      const probe = 36;
      let onDark = false;
      for (const s of darkSections) {
        const r = s.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) { onDark = true; break; }
      }
      header.classList.toggle('is-light', !onDark);
      header.classList.toggle('is-dark-solid', onDark && y > 40);
      const menuOpen = body.classList.contains('menu-open');
      header.classList.toggle('is-hidden', !menuOpen && y > lastY && y > window.innerHeight * 0.9);
      lastY = y;
      // lien actif
      let current = null;
      navLinks.forEach((a) => {
        const t = $(a.getAttribute('href'));
        if (t) {
          const r = t.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4) current = a;
        }
      });
      navLinks.forEach((a) => a.classList.toggle('is-active', a === current));
    };
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    update();
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    const btn = $('.burger');
    const menu = $('#menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => (body.classList.contains('menu-open') ? closeMenu() : openMenu()));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }
  function openMenu() {
    const btn = $('.burger');
    body.classList.add('menu-open');
    btn && btn.setAttribute('aria-expanded', 'true');
    btn && btn.setAttribute('aria-label', 'Fermer le menu');
    $('#menu') && $('#menu').setAttribute('aria-hidden', 'false');
    window.__lenis && window.__lenis.stop();
  }
  function closeMenu() {
    const btn = $('.burger');
    if (!body.classList.contains('menu-open')) return;
    body.classList.remove('menu-open');
    btn && btn.setAttribute('aria-expanded', 'false');
    btn && btn.setAttribute('aria-label', 'Ouvrir le menu');
    $('#menu') && $('#menu').setAttribute('aria-hidden', 'true');
    window.__lenis && window.__lenis.start();
  }

  /* ---------- Avant / après ---------- */
  function initBeforeAfter() {
    const ba = $('[data-ba]');
    if (!ba) return;
    const stage = $('.ba__stage', ba);
    const range = $('.ba__range', ba);
    let pos = 50, target = 50, dragging = false, touched = false, raf = null;

    const apply = () => {
      stage.style.setProperty('--pos', pos + '%');
      range.value = Math.round(pos);
      ba.classList.toggle('show-notes', pos < 46);
    };
    const animate = () => {
      pos += (target - pos) * 0.18;
      if (Math.abs(target - pos) < 0.05) pos = target;
      apply();
      raf = pos !== target ? requestAnimationFrame(animate) : null;
    };
    const setTarget = (v) => { target = Math.min(100, Math.max(0, v)); if (!raf) raf = requestAnimationFrame(animate); };
    const fromEvent = (e) => { const r = stage.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };

    stage.addEventListener('pointerdown', (e) => { dragging = true; touched = true; stage.setPointerCapture(e.pointerId); setTarget(fromEvent(e)); });
    stage.addEventListener('pointermove', (e) => {
      if (dragging || (finePointer && e.pointerType === 'mouse' && touched)) setTarget(fromEvent(e));
    });
    const end = () => { dragging = false; };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', end);
    stage.addEventListener('pointerenter', () => { touched = true; });
    range.addEventListener('input', () => { touched = true; setTarget(+range.value); });

    // démonstration automatique quand la section apparaît
    if (!reduced && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !touched) {
            io.disconnect();
            const seq = [[78, 500], [16, 1400], [34, 2500]];
            seq.forEach(([v, t]) => setTimeout(() => { if (!touched) setTarget(v); }, t));
          }
        });
      }, { threshold: 0.55 });
      io.observe(stage);
    }
    apply();
  }

  /* ---------- Concepts : défilement de l'écran ---------- */
  function initConcepts() {
    const cards = $$('.concept');
    const setH = () => cards.forEach((c) => { const s = $('.concept__screen', c); s && c.style.setProperty('--frame-h', s.clientHeight + 'px'); });
    setH();
    window.addEventListener('resize', setH);
    // sur écran tactile : défile quand la carte est au centre
    if (!finePointer && 'IntersectionObserver' in window && !reduced) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => en.target.classList.toggle('is-scrolling', en.isIntersecting));
      }, { rootMargin: '-35% 0px -35% 0px' });
      cards.forEach((c) => io.observe(c));
    }
  }

  /* ---------- Boutons des formules -> formulaire ---------- */
  function initPlanLinks() {
    $$('[data-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = $(`input[name="formule"][value="${btn.dataset.plan}"]`);
        if (input) input.checked = true;
      });
    });
  }

  /* ---------- Formulaire en étapes ---------- */
  function initForm() {
    const form = $('[data-form]');
    if (!form) return;
    const steps = $$('[data-step]', form);
    const bar = $('.form__progress span', form);
    const current = $('[data-step-current]', form);
    let i = 0;

    const show = (n) => {
      steps.forEach((s, k) => s.classList.toggle('is-active', k === n));
      i = n;
      bar.style.width = ((n + 1) / steps.length) * 100 + '%';
      current.textContent = n + 1;
      const first = steps[n].querySelector('input:not([type=hidden]), textarea');
      if (first && n > 0) setTimeout(() => first.focus({ preventScroll: true }), 50);
    };
    const err = (n, msg) => { const e = $(`[data-error="${n + 1}"]`, form); if (e) e.textContent = msg || ''; };

    const validate = (n) => {
      err(n, '');
      if (n === 0 && !form.querySelector('input[name="metier"]:checked')) { err(n, 'Choisissez votre métier pour continuer.'); return false; }
      if (n === 2) {
        const nom = form.nom.value.trim();
        const tel = form.telephone.value.trim();
        const mail = form.email.value.trim();
        $$('.field input', form).forEach((x) => x.classList.remove('is-invalid'));
        if (!nom) { form.nom.classList.add('is-invalid'); err(n, 'Indiquez votre nom.'); form.nom.focus(); return false; }
        if (!tel && !mail) { form.telephone.classList.add('is-invalid'); err(n, 'Laissez un téléphone ou un e-mail pour que je puisse vous répondre.'); form.telephone.focus(); return false; }
        if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { form.email.classList.add('is-invalid'); err(n, 'Cette adresse e-mail semble incomplète.'); form.email.focus(); return false; }
        if (tel && tel.replace(/\D/g, '').length < 9) { form.telephone.classList.add('is-invalid'); err(n, 'Ce numéro semble incomplet.'); form.telephone.focus(); return false; }
        if (!form.consent.checked) { err(n, 'Merci de cocher la case pour que je puisse utiliser vos informations.'); return false; }
      }
      return true;
    };

    $$('[data-next]', form).forEach((b) => b.addEventListener('click', () => { if (validate(i)) show(i + 1); }));
    $$('[data-prev]', form).forEach((b) => b.addEventListener('click', () => show(i - 1)));
    // métier : passe automatiquement à l'étape suivante
    $$('input[name="metier"]', form).forEach((r) => r.addEventListener('change', () => setTimeout(() => { if (i === 0) { err(0, ''); show(1); } }, 280)));
    // Entrée dans un champ texte n'envoie pas trop tôt
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && i < steps.length - 1) { e.preventDefault(); if (validate(i)) show(i + 1); }
    });

    const mailto = () => {
      const fd = new FormData(form);
      const lines = [
        'Bonjour Thibault,', '',
        'Métier : ' + (fd.get('metier') || ''),
        'Besoins : ' + fd.getAll('besoins[]').join(', '),
        'Formule : ' + (fd.get('formule') || ''),
        'Nom : ' + (fd.get('nom') || ''),
        'Entreprise : ' + (fd.get('entreprise') || ''),
        'Téléphone : ' + (fd.get('telephone') || ''),
        'E-mail : ' + (fd.get('email') || ''), '',
        (fd.get('message') || ''),
      ];
      return 'mailto:thibault.lbrt21@gmail.com?subject=' + encodeURIComponent('Demande de devis — ' + (fd.get('nom') || '')) + '&body=' + encodeURIComponent(lines.join('\n'));
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validate(2)) return;
      form.classList.add('is-sending');
      form.classList.remove('is-failed');
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.error || 'send');
        form.classList.add('is-done');
        const done = $('[data-done]', form);
        done && done.focus({ preventScroll: true });
      } catch (ex) {
        form.classList.add('is-failed');
        const link = $('[data-mailto]', form);
        if (link) link.href = mailto();
      } finally {
        form.classList.remove('is-sending');
      }
    });

    // retour depuis send.php sans JavaScript
    if (location.hash === '#merci') form.classList.add('is-done');
    if (location.hash === '#erreur') { form.classList.add('is-failed'); show(2); }
  }

  /* ---------- Inclinaison 3D des cartes ---------- */
  function initTilt() {
    if (!finePointer || reduced) return;
    $$('[data-tilt]').forEach((el) => {
      let raf = null;
      let box = null; // position de la carte mesurée AVANT inclinaison
      const ready = () => !(doc.classList.contains('js') && el.hasAttribute('data-reveal') && !el.classList.contains('is-revealed'));
      const measure = () => {
        const r = el.getBoundingClientRect();
        box = { left: r.left + window.scrollX, top: r.top + window.scrollY, w: r.width, h: r.height };
      };
      el.addEventListener('pointerenter', () => { if (ready()) measure(); });
      el.addEventListener('pointermove', (e) => {
        if (!ready()) return;
        if (!box) measure();
        // On ne remesure pas pendant l'inclinaison : la carte penchée a une autre
        // boîte, ce qui changeait l'angle à chaque mouvement et la faisait trembler.
        const x = (e.clientX + window.scrollX - box.left) / box.w - 0.5;
        const y = (e.clientY + window.scrollY - box.top) / box.h - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `perspective(1100px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        cancelAnimationFrame(raf);
        box = null;
        el.style.transform = '';
      });
    });
  }

  /* ---------- Curseur personnalisé + boutons aimantés ---------- */
  function initCursor() {
    if (!finePointer || reduced) return;
    const cur = $('.cursor');
    const label = $('.cursor__label');
    if (!cur) return;
    doc.classList.add('has-cursor');
    let x = -100, y = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const lab = t.closest('[data-cursor]');
      const link = t.closest('a, button, summary, label.choice, .ba__stage');
      cur.classList.toggle('is-label', !!lab);
      label.textContent = lab ? lab.dataset.cursor : '';
      cur.classList.toggle('is-link', !lab && !!link);
      cur.classList.toggle('is-hidden', !!t.closest('input, textarea'));
    });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('pointerenter', () => cur.classList.remove('is-hidden'));

    $$('[data-magnetic]').forEach((el) => {
      let tx = 0, ty = 0;
      el.addEventListener('pointermove', (e) => {
        // Centre « au repos » : on retire le décalage déjà appliqué, sinon le bouton
        // se mesure après avoir bougé, se recale, et tremble sous le curseur.
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - tx);
        const dy = e.clientY - (r.top + r.height / 2 - ty);
        tx = dx * 0.18; ty = dy * 0.28;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });
      el.addEventListener('pointerleave', () => {
        tx = 0; ty = 0;
        el.style.transform = '';
      });
    });
  }

  /* ---------- Barre d'action mobile ---------- */
  function initMobileBar() {
    const bar = $('[data-mobilebar]');
    const quote = $('#devis');
    if (!bar) return;
    const update = () => {
      const past = window.scrollY > window.innerHeight * 0.7;
      let inQuote = false;
      if (quote) { const r = quote.getBoundingClientRect(); inQuote = r.top < window.innerHeight && r.bottom > 0; }
      bar.classList.toggle('is-visible', past && !inQuote);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
})();
