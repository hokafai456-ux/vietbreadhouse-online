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

test('Vietnamese page: every card labels its unchanged paid price, and the visible note says the discount is included', async () => {
  const menu = JSON.parse(fs.readFileSync(path.join(root, 'vi/menu.json'), 'utf8'));
  const source = fs.readFileSync(path.join(root, 'js/order-app.js'), 'utf8');
  const original = vm.runInNewContext(source.match(/const seedMenu = (\[[\s\S]*?\n  \]);/)[1]);
  const nodes = { menuGrid: { innerHTML: '' }, catTabs: { innerHTML: '', addEventListener() {} }, wholesaleLink: { addEventListener() {} }, wholesale: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'vi/js/menu.js'), 'utf8'), {
    document: { getElementById: id => nodes[id] }, CSS: { escape: value => value },
    fetch: async () => ({ ok: true, json: async () => menu }),
  });
  await new Promise(resolve => setImmediate(resolve));
  const cards = nodes.menuGrid.innerHTML.split('<article').slice(1);
  assert.equal(cards.length, 32);
  for (const card of cards) {
    const code = card.match(/data-code="([^"]+)"/)[1];
    const item = menu.find(entry => entry.code === code);
    // Already the paid price: equal to one 0.7 discount of the comparison price, and displayed as-is.
    assert.equal(item.price, Math.round(original.find(entry => entry.id === item.id).price * 0.7), code);
    assert.ok(card.includes(`<span class="price-label">Giá tự lấy thực trả</span><p class="menu-price"><strong>$${item.price}</strong><span class="price-included">Đã gồm ưu đãi</span></p>`), code);
    assert.equal((card.match(/\$\d+/g) || []).length, 2, code + ': one price, also in the aria-label');
  }
  for (const [code, [, pickup]] of Object.entries(keeta)) assert.equal(menu.find(item => item.code === code).price, pickup, code);
  const html = fs.readFileSync(path.join(root, 'vi/index.html'), 'utf8');
  const note = html.match(/<section class="price-note"[\s\S]*?<\/section>/)[0];
  assert.ok(html.indexOf('class="price-note"') < html.indexOf('id="menuGrid"'), 'note is above the menu');
  assert.ok(!/<details/.test(note), 'note is not collapsed');
  assert.ok(note.includes('Giá niêm yết là giá thực trả khi tự đến lấy, đã gồm ưu đãi giảm 30% cho đơn gọi điện đặt trước.'));
  const a09 = menu.find(item => item.code === 'A09').price;
  assert.ok(note.includes(`món A09 giá <b>$${a09}</b> là số tiền bạn trả, đã gồm ưu đãi, không giảm thêm 30%`));
  assert.ok(note.includes('không áp dụng cho đơn qua ứng dụng giao đồ ăn'));
  const meta = name => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]+)"`))[1];
  assert.match(meta('description'), /giá thực trả/);
  assert.equal(meta('og:url'), 'https://vietbreadhouse.hk/vi/');
  assert.equal(meta('og:locale'), 'vi_VN');
  assert.ok(meta('og:description').includes(`A09 trả $${a09}, không giảm thêm`));
  const tags = [...html.matchAll(/<meta property="(og:[^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(tags).size, tags.length, 'no duplicated og tag');
  // Shares the Chinese image: same file and declared size as the Chinese homepage.
  const zh = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const name of ['og:image', 'og:image:width', 'og:image:height', 'og:image:type']) assert.equal(meta(name), zh.match(new RegExp(`<meta property="${name}" content="([^"]+)"`))[1]);
  assert.ok(fs.existsSync(path.join(root, meta('og:image').replace('https://vietbreadhouse.hk/', ''))));
  assert.match(meta('og:image:alt'), /tiếng Trung/);
  for (const file of ['vi/index.html', 'vi/js/menu.js', 'vi/css/style.css']) assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), fs.readFileSync(path.join(root, 'public', file), 'utf8'));
});

test('share preview image: each og tag once, image deployed in both copies and matches its declared size and prices', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.equal(html, fs.readFileSync(path.join(root, 'public/index.html'), 'utf8'));
  const tags = [...html.matchAll(/<meta property="(og:[^"]+)" content="([^"]*)">/g)].map(match => [match[1], match[2]]);
  assert.equal(new Set(tags.map(([name]) => name)).size, tags.length, 'no duplicated og tag');
  const og = Object.fromEntries(tags);
  const prefix = 'https://vietbreadhouse.hk/';
  assert.ok(og['og:image'].startsWith(prefix));
  const relative = og['og:image'].slice(prefix.length);
  const image = fs.readFileSync(path.join(root, relative));
  assert.deepEqual(image, fs.readFileSync(path.join(root, 'public', relative)));
  // Read the JPEG frame header (SOF0/SOF2) for the real pixel size.
  assert.equal(image.readUInt16BE(0), 0xffd8);
  let offset = 2, size;
  while (offset < image.length) {
    const marker = image.readUInt16BE(offset);
    if (marker === 0xffc0 || marker === 0xffc2) { size = [image.readUInt16BE(offset + 7), image.readUInt16BE(offset + 5)]; break; }
    offset += 2 + image.readUInt16BE(offset + 2);
  }
  assert.deepEqual(size, [Number(og['og:image:width']), Number(og['og:image:height'])]);
  assert.deepEqual(size, [1200, 630]);
  assert.equal(og['og:image:type'], 'image/jpeg');
  assert.ok(image.length < 1024 * 1024);
  const a09 = renderAll('js/order-app.js').find(card => card.includes('data-code="A09"'));
  const pickup = a09.match(/<span class="pickup-amount"><strong>HK\$(\d+)/)[1];
  const platform = a09.match(/外賣平台售價<\/span><strong>HK\$(\d+)/)[1];
  assert.ok(og['og:image:alt'].includes(`自取實付 $${pickup}`) && og['og:image:alt'].includes(`外賣平台售價 $${platform}`));
  assert.ok(og['og:image:alt'].includes('已計七折優惠'));
});
