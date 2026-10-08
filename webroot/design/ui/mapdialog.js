define(function(require) {
    function t(t, a) {
        var i = t.indexOf("?") > -1 ? "&": "?",
        e = [];
        return $.each(a,
        function(t, a) {
            e.push(t + "=" + encodeURIComponent(a).replace(/%2C/g, ","))
        }),
        t + (e.length ? i + e.join("&") : "")
    }
    var $ = require("jquery"),
    a = require("class"),
    i = require("ui/dialog");
    require("./mapdialog/style.css");
    var e, s = a({
        initialize: function(a) {
            $.isPlainObject(a) || (a = {}),
            a.width = 550,
            this.wrapper = $('<div class="ui-map-dialog"><div class="ui-dialog-title draggable">标注地图</div><div class="ui-map-dialog-content"></div><div class="ui-dialog-footer"><input type="submit" class="btn btn-primary" value="确定" /></div></div>'),
            this.mapContent = this.wrapper.find(".ui-map-dialog-content"),
            this.footer = this.wrapper.find(".ui-dialog-footer");
            var i = this;
            this.footer.find(".btn").click(function() {
                var a, e, s = null;
                i.map.map && (s = {},
                a = i.map.map.getCenter(), e = i.map.map.getZoom(), s.zoom = e, s.center = {
                    lat: a.lat,
                    lng: a.lng
                },
                s.city = i.map.city, s.marker = i.map.markerPoint, s.image = t("https://api.map.baidu.com/staticimage", {
                    center: a.lng + "," + a.lat,
                    zoom: e,
                    markers: i.map.markerPoint.lng + "," + i.map.markerPoint.lat
                }), s.link = t("https://map.baidu.com/", {
                    latlng: i.map.markerPoint.lat + "," + i.map.markerPoint.lng,
                    title: "地图位置",
                    content: "地图位置"
                })),
                i.container.trigger("dialog.save", [s]),
                i.close()
            }),
            this.initialized = !1,
            s.superclass.initialize.apply(this, [a])
        },
        ready: function(t) {
            this.isReady ? t.call(this) : this.readyList && this.readyList.push(t)
        },
        open: function(t) {
            s.superclass.open.apply(this, [this.initialized ? null: this.wrapper]),
            this.initialized = !0,
            this.mapContent.addClass("loading"),
            this.isReady = !1,
            this.readyList = [],
            this.map = {},
            this.buildMap(),
            this.ready(function() {
                this.mapContent.removeClass("loading"),
                this.setParams(t)
            })
        },
        buildMap: function() {
            var baidu_api = '';
            if(location.protocol == 'https:'){
                baidu_api += 'https://api.map.baidu.com/api?v=3.0&s=1&ak='+(window.baidu_mapkey ? window.baidu_mapkey : '');
            }else{
                baidu_api += 'http://api.map.baidu.com/api?v=1.4';
            }
            var t = '<!DOCTYPE html><head><link rel="stylesheet" href="/design/diy.css"><link rel="stylesheet" href="/design/ui/mapdialog/iframe.css"><script src="'+baidu_api+'"></script><script src="/design/ui/CityList_min.js"></script></head><body><div class="map-container"><div class="map-header"><div class="map-search"><form method="get"><input type="text" placeholder="搜索城市或位置" size="20" /><input type="submit" value="搜索" class="btn" /><span class="map-search-loading"></span><div class="map-search-result"></div></form></div><div class="map-city"><span class="map-city-current"></span><span class="map-city-trigger">切换城市</span></div></div><div class="map-content"><div class="map-canvas"></div><div id="map-city-list" class="map-city-list"></div></div></div></body></html>',
            a = this;
            this.iframe = $("<iframe></iframe>", {
                frameborder: 0,
                hidefocus: "true",
                src: "javascript:void(function(){document.open();document.write('" + t + "');document.close();}())"
            }),
            this.readyList = [],
            this.iframe.on("load",
            function() {
                a.map.window = this.contentWindow,
                a.map.document = this.contentWindow.document,
                a.map.window.BMap && a.buildControl()
            }),
            this.wrapper.find(".ui-map-dialog-content").append(this.iframe)
        },
        buildControl: function() {
            var t = this,
            a = this.map.window,
            i = $(this.map.document);
            this.map.canvas = i.find(".map-canvas"),
            this.map.map = new a.BMap.Map(this.map.canvas[0], {
                enableMapClick: !1
            }),
            this.map.map.enableScrollWheelZoom(),
            this.map.map.enableKeyboard(),
            this.map.map.enableInertialDragging(),
            this.map.map.enableContinuousZoom(),
            this.map.map.addControl(new a.BMap.NavigationControl({
                anchor: a.BMAP_ANCHOR_TOP_LEFT,
                type: a.BMAP_NAVIGATION_CONTROL_LARGE
            })),
            this.map.map.addEventListener("click",
            function(a) {
                t.panToPosition(a)
            }),
            this.map.cityListContainer = i.find("#map-city-list"),
            this.map.cityName = i.find(".map-city-current"),
            this.map.cityTrigger = i.find(".map-city-trigger"),
            this.map.cityList = new a.BMapLib.CityList({
                container: "map-city-list",
                map: this.map.map
            }),
            this.map.cityList.addEventListener("cityclick",
            function(a) {
                t.setCity({
                    name: a.name,
                    center: {
                        lat: a.center.lat,
                        lng: a.center.lng
                    },
                    level: a.zoom
                }),
                t.setMarker(a.center),
                t.map.cityListContainer.hide()
            }),
            this.map.cityTrigger.click(function() {
                t.map.cityListContainer.toggle()
            }),
            this.map.searchLoading = i.find(".map-search-loading").hide(),
            this.map.searchResult = i.find(".map-search-result").hide(),
            this.map.searchForm = i.find("form:first"),
            this.map.searchInput = this.map.searchForm.find("[type=text]"),
            this.map.searchLock = !1,
            this.map.localSearch = new a.BMap.LocalSearch(this.map.map),
            this.map.localSearch.enableAutoViewport(),
            this.map.localSearch.enableFirstResultSelection(),
            this.map.localSearch.setSearchCompleteCallback(function(a) {
                var i, e, s = a && a.getCurrentNumPois();
                if (t.map.searchLock = !1, t.map.searchLoading.stop(!0, !0).fadeOut(), !s) return t.renderEmptyResult(),
                void 0;
                if (1 == s) {
                    var n = a.getPoi(0);
                    return a.city && (t.setCity({
                        name: a.city,
                        center: {
                            lat: n.point.lat,
                            lng: n.point.lng
                        },
                        level: t.map.map.getZoom()
                    }), t.setMarker(n.point)),
                    t.panToPosition(n),
                    void 0
                }
                for (e = [], i = 0; s > i; i++) e.push(a.getPoi(i));
                t.renderResult(e,
                function(a) {
                    t.panToPosition(a)
                })
            }),
            this.map.searchForm.submit(function() {
                return t.map.searchLock ? !1 : (t.map.searchLock = !0, t.hideSearchResult(), t.map.searchLoading.stop(!0, !0).fadeIn(), t.map.searchInput.data("keyword", t.map.searchInput.val() || ""), t.map.localSearch.search(t.map.searchInput.val()), !1)
            }),
            this.map.searchResult.css({
                width: this.map.searchInput.outerWidth() - 2,
                left: this.map.searchInput.position().left,
                top: this.map.searchInput.position().top + this.map.searchInput.outerHeight(!0) - 1
            }),
            this.map.searchInput.keypress(function(a) {
                if ((40 == a.keyCode || 38 == a.keyCode || 13 == a.keyCode) && t.map.searchResult.data("keyword") == t.map.searchInput.data("keyword")) {
                    a.stopPropagation();
                    var i = t.map.searchResult.find("li");
                    if (i.length) {
                        if (13 == a.keyCode) {
                            if (i.length <= 1) return t.hideSearchResult(),
                            void 0;
                            var e;
                            return t.map.searchResult.is(":visible") && (e = i.filter(".active")).length && (e.trigger("check"), a.preventDefault()),
                            void 0
                        }
                        t.showSearchResult();
                        var s = i.filter(".active").index();
                        s > -1 && i.eq(s).removeClass("active"),
                        40 == a.keyCode ? (s += 1, s == i.length && (s = 0)) : (s -= 1, -1 > s && (s = i.length - 1)),
                        i.eq(s).addClass("active")
                    }
                }
            }),
            this.isReady = !0;
            for (var e; e = t.readyList.shift();) e.call(t)
        },
        setParams: function(t) {
            function a(t) {
                i.setCity(t.city),
                i.setMarker(t.marker || t.city.center);
                var a = i.createPoint(t.center || t.city.center);
                i.map.map.centerAndZoom(a, t.zoom || t.city.level)
            }
            var i = this;
            if (t && t.city) a(t);
            else {
                var e = new this.map.window.BMap.LocalCity;
                e.get(function(i) {
                    t || (t = {}),
                    t.city = i,
                    a(t)
                })
            }
        },
        setCity: function(t) {
            this.map.city = {
                name: t.name,
                center: {
                    lat: t.center.lat,
                    lng: t.center.lng
                },
                level: t.level || this.map.map.getZoom()
            },
            this.map.cityName.text(t.name)
        },
        setMarker: function(t) {
            this.map.markerPoint = {
                lat: t.lat,
                lng: t.lng
            };
            var a = this.createMarker(this.createPoint(t));
            this.map.map.addOverlay(a)
        },
        createPoint: function(t) {
            return new this.map.window.BMap.Point(t.lng, t.lat)
        },
        createMarker: function(t, a) {
            this.map.marker && this.map.map.removeOverlay(this.map.marker),
            this.map.marker = new this.map.window.BMap.Marker(t, {
                enableDragging: !0,
                title: a || ""
            });
            var i = this;
            return this.map.marker.addEventListener("dragend",
            function(t) {
                i.map.markerPoint = {
                    lng: t.point.lng,
                    lat: t.point.lat
                }
            }),
            this.map.marker
        },
        panToPosition: function(t) {
            var a = this.createPoint(t.point);
            this.map.map.panTo(a),
            this.setMarker(a)
        },
        renderEmptyResult: function() {
            this.map.searchResult.empty().html("没有搜索到结果"),
            this.map.searchResult.removeData("keyword"),
            this.showSearchResult()
        },
        renderResult: function(t, a) {
            var i = this;
            this.map.searchResult.empty().append("<ul></ul>");
            var e = this.map.searchResult.find("ul");
            $.each(t,
            function(t, s) {
                var n = $("<li>" + s.title + "</li>").appendTo(e);
                n.bind("click check",
                function(t) {
                    n.addClass("active").siblings().removeClass("active"),
                    i.map.searchInput.val(s.title),
                    a(s),
                    t.stopPropagation(),
                    i.hideSearchResult()
                }),
                0 == t % 2 && n.addClass("odd")
            }),
            this.map.searchResult.data("keyword", this.map.searchInput.val() || ""),
            this.showSearchResult()
        },
        showSearchResult: function() {
            this.map.searchResult.show();
            var t = this;
            $(this.map.document).on("click.search",
            function(a) {
                var i = $(a.target);
                i.closest(t.map.searchResult).length || i.is(t.map.searchInput) || t.hideSearchResult()
            })
        },
        hideSearchResult: function() {
            this.map.searchResult.hide(),
            $(this.map.document).off("click.search")
        },
        close: function() {
            this.iframe && (this.iframe.remove(), this.iframe = null),
            this.isReady = !1,
            this.readyList = [],
            this.map = {},
            s.superclass.close.apply(this)
        }
    },
    i);
    return s.getInstance = function() {
        return e || (e = new s)
    },
    s
});
