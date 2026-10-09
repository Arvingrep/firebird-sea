define(function(require) {
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    function e(t, e) {
        var n = e ? new Date(1e3 * e) : new Date,
        i = function(t, e) {
            return (t += "").length < e ? new Array(++e - t.length).join("0") + t: t
        };
        t || (t = "Y-m-d H:i");
        var r = {
            Y: function() {
                return n.getFullYear()
            },
            m: function() {
                return i(n.getMonth() + 1, 2)
            },
            d: function() {
                return i(n.getDate(), 2)
            },
            H: function() {
                return i(n.getHours(), 2)
            },
            i: function() {
                return i(n.getMinutes(), 2)
            },
            s: function() {
                return i(n.getSeconds(), 2)
            }
        };
        return t.replace(/[YmdHis]/g,
        function(t) {
            return r[t] ? r[t]() : t
        })
    }
    var n = require("class"),
    i = require("widgets/area/controller"),
    r = require("diy/panel/panel"),
    a = require("diy/panel/tabview/setting"),
    o = require("diy/widget/setting"),
    u = require("control/select"),
    m = (new Date, "app-view-time-general");
    a.createSection(m, {
        initView: function() {
            var t, n = this;
            t = this.addRow().addCell(),
            t.addLabel("时间格式"),
            this.timeFormatField = new u({
                value: "Y-m-d H:i",
                options: [{
                    label: e("Y年m月d日H:i"),
                    value: "Y年m月d日H:i"
                },
                {
                    label: e("Y-m-d H:i"),
                    value: "Y-m-d H:i"
                },
                {
                    label: e("m月d日H:i"),
                    value: "m月d日H:i"
                },
                {
                    label: e("m-d H:i"),
                    value: "m-d H:i"
                }],
                width: "138px"
            }),
            this.timeFormatField.appendTo(t.getElement()),
            this.timeFormatField.on("change",
            function(t) {
                n.applyToOutlet("timeFormat", t)
            })
        },
        getTitle: function() {
            return "显示设置"
        },
        getClasses: function() {
            return m
        },
        syncParamTimeFormat: function(t) {
            this.timeFormatField.value(t)
        }
    });
    var l = n({
        setup: function(e) {
            if (e) for (var n in e) {
                var i = this["setParam" + t(n)];
                "function" == typeof i && i.call(this, e[n])
            }
        },
        getName: function() {
            return m
        },
        setParamTimeFormat: function(t) {
            this.timeFormat = t;
            var n = this.getWidget(),
            i = n.getElement();
            i.html(e(t)),
            this.emit("paramset", "timeFormat", t)
        },
        getParamTimeFormat: function() {
            return this.timeFormat || "Y-m-d H:i"
        },
        toJSON: function() {
            return {
                timeFormat: this.getParamTimeFormat()
            }
        }
    },
    o),
    s = n({
        setup: function(t) {
            var g = this.getWidget(),
            n = g.getElement();
            g.on("dblclick",
            function() {
                r.toSettingTab()
            }),
            n.html(e()),
            this.generalSetting = new l(g, t.params),
            g.addOutlet(this.generalSetting)
        },
        toJSON: function() {
            return {
                params: this.generalSetting.toJSON()
            }
        }
    },
    i);
    return s
});