define(function(require) {
    require("./controller.css");
    var t, e = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    n = require("diy/panel/panel"),
    p = e({
        setup: function(t) {
            var e = this.getWidget();
			e.getElement().html("<h5>已添加评论组件，将在发布后展示</h5>");
        },
        toJSON: function() {
            return {
                params: 1
            }
        }
    },
    i);
    return p
});