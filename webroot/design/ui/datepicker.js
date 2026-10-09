define(function(require) {
    function e(e, t) {
        return (Math.pow(10, t - (e + "").length) + "").substr(1) + e
    }
    function t(e) {
        return e && parseInt(e.replace(w, "")) || 0
    }
    function n(e, t) {
        for (var n = 0,
        i = e.length,
        o = e[0]; i > n && t.call(o, o, n) !== !1; o = e[++n]);
    }
    function i(e, t) {
        for (var n in t) e[n] = t[n];
        return e
    }
    function o(e, t, n) {
        if ("object" == typeof t) {
            for (var i in t) o(e, i, t[i]);
            return e
        }
        return e && 3 !== e.nodeType && 8 !== e.nodeType ? ("number" != typeof n || y.test(t) || (n += "px"), ("width" === t || "height" === t) && parseFloat(n) < 0 && (n = void 0), void 0 !== n && (e.style[t] = n), e) : e
    }
    function a(e, t) {
        if (e.className) for (var n = " " + e.className + " ",
        i = (t || "").split(_), o = 0, a = i.length; a > o; o++) n.indexOf(" " + i[o] + " ") < 0 && (e.className += " " + i[o]);
        else e.className = t;
        return e
    }
    function r(e, t) {
        return (" " + e.className + " ").indexOf(" " + t + " ") > -1
    }
    function s(e, t) {
        if (e.className) if (t) {
            for (var n = " " + e.className + " ",
            i = (t || "").split(_), o = 0, a = i.length; a > o; o++) n = n.replace(" " + i[o] + " ", " ");
            e.className = n.substring(1, n.length - 1)
        } else e.className = "";
        return e
    }
    function l(e, t) {
        return e = Y(e),
        t.appendChild(e),
        e
    }
    function u(e, t, n) {
        e = e == window ? C: e;
        var i, o = e[T];
        return t || o ? (o || (o = ++A), i = D[o] ? D[o] : "undefined" == typeof n ? {}: D[o] = {},
        void 0 !== n && (e[T] = o, i[t] = n), t ? i[t] : i) : null
    }
    function d(e, t) {
        e = e == window ? C: e;
        var n = e[T],
        i = D[n];
        if (t) i && delete i[t];
        else {
            try {
                delete e[T]
            } catch(o) {
                e.removeAttribute && e.removeAttribute(T)
            }
            delete D[n]
        }
    }
    function f(e, t) {
        function n(e) {
            e.type = "mousewheel";
            var n = e.originalEvent;
            e.delta = n ? n.wheelDelta ? n.wheelDelta / 120 : n.detail ? -n.detail / 3 : 0 : 0,
            t.apply(this, arguments)
        }
        e.addEventListener ? (x.add(e, "mousewheel", n), x.add(e, "DOMMouseScroll", n)) : x.add(e, "mousewheel", n)
    }
    function c(e, t) {
        var n = H.exec(t);
        return n ? n[0] in H.find ? H.find[n[0]](n[1], e) : H.filter(e.getElementsByTagName("*"), n[0], n[1]) : e.getElementsByTagName("*")
    }
    function p(e, t) {
        var n = H.exec(t);
        return n ? H.filter(e, n[0], n[1]) : e
    }
    function h(e, t) {
        var n = [];
        if (e = e.firstChild, !e) return n;
        do 1 === e.nodeType && n.push(e);
        while (e = e.nextSibling);
        return t ? p(n, t) : n
    }
    function v(e, t, n, i) {
        function o(t, n, i) {
            var o = parseFloat(S(e, t)) || 0,
            a = (n - o) / i;
            return {
                now: o,
                unit: a,
                end: n
            }
        }
        function a(e, t) {
            t.now = t.now + t.unit,
            u[e] = t.now + "px"
        }
        function r(e, t) {
            u[e] = t.end + "px"
        }
        function s() {
            if (d) {
                clearInterval(d),
                d = null;
                for (var n in t) r(n, t[n]);
                "function" == typeof i && i.call(e)
            }
        }
        void 0 == n && (n = 200);
        var l = parseInt(n / 13),
        u = e.style,
        d = null;
        for (var f in t) t[f] = o(f, t[f], l);
        d = setInterval(function() {
            if (--l < 1) s();
            else for (var e in t) a(e, t[e])
        },
        13),
        this.stop = s
    }
    require("./datepicker/style.css");
    var m = window.document,
    g = [].slice,
    y = /z-?index|font-?weight|opacity|zoom|line-?height/i,
    _ = /\s+/,
    w = /^0/,
    E = /([Hhms])\1*/,
    b = /^body|html$/i,
    M = "CSS1Compat" == m.compatMode,
    T = "expando" + (new Date).getTime(),
    D = {},
    C = {},
    A = 0,
    O = m.compareDocumentPosition ?
    function(e, t) {
        return e === t || !!(16 & e.compareDocumentPosition(t))
    }: function(e, t) {
        return (9 === e.nodeType ? e.documentElement: e).contains(9 === t.nodeType ? t.documentElement: t)
    };
    M ||
    function(e) {
        function t() {
            if (!o) {
                if (!m.body) return setTimeout(t, 1);
                o = 1,
                e()
            }
        }
        function n() {
            m.removeEventListener("DOMContentLoaded", n, !1),
            t()
        }
        function n() {
            "complete" == m.readyState && (m.detachEvent("onreadystatechange", n), t())
        }
        function i() {
            try {
                m.documentElement.doScroll("left")
            } catch(e) {
                return setTimeout(i, 1),
                void 0
            }
            t()
        }
        var o = 0;
        if ("complete" == m.readyState) return setTimeout(t, 1);
        if (m.addEventListener) m.addEventListener("DOMContentLoaded", n, !1),
        window.addEventListener("load", t, !1);
        else if (m.attachEvent) {
            m.attachEvent("onreadystatechange", n),
            window.attachEvent("onload", t);
            var a = !1;
            try {
                a = null == window.frameElement
            } catch(r) {}
            a && m.documentElement.doScroll && i()
        }
    } (function() {
        var e = m.createElement("div");
        e.style.width = e.style.paddingLeft = "1px",
        m.body.appendChild(e),
        M = 2 === e.offsetWidth,
        m.body.removeChild(e),
        e = null
    });
    var S = function() {
        var e = /([A-Z])/g,
        t = /^\d+(?:px)?$/i,
        n = /^\d/;
        return m.defaultView && m.defaultView.getComputedStyle ?
        function(t, n) {
            var i = t.ownerDocument.defaultView.getComputedStyle(t, null);
            return i && i.getPropertyValue(n.replace(e, "-$1").toLowerCase())
        }: function(e, i) {
            var o = e.currentStyle[i],
            a = e.style;
            if (!t.test(o) && n.test(o)) {
                var r = a.left,
                s = e.runtimeStyle.left;
                e.runtimeStyle.left = e.currentStyle.left,
                a.left = o || 0,
                o = a.pixelLeft + "px",
                a.left = r,
                e.runtimeStyle.left = s
            }
            return o
        }
    } (),
    N = function() {
        function e() {
            var t, l, u, d = m.body,
            f = m.createElement("div"),
            c = parseFloat(S(d, "marginTop", !0)) || 0;
            i(f.style, {
                position: "absolute",
                top: 0,
                left: 0,
                margin: 0,
                border: 0,
                width: "1px",
                height: "1px",
                visibility: "hidden"
            }),
            f.innerHTML = '<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>',
            d.insertBefore(f, d.firstChild),
            t = f.firstChild,
            l = t.firstChild,
            u = t.nextSibling.firstChild.firstChild,
            n = 5 !== l.offsetTop,
            o = 5 === u.offsetTop,
            l.style.position = "fixed",
            l.style.top = "20px",
            a = 20 === l.offsetTop || 15 === l.offsetTop,
            l.style.position = l.style.top = "",
            t.style.overflow = "hidden",
            t.style.position = "relative",
            r = -5 === l.offsetTop,
            s = d.offsetTop !== c,
            d.removeChild(f),
            d = f = t = l = u = null,
            e = null
        }
        function t(t) {
            var n = t.offsetTop,
            i = t.offsetLeft;
            return e && e(),
            s && (n += parseFloat(S(t, "marginTop", !0)) || 0, i += parseFloat(S(t, "marginLeft", !0)) || 0),
            {
                top: n,
                left: i
            }
        }
        var n, o, a, r, s;
        return "getBoundingClientRect" in m.documentElement ?
        function(e) {
            if (e === e.ownerDocument.body) return t(e);
            var n = e.getBoundingClientRect(),
            i = e.ownerDocument,
            o = i.body,
            a = i.documentElement,
            r = a.clientTop || o.clientTop || 0,
            s = a.clientLeft || o.clientLeft || 0,
            l = n.top + (self.pageYOffset || M && a.scrollTop || o.scrollTop) - r,
            u = n.left + (self.pageXOffset || M && a.scrollLeft || o.scrollLeft) - s;
            return {
                top: l,
                left: u
            }
        }: function(i) {
            if (i === i.ownerDocument.body) return t(i);
            e && e();
            for (var s, l = i.offsetParent,
            u = i,
            d = i.ownerDocument,
            f = d.documentElement,
            c = d.body,
            p = d.defaultView,
            h = p.getComputedStyle(i, null), v = i.offsetTop, m = i.offsetLeft; (i = i.parentNode) && i !== c && i !== f && (!a || "fixed" !== h.position);) s = p.getComputedStyle(i, null),
            v -= i.scrollTop,
            m -= i.scrollLeft,
            i === l && (v += i.offsetTop, m += i.offsetLeft, !n || o && /^t(able|d|h)$/i.test(i.nodeName) || (v += parseFloat(s.borderTopWidth) || 0, m += parseFloat(s.borderLeftWidth) || 0), u = l, l = i.offsetParent),
            r && "visible" !== s.overflow && (v += parseFloat(s.borderTopWidth) || 0, m += parseFloat(s.borderLeftWidth) || 0),
            h = s;
            return ("relative" === h.position || "static" === h.position) && (v += c.offsetTop, m += c.offsetLeft),
            a && "fixed" === h.position && (v += Math.max(f.scrollTop, c.scrollTop), m += Math.max(f.scrollLeft, c.scrollLeft)),
            {
                top: v,
                left: m
            }
        }
    } (),
    F = function() {
        function e(e) {
            for (e = e.offsetParent || m.body; e && !b.test(e.nodeName) && "static" === S(e, "position");) e = e.offsetParent;
            return e
        }
        return function(t) {
            var n = e(t),
            i = N(t),
            o = b.test(n.nodeName) ? {
                top: 0,
                left: 0
            }: N(n);
            return i.top -= parseFloat(S(t, "marginTop")) || 0,
            i.left -= parseFloat(S(t, "marginLeft")) || 0,
            o.top += parseFloat(S(n, "borderTopWidth")) || 0,
            o.left += parseFloat(S(n, "borderLeftWidth")) || 0,
            {
                top: i.top - o.top,
                left: i.left - o.left
            }
        }
    } (),
    Y = function() {
        var e = m.createElement("div");
        return function(t) {
            return t.nodeType ? t: (e.innerHTML = t, t = e.firstChild, e.removeChild(t), t)
        }
    } (),
    x = function() {
        function e(e) {
            e && e.type ? (this.originalEvent = e, this.type = e.type, this.target = e.target || e.srcElement || m, 3 === this.target.nodeType && (this.target = this.target.parentNode), this.which = e.which || e.charCode || e.keyCode, this.shiftKey = e.shiftKey, this.ctrlKey = e.ctrlKey) : (this.type = e, this.target = m),
            this[T] = !0
        }
        function t(t) {
            return t[T] ? t: new e(t)
        }
        function n() {
            var e = t(arguments[0] || window.event),
            n = (u(this, "events") || {})[e.type];
            arguments[0] = e;
            for (var i in n) n[i].apply(this, arguments)
        }
        var i = 0,
        o = 0;
        e.prototype = {
            preventDefault: function() {
                var e = this.originalEvent;
                e && (e.preventDefault && e.preventDefault(), e.returnValue = !1)
            },
            stopPropagation: function() {
                var e = this.originalEvent;
                e && (e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
            },
            halt: function() {
                this.preventDefault(),
                this.stopPropagation()
            }
        };
        var a = {
            add: function(e, t, a) {
                if (3 !== e.nodeType && 8 !== e.nodeType) {
                    e.setInterval && e !== window && !e.frameElement && (e = window),
                    a.guid || (a.guid = i++);
                    var r = u(e, "events") || u(e, "events", {}),
                    s = u(e, "handle") || u(e, "handle",
                    function() {
                        o || n.apply(arguments.callee.elem, arguments)
                    });
                    s.elem = e;
                    var l = r[t];
                    return l || (l = r[t] = {},
                    e.addEventListener ? e.addEventListener(t, s, !1) : e.attachEvent && e.attachEvent("on" + t, s)),
                    l[a.guid] = a,
                    e = null,
                    a.guid
                }
            },
            trigger: function(t, n) {
                var i = t.type || t,
                a = "object" == typeof t ? t.originalEvent || t: null,
                r = u(n, "handle");
                r && (o = 1, t = new e(i), t.originalEvent = a, t.target = n, r.apply(n, t), o = 0)
            },
            remove: function(e, t, n) {
                if (3 !== e.nodeType && 8 !== e.nodeType) {
                    var i, o = u(e, "events");
                    if (o) {
                        if (o[t]) {
                            if (n) delete o[t]["function" == typeof n ? n.guid: n];
                            else for (var a in o[t]) delete o[t][a];
                            for (i in o[t]) break;
                            i || (e.removeEventListener ? e.removeEventListener(t, u(e, "handle"), !1) : e.detachEvent && e.detachEvent("on" + t, u(e, "handle")), i = null, delete o[t])
                        }
                        for (i in o) break;
                        if (!i) {
                            var a = u(e, "handle");
                            a && (a.elem = null),
                            d(e, "events"),
                            d(e, "handle")
                        }
                    }
                }
            }
        };
        return a.add(window, "unload",
        function() {
            for (var e in D) 1 != e && D[e].handle && a.remove(D[e].handle.elem)
        }),
        a
    } (),
    H = {
        match: {
            CLASS: /\.([\w\-]+)/,
            DATE: /@([\w\-]+)/,
            TAG: /^([\w\-]+)/
        },
        find: {
            TAG: function(e, t) {
                return t.getElementsByTagName(e)
            }
        },
        filter: function(e, t, n) {
            for (var i, o = [], a = H.filters[t], r = 0; i = e[r++];) 1 === i.nodeType && a(i, n) && o.push(i);
            return o
        },
        filters: {
            TAG: function(e, t) {
                return "*" === t && 1 === e.nodeType || e.nodeName === t
            },
            CLASS: function(e, t) {
                return (" " + (e.className || e.getAttribute("class")) + " ").indexOf(" " + t + " ") > -1
            },
            DATE: function(e, t) {
                return e.getAttribute("date") == t
            }
        },
        nth: function(e, t, n, i, o) {
            var a = 0,
            r = i && H.filters[i];
            if (r) {
                for (; e = e[t];) if (r(e, o) && ++a == n) return e
            } else for (; e = e[t];) if (++a == n) return e;
            return e = null,
            null
        },
        exec: function(e) {
            if (!e) return null;
            for (var t in H.match) {
                var n = H.match[t].exec(e);
                if (n) return [t, n[1]]
            }
            return null
        }
    }; !
    function() {
        var e = m.createElement("div");
        if (m.getElementsByClassName && m.documentElement.getElementsByClassName) {
            if (e.innerHTML = "<div class='test e'></div><div class='test'></div>", 0 === e.getElementsByClassName("e").length) return;
            if (e.lastChild.className = "e", 1 === e.getElementsByClassName("e").length) return;
            c.CLASS = function(e, t) {
                return "undefined" != typeof t.getElementsByClassName ? t.getElementsByClassName(e[1]) : void 0
            }
        }
    } ();
    var L = function() {
        function n(e) {
            return e.replace(o, "\\$&").replace(s, "\\s+")
        }
        function i(e) {
            this.date = new Date;
            for (var t in f) t in e && f[t].s && f[t].s(e[t], this)
        }
        var o = /[.\\+*?\[\^\]$(){}=!<>,|:\-]/g,
        a = /([a-zA-Z])\1*/,
        r = /([a-zA-Z])\1*/g,
        s = /\s+/g,
        l = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11
        },
        u = {
            0 : "January",
            1 : "February",
            2 : "March",
            3 : "April",
            4 : "May",
            5 : "June",
            6 : "July",
            7 : "August",
            8 : "September",
            9 : "October",
            10 : "November",
            11 : "December"
        },
        d = {
            0 : "Sunday",
            1 : "Monday",
            2 : "Tuesday",
            3 : "Wednesday",
            4 : "Thursday",
            5 : "Friday",
            6 : "Saturday"
        },
        f = {
            Y: {
                r: "\\d{4}",
                s: function(e, t) {
                    t.setYear(parseInt(e))
                },
                g: function(e) {
                    return e.getFullYear()
                }
            },
            yyyy: {
                r: "\\d{4}",
                s: function(e, t) {
                    t.setYear(parseInt(e))
                },
                g: function(e) {
                    return e.getFullYear()
                }
            },
            yy: {
                r: "\\d{2}",
                s: function(e, t) {
                    t.setYear(parseInt(((new Date).getFullYear() + "").substring(0, 2) + e))
                },
                g: function(e) {
                    return (e.getFullYear() + "").substr( - 2, 2)
                }
            },
            M: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setMonth(t(e) - 1)
                },
                g: function(e) {
                    return e.getMonth() + 1
                }
            },
            MM: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setMonth(t(e) - 1)
                },
                g: function(t) {
                    return e(t.getMonth() + 1, 2)
                }
            },
            MMM: {
                r: "[a-z]{3}",
                s: function(e, t) {
                    t.setMonth(l[e.toLowerCase()])
                },
                g: function(e) {
                    return u[e.getMonth()].substring(0, 3)
                }
            },
            MMMM: {
                r: "\\w{3,9}",
                s: function(e, t) {
                    t.setMonth(l[e.substring(0, 3).toLowerCase()])
                },
                g: function(e) {
                    return u[e.getMonth()]
                }
            },
            d: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setDate(t(e))
                },
                g: function(e) {
                    return e.getDate()
                }
            },
            dd: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setDate(t(e))
                },
                g: function(t) {
                    return e(t.getDate(), 2)
                }
            },
            tt: {
                r: "[ap]m",
                s: function(e, t) {
                    "pm" == (t.pm == e.toLowerCase())
                },
                g: function(e) {
                    return e.getHours() >= 12 ? "pm": "am"
                }
            },
            H: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setHours(t(e))
                },
                g: function(e) {
                    return e.getHours()
                }
            },
            HH: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setHours(t(e))
                },
                g: function(t) {
                    return e(t.getHours(), 2)
                }
            },
            h: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setHours(t(e) + (n.pm ? 12 : 0))
                },
                g: function(e) {
                    return e.getHours() % 12 || 12
                }
            },
            hh: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setHours(t(e) + (n.pm ? 12 : 0))
                },
                g: function(t) {
                    return e(t.getHours() % 12 || 12, 2)
                }
            },
            m: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setMinutes(t(e))
                },
                g: function(e) {
                    return e.getMinutes()
                }
            },
            mm: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setMinutes(t(e))
                },
                g: function(t) {
                    return e(t.getMinutes(), 2)
                }
            },
            s: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setSeconds(t(e))
                },
                g: function(e) {
                    return e.getSeconds()
                }
            },
            ss: {
                r: "\\d{1,2}",
                s: function(e, n) {
                    n.setSeconds(t(e))
                },
                g: function(t) {
                    return e(t.getSeconds(), 2)
                }
            },
            w: {
                r: "\\d",
                g: function(e) {
                    return e.getDay()
                }
            },
            N: {
                r: "\\d",
                g: function(e) {
                    return e.getDay() || 7
                }
            },
            DD: {
                r: "[a-z]{3,9}",
                g: function(e) {
                    return d[e.getDay()]
                }
            },
            D: {
                r: "[a-z]{3}",
                g: function(e) {
                    return d[e.getDay()].substring(0, 3)
                }
            },
            O: {
                r: "[+-]\\d{2}:?\\d{2}",
                g: function(t) {
                    return e( - t.getTimezoneOffset() / 60, 2) + "00"
                }
            }
        };
        return i.format = function(e, t) {
            return e.replace(r,
            function(e) {
                return e in f ? f[e].g(t) : e
            })
        },
        i.parse = function(e, t) {
            for (var o, r, s, l = {},
            u = 1,
            d = ""; e;) {
                if (o = a.exec(e), !o) {
                    d += n(e);
                    break
                }
                r = o[0],
                d += n(e.substring(0, o.index)),
                r in f ? (l[r] = u++, d += "(" + f[r].r + ")") : d += r,
                e = e.substr(o.index + r.length)
            }
            if (! (s = new RegExp(d, "i").exec(t))) return null;
            for (var c in l) l[c] = s[l[c]];
            return new i(l).getDate()
        },
        i.prototype = {
            setYear: function(e) {
                e > 0 && this.date.setFullYear(e)
            },
            setMonth: function(e) {
                e > -1 && this.date.setMonth(e)
            },
            setDate: function(e) {
                e > 0 && this.date.setDate(e)
            },
            setHours: function(e) {
                this.date.setHours(e)
            },
            setMinutes: function(e) {
                this.date.setMinutes(e)
            },
            setSeconds: function(e) {
                this.date.setSeconds(e)
            },
            getDate: function() {
                return this.date
            }
        },
        i
    } (),
    I = {
        PANEL: "datepanel",
        WRAPPER: "datepanel-wrapper",
        HEAD: "datepanel-head",
        BODY: "datepanel-body",
        FOOT: "datepanel-foot",
        CTRL: "datepanel-ctrl",
        PREV: "datepanel-prev",
        UP: "datepanel-up",
        NEXT: "datepanel-next",
        FOCUS: "datepanel-focus",
        ENTRY: "datepanel-entry",
        ITEM: "datepanel-item",
        DECADE: "datepanel-decade",
        YEAR: "datepanel-year",
        MONTH: "datepanel-month",
        WEEK: "datepanel-week",
        DATE: "datepanel-date",
        TODAY: "datepanel-today",
        TIME: "datepanel-time",
        NUMBOX: "datepanel-numbox",
        NUM: "datepanel-num",
        BUTTON: "datepanel-button"
    },
    U = {
        DECADE_CHANGED: 1,
        YEAR_CHANGED: 2,
        MONTH_CHANGED: 3,
        VIEW_CHANGED: 4,
        DATE_FOCUSED: 5,
        ITEM_CLICKED: 6,
        DATE_CLICKED: 7
    },
    W = {
        WEEKNAME: ["日", "一", "二", "三", "四", "五", "六"],
        MONTHNAME: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        FORMAT: "yyyy年M月",
        TIME: "时间",
        OK: "确定",
        TODAY: "今天",
        NOW: "现在",
        EMPTY: "清空"
    },
    k = ["Y-M-d H:m:s", "Y/M/d H:m:s", "Y年M月d日 H:m:s", "d MMMM Y H:m:s", "Y-M-d", "Y/M/d", "M/d/Y", "Y年M月d日", "d MMMM Y"],
    B = function() {
        function u(e, t) {
            if (!e || "string" != typeof e) return new Date;
            var i;
            return L.parse(t, e) || (i = Date.parse(e)) && new Date(i) || (n(k,
            function(t) {
                return i = L.parse(t, e),
                i ? !1 : 1
            }), i) || new Date
        }
        function d(n, i, a) {
            function r() {
                for (var t = [], o = 0; n > o; o++) t.push('<a hideFocus href="" class="' + I.NUM + '">' + e(o, 2) + "</a>");
                c = l('<div class="' + I.NUMBOX + '">' + t.join("") + "</div>", a),
                x.add(c, "click",
                function(e) {
                    e.halt(),
                    "A" === e.target.nodeName && (i.value = e.target.innerHTML, s(), i.focus())
                })
            }
            function s() {
                x.remove(m, "mousedown", f),
                o(c, "display", "none")
            }
            function u() {
                c || r(),
                o(c, "display", "block"),
                x.add(m, "mousedown", f)
            }
            function d() {
                i.select()
            }
            function f(e) {
                O(c, e.target) || O(i, e.target) || s()
            }
            var c = null;
            x.add(i, "keydown",
            function(o) {
                switch (s(), o.which) {
                case 38:
                case 40:
                    return i.value = e(Math.max(Math.min(t(i.value) + 39 - o.which, n - 1), 0), 2),
                    d(),
                    o.halt(),
                    void 0;
                case 8:
                case 9:
                case 13:
                case 27:
                case 37:
                case 39:
                case 127:
                    return
                } (o.which < 48 || o.which > 57 || o.shiftKey) && o.halt()
            }),
            x.add(i, "focus", d),
            x.add(i, "dblclick",
            function() {
                d(),
                u()
            })
        }
        function y(e) {
            var t = this;
            t._events = {};
            var n = i({},
            w);
            e && i(n, e),
            t._options = n,
            t._startDay = (parseInt(n.startDay) || 0) % 7;
            for (var p, v = ['<div class="' + I.WEEK + '">'], g = 0; 7 > g; g++) p = (g + t._startDay) % 7,
            v.push('<b class="' + I.WEEK + "-" + p + '">' + W.WEEKNAME[p] + "</b>");
            v.push("</div>"),
            t._weekday = v.join(""),
            v = null;
            var y = u(n.value, n.format),
            _ = y.getFullYear(),
            b = y.getMonth(),
            M = y.getDate(),
            T = y.getHours(),
            D = y.getMinutes(),
            C = y.getSeconds();
            t._hasTime = E.test(n.format),
            t._switchOnClick = t._hasTime || n.switchOnClick,
            t._curYear = _,
            t._curMonth = b,
            t._curDate = M,
            t._focusedYear = null,
            t._focusedMonth = null,
            t._focusedDate = null;
            var A = l('<div class="' + I.WRAPPER + '"></div>', n.place || m.body),
            O = l('<div class="' + I.HEAD + '"><a hideFocus href="" class="' + I.CTRL + " " + I.PREV + '">&#x00AB;</a><a hideFocus href="" class="' + I.CTRL + " " + I.UP + '"></a><a hideFocus href="" class="' + I.CTRL + " " + I.NEXT + '">&#x00BB;</a></div>', A),
            S = l('<div class="' + I.BODY + '"><div class="' + I.DECADE + '"></div><div class="' + I.YEAR + '"></div><div class="' + I.MONTH + '"></div></div>', A),
            N = l('<div class="' + I.FOOT + '"></div>', A);
            if (t._hasTime && (t._timeBox = c(l('<div class="' + I.TIME + '"><span class="' + I.TIME + '-label">' + W.TIME + '</span><span class="' + I.TIME + '-value"><input class="' + I.TIME + '-h" value="' + T + '" /><b>:</b><input class="' + I.TIME + '-m" value="' + D + '"/><b>:</b><input class="' + I.TIME + '-s" value="' + C + '"/></span></div>', N), "input"), d(24, t._timeBox[0], A), d(60, t._timeBox[1], A), d(60, t._timeBox[2], A)), n.buttons) {
                var F = l('<div class="' + I.BUTTON + '"></div>', N),
                Y = [];
                for (var H in n.buttons) Y.unshift('<a hideFocus name="' + H + '" class="' + I.ITEM + '" href="">' + H + "</a>");
                F.innerHTML = Y.join(""),
                x.add(F, "click",
                function(e) {
                    var i = e.target;
                    if (i && "A" == i.nodeName) {
                        e.halt();
                        var o = i.getAttribute("name");
                        o && o in n.buttons && n.buttons[o].call(t)
                    }
                })
            }
            x.add(O, "click",
            function(e) {
                var n = e.target;
                if (n && "A" == n.nodeName) if (e.halt(), r(n, I.UP)) {
                    var i = n.getAttribute("date");
                    1 == t._viewmode ? t._setYear(i) : 2 == t._viewmode && t._setDecade(i)
                } else t.go(r(n, I.PREV) ? -1 : 1)
            }),
            x.add(S, "click",
            function(e) {
                var n = e.target;
                if ("A" == n.nodeName) {
                    e.halt();
                    var i = n.getAttribute("date"),
                    o = i.split("-");
                    3 == o.length ? (t._switchOnClick ? t.setMonth(i) : (t._focusedDate != n && (t._focusedDate && s(t._focusedDate, I.FOCUS), t._focusedDate = a(n, I.FOCUS)), t._trigger(U.DATE_FOCUSED, o[0], o[1], o[2])), t._trigger(U.DATE_CLICKED, i, n)) : 2 == o.length ? t.setMonth(i) : t._setYear(i),
                    t._trigger(U.ITEM_CLICKED, i, n)
                }
            }),
            f(S,
            function(e) {
                t.go( - 1 * e.delta),
                e.halt()
            });
            var k = c(O, "." + I.UP)[0];
            t.bind("VIEW_CHANGED",
            function(e, t) {
                var n, i;
                1 == e ? (n = L.format(W.FORMAT, new Date(t[0], t[1])), i = t.join("-")) : 2 == e ? (n = t[0], i = t[0]) : (n = t[0] + "-" + t[1], i = n),
                k.innerHTML = n,
                k.setAttribute("date", i)
            });
            var B = h(S);
            t._decadeWrapper = B[0],
            t._yearWrapper = B[1],
            t._monthWrapper = B[2],
            B = null,
            t._inAnimate = [],
            t._viewmode = 1;
            var P = l(t._renderMonthEntry(_, b), t._monthWrapper);
            o(t._monthWrapper, "display", "block");
            var R = {
                width: P.offsetWidth,
                height: P.offsetHeight
            };
            o(A, "width", R.width),
            o(S, R),
            o(t._decadeWrapper, R),
            o(t._yearWrapper, R),
            o(t._monthWrapper, R),
            t._wrapper = A,
            t._dim = R,
            t.setMonth(_ + "-" + b + "-" + M)
        }
        var _ = 160,
        w = {
            switchOnClick: !0,
            format: "yyyy-MM-dd HH:mm:ss",
            value: null,
            startDay: 0,
            place: null,
            buttons: null
        },
        b = function() {
            function e(e, t) {
                if ("number" == typeof e) return e;
                t || (t = 100),
                e = e.split("-");
                for (var n = 0,
                i = 0,
                o = e.length; o > i; i++) n += parseInt(e[i]) / Math.pow(t, i);
                return n
            }
            return function(t, n, i) {
                return t = e(t, i),
                n = e(n, i),
                t == n ? 0 : t > n ? 1 : -1
            }
        } ();
        return y.prototype = {
            _renderDateItem: function(e, t, n, i) {
                var o = I.ITEM,
                a = e + "-" + t + "-" + n;
                i && (o += " " + (i > 0 ? I.NEXT: I.PREV));
                var r = new Date;
                return [r.getFullYear(), r.getMonth(), r.getDate()].join("-") == a && (o += " " + I.TODAY),
                '<a hideFocus href="" class="' + o + '" date="' + a + '">' + n + "</a>"
            },
            _renderMonthItem: function(e, t) {
                return '<a hideFocus href="" class="' + I.ITEM + '" date="' + e + "-" + t + '">' + W.MONTHNAME[t] + "</a>"
            },
            _renderYearItem: function(e) {
                return '<a hideFocus href="" class="' + I.ITEM + '" date="' + e + '">' + e + "</a>"
            },
            _renderDecadeEntry: function(e, t) {
                for (var n = Y('<div class="' + I.ENTRY + '" date="' + e + "-" + t + '"></div>'), i = [], o = 0, a = e - 1; 12 > o; o++) i.push(this._renderYearItem(a + o)),
                3 == o % 4 && 11 != o && i.push("<br />");
                return n.innerHTML = i.join(""),
                n
            },
            _renderYearEntry: function(e) {
                for (var t = Y('<div class="' + I.ENTRY + '" date="' + e + '"></div>'), n = [], i = 0; 12 > i; i++) n.push(this._renderMonthItem(e, i)),
                3 == i % 4 && 11 != i && n.push("<br />");
                return t.innerHTML = n.join(""),
                t
            },
            _renderMonthEntry: function(e, t) {
                var n, i, o, a = this,
                r = new Date(e, t, 1),
                s = r.getDay() - a._startDay,
                l = Y('<div class="' + I.ENTRY + '" date="' + e + "-" + t + '"></div>'),
                u = [a._weekday],
                d = (0 > s ? -6 : 1) - s,
                f = e + t / 100,
                c = 1;
                M || u.push("<br />"),
                u.push('<div class="' + I.DATE + '">');
                do r.setDate(d),
                o = r.getFullYear(),
                n = r.getDate(),
                i = r.getMonth(),
                u.push(a._renderDateItem(o, i, n, o + i / 100 - f)),
                0 == c % 7 && 42 != c && u.push("<br />"),
                d = n + 1;
                while (c++<42);
                return u.push("</div>"),
                l.innerHTML = u.join(""),
                l
            },
            _clearAnimate: function() {
                n(this._inAnimate,
                function() {
                    this.stop()
                }),
                this._inAnimate = []
            },
            _setDecade: function(e) {
                var t, r = this,
                e = e && parseInt(e.toString().split("-")[0]) || r._curYear,
                u = e - e % 10,
                d = u + 9,
                f = r._decadeWrapper,
                m = r._yearWrapper,
                g = r._monthWrapper,
                y = r._dim,
                w = h(f, "." + I.ENTRY);
                if (! (1900 > u)) {
                    if (w.length && (t = p(w, "@" + u + "-" + d)[0]) || (t = l(r._renderDecadeEntry(u, d), f), o(t, y)), r._clearAnimate(), 3 == r._viewmode) {
                        var E = p(w, "." + I.FOCUS)[0];
                        if (E) {
                            var M = b(E.getAttribute("date"), u + "-" + d, 1e4);
                            M && (r._inAnimate.push(new v(s(o(E, "position", "absolute"), I.FOCUS), {
                                left: M * y.width
                            },
                            _,
                            function() {
                                o(E, {
                                    display: "none",
                                    position: "",
                                    left: 0
                                })
                            })), r._inAnimate.push(new v(a(o(t, {
                                position: "absolute",
                                left: -M * y.width,
                                display: "block"
                            }), I.FOCUS), {
                                left: 0
                            },
                            _,
                            function() {
                                o(t, "position", "")
                            })))
                        } else a(t, I.FOCUS)
                    } else {
                        var T = 2 == r._viewmode ? m: g,
                        D = h(T, "." + I.FOCUS)[0].getAttribute("date").split("-")[0];
                        n(p(w, "." + I.FOCUS),
                        function(e) {
                            s(o(e, "display", "none"), I.FOCUS)
                        }),
                        o(a(t, I.FOCUS), "display", "block"),
                        o(f, i({
                            position: "absolute",
                            left: 0,
                            top: 0,
                            zIndex: 0,
                            display: "block"
                        },
                        y));
                        var C = h(t, "@" + D)[0],
                        A = F(C);
                        r._inAnimate.push(new v(o(T, {
                            position: "absolute",
                            zIndex: 1
                        }), {
                            width: C.offsetWidth,
                            height: C.offsetHeight,
                            top: A.top,
                            left: A.left
                        },
                        _,
                        function() {
                            o(T, {
                                display: "none",
                                position: ""
                            }),
                            o(f, "position", "")
                        }))
                    }
                    r._viewmode = 3,
                    r._curYear = e;
                    var O = c(t, "@" + e)[0];
                    r._focusedYear != O && (r._focusedYear && s(r._focusedYear, I.FOCUS), r._focusedYear = a(O, I.FOCUS)),
                    r._trigger(U.DECADE_CHANGED, u, d, e),
                    r._trigger(U.VIEW_CHANGED, r._viewmode, [u, d, e])
                }
            },
            _setYear: function(e) {
                e = e ? e.toString().split("-") : [];
                var t, r = this,
                u = parseInt(e[0]) || r._curYear,
                d = parseInt(e[1]) || r._curMonth,
                f = r._yearWrapper,
                m = r._monthWrapper,
                g = r._decadeWrapper,
                y = r._dim,
                w = h(f, "." + I.ENTRY);
                if (! (1900 > u)) {
                    if (w.length && (t = p(w, "@" + u)[0]) || (t = l(r._renderYearEntry(u), f), o(t, y)), r._clearAnimate(), 1 == r._viewmode) {
                        n(p(w, "." + I.FOCUS),
                        function(e) {
                            s(o(e, "display", "none"), I.FOCUS)
                        }),
                        o(a(t, I.FOCUS), "display", "block"),
                        o(f, i({
                            display: "block",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            zIndex: 0
                        },
                        y));
                        var E = h(t, "@" + u + "-" + d)[0],
                        M = F(E);
                        r._inAnimate.push(new v(o(m, {
                            position: "absolute",
                            zIndex: 1
                        }), {
                            width: E.offsetWidth,
                            height: E.offsetHeight,
                            top: M.top,
                            left: M.left
                        },
                        _,
                        function() {
                            o(m, {
                                display: "none",
                                position: ""
                            }),
                            o(f, "position", "")
                        }))
                    } else if (2 == r._viewmode) {
                        var T = p(w, "." + I.FOCUS)[0];
                        if (T) {
                            var D = b(T.getAttribute("date"), u);
                            D && (r._inAnimate.push(new v(s(o(T, "position", "absolute"), I.FOCUS), {
                                left: D * y.width
                            },
                            _,
                            function() {
                                o(T, {
                                    position: "",
                                    display: "none",
                                    left: 0
                                })
                            })), r._inAnimate.push(new v(a(o(t, {
                                position: "absolute",
                                left: -D * y.width,
                                display: "block"
                            }), I.FOCUS), {
                                left: 0
                            },
                            _,
                            function() {
                                o(t, "position", "")
                            })))
                        } else a(t, I.FOCUS)
                    } else {
                        n(p(w, "." + I.FOCUS),
                        function(e) {
                            s(o(e, "display", "none"), I.FOCUS)
                        }),
                        o(a(t, I.FOCUS), "display", "block");
                        var T = h(g, "." + I.FOCUS)[0],
                        C = u - u % 10,
                        A = b(T.getAttribute("date"), C + "-" + (C + 9), 1e4);
                        if (A) r._inAnimate.push(new v(o(g, "position", "absolute"), {
                            left: A * y.width
                        },
                        _,
                        function() {
                            o(g, {
                                display: "none",
                                position: "",
                                left: 0
                            })
                        })),
                        r._inAnimate.push(new v(o(f, {
                            width: y.width,
                            height: y.height,
                            position: "absolute",
                            top: 0,
                            left: -A * y.width,
                            display: "block"
                        }), {
                            left: 0
                        },
                        _,
                        function() {
                            o(f, "position", "")
                        }));
                        else {
                            var E = h(T, "@" + u)[0],
                            M = F(E);
                            o(g, {
                                position: "absolute",
                                zIndex: 0
                            }),
                            r._inAnimate.push(new v(o(f, {
                                width: E.offsetWidth,
                                height: E.offsetHeight,
                                position: "absolute",
                                top: M.top,
                                left: M.left,
                                zIndex: 1,
                                display: "block"
                            }), i({
                                top: 0,
                                left: 0
                            },
                            y), _,
                            function() {
                                o(g, {
                                    display: "none",
                                    position: ""
                                }),
                                o(f, "position", "")
                            }))
                        }
                    }
                    r._viewmode = 2,
                    r._curYear = u,
                    r._curMonth = d;
                    var O = c(t, "@" + u + "-" + d)[0];
                    r._focusedMonth != O && (r._focusedMonth && s(r._focusedMonth, I.FOCUS), r._focusedMonth = a(O, I.FOCUS)),
                    r._trigger(U.YEAR_CHANGED, u),
                    r._trigger(U.VIEW_CHANGED, r._viewmode, [u])
                }
            },
            setMonth: function(e, t) {
                e = e ? e.toString().split("-") : [];
                var r, u = this,
                d = parseInt(e[0]) || u._curYear,
                f = parseInt(e[1]),
                m = parseInt(e[2]),
                g = u._monthWrapper,
                y = u._yearWrapper,
                w = u._decadeWrapper,
                E = u._dim,
                M = h(g, "." + I.ENTRY);
                if (void 0 == f && (f = u._curMonth), !(1900 > d)) {
                    if (M.length && (r = p(M, "@" + d + "-" + f)[0]) || (r = l(u._renderMonthEntry(d, f), g), o(r, E)), u._clearAnimate(), 1 == u._viewmode) {
                        var T = p(M, "." + I.FOCUS)[0];
                        if (!t && T) {
                            var D = b(T.getAttribute("date"), d + "-" + f);
                            D && (u._inAnimate.push(new v(s(o(T, "position", "absolute"), I.FOCUS), {
                                left: D * E.width
                            },
                            _,
                            function() {
                                o(T, {
                                    position: "",
                                    display: "none",
                                    left: 0
                                })
                            })), a(o(r, {
                                left: -D * E.width,
                                position: "absolute",
                                display: "block"
                            }), I.FOCUS), u._inAnimate.push(new v(r, {
                                left: 0
                            },
                            _,
                            function() {
                                o(r, "position", "")
                            })))
                        } else T && s(o(T, "display", "none"), I.FOCUS),
                        a(o(r, i({
                            display: "block",
                            left: 0,
                            top: 0
                        },
                        E)), I.FOCUS)
                    } else {
                        n(p(M, "." + I.FOCUS),
                        function(e) {
                            s(o(e, "display", "none"), I.FOCUS)
                        }),
                        o(a(r, I.FOCUS), "display", "block");
                        var C, T, D, A;
                        if (2 == u._viewmode) C = y,
                        T = h(y, "." + I.FOCUS)[0],
                        D = b(T.getAttribute("date"), d),
                        A = d + "-" + f;
                        else {
                            C = w,
                            T = h(w, "." + I.FOCUS)[0];
                            var O = d - d % 10;
                            D = b(T.getAttribute("date"), O + "-" + (O + 9), 1e4),
                            A = d
                        }
                        if (t) o(C, "display", "none"),
                        o(g, i({
                            display: "block",
                            left: 0,
                            top: 0
                        },
                        E));
                        else if (D) u._inAnimate.push(new v(o(C, "position", "absolute"), {
                            left: D * E.width
                        },
                        _,
                        function() {
                            o(C, {
                                position: "",
                                left: 0,
                                display: "none"
                            })
                        })),
                        u._inAnimate.push(new v(o(g, {
                            width: E.width,
                            height: E.height,
                            position: "absolute",
                            top: 0,
                            left: -D * E.width,
                            display: "block"
                        }), {
                            left: 0
                        },
                        _,
                        function() {
                            o(g, "position", "")
                        }));
                        else {
                            var S = h(T, "@" + A)[0],
                            N = F(S);
                            o(C, {
                                zIndex: 0,
                                position: "absolute"
                            }),
                            u._inAnimate.push(new v(o(g, {
                                width: S.offsetWidth,
                                height: S.offsetHeight,
                                position: "absolute",
                                top: N.top,
                                left: N.left,
                                zIndex: 1,
                                display: "block"
                            }), i({
                                top: 0,
                                left: 0
                            },
                            E), _,
                            function() {
                                o(g, "position", ""),
                                o(C, {
                                    display: "none",
                                    position: ""
                                })
                            }))
                        }
                    }
                    if (u._curYear = d, u._curMonth = f, m || u._focusedDate && !u._switchOnClick || (m = u._curDate), m) {
                        for (var Y, x, H = d + "-" + f + "-" + m,
                        L = c(r, "." + I.ITEM), W = L.length; x = L[--W];) if (b(Y = x.getAttribute("date"), H) <= 0) {
                            m = parseInt(Y.split("-")[2]);
                            break
                        }
                        u._focusedDate != x && (u._focusedDate && s(u._focusedDate, I.FOCUS), u._focusedDate = a(x, I.FOCUS)),
                        u._curDate = m,
                        u._trigger(U.DATE_FOCUSED, d, f, m)
                    }
                    u._viewmode = 1,
                    u._trigger(U.MONTH_CHANGED, d, f),
                    u._trigger(U.VIEW_CHANGED, u._viewmode, [d, f])
                }
            },
            _trigger: function(e) {
                var t, i = this,
                o = g.call(arguments, 1);
                e && (t = i._events[e]) && n(t,
                function(e) {
                    e.apply(i, o)
                })
            },
            bind: function(e, t) {
                return (e = U[e]) && (this._events[e] || (this._events[e] = []), this._events[e].push(t)),
                this
            },
            go: function(e) {
                var t = this;
                if (1 == t._viewmode) {
                    var n = new Date(t._curYear, t._curMonth + e, 1);
                    t.setMonth(n.getFullYear() + "-" + n.getMonth())
                } else 2 == t._viewmode ? t._setYear(t._curYear + e) : t._setDecade(t._curYear + 10 * e)
            },
            setTime: function(e) {
                var t = this,
                n = u(e, t._options.format);
                t.setMonth(n.getFullYear() + "-" + n.getMonth() + "-" + n.getDate(), !0),
                t._hasTime && (t._timeBox[0].value = n.getHours(), t._timeBox[1].value = n.getMinutes(), t._timeBox[2].value = n.getSeconds())
            },
            getDate: function() {
                var e, n, i, o = this,
                a = o._focusedDate.getAttribute("date").split("-"),
                r = new Date;
                return o._hasTime ? (e = t(o._timeBox[0].value), n = t(o._timeBox[1].value), i = t(o._timeBox[2].value)) : (e = r.getHours(), n = r.getMinutes(), i = r.getSeconds()),
                new Date(a[0], a[1], a[2], e, n, i)
            },
            format: function(e, t) {
                return L.format(e || this._options.format, t || this.getDate())
            },
            formatNow: function(e) {
                return this.format(e, new Date)
            },
            toString: function() {
                return this.format()
            }
        },
        y
    } (),
    P = function() {
        function e(e, t) {
            var t, n = "pageXOffset" in window ? window.pageXOffset: M && m.documentElement.scrollTop || m.body.scrollTop,
            i = "pageYOffset" in window ? window.pageYOffset: M && m.documentElement.scrollLeft || m.body.scrollLeft,
            o = M && m.documentElement.clientHeight || m.body.clientHeight,
            a = M && m.documentElement.clientWidth || m.body.clientWidth,
            r = N(e);
            t.style.left = r.left - i + t.offsetWidth > a ? Math.max(r.left + e.offsetWidth - t.offsetWidth, i) + "px": r.left + "px",
            t.style.top = r.top - n + e.offsetHeight + t.offsetHeight > o ? Math.max(n, n + o - t.offsetHeight, r.top - t.offsetHeight) + "px": r.top + e.offsetHeight + "px"
        }
        function t(e, n) {
            if (!e || 1 !== e.nodeType) throw "Expert DOMElement NODETYPE:1";
            var i = u(e, "datepicker");
            return i ? i.show() : ("_init" in this ? this._init(e, n) : new t(e, n), void 0)
        }
        var n = /INPUT|TEXTAREA/,
        a = {
            format: "yyyy-MM-dd",
            value: null,
            hideOnClick: !0,
            startDay: 0,
            change: null
        };
        return t.prototype = {
            _init: function(e, t) {
                function r() {
                    var e = d.format();
                    c.value.call(d, e),
                    c.change && c.change(e, s),
                    s.hide()
                }
                var s = this,
                d = null,
                f = l('<div class="' + I.PANEL + '"></div>', m.body),
                c = i({},
                a);
                t && i(c, t);
                var p = E.test(c.format),
                h = !p && c.hideOnClick,
                v = {};
                if (c.value) {
                    if ("function" != typeof c.value) {
                        var g = c.value,
                        y = n.test(g.nodeName) ? "value": "innerHTML";
                        c.value = function(e) {
                            return void 0 === e ? g[y] : (g[y] = e, void 0)
                        }
                    }
                } else c.value = n.test(e.nodeName) ?
                function(t) {
                    return void 0 === t ? e.value: (e.value = t, void 0)
                }: function() {};
                h || (v[W.OK] = r),
                v[p ? W.NOW: W.TODAY] = function() {
                    var e = d.formatNow();
                    c.value.call(d, e),
                    c.change && c.change(e, s),
                    s.hide()
                },
                v[W.EMPTY] = function() {
                    c.value.call(d, ""),
                    c.change && c.change("", s),
                    s.hide()
                },
                o(f, {
                    visibility: "hidden",
                    display: "block",
                    position: "absolute",
                    left: -500,
                    top: -500,
                    width: 500,
                    height: 500
                }),
                d = new B({
                    switchOnClick: !h,
                    format: c.format || "yyyy-MM-dd",
                    startDay: c.startDay,
                    place: f,
                    buttons: v
                }),
                o(f, {
                    width: "",
                    height: ""
                }),
                h && d.bind("DATE_CLICKED", r),
                u(e, "datepicker", s),
                s._dp = d,
                s._hid = null,
                s._panel = f,
                s._button = e,
                s._options = c,
                s._visible = !1,
                s.show()
            },
            _getCapture: function(e) {
                var t = this._panel,
                n = e.target;
                return n && (O(t, n) || n == this._button)
            },
            hide: function() {
                var e = this;
                e._visible = !1,
                e._hid && x.remove(m, "mousedown", e._hid),
                e._hid = null,
                e._panel.style.display = "none"
            },
            show: function() {
                var t = this;
                t._visible || (t._visible = !0, setTimeout(function() {
                    t._hid = x.add(m, "mousedown",
                    function(e) {
                        t._getCapture(e) || t.hide()
                    })
                },
                0), i(t._panel.style, {
                    visibility: "hidden",
                    display: "block"
                }), e(t._button, t._panel), t._panel.style.visibility = "visible", t._dp.setTime(t._options.value()))
            }
        },
        t
    } ();
    return B.setLocale = P.setLocale = function(e) {
        W = e
    },
    "jQuery" in window && (jQuery.fn.DatePicker = function(e) {
        this.bind(e.event || "click",
        function() {
            P(this, e)
        })
    }),
    P.Panel = B,
    P
});