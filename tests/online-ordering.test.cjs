const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const API = 'https://vietbreadhouse-ordering.pages.dev';

for (const page of ['index.html', 'vi/index.html']) {
  test(`${page}: ordering is on the page itself, with no button that jumps to another site`, () => {
    const html = read(page);
    assert.equal((html.match(/<div id="vbh-ordering-root"><\/div>/g) || []).length, 1);
    assert.match(html, /<link rel="stylesheet" href="\/ordering-assets\/ordering-addon\.css\?v=\d{8,10}">/);
    assert.match(html, /<script defer src="\/ordering-assets\/ordering-addon\.js\?v=\d{8,10}"><\/script>/);
    assert.ok(html.indexOf('id="menuGrid"') < html.indexOf('id="vbh-ordering-root"'), 'add-on loads after the original menu');
    assert.ok(!html.includes(API), 'no link to the separate ordering site');
    assert.ok(!html.includes('order-online'), 'old jump button removed');
    assert.ok(!html.includes('wa.me/85254888239'), 'WhatsApp only on 9835 0364');
    assert.ok(html.includes(page === 'index.html' ? '網上落單後，請致電 5488 8239 或 WhatsApp 9835 0364 報上訂單號確認；確認後一般約 10 分鐘可取餐，到店付款。' : 'vui lòng gọi 5488 8239 hoặc nhắn WhatsApp 9835 0364 kèm mã đơn để xác nhận'), 'after-order contact line');
    assert.equal(html, read(path.join('public', page)));
  });
}

test('ordering add-on is deployed in both copies and sends API calls to the Cloudflare backend only from vietbreadhouse.hk', () => {
  for (const file of ['ordering-assets/ordering-addon.js', 'ordering-assets/ordering-addon.css', '404.html', 'THIRD_PARTY_NOTICES.txt']) {
    assert.deepEqual(fs.readFileSync(path.join(root, file)), fs.readFileSync(path.join(root, 'public', file)), file);
  }
  const js = read('ordering-assets/ordering-addon.js');
  assert.ok(js.includes(API));
  assert.ok(js.includes('vietbreadhouse.hk') && js.includes('www.vietbreadhouse.hk'));
  assert.ok(!/OWNER_KEY|token_hash|\.dev\.vars/.test(js), 'no secrets in the public bundle');
});

test('order status links (/order/<id>) open the ordering shell; other unknown paths go back to the menu', () => {
  const html = read('404.html');
  assert.ok(html.includes('id="vbh-ordering-root"'));
  assert.match(html, /<script defer src="\/ordering-assets\/ordering-addon\.js\?v=\d{8,10}"><\/script>/);
  const guard = html.match(/<script>if\(!new RegExp\("([^"]+)"\)\.test\(location\.pathname\)\)location\.replace\("\/"\);<\/script>/);
  assert.ok(guard, 'redirect guard present');
  const pattern = new RegExp(guard[1]);
  assert.ok(pattern.test('/order/123e4567-e89b-12d3-a456-426614174000'));
  for (const other of ['/admin', '/menu', '/order/abc', '/vi/x']) assert.ok(!pattern.test(other), other);
});
