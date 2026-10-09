define(function(require) {
    require("./text-align.css");
    var e = require("class"),
    $ = require("jquery"),
    l = require("./options"),
    t = [{
        label: "左对齐",
        classes: "text-align-left",
        value: "left"
    },
    {
        label: "居中对齐",
        classes: "text-align-center",
        value: "center"
    },
    {
        label: "右对齐",
        classes: "text-align-right",
        value: "right"
    }],
    i = e({
        initialize: function(e) {
            $.isPlainObject(e) || (e = {}),
            e.options || (e.options = t),
            i.superclass.initialize.call(this, e),
            this.element.addClass("text-align")
        }
    },
    l);
    return i
});