define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    i = require("diy/widget/setting"),
    o = require("diy/panel/tabview/setting"),
    n = require("control/options"),
    s = require("control/length"),
    l = require("control/color"),
    a = require("diy/panel/panel");
    require("./controller.css");
    var r = "divider";
    o.createSection(r, {
        initView: function() {
            var t = this,
            e = this.addRow(),
            i = e.addCell("options");
            i.addLabel("样式");
            var o = new n({
                options: [{
                    label: "实线",
                    classes: "border-style-solid",
                    value: "solid"
                },
                {
                    label: "虚线",
                    classes: "border-style-dashed",
                    value: "dashed"
                },
                {
                    label: "点线",
                    classes: "border-style-dotted",
                    value: "dotted"
                },
                {
                    label: "无",
                    classes: "border-style-none",
                    value: "none"
                }],
                uncheck: !1,
                width: 155
            });
            o.appendTo(i.getElement()),
            o.on("change",
            function(e) {
                t.applyToOutlet("style", e)
            }),
            this.styleField = o,
            e = this.addRow(),
            i = e.addCell("options"),
            i.addLabel("厚度");
            var a = new s({
                units: ["px"]
            });
            a.appendTo(i.getElement()),
            a.on("change",
            function(e) {
                t.applyToOutlet("height", e)
            }),
            this.widthField = a,
            i = this.addRow().addCell("options"),
            i.addLabel("颜色");
            var r = new l;
            r.appendTo(i.getElement()),
            r.on("change",
            function(e) {
                t.applyToOutlet("color", e)
            }),
            this.colorField = r
        },
        getTitle: function() {
            return "设置"
        },
        syncParamStyle: function(t) {
            this.styleField.value(t)
        },
        syncParamWidth: function(t) {
            this.widthField.value(t)
        },
        syncParamColor: function(t) {
            this.colorField.value(t)
        }
    });
    var d = t({
        setup: function(t) {
            {
                var e = this;
                e.getWidget()
            }
            this.getHrContainer(),
            this.setParamStyle(t.style || "solid"),
            this.setParamHeight(t.height || "1px"),
            this.setParamColor(t.color || "#ccc")
        },
        getHrContainer: function() {
            var t = this.getWidget(),
            e = t.getElement();
            this.hr = $("<hr>").appendTo(e)
        },
        getParamStyle: function() {
            return this._style
        },
        setParamStyle: function(t) {
            this._style = t,
            this.hr.css("border-top-style", t),
            this.emit("paramset", "style", t)
        },
        getParamHeight: function() {
            return this._height
        },
        setParamHeight: function(t) {
            this._height = t,
            this.hr.css("border-top-width", t),
            this.emit("paramset", "height", t)
        },
        getParamColor: function() {
            return this._color
        },
        setParamColor: function(t) {
            this._color = t,
            this.hr.css("border-top-color", t),
            this.emit("paramset", "color", t)
        },
        getName: function() {
            return r
        },
        toJSON: function() {
            return {
                style: this._style,
                height: this._height,
                color: this._color
            }
        }
    },
    i),
    h = t({
        setup: function(t) {
            var e = this.getWidget();
            this.dividerSetting = new d(e, t.params || {}),
            e.addOutlet(this.dividerSetting),
            e.on("dblclick",
            function() {
                a.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.dividerSetting.toJSON()
            }
        }
    },
    e);
    return h
});