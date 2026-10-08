define(function(require) {
    var $ = require("jquery"),
    i = require("class");
    require("./dialog/style.css");
    var t = {
        backgroundColor: "",
        width: null,
        height: null,
        classes: {
            dialog: "ui-dialog"
        }
    },
    o = document,
    n = window,
    e = $(n),
    s = 1e3;
    return i({
        initialize: function(i) {
            this.options = $.extend(!0, {},
            t, i),
            this.zindex = s++,
            this.dialog = $('<div class="' + this.options.classes.dialog + ' event-masker"><div class="ui-dialog-container"><div class="ui-dialog-content"></div><a class="ui-dialog-close">&times;</a></div></div>').css({
                left: "-9999em",
                top: "-9999em"
            }).hide().appendTo(o.body),
            this.options.backgroundColor && this.dialog.css("background-color", this.options.backgroundColor),
            this.container = this.dialog.find(".ui-dialog-container"),
            this.content = this.dialog.find(".ui-dialog-content");
            var n = this;
            this.dialog.find(".ui-dialog-close").click(function() {
                n.close()
            })
        },
        getDialog: function() {
            return this.dialog
        },
        setContent: function(i) {
            this.content.empty(),
            this.content.append(i);
            var t = this;
            return setTimeout(function() {
                t.resize()
            },
            0),
            this
        },
        open: function(i) {
            i ? this.setContent(i) : this.resize();
            var t = this;
            return this.resizeFunction = function() {
                t.resize()
            },
            e.bind("resize", this.resizeFunction),
            this.bringToTop(),
            this.dialog.show(),
            setTimeout(function() {
                t.dialog.trigger("dialog.ready", [t.container])
            },
            0),
            this
        },
        close: function() {
            e.unbind("resize", this.resizeFunction),
            this.dialog.hide(),
            this.dialog.trigger("dialog.close", [this.container])
        },
        remove: function() {
            this.close();
            var i = this;
            setTimeout(function() {
                i.dialog && i.dialog.remove()
            },
            0)
        },
        resize: function() {
            var i = this.options,
            t = i.width,
            n = i.height;
            if (!i.width || !i.height) {
                var s = $("<div></div>").css({
                    position: "absolute",
                    left: "-9999em",
                    top: "-9999em",
                    width: i.width || "auto",
                    height: i.height || "auto",
                    overflow: "hidden"
                }).appendTo(o.body);
                s.append(this.content.children().clone()),
                t = s.outerWidth(!0),
                n = s.outerHeight(!0),
                s.remove()
            }
            var d = e.width() - 30,
            a = e.height() - 30;
            t > d && (t = d),
            n > a && (n = a);
            var h = Math.floor((d - t) / 2) + 115,
            l = Math.floor((a - n) / 2) + 115;
            return this.dialog.css({
                left: 0,
                top: 0
            }),
            this.container.css({
                zIndex: this.zindex,
                width: t,
                height: n,
                left: h,
                top: l
            }),
            this.dialog.trigger("dialog.resize"),
            this
        },
        bringToTop: function() {
            this.zindex = ++s,
            this.dialog.css("z-index", this.zindex)
        },
        bind: function(i, t) {
            $.isFunction(t) && this.dialog.bind("dialog." + i,
            function() {
                var i = [].slice.call(arguments);
                i.splice(0, 1),
                t.apply(null, i)
            })
        },
        rebind: function(i, t) {
            this.dialog.unbind("dialog." + i),
            this.bind(i, t)
        }
    })
});