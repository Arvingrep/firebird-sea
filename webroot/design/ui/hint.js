define(function(require) {
    function t(t, e) {
        "{" === t.charAt(0) ? (t = JSON.parse(t), i.forEach(function(e, o) {
            t[o] = t[e] || t[o]
        })) : t = t.split("|"),
        o || (o = $('<div class="ui-hint"></div>').appendTo(document.body));
        var n, a, r = (t[1] || "top").toLowerCase(),
        u = (t[2] || "").toLowerCase(),
        p = [],
        c = e.getBoundingClientRect();
        switch (r) {
        case "right":
            n = c.right + "px",
            a = (c.top + c.bottom) / 2 + "px",
            p.push("right");
            break;
        case "bottom":
            n = (c.left + c.right) / 2 + "px",
            a = c.bottom + "px",
            p.push("bottom");
            break;
        case "left":
            n = c.left + "px",
            a = (c.top + c.bottom) / 2 + "px",
            p.push("left");
            break;
        case "top":
        default:
            n = (c.left + c.right) / 2 + "px",
            a = c.top + "px",
            p.push("top")
        }
        u && p.push(u),
        s && o.removeClass(s),
        s = p.join(" "),
        o.attr("data-hint", t[0]),
        o.css({
            left: n,
            top: a
        }).addClass("visible").addClass(s)
    }
    function e() {
        o && o.removeClass("visible")
    }
    require("./hint/style.css");
    var o, s, $ = require("jquery"),
    i = ["text", "dim", "type"],
    n = function(o) {
        function s(o) {
            var s = o.target,
            i = s.dataset.hint;
            return i ? (t(i, s), !1) : (e(), void 0)
        }
        var i = $(o).bind("mouseover", s).mousedown(function() {
            e(),
            i.unbind("mouseover", s).one("mouseup",
            function() {
                i.bind("mouseover", s)
            })
        })
    };
    return n
});