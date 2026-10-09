define(function(require) {
    function t(t, e, i, l, o) {
        function r() {
            clearInterval(h),
            clearTimeout(h),
            h = null
        }
        function d(t) {
            return f || (f = 1, h && r()),
            i(t)
        }
        function c(t) {
            g.off("mousemove", d),
            g.off("mouseup", c),
            document.documentElement.classList.remove(a),
            document.documentElement.classList.remove(n),
            document.documentElement.classList.remove(s),
            h && r(),
            f || l(t),
            f = 0,
            o(t)
        }
        function u(t) {
            2 != t.button && e(t) && (m.trigger(t), t.stopPropagation(), t.preventDefault(), g.on("mousemove", d), g.on("mouseup", c), h = setTimeout(function() {
                h = setInterval(function() {
                    l(t)
                },
                100)
            },
            200), m.find("body").addClass("diy-dragging"), document.documentElement.classList.add(a))
        }
        var h, f = 0,
        m = $(document),
        g = $(window);
        t.on("mousedown", u)
    }
    require("./offset.css");
    var e = require("class"),
    $ = require("jquery"),
    i = require("./control"),
    a = "diy-dragging-mode",
    n = "diy-cursor-col-resize",
    s = "diy-cursor-row-resize",
    l = {
        value: null,
        disable: null
    },
    o = /((?:(?:\d+)?\.\d+|\d+))(em|ex|px|in|cm|mm|pt|pc|%)?/,
    r = /(-?(?:(?:\d+)?\.\d+|\d+))(em|ex|px|in|cm|mm|pt|pc|%)?/,
    d = "margin",
    c = "padding",
    u = ["top", "right", "bottom", "left"],
    h = [d, c],
    f = "margin-disabled",
    m = "padding-disabled",
    g = e({
        setup: function() {
            var t = this;
            g.superclass.setup.call(this),
            this.options = $.extend({},
            l, this.options),
            this.element.addClass("offset"),
            this.box = $('<div class="box"><span class="handle top" data-direct="top"><i></i></span><span class="handle right" data-direct="right"><i></i></span><span class="handle bottom" data-direct="bottom"><b>外边距</b><i></i></span><span class="handle left" data-direct="left"><i></i></span><span class="label top disable-select" data-direct="top">空</span><span class="label right disable-select" data-direct="right">空</span><span class="label bottom disable-select" data-direct="bottom">空</span><span class="label left disable-select" data-direct="left">空</span><div class="padding"><span class="handle top" data-direct="top"><i></i></span><span class="handle right" data-direct="right"><i></i></span><span class="handle bottom" data-direct="bottom"><b>内边距</b><i></i></span><span class="handle left" data-direct="left"><i></i></span><span class="label top disable-select" data-direct="top">空</span><span class="label right disable-select" data-direct="right">空</span><span class="label bottom disable-select" data-direct="bottom">空</span><span class="label left disable-select" data-direct="left">空</span></div></div>').appendTo(this.element),
            this._marginLabels = {},
            this._paddingLabels = {},
            this.box.find(".label").each(function(e) {
                var i = $(this),
                a = u[e % 4];
                e > 3 ? t._paddingLabels[a] = i: t._marginLabels[a] = i
            }),
            this.control = $('<div class="control"><a class="action center"><i data-hint="居中"></i></a><a class="action reset"><i data-hint="清除"></i></a></div>').appendTo(this.element),
            this.actionCenter = this.control.find("> .center"),
            this.actionReset = this.control.find("> .reset"),
            this._margin = g.getDirectDefaults(),
            this._padding = g.getDirectDefaults(),
            this.options.value ? this.value(this.options.value) : this.value({
                margin: this.options.margin,
                padding: this.options.padding
            }),
            this._defaultValue = this.value(),
            this.options.disable && (this.options.disable == d ? this.disableMargin() : this.options.disable == c && this.disablePadding()),
            this._initOffsetEvent()
        },
        _initOffsetEvent: function() {
            function e(t, e) {
                b == d ? x._setMargin(t, e) : b == c && x._setPadding(t, e)
            }
            function i(t) {
                _ = t.shiftKey ? u: t.ctrlKey || t.altKey ? "top" == v || "bottom" == v ? ["top", "bottom"] : ["right", "left"] : [v],
                u.forEach(function(t) {
                    _.indexOf(t) < 0 && e(t, p[t])
                });
                var i = p[v];
                _.forEach(function(t) {
                    e(t, i)
                })
            }
            function a(t, e, i) {
                var a;
                t.jquery || (t = $(t)),
                t.find("input").length || (a = $('<input type="text" />').appendTo(t.empty()), a.val(x.isValue(e) ? e: ""), a.keypress(function(t) {
                    13 == t.keyCode && a.blur()
                }), $.isFunction(i) && a.change(function() {
                    i(this.value)
                }), a.focus(function() {
                    a.select()
                }), a.blur(function() {
                    a.remove(),
                    t.html(this.value || "空")
                }), a.focus())
            }
            var l, o, r, h, p, b, v, _, x = this,
            y = $(document),
            z = 0;
            t(this.box,
            function(t) {
                var e = t.target;
                if (1 == e.nodeType && e.classList.contains("handle")) {
                    if (e.parentNode.classList.contains("padding")) {
                        if (x.isPaddingDisabled()) return ! 1;
                        p = x._padding,
                        b = "padding"
                    } else {
                        if (x.isMarginDisabled()) return ! 1;
                        p = x._margin,
                        b = "margin"
                    }
                    h = t,
                    z = 0,
                    v = e.dataset.direct,
                    "top" == v || "bottom" == v ? (l = "clientY", document.documentElement.classList.add(s)) : (l = "clientX", document.documentElement.classList.add(n)),
                    o = p[v];
                    var a;
                    return null != o && "" !== o && "auto" != o && "inherit" != o && (a = /(\-?(?:\d*\.)?\d+)(.*)$/.exec(o)) ? (o = parseFloat(a[1]), r = a[2]) : (o = 0, r = "px"),
                    i(t),
                    y.on("keydown keyup", i),
                    x.emit("changestart"),
                    !0
                }
                return ! 1
            },
            function(t) {
                var i = Math.round(t[l] - h[l]) * ("padding" == b ? -1 : 1) * ("right" == v || "bottom" == v ? 1 : -1) + z,
                a = o + i + r;
                _.forEach(function(t) {
                    e(t, a)
                })
            },
            function() {
                var t = o + ++z + r;
                _.forEach(function(i) {
                    e(i, t)
                })
            },
            function() {
                y.off("keydown", i),
                y.off("keyup", i),
                x.emit("changestop")
            }),
            this.element.hasClass(f) || this.box.on("click", "> .label",
            function() {
                var t = this.dataset.direct;
                a(this, x._margin[t],
                function(e) {
                    x._setMargin(t, e)
                })
            }),
            this.element.hasClass(m) || this.box.on("click", "> .padding > .label",
            function() {
                var t = this.dataset.direct;
                a(this, x._padding[t],
                function(e) {
                    x._setPadding(t, e)
                })
            }),
            this.actionCenter.click(function() {
                if (!x.actionCenter.hasClass("active")) {
                    var t = x.value();
                    t.margin.left = "auto",
                    t.margin.right = "auto",
                    x._setValue(t)
                }
            }),
            this.actionReset.click(function() {
                x._setValue(g.getDefaults())
            })
        },
        _setMargin: function(t, e, i) {
            e = g.normalizeValue(e, !1, !0),
            this._marginLabels[t].html(e.text),
            this._margin[t] !== e.value && (this._margin[t] = e.value, "auto" == this._margin.left && "auto" == this._margin.right ? this.actionCenter.addClass("active") : this.actionCenter.removeClass("active"), i || this.emit("change", this.value()))
        },
        _setPadding: function(t, e, i) {
            e = g.normalizeValue(e, !1, !0),
            !isNaN(parseFloat(e.value)) && e.value < 0 && (e.text = e.value = 0),
            this._paddingLabels[t].html(e.text),
            this._padding[t] !== e.value && (this._padding[t] = e.value, i || this.emit("change", this.value()))
        },
        _setValue: function(t, e) {
            var i = this;
            t = g.normalizeOffset(t),
            g.isSame(t, this.value()) || (u.forEach(function(e) {
                i.options.disable == d || i._setMargin(e, t.margin[e], !0),
                i.options.disable == c || i._setPadding(e, t.padding[e], !0)
            }), e || this.emit("change", this.value()))
        },
        margin: function() {
            return arguments.length ? (this._setMargin(arguments[0], !0), this) : $.extend(!0, {},
            this._margin)
        },
        isMarginDisabled: function() {
            return this.element.hasClass(f)
        },
        enableMargin: function() {
            this.element.removeClass(f),
            this.actionCenter.show()
        },
        disableMargin: function() {
            this.element.addClass(f),
            this.actionCenter.hide()
        },
        padding: function() {
            return arguments.length ? (this._setPadding(arguments[0], !0), this) : $.extend(!0, {},
            this._padding)
        },
        isPaddingDisabled: function() {
            return this.element.hasClass(m)
        },
        enablePadding: function() {
            this.element.removeClass(m)
        },
        disablePadding: function() {
            this.element.addClass(m)
        },
        value: function() {
            return arguments.length ? (this._setValue(arguments[0], !0), this) : {
                margin: $.extend(!0, {},
                this._margin),
                padding: $.extend(!0, {},
                this._padding)
            }
        },
        clear: function() {
            return this._setValue({},
            !0),
            this
        },
        reset: function() {
            g.isSame(this._defaultValue, this.value()) || (this.value(this._defaultValue), this.emit("change", this.value()))
        }
    },
    i);
    return g.getDefaults = function() {
        return {
            margin: g.getDirectDefaults(),
            padding: g.getDirectDefaults()
        }
    },
    g.getDirectDefaults = function() {
        return {
            top: "",
            right: "",
            bottom: "",
            left: ""
        }
    },
    g.normalizeOffset = function(t) {
        var e = $.extend(!0, {},
        t);
        return $.isPlainObject(e.margin) || (e.margin = g.normalizeSingleOffset(e.margin, !0)),
        $.isPlainObject(e.padding) || (e.padding = g.normalizeSingleOffset(e.padding)),
        e
    },
    g.normalizeSingleOffset = function(t, e) {
        var i = g.getDirectDefaults(),
        a = (t + "").trim().split(/\s+/);
        switch (a.length) {
        case 4:
            u.forEach(function(t, n) {
                i[t] = g.normalizeValue(a[n], !0, e).value
            });
            break;
        case 3:
            i.top = g.normalizeValue(a[0], !0, e).value,
            i.left = i.right = g.normalizeValue(a[1], !0, e).value,
            i.bottom = g.normalizeValue(a[2], !0, e).value;
            break;
        case 2:
            i.top = i.bottom = g.normalizeValue(a[0], !0, e).value,
            i.left = i.right = g.normalizeValue(a[1], !0, e).value;
            break;
        case 1:
            i.top = i.right = i.bottom = i.left = g.normalizeValue(a[0], !0, e).value
        }
        return i
    },
    g.isSame = function(t, e) {
        t = g.normalizeOffset(t),
        e = g.normalizeOffset(e);
        try {
            u.forEach(function(i) {
                h.forEach(function(a) {
                    if (t[a][i] !== e[a][i] && (g.isset(t[a][i]) || g.isset(e[a][i]))) throw new Error("")
                })
            })
        } catch(i) {
            return ! 1
        }
        return ! 0
    },
    g.isSingleOffsetSame = function(t, e, i) {
        e = g.normalizeSingleOffset(e, t == d),
        i = g.normalizeSingleOffset(i, t == d);
        try {
            u.forEach(function(a) {
                if (e[t][a] !== i[t][a] && (g.isset(e[t][a]) || g.isset(i[t][a]))) throw new Error("")
            })
        } catch(a) {
            return ! 1
        }
        return ! 0
    },
    g.isset = function(t) {
        return void 0 !== t && null !== t && "" !== t
    },
    g.normalizeValue = function(t, e, i) {
        var a, n = {
            value: "",
            text: "空"
        };
        return t = String(t).trim(),
        "auto" == t ? n.text = n.value = t: (a = (i ? r: o).exec(t)) && (n.text = n.value = a[1] + (a[2] && e ? a[2] : "")),
        n
    },
    g
});