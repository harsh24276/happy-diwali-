// ── Mobile detection ──────────────────────────────────────────
const isMobile = /Mobi|Android/i.test(navigator.userAgent) || innerWidth < 600;

// ── Cursor ────────────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
if (!isMobile) {
  document.addEventListener('mousemove', e => {
    cursorEl.style.left = e.clientX + 'px';
    cursorEl.style.top  = e.clientY + 'px';
    spawnSparkle(e.clientX, e.clientY);
  });
}

function spawnSparkle(x, y) {
  const s = document.createElement('div');
  const size = 3 + Math.random() * 5;
  const colors = ['#ffd700','#f5a623','#ff6b6b','#fff8e1','#ffb347'];
  Object.assign(s.style, {
    position: 'fixed', borderRadius: '50%', pointerEvents: 'none',
    zIndex: 9998, width: size + 'px', height: size + 'px',
    background: colors[Math.floor(Math.random() * colors.length)],
    left: (x + (Math.random() - 0.5) * 20) + 'px',
    top:  (y + (Math.random() - 0.5) * 20) + 'px',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
    boxShadow: '0 0 8px currentColor',
  });
  document.body.appendChild(s);
  requestAnimationFrame(() => {
    s.style.opacity = '0';
    s.style.transform = `translate(${(Math.random()-0.5)*40}px,${-25-Math.random()*25}px) scale(0)`;
  });
  setTimeout(() => s.remove(), 750);
}

// ── Background canvas: stars + rangoli ───────────────────────
const bgCanvas = document.getElementById('bg');
const bgCtx    = bgCanvas.getContext('2d');

function resizeBg() { bgCanvas.width = innerWidth; bgCanvas.height = innerHeight; drawBg(); }

const starCount = isMobile ? 60 : 180;
const stars = Array.from({length: starCount}, () => ({
  x: Math.random(), y: Math.random(),
  r: 0.4 + Math.random() * 1.4,
  a: 0.3 + Math.random() * 0.7,
  speed: 0.003 + Math.random() * 0.007,
  phase: Math.random() * Math.PI * 2
}));

let bgTick = 0;
let lastBgFrame = 0;
function drawBg(ts) {
  if (isMobile && ts - lastBgFrame < 50) { requestAnimationFrame(drawBg); return; }
  lastBgFrame = ts;
  const W = bgCanvas.width, H = bgCanvas.height;
  bgCtx.clearRect(0, 0, W, H);
  bgTick += isMobile ? 0.04 : 0.02;

  stars.forEach(s => {
    const alpha = s.a * (0.6 + 0.4 * Math.sin(bgTick * s.speed * 60 + s.phase));
    bgCtx.globalAlpha = alpha;
    bgCtx.fillStyle = '#fff8e1';
    bgCtx.beginPath();
    bgCtx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    bgCtx.fill();
  });

  if (!isMobile) drawRangoli(bgCtx, W / 2, H - 220, 90, bgTick);

  bgCtx.globalAlpha = 1;
  requestAnimationFrame(drawBg);
}

function drawRangoli(ctx, cx, cy, r, t) {
  const petalColors = ['#f5a623','#ff6b6b','#ffd700','#e91e8c','#54a0ff','#00d2d3'];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.3);
  ctx.globalAlpha = 0.22;
  for (let i = 0; i < 12; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 / 12) * i);
    ctx.fillStyle = petalColors[i % petalColors.length];
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.72, r * 0.12, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.rotate(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 / 8) * i);
    ctx.fillStyle = petalColors[(i + 2) % petalColors.length];
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.5, r * 0.09, r * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  [0.55, 0.82, 1.0].forEach((scale, idx) => {
    ctx.globalAlpha = 0.18 - idx * 0.04;
    ctx.strokeStyle = idx === 1 ? '#ff6b6b' : '#f5a623';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r * scale, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

resizeBg();
window.addEventListener('resize', resizeBg);

// ── Big Diya + Progress Bar ───────────────────────────────────
const TOTAL = 360;
let litCount = 0;
localStorage.setItem('diyaCount', '0');
let diyaLit = false;

function makeBigDiya(lit) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 120 150');
  svg.setAttribute('width', '120');
  svg.setAttribute('height', '150');

  const bowl = document.createElementNS(ns, 'path');
  bowl.setAttribute('d', 'M18,84 Q60,114 102,84 L90,102 Q60,126 30,102 Z');
  bowl.setAttribute('fill', lit ? '#c0392b' : '#4a1a00');
  svg.appendChild(bowl);

  const shine = document.createElementNS(ns, 'ellipse');
  shine.setAttribute('cx', '60'); shine.setAttribute('cy', '90');
  shine.setAttribute('rx', '30'); shine.setAttribute('ry', '8');
  shine.setAttribute('fill', lit ? '#e74c3c' : '#6b2800');
  shine.setAttribute('opacity', '0.5');
  svg.appendChild(shine);

  const wick = document.createElementNS(ns, 'line');
  wick.setAttribute('x1', '60'); wick.setAttribute('y1', '84');
  wick.setAttribute('x2', '60'); wick.setAttribute('y2', '66');
  wick.setAttribute('stroke', lit ? '#7f4f00' : '#3a2800');
  wick.setAttribute('stroke-width', '3');
  svg.appendChild(wick);

  const flameOuter = document.createElementNS(ns, 'ellipse');
  flameOuter.setAttribute('cx', '60'); flameOuter.setAttribute('cy', '48');
  flameOuter.setAttribute('rx', '15'); flameOuter.setAttribute('ry', '24');
  flameOuter.setAttribute('fill', '#f5a623');
  flameOuter.setAttribute('opacity', lit ? '1' : '0');
  const animO = document.createElementNS(ns, 'animateTransform');
  animO.setAttribute('attributeName', 'transform'); animO.setAttribute('type', 'scale');
  animO.setAttribute('values', '1 1;1.1 0.92;0.93 1.08;1 1');
  animO.setAttribute('dur', '1.4s'); animO.setAttribute('repeatCount', 'indefinite');
  animO.setAttribute('additive', 'sum');
  flameOuter.appendChild(animO);
  svg.appendChild(flameOuter);

  const flameMid = document.createElementNS(ns, 'ellipse');
  flameMid.setAttribute('cx', '60'); flameMid.setAttribute('cy', '50');
  flameMid.setAttribute('rx', '9'); flameMid.setAttribute('ry', '18');
  flameMid.setAttribute('fill', '#ffb347');
  flameMid.setAttribute('opacity', lit ? '1' : '0');
  svg.appendChild(flameMid);

  const flameInner = document.createElementNS(ns, 'ellipse');
  flameInner.setAttribute('cx', '60'); flameInner.setAttribute('cy', '54');
  flameInner.setAttribute('rx', '5'); flameInner.setAttribute('ry', '12');
  flameInner.setAttribute('fill', '#fff8e1');
  flameInner.setAttribute('opacity', lit ? '1' : '0');
  svg.appendChild(flameInner);

  const glow = document.createElementNS(ns, 'ellipse');
  glow.setAttribute('cx', '60'); glow.setAttribute('cy', '48');
  glow.setAttribute('rx', '26'); glow.setAttribute('ry', '30');
  glow.setAttribute('fill', '#f5a623');
  glow.setAttribute('opacity', lit ? '0.15' : '0');
  const animG = document.createElementNS(ns, 'animate');
  animG.setAttribute('attributeName', 'opacity');
  animG.setAttribute('values', '0.15;0.28;0.08;0.15');
  animG.setAttribute('dur', '1.4s'); animG.setAttribute('repeatCount', 'indefinite');
  glow.appendChild(animG);
  svg.appendChild(glow);

  return svg;
}

function setDiyaLit(lit) {
  diyaLit = lit;
  const wrap = document.getElementById('big-diya');
  wrap.innerHTML = '';
  wrap.appendChild(makeBigDiya(lit));
  wrap.classList.toggle('lit', lit);
  document.getElementById('diya-hint').style.opacity = lit ? '0' : '1';
}

function updateProgress() {
  const pct = Math.min((litCount / TOTAL) * 100, 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('lit-count').textContent = litCount;
}

function initDiya() {
  setDiyaLit(false);
  updateProgress();
}

document.getElementById('big-diya').addEventListener('click', () => {
  if (diyaLit) return;
  litCount = Math.min(litCount + 1, TOTAL);
  localStorage.setItem('diyaCount', litCount);
  setDiyaLit(true);
  updateProgress();
  explode(innerWidth / 2, innerHeight * 0.6, 60);
  if (!animating) { animating = true; animateFw(); }
});

// ── Rocket Crackers ───────────────────────────────────────────
function makeRocketSVG() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 20 48');
  svg.setAttribute('width', '20');
  svg.setAttribute('height', '48');
  const color = Math.random() > 0.5 ? '#c0392b' : '#8e1a00';

  const body = document.createElementNS(ns, 'rect');
  body.setAttribute('x','5'); body.setAttribute('y','14');
  body.setAttribute('width','10'); body.setAttribute('height','22');
  body.setAttribute('rx','2'); body.setAttribute('fill', color);
  svg.appendChild(body);

  const nose = document.createElementNS(ns, 'polygon');
  nose.setAttribute('points','10,2 5,14 15,14');
  nose.setAttribute('fill','#ffd700');
  svg.appendChild(nose);

  const finL = document.createElementNS(ns, 'polygon');
  finL.setAttribute('points','5,28 0,38 5,36');
  finL.setAttribute('fill','#f5a623');
  svg.appendChild(finL);

  const finR = document.createElementNS(ns, 'polygon');
  finR.setAttribute('points','15,28 20,38 15,36');
  finR.setAttribute('fill','#f5a623');
  svg.appendChild(finR);

  const flame = document.createElementNS(ns, 'ellipse');
  flame.setAttribute('cx','10'); flame.setAttribute('cy','40');
  flame.setAttribute('rx','3'); flame.setAttribute('ry','6');
  flame.setAttribute('fill','#f5a623'); flame.setAttribute('opacity','0.8');
  const animF = document.createElementNS(ns, 'animate');
  animF.setAttribute('attributeName','opacity');
  animF.setAttribute('values','0.8;0.2;0.8');
  animF.setAttribute('dur','0.3s');
  animF.setAttribute('repeatCount','indefinite');
  flame.appendChild(animF);
  svg.appendChild(flame);

  const stick = document.createElementNS(ns, 'line');
  stick.setAttribute('x1','10'); stick.setAttribute('y1','36');
  stick.setAttribute('x2','10'); stick.setAttribute('y2','48');
  stick.setAttribute('stroke','#7f4f00'); stick.setAttribute('stroke-width','1.5');
  svg.appendChild(stick);

  return svg;
}

function spawnRocket() {
  const diyaSection = document.getElementById('diya-section');
  if (!diyaSection || diyaSection.style.display === 'none') return;
  const rect = diyaSection.getBoundingClientRect();
  if (rect.top > window.innerHeight) return; // not visible yet

  const wrap = document.createElement('div');
  const dur = isMobile ? 5 + Math.random() * 4 : 4 + Math.random() * 3;
  const startX = 20 + Math.random() * (window.innerWidth - 40);
  Object.assign(wrap.style, {
    position: 'fixed',
    left: startX + 'px',
    bottom: '0px',
    zIndex: '6',
    pointerEvents: 'auto',
    cursor: 'pointer',
    animation: `rocketUp ${dur}s linear forwards`,
  });
  wrap.appendChild(makeRocketSVG());
  document.body.appendChild(wrap);
  wrap.addEventListener('click', () => {
    const r = wrap.getBoundingClientRect();
    explode(r.left + r.width / 2, r.top + r.height / 2, isMobile ? 40 : 80);
    if (!animating) { animating = true; animateFw(); }
    wrap.remove();
  });
  setTimeout(() => wrap.remove(), dur * 1000);
}

const kf = document.createElement('style');
kf.textContent = `@keyframes rocketUp {
  0%   { transform: translateY(0) rotate(-3deg); opacity: 1; }
  50%  { transform: translateY(-55vh) rotate(3deg); opacity: 1; }
  100% { transform: translateY(-115vh) rotate(-2deg); opacity: 0; }
}`;
document.head.appendChild(kf);

setInterval(spawnRocket, isMobile ? 3000 : 1800);
// Don't spawn on load — wait for diya section to be visible

// ── Popup / Greet ─────────────────────────────────────────────
let userName = '';
const messages = [
  'May the festival of lights fill your life with joy, prosperity, and happiness. Wishing you and your family a sparkling Diwali filled with love, laughter, and the warm glow of a thousand diyas.',
  'Like a diya that glows brightest in the dark, may your life shine with hope and courage. Have a truly magical Diwali.',
  'May Lakshmi bless your home with wealth, wisdom, and warmth this Diwali and always.',
];

function greet() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    const inp = document.getElementById('nameInput');
    inp.style.borderColor = '#e74c3c';
    inp.style.boxShadow = '0 0 0 3px #e74c3c22';
    return;
  }
  userName = name;
  document.getElementById('popup').style.display = 'none';
  document.getElementById('page').style.display = 'flex';
  document.getElementById('displayName').textContent = '';
  document.getElementById('typeMsg').textContent = '';
  document.getElementById('greeting').style.display = 'flex';
  document.getElementById('diya-section').style.display = 'flex';
  initDiya();
  typeWriter('displayName', name, 65);
  const msg = messages[Math.floor(Math.random() * messages.length)];
  setTimeout(() => typeWriter('typeMsg', msg, 26), name.length * 65 + 300);
  launchFireworks();
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') greet();
  e.target.style.borderColor = '';
  e.target.style.boxShadow = '';
});

// ── Typewriter ────────────────────────────────────────────────
function typeWriter(id, text, speed) {
  const el = document.getElementById(id);
  let i = 0;
  const t = setInterval(() => {
    el.textContent += text[i++];
    if (i >= text.length) clearInterval(t);
  }, speed);
}

// ── Fireworks ─────────────────────────────────────────────────
const fwCanvas = document.getElementById('fireworks');
const fwCtx    = fwCanvas.getContext('2d');
let particles = [], animating = false;

function resizeFw() { fwCanvas.width = innerWidth; fwCanvas.height = innerHeight; }
resizeFw();
window.addEventListener('resize', resizeFw);

const fwColors = ['#f5a623','#ff6b6b','#ffd700','#ffb347','#e91e8c','#54a0ff','#00d2d3','#c0392b'];

function explode(x, y, count) {
  count = isMobile ? Math.floor((count || 90) * 0.4) : (count || 90);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.3;
    const speed = 1.5 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: fwColors[Math.floor(Math.random() * fwColors.length)],
      size: 1.5 + Math.random() * 2.5,
      trail: [],
      shape: 'circle'
    });
  }
}

function animateFw() {
  if (!animating) return;
  fwCtx.fillStyle = 'rgba(10,0,5,0.18)';
  fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
  particles = particles.filter(p => p.alpha > 0.02);
  particles.forEach(p => {
    if (!isMobile) {
      p.trail.push({ x: p.x, y: p.y, a: p.alpha });
      if (p.trail.length > 4) p.trail.shift();
      p.trail.forEach((t, i) => {
        fwCtx.globalAlpha = t.a * (i / p.trail.length) * 0.3;
        fwCtx.fillStyle = p.color;
        fwCtx.beginPath();
        fwCtx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2);
        fwCtx.fill();
      });
    }
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.055; p.vx *= 0.99;
    p.alpha -= isMobile ? 0.022 : 0.012;
    fwCtx.globalAlpha = p.alpha;
    fwCtx.fillStyle = p.color;
    if (!isMobile) { fwCtx.shadowBlur = 8; fwCtx.shadowColor = p.color; }
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fwCtx.fill();
    fwCtx.shadowBlur = 0;
  });
  fwCtx.globalAlpha = 1;
  requestAnimationFrame(animateFw);
}

function launchFireworks() {
  animating = true;
  animateFw();
  let count = 0;
  const total = isMobile ? 6 : 24;
  const interval = isMobile ? 500 : 320;
  const iv = setInterval(() => {
    explode(
      80 + Math.random() * (fwCanvas.width - 160),
      60 + Math.random() * (fwCanvas.height * 0.6)
    );
    if (++count >= total) clearInterval(iv);
  }, interval);
  if (!isMobile) {
    fwCanvas.style.pointerEvents = 'auto';
    fwCanvas.addEventListener('click', e => explode(e.clientX, e.clientY, 75));
  }
}
