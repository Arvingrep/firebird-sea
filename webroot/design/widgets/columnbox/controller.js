define(function(require) {
    function t(t, e) {
        return e.left <= t.clientX && e.right >= t.clientX && e.top <= t.clientY && e.bottom >= t.clientY
    }
    var e = require("class"),
    $ = require("jquery"),
    n = require("diy/cursor"),
    i = require("diy/page/draghandler"),
    o = require("diy/page/mutationhistory"),
    l = require("diy/widget/controller"),
    s = require("diy/panel/panel"),
    u = require("diy/panel/tabview/setting"),
    a = require("diy/widget/setting"),
    r = require("control/options"),
    c = require("control/size");
    require("./controller.css");
    var g = e({
        initialize: function(t, e) {
            var n = this;
            this.page = t.getPage(),
            this.diyInner = t.getDiyInner(),
            this.colWraper = this.page.createElement('<div class="w-col-wraper"></div>').addClass("w-col").appendTo(this.diyInner),
            this.area = this.page.createWidget($.extend(e || {},
            {
                type: "area",
                operable: !1,
                movable: !1,
                areable: !0
            })),
            this.area.setDisableStyles(["margin", "width"]),
            this.area.getName = function() {
                return "栏" + (n.diyInner.children(".w-col").index(n.colWraper) + 1)
            },
            this.colElement = this.area.getElement().appendTo(this.colWraper),
            this.colElement.data("column", this),
            this.colCtrl = this.page.createElement('<div class="diy-col-ctrl diy-draggable"></div>'),
            this.colElement.after(this.colCtrl),
            this.setAliquot(e.aliquot)
        },
        getColElement: function() {
            return this.colElement
        },
        getColCtrl: function() {
            return this.colCtrl
        },
        setPrevColumn: function(t) {
            this.prevColumn = t,
            t && t.setNextColumn(this),
            this.touchCtrl()
        },
        touchCtrl: function() {
            this.colCtrl.css("left", "100%"),
            this.nextColumn && this.nextColumn.touchCtrl()
        },
        setNextColumn: function(t) {
            this.nextColumn = t
        },
        getPrevColumn: function() {
            return this.prevColumn
        },
        getNextColumn: function() {
            return this.nextColumn
        },
        getCtrlLeft: function() {
            var t = this.getPrevColumn();
            return (t ? t.getCtrlLeft() : 0) + this.getAliquot()
        },
        setAliquot: function(t) {
            t = parseFloat(t) || 1,
            0 > t ? t = 0 : t > 12 && (t = 12),
            this.aliquotClass && this.colWraper.removeClass(this.aliquotClass),
            parseInt(1e8 * t) % 1e8 ? (this.aliquotClass = null, this.colWraper.css("width", 100 * t / 12 + "%")) : (t = parseInt(t), this.colWraper.css("width", ""), this.aliquotClass = "w-col-" + t, this.colWraper.addClass(this.aliquotClass)),
            this.aliquot = t,
            this.touchCtrl()
        },
        getAliquot: function() {
            return this.aliquot
        },
        remove: function(t) {
            this.area.remove(t),
            t || (this.page.recycle(this.colWraper), this.recycled = 1)
        },
        restore: function() {
            this.recycled && (this.diyInner.append(this.colWraper), this.recycled = 0),
            this.area.restore()
        },
        beforeSave: function() {
            return this.area.beforeSave()
        },
        toJSON: function() {
            return $.extend(this.area.toJSON(), {
                aliquot: this.getAliquot()
            })
        }
    }),
    m = "columnbox";
    u.createSection(m, {
        initView: function() {
            var t, e, n = this;
            t = this.addRow(),
            e = t.addCell("aliquots"),
            e.addLabel("分栏"),
            this.aliquotsOptions = new r({
                value: "6:6",
                options: [{
                    label: "6:6",
                    value: "6:6",
                    classes: "cols-6-6"
                },
                {
                    label: "3:9",
                    value: "3:9",
                    classes: "cols-3-9"
                },
                {
                    label: "9:3",
                    value: "9:3",
                    classes: "cols-9-3"
                },
                {
                    label: "4:4:4",
                    value: "4:4:4",
                    classes: "cols-4-4-4"
                },
                {
                    label: "3:6:3",
                    value: "3:6:3",
                    classes: "cols-3-6-3"
                },
                {
                    label: "6:3:3",
                    value: "6:3:3",
                    classes: "cols-6-3-3"
                },
                {
                    label: "3:3:3:3",
                    value: "3:3:3:3",
                    classes: "cols-3-3-3-3"
                },
                {
                    label: "2:4:4:2",
                    value: "2:4:4:2",
                    classes: "cols-2-4-4-2"
                },
                {
                    label: "3:3:2:2:2",
                    value: "3:3:2:2:2",
                    classes: "cols-3-3-2-2-2"
                },
                {
                    label: "2:2:2:2:2:2",
                    value: "2:2:2:2:2:2",
                    classes: "cols-2-2-2-2-2-2"
                }],
                uncheck: !1
            }),
            this.aliquotsOptions.appendTo(e.getElement()),
            this.aliquotsOptions.on("change",
            function(t) {
                n.applyToOutlet("aliquots", t)
            }),
            t = this.addRow(),
            e = t.addCell(),
            e.addLabel("栏间距"),
            this.columnSpacing = new c,
            this.columnSpacing.appendTo(e.getElement()),
            this.columnSpacing.on("change",
            function(t) {
                n.applyToOutlet("columnSpacing", t)
            })
        },
        getTitle: function() {
            return "分栏设置"
        },
        getClasses: function() {
            return m
        },
        syncParamAliquots: function(t) {
            this.aliquotsOptions.value(t)
        },
        syncParamColumnSpacing: function(t) {
            this.columnSpacing.value(t)
        }
    });
    var h = e({
        setup: function(t) {
            t && ("aliquots" in t && this.setParamAliquots(t.aliquots), "columnSpacing" in t && this.setParamColumnSpacing(t.columnSpacing))
        },
        getName: function() {
            return m
        },
        setParamAliquots: function(t) {
            t = (t || "").toString(),
            this.getParamAliquots() !== t && this.getWidget().callController("setAliquots", t),
            this.emit("paramset", "aliquots", this.getParamAliquots())
        },
        getParamAliquots: function() {
            return this.getWidget().callController("getAliquots")
        },
        setParamColumnCount: function() {},
        getParamColumnCount: function() {
            return this.getWidget().callController("getColumnCount")
        },
        setParamColumnSpacing: function(t) {
            t = (t || "").toString(),
            "" != t && (this.getParamColumnSpacing() !== t && this.getWidget().callController("setColumnSpacing", t), this.emit("paramset", "columnSpacing", this.getParamColumnSpacing()))
        },
        getParamColumnSpacing: function() {
            return this.getWidget().callController("getColumnSpacing")
        },
        toJSON: function() {}
    },
    a),
    p = e({
        setup: function(t) {
            var e = this,
            n = this.getWidget(),
            i = n.getElement();
            this.diyInner = n.getPage().createElement('<div class="diy-inner"></div>').appendTo(i),
            this.columns = [],
            t.items ? this.initColumns(t.items) : this.initColumns([{
                aliquot: 6
            },
            {
                aliquot: 6
            }]),
            t.columnSpacing || (t.columnSpacing = ""),
            t.params = $.extend({
                columnSpacing: "10px"
            },
            t.params || {}),
            this.setColumnSpacing(t.params.columnSpacing),
            this.columnboxSetting = new h(n, {
                aliquots: this.getAliquots(),
                columnSpacing: this.getColumnSpacing()
            }),
            n.addOutlet(this.columnboxSetting),
            n.on("remove",
            function() {
                e.getColumns().forEach(function(t) {
                    t.remove(1)
                })
            }),
            n.on("restore",
            function() {
                e.getColumns().forEach(function(t) {
                    t.restore()
                })
            }),
            n.on("dblclick",
            function() {
                s.toSettingTab()
            }),
            this.on("create",
            function() {
                s.toSettingTab()
            })
        },
        getDiyInner: function() {
            return this.diyInner
        },
        getFirstColumn: function() {
            return this.firstColumn
        },
        getLastColumn: function() {
            return this.lastColumn
        },
        pushColumn: function(t) {
            this.firstColumn || (this.firstColumn = t),
            this.columns.push(t),
            t.setPrevColumn(this.lastColumn),
            t.setNextColumn(null),
            this.lastColumn = t
        },
        removeColumn: function(t) {
            var e = t.getPrevColumn(),
            n = t.getNextColumn();
            n ? n.setPrevColumn(e) : e.setNextColumn(null),
            this.firstColumn === t && (this.firstColumn = n),
            this.lastColumn === t && (this.lastColumn = e),
            t.remove();
            var i = this.columns.indexOf(t);
            i > -1 && this.columns.splice(i, 1)
        },
        initColumns: function(t) {
            for (var e = 0,
            n = t.length; n > e; e++) this.pushColumn(new g(this, t[e]))
        },
        setAliquots: function(t) {
            if (t) {
                "string" == typeof t && (t = t.split(/ *[ ,|:-] */, 12)),
                t = t.map(function(t) {
                    return parseInt(t) || 1
                });
                var e, n = 0,
                i = [],
                l = this;
                t.every(function(t) {
                    var e = !0;
                    return (n += t) >= 12 && (t += 12 - n, e = !1),
                    0 >= t ? e: (i.push(t), e)
                }),
                t = i;
                var s = this.getColumns(),
                u = [],
                a = t.length - s.length,
                r = s.map(function(t) {
                    return t.getAliquot()
                });
                if (a > 0) {
                    for (; a-->0;) {
                        var e = new g(l, {
                            aliquot: 1
                        });
                        l.pushColumn(e),
                        u.push(e)
                    }
                    a = 1
                } else u = s.slice(t.length).reverse(),
                u.forEach(function(t) {
                    l.removeColumn(t)
                }),
                a = -1;
                t.forEach(function(t, e) {
                    s[e].setAliquot(t)
                }),
                l.getPage().getMutationHistory().log(new o.Record("调整分栏结构 " + r.join(":") + "=>" + t.join(":"),
                function(t) {
                    t.direct > 0 ? t.list.forEach(function(t) {
                        t.restore(),
                        l.pushColumn(t)
                    }) : t.list.forEach(function(t) {
                        l.removeColumn(t)
                    });
                    var e = l.getColumns();
                    t.aliquots.forEach(function(t, n) {
                        e[n].setAliquot(t)
                    }),
                    l.columnboxSetting.setParamAliquots(l.getAliquots())
                },
                {
                    list: u.reverse(),
                    direct: -a,
                    aliquots: r
                },
                {
                    list: u,
                    direct: a,
                    aliquots: t
                })),
                l.columnboxSetting.setParamAliquots(l.getAliquots()),
                this.setColumnSpacing(this.getColumnSpacing())
            }
        },
        getAliquots: function() {
            return this.getColumns().map(function(t) {
                return t.getAliquot()
            }).join(":")
        },
        setColumnSpacing: function(t) {
            this.columnSpacing = t;
            var e = parseFloat(t),
            n = t.replace(e, "");
            e = e / 2 + n;
            for (var i = 0; i < this.columns.length; i++) {
                var o = this.columns[i];
                o.getColElement().css("margin-left", e),
                o.getColElement().css("margin-right", e),
                o.getPrevColumn() || o.getColElement().css("margin-left", ""),
                o.getNextColumn() || o.getColElement().css("margin-right", "")
            }
        },
        getColumnSpacing: function() {
            return this.columnSpacing ? this.columnSpacing: ""
        },
        getColumns: function() {
            return this.columns
        },
        getColumnDragHandler: function() {
            function t(t) {
                if (e) {
                    var n, i, o = m.getBoundingClientRect().width,
                    u = 12 / o,
                    a = e * u; (t.ctrlKey || t.altKey) && (u = 1),
                    s.prevAliquot + a < u && (a = u - s.prevAliquot),
                    s.nextAliquot - a < u && (a = s.nextAliquot - u),
                    n = Math.round((s.prevAliquot + a) / u) * u,
                    a = n - s.prevAliquot,
                    i = s.totalAliquot - n,
                    0 > a - l ? (s.prev.setAliquot(n), s.next.setAliquot(i)) : (s.next.setAliquot(i), s.prev.setAliquot(n)),
                    r.touch(t.ctrlKey || t.altKey),
                    l = a
                }
            }
            if (this.columnDragHandler) return this.columnDragHandler;
            var e, l, s, u = this,
            a = u.getPage(),
            r = a.getAliquotHud(),
            c = $(document),
            g = a.getDocument(),
            m = u.getDiyInner()[0];
            return this.columnDragHandler = new i(a,
            function(i, o) {
                u.emit("blur");
                var m, h, p = o.get("handle"); (m = p.prev().data("column")) && (h = m.getNextColumn()) && (n.capture(a.getDocument()[0], i).add("col-resize"), s = {
                    prev: m,
                    next: h,
                    clientX: i.clientX,
                    prevAliquot: m.getAliquot(),
                    nextAliquot: h.getAliquot(),
                    totalAliquot: m.getAliquot() + h.getAliquot()
                },
                l = 0, e = 0, g.on("keydown keyup", t), c.on("keydown keyup", t), r.point(m, h).show())
            },
            function(n) {
                s && (e = n.clientX - s.clientX, t(n))
            },
            function() {
                if (r.hide(), g.off("keydown keyup", t), c.off("keydown keyup", t), n.release(), e = 0, 0 != l) {
                    var i = s.prev,
                    m = s.next;
                    a.getMutationHistory().log(new o.Record("拖动改变分栏比列 " + (s.prevAliquot + ":" + s.nextAliquot) + "=>" + (s.prev.getAliquot() + ":" + s.next.getAliquot()),
                    function(t) {
                        i.setAliquot(t.prev),
                        m.setAliquot(t.next),
                        u.columnboxSetting.setParamAliquots(u.getAliquots())
                    },
                    {
                        prev: s.prevAliquot,
                        next: s.nextAliquot
                    },
                    {
                        prev: s.prev.getAliquot(),
                        next: s.next.getAliquot()
                    })),
                    u.columnboxSetting.setParamAliquots(u.getAliquots())
                }
            }),
            this.columnDragHandler
        },
        handleMouseDown: function(t) {
            if (t.target.classList.contains("diy-col-ctrl")) {
                var e = this.getPage().jQuery(t.target),
                n = e.closest(".w-columnbox").data("widget");
                return n.callController("getColumnDragHandler").start(t, {
                    handle: e
                }),
                !1
            }
        },
        selectArea: function(e) {
            var n = this.getDiyInner()[0].firstElementChild;
            if (!n) return null;
            var i, o, l, s, u, a = -1;
            do
            if (n.offsetWidth && n.classList.contains("w-col")) {
                if (i = n.getBoundingClientRect(), t(e, i)) {
                    o = n;
                    break
                }
                l = Math.pow((i.left + i.right) / 2 - e.clientX, 2),
                s = i.bottom - e.clientY,
                0 > a || a > l ? (a = l, u = s, o = n) : l === a && (0 > s && s > u || u > 0 && u > s) && (u = s, o = n)
            }
            while (n = n.nextElementSibling);
            return this.getPage().widgetFromNode(o)
        },
        beforeSave: function() {
            return $.when.apply($, this.getColumns().map(function(t) {
                return t.beforeSave()
            }))
        },
        toJSON: function() {
            return {
                items: this.getColumns().map(function(t) {
                    return t.toJSON()
                }),
                params: {
                    columnSpacing: this.getColumnSpacing()
                }
            }
        }
    },
    l);
    return p
});