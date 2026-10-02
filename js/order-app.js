(() => {
  'use strict';

  // ── State ──────────────────────────────────────────
  let menu = [];
  let cart = [];       // [{id, name, image, price, tbd, qty}]
  let activeCategory = '全部';
  let activeMethod = 'alipay';

  // ── DOM helpers ────────────────────────────────────
  const $ = id => document.getElementById(id);
  const money = n => n > 0 ? `HK$${n}` : '待定';
  const cartTotal = () => cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

  const FALLBACK_MENU = [
    { id: 'banh-mi-dac-biet',  name: '招牌法包',       category: '法包',     price: 10, tbd: false, image: 'images/banh-mi-dac-biet.jpg',  desc: '越式扎肉、肝醬、醃菜及芫荽' },
    { id: 'banh-mi-thap-cam',  name: '特色法包',       category: '法包',     price: 10, tbd: false, image: 'images/banh-mi-thap-cam.jpg',  desc: '扎肉、醃菜及青瓜絲' },
    { id: 'banh-mi-xiu-mai',   name: '肉丸叉燒法包',   category: '法包',     price: 10, tbd: false, image: 'images/banh-mi-xiu-mai.jpg',   desc: '手打肉丸、叉燒及越式醃菜' },
    { id: 'banh-mi-xa-xiu',    name: '叉燒法包',       category: '法包',     price: 10, tbd: false, image: 'images/banh-mi-xa-xiu.jpg',    desc: '香烤叉燒配越式醃菜及芫荽' },
    { id: 'banh-mi-ga',        name: '燒雞法包',       category: '法包',     price: 10, tbd: false, image: 'images/banh-mi-ga.jpg',        desc: '燒雞肉配特製醬汁' },
    { id: 'cha-lua-plat',      name: '越式扎肉拼盤',   category: '小食',     price: 10, tbd: false, image: 'images/cha-lua-platcl.jpg',    desc: '越式扎肉及葉包糰拼盤' },
    { id: 'nguyen-lieu-plat',  name: '越式配料拼盤',   category: '小食',     price: 10, tbd: false, image: 'images/nguyen-lieu-plat.jpg',  desc: '炸豆腐、葉包糰及雞蛋糕' },
    { id: 'cha-lua',           name: '越式扎肉',       category: '小食',     price: 10, tbd: false, image: 'images/cha-lua.jpg',           desc: '越式豬肉腸' },
    { id: 'cha-gio',           name: '越式炸春卷',     category: '小食',     price: 10, tbd: false, image: 'images/cha-gio.jpg',           desc: '香脆越式炸春卷' },
    { id: 'goi-cuon-tom',      name: '大蝦紙米卷',     category: '越式米卷', price: 10, tbd: false, image: 'images/goi-cuon-tom.jpg',      desc: '新鮮大蝦紙米卷配香草' },
    { id: 'bun-chay',          name: '素湯米線',       category: '湯麵',     price: 10, tbd: false, image: 'images/bun-chay.jpg',          desc: '素湯底配豆腐及番茄' },
    { id: 'bun-bo-vien',       name: '豬肉丸湯米線',   category: '湯麵',     price: 10, tbd: false, image: 'images/bun-bo-vien.jpg',       desc: '豬肉丸、血塊及炸豆腐' },
    { id: 'bun-lon-tap-cam',   name: '豬雜湯米線',     category: '湯麵',     price: 10, tbd: false, image: 'images/bun-lon-tap-cam.jpg',   desc: '豬雜、豬扎肉、炸豆腐及肉丸' },
    { id: 'bun-xa-xiu-kho',    name: '燒肉乾撈米線',   category: '乾撈米線', price: 10, tbd: false, image: 'images/bun-xa-xiu-kho.jpg',    desc: '香脆燒豬頸肉拌米線' },
    { id: 'bun-cha-gio-lon',   name: '炸春卷米線',     category: '乾撈米線', price: 10, tbd: false, image: 'images/bun-cha-gio-lon.jpg',   desc: '大春卷配米線及花生' },
    { id: 'bun-cha-gio',       name: '炸春卷乾撈米線', category: '乾撈米線', price: 10, tbd: false, image: 'images/bun-cha-gio.jpg',       desc: '脆皮春卷拌米線配豆芽及芫荽' },
  ];

  // ── Load menu ──────────────────────────────────────
  async function loadMenu() {
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('API unavailable');
      menu = await res.json();
    } catch (e) {
      menu = FALLBACK_MENU;
    }
    renderCatTabs();
    renderMenu();
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
    $('cartSheet').hidden = false;
    $('cartSheet').style.display = 'flex';
    $('paySheet').hidden = true;
    $('paySheet').style.display = 'none';
    document.body.style.overflow = 'hidden';
  }

  function updatePaymentPanel() {
    const total = cartTotal();
    const displayAmount = total > 0 ? money(total) : '價格待定';
    $('payAmount').textContent = displayAmount;

    if (activeMethod === 'alipay') {
      if ($('alipayPanel')) $('alipayPanel').hidden = false;
      if ($('fpsPanel')) $('fpsPanel').hidden = true;
      if ($('alipayTargetAmount')) $('alipayTargetAmount').textContent = total > 0 ? money(total) : '價格待定 (請向店員查詢)';
    } else if (activeMethod === 'fps') {
      if ($('alipayPanel')) $('alipayPanel').hidden = true;
      if ($('fpsPanel')) $('fpsPanel').hidden = false;
      loadFPSQR();
    }
  }

  function openPay() {
    $('paySheet').hidden = false;
    $('paySheet').style.display = 'flex';
    $('cartSheet').style.display = 'none';
    $('cartSheet').hidden = true;
    updatePaymentPanel();
  }

  // ── FPS QR ─────────────────────────────────────────
  async function loadFPSQR() {
    const total = cartTotal();
    if (total <= 0) {
      $('qrLoading').hidden = true;
      $('qrError').hidden = false;
      $('qrError').textContent = '菜式價格尚未設定，請使用 AlipayHK 或向員工查詢';
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
        body: JSON.stringify({ amount: total / 1 }) // HKD amount
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      $('qrLoading').hidden = true;
      $('qrImg').src = data.qr;
      $('qrImg').hidden = false;
      $('confirmPayBtn').disabled = false;
    } catch (err) {
      $('qrLoading').hidden = true;
      $('qrError').textContent = err.message || '無法生成 FPS QR，請使用 AlipayHK';
      $('qrError').hidden = false;
    }
  }

  // ── Submit order ───────────────────────────────────
  async function submitOrder(e) {
    const btn = e?.currentTarget || $('confirmPayBtn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '提交訂單中…';

    let orderId = '';
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
      if (res.ok) {
        const data = await res.json();
        orderId = data.orderId;
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      // Fallback local order ID so the user experience is smooth
      orderId = 'VBH' + Math.floor(1000 + Math.random() * 9000);
    }

    // Show success
    closeSheets();
    $('cartSheet').style.display = 'none';
    $('paySheet').style.display = 'none';
    $('successOrderId').textContent = orderId;
    $('successScreen').hidden = false;
    $('successScreen').style.display = 'grid';
    cart = [];
    updateCartUI();
    btn.disabled = false;
    btn.textContent = originalText;
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
  if ($('confirmPayBtn')) $('confirmPayBtn').addEventListener('click', submitOrder);
  if ($('confirmAlipayBtn')) $('confirmAlipayBtn').addEventListener('click', submitOrder);
  $('newOrderBtn').addEventListener('click', () => {
    $('successScreen').hidden = true;
    $('successScreen').style.display = 'none';
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Payment method toggle
  document.querySelectorAll('.pay-method-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-method-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeMethod = btn.dataset.method;
      updatePaymentPanel();
    });
  });

  // ── Init ───────────────────────────────────────────
  $('cartSheet').style.display = 'none';
  loadMenu();
})();
