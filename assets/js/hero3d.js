/* =========================================================
   WEBZLY — scène 3D du héros : le Z du logo en verre teinté,
   entouré de formes satinées, éclairé comme en studio.
   Couleur d'accent lue dans le CSS (suit la palette choisie).
   Illustration fixe si WebGL manque ou si les animations sont réduites.
   ========================================================= */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const stage = document.querySelector('[data-hero3d]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; } })();
const skip = new URLSearchParams(location.search).has('no3d');
const light = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
if (stage && !reduced && ok && !skip) init();

function accent() { return getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#FF5B23'; }
function bg() { return getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0B0B0A'; }

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, light ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(-5, 6, 6); scene.add(key);
  const accLight = new THREE.PointLight(accent(), 60, 30); accLight.position.set(3, 1, 4); scene.add(accLight);

  const root = new THREE.Group(); scene.add(root);

  // Z en verre teinté
  const pts = [[6, 7], [95, 7], [54, 55], [87, 55], [18, 121], [35, 83], [4, 83], [43, 38], [6, 38]];
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - 50, -(y - 64))));
  const zGeo = new THREE.ExtrudeGeometry(shape, { depth: 26, bevelEnabled: true, bevelThickness: 7, bevelSize: 5, bevelSegments: 10, curveSegments: 4 });
  zGeo.center();
  // sur téléphone : pas de transmission (coûteuse), un vernis brillant à la place
  const glass = new THREE.MeshPhysicalMaterial({ color: accent(), transmission: light ? 0 : 1, metalness: light ? 0.15 : 0, thickness: 1.6, roughness: 0.12, ior: 1.45, iridescence: 0.35, iridescenceIOR: 1.3, clearcoat: 1, clearcoatRoughness: 0.08, attenuationColor: new THREE.Color(accent()), attenuationDistance: 2.2, envMapIntensity: 1.3 });
  const z = new THREE.Mesh(zGeo, glass); z.scale.setScalar(0.042);
  const zWrap = new THREE.Group(); zWrap.add(z); zWrap.rotation.z = -0.1;
  root.add(zWrap);

  // Formes satinées
  const satin = (color, rough = 0.28, metal = 0.1) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const dark = satin(0x1a1a1a, 0.35, 0.2);
  const chrome = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12 });
  const accMat = satin(accent(), 0.3, 0.05);

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.7, 64, 48), accMat); sphere.position.set(-1.7, 2.3, -1);
  const torus = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.2, 48, 96), chrome); torus.position.set(1.5, 2.7, -0.6); torus.rotation.set(1.1, 0.3, 0);
  const cube = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.1, 1.1, 8, 0.28), dark); cube.position.set(2.4, -1.8, 0.2); cube.rotation.set(0.5, 0.7, 0.2);
  const pill = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.9, 16, 32), chrome); pill.position.set(-0.4, -2.7, 0.6); pill.rotation.z = 1.0;
  const small = new THREE.Mesh(new THREE.SphereGeometry(0.24, 48, 32), chrome); small.position.set(0.6, 2.75, 0.8);
  root.add(sphere, torus, cube, pill, small);

  const floaters = [zWrap, sphere, torus, cube, pill, small].map((o, i) => ({ o, y0: o.position.y, a: 0.12 + (i % 3) * 0.05, s: 0.6 + i * 0.13, p: i * 1.1 }));

  // la palette peut changer (comparaison des propositions)
  new MutationObserver(() => {
    const c = new THREE.Color(accent());
    glass.color.copy(c); glass.attenuationColor.copy(c); accMat.color.copy(c); accLight.color.copy(c);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const resize = () => {
    const r = stage.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    // sur grand écran, l'objet se place à droite du titre ; sur mobile, en haut, en retrait
    const wide = camera.aspect > 1.1;
    root.position.set(wide ? 3.9 * Math.min(camera.aspect / 1.6, 1.3) : 0.8, wide ? 0.7 : 2.4, 0);
    root.scale.setScalar(wide ? 0.72 : 0.6);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(stage); resize();

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });

  let visible = true, raf = 0;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) loop(); });

  const clock = new THREE.Clock();
  let intro = 0, scrollK = 0;
  function loop() {
    if (!visible || document.hidden) { raf = 0; return; }
    raf = requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    intro = Math.min(1, intro + 0.01); const e = 1 - Math.pow(1 - intro, 3);
    scrollK += (Math.min(1, scrollY / innerHeight) - scrollK) * 0.1;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    root.rotation.y = mx * 0.3 + (1 - e) * -1.2;
    root.rotation.x = my * 0.2 + scrollK * 0.4;
    zWrap.rotation.y = Math.sin(t * 0.5) * 0.55 + scrollK * 1.2;
    zWrap.position.z = scrollK * 2;
    cube.rotation.y += 0.004; torus.rotation.y += 0.005;
    for (const f of floaters) f.o.position.y = f.y0 + Math.sin(t * f.s + f.p) * f.a;
    renderer.render(scene, camera);
  }
  renderer.render(scene, camera);
  stage.classList.add('has-3d');
  loop();
}
