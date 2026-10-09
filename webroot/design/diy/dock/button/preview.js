define(function(require) {
    require("./preview.css");
    var e = require("class"),
    t = require("./button"),
    i = require("diy/runtime"),
    s = e({
        setup: function() {
            var e = this.getElement();
            e.addClass("icon-preview"),
            this.setHint("预览");
            var t = this;
            e.click(function() {
                t.togglePreviewMode()
            })
        },
        getName: function() {
            return "preview"
        },
        togglePreviewMode: function() {
            i.isDesignMode() ? (i.setDesignMode(0), this.getElement().addClass("active"), this.dock.getElement().addClass("preview-mode"), this.setHint("退出预览")) : (i.setDesignMode(1), this.getElement().removeClass("active"), this.dock.getElement().removeClass("preview-mode"), this.setHint("预览"))
        }
    },
    t);
    return s
});