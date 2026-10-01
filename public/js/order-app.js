(() => {
  'use strict';

  // ── State ──────────────────────────────────────────
  let menu = [];
  let cart = [];       // [{id, name, image, price, tbd, qty}]
  let activeCategory = '全部';
  let activeMethod = 'fps';

  // ── DOM helpers ────────────────────────────────────
  const $ = id => document.getElementById(id);
  const money = n => n > 0 ? `HK$${n}` : '待定';
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

  // ── Load menu ──────────────────────────────────────
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      menu = await res.json();
      renderCatTabs();
      renderMenu();
    } catch (e) {
      $('menuGrid').innerHTML = '<p style="padding:20px;color:#a33">載入餐牌失敗，請重新整理</p>';
    }
  }

  function renderCatTabs() {
    const cats = ['全部', ...new Set(menu.map(i => i.category))];
    $('catTabs').innerHTML = cats.map(c =>
      `<button class="cat-tab${c === activeCategory ? ' active' : ''}" data-cat="${c}" role="tab">${c}</button>`
    ).join('');
    $('catTabs').addEventListener('click', e => {
      const btn = e.target.closest('.cat-tab');
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      $('catTabs').querySelectorAll('.cat-tab').forEach(b =>
        b.classList.toggle('active', b.dataset.cat === activeCategory));
      renderMenu();
    });
  }

  function renderMenu() {
    const items = activeCategory === '全部'
      ? menu : menu.filter(i => i.category === activeCategory);
    $('menuGrid').innerHTML = items.map(item => `
      <div class="menu-card" data-id="${item.id}">
        <img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy">
        <div class="menu-card-body">
          <span class="menu-card-cat">${item.category}</span>
          <strong class="menu-card-name">${item.name}</strong>
          <p class="menu-card-desc">${item.desc}</p>
          <div class="menu-card-foot">
            <span class="menu-card-price${item.tbd ? ' tbd' : ''}">${item.tbd ? '價格待定' : money(item.price)}</span>
            <button class="add-btn" aria-label="加入購物車" data-id="${item.id}">＋</button>
          </div>
        </div>
      </div>`).join('');

    $('menuGrid').addEventListener('click', e => {
      const btn = e.target.closest('.add-btn');
      if (!btn) return;
      addToCart(btn.dataset.id);
    });
  }

  // ── Cart logic ─────────────────────────────────────
  function addToCart(id) {
    const item = menu.find(i => i.id === id);
    if (!item) return;
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    showToast(`${item.name} 已加入`);
  }

  function updateCartUI() {
    const count = cartCount();
    const total = cartTotal();

    // Badge
    const badge = $('cartBadge');
    badge.hidden = count === 0;
    badge.textContent = count;

    // Sticky bar
    const bar = $('stickyBar');
    bar.hidden = count === 0;
    $('sbCount').textContent = `${count} 件`;
    $('sbTotal').textContent = total > 0 ? money(total) : '價格待定';
  }

  function renderCartItems() {
    if (!cart.length) {
      $('cartItems').innerHTML = '<div class="cart-empty"><span>🧺</span>購物車是空的</div>';
      $('checkoutBtn').disabled = true;
      return;
    }
    $('checkoutBtn').disabled = false;
    $('cartItems').innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="ci-img" src="${item.image}" alt="${item.name}">
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-price">${item.tbd ? '價格待定' : money(item.price * item.qty)}</div>
        </div>
        <div class="ci-qty">
          <button data-action="minus" data-id="${item.id}">−</button>
          <output>${item.qty}</output>
          <button data-action="plus" data-id="${item.id}">＋</button>
        </div>
      </div>`).join('');

    $('cartItems').addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.dataset.id;
      const entry = cart.find(c => c.id === id);
      if (!entry) return;
      if (btn.dataset.action === 'plus') entry.qty++;
      if (btn.dataset.action === 'minus') {
        entry.qty--;
        if (entry.qty <= 0) cart = cart.filter(c => c.id !== id);
      }
      renderCartItems();
      updateCartUI();
      $('cartTotal').textContent = cartTotal() > 0 ? money(cartTotal()) : '價格待定';
    });

    $('cartTotal').textContent = cartTotal() > 0 ? money(cartTotal()) : '價格待定';
  }

  // ── Sheet control ──────────────────────────────────
  function openSheet(sheetId) {
    $('backdrop').hidden = false;
    $(sheetId).hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSheets() {
    $('backdrop').hidden = true;
    $('cartSheet').hidden = false; // keep cartSheet mounted but visually close
    $('cartSheet').style.display = 'none';
    $('paySheet').hidden = true;
    document.body.style.overflow = '';
  }

  function openCart() {
    renderCartItems();
    $('backdrop').hidden = false;
    $('cartSheet').style.display = 'flex';
    $('paySheet').hidden = true;
    document.body.style.overflow = 'hidden';
  }
  function openPay() {
    $('payAmount').textContent = cartTotal() > 0 ? money(cartTotal()) : '價格待定';
    $('paySheet').hidden = false;
    $('cartSheet').style.display = 'none';
    loadFPSQR();
  }

  // ── FPS QR ─────────────────────────────────────────
  async function loadFPSQR() {
    const total = cartTotal();
    if (total <= 0) {
      $('qrLoading').hidden = true;
      $('qrError').hidden = false;
      $('qrError').textContent = '菜式價格尚未設定，請直接向員工查詢';
      $('confirmPayBtn').disabled = true;
      return;
    }
    $('qrLoading').hidden = false;
    $('qrImg').hidden = true;
    $('qrError').hidden = true;
    try {
      const res = await fetch('/api/fps-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total / 1 }) // HKD amount (price already in HKD)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      $('qrLoading').hidden = true;
      $('qrImg').src = data.qr;
      $('qrImg').hidden = false;
      $('confirmPayBtn').disabled = false;
    } catch (err) {
      $('qrLoading').hidden = true;
      $('qrError').textContent = err.message || '無法生成 QR，請向員工付款';
      $('qrError').hidden = false;
    }
  }

  // ── Submit order ───────────────────────────────────
  async function submitOrder() {
    $('confirmPayBtn').disabled = true;
    $('confirmPayBtn').textContent = '提交中…';
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, tbd: i.tbd })),
          total: cartTotal(),
          note: $('orderNote').value.trim(),
          paymentMethod: activeMethod,
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Show success
      closeSheets();
      $('cartSheet').style.display = '';
      $('successOrderId').textContent = data.orderId;
      $('successScreen').hidden = false;
      cart = [];
      updateCartUI();
    } catch (err) {
      alert('提交失敗：' + err.message);
      $('confirmPayBtn').disabled = false;
      $('confirmPayBtn').textContent = '✅ 我已付款，確認下單';
    }
  }

  // ── Toast ──────────────────────────────────────────
  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
      background: '#30231e', color: 'white', padding: '10px 20px',
      borderRadius: '99px', fontSize: '14px', fontWeight: '700',
      zIndex: '999', whiteSpace: 'nowrap',
      animation: 'fadeIn .2s ease'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
  }

  // ── Event listeners ────────────────────────────────
  $('cartBtn').addEventListener('click', openCart);
  $('stickyBarBtn').addEventListener('click', openCart);
  $('backdrop').addEventListener('click', () => {
    $('backdrop').hidden = true;
    $('cartSheet').style.display = 'none';
    $('paySheet').hidden = true;
    document.body.style.overflow = '';
  });
  $('closeCart').addEventListener('click', () => {
    $('backdrop').hidden = true;
    $('cartSheet').style.display = 'none';
    document.body.style.overflow = '';
  });
  $('checkoutBtn').addEventListener('click', openPay);
  $('backToCart').addEventListener('click', openCart);
  $('confirmPayBtn').addEventListener('click', submitOrder);
  $('newOrderBtn').addEventListener('click', () => {
    $('successScreen').hidden = true;
  });

  // Payment method toggle
  document.querySelectorAll('.pay-method-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMethod = btn.dataset.method;
      if (activeMethod === 'fps') loadFPSQR();
    });
  });

  // ── Init ───────────────────────────────────────────
  $('cartSheet').style.display = 'none';
  loadMenu();
})();
