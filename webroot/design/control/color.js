define(function(require) {
    function t(t, i, e) {
        return Math.min(e, Math.max(i, t))
    }
    function i(t, i, e, s) {
        if (t.length >= i) return t;
        for (; t.length < i;) t = s ? t + e: e + t;
        return t
    }
    function e(t) {
        return (t + "").trim()
    }
    require("./color.css");
    var s, a, r, o = require("class"),
    $ = require("jquery"),
    n = require("../diy/emitter"),
    h = require("../lib/svgcolor"),
    l = require("./control"),
    C = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i,
    d = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,
    c = /^rgb *\( *(\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *\)$/i,
    u = /^rgba *\( *(\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *, *(1|0|0?\.\d+) *\)$/i,
    F = "named",
    _ = "rgb/rgba",
    v = ["#000", "#333", "#666", "#999", "#ccc", "#fff", "#f00", "#0f0", "#00f", "#ff0", "#0ff", "#f0f"],
    p = ["#000000", "#003300", "#006600", "#009900", "#00CC00", "#00FF00", "#330000", "#333300", "#336600", "#339900", "#33CC00", "#33FF00", "#660000", "#663300", "#666600", "#669900", "#66CC00", "#66FF00", "#000033", "#003333", "#006633", "#009933", "#00CC33", "#00FF33", "#330033", "#333333", "#336633", "#339933", "#33CC33", "#33FF33", "#660033", "#663333", "#666633", "#669933", "#66CC33", "#66FF33", "#000066", "#003366", "#006666", "#009966", "#00CC66", "#00FF66", "#330066", "#333366", "#336666", "#339966", "#33CC66", "#33FF66", "#660066", "#663366", "#666666", "#669966", "#66CC66", "#66FF66", "#000099", "#003399", "#006699", "#009999", "#00CC99", "#00FF99", "#330099", "#333399", "#336699", "#339999", "#33CC99", "#33FF99", "#660099", "#663399", "#666699", "#669999", "#66CC99", "#66FF99", "#0000CC", "#0033CC", "#0066CC", "#0099CC", "#00CCCC", "#00FFCC", "#3300CC", "#3333CC", "#3366CC", "#3399CC", "#33CCCC", "#33FFCC", "#6600CC", "#6633CC", "#6666CC", "#6699CC", "#66CCCC", "#66FFCC", "#0000FF", "#0033FF", "#0066FF", "#0099FF", "#00CCFF", "#00FFFF", "#3300FF", "#3333FF", "#3366FF", "#3399FF", "#33CCFF", "#33FFFF", "#6600FF", "#6633FF", "#6666FF", "#6699FF", "#66CCFF", "#66FFFF", "#990000", "#993300", "#996600", "#999900", "#99CC00", "#99FF00", "#CC0000", "#CC3300", "#CC6600", "#CC9900", "#CCCC00", "#CCFF00", "#FF0000", "#FF3300", "#FF6600", "#FF9900", "#FFCC00", "#FFFF00", "#990033", "#993333", "#996633", "#999933", "#99CC33", "#99FF33", "#CC0033", "#CC3333", "#CC6633", "#CC9933", "#CCCC33", "#CCFF33", "#FF0033", "#FF3333", "#FF6633", "#FF9933", "#FFCC33", "#FFFF33", "#990066", "#993366", "#996666", "#999966", "#99CC66", "#99FF66", "#CC0066", "#CC3366", "#CC6666", "#CC9966", "#CCCC66", "#CCFF66", "#FF0066", "#FF3366", "#FF6666", "#FF9966", "#FFCC66", "#FFFF66", "#990099", "#993399", "#996699", "#999999", "#99CC99", "#99FF99", "#CC0099", "#CC3399", "#CC6699", "#CC9999", "#CCCC99", "#CCFF99", "#FF0099", "#FF3399", "#FF6699", "#FF9999", "#FFCC99", "#FFFF99", "#9900CC", "#9933CC", "#9966CC", "#9999CC", "#99CCCC", "#99FFCC", "#CC00CC", "#CC33CC", "#CC66CC", "#CC99CC", "#CCCCCC", "#CCFFCC", "#FF00CC", "#FF33CC", "#FF66CC", "#FF99CC", "#FFCCCC", "#FFFFCC", "#9900FF", "#9933FF", "#9966FF", "#9999FF", "#99CCFF", "#99FFFF", "#CC00FF", "#CC33FF", "#CC66FF", "#CC99FF", "#CCCCFF", "#CCFFFF", "#FF00FF", "#FF33FF", "#FF66FF", "#FF99FF", "#FFCCFF", "#FFFFFF"],
    g = "transparent",
    f = 20,
    m = o({
        initialize: function() {
            var t, i, e = this;
            for (this.element = $('<div class="diy-control color-picker"><div class="panel"><i class="arrow"></i><div class="header"><div class="colors"><span class="picked blank"><i></i></span><span class="current blank"><i></i></span><span class="split transparent" data-color="transparent" title="透明"><i></i></span></div><div class="input"><input type="text" /></div><div class="more"><span class="expand"><i></i></span><span class="collapse"><i></i></span></div></div><div class="history" title="使用过的颜色"></div><div class="colors"><div class="common"></div><div class="standard"></div></div><div class="advanced"><div class="color"><i></i></div><div class="hue"><i></i><span></span></div></div></div></div>'), this.panel = this.element.find("> .panel"), this.arrow = this.panel.find("> .arrow"), this.picked = this.panel.find(".picked"), this.current = this.panel.find(".current"), this.input = this.panel.find("input"), this.history = this.panel.find("> .history"), t = 0, i = ""; t++<f;) i += "<i></i>";
            this.history.append(i),
            this.colors = this.panel.find("> .colors"),
            this.colorsCommon = this.colors.find("> .common"),
            i = "",
            v.forEach(function(t) {
                i += '<i data-color="' + t + '" style="background-color:' + t + ';"></i>'
            }),
            e.colorsCommon.append(i),
            this.colorsStandard = this.colors.find("> .standard"),
            i = "",
            p.forEach(function(t) {
                i += '<i data-color="' + t + '" style="background-color:' + t + ';"></i>'
            }),
            e.colorsStandard.append(i),
            this.advanced = this.panel.find("> .advanced"),
            this.advancedExpand = this.panel.find(".expand"),
            this.advancedCollapse = this.panel.find(".collapse"),
            this.advancedColor = this.advanced.find("> .color"),
            this.advancedColorCursor = this.advancedColor.find("> i"),
            this.advancedHue = this.advanced.find("> .hue"),
            this.advancedHueBar = this.advancedHue.find("> span"),
            this.advancedHueCursor = this.advancedHue.find("> i"),
            this._inited = !1,
            this._alpha = 1,
            this._histories = [],
            s = document,
            a = $(s),
            this._readColorHistories(),
            this._initPickerEvent()
        },
        _initPickerEvent: function() {
            var i = this;
            this.panel.on("click", "[data-color]",
            function() {
                i._rgbShim = !1,
                i._parseColor(this.dataset.color),
                i._callbackPicked(i._updateColor()),
                i.hide()
            }),
            this.input.change(function() {
                i._valueType = k.getColorType(this.value),
                i._rgbShim = !1,
                i._parseColor(this.value),
                i._callbackPicked(i._updateColor()),
                i.hide()
            }),
            this.input.keypress(function(t) {
                13 == t.keyCode && (i.input.trigger("change"), i.hide())
            }),
            this.advancedExpand.click(function() {
                i._showAdvanced()
            }),
            this.advancedCollapse.click(function() {
                i._hideAdvanced()
            }),
            this.advancedColor.click(function(e) {
                var s = i.advancedColor.offset(),
                a = i._advancedColorWidth,
                r = i._advancedColorHeight,
                o = s.left + 1,
                n = s.top + 1,
                h = e.pageX - o,
                l = e.pageY - n;
                h = t(h, 0, a),
                l = t(l, 0, r),
                i._rgbShim = !0,
                i._setXY(h / a, l / r),
                i._callbackPicked(i._updateColor())
            }),
            this.advancedHue.click(function(e) {
                var s = i.advancedHue.offset(),
                a = i.advancedHueBar.height(),
                r = s.top + 1,
                o = e.pageY - r;
                o = t(o, 0, a),
                i._rgbShim = !0,
                i._setHue(o / a),
                i._callbackPicked(i._updateColor())
            })
        },
        _setXY: function(i, e) {
            if (null !== i && null !== e) {
                var s, a = t(i, 0, 1),
                r = t(e, 0, 1);
                this._saturation = i,
                this._value = 1 - e,
                s = k.getRGBFromHSV(this._hue, this._saturation, this._value),
                this._red = s.red,
                this._green = s.green,
                this._blue = s.blue,
                a -= this._advancedColorCursorWidth / 2 / this._advancedColorWidth,
                r -= this._advancedColorCursorHeight / 2 / this._advancedColorHeight,
                this.advancedColorCursor.css({
                    left: 100 * a + "%",
                    top: 100 * r + "%"
                })
            }
        },
        _setHue: function(i) {
            var e, s;
            this._hue = i,
            null !== i && (e = k.getRGBFromHSV(this._hue, this._saturation, this._value), this._red = e.red, this._green = e.green, this._blue = e.blue);
            var a = t(i, 0, 1);
            a -= this.advancedHueCursor.height() / 2 / this.advancedHueBar.height(),
            this.advancedHueCursor.css("top", 100 * a + "%"),
            e = k.getRGBFromHSV(this._hue, 1, 1),
            s = k.rgbToCSSAValue(e.red, e.green, e.blue, 1),
            this.advancedColor.css("background-color", s)
        },
        _parseColor: function(t) {
            var i;
            t = k.rgbaTextToArray(k.normalizeColor(t)),
            t ? (this._red = t[0], this._green = t[1], this._blue = t[2], this._alpha = t[3], i = k.getHSVFromRGB(t[0], t[1], t[2]), this._hue = i.hue, this._saturation = i.saturation, this._value = 1 - i.value, this._setHue(this._hue), this._setXY(this._saturation, this._value)) : (this._hue = null, this._saturation = this._value = 1, this._red = this._green = this._blue = null, this._alpha = 1, this._setHue(this._hue))
        },
        _updateColor: function() {
            var t = this.value();
            return this.input.val(t),
            this._setColorToPreview(t, this.picked),
            t
        },
        _setColorToPreview: function(t, i) {
            k.isColor(t) ? (i.css("background-color", t), i.attr("data-color", t), i.removeClass("blank"), t == g ? i.addClass(g) : i.removeClass(g)) : (i.css("background-color", ""), i.removeAttr("data-color"), i.removeClass("transparent blank"), i.addClass("blank"))
        },
        _showAdvanced: function() {
            this.advancedExpand.hide(),
            this.advancedCollapse.show(),
            this.advanced.css("visibility", "visible")
        },
        _hideAdvanced: function() {
            this.advancedExpand.show(),
            this.advancedCollapse.hide(),
            this.advanced.css("visibility", "hidden")
        },
        _renderHistories: function() {
            for (var t, i, e = 0,
            s = this.history.children(); f > e;) t = this._histories[e] || "",
            i = s.eq(e),
            i.css("background-color", t || "white"),
            t ? i.attr("data-color", t) : i.removeAttr("data-color"),
            e += 1
        },
        _readColorHistories: function() {
            try {
                var t = JSON.parse(window.localStorage.getItem("color:picker:histories"));
                Array.isArray(t) && (this._histories = t)
            } catch(i) {}
        },
        _saveColorToHistories: function() {
            var t, i = this.value();
            k.isColor(i) && (i = k.normalizeColor(i), t = $.inArray(i, this._histories), -1 != t && this._histories.splice(t, 1), this._histories.unshift(i), this._histories.splice(f), window.localStorage.setItem("color:picker:histories", JSON.stringify(this._histories)))
        },
        _rgbToHex: function(t, i, e) {
            var s = (65536 * Math.round(255 * t) + 256 * Math.round(255 * i) + Math.round(255 * e)).toString(16);
            return "#" + "00000".substr(0, 6 - s.length) + s
        },
        _callbackNone: function() {},
        edit: function(t, i, e, a, r) {
            var o = this._trigger;
            return $.isPlainObject(t) ? (this._trigger = t.trigger, this._align = t.align) : (this._trigger = t, this._align = null),
            o && o == this._trigger ? (this.hide(), void 0) : (this._rgbShim = !1, this._valueType = k.getColorType(i), this._parseColor(i), this._updateColor(), this._setColorToPreview(i, this.current), this._renderHistories(), this._callbackPicked = $.isFunction(e) ? e: this._callbackNone, this._callbackShow = $.isFunction(a) ? a: this._callbackNone, this._callbackHide = $.isFunction(r) ? r: this._callbackNone, this.element.appendTo(s.body), this.show(), void 0)
        },
        show: function() {
            var t = this;
            this._inited || (this._inited = !0, this._elementWidth = this.element.width(), this._elementHeight = this.element.height(), this._arrowWidth = this.arrow.width(), this._advancedColorWidth = this.advancedColor.width(), this._advancedColorHeight = this.advancedColor.height(), this._advancedColorCursorWidth = this.advancedColorCursor.width(), this._advancedColorCursorHeight = this.advancedColorCursor.height());
            var i = a.width(),
            e = a.height(),
            s = this._trigger.offset(),
            r = this._trigger.width(),
            o = this._trigger.height(),
            n = s,
            h = o;
            this._align && (n = this._align.offset(), h = this._align.height());
            var l, C, d, c = 3;
            this.element.removeClass("top bottom"),
            n.top + h + this._elementHeight + c > e && n.top - this._elementHeight - c > 0 ? (this.element.addClass("top"), l = n.top - this._elementHeight - c) : (this.element.addClass("bottom"), l = n.top + h + c),
            C = Math.max(0, this._align ? n.left: s.left + r / 2 - this._elementWidth / 2),
            C = Math.min(i - this._elementWidth - c, C),
            d = Math.max(0, s.left + r / 2 - this._arrowWidth / 2 - C),
            d = Math.min(this._elementWidth - this._arrowWidth, d),
            this.element.css({
                left: C,
                top: l
            }),
            this.arrow.css({
                left: d
            }),
            this._callbackShow && this._callbackShow(),
            a.on("mousedown.picker",
            function(i) {
                var e; (!t._trigger || i.target != t.element[0] && i.target != t._trigger[0] && (e = $(i.target).parents()) && -1 == e.index(t.element) && -1 == e.index(t._trigger)) && t.hide()
            })
        },
        hide: function() {
            this.element.removeClass("top bottom"),
            this.element.detach(),
            this._callbackHide && this._callbackHide(),
            this._trigger = null,
            this._align = null,
            a.off("mousedown.picker"),
            this._saveColorToHistories()
        },
        value: function() {
            var t, i, e;
            return null === this._red && null === this._green && null === this._blue ? "": 0 == this._alpha && 0 == this._red && 0 == this._green && 0 == this._blue ? this._valueType == _ ? "rgb(0, 0, 0)": g: this._valueType == _ || this._alpha && 1 != this._alpha ? 1 == this._alpha ? "rgb(" + this._red + ", " + this._green + ", " + this._blue + ")": "rgba(" + this._red + ", " + this._green + ", " + this._blue + ", " + this._alpha + ")": (t = this._rgbShim ? this._rgbToHex(this._red, this._green, this._blue) : k.rgbToHex(this._red, this._green, this._blue), e = t.toUpperCase(), this._valueType == F && (i = h.HexValues.indexOf(e)) > -1 ? h.Names[i] : t)
        }
    });
    m.getInstance = function() {
        return r || (r = new m)
    },
    m.implement(n);
    var b = {},
    k = o({
        setup: function() {
            k.superclass.setup.call(this),
            this.element.addClass("color"),
            this.input = $('<input type="text" />').appendTo(this.element),
            this.preview = $('<span class="preview blank"><i></i></span>').appendTo(this.element),
            this.previewColor = this.preview.find("> i"),
            this.value(this.options.value),
            this._defaultValue = this._value,
            this._initColorEvent()
        },
        _initColorEvent: function() {
            var t = this;
            this.preview.click(function() {
                m.getInstance().edit({
                    trigger: t.preview,
                    align: t.element
                },
                t.value(),
                function(i) {
                    t._setColor(i)
                },
                function() {
                    t.element.addClass("active")
                },
                function() {
                    t.element.removeClass("active")
                })
            }),
            this.input.on("change",
            function() {
                t._setColor(this.value)
            })
        },
        _setColor: function(t, i) {
            if (k.isColor(t)) {
                if (k.isSame(t, this._value)) return;
                this.input.val(t),
                this.previewColor.css("background-color", t),
                this.preview.removeClass("blank"),
                t == g ? this.preview.addClass(g) : this.preview.removeClass(g),
                this._value = t
            } else {
                if (this.input.val(""), this.previewColor.css("background-color", ""), this.preview.removeClass(g), this.preview.addClass("blank"), k.isSame(t, this._value)) return;
                this._value = ""
            }
            i || this.emit("change", this.value())
        },
        value: function() {
            return arguments.length ? (this._setColor(arguments[0], !0), this) : this._value
        },
        clear: function() {
            return this._setColor("", !0),
            this
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this._value)
        }
    },
    l);
    return k.getColorType = function(t) {
        if (k.isColor(t)) {
            if (k.isNamedColor(t)) return "named";
            if (k.isHEXColor(t)) return "hex";
            if (k.isRGBColor(t) || k.isRGBAColor(t)) return "rgb"
        }
        return "hex"
    },
    k.isColor = function(t) {
        return t = e(t),
        t ? k.isNamedColor(t, !0) || k.isHEXColor(t, !0) || k.isRGBColor(t, !0) || k.isRGBAColor(t, !0) : !1
    },
    k.isNamedColor = function(t, i) {
        return i || (t = e(t)),
        t = t.toLowerCase(),
        t == g || h.Names.indexOf(t) > -1
    },
    k.isHEXColor = function(t, i) {
        return i || (t = e(t)),
        d.test(t) || C.test(t)
    },
    k.isRGBColor = function(t, i) {
        return i || (t = e(t)),
        c.test(t)
    },
    k.isRGBAColor = function(t, i) {
        return i || (t = e(t)),
        u.test(t)
    },
    k.normalizeColor = function(t) {
        var i, s, a, r = t = e(t).toLowerCase();
        return t ? t in b ? b[t] : t == g ? b[r] = "rgba(0, 0, 0, 0)": (i = h.Names.indexOf(t), i > -1 && (t = h.HexValues[i]), s = d.exec(t), s && (t = "#" + s.slice(1).map(function(t) {
            return t + t
        }).join("")), (s = C.exec(t)) ? b[r] = "rgba(" + s.slice(1).map(function(t) {
            return parseInt(t, 16)
        }).join(", ") + ", 1)": (s = c.exec(t)) ? b[r] = "rgba(" + s.slice(1).map(function(t) {
            return parseInt(t, 10)
        }).join(", ") + ", 1)": (a = k.rgbaTextToArray(t), b[r] = a ? "rgba(" + a.join(", ") + ")": "")) : ""
    },
    k.rgbaTextToArray = function(t) {
        var i = u.exec(t);
        return i ? i.slice(1).map(function(t, i) {
            return 3 == i ? (t = parseFloat(t), t >= 0 && 1 > t ? t: 1) : parseInt(t, 10)
        }) : ""
    },
    k.isSame = function(t, i) {
        return k.normalizeColor(t) === k.normalizeColor(i)
    },
    k.rgbToHex = function(t, e, s) {
        return t = Math.round(parseFloat(t)).toString(16),
        e = Math.round(parseFloat(e)).toString(16),
        s = Math.round(parseFloat(s)).toString(16),
        "#" + i(t, 2, "0", !1) + i(e, 2, "0", !1) + i(s, 2, "0", !1)
    },
    k.rgbToCSSValue = function(t, i, e) {
        return "rgb(" + Math.round(255 * t) + ", " + Math.round(255 * i) + ", " + Math.round(255 * e) + ")"
    },
    k.rgbToCSSAValue = function(t, i, e, s) {
        return "rgba(" + Math.round(255 * t) + ", " + Math.round(255 * i) + ", " + Math.round(255 * e) + ", " + parseFloat(s) + ")"
    },
    k.getRGBFromHSV = function(t, i, e) {
        var s, a, r, o = Math.min(5, Math.floor(6 * t)),
        n = 6 * t - o,
        h = e * (1 - i),
        l = e * (1 - n * i),
        C = e * (1 - (1 - n) * i);
        switch (o) {
        case 0:
            s = e,
            a = C,
            r = h;
            break;
        case 1:
            s = l,
            a = e,
            r = h;
            break;
        case 2:
            s = h,
            a = e,
            r = C;
            break;
        case 3:
            s = h,
            a = l,
            r = e;
            break;
        case 4:
            s = C,
            a = h,
            r = e;
            break;
        case 5:
            s = e,
            a = h,
            r = l
        }
        return {
            red: s,
            green: a,
            blue: r
        }
    },
    k.getHSVFromRGB = function(t, i, e) {
        var s, a = Math.max(t, i, e),
        r = Math.min(t, i, e),
        o = a - r,
        n = 0 === a ? 0 : o / a;
        if (0 === o) s = 0;
        else switch (a) {
        case t:
            s = (i - e) / o / 6 + (e > i ? 1 : 0);
            break;
        case i:
            s = (e - t) / o / 6 + 1 / 3;
            break;
        case e:
            s = (t - i) / o / 6 + 2 / 3
        }
        return {
            hue: s,
            saturation: n,
            value: a
        }
    },
    k.Picker = m,
    k
});