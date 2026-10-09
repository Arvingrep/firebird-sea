define(function(require) {
    function t(t) {
        return t.replace(/(?:^|_|\-)(\w)/g,
        function(t, e) {
            return e.toUpperCase()
        })
    }
    function e(t) {
        var i = typeof t;
        if (null == t) return t;
        if ("object" === i || "function" === i) {
            "toJSON" in t && (t = t.toJSON());
            var n = Array.isArray(t) ? new Array(t.length) : {};
            return $.each(t,
            function(t, i) {
                n[t] = e(i)
            }),
            n
        }
        return t
    }
    var i = require("class"),
    $ = require("jquery"),
    n = require("../emitter"),
    a = require("diy/page/mutationhistory").Record,
    r = i({
        initialize: function(t, e) {
            this.widget = t,
            this.captureDepth = 0,
            this.snapshot = {},
            this.disableCapture(),
            this.setup(e),
            this.enableCapture()
        },
        setup: function() {},
        getName: function() {
            return "setting"
        },
        getWidget: function() {
            return this.widget
        },
        getPage: function() {
            return this.widget.getPage()
        },
        disableCapture: function() {
            this.captureDisabled = 1
        },
        enableCapture: function() {
            this.captureDisabled = 0
        },
        captureStart: function() {
            if (!this.captureDisabled) {
                this.captureDepth++;
                var t = this;
                $.each(arguments,
                function(i, n) {
                    n in t.snapshot || (t.snapshot[n] = e(t.getParam(n)))
                })
            }
        },
        captureEnd: function() {
            if (! (this.captureDisabled || --this.captureDepth > 0)) {
                var i = this,
                n = {},
                r = {},
                u = 0;
                $.each(i.snapshot,
                function(t, a) {
                    var s = i.getParam(t),
                    c = e(s);
                    JSON.stringify(a) != JSON.stringify(c) && (u++, n[t] = a, r[t] = c)
                }),
                i.snapshot = {},
                i.captureDepth = 0,
                1 > u || i.getPage().getMutationHistory().log(new a(i.getWidget().getType() + "." + i.getName() + " " + JSON.stringify(n) + " => " + JSON.stringify(r),
                function(e) {
                    $.each(e,
                    function(e, n) {
                        var a = "setParam" + t(e);
                        a in i && i[a](n)
                    })
                },
                n, r))
            }
        },
        setParam: function(e, i) {
            this.captureStart(e);
            var n = "setParam" + t(e);
            n in this && this[n](i),
            this.captureEnd()
        },
        getParam: function(e) {
            var i = "getParam" + t(e);
            return i in this ? this[i]() : null
        },
        toJSON: function() {
            return null
        }
    });
    return r.implement(n),
    r
});