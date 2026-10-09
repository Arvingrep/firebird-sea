define(function(require) {
    var n = require("class"),
    t = (require("jquery"), require("./button")),
    e = n({
        setup: function() {
            var n = this.getElement();
            n.addClass("icon-nfss-logo"),
            this.setHint("回到我的项目"),
            n.click(function() {
                window.open(window.PAGES_URL)
            })
        },
        getName: function() {
            return "logo"
        }
    },
    t);
    return e
});