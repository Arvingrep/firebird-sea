define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    e = require("diy/panel/panel"),
    n = require("diy/panel/tabview/setting"),
    a = require("diy/widget/setting"),
    h = require("control/size"),
    g = require("control/text-align"),
    s = require("ui/mapdialog"),
    d = 5,
    l = 1024,
    o = 530,
    r = 340,
    m = "map.map";
    n.createSection(m, {
        initView: function() {
            var t, i, e = this;
            t = this.addRow(),
            i = t.addCell(),
            this.btnSet = $('<input type="button" class="btn btn-primary btn-block" value="标注地图" />'),
            this.btnSet.appendTo(i.getElement()),
            this.btnSet.click(function() {
                e.getOutlet().getWidget().callController("pickPoint")
            }),
            t = this.addRow("not-empty width-height"),
            i = t.addCell(),
            i.addLabel("宽度"),
            this.fieldWidth = new h({
                width: 62,
                min: d,
                max: l,
                defaultUnit: null,
                units: []
            }),
            this.fieldWidth.appendTo(i.getElement()),
            this.fieldWidth.on("change",
            function(t) {
                e.applyToOutlet("width", t)
            }),
            i = t.addCell(),
            i.addLabel("高度"),
            this.fieldHeight = new h({
                width: 62,
                min: d,
                max: l,
                defaultUnit: null,
                units: []
            }),
            this.fieldHeight.appendTo(i.getElement()),
            this.fieldHeight.on("change",
            function(t) {
                e.applyToOutlet("height", t)
            }),
            t = this.addRow("not-empty"),
            i = t.addCell("options"),
            i.addLabel("对齐方式"),
            this.fieldAlign = new g({
                width: 157
            }),
            this.fieldAlign.appendTo(i.getElement()),
            this.fieldAlign.on("change",
            function(t) {
                e.applyToOutlet("align", t)
            }),
            this.notEmpties = this.element.find(".not-empty")
        },
        getTitle: function() {
            return "地图设置"
        },
        getClasses: function() {
            return "map"
        },
        syncParamPoint: function(t) {
            t ? this.notEmpties.appendTo(this.content) : this.notEmpties.detach()
        },
        syncParamWidth: function(t) {
            this.fieldWidth.value(t)
        },
        syncParamHeight: function(t) {
            this.fieldHeight.value(t)
        },
        syncParamAlign: function(t) {
            this.fieldAlign.value(t)
        }
    });
    var p = t({
        setup: function(t) {
            t && ("point" in t && this.setParamPoint(t.point), "align" in t && this.setParamAlign(t.align), "width" in t && this.setParamWidth(t.width), "height" in t && this.setParamHeight(t.height))
        },
        getName: function() {
            return m
        },
        getMap: function() {
            return this.map || (this.map = this.getWidget().getPage().createElement("<a><img/></a>").click(function(t) {
                t.preventDefault()
            }))
        },
        updateMap: function() {
            var t = this.getMap(),
            i = this.getParamPoint(),
            e = this.getParamWidth(),
            n = this.getParamHeight();
            i && i.image && t.find("img").attr("src", i.image + "&width=" + e + "&height=" + n)
        },
        setParamPoint: function(t) {
            var i = this.getWidget(),
            e = i.getElement();
            $.isPlainObject(t) ? (this.getMap().attr({
                href: t.link,
                target: "_blank"
            }).appendTo(e), e.data("point", t), this.updateMap()) : (this.map && this.map.detach(), e.removeData("point")),
            this.emit("paramset", "point", t)
        },
        getParamPoint: function() {
            return this.getWidget().getElement().data("point")
        },
        setParamWidth: function(t) {
            var i = this.getWidget(),
            e = i.getElement();
            t = parseInt(t, 10),
            d > t && (t = d),
            t > l && (t = l),
            e.data("width", t),
            this.updateMap(),
            this.emit("paramset", "width", t)
        },
        getParamWidth: function() {
            return this.getWidget().getElement().data("width") || o
        },
        setParamHeight: function(t) {
            var i = this.getWidget(),
            e = i.getElement();
            t = parseInt(t, 10),
            d > t && (t = d),
            t > l && (t = l),
            e.data("height", t),
            this.updateMap(),
            this.emit("paramset", "height", t)
        },
        getParamHeight: function() {
            return this.getWidget().getElement().data("height") || r
        },
        setParamAlign: function(t) {
            var i = this.getWidget(),
            e = i.getElement();
            t = (t || "").toString(),
            e.css("text-align", t),
            e.data("text-align", t),
            this.emit("paramset", "align", t)
        },
        getParamAlign: function() {
            return this.getWidget().getElement().data("text-align") || "center"
        },
        toJSON: function() {
            return {
                point: this.getParamPoint(),
                align: this.getParamAlign(),
                width: this.getParamWidth(),
                height: this.getParamHeight()
            }
        }
    },
    a),
    u = t({
        setup: function(t) {
            var i = this.getWidget();
            t.params || (t.params = {
                align: "center",
                width: o,
                height: r
            }),
            this.mapSetting = new p(i, t.params),
            i.addOutlet(this.mapSetting),
            i.on("dblclick",
            function() {
                e.toSettingTab()
            })
        },
        isEmpty: function() {
            return this.mapSetting.getParamPoint() ? !1 : !0
        },
        handleMouseDown: function() {
            return this.isEmpty() ? (this.pickPoint(), !1) : !0
        },
        pickPoint: function() {
            var t = this,
            i = s.getInstance();
            i.rebind("save",
            function(i) {
                t.mapSetting.setParam("point", i)
            }),
            i.open(this.mapSetting.getParamPoint())
        },
        toJSON: function() {
            return {
                params: this.mapSetting.toJSON()
            }
        }
    },
    i);
    return u
});