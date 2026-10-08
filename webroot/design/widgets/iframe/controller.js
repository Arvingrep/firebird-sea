define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    e = require("diy/widget/setting"),
    a = require("diy/panel/tabview/setting"),
    n = require("ui/dialog"),
    r = (require("ui/videodialog"), require("ui/message")),
    s = require("control/options"),
    o = require("control/length"),
    l = require("diy/panel/panel");
    require("./controller.css");
    var h, d = t({
        initialize: function(t) {
            t || (t = {}),
            t.width = 450,
            this.wrapper = $('<div class="ui-iframe-dialog"><div class="ui-dialog-title draggable">' + (t.title || "框架页面") + '</div><form><div class="ui-iframe-dialog-content"><input class="input" type="text" name="src" placeholder="请输入框架地址,如http://www.kumanyun.com" /></div><div class="ui-dialog-footer"><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>');
            var i = this;
            this.form = this.wrapper.find("form").submit(function(t) {
                t.preventDefault();
                var e = i.form[0].src.value;
                return /^https?:\/\/.+/i.test(e) ? (i.saveCallback ? i.saveCallback(e) : i.container.trigger("dialog.save", [e]), i.close(), void 0) : (r.error("链接地址必须以 http:// 或 https:// 开头"), !1)
            }),
            d.superclass.initialize.apply(this, [t])
        },
        open: function(t, i) {
            this.form[0].src.value = t || "",
            this.saveCallback = i,
            d.superclass.open.apply(this, [this.initialized ? null: this.wrapper]),
            this.initialized = !0
        }
    },
    n);
    d.getInstance = function() {
        return h || (h = new d),
        h
    };
    var c = "iframe";
    a.createSection(c, {
        initView: function() {
            var t, i = this,
            e = this.addRow("iframe-panel-add"),
            a = $('<input value="添加/更改框架页面" class="add" type="button" />');
            e.getElement().append(a),
            a.on("click",
            function(t) {
                t.preventDefault(),
                d.getInstance().open(i._src,
                function(t) {
                    i.applyToOutlet("src", t)
                })
            });
            var e = this.addRow();
            t = e.addCell("options"),
            t.addLabel("宽度");
            var n = new o;
            n.appendTo(t.getElement()),
            n.on("change",
            function(t) {
                i.applyToOutlet("width", t)
            }),
            this.widthField = n;
            var e = this.addRow();
            t = e.addCell("options"),
            t.addLabel("高度");
            var r = new o({
                units: ["px"]
            });
            r.appendTo(t.getElement()),
            r.on("change",
            function(t) {
                i.applyToOutlet("height", t)
            }),
            this.heightField = r,
            t = this.addRow().addCell("options"),
            t.addLabel("滚动条"),
            this.alignField = new s({
                options: [{
                    label: "按需加载",
                    value: "auto"
                },
                {
                    label: "始终隐藏",
                    value: "hidden"
                }],
                uncheck: !1,
                width: 155
            }),
            this.alignField.appendTo(t.getElement()),
            this.alignField.on("change",
            function(t) {
                i.applyToOutlet("overflow", t)
            })
        },
        syncParamSrc: function(t) {
            this._src = t
        },
        syncParamOverflow: function(t) {
            this.alignField.value(t)
        },
        syncParamWidth: function(t) {
            this.widthField.value(t)
        },
        syncParamHeight: function(t) {
            this.heightField.value(t)
        },
        getTitle: function() {
            return "设置"
        }
    });
    var u = t({
        setup: function(t) {
            {
                var i = this;
                i.getWidget()
            }
            this.setParamSrc(t.src || ""),
            this.setParamOverflow(t.overflow || "auto"),
            this.setParamWidth(t.width || "100%"),
            this.setParamHeight(t.height || "300px"),
            this._src || this.empty()
        },
        getParamSrc: function() {
            return this._src
        },
        setParamSrc: function(t) {
            this._src = t;
            var i = this.getWidget(),
            e = i.getElement(),
            a = this.getIframe();
            t ? (a.attr("src", t), this.setParamOverflow(this._overflow), this.setParamWidth(this._width), this.setParamHeight(this._height), e.addClass("loading")) : this.empty(),
            this.emit("paramset", "src", t)
        },
        getParamOverflow: function() {
            return this._overflow
        },
        setParamOverflow: function(t) {
            this._overflow = t;
            var i = this.getIframe();
            "hidden" == t ? (i.attr("scrolling", "no"), i.css("overflow", "hidden")) : (i.removeAttr("scrolling"), i.css("overflow", "auto")),
            this.emit("paramset", "overflow", t)
        },
        getParamWidth: function() {
            return this._width
        },
        setParamWidth: function(t) {
            this._width = t,
            this.getIframe().css("width", t),
            this.emit("paramset", "width", t)
        },
        getParamHeight: function() {
            return this._height
        },
        setParamHeight: function(t) {
            this._height = t,
            this.getIframe().css("height", t),
            this.emit("paramset", "height", t)
        },
        getIframe: function() {
            if (this.iframe) return this.iframe;
            var t = this.getWidget(),
            i = t.getElement();
            return this.iframe = $('<iframe src="about:blank" frameborder="0" allowtransparency="true"></iframe>').appendTo(i),
            this.iframe.on("load",
            function() {
                i.removeClass("loading")
            }),
            this.iframe
        },
        empty: function() {
            this.iframe.remove(),
            this.iframe = null
        },
        getName: function() {
            return c
        },
        toJSON: function() {
            return {
                src: this._src,
                overflow: this._overflow,
                width: this._width,
                height: this._height
            }
        }
    },
    e),
    f = t({
        setup: function(t) {
            var i = this.getWidget();
            this.iframeSetting = new u(i, t.params || {}),
            i.addOutlet(this.iframeSetting),
            i.on("dblclick",
            function() {
                l.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.iframeSetting.toJSON()
            }
        }
    },
    i);
    return f
});
