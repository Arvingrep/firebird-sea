define(function(require) {
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    require("./background.css");
    var e = require("class"),
    $ = require("jquery"),
    a = require("./control"),
    i = require("./color"),
    s = require("./image"),
    n = require("./size"),
    o = require("./options"),
    l = /url\(['"]*([^'")]+)['"]*\)/i,
    r = /\b(top|center|bottom)(?: (left|center|right))?\b/i,
    c = /\b(left|center|right)(?: (top|center|bottom))?\b/i,
    h = /\b(-?(?:(?:\d+)?\.\d+|\d+)(?:em|ex|px|in|cm|mm|pt|pc|%)?)(?: (-?(?:(?:\d+)?\.\d+|\d+)(?:em|ex|px|in|cm|mm|pt|pc|%)?))?\b/i,
    p = /\b(repeat-x|repeat-y|no-repeat|repeat)\b/i,
    u = /\b(scroll|fixed)\b/i,
    m = {
        1 : [/^(top left|(left|0(px|em|%)?) (top|0(px|em|%)?))$/, "0", "0"],
        2 : [/^(top|top center|(50%|center) (top|0(px|em|%)?))$/, "50%", "0"],
        3 : [/^(top right|(100%|right) (top|0(px|em|%)?))$/, "100%", "0"],
        4 : [/^(left|center left|(left|0(px|em|%)?) (50%|center))$/, "0", "50%"],
        5 : [/^(center|(50%|center) (50%|center))$/, "50%", "50%"],
        6 : [/^(right|center right|(right|100%) (50%|center))$/, "100%", "50%"],
        7 : [/^(bottom left|(left|0(px|em|%)?) (bottom|100%))$/, "0", "100%"],
        8 : [/^(bottom|bottom center|(50%|center) (bottom|100%))$/, "50%", "100%"],
        9 : [/^(bottom right|(100%|right) (bottom|100%))$/, "100%", "100%"]
    },
    d = e({
        setup: function() {
            d.superclass.setup.call(this),
            this.element.addClass("background"),
            this.element.append('<div class="row color"><span class="label">颜色</span></div><div class="row image"></div><div class="row position"><span class="label block">定位</span><div class="preset"><a class="left-top" data-pos="left top"><i></i></a><a class="top" data-pos="top"><i></i></a><a class="right-top" data-pos="right top"><i></i></a><a class="left" data-pos="left"><i></i></a><a class="center" data-pos="center"><i></i></a><a class="right" data-pos="right"><i></i></a><a class="left-bottom" data-pos="left bottom"><i></i></a><a class="bottom" data-pos="bottom"><i></i></a><a class="right-bottom" data-pos="right bottom"><i></i></a></div><div class="offset"><div class="row position-x"><span class="label"><a></a>横向</span></div><div class="row position-y"><span class="label"><a></a>纵向</span></div></div></div><div class="row repeat-fixed"><span class="label">重复</span><span class="label">固定</span></div>'),
            this._color = (new i).appendTo(this.element.find("> .color")),
            this._image = (new s).appendTo(this.element.find("> .image")),
            this._positionPreset = this.element.find("> .position > .preset"),
            this._positionPresetItems = this._positionPreset.children(),
            this._positionX = (new n).appendTo(this.element.find(".position-x")),
            this._positionX.registerUnit("清除", ""),
            this._positionY = (new n).appendTo(this.element.find(".position-y")),
            this._positionY.registerUnit("清除", ""),
            this._repeat = new o({
                options: [{
                    label: "平铺",
                    classes: "background-repeat",
                    value: "repeat"
                },
                {
                    label: "横向平铺",
                    classes: "background-repeat-x",
                    value: "repeat-x"
                },
                {
                    label: "纵向平铺",
                    classes: "background-repeat-y",
                    value: "repeat-y"
                },
                {
                    label: "不平铺",
                    classes: "background-no-repeat",
                    value: "no-repeat"
                }]
            }),
            this._repeat.getElement().insertAfter(this.element.find(".repeat-fixed > .label:first")),
            this._attachment = new o({
                options: [{
                    label: "开启",
                    classes: "background-attachment-fixed",
                    value: "fixed"
                },
                {
                    label: "关闭",
                    classes: "background-attachment-scroll",
                    value: "scroll"
                }]
            }),
            this._attachment.getElement().insertAfter(this.element.find(".repeat-fixed > .label:last")),
            this.value(this.options.value),
            this._defaultValue = this.value(),
            this._initBackgroundEvent()
        },
        _initBackgroundEvent: function() {
            var t = this;
            this._color.on("change",
            function(e) {
                t._setParamBackgroundColor(e)
            }),
            this._image.on("change",
            function(e) {
                t._setParamBackgroundImage(e)
            }),
            this._positionPreset.on("click", "[data-pos]",
            function() {
                t._setParamBackgroundPosition(this.dataset.pos)
            }),
            this._positionX.on("change",
            function(e) {
                var a = t._positionY.value();
                t._setParamBackgroundPosition(("" === e && "" !== a ? 0 : e) + " " + a)
            }),
            this._positionY.on("change",
            function(e) {
                var a = t._positionX.value();
                t._setParamBackgroundPosition(("" === a && "" !== e ? 0 : a) + " " + e)
            }),
            this._repeat.on("change",
            function(e) {
                t._setParamBackgroundRepeat(e)
            }),
            this._attachment.on("change",
            function(e) {
                t._setParamBackgroundAttachment(e)
            })
        },
        _setParamBackgroundColor: function(t, e) {
            this._color.value(t),
            i.isSame(t, this._value.color) || (this._value.color = this._color.value(), e || this.emit("change", this.value()))
        },
        _setParamBackgroundImage: function(t, e) {
            var a, i = l.exec(t || "");
            i && (t = i[1]),
            this._image.value(t),
            a = t ? "url(" + t + ")": "",
            a != this._value.image && (this._value.image = a, e || this.emit("change", this.value()))
        },
        _setParamBackgroundPosition: function(t, e) {
            var a, i, s = 0,
            n = t || "";
            this._positionPresetItems.filter(".active").removeClass("active");
            for (var o in m) if (m[o][0].test(n)) {
                s = o;
                break
            }
            s ? (this._positionPresetItems.eq(s - 1).addClass("active"), a = m[o][1], i = m[o][2]) : (n = n.split(/ +/), a = n[0] || "", i = n[1] || ""),
            this._positionX.value(a),
            this._positionY.value(i),
            t != this._value.position && (this._value.position = t, e || this.emit("change", this.value()))
        },
        _setParamBackgroundRepeat: function(t, e) {
            this._repeat.value(t),
            t != this._value.repeat && (this._value.repeat = this._repeat.value(), e || this.emit("change", this.value()))
        },
        _setParamBackgroundAttachment: function(t, e) {
            this._attachment.value(t),
            t != this._value.attachment && (this._value.attachment = this._attachment.value(), e || this.emit("change", this.value()))
        },
        _setValue: function(e, a) {
            var i, s, n = d.normalizeBackground(e);
            this._value = d.getDefaults();
            for (i in this._value) s = "_setParamBackground" + t(i),
            s in this && this[s](n[i], a)
        },
        value: function() {
            return arguments.length ? (this._setValue(arguments[0], !0), this) : $.extend(!0, {},
            this._value)
        },
        clear: function() {
            return this._setValue("", !0),
            this
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this.value())
        },
        enable: function(t) {
            if (arguments.length) switch (t) {
            case "attachment":
                this._attachment.enable()
            } else d.superclass.enable.call(this)
        },
        disable: function(t) {
            if (arguments.length) switch (t) {
            case "attachment":
                this._attachment.disable()
            } else d.superclass.disable.call(this)
        }
    },
    a);
    return d.getDefaults = function() {
        return {
            attachment: "",
            color: "",
            image: "",
            position: "",
            repeat: ""
        }
    },
    d.normalizeBackground = function(t) {
        if ($.isPlainObject(t)) return $.extend(!0, {},
        t);
        var e, a = d.getDefaults(),
        s = !1;
        return t += "",
        t.split(/([^( ]+\([^)]*\))/).forEach(function(t) {
            t = t.trim(),
            !s && i.isColor(t) && (a.color = t, s = !0)
        }),
        (e = l.exec(t)) && (a.image = e[1] || ""),
        t = t.replace(/([^( ]+\([^)]*\))/g, "").toLowerCase(),
        (e = r.exec(t)) ? a.position = e[1] + " " + (void 0 === e[2] ? "center": e[2]) : (e = c.exec(t)) ? a.position = (void 0 === e[2] ? "center": e[2]) + " " + e[1] : (e = h.exec(t)) && (a.position = e[1] + " " + (void 0 === e[2] ? "50%": e[2])),
        (e = p.exec(t)) && (a.repeat = e[1] || ""),
        (e = u.exec(t)) && (a.attachment = e[1] || ""),
        a
    },
    d
});