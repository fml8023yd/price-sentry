# 蹲价助手 (Price Sentry)

微信小程序：盯住淘宝/京东商品，降价自动推送。解决"想买但不急、多渠道促销信息抓不到"的比价需求。

## 产品逻辑

- 用户粘贴商品链接或搜索商品 → 加入关注列表（`watched_items`）
- 后端定时通过官方联盟 API 拉取价格快照 → 写入 `price_history`，画出历史价格曲线
- 命中用户设定的目标价或出现明显降幅 → 微信订阅消息推送（写 `alert_logs` 去重）

## 技术栈

- 前端：微信小程序原生（WXML/WXSS/JS），订阅消息推送通知
- 数据源：京东联盟 + 淘宝联盟官方开放平台 API（不抓页面、不走灰色爬虫）
- 后端：Node.js + 定时任务（见 `services/schema.sql` 三张核心表）

## 目录结构

```
miniprogram/          # 小程序端
  app.js/app.json     # 入口与页面注册
  pages/watchlist/    # 关注列表主页
  pages/item/         # 商品价格详情+历史曲线
  utils/api.js        # 联盟 API 客户端封装
services/schema.sql   # 后端三张核心表 DDL
docs/                 # 设计与工程文档
```

## Roadmap

- [ ] 联盟 API 签名与鉴权接入（`utils/api.js` 中的 TODO）
- [ ] 价格曲线组件（canvas → wx-charts）
- [ ] 订阅消息模板申请与推送链路联调
- [ ] 降价策略配置（目标价 / 降幅百分比 / 历史最低价）

## License

MIT
