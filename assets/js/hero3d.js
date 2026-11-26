/* =========================================================
   WEBZLY — la scène du haut de l'accueil
   Un ordinateur portable s'ouvre et les pages d'un site en sortent.
   On peut les survoler, et les retourner d'un clic ou d'un toucher.
   ========================================================= */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const canvas = document.querySelector('.hero__canvas');
const coarse = window.matchMedia('(pointer: coarse)').matches;
const hero = document.querySelector('.hero');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const COL = {
  ink: '#12110F', ink2: '#1B1A17', ink3: '#24221E', ink4: '#34312B', ink5: '#2C2A25',
  cream: '#F2EEE4', paper: '#FBF9F3', sand: '#D9D0BC', sand2: '#E6DFCF',
  gray: '#A6A092', gray2: '#C9C1B0', mustard: '#E5B80B', mustard2: '#E0B942',
};

if (canvas && hero) {
  try { init(); document.documentElement.classList.add('has-3d'); } catch (e) { document.documentElement.classList.add('no-webgl'); }
}

/* ---------- Dessin des textures (canvas 2D) ---------- */
function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : roundRectPath(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
}
function roundRectPath(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); }
function star(ctx, cx, cy, R, fill) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? R * 0.45 : R;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
}
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

// Barre de navigateur schématique
function browserBar(ctx, x, y, w, dark) {
  rr(ctx, x, y, w, 40, 20, dark ? COL.ink4 : COL.sand2);
  circle(ctx, x + 24, y + 20, 7, COL.mustard);
  circle(ctx, x + 46, y + 20, 7, dark ? '#6A655B' : COL.gray2);
  circle(ctx, x + 68, y + 20, 7, dark ? '#6A655B' : COL.gray2);
}

// Une page de site (carte crème)
function pageTexture(kind) {
  const W = 720, H = 900;
  const [c, ctx] = makeCanvas(W, H);
  rr(ctx, 0, 0, W, H, 54, COL.paper);
  browserBar(ctx, 34, 34, W - 68, false);
  const L = 56;
  if (kind === 'home') {
    rr(ctx, L, 120, 420, 44, 14, COL.ink);
    rr(ctx, L, 176, 300, 44, 14, COL.ink);
    rr(ctx, L, 244, 360, 20, 10, COL.gray2);
    rr(ctx, L, 276, 300, 20, 10, COL.gray2);
    rr(ctx, L, 324, 190, 58, 29, COL.mustard);
    rr(ctx, L + 206, 324, 150, 58, 29, COL.sand2);
    rr(ctx, L, 420, W - 2 * L, 280, 30, COL.sand);
    circle(ctx, W - 160, 500, 40, COL.mustard);
    ctx.beginPath(); ctx.moveTo(L, 700); ctx.lineTo(L + 200, 560); ctx.lineTo(L + 340, 660); ctx.lineTo(L + 440, 590); ctx.lineTo(W - L, 700); ctx.closePath(); ctx.fillStyle = COL.gray2; ctx.fill();
    for (let i = 0; i < 3; i++) rr(ctx, L + i * 206, 730, 190, 120, 22, COL.sand2);
  } else if (kind === 'services') {
    rr(ctx, L, 120, 360, 44, 14, COL.ink);
    rr(ctx, L, 186, 460, 20, 10, COL.gray2);
    for (let i = 0; i < 4; i++) {
      const y = 250 + i * 150;
      rr(ctx, L, y, W - 2 * L, 128, 26, COL.sand2);
      rr(ctx, L + 22, y + 24, 80, 80, 20, i === 1 ? COL.mustard : COL.ink);
      rr(ctx, L + 126, y + 34, 260, 24, 12, COL.ink3);
      rr(ctx, L + 126, y + 72, 380, 16, 8, COL.gray2);
    }
  } else if (kind === 'gallery') {
    rr(ctx, L, 120, 380, 44, 14, COL.ink);
    rr(ctx, L, 186, 300, 20, 10, COL.gray2);
    const cols = [COL.sand, COL.ink3, COL.mustard, COL.gray2, COL.sand, COL.ink3];
    for (let i = 0; i < 6; i++) {
      const x = L + (i % 2) * 312, y = 240 + Math.floor(i / 2) * 210;
      rr(ctx, x, y, 296, 190, 24, cols[i]);
    }
  } else if (kind === 'contact') {
    rr(ctx, L, 120, 320, 44, 14, COL.ink);
    rr(ctx, L, 186, 420, 20, 10, COL.gray2);
    for (let i = 0; i < 3; i++) {
      rr(ctx, L, 246 + i * 104, 140, 16, 8, COL.gray);
      ctx.lineWidth = 4; rr(ctx, L, 272 + i * 104, W - 2 * L, 58, 16, '#fff'); ctx.strokeStyle = COL.sand; ctx.stroke();
    }
    ctx.lineWidth = 4; rr(ctx, L, 570, W - 2 * L, 150, 16, '#fff'); ctx.strokeStyle = COL.sand; ctx.stroke();
    rr(ctx, L, 750, W - 2 * L, 70, 35, COL.mustard);
    rr(ctx, W / 2 - 110, 778, 220, 16, 8, COL.ink);
  } else if (kind === 'reviews') {
    rr(ctx, L, 120, 340, 44, 14, COL.ink);
    for (let k = 0; k < 2; k++) {
      const y = 210 + k * 330;
      rr(ctx, L, y, W - 2 * L, 300, 28, COL.sand2);
      for (let i = 0; i < 5; i++) star(ctx, L + 50 + i * 54, y + 56, 22, COL.mustard);
      rr(ctx, L + 30, y + 110, 520, 18, 9, COL.ink3);
      rr(ctx, L + 30, y + 144, 460, 18, 9, COL.gray);
      rr(ctx, L + 30, y + 178, 400, 18, 9, COL.gray);
      circle(ctx, L + 58, y + 248, 26, k ? COL.ink : COL.mustard);
      rr(ctx, L + 100, y + 238, 160, 18, 9, COL.ink3);
    }
  }
  return c;
}

// Téléphone (comme sur la tuile « site sur-mesure »)
function phoneTexture() {
  const W = 420, H = 860;
  const [c, ctx] = makeCanvas(W, H);
  rr(ctx, 0, 0, W, H, 70, COL.ink4);
  rr(ctx, 18, 18, W - 36, H - 36, 56, COL.cream);
  rr(ctx, W / 2 - 50, 34, 100, 20, 10, COL.ink4);
  rr(ctx, 52, 96, W - 104, 100, 22, COL.ink);
  rr(ctx, 52, 226, W - 104, 30, 15, COL.sand);
  rr(ctx, 52, 276, W - 160, 30, 15, COL.sand);
  rr(ctx, 52, 340, W - 104, 220, 26, COL.sand2);
  circle(ctx, W - 120, 400, 26, COL.mustard);
  rr(ctx, 52, H - 150, 190, 66, 33, COL.mustard);
  return c;
}

// Dos d'une page : la pastille moutarde avec l'éclair WEBZLY
function backTexture(w = 720, h = 900, phone = false) {
  const [c, ctx] = makeCanvas(w, h);
  rr(ctx, 0, 0, w, h, phone ? 70 : 54, phone ? COL.ink4 : COL.sand2);
  ctx.save();
  ctx.translate(w / 2, h / 2); ctx.rotate(-6 * Math.PI / 180);
  rr(ctx, -110, -110, 220, 220, 54, COL.mustard);
  ctx.translate(-62, -80); ctx.scale(1.24, 1.24);
  ctx.fillStyle = COL.ink; ctx.fill(new Path2D('M6 7 H95 L54 55 H87 L18 121 L35 83 H4 L43 38 H6 Z'));
  ctx.restore();
  return c;
}

// Écran du portable (sombre, comme la capture de référence)
function screenTexture() {
  const W = 1400, H = 900;
  const [c, ctx] = makeCanvas(W, H);
  rr(ctx, 0, 0, W, H, 26, COL.ink3);
  browserBar(ctx, 44, 40, W - 88, true);
  rr(ctx, 44, 130, 640, 50, 16, COL.cream);
  rr(ctx, 44, 200, 420, 28, 14, COL.gray);
  rr(ctx, 44, 262, 220, 64, 32, COL.mustard2);
  rr(ctx, 760, 130, 596, 380, 28, COL.ink4);
  circle(ctx, 1240, 210, 34, COL.mustard);
  for (let i = 0; i < 3; i++) rr(ctx, 44 + i * 444, 580, 424, 250, 26, COL.ink4);
  for (let i = 0; i < 3; i++) { rr(ctx, 80 + i * 444, 620, 160, 22, 11, COL.gray); rr(ctx, 80 + i * 444, 662, 260, 16, 8, '#5B564C'); }
  return c;
}

// Clavier schématique
function keyboardTexture() {
  const W = 1400, H = 920;
  const [c, ctx] = makeCanvas(W, H);
  rr(ctx, 0, 0, W, H, 40, COL.ink5);
  const rows = 5, cols = 14, kx = 90, ky = 70, kw = (W - 2 * kx) / cols, kh = 78;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      let w = kw - 12;
      if (r === 4 && (k < 4 || k > 9)) w = kw - 12;
      if (r === 4 && k >= 4 && k <= 9) { if (k === 4) rr(ctx, kx + 4 * kw, ky + r * (kh + 12), kw * 6 - 12, kh, 14, COL.ink3); continue; }
      rr(ctx, kx + k * kw, ky + r * (kh + 12), w, kh, 14, COL.ink3);
    }
  }
  rr(ctx, W / 2 - 230, 560, 460, 300, 30, COL.ink3);
  return c;
}

// Ombre douce (fonctionne aussi sur Safari, sans ctx.filter)
function shadowTexture(w, h, radius, blur) {
  const pad = blur * 2;
  const [c, ctx] = makeCanvas(w + pad * 2, h + pad * 2);
  ctx.shadowColor = 'rgba(0,0,0,1)';
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 10000;
  rr(ctx, pad - 10000, pad, w, h, radius, '#000');
  return c;
}

function init() {
  /* ---------- Rendu ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  const tex = (cnv) => {
    const t = new THREE.CanvasTexture(cnv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, maxAniso);
    return t;
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 300);
  camera.position.set(0, 0, 52);

  scene.add(new THREE.AmbientLight('#ffffff', 1.6));
  const key = new THREE.DirectionalLight('#fff4dc', 2.2);
  key.position.set(-10, 18, 16);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#E5B80B', 1.1);
  rim.position.set(14, -4, -8);
  scene.add(rim);

  const root = new THREE.Group();   // position / échelle selon l'écran
  const stage = new THREE.Group();  // rotation (souris, défilement)
  const inner = new THREE.Group();  // contenu centré
  scene.add(root); root.add(stage); stage.add(inner);
  inner.position.set(0, -4.2, 0);

  /* ---------- Ordinateur portable ---------- */
  const laptop = new THREE.Group();
  inner.add(laptop);
  const bodyMat = new THREE.MeshStandardMaterial({ color: COL.ink2, roughness: 0.55, metalness: 0.15 });
  const lidMat = new THREE.MeshStandardMaterial({ color: COL.ink, roughness: 0.5, metalness: 0.15 });

  const BASE_W = 8, BASE_D = 5.2, BASE_H = 0.32;
  const base = new THREE.Mesh(new RoundedBoxGeometry(BASE_W, BASE_H, BASE_D, 4, 0.14), bodyMat);
  laptop.add(base);
  const kb = new THREE.Mesh(new THREE.PlaneGeometry(BASE_W - 0.5, BASE_D - 0.5), new THREE.MeshBasicMaterial({ map: tex(keyboardTexture()) }));
  kb.rotation.x = -Math.PI / 2;
  kb.position.y = BASE_H / 2 + 0.005;
  laptop.add(kb);

  const hinge = new THREE.Group();
  hinge.position.set(0, BASE_H / 2, -BASE_D / 2 + 0.12);
  laptop.add(hinge);
  const LID_H = 5.2;
  const lid = new THREE.Mesh(new RoundedBoxGeometry(BASE_W, LID_H, 0.2, 4, 0.1), lidMat);
  lid.position.set(0, LID_H / 2, -0.1);
  hinge.add(lid);
  const screenMat = new THREE.MeshBasicMaterial({ map: tex(screenTexture()), transparent: true, opacity: 0 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(BASE_W - 0.6, LID_H - 0.6), screenMat);
  screen.position.set(0, LID_H / 2, 0.005);
  hinge.add(screen);

  // ombre sous le portable
  const groundShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(BASE_W * 1.5, BASE_D * 1.5),
    new THREE.MeshBasicMaterial({ map: tex(shadowTexture(400, 260, 120, 60)), transparent: true, opacity: 0.55, depthWrite: false })
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.y = -BASE_H / 2 - 0.02;
  laptop.add(groundShadow);

  const OPEN = -0.24;           // inclinaison de l'écran ouvert
  const CLOSED = Math.PI / 2;   // écran rabattu
  hinge.rotation.x = OPEN;
  laptop.updateMatrixWorld(true);
  const screenCenter = inner.worldToLocal(screen.getWorldPosition(new THREE.Vector3())); // repère « inner »

  /* ---------- Pages qui sortent de l'écran ---------- */
  const PW = 3.1, PH = PW * 900 / 720;
  const defs = [
    { kind: 'home',     pos: [-4.6, 9.4, 1.2],  rot: [0.05, 0.28, 0.07] },
    { kind: 'services', pos: [-0.2, 10.6, -0.2], rot: [0.02, 0.0, -0.03] },
    { kind: 'gallery',  pos: [4.3, 9.6, 0.8],   rot: [0.05, -0.28, -0.08] },
    { kind: 'contact',  pos: [-7.0, 4.6, 2.2],  rot: [0.0, 0.42, 0.06] },
    { kind: 'reviews',  pos: [6.9, 4.8, 2.0],   rot: [0.0, -0.42, -0.06] },
    { kind: 'phone',    pos: [4.4, 1.9, 3.7],   rot: [-0.08, -0.32, -0.16] },
  ];
  const shadowCanvas = shadowTexture(360, 450, 30, 34);
  const shadowTex = tex(shadowCanvas);
  const pages = defs.map((d, i) => {
    const phone = d.kind === 'phone';
    const w = phone ? 1.45 : PW, h = phone ? 1.45 * 860 / 420 : PH;
    const g = new THREE.Group();
    const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(phone ? phoneTexture() : pageTexture(d.kind)), transparent: true, opacity: 0 }));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex(phone ? backTexture(420, 860, true) : backTexture()), transparent: true, opacity: 0 }));
    back.rotation.y = Math.PI;
    back.position.z = -0.01;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(w * 1.25, h * 1.2), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0, depthWrite: false }));
    shadow.position.set(0.18, -0.28, -0.25);
    g.add(shadow, back, front);
    inner.add(g);
    front.userData.index = i;
    return {
      ...d, g, front, back, shadow,
      target: new THREE.Vector3(...d.pos),
      targetRot: new THREE.Euler(...d.rot),
      delay: 1.05 + i * 0.16,
      hover: 0, flip: 0, flipping: false,
      seed: i * 1.7,
    };
  });

  /* ---------- Mise en page selon l'écran ---------- */
  const CONTENT_W = 17.5, CONTENT_H = 15.5;
  const layout = { rotY: -0.32, rotX: 0.2 };
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    let s, x, y;
    if (w > 900) {
      s = Math.min((visW * 0.44) / CONTENT_W, (visH * 0.78) / CONTENT_H);
      x = visW * 0.255;
      y = -visH * 0.02;
      layout.rotY = -0.32; layout.rotX = 0.2;
    } else {
      const pxToWorld = visH / h;
      const boxTop = 64 + 4;
      const boxH = Math.min(window.innerHeight * 0.34, 300) - 8;
      s = Math.min((visW * 0.86) / CONTENT_W, (boxH * pxToWorld) / CONTENT_H);
      x = 0;
      y = visH / 2 - (boxTop + boxH / 2) * pxToWorld;
      layout.rotY = -0.18; layout.rotX = 0.16;
    }
    root.position.set(x, y, 0);
    root.scale.setScalar(s);
    render();
  }

  /* ---------- Interaction ---------- */
  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  const zero = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let pointerActive = false;
  let hovered = -1;

  const setPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerActive = true;
  };
  const pick = () => {
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pages.map((p) => p.front), false)[0];
    return hit ? hit.object.userData.index : -1;
  };
  hero.addEventListener('pointermove', (e) => {
    setPointer(e);
    if (e.pointerType === 'mouse') {
      hovered = pick();
      hero.classList.toggle('is-page-hover', hovered >= 0);
    }
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { pointerActive = false; hovered = -1; hero.classList.remove('is-page-hover'); });
  hero.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    setPointer(e);
    const i = pick();
    if (i >= 0 && !pages[i].flipping) { pages[i].flipping = true; pages[i].flip = 0; }
    wake();
  });

  /* ---------- Animation ---------- */
  let introT = reduced ? 99 : -1;
  let introStart = 0;
  let running = false;
  let visible = true;
  let scrollP = 0;

  const startIntro = () => { if (introT === -1) { introStart = performance.now(); introT = 0; } wake(); };
  setTimeout(startIntro, 250);

  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const tmp = new THREE.Vector3();
  const startRot = new THREE.Euler(OPEN, 0, 0);

  function frame() {
    const now = performance.now();
    if (introT >= 0 && !reduced) introT = (now - introStart) / 1000;
    const T = introT < 0 ? 0 : introT;
    const t = now / 1000;
    const sp = reduced ? 0 : scrollP;

    smooth.lerp(pointerActive && !reduced ? pointer : zero, 0.06);
    stage.rotation.y = layout.rotY + smooth.x * 0.3 + sp * 0.5;
    stage.rotation.x = layout.rotX - smooth.y * 0.14 + sp * 0.25;
    stage.position.y = sp * 4;

    // 1. le portable s'ouvre
    const kOpen = introT < 0 ? 0 : reduced ? 1 : easeOutCubic(clamp01((T - 0.1) / 1.0));
    hinge.rotation.x = CLOSED + (OPEN - CLOSED) * kOpen - sp * 0.5;
    const kScreen = reduced ? 1 : clamp01((T - 0.7) / 0.5);
    screenMat.opacity = kScreen;
    laptop.position.y = (1 - kOpen) * -0.6;

    // 2. les pages sortent de l'écran
    pages.forEach((p, i) => {
      const k = introT < 0 ? 0 : reduced ? 1 : clamp01((T - p.delay) / 1.15);
      const e = easeOutCubic(k);
      const vis = k > 0;
      p.g.visible = vis;
      if (!vis) return;

      tmp.lerpVectors(screenCenter, p.target, e);
      tmp.z += Math.sin(k * Math.PI) * 2.6;                // la page vient vers nous en sortant
      if (k >= 1 && !reduced) {                             // flottement
        tmp.y += Math.sin(t * 0.9 + p.seed) * 0.16;
        tmp.x += Math.cos(t * 0.6 + p.seed) * 0.06;
      }
      // éparpillement au défilement
      if (sp > 0) {
        tmp.x += (p.target.x) * sp * 0.5;
        tmp.y += (p.target.y - 4) * sp * 0.4;
        tmp.z += sp * 5;
      }
      // survol
      p.hover += ((hovered === i ? 1 : 0) - p.hover) * 0.14;
      tmp.z += p.hover * 1.1;
      p.g.position.copy(tmp);

      // rotation : depuis l'angle de l'écran vers la pose finale
      p.g.rotation.set(
        startRot.x + (p.targetRot.x - startRot.x) * e,
        p.targetRot.y * e,
        p.targetRot.z * e + (k >= 1 && !reduced ? Math.sin(t * 0.7 + p.seed) * 0.025 : 0)
      );
      p.g.rotation.y -= p.hover * p.targetRot.y * 0.6; // se tourne vers nous au survol
      if (p.flipping) {
        p.flip = Math.min(1, p.flip + 0.018);
        p.g.rotation.y += easeInOut(p.flip) * Math.PI * 2;
        if (p.flip >= 1) { p.flipping = false; p.flip = 0; }
      }

      const sc = 0.12 + 0.88 * easeOutBack(Math.min(1, k * 1.05));
      p.g.scale.setScalar(sc * (1 + p.hover * 0.06));
      const op = clamp01(k * 3) * (1 - sp * 0.6);
      p.front.material.opacity = op;
      p.back.material.opacity = op;
      p.shadow.material.opacity = op * 0.32;
    });

    canvas.style.opacity = String(1 - sp * 0.85);
    render();
  }

  function render() { renderer.render(scene, camera); }

  function loop() { if (!running) return; frame(); requestAnimationFrame(loop); }
  function wake() {
    if (running || !visible || document.hidden) return;
    running = true;
    requestAnimationFrame(loop);
  }
  function sleep() { running = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? wake() : sleep(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? sleep() : wake()));

  const onScroll = () => {
    scrollP = clamp01(window.scrollY / (hero.offsetHeight * 0.9));
    if (reduced) render();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  window.addEventListener('resize', resize);
  resize();

  // Redessine le dos des pages une fois les polices chargées
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      pages.forEach((p) => {
        const phone = p.kind === 'phone';
        p.back.material.map = tex(phone ? backTexture(420, 860, true) : backTexture());
        p.back.material.needsUpdate = true;
      });
    });
  }

  if (reduced) frame(); else wake();
}
