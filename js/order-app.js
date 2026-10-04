(() => {
  'use strict';

  const seedMenu = [
    { id: 'banh-mi-dac-biet', name: '招牌法包', category: '法包', price: 10, image: 'images/banh-mi-dac-biet.jpg', desc: '越式扎肉、肝醬、醃菜及芫荽' },
    { id: 'banh-mi-thap-cam', name: '特色法包', category: '法包', price: 10, image: 'images/banh-mi-thap-cam.jpg', desc: '扎肉、醃菜及青瓜絲' },
    { id: 'banh-mi-xiu-mai', name: '肉丸叉燒法包', category: '法包', price: 10, image: 'images/banh-mi-xiu-mai.jpg', desc: '手打肉丸、叉燒及越式醃菜' },
    { id: 'banh-mi-xa-xiu', name: '叉燒法包', category: '法包', price: 10, image: 'images/banh-mi-xa-xiu.jpg', desc: '香烤叉燒配越式醃菜及芫荽' },
    { id: 'banh-mi-ga', name: '燒雞法包', category: '法包', price: 10, image: 'images/banh-mi-ga.jpg', desc: '燒雞肉配特製醬汁' },
    { id: 'cha-lua-plat', name: '越式扎肉拼盤', category: '小食', price: 10, image: 'images/cha-lua-platcl.jpg', desc: '越式扎肉及葉包糰拼盤' },
    { id: 'nguyen-lieu-plat', name: '越式配料拼盤', category: '小食', price: 10, image: 'images/nguyen-lieu-plat.jpg', desc: '炸豆腐、葉包糰及雞蛋糕' },
    { id: 'cha-lua', name: '越式扎肉', category: '小食', price: 10, image: 'images/cha-lua.jpg', desc: '越式豬肉腸' },
    { id: 'cha-gio', name: '越式炸春卷', category: '小食', price: 10, image: 'images/cha-gio.jpg', desc: '香脆越式炸春卷' },
    { id: 'goi-cuon-tom', name: '大蝦紙米卷', category: '越式米卷', price: 10, image: 'images/goi-cuon-tom.jpg', desc: '新鮮大蝦紙米卷配香草' },
    { id: 'bun-chay', name: '素湯米線', category: '湯麵', price: 10, image: 'images/bun-chay.jpg', desc: '素湯底配豆腐及番茄' },
    { id: 'bun-bo-vien', name: '豬肉丸湯米線', category: '湯麵', price: 10, image: 'images/bun-bo-vien.jpg', desc: '豬肉丸、血塊及炸豆腐' },
    { id: 'bun-lon-tap-cam', name: '豬雜湯米線', category: '湯麵', price: 10, image: 'images/bun-lon-tap-cam.jpg', desc: '豬雜、豬扎肉、炸豆腐及肉丸' },
    { id: 'bun-xa-xiu-kho', name: '燒肉乾撈米線', category: '乾撈米線', price: 10, image: 'images/bun-xa-xiu-kho.jpg', desc: '香脆燒豬頸肉拌米線' },
    { id: 'bun-cha-gio-lon', name: '炸春卷米線', category: '乾撈米線', price: 10, image: 'images/bun-cha-gio-lon.jpg', desc: '大春卷配米線及花生' },
    { id: 'bun-cha-gio', name: '炸春卷乾撈米線', category: '乾撈米線', price: 10, image: 'images/bun-cha-gio.jpg', desc: '脆皮春卷拌米線配豆芽及芫荽' },
  ];

  const $ = id => document.getElementById(id);
  let activeCategory = '全部';

  // 舊版的長撳改價會把資料儲存在同一個瀏覽器的 localStorage。
  // 這裡只讀取舊價，讓舊網站使用者不會因為新餐牌而立即失去價錢。
  function legacyPriceOverrides() {
    try {
      const saved = JSON.parse(localStorage.getItem('vbh_prices') || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch (_) {
      return {};
    }
  }

  const legacyPrices = legacyPriceOverrides();
  const menu = seedMenu.map(item => {
    const savedPrice = Number(legacyPrices[item.id]);
    return Number.isFinite(savedPrice) && savedPrice > 0 ? { ...item, price: savedPrice } : item;
  });

  function money(value) {
    const rounded = Math.round(value * 100) / 100;
    return `HK$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2).replace(/0$/, '').replace(/\.$/, '')}`;
  }

  function renderTabs() {
    const cats = ['全部', ...new Set(menu.map(item => item.category))];
    $('catTabs').innerHTML = cats.map(category =>
      `<button class="cat-tab${category === activeCategory ? ' active' : ''}" type="button" data-category="${category}">${category}</button>`
    ).join('');

    $('catTabs').addEventListener('click', event => {
      const button = event.target.closest('.cat-tab');
      if (!button) return;
      activeCategory = button.dataset.category;
      renderTabs();
      renderMenu();
    });
  }

  function renderMenu() {
    const visibleItems = activeCategory === '全部'
      ? menu
      : menu.filter(item => item.category === activeCategory);

    $('menuGrid').innerHTML = visibleItems.map(item => {
      const pickupPrice = item.price * 0.7;
      return `
        <article class="menu-card">
          <img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="menu-card-body">
            <span class="menu-card-cat">${item.category}</span>
            <strong class="menu-card-name">${item.name}</strong>
            <p class="menu-card-desc">${item.desc}</p>
            <div class="price-stack" aria-label="${item.name} 價格">
              <p class="platform-price"><span>外送平台參考價</span><strong>${money(item.price)}</strong></p>
              <p class="pickup-price"><span>電話自取 <em>-30%</em></span><strong>${money(pickupPrice)}</strong></p>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  renderTabs();
  renderMenu();
})();
