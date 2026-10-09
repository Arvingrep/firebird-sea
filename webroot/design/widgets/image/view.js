define(function(require) {
    var t = require("ui/imgmax.js"),
    $ = require("jquery");
    return require("ui/fancybox.js"),
    function(e) {
        var c = e.find("img");
        e.data("lightbox") && !e.attr("href") && c.css("cursor", "pointer").click(function() {
            $.fancybox.open([{
                href: c.attr("src"),
                title: c.next().text() || c.attr("alt") || ""
            }], {
                openEffect: "elastic",
                closeEffect: "elastic"
            })
        }),
        t(c)
    }
});