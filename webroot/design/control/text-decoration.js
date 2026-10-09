define(function(require) {
    require("./text-decoration.css");
    var e = require("class"),
    $ = require("jquery"),
    n = require("./options"),
    t = [{
        label: "无",
        classes: "text-decoration-none",
        value: "none"
    },
    {
        label: "下划线",
        classes: "text-decoration-underline",
        value: "underline"
    },
    {
        label: "删除线",
        classes: "text-decoration-line-through",
        value: "line-through"
    }],
    i = e({
        initialize: function(e) {
            $.isPlainObject(e) || (e = {}),
            e.options || (e.options = t),
            e.uncheck = !1,
            i.superclass.initialize.call(this, e),
            this.element.addClass("text-decoration")
        }
    },
    n);
    return i
});