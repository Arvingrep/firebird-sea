define(function(require) {
    require("./checkbox.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("./control"),
    e = require("./input"),
    a = {
        id: 0,
        type: "checkbox",
        manage: !1,
        options: [],
        height: null
    },
    n = t({
        setup: function() {
            n.superclass.setup.call(this),
            this.options = $.extend({},
            a, this.options);
            var t = this;
            if (this.content = $('<div class="diy-control diy-checkbox"><ul class="itemlist"></ul></div>'), this.itemlist = this.content.find(".itemlist"), void 0 != this.options.value && void 0 != this.options.value.length && this.options.value.length) for (var i in this.options.value) this.addItem(this.options.value[i]);
            this.options.manage && (this.content.append('<div class="itembtn"><button class="btn btn-default btn-add">增加一项</button></div>'), this.content.find(".btn-add").click(function() {
                t.addItem({
                    id: t.getId(),
                    title: "",
                    value: ""
                })
            }))
        },
        getId: function(t) {
            return t ? (this.options.id = Math.max(this.options.id, t), t) : ++this.options.id
        },
        addItem: function(t) {
            var i = this,
            a = this.getId(t.id),
            n = void 0 == t.checked ? 0 : t.checked,
            s = void 0 == t.title ? "": t.title,
            d = void 0 == t.value ? s: t.value,
            c = "checkbox" == this.options.type ? "": this.options.type,
            h = $('<li data-id="' + a + '"></li>'),
            o = $('<div class="checkbox ' + c + '" data-value="' + d + '" data-checked="' + n + '"></div>'),
            l = $('<i class="checked"></i>');
            if (l.appendTo(o), o.appendTo(h), this.options.manage) {
                var u = new e;
                u.value(s),
                u.appendTo(h),
                u.on("change",
                function(t) {
                    d == s && o.attr("data-value", t),
                    i.changed()
                });
                var p = $('<a class="icon remove"><i></i></a>');
                p.click(function() {
                    i.removeItem(a)
                }),
                p.appendTo(h)
            } else {
                var r = $('<span class="text">' + s + "</span>");
                r.appendTo(h)
            }
            0 == n && l.hide(),
            o.click(function() {
                if (1 == $(this).attr("data-checked")) $(this).attr("data-checked", 0),
                $(this).find(".checked").hide();
                else {
                    if ("radio" == i.options.type) {
                        var t = i.itemlist.find(".checkbox[data-checked=1]");
                        t.length && (t.attr("data-checked", 0), t.find(".checked").hide())
                    }
                    $(this).attr("data-checked", 1),
                    $(this).find(".checked").show()
                }
                i.changed()
            }),
            this.itemlist.append(h)
        },
        removeItem: function(t) {
            this.itemlist.find("li[data-id=" + t + "]").remove(),
            this.changed()
        },
        appendTo: function(t) {
            this.content.appendTo(t)
        },
        changed: function() {
            this.options.manage ? this.emit("change", this.getData()) : this.emit("change", this.getValue())
        },
        getValue: function() {
            var t = [];
            return this.itemlist.find(".checkbox[data-checked=1]").each(function() {
                t.push($(this).attr("data-value"))
            }),
            t
        },
        getData: function() {
            var t = [];
            return this.itemlist.children().each(function() {
                var i = $(this).find(".checkbox"),
                e = {
                    id: $(this).attr("data-id"),
                    title: $(this).find("input[type=text]").val(),
                    value: i.attr("data-value"),
                    checked: i.attr("data-checked")
                };
                "" == e.value && (e.value = e.title),
                t.push(e)
            }),
            t
        },
        value: function() {
            if (arguments.length) {
                this.itemlist.empty();
                for (var t in arguments[0]) this.addItem(arguments[0][t]);
                return ! 0
            }
            return this.getValue()
        }
    },
    i);
    return n
});