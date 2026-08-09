// =============================================
// CAPSLOCK THEME JS
// =============================================

document.addEventListener('DOMContentLoaded', function () {

  // ------------------------------------------
  // Mobile menu — slide in/out
  // ------------------------------------------
  const burger = document.getElementById('burgerBtn');
  const mm = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  function openMenu() { mm && mm.classList.add('open'); overlay && overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeMenu() { mm && mm.classList.remove('open'); overlay && overlay.classList.remove('open'); document.body.style.overflow = ''; }
  if (burger) burger.addEventListener('click', openMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);
  const mmClose = document.getElementById('mmClose');
  if (mmClose) mmClose.addEventListener('click', closeMenu);
  if (mm) mm.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // ------------------------------------------
  // Cart drawer — slide in from right
  // ------------------------------------------
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  function openCart(e) {
    if (e) e.preventDefault();
    cartDrawer && cartDrawer.classList.add('open');
    cartOverlay && cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer && cartDrawer.classList.remove('open');
    cartOverlay && cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  // ------------------------------------------
  // Accordion — scoped per .accordion container
  // ------------------------------------------
  document.querySelectorAll('.acc-head').forEach(head => {
    head.addEventListener('click', () => {
      const item = head.parentElement;
      const scope = item.closest('.accordion') || document;
      const isOpen = item.classList.contains('open');
      scope.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ------------------------------------------
  // Cart quantity steppers (full page cart)
  // ------------------------------------------
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const line = this.dataset.line;
      const delta = parseInt(this.dataset.delta, 10);
      const input = document.querySelector('.qty-input[data-line="' + line + '"]');
      if (!input) return;
      const newVal = Math.max(0, parseInt(input.value || '0', 10) + delta);
      input.value = newVal;
      // Submit via Shopify cart update
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: parseInt(line, 10), quantity: newVal })
      }).then(() => { location.reload(); });
    });
  });

  // ------------------------------------------
  // Sticky add-to-cart — show on scroll
  // ------------------------------------------
  const productSection = document.getElementById('product');
  const stickyAtc = document.getElementById('stickyAtc');
  if (productSection && stickyAtc) {
    window.addEventListener('scroll', () => {
      stickyAtc.classList.toggle('show', productSection.getBoundingClientRect().top < -200);
    }, { passive: true });
  }

});

// ------------------------------------------
// Product page — variant switcher (global so
// it works when called from inline onclick)
// ------------------------------------------
var CAPSLOCK_VARIANTS = window.CAPSLOCK_VARIANTS || [];

function capslockFormatMoney(cents) {
  try {
    const fmt = window.CAPSLOCK_MONEY_FORMAT || '€{{amount}}';
    return fmt.replace(/\{\{\s*amount\s*\}\}/, (cents / 100).toFixed(2).replace('.', ','));
  } catch (e) {
    return '€' + (cents / 100).toFixed(2).replace('.', ',');
  }
}

function capslockSetVariant(variantId) {
  const variant = CAPSLOCK_VARIANTS.find(v => v.id === variantId);
  if (!variant) return;

  // Hidden input
  const idInput = document.getElementById('variantIdInput');
  if (idInput) idInput.value = variant.id;

  // Price displays
  ['variantPrice', 'variantPriceInline', 'stickyPrice'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = capslockFormatMoney(variant.price);
  });

  // Colour label
  const label = document.getElementById('colorLabel');
  if (label) label.textContent = variant.option1;

  // Main image
  if (variant.featured_image) {
    const img = document.getElementById('mainImg');
    if (img) img.src = variant.featured_image.src;
  }

  // Active states — gallery thumbs and colour swatches
  document.querySelectorAll('[data-variant-id]').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.variantId, 10) === variant.id);
  });

  // Add to cart / notify toggle
  const addBtn = document.getElementById('addToCartBtn');
  const notifyRow = document.getElementById('notifyRow');
  const stickyBtn = document.getElementById('stickyAtcBtn');
  const notifyTags = document.getElementById('notifyTagsInput');

  if (variant.available) {
    if (addBtn) { addBtn.disabled = false; addBtn.innerHTML = 'Add to cart — ' + capslockFormatMoney(variant.price); }
    if (notifyRow) notifyRow.style.display = 'none';
    if (stickyBtn) { stickyBtn.disabled = false; stickyBtn.textContent = 'Add to cart'; stickyBtn.type = 'submit'; }
  } else {
    if (addBtn) { addBtn.disabled = true; addBtn.innerHTML = 'Sold out — ' + capslockFormatMoney(variant.price); }
    if (notifyRow) notifyRow.style.display = 'block';
    if (stickyBtn) { stickyBtn.disabled = true; stickyBtn.textContent = 'Sold out — notify me'; stickyBtn.type = 'button'; stickyBtn.onclick = () => { notifyRow && notifyRow.scrollIntoView({ behavior: 'smooth', block: 'center' }); }; }
    if (notifyTags && window.CAPSLOCK_HANDLE) {
      notifyTags.value = 'restock-request,restock:' + CAPSLOCK_HANDLE + ',restock-variant:' + variant.id;
    }
  }
}
