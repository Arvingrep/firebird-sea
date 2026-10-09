define(function(require) {
    var $ = require("jquery"),
    t = require("class"),
    i = require("diy/emitter"),
    e = {
        minWidth: 30
    },
    o = t({
        initialize: function(t, i, o) {
            function s(t) {
                return /^(\d+(?:\.\d+)?)/.exec(t) ? parseFloat(RegExp.$1) : 0
            }
            function n(t, e) {
                var o = s(i.css("padding-left")),
                n = s(i.css("padding-right"));
                switch (t = s(t), e || (e = "both"), i.css("box-sizing")) {
                case "border-box":
                    ("both" == e || "left" == e) && (t -= o, t -= s(i.css("border-left-width"))),
                    ("both" == e || "right" == e) && (t -= n, t -= s(i.css("border-right-width")));
                    break;
                case "padding-box":
                    ("both" == e || "left" == e) && (t -= o),
                    ("both" == e || "right" == e) && (t -= n)
                }
                return t
            }
            function h(t, e) {
                var o = s(i.css("padding-top")),
                n = s(i.css("padding-bottom"));
                switch (t = s(t), e || (e = "both"), i.css("box-sizing")) {
                case "border-box":
                    ("both" == e || "top" == e) && (t -= o, t -= s(i.css("border-top-width"))),
                    ("both" == e || "bottom" == e) && (t -= n, t -= s(i.css("border-bottom-width")));
                    break;
                case "padding-box":
                    ("both" == e || "top" == e) && (t -= o),
                    ("both" == e || "bottom" == e) && (t -= n)
                }
                return t
            }
            function r(t, e) {
                b.tooltip.find(".width").text(s(t)),
                b.tooltip.find(".height").text(s(e));
                var o = b.tooltip.outerHeight(!0),
                n = parseInt(e, 10),
                h = i.offset(),
                r = h.top - o - 3;
                0 >= r && h.top + n + o + 3 <= p.height() && (r = h.top + n + 3),
                b.tooltip.css({
                    left: h.left,
                    top: r
                }).show()
            }
            function a() {
                var t = i.position(),
                e = i.css("width"),
                o = i.css("height");
                b.element.css({
                    left: t.left + n(e, "left") - 11,
                    top: t.top + h(o, "top") - 11
                })
            }
            function d(t) {
                if (b.dragging) {
                    var e = t.clientX - l.clientX,
                    s = t.clientY - l.clientY;
                    m && (!e && !s || Math.abs(Math.pow(e, 2) + Math.pow(s, 2)) <= 4) || (m = !1, i.css({
                        width: Math.max(o.minWidth, Math.min(g + e, b.originalWidth)),
                        height: "auto"
                    }), a(), r(i.css("width"), i.css("height")))
                }
            }
            function c() {
                b.dragging = !1,
                p.unbind("mousemove", d),
                p.unbind("mouseup", c),
                p.unbind("mouseleave", c),
                b.tooltip.detach();
                var t = s(i.css("width"));
                g != t && b.emit("resize", s(i.css("width")), s(i.css("height")))
            }
            t.use(require.resolve("./") + "imageresizer/style.css"),
            this.image = i,
            this.options = o = $.extend({},
            e, o),
            this.tooltip = $('<div><span class="width" style="color: #000;"></span>px ✕ <span class="height" style="color: #000;"></span>px</div>').css({
                position: "absolute",
                zIndex: 99999999,
                border: "solid 1px #808080",
                background: "rgba(255, 255, 194, .8)",
                color: "#848482",
                fontSize: "12px",
                padding: "3px"
            }),
            this.dragging = !1,
            this.element = t.createElement('<span class="resizer"></span>').insertAfter(i);
            var g, l, p = t.getDocument(),
            u = i.parent(),
            m = !0,
            b = this;
            this.element.mousedown(function(t) {
                t.preventDefault(),
                b.originalWidth && b.originalHeight && (b.dragging = !0, m = !0, l = t, g = s(i.css("width")), p.bind("mousemove", d), p.one("mouseup", c), p.one("mouseleave", c), b.tooltip.appendTo(p[0].body).hide())
            }),
            u.mouseenter(function() {
                a(),
                b.show()
            }),
            i.mousemove(function() {
                a(),
                b.show()
            }),
            u.mouseleave(function() {
                b.dragging || b.hide(),
                a()
            }),
            this.reset()
        },
        getElement: function() {
            return this.element
        },
        isResizing: function() {
            return this.dragging
        },
        reset: function() {
            this.originalWidth = 0,
            this.originalHeight = 0,
            this.detect()
        },
        detect: function() {
            var t = this,
            i = $("<img />").load(function() {
                i = null,
                t.originalWidth = this.width,
                t.originalHeight = this.height
            }).attr("src", this.image.attr("src"))
        },
        show: function() {
            this.element.addClass("active")
        },
        hide: function() {
            this.element.removeClass("active")
        }
    });
    return o.implement(i),
    o
});