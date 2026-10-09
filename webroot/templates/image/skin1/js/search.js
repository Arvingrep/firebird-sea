define("waterfall", function() {
    "use strict";
    var e = {
        colWidth: 252,
        container: window,
        create: null,
        reservedWidth: 20,
        init: null,
        load: null,
        maxCols: null,
        maxHeight: 800,
        minCols: 2,
        spaceY: 14,
        specialPosition: null,
        serialize: function(e) {
            return e
        }
    },
    t = {
        throttle: function(e) {
            var t;
            return function() {
                var n = this,
                r = arguments;
                clearTimeout(t),
                t = setTimeout(function() {
                    e.apply(n, r)
                },50)
            }
        },
        initHeights: function(e) {
            var t = e.initHeight,
            n = e.cols,
            r = 0,
            i, s, o;
            s = e.heights = [],
            o = e.margins = [];
            for (; r < n; r++) s[r] = 0,
            o[r] = 0 - t;
            e.specialPosition && (i = e.specialPosition === "left" ? 0 : n - 1, s[i] = t, o[i] = 0)
        },
        getColHeights: function(e) {
            var t = e.prevHeights,
            n = e.heights,
            r = n.length,
            i = e.colElem,
            s = 0,
            o;
            e.fixedHeight = !0;
            for (; s < r; s++) o = t[s] + i.eq(s).outerHeight(),
            o !== n[s] && (e.fixedHeight = !1, n[s] = o)
        },
        getLoadOffset: function(e) {
            e.loadOffset = e.target.outerHeight() + e.targetTop - Math.round(e.containerHeight * 1.5)
        },
        getChangeOffset: function(e, t) {
            var n = t.outerHeight() + t.offset().top;
            t.data("changeOffset", n + e.containerHeight / 2)
        },
        createGroup: function(e) {
            return $('<div class="wf_group"/>').appendTo(e.target)
        },
        createCol: function(e) {
            var t = e.margins,
            n = "",
            r = 0;
            for (; r < e.cols; r++) n += '<ul class="wf_col"' + (t[r] && !e.createOnce ? 'style="margin-top:' + t[r] + 'px"': "") + "/>";
            return $(n).appendTo(e.mainFragment)
        },
        getExtreme: function(e, t) {
            var n = e.length,
            r = e[0],
            i = !1,
            s = 0,
            o = 1,
            u;
            for (; o < n; o++) u = e[o],
            i = t ? u < r: u > r,
            i && (r = u, s = o);
            return {
                index: s,
                item: r
            }
        },
        addCell: function(e, n, r) {
            var i = n.elem || $(e.create(n)),
            s = t.getExtreme(e.heights, !0),
            o = Math.min(n.height, e.maxHeight),
            u = s.index;
            r !== undefined && e.wfCache[r].push({
                height: o,
                elem: i
            }),
            e.heights[u] = s.item + o + e.spaceY,
            e.createOnce ? e.colElem.eq(u).children().length || e.colElem.eq(u).append(i) : e.colElem.eq(u).append(i)
        },
        addCol: function(e, n, r) {
            var i = e.heights,
            s = e.margins,
            o, u, a, f, l;
            n.empty().append(e.mainFragment),
            t.getChangeOffset(e, n);
            if (!e.fixedHeight && r !== undefined) {
                a = e.wfCache[r],
                f = a.length;
                for (l = 0; l < f; l++) a[l].height = a[l].elem.outerHeight();
                t.getColHeights(e)
            }
            u = t.getExtreme(i, !1).item;
            for (l = 0; l < e.cols; l++) s[l] = i[l] - u;
            if (e.initOffset) {
                o = n.outerHeight() + n.offset().top;
                if (o < e.initOffset) {
                    t.loadData(e);
                    return
                }
                e.initOffset = 0
            }
        },
        offlineSort: function(e, n, r) {
            var i = e.heights,
            s = e.margins,
            o = t.getExtreme(i, !1).item,
            u = e.groupElems.eq(n),
            a = e.fragments[n],
            f = 0;
            $(a).empty(),
            a.appendChild(e.mainFragment),
            u.css("height", o - r + "px"),
            t.getChangeOffset(e, u);
            for (; f < e.cols; f++) s[f] = i[f] - o
        },
        removeGroup: function(e) {
            var t = e.removeElem,
            n = t.next(),
            r = r = e.target[0].ownerDocument.createDocumentFragment();
            t.addClass("wf_empty").css({
                visibility: "hidden",
                height: t.height() + "px"
            }),
            r = e.target[0].ownerDocument.createDocumentFragment(),
            t.children().appendTo(r),
            e.fragments.push(r),
            e.revertElem = t,
            n.length && n.hasClass("wf_group") && (e.removeElem = n)
        },
        revertGroup: function(e) {
            var n = e.revertElem,
            r = n.prev();
            n.removeClass("wf_empty").append(e.fragments.pop()).css({
                visibility: "",
                height: ""
            }),
            e.removeElem = n,
            r.length && r.hasClass("wf_group") && (e.revertElem = r, e.scrollTop < r.data("changeOffset") && t.revertGroup(e))
        },
        loadComplete: function(e, n) {
            var r = e.data = e.serialize(n),
            i = e.wfCache.length,
            s = !1,
            o = e.target,
            u;
            if (!r || !r.length) return;
            o.trigger("likecreatebefore", [n]),
            r.length >= e.cols || !e.groupElem ? (e.groupElem = t.createGroup(e), e.groupElems = o.children("div.wf_group"), e.wfCache[i] = [], e.colElem = t.createCol(e)) : (i--, s = !0),
            e.prevHeights = e.heights.concat(),
            $.each(r,
            function(n, r) {
                t.addCell(e, r, i)
            }),
            s || t.addCol(e, e.groupElem, i),
            t.getLoadOffset(e),
            e.removeElem === undefined && (e.removeElem = e.groupElem),
            e.reLoading = !0,
            o.trigger("likecreateafter", [n])
        },
        loadData: function(e) {
            var n = e.load();
            if (n.length === 0) return;
            e.reLoading = !1,
            setTimeout(function() {
                n && (typeof n.done == "function" ? n.done(function(n) {
                    t.loadComplete(e, n)
                }) : t.loadComplete(e, n))
            },
            50)
        },
        bindScroll: function(e) {
            e.container.on("scroll.waterfall",
            function() {
                var n = e.container.scrollTop(),
                r = e.scrollTop,
                i,
                s;
                e.scrollTop = n,
                e.reLoading && ~e.loadOffset && n >= e.loadOffset && t.loadData(e),
                n > r ? e.removeElem !== undefined && e.removeElem.length && (i = e.removeElem.data("changeOffset"), n > i && t.removeGroup(e)) : e.revertElem !== undefined && e.revertElem.length && (s = e.revertElem.data("changeOffset"), n < s && t.revertGroup(e))

            })
        },
        bindResize: function(e) {
            e.container.on("resize.waterfall", t.throttle(function() {
                var n = e.groupElems.filter(".wf_empty").last(),
                    r = n.next(),
                    i = e.containerWidth,
                    s = e.containerHeight,
                    u = e.colWidth,
                    a = e.target,
                    f, l, c;
                e.containerWidth = e.container.width() - e.reservedWidth, e.containerHeight = Math.max(e.container.height(), 600), l = e.containerWidth - e.containerWidth % u, f = l / u, f < e.minCols && (f = e.minCols, l = f * u), f !== e.cols && (!e.maxCols || f <= e.maxCols) ? (e.cols = f, t.initHeights(e), $.each(e.wfCache, function(n, r) {
                    var i = e.groupElems.eq(n),
                        s = t.getExtreme(e.heights, !1).item;
                    e.colElem = t.createCol(e), $.each(r, function(n, r) {
                        t.addCell(e, r)
                    }), i.hasClass("wf_empty") ? t.offlineSort(e, n, s) : t.addCol(e, i)
                }), r.length ? (e.scrollTop = r.offset().top + Math.round(r.height() / 2), e.container.scrollTop(e.scrollTop), e.removeElem = r, e.revertElem = n) : (e.removeElem = e.groupElems.eq(0), delete e.revertElem), t.getLoadOffset(e), a.trigger("likeresize", [l])) : e.containerHeight !== s && t.getLoadOffset(e)
            }))
        },
        init: function(e) {
            $.isWindow(e.container[0]) && (e.container[0].document.documentElement.style.overflowY = "scroll");
            var n, r = e.target,
            i = e.colWidth,
            s = e.maxCols,
            o = e.minCols,
            u, a, f = function() {
                e.initHeight = Math.min(r.height(), e.maxHeight),
                t.initHeights(e),
                t.loadData(e)
            };
            r.css({
                fontSize: "0px",
                lineHeight: "0px"
            }),
            e.containerWidth = e.container.width() - e.reservedWidth,
            e.containerHeight = Math.max(e.container.height(), 600),
            e.initOffset = Math.round(e.containerHeight * 1.5),
            u = e.containerWidth - e.containerWidth % i,
            a = u / i,
            s && a > s ? (u = s * i, a = s) : a < e.minCols && (u = o * i, a = o),
            e.cols = a,
            // r.css("width", u + "px"),
            e.init && (n = e.init(u)),
            n && typeof n.done == "function" ? n.done(f) : f(),
            t.bindScroll(e),
            e.maxCols !== e.minCols && t.bindResize(e)
        }
    },
    n = function(n, r) {
        n = $(n).eq(0),
        r = r || {};
        if (!n.length) return;
        var i = $.extend({},
        e, r);
        this.__o__ = i,
        i.container = $(i.container),
        $.extend(i, {
            target: n,
            mainFragment: n[0].ownerDocument.createDocumentFragment(),
            initHeight: 0,
            targetTop: n.offset().top,
            scrollTop: 0,
            prevHeights: null,
            reLoading: !1,
            fixedHeight: !1,
            wfCache: [],
            fragments: [],
            loadOffset: -1,
            initOffset: 0,
            heights: null,
            margins: null,
            offsets: {},
            containerWidth: 0,
            containerHeight: 0
        }),
        t.init(i)
    };
    n.prototype = {
        on: function(e, t) {
            if (this.__o__) {
                var n = this;
                this.__o__.target.on("like" + e,
                function(r, i) {
                    r.type = e,
                    i && (typeof i == "number" ? r.width = i: r.extraData = i),
                    t.call(n, r),
                    r.stopPropagation()
                })
            }
            return this
        },
        un: function(e) {
            return this.__o__ && this.__o__.target.off("like" + e),
            this
        },
        reload: function() {
            var e = this.__o__;
            e.wfCache = [],
            e.fragments = [],
            e.reLoading = !1,
            e.groupElems.remove(),
            delete e.init,
            delete e.cols,
            delete e.colElem,
            delete e.groupElem,
            delete e.groupElems,
            delete e.removeElem,
            delete e.revertElem,
            delete e.initHeight,
            t.init(e)
        },
        loadEnd: function() {
            this.__o__.reLoading = !1
        }
    },
    $.ui || ($.ui = {}),
    $.ui.Waterfall = n,
    $.ui.bind = t
}),
define("wheel",
function() {
    var e = !!~navigator.userAgent.toLowerCase().indexOf("firefox");
    $.fn.wheel = function(t, n) {
        var r = e ? "DOMMouseScroll": "mousewheel",
        i = function(e) {
            var t = e.originalEvent,
            n = {};
            return "wheelDelta" in t ? n.wheelDelta = Math.round(t.wheelDelta) : "detail" in t && (n.wheelDelta = -t.detail * 40),
            n
        };
        t === "on" ? this.on(r,
        function(e) {
            var t = $.extend(e, i(e));
            n.call(this, e)
        }) : t === "off" && this.off(r, n)
    }
}),
define("desktop",
function() {
    var e = function(e) {
        $('<embed menu="false" width="100%" height="100%" wmode="transparent" quality="high" allowfullscreen="true" allowscriptaccess="always" flashvars="imagesrc=' + e.src + '" src="/static/swf/setDesktop.swf"></embed>').appendTo($(e.elm).html(""))[0].onmousedown = function(e) {
            e = e || window.event;
            if (e.button === 2) return ! 1
        }
    };
    return function(t) {
        var n = t.elm.getElementsByTagName("embed");
        n.length || e(t)
    }
}),
define("waterfall_render", ["waterfall", "wheel", "desktop"],
function(e, t, n) {
    "use strict";
    var r = window.__style__ || "DEFAULT",
    // u = '/include/ajax.php',
    a = 0,         // 当前最后一项的id
    h = /['"]/g,                                            //标题过滤规则
    p = {},
    d = r,
    v,
    y = 0,
    b = $(window),
    w = $(document.body),
    E = {
        DEFAULT: {
            colWidth: 336,
            imgWidth: 326,
            layout: "DEFAULT",
            spaceY: 49
        }
    };

    v = E[d] || E.DEFAULT;
    var N = $("#waterfall"),                            // 容器
    C = $("#loadingBox"),                               // 加载中
    k = $(document),
    L = function() {
        var e;
        return (C.show(), $.ajax({
            url: masterDomain + '/include/ajax.php?service=image&action=alist&page='+atpage+'&pageSize='+pageSize+'&title='+keywords,
            dataType: "jsonp",
            callback: "retuanData",
            success: function(e) {
                if(e){
                    if(e.state == 100){
                        var l = e.info.list.length;
                        if(l > 0){
                            a = e.info.list[l-1].id;
                            atpage++;
                        }
                        if(Number(e.info.pageInfo.page) == e.info.pageInfo.totalPage || l == 0){
                            C.hide(),
                            $("#toend").show(),
                            $(".footer").show();
                        }
                    }else{
                        C.hide();
                        $("#empty").show();
                        // N.off('resize');
                        $(".footer").show();
                    }
                }
            }
        }))
    },
    A = function(e, url) {
        if (!e) return "";
        var e = e.split(/,| /),
        t = '<div class="img_tags">';
        for (var i = 0,s = e.length; i < s; i++) {
            if (!$.trim(e[i])) continue;
            t += '<a href="'+url+'" class="img_tag active">' + e[i] + "</a>";
        }
        return t += "</div>",
        t
    },
    O = {
        DEFAULT: function(e) {
            if (!e.title) return "";
            var t = +e.count,
            n = e.title.replace(h, ""),
            r,
            i,
            s;
            return i = t > 1 ? '<div class="img_num">' + t + "\u5f20</div>": "",
            r = ['<div class="img_info"><div class="img_text">', i],
            r.push('<div class="img_tit" title="', n, '"><a href="',e.url,'" target="_blank">', e.title, "</a></div></div>"),
            r.push(A(e.label, e.url)),
            r.push("</div>"),
            r.join("")
        }
    },
    M = function(e, t) {
        var n = /[^\x00-\xff]/g,
        r = t * 2;
        if (e.replace(n, "**").length <= r) return e;
        for (var i = t,
        s = e.length; i <= s; i++) if (e.substr(0, i).replace(n, "**").length >= r) return e.substr(0, i - 1) + "...";
        return e
    },
    _ = function(e) {
        function u(e) {
            return '';
        }
        var t = "",
        n, i, s, o = "";
        i = O[v.layout](e),
        e.height > 800 && (t = ' style="height:800px;"');
        var a = "";
        n = '<li class="normalCell" data-id="' + e.id + '">' + "<a" + t + ' target="_blank" href="' + e.url + '" class="img_link"><img src="' + e.src + '" width="' + e.width + '" height="' + e.height + '" />' + o + "</a>" + a + i + "</li>";
        return n;
    };
    window.__isInitWaterfall__ = !1;
    var D = function(e) {
        window.__isInitWaterfall__ = !0,
        k.trigger("headlayout", [e])
    },
    P = function(e) {
        e = e.info.list || [];
        var n = v.imgWidth,
        i = e.length,
        s = r,
        o = [],
        u = 0,
        a,
        l,
        c;
        for (; u < i; u++) a = e[u],
        p[a.id] || (p[a.id] = !0, c = v.imgHeight, c || (l = n / parseInt(a.pic_width), c = Math.floor(parseInt(a.pic_height) * l)), o.push({
            id: a.id,
            title: a.title,
            url: a.url,
            src: a.litpic,
            width: n,
            height: c,
            count: a.count,
            tag: a.typeName[1],
            label: a.keywords
        }));
        return o
    },
    H = document.documentElement.clientWidth,
    B,
    j = b.height(),
    F = !1;
    j < k.height() && (F = !0, $(".footer").css("position", "static"));
    var I = {
        colWidth: v.colWidth,
        minCols: 3,
        serialize: P,
        init: D,
        create: _,
        load: L,
        reservedWidth: 40,
        spaceY: v.spaceY,
        specialPosition: $("#tagBox").length ? "left": null
    };

    var R = new $.ui.Waterfall(N, I);
    R.on("resize",function(e) {
        k.trigger("headlayout", [e.width])
    }),
    R.on("createafter",function(e) { ! F && j < k.height() && (F = !0, $(".footer").css("position", "static")),
        e.extraData && e.extraData.end && R.loadEnd()
    });
    var U = $("#waterfall").offset().top;
    $("#gotop").on("click",function() {
        $('html,body').scrollTop(0);
        $("#bottomTags").hide();
    });
    var z = "hide",
    W = "hide",
    X = 0,
    V = null;
    b.wheel("on",function(e) {
        if(b.scrollTop() > 100){
            $('#moreTabs').fadeIn();
        }else{
            $('#moreTabs').fadeOut();
        }
        if($('#bottomTags .list ul li').length == 0){
            return $('#bottomTags').remove();
            V = true;
            return;
        }
        if(V){
            return;
        }
        V = setTimeout(function() {
            var t = b.scrollTop();
            e.wheelDelta > 0 ? (X = 1, t <= U ? $("#bottomTags").hide() : ++y % 3 === 0 && ($("#bottomTags").is(":visible") || $("#bottomTags").show().trigger("btagshowDD"), y = 0)) : e.wheelDelta < 0 && (X = X < 0 ? --X: -1, X <= -3 && $("#bottomTags").hide()),
            V = null
        },
        0)
    })
    $('#bottomTags .close').click(function(){
        $('#bottomTags').remove();
    })

});
