define(function(require) {
    var e = require("class"),
    p = require("widgets/area/controller"),
    t = "浏览次数：86",
    o = e({
        setup: function() {
            var e = this.getWidget(),
            p = e.getElement();
            p.append(t)
        },
        toJSON: function() {
            return {}
        }
    },
    p);
    return o
});