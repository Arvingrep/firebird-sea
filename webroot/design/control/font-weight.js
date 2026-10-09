define(function(require) {
    var i = require("class"),
    $ = require("jquery"),
    e = require("./select"),
    l = ["100", "200", "300", {
        label: "400 正常",
        value: "400"
    },
    "500", "600", {
        label: "700 粗体",
        value: "700"
    },
    "800", "900"],
    a = i({
        initialize: function(i) {
            $.isPlainObject(i) || (i = {}),
            i.options || (i.options = l),
            a.superclass.initialize.call(this, i)
        }
    },
    e);
    return a
});