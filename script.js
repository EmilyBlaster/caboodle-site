/* ==========================================================================
   caboodle design — site behaviors
   - sticky nav state
   - scroll-driven field log (the "one weird move")
   - reveal-on-scroll typography
   ========================================================================== */

/* ---------- View transition: always start at top ----------------------
   history.scrollRestoration = 'manual' stops the browser from trying to
   restore the previous page's scroll position on navigation.
   pagereveal fires right before the entry animation — scroll to top there.
   The immediate scrollTo is a belt-and-suspenders fallback for browsers
   that support view transitions but not pagereveal. */
history.scrollRestoration = 'manual';
document.addEventListener('pagereveal', () => {
  if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });
});
if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' });

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

  /* ---------- Mobile nav toggle ----------------------------------------
     Inject a hamburger button so the existing HTML doesn't have to change.
     The button toggles `is-open` on the nav, which CSS uses to slide the
     links panel into view. Closes on link click, Escape, or resize past
     the mobile breakpoint. */
  if (nav && !nav.querySelector('.nav__toggle')) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav__toggle';
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span>';
    nav.appendChild(toggle);

    const linksPanel = nav.querySelector('.nav__links');
    if (linksPanel && !linksPanel.id) linksPanel.id = 'nav-links';
    if (linksPanel) toggle.setAttribute('aria-controls', linksPanel.id);

    const closeNav = () => {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-lock');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    };
    const openNav = () => {
      nav.classList.add('is-open');
      document.body.classList.add('nav-lock');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    if (linksPanel) {
      linksPanel.addEventListener('click', (e) => {
        if (e.target.closest('a')) closeNav();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && nav.classList.contains('is-open')) closeNav();
    }, { passive: true });
  }

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

/* ==========================================================================
   PER-CARD CASE STUDY PREVIEWS
   Each dossier card has its own mini browser window showing that specific
   case study page auto-scrolling. Iframes are lazy-loaded via
   IntersectionObserver — only fetched when the card enters the viewport.
   ========================================================================== */
(function () {
  const SCROLL_SPEED  = 0.4;  /* px per animation frame (gentle)            */
  const IFRAME_W      = 1440; /* design width to scale from                 */
  const VISIBLE_H     = 300;  /* visible viewport height in px              */
  const PAUSE_START   = 1400; /* ms — show landing zone before scrolling    */
  const FADE_MS       = 380;  /* ms — loop crossfade                        */
  const FALLBACK_START = 2000; /* px fallback if no artifact section found  */

  /* Query the iframe DOM to find where the actual artifact demos start.
     Checks several selectors used across different case study pages. */
  function findArtifactOffset (iframeDoc) {
    const target = iframeDoc.querySelector(
      '.demolinks, .designfiles, .glproject, .caseshowcase, [data-log*="interactive"]'
    );
    if (!target) return FALLBACK_START;
    /* Walk offsetParent chain to get absolute Y from top of document */
    let top = 0;
    let el  = target;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    /* Land 80px above the section so the heading is visible in context */
    return Math.max(top - 80, 0);
  }

  /* Skip entirely on screens where preview is hidden anyway */
  if (window.matchMedia('(max-width: 800px)').matches) return;

  document.querySelectorAll('.dossier--withpreview').forEach((card) => {
    const vp    = card.querySelector('.dossier__preview-viewport');
    const frame = card.querySelector('.dossier__preview-iframe');
    if (!frame || !vp) return;

    let scrollStart = FALLBACK_START; /* refined on load via DOM query */
    let scrollY     = FALLBACK_START;
    let raf         = null;
    let srcSet      = false;
    let isPaused    = true;
    let onScreen    = false;

    /* ── Scale iframe to fill the preview column ────────────────────── */
    function scaleFrame () {
      const w     = vp.offsetWidth;
      const scale = w / IFRAME_W;
      const h     = Math.ceil(VISIBLE_H / scale);
      frame.style.width     = IFRAME_W + 'px';
      frame.style.height    = h + 'px';
      frame.style.transform = `scale(${scale})`;
    }
    scaleFrame();
    window.addEventListener('resize', scaleFrame, { passive: true });

    /* ── Scroll tick ─────────────────────────────────────────────────── */
    function tick () {
      raf = null;
      if (isPaused || !onScreen) return;

      scrollY += SCROLL_SPEED;

      let maxScroll = 4500;
      try {
        const doc = frame.contentDocument;
        if (doc && doc.documentElement) {
          maxScroll = doc.documentElement.scrollHeight - parseFloat(frame.style.height);
        }
      } catch { /* cross-origin guard */ }

      if (scrollY >= Math.max(maxScroll, 400)) {
        /* Bottom reached — fade out, reset to start, fade in, repeat */
        isPaused = true;
        frame.classList.remove('is-visible');
        setTimeout(() => {
          scrollY = scrollStart;
          try { frame.contentWindow.scrollTo(0, scrollStart); } catch {}
          requestAnimationFrame(() => frame.classList.add('is-visible'));
          setTimeout(() => {
            isPaused = false;
            if (onScreen) startScroll();
          }, PAUSE_START);
        }, FADE_MS);
        return;
      }

      try { frame.contentWindow.scrollTo(0, scrollY); } catch {}
      raf = requestAnimationFrame(tick);
    }

    function startScroll () {
      if (!isPaused && onScreen && !raf) raf = requestAnimationFrame(tick);
    }

    /* ── Load: find artifacts in DOM, jump there, fade in, begin scroll  */
    frame.addEventListener('load', () => {
      scaleFrame();
      /* Query the iframe's own DOM to find where the demos actually start */
      try {
        scrollStart = findArtifactOffset(frame.contentDocument);
      } catch { scrollStart = FALLBACK_START; }
      scrollY = scrollStart;
      try { frame.contentWindow.scrollTo(0, scrollStart); } catch {}
      /* Double rAF: let the browser paint the scroll position BEFORE the
         iframe becomes visible — prevents the visible jump to middle */
      requestAnimationFrame(() => requestAnimationFrame(() => {
        frame.classList.add('is-visible');
      }));
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
        if (onScreen) startScroll();
      }, PAUSE_START);
    });

    /* ── IntersectionObserver: lazy-load src + pause when off-screen ── */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        onScreen = e.isIntersecting;
        if (onScreen) {
          /* Set src the first time the card comes into view */
          if (!srcSet) {
            srcSet = true;
            frame.src = frame.dataset.src;
          }
          if (!isPaused) startScroll();
        } else {
          cancelAnimationFrame(raf);
          raf = null;
        }
      });
    }, { threshold: 0.1 });

    io.observe(card);

    /* ── Reduced motion: show page statically, no scrolling ─────────── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame.addEventListener('load', () => {
        frame.classList.add('is-visible');
      }, { once: true });
    }
  });
})();

/* ==========================================================================
   WORK PEEK — live-scrolling case study preview
   Loads each case study page in an iframe and slowly scrolls it, giving
   visitors a genuine look inside the case files from the homepage.
   Same-origin pages, so JS can control contentWindow.scrollTo().
   ========================================================================== */
(function () {
  const frame    = document.getElementById('peekFrame');
  const urlLabel = document.getElementById('peekUrl');
  const navEl    = document.getElementById('peekNav');
  const viewport = document.querySelector('.peek__viewport');
  const wrapper  = document.getElementById('workPeek');

  if (!frame || !viewport || !wrapper) return;

  /* Case studies to cycle through */
  const PAGES = [
    { src: 'work/gitlab.html',  url: 'caboodledesign.info/work/gitlab.html'  },
    { src: 'work/apple.html',   url: 'caboodledesign.info/work/apple.html'   },
    { src: 'work/intuit.html',  url: 'caboodledesign.info/work/intuit.html'  },
    { src: 'work/tmobile.html', url: 'caboodledesign.info/work/tmobile.html' },
    { src: 'work/trust20.html', url: 'caboodledesign.info/work/trust20.html' },
  ];

  /* Tuning knobs */
  const SCROLL_SPEED    = 0.55;  /* px per animation frame                     */
  const SCROLL_START    = 950;   /* px — skip hero/intro, land at interactives  */
  const PAUSE_ON_LOAD   = 1600;  /* ms to show top of landing zone              */
  const PAUSE_AT_BOTTOM = 2200;  /* ms to show bottom before cycling            */
  const FADE_DURATION   = 380;   /* ms for opacity crossfade                    */
  const VISIBLE_H       = 480;   /* px of iframe shown                          */
  const IFRAME_W        = 1440;  /* design width to scale from                  */

  let current   = 0;
  let scrollY   = 0;
  let raf       = null;
  let isSwitching  = false;
  let isHovered    = false;
  let isOnScreen   = false;

  /* ── Build nav dots ───────────────────────────────────────────────────── */
  PAGES.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'peek__dot' + (i === 0 ? ' is-active' : '');
    btn.setAttribute('aria-label', `Preview case study ${i + 1} of ${PAGES.length}`);
    btn.addEventListener('click', () => { if (i !== current) switchTo(i); });
    navEl.appendChild(btn);
  });

  function setActiveDot (n) {
    navEl.querySelectorAll('.peek__dot').forEach((d, i) =>
      d.classList.toggle('is-active', i === n));
  }

  /* ── Scale the iframe to fill the viewport width exactly ─────────────── */
  /* The pages are 1440px wide. We scale down to fit the container,
     then set the iframe height so its post-scale height matches VISIBLE_H. */
  function scaleFrame () {
    const containerW = viewport.offsetWidth;
    const scale      = containerW / IFRAME_W;
    const iframeH    = Math.ceil(VISIBLE_H / scale);

    frame.style.width     = IFRAME_W + 'px';
    frame.style.height    = iframeH + 'px';
    frame.style.transform = `scale(${scale})`;
  }

  scaleFrame();
  window.addEventListener('resize', scaleFrame, { passive: true });

  /* ── rAF scroll tick ──────────────────────────────────────────────────── */
  function tick () {
    raf = null;
    if (isSwitching || isHovered || !isOnScreen) return;

    scrollY += SCROLL_SPEED;

    /* Calculate how far we can scroll before the page ends */
    let maxScroll = 4000; /* safe fallback */
    try {
      const doc = frame.contentDocument;
      if (doc && doc.documentElement) {
        const iframeH = parseFloat(frame.style.height) || (VISIBLE_H / (viewport.offsetWidth / IFRAME_W));
        maxScroll = doc.documentElement.scrollHeight - iframeH;
      }
    } catch { /* cross-origin guard — shouldn't fire on same domain */ }

    if (scrollY >= Math.max(maxScroll, 200)) {
      /* Hit the bottom — pause, then cycle to next page */
      isSwitching = true;
      setTimeout(() => switchTo((current + 1) % PAGES.length), PAUSE_AT_BOTTOM);
      return;
    }

    try {
      frame.contentWindow.scrollTo(0, scrollY);
    } catch { /* safety */ }

    raf = requestAnimationFrame(tick);
  }

  function startScroll () {
    if (!isSwitching && !isHovered && isOnScreen && !raf) {
      raf = requestAnimationFrame(tick);
    }
  }

  /* ── Page switching ───────────────────────────────────────────────────── */
  function switchTo (index) {
    cancelAnimationFrame(raf);
    raf         = null;
    isSwitching = true;

    /* Fade out */
    frame.classList.remove('is-visible');

    setTimeout(() => {
      current = index;
      scrollY = 0;

      /* Update URL bar and dots before src swap */
      urlLabel.textContent = PAGES[current].url;
      setActiveDot(current);

      scrollY = SCROLL_START;
      frame.src = PAGES[current].src;
      /* load event handles the jump + fade-in + scroll start */
    }, FADE_DURATION);
  }

  /* ── iframe load: jump to interactives zone, fade in, then start scrolling */
  frame.addEventListener('load', () => {
    scaleFrame();

    /* Skip the hero/intro and land at the artifacts section */
    scrollY = SCROLL_START;
    try { frame.contentWindow.scrollTo(0, SCROLL_START); } catch { /* */ }

    /* Small rAF delay to let the browser paint the new page */
    requestAnimationFrame(() => {
      frame.classList.add('is-visible');
    });

    /* Pause at top, then unlock and begin scrolling */
    isSwitching = true;
    setTimeout(() => {
      isSwitching = false;
      startScroll();
    }, PAUSE_ON_LOAD);
  });

  /* ── Hover: freeze while the user is looking ──────────────────────────── */
  wrapper.addEventListener('mouseenter', () => {
    isHovered = true;
    cancelAnimationFrame(raf);
    raf = null;
  });
  wrapper.addEventListener('mouseleave', () => {
    isHovered = false;
    startScroll();
  });

  /* ── IntersectionObserver: only animate while visible on screen ────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      isOnScreen = e.isIntersecting;
      if (isOnScreen) {
        startScroll();
      } else {
        cancelAnimationFrame(raf);
        raf = null;
      }
    });
  }, { threshold: 0.1 });
  io.observe(wrapper);

  /* ── Reduced motion: show first page statically, no scroll ───────────── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame.addEventListener('load', () => {
      frame.classList.add('is-visible');
    }, { once: true });
    return; /* skip all scroll logic */
  }
})();

/* ==========================================================================
   LABS STAGE — hover-to-switch live preview
   One shared large preview window above the labs grid.
   Hover any .lab[data-lab-src] card → stage crossfades to that experiment.
   Scroll starts at the .lab-s section (the experiment content) on every page,
   not the top. Loops back to that offset instead of page-top.
   ========================================================================== */
(function labsStage() {
  'use strict';

  const stage    = document.querySelector('.labs-stage');
  if (!stage) return;

  const viewport  = stage.querySelector('.labs-stage__viewport');
  const iframe    = stage.querySelector('.labs-stage__iframe');
  const labelEl   = stage.querySelector('.labs-stage__label');
  const urlEl     = stage.querySelector('.labs-stage__url');
  const labs      = Array.from(document.querySelectorAll('.lab[data-lab-src]'));
  if (!labs.length) return;

  const SCROLL_SPEED  = 0.35;  // px per rAF tick
  const PAUSE_INIT    = 1400;  // ms before first scroll
  const SWITCH_PAUSE  = 900;   // ms pause after switching

  let raf         = null;
  let scrollY     = 0;
  let scrollStart = 0;   // offset of .lab-s section — looping resets here
  let isPaused    = false;
  let onScreen    = false;
  let currentSrc  = '';
  let nextPause   = PAUSE_INIT; // PAUSE_INIT on first load, SWITCH_PAUSE after
  let switchTimer = null;       // debounce rapid hover events

  /* Find where the experiment section begins in the lab page (.lab-s) */
  function findLabsOffset(iframeDoc) {
    const target = iframeDoc.querySelector('.lab-s');
    if (!target) return Math.floor(iframeDoc.documentElement.scrollHeight * 0.25);
    let top = 0, el = target;
    while (el) { top += el.offsetTop; el = el.offsetParent; }
    return Math.max(top - 80, 0);
  }

  /* Scale iframe to fill container width at 1440px design width */
  function scaleFrame() {
    const scale = viewport.offsetWidth / 1440;
    iframe.style.transform = `scale(${scale})`;
    iframe.style.width     = '1440px';
    iframe.style.height    = Math.ceil(viewport.offsetHeight / scale) + 'px';
  }

  function startScroll() {
    if (raf) return;
    (function tick() {
      if (!isPaused) {
        scrollY += SCROLL_SPEED;
        try {
          const doc = iframe.contentDocument;
          const max = doc.documentElement.scrollHeight - doc.documentElement.clientHeight;
          if (scrollY >= max - 20) { scrollY = scrollStart; } /* loop to experiment, not page top */
          iframe.contentWindow.scrollTo(0, scrollY);
        } catch (_) {}
      }
      raf = requestAnimationFrame(tick);
    })();
  }

  function stopScroll() {
    cancelAnimationFrame(raf);
    raf = null;
  }

  /* Shared onload handler — runs after every iframe src change */
  function onLoaded() {
    scaleFrame();
    try {
      scrollStart = findLabsOffset(iframe.contentDocument);
    } catch (_) {
      scrollStart = 400;
    }
    scrollY = scrollStart;
    try { iframe.contentWindow.scrollTo(0, scrollStart); } catch (_) {}
    isPaused = true;
    const delay = nextPause;
    nextPause = SWITCH_PAUSE; /* subsequent loads use shorter pause */
    /* Double rAF: let the browser paint the scroll position BEFORE the
       iframe fades back in — prevents the visible jump-to-top on load */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        iframe.classList.remove('is-switching');
        viewport.classList.add('is-loaded');
        setTimeout(function () {
          isPaused = false;
          if (onScreen) startScroll();
        }, delay);
      });
    });
  }

  function switchTo(src, name) {
    if (src === currentSrc) return;
    currentSrc = src;

    labelEl.textContent = name;
    urlEl.textContent   = src;

    /* Highlight the active card — gives real-time feedback that hover = preview */
    labs.forEach(function (l) { l.classList.remove('is-active'); });
    var activeLab = labs.find(function (l) { return l.dataset.labSrc === src; });
    if (activeLab) activeLab.classList.add('is-active');

    stopScroll();
    iframe.classList.add('is-switching');

    /* Cancel any previously queued switch before queuing a new one.
       Without this, rapid hover events stack timeouts and race each other. */
    clearTimeout(switchTimer);
    switchTimer = setTimeout(function () {
      iframe.onload = onLoaded;
      iframe.src = src;
    }, 320); /* wait for fade-out transition */
  }

  /* ── Reduced-motion: static switch only ── */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    iframe.onload = function () { scaleFrame(); viewport.classList.add('is-loaded'); };
    iframe.src = labs[0].dataset.labSrc;
    currentSrc = labs[0].dataset.labSrc;
    labs[0].classList.add('is-active');
    labs.forEach(function (lab) {
      lab.addEventListener('mouseenter', function () {
        stage.classList.add('has-hovered');
        if (lab.dataset.labSrc !== currentSrc) {
          currentSrc          = lab.dataset.labSrc;
          labelEl.textContent = lab.dataset.labName;
          urlEl.textContent   = lab.dataset.labSrc;
          labs.forEach(function (l) { l.classList.remove('is-active'); });
          lab.classList.add('is-active');
          iframe.onload = function () { scaleFrame(); };
          iframe.src = lab.dataset.labSrc;
        }
      });
    });
    return;
  }

  /* ── Init ── */
  scaleFrame();
  window.addEventListener('resize', scaleFrame);

  currentSrc          = labs[0].dataset.labSrc;
  labelEl.textContent = labs[0].dataset.labName;
  urlEl.textContent   = labs[0].dataset.labSrc;
  labs[0].classList.add('is-active'); /* first card is active on init */
  iframe.onload       = onLoaded;
  iframe.src          = currentSrc;

  /* ── Hover: switch lab ── */
  labs.forEach(function (lab) {
    lab.addEventListener('mouseenter', function () {
      stage.classList.add('has-hovered');
      switchTo(lab.dataset.labSrc, lab.dataset.labName);
    });
  });

  /* ── IntersectionObserver: pause when off-screen ── */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      onScreen = e.isIntersecting;
      if (onScreen && !isPaused) startScroll();
      else if (!onScreen) stopScroll();
    });
  }, { threshold: 0.1 });
  io.observe(stage);
})();

/* ==========================================================================
   FIELD GUIDE BOT
   Rule-based chip-navigation widget. No backend — all responses live here.
   Visitors click quick-reply chips to browse, or type to trigger keyword
   matching. Matches the field log aesthetic: mono, lime, dark chrome.
   ========================================================================== */
(function fieldGuide() {
  'use strict';

  const trigger  = document.getElementById('guideTrigger');
  const panel    = document.getElementById('guidePanel');
  const msgList  = document.getElementById('guideMessages');
  const chipZone = document.getElementById('guideChips');
  const inputEl  = document.getElementById('guideInput');
  const sendBtn  = document.getElementById('guideSend');
  const closeBtn = document.getElementById('guideClose');

  if (!trigger || !panel) return;

  let isOpen  = false;
  let greeted = false;

  /* ── Response graph ──────────────────────────────────────────────────────
     Each node has: msg (HTML string), chips (array of { label, next }).
     'next' is another key in NODES. '← back' chips loop back up the tree.
     ─────────────────────────────────────────────────────────────────────── */
  const NODES = {

    start: {
      msg: 'field guide online — ask me anything about emily or caboodle design.',
      chips: [
        { label: 'emily\'s background', next: 'background' },
        { label: 'clients + work',      next: 'clients'    },
        { label: 'methodology',         next: 'method'     },
        { label: 'services',            next: 'services'   },
        { label: 'contact + hire',      next: 'contact'    },
      ]
    },

    /* ── Background branch ── */
    background: {
      msg: 'emily green is the founder of caboodle design — a learning design consultancy for fortune 500 companies. she works where instructional design, behavioral science, media production, and UX intersect. ai is a field tool for that work, not a shortcut. <a class="guide-link" href="about.html">read more →</a>',
      chips: [
        { label: 'her approach',   next: 'approach'   },
        { label: 'where based?',   next: 'location'   },
        { label: 'tools + stack',  next: 'tools'      },
        { label: '← main menu',   next: 'start'      },
      ]
    },

    approach: {
      msg: 'emily approaches learning design anthropologically — studying how humans actually change, not how training assumes they should. her POV: behavior change over checkbox training. the thinking is the job.',
      chips: [
        { label: 'action mapping',    next: 'actionmap'    },
        { label: 'kirkpatrick model', next: 'kirkpatrick'  },
        { label: '← back',           next: 'background'   },
      ]
    },

    actionmap: {
      msg: 'action mapping starts with measurable business goals, identifies the behaviors that drive those goals, then designs practice before content. developed by cathy moore — emily applies it as a core diagnostic: if a behavior gap isn\'t causing the problem, training isn\'t the answer.',
      chips: [
        { label: 'kirkpatrick model', next: 'kirkpatrick'  },
        { label: 'see the work',      next: 'clients'      },
        { label: '← back',           next: 'method'       },
      ]
    },

    kirkpatrick: {
      msg: 'the kirkpatrick model evaluates training at four levels: reaction, learning, behavior, results. most L&D stops at 1 and 2. emily designs to levels 3 and 4 — actual on-the-job behavior change and documented business outcomes.',
      chips: [
        { label: 'action mapping',  next: 'actionmap' },
        { label: '← back',         next: 'method'    },
      ]
    },

    location: {
      msg: 'grand rapids, michigan — but emily works with clients globally. apple, airbnb, gitlab, and others are all remote engagements.',
      chips: [
        { label: '← back', next: 'background' }
      ]
    },

    tools: {
      msg: 'articulate rise + storyline for e-learning, figma for UX and design, adobe creative suite, three.js for 3D interactive training, remotion for branded video components, and claude code for AI-assisted prototyping. vibe coding is a legitimate field tool.',
      chips: [
        { label: '← back', next: 'background' }
      ]
    },

    /* ── Methodology branch ── */
    method: {
      msg: 'emily\'s core frameworks are action mapping and the kirkpatrick model. applied anthropologically: she studies what\'s actually causing the behavior gap before designing anything.',
      chips: [
        { label: 'action mapping',    next: 'actionmap'    },
        { label: 'kirkpatrick model', next: 'kirkpatrick'  },
        { label: '← main menu',      next: 'start'        },
      ]
    },

    /* ── Clients branch ── */
    clients: {
      msg: 'emily\'s clients include apple, airbnb, gitlab, johnson & johnson, t-mobile, and intuit. each engagement is scoped to measurable behavior change, not checkbox completion. <a class="guide-link" href="work.html">see the case files →</a>',
      chips: [
        { label: 'kind of work', next: 'worktype'  },
        { label: 'results',      next: 'results'   },
        { label: '← main menu', next: 'start'     },
      ]
    },

    worktype: {
      msg: 'learning programs, scenario-based courses, interactive simulations, AI-powered training tools, curriculum frameworks, microlearning systems, manager development programs, and instructional media production.',
      chips: [
        { label: 'results',   next: 'results'  },
        { label: '← back',   next: 'clients'  },
      ]
    },

    results: {
      msg: 'emily designs for measurable outcomes: reduced onboarding time, improved manager conversation quality, faster skill transfer, documented behavior change. case studies show specifics where clients permit. <a class="guide-link" href="work.html">read case files →</a>',
      chips: [
        { label: '← back', next: 'clients' }
      ]
    },

    /* ── Services branch ── */
    services: {
      msg: 'caboodle design offers: learning strategy and curriculum architecture, behavioral science-informed program design, media production (video, 3D, interactive), UX and graphic design for L&D, AI-assisted content tools and systems.',
      chips: [
        { label: 'workshops?',    next: 'workshops' },
        { label: 'the process',   next: 'process'   },
        { label: 'contact emily', next: 'contact'   },
        { label: '← main menu',  next: 'start'     },
      ]
    },

    workshops: {
      msg: 'yes — emily facilitates learning strategy workshops, action mapping diagnostic sessions, and curriculum design sprints. typically half-day to two-day engagements with L&D or HR leadership teams.',
      chips: [
        { label: 'the process',   next: 'process'  },
        { label: 'contact emily', next: 'contact'  },
        { label: '← back',       next: 'services' },
      ]
    },

    process: {
      msg: 'typically: a discovery conversation scoped to your outcomes → a proposal → design and build. emily works as an embedded partner, not an order-taker. the diagnosis is part of the deliverable.',
      chips: [
        { label: 'contact emily', next: 'contact'  },
        { label: '← back',       next: 'services' },
      ]
    },

    /* ── Contact branch ── */
    contact: {
      msg: 'emily is open to new projects. reach her at <a class="guide-link" href="mailto:egreen@emilygreendesign.com">egreen@emilygreendesign.com</a> or visit the about page for more context on her background and approach. <a class="guide-link" href="about.html">about emily →</a>',
      chips: [
        { label: '← main menu', next: 'start' }
      ]
    },
  };

  /* ── Keyword fallback: map typed terms to nodes ──────────────────────────
     Checked in order — first match wins.
     ─────────────────────────────────────────────────────────────────────── */
  const KEYWORDS = [
    { terms: ['action map', 'cathy moore'],                                        node: 'actionmap'    },
    { terms: ['kirkpatrick', 'level 3', 'level 4', 'evaluation'],                  node: 'kirkpatrick'  },
    { terms: ['workshop', 'sprint', 'facilit'],                                    node: 'workshops'    },
    { terms: ['process', 'how work', 'engagement', 'scope', 'proposal'],           node: 'process'      },
    { terms: ['result', 'outcome', 'measur', 'roi', 'impact', 'data'],             node: 'results'      },
    { terms: ['tool', 'stack', 'software', 'articulate', 'figma', 'remotion'],     node: 'tools'        },
    { terms: ['location', 'based', 'where', 'grand rapids', 'michigan', 'remote'], node: 'location'     },
    { terms: ['apple', 'airbnb', 'gitlab', 'intuit', 't-mobile', 'johnson'],       node: 'clients'      },
    { terms: ['client', 'fortune', 'portfolio', 'case', 'work'],                   node: 'clients'      },
    { terms: ['approach', 'philosophy', 'method', 'framework', 'behavior'],        node: 'method'       },
    { terms: ['service', 'offer', 'deliverable', 'what do'],                       node: 'services'     },
    { terms: ['contact', 'hire', 'email', 'reach', 'available', 'project'],        node: 'contact'      },
    { terms: ['who', 'emily', 'founder', 'background', 'about'],                   node: 'background'   },
  ];

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  function addMsg(html, role) {
    const div = document.createElement('div');
    div.className = 'guide-msg guide-msg--' + role;
    div.innerHTML = html;
    msgList.appendChild(div);
    msgList.scrollTop = msgList.scrollHeight;
  }

  function renderChips(chipList) {
    chipZone.innerHTML = '';
    (chipList || []).forEach(function (chip) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guide-chip';
      btn.textContent = chip.label;
      btn.addEventListener('click', function () { goTo(chip.next); });
      chipZone.appendChild(btn);
    });
  }

  function goTo(nodeId) {
    const node = NODES[nodeId] || NODES.start;
    addMsg(node.msg, 'bot');
    renderChips(node.chips);
  }

  function handleInput() {
    const raw = inputEl.value.trim();
    if (!raw) return;
    addMsg(raw, 'user');
    inputEl.value = '';
    const lower = raw.toLowerCase();

    /* Scan keyword map — first match wins */
    let matched = null;
    for (let i = 0; i < KEYWORDS.length; i++) {
      const kw = KEYWORDS[i];
      for (let j = 0; j < kw.terms.length; j++) {
        if (lower.includes(kw.terms[j])) { matched = kw.node; break; }
      }
      if (matched) break;
    }

    setTimeout(function () {
      if (matched) {
        goTo(matched);
      } else {
        addMsg('i don\'t have a specific answer for that — here\'s what i know best:', 'bot');
        renderChips(NODES.start.chips);
      }
    }, 280);
  }

  /* ── Open / close ────────────────────────────────────────────────────────── */
  function openGuide() {
    isOpen = true;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.add('is-open');
    if (!greeted) {
      greeted = true;
      /* Slight delay so panel animation finishes before first message pops in */
      setTimeout(function () { goTo('start'); }, 180);
    }
    inputEl.focus();
  }

  function closeGuide() {
    isOpen = false;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.classList.remove('is-open');
  }

  /* ── Wire up events ──────────────────────────────────────────────────────── */
  trigger.addEventListener('click', function () { isOpen ? closeGuide() : openGuide(); });
  closeBtn.addEventListener('click', closeGuide);
  sendBtn.addEventListener('click', handleInput);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleInput();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) closeGuide();
  });
})();
