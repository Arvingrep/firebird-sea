define(function(require) {
    function t(t) {
        return (9 == t.nodeType ? t: t.ownerDocument).body
    }
    var e = require("class"),
    $ = require("jquery"),
    i = !!document.releaseCapture,
    s = e({
        initialize: function() {
            this.list = []
        },
        capture: function(e, s) {
            return this.doe && this.release(),
            this.list = [],
            this.doe = $([document.documentElement, e.documentElement]),
            i && (this.body = t(s.target), this.body.setCapture(!0)),
            this
        },
        add: function(t) {
            return this.doe ? (this.list.push(t), this.doe.addClass("diy-cursor-" + t), this) : void 0
        },
        remove: function(t) {
            return this.doe ? (this.doe.removeClass("diy-cursor-" + t), this) : void 0
        },
        release: function() {
            if (this.doe) {
                var t = this;
                return this.list.forEach(function(e) {
                    t.remove(e)
                }),
                this.doe = null,
                this.body && this.body.releaseCapture(),
                this.body = null,
                this
            }
        }
    });
    return new s
});