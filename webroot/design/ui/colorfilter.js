define(function(require) {
    var $ = require("jquery"),
    t = require("lib/class"),
    i = require("ui/filter"),
    e = require("diy/widget/theme").AvailableColors;
    require("./colorfilter/style.css");
    var l = t({
        initialize: function(t, i) {
            $.isPlainObject(i) || (i = {}),
            i.classes = {
                wrapper: "ui-colorfilter",
                item: "ui-colorfilter-item",
                active: "active"
            },
            i.options || (i.options = e),
            l.superclass.initialize.apply(this, [t, i]),
            this.on("itemReady",
            function(t) {
                t.data("text", t.text()),
                t.text(""),
                t.css("text-indent", 0),
                t.css("background-color", t.data("value"))
            })
        },
        getColors: function() {
            return e
        }
    },
    i);
    return l
});