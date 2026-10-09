define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("../emitter"),
    i = require("../readypromise"),
    n = require("./theme"),
    r = e({
        initialize: function(e, t, i) {
            function s() {
                l.resolve(),
                o.off("placed", s)
            }
            if (this.page = e, this.element = i, $.isPlainObject(t) || (t = {}), this.outlets = [], this.origParams = t, !this.getType()) return this.emit("error", "Missing type defined"),
            void 0;
            this.getElement().attr("id", this.getId()).addClass("n-widget w-" + this.getClassName()).data("widget", this);
            var o = this;
            this.on("focus",
            function() {
                o.focused = 1
            }),
            this.on("blur",
            function() {
                o.focused = 0
            }),
            $.when(r.preload(this.getType(), e).done(function(e) {
                o.render = e
            }), r.info(this.getType()).then(function() {
                return o.theme = new n(o, t.theme),
                o.theme
            })).then(function() {
                return r.controller(o.getType())
            }).done(function(e) {
                return e ? (o.controller = new e(o, t), o.on("focus",
                function() {
                    o.controller.emit("focus")
                }), o.on("blur",
                function() {
                    o.controller.emit("blur")
                }), o.on("dblclick",
                function(e) {
                    o.controller.emit("dblclick", e)
                }), o.isAreable() && o.getElement().addClass("w-area"), o.ready(), void 0) : (o.emit("error", "load controller failed"), void 0)
            }).fail(function() {
                o.emit("error", "initialize widget failed")
            });
            var l = $.Deferred();
            o.on("placed", s),
            $.when(l, this).done(function() {
                o.emit("create")
            })
        },
        getType: function() {
            return this.type || (this.type = this.origParams.type)
        },
        getId: function() {
            if (this.id) return this.id;
            var e = this.page.getWidgetIndex(this.getType());
            return this.id = "w-" + this.getType().replace(/[\._]/g, "-"),
            e > 1 && (this.id += "-" + e),
            this.id
        },
        getName: function() {
            return this.origParams.name
        },
        getClassName: function() {
            return this.classname || (this.classname = this.type.replace(/[._]/g, "-").replace(/-{2,}/g, "-"))
        },
        getPage: function() {
            return this.page
        },
        getTagName: function() {
            return this.tagName || (this.tagName = this.element && this.element[0].tagName || this.origParams.tagName || "div")
        },
        getElement: function() {
            return this.element || (this.element = this.getPage().createElement("<" + this.getTagName() + " />"))
        },
        getRender: function() {
            return this.theme && this.theme.getRender() || this.render
        },
        contains: function(e) {
            return this.getElement()[0].contains(e)
        },
        getBounds: function() {
            return this.getElement()[0].getBoundingClientRect()
        },
        getGlobalBounds: function() {
            return this.getPage().toGlobalBounds(this.getBounds())
        },
        getTheme: function() {
            return this.theme
        },
        setTheme: function(e) {
            return this.theme = e,
            this
        },
        getDisableStyles: function() {
            return this.disableStyles || []
        },
        setDisableStyles: function(e) {
            this.disableStyles = Array.isArray(e) ? e: []
        },
        getOutlets: function() {
            return this.outlets
        },
        addOutlet: function(e) {
            return this.outlets.push(e),
            this
        },
        getController: function() {
            return this.controller
        },
        callController: function(e) {
            var t = this.getController();
            if (t && e in t) {
                var i = [].slice.call(arguments, 1) || [];
                return t[e].apply(t, i)
            }
        },
        hasFocus: function() {
            return this.focused
        },
        isRemoved: function() {
            return this.removed
        },
        handleMouseDown: function(e) {
            return this.isMovable() ? this.callController("handleMouseDown", e) : !1
        },
        isAreable: function() {
            return "areable" in this ? this.areable: "areable" in this.origParams ? this.origParams.areable: !1
        },
        setAreable: function(e) {
            this.areable = Boolean(e)
        },
        isMovable: function() {
            return "movable" in this ? this.movable: "movable" in this.origParams ? this.origParams.movable: !0
        },
        setMovable: function(e) {
            this.movable = Boolean(e)
        },
        isOperable: function() {
            return "operable" in this ? this.operable: "operable" in this.origParams ? this.origParams.operable: !0
        },
        setOperable: function(e) {
            this.operable = Boolean(e)
        },
        toPlace: function(e) {
            var t = this.getElement();
            e.before ? t.insertBefore(e.before) : t.appendTo(e.parent),
            this.emit("placed")
        },
        getPlace: function() {
            for (var e = this.getElement()[0], t = e.parentNode, i = this.getPage(); (e = e.nextElementSibling) && !i.widgetFromNode(e););
            return {
                parent: t,
                before: e
            }
        },
        addChild: function(e) {
            e.toPlace({
                parent: this.getElement()[0]
            })
        },
        getParentWidget: function() {
            for (var e, t = this.getPage(), i = this.getElement()[0]; i = i.parentNode;) if (e = t.widgetFromNode(i)) return e;
            return null
        },
        getParentWidgets: function() {
            for (var e = [], t = this; t = t.getParentWidget();) e.push(t);
            return e
        },
        getChildWidgets: function() {
            var e = [],
            t = this.getPage();
            return this.getElement().children().each(function() {
                var i = t.widgetFromNode(this);
                i && e.push(i)
            }),
            e
        },
        hasChild: function() {
            return this.getElement().children().length > 0
        },
        findPlace: function(e) {
            if (!this.isAreable()) return this.getPlace();
            var t = this.getPage(),
            i = this.getElement()[0],
            n = null;
            if (e && (n = i.firstElementChild)) do
            if (n.offsetHeight && t.widgetFromNode(n)) {
                var r = n.getBoundingClientRect(),
                s = r.height / 2 + r.top;
                if (s >= e.clientY) break
            }
            while (n = n.nextElementSibling);
            return {
                parent: i,
                before: n
            }
        },
        selectArea: function(e) {
            return this.isAreable() ? this: this.callController("selectArea", e)
        },
        remove: function(e) {
            var t = this.getPage(),
            i = t.getActiveWidget();
            i && this.contains(i.getElement()[0]) && t.focus(null),
            this.removed = 1,
            this.emit("remove"),
            this.isMovable() && !e && (this.memPlace = this.getPlace(), t.recycle(this.getElement()))
        },
        restore: function() {
            this.removed = 0,
            this.memPlace && (this.toPlace(this.memPlace), this.memPlace = null),
            this.emit("restore")
        },
        beforeSave: function() {
            return this.callController("beforeSave")
        },
        toJSON: function() {
            return this.isReady() ? $.extend({
                type: this.getType(),
                tagName: this.getTagName(),
                theme: this.getTheme().toJSON()
            },
            this.callController("toJSON") || {}) : this.origParams
        }
    });
    r.implement(i),
    r.implement(t);
    var s = {},
    o = {},
    l = {},
    a = {},
    u = "/design/widgets",
    h = /^(\w+:)?\/\//,
    c = window.devicePixelRatio && window.devicePixelRatio > 1 ? "icon@2x.png": "icon.png";
    return r.BasePath = u,
    $.extend(r, {
        info: function(e) {
            if (!s[e]) {
                var t = $.Deferred();
                $.getJSON(u + "/" + e + "/info.json?v="+window.sea.getStamp()).done(function(i) {
                    t.resolve(r.registerInfo(e, i))
                }).fail(function() {
                    t.resolve(r.registerInfo(e, {}))
                }),
                s[e] = t
            }
            return s[e].promise()
        },
        registerInfo: function(e, t) {
            return e in o ? o[e] : (t = t || {},
            t.url || (t.url = u + "/" + e), t.icon && h.test(t.icon) || (t.icon = t.url + "/" + (t.icon || c)), t.name || (t.name = e), t.theme && (n.registerLessThemeUrl(e, t.url), n.registerLessThemes(e, t.theme)), o[e] = t)
        },
        controller: function(e) {
            return l[e] || (l[e] = r.info(e).then(function(t) {
                var i = $.Deferred();
                return require.async(t.url + "/controller",
                function(t) {
                    i.resolve(r.registerController(e, t))
                }),
                i
            })),
            l[e].promise()
        },
        registerController: function(e, t) {
            return e in a || (a[e] = t),
            a[e]
        },
        levelOf: function() {
            return 20
        },
        preload: function(e, t) {
            function i() {
                t.isRemoved() ? s.reject() : s.resolve(n)
            }
            var n, s = $.Deferred(),
            o = s.reject.bind(s);
            return r.info(e).then(function(l) {
                if (t.isRemoved()) return i();
                if (!l) return s.resolve();
                var a = [],
                u = 0;
                l.view && (l.view.indexOf("css") > -1 && a.push(l.url + "/view.css"), l.view.indexOf("js") > -1 && (u = a.push(l.url + "/view.js"))),
                l.design && l.design.indexOf("css") > -1 && a.push(l.url + "/design.css"),
                a.length ? t.use(a, r.levelOf(e)).then(function() {
                    u > 0 && (n = arguments[u - 1]),
                    i()
                },
                o) : i()
            },
            o),
            s.promise()
        }
    }),
    r
});