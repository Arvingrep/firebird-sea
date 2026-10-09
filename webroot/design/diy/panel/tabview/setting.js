define(function(require) {
    function t(t) {
        return t.replace(/(?:^|_|\-)(\w)/g,
        function(t, i) {
            return i.toUpperCase()
        })
    }
    require("./setting.css");
    var i = require("class"),
    e = (require("jquery"), require("ui/scroller")),
    s = require("../section"),
    n = require("./tabview"),
    r = /^syncParam(\w+)$/,
    l = i({
        initialize: function() {
            l.superclass.initialize.call(this, this.getTitle(), this.getClasses()),
            this.paramlist = Object.keys(this.__proto__).filter(function(t) {
                return r.test(t) && "function" == typeof this[t]
            },
            this).map(function(t) {
                return t.replace(r, "$1")
            }),
            this.paramset = this.syncParam.bind(this),
            this.delaylink = this.switchOutlet.bind(this)
        },
        getTitle: function() {
            return "Setting"
        },
        getClasses: function() {},
        syncParam: function(i, e) {
            var s = "syncParam" + t(i);
            s in this && this[s](e)
        },
        syncParams: function() {
            var t = this.getOutlet();
            t && this.paramlist.forEach(function(i) {
                this.syncParam(i, t.getParam(i))
            },
            this)
        },
        applyToOutlet: function(t, i) {
            var e = this.getOutlet();
            e && e.setParam(t, i)
        },
        getOutlet: function() {
            return this.currentOutlet
        },
        switchOutlet: function() {
            this.timer = null,
            this.currentOutlet && this.currentOutlet.off("paramset", this.paramset),
            this.currentOutlet = null,
            this.nextOutlet && (this.currentOutlet = this.nextOutlet, this.currentOutlet.on("paramset", this.paramset), this.inited || (this.inited = 1, this.initView()), this.syncParams()),
            this.nextOutlet = null
        },
        link: function(t) {
            if (t === this.currentOutlet) return this.timer && clearTimeout(this.timer),
            this.timer = null,
            void 0;
            if (this.nextOutlet = t, !this.timer) {
                var i = document.activeElement;
                i && this.getElement()[0].contains(i) && i.blur(),
                this.currentOutlet ? this.timer = setTimeout(this.delaylink, 50) : this.switchOutlet()
            }
        }
    },
    s),
    a = i({
        init: function(t) {
            return a.superclass.init.call(this, t),
            this.scroller = new e(this.element),
            this.body = this.scroller.getBody(),
            this.name = "setting",
            this.description = "设置",
            this.element.addClass(this.name),
            this.views = {},
            this.visibleViews = [],
            this
        },
        createSection: function(t, e) {
            if (t in this.views) throw "section naming conflict";
            this.views[t] = i(e, l)
        },
        point: function(t) {
            if (a.superclass.point.call(this, t) !== !1 && t) {
                var i = this;
                i.visibleViews.forEach(function(t) {
                    t.link(null),
                    t.hide()
                }),
                this.visibleViews = [],
                t.ready(function() {
                    var e = t.getOutlets();
                    e.forEach(function(t) {
                        var e = t.getName(),
                        s = i.views[e];
                        s && (s instanceof l || (s = new s, i.views[e] = s), s.appendTo(i.body).show(), i.visibleViews.push(s), s.link(t))
                    })
                })
            }
        }
    },
    n);
    return new a
});