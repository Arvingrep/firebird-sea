define(function(require) {
    require("./datetime.css");
    var $ = require("jquery"),
    t = require("class"),
    i = require("./input"),
    e = require("ui/datepicker"),
    n = {
        switchOnClick: !0,
        format: "yyyy-MM-dd HH:mm:ss",
        value: null,
        startDay: 0,
        place: null,
        buttons: null
    },
    s = t({
        initialize: function(t) {
            var i = this;
            t = $.extend({},
            n, t),
            t.change || (t.change = function(t) {
                i._setValue(t)
            }),
            s.superclass.initialize.call(this, t)
        },
        setup: function() {
            s.superclass.setup.call(this),
            this.element.addClass("datetime"),
            this._initDatetimeEvent()
        },
        _initDatetimeEvent: function() {
            var t = this;
            this.input.focus(function() {
                e(t.input[0], t.options)
            })
        }
    },
    i);
    return s
});