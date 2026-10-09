define(function(require) {
    require("./compo/updown.css");
    var $ = require("jquery");
    $.fn.compoUpDown = function(t, e, n, a, o) {
        function i(o, i, c) {
            i *= t,
            (c.altKey || c.ctrlKey) && (i *= 10);
            var s = o.value,
            u = /(\-?(?:\d*\.)?\d+)(.*)$/.exec(s);
            u && (s = parseFloat(u[1]) + i, null != e && e > s && (s = e), null != n && s > n && (s = n), o.value = s + (u[2] || a || ""), $(o).change())
        }
        t = t || 1;
        var c = $(document);
        return this.each(function() {
            var t = o ? "-" + o: "",
            e = $('<div class="compo ticks"><a class="tick up' + t + '" data-incr="1"><i></i></a><a class="tick down' + t + '" data-incr="-1"><i></i></a></div>').insertAfter(this),
            n = this;
            e.mousedown(function(t) {
                if (t.target.hasAttribute("data-incr")) {
                    c.trigger(t),
                    t.stopPropagation(),
                    t.preventDefault();
                    var a = setTimeout(function() {
                        a = setInterval(o, 100)
                    },
                    200),
                    o = function() {
                        i(n, parseInt(t.target.dataset.incr), t)
                    },
                    s = function() {
                        clearInterval(a),
                        clearTimeout(a),
                        e.unbind("mouseout mouseup", s)
                    };
                    o(),
                    e.bind("mouseout mouseup", s)
                }
            }),
            this.parentNode.classList.add("compo-updown"),
            $(this).mouseover(function(t) {
                $(t.target).select()
            })
        }),
        this.keydown(function(t) {
            switch (t.keyCode) {
            case 38:
            case 40:
                i(this, 39 - t.keyCode, t)
            }
        })
    }
});