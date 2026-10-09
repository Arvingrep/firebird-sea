define(function(require) {
    require("./font-style.css");
    var l = require("class"),
    $ = require("jquery"),
    s = require("./options"),
    i = [{
        label: "正常",
        classes: "font-style-normal",
        value: "normal"
    },
    {
        label: "斜体",
        classes: "font-style-italic",
        value: "italic"
    }],
    t = l({
        initialize: function(l) {
            $.isPlainObject(l) || (l = {}),
            l.options || (l.options = i),
            t.superclass.initialize.call(this, l),
            this.element.addClass("font-style")
        }
    },
    s);
    return t
});