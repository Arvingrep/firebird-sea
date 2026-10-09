define(function(require) {
	function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    var i = require("class"),
    a = require("widgets/area/controller"),
    n = require("diy/panel/panel"),
    s = require("diy/panel/tabview/setting"),
    l = require("diy/widget/setting"),
    m = require("ui/template"),
    $ = require("jquery"),
    h = require("control/size"),
    d = require("control/switcher");
    var g = window.PROJECTID,
    c = {
        getProductType: "/include/"+Module+".inc.php?action=productType&projectid="+g
    },
    f = "app-productType-display";
    s.createSection(f, {
        initView: function() {
            var t, i = (new Date, this);
            t = this.addRow().addCell(),
            t.addLabel("调用数量"),
            this.numField = new h({
                units: null,
                negative: !1,
                width: "60px"
            }),
            this.numField.appendTo(t.getElement()),
            this.numField.on("change",
            function(t) {
                i.applyToOutlet("num", t)
            }),
			t = this.addRow().addCell(),
            t.addLabel("显示数据"),
            this.showCountField = new d,
            this.showCountField.appendTo(t.getElement()),
            this.showCountField.on("change",
            function(t) {
                i.applyToOutlet("showCount", t)
            })
        },
        getTitle: function() {
            return "显示设置"
        },
        getClasses: function() {
            return f
        },
        syncParamnum: function(t) {
            this.numField.value(t)
        },
        syncParamShowCount: function(t) {
            this.showCountField.value(t)
        }
    });
    var y = i({
        setup: function(e) {
            if (e) for (var i in e) {
                var a = this["setParam" + t(i)];
                "function" == typeof a && a.call(this, e[i])
            }
        },
        getName: function() {
            return f
        },
        setParamNum: function(t) {
            this.num = parseInt(t, 10),
            this.emit("paramset", "num", this.num),
            this.getWidget().callController("loadData")
        },
        getParamNum: function() {
            return this.num || 0
        },
        setParamShowCount: function(t) {
            this.showCount = parseInt(t, 10),
            this.emit("paramset", "showCount", this.showCount),
            this.getWidget().callController("loadData")
        },
        getParamShowCount: function() {
            return this.showCount || 0
        },
        toJSON: function() {
            return {
                num: this.getParamNum(),
				showCount: this.getParamShowCount()
            }
        }
    },
    l),
    F = i({
        setup: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            e.on("dblclick",
            function() {
                n.toSettingTab()
            }),
            this.content = $('<ul class="w-productType-container">loading...</ul>'),
            i.append(this.content),
            this.settingDisplay = new y(e, t.params),
            e.addOutlet(this.settingDisplay),
            this.dataLoading = !1,
            this.loadData()
        },
        toJSON: function() {
            return {
                params: $.extend(this.settingDisplay.toJSON())
            }
        },
        getParam: function(t) {
            var e = this.toJSON().params;
            return t ? e[t] || "": e
        },
        loadData: function() {
            var t = this;
            if (1 == t.dataLoading) return ! 1;
            t.dataLoading = !0;
            var e = ("datalist_" + g + "_" + t.getParam("num") + "_" + t.getParam("showCount"),
            function(e) {
                if (t.dataLoading = !1, e.code) return ! 1;
                if (t.content.empty(), e.data) {
                    var i = new m('<li><a href="product-list-{%catid%}.html">{%catname%}'+(t.getParam("showCount") ? ' ({%count%})' : "")+'</a></li>');
                    $.each(e.data,
                    function(e, n) {
                        var s = $.extend({},
                        n);
                        t.content.append(i.render(s))
                    })
                } else t.content.html("暂无内容。");
                return ! 0
            });
            return $.getJSON(c.getProductType + "&jsoncallback=?", {
                projectid: g,
                num: this.getParam("num"),
                showCount: this.getParam("showCount")
            },
            function(t) {
                e(t)
            }),
            !0
        }
    },
    a);
    return F
});