(() => {
  'use strict';
  const categories=['Tất cả','Bánh mì','Món ăn kèm','Bún trộn','Đồ uống'];
  const grid=document.getElementById('menuGrid');
  const tabs=document.getElementById('catTabs');
  let menu=[];
  let active='Tất cả';
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(){
    tabs.innerHTML=categories.map(category=>`<button class="cat-tab${category===active?' active':''}" type="button" data-category="${escape(category)}" aria-pressed="${category===active}">${escape(category)}</button>`).join('');
    grid.innerHTML=menu.filter(x=>active==='Tất cả'||x.category===active).map(item=>`
      <article class="menu-card${item.category==='Đồ uống'?' menu-card-drink':''}" data-code="${escape(item.code)}">
        <div class="menu-photo${item.cropCaption?' photo--rolls':''}"><img class="menu-card-img" src="${escape(item.image)}" alt="${escape(item.name)}" loading="lazy" decoding="async"></div>
        <div class="menu-card-body">
          <span class="menu-card-code">${escape(item.code)}</span>
          <h2 class="menu-card-name">${escape(item.name)}</h2>
          ${item.description?`<p class="menu-card-desc">${escape(item.description)}</p>`:''}
          <p class="menu-price">$${item.price}</p>
        </div>
      </article>`).join('');
  }
  tabs.addEventListener('click',event=>{const button=event.target.closest('button[data-category]');if(button){active=button.dataset.category;render();tabs.querySelector('[data-category="'+CSS.escape(active)+'"]')?.focus({preventScroll:true});}});
  document.getElementById('wholesaleLink').addEventListener('click',()=>{document.getElementById('wholesale').open=true;});
  fetch('menu.json').then(r=>{if(!r.ok)throw new Error('Menu unavailable');return r.json();}).then(data=>{menu=data;render();}).catch(()=>{grid.innerHTML='<p class="load-state" role="alert">Chưa tải được thực đơn. Vui lòng thử lại hoặc gọi 5488 8239.</p>';});
})();
