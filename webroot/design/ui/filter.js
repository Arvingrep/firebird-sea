define(function(require) {
    var $ = require("jquery"),
    e = require("class"),
    i = require("diy/emitter"),
    t = {
        classes: {
            wrapper: "ui-filter",
            item: "ui-filter-item",
            active: "active"
        },
        multiple: !1,
        uncheckAll: !1,
        options: [],
        checked: null
    },
    s = e({
        initialize: function(e, i) {
            if (e && !e.jquery && (e = $(e)), !e || !e.length) throw "Invalid Filter container";
            this.options = i = $.extend(!0, {},
            t, i),
            this.wrapper = $("<div></div>").addClass(i.classes.wrapper),
            this.reset(),
            this.wrapper.appendTo(e),
            this.render()
        },
        render: function() {
            var e = this,
            i = this.options,
            t = i.classes;
            $.each(i.options,
            function(s, a) {
                var l, n, r = $("<a></a>");
                if ($.isPlainObject(a)) for (l in a) a.hasOwnProperty(l) && (n = a[l]);
                else l = a,
                n = a;
                r.text(l),
                r.attr("data-value", n),
                r.addClass(t.item),
                r.appendTo(e.wrapper).click(function() {
                    if (r.hasClass(t.active)) {
                        if (i.uncheckAll || i.multiple && e.value.length > 1) {
                            if (r.removeClass(t.active), i.multiple) {
                                var s = $.inArray(n, e.value);
                                s > -1 && e.value.splice(s, 1)
                            } else e.value = null;
                            e.slient || e.emit("change", e.value, r)
                        }
                    } else r.addClass(t.active),
                    i.multiple ? e.value.push(n) : (r.siblings().removeClass(t.active), e.value = n),
                    e.slient || e.emit("change", e.value, r)
                }),
                setTimeout(function() {
                    e.emit("itemReady", r)
                },
                0)
            }),
            this.children = this.wrapper.children(),
            i.checked && this.setValue(i.checked, !0)
        },
        setValue: function(e) {
            var i = this,
            t = this.options.multiple,
            s = this.options.classes;
            if (i.children.removeClass(s.active), t) $.isArray(e) || (e = [e]),
            this.value = [],
            $.each(e,
            function(e, t) {
                var a = i.children.filter("[data-value=" + t + "]");
                a.length && (a.addClass(s.active), i.value.push(t))
            });
            else {
                var a = i.children.filter("[data-value=" + e + "]");
                a.length ? (a.addClass(s.active), this.value = e) : this.value = null
            }
            return this
        },
        getValue: function() {
            return this.value
        },
        reset: function() {
            if (this.children) {
                var e = this,
                i = this.options.classes,
                t = this.value;
                this.value = this.options.multiple ? [] : null,
                ($.isArray(t) && t.length || "" === t || t) && ($.isArray(t) || (t = [t]), $.each(t,
                function(t, s) {
                    e.children.filter("[data-value=" + s + "]").removeClass(i.active)
                })),
                this.slient = !1,
                this.options.checked && this.setValue(this.options.checked)
            }
        }
    });
    return s.implement(i),
    s
});