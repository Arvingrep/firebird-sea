define(function(require) {
    function t() {
        return e || (e = new h([], "pasteclear"))
    }
    var e, i = require("class"),
    $ = require("jquery"),
    n = require("diy/widget/controller"),
    a = require("diy/panel/panel"),
    s = require("diy/panel/tabview/setting"),
    d = require("diy/widget/setting"),
    o = require("diy/page/mutationhistory"),
    r = require("control/options"),
    h = require("ui/inlineditor"),
    c = require("diy/runtime"),
    l = /\s+/g,
    b = /\s?t-[^\s]*\s?/g,
    g = i({
        initialize: function(t, e) {
            var i = this;
            this.box = t,
            this.widget = t.getWidget(),
            this.tabList = t.getTabList(),
            this.contentList = t.getContentList(),
            this.tab = this.widget.getPage().createElement('<li class="w-tabbox-tab"><a>' + e.title + '</a><i class="diy-remove"></i></li>').appendTo(this.tabList),
            this.tabText = this.tab.find("a").bind("keydown blur",
            function(t) { (13 == t.keyCode || "blur" == t.type) && ("keydown" == t.type && t.preventDefault(), i.exitTabEditing())
            }),
            this.tab.find("i").click(function(e) {
                e.stopPropagation(),
                t.delTab(i)
            }),
            this.area = this.widget.getPage().createWidget($.extend(!0, {
                type: "area",
                theme: {
                    style: {
                        margin: {
                            top: "5px",
                            right: "5px",
                            bottom: "5px",
                            left: "5px"
                        }
                    }
                }
            },
            e.content, {
                type: "area",
                operable: !1,
                movable: !1,
                areable: !0
            })),
            this.area.getName = function() {
                return "标签" + (i.contentList.children().index(i.content) + 1) + "容器"
            },
            this.content = this.area.getElement().addClass("w-tabbox-content").appendTo(this.contentList)
        },
        contains: function(t) {
            return this.tab[0].contains(t)
        },
        enterTabEditing: function(e) {
            this.inEditing || (this.inEditing = 1, this.tab.addClass("inlinediting"), this.lastTitleText = this.tabText.text().trim(), t().edit(this.tabText), t().setCaret(e))
        },
        isTabEditing: function() {
            return this.inEditing
        },
        exitTabEditing: function() {
            if (this.inEditing) {
                this.inEditing = 0,
                this.tab.removeClass("inlinediting"),
                t().exit();
                var e = this,
                i = e.tabText.text().trim() || "标签页";
                e.tabText.text(i),
                i != this.lastTitleText && this.widget.getPage().getMutationHistory().log(new o.Record("编辑标签页文字",
                function(t) {
                    e.tabText.text(t)
                },
                this.lastTitleText, i))
            }
        },
        setPrevTab: function(t) {
            this.prevTab = t,
            null == t ? (this.tab.addClass("fist"), this.content.addClass("first")) : (this.tab.removeClass("first"), this.content.removeClass("first"), t.setNextTab(this))
        },
        setNextTab: function(t) {
            this.nextTab = t,
            null == t ? this.content.addClass("last") : this.content.removeClass("last")
        },
        getPrevTab: function() {
            return this.prevTab
        },
        getNextTab: function() {
            return this.nextTab
        },
        getArea: function() {
            return this.area
        },
        index: function(t) {
            return null == t ? this.rememberedIndex || this.content.index() : (t > 0 ? (this.tabList.children().eq(t - 1).after(this.tab), this.contentList.children().eq(t - 1).after(this.content)) : (this.tabList.prepend(this.tab), this.contentList.prepend(this.content)), void 0)
        },
        active: function() {
            this.tab.addClass("active"),
            this.content.addClass("active"),
            this.content.data("resized") || (this.content.data("resized", !0), this.content.children().trigger("resize"))
        },
        deactive: function() {
            this.tab.removeClass("active"),
            this.content.removeClass("active")
        },
        remove: function(t) {
            this.area.remove(t),
            t || (this.rememberedIndex = this.index(), this.widget.getPage().recycle(this.tab), this.widget.getPage().recycle(this.content))
        },
        restore: function() {
            null != this.rememberedIndex && (this.index(this.rememberedIndex), this.rememberedIndex = null),
            this.area.restore()
        },
        beforeSave: function() {
            return this.area.beforeSave()
        },
        toJSON: function() {
            return {
                title: this.tabText.html() || "标签页",
                content: this.area.toJSON()
            }
        }
    }),
    u = "tabbox";
    s.createSection(u, {
        initView: function() {
            var t, e, i = this;
            t = this.addRow(),
            e = t.addCell("options"),
            e.addLabel("切换方式"),
            this.fieldMethod = new r({
                width: 157,
                value: "click",
                options: [{
                    label: "点击",
                    value: "click"
                },
                {
                    label: "悬浮",
                    value: "hover"
                }],
                uncheck: !1
            }),
            this.fieldMethod.appendTo(e.getElement()),
            this.fieldMethod.on("change",
            function(t) {
                i.applyToOutlet("method", t)
            })
        },
        getTitle: function() {
            return "标签页设置"
        },
        getClasses: function() {
            return u
        },
        syncParamMethod: function(t) {
            this.fieldMethod.value(t)
        }
    });
    var f = i({
        setup: function(t) {
            t && "method" in t && this.setParamMethod(t.method)
        },
        getName: function() {
            return u
        },
        setParamMethod: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            i.attr("data-method", t).data("method", t),
            this.emit("paramset", "method", t)
        },
        getParamMethod: function() {
            return this.getWidget().getElement().data("method")
        },
        toJSON: function() {
            return {
                method: this.getParamMethod()
            }
        }
    },
    d),
    T = i({
        setup: function(t) {
            function e() {
                var t = (s.getClasses() || "").split(l),
                e = i.tabElement,
                n = i.contentList;
                e[0].className = e[0].className.replace(b, ""),
                n[0].className = n[0].className.replace(b, ""),
                t.forEach(function(t) {
                    t && (e.addClass(t + "-tabs"), n.addClass(t + "-contents"))
                })
            }
            t.params || (t.params = {
                method: "click"
            });
            var i = this,
            n = this.getWidget(),
            s = n.getTheme(),
            d = n.getElement();
            this.tabboxSetting = new f(n, t.params),
            n.addOutlet(this.tabboxSetting),
            this.tabElement = n.getPage().createElement('<div class="w-tabbox-tabs"><ul class="w-tabbox-list"></ul></div>'),
            this.tabElement.appendTo(d),
            this.tabList = this.tabElement.find("ul"),
            this.contentList = n.getPage().createElement('<div class="w-tabbox-contents"></div>').appendTo(d),
            this.adder = n.getPage().createElement('<li class="w-tabbox-tab last"><a class="diy-add">+</a></li>'),
            this.tabs = [],
            this.initTabs(t.items || [{
                title: "标签页"
            },
            {
                title: "标签页"
            }]),
            n.on("remove",
            function() {
                i.tabs.forEach(function(t) {
                    t.remove(1)
                })
            }),
            n.on("restore",
            function() {
                i.tabs.forEach(function(t) {
                    t.restore()
                })
            }),
            this.on("dblclick",
            function(t) {
                a.toSettingTab(),
                i.enterTabEditing(i.findTabFromElement(t.target), t)
            }),
            this.on("blur", i.exitTabEditing),
            s.on("themechange", e),
            e(),
            c.on("designmodechange",
            function() {
                var t = i.getWidget(),
                e = t.getRender(),
                n = t.getElement();
                c.isDesignMode() ? e && e.destory && e.destory(n) : e && e(n)
            })
        },
        getTabList: function() {
            return this.tabList
        },
        getContentList: function() {
            return this.contentList
        },
        initTabs: function(t) {
            var e = this;
            t.forEach(function(t) {
                var i = new g(e, t);
                e.insertTab(i)
            }),
            this.activeTab(this.firstTab)
        },
        findTabFromElement: function(t) {
            var e = null;
            return this.tabs.every(function(i) {
                return i.contains(t) ? (e = i, !1) : !0
            }),
            e
        },
        enterTabEditing: function(t, e) {
            this.editingTab !== t && this.exitTabEditing(),
            t && t.enterTabEditing(e),
            this.editingTab = t
        },
        exitTabEditing: function() {
            this.editingTab && this.editingTab.exitTabEditing(),
            this.editingTab = null
        },
        addTab: function() {
            var t = this,
            e = new g(t, {
                title: "标签页"
            });
            t.insertTab(e),
            t.activeTab(e),
            t.getWidget().getPage().getMutationHistory().log(new o.Record("添加标签页",
            function(e) {
                e.added && (e.added.restore(), t.insertTab(e.added, e.added.index())),
                e.deled && t.removeTab(e.deled)
            },
            {
                deled: e
            },
            {
                added: e
            }))
        },
        delTab: function(t) {
            var e = this;
            e.removeTab(t),
            e.getWidget().getPage().getMutationHistory().log(new o.Record("删除标签页",
            function(t) {
                t.added && (t.added.restore(), e.insertTab(t.added, t.added.index())),
                t.deled && e.removeTab(t.deled)
            },
            {
                added: t
            },
            {
                deled: t
            }))
        },
        activeTab: function(t) {
            t !== this.activedTab && (this.activedTab && this.activedTab.deactive(), this.activedTab = t, t && t.active())
        },
        insertTab: function(t, e) {
            null == e && (e = this.tabs.length);
            var i = e > 0 ? this.tabs[e - 1] : null,
            n = e < this.tabs.length ? this.tabs[e] : null;
            null == i && (this.firstTab = t),
            this.tabs.splice(e, 0, t),
            t.setPrevTab(i),
            n ? n.setPrevTab(t) : (t.setNextTab(null), this.lastTab = t, this.adder.appendTo(this.tabList))
        },
        removeTab: function(t) {
            var e = t.getPrevTab(),
            i = t.getNextTab();
            i ? i.setPrevTab(e) : e.setNextTab(null),
            t === this.activedTab && this.activeTab(e || i),
            this.firstTab === t && (this.firstTab = i),
            this.lastTab === t && (this.lastTab = e),
            t.remove();
            var n = this.tabs.indexOf(t);
            n > -1 && this.tabs.splice(n, 1)
        },
        selectArea: function(t) {
            var e, i = this.getWidget().getPage().nodeFromPoint(t);
            return i && (e = this.findTabFromElement(i)) && this.activeTab(e),
            this.activedTab.getArea()
        },
        handleMouseDown: function(t) {
            var e;
            return (e = this.findTabFromElement(t.target)) ? e.isTabEditing() ? !1 : (this.activeTab(e), !1) : this.adder[0].contains(t.target) ? (this.addTab(), !1) : (this.exitTabEditing(), void 0)
        },
        beforeSave: function() {
            return $.when.apply($, this.tabs.map(function(t) {
                return t.beforeSave()
            }))
        },
        toJSON: function() {
            return {
                params: this.tabboxSetting.toJSON(),
                items: this.tabs.map(function(t) {
                    return t.toJSON()
                })
            }
        }
    },
    n);
    return T
});