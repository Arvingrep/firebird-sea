define(function(require) {
    function e(e) {
        return e += "",
        e.substr(0, 1).toUpperCase() + e.substr(1)
    }
    function t(e) {
        return void 0 !== e && null !== e
    }
    require("./page.css");
    var i = require("class"),
    $ = require("jquery"),
    a = require("ui/scroller"),
    s = require("ui/message"),
    n = require("./button"),
    o = require("diy/runtime");
    require("ui/sortable");
    var r = "spinner",
    c = "active",
    l = "setting",
    d = $(document),
    p = i({
        getElement: function() {
            return this.panel
        },
        initPanel: function() {
            this.panel = $('<div class="diy-page-panel form"><h2><span class="title"></span><i class="icon-close close"></i></h2><div class="content"></div></div>').appendTo(document.body),
            this.content = this.panel.find("> .content"),
            this.scroller = new a(this.content),
            this.body = this.scroller.getBody(),
            this.form = $('<form><div class="fieldset"><div class="row name"><label for="form-name">页面名称</label><input type="text"class="input"id="form-name"/></div><div class="row alias"><label for="form-alias">文件名</label><input type="text"class="input"id="form-alias"style="width:100px;"/><span class="ext">.html</span></div></div><div class="fieldset"><h3 class="legend">SEO设置</h3><div class="row title"><label for="form-title">标题</label><input type="text"class="input"id="form-title"/></div><div class="row keywords"><label for="form-keywords">关键词</label><input type="text"class="input"id="form-keywords"/></div><div class="row description"><label for="form-description">描述</label><textarea class="input"id="form-description"style="height:80px;"></textarea></div></div><div class="actions"><input type="submit"value="添加"class="action submit"/></div></form>').appendTo(this.body),
            this.title = this.panel.find("> h2 > .title");
            var e = this.change.bind(this);
            this.fieldName = this.form.find("#form-name").change(e),
            this.fieldAlias = this.form.find("#form-alias").change(e),
            this.fieldTitle = this.form.find("#form-title").change(e),
            this.fieldKeywords = this.form.find("#form-keywords").change(e),
            this.fieldDescription = this.form.find("#form-description").change(e),
            this.buttonSubmit = this.form.find(".submit");
            var t = this;
            this.panel.find("i.close").click(function() {
                t.deactive()
            });
        },
        create: function() {
            var e = this,
            t = $.Deferred();
            return this.creating ? t.reject() : this.cancel().done(function() {
                e.promise && e.promise.reject(),
                e.promise = t,
                e.creating = 1,
                e.actived || e.active(),
                e.syncParams(),
                e.fieldName.focus(),
                e.form.unbind().submit(function() {
                    return e.form.hasClass(r) ? !1 : (e.form.addClass(r), o.getWorkspace().saveData("/include/"+Module+".inc.php?action=createPage", {
                        name: e.fieldName.val(),
                        alias: e.fieldAlias.val(),
                        title: e.fieldTitle.val(),
                        keywords: e.fieldKeywords.val(),
                        description: e.fieldDescription.val()
                    }).done(function(e) {
                        e.code ? s.error(e.message || "创建失败") : (s.ok("创建成功"), o.getWorkspace().addPage(e.page), t.resolve())
                    }).fail(function() {
                        s.error("创建失败")
                    }).always(function() {
                        e.form.removeClass(r)
                    }), !1)
                })
            }),
            t.promise()
        },
        edit: function(e, t) {
            var i = this,
            a = $.Deferred();
            return this.cancel().done(function() {
                i.promise && i.promise.reject(),
                i.promise = a,
                i.editing = 1,
                i.actived || i.active(),
                i.syncParams(t),
                i.fieldName.focus(),
                i.form.unbind().submit(function() {
                    return i.form.hasClass(r) ? !1 : i.changed ? (i.form.addClass(r), o.getWorkspace().saveData("/include/"+Module+".inc.php?action=updatePage", {
                        pageid: i.pageid,
                        name: i.fieldName.val(),
                        alias: i.fieldAlias.val(),
                        title: i.fieldTitle.val(),
                        keywords: i.fieldKeywords.val(),
                        description: i.fieldDescription.val()
                    }).done(function(e) {
                        e.code ? s.error(e.message || "保存失败") : (s.ok("保存成功"), o.getWorkspace().updatePage(e.page), a.resolve())
                    }).fail(function() {
                        s.error("保存失败")
                    }).always(function() {
                        i.form.removeClass(r)
                    }), !1) : (a.resolve(), i.deactive(), !1)
                })
            }),
            a.promise()
        },
        syncParams: function(t) {
            $.isPlainObject(t) || (t = {}),
            ["pageid", "name", "alias", "title", "keywords", "description"].forEach(function(i) {
                this["setParam" + e(i)](t[i])
            },
            this),
            this.changed = !1
        },
        setParamPageid: function(e) {
            this.pageid = e,
            this.buttonSubmit.val(e ? "保存": "添加"),
            this.title.text(e ? "设置页面": "添加页面")
        },
        setParamIslink: function(e) {
            e = Boolean(e),
            this.islink = e
        },
        setParamName: function(e) {
            this.fieldName.val(t(e) ? e: "")
        },
        setParamAlias: function(e) {
            this.fieldAlias.val(t(e) ? e: ""),
            this.fieldAlias.prop("disabled", "index" == e)
        },
        setParamTitle: function(e) {
            this.fieldTitle.val(t(e) ? e: "")
        },
        setParamKeywords: function(e) {
            this.fieldKeywords.val(t(e) ? e: "")
        },
        setParamDescription: function(e) {
            this.fieldDescription.val(t(e) ? e: "")
        },
        change: function() {
            this.changed = !0
        },
        cancel: function(e) {
            var t = $.Deferred();
            return e ? (this.creating = 0, this.editing = 0, this.form && this.form.removeClass(r), t.resolve()) : (this.creating && (this.creating = 0), this.editing && (this.editing = 0), this.form && this.form.removeClass(r), t.resolve()),
            t.promise()
        },
        active: function() {
            this.actived = 1,
            this.panel || this.initPanel(),
            this.panel.addClass("visible")
        },
        deactive: function(e) {
            var t = this,
            i = $.Deferred();
            return this.cancel(e).done(function() {
                t.actived = 0,
                t.promise && (t.promise.reject(), t.promise = null),
                t.panel && t.panel.removeClass("visible"),
                i.resolve()
            }),
            i.promise()
        }
    });
    p = new p;
    var f = i({
        setup: function() {
            var e, t = this,
            i = this.getElement();
            i.addClass("icon-page large"),
            this.setHint("页面"),
            i.click(function() {
                e && clearTimeout(e),
                t.actived ? t.deactive() : t.active()
            }),
            i.hover(function() {
                e && clearTimeout(e),
                e = setTimeout(function() {
                    t.showPageTips()
                },
                500)
            },
            function() {
                e && clearTimeout(e),
                e = null
            }),
            this.ideactive = function(e) {
                t.confirm || t.panel[0].contains(e.target) || i[0].contains(e.target) || p.getElement() && p.getElement()[0].contains(e.target) || t.deactive()
            }
        },
        getName: function() {
            return "page"
        },
        initPanel: function() {
            var e = this;
            this.panel = Module != "special" ? $('<div class="diy-page-panel"><h2>页面<i class="icon-close close"></i></h2><div class="actions"><a class="action add"><i class="icon-add"></i>添加页面</a></div><div class="content"></div></div>').appendTo(document.body) : $('<div class="diy-page-panel"><h2>页面<i class="icon-close close"></i></h2><div class="content" style="top:45px;"></div></div>').appendTo(document.body),
            this.content = this.panel.find("> .content"),
            this.scroller = new a(this.content),
            this.body = this.scroller.getBody(),
            this.pages = $('<div class="items pages"></div>').appendTo(this.body),
            this.templates = $('<div class="items templates"></div>').hide().appendTo(this.body),
            this.renderPages(),
            o.getWorkspace().on("pageupdate", this.renderPages.bind(this)),
            this.pages.sortable({
                items: ".item:gt(0)",
                handle: "> i",
                axis: "y",
                update: function() {
                    var t = [],
                    i = {},
                    a = 1;
                    e.pages.children().each(function() {
                        var e = parseInt(this.dataset.pageid, 10);
                        e && (t.push({
                            pageid: e,
                            sort: a
                        }), i["sort[" + e + "]"] = a, a += 1)
                    }),
                    e.pages.addClass(r),
                    o.getWorkspace().saveData("/include/"+Module+".inc.php?action=updateSort", i).done(function(e) {
                        e.code ? s.error(e.message || "排序保存失败") : (o.getWorkspace().updatePagesSort(t), s.ok("排序保存成功"))
                    }).fail(function() {
                        s.error("排序保存失败")
                    }).always(function() {
                        e.pages.removeClass(r)
                    })
                }
            }),
            this.renderTemplates(),
            o.getWorkspace().on("templateupdate", this.renderTemplates.bind(this)),
            this.panel.find(".action.add").click(function() {
                p.create()
            }),
            this.pages.on("click", ".page",
            function() {
                var t = $(this).closest(".page");
                e.deactive().done(function() {
                    s.hide(),
                    o.getWorkspace().openPage(t.data("pageid"))
                })
            }),
            this.templates.on("click", ".template",
            function() {
                var t = $(this).closest(".template");
                e.deactive().done(function() {
                    s.hide(),
                    o.getWorkspace().openPage(t.data("pageid"))
                })
            }),
            o.getWorkspace().on("opend",
            function(t) {
                e.activeElement && e.activeElement.removeClass(c),
                e.activeElement = e.body.find("[data-pageid=" + t + "]").addClass(c),
                e.showPageTips()
            }),
            this.pages.on("click", "i.setting",
            function() {
                var e = $(this).closest(".page");
                return e.hasClass(l) ? !1 : (e.addClass(l), p.edit(e, e.data("page")).always(function() {
                    e.removeClass(l)
                }), !1)
            }),
            this.pages.on("click", "i.copy",
            function() {
                var t = $(this).closest(".page"),
                i = t.data("pageid");
                return e.content.addClass(r),
                o.getWorkspace().requestData("/include/"+Module+".inc.php?action=clonePage&pageid=" + i).done(function(e) {
                    e.code ? s.error(e.message || "拷贝失败") : (s.ok("拷贝成功"), o.getWorkspace().addPage(e.page))
                }).fail(function() {
                    s.error("拷贝失败")
                }).always(function() {
                    e.content.removeClass(r)
                }),
                !1
            }),
            this.pages.on("click", "i.delete",
            function() {
                var t = $(this),
                i = t.closest(".page"),
                a = i.data("pageid");
                if (!i.hasClass("focus")) return i.addClass("focus"),
                e.confirm = !0,
                t.confirm("操作不可恢复, 确定要删除该页面吗？",
                function() {
                    e.content.addClass(r),
                    o.getWorkspace().requestData("/include/"+Module+".inc.php?action=deletePage&pageid=" + a).done(function(e) {
                        e.code ? s.error(e.message || "删除失败") : (s.ok("删除成功"), o.getWorkspace().deletePage(a))
                    }).fail(function() {
                        s.error("删除失败")
                    }).always(function() {
                        i.removeClass("focus"),
                        e.content.removeClass(r)
                    })
					e.confirm = !1
                },
                function() {
                    e.confirm = !1,
                    i.removeClass("focus")
                }),
                !1
            }),
            this.panel.find("i.close").click(function() {
                e.deactive()
            })
        },
        renderPages: function() {
            var e = this;
            p.deactive(!0).done(function() {
                e.pages.empty(),
                o.getWorkspace().getPages().forEach(function(t) {
                    0 == parseInt(t.islink, 10) && t.appname == undefined && e.renderPage(t).appendTo(e.pages)
                })
            })
        },
        renderPage: function(e) {
            var t = "index" == e.alias,
            i = $('<div class="item page" data-pageid="' + e.pageid + '"><i' + (t ? "": ' data-hint="上下拖动以排序"') + ' class="icon-page"></i><span class="title">' + e.name + '</span><span class="commands"><i class="icon-setting setting" data-hint="设置"></i>' + (Module != "special" ? '<i class="icon-copy copy" data-hint="拷贝"></i>' : "") + (t ? "": '<i class="icon-delete delete" data-hint="删除"></i>') + "</span></div>"),
            a = o.getWorkspace().getCurrentPage().pageid;
            return e.pageid === a && (this.activeElement = i.addClass(c)),
            i.data("page", e)
        },
        renderTemplates: function() {
            var e = this;
            this.templates.empty(),
            o.getWorkspace().getTemplates().forEach(function(t) {
                e.renderTemplate(t).appendTo(e.templates)
            }),
            this.templates.children().length ? this.templates.show() : this.templates.hide()
        },
        renderTemplate: function(e) {
            var t = $('<div class="item template" data-pageid="' + e.pageid + '"><i class="icon-template"></i><span class="title">' + e.appname + " - " + e.name + '</span><span class="badge">应用模板</span></div>'),
            i = o.getWorkspace().getCurrentPage().pageid;
            return e.pageid === i && (this.activeElement = t.addClass(c)),
            t.data("page", e)
        },
        showPageTips: function() {
            var e = o.getWorkspace(),
            t = e.getCurrentPage().getPageId();
            s.info("正在编辑：" + e.getPageInfo(t).name)
        },
        active: function() {
            this.actived = 1,
            this.getElement().addClass(c),
            this.panel || this.initPanel(),
            this.panel.addClass("visible"),
            d.on("mousedown", this.ideactive)
        },
        deactive: function() {
            var e = this,
            t = $.Deferred();
            return p.deactive().done(function() {
                e.actived = 0,
                e.getElement().removeClass(c),
                e.panel && e.panel.removeClass("visible"),
                d.off("mousedown", e.ideactive),
                t.resolve()
            }),
            t.promise()
        }
    },
    n);
    return f
});