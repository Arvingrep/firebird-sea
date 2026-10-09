define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = "data-hint";
    return t({
        initialize: function(t) {
            this.dock = t,
            this.setup()
        },
        setup: function() {},
        getName: function() {},
        getElement: function() {
            return this.element || (this.element = $('<a class="button"></a>'))
        },
        setHint: function(t, n, i) {
            return n || (n = "right"),
            arguments.length ? this.getElement().attr(e, [t, n || "", i || ""].join("|")) : this.getElement().removeAttr(e),
            this
        },
        appendTo: function(t) {
            return this.getElement().appendTo(t),
            this
        }
    })
});