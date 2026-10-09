define(function(require) {
    require("./popmenu/style.css");
    var $ = require("jquery"),
    t = require("class"),
    e = document,
    i = require("../diy/emitter"),
    s = {
        width: null,
        align: null
    },
    n = t({
        initialize: function(t, i) {
            this.triggerElement = t.jquery ? t: $(t),
            this.options = $.extend({},
            s, i),
            this.element = $('<div class="ui-popmenu"><b class="out"></b><b class="in"></b><div class="ui-popmenu-content"><div class="ui-popmenu-items"></div></div></div>'),
            this.arrowOuter = this.element.find("> .out"),
            this.arrowInner = this.element.find("> .in"),
            this.content = this.element.find("> .ui-popmenu-content"),
            this.itemsContainer = this.content.find("> .ui-popmenu-items"),
            this.menuItems = {},
            this.visible = !1;
            var n = this;
            $(e).mousedown(function(e) {
                if (n.visible) {
                    var i = $(e.target);
                    i.closest(t).length || i.closest(n.element).length || n.hide()
                }
            })
        },
        getElement: function() {
            return this.element
        },
        addMenu: function(t, e) {
            var i, s = this;
            return $.isPlainObject(t) ? (i = $('<a class="ui-popmenu-item">' + t.text + "</a>"), t.classes && i.addClass(t.classes)) : i = $('<a class="ui-popmenu-item">' + t + "</a>"),
            $.isFunction(e) && i.click(function() {
                e(i, t),
                s.hide()
            }),
            i.appendTo(this.itemsContainer),
            this.update(),
            this.menuItems[t] = i
        },
        removeMenu: function(t) {
            this.menuItems[t] && (this.menuItems[t].remove(), delete this.menuItems[t], this.update())
        },
        clearMenu: function() {
            this.itemsContainer.empty(),
            this.menuItems = {},
            this.hide()
        },
        showMenu: function(t) {
            this.menuItems[t] && (this.menuItems[t].css("display", ""), this.isVisible() && this.update())
        },
        hideMenu: function(t) {
            this.menuItems[t] && (this.menuItems[t].css("display", "none"), this.isVisible() && (this.itemsContainer.children(":visible").length ? this.update() : this.hide()))
        },
        isVisible: function() {
            return this.visible
        },
        show: function() {
            if (!this.visible) {
                this.visible = !0,
                this.element.stop(!0, !0).css({
                    left: "-9999em",
                    top: "-9999em",
                    display: "block",
                    visibility: "visible",
                    opacity: 1
                }).appendTo(e.body);
                var t = this.itemsContainer.children();
                if (!t.length || !t.filter(":visible").length) return this.hide(),
                void 0;
                this.options.width && this.element.css("width", this.options.width),
                this.update()
            }
        },
        hide: function() {
            var t = this;
            this.visible && (this.visible = !1, t.element.detach(), t.emit("hide"))
        },
        update: function() {
            var t, i, s, n, h = {
                width: this.triggerElement[0].offsetWidth,
                height: this.triggerElement[0].offsetHeight
            },
            l = this.triggerElement.offset(),
            o = l.left + h.width / 2;
            this.element.removeClass("down").addClass("up"),
            t = this.element.outerWidth(!0),
            i = this.element.outerHeight(!0);
            var m = this.options.align;
            s = "left" == m ? l.left: "right" == m ? l.left + h.width - t: Math.max(0, o - t / 2),
            n = l.top + h.height + 10;
            var u = $(e).height();
            n + i > u && l.top - (i + 10) > 0 && (this.element.removeClass("up").addClass("down"), n = l.top - (i + 10));
            var a = $(e).width();
            s + t > a && a - t > 5 && (s = a - t - 5),
            this.arrowOuter.css("left", o - s - 8),
            this.arrowInner.css("left", o - s - 7),
            this.element.css({
                left: s,
                top: n
            })
        }
    });
    return n.implement(i),
    n
});