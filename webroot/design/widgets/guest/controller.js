define(function(require) {
	function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    var t, e = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
	s = require("diy/panel/tabview/setting"),
	l = require("diy/widget/setting"),
    n = require("diy/panel/panel"),
    d = require("control/switcher");
	f = "app-guest-display";
    s.createSection(f, {
        initView: function() {
            var t, i = (new Date, this);
			t = this.addRow().addCell(),
            t.addLabel("显示留言"),
            this.showListField = new d,
            this.showListField.appendTo(t.getElement()),
            this.showListField.on("change",
            function(t) {
                i.applyToOutlet("showList", t)
            })
        },
        getTitle: function() {
            return "显示设置"
        },
        getClasses: function() {
            return f
        },
        syncParamShowList: function(t) {
            this.showListField.value(t)
        }
    });
    var y = e({
        setup: function(e) {
            if (e) for (var i in e) {
                var a = this["setParam" + t(i)];
                "function" == typeof a && a.call(this, e[i])
            }
        },
        getName: function() {
            return f
        },
        setParamShowList: function(t) {
            this.showList = parseInt(t, 10),
            this.emit("paramset", "showList", this.showList),
            this.getWidget().callController("showList")
        },
        getParamShowList: function() {
            return this.showList || 0
        },
        toJSON: function() {
            return {
				showList: this.getParamShowList()
            }
        }
    },
    l),
    p = e({
        setup: function(t) {
            var e = this.getWidget();
			e.getElement().html("<h5>已添加留言组件，将在发布后展示</h5>");
			e.on("dblclick",
            function() {
                n.toSettingTab()
            }),
            this.settingDisplay = new y(e, t.params),
            e.addOutlet(this.settingDisplay);
        },
        toJSON: function() {
            return {
                params: this.settingDisplay.toJSON()
            }
        },
        getParam: function(t) {
            var e = this.toJSON().params;
            return t ? e[t] || "": e
        }
    },
    i);
    return p
});