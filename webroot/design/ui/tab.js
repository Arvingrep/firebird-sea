define(function(require) {
    var $ = require("jquery"),
    e = {
        trigger: "",
        content: "",
        active: 0,
        activeClass: "active",
        beforeActive: null,
        afterActive: null
    };
    $.fn.tab = function(t) {
        return this.each(function() {
            var i = $.extend({},
            e, t),
            n = $(this),
            c = n.find(i.trigger || "> ul > li"),
            a = n.find(i.content || "> div");
            c.each(function(e, t) {
                var n = $(t),
                r = a.eq(e);
                n.click(function() {
                    return $.isFunction(i.beforeActive) && i.beforeActive(e, n, r) === !1 ? void 0 : (c.not(t).removeClass(i.activeClass), n.addClass(i.activeClass), a.not(r[0]).hide(), r.show(), $.isFunction(i.afterActive) && i.afterActive(e, n, r), !1)
                })
            }).eq(i.active).triggerHandler("click")
        })
    }
});