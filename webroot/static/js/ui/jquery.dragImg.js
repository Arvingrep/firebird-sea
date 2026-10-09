(function(a) {
    var b = null,
    c = {
        dragHandle: b,
        dragType: "d",
        opacity: "",
        dragParent: b,
        ondrag: b,
        ondrop: b
    };
    a.fn.jqDrag = function(e) {
        var e = a.extend({},
        c, e || {}),
        f = {
            dnr: {},
            e: 0,
            drag: function(c) {
                if (d.k == "d") b.css({
                    left: d.X + c.pageX - d.pX,
                    top: d.Y + c.pageY - d.pY
                });
                else d.k == "r" && b.css({
                    width: Math.max(c.pageX - d.pX + d.W, 0),
                    height: Math.max(c.pageY - d.pY + d.H, 0)
                });
                if (e.dragParent) var i = b.width(),
                h = b.height(),
                g = a(e.dragParent).width(),
                f = a(e.dragParent).height();
                e.ondrag && e.ondrag.call(this, b, d, c);
                return false
            },
            stop: function() {
                b.css("opacity", d.o);
                e.ondrop && e.ondrop.call(this, b);
                a(document).off("mousemove mouseup", f.drag).off("mouseup", f.stop)
            }
        },
        d = f.dnr,
        b = f.e,
        g = function(a) {
            return parseInt(b.css(a)) || false
        };
        return this.each(function() {
            h = e.dragHandle ? a(e.dragHandle) : a(this);
            h.css("cursor", "move").on("mousedown", {
                e: a(this),
                k: e.dragType
            },
            function(h) {
                var i = h.data,
                c = {};
                b = i.e;
                if (b.css("position") != "absolute") try {
                    b.position(c)
                } catch(j) {}
                d = {
                    X: c.left || g("left") || 0,
                    Y: c.top || g("top") || 0,
                    W: g("width") || b[0].scrollWidth || 0,
                    H: g("height") || b[0].scrollHeight || 0,
                    pX: h.pageX,
                    pY: h.pageY,
                    k: i.k,
                    o: b.css("opacity")
                };
                b.css({
                    opacity: e.opacity,
                    zIndex: 10
                });
                a(document).mousemove(f.drag).mouseup(f.stop);
                return false
            })
        })
    }
})(jQuery);
