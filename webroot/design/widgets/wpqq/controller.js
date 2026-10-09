define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    a = require("diy/widget/setting"),
    e = require("diy/panel/tabview/setting"),
    n = (require("diy/runtime"), require("ui/dialog")),
    s = (require("ui/dragsort"), require("ui/imageditor"), require("control/options")),
    l = require("diy/panel/panel");
    require("ui/sortable"),
    require("./controller.css");
    var o = /[1-9][0-9]{4,}/,
    r = t({
        initialize: function(t, i) {
            this.controller = t,
            this.options = {
                width: 450,
                callback: i ||
                function() {}
            };
            var a = this.getWrapper();
            this.form = a.find("form").submit($.proxy(function(t) {
                t.preventDefault();
                var i = this.updateData();
                this.options.callback(i),
                a.find(".message").is(":hidden") && this.close()
            },
            this)).on("click", ".delete",
            function(t) {
                var i = $(t.target);
                i.parent().remove()
            }).on("keypress", "input[name=qq]",
            function(t) {
                var i = $(t.target),
                e = i.val();
                o.test(e) && a.find(".message").hide().html("")
            }),
            this.itemsContainer = a.find(".items").sortable({
                handle: ".move",
                zIndex: 2e4,
                opacity: .7,
                axis: "y"
            }),
            this.addButton = a.find(".input-add").click($.proxy(function() {
                this.addItem()
            },
            this)),
            r.superclass.initialize.apply(this, [this.options])
        },
        view: function() {
            return '<div class="ui-wpqq-dialog"><div class="ui-dialog-title draggable">QQ客服</div><form><div class="ui-wpqq-dialog-content"><div class="items"></div></div><div class="ui-dialog-footer"><div class="ui-wpqq-add"><input type="button" value="+ 增加项" class="btn input-add"></div><span class="message"></span><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>'
        },
        getWrapper: function() {
            return this.wapper || (this.wapper = $(this.view()))
        },
        render: function(t) {
            $.each(t, $.proxy(function(t, i) {
                this.addItem(i)
            },
            this))
        },
        addItem: function(t) {
            var i = '<div class="item"><i class="move" data-hint="拖动以排序"></i><input class="input" type="text" placeholder="QQ号码" name="qq" value=""/><input class="input" type="text" placeholder="QQ昵称或自定义描述" name="alias" value=""/><i  data-hint="删除" class="delete"></i></div>',
            a = $(i);
            t && ($("input[name=qq]", a).val(t.qq), $("input[name=alias]", a).val(t.alias)),
            this.form.find(".items").append(a),
            this.getWrapper().find(".message").hide().html(""),
            setTimeout(function() {
                $("input[name=qq]", a).focus()
            },
            50)
        },
        open: function(t) {
            this.form.find(".items").empty(),
            Array.isArray(t) && t.length && this.render(t),
            this.addItem(),
            r.superclass.open.call(this, this.initialized ? null: this.getWrapper()),
            this.initialized = !0
        },
        close: function() {
            r.superclass.close.call(this)
        },
        updateData: function() {
            var t = [],
            i = this.itemsContainer.find(">.item"),
            a = this.getWrapper().find(".message");
            return $.each(i, $.proxy(function(i, e) {
                var n = $(e),
                s = n.find("[name=qq]").val(),
                l = n.find("[name=alias]").val(),
                r = o.test(s);
                if (s.length) if (r) {
                    var d = {};
                    d.qq = s,
                    d.alias = l,
                    t[t.length] = d,
                    a.hide().html("")
                } else a.show().html("请输入有效的QQ号码"),
                n.find("[name=qq]").focus()
            },
            this)),
            t
        }
    },
    n),
    d = "wpqq";
    e.createSection(d, {
        initView: function() {
            var t, i = this,
            a = this.addRow("wpqq-panel-add"),
            e = $('<input value="添加/编辑" class="add" type="button" />');
            a.getElement().append(e),
            e.on("click",
            function(t) {
                t.preventDefault(),
                i.getOutlet().getDialog().open(i.getOutlet()._qq)
            }),
            t = this.addRow().addCell("options"),
            t.addLabel("展示");
            var n = new s({
                options: [{
                    label: "横向",
                    value: "horizontal"
                },
                {
                    label: "纵向",
                    value: "vertical"
                },
                {
                    label: "悬浮",
                    value: "fixed"
                }],
                uncheck: !1,
                width: 155
            });
            n.appendTo(t.getElement()),
            n.on("change",
            function(t) {
                i.applyToOutlet("layout", t)
            }),
            this.layoutField = n,
            this.alignRow = this.addRow(),
            t = this.alignRow.addCell("options"),
            t.addLabel("对齐");
            var l = new s({
                options: [{
                    label: "居左",
                    value: "left"
                },
                {
                    label: "居中",
                    value: "center"
                },
                {
                    label: "居右",
                    value: "right"
                }],
                uncheck: !1,
                width: 155
            });
            l.appendTo(t.getElement()),
            l.on("change",
            function(t) {
                i.applyToOutlet("align", t)
            }),
            this.alignField = l
        },
        syncParamAlign: function(t) {
            this.alignField.value(t)
        },
        syncParamLayout: function(t) {
            this.layoutField.value(t),
            "fixed" == t ? this.alignRow.hide() : this.alignRow.show()
        },
        syncParamQq: function(t) {
            this.qq = t
        },
        getTitle: function() {
            return "设置"
        }
    });
    var p = t({
        setup: function(t) {
            this.setParamQq(t.qq || []),
            this.setParamLayout(t.layout || "horizontal"),
            this.setParamAlign(t.align || "left")
        },
        getParamQq: function() {
            return this._qq
        },
        setParamQq: function(t) {
            this._qq = t,
            this._qq.length ? this.setParamLayout(this._layout) : this.render(),
            this.emit("paramset", "qq", t)
        },
        getParamLayout: function() {
            return this._layout
        },
        setParamLayout: function(t) {
            this._layout = t,
            this.render(),
            this.setParamAlign(this._align),
            this.emit("paramset", "layout", t)
        },
        getParamAlign: function() {
            return this._align
        },
        setParamAlign: function(t) {
            if ("fixed" != this._layout) {
                this._align = t;
                var i = $(".wpqq-wrap", this.getWidget().getElement());
                switch (t) {
                case "left":
                    i.removeClass("wpqq-wrap-right ").css("margin-left", 0);
                    break;
                case "right":
                    i.addClass("wpqq-wrap-right ").css("margin-left", 0);
                    break;
                default:
                    i[0].className = "wpqq-wrap",
                    i.css("display", "inline-block");
                    var a = (i.parent().innerWidth(), i.outerWidth());
                    "horizontal" == this._layout && (a = 0, i.children().each(function(t, i) {
                        a += $(i).outerWidth()
                    })),
                    this._qq.length ? i.css({
                        "margin-left": "auto",
                        "margin-right": "auto",
                        width: a + "px"
                    }) : i.css({
                        "margin-left": "0"
                    }),
                    this.getWidget().getElement().attr("data-width", a),
                    i.css("display", "block")
                }
                this.emit("paramset", "align", t)
            }
        },
        getName: function() {
            return d
        },
        render: function() {
            var t = this.getWidget().getElement();
            t.empty();
            var i = this._layout,
            a = $('<div class="wpqq-wrap"></div>'),
            e = this._qq;
            $.each(e,
            function(t, e) {
                var n = '<div class="wpqq-item"><a target="_blank" href="http://wpa.qq.com/msgrd?v=3&uin=' + e.qq + '&site=qq&menu=yes"><div class="img"><img border="0" src="http://wpa.qq.com/pa?p=2:' + e.qq + ':52" alt="点击这里给我发消息" title="点击这里给我发消息"/></div><span class="alias">' + e.alias + "</span></a></div>",
                s = $(n);
                a.append(s),
                "horizontal" === i ? s.addClass("wpqq-item-float") : s.removeClass("wpqq-item-float"),
                s.on("click", "a",
                function(t) {
                    t.preventDefault()
                })
            }),
            t.append(a),
            "fixed" === i && (a.addClass("wpqq-wrap-fixed"), $('<div class="wpqq-wrap-head"></div>').appendTo(a), $('<div class="wpqq-wrap-fixed-content"></div>').append(a.find(".wpqq-item")).appendTo(a), t.append($('<div class="placeholder-info"><span>QQ客服已经启用了悬浮模式</span></div>')))
        },
        getDialog: function() {
            var t = this;
            return this.dialog || (this.dialog = new r(this,
            function(i) {
                t.setParam("qq", i)
            }))
        },
        toJSON: function() {
            return {
                qq: this._qq,
                layout: this._layout,
                align: this._align,
                width: this.getWidget().getElement().attr("data-width")
            }
        }
    },
    a),
    u = t({
        setup: function(t) {
            {
                var i = this.getWidget();
                i.getPage()
            }
            this.WpqqSetting = new p(i, t.params || {}),
            i.addOutlet(this.WpqqSetting),
            i.on("dblclick",
            function() {
                l.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.WpqqSetting.toJSON()
            }
        }
    },
    i);
    return u
});