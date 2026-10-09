define(function(require) {
    function e(e) {
        return e += "",
        e.substr(0, 1).toUpperCase() + e.substr(1)
    }
    require("./style.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/theme"),
    n = require("../view"),
    s = require("../section"),
    a = require("./tabview"),
    h = require("ui/scroller"),
    o = require("ui/message"),
    l = require("diy/runtime"),
    d = require("ui/colorfilter"),
    c = require("control/index"),
    r = "default",
    m = "spinner",
    g = t({
        initialize: function(e) {
            this.section = e,
            this.element = $('<div class="status"><a class="default" data-theme="' + r + '"><i></i>恢复默认</a><a class="theme current active"><sup>当前选择</sup><img src="" /></a><a class="theme previous"><sup>上次使用</sup><img src="" /></a><div class="handle clearfix shadow-top"><i></i><span>选择风格</span></div></div>'),
            this.actionDefault = this.element.find(".default"),
            this.themeCurrent = this.element.find(".current"),
            this.themePrevious = this.element.find(".previous"),
            this.changeThemeAlias = this.changeTheme.bind(this),
            this.handle = this.element.find(".handle"),
            this.initStatusEvent()
        },
        initStatusEvent: function() {
            var e = this;
            this.element.on("click", "[data-theme]",
            function(t) {
                var i = $(t.target).closest(".theme");
                e.widget.getTheme().setBase(i.attr("data-theme"))
            })
        },
        appendTo: function(e) {
            return this.element.appendTo(e),
            this
        },
        getElement: function() {
            return this.element
        },
        getHandle: function() {
            return this.handle
        },
        link: function(e) {
            var t = e.getTheme();
            t.on("themechange", this.changeThemeAlias),
            this.widget = e,
            this.changeTheme(t.getName())
        },
        unlink: function(e) {
            e.getTheme().off("themechange", this.changeThemeAlias),
            this.widget = null
        },
        changeTheme: function(e) {
            var t, n, s = this.widget;
            return t = s.getTheme(),
            this.setCurrent(t),
            n = t && t.getPrevious(),
            this.setPrevious(n),
            e == r ? this.actionDefault.hide() : i.getLessTheme(s.getType(), r) && this.actionDefault.show(),
            this
        },
        setCurrent: function(e) {
            this.setTheme(this.themeCurrent, e)
        },
        setPrevious: function(e) {
            this.setTheme(this.themePrevious, e)
        },
        setTheme: function(e, t) {
            if (t) {
                var i = t.getThumb();
                i ? e.find("img").attr("src", i) : e.find("img").removeAttr("src"),
                e.attr("data-theme", t.getName()),
                e.show()
            } else e.find("img").removeAttr("src"),
            e.removeAttr("data-theme"),
            e.hide()
        },
        show: function() {
            this.element.show()
        },
        hide: function() {
            this.element.hide()
        }
    }),
    u = t({
        initialize: function(e) {
            this.section = e,
            this.element = $('<div class="library"><div class="filter"><div class="group color"></div></div><div class="items"></div><div class="handle clearfix shadow-top"><i></i><span>选择风格</span></div></div>'),
            this.handle = this.element.find("> .handle"),
            this.colorFilter = new d(this.element.find(".group.color"), {
                uncheckAll: !0
            }),
            this.items = this.element.find("> .items"),
            this.itemsScroller = new h(this.items),
            this.itemsBody = this.itemsScroller.getBody(),
            this.expanded = !1,
            this.changeThemeAlias = this.changeTheme.bind(this),
            this.initLibraryEvent()
        },
        appendTo: function(e) {
            return this.element.appendTo(e),
            this
        },
        getElement: function() {
            return this.element
        },
        initLibraryEvent: function() {
            var e = this;
            this.handle.click(function() {
                e.collapse()
            }),
            this.colorFilter.on("change",
            function(t) {
                t ? (e.itemsBody.children().hide(), e.itemsBody.children("[data-color=" + t + "]").show()) : e.itemsBody.children().show()
            }),
            this.itemsBody.on("click", "[data-theme]",
            function(t) {
                var i = $(t.target).closest(".theme");
                e.widget.getTheme().setBase(i.data("theme"))
            })
        },
        link: function(e) {
            var t = this,
            i = e.getTheme();
            i.on("themechange", this.changeThemeAlias),
            this.renderThemes(e).done(function() {
                t.widget = e,
                t.changeTheme(i.getName())
            })
        },
        unlink: function(e) {
            e.getTheme().off("themechange", this.changeThemeAlias),
            this.colorFilter.reset(),
            this.widget = null
        },
        changeTheme: function(e) {
            var t = this.itemsBody.find("[data-theme]");
            return t.filter(".active").removeClass("active"),
            t.filter("[data-theme=" + e + "]").addClass("active"),
            this
        },
        renderThemes: function(e) {
            var t = this,
            n = $.Deferred(),
            s = e.getType();
            return this.widget && this.widget.getType() == s ? n.resolve() : (this.itemsBody.empty(), this.element.addClass(m), i.getThemes(s).done(function(i) {
                i = Array.isArray(i) ? i: [],
                i.forEach(function(i) {
                    t.addTheme(e, i)
                }),
                n.resolve()
            }).always(function() {
                t.element.removeClass(m)
            })),
            n.promise()
        },
        renderTheme: function(e) {
            var t = $('<a class="theme"><img src="' + e.thumb + '" /><sub></sub></a>');
            return t.attr("data-theme", e.name),
            t.attr("data-color", e.color || ""),
            t
        },
        addTheme: function(e, t) {
            var i = e && e.getTheme(),
            n = this.renderTheme(t);
            i && i.getName() == t.name && n.addClass("active"),
            n.appendTo(this.itemsBody)
        },
        expand: function() {
            this.expanded || this.element.addClass("expand"),
            this.expanded = !0
        },
        collapse: function() {
            this.expanded && this.element.removeClass("expand"),
            this.expanded = !1
        }
    }),
    f = t({
        initialize: function(e) {
            this.tabview = e,
            this.element = $('<div class="themes shadow-top"><h3 class="title">风格</h3></div>'),
            this.status = new g(this).appendTo(this.element),
            this.library = new u(this).appendTo(this.element),
            this.initThemesEvent()
        },
        initThemesEvent: function() {
            function e() {
                n && clearTimeout(n)
            }
            function t() {
                e(),
                n = setTimeout(i, 300)
            }
            function i() {
                e(),
                s.library.collapse(),
                s.element.off("mouseleave", t),
                a.off("mouseleave", t),
                s.statusPushFlag = !0
            }
            var n, s = this,
            a = this.library.getElement();
            this.element.on("mousemove",
            function() {
                e(),
                s.element.on("mouseleave", t)
            }),
            a.on("mouseenter",
            function() {
                e(),
                a.on("mouseleave", t)
            }),
            this.status.getHandle().click(function() {
                s.library.expand()
            })
        },
        link: function(e) {
            var t = this,
            n = e.getType();
            e.getTheme().isChanged() ? this.tabview.showAction() : this.tabview.hideAction();
            var s = i.getLessThemes(n);
            s.length > 1 || !i.getLessTheme(n, r) ? (t.show(), t.status.link(e), t.library.link(e)) : (this.element.addClass(m), i.getThemes(e.getType()).done(function(i) {
                i && i.length ? (t.show(), t.status.link(e), t.library.link(e)) : t.hide()
            }).fail(function() {
                t.hide()
            }).always(function() {
                t.element.removeClass(m)
            }))
        },
        unlink: function(e) {
            this.status.unlink(e),
            this.library.unlink(e)
        },
        show: function() {
            this.tabview.getElement().addClass("has-theme")
        },
        hide: function() {
            this.tabview.getElement().removeClass("has-theme")
        }
    },
    n),
    p = t({
        initialize: function(e) {
            this.tabview = e,
            this.element = $('<div class="styles"></div>'),
            this.sections = {},
            this.controls = {};
            var t, i;
            this.sectionPosition = new s("位置和大小", "position").appendTo(this.element),
            t = this.sectionPosition.addRow(),
            i = t.addCell(),
            this.controls.offset = c("offset").appendTo(i.getElement()),
            t = this.sectionPosition.addRow("width-height"),
            i = t.addCell(),
            i.addLabel("宽度"),
            this.controls.width = c("length").appendTo(i.getElement()),
            i = t.addCell(),
            i.addLabel("高度"),
            this.controls.height = c("length").appendTo(i.getElement()),
            this.sections.position = this.sectionPosition,
            this.sectionBackground = new s("背景", "background"),
            t = this.sectionBackground.addRow(),
            i = t.addCell(),
            this.controls.background = c("background").appendTo(i.getElement()),
            this.sectionBackground.appendTo(this.element),
            this.sections.background = this.sectionBackground,
            this.sectionBorder = new s("边框", "border"),
            t = this.sectionBorder.addRow(),
            i = t.addCell(),
            this.controls.border = c("border").appendTo(i.getElement()),
            this.sectionBorder.appendTo(this.element),
            this.sections.border = this.sectionBorder,
            this.sectionText = new s("文字", "text"),
            t = this.sectionText.addRow("font-family"),
            i = t.addCell(),
            i.addLabel("字体"),
            this.controls["font-family"] = c("font-family").appendTo(i.getElement()),
            t = this.sectionText.addRow("color-size"),
            i = t.addCell(),
            i.addLabel("颜色"),
            this.controls.color = c("color", {
                width: 80
            }).appendTo(i.getElement()),
            i = t.addCell(),
            i.addLabel("大小"),
            this.controls["font-size"] = c("size", {
                width: 55
            }).appendTo(i.getElement()),
            t = this.sectionText.addRow("text-align-line-height"),
            i = t.addCell("options"),
            i.addLabel("对齐"),
            this.controls["text-align"] = c("text-align", {
                width: 80
            }).appendTo(i.getElement()),
            i = t.addCell(),
            i.addLabel("行高"),
            this.controls["line-height"] = c("size", {
                defaultUnit: null,
                width: 55
            }).appendTo(i.getElement()),
            t = this.sectionText.addRow("font-weight"),
            i = t.addCell(),
            i.addLabel("厚度"),
            this.controls["font-weight"] = c("font-weight").appendTo(i.getElement()),
            t = this.sectionText.addRow("decoration-style"),
            i = t.addCell("options"),
            i.addLabel("修饰"),
            this.controls["text-decoration"] = c("text-decoration", {
                width: 80
            }).appendTo(i.getElement()),
            i = t.addCell("options"),
            i.addLabel("样式"),
            this.controls["font-style"] = c("font-style", {
                width: 55
            }).appendTo(i.getElement()),
            this.sectionText.appendTo(this.element),
            this.sections.text = this.sectionText,
            this.changeStylesAlias = this.changeStyles.bind(this),
            this.initStylesEvent()
        },
        initStylesEvent: function() {
            var e = this;
            $.each(this.controls,
            function(t, i) {
                i.on("changestart",
                function() {
                    e.widget && e.widget.getTheme().captureStylesStart()
                }),
                i.on("change",
                function(i) {
                    if (e.widget) {
                        var n = e.widget.getTheme(),
                        s = n.getStyles();
                        "offset" == t ? (s.margin = i.margin, s.padding = i.padding) : s[t] = i,
                        n.setStyles(s),
                        e.tabview.showAction()
                    }
                }),
                i.on("changestop",
                function() {
                    e.widget && e.widget.getTheme().captureStylesEnd()
                })
            })
        },
        link: function(e) {
            e.getTheme().on("stylechange", this.changeStylesAlias),
            this.widget = e,
            this.changeStyles(e.getTheme().getStyles())
        },
        unlink: function(e) {
            this.widget = null,
            this.changeStyles({}),
            e.getTheme().off("stylechange", this.changeStylesAlias)
        },
        changeStyles: function(e) {
            return $.each(this.controls,
            function(t, i) {
                "offset" == t ? i.value({
                    margin: e.margin,
                    padding: e.padding
                }) : t in e ? i.value(e[t]) : i.clear()
            }),
            this.disableStyles(this.widget && this.widget.getDisableStyles() || []),
            this
        },
        disableStyles: function(t) {
            var i = this,
            n = 4,
            s = this.widget && "body" == this.widget.getType().toLowerCase();
            $.each(this.controls,
            function(a, h) {
                "offset" == a ? ["margin", "padding"].forEach(function(i) {
                    t.indexOf(i) > -1 ? (n -= 1, h["disable" + e(i)]()) : h["enable" + e(i)]()
                }) : "background" == a || "border" == a ? (t.indexOf(a) > -1 ? i.sections[a].hide() : i.sections[a].show(), "background" == a && (s ? i.controls.background.enable("attachment") : i.controls.background.disable("attachment"))) : t.indexOf(a) > -1 ? (("width" == a || "height" == a) && (n -= 1), h.disable(), h.getElement().parent().addClass("disabled")) : (h.enable(), h.getElement().parent().removeClass("disabled"))
            }),
            0 == n ? this.sectionPosition.hide() : this.sectionPosition.show(),
            this.sectionText.getElement().find(".diy-control").filter(function(e, t) {
                return t.classList.contains("disabled") === !1
            }).length ? this.sectionText.show() : this.sectionText.hide()
        }
    },
    n),
    v = t({
        initialize: function(e) {
            this.tabview = e,
            this.element = $('<div class="theme-values"></div>'),
            this.changeThemeAlias = this.changeTheme.bind(this),
            this.changeValuesAlias = this.changeValues.bind(this),
            this.controls = {}
        },
        link: function(e) {
            this.widget = e,
            e.getTheme().on("themechange", this.changeThemeAlias),
            e.getTheme().on("valuechange", this.changeValuesAlias);
            var t = this;
            this.changeTheme(e.getTheme().getName()).done(function() {
                t.changeValues(e.getTheme().getValues())
            })
        },
        unlink: function(e) {
            e.getTheme().off("themechange", this.changeThemeAlias),
            e.getTheme().off("valuechange", this.changeValuesAlias),
            this.changeTheme(""),
            this.changeValues({}),
            this.widget = null
        },
        changeTheme: function(e) {
            var t = $.Deferred();
            if (this.widget) if (e) {
                var n = this;
                i.info(this.widget.getType(), e, this.widget.getPage()).done(function(e) {
                    n.renderParams(e && e.param),
                    t.resolve()
                })
            } else t.resolve(),
            this.hide();
            else t.resolve(),
            this.hide();
            return t.promise()
        },
        changeValues: function(e) {
            $.each(this.controls,
            function(t, i) {
                i.value(e[t])
            })
        },
        renderParams: function(e) {
            if (this.sections = {},
            this.controls = {},
            this.element.empty(), !e || !e.length) return this.hide(),
            void 0;
            var t = this;
            e.forEach(function(e) {
                var i, n, a = e.group || "其他",
                h = t.sections[a];
                h || (h = t.sections[a] = new s(a).appendTo(t.element)),
                i = h.addRow(),
                e.label && i.addCell().addLabel(e.label),
                n = c(e.type, {
                    value: e.value
                }),
                n.appendTo(i.addCell().getElement()),
                n.on("changestart",
                function() {
                    t.widget && t.widget.getTheme().captureValuesStart()
                }),
                n.on("change",
                function(i) {
                    if (t.widget) {
                        var n = t.widget.getTheme(),
                        s = n.getValues();
                        s[e.name] = i,
                        n.setValues(s),
                        t.tabview.showAction()
                    }
                }),
                n.on("changestop",
                function() {
                    t.widget && t.widget.getTheme().captureValuesEnd()
                }),
                t.controls[e.name] = n
            }),
            this.show()
        }
    },
    n),
    w = t({
        init: function(e) {
            return w.superclass.init.call(this, e),
            this.themes = new f(this).appendTo(this.element),
            this.content = $('<div class="content"></div>').appendTo(this.element),
            this.footer = $('<div class="footer"><a class="btn btn-primary btn-block action-new">保存为组件风格</a><a class="btn btn-primary btn-block action-saveas">风格另存为</a></div>').appendTo(this.element),
            this.scroller = new h(this.content),
            this.body = this.scroller.getBody(),
            this.name = "style",
            this.description = "样式",
            this.element.addClass(this.name),
            this.styles = new p(this).appendTo(this.body),
            this.values = new v(this).hide().appendTo(this.body),
            this.actionSaveas = this.footer.find(".action-saveas"),
            this.actionNew = this.footer.find(".action-new"),
            this.changeActionAlias = this.changeAction.bind(this),
            this.initStyleEvent(),
            this
        },
        initStyleEvent: function() {
            function e() {
                function e(e) {
                    return h.hasClass(m) ? (o.info("正在保存"), void 0) : (h.addClass(m), l.getWorkspace().saveData("/project/savewidgettheme", e).done(function(e) {
                        e.code ? o.error(e.message || "保存失败") : (i.registerTheme(s, e.theme.name, e.theme), t.themes.addTheme(e.theme), t.hideAction(), o.ok("保存成功"))
                    }).fail(function() {
                        o.error("保存失败")
                    }).always(function() {
                        h.removeClass(m)
                    }), void 0)
                }
                var n, s, a, h = this,
                d = {};
                if (t.widget) {
                    if (h.hasClass(m)) return o.info("正在保存"),
                    void 0;
                    if (n = t.widget.getTheme(), n.isSaved()) return o.info("该样式已保存"),
                    void 0;
                    s = t.widget.getType(),
                    a = n.getBase(),
                    i.info(s, a, t.widget.getPage()).done(function(t) {
                        d.name = n.getBase(),
                        d.type = s,
                        d.base = t.base || t.name,
                        d.value = $.extend(!0, {},
                        n.getValues()),
                        d.style = $.extend(!0, {},
                        n.getStyles()),
                        e(d)
                    }).fail(function() {
                        d.name = n.getBase(),
                        d.type = s,
                        d.style = $.extend(!0, {},
                        n.getStyles()),
                        e(d)
                    })
                }
            }
            var t = this;
            this.actionSaveas.click(e.bind(this.actionSaveas)),
            this.actionNew.click(e.bind(this.actionNew))
        },
        point: function(e) {
            return w.superclass.point.call(this, e) === !1 ? this: (this.widget && this.unlink(this.widget), this.widget = e, e && this.link(e), this)
        },
        link: function(e) {
            this.styles.link(e),
            this.themes.link(e),
            this.values.link(e),
            e.getTheme().on("themechange", this.changeActionAlias),
            this.changeAction(e.getTheme().getBase())
        },
        unlink: function(e) {
            this.themes.unlink(e),
            this.styles.unlink(e),
            this.values.unlink(e),
            e.getTheme().off("themechange", this.changeActionAlias)
        },
        changeAction: function(e) {
            e ? (this.actionSaveas.show(), this.actionNew.hide()) : (this.actionSaveas.hide(), this.actionNew.show())
        },
        showAction: function() {},
        hideAction: function() {
            this.element.removeClass("has-action")
        }
    },
    a);
    return new w
});