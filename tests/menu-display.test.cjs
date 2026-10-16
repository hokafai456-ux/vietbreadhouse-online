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
  vm.runInNewContext(source, { document: { getElementById: id => nodes[id] } });
  return { nodes, source };
}

function names(html) {
  return [...html.matchAll(/class="menu-card-name">([^<]+)</g)].map(match => match[1]);
}

for (const relativePath of ['js/order-app.js', 'public/js/order-app.js']) {
  test(relativePath + ': featured order, hidden dish and category migration', () => {
    const { nodes, source } = render(relativePath);
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
  for (const file of ['index.html', 'js/order-app.js']) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), fs.readFileSync(path.join(root, 'public', file), 'utf8'));
  }
});

test('discount scope and rounding are explained together', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('不適用於外賣平台訂單，亦不能與平台優惠合併使用'));
  assert.ok(html.includes('七折後四捨五入至整數港元'));
});
