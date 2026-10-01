(() => {
  let orders = [];
  const grid = document.getElementById('ordersGrid');
  const wsStatus = document.getElementById('wsStatus');

  function timeAgo(iso) {
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分鐘前`;
    return new Date(iso).toLocaleTimeString('zh-HK', { hour: '2-digit', minute: '2-digit' });
  }

  function badgeHtml(status) {
    if (status === 'pending') return '<span class="oc-badge badge-new">待付款</span>';
    if (status === 'paid') return '<span class="oc-badge badge-paid">已付款</span>';
    return '<span class="oc-badge badge-done">已完成</span>';
  }

  function renderOrders() {
    const active = orders.filter(o => o.status !== 'done');
    if (!active.length) {
      grid.innerHTML = '<div class="empty"><span>📭</span>暫無待處理訂單</div>';
      return;
    }
    grid.innerHTML = active.map(o => `
      <div class="order-card ${o.status}" id="oc-${o.id}">
        <div class="oc-head">
          <span class="oc-id">#${o.id}</span>
          ${badgeHtml(o.status)}
        </div>
        <span class="oc-time">${timeAgo(o.createdAt)} · ${o.paymentMethod?.toUpperCase()}</span>
        <div class="oc-items">
          ${o.items.map(i => `
            <div class="oc-item">
              <span><span class="oc-item-qty">${i.qty}×</span>${i.name}</span>
              <span>${i.tbd ? '待定' : `HK$${i.price * i.qty}`}</span>
            </div>`).join('')}
        </div>
        ${o.note ? `<div class="oc-note">📝 ${o.note}</div>` : ''}
        <div class="oc-total"><span>合計</span><span>${o.total > 0 ? `HK$${o.total}` : '待定'}</span></div>
        <div class="oc-actions">
          <button class="btn-print" onclick="printOrder('${o.id}')">🖨️ 打印</button>
          ${o.status === 'pending' ? `<button class="btn-paid" onclick="updateStatus('${o.id}','paid')">✅ 確認收款</button>` : ''}
          ${o.status === 'paid' ? `<button class="btn-done" onclick="updateStatus('${o.id}','done')">完成</button>` : ''}
        </div>
      </div>`).join('');
  }

  window.updateStatus = async (id, status) => {
    await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const o = orders.find(x => x.id === id);
    if (o) o.status = status;
    renderOrders();
  };

  window.printOrder = (id) => {
    const o = orders.find(x => x.id === id);
    if (!o) return;
    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write(`
      <html><head><style>
        body{font-family:'Microsoft JhengHei',monospace;font-size:14px;padding:10px}
        h2{text-align:center;font-size:18px;margin-bottom:4px}
        .sub{text-align:center;color:#666;font-size:12px;margin-bottom:12px}
        .divider{border-top:1px dashed #000;margin:8px 0}
        .row{display:flex;justify-content:space-between;padding:3px 0;font-size:14px}
        .total{font-weight:bold;font-size:16px}
        .note{font-size:12px;color:#555;margin-top:6px}
        .order-no{text-align:center;font-size:22px;font-weight:bold;
          border:2px solid #000;padding:6px;margin:8px 0}
      </style></head><body>
        <h2>越南法包屋</h2>
        <p class="sub">Vietnam Banh Mi House</p>
        <div class="order-no">#${o.id}</div>
        <p class="sub">${new Date(o.createdAt).toLocaleString('zh-HK')}</p>
        <div class="divider"></div>
        ${o.items.map(i => `
          <div class="row"><span>${i.qty}× ${i.name}</span>
          <span>${i.tbd ? '待定' : `HK$${i.price * i.qty}`}</span></div>`).join('')}
        <div class="divider"></div>
        <div class="row total"><span>合計</span><span>${o.total > 0 ? `HK$${o.total}` : '待定'}</span></div>
        ${o.note ? `<div class="note">備註：${o.note}</div>` : ''}
        <div class="divider"></div>
        <p style="text-align:center;font-size:12px;margin-top:8px">付款方式：${o.paymentMethod?.toUpperCase()}</p>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  // ── WebSocket ────────────────────────────────────
  function connect() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}`);

    ws.onopen = () => {
      wsStatus.textContent = '● 實時連線';
      wsStatus.className = 'status live';
    };
    ws.onclose = () => {
      wsStatus.textContent = '⚠ 已斷線，重連中…';
      wsStatus.className = 'status';
      setTimeout(connect, 3000);
    };
    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'INIT') {
        orders = msg.orders;
        renderOrders();
      } else if (msg.type === 'NEW_ORDER') {
        orders.unshift(msg.order);
        renderOrders();
        new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAA==').play().catch(() => {});
        if (Notification.permission === 'granted') {
          new Notification(`新訂單 #${msg.order.id}`, { body: `${msg.order.items.length} 款餐點` });
        }
      } else if (msg.type === 'ORDER_UPDATED') {
        const idx = orders.findIndex(o => o.id === msg.order.id);
        if (idx >= 0) orders[idx] = msg.order;
        renderOrders();
      }
    };
  }

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  connect();
})();
