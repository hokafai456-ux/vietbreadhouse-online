const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const menu=JSON.parse(fs.readFileSync(path.join(root,'vi/menu.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'js/order-app.js'),'utf8');
const original=vm.runInNewContext(source.match(/const seedMenu = (\[[\s\S]*?\n  \]);/)[1]);
test('Vietnamese subsite contains all 37 visible items with one numeric price',()=>{
 assert.equal(menu.length,37);
 assert.deepEqual(menu.map(x=>x.code),['A','B','C','D'].flatMap((c,i)=>Array.from({length:[17,4,7,9][i]},(_,j)=>c+String(j+1).padStart(2,'0'))));
 for(const item of menu){
  const match=original.find(x=>x.id===item.id);
  assert.ok(match&&!match.hidden);
  assert.equal(item.price,Math.round(match.price*0.7));
  assert.ok(!/[\u3400-\u9fff]/u.test(item.name+item.description));
  assert.ok(!Object.hasOwn(item,'originalPrice'));
  assert.ok(fs.existsSync(path.join(root,'vi',item.image)));
 }
 const html=fs.readFileSync(path.join(root,'vi/index.html'),'utf8');
 const js=fs.readFileSync(path.join(root,'vi/js/menu.js'),'utf8');
 assert.match(html,/<html lang="vi">/);
 assert.ok(!/[\u3400-\u9fff]/u.test(html+js));
 for(const term of ['Phone pickup','Platform reference','70%','30%','platform-price','pickup-price'])assert.ok(!(html+js).includes(term));
 assert.ok(html.includes('menu-a4.pdf'));
 assert.ok(html.includes('tel:+85254888239'));
 assert.ok(js.includes("fetch('menu.json')"));
 assert.equal(fs.readFileSync(path.join(root,'CNAME'),'utf8').trim(),'vietbreadhouse.hk');
});
test('Vietnamese deployment mirrors every static file and includes printable A4 PDF',()=>{
 const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(directory,entry.name)):[path.join(directory,entry.name)]);
 const files=walk(path.join(root,'vi'));
 assert.equal(files.length,42);
 for(const file of files){assert.deepEqual(fs.readFileSync(file),fs.readFileSync(path.join(root,'public',path.relative(root,file))));}
 assert.equal(fs.readFileSync(path.join(root,'vi/menu-a4.pdf')).subarray(0,4).toString(),'%PDF');
});
