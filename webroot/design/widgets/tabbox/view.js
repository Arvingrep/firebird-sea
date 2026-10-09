define(function(require) {
    function e(e, n) {
        e.hasClass(t) || (e.addClass(t), e.siblings().removeClass(t), n.addClass(t), n.data("resized") || (n.data("resized", !0), n.children().trigger("resize")), n.siblings().removeClass(t))
    }
    function n(n) {
        var t, i = "hover" == n.data("method") ? "hover": "click",
        o = n.data("delay") || a,
        r = n.children(".w-tabbox-tabs"),
        c = r.find(".w-tabbox-tab"),
        s = n.children(".w-tabbox-contents").children(".w-tabbox-content");
        c.each(function(n, a) {
            var r = $(a),
            c = s.eq(n);
            "click" == i ? r.on("click.render",
            function() {
                e(r, c)
            }) : (r.on("mouseenter.render",
            function() {
                t && clearTimeout(t),
                t = setTimeout(function() {
                    e(r, c)
                },
                o)
            }), r.on("mouseleave.render",
            function() {
                t && clearTimeout(t)
            }))
        })
    }
    var $ = require("jquery"),
    t = "active",
    a = 100;
    return n.destory = function(e) {
        var n = e.children(".w-tabbox-tabs");
        n.find(".w-tabbox-tab").each(function() {
            $(this).off(".render")
        })
    },
    n
});