define(function(require) {
    function e(e, t) {
        return Math.pow(e.clientX - t.clientX, 2) + Math.pow(e.clientY - t.clientY, 2) > a
    }
    function t(t, n, o, i) {
        function u(t) {
            return s ? o(t) : ((t.target != a.target || e(t, a)) && (s = 1, n(a), o(t)), void 0)
        }
        function r(e) {
            c.off("mousemove", u),
            s && i(e),
            s = 0,
            c.off("mouseup", r)
        }
        var a, c = $(document),
        s = 0;
        t.mousedown(function(e) {
            2 != e.button && (a = e, e.stopPropagation(), e.preventDefault(), c.one("mouseup", r), c.on("mousemove", u))
        })
    }
    var n = require("class"),
    $ = require("jquery"),
    o = require("./widget/widget"),
    i = require("./runtime"),
    u = require("./snapshot"),
    r = require("./cursor");
    require("./additive.css");
    var a = 4,
    c = n({
        initialize: function(e) {
            var n, a, c = $('<div class="diy-additive"><i></i><label></label></div>'),
            s = c.find("i"),
            l = c.find("label"),
            d = e.type;
            this.params = e,
            this.element = c,
            o.info(d).done(function(e) {
                s.css("backgroundImage", 'url("' + e.icon + "?v=" + window.sea.getStamp() + '")'),
                l.html(e.name)
            }),
            t(c,
            function(e) {
                var t = c[0].getBoundingClientRect();
                u.show(d, {
                    x: t.left - e.clientX,
                    y: t.top - e.clientY
                }),
                i.setMoveMode(1),
                n = i.getWorkspace().getCurrentPage(),
                n && (n.focus(null), n.hover(null), r.capture(n.getDocument()[0], e).add("move"))
            },
            function(e) {
                u.move(e),
                n && n.mark(e)
            },
            function() {
                u.hide(),
                i.setMoveMode(0),
                n && (a = n.insertWidget(e), a && a.ready(function() {
                    a.getController().emit("create")
                })),
                r.release()
            })
        },
        getElement: function() {
            return this.element
        },
        getParams: function() {
            return this.params
        }
    });
    return c
});