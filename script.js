const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky nav — toggle scrolled class after the user moves past the masthead;
// no section is "active" while the masthead is on screen
window.addEventListener('scroll', () => {
  document.body.classList.toggle('scrolled', window.scrollY > 60);
  if (window.scrollY < window.innerHeight * 0.5) {
    document.querySelectorAll('.nav-links a.active').forEach(l => l.classList.remove('active'));
  }
}, { passive: true });

// Scroll-in reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.animate-in').forEach(el => revealObserver.observe(el));

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-30% 0px -65% 0px' });
sections.forEach(s => navObserver.observe(s));

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const syncThemeLabel = () => {
  const light = document.documentElement.getAttribute('data-theme') === 'light';
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
};
syncThemeLabel();
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('vt-theme', next); } catch (e) {}
  syncThemeLabel();
});

// Hamburger
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinksEl.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
const closeMenu = () => {
  hamburger.classList.remove('open');
  navLinksEl.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
};
navLinksEl.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinksEl.classList.contains('open')) { closeMenu(); hamburger.focus(); }
});

// Count-up
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
const countEls = document.querySelectorAll('.metric-value[data-count]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; countObserver.unobserve(el); return; }
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(easeOutCubic(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
countEls.forEach(el => countObserver.observe(el));

// Background video — play whichever are on screen
const bgVideos = document.querySelectorAll('.hero-bg, .band-bg');
if (reduceMotion) {
  // Posters only — no moving footage for people who asked for less motion
  bgVideos.forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
} else if (bgVideos.length) {
  const rateFor = (v) => v.classList.contains('hero-bg') ? 0.5 : 1;
  const setPlay = (v, on) => {
    v.muted = true;
    v.playbackRate = rateFor(v);
    if (on) { const p = v.play(); if (p) p.catch(() => {}); }
    else { v.pause(); }
  };
  bgVideos.forEach(v => {
    const r = rateFor(v);
    v.playbackRate = r;
    v.addEventListener('loadedmetadata', () => { v.playbackRate = r; });
    v.addEventListener('play', () => { v.playbackRate = r; });
  });
  const vObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => setPlay(e.target, e.isIntersecting));
  }, { threshold: 0.05 });
  bgVideos.forEach(v => vObserver.observe(v));
}

// Hero date stamp — Roman numeral year, set on load
(function setDate() {
  const el = document.getElementById('todayDate');
  if (!el) return;
  const year = new Date().getFullYear();
  const toRoman = (n) => {
    const map = [['M',1000],['CM',900],['D',500],['CD',400],['C',100],['XC',90],['L',50],['XL',40],['X',10],['IX',9],['V',5],['IV',4],['I',1]];
    let out = '';
    for (const [s, v] of map) { while (n >= v) { out += s; n -= v; } }
    return out;
  };
  el.textContent = toRoman(year);
  const copy = document.getElementById('copyYear');
  if (copy) copy.textContent = year;
})();
