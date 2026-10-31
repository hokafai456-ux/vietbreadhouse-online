const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
// Keeta上架資料 20261031 (comparison price) and the owner-approved pickup price, for the eight poster items.
const keeta = { A01: [78, 55], A02: [68, 48], A03: [68, 48], A04: [62, 43], A06: [72, 50], A07: [68, 48], A08: [72, 50], A09: [78, 55] };

function renderAll(relativePath) {
  const nodes = {
    catTabs: { innerHTML: '' }, menuGrid: { innerHTML: '' }, wholesale: { open: false },
    wholesaleLink: { addEventListener() {} },
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, relativePath), 'utf8'), { document: { getElementById: id => nodes[id] } });
  return nodes.menuGrid.innerHTML.split('<article').slice(1);
}

for (const relativePath of ['js/order-app.js', 'public/js/order-app.js']) {
  test(relativePath + ': every card shows the paid pickup price first, with 已計優惠 beside it, discounted once', () => {
    const cards = renderAll(relativePath);
    assert.equal(cards.length, 32);
    for (const card of cards) {
      const code = card.match(/data-code="([^"]+)"/)[1];
      const amount = card.match(/<span class="pickup-amount"><strong>HK\$(\d+)<\/strong><b class="price-included">已計優惠<\/b><\/span>/);
      assert.ok(amount, code + ': 已計優惠 must sit directly after the paid amount');
      const platform = Number(card.match(/class="platform-price"><span>外賣平台售價<\/span><strong>HK\$(\d+)/)[1]);
      const pickup = Number(amount[1]);
      // One discount only: comparison price x 0.7, rounded; never a second 0.7 on an already-discounted price.
      assert.equal(pickup, Math.round(platform * 0.7), code);
      assert.notEqual(pickup, Math.round(Math.round(platform * 0.7) * 0.7), code);
      assert.ok(card.indexOf('class="pickup-price"') < card.indexOf('class="platform-price"'), code + ': paid price is read first');
      assert.match(card, /<span class="pickup-label">自取實付價/);
      assert.match(card, new RegExp(`aria-label="[^"]*自取實付 HK\\$${pickup}，已計七折優惠；外賣平台售價 HK\\$${platform}"`));
      for (const old of ['外賣平台參考價', '<em>自取價</em>', '-30%']) assert.ok(!card.includes(old), code + ' still has ' + old);
      if (keeta[code]) assert.deepEqual([platform, pickup], keeta[code], code + ' differs from Keeta上架資料');
    }
  });
}

test('homepage: no stand-alone 七折; the visible offer and share text say the price is already discounted', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const offer = html.match(/<section class="offer"[\s\S]*?<\/section>/)[0];
  const visible = offer.replace(/<details[\s\S]*?<\/details>/, '');
  const badge = offer.match(/<span class="offer-badge"[^>]*>([\s\S]*?)<\/span>/)[1];
  assert.ok(!badge.includes('七折'), 'badge must not be a bare 七折');
  assert.ok(visible.includes('餐牌所列自取價，已是電話預約自取七折後實付價。'));
  assert.ok(visible.includes('已計優惠，不再另打七折'));
  // The example amount outside the collapsed details must match the real A09 card.
  const a09 = renderAll('js/order-app.js').find(card => card.includes('data-code="A09"'));
  const a09Pickup = a09.match(/<span class="pickup-amount"><strong>(HK\$\d+)/)[1];
  assert.ok(visible.includes(`招牌越式三寶法包　自取實付 <b>${a09Pickup}</b>`));
  assert.ok(!html.includes('享七折'));
  assert.ok(!html.includes('-30%'));
  const meta = name => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]+)"`))[1];
  assert.match(meta('description'), /七折後實付價/);
  assert.match(meta('og:description'), /七折後實付價/);
  assert.match(meta('og:description'), /不再另打七折/);
  assert.equal(meta('og:url'), 'https://vietbreadhouse.hk/');
  for (const name of ['og:title', 'og:type', 'og:site_name']) assert.ok(meta(name));
});

test('Vietnamese page still shows one paid price only and mentions no discount to stack', () => {
  const html = fs.readFileSync(path.join(root, 'vi/index.html'), 'utf8');
  const menu = JSON.parse(fs.readFileSync(path.join(root, 'vi/menu.json'), 'utf8'));
  assert.ok(!/30%|giảm|七折/i.test(html));
  for (const [code, [, pickup]] of Object.entries(keeta)) assert.equal(menu.find(item => item.code === code).price, pickup, code);
});
