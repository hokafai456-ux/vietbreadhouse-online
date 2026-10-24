(() => {
  'use strict';

  const seedMenu = [
    { id: 'banh-mi-bo-la-lot-cha', name: '招牌荖葉牛肉卷扎肉法包', category: '法包', price: 78, image: 'images/banh-mi-bo-la-lot-cha-20261016.jpg', desc: '荖葉牛肉卷、扎肉配法包' },
    { id: 'banh-mi-la-lot', name: '越式荖葉牛肉卷法包', category: '法包', price: 72, image: 'images/banh-mi-la-lot-20261016.png', desc: '越式荖葉牛肉卷配法包' },
    { id: 'banh-mi-cha-ca', name: '越式魚餅法包', category: '法包', price: 68, image: 'images/menu-new-01-20261016.jpg', desc: '越式魚餅配法包' },
    { id: 'banh-mi-cha-thit-nuong', name: '扎肉烤肉丸雙拼法包', category: '法包', price: 72, image: 'images/menu-new-02-20261016.png', desc: '扎肉、燒烤肉丸雙拼' },
    { id: 'banh-mi-thit-nuong-jambon', name: '招牌越式三寶法包', category: '法包', price: 78, image: 'images/menu-new-04-20261016.png', desc: '燒烤肉丸、水晶蹄、越式扎肉' },
    { id: 'banh-mi-gio-cha-jambon', name: '越式扎肉三重奏法包', category: '法包', price: 78, image: 'images/menu-new-05-20261016.png', desc: '水晶蹄、雙拼扎肉、豬肉鬆' },
    { id: 'banh-mi-gio-cha-ruoc', name: '雙款扎肉肉鬆越南法包', category: '法包', price: 76, image: 'images/menu-new-07-20261016.png', desc: '雙款扎肉、豬肉鬆' },
    { id: 'banh-mi-bate-gio-thit-nuong', name: '巴地燒肉扎肉越南法包', category: '法包', price: 78, image: 'images/menu-new-09-20261016.png', desc: '巴地、燒肉、扎肉' },
    { id: 'banh-mi-bo-la-dua-cha-bong', name: '法包屋・斑蘭牛油肉鬆法包', category: '法包', price: 62, image: 'images/menu-new-11-20261016.png', desc: '斑蘭牛油、肉鬆配法包' },
    { id: 'banh-mi-dac-biet', name: '招牌法包', category: '法包', price: 78, image: 'images/banh-mi-dac-biet.jpg', desc: '越式扎肉、肝醬、醃菜及芫荽' },
    { id: 'banh-mi-thap-cam', name: '傳統法包', category: '法包', price: 68, image: 'images/banh-mi-thap-cam.jpg', desc: '扎肉、豬肉' },
    { id: 'banh-mi-xiu-mai', name: '蕃茄肉丸叉燒法包', category: '法包', price: 68, image: 'images/banh-mi-xiu-mai.jpg', desc: '蕃茄肉丸、叉燒及越式醃菜' },
    { id: 'banh-mi-xa-xiu', name: '水晶蹄叉燒法包', category: '法包', price: 68, image: 'images/menu-a02-natural-20261020.jpg', desc: '水晶蹄、叉燒配越式醃菜及芫荽' },
    { id: 'cha-lua-plat', name: '越式扎肉拼盤', category: '小食', price: 68, image: 'images/cha-lua-platter-20261016-edited.png', desc: '越式扎肉切片拼盤' },
    { id: 'cha-gio', name: '越式炸春卷（兩件）', category: '小食', price: 48, image: 'images/spring-roll-two-20261019.png', desc: '香脆越式炸春卷，每份兩件' },
    { id: 'shrimp-cake', name: '蝦餅（三件）', category: '小食', price: 47, image: 'images/shrimp-cake-three-20261019.jpg', desc: '香脆蝦餅，每份三件' },
    { id: 'bun-xa-xiu-kho', name: '越式烤肉丸撈檬', vietnameseName: 'Trộn thịt viên nướng', category: '米線', price: 60, image: 'images/menu-c01-natural-20261020.jpg', desc: '越式烤肉丸拌米線' },
    { id: 'bun-cha-gio-lon', name: '大春卷乾撈米線', category: '米線', price: 60, image: 'images/bun-cha-gio-lon.jpg', desc: '大春卷配米線及花生', hidden: true },
    { id: 'bun-cha-gio', name: '越式春卷撈檬', category: '米線', price: 60, image: 'images/bun-spring-roll-20261019.jpg', desc: '越式炸春卷拌米線' },
    { id: 'bun-la-lot', name: '越式蒟葉牛肉卷撈檬', vietnameseName: 'Bún trộn chả lá lốt', category: '米線', price: 60, image: 'images/bun-la-lot-20261019.png', desc: '越式蒟葉牛肉卷拌米線' },
    { id: 'bun-cha-ca', name: '越式魚餅撈檬', vietnameseName: 'Bún trộn chả cá viên', category: '米線', price: 60, image: 'images/bun-fish-cake-20261019.jpg', desc: '越式魚餅拌米線' },
    { id: 'bun-gio-cha', name: '雙拼扎肉撈檬', vietnameseName: 'Bún trộn giò chả', category: '米線', price: 68, image: 'images/menu-c05-natural-20261020.jpg', desc: '雙款越式扎肉拌米線' },
    { id: 'bun-gio', name: '扎肉撈檬', vietnameseName: 'Bún trộn giò', category: '米線', price: 60, image: 'images/menu-c06-natural-20261020.jpg', desc: '越式扎肉拌米線' },
    { id: 'bun-shrimp-cake', name: '蝦餅撈檬', category: '米線', price: 68, image: 'images/bun-shrimp-cake-20261019.jpg', desc: '香脆蝦餅拌米線' },
    { id: 'drink-coke-zero', name: '無糖可樂', englishName: 'Coca-Cola No Sugar', category: '飲品', price: 15, image: 'images/drink-coke-zero-20261018.png' },
    { id: 'drink-coca-cola', name: '可口可樂', englishName: 'Coca-Cola', category: '飲品', price: 15, image: 'images/drink-coca-cola-20261018.png' },
    { id: 'drink-lemon-tea', name: '維他檸檬茶', englishName: 'VITA Lemon Tea', category: '飲品', price: 14, image: 'images/drink-vita-lemon-tea-20261018.jpg' },
    { id: 'drink-oolong-tea', name: '津路烏龍茶', englishName: 'Tsing Lo Oolong Tea', category: '飲品', price: 17, image: 'images/drink-tsing-lo-oolong-20261018.jpg' },
    { id: 'drink-smooth-coffee', name: '雀巢香滑咖啡', englishName: 'NESCAFÉ Regular Coffee', category: '飲品', price: 16, image: 'images/drink-smooth-coffee-20261018.png' },
    { id: 'drink-unsweetened-coffee', name: '雀巢美式醇黑咖啡（無糖）', englishName: 'NESCAFÉ Americano No Sugar', category: '飲品', price: 16, image: 'images/drink-unsweetened-coffee-20261018.png' },
    { id: 'drink-7up', name: '七喜', englishName: '7UP', category: '飲品', price: 15, image: 'images/drink-7up-20261018.jpg' },
    { id: 'drink-sprite', name: '雪碧', englishName: 'Sprite', category: '飲品', price: 15, image: 'images/drink-sprite-20261018.png' },
    { id: 'drink-pear-coconut', name: '鴻福堂雪梨海底椰', englishName: 'Hung Fook Tong Pear & Sea Coconut Drink', category: '飲品', price: 18, image: 'images/drink-pear-coconut-20261018.jpg' },
  ];

  const $ = id => document.getElementById(id);
  let activeCategory = '全部';
  // Consecutive public codes after the owner's 2026-10-25 removals.
  const itemCodes = {
    "banh-mi-bo-la-lot-cha": "A01",
    "banh-mi-xa-xiu": "A02",
    "banh-mi-xiu-mai": "A03",
    "banh-mi-bo-la-dua-cha-bong": "A04",
    "banh-mi-dac-biet": "A05",
    "banh-mi-la-lot": "A06",
    "banh-mi-cha-ca": "A07",
    "banh-mi-cha-thit-nuong": "A08",
    "banh-mi-thit-nuong-jambon": "A09",
    "banh-mi-gio-cha-jambon": "A10",
    "banh-mi-gio-cha-ruoc": "A11",
    "banh-mi-bate-gio-thit-nuong": "A12",
    "banh-mi-thap-cam": "A13",
    "cha-lua-plat": "B01",
    "cha-gio": "B02",
    "shrimp-cake": "B03",
    "bun-xa-xiu-kho": "C01",
    "bun-cha-gio": "C02",
    "bun-cha-gio-lon": "C08",
    "bun-la-lot": "C03",
    "bun-cha-ca": "C04",
    "bun-gio-cha": "C05",
    "bun-gio": "C06",
    "bun-shrimp-cake": "C07",
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
    "banh-mi-la-lot": "Vietnamese betel-leaf beef rolls in a baguette",
    "banh-mi-cha-ca": "Vietnamese fish cake in a baguette",
    "banh-mi-cha-thit-nuong": "Vietnamese pork sausage and grilled meatballs",
    "banh-mi-bo-bit-tet": "Vietnamese-style steak served with a baguette",
    "banh-mi-thit-nuong-jambon": "Grilled meatballs, jellied pork terrine and Vietnamese pork sausage",
    "banh-mi-gio-cha-jambon": "Jellied pork terrine, two pork sausages and pork floss",
    "banh-mi-gio-cha-ruoc": "Two Vietnamese pork sausages and pork floss",
    "banh-mi-nuong-muoi-ot": "Spicy grilled baguette",
    "banh-mi-bate-gio-thit-nuong": "Pâté, roast pork and Vietnamese pork sausage",
    "banh-mi-trung-op-la": "Pâté, sausage, Vietnamese pork sausage, sunny-side-up eggs and a baguette",
    "banh-mi-bo-la-dua-cha-bong": "Pandan butter and pork floss in a baguette",
    "banh-mi-dac-biet": "Vietnamese pork sausage, pâté, pickles and coriander",
    "banh-mi-thap-cam": "Vietnamese pork sausage, pork, pickles and shredded cucumber",
    "banh-mi-xiu-mai": "Tomato-sauce meatballs, char siu and Vietnamese pickles",
    "banh-mi-xa-xiu": "Jellied pork terrine and char siu with Vietnamese pickles and coriander",
    "cha-lua-plat": "A platter of sliced Vietnamese pork sausages",
    "cha-gio": "Crispy Vietnamese fried spring rolls, two per serving",
    "goi-cuon-tom": "Prawn rice paper rolls with fresh herbs",
    "shrimp-cake": "Crispy shrimp cakes, three per serving",
    "bun-xa-xiu-kho": "Rice vermicelli salad with Vietnamese grilled meatballs",
    "bun-cha-gio-lon": "Large spring roll with rice vermicelli and peanuts",
    "bun-cha-gio": "Rice vermicelli salad with Vietnamese spring rolls",
    "bun-la-lot": "Rice vermicelli salad with betel-leaf beef rolls",
    "bun-cha-ca": "Rice vermicelli salad with Vietnamese fish cakes",
    "bun-gio-cha": "Rice vermicelli salad with two Vietnamese pork sausages",
    "bun-gio": "Rice vermicelli salad with Vietnamese pork sausage",
    "bun-shrimp-cake": "Rice vermicelli salad with crispy shrimp cakes"
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

  // Product IDs stay unchanged; only public menu codes are compacted.
  const menu = seedMenu.filter(item => !item.hidden)
    .sort((a, b) => itemCodes[a.id].localeCompare(itemCodes[b.id]))
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
