define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("../view"),
    i = e({
        init: function(e) {
            return this.panel = e,
            this.element = $('<div class="tabview"></div>'),
            this.actived = !1,
            this.enabled = !0,
            this.disable(),
            this
        },
        getName: function() {
            return this.name
        },
        getDescription: function() {
            return this.description
        },
        getOverlay: function() {
            return this.overlay || (this.overlay = $('<div class="overlay"></div>'))
        },
        active: function() {
            this.element.addClass("active"),
            this.actived = !0,
            this.point(this.panel.getActiveWidget())
        },
        deactive: function() {
            this.actived = !1,
            this.element.removeClass("active")
        },
        isActived: function() {
            return this.actived
        },
        enable: function() {
            this.enabled || (this.enabled = !0, this.overlay && this.overlay.detach())
        },
        disable: function() {
            this.enabled && (this.enabled = !1, this.getOverlay().appendTo(this.element))
        },
        point: function(e) {
            return this.widget === e ? !1 : (this.widget = e, this.widget ? this.enable() : this.disable(), void 0)
        }
    },
    t);
    return i
});