define(function(require) {
    require("./select.css");
    var t = require("class"),
    $ = require("jquery"),
    e = require("./control"),
    i = {
        label: "请选择",
        value: "",
        options: [],
        height: null,
        remote: {
            url: "",
            label: "label",
            value: "value"
        }
    },
    s = document,
    a = $(s),
    n = "active",
    o = t({
        setup: function() {
            o.superclass.setup.call(this),
            this.options = $.extend({},
            i, this.options),
            this.element.attr({
                tabindex: 0,
                hideFocus: !0
            }).addClass("select"),
            this.element.append("<i></i>"),
            this.label = $('<span class="label disable-select"></span>').appendTo(this.element),
            this.menu = $('<div class="diy-control select-menu"></div>'),
            this._NS = "select-" + (new Date).getTime().toString(36),
            this._valuesMap = {},
            this._option = "",
            this.options.label && this._setLabel(this.options.label);
            var t = this;
            this.defaultOption = this.addOption({
                label: this.options.label || "",
                value: ""
            }),
            $.each(this.options.options || [],
            function(e, i) {
                t.addOption(i)
            }),
            this.loadDataDeferred = new $.Deferred,
            void 0 !== this.options.value && (this.value(this.options.value), this._defaultValue = this.value()),
            this._initSelectEvent()
        },
        _initSelectEvent: function() {
            var t = this;
            this.element.on("click",
            function() {
                t.menu.is(":visible") ? t._hideMenu() : t.options.remote.url ? t._loadRemoteData(t._showMenu()) : t._showMenu()
            }),
            this.menu.on("click", ".option",
            function(e) {
                t._selectOption($(e.target).closest(".option")),
                t.menu.detach()
            }),
            t.options.remote.url ? this._loadRemoteData() : this.loadDataDeferred.resolve()
        },
        _showMenu: function() {
            var t, e, i, n, o, l, h, u, d, r = this;
            this.menu.css({
                width: "",
                height: r.options.height || "",
                left: "-9999em",
                top: "-9999em"
            }).appendTo(s.body),
            t = this.menu.css("width", "").width(),
            i = a.width(),
            n = a.height(),
            o = this.element.outerWidth(!0),
            l = this.element.outerHeight(!0),
            h = this.element.offset(),
            o > t && (t = o - 2, this.menu.css("width", t)),
            e = this.menu.height(),
            u = h.left,
            u + t > i && (u = i - t),
            d = h.top + l - 1,
            d + e > n && (d = h.top - e - 1),
            this.menu.css({
                left: u,
                top: d
            }).appendTo(s.body),
            a.on("mousedown." + this._NS,
            function(t) {
                var e;
                t.target != r.element[0] && t.target != r.menu[0] && (e = $(t.target).parents()) && -1 == e.index(r.element) && -1 == e.index(r.menu) && r._hideMenu()
            })
        },
        _hideMenu: function() {
            this.menu.detach(),
            a.off("mousedown." + this._NS)
        },
        _setLabel: function(t) {
            this.label.text(t || ""),
            this.label.data("label", t)
        },
        _selectOption: function(t, e) {
            t || (t = this.defaultOption),
            this._option && t[0] === this._option[0] || (this._option && this._option.removeClass(n), t.addClass(n), this._option = t, this._setLabel(t.data("label")), e || this.emit("change", this.value()))
        },
        _loadRemoteData: function(t) {
            var e = this,
            i = e.value(),
            s = $.getJSON(e.options.remote.url);
            s.done(function(s) {
                if (0 == s.code && s.data) {
                    e.reloadOptions();
                    for (var a in s.data) e.addOption({
                        label: s.data[a][e.options.remote.label],
                        value: s.data[a][e.options.remote.value]
                    });
                    e._selectOption(e._valuesMap[i], !0)
                }
                if ($.isFunction(t)) {
                    var n = [].slice.call(arguments).splice(0, 1);
                    t.apply(e, n)
                }
            }),
            s.always(function() {
                e.loadDataDeferred.resolve()
            })
        },
        addOption: function(t) {
            var e, i = $('<span class="option disable-select"><i></i><strong></strong></span>').appendTo(this.menu);
            if ($.isPlainObject(t) || (t = {
                label: t
            }), e = void 0 === t.value ? t.label: t.value, e in this._valuesMap) throw new Error("option with value " + e + " already added");
            return t.classes && i.addClass(t.classes),
            i.find("strong").text(t.label),
            i.data("label", t.label),
            i.data("value", e),
            this._valuesMap[e] = i,
            i
        },
        clearOptions: function() {
            return this.value(this._defaultValue),
            this._valuesMap = {},
            this.menu.children().not(this.defaultOption).remove(),
            this
        },
        reloadOptions: function() {
            return this._valuesMap = {},
            this.menu.children().not(this.defaultOption).remove(),
            this
        },
        value: function() {
            if (arguments.length) {
                var t = this,
                e = arguments;
                return "pending" == this.loadDataDeferred.state() ? this.loadDataDeferred.done(function() {
                    return t._selectOption(t._valuesMap[e[0]], !0),
                    t
                }) : (t._selectOption(t._valuesMap[e[0]], !0), t)
            }
            return this._option ? this._option.data("value") : ""
        },
        text: function() {
            return this.label.data("label") || ""
        },
        clear: function() {
            this._selectOption(this.defaultOption, !0)
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this.value())
        }
    },
    e);
    return o
});