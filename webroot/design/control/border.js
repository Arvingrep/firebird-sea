define(function(require) {
    require("./border.css");
    var e = require("class"),
    $ = require("jquery"),
    t = require("./control"),
    i = require("./options"),
    s = require("./length"),
    l = require("./color"),
    a = {},
    n = "active",
    o = "all",
    d = "top",
    r = "style",
    h = "width",
    c = "color",
    u = [d, "right", "bottom", "left"],
    v = /(-?(?:(?:\d+)?\.\d+|\d+))(em|ex|px|in|cm|mm|pt|pc|%)?/,
    f = /(none|solid|dotted|dashed|double|hidden|groove|ridge|inset|outset)/,
    _ = e({
        setup: function() {
            _.superclass.setup.call(this),
            this.options = $.extend({},
            a, this.options),
            this.element.addClass("border"),
            this.element.append('<div class="sides"><span class="side top" data-side="top"><i></i></span><span class="side right" data-side="right"><i></i></span><span class="side bottom" data-side="bottom"><i></i></span><span class="side left" data-side="left"><i></i></span><span class="all active" data-side="all"><i></i></span></div><div class="control"><div class="row style"><span class="label">样式</span></div><div class="row width"><span class="label">线宽</span></div><div class="row color"><span class="label">颜色</span></div></div>'),
            this.sides = this.element.find("> .sides"),
            this.sideItems = this.sides.children("[data-side]"),
            this.control = this.element.find("> .control"),
            this.style = new i({
                options: [{
                    label: "实线",
                    classes: "border-style-solid",
                    value: "solid"
                },
                {
                    label: "虚线",
                    classes: "border-style-dashed",
                    value: "dashed"
                },
                {
                    label: "点线",
                    classes: "border-style-dotted",
                    value: "dotted"
                },
                {
                    label: "无",
                    classes: "border-style-none",
                    value: "none"
                }]
            }),
            this.style.appendTo(this.control.find(".style")),
            this.width = new s({
                defaultUnit: "px",
                units: ["px", "em"]
            }),
            this.width.appendTo(this.control.find(".width")),
            this.color = new l,
            this.color.appendTo(this.control.find(".color")),
            this.value(this.options.value),
            this._defaultValue = this.value(),
            this._initBorderEvent()
        },
        _resetSidesValues: function() {
            this._valueSides = _.getDefaults()
        },
        _resetAllValues: function() {
            this._valueAll = {
                style: "",
                width: "",
                color: ""
            }
        },
        _initBorderEvent: function() {
            function e(e, i) {
                t._active == o ? t._resetSidesValues() : t._resetAllValues(),
                t._setSideValue(t._active, e, i),
                t.emit("change", t.value())
            }
            var t = this;
            this.sides.on("click", "[data-side]",
            function() {
                t._active = this.dataset.side,
                t._activeSide(this.dataset.side),
                t._renderSideValues(this.dataset.side)
            }),
            this.style.on("change",
            function(t) {
                e(r, t)
            }),
            this.width.on("change",
            function(t) {
                e(h, t)
            }),
            this.color.on("change",
            function(t) {
                e(c, t)
            })
        },
        _activeSide: function(e) {
            var t = this.sideItems.filter("[data-side=" + e + "]");
            t.hasClass(n) || (this.sideItems.removeClass(n), t.addClass(n))
        },
        _renderSideValues: function(e) {
            e == o ? (this.style.value(this._valueAll.style), this.width.value(this._valueAll.width), this.color.value(this._valueAll.color)) : (this.style.value(this._valueSides.style[e]), this.width.value(this._valueSides.width[e]), this.color.value(this._valueSides.color[e]))
        },
        _setSideValue: function(e, t, i) {
            e == o ? this._valueAll[t] = i: this._valueSides[t][e] = i
        },
        _findActiveSide: function(e) {
            var t, i = this.sides.find("> .active").data("side"),
            s = [];
            return u.forEach(function(t) { (e.style[t] || e.width[t] || e.color[t]) && s.push(t)
            }),
            t = 4 == s.length && _.isSideSame(e) ? o: s.indexOf(i) > -1 ? i: d
        },
        _setValue: function(e, t) {
            e = _.normalizeBorder(e),
            this._resetAllValues(),
            this._resetSidesValues(),
            _.isSideSame(e) ? (this._active = o, this._setSideValue(o, "style", e.style[d]), this._setSideValue(o, "width", e.width[d]), this._setSideValue(o, "color", e.color[d])) : (this._active = this._findActiveSide(e), this._valueSides = e),
            this._activeSide(this._active),
            this._renderSideValues(this._active),
            _.isSame(e, this.value()) || t || this.emit("change", this.value())
        },
        value: function() {
            var e = this;
            if (arguments.length) return this._setValue(arguments[0], !0),
            this;
            var t;
            return this._active == o ? (t = _.getDefaults(), u.forEach(function(i) {
                t[r][i] = e._valueAll.style,
                t[h][i] = e._valueAll.width,
                t[c][i] = e._valueAll.color
            })) : t = $.extend(!0, {},
            this._valueSides),
            t
        },
        clear: function() {
            return this._setValue("", !0),
            this
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this.value())
        }
    },
    t);
    return _.getDefaults = function() {
        return {
            style: {
                top: "",
                right: "",
                bottom: "",
                left: ""
            },
            width: {
                top: "",
                right: "",
                bottom: "",
                left: ""
            },
            color: {
                top: "",
                right: "",
                bottom: "",
                left: ""
            }
        }
    },
    _.isSame = function(e, t) {
        return $.isPlainObject(e) || (e = _.normalizeBorder(e)),
        $.isPlainObject(t) || (t = _.normalizeBorder(t)),
        JSON.stringify(e) === JSON.stringify(t)
    },
    _.isSideSame = function(e) {
        try {
            return [r, h, c].forEach(function(t) {
                if ($.isPlainObject(e[t])) {
                    var i = e[t][d];
                    u.forEach(function(s) {
                        if (t == c && !l.isSame(e[t][s], i) || e[t][s] !== i) throw new Error("border side value not same")
                    })
                }
            }),
            !0
        } catch(t) {
            return ! 1
        }
    },
    _.normalizeBorder = function(e) {
        var t, i;
        if (!e) return _.getDefaults();
        if ($.isPlainObject(e)) return $.extend(!0, {},
        e);
        t = _.getDefaults(),
        e = e.toString().toLowerCase(),
        i = f.exec(e),
        i && u.forEach(function(e) {
            t.style[e] = i[1]
        }),
        i = v.exec(e),
        i && u.forEach(function(e) {
            t.width[e] = i[1] + (i[2] || "")
        }),
        e = e.split(/\s+/);
        var s = !1;
        return e.forEach(function(e) { ! s && l.isColor(e) && (u.forEach(function(i) {
                t.color[i] = e
            }), s = !0)
        }),
        t
    },
    _
});