define(function(require) {
    var $ = require("jquery");
    return function(i) {
        function t() {
            i.data("width") && (i.css({
                display: "none",
                visibility: "hidden"
            }), i.data("width") > i.offsetParent().width() ? i.width(i.offsetParent().width()) : i.width(""), i.css({
                display: "",
                visibility: "visible"
            }))
        }
        "undefined" == typeof document.body.style.maxWidth && ($("<img/>").load(function() {
            i.data("width", this.width),
            i.data("height", this.height),
            t()
        }).attr("src", i.attr("src")), $(window).on("resize", t))
    }
});