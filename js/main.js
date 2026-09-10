/* ═══════════════════════════════════════════════════════
   Spark — interactions
   ═══════════════════════════════════════════════════════ */

/* Minimal 24×24 line icons, one per theme. Stroke-based so they
   inherit colour and stay crisp at any size. */
const ICONS = {
  listening: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4"/><path d="M19.5 4.5a10.5 10.5 0 0 1 0 15"/><path d="M7.8 16.2a6 6 0 0 1 0-8.4"/><path d="M4.5 19.5a10.5 10.5 0 0 1 0-15"/>',
  news:      '<path d="M4 5h11v14H5.5A1.5 1.5 0 0 1 4 17.5V5Z"/><path d="M15 8.5h3.5A1.5 1.5 0 0 1 20 10v7.5a1.5 1.5 0 0 1-1.5 1.5H15"/><path d="M7 8.5h5M7 11.5h5M7 14.5h5"/>',
  map:       '<path d="M12 21s6.5-5.4 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.6 12 21 12 21Z"/><circle cx="12" cy="10.3" r="2.4"/>',
  wellness:  '<path d="M12 20s-7-4.6-7-9.4A3.8 3.8 0 0 1 12 7.2a3.8 3.8 0 0 1 7 3.4C19 15.4 12 20 12 20Z"/>',
  home:      '<path d="M4 10.4 12 4l8 6.4V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.6Z"/><path d="M9.5 20v-5.8h5V20"/>',
  feedback:  '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-5 4V6Z"/><path d="M8 9h8M8 12.5h5"/>',
  gallery:   '<rect x="4" y="4.5" width="16" height="15" rx="1.6"/><path d="m6.5 16.2 3.6-4.1 2.5 2.9 2-2.4 3 3.6"/><circle cx="9" cy="8.8" r="1.2"/>',
};

/* ── Card content ─────────────────────────────────────
   Titles match the original section. Body copy here is
   placeholder — swap in your own wording.               */
const CARDS = [
  { icon: 'listening', title: 'Community listening',
    body:  'Give neighbourhoods, schools and local groups a softer, story-shaped way to say how a shared place actually feels.' },
  { icon: 'news', title: 'Newspaper voices',
    body:  'Work with local media to gather everyday voices and turn public emotion into short community snapshots.' },
  { icon: 'map', title: 'Multi-location map',
    body:  'Run Spark in several cities at once so people can compare the emotional weather of one place against another.' },
  { icon: 'wellness', title: 'Mental wellness',
    body:  'Make room for feelings that are hard to name, especially when a direct conversation is difficult to start.' },
  { icon: 'home', title: 'Home atmosphere',
    body:  'Imagine home systems that read emotional tone and answer with calmer light, sound and pace.' },
  { icon: 'feedback', title: 'Public feedback',
    body:  'Collect reflections from parks, galleries and campuses, then draw them into a living map of public experience.' },
  { icon: 'gallery', title: 'Gallery installations',
    body:  'Use Spark as an exhibition piece where each visitor leaves a story that shifts the mood of the room.' },
];

/* ── Build the carousel ───────────────────────────────── */
const track = document.getElementById('track');

track.innerHTML = CARDS.map((c, i) => `
  <article class="card reveal">
    <div class="card__top">
      <span class="card__num">${String(i + 1).padStart(2, '0')}</span>
      <span class="card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          ${ICONS[c.icon]}
        </svg>
      </span>
    </div>
    <div>
      <h3 class="card__title">${c.title}</h3>
      <p class="card__body">${c.body}</p>
    </div>
  </article>
`).join('');

/* ── Carousel navigation (index-based, snap-friendly) ── */
const arrows = [...document.querySelectorAll('.arrow')];
const cards  = [...track.querySelectorAll('.card')];
let index = 0;

const step = () => {
  const gap = parseFloat(getComputedStyle(track).gap) || 24;
  return cards[0].offsetWidth + gap;
};

/* How many whole cards fit — the last reachable index */
const maxIndex = () =>
  Math.max(0, cards.length - Math.max(1, Math.floor(track.clientWidth / step())));

const sync = () => {
  arrows[0].disabled = index <= 0;
  arrows[1].disabled = index >= maxIndex();
};

const goTo = (i) => {
  index = Math.min(Math.max(i, 0), maxIndex());
  track.scrollTo({ left: index * step(), behavior: 'smooth' });
  sync();
};

arrows.forEach(btn =>
  btn.addEventListener('click', () => goTo(index + Number(btn.dataset.dir)))
);

/* Keep index honest when the user scrolls or drags the track directly */
let idle;
track.addEventListener('scroll', () => {
  clearTimeout(idle);
  idle = setTimeout(() => {
    index = Math.round(track.scrollLeft / step());
    sync();
  }, 120);
}, { passive: true });

window.addEventListener('resize', () => { index = 0; track.scrollLeft = 0; sync(); });
sync();

/* Drag to pan (pointer devices) */
let down = false, startX = 0, startScroll = 0;
track.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch') return;   // let native touch scrolling win
  down = true;
  startX = e.clientX;
  startScroll = track.scrollLeft;
  track.style.scrollSnapType = 'none';
  track.setPointerCapture(e.pointerId);
});
track.addEventListener('pointermove', e => {
  if (!down) return;
  track.scrollLeft = startScroll - (e.clientX - startX);
});
const endDrag = () => {
  if (!down) return;
  down = false;
  track.style.scrollSnapType = '';
};
track.addEventListener('pointerup', endDrag);
track.addEventListener('pointercancel', endDrag);

/* ── Scroll reveal ────────────────────────────────────── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Stagger cards as the row comes into view */
document.querySelectorAll('.card').forEach((card, i) => {
  card.style.transitionDelay = `${Math.min(i, 4) * 70}ms`;
});

/* ── Nav: solidify once past the hero ─────────────────── */
const nav = document.getElementById('nav');
const hero = document.querySelector('.hero');

new IntersectionObserver(([e]) => {
  nav.style.background = e.isIntersecting ? 'var(--nav-bg)' : 'rgba(255,253,246,.92)';
}, { rootMargin: '-72px 0px 0px 0px' }).observe(hero);

/* ── Smooth in-page links ─────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Map embed gate ───────────────────────────────────
   The embedded Mapbox map captures wheel events, which
   would hijack page scrolling. Keep a cover over it until
   the visitor deliberately clicks in.                    */
const mapGate = document.querySelector('.mapGate');

if (mapGate) {
  mapGate.addEventListener('click', () => {
    mapGate.classList.add('is-off');
    /* drop it from the tree once the fade finishes */
    setTimeout(() => { mapGate.hidden = true; }, 400);
  });
}
