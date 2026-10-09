define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    i = require("./button"),
    e = require("diy/additive"),
    n = require("ui/scroller"),
    a = require("ui/scrollist"),
    s = require("diy/runtime"),
    c = require("diy/emitter"),
    d = require("ui/message");
    require("./add.css");
    var l = t({
        initialize: function(t, i, e) {
            this.element = $('<span class="tab"><i></i>' + t + "</span>").appendTo(i),
            this.viewContainer = e
        },
        getName: function() {
            return "add"
        },
        getElement: function() {
            return this.element
        },
        getTabView: function() {
            return this.tabview || (this.tabview = $('<div class="tabview"></div>').appendTo(this.viewContainer))
        },
        initView: function() {
            this.inited = 1
        },
        isActived: function() {
            return this.actived
        },
        active: function() {
            this.actived || (this.actived = 1, this.element.addClass("active"), this.inited || this.initView(), this.getTabView().addClass("active"))
        },
        deactive: function() {
            this.actived && (this.actived = 0, this.element.removeClass("active"), this.getTabView().removeClass("active"))
        }
    }),
    o = t({
        initView: function() {
            this.inited = 1;
            var t = new n(this.getTabView()),
            i = new a(t.getBody(), {
                baseUrl: "/include/"+Module+".inc.php?action=widgets&projectid=" + s.getProjectId(),
                itemRender: function(t) {
                    return new e(t).getElement()
                },
                pagesize: 30,
                scrollElement: t.getInner()
            });
            i.load()
        }
    },
    l),
    r = t({
        initialize: function() {
            o.superclass.initialize.apply(this, arguments),
            this.changeAlias = this.change.bind(this),
            this.widgets = {},
            this.caches = {},
            s.getWorkspace().on("opend", this.changeAlias)
        },
        initView: function() {
            function t() {
                o.load({},
                !0),
                s.getWorkspace().loadInfo(!0)
            }
            this.inited = 1;
            var i = this,
            c = this.getTabView().addClass("apps"),
            d = $('<div class="content"></div>').appendTo(c),
            l = new n(d),
            o = new a(l.getBody(), {
                baseUrl: "/include/"+Module+".inc.php?action=apps&projectid=" + s.getProjectId(),
                itemRender: function(t) {
                    var n = $('<div class="section"><h3 class="title"><i></i>' + t.name + '</h3><div class="content clearfix"></div></div>');
                    n.find("h3").click(function() {
                        n.toggleClass("collapse")
                    });
                    var a = n.find(".content"),
                    c = t.widgets;
                    return Array.isArray(c) && c.forEach(function(t) {
                        new e(t).getElement().appendTo(a)
                    }),
                    i.widgets[t.type] = {
                        parent: a,
                        items: t.widgets.tplWidgets || {}
                    },
                    n
                },
                pagesize: 10,
                scrollElement: l.getInner()
            });
            o.load(),
            o.on("ready", this.changeAlias),
            o.on("empty",
            function() {
                var i = l.getBody().find(".ui-scrollist-empty").empty();
                $('<div>暂无可用的应用！</div>').appendTo(i),
                $('<input type="button" class="btn btn-primary" value="刷新" />').click(t).appendTo(i)
            });
        },
        change: function() {
            var t = s.getWorkspace(),
            i = t.getCurrentPage(),
            e = i.getPageId(),
            n = t.getPageInfo(e),
            a = parseInt(n.appid, 10),
            c = n.alias; (this.currentAppId != a || this.currentTemplate != c) && (this.currentAppId && this.currentTemplate && this.toggleTemplateWidgets(this.currentAppId, this.currentTemplate, !1), a && c && this.toggleTemplateWidgets(a, c, !0), this.currentAppId = a, this.currentTemplate = c)
        },
        getTemplateWidget: function(t, i, n, a) {
            var s = n.name;
            if (this.caches[t] || (this.caches[t] = {}), this.caches[t][i] || (this.caches[t][i] = {}), s in this.caches[t][i]) return this.caches[t][i][s];
            var c = new e(n);
            return c.getElement().hide().appendTo(a),
            this.caches[t][i][s] = c
        },
        toggleTemplateWidgets: function(t, i, e) {
            var n = this.widgets[t];
            if (n) {
                var a = n.parent,
                s = this,
                c = n.items[i];
                c && c.length && c.forEach(function(n) {
                    var c = s.getTemplateWidget(t, i, n, a).getElement();
                    c[e ? "show": "hide"]()
                })
            }
        }
    },
    l),
    h = $(document);
    var v = t({
        setup: function() {
            var t = this,
            i = this.getElement();
            i.addClass("icon-add higilight large"),
            this.setHint("添加"),
            i.click(function() {
                t.actived ? t.deactive() : t.active()
            }),
            this.ideactive = function(e) {
                t.panel[0].contains(e.target) || i[0].contains(e.target) || t.deactive()
            },
            s.on("movemodechange",
            function(i) {
                0 == i && t.deactive()
            })
        },
        initPanel: function() {
            this.panel = $('<div class="diy-widget-panel"><h2>拖动元素到页面<i></i></h2><div class="tabs"></div><div class="tabviews"></div></div>').appendTo(document.body);
            var t = this;
            this.panel.find("i").click(function() {
                t.deactive()
            }),
            this.tabContainer = this.panel.find(".tabs"),
            this.tabContainer.on("click", ".tab",
            function(i) {
                t.toTab($(i.target).index())
            }),
            this.activeTab = -1,
            this.tabs = [],
            this.viewContainer = this.panel.find(".tabviews"),
            this.initTabs()
        },
        toTab: function(t) {
            this.activeTab != t && (this.activeTab > -1 && this.tabs[this.activeTab].deactive(), this.activeTab = t, this.tabs[t].active())
        },
        initTabs: function() {
            this.tabs.push(new o("组件", this.tabContainer, this.viewContainer)),
            this.tabs.push(new r("应用", this.tabContainer, this.viewContainer)),
            this.toTab(0)
        },
        active: function() {
            this.actived = 1,
            this.getElement().addClass("active"),
            this.panel || this.initPanel(),
            this.panel.addClass("visible"),
            h.on("mousedown", this.ideactive)
        },
        deactive: function() {
            this.actived = 0,
            this.getElement().removeClass("active"),
            this.panel && this.panel.removeClass("visible"),
            h.off("mousedown", this.ideactive)
        }
    },
    i);
    return v
});