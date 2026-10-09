define(function(require) {
    function e() {
        return s + (new Date).getTime().toString(36)
    }
    function t(e, t) {
        this.element = e && e.jquery ? e: $(e),
        this.options = $.extend({},
        i, t),
        this.initialize();
        var n = this;
        $.each(["create", "sort", "update"],
        function(e, t) {
            t in n.options && n.bind(t, n.options[t])
        })
    }
    var $ = require("jquery"),
    i = {
        items: null,
        cancel: null,
        handle: null,
        zIndex: 1e3,
        opacity: .7,
        axis: null
    },
    n = "sortable",
    s = "." + n,
    a = document,
    o = $(a);
    t.prototype = {
        initialize: function() {
            function t(e) {
                if (!w.dragging && 1 == e.which) {
                    w.items = w.element.find(">" + (z.items || "")),
                    z.cancel && (w.items = w.items.not(z.cancel));
                    var t = $(e.target);
                    if (!z.handle || (w.handles = w.items.find(z.handle), t.is(w.handles))) {
                        var n = t.closest(w.items);
                        n.length && (w.dragging = !0, o.on("mousemove", i), o.one("mouseup", s), o.one("mouseleave", s), o.on("selectstart", a), f = n, u = f.offsetParent(), l = e, r = f.position(), h = f.index())
                    }
                }
            }
            function i(e) {
                w.dragging && (p || (p = f.clone(), p.html("&nbsp;"), p.insertAfter(f), p.addClass("placeholder"), f.addClass("helper"), b = {
                    width: f.width(),
                    height: f.height()
                },
                x = f.attr("style") || "", f.css({
                    position: "absolute",
                    zIndex: z.zIndex,
                    opacity: z.opacity,
                    display: "block",
                    width: b.width,
                    height: b.height
                })), z.axis && "x" != z.axis || f.css("left", r.left + u.scrollLeft() + (e.pageX - l.pageX)), z.axis && "y" != z.axis || f.css("top", r.top + u.scrollTop() + (e.pageY - l.pageY)), d = $(e.target).closest(w.items), d.length && d.is(f) && (m = f.position(), g = f.outerWidth(!0), v = f.outerHeight(!0), y = {
                    left: m.left + g / 2,
                    top: m.top + v / 2
                },
                d = w.items.not(f).filter(function() {
                    var e = $(this),
                    t = e.position();
                    return t.left <= y.left && t.left + g >= y.left && t.top <= y.top && t.top + v >= y.top
                }), d.length && (d[p.index() < d.index() ? "after": "before"](p), w.element.trigger(n + ".sort", [e, {
                    helper: f,
                    item: d,
                    placeholder: p
                }]), e.preventDefault())))
            }
            function s(e) {
                w.dragging && (w.dragging = !1, o.off("mousemove", i), o.off("mouseup", s), o.off("mouseleave", s), o.off("selectstart", a), f && (p && (p.after(f), p.remove()), f.removeClass("helper"), "" === f.attr("class") && f.removeAttr("class"), f.attr("style", x), "" === f.attr("style") && f.removeAttr("style"), c = f.index(), h != c && w.element.trigger(n + ".update", [e, {
                    helper: f,
                    item: f,
                    placeholder: p
                }]), p = null))
            }
            function a(e) {
                e.preventDefault()
            }
            var l, r, h, c, f, p, u, d, m, g, v, y, x, b, w = this,
            z = this.options;
            this.destory(),
            this.namespace = e(),
            this.element.on("mousedown" + this.namespace, z.items, t),
            w.element.trigger(n + ".create", [])
        },
        bind: function(e, t) {
            $.isFunction(t) && this.element.bind(n + "." + e,
            function() {
                var e = [].slice.call(arguments);
                e.splice(0, 1),
                t.apply(null, e)
            })
        },
        destory: function() {
            return this.dragging = !1,
            this.namespace && (this.items && (this.items.off(this.namespace), this.items = null), this.handles && (this.handles = null), this.element.off(this.namespace), o.off(this.namespace)),
            this
        }
    },
    $.fn.sortable = function(e) {
        var i = arguments;
        return this.each(function() {
            var n = $(this),
            s = n.data("sortable");
			if(s) {
				n.removeData("sortable");
			}
            //if (s) {
//                var a = [].slice.call(i),
//                o = i.shift();
//                $.isFunction(s[o]) && s[o].apply(s, a)
//            } else n.data("sortable", new t(n, e))
			n.data("sortable", new t(n, e))

        })
    }
});