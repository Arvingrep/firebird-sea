define(function(require) {
    require("./tiptip.css");
    var $ = require("jquery");
    $.fn.tipTip = function(t) {
        var e = {
            activation: "hover",
            keepAlive: !1,
            maxWidth: "200px",
            edgeOffset: 3,
            defaultPosition: "bottom",
            delay: 400,
            fadeIn: 200,
            fadeOut: 200,
            attribute: "title",
            content: !1,
            enter: function() {},
            exit: function() {}
        },
        o = $.extend(e, t);
        if ($("#tiptip_holder").length <= 0) {
            var i = $('<div id="tiptip_holder" style="max-width:' + o.maxWidth + ';"></div>'),
            n = $('<div id="tiptip_content"></div>'),
            r = $('<div id="tiptip_arrow"></div>');
            $("body").append(i.html(n).prepend(r.html('<div id="tiptip_arrow_inner"></div>')))
        } else var i = $("#tiptip_holder"),
        n = $("#tiptip_content"),
        r = $("#tiptip_arrow");
        return this.each(function() {
            function t() {
                o.enter.call(this),
                n.html(f),
                i.hide().removeAttr("class").css("margin", "0"),
                r.removeAttr("style");
                var t = parseInt(a.offset().top),
                e = parseInt(a.offset().left),
                p = parseInt(a.outerWidth()),
                u = parseInt(a.outerHeight()),
                l = i.outerWidth(),
                h = i.outerHeight(),
                s = Math.round((p - l) / 2),
                c = Math.round((u - h) / 2),
                _ = Math.round(e + s),
                v = Math.round(t + u + o.edgeOffset),
                m = "",
                g = "",
                b = Math.round(l - 12) / 2;
                "bottom" == o.defaultPosition ? m = "_bottom": "top" == o.defaultPosition ? m = "_top": "left" == o.defaultPosition ? m = "_left": "right" == o.defaultPosition && (m = "_right");
                var M = s + e < parseInt($(window).scrollLeft()),
                w = l + e > parseInt($(window).width());
                M && 0 > s || "_right" == m && !w || "_left" == m && e < l + o.edgeOffset + 5 ? (m = "_right", g = Math.round(h - 13) / 2, b = -12, _ = Math.round(e + p + o.edgeOffset), v = Math.round(t + c)) : (w && 0 > s || "_left" == m && !M) && (m = "_left", g = Math.round(h - 13) / 2, b = Math.round(l), _ = Math.round(e - (l + o.edgeOffset + 5)), v = Math.round(t + c));
                var O = t + u + o.edgeOffset + h + 8 > parseInt($(window).height() + $(window).scrollTop()),
                x = t + u - (o.edgeOffset + h + 8) < 0;
                O || "_bottom" == m && O || "_top" == m && !x ? ("_top" == m || "_bottom" == m ? m = "_top": m += "_top", g = h, v = Math.round(t - (h + 5 + o.edgeOffset))) : (x | ("_top" == m && x) || "_bottom" == m && !O) && ("_top" == m || "_bottom" == m ? m = "_bottom": m += "_bottom", g = -6, v = Math.round(t + u + o.edgeOffset)),
                "_right_top" == m || "_left_top" == m ? v += 5 : ("_right_bottom" == m || "_left_bottom" == m) && (v -= 5),
                ("_left_top" == m || "_left_bottom" == m) && (_ += 5),
                r.css({
                    "margin-left": b + "px",
                    "margin-top": g + "px"
                }),
                i.css({
                    "margin-left": _ + "px",
                    "margin-top": v + "px"
                }).attr("class", "tip" + m),
                d && clearTimeout(d),
                d = setTimeout(function() {
                    i.stop(!0, !0).fadeIn(o.fadeIn)
                },
                o.delay)
            }
            function e() {
                o.exit.call(this),
                d && clearTimeout(d),
                i.fadeOut(o.fadeOut)
            }
            var a = $(this);
            if (o.content) var f = o.content;
            else var f = a.attr(o.attribute);
            if ("" != f) {
                o.content || a.removeAttr(o.attribute);
                var d = !1;
                "hover" == o.activation ? (a.hover(function() {
                    t()
                },
                function() {
                    o.keepAlive || e()
                }), o.keepAlive && i.hover(function() {},
                function() {
                    e()
                })) : "focus" == o.activation ? a.focus(function() {
                    t()
                }).blur(function() {
                    e()
                }) : "click" == o.activation && (a.click(function() {
                    return t(),
                    !1
                }).hover(function() {},
                function() {
                    o.keepAlive || e()
                }), o.keepAlive && i.hover(function() {},
                function() {
                    e()
                }))
            }
        })
    }
});