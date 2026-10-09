define(function(require) {
    function n(n) {
        1 !== n.nodeType && (n = (9 === n.nodeType ? n: n.ownerDocument).body);
        var e = $(n);
        return n === document.body ? {
            context: e,
            position: "fixed",
            width: window.innerWidth || l.clientWidth,
            height: window.innerHeight || l.clientHeight
        }: {
            context: e,
            position: "absolute",
            width: n.offsetWidth,
            height: n.offsetHeight
        }
    }
    function e(n, e, o, c) {
        function a() {
            t = setTimeout(function() {
                i && i.triggerHandler("click")
            },
            1e3 * o)
        }
        $.isFunction(o) && (c = o, o = null),
        0 !== o && (o = parseInt(o, 10) || 3),
        o && (i ? (t && clearTimeout(t), i.cancel && i.cancel(), i.find("nobr").html(e || ""), i.removeClass("ok info error").addClass(n)) : (i = $('<div class="ui-message ' + n + '"><i></i><div><h4>提示</h4><p><nobr>' + (e || "") + "</nobr></p></div></div>"), i.click(function() {
            t && clearTimeout(t),
            i.removeClass("visible"),
            t = setTimeout(function() {
                i.detach()
            },
            150),
            i.cancel && i.cancel()
        }), i.hover(function() {
            clearTimeout(t)
        },
        function() {
            a()
        })), i.appendTo(s.body), i.cancel = c, setTimeout(function() {
            i.addClass("visible"),
            a()
        },
        0))
    }
    require("./message/style.css");
    var t, i, o, c, $ = require("jquery"),
    a = window,
    s = a.document,
    l = s.documentElement,
    d = 1e3,
    u = {
        ok: function(n, t, i) {
            e("ok", n, t, i)
        },
        error: function(n, t, i) {
            e("error", n, t, i)
        },
        info: function(n, t, i) {
            e("info", n, t, i)
        },
        confirm: function(e, t, i, a) {
            function l() {
                $(s).off("click", u),
                o.fadeOut("fast",
                function() {
                    o.detach(),
                    c && c.detach(),
                    m ? o.ok && o.ok() : o.cancel && o.cancel(),
                    o.ok = null,
                    o.cancel = null
                })
            }
            function u(n) {
                var e = $(n.target);
                e[0] != o[0] && -1 === e.parents().index(o[0]) && l()
            }
            i && !$.isFunction(i) && (a = i, i = null),
            o ? (o.cancel && o.cancel(), o.find("span").text(e || ""), o.removeClass("white").addClass(a)) : o = $('<div class="ui-message-confirm ' + (a || "") + '"><b class="out"></b><b class="in"></b><span>' + (e || "") + '</span><button class="confirm">确定</button><button class="cancel">取消</button></div>'),
            o.ok = t,
            o.cancel = i,
            o.css({
                position: "absolute",
                left: "-9999em",
                top: "-9999em"
            }).appendTo(s.body);
            var f, r, h, p, m = !1,
            v = n(this.nodeType ? this: s),
            b = o.outerWidth(!0),
            g = o.outerHeight(!0);
            if (c ? c.removeClass("white").addClass(a || "") : c = $('<div class="ui-message-overlay ' + (a || "") + '"></div>'), v.width > b && v.height > g + 2 * .38 * v.height || v.context[0] == s.body) f = v.position,
            r = Math.floor((v.width - b) / 2),
            h = Math.ceil((.38 * v.height - g) / 2),
            p = v.context;
            else {
                var w = v.context.offset(),
                k = w.left + v.width / 2;
                o.addClass("up"),
                b = o.outerWidth(!0),
                g = o.outerHeight(!0),
                r = Math.max(0, k - b / 2),
                h = w.top + v.height + 10;
                var y = $(s).height();
                h + g > y && w.top - (g + 10) > 0 && (o.removeClass("up").addClass("down"), h = w.top - (g + 10));
                var T = $(s).width();
                r + b > T && T - b > 5 && (r = T - b - 5),
                o.find(".out").css("left", k - r - 8),
                o.find(".in").css("left", k - r - 7),
                p = s.body,
                f = "fixed"
            }
            c.css({
                zIndex: d
            }).appendTo(p),
            o.css({
                position: f,
                left: r,
                top: h,
                zIndex: d++,
                display: "none"
            }).appendTo(p).fadeIn("fast"),
            o.find("> button.confirm").off("click").on("click",
            function() {
                return m = !0,
                l(),
                !1
            }),
            o.find("> button.cancel").off("click").on("click",
            function() {
                return m = !1,
                l(),
                !1
            }),
            $(s).on("click", u)
        },
        hide: function() {
            t && clearTimeout(t),
            t = null,
            i && (i.cancel && i.cancel(), i.cancel = null, i.detach()),
            o && (o.cancel && o.cancel(), o.cancel = null, o.detach())
        }
    };
    return $.fn.confirm = function(n, e, t, i) {
        return this.each(function() {
            u.confirm.apply(this, [n, e, t, i])
        })
    },
    u
});