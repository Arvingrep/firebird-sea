define(function(require) {
    var $ = require("jquery"),
    i = require("class"),
    s = require("ui/dialog");
    require("./lightdialog/style.css");
    var l = i({
        initialize: function(i) {
            $.isPlainObject(i) || (i = {}),
            $.isPlainObject(i.classes) || (i.classes = {}),
            i.classes.dialog = "ui-lightdialog",
            l.superclass.initialize.apply(this, [i])
        }
    },
    s);
    return l
});