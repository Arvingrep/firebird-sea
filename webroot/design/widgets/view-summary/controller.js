define(function(require) {
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    var e = require("class"),
    n = require("widgets/area/controller"),
    a = require("diy/panel/panel"),
    i = require("diy/panel/tabview/setting"),
    u = require("diy/widget/setting"),
    m = require("control/size"),
    r = "这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。这里将显示文章的摘要。",
    s = "app-view-summary-general";
    i.createSection(s, {
        initView: function() {
            var t, e = this;
            t = this.addRow().addCell(),
            t.addLabel("摘要字数限制"),
            this.summaryNumField = new m({
                units: null,
                negative: !1,
                width: "60px"
            }),
            this.summaryNumField.appendTo(t.getElement()),
            this.summaryNumField.on("change",
            function(t) {
                e.applyToOutlet("summaryNum", t)
            })
        },
        getTitle: function() {
            return "显示设置"
        },
        getClasses: function() {
            return s
        },
        syncParamSummaryNum: function(t) {
            this.summaryNumField.value(t)
        }
    });
    var o = e({
        setup: function(e) {
            if (e) for (var n in e) {
                var a = this["setParam" + t(n)];
                "function" == typeof a && a.call(this, e[n])
            }
        },
        getName: function() {
            return s
        },
        setParamSummaryNum: function(t) {
            this.summaryNum = parseInt(t, 10);
            var e = this.getWidget(),
            n = e.getElement();
            n.html(this.summaryNum ? r.substr(0, this.summaryNum) : r),
            this.emit("paramset", "summaryNum", this.summaryNum)
        },
        getParamSummaryNum: function() {
            return this.summaryNum || 0
        },
        toJSON: function() {
            return {
                summaryNum: this.getParamSummaryNum()
            }
        }
    },
    u),
    l = e({
        setup: function(t) {
            var e = this.getWidget();
            e.on("dblclick",
            function() {
                a.toSettingTab()
            }),
			e.getElement().html(r),
            this.generalSetting = new o(e, t.params),
            e.addOutlet(this.generalSetting)
        },
        toJSON: function() {
            return {
                params: this.generalSetting.toJSON()
            }
        }
    },
    n);
    return l
});