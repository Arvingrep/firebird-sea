define(function(require) {
    function t(t) {
        h.open({
            filter: "flash",
            success: t
        })
    }
    var a = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    e = require("diy/widget/setting"),
    s = require("diy/panel/tabview/setting"),
    h = (require("diy/runtime"), require("ui/dialog"), require("ui/explorer")),
    n = require("control/options"),
    l = require("control/length"),
    r = require("diy/panel/panel");
    require("./controller.css");
    var o = "falsh";
    s.createSection(o, {
        initView: function() {
            var a, i = this,
            e = this.addRow("flash-panel-add"),
            s = $('<input value="添加/更改Flash" class="add" type="button" />');
            e.getElement().append(s),
            s.on("click",
            function(a) {
                a.preventDefault(),
                t(function(t) {
                    i.applyToOutlet("flash", t)
                })
            });
            var e = this.addRow();
            a = e.addCell("options"),
            a.addLabel("宽度");
            var h = new l({
                width: "60px"
            });
            h.appendTo(a.getElement()),
            h.on("change",
            function(t) {
                i.applyToOutlet("width", t)
            }),
            this.widthField = h,
            a = e.addCell("options"),
            a.addLabel("高度");
            var r = new l({
                width: "60px"
            });
            r.appendTo(a.getElement()),
            r.on("change",
            function(t) {
                i.applyToOutlet("height", t)
            }),
            this.heightField = r,
            a = this.addRow().addCell("options"),
            a.addLabel("对齐"),
            this.alignField = new n({
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
            }),
            this.alignField.appendTo(a.getElement()),
            this.alignField.on("change",
            function(t) {
                i.applyToOutlet("align", t)
            }),
            a = this.addRow().addCell(),
            a.addLabel("参数");
            var o = $('<textarea class="input" style="width:185px;"></textarea>').appendTo(a.getElement());
            o.blur(function(t) {
                var a = $(t.target).val();
                i.applyToOutlet("flashvars", a)
            }),
            this.varsField = o
        },
        syncParamFlash: function() {},
        syncParamHeight: function(t) {
            this.heightField.value(t)
        },
        syncParamWidth: function(t) {
            this.widthField.value(t)
        },
        syncParamAlign: function(t) {
            this.alignField.value(t)
        },
        syncParamFlashvars: function(t) {
            this.varsField.val(t)
        },
        getTitle: function() {
            return "设置"
        }
    });
    var g = a({
        setup: function(t) {
            {
                var a = this;
                a.getWidget()
            }
            this.setParamFlash(t.flash || ""),
            this.setParamAlign(t.align || "center"),
            this.setParamFlashvars(t.flashvars),
            this.setParamWidth(t.width || "500px"),
            this.setParamHeight(t.height || "300px"),
            this._flash || this.empty()
        },
        getParamFlash: function() {
            return this._flash
        },
        setParamFlash: function(t) {
            this._flash = t;
            var a = this.getFlash();
            t ? (a.attr("src", t), this.setParamAlign(this._align), this.setParamFlashvars(this._flashvars), this.setParamWidth(this._width), this.setParamHeight(this._height)) : this.empty(),
            this.emit("paramset", "flash", t)
        },
        getParamAlign: function() {
            return this._align
        },
        setParamAlign: function(t) {
            if (this._align = t, t) {
                var a = this.getFlash();
                "center" == t ? a.css("margin", "0 auto") : a.css("margin", ""),
                a.attr("align", t)
            } else this.getFlash().removeAttr("align");
            this.emit("paramset", "align", t)
        },
        getParamFlashvars: function() {
            return this._flashvars
        },
        setParamFlashvars: function(t) {
            this._flashvars = t,
            t ? this.getFlash().attr("flashvars", t) : this.getFlash().removeAttr("flashvars"),
            this.emit("paramset", "flashvars", t)
        },
        getParamWidth: function() {
            return this._width
        },
        setParamWidth: function(t) {
            this._width = t,
            this.getFlash().css("width", t || ""),
            this.emit("paramset", "width", t)
        },
        getParamHeight: function() {
            return this._height
        },
        setParamHeight: function(t) {
            this._height = t,
            this.getFlash().css("height", t || ""),
            this.emit("paramset", "height", t)
        },
        empty: function() {
            this.flash.remove(),
            this.flash = null
        },
        getFlash: function() {
            if (this.flash) return this.flash;
            var t = this.getWidget().getElement(),
            a = $("<embed></embed>").appendTo(t);
            return a.attr("quality", "high"),
            a.attr("allowScriptAccess", "never"),
            a.attr("allowNetworking", "internal"),
            a.attr("allowFullScreen", "true"),
            a.attr("wmode", "transparent"),
            a.attr("type", "application/x-shockwave-flash"),
            this.flash = a
        },
        getName: function() {
            return o
        },
        toJSON: function() {
            return {
                flash: this._flash,
                align: this._align,
                flashvars: this._flashvars,
                width: this._width,
                height: this._height
            }
        }
    },
    e),
    d = a({
        setup: function(t) {
            {
                var a = this.getWidget();
                a.getPage()
            }
            this.flashSetting = new g(a, t.params || {}),
            a.addOutlet(this.flashSetting),
            a.on("dblclick",
            function() {
                r.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.flashSetting.toJSON()
            }
        }
    },
    i);
    return d
});