define(function(require) {
    function e(e, n) {
        return e.appendChild(n),
        e
    }
    function n(e, n) {
        e = e.split(f);
        for (var t = 0,
        i = e.length,
        o = e[0]; i > t && n.call(o, o, t) !== !1; o = e[++t]);
    }
    function t(e, n) {
        if (!e) return ! 1;
        e = e.split("."),
        n = n.split("."),
        e[0] = parseInt(e[0]),
        n[0] = parseInt(n[0]);
        for (var t = 0,
        i = n.length; i > t; t++) {
            if (void 0 == e[t] || e[t] < n[t]) return ! 1;
            if (e[t] > n[t]) return ! 0
        }
        return ! 0
    }
    function i(e, n) {
        if (e instanceof Object) {
            var t = [];
            for (var o in e) null == e[o] || t.push(o + "=" + i(e[o], 1));
            e = t.join("&")
        }
        return n ? encodeURIComponent(e) : e
    }
    function o(e) {
        var n = [];
        for (var t in e) null == e[t] || n.push([t, '="', i(e[t]), '"'].join(""));
        return n.join(" ")
    }
    function r(e) {
        var n = [];
        for (var t in e) null == e[t] || n.push(['<param name="', t, '" value="', i(e[t]), '" />'].join(""));
        return n.join("")
    }
    function a(e) {
        if (!e.movie) return ! 1;
        if (!t(g, "11.1")) return alert("Upgrade your Flash Player..."),
        !1;
        var i, a = v.createElement("div");
        return e.type = "application/x-shockwave-flash",
        window.ActiveXObject ? (i = {
            classid: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
        },
        n("width height id",
        function(n) {
            e[n] && (i[n] = e[n]),
            delete e[n]
        }), a.innerHTML = ["<object ", o(i), ">", r(e), "</object>"].join("")) : (e.src = e.movie, delete e.movie, a.innerHTML = "<embed " + o(e) + " />"),
        a.firstChild
    }
    function l(e, n, t) {
        try {
            e.CallFunction('<invoke name="' + n + '" returntype="javascript">' + __flash__argumentsToXML(t || [], 0) + "</invoke>")
        } catch(i) {
            throw "Call to " + n + " failed"
        }
    }
    function c() {
        if (w) return w.style.display = "block",
        void 0;
        w = m('<div class="event-masker" style="position:fixed;top:0;left:0;z-index:999998;height:100%;width:100%;background-color:black;opacity:0.5;filter:Alpha(Opacity=50);"></div>'),
        e(v.body, w);
        var n = function(e) {
            w.offsetWidth && (e = e || window.event, e.preventDefault && e.preventDefault(), e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
        },
        t = function(e) {
            if (27 == (e || window.event).keyCode) for (var n in p) p[n].close()
        };
        v.addEventListener ? (v.addEventListener("onmousewheel" in v ? "mousewheel": "DOMMouseScroll", n, !1), v.addEventListener("keypress", t, !1)) : (v.attachEvent("onmousewheel", n), v.attachEvent("onkeypress", t))
    }
    function u(e) {
        var n = e.movie,
        t = n.parentNode;
        if (window.ActiveXObject && 4 == n.readyState) {
            n.style.display = "none";
            for (var i in n)"function" == typeof n[i] && (n[i] = null)
        }
        t.removeChild(n),
        v.body.removeChild(t),
        n = null,
        t = null;
        var o = e.events;
        for (var i in o) for (var r = 0,
        a = o[i].length; a > r; r++) o[i][r] = null;
        e.events = null,
        e.movie = null,
        e = null
    }
    function d() {
        w && (w.style.display = "none");
        var n = m('<input style="width:1px;height:1px;position:fixed;left:-10px;top:10px;" />');
        e(v.body, n),
        n.focus(),
        v.body.removeChild(n),
        n = null
    }
    var s = require("diy/runtime"),
    v = window.document,
    f = /[\s|,]+/,
    p = {},
    h = "/design/ui/imageditor/imageditor.swf",
    w = null,
    g = function() {
        try {
            return (window.ActiveXObject ? new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version") : navigator.plugins["Shockwave Flash"].description).match(/\d+/g).join(".") || null
        } catch(e) {
            return null
        }
    } (),
    m = function() {
        var e = v.createElement("div");
        return function(n) {
            return e.innerHTML = n,
            n = e.firstChild,
            e.removeChild(n),
            n
        }
    } ();
    window.ActiveXObject && window.attachEvent("onunload",
    function() {
        for (guid in p) u(p[guid]),
        p[guid] = null;
        w = null
    });
    var y = function(n, t, i) {
        t || (t = 750),
        i || (i = 500);
        var o = this,
        r = "IMGEDITOR" + (new Date).getTime().toString(16),
        l = {
            guid: r,
            file: n,
            config: "/include/"+Module+".inc.php?action=imageditor&do=getConfig&projectid=" + s.getWorkspace().getProjectId()
        },
        u = m('<div class="event-masker" style="position:fixed;width:' + t + "px;height:" + i + "px;top:50%;left:50%;margin-left:-" + t / 2 + "px;margin-top:-" + i / 2 + 'px;background-color:#000;z-index:999999;filter:progid:DXImageTransform.Microsoft.Shadow(color=#000, Direction=135, Strength=4);box-shadow:3px 3px 5px #000;"></div>'),
        d = a({
            movie: h,
            id: r,
            width: t,
            height: i,
            flashvars: l,
            quality: "high",
            wmode: "window",
            devicefont: "true",
            allowFullScreen: "true",
            allowScriptAccess: "always"
        });
        d && (o.movie = d, o.guid = r, o.events = {},
        o.bind("close", o.close), c(), e(v.body, u), e(u, d), u = null, p[r] = o)
    };
    return y.prototype = {
        bind: function(e, n) {
            var t = this;
            e in t.events || (t.events[e] = []),
            t.events[e].push(n)
        },
        close: function() {
            var e = this;
            d(),
            delete p[e.guid],
            setTimeout(function() {
                u(e)
            },
            0)
        }
    },
    y.open = function(e, n, t) {
        return new y(e, n, t)
    },
    y.trigger = function(e, n, t) {
        var i = p[e];
        if (i && n in i.events) for (var o, r = 0; (o = i.events[n][r++]) && o.apply(i, t || []) !== !1;);
    },
    y.testExternalInterface = function(e) {
        try {
            e in p && l(p[e].movie, "testExternalInterface")
        } catch(n) {}
    },
    window.ImageEditor = y,
    y
});