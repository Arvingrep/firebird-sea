define(function(require) {
    var $ = require("jquery");
    require("./scroller/style.css");
    var e = function() {
        var e;
        return function() {
            if (null != e) return e;
            var t = document.createElement("div"),
            o = t.cloneNode();
            return document.body.appendChild(t),
            t.appendChild(o),
            $.extend(t.style, {
                position: "absolute",
                top: "-50px",
                left: "-150px",
                height: "50px",
                width: "100px",
                overflowY: "scroll"
            }),
            e = 100 - o.getBoundingClientRect().width,
            document.body.removeChild(t),
            e
        }
    } (),
    t = function(t) {
        function o() {
            var e = u.height(),
            t = p.outerHeight(),
            o = a.outerHeight();
            return (e - o) / (t - e)
        }
        function n() {
            var e = u.height(),
            t = p.outerHeight(),
            o = t / e;
            1 > e && h.disconnect(),
            o > 1 ? (a.css("height", e / o), v || (v = 1, a.addClass("visible")), i()) : v && (a.removeClass("visible"), v = 0)
        }
        function i() {
            a.css("top", u.scrollTop() * o())
        }
        function r(e) {
            u.scrollTop((l + e.clientY - d) / o())
        }
        function s() {
            g.off("mousemove", r),
            g.off("mouseup", s),
            a.removeClass("active"),
            document.documentElement.classList.remove("diy-dragging-mode")
        }
        var c = t.jquery ? t: $(t);
        t = c[0],
        c.addClass("ui-scroller");
        var l, d, u = $('<div class="ui-scroller-inner"></div>').appendTo(c),
        a = $('<div class="ui-scroller-bar"></div>').appendTo(c),
        p = $('<div class="ui-scroller-body"></div>').appendTo(u),
        v = 0,
        g = $(document),
        f = e(),
        m = Math.max(f, 15);
        u.css({
            right: -m,
            "padding-right": m - f
        }),
        u.scrollTop(0).bind("scroll",
        function(e) {
            e.stopPropagation(),
            e.preventDefault(),
            v && i()
        });
        var h = new(window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver)(n);
        c.hover(function() {
            n(),
            h.observe(p[0], {
                attributes: !0,
                childList: !0,
                characterData: !0,
                subtree: !0
            })
        },
        function() {
            h.disconnect()
        }),
        a.mousedown(function(e) {
            g.trigger(e),
            e.stopPropagation(),
            e.preventDefault(),
            d = e.clientY,
            l = a.position().top,
            a.addClass("active"),
            document.documentElement.classList.add("diy-dragging-mode"),
            g.one("mouseup", s),
            g.on("mousemove", r)
        }),
        this.getBody = function() {
            return p
        },
        this.getInner = function() {
            return u
        },
        this.scrollTo = function(e) {
            u.stop();
            var t = u.scrollTop() + e[0].getBoundingClientRect().top - u[0].getBoundingClientRect().top;
            u.animate({
                scrollTop: t
            },
            300)
        }
    };
    return t
});