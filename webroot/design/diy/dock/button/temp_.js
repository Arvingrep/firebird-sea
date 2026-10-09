define(function(require) {
	//加载模板
	function loadTempList(e){
		if(e.body){
			
			var id = e.panel.find("> .category-tabs li.active").attr("data-id");
			$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempList&jsoncallback=?", {projectid: window.PROJECTID, type: id}, function(data) {
				if(data.state == 100 && data.list){
					var list = data.list, div = [];
					for(var ii = 0; ii < list.length; ii++){
						div.push('<div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-image" data-id="'+list[ii].id+'" title="'+list[ii].title+'"><a><img src="'+cfg_attachment+list[ii].litpic+'" onload="this.style.visibility=\'visible\';" style="visibility: visible;"></a><span>'+list[ii].title+'</span></div>');
					}
					e.body.html(div.join(""));
					
				}else{
					e.body.html('<div class="loading">'+data.info+'</div>');
				}
			});

		}
	}
	
	function ee(e, t) {
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
	
    require("./temp.css");
    var i = require("class"),
    $ = require("jquery"),
    emitter = require("diy/emitter"),
	o = require("diy/readypromise"),
	clipboard = require("diy/clipboard"),
    a = require("ui/scroller"),
    n = require("./button"),
    s = require("ui/message"),
	u = require("diy/cursor"),
	d = require("diy/cssrule"),
	l = require("diy/shortcut"),
	snapshot = require("diy/snapshot"),
	drag = require("diy/page/draghandler"),
	v = require("diy/widget/widget"),
	p = require("diy/widget/theme"),
	hud = require("diy/page/hud"),
	h = require("diy/page/repainting"),
	m = require("diy/page/mutationhistory"),
	g = require("diy/page/outline"),
    runtime = require("diy/runtime");
    var r = "spinner",
    c = "active",
	y = window.sea,
    doc = $(document),
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
    });
	
    var f = i({
        setup: function() {
            var e, t = this,
            i = this.getElement();
            i.addClass("icon-temp large"),
            this.setHint("模板"),
            i.click(function() {
                e && clearTimeout(e),
                t.actived ? t.deactive() : t.active()
            }),
            this.ideactive = function(e) {
                t.confirm || t.panel[0].contains(e.target) || i[0].contains(e.target) || t.deactive()
            }
        },
        getName: function() {
            return "page"
        },
        initPanel: function() {
			var e = this;
			this.panel = $('<div class="diy-temp-panel"><h2>专题模板<i class="icon-close close"></i></h2><div class="category-tabs"></div><div class="content"></div></div>').appendTo(document.body),
			this.content = this.panel.find("> .content"),
			this.scroller = new a(this.content),
			this.body = this.scroller.getBody(),
			this.pages = $('<div class="loading">加载中...</div>').appendTo(this.body),
			this.pageid = location.hash.replace("#", "").toString();
				
			$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempType&jsoncallback=?", {projectid: window.PROJECTID}, function(t) {
				if(t.state == 100 && t.list){
					var list = t.list, ul = [];
					ul.push('<ul>');
					ul.push('  <li data-id="" class="active">全部</li>');
					for(var ii = 0; ii < list.length; ii++){
						ul.push('  <li data-id="'+list[ii].id+'">'+list[ii].typename+'</li>');
					}
					ul.push('</ul>');
					e.panel.find("> .category-tabs").html(ul.join(""));
					e.content.css({"top": e.panel.find("> .category-tabs").height()+55});
					if(list.length > 0){
						loadTempList(e);
					}else{
						e.body.html('<div class="loading">暂无模板！</div>');
					}
					
					$("li", e.panel.find("> .category-tabs")).bind("click", function(){
						if(!$(this).hasClass("active")){
							e.panel.find("> .category-tabs li").removeClass("active");
							$(this).addClass("active");
							e.body.html('<div class="loading">加载中...</div>');
							loadTempList(e);
						}
					});
					
				}else{
					e.body.html('<div class="loading">'+t.info+'</div>');
				}
			});
            this.panel.find("i.close").click(function() {
                e.deactive()
            });
			
			this.body.on("click", ".ui-explorer-mine-fileitem", function(){
				var id = $(this).attr("data-id");
				if(id){
					if(confirm("确定后将清空当前页面所有数据！\n注意：此操作不可恢复！！！\n\n确定要以此模板替换当前页面吗？")){
						$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempDetail&jsoncallback=?", {projectid: window.PROJECTID, tempid: id}, function(data) {
							if(data.state == 100 && data.html){
								
								$(".diy-canvas:visible").remove();

								e.workspace = runtime.workspace,
								e.getPageId = e.getPageId,
								e.pageid = e.pageid,
								e.uid = 0,
								e.canvas = $('<div class="diy-canvas"><iframe></iframe><div class="overlay"></div></div>').appendTo(e.workspace.getContainer()),
								e.view = e.canvas.find("iframe"),
								e.overlay = e.canvas.find(".overlay");
								var d = e.workspace.getPreloader();
								d.start().message("准备页面"),
								e.preloader = d;
								var c = y.getStamp();
								e.window = e.view[0].contentWindow,
								e.document = e.window.document,
								e.document.open(),
								e.document.write('<!doctype html><html><head><meta charset="utf-8" /><link rel="stylesheet" data-level="0" href="/design/base.css?' + c + '" /><link rel="stylesheet" data-level="0" href="/design/design.css?' + c + '" /><style id="page-style" type="text/css" data-level="10000"></style></head><body></body></html>'),
								e.document.close(),
								e.documentElement = e.document.documentElement,
								e.head = e.document.head,
								e.body = e.document.body,
								e.$ = e.jQuery = $.factory(e.window),
								e.$window = e.jQuery(e.window),
								e.$document = e.jQuery(e.document),
								e.$head = e.jQuery(e.head),
								e.$body = e.jQuery(e.body),
								e.$fragments = e.jQuery(e.document.createDocumentFragment()),
								e.pageSheet = e.document.getElementById("page-style").sheet,
								e.cssRules = {},
								e.widgetindex = {},
								e.levelMap = {};
								e.loader = y.factory(e.window, {
									config: "/design/pageconfig",
									stamp: c,
									mutator: function(t, i) {
										if (e.removed) return ! 0;
										var n = e.levelMap[i];
										if (delete e.levelMap[i], null != n && "LINK" === t.nodeName) {
											t.dataset.level = n;
											var o = ee(e.head, n);
											return o ? (e.head.insertBefore(t, o), !0) : void 0
										}
									}
								});
								runtime.on("designmodechange", o);
								runtime.on("movemodechange", s);
								o(runtime.isDesignMode());
								ss(runtime.isMoveMode());
								
								e.use(require.resolve("ui/mousetrap")).done(function(ee) {
									e.shortcut = new l(ee)
								});
								e.detach(function() {
									e.shortcut && e.shortcut.unbind(),
									e.shortcut = null,
									runtime.off("designmodechange", o),
									runtime.off("movemodechange", s),
									e.getReadyDeferred().rejectWith(e),
									e.window = null,
									e.document = null,
									e.documentElement = null,
									e.head = null,
									e.body = null,
									e.loader = null,
									e.jQuery = null,
									e.$window = null,
									e.$head = null,
									e.$body = null,
									e.$fragments.empty(),
									e.$fragments = null,
									e.$document.unbind().detach(),
									e.$document = null,
									e.widgetindex = {};
									for (var e in e.cssRules) e.cssRules[e] = null,
									delete e.cssRules[e];
									e.cssRules = null;
									for (var e in e.levelMap) e.levelMap[e] = null,
									delete e.levelMap[e];
									e.levelMap = null,
									e.canvas.remove()
								});
								
								e.removed || (d.incr(), r(data.html));
								e.ready(function() {
									e.documentElement.classList.add("diy-design-mode"),
									e.overlay.addClass("ready"),
									d.done();
									
									e.workspace.pageMap[e.pageid].page = e;
									e.workspace.currentPage = e;
									e.currentPage = e;
									e.currentPage.on("selectionchange", e),
									e.currentPage.show()
								})
								
								function o(ee) {
									e.documentElement.classList[ee ? "add": "remove"]("diy-design-mode")
								}
								function ss(ee) {
									e.documentElement.classList[ee ? "add": "remove"]("diy-move-mode")
								}
								
								function r(ee) {
									function t() {
										e.removed || (d.message("构建页面"), e.rootWidget = new v(e, ee, e.$body), e.rootWidget.ready(function() {
											e.outline = undefined;
											e.workspace.emit("selectionchange", e.rootWidget);
											e.focus(e.rootWidget);
										}), e.initEvent(), e.ready())
									}
									ee ? (ee = e.workspace.trMacro(ee), ee.type = "body", d.message("加载页面样式"), e.prefetch(ee).always(t)) : (ee = {
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
								
								e.deactive();
							}else{
								s.error(data.info);
							}
						});
					}
				}
			});
			
			runtime.getWorkspace().on("opend", function(t) {})
        },
		cloneWidget: function(e) {
            clipboard.add(e)
        },
		dragWidget: function(e, t) {
            this.emit("drag", e, t)
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
		getActiveWidget: function() {
            return this.activeWidget
        },
		getHud: function() {
            return this.hud || (this.hud = new hud(this))
        },
		getAliquotHud: function() {
            return this.ahud || (this.ahud = new hud.Aliquot(this))
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
		contains: function(e) {
            return this.documentElement.contains(e)
        },
		moveWidget: function(e) {
            if (this.isReady() && runtime.isDesignMode()) {
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
		initEvent: function() {
            function uu(ee) {
                ee.ctrlKey || ee.altKey ? (u.add("copy"), v = 1) : (u.remove("copy"), v = 0)
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
                if (runtime.isDesignMode()) {
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
            p = new drag(d,
            function(t, i) {
                d.hover(null),
                d.focus(null);
                var n = i.get("target");
                snapshot.show(n.getType()),
                runtime.setMoveMode(1),
                u.capture(h[0], t).add("move"),
                d.mask(n),
                uu(t),
                r = 1,
                h.on("keydown keyup", uu),
                l.on("keydown keyup", uu)
            },
            function(t) {
                r && (uu(t), r = 0),
                snapshot.move({
                    clientX: t.globalX,
                    clientY: t.globalY
                }),
                d.mark(t)
            },
            function(t, i) {
                snapshot.hide();
                var n = i.get("target");
                v ? (v = 0, d.insertWidget($.extend(!0, {},
                n.toJSON()))) : d.moveWidget(n),
                d.mask(null),
                l.off("keydown keyup", uu),
                h.off("keydown keyup", uu),
                runtime.setMoveMode(0),
                u.release()
            });
            this.on("drag",
            function(e, n) {
                runtime.isDesignMode() && (setTimeout(function() {
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
                !m && runtime.isDesignMode() && (i(), d.fixPoint(e, this), d.getOutline().getHover().isMouseOut(e) && d.hover(null))
            }),
            h.mouseenter(function() {
                g = 1,
                !m && runtime.isDesignMode() && n()
            }),
            h.mousedown(function(e) {
                runtime.isDesignMode() && (l.trigger(e).trigger("blur"), e.button || (setTimeout(function() {
                    var i = d.getActiveWidget();
                    i && i.isMovable() && i.contains(e.target) || (i = d.findMovable(e.target)),
                    i && i.handleMouseDown(e),
                    h.one("mouseup", t),
                    l.one("mouseup", t)
                },
                0), m = 1, i()))
            }),
            h.click(function(e) {
                runtime.isDesignMode() && d.focus(d.findWidget(e.target))
            }),
            h.dblclick(function(e) {
                if (runtime.isDesignMode()) {
                    var t = d.findWidget(e.target);
                    t && (d.fixPoint(e, this), t.emit("dblclick", e))
                }
            })
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
		mark: function(e) {
            if (this.isReady() && runtime.isDesignMode()) {
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
		paste: function(e) {
            this.insertWidget(e, 1)
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
		getDocument: function() {
            return this.$document
        },
		getOutline: function() {
            return this.outline || (this.outline = new g(this))
        },
		hover: function(e) {
            e && e !== this.activeWidget ? this.getOutline().getHover().point(e) : this.getOutline().getHover().hide()
        },
		focus: function(e) {
            this.hover(null),
			e !== this.activeWidget && (this.activeWidget && this.activeWidget.emit("blur"), this.activeWidget = e, this.activeWidget ? (this.activeWidget.emit("focus"), this.getOutline().getSelector().point(this.activeWidget)) : this.getOutline().getSelector().hide(), this.workspace.emit("selectionchange", e))
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
		detach: function(e) {
            return e ? (this.detachCallback || (this.detachCallback = $.Callbacks("once memory")), this.detachCallback.add(e)) : this.detachCallback && (this.detachCallback.fireWith(this), this.detachCallback = null),
            this
        },
		createElement: function(e) {
            return this.jQuery(e)
        },
		createWidget: function(e) {
            return new v(this, e)
        },
		getCSSRule: function(e) {
            return this.cssRules[e] || (this.cssRules[e] = new d(this.pageSheet, e))
        },
		removeCSSRule: function(e) {
            var t = e instanceof d ? e.getSelector() : null;
            t && this.cssRules[t] && (d.removeCSSRule(this.pageSheet, this.cssRules[t].getRule()), delete this.cssRules[t])
        },
		getWidgetIndex: function(e) {
			return this.widgetindex[e] ? ++this.widgetindex[e] : this.widgetindex[e] = 1
		},
		isRemoved: function() {
            return this.removed
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
		insertWidget: function(e, t) {
            if (this.isReady() && runtime.isDesignMode()) {
                var i, n = this.getMarker();
                if (n.isValid()) i = n.getPlace(),
                n.destory();
                else {
                    if (!t) return this.getOutline().getDropArea().hide(),
                    void 0;
                    i = (this.activeWidget || this.rootWidget).findPlace()
                }
                if (e = e || clipboard.getData()) {
                    var o = this.createWidget(e);
                    return this.getMutationHistory().log(new w(o)),
                    o.toPlace(i),
                    this.focus(o),
                    this.getOutline().getDropArea().hide(),
                    o
                }
            }
        },
		removeWidget: function(e) {
            this.getMutationHistory().log(new b(e)),
            e.remove()
        },
		getMarker: function() {
            return this.marker || (this.marker = new k(this))
        },
		recycle: function(e) {
            this.$fragments.append(e)
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
        active: function() {
            this.actived = 1,
            this.getElement().addClass(c),
            this.panel || this.initPanel(),
            this.panel.addClass("visible").fadeIn(200),
            doc.on("mousedown", this.ideactive)
        },
		remove: function() {
            this.removed = 1,
            this.hide(),
            this.detach()
        },
        deactive: function() {
            var e = this,
            t = $.Deferred();
            return e.actived = 0,
                e.getElement().removeClass(c),
                e.panel && e.panel.removeClass("visible").fadeOut(200),
                doc.off("mousedown", e.ideactive),
            	t.promise()
        },
        beforeSave: function() {
            return this.rootWidget.beforeSave()
        },
        toJSON: function() {
            return this.rootWidget.toJSON()
        }
    },
    n);
    return f.implement(o),
    f.implement(emitter),
	f
});