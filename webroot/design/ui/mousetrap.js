!
function(e, t) {
    function n(e, t, n) {
        return e.addEventListener ? (e.addEventListener(t, n, !1), void 0) : (e.attachEvent("on" + t, n), void 0)
    }
    function r(e) {
        if ("keypress" == e.type) {
            var t = String.fromCharCode(e.which);
            return e.shiftKey || (t = t.toLowerCase()),
            t
        }
        return K[e.which] ? K[e.which] : q[e.which] ? q[e.which] : String.fromCharCode(e.which).toLowerCase()
    }
    function o(e, t) {
        return e.sort().join(",") === t.sort().join(",")
    }
    function i(e) {
        e = e || {};
        var t, n = !1;
        for (t in j) e[t] ? n = !0 : j[t] = 0;
        n || (M = !1)
    }
    function a(e, t, n, r, i, a) {
        var c, u, s = [],
        f = n.type;
        if (!L[e]) return [];
        for ("keyup" == f && h(e) && (t = [e]), c = 0; c < L[e].length; ++c) if (u = L[e][c], (r || !u.seq || j[u.seq] == u.level) && f == u.action && ("keypress" == f && !n.metaKey && !n.ctrlKey || o(t, u.modifiers))) {
            var l = !r && u.combo == i,
            p = r && u.seq == r && u.level == a; (l || p) && L[e].splice(c, 1),
            s.push(u)
        }
        return s
    }
    function c(e) {
        var t = [];
        return e.shiftKey && t.push("shift"),
        e.altKey && t.push("alt"),
        e.ctrlKey && t.push("ctrl"),
        e.metaKey && t.push("meta"),
        t
    }
    function u(e) {
        return e.preventDefault ? (e.preventDefault(), void 0) : (e.returnValue = !1, void 0)
    }
    function s(e) {
        return e.stopPropagation ? (e.stopPropagation(), void 0) : (e.cancelBubble = !0, void 0)
    }
    function f(e, t, n, r) {
        x.stopCallback(t, t.target || t.srcElement, n, r) || e(t, n) === !1 && (u(t), s(t))
    }
    function l(e, t, n) {
        var r, o = a(e, t, n),
        c = {},
        u = 0,
        s = !1;
        for (r = 0; r < o.length; ++r) o[r].seq && (u = Math.max(u, o[r].level));
        for (r = 0; r < o.length; ++r) if (o[r].seq) {
            if (o[r].level != u) continue;
            s = !0,
            c[o[r].seq] = 1,
            f(o[r].callback, n, o[r].combo, o[r].seq)
        } else s || f(o[r].callback, n, o[r].combo);
        var l = "keypress" == n.type && A;
        n.type != M || h(e) || l || i(c),
        A = s && "keydown" == n.type
    }
    function p(e) {
        "number" != typeof e.which && (e.which = e.keyCode);
        var t = r(e);
        if (t) return "keyup" == e.type && S === t ? (S = !1, void 0) : (x.handleKey(t, c(e), e), void 0)
    }
    function h(e) {
        return "shift" == e || "ctrl" == e || "alt" == e || "meta" == e
    }
    function d() {
        clearTimeout(E),
        E = setTimeout(i, 1e3)
    }
    function y() {
        if (!C) {
            C = {};
            for (var e in K) e > 95 && 112 > e || K.hasOwnProperty(e) && (C[K[e]] = e)
        }
        return C
    }
    function m(e, t, n) {
        return n || (n = y()[e] ? "keydown": "keypress"),
        "keypress" == n && t.length && (n = "keydown"),
        n
    }
    function v(e, t, n, o) {
        function a(t) {
            return function() {
                M = t,
                ++j[e],
                d()
            }
        }
        function c(t) {
            f(n, t, e),
            "keyup" !== o && (S = r(t)),
            setTimeout(i, 10)
        }
        j[e] = 0;
        for (var u = 0; u < t.length; ++u) {
            var s = u + 1 === t.length,
            l = s ? c: a(o || g(t[u + 1]).action);
            b(t[u], l, o, e, u)
        }
    }
    function k(e) {
        return "+" === e ? ["+"] : e.split("+")
    }
    function g(e, t) {
        var n, r, o, i = [];
        for (n = k(e), o = 0; o < n.length; ++o) r = n[o],
        T[r] && (r = T[r]),
        t && "keypress" != t && P[r] && (r = P[r], i.push("shift")),
        h(r) && i.push(r);
        return t = m(r, i, t),
        {
            key: r,
            modifiers: i,
            action: t
        }
    }
    function b(e, t, n, r, o) {
        N[e + ":" + n] = t,
        e = e.replace(/\s+/g, " ");
        var i, c = e.split(" ");
        return c.length > 1 ? (v(e, c, t, n), void 0) : (i = g(e, n), L[i.key] = L[i.key] || [], a(i.key, i.modifiers, {
            type: i.action
        },
        r, e, o), L[i.key][r ? "unshift": "push"]({
            callback: t,
            modifiers: i.modifiers,
            action: i.action,
            seq: r,
            level: o,
            combo: e
        }), void 0)
    }
    function w(e, t, n) {
        for (var r = 0; r < e.length; ++r) b(e[r], t, n)
    }
    for (var C, E, K = {
        8 : "backspace",
        9 : "tab",
        13 : "enter",
        16 : "shift",
        17 : "ctrl",
        18 : "alt",
        20 : "capslock",
        27 : "esc",
        32 : "space",
        33 : "pageup",
        34 : "pagedown",
        35 : "end",
        36 : "home",
        37 : "left",
        38 : "up",
        39 : "right",
        40 : "down",
        45 : "ins",
        46 : "del",
        91 : "meta",
        93 : "meta",
        224 : "meta"
    },
    q = {
        106 : "*",
        107 : "+",
        109 : "-",
        110 : ".",
        111 : "/",
        186 : ";",
        187 : "=",
        188 : ",",
        189 : "-",
        190 : ".",
        191 : "/",
        192 : "`",
        219 : "[",
        220 : "\\",
        221 : "]",
        222 : "'"
    },
    P = {
        "~": "`",
        "!": "1",
        "@": "2",
        "#": "3",
        $: "4",
        "%": "5",
        "^": "6",
        "&": "7",
        "*": "8",
        "(": "9",
        ")": "0",
        _: "-",
        "+": "=",
        ":": ";",
        '"': "'",
        "<": ",",
        ">": ".",
        "?": "/",
        "|": "\\"
    },
    T = {
        option: "alt",
        command: "meta",
        "return": "enter",
        escape: "esc",
        mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "meta": "ctrl"
    },
    L = {},
    N = {},
    j = {},
    S = !1, A = !1, M = !1, O = 1; 20 > O; ++O) K[111 + O] = "f" + O;
    for (O = 0; 9 >= O; ++O) K[O + 96] = O;
    n(t, "keypress", p),
    n(t, "keydown", p),
    n(t, "keyup", p);
    var x = {
        bind: function(e, t, n) {
            return "[object Array]" != Object.prototype.toString.call(e) && (e = [e]),
            w(e, t, n),
            this
        },
        unbind: function(e, t) {
            return x.bind(e,
            function() {},
            t)
        },
        trigger: function(e, t) {
            return N[e + ":" + t] && N[e + ":" + t]({},
            e),
            this
        },
        reset: function() {
            return L = {},
            N = {},
            this
        },
        stopCallback: function(e, t) {
            return (" " + t.className + " ").indexOf(" mousetrap ") > -1 ? !1 : "INPUT" == t.tagName || "SELECT" == t.tagName || "TEXTAREA" == t.tagName || t.isContentEditable
        },
        handleKey: l
    };
    e.Mousetrap = x,
    "function" == typeof define && define(x)
} (window, document);