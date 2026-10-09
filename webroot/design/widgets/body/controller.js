define(function(require) {
    var e = require("class"),
    s = require("widgets/area/controller"),
    t = e({
        setup: function(e) {
            t.superclass.setup.call(this, e);
            var s = this.getWidget();
            s.setOperable(!1),
            s.setMovable(!1),
            s.setDisableStyles(["margin"])
        }
    },
    s);
    return t
});