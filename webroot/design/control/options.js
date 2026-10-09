define(function(require) {
    require("./options.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("./control"),
    e = {
        value: null,
        options: [],
        uncheck: !0
    },
    s = "active",
    a = t({
        setup: function() {
            a.superclass.setup.call(this),
            this.options = $.extend({},
            e, this.options),
            this.element.addClass("options"),
            this.options.uncheck && this.element.addClass("uncheck");
            var t = this;
            this._valuesMap = {},
            $.each(this.options.options || [],
            function(i, e) {
                t.addOption(e)
            }),
            this.isValue(this.options.value) && (this.value(this.options.value), this._defaultValue = this.value()),
            this._initOptionsEvent()
        },
        addOption: function(t) {
            var i, e = $('<span class="option disable-select"><i></i></span>').appendTo(this.element);
            if ($.isPlainObject(t) || (t = {
                label: t
            }), i = "value" in t ? t.value: t.label, i in this._valuesMap) throw new Error("option with value " + i + " already added");
            t.classes ? (e.addClass(t.classes), e.find("i").attr("data-hint", t.label)) : e.text(t.label),
            e.data("value", i),
            this._valuesMap[i] = e
        },
        _initOptionsEvent: function() {
            var t = this;
            this.element.on("click", ".option",
            function() {
                var i = $(this).closest(".option");
                if (i.hasClass(s)) {
                    if (!t.options.uncheck) return;
                    i.removeClass(s),
                    t._value = ""
                } else t._activeOption(i),
                t._value = i.data("value");
                t.emit("change", t.value())
            })
        },
        _activeOption: function(t) {
            t && t.hasClass(s) || (this.element.children().removeClass(s), t && t.addClass(s))
        },
        value: function() {
            if (arguments.length) {
                var t = arguments[0];
                return this.isValue(t) && t in this._valuesMap ? (this._value = t, this._activeOption(this._valuesMap[t])) : (this._value = "", this._activeOption()),
                this
            }
            return this._value
        },
        clear: function() {
            return this._value = "",
            this._activeOption(),
            this
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this.value())
        }
    },
    i);
    return a
});