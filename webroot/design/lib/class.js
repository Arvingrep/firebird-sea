!function(t) {
    function n(t, e) {
        function c() {
            e.apply(this, arguments),
            this.constructor === c && this.initialize && this.initialize.apply(this, arguments)
        }
        i(t) && (e = t, t = null),
        t || (t = {}),
        e || (e = Object);
        var u = r(e.prototype);
        return u.constructor = c,
        c.prototype = u,
        c.superclass = e.prototype,
        o.call(c, t),
        n.classify(c)
    }
    function o(t) {
        var n, o;
        for (n in t) o = t[n],
        this.prototype[n] = o
    }
    function e() {}
    function i(t) {
        return "[object Function]" === c.call(t)
    }
    n.extend = function(t) {
        return n(t, this)
    },
    n.classify = function(t) {
        return t.extend = n.extend,
        t.implement = o,
        t
    };
    var r = Object.__proto__ ?
    function(t) {
        return {
            __proto__: t
        }
    }: function(t) {
        return e.prototype = t,
        new e
    },
    c = Object.prototype.toString;
    i(define) ? define(function() {
        return n
    }) : t.Class = n
} (window);