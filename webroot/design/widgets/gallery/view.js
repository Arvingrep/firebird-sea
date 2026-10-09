define(function(require) {
    var $ = require("ui/fancybox.js");
    return function(e) {
        var t = e.find(".imageGalleryContainer");
        if (t.addClass("imageGalleryexport"), "1" === t.attr("data-lightbox")) {
            var n = "fancyboxGroup" + +new Date;
            e.find(".fancybox").each(function(e, t) {
                var a = $(t),
                i = a.find(">img").attr("src");
                a.attr("href", i),
                a.attr({
                    href: i,
                    rel: n
                })
            }),
            e.find('a[rel="' + n + '"]').fancybox({
                openEffect: "elastic",
                closeEffect: "elastic"
            })
        } else e.find(".fancybox").click(function(e) {
            0 == $(this).attr("href").length && e.preventDefault()
        });
        t.find(".item img").css("cursor", "pointer"),
        t.find(".imageGalleryTitle").click(function() {
            return $(this).attr("href").length <= 0 ? !1 : void 0
        })
    }
});