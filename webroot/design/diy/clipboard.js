define(function(require) {
    function t(t) {
        return /^(\d+(?:\.\d+)?)/.exec(t) ? parseFloat(RegExp.$1) : 0
    }
    function e(t, e) {
        return Math.pow(t.clientX - e.clientX, 2) + Math.pow(t.clientY - e.clientY, 2) > r
    }
    function i(t, i, n, s) {
        function o(t) {
            return l ? n(t) : ((t.target != c.target || e(t, c)) && (l = 1, i(c), n(t)), void 0)
        }
        function a(t) {
            document.documentElement.classList.remove("diy-dragging-mode"),
            r.off("mousemove", o),
            l && s(t),
            l = 0,
            r.off("mouseup", a)
        }
        var c, r = $(document),
        l = 0;
        t.mousedown(function(t) {
            2 != t.button && (c = t, t.stopPropagation(), t.preventDefault(), r.one("mouseup", a), r.on("mousemove", o), document.documentElement.classList.add("diy-dragging-mode"))
        })
    }
    var n = require("class"),
    $ = require("jquery"),
    s = require("./additive"),
    o = require("./runtime"),
    a = require("./cursor");
    require("./clipboard.css");
    var c = 3,
    r = 4,
    l = n({
        initialize: function() {
            var e = this;
            this.element = $('<div class="diy-clipboard"><label>剪贴板</label><i></i><div class="container"></div></div>').appendTo(document.body),
            this.element.find("i").click(function() {
                e.clear()
            }),
            this.container = this.element.find(".container"),
            this.stack = [];
            var n;
            o.on("designmodechange",
            function() {
                n && clearTimeout(n),
                o.isDesignMode() && e.stack.length ? n = setTimeout(function() {
                    e.element.addClass("visible")
                },
                400) : e.element.removeClass("visible")
            });
            var s, c, r, l = this.element;
            i(l.find("> label"),
            function(e) {
                s = e,
                c = t(l.css("top")),
                r = t(l.css("right")),
                a.capture(o.getWorkspace().getCurrentPage().getDocument()[0], e).add("move")
            },
            function(t) {
                var i = t.clientX - s.clientX,
                n = t.clientY - s.clientY;
                e.updatePosition({
                    right: r - i,
                    top: c + n
                })
            },
            function() {
                a.release()
            });
            var d;
            $(window).resize(function() {
                d && clearTimeout(d),
                d = setTimeout(function() {
                    e.updatePosition()
                },
                10)
            })
        },
        add: function(t) {
            this.element.addClass("visible");
            var e = $.extend(!0, {},
            t.toJSON()),
            i = new s(e);
            this.container.prepend(i.getElement()),
            this.stack.unshift(i),
            setTimeout(function() {
                for (var t = this.stack.length; t-->0;) {
                    var e = this.stack[t].getElement();
                    t >= c ? (this.stack.pop(), e.remove()) : e.removeClass("pos-" + t).addClass("pos-" + (t + 1))
                }
                this.container.width(80 * this.stack.length),
                this.updatePosition()
            }.bind(this), 16)
        },
        clear: function() {
            this.stack = [],
            this.container.empty(),
            this.element.removeClass("visible")
        },
        getData: function() {
            return this.stack[0] ? $.extend(!0, {},
            this.stack[0].getParams()) : null
        },
        updatePosition: function(e) {
            var i, n, s = this.element,
            a = 3,
            c = 3,
            r = 243,
            l = e ? e.top: t(this.element.css("top")),
            d = e ? e.right: t(this.element.css("right")),
            u = o.getWorkspace().getContainer(),
            m = s[0].getBoundingClientRect();
            i = u.height() - m.height - a,
            n = u.width() + r - m.width - 2 * a,
            d = Math.min(n, Math.max(d, r)),
            l = Math.min(i, Math.max(l, c)),
            s.css({
                right: d,
                top: l
            })
        }
    });
    return new l
});