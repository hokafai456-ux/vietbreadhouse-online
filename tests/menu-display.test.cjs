const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const expectedFirstSeven = [
  '招牌荖葉牛肉卷扎肉法包',
  '叉燒法包',
  '肉丸叉燒法包',
  '法包屋・斑蘭牛油肉鬆',
  '招牌法包',
  '法包屋香辣烤法包',
  '越式香好紅酒牛腩配法包',
];
const approvedDrinkPrices = [
  ['無糖可樂', 15], ['可口可樂', 15], ['維他檸檬茶', 14],
  ['津路烏龍茶', 17], ['雀巢香滑咖啡', 16], ['雀巢美式醇黑咖啡（無糖）', 16],
  ['七喜', 15], ['雪碧', 15], ['鴻福堂雪梨海底椰', 18],
];

function render(relativePath) {
  const nodes = {
    catTabs: { innerHTML: '' }, menuGrid: { innerHTML: '' }, wholesale: { open: false },
    wholesaleLink: { addEventListener(type, callback) { this[type] = callback; } },
  };
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  vm.runInNewContext(source, { document: { getElementById: id => nodes[id] } });
  const select = category => nodes.catTabs.onclick({
    target: { closest: () => ({ dataset: { category } }) },
  });
  return { nodes, source, select };
}

function names(html) {
  return [...html.matchAll(/class="menu-card-name">([^<]+)</g)].map(match => match[1]);
}

function cards(html) {
  return html.split('<article').slice(1);
}

function codes(html) {
  return [...html.matchAll(/data-code="([^"]+)"/g)].map(match => match[1]);
}

for (const relativePath of ['js/order-app.js', 'public/js/order-app.js']) {
  test(relativePath + ': ordering, stable codes and hidden dish', () => {
    const { nodes, source, select } = render(relativePath);
    const all = names(nodes.menuGrid.innerHTML);
    const allCodes = codes(nodes.menuGrid.innerHTML);
    assert.deepEqual(all.slice(0, 7), expectedFirstSeven);
    assert.equal(all.length, 31);
    assert.equal(new Set(all).size, all.length);
    assert.equal(new Set(allCodes).size, allCodes.length);
    assert.deepEqual(allCodes.slice(0, 7), ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07']);
    assert.ok(!all.includes('大春卷乾撈米線'));
    assert.ok(!all.includes('燒雞法包'));
    assert.ok(source.includes("desc: '大春卷配米線及花生', hidden: true"));
    assert.ok(source.includes('"bun-cha-gio-lon": "C03"'));
    for (const removed of ['越式米卷', '湯麵', '法包配餐', '批發']) {
      assert.ok(!nodes.catTabs.innerHTML.includes(removed));
    }
    select('法包');
    assert.equal(names(nodes.menuGrid.innerHTML).length, 17);
    assert.deepEqual(codes(nodes.menuGrid.innerHTML), Array.from({ length: 17 }, (_, i) => 'A' + String(i + 1).padStart(2, '0')));
    select('小食');
    assert.deepEqual(names(nodes.menuGrid.innerHTML), ['越式扎肉拼盤', '越式炸春卷（三件）', '大蝦紙米卷']);
    assert.deepEqual(codes(nodes.menuGrid.innerHTML), ['B01', 'B02', 'B03']);
    select('米線');
    assert.deepEqual(names(nodes.menuGrid.innerHTML), ['香脆豬頸肉乾撈米線', '脆皮春卷乾撈米線']);
    assert.deepEqual(codes(nodes.menuGrid.innerHTML), ['C01', 'C02']);
    select('飲品');
    assert.deepEqual(names(nodes.menuGrid.innerHTML), approvedDrinkPrices.map(item => item[0]));
    assert.deepEqual(codes(nodes.menuGrid.innerHTML), Array.from({ length: 9 }, (_, i) => 'D' + String(i + 1).padStart(2, '0')));
    cards(nodes.menuGrid.innerHTML).forEach((card, i) => {
      assert.equal(Number(card.match(/class="platform-price">.*?<strong>HK\$(\d+)/s)[1]), approvedDrinkPrices[i][1]);
      assert.match(card, /<img class="menu-card-img" src="images\/drink-[^"]+-20261018\.(png|jpg)"/);
      assert.match(card, /class="menu-card-desc" lang="en">[^<]+</);
      assert.match(card, /class="menu-card-code">D\d{2}<\/span>飲品<\/span>/);
    });
    select('全部');
    assert.deepEqual(names(nodes.menuGrid.innerHTML), all);
    assert.deepEqual(codes(nodes.menuGrid.innerHTML), allCodes);
    for (const card of cards(nodes.menuGrid.innerHTML)) {
      const original = Number(card.match(/class="platform-price">.*?<strong>HK\$(\d+)/s)[1]);
      const pickup = Number(card.match(/class="pickup-price">.*?<strong>HK\$(\d+)/s)[1]);
      assert.equal(pickup, Math.round(original * 0.7));
      const image = card.match(/src="([^"]+)"/);
      if (image) {
        assert.ok(fs.existsSync(path.join(root, image[1])));
        assert.ok(fs.existsSync(path.join(root, 'public', image[1])));
        assert.deepEqual(fs.readFileSync(path.join(root, image[1])), fs.readFileSync(path.join(root, 'public', image[1])));
      }
      assert.ok(image, 'Every visible item has an image');
      if (!card.includes('data-code="D')) assert.match(card, /class="menu-card-code">[ABC]\d{2}<\/span><\/span>/);
    }
  });

  test(relativePath + ': simplified text and four approved Chinese ingredient lists', () => {
    const { nodes } = render(relativePath);
    const html = nodes.menuGrid.innerHTML;
    for (const removed of ['lang="vi"', 'menu-localization', 'menu-card-name-translation', 'Platform reference', 'Giá trên ứng dụng', 'Gọi món']) {
      assert.ok(!html.includes(removed));
    }
    assert.equal((html.match(/class="menu-card-desc" lang="en"/g) || []).length, 27);
    const first = cards(html)[0];
    assert.ok(first.includes('Betel-leaf beef rolls and Vietnamese pork sausage'));
    assert.ok(!first.includes('荖葉牛肉卷、扎肉配法包'));
    const retained = [
      ['招牌越式三寶法包', '燒肉、水晶蹄、越式扎肉'],
      ['越式傳統法包', '水晶蹄、雙拼扎肉、豬肉鬆'],
      ['越式雜錦太陽蛋配法包', '巴地、香腸、扎肉、太陽蛋及法包'],
      ['傳統法包', '扎肉、豬肉'],
    ];
    for (const [name, description] of retained) {
      const card = cards(html).find(item => names('<article' + item)[0] === name);
      assert.ok(card.includes('<p class="menu-card-desc">' + description + '</p>'));
      assert.ok(!card.includes('class="menu-card-desc" lang="en"'));
    }
    assert.equal((html.match(/Phone pickup/g) || []).length, 31);
    assert.ok(!html.includes('扎肉、豬肉、醃菜及青瓜絲'));
    for (const privateTerm of ['成本', '利潤', '入貨', '套餐加配']) assert.ok(!html.includes(privateTerm));
    const pandan = cards(html).find(item => item.includes('法包屋・斑蘭牛油肉鬆'));
    assert.ok(pandan.includes('HK$62'));
    assert.ok(pandan.includes('HK$43'));
  });
}

test('root and public sources stay identical', () => {
  for (const file of ['index.html', 'js/order-app.js', 'css/style.css']) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), fs.readFileSync(path.join(root, 'public', file), 'utf8'));
  }
});

test('social links stay correct and prominent at the bottom', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/class="social-card"/g) || []).length, 1);
  assert.ok(html.indexOf('class="social-card"') > html.indexOf('class="contact-card"'));
  assert.ok(html.indexOf('class="social-card"') < html.indexOf('</main>'));
  assert.ok(html.includes('https://www.facebook.com/profile.php?id=61575582120326'));
  assert.ok(html.includes('https://www.instagram.com/vietbreadhouse.hk/'));
  assert.ok(html.includes('class="social-link social-facebook"'));
  assert.ok(html.includes('class="social-link social-instagram"'));
});

test('discount and phone-first ordering remain, without old translation scripts', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('不適用於外賣平台訂單，亦不能與平台優惠合併使用'));
  assert.ok(html.includes('七折後四捨五入至整數港元'));
  assert.ok(!html.includes('網站暫不提供網上落單及付款'));
  assert.ok(html.includes('電話落單・到店自取'));
  for (const removed of ['js/menu-translations.js', 'lang="vi"', 'offer-translation', 'menu-intro-translation', 'menu-languages', 'language-switch']) assert.ok(!html.includes(removed));
});

test('location is above categories and WhatsApp is secondary with collapsed terms', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const offer = html.match(/<details class="offer-details"[\s\S]*?<\/details>/)[0];
  assert.ok(!/<details[^>]*\bopen(?:\s|=|>)/.test(offer));
  assert.ok(offer.includes('<summary>優惠詳情</summary>'));
  assert.ok(offer.includes('不適用於外賣平台訂單'));
  assert.ok(offer.includes('四捨五入'));
  assert.ok(html.indexOf('class="store-location"') < html.indexOf('id="catTabs"'));
  assert.equal((html.match(/H座1樓H08室/g) || []).length, 1);
  assert.ok(html.includes('11:00–19:00'));
  assert.ok(html.includes('https://wa.me/85254888239'));
  const hero = html.match(/<section class="hero"[\s\S]*?<\/section>/)[0];
  const contact = html.match(/<section class="contact-card"[\s\S]*?<\/section>/)[0];
  assert.ok(!hero.includes('wa.me'));
  assert.ok(contact.includes('https://wa.me/85254888239'));
  assert.ok(contact.includes('class="back-to-menu" href="#menu">↑ 返回餐牌</a>'));
  assert.ok(!contact.includes('tel:'));
  assert.ok(html.indexOf('class="contact-card"') > html.indexOf('id="menuGrid"'));
  assert.ok(html.includes('收到訊息後，我們會盡快回覆確認；如趕時間，歡迎直接致電。'));
  assert.ok(html.includes('https://www.google.com/maps/dir/?api=1&amp;destination='));
  assert.ok(!html.includes('<iframe'));
  assert.ok(!html.includes('hero-copy'));
});

test('bread wholesale is collapsed by default and catering is removed', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal((html.match(/id="wholesale"/g) || []).length, 1);
  assert.ok(!html.includes('wholesale-shortcut'));
  const section = html.match(/<details class="wholesale-card"[\s\S]*?<\/details>/)[0];
  assert.ok(!/<details[^>]*\bopen(?:\s|=|>)/.test(section));
  assert.match(section, /<summary>[\s\S]*麵包批發[\s\S]*<\/summary>/);
  assert.match(section, /class="return-menu" href="#menu">↑ 返回餐牌<\/a>/);
  assert.ok(section.includes('麵包批發'));
  assert.ok(!html.includes('到會'));
  assert.ok(!html.includes('餐牌列有外賣平台參考價及電話落單自取優惠價'));
  assert.ok(section.includes('所需數量及取貨日期'));
  assert.ok(section.includes('href="tel:+85254888239"'));
  assert.ok(section.includes('href="tel:+85298350364"'));
  assert.ok(!/HK\$|Keeta|七折|最低訂量/.test(section));
  assert.ok(html.indexOf('id="wholesale"') > html.indexOf('id="menuGrid"'));
  assert.ok(html.indexOf('id="wholesale"') < html.indexOf('class="contact-card"'));
  const { nodes } = render('js/order-app.js');
  assert.ok(!nodes.menuGrid.innerHTML.includes('data-code="E'));
  assert.equal(nodes.wholesale.open, false);
  nodes.wholesaleLink.click();
  assert.equal(nodes.wholesale.open, true);
});

test('header phone link is removed while hero phone remains primary', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const header = html.match(/<header[\s\S]*?<\/header>/)[0];
  assert.ok(!header.includes('tel:'));
  assert.ok(header.includes('class="header-links"'));
  assert.ok(header.includes('class="whatsapp-top" href="#whatsapp-inquiry"'));
  assert.ok(!header.includes('wa.me'));
  assert.ok(html.includes('class="contact-card" id="whatsapp-inquiry"'));
  assert.ok(!header.includes('WhatsApp 落單'));
  assert.match(header, /id="wholesaleLink" href="#wholesale" aria-controls="wholesale">批發查詢<\/a>/);
  assert.ok(!html.includes('call-top'));
  assert.match(html, /class="call-hero" href="tel:\+85254888239"/);
  assert.ok(!html.includes('class="call-main"'));
});
