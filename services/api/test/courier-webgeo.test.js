// 骑手 Web 端定位上报（webgeo.js）的契约守卫。
//
// 背景（2026-11-06）：Web 工作台（Telegram / 浏览器）没有原生 App 的
// WebViewJavascriptBridge，坐标恒为空，取货/送达的距离校验在拿死数据判断。
// 补上浏览器定位后，最容易出错也最难在测试环境发现的一点是**传参方向**：
//
//   PHP updateCourierLocation:  UPDATE ... SET `lng` = param.lat, `lat` = param.lng
//   读侧（getDistance / 地图打点）: DB.lng 当经度、DB.lat 当纬度
//
//   => 前端必须交叉传：lng=<纬度>  lat=<经度>
//
// 线上实测口径：传 lng=14.5365&lat=120.9835 → DB 落地 lng=120.9835 lat=14.5365。
// 这里把「PHP 互换」与「前端交叉」绑成一对，任一侧被单独"修正"就立刻变红。
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '../../..');
const WEBGEO = path.join(REPO, 'webroot/templates/courier/js/webgeo.js');
const INDEX_JS = path.join(REPO, 'webroot/templates/courier/js/index.js');
const DETAIL_JS = path.join(REPO, 'webroot/templates/courier/js/detail.js');
const INDEX_HTML = path.join(REPO, 'webroot/templates/courier/index.html');
const DETAIL_HTML = path.join(REPO, 'webroot/templates/courier/detail.html');
const WAIMAI = path.join(REPO, 'webroot/api/handlers/waimai.class.php');

const read = (p) => fs.readFileSync(p, 'utf8');

test('webgeo 上报必须交叉传参：lng=<纬度>、lat=<经度>', () => {
  const src = read(WEBGEO);
  assert.ok(
    /'&lng='\s*\+\s*encodeURIComponent\(pos\.lat\)/.test(src),
    'webgeo.js 的 lng 参数必须传 pos.lat（纬度）——PHP 写库会把它写进 lng 字段'
  );
  assert.ok(
    /'&lat='\s*\+\s*encodeURIComponent\(pos\.lng\)/.test(src),
    'webgeo.js 的 lat 参数必须传 pos.lng（经度）'
  );
});

test('PHP updateCourierLocation 仍做字段互换，前端交叉传参的前提不能被悄悄改掉', () => {
  const src = read(WAIMAI);
  assert.ok(
    /SET\s+`lng`\s*=\s*'\$lat'\s*,\s*`lat`\s*=\s*'\$lng'/.test(src),
    'updateCourierLocation 的写库语句变了（不再是 lng=lat / lat=lng），必须同步复核 webgeo.js 传参方向'
  );
});

test('__webGeo 暴露的是标准语义（lng=经度、lat=纬度），供 ps_lnglat 直接用', () => {
  const src = read(WEBGEO);
  assert.ok(
    /W\.__webGeo\s*=\s*\{\s*lng:\s*lng,\s*lat:\s*lat/.test(src),
    '__webGeo 必须以标准 lng/lat 语义暴露；publish() 的入参来自 coords.longitude/latitude'
  );
  assert.ok(/publish\(p\.coords\.longitude,\s*p\.coords\.latitude/.test(src),
    'HTML5 来源应把 coords.longitude 传给 lng、coords.latitude 传给 lat');
});

test('原生 App 环境直接短路，不与 bridge 上报打架', () => {
  const src = read(WEBGEO);
  assert.ok(/navigator\.userAgent/.test(src), '缺少 UA 判定（huoniao 壳）');
  assert.ok(/W\.WebViewJavascriptBridge/.test(src), '缺少 bridge 存在判定');
  assert.ok(/if\s*\(\/huoniao\/i\.test\(navigator\.userAgent\)\s*\|\|\s*W\.WebViewJavascriptBridge\)\s*\{\s*return;/.test(src),
    'UA 含 huoniao 或已存在 bridge 时必须 return');
});

test('提供应急关闭开关（URL 参数 + localStorage）', () => {
  const src = read(WEBGEO);
  assert.ok(/webgeo=0/.test(src), '缺少 ?webgeo=0 关闭开关');
  assert.ok(/fbs_webgeo/.test(src), '缺少 localStorage fbs_webgeo=0 关闭开关');
});

test('工作台与详情页都引入 webgeo.js，且在各自业务脚本之前', () => {
  [
    [INDEX_HTML, 'js/index.js'],
    [DETAIL_HTML, 'js/detail.js']
  ].forEach(([file, business]) => {
    const src = read(file);
    const geoIdx = src.indexOf('js/webgeo.js');
    const bizIdx = src.indexOf(business);
    assert.ok(geoIdx > 0, `${path.basename(file)} 未引入 webgeo.js`);
    assert.ok(bizIdx > 0, `${path.basename(file)} 未找到 ${business}`);
    assert.ok(geoIdx < bizIdx, `${path.basename(file)} 中 webgeo.js 必须在 ${business} 之前加载`);
  });
});

test('两个页面的业务脚本都从 __webGeo 回填 ps_lnglat', () => {
  assert.ok(/window\.__webGeo/.test(read(INDEX_JS)), 'index.js 未读取 window.__webGeo');
  assert.ok(/window\.__webGeo/.test(read(DETAIL_JS)), 'detail.js 未读取 window.__webGeo');
});
