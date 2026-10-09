define(function(require) {
    require("./input.css");
    var t = require("class"),
    $ = require("jquery"),
    e = require("./control"),
    s = t({
        setup: function() {
            s.superclass.setup.call(this),
            this.element.addClass("input"),
            this.input = $('<input type="text" />').appendTo(this.element),
            this.isValue(this.options.value) && this.value(this.options.value),
            this._defaultValue = this._value,
            this._initInputEvent()
        },
        _initInputEvent: function() {
            var t = this;
            this.input.focus(function() {
                t.element.addClass("focus")
            }).blur(function() {
                t.dragging || t.element.removeClass("focus hover")
            }),
            this.element.hover(function() {
                t.element.addClass("hover")
            },
            function() {
                t.element.removeClass("hover")
            }),
            this.input.change(function() {
                t._setValue(this.value)
            })
        },
        _setValue: function(t, e) {
            var s = this._value;
            this.input.val(t || ""),
            s !== t && (this.isValue(s) || this.isValue(t)) && (this._value = t, e || this.emit("change", this.value()))
        },
        value: function() {
            return arguments.length ? (this._setValue(arguments[0], !0), this) : this._value
        },
        reset: function() {
            this._setValue(this._defaultValue)
        }
    },
    e);
    return s
});