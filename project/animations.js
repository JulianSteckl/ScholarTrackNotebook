/**
 * animations.js — Anime.js powered scroll-aware animations
 * Loaded after React renders; uses MutationObserver to re-run on route changes.
 */
(function () {
  'use strict';

  // Wait until anime.js is available (loaded via CDN before this script)
  if (!window.anime) {
    console.warn('[animations] anime.js not found — skipping');
    return;
  }

  const an = window.anime;

  // ── State ──────────────────────────────────────────────────────────
  let cardObserver = null;
  let prevContent  = null;

  // ── Helpers ────────────────────────────────────────────────────────
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ── Page header block stagger ──────────────────────────────────────
  // Sequences eyebrow → h1 → meta line using a short timeline
  function animatePageHeader(content) {
    const header = qs('.sn-pageheader', content);
    if (!header || header.dataset.animed) return;
    header.dataset.animed = '1';

    const eyebrow = qs('.eyebrow', header);
    const h1      = qs('h1',      header);
    const meta    = qs('.meta',   header);
    const actions = qs('.actions', header);

    // Reset so we control entrance (page-enter on sn-content already moved the
    // container — we animate each block separately for a staggered feel)
    const blocks = [eyebrow, h1, meta, actions].filter(Boolean);
    blocks.forEach(b => {
      b.style.opacity  = '0';
      b.style.transform = 'translateY(12px)';
    });

    const tl = an.timeline({ easing: 'cubicBezier(0.22, 1, 0.36, 1)' });

    if (eyebrow) tl.add({ targets: eyebrow, opacity: [0, 1], translateY: [12, 0], duration: 420 }, 0);
    if (h1)      tl.add({ targets: h1,      opacity: [0, 1], translateY: [16, 0], duration: 540 }, 80);
    if (meta)    tl.add({ targets: meta,     opacity: [0, 1], translateY: [10, 0], duration: 380 }, 200);
    if (actions) tl.add({ targets: actions,  opacity: [0, 1], translateY: [8,  0], duration: 350 }, 280);

    // Clean up inline styles when done so CSS takes over
    tl.finished.then(() => {
      blocks.forEach(b => { b.style.opacity = ''; b.style.transform = ''; });
    });
  }

  // ── Card scroll-reveal via IntersectionObserver ────────────────────
  // Cards start invisible; revealed with stagger as they enter viewport.
  function setupCardReveals(content) {
    if (cardObserver) { cardObserver.disconnect(); cardObserver = null; }

    const cards = qsa('.sn-card:not([data-animed]), .subj-card:not([data-animed])', content);
    if (!cards.length) return;

    // Mark & hide all cards before the observer kicks in
    cards.forEach(c => {
      c.dataset.animed = 'pending';
      c.style.opacity  = '0';
      c.style.transform = 'translateY(16px)';
    });

    let pendingBatch = [];
    let batchTimer   = null;

    function flushBatch() {
      if (!pendingBatch.length) return;
      const batch = pendingBatch.splice(0);
      an({
        targets: batch,
        opacity:    [0, 1],
        translateY: [16, 0],
        delay: an.stagger(50),
        duration: 440,
        easing: 'easeOutQuad',
        begin(anim) {
          anim.animatables.forEach(a => {
            a.target.style.opacity   = '';
            a.target.style.transform = '';
            a.target.dataset.animed  = '1';
          });
        }
      });
    }

    cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (entry.target.dataset.animed !== 'pending') return;
        cardObserver.unobserve(entry.target);
        pendingBatch.push(entry.target);
        clearTimeout(batchTimer);
        batchTimer = setTimeout(flushBatch, 30); // batch entries arriving same frame
      });
    }, {
      root: content,
      threshold: 0.06,
      rootMargin: '0px 0px -12px 0px'
    });

    cards.forEach(c => cardObserver.observe(c));
  }

  // ── Nav item click pulse ───────────────────────────────────────────
  // Gives tactile feedback when switching tabs in the sidebar.
  function setupNavPulse() {
    qsa('.sn-nav-item').forEach(item => {
      if (item.dataset.navPulse) return;
      item.dataset.navPulse = '1';
      item.addEventListener('click', function () {
        an({
          targets: this,
          scale:  [1, 0.94, 1],
          duration: 320,
          easing: 'easeOutElastic(1, .6)'
        });
      });
    });
  }

  // ── Subject card "from centre" stagger ────────────────────────────
  // Only fires when subjects grid is visible AND has ≥4 cards.
  function animateSubjectsGrid(content) {
    const cards = qsa('.subj-card:not([data-animed])', content);
    if (cards.length < 4) return;

    // Let IntersectionObserver handle the reveal, but use from-center stagger
    cards.forEach(c => {
      c.dataset.animed = 'pending';
      c.style.opacity  = '0';
      c.style.transform = 'scale(0.93)';
    });

    an({
      targets: cards,
      opacity: [0, 1],
      scale:   [0.93, 1],
      delay: an.stagger(55, { from: 'center' }),
      duration: 480,
      easing: 'easeOutBack',
      begin(anim) {
        anim.animatables.forEach(a => {
          a.target.style.opacity   = '';
          a.target.style.transform = '';
          a.target.dataset.animed  = '1';
        });
      }
    });
  }

  // ── Homework row stagger ───────────────────────────────────────────
  function animateHwRows(content) {
    const rows = qsa('.hw-row:not([data-animed])', content);
    if (!rows.length) return;
    rows.forEach(r => { r.dataset.animed = '1'; });
    an({
      targets: rows,
      opacity:    [0, 1],
      translateX: [-8, 0],
      delay: an.stagger(35),
      duration: 360,
      easing: 'easeOutQuad'
    });
  }

  // ── Orchestrator: run all animations for newly mounted content ─────
  function onContentMounted(content) {
    if (content === prevContent) return;
    prevContent = content;

    // Small delay to let React finish rendering children
    setTimeout(() => {
      animatePageHeader(content);

      // Subjects page gets from-center grid stagger
      const isSubjectsPage = !!qs('.subj-card', content);
      if (isSubjectsPage) {
        animateSubjectsGrid(content);
      } else {
        setupCardReveals(content);
      }

      animateHwRows(content);
      setupNavPulse();
    }, 70);
  }

  // ── Watch for sn-content mounting (React remounts on route change) ─
  const root = document.getElementById('root');
  if (!root) return;

  new MutationObserver(() => {
    const content = qs('.sn-content');
    if (content) onContentMounted(content);
    setupNavPulse(); // catch nav items that appear after mount
  }).observe(root, { subtree: true, childList: true });

  // Initial run (if content already exists)
  const initContent = qs('.sn-content');
  if (initContent) onContentMounted(initContent);

})();
