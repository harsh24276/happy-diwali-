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
  else drawRangoli(bgCtx, W / 2, H - 160, 60, bgTick);

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
let litCount = parseInt(localStorage.getItem('diyaCount') || '0');
let diyaLit = localStorage.getItem('deviceLit') === 'true';

function makeBigDiya(lit) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 160 200');
  svg.setAttribute('width', '220');
  svg.setAttribute('height', '275');

  // glow halo behind diya
  if (lit) {
    const halo = document.createElementNS(ns, 'ellipse');
    halo.setAttribute('cx','80'); halo.setAttribute('cy','120');
    halo.setAttribute('rx','70'); halo.setAttribute('ry','50');
    halo.setAttribute('fill','#f5a623');
    halo.setAttribute('opacity','0.07');
    const aH = document.createElementNS(ns, 'animate');
    aH.setAttribute('attributeName','opacity');
    aH.setAttribute('values','0.07;0.16;0.07');
    aH.setAttribute('dur','1.8s'); aH.setAttribute('repeatCount','indefinite');
    halo.appendChild(aH);
    svg.appendChild(halo);
  }

  // diya base shadow
  const shadow = document.createElementNS(ns, 'ellipse');
  shadow.setAttribute('cx','80'); shadow.setAttribute('cy','168');
  shadow.setAttribute('rx','44'); shadow.setAttribute('ry','8');
  shadow.setAttribute('fill','#000'); shadow.setAttribute('opacity','0.35');
  svg.appendChild(shadow);

  // outer bowl — rich terracotta
  const bowlOuter = document.createElementNS(ns, 'path');
  bowlOuter.setAttribute('d','M28,118 Q80,158 132,118 L118,142 Q80,172 42,142 Z');
  bowlOuter.setAttribute('fill', lit ? '#b5451b' : '#3d1200');
  svg.appendChild(bowlOuter);

  // bowl rim highlight
  const rim = document.createElementNS(ns, 'path');
  rim.setAttribute('d','M28,118 Q80,104 132,118');
  rim.setAttribute('fill','none');
  rim.setAttribute('stroke', lit ? '#e8845a' : '#5a2200');
  rim.setAttribute('stroke-width','4');
  rim.setAttribute('stroke-linecap','round');
  svg.appendChild(rim);

  // inner bowl depth
  const bowlInner = document.createElementNS(ns, 'ellipse');
  bowlInner.setAttribute('cx','80'); bowlInner.setAttribute('cy','118');
  bowlInner.setAttribute('rx','38'); bowlInner.setAttribute('ry','10');
  bowlInner.setAttribute('fill', lit ? '#8b2e0a' : '#2a0d00');
  svg.appendChild(bowlInner);

  // oil surface shimmer
  const oil = document.createElementNS(ns, 'ellipse');
  oil.setAttribute('cx','80'); oil.setAttribute('cy','118');
  oil.setAttribute('rx','28'); oil.setAttribute('ry','6');
  oil.setAttribute('fill', lit ? '#d4691e' : '#1e0900');
  oil.setAttribute('opacity','0.8');
  svg.appendChild(oil);

  // spout
  const spout = document.createElementNS(ns, 'path');
  spout.setAttribute('d','M108,118 Q128,112 134,106 Q130,116 132,118');
  spout.setAttribute('fill', lit ? '#b5451b' : '#3d1200');
  svg.appendChild(spout);

  // decorative dots on bowl
  [[42,136],[56,150],[80,158],[104,150],[118,136]].forEach(([cx,cy]) => {
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
    dot.setAttribute('r','2.5');
    dot.setAttribute('fill', lit ? '#e8845a' : '#5a2200');
    dot.setAttribute('opacity','0.7');
    svg.appendChild(dot);
  });

  // wick
  const wick = document.createElementNS(ns, 'path');
  wick.setAttribute('d','M80,118 Q82,108 80,96');
  wick.setAttribute('fill','none');
  wick.setAttribute('stroke', lit ? '#8b5e00' : '#2a1800');
  wick.setAttribute('stroke-width','2.5');
  wick.setAttribute('stroke-linecap','round');
  svg.appendChild(wick);

  // ── FLAME (only when lit) ──
  if (lit) {
    // outer flame
    const f1 = document.createElementNS(ns, 'ellipse');
    f1.setAttribute('cx','80'); f1.setAttribute('cy','72');
    f1.setAttribute('rx','18'); f1.setAttribute('ry','30');
    f1.setAttribute('fill','#f5a623');
    const a1 = document.createElementNS(ns, 'animateTransform');
    a1.setAttribute('attributeName','transform'); a1.setAttribute('type','scale');
    a1.setAttribute('values','1 1;1.12 0.9;0.9 1.1;1.05 0.95;1 1');
    a1.setAttribute('dur','1.2s'); a1.setAttribute('repeatCount','indefinite');
    a1.setAttribute('additive','sum');
    f1.appendChild(a1);
    svg.appendChild(f1);

    // mid flame
    const f2 = document.createElementNS(ns, 'ellipse');
    f2.setAttribute('cx','80'); f2.setAttribute('cy','76');
    f2.setAttribute('rx','11'); f2.setAttribute('ry','22');
    f2.setAttribute('fill','#ffb347');
    svg.appendChild(f2);

    // inner flame
    const f3 = document.createElementNS(ns, 'ellipse');
    f3.setAttribute('cx','80'); f3.setAttribute('cy','82');
    f3.setAttribute('rx','6'); f3.setAttribute('ry','14');
    f3.setAttribute('fill','#fff0a0');
    svg.appendChild(f3);

    // flame tip
    const f4 = document.createElementNS(ns, 'ellipse');
    f4.setAttribute('cx','80'); f4.setAttribute('cy','88');
    f4.setAttribute('rx','3'); f4.setAttribute('ry','7');
    f4.setAttribute('fill','#ffffff');
    f4.setAttribute('opacity','0.85');
    svg.appendChild(f4);

    // glow around flame
    const fg = document.createElementNS(ns, 'ellipse');
    fg.setAttribute('cx','80'); fg.setAttribute('cy','72');
    fg.setAttribute('rx','32'); fg.setAttribute('ry','40');
    fg.setAttribute('fill','#f5a623'); fg.setAttribute('opacity','0.12');
    const ag = document.createElementNS(ns, 'animate');
    ag.setAttribute('attributeName','opacity');
    ag.setAttribute('values','0.12;0.22;0.08;0.18;0.12');
    ag.setAttribute('dur','1.2s'); ag.setAttribute('repeatCount','indefinite');
    fg.appendChild(ag);
    svg.insertBefore(fg, f1); // behind flame
  }

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
  setDiyaLit(diyaLit);
  updateProgress();
}

document.getElementById('big-diya').addEventListener('click', () => {
  if (diyaLit) return;
  litCount = Math.min(litCount + 1, TOTAL);
  localStorage.setItem('diyaCount', litCount);
  localStorage.setItem('deviceLit', 'true');
  diyaLit = true;
  setDiyaLit(true);
  updateProgress();
  explode(innerWidth / 2, innerHeight * 0.6, 60);
  if (!animating) { animating = true; animateFw(); }
});

// ── Ambient Sparkles (permanent, full page) ─────────────────
function spawnAmbientSparkle() {
  const s = document.createElement('div');
  const size = 2 + Math.random() * 4;
  const colors = ['#ffd700','#f5a623','#ff6b6b','#fff8e1','#ffb347','#e91e8c','#54a0ff','#00d2d3'];
  const x = Math.random() * window.innerWidth;
  const y = Math.random() * window.innerHeight;
  Object.assign(s.style, {
    position: 'fixed',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '5',
    width: size + 'px',
    height: size + 'px',
    background: colors[Math.floor(Math.random() * colors.length)],
    left: x + 'px',
    top: y + 'px',
    opacity: '0',
    boxShadow: `0 0 ${size * 2}px currentColor`,
    transition: 'opacity 0.4s ease',
  });
  document.body.appendChild(s);
  requestAnimationFrame(() => s.style.opacity = (0.5 + Math.random() * 0.5).toString());
  setTimeout(() => {
    s.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    s.style.opacity = '0';
    s.style.transform = `translate(${(Math.random()-0.5)*30}px, ${-20-Math.random()*30}px) scale(0)`;
    setTimeout(() => s.remove(), 650);
  }, 400 + Math.random() * 600);
}

setInterval(spawnAmbientSparkle, isMobile ? 120 : 60);

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
