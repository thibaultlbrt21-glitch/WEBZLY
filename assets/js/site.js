/* =========================================================
   WEBZLY — « Encre » : interactions
   ========================================================= */
(() => {
  'use strict';
  window.wzReady = true;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const eur = (n) => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' €';

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Défilement fluide ---------- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id.length > 1 && document.querySelector(id);
    if (!t) return;
    e.preventDefault(); closeMenu();
    if (lenis) lenis.scrollTo(t, { offset: -90 }); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- En-tête, barre d'appel, encre du héros ---------- */
  const hd = $('[data-header]'), mbar = $('[data-mbar]'), heroInk = $('.hero .encre');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hd.classList.toggle('is-scrolled', y > 20);
    hd.classList.toggle('is-hidden', y > 400 && y > lastY && !document.body.classList.contains('menu-open'));
    if (mbar) mbar.classList.toggle('is-visible', y > innerHeight * 0.7);
    if (heroInk && !reduced && y < innerHeight * 1.2) heroInk.style.setProperty('--py', `${Math.round(y * 0.35)}px`);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Menu mobile ---------- */
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true; document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); $('.sr', burger).textContent = 'Ouvrir le menu';
    lenis && lenis.start();
  }
  if (burger && menu) {
    burger.addEventListener('click', () => {
      if (!menu.hidden) return closeMenu();
      menu.hidden = false; document.body.classList.add('menu-open');
      burger.setAttribute('aria-expanded', 'true'); $('.sr', burger).textContent = 'Fermer le menu';
      lenis && lenis.stop(); $('a', menu).focus();
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); burger.focus(); } });
    $$('a', menu).forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* ---------- Apparitions ---------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sibs = $$('[data-reveal]:not(.in)', e.target.parentElement);
    e.target.style.transitionDelay = `${Math.min(sibs.indexOf(e.target), 4) * 0.08}s`;
    e.target.classList.add('in'); io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal]').forEach((el) => io.observe(el));

  /* ---------- Avant / après ---------- */
  $$('[data-ba]').forEach((ba) => {
    const r = $('[data-ba-range]', ba), set = (v) => ba.style.setProperty('--pos', `${v}%`);
    r.addEventListener('input', () => set(r.value)); set(r.value);
  });

  /* ---------- Configurateur de budget ---------- */
  $$('[data-conf]').forEach((f) => {
    const pick = (n) => $(`input[name="${n}"]:checked`, f);
    const out = (k, v) => { const el = $(`[data-sum-${k}]`, f); if (el) el.textContent = v; };
    const calc = () => {
      const c = pick('formule'), a = pick('abonnement');
      const pc = +c.dataset.price, pa = +a.dataset.price;
      const dep = Math.round(pc * 0.3), from = c.hasAttribute('data-from') || a.hasAttribute('data-from');
      out('name', `${c.value} + ${a.value}`);
      out('deposit', eur(dep)); out('balance', eur(pc - dep)); out('month', eur(pa));
      out('year', (from ? 'dès ' : '') + eur(pc + pa * 12));
      out('note', from ? 'Pour le sur-mesure ou Croissance, le prix exact est fixé dans le devis.' : '');
    };
    f.addEventListener('change', calc); calc();
  });

  /* ---------- Galerie : maquette en grand ---------- */
  const dlg = $('[data-lb-dialog]');
  if (dlg && dlg.showModal) {
    const img = $('[data-lb-img]', dlg), name = $('[data-lb-name]', dlg);
    $$('[data-lb]').forEach((b) => b.addEventListener('click', () => {
      img.src = b.dataset.lb; img.alt = 'Maquette ' + b.dataset.lbTitle; name.textContent = b.dataset.lbTitle;
      dlg.showModal(); dlg.scrollTop = 0; lenis && lenis.stop();
    }));
    $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => lenis && lenis.start());
  }

  /* ---------- FAQ : recherche ---------- */
  const q = $('[data-faq-search]');
  if (q) {
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const items = $$('[data-faq] details'), none = $('[data-faq-none]');
    q.addEventListener('input', () => {
      const words = norm(q.value).split(/\s+/).filter(Boolean); let n = 0;
      items.forEach((d) => { const ok = words.every((w) => norm(d.textContent).includes(w)); d.hidden = !ok; if (ok) n++; d.open = ok && words.length > 0 && n <= 3; });
      $$('[data-faq] .faq__group').forEach((g) => (g.hidden = !$$('details:not([hidden])', g).length));
      none.hidden = n > 0;
    });
  }

  /* ---------- Envoi commun ---------- */
  const post = async (form) => {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'send');
  };
  const telOk = (v) => v.replace(/\D/g, '').length >= 9;

  /* ---------- Rappel rapide ---------- */
  $$('[data-cb]').forEach((cb) => {
    const err = $('[data-err]', cb);
    cb.addEventListener('submit', async (e) => {
      e.preventDefault();
      $$('.is-invalid', cb).forEach((x) => x.classList.remove('is-invalid'));
      const fail = (i, m) => { i.classList.add('is-invalid'); err.textContent = m; i.focus(); };
      if (!cb.nom.value.trim()) return fail(cb.nom, 'Indiquez votre nom.');
      if (!telOk(cb.telephone.value)) return fail(cb.telephone, 'Indiquez un numéro où vous rappeler.');
      if (!cb.consent.checked) { err.textContent = 'Cochez la case pour que je puisse vous rappeler.'; cb.consent.focus(); return; }
      err.textContent = ''; cb.classList.add('is-sending');
      try {
        await post(cb);
        const m = cb.querySelector('input[name="rdv_moment"]:checked');
        $('[data-cb-when]', cb).textContent = m ? ` ${m.value.toLowerCase()}` : '';
        cb.classList.add('is-done'); $('.cb__done', cb).focus({ preventScroll: true });
      } catch (ex) {
        cb.classList.add('is-failed'); $('.cb__fail', cb).focus({ preventScroll: true });
      } finally { cb.classList.remove('is-sending'); }
    });
  });

  /* ---------- Formulaire de devis ---------- */
  const form = $('[data-form]');
  if (form) {
    const steps = $$('[data-step]', form), label = $('[data-step-label]', form), bar = $('[data-bar]', form);
    const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form), err = $('[data-err]', form);
    let cur = 1;
    // Ce que le visiteur a déjà choisi ailleurs sur le site (configurateur, audit)
    const params = new URLSearchParams(location.search);
    ['formule', 'abonnement'].forEach((n) => { const v = params.get(n); if (!v) return; const r = $$(`input[name="${n}"]`, form).find((i) => i.value === v); if (r) r.checked = true; });
    const site = (params.get('site') || '').trim().slice(0, 200);
    if (site) {
      form.site_actuel.value = site;
      const redo = $$('input[name="besoins[]"]', form).find((i) => i.value === 'Refaire mon site'); if (redo) redo.checked = true;
    }
    const show = (n, focus = true) => {
      cur = n; steps.forEach((s) => (s.hidden = +s.dataset.step !== n));
      label.textContent = `Étape ${n} sur ${steps.length}`; bar.style.width = `${(n / steps.length) * 100}%`;
      prev.hidden = n === 1; next.hidden = n === steps.length; submit.hidden = n !== steps.length; err.textContent = '';
      if (focus) { const f = $('input, textarea', steps[n - 1]); f && f.focus({ preventScroll: true }); }
    };
    const validate = () => {
      const nom = form.nom.value.trim(), tel = form.telephone.value.trim(), mail = form.email.value.trim();
      $$('.is-invalid', form).forEach((x) => x.classList.remove('is-invalid'));
      const fail = (i, m) => { i.classList.add('is-invalid'); err.textContent = m; i.focus(); return false; };
      if (!nom) return fail(form.nom, 'Indiquez votre nom.');
      if (!tel && !mail) return fail(form.telephone, 'Laissez un téléphone ou un e-mail pour que je puisse vous répondre.');
      if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail(form.email, 'Cette adresse e-mail semble incomplète.');
      if (tel && !telOk(tel)) return fail(form.telephone, 'Ce numéro semble incomplet.');
      if (!form.consent.checked) { err.textContent = 'Cochez la case pour que je puisse vous répondre.'; form.consent.focus(); return false; }
      return true;
    };
    next.addEventListener('click', () => show(cur + 1));
    prev.addEventListener('click', () => show(cur - 1));
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && cur < steps.length) { e.preventDefault(); show(cur + 1); } });
    const mailto = () => {
      const fd = new FormData(form), g = (k) => fd.get(k) || '';
      const lines = [`Métier : ${g('metier')}`, `Besoins : ${fd.getAll('besoins[]').join(', ')}`, `Site actuel : ${g('site_actuel')}`, `Formule : ${g('formule')}`, `Abonnement : ${g('abonnement')}`,
        `Rendez-vous : ${g('rdv_mode')} · ${g('rdv_moment')}`, `Délai : ${g('delai')}`, '', `Nom : ${g('nom')}`, `Entreprise : ${g('entreprise')}`, `Téléphone : ${g('telephone')}`, `E-mail : ${g('email')}`, '', g('message')];
      return 'mailto:thibault.lbrt21@gmail.com?subject=' + encodeURIComponent('Demande de devis — ' + g('nom')) + '&body=' + encodeURIComponent(lines.join('\n'));
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (cur < steps.length || !validate()) return;
      form.classList.add('is-sending');
      try {
        await post(form);
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
