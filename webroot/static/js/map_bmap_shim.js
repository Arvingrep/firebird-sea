/*!
 * map_bmap_shim.js — 商家后台 BMap 兼容层（用 google.maps 实现）
 *
 * 用途
 *   商家后台「配送范围」页脚本 webroot/static/js/wmsj/shop/waimaiShopAdd.js 是纯百度实现
 *   （全文 0 处 site_map 判断）。站点地图为 Google 时，本文件补齐它依赖的
 *   BMap.* / BMapLib.DrawingManager 子集，让商家端脚本**一行不改**就能跑。
 *   引入点：wmsj/templates/shop/waimaiShopAdd.html，紧跟 {#$site_map_apiFile#} 之后，
 *   条件 {#if $site_map != 'baidu'#} —— 百度站点不会加载本文件。
 *
 * 生效条件（两条都满足才接管，否则整体 return，页面行为与改动前完全一致）
 *   1. 真 Google SDK 在场：google.maps.Map / OverlayView / event 三者齐备。
 *      key 缺失时 include/common.inc.php 会用 /static/js/map_fallback.js 顶替，
 *      那个假桩没有 OverlayView 与 event —— 本层不接管，保持现有静默降级（白屏但不报错）。
 *   2. window.BMap 不是真百度 API（真 Baidu 的 BMap.Point 有 getLng）—— 防止误引覆盖。
 *      运行两次（重复引入）时第 2 条会命中，天然幂等。
 *
 * 坐标约定
 *   BMap.Point(lng, lat) 与 google.maps.LatLng(lat, lng) 参数顺序相反，本层内部统一转序，
 *   对外一律保持百度语义。商家端 :435 传的是 (经度, 纬度) = (#coordinate_y_, #coordinate_x_)，
 *   data-points 属性格式为 "lng,lat|lng,lat"（:471-473、:1057）。
 *   坐标纠偏（BD09 ↔ WGS84）本次不做：本站服务区在菲律宾马尼拉，
 *   BD09 只在华语区与 WGS84 有偏移，华语区外两者数值等价，直接透传。
 *
 * 已知差异（有意为之，详见 .agent-runs/2026-11-16/task-001/implement-report.md）
 *   - strokeStyle:'dashed' 在 google.maps.Polygon/Circle 上没有对应能力（只有 Polyline 能用
 *     icons 画虚线），退化为实线；颜色/线宽/透明度不受影响。
 *   - gestureHandling:'greedy'：触屏单指就能拖图和拖顶点。Google 默认是 cooperative
 *     （两指拖图、单指滚页面），那样顶点编辑在手机上根本触发不了。
 *   - 画区交互由本层自己实现（Google drawing 库已废弃且本站未加载）：
 *     单击加点，双击或点回起点闭合，闭合后以 polygon 覆盖物**本身**派发 polygoncomplete。
 */
(function (w) {
    'use strict';

    var googleMaps = (w.google && w.google.maps) || null;

    // ------------------------------------------------------------------ 工具

    // 真百度 API 特征：Map.prototype.getBounds + Point 有 getLng。
    // map_fallback.js 的 DummyMap/Point 两者都没有，所以它能被本层覆盖；
    // 真百度 API 在场时本层必须让位。
    function isRealBaiduApi(api) {
        if (!api || typeof api.Map !== 'function' || !api.Map.prototype) {
            return false;
        }
        if (typeof api.Map.prototype.getBounds !== 'function') {
            return false;
        }
        if (typeof api.Point !== 'function') {
            return false;
        }
        try {
            return typeof (new api.Point(0, 0)).getLng === 'function';
        } catch (e) {
            return false;
        }
    }

    // -------------------------------------------------------------- 生效判定

    if (!googleMaps || typeof googleMaps.Map !== 'function' ||
            !googleMaps.OverlayView || !googleMaps.event) {
        return; // 不是真 Google SDK（含 map_fallback 假桩）：整体不接管，绝不抛错
    }
    if (isRealBaiduApi(w.BMap)) {
        return; // 真百度 API 已在场：让位，避免覆盖
    }

    // ---------------------------------------------------------------- 常量区

    var DEFAULT_LNG = 120.9842;       // 兜底中心，与 map_fallback.js 保持一致（马尼拉）
    var DEFAULT_LAT = 14.5995;
    var CIRCLE_SEGMENTS = 64;         // BMap.Circle.getPath() 的离散段数
    var CLOSE_PIXEL_TOLERANCE = 12;   // 「点回起点闭合」的像素容差
    var DBLCLICK_ROLLBACK_MS = 600;   // 双击闭合时回退刚落下的那个顶点
    var EARTH_RADIUS = 6378137;       // 米，WGS84 长半轴

    // 百度全局常量。map_fallback.js 已定义的（如 BMAP_STATUS_SUCCESS）不重复覆盖。
    function defineConst(name, value) {
        if (typeof w[name] === 'undefined') {
            w[name] = value;
        }
    }

    defineConst('BMAP_ANCHOR_TOP_LEFT', 0);
    defineConst('BMAP_ANCHOR_TOP_RIGHT', 1);
    defineConst('BMAP_ANCHOR_BOTTOM_LEFT', 2);
    defineConst('BMAP_ANCHOR_BOTTOM_RIGHT', 3);
    defineConst('BMAP_NAVIGATION_CONTROL_LARGE', 0);
    defineConst('BMAP_NAVIGATION_CONTROL_SMALL', 1);
    defineConst('BMAP_NAVIGATION_CONTROL_PAN', 2);
    // 绘制类型：百度是字符串常量，商家端只做相等比较与透传
    defineConst('BMAP_DRAWING_MARKER', 'marker');
    defineConst('BMAP_DRAWING_CIRCLE', 'circle');
    defineConst('BMAP_DRAWING_POLYLINE', 'polyline');
    defineConst('BMAP_DRAWING_POLYGON', 'polygon');
    defineConst('BMAP_DRAWING_RECTANGLE', 'rectangle');
    // 状态码：只定义本文件真正会产出的三个（取值同百度文档）
    defineConst('BMAP_STATUS_SUCCESS', 0);
    defineConst('BMAP_STATUS_UNKNOWN_LOCATION', 2);
    defineConst('BMAP_STATUS_PERMISSION_DENIED', 6);

    // ---------------------------------------------------------------- 坐标区

    function toNum(value, fallback) {
        var n = parseFloat(value);
        return isNaN(n) ? fallback : n;
    }

    // BMap.Point：百度是自有对象，既有 .lng/.lat 数值属性（:531 path[p].lng 直接读），
    // 又有 getLng()/getLat()（部分调用点走方法）。两者都要有。
    // 入参可能是字符串（:435 传的是 input.val()），parseFloat 后再存；
    // 空值退化为兜底中心 —— 不能把 NaN 交给 google.maps.LatLng，它会抛 InvalidValue
    // 直接中断整段脚本，比百度「显示空白」更糟。
    function BMapPoint(lng, lat) {
        if (!(this instanceof BMapPoint)) {
            return new BMapPoint(lng, lat);
        }
        this.lng = toNum(lng, DEFAULT_LNG);
        this.lat = toNum(lat, DEFAULT_LAT);
    }
    BMapPoint.prototype.getLng = function () {
        return this.lng;
    };
    BMapPoint.prototype.getLat = function () {
        return this.lat;
    };
    BMapPoint.prototype.equals = function (other) {
        return !!other && this.lng === other.lng && this.lat === other.lat;
    };

    function pointToLatLng(point) {
        return new googleMaps.LatLng(point.lat, point.lng); // 百度 (lng, lat) → Google (lat, lng)
    }

    // google LatLng 的 lat/lng 是方法；map_fallback 的假 LatLng 也是方法，
    // 但为了容错（有些库直接塞 {lat:..,lng:..} 对象）两种都读。
    function latOf(latLng) {
        return typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    }
    function lngOf(latLng) {
        return typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    }
    function latLngToPoint(latLng) {
        return new BMapPoint(lngOf(latLng), latOf(latLng));
    }
    function pointsToLatLngs(points) {
        var out = [], i;
        for (i = 0; i < points.length; i++) {
            if (points[i]) {
                out.push(pointToLatLng(points[i]));
            }
        }
        return out;
    }
    function latLngsToPoints(latLngs) {
        var out = [], i;
        for (i = 0; i < latLngs.length; i++) {
            if (latLngs[i]) {
                out.push(latLngToPoint(latLngs[i]));
            }
        }
        return out;
    }

    // 两个经纬度在当前缩放级别下的像素距离。不依赖 google.maps.geometry
    // （本站 API 只加载了 libraries=places），用 Web Mercator 公式自算。
    function projectToPixel(gmap, latLng) {
        var scale = 256 * Math.pow(2, gmap.getZoom() || 15);
        var siny = Math.sin(latOf(latLng) * Math.PI / 180);
        siny = Math.min(Math.max(siny, -0.9999), 0.9999);
        return {
            x: scale * (0.5 + lngOf(latLng) / 360),
            y: scale * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
        };
    }

    // ---------------------------------------------------------------- 样式区

    function isColor(value) {
        return typeof value === 'string' && /\S/.test(value);
    }

    // 百度 styleOptions → Google 覆盖物样式。
    // 关键点：Google 对颜色极其挑剔，空串/非法值会抛 InvalidValue，而商家端确实用
    // fillColor:"" 表达「不填充」（:483/:961/:1105）→ 空值一律不下发，改用 fillOpacity:0。
    function toGooglePolyStyle(opts) {
        opts = opts || {};
        var style = {};
        if (isColor(opts.strokeColor)) {
            style.strokeColor = opts.strokeColor;
        }
        if (typeof opts.strokeWeight === 'number') {
            style.strokeWeight = opts.strokeWeight;
        }
        if (typeof opts.strokeOpacity === 'number') {
            style.strokeOpacity = opts.strokeOpacity;
        }
        if (isColor(opts.fillColor)) {
            style.fillColor = opts.fillColor;
            style.fillOpacity = typeof opts.fillOpacity === 'number' ? opts.fillOpacity : 0.4;
        } else {
            style.fillOpacity = 0; // 百度 fillColor 为空即无填充效果
        }
        // opts.strokeStyle（'solid'/'dashed'）无对应能力，见文件头「已知差异」
        return style;
    }

    // ------------------------------------------------------------ 覆盖物基类

    var overlaySeq = 0;

    // 商家端 :547/:603 用 `target.K == overlays[o].K` 认覆盖物，
    // 所以 K 必须稳定（同一实例多次访问不变）且唯一（不同实例不相等）。
    function nextOverlayKey(prefix) {
        overlaySeq += 1;
        return 'bmapshim_' + prefix + overlaySeq;
    }

    function fireListeners(target, type, arg) {
        var arr = target._listeners && target._listeners[type];
        if (!arr) {
            return;
        }
        for (var i = 0; i < arr.length; i++) {
            arr[i].call(target, arg);
        }
    }

    function addListenerTo(target, type, fn) {
        if (!target._listeners[type]) {
            target._listeners[type] = [];
        }
        target._listeners[type].push(fn);
    }

    // Google 里「可点击的覆盖物」会把地图的 click 事件吃掉（点在已保存的配送区域上时
    // 地图收不到 click）。画区期间必须临时把已有覆盖物设为不可点击，否则
    // 「在旧区域上面画新区域」这一步根本加不出顶点；结束时立刻恢复。
    function setOverlayClickable(googleObject, clickable) {
        if (!googleObject) {
            return;
        }
        if (typeof googleObject.setClickable === 'function') {
            googleObject.setClickable(clickable);
        } else if (typeof googleObject.setOptions === 'function') {
            googleObject.setOptions({ clickable: clickable });
        }
    }

    // ----------------------------------------------------------------- Marker

    function BMapMarker(point, opts) {
        if (!(this instanceof BMapMarker)) {
            return new BMapMarker(point, opts);
        }
        this.K = nextOverlayKey('marker_');
        this._listeners = {};
        this._gmarker = null;
        this._position = point || new BMapPoint(DEFAULT_LNG, DEFAULT_LAT);
        this._opts = opts || {};
    }

    BMapMarker.prototype._shimAttach = function (gmap) {
        if (!gmap) {
            return;
        }
        if (this._gmarker) {
            this._gmarker.setMap(gmap);
            return;
        }
        var self = this;
        this._gmarker = new googleMaps.Marker({
            position: pointToLatLng(this._position),
            map: gmap,
            clickable: true
        });
        googleMaps.event.addListener(this._gmarker, 'click', function (e) {
            fireListeners(self, 'click', {
                type: 'click',
                target: self,
                point: e && e.latLng ? latLngToPoint(e.latLng) : self._position
            });
        });
    };

    BMapMarker.prototype._shimDetach = function () {
        if (this._gmarker) {
            this._gmarker.setMap(null);
        }
    };

    // 供 DrawingManager 在画区期间临时关/开鼠标事件（见 setOverlayClickable 注释）
    BMapMarker.prototype._setInteractive = function (flag) {
        setOverlayClickable(this._gmarker, !!flag);
    };

    // 百度 setMap 收的是 BMap.Map；这里兼容「传 shim 的 Map」与「传 null/undefined」
    BMapMarker.prototype.setMap = function (map) {
        if (map && map._gmap) {
            this._shimAttach(map._gmap);
        } else {
            this._shimDetach();
        }
        return this;
    };

    BMapMarker.prototype.setPosition = function (point) {
        this._position = point;
        if (this._gmarker) {
            this._gmarker.setPosition(pointToLatLng(point));
        }
        return this;
    };

    BMapMarker.prototype.getPosition = function () {
        return this._position;
    };

    BMapMarker.prototype.addEventListener = function (type, fn) {
        addListenerTo(this, type, fn);
        return this;
    };

    BMapMarker.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
            }
        }
        return this;
    };

    // ---------------------------------------------------------------- Polygon

    function normalizePoints(points) {
        var out = [], i, p;
        if (!points) {
            return out;
        }
        for (i = 0; i < points.length; i++) {
            p = points[i];
            if (!p) {
                continue;
            }
            // 商家端一律传 BMap.Point；容错接受 google LatLng
            out.push(p instanceof BMapPoint ? p : latLngToPoint(p));
        }
        return out;
    }

    function BMapPolygon(points, opts) {
        if (!(this instanceof BMapPolygon)) {
            return new BMapPolygon(points, opts);
        }
        this.K = nextOverlayKey('polygon_');
        this._listeners = {};
        this._gpoly = null;
        this._points = normalizePoints(points);
        this._opts = opts || {};
        this._pathEventsBound = false;
    }

    BMapPolygon.prototype._shimAttach = function (gmap) {
        if (!gmap) {
            return;
        }
        if (this._gpoly) {
            this._gpoly.setMap(gmap);
            return;
        }
        var style = toGooglePolyStyle(this._opts);
        style.map = gmap;
        style.paths = pointsToLatLngs(this._points);
        style.editable = false; // 等 enableEditing() 再开，百度语义一致
        style.draggable = false;
        style.clickable = true;
        this._gpoly = new googleMaps.Polygon(style);
    };

    BMapPolygon.prototype._shimDetach = function () {
        if (this._gpoly) {
            this._gpoly.setMap(null);
        }
    };

    // 供 DrawingManager 在画区期间临时关/开鼠标事件（见 setOverlayClickable 注释）
    BMapPolygon.prototype._setInteractive = function (flag) {
        setOverlayClickable(this._gpoly, !!flag);
    };

    // 百度 getPath() 返回 BMap.Point 数组（调用方 :531/:1021 立刻读 .lng/.lat），
    // 不是 Google 的 MVCArray<LatLng>。已上图时读 Google 的实时 path，
    // 这样顶点被拖过之后拿到的就是新坐标。
    BMapPolygon.prototype.getPath = function () {
        if (this._gpoly) {
            var path = this._gpoly.getPath();
            var arr = (path && typeof path.getArray === 'function') ? path.getArray() : path;
            if (arr) {
                return latLngsToPoints(arr);
            }
        }
        return this._points.slice();
    };

    BMapPolygon.prototype.setPath = function (points) {
        this._points = normalizePoints(points);
        if (this._gpoly) {
            this._gpoly.setPath(pointsToLatLngs(this._points));
        }
        return this;
    };

    // 百度 enableEditing()：多边形可拖拽顶点。Google 侧 = editable + draggable。
    BMapPolygon.prototype.enableEditing = function () {
        if (!this._gpoly) {
            return this;
        }
        this._gpoly.setEditable(true);
        this._gpoly.setDraggable(true);
        this._bindPathEvents();
        return this;
    };

    BMapPolygon.prototype.disableEditing = function () {
        if (this._gpoly) {
            this._gpoly.setEditable(false);
            this._gpoly.setDraggable(false);
        }
        return this;
    };

    // 百度 lineupdate：顶点变动后触发，事件对象的 currentTarget 是覆盖物本身
    // （商家端 :543 读 ea.currentTarget 再比 K，随后调用 overlaycomplete()——无参即空操作）。
    // 顶点新坐标已由 Google 就地写进 path，getPath() 不依赖本事件；
    // 这里派发只是为了让「百度语义」完整，即使永不触发也不影响功能。
    BMapPolygon.prototype._bindPathEvents = function () {
        if (this._pathEventsBound || !this._gpoly) {
            return;
        }
        this._pathEventsBound = true;
        var self = this;
        var dispatch = function () {
            fireListeners(self, 'lineupdate', {
                type: 'lineupdate',
                currentTarget: self,
                target: self
            });
        };
        var path = this._gpoly.getPath();
        googleMaps.event.addListener(path, 'set_at', dispatch);
        googleMaps.event.addListener(path, 'insert_at', dispatch);
        googleMaps.event.addListener(path, 'remove_at', dispatch);
    };

    BMapPolygon.prototype.addEventListener = function (type, fn) {
        addListenerTo(this, type, fn);
        return this;
    };

    BMapPolygon.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
            }
        }
        return this;
    };

    // ----------------------------------------------------------------- Circle

    function BMapCircle(center, radius, opts) {
        if (!(this instanceof BMapCircle)) {
            return new BMapCircle(center, radius, opts);
        }
        this.K = nextOverlayKey('circle_');
        this._listeners = {};
        this._gcircle = null;
        this._center = center instanceof BMapPoint ? center : latLngToPoint(center);
        this._radius = toNum(radius, 0); // 百度单位是米，Google 也是米，直接透传
        this._opts = opts || {};
    }

    BMapCircle.prototype._shimAttach = function (gmap) {
        if (!gmap) {
            return;
        }
        if (this._gcircle) {
            this._gcircle.setMap(gmap);
            return;
        }
        var style = toGooglePolyStyle(this._opts);
        style.map = gmap;
        style.center = pointToLatLng(this._center);
        style.radius = this._radius;
        style.clickable = true;
        this._gcircle = new googleMaps.Circle(style);
    };

    BMapCircle.prototype._shimDetach = function () {
        if (this._gcircle) {
            this._gcircle.setMap(null);
        }
    };

    // 供 DrawingManager 在画区期间临时关/开鼠标事件（见 setOverlayClickable 注释）
    BMapCircle.prototype._setInteractive = function (flag) {
        setOverlayClickable(this._gcircle, !!flag);
    };

    BMapCircle.prototype.getCenter = function () {
        return this._center;
    };
    BMapCircle.prototype.setCenter = function (point) {
        this._center = point;
        if (this._gcircle) {
            this._gcircle.setCenter(pointToLatLng(point));
        }
        return this;
    };
    BMapCircle.prototype.getRadius = function () {
        return this._radius;
    };
    BMapCircle.prototype.setRadius = function (radius) {
        this._radius = toNum(radius, 0);
        if (this._gcircle) {
            this._gcircle.setRadius(this._radius);
        }
        return this;
    };

    // 百度 Circle.getPath() 返回圆周近似点集。商家端 :577 drawEnd() 真的会拿它去
    // 重建一个 Polygon（圆 → 多边形是既有行为，不是我们发明的），所以必须给足点数。
    BMapCircle.prototype.getPath = function () {
        return circleRingPoints(this._center, this._radius, CIRCLE_SEGMENTS);
    };

    BMapCircle.prototype.getBounds = function () {
        return this._gcircle ? this._gcircle.getBounds() : null;
    };

    BMapCircle.prototype.addEventListener = function (type, fn) {
        addListenerTo(this, type, fn);
        return this;
    };

    BMapCircle.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
            }
        }
        return this;
    };

    // 给定圆心与半径（米），按大圆公式离散出圆周点。radius=0 时退化为一个点重复，
    // 与百度行为一致（后续仍可被 enableEditing 成多边形）。
    function circleRingPoints(center, radius, segments) {
        var points = [];
        var angular = radius / EARTH_RADIUS;
        var lat1 = center.lat * Math.PI / 180;
        var lng1 = center.lng * Math.PI / 180;
        for (var i = 0; i < segments; i++) {
            var bearing = 2 * Math.PI * i / segments;
            var lat2 = Math.asin(Math.sin(lat1) * Math.cos(angular) +
                Math.cos(lat1) * Math.sin(angular) * Math.cos(bearing));
            var lng2 = lng1 + Math.atan2(
                Math.sin(bearing) * Math.sin(angular) * Math.cos(lat1),
                Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2)
            );
            points.push(new BMapPoint(lng2 * 180 / Math.PI, lat2 * 180 / Math.PI));
        }
        return points;
    }

    // ------------------------------------------------------- 控件（占位，不渲染）

    // Google 自带缩放控件，百度这些控件对象只需要「能 new、能被 addControl 接住」。
    function BMapNavigationControl(opts) {
        if (!(this instanceof BMapNavigationControl)) {
            return new BMapNavigationControl(opts);
        }
        this._opts = opts || {};
    }

    function BMapSize(width, height) {
        if (!(this instanceof BMapSize)) {
            return new BMapSize(width, height);
        }
        this.width = toNum(width, 0);
        this.height = toNum(height, 0);
    }

    // ---------------------------------------------------------------- BMap.Label

    // HTML 气泡标注。派单页用它画骑手/店铺/顾客气泡（waimaiMapAssign.js:23/:209/:243）。
    // 关键约束：点击委托绑在地图容器上（waimaiMapAssign.js:333 $("#map").on("click",".courier",...)），
    // 所以内容必须渲染进地图容器内部 —— OverlayView 的 pane 恰好是地图容器的子节点，冒泡可达。
    // setStyle 键是百度风格的 CSS camelCase（borderWidth/padding/...），CSSOM 原生接受 camelCase 直接赋值。
    function BMapLabel(content, opts) {
        if (!(this instanceof BMapLabel)) {
            return new BMapLabel(content, opts);
        }
        opts = opts || {};
        this.K = nextOverlayKey('label_');
        this._listeners = {};
        this._content = content == null ? '' : String(content);
        this._point = opts.position || null;
        this._offset = opts.offset || null;
        this._style = {};
        this._visible = true;
        this._gmap = null;
        this._ov = null;
        this._div = null;
    }

    BMapLabel.prototype._shimAttach = function (gmap) {
        if (!gmap) {
            return;
        }
        if (this._ov) {
            this._ov.setMap(gmap);
            return;
        }
        var self = this;
        function LabelOverlay() {}
        LabelOverlay.prototype = new googleMaps.OverlayView();
        var ov = new LabelOverlay();
        ov.onAdd = function () {
            var div = document.createElement('div');
            div.style.position = 'absolute';
            div.innerHTML = self._content;
            for (var key in self._style) {
                if (Object.prototype.hasOwnProperty.call(self._style, key)) {
                    div.style[key] = self._style[key];
                }
            }
            if (!self._visible) {
                div.style.display = 'none';
            }
            div.addEventListener('click', function (e) {
                fireListeners(self, 'click', { type: 'click', target: self, domEvent: e });
            });
            self._div = div;
            this.getPanes().overlayMouseTarget.appendChild(div);
            this.draw();
        };
        ov.draw = function () {
            if (!self._div || !self._point) {
                return;
            }
            var projection = this.getProjection();
            if (!projection) {
                return;
            }
            var pixel = projection.fromLatLngToDivPixel(pointToLatLng(self._point));
            var x = pixel && typeof pixel.x === 'number' ? pixel.x : 0;
            var y = pixel && typeof pixel.y === 'number' ? pixel.y : 0;
            if (self._offset) {
                x += toNum(self._offset.width, 0);
                y += toNum(self._offset.height, 0);
            }
            self._div.style.left = x + 'px';
            self._div.style.top = y + 'px';
        };
        ov.onRemove = function () {
            if (self._div && self._div.parentNode) {
                self._div.parentNode.removeChild(self._div);
            }
            self._div = null;
        };
        ov.setMap(gmap);
        this._ov = ov;
        this._gmap = gmap;
    };

    BMapLabel.prototype._shimDetach = function () {
        if (this._ov) {
            this._ov.setMap(null);
        }
    };

    BMapLabel.prototype.setStyle = function (style) {
        if (style && typeof style === 'object') {
            for (var key in style) {
                if (Object.prototype.hasOwnProperty.call(style, key)) {
                    this._style[key] = style[key];
                }
            }
        }
        if (this._div) {
            for (var k in this._style) {
                if (Object.prototype.hasOwnProperty.call(this._style, k)) {
                    this._div.style[k] = this._style[k];
                }
            }
        }
        return this;
    };

    BMapLabel.prototype.setContent = function (content) {
        this._content = content == null ? '' : String(content);
        if (this._div) {
            this._div.innerHTML = this._content;
        }
        return this;
    };

    BMapLabel.prototype.setPosition = function (point) {
        this._point = point;
        if (this._ov) {
            this._ov.draw();
        }
        return this;
    };

    BMapLabel.prototype.getPosition = function () {
        return this._point;
    };

    BMapLabel.prototype.show = function () {
        this._visible = true;
        if (this._div) {
            this._div.style.display = '';
        }
        return this;
    };

    BMapLabel.prototype.hide = function () {
        this._visible = false;
        if (this._div) {
            this._div.style.display = 'none';
        }
        return this;
    };

    BMapLabel.prototype.addEventListener = function (type, fn) {
        addListenerTo(this, type, fn);
        return this;
    };

    BMapLabel.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
            }
        }
        return this;
    };

    // ---------------------------------------------------------------- BMap.Map

    // 百度地图事件名 → Google 事件名。商家端只用 dragend（:623 拖完地图重绘当前多边形），
    // 两者同名；其余按需映射，未列出的按同名直通（不存在的 Google 事件名只是永不触发，不报错）。
    var MAP_EVENT_MAP = {
        click: 'click',
        dblclick: 'dblclick',
        rightclick: 'rightclick',
        mousemove: 'mousemove',
        dragstart: 'dragstart',
        dragend: 'dragend',
        moveend: 'idle',
        zoomend: 'zoom_changed'
    };

    // new BMap.Map("mapview", {enableMapClick:false})
    // 注意入参是 **DOM id 字符串**（不是元素），且此时容器已经有尺寸。
    function BMapMap(id, opts) {
        if (!(this instanceof BMapMap)) {
            return new BMapMap(id, opts);
        }
        opts = opts || {};
        this.K = nextOverlayKey('map_');
        this._overlays = [];
        this._listeners = {};

        var el = typeof id === 'string' ? document.getElementById(id) : id;
        if (!el) {
            // 容器缺失时退化为离屏 div：宁可不显示，也不能让 google.maps.Map 抛错
            // 把整段商家端脚本打断（后续 tab 绑定还会用到地图对象）。
            el = document.createElement('div');
        }
        this._el = el;

        this._gmap = new googleMaps.Map(el, {
            center: new googleMaps.LatLng(DEFAULT_LAT, DEFAULT_LNG),
            zoom: 15,
            zoomControl: true,            // 对应 :445 的 NavigationControl（百度小号缩放）
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: opts.enableMapClick === false ? false : true, // 等价 enableMapClick:false
            disableDoubleClickZoom: true, // 双击保留给「闭合多边形」，不允许缩放抢走
            gestureHandling: 'greedy',    // 触屏单指拖图/拖顶点，见文件头「已知差异」
            scrollwheel: false            // 等 enableScrollWheelZoom(true)
        });
    }

    BMapMap.prototype.centerAndZoom = function (point, zoom) {
        if (point) {
            this._gmap.setCenter(pointToLatLng(point));
        }
        if (typeof zoom === 'number' && !isNaN(zoom)) {
            this._gmap.setZoom(zoom);
        }
        return this;
    };

    BMapMap.prototype.panTo = function (point) {
        if (point) {
            this._gmap.panTo(pointToLatLng(point));
        }
        return this;
    };

    BMapMap.prototype.setCenter = function (point) {
        if (point) {
            this._gmap.setCenter(pointToLatLng(point));
        }
        return this;
    };

    BMapMap.prototype.getCenter = function () {
        var c = this._gmap.getCenter();
        return c ? latLngToPoint(c) : new BMapPoint(DEFAULT_LNG, DEFAULT_LAT);
    };

    BMapMap.prototype.setZoom = function (zoom) {
        if (typeof zoom === 'number' && !isNaN(zoom)) {
            this._gmap.setZoom(zoom);
        }
        return this;
    };

    BMapMap.prototype.getZoom = function () {
        return this._gmap.getZoom();
    };

    BMapMap.prototype.getBounds = function () {
        return this._gmap.getBounds();
    };

    BMapMap.prototype.enableScrollWheelZoom = function () {
        this._gmap.setOptions({ scrollwheel: true });
        return this;
    };

    BMapMap.prototype.disableScrollWheelZoom = function () {
        this._gmap.setOptions({ scrollwheel: false });
        return this;
    };

    // 控件：Google 自带 UI，入参对象仅保存，不渲染（见 BMapNavigationControl 注释）
    BMapMap.prototype.addControl = function (control) {
        this._lastControl = control;
        return this;
    };

    BMapMap.prototype.removeControl = function () {
        return this;
    };

    BMapMap.prototype.addOverlay = function (overlay) {
        if (!overlay) {
            return this;
        }
        if (typeof overlay._shimAttach === 'function') {
            overlay._shimAttach(this._gmap);
        }
        this._overlays.push(overlay);
        return this;
    };

    // 商家端会在 overlays 为空时传 undefined 进来（:681/:775 的 removeOverlay(overlays[0])），
    // 百度对此静默忽略，这里也必须不抛错。
    BMapMap.prototype.removeOverlay = function (overlay) {
        if (!overlay) {
            return this;
        }
        if (typeof overlay._shimDetach === 'function') {
            overlay._shimDetach();
        }
        for (var i = this._overlays.length - 1; i >= 0; i--) {
            if (this._overlays[i] === overlay) {
                this._overlays.splice(i, 1);
            }
        }
        return this;
    };

    BMapMap.prototype.clearOverlays = function () {
        for (var i = this._overlays.length - 1; i >= 0; i--) {
            if (typeof this._overlays[i]._shimDetach === 'function') {
                this._overlays[i]._shimDetach();
            }
        }
        this._overlays = [];
        return this;
    };

    BMapMap.prototype.getOverlays = function () {
        return this._overlays.slice();
    };

    BMapMap.prototype.setViewport = function (points) {
        var bounds = new googleMaps.LatLngBounds();
        var count = 0, i;
        for (i = 0; points && i < points.length; i++) {
            if (points[i]) {
                bounds.extend(pointToLatLng(points[i]));
                count += 1;
            }
        }
        if (count > 0) {
            this._gmap.fitBounds(bounds);
        }
        return this;
    };

    // :623 mapview.addEventListener('dragend', drawEnd)
    // 必须绑到 Google 地图自身的 dragend（用户拖地图结束），不是 marker/polygon 的 dragend。
    BMapMap.prototype.addEventListener = function (type, fn) {
        var self = this;
        var gtype = MAP_EVENT_MAP[type] || type;
        var handle = googleMaps.event.addListener(this._gmap, gtype, function (e) {
            fn.call(self, e);
        });
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }
        this._listeners[type].push({ fn: fn, handle: handle });
        return this;
    };

    BMapMap.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (!fn || arr[i].fn === fn) {
                googleMaps.event.removeListener(arr[i].handle);
                arr.splice(i, 1);
            }
        }
        return this;
    };

    // ------------------------------------------------------- BMapLib.DrawingManager

    // 百度 DrawingManager 的子集。商家端用法（:629-667、:675-721、:795、:851、:883）：
    //   new BMapLib.DrawingManager(mapview, {isOpen:false, drawingType, polygonOptions, ...})
    //   setDrawingMode(BMAP_DRAWING_POLYGON) / open() / close() / disable() / enable()
    //   addEventListener('polygoncomplete', overlaycomplete)
    // drawingToolOptions 那一堆（anchor/offset/scale/drawingTypes）是工具栏 UI 配置，
    // 这里整体忽略 —— 百度那个悬浮工具栏不画，商家端自己有一整套 .opr-bar 按钮。
    function DrawingManager(map, opts) {
        if (!(this instanceof DrawingManager)) {
            return new DrawingManager(map, opts);
        }
        opts = opts || {};
        this._map = map || null;
        this._gmap = (map && map._gmap) || null;
        this._drawingMode = opts.drawingType || w.BMAP_DRAWING_POLYGON;
        // 故意保存引用而不是拷贝：商家端每次新增区域前改写 styleOptions 的颜色（:831），
        // 闭合时实时读，才能让 5 个区域拿到 5 种颜色（跟 :497 初始加载的意图一致）。
        this._polygonOptions = opts.polygonOptions || {};
        this._isOpen = !!opts.isOpen;
        this._listeners = {};
        this._vertices = [];      // 绘制中的顶点（BMap.Point）
        this._preview = null;     // 绘制中的折线预览
        this._clickHandle = null;
        this._dblHandle = null;
        this._lastVertexAt = 0;
    }

    DrawingManager.prototype.addEventListener = function (type, fn) {
        addListenerTo(this, type, fn);
        return this;
    };

    DrawingManager.prototype.removeEventListener = function (type, fn) {
        var arr = this._listeners[type];
        if (!arr) {
            return this;
        }
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i] === fn) {
                arr.splice(i, 1);
            }
        }
        return this;
    };

    DrawingManager.prototype.setDrawingMode = function (mode) {
        this._drawingMode = mode;
        if (this._isOpen) {
            this._unbind(); // 换模式要重新绑定：圆形模式不挂多边形的点击加点
            this._bind();
        }
        return this;
    };

    DrawingManager.prototype.open = function () {
        this._isOpen = true;
        this._bind();
        return this;
    };

    DrawingManager.prototype.close = function () {
        this._isOpen = false;
        this._unbind();
        this._clearPreview();
        this._vertices = [];
        return this;
    };

    // 百度 disable()/enable()：停/开绘制（工具栏保留），本层与 close()/open() 等价
    DrawingManager.prototype.disable = function () {
        return this.close();
    };

    DrawingManager.prototype.enable = function () {
        return this.open();
    };

    DrawingManager.prototype._bind = function () {
        var self = this;
        // 圆形不走鼠标绘制：商家端 drawCircleOpr()（:773-807）直接用 BMap.Circle 构造，
        // 只要求 setDrawingMode 接受 BMAP_DRAWING_CIRCLE 且不抛错。
        if (this._drawingMode !== w.BMAP_DRAWING_POLYGON) {
            return;
        }
        if (!this._gmap || this._clickHandle) {
            return;
        }
        this._clickHandle = googleMaps.event.addListener(this._gmap, 'click', function (e) {
            self._addVertex(e && e.latLng);
        });
        this._dblHandle = googleMaps.event.addListener(this._gmap, 'dblclick', function () {
            self._finish();
        });
        this._gmap.setOptions({ draggableCursor: 'crosshair' });
    };

    DrawingManager.prototype._unbind = function () {
        if (this._clickHandle) {
            googleMaps.event.removeListener(this._clickHandle);
            this._clickHandle = null;
        }
        if (this._dblHandle) {
            googleMaps.event.removeListener(this._dblHandle);
            this._dblHandle = null;
        }
        if (this._gmap) {
            this._gmap.setOptions({ draggableCursor: null });
        }
    };

    DrawingManager.prototype._addVertex = function (latLng) {
        if (!latLng) {
            return;
        }
        // 点回起点闭合：必须先把判定做完再落点，否则 getPath() 末尾会多一个与首点重合的点
        if (this._vertices.length >= 3 && this._isNearFirst(latLng)) {
            this._finish();
            return;
        }
        var point = latLngToPoint(latLng);
        var last = this._vertices[this._vertices.length - 1];
        // 双击在浏览器里先派发两次 click（同一像素 → 同一经纬度），去重掉第二次
        if (last && Math.abs(last.lng - point.lng) < 1e-9 && Math.abs(last.lat - point.lat) < 1e-9) {
            return;
        }
        this._vertices.push(point);
        this._lastVertexAt = new Date().getTime();
        this._drawPreview();
    };

    DrawingManager.prototype._isNearFirst = function (latLng) {
        var first = this._vertices[0];
        if (!first || !this._gmap) {
            return false;
        }
        var a = projectToPixel(this._gmap, pointToLatLng(first));
        var b = projectToPixel(this._gmap, latLng);
        return Math.abs(a.x - b.x) <= CLOSE_PIXEL_TOLERANCE &&
            Math.abs(a.y - b.y) <= CLOSE_PIXEL_TOLERANCE;
    };

    DrawingManager.prototype._drawPreview = function () {
        if (!this._gmap) {
            return;
        }
        var path = pointsToLatLngs(this._vertices);
        var strokeColor = isColor(this._polygonOptions.strokeColor) ?
            this._polygonOptions.strokeColor : '#2691ea';
        var strokeWeight = typeof this._polygonOptions.strokeWeight === 'number' ?
            this._polygonOptions.strokeWeight : 3;
        if (!this._preview) {
            this._preview = new googleMaps.Polyline({
                map: this._gmap,
                path: path,
                clickable: false,
                strokeColor: strokeColor,
                strokeWeight: strokeWeight,
                strokeOpacity: 1,
                zIndex: 2000
            });
        } else {
            this._preview.setPath(path);
            this._preview.setOptions({ strokeColor: strokeColor, strokeWeight: strokeWeight });
        }
    };

    DrawingManager.prototype._clearPreview = function () {
        if (this._preview) {
            this._preview.setMap(null);
            this._preview = null;
        }
    };

    DrawingManager.prototype._finish = function () {
        var points = this._vertices;
        // 双击闭合时浏览器先补了两次 click：上面去重掉一次，这里再回退刚落下的那个顶点
        // （至少保留 3 个，避免「点了 3 下然后双击」把整个图形清空）
        if (points.length > 3 &&
                (new Date().getTime() - this._lastVertexAt) < DBLCLICK_ROLLBACK_MS) {
            points.pop();
        }
        // 不足 3 点不成面：保留已画顶点，等用户继续点，不派发 polygoncomplete
        if (points.length < 3) {
            this._drawPreview();
            return this;
        }

        var polygon = new BMapPolygon(points, this._polygonOptions);
        this._vertices = [];
        this._clearPreview();
        this._unbind();
        this._isOpen = false; // 百度语义：画完一个图形自动停止绘制，下次要再 open()

        // 百度把完成的覆盖物直接挂在地图上（商家端 :535 只 push、从不 addOverlay），
        // 所以这里必须自己上图，否则「看不见但能保存」。
        if (this._map && typeof this._map.addOverlay === 'function') {
            this._map.addOverlay(polygon);
        }
        // 回调第一个参数必须是 polygon 覆盖物本身：商家端 :525 直接 e.getPath()、
        // :535 overlays.push(e)、:537 e.enableEditing()
        fireListeners(this, 'polygoncomplete', polygon);
        return this;
    };

    // ----------------------------------------------------------------- 定位

    // :1549 的 BMap.Geolocation（契约表之外，商家端确实用到）：
    //   new BMap.Geolocation().getCurrentPosition(cb, {enableHighAccuracy:true})
    //   回调里 this.getStatus() == BMAP_STATUS_SUCCESS、r.point.lat / r.point.lng
    // 百度用自家 IP 定位，这里只能退到浏览器 navigator.geolocation（需 HTTPS）。
    function BMapGeolocation() {
        if (!(this instanceof BMapGeolocation)) {
            return new BMapGeolocation();
        }
        this._status = w.BMAP_STATUS_SUCCESS;
    }

    BMapGeolocation.prototype.getStatus = function () {
        return this._status;
    };

    BMapGeolocation.prototype.getCurrentPosition = function (callback, opts) {
        var self = this;
        opts = opts || {};

        function done(point, status) {
            self._status = status;
            if (typeof callback !== 'function') {
                return;
            }
            // 百度语义：回调的 this 指向 Geolocation 实例（商家端 :1553 就是 this.getStatus()）
            callback.call(self, { point: point, status: status });
        }

        var geo = w.navigator && w.navigator.geolocation;
        if (!geo) {
            done(new BMapPoint(DEFAULT_LNG, DEFAULT_LAT), w.BMAP_STATUS_UNKNOWN_LOCATION);
            return this;
        }
        try {
            geo.getCurrentPosition(function (position) {
                var coords = position && position.coords;
                if (!coords) {
                    done(new BMapPoint(DEFAULT_LNG, DEFAULT_LAT), w.BMAP_STATUS_UNKNOWN_LOCATION);
                    return;
                }
                // navigator 给的是 (latitude, longitude)，BMap.Point 要 (lng, lat)
                done(new BMapPoint(coords.longitude, coords.latitude), w.BMAP_STATUS_SUCCESS);
            }, function (error) {
                var denied = error && error.code === 1; // 1 = PERMISSION_DENIED
                done(new BMapPoint(DEFAULT_LNG, DEFAULT_LAT),
                    denied ? w.BMAP_STATUS_PERMISSION_DENIED : w.BMAP_STATUS_UNKNOWN_LOCATION);
            }, {
                enableHighAccuracy: !!opts.enableHighAccuracy,
                timeout: 10000,
                maximumAge: 60000
            });
        } catch (e) {
            done(new BMapPoint(DEFAULT_LNG, DEFAULT_LAT), w.BMAP_STATUS_UNKNOWN_LOCATION);
        }
        return this;
    };

    // ------------------------------------------------------------------ 导出

    // 合并导出而不是整体替换：key 缺失时 map_fallback.js 的桩会提供 InfoWindow/Geocoder 等
    // 本层没有实现的对象，覆盖掉会让别处的调用点变成 undefined。
    var BMap = w.BMap || {};
    BMap.Map = BMapMap;
    BMap.Point = BMapPoint;
    BMap.Marker = BMapMarker;
    BMap.Polygon = BMapPolygon;
    BMap.Circle = BMapCircle;
    BMap.NavigationControl = BMapNavigationControl;
    BMap.Size = BMapSize;
    BMap.Label = BMapLabel;
    BMap.Geolocation = BMapGeolocation;
    w.BMap = BMap;

    var BMapLib = w.BMapLib || {};
    BMapLib.DrawingManager = DrawingManager;
    w.BMapLib = BMapLib;
})(window);
