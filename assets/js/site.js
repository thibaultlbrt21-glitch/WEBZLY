/* =========================================================
   WEBZLY — interactions communes à toutes les pages
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;

  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- En-tête et barre d'appel du téléphone ---------- */
  const hd = $('[data-header]'), mbar = $('[data-mbar]');
  const top = $('.hero, .phead, .nf');
  const heroBtns = $('.hero__btns'); // sur l'accueil : la barre s'affiche dès que ces boutons ne sont pas à l'écran
  const ends = $$('.cta, .close, .ft, .contact');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, menuOpen = body.classList.contains('menu-open');
    hd.classList.toggle('is-solid', y > 12);
    if (!menuOpen) hd.classList.toggle('is-hidden', y > 320 && y > lastY + 2);
    if (y < lastY - 2) hd.classList.remove('is-hidden');
    if (mbar) {
      let past;
      if (heroBtns) { const r = heroBtns.getBoundingClientRect(); past = r.top > innerHeight - 70 || r.bottom < 0; }
      else past = top ? top.getBoundingClientRect().bottom < 0 : y > 300;
      const atEnd = ends.some((el) => el.getBoundingClientRect().top < innerHeight - 40);
      mbar.classList.toggle('is-visible', past && !atEnd);
    }
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Menu ---------- */
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  const closeMenu = () => {
    if (menu.hidden) return;
    menu.hidden = true; body.classList.remove('menu-open'); body.style.overflow = '';
    burger.setAttribute('aria-expanded', 'false'); $('.sr', burger).textContent = 'Ouvrir le menu';
  };
  if (burger && menu) {
    burger.addEventListener('click', () => {
      if (!menu.hidden) return closeMenu();
      menu.hidden = false; body.classList.add('menu-open'); body.style.overflow = 'hidden';
      hd.classList.remove('is-hidden');
      burger.setAttribute('aria-expanded', 'true'); $('.sr', burger).textContent = 'Fermer le menu';
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); burger.focus(); } });
    addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });
  }

  /* ---------- Avant / après : on glisse le doigt ou la souris, ou les flèches du clavier ---------- */
  $$('[data-ba]').forEach((ba) => {
    const stage = $('.ba__stage', ba), range = $('.ba__range', ba);
    const set = (v) => { v = Math.max(0, Math.min(100, v)); stage.style.setProperty('--pos', `${v}%`); range.value = Math.round(v); };
    const fromEvent = (e) => { const r = stage.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; };
    let down = false, sx = 0, sy = 0, decided = false, horizontal = false;
    stage.addEventListener('pointerdown', (e) => {
      down = true; decided = e.pointerType === 'mouse'; horizontal = decided; sx = e.clientX; sy = e.clientY;
      if (horizontal) { stage.setPointerCapture(e.pointerId); set(fromEvent(e)); }
    });
    stage.addEventListener('pointermove', (e) => {
      if (!down) return;
      if (!decided) { // au doigt : on ne bloque pas le défilement vertical de la page
        const dx = Math.abs(e.clientX - sx), dy = Math.abs(e.clientY - sy);
        if (dx < 6 && dy < 6) return;
        decided = true; horizontal = dx > dy;
        if (horizontal) stage.setPointerCapture(e.pointerId);
      }
      if (horizontal) set(fromEvent(e));
    });
    const up = (e) => { if (down && !decided) set(fromEvent(e)); down = false; };
    stage.addEventListener('pointerup', up);
    stage.addEventListener('pointercancel', () => (down = false));
    range.addEventListener('input', () => set(+range.value));
    set(matchMedia('(max-width: 600px)').matches ? 64 : 50); // au téléphone, on montre d'abord le nouveau site
  });

  /* ---------- Maquettes : défilement au survol, en grand au clic ---------- */
  const shots = $$('.shot');
  const measure = () => shots.forEach((b) => {
    const box = $('.shot__img', b), img = $('img', b);
    if (img.naturalWidth) box.style.setProperty('--shift', `${-(img.getBoundingClientRect().height - box.clientHeight)}px`);
  });
  shots.forEach((b) => { const img = $('img', b); if (!img.complete) img.addEventListener('load', measure, { once: true }); });
  measure(); addEventListener('resize', measure);
  const dlg = $('[data-lb-dialog]');
  if (dlg && dlg.showModal) {
    const img = $('[data-lb-img]', dlg), name = $('[data-lb-name]', dlg);
    shots.forEach((b) => b.addEventListener('click', () => {
      img.src = b.dataset.lb; img.alt = 'Maquette ' + b.dataset.lbTitle; name.textContent = b.dataset.lbTitle;
      dlg.showModal(); dlg.scrollTop = 0;
    }));
    $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- Questions : recherche ---------- */
  const q = $('[data-faq-search]');
  if (q) {
    const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');
    const items = $$('[data-faq] details'), none = $('[data-faq-none]');
    q.addEventListener('input', () => {
      const words = norm(q.value).split(/\s+/).filter((w) => w.length > 1); let n = 0;
      items.forEach((d) => { const ok = words.every((w) => norm(d.textContent).includes(w)); d.hidden = !ok; if (ok) n++; d.open = ok && words.length > 0 && n <= 2; });
      $$('[data-faq] .faq__group').forEach((g) => (g.hidden = !$$('details:not([hidden])', g).length));
      none.hidden = n > 0;
    });
  }

  /* ---------- Être rappelé (bas de l'accueil) ---------- */
  $$('[data-cb]').forEach((cb) => {
    const err = $('[data-err]', cb);
    cb.addEventListener('submit', async (e) => {
      e.preventDefault();
      $$('.is-invalid', cb).forEach((x) => x.classList.remove('is-invalid'));
      const fail = (i, m) => { i.classList.add('is-invalid'); err.textContent = m; i.focus(); };
      if (!cb.nom.value.trim()) return fail(cb.nom, 'Indiquez votre nom.');
      if (cb.telephone.value.replace(/\D/g, '').length < 9) return fail(cb.telephone, 'Indiquez un numéro où vous rappeler.');
      if (!cb.consent.checked) { err.textContent = 'Cochez la case pour que je puisse vous rappeler.'; cb.consent.focus(); return; }
      err.textContent = ''; cb.classList.add('is-sending');
      try {
        const res = await fetch(cb.action, { method: 'POST', body: new FormData(cb), headers: { Accept: 'application/json' } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error('send');
        const m = $('input[name="rdv_moment"]:checked', cb);
        $('[data-cb-when]', cb).textContent = m ? ` ${m.value.toLowerCase()}` : '';
        cb.classList.add('is-done'); $('.cb__done', cb).focus({ preventScroll: true });
      } catch (ex) {
        cb.classList.add('is-failed'); $('.cb__fail', cb).focus({ preventScroll: true });
      } finally { cb.classList.remove('is-sending'); }
    });
  });

  /* ---------- Demande de devis en trois étapes ---------- */
  const form = $('[data-form]');
  if (form) {
    const steps = $$('[data-step]', form), label = $('[data-step-label]', form), bar = $('[data-bar]', form);
    const prev = $('[data-prev]', form), next = $('[data-next]', form), submit = $('[data-submit]', form), err = $('[data-err]', form);
    let cur = 1;
    const params = new URLSearchParams(location.search);
    ['formule', 'abonnement'].forEach((n) => { const v = params.get(n); if (!v) return; const r = $$(`input[name="${n}"]`, form).find((i) => i.value === v); if (r) r.checked = true; });
    const show = (n, focus = true) => {
      cur = n; steps.forEach((s) => (s.hidden = +s.dataset.step !== n));
      label.textContent = `Étape ${n} sur ${steps.length}`; bar.style.width = `${(n / steps.length) * 100}%`;
      prev.hidden = n === 1; next.hidden = n === steps.length; submit.hidden = n !== steps.length; err.textContent = '';
      if (focus) { form.scrollIntoView({ block: 'start' }); const f = $('input, textarea', steps[n - 1]); f && f.focus({ preventScroll: true }); }
    };
    const telOk = (v) => v.replace(/\D/g, '').length >= 9;
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
      return 'mailto:thibault.lbrt21@gmail.com?subject=' + encodeURIComponent('Demande de devis, ' + g('nom')) + '&body=' + encodeURIComponent(lines.join('\n'));
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
