define(function(require) {
    require("./switcher.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("./control"),
    s = t({
        setup: function() {
            s.superclass.setup.call(this);
            var t = this.options,
            i = this.getElement();
            i.addClass("switcher"),
            this.
            switch = $('<div class="switch"><div class="on"></div><div class="control"></div><div class="off"></div></div>').appendTo(i),
            this._defaultValue = 0 === t.value ? 0 : 1,
            this.value(this._defaultValue),
            this._initSwitcherEvent()
        },
        _initSwitcherEvent: function() {
            var t = this;
            this.getElement().on("click", ".switch",
            function() {
                t._value = t._value ? 0 : 1,
                t._doSwitch()
            })
        },
        _doSwitch: function(t) {
            var i = 1 === this._value ? "on": "off";
            this.
            switch [0].className = "switch " + i,
            t || this.emit("change", this._value)
        },
        value: function() {
            return arguments.length ? (this._value = arguments[0], this._doSwitch(!0), this) : this._value
        },
        reset: function() {
            this.value(this._defaultValue)
        }
    },
    i);
    return s
});