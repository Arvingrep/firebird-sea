define(function(require) {
    require("./size.css");
    var t = require("class"),
    $ = require("jquery"),
    e = require("./control"),
    i = require("../ui/popmenu"),
    n = {
        units: ["px", "em", "%"],
        defaultUnit: "px",
        value: null,
        step: 1,
        min: null,
        max: null,
        negative: !0
    },
    s = /(-?(?:(?:\d+)?\.\d+|\d+))(em|ex|px|in|cm|mm|pt|pc|%)?/,
    u = "diy-dragging-mode",
    a = "diy-cursor-col-resize",
    o = t({
        setup: function() {
            o.superclass.setup.call(this),
            this.options = $.extend({},
            n, this.options),
            this.element.addClass("size"),
            this.input = $('<input type="text" />').appendTo(this.element),
            this.options.units && this.options.units.length ? (this.unit = $('<span class="unit"></span>').prependTo(this.element), this.element.addClass("has-unit")) : this.options.defaultUnit = null,
            this.handle = $('<span class="handle"><i title="左右拖动来改变大小"></i></span>').appendTo(this.element),
            this.options.min = this._fixNumber(this.options.min),
            this.options.max = this._fixNumber(this.options.max),
            this.options.negative || (this.options.min = 0),
            this._specialUnits = {},
            this.isValue(this.options.value) ? (this.value(this.options.value), this._defaultNumber = this._number, this._defaultUnit = this._unit) : (this._defaultNumber = null, this._defaultUnit = this.options.defaultUnit),
            this._step = parseFloat(this.options.step),
            isNaN(this._step) && (this._step = 1),
            this._stepPoint = o.getNumberPoint(this._step),
            this._initSizeEvent()
        },
        _initSizeEvent: function() {
            function t(t) {
                var e, i = o.normalizeSize(n.input.val().replace(/\s+/g, ""));
                null === i[0] && (i[0] = 0),
                e = Math.max(n._stepPoint, o.getNumberPoint(i[0])),
                n._saveValue((i[0] + t).toFixed(e), i[1])
            }
            function e(e) {
                var i, s;
                n.dragging && (i = e.pageX - h.pageX, Math.pow(i, 2) < 4 || (s = Math.max(n._step * Math.pow(Math.abs(i) / 5, 2), n._step) * (i >= 0 ? 1 : -1), s && t(s), h = e))
            }
            function i() {
                p.off("mousemove", e),
                p.off("mouseup", i),
                p.off("mouseleave", i),
                document.documentElement.classList.remove(u),
                document.documentElement.classList.remove(a),
                n.restoreSelection(),
                n.input.focus(),
                n.dragging = !1,
                n.emit("changestop")
            }
            var n = this;
            this.input.focus(function() {
                n.element.addClass("focus")
            }).blur(function() {
                n.dragging || n.element.removeClass("focus hover")
            });
            var s, l = !1;
            this.input.keydown(function(e) {
                switch (e.keyCode) {
                case 38:
                case 40:
                    var i = (38 == e.keyCode ? n._step: -1 * n._step) * (e.shiftKey ? 10 : 1);
                    l = !0,
                    n.emit("changestart"),
                    t(i),
                    s && clearInterval(s),
                    s = setInterval(function() {
                        t(i)
                    },
                    200),
                    e.preventDefault()
                }
            }),
            this.input.keyup(function() {
                s && (clearInterval(s), s = null),
                n.restoreSelection(),
                l && (l = !1, n.emit("changestop"))
            }),
            this.input.change(function() {
                var t = o.normalizeSize(String(this.value).replace(/\s+/g, ""));
                n._saveValue(t[0], t[1])
            }),
            this.unit && this.unit.click(function() {
                n.element.addClass("hover"),
                n.getPopmenu().show()
            });
            var h, p = $(document);
            this.dragging = !1,
            this.handle.mousedown(function(t) {
                n.dragging = !0,
                p.on("mousemove", e),
                p.one("mouseup", i),
                p.one("mouseleave", i),
                document.documentElement.classList.add(a),
                document.documentElement.classList.add(u),
                n.disableSelection(),
                n.popmenu && n.popmenu.isVisible() && n.popmenu.hide(),
                h = t,
                n.input.blur(),
                n.emit("changestart")
            }),
            this.element.hover(function() {
                n.element.addClass("hover")
            },
            function() {
                n.dragging || n.popmenu && n.popmenu.isVisible() || n.element.removeClass("hover")
            })
        },
        _fixNumber: function(t) {
            return this.isValue(t) && (t = parseFloat(t), isNaN(t) && (t = 0)),
            t
        },
        _saveValue: function(t, e, i) {
            var n, s;
            this.isValue(t) && !isNaN(t) && "" !== t && (this.isValue(this.options.min) && (t = Math.max(this.options.min, t)), this.isValue(this.options.max) && (t = Math.min(this.options.max, t))),
            s = this._joinValue(this._number, this._unit),
            this._number = t,
            this._unit = e,
            this.input.val(this._joinValue(t, e, " ")),
            n = this._joinValue(t, e),
            n === s || i || this.emit("change", this.value())
        },
        _joinValue: function(t, e, i) {
            return e in this._specialUnits ? this._specialUnits[e] : (i || (i = ""), this.isValue(t) && !isNaN(t) && "" !== t ? t + i + (e || this._defaultUnit || "") : "")
        },
        getPopmenu: function() {
            if (this.popmenu) return this.popmenu;
            var t = this;
            return this.popmenu = new i(this.unit, {
                align: "right"
            }),
            this.popmenu.getElement().addClass("size"),
            $.each(this.options.units || [],
            function(e, i) {
                t.popmenu.addMenu(i,
                function(e, i) {
                    t._saveValue(t._number, i)
                })
            }),
            this.popmenu.on("hide",
            function() {
                t.dragging || t.element.removeClass("hover")
            }),
            this.popmenu
        },
        registerUnit: function(t, e) {
            var i = this;
            void 0 !== e && (this._specialUnits[t] = e),
            this.getPopmenu().addMenu(t, void 0 === e ?
            function(t, e) {
                i._saveValue(i._number, e)
            }: function(t, e) {
                i._saveValue("", e)
            })
        },
        value: function() {
            if (arguments.length) {
                var t = o.normalizeSize(arguments[0]);
                return this._saveValue(t[0], t[1], !0),
                this
            }
            return this._joinValue(this._number, this._unit)
        },
        clear: function() {
            this._saveValue("", this._unit, !0)
        },
        reset: function() {
            this._saveValue(this._defaultNumber, this._defaultUnit)
        }
    },
    e);
    return o.normalizeSize = function(t) {
        var e, i = null,
        n = null;
        return t = (t + "").trim(),
        e = s.exec(t),
        e && (i = parseFloat(e[1]), n = e[2]),
        [i, n]
    },
    o.getNumberPoint = function(t) {
        return (t + "").indexOf(".") > -1 ? (t + "").split(".")[1].length: 0
    },
    o
});