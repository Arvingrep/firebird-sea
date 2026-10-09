define(function(require) {
    var e = require("class"),
    n = require("./button"),
    s = require("ui/message"),
    a = require("diy/runtime"),
    t = e({
        setup: function() {
            var e = this.getElement(),
            n = a.getWorkspace();
            e.addClass("icon-save"),
            this.setHint("保存"),
            e.click(function() {
                e.hasClass("spinner") || (e.addClass("spinner"), n.save().done(function(e) {
                    if (e.code) s.error(e.message || "保存失败");
                    else {
                        var a = n.getProjectUrl(),
                        t = e.message || "保存成功";
                        s.ok('<a href="' + a + '" target="_blank">' + t + "，点击查看项目</a>")
                    }
                }).fail(function() {
                    s.error("保存失败")
                }).always(function() {
                    e.removeClass("spinner")
                }))
            })
        },
        getName: function() {
            return "save"
        }
    },
    n);
    return t
});