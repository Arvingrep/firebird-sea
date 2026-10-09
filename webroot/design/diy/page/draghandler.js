define(function(require) {
    function t(t, n) {
        return Math.pow(t.clientX - n.clientX, 2) + Math.pow(t.clientY - n.clientY, 2) > i
    }
    var n = require("class"),
    $ = require("jquery"),
    i = 4,
    e = n({
        initialize: function(t) {
            this.data = t && $.isPlainObject(t) ? $.extend({},
            t) : {}
        },
        set: function(t, n) {
            this.data[t] = n
        },
        get: function(t) {
            return this.data[t]
        }
    }),
    s = n({
        initialize: function(t, n, i, e) {
            this.$out = $(document),
            this.page = t,
            this.$doc = t.getDocument(),
            this.dragstart = n,
            this.draging = i,
            this.dragend = e
        },
        start: function(n, i) {
            function s(e) {
                return c.fixPoint(e, this),
                g ? a.draging(e, i) : ((e.target != n.target || t(e, n)) && (g = 1, a.dragstart(n, i), a.draging(e, i)), void 0)
            }
            function u(t) {
                c.fixPoint(t, this),
                d.unbind("mousemove", s),
                r.unbind("mousemove", s),
                g && a.dragend(t, i),
                d.unbind("mouseup", u),
                r.unbind("mouseup", u),
                d.unbind("selectstart", o),
                r.unbind("selectstart", o)
            }
            function o(t) {
                t.preventDefault()
            }
            n.stopPropagation(),
            n.preventDefault();
            var a = this,
            d = this.$doc,
            r = this.$out,
            c = this.page,
            g = 0;
            c.fixPoint(n),
            i = new e(i),
            d.bind("mousemove", s),
            r.bind("mousemove", s),
            d.bind("mouseup", u),
            r.bind("mouseup", u),
            d.bind("selectstart", o),
            r.bind("selectstart", o)
        }
    });
    return s
});