define(function(require) {
    require("./design.css"),
    require("./controller.css");
    var e = require("class"),
    $ = require("jquery"),
    t = require("diy/widget/controller"),
    i = require("diy/panel/panel"),
    a = require("diy/panel/tabview/setting"),
    n = require("diy/widget/setting"),
    s = require("control/options"),
    l = require("control/text-align"),
    r = require("ui/dialog");
    require("ui/tab");
    var d, o = {
        icon: [1, 2, 3],
        button: [1, 2, 3, 4, 5, 6, 7, 8],
        text: [1, 2],
        slide: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    h = e({
        initialize: function(e) {
            e || (e = {}),
            this.wrapper = $('<div class="ui-share-dialog"><div class="ui-dialog-title draggable">' + (e.title || "分享组件样式") + '</div><form><div class="ui-share-dialog-content"><ul class="ui-tab-triggers"><li class="ui-tab-trigger">图标</li><li class="ui-tab-trigger">按钮</li><li class="ui-tab-trigger">文字</li><li class="ui-tab-trigger">浮动</li></ul><div class="ui-tab-content" data-type="icon"></div><div class="ui-tab-content" data-type="button"></div><div class="ui-tab-content" data-type="text"></div><div class="ui-tab-content" data-type="slide"></div></div><div class="ui-dialog-footer"><a class="action action-default">使用默认样式</a><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>');
            var t = this,
            i = null;
            this.shareContent = this.wrapper.find(".ui-share-dialog-content"),
            this.shareContent.tab({
                afterActive: function(e, i, a) {
                    if (!a.data("inited")) {
                        a.data("inited", !0);
                        var n = a.data("type"),
                        s = o[n];
                        s && s.length && (a.addClass(n), $.each(s,
                        function(e, i) {
                            var s = n + " " + n + "-" + (e + 1),
                            l = $('<div class="w-share-item ' + s + '"><i class="w-share-sample ' + s + '"></i></div>'),
                            r = $('<input type="radio" name="w_share_item" />').prependTo(l);
                            l.attr({
                                "data-type": n,
                                "data-name": i
                            }),
                            l.appendTo(a),
                            l.on("check",
                            function() {
                                r.prop("checked", !0),
                                l.addClass("active"),
                                t.share = {
                                    type: n,
                                    name: i
                                }
                            }),
                            l.on("uncheck",
                            function() {
                                r.prop("checked", !1),
                                l.removeClass("active"),
                                t.share = null
                            }),
                            t.share && t.share.type == n && t.share.name == i && l.trigger("check")
                        }))
                    }
                }
            }),
            this.shareContent.on("itemchange",
            function(e, a) {
                i && i.trigger("uncheck"),
                a && (i = t.shareContent.find("[data-type=" + a.type + "][data-name=" + a.name + "]"), i.length && i.trigger("check"))
            }),
            this.shareContent.on("mouseup",
            function(e) {
                e.stopPropagation();
                var i = $(e.target).closest(".w-share-item");
                i.length && t.shareContent.trigger("itemchange", [{
                    type: i.data("type"),
                    name: i.data("name")
                }])
            });
            var a = this.wrapper.find("form").submit(function(e) {
                e.preventDefault(),
                t.container.trigger("dialog.save", [t.share || null]),
                t.close()
            });
            this.wrapper.find(".action-default").click(function() {
                t.share = null,
                a.submit()
            }),
            h.superclass.initialize.apply(this, [e])
        },
        open: function(e) {
            this.share = e && e.type ? e: null,
            this.shareContent.trigger("itemchange", [this.share]),
            h.superclass.open.apply(this, [this.initialized ? null: this.wrapper]),
            this.initialized = !0
        }
    },
    r);
    h.getInstance = function() {
        return d || (d = new h),
        d
    };
    var c = "share.share";
    a.createSection(c, {
        initView: function() {
            var e, t, i = this;
            e = this.addRow(),
            t = e.addCell(),
            this.btnSet = $('<input type="button" class="btn btn-primary btn-block" value="设置样式" />'),
            this.btnSet.appendTo(t.getElement()),
            this.btnSet.click(function() {
                i.getOutlet().getWidget().callController("chooseShare")
            }),
            e = this.addRow("common"),
            t = e.addCell("options"),
            t.addLabel("对齐方式"),
            this.fieldAlign = new l({
                width: 157
            }),
            this.fieldAlign.appendTo(t.getElement()),
            this.fieldAlign.on("change",
            function(e) {
                i.applyToOutlet("align", e)
            }),
            e = this.addRow("common"),
            t = e.addCell("options"),
            t.addLabel("分享次数"),
            this.fieldNumber = new s({
                width: 157,
                value: "1",
                options: [{
                    label: "显示",
                    value: "1"
                },
                {
                    label: "隐藏",
                    value: "0"
                }],
                uncheck: !1
            }),
            this.fieldNumber.appendTo(t.getElement()),
            this.fieldNumber.on("change",
            function(e) {
                i.applyToOutlet("number", e)
            }),
            e = this.addRow("common"),
            t = e.addCell("options"),
            t.addLabel("菜单大小"),
            this.fieldMini = new s({
                width: 157,
                value: "0",
                options: [{
                    label: "一栏",
                    value: "1"
                },
                {
                    label: "两栏",
                    value: "0"
                }],
                uncheck: !1
            }),
            this.fieldMini.appendTo(t.getElement()),
            this.fieldMini.on("change",
            function(e) {
                i.applyToOutlet("mini", e)
            }),
            e = this.addRow("slide"),
            t = e.addCell("options"),
            t.addLabel("浮窗位置"),
            this.fieldSlidePosition = new s({
                width: 157,
                value: "right",
                options: [{
                    label: "左侧",
                    value: "left"
                },
                {
                    label: "右侧",
                    value: "right"
                }],
                uncheck: !1
            }),
            this.fieldSlidePosition.appendTo(t.getElement()),
            this.fieldSlidePosition.on("change",
            function(e) {
                i.applyToOutlet("slidePosition", e)
            }),
            e = this.addRow("slide"),
            t = e.addCell("options"),
            t.addLabel("浮窗大小"),
            this.fieldSlideMini = new s({
                width: 157,
                value: "0",
                options: [{
                    label: "一栏",
                    value: "1"
                },
                {
                    label: "两栏",
                    value: "0"
                }],
                uncheck: !1
            }),
            this.fieldSlideMini.appendTo(t.getElement()),
            this.fieldSlideMini.on("change",
            function(e) {
                i.applyToOutlet("slideMini", e)
            }),
            this.commons = this.content.find(".common"),
            this.slides = this.content.find(".slide")
        },
        getTitle: function() {
            return "分享设置"
        },
        getClasses: function() {
            return "share"
        },
        syncParamShare: function(e) {
            e && "slide" == e.type ? (this.slides.appendTo(this.content), this.commons.detach()) : (this.slides.detach(), this.commons.appendTo(this.content))
        },
        syncParamAlign: function(e) {
            this.fieldAlign.value(e)
        },
        syncParamNumber: function(e) {
            this.fieldNumber.value(e)
        },
        syncParamMini: function(e) {
            this.fieldMini.value(e)
        },
        syncParamSlidePosition: function(e) {
            this.fieldSlidePosition.value(e)
        },
        syncParamSlideMini: function(e) {
            this.fieldSlideMini.value(e)
        }
    });
    var g = e({
        setup: function(e) {
            e && ("share" in e && this.setParamShare(e.share), "align" in e && this.setParamAlign(e.align), "number" in e && this.setParamNumber(e.number), "mini" in e && this.setParamMini(e.mini), "slidePosition" in e && this.setParamSlidePosition(e.slidePosition), "slideMini" in e && this.setParamSlideMini(e.slideMini))
        },
        getName: function() {
            return c
        },
        getShareItem: function() {
            if (this.shareItem) return this.shareItem;
            var e = "<i></i>";
            return this.shareItem = this.getWidget().getPage().createElement(e)
        },
        getSlideItem: function() {
            if (this.slideItem) return this.slideItem;
            var e = '<div class="w-share-slide"><p>分享组件已经启用了浮动模式</p><div class="w-share-slide-fixed"></div></div>';
            return this.slideItem = this.getWidget().getPage().createElement(e)
        },
        setParamShare: function(e) {
            var t = this.getWidget(),
            i = t.getElement();
            $.isPlainObject(e) || (e = {
                type: "icon",
                name: "1"
            });
            var a, n = this.getShareItem(),
            s = this.getSlideItem(),
            l = "w-share-sample " + e.type + " " + e.type + "-" + e.name;
            "slide" == e.type ? (n.detach(), a = s.find(".w-share-slide-fixed"), a.removeClass().addClass("w-share-slide-fixed " + l), s.appendTo(i)) : (s.detach(), n.removeClass().addClass(l), n.appendTo(i)),
            i.data("share", e),
            this.emit("paramset", "share", e)
        },
        getParamShare: function() {
            return this.getWidget().getElement().data("share") || {
                type: "icon",
                name: "1"
            }
        },
        setParamAlign: function(e) {
            var t = this.getWidget(),
            i = t.getElement();
            e = (e || "").toString(),
            i.css("text-align", e),
            i.data("text-align", e),
            this.emit("paramset", "align", e)
        },
        getParamAlign: function() {
            return this.getWidget().getElement().data("text-align")
        },
        setParamNumber: function(e) {
            var t = this.getWidget(),
            i = t.getElement();
            e = (e || "").toString(),
            i.data("number", e),
            this.emit("paramset", "number", e)
        },
        getParamNumber: function() {
            return this.getWidget().getElement().data("number")
        },
        setParamMini: function(e) {
            var t = this.getWidget(),
            i = t.getElement();
            e = (e || "").toString(),
            i.data("mini", e),
            this.emit("paramset", "mini", e)
        },
        getParamMini: function() {
            return this.getWidget().getElement().data("mini")
        },
        setParamSlidePosition: function(e) {
            var t = this.getWidget(),
            i = t.getElement(),
            a = this.getSlideItem().find(".w-share-slide-fixed");
            e = (e || "").toString(),
            "left" == e ? a.addClass("left") : a.removeClass("left"),
            i.data("slidePosition", e),
            this.emit("paramset", "slidePosition", e)
        },
        getParamSlidePosition: function() {
            return this.getWidget().getElement().data("slidePosition")
        },
        setParamSlideMini: function(e) {
            var t = this.getWidget(),
            i = t.getElement();
            e = (e || "").toString(),
            i.data("slideMini", e),
            this.emit("paramset", "slideMini", e)
        },
        getParamSlideMini: function() {
            return this.getWidget().getElement().data("slideMini")
        },
        toJSON: function() {
            return {
                share: this.getParamShare(),
                align: this.getParamAlign(),
                number: this.getParamNumber(),
                mini: this.getParamMini(),
                slidePosition: this.getParamSlidePosition(),
                slideMini: this.getParamSlideMini()
            }
        }
    },
    n),
    u = e({
        setup: function(e) {
            e.params || (e.params = {
                share: {
                    type: "icon",
                    name: "1"
                },
                align: "center",
                number: "1",
                mini: "0",
                slidePosition: "right",
                slideMini: "0"
            });
            var t = this.getWidget();
            this.shareSetting = new g(t, e.params),
            t.addOutlet(this.shareSetting),
            t.on("dblclick",
            function() {
                i.toSettingTab()
            })
        },
        handleMouseDown: function() {},
        chooseShare: function() {
            var e = this,
            t = h.getInstance();
            t.rebind("save",
            function(t) {
                e.shareSetting.setParam("share", t)
            }),
            t.open(this.shareSetting.getParamShare())
        },
        toJSON: function() {
            return {
                params: this.shareSetting.toJSON()
            }
        }
    },
    t);
    return u
});