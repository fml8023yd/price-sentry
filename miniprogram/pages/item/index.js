const api = require('../../utils/api');

Page({
  data: {
    item: null,
    history: [],      // price_history：{price, captured_at}
    targetPrice: '',
    stats: null       // {min, max, avg, latest}
  },
  onLoad(query) {
    this.itemId = query.id;
    this.refresh();
  },
  async refresh() {
    const [item, history] = await Promise.all([
      api.getWatchedItem(this.itemId),
      api.getPriceHistory(this.itemId, 90)
    ]);
    const stats = this.computeStats(history);
    this.setData({ item, history, stats });
    this.drawCurve(history);
  },
  computeStats(history) {
    if (!history.length) return null;
    const prices = history.map(h => h.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
      latest: prices[prices.length - 1]
    };
  },
  // 简易 canvas 价格曲线（MVP 版，后续换 wx-charts）
  drawCurve(history) {
    if (history.length < 2) return;
    const ctx = wx.createCanvasContext('priceCurve', this);
    const W = 320, H = 160, pad = 10;
    const prices = history.map(h => h.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    const span = max - min || 1;
    ctx.beginPath();
    history.forEach((h, i) => {
      const x = pad + (W - 2 * pad) * i / (history.length - 1);
      const y = H - pad - (H - 2 * pad) * (h.price - min) / span;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.setStrokeStyle('#e94560');
    ctx.setLineWidth(2);
    ctx.stroke();
    ctx.draw();
  },
  onTargetInput(e) {
    this.setData({ targetPrice: e.detail.value });
  },
  async onSetTarget() {
    const tp = parseFloat(this.data.targetPrice);
    if (!(tp > 0)) return wx.showToast({ title: '目标价不对', icon: 'none' });
    await api.setTargetPrice(this.itemId, tp);
    // 订阅消息授权：用户点一次，授一次推送额度
    wx.requestSubscribeMessage({
      tmplIds: ['PRICE_DROP_ALERT_TEMPLATE_ID'],
      success: () => wx.showToast({ title: '已订阅降价提醒', icon: 'none' })
    });
  }
});
