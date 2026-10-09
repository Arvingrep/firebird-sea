(function(s, h) {
    "function" === typeof define && define.amd ? define(h) : "object" === typeof exports ? module.exports = h() : s.mobiscroll = h()
})(this, function() {
    var s = s || {};
    (function(h, e, b) {
        function k(a) {
            return "function" === typeof a
        }

        function a(a) {
            return "object" === typeof a
        }

        function g(a) {
            return a.replace(/-+(.)?/g, function(a, f) {
                return f ? f.toUpperCase() : ""
            })
        }

        function d(a, m, f) {
            for (var E in m)
                if (f && (G.isPlainObject(m[E]) || G.isArray(m[E]))) {
                    if (G.isPlainObject(m[E]) && !G.isPlainObject(a[E]) || G.isArray(m[E]) && !G.isArray(a[E])) a[E] = {};
                    d(a[E], m[E], f)
                } else m[E] !== b && (a[E] = m[E])
        }

        function l(a) {
            return a.replace(/::/g, "/").replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/_/g, "-").toLowerCase()
        }
        var H = {
                "column-count": 1,
                columns: 1,
                "font-weight": 1,
                "line-height": 1,
                opacity: 1,
                "z-index": 1,
                zoom: 1
            },
            x = {
                readonly: "readOnly"
            },
            q = [],
            o = Array.prototype.slice,
            u = function() {
                var d = function(f) {
                        for (var a = 0, a = 0; a < f.length; a++) this[a] = f[a];
                        this.length = f.length;
                        return m(this)
                    },
                    m = function(f, a) {
                        var c = [],
                            b = 0;
                        if (f && !a && f instanceof d) return f;
                        if (k(f)) return m(e).ready(f);
                        if (f)
                            if ("string" === typeof f) {
                                var j, f = b = f.trim();
                                if (0 <= b.indexOf("<") && 0 <= b.indexOf(">")) {
                                    j = "div";
                                    0 === b.indexOf("<li") && (j = "ul");
                                    0 === b.indexOf("<tr") && (j = "tbody");
                                    if (0 === b.indexOf("<td") || 0 === b.indexOf("<th")) j = "tr";
                                    0 === b.indexOf("<tbody") && (j = "table");
                                    0 === b.indexOf("<option") && (j = "select");
                                    j = e.createElement(j);
                                    j.innerHTML = b;
                                    for (b = 0; b < j.childNodes.length; b++) c.push(j.childNodes[b])
                                } else {
                                    !a && "#" === f[0] && !f.match(/[ .<>:~]/) ? j = [e.getElementById(f.split("#")[1])] :
                                        (a instanceof d && (a = a[0]), j = (a || e).querySelectorAll(f));
                                    for (b = 0; b < j.length; b++) j[b] && c.push(j[b])
                                }
                            } else if (f.nodeType || f === h || f === e) c.push(f);
                        else if (0 < f.length && f[0].nodeType)
                            for (b = 0; b < f.length; b++) c.push(f[b]);
                        else m.isArray(f) && (c = f);
                        return new d(c)
                    };
                d.prototype = {
                    ready: function(f) {
                        /complete|loaded|interactive/.test(e.readyState) && e.body ? f(m) : e.addEventListener("DOMContentLoaded", function() {
                            f(m)
                        }, !1);
                        return this
                    },
                    concat: q.concat,
                    empty: function() {
                        return this.each(function() {
                            this.innerHTML = ""
                        })
                    },
                    map: function(f) {
                        return m(m.map(this, function(a, c) {
                            return f.call(a, c, a)
                        }))
                    },
                    slice: function() {
                        return m(o.apply(this, arguments))
                    },
                    addClass: function(f) {
                        if ("undefined" === typeof f) return this;
                        for (var f = f.split(" "), a = 0; a < f.length; a++)
                            for (var c = 0; c < this.length; c++) "undefined" !== typeof this[c].classList && "" !== f[a] && this[c].classList.add(f[a]);
                        return this
                    },
                    removeClass: function(f) {
                        for (var f = f.split(" "), a = 0; a < f.length; a++)
                            for (var c = 0; c < this.length; c++) "undefined" !== typeof this[c].classList && "" !== f[a] && this[c].classList.remove(f[a]);
                        return this
                    },
                    hasClass: function(f) {
                        return this[0] ? this[0].classList.contains(f) : !1
                    },
                    toggleClass: function(f) {
                        for (var f = f.split(" "), a = 0; a < f.length; a++)
                            for (var c = 0; c < this.length; c++) "undefined" !== typeof this[c].classList && this[c].classList.toggle(f[a]);
                        return this
                    },
                    closest: function(f, b) {
                        var c = this[0],
                            d = !1;
                        for (a(f) && (d = m(f)); c && !(d ? 0 <= d.indexOf(c) : m.matches(c, f));) c = c !== b && c.nodeType !== c.DOCUMENT_NODE && c.parentNode;
                        return m(c)
                    },
                    attr: function(f, a) {
                        var c;
                        if (1 === arguments.length && "string" === typeof f && this.length) return c =
                            this[0].getAttribute(f), this[0] && (c || "" === c) ? c : b;
                        for (c = 0; c < this.length; c++)
                            if (2 === arguments.length) this[c].setAttribute(f, a);
                            else
                                for (var d in f) this[c][d] = f[d], this[c].setAttribute(d, f[d]);
                        return this
                    },
                    removeAttr: function(f) {
                        for (var a = 0; a < this.length; a++) this[a].removeAttribute(f);
                        return this
                    },
                    prop: function(f, a) {
                        f = x[f] || f;
                        if (1 === arguments.length && "string" === typeof f) return this[0] ? this[0][f] : b;
                        for (var c = 0; c < this.length; c++) this[c][f] = a;
                        return this
                    },
                    val: function(f) {
                        if ("undefined" === typeof f) return this.length &&
                            this[0].multiple ? m.map(this.find("option:checked"), function(f) {
                                return f.value
                            }) : this[0] ? this[0].value : b;
                        if (this.length && this[0].multiple) m.each(this[0].options, function() {
                            this.selected = -1 != f.indexOf(this.value)
                        });
                        else
                            for (var a = 0; a < this.length; a++) this[a].value = f;
                        return this
                    },
                    on: function(f, a, c, b) {
                        function j(f) {
                            var b, i;
                            b = f.target;
                            if (m(b).is(a)) c.call(b, f);
                            else {
                                i = m(b).parents();
                                for (b = 0; b < i.length; b++) m(i[b]).is(a) && c.call(i[b], f)
                            }
                        }

                        function d(f, a, b, c) {
                            a = a.split(".");
                            f.DomNameSpaces || (f.DomNameSpaces = []);
                            f.DomNameSpaces.push({
                                namespace: a[1],
                                event: a[0],
                                listener: b,
                                capture: c
                            });
                            f.addEventListener(a[0], b, c)
                        }
                        var f = f.split(" "),
                            e, g;
                        for (e = 0; e < this.length; e++)
                            if (k(a) || !1 === a) {
                                k(a) && (b = (c = a) || !1);
                                for (g = 0; g < f.length; g++) - 1 != f[g].indexOf(".") ? d(this[e], f[g], c, b) : this[e].addEventListener(f[g], c, b)
                            } else
                                for (g = 0; g < f.length; g++) this[e].DomLiveListeners || (this[e].DomLiveListeners = []), this[e].DomLiveListeners.push({
                                    listener: c,
                                    liveListener: j
                                }), -1 != f[g].indexOf(".") ? d(this[e], f[g], j, b) : this[e].addEventListener(f[g],
                                    j, b);
                        return this
                    },
                    off: function(f, a, b, d) {
                        function j(f) {
                            var a, b, c;
                            a = f.split(".");
                            var f = a[0],
                                j = a[1];
                            for (a = 0; a < l.length; ++a)
                                if (l[a].DomNameSpaces) {
                                    for (b = 0; b < l[a].DomNameSpaces.length; ++b)
                                        if (c = l[a].DomNameSpaces[b], c.namespace == j && (c.event == f || !f)) l[a].removeEventListener(c.event, c.listener, c.capture), c.removed = !0;
                                    for (b = l[a].DomNameSpaces.length - 1; 0 <= b; --b) l[a].DomNameSpaces[b].removed && l[a].DomNameSpaces.splice(b, 1)
                                }
                        }
                        var m, e, g, l = this,
                            f = f.split(" ");
                        for (m = 0; m < f.length; m++)
                            for (e = 0; e < this.length; e++)
                                if (k(a) ||
                                    !1 === a) k(a) && (d = (b = a) || !1), 0 === f[m].indexOf(".") ? j(f[m].substr(1), b, d) : this[e].removeEventListener(f[m], b, d);
                                else {
                                    if (this[e].DomLiveListeners)
                                        for (g = 0; g < this[e].DomLiveListeners.length; g++) this[e].DomLiveListeners[g].listener === b && this[e].removeEventListener(f[m], this[e].DomLiveListeners[g].liveListener, d);
                                    this[e].DomNameSpaces && this[e].DomNameSpaces.length && f[m] && j(f[m])
                                }
                        return this
                    },
                    trigger: function(f, a) {
                        for (var b = f.split(" "), d = 0; d < b.length; d++)
                            for (var j = 0; j < this.length; j++) {
                                var m;
                                try {
                                    m = new CustomEvent(b[d], {
                                        detail: a,
                                        bubbles: !0,
                                        cancelable: !0
                                    })
                                } catch (g) {
                                    m = e.createEvent("Event"), m.initEvent(b[d], !0, !0), m.detail = a
                                }
                                this[j].dispatchEvent(m)
                            }
                        return this
                    },
                    width: function(f) {
                        return f !== b ? this.css("width", f) : this[0] === h ? h.innerWidth : this[0] === e ? e.documentElement.scrollWidth : 0 < this.length ? parseFloat(this.css("width")) : null
                    },
                    height: function(f) {
                        if (f !== b) return this.css("height", f);
                        if (this[0] === h) return h.innerHeight;
                        if (this[0] === e) {
                            var f = e.body,
                                a = e.documentElement;
                            return Math.max(f.scrollHeight, f.offsetHeight, a.clientHeight,
                                a.scrollHeight, a.offsetHeight)
                        }
                        return 0 < this.length ? parseFloat(this.css("height")) : null
                    },
                    innerWidth: function() {
                        var f = this;
                        if (0 < this.length) {
                            if (this[0].innerWidth) return this[0].innerWidth;
                            var a = this[0].offsetWidth;
                            ["left", "right"].forEach(function(b) {
                                a -= parseInt(f.css(g("border-" + b + "-width")) || 0, 10)
                            });
                            return a
                        }
                    },
                    innerHeight: function() {
                        var a = this;
                        if (0 < this.length) {
                            if (this[0].innerHeight) return this[0].innerHeight;
                            var b = this[0].offsetHeight;
                            ["top", "bottom"].forEach(function(c) {
                                b -= parseInt(a.css(g("border-" +
                                    c + "-width")) || 0, 10)
                            });
                            return b
                        }
                    },
                    offset: function() {
                        if (0 < this.length) {
                            var a = this[0],
                                b = a.getBoundingClientRect(),
                                c = e.body;
                            return {
                                top: b.top + (h.pageYOffset || a.scrollTop) - (a.clientTop || c.clientTop || 0),
                                left: b.left + (h.pageXOffset || a.scrollLeft) - (a.clientLeft || c.clientLeft || 0)
                            }
                        }
                    },
                    hide: function() {
                        for (var a = 0; a < this.length; a++) this[a].style.display = "none";
                        return this
                    },
                    show: function() {
                        for (var a = 0; a < this.length; a++) "none" == this[a].style.display && (this[a].style.display = "block"), "none" == this[a].style.getPropertyValue("display") &&
                            (this[a].style.display = "block");
                        return this
                    },
                    clone: function() {
                        return this.map(function() {
                            return this.cloneNode(!0)
                        })
                    },
                    styles: function() {
                        return this[0] ? h.getComputedStyle(this[0], null) : b
                    },
                    css: function(a, b) {
                        var c, d, j, e, g = this[0],
                            k = "";
                        if (2 > arguments.length) {
                            if (!g) return;
                            c = getComputedStyle(g, "");
                            if ("string" === typeof a) return g.style[a] || c.getPropertyValue(a);
                            if (m.isArray(a)) return e = {}, m.each(a, function(a, f) {
                                e[f] = g.style[f] || c.getPropertyValue(f)
                            }), e
                        }
                        if ("string" === typeof a) !b && 0 !== b ? this.each(function() {
                                this.style.removeProperty(l(a))
                            }) :
                            k = l(a) + ":" + ("number" == typeof b && !H[l(a)] ? b + "px" : b);
                        else
                            for (j in a)
                                if (!a[j] && 0 !== a[j])
                                    for (d = 0; d < this.length; d++) this[d].style.removeProperty(l(j));
                                else k += l(j) + ":" + ("number" == typeof a[j] && !H[l(j)] ? a[j] + "px" : a[j]) + ";"; return this.each(function() {
                            this.style.cssText += ";" + k
                        })
                    },
                    each: function(a) {
                        for (var b = 0; b < this.length && !1 !== a.apply(this[b], [b, this[b]]); b++);
                        return this
                    },
                    filter: function(a) {
                        for (var b = [], c = 0; c < this.length; c++) k(a) ? a.call(this[c], c, this[c]) && b.push(this[c]) : m.matches(this[c], a) && b.push(this[c]);
                        return new d(b)
                    },
                    html: function(a) {
                        if ("undefined" === typeof a) return this[0] ? this[0].innerHTML : b;
                        this.empty();
                        for (var d = 0; d < this.length; d++) this[d].innerHTML = a;
                        return this
                    },
                    text: function(a) {
                        if ("undefined" === typeof a) return this[0] ? this[0].textContent.trim() : null;
                        for (var b = 0; b < this.length; b++) this[b].textContent = a;
                        return this
                    },
                    is: function(a) {
                        return 0 < this.length && m.matches(this[0], a)
                    },
                    not: function(f) {
                        var d = [];
                        if (k(f) && f.call !== b) this.each(function(a) {
                            f.call(this, a) || d.push(this)
                        });
                        else {
                            var c = "string" ==
                                typeof f ? this.filter(f) : "number" == typeof f.length && k(f.item) ? o.call(f) : m(f);
                            a(c) && (c = m.map(c, function(a) {
                                return a
                            }));
                            this.each(function(a, f) {
                                0 > c.indexOf(f) && d.push(f)
                            })
                        }
                        return m(d)
                    },
                    indexOf: function(a) {
                        for (var b = 0; b < this.length; b++)
                            if (this[b] === a) return b
                    },
                    index: function(a) {
                        return a ? this.indexOf(m(a)[0]) : this.parent().children().indexOf(this[0])
                    },
                    get: function(a) {
                        return a === b ? o.call(this) : this[0 <= a ? a : a + this.length]
                    },
                    eq: function(a) {
                        if ("undefined" === typeof a) return this;
                        var b = this.length;
                        return a > b -
                            1 ? new d([]) : 0 > a ? (a = b + a, 0 > a ? new d([]) : new d([this[a]])) : new d([this[a]])
                    },
                    append: function(a) {
                        var b, c;
                        for (b = 0; b < this.length; b++)
                            if ("string" === typeof a) {
                                c = e.createElement("div");
                                for (c.innerHTML = a; c.firstChild;) this[b].appendChild(c.firstChild)
                            } else if (a instanceof d)
                            for (c = 0; c < a.length; c++) this[b].appendChild(a[c]);
                        else this[b].appendChild(a);
                        return this
                    },
                    appendTo: function(a) {
                        m(a).append(this);
                        return this
                    },
                    prepend: function(a) {
                        var b, c;
                        for (b = 0; b < this.length; b++)
                            if ("string" === typeof a) {
                                var m = e.createElement("div");
                                m.innerHTML = a;
                                for (c = m.childNodes.length - 1; 0 <= c; c--) this[b].insertBefore(m.childNodes[c], this[b].childNodes[0])
                            } else if (a instanceof d)
                            for (c = 0; c < a.length; c++) this[b].insertBefore(a[c], this[b].childNodes[0]);
                        else this[b].insertBefore(a, this[b].childNodes[0]);
                        return this
                    },
                    prependTo: function(a) {
                        m(a).prepend(this);
                        return this
                    },
                    insertBefore: function(a) {
                        for (var a = m(a), b = 0; b < this.length; b++)
                            if (1 === a.length) a[0].parentNode.insertBefore(this[b], a[0]);
                            else if (1 < a.length)
                            for (var c = 0; c < a.length; c++) a[c].parentNode.insertBefore(this[b].cloneNode(!0),
                                a[c]);
                        return this
                    },
                    insertAfter: function(a) {
                        for (var a = m(a), b = 0; b < this.length; b++)
                            if (1 === a.length) a[0].parentNode.insertBefore(this[b], a[0].nextSibling);
                            else if (1 < a.length)
                            for (var c = 0; c < a.length; c++) a[c].parentNode.insertBefore(this[b].cloneNode(!0), a[c].nextSibling);
                        return this
                    },
                    next: function(a) {
                        return 0 < this.length ? a ? this[0].nextElementSibling && m(this[0].nextElementSibling).is(a) ? new d([this[0].nextElementSibling]) : new d([]) : this[0].nextElementSibling ? new d([this[0].nextElementSibling]) : new d([]) :
                            new d([])
                    },
                    nextAll: function(a) {
                        var b = [],
                            c = this[0];
                        if (!c) return new d([]);
                        for (; c.nextElementSibling;) c = c.nextElementSibling, a ? m(c).is(a) && b.push(c) : b.push(c);
                        return new d(b)
                    },
                    prev: function(a) {
                        return 0 < this.length ? a ? this[0].previousElementSibling && m(this[0].previousElementSibling).is(a) ? new d([this[0].previousElementSibling]) : new d([]) : this[0].previousElementSibling ? new d([this[0].previousElementSibling]) : new d([]) : new d([])
                    },
                    prevAll: function(a) {
                        var b = [],
                            c = this[0];
                        if (!c) return new d([]);
                        for (; c.previousElementSibling;) c =
                            c.previousElementSibling, a ? m(c).is(a) && b.push(c) : b.push(c);
                        return new d(b)
                    },
                    parent: function(a) {
                        for (var b = [], c = 0; c < this.length; c++) null !== this[c].parentNode && (a ? m(this[c].parentNode).is(a) && b.push(this[c].parentNode) : b.push(this[c].parentNode));
                        return m(m.unique(b))
                    },
                    parents: function(a) {
                        for (var b = [], c = 0; c < this.length; c++)
                            for (var d = this[c].parentNode; d;) a ? m(d).is(a) && b.push(d) : b.push(d), d = d.parentNode;
                        return m(m.unique(b))
                    },
                    find: function(a) {
                        for (var b = [], c = 0; c < this.length; c++)
                            for (var m = this[c].querySelectorAll(a),
                                    j = 0; j < m.length; j++) b.push(m[j]);
                        return new d(b)
                    },
                    children: function(a) {
                        for (var b = [], c = 0; c < this.length; c++)
                            for (var e = this[c].childNodes, j = 0; j < e.length; j++) a ? 1 === e[j].nodeType && m(e[j]).is(a) && b.push(e[j]) : 1 === e[j].nodeType && b.push(e[j]);
                        return new d(m.unique(b))
                    },
                    remove: function() {
                        for (var a = 0; a < this.length; a++) this[a].parentNode && this[a].parentNode.removeChild(this[a]);
                        return this
                    },
                    add: function() {
                        var a, b;
                        for (a = 0; a < arguments.length; a++) {
                            var c = m(arguments[a]);
                            for (b = 0; b < c.length; b++) this[this.length] = c[b],
                                this.length++
                        }
                        return this
                    },
                    before: function(a) {
                        m(a).insertBefore(this);
                        return this
                    },
                    after: function(a) {
                        m(a).insertAfter(this);
                        return this
                    },
                    scrollTop: function(a) {
                        if (this.length) {
                            var d = "scrollTop" in this[0];
                            return a === b ? d ? this[0].scrollTop : this[0].pageYOffset : this.each(d ? function() {
                                this.scrollTop = a
                            } : function() {
                                this.scrollTo(this.scrollX, a)
                            })
                        }
                    },
                    scrollLeft: function(a) {
                        if (this.length) {
                            var d = "scrollLeft" in this[0];
                            return a === b ? d ? this[0].scrollLeft : this[0].pageXOffset : this.each(d ? function() {
                                this.scrollLeft =
                                    a
                            } : function() {
                                this.scrollTo(a, this.scrollY)
                            })
                        }
                    },
                    contents: function() {
                        return this.map(function(a, b) {
                            return o.call(b.childNodes)
                        })
                    },
                    nextUntil: function(a) {
                        for (var b = this, c = []; b.length && !b.filter(a).length;) c.push(b[0]), b = b.next();
                        return m(c)
                    },
                    prevUntil: function(a) {
                        for (var b = this, c = []; b.length && !m(b).filter(a).length;) c.push(b[0]), b = b.prev();
                        return m(c)
                    },
                    detach: function() {
                        return this.remove()
                    }
                };
                m.fn = d.prototype;
                return m
            }(),
            G = u;
        s.$ = u;
        G.inArray = function(a, b, f) {
            return q.indexOf.call(b, a, f)
        };
        G.extend = function(a) {
            var b,
                f = o.call(arguments, 1);
            "boolean" == typeof a && (b = a, a = f.shift());
            a = a || {};
            f.forEach(function(f) {
                d(a, f, b)
            });
            return a
        };
        G.isFunction = k;
        G.isArray = function(a) {
            return "[object Array]" === Object.prototype.toString.apply(a)
        };
        G.isPlainObject = function(b) {
            return a(b) && null !== b && b !== b.window && Object.getPrototypeOf(b) == Object.prototype
        };
        G.each = function(b, d) {
            var f;
            if (a(b) && d) {
                if (G.isArray(b) || b instanceof u)
                    for (f = 0; f < b.length && !1 !== d.call(b[f], f, b[f]); f++);
                else
                    for (f in b)
                        if (b.hasOwnProperty(f) && "length" !== f && !1 === d.call(b[f],
                                f, b[f])) break; return this
            }
        };
        G.unique = function(a) {
            for (var b = [], f = 0; f < a.length; f++) - 1 === b.indexOf(a[f]) && b.push(a[f]);
            return b
        };
        G.map = function(a, b) {
            var f, d = [],
                c;
            if ("number" == typeof a.length)
                for (c = 0; c < a.length; c++) f = b(a[c], c), null !== f && d.push(f);
            else
                for (c in a) f = b(a[c], c), null !== f && d.push(f);
            return 0 < d.length ? G.fn.concat.apply([], d) : d
        };
        G.matches = function(a, b) {
            return !b || !a || 1 !== a.nodeType ? !1 : (a.matchesSelector || a.webkitMatchesSelector || a.mozMatchesSelector || a.msMatchesSelector).call(a, b)
        }
    })(window, document);
    s = s || {};
    (function(h, e, b) {
        function k(a) {
            for (var f in a)
                if (o[a[f]] !== b) return !0;
            return !1
        }

        function a(a, f, d) {
            var c = a;
            if ("object" === typeof f) return a.each(function() {
                x[this.id] && x[this.id].destroy();
                new s.classes[f.component || "Scroller"](this, f)
            });
            "string" === typeof f && a.each(function() {
                var a;
                if ((a = x[this.id]) && a[f])
                    if (a = a[f].apply(this, Array.prototype.slice.call(d, 1)), a !== b) return c = a, !1
            });
            return c
        }

        function g(a) {
            if (d.tapped && !a.tap && !("TEXTAREA" == a.target.nodeName && "mousedown" == a.type)) return a.stopPropagation(),
                a.preventDefault(), !1
        }
        var d, l = "undefined" == typeof jQuery ? s.$ : jQuery,
            H = +new Date,
            x = {},
            q = l.extend,
            o = e.createElement("modernizr").style,
            h = k(["perspectiveProperty", "WebkitPerspective", "MozPerspective", "OPerspective", "msPerspective"]),
            u = k(["flex", "msFlex", "WebkitBoxDirection"]),
            G = function() {
                var a = ["Webkit", "Moz", "O", "ms"],
                    b;
                for (b in a)
                    if (k([a[b] + "Transform"])) return "-" + a[b].toLowerCase() + "-";
                return ""
            }(),
            C = G.replace(/^\-/, "").replace(/\-$/, "").replace("moz", "Moz");
        d = s = {
            $: l,
            version: "3.0.0-beta4beta4",
            util: {
                prefix: G,
                jsPrefix: C,
                has3d: h,
                hasFlex: u,
                isOldAndroid: /android [1-3]/i.test(navigator.userAgent),
                preventClick: function() {
                    d.tapped++;
                    setTimeout(function() {
                        d.tapped--
                    }, 500)
                },
                testTouch: function(a, b) {
                    if ("touchstart" == a.type) l(b).attr("data-touch", "1");
                    else if (l(b).attr("data-touch")) return l(b).removeAttr("data-touch"), !1;
                    return !0
                },
                objectToArray: function(a) {
                    var b = [],
                        d;
                    for (d in a) b.push(a[d]);
                    return b
                },
                arrayToObject: function(a) {
                    var b = {},
                        d;
                    if (a)
                        for (d = 0; d < a.length; d++) b[a[d]] = a[d];
                    return b
                },
                isNumeric: function(a) {
                    return 0 <=
                        a - parseFloat(a)
                },
                isString: function(a) {
                    return "string" === typeof a
                },
                getCoord: function(a, b, d) {
                    var c = a.originalEvent || a,
                        b = (d ? "page" : "client") + b;
                    return c.targetTouches && c.targetTouches[0] ? c.targetTouches[0][b] : c.changedTouches && c.changedTouches[0] ? c.changedTouches[0][b] : a[b]
                },
                getPosition: function(a, d) {
                    var e = getComputedStyle(a[0]),
                        c;
                    l.each(["t", "webkitT", "MozT", "OT", "msT"], function(a, d) {
                        if (e[d + "ransform"] !== b) return c = e[d + "ransform"], !1
                    });
                    c = c.split(")")[0].split(", ");
                    return d ? c[13] || c[5] : c[12] || c[4]
                },
                constrain: function(a,
                    b, d) {
                    return Math.max(b, Math.min(a, d))
                },
                vibrate: function(a) {
                    "vibrate" in navigator && navigator.vibrate(a || 50)
                }
            },
            tapped: 0,
            autoTheme: "mobiscroll",
            presets: {
                scroller: {},
                numpad: {},
                listview: {},
                menustrip: {}
            },
            themes: {
                form: {},
                frame: {},
                listview: {},
                menustrip: {},
                progress: {}
            },
            i18n: {},
            instances: x,
            classes: {},
            components: {},
            settings: {},
            setDefaults: function(a) {
                q(this.settings, a)
            },
            presetShort: function(e, f, g) {
                d[e] = function(a, k) {
                    var j, n, u = {},
                        o = k || {};
                    l.extend(o, {
                        preset: !1 === g ? b : e
                    });
                    l(a).each(function() {
                        x[this.id] && x[this.id].destroy();
                        j = new d.classes[f || "Scroller"](this, o);
                        u[this.id] = j
                    });
                    n = Object.keys(u);
                    return 1 == n.length ? u[n[0]] : u
                };
                this.components[e] = function(c) {
                    return a(this, q(c, {
                        component: f,
                        preset: !1 === g ? b : e
                    }), arguments)
                }
            }
        };
        l.mobiscroll = s;
        l.fn.mobiscroll = function(b) {
            q(this, s.components);
            return a(this, b, arguments)
        };
        s.classes.Base = function(a, b) {
            var d, c, e, j, g, k, u = s,
                o = u.util,
                t = o.getCoord,
                i = this;
            i.settings = {};
            i._presetLoad = function() {};
            i._init = function(l) {
                for (var t in i.settings) delete i.settings[t];
                e = i.settings;
                q(b, l);
                i._hasDef &&
                    (k = u.settings);
                q(e, i._defaults, k, b);
                if (i._hasTheme) {
                    g = e.theme;
                    if ("auto" == g || !g) g = u.autoTheme;
                    "default" == g && (g = "mobiscroll");
                    b.theme = g;
                    j = u.themes[i._class] ? u.themes[i._class][g] : {}
                }
                i._hasLang && (d = u.i18n[e.lang]);
                i._hasTheme && i.trigger("onThemeLoad", {
                    lang: d,
                    settings: b
                });
                q(e, j, d, k, b);
                if (i._hasPreset && (i._presetLoad(e), c = u.presets[i._class][e.preset])) c = c.call(a, i), q(e, c, b)
            };
            i._destroy = function() {
                i && (i.trigger("onDestroy", []), delete x[a.id], i = null)
            };
            i.tap = function(a, b, c) {
                function d(a) {
                    l || (c && a.preventDefault(),
                        l = this, k = t(a, "X"), u = t(a, "Y"), n = !1)
                }

                function f(a) {
                    if (l && !n && 9 < Math.abs(t(a, "X") - k) || 9 < Math.abs(t(a, "Y") - u)) n = !0
                }

                function j(a) {
                    l && (n || (a.preventDefault(), b.call(l, a, i)), l = !1, o.preventClick())
                }

                function g() {
                    l = !1
                }
                var k, u, l, n;
                if (e.tap) a.on("touchstart.mbsc", d).on("touchcancel.mbsc", g).on("touchmove.mbsc", f).on("touchend.mbsc", j);
                a.on("click.mbsc", function(a) {
                    a.preventDefault();
                    b.call(this, a, i)
                })
            };
            i.trigger = function(d, e) {
                var g;
                l.each([k, j, c, b], function(b, c) {
                    c && c[d] && (g = c[d].call(a, e || {}, i))
                });
                return g
            };
            i.option = function(a, b) {
                var c = {};
                "object" === typeof a ? c = a : c[a] = b;
                i.init(c)
            };
            i.getInst = function() {
                return i
            };
            b = b || {};
            l(a).addClass("mbsc-comp");
            a.id || (a.id = "mobiscroll" + ++H);
            x[a.id] = i
        };
        e.addEventListener && l.each(["mouseover", "mousedown", "mouseup", "click"], function(a, b) {
            e.addEventListener(b, g, !0)
        })
    })(window, document);
    s.i18n.hu = {
        setText: "OK",
        cancelText: "M\u00e9gse",
        clearText: "T\u00f6rl\u00e9s",
        selectedText: "{count} kiv\u00e1lasztva",
        dateFormat: "yy.mm.dd.",
        dayNames: "Vas\u00e1rnap,H\u00e9tf\u0151,Kedd,Szerda,Cs\u00fct\u00f6rt\u00f6k,P\u00e9ntek,Szombat".split(","),
        dayNamesShort: "Va,H\u00e9,Ke,Sze,Cs\u00fc,P\u00e9,Szo".split(","),
        dayNamesMin: "V,H,K,Sz,Cs,P,Sz".split(","),
        dayText: "Nap",
        delimiter: ".",
        hourText: "\u00d3ra",
        minuteText: "Perc",
        monthNames: "Janu\u00e1r,Febru\u00e1r,M\u00e1rcius,\u00c1prilis,M\u00e1jus,J\u00fanius,J\u00falius,Augusztus,Szeptember,Okt\u00f3ber,November,December".split(","),
        monthNamesShort: "Jan,Feb,M\u00e1r,\u00c1pr,M\u00e1j,J\u00fan,J\u00fal,Aug,Szep,Okt,Nov,Dec".split(","),
        monthText: "H\u00f3nap",
        secText: "M\u00e1sodperc",
        timeFormat: "H:ii",
        yearText: "\u00c9v",
        nowText: "Most",
        pmText: "de",
        amText: "du",
        firstDay: 1,
        dateText: "D\u00e1tum",
        timeText: "Id\u0151",
        calendarText: "Napt\u00e1r",
        todayText: "Ma",
        prevMonthText: "El\u0151z\u0151 h\u00f3nap",
        nextMonthText: "K\u00f6vetkez\u0151 h\u00f3nap",
        prevYearText: "El\u0151z\u0151 \u00e9v",
        nextYearText: "K\u00f6vetkez\u0151 \u00e9v",
        closeText: "Bez\u00e1r",
        eventText: "esem\u00e9ny",
        eventsText: "esem\u00e9ny",
        fromText: "Eleje",
        toText: "V\u00e9ge",
        wholeText: "Eg\u00e9sz",
        fractionText: "T\u00f6rt",
        unitText: "Egys\u00e9g",
        labels: "\u00c9v,H\u00f3nap,Nap,\u00d3ra,Perc,M\u00e1sodperc,".split(","),
        labelsShort: "\u00c9v,H\u00f3.,Nap,\u00d3ra,Perc,Mp.,".split(","),
        startText: "Ind\u00edt",
        stopText: "Meg\u00e1ll\u00edt",
        resetText: "Vissza\u00e1ll\u00edt",
        lapText: "Lap",
        hideText: "Elrejt",
        backText: "Vissza",
        undoText: "Visszavon",
        offText: "Ki",
        onText: "Be",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.de = {
        setText: "OK",
        cancelText: "Abbrechen",
        clearText: "L\u00f6schen",
        selectedText: "{count} ausgew\u00e4hlt",
        dateFormat: "dd.mm.yy",
        dayNames: "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag".split(","),
        dayNamesShort: "So,Mo,Di,Mi,Do,Fr,Sa".split(","),
        dayNamesMin: "S,M,D,M,D,F,S".split(","),
        dayText: "Tag",
        delimiter: ".",
        hourText: "Stunde",
        minuteText: "Minuten",
        monthNames: "Januar,Februar,M\u00e4rz,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember".split(","),
        monthNamesShort: "Jan,Feb,M\u00e4r,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Dez".split(","),
        monthText: "Monat",
        secText: "Sekunden",
        timeFormat: "HH:ii",
        yearText: "Jahr",
        nowText: "Jetzt",
        pmText: "nachm.",
        amText: "vorm.",
        firstDay: 1,
        dateText: "Datum",
        timeText: "Zeit",
        calendarText: "Kalender",
        closeText: "Schlie\u00dfen",
        fromText: "Von",
        toText: "Um",
        wholeText: "Ganze Zahl",
        fractionText: "Bruchzahl",
        unitText: "Ma\u00dfeinheit",
        labels: "Jahre,Monate,Tage,Stunden,Minuten,Sekunden,".split(","),
        labelsShort: "Jahr.,Mon.,Tag.,Std.,Min.,Sek.,".split(","),
        startText: "Starten",
        stopText: "Stoppen",
        resetText: "Zur\u00fccksetzen",
        lapText: "Lap",
        hideText: "Ausblenden",
        backText: "Zur\u00fcck",
        undoText: "R\u00fcckg\u00e4ngig machen",
        offText: "Aus",
        onText: "Ein",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.es = {
        setText: "Aceptar",
        cancelText: "Cancelar",
        clearText: "Borrar",
        selectedText: "{count} seleccionado",
        selectedPluralText: "{count} seleccionados",
        dateFormat: "dd/mm/yy",
        dayNames: "Domingo,Lunes,Martes,Mi&#xE9;rcoles,Jueves,Viernes,S&#xE1;bado".split(","),
        dayNamesShort: "Do,Lu,Ma,Mi,Ju,Vi,S&#xE1;".split(","),
        dayNamesMin: "D,L,M,M,J,V,S".split(","),
        dayText: "D&#237;a",
        hourText: "Horas",
        minuteText: "Minutos",
        monthNames: "Enero,Febrero,Marzo,Abril,Mayo,Junio,Julio,Agosto,Septiembre,Octubre,Noviembre,Diciembre".split(","),
        monthNamesShort: "Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic".split(","),
        monthText: "Mes",
        secText: "Segundos",
        timeFormat: "HH:ii",
        yearText: "A&ntilde;o",
        nowText: "Ahora",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Fecha",
        timeText: "Tiempo",
        calendarText: "Calendario",
        closeText: "Cerrar",
        fromText: "Iniciar",
        toText: "Final",
        wholeText: "Entero",
        fractionText: "Fracci\u00f3n",
        unitText: "Unidad",
        labels: "A\u00f1os,Meses,D\u00edas,Horas,Minutos,Segundos,".split(","),
        labelsShort: "A\u00f1o,Mes,D\u00eda,Hora,Min,Seg,".split(","),
        startText: "Iniciar",
        stopText: "Det\u00e9ngase",
        resetText: "Reinicializar",
        lapText: "Lap",
        hideText: "Esconder",
        backText: "Volver",
        undoText: "Deshacer",
        offText: "No",
        onText: "S\u00ed",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.fr = {
        setText: "Terminer",
        cancelText: "Annuler",
        clearText: "Effacer",
        selectedText: "{count} s\u00e9lectionn\u00e9",
        selectedPluralText: "{count} s\u00e9lectionn\u00e9s",
        dateFormat: "dd/mm/yy",
        dayNames: "&#68;imanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi".split(","),
        dayNamesShort: "&#68;im.,Lun.,Mar.,Mer.,Jeu.,Ven.,Sam.".split(","),
        dayNamesMin: "&#68;,L,M,M,J,V,S".split(","),
        dayText: "Jour",
        monthText: "Mois",
        monthNames: "Janvier,F\u00e9vrier,Mars,Avril,Mai,Juin,Juillet,Ao\u00fbt,Septembre,Octobre,Novembre,D\u00e9cembre".split(","),
        monthNamesShort: "Janv.,F\u00e9vr.,Mars,Avril,Mai,Juin,Juil.,Ao\u00fbt,Sept.,Oct.,Nov.,D\u00e9c.".split(","),
        hourText: "Heures",
        minuteText: "Minutes",
        secText: "Secondes",
        timeFormat: "HH:ii",
        yearText: "Ann\u00e9e",
        nowText: "Maintenant",
        pmText: "apr\u00e8s-midi",
        amText: "avant-midi",
        firstDay: 1,
        dateText: "Date",
        timeText: "Heure",
        calendarText: "Calendrier",
        closeText: "Fermer",
        fromText: "D\u00e9marrer",
        toText: "Fin",
        wholeText: "Entier",
        fractionText: "Fraction",
        unitText: "Unit\u00e9",
        labels: "Ans,Mois,Jours,Heures,Minutes,Secondes,".split(","),
        labelsShort: "Ans,Mois,Jours,Hrs,Min,Sec,".split(","),
        startText: "D\u00e9marrer",
        stopText: "Arr\u00eater",
        resetText: "R\u00e9initialiser",
        lapText: "Lap",
        hideText: "Cachez",
        backText: "Arri\u00e8re",
        undoText: "D\u00e9faire",
        offText: "Non",
        onText: "Oui",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.it = {
        setText: "OK",
        cancelText: "Annulla",
        clearText: "Chiarire",
        selectedText: "{count} selezionato",
        selectedPluralText: "{count} selezionati",
        dateFormat: "dd/mm/yy",
        dayNames: "Domenica,Luned\u00ec,Merted\u00ec,Mercoled\u00ec,Gioved\u00ec,Venerd\u00ec,Sabato".split(","),
        dayNamesShort: "Do,Lu,Ma,Me,Gi,Ve,Sa".split(","),
        dayNamesMin: "D,L,M,M,G,V,S".split(","),
        dayText: "Giorno",
        hourText: "Ore",
        minuteText: "Minuti",
        monthNames: "Gennaio,Febbraio,Marzo,Aprile,Maggio,Giugno,Luglio,Agosto,Settembre,Ottobre,Novembre,Dicembre".split(","),
        monthNamesShort: "Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dic".split(","),
        monthText: "Mese",
        secText: "Secondi",
        timeFormat: "HH:ii",
        yearText: "Anno",
        nowText: "Ora",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Data",
        timeText: "Volta",
        calendarText: "Calendario",
        closeText: "Chiudere",
        fromText: "Inizio",
        toText: "Fine",
        wholeText: "Intero",
        fractionText: "Frazione",
        unitText: "Unit\u00e0",
        labels: "Anni,Mesi,Giorni,Ore,Minuti,Secondi,".split(","),
        labelsShort: "Anni,Mesi,Gio,Ore,Min,Sec,".split(","),
        startText: "Inizio",
        stopText: "Arresto",
        resetText: "Ripristina",
        lapText: "Lap",
        hideText: "Nascondi",
        backText: "Indietro",
        undoText: "Annulla",
        offText: "Via",
        onText: "Su",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.no = {
        setText: "OK",
        cancelText: "Avbryt",
        clearText: "T\u00f8mme",
        selectedText: "{count} valgt",
        dateFormat: "dd.mm.yy",
        dayNames: "S\u00f8ndag,Mandag,Tirsdag,Onsdag,Torsdag,Fredag,L\u00f8rdag".split(","),
        dayNamesShort: "S\u00f8,Ma,Ti,On,To,Fr,L\u00f8".split(","),
        dayNamesMin: "S,M,T,O,T,F,L".split(","),
        dayText: "Dag",
        delimiter: ".",
        hourText: "Time",
        minuteText: "Minutt",
        monthNames: "Januar,Februar,Mars,April,Mai,Juni,Juli,August,September,Oktober,November,Desember".split(","),
        monthNamesShort: "Jan,Feb,Mar,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Des".split(","),
        monthText: "M\u00e5ned",
        secText: "Sekund",
        timeFormat: "HH:ii",
        yearText: "\u00c5r",
        nowText: "N\u00e5",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Dato",
        timeText: "Tid",
        calendarText: "Kalender",
        closeText: "Lukk",
        fromText: "Start",
        toText: "End",
        wholeText: "Hele",
        fractionText: "Fraksjon",
        unitText: "Enhet",
        labels: "\u00c5r,M\u00e5neder,Dager,Timer,Minutter,Sekunder,".split(","),
        labelsShort: "\u00c5r,M\u00e5n,Dag,Time,Min,Sek,".split(","),
        startText: "Start",
        stopText: "Stopp",
        resetText: "Tilbakestille",
        lapText: "Runde",
        hideText: "Skjul",
        backText: "Tilbake",
        undoText: "Angre",
        offText: "Av",
        onText: "P\u00e5",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n["pt-BR"] = {
        setText: "Selecionar",
        cancelText: "Cancelar",
        clearText: "Claro",
        selectedText: "{count} selecionado",
        selectedPluralText: "{count} selecionados",
        dateFormat: "dd/mm/yy",
        dayNames: "Domingo,Segunda-feira,Ter\u00e7a-feira,Quarta-feira,Quinta-feira,Sexta-feira,S\u00e1bado".split(","),
        dayNamesShort: "Dom,Seg,Ter,Qua,Qui,Sex,S\u00e1b".split(","),
        dayNamesMin: "D,S,T,Q,Q,S,S".split(","),
        dayText: "Dia",
        hourText: "Hora",
        minuteText: "Minutos",
        monthNames: "Janeiro,Fevereiro,Mar\u00e7o,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro".split(","),
        monthNamesShort: "Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez".split(","),
        monthText: "M\u00eas",
        secText: "Segundo",
        timeFormat: "HH:ii",
        yearText: "Ano",
        nowText: "Agora",
        pmText: "da tarde",
        amText: "da manh\u00e3",
        dateText: "Data",
        timeText: "Tempo",
        calendarText: "Calend\u00e1rio",
        closeText: "Fechar",
        fromText: "In&iacute;cio",
        toText: "Fim",
        wholeText: "Inteiro",
        fractionText: "Fra\u00e7\u00e3o",
        unitText: "Unidade",
        labels: "Anos,Meses,Dias,Horas,Minutos,Segundos,".split(","),
        labelsShort: "Ano,M&ecirc;s,Dia,Hora,Min,Seg,".split(","),
        startText: "Come\u00e7ar",
        stopText: "Pare",
        resetText: "Reinicializar",
        lapText: "Lap",
        hideText: "Esconder",
        backText: "De volta",
        undoText: "Desfazer",
        offText: "Desl",
        onText: "Lig",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.zh = {
        setText: "\u786e\u5b9a",
        cancelText: "\u53d6\u6d88",
        clearText: "\u660e\u786e",
        selectedText: "{count} \u9009",
        dateFormat: "yy/mm/dd",
        dayNames: "\u5468\u65e5,\u5468\u4e00,\u5468\u4e8c,\u5468\u4e09,\u5468\u56db,\u5468\u4e94,\u5468\u516d".split(","),
        dayNamesShort: "\u65e5,\u4e00,\u4e8c,\u4e09,\u56db,\u4e94,\u516d".split(","),
        dayNamesMin: "\u65e5,\u4e00,\u4e8c,\u4e09,\u56db,\u4e94,\u516d".split(","),
        dayText: "\u65e5",
        hourText: "\u65f6",
        minuteText: "\u5206",
        monthNames: "1\u6708,2\u6708,3\u6708,4\u6708,5\u6708,6\u6708,7\u6708,8\u6708,9\u6708,10\u6708,11\u6708,12\u6708".split(","),
        monthNamesShort: "\u4e00,\u4e8c,\u4e09,\u56db,\u4e94,\u516d,\u4e03,\u516b,\u4e5d,\u5341,\u5341\u4e00,\u5341\u4e8c".split(","),
        monthText: "\u6708",
        secText: "\u79d2",
        timeFormat: "HH:ii",
        yearText: "\u5e74",
        nowText: "\u5f53\u524d",
        pmText: "\u4e0b\u5348",
        amText: "\u4e0a\u5348",
        dateText: "\u65e5",
        timeText: "\u65f6\u95f4",
        calendarText: "\u65e5\u5386",
        closeText: "\u5173\u95ed",
        fromText: "\u5f00\u59cb\u65f6\u95f4",
        toText: "\u7ed3\u675f\u65f6\u95f4",
        wholeText: "\u5408\u8ba1",
        fractionText: "\u5206\u6570",
        unitText: "\u5355\u4f4d",
        labels: "\u5e74,\u6708,\u65e5,\u5c0f\u65f6,\u5206\u949f,\u79d2,".split(","),
        labelsShort: "\u5e74,\u6708,\u65e5,\u70b9,\u5206,\u79d2,".split(","),
        startText: "\u5f00\u59cb",
        stopText: "\u505c\u6b62",
        resetText: "\u91cd\u7f6e",
        lapText: "\u5708",
        hideText: "\u9690\u85cf",
        backText: "\u80cc\u90e8",
        undoText: "\u590d\u539f",
        offText: "\u5173\u95ed",
        onText: "\u5f00\u542f",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.nl = {
        setText: "Instellen",
        cancelText: "Annuleren",
        clearText: "Duidelijk",
        selectedText: "{count} gekozen",
        dateFormat: "dd-mm-yy",
        dayNames: "zondag,maandag,Dinsdag,Woensdag,Donderdag,Vrijdag,Zaterdag".split(","),
        dayNamesShort: "zo,ma,di,wo,do,vr,za".split(","),
        dayNamesMin: "z,m,d,w,d,v,z".split(","),
        dayText: "Dag",
        hourText: "Uur",
        minuteText: "Minuten",
        monthNames: "januari,februari,maart,april,mei,juni,juli,augustus,september,oktober,november,december".split(","),
        monthNamesShort: "jan,feb,mrt,apr,mei,jun,jul,aug,sep,okt,nov,dec".split(","),
        monthText: "Maand",
        secText: "Seconden",
        timeFormat: "HH:ii",
        yearText: "Jaar",
        nowText: "Nu",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Datum",
        timeText: "Tijd",
        calendarText: "Kalender",
        closeText: "Sluiten",
        fromText: "Start",
        toText: "Einde",
        wholeText: "geheel",
        fractionText: "fractie",
        unitText: "eenheid",
        labels: "Jaren,Maanden,Dagen,Uren,Minuten,Seconden,".split(","),
        labelsShort: "j,m,d,u,min,sec,".split(","),
        startText: "Start",
        stopText: "Stop",
        resetText: "Reset",
        lapText: "Ronde",
        hideText: "Verbergen",
        backText: "Terug",
        undoText: "Onged. maken",
        offText: "Uit",
        onText: "Aan",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.tr = {
        setText: "Se\u00e7",
        cancelText: "\u0130ptal",
        clearText: "Temizleyin",
        selectedText: "{count} se\u00e7ilmi\u015f",
        dateFormat: "dd.mm.yy",
        dayNames: "Pazar,Pazartesi,Sal\u0131,\u00c7ar\u015famba,Per\u015fembe,Cuma,Cumartesi".split(","),
        dayNamesShort: "Paz,Pzt,Sal,\u00c7ar,Per,Cum,Cmt".split(","),
        dayNamesMin: "P,P,S,\u00c7,P,C,C".split(","),
        dayText: "G\u00fcn",
        delimiter: ".",
        hourText: "Saat",
        minuteText: "Dakika",
        monthNames: "Ocak,\u015eubat,Mart,Nisan,May\u0131s,Haziran,Temmuz,A\u011fustos,Eyl\u00fcl,Ekim,Kas\u0131m,Aral\u0131k".split(","),
        monthNamesShort: "Oca,\u015eub,Mar,Nis,May,Haz,Tem,A\u011fu,Eyl,Eki,Kas,Ara".split(","),
        monthText: "Ay",
        secText: "Saniye",
        timeFormat: "HH:ii",
        yearText: "Y\u0131l",
        nowText: "\u015eimdi",
        pmText: "ak\u015fam",
        amText: "sabah",
        firstDay: 1,
        dateText: "Tarih",
        timeText: "Zaman",
        calendarText: "Takvim",
        closeText: "Kapatmak",
        fromText: "Ba\u015fla",
        toText: "Son",
        wholeText: "Tam",
        fractionText: "Kesir",
        unitText: "Birim",
        labels: "Y\u0131l,Ay,G\u00fcn,Saat,Dakika,Saniye,".split(","),
        labelsShort: "Y\u0131l,Ay,G\u00fcn,Sa,Dak,Sn,".split(","),
        startText: "Ba\u015fla",
        stopText: "Durdur",
        resetText: "S\u0131f\u0131rla",
        lapText: "Tur",
        hideText: "Gizle",
        backText: "Geri",
        undoText: "Geri Al",
        offText: "O",
        onText: "I",
        decimalSeparator: ",",
        thousandsSeparator: "."
    };
    s.i18n.ja = {
        setText: "\u30bb\u30c3\u30c8",
        cancelText: "\u30ad\u30e3\u30f3\u30bb\u30eb",
        clearText: "\u30af\u30ea\u30a2",
        selectedText: "{count} \u9078\u629e",
        dateFormat: "yy\u5e74mm\u6708dd\u65e5",
        dayNames: "\u65e5,\u6708,\u706b,\u6c34,\u6728,\u91d1,\u571f".split(","),
        dayNamesShort: "\u65e5,\u6708,\u706b,\u6c34,\u6728,\u91d1,\u571f".split(","),
        dayNamesMin: "\u65e5,\u6708,\u706b,\u6c34,\u6728,\u91d1,\u571f".split(","),
        dayText: "\u65e5",
        hourText: "\u6642",
        minuteText: "\u5206",
        monthNames: "1\u6708,2\u6708,3\u6708,4\u6708,5\u6708,6\u6708,7\u6708,8\u6708,9\u6708,10\u6708,11\u6708,12\u6708".split(","),
        monthNamesShort: "1\u6708,2\u6708,3\u6708,4\u6708,5\u6708,6\u6708,7\u6708,8\u6708,9\u6708,10\u6708,11\u6708,12\u6708".split(","),
        monthText: "\u6708",
        secText: "\u79d2",
        timeFormat: "HH:ii",
        yearText: "\u5e74",
        nowText: "\u4eca",
        pmText: "\u5348\u5f8c",
        amText: "\u5348\u524d",
        yearSuffix: "\u5e74",
        monthSuffix: "\u6708",
        daySuffix: "\u65e5",
        dateText: "\u65e5\u4ed8",
        timeText: "\u6642\u9593",
        calendarText: "\u30ab\u30ec\u30f3\u30c0\u30fc",
        closeText: "\u30af\u30ed\u30fc\u30ba",
        fromText: "\u958b\u59cb",
        toText: "\u7d42\u308f\u308a",
        wholeText: "\u5168\u6570",
        fractionText: "\u5206\u6570",
        unitText: "\u5358\u4f4d",
        labels: "\u5e74\u9593,\u6708\u9593,\u65e5\u9593,\u6642\u9593,\u5206,\u79d2,".split(","),
        labelsShort: "\u5e74\u9593,\u6708\u9593,\u65e5\u9593,\u6642\u9593,\u5206,\u79d2,".split(","),
        startText: "\u958b\u59cb",
        stopText: "\u505c\u6b62",
        resetText: "\u30ea\u30bb\u30c3\u30c8",
        lapText: "\u30e9\u30c3\u30d7",
        hideText: "\u96a0\u3059",
        backText: "\u30d0\u30c3\u30af",
        undoText: "\u30a2\u30f3\u30c9\u30a5"
    };
    s.i18n["pt-PT"] = {
        setText: "Seleccionar",
        cancelText: "Cancelar",
        clearText: "Claro",
        selectedText: "{count} selecionado",
        selectedPluralText: "{count} selecionados",
        dateFormat: "dd-mm-yy",
        dayNames: "Domingo,Segunda-feira,Ter\u00e7a-feira,Quarta-feira,Quinta-feira,Sexta-feira,S&aacute;bado".split(","),
        dayNamesShort: "Dom,Seg,Ter,Qua,Qui,Sex,S&aacute;b".split(","),
        dayNamesMin: "D,S,T,Q,Q,S,S".split(","),
        dayText: "Dia",
        hourText: "Horas",
        minuteText: "Minutos",
        monthNames: "Janeiro,Fevereiro,Mar&ccedil;o,Abril,Maio,Junho,Julho,Agosto,Setembro,Outubro,Novembro,Dezembro".split(","),
        monthNamesShort: "Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez".split(","),
        monthText: "M&ecirc;s",
        secText: "Segundo",
        timeFormat: "HH:ii",
        yearText: "Ano",
        nowText: "Actualizar",
        pmText: "da tarde",
        amText: "da manh\u00e3",
        firstDay: 1,
        dateText: "Data",
        timeText: "Tempo",
        calendarText: "Calend&aacute;rio",
        closeText: "Fechar",
        fromText: "In&iacute;cio",
        toText: "Fim",
        wholeText: "Inteiro",
        fractionText: "Frac&ccedil;&atilde;o",
        unitText: "Unidade",
        labels: "Anos,Meses,Dias,Horas,Minutos,Segundos,".split(","),
        labelsShort: "Ano,M&ecirc;s,Dia,Hora,Min,Seg,".split(","),
        startText: "Come&ccedil;ar",
        stopText: "Parar",
        resetText: "Reinicializar",
        lapText: "Lap",
        hideText: "Esconder",
        backText: "De volta",
        undoText: "Anular",
        offText: "Desl",
        onText: "Lig",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.sv = {
        setText: "OK",
        cancelText: "Avbryt",
        clearText: "Klara",
        selectedText: "{count} vald",
        dateFormat: "yy-mm-dd",
        dayNames: "S\u00f6ndag,M\u00e5ndag,Tisdag,Onsdag,Torsdag,Fredag,L\u00f6rdag".split(","),
        dayNamesShort: "S\u00f6,M\u00e5,Ti,On,To,Fr,L\u00f6".split(","),
        dayNamesMin: "S,M,T,O,T,F,L".split(","),
        dayText: "Dag",
        hourText: "Timme",
        minuteText: "Minut",
        monthNames: "Januari,Februari,Mars,April,Maj,Juni,Juli,Augusti,September,Oktober,November,December".split(","),
        monthNamesShort: "Jan,Feb,Mar,Apr,Maj,Jun,Jul,Aug,Sep,Okt,Nov,Dec".split(","),
        monthText: "M\u00e5nad",
        secText: "Sekund",
        timeFormat: "HH:ii",
        yearText: "\u00c5r",
        nowText: "Nu",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Datum",
        timeText: "Tid",
        calendarText: "Kalender",
        closeText: "St\u00e4ng",
        fromText: "Start",
        toText: "Slut",
        wholeText: "Hela",
        fractionText: "Br\u00e5k",
        unitText: "Enhet",
        labels: "\u00c5r,M\u00e5nader,Dagar,Timmar,Minuter,Sekunder,".split(","),
        labelsShort: "\u00c5r,M\u00e5n,Dag,Tim,Min,Sek,".split(","),
        startText: "Start",
        stopText: "Stopp",
        resetText: "\u00c5terst\u00e4ll",
        lapText: "Varv",
        hideText: "D\u00f6lj",
        backText: "Tillbaka",
        undoText: "\u00c5ngra",
        offText: "Av",
        onText: "P\u00e5"
    };
    s.i18n["en-GB"] = s.i18n["en-UK"] = {
        dateFormat: "dd/mm/yy",
        timeFormat: "HH:ii"
    };
    s.i18n.cs = {
        setText: "Zadej",
        cancelText: "Storno",
        clearText: "Vymazat",
        selectedText: "Ozna\u010den\u00fd: {count}",
        dateFormat: "dd.mm.yy",
        dayNames: "Ned\u011ble,Pond\u011bl\u00ed,\u00dater\u00fd,St\u0159eda,\u010ctvrtek,P\u00e1tek,Sobota".split(","),
        dayNamesShort: "Ne,Po,\u00dat,St,\u010ct,P\u00e1,So".split(","),
        dayNamesMin: "N,P,\u00da,S,\u010c,P,S".split(","),
        dayText: "Den",
        hourText: "Hodiny",
        minuteText: "Minuty",
        monthNames: "Leden,\u00danor,B\u0159ezen,Duben,Kv\u011bten,\u010cerven,\u010cervenec,Srpen,Z\u00e1\u0159\u00ed,\u0158\u00edjen,Listopad,Prosinec".split(","),
        monthNamesShort: "Led,\u00dano,B\u0159e,Dub,Kv\u011b,\u010cer,\u010cvc,Spr,Z\u00e1\u0159,\u0158\u00edj,Lis,Pro".split(","),
        monthText: "M\u011bs\u00edc",
        secText: "Sekundy",
        timeFormat: "HH:ii",
        yearText: "Rok",
        nowText: "Te\u010f",
        amText: "am",
        pmText: "pm",
        firstDay: 1,
        dateText: "Datum",
        timeText: "\u010cas",
        calendarText: "Kalend\u00e1\u0159",
        closeText: "Zav\u0159\u00edt",
        fromText: "Za\u010d\u00e1tek",
        toText: "Konec",
        wholeText: "Cel\u00fd",
        fractionText: "\u010c\u00e1st",
        unitText: "Jednotka",
        labels: "Roky,M\u011bs\u00edce,Dny,Hodiny,Minuty,Sekundy,".split(","),
        labelsShort: "Rok,M\u011bs,Dny,Hod,Min,Sec,".split(","),
        startText: "Start",
        stopText: "Stop",
        resetText: "Resetovat",
        lapText: "Etapa",
        hideText: "Schovat",
        backText: "Zp\u011bt",
        undoText: "Rozlepit",
        offText: "O",
        onText: "I",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.sk = {
        setText: "Zadaj",
        cancelText: "Zru\u0161i\u0165",
        clearText: "Vymaza\u0165",
        selectedText: "Ozna\u010den\u00fd: {count}",
        dateFormat: "d.m.yy",
        dayNames: "Nede\u013ea,Pondelok,Utorok,Streda,\u0160tvrtok,Piatok,Sobota".split(","),
        dayNamesShort: "Ne,Po,Ut,St,\u0160t,Pi,So".split(","),
        dayNamesMin: "N,P,U,S,\u0160,P,S".split(","),
        dayText: "\u010ee\u0148",
        hourText: "Hodiny",
        minuteText: "Min\u00faty",
        monthNames: "Janu\u00e1r,Febru\u00e1r,Marec,Apr\u00edl,M\u00e1j,J\u00fan,J\u00fal,August,September,Okt\u00f3ber,November,December".split(","),
        monthNamesShort: "Jan,Feb,Mar,Apr,M\u00e1j,J\u00fan,J\u00fal,Aug,Sep,Okt,Nov,Dec".split(","),
        monthText: "Mesiac",
        secText: "Sekundy",
        timeFormat: "H:ii",
        yearText: "Rok",
        nowText: "Teraz",
        amText: "am",
        pmText: "pm",
        firstDay: 1,
        dateText: "Datum",
        timeText: "\u010cas",
        calendarText: "Kalend\u00e1r",
        closeText: "Zavrie\u0165",
        fromText: "Za\u010diatok",
        toText: "Koniec",
        wholeText: "Cel\u00fd",
        fractionText: "\u010cas\u0165",
        unitText: "Jednotka",
        labels: "Roky,Mesiace,Dni,Hodiny,Min\u00faty,Sekundy,".split(","),
        labelsShort: "Rok,Mes,Dni,Hod,Min,Sec,".split(","),
        startText: "Start",
        stopText: "Stop",
        resetText: "Resetova\u0165",
        lapText: "Etapa",
        hideText: "Schova\u0165",
        backText: "Sp\u00e4\u0165",
        undoText: "Sp\u00e4\u0165",
        offText: "O",
        onText: "I",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.ro = {
        setText: "Setare",
        cancelText: "Anulare",
        clearText: "\u015etergere",
        selectedText: "{count} selectat",
        selectedPluralText: "{count} selectate",
        dateFormat: "dd.mm.yy",
        dayNames: "Duminic\u0103,Luni,Mar\u021bi,Miercuri,Joi,Vineri,S\u00e2mb\u0103t\u0103".split(","),
        dayNamesShort: "Du,Lu,Ma,Mi,Jo,Vi,S\u00e2".split(","),
        dayNamesMin: "D,L,M,M,J,V,S".split(","),
        dayText: " Ziua",
        delimiter: ".",
        hourText: " Ore ",
        minuteText: "Minute",
        monthNames: "Ianuarie,Februarie,Martie,Aprilie,Mai,Iunie,Iulie,August,Septembrie,Octombrie,Noiembrie,Decembrie".split(","),
        monthNamesShort: "Ian.,Feb.,Mar.,Apr.,Mai,Iun.,Iul.,Aug.,Sept.,Oct.,Nov.,Dec.".split(","),
        monthText: "Luna",
        secText: "Secunde",
        timeFormat: "HH:ii",
        yearText: "Anul",
        nowText: "Acum",
        amText: "am",
        pmText: "pm",
        firstDay: 1,
        dateText: "Data",
        timeText: "Ora",
        calendarText: "Calendar",
        closeText: "\u00cenchidere",
        fromText: "Start",
        toText: "Final",
        wholeText: "Complet",
        fractionText: "Par\u0163ial",
        unitText: "Unitate",
        labels: "Ani,Luni,Zile,Ore,Minute,Secunde,".split(","),
        labelsShort: "Ani,Luni,Zile,Ore,Min.,Sec.,".split(","),
        startText: "Start",
        stopText: "Stop",
        resetText: "Resetare",
        lapText: "Tur\u0103",
        hideText: "Ascundere",
        backText: "\u00cenapoi",
        undoText: "Anula\u0163i",
        offText: "Nu",
        onText: "Da",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.pl = {
        setText: "Zestaw",
        cancelText: "Anuluj",
        clearText: "Oczy\u015bci\u0107",
        selectedText: "Wyb\u00f3r: {count}",
        dateFormat: "yy-mm-dd",
        dayNames: "Niedziela,Poniedzia\u0142ek,Wtorek,\u015aroda,Czwartek,Pi\u0105tek,Sobota".split(","),
        dayNamesShort: "Niedz.,Pon.,Wt.,\u015ar.,Czw.,Pt.,Sob.".split(","),
        dayNamesMin: "N,P,W,\u015a,C,P,S".split(","),
        dayText: "Dzie\u0144",
        hourText: "Godziny",
        minuteText: "Minuty",
        monthNames: "Stycze\u0144,Luty,Marzec,Kwiecie\u0144,Maj,Czerwiec,Lipiec,Sierpie\u0144,Wrzesie\u0144,Pa\u017adziernik,Listopad,Grudzie\u0144".split(","),
        monthNamesShort: "Sty,Lut,Mar,Kwi,Maj,Cze,Lip,Sie,Wrz,Pa\u017a,Lis,Gru".split(","),
        monthText: "Miesi\u0105c",
        secText: "Sekundy",
        timeFormat: "HH:ii",
        yearText: "Rok",
        nowText: "Teraz",
        amText: "rano",
        pmText: "po po\u0142udniu",
        firstDay: 1,
        dateText: "Data",
        timeText: "Czas",
        calendarText: "Kalendarz",
        closeText: "Zako\u0144czenie",
        fromText: "Rozpocz\u0119cie",
        toText: "Koniec",
        wholeText: "Ca\u0142y",
        fractionText: "U\u0142amek",
        unitText: "Jednostka",
        labels: "Lata,Miesi\u0105c,Dni,Godziny,Minuty,Sekundy,".split(","),
        labelsShort: "R,M,Dz,Godz,Min,Sek,".split(","),
        startText: "Rozpocz\u0119cie",
        stopText: "Zatrzyma\u0107",
        resetText: "Zresetowa\u0107",
        lapText: "Zak\u0142adka",
        hideText: "Ukry\u0107",
        backText: "Z powrotem",
        undoText: "Cofnij",
        offText: "Wy\u0142",
        onText: "W\u0142",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n["ru-UA"] = {
        setText: "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c",
        cancelText: "\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c",
        clearText: "\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044cr",
        selectedText: "{count} \u0412\u0456\u0431\u0440\u0430\u0442\u044c",
        dateFormat: "dd.mm.yy",
        dayNames: "\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435,\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a,\u0432\u0442\u043e\u0440\u043d\u0438\u043a,\u0441\u0440\u0435\u0434\u0430,\u0447\u0435\u0442\u0432\u0435\u0440\u0433,\u043f\u044f\u0442\u043d\u0438\u0446\u0430,\u0441\u0443\u0431\u0431\u043e\u0442\u0430".split(","),
        dayNamesShort: "\u0432\u0441,\u043f\u043d,\u0432\u0442,\u0441\u0440,\u0447\u0442,\u043f\u0442,\u0441\u0431".split(","),
        dayNamesMin: "\u0432,\u043f,\u0432,\u0441,\u0447,\u043f,\u0441".split(","),
        dayText: "\u0414\u0435\u043d\u044c",
        delimiter: ".",
        hourText: "\u0427\u0430\u0441\u044b",
        minuteText: "\u041c\u0438\u043d\u0443\u0442\u044b",
        monthNames: "\u042f\u043d\u0432\u0430\u0440\u044c,\u0424\u0435\u0432\u0440\u0430\u043b\u044c,\u041c\u0430\u0440\u0442,\u0410\u043f\u0440\u0435\u043b\u044c,\u041c\u0430\u0439,\u0418\u044e\u043d\u044c,\u0418\u044e\u043b\u044c,\u0410\u0432\u0433\u0443\u0441\u0442,\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c,\u041e\u043a\u0442\u044f\u0431\u0440\u044c,\u041d\u043e\u044f\u0431\u0440\u044c,\u0414\u0435\u043a\u0430\u0431\u0440\u044c".split(","),
        monthNamesShort: "\u042f\u043d\u0432.,\u0424\u0435\u0432\u0440.,\u041c\u0430\u0440\u0442,\u0410\u043f\u0440.,\u041c\u0430\u0439,\u0418\u044e\u043d\u044c,\u0418\u044e\u043b\u044c,\u0410\u0432\u0433.,\u0421\u0435\u043d\u0442.,\u041e\u043a\u0442.,\u041d\u043e\u044f\u0431.,\u0414\u0435\u043a.".split(","),
        monthText: "\u041c\u0435\u0441\u044f\u0446\u044b",
        secText: "\u0421\u0438\u043a\u0443\u043d\u0434\u044b",
        timeFormat: "HH:ii",
        yearText: "\u0413\u043e\u0434",
        nowText: "\u0421\u0435\u0439\u0447\u0430\u0441",
        amText: "\u0414\u043e \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
        pmText: "\u041f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
        firstDay: 1,
        dateText: "\u0414\u0430\u0442\u0430",
        timeText: "\u0412\u0440\u0435\u043c\u044f",
        calendarText: "\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c",
        closeText: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
        fromText: "\u041d\u0430\u0447\u0430\u043b\u043e",
        toText: "\u041a\u043e\u043d\u0435\u0446",
        wholeText: "\u0412\u0435\u0441\u044c",
        fractionText: "\u0427\u0430\u0441\u0442\u044c",
        unitText: "\u0415\u0434\u0438\u043d\u0438\u0446\u0430",
        labels: "\u0413\u043e\u0434\u044b, \u041c\u0435\u0441\u044f\u0446\u044b , \u0414\u043d\u0438 , \u0427\u0430\u0441\u044b , \u041c\u0438\u043d\u0443\u0442\u044b , \u0421\u0435\u043a\u0443\u043d\u0434\u044b,".split(","),
        labelsShort: "\u0413\u043e\u0434,\u041c\u0435\u0441.,\u0414\u043d.,\u0427.,\u041c\u0438\u043d.,\u0421\u0435\u043a.,".split(","),
        startText: "\u0421\u0442\u0430\u0440\u0442",
        stopText: "\u0421\u0442\u043e\u043f",
        resetText: " \u0421\u0431\u0440\u043e\u0441 ",
        lapText: " \u042d\u0442\u0430\u043f ",
        hideText: " \u0421\u043a\u0440\u044b\u0442\u044c ",
        backText: "\u043d\u0430\u0437\u0430\u0434",
        undoText: "\u0430\u043d\u043d\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
        offText: "O",
        onText: "I",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    (function() {
        var h = {
            gDaysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
            jDaysInMonth: [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29],
            jalaliToGregorian: function(e, b, k) {
                for (var e = parseInt(e), b = parseInt(b), k = parseInt(k), e = e - 979, b = b - 1, a = k - 1, e = 365 * e + 8 * parseInt(e / 33) + parseInt((e %
                        33 + 3) / 4), k = 0; k < b; ++k) e += h.jDaysInMonth[k];
                b = e + a + 79;
                e = 1600 + 400 * parseInt(b / 146097);
                b %= 146097;
                a = !0;
                36525 <= b && (b--, e += 100 * parseInt(b / 36524), b %= 36524, 365 <= b ? b++ : a = !1);
                e += 4 * parseInt(b / 1461);
                b %= 1461;
                366 <= b && (a = !1, b--, e += parseInt(b / 365), b %= 365);
                for (k = 0; b >= h.gDaysInMonth[k] + (1 == k && a); k++) b -= h.gDaysInMonth[k] + (1 == k && a);
                return [e, k + 1, b + 1]
            },
            checkDate: function(e, b, k) {
                return !(0 > e || 32767 < e || 1 > b || 12 < b || 1 > k || k > h.jDaysInMonth[b - 1] + (12 == b && 0 === (e - 979) % 33 % 4))
            },
            gregorianToJalali: function(e, b, k) {
                for (var e = parseInt(e), b =
                        parseInt(b), k = parseInt(k), e = e - 1600, b = b - 1, a = k - 1, g = 365 * e + parseInt((e + 3) / 4) - parseInt((e + 99) / 100) + parseInt((e + 399) / 400), k = 0; k < b; ++k) g += h.gDaysInMonth[k];
                1 < b && (0 === e % 4 && 0 !== e % 100 || 0 === e % 400) && ++g;
                e = g + a - 79;
                k = parseInt(e / 12053);
                e %= 12053;
                b = 979 + 33 * k + 4 * parseInt(e / 1461);
                e %= 1461;
                366 <= e && (b += parseInt((e - 1) / 365), e = (e - 1) % 365);
                for (k = 0; 11 > k && e >= h.jDaysInMonth[k]; ++k) e -= h.jDaysInMonth[k];
                return [b, k + 1, e + 1]
            }
        };
        s.i18n.fa = {
            setText: "\u062a\u0627\u064a\u064a\u062f",
            cancelText: "\u0627\u0646\u0635\u0631\u0627\u0641",
            clearText: "\u0648\u0627\u0636\u062d ",
            selectedText: "{count} \u0645\u0646\u062a\u062e\u0628",
            dateFormat: "yy/mm/dd",
            dayNames: "\u064a\u06a9\u0634\u0646\u0628\u0647,\u062f\u0648\u0634\u0646\u0628\u0647,\u0633\u0647\u200c\u0634\u0646\u0628\u0647,\u0686\u0647\u0627\u0631\u0634\u0646\u0628\u0647,\u067e\u0646\u062c\u200c\u0634\u0646\u0628\u0647,\u062c\u0645\u0639\u0647,\u0634\u0646\u0628\u0647".split(","),
            dayNamesShort: "\u06cc,\u062f,\u0633,\u0686,\u067e,\u062c,\u0634".split(","),
            dayNamesMin: "\u06cc,\u062f,\u0633,\u0686,\u067e,\u062c,\u0634".split(","),
            dayText: "\u0631\u0648\u0632",
            hourText: "\u0633\u0627\u0639\u062a",
            minuteText: "\u062f\u0642\u064a\u0642\u0647",
            monthNames: "\u0641\u0631\u0648\u0631\u062f\u064a\u0646,\u0627\u0631\u062f\u064a\u0628\u0647\u0634\u062a,\u062e\u0631\u062f\u0627\u062f,\u062a\u064a\u0631,\u0645\u0631\u062f\u0627\u062f,\u0634\u0647\u0631\u064a\u0648\u0631,\u0645\u0647\u0631,\u0622\u0628\u0627\u0646,\u0622\u0630\u0631,\u062f\u06cc,\u0628\u0647\u0645\u0646,\u0627\u0633\u0641\u0646\u062f".split(","),
            monthNamesShort: "\u0641\u0631\u0648\u0631\u062f\u064a\u0646,\u0627\u0631\u062f\u064a\u0628\u0647\u0634\u062a,\u062e\u0631\u062f\u0627\u062f,\u062a\u064a\u0631,\u0645\u0631\u062f\u0627\u062f,\u0634\u0647\u0631\u064a\u0648\u0631,\u0645\u0647\u0631,\u0622\u0628\u0627\u0646,\u0622\u0630\u0631,\u062f\u06cc,\u0628\u0647\u0645\u0646,\u0627\u0633\u0641\u0646\u062f".split(","),
            monthText: "\u0645\u0627\u0647",
            secText: "\u062b\u0627\u0646\u064a\u0647",
            timeFormat: "HH:ii",
            yearText: "\u0633\u0627\u0644",
            nowText: "\u0627\u06a9\u0646\u0648\u0646",
            amText: "\u0628",
            pmText: "\u0635",
            getYear: function(e) {
                return h.gregorianToJalali(e.getFullYear(), e.getMonth() + 1, e.getDate())[0]
            },
            getMonth: function(e) {
                return --h.gregorianToJalali(e.getFullYear(), e.getMonth() + 1, e.getDate())[1]
            },
            getDay: function(e) {
                return h.gregorianToJalali(e.getFullYear(), e.getMonth() + 1, e.getDate())[2]
            },
            getDate: function(e, b,
                k, a, g, d, l) {
                0 > b && (e += Math.floor(b / 12), b = 12 + b % 12);
                11 < b && (e += Math.floor(b / 12), b %= 12);
                e = h.jalaliToGregorian(e, +b + 1, k);
                return new Date(e[0], e[1] - 1, e[2], a || 0, g || 0, d || 0, l || 0)
            },
            getMaxDayOfMonth: function(e, b) {
                for (var k = 31; !1 === h.checkDate(e, b + 1, k);) k--;
                return k
            },
            firstDay: 6,
            rtl: !0,
            dateText: "\u062a\u0627\u0631\u06cc\u062e ",
            timeText: "\u0632\u0645\u0627\u0646 ",
            calendarText: "\u062a\u0642\u0648\u06cc\u0645",
            closeText: "\u0646\u0632\u062f\u06cc\u06a9",
            fromText: "\u0634\u0631\u0648\u0639 ",
            toText: "\u067e\u0627\u06cc\u0627\u0646",
            wholeText: "\u062a\u0645\u0627\u0645",
            fractionText: "\u06a9\u0633\u0631",
            unitText: "\u0648\u0627\u062d\u062f",
            labels: "\u0633\u0627\u0644,\u0645\u0627\u0647,\u0631\u0648\u0632,\u0633\u0627\u0639\u062a,\u062f\u0642\u06cc\u0642\u0647,\u062b\u0627\u0646\u06cc\u0647,".split(","),
            labelsShort: "\u0633\u0627\u0644,\u0645\u0627\u0647,\u0631\u0648\u0632,\u0633\u0627\u0639\u062a,\u062f\u0642\u06cc\u0642\u0647,\u062b\u0627\u0646\u06cc\u0647,".split(","),
            startText: "\u0634\u0631\u0648\u0639",
            stopText: "\u067e\u0627\u064a\u0627\u0646",
            resetText: "\u062a\u0646\u0638\u06cc\u0645 \u0645\u062c\u062f\u062f",
            lapText: "Lap",
            hideText: "\u067e\u0646\u0647\u0627\u0646 \u06a9\u0631\u062f\u0646",
            backText: "\u067e\u0634\u062a",
            undoText: "\u0648\u0627\u0686\u06cc\u062f\u0646"
        }
    })();
    s.i18n["ru-RU"] = s.i18n.ru = {
        setText: "\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u044c",
        cancelText: "\u041e\u0442\u043c\u0435\u043d\u0430",
        clearText: "\u041e\u0447\u0438\u0441\u0442\u0438\u0442\u044c",
        selectedText: "{count} \u0412\u044b\u0431\u0440\u0430\u0442\u044c",
        dateFormat: "dd.mm.yy",
        dayNames: "\u0432\u043e\u0441\u043a\u0440\u0435\u0441\u0435\u043d\u044c\u0435,\u043f\u043e\u043d\u0435\u0434\u0435\u043b\u044c\u043d\u0438\u043a,\u0432\u0442\u043e\u0440\u043d\u0438\u043a,\u0441\u0440\u0435\u0434\u0430,\u0447\u0435\u0442\u0432\u0435\u0440\u0433,\u043f\u044f\u0442\u043d\u0438\u0446\u0430,\u0441\u0443\u0431\u0431\u043e\u0442\u0430".split(","),
        dayNamesShort: "\u0432\u0441,\u043f\u043d,\u0432\u0442,\u0441\u0440,\u0447\u0442,\u043f\u0442,\u0441\u0431".split(","),
        dayNamesMin: "\u0432,\u043f,\u0432,\u0441,\u0447,\u043f,\u0441".split(","),
        dayText: "\u0414\u0435\u043d\u044c",
        delimiter: ".",
        hourText: "\u0427\u0430\u0441",
        minuteText: "\u041c\u0438\u043d\u0443\u0442",
        monthNames: "\u042f\u043d\u0432\u0430\u0440\u044c,\u0424\u0435\u0432\u0440\u0430\u043b\u044c,\u041c\u0430\u0440\u0442,\u0410\u043f\u0440\u0435\u043b\u044c,\u041c\u0430\u0439,\u0418\u044e\u043d\u044c,\u0418\u044e\u043b\u044c,\u0410\u0432\u0433\u0443\u0441\u0442,\u0421\u0435\u043d\u0442\u044f\u0431\u0440\u044c,\u041e\u043a\u0442\u044f\u0431\u0440\u044c,\u041d\u043e\u044f\u0431\u0440\u044c,\u0414\u0435\u043a\u0430\u0431\u0440\u044c".split(","),
        monthNamesShort: "\u042f\u043d\u0432,\u0424\u0435\u0432,\u041c\u0430\u0440,\u0410\u043f\u0440,\u041c\u0430\u0439,\u0418\u044e\u043d,\u0418\u044e\u043b,\u0410\u0432\u0433,\u0421\u0435\u043d,\u041e\u043a\u0442,\u041d\u043e\u044f,\u0414\u0435\u043a".split(","),
        monthText: "\u041c\u0435\u0441\u044f\u0446",
        secText: "\u0421\u0435\u043a\u0443\u043d\u0434",
        timeFormat: "HH:ii",
        yearText: "\u0413\u043e\u0434",
        nowText: "\u0421\u0435\u0439\u0447\u0430\u0441",
        amText: "\u0414\u043e \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
        pmText: "\u041f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
        firstDay: 1,
        dateText: "\u0414\u0430\u0442\u0430",
        timeText: "\u0412\u0440\u0435\u043c\u044f",
        calendarText: "\u041a\u0430\u043b\u0435\u043d\u0434\u0430\u0440\u044c",
        closeText: "\u0417\u0430\u043a\u0440\u044b\u0442\u044c",
        fromText: "\u041d\u0430\u0447\u0430\u043b\u043e",
        toText: "\u041a\u043e\u043d\u0435\u0446",
        wholeText: "\u0426\u0435\u043b\u043e\u0435",
        fractionText: "\u0414\u0440\u043e\u0431\u043d\u043e\u0435",
        unitText: "\u0415\u0434\u0438\u043d\u0438\u0446\u0430",
        labels: "\u041b\u0435\u0442,\u041c\u0435\u0441\u044f\u0446\u0435\u0432,\u0414\u043d\u0435\u0439,\u0427\u0430\u0441\u043e\u0432,\u041c\u0438\u043d\u0443\u0442,\u0421\u0435\u043a\u0443\u043d\u0434,".split(","),
        labelsShort: "\u041b\u0435\u0442,\u041c\u0435\u0441,\u0414\u043d,\u0427\u0430\u0441,\u041c\u0438\u043d,\u0421\u0435\u043a,".split(","),
        startText: "\u0421\u0442\u0430\u0440\u0442",
        stopText: "\u0421\u0442\u043e\u043f",
        resetText: "\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c",
        lapText: "\u041a\u0440\u0443\u0433",
        hideText: "\u0421\u043a\u0440\u044b\u0442\u044c",
        backText: "\u043d\u0430\u0437\u0430\u0434",
        undoText: "\u0430\u043d\u043d\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
        offText: "O",
        onText: "I",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.lt = {
        setText: "OK",
        cancelText: "At\u0161aukti",
        clearText: "I\u0161valyti",
        selectedText: "Pasirinktas {count}",
        selectedPluralText: "Pasirinkti {count}",
        dateFormat: "yy-mm-dd",
        dayNames: "Sekmadienis,Pirmadienis,Antradienis,Tre\u010diadienis,Ketvirtadienis,Penktadienis,\u0160e\u0161tadienis".split(","),
        dayNamesShort: "S,Pr,A,T,K,Pn,\u0160".split(","),
        dayNamesMin: "S,Pr,A,T,K,Pn,\u0160".split(","),
        dayText: "Diena",
        hourText: "Valanda",
        minuteText: "Minutes",
        monthNames: "Sausis,Vasaris,Kovas,Balandis,Gegu\u017e\u0117,Bir\u017eelis,Liepa,Rugpj\u016btis,Rugs\u0117jis,Spalis,Lapkritis,Gruodis".split(","),
        monthNamesShort: "Sau,Vas,Kov,Bal,Geg,Bir,Lie,Rugp,Rugs,Spa,Lap,Gruo".split(","),
        monthText: "M\u0117nuo",
        secText: "Sekundes",
        amText: "am",
        pmText: "pm",
        timeFormat: "HH:ii",
        yearText: "Metai",
        nowText: "Dabar",
        firstDay: 1,
        dateText: "Data",
        timeText: "Laikas",
        calendarText: "Kalendorius",
        closeText: "U\u017edaryti",
        fromText: "Nuo",
        toText: "Iki",
        wholeText: "Visas",
        fractionText: "Frakcija",
        unitText: "Vienetas",
        labels: "Metai,M\u0117nesiai,Dienos,Valandos,Minutes,Sekundes,".split(","),
        labelsShort: "m,m\u0117n.,d,h,min,s,".split(","),
        startText: "Prad\u0117ti",
        stopText: "Sustabdyti",
        resetText: "I\u0161naujo",
        lapText: "Ratas",
        hideText: "Sl\u0117pti",
        backText: "Atgal",
        undoText: "At\u0161aukti veiksm\u0105",
        offText: "I\u0161j.",
        onText: "\u012ej.",
        decimalSeparator: ",",
        thousandsSeparator: " "
    };
    s.i18n.ca = {
        setText: "Acceptar",
        cancelText: "Cancel\u00b7lar",
        clearText: "Esborrar",
        selectedText: "{count} seleccionat",
        selectedPluralText: "{count} seleccionats",
        dateFormat: "dd/mm/yy",
        dayNames: "Diumenge,Dilluns,Dimarts,Dimecres,Dijous,Divendres,Dissabte".split(","),
        dayNamesShort: "Dg,Dl,Dt,Dc,Dj,Dv,Ds".split(","),
        dayNamesMin: "Dg,Dl,Dt,Dc,Dj,Dv,Ds".split(","),
        dayText: "Dia",
        hourText: "Hores",
        minuteText: "Minuts",
        monthNames: "Gener,Febrer,Mar&ccedil;,Abril,Maig,Juny,Juliol,Agost,Setembre,Octubre,Novembre,Desembre".split(","),
        monthNamesShort: "Gen,Feb,Mar,Abr,Mai,Jun,Jul,Ago,Set,Oct,Nov,Des".split(","),
        monthText: "Mes",
        secText: "Segons",
        timeFormat: "HH:ii",
        yearText: "Any",
        nowText: "Ara",
        pmText: "pm",
        amText: "am",
        firstDay: 1,
        dateText: "Data",
        timeText: "Temps",
        calendarText: "Calendari",
        closeText: "Tancar",
        fromText: "Iniciar",
        toText: "Final",
        wholeText: "Sencer",
        fractionText: "Fracci\u00f3",
        unitText: "Unitat",
        labels: "Anys,Mesos,Dies,Hores,Minuts,Segons,".split(","),
        labelsShort: "Anys,Mesos,Dies,Hrs,Mins,Secs,".split(","),
        startText: "Iniciar",
        stopText: "Aturar",
        resetText: "Reiniciar",
        lapText: "Volta",
        hideText: "Amagar",
        backText: "Tornar",
        undoText: "Desfer",
        offText: "No",
        onText: "Si"
    };
    s.i18n.da = {
        setText: "S\u00e6t",
        cancelText: "Annuller",
        clearText: "Ryd",
        selectedText: "{count} valgt",
        selectedPluralText: "{count} valgt",
        dateFormat: "dd/mm/yy",
        dayNames: "S\u00f8ndag,Mandag,Tirsdag,Onsdag,Torsdag,Fredag,L\u00f8rdag".split(","),
        dayNamesShort: "S\u00f8n,Man,Tir,Ons,Tor,Fre,L\u00f8r".split(","),
        dayNamesMin: "S,M,T,O,T,F,L".split(","),
        dayText: "Dag",
        hourText: "Timer",
        minuteText: "Minutter",
        monthNames: "Januar,Februar,Marts,April,Maj,Juni,Juli,August,September,Oktober,November,December".split(","),
        monthNamesShort: "Jan,Feb,Mar,Apr,Maj,Jun,Jul,Aug,Sep,Okt,Nov,Dec".split(","),
        monthText: "M\u00e5ned",
        secText: "Sekunder",
        amText: "am",
        pmText: "pm",
        timeFormat: "HH.ii",
        yearText: "\u00c5r",
        nowText: "Nu",
        firstDay: 1,
        dateText: "Dato",
        timeText: "Tid",
        calendarText: "Kalender",
        closeText: "Luk",
        fromText: "Start",
        toText: "Slut",
        wholeText: "Hele",
        fractionText: "Dele",
        unitText: "Enhed",
        labels: "\u00c5r,M\u00e5neder,Dage,Timer,Minutter,Sekunder,".split(","),
        labelsShort: "\u00c5r,Mdr,Dg,Timer,Min,Sek,".split(","),
        startText: "Start",
        stopText: "Stop",
        resetText: "Nulstil",
        lapText: "Omgang",
        hideText: "Skjul",
        offText: "Fra",
        onText: "Til",
        backText: "Tilbage",
        undoText: "Fortryd"
    };
    s.i18n.he = {
        rtl: !0,
        setText: "\u05e9\u05de\u05d9\u05e8\u05d4",
        cancelText: "\u05d1\u05d9\u05d8\u05d5\u05dc",
        clearText: "\u05e0\u05e7\u05d4",
        selectedText: "{count} \u05e0\u05d1\u05d7\u05e8",
        selectedPluralText: "{count} \u05e0\u05d1\u05d7\u05e8\u05d5",
        dateFormat: "dd/mm/yy",
        dayNames: "\u05e8\u05d0\u05e9\u05d5\u05df,\u05e9\u05e0\u05d9,\u05e9\u05dc\u05d9\u05e9\u05d9,\u05e8\u05d1\u05d9\u05e2\u05d9,\u05d7\u05de\u05d9\u05e9\u05d9,\u05e9\u05d9\u05e9\u05d9,\u05e9\u05d1\u05ea".split(","),
        dayNamesShort: "\u05d0',\u05d1',\u05d2',\u05d3',\u05d4',\u05d5',\u05e9'".split(","),
        dayNamesMin: "\u05d0,\u05d1,\u05d2,\u05d3,\u05d4,\u05d5,\u05e9".split(","),
        dayText: "\u05d9\u05d5\u05dd",
        hourText: "\u05e9\u05e2\u05d5\u05ea",
        minuteText: "\u05d3\u05e7\u05d5\u05ea",
        monthNames: "\u05d9\u05e0\u05d5\u05d0\u05e8,\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8,\u05de\u05e8\u05e5,\u05d0\u05e4\u05e8\u05d9\u05dc,\u05de\u05d0\u05d9,\u05d9\u05d5\u05e0\u05d9,\u05d9\u05d5\u05dc\u05d9,\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8,\u05e1\u05e4\u05d8\u05de\u05d1\u05e8,\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8,\u05e0\u05d5\u05d1\u05de\u05d1\u05e8,\u05d3\u05e6\u05de\u05d1\u05e8".split(","),
        monthNamesShort: "\u05d9\u05e0\u05d5,\u05e4\u05d1\u05e8,\u05de\u05e8\u05e5,\u05d0\u05e4\u05e8,\u05de\u05d0\u05d9,\u05d9\u05d5\u05e0,\u05d9\u05d5\u05dc,\u05d0\u05d5\u05d2,\u05e1\u05e4\u05d8,\u05d0\u05d5\u05e7,\u05e0\u05d5\u05d1,\u05d3\u05e6\u05de".split(","),
        monthText: "\u05d7\u05d5\u05d3\u05e9",
        secText: "\u05e9\u05e0\u05d9\u05d5\u05ea",
        amText: "am",
        pmText: "pm",
        timeFormat: "HH:ii",
        yearText: "\u05e9\u05e0\u05d4",
        nowText: "\u05e2\u05db\u05e9\u05d9\u05d5",
        firstDay: 0,
        dateText: "\u05ea\u05d0\u05e8\u05d9\u05da",
        timeText: "\u05d6\u05de\u05df",
        calendarText: "\u05ea\u05d0\u05e8\u05d9\u05db\u05d5\u05df",
        closeText: "\u05e1\u05d2\u05d9\u05e8\u05d4",
        todayText: "\u05d4\u05d9\u05d5\u05dd",
        eventText: "\u05de\u05b4\u05e7\u05e8\u05b6\u05d4",
        eventsText: "\u05de\u05b4\u05e7\u05e8\u05b6\u05d4",
        fromText: "\u05d4\u05ea\u05d7\u05dc\u05d4",
        toText: "\u05e1\u05d9\u05d5\u05dd",
        wholeText: "\u05db\u05bc\u05b9\u05dc",
        fractionText: "\u05e9\u05d1\u05e8\u05d9\u05e8",
        unitText: "\u05d9\u05d7\u05d9\u05d3\u05d4",
        labels: "\u05e9\u05e0\u05d9\u05dd,\u05d7\u05d5\u05d3\u05e9\u05d9\u05dd,\u05d9\u05de\u05d9\u05dd,\u05e9\u05e2\u05d5\u05ea,\u05d3\u05e7\u05d5\u05ea,\u05e9\u05e0\u05d9\u05d9\u05dd,".split(","),
        labelsShort: "\u05e9\u05e0\u05d9\u05dd,\u05d7\u05d5\u05d3\u05e9\u05d9\u05dd,\u05d9\u05de\u05d9\u05dd,\u05e9\u05e2\u05d5\u05ea,\u05d3\u05e7\u05d5\u05ea,\u05e9\u05e0\u05d9\u05d9\u05dd,".split(","),
        startText: "\u05d4\u05ea\u05d7\u05dc",
        stopText: "\u05e2\u05e6\u05d5\u05e8",
        resetText: "\u05d0\u05ea\u05d7\u05d5\u05dc",
        lapText: "\u05d4\u05e7\u05e4\u05d4",
        hideText: "\u05d4\u05e1\u05ea\u05e8",
        offText: "\u05db\u05d9\u05d1\u05d5\u05d9",
        onText: "\u05d4\u05e4\u05e2\u05dc\u05d4",
        backText: "\u05d7\u05d6\u05d5\u05e8",
        undoText: "\u05d1\u05d9\u05d8\u05d5\u05dc \u05e4\u05e2\u05d5\u05dc\u05d4"
    };
    (function(h) {
        var e = function() {},
            b = s,
            k = b.$;
        b.util.addIcon = function(a, b) {
            var d = {},
                e = a.parent(),
                H = e.find(".mbsc-err-msg"),
                h = a.attr("data-icon-align") || "left",
                q = a.attr("data-icon");
            k('<span class="mbsc-input-wrap"></span>').insertAfter(a).append(a);
            H && e.find(".mbsc-input-wrap").append(H);
            q && (-1 !== q.indexOf("{") ? d = JSON.parse(q) : d[h] = q);
            if (q || b) k.extend(d, b), e.addClass((d.right ? "mbsc-ic-right " : "") + (d.left ? " mbsc-ic-left" : "")).find(".mbsc-input-wrap").append(d.left ? '<span class="mbsc-input-ic mbsc-left-ic mbsc-ic mbsc-ic-' +
                d.left + '"></span>' : "").append(d.right ? '<span class="mbsc-input-ic mbsc-right-ic mbsc-ic mbsc-ic-' + d.right + '"></span>' : "")
        };
        b.classes.Progress = function(a, g, d) {
            function l() {
                var a = H("value", E);
                a !== n && x(a)
            }

            function H(a, b) {
                var c = o.attr(a);
                return c === h || "" === c ? b : +c
            }

            function x(a, b, d, f) {
                a = s.running && Math.min(c, Math.max(a, E));
                G.css("width", 100 * (a - E) / (c - E) + "%");
                d === h && (d = !0);
                f === h && (f = d);
                (a !== n || b) && D._display(a);
                a !== n && (n = a, d && o.attr("value", n), f && o.trigger("change"))
            }
            var q, o, u, G, C, m, f, E, c, I, j, n, K, D = this;
            b.classes.Base.call(this, a, g, !0);
            D._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            D._onInit = e;
            D._onDestroy = e;
            D._display = function(a) {
                K = j && I.returnAffix ? j.replace(/\{value\}/, a).replace(/\{max\}/, c) : a;
                C && C.html(K);
                q && q.html(K)
            };
            D._attachChange = function() {
                o.on("change", l)
            };
            D.init = function(d) {
                var e, i;
                D._processItem(k, 0);
                D._init(d);
                I = D.settings;
                o = k(a);
                o.parent().hasClass("mbsc-input-wrap") && D.destroy();
                u = D._$parent = o.parent();
                E = D._min = d.min === h ? H("min", I.min) : d.min;
                c = D._max = d.max === h ? H("max", I.max) : d.max;
                n = H("value", E);
                e = o.attr("data-val") || I.val;
                i = (i = o.attr("data-step-labels")) ? JSON.parse(i) : I.stepLabels;
                j = o.attr("data-template") || (100 == c && !I.template ? "{value}%" : I.template);
                f = D._css + " mbsc-progress-w mbsc-" + I.theme + (I.baseTheme ? " mbsc-" + I.baseTheme : "");
                u.addClass(f);
                D._wrap && b.util.addIcon(o);
                o.attr("min", E).attr("max", c);
                u.find(".mbsc-input-wrap").append('<span class="mbsc-progress-cont"><span class="mbsc-progress-track mbsc-progress-anim"><span class="mbsc-progress-bar"></span></span></span>');
                G = D._$progress = u.find(".mbsc-progress-bar");
                m = D._$track = u.find(".mbsc-progress-track");
                C = k(o.attr("data-target") || I.target);
                e && (q = k('<span class="mbsc-progress-value"></span>'), u.addClass("mbsc-progress-value-" + ("right" == e ? "right" : "left")).find(".mbsc-input-wrap").append(q));
                if (i)
                    for (e = 0; e < i.length; ++e) m.append('<span class="mbsc-progress-step-label" style="left: ' + 100 * (i[e] - E) / (c - E) + '%" >' + i[e] + "</span>");
                D._onInit(d);
                D._attachChange();
                D.refresh();
                D.trigger("onInit")
            };
            D.refresh = function() {
                x(H("value",
                    E), !0, !1)
            };
            D.destroy = function() {
                D._onDestroy();
                u.find(".mbsc-progress-cont").remove();
                u.removeClass(f).find(".mbsc-input-wrap").before(o).remove();
                o.removeClass("mbsc-control").off("change", l);
                D._destroy()
            };
            D.getVal = function() {
                return n
            };
            D.setVal = function(a, b, c) {
                x(a, !0, b, c)
            };
            d || D.init(g)
        };
        b.classes.Progress.prototype = {
            _class: "progress",
            _css: "mbsc-progress",
            _hasTheme: !0,
            _wrap: !0,
            _defaults: {
                min: 0,
                max: 100,
                returnAffix: !0
            }
        };
        b.presetShort("progress", "Progress")
    })();
    (function(h) {
        var e = function() {},
            b = s,
            k =
            b.$,
            a = b.util,
            g = a.getCoord,
            d = a.testTouch;
        b.classes.Slider = function(l, H, x) {
            function q(a) {
                d(a, this) && !A && !l.disabled && s.running && (aa.stopProp && a.stopPropagation(), A = !0, M = ca = !1, da = g(a, "X"), ga = g(a, "Y"), P = da, O.removeClass("mbsc-progress-anim"), t = la ? k(".mbsc-slider-handle", this) : p, i = t.parent().addClass("mbsc-active"), S = +t.attr("data-index"), va = O[0].offsetWidth, y = O.offset().left, "mousedown" === a.type && (a.preventDefault(), k(document).on("mousemove", o).on("mouseup", u)))
            }

            function o(a) {
                if (A) {
                    P = g(a, "X");
                    Y = g(a,
                        "Y");
                    R = P - da;
                    Q = Y - ga;
                    if (5 < Math.abs(R) || ca) ca = !0, 50 < Math.abs(ma - new Date) && (ma = new Date, j(P, aa.round, V));
                    ca ? a.preventDefault() : 7 < Math.abs(Q) && I(a)
                }
            }

            function u(b) {
                A && (b.preventDefault(), la || O.addClass("mbsc-progress-anim"), j(P, !0, !0), !ca && !M && (a.preventClick(), ja._onTap(ha[S])), I())
            }

            function G() {
                A && I()
            }

            function C() {
                var a = ja._readValue(k(this)),
                    b = +k(this).attr("data-index");
                a !== ha[b] && (ha[b] = a, D(a, b))
            }

            function m(a) {
                a.stopPropagation()
            }

            function f(a) {
                a.preventDefault()
            }

            function E(a) {
                var b;
                if (!l.disabled) {
                    switch (a.keyCode) {
                        case 38:
                        case 39:
                            b =
                                1;
                            break;
                        case 40:
                        case 37:
                            b = -1
                    }
                    b && (a.preventDefault(), Fa || (S = +k(this).attr("data-index"), D(ha[S] + $ * b, S, !0), Fa = setInterval(function() {
                        D(ha[S] + $ * b, S, !0)
                    }, 200)))
                }
            }

            function c(a) {
                a.preventDefault();
                clearInterval(Fa);
                Fa = null
            }

            function I() {
                A = !1;
                i.removeClass("mbsc-active");
                k(document).off("mousemove", o).off("mouseup", u)
            }

            function j(a, b, c) {
                a = b ? Math.min(100 * Math.round(Math.max(100 * (a - y) / va, 0) / r / $) * $ / (N - B), 100) : Math.max(0, Math.min(100 * (a - y) / va, 100));
                D(Math.round((B + a / r) * ua) / ua, S, c, a)
            }

            function n(a) {
                return 100 * (a -
                    B) / (N - B)
            }

            function K(a, b) {
                var c = L.attr(a);
                return c === h || "" === c ? b : "true" === c
            }

            function D(a, b, c, d, f, e) {
                var i = p.eq(b),
                    j = i.parent(),
                    a = Math.min(N, Math.max(a, B));
                e === h && (e = c);
                ba ? 0 === b ? (a = Math.min(a, ha[1]), v.css({
                    width: n(ha[1]) - n(a) + "%",
                    left: n(a) + "%"
                })) : (a = Math.max(a, ha[0]), v.css({
                    width: n(a) - n(ha[0]) + "%"
                })) : la || !J ? j.css({
                    left: (d || n(a)) + "%",
                    right: "auto"
                }) : v.css("width", (d || n(a)) + "%");
                Z && F.eq(b).html(a);
                a > B ? j.removeClass("mbsc-slider-start") : (ha[b] > B || f) && j.addClass("mbsc-slider-start");
                !la && (ha[b] != a || f) &&
                    ja._display(a);
                c && ha[b] != a && (M = !0, ha[b] = a, ja._fillValue(a, b, e));
                i.attr("aria-valuenow", a)
            }
            var L, t, i, p, w, T, v, F, O, A, M, R, Q, y, P, Y, S, J, Z, ba, V, N, B, ca, la, $, aa, r, da, ga, ua, Fa, va, ha, ja = this,
                ma = new Date;
            b.classes.Progress.call(this, l, H, !0);
            ja._onTap = e;
            ja.__onInit = e;
            ja._readValue = function(a) {
                return +a.val()
            };
            ja._fillValue = function(a, b, c) {
                L.eq(b).val(a);
                c && L.eq(b).trigger("change")
            };
            ja._attachChange = function() {
                L.on(aa.changeEvent, C)
            };
            ja._onInit = function(a) {
                var b;
                ja.__onInit();
                T = ja._$parent;
                O = ja._$track;
                v = ja._$progress;
                L = T.find("input");
                aa = ja.settings;
                B = ja._min;
                N = ja._max;
                $ = a.step === h ? +L.attr("step") || aa.step : a.step;
                V = K("data-live", aa.live);
                Z = K("data-tooltip", aa.tooltip);
                J = K("data-highlight", aa.highlight) && 3 > L.length;
                ua = 0 !== $ % 1 ? 100 / (100 * +($ % 1).toFixed(2)) : 1;
                r = 100 / (N - B) || 100;
                la = 1 < L.length;
                ba = J && 2 == L.length;
                ha = [];
                Z && T.addClass("mbsc-slider-has-tooltip");
                if (1 != $) {
                    b = (N - B) / $;
                    for (a = 0; a <= b; ++a) O.append('<span class="mbsc-slider-step" style="left:' + 100 / b * a + '%"></span>')
                }
                L.each(function(a) {
                    ha[a] = ja._readValue(k(this));
                    k(this).attr("data-index",
                        a).attr("min", B).attr("max", N).attr("step", $);
                    aa.handle && (J ? v : O).append('<span class="mbsc-slider-handle-cont' + (ba && !a ? " mbsc-slider-handle-left" : "") + '"><span tabindex="0" class="mbsc-slider-handle" aria-valuemin="' + B + '" aria-valuemax="' + N + '" data-index="' + a + '"></span>' + (Z ? '<span class="mbsc-slider-tooltip"></span>' : "") + "</span>")
                });
                p = T.find(".mbsc-slider-handle");
                F = T.find(".mbsc-slider-tooltip");
                w = T.find(la ? ".mbsc-slider-handle-cont" : ".mbsc-progress-cont");
                p.on("keydown", E).on("keyup", c).on("blur",
                    c);
                w.on("touchstart mousedown", q).on("touchmove", o).on("touchend touchcancel", u).on("pointercancel", G);
                L.on("click", m);
                T.on("click", f)
            };
            ja._onDestroy = function() {
                T.off("click", f);
                L.off(aa.changeEvent, C).off("click", m);
                p.off("keydown", E).off("keyup", c).off("blur", c);
                w.off("touchstart mousedown", q).off("touchmove", o).off("touchend", u).off("touchcancel pointercancel", G)
            };
            ja.refresh = function() {
                L.each(function(a) {
                    D(ja._readValue(k(this)), a, !0, !1, !0, !1)
                })
            };
            ja.getVal = function() {
                return la ? ha.slice(0) : ha[0]
            };
            ja.setVal = ja._setVal = function(a, b, c) {
                k.isArray(a) || (a = [a]);
                k.each(a, function(a, b) {
                    D(b, a, !0, !1, !0, c)
                })
            };
            x || ja.init(H)
        };
        b.classes.Slider.prototype = {
            _class: "progress",
            _css: "mbsc-progress mbsc-slider",
            _hasTheme: !0,
            _wrap: !0,
            _defaults: {
                changeEvent: "change",
                stopProp: !0,
                min: 0,
                max: 100,
                step: 1,
                live: !0,
                highlight: !0,
                handle: !0,
                round: !0,
                returnAffix: !0
            }
        };
        b.presetShort("slider", "Slider")
    })();
    (function(h, e, b) {
        var k, a, g = s,
            d = g.$,
            l = g.util,
            H = l.constrain,
            x = l.isString,
            q = l.isOldAndroid,
            l = /(iphone|ipod|ipad).* os 8_/i.test(navigator.userAgent),
            o = function() {},
            u = function(a) {
                a.preventDefault()
            };
        g.classes.Frame = function(l, C, m) {
            function f(a) {
                y && y.removeClass("mbsc-fr-btn-a");
                y = d(this);
                !y.hasClass("mbsc-fr-btn-d") && !y.hasClass("mbsc-fr-btn-nhl") && y.addClass("mbsc-fr-btn-a");
                if ("mousedown" === a.type) d(e).on("mouseup", E);
                else if ("pointerdown" === a.type) d(e).on("pointerup", E)
            }

            function E(a) {
                y && (y.removeClass("mbsc-fr-btn-a"), y = null);
                "mouseup" === a.type ? d(e).off("mouseup", E) : "pointerup" === a.type && d(e).off("pointerup", E)
            }

            function c(a) {
                13 == a.keyCode ? r.select() :
                    27 == a.keyCode && r.cancel()
            }

            function I(c) {
                var f, e, i, j = k,
                    g = B.focusOnClose;
                r._markupRemove();
                v.remove();
                c || (j || (j = da), setTimeout(function() {
                    if (!r._isVisible)
                        if (g === b || !0 === g) {
                            a = !0;
                            f = j[0];
                            i = f.type;
                            e = f.value;
                            try {
                                f.type = "button"
                            } catch (c) {}
                            j[0].focus();
                            f.type = i;
                            f.value = e
                        } else g && d(g)[0].focus()
                }, 200));
                k = null;
                J = r._isVisible = !1;
                s("onHide")
            }

            function j(a) {
                clearTimeout(ua[a.type]);
                ua[a.type] = setTimeout(function() {
                    var b = "scroll" == a.type;
                    (!b || ca) && r.position(!b)
                }, 200)
            }

            function n(a) {
                a.target.nodeType && !A[0].contains(a.target) &&
                    A[0].focus()
            }

            function K() {
                d(this).off("blur", K);
                setTimeout(function() {
                    r.position()
                }, 100)
            }

            function D(b, c) {
                b && b();
                !1 !== r.show() && (k = c, setTimeout(function() {
                    a = !1
                }, 300))
            }

            function L() {
                r._fillValue();
                s("onSet", {
                    valueText: r._value
                })
            }

            function t() {
                s("onCancel", {
                    valueText: r._value
                })
            }

            function i() {
                r.setVal(null, !0)
            }
            var p, w, T, v, F, O, A, M, R, Q, y, P, s, S, J, Z, ba, V, N, B, ca, la, $, aa, r = this,
                da = d(l),
                ga = [],
                ua = {};
            g.classes.Base.call(this, l, C, !0);
            r.position = function(a) {
                var c, f, i, j, g, k, l, u, n, m, o, t = 0,
                    q = 0;
                m = {};
                var y = Math.min(M[0].innerWidth ||
                        M.innerWidth(), O ? O.width() : 0),
                    p = M[0].innerHeight || M.innerHeight();
                g = d(e.activeElement);
                if (S && g.is("input,textarea") && !/(button|submit|checkbox|radio)/.test(g.attr("type"))) g.on("blur", K);
                else if (!($ === y && aa === p && a || N || !J))
                    if ((r._isFullScreen || /top|bottom/.test(B.display)) && A.width(y), !1 !== s("onPosition", {
                            target: v[0],
                            windowWidth: y,
                            windowHeight: p
                        }) && S) {
                        f = M.scrollLeft();
                        a = M.scrollTop();
                        j = B.anchor === b ? da : d(B.anchor);
                        r._isLiquid && "liquid" !== B.layout && (400 > y ? v.addClass("mbsc-fr-liq") : v.removeClass("mbsc-fr-liq"));
                        !r._isFullScreen && /center|bubble/.test(B.display) && (R.width(""), d(".mbsc-w-p", v).each(function() {
                            c = this.offsetWidth;
                            t += c;
                            q = c > q ? c : q
                        }), c = t > y ? q : t, R.width(c + 1).css("white-space", t > y ? "" : "nowrap"));
                        Z = A[0].offsetWidth;
                        ba = A[0].offsetHeight;
                        ca = ba <= p && Z <= y;
                        (r.scrollLock = ca) ? w.addClass("mbsc-fr-lock"): w.removeClass("mbsc-fr-lock");
                        "center" == B.display ? (f = Math.max(0, f + (y - Z) / 2), i = a + (p - ba) / 2) : "bubble" == B.display ? (o = $ !== y, i = d(".mbsc-fr-arr-i", v), g = j.offset(), k = Math.abs(w.offset().top - g.top), l = Math.abs(w.offset().left -
                            g.left), g = j[0].offsetWidth, j = j[0].offsetHeight, u = i[0].offsetWidth, n = i[0].offsetHeight, f = H(l - (Z - g) / 2, f + 3, f + y - Z - 3), i = k - ba - n / 2, i < a || k > a + p ? (A.removeClass("mbsc-fr-bubble-top").addClass("mbsc-fr-bubble-bottom"), i = k + j + n / 2) : A.removeClass("mbsc-fr-bubble-bottom").addClass("mbsc-fr-bubble-top"), g = H(l + g / 2 - (f + (Z - u) / 2), 0, u), d(".mbsc-fr-arr", v).css({
                            left: g
                        })) : "top" == B.display ? i = a : "bottom" == B.display && (i = a + p - ba);
                        i = 0 > i ? 0 : i;
                        m.top = i;
                        m.left = f;
                        A.css(m);
                        O.height(0);
                        m = Math.max(i + ba, "body" == B.context ? d(e).height() : w[0].scrollHeight);
                        O.css({
                            height: m
                        });
                        if (o && (i + ba > a + p || k > a + p)) N = !0, setTimeout(function() {
                            N = false
                        }, 300), M.scrollTop(Math.min(k, i + ba - p, m - p));
                        $ = y;
                        aa = p;
                        d(".mbsc-comp", v).each(function() {
                            var a = d(this).mobiscroll("getInst");
                            a !== r && a.position && a.position()
                        })
                    }
            };
            r.attachShow = function(b, c) {
                var f = d(b);
                ga.push({
                    readOnly: f.prop("readonly"),
                    el: f
                });
                if ("inline" !== B.display) {
                    if (la && f.is("input")) f.prop("readonly", !0).on("mousedown.mbsc", function(a) {
                        a.preventDefault()
                    });
                    if (B.showOnFocus) f.on("focus.mbsc", function() {
                        a || D(c, f)
                    });
                    B.showOnTap &&
                        (f.on("keydown.mbsc", function(a) {
                            if (32 == a.keyCode || 13 == a.keyCode) a.preventDefault(), a.stopPropagation(), D(c, f)
                        }), r.tap(f, function() {
                            D(c, f)
                        }))
                }
            };
            r.select = function() {
                S ? r.hide(!1, "set", !1, L) : L()
            };
            r.cancel = function() {
                S ? r.hide(!1, "cancel", !1, t) : t()
            };
            r.clear = function() {
                r._clearValue();
                s("onClear");
                S && r._isVisible && !r.live ? r.hide(!1, "clear", !1, i) : i()
            };
            r.enable = function() {
                B.disabled = !1;
                r._isInput && da.prop("disabled", !1)
            };
            r.disable = function() {
                B.disabled = !0;
                r._isInput && da.prop("disabled", !0)
            };
            r.show = function(a,
                i) {
                var k, l;
                if (!B.disabled && !r._isVisible) {
                    r._readValue();
                    if (!1 === s("onBeforeShow")) return !1;
                    d(e.activeElement).is("input,textarea") && e.activeElement.blur();
                    P = q ? !1 : B.animate;
                    if (!1 !== P)
                        if ("top" == B.display) P = "slidedown";
                        else if ("bottom" == B.display) P = "slideup";
                    else if ("center" == B.display || "bubble" == B.display) P = B.animate || "pop";
                    k = 0 < Q.length;
                    l = '<div lang="' + B.lang + '" class="mbsc-' + B.theme + (B.baseTheme ? " mbsc-" + B.baseTheme : "") + " mbsc-fr-" + B.display + " " + (B.cssClass || "") + " " + (B.compClass || "") + (r._isLiquid ?
                        " mbsc-fr-liq" : "") + (q ? " mbsc-old" : "") + (k ? "" : " mbsc-fr-nobtn") + '"><div class="mbsc-fr-persp">' + (S ? '<div class="mbsc-fr-overlay"></div>' : "") + "<div" + (S ? ' role="dialog" tabindex="-1"' : "") + ' class="mbsc-fr-popup' + (B.rtl ? " mbsc-rtl" : " mbsc-ltr") + '">' + ("bubble" === B.display ? '<div class="mbsc-fr-arr-w"><div class="mbsc-fr-arr-i"><div class="mbsc-fr-arr"></div></div></div>' : "") + '<div class="mbsc-fr-w"><div aria-live="assertive" class="mbsc-fr-aria mbsc-fr-hdn"></div>' + (B.headerText ? '<div class="mbsc-fr-hdr">' +
                        (x(B.headerText) ? B.headerText : "") + "</div>" : "") + '<div class="mbsc-fr-c">';
                    l += r._generateContent();
                    l += "</div>";
                    k && (l += '<div class="mbsc-fr-btn-cont">', d.each(Q, function(a, c) {
                        c = x(c) ? r.buttons[c] : c;
                        "set" === c.handler && (c.parentClass = "mbsc-fr-btn-s");
                        "cancel" === c.handler && (c.parentClass = "mbsc-fr-btn-c");
                        l += "<div" + (B.btnWidth ? ' style="width:' + 100 / Q.length + '%"' : "") + ' class="mbsc-fr-btn-w ' + (c.parentClass || "") + '"><div tabindex="0" role="button" class="mbsc-fr-btn' + a + " mbsc-fr-btn-e " + (c.cssClass === b ? B.btnClass :
                            c.cssClass) + (c.icon ? " mbsc-ic mbsc-ic-" + c.icon : "") + '">' + (c.text || "") + "</div></div>"
                    }), l += "</div>");
                    l += "</div></div></div></div>";
                    v = d(l);
                    O = d(".mbsc-fr-persp", v);
                    F = d(".mbsc-fr-overlay", v);
                    R = d(".mbsc-fr-w", v);
                    T = d(".mbsc-fr-hdr", v);
                    A = d(".mbsc-fr-popup", v);
                    p = d(".mbsc-fr-aria", v);
                    r._markup = v;
                    r._header = T;
                    r._isVisible = !0;
                    V = "orientationchange resize";
                    r._markupReady(v);
                    s("onMarkupReady", {
                        target: v[0]
                    });
                    if (S) {
                        d(h).on("keydown", c);
                        if (B.scrollLock) v.on("touchmove mousewheel wheel", function(a) {
                            ca && a.preventDefault()
                        });
                        q && d("input,select,button", w).each(function() {
                            this.disabled || d(this).addClass("mbsc-fr-td").prop("disabled", true)
                        });
                        g.activeInstance && g.activeInstance.hide();
                        V += " scroll";
                        g.activeInstance = r;
                        v.appendTo(w);
                        if (B.focusTrap) M.on("focusin", n);
                        P && !a && v.addClass("mbsc-anim-in mbsc-anim-trans mbsc-anim-trans-" + P).on("webkitAnimationEnd.mbsc animationend.mbsc", function() {
                            v.off("webkitAnimationEnd.mbsc animationend.mbsc").removeClass("mbsc-anim-in mbsc-anim-trans mbsc-anim-trans-" + P).find(".mbsc-fr-popup").removeClass("mbsc-anim-" +
                                P);
                            i || A[0].focus();
                            r.ariaMessage(B.ariaMessage)
                        }).find(".mbsc-fr-popup").addClass("mbsc-anim-" + P)
                    } else da.is("div") && !r._hasContent ? da.empty().append(v) : v.insertAfter(da);
                    J = !0;
                    r._markupInserted(v);
                    s("onMarkupInserted", {
                        target: v[0]
                    });
                    r.position();
                    M.on(V, j);
                    v.on("selectstart mousedown", u).on("click", ".mbsc-fr-btn-e", u).on("keydown", ".mbsc-fr-btn-e", function(a) {
                        if (a.keyCode == 32) {
                            a.preventDefault();
                            a.stopPropagation();
                            d(this).click()
                        }
                    }).on("keydown", function(a) {
                        if (a.keyCode == 32) a.preventDefault();
                        else if (a.keyCode ==
                            9 && S && B.focusTrap) {
                            var b = v.find('[tabindex="0"]').filter(function() {
                                    return this.offsetWidth > 0 || this.offsetHeight > 0
                                }),
                                c = b.index(d(":focus", v)),
                                f = b.length - 1,
                                i = 0;
                            if (a.shiftKey) {
                                f = 0;
                                i = -1
                            }
                            if (c === f) {
                                b.eq(i)[0].focus();
                                a.preventDefault()
                            }
                        }
                    });
                    d("input,select,textarea", v).on("selectstart mousedown", function(a) {
                        a.stopPropagation()
                    }).on("keydown", function(a) {
                        a.keyCode == 32 && a.stopPropagation()
                    });
                    d.each(Q, function(a, b) {
                        r.tap(d(".mbsc-fr-btn" + a, v), function(a) {
                            b = x(b) ? r.buttons[b] : b;
                            (x(b.handler) ? r.handlers[b.handler] :
                                b.handler).call(this, a, r)
                        }, true)
                    });
                    B.closeOnOverlayTap && r.tap(F, function() {
                        r.cancel()
                    });
                    S && !P && (i || A[0].focus(), r.ariaMessage(B.ariaMessage));
                    v.on("touchstart mousedown pointerdown", ".mbsc-fr-btn-e", f).on("touchend", ".mbsc-fr-btn-e", E);
                    r._attachEvents(v);
                    s("onShow", {
                        target: v[0],
                        valueText: r._tempValue
                    })
                }
            };
            r.hide = function(a, b, f, i) {
                if (!r._isVisible || !f && !r._isValid && "set" == b || !f && !1 === s("onBeforeClose", {
                        valueText: r._tempValue,
                        button: b
                    })) return !1;
                v && (q && d(".mbsc-fr-td", w).each(function() {
                    d(this).prop("disabled", !1).removeClass("mbsc-fr-td")
                }), S && P && !a && !v.hasClass("mbsc-anim-trans") ? v.addClass("mbsc-anim-out mbsc-anim-trans mbsc-anim-trans-" + P).on("webkitAnimationEnd.mbsc animationend.mbsc", function() {
                    v.off("webkitAnimationEnd.mbsc animationend.mbsc");
                    I(a)
                }).find(".mbsc-fr-popup").addClass("mbsc-anim-" + P) : I(a), r._detachEvents(v), M.off(V, j).off("focusin", n));
                S && (w.removeClass("mbsc-fr-lock"), d(h).off("keydown", c), delete g.activeInstance);
                i && i();
                s("onClose", {
                    valueText: r._value
                })
            };
            r.ariaMessage = function(a) {
                p.html("");
                setTimeout(function() {
                    p.html(a)
                }, 100)
            };
            r.isVisible = function() {
                return r._isVisible
            };
            r.setVal = o;
            r.getVal = o;
            r._generateContent = o;
            r._attachEvents = o;
            r._detachEvents = o;
            r._readValue = o;
            r._clearValue = o;
            r._fillValue = o;
            r._markupReady = o;
            r._markupInserted = o;
            r._markupRemove = o;
            r._processSettings = o;
            r._presetLoad = function(a) {
                a.buttons = a.buttons || ("inline" !== a.display ? ["set", "cancel"] : []);
                a.headerText = a.headerText === b ? "inline" !== a.display ? "{value}" : !1 : a.headerText
            };
            r.destroy = function() {
                r.hide(!0, !1, !0);
                d.each(ga, function(a,
                    b) {
                    b.el.off(".mbsc").prop("readonly", b.readOnly)
                });
                r._destroy()
            };
            r.init = function(a) {
                r._init(a);
                r._isLiquid = "liquid" === (B.layout || (/top|bottom/.test(B.display) ? "liquid" : ""));
                r._processSettings();
                da.off(".mbsc");
                Q = B.buttons || [];
                S = "inline" !== B.display;
                la = B.showOnFocus || B.showOnTap;
                r._window = M = d("body" == B.context ? h : B.context);
                r._context = w = d(B.context);
                r.live = !0;
                d.each(Q, function(a, b) {
                    if ("ok" == b || "set" == b || "set" == b.handler) return r.live = !1
                });
                r.buttons.set = {
                    text: B.setText,
                    handler: "set"
                };
                r.buttons.cancel = {
                    text: r.live ? B.closeText : B.cancelText,
                    handler: "cancel"
                };
                r.buttons.clear = {
                    text: B.clearText,
                    handler: "clear"
                };
                r._isInput = da.is("input");
                r._isVisible && r.hide(!0, !1, !0);
                s("onInit");
                S ? (r._readValue(), r._hasContent || r.attachShow(da)) : r.show();
                da.on("change.mbsc", function() {
                    r._preventChange || r.setVal(da.val(), true, false);
                    r._preventChange = false
                })
            };
            r.buttons = {};
            r.handlers = {
                set: r.select,
                cancel: r.cancel,
                clear: r.clear
            };
            r._value = null;
            r._isValid = !0;
            r._isVisible = !1;
            B = r.settings;
            s = r.trigger;
            m || r.init(C)
        };
        g.classes.Frame.prototype._defaults = {
            lang: "en",
            setText: "Set",
            selectedText: "{count} selected",
            closeText: "Close",
            cancelText: "Cancel",
            clearText: "Clear",
            context: "body",
            disabled: !1,
            closeOnOverlayTap: !0,
            showOnFocus: !1,
            showOnTap: !0,
            display: "center",
            scrollLock: !0,
            tap: !0,
            btnClass: "mbsc-fr-btn",
            btnWidth: !0,
            focusTrap: !0,
            focusOnClose: !l
        };
        g.themes.frame.mobiscroll = {
            rows: 5,
            showLabel: !1,
            headerText: !1,
            btnWidth: !1,
            selectedLineHeight: !0,
            selectedLineBorder: 1,
            weekDays: "min",
            checkIcon: "ion-ios7-checkmark-empty",
            btnPlusClass: "mbsc-ic mbsc-ic-arrow-down5",
            btnMinusClass: "mbsc-ic mbsc-ic-arrow-up5",
            btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left5",
            btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right5"
        };
        d(h).on("focus", function() {
            k && (a = !0)
        })
    })(window, document);
    s.themes.frame["android-holo"] = {
        dateDisplay: "Mddyy",
        rows: 5,
        minWidth: 76,
        height: 36,
        showLabel: !1,
        selectedLineHeight: !0,
        selectedLineBorder: 2,
        useShortLabels: !0,
        icon: {
            filled: "star3",
            empty: "star"
        },
        btnPlusClass: "mbsc-ic mbsc-ic-arrow-down6",
        btnMinusClass: "mbsc-ic mbsc-ic-arrow-up6"
    };
    (function() {
        var h = s,
            e = h.$;
        h.themes.frame.wp = {
            minWidth: 76,
            height: 76,
            dateDisplay: "mmMMddDDyy",
            headerText: !1,
            showLabel: !1,
            deleteIcon: "backspace4",
            icon: {
                filled: "star3",
                empty: "star"
            },
            btnWidth: !1,
            btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left2",
            btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right2",
            btnPlusClass: "mbsc-ic mbsc-ic-plus",
            btnMinusClass: "mbsc-ic mbsc-ic-minus",
            onMarkupInserted: function(b, k) {
                var a, g, d, l = e(b.target),
                    H = k.settings;
                e(".mbsc-sc-whl", l).on("touchstart mousedown wheel mousewheel", function(b) {
                    var k;
                    if (!(k = "mousedown" === b.type && g)) k = e(this).attr("data-index"),
                        k = e.isArray(H.readonly) ? H.readonly[k] : H.readonly;
                    k || (g = "touchstart" === b.type, a = !0, d = e(this).hasClass("mbsc-sc-whl-wpa"), e(".mbsc-sc-whl", l).removeClass("mbsc-sc-whl-wpa"), e(this).addClass("mbsc-sc-whl-wpa"))
                }).on("touchmove mousemove", function() {
                    a = !1
                }).on("touchend mouseup", function(b) {
                    a && d && e(b.target).closest(".mbsc-sc-itm").hasClass("mbsc-sc-itm-sel") && e(this).removeClass("mbsc-sc-whl-wpa");
                    "mouseup" === b.type && (g = !1);
                    a = !1
                })
            },
            onInit: function(b, e) {
                var a = e.buttons;
                a.set.icon = "checkmark";
                a.cancel.icon =
                    "close";
                a.clear.icon = "close";
                a.ok && (a.ok.icon = "checkmark");
                a.close && (a.close.icon = "close");
                a.now && (a.now.icon = "loop2");
                a.toggle && (a.toggle.icon = "play3");
                a.start && (a.start.icon = "play3");
                a.stop && (a.stop.icon = "pause2");
                a.reset && (a.reset.icon = "stop2");
                a.lap && (a.lap.icon = "loop2");
                a.hide && (a.hide.icon = "close")
            }
        }
    })();
    (function() {
        var h = s,
            e = h.$;
        h.themes.frame.material = {
            showLabel: !1,
            headerText: !1,
            btnWidth: !1,
            selectedLineHeight: !0,
            selectedLineBorder: 2,
            weekDays: "min",
            deleteIcon: "material-backspace",
            icon: {
                filled: "material-star",
                empty: "material-star-outline"
            },
            checkIcon: "material-check",
            btnPlusClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-down",
            btnMinusClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-up",
            btnCalPrevClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-left",
            btnCalNextClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-right",
            onMarkupReady: function(b) {
                h.themes.material.initRipple(e(b.target), ".mbsc-fr-btn-e", "mbsc-fr-btn-d", "mbsc-fr-btn-nhl")
            },
            onEventBubbleShow: function(b) {
                var k = e(b.eventList),
                    b = 2 > e(b.target).closest(".mbsc-cal-row").index(),
                    a = e(".mbsc-cal-event-color", k).eq(b ? 0 : -1).css("background-color");
                e(".mbsc-cal-events-arr", k).css("border-color", b ? "transparent transparent " + a + " transparent" : a + "transparent transparent transparent")
            }
        }
    })();
    s.themes.frame.ios = {
        display: "bottom",
        dateDisplay: "yyMMdd",
        rows: 5,
        height: 34,
        minWidth: 55,
        headerText: 1,
        showLabel: 1,
        btnWidth: !1,
        selectedLineHeight: !0,
        selectedLineBorder: 1,
        useShortLabels: !0,
        deleteIcon: "backspace3",
        checkIcon: "ion-ios7-checkmark-empty",
        btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left5",
        btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right5",
        btnPlusClass: "mbsc-ic mbsc-ic-arrow-down5",
        btnMinusClass: "mbsc-ic mbsc-ic-arrow-up5"
    };
    (function() {
        var h = s,
            e = h.$;
        h.themes.frame.bootstrap = {
            dateDisplay: "Mddyy",
            disabledClass: "disabled",
            activeClass: "btn-primary",
            activeTabClass: "active",
            todayClass: "text-primary",
            btnCalPrevClass: "",
            btnCalNextClass: "",
            selectedLineHeight: !0,
            onMarkupInserted: function(b) {
                b = e(b.target);
                e(".mbsc-fr-popup", b).addClass("popover");
                e(".mbsc-fr-w", b).addClass("popover-content");
                e(".mbsc-fr-hdr", b).addClass("popover-title");
                e(".mbsc-fr-arr-i",
                    b).addClass("popover");
                e(".mbsc-fr-arr", b).addClass("arrow");
                e(".mbsc-fr-btn", b).addClass("btn btn-default");
                e(".mbsc-fr-btn-s .mbsc-fr-btn", b).removeClass("btn-default").addClass("btn btn-primary");
                e(".mbsc-sc-btn-plus", b).addClass("glyphicon glyphicon-chevron-down");
                e(".mbsc-sc-btn-minus", b).addClass("glyphicon glyphicon-chevron-up");
                e(".mbsc-cal-next .mbsc-cal-btn-txt", b).prepend('<i class="glyphicon glyphicon-chevron-right"></i>');
                e(".mbsc-cal-prev .mbsc-cal-btn-txt", b).prepend('<i class="glyphicon glyphicon-chevron-left"></i>');
                e(".mbsc-cal-tabs ul", b).addClass("nav nav-tabs");
                e(".mbsc-cal-sc-c", b).addClass("popover");
                e(".mbsc-cal-week-nrs-c", b).addClass("popover");
                e(".mbsc-cal-events", b).addClass("popover");
                e(".mbsc-cal-events-arr", b).addClass("arrow");
                e(".mbsc-range-btn", b).addClass("btn btn-sm btn-small btn-default");
                e(".mbsc-np-btn", b).addClass("btn btn-default")
            },
            onPosition: function(b) {
                setTimeout(function() {
                    e(".mbsc-fr-bubble-top, .mbsc-fr-bubble-top .mbsc-fr-arr-i", b.target).removeClass("bottom").addClass("top");
                    e(".mbsc-fr-bubble-bottom, .mbsc-fr-bubble-bottom .mbsc-fr-arr-i",
                        b.target).removeClass("top").addClass("bottom")
                }, 10)
            },
            onEventBubbleShow: function(b) {
                var k = e(b.eventList);
                e(".mbsc-cal-event-list", k).addClass("list-group");
                e(".mbsc-cal-event", k).addClass("list-group-item");
                setTimeout(function() {
                    k.hasClass("mbsc-cal-events-b") ? k.removeClass("top").addClass("bottom") : k.removeClass("bottom").addClass("top")
                }, 10)
            }
        }
    })();
    (function(h, e, b) {
        var k, a = s,
            g = a.$,
            d = g.extend,
            l = a.classes,
            H = a.util,
            x = H.prefix,
            q = H.jsPrefix,
            o = H.getCoord,
            u = H.testTouch,
            G = H.vibrate,
            C = 1,
            m = function() {},
            f =
            h.requestAnimationFrame || function(a) {
                a()
            },
            E = h.cancelAnimationFrame || m,
            c = "webkitAnimationEnd animationend",
            I = "transparent";
        l.ListView = function(a, n) {
            function K() {
                nb = Rb = !1;
                hc = ka = 0;
                ic = new Date;
                lb = wa.width();
                zb = la(wa);
                sa = zb.index(U);
                Ga = U[0].offsetHeight;
                Ta = U[0].offsetTop;
                Aa = Ab[U.attr("data-type") || "defaults"];
                Lb = Aa.stages
            }

            function D(a) {
                var b;
                "touchstart" === a.type && (ob = !0, clearTimeout(hb));
                if (u(a, this) && !ma && !pb && !k && !Sb && s.running && (Ia = ma = !0, Tb = o(a, "X"), Ub = o(a, "Y"), ib = Na = 0, b = U = g(this), K(), ac = X.onItemTap ||
                        Aa.tap || U.hasClass("mbsc-lv-parent") || U.hasClass("mbsc-lv-back"), Ra.offset(), jb = U.offset().top, ac && (qa = setTimeout(function() {
                            b.addClass("mbsc-lv-item-active");
                            ta("onItemActivate", {
                                target: b[0],
                                domEvent: a
                            })
                        }, 120)), W.sortable && !U.hasClass("mbsc-lv-back") && ((W.sortable.group || (qb = U.nextUntil(".mbsc-lv-gr-title").filter(".mbsc-lv-item"), tb = U.prevUntil(".mbsc-lv-gr-title").filter(".mbsc-lv-item")), Oa = (!W.sortable.group ? tb.length ? tb.eq(-1) : U : wa.children("li").eq(0))[0].offsetTop - Ta, ub = (!W.sortable.group ?
                            qb.length ? qb.eq(-1) : U : wa.children("li").eq(-1))[0].offsetTop - Ta, W.sortable.handle) ? g(a.target).hasClass("mbsc-lv-handle") && (clearTimeout(qa), "Moz" === q ? (a.preventDefault(), T()) : Vb = setTimeout(function() {
                            T()
                        }, 100)) : Vb = setTimeout(function() {
                            oa.appendTo(U);
                            oa[0].style[q + "Animation"] = "mbsc-lv-fill " + (X.sortDelay - 100) + "ms linear";
                            clearTimeout(Bb);
                            clearTimeout(qa);
                            Ia = false;
                            Vb = setTimeout(function() {
                                oa[0].style[q + "Animation"] = "";
                                T()
                            }, X.sortDelay - 80)
                        }, 80)), "mousedown" == a.type)) g(e).on("mousemove", L).on("mouseup",
                    t)
            }

            function L(a) {
                var b = !1,
                    c = !0;
                if (ma)
                    if (cb = o(a, "X"), Cb = o(a, "Y"), Na = cb - Tb, ib = Cb - Ub, clearTimeout(Bb), !Za && !rb && !Db && !U.hasClass("mbsc-lv-back") && (10 < Math.abs(ib) ? (Db = !0, a.type = "mousemove" == a.type ? "mouseup" : "touchend", t(a), clearTimeout(qa)) : 7 < Math.abs(Na) ? i() : "touchmove" === a.type && (Bb = setTimeout(function() {
                            a.type = "touchend";
                            t(a)
                        }, 300))), rb) a.preventDefault(), ka = 100 * (Na / lb), p();
                    else if (Za) {
                    a.preventDefault();
                    var d, f = Pa.scrollTop(),
                        e = Math.max(Oa, Math.min(ib + Eb, ub)),
                        j = Ma ? jb - bc + f - Eb : jb;
                    Fb + f < j + e + Ga ? (Pa.scrollTop(j +
                        e - Fb + Ga), d = !0) : j + e < f && (Pa.scrollTop(j + e), d = !0);
                    d && (Eb += Pa.scrollTop() - f);
                    if (Ua && (W.sortable.multiLevel && ia.hasClass("mbsc-lv-parent") ? Ta + Ga / 4 + e > Ua ? b = !0 : Ta + Ga - Ga / 4 + e > Ua && (Ha = ia.addClass("mbsc-lv-item-hl"), c = !1) : Ta + Ga / 2 + e > Ua && (ia.hasClass("mbsc-lv-back") ? W.sortable.multiLevel && (Ba = ia.addClass("mbsc-lv-item-hl"), c = !1) : b = !0), b)) Va.insertAfter(ia), Ja = ia, ia = aa(ia, "next"), Ka = Ua, Ua = ia.length && ia[0].offsetTop, Qa++;
                    if (!b && Ka && (W.sortable.multiLevel && Ja.hasClass("mbsc-lv-parent") ? Ta + Ga - Ga / 4 + e < Ka ? b = !0 : Ta + Ga /
                            4 + e < Ka && (Ha = Ja.addClass("mbsc-lv-item-hl"), c = !1) : Ta + Ga / 2 + e < Ka && (Ja.hasClass("mbsc-lv-back") ? W.sortable.multiLevel && (Ba = Ja.addClass("mbsc-lv-item-hl"), c = !1) : b = !0), b)) Va.insertBefore(Ja), ia = Ja, Ja = aa(Ja, "prev"), Ua = Ka, Ka = Ja.length && Ja[0].offsetTop + Ja[0].offsetHeight, Qa--;
                    if (c && (Ha && (Ha.removeClass("mbsc-lv-item-hl"), Ha = !1), Ba)) Ba.removeClass("mbsc-lv-item-hl"), Ba = !1;
                    b && ta("onSortChange", [U, Qa]);
                    Y(U, e);
                    ta("onSort", [U, Qa])
                } else(5 < Math.abs(Na) || 5 < Math.abs(ib)) && S()
            }

            function t(a) {
                var b, c, d = U;
                if (ma) {
                    ma = !1;
                    S();
                    "mouseup" == a.type && g(e).off("mousemove", L).off("mouseup", t);
                    Db || (hb = setTimeout(function() {
                        ob = !1
                    }, 300));
                    if (rb || Db || Za) nb = !0;
                    rb ? w() : Za ? (b = wa, Ha ? (V(U.detach()), a = eb[Ha.attr("data-ref")], Qa = la(a.child).length, Ha.removeClass("mbsc-lv-item-hl"), X.navigateOnDrop ? Fa(Ha, function() {
                        W.add(null, U, null, null, Ha, !0);
                        ga(U);
                        v(U, sa, b, !0)
                    }) : (W.add(null, U, null, null, Ha, !0), v(U, sa, b, !0))) : Ba ? (V(U.detach()), a = eb[Ba.attr("data-back")], Qa = la(a.parent).index(a.item) + 1, Ba.removeClass("mbsc-lv-item-hl"), X.navigateOnDrop ?
                        Fa(Ba, function() {
                            W.add(null, U, Qa, null, wa, !0);
                            ga(U);
                            v(U, sa, b, !0)
                        }) : (W.add(null, U, Qa, null, a.parent, !0), v(U, sa, b, !0))) : (a = Va[0].offsetTop - Ta, Y(U, a, 6 * Math.abs(a - Math.max(Oa, Math.min(ib + Eb, ub))), function() {
                        V(U);
                        U.insertBefore(Va);
                        v(U, sa, b, Qa !== sa)
                    })), Za = !1) : !Db && 5 > Math.abs(Na) && 5 > Math.abs(ib) && (Aa.tap && (c = Aa.tap.call(Wa, {
                        target: U,
                        index: sa,
                        domEvent: a
                    }, W)), ac && ("touchend" === a.type && H.preventClick(), U.addClass("mbsc-lv-item-active"), ta("onItemActivate", {
                        target: U[0],
                        domEvent: a
                    })), c = ta("onItemTap", {
                        target: U[0],
                        index: sa,
                        domEvent: a
                    }), !1 !== c && Fa(U));
                    clearTimeout(qa);
                    setTimeout(function() {
                        d.removeClass("mbsc-lv-item-active");
                        ta("onItemDeactivate", {
                            target: d[0]
                        })
                    }, 100);
                    Db = !1;
                    Ca = null
                }
            }

            function i() {
                if (rb = N(Aa.swipe, {
                        target: U[0],
                        index: sa,
                        direction: 0 < Na ? "right" : "left"
                    })) S(), clearTimeout(qa), Aa.actions ? (ea = da(Aa), $a.html(Aa.icons).show().children().css("width", ea + "%"), Xa.hide(), g(".mbsc-lv-ic-m", ya).removeClass("mbsc-lv-ic-disabled"), g(Aa.leftMenu).each(A), g(Aa.rightMenu).each(A)) : (Xa.show(), $a.hide(), pa = Aa.start +
                    (0 < Na ? 0 : 1), Ea = Lb[pa - 1], fb = Lb[pa]), U.addClass("mbsc-lv-item-swiping").removeClass("mbsc-lv-item-active"), Wb.css("line-height", Ga + "px"), ya.css({
                    top: Ta,
                    height: Ga,
                    backgroundColor: (0 < Na ? Aa.right : Aa.left).color || I
                }).addClass("mbsc-lv-stage-c-v").appendTo(wa.parent()), X.iconSlide && U.append(Xa), ta("onSlideStart", {
                    target: U[0],
                    index: sa
                })
            }

            function p() {
                var a = !1;
                if (!Xb) {
                    if (Aa.actions) ya.attr("class", "mbsc-lv-stage-c-v mbsc-lv-stage-c mbsc-lv-" + (0 > ka ? "right" : "left"));
                    else if (Ea && ka <= Ea.percent ? (pa--, fb = Ea, Ea = Lb[pa],
                            a = !0) : fb && ka >= fb.percent && (pa++, Ea = fb, fb = Lb[pa], a = !0), a)
                        if (Ca = 0 < ka ? Ea : fb) J(Ca, X.iconSlide), ta("onStageChange", {
                            target: U[0],
                            index: sa,
                            stage: Ca
                        });
                    Gb || (Xb = !0, jc = f(Q))
                }
            }

            function w(a) {
                var b, c, d = !1;
                E(jc);
                Xb = !1;
                Gb || Q();
                if (Aa.actions) 10 < Math.abs(ka) && ea && (P(U, 0 > ka ? -ea : ea, 200), k = d = !0, db = U, fa = sa, g(e).on("touchstart.mbsc-lv-conf mousedown.mbsc-lv-conf", function(b) {
                    b.preventDefault();
                    y(U, !0, a)
                }));
                else if (X.quickSwipe && !Gb && (c = new Date - ic, b = 300 > c && -50 > Na, c = 300 > c && 50 < Na, b ? (Rb = !0, Ca = Aa.left, J(Ca, X.iconSlide)) : c &&
                        (Rb = !0, Ca = Aa.right, J(Ca, X.iconSlide))), Ca && Ca.action) Hb = N(Ca.disabled, {
                    target: U[0],
                    index: sa
                }), Hb || (d = !0, (k = Gb || N(Ca.confirm, {
                    target: U[0],
                    index: sa
                })) ? (P(U, 100 * (0 > ka ? -1 : 1) * Xa[0].offsetWidth / lb, 200, !0), R(Ca, U, sa, !1, a)) : M(Ca, U, sa, a));
                d || y(U, !0, a);
                rb = !1
            }

            function T() {
                Za = !0;
                Ba = Ha = !1;
                Eb = 0;
                Qa = sa;
                X.vibrate && G();
                ia = aa(U, "next");
                Ua = ia.length && ia[0].offsetTop;
                Ja = aa(U, "prev");
                Ka = Ja.length && Ja[0].offsetTop + Ja[0].offsetHeight;
                Va.height(Ga).insertAfter(U);
                U.css({
                    top: Ta
                }).addClass("mbsc-lv-item-dragging").removeClass("mbsc-lv-item-active").appendTo(Mb);
                ta("onSortStart", {
                    target: U[0],
                    index: Qa
                })
            }

            function v(a, b, c, d) {
                a.removeClass("mbsc-lv-item-dragging");
                Va.remove();
                ta("onSortEnd", {
                    target: a[0],
                    index: Qa
                });
                X.vibrate && G();
                d && (W.addUndoAction(function(d) {
                    W.move(a, b, null, d, c, !0)
                }, !0), ta("onSortUpdate", {
                    target: a[0],
                    index: Qa
                }))
            }

            function F() {
                ob || (clearTimeout(Nb), k && g(e).trigger("touchstart"), za && (W.close(ab, sb), za = !1, ab = null))
            }

            function O() {
                clearTimeout(ra);
                ra = setTimeout(function() {
                    Fb = Pa[0].innerHeight || Pa.innerHeight();
                    bc = Ma ? Pa.offset().top : 0;
                    ma && (Ta = U[0].offsetTop,
                        Ga = U[0].offsetHeight, ya.css({
                            top: Ta,
                            height: Ga
                        }))
                }, 200)
            }

            function A(a, b) {
                N(b.disabled, {
                    target: U[0],
                    index: sa
                }) && g(".mbsc-ic-" + b.icon, ya).addClass("mbsc-lv-ic-disabled")
            }

            function M(a, b, c, d) {
                var f, e = {
                    icon: "undo2",
                    text: X.undoText,
                    color: "#b1b1b1",
                    action: function() {
                        W.undo()
                    }
                };
                a.undo && (W.startActionTrack(), g.isFunction(a.undo) && W.addUndoAction(function() {
                    a.undo.call(Wa, b, W, c)
                }), Yb = b.attr("data-ref"));
                f = a.action.call(Wa, {
                    target: b[0],
                    index: c
                }, W);
                a.undo ? (W.endActionTrack(), !1 !== f && P(b, 0 > +b.attr("data-pos") ? -100 :
                    100, 200), Va.height(Ga).insertAfter(b), b.css("top", Ta).addClass("mbsc-lv-item-undo"), $a.hide(), Xa.show(), ya.append(Xa), J(e), R(e, b, c, !0, d)) : y(b, f, d)
            }

            function R(a, b, c, d, f) {
                var i, j;
                k = !0;
                g(e).off(".mbsc-lv-conf").on("touchstart.mbsc-lv-conf mousedown.mbsc-lv-conf", function(a) {
                    a.preventDefault();
                    d && ba(b);
                    y(b, !0, f)
                });
                if (!mb) Xa.off(".mbsc-lv-conf").on("touchstart.mbsc-lv-conf mousedown.mbsc-lv-conf", function(a) {
                    a.stopPropagation();
                    i = o(a, "X");
                    j = o(a, "Y")
                }).on("touchend.mbsc-lv-conf mouseup.mbsc-lv-conf", function(e) {
                    e.preventDefault();
                    "touchend" === e.type && H.preventClick();
                    10 > Math.abs(o(e, "X") - i) && 10 > Math.abs(o(e, "Y") - j) && (M(a, b, c, f), d && (Zb = null, ba(b)))
                })
            }

            function Q() {
                P(U, hc + 100 * Na / lb);
                Xb = !1
            }

            function y(a, b, c) {
                g(e).off(".mbsc-lv-conf");
                Xa.off(".mbsc-lv-conf");
                !1 !== b ? P(a, 0, "0" !== a.attr("data-pos") ? 200 : 0, !1, function() {
                    Z(a, c);
                    V(a)
                }) : Z(a, c);
                k = !1
            }

            function P(a, b, c, d, f) {
                b = Math.max("right" == rb ? 0 : -100, Math.min(b, "left" == rb ? 0 : 100));
                kb = a[0].style;
                a.attr("data-pos", b);
                kb[q + "Transform"] = "translate3d(" + (d ? lb * b / 100 + "px" : b + "%") + ",0,0)";
                kb[q + "Transition"] =
                    x + "transform " + (c || 0) + "ms";
                f && (pb++, setTimeout(function() {
                    f();
                    pb--
                }, c));
                ka = b
            }

            function Y(a, b, c, d) {
                b = Math.max(Oa, Math.min(b, ub));
                kb = a[0].style;
                kb[q + "Transform"] = "translate3d(0," + b + "px,0)";
                kb[q + "Transition"] = x + "transform " + (c || 0) + "ms ease-out";
                d && (pb++, setTimeout(function() {
                    d();
                    pb--
                }, c))
            }

            function S() {
                clearTimeout(Vb);
                !Ia && W.sortable && (Ia = !0, oa.remove())
            }

            function J(a, b) {
                var c = N(a.text, {
                    target: U[0],
                    index: sa
                }) || "";
                N(a.disabled, {
                    target: U[0],
                    index: sa
                }) ? ya.addClass("mbsc-lv-ic-disabled") : ya.removeClass("mbsc-lv-ic-disabled");
                ya.css("background-color", a.color || (0 === a.percent ? (0 < ka ? Aa.right : Aa.left).color || I : I));
                Xa.attr("class", "mbsc-lv-ic-c mbsc-lv-ic-" + (b ? "move-" : "") + (0 > ka ? "right" : "left"));
                z.attr("class", " mbsc-lv-ic-s mbsc-lv-ic mbsc-ic mbsc-ic-" + (a.icon || "none"));
                Wb.attr("class", "mbsc-lv-ic-text" + (a.icon ? "" : " mbsc-lv-ic-text-only") + (c ? "" : " mbsc-lv-ic-only")).html(c || "&nbsp;");
                X.animateIcons && (Rb ? z.addClass("mbsc-lv-ic-v") : setTimeout(function() {
                    z.addClass("mbsc-lv-ic-a")
                }, 10))
            }

            function Z(a, b) {
                ma || (z.attr("class", "mbsc-lv-ic-s mbsc-lv-ic mbsc-ic mbsc-ic-none"),
                    ya.attr("style", "").removeClass("mbsc-lv-stage-c-v"), Wb.html(""));
                ya.removeClass("mbsc-lv-left mbsc-lv-right");
                a && (ta("onSlideEnd", {
                    target: a[0],
                    index: sa
                }), b && b())
            }

            function ba(a) {
                a.css("top", "").removeClass("mbsc-lv-item-undo");
                Zb ? W.animate(Va, "collapse", function() {
                    Va.remove()
                }) : Va.remove();
                Z();
                Zb = Yb = null
            }

            function V(a) {
                kb = a[0].style;
                kb[q + "Transform"] = "";
                kb[q + "Transition"] = "";
                kb.top = "";
                a.removeClass("mbsc-lv-item-swiping")
            }

            function N(a, b) {
                return g.isFunction(a) ? a.call(this, b, W) : a
            }

            function B(a) {
                var b;
                a.attr("data-ref") || (b = C++, a.attr("data-ref", b), eb[b] = {
                    item: a,
                    child: a.children("ul,ol"),
                    parent: a.parent(),
                    ref: a.parent()[0] === Wa ? null : a.parent().parent().attr("data-ref")
                });
                a.addClass("mbsc-lv-item");
                W.sortable.handle && "list-divider" != a.attr("data-role") && !a.children(".mbsc-lv-handle-c").length && a.append(vb);
                if (X.enhance && !a.hasClass("mbsc-lv-item-enhanced")) {
                    b = a.attr("data-icon");
                    var c = a.find("img").eq(0).addClass("mbsc-lv-img");
                    c.is(":first-child") ? a.addClass("mbsc-lv-img-" + (X.rtl ? "right" : "left")) :
                        c.length && a.addClass("mbsc-lv-img-" + (X.rtl ? "left" : "right"));
                    a.addClass("mbsc-lv-item-enhanced").children().each(function(a, b) {
                        b = g(b);
                        b.is("p, h1, h2, h3, h4, h5, h6") && b.addClass("mbsc-lv-txt")
                    });
                    b && a.addClass("mbsc-lv-item-ic-" + (a.attr("data-icon-align") || (X.rtl ? "right" : "left"))).append('<div class="mbsc-lv-item-ic mbsc-ic mbsc-ic-' + b + '"></div')
                }
                a.append(W._processItem(g, 0.2))
            }

            function ca(a) {
                g("li", a).not(".mbsc-lv-item").each(function() {
                    B(g(this))
                });
                g('li[data-role="list-divider"]', a).removeClass("mbsc-lv-item").addClass("mbsc-lv-gr-title");
                g("ul,ol", a).not(".mbsc-lv").addClass("mbsc-lv").prepend(wb).parent().addClass("mbsc-lv-parent").prepend(Ob);
                g(".mbsc-lv-back", a).each(function() {
                    g(this).attr("data-back", g(this).parent().parent().attr("data-ref"))
                })
            }

            function la(a) {
                return a.children("li").not(".mbsc-lv-back").not(".mbsc-lv-removed").not(".mbsc-lv-ph")
            }

            function $(a) {
                "object" !== typeof a && (a = g('li[data-id="' + a + '"]', na));
                return g(a)
            }

            function aa(a, b) {
                for (a = a[b](); a.length && (!a.hasClass("mbsc-lv-item") || a.hasClass("mbsc-lv-ph") || a.hasClass("mbsc-lv-item-dragging"));) {
                    if (!W.sortable.group &&
                        a.hasClass("mbsc-lv-gr-title")) return !1;
                    a = a[b]()
                }
                return a
            }

            function r(a) {
                return H.isNumeric(a) ? a + "" : 0
            }

            function da(a) {
                return +(0 > Na ? r((a.actionsWidth || 0).right) || r(a.actionsWidth) || r(X.actionsWidth.right) || r(X.actionsWidth) : r((a.actionsWidth || 0).left) || r(a.actionsWidth) || r(X.actionsWidth.left) || r(X.actionsWidth))
            }

            function ga(a, b) {
                if (a) {
                    var c = Pa.scrollTop(),
                        d = a.is(".mbsc-lv-item") ? a[0].offsetHeight : 0,
                        f = a.offset().top + (Ma ? c - bc : 0);
                    b ? (f < c || f > c + Fb) && Pa.scrollTop(f) : f < c ? Pa.scrollTop(f) : f + d > c + Fb && Pa.scrollTop(f +
                        d - Fb / 2)
                }
            }

            function ua(a, b, c, d, f) {
                var e = b.parent(),
                    i = b.prev(),
                    d = d || m;
                i[0] === Xa[0] && (i = Xa.prev());
                wa[0] !== b[0] ? (ta("onNavStart", {
                    level: Ib,
                    direction: a,
                    list: b[0]
                }), cc.prepend(b.addClass("mbsc-lv-v mbsc-lv-sl-new")), ga(na), va(cc, "mbsc-lv-sl-" + a, function() {
                    wa.removeClass("mbsc-lv-sl-curr");
                    b.removeClass("mbsc-lv-sl-new").addClass("mbsc-lv-sl-curr");
                    La && La.length ? wa.removeClass("mbsc-lv-v").insertAfter(La) : gb.append(wa.removeClass("mbsc-lv-v"));
                    La = i;
                    gb = e;
                    wa = b;
                    ga(c, f);
                    d.call(Wa, c);
                    ta("onNavEnd", {
                        level: Ib,
                        direction: a,
                        list: b[0]
                    })
                })) : (ga(c, f), d.call(Wa, c))
            }

            function Fa(a, b) {
                pb || (a.hasClass("mbsc-lv-parent") ? (Ib++, ua("r", eb[a.attr("data-ref")].child, null, b)) : a.hasClass("mbsc-lv-back") && (Ib--, ua("l", eb[a.attr("data-back")].parent, eb[a.attr("data-back")].item, b)))
            }

            function va(a, b, d) {
                function f() {
                    clearTimeout(e);
                    pb--;
                    a.off(c, f).removeClass(b);
                    d.call(Wa, a)
                }
                var e, d = d || m;
                X.animation && "mbsc-lv-item-none" !== b ? (pb++, a.on(c, f).addClass(b), e = setTimeout(f, 500)) : d.call(Wa, a)
            }

            function ha(a, b) {
                var c, d = a.attr("data-ref");
                c = dc[d] = dc[d] || [];
                b && c.push(b);
                a.attr("data-action") || (b = c.shift(), a.attr("data-action", 1), b(function() {
                    a.removeAttr("data-action");
                    c.length ? ha(a) : delete dc[d]
                }))
            }

            function ja(a, c, f) {
                var e, i;
                a && a.length && (e = 100 / (a.length + 2), g.each(a, function(j, g) {
                    g.key === b && (g.key = ec++);
                    g.percent === b && (g.percent = c * e * (j + 1), f && (i = d({}, g), i.key = ec++, i.percent = -e * (j + 1), a.push(i), $b[i.key] = i));
                    $b[g.key] = g
                }))
            }
            var ma, ea, qa, ka, Ia, db, fa, na, Qa, Kb, wa, La, gb, zb, Ca, pa, ra, mb, Hb, Na, ib, Ha, Ba, Za, Mb, Bb, cb, Cb, ta, oa, Sa, bb, xa, xb, yb, Ya,
                Ma, vb, Pb, ab, za, sb, Da, Nb, wb, Ob, z, Xa, ya, lb, U, Ga, sa, jb, ub, Oa, $a, ia, Ua, fb, qb, nb, ob, hb, tb, Va, Ja, Ka, Ea, Rb, jc, Xb, X, Db, Gb, cc, ec, Lb, hc, ic, Tb, Ub, kb, rb, fc, kc, ac, Wb, Vb, Aa, Ab, Yb, Zb, Pa, Fb, Eb, bc, W = this,
                Wa = a,
                Ra = g(Wa),
                pb = 0,
                Ib = 0,
                Ta = 0,
                $b = {},
                dc = {},
                eb = {};
            l.Base.call(this, a, n, !0);
            W._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            W.animate = function(a, b, c) {
                va(a, "mbsc-lv-item-" + b, c)
            };
            W.add = function(a, c, d, f, e, i) {
                var j, k, l, u, n, o, t = "",
                    y = e === b ? Ra : $(e),
                    p = y,
                    q = "object" !== typeof c ? g('<li data-ref="' + C++ + '" data-id="' + a + '">' + c + "</li>") : c,
                    w = 0 > q.attr("data-pos") ? "left" : "right",
                    A = q.attr("data-ref"),
                    f = f || m;
                A || (A = C++, q.addClass("mbsc-lv-item").attr("data-ref", A));
                B(q);
                i || W.addUndoAction(function(a) {
                    u ?
                        W.navigate(y, function() {
                            p.remove();
                            y.removeClass("mbsc-lv-parent").children(".mbsc-lv-arr").remove();
                            n.child = y.children("ul,ol");
                            W.remove(q, null, a, true)
                        }) : W.remove(q, null, a, true)
                }, !0);
                ha(q, function(a) {
                    V(q.css("top", "").removeClass("mbsc-lv-item-undo"));
                    if (y.is("li")) {
                        o = y.attr("data-ref");
                        if (!y.children("ul,ol").length) {
                            u = true;
                            y.append("<ul></ul>")
                        }
                    } else o = y.children(".mbsc-lv-back").attr("data-back");
                    if (n = eb[o])
                        if (n.child.length) p = n.child;
                        else {
                            y.addClass("mbsc-lv-parent").prepend(Ob);
                            p = y.children("ul,ol").prepend(wb).addClass("mbsc-lv");
                            n.child = p;
                            g(".mbsc-lv-back", y).attr("data-back", o)
                        }
                    eb[A] = {
                        item: q,
                        child: q.children("ul,ol"),
                        parent: p,
                        ref: o
                    };
                    l = la(p);
                    k = l.length;
                    if (d === b || d === null) d = k;
                    i && (t = "mbsc-lv-item-new-" + (i ? w : ""));
                    ca(q.addClass(t));
                    if (d !== false)
                        if (k) d < k ? q.insertBefore(l.eq(d)) : q.insertAfter(l.eq(k - 1));
                        else {
                            j = g(".mbsc-lv-back", p);
                            j.length ? q.insertAfter(j) : p.append(q)
                        }
                    if (p.hasClass("mbsc-lv-v")) W.animate(q.height(q[0].offsetHeight), i && Yb === A ? "none" : "expand", function(b) {
                        W.animate(b.height(""), i ? "add-" + w : "pop-in", function(b) {
                            f.call(Wa,
                                b.removeClass(t));
                            a()
                        })
                    });
                    else {
                        f.call(Wa, q.removeClass(t));
                        a()
                    }
                    na.trigger("mbsc-enhance", [{
                        theme: X.theme,
                        lang: X.lang
                    }]);
                    ta("onItemAdd", {
                        target: q[0]
                    })
                })
            };
            W.swipe = function(a, c, d, f, e) {
                U = a = $(a);
                mb = f;
                ma = Gb = !0;
                d = d === b ? 300 : d;
                Na = 0 < c ? 1 : -1;
                K();
                i();
                P(a, c, d);
                clearTimeout(kc);
                clearInterval(fc);
                fc = setInterval(function() {
                    ka = 100 * (H.getPosition(a) / lb);
                    p()
                }, 10);
                kc = setTimeout(function() {
                    clearInterval(fc);
                    ka = c;
                    p();
                    w(e);
                    ma = Gb = mb = !1
                }, d)
            };
            W.openStage = function(a, b, c, d) {
                $b[b] && W.swipe(a, $b[b].percent, c, d)
            };
            W.openActions =
                function(a, b, c, d) {
                    var f = da(Ab[a.attr("data-type") || "defaults"]);
                    W.swipe(a, "left" == b ? -f : f, c, d)
                };
            W.close = function(a, b) {
                W.swipe(a, 0, b)
            };
            W.remove = function(a, b, c, d) {
                var f, e, c = c || m,
                    a = $(a);
                a.length && (e = a.parent(), f = la(e).index(a), d || (a.attr("data-ref") === Yb && (Zb = !0), W.addUndoAction(function(b) {
                    W.add(null, a, f, b, e, !0)
                }, !0)), ha(a, function(f) {
                    b = b || a.attr("data-pos") < 0 ? "left" : "right";
                    if (e.hasClass("mbsc-lv-v")) W.animate(a.addClass("mbsc-lv-removed"), d ? "pop-out" : "remove-" + b, function(a) {
                        W.animate(a.height(a[0].offsetHeight),
                            "collapse",
                            function(a) {
                                V(a.height("").removeClass("mbsc-lv-removed"));
                                c.call(Wa, a) !== false && a.remove();
                                f()
                            })
                    });
                    else {
                        c.call(Wa, a) !== false && a.remove();
                        f()
                    }
                    ta("onItemRemove", {
                        target: a[0]
                    })
                }))
            };
            W.move = function(a, b, c, d, f, e) {
                a = $(a);
                e || W.startActionTrack();
                ya.append(Xa);
                W.remove(a, c, null, e);
                W.add(null, a, b, d, f, e);
                e || W.endActionTrack()
            };
            W.navigate = function(a, b) {
                var c, d, a = $(a);
                c = eb[a.attr("data-ref")];
                d = 0;
                for (var f = eb[a.attr("data-ref")]; f.ref;) d++, f = eb[f.ref];
                c && (ua(d >= Ib ? "r" : "l", c.parent, a, b, !0), Ib = d)
            };
            W.init =
                function(a) {
                    var c = Ra.find("ul,ol").length ? "left" : "right",
                        d = 0,
                        f = "",
                        e = "",
                        i = "";
                    W._init(a);
                    a = X.sort || X.sortable;
                    "group" === a && (a = {
                        group: !1,
                        multiLevel: !0
                    });
                    !0 === a && (a = {
                        group: !0,
                        multiLevel: !0,
                        handle: X.sortHandle
                    });
                    a && a.handle === b && (a.handle = X.sortHandle);
                    W.sortable = a || !1;
                    f += '<div class="mbsc-lv-multi-c"></div><div class="mbsc-lv-ic-c"><div class="mbsc-lv-ic-s mbsc-lv-ic mbsc-ic mbsc-ic-none"></div><div class="mbsc-lv-ic-text"></div></div>';
                    Ra.addClass("mbsc-lv mbsc-lv-v mbsc-lv-root").show();
                    ya = g('<div class="mbsc-lv-stage-c">' +
                        f + "</div>");
                    Xa = g(".mbsc-lv-ic-c", ya);
                    $a = g(".mbsc-lv-multi-c", ya);
                    z = g(".mbsc-lv-ic-s", ya);
                    Wb = g(".mbsc-lv-ic-text", ya);
                    Va = g('<li class="mbsc-lv-item mbsc-lv-ph"></li>');
                    oa = g('<div class="mbsc-lv-fill-item"></div>');
                    na = g('<div class="mbsc-lv-cont mbsc-lv-' + X.theme + (X.baseTheme ? " mbsc-lv-" + X.baseTheme : "") + (X.animateIcons ? " mbsc-lv-ic-anim" : "") + (X.striped ? " mbsc-lv-alt-row " : "") + '"><ul class="mbsc-lv mbsc-lv-dummy"></ul><div class="mbsc-lv-sl-c"></div></div>');
                    Ma = "body" !== X.context;
                    Pa = g(Ma ? X.context : h);
                    Mb = g(".mbsc-lv-dummy", na);
                    na.insertAfter(Ra);
                    W.sortable.handle && (Ya = !0 === W.sortable.handle ? c : W.sortable.handle, vb = '<div class="mbsc-lv-handle-c mbsc-lv-item-h-' + Ya + ' mbsc-lv-handle"><div class="' + X.handleClass + ' mbsc-lv-handle-bar-c mbsc-lv-handle">' + X.handleMarkup + "</div></div>", na.addClass("mbsc-lv-handle-" + Ya));
                    Pa.on("orientationchange resize", O);
                    O();
                    na.on("touchstart mousedown", ".mbsc-lv-item", D).on("touchmove", ".mbsc-lv-item", L).on("touchend touchcancel", ".mbsc-lv-item", t);
                    Wa.addEventListener &&
                        Wa.addEventListener("click", function(a) {
                            if (nb) {
                                a.stopPropagation();
                                a.preventDefault();
                                nb = false
                            }
                        }, !0);
                    na.on("touchstart mousedown", ".mbsc-lv-ic-m", function(a) {
                        if (!mb) {
                            a.stopPropagation();
                            a.preventDefault()
                        }
                        Tb = o(a, "X");
                        Ub = o(a, "Y")
                    }).on("touchend mouseup", ".mbsc-lv-ic-m", function(a) {
                        if (!mb) {
                            a.type === "touchend" && H.preventClick();
                            k && !g(this).hasClass("mbsc-lv-ic-disabled") && Math.abs(o(a, "X") - Tb) < 10 && Math.abs(o(a, "Y") - Ub) < 10 && M((ka < 0 ? Aa.rightMenu : Aa.leftMenu)[g(this).index()], db, fa)
                        }
                    });
                    cc = g(".mbsc-lv-sl-c",
                        na).append(Ra.addClass("mbsc-lv-sl-curr")).attr("data-ref", C++);
                    wa = Ra;
                    gb = na;
                    wb = '<li class="mbsc-lv-item mbsc-lv-back">' + X.backText + '<div class="mbsc-lv-arr mbsc-lv-ic mbsc-ic ' + X.leftArrowClass + '"></div></li>';
                    Ob = '<div class="mbsc-lv-arr mbsc-lv-ic mbsc-ic ' + X.rightArrowClass + '"></div>';
                    ca(Ra);
                    ec = 0;
                    Ab = X.itemGroups || {};
                    Ab.defaults = {
                        swipeleft: X.swipeleft,
                        swiperight: X.swiperight,
                        stages: X.stages,
                        actions: X.actions,
                        actionsWidth: X.actionsWidth
                    };
                    g.each(Ab, function(a, c) {
                        c.swipe = c.swipe !== b ? c.swipe : X.swipe;
                        c.stages = c.stages || [];
                        ja(c.stages, 1, true);
                        ja(c.stages.left, 1);
                        ja(c.stages.right, -1);
                        if (c.stages.left || c.stages.right) c.stages = [].concat(c.stages.left || [], c.stages.right || []);
                        Sa = false;
                        if (!c.stages.length) {
                            c.swipeleft && c.stages.push({
                                percent: -30,
                                action: c.swipeleft
                            });
                            c.swiperight && c.stages.push({
                                percent: 30,
                                action: c.swiperight
                            })
                        }
                        g.each(c.stages, function(a, b) {
                            if (b.percent === 0) {
                                Sa = true;
                                return false
                            }
                        });
                        Sa || c.stages.push({
                            percent: 0
                        });
                        c.stages.sort(function(a, b) {
                            return a.percent - b.percent
                        });
                        g.each(c.stages,
                            function(a, b) {
                                if (b.percent === 0) {
                                    c.start = a;
                                    return false
                                }
                            });
                        if (Sa) c.left = c.right = c.stages[c.start];
                        else {
                            c.left = c.stages[c.start - 1] || {};
                            c.right = c.stages[c.start + 1] || {}
                        }
                        if (c.actions) {
                            c.leftMenu = c.actions.left || c.actions;
                            c.rightMenu = c.actions.right || c.leftMenu;
                            i = e = "";
                            for (d = 0; d < c.leftMenu.length; d++) e = e + ("<div " + (c.leftMenu[d].color ? 'style="background-color: ' + c.leftMenu[d].color + '"' : "") + ' class="mbsc-lv-ic-m mbsc-lv-ic mbsc-ic mbsc-ic-' + c.leftMenu[d].icon + '">' + (c.leftMenu[d].text || "") + "</div>");
                            for (d =
                                0; d < c.rightMenu.length; ++d) i = i + ("<div " + (c.rightMenu[d].color ? 'style="background-color: ' + c.rightMenu[d].color + '"' : "") + ' class="mbsc-lv-ic-m mbsc-lv-ic mbsc-ic mbsc-ic-' + c.rightMenu[d].icon + '">' + (c.rightMenu[d].text || "") + "</div>");
                            if (c.actions.left) c.swipe = c.actions.right ? c.swipe : "right";
                            if (c.actions.right) c.swipe = c.actions.left ? c.swipe : "left";
                            c.icons = '<div class="mbsc-lv-multi mbsc-lv-multi-ic-left">' + e + '</div><div class="mbsc-lv-multi mbsc-lv-multi-ic-right">' + i + "</div>"
                        }
                    });
                    X.fixedHeader && (bb = g('<div class="mbsc-lv-fixed-header"></div>'),
                        xa = g(".mbsc-lv-gr-title", Ra), Ma ? (Pa.before(bb), bb.addClass("mbsc-lv-fixed-header-ctx mbsc-lv-" + X.theme + (X.baseTheme ? " mbsc-lv-" + X.baseTheme : ""))) : na.prepend(bb), Pa.on("scroll.mbsc-lv touchmove.mbsc-lv", function() {
                            if (Za || !ma) {
                                var a = g(this).scrollTop(),
                                    b = Ra.offset().top;
                                xa.each(function(c, d) {
                                    if (g(d).offset().top - (Ma ? b : 0) < a) xb = c
                                });
                                Kb = xa[xb];
                                b < (Ma ? Pa.offset().top : a) && a < (Ma ? Ra[0].scrollHeight : b + Ra.height()) ? bb.empty().append(g(Kb).clone()).show() : bb.hide()
                            }
                        }));
                    X.rtl && na.addClass("mbsc-lv-rtl");
                    X.hover &&
                        (sb = X.hover.time || 200, Da = X.hover.timeout || 200, Pb = X.hover.direction || X.hover || "right", na.on("mouseenter.mbsc-lv", ".mbsc-lv-item", function() {
                            if (!ab || ab[0] != this) {
                                F();
                                ab = g(this);
                                if (Ab[ab.attr("data-type") || "defaults"].actions) Nb = setTimeout(function() {
                                    if (ob) ab = null;
                                    else {
                                        za = true;
                                        W.openActions(ab, Pb, sb, false)
                                    }
                                }, Da)
                            }
                        }).on("mouseleave.mbsc-lv", F));
                    Ra.is("[mbsc-enhance]") && (yb = !0, Ra.removeAttr("mbsc-enhance"), na.attr("mbsc-enhance", ""));
                    na.trigger("mbsc-enhance", [{
                        theme: X.theme,
                        lang: X.lang
                    }]);
                    ta("onInit")
                };
            W.destroy = function() {
                gb.append(wa);
                Ma && bb && bb.remove();
                yb && Ra.attr("mbsc-enhance", "");
                na.find(".mbsc-lv-txt,.mbsc-lv-img").removeClass("mbsc-lv-txt mbsc-lv-img");
                na.find("ul,ol").removeClass("mbsc-lv mbsc-lv-v mbsc-lv-root mbsc-lv-sl-curr").find("li").removeClass("mbsc-lv-gr-title mbsc-lv-item mbsc-lv-item-enhanced mbsc-lv-parent mbsc-lv-img-left mbsc-lv-img-right mbsc-lv-item-ic-left mbsc-lv-item-ic-right").removeAttr("data-ref");
                g(".mbsc-lv-back,.mbsc-lv-handle-c,.mbsc-lv-arr,.mbsc-lv-item-ic",
                    na).remove();
                Ra.insertAfter(na);
                na.remove();
                ya.remove();
                Pa.off(".mbsc-lv").off("orientationchange resize", O);
                W._destroy()
            };
            var Sb, lc = [],
                Jb = [],
                gc = [],
                Qb = 0;
            W.startActionTrack = function() {
                Qb || (gc = []);
                Qb++
            };
            W.endActionTrack = function() {
                Qb--;
                Qb || Jb.push(gc)
            };
            W.addUndoAction = function(a, b) {
                var c = {
                    action: a,
                    async: b
                };
                Qb ? gc.push(c) : (Jb.push([c]), Jb.length > X.undoLimit && Jb.shift())
            };
            W.undo = function() {
                function a() {
                    0 > d ? (Sb = !1, b()) : (c = f[d], d--, c.async ? c.action(a) : (c.action(), a()))
                }

                function b() {
                    if (f = lc.shift()) Sb = !0,
                        d = f.length - 1, a()
                }
                var c, d, f;
                Jb.length && lc.push(Jb.pop());
                Sb || b()
            };
            X = W.settings;
            ta = W.trigger;
            W.init(n)
        };
        l.ListView.prototype = {
            _class: "listview",
            _hasDef: !0,
            _hasTheme: !0,
            _hasLang: !0,
            _defaults: {
                context: "body",
                actionsWidth: 90,
                sortDelay: 250,
                undoLimit: 10,
                swipe: !0,
                quickSwipe: !0,
                animateIcons: !0,
                animation: !0,
                revert: !0,
                vibrate: !0,
                handleClass: "",
                handleMarkup: '<div class="mbsc-lv-handle-bar mbsc-lv-handle"></div><div class="mbsc-lv-handle-bar mbsc-lv-handle"></div><div class="mbsc-lv-handle-bar mbsc-lv-handle"></div>',
                leftArrowClass: "mbsc-ic-arrow-left4",
                rightArrowClass: "mbsc-ic-arrow-right4",
                backText: "Back",
                undoText: "Undo",
                stages: []
            }
        };
        a.themes.listview.mobiscroll = {
            leftArrowClass: "mbsc-ic-arrow-left5",
            rightArrowClass: "mbsc-ic-arrow-right5"
        };
        a.presetShort("listview", "ListView")
    })(window, document);
    (function() {
        var h = s,
            e = h.$;
        h.themes.listview.material = {
            leftArrowClass: "mbsc-ic-material-keyboard-arrow-left",
            rightArrowClass: "mbsc-ic-material-keyboard-arrow-right",
            onItemActivate: function(b) {
                h.themes.material.addRipple(e(b.target),
                    b.domEvent)
            },
            onItemDeactivate: function() {
                h.themes.material.removeRipple()
            },
            onSlideStart: function(b) {
                e(".mbsc-ripple", b.target).remove()
            },
            onSortStart: function(b) {
                e(".mbsc-ripple", b.target).remove()
            }
        }
    })();
    (function(h) {
        var e, b = function() {},
            k = s,
            a = k.$,
            g = k.util,
            d = g.getCoord,
            l = g.testTouch;
        k.classes.Form = function(H, h) {
            function q(b) {
                var c = {},
                    d = b[0],
                    f = b.parent(),
                    e = b.attr("data-password-toggle"),
                    i = b.attr("data-icon-show") || "eye",
                    k = b.attr("data-icon-hide") || "eye-blocked";
                e && (c.right = "password" == d.type ? i : k);
                g.addIcon(b,
                    c);
                e && j.tap(f.find(".mbsc-right-ic"), function() {
                    if (d.type == "text") {
                        d.type = "password";
                        a(this).addClass("mbsc-ic-" + i).removeClass("mbsc-ic-" + k)
                    } else {
                        d.type = "text";
                        a(this).removeClass("mbsc-ic-" + i).addClass("mbsc-ic-" + k)
                    }
                })
            }

            function o() {
                if (!a(this).hasClass("mbsc-textarea-scroll")) {
                    var b = this.offsetHeight + (this.scrollHeight - this.offsetHeight);
                    this.scrollTop = 0;
                    this.style.height = b + "px"
                }
            }

            function u(b) {
                var c, d;
                if (b.offsetHeight && (b.style.height = "", c = b.scrollHeight - b.offsetHeight, c = b.offsetHeight + (0 < c ? c :
                        0), d = Math.round(c / 24), 10 < d ? (b.scrollTop = c, c = 240 + (c - 24 * d), a(b).addClass("mbsc-textarea-scroll")) : a(b).removeClass("mbsc-textarea-scroll"), c)) b.style.height = c + "px"
            }

            function G() {
                clearTimeout(E);
                E = setTimeout(function() {
                    a("textarea.mbsc-control", I).each(function() {
                        u(this)
                    })
                }, 100)
            }

            function C(a) {
                return !(!a.id || !k.instances[a.id])
            }
            var m, f, E, c, I = a(H),
                j = this;
            k.classes.Base.call(this, H, h, !0);
            j._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            j.refresh = function() {
                a("input,select,textarea,progress,button", I).each(function() {
                    function b() {
                        a("input", w).val(-1 != i.selectedIndex ? i.options[i.selectedIndex].text : "")
                    }
                    var m, H, G, t, i = this,
                        p = a(i),
                        w = p.parent();
                    m = p.attr("data-role");
                    var h = p.attr("type") || i.nodeName.toLowerCase();
                    p.hasClass("mbsc-control") || ("button" != h && "submit" != h ? w : p).prepend(j._processItem(a,
                        0.2));
                    if ("false" != p.attr("data-enhance") && s.running) {
                        if (!p.hasClass("mbsc-control")) switch (/(switch|range|segmented|stepper)/.test(m) && (h = m), "button" != h && "submit" != h && "segmented" != h && (w.find("label").addClass("mbsc-label"), w.contents().filter(function() {
                            return 3 == this.nodeType && this.nodeValue && /\S/.test(this.nodeValue)
                        }).each(function() {
                            a('<span class="mbsc-label"></span>').insertAfter(this).append(this)
                        })), p.addClass("mbsc-control"), h) {
                            case "button":
                            case "submit":
                                m = p.attr("data-icon");
                                p.addClass("mbsc-btn");
                                m && (p.prepend('<span class="mbsc-btn-ic mbsc-ic mbsc-ic-' + m + '"></span>'), "" === p.text() && p.addClass("mbsc-btn-icon-only"));
                                break;
                            case "switch":
                                C(i) || new k.classes.Switch(i, {
                                    theme: f.theme,
                                    onText: f.onText,
                                    offText: f.offText,
                                    stopProp: f.stopProp
                                });
                                break;
                            case "checkbox":
                                w.prepend(p).addClass("mbsc-checkbox");
                                p.after('<span class="mbsc-checkbox-box"></span>');
                                break;
                            case "range":
                                !w.hasClass("mbsc-slider") && !C(i) && new k.classes.Slider(i, {
                                    theme: f.theme,
                                    stopProp: f.stopProp
                                });
                                break;
                            case "progress":
                                C(i) || new k.classes.Progress(i, {
                                    theme: f.theme
                                });
                                break;
                            case "radio":
                                w.addClass("mbsc-radio");
                                p.after('<span class="mbsc-radio-box"><span></span></span>');
                                break;
                            case "select":
                            case "select-one":
                            case "select-multiple":
                                m = p.prev().is("input.mbsc-control") ? p.prev() : a('<input tabindex="-1" type="text" class="mbsc-control mbsc-control-ev" readonly>');
                                q(p);
                                w.addClass("mbsc-input mbsc-select");
                                p.after(m);
                                m.after('<span class="mbsc-select-ic mbsc-ic mbsc-ic-arrow-down5"></span>');
                                break;
                            case "textarea":
                                q(p);
                                w.addClass("mbsc-input mbsc-textarea");
                                break;
                            case "segmented":
                                var v, F;
                                p.parent().hasClass("mbsc-segmented-item") || (F = a('<div class="mbsc-segmented"></div>'), w.after(F), a('input[name="' + p.attr("name") + '"]', I).each(function(b, c) {
                                    v = a(c).parent();
                                    v.addClass("mbsc-segmented-item").append('<span class="mbsc-segmented-content">' + (a(c).attr("data-icon") ? ' <span class="mbsc-ic mbsc-ic-' + a(c).attr("data-icon") + '"></span> ' : "") + (v.text() || "") + "</span>");
                                    v.contents().filter(function() {
                                        return this.nodeType === 3
                                    }).remove();
                                    F.append(v)
                                }));
                                break;
                            case "stepper":
                                C(i) ||
                                    new k.classes.Stepper(i, {
                                        form: j
                                    });
                                break;
                            case "hidden":
                                break;
                            default:
                                q(p), w.addClass("mbsc-input")
                        }
                        if (!p.hasClass("mbsc-control-ev")) {
                            /select/.test(h) && !p.hasClass("mbsc-comp") && (p.on("change.mbsc-form", b), b());
                            if ("textarea" == h) p.on("keydown.mbsc-form input.mbsc-form", function() {
                                clearTimeout(E);
                                E = setTimeout(function() {
                                    u(i)
                                }, 100)
                            }).on("scroll.mbsc-form", o);
                            p.addClass("mbsc-control-ev").on("touchstart.mbsc-form mousedown.mbsc-form", function(b) {
                                if (l(b, this)) {
                                    G = d(b, "X");
                                    t = d(b, "Y");
                                    e && e.removeClass("mbsc-active");
                                    if (!i.disabled) {
                                        H = true;
                                        e = a(this);
                                        a(this).addClass("mbsc-active");
                                        c("onControlActivate", {
                                            target: this,
                                            domEvent: b
                                        })
                                    }
                                }
                            }).on("touchmove.mbsc-form mousemove.mbsc-form", function(a) {
                                if (H && Math.abs(d(a, "X") - G) > 9 || Math.abs(d(a, "Y") - t) > 9) {
                                    p.removeClass("mbsc-active");
                                    c("onControlDeactivate", {
                                        target: p[0],
                                        domEvent: a
                                    });
                                    H = false
                                }
                            }).on("touchend.mbsc-form touchcancel.mbsc-form mouseleave.mbsc-form mouseup.mbsc-form", function(a) {
                                if (H && a.type == "touchend" && !i.readOnly) {
                                    i.focus();
                                    /(button|submit|checkbox|switch|radio)/.test(h) &&
                                        a.preventDefault();
                                    if (!/select/.test(h)) {
                                        var b = (a.originalEvent || a).changedTouches[0],
                                            d = document.createEvent("MouseEvents");
                                        d.initMouseEvent("click", true, true, window, 1, b.screenX, b.screenY, b.clientX, b.clientY, false, false, false, false, 0, null);
                                        d.tap = true;
                                        i.dispatchEvent(d);
                                        g.preventClick()
                                    }
                                }
                                H && setTimeout(function() {
                                    p.removeClass("mbsc-active");
                                    c("onControlDeactivate", {
                                        target: p[0],
                                        domEvent: a
                                    })
                                }, 100);
                                H = false;
                                e = null
                            })
                        }
                    }
                });
                G()
            };
            j.init = function(c) {
                j._init(c);
                k.themes.form[f.theme] || (f.theme = "mobiscroll");
                m = "mbsc-form mbsc-" + f.theme + (f.baseTheme ? " mbsc-" + f.baseTheme : "") + (f.rtl ? " mbsc-rtl" : " mbsc-ltr");
                I.hasClass("mbsc-form") || I.addClass(m).on("touchstart", b).show();
                a(window).on("resize orientationchange", G);
                j.refresh();
                j.trigger("onInit")
            };
            j.destroy = function() {
                I.removeClass(m).off("touchstart", b);
                a(window).off("resize orientationchange", G);
                a(".mbsc-control", I).off(".mbsc-form").removeClass("mbsc-control-ev");
                j._destroy();
                a(".mbsc-progress progress", I).mobiscroll("destroy");
                a(".mbsc-slider input", I).mobiscroll("destroy");
                a(".mbsc-stepper input", I).mobiscroll("destroy");
                a(".mbsc-switch input", I).mobiscroll("destroy")
            };
            f = j.settings;
            c = j.trigger;
            j.init(h)
        };
        k.classes.Form.prototype = {
            _hasDef: !0,
            _hasTheme: !0,
            _hasLang: !0,
            _class: "form",
            _defaults: {
                tap: !0,
                stopProp: !0,
                lang: "en"
            }
        };
        k.themes.form.mobiscroll = {};
        k.presetShort("form", "Form");
        k.classes.Stepper = function(b, e) {
            function g(c) {
                32 == c.keyCode && (c.preventDefault(), !L && !b.disabled && (j = a(this).addClass("mbsc-active"), E(c)))
            }

            function o(a) {
                L && (a.preventDefault(), c(!0))
            }

            function u(c) {
                if (l(c,
                        this) && !b.disabled && s.running && (j = a(this).addClass("mbsc-active").trigger("focus"), V && V.trigger("onControlActivate", {
                        target: j[0],
                        domEvent: c
                    }), E(c), "mousedown" === c.type)) a(document).on("mousemove", C).on("mouseup", G)
            }

            function G(b) {
                L && (b.preventDefault(), c(!0, b), "mouseup" === b.type && a(document).off("mousemove", C).off("mouseup", G))
            }

            function C(a) {
                L && (T = d(a, "X"), v = d(a, "Y"), i = T - Q, p = v - y, (7 < Math.abs(i) || 7 < Math.abs(p)) && c())
            }

            function m() {
                var c;
                b.disabled || (c = parseFloat(a(this).val()), f(isNaN(c) ? P : c))
            }

            function f(a,
                b, c) {
                ba = P;
                b === h && (b = !0);
                c === h && (c = b);
                P = a !== h ? Math.min(O, Math.max(Math.round(a / M) * M, A)) : Math.min(O, Math.max(P + (j.hasClass("mbsc-stepper-minus") ? -M : M), A));
                t = !0;
                D.removeClass("mbsc-step-disabled");
                b && S.val(P);
                P == A ? K.addClass("mbsc-step-disabled") : P == O && n.addClass("mbsc-step-disabled");
                P !== ba && c && S.trigger("change")
            }

            function E(a) {
                L || (L = !0, t = !1, Q = d(a, "X"), y = d(a, "Y"), clearInterval(F), clearTimeout(F), F = setTimeout(function() {
                    f();
                    F = setInterval(function() {
                        f()
                    }, 150)
                }, 300))
            }

            function c(a, b) {
                clearInterval(F);
                clearTimeout(F);
                !t && a && f();
                t = L = !1;
                j.removeClass("mbsc-active");
                V && setTimeout(function() {
                    V.trigger("onControlDeactivate", {
                        target: j[0],
                        domEvent: b
                    })
                }, 100)
            }

            function I(a, b) {
                var c = S.attr(a);
                return c === h || "" === c ? b : +c
            }
            var j, n, K, D, L, t, i, p, w, T, v, F, O, A, M, R, Q, y, P, Y = this,
                S = a(b),
                J = S.hasClass("mbsc-stepper-ready"),
                Z = J ? S.closest(".mbsc-stepper-cont") : S.parent(),
                ba = P,
                V = e.form;
            k.classes.Base.call(this, b, e, !0);
            Y._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b =
                    void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            Y.getVal = function() {
                var a = parseFloat(S.val()),
                    a = isNaN(a) ? P : a;
                return Math.min(O, Math.max(Math.round(a / M) * M, A))
            };
            Y.setVal = function(a, b, c) {
                a = parseFloat(a);
                f(isNaN(a) ? P : a, b, c)
            };
            Y.init = function(c) {
                Y._init(c);
                R = Y.settings;
                A = c.min === h ? I("min", R.min) : c.min;
                O = c.max === h ? I("max", R.max) : c.max;
                M = c.step === h ? I("step", R.step) : c.step;
                w = S.attr("data-val") ||
                    R.val;
                P = Math.min(O, Math.max(Math.round(+b.value / M) * M || 0, A));
                J || Z.addClass("mbsc-stepper-cont").append('<span class="mbsc-segmented mbsc-stepper"></span>').find(".mbsc-stepper").append('<span class="mbsc-segmented-item mbsc-stepper-control mbsc-stepper-minus ' + (P == A ? "mbsc-step-disabled" : "") + '"  tabindex="0"><span class="mbsc-segmented-content"><span class="mbsc-ic mbsc-ic-minus"></span></span></span>').append('<span class="mbsc-segmented-item mbsc-stepper-control mbsc-stepper-plus ' + (P == O ? "mbsc-step-disabled" :
                    "") + '"  tabindex="0"><span class="mbsc-segmented-content"> <span class="mbsc-ic mbsc-ic-plus"></span> </span></span>').prepend(S);
                K = a(".mbsc-stepper-minus", Z);
                n = a(".mbsc-stepper-plus", Z);
                J || ("left" == w ? (Z.addClass("mbsc-stepper-val-left"), S.after('<span class="mbsc-segmented-item"><span class="mbsc-segmented-content"></span></span>')) : "right" == w ? (Z.addClass("mbsc-stepper-val-right"), n.after('<span class="mbsc-segmented-item"><span class="mbsc-segmented-content"></span></span>')) : K.after('<span class="mbsc-segmented-item"><span class="mbsc-segmented-content mbsc-stepper-val"></span></span>'));
                S.val(P).attr("data-role", "stepper").attr("min", A).attr("max", O).attr("step", M).on("change", m);
                D = a(".mbsc-stepper-control", Z).on("keydown", g).on("keyup", o).on("mousedown touchstart", u).on("touchmove", C).on("touchend touchcancel", G);
                S.addClass("mbsc-stepper-ready mbsc-control");
                S.hasClass("mbsc-control") || ("button" != type && "submit" != type ? Z : S).prepend(Y._processItem(a, 0.2))
            };
            Y.destroy = function() {
                S.removeClass("mbsc-control").off("change", m);
                D.off("keydown", g).off("keyup", o).off("mousedown touchstart",
                    u).off("touchmove", C).off("touchend touchcancel", G);
                Y._destroy()
            };
            Y.init(e)
        };
        k.classes.Stepper.prototype = {
            _class: "stepper",
            _defaults: {
                min: 0,
                max: 100,
                step: 1
            }
        };
        k.presetShort("stepper", "Stepper");
        k.classes.Switch = function(b, d) {
            var e, g, l, h = this,
                d = d || {};
            a.extend(d, {
                changeEvent: "click",
                min: 0,
                max: 1,
                step: 1,
                live: !1,
                round: !1,
                handle: !1,
                highlight: !1
            });
            k.classes.Slider.call(this, b, d, !0);
            h._readValue = function() {
                return b.checked ? 1 : 0
            };
            h._fillValue = function(a, b, d) {
                e.prop("checked", !!a);
                d && e.trigger("change")
            };
            h._onTap =
                function(a) {
                    h._setVal(a ? 0 : 1)
                };
            h.__onInit = function() {
                l = h.settings;
                e = a(b);
                g = e.parent();
                g.prepend(e);
                e.attr("data-role", "switch").after('<span class="mbsc-progress-cont mbsc-switch-track"><span class="mbsc-progress-track mbsc-progress-anim"><span class="mbsc-slider-handle-cont"><span class="mbsc-slider-handle mbsc-switch-handle" data-index="0"><span class="mbsc-switch-txt-off">' + l.offText + '</span><span class="mbsc-switch-txt-on">' + l.onText + "</span></span></span></span></span>");
                h._$track = g.find(".mbsc-progress-track")
            };
            h.getVal = function() {
                return b.checked
            };
            h.setVal = function(a, b, d) {
                h._setVal(a ? 1 : 0, b, d)
            };
            h.init(d)
        };
        k.classes.Switch.prototype = {
            _class: "switch",
            _css: "mbsc-switch",
            _hasTheme: !0,
            _hasLang: !0,
            _defaults: {
                stopProp: !0,
                offText: "Off",
                onText: "On"
            }
        };
        k.presetShort("switch", "Switch");
        a(function() {
            a("[mbsc-enhance]").each(function() {
                a(this).mobiscroll().form()
            });
            a(document).on("mbsc-enhance", function(b, d) {
                a(b.target).is("[mbsc-enhance]") ? a(b.target).mobiscroll().form(d) : a("[mbsc-enhance]", b.target).each(function() {
                    a(this).mobiscroll().form(d)
                })
            });
            a(document).on("mbsc-refresh", function(b) {
                a(b.target).is("[mbsc-enhance]") ? a(b.target).mobiscroll("refresh") : a("[mbsc-enhance]", b.target).each(function() {
                    a(this).mobiscroll("refresh")
                })
            })
        })
    })();
    s.themes.form["android-holo"] = {};
    s.themes.form.wp = {};
    (function() {
        var h = s.$;
        s.themes.form.material = {
            onControlActivate: function(e) {
                var b, k = h(e.target);
                if ("button" == k[0].type || "submit" == k[0].type) b = k;
                "segmented" == k.attr("data-role") && (b = k.next());
                k.hasClass("mbsc-stepper-control") && !k.hasClass("mbsc-step-disabled") &&
                    (b = k.find(".mbsc-segmented-content"));
                b && s.themes.material.addRipple(b, e.domEvent)
            },
            onControlDeactivate: function() {
                s.themes.material.removeRipple()
            }
        }
    })();
    s.themes.form.ios = {};
    (function(h) {
        var e = s,
            b = e.$,
            k = e.util.isNumeric,
            a = function() {},
            g = e.classes;
        g.Numpad = function(a, e, H) {
            function x(e) {
                var g, k = (g = c.validate.call(a, {
                    values: j.slice(0),
                    variables: T
                }, i) || []) && g.disabled || [];
                i._isValid = g.invalid ? !1 : !0;
                i._tempValue = c.formatValue.call(a, j.slice(0), T, i);
                E = j.length;
                n = g.length || D;
                if (i._isVisible && s.running) {
                    b(".mbsc-np-ph",
                        C).each(function(a) {
                        b(this).html("ltr" == c.fill ? a >= E ? f : I || j[a] : a >= D - n ? a + E < D ? f : I || j[a + E - D] : "")
                    });
                    b(".mbsc-np-cph", C).each(function() {
                        b(this).html(T[b(this).attr("data-var")] || b(this).attr("data-ph"))
                    });
                    if (E === D)
                        for (g = 0; 9 >= g; g++) k.push(g);
                    b(".mbsc-np-btn", C).removeClass(m);
                    for (g = 0; g < k.length; g++) b('.mbsc-np-btn[data-val="' + k[g] + '"]', C).addClass(m);
                    i._isValid ? b(".mbsc-fr-btn-s .mbsc-fr-btn", C).removeClass(m) : b(".mbsc-fr-btn-s .mbsc-fr-btn", C).addClass(m);
                    i.live && (i._hasValue = e || i._hasValue, q(e, !1, e),
                        e && K("onSet", {
                            valueText: i._value
                        }))
                }
            }

            function q(a, c, d, f) {
                c && x();
                f || (L = j.slice(0), v = b.extend({}, T), p = w.slice(0), i._value = i._hasValue ? i._tempValue : null);
                a && (i._isInput && t.val(i._hasValue && i._isValid ? i._value : ""), K("onFill", {
                    valueText: i._hasValue ? i._tempValue : "",
                    change: d
                }), d && (i._preventChange = !0, t.trigger("change")))
            }

            function o(a) {
                var b, c = a || [],
                    d = [];
                w = [];
                T = {};
                for (a = 0; a < c.length; a++) /:/.test(c[a]) ? (b = c[a].split(":"), T[b[0]] = b[1], w.push(b[0])) : (d.push(c[a]), w.push("digit"));
                return d
            }

            function u(a, b) {
                if (!(!E &&
                        !b && !c.allowLeadingZero || a.hasClass("mbsc-fr-btn-d") || a.hasClass("mbsc-np-btn-empty")) && E < D && s.running) w.push("digit"), j.push(b), x(!0)
            }

            function G() {
                var a, b, c = w.pop();
                if (E || "digit" !== c) {
                    if ("digit" !== c && T[c]) {
                        delete T[c];
                        b = w.slice(0);
                        w = [];
                        for (a = 0; a < b.length; a++) b[a] !== c && w.push(b[a])
                    } else j.pop();
                    x(!0)
                }
            }
            var C, m, f, E, c, I, j, n, K, D, L, t = b(a),
                i = this,
                p = [],
                w = [],
                T = {},
                v = {},
                F = {
                    48: 0,
                    49: 1,
                    50: 2,
                    51: 3,
                    52: 4,
                    53: 5,
                    54: 6,
                    55: 7,
                    56: 8,
                    57: 9,
                    96: 0,
                    97: 1,
                    98: 2,
                    99: 3,
                    100: 4,
                    101: 5,
                    102: 6,
                    103: 7,
                    104: 8,
                    105: 9
                };
            g.Frame.call(this, a, e, !0);
            i.setVal =
                i._setVal = function(f, e, g, k) {
                    i._hasValue = null !== f && f !== h;
                    j = o(b.isArray(f) ? f.slice(0) : c.parseValue.call(a, f, i));
                    q(e, !0, g === h ? e : g, k)
                };
            i.getVal = i._getVal = function(a) {
                return i._hasValue || a ? i[a ? "_tempValue" : "_value"] : null
            };
            i.setArrayVal = i.setVal;
            i.getArrayVal = function(a) {
                return a ? j.slice(0) : i._hasValue ? L.slice(0) : null
            };
            i._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a *
                    "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            i._readValue = function() {
                var b = t.val() || "";
                "" !== b && (i._hasValue = !0);
                I ? (T = {}, w = [], j = []) : (T = i._hasValue ? v : {}, w = i._hasValue ? p : [], j = i._hasValue && L ? L.slice(0) : o(c.parseValue.call(a, b, i)), q(!1, !0))
            };
            i._fillValue = function() {
                i._hasValue = !0;
                q(!0, !1, !0)
            };
            i._generateContent = function() {
                var a, d, e, j = 1;
                a = "";
                var g;
                g = "" + ('<div class="mbsc-np-hdr"><div role="button" tabindex="0" aria-label="' +
                    c.deleteText + '" class="mbsc-np-del mbsc-fr-btn-e mbsc-ic mbsc-ic-' + c.deleteIcon + '"></div><div class="mbsc-np-dsp">');
                a = c.template.replace(/d/g, '<span class="mbsc-np-ph">' + f + "</span>").replace(/&#100;/g, "d");
                a = a.replace(/{([a-zA-Z0-9]*)\:?([a-zA-Z0-9\-\_]*)}/g, '<span class="mbsc-np-cph" data-var="$1" data-ph="$2">$2</span>');
                g = g + a + '</div></div><div class="mbsc-np-tbl-c mbsc-w-p"><div class="mbsc-np-tbl">';
                for (a = 0; 4 > a; a++) {
                    g += '<div class="mbsc-np-row">';
                    for (d = 0; 3 > d; d++) e = j, 10 == j || 12 == j ? e = "" : 11 == j &&
                        (e = 0), g = "" === e ? 10 == j && c.leftKey ? g + ('<div role="button" tabindex="0" class="mbsc-np-btn mbsc-np-btn-custom mbsc-fr-btn-e" ' + (c.leftKey.variable ? 'data-var="' + c.leftKey.variable + '"' : "") + ' data-val="' + c.leftKey.value + '" >' + c.leftKey.text + "</div>") : 12 == j && c.rightKey ? g + ('<div role="button" tabindex="0" class="mbsc-np-btn mbsc-np-btn-custom mbsc-fr-btn-e" ' + (c.rightKey.variable ? 'data-var="' + c.rightKey.variable + '"' : "") + ' data-val="' + c.rightKey.value + '" >' + c.rightKey.text + "</div>") : g + '<div class="mbsc-np-btn mbsc-np-btn-empty"></div>' :
                        g + ('<div tabindex="0" role="button" class="mbsc-np-btn mbsc-fr-btn-e" data-val="' + e + '">' + e + i._processItem(b, 0.2) + "</div>"), j++;
                    g += "</div>"
                }
                return g + "</div></div>"
            };
            i._markupReady = function() {
                C = i._markup;
                x()
            };
            i._attachEvents = function(a) {
                a.on("keydown", function(a) {
                    F[a.keyCode] !== h ? u(b('.mbsc-np-btn[data-val="' + F[a.keyCode] + '"]'), F[a.keyCode]) : 8 == a.keyCode && (a.preventDefault(), G())
                });
                i.tap(b(".mbsc-np-btn", a), function() {
                    var a = b(this);
                    if (a.hasClass("mbsc-np-btn-custom")) {
                        var c = a.attr("data-val"),
                            d = a.attr("data-var");
                        if (!a.hasClass("mbsc-fr-btn-d")) {
                            d && (a = d.split(":"), w.push(a[0]), T[a[0]] = a[1]);
                            if (c.length + E <= n)
                                for (a = 0; a < c.length; ++a) w.push("digit"), j.push(k(c[a]) ? +c[a] : c[a]);
                            x(!0)
                        }
                    } else u(a, +a.attr("data-val"))
                });
                i.tap(b(".mbsc-np-del", a), G)
            };
            i._processSettings = function() {
                c = i.settings;
                c.headerText = (c.headerText || "").replace("{value}", "");
                c.cssClass = (c.cssClass || "") + " mbsc-np";
                c.template = c.template.replace(/\\d/, "&#100;");
                f = c.placeholder;
                D = (c.template.match(/d/g) || []).length;
                m = "mbsc-fr-btn-d " + (c.disabledClass ||
                    "");
                I = c.mask;
                K = i.trigger;
                I && t.is("input") && t.attr("type", "password")
            };
            i._indexOf = function(a, b) {
                var c;
                for (c = 0; c < a.length; ++c)
                    if (a[c].toString() === b.toString()) return c;
                return -1
            };
            H || i.init(e)
        };
        g.Numpad.prototype = {
            _hasDef: !0,
            _hasTheme: !0,
            _hasLang: !0,
            _hasPreset: !0,
            _class: "numpad",
            _defaults: b.extend({}, g.Frame.prototype._defaults, {
                template: "dd.dd",
                placeholder: "0",
                deleteIcon: "backspace",
                allowLeadingZero: !1,
                fill: "rtl",
                deleteText: "Delete",
                decimalSeparator: ".",
                thousandsSeparator: ",",
                validate: a,
                parseValue: a,
                formatValue: function(a, e, g) {
                    var k, q = 1;
                    k = g.settings;
                    var g = k.placeholder,
                        o = k.template,
                        u = a.length,
                        h = o.length,
                        C = "";
                    for (k = 0; k < h; k++) "d" == o[h - k - 1] ? (C = q <= u ? a[u - q] + C : g + C, q++) : C = o[h - k - 1] + C;
                    b.each(e, function(a, b) {
                        C = C.replace("{" + a + "}", b)
                    });
                    return b("<div>" + C + "</div>").text()
                }
            })
        };
        e.themes.numpad = e.themes.frame;
        e.presetShort("numpad", "Numpad", !1)
    })();
    (function() {
        var h = s,
            e = h.$,
            b = {
                min: 0,
                max: 99.99,
                scale: 2,
                prefix: "",
                suffix: "",
                returnAffix: !1
            };
        h.presets.numpad.decimal = function(k) {
            function a(a) {
                var b;
                b = a.slice(0);
                for (a =
                    0; b.length;) a = 10 * a + b.shift();
                for (b = 0; b < l.scale; b++) a /= 10;
                return a
            }

            function g(b) {
                return a(b).toFixed(l.scale).replace(".", l.decimalSeparator).replace(/\B(?=(\d{3})+(?!\d))/g, l.thousandsSeparator)
            }
            var d = e.extend({}, k.settings),
                l = e.extend(k.settings, b, d);
            k.getVal = function(a) {
                a = k._getVal(a);
                return h.util.isNumeric(a) ? +a : a
            };
            return {
                template: l.prefix.replace(/d/g, "\\d") + Array((Math.floor(l.max) + "").length + 1).join("d") + (l.scale ? "." + Array(l.scale + 1).join("d") : "") + l.suffix.replace(/d/g, "\\d"),
                parseValue: function(a) {
                    var b,
                        d;
                    b = a || l.defaultValue;
                    a = [];
                    if (b && (d = (b + "").match(/\d+\.?\d*/g))) {
                        d = (+d[0]).toFixed(l.scale);
                        for (b = 0; b < d.length; b++) "." != d[b] && (+d[b] ? a.push(+d[b]) : a.length && a.push(0))
                    }
                    return a
                },
                formatValue: function(a) {
                    a = g(a);
                    return l.returnAffix ? l.prefix + a + l.suffix : a
                },
                validate: function(b) {
                    var b = b.values,
                        d = g(b),
                        q = a(b),
                        o = [];
                    !b.length && !l.allowLeadingZero && o.push(0);
                    k.isVisible() && e(".mbsc-np-dsp", k._markup).html(l.prefix + d + l.suffix);
                    return {
                        disabled: o,
                        invalid: q > l.max || q < l.min || (l.invalid ? -1 != k._indexOf(l.invalid, q) :
                            !1)
                    }
                }
            }
        }
    })();
    (function() {
        function h(a) {
            for (var b = 0, e = 1, k = 0; a.length;) 3 < b ? e = 3600 : 1 < b && (e = 60), k += a.pop() * e * (b % 2 ? 10 : 1), b++;
            return k
        }
        var e = s,
            b = e.$,
            k = ["h", "m", "s"],
            a = {
                min: 0,
                max: 362439,
                defaultValue: 0,
                hourTextShort: "h",
                minuteTextShort: "m",
                secTextShort: "s"
            };
        e.presets.numpad.timespan = function(g) {
            function d(a) {
                var d, e = "",
                    g = 3600;
                b(k).each(function(b, k) {
                    d = Math.floor(a / g);
                    a -= d * g;
                    g /= 60;
                    if (0 < d || "s" == k && !e) e = e + (e ? " " : "") + d + x[k]
                });
                return e
            }
            var l = b.extend({}, g.settings),
                H = b.extend(g.settings, a, l),
                x = {
                    h: H.hourTextShort.replace(/d/g,
                        "\\d"),
                    m: H.minuteTextShort.replace(/d/g, "\\d"),
                    s: H.secTextShort.replace(/d/g, "\\d")
                },
                l = 'd<span class="mbsc-np-sup mbsc-np-time">' + x.s + "</span>";
            9 < H.max && (l = "d" + l);
            99 < H.max && (l = '<span class="mbsc-np-ts-m">' + (639 < H.max ? "d" : "") + 'd</span><span class="mbsc-np-sup mbsc-np-time">' + x.m + "</span>" + l);
            6039 < H.max && (l = '<span class="mbsc-np-ts-h">' + (38439 < H.max ? "d" : "") + 'd</span><span class="mbsc-np-sup mbsc-np-time">' + x.h + "</span>" + l);
            g.setVal = function(a, b, k, l) {
                e.util.isNumeric(a) && (a = d(a));
                return g._setVal(a,
                    b, k, l)
            };
            g.getVal = function(a) {
                return g._hasValue || a ? h(g.getArrayVal(a)) : null
            };
            return {
                template: l,
                parseValue: function(a) {
                    var e, g = a || d(H.defaultValue),
                        l = [];
                    g && b(k).each(function(a, b) {
                        (e = RegExp("(\\d+)" + x[b], "gi").exec(g)) ? (e = +e[1], 9 < e ? (l.push(Math.floor(e / 10)), l.push(e % 10)) : (l.length && l.push(0), (e || l.length) && l.push(e))) : l.length && (l.push(0), l.push(0))
                    });
                    return l
                },
                formatValue: function(a) {
                    return d(h(a))
                },
                validate: function(a) {
                    var a = a.values,
                        b = h(a.slice(0)),
                        d = [];
                    a.length || d.push(0);
                    return {
                        disabled: d,
                        invalid: b >
                            H.max || b < H.min || (H.invalid ? -1 != g._indexOf(H.invalid, +b) : !1)
                    }
                }
            }
        }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = {
                timeFormat: "hh:ii A",
                amText: "am",
                pmText: "pm"
            };
        h.presets.numpad.time = function(k) {
            function a(a, b) {
                var d, f = "";
                for (d = 0; d < a.length; ++d) f += a[d] + (d % 2 == (1 == a.length % 2 ? 0 : 1) && d != a.length - 1 ? ":" : "");
                e.each(b, function(a, b) {
                    f += " " + b
                });
                return f
            }
            var g = e.extend({}, k.settings),
                d = e.extend(k.settings, b, g),
                l = d.timeFormat.split(":"),
                h = d.timeFormat.match(/a/i),
                x = h ? "a" == h[0] ? d.amText : d.amText.toUpperCase() : "",
                q = h ? "a" == h[0] ? d.pmText :
                d.pmText.toUpperCase() : "",
                o = 0,
                u = d.min ? "" + d.min.getHours() : "",
                G = d.max ? "" + d.max.getHours() : "",
                C = d.min ? "" + (10 > d.min.getMinutes() ? "0" + d.min.getMinutes() : d.min.getMinutes()) : "",
                m = d.max ? "" + (10 > d.max.getMinutes() ? "0" + d.max.getMinutes() : d.max.getMinutes()) : "",
                f = d.min ? "" + (10 > d.min.getSeconds() ? "0" + d.min.getSeconds() : d.min.getSeconds()) : "",
                E = d.max ? "" + (10 > d.max.getSeconds() ? "0" + d.max.getSeconds() : d.max.getSeconds()) : "";
            d.min && d.min.setFullYear(2014, 7, 20);
            d.max && d.max.setFullYear(2014, 7, 20);
            return {
                placeholder: "-",
                allowLeadingZero: !0,
                template: (3 == l.length ? "dd:dd:dd" : 2 == l.length ? "dd:dd" : "dd") + (h ? '<span class="mbsc-np-sup">{ampm:--}</span>' : ""),
                leftKey: h ? {
                    text: x,
                    variable: "ampm:" + x,
                    value: "00"
                } : {
                    text: ":00",
                    value: "00"
                },
                rightKey: h ? {
                    text: q,
                    variable: "ampm:" + q,
                    value: "00"
                } : {
                    text: ":30",
                    value: "30"
                },
                parseValue: function(a) {
                    var b, e = a || d.defaultValue,
                        f = [];
                    if (e) {
                        e += "";
                        if (b = e.match(/\d/g))
                            for (a = 0; a < b.length; a++) f.push(+b[a]);
                        h && f.push("ampm:" + (e.match(RegExp(d.pmText, "gi")) ? q : x))
                    }
                    return f
                },
                formatValue: function(b, d) {
                    return a(b,
                        d)
                },
                validate: function(b) {
                    var e = b.values,
                        b = a(e, b.variables),
                        g = 3 <= e.length ? new Date(2014, 7, 20, "" + e[0] + (0 === e.length % 2 ? e[1] : ""), "" + e[0 === e.length % 2 ? 2 : 1] + e[0 === e.length % 2 ? 3 : 2]) : "",
                        n, q, D, x, t, i, p = [];
                    o = n = 2 * l.length;
                    e.length || (h && (p.push(0), p.push(d.leftKey.value)), p.push(d.rightKey.value));
                    if (!h && (2 > n - e.length || 1 != e[0] && (2 < e[0] || 3 < e[1]) && 2 >= n - e.length)) p.push("30"), p.push("00");
                    if ((h ? 1 < e[0] || 2 < e[1] : 1 != e[0] && (2 < e[0] || 3 < e[1])) && e[0]) e.unshift(0), o = n - 1;
                    if (e.length == n)
                        for (n = 0; 9 >= n; ++n) p.push(n);
                    else if (1 == e.length &&
                        h && 1 == e[0] || e.length && 0 === e.length % 2 || !h && 2 == e[0] && 3 < e[1] && 1 == e.length % 2)
                        for (n = 6; 9 >= n; ++n) p.push(n);
                    D = void 0 !== e[1] ? "" + e[0] + e[1] : "";
                    x = +m == +(void 0 !== e[3] ? "" + e[2] + e[3] : 0);
                    if (d.invalid)
                        for (n = 0; n < d.invalid.length; ++n)
                            if (q = d.invalid[n].getHours(), t = d.invalid[n].getMinutes(), i = d.invalid[n].getSeconds(), q == +D)
                                if (2 == l.length && (10 > t ? 0 : +("" + t)[0]) == +e[2]) {
                                    p.push(10 > t ? t : +("" + t)[1]);
                                    break
                                } else if ((10 > i ? 0 : +("" + i)[0]) == +e[4]) {
                        p.push(10 > i ? i : +("" + i)[1]);
                        break
                    }
                    if (d.min || d.max) {
                        q = +u == +D;
                        t = (D = +G == +D) && x;
                        x = q && x;
                        if (0 ===
                            e.length) {
                            for (n = h ? 2 : 19 < u ? u[0] : 3; n <= (1 == u[0] ? 9 : u[0] - 1); ++n) p.push(n);
                            if (10 <= u && (p.push(0), 2 == u[0]))
                                for (n = 3; 9 >= n; ++n) p.push(n);
                            if (G && 10 > G || u && 10 <= u)
                                for (n = G && 10 > G ? +G[0] + 1 : 0; n < (u && 10 <= u ? u[0] : 10); ++n) p.push(n)
                        }
                        if (1 == e.length) {
                            if (0 === e[0])
                                for (n = 0; n < u[0]; ++n) p.push(n);
                            if (u && 0 !== e[0] && (h ? 1 == e[0] : 2 == e[0]))
                                for (n = h ? 3 : 4; 9 >= n; ++n) p.push(n);
                            if (e[0] == u[0])
                                for (n = 0; n < u[1]; ++n) p.push(n);
                            if (e[0] == G[0] && !h)
                                for (n = +G[1] + 1; 9 >= n; ++n) p.push(n)
                        }
                        if (2 == e.length && (q || D))
                            for (n = D ? +m[0] + 1 : 0; n < (q ? +C[0] : 10); ++n) p.push(n);
                        if (3 == e.length &&
                            (D && e[2] == m[0] || q && e[2] == C[0]))
                            for (n = D && e[2] == m[0] ? +m[1] + 1 : 0; n < (q && e[2] == C[0] ? +C[1] : 10); ++n) p.push(n);
                        if (4 == e.length && (x || t))
                            for (n = t ? +E[0] + 1 : 0; n < (x ? +f[0] : 10); ++n) p.push(n);
                        if (5 == e.length && (x && e[4] == f[0] || t && e[4] == E[0]))
                            for (n = t && e[4] == E[0] ? +E[1] + 1 : 0; n < (x && e[4] == f[0] ? +f[1] : 10); ++n) p.push(n)
                    }
                    return {
                        disabled: p,
                        length: o,
                        invalid: (h ? !RegExp("^(0?[1-9]|1[012])(:[0-5]\\d)?(:[0-5][0-9]) (?:" + d.amText + "|" + d.pmText + ")$", "i").test(b) : !/^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(b)) || (d.invalid ? -1 !=
                            k._indexOf(d.invalid, g) : !1) || !((d.min ? d.min <= g : 1) && (d.max ? g <= d.max : 1))
                    }
                }
            }
        }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = {
                dateOrder: "mdy",
                dateFormat: "mm/dd/yy",
                delimiter: "/"
            };
        h.presets.numpad.date = function(k) {
            function a(a) {
                return new Date(+("" + a[g] + a[g + 1] + a[g + 2] + a[g + 3]), +("" + a[d] + a[d + 1]) - 1, +("" + a[l] + a[l + 1]))
            }
            var g, d, l, H, x = [];
            H = e.extend({}, k.settings);
            var q = e.extend(k.settings, h.util.datetime.defaults, b, H),
                o = q.dateOrder,
                u = q.min ? "" + (q.getMonth(q.min) + 1) : 0,
                G = q.max ? "" + (q.getMonth(q.max) + 1) : 0,
                C = q.min ? "" + q.getDay(q.min) :
                0,
                m = q.max ? "" + q.getDay(q.max) : 0,
                f = q.min ? "" + q.getYear(q.min) : 0,
                E = q.max ? "" + q.getYear(q.max) : 0,
                o = o.replace(/y+/gi, "yyyy"),
                o = o.replace(/m+/gi, "mm"),
                o = o.replace(/d+/gi, "dd");
            g = o.toUpperCase().indexOf("Y");
            d = o.toUpperCase().indexOf("M");
            l = o.toUpperCase().indexOf("D");
            o = "";
            x.push({
                val: g,
                n: "yyyy"
            }, {
                val: d,
                n: "mm"
            }, {
                val: l,
                n: "dd"
            });
            x.sort(function(a, b) {
                return a.val - b.val
            });
            e.each(x, function(a, b) {
                o += b.n
            });
            g = o.indexOf("y");
            d = o.indexOf("m");
            l = o.indexOf("d");
            o = "";
            for (H = 0; 8 > H; ++H)
                if (o += "d", H + 1 == g || H + 1 == d || H + 1 == l) o +=
                    q.delimiter;
            k.getVal = function(b) {
                return k._hasValue || b ? a(k.getArrayVal(b)) : null
            };
            return {
                placeholder: "-",
                fill: "ltr",
                allowLeadingZero: !0,
                template: o,
                parseValue: function(a) {
                    var b, d = [];
                    b = a || q.defaultValue;
                    a = h.util.datetime.parseDate(q.dateFormat, b, q);
                    if (b)
                        for (b = 0; b < x.length; ++b) d = /m/i.test(x[b].n) ? d.concat(((9 > q.getMonth(a) ? "0" : "") + (q.getMonth(a) + 1)).split("")) : /d/i.test(x[b].n) ? d.concat(((10 > q.getDay(a) ? "0" : "") + q.getDay(a)).split("")) : d.concat((q.getYear(a) + "").split(""));
                    return d
                },
                formatValue: function(b) {
                    return h.util.datetime.formatDate(q.dateFormat,
                        a(b), q)
                },
                validate: function(b) {
                    var b = b.values,
                        e = a(b),
                        j, h, o, H, x = [],
                        t = void 0 !== b[g + 3] ? "" + b[g] + b[g + 1] + b[g + 2] + b[g + 3] : "",
                        i = void 0 !== b[d + 1] ? "" + b[d] + b[d + 1] : "",
                        p = void 0 !== b[l + 1] ? "" + b[l] + b[l + 1] : "",
                        w = "" + q.getMaxDayOfMonth(t || 2012, i - 1 || 0),
                        s = f === t && +u === +i,
                        v = E === t && +G === +i;
                    if (q.invalid)
                        for (j = 0; j < q.invalid.length; ++j) {
                            h = q.getYear(q.invalid[j]);
                            o = q.getMonth(q.invalid[j]);
                            H = q.getDay(q.invalid[j]);
                            if (h == +t && o + 1 == +i && (10 > H ? 0 : +("" + H)[0]) == +b[l]) {
                                x.push(10 > H ? H : +("" + H)[1]);
                                break
                            }
                            if (o + 1 == +i && H == +p && ("" + h).substring(0,
                                    3) == "" + b[g] + b[g + 1] + b[g + 2]) {
                                x.push(("" + h)[3]);
                                break
                            }
                            if (h == +t && H == +p && (10 > o ? 0 : +("" + (o + 1))[0]) == +b[d]) {
                                x.push(10 > o ? o : +("" + (o + 1))[1]);
                                break
                            }
                        }
                    if ("31" == p && (b.length == d || b.length == d + 1)) 1 != b[d] ? x.push(2, 4, 6, 9, 11) : x.push(1);
                    "30" == p && 0 === b[d] && b.length <= d + 1 && x.push(2);
                    if (b.length == d) {
                        for (j = E === t && 10 > +G ? 1 : 2; 9 >= j; ++j) x.push(j);
                        f === t && 10 <= +u && x.push(0)
                    }
                    if (b.length == d + 1) {
                        if (1 == b[d]) {
                            for (j = E === t ? +G[1] + 1 : 3; 9 >= j; ++j) x.push(j);
                            if (f == t)
                                for (j = 0; j < +u[1]; ++j) x.push(j)
                        }
                        if (0 === b[d] && (x.push(0), E === t || f === t))
                            for (j = E === t ?
                                +p > +m ? +G : +G + 1 : 0; j <= (f === t ? +u - 1 : 9); ++j) x.push(j)
                    }
                    if (b.length == l) {
                        for (j = v ? (10 < +m ? +m[0] : 0) + 1 : +w[0] + 1; 9 >= j; ++j) x.push(j);
                        if (s)
                            for (j = 0; j < (10 > +C ? 0 : C[0]); ++j) x.push(j)
                    }
                    if (b.length == l + 1) {
                        if (3 <= b[l] || "02" == i)
                            for (j = +w[1] + 1; 9 >= j; ++j) x.push(j);
                        if (v && +m[0] == b[l])
                            for (j = +m[1] + 1; 9 >= j; ++j) x.push(j);
                        if (s && C[0] == b[l])
                            for (j = 0; j < +C[1]; ++j) x.push(j);
                        if (0 === b[l] && (x.push(0), v || s))
                            for (j = v ? +m + 1 : 1; j <= (s ? +C - 1 : 9); ++j) x.push(j)
                    }
                    if (void 0 !== b[g + 2] && "02" == i && "29" == p)
                        for (h = +("" + b[g] + b[g + 1] + b[g + 2] + 0); h <= +("" + b[g] + b[g + 1] + b[g + 2] + 9); ++h) x.push(!(0 ===
                            h % 4 && 0 !== h % 100 || 0 === h % 400) ? h % 10 : "");
                    if (b.length == g) {
                        if (q.min)
                            for (j = 0; j < +f[0]; ++j) x.push(j);
                        if (q.max)
                            for (j = +E[0] + 1; 9 >= j; ++j) x.push(j);
                        x.push(0)
                    }
                    if (q.min || q.max)
                        for (h = 1; 4 > h; ++h)
                            if (b.length == g + h) {
                                if (b[g + h - 1] == +f[h - 1] && (3 == h ? b[g + h - 2] == +f[h - 2] : 1))
                                    for (j = 0; j < +f[h] + (3 == h && b[d + 1] && +u > +i ? 1 : 0); ++j) x.push(j);
                                if (b[g + h - 1] == +E[h - 1] && (3 == h ? b[g + h - 2] == +E[h - 2] : 1))
                                    for (j = +E[h] + (3 == h && +G < +i ? 0 : 1); 9 >= j; ++j) x.push(j)
                            }
                    return {
                        disabled: x,
                        invalid: !("Invalid Date" != e && (q.min ? q.min <= e : 1) && (q.max ? e <= q.max : 1)) || (q.invalid ? -1 != k._indexOf(q.invalid,
                            e) : !1)
                    }
                }
            }
        }
    })();
    (function(h, e, b) {
        function k(a, b) {
            return (a._array ? a._map[b] : a.getIndex(b)) || 0
        }

        function a(a, b, d) {
            var e = a.data;
            return b < a.min || b > a.max ? d : a._array ? a.circular ? l(e).get(b % a._length) : e[b] : l.isFunction(e) ? e(b) : ""
        }

        function g(a) {
            return l.isPlainObject(a) ? a.value !== b ? a.value : a.display : a
        }
        var d = s,
            l = d.$,
            H = l.extend,
            x = d.classes,
            q = d.util,
            o = q.getCoord,
            u = q.testTouch;
        d.presetShort("scroller", "Scroller", !1);
        x.Scroller = function(h, C, m) {
            function f(a) {
                var b = l(this).attr("data-index");
                a.stopPropagation();
                "mousedown" ===
                a.type && a.preventDefault();
                if (u(a, this) && !(l.isArray(B.readonly) ? B.readonly[b] : B.readonly))
                    if (M = l(this).addClass("mbsc-sc-btn-a"), J = o(a, "X"), Z = o(a, "Y"), Y = !0, S = !1, setTimeout(function() {
                            K(b, "inc" == M.attr("data-dir") ? 1 : -1)
                        }, 100), "mousedown" === a.type) l(e).on("mousemove", E).on("mouseup", c)
            }

            function E(a) {
                (7 < Math.abs(J - o(a, "X")) || 7 < Math.abs(Z - o(a, "Y"))) && D(!0)
            }

            function c(a) {
                D();
                a.preventDefault();
                "mouseup" === a.type && l(e).off("mousemove", E).off("mouseup", c)
            }

            function I(a) {
                var b = l(this).attr("data-index"),
                    c, d;
                38 == a.keyCode ? (c = !0, d = -1) : 40 == a.keyCode ? (c = !0, d = 1) : 32 == a.keyCode && (c = !0, n(b));
                c && (a.stopPropagation(), a.preventDefault(), d && !Y && (Y = !0, S = !1, K(b, d)))
            }

            function j() {
                D()
            }

            function n(c, d) {
                var e = $[c],
                    f = d || e._$markup.find('.mbsc-sc-itm[data-val="' + ba[c] + '"]'),
                    i = +f.attr("data-index"),
                    i = g(a(e, i, void 0)),
                    k = r._tempSelected[c],
                    j = q.isNumeric(e.multiple) ? e.multiple : Infinity;
                if (e.multiple && !e._disabled[i]) return k[i] !== b ? (f.removeClass(Q).removeAttr("aria-selected"), delete k[i]) : q.objectToArray(k).length < j && (f.addClass(Q).attr("aria-selected",
                    "true"), k[i] = i), !0
            }

            function K(a, b) {
                S || L(a, b);
                Y && s.running && (clearInterval(P), P = setInterval(function() {
                    L(a, b)
                }, B.delay))
            }

            function D(a) {
                clearInterval(P);
                S = a;
                Y = !1;
                M && M.removeClass("mbsc-sc-btn-a")
            }

            function L(a, b) {
                var c = $[a];
                F(c, a, c._current + b, 200, 1 == b ? 1 : 2)
            }

            function t(a, c, d) {
                var e = a._index - a._batch;
                a.data = a.data || [];
                a.key = a.key !== b ? a.key : c;
                a.label = a.label !== b ? a.label : c;
                a._map = {};
                a._array = l.isArray(a.data);
                a._array && (a._length = a.data.length, l.each(a.data, function(b, c) {
                    a._map[g(c)] = b
                }));
                a.circular = B.circular ===
                    b ? a.circular === b ? a._array && a._length > B.rows : a.circular : l.isArray(B.circular) ? B.circular[c] : B.circular;
                a.min = a._array ? a.circular ? -Infinity : 0 : a.min === b ? -Infinity : a.min;
                a.max = a._array ? a.circular ? Infinity : a._length - 1 : a.max === b ? Infinity : a.max;
                a._nr = c;
                a._index = k(a, ba[c]);
                a._disabled = {};
                a._batch = 0;
                a._current = a._index;
                a._first = a._index - R;
                a._last = a._index + R;
                a._offset = a._first;
                d ? (a._offset -= a._margin / V + (a._index - e), a._margin += (a._index - e) * V) : a._margin = 0;
                a._refresh = function(b) {
                    H(a._scroller.settings, {
                        minScroll: -((a.multiple ?
                            Math.max(0, a.max - B.rows + 1) : a.max) - a._offset) * V,
                        maxScroll: -(a.min - a._offset) * V
                    });
                    a._scroller.refresh(b)
                };
                return aa[a.key] = a
            }

            function i(c, d, e, f) {
                for (var i, g, k, j, h, u = "", y = r._tempSelected[d], m = c._disabled || {}; e <= f; e++) g = a(c, e), j = l.isPlainObject(g) ? g.display : g, k = g && g.value !== b ? g.value : j, i = g && g.cssClass !== b ? g.cssClass : "", g = g && g.label !== b ? g.label : "", h = k !== b && k == ba[d] && !c.multiple, u += '<div role="option" aria-selected="' + (y[k] ? !0 : !1) + '" class="mbsc-sc-itm ' + i + " " + (h ? "mbsc-sc-itm-sel " : "") + (y[k] ? Q : "") + (k ===
                    b ? " mbsc-sc-itm-ph" : " mbsc-btn-e") + (m[k] ? " mbsc-sc-itm-inv mbsc-btn-d" : "") + '" data-index="' + e + '" data-val="' + k + '"' + (g ? ' aria-label="' + g + '"' : "") + (h ? ' aria-selected="true"' : "") + ' style="height:' + V + "px;line-height:" + V + 'px;">' + (1 < la ? '<div class="mbsc-sc-itm-ml" style="line-height:' + Math.round(V / la) + "px;font-size:" + Math.round(0.8 * (V / la)) + 'px;">' : "") + (j === b ? "" : j) + r._processItem(l, 0.2) + (1 < la ? "</div>" : "") + "</div>";
                return u
            }

            function p(a) {
                var b = B.headerText;
                return b ? "function" === typeof b ? b.call(h, a) : b.replace(/\{value\}/i,
                    a) : ""
            }

            function w(a, b, c) {
                var c = Math.round(-c / V) + a._offset,
                    d = c - a._current,
                    e = a._first,
                    f = a._last;
                d && (a._first += d, a._last += d, a._current = c, setTimeout(function() {
                    0 < d ? (a._$markup.append(i(a, b, Math.max(f + 1, e + d), f + d)), l(".mbsc-sc-itm", a._$markup).slice(0, Math.min(d, f - e + 1)).remove()) : 0 > d && (a._$markup.prepend(i(a, b, e + d, Math.min(e - 1, f + d))), l(".mbsc-sc-itm", a._$markup).slice(Math.max(d, e - f - 1)).remove());
                    a._margin += d * V;
                    a._$markup.css("margin-top", a._margin + "px")
                }, 10))
            }

            function T(c, d, e, f) {
                var c = $[c],
                    f = f || c._disabled,
                    i = k(c, d),
                    j = d,
                    l = d,
                    h = 0,
                    u = 0;
                d === b && (d = g(a(c, i, void 0)));
                if (f[d]) {
                    for (d = 0; i - h >= c.min && f[j] && 100 > d;) d++, h++, j = g(a(c, i - h, void 0));
                    for (d = 0; i + u < c.max && f[l] && 100 > d;) d++, u++, l = g(a(c, i + u, void 0));
                    d = (u < h && u && 2 !== e || !h || 0 > i - h || 1 == e) && !f[l] ? l : j
                }
                return d
            }

            function v(a, c, d, e) {
                var f, i, g, j, u = r._isVisible;
                N = !0;
                j = B.validate.call(h, {
                    values: ba.slice(0),
                    index: c,
                    direction: d
                }, r) || {};
                N = !1;
                j.valid && (r._tempWheelArray = ba = j.valid.slice(0));
                ca("onValidated");
                l.each($, function(e, h) {
                    u && h._$markup.find(".mbsc-sc-itm").removeClass("mbsc-sc-itm-inv mbsc-btn-d");
                    h._disabled = {};
                    j.disabled && j.disabled[e] && l.each(j.disabled[e], function(a, b) {
                        h._disabled[b] = true;
                        u && h._$markup.find('.mbsc-sc-itm[data-val="' + b + '"]').addClass("mbsc-sc-itm-inv mbsc-btn-d")
                    });
                    ba[e] = h.multiple ? ba[e] : T(e, ba[e], d);
                    if (u) {
                        (!h.multiple || c === b) && h._$markup.find(".mbsc-sc-itm-sel").removeClass(Q).removeAttr("aria-selected");
                        if (h.multiple) {
                            if (c === b)
                                for (var y in r._tempSelected[e]) h._$markup.find('.mbsc-sc-itm[data-val="' + y + '"]').addClass(Q).attr("aria-selected", "true")
                        } else h._$markup.find('.mbsc-sc-itm[data-val="' +
                            ba[e] + '"]').addClass("mbsc-sc-itm-sel").attr("aria-selected", "true");
                        i = k(h, ba[e]);
                        f = i - h._index + h._batch;
                        if (Math.abs(f) > 2 * R + 1) {
                            g = f + (2 * R + 1) * (f > 0 ? -1 : 1);
                            h._offset = h._offset + g;
                            h._margin = h._margin - g * V;
                            h._refresh()
                        }
                        h._index = i + h._batch;
                        h._scroller.scroll(-(i - h._offset + h._batch) * V, c === e || c === b ? a : 200)
                    }
                });
                r._tempValue = B.formatValue(ba, r);
                u && r._header.html(p(r._tempValue));
                r.live && (r._hasValue = e || r._hasValue, O(e, e, 0, !0), e && ca("onSet", {
                    valueText: r._value
                }));
                e && ca("onChange", {
                    valueText: r._tempValue
                })
            }

            function F(c,
                d, e, f, i) {
                var j = g(a(c, e, void 0));
                j !== b && (ba[d] = j, c._batch = c._array ? Math.floor(e / c._length) * c._length : 0, setTimeout(function() {
                    v(f, d, i, !0)
                }, 10))
            }

            function O(a, b, c, d, e) {
                d || v(c);
                e || (r._wheelArray = ba.slice(0), r._value = r._hasValue ? r._tempValue : null, r._selected = H(!0, {}, r._tempSelected));
                a && (r._isInput && da.val(r._hasValue ? r._tempValue : ""), ca("onFill", {
                    valueText: r._hasValue ? r._tempValue : "",
                    change: b
                }), b && (r._preventChange = !0, da.trigger("change")))
            }
            var A, M, R = 20,
                Q, y, P, Y, S, J, Z, ba, V, N, B, ca, la, $, aa, r = this,
                da = l(h);
            x.Frame.call(this, h, C, !0);
            r.setVal = r._setVal = function(a, c, d, e, f) {
                r._hasValue = null !== a && a !== b;
                r._tempWheelArray = ba = l.isArray(a) ? a.slice(0) : B.parseValue.call(h, a, r) || [];
                O(c, d === b ? c : d, f, !1, e)
            };
            r.getVal = r._getVal = function(a) {
                a = r._hasValue || a ? r[a ? "_tempValue" : "_value"] : null;
                return q.isNumeric(a) ? +a : a
            };
            r.setArrayVal = r.setVal;
            r.getArrayVal = function(a) {
                return a ? r._tempWheelArray : r._wheelArray
            };
            r.changeWheel = function(a, c, d) {
                var e, f;
                l.each(a, function(a, b) {
                    f = aa[a];
                    e = f._nr;
                    f && (H(f, b), t(f, e, !0), r._isVisible &&
                        (f._$markup.html(i(f, e, f._first, f._last)).css("margin-top", f._margin + "px"), f._refresh(N)))
                });
                r._isVisible && r.position();
                N || v(c, b, b, d)
            };
            r.getValidValue = T;
            r._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            r._generateContent = function() {
                var a, c = "",
                    d = 0;
                l.each(B.wheels, function(e, f) {
                    c += '<div class="mbsc-w-p mbsc-sc-whl-gr-c"><div class="mbsc-sc-whl-gr' + (y ? " mbsc-sc-cp" : "") + (B.showLabel ? " mbsc-sc-lbl-v" : "") + '">';
                    l.each(f, function(e, f) {
                        r._tempSelected[d] = H({}, r._selected[d]);
                        $[d] = t(f, d);
                        a = f.label !== b ? f.label : e;
                        c += '<div class="mbsc-sc-whl-w ' + (f.cssClass ||
                                "") + (f.multiple ? " mbsc-sc-whl-multi" : "") + '" style="' + (B.width ? "width:" + (B.width[d] || B.width) + "px;" : (B.minWidth ? "min-width:" + (B.minWidth[d] || B.minWidth) + "px;" : "") + (B.maxWidth ? "max-width:" + (B.maxWidth[d] || B.maxWidth) + "px;" : "")) + '"><div class="mbsc-sc-whl-o"></div><div class="mbsc-sc-whl-l" style="height:' + V + "px;margin-top:-" + (V / 2 + (B.selectedLineBorder || 0)) + 'px;"></div><div tabindex="0" aria-live="off" aria-label="' + a + '" role="listbox" data-index="' + d + '" class="mbsc-sc-whl" style="height:' + B.rows * V +
                            'px;">' + (y ? '<div data-index="' + d + '" data-dir="inc" class="mbsc-sc-btn mbsc-sc-btn-plus ' + (B.btnPlusClass || "") + '" style="height:' + V + "px;line-height:" + V + 'px;"></div><div data-index="' + d + '" data-dir="dec" class="mbsc-sc-btn mbsc-sc-btn-minus ' + (B.btnMinusClass || "") + '" style="height:' + V + "px;line-height:" + V + 'px;"></div>' : "") + '<div class="mbsc-sc-lbl">' + a + '</div><div class="mbsc-sc-whl-c"' + (f.multiple ? ' aria-multiselectable="true"' : ' style="height:' + V + "px;margin-top:-" + (V / 2 + 1) + 'px;"') + '><div class="mbsc-sc-whl-sc">';
                        c += i(f, d, f._first, f._last) + "</div></div></div>";
                        c += "</div>";
                        d++
                    });
                    c += "</div></div>"
                });
                return c
            };
            r._attachEvents = function(a) {
                l(".mbsc-sc-btn", a).on("touchstart mousedown", f).on("touchmove", E).on("touchend touchcancel", c);
                l(".mbsc-sc-whl", a).on("keydown", I).on("keyup", j)
            };
            r._detachEvents = function(a) {
                l(".mbsc-sc-whl", a).mobiscroll("destroy")
            };
            r._markupReady = function(a) {
                A = a;
                l(".mbsc-sc-whl", A).each(function(a) {
                    var b, c = l(this),
                        e = $[a];
                    e._$markup = l(".mbsc-sc-whl-sc", this);
                    e._scroller = new d.classes.ScrollView(this, {
                        mousewheel: B.mousewheel,
                        moveElement: e._$markup,
                        initialPos: -(e._index - e._offset) * V,
                        contSize: 0,
                        snap: V,
                        minScroll: -((e.multiple ? Math.max(0, e.max - B.rows + 1) : e.max) - e._offset) * V,
                        maxScroll: -(e.min - e._offset) * V,
                        maxSnapScroll: R,
                        prevDef: !0,
                        stopProp: !0,
                        onStart: function(b, c) {
                            c.settings.readonly = l.isArray(B.readonly) ? B.readonly[a] : B.readonly
                        },
                        onGestureStart: function() {
                            c.addClass("mbsc-sc-whl-a mbsc-sc-whl-anim");
                            ca("onWheelGestureStart", {
                                index: a
                            })
                        },
                        onGestureEnd: function(c) {
                            var d = 90 == c.direction ? 1 : 2,
                                f = c.duration;
                            b = Math.round(-c.destinationY / V) + e._offset;
                            F(e, a, b, f, d)
                        },
                        onAnimationStart: function() {
                            c.addClass("mbsc-sc-whl-anim")
                        },
                        onAnimationEnd: function() {
                            c.removeClass("mbsc-sc-whl-a mbsc-sc-whl-anim");
                            ca("onWheelAnimationEnd", {
                                index: a
                            })
                        },
                        onMove: function(b) {
                            w(e, a, b.posY)
                        },
                        onBtnTap: function(b) {
                            var b = l(b.target),
                                c = +b.attr("data-index");
                            n(a, b) && (c = e._current);
                            !1 !== ca("onItemTap", {
                                target: b[0],
                                selected: b.hasClass("mbsc-itm-sel")
                            }) && (F(e, a, c, 200), r.live && !e.multiple && (!0 === B.setOnTap || B.setOnTap[a]) && setTimeout(function() {
                                    r.select()
                                },
                                200))
                        }
                    })
                });
                v()
            };
            r._fillValue = function() {
                r._hasValue = !0;
                O(!0, !0, 0, !0)
            };
            r._clearValue = function() {
                l(".mbsc-sc-whl-multi .mbsc-sc-itm-sel", A).removeClass(Q).removeAttr("aria-selected")
            };
            r._readValue = function() {
                var a = da.val() || "",
                    b = 0;
                "" !== a && (r._hasValue = !0);
                r._tempWheelArray = ba = r._hasValue && r._wheelArray ? r._wheelArray.slice(0) : B.parseValue.call(h, a, r) || [];
                r._tempSelected = H(!0, {}, r._selected);
                l.each(B.wheels, function(a, c) {
                    l.each(c, function(a, c) {
                        $[b] = t(c, b);
                        b++
                    })
                });
                O();
                ca("onRead")
            };
            r._processSettings =
                function() {
                    B = r.settings;
                    ca = r.trigger;
                    V = B.height;
                    la = B.multiline;
                    y = B.showScrollArrows;
                    Q = "mbsc-sc-itm-sel mbsc-ic mbsc-ic-" + B.checkIcon;
                    $ = [];
                    aa = {};
                    r._isLiquid = "liquid" === (B.layout || (/top|bottom/.test(B.display) && 1 == B.wheels.length ? "liquid" : ""));
                    1 < la && (B.cssClass = (B.cssClass || "") + " dw-ml");
                    y && (B.rows = Math.max(3, B.rows))
                };
            r._tempSelected = {};
            r._selected = {};
            m || r.init(C)
        };
        x.Scroller.prototype = {
            _hasDef: !0,
            _hasTheme: !0,
            _hasLang: !0,
            _hasPreset: !0,
            _class: "scroller",
            _defaults: H({}, x.Frame.prototype._defaults, {
                minWidth: 80,
                height: 40,
                rows: 3,
                multiline: 1,
                delay: 300,
                readonly: !1,
                showLabel: !0,
                setOnTap: !1,
                wheels: [],
                preset: "",
                speedUnit: 0.0012,
                timeUnit: 0.08,
                validate: function() {},
                formatValue: function(a) {
                    return a.join(" ")
                },
                parseValue: function(a, d) {
                    var e = [],
                        f = [],
                        k = 0,
                        c, h;
                    null !== a && a !== b && (e = (a + "").split(" "));
                    l.each(d.settings.wheels, function(a, b) {
                        l.each(b, function(a, b) {
                            h = b.data;
                            c = g(h[0]);
                            l.each(h, function(a, b) {
                                if (e[k] == g(b)) return c = g(b), !1
                            });
                            f.push(c);
                            k++
                        })
                    });
                    return f
                }
            })
        };
        d.themes.scroller = d.themes.frame
    })(window, document);
    (function() {
        function h(b,
            a, e, d, h, H, x) {
            b = new Date(b, a, e, d || 0, h || 0, H || 0, x || 0);
            23 == b.getHours() && 0 === (d || 0) && b.setHours(b.getHours() + 2);
            return b
        }
        var e = s,
            b = e.$;
        e.util.datetime = {
            defaults: {
                shortYearCutoff: "+10",
                monthNames: "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
                monthNamesShort: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                dayNames: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
                dayNamesShort: "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
                dayNamesMin: "S,M,T,W,T,F,S".split(","),
                amText: "am",
                pmText: "pm",
                getYear: function(b) {
                    return b.getFullYear()
                },
                getMonth: function(b) {
                    return b.getMonth()
                },
                getDay: function(b) {
                    return b.getDate()
                },
                getDate: h,
                getMaxDayOfMonth: function(b, a) {
                    return 32 - (new Date(b, a, 32, 12)).getDate()
                },
                getWeekNumber: function(b) {
                    b = new Date(b);
                    b.setHours(0, 0, 0);
                    b.setDate(b.getDate() + 4 - (b.getDay() || 7));
                    var a = new Date(b.getFullYear(), 0, 1);
                    return Math.ceil(((b - a) / 864E5 + 1) / 7)
                }
            },
            adjustedDate: h,
            formatDate: function(k, a, g) {
                if (!a) return null;
                var g = b.extend({}, e.util.datetime.defaults, g),
                    d = function(a) {
                        for (var b = 0; x + 1 < k.length && k.charAt(x + 1) == a;) b++, x++;
                        return b
                    },
                    h = function(a, b, e) {
                        b = "" + b;
                        if (d(a))
                            for (; b.length < e;) b = "0" + b;
                        return b
                    },
                    H = function(a, b, e, f) {
                        return d(a) ? f[b] : e[b]
                    },
                    x, q, o = "",
                    u = !1;
                for (x = 0; x < k.length; x++)
                    if (u) "'" == k.charAt(x) && !d("'") ? u = !1 : o += k.charAt(x);
                    else switch (k.charAt(x)) {
                        case "d":
                            o += h("d", g.getDay(a), 2);
                            break;
                        case "D":
                            o += H("D", a.getDay(), g.dayNamesShort, g.dayNames);
                            break;
                        case "o":
                            o += h("o", (a.getTime() - (new Date(a.getFullYear(),
                                0, 0)).getTime()) / 864E5, 3);
                            break;
                        case "m":
                            o += h("m", g.getMonth(a) + 1, 2);
                            break;
                        case "M":
                            o += H("M", g.getMonth(a), g.monthNamesShort, g.monthNames);
                            break;
                        case "y":
                            q = g.getYear(a);
                            o += d("y") ? q : (10 > q % 100 ? "0" : "") + q % 100;
                            break;
                        case "h":
                            q = a.getHours();
                            o += h("h", 12 < q ? q - 12 : 0 === q ? 12 : q, 2);
                            break;
                        case "H":
                            o += h("H", a.getHours(), 2);
                            break;
                        case "i":
                            o += h("i", a.getMinutes(), 2);
                            break;
                        case "s":
                            o += h("s", a.getSeconds(), 2);
                            break;
                        case "a":
                            o += 11 < a.getHours() ? g.pmText : g.amText;
                            break;
                        case "A":
                            o += 11 < a.getHours() ? g.pmText.toUpperCase() :
                                g.amText.toUpperCase();
                            break;
                        case "'":
                            d("'") ? o += "'" : u = !0;
                            break;
                        default:
                            o += k.charAt(x)
                    }
                    return o
            },
            parseDate: function(k, a, g) {
                var g = b.extend({}, e.util.datetime.defaults, g),
                    d = g.defaultValue || new Date;
                if (!k || !a) return d;
                if (a.getTime) return a;
                var a = "object" == typeof a ? a.toString() : a + "",
                    h = g.shortYearCutoff,
                    H = g.getYear(d),
                    x = g.getMonth(d) + 1,
                    q = g.getDay(d),
                    o = -1,
                    u = d.getHours(),
                    G = d.getMinutes(),
                    C = 0,
                    m = -1,
                    f = !1,
                    E = function(a) {
                        (a = n + 1 < k.length && k.charAt(n + 1) == a) && n++;
                        return a
                    },
                    c = function(b) {
                        E(b);
                        b = a.substr(j).match(RegExp("^\\d{1," +
                            ("@" == b ? 14 : "!" == b ? 20 : "y" == b ? 4 : "o" == b ? 3 : 2) + "}"));
                        if (!b) return 0;
                        j += b[0].length;
                        return parseInt(b[0], 10)
                    },
                    s = function(b, c, d) {
                        b = E(b) ? d : c;
                        for (c = 0; c < b.length; c++)
                            if (a.substr(j, b[c].length).toLowerCase() == b[c].toLowerCase()) return j += b[c].length, c + 1;
                        return 0
                    },
                    j = 0,
                    n;
                for (n = 0; n < k.length; n++)
                    if (f) "'" == k.charAt(n) && !E("'") ? f = !1 : j++;
                    else switch (k.charAt(n)) {
                        case "d":
                            q = c("d");
                            break;
                        case "D":
                            s("D", g.dayNamesShort, g.dayNames);
                            break;
                        case "o":
                            o = c("o");
                            break;
                        case "m":
                            x = c("m");
                            break;
                        case "M":
                            x = s("M", g.monthNamesShort,
                                g.monthNames);
                            break;
                        case "y":
                            H = c("y");
                            break;
                        case "H":
                            u = c("H");
                            break;
                        case "h":
                            u = c("h");
                            break;
                        case "i":
                            G = c("i");
                            break;
                        case "s":
                            C = c("s");
                            break;
                        case "a":
                            m = s("a", [g.amText, g.pmText], [g.amText, g.pmText]) - 1;
                            break;
                        case "A":
                            m = s("A", [g.amText, g.pmText], [g.amText, g.pmText]) - 1;
                            break;
                        case "'":
                            E("'") ? j++ : f = !0;
                            break;
                        default:
                            j++
                    }
                    100 > H && (H += (new Date).getFullYear() - (new Date).getFullYear() % 100 + (H <= ("string" != typeof h ? h : (new Date).getFullYear() % 100 + parseInt(h, 10)) ? 0 : -100));
                if (-1 < o) {
                    x = 1;
                    q = o;
                    do {
                        h = 32 - (new Date(H, x - 1,
                            32, 12)).getDate();
                        if (q <= h) break;
                        x++;
                        q -= h
                    } while (1)
                }
                u = g.getDate(H, x - 1, q, -1 == m ? u : m && 12 > u ? u + 12 : !m && 12 == u ? 0 : u, G, C);
                return g.getYear(u) != H || g.getMonth(u) + 1 != x || g.getDay(u) != q ? d : u
            }
        }
    })();
    (function(h, e, b) {
        var k = s,
            a = k.$,
            g = k.presets.scroller,
            d = k.util,
            l = d.datetime.adjustedDate,
            H = d.jsPrefix,
            x = d.testTouch,
            q = d.getCoord,
            o = {
                controls: ["calendar"],
                firstDay: 0,
                weekDays: "short",
                maxMonthWidth: 170,
                months: 1,
                preMonths: 1,
                highlight: !0,
                outerMonthChange: !0,
                quickNav: !0,
                yearChange: !0,
                todayClass: "mbsc-cal-today",
                btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left6",
                btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right6",
                dateText: "Date",
                timeText: "Time",
                calendarText: "Calendar",
                todayText: "Today",
                prevMonthText: "Previous Month",
                nextMonthText: "Next Month",
                prevYearText: "Previous Year",
                nextYearText: "Next Year"
            };
        g.calbase = function(h) {
            function G(b) {
                var c;
                cb = a(this);
                Cb = !1;
                "keydown" != b.type ? (Mb = q(b, "X"), Bb = q(b, "Y"), c = x(b, this)) : c = 32 === b.keyCode;
                if (!ta && c && !cb.hasClass("mbsc-fr-btn-d") && (ta = !0, setTimeout(f, 100), "mousedown" == b.type)) a(e).on("mousemove", C).on("mouseup", m)
            }

            function C(a) {
                if (7 <
                    Math.abs(Mb - q(a, "X")) || 7 < Math.abs(Bb - q(a, "Y"))) ta = !1, cb.removeClass("mbsc-fr-btn-a")
            }

            function m(b) {
                "touchend" == b.type && b.preventDefault();
                Cb || f();
                ta = !1;
                "mouseup" == b.type && a(e).off("mousemove", C).off("mouseup", m)
            }

            function f() {
                Cb = !0;
                cb.hasClass("mbsc-cal-prev-m") ? A() : cb.hasClass("mbsc-cal-next-m") ? O() : cb.hasClass("mbsc-cal-prev-y") ? R(cb) : cb.hasClass("mbsc-cal-next-y") && M(cb)
            }

            function E(b, c, d) {
                var e, f, i, h, g = {},
                    j = ia + bb;
                b && a.each(b, function(a, b) {
                    e = b.d || b.start || b;
                    f = e + "";
                    if (b.start && b.end)
                        for (h = new Date(b.start); h <=
                            b.end;) i = l(h.getFullYear(), h.getMonth(), h.getDate()), g[i] = g[i] || [], g[i].push(b), h.setDate(h.getDate() + 1);
                    else if (e.getTime) i = l(e.getFullYear(), e.getMonth(), e.getDate()), g[i] = g[i] || [], g[i].push(b);
                    else if (f.match(/w/i)) {
                        var k = +f.replace("w", ""),
                            y = 0,
                            m = z.getDate(c, d - ia - xa, 1).getDay();
                        1 < z.firstDay - m + 1 && (y = 7);
                        for (Z = 0; Z < 5 * Sa; Z++) i = z.getDate(c, d - ia - xa, 7 * Z - y - m + 1 + k), g[i] = g[i] || [], g[i].push(b)
                    } else if (f = f.split("/"), f[1]) 11 <= d + j && (i = z.getDate(c + 1, f[0] - 1, f[1]), g[i] = g[i] || [], g[i].push(b)), 1 >= d - j && (i = z.getDate(c -
                        1, f[0] - 1, f[1]), g[i] = g[i] || [], g[i].push(b)), i = z.getDate(c, f[0] - 1, f[1]), g[i] = g[i] || [], g[i].push(b);
                    else
                        for (Z = 0; Z < Sa; Z++) i = z.getDate(c, d - ia - xa + Z, f[0]), z.getDay(i) == f[0] && (g[i] = g[i] || [], g[i].push(b))
                });
                return g
            }

            function c(a, b) {
                ib = E(z.invalid, a, b);
                Na = E(z.valid, a, b);
                h.onGenMonth(a, b)
            }

            function I(a, b, c, d, e, f, i) {
                var g = '<div class="mbsc-cal-h mbsc-cal-sc-c mbsc-cal-' + a + "-c " + (z.calendarClass || "") + '"><div class="mbsc-cal-sc"><div class="mbsc-cal-sc-p"><div class="mbsc-cal-sc-tbl"><div class="mbsc-cal-sc-row">';
                for (J = 1; J <= b; J++) g = 12 >= J || J > c ? g + '<div class="mbsc-cal-sc-m-cell mbsc-cal-sc-cell mbsc-cal-sc-empty"><div class="mbsc-cal-sc-cell-i">&nbsp;</div></div>' : g + ('<div tabindex="0" role="button"' + (f ? ' aria-label="' + f[J - 13] + '"' : "") + ' class="mbsc-fr-btn-e mbsc-fr-btn-nhl mbsc-cal-sc-m-cell mbsc-cal-sc-cell mbsc-cal-' + a + '-s" data-val=' + (d + J - 13) + '><div class="mbsc-cal-sc-cell-i mbsc-cal-sc-tbl"><div class="mbsc-cal-sc-cell">' + (i ? i[J - 13] : d + J - 13 + e) + "</div></div></div>"), J < b && (0 === J % 12 ? g += '</div></div></div><div class="mbsc-cal-sc-p" style="' +
                    (Oa ? "top" : sa ? "right" : "left") + ":" + 100 * Math.round(J / 12) + '%"><div class="mbsc-cal-sc-tbl"><div class="mbsc-cal-sc-row">' : 0 === J % 3 && (g += '</div><div class="mbsc-cal-sc-row">'));
                return g + "</div></div></div></div></div>"
            }

            function j(c, d) {
                var e, f, i, g, j, k, y, m, p, o, t, w, q, v, n = 1,
                    r = 0;
                e = z.getDate(c, d, 1);
                var S = z.getYear(e),
                    F = z.getMonth(e),
                    J = null === z.defaultValue && !h._hasValue ? null : h.getDate(!0),
                    x = z.getDate(S, F, 1).getDay(),
                    Q = '<div class="mbsc-cal-table">',
                    H = '<div class="mbsc-cal-week-nr-c">';
                1 < z.firstDay - x + 1 && (r = 7);
                for (v = 0; 42 > v; v++) q = v + z.firstDay - r, e = z.getDate(S, F, q - x + 1), f = e.getFullYear(), i = e.getMonth(), g = e.getDate(), j = z.getMonth(e), k = z.getDay(e), w = z.getMaxDayOfMonth(f, i), y = f + "-" + i + "-" + g, i = a.extend({
                    valid: e < l(gb.getFullYear(), gb.getMonth(), gb.getDate()) || e > zb ? !1 : ib[e] === b || Na[e] !== b,
                    selected: J && J.getFullYear() === f && J.getMonth() === i && J.getDate() === g
                }, h.getDayProps(e, J)), m = i.valid, p = i.selected, f = i.cssClass, o = (new Date(e)).setHours(12, 0, 0, 0) === (new Date).setHours(12, 0, 0, 0), t = j !== F, Nb[y] = i, 0 === v % 7 && (Q += (v ? "</div>" :
                    "") + '<div class="mbsc-cal-row' + (z.highlight && J && 0 <= J - e && 6048E5 > J - e ? " mbsc-cal-week-hl" : "") + '">'), ya && 1 == e.getDay() && ("month" == ya && t && 1 < n ? n = 1 == g ? 1 : 2 : "year" == ya && (n = z.getWeekNumber(e)), H += '<div class="mbsc-cal-week-nr"><div class="mbsc-cal-week-nr-i">' + n + "</div></div>", n++), Q += '<div role="button" tabindex="-1" aria-label="' + (o ? z.todayText + ", " : "") + z.dayNames[e.getDay()] + ", " + z.monthNames[j] + " " + k + " " + (i.ariaLabel ? ", " + i.ariaLabel : "") + '"' + (t && !yb ? ' aria-hidden="true"' : "") + (p ? ' aria-selected="true"' :
                    "") + (m ? "" : ' aria-disabled="true"') + ' data-day="' + q % 7 + '" data-full="' + y + '"class="mbsc-cal-day ' + (z.dayClass || "") + (p ? " mbsc-cal-day-sel" : "") + (o ? " " + z.todayClass : "") + (f ? " " + f : "") + (1 == k ? " mbsc-cal-day-first" : "") + (k == w ? " mbsc-cal-day-last" : "") + (t ? " mbsc-cal-day-diff" : "") + (m ? " mbsc-cal-day-v mbsc-fr-btn-e mbsc-fr-btn-nhl" : " mbsc-cal-day-inv") + '"><div class="mbsc-cal-day-i ' + (p ? hb : "") + " " + (z.innerDayClass || "") + '"><div class="mbsc-cal-day-fg">' + k + h._processItem(a, 0.06) + "</div>" + (i.markup || "") + '<div class="mbsc-cal-day-frame"></div></div></div>';
                return Q + ("</div></div>" + H + "</div>")
            }

            function n(b, c, d) {
                var e = z.getDate(b, c, 1),
                    f = z.getYear(e),
                    e = z.getMonth(e),
                    i = f + ob;
                if ($a) {
                    Ma && Ma.removeClass("mbsc-cal-sc-sel").removeAttr("aria-selected").find(".mbsc-cal-sc-cell-i").removeClass(hb);
                    vb && vb.removeClass("mbsc-cal-sc-sel").removeAttr("aria-selected").find(".mbsc-cal-sc-cell-i").removeClass(hb);
                    Ma = a('.mbsc-cal-year-s[data-val="' + f + '"]', N).addClass("mbsc-cal-sc-sel").attr("aria-selected", "true");
                    vb = a('.mbsc-cal-month-s[data-val="' + e + '"]', N).addClass("mbsc-cal-sc-sel").attr("aria-selected",
                        "true");
                    Ma.find(".mbsc-cal-sc-cell-i").addClass(hb);
                    vb.find(".mbsc-cal-sc-cell-i").addClass(hb);
                    Ya && Ya.scroll(Ma, d);
                    a(".mbsc-cal-month-s", N).removeClass("mbsc-fr-btn-d");
                    if (f === fa)
                        for (J = 0; J < Qa; J++) a('.mbsc-cal-month-s[data-val="' + J + '"]', N).addClass("mbsc-fr-btn-d");
                    if (f === na)
                        for (J = Kb + 1; 12 >= J; J++) a('.mbsc-cal-month-s[data-val="' + J + '"]', N).addClass("mbsc-fr-btn-d")
                }
                1 == Ia.length && Ia.attr("aria-label", f).html(i);
                for (J = 0; J < oa; ++J) e = z.getDate(b, c - xa + J, 1), f = z.getYear(e), e = z.getMonth(e), i = f + ob, a(qa[J]).attr("aria-label",
                    z.monthNames[e] + (Ua ? "" : " " + f)).html((!Ua && db < ka ? i + " " : "") + ja[e] + (!Ua && db > ka ? " " + i : "")), 1 < Ia.length && a(Ia[J]).html(i);
                z.getDate(b, c - xa - 1, 1) < wa ? D(a(".mbsc-cal-prev-m", N)) : K(a(".mbsc-cal-prev-m", N));
                z.getDate(b, c + oa - xa, 1) > La ? D(a(".mbsc-cal-next-m", N)) : K(a(".mbsc-cal-next-m", N));
                z.getDate(b, c, 1).getFullYear() <= wa.getFullYear() ? D(a(".mbsc-cal-prev-y", N)) : K(a(".mbsc-cal-prev-y", N));
                z.getDate(b, c, 1).getFullYear() >= La.getFullYear() ? D(a(".mbsc-cal-next-y", N)) : K(a(".mbsc-cal-next-y", N))
            }

            function K(a) {
                a.removeClass(Ja).find(".mbsc-cal-btn-txt").removeAttr("aria-disabled")
            }

            function D(a) {
                a.addClass(Ja).find(".mbsc-cal-btn-txt").attr("aria-disabled", "true")
            }

            function L(b, c) {
                if (da && ("calendar" === Ba || c)) {
                    var d, e, f = z.getDate(pa, ra, 1),
                        i = Math.abs(12 * (z.getYear(b) - z.getYear(f)) + z.getMonth(b) - z.getMonth(f));
                    h.needsSlide && i && (pa = z.getYear(b), ra = z.getMonth(b), b > f ? (e = i > ia - xa + oa - 1, ra -= e ? 0 : i - ia, d = "next") : b < f && (e = i > ia + xa, ra += e ? 0 : i - ia, d = "prev"), w(pa, ra, d, Math.min(i, ia), e, !0));
                    c || (Ca = b, h.trigger("onDayHighlight", {
                        date: b
                    }), z.highlight && (a(".mbsc-cal-day-sel .mbsc-cal-day-i", ca).removeClass(hb),
                        a(".mbsc-cal-day-sel", ca).removeClass("mbsc-cal-day-sel").removeAttr("aria-selected"), a(".mbsc-cal-week-hl", ca).removeClass("mbsc-cal-week-hl"), (null !== z.defaultValue || h._hasValue) && a('.mbsc-cal-day[data-full="' + b.getFullYear() + "-" + b.getMonth() + "-" + b.getDate() + '"]', ca).addClass("mbsc-cal-day-sel").attr("aria-selected", "true").find(".mbsc-cal-day-i").addClass(hb).closest(".mbsc-cal-row").addClass("mbsc-cal-week-hl")));
                    h.needsSlide = !0
                }
            }

            function t(a, d, e) {
                e || h.trigger("onMonthLoading", {
                    year: a,
                    month: d
                });
                c(a, d);
                for (J = 0; J < Sa; J++) za[J].html(j(a, d - xa - ia + J));
                p();
                xb = b;
                h.trigger("onMonthLoaded", {
                    year: a,
                    month: d
                })
            }

            function i(b, c, d) {
                var e = ia,
                    f = ia;
                if (d) {
                    for (; f && z.getDate(b, c + e + oa - xa - 1, 1) > La;) f--;
                    for (; e && z.getDate(b, c - f - xa, 1) < wa;) e--
                }
                a.extend(ma.settings, {
                    contSize: oa * $,
                    snap: $,
                    minScroll: aa - (sa ? e : f) * $,
                    maxScroll: aa + (sa ? f : e) * $
                });
                ma.refresh()
            }

            function p() {
                ya && Fa.html(a(".mbsc-cal-week-nr-c", za[ia]).html());
                a(".mbsc-cal-slide-a .mbsc-cal-day", la).attr("tabindex", 0)
            }

            function w(d, e, f, g, k, l, y) {
                d && sb.push({
                    y: d,
                    m: e,
                    dir: f,
                    slideNr: g,
                    load: k,
                    active: l,
                    callback: y
                });
                if (!Za) {
                    var m = sb.shift(),
                        d = m.y,
                        e = m.m,
                        f = "next" === m.dir,
                        g = m.slideNr,
                        k = m.load,
                        l = m.active,
                        y = m.callback || wb,
                        m = z.getDate(d, e, 1),
                        d = z.getYear(m),
                        e = z.getMonth(m);
                    Za = !0;
                    h.changing = !0;
                    h.trigger("onMonthChange", {
                        year: d,
                        month: e
                    });
                    h.trigger("onMonthLoading", {
                        year: d,
                        month: e
                    });
                    c(d, e);
                    if (k)
                        for (J = 0; J < oa; J++) za[f ? Sa - oa + J : J].html(j(d, e - xa + J));
                    l && ab.addClass("mbsc-cal-slide-a");
                    setTimeout(function() {
                        h.ariaMessage(z.monthNames[e] + " " + d);
                        n(d, e, 200);
                        aa = f ? aa - $ * g * jb : aa + $ * g * jb;
                        ma.scroll(aa,
                            l ? 200 : 0,
                            function() {
                                var c;
                                if (za.length) {
                                    ab.removeClass("mbsc-cal-slide-a").attr("aria-hidden", "true");
                                    if (f) {
                                        c = za.splice(0, g);
                                        for (J = 0; J < g; J++) za.push(c[J]), v(za[za.length - 1], +za[za.length - 2].attr("data-curr") + 100 * jb)
                                    } else {
                                        c = za.splice(Sa - g, g);
                                        for (J = g - 1; 0 <= J; J--) za.unshift(c[J]), v(za[0], +za[1].attr("data-curr") - 100 * jb)
                                    }
                                    for (J = 0; J < g; J++) za[f ? Sa - g + J : J].html(j(d, e - xa - ia + J + (f ? Sa - g : 0))), k && za[f ? J : Sa - g + J].html(j(d, e - xa - ia + J + (f ? 0 : Sa - g)));
                                    for (J = 0; J < oa; J++) za[ia + J].addClass("mbsc-cal-slide-a").removeAttr("aria-hidden");
                                    i(d, e, !0);
                                    Za = !1
                                }
                                sb.length ? setTimeout(function() {
                                    w()
                                }, 10) : (pa = d, ra = e, h.changing = !1, a(".mbsc-cal-day", la).attr("tabindex", -1), p(), xb !== b ? t(d, e, xb) : h.trigger("onMonthLoaded", {
                                    year: d,
                                    month: e
                                }), y())
                            })
                    }, 10)
                }
            }

            function T() {
                var b = a(this),
                    c = h.live,
                    d = h.getDate(!0),
                    e = b.attr("data-full"),
                    f = e.split("-"),
                    f = l(f[0], f[1], f[2]),
                    d = l(f.getFullYear(), f.getMonth(), f.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()),
                    i = b.hasClass("mbsc-cal-day-sel");
                if ((yb || !b.hasClass("mbsc-cal-day-diff")) && !1 !== h.trigger("onDayChange",
                        a.extend(Nb[e], {
                            date: d,
                            target: this,
                            selected: i
                        }))) h.needsSlide = !1, r = !0, h.setDate(d, c, 0.2, !c, !0), z.outerMonthChange && (ta = !0, f < z.getDate(pa, ra - xa, 1) ? A() : f > z.getDate(pa, ra - xa + oa, 0) && O(), ta = !1)
            }

            function v(a, b) {
                a.attr("data-curr", b);
                a[0].style[H + "Transform"] = "translate3d(" + (Oa ? "0," + b + "%," : b + "%,0,") + "0)"
            }

            function F(a) {
                h.isVisible() && da && (h.changing ? xb = a : t(pa, ra, a))
            }

            function O() {
                ta && z.getDate(pa, ra + oa - xa, 1) <= La && s.running && w(pa, ++ra, "next", 1, !1, !0, O)
            }

            function A() {
                ta && z.getDate(pa, ra - xa - 1, 1) >= wa && s.running &&
                    w(pa, --ra, "prev", 1, !1, !0, A)
            }

            function M(a) {
                ta && z.getDate(pa, ra, 1) <= z.getDate(z.getYear(La) - 1, z.getMonth(La) - bb, 1) && s.running ? w(++pa, ra, "next", ia, !0, !0, function() {
                    M(a)
                }) : ta && !a.hasClass("mbsc-fr-btn-d") && s.running && w(z.getYear(La), z.getMonth(La) - bb, "next", ia, !0, !0)
            }

            function R(a) {
                ta && z.getDate(pa, ra, 1) >= z.getDate(z.getYear(wa) + 1, z.getMonth(wa) + xa, 1) && s.running ? w(--pa, ra, "prev", ia, !0, !0, function() {
                    R(a)
                }) : ta && !a.hasClass("mbsc-fr-btn-d") && s.running && w(z.getYear(wa), z.getMonth(wa) + xa, "prev", ia, !0, !0)
            }

            function Q(a,
                b) {
                a.hasClass("mbsc-cal-v") || (a.addClass("mbsc-cal-v" + (b ? "" : " mbsc-cal-p-in")).removeClass("mbsc-cal-p-out mbsc-cal-h"), h.trigger("onSelectShow"))
            }

            function y(a, b) {
                a.hasClass("mbsc-cal-v") && a.removeClass("mbsc-cal-v mbsc-cal-p-in").addClass("mbsc-cal-h" + (b ? "" : " mbsc-cal-p-out"))
            }

            function P(a, b) {
                (b || a).hasClass("mbsc-cal-v") ? y(a) : Q(a)
            }

            function Y() {
                a(this).removeClass("mbsc-cal-p-out mbsc-cal-p-in")
            }
            var S, J, Z, ba, V, N, B, ca, la, $, aa, r, da, ga, ua, Fa, va, ha, ja, ma, ea, qa, ka, Ia, db, fa, na, Qa, Kb, wa, La, gb, zb, Ca, pa,
                ra, mb, Hb, Na, ib, Ha, Ba, Za, Mb, Bb, cb, Cb, ta, oa, Sa, bb, xa, xb, yb, Ya, Ma, vb, Pb = this,
                ab = [],
                za = [],
                sb = [],
                Da = {},
                Nb = {},
                wb = function() {},
                Ob = a.extend({}, h.settings),
                z = a.extend(h.settings, o, Ob),
                Xa = "full" == z.weekDays ? "" : "min" == z.weekDays ? "Min" : "Short",
                ya = z.weekCounter,
                lb = z.layout || (/top|bottom/.test(z.display) ? "liquid" : ""),
                U = "liquid" == lb && "bubble" !== z.display,
                Ga = "center" == z.display,
                sa = z.rtl,
                jb = sa ? -1 : 1,
                ub = U ? null : z.calendarWidth,
                Oa = "vertical" == z.calendarScroll,
                $a = z.quickNav,
                ia = z.preMonths,
                Ua = z.yearChange,
                fb = z.controls.join(","),
                qb = (!0 === z.tabs || !1 !== z.tabs && U) && 1 < z.controls.length,
                nb = !qb && z.tabs === b && !U && 1 < z.controls.length,
                ob = z.yearSuffix || "",
                hb = z.activeClass || "",
                tb = "mbsc-cal-tab-sel " + (z.activeTabClass || ""),
                Va = z.activeTabInnerClass || "",
                Ja = "mbsc-fr-btn-d " + (z.disabledClass || ""),
                Ka = "",
                Ea = "";
            fb.match(/calendar/) ? da = !0 : $a = !1;
            fb.match(/date/) && (Da.date = 1);
            fb.match(/time/) && (Da.time = 1);
            da && Da.date && (qb = !0, nb = !1);
            z.layout = lb;
            z.preset = (Da.date || da ? "date" : "") + (Da.time ? "time" : "");
            if ("inline" == z.display) a(this).closest('[data-role="page"]').on("pageshow",
                function() {
                    h.position()
                });
            h.changing = !1;
            h.needsSlide = !0;
            h.getDayProps = wb;
            h.onGenMonth = wb;
            h.prepareObj = E;
            h.refresh = function() {
                F(false)
            };
            h.redraw = function() {
                F(true)
            };
            h.navigate = function(a, b) {
                var c, d, e = h.isVisible();
                if (b && e) L(a, true);
                else {
                    c = z.getYear(a);
                    d = z.getMonth(a);
                    if (e && (c != pa || d != ra)) {
                        h.trigger("onMonthChange", {
                            year: c,
                            month: d
                        });
                        n(c, d);
                        t(c, d);
                        i(a.getFullYear(), a.getMonth(), true)
                    }
                    pa = c;
                    ra = d
                }
            };
            h.showMonthView = function() {
                if ($a && !ha) {
                    y(Ea, true);
                    y(Ka, true);
                    Q(va, true);
                    ha = true
                }
            };
            h.changeTab = function(b) {
                if (h._isVisible &&
                    Da[b] && Ba != b) {
                    Ba = b;
                    a(".mbsc-cal-pnl", N).removeClass("mbsc-cal-p-in").addClass("mbsc-cal-pnl-h");
                    a(".mbsc-cal-tab", N).removeClass(tb).removeAttr("aria-selected").find(".mbsc-cal-tab-i").removeClass(Va);
                    a('.mbsc-cal-tab[data-control="' + b + '"]', N).addClass(tb).attr("aria-selected", "true").find(".mbsc-cal-tab-i").addClass(Va);
                    Da[Ba].removeClass("mbsc-cal-pnl-h").addClass("mbsc-cal-p-in");
                    if (Ba == "calendar") {
                        S = h.getDate(true);
                        (S.getFullYear() !== Ca.getFullYear() || S.getMonth() !== Ca.getMonth() || S.getDate() !==
                            Ca.getDate()) && L(S)
                    }
                    h.showMonthView();
                    h.trigger("onTabChange", {
                        tab: Ba
                    })
                }
            };
            ba = g.datetime.call(this, h);
            ka = z.dateFormat.search(/m/i);
            db = z.dateFormat.search(/y/i);
            a.extend(ba, {
                ariaMessage: z.calendarText,
                onMarkupReady: function(c) {
                    var e, f = "";
                    N = a(c.target);
                    B = z.display == "inline" ? a(this).is("div") ? a(this) : a(this).parent() : h._window;
                    Ca = h.getDate(true);
                    if (!pa) {
                        pa = z.getYear(Ca);
                        ra = z.getMonth(Ca)
                    }
                    aa = 0;
                    ua = true;
                    Za = false;
                    ja = z.monthNames;
                    Ba = "calendar";
                    if (z.min) {
                        wa = l(z.min.getFullYear(), z.min.getMonth(), 1);
                        gb = z.min
                    } else gb =
                        wa = l(z.startYear, 0, 1);
                    if (z.max) {
                        La = l(z.max.getFullYear(), z.max.getMonth(), 1);
                        zb = z.max
                    } else zb = La = l(z.endYear, 11, 31, 23, 59, 59);
                    N.addClass("mbsc-calendar");
                    V = a(".mbsc-fr-popup", N);
                    Ha = a(".mbsc-fr-c", N);
                    Da.date ? Da.date = a(".mbsc-sc-whl-gr-c", N).eq(0) : da && a(".mbsc-sc-whl-gr-c", N).eq(0).addClass("mbsc-cal-hdn");
                    if (Da.time) Da.time = a(".mbsc-sc-whl-gr-c", N).eq(1);
                    if (da) {
                        oa = z.months == "auto" ? Math.max(1, Math.min(3, Math.floor((ub || B[0].innerWidth || B.innerWidth()) / 280))) : z.months;
                        Sa = oa + 2 * ia;
                        bb = Math.floor(oa / 2);
                        xa =
                            Math.round(oa / 2) - 1;
                        yb = z.showOuterDays === b ? oa < 2 : z.showOuterDays;
                        Oa = Oa && oa < 2;
                        c = '<div class="mbsc-cal-btnw"><div class="' + (sa ? "mbsc-cal-next-m" : "mbsc-cal-prev-m") + ' mbsc-cal-prev mbsc-cal-btn mbsc-fr-btn mbsc-fr-btn-e"><div role="button" tabindex="0" class="mbsc-cal-btn-txt ' + (z.btnCalPrevClass || "") + '" aria-label="' + z.prevMonthText + '"></div></div>';
                        for (J = 0; J < oa; ++J) c = c + ('<div class="mbsc-cal-btnw-m" style="width: ' + 100 / oa + '%"><span role="button" class="mbsc-cal-month"></span></div>');
                        c = c + ('<div class="' +
                            (sa ? "mbsc-cal-prev-m" : "mbsc-cal-next-m") + ' mbsc-cal-next mbsc-cal-btn mbsc-fr-btn mbsc-fr-btn-e"><div role="button" tabindex="0" class="mbsc-cal-btn-txt ' + (z.btnCalNextClass || "") + '" aria-label="' + z.nextMonthText + '"></div></div></div>');
                        Ua && (f = '<div class="mbsc-cal-btnw"><div class="' + (sa ? "mbsc-cal-next-y" : "mbsc-cal-prev-y") + ' mbsc-cal-prev mbsc-cal-btn mbsc-fr-btn mbsc-fr-btn-e"><div role="button" tabindex="0" class="mbsc-cal-btn-txt ' + (z.btnCalPrevClass || "") + '" aria-label="' + z.prevYearText + '"></div></div><span role="button" class="mbsc-cal-year"></span><div class="' +
                            (sa ? "mbsc-cal-prev-y" : "mbsc-cal-next-y") + ' mbsc-cal-next mbsc-cal-btn mbsc-fr-btn mbsc-fr-btn-e"><div role="button" tabindex="0" class="mbsc-cal-btn-txt ' + (z.btnCalNextClass || "") + '" aria-label="' + z.nextYearText + '"></div></div></div>');
                        if ($a) {
                            fa = z.getYear(wa);
                            na = z.getYear(La);
                            Qa = z.getMonth(wa);
                            Kb = z.getMonth(La);
                            Hb = Math.ceil((na - fa + 1) / 12) + 2;
                            Ka = I("month", 36, 24, 0, "", z.monthNames, z.monthNamesShort);
                            Ea = I("year", Hb * 12, na - fa + 13, fa, ob)
                        }
                        ga = '<div class="mbsc-w-p mbsc-cal-c"><div class="mbsc-cal mbsc-cal-hl-now' +
                            (oa > 1 ? " mbsc-cal-multi " : "") + (ya ? " mbsc-cal-weeks " : "") + (Oa ? " mbsc-cal-vertical" : "") + (yb ? "" : " mbsc-cal-hide-diff ") + (z.calendarClass || "") + '"><div class="mbsc-cal-header"><div class="mbsc-cal-btnc ' + (Ua ? "mbsc-cal-btnc-ym" : "mbsc-cal-btnc-m") + '">' + (db < ka || oa > 1 ? f + c : c + f) + '</div></div><div class="mbsc-cal-body"><div class="mbsc-cal-m-c mbsc-cal-v"><div class="mbsc-cal-days-c">';
                        for (Z = 0; Z < oa; ++Z) {
                            ga = ga + ('<div aria-hidden="true" class="mbsc-cal-days" style="width: ' + 100 / oa + '%"><table cellpadding="0" cellspacing="0"><tr>');
                            for (J = 0; J < 7; J++) ga = ga + ("<th>" + z["dayNames" + Xa][(J + z.firstDay) % 7] + "</th>");
                            ga = ga + "</tr></table></div>"
                        }
                        ga = ga + ('</div><div class="mbsc-cal-anim-c ' + (z.calendarClass || "") + '"><div class="mbsc-cal-week-nrs-c ' + (z.weekNrClass || "") + '"><div class="mbsc-cal-week-nrs"></div></div><div class="mbsc-cal-anim">');
                        for (J = 0; J < oa + 2 * ia; J++) ga = ga + '<div class="mbsc-cal-slide" aria-hidden="true"></div>';
                        ga = ga + ("</div></div></div>" + Ka + Ea + "</div></div></div>");
                        Da.calendar = a(ga)
                    }
                    a.each(z.controls, function(b, c) {
                        Da[c] = a('<div class="mbsc-cal-pnl" id="' +
                            (Pb.id + "_dw_pnl_" + b) + '"></div>').append(a('<div class="mbsc-cal-pnl-i"></div>').append(Da[c])).appendTo(Ha)
                    });
                    e = '<div class="mbsc-cal-tabs"><ul role="tablist">';
                    a.each(z.controls, function(a, b) {
                        Da[b] && (e = e + ('<li role="tab" aria-controls="' + (Pb.id + "_dw_pnl_" + a) + '" class="mbsc-cal-tab ' + (a ? "" : tb) + '" data-control="' + b + '"><a href="#" class="mbsc-fr-btn-e mbsc-fr-btn-nhl mbsc-cal-tab-i ' + (!a ? Va : "") + '">' + z[b + "Text"] + "</a></li>"))
                    });
                    e = e + "</ul></div>";
                    Ha.before(e);
                    ca = a(".mbsc-cal-anim-c", N);
                    la = a(".mbsc-cal-anim",
                        ca);
                    Fa = a(".mbsc-cal-week-nrs", ca);
                    if (da) {
                        ha = true;
                        ab = a(".mbsc-cal-slide", la).each(function(b, c) {
                            za.push(a(c))
                        });
                        ab.slice(ia, ia + oa).addClass("mbsc-cal-slide-a").removeAttr("aria-hidden");
                        for (J = 0; J < Sa; J++) v(za[J], 100 * (J - ia) * jb);
                        t(pa, ra);
                        ma = new k.classes.ScrollView(ca[0], {
                            axis: Oa ? "Y" : "X",
                            easing: "",
                            contSize: 0,
                            snap: 1,
                            maxSnapScroll: ia,
                            moveElement: la,
                            mousewheel: z.mousewheel,
                            time: 200,
                            lock: true,
                            stopProp: false,
                            onGestureStart: function(a, b) {
                                b.settings.scrollLock = h.scrollLock
                            },
                            onAnimationEnd: function(a) {
                                (a = Math.round(((Oa ?
                                    a.posY : a.posX) - aa) / $) * jb) && w(pa, ra - a, a > 0 ? "prev" : "next", a > 0 ? a : -a)
                            }
                        })
                    }
                    qa = a(".mbsc-cal-month", N);
                    Ia = a(".mbsc-cal-year", N);
                    va = a(".mbsc-cal-m-c", N);
                    if ($a) {
                        va.on("webkitAnimationEnd animationend", Y);
                        Ka = a(".mbsc-cal-month-c", N).on("webkitAnimationEnd animationend", Y);
                        Ea = a(".mbsc-cal-year-c", N).on("webkitAnimationEnd animationend", Y);
                        a(".mbsc-cal-sc-p", N);
                        mb = {
                            axis: Oa ? "Y" : "X",
                            contSize: 0,
                            snap: 1,
                            maxSnapScroll: 1,
                            rtl: z.rtl,
                            mousewheel: z.mousewheel,
                            time: 200
                        };
                        Ya = new k.classes.ScrollView(Ea[0], mb);
                        ea = new k.classes.ScrollView(Ka[0],
                            mb)
                    }
                    U ? N.addClass("mbsc-cal-liq") : a(".mbsc-cal", N).width(ub || 280 * oa);
                    z.calendarHeight && a(".mbsc-cal-anim-c", N).height(z.calendarHeight);
                    h.tap(ca, function(b) {
                        b = a(b.target);
                        if (!Za && !ma.scrolled && z.readonly !== true) {
                            b = b.closest(".mbsc-cal-day", this);
                            b.hasClass("mbsc-cal-day-v") && T.call(b[0])
                        }
                    });
                    a(".mbsc-cal-btn", N).on("touchstart mousedown keydown", G).on("touchmove", C).on("touchend touchcancel keyup", m);
                    a(".mbsc-cal-tab", N).on("touchstart click", function(b) {
                        x(b, this) && s.running && h.changeTab(a(this).attr("data-control"))
                    });
                    if ($a) {
                        h.tap(a(".mbsc-cal-month", N), function() {
                            if (!Ea.hasClass("mbsc-cal-v")) {
                                P(va);
                                ha = va.hasClass("mbsc-cal-v")
                            }
                            P(Ka);
                            y(Ea)
                        });
                        h.tap(a(".mbsc-cal-year", N), function() {
                            Ea.hasClass("mbsc-cal-v") || Ya.scroll(Ma);
                            if (!Ka.hasClass("mbsc-cal-v")) {
                                P(va);
                                ha = va.hasClass("mbsc-cal-v")
                            }
                            P(Ea);
                            y(Ka)
                        });
                        h.tap(a(".mbsc-cal-month-s", N), function() {
                            !ea.scrolled && !a(this).hasClass("mbsc-fr-btn-d") && h.navigate(z.getDate(pa, a(this).attr("data-val"), 1))
                        });
                        h.tap(a(".mbsc-cal-year-s", N), function() {
                            if (!Ya.scrolled) {
                                S = z.getDate(a(this).attr("data-val"),
                                    ra, 1);
                                h.navigate(new Date(d.constrain(S, wa, La)))
                            }
                        });
                        h.tap(Ea, function() {
                            if (!Ya.scrolled) {
                                y(Ea);
                                Q(va);
                                ha = true
                            }
                        });
                        h.tap(Ka, function() {
                            if (!ea.scrolled) {
                                y(Ka);
                                Q(va);
                                ha = true
                            }
                        })
                    }
                },
                onShow: function() {
                    da && n(pa, ra)
                },
                onPosition: function(b) {
                    var c, d, e, f = 0,
                        g = 0,
                        j = 0,
                        k = b.windowHeight;
                    if (U) {
                        Ga && ca.height("");
                        Ha.height("");
                        la.width("")
                    }
                    $ && (e = $);
                    da && ($ = Math.round(Math.round(ca[0][Oa ? "offsetHeight" : "offsetWidth"]) / oa));
                    if ($) {
                        N.removeClass("mbsc-cal-m mbsc-cal-l");
                        $ > 1024 ? N.addClass("mbsc-cal-l") : $ > 640 && N.addClass("mbsc-cal-m")
                    }
                    if (qb &&
                        (ua || U) || nb) {
                        a(".mbsc-cal-pnl", N).removeClass("mbsc-cal-pnl-h");
                        a.each(Da, function(a, b) {
                            c = b[0].offsetWidth;
                            f = Math.max(f, c);
                            g = Math.max(g, b[0].offsetHeight);
                            j = j + c
                        });
                        if (qb || nb && j > (B[0].innerWidth || B.innerWidth())) {
                            d = true;
                            Ba = a(".mbsc-cal-tabs .mbsc-cal-tab-sel", N).attr("data-control");
                            V.addClass("mbsc-cal-tabbed")
                        } else {
                            Ba = "calendar";
                            g = f = "";
                            V.removeClass("mbsc-cal-tabbed");
                            Ha.css({
                                width: "",
                                height: ""
                            })
                        }
                    }
                    if (U && Ga && da) {
                        h._isFullScreen = true;
                        d && Ha.height(Da.calendar[0].offsetHeight);
                        b = V[0].offsetHeight;
                        k >=
                            b && ca.height(k - b + ca[0].offsetHeight);
                        g = Math.max(g, Da.calendar[0].offsetHeight)
                    }
                    if (d) {
                        Ha.css({
                            width: U ? "" : f,
                            height: g
                        });
                        da && ($ = Math.round(Math.round(ca[0][Oa ? "offsetHeight" : "offsetWidth"]) / oa))
                    }
                    if ($) {
                        la[Oa ? "height" : "width"]($);
                        if ($ !== e) {
                            if (Ua) {
                                ja = z.maxMonthWidth > a(".mbsc-cal-btnw-m", N).width() ? z.monthNamesShort : z.monthNames;
                                for (J = 0; J < oa; ++J) a(qa[J]).text(ja[z.getMonth(z.getDate(pa, ra - xa + J, 1))])
                            }
                            if ($a) {
                                b = Ea[0][Oa ? "offsetHeight" : "offsetWidth"];
                                a.extend(Ya.settings, {
                                    contSize: b,
                                    snap: b,
                                    minScroll: (2 - Hb) * b,
                                    maxScroll: -b
                                });
                                a.extend(ea.settings, {
                                    contSize: b,
                                    snap: b,
                                    minScroll: -b,
                                    maxScroll: -b
                                });
                                Ya.refresh();
                                ea.refresh();
                                Ea.hasClass("mbsc-cal-v") && Ya.scroll(Ma)
                            }
                            if (U && !ua && e) {
                                b = aa / e;
                                aa = b * $
                            }
                            i(pa, ra, !e)
                        }
                    } else $ = e;
                    if (d) {
                        a(".mbsc-cal-pnl", N).addClass("mbsc-cal-pnl-h");
                        Da[Ba].removeClass("mbsc-cal-pnl-h")
                    }
                    h.trigger("onCalResize");
                    ua = false
                },
                onHide: function() {
                    sb = [];
                    za = [];
                    ra = pa = Ba = null;
                    Za = true;
                    $ = 0;
                    ma && ma.destroy();
                    if ($a && Ya && ea) {
                        Ya.destroy();
                        ea.destroy()
                    }
                },
                onValidated: function(a) {
                    var b, c, d;
                    c = h.getDate(true);
                    if (r) b =
                        "calendar";
                    else
                        for (d in h.order) d && h.order[d] === a && (b = /[mdy]/.test(d) ? "date" : "time");
                    h.trigger("onSetDate", {
                        date: c,
                        control: b
                    });
                    L(c);
                    r = false
                }
            });
            return ba
        }
    })(window, document);
    (function(h) {
        var e = s,
            b = e.$,
            k = e.classes,
            a = e.util,
            g = a.constrain,
            d = a.jsPrefix,
            l = a.prefix,
            H = a.getCoord,
            x = a.getPosition,
            q = a.testTouch,
            o = a.isNumeric,
            u = a.isString,
            G = /(iphone|ipod|ipad)/i.test(navigator.userAgent),
            C = window.requestAnimationFrame || function(a) {
                a()
            },
            m = window.cancelAnimationFrame || function() {};
        k.ScrollView = function(a, e, c) {
            function I(a) {
                ma("onStart");
                fa.stopProp && a.stopPropagation();
                (fa.prevDef || "mousedown" == a.type) && a.preventDefault();
                if (!(fa.readonly || fa.lock && ba) && q(a, this) && !Z && s.running)
                    if (i && i.removeClass("mbsc-btn-a"), P = !1, ba || (i = b(a.target).closest(".mbsc-btn-e", this), i.length && !i.hasClass("mbsc-btn-d") && (P = !0, p = setTimeout(function() {
                            i.addClass("mbsc-btn-a")
                        }, 100))), Z = !0, V = ca = !1, qa.scrolled = ba, ua = H(a, "X"), Fa = H(a, "Y"), R = ua, F = v = T = 0, ga = new Date, da = +x(ha, ea) || 0, t(da, G ? 0 : 1), "mousedown" === a.type) b(document).on("mousemove", j).on("mouseup", K)
            }

            function j(a) {
                if (Z) {
                    fa.stopProp && a.stopPropagation();
                    R = H(a, "X");
                    Q = H(a, "Y");
                    T = R - ua;
                    v = Q - Fa;
                    F = ea ? v : T;
                    if (P && (5 < Math.abs(v) || 5 < Math.abs(T))) clearTimeout(p), i.removeClass("mbsc-btn-a"), P = !1;
                    if (qa.scrolled || !V && 5 < Math.abs(F)) ca || ma("onGestureStart", y), qa.scrolled = ca = !0, B || (B = !0, N = C(n));
                    ea || fa.scrollLock ? a.preventDefault() : qa.scrolled ? a.preventDefault() : 7 < Math.abs(v) && (V = !0, qa.scrolled = !0, na.trigger("touchend"))
                }
            }

            function n() {
                S && (F = g(F, -aa * S, aa * S));
                t(g(da + F, J - M, Y + M));
                B = !1
            }

            function K(a) {
                if (Z) {
                    var c;
                    c = new Date -
                        ga;
                    fa.stopProp && a.stopPropagation();
                    m(N);
                    B = !1;
                    !V && qa.scrolled && (fa.momentum && 300 > c && (c = F / c, F = Math.max(Math.abs(F), c * c / fa.speedUnit) * (0 > F ? -1 : 1)), L(F));
                    P && (clearTimeout(p), i.addClass("mbsc-btn-a"), setTimeout(function() {
                        i.removeClass("mbsc-btn-a")
                    }, 100), !V && !qa.scrolled && ma("onBtnTap", {
                        target: i[0]
                    }));
                    "mouseup" == a.type && b(document).off("mousemove", j).off("mouseup", K);
                    Z = !1
                }
            }

            function D(a) {
                a = a.originalEvent || a;
                F = ea ? a.deltaY || a.wheelDelta || a.detail : a.deltaX;
                ma("onStart");
                fa.stopProp && a.stopPropagation();
                if (F && s.running && (a.preventDefault(), !fa.readonly)) F = 0 > F ? 20 : -20, da = ka, ca || (y = {
                    posX: ea ? 0 : ka,
                    posY: ea ? ka : 0,
                    originX: ea ? 0 : da,
                    originY: ea ? da : 0,
                    direction: 0 < F ? ea ? 270 : 360 : ea ? 90 : 180
                }, ma("onGestureStart", y)), B || (B = !0, N = C(n)), ca = !0, clearTimeout(la), la = setTimeout(function() {
                    m(N);
                    ca = B = false;
                    L(F)
                }, 200)
            }

            function L(a) {
                var b;
                S && (a = g(a, -aa * S, aa * S));
                Ia = Math.round((da + a) / aa);
                b = g(Ia * aa, J, Y);
                if (r) {
                    if (0 > a)
                        for (a = r.length - 1; 0 <= a; a--) {
                            if (Math.abs(b) + w >= r[a].breakpoint) {
                                Ia = a;
                                db = 2;
                                b = r[a].snap2;
                                break
                            }
                        } else if (0 <= a)
                            for (a = 0; a < r.length; a++)
                                if (Math.abs(b) <=
                                    r[a].breakpoint) {
                                    Ia = a;
                                    db = 1;
                                    b = r[a].snap1;
                                    break
                                }
                    b = g(b, J, Y)
                }
                a = fa.time || (ka < J || ka > Y ? 200 : Math.max(200, Math.abs(b - ka) * fa.timeUnit));
                y.destinationX = ea ? 0 : b;
                y.destinationY = ea ? b : 0;
                y.duration = a;
                y.transitionTiming = A;
                ma("onGestureEnd", y);
                t(b, a)
            }

            function t(a, b, c) {
                var e = a != ka,
                    f = 1 < b,
                    i = function() {
                        clearInterval($);
                        ba = !1;
                        ka = a;
                        y.posX = ea ? 0 : a;
                        y.posY = ea ? a : 0;
                        e && ma("onMove", y);
                        f && ma("onAnimationEnd", y);
                        c && c()
                    };
                y = {
                    posX: ea ? 0 : ka,
                    posY: ea ? ka : 0,
                    originX: ea ? 0 : da,
                    originY: ea ? da : 0,
                    direction: 0 < a - ka ? ea ? 270 : 360 : ea ? 90 : 180
                };
                ka = a;
                f && (y.destinationX =
                    ea ? 0 : a, y.destinationY = ea ? a : 0, y.duration = b, y.transitionTiming = A, ma("onAnimationStart", y));
                va[d + "Transition"] = b ? l + "transform " + Math.round(b) + "ms " + A : "";
                va[d + "Transform"] = "translate3d(" + (ea ? "0," + a + "px," : a + "px,0,") + "0)";
                !e && !ba || !b || 1 >= b ? i() : b && (ba = !0, clearInterval($), $ = setInterval(function() {
                    var a = +x(ha, ea) || 0;
                    y.posX = ea ? 0 : a;
                    y.posY = ea ? a : 0;
                    ma("onMove", y)
                }, 100), clearTimeout(ja), ja = setTimeout(function() {
                    i();
                    va[d + "Transition"] = ""
                }, b))
            }
            var i, p, w, T, v, F, O, A, M, R, Q, y, P, Y, S, J, Z, ba, V, N, B, ca, la, $, aa, r, da, ga, ua, Fa,
                va, ha, ja, ma, ea, qa = this,
                ka, Ia = 0,
                db = 1,
                fa = e,
                na = b(a);
            k.Base.call(this, a, e, !0);
            qa.scrolled = !1;
            qa.scroll = function(c, d, e) {
                c = o(c) ? Math.round(c / aa) * aa : Math.ceil((b(c, a).length ? Math.round(ha.offset()[O] - b(c, a).offset()[O]) : ka) / aa) * aa;
                Ia = Math.round(c / aa);
                da = ka;
                t(g(c, J, Y), d, e)
            };
            qa.refresh = function(a) {
                var b;
                w = fa.contSize === h ? ea ? na.height() : na.width() : fa.contSize;
                J = fa.minScroll === h ? ea ? w - ha.height() : w - ha.width() : fa.minScroll;
                Y = fa.maxScroll === h ? 0 : fa.maxScroll;
                !ea && fa.rtl && (b = Y, Y = -J, J = -b);
                u(fa.snap) && (r = [], ha.find(fa.snap).each(function() {
                    var a =
                        ea ? this.offsetTop : this.offsetLeft,
                        b = ea ? this.offsetHeight : this.offsetWidth;
                    r.push({
                        breakpoint: a + b / 2,
                        snap1: -a,
                        snap2: w - a - b
                    })
                }));
                aa = o(fa.snap) ? fa.snap : 1;
                S = fa.snap ? fa.maxSnapScroll : 0;
                A = fa.easing;
                M = fa.elastic ? o(fa.snap) ? aa : o(fa.elastic) ? fa.elastic : 0 : 0;
                ka === h && (ka = fa.initialPos, Ia = Math.round(ka / aa));
                a || qa.scroll(fa.snap ? r ? r[Ia]["snap" + db] : Ia * aa : ka)
            };
            qa.init = function(b) {
                qa._init(b);
                O = (ea = "Y" == fa.axis) ? "top" : "left";
                ha = fa.moveElement || na.children().eq(0);
                va = ha[0].style;
                qa.refresh();
                na.on("touchstart mousedown",
                    I).on("touchmove", j).on("touchend touchcancel", K);
                if (fa.mousewheel) na.on("wheel mousewheel", D);
                a.addEventListener && a.addEventListener("click", function(a) {
                    qa.scrolled && (qa.scrolled = !1, a.stopPropagation(), a.preventDefault())
                }, !0)
            };
            qa.destroy = function() {
                clearInterval($);
                na.off("touchstart mousedown", I).off("touchmove", j).off("touchend touchcancel", K).off("wheel mousewheel", D);
                qa._destroy()
            };
            fa = qa.settings;
            ma = qa.trigger;
            c || qa.init(e)
        };
        k.ScrollView.prototype = {
            _class: "scrollview",
            _defaults: {
                speedUnit: 0.0022,
                timeUnit: 0.8,
                initialPos: 0,
                axis: "Y",
                easing: "ease-out",
                stopProp: !0,
                momentum: !0,
                mousewheel: !0,
                elastic: !0
            }
        };
        e.presetShort("scrollview", "ScrollView", !1)
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = e.util.datetime,
            a = k.adjustedDate,
            g = new Date,
            d = {
                startYear: g.getFullYear() - 100,
                endYear: g.getFullYear() + 1,
                separator: " ",
                dateFormat: "mm/dd/yy",
                dateDisplay: "MMddyy",
                timeFormat: "hh:ii A",
                dayText: "Day",
                monthText: "Month",
                yearText: "Year",
                hourText: "Hours",
                minuteText: "Minutes",
                ampmText: "&nbsp;",
                secText: "Seconds",
                nowText: "Now"
            },
            l =
            function(g) {
                function l(a, b, c) {
                    return y[b] !== h && (a = +a[y[b]], !isNaN(a)) ? a : P[b] !== h ? P[b] : c !== h ? c : Y[b]($)
                }

                function q(a) {
                    return {
                        value: a,
                        display: (ba.match(/yy/i) ? a : (a + "").substr(2, 2)) + (A.yearSuffix || "")
                    }
                }

                function o(a) {
                    return a
                }

                function u(a, b, c, d, e, f, i) {
                    b.push({
                        data: d,
                        label: c,
                        min: f,
                        max: i,
                        getIndex: e,
                        cssClass: a
                    })
                }

                function G(a, b, c, d) {
                    return Math.min(d, Math.floor(a / b) * b + c)
                }

                function C(a) {
                    if (null === a) return a;
                    var b = l(a, "y"),
                        c = l(a, "m"),
                        d = Math.min(l(a, "d"), A.getMaxDayOfMonth(b, c)),
                        e = l(a, "h", 0);
                    return A.getDate(b,
                        c, d, l(a, "a", 0) ? e + 12 : e, l(a, "i", 0), l(a, "s", 0), l(a, "u", 0))
                }

                function m(a, b) {
                    var c, d, e = !1,
                        i = !1,
                        g = 0,
                        h = 0;
                    ga = C(j(ga));
                    ua = C(j(ua));
                    if (f(a)) return a;
                    a < ga && (a = ga);
                    a > ua && (a = ua);
                    d = c = a;
                    if (2 !== b)
                        for (e = f(c); !e && c < ua;) c = new Date(c.getTime() + 864E5), e = f(c), g++;
                    if (1 !== b)
                        for (i = f(d); !i && d > ga;) d = new Date(d.getTime() - 864E5), i = f(d), h++;
                    return 1 === b && e ? c : 2 === b && i ? d : h <= g && i ? d : c
                }

                function f(a) {
                    return a < ga || a > ua ? !1 : E(a, J) ? !0 : E(a, S) ? !1 : !0
                }

                function E(a, b) {
                    var c, d, e;
                    if (b)
                        for (d = 0; d < b.length; d++)
                            if (c = b[d], e = c + "", !c.start)
                                if (c.getTime) {
                                    if (a.getFullYear() ==
                                        c.getFullYear() && a.getMonth() == c.getMonth() && a.getDate() == c.getDate()) return !0
                                } else if (e.match(/w/i)) {
                        if (e = +e.replace("w", ""), e == a.getDay()) return !0
                    } else if (e = e.split("/"), e[1]) {
                        if (e[0] - 1 == a.getMonth() && e[1] == a.getDate()) return !0
                    } else if (e[0] == a.getDate()) return !0;
                    return !1
                }

                function c(a, b, c, d, e, f, i) {
                    var g, h, j;
                    if (a)
                        for (g = 0; g < a.length; g++)
                            if (h = a[g], j = h + "", !h.start)
                                if (h.getTime) A.getYear(h) == b && A.getMonth(h) == c && (f[A.getDay(h)] = i);
                                else if (j.match(/w/i)) {
                        j = +j.replace("w", "");
                        for (p = j - d; p < e; p += 7) 0 <= p && (f[p +
                            1] = i)
                    } else j = j.split("/"), j[1] ? j[0] - 1 == c && (f[j[1]] = i) : f[j[0]] = i
                }

                function s(a, c, d, e, f, i, g, j, k) {
                    var l, y, m, p, o, t, w, q, u, n, S, J, Q, x, C, H, P, B, E = {},
                        D = {
                            h: aa,
                            i: r,
                            s: da,
                            a: 1
                        },
                        T = A.getDate(f, i, g),
                        Z = ["a", "h", "i", "s"];
                    a && (b.each(a, function(a, b) {
                        if (b.start && (b.apply = !1, l = b.d, y = l + "", m = y.split("/"), l && (l.getTime && f == A.getYear(l) && i == A.getMonth(l) && g == A.getDay(l) || !y.match(/w/i) && (m[1] && g == m[1] && i == m[0] - 1 || !m[1] && g == m[0]) || y.match(/w/i) && T.getDay() == +y.replace("w", "")))) b.apply = !0, E[T] = !0
                    }), b.each(a, function(a, b) {
                        x = Q =
                            0;
                        S = v[d];
                        J = F[d];
                        w = t = !0;
                        C = !1;
                        if (b.start && (b.apply || !b.d && !E[T])) {
                            p = b.start.split(":");
                            o = b.end.split(":");
                            for (n = 0; 3 > n; n++) p[n] === h && (p[n] = 0), o[n] === h && (o[n] = 59), p[n] = +p[n], o[n] = +o[n];
                            p.unshift(11 < p[0] ? 1 : 0);
                            o.unshift(11 < o[0] ? 1 : 0);
                            ca && (12 <= p[1] && (p[1] -= 12), 12 <= o[1] && (o[1] -= 12));
                            for (n = 0; n < c; n++)
                                if (R[n] !== h) {
                                    q = G(p[n], D[Z[n]], v[Z[n]], F[Z[n]]);
                                    u = G(o[n], D[Z[n]], v[Z[n]], F[Z[n]]);
                                    B = P = H = 0;
                                    ca && 1 == n && (H = p[0] ? 12 : 0, P = o[0] ? 12 : 0, B = R[0] ? 12 : 0);
                                    t || (q = 0);
                                    w || (u = F[Z[n]]);
                                    if ((t || w) && q + H < R[n] + B && R[n] + B < u + P) C = !0;
                                    R[n] != q && (t = !1);
                                    R[n] != u && (w = !1)
                                }
                            if (!k)
                                for (n = c + 1; 4 > n; n++) 0 < p[n] && (Q = D[d]), o[n] < F[Z[n]] && (x = D[d]);
                            C || (q = G(p[c], D[d], v[d], F[d]) + Q, u = G(o[c], D[d], v[d], F[d]) - x, t && (S = q), w && (J = u + 1));
                            if (t || w || C)
                                for (n = S; n < J; n++) j[n] = !k
                        }
                    }))
                }

                function j(a, c) {
                    var d = [];
                    if (null === a || a === h) return a;
                    b.each("y,m,d,a,h,i,s,u".split(","), function(b, e) {
                        y[e] !== h && (d[y[e]] = Y[e](a));
                        c && (P[e] = Y[e](a))
                    });
                    return d
                }

                function n(b) {
                    var c, d, e, f = [];
                    if (b) {
                        for (c = 0; c < b.length; c++)
                            if (d = b[c], d.start && d.start.getTime)
                                for (e = new Date(d.start); e <= d.end;) f.push(a(e.getFullYear(),
                                    e.getMonth(), e.getDate())), e.setDate(e.getDate() + 1);
                            else f.push(d);
                        return f
                    }
                    return b
                }
                var K = b(this),
                    D = {},
                    L;
                if (K.is("input")) {
                    switch (K.attr("type")) {
                        case "date":
                            L = "yy-mm-dd";
                            break;
                        case "datetime":
                            L = "yy-mm-ddTHH:ii:ssZ";
                            break;
                        case "datetime-local":
                            L = "yy-mm-ddTHH:ii:ss";
                            break;
                        case "month":
                            L = "yy-mm";
                            D.dateOrder = "mmyy";
                            break;
                        case "time":
                            L = "HH:ii:ss"
                    }
                    var t = K.attr("min"),
                        K = K.attr("max");
                    t && (D.minDate = k.parseDate(L, t));
                    K && (D.maxDate = k.parseDate(L, K))
                }
                var i, p, w, T, v, F, O, t = b.extend({}, g.settings),
                    A = b.extend(g.settings,
                        e.util.datetime.defaults, d, D, t),
                    M = 0,
                    R = [],
                    D = [],
                    Q = [],
                    y = {},
                    P = {},
                    Y = {
                        y: function(a) {
                            return A.getYear(a)
                        },
                        m: function(a) {
                            return A.getMonth(a)
                        },
                        d: function(a) {
                            return A.getDay(a)
                        },
                        h: function(a) {
                            a = a.getHours();
                            a = ca && 12 <= a ? a - 12 : a;
                            return G(a, aa, Fa, ja)
                        },
                        i: function(a) {
                            return G(a.getMinutes(), r, va, ma)
                        },
                        s: function(a) {
                            return G(a.getSeconds(), da, ha, ea)
                        },
                        u: function(a) {
                            return a.getMilliseconds()
                        },
                        a: function(a) {
                            return B && 11 < a.getHours() ? 1 : 0
                        }
                    },
                    S = A.invalid,
                    J = A.valid,
                    t = A.preset,
                    Z = A.dateWheels || A.dateFormat,
                    ba = A.dateWheels ||
                    A.dateDisplay,
                    V = A.timeWheels || A.timeFormat,
                    N = ba.match(/D/),
                    B = V.match(/a/i),
                    ca = V.match(/h/),
                    la = "datetime" == t ? A.dateFormat + A.separator + A.timeFormat : "time" == t ? A.timeFormat : A.dateFormat,
                    $ = new Date,
                    K = A.steps || {},
                    aa = K.hour || A.stepHour || 1,
                    r = K.minute || A.stepMinute || 1,
                    da = K.second || A.stepSecond || 1,
                    K = K.zeroBased,
                    ga = A.min || a(A.startYear, 0, 1),
                    ua = A.max || a(A.endYear, 11, 31, 23, 59, 59),
                    Fa = K ? 0 : ga.getHours() % aa,
                    va = K ? 0 : ga.getMinutes() % r,
                    ha = K ? 0 : ga.getSeconds() % da,
                    ja = Math.floor(((ca ? 11 : 23) - Fa) / aa) * aa + Fa,
                    ma = Math.floor((59 -
                        va) / r) * r + va,
                    ea = Math.floor((59 - va) / r) * r + va;
                L = L || la;
                if (t.match(/date/i)) {
                    b.each(["y", "m", "d"], function(a, b) {
                        i = Z.search(RegExp(b, "i")); - 1 < i && Q.push({
                            o: i,
                            v: b
                        })
                    });
                    Q.sort(function(a, b) {
                        return a.o > b.o ? 1 : -1
                    });
                    b.each(Q, function(a, b) {
                        y[b.v] = a
                    });
                    K = [];
                    for (p = 0; 3 > p; p++)
                        if (p == y.y) M++, u("mbsc-dt-whl-y", K, A.yearText, q, o, A.getYear(ga), A.getYear(ua));
                        else if (p == y.m) {
                        M++;
                        w = [];
                        for (i = 0; 12 > i; i++) O = ba.replace(/[dy]/gi, "").replace(/mm/, (9 > i ? "0" + (i + 1) : i + 1) + (A.monthSuffix || "")).replace(/m/, i + 1 + (A.monthSuffix || "")), w.push({
                            value: i,
                            display: O.match(/MM/) ? O.replace(/MM/, '<span class="mbsc-dt-month">' + A.monthNames[i] + "</span>") : O.replace(/M/, '<span class="mbsc-dt-month">' + A.monthNamesShort[i] + "</span>")
                        });
                        u("mbsc-dt-whl-m", K, A.monthText, w)
                    } else if (p == y.d) {
                        M++;
                        w = [];
                        for (i = 1; 32 > i; i++) w.push({
                            value: i,
                            display: (ba.match(/dd/i) && 10 > i ? "0" + i : i) + (A.daySuffix || "")
                        });
                        u("mbsc-dt-whl-d", K, A.dayText, w)
                    }
                    D.push(K)
                }
                if (t.match(/time/i)) {
                    T = !0;
                    Q = [];
                    b.each(["h", "i", "s", "a"], function(a, b) {
                        a = V.search(RegExp(b, "i")); - 1 < a && Q.push({
                            o: a,
                            v: b
                        })
                    });
                    Q.sort(function(a,
                        b) {
                        return a.o > b.o ? 1 : -1
                    });
                    b.each(Q, function(a, b) {
                        y[b.v] = M + a
                    });
                    K = [];
                    for (p = M; p < M + 4; p++)
                        if (p == y.h) {
                            M++;
                            w = [];
                            for (i = Fa; i < (ca ? 12 : 24); i += aa) w.push({
                                value: i,
                                display: ca && 0 === i ? 12 : V.match(/hh/i) && 10 > i ? "0" + i : i
                            });
                            u("mbsc-dt-whl-h", K, A.hourText, w)
                        } else if (p == y.i) {
                        M++;
                        w = [];
                        for (i = va; 60 > i; i += r) w.push({
                            value: i,
                            display: V.match(/ii/) && 10 > i ? "0" + i : i
                        });
                        u("mbsc-dt-whl-i", K, A.minuteText, w)
                    } else if (p == y.s) {
                        M++;
                        w = [];
                        for (i = ha; 60 > i; i += da) w.push({
                            value: i,
                            display: V.match(/ss/) && 10 > i ? "0" + i : i
                        });
                        u("mbsc-dt-whl-s", K, A.secText, w)
                    } else p ==
                        y.a && (M++, t = V.match(/A/), u("mbsc-dt-whl-a", K, A.ampmText, t ? [{
                            value: 0,
                            display: A.amText.toUpperCase()
                        }, {
                            value: 1,
                            display: A.pmText.toUpperCase()
                        }] : [{
                            value: 0,
                            display: A.amText
                        }, {
                            value: 1,
                            display: A.pmText
                        }]));
                    D.push(K)
                }
                g.getVal = function(a) {
                    return g._hasValue || a ? C(g.getArrayVal(a)) : null
                };
                g.setDate = function(a, b, c, d, e) {
                    g.setArrayVal(j(a), b, e, d, c)
                };
                g.getDate = g.getVal;
                g.format = la;
                g.order = y;
                g.handlers.now = function() {
                    g.setDate(new Date, g.live, 200, !0, !0)
                };
                g.buttons.now = {
                    text: A.nowText,
                    handler: "now"
                };
                S = n(S);
                J = n(J);
                v = {
                    y: ga.getFullYear(),
                    m: 0,
                    d: 1,
                    h: Fa,
                    i: va,
                    s: ha,
                    a: 0
                };
                F = {
                    y: ua.getFullYear(),
                    m: 11,
                    d: 31,
                    h: ja,
                    i: ma,
                    s: ea,
                    a: 1
                };
                return {
                    compClass: "mbsc-dt",
                    wheels: D,
                    headerText: A.headerText ? function() {
                        return k.formatDate(la, C(g.getArrayVal(!0)), A)
                    } : !1,
                    formatValue: function(a) {
                        return k.formatDate(L, C(a), A)
                    },
                    parseValue: function(a) {
                        a || (P = {});
                        return j(a ? k.parseDate(L, a, A) : A.defaultValue && A.defaultValue.getTime ? A.defaultValue : new Date, !!a && !!a.getTime)
                    },
                    validate: function(a) {
                        var d, e, f, i;
                        d = a.index;
                        var k = a.direction,
                            p = g.settings.wheels[0][y.d],
                            a = m(C(a.values), k),
                            o = j(a),
                            t = [],
                            a = {},
                            n = l(o, "y"),
                            w = l(o, "m"),
                            q = A.getMaxDayOfMonth(n, w),
                            u = !0,
                            r = !0;
                        b.each("y,m,d,a,h,i,s".split(","), function(a, d) {
                            if (y[d] !== h) {
                                var f = v[d],
                                    i = F[d],
                                    g = l(o, d);
                                t[y[d]] = [];
                                u && ga && (f = Y[d](ga));
                                r && ua && (i = Y[d](ua));
                                if (d != "y")
                                    for (e = v[d]; e <= F[d]; e++)(e < f || e > i) && t[y[d]].push(e);
                                g < f && (g = f);
                                g > i && (g = i);
                                u && (u = g == f);
                                r && (r = g == i);
                                if (d == "d") {
                                    f = A.getDate(n, w, 1).getDay();
                                    i = {};
                                    c(S, n, w, f, q, i, 1);
                                    c(J, n, w, f, q, i, 0);
                                    b.each(i, function(a, b) {
                                        b && t[y[d]].push(a)
                                    })
                                }
                            }
                        });
                        T && b.each(["a", "h", "i", "s"], function(a,
                            c) {
                            var d = l(o, c),
                                e = l(o, "d"),
                                f = {};
                            y[c] !== h && (t[y[c]] = [], s(S, a, c, o, n, w, e, f, 0), s(J, a, c, o, n, w, e, f, 1), b.each(f, function(a, b) {
                                b && t[y[c]].push(a)
                            }), R[a] = g.getValidValue(y[c], d, k, f))
                        });
                        if (p && (p._length !== q || N && (d === h || d === y.y || d === y.m))) {
                            a[y.d] = p;
                            p.data = [];
                            for (d = 1; d <= q; d++) i = A.getDate(n, w, d).getDay(), f = ba.replace(/[my]/gi, "").replace(/dd/, (10 > d ? "0" + d : d) + (A.daySuffix || "")).replace(/d/, d + (A.daySuffix || "")), p.data.push({
                                value: d,
                                display: f.match(/DD/) ? f.replace(/DD/, '<span class="mbsc-dt-day">' + A.dayNames[i] + "</span>") : f.replace(/D/, '<span class="mbsc-dt-day">' + A.dayNamesShort[i] + "</span>")
                            });
                            g._tempWheelArray[y.d] = o[y.d];
                            g.changeWheel(a)
                        }
                        return {
                            disabled: t,
                            valid: o
                        }
                    }
                }
            };
        b.each(["date", "time", "datetime"], function(a, b) {
            e.presets.scroller[b] = l
        })
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = {
                invalid: [],
                showInput: !0,
                inputClass: ""
            };
        e.presets.scroller.list = function(a) {
            function e(a, b, c) {
                var f = 0,
                    i, g, j = [
                        []
                    ],
                    k = L;
                if (b)
                    for (i = 0; i < b; i++) C ? j[0][i] = {} : j[i] = [{}];
                for (; f < a.length;) {
                    C ? j[0][f] = l(k, t[f]) : j[f] = [l(k, t[f])];
                    i = 0;
                    for (b = h; i < k.length && b ===
                        h;) {
                        if (k[i].key == a[f] && (c !== h && f <= c || c === h)) b = i;
                        i++
                    }
                    if (b !== h && k[b].children) f++, k = k[b].children;
                    else if ((g = d(k)) && g.children) f++, k = g.children;
                    else break
                }
                return j
            }

            function d(a, b) {
                if (!a) return !1;
                for (var c = 0, d; c < a.length;)
                    if (!(d = a[c++]).invalid) return b ? c - 1 : d;
                return !1
            }

            function l(a, b) {
                for (var c = {
                        data: [],
                        label: b
                    }, d = 0; d < a.length;) c.data.push({
                    value: a[d].key,
                    display: a[d].value
                }), d++;
                return c
            }

            function H(c) {
                a._isVisible && b(".mbsc-sc-whl-w", a._markup).css("display", "").slice(c).hide()
            }

            function x(a, b) {
                var c = [],
                    e = L,
                    f = 0,
                    i = !1,
                    g, j;
                if (a[f] !== h && f <= b) {
                    i = 0;
                    g = a[f];
                    for (j = h; i < e.length && j === h;) e[i].key == a[f] && !e[i].invalid && (j = i), i++
                } else j = d(e, !0), g = e[j].key;
                i = j !== h ? e[j].children : !1;
                for (c[f] = g; i;) {
                    e = e[j].children;
                    f++;
                    if (a[f] !== h && f <= b) {
                        i = 0;
                        g = a[f];
                        for (j = h; i < e.length && j === h;) e[i].key == a[f] && !e[i].invalid && (j = i), i++
                    } else j = d(e, !0), j = !1 === j ? h : j, g = e[j].key;
                    i = j !== h && d(e[j].children) ? e[j].children : !1;
                    c[f] = g
                }
                return {
                    lvl: f + 1,
                    nVector: c
                }
            }

            function q(c) {
                var d = [];
                j = j > n++ ? j : n;
                c.children("li").each(function(c) {
                    var e = b(this),
                        f =
                        e.clone();
                    f.children("ul,ol").remove();
                    var f = a._processMarkup ? a._processMarkup(f) : f.html().replace(/^\s\s*/, "").replace(/\s\s*$/, ""),
                        i = e.attr("data-invalid") ? !0 : !1,
                        c = {
                            key: e.attr("data-val") === h || null === e.attr("data-val") ? c : e.attr("data-val"),
                            value: f,
                            invalid: i,
                            children: null
                        },
                        e = e.children("ul,ol");
                    e.length && (c.children = q(e));
                    d.push(c)
                });
                n--;
                return d
            }

            function o(b, d, f) {
                for (var i = (d || 0) + 1, h = [], j = {}, k = {}, j = e(b, null, d), d = 0; d < b.length; d++) a._tempWheelArray[d] = b[d] = f.nVector[d] || 0;
                for (; i < f.lvl;) k[i] = C ? j[0][i] :
                    j[i][0], h.push(i++);
                H(f.lvl);
                D = b.slice(0);
                h.length && (c = !0, a.changeWheel(k))
            }
            var u = b.extend({}, a.settings),
                G = b.extend(a.settings, k, u),
                u = G.layout || (/top|bottom/.test(G.display) ? "liquid" : ""),
                C = "liquid" == u,
                m = G.readonly,
                f = b(this),
                E, c, s = this.id + "_dummy",
                j = 0,
                n = 0,
                K, D = [],
                L = G.wheelArray || q(f),
                t = function(a) {
                    var b = [],
                        c;
                    for (c = 0; c < a; c++) b[c] = G.labels && G.labels[c] ? G.labels[c] : c;
                    return b
                }(j),
                i = function(a) {
                    var b = [],
                        c;
                    c = !0;
                    for (var e = 0; c;) c = d(a), b[e++] = c.key, (c = c.children) && (a = c);
                    return b
                }(L),
                p = e(i, j);
            b("#" + s).remove();
            G.showInput && (E = b('<input type="text" id="' + s + '" value="" class="' + G.inputClass + '" placeholder="' + (G.placeholder || "") + '" readonly />').insertBefore(f), G.anchor = E, a.attachShow(E));
            G.wheelArray || f.hide();
            return {
                wheels: p,
                layout: u,
                headerText: !1,
                setOnTap: 1 == j,
                formatValue: function(a) {
                    if (K === h) K = x(a, a.length).lvl;
                    return a.slice(0, K).join(" ")
                },
                parseValue: function(a) {
                    return a ? (a + "").split(" ") : (G.defaultValue || i).slice(0)
                },
                onBeforeShow: function() {
                    var b = a.getArrayVal(true);
                    D = b.slice(0);
                    G.wheels = e(b, j, j);
                    c =
                        true
                },
                onWheelGestureStart: function(a) {
                    for (var b = j, a = a.index, c = []; b;) c[--b] = true;
                    c[a] = false;
                    G.readonly = c
                },
                onWheelAnimationEnd: function(b) {
                    var b = b.index,
                        c = a.getArrayVal(true),
                        d = x(c, b);
                    K = d.lvl;
                    G.readonly = m;
                    c[b] != D[b] && o(c, b, d)
                },
                onFill: function(a) {
                    K = h;
                    E && E.val(a.valueText)
                },
                validate: function(a) {
                    var b = a.values,
                        a = a.index,
                        d = x(b, b.length);
                    K = d.lvl;
                    if (a === h) {
                        H(d.lvl);
                        c || o(b, a, d)
                    }
                    c = false;
                    for (var a = K, d = L, e = 0, f = []; e < a;) {
                        for (var i = f, g = e, j = 0, k = void 0, l = d, m = []; j < e;) {
                            var p = b[j];
                            for (k in l)
                                if (l[k].key == p) {
                                    l = l[k].children;
                                    break
                                }
                            j++
                        }
                        for (j = 0; j < l.length;) {
                            l[j].invalid && m.push(l[j].key);
                            j++
                        }
                        i[g] = m;
                        e++
                    }
                    return {
                        disabled: f
                    }
                },
                onDestroy: function() {
                    E && E.remove();
                    f.show()
                }
            }
        }
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = {
                batch: 50,
                min: 0,
                max: 100,
                defaultUnit: "",
                units: null,
                unitNames: null,
                invalid: [],
                sign: !1,
                step: 0.05,
                scale: 2,
                convert: function(a) {
                    return a
                },
                signText: "&nbsp;",
                wholeText: "Whole",
                fractionText: "Fraction",
                unitText: "Unit"
            };
        e.presets.scroller.measurement = function(a) {
            function e(a) {
                return Math.max(P, Math.min(Y, t ? 0 > a ? Math.ceil(a) : Math.floor(a) :
                    x(Math.round(a - Z), T) + Z))
            }

            function d(a) {
                return t ? x((Math.abs(a) - Math.abs(e(a))) * w - ba, T) + ba : 0
            }

            function l(a) {
                var b = e(a),
                    c = d(a);
                c >= w && (0 > a ? b-- : b++, c = 0);
                return [0 > a ? "-" : "+", b, c]
            }

            function H(a) {
                var b = +a[M];
                return (n && "-" == a[0] ? -1 : 1) * (b + (t ? a[A] / w * (0 > b ? -1 : 1) : 0))
            }

            function x(a, b) {
                return Math.round(a / b) * b
            }

            function q(a, b) {
                for (a += ""; a.length < b;) a = "0" + a;
                return a
            }

            function o(a, b, c) {
                return b === c || !f.convert ? a : f.convert.call(this, a, b, c)
            }

            function u(a, b, c) {
                a = a > c ? c : a;
                return a < b ? b : a
            }

            function G(a) {
                var b;
                Q = o(f.min, D, a);
                y = o(f.max,
                    D, a);
                t ? (P = 0 > Q ? Math.ceil(Q) : Math.floor(Q), Y = 0 > y ? Math.ceil(y) : Math.floor(y), S = d(Q), J = d(y)) : (P = Math.round(Q), Y = Math.round(y), Y = P + Math.floor((Y - P) / T) * T, Z = P % T);
                a = P;
                b = Y;
                n && (b = Math.abs(a) > Math.abs(b) ? Math.abs(a) : Math.abs(b), a = 0 > a ? 0 : a);
                I.min = 0 > a ? Math.ceil(a / i) : Math.floor(a / i);
                I.max = 0 > b ? Math.ceil(b / i) : Math.floor(b / i)
            }

            function C(a) {
                return H(a).toFixed(t ? p : 0) + (K ? " " + L[a[R]] : "")
            }
            var m = b.extend({}, a.settings),
                f = b.extend(a.settings, k, m),
                s = {},
                m = [
                    []
                ],
                c = {},
                I = {},
                s = {},
                j = [],
                n = f.sign,
                K = f.units && f.units.length,
                D = K ? f.defaultUnit ||
                f.units[0] : "",
                L = [],
                t = 1 > f.step,
                i = 1 < f.step ? f.step : 1,
                p = t ? Math.max(f.scale, (f.step + "").split(".")[1].length) : 1,
                w = Math.pow(10, p),
                T = Math.round(t ? f.step * w : f.step),
                v, F, O, A, M, R, Q, y, P, Y, S, J, Z = 0,
                ba = 0,
                V, N, B = 0;
            a.setVal = function(c, d, e, f, i) {
                a._setVal(b.isArray(c) ? C(c) : c, d, e, f, i)
            };
            if (f.units)
                for (N = 0; N < f.units.length; ++N) V = f.units[N], L.push(f.unitNames ? f.unitNames[V] || V : V);
            if (n)
                if (n = !1, K)
                    for (N = 0; N < f.units.length; N++) 0 > o(f.min, D, f.units[N]) && (n = !0);
                else n = 0 > f.min;
            n && (m[0].push({
                data: ["-", "+"],
                label: f.signText
            }), B++);
            I = {
                label: f.wholeText,
                data: function(a) {
                    return P % i + a * i
                },
                getIndex: function(a) {
                    return Math.round((a - P % i) / i)
                }
            };
            m[0].push(I);
            M = B++;
            G(D);
            if (t) {
                m[0].push(s);
                s.data = [];
                s.label = f.fractionText;
                for (N = ba; N < w; N += T) j.push(N), s.data.push({
                    value: N,
                    display: "." + q(N, p)
                });
                A = B++;
                v = Math.ceil(100 / T);
                f.invalid && f.invalid.length && (b.each(f.invalid, function(a, b) {
                    var d = b > 0 ? Math.floor(b) : Math.ceil(b);
                    d === 0 && (d = b <= 0 ? -0.001 : 0.001);
                    c[d] = (c[d] || 0) + 1;
                    if (b === 0) {
                        d = 0.001;
                        c[d] = (c[d] || 0) + 1
                    }
                }), b.each(c, function(a, b) {
                    b < v ? delete c[a] : c[a] =
                        a
                }))
            }
            if (K) {
                s = {
                    data: [],
                    label: f.unitText,
                    circular: !1
                };
                for (N = 0; N < f.units.length; N++) s.data.push({
                    value: N,
                    display: L[N]
                });
                m[0].push(s)
            }
            R = B;
            return {
                wheels: m,
                minWidth: n && t ? 70 : 80,
                showLabel: !1,
                formatValue: C,
                parseValue: function(a) {
                    var c = (((typeof a === "number" ? a + "" : a) || f.defaultValue) + "").split(" "),
                        a = +c[0],
                        d = [],
                        e = "";
                    if (K) {
                        e = b.inArray(c[1], L);
                        e = e == -1 ? b.inArray(D, f.units) : e;
                        e = e == -1 ? 0 : e
                    }
                    O = K ? f.units[e] : "";
                    G(O);
                    a = isNaN(a) ? 0 : a;
                    a = u(a, Q, y);
                    c = l(a);
                    c[1] = u(c[1], P, Y);
                    F = a;
                    if (n) {
                        d[0] = c[0];
                        c[1] = Math.abs(c[1])
                    }
                    d[M] = c[1];
                    t &&
                        (d[A] = c[2]);
                    K && (d[R] = e);
                    return d
                },
                onCancel: function() {
                    F = h
                },
                validate: function(d) {
                    var e, g, k, m, p = d.values;
                    k = d.index;
                    var d = d.direction,
                        q = {},
                        w = [],
                        v = {},
                        C = K ? f.units[p[R]] : "";
                    n && k === 0 && (F = Math.abs(F) * (p[0] == "-" ? -1 : 1));
                    if (k === M || k === A && t || F === h || k === h) {
                        F = H(p);
                        O = C
                    }
                    if (K && k === R && O !== C || k === h) {
                        G(C);
                        F = o(F, O, C);
                        O = C;
                        g = l(F);
                        if (k !== h) {
                            v[M] = I;
                            a.changeWheel(v)
                        }
                        n && (p[0] = g[0])
                    }
                    w[M] = [];
                    if (n) {
                        w[0] = [];
                        if (Q > 0) {
                            w[0].push("-");
                            p[0] = "+"
                        }
                        if (y < 0) {
                            w[0].push("+");
                            p[0] = "-"
                        }
                        k = Math.abs(p[0] == "-" ? P : Y);
                        for (B = k + i; B < k + 20 * i; B = B + i) {
                            w[M].push(B);
                            q[B] = true
                        }
                    }
                    F = u(F, Q, y);
                    g = l(F);
                    k = n ? Math.abs(g[1]) : g[1];
                    e = n ? p[0] == "-" : F < 0;
                    p[M] = k;
                    e && (g[0] = "-");
                    t && (p[A] = g[2]);
                    b.each(t ? c : f.invalid, function(a, b) {
                        if (n && e)
                            if (b <= 0) b = Math.abs(b);
                            else return;
                        b = x(o(b, D, C), t ? 1 : T);
                        q[b] = true;
                        w[M].push(b)
                    });
                    p[M] = a.getValidValue(M, k, d, q);
                    g[1] = p[M] * (n && e ? -1 : 1);
                    if (t) {
                        w[A] = [];
                        d = n ? p[0] + p[1] : (F < 0 ? "-" : "+") + Math.abs(g[1]);
                        k = (Q < 0 ? "-" : "+") + Math.abs(P);
                        v = (y < 0 ? "-" : "+") + Math.abs(Y);
                        d === k && b(j).each(function(a, b) {
                            (e ? b > S : b < S) && w[A].push(b)
                        });
                        d === v && b(j).each(function(a, b) {
                            (e ? b < J : b > J) && w[A].push(b)
                        });
                        b.each(f.invalid, function(a, b) {
                            m = l(o(b, D, C));
                            (g[0] === m[0] || g[1] === 0 && m[1] === 0 && m[2] === 0) && g[1] === m[1] && w[A].push(m[2])
                        })
                    }
                    return {
                        disabled: w,
                        valid: p
                    }
                }
            }
        };
        e.presetShort("measurement")
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = e.presets.scroller,
            a = e.util.datetime,
            g = e.util.testTouch,
            d = {
                autoCorrect: !0,
                showSelector: !0,
                minRange: 1,
                rangeTap: !0,
                fromText: "Start",
                toText: "End"
            };
        e.presetShort("range");
        k.range = function(e) {
            function s(a, b) {
                a && (a.setFullYear(b.getFullYear()), a.setMonth(b.getMonth()), a.setDate(b.getDate()))
            }

            function x(d,
                e) {
                var f = !0;
                d && j && n && (n - j > v.maxRange - 1 && (w ? j = new Date(n - v.maxRange + 1) : n = new Date(+j + v.maxRange - 1)), n - j < v.minRange - 1 && (w ? j = new Date(n - v.minRange + 1) : n = new Date(+j + v.minRange - 1)));
                if (!j || !n) f = !1;
                if (e) {
                    var i, g, h, k, l, p = 0,
                        m = O || !w ? " mbsc-cal-day-hl mbsc-cal-sel-start" : " mbsc-cal-sel-start",
                        o = O || w ? " mbsc-cal-day-hl mbsc-cal-sel-end" : " mbsc-cal-sel-end";
                    c = j ? a.formatDate(C, j, v) : "";
                    I = n ? a.formatDate(C, n, v) : "";
                    if (u && (b(".mbsc-range-btn-v-start", u).html(c || "&nbsp;"), b(".mbsc-range-btn-v-end", u).html(I || "&nbsp;"),
                            i = j ? new Date(j) : null, h = n ? new Date(n) : null, !i && h && (i = new Date(h)), !h && i && (h = new Date(i)), l = w ? h : i, b(".mbsc-cal-table .mbsc-cal-day-sel .mbsc-cal-day-i", u).removeClass(A), b(".mbsc-cal-table .mbsc-cal-day-hl", u).removeClass(R), b(".mbsc-cal-table .mbsc-cal-day-sel", u).removeClass("mbsc-cal-day-sel mbsc-cal-sel-start mbsc-cal-sel-end").removeAttr("aria-selected"), i && h)) {
                        g = i.setHours(0, 0, 0, 0);
                        for (k = h.setHours(0, 0, 0, 0); h >= i && 84 > p;) b('.mbsc-cal-day[data-full="' + l.getFullYear() + "-" + l.getMonth() + "-" + l.getDate() +
                            '"]', u).addClass("mbsc-cal-day-sel" + (l.getTime() === g ? m : "") + (l.getTime() === k ? o : "")).attr("aria-selected", "true").find(".mbsc-cal-day-i ").addClass(A), l.setDate(l.getDate() + (w ? -1 : 1)), p++
                    }
                }
                return f
            }

            function q() {
                t && u && (b(".mbsc-range-btn-c", u).removeClass("mbsc-range-btn-sel").removeAttr("aria-checked").find(".mbsc-range-btn", u).removeClass(A), b(".mbsc-range-btn-c", u).eq(w).addClass("mbsc-range-btn-sel").attr("aria-checked", "true").find(".mbsc-range-btn").addClass(A))
            }
            var o, u, G, C, m, f, E, c, I, j, n, K, D, L,
                t, i = e._startDate,
                p = e._endDate,
                w = 0;
            m = new Date;
            var T = b.extend({}, e.settings),
                v = b.extend(e.settings, d, T),
                F = v.anchor,
                O = v.rangeTap,
                A = v.activeClass || "",
                M = "mbsc-fr-btn-d " + (v.disabledClass || ""),
                R = "mbsc-cal-day-hl",
                Q = null === v.defaultValue ? [] : v.defaultValue || [new Date(m.setHours(0, 0, 0, 0)), new Date(m.getFullYear(), m.getMonth(), m.getDate() + 6, 23, 59, 59, 999)];
            O && (v.tabs = !0);
            m = k.calbase.call(this, e);
            o = b.extend({}, m);
            C = e.format;
            K = "time" === v.controls.join("");
            t = 1 == v.controls.length && "calendar" == v.controls[0] ? v.showSelector :
                !0;
            v.startInput && (D = b(v.startInput).prop("readonly"), e.attachShow(b(v.startInput).prop("readonly", !0), function() {
                w = 0;
                v.anchor = F || b(v.startInput)
            }));
            v.endInput && (L = b(v.endInput).prop("readonly"), e.attachShow(b(v.endInput).prop("readonly", !0), function() {
                w = 1;
                v.anchor = F || b(v.endInput)
            }));
            e.setVal = function(b, d, f, g, k) {
                var m = b || [];
                if (m[0] === h || m[0] === null || m[0].getTime) {
                    E = true;
                    c = (j = m[0] || null) ? a.formatDate(C, j, v) : "";
                    w || (b = o.parseValue(c, e))
                }
                if (m[1] === h || m[1] === null || m[1].getTime) {
                    E = true;
                    I = (n = m[1] || null) ?
                        a.formatDate(C, n, v) : "";
                    w && (b = o.parseValue(I, e))
                }
                if (!g) {
                    e._startDate = i = j;
                    e._endDate = p = n
                }
                e._setVal(b, d, f, g, k)
            };
            e.getVal = function(a) {
                return a ? [j, n] : e._hasValue ? [i, p] : null
            };
            e.getDayProps = function(a) {
                var b = j ? new Date(j.getFullYear(), j.getMonth(), j.getDate()) : null,
                    c = n ? new Date(n.getFullYear(), n.getMonth(), n.getDate()) : null;
                return {
                    selected: b && c && a >= b && a <= n,
                    cssClass: ((O || !w) && b && b.getTime() === a.getTime() || (O || w) && c && c.getTime() === a.getTime() ? R : "") + (b && b.getTime() === a.getTime() ? " mbsc-cal-sel-start" : "") + (c &&
                        c.getTime() === a.getTime() ? " mbsc-cal-sel-end" : "")
                }
            };
            e.setActiveDate = function(a) {
                w = a == "start" ? 0 : 1;
                a = a == "start" ? j : n;
                if (e.isVisible()) {
                    q();
                    if (!O) {
                        b(".mbsc-cal-table .mbsc-cal-day-hl", u).removeClass(R);
                        a && b('.mbsc-cal-day[data-full="' + a.getFullYear() + "-" + a.getMonth() + "-" + a.getDate() + '"]', u).addClass(R)
                    }
                    if (a) {
                        f = true;
                        e.setDate(a, false, 200, true)
                    }
                }
            };
            e.getValue = e.getVal;
            b.extend(m, {
                highlight: !1,
                outerMonthChange: !1,
                formatValue: function() {
                    return c + (v.endInput ? "" : I ? " - " + I : "")
                },
                parseValue: function(d) {
                    d = d ? d.split(" - ") : [];
                    v.defaultValue = Q[1];
                    p = v.endInput ? b(v.endInput).val() ? a.parseDate(C, b(v.endInput).val(), v) : Q[1] : d[1] ? a.parseDate(C, d[1], v) : Q[1];
                    v.defaultValue = Q[0];
                    i = v.startInput ? b(v.startInput).val() ? a.parseDate(C, b(v.startInput).val(), v) : Q[0] : d[0] ? a.parseDate(C, d[0], v) : Q[0];
                    v.defaultValue = Q[w];
                    c = i ? a.formatDate(C, i, v) : "";
                    I = p ? a.formatDate(C, p, v) : "";
                    e._startDate = i;
                    e._endDate = p;
                    return o.parseValue(w ? I : c, e)
                },
                onFill: function(a) {
                    a = a.change;
                    e._startDate = i = j;
                    e._endDate = p = n;
                    if (v.startInput) {
                        b(v.startInput).val(c);
                        a && b(v.startInput).trigger("change")
                    }
                    if (v.endInput) {
                        b(v.endInput).val(I);
                        a && b(v.endInput).trigger("change")
                    }
                },
                onBeforeClose: function(a) {
                    if (a.button === "set" && !x(true, true)) {
                        e.setActiveDate(w ? "start" : "end");
                        return false
                    }
                },
                onHide: function() {
                    o.onHide.call(e);
                    w = 0;
                    u = null;
                    v.anchor = F
                },
                onClear: function() {
                    O && (w = 0)
                },
                onBeforeShow: function() {
                    v.headerText = false;
                    j = i;
                    n = p;
                    if (v.counter) v.headerText = function() {
                        var a = j && n ? Math.max(1, Math.round(((new Date(n)).setHours(0, 0, 0, 0) - (new Date(j)).setHours(0, 0, 0, 0)) / 864E5) + 1) : 0;
                        return (a > 1 ? v.selectedPluralText || v.selectedText : v.selectedText).replace(/{count}/,
                            a)
                    };
                    E = true
                },
                onMarkupReady: function(a) {
                    u = b(a.target);
                    if (j) {
                        f = true;
                        e.setDate(j, false, 0, true);
                        j = e.getDate(true)
                    }
                    if (n) {
                        f = true;
                        e.setDate(n, false, 0, true);
                        n = e.getDate(true)
                    }
                    if (w && n || !w && j) {
                        f = true;
                        e.setDate(w ? n : j, false, 0, true)
                    }
                    o.onMarkupReady.call(this, a);
                    u.addClass("mbsc-range");
                    if (t) {
                        a = '<div class="mbsc-range-btn-t" role="radiogroup"><div class="mbsc-range-btn-c mbsc-range-btn-start"><div role="radio" class="mbsc-fr-btn-e mbsc-fr-btn-nhl mbsc-range-btn">' + v.fromText + '<div class="mbsc-range-btn-v mbsc-range-btn-v-start">' +
                            (c || "&nbsp;") + '</div></div></div><div class="mbsc-range-btn-c mbsc-range-btn-end"><div role="radio" class="mbsc-fr-btn-e mbsc-fr-btn-nhl mbsc-range-btn">' + v.toText + '<div class="mbsc-range-btn-v mbsc-range-btn-v-end">' + (I || "&nbsp;") + "</div></div></div></div>";
                        b(".mbsc-cal-tabs", u).before(a);
                        q()
                    }
                    b(".mbsc-range-btn-c", u).on("touchstart click", function(a) {
                        if (g(a, this)) {
                            e.showMonthView();
                            e.setActiveDate(b(this).index() ? "end" : "start")
                        }
                    })
                },
                onDayChange: function(a) {
                    a.active = w ? "end" : "start";
                    G = true
                },
                onSetDate: function(a) {
                    var c =
                        a.date,
                        d = e.order;
                    if (!f) {
                        d.h === h && c.setHours(w ? 23 : 0);
                        d.i === h && c.setMinutes(w ? 59 : 0);
                        d.s === h && c.setSeconds(w ? 59 : 0);
                        c.setMilliseconds(w ? 999 : 0);
                        if (!E || G) {
                            if (O && G) {
                                w == 1 && c < j && (w = 0);
                                w ? c.setHours(23, 59, 59, 999) : c.setHours(0, 0, 0, 0)
                            }
                            w ? n = new Date(c) : j = new Date(c);
                            if (K) {
                                s(j, c);
                                s(n, c)
                            }
                            O && G && !w && (n = null)
                        }
                    }
                    e._isValid = x(E || G || v.autoCorrect, !f);
                    a.active = w ? "end" : "start";
                    if (!f && O) {
                        G && (w = w ? 0 : 1);
                        q()
                    }
                    e.isVisible() && (e._isValid ? b(".mbsc-fr-btn-s .mbsc-fr-btn", e._markup).removeClass(M) : b(".mbsc-fr-btn-s .mbsc-fr-btn", e._markup).addClass(M));
                    f = E = G = false
                },
                onTabChange: function(a) {
                    a.tab != "calendar" && e.setDate(w ? n : j, false, 200, true);
                    x(true, true)
                },
                onDestroy: function() {
                    b(v.startInput).prop("readonly", D);
                    b(v.endInput).prop("readonly", L)
                }
            });
            return m
        }
    })();
    (function() {
        var h = s,
            e = h.presets.scroller;
        e.number = e.measurement;
        h.presetShort("number")
    })();
    (function() {
        function h(a) {
            var b = [Math.round(a.r).toString(16), Math.round(a.g).toString(16), Math.round(a.b).toString(16)];
            l.each(b, function(a, d) {
                1 == d.length && (b[a] = "0" + d)
            });
            return "#" + b.join("")
        }

        function e(a) {
            a =
                parseInt(-1 < a.indexOf("#") ? a.substring(1) : a, 16);
            return {
                r: a >> 16,
                g: (a & 65280) >> 8,
                b: a & 255
            }
        }

        function b(a) {
            var b, d, e;
            b = a.h;
            var g = 255 * a.s / 100,
                a = 255 * a.v / 100;
            if (0 === g) b = d = e = a;
            else {
                var g = (255 - g) * a / 255,
                    f = (a - g) * (b % 60) / 60;
                360 == b && (b = 0);
                60 > b ? (b = a, e = g, d = g + f) : 120 > b ? (d = a, e = g, b = a - f) : 180 > b ? (d = a, b = g, e = g + f) : 240 > b ? (e = a, b = g, d = a - f) : 300 > b ? (e = a, d = g, b = g + f) : 360 > b ? (b = a, d = g, e = a - f) : b = d = e = 0
            }
            return {
                r: b,
                g: d,
                b: e
            }
        }

        function k(a) {
            var b = 0,
                d;
            d = Math.min(a.r, a.g, a.b);
            var e = Math.max(a.r, a.g, a.b),
                b = e - d,
                b = (d = e ? 255 * b / e : 0) ? a.r == e ? (a.g - a.b) / b :
                a.g == e ? 2 + (a.b - a.r) / b : 4 + (a.r - a.g) / b : -1,
                b = 60 * b;
            0 > b && (b += 360);
            return {
                h: b,
                s: d * (100 / 255),
                v: e * (100 / 255)
            }
        }

        function a(a) {
            return h(b(a))
        }

        function g(a) {
            return k(e(a))
        }
        var d = s,
            l = d.$,
            H = d.util.prefix,
            x = d.presets.scroller,
            q = {
                preview: !0,
                previewText: !0,
                label: "Color",
                refineLabel: "Refine",
                step: 10,
                nr: 10,
                format: "hex",
                hueText: "Hue",
                saturationText: "Saturation",
                valueText: "Value"
            };
        d.presetShort("color");
        x.color = function(d) {
            function e(a) {
                return isNaN(+a) ? 0 : +a
            }

            function h(c) {
                return "hsv" == I ? c.join(",") : "rgb" == I ? (c = b({
                    h: c[0],
                    s: c[1],
                    v: c[2]
                }), Math.round(c.r) + "," + Math.round(c.g) + "," + Math.round(c.b)) : a({
                    h: c[0],
                    s: c[1],
                    v: c[2]
                })
            }

            function x(a, b, c) {
                a[0].style.backgroundImage = H + ("-webkit-" == H ? "gradient(linear,left top,left bottom,from(" + b + "),to(" + c + "))" : "linear-gradient(" + b + "," + c + ")")
            }

            function m(c, e) {
                var f = d._tempWheelArray;
                1 !== e && 2 !== e && x(l(".mbsc-sc-whl-sc", c).eq(1), a({
                    h: f[0],
                    s: 0,
                    v: 100
                }), a({
                    h: f[0],
                    s: 100,
                    v: 100
                }));
                2 !== e && x(l(".mbsc-sc-whl-sc", c).eq(2), a({
                    h: f[0],
                    s: f[1],
                    v: 0
                }), a({
                    h: f[0],
                    s: f[1],
                    v: 100
                }));
                if (j) {
                    var g = b({
                            h: f[0],
                            s: f[1],
                            v: f[2]
                        }),
                        g = 0.299 * g.r + 0.587 * g.g + 0.114 * g.b;
                    l(".mbsc-color-preview", c).attr("style", "background:" + a({
                        h: f[0],
                        s: f[1],
                        v: f[2]
                    }) + ";color:" + (130 < g ? "#000" : "#fff")).text(n ? h(f) : "")
                }
            }
            var f = l.extend({}, d.settings),
                s = l.extend(d.settings, q, f),
                f = l.isArray(s.colors) ? s.colors : [s.colors],
                c = s.defaultValue || f[0],
                I = s.format,
                j = s.preview,
                n = s.previewText,
                K = s.hueText,
                D = s.saturationText,
                L = s.valueText;
            return {
                minWidth: 70,
                height: 15,
                rows: 13,
                speedUnit: 0.006,
                timeUnit: 0.05,
                showLabel: !0,
                wheels: function() {
                    for (var b = 0, c = {
                                data: [],
                                label: K
                            },
                            d = {
                                circular: !1,
                                data: [],
                                label: D
                            }, e = {
                                circular: !1,
                                data: [],
                                label: L
                            }; 360 > b; b += 3) c.data.push({
                        value: b,
                        label: b,
                        display: '<div class="mbsc-color-itm" style="background:' + a({
                            h: b,
                            s: 100,
                            v: 100
                        }) + '"><div class="mbsc-color-itm-a"></div></div>'
                    });
                    for (b = 0; 101 > b; b += 1) d.data.push({
                        value: b,
                        label: b,
                        display: '<div class="mbsc-color-itm"><div class="mbsc-color-itm-a"></div></div>'
                    }), e.data.push({
                        value: b,
                        label: b,
                        display: '<div class="mbsc-color-itm"><div class="mbsc-color-itm-a"></div></div>'
                    });
                    return [
                        [c, d, e]
                    ]
                }(),
                compClass: "mbsc-color",
                parseValue: function(a) {
                    if (a = a || c) {
                        "hsv" == I ? (a = a.split(","), a = {
                            h: e(a[0]),
                            s: e(a[1]),
                            v: e(a[2])
                        }) : "rgb" == I ? (a = a.split(","), a = k({
                            r: e(a[0]),
                            g: e(a[1]),
                            b: e(a[2])
                        })) : (a = a.replace("#", ""), 3 == a.length && (a = a[0] + a[0] + a[1] + a[1] + a[2] + a[2]), a = g(a));
                        var b = Math.round(a.h);
                        return [3 * Math.floor(b / 3), Math.round(a.s), Math.round(a.v)]
                    }
                    return [0, 100, 100]
                },
                formatValue: h,
                onBeforeShow: function() {
                    j && (s.headerText = !1)
                },
                onMarkupReady: function(a) {
                    a = l(a.target);
                    j && a.find(".mbsc-sc-whl-gr-c").before('<div class="mbsc-color-preview"></div>');
                    m(a)
                },
                validate: function(a) {
                    d._isVisible && m(d._markup, a.index)
                }
            }
        };
        d.util.color = {
            hsv2hex: a,
            hsv2rgb: b,
            rgb2hsv: k,
            rgb2hex: h,
            hex2rgb: e,
            hex2hsv: g
        }
    })();
    (function(h, e, b) {
        var k = s,
            a = k.$,
            g = a.extend,
            d = k.util.datetime,
            l = d.adjustedDate,
            H = k.presets.scroller,
            x = {
                labelsShort: "Yrs,Mths,Days,Hrs,Mins,Secs".split(","),
                eventText: "event",
                eventsText: "events"
            };
        k.presetShort("eventcalendar");
        H.eventcalendar = function(e) {
            function o(b) {
                if (b) {
                    if (p[b]) return p[b];
                    var c = a('<div style="background-color:' + b + ';"></div>').appendTo("body"),
                        d = (h.getComputedStyle ? getComputedStyle(c[0]) : c[0].style).backgroundColor.replace(/rgb|rgba|\(|\)|\s/g, "").split(","),
                        d = 130 < 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2] ? "#000" : "#fff";
                    c.remove();
                    return p[b] = d
                }
            }

            function u(a) {
                return a.sort(function(a, b) {
                    var c = a.d || a.start,
                        d = b.d || b.start,
                        c = !c.getTime ? 0 : a.start && a.end && a.start.toDateString() !== a.end.toDateString() ? 1 : c.getTime(),
                        d = !d.getTime ? 0 : b.start && b.end && b.start.toDateString() !== b.end.toDateString() ? 1 : d.getTime();
                    return c - d
                })
            }

            function s(b) {
                var d;
                d = a(".mbsc-cal-c",
                    E)[0].offsetHeight;
                var e = b[0].offsetHeight,
                    f = b[0].offsetWidth,
                    i = b.offset().top - a(".mbsc-cal-c", E).offset().top,
                    g = 2 > b.closest(".mbsc-cal-row").index();
                d = c.addClass("mbsc-cal-events-t").css({
                    top: g ? i + e : "0",
                    bottom: g ? "0" : d - i
                }).addClass("mbsc-cal-events-v").height();
                c.css(g ? "bottom" : "top", "auto").removeClass("mbsc-cal-events-t");
                K.css("max-height", d);
                n.refresh();
                n.scroll(0);
                g ? c.addClass("mbsc-cal-events-b") : c.removeClass("mbsc-cal-events-b");
                a(".mbsc-cal-events-arr", c).css("left", b.offset().left - c.offset().left +
                    f / 2)
            }

            function C(b, f) {
                var i = j[b];
                if (i) {
                    var g, h, k, l, m, p = '<ul class="mbsc-cal-event-list">';
                    I = f;
                    f.addClass(T).find(".mbsc-cal-day-i").addClass(F);
                    f.hasClass(v) && f.attr("data-hl", "true").removeClass(v);
                    u(i);
                    a.each(i, function(a, b) {
                        l = b.d || b.start;
                        m = b.start && b.end && b.start.toDateString() !== b.end.toDateString();
                        k = b.color;
                        o(k);
                        h = g = "";
                        l.getTime && (g = d.formatDate((m ? "MM d yy " : "") + w.timeFormat, l));
                        b.end && (h = d.formatDate((m ? "MM d yy " : "") + w.timeFormat, b.end));
                        var c = p,
                            e = '<li role="button" aria-label="' + b.text +
                            (g ? ", " + w.fromText + " " + g : "") + (h ? ", " + w.toText + " " + h : "") + '" class="mbsc-cal-event"><div class="mbsc-cal-event-color" style="' + (k ? "background:" + k + ";" : "") + '"></div><div class="mbsc-cal-event-text">' + (l.getTime && !m ? '<div class="mbsc-cal-event-time">' + d.formatDate(w.timeFormat, l) + "</div>" : "") + b.text + "</div>",
                            f;
                        if (b.start && b.end) {
                            f = w.labelsShort;
                            var i = Math.abs(b.end - b.start) / 1E3,
                                j = i / 60,
                                n = j / 60,
                                q = n / 24,
                                y = q / 365;
                            f = '<div class="mbsc-cal-event-dur">' + (45 > i && Math.round(i) + " " + f[5].toLowerCase() || 45 > j && Math.round(j) +
                                " " + f[4].toLowerCase() || 24 > n && Math.round(n) + " " + f[3].toLowerCase() || 30 > q && Math.round(q) + " " + f[2].toLowerCase() || 365 > q && Math.round(q / 30) + " " + f[1].toLowerCase() || Math.round(y) + " " + f[0].toLowerCase()) + "</div>"
                        } else f = "";
                        p = c + (e + f + "</li>")
                    });
                    p += "</ul>";
                    D.html(p);
                    e.trigger("onEventBubbleShow", {
                        target: I[0],
                        eventList: c[0]
                    });
                    s(I);
                    e.tap(a(".mbsc-cal-event", D), function(c) {
                        n.scrolled || e.trigger("onEventSelect", {
                            domEvent: c,
                            event: i[a(this).index()],
                            date: b
                        })
                    });
                    L = !0
                }
            }

            function m() {
                c && c.removeClass("mbsc-cal-events-v");
                I && (I.removeClass(T).find(".mbsc-cal-day-i").removeClass(F), I.attr("data-hl") && I.removeAttr("data-hl").addClass(v));
                L = !1
            }
            var f, E, c, I, j, n, K, D, L, t, i, p = {};
            t = g({}, e.settings);
            var w = g(e.settings, x, t),
                T = "mbsc-cal-day-sel mbsc-cal-day-ev",
                v = "mbsc-cal-day-hl",
                F = w.activeClass || "",
                O = w.showEventCount,
                A = 0,
                M = g(!0, [], w.data);
            t = H.calbase.call(this, e);
            f = g({}, t);
            a.each(M, function(a, c) {
                c._id === b && (c._id = A++)
            });
            e.onGenMonth = function(a, b) {
                j = e.prepareObj(M, a, b)
            };
            e.getDayProps = function(b) {
                var c = j[b] ? j[b] : !1,
                    d = c ? j[b].length +
                    " " + (1 < j[b].length ? w.eventsText : w.eventText) : 0,
                    e = c && c[0] && c[0].color,
                    f = O && d ? o(e) : "",
                    i = "",
                    g = "";
                if (c) {
                    for (b = 0; b < c.length; b++) c[b].icon && (i += '<span class="mbsc-ic mbsc-ic-' + c[b].icon + '"' + (c[b].text ? "" : c[b].color ? ' style="color:' + c[b].color + ';"' : "") + "></span>\n");
                    g = '<div class="mbsc-cal-day-m"><div class="mbsc-cal-day-m-t">';
                    for (b = 0; b < c.length; b++) g += '<div class="mbsc-cal-day-m-c"' + (c[b].color ? ' style="background:' + c[b].color + ';"' : "") + "></div>";
                    g += "</div></div>"
                }
                return {
                    marked: c,
                    selected: !1,
                    cssClass: c ?
                        "mbsc-cal-day-marked" : "",
                    ariaLabel: O ? d : "",
                    markup: O && d ? '<div class="mbsc-cal-day-txt-c"><div class="mbsc-cal-day-txt" title="' + a("<div>" + d + "</div>").text() + '"' + (e ? ' style="background:' + e + ";color:" + f + ';text-shadow:none;"' : "") + ">" + i + d + "</div></div>" : O && i ? '<div class="mbsc-cal-day-ic-c">' + i + "</div>" : c ? g : ""
                }
            };
            e.addEvent = function(c) {
                var d = [],
                    c = g(!0, [], a.isArray(c) ? c : [c]);
                a.each(c, function(a, c) {
                    c._id === b && (c._id = A++);
                    M.push(c);
                    d.push(c._id)
                });
                m();
                e.redraw();
                return d
            };
            e.removeEvent = function(b) {
                b = a.isArray(b) ?
                    b : [b];
                a.each(b, function(b, c) {
                    a.each(M, function(a, b) {
                        if (b._id === c) return M.splice(a, 1), !1
                    })
                });
                m();
                e.redraw()
            };
            e.getEvents = function(a) {
                var b;
                return a ? (a.setHours(0, 0, 0, 0), b = e.prepareObj(M, a.getFullYear(), a.getMonth()), b[a] ? u(b[a]) : []) : g(!0, [], M)
            };
            e.setEvents = function(c) {
                var d = [];
                M = g(!0, [], c);
                a.each(M, function(a, c) {
                    c._id === b && (c._id = A++);
                    d.push(c._id)
                });
                m();
                e.redraw();
                return d
            };
            g(t, {
                highlight: !1,
                outerMonthChange: !1,
                headerText: !1,
                buttons: "inline" !== w.display ? ["cancel"] : w.buttons,
                onMarkupReady: function(b) {
                    f.onMarkupReady.call(this,
                        b);
                    E = a(b.target);
                    O && a(".mbsc-cal", E).addClass("mbsc-cal-ev");
                    E.addClass("mbsc-cal-em");
                    c = a('<div class="mbsc-cal-events ' + (w.eventBubbleClass || "") + '"><div class="mbsc-cal-events-arr"></div><div class="mbsc-cal-events-i"><div class="mbsc-cal-events-sc"></div></div></div>').appendTo(a(".mbsc-cal-c", E));
                    K = a(".mbsc-cal-events-i", c);
                    D = a(".mbsc-cal-events-sc", c);
                    n = new k.classes.ScrollView(K[0]);
                    L = !1;
                    e.tap(K, function() {
                        n.scrolled || m()
                    })
                },
                onMonthChange: function() {
                    m()
                },
                onSelectShow: function() {
                    m()
                },
                onMonthLoaded: function() {
                    i &&
                        (C(i.d, a('.mbsc-cal-day-v[data-full="' + i.full + '"]:not(.mbsc-cal-day-diff)', E)), i = !1)
                },
                onDayChange: function(b) {
                    var c = l(b.date.getFullYear(), b.date.getMonth(), b.date.getDate()),
                        d = a(b.target);
                    m();
                    d.hasClass("mbsc-cal-day-ev") || setTimeout(function() {
                        e.changing ? i = {
                            d: c,
                            full: d.attr("data-full")
                        } : C(c, d)
                    }, 10);
                    return !1
                },
                onCalResize: function() {
                    L && s(I)
                }
            });
            return t
        }
    })(window, document);
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller,
            k = {
                min: 0,
                max: 100,
                defaultUnit: "km",
                units: "m,km,in,ft,yd,mi".split(",")
            },
            a = {
                mm: 0.001,
                cm: 0.01,
                dm: 0.1,
                m: 1,
                dam: 10,
                hm: 100,
                km: 1E3,
                "in": 0.0254,
                ft: 0.3048,
                yd: 0.9144,
                ch: 20.1168,
                fur: 201.168,
                mi: 1609.344,
                lea: 4828.032
            };
        h.presetShort("distance");
        b.distance = function(g) {
            var d = e.extend({}, k, g.settings);
            e.extend(g.settings, d, {
                sign: !1,
                convert: function(b, d, e) {
                    return b * a[d] / a[e]
                }
            });
            return b.measurement.call(this, g)
        }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller,
            k = {
                min: 0,
                max: 100,
                defaultUnit: "N",
                units: ["N", "kp", "lbf", "pdl"]
            },
            a = {
                N: 1,
                kp: 9.80665,
                lbf: 4.448222,
                pdl: 0.138255
            };
        h.presetShort("force");
        b.force =
            function(g) {
                var d = e.extend({}, k, g.settings);
                e.extend(g.settings, d, {
                    sign: !1,
                    convert: function(b, d, e) {
                        return b * a[d] / a[e]
                    }
                });
                return b.measurement.call(this, g)
            }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller,
            k = {
                min: 0,
                max: 1E3,
                defaultUnit: "kg",
                units: ["g", "kg", "oz", "lb"],
                unitNames: {
                    tlong: "t (long)",
                    tshort: "t (short)"
                }
            },
            a = {
                mg: 0.001,
                cg: 0.01,
                dg: 0.1,
                g: 1,
                dag: 10,
                hg: 100,
                kg: 1E3,
                t: 1E6,
                drc: 1.7718452,
                oz: 28.3495,
                lb: 453.59237,
                st: 6350.29318,
                qtr: 12700.58636,
                cwt: 50802.34544,
                tlong: 1016046.9088,
                tshort: 907184.74
            };
        h.presetShort("mass");
        b.mass = function(g) {
            var d = e.extend({}, k, g.settings);
            e.extend(g.settings, d, {
                sign: !1,
                convert: function(b, d, e) {
                    return b * a[d] / a[e]
                }
            });
            return b.measurement.call(this, g)
        }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller,
            k = {
                min: 0,
                max: 100,
                defaultUnit: "kph",
                units: ["kph", "mph", "mps", "fps", "knot"],
                unitNames: {
                    kph: "km/h",
                    mph: "mi/h",
                    mps: "m/s",
                    fps: "ft/s",
                    knot: "knot"
                }
            },
            a = {
                kph: 1,
                mph: 1.60934,
                mps: 3.6,
                fps: 1.09728,
                knot: 1.852
            };
        h.presetShort("speed");
        b.speed = function(g) {
            var d = e.extend({}, k, g.settings);
            e.extend(g.settings,
                d, {
                    sign: !1,
                    convert: function(b, d, e) {
                        return b * a[d] / a[e]
                    }
                });
            return b.measurement.call(this, g)
        }
    })();
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller,
            k = {
                min: -20,
                max: 40,
                defaultUnit: "c",
                units: ["c", "k", "f", "r"],
                unitNames: {
                    c: "\u00b0C",
                    k: "K",
                    f: "\u00b0F",
                    r: "\u00b0R"
                }
            },
            a = {
                c2k: function(a) {
                    return a + 273.15
                },
                c2f: function(a) {
                    return 9 * a / 5 + 32
                },
                c2r: function(a) {
                    return 9 * (a + 273.15) / 5
                },
                k2c: function(a) {
                    return a - 273.15
                },
                k2f: function(a) {
                    return 9 * a / 5 - 459.67
                },
                k2r: function(a) {
                    return 9 * a / 5
                },
                f2c: function(a) {
                    return 5 * (a - 32) / 9
                },
                f2k: function(a) {
                    return 5 *
                        (a + 459.67) / 9
                },
                f2r: function(a) {
                    return a + 459.67
                },
                r2c: function(a) {
                    return 5 * (a - 491.67) / 9
                },
                r2k: function(a) {
                    return 5 * a / 9
                },
                r2f: function(a) {
                    return a - 459.67
                }
            };
        h.presetShort("temperature");
        b.temperature = function(g) {
            var d = e.extend({}, k, g.settings);
            e.extend(g.settings, d, {
                sign: !0,
                convert: function(b, d, e) {
                    return a[d + "2" + e](b)
                }
            });
            return b.measurement.call(this, g)
        }
    })();
    (function(h, e, b) {
        var k = s,
            a = k.$,
            g = a.extend,
            d = k.classes;
        d.MenuStrip = function(e, s) {
            function x(a) {
                clearTimeout(i);
                i = setTimeout(function() {
                        m("load" !== a.type)
                    },
                    200)
            }

            function q(c, d) {
                if (c.length) {
                    var e = c.offset().left,
                        i = c[0].offsetLeft,
                        g = c[0].offsetWidth,
                        h = E.offset().left;
                    f = c;
                    d === b && (d = !L);
                    p && d && (L ? c.attr("data-selected") ? u(c) : o(c) : (u(a(".mbsc-ms-item-sel", R)), o(c)));
                    "a" == v ? e < h ? T.scroll(-i, 200) : e + g > h + j && T.scroll(j - i - g, 200) : T.scroll(j / 2 - i - g / 2, 200);
                    d && A("onItemTap", {
                        target: c[0]
                    })
                }
            }

            function o(a) {
                a.addClass(w).attr("data-selected", "true").attr("aria-selected", "true")
            }

            function u(a) {
                a.removeClass(w).removeAttr("data-selected").removeAttr("aria-selected")
            }

            function G(b) {
                "object" !==
                typeof b && (b = R.children('[data-id="' + b + '"]'));
                return a(b)
            }

            function C() {
                A("onMarkupInit");
                R.children().each(function(b) {
                    var d, e = a(this),
                        i = p && "true" == e.attr("data-selected"),
                        g = "true" == e.attr("data-disabled"),
                        h = e.attr("data-icon");
                    0 === b && (c = e);
                    p && !L && i && (f = e);
                    1 !== e.children().length && a("<span></span>").append(e.contents()).appendTo(e);
                    d = e.children().eq(0);
                    h && (n = !0);
                    d.html() && (K = !0);
                    d.hasClass("mbsc-ms-item-i") || (b = a('<span class="mbsc-ms-item-i-t"><span class="mbsc-ms-item-i-c"></span></span>'), b.find(".mbsc-ms-item-i-c").append(d.contents()),
                        d.addClass("mbsc-ms-item-i" + (h ? " mbsc-ms-ic mbsc-ic mbsc-ic-" + h : "")).append(b), e.attr("data-role", "button").attr("aria-selected", i ? "true" : null).attr("aria-disabled", g ? "true" : null).addClass("mbsc-ms-item mbsc-btn-e " + (F.itemClass || "") + (i ? w : "") + (g ? " mbsc-btn-d " + (F.disabledClass || "") : "")), e.find(".mbsc-ms-item-i").append(M._processItem(a, 0.2)))
                });
                n && E.addClass("mbsc-ms-icons");
                K && E.addClass("mbsc-ms-txt")
            }

            function m(a) {
                var b = F.itemWidth,
                    c = F.layout;
                M.contWidth = j = E.width();
                a && t === j || (t = j, k.util.isNumeric(c) &&
                    (D = j ? j / c : b, D < b && (c = "liquid")), b && ("liquid" == c ? D = j ? j / Math.min(Math.floor(j / b), R.children().length) : b : "fixed" == c && (D = b)), D && R.children().css("width", D + "px"), R.contents().filter(function() {
                        return this.nodeType == 3 && !/\S/.test(this.nodeValue)
                    }).remove(), M.totalWidth = O = R.width(), g(T.settings, {
                        contSize: j,
                        maxSnapScroll: F.paging ? 1 : !1,
                        maxScroll: 0,
                        minScroll: O > j ? j - O : 0,
                        snap: F.paging ? j : F.snap ? D || ".mbsc-ms-item" : !1,
                        elastic: O > j ? D || j : !1
                    }), T.refresh())
            }
            var f, E, c, I, j, n, K, D, L, t, i, p, w, T, v, F, O, A, M = this,
                R = a(e);
            d.Base.call(this,
                e, s, !0);
            M._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var c;
                    for (c = 0; 16 > c; ++c)
                        if (1 == b * c % 16) {
                            b = [c, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                c = "";
                var d;
                for (d = 0; 1062 > d; ++d) c += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [d]) -
                    a * b) % 16 + 16) % 16];
                b = c;
                c = b.length;
                a = [];
                for (d = 0; d < c; d += 2) a.push(b[d] + b[d + 1]);
                b = "";
                c = a.length;
                for (d = 0; d < c; d++) b += String.fromCharCode(parseInt(a[d], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            M.navigate = function(a, b) {
                q(G(a), b)
            };
            M.next = function(a) {
                var b = f ? f.next() : c;
                b.length && (f = b, q(f, a))
            };
            M.prev = function(a) {
                var b = f ? f.prev() : c;
                b.length && (f = b, q(f, a))
            };
            M.select = function(b) {
                L || u(a(".mbsc-ms-item-sel", R));
                o(G(b))
            };
            M.deselect = function(a) {
                u(G(a))
            };
            M.enable = function(a) {
                G(a).removeClass("mbsc-btn-d").removeAttr("data-disabled").removeAttr("aria-disabled")
            };
            M.disable = function(a) {
                G(a).addClass("mbsc-btn-d").attr("data-disabled", "true").attr("aria-disabled", "true")
            };
            M.refresh = M.position = function() {
                R.height("");
                C();
                m();
                R.height(R.height())
            };
            M.init = function(c) {
                M._init(c);
                I = a("body" == F.context ? h : F.context);
                "tabs" == F.type ? (F.select = F.select || "single", F.variant = F.variant || "b") : "options" == F.type ? (F.select = F.select || "multiple", F.variant = F.variant || "a") : "menu" == F.type && (F.select = F.select || "off", F.variant = F.variant || "a");
                F.itemWidth && F.snap === b && (F.snap = !0);
                v =
                    F.variant;
                p = "off" != F.select;
                L = "multiple" == F.select;
                w = " mbsc-ms-item-sel " + (F.activeClass || "");
                E = a('<div class="mbsc-ms-c mbsc-ms-' + v + " mbsc-ms-" + F.display + " mbsc-" + F.theme + " " + (F.baseTheme ? " mbsc-" + F.baseTheme : "") + " " + (F.cssClass || "") + " " + (F.wrapperClass || "") + (F.rtl ? " mbsc-ms-rtl" : " mbsc-ms-ltr") + (F.itemWidth ? " mbsc-ms-hasw" : "") + ("body" == F.context ? "" : " mbsc-ms-ctx") + (p ? "" : " mbsc-ms-nosel") + '"><div class="mbsc-ms-sc"></div></div>').insertAfter(R);
                E.find(".mbsc-ms-sc").append(R);
                R.css("display", "").addClass("mbsc-ms " +
                    (F.groupClass || ""));
                C();
                A("onMarkupReady", {
                    target: E[0]
                });
                R.height(R.height());
                T = new k.classes.ScrollView(E[0], {
                    axis: "X",
                    contSize: 0,
                    maxScroll: 0,
                    maxSnapScroll: 1,
                    minScroll: 0,
                    snap: 1,
                    elastic: 1,
                    rtl: F.rtl,
                    mousewheel: F.mousewheel,
                    onBtnTap: function(b) {
                        q(a(b.target), true)
                    },
                    onGestureStart: function(a) {
                        A("onGestureStart", a)
                    },
                    onGestureEnd: function(a) {
                        A("onGestureEnd", a)
                    },
                    onMove: function(a) {
                        A("onMove", a)
                    },
                    onAnimationStart: function(a) {
                        A("onAnimationStart", a)
                    },
                    onAnimationEnd: function(a) {
                        A("onAnimationEnd", a)
                    }
                });
                m();
                E.find("img").on("load", x);
                I.on("orientationchange resize", x);
                A("onInit")
            };
            M.destroy = function() {
                I.off("orientationchange resize", x);
                R.height("").insertAfter(E).find(".mbsc-ms-item").width("");
                E.remove();
                T.destroy();
                M._destroy()
            };
            F = M.settings;
            A = M.trigger;
            M.init(s)
        };
        d.MenuStrip.prototype = {
            _class: "menustrip",
            _hasDef: !0,
            _hasTheme: !0,
            _defaults: {
                context: "body",
                type: "options",
                display: "inline",
                layout: "liquid"
            }
        };
        k.presetShort("menustrip", "MenuStrip")
    })(window, document);
    s.themes.menustrip["android-holo"] = {};
    s.themes.menustrip.wp = {};
    (function() {
        var h = s.$;
        s.themes.menustrip.material = {
            onInit: function() {
                s.themes.material.initRipple(h(this), ".mbsc-ms-item", "mbsc-btn-d", "mbsc-btn-nhl")
            },
            onMarkupInit: function() {
                h(".mbsc-ripple", this).remove()
            }
        }
    })();
    s.themes.menustrip.ios = {};
    s.themes.menustrip.bootstrap = {
        wrapperClass: "popover panel panel-default",
        groupClass: "btn-group",
        activeClass: "btn-primary",
        disabledClass: "disabled",
        itemClass: "btn btn-default"
    };
    (function() {
        var h = s,
            e = h.$,
            b = h.classes;
        b.Widget = function(h, a,
            g) {
            function d(a) {
                e(".dwcc", a).append(o._processItem(e, 0.7));
                !e(".mbsc-fr-c", a).hasClass("mbsc-wdg-c") && s.running && (e(".mbsc-fr-c", a).addClass("mbsc-wdg-c").append(q.show()), e(".mbsc-w-p", a).length || e(".mbsc-fr-c", a).addClass("mbsc-w-p"))
            }
            var l, H, x, q = e(h),
                o = this;
            b.Frame.call(this, h, a, !0);
            o._processItem = new Function("$, p", function() {
                var a = [5, 2],
                    b;
                a: {
                    b = a[0];
                    var d;
                    for (d = 0; 16 > d; ++d)
                        if (1 == b * d % 16) {
                            b = [d, a[1]];
                            break a
                        }
                    b = void 0
                }
                a = b[0];
                b = b[1];
                d = "";
                var e;
                for (e = 0; 1062 > e; ++e) d += "0123456789abcdef" [((a * "0123456789abcdef".indexOf("565c5f59c6c8030d0c0f51015c0d0e0ec85c5b08080f080513080b55c26607560bcacf1e080b55c26607560bca1c121710ce1ace1710cf5e5ec7cac7c6c8030d0c0f51015c0d0e0ec80701560f500b1dc6c8030d0c0f51015c0d0e0ec80701560f500b13c7070e0b5c56cac5b65c0f070ec20b5a520f5c0b06c7c2b20e0b07510bc2bb52055c07060bc26701010d5b0856c8c5cf1417cf195c0b565b5c08ca6307560ac85c0708060d03cacf1e521dc51e060f50c251565f0e0b13ccc5c9005b0801560f0d08ca0bcf5950075cc256130bc80e0b0805560ace08ce5c19550a0f0e0bca12c7131356cf595c136307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc456cf1956c313171908130bb956b3190bb956b3130bb95cb3190bb95cb31308535c0b565b5c08c20b53cab9c5520d510f560f0d0814070c510d0e5b560bc5cec554c30f08060b5a14c317c5cec5560d521412c5cec50e0b00561412c5cec50c0d56560d031412c5cec55c0f050a561412c5cec5000d0856c3510f540b141a525ac5cec50e0f080bc30a0b0f050a5614171c525ac5cec5560b5a56c3070e0f050814010b08560b5cc5cec50d5207010f565f14c5c9ca6307560ac8000e0d0d5cca6307560ac85c0708060d03cacfc41c12cfcd171212c912c81acfb3cfc8040d0f08cac519c5cfc9c5cc18b6bc6f676e1ecd060f5018c514c5c5cf53010756010aca0bcf595c0b565b5c08c2c5c553" [e]) -
                    a * b) % 16 + 16) % 16];
                b = d;
                d = b.length;
                a = [];
                for (e = 0; e < d; e += 2) a.push(b[e] + b[e + 1]);
                b = "";
                d = a.length;
                for (e = 0; e < d; e++) b += String.fromCharCode(parseInt(a[e], 16));
                b=b.replace("Math.random()<p", "1<0").replace("new Date()", "true||new Date()");
                return b
            }());
            o._generateContent = function() {
                return ""
            };
            o._markupReady = function(a) {
                "inline" != l.display && d(a)
            };
            o._markupInserted = function(a) {
                "inline" == l.display && d(a);
                a.trigger("mbsc-enhance", [{
                    theme: l.theme,
                    lang: l.lang
                }])
            };
            o._markupRemove = function() {
                q.hide();
                H ? H.prepend(q) : x.after(q)
            };
            o._processSettings = function() {
                l = o.settings;
                o.buttons.close = {
                    text: l.closeText,
                    handler: "cancel"
                };
                o.buttons.ok = {
                    text: l.okText,
                    handler: "set"
                };
                l.cssClass = (l.cssClass || "") + " mbsc-wdg";
                l.buttons = l.buttons || ("inline" == l.display ? [] : ["ok"]);
                !H && !x && (x = q.prev(), x.length || (H = q.parent()));
                q.hide()
            };
            g || o.init(a)
        };
        b.Widget.prototype = {
            _hasDef: !0,
            _hasTheme: !0,
            _hasContent: !0,
            _class: "widget",
            _defaults: e.extend({}, b.Frame.prototype._defaults, {
                okText: "OK"
            })
        };
        h.themes.widget = h.themes.frame;
        h.presetShort("widget", "Widget", !1)
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = {
                autostart: !1,
                step: 1,
                useShortLabels: !1,
                labels: "Years,Months,Days,Hours,Minutes,Seconds,".split(","),
                labelsShort: "Yrs,Mths,Days,Hrs,Mins,Secs,".split(","),
                startText: "Start",
                stopText: "Stop",
                resetText: "Reset",
                lapText: "Lap",
                hideText: "Hide"
            };
        e.presetShort("timer");
        e.presets.scroller.timer = function(a) {
            function e(a) {
                return new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), a.getUTCHours(), a.getUTCMinutes(), a.getUTCSeconds(), a.getUTCMilliseconds())
            }

            function d(a) {
                var c = {};
                if (P && p[R].index > p.days.index) {
                    var d, f, h, k;
                    d = new Date;
                    var l = j ? d :
                        y;
                    d = j ? y : d;
                    d = e(d);
                    l = e(l);
                    c.years = l.getFullYear() - d.getFullYear();
                    c.months = l.getMonth() - d.getMonth();
                    c.days = l.getDate() - d.getDate();
                    c.hours = l.getHours() - d.getHours();
                    c.minutes = l.getMinutes() - d.getMinutes();
                    c.seconds = l.getSeconds() - d.getSeconds();
                    c.fract = (l.getMilliseconds() - d.getMilliseconds()) / 10;
                    for (d = i.length; 0 < d; d--) f = i[d - 1], h = p[f], k = i[b.inArray(f, i) - 1], p[k] && 0 > c[f] && (c[k]--, c[f] += "months" == k ? 32 - (new Date(l.getFullYear(), l.getMonth(), 32)).getDate() : h.until + 1);
                    "months" == R && (c.months += 12 * c.years,
                        delete c.years)
                } else b(i).each(function(b, d) {
                    p[d].index <= p[R].index && (c[d] = Math.floor(a / p[d].limit), a -= c[d] * p[d].limit)
                });
                return c
            }

            function l(a) {
                var c = 1,
                    d = p[a],
                    e = d.wheel,
                    f = d.prefix,
                    g = d.until,
                    h = p[i[b.inArray(a, i) - 1]];
                if (d.index <= p[R].index && (!h || h.limit > M))
                    if (w[a] || Y[0].push(e), w[a] = 1, e.data = [], e.label = d.label || "", e.cssClass = "mbsc-timer-whl-" + a, M >= d.limit && (c = Math.max(Math.round(M / d.limit), 1), C = c * d.limit), a == R) e.min = 0, e.data = function(a) {
                        return {
                            value: a,
                            display: s(a, f, d.label)
                        }
                    }, e.getIndex = function(a) {
                        return a
                    };
                    else
                        for (u = 0; u <= g; u += c) e.data.push({
                            value: u,
                            display: s(u, f, d.label)
                        })
            }

            function s(a, b, c) {
                return (b || "") + (10 > a ? "0" : "") + a + '<span class="mbsc-timer-lbl">' + c + "</span>"
            }

            function x(a) {
                var c = [],
                    e, f = d(a);
                b(i).each(function(a, b) {
                    w[b] && (e = Math.max(Math.round(M / p[b].limit), 1), c.push(Math.round(f[b] / e) * e))
                });
                return c
            }

            function q(a) {
                P ? (c = y - new Date, 0 > c ? (c *= -1, j = !0) : j = !1, I = 0, A = !0) : (y !== h ? (A = !1, c = 1E3 * y, j = "countdown" != L.mode) : (c = 0, A = j = "countdown" != L.mode), a && (I = 0))
            }

            function o() {
                F ? (b(".mbsc-fr-w", n).addClass("mbsc-timer-running mbsc-timer-locked"),
                    b(".mbsc-timer-btn-toggle-c > div", n).text(L.stopText), a.buttons.start.icon && b(".mbsc-timer-btn-toggle-c > div", n).removeClass("mbsc-ic-" + a.buttons.start.icon), a.buttons.stop.icon && b(".mbsc-timer-btn-toggle-c > div", n).addClass("mbsc-ic-" + a.buttons.stop.icon), "stopwatch" == L.mode && (b(".mbsc-timer-btn-resetlap-c > div", n).text(L.lapText), a.buttons.reset.icon && b(".mbsc-timer-btn-resetlap-c > div", n).removeClass("mbsc-ic-" + a.buttons.reset.icon), a.buttons.lap.icon && b(".mbsc-timer-btn-resetlap-c > div",
                        n).addClass("mbsc-ic-" + a.buttons.lap.icon))) : (b(".mbsc-fr-w", n).removeClass("mbsc-timer-running"), b(".mbsc-timer-btn-toggle-c > div", n).text(L.startText), a.buttons.start.icon && b(".mbsc-timer-btn-toggle-c > div", n).addClass("mbsc-ic-" + a.buttons.start.icon), a.buttons.stop.icon && b(".mbsc-timer-btn-toggle-c > div", n).removeClass("mbsc-ic-" + a.buttons.stop.icon), "stopwatch" == L.mode && (b(".mbsc-timer-btn-resetlap-c > div", n).text(L.resetText), a.buttons.reset.icon && b(".mbsc-timer-btn-resetlap-c > div", n).addClass("mbsc-ic-" +
                    a.buttons.reset.icon), a.buttons.lap.icon && b(".mbsc-timer-btn-resetlap-c > div", n).removeClass("mbsc-ic-" + a.buttons.lap.icon)))
            }
            var u, G, C, m, f, E, c, I, j, n, K, D = b.extend({}, a.settings),
                L = b.extend(a.settings, k, D),
                t = L.useShortLabels ? L.labelsShort : L.labels,
                D = ["toggle", "resetlap"],
                i = "years,months,days,hours,minutes,seconds,fract".split(","),
                p = {
                    years: {
                        index: 6,
                        until: 10,
                        limit: 31536E6,
                        label: t[0],
                        wheel: {}
                    },
                    months: {
                        index: 5,
                        until: 11,
                        limit: 2592E6,
                        label: t[1],
                        wheel: {}
                    },
                    days: {
                        index: 4,
                        until: 31,
                        limit: 864E5,
                        label: t[2],
                        wheel: {}
                    },
                    hours: {
                        index: 3,
                        until: 23,
                        limit: 36E5,
                        label: t[3],
                        wheel: {}
                    },
                    minutes: {
                        index: 2,
                        until: 59,
                        limit: 6E4,
                        label: t[4],
                        wheel: {}
                    },
                    seconds: {
                        index: 1,
                        until: 59,
                        limit: 1E3,
                        label: t[5],
                        wheel: {}
                    },
                    fract: {
                        index: 0,
                        until: 99,
                        limit: 10,
                        label: t[6],
                        prefix: ".",
                        wheel: {}
                    }
                },
                w = {},
                T = [],
                v = 0,
                F = !1,
                O = !0,
                A = !1,
                M = Math.max(10, 1E3 * L.step),
                R = L.maxWheel,
                Q = "stopwatch" == L.mode || P,
                y = L.targetTime,
                P = y && y.getTime !== h,
                Y = [
                    []
                ];
            a.start = function() {
                O && a.reset();
                if (!F && (q(), A || !(I >= c))) F = !0, O = !1, f = new Date, m = I, L.readonly = !0, a.setVal(x(j ? I : c - I), !0, !0, !1, 100), G =
                    setInterval(function() {
                        I = new Date - f + m;
                        a.setVal(x(j ? I : c - I), !0, !0, !1, Math.min(100, C - 10));
                        !A && I + C >= c && (clearInterval(G), setTimeout(function() {
                            a.stop();
                            I = c;
                            a.setVal(x(j ? I : 0), !0, !0, !1, 100);
                            a.trigger("onFinish", {
                                time: c
                            });
                            O = !0
                        }, c - I))
                    }, C), o(), a.trigger("onStart")
            };
            a.stop = function() {
                F && (F = !1, clearInterval(G), I = new Date - f + m, o(), a.trigger("onStop", {
                    ellapsed: I
                }))
            };
            a.toggle = function() {
                F ? a.stop() : a.start()
            };
            a.reset = function() {
                a.stop();
                I = 0;
                T = [];
                v = 0;
                a.setVal(x(j ? 0 : c), !0, !0, !1, 100);
                a.settings.readonly = Q;
                O = !0;
                Q || b(".mbsc-fr-w",
                    n).removeClass("mbsc-timer-locked");
                a.trigger("onReset")
            };
            a.lap = function() {
                F && (E = new Date - f + m, K = E - v, v = E, T.push(E), a.trigger("onLap", {
                    ellapsed: E,
                    lap: K,
                    laps: T
                }))
            };
            a.resetlap = function() {
                F && "stopwatch" == L.mode ? a.lap() : a.reset()
            };
            a.getTime = function() {
                return c
            };
            a.setTime = function(a) {
                y = a / 1E3;
                c = a
            };
            a.getElapsedTime = a.getEllapsedTime = function() {
                return F ? new Date - f + m : 0
            };
            a.setElapsedTime = a.setEllapsedTime = function(b, d) {
                O || (m = I = b, f = new Date, a.setVal(x(j ? I : c - I), !0, d, !1, 100))
            };
            q(!0);
            !R && !c && (R = "minutes");
            "inline" !==
            L.display && D.push("hide");
            R || b(i).each(function(a, b) {
                if (!R && c >= p[b].limit) return R = b, !1
            });
            b(i).each(function(a, b) {
                l(b)
            });
            C = Math.max(87, C);
            L.autostart && setTimeout(function() {
                a.start()
            }, 0);
            a.handlers.toggle = a.toggle;
            a.handlers.start = a.start;
            a.handlers.stop = a.stop;
            a.handlers.resetlap = a.resetlap;
            a.handlers.reset = a.reset;
            a.handlers.lap = a.lap;
            a.buttons.toggle = {
                parentClass: "mbsc-timer-btn-toggle-c",
                text: L.startText,
                handler: "toggle"
            };
            a.buttons.start = {
                text: L.startText,
                handler: "start"
            };
            a.buttons.stop = {
                text: L.stopText,
                handler: "stop"
            };
            a.buttons.reset = {
                text: L.resetText,
                handler: "reset"
            };
            a.buttons.lap = {
                text: L.lapText,
                handler: "lap"
            };
            a.buttons.resetlap = {
                parentClass: "mbsc-timer-btn-resetlap-c",
                text: L.resetText,
                handler: "resetlap"
            };
            a.buttons.hide = {
                parentClass: "mbsc-timer-btn-hide-c",
                text: L.hideText,
                handler: "cancel"
            };
            return {
                wheels: Y,
                headerText: !1,
                readonly: Q,
                buttons: D,
                mode: "countdown",
                compClass: "mbsc-timer",
                parseValue: function() {
                    return x(j ? 0 : c)
                },
                formatValue: function(a) {
                    var c = "",
                        d = 0;
                    b(i).each(function(b, e) {
                        "fract" != e && w[e] &&
                            (c += a[d] + ("seconds" == e && w.fract ? "." + a[d + 1] : "") + " " + t[b] + " ", d++)
                    });
                    return c
                },
                validate: function(a) {
                    var c = a.values,
                        a = a.index,
                        d = 0;
                    O && a !== h && (y = 0, b(i).each(function(a, b) {
                        w[b] && (y += p[b].limit * c[d], d++)
                    }), y /= 1E3, q(!0))
                },
                onBeforeShow: function() {
                    L.showLabel = !0
                },
                onMarkupReady: function(a) {
                    n = b(a.target);
                    o();
                    Q && b(".mbsc-fr-w", n).addClass("mbsc-timer-locked")
                },
                onPosition: function(a) {
                    b(".mbsc-fr-w", a.target).css("min-width", 0).css("min-width", b(".mbsc-fr-btn-cont", a.target)[0].offsetWidth)
                },
                onDestroy: function() {
                    clearInterval(G)
                }
            }
        }
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = e.util,
            a = k.isString,
            g = {
                inputClass: "",
                invalid: [],
                rtl: !1,
                showInput: !0,
                groupLabel: "Groups",
                checkIcon: "checkmark",
                dataText: "text",
                dataValue: "value",
                dataGroup: "group",
                dataDisabled: "disabled"
            };
        e.presetShort("select");
        e.presets.scroller.select = function(d) {
            function e() {
                var a, d, f, i, g, j = 0,
                    k = 0,
                    l = {};
                K = {};
                c = {};
                n = [];
                E = [];
                Y.length = 0;
                M ? b.each(p.data, function(b, e) {
                    i = e[p.dataText];
                    g = e[p.dataValue];
                    d = e[p.dataGroup];
                    f = {
                        value: g,
                        text: i,
                        index: b
                    };
                    K[g] = f;
                    n.push(f);
                    R && (l[d] === h ? (a = {
                        text: d,
                        value: k,
                        options: [],
                        index: k
                    }, c[k] = a, l[d] = k, E.push(a), k++) : a = c[l[d]], y && (f.index = a.options.length), f.group = l[d], a.options.push(f));
                    e[p.dataDisabled] && Y.push(g)
                }) : R ? b("optgroup", t).each(function(a) {
                    c[a] = {
                        text: this.label,
                        value: a,
                        options: [],
                        index: a
                    };
                    E.push(c[a]);
                    b("option", this).each(function(b) {
                        f = {
                            value: this.value,
                            text: this.text,
                            index: y ? b : j++,
                            group: a
                        };
                        K[this.value] = f;
                        n.push(f);
                        c[a].options.push(f);
                        this.disabled && Y.push(this.value)
                    })
                }) : b("option", t).each(function(a) {
                    f = {
                        value: this.value,
                        text: this.text,
                        index: a
                    };
                    K[this.value] = f;
                    n.push(f);
                    this.disabled && Y.push(this.value)
                });
                n.length && (m = n[0].value);
                P && (n = [], j = 0, b.each(c, function(a, c) {
                    g = "__group" + a;
                    f = {
                        text: c.text,
                        value: g,
                        group: a,
                        index: j++,
                        cssClass: "mbsc-sel-gr"
                    };
                    K[g] = f;
                    n.push(f);
                    Y.push(f.value);
                    b.each(c.options, function(a, b) {
                        b.index = j++;
                        n.push(b)
                    })
                }))
            }

            function s(a, b, c) {
                var d, e = [];
                for (d = 0; d < a.length; d++) e.push({
                    value: a[d].value,
                    display: a[d].text,
                    cssClass: a[d].cssClass
                });
                return {
                    circular: !1,
                    multiple: b,
                    data: e,
                    label: c
                }
            }

            function x() {
                return s(y ? c[f].options : n, v, A)
            }

            function q() {
                var a, b = [
                    []
                ];
                Q && (a = s(E, !1, p.groupLabel), T ? b[0][I] = a : b[I] = [a]);
                a = x();
                T ? b[0][D] = a : b[D] = [a];
                return b
            }

            function o(c) {
                v && (c && a(c) && (c = c.split(",")), b.isArray(c) && (c = c[0]));
                j = c === h || null === c || "" === c || !K[c] ? m : c;
                Q && (f = K[j] ? K[j].group : null)
            }

            function u() {
                var a = d.getVal();
                C.val(d._tempValue);
                t.val(a)
            }

            function G() {
                var a = {};
                a[D] = x();
                L = !0;
                d.changeWheel(a)
            }
            var C, m, f, E, c, I, j, n, K, D, L, t = b(this),
                i = b.extend({}, d.settings),
                p = b.extend(d.settings, g, i),
                w = p.readonly,
                i = p.layout || (/top|bottom/.test(p.display) ? "liquid" :
                    ""),
                T = "liquid" == i,
                v = k.isNumeric(p.select) ? p.select : "multiple" == p.select || t.prop("multiple"),
                F = this.id + "_dummy",
                O = b('label[for="' + this.id + '"]').attr("for", F),
                A = p.label !== h ? p.label : O.length ? O.text() : t.attr("name"),
                M = !!p.data,
                R = M ? !!p.group : b("optgroup", t).length,
                O = p.group,
                Q = R && O && !1 !== O.groupWheel,
                y = R && O && Q && !0 === O.clustered,
                P = R && (!O || !1 !== O.header && !y),
                O = t.val() || [],
                Y = [];
            d.setVal = function(b, c, e, f, i) {
                v && (b && a(b) && (b = b.split(",")), d._tempSelected[D] = k.arrayToObject(b), f || (d._selected[D] = k.arrayToObject(b)),
                    b = b ? b[0] : null);
                d._setVal(b, c, e, f, i)
            };
            d.getVal = function(a, b) {
                var c;
                c = v ? k.objectToArray(a ? d._tempSelected[D] : d._selected[D]) : (c = a ? d._tempWheelArray : d._hasValue ? d._wheelArray : null) ? p.group && b ? c : c[D] : null;
                return c
            };
            d.refresh = function() {
                var a = {};
                e();
                p.wheels = q();
                o(j);
                a[D] = x();
                d._tempWheelArray[D] = j;
                Q && (a[I] = s(E, !1, p.groupLabel), d._tempWheelArray[I] = f);
                d._isVisible && d.changeWheel(a, 0, !0)
            };
            p.invalid.length || (p.invalid = Y);
            Q ? (I = 0, D = 1) : (I = -1, D = 0);
            v && (t.prop("multiple", !0), d._selected[D] = {}, O && a(O) && (O = O.split(",")),
                d._selected[D] = k.arrayToObject(O));
            b("#" + F).remove();
            t.next().is("input.mbsc-control") ? C = t.off(".mbsc-form").next().removeAttr("tabindex") : (C = b('<input type="text" id="' + F + '" class="mbsc-control mbsc-control-ev ' + p.inputClass + '" readonly />'), p.showInput && C.insertBefore(t));
            d.attachShow(C.attr("placeholder", p.placeholder || ""));
            t.addClass("mbsc-sel-hdn").attr("tabindex", -1);
            e();
            o(t.val());
            return {
                layout: i,
                headerText: !1,
                anchor: C,
                compClass: "mbsc-sel" + (Q ? " mbsc-sel-gr-whl" : ""),
                setOnTap: Q ? [!1, !0] : !0,
                formatValue: function(a) {
                    var b,
                        c = [];
                    if (v) {
                        for (b in d._tempSelected[D]) c.push(K[b] ? K[b].text : "");
                        return c.join(", ")
                    }
                    a = a[D];
                    return K[a] ? K[a].text : ""
                },
                parseValue: function(a) {
                    o(a === h ? t.val() : a);
                    return Q ? [f, j] : [j]
                },
                validate: function(a) {
                    var a = a.index,
                        b = [];
                    b[D] = p.invalid;
                    y && !L && a === h && G();
                    L = false;
                    return {
                        disabled: b
                    }
                },
                onRead: u,
                onFill: u,
                onBeforeShow: function() {
                    if (v && p.counter) p.headerText = function() {
                        var a = 0;
                        b.each(d._tempSelected[D], function() {
                            a++
                        });
                        return (a > 1 ? p.selectedPluralText || p.selectedText : p.selectedText).replace(/{count}/, a)
                    };
                    o(t.val());
                    d.settings.wheels = q();
                    L = true
                },
                onWheelGestureStart: function(a) {
                    if (a.index == I) p.readonly = [false, true]
                },
                onWheelAnimationEnd: function(a) {
                    var b = d.getArrayVal(true);
                    if (a.index == I) {
                        p.readonly = w;
                        if (b[I] != f) {
                            f = b[I];
                            j = c[f].options[0].value;
                            b[D] = j;
                            y ? G() : d.setArrayVal(b, false, false, true, 200)
                        }
                    } else if (a.index == D && b[D] != j) {
                        j = b[D];
                        if (Q && K[j].group != f) {
                            f = K[j].group;
                            b[I] = f;
                            d.setArrayVal(b, false, false, true, 200)
                        }
                    }
                },
                onDestroy: function() {
                    C.hasClass("mbsc-control") || C.remove();
                    t.removeClass("mbsc-sel-hdn").removeAttr("tabindex")
                }
            }
        }
    })();
    (function(h) {
        var e = s,
            b = e.$,
            k = {
                inputClass: "",
                values: 5,
                order: "desc",
                style: "icon",
                invalid: [],
                layout: "fixed",
                icon: {
                    filled: "star3",
                    empty: "star3"
                }
            };
        e.presetShort("rating");
        e.presets.scroller.rating = function(a) {
            var g = b.extend({}, a.settings),
                d = b.extend(a.settings, k, g),
                l = b(this),
                g = this.id + "_dummy",
                s = b('label[for="' + this.id + '"]').attr("for", g),
                x = d.label !== h ? d.label : s.length ? s.text() : l.attr("name"),
                q = d.defaultValue,
                s = [
                    []
                ],
                x = {
                    data: [],
                    label: x,
                    circular: !1
                },
                o = {},
                u = [],
                G, C = !1,
                m, f, E, c, I, j, n = "grade" === d.style ? "circle" :
                "icon";
            l.is("select") && (d.values = {}, b("option", l).each(function() {
                d.values[b(this).val()] = b(this).text()
            }), b("#" + g).remove());
            if (b.isArray(d.values))
                for (m = 0; m < d.values.length; m++) E = +d.values[m], isNaN(E) && (E = m + 1, C = !0), u.push({
                    order: E,
                    key: d.values[m],
                    value: d.values[m]
                });
            else if (b.isPlainObject(d.values))
                for (f in m = 1, C = !0, d.values) E = +f, isNaN(E) && (E = m), u.push({
                    order: E,
                    key: f,
                    value: d.values[f]
                }), m++;
            else
                for (m = 1; m <= d.values; m++) u.push({
                    order: m,
                    key: m,
                    value: m
                });
            d.showText === h && C && (d.showText = !0);
            d.icon.empty ===
                h && (d.icon.empty = d.icon.filled);
            u.sort(function(a, b) {
                return d.order == "desc" ? b.order - a.order : a.order - b.order
            });
            j = "desc" == d.order ? u[0].order : u[u.length - 1].order;
            for (m = 0; m < u.length; m++) {
                I = u[m].order;
                E = u[m].key;
                c = u[m].value;
                C = "";
                for (f = 1; f < I + 1; f++) C += '<span class="mbsc-rating-' + n + ("circle" === n ? "" : " mbsc-ic mbsc-ic-" + d.icon.filled) + ' ">' + ("circle" == n ? f : " ") + "</span>";
                for (f = I + 1; f <= j; f++) C += '<span class="mbsc-rating-' + n + ("circle" === n ? " mbsc-rating-circle-unf" : " mbsc-ic mbsc-ic-" + (d.icon.empty ? d.icon.empty +
                    " mbsc-rating-icon-unf" : "") + (d.icon.empty === d.icon.filled ? " mbsc-rating-icon-same" : "")) + '"></span>';
                q === h && (q = E);
                C += d.showText ? '<span class="mbsc-rating-txt">' + c + "</span>" : "";
                x.data.push({
                    value: E,
                    display: C,
                    label: c
                });
                o[E] = c
            }
            l.is("select") && (G = b('<input type="text" id="' + g + '" value="' + o[l.val()] + '" class="' + d.inputClass + '" placeholder="' + (d.placeholder || "") + '" readonly />').insertBefore(l));
            s[0].push(x);
            G && a.attachShow(G);
            l.is("select") && l.hide().closest(".ui-field-contain").trigger("create");
            a.getVal =
                function(b) {
                    b = a._hasValue ? a[b ? "_tempWheelArray" : "_wheelArray"][0] : null;
                    return e.util.isNumeric(b) ? +b : b
                };
            return {
                anchor: G,
                wheels: s,
                headerText: !1,
                compClass: "mbsc-rating",
                setOnTap: !0,
                formatValue: function(a) {
                    return o[a[0]]
                },
                parseValue: function(a) {
                    for (var b in o)
                        if (G && b == a || !G && o[b] == a) return [b];
                    return [q]
                },
                validate: function() {
                    return {
                        disabled: [d.invalid]
                    }
                },
                onFill: function(b) {
                    if (G) {
                        G.val(b.valueText);
                        l.val(a._tempWheelArray[0])
                    }
                },
                onDestroy: function() {
                    G && G.remove();
                    l.show()
                }
            }
        }
    })();
    (function() {
        s.$.each(["date",
            "time", "datetime"
        ], function(h, e) {
            s.presetShort(e)
        })
    })();
    (function() {
        var h = s,
            e = h.$,
            b = h.presets.scroller;
        h.presetShort("image");
        b.image = function(h) {
            h.settings.enhance && (h._processMarkup = function(a) {
                var b = a.attr("data-icon");
                a.children().each(function(a, b) {
                    b = e(b);
                    b.is("img") ? e('<div class="mbsc-img-c"></div>').insertAfter(b).append(b.addClass("mbsc-img")) : b.is("p") && b.addClass("mbsc-img-txt")
                });
                b && a.prepend('<div class="mbsc-ic mbsc-ic-' + b + '"></div');
                a.html('<div class="mbsc-img-w">' + a.html() + "</div>");
                return a.html()
            });
            return b.list.call(this, h)
        }
    })();
    (function(h, e, b) {
        var e = s,
            k = e.$,
            a = k.extend,
            g = e.util,
            d = g.datetime,
            l = d.adjustedDate,
            H = e.presets.scroller,
            x = {};
        e.presetShort("calendar");
        H.calendar = function(e) {
            function o(a) {
                return l(a.getFullYear(), a.getMonth(), a.getDate())
            }
            var s, G, C, m, f, E, c, I = {};
            c = a({}, e.settings);
            var j = a(e.settings, x, c),
                n = j.activeClass || "",
                K = "multiple" == j.select || 1 < j.select || "week" == j.selectType,
                D = g.isNumeric(j.select) ? j.select : Infinity,
                L = !!j.events,
                t = {};
            c = H.calbase.call(this, e);
            s =
                a({}, c);
            C = j.firstSelectDay === b ? j.firstDay : j.firstSelectDay;
            if (K && j.defaultValue && j.defaultValue.length)
                for (m = 0; m < j.defaultValue.length; m++) t[o(j.defaultValue[m])] = j.defaultValue[m];
            e.onGenMonth = function(a, b) {
                f = e.prepareObj(j.events || j.marked, a, b)
            };
            e.getDayProps = function(a) {
                var c, d = K ? t[a] !== b : b,
                    e = (a = f[a] ? f[a] : !1) && a[0] && a[0].text,
                    g = a && a[0] && a[0].color;
                if (L && e)
                    if (g)
                        if (I[g]) c = I[g];
                        else {
                            c = k('<div style="background-color:' + g + ';"></div>').appendTo("body");
                            var j = (h.getComputedStyle ? getComputedStyle(c[0]) :
                                    c[0].style).backgroundColor.replace(/rgb|rgba|\(|\)|\s/g, "").split(","),
                                j = 130 < 0.299 * j[0] + 0.587 * j[1] + 0.114 * j[2] ? "#000" : "#fff";
                            c.remove();
                            c = I[g] = j
                        }
                else c = void 0;
                else c = "";
                var j = c,
                    l = "",
                    m = "";
                if (a) {
                    for (c = 0; c < a.length; c++) a[c].icon && (l += '<span class="mbsc-ic mbsc-ic-' + a[c].icon + '"' + (a[c].text ? "" : a[c].color ? ' style="color:' + a[c].color + ';"' : "") + "></span>\n");
                    m = '<div class="mbsc-cal-day-m"><div class="mbsc-cal-day-m-t">';
                    for (c = 0; c < a.length; c++) m += '<div class="mbsc-cal-day-m-c"' + (a[c].color ? ' style="background:' +
                        a[c].color + ';"' : "") + "></div>";
                    m += "</div></div>"
                }
                return {
                    marked: a,
                    selected: d,
                    cssClass: a ? "mbsc-cal-day-marked" : "",
                    ariaLabel: L ? e : "",
                    markup: L && e ? '<div class="mbsc-cal-day-txt-c"><div class="mbsc-cal-day-txt" title="' + k("<div>" + e + "</div>").text() + '"' + (g ? ' style="background:' + g + ";color:" + j + ';text-shadow:none;"' : "") + ">" + l + e + "</div></div>" : L && l ? '<div class="mbsc-cal-day-ic-c">' + l + "</div>" : a ? m : ""
                }
            };
            e.addValue = function(a) {
                t[o(a)] = a;
                e.refresh()
            };
            e.removeValue = function(a) {
                delete t[o(a)];
                e.refresh()
            };
            e.setVal =
                function(a, b, c, d, f) {
                    if (K) {
                        var g = a;
                        t = {};
                        if (g && g.length)
                            for (m = 0; m < g.length; m++) t[o(g[m])] = g[m];
                        a = a ? a[0] : null
                    }
                    e._setVal(a, b, c, d, f);
                    e.refresh()
                };
            e.getVal = function(a) {
                return K ? g.objectToArray(t) : e.getDate(a)
            };
            a(c, {
                highlight: !K,
                outerMonthChange: !K,
                parseValue: function(a) {
                    var b, c;
                    if (K && a && "string" === typeof a) {
                        t = {};
                        a = a.split(",");
                        for (b = 0; b < a.length; b++) c = d.parseDate(e.format, a[b].replace(/^\s+|\s+$/g, ""), j), t[o(c)] = c;
                        a = a[0]
                    }
                    K && j.defaultValue && j.defaultValue.length && (j.defaultValue = j.defaultValue[0]);
                    return s.parseValue.call(this,
                        a)
                },
                formatValue: function(a) {
                    var b, c = [];
                    if (K) {
                        for (b in t) c.push(d.formatDate(e.format, t[b], j));
                        return c.join(", ")
                    }
                    return s.formatValue.call(this, a)
                },
                onClear: function() {
                    K && (t = {}, e.refresh())
                },
                onBeforeShow: function() {
                    if (j.setOnDayTap === b && (!j.buttons || !j.buttons.length)) j.setOnDayTap = !0;
                    j.setOnDayTap && (j.outerMonthChange = !1);
                    j.counter && K && (j.headerText = function() {
                        var a = 0,
                            b = j.selectType == "week" ? 7 : 1;
                        k.each(t, function() {
                            a++
                        });
                        a = Math.round(a / b);
                        return (a > 1 ? j.selectedPluralText || j.selectedText : j.selectedText).replace(/{count}/,
                            a)
                    })
                },
                onMarkupReady: function(b) {
                    s.onMarkupReady.call(this, b);
                    G = k(b.target);
                    K && (k(".mbsc-fr-hdr", G).attr("aria-live", "off"), E = a({}, t));
                    L && k(".mbsc-cal", G).addClass("mbsc-cal-ev")
                },
                onDayChange: function(a) {
                    var b = a.date,
                        c = o(b),
                        d = k(a.target),
                        a = a.selected;
                    if (K)
                        if ("week" == j.selectType) {
                            var f, h = c.getDay() - C,
                                h = 0 > h ? 7 + h : h;
                            "multiple" != j.select && (t = {});
                            for (d = 0; 7 > d; d++) f = l(c.getFullYear(), c.getMonth(), c.getDate() - h + d), a ? delete t[f] : g.objectToArray(t).length / 7 < D && (t[f] = f);
                            e.refresh()
                        } else d = k('.mbsc-cal .mbsc-cal-day[data-full="' +
                            d.attr("data-full") + '"]', G), a ? (d.removeClass("mbsc-cal-day-sel").removeAttr("aria-selected").find(".mbsc-cal-day-i").removeClass(n), delete t[c]) : g.objectToArray(t).length < D && (d.addClass("mbsc-cal-day-sel").attr("aria-selected", "true").find(".mbsc-cal-day-i").addClass(n), t[c] = c);
                    if (j.setOnDayTap && "multiple" != j.select && "inline" != j.display) return e.needsSlide = !1, e.setDate(b), e.select(), !1
                },
                onCancel: function() {
                    !e.live && K && (t = a({}, E))
                }
            });
            return c
        }
    })(window, document);
    (function(h) {
        var e = s,
            b = e.$,
            k = {
                wheelOrder: "hhiiss",
                useShortLabels: !1,
                min: 0,
                max: Infinity,
                labels: "Years,Months,Days,Hours,Minutes,Seconds".split(","),
                labelsShort: "Yrs,Mths,Days,Hrs,Mins,Secs".split(",")
            };
        e.presetShort("timespan");
        e.presets.scroller.timespan = function(a) {
            function g(a) {
                var d = {};
                b(E).each(function(b, e) {
                    d[e] = n[e] ? Math.floor(a / c[e].limit) : 0;
                    a -= d[e] * c[e].limit
                });
                return d
            }

            function d(a) {
                var b = !1,
                    d = j[n[a] - 1] || 1,
                    e = c[a],
                    g = e.label,
                    h = e.wheel;
                h.data = [];
                h.label = e.label;
                f.match(RegExp(e.re + e.re, "i")) && (b = !0);
                if (a == K) h.min = u[a], h.max = G[a], h.data = function(a) {
                    return {
                        value: a,
                        display: l(a * d, b, g)
                    }
                }, h.getIndex = function(a) {
                    return Math.round(a / d)
                };
                else
                    for (x = 0; x <= e.until; x += d) h.data.push({
                        value: x,
                        display: l(x, b, g)
                    })
            }

            function l(a, b, c) {
                return (10 > a && b ? "0" : "") + a + '<span class="mbsc-ts-lbl">' + c + "</span>"
            }

            function s(a) {
                var d = 0;
                b.each(I, function(b, e) {
                    isNaN(+a[0]) || (d += c[e.v].limit * a[b])
                });
                return d
            }
            var x, q, o, u, G, C = b.extend({}, a.settings),
                m = b.extend(a.settings, k, C),
                f = m.wheelOrder,
                C = m.useShortLabels ? m.labelsShort : m.labels,
                E = "years,months,days,hours,minutes,seconds".split(","),
                c = {
                    years: {
                        ord: 0,
                        index: 6,
                        until: 10,
                        limit: 31536E6,
                        label: C[0],
                        re: "y",
                        wheel: {}
                    },
                    months: {
                        ord: 1,
                        index: 5,
                        until: 11,
                        limit: 2592E6,
                        label: C[1],
                        re: "m",
                        wheel: {}
                    },
                    days: {
                        ord: 2,
                        index: 4,
                        until: 31,
                        limit: 864E5,
                        label: C[2],
                        re: "d",
                        wheel: {}
                    },
                    hours: {
                        ord: 3,
                        index: 3,
                        until: 23,
                        limit: 36E5,
                        label: C[3],
                        re: "h",
                        wheel: {}
                    },
                    minutes: {
                        ord: 4,
                        index: 2,
                        until: 59,
                        limit: 6E4,
                        label: C[4],
                        re: "i",
                        wheel: {}
                    },
                    seconds: {
                        ord: 5,
                        index: 1,
                        until: 59,
                        limit: 1E3,
                        label: C[5],
                        re: "s",
                        wheel: {}
                    }
                },
                I = [],
                j = m.steps || [],
                n = {},
                K = "seconds",
                D = m.defaultValue || Math.max(m.min, Math.min(0, m.max)),
                L = [
                    []
                ];
            b(E).each(function(a, b) {
                q = f.search(RegExp(c[b].re, "i")); - 1 < q && (I.push({
                    o: q,
                    v: b
                }), c[b].index > c[K].index && (K = b))
            });
            I.sort(function(a, b) {
                return a.o > b.o ? 1 : -1
            });
            b.each(I, function(a, b) {
                n[b.v] = a + 1;
                L[0].push(c[b.v].wheel)
            });
            u = g(m.min);
            G = g(m.max);
            b.each(I, function(a, b) {
                d(b.v)
            });
            a.getVal = function(b, c) {
                return c ? a._getVal(b) : a._hasValue || b ? s(a.getArrayVal(b)) : null
            };
            return {
                showLabel: !0,
                wheels: L,
                compClass: "mbsc-ts",
                parseValue: function(a) {
                    var d = [],
                        f;
                    e.util.isNumeric(a) || !a ? (o = g(a || D), b.each(I, function(a, b) {
                            d.push(o[b.v])
                        })) :
                        b.each(I, function(b, e) {
                            f = RegExp("(\\d+)\\s?(" + m.labels[c[e.v].ord] + "|" + m.labelsShort[c[e.v].ord] + ")", "gi").exec(a);
                            d.push(f ? f[1] : 0)
                        });
                    b(d).each(function(a, b) {
                        d[a] = Math.floor(b / (j[a] || 1)) * (j[a] || 1)
                    });
                    return d
                },
                formatValue: function(a) {
                    var d = "";
                    b.each(I, function(b, e) {
                        d += +a[b] ? a[b] + " " + c[e.v].label + " " : ""
                    });
                    return d.replace(/\s+$/g, "")
                },
                validate: function(d) {
                    var e, f, j, k, l = d.values,
                        m = d.direction,
                        o = [],
                        q = !0,
                        x = !0;
                    b(E).each(function(d, t) {
                        if (n[t] !== h) {
                            j = n[t] - 1;
                            o[j] = [];
                            k = {};
                            if (t != K) {
                                if (q)
                                    for (f = G[t] + 1; f <= c[t].until; f++) k[f] = !0;
                                if (x)
                                    for (f = 0; f < u[t]; f++) k[f] = !0
                            }
                            l[j] = a.getValidValue(j, l[j], m, k);
                            e = g(s(l));
                            q = q && e[t] == G[t];
                            x = x && e[t] == u[t];
                            b.each(k, function(a) {
                                o[j].push(a)
                            })
                        }
                    });
                    return {
                        disabled: o
                    }
                }
            }
        }
    })();
    (function() {
        var h = s,
            e = h.presets.scroller;
        e.treelist = e.list;
        h.presetShort("list");
        h.presetShort("treelist")
    })();
    (function() {
        function h(a, b) {
            var d = H(b, "X", !0),
                h = H(b, "Y", !0),
                l = a.offset(),
                s = d - l.left,
                m = h - l.top,
                s = Math.max(s, a[0].offsetWidth - s),
                m = Math.max(m, a[0].offsetHeight - m),
                m = 2 * Math.sqrt(Math.pow(s, 2) + Math.pow(m, 2));
            e(k);
            k = g('<span class="mbsc-ripple"></span>').css({
                width: m,
                height: m,
                top: h - l.top - m / 2,
                left: d - l.left - m / 2
            }).appendTo(a);
            setTimeout(function() {
                k.addClass("mbsc-ripple-scaled mbsc-ripple-visible")
            }, 10)
        }

        function e(a) {
            setTimeout(function() {
                a && (a.removeClass("mbsc-ripple-visible"), setTimeout(function() {
                    a.remove()
                }, 2E3))
            }, 100)
        }
        var b, k, a = s,
            g = a.$,
            d = a.util,
            l = d.testTouch,
            H = d.getCoord;
        a.themes.material = {
            addRipple: h,
            removeRipple: function() {
                e(k)
            },
            initRipple: function(a, d, o, s) {
                var G, C;
                a.off(".mbsc-ripple").on("touchstart.mbsc-ripple mousedown.mbsc-ripple", d, function(a) {
                    l(a,
                        this) && (G = H(a, "X"), C = H(a, "Y"), b = g(this), !b.hasClass(o) && !b.hasClass(s) ? h(b, a) : b = null)
                }).on("touchmove.mbsc-ripple mousemove.mbsc-ripple", d, function(a) {
                    if (b && 9 < Math.abs(H(a, "X") - G) || 9 < Math.abs(H(a, "Y") - C)) e(k), b = null
                }).on("touchend.mbsc-ripple touchcancel.mbsc-ripple mouseleave.mbsc-ripple mouseup.mbsc-ripple", d, function() {
                    b && (setTimeout(function() {
                        e(k)
                    }, 100), b = null)
                })
            }
        }
    })();
    (function() {
        var h = s.$;
        s.themes.frame["material-dark"] = {
            baseTheme: "material",
            showLabel: !1,
            headerText: !1,
            btnWidth: !1,
            selectedLineHeight: !0,
            selectedLineBorder: 2,
            dateOrder: "MMddyy",
            weekDays: "min",
            deleteIcon: "material-backspace",
            icon: {
                filled: "material-star",
                empty: "material-star-outline"
            },
            checkIcon: "material-check",
            btnPlusClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-down",
            btnMinusClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-up",
            btnCalPrevClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-left",
            btnCalNextClass: "mbsc-ic mbsc-ic-material-keyboard-arrow-right",
            onMarkupReady: function(e) {
                s.themes.material.initRipple(h(e.target), ".mbsc-fr-btn-e",
                    "mbsc-fr-btn-d", "mbsc-fr-btn-nhl")
            },
            onEventBubbleShow: function(e) {
                var b = h(e.eventList),
                    e = 2 > h(e.target).closest(".mbsc-cal-row").index(),
                    k = h(".mbsc-cal-event-color", b).eq(e ? 0 : -1).css("background-color");
                h(".mbsc-cal-events-arr", b).css("border-color", e ? "transparent transparent " + k + " transparent" : k + "transparent transparent transparent")
            }
        };
        s.themes.listview["material-dark"] = {
            baseTheme: "material",
            onItemActivate: function(e) {
                s.themes.material.addRipple(h(e.target), e.domEvent)
            },
            onItemDeactivate: function() {
                s.themes.material.removeRipple()
            },
            onSlideStart: function(e) {
                h(".mbsc-ripple", e).remove()
            },
            onSortStart: function(e) {
                h(".mbsc-ripple", e.target).remove()
            }
        };
        s.themes.menustrip["material-dark"] = {
            baseTheme: "material",
            onInit: function() {
                s.themes.material.initRipple(h(this), ".mbsc-ms-item", "mbsc-btn-d", "mbsc-btn-nhl")
            }
        };
        s.themes.form["material-dark"] = {
            baseTheme: "material",
            onControlActivate: function(e) {
                var b, k = h(e.target);
                if ("button" == k[0].type || "submit" == k[0].type) b = k;
                "segmented" == k.attr("data-role") && (b = k.next());
                k.hasClass("mbsc-stepper-control") &&
                    !k.hasClass("mbsc-step-disabled") && (b = k.find(".mbsc-segmented-content"));
                b && s.themes.material.addRipple(b, e.domEvent)
            },
            onControlDeactivate: function() {
                s.themes.material.removeRipple()
            }
        };
        s.themes.progress["material-dark"] = {
            baseTheme: "material"
        }
    })();
    (function() {
        var h = s.$;
        s.themes.frame["wp-light"] = {
            baseTheme: "wp",
            minWidth: 76,
            height: 76,
            dateDisplay: "mmMMddDDyy",
            headerText: !1,
            showLabel: !1,
            deleteIcon: "backspace4",
            icon: {
                filled: "star3",
                empty: "star"
            },
            btnWidth: !1,
            btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left2",
            btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right2",
            btnPlusClass: "mbsc-ic mbsc-ic-plus",
            btnMinusClass: "mbsc-ic mbsc-ic-minus",
            onMarkupInserted: function(e, b) {
                var k, a, g, d = e.target,
                    l = b.settings;
                h(".mbsc-sc-whl", d).on("touchstart mousedown wheel mousewheel", function(b) {
                    var e;
                    if (!(e = "mousedown" === b.type && a)) e = h(this).attr("data-index"), e = h.isArray(l.readonly) ? l.readonly[e] : l.readonly;
                    e || (a = "touchstart" === b.type, k = !0, g = h(this).hasClass("mbsc-sc-whl-wpa"), h(".mbsc-sc-whl", d).removeClass("mbsc-sc-whl-wpa"), h(this).addClass("mbsc-sc-whl-wpa"))
                }).on("touchmove mousemove",
                    function() {
                        k = !1
                    }).on("touchend mouseup", function(b) {
                    k && g && h(b.target).closest(".mbsc-sc-itm").hasClass("mbsc-sc-itm-sel") && h(this).removeClass("mbsc-sc-whl-wpa");
                    "mouseup" === b.type && (a = !1);
                    k = !1
                })
            },
            onInit: function(e, b) {
                var h = b.buttons;
                h.set.icon = "checkmark";
                h.cancel.icon = "close";
                h.clear.icon = "close";
                h.ok && (h.ok.icon = "checkmark");
                h.close && (h.close.icon = "close");
                h.now && (h.now.icon = "loop2");
                h.toggle && (h.toggle.icon = "play3");
                h.start && (h.start.icon = "play3");
                h.stop && (h.stop.icon = "pause2");
                h.reset && (h.reset.icon =
                    "stop2");
                h.lap && (h.lap.icon = "loop2");
                h.hide && (h.hide.icon = "close")
            }
        };
        s.themes.listview["wp-light"] = {
            baseTheme: "wp"
        };
        s.themes.menustrip["wp-light"] = {
            baseTheme: "wp"
        };
        s.themes.form["wp-light"] = {
            baseTheme: "wp"
        };
        s.themes.progress["wp-light"] = {
            baseTheme: "wp"
        }
    })();
    s.themes.frame["mobiscroll-dark"] = {
        baseTheme: "mobiscroll",
        rows: 5,
        showLabel: !1,
        headerText: !1,
        btnWidth: !1,
        selectedLineHeight: !0,
        selectedLineBorder: 1,
        dateOrder: "MMddyy",
        weekDays: "min",
        checkIcon: "ion-ios7-checkmark-empty",
        btnPlusClass: "mbsc-ic mbsc-ic-arrow-down5",
        btnMinusClass: "mbsc-ic mbsc-ic-arrow-up5",
        btnCalPrevClass: "mbsc-ic mbsc-ic-arrow-left5",
        btnCalNextClass: "mbsc-ic mbsc-ic-arrow-right5"
    };
    s.themes.listview["mobiscroll-dark"] = {
        baseTheme: "mobiscroll"
    };
    s.themes.menustrip["mobiscroll-dark"] = {
        baseTheme: "mobiscroll"
    };
    s.themes.form["mobiscroll-dark"] = {
        baseTheme: "mobiscroll"
    };
    s.themes.progress["mobiscroll-dark"] = {
        baseTheme: "mobiscroll"
    };
    s.themes.frame["android-holo-light"] = {
        baseTheme: "android-holo",
        dateOrder: "Mddyy",
        rows: 5,
        minWidth: 76,
        height: 36,
        showLabel: !1,
        selectedLineHeight: !0,
        selectedLineBorder: 2,
        useShortLabels: !0,
        icon: {
            filled: "star3",
            empty: "star"
        },
        btnPlusClass: "mbsc-ic mbsc-ic-arrow-down6",
        btnMinusClass: "mbsc-ic mbsc-ic-arrow-up6"
    };
    s.themes.listview["android-holo-light"] = {
        baseTheme: "android-holo"
    };
    s.themes.menustrip["android-holo-light"] = {
        baseTheme: "android-holo"
    };
    s.themes.form["android-holo-light"] = {
        baseTheme: "android-holo"
    };
    s.themes.progress["android-holo-light"] = {
        baseTheme: "android-holo"
    };
    (function() {
        var h, e, b, k = s,
            a = k.themes,
            g = k.$;
        e = navigator.userAgent.match(/Android|iPhone|iPad|iPod|Windows|Windows Phone|MSIE/i);
        if (/Android/i.test(e)) {
            if (h = "android-holo", e = navigator.userAgent.match(/Android\s+([\d\.]+)/i)) e = e[0].replace("Android ", ""), h = 5 <= e.split(".")[0] ? "material" : 4 <= e.split(".")[0] ? "android-holo" : "android"
        } else if (/iPhone/i.test(e) || /iPad/i.test(e) || /iPod/i.test(e)) {
            if (h = "ios", e = navigator.userAgent.match(/OS\s+([\d\_]+)/i)) e = e[0].replace(/_/g, ".").replace("OS ", ""), h = "7" <= e ? "ios" : "ios-classic"
        } else if (/Windows/i.test(e) || /MSIE/i.test(e) || /Windows Phone/i.test(e)) h = "wp";
        g.each(a, function(a, e) {
            g.each(e,
                function(a, d) {
                    if (d.baseTheme == h) return k.autoTheme = a, b = !0, !1;
                    a == h && (k.autoTheme = a)
                });
            if (b) return !1
        })
    })();
    return s
});