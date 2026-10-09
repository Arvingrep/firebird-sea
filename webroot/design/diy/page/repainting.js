define(function(require) {
    var t = require("class"),
    i = require("jquery").Callbacks,
    n = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
    function(t) {
        return window.setTimeout(t, 1e3 / 60)
    },
    e = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame ||
    function(t) {
        window.clearTimeout(t)
    },
    o = t({
        initialize: function() {
            function t() {
                e.triggers.fire(),
                e.next = n(t)
            }
            var e = this;
            this.triggers = i("stopOnFalse"),
            this.touch = t
        },
        start: function() {
            this.started || (this.started = 1, this.touch())
        },
        stop: function() {
            this.next && e(this.next),
            this.next = 0,
            this.started = 0
        },
        destroy: function() {
            this.stop(),
            this.triggers.empty()
        },
        take: function(t) {
            return this.triggers.add(t),
            this
        },
        drop: function(t) {
            return this.triggers.remove(t),
            this
        }
    });
    return o
});