/**
 * animations.js — Anime.js powered scroll-aware animations
 */
(function () {
  'use strict';
  if (!window.anime) { console.warn('[animations] anime.js not found'); return; }
  const an = window.anime;

  let cardObserver = null;
  let prevContent  = null;

  function qs(sel, root)  { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ── Page header stagger ────────────────────────────────────────────
  // Works for pages using .sn-pageheader and plain-header pages (Homework).
  function animatePageHeader(content) {
    const header = qs('.sn-pageheader', content);
    const h1     = qs('h1', content);
    if (!h1 || h1.dataset.animed) return;
    h1.dataset.animed = '1';

    if (header && !header.dataset.animed) {
      header.dataset.animed = '1';
      const eyebrow = qs('.eyebrow', header);
      const meta    = qs('.meta',    header);
      const actions = qs('.actions', header);
      const blocks  = [eyebrow, h1, meta, actions].filter(Boolean);
      blocks.forEach(b => { b.style.opacity = '0'; b.style.transform = 'translateY(12px)'; });

      const tl = an.timeline({ easing: 'cubicBezier(0.22, 1, 0.36, 1)' });
      if (eyebrow) tl.add({ targets: eyebrow, opacity: [0, 1], translateY: [12, 0], duration: 600 }, 0);
      tl.add({ targets: h1, opacity: [0, 1], translateY: [16, 0], duration: 750 }, 100);
      if (meta)    tl.add({ targets: meta,    opacity: [0, 1], translateY: [10, 0], duration: 550 }, 260);
      if (actions) tl.add({ targets: actions, opacity: [0, 1], translateY: [8,  0], duration: 500 }, 360);
      tl.finished.then(() => blocks.forEach(b => { b.style.opacity = ''; b.style.transform = ''; }));
    } else {
      // Fallback for custom-header pages (Homework, etc.)
      h1.style.opacity   = '0';
      h1.style.transform = 'translateY(14px)';
      an({
        targets:    h1,
        opacity:    [0, 1],
        translateY: [14, 0],
        duration:   700,
        easing:     'cubicBezier(0.22, 1, 0.36, 1)',
        complete:   () => { h1.style.opacity = ''; h1.style.transform = ''; }
      });
    }
  }

  // ── Batched IntersectionObserver reveal ────────────────────────────
  function revealCards(targets, content) {
    if (!targets.length) return;

    targets.forEach(c => {
      if (c.dataset.animed) return;
      c.dataset.animed  = 'pending';
      c.style.opacity   = '0';
      c.style.transform = 'translateY(16px)';
    });

    const pending = targets.filter(c => c.dataset.animed === 'pending');
    if (!pending.length) return;

    let batch = [];
    let timer = null;

    if (cardObserver) cardObserver.disconnect();

    cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting || e.target.dataset.animed !== 'pending') return;
        cardObserver.unobserve(e.target);
        batch.push(e.target);
        clearTimeout(timer);
        timer = setTimeout(() => {
          const b = batch.splice(0);
          an({
            targets:    b,
            opacity:    [0, 1],
            translateY: [16, 0],
            delay:      an.stagger(55),
            duration:   600,
            easing:     'cubicBezier(0.22, 1, 0.36, 1)',
            begin(anim) {
              anim.animatables.forEach(a => {
                a.target.style.opacity   = '';
                a.target.style.transform = '';
                a.target.dataset.animed  = '1';
              });
            }
          });
        }, 30);
      });
    }, { root: content, threshold: 0.05, rootMargin: '0px 0px -12px 0px' });

    pending.forEach(c => cardObserver.observe(c));
  }

  function setupCardReveals(content) {
    const sel = [
      '.sn-card:not([data-animed])',
      '.subj-card:not([data-animed])',
      '.hw-card:not([data-animed])',
    ].join(', ');
    revealCards(qsa(sel, content), content);
  }

  // ── Subjects grid from-centre stagger ─────────────────────────────
  function animateSubjectsGrid(content) {
    const cards = qsa('.subj-card:not([data-animed])', content);
    if (cards.length < 4) return;
    cards.forEach(c => {
      c.dataset.animed  = 'pending';
      c.style.opacity   = '0';
      c.style.transform = 'scale(0.94)';
    });
    an({
      targets:    cards,
      opacity:    [0, 1],
      scale:      [0.94, 1],
      delay:      an.stagger(60, { from: 'center' }),
      duration:   650,
      easing:     'cubicBezier(0.22, 1, 0.36, 1)',
      begin(anim) {
        anim.animatables.forEach(a => {
          a.target.style.opacity   = '';
          a.target.style.transform = '';
          a.target.dataset.animed  = '1';
        });
      }
    });
  }

  // ── Tools page animations ──────────────────────────────────────────
  function animateToolCards(cards) {
    if (!cards.length) return;
    cards.forEach(c => {
      c.dataset.animed  = 'pending';
      c.style.opacity   = '0';
      c.style.transform = 'translateY(14px) scale(0.97)';
    });
    an({
      targets:    cards,
      opacity:    [0, 1],
      translateY: [14, 0],
      scale:      [0.97, 1],
      delay:      an.stagger(50, { from: 'first' }),
      duration:   550,
      easing:     'cubicBezier(0.22, 1, 0.36, 1)',
      begin(anim) {
        anim.animatables.forEach(a => {
          a.target.style.opacity   = '';
          a.target.style.transform = '';
          a.target.dataset.animed  = '1';
        });
      }
    });
  }

  // Watch the tools grid for filter-change re-renders
  function setupToolsGrid(content) {
    const grid = qs('.tools-grid', content);
    if (!grid) return;

    // Initial animation
    animateToolCards(qsa('.tool-card:not([data-animed])', grid));

    // Re-animate when filter changes (React swaps children)
    new MutationObserver(() => {
      const fresh = qsa('.tool-card:not([data-animed])', grid);
      if (fresh.length) animateToolCards(fresh);
    }).observe(grid, { childList: true });
  }

  // ── Orchestrator ───────────────────────────────────────────────────
  function onContentMounted(content) {
    if (content === prevContent) return;
    prevContent = content;

    setTimeout(() => {
      animatePageHeader(content);

      const subjCards = qsa('.subj-card', content);
      if (subjCards.length >= 4) {
        animateSubjectsGrid(content);
      } else {
        setupCardReveals(content);
      }

      setupToolsGrid(content);
    }, 100);
  }

  // ── Watch for React route changes ─────────────────────────────────
  const root = document.getElementById('root');
  if (!root) return;

  new MutationObserver(() => {
    const content = qs('.sn-content');
    if (content) onContentMounted(content);
  }).observe(root, { subtree: true, childList: true });

  const init = qs('.sn-content');
  if (init) onContentMounted(init);
})();
