// 价格轮询 + 降价触发器（MVP 骨架）
// 定时拉取 watched_items 对应商品价格，写 price_history，命中规则则推送

const UNION_ENDPOINTS = {
  jd: 'https://api.jd.com/routerjson',        // 京东联盟网关（需 appkey+sign）
  taobao: 'https://eco.taobao.com/router/rest' // 淘宝联盟网关（需 appkey+sign）
};

// 单品价格查询：走服务端缓存的联盟 API 调用
// TODO: 接京东联盟 jd.union.open.goods.query / 淘宝联盟 taobao.tbk.dg.material.optional
async function fetchPrice(platform, itemId) {
  throw new Error('union api not wired: ' + platform + '/' + itemId);
}

// 判定是否触发提醒：
// - 用户设了 target_price：latest <= target
// - 未设：相对 first_price 降幅 >= 5%，或破历史最低
function shouldAlert(item, stats) {
  if (item.target_price && item.latest_price <= item.target_price) return 'target';
  if (item.first_price && item.latest_price <= item.first_price * 0.95) return 'pct5';
  if (stats && item.latest_price < stats.min) return 'lowest';
  return null;
}

// 防轰炸：alert_logs 里同日同商品已有记录则跳过（schema 里有唯一索引兜底）
function alreadyAlertedToday(db, userId, itemRowId) {
  const today = new Date().toISOString().slice(0, 10);
  return db.prepare(
    `SELECT 1 FROM alert_logs WHERE user_id=? AND item_row_id=? AND date(sent_at)=?`
  ).get(userId, itemRowId, today);
}

async function pollOnce(db, wxPush) {
  const items = db.prepare('SELECT * FROM watched_items').all();
  for (const it of items) {
    try {
      const price = await fetchPrice(it.platform, it.item_id);
      db.prepare('INSERT INTO price_history (platform,item_id,price) VALUES (?,?,?)')
        .run(it.platform, it.item_id, price);
      db.prepare('UPDATE watched_items SET latest_price=? WHERE id=?').run(price, it.id);
      const reason = shouldAlert({ ...it, latest_price: price }, null);
      if (reason && !alreadyAlertedToday(db, it.user_id, it.id)) {
        await wxPush(it.user_id, 'PRICE_DROP_ALERT_TEMPLATE_ID', { price, reason, item: it.title });
        db.prepare('INSERT INTO alert_logs (user_id,item_row_id,trigger_price,status) VALUES (?,?,?,?)')
          .run(it.user_id, it.id, price, 'sent');
      }
    } catch (e) {
      console.error('poll item failed', it.platform, it.item_id, e.message);
    }
  }
}

module.exports = { pollOnce, shouldAlert, alreadyAlertedToday };
