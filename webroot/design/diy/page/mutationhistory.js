define(function(require) {
    var t = require("class"),
    i = require("../emitter"),
    s = t({
        initialize: function() {
            this.data = [],
            this.point = 0,
            this.cursor = 0,
            this.indo = 0
        },
        getState: function() {
            var t = 7;
            return this.cursor <= 0 && (t -= 1),
            this.cursor >= this.data.length && (t -= 2),
            this.point != this.cursor && (t -= 4),
            t
        },
        log: function(t) {
            this.indo || (window.console && console.log("History log:", t.getDescription()), this.data.splice(this.cursor, this.data.length - this.cursor, t), this.cursor = this.data.length, this.emit("statechange", this.getState()))
        },
        savePoint: function() {
            this.point = this.cursor,
            this.emit("statechange", this.getState())
        },
        go: function(t) {
            this.indo = 1;
            var i;
            if (t > 0) for (; t-->0 && this.cursor < this.data.length;) i = this.data[this.cursor++],
            window.console && console.log("History redo:", i.getDescription()),
            i.redo();
            else if (0 > t) for (; t++<0 && this.cursor > 0;) i = this.data[--this.cursor],
            window.console && console.log("History undo:", i.getDescription()),
            i.undo();
            this.indo = 0,
            this.emit("statechange", this.getState())
        },
        isModified: function() {
            return this.point != this.cursor
        },
        back: function() {
            this.go( - 1)
        },
        forward: function() {
            this.go(1)
        }
    });
    return s.implement(i),
    s.Record = t({
        initialize: function(t, i, s, o) {
            this.description = t,
            this.setter = i,
            this.orig = s,
            this.current = o
        },
        getDescription: function() {
            return this.description
        },
        undo: function() {
            this.setter(this.orig)
        },
        redo: function() {
            this.setter(this.current)
        }
    }),
    s
});