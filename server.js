require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const FPS_ID = process.env.FPS_ID || 'YOUR_FPS_ID';
const STORE_NAME = process.env.STORE_NAME || '越南法包屋';

// In-memory order store (persist to file in production)
let orders = [];

// ── Static files ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Kitchen page
app.get('/kitchen', (req, res) => {
  res.sendFile(path.join(__dirname, 'kitchen', 'index.html'));
});

// ── Menu API ──────────────────────────────────────────────
const MENU = [
  // 法包
  { id: 'banh-mi-dac-biet',  name: '招牌法包',       category: '法包',     price: 78, image: '/images/banh-mi-dac-biet.jpg',  desc: '越式扎肉、肝醬、醃菜及芫荽' },
  { id: 'banh-mi-thap-cam',  name: '特色法包',       category: '法包',     price: 68, image: '/images/banh-mi-thap-cam.jpg',  desc: '扎肉、醃菜及青瓜絲' },
  { id: 'banh-mi-xiu-mai',   name: '肉丸叉燒法包',   category: '法包',     price: 68, image: '/images/banh-mi-xiu-mai.jpg',   desc: '手打肉丸、叉燒及越式醃菜' },
  { id: 'banh-mi-xa-xiu',    name: '叉燒法包',       category: '法包',     price: 68, image: '/images/banh-mi-xa-xiu.jpg',    desc: '香烤叉燒配越式醃菜及芫荽' },
  { id: 'banh-mi-ga',        name: '燒雞法包',       category: '法包',     price: 78, image: '/images/banh-mi-ga.jpg',        desc: '燒雞肉配特製醬汁' },
  // 小食
  { id: 'cha-lua-plat',      name: '越式扎肉拼盤',   category: '小食',     price: 68, image: '/images/cha-lua-platcl.jpg',    desc: '越式扎肉及葉包糰拼盤' },
  { id: 'nguyen-lieu-plat',  name: '越式配料拼盤',   category: '小食',     price: 68, image: '/images/nguyen-lieu-plat.jpg',  desc: '炸豆腐、葉包糰及雞蛋糕' },
  { id: 'cha-lua',           name: '越式扎肉',       category: '小食',     price: 68, image: '/images/cha-lua.jpg',           desc: '越式豬肉腸' },
  { id: 'cha-gio',           name: '越式炸春卷',     category: '小食',     price: 68, image: '/images/cha-gio.jpg',           desc: '香脆越式炸春卷' },
  // 越式米卷
  { id: 'goi-cuon-tom',      name: '大蝦紙米卷',     category: '越式米卷', price: 78, image: '/images/goi-cuon-tom.jpg',      desc: '新鮮大蝦紙米卷配香草' },
  // 湯麵
  { id: 'bun-chay',          name: '素湯米線',       category: '湯麵',     price: 68, image: '/images/bun-chay.jpg',          desc: '素湯底配豆腐及番茄' },
  { id: 'bun-bo-vien',       name: '豬肉丸湯米線',   category: '湯麵',     price: 68, image: '/images/bun-bo-vien.jpg',       desc: '豬肉丸、血塊及炸豆腐' },
  { id: 'bun-lon-tap-cam',   name: '豬雜湯米線',     category: '湯麵',     price: 68, image: '/images/bun-lon-tap-cam.jpg',   desc: '豬雜、豬扎肉、炸豆腐及肉丸' },
  // 乾撈米線
  { id: 'bun-xa-xiu-kho',    name: '燒肉乾撈米線',   category: '乾撈米線', price: 68, image: '/images/bun-xa-xiu-kho.jpg',    desc: '香脆燒豬頸肉拌米線' },
  { id: 'bun-cha-gio-lon',   name: '炸春卷米線',     category: '乾撈米線', price: 68, image: '/images/bun-cha-gio-lon.jpg',   desc: '大春卷配米線及花生' },
  { id: 'bun-cha-gio',       name: '炸春卷乾撈米線', category: '乾撈米線', price: 68, image: '/images/bun-cha-gio.jpg',       desc: '脆皮春卷拌米線配豆芽及芫荽' },
];

app.get('/api/menu', (req, res) => {
  res.json(MENU);
});

// ── FPS QR generation ─────────────────────────────────────
function buildFPSString(fpsId, amount, merchantName) {
  function tlv(tag, value) {
    const v = String(value);
    return tag + String(v.length).padStart(2, '0') + v;
  }
  function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
        crc &= 0xFFFF;
      }
    }
    return crc;
  }
  const acct = tlv('00', 'hk.fps') + tlv('01', fpsId);
  const name = merchantName.substring(0, 25);
  let s = tlv('00', '01') + tlv('01', '12') + tlv('29', acct) +
    tlv('52', '5812') + tlv('53', '344') +
    tlv('54', Number(amount).toFixed(2)) +
    tlv('58', 'HK') + tlv('59', name) + tlv('60', 'Hong Kong') + '6304';
  return s + crc16(s).toString(16).toUpperCase().padStart(4, '0');
}

app.post('/api/fps-qr', async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: '金額無效' });
  }
  if (FPS_ID === 'YOUR_FPS_ID') {
    return res.status(503).json({ error: 'FPS_ID 未設定，請聯絡店主' });
  }
  const fpsString = buildFPSString(FPS_ID, amount, STORE_NAME);
  const qrDataUrl = await QRCode.toDataURL(fpsString, {
    errorCorrectionLevel: 'M', width: 300, margin: 2,
    color: { dark: '#000000', light: '#ffffff' }
  });
  res.json({ qr: qrDataUrl, fpsString });
});

// ── Order API ─────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { items, total, note, pickupTime, paymentMethod } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: '訂單不可為空' });

  const order = {
    id: nanoid(8).toUpperCase(),
    items,
    total: Number(total) || 0,
    note: note || '',
    pickupTime: pickupTime || '盡快',
    paymentMethod: paymentMethod || 'fps',
    status: 'pending',
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);

  // Notify all kitchen clients
  broadcast({ type: 'NEW_ORDER', order });
  res.json({ orderId: order.id });
});

app.get('/api/orders', (req, res) => {
  res.json(orders.slice().reverse());
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: '找不到訂單' });
  order.status = req.body.status;
  if (req.body.status === 'paid') order.paidAt = new Date().toISOString();
  broadcast({ type: 'ORDER_UPDATED', order });
  res.json(order);
});

// ── WebSocket broadcast ───────────────────────────────────
function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  });
}

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'INIT', orders: orders.slice(-20).reverse() }));
});

// ── Start ─────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`越南法包屋 點餐系統 running on port ${PORT}`);
  console.log(`點餐頁: http://localhost:${PORT}`);
  console.log(`廚房頁: http://localhost:${PORT}/kitchen`);
});
