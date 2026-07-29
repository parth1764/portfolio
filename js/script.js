// ===== Force fresh page loads to start at the top =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
if (!window.location.hash) {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

// ===== Navbar scroll state + scroll progress bar =====
const navbar = document.getElementById('navbar');
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = pct + '%';
});

// ===== Mobile menu =====
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('mobile-open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('mobile-open');
  });
});

// ===== Cursor glow (desktop only) =====
const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(hover: hover)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
  });
}

// ===== Typed text effect =====
const typedText = document.getElementById('typedText');
const phrases = [
  'Data Science & AI/ML Engineer',
  'RAG Architecture Builder',
  'Computer Vision Engineer',
  'FastAPI Backend Developer'
];
let phraseIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
  const current = phrases[phraseIndex];
  if (!deleting) {
    charIndex++;
    typedText.textContent = current.slice(0, charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIndex--;
    typedText.textContent = current.slice(0, charIndex);
    if (charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  revealObserver.observe(el);
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section[id], header[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--text)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Neural Network / MLP Background =====
(function () {
  const canvas = document.getElementById('neuralNetworkBg');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const colors = ['124,92,255', '0,229,255', '179,75,255', '255,47,146'];
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let width, height, dpr;
  let layers = [];
  let pulses = [];
  let lastSpawn = 0;
  let running = true;

  function buildNetwork() {
    layers = [];
    const numLayers = Math.max(4, Math.min(9, Math.round(width / 190)));
    const padY = height * 0.14;
    for (let i = 0; i < numLayers; i++) {
      const t = numLayers === 1 ? 0 : i / (numLayers - 1);
      const bulge = Math.sin(t * Math.PI);
      const count = Math.round(rand(3, 4) + bulge * rand(3, 5));
      const x = (width / numLayers) * (i + 0.5);
      const nodes = [];
      for (let n = 0; n < count; n++) {
        const y = count === 1 ? height / 2 : padY + ((height - padY * 2) / (count - 1)) * n;
        nodes.push({
          x, y: y + rand(-14, 14),
          r: rand(2.2, 3.6),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.6, 1.4),
          color: pick(colors)
        });
      }
      layers.push(nodes);
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildNetwork();
  }

  function spawnPulse() {
    if (layers.length < 2) return;
    const li = Math.floor(rand(0, layers.length - 1));
    const from = pick(layers[li]);
    const to = pick(layers[li + 1]);
    pulses.push({ from, to, t: 0, speed: rand(0.006, 0.016), color: pick(colors) });
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

    // connections — batched into a single path for performance
    ctx.strokeStyle = 'rgba(124,92,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < layers.length - 1; i++) {
      const a = layers[i], b = layers[i + 1];
      for (const n1 of a) {
        for (const n2 of b) {
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
        }
      }
    }
    ctx.stroke();

    // nodes
    const t = now * 0.001;
    for (const layer of layers) {
      for (const node of layer) {
        const pulse = 0.55 + Math.sin(t * node.speed + node.phase) * 0.35;
        const radius = node.r * (0.85 + pulse * 0.3);

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 6);
        glow.addColorStop(0, `rgba(${node.color},${0.35 * pulse})`);
        glow.addColorStop(1, `rgba(${node.color},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${node.color},${0.6 + pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // signal pulses travelling forward through the network
    for (const p of pulses) {
      p.t += p.speed;
      const x = p.from.x + (p.to.x - p.from.x) * p.t;
      const y = p.from.y + (p.to.y - p.from.y) * p.t;
      const fade = Math.sin(Math.min(p.t, 1) * Math.PI);

      ctx.strokeStyle = `rgba(${p.color},${0.35 * fade})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(p.from.x, p.from.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = `rgba(${p.color},${0.9 * fade})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    pulses = pulses.filter(p => p.t < 1);

    if (now - lastSpawn > 220) {
      spawnPulse();
      lastSpawn = now;
    }

    if (running && !reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  document.addEventListener('visibilitychange', () => {
    const wasHidden = !running;
    running = !document.hidden;
    if (running && wasHidden && !reduceMotion) requestAnimationFrame(draw);
  });

  if (reduceMotion) {
    draw(0);
  } else {
    requestAnimationFrame(draw);
  }
})();

// ===== Tilt effect on cards (desktop only) =====
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.project-card, .skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -6;
      const rotateY = ((x / rect.width) - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
