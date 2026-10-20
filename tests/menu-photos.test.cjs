const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
test('natural photos cover only the four approved dishes and retain source images',()=>{
 const source=fs.readFileSync(path.join(root,'js/order-app.js'),'utf8');
 const menu=vm.runInNewContext(source.match(/const seedMenu = (\[[\s\S]*?\n  \]);/)[1]);
 const ids=['banh-mi-xa-xiu','bun-xa-xiu-kho','bun-gio-cha','bun-gio'];
 const changed=Array.from(menu).filter(x=>x.image.includes('-natural-20261020'));
 assert.equal(changed.length,4);
 assert.deepEqual(changed.map(x=>x.id).sort(),ids.sort());
 for(const item of changed){
  const local=fs.readFileSync(path.join(root,item.image));
  assert.ok(local.length<400000,'Web photo stays below 400KB: '+item.id);
  assert.deepEqual(local,fs.readFileSync(path.join(root,'public',item.image)));
 }
 for(const original of ['banh-mi-bo-la-lot-cha-20261016.jpg','banh-mi-xa-xiu.jpg','banh-mi-xiu-mai.jpg','banh-mi-dac-biet.jpg','spring-roll-two-20261019.png','shrimp-cake-three-20261019.jpg','bun-grilled-meatball-20261019.png','bun-spring-roll-20261019.jpg','bun-la-lot-20261019.png','bun-fish-cake-20261019.jpg','bun-double-sausage-20261019.jpg','bun-pork-sausage-20261019.png','bun-shrimp-cake-20261019.jpg']){
  assert.ok(fs.existsSync(path.join(root,'images',original)));
 }
 assert.ok(menu.filter(x=>x.category==='飲品').every(x=>!x.image.includes('natural')));
});
