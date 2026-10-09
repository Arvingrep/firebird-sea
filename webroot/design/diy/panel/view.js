define(function(require) {
    var e = require("class"),
    n = e({
        getElement: function() {
            return this.element
        },
        appendTo: function(e) {
            return this.element && e && (e instanceof n ? this.element.appendTo(e.getElement()) : this.element.appendTo(e)),
            this
        },
        show: function() {
            return this.element.css("display", ""),
            this
        },
        hide: function() {
            return this.element.css("display", "none"),
            this
        }
    });
    return n
});