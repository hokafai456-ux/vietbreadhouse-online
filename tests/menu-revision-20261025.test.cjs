const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/order-app.js'), 'utf8');
const seed = Array.from(vm.runInNewContext(source.match(/const seedMenu = (\[[\s\S]*?\n  \]);/)[1]));
const codes = vm.runInNewContext('(' + source.match(/const itemCodes = ({[\s\S]*?\n  });/)[1] + ')');
const active = seed.filter(x => !x.hidden).sort((a,b) => codes[a.id].localeCompare(codes[b.id]));
const removed = ['banh-mi-nuong-muoi-ot','banh-mi-bo-sot-vang','banh-mi-bo-bit-tet','banh-mi-trung-op-la','goi-cuon-tom'];

test('owner removals use stable product IDs and no gaps in current public codes', () => {
  assert.equal(active.length, 32);
  for (const id of removed) assert.ok(!active.some(x => x.id === id));
  assert.deepEqual(active.map(x => codes[x.id]), ['A','B','C','D'].flatMap((prefix,i) => Array.from({length:[13,3,7,9][i]}, (_,j) => prefix+String(j+1).padStart(2,'0'))));
  assert.ok(seed.find(x => x.id === 'bun-cha-gio-lon').hidden);
});

test('requested names and A12 recipe are attached to the original products after renumbering', () => {
  const expected = [
    ['banh-mi-xa-xiu','A02','水晶蹄叉燒法包',68],
    ['banh-mi-xiu-mai','A03','蕃茄肉丸叉燒法包',68],
    ['banh-mi-bo-la-dua-cha-bong','A04','法包屋・斑蘭牛油肉鬆法包',62],
    ['banh-mi-dac-biet','A05','招牌法包',78],
    ['banh-mi-la-lot','A06','越式荖葉牛肉卷法包',72],
    ['banh-mi-cha-thit-nuong','A08','扎肉烤肉丸雙拼法包',72],
    ['banh-mi-thit-nuong-jambon','A09','招牌越式三寶法包',78],
    ['banh-mi-gio-cha-jambon','A10','越式扎肉三重奏法包',78],
  ];
  for (const [id,code,name,price] of expected) {
    const item = active.find(x => x.id === id);
    assert.equal(codes[id], code);
    assert.equal(item.name, name);
    assert.equal(item.price, price);
  }
  assert.equal(active.find(x => x.id === 'banh-mi-thit-nuong-jambon').desc, '燒烤肉丸、水晶蹄、越式扎肉');
  assert.equal(codes['shrimp-cake'], 'B03');
  assert.ok(active.filter(x => x.category === '法包').every(x => x.name.endsWith('法包')));
});

test('all language catalogs keep the same product identities and codes', () => {
  const vi = JSON.parse(fs.readFileSync(path.join(root, 'vi/menu.json'), 'utf8'));
  assert.deepEqual(vi.map(x => [x.id,x.code]), active.map(x => [x.id,codes[x.id]]));
  assert.equal(vi.find(x => x.code === 'A09').description, 'Thịt viên nướng, giò thủ và chả.');
  assert.ok(vi.find(x => x.code === 'A06').name.includes('bò'));
  assert.ok(vi.find(x => x.code === 'A08').name.includes('thịt viên nướng'));
});
