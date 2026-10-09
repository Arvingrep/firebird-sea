define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("../emitter"),
    n = e({
        initialize: function(e, t) {
            this.widget = e,
            this.setup($.isPlainObject(t) ? t: {})
        },
        setup: function() {},
        getPage: function() {
            return this.widget.getPage()
        },
        getWidget: function() {
            return this.widget
        },
        handleMouseDown: function() {},
        beforeSave: function() {
            var e = $.Deferred();
            return e.resolve(),
            e
        },
        toJSON: function() {
            return {}
        }
    });
    return n.implement(t),
    n
});