Page({
  data: {
    rules: [
      { key: 'target', label: '降到目标价' },
      { key: 'pct', label: '比关注时再降 X%' },
      { key: 'lowest', label: '破历史最低价' }
    ],
    active: 'target'
  },
  onPick(e) {
    this.setData({ active: e.currentTarget.dataset.key });
  }
});
