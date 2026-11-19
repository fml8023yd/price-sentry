const api = require('../../utils/api');

Page({
  data: {
    items: [],        // watched_items 列表
    inputUrl: ''
  },
  onLoad() {
    this.refresh();
  },
  onShow() {
    this.refresh();
  },
  async refresh() {
    try {
      const items = await api.listWatchedItems();
      this.setData({ items });
    } catch (e) {
      console.error('load watchlist failed', e);
    }
  },
  onInput(e) {
    this.setData({ inputUrl: e.detail.value });
  },
  async onAdd() {
    const url = this.data.inputUrl.trim();
    if (!url) return;
    const parsed = api.parseItemUrl(url);
    if (!parsed) {
      wx.showToast({ title: '只认淘宝/京东链接', icon: 'none' });
      return;
    }
    await api.addWatchedItem({ platform: parsed.platform, itemId: parsed.itemId, url });
    this.setData({ inputUrl: '' });
    this.refresh();
  },
  async onRemove(e) {
    await api.removeWatchedItem(e.currentTarget.dataset.id);
    this.refresh();
  },
  onTapItem(e) {
    wx.navigateTo({ url: '/pages/item/index?id=' + e.currentTarget.dataset.id });
  },
  // 降幅展示：相对关注时价
  trendLabel(item) {
    if (!item.first_price || !item.latest_price) return '--';
    const pct = ((item.latest_price - item.first_price) / item.first_price * 100);
    return (pct > 0 ? '+' : '') + pct.toFixed(1) + '%';
  }
});
