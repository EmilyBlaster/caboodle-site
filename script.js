/* ==========================================================================
   caboodle design — site behaviors
   - sticky nav state
   - scroll-driven field log (the "one weird move")
   - reveal-on-scroll typography
   ========================================================================== */

/* ---------- View transition: always start at top ----------------------
   Cross-document view transitions inherit scroll position from the outgoing
   page. pagereveal fires after the snapshot is placed — scroll before any
   paint so there's no visible jump. Falls back to DOMContentLoaded timing. */
document.addEventListener('pagereveal', () => {
  if (!location.hash) window.scrollTo(0, 0);
});
if (!location.hash) window.scrollTo(0, 0);

(() => {
  const nav = document.querySelector('.nav');
  const fieldlog = document.querySelector('.fieldlog');
  const logEntries = document.getElementById('logEntries');
  const logTime = document.getElementById('logTime');

  /* ---------- Nav scroll state ----------------------------------------- */
  const setNavState = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  setNavState();

  /* ---------- Field log: time ticker ----------------------------------- */
  const updateTime = () => {
    if (!logTime) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    logTime.textContent = `${hh}:${mm}:${ss}`;
  };
  updateTime();
  setInterval(updateTime, 1000);

  /* The field log stays hidden until the user has scrolled past the hero —
     keeps the landing view clean and makes the log feel "contextual" (it
     shows up once you're inside the page, like a researcher starting to
     take notes). */
  const hero = document.querySelector('.hero, .casehero, .apphero, .aboutpage, .labshero, .notehero, .reshero');

  /* Cache the hero bottom position relative to the document so scroll
     handler never triggers a layout read (getBoundingClientRect forces reflow). */
  let heroBottom = 500;
  const measureHero = () => {
    heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 500;
  };
  measureHero();
  window.addEventListener('resize', measureHero, { passive: true });

  const showAfterScroll = () => {
    if (fieldlog) fieldlog.classList.toggle('is-live', window.scrollY > heroBottom - 80);
  };
  showAfterScroll();

  /* Throttle both scroll handlers through a single rAF gate so they never
     run more than once per frame, eliminating scroll jank. */
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      setNavState();
      showAfterScroll();
      rafPending = false;
    });
  }, { passive: true });

  /* Dock (hide) the field log when the footer enters the viewport so it
     doesn't cover the footer nav. */
  const footer = document.querySelector('.foot');
  if (footer) {
    const footerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (fieldlog) fieldlog.classList.toggle('is-docked', entry.isIntersecting);
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });
    footerObserver.observe(footer);
  }

  /* ---------- Scroll-driven field log entries --------------------------
     Each section with data-log gets registered as an observation point.
     As it enters the viewport center, we log it and mark it active.
     Keeps the last 4 entries visible so it feels like a running journal. */

  const logSources = document.querySelectorAll('[data-log]');
  const MAX_LOG = 4;
  const logHistory = [
    { id: '000', text: 'visitor enters field' }
  ];

  const renderLog = () => {
    if (!logEntries) return;
    logEntries.innerHTML = logHistory
      .slice(-MAX_LOG)
      .map((entry, i, arr) => {
        const active = i === arr.length - 1 ? ' is-active' : '';
        return `<li class="fieldlog__entry${active}"><span>${entry.id}</span> ${entry.text}</li>`;
      })
      .join('');
  };
  renderLog();

  const seenLogs = new Set();
  const logObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const raw = entry.target.getAttribute('data-log');
      if (!raw || seenLogs.has(raw)) return;
      seenLogs.add(raw);

      /* "003 — subject reads pillar 01" → { id: '003', text: 'subject reads pillar 01' } */
      const [id, ...rest] = raw.split('—');
      logHistory.push({
        id: (id || '').trim().padStart(3, '0'),
        text: rest.join('—').trim() || raw.trim()
      });
      renderLog();
    });
  }, {
    rootMargin: '-35% 0px -45% 0px',  /* fire when section nears viewport center */
    threshold: 0
  });

  logSources.forEach((el) => logObserver.observe(el));

  /* ---------- Reveal-on-scroll for key typographic elements ------------
     Add data-reveal to any element we want to fade-rise. */
  const reveals = [
    '.hero__stamp',
    '.hero__eyebrow',
    '.hero__headline',
    '.hero__lede',
    '.hero__scroll',
    '.trustband__inner',
    '.approach__kicker',
    '.approach__title',
    '.approach__dek',
    '.pillar__num',
    '.pillar__body',
    '.process__kicker',
    '.process__title',
    '.process__list > li',
    '.matrix__kicker',
    '.matrix__title',
    '.matrix__dek',
    '.matrix__row',
    '.matrix__closing',
    '.quote__kicker',
    '.quote__body',
    '.quote__attr',
    '.work__kicker',
    '.work__title',
    '.work__dek',
    '.featured',
    '.dossier',
    '.work__more',
    '.labs__kicker',
    '.labs__title',
    '.labs__dek',
    '.lab',
    '.about__portrait',
    '.about__kicker',
    '.about__h',
    '.about__p',
    '.about__stats',
    '.about__facts',
    '.about__speaking',
    '.closing__stamp',
    '.closing__kicker',
    '.closing__h',
    '.closing__p',
    '.closing__cta',
    /* Deep page selectors */
    '.casehero__back',
    '.casehero__stamp',
    '.casehero__client',
    '.casehero__h',
    '.casehero__lede',
    '.casehero__tags',
    '.caseblock__num',
    '.caseblock__body',
    '.designfiles__kicker',
    '.designfiles__h',
    '.designfiles__p',
    '.flag > li',
    '.results__kicker',
    '.results__h',
    '.results__grid > div',
    '.results__stack',
    '.notehero__stamp',
    '.notehero__kicker',
    '.notehero__h',
    '.notehero__lede',
    '.notehero__expect > li',
    '.notes__kicker',
    '.notes__title',
    '.note',
    '.subscribe__kicker',
    '.subscribe__h',
    '.subscribe__form',
    '.subscribe__note',
    '.reshero__stamp',
    '.reshero__kicker',
    '.reshero__h',
    '.reshero__lede',
    '.resource',
    /* GitLab project sections */
    '.glproject__num',
    '.glproject__label',
    '.glproject__sub',
    '.glspotlight__kicker',
    '.glspotlight__h',
    '.glspotlight__p',
    '.glspotlight__cta',
    '.glspotlight__window',
    '.glpdf__kicker',
    '.glpdf__h',
    '.glpdf__doc'
  ];
  document.querySelectorAll(reveals.join(',')).forEach((el) => {
    el.setAttribute('data-reveal', '');
  });

  /* Stagger children of the same parent for a gentler cascade */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = Array.from(el.parentElement.querySelectorAll(':scope > [data-reveal]'));
      const delay = Math.min(siblings.indexOf(el), 4) * 80;
      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('is-in');
      revealObserver.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

  document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------- Respect reduced motion ----------------------------------- */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.classList.add('is-in');
      el.style.transitionDelay = '0ms';
    });
  }

  /* ---------- Design files carousel (shared component) ----------------- */
  document.querySelectorAll('.dfcarousel').forEach((root) => {
    const track = root.querySelector('.dfcarousel__track');
    const prev = root.querySelector('[data-df-prev]');
    const next = root.querySelector('[data-df-next]');
    const dots = root.querySelector('[data-df-dots]');
    const counter = root.querySelector('[data-df-counter]');
    const caption = root.querySelector('[data-df-caption]');
    if (!track) return;

    const slides = Array.from(track.children);
    const total = slides.length;
    if (!total) return;

    let idx = 0;

    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dfcarousel__dot' + (i === 0 ? ' is-active' : '');
      btn.setAttribute('aria-label', `Slide ${i + 1} of ${total}`);
      btn.addEventListener('click', () => go(i));
      dots && dots.appendChild(btn);
    });

    function go(n) {
      idx = (n + total) % total;
      track.style.transform = `translateX(-${idx * 100}%)`;
      if (dots) Array.from(dots.children).forEach((d, i) => d.classList.toggle('is-active', i === idx));
      const s = slides[idx];
      const pad = String(idx + 1).padStart(2, '0');
      const tot = String(total).padStart(2, '0');
      if (counter) counter.innerHTML = `<em>${pad}</em> / ${tot}`;
      if (caption) caption.innerHTML = `<span>${s.dataset.label || ''}</span><b>${s.dataset.title || ''}</b>${s.dataset.desc ? ' — ' + s.dataset.desc : ''}`;
    }

    prev && prev.addEventListener('click', () => go(idx - 1));
    next && next.addEventListener('click', () => go(idx + 1));

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });

    go(0);
  });

  /* ---------- Hover-prefetch internal links ---------------------------- */
  /* When the user hovers a same-origin link, warm the browser cache so the
     next page is already downloaded by the time they click. Pairs with the
     CSS @view-transition rule for a genuinely seamless feel. */
  const prefetched = new Set();
  const prefetch = (href) => {
    if (!href || prefetched.has(href)) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url.href;
      link.as = 'document';
      document.head.appendChild(link);
      prefetched.add(href);
    } catch { /* ignore malformed hrefs */ }
  };
  document.querySelectorAll('a[href]').forEach((a) => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:')) return;
    if (a.target === '_blank') return;
    const trigger = () => prefetch(h);
    a.addEventListener('pointerenter', trigger, { once: true, passive: true });
    a.addEventListener('focus', trigger, { once: true });
  });
})();
