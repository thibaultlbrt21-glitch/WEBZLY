/* =========================================================
   WEBZLY — « Encre » : l'image animée des pages.
   De l'encre dans l'eau : un bruit fractal déformé deux fois, que la souris attire.
   Chaque [data-encre] reçoit son canvas WebGL. Sans WebGL, l'image fixe reste en fond.
   ========================================================= */
(() => {
  'use strict';
  const boxes = [...document.querySelectorAll('[data-encre]')];
  if (!boxes.length) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const t0 = performance.now();
  const K = 0.5; // demi-résolution : l'encre est floue de toute façon, et le téléphone reste frais

  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r; uniform float t; uniform vec2 m; uniform vec2 s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.03;a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r.y+s; vec2 mm=m/r.y+s; float d=exp(-length(uv-mm)*2.6);
  vec2 q=vec2(fb(uv*1.4+t*.04),fb(uv*1.4+vec2(5.2,1.3)-t*.035));
  vec2 w=vec2(fb(uv*1.4+4.*q+vec2(1.7,9.2)+.12*t+d*.9),fb(uv*1.4+4.*q+vec2(8.3,2.8)-.1*t-d*.6));
  float f=fb(uv*1.4+4.*w);
  vec3 col=mix(vec3(.04,.035,.03),vec3(.32,.06,.03),clamp(f*f*2.2,0.,1.));
  col=mix(col,vec3(.95,.52,.16),clamp(length(q)*f*1.1-.38,0.,1.));
  col=mix(col,vec3(1.,.86,.62),clamp(w.x*w.x*f*1.1-.42,0.,1.));
  col*=.55+.45*smoothstep(0.,.9,gl_FragCoord.y/r.y+.25);
  gl_FragColor=vec4(col,1.);
}`;

  const program = (gl) => {
    const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return null;
    const p = gl.createProgram(); gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    return { r: gl.getUniformLocation(p, 'r'), t: gl.getUniformLocation(p, 't'), m: gl.getUniformLocation(p, 'm'), s: gl.getUniformLocation(p, 's') };
  };

  // Une graine par page, pour que chaque bandeau ait sa propre encre.
  const pageSeed = [...location.pathname].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7);
  const pointer = { x: 0, y: 0, at: -1e9 };
  addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.at = performance.now(); }, { passive: true });

  const items = [];
  boxes.forEach((box, i) => {
    const c = document.createElement('canvas');
    let gl = null;
    try { gl = c.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }); } catch (e) {}
    if (!gl) return;
    const u = program(gl);
    if (!u) return;
    box.appendChild(c);
    const fixed = box.dataset.encre;
    const sd = fixed !== '' && !isNaN(+fixed) ? +fixed : (pageSeed + i * 13) % 50;
    const it = { box, c, gl, u, seed: [sd * 1.37, sd * 0.71], on: false, mx: -1, my: -1, w: 0, h: 0, drawn: false };
    const size = () => {
      const b = box.getBoundingClientRect();
      it.w = c.width = Math.max(2, Math.round(b.width * K)); it.h = c.height = Math.max(2, Math.round(b.height * K));
      gl.viewport(0, 0, it.w, it.h);
      if (it.mx < 0) { it.mx = it.w * 0.7; it.my = it.h * 0.6; }
      if (reduced) draw(it, performance.now());
    };
    c.addEventListener('webglcontextlost', (e) => { e.preventDefault(); box.classList.remove('is-live'); it.dead = true; });
    new ResizeObserver(size).observe(box);
    size();
    items.push(it);
  });
  if (!items.length) return;

  function draw(it, now) {
    if (it.dead) return;
    const t = (now - t0) / 1000 + 20;
    let tx, ty;
    if (now - pointer.at < 4000) {
      const b = it.box.getBoundingClientRect();
      tx = (pointer.x - b.left) * K; ty = (b.bottom - pointer.y) * K;
    } else { // sans souris (téléphone), l'encre se promène seule
      tx = it.w * (0.62 + 0.22 * Math.sin(t * 0.21)); ty = it.h * (0.55 + 0.22 * Math.cos(t * 0.17));
    }
    it.mx += (tx - it.mx) * 0.05; it.my += (ty - it.my) * 0.05;
    const g = it.gl;
    g.uniform2f(it.u.r, it.w, it.h); g.uniform1f(it.u.t, t); g.uniform2f(it.u.m, it.mx, it.my); g.uniform2f(it.u.s, it.seed[0], it.seed[1]);
    g.drawArrays(g.TRIANGLES, 0, 3);
    if (!it.drawn) { it.drawn = true; it.box.classList.add('is-live'); }
  }

  // On ne dessine que ce qui est à l'écran ; au téléphone, une image sur deux.
  let raf = 0, frame = 0;
  const loop = (now) => {
    raf = 0; frame++;
    const live = items.filter((it) => it.on && !it.dead);
    if (!live.length) return;
    if (!coarse || frame % 2 === 0) live.forEach((it) => draw(it, now));
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { const it = items.find((x) => x.box === e.target); if (it) it.on = e.isIntersecting; });
    if (reduced) { items.forEach((it) => it.on && !it.drawn && draw(it, performance.now())); return; }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { rootMargin: '80px 0px' });
  items.forEach((it) => io.observe(it.box));
})();
