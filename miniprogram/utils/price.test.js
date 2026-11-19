// 链接解析与降幅判定的最小单测（node 直跑，不依赖小程序环境）
const assert = require('assert');

// 复刻 api.js 中的纯逻辑（避免 wx 环境依赖）
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

assert.deepStrictEqual(
  parseItemUrl('https://item.taobao.com/item.htm?id=7355601234&spm=a21'),
  { platform: 'taobao', itemId: '7355601234' }
);
assert.deepStrictEqual(
  parseItemUrl('https://item.jd.com/100012043978.html'),
  { platform: 'jd', itemId: '100012043978' }
);
assert.strictEqual(parseItemUrl('https://www.amazon.com/dp/B0X'), null);
assert.strictEqual(parseItemUrl('https://taobao.com/no-id-page'), null);

function dropPct(first, latest) {
  return ((latest - first) / first * 100);
}
assert.ok(Math.abs(dropPct(100, 80) + 20) < 1e-9);
assert.ok(Math.abs(dropPct(99.9, 99.9)) < 1e-9);

console.log('all tests passed');
