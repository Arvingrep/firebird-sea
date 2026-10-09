define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    i = require("diy/widget/setting"),
    n = require("diy/panel/tabview/setting"),
    a = require("ui/linkdialog"),
    s = require("control/options"),
    r = require("control/input"),
    o = require("control/length"),
    h = require("diy/panel/panel");
    require("./controller.css");
    var l = "button";
    n.createSection(l, {
        initView: function() {
            var t = this,
            e = this.addRow("button-panel-add"),
            i = $('<input value="添加/更改链接" class="add" type="button" />').appendTo(e.getElement());
            i.on("click",
            function(e) {
                e.preventDefault();
                var i = t.getOutlet();
                a.edit({
                    href: i.getParamLink().href,
                    target: i.getParamLink().target
                },
                function(t) {
                    t ? i.setParam("link", {
                        href: t.href,
                        target: t.target || ""
                    }) : i.setParam("link", {
                        href: "javascript:void(0)",
                        target: ""
                    })
                })
            }),
            this.buttonField = i,
            e = this.addRow();
            var n = e.addCell("options");
            n.addLabel("文字");
            var h = new r;
            h.appendTo(n.getElement()),
            h.on("change",
            function(e) {
                t.applyToOutlet("text", e)
            }),
            this.textField = h,
            n = this.addRow().addCell("options"),
            n.addLabel("对齐");
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
            l.appendTo(n.getElement()),
            l.on("change",
            function(e) {
                t.applyToOutlet("align", e)
            }),
            this.alignField = l,
            e = this.addRow(),
            n = e.addCell("options"),
            n.addLabel("宽度");
            var d = new o({
                units: ["px"]
            });
            d.appendTo(n.getElement()),
            d.on("change",
            function(e) {
                t.applyToOutlet("width", e)
            }),
            this.widthField = d
        },
        getTitle: function() {
            return "设置"
        },
        syncParamText: function(t) {
            this.textField.value(t)
        },
        syncParamAlign: function(t) {
            this.alignField.value(t)
        },
        syncParamWidth: function(t) {
            this.widthField.value(t)
        },
        syncParamHideLink: function(t) {
            t ? this.buttonField.hide() : this.buttonField.show()
        }
    });
    var d = t({
        setup: function(t) {
            {
                var e = this;
                e.getWidget()
            }
            this.getButtonContainer(),
            this.setParamText(t.text || "文字按钮"),
            this.setParamAlign(t.align || "center"),
            this.setParamWidth(t.width || "auto"),
            this.setParamLink(t.link || {}),
            this.setParamHideLink(t.hideLink || !1)
        },
        getButtonContainer: function() {
            var t = this.getWidget(),
            e = t.getElement();
            this.button = $('<a href="" class="w-button-container"><span class="w-button-text"><i class="middle"></i><b class="text"></b></span><i class="w-button-right"></i></a>').appendTo(e),
            this.button.on("click",
            function(t) {
                t.preventDefault()
            }),
            this.textField = this.button.find(".text")
        },
        getParamText: function() {
            return this._text
        },
        setParamText: function(t) {
            this._text = t,
            this.textField.text(t),
            this.emit("paramset", "text", t)
        },
        getParamAlign: function() {
            return this._align
        },
        setParamAlign: function(t) {
            this._align = t;
            var e = this.getWidget(),
            i = e.getElement();
            i.css("text-align", t),
            this.emit("paramset", "align", t)
        },
        getParamWidth: function() {
            return this._width
        },
        setParamWidth: function(t) {
            this._width = t,
            this.button.find(".w-button-text").css("width", t),
            this.emit("paramset", "width", t)
        },
        getParamLink: function() {
            return {
                href: this._href,
                target: this._target
            }
        },
        setParamLink: function(t) {
            this._href = t.href,
            this._target = t.target,
            this.button.attr("href", t.href),
            this.button.attr("target", t.target)
        },
        getParamHideLink: function() {
            return this._hideLink || !1
        },
        setParamHideLink: function(t) {
            this._hideLink = t ? !0 : !1,
            this.emit("paramset", "hideLink", this._hideLink)
        },
        getName: function() {
            return l
        },
        toJSON: function() {
            return {
                text: this._text,
                align: this._align,
                link: this.getParamLink(),
                width: this._width
            }
        }
    },
    i),
    u = t({
        setup: function(t) {
            var e = this.getWidget();
            this.buttonSetting = new d(e, t.params || {}),
            e.addOutlet(this.buttonSetting),
            e.on("dblclick",
            function() {
                h.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.buttonSetting.toJSON()
            }
        }
    },
    e);
    return u
});