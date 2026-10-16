(() => {
  'use strict';

  const seedMenu = [
    { id: 'banh-mi-bo-sot-vang', name: '越式香好紅酒牛腩配法包', vietnameseName: 'Bánh mì bò sốt vang', category: '法包配餐', price: 96, image: 'images/banh-mi-bo-sot-vang-20261016.jpg', desc: '越式香好紅酒牛腩配法包' },
    { id: 'banh-mi-bo-la-lot-cha', name: '招牌荖葉牛肉卷扎肉法包', category: '法包', price: 78, image: 'images/banh-mi-bo-la-lot-cha-20261016.jpg', desc: '荖葉牛肉卷、扎肉配法包' },
    { id: 'banh-mi-la-lot', name: '越式荖葉肉卷法包', category: '法包', price: 72, image: 'images/banh-mi-la-lot-20261016.png', desc: '越式荖葉肉卷配法包' },
    { id: 'banh-mi-cha-ca', name: '越式魚餅法包', category: '法包', price: 68, image: 'images/menu-new-01-20261016.jpg', desc: '越式魚餅配法包' },
    { id: 'banh-mi-cha-thit-nuong', name: '扎肉烤肉雙拼法包', category: '法包', price: 72, image: 'images/menu-new-02-20261016.png', desc: '扎肉、烤肉雙拼' },
    { id: 'banh-mi-bo-bit-tet', name: '越式牛扒配法包', category: '法包配餐', price: 89, image: 'images/menu-new-03-20261016.png', desc: '越式牛扒配法包' },
    { id: 'banh-mi-thit-nuong-jambon', name: '招牌越式三寶法包', category: '法包', price: 78, image: 'images/menu-new-04-20261016.png', desc: '燒肉、水晶蹄、越式扎肉' },
    { id: 'banh-mi-gio-cha-jambon', name: '越式傳統法包', category: '法包', price: 78, image: 'images/menu-new-05-20261016.png', desc: '水晶蹄、雙拼扎肉、豬肉鬆' },
    { id: 'banh-mi-gio-cha-ruoc', name: '雙款扎肉肉鬆越南法包', category: '法包', price: 76, image: 'images/menu-new-07-20261016.png', desc: '雙款扎肉、豬肉鬆' },
    { id: 'banh-mi-nuong-muoi-ot', name: '法包屋香辣烤法包', category: '法包', price: 78, image: 'images/menu-new-08-20261016.png', desc: '香辣烤法包' },
    { id: 'banh-mi-bate-gio-thit-nuong', name: '巴地燒肉扎肉越南法包', category: '法包', price: 78, image: 'images/menu-new-09-20261016.png', desc: '巴地、燒肉、扎肉' },
    { id: 'banh-mi-trung-op-la', name: '越式雜錦太陽蛋配法包', category: '法包配餐', price: 78, image: 'images/menu-new-10-20261016.png', desc: '越式雜錦、太陽蛋配法包' },
    { id: 'banh-mi-bo-la-dua-cha-bong', name: '法包屋・斑蘭牛油肉鬆', category: '法包', price: 72, image: 'images/menu-new-11-20261016.png', desc: '斑蘭牛油、肉鬆配法包' },
    { id: 'banh-mi-dac-biet', name: '招牌法包', category: '法包', price: 78, image: 'images/banh-mi-dac-biet.jpg', desc: '越式扎肉、肝醬、醃菜及芫荽' },
    { id: 'banh-mi-thap-cam', name: '傳統法包', category: '法包', price: 68, image: 'images/banh-mi-thap-cam.jpg', desc: '扎肉、醃菜及青瓜絲' },
    { id: 'banh-mi-xiu-mai', name: '肉丸叉燒法包', category: '法包', price: 68, image: 'images/banh-mi-xiu-mai.jpg', desc: '手打肉丸、叉燒及越式醃菜' },
    { id: 'banh-mi-xa-xiu', name: '叉燒法包', category: '法包', price: 68, image: 'images/banh-mi-xa-xiu.jpg', desc: '香烤叉燒配越式醃菜及芫荽' },
    { id: 'banh-mi-ga', name: '燒雞法包', category: '法包', price: 78, image: 'images/banh-mi-ga.jpg', desc: '燒雞肉配特製醬汁' },
    { id: 'cha-lua-plat', name: '越式扎肉拼盤', category: '小食', price: 68, image: 'images/cha-lua-platter-20261016-edited.png', desc: '越式扎肉切片拼盤' },
    { id: 'cha-gio', name: '越式炸春卷', category: '小食', price: 68, image: 'images/cha-gio.jpg', desc: '香脆越式炸春卷' },
    { id: 'goi-cuon-tom', name: '大蝦紙米卷', category: '越式米卷', price: 78, image: 'images/goi-cuon-tom.jpg', desc: '新鮮大蝦紙米卷配香草' },
    { id: 'bun-xa-xiu-kho', name: '香脆豬頸肉乾撈米線', category: '乾撈米線', price: 68, image: 'images/bun-xa-xiu-kho.jpg', desc: '香脆豬頸肉拌米線' },
    { id: 'bun-cha-gio-lon', name: '大春卷乾撈米線', category: '乾撈米線', price: 68, image: 'images/bun-cha-gio-lon.jpg', desc: '大春卷配米線及花生' },
    { id: 'bun-cha-gio', name: '脆皮春卷乾撈米線', category: '乾撈米線', price: 68, image: 'images/bun-cha-gio.jpg', desc: '脆皮春卷拌米線配豆芽及芫荽' },
  ];

  const $ = id => document.getElementById(id);
  let activeCategory = '全部';

  // Use the published menu for every visitor, including browsers with old saved prices.
  const menu = seedMenu;

  function money(value) {
    const rounded = Math.round(value * 100) / 100;
    return `HK$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2).replace(/0$/, '').replace(/\.$/, '')}`;
  }

  function renderTabs() {
    const cats = ['全部', ...new Set(menu.map(item => item.category))];
    $('catTabs').innerHTML = cats.map(category =>
      `<button class="cat-tab${category === activeCategory ? ' active' : ''}" type="button" data-category="${category}">${category}</button>`
    ).join('');

    $('catTabs').onclick = event => {
      const button = event.target.closest('.cat-tab');
      if (!button) return;
      activeCategory = button.dataset.category;
      renderTabs();
      renderMenu();
    };
  }

  function renderMenu() {
    const visibleItems = activeCategory === '全部'
      ? menu
      : menu.filter(item => item.category === activeCategory);

    $('menuGrid').innerHTML = visibleItems.map(item => {
      const pickupPrice = Math.round(item.price * 0.7);
      return `
        <article class="menu-card">
          <img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy">
          <div class="menu-card-body">
            <span class="menu-card-cat">${item.category}</span>
            <strong class="menu-card-name">${item.name}</strong>
            <p class="menu-card-desc">${item.desc}</p>
            <div class="price-stack" aria-label="${item.name} 價格">
              <p class="platform-price"><span>外賣平台參考價</span><strong>${money(item.price)}</strong></p>
              <p class="pickup-price"><span>電話落單 <em>自取價</em></span><strong>${money(pickupPrice)}</strong></p>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  renderTabs();
  renderMenu();
})();
