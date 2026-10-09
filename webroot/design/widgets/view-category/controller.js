define(function(require) {
    var e = require("class"),
    t = require("widgets/area/controller"),
    n = e({
        setup: function() {
            var e = this.getWidget(),
            t = e.getElement();
            t.append("这里将将显示分类名称")
        },
        toJSON: function() {
            return {}
        }
    },
    t);
    return n
});