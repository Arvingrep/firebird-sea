define(function(require) {
    var $ = require("jquery").Callbacks,
    emitter = {
        on: function(t, s) {
            if ("object" == typeof t) {
                for (var n in t) this.on(n, t[n]);
                return this
            }
            return t = t.toLowerCase(),
            this.events || (this.events = {}),
            t in this.events || (this.events[t] = $("stopOnFalse")),
            this.events[t].add(s),
            this
        },
        off: function(e, t) {
            return e = e.toLowerCase(),
            this.events && this.events[e] && this.events[e].remove(t),
            this
        },
        emit: function(e) {
            e = e.toLowerCase();
            var t = [].slice.call(arguments, 1) || [];
            return this.events && this.events[e] ? this.events[e].fireWith(this, t) : void 0
        }
    };
    return emitter
});