// =============================================
// CAPSLOCK THEME JS
// =============================================

(function () {
  'use strict';

  // Move drawers & overlays to <body> so no transformed ancestor
  // (Shopify section wrappers) can trap their position:fixed.
  function reparentToBody() {
    ['menuOverlay', 'mobileMenu', 'cartOverlay', 'cartDrawer'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.parentNode !== document.body) {
        document.body.appendChild(el);
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reparentToBody);
  } else {
    reparentToBody();
  }

  function q(id) { return document.getElementById(id); }

  function closeMenu() {
    const mm = q('mobileMenu'), ov = q('menuOverlay');
    if (mm) mm.classList.remove('open');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    const mm = q('mobileMenu'), ov = q('menuOverlay');
    if (mm) mm.classList.add('open');
    if (ov) ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    const d = q('cartDrawer'), ov = q('cartOverlay');
    if (d) d.classList.remove('open');
    if (ov) ov.classList.remove('open');
    document.body.style.overflow = '';
  }
  function openCart() {
    const d = q('cartDrawer'), ov = q('cartOverlay');
    if (d) d.classList.add('open');
    if (ov) ov.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  // Global delegated click handler — works no matter when elements load
  document.addEventListener('click', function (e) {
    const t = e.target;

    // Open menu
    if (t.closest('#burgerBtn')) { e.preventDefault(); openMenu(); return; }
    // Close menu
    if (t.closest('#mmClose') || t.id === 'menuOverlay') { e.preventDefault(); closeMenu(); return; }
    // Menu link clicked
    if (t.closest('#mobileMenu a')) { closeMenu(); return; }

    // Open cart
    if (t.closest('#cartBtn')) { e.preventDefault(); openCart(); return; }
    // Close cart
    if (t.closest('#cartClose') || t.id === 'cartOverlay') { e.preventDefault(); closeCart(); return; }

    // Accordion
    const head = t.closest('.acc-head');
    if (head) {
      const item = head.parentElement;
      const scope = item.closest('.accordion') || document;
      const isOpen = item.classList.contains('open');
      scope.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
      return;
    }

    // Cart qty steppers
    const qtyBtn = t.closest('.qty-btn');
    if (qtyBtn) {
      const line = qtyBtn.dataset.line;
      const delta = parseInt(qtyBtn.dataset.delta, 10);
      const input = document.querySelector('.qty-input[data-line="' + line + '"]');
      if (input) {
        const newVal = Math.max(0, parseInt(input.value || '0', 10) + delta);
        input.value = newVal;
        fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line: parseInt(line, 10), quantity: newVal })
        }).then(() => location.reload());
      }
      return;
    }
  });

  // Escape closes everything
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); closeCart(); }
  });

  // Sticky add-to-cart on scroll
  window.addEventListener('scroll', function () {
    const ps = q('product'), st = q('stickyAtc');
    if (ps && st) st.classList.toggle('show', ps.getBoundingClientRect().top < -200);
  }, { passive: true });

})();
