define(function(require) {
    require("./panel.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("./view"),
    e = require("./tabview/tabview"),
    a = require("./tabview/style"),
    s = require("./tabview/setting"),
    n = require("diy/widget/widget"),
    h = t({
        initialize: function(t, i) {
            this.element = $('<span class="tab"><i></i>' + t + "</span>"),
            i && this.element.addClass(i)
        },
        active: function() {
            this.element.addClass("active")
        },
        deactive: function() {
            this.element.removeClass("active")
        }
    },
    i),
    b = t({
        initialize: function(t) {
            this.panel = t,
            this.element = $('<div class="breadcrumbs shadow-top"></div>')
        },
        getElement: function() {
            return this.element
        },
        point: function(t) {
            function i(a) {
                var s = e.widgets[a++];
                s ? n.info(s.getType()).done(function(n) {
                    s === t && e.element.css("background-image", 'url("' + n.icon + '")'),
                    e.widgetnames[s.getType()] = s.getName() || n.name,
                    i(a)
                }) : e.render()
            }
            if (this.widget = t, this.widgetnames = {},
            t) {
                this.widgets = t.getParentWidgets().slice(0, 2).reverse(),
                this.widgets.push(t);
                var e = this,
                a = 0;
                i(a)
            } else this.element.css("background-image", ""),
            this.widgets = [],
            this.render()
        },
        render: function() {
            var t = this;
            return this.element.empty(),
            this.widgets.forEach(function(i) {
                var e = t.widgetnames[i.getType()],
                a = $('<a><i data-hint="' + e + '|bottom">' + e + "</i></a>");
                a.hover(function() {
                    i.getPage().hover(i)
                },
                function() {
                    t.widget && t.widget.getPage().hover(t.widget)
                }),
                a.click(function() {
                    i.getPage().focus(i)
                }),
                a.appendTo(t.element)
            }),
            this
        }
    }),
    c = t({
        init: function(t) {
            return this.sidebar = t,
            this.element = $('<div id="sidebar-panel"><div class="tabs"></div><div class="tabviews"></div></div>'),
            this.tabs = this.element.find(">.tabs"),
            this.tabviews = this.element.find(">.tabviews"),
            this.tabsMap = {},
            this.breadcrumbs = new b(this),
            this.breadcrumbs.getElement().insertAfter(this.tabs),
            this.styleTabView = a.init(this),
            this.addTab(this.styleTabView),
            this.settingTabView = s.init(this),
            this.addTab(this.settingTabView),
            this.toTab(this.styleTabView),
            this
        },
        addTab: function(t) {
            var i = this,
            e = t.getName(),
            a = t.getDescription(),
            s = new h(a).appendTo(this.tabs);
            return this.tabsMap[e] = {
                initialized: !1,
                tab: s,
                tabview: t
            },
            s.getElement().click(function() {
                i.toTab(e)
            }),
            this
        },
        toTab: function(t) {
            if (t instanceof e && (t = t.getName()), this.tabsMap[t] && (!this.activeTab || this.activeTab.tabview.getName() != t)) {
                var i = this.tabsMap[t];
                i.initialized || (i.initialized = !0, i.tabview.appendTo(this.tabviews)),
                this.activeTab && (this.activeTab.tab.deactive(), this.activeTab.tabview.deactive()),
                i.tab.active(),
                i.tabview.active(),
                this.activeTab = i
            }
        },
        toStyleTab: function() {
            this.toTab(this.styleTabView)
        },
        toSettingTab: function() {
            this.toTab(this.settingTabView)
        },
        point: function(t) {
            this.activeWidget = t,
            this.breadcrumbs.point(t),
            this.activeTab.tabview.point(t)
        },
        getSidebar: function() {
            return this.sidebar
        },
        getActiveWidget: function() {
            return this.activeWidget
        },
        getBreadcrumbs: function() {
            return this.breadcrumbs
        }
    },
    i);
    return new c
});