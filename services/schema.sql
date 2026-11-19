-- 蹲价助手核心表（MVP）
-- 与小程序端 /api/* 对应

CREATE TABLE watched_items (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT       NOT NULL,          -- 微信 openid 映射的内部用户
  platform      VARCHAR(16)  NOT NULL,          -- taobao | jd
  item_id       VARCHAR(64)  NOT NULL,
  url           TEXT         NOT NULL,
  title         TEXT,
  image_url     TEXT,
  first_price   NUMERIC(10,2),                  -- 关注时价
  latest_price  NUMERIC(10,2),
  target_price  NUMERIC(10,2),                  -- 用户目标价，为空则按降幅提醒
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, item_id)
);

CREATE TABLE price_history (
  id           BIGSERIAL PRIMARY KEY,
  platform     VARCHAR(16)  NOT NULL,
  item_id      VARCHAR(64)  NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  captured_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_ph_item_time ON price_history (platform, item_id, captured_at DESC);

CREATE TABLE alert_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT      NOT NULL,
  item_row_id  BIGINT      NOT NULL REFERENCES watched_items(id),
  trigger_price NUMERIC(10,2) NOT NULL,
  template_id  VARCHAR(64),                     -- 微信订阅消息模板
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status       VARCHAR(16) NOT NULL DEFAULT 'sent'
);
-- 推送去重：同一商品一天最多一条
CREATE UNIQUE INDEX idx_alert_dedup
  ON alert_logs (user_id, item_row_id, (sent_at::date));
