'use strict';
// 定位失败路径（P0）：
//   1) publicLocation.js 的各分支失败时回调 ''，页面用 `data == undefined || data.address == ""` 判失败，
//      ''.address 是 undefined → 判成功 → 页面永远「定位中…」。init 入口必须把非对象规整成 undefined。
//   2) mapPosi_waimai.js 的 draw_google 收到 '' 时不能抛错，要落到默认中心。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '../../..');

function loadPublicLocation(geo) {
  const src = fs.readFileSync(path.join(ROOT, 'webroot/static/js/publicLocation.js'), 'utf8');
  const nav = { userAgent: 'Mozilla/5.0 (iPhone) Telegram', geolocation: geo };
  const ctx = {
    navigator: nav,
    document: { write() {}, cookie: '' },
    location: { protocol: 'https:' },
    site_map: 'google',
    window: {},
    console,
    unescape,
    setTimeout,
    clearTimeout
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src + '\n;this.__HN = HN_Location;', ctx);
  return ctx;
}

test('init：定位报错（用户拒绝/超时）回调的是 undefined，不是 \'\'', () => {
  const geo = {
    getCurrentPosition(ok, err) { err({ code: 1 }); }
  };
  const ctx = loadPublicLocation(geo);
  let called = 0;
  let got = 'unset';
  ctx.__HN.init(function (d) { called++; got = d; });
  assert.strictEqual(called, 1);
  assert.strictEqual(got, undefined, '失败必须是 undefined，页面的 `data == undefined` 才会命中');
});

test('init：成功时对象原样透传', () => {
  const ctx = loadPublicLocation({ getCurrentPosition() {} });
  let got;
  // 直接走 h5 失败之外的回调：用 touchH5LocationCallback 的成功分支太依赖 ajax，这里验证包装本身
  ctx.__HN.h5 = function (f) { f({ lat: 1, lng: 2, address: 'x' }); };
  ctx.__HN.init(function (d) { got = d; });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(got)), { lat: 1, lng: 2, address: 'x' });
});

test('draw_google：lnglat 为 \'\' / undefined / 非数字时不抛错，落到默认中心（马尼拉）', () => {
  const src = fs.readFileSync(path.join(ROOT, 'webroot/templates/member/touch/js/mapPosi_waimai.js'), 'utf8');
  const start = src.indexOf('draw_google(lnglat) {');
  assert.ok(start > 0, '找不到 draw_google');
  // 按花括号配对截出 draw_google 方法体（字符串里没有不配对的花括号）
  let depth = 0, i = start + 'draw_google(lnglat) '.length, endIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
  }
  assert.ok(endIdx > 0);
  const body = src.slice(start, endIdx);

  for (const bad of ['', undefined, [undefined, undefined], ['', ''], ['abc', 'def']]) {
    let centerArgs = null;
    const tt = {};
    const google = {
      maps: {
        LatLng: function (a, b) { centerArgs = [a, b]; if (a === undefined || b === undefined || Number.isNaN(a)) throw new Error('Invalid LatLng'); },
        Map: function () {},
        Marker: function () {},
        Animation: { DROP: 1 },
        ZoomControlStyle: { SMALL: 1 },
        event: { addListener() {} },
        places: { PlacesService: function () { this.nearbySearch = function () {}; }, PlacesServiceStatus: { OK: 'OK' } },
        Geocoder: function () { return { geocode() {} }; }
      }
    };
    const $ = () => ({ hide() {} });
    const fn = vm.runInNewContext('({ ' + body + ' })', {
      $, google, document: { getElementById: () => ({}) }, getLocation() {}, map: null, marker: null, console
    }).draw_google;
    assert.doesNotThrow(() => fn.call(tt, bad), 'lnglat=' + JSON.stringify(bad));
    assert.deepStrictEqual(centerArgs, [14.5995, 120.9842]);
    assert.strictEqual(tt.lng, 120.9842);
    assert.strictEqual(tt.lat, 14.5995);
  }
});

test('draw_google：有效坐标时不动它', () => {
  const src = fs.readFileSync(path.join(ROOT, 'webroot/templates/member/touch/js/mapPosi_waimai.js'), 'utf8');
  assert.match(src, /var gLat = parseFloat\(lnglat\[0\]\), gLng = parseFloat\(lnglat\[1\]\)/);
});
