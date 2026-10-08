define(function(require) {
    require("./controller.css");
    var t = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    i = require("diy/panel/panel"),
    n = require("diy/panel/tabview/setting"),
    a = require("diy/widget/setting"),
    s = require("control/text-align"),
    l = require("control/input"),
    o = require("control/options"),
    r = require("ui/dialog"),
    d = require("ui/popmenu"),
    c = require("ui/explorer");
    require("ui/compo-updown"),
    require("ui/sortable");
    var p, m = "w-follow-align-",
    h = new RegExp("\\b" + m + "(left|center|right)\\b", "g"),
    u = "w-follow-size-",
    g = new RegExp("\\b" + u + "(small|middle|large)\\b", "g"),
    f = [{
        type: "tencent-weibo",
        text: "腾讯微博",
        placeholder: "例如 http://t.qq.com/huoniao",
        display: 1
    },
    {
        type: "sina-weibo",
        text: "新浪微博",
        placeholder: "例如 http://weibo.com/huoniao",
        display: 1
    },
    {
        type: "weixin",
        text: "微信",
        display: 1
    }],
    w = t({
        initialize: function(t) {
            t || (t = {}),
            t.width = 450,
            this.wrapper = $('<div class="ui-follow-dialog"><div class="ui-dialog-title draggable">' + (t.title || "关注选项") + '</div><form><div class="ui-follow-dialog-content"><div class="items"></div><div class="ui-follow-more"><input type="button" value="&nbsp;&nbsp;更多&nbsp;&nbsp;" class="btn"></div></div><div class="ui-dialog-footer"><span class="message"></span><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>');
            var e = this;
            this.form = this.wrapper.find("form").submit(function(t) {
                t.preventDefault();
                var i = [];
                e.form.find(".item").each(function(t, e) {
                    var n = $(e),
                    a = n.find("input[type]"),
                    s = n.data("item"),
                    l = $.trim(a.val()),
                    o = {};
                    (s.type == "weixin" || /^https?:\/\/.+/i.test(l)) && (o.type = s.type, o[a[0].name] = l, i.push(o))
                }),
                e.saveCallback ? e.saveCallback(i.length ? i: null) : e.container.trigger("dialog.save", [i]),
                e.close()
            }),
            this.followItemsContainer = this.wrapper.find(".items").sortable({
                handle: ".move",
                zIndex: 2e4,
                opacity: .7,
                axis: "y"
            }),
            this.btnMore = this.wrapper.find(".ui-follow-more .btn"),
            this.popmenu = new d(this.btnMore, {}),
            this.btnMore.click(function() {
                return e.popmenu.isVisible() ? e.popmenu.hide() : e.popmenu.show(),
                !1
            }),
            w.superclass.initialize.apply(this, [t])
        },
        addItem: function(t) {
            var e, i, n = this;
            if ("weixin" == t.type) {
                var a, s, l;
                t.src || (t.src = ""),
                e = $('<div class="item"><i class="move" data-hint="拖动以排序"></i><i class="icon ' + t.type + '"></i><span class="name">' + t.text + '</span><span class="text has-button"><label class="btn"><b class="pick">选择二维码</b><b class="repick">更换二维码</b></label><span class="result"></span></span><input type="hidden" name="src" /><i class="delete" data-hint="删除"></i></div>'),
                i = e.find("[name=src]").val(t.src),
                l = e.find(".result").text(t.src).attr("data-hint", t.src),
                a = e.find(".pick").click(function() {
                    c.open({
                        filter: "image",
                        success: function(t) {
                            i.val(t),
                            l.text(t).attr("data-hint", t),
                            a.hide(),
                            s.show()
                        }
                    })
                }),
                s = e.find(".repick").click(function() {
                    a.click()
                }),
                t.src ? a.hide() : s.hide(),
                e.bind("reset",
                function() {
                    i.val(""),
                    l.text("").attr("data-hint", ""),
                    a.show(),
                    s.hide()
                })
            } else t.href || (t.href = ""),
            e = $('<div class="item"><i class="move" data-hint="拖动以排序"></i><i class="icon ' + t.type + '"></i><span class="name">' + t.text + '</span><input class="input text" type="text" name="href" placeholder="' + t.placeholder + '" /><i class="delete" data-hint="删除"></i></div>'),
            i = e.find("[name=href]").val(t.href),
            e.bind("reset",
            function() {
                i.val("")
            });
            e.data("item", t),
            e.find(".delete").click(function() {
                return e.siblings().length ? (e.remove(), n.btnMore.show(), n.popmenu.showMenu(t.text), n.resize()) : e.trigger("reset"),
                !1
            }),
            e.appendTo(n.followItemsContainer),
            n.popmenu.hideMenu(t.text),
            n.followItemsContainer.children().length == f.length ? n.btnMore.hide() : n.btnMore.show(),
            n.resize()
        },
        findItem: function(t) {
            var e = null;
            return $.each(f,
            function(i, n) {
                return n.type == t.type ? (e = $.extend({},
                t, n), !1) : void 0
            }),
            e
        },
        renderItems: function(t) {
            Array.isArray(t) || (t = []);
            var e = this;
            e.followItemsContainer.empty(),
            e.popmenu.clearMenu(),
            $.each(f,
            function(i, n) {
                n = $.extend({},
                n),
                e.popmenu.addMenu(n.text,
                function() {
                    e.addItem(n)
                }),
                !t.length && n.display && e.addItem(n)
            }),
            $.each(t,
            function(t, i) {
                i = e.findItem(i),
                i && e.addItem(i)
            }),
            e.followItemsContainer.children().length == f.length ? e.btnMore.hide() : e.btnMore.show()
        },
        open: function(t, e) {
            this.renderItems(t),
            this.saveCallback = e,
            w.superclass.open.apply(this, [this.initialized ? null: this.wrapper]),
            this.initialized = !0
        },
        close: function() {
            this.popmenu.hide(),
            w.superclass.close.apply(this)
        }
    },
    r);
    w.getInstance = function() {
        return p || (p = new w),
        p
    };
    var v = "follow.follow";
    n.createSection(v, {
        initView: function() {
            var t, e, i = this;
            t = this.addRow(),
            e = t.addCell(),
            this.btnSet = $('<input type="button" class="btn btn-primary btn-block" value="添加或编辑" />'),
            this.btnSet.appendTo(e.getElement()),
            this.btnSet.click(function() {
                i.getOutlet().getWidget().callController("setItems")
            }),
            t = this.addRow("not-empty"),
            e = t.addCell("options"),
            e.addLabel("对齐方式"),
            this.fieldAlign = new s({
                width: 157
            }),
            this.fieldAlign.appendTo(e.getElement()),
            this.fieldAlign.on("change",
            function(t) {
                i.applyToOutlet("align", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell("options"),
            e.addLabel("图标大小"),
            this.fieldSize = new o({
                width: 157,
                value: "small",
                options: [{
                    label: "小",
                    value: "small"
                },
                {
                    label: "中",
                    value: "middle"
                },
                {
                    label: "大",
                    value: "large"
                }],
                uncheck: !1
            }),
            this.fieldSize.appendTo(e.getElement()),
            this.fieldSize.on("change",
            function(t) {
                i.applyToOutlet("size", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell(),
            e.addLabel("关注文字"),
            this.fieldText = new l({
                width: 157
            }),
            this.fieldText.appendTo(e.getElement()),
            this.fieldText.on("change",
            function(t) {
                i.applyToOutlet("text", t)
            }),
            this.notEmpties = this.element.find(".not-empty")
        },
        getTitle: function() {
            return "关注设置"
        },
        getClasses: function() {
            return "follow"
        },
        syncParamItems: function(t) {
            t ? this.notEmpties.appendTo(this.content) : this.notEmpties.detach()
        },
        syncParamAlign: function(t) {
            this.fieldAlign.value(t)
        },
        syncParamSize: function(t) {
            this.fieldSize.value(t)
        },
        syncParamText: function(t) {
            this.fieldText.value(t)
        }
    });
    var b = t({
        setup: function(t) {
            t && ("items" in t && this.setParamItems(t.items), "align" in t && this.setParamAlign(t.align), "size" in t && this.setParamSize(t.size), "text" in t && this.setParamText(t.text))
        },
        getName: function() {
            return v
        },
        getItemsContainer: function() {
            if (this.itemsContainer) return this.itemsContainer;
            var t = '<span class="w-follow-items"></span>';
            return this.itemsContainer = this.getWidget().getPage().createElement(t)
        },
        getTextContainer: function() {
            if (this.textContainer) return this.textContainer;
            var t = '<span class="w-follow-text"></span>';
            return this.textContainer = this.getWidget().getPage().createElement(t)
        },
        setParamItems: function(t) {
            var e = this.getWidget(),
            i = e.getElement(),
            n = this.getItemsContainer();
            Array.isArray(t) && t.length ? (n.empty().appendTo(i), $.each(t,
            function(t, e) {
                var i;
                i = "weixin" == e.type ? '<a class="w-follow-item ' + e.type + '" data-weixin="' + e.src + '"></a>': '<a class="w-follow-item ' + e.type + '" href="' + e.href + '" target="_blank"></a>',
                n.append(i)
            }), i.data("items", t)) : (n.detach(), i.removeData("items")),
            this.setParamText(this.getParamText()),
            this.emit("paramset", "items", t)
        },
        getParamItems: function() {
            return this.getWidget().getElement().data("items")
        },
        setParamAlign: function(t) {
            var e = this.getWidget(),
            i = e.getElement(),
            n = i[0].className;
            t = (t || "").toString(),
            i[0].className = n.replace(h, "") + (t ? " " + m + t: ""),
            i.data("align", t),
            this.emit("paramset", "align", t)
        },
        getParamAlign: function() {
            return this.getWidget().getElement().data("align") || "center"
        },
        setParamSize: function(t) {
            var e = this.getWidget(),
            i = e.getElement(),
            n = i[0].className;
            t = (t + "").toString(),
            i[0].className = n.replace(g, "") + (t ? " " + u + t: ""),
            i.data("size", t),
            this.emit("paramset", "size", t)
        },
        getParamSize: function() {
            return this.getWidget().getElement().data("size") || "middle"
        },
        setParamText: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t + "").toString(),
            t && this.getParamItems() ? this.getTextContainer().text(t).prependTo(i) : this.textContainer && this.textContainer.detach(),
            i.data("text", t),
            this.emit("paramset", "text", t)
        },
        getParamText: function() {
            return this.getWidget().getElement().data("text")
        },
        toJSON: function() {
            return {
                items: this.getParamItems(),
                align: this.getParamAlign(),
                size: this.getParamSize(),
                text: this.getParamText()
            }
        }
    },
    a),
    x = t({
        setup: function(t) {
            var e = this.getWidget();
            t.params || (t.params = {
                align: "center",
                size: "middle",
                text: "关注我们"
            }),
            this.followSetting = new b(e, t.params),
            e.addOutlet(this.followSetting),
            e.on("dblclick",
            function() {
                i.toSettingTab()
            })
        },
        isEmpty: function() {
            var t = this.followSetting.getParamItems();
            return ! t || !t.length
        },
        handleMouseDown: function() {
            return this.isEmpty() ? (this.setItems(), !1) : !0
        },
        setItems: function() {
            var t = this;
            w.getInstance().open(this.followSetting.getParamItems(),
            function(e) {
                t.followSetting.setParam("items", e)
            })
        },
        toJSON: function() {
            return {
                params: this.followSetting.toJSON()
            }
        }
    },
    e);
    return x
});
