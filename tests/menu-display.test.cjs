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

function render(relativePath) {
  const nodes = { catTabs: { innerHTML: '' }, menuGrid: { innerHTML: '' } };
  const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
  const context = vm.createContext({ document: { getElementById: id => nodes[id] } });
  const translationFile = path.join(root, path.dirname(relativePath), 'menu-translations.js');
  vm.runInContext(fs.readFileSync(translationFile, 'utf8'), context);
  vm.runInContext(source, context);
  return { nodes, source, translations: context.VBH_MENU_TRANSLATIONS };
}

function names(html) {
  return [...html.matchAll(/class="menu-card-name">([^<]+)</g)].map(match => match[1]);
}

for (const relativePath of ['js/order-app.js', 'public/js/order-app.js']) {
  test(relativePath + ': featured order, hidden dish and category migration', () => {
    const { nodes, source, translations } = render(relativePath);
    const all = names(nodes.menuGrid.innerHTML);
    assert.deepEqual(all.slice(0, 7), expectedFirstSeven);
    assert.equal(all.length, 22);
    assert.equal(new Set(all).size, all.length);
    assert.ok(!all.includes('大春卷乾撈米線'));
    assert.ok(!all.includes('燒雞法包'));
    assert.ok(source.includes("desc: '大春卷配米線及花生', hidden: true"));
    assert.ok(!nodes.catTabs.innerHTML.includes('越式米卷'));
    assert.ok(!nodes.catTabs.innerHTML.includes('湯麵'));
    assert.ok(!nodes.catTabs.innerHTML.includes('法包配餐'));
    nodes.catTabs.onclick({ target: { closest: () => ({ dataset: { category: '法包' } }) } });
    for (const name of ['越式香好紅酒牛腩配法包', '越式牛扒配法包', '越式雜錦太陽蛋配法包']) {
      assert.ok(names(nodes.menuGrid.innerHTML).includes(name));
    }
    nodes.catTabs.onclick({ target: { closest: () => ({ dataset: { category: '小食' } }) } });
    assert.deepEqual(names(nodes.menuGrid.innerHTML), ['越式扎肉拼盤', '越式炸春卷（三件）', '大蝦紙米卷']);
    nodes.catTabs.onclick({ target: { closest: () => ({ dataset: { category: '乾撈米線' } }) } });
    assert.deepEqual(names(nodes.menuGrid.innerHTML), ['香脆豬頸肉乾撈米線', '脆皮春卷乾撈米線']);
    nodes.catTabs.onclick({ target: { closest: () => ({ dataset: { category: '全部' } }) } });
    assert.deepEqual(names(nodes.menuGrid.innerHTML), all);
    assert.equal((nodes.menuGrid.innerHTML.match(/class="menu-localization" lang="vi"/g) || []).length, all.length);
    assert.equal((nodes.menuGrid.innerHTML.match(/class="menu-localization" lang="en"/g) || []).length, all.length);
    for (const match of source.matchAll(/\{ id: '([^']+)'/g)) {
      const translated = translations[match[1]];
      assert.ok(translated, 'Missing translation for ' + match[1]);
      for (const field of ['vi', 'en', 'viDesc', 'enDesc']) {
        assert.ok(typeof translated[field] === 'string' && translated[field].trim().length > 0);
      }
    }
    for (const card of nodes.menuGrid.innerHTML.split('<article').slice(1)) {
      const original = Number(card.match(/class="platform-price">.*?<strong>HK\$(\d+)/s)[1]);
      const pickup = Number(card.match(/class="pickup-price">.*?<strong>HK\$(\d+)/s)[1]);
      assert.equal(pickup, Math.round(original * 0.7));
      const image = card.match(/src="([^"]+)"/)[1];
      assert.ok(fs.existsSync(path.join(root, image)));
      assert.ok(fs.existsSync(path.join(root, 'public', image)));
    }
  });
}

test('root and public sources stay identical', () => {
  for (const file of ['index.html', 'js/order-app.js', 'js/menu-translations.js', 'css/style.css']) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), fs.readFileSync(path.join(root, 'public', file), 'utf8'));
  }
});

test('owner Vietnamese wording and approved ingredients and prices are retained', () => {
  const { nodes, translations, source } = render('js/order-app.js');
  const ownerNames = {
    'banh-mi-cha-ca': 'Bánh mì chả cá',
    'banh-mi-cha-thit-nuong': 'Bánh mì chả thịt nướng',
    'banh-mi-bo-bit-tet': 'Bánh mì bò bít tết',
    'banh-mi-thit-nuong-jambon': 'Bánh mì thịt nướng jambon',
    'banh-mi-gio-cha-jambon': 'Bánh mì thập cẩm giò chả jambon',
    'banh-mi-nuong-muoi-ot': 'Bánh mì nướng muối ớt',
    'banh-mi-bate-gio-thit-nuong': 'Bánh mì batê giò thịt nướng',
    'banh-mi-bo-la-dua-cha-bong': 'Bánh mì đặc biệt sốt bơ lá dứa chà bông',
    'banh-mi-bo-sot-vang': 'Bánh mì bò sốt vang',
  };
  for (const [id, name] of Object.entries(ownerNames)) assert.equal(translations[id].vi, name);
  assert.ok(source.includes("name: '越式香好紅酒牛腩配法包'"));
  assert.ok(nodes.menuGrid.innerHTML.includes('扎肉、豬肉、醃菜及青瓜絲'));
  assert.ok(nodes.menuGrid.innerHTML.includes('巴地、香腸、扎肉、太陽蛋及法包'));
  const pandan = nodes.menuGrid.innerHTML.split('<article').find(card => card.includes('法包屋・斑蘭牛油肉鬆'));
  assert.ok(pandan.includes('HK$62'));
  assert.ok(pandan.includes('HK$43'));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.indexOf('js/menu-translations.js') < html.indexOf('js/order-app.js'));
  assert.ok(!html.includes('language-switch'));
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

test('discount scope and rounding are explained together', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('不適用於外賣平台訂單，亦不能與平台優惠合併使用'));
  assert.ok(html.includes('七折後四捨五入至整數港元'));
});
