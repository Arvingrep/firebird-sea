define(function(require) {
    var e = require("class"),
    t = require("widgets/area/controller"),
    n = e({
        setup: function() {
            var e = this.getWidget(),
            t = e.getElement();
            t.append("<h1>这里将显示标题</h1>")
        },
        toJSON: function() {
            return {}
        }
    },
    t);
    return n
});