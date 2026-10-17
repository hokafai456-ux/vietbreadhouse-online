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
  ['無糖可樂', 15], ['可口可樂', 15], ['檸檬茶', 14],
  ['烏龍茶', 17], ['香滑咖啡', 16], ['無糖咖啡', 16],
  ['七喜', 15], ['雪碧', 15], ['雪梨海底椰', 18],
];

function render(relativePath) {
  const nodes = { catTabs: { innerHTML: '' }, menuGrid: { innerHTML: '' } };
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
      assert.ok(!card.includes('<img'), 'Do not invent drink photos or pack sizes');
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
      } else {
        assert.match(card, /data-code="D\d{2}"/);
      }
    }
  });

  test(relativePath + ': simplified text and four approved Chinese ingredient lists', () => {
    const { nodes } = render(relativePath);
    const html = nodes.menuGrid.innerHTML;
    for (const removed of ['lang="vi"', 'menu-localization', 'menu-card-name-translation', 'Platform reference', 'Giá trên ứng dụng', 'Gọi món']) {
      assert.ok(!html.includes(removed));
    }
    assert.equal((html.match(/class="menu-card-desc" lang="en"/g) || []).length, 18);
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

test('discount and phone-only ordering remain, without old translation scripts', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('不適用於外賣平台訂單，亦不能與平台優惠合併使用'));
  assert.ok(html.includes('七折後四捨五入至整數港元'));
  assert.ok(html.includes('網站暫不提供網上落單及付款'));
  assert.ok(html.includes('Phone pickup'));
  for (const removed of ['js/menu-translations.js', 'lang="vi"', 'offer-translation', 'menu-intro-translation', 'menu-languages', 'language-switch']) assert.ok(!html.includes(removed));
});
