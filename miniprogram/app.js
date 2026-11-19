App({
  globalData: {
    apiBase: 'https://api.price-sentry.example.com',
    userId: null
  },
  onLaunch() {
    wx.login({
      success: (res) => {
        // TODO: 用 code 换 openid，绑定到后端 users 表
        this.globalData.loginCode = res.code;
      }
    });
  }
});
