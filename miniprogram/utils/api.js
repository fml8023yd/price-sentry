const BASE = getApp().globalData.apiBase;

function request(path, data, method = 'GET') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + path,
      method,
      data,
      header: { 'content-type': 'application/json' },
      success: (res) => res.statusCode < 300 ? resolve(res.data) : reject(res),
      fail: reject
    });
  });
}

// 解析商品链接 -> {platform, itemId}
// 淘宝: item.taobao.com/item.htm?id=xxx / detail.tmall.com
// 京东: item.jd.com/xxx.html
function parseItemUrl(url) {
  let m = url.match(/taobao\.com|tmall\.com/);
  if (m) {
    const id = (url.match(/[?&]id=(\d+)/) || [])[1];
    return id ? { platform: 'taobao', itemId: id } : null;
  }
  m = url.match(/item\.jd\.com\/(\d+)\.html/);
  if (m) return { platform: 'jd', itemId: m[1] };
  return null;
}

module.exports = {
  parseItemUrl,
  listWatchedItems: () => request('/api/watched_items'),
  addWatchedItem: (d) => request('/api/watched_items', d, 'POST'),
  removeWatchedItem: (id) => request('/api/watched_items/' + id, {}, 'DELETE'),
  getWatchedItem: (id) => request('/api/watched_items/' + id),
  setTargetPrice: (id, tp) => request('/api/watched_items/' + id + '/target', { target_price: tp }, 'POST'),
  getPriceHistory: (id, days) => request('/api/price_history?item_id=' + id + '&days=' + days)
};

// TODO(后端): 价格抓取只走官方联盟 API
// - 京东联盟: union.jd.com -> jd.union.open.goods.query / promotioncode.get
// - 淘宝联盟: pub.alimama.com -> taobao.tbk.dg.material.optional
// 签名与 appkey 管理放服务端，小程序端永远不碰 secret
