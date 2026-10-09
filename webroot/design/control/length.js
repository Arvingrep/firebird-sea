define(function(require) {
    var i = require("class"),
    $ = require("jquery"),
    t = require("./size"),
    e = i({
        initialize: function(i) {
            $.isPlainObject(i) || (i = {}),
            void 0 === i.defaultUnit && (i.defaultUnit = "px"),
            i.negative = !1,
            e.superclass.initialize.call(this, i)
        },
        setup: function() {
            e.superclass.setup.call(this),
            this.registerUnit("清除", "")
        }
    },
    t);
    return e
});