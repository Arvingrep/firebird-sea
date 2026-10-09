define(function(require) {
    function e(e, t) {
        var i, n, o = e.lastElementChild;
        if (null == o) return null;
        do
        if (o.dataset.level) {
            if (parseInt(o.dataset.level) <= t) {
                i = o;
                break
            }
            n = o
        }
        while (o = o.previousElementSibling);
        return n || i && (n = i.nextElementSibling) ? n: null
    }
    function t(e) {
        var i = [];
        return e ? (i.push({
            type: e.type,
            theme: e.theme
        }), e.items && e.items.forEach(function(e) {
            i.concat(t(e))
        }), i) : i
    }
    require("./page.css");
    var i = require("class"),
    $ = require("jquery"),
    n = require("../emitter"),
    o = require("../readypromise"),
    s = require("../snapshot"),
    r = require("../clipboard"),
    a = require("../runtime"),
    u = require("../cursor"),
    d = require("../cssrule"),
    l = require("../shortcut"),
    c = require("./draghandler"),
    h = require("./repainting"),
    g = require("./outline"),
    f = require("./hud"),
    m = require("./mutationhistory"),
    v = require("../widget/widget"),
    p = require("../widget/theme"),
    y = window.sea,
    w = i({
        initialize: function(e) {
            this.widget = e
        },
        getDescription: function() {
            return "添加区块:" + this.widget.getType()
        },
        undo: function() {
            this.widget.remove()
        },
        redo: function() {
            this.widget.restore()
        }
    }),
    b = i({
        initialize: function(e) {
            this.widget = e
        },
        getDescription: function() {
            return "移除区块:" + this.widget.getType()
        },
        undo: function() {
            this.widget.restore()
        },
        redo: function() {
            this.widget.remove()
        }
    }),
    M = i({
        initialize: function(e, t, i) {
            this.widget = e,
            this.place = t,
            this.orig = i
        },
        getDescription: function() {
            return "移动区块:" + this.widget.getType()
        },
        undo: function() {
            this.widget.toPlace(this.orig)
        },
        redo: function() {
            this.widget.toPlace(this.place)
        }
    }),
    k = i({
        initialize: function(e) {
            this.page = e,
            this.marker = e.createElement('<div class="diy-marker"></div>')
        },
        isNear: function(e) {
            var t = (e.getElement()[0], this.marker[0]);
            return t.nextElementSibling === t || t.previousElementSibling === t
        },
        setPlace: function(e) {
            return e ? (this.place = e, e.before ? this.marker.insertBefore(e.before) : this.marker.appendTo(e.parent), void 0) : this.destory()
        },
        getPlace: function() {
            return this.place
        },
        destory: function() {
            this.page.recycle(this.marker),
            this.place = null
        },
        isValid: function() {
            return null != this.place
        }
    }),
    W = i({
        initialize: function(t, i, n) {
            function o(e) {
                u.documentElement.classList[e ? "add": "remove"]("diy-design-mode")
            }
            function s(e) {
                u.documentElement.classList[e ? "add": "remove"]("diy-move-mode")
            }
            function r(e) {
                function t() {
                    u.removed || (d.message("构建页面"), u.rootWidget = new v(u, e, u.$body), u.rootWidget.ready(function() {
                        u.focus(u.rootWidget)
                    }), u.initEvent(), u.ready())
                }
                e ? (e = u.workspace.trMacro(e), e.type = "body", d.message("加载页面样式"), u.prefetch(e).always(t)) : (e = {
                    type: "body",
                    tagName: "BODY",
                    theme: {
                        style: {
                            margin: {
                                top: "",
                                right: "auto",
                                bottom: "",
                                left: "auto"
                            },
                            width: "960px"
                        }
                    }
                },
                t())
            }
            var u = this;
            u.workspace = t,
            u.pageid = i.toString(),
            u.uid = 0,
            u.canvas = $('<div class="diy-canvas"><iframe></iframe><div class="overlay"></div></div>').appendTo(t.getContainer()),
            u.view = u.canvas.find("iframe"),
            u.overlay = u.canvas.find(".overlay");
            var d = u.workspace.getPreloader();
            d.start().message("准备页面"),
            u.preloader = d;
            var c = y.getStamp();
            u.window = u.view[0].contentWindow,
            u.document = u.window.document,
            u.document.open(),
            u.document.write('<!doctype html><html><head><meta charset="utf-8" /><link rel="stylesheet" data-level="0" href="/design/base.css?' + c + '" /><link rel="stylesheet" data-level="0" href="/design/design.css?' + c + '" /><style id="page-style" type="text/css" data-level="10000"></style></head><body></body></html>'),
            u.document.close(),
            u.documentElement = u.document.documentElement,
            u.head = u.document.head,
            u.body = u.document.body,
            u.$ = u.jQuery = $.factory(u.window),
            u.$window = u.jQuery(u.window),
            u.$document = u.jQuery(u.document),
            u.$head = u.jQuery(u.head),
            u.$body = u.jQuery(u.body),
            u.$fragments = u.jQuery(u.document.createDocumentFragment()),
            u.pageSheet = u.document.getElementById("page-style").sheet,
            u.cssRules = {},
            u.widgetindex = {},
            u.levelMap = {},
            u.loader = y.factory(u.window, {
                config: "/design/pageconfig",
                stamp: c,
                mutator: function(t, i) {
                    if (u.removed) return ! 0;
                    var n = u.levelMap[i];
                    if (delete u.levelMap[i], null != n && "LINK" === t.nodeName) {
                        t.dataset.level = n;
                        var o = e(u.head, n);
                        return o ? (u.head.insertBefore(t, o), !0) : void 0
                    }
                }
            }),
            a.on("designmodechange", o),
            a.on("movemodechange", s),
            o(a.isDesignMode()),
            s(a.isMoveMode()),
            u.use(require.resolve("ui/mousetrap")).done(function(e) {
                u.shortcut = new l(e)
            }),
            u.detach(function() {
                u.shortcut && u.shortcut.unbind(),
                u.shortcut = null,
                a.off("designmodechange", o),
                a.off("movemodechange", s),
                u.getReadyDeferred().rejectWith(u),
                u.window = null,
                u.document = null,
                u.documentElement = null,
                u.head = null,
                u.body = null,
                u.loader = null,
                u.jQuery = null,
                u.$window = null,
                u.$head = null,
                u.$body = null,
                u.$fragments.empty(),
                u.$fragments = null,
                u.$document.unbind().detach(),
                u.$document = null,
                u.widgetindex = {};
                for (var e in u.cssRules) u.cssRules[e] = null,
                delete u.cssRules[e];
                u.cssRules = null;
                for (var e in u.levelMap) u.levelMap[e] = null,
                delete u.levelMap[e];
                u.levelMap = null,
                u.canvas.remove()
            }),
            d.incr();
            n ? (this.fromRescue = 1, r(n)) : (d.message("加载页面数据"), this.requestData("/include/"+Module+".inc.php?action=pagedata",
            function(e) {
                u.removed || (d.incr(), r(e && e.data))
            })),
            u.ready(function() {
                u.documentElement.classList.add("diy-design-mode"),
                u.overlay.addClass("ready"),
                d.done()
            })
        },
        savePoint: function() {
            this.fromRescue && (this.fromRescue = 0),
            this.getMutationHistory().savePoint()
        },
        getMutationHistory: function() {
            return this.mutationHistory || (this.mutationHistory = new m)
        },
        isModified: function() {
            return this.fromRescue || this.isReady() && this.getMutationHistory().isModified()
        },
        prefetch: function(e) {
            function i() {
                if (!n.isRemoved()) {
                    n.preloader.incr(2);
                    var e = o.shift();
                    return e ? ($.when(v.preload(e.type, n), v.info(e.type).done(function() {
                        return p.preload(e.type, e.theme, n)
                    })).always(i), void 0) : s.resolve()
                }
            }
            var n = this,
            o = t(e),
            s = $.Deferred();
            return i(),
            s.promise()
        },
        requestData: function(e, t) {
            var i = new RegExp("[?&]pageid=" + this.pageid + "\\b");
            return i.test(e) || (e += (e.indexOf("?") > 0 ? "&": "?") + "pageid=" + this.pageid),
            this.workspace.requestData(e, t)
        },
        saveData: function(e, t, i) {
            var n = new RegExp("[?&]pageid=" + this.pageid + "\\b");
            return n.test(e) || (e += (e.indexOf("?") > 0 ? "&": "?") + "pageid=" + this.pageid),
            this.workspace.saveData(e, t, i)
        },
        getWidgetIndex: function(e) {
            return this.widgetindex[e] ? ++this.widgetindex[e] : this.widgetindex[e] = 1
        },
        getCSSRule: function(e) {
            return this.cssRules[e] || (this.cssRules[e] = new d(this.pageSheet, e))
        },
        removeCSSRule: function(e) {
            var t = e instanceof d ? e.getSelector() : null;
            t && this.cssRules[t] && (d.removeCSSRule(this.pageSheet, this.cssRules[t].getRule()), delete this.cssRules[t])
        },
        getPageId: function() {
            return this.pageid
        },
        getWorkspace: function() {
            return this.workspace
        },
        getProjectId: function() {
            return this.workspace.getProjectId()
        },
        getWindow: function() {
            return this.$window
        },
        getDocument: function() {
            return this.$document
        },
        getLoader: function() {
            return this.loader
        },
        resolve: function(e, t) {
            return this.loader.resolve(e, t)
        },
        use: function(e, t, i) {
            t || (t = 10);
            var n = this;
            e = this.resolve(e, i),
            Array.isArray(e) ? e.forEach(function(e) {
                n.levelMap[e] = t
            }) : n.levelMap[e] = t;
            var o = $.Deferred();
            return this.loader.use(e, o.resolve.bind(o)),
            o.promise()
        },
        getRepainting: function() {
            if (!this.repainting) {
                var e = new h;
                this.detach(function() {
                    e.destroy()
                }),
                this.on("show",
                function() {
                    e.start()
                }),
                this.on("hide",
                function() {
                    e.stop()
                }),
                this.on("designmodechange",
                function(t) {
                    t ? e.start() : e.stop()
                }),
                this.visible && e.start(),
                this.repainting = e
            }
            return this.repainting
        },
        getOverlay: function() {
            return this.overlay
        },
        createElement: function(e) {
            return this.jQuery(e)
        },
        createWidget: function(e) {
            return new v(this, e)
        },
        contains: function(e) {
            return this.documentElement.contains(e)
        },
        recycle: function(e) {
            this.$fragments.append(e)
        },
        getMarker: function() {
            return this.marker || (this.marker = new k(this))
        },
        insertWidget: function(e, t) {
            if (this.isReady() && a.isDesignMode()) {
                var i, n = this.getMarker();
                if (n.isValid()) i = n.getPlace(),
                n.destory();
                else {
                    if (!t) return this.getOutline().getDropArea().hide(),
                    void 0;
                    i = (this.activeWidget || this.rootWidget).findPlace()
                }
                if (e = e || r.getData()) {
                    var o = this.createWidget(e);
                    return this.getMutationHistory().log(new w(o)),
                    o.toPlace(i),
                    this.focus(o),
                    this.getOutline().getDropArea().hide(),
                    o
                }
            }
        },
        moveWidget: function(e) {
            if (this.isReady() && a.isDesignMode()) {
                var t = this.getMarker();
                if (t.isValid() && !t.isNear(e)) {
                    var i = t.getPlace();
                    this.getMutationHistory().log(new M(e, i, e.getPlace())),
                    e.toPlace(i)
                }
                this.focus(e),
                t.destory(),
                this.getOutline().getDropArea().hide()
            }
        },
        removeWidget: function(e) {
            this.getMutationHistory().log(new b(e)),
            e.remove()
        },
        cloneWidget: function(e) {
            r.add(e)
        },
        dragWidget: function(e, t) {
            this.emit("drag", e, t)
        },
        paste: function(e) {
            this.insertWidget(e, 1)
        },
        mark: function(e) {
            if (this.isReady() && a.isDesignMode()) {
                "type" in e && !("fixed" in e) && (e = this.toLocalPoint(e));
                var t = this.getMarker();
                if (e.clientX < 0) return t.destory(),
                this.getOutline().getDropArea().hide(),
                u.add("no-drop"),
                void 0;
                u.remove("no-drop");
                var i = this.findArea(e) || this.rootWidget;
                t.setPlace(i.findPlace(e)),
                this.getOutline().getDropArea().point(i)
            }
        },
        getBounds: function() {
            return this.view[0].getBoundingClientRect()
        },
        fixPoint: function(e, t) {
            if (!e.fixed) {
                if (!t) {
                    if (! (t = e.currentTarget || e.target)) return;
                    t = t.nodeType ? 9 === t.nodeType ? t: t.ownerDocument: t.document
                }
                var i = this.getBounds();
                t == document ? (e.globalX = e.clientX, e.globalY = e.clientY, e.clientX = e.clientX - i.left, e.clientY = e.clientY - i.top) : (e.globalX = e.clientX + i.left, e.globalY = e.clientY + i.top),
                e.fixed = 1
            }
        },
        toLocalPoint: function(e) {
            var t = this.getBounds();
            return {
                clientX: e.clientX - t.left,
                clientY: e.clientY - t.top
            }
        },
        toGlobalPoint: function(e) {
            var t = this.getBounds();
            return {
                clientX: e.clientX + t.left,
                clientY: e.clientY + t.top
            }
        },
        toGlobalBounds: function(e) {
            var t = this.getBounds();
            return $.extend({},
            e, {
                left: e.left + t.left,
                top: e.top + t.top,
                right: e.right + t.left,
                bottom: e.bottom + t.top
            })
        },
        nodeFromPoint: function(e) {
            var t = this.document.elementFromPoint(e.clientX, e.clientY);
            return ! t || 9 != t.nodeType && "HTML" != t.nodeName || (t = this.body),
            t
        },
        findWidget: function(e) {
            if ("nodeType" in e || (e = this.nodeFromPoint(e)), !e || !this.contains(e)) return null;
            var t;
            do
            if (e === this.documentElement ? t = this.rootWidget: 1 == e.nodeType && (t = this.widgetFromNode(e)), t) return t;
            while (e = e.parentNode);
            return null
        },
        findMovable: function(e) {
            if ("nodeType" in e || (e = this.nodeFromPoint(e)), !e || !this.contains(e)) return null;
            var t;
            do
            if (1 == e.nodeType && (t = this.widgetFromNode(e)) && t.isMovable()) return t;
            while (e = e.parentNode);
            return null
        },
        findArea: function(e) {
            var t, i, n;
            if ("nodeType" in e ? t = null: (t = e, e = this.nodeFromPoint(t)), !e || !this.contains(e)) return null;
            do
            if (n = null, e === this.documentElement ? n = this.rootWidget: 1 == e.nodeType && (n = this.widgetFromNode(e)), n && (i = n.selectArea(t))) return i;
            while (e = e.parentNode);
            return null
        },
        widgetFromNode: function(e) {
            return e && this.jQuery.data(e, "widget")
        },
        getActiveWidget: function() {
            return this.activeWidget
        },
        initEvent: function() {
            function e(e) {
                e.ctrlKey || e.altKey ? (u.add("copy"), v = 1) : (u.remove("copy"), v = 0)
            }
            function t(e) {
                e.button || (m = 0, g && (d.fixPoint(e, this), n(), o(e)), h.off("mouseup", t), l.off("mouseup", t))
            }
            function i() {
                f = 0,
                h.off("mousemove", o)
            }
            function n() {
                f || (f = 1, h.on("mousemove", o))
            }
            function o(e) {
                if (a.isDesignMode()) {
                    var t = d.findWidget(e.target);
                    t && d.hover(t)
                }
            }
            var r, d = this,
            l = $(document),
            h = d.getDocument(),
            g = 0,
            f = 0,
            m = 0,
            v = 0,
            p = new c(d,
            function(t, i) {
                d.hover(null),
                d.focus(null);
                var n = i.get("target");
                s.show(n.getType()),
                a.setMoveMode(1),
                u.capture(h[0], t).add("move"),
                d.mask(n),
                e(t),
                r = 1,
                h.on("keydown keyup", e),
                l.on("keydown keyup", e)
            },
            function(t) {
                r && (e(t), r = 0),
                s.move({
                    clientX: t.globalX,
                    clientY: t.globalY
                }),
                d.mark(t)
            },
            function(t, i) {
                s.hide();
                var n = i.get("target");
                v ? (v = 0, d.insertWidget($.extend(!0, {},
                n.toJSON()))) : d.moveWidget(n),
                d.mask(null),
                l.off("keydown keyup", e),
                h.off("keydown keyup", e),
                a.setMoveMode(0),
                u.release()
            });
            this.on("drag",
            function(e, n) {
                a.isDesignMode() && (setTimeout(function() {
                    n && n.isMovable() || (n = d.findMovable(n.getElement()[0])),
                    n && p.start(e, {
                        target: n
                    }),
                    h.one("mouseup", t),
                    l.one("mouseup", t)
                },
                0), m = 1, i())
            }),
            h.mouseleave(function(e) {
                g = 0,
                !m && a.isDesignMode() && (i(), d.fixPoint(e, this), d.getOutline().getHover().isMouseOut(e) && d.hover(null))
            }),
            h.mouseenter(function() {
                g = 1,
                !m && a.isDesignMode() && n()
            }),
            h.mousedown(function(e) {
                a.isDesignMode() && (l.trigger(e).trigger("blur"), e.button || (setTimeout(function() {
                    var i = d.getActiveWidget();
                    i && i.isMovable() && i.contains(e.target) || (i = d.findMovable(e.target)),
                    i && i.handleMouseDown(e),
                    h.one("mouseup", t),
                    l.one("mouseup", t)
                },
                0), m = 1, i()))
            }),
            h.click(function(e) {
                a.isDesignMode() && d.focus(d.findWidget(e.target))
            }),
            h.dblclick(function(e) {
                if (a.isDesignMode()) {
                    var t = d.findWidget(e.target);
                    t && (d.fixPoint(e, this), t.emit("dblclick", e))
                }
            })
        },
        getOutline: function() {
            return this.outline || (this.outline = new g(this))
        },
        getHud: function() {
            return this.hud || (this.hud = new f(this))
        },
        getAliquotHud: function() {
            return this.ahud || (this.ahud = new f.Aliquot(this))
        },
        hover: function(e) {
            e && e !== this.activeWidget ? this.getOutline().getHover().point(e) : this.getOutline().getHover().hide()
        },
        focus: function(e) {
            this.hover(null),
            e !== this.activeWidget && (this.activeWidget && this.activeWidget.emit("blur"), this.activeWidget = e, this.activeWidget ? (this.activeWidget.emit("focus"), this.getOutline().getSelector().point(this.activeWidget)) : this.getOutline().getSelector().hide(), this.emit("selectionchange", e))
        },
        mask: function(e) {
            e ? this.getOutline().getMasker().point(e) : this.getOutline().getMasker().hide()
        },
        show: function() {
            this.visible = 1,
            this.canvas.show(),
            this.rootWidget && this.focus(this.rootWidget),
            this.emit("show")
        },
        hide: function() {
            this.emit("hide"),
            this.visible = 0,
            this.hover(null),
            this.focus(null),
            this.canvas.hide()
        },
        isRemoved: function() {
            return this.removed
        },
        detach: function(e) {
            return e ? (this.detachCallback || (this.detachCallback = $.Callbacks("once memory")), this.detachCallback.add(e)) : this.detachCallback && (this.detachCallback.fireWith(this), this.detachCallback = null),
            this
        },
        remove: function() {
            this.removed = 1,
            this.hide(),
            this.detach()
        },
        beforeSave: function() {
            return this.rootWidget.beforeSave()
        },
        toJSON: function() {
            return this.rootWidget.toJSON()
        }
    });
    return W.implement(o),
    W.implement(n),
    W
});