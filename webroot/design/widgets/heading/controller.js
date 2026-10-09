define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    i = require("diy/panel/panel"),
    n = require("diy/panel/tabview/setting"),
    o = require("diy/widget/setting"),
    l = require("ui/linkdialog"),
    r = require("control/input"),
    a = require("control/size"),
    s = require("control/color"),
    h = "heading";
    n.createSection(h, {
        initView: function() {
            var t = this,
            e = this.addRow().addCell();
            e.addLabel("标题文字"),
            this.titleField = new r,
            this.titleField.appendTo(e.getElement()),
            this.titleField.on("change",
            function(e) {
                t.applyToOutlet("title", e)
            }),
            e = this.addRow("not-empty").addCell();
            var i = $('<input type="button" class="btn btn-primary btn-block" value="设置链接" />');
            i.appendTo(e.getElement()),
            i.click(function() {
                var e = t.getOutlet();
                e && l.edit(e.getParamLink(),
                function(t) {
                    e.setParam("link", t)
                })
            })
        },
        getTitle: function() {
            return "标题设置"
        },
        getClasses: function() {
            return h
        },
        syncParamTitle: function(t) {
            this.titleField.value(t)
        }
    });
    var c = t({
        setup: function(t) {
            this.setParamLink(t && t.link || ""),
            this.setParamTitle(t && t.title || "标题")
        },
        getName: function() {
            return h
        },
        applyTitleLink: function() {
            if (null != this.title) {
                var t = this.getWidget(),
                e = t.getElement().find("h2");
                if (this.link) {
                    var i = t.getPage().createElement("<a></a>").click(function(t) {
                        t.preventDefault()
                    });
                    i.attr(this.link),
                    e.html(i.html(this.title))
                } else e.html(this.title);
                e.prepend("<i></i>")
            }
        },
        setParamTitle: function(t) {
            this.title = (t || "").toString(),
            this.applyTitleLink(),
            this.emit("paramset", "title", t)
        },
        getParamTitle: function() {
            return this.title
        },
        setParamLink: function(t) {
            var e, i;
            e = t && (t.href || t.link) || "",
            i = t && t.target || "",
            this.link = e ? {
                href: e,
                target: i
            }: null,
            this.applyTitleLink(),
            this.emit("paramset", "link", this.link)
        },
        getParamLink: function() {
            return this.link
        },
        toJSON: function() {
            return {
                title: this.getParamTitle(),
                link: this.getParamLink()
            }
        }
    },
    o),
    u = "heading-style";
    n.createSection(u, {
        initView: function() {
            var t = this,
            e = this.addRow().addCell();
            e.addLabel("文字大小"),
            this.fontSizeField = new a,
            this.fontSizeField.appendTo(e.getElement()),
            this.fontSizeField.on("change",
            function(e) {
                t.applyToOutlet("fontSize", e)
            }),
            e = this.addRow().addCell(),
            e.addLabel("文字颜色"),
            this.colorField = new s({
                width: 151
            }),
            this.colorField.appendTo(e.getElement()),
            this.colorField.on("change",
            function(e) {
                t.applyToOutlet("color", e)
            }),
            e = this.addRow().addCell(),
            e.addLabel("悬停颜色"),
            this.hoverColorField = new s({
                width: 151
            }),
            this.hoverColorField.appendTo(e.getElement()),
            this.hoverColorField.on("change",
            function(e) {
                t.applyToOutlet("hoverColor", e)
            })
        },
        getTitle: function() {
            return "格式设置"
        },
        getClasses: function() {
            return u
        },
        syncParamFontSize: function(t) {
            this.fontSizeField.value(t)
        },
        syncParamColor: function(t) {
            this.colorField.value(t)
        },
        syncParamHoverColor: function(t) {
            this.hoverColorField.value(t)
        }
    });
    var d = t({
        setup: function(t) {
            var e = this.getWidget(),
            i = "#" + e.getId();
            this.cssRule = e.getPage().getCSSRule(i + " h2, " + i + " a"),
            this.cssRuleHover = e.getPage().getCSSRule(i + " h2 a:hover"),
            this.setParamFontSize(t && t["font-size"] || ""),
            this.setParamColor(t && t.color || ""),
            this.setParamHoverColor(t && t["hover-color"] || "")
        },
        getName: function() {
            return u
        },
        setParamFontSize: function(t) {
            this.fontSize = t || "",
            this.cssRule.setProperty("font-size", this.fontSize),
            this.emit("paramset", "fontSize", this.fontSize)
        },
        getParamFontSize: function() {
            return this.fontSize
        },
        setParamColor: function(t) {
            this.color = t || "",
            this.cssRule.setProperty("color", this.color),
            this.emit("paramset", "color", this.color)
        },
        getParamColor: function() {
            return this.color
        },
        setParamHoverColor: function(t) {
            this.hoverColor = t || "",
            this.cssRuleHover.setProperty("color", this.hoverColor),
            this.emit("paramset", "hoverColor", this.hoverColor)
        },
        getParamHoverColor: function() {
            return this.hoverColor
        },
        toJSON: function() {
            return {
                "font-size": this.getParamFontSize(),
                color: this.getParamColor(),
                "hover-color": this.getParamHoverColor()
            }
        }
    },
    o),
    g = t({
        setup: function(t) {
            var e = this.getWidget(),
            n = e.getElement();
            n.append('<i class="middle"></i><h2></h2>'),
            e.on("dblclick",
            function() {
                i.toSettingTab()
            }),
            this.titleSetting = new c(e, t.params),
            this.styleSetting = new d(e, t.params),
            e.addOutlet(this.titleSetting),
            e.addOutlet(this.styleSetting)
        },
        handleMouseDown: function() {},
        toJSON: function() {
            return {
                params: $.extend({},
                this.titleSetting.toJSON(), this.styleSetting.toJSON())
            }
        }
    },
    e);
    return g
});