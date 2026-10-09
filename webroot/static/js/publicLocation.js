/* @preserve
 * gcoord 0.2.2, geographic coordinate library
 * Copyright (c) 2019 Jiulong Hu <me@hujiulong.com>
 */
!function (e, t) { "object" == typeof exports && "undefined" != typeof module ? t(exports) : "function" == typeof define && define.amd ? define(["exports"], t) : t(e.gcoord = {}) }(this, function (e) { "use strict"; var t = "WGS84", r = t, n = t, o = "GCJ02", a = o, i = "BD09", u = i, f = i, c = i, s = "BD09MC", l = s, M = "EPSG3857", g = M, h = M, v = M, d = M; function m(e) { throw new Error(e) } function G(e) { return !isNaN(e) && null !== e && !S(e) } function S(e) { return !!e && "[object Array]" === Object.prototype.toString.call(e) } function P() { for (var o = [], e = 0; e < arguments.length; e++)o[e] = arguments[e]; var a = o.length - 1; return function () { for (var e = [], t = 0; t < arguments.length; t++)e[t] = arguments[t]; for (var r = a, n = o[a].apply(null, e); r--;)n = o[r].call(null, n); return n } } var b = Math.sin, y = Math.cos, p = Math.sqrt, B = Math.abs, D = Math.PI, C = 6378245, E = .006693421622965823; function W(e) { var t = e[0], r = e[1]; if (!J(t, r)) return [t, r]; for (var n = [t, r], o = n[0], a = n[1], i = x([o, a]), u = i[0] - t, f = i[1] - r; 1e-6 < B(u) || 1e-6 < B(f);)u = (i = x([o -= u, a -= f]))[0] - t, f = i[1] - r; return [o, a] } function x(e) { var t = e[0], r = e[1]; if (!J(t, r)) return [t, r]; var n = function (e, t) { var r = function (e, t) { var r = 300 + e + 2 * t + .1 * e * e + .1 * e * t + .1 * p(B(e)); return r += 2 * (20 * b(6 * e * D) + 20 * b(2 * e * D)) / 3, r += 2 * (20 * b(e * D) + 40 * b(e / 3 * D)) / 3, r += 2 * (150 * b(e / 12 * D) + 300 * b(e / 30 * D)) / 3 }(e - 105, t - 35), n = function (e, t) { var r = 2 * e - 100 + 3 * t + .2 * t * t + .1 * e * t + .2 * p(B(e)); return r += 2 * (20 * b(6 * e * D) + 20 * b(2 * e * D)) / 3, r += 2 * (20 * b(t * D) + 40 * b(t / 3 * D)) / 3, r += 2 * (160 * b(t / 12 * D) + 320 * b(t * D / 30)) / 3 }(e - 105, t - 35), o = t / 180 * D, a = b(o), i = p(a = 1 - E * a * a); return [r = 180 * r / (C / i * y(o) * D), n = 180 * n / (C * (1 - E) / (a * i) * D)] }(t, r); return [t + n[0], r + n[1]] } function J(e, t) { return 72.004 <= e && e <= 137.8347 && .8293 <= t && t <= 55.8271 } var k = Math.sin, L = Math.cos, j = Math.atan2, I = Math.sqrt, q = 3e3 * Math.PI / 180; function w(e) { var t = e[0] - .0065, r = e[1] - .006, n = I(t * t + r * r) - 2e-5 * k(r * q), o = j(r, t) - 3e-6 * L(t * q); return [n * L(o), n * k(o)] } function N(e) { var t = e[0], r = e[1], n = I(t * t + r * r) + 2e-5 * k(r * q), o = j(r, t) + 3e-6 * L(t * q); return [n * L(o) + .0065, n * k(o) + .006] } var O = 180 / Math.PI, A = Math.PI / 180, F = 6378137, _ = 20037508.342789244; function z(e) { return [e[0] * O / F, (.5 * Math.PI - 2 * Math.atan(Math.exp(-e[1] / F))) * O] } function T(e) { var t = Math.abs(e[0]) <= 180 ? e[0] : e[0] - 360 * (e[0] < 0 ? -1 : 1), r = [F * t * A, F * Math.log(Math.tan(.25 * Math.PI + .5 * e[1] * A))]; return r[0] > _ && (r[0] = _), r[0] < -_ && (r[0] = -_), r[1] > _ && (r[1] = _), r[1] < -_ && (r[1] = -_), r } var U = Math.abs, H = Math.pow, K = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0], Q = [75, 60, 45, 30, 15, 0], R = [[1.410526172116255e-8, 898305509648872e-20, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -.03801003308653, 17337981.2], [-7.435856389565537e-9, 8983055097726239e-21, -.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [-3.030883460898826e-8, 898305509983578e-20, .30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, .32710905363475, 6856817.37], [-1.981981304930552e-8, 8983055099779535e-21, .03278182852591, 40.31678527705744, .65659298677277, -4.44255534477492, .85341911805263, .12923347998204, -.04625736007561, 4482777.06], [3.09191371068437e-9, 8983055096812155e-21, 6995724062e-14, 23.10934304144901, -.00023663490511, -.6321817810242, -.00663494467273, .03430082397953, -.00466043876332, 2555164.4], [2.890871144776878e-9, 8983055095805407e-21, -3.068298e-8, 7.47137025468032, -353937994e-14, -.02145144861037, -1234426596e-14, .00010322952773, -323890364e-14, 826088.5]], V = [[-.0015702102444, 111320.7020616939, 0x60e374c3105a3, -0x24bb4115e2e164, 0x5cc55543bb0ae8, -0x7ce070193f3784, 0x5e7ca61ddf8150, -0x261a578d8b24d0, 0x665d60f3742ca, 82.5], [.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5], [.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5], [.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5], [-.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5], [-.0003218135878613132, 111320.7020701615, .00369383431289, 823725.6402795718, .46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, .37238884252424, 7.45]]; function X(e, t, r) { var n = U(t) / r[9], o = r[0] + r[1] * U(e), a = r[2] + r[3] * n + r[4] * H(n, 2) + r[5] * H(n, 3) + r[6] * H(n, 4) + r[7] * H(n, 5) + r[8] * H(n, 6); return [o *= e < 0 ? -1 : 1, a *= t < 0 ? -1 : 1] } function Y(e) { for (var t = e[0], r = e[1], n = [], o = 0; o < Q.length; o++)if (U(r) > Q[o]) { n = V[o]; break } return X(t, r, n) } function Z(e) { for (var t = e[0], r = e[1], n = [], o = 0; o < K.length; o++)if (K[o] <= r) { n = R[o]; break } return X(t, r, n) } var $ = { to: { GCJ02: x, BD09: P(N, x), BD09MC: P(Y, N, x), EPSG3857: T } }, ee = { to: { WGS84: W, BD09: N, BD09MC: P(Y, N), EPSG3857: P(T, W) } }, te = { to: { WGS84: P(W, w), GCJ02: w, EPSG3857: P(T, W, w), BD09MC: Y } }, re = { to: { WGS84: z, GCJ02: P(x, z), BD09: P(N, x, z), BD09MC: P(Y, N, x, z) } }, ne = { to: { WGS84: P(W, w, Z), GCJ02: P(w, Z), EPSG3857: P(T, W, w, Z), BD09: Z } }, oe = Object.freeze({ WGS84: $, GCJ02: ee, BD09: te, EPSG3857: re, BD09MC: ne }); function ae(e, t, r) { e || m("coordinate is required"), t || m("original coordinate system is required"), r || m("target coordinate system is required"); var n = oe[t]; if (n || m("original coordinate system is invalid"), t === r) return e; var o = n.to[r]; o || m("target coordinate system is invalid"); var a = typeof e; if ("string" != a && "object" != a && m("coordinate must be an geojson or an array of position"), "string" == a) try { e = JSON.parse(e) } catch (e) { m("input is not a legal JSON string") } var i = !1; S(e) && (e.length < 2 && m("position must be at 2 numbers long"), G(e[0]) && G(e[1]) || m("position must contain numbers"), e = e.map(Number), i = !0); var u = o; return i ? u(e) : (function e(t, r, n) { if (void 0 === n && (n = !1), null !== t) for (var o, a, i, u, f, c, s, l, M = 0, g = 0, h = t.type, v = "FeatureCollection" === h, d = "Feature" === h, G = v ? t.features.length : 1, S = 0; S < G; S++) { f = (l = !!(s = v ? t.features[S].geometry : d ? t.geometry : t) && "GeometryCollection" === s.type) ? s.geometries.length : 1; for (var P = 0; P < f; P++) { var b = 0, y = 0; if (null !== (u = l ? s.geometries[P] : s)) { var p = u.type; switch (M = !n || "Polygon" !== p && "MultiPolygon" !== p ? 0 : 1, p) { case null: break; case "Point": if (!1 === r(c = u.coordinates, g, S, b, y)) return !1; g++, b++; break; case "LineString": case "MultiPoint": for (c = u.coordinates, o = 0; o < c.length; o++) { if (!1 === r(c[o], g, S, b, y)) return !1; g++, "MultiPoint" === p && b++ } "LineString" === p && b++; break; case "Polygon": case "MultiLineString": for (c = u.coordinates, o = 0; o < c.length; o++) { for (a = 0; a < c[o].length - M; a++) { if (!1 === r(c[o][a], g, S, b, y)) return !1; g++ } "MultiLineString" === p && b++, "Polygon" === p && y++ } "Polygon" === p && b++; break; case "MultiPolygon": for (c = u.coordinates, o = 0; o < c.length; o++) { for (a = y = 0; a < c[o].length; a++) { for (i = 0; i < c[o][a].length - M; i++) { if (!1 === r(c[o][a][i], g, S, b, y)) return !1; g++ } y++ } b++ } break; case "GeometryCollection": for (o = 0; o < u.geometries.length; o++)if (!1 === e(u.geometries[o], r, n)) return !1; break; default: m("Unknown Geometry Type") } } } } }(e, function (e) { var t; t = u(e), e[0] = t[0], e[1] = t[1] }), e) } var ie = { WGS84: t, WGS1984: r, EPSG4326: n, GCJ02: o, AMap: a, BD09: i, BD09LL: u, Baidu: f, BMap: c, BD09MC: s, BD09Meter: l, EPSG3857: M, EPSG900913: g, EPSG102100: h, WebMercator: v, WM: d, transform: ae }; e.WGS84 = t, e.WGS1984 = r, e.EPSG4326 = n, e.GCJ02 = o, e.AMap = a, e.BD09 = i, e.BD09LL = u, e.Baidu = f, e.BMap = c, e.BD09MC = s, e.BD09Meter = l, e.EPSG3857 = M, e.EPSG900913 = g, e.EPSG102100 = h, e.WebMercator = v, e.WM = d, e.transform = ae, e.default = ie, Object.defineProperty(e, "__esModule", { value: !0 }) });

// 百度小程序
var device = navigator.userAgent;
if (device.indexOf('swan-baiduboxapp') > -1) {
    document.write(unescape("%3Cscript src='https://b.bdstatic.com/searchbox/icms/searchbox/js/swan-2.0.21.js?v=" + ~(-new Date()) + "'type='text/javascript'%3E%3C/script%3E"));
}



var h5LocationInit = {
    fn: !1
};
var isDebug = false;
var HN_Location = {
    init: function (func, notApp, force,debug) {
        isDebug = debug ? debug : false
        if (force) {
            var cookieData = this.cookie('get');
            if (cookieData) {
                func(cookieData);
                return;
            }
        }
        var protocol = location.protocol;
        var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
        if (ua.match(/MicroMessenger/i) == "micromessenger" && site_map != "google") {

            this.wx(func);
        } else if (ua.indexOf('huoniao') > -1 && !notApp) {
            this.App(func);
        } else if (ua.indexOf('swan-baiduboxapp') > -1) { //百度小程序
            this.baiduMiniMap(func)

            //字节小程序，直接返回
        } else if (ua.indexOf('toutiaomicroapp') > -1) {
            this.h5(func);

        } else if ("https" === location.protocol.substring(0, 5) && (!notApp || typeof isQQ == 'undefined' || isQQ || site_map == 'tmap')) {
            this.h5(func);
        }
        // else if (ua.indexOf('qq') > -1 && ua.indexOf('miniprogram')>-1){ //qq小程序
        //     this.qqMiniMap(func)
        // }
        else if (site_map == "baidu") {
            // alert('出app了')
            this.baiduMap(func);
        } else if (site_map == "google") {
            this.googleMap(func);
        } else if (site_map == "qq") {
            this.qqMap(func);
        } else if (site_map == "amap") {
            this.amap(func);
        } 
        else if (site_map == "tmap") {
            this.tmap(func);
        } 
         else {
            func();
        }
    }
    , cookie: function (type, data) {
        var pre = window.cookiePre ? window.cookiePre : 'HN_';
        if (type == 'get') {
            var data_ = $.cookie(pre + 'LocationData');
            if (data_) {
                return JSON.parse(data_);
            }
        } else if (type == 'set') {
            var now = new Date();
            now.setTime(now.getTime() + 5 * 60 * 1000);  //5分钟
            $.cookie(pre + 'LocationData', JSON.stringify(data), { expires: now, path: '/' });
        }
    }
    , wx: function (func) {
        let jWeixin=window[window.jWeixin?'jWeixin':'wx'];
        jWeixin.ready(function () {
            jWeixin.getLocation({
                type: 'wgs84',  //wgs84返回gps坐标，gcj02返回火星坐标系
                success: function (res) {
                    

                    if ("function" == typeof func) {
                        h5LocationInit.fn = func
                    }
                    
                    var lng = res.longitude;
                    var lat = res.latitude;

                    var coords = {
                        'coords': {
                            'latitude': lat,
                            'longitude': lng
                        }
                    };
                    HN_Location.getLocationByGeocoding(coords, func);
                    return;

                    mapObj = new AMap.Map('map_amap');
                    lnglatXY = [lng, lat];
                    // 高德地图定位逆解析，微信端本身使用高德逆解析不用使用其他地图进行解析
                    mapObj.plugin('AMap.Geocoder', function () {
                        var geocoder = new AMap.Geocoder({
                            radius: 1000,
                            extensions: "all"
                        });
                        geocoder.getAddress(lnglatXY, function (status, result) {
                            if (status == "error") {
                                func();
                                return;
                            }
                            if (result.regeocode.pois == "" || result.regeocode.pois == undefined) {
                                var LocationName = result.regeocode.addressComponent.street + result.regeocode.addressComponent.streetNumber;
                            } else {
                                var LocationName = result.regeocode.pois[0].name;
                            }
                            var address = result.regeocode.formattedAddress;
                            var province = result.regeocode.addressComponent.province;
                            var city = result.regeocode.addressComponent.city;
                            var district = result.regeocode.addressComponent.district;

                            province = province != undefined && province != '' ? province : '';
                            city = city != undefined && city != '' ? city : '';
                            district = district != undefined && district != '' ? district : '';

                            city = city == '' ? province : city;

                            if (site_map == "baidu") {
                                //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了BD09，后续如果其他页面有问题，再做注释调整
                                var result = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.BD09);
                                lng = result[0];
                                lat = result[1];
                            }
                            if (site_map == "tmap") {
                                //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了WGS84，后续如果其他页面有问题，再做注释调整
                                var result = gcoord.transform([lng, lat], gcoord.GCJ02, gcoord.WGS84);
                                lng = result[0];
                                lat = result[1];
                            }
                            LocationName = LocationName ? LocationName : district;
                            var data = { 'name': LocationName, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                            // HN_Location.cookie('set', data);
                            // func(data);
                            HN_Location.lnglatGetTown(data, func)
                        });
                    });
                },
                fail: function (err) {
                    console.log(err,1)
                    func(isDebug ? err : '');
                },
                cancel:function(err){
                    func(isDebug ? err : '');
                }
            });
        });
    },
    // 调用APP定位
    App: function (func) {
        // alert('进入app')
        var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
        setupWebViewJavascriptBridge(function (bridge) {
            var isLoad;
            // alert('进入app1')
            bridge.callHandler("getGeocoder", {}, function (responseData) {
                if(!responseData){
                    HN_Location.h5(func);
                    return false;
                }
                // alert('进入app2')
                var data = JSON.parse(responseData);
                var LocationName = data.name;
                var address = data.address;
                var lng = data.point.lng;
                var lat = data.point.lat;
                var province = data.province;
                var city = data.city;
                var district = data.district;
                district = district != undefined ? district : '';
                isLoad = true;
                LocationName = LocationName ? LocationName : district;
                city = city ? city : district;  //自治县的情况，city可能没有数据

                // if (site_map == "baidu") {
                //     //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了BD09，后续如果其他页面有问题，再做注释调整
                //     // var result = gcoord.transform([lng, lat], gcoord.BD09, gcoord.WGS84);
                //     // lng = result[0];
                //     // lat = result[1];
                // }
                //外卖商家端需要转下坐标
                if(location.href.indexOf('wmsj') > -1){
                    if (site_map == "baidu") {
                        //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了BD09，后续如果其他页面有问题，再做注释调整
                        var result = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.BD09);
                        lng = result[0];
                        lat = result[1];
                    }
                    if (site_map == "amap") {
                        //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了WGS84，后续如果其他页面有问题，再做注释调整
                        var result = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.GCJ02);
                        lng = result[0];
                        lat = result[1];
                    }
                    if (site_map == "tmap") {
                        //添加收货地址中用到的定位功能，需要在地图中定位坐标，如果用WGS84会有偏差，这里改成了WGS84，后续如果其他页面有问题，再做注释调整
                        // var result = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.WGS84);
                        // lng = result[0];
                        // lat = result[1];
                    }
                }
                
                var data = { 'name': LocationName, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                if (lng && lat) {
                    // HN_Location.cookie('set', data);
                    // func(data);
                    HN_Location.lnglatGetTown(data, func)
                } else {
                    //应对安卓审核要求，不可以重复获取
                    // if(ua.indexOf('android') < 0){
                    HN_Location.init(func, true);
                    // }
                }
            });

            //如果10秒还没有请求到，返回空值
            setTimeout(function () {
                if (!isLoad) {
                    // alert('进入app3')
                    //应对安卓审核要求，不可以重复获取
                    // if(ua.indexOf('android') < 0){
                    HN_Location.init(func, true);
                    // }
                }
            }, 5000);

        });
    },
    //H5定位
    h5: function (func) {
        if (navigator.geolocation) {
            if ("function" == typeof func) {
                h5LocationInit.fn = func
            }
            window.touchH5LocationCallback = function (f, g, _func) {
                if (f == null) {
                    HN_Location.getLocationByGeocoding(g, _func);
                } else {
                    _func(isDebug ? f : '');
                    // HN_Location.getLocationError(f);
                    // if (typeof isQQ == 'undefined' || !isQQ) {
                    //     HN_Location.init(func, true);
                    // }
                }
            },
                window.navigator.geolocation.getCurrentPosition(function (position) {
                    window.touchH5LocationCallback && window.touchH5LocationCallback(null, position, func);
                }, function (err) {
                    window.touchH5LocationCallback && window.touchH5LocationCallback(err, null, func);
                },
                    { enableHighAccuracy: 1, maximumAge: 10000, timeout: 5000 });

        } else {
            // var r = {
            //   tips: "浏览器不支持定位"
            // };
            // "function" == typeof func ? func(r) : "[object Object]" === Object.prototype.toString.call(func) && func.fn && func.fn(r)
            if (typeof isQQ == 'undefined' || !isQQ) {
                HN_Location.init(func, true);
            }
        }
    },
    // 百度定位
    baiduMap: function (func) {
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function (r) {
            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                var geoc = new BMap.Geocoder();
                geoc.getLocation(r.point, function (rs) {

                    if (rs.surroundingPois == "" || rs.surroundingPois == undefined) {
                        var LocationName = rs.addressComponents.street + rs.addressComponents.streetNumber;
                    } else {
                        var LocationName = rs.surroundingPois[0].title;
                    }
                    var address = rs.address;
                    var lng = rs.point.lng;
                    var lat = rs.point.lat;
                    var province = rs.addressComponents.province;
                    var city = rs.addressComponents.city;
                    var district = rs.addressComponents.district;
                    district = district != undefined ? district : '';
                    city = city ? city : district;  //自治县的情况，city可能没有数据

                    LocationName = LocationName ? LocationName : district;
                    var data = { 'name': LocationName, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                    // HN_Location.cookie('set', data);
                    // func(data);
                    HN_Location.lnglatGetTown(data, func)
                });
            }
            else {
                func(isDebug ? this.getStatus() : '');
                // alert('failed'+this.getStatus());
            }
        }, { enableHighAccuracy: true })

    },

    // 百度小程序地图定位
    baiduMiniMap: function (func) {
        swan.webView.getEnv(function (res) {
            if (res.smartprogram) {
                swan.getLocation({
                    type: 'gcj02',
                    altitude: true,
                    needFullAccuracy: true,
                    success: rs => {
                        var lng = rs.longitude; //纬度
                        var lat = rs.latitude; //经度
                        var province = rs.province;
                        var city = rs.city;
                        var district = rs.district;
                        district = district != undefined ? district : '';
                        var address = rs.street;
                        var LocationName = province + city + district + address;
                        LocationName = LocationName ? LocationName : district;
                        city = city ? city : district;  //自治县的情况，city可能没有数据
                        var data = { 'name': address, 'address': LocationName, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                        // HN_Location.cookie('set', data);
                        // func(data);
                        HN_Location.lnglatGetTown(data, func)
                    },
                    fail: err => {
                        console.log('openLocation fail', err);
                        func(isDebug ? err : '')
                    }
                });
            }
        });
    },
    // 谷歌定位
    googleMap: function (func) {
        if (navigator.geolocation) {

            //获取当前地理位置
            navigator.geolocation.getCurrentPosition(function (position) {
                var coords = position.coords;
                lat = coords.latitude;
                lng = coords.longitude;

                //指定一个google地图上的坐标点，同时指定该坐标点的横坐标和纵坐标
                var latlng = new google.maps.LatLng(lat, lng);
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'location': latlng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        var time = Date.parse(new Date());
                        var resultArr = results[0].address_components, address = "", LocationName = "", province = "", city = "", district = "";

                        for (var i = 0; i < resultArr.length; i++) {
                            var type = resultArr[i].types[0] ? resultArr[i].types[0] : 0;
                            if (type && type == "street_number") {
                                LocationName = resultArr[i].short_name;
                            }
                            if (type && type == "route") {
                                address = address + resultArr[i].short_name;
                            }
                            if (type && type == "political") {
                                district = resultArr[i].short_name;
                            }
                            if (type && type == "locality") {
                                city = resultArr[i].short_name;
                            }
                            if (type && type == "administrative_area_level_1") {
                                province = resultArr[i].short_name;
                            }
                        }

                        LocationName = LocationName ? LocationName : district;
                        address = address ? address : results[0].formatted_address;
                        city = city ? city : district;  //自治县的情况，city可能没有数据
                        var data = { 'name': LocationName + ' ' + address, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                        // HN_Location.cookie('set', data);
                        // func(data);
                        HN_Location.lnglatGetTown(data, func)

                    } else {
                        func();
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });

            }, function getError(error) {
                func();
                switch (error.code) {
                    case error.TIMEOUT:
                        console.log(langData['siteConfig'][22][100]);//超时
                        break;
                    case error.PERMISSION_DENIED:
                        console.log(langData['siteConfig'][22][101]);//用户拒绝提供地理位置
                        break;
                    case error.POSITION_UNAVAILABLE:
                        console.log(langData['siteConfig'][22][102]);//地理位置不可用
                        break;
                    default:
                        break;
                }
            })
        } else {
            func();
            alert(langData['waimai'][3][72])
        }
    },
    // 腾讯定位
    qqMap: function (func) {
        if (navigator.geolocation) {
            var geolocation = new qq.maps.Geolocation(site_map_key, "hn");
            window.addEventListener('message', function (event) {
                // 接收位置信息
                var loc = event.data;

                if (loc && loc.module == 'geolocation') {
                    lat = loc.lat;
                    lng = loc.lng;

                    geocoder = new qq.maps.Geocoder({
                        complete: function (result) {
                            var data = result.detail;

                            if (data.nearPois == "" || data.nearPois == undefined) {
                                var LocationName = data.addressComponents.street;
                            } else {
                                var LocationName = data.nearPois[0].name;
                            }
                            var address = data.addressComponents.province + data.addressComponents.city + data.addressComponents.district + data.addressComponents.street + data.addressComponents.streetNumber;
                            var lng = data.location.lng;
                            var lat = data.location.lat;
                            var province = data.addressComponents.province;
                            var city = data.addressComponents.city;
                            var district = data.addressComponents.district;
                            district = district != undefined ? district : '';
                            city = city ? city : district;  //自治县的情况，city可能没有数据

                            LocationName = LocationName ? LocationName : district;
                            var data = { 'name': LocationName, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                            // HN_Location.cookie('set', data);
                            // func(data);

                            HN_Location.lnglatGetTown(data, func)

                        }
                    });
                    var coord = new qq.maps.LatLng(lat, lng);
                    geocoder.getAddress(coord);

                } else {
                }
            }, false);
        } else {
            func();
        }
    },

    // qq小程序定位
    // qqMiniMap: function(func){
    // 	alert('111')
    // 	 qq.miniProgram.getEnv(function (res) {
    // 	 	if(res.miniprogram){
    // 	 		alert('33')
    // 	 		qq.getLocation({
    //   type: 'gcj02',
    //   success(rs) {
    //   	alert('22')
    //     // const latitude = res.latitude
    //     // const longitude = res.longitude
    //     // const speed = res.speed
    //     // const accuracy = res.accuracy
    //   },
    //   fail(err) {
    //   	alert('qqq')
    //   }
    // })
    // 	 	}
    // 	 });

    // },
    // 高德定位
    amap: function (func) {
        mapObj = new AMap.Map('map_amap');
        mapObj.plugin('AMap.Geolocation', function () {
            var geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                convert: true           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            });

            geolocation.getCurrentPosition(function (status, result) {
                if (result.info == "SUCCESS") {

                    var lat = result.position.lat;
                    var lng = result.position.lng;
                    if (result.addressComponent.neighborhood != "") {
                        var LocationName = result.addressComponent.neighborhood;
                    } else if (result.addressComponent.street != "") {
                        var LocationName = result.addressComponent.street + result.addressComponent.streetNumber;
                    } else {
                        var LocationName = result.addressComponent.district;
                    }
                    var address = result.formattedAddress;
                    var province = result.addressComponent.province;
                    var city = result.addressComponent.city;
                    var district = result.addressComponent.district;
                    district = district != undefined ? district : '';

                    // city = city == '' ? province : city;
                    city = city ? city : district;  //自治县的情况，city可能没有数据
                    LocationName = LocationName ? LocationName : district;
                    var data = { 'name': LocationName, 'address': address, 'lng': lng, 'lat': lat, 'province': province, 'city': city, 'district': district };
                    // HN_Location.cookie('set', data);
                    // func(data);
                    HN_Location.lnglatGetTown(data, func)

                } else {
                    func(isDebug ? result : '');
                }
            });
        });
    },


    /**
     * 天地图定位
    */
   tmap: function (func) {
    // 设置显示地图的中心点和级别
    var lo = new T.Geolocation();
    var lc = new T.LocalCity();
    lo.getCurrentPosition(function (e) { 
        if(this.getStatus() == 0 || this.getStatus() == 1){
            var lat = e.lnglat.lat;
            var lng = e.lnglat.lng;
            HN_Location.lnglatGetTown({lng:lng,lat:lat}, func)
        } else {
            func(isDebug?e:'')
            lc.location(function (a) {
                console.log(a);
            });
        }
    });
   },




    //根据GPS坐标获取详细信息
    getLocationByGeocoding: function (c, func) {
        var f = {
            latitude: c.coords.latitude,
            longitude: c.coords.longitude
        };
        var moduleName = typeof modelType != 'undefined' ? modelType : '';

        //高德地图坐标转换
        if (site_map == "amap") {
            AMap.convertFrom(f.longitude + ',' + f.latitude, 'gps', function (status, result) {
                if (result.info === 'ok') {

                    var resLnglat = result.locations[0];
                    f.latitude = resLnglat.lat;
                    f.longitude = resLnglat.lng;

                    var url = (typeof masterDomain != "undefined" ? masterDomain : "") + "/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&module="+moduleName+"&location=" + f.latitude + "," + f.longitude;
                    return void $.ajax({
                        url: url,
                        dataType: "jsonp",
                        success: function (b) {
                            if (b && b.state == 100) {
                                func && func(b.info)
                            } else {
                                let dinfo = {
                                    ...f,
                                    error:b.info
                                }
                                func &&func(dinfo);
                            }
                        },
                        error: function (b) {
                            let dinfo = {
                                ...f,
                                error:b.info
                            }
                            func &&func(dinfo);
                        }
                    })
                }
            })
        } else {

            var lat = f.latitude;
            var lng = f.longitude;

            //百度地图坐标需要转换
            if (site_map == "baidu") {
                var result = gcoord.transform([lng, lat], gcoord.WGS84, gcoord.BD09);
                lng = result[0];
                lat = result[1];
            }
            
            var url = (typeof masterDomain != "undefined" ? masterDomain : "") + "/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&module="+moduleName+"&location=" + lat + "," + lng;
            return void $.ajax({
                url: url,
                dataType: "jsonp",
                success: function (b) {
                    if (b && b.state == 100) {
                        func && func(b.info)
                    } else {
                        func &&func(f);
                    }
                },
                error: function () {
                    func &&func(f);
                }
            })

        }
    },

    //GPS获取失败
    getLocationError: function (c) {
        var d = {};
        switch (c.code) {
            case c.PERMISSION_DENIED:
                d.tips = langData['siteConfig'][38][9],//用户拒绝获取地理位置
                    d.reject = !0;
                break;
            case c.POSITION_UNAVAILABLE:
                d.tips = langData['siteConfig'][38][10];//位置信息不可用
                break;
            case c.TIMEOUT:
                d.tips = langData['siteConfig'][38][11];//获取用户位置请求超时
                break;
            case c.UNKNOWN_ERROR:
                d.tips = langData['siteConfig'][38][12] //获取位置失败，请重试
        }
        h5LocationInit.fn && h5LocationInit.fn(d)
    },

    // 坐标转换获取城镇
    lnglatGetTown: function (locationData, func) {
        var moduleName = typeof modelType != 'undefined' ? modelType : '';
        if (locationData) {
            var latlng = locationData.lat + ',' + locationData.lng;
            $.ajax({
                url: '/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&module='+moduleName+'&location=' + latlng,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if(data.state == 100){
                        locationData['district'] = data.info.district;
                        locationData['city'] = data.info.city;
                        locationData['lng'] = data.info.lng;
                        locationData['lat'] = data.info.lat;
                        locationData['province'] = data.info.province;
                        locationData['town'] = data.info.town;
                        
                        //如果位置名没有获取到，直接使用详情地址
                        if (locationData['name'] == '') {
                            locationData['name'] = locationData['address'];
                        }
                    }
                    HN_Location.cookie('set', locationData);
                    func(locationData);
                },
                error: function () {
                }
            });
        }
    }
}
