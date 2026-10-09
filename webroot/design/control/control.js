define(function(require) {
    function e(e) {
        e.preventDefault()
    }
    require("./control.css");
    var t = require("class"),
    $ = require("jquery"),
    n = require("../diy/emitter"),
    s = {
        width: null,
        value: null
    },
    i = $(document.body),
    l = t({
        initialize: function(e) {
            this.options = $.extend({},
            s, e),
            this.element = $('<div class="diy-control"></div>'),
            this.setup(),
            this.options.width && this.element.css("width", this.options.width)
        },
        setup: function() {},
        getElement: function() {
            return this.element
        },
        appendTo: function(e) {
            return this.element.appendTo(e),
            this
        },
        value: function() {
            return arguments.length ? this: this.options.value
        },
        isValue: function(e) {
            return void 0 !== e && null !== e
        },
        reset: function() {},
        enable: function() {
            this.element.removeClass("disable"),
            this.element.prev(".label").removeClass("disable"),
            this.emit("enable")
        },
        disable: function() {
            this.element.addClass("disable"),
            this.element.prev(".label").addClass("disable"),
            this.emit("disable")
        },
        disableSelection: function() {
            i.attr("unselectable", "on").css("user-select", "none").on("selectstart", e)
        },
        restoreSelection: function() {
            i.removeAttr("unselectable").css("user-select", "").off("selectstart", e),
            i.attr("style") || i.removeAttr("style")
        }
    });
    return l.implement(n),
    l
});