// =============================================
// CAPSLOCK THEME JS
// =============================================

(function () {
  'use strict';

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

// ---------- Product variant switcher (global) ----------
var CAPSLOCK_VARIANTS = window.CAPSLOCK_VARIANTS || [];

function capslockFormatMoney(cents) {
  try {
    const fmt = window.CAPSLOCK_MONEY_FORMAT || '€{{amount}}';
    return fmt.replace(/\{\{\s*amount\s*\}\}/, (cents / 100).toFixed(2).replace('.', ','));
  } catch (e) {
    return '€' + (cents / 100).toFixed(2).replace('.', ',');
  }
}

function capslockScrollToNotify() {
  const n = document.getElementById('notifyRow');
  if (n) {
    n.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = n.querySelector('input[type="email"]');
    if (input) setTimeout(() => input.focus(), 400);
  }
}

function capslockSetVariant(variantId) {
  const variant = (window.CAPSLOCK_VARIANTS || CAPSLOCK_VARIANTS).find(v => v.id === variantId);
  if (!variant) return;

  const idInput = document.getElementById('variantIdInput');
  if (idInput) idInput.value = variant.id;

  ['variantPrice', 'variantPriceInline', 'stickyPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = capslockFormatMoney(variant.price);
  });

  const label = document.getElementById('colorLabel');
  if (label) label.textContent = variant.option1;

  if (variant.featured_image) {
    const img = document.getElementById('mainImg');
    if (img) img.src = variant.featured_image.src;
  }

  document.querySelectorAll('[data-variant-id]').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.variantId, 10) === variant.id);
  });

  const addBtn = document.getElementById('addToCartButton');
  const notifyRow = document.getElementById('notifyRow');
  const stickyBtn = document.getElementById('stickyAtcBtn');
  const notifyTags = document.getElementById('notifyTagsInput');

  if (variant.available) {
    if (addBtn) { addBtn.disabled = false; }
    if (notifyRow) notifyRow.style.display = 'none';
    if (stickyBtn) { stickyBtn.disabled = false; stickyBtn.textContent = 'Add to cart'; stickyBtn.setAttribute('type', 'submit'); stickyBtn.onclick = null; }
  } else {
    if (addBtn) { addBtn.disabled = true; }
    if (notifyRow) notifyRow.style.display = 'block';
    if (stickyBtn) { stickyBtn.disabled = false; stickyBtn.textContent = 'Sold out — notify me'; stickyBtn.setAttribute('type', 'button'); stickyBtn.onclick = capslockScrollToNotify; }
    if (notifyTags && window.CAPSLOCK_HANDLE) {
      notifyTags.value = 'restock-request,restock:' + window.CAPSLOCK_HANDLE + ',restock-variant:' + variant.id;
    }
  }

  const addLabel = document.getElementById('addToCartLabel');
  if (addLabel) {
    addLabel.innerHTML = (variant.available ? 'Add to cart' : 'Sold out') + ' — <span id="variantPriceInline">' + capslockFormatMoney(variant.price) + '</span>';
  }
}
