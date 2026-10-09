define(function(require) {
    var e = require("class"),
    n = (require("jquery"), require("./button")),
    t = e({
        setup: function() {
            var e = this.getElement();
            e.addClass("icon-help large"),
            e.mouseenter(function() {}),
            e.mousemove(function() {}),
            e.mouseleave(function() {}),
            e.click(function() {
                window.open(window.PAGES_URL + "guider")
            })
        },
        getName: function() {
            return "help"
        }
    },
    n);
    return t
});