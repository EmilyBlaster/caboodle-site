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

  /* ---------- Nav scroll state, throttled through a single rAF gate ----- */
  let rafPending = false;
  window.addEventListener('scroll', () => {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      setNavState();
      rafPending = false;
    });
  }, { passive: true });

  /* ---------- Reveal-on-scroll for key typographic elements ------------
     Add data-reveal to any element we want to fade-rise. */
  /* Note: the hero (stamp, eyebrow, headline, lede, scroll cue) and the
     trust band are deliberately NOT in this list. They sit above the fold,
     where the scroll-reveal can't animate them (it hides then reveals in
     the same frame, so no transition runs). They get a real on-load
     keyframe entrance in CSS (.hero entrance) instead. */
  const reveals = [
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
    '.workclose__line',
    '.workclose__actions',
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
  const SCROLL_SPEED   = 0.4;   /* px per animation frame (gentle)           */
  const IFRAME_W       = 1440;  /* design width to scale from                */
  const VISIBLE_H      = 300;   /* visible viewport height in px             */
  const PAUSE_START    = 700;   /* ms — show landing zone before scrolling   */
  const FADE_MS        = 380;   /* ms — loop crossfade                       */
  const FALLBACK_START = 2000;  /* px fallback if no artifact section found  */

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

  /* On phones we render the iframe at the card's own width so the embedded
     page shows its native MOBILE layout at full scale (set in scaleFrame). */
  const isPhone = () => window.matchMedia('(max-width: 700px)').matches;

  document.querySelectorAll('.dossier--withpreview').forEach((card) => {
    const vp    = card.querySelector('.dossier__preview-viewport');
    const frame = card.querySelector('.dossier__preview-iframe');
    if (!frame || !vp) return;

    let scrollStart = FALLBACK_START; /* refined on load via DOM query        */
    let scrollY     = FALLBACK_START;
    let pageH       = 6000;           /* updated on load to actual page height */
    let raf         = null;
    let srcSet      = false;
    let isPaused    = true;
    let onScreen    = false;

    /* ── Scale iframe and position via transform (no scrollTo) ──────────── */
    /* We control the visible position with translateY instead of scrollTo,
       avoiding scroll-behavior:smooth interference from the iframe's own CSS. */
    /* Cards flagged data-preview-desktop (media/embed-heavy pages whose
       layout breaks at a phone ratio) always render at the 1440 design width
       and scale down, even on phones — so their embeds stay in the layout
       they were built for instead of distorting. */
    const forceDesktop = card.hasAttribute('data-preview-desktop');
    /* Phone → render at the card width (scale 1, native mobile layout).
       Larger (or forceDesktop) → render at 1440 and scale it down. */
    function frameWidth () {
      return (isPhone() && !forceDesktop) ? Math.round(vp.offsetWidth) : IFRAME_W;
    }
    function scaleFrame () {
      const iw    = frameWidth();
      const scale = vp.offsetWidth / iw;
      frame.style.width           = iw + 'px';
      frame.style.height          = pageH + 'px';
      frame.style.transformOrigin = '0 0';
      frame.style.transform       = `scale(${scale}) translateY(${-scrollY}px)`;
    }
    scaleFrame();
    window.addEventListener('resize', scaleFrame, { passive: true });

    /* ── Scroll tick ─────────────────────────────────────────────────────── */
    function tick () {
      raf = null;
      if (isPaused || !onScreen) return;

      scrollY += SCROLL_SPEED;

      /* Stop when the bottom of the visible window reaches the page bottom */
      const scale     = vp.offsetWidth / frameWidth();
      const maxScroll = Math.max(pageH - vp.offsetHeight / scale, 400);

      if (scrollY >= maxScroll) {
        /* Bottom reached — fade out, reset to start, fade in, repeat */
        isPaused = true;
        frame.classList.remove('is-visible');
        setTimeout(() => {
          scrollY = scrollStart;
          scaleFrame();  /* reposition instantly via transform */
          requestAnimationFrame(() => frame.classList.add('is-visible'));
          setTimeout(() => {
            isPaused = false;
            if (onScreen) startScroll();
          }, PAUSE_START);
        }, FADE_MS);
        return;
      }

      /* Move via transform — no scrollTo, no scroll-behavior interference */
      frame.style.transform = `scale(${scale}) translateY(${-scrollY}px)`;
      raf = requestAnimationFrame(tick);
    }

    function startScroll () {
      if (!isPaused && onScreen && !raf) raf = requestAnimationFrame(tick);
    }

    /* ── Load: find artifacts in DOM, position via transform, fade in ──── */
    frame.addEventListener('load', () => {
      /* Skip load events from `about:blank` (fired when we unload the
         iframe below). Without this guard the empty document would trigger
         a useless layout pass + start the scroll loop on a blank frame. */
      if (!srcSet) return;
      /* Measure full page height. Shrink the iframe first so its own height
         doesn't inflate the page's reported scrollHeight. */
      try {
        /* Render at the FINAL width before measuring, so the page height and
           the artifact offset match the layout the user actually sees. On
           phones the width (and therefore the offset) differs a lot from the
           1440 design width, so measuring at the wrong width starts the
           preview in the wrong place. */
        frame.style.width  = frameWidth() + 'px';
        frame.style.height = '100px';
        pageH       = frame.contentDocument.documentElement.scrollHeight || 6000;
        scrollStart = findArtifactOffset(frame.contentDocument);
      } catch {
        pageH       = 6000;
        scrollStart = FALLBACK_START;
      }
      /* On phones the visible window is short, so start deeper in the body —
         otherwise it opens on the text at the top of a section. Native-mobile
         cards land best ~38% down; desktop-rendered cards (forceDesktop, e.g.
         People's Professors) already land perfectly, so leave those alone. */
      if (isPhone()) {
        const override = parseFloat(card.dataset.previewStart);
        if (!Number.isNaN(override)) {
          /* Per-card hard start, as a fraction of page height (e.g. T-Mobile,
             tuned to land on its carousel visual rather than the intro text). */
          scrollStart = Math.round(pageH * override);
        } else {
          const floor = forceDesktop ? 0.20 : 0.38;
          scrollStart = Math.max(scrollStart, Math.round(pageH * floor));
        }
      }
      /* Set position instantly via CSS transform — no scrollTo needed */
      scrollY = scrollStart;
      scaleFrame();
      /* Single rAF is enough — transform applies synchronously */
      requestAnimationFrame(() => frame.classList.add('is-visible'));
      isPaused = true;
      setTimeout(() => {
        isPaused = false;
        if (onScreen) startScroll();
      }, PAUSE_START);
    });

    /* ── IntersectionObserver: lazy-load src + unload off-screen ──────────
       rootMargin gives a hysteresis zone — load when the card is within
       ~one screen of the viewport, only unload when it's that far past.
       Without unloading, six full case-study pages stay alive in memory
       and Chrome crashes the tab (renderer OOM, error code 5). */
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        onScreen = e.isIntersecting;
        if (onScreen) {
          if (!srcSet) {
            srcSet = true;
            frame.src = frame.dataset.src;
          }
          if (!isPaused) startScroll();
        } else {
          cancelAnimationFrame(raf);
          raf = null;
          /* Off-screen: unload the iframe to free memory. It will reload
             from dataset.src when the card re-enters the load zone. */
          if (srcSet) {
            srcSet = false;
            isPaused = true;
            frame.classList.remove('is-visible');
            frame.src = 'about:blank';
          }
        }
      });
    }, { threshold: 0.01, rootMargin: '600px 0px 600px 0px' });

    io.observe(card);

    /* ── BFCache restore (Safari) ─────────────────────────────────────
       When Safari restores this page from its back/forward cache, JS
       state is preserved but iframes are unloaded. The observer doesn't
       fire again (cards are still "intersecting" from its POV) so the
       previews stay blank until manual refresh. Detect the BFCache
       restore via pageshow.persisted and force a fresh iframe load. */
    window.addEventListener('pageshow', (e) => {
      if (!e.persisted || !onScreen) return;
      frame.classList.remove('is-visible');
      isPaused = true;
      cancelAnimationFrame(raf);
      raf = null;
      srcSet = false;
      frame.src = 'about:blank';
      setTimeout(() => {
        srcSet = true;
        frame.src = frame.dataset.src;
      }, 50);
    });

    /* ── Reduced motion: show page statically, no scrolling ─────────── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      frame.addEventListener('load', () => {
        frame.classList.add('is-visible');
      }, { once: true });
    }
  });
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

  /* Phones use a different layout entirely: the stage is hidden (CSS) and the
     bold cards carry the section. Skip all the iframe/hover/scroll machinery
     so we never load a preview the user can't see. */
  if (window.matchMedia('(max-width: 680px)').matches) return;

  const SCROLL_SPEED  = 0.35;  // px per rAF tick
  const PAUSE_INIT    = 1400;  // ms before first scroll
  const SWITCH_PAUSE  = 900;   // ms pause after switching

  let raf         = null;
  let scrollY     = 0;
  let scrollStart = 0;   // offset of .lab-s section — looping resets here
  let pageH       = 6000; // updated on load to actual lab-page height
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

  /* Scale the iframe small + position via the iframe's own scrollTo.
     The transform-translateY approach we used before required iframe height
     to be the FULL lab-page height (5–8k px), which had the browser hold
     the entire page in memory and crash Chrome on hover-switches. Here the
     iframe is just large enough to show the viewport; the iframe's
     internal scroll positions which slice of the page is visible.
     We defeat scroll-behavior:smooth (which would animate a visible
     fast-scroll on first load) by setting inline scrollBehavior:auto on
     the iframe's <html> before each scrollTo, and using behavior:'instant'
     on the call itself. Inline style + explicit instant = no animation. */
  /* Phone → render at the stage width (scale 1, native mobile layout).
     Larger → render at the 1440 design width and scale down. */
  function frameW() {
    return window.matchMedia('(max-width: 680px)').matches
      ? Math.round(viewport.offsetWidth)
      : 1440;
  }
  function scaleFrame() {
    const iw    = frameW();
    const scale = viewport.offsetWidth / iw;
    iframe.style.width           = iw + 'px';
    iframe.style.height          = Math.ceil(viewport.offsetHeight / scale) + 'px';
    iframe.style.transformOrigin = '0 0';
    iframe.style.transform       = `scale(${scale})`;
    try {
      iframe.contentDocument.documentElement.style.scrollBehavior = 'auto';
      iframe.contentWindow.scrollTo({ top: scrollY, behavior: 'instant' });
    } catch (_) { /* cross-origin or pre-load — safe to ignore */ }
  }

  function startScroll() {
    if (raf) return;
    (function tick() {
      if (!isPaused) {
        scrollY += SCROLL_SPEED;
        const scale     = viewport.offsetWidth / frameW();
        const maxScroll = Math.max(pageH - viewport.offsetHeight / scale, 200);
        if (scrollY >= maxScroll) { scrollY = scrollStart; } /* loop to experiment, not page top */
        try { iframe.contentWindow.scrollTo(0, scrollY); } catch (_) {}
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
    /* Skip about:blank reloads triggered by the unload-on-off-screen path
       below — the empty doc has no content to measure or position. */
    if (!iframe.src || iframe.src === 'about:blank' || iframe.src.endsWith('/about:blank')) return;
    try {
      /* Defeat scroll-behavior:smooth in the lab page's own CSS so every
         scrollTo below jumps instantly. Inline style beats external CSS. */
      iframe.contentDocument.documentElement.style.scrollBehavior = 'auto';
      /* Measure at the FINAL render width so the offset matches what the user
         sees (phones use a much narrower width than the 1440 design width). */
      iframe.style.width  = frameW() + 'px';
      iframe.style.height = '100px'; /* shrink for accurate scrollHeight read */
      pageH       = iframe.contentDocument.documentElement.scrollHeight || 6000;
      scrollStart = findLabsOffset(iframe.contentDocument);
    } catch (_) {
      pageH       = 6000;
      scrollStart = 400;
    }
    /* On phones, never start near the very top — keep it in the experiment. */
    if (window.matchMedia('(max-width: 680px)').matches) {
      scrollStart = Math.max(scrollStart, Math.round(pageH * 0.20));
    }
    /* scaleFrame restores iframe to a small height and scrolls instantly */
    scrollY = scrollStart;
    scaleFrame();
    isPaused = true;
    const delay = nextPause;
    nextPause = SWITCH_PAUSE; /* subsequent loads use shorter pause */
    /* Single rAF — the transform applies synchronously, so the iframe is
       already at the experiment section before it fades back in. */
    requestAnimationFrame(function () {
      iframe.classList.remove('is-switching');
      viewport.classList.add('is-loaded');
      setTimeout(function () {
        isPaused = false;
        if (onScreen) startScroll();
      }, delay);
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
    /* Place the iframe at the experiment section via transform — static,
       no scroll animation, but still landing on the meat of the page. */
    const staticPlace = function () {
      try {
        iframe.style.height = '100px'; /* shrink so it doesn't inflate the reading */
        pageH   = iframe.contentDocument.documentElement.scrollHeight || 6000;
        scrollY = findLabsOffset(iframe.contentDocument);
      } catch (_) {
        pageH   = 6000;
        scrollY = 400;
      }
      scaleFrame();
    };
    iframe.onload = function () { staticPlace(); viewport.classList.add('is-loaded'); };
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
          iframe.onload = function () { staticPlace(); };
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

  /* ── IntersectionObserver: pause + unload when off-screen ──────────────
     Lab pages are heavy (full HTML + their own script.js running inside).
     When the user scrolls past the labs section we drop the iframe to free
     memory, then restore it on the way back. rootMargin gives a hysteresis
     zone so it doesn't flicker on small scroll moves. */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      onScreen = e.isIntersecting;
      if (onScreen) {
        if (!iframe.src || iframe.src === 'about:blank' || iframe.src.endsWith('/about:blank')) {
          iframe.onload = onLoaded;
          nextPause    = PAUSE_INIT;
          iframe.src   = currentSrc;
        }
        if (!isPaused) startScroll();
      } else {
        stopScroll();
        if (iframe.src && iframe.src !== 'about:blank' && !iframe.src.endsWith('/about:blank')) {
          viewport.classList.remove('is-loaded');
          iframe.src = 'about:blank';
        }
      }
    });
  }, { threshold: 0.01, rootMargin: '600px 0px 600px 0px' });
  io.observe(stage);

  /* ── BFCache restore (Safari) ─────────────────────────────────────────
     Same issue as the dossier previews. Safari restores the labs page
     from cache with the iframe unloaded. The observer doesn't fire
     because the stage is still "intersecting" from its POV. Force a
     fresh load on pageshow.persisted. */
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted || !onScreen) return;
    stopScroll();
    viewport.classList.remove('is-loaded');
    iframe.src = 'about:blank';
    setTimeout(function () {
      iframe.onload = onLoaded;
      nextPause    = PAUSE_INIT;
      iframe.src   = currentSrc;
    }, 50);
  });
})();

/* ==========================================================================
   FIELD GUIDE BOT
   Rule-based chip-navigation widget. No backend — all responses live here.
   Visitors click quick-reply chips to browse, or type to trigger keyword
   matching. Matches the field log aesthetic: mono, lime, dark chrome.
   ========================================================================== */
(function fieldGuide() {
  'use strict';

  /* Skip inside preview iframes — the bot's chat panel is heavy DOM
     (380px wide, full styling, message rendering) and has no purpose
     inside a scaled-down non-interactive preview. */
  if (window.self !== window.top) return;

  /* Self-inject markup on any page that doesn't already have it.
     index.html has it hardcoded; every other page gets it from here. */
  if (!document.getElementById('guideTrigger')) {
    const wrap = document.createElement('div');
    wrap.className = 'guide-wrap';
    wrap.innerHTML =
      '<button class="guide-btn" id="guideTrigger" aria-label="Open field guide" aria-expanded="false" aria-controls="guidePanel">' +
        '<svg class="guide-btn__mark" width="22" height="15" viewBox="0 0 90 60" fill="currentColor" aria-hidden="true">' +
          '<path fill-rule="evenodd" d="M 5 30 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0 M 35 30 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0"/>' +
        '</svg>' +
        '<span>field guide</span>' +
      '</button>' +
      '<div class="guide-panel" id="guidePanel" aria-hidden="true" role="dialog" aria-label="Field guide — ask about emily green and caboodle design">' +
        '<div class="guide-panel__chrome">' +
          '<div class="guide-panel__status">' +
            '<span class="guide-panel__dot" aria-hidden="true"></span>' +
            'field guide · online' +
          '</div>' +
          '<button class="guide-panel__close" id="guideClose" aria-label="Close field guide">×</button>' +
        '</div>' +
        '<div class="guide-panel__msgs" id="guideMessages"></div>' +
        '<div class="guide-panel__chips" id="guideChips"></div>' +
        '<div class="guide-panel__input-row">' +
          '<input class="guide-panel__input" id="guideInput" type="text" placeholder="or type a question..." autocomplete="off" spellcheck="false"/>' +
          '<button class="guide-panel__send" id="guideSend" aria-label="Send">→</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
  }

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
      msg: 'field guide online. ask me anything — work stuff, methodology, or the important things like her coffee order.',
      chips: [
        { label: 'emily\'s background', next: 'background' },
        { label: 'clients + work',      next: 'clients'    },
        { label: 'methodology',         next: 'method'     },
        { label: 'services',            next: 'services'   },
        { label: 'contact + hire',      next: 'contact'    },
        { label: 'fun stuff',           next: 'fun'        },
      ]
    },

    /* ── Background branch ── */
    background: {
      msg: 'emily green is the founder of caboodle design. she designs learning that actually changes what people do — for apple, airbnb, gitlab, intuit, t-mobile, and j&j. behavioral science, instructional design, media production, and UX all in one place. ai is a field tool here, not a shortcut. <a class="guide-link" href="about.html">more about emily →</a>',
      chips: [
        { label: 'her approach',  next: 'approach'  },
        { label: 'where based?',  next: 'location'  },
        { label: 'tools + stack', next: 'tools'     },
        { label: '← main menu',  next: 'start'     },
      ]
    },

    approach: {
      msg: 'she treats learning design like anthropology — show up, study how things actually work, then design for how people actually change. not how training assumes they should. she\'s pretty allergic to training that exists just to say training happened.',
      chips: [
        { label: 'action mapping',    next: 'actionmap'   },
        { label: 'kirkpatrick model', next: 'kirkpatrick' },
        { label: '← back',           next: 'background'  },
      ]
    },

    actionmap: {
      msg: 'action mapping starts with the business goal, works backward to the behaviors driving it, then designs practice opportunities before content. cathy moore\'s framework. emily\'s version: if a knowledge gap isn\'t causing the problem, training isn\'t the answer. she\'ll say this in the first conversation.',
      chips: [
        { label: 'kirkpatrick model', next: 'kirkpatrick' },
        { label: 'see the work',      next: 'clients'     },
        { label: '← back',           next: 'method'      },
      ]
    },

    kirkpatrick: {
      msg: 'four levels: reaction, learning, behavior, results. most L&D stops at 1 and 2 — did people like it, did they pass the quiz. emily designs to 3 and 4 — did behavior actually change on the job? can you measure it? that\'s the real bar.',
      chips: [
        { label: 'action mapping', next: 'actionmap' },
        { label: '← back',        next: 'method'    },
      ]
    },

    location: {
      msg: 'grand rapids, michigan. but she works remotely with clients everywhere — apple, airbnb, gitlab are all remote engagements. the zip code doesn\'t limit the work.',
      chips: [
        { label: '← back', next: 'background' }
      ]
    },

    tools: {
      msg: 'articulate rise + storyline for e-learning, figma for design, adobe creative suite, three.js for 3D interactive training, remotion for branded video, claude code for AI prototyping. this site was built with claude code. she calls vibe coding a legitimate field tool and means it.',
      chips: [
        { label: '← back', next: 'background' }
      ]
    },

    /* ── Methodology branch ── */
    method: {
      msg: 'action mapping and kirkpatrick — applied anthropologically. she studies what\'s actually causing the behavior gap before designing anything. spoiler: it\'s usually not a content problem.',
      chips: [
        { label: 'action mapping',    next: 'actionmap'   },
        { label: 'kirkpatrick model', next: 'kirkpatrick' },
        { label: '← main menu',      next: 'start'       },
      ]
    },

    /* ── Clients branch ── */
    clients: {
      msg: 'apple, airbnb, gitlab, johnson & johnson, t-mobile, intuit. each engagement is scoped to actual behavior change — not "we need a course." she\'ll push back if the problem doesn\'t call for training. <a class="guide-link" href="work.html">see the case files →</a>',
      chips: [
        { label: 'kind of work', next: 'worktype' },
        { label: 'results',      next: 'results'  },
        { label: '← main menu', next: 'start'    },
      ]
    },

    worktype: {
      msg: 'learning programs, scenario-based courses, interactive simulations, AI-powered training tools, curriculum frameworks, microlearning systems, manager development programs, instructional media production. depends on what\'s actually causing the problem.',
      chips: [
        { label: 'results',  next: 'results' },
        { label: '← back',  next: 'clients' },
      ]
    },

    results: {
      msg: 'reduced onboarding time, better manager conversation quality, faster skill transfer, documented behavior change. she designs to kirkpatrick 3 and 4, so results you can actually point to. <a class="guide-link" href="work.html">read the case files →</a>',
      chips: [
        { label: '← back', next: 'clients' }
      ]
    },

    /* ── Services branch ── */
    services: {
      msg: 'learning strategy + curriculum architecture, behavioral science-informed program design, media production (video, 3D, interactive), UX and graphic design for L&D, AI-assisted content tools. she works as an embedded partner, not an order-taker.',
      chips: [
        { label: 'workshops?',    next: 'workshops' },
        { label: 'the process',   next: 'process'   },
        { label: 'contact emily', next: 'contact'   },
        { label: '← main menu',  next: 'start'     },
      ]
    },

    workshops: {
      msg: 'yes. learning strategy workshops, action mapping diagnostic sessions, curriculum design sprints. usually half-day to two-day with L&D or HR leadership. she\'s good in a room.',
      chips: [
        { label: 'the process',   next: 'process'  },
        { label: 'contact emily', next: 'contact'  },
        { label: '← back',       next: 'services' },
      ]
    },

    process: {
      msg: 'discovery conversation → proposal scoped to your actual outcomes → design and build. she\'s not going to quote you a course before she understands the problem. the diagnosis is part of the deliverable.',
      chips: [
        { label: 'contact emily', next: 'contact'  },
        { label: '← back',       next: 'services' },
      ]
    },

    /* ── Contact branch ── */
    contact: {
      msg: 'open to new projects. best way in: <a class="guide-link" href="mailto:hello@caboodledesign.info">hello@caboodledesign.info</a>. grand rapids-based, works globally. <a class="guide-link" href="about.html">about emily →</a>',
      chips: [
        { label: '← main menu', next: 'start' }
      ]
    },

    /* ── Fun stuff branch ── */
    fun: {
      msg: 'okay. the important stuff.',
      chips: [
        { label: 'favorite food?',       next: 'food'     },
        { label: 'coffee order?',        next: 'coffee'   },
        { label: 'if not L&D?',          next: 'alter'    },
        { label: 'industry hot take?',   next: 'hottake'  },
        { label: 'what to watch?',       next: 'watch'    },
        { label: 'best part of the job', next: 'loves'    },
        { label: '← main menu',         next: 'start'    },
      ]
    },

    food: {
      msg: 'nachos. no notes.',
      chips: [
        { label: 'coffee order?', next: 'coffee' },
        { label: '← fun stuff',  next: 'fun'    },
      ]
    },

    coffee: {
      msg: 'venti decaf cold brew, soy milk, 2 pumps sugar-free caramel. yes, the whole order. she will not apologize.',
      chips: [
        { label: 'favorite food?', next: 'food' },
        { label: '← fun stuff',   next: 'fun'  },
      ]
    },

    alter: {
      msg: 'reporter. she\'s basically doing that anyway — shows up, studies how things actually work, then translates it for the people who need to act on it. the job descriptions aren\'t that different.',
      chips: [
        { label: 'industry hot take?', next: 'hottake' },
        { label: '← fun stuff',       next: 'fun'     },
      ]
    },

    hottake: {
      msg: 'there aren\'t enough opportunities to learn by doing in corporate america. we keep building content when we should be building practice. the industry knows this. we still ship slide decks.',
      chips: [
        { label: 'what to watch?', next: 'watch' },
        { label: '← fun stuff',   next: 'fun'   },
      ]
    },

    watch: {
      msg: 'veep. completely unrelated to work. just go watch it.',
      chips: [
        { label: 'best part of the job', next: 'loves' },
        { label: '← fun stuff',         next: 'fun'   },
      ]
    },

    loves: {
      msg: 'empowering people. when the right training actually changes what someone can do — when a manager has a conversation they couldn\'t have before, or a new hire gets up to speed in half the time — that\'s the whole point.',
      chips: [
        { label: 'contact emily', next: 'contact' },
        { label: '← fun stuff',  next: 'fun'     },
      ]
    },
  };

  /* ── Keyword fallback: map typed terms to nodes ──────────────────────────
     Checked in order — first match wins.
     ─────────────────────────────────────────────────────────────────────── */
  const KEYWORDS = [
    /* Fun stuff — check first so "food" doesn't match "methodology" etc. */
    { terms: ['nacho', 'food', 'eat', 'favorite food', 'hungry'],                  node: 'food'         },
    { terms: ['coffee', 'drink', 'cold brew', 'caramel', 'starbucks', 'order'],    node: 'coffee'       },
    { terms: ['reporter', 'journalist', 'other career', 'if not', 'alternate'],    node: 'alter'        },
    { terms: ['hot take', 'opinion', 'controversial', 'unpopular'],                node: 'hottake'      },
    { terms: ['veep', 'watch', 'show', 'netflix', 'recommend', 'tv', 'binge'],     node: 'watch'        },
    { terms: ['love', 'favorite part', 'best part', 'empower', 'joy'],             node: 'loves'        },
    { terms: ['fun', 'personal', 'outside work', 'hobby', 'personality'],          node: 'fun'          },
    /* Work stuff */
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

/* ============================================================
   CURSOR HOVER GLOW — native cursor stays; a soft lime halo
   appears only over clickable elements and trails the pointer.
   The motion is functional (it marks what's interactive), so it
   adds personality without replacing or obscuring the cursor.
   ============================================================ */
(function cursorGlow() {
  /* Skip inside preview iframes — the iframe's pointer-events:none
     means mousemove never fires there anyway. */
  if (window.self !== window.top) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  /* Respect reduced-motion: no following glow for users who opt out.
     The native cursor is always present, so nothing is lost. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.getElementById('cursorGlow')) return;

  var glow = document.createElement('div');
  glow.id = 'cursorGlow';
  document.body.appendChild(glow);

  var x = -400, y = -400;   /* raw pointer */
  var gx = -400, gy = -400; /* eased glow position */
  var active = false;       /* over a clickable element? */
  var raf = false;
  var lastTarget = null;

  /* Treat anything the browser styles as clickable (cursor: pointer)
     as interactive. Auto-covers links, buttons, dossiers, the reveal
     chips, etc. without a brittle hand-maintained selector list. */
  function isInteractive(el) {
    var node = el;
    while (node && node.nodeType === 1 && node !== document.body) {
      if (getComputedStyle(node).cursor === 'pointer') return true;
      node = node.parentElement;
    }
    return false;
  }

  function place() {
    glow.style.transform =
      'translate(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px) translate(-50%, -50%)';
  }

  function tick() {
    /* Tight follow (0.5) so the glow reads as attached to the cursor,
       not chasing it. Snaps to exact position once it's within range
       and the rAF stops. */
    gx += (x - gx) * 0.5;
    gy += (y - gy) * 0.5;
    place();
    if (Math.abs(x - gx) > 0.3 || Math.abs(y - gy) > 0.3) {
      requestAnimationFrame(tick);
    } else {
      gx = x; gy = y;
      place();
      raf = false;
    }
  }

  document.addEventListener('mousemove', function (e) {
    x = e.clientX;
    y = e.clientY;
    /* Only recompute interactivity when the element under the
       pointer actually changes — keeps getComputedStyle off the
       per-pixel path. */
    if (e.target !== lastTarget) {
      lastTarget = e.target;
      var nowActive = isInteractive(e.target);
      if (nowActive !== active) {
        active = nowActive;
        if (active) {
          /* Snap to the cursor on activation so the glow appears AT
             the pointer and fades in cleanly — never swoops in from
             the corner (its last resting position). */
          gx = x; gy = y;
          place();
        }
        glow.classList.toggle('is-on', active);
      }
    }
    if (!raf) { raf = true; requestAnimationFrame(tick); }
  }, { passive: true });

  document.addEventListener('mousedown', function () {
    if (active) glow.classList.add('is-press');
  });
  document.addEventListener('mouseup', function () {
    glow.classList.remove('is-press');
  });
  document.addEventListener('mouseleave', function () {
    active = false;
    lastTarget = null;
    glow.classList.remove('is-on', 'is-press');
  });
})();

/* ============================================================
   MOBILE TAP RIPPLE — lime circle that expands + fades on touch
   Only runs on touch devices (desktop has the comet cursor).
   ============================================================ */
(function touchRipple() {
  /* Skip inside preview iframes — pointer-events:none on the iframe means
     touchstart never fires anyway; no point attaching the listener. */
  if (window.self !== window.top) return;
  /* Skip on mouse/trackpad devices — they get the comet */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.addEventListener('touchstart', function (e) {
    var touch  = e.touches[0];
    var ripple = document.createElement('div');
    ripple.className  = 'touch-ripple';
    ripple.style.left = touch.clientX + 'px';
    ripple.style.top  = touch.clientY + 'px';
    document.body.appendChild(ripple);
    /* Clean up after the animation finishes */
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 560);
  }, { passive: true });
})();

/* ==========================================================================
   STAT COUNTERS — animate big numbers from 0 to target on scroll-into-view
   Brand-coherent motion that fits the field-journal voice: numbers reading
   as measurements being recorded, not generic UI animation. One-shot per
   element via IntersectionObserver.
   ========================================================================== */
(function statCounters() {
  // Respect motion preferences — never animate for users who asked us not to
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Every element on the site that holds a big-display stat number.
  // Mostly <dd> elements inside results / about / facts grids, plus the
  // <span class="dossier__statnum"> blobs on the homepage dossier cards.
  const SELECTORS = [
    '.about__stats dd',
    '.aboutstats__grid dd',
    '.results__grid dd',
    '.dossier__statnum',
  ].join(',');

  const targets = document.querySelectorAll(SELECTORS);
  if (!targets.length) return;

  const DURATION = 1400;  /* ms total for the count-up        */
  const THRESHOLD = 0.4;  /* fraction of element in viewport  */

  /* Cubic ease-out: races to most of the value early, decelerates into
     the landing. Reads as a measurement settling rather than a uniform
     counter ticking up. */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  /* Read the direct text node of an element (ignoring child <span>, <i>
     etc. which usually hold the unit suffix like "%", "+", "x"). Returns
     { value, unit, textNode, originalText } or null if non-numeric. */
  function parse(el) {
    let textNode = null;
    let raw = '';
    for (const node of el.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE) continue;
      const t = node.textContent;
      if (!t || !t.trim()) continue;
      textNode = node;
      raw = t.trim();
      break;
    }
    if (!textNode) return null;

    /* Accept plain integers and K/M shorthand: "15", "95", "10K", "3M".
       Skip anything that doesn't start with digits ("behavior", "AI",
       "multi", "async-only" — the categorical word-stats). */
    const match = raw.match(/^(\d+)([KMB]?)/i);
    if (!match) return null;

    return {
      value: parseInt(match[1], 10),
      unit: (match[2] || '').toUpperCase(),
      textNode,
      originalText: raw,
    };
  }

  function animate(parsed) {
    const start = performance.now();
    let finished = false;

    function settle() {
      /* Snap to the exact original string so the DOM matches what shipped. */
      finished = true;
      parsed.textNode.textContent = parsed.originalText;
    }

    function tick(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = easeOut(t);
      const current = Math.round(parsed.value * eased);
      parsed.textNode.textContent = current + parsed.unit;

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        settle();
      }
    }

    /* Set to "0" immediately so the user sees the count-up begin
       from zero, not from the cached final value. */
    parsed.textNode.textContent = '0' + parsed.unit;
    requestAnimationFrame(tick);

    /* Safety net: if requestAnimationFrame is throttled (background tab) or
       otherwise never completes, force the real value rather than leaving the
       stat frozen at 0. Worst case the count-up is skipped, never stuck. */
    setTimeout(() => { if (!finished) settle(); }, DURATION + 800);
  }

  /* Fire each stat at most once. */
  const done = new WeakSet();
  function fire(el) {
    if (done.has(el)) return;
    const parsed = parse(el);
    if (!parsed) return;        /* categorical word-stats: leave as-is */
    done.add(el);
    animate(parsed);            /* animate() zeroes then counts up */
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);   /* one-shot */
      fire(entry.target);
    });
  }, { threshold: THRESHOLD });

  /* Observe every stat. We deliberately do NOT blank to 0 up front: if a stat
     somehow never fires, it must fall back to showing its real value, never a
     frozen 0. animate() zeroes the value itself the instant it starts. */
  targets.forEach((el) => observer.observe(el));

  /* Safety net. This deferred script runs while the dossier preview iframes
     are still loading and shifting the layout, which can leave the observer
     never firing for a stat that ends up on screen (e.g. the featured stat
     near the top of the work page) — it would sit blanked at 0 forever.
     Once the page has settled, force any on-screen stat that hasn't fired. */
  function sweep() {
    targets.forEach((el) => {
      if (done.has(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        observer.unobserve(el);
        fire(el);
      }
    });
  }
  if (document.readyState === 'complete') {
    setTimeout(sweep, 400);
  } else {
    window.addEventListener('load', () => setTimeout(sweep, 400));
  }
})();

/* ==========================================================================
   PROOF STRIP NAV — arrow buttons scroll the artifact rail (the scrollbar is
   hidden, so these are the desktop scroll affordance). Buttons disable at the
   start/end of the rail. Phones swipe, so the arrows are hidden there via CSS.
   ========================================================================== */
(function proofStripNav() {
  'use strict';
  const rail = document.querySelector('.proofstrip__rail');
  if (!rail) return;
  const arrows = Array.from(document.querySelectorAll('.proofstrip__arrow'));
  if (!arrows.length) return;

  /* One click moves ~1.5 tiles so it feels like browsing, not nudging. */
  function step() {
    const card = rail.querySelector('.proofcard');
    const w = card ? card.getBoundingClientRect().width : 320;
    return (w + 18) * 1.5;
  }

  /* Native scrollBy({behavior:'smooth'}) is a no-op on this rail (a scroll-snap
     quirk), so animate scrollLeft by hand — reliable and still smooth. */
  function smoothBy(delta) {
    const start = rail.scrollLeft;
    const target = Math.max(0, Math.min(rail.scrollWidth - rail.clientWidth, start + delta));
    const t0 = performance.now(), dur = 420;
    let done = false;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const t = Math.min((now - t0) / dur, 1);
      rail.scrollLeft = start + (target - start) * ease(t);
      if (t < 1) requestAnimationFrame(tick); else done = true;
    }
    requestAnimationFrame(tick);
    /* Fail-safe: if rAF is throttled and never progresses, jump to target so
       the arrow always works. */
    setTimeout(() => { if (!done) rail.scrollLeft = target; }, 600);
  }
  arrows.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.proofDir) || 1;
      smoothBy(dir * step());
    });
  });

  function update() {
    const max = rail.scrollWidth - rail.clientWidth - 2;
    arrows.forEach((btn) => {
      const dir = Number(btn.dataset.proofDir);
      if (dir < 0) btn.disabled = rail.scrollLeft <= 2;
      else         btn.disabled = rail.scrollLeft >= max;
    });
  }
  rail.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
