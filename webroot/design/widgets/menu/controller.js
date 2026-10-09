define(function(require) {
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    function e() {}
    function i(t) {
        return {
            title: t.name,
            href: t.url,
            target: parseInt(t.islink, 10) ? "_blank": "",
            pageid: parseInt(t.pageid, 10) || null
        }
    }
    require("./controller.css");
    var n = require("class"),
    $ = require("jquery"),
    a = require("diy/widget/controller"),
    s = require("diy/panel/panel"),
    r = require("diy/panel/tabview/setting"),
    o = require("diy/widget/setting"),
    l = require("diy/runtime"),
    m = require("diy/emitter"),
    c = require("ui/template"),
    h = require("ui/scroller"),
	mu = require("diy/page/mutationhistory"),
    u = require("ui/message");
    require("ui/message"),
    require("ui/sortable");
    var d, f, g, obj = null, p = n({
        initialize: function() {
            this.render(),
            this._inited = !1,
            d || (d = document),
            f || (f = $(d))
        },
        render: function() {
            this.element = $('<div class="menu-dropbox"><div class="inner"><i class="arrow"></i></div></div>'),
            this.inner = this.element.find("> .inner"),
            this.arrow = this.inner.find("> .arrow")
        },
        edit: function(t, i, n) {
            var a = this._trigger;
            return $.isPlainObject(t) ? (this._trigger = t.trigger, this._align = t.align) : (this._trigger = t, this._align = null),
            a && a == this._trigger ? (this.hide(obj), void 0) : (this._callbackShow = $.isFunction(i) ? i: e, this._callbackHide = $.isFunction(n) ? n: e, this.element.appendTo(d.body), this.show(), void 0)
        },
        show: function() {
            var t = this;
            this._inited || (this._inited = !0, this._elementWidth = this.element.width(), this._elementHeight = this.element.height(), this._arrowWidth = this.arrow.width());
            var e = f.width(),
            i = f.height(),
            n = this._trigger.offset(),
            a = this._trigger.outerWidth(!0),
            s = this._trigger.outerHeight(!0),
            r = n,
            o = s;
            this._align && (r = this._align.offset(), o = this._align.outerHeight(!0));
            var l, m, c, h = 3;
            this.element.removeClass("top bottom"),
            r.top + o + this._elementHeight + h > i && r.top - this._elementHeight - h > 0 ? (this.element.addClass("top"), l = r.top - this._elementHeight - h) : (this.element.addClass("bottom"), l = r.top + o + h),
            m = Math.max(0, this._align ? r.left: n.left + a / 2 - this._elementWidth / 2),
            m = Math.min(e - this._elementWidth - h, m),
            c = Math.max(0, n.left + a / 2 - this._arrowWidth / 2 - m),
            c = Math.min(this._elementWidth - this._arrowWidth, c),
            this.element.css({
                left: m,
                top: l
            }),
            this.arrow.css({
                left: c
            }),
            this._callbackShow && this._callbackShow(),
            f.on("mousedown.dropbox",
            function(e) {
                var i; (!t._trigger || e.target != t.element[0] && e.target != t._trigger[0] && (i = $(e.target).parents()) && -1 == i.index(t.element) && -1 == i.index(t._trigger)) && (e.target.value == "添加自定义链接" || e.target.value == "添加页面链接" ? t.hide(obj) : t.hide(null))
            })
        },
        hide: function(ooo) {
            this.element.removeClass("top bottom"),
            this.element.detach(),
            this._callbackHide && this._callbackHide(),
            this._trigger = null,
            this._align = null,
			obj = ooo,
            f.off("mousedown.dropbox")
        }
    }),
    v = n({
        render: function() {
            function t() {
                var t = l.getWorkspace().getPages();
                e.content.empty(),
                t.forEach(function(t) {
                    var i = $('<div class="item" data-pageid="' + t.pageid + '"><span class="name">' + t.name + "</span></div>");
                    i.data("page", t),
                    i.appendTo(e.content)
                })
            }
            var e = this;
            v.superclass.render.call(this),
            this.element.height(500),
            this.pages = $('<div class="menu-pages menu-itemlist"></div>').appendTo(this.inner),
            this.scroller = new h(this.pages),
            this.content = this.scroller.getInner(),
            l.getWorkspace().on("pageupdate", t),
            t(),
            this.content.on("click", ".item:not(.disable)",
            function() {
                e.onpick($(this).closest(".item").data("page")),
                e.hide(null)
            })
        },
        edit: function(t, i, n, a, s) {
            this.data = i,
            this.onpick = $.isFunction(n) ? n: e,
            v.superclass.edit.call(this, t, a, s)
        },
        toggleItems: function() {
            var t = [];
            Array.isArray(this.data) && this.data.forEach(function(e) {
                var i = parseInt(e.pageid, 10);
                i && t.push(i)
            }),
            this.content.children().each(function(e, i) {
                i.dataset && i.dataset.pageid && (t.indexOf(parseInt(i.dataset.pageid, 10)) > -1 ? i.classList.add("disable") : i.classList.remove("disable"))
            })
        }
    },
    p);
    v.getInstance = function() {
        return g || (g = new v),
        g
    };
    var b, y = n({
        edit: function(i, n, a, s, r) {
            var o = this,
            l = this.form.find(":input").each(function() {
                var e = this.name,
                i = "syncParam" + t(e);
                i in o && o[i](n && n[e])
            });
            this.onsave = $.isFunction(a) ? a: e,
            y.superclass.edit.call(this, i, s, r),
            l.filter(":text").eq(0).focus()
        },
        toJSON: function() {}
    },
    p),
    w = n({
        render: function() {
            var t = this;
            w.superclass.render.call(this),
            this.element.height(95),
            this.form = $('<form class="menu-form"><input type="hidden" name="pageid" /><div class="row input"><label for="menu-form-title">标题</label><input type="text" name="title" id="menu-form-title" class="input" autocomplete="off" /></div><input type="hidden" name="href" /><div class="row action"><label class="checkbox"><input type="checkbox" name="target" value="_blank" />新页面打开</label><input type="submit" class="btn" value="确定" /></div></form>').appendTo(this.inner),
            this.form.submit(function() {
                var e = t.form[0].pageid.value;
                if (!e) return u.error("页面 ID 不能为空"),
                !1;
                var i = $.trim(t.form[0].title.value);
                return i ? (t.onsave({
                    pageid: e,
                    title: i,
                    href: t.form[0].href.value,
                    target: t.form[0].target.checked ? t.form[0].target.value: null
                }), t.hide(obj), !1) : (u.error("页面标题不能为空"), t.form[0].title.focus(), !1)
            })
        },
        syncParamTitle: function(t) {
            this.form[0].title.value = t || ""
        },
        syncParamHref: function(t) {
            this.form[0].href.value = t || ""
        },
        syncParamTarget: function(t) {
            this.form[0].target.checked = t ? !0 : !1
        },
        syncParamPageid: function(t) {
            this.form[0].pageid.value = t || ""
        }
    },
    y);
    w.getInstance = function() {
        return b || (b = new w),
        b
    };
    var _, k = n({
        render: function() {
            var t = this;
            k.superclass.render.call(this),
            this.element.height(130),
            this.form = $('<form class="menu-form"><div class="row input"><label for="menu-form-title">标题</label><input type="text" name="title" id="menu-form-title" autocomplete="off" class="input" /></div><div class="row input"><label for="menu-form-href">链接</label><input type="text" name="href" id="menu-form-href" autocomplete="off" class="input" /></div><div class="row action"><label class="checkbox"><input type="checkbox" name="target" value="_blank" />新页面打开</label><input type="submit" class="btn" value="确定" /></div></form>').appendTo(this.inner),
            this.form.submit(function() {
                var e = $.trim(t.form[0].title.value);
                if (!e) return u.error("链接标题不能为空"),
                t.form[0].title.focus(),
                !1;
                var i = $.trim(t.form[0].href.value);
                return i ? (t.onsave({
                    title: e,
                    href: t.form[0].href.value,
                    target: t.form[0].target.checked ? t.form[0].target.value: null
                }), t.hide(obj), !1) : (u.error("链接不能为空"), t.form[0].href.focus(), !1)
            })
        },
        syncParamTitle: function(t) {
            this.form[0].title.value = t || ""
        },
        syncParamHref: function(t) {
            this.form[0].href.value = t || ""
        },
        syncParamTarget: function(t) {
            this.form[0].target.checked = t ? !0 : !1
        }
    },
    y);
    k.getInstance = function() {
        return _ || (_ = new k),
        _
    };
    var I = n({
        initialize: function(t) {
            this.element = $('<div class="menu-itemlist normal-mode"></div>'),
            this.setItems(t),
            this._initListEvent()
        },
        _initListEvent: function() {
            var t = this;
            this.element.sortable({
                items: ".item",
                handle: ".sort",
                axis: "y",
                update: function() {
                    t.saveItems()
                }
            }),
            this.element.on("click", ".setting",
            function(e) {
                var i = $(e.target),
                //n = i.closest(".item"),
				n = $(this).parent().parent(),
                a = n.data("item"),
                s = a.pageid ? w.getInstance() : k.getInstance();

				if(n.attr('class') != "item"){
					obj = n.parent().parent().index();
				}

                return n.addClass("active"),
                t.setSettingMode(1),
                s.edit(i, a,
                function(e) {
                    t.updateItem(n, e),
                    n.removeClass("active"),
                    t.setSettingMode(0)
                },
                null,
                function() {
                    n.removeClass("active"),
                    t.setSettingMode(0)
                }),
                !1
            }),
			this.element.on("click", ".subnav",
            function(e) {
                var i = $(e.target),
                n = i.closest(".item");
                return n.addClass("active"),
                t.setSubnavMode(1),
				obj = n.index(),
				$("#pageLink").click(),
				t.setSubnavMode(0),
				n.removeClass("active"),
                !1
            }),
            this.element.on("click", ".delete",
            function(e) {
                var i = $(e.target),
                //n = i.closest(".item");
				n = $(this).parent().parent();
				if(n.attr('class') != "item"){
					obj = n.parent().parent().index();
				}
                return n.addClass("active"),
                t.setDeleteMode(1),
                i.confirm("确定要删除吗？",
                function() {
                    n.remove(),
                    t.setDeleteMode(0),
                    t.saveItems()
                },
                function() {
                    n.removeClass("active"),
                    t.setDeleteMode(0)
                }),
                !1
            })
        },
        getElement: function() {
            return this.element
        },
        renderItem: function(t) {
            var e = $('<div class="item"><span class="name ' + (t.pageid ? "page": "link") + '"><i></i>' + t.title + '</span><span class="actions"><i class="action sort" data-hint="拖动以排序"></i><i class="action setting" data-hint="设置"></i><i class="action subnav" data-hint="二级菜单"></i><i class="action delete" data-hint="删除"></i></span><ul></ul></div>');
            return e.data("item", t),
            e
        },
		renderSubItem: function(t) {
            var e = $('<li><span class="name ' + (t.pageid ? "page": "link") + '"><i></i>' + t.title + '</span><span class="actions"><i class="action sort_" data-hint="拖动以排序"></i><i class="action setting" data-hint="设置"></i><i class="action delete" data-hint="删除"></i></span></li>');
            return e.data("item", t),
            e
        },
        addItem: function(t, e) {
            var i = this.renderItem(t);
            return i.appendTo(this.element),
            e || this.saveItems(),
            i
        },
        addSubItem: function(v, e) {
            var t = this, i = t.renderSubItem(v);
			i.appendTo(t.element.find(".item").eq(obj).find("ul"));
            return e || t.saveItems(),
			obj = null,
            i
        },
        updateItem: function(t, e) {
            var i = obj != null ? this.renderSubItem(e) : this.renderItem(e);
            return t.replaceWith(i),
            this.saveItems(),
			obj = null,
            i
        },
        setItems: function(t) {
            var e = this;
            this.element.empty(),
            this.setDeleteMode(0),
            this.setSettingMode(0),
			this.setSubnavMode(0),
            document.body.click(),
            Array.isArray(t) && t.forEach(function(t, index) {
				e.addItem(t, !0)
				if(t.subnav){
					t.subnav.forEach(function(s) {
						obj = index;
                		e.addSubItem(s, !0)
					});
				}
            }),
            this.saveItems();

			//二级菜单排序
			e.element.find(".item").each(function(){
				if($(this).find("ul").html() != ""){
					if(!$(this).find("ul").data("sortable")){
						$(this).find("ul").sortable({
							items: "li",
							handle: ".sort_",
							axis: "y",
							update: function() {
								obj = 111;
								e.saveItems()
							}
						})
					}
				}
			})
        },
        saveItems: function() {
            var t = this.toJSON();
            (JSON.stringify(t) != JSON.stringify(this.data) || obj != null) && (this.data = t, this.emit("change", this.data))
        },
        setDeleteMode: function(t) {
            t ? this.element.removeClass("normal-mode").addClass("delete-mode") : this.element.removeClass("delete-mode").addClass("normal-mode")
        },
        setSettingMode: function(t) {
            t ? this.element.removeClass("normal-mode").addClass("setting-mode") : this.element.removeClass("setting-mode").addClass("normal-mode")
        },
		setSubnavMode: function(t) {
            t ? this.element.removeClass("normal-mode").addClass("subnav-mode") : this.element.removeClass("subnav-mode").addClass("normal-mode")
        },
        toJSON: function() {
            var t = [];
            return this.element.children().each(function() {
				var ul = $(this).find("ul"), arr = $(this).data("item"), index = $(this).index();
				arr.subnav = null;
				t.push(arr);
				if(ul.html() != ""){
					t[index]['subnav'] = [];
					ul.children().each(function() {
						t[index]['subnav'].push($(this).data("item"));
					})
				}
            }),
            t
        }
    });
    I.implement(m);
    var P = "menu";
    r.createSection(P, {
        initView: function() {
            var t, e, n = this;
            t = this.addRow(),
            e = t.addCell(),
            this.btnPage = $('<input type="button" class="btn btn-primary" value="添加页面链接" id="pageLink" />'),
            this.btnPage.appendTo(e.getElement()),
            this.btnPage.click(function() {
                return v.getInstance().edit({
                    trigger: n.btnPage,
                    align: n.btnPage
                },
                n.itemlist.toJSON(),
                function(t) {
					obj != null ? n.itemlist.addSubItem(i(t)) : n.itemlist.addItem(i(t));
                }),
                !1
            }),
            this.btnLink = $('<input type="button" class="btn btn-primary" value="添加自定义链接" style="margin-left: 10px;" />'),
            this.btnLink.appendTo(e.getElement()),
            this.btnLink.click(function() {
                return k.getInstance().edit({
                    trigger: n.btnLink,
                    align: n.btnLink
                },
                null,
                function(t) {
					obj != null ? n.itemlist.addSubItem(t) : n.itemlist.addItem(t);
                }),
                !1
            }),
            this.itemlist = new I,
            this.itemlist.on("change",
            function(t) {
                n.applyToOutlet("menus", t)
            }),
            this.getContent().append(this.itemlist.getElement())
        },
        getTitle: function() {
            return "导航菜单设置"
        },
        getClasses: function() {
            return P
        },
        syncParamMenus: function(t) {
            this.itemlist.setItems(t)
        }
    });
    var C = n({
        setup: function(t) {
            this.data = {},
            t && "menus" in t && this.setParamMenus(t.menus)
        },
        getName: function() {
            return P
        },
        getContainer: function() {
            if (this.container) return this.container;
            var t = '<div class="w-menu-container"></div>';
            return this.container = this.getWidget().getPage().createElement(t).appendTo(this.getWidget().getElement())
        },
        getMenu: function() {
            if (this.menu) return this.menu;
            var t = '<ul class="w-menu-list"></ul>';
            return this.menu = this.widget.getPage().createElement(t).appendTo(this.getContainer())
        },
        getTemplate: function() {
            if (this.template) return this.template;
            var t = '<li class="w-menu-item{%if index == 1%} w-menu-item-first{%endif%}{%if index == total%} w-menu-item-last{%endif%}{%if active%} active{%endif%}"><a href="{%item.href%}"{%if item.target%} target="{%item.target%}"{%endif%}>{%item.title%}</a>{%if subnav%}<ul class="w-submenu-list"></ul>{%endif%}</li>{%if index != total%}<li class="w-menu-divider"><span class="w-menu-divider-item"></span></li>{%endif%}';
            return this.template = new c(t),
            this.template
        },
        setParamMenus: function(t) {
            var e = this,
            i = this.getWidget(),
            n = i.getPage();
            if (Array.isArray(t) && t.length) {
                var a = this.getMenu().empty(),
                s = t.length,
                r = l.getWorkspace().getCurrentPage().getPageId();
                t.forEach(function(t, i) {
                    n.createElement(e.getTemplate().render({
                        active: r == t.pageid,
                        total: s,
                        index: i + 1,
                        item: t,
						subnav: t.subnav
                    })).click(function(t) {
                        t.preventDefault()
                    }).appendTo(a);
					if(t.subnav){
						t.subnav.forEach(function(s) {
							var submenu = '<li><a href="'+s.href+'"'+(s.target ? ' target="'+s.target+'"' : "")+'>'+s.title+'</a></li>';
							a.find("li.w-menu-item").eq(i).find(".w-submenu-list").append(submenu);
						});
					}
                }),
                this.data.menus = t
            } else this.container && this.container.detach(),
            this.data.menus = null;
			if(obj != null){
				this.getPage().getMutationHistory().log(new mu.Record("调整二级导航 " + JSON.stringify(t), function(){}, t, t));
			}
			obj = null;
            this.emit("paramset", "menus", this.data.menus)
        },
        getParamMenus: function() {
            return this.data.menus
        },
        toJSON: function() {
            return {
                menus: this.getParamMenus()
            }
        }
    },
    o),
    x = n({
        setup: function(t) {
            var e = this.getWidget();
            this.menuSetting = new C(e, t.params),
            e.addOutlet(this.menuSetting),
            e.on("dblclick",
            function() {
                s.toSettingTab()
            }),
            this.on("create",
            function() {
                s.toSettingTab()
            })
        },
        handleMouseDown: function() {},
        toJSON: function() {
            return {
                params: this.menuSetting.toJSON()
            }
        }
    },
    a);
    return x
});
