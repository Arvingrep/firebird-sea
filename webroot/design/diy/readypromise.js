define(function(require) {
    var $ = require("jquery").Deferred,
    readypromise = {
        ready: function(e) {
            var r = this.getReadyDeferred();
            return e ? r.done(e) : r.resolveWith(this),
            this
        },
        getReadyDeferred: function() {
            return this.readyDeferred || (this.readyDeferred = $())
        },
        promise: function() {
            var e = this.getReadyDeferred();
            return e.promise.apply(e, arguments)
        },
        isReady: function() {
            return "resolved" === this.getReadyDeferred().state()
        }
    };
    return readypromise
});