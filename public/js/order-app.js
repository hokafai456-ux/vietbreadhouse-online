(() => {
  'use strict';

  const seedMenu = [
    { id: 'banh-mi-bo-sot-vang', name: '越式香好紅酒牛腩配法包', vietnameseName: 'Bánh mì bò sốt vang', category: '法包', price: 96, image: 'images/banh-mi-bo-sot-vang-20261016.jpg', desc: '越式香好紅酒牛腩配法包' },
    { id: 'banh-mi-bo-la-lot-cha', name: '招牌荖葉牛肉卷扎肉法包', category: '法包', price: 78, image: 'images/banh-mi-bo-la-lot-cha-20261016.jpg', desc: '荖葉牛肉卷、扎肉配法包' },
    { id: 'banh-mi-la-lot', name: '越式荖葉肉卷法包', category: '法包', price: 72, image: 'images/banh-mi-la-lot-20261016.png', desc: '越式荖葉肉卷配法包' },
    { id: 'banh-mi-cha-ca', name: '越式魚餅法包', category: '法包', price: 68, image: 'images/menu-new-01-20261016.jpg', desc: '越式魚餅配法包' },
    { id: 'banh-mi-cha-thit-nuong', name: '扎肉烤肉雙拼法包', category: '法包', price: 72, image: 'images/menu-new-02-20261016.png', desc: '扎肉、烤肉雙拼' },
    { id: 'banh-mi-bo-bit-tet', name: '越式牛扒配法包', category: '法包', price: 89, image: 'images/menu-new-03-20261016.png', desc: '越式牛扒配法包' },
    { id: 'banh-mi-thit-nuong-jambon', name: '招牌越式三寶法包', category: '法包', price: 78, image: 'images/menu-new-04-20261016.png', desc: '燒肉、水晶蹄、越式扎肉' },
    { id: 'banh-mi-gio-cha-jambon', name: '越式傳統法包', category: '法包', price: 78, image: 'images/menu-new-05-20261016.png', desc: '水晶蹄、雙拼扎肉、豬肉鬆' },
    { id: 'banh-mi-gio-cha-ruoc', name: '雙款扎肉肉鬆越南法包', category: '法包', price: 76, image: 'images/menu-new-07-20261016.png', desc: '雙款扎肉、豬肉鬆' },
    { id: 'banh-mi-nuong-muoi-ot', name: '法包屋香辣烤法包', category: '法包', price: 78, image: 'images/menu-new-08-20261016.png', desc: '香辣烤法包' },
    { id: 'banh-mi-bate-gio-thit-nuong', name: '巴地燒肉扎肉越南法包', category: '法包', price: 78, image: 'images/menu-new-09-20261016.png', desc: '巴地、燒肉、扎肉' },
    { id: 'banh-mi-trung-op-la', name: '越式雜錦太陽蛋配法包', category: '法包', price: 78, image: 'images/menu-new-10-20261016.png', desc: '巴地、香腸、扎肉、太陽蛋及法包' },
    { id: 'banh-mi-bo-la-dua-cha-bong', name: '法包屋・斑蘭牛油肉鬆', category: '法包', price: 62, image: 'images/menu-new-11-20261016.png', desc: '斑蘭牛油、肉鬆配法包' },
    { id: 'banh-mi-dac-biet', name: '招牌法包', category: '法包', price: 78, image: 'images/banh-mi-dac-biet.jpg', desc: '越式扎肉、肝醬、醃菜及芫荽' },
    { id: 'banh-mi-thap-cam', name: '傳統法包', category: '法包', price: 68, image: 'images/banh-mi-thap-cam.jpg', desc: '扎肉、豬肉' },
    { id: 'banh-mi-xiu-mai', name: '肉丸叉燒法包', category: '法包', price: 68, image: 'images/banh-mi-xiu-mai.jpg', desc: '手打肉丸、叉燒及越式醃菜' },
    { id: 'banh-mi-xa-xiu', name: '叉燒法包', category: '法包', price: 68, image: 'images/banh-mi-xa-xiu.jpg', desc: '香烤叉燒配越式醃菜及芫荽' },
    { id: 'cha-lua-plat', name: '越式扎肉拼盤', category: '小食', price: 68, image: 'images/cha-lua-platter-20261016-edited.png', desc: '越式扎肉切片拼盤' },
    { id: 'cha-gio', name: '越式炸春卷（三件）', category: '小食', price: 68, image: 'images/cha-gio.jpg', desc: '香脆越式炸春卷，每份三件' },
    { id: 'goi-cuon-tom', name: '大蝦紙米卷', category: '小食', price: 78, image: 'images/goi-cuon-tom.jpg', desc: '新鮮大蝦紙米卷配香草' },
    { id: 'bun-xa-xiu-kho', name: '香脆豬頸肉乾撈米線', category: '米線', price: 68, image: 'images/bun-xa-xiu-kho.jpg', desc: '香脆豬頸肉拌米線' },
    { id: 'bun-cha-gio-lon', name: '大春卷乾撈米線', category: '米線', price: 68, image: 'images/bun-cha-gio-lon.jpg', desc: '大春卷配米線及花生', hidden: true },
    { id: 'bun-cha-gio', name: '脆皮春卷乾撈米線', category: '米線', price: 68, image: 'images/bun-cha-gio.jpg', desc: '脆皮春卷拌米線配豆芽及芫荽' },
    { id: 'drink-coke-zero', name: '無糖可樂', englishName: 'Coca-Cola No Sugar', category: '飲品', price: 15, image: 'images/drink-coke-zero-20261018.png' },
    { id: 'drink-coca-cola', name: '可口可樂', englishName: 'Coca-Cola', category: '飲品', price: 15, image: 'images/drink-coca-cola-20261018.png' },
    { id: 'drink-lemon-tea', name: '檸檬茶', englishName: 'Lemon Tea', category: '飲品', price: 14, image: 'images/drink-lemon-tea-20261018.png' },
    { id: 'drink-oolong-tea', name: '烏龍茶', englishName: 'Oolong Tea', category: '飲品', price: 17, image: 'images/drink-oolong-tea-20261018.jpg' },
    { id: 'drink-smooth-coffee', name: '香滑咖啡', englishName: 'NESCAFÉ Regular Coffee', category: '飲品', price: 16, image: 'images/drink-smooth-coffee-20261018.png' },
    { id: 'drink-unsweetened-coffee', name: '無糖咖啡', englishName: 'Unsweetened Black Coffee', category: '飲品', price: 16, image: 'images/drink-unsweetened-coffee-20261018.png' },
    { id: 'drink-7up', name: '七喜', englishName: '7UP', category: '飲品', price: 15, image: 'images/drink-7up-20261018.jpg' },
    { id: 'drink-sprite', name: '雪碧', englishName: 'Sprite', category: '飲品', price: 15, image: 'images/drink-sprite-20261018.png' },
    { id: 'drink-pear-coconut', name: '雪梨海底椰', englishName: 'Pear & Sea Coconut Drink', category: '飲品', price: 18, image: 'images/drink-pear-coconut-20261018.jpg' },
  ];

  const $ = id => document.getElementById(id);
  let activeCategory = '全部';
  // Keep codes stable across category filters and temporary hiding.
  const itemCodes = {
    "banh-mi-bo-la-lot-cha": "A01",
    "banh-mi-xa-xiu": "A02",
    "banh-mi-xiu-mai": "A03",
    "banh-mi-bo-la-dua-cha-bong": "A04",
    "banh-mi-dac-biet": "A05",
    "banh-mi-nuong-muoi-ot": "A06",
    "banh-mi-bo-sot-vang": "A07",
    "banh-mi-la-lot": "A08",
    "banh-mi-cha-ca": "A09",
    "banh-mi-cha-thit-nuong": "A10",
    "banh-mi-bo-bit-tet": "A11",
    "banh-mi-thit-nuong-jambon": "A12",
    "banh-mi-gio-cha-jambon": "A13",
    "banh-mi-gio-cha-ruoc": "A14",
    "banh-mi-bate-gio-thit-nuong": "A15",
    "banh-mi-trung-op-la": "A16",
    "banh-mi-thap-cam": "A17",
    "cha-lua-plat": "B01",
    "cha-gio": "B02",
    "goi-cuon-tom": "B03",
    "bun-xa-xiu-kho": "C01",
    "bun-cha-gio": "C02",
    "bun-cha-gio-lon": "C03",
    "drink-coke-zero": "D01",
    "drink-coca-cola": "D02",
    "drink-lemon-tea": "D03",
    "drink-oolong-tea": "D04",
    "drink-smooth-coffee": "D05",
    "drink-unsweetened-coffee": "D06",
    "drink-7up": "D07",
    "drink-sprite": "D08",
    "drink-pear-coconut": "D09"
  };
  const englishDescriptions = {
    "banh-mi-bo-sot-vang": "Red wine beef brisket served with a baguette",
    "banh-mi-bo-la-lot-cha": "Betel-leaf beef rolls and Vietnamese pork sausage",
    "banh-mi-la-lot": "Vietnamese betel-leaf meat rolls in a baguette",
    "banh-mi-cha-ca": "Vietnamese fish cake in a baguette",
    "banh-mi-cha-thit-nuong": "Vietnamese pork sausage and grilled pork",
    "banh-mi-bo-bit-tet": "Vietnamese-style steak served with a baguette",
    "banh-mi-thit-nuong-jambon": "Roast pork, jellied pork terrine and Vietnamese pork sausage",
    "banh-mi-gio-cha-jambon": "Jellied pork terrine, two pork sausages and pork floss",
    "banh-mi-gio-cha-ruoc": "Two Vietnamese pork sausages and pork floss",
    "banh-mi-nuong-muoi-ot": "Spicy grilled baguette",
    "banh-mi-bate-gio-thit-nuong": "Pâté, roast pork and Vietnamese pork sausage",
    "banh-mi-trung-op-la": "Pâté, sausage, Vietnamese pork sausage, sunny-side-up eggs and a baguette",
    "banh-mi-bo-la-dua-cha-bong": "Pandan butter and pork floss in a baguette",
    "banh-mi-dac-biet": "Vietnamese pork sausage, pâté, pickles and coriander",
    "banh-mi-thap-cam": "Vietnamese pork sausage, pork, pickles and shredded cucumber",
    "banh-mi-xiu-mai": "Handmade pork meatballs, char siu and Vietnamese pickles",
    "banh-mi-xa-xiu": "Char siu with Vietnamese pickles and coriander",
    "cha-lua-plat": "A platter of sliced Vietnamese pork sausages",
    "cha-gio": "Crispy Vietnamese fried spring rolls, three per serving",
    "goi-cuon-tom": "Prawn rice paper rolls with fresh herbs",
    "bun-xa-xiu-kho": "Dry rice vermicelli with crispy pork neck",
    "bun-cha-gio-lon": "Large spring roll with rice vermicelli and peanuts",
    "bun-cha-gio": "Dry rice vermicelli with crispy spring rolls, bean sprouts and coriander"
  };
  const keepChineseIngredients = new Set([
    'banh-mi-thit-nuong-jambon',
    'banh-mi-gio-cha-jambon',
    'banh-mi-trung-op-la',
    'banh-mi-thap-cam',
  ]);

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[character]);
  }

  // Keep temporarily hidden dishes in seedMenu so they can be restored later.
  const featuredOrder = [
    'banh-mi-bo-la-lot-cha',
    'banh-mi-xa-xiu',
    'banh-mi-xiu-mai',
    'banh-mi-bo-la-dua-cha-bong',
    'banh-mi-dac-biet',
    'banh-mi-nuong-muoi-ot',
    'banh-mi-bo-sot-vang',
  ];
  const rank = id => {
    const index = featuredOrder.indexOf(id);
    return index === -1 ? featuredOrder.length : index;
  };
  // Use the published menu, not stale browser-saved data. Unlisted dishes keep their relative order.
  const menu = seedMenu.filter(item => !item.hidden)
    .sort((a, b) => rank(a.id) - rank(b.id))
    .map(item => ({ ...item, code: itemCodes[item.id] }));

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
      const isChineseDescription = keepChineseIngredients.has(item.id);
      const description = isChineseDescription ? item.desc : (item.englishName || englishDescriptions[item.id]);
      const descriptionHtml = description
        ? `<p class="menu-card-desc"${isChineseDescription ? '' : ' lang="en"'}>${escapeHtml(description)}</p>`
        : '';
      const imageHtml = item.image
        ? `<img class="menu-card-img" src="${item.image}" alt="${item.name}" loading="lazy">`
        : '';
      return `
        <article class="menu-card${item.category === '飲品' ? ' menu-card-drink' : ''}" data-code="${item.code}">
          ${imageHtml}
          <div class="menu-card-body">
            <span class="menu-card-cat"><span class="menu-card-code">${item.code}</span>${item.category === '飲品' ? item.category : ''}</span>
            <strong class="menu-card-name">${item.name}</strong>
            ${descriptionHtml}
            <div class="price-stack" aria-label="${item.name} 價格">
              <p class="platform-price"><span>外賣平台參考價</span><strong>${money(item.price)}</strong></p>
              <p class="pickup-price"><span>電話落單 <em>自取價</em><small lang="en">Phone pickup</small></span><strong>${money(pickupPrice)}</strong></p>
            </div>
          </div>
        </article>`;
    }).join('');
  }

  const wholesaleLink = $('wholesaleLink');
  if (wholesaleLink) {
    wholesaleLink.addEventListener('click', () => {
      $('wholesale').open = true;
    });
  }

  renderTabs();
  renderMenu();
})();
