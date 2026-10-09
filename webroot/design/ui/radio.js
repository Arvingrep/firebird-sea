define(function(require) {
    function t(t, i) {
        if (t && !t.jquery && (t = $(t)), !t || !t.length) throw "Invalid Radio container";
        if (this.element = $('<i class="ui-radio"><b></b></i>'), this.options = $.extend({},
        e, i), t.is(":radio")) {
            this.input = t.hide();
            var n = this.input.attr("name"),
            s = this.input.val();
            this.options.name && n != this.options.name && this.input.attr("name", this.options.name),
            this.options.value && n != this.options.value && this.input.val(s),
            this.element.insertAfter(this.input)
        } else this.input = $('<input type="radio" name="' + (this.options.name || "") + '" value="' + (this.options.value || "") + '" />').hide(),
        this.element.appendTo(t);
        this.input.appendTo(this.element);
        var a = this;
        this.element.click(function(t) {
            a.check(),
            t.preventDefault()
        })
    }
    var $ = require("jquery");
    require("./radio/style.css");
    var e = {
        name: null,
        value: null
    };
    return t.prototype = {
        isChecked: function() {
            return this.checked === !0
        },
        getName: function() {
            return this.input.attr("name")
        },
        getValue: function() {
            return this.input.val()
        },
        check: function() {
            this.element.addClass("on"),
            this.checked = !0,
            this.input.prop("checked", !0)
        },
        uncheck: function() {
            this.element.removeClass("on"),
            this.checked = !1,
            this.input.prop("checked", !1)
        },
        disable: function() {
            this.element.addClass("disabled"),
            this.disabled = !0,
            this.input.prop("disabled", !0)
        },
        enable: function() {
            this.element.removeClass("disabled"),
            this.disabled = !1,
            this.input.prop("disabled", !1)
        }
    },
    t
});