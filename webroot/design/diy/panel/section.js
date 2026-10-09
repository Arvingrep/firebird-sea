define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("./view"),
    n = "data-hint",
    i = e({
        initialize: function(e, t) {
            this.element = $('<span class="label">' + e + "</span>"),
            t && this.element.addClass(t)
        },
        setTips: function(e, t, i) {
            return arguments.length ? this.element.attr(n, [e, t || "", i || ""].join("|")) : this.element.removeAttr(n),
            this
        }
    },
    t),
    s = e({
        initialize: function(e) {
            this.element = $('<div class="cell"></div>'),
            e && this.element.addClass(e)
        },
        addLabel: function(e, t) {
            return new i(e, t).appendTo(this.element)
        }
    },
    t),
    l = e({
        initialize: function(e) {
            this.element = $('<div class="row"></div>'),
            e && this.element.addClass(e)
        },
        addCell: function(e) {
            this.element.removeClass("cell-" + this.element.children().length);
            var t = new s(e).appendTo(this.element);
            return this.element.addClass("cell-" + this.element.children().length),
            t
        }
    },
    t),
    a = e({
        initialize: function(e, t) {
            var n = this;
            this.element = $('<div class="section"><div class="content shadow-top"></div></div>'),
            t && this.element.addClass(t),
            e ? (this.title = $('<h3 class="title shadow-top"><i></i>' + e + "</h3>"), this.title.prependTo(this.element), this.action = this.title.find(".action"), this.title.click(function() {
                n.collapsed ? n.expand() : n.collapse()
            }), this.collapsed = !1) : this.element.addClass("no-title"),
            this.content = this.element.find("> .content")
        },
        getContent: function() {
            return this.content
        },
        addRow: function(e) {
            return new l(e).appendTo(this.content)
        },
        expand: function() {
            this.collapsed = !1,
            this.element.removeClass("collapse")
        },
        collapse: function() {
            this.collapsed = !0,
            this.element.addClass("collapse")
        }
    },
    t);
    return a
});