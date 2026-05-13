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
  const SCROLL_START = 950;  /* px — skip hero/intro, land at interactives */
  const SCROLL_SPEED = 0.4;  /* px per animation frame (gentle)            */
  const IFRAME_W     = 1440; /* design width to scale from                 */
  const VISIBLE_H    = 300;  /* visible viewport height in px              */
  const PAUSE_START  = 1400; /* ms — show landing zone before scrolling    */
  const FADE_MS      = 380;  /* ms — loop crossfade                        */

  /* Skip entirely on screens where preview is hidden anyway */
  if (window.matchMedia('(max-width: 800px)').matches) return;

  document.querySelectorAll('.dossier--withpreview').forEach((card) => {
    const vp    = card.querySelector('.dossier__preview-viewport');
    const frame = card.querySelector('.dossier__preview-iframe');
    if (!frame || !vp) return;

    let scrollY  = SCROLL_START;
    let raf      = null;
    let srcSet   = false;
    let isPaused = true;
    let onScreen = false;

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
          scrollY = SCROLL_START;
          try { frame.contentWindow.scrollTo(0, SCROLL_START); } catch {}
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

    /* ── Load: jump to artifacts zone, fade in, begin scroll ────────── */
    frame.addEventListener('load', () => {
      scaleFrame();
      scrollY = SCROLL_START;
      try { frame.contentWindow.scrollTo(0, SCROLL_START); } catch {}
      requestAnimationFrame(() => frame.classList.add('is-visible'));
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
