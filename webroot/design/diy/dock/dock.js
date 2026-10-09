define(function(require) {
    require("./dock.css");
    var t = require("class"),
    $ = require("jquery"),
    n = require("./button/logo"),
    e = require("./button/page"),
    i = require("./button/add"),
    m = require("./button/temp"),
    s = require("./button/preview"),
    o = require("./button/save"),
    source = require("./button/source"),
    d = require("./button/history"),
    h = require("./button/help"),
    a = t({
        init: function(t) {
            return this.sidebar = t,
            this.element = $('<div id="sidebar-dock"><div class="top"></div><div class="bottom"></div></div>'),
            this.top = this.element.find("> .top"),
            this.bottom = this.element.find("> .bottom"),
            this.buttons = {},
            //this.addButton(new n(this)),
            this.addButton(new e(this)),
            this.addButton(new i(this)),
            this.addButton(new m(this)),
            this.addButton(new s(this)),
            this.addButton(new o(this)),
            this.addButton(new source(this)),
            //this.addButton(new h(this), !0),
            this.addButton(new d(this), !0),
            this
        },
        getElement: function() {
            return this.element
        },
        getSidebar: function() {
            return this.sidebar
        },
        appendTo: function(t) {
            return this.element && this.element.appendTo(t),
            this
        },
        addButton: function(t, n) {
            return n ? this.bottom.prepend(t.getElement()) : this.top.append(t.getElement()),
            this.buttons[t.getName()] = t,
            this
        },
        getButton: function(t) {
            return this.buttons[t]
        }
    });
    return new a
});
