define(function(require) {
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }
    function e(t, e) {
        var i = e ? new Date(1e3 * e) : new Date,
        a = function(t, e) {
            return (t += "").length < e ? new Array(++e - t.length).join("0") + t: t
        };
        t || (t = "Y-m-d H:i");
        var n = {
            Y: function() {
                return i.getFullYear()
            },
            m: function() {
                return a(i.getMonth() + 1, 2)
            },
            d: function() {
                return a(i.getDate(), 2)
            },
            H: function() {
                return a(i.getHours(), 2)
            },
            i: function() {
                return a(i.getMinutes(), 2)
            },
            s: function() {
                return a(i.getSeconds(), 2)
            }
        };
        return t.replace(/[YmdHis]/g,
        function(t) {
            return n[t] ? n[t]() : t
        })
    }
    var i = require("class"),
    a = require("widgets/area/controller"),
    n = require("diy/panel/panel"),
    s = require("diy/panel/tabview/setting"),
    l = require("diy/widget/setting"),
    m = require("ui/template"),
    $ = require("jquery"),
    o = require("control/select"),
    r = require("control/options"),
    h = require("control/size"),
    d = require("control/switcher");
    require("./controller.css");
    var g = window.PROJECTID,
    c = {
        getCategoryList: "/include/"+Module+".inc.php?action=articleType&projectid="+g,
        getArticleList: "/include/"+Module+".inc.php?action=articleList&projectid="+g
    },
    p = "app-articlelist-filter";
    s.createSection(p, {
        initView: function() {
            var t, e = this;
            t = this.addRow().addCell(),
            t.addLabel("栏目"),
            this.catidField = new o({
                label: "所有栏目",
                value: 0,
                remote: {
                    url: c.getCategoryList + "&projectid=" + g + "&jsoncallback=?",
                    label: "catname",
                    value: "catid"
                }
            }),
            this.catidField.appendTo(t.getElement()),
            this.catidField.on("change",
            function(t) {
                e.applyToOutlet("catid", t)
            }),
            t = this.addRow().addCell(),
            t.addLabel("数量"),
            this.numField = new h({
                units: null,
                negative: !1,
                width: "60px"
            }),
            this.numField.appendTo(t.getElement()),
            this.numField.on("change",
            function(t) {
                e.applyToOutlet("num", t)
            })
        },
        getTitle: function() {
            return "筛选条件"
        },
        getClasses: function() {
            return p
        },
        syncParamCatid: function(t) {
            this.catidField.value(t)
        },
        syncParamNum: function(t) {
            this.numField.value(t)
        }
    });
    var w = i({
        setup: function(e) {
            if (e) for (var i in e) {
                var a = this["setParam" + t(i)];
                "function" == typeof a && a.call(this, e[i])
            }
        },
        getName: function() {
            return p
        },
        setParamCatid: function(t) {
            this.catid = parseInt(t, 10),
            this.emit("paramset", "catid", this.catid),
            this.getWidget().callController("loadData")
        },
        getParamCatid: function() {
            return this.catid || 0
        },
        setParamNum: function(t) {
            this.num = parseInt(t, 10),
            this.emit("paramset", "num", this.num),
            this.getWidget().callController("loadData")
        },
        getParamNum: function() {
            return this.num || 10
        },
        toJSON: function() {
            return {
                catid: this.getParamCatid(),
                num: this.getParamNum()
            }
        }
    },
    l),
    f = "app-articlelist-display";
    s.createSection(f, {
        initView: function() {
            var t, i = (new Date, this);
            t = this.addRow("row-line").addCell(),
            t.addLabel("列表模板"),
            this.templateValue = 1,
            this.templateField = new r({
                value: 1,
                options: [{
                    label: "文字",
                    value: 1,
                    classes: "tpl-text"
                },
                {
                    label: "图文",
                    value: 2,
                    classes: "tpl-image"
                },
                {
                    label: "图组",
                    value: 3,
                    classes: "tpl-group"
                }],
                uncheck: !1
            }),
            this.templateField.appendTo(t.getElement()),
            this.templateField.on("change",
            function(t) {
                i.applyToOutlet("template", t)
            }),
            t = this.addRow().addCell(),
            t.addLabel("标题字数"),
            this.titleNumField = new h({
                units: null,
                negative: !1,
                width: "60px"
            }),
            this.titleNumField.appendTo(t.getElement()),
            this.titleNumField.on("change",
            function(t) {
                i.applyToOutlet("titleNum", t)
            }),
            this.summaryNumRow = this.addRow(),
            t = this.summaryNumRow.addCell(),
            t.addLabel("摘要字数"),
            this.summaryNumField = new h({
                units: null,
                negative: !1,
                width: "60px"
            }),
            this.summaryNumField.appendTo(t.getElement()),
            this.summaryNumField.on("change",
            function(t) {
                i.applyToOutlet("summaryNum", t)
            }),
            t = this.addRow().addCell(),
            t.addLabel("显示分类"),
            this.showCategoryField = new d,
            this.showCategoryField.appendTo(t.getElement()),
            this.showCategoryField.on("change",
            function(t) {
                i.applyToOutlet("showCategory", t)
            }),
            this.timeRow = this.addRow(),
            t = this.timeRow.addCell(),
            t.addLabel("显示时间"),
            this.showTimeField = new d,
            this.showTimeField.appendTo(t.getElement()),
            this.showTimeField.on("change",
            function(t) {
                i.applyToOutlet("showTime", t)
            }),
            this.timeFormatRow = this.addRow(),
            t = this.timeFormatRow.addCell(),
            t.addLabel("时间格式"),
            this.timeFormatField = new o({
                value: "Y-m-d H:i:s",
                options: [{
                    label: e("Y-m-d H:i:s"),
                    value: "Y-m-d H:i:s"
                },
                {
                    label: e("Y-m-d H:i"),
                    value: "Y-m-d H:i"
                },
                {
                    label: e("m-d H:i"),
                    value: "m-d H:i"
                },
                {
                    label: e("m-d"),
                    value: "m-d"
                },
                {
                    label: e("H:i"),
                    value: "H:i"
                }],
                width: "138px"
            }),
            this.timeFormatField.appendTo(t.getElement()),
            this.timeFormatField.on("change",
            function(t) {
                i.applyToOutlet("timeFormat", t)
            }),
            this.imageLabelRow = this.addRow(),
            t = this.imageLabelRow.addCell(),
            t.addLabel("缩略图"),
            this.imageRow = this.addRow(),
            t = this.imageRow.addCell(),
            t.addLabel("宽度"),
            this.imageWidthField = new h({
                units: ["px"],
                negative: !1,
                width: "60px"
            }),
            this.imageWidthField.appendTo(t.getElement()),
            this.imageWidthField.on("change",
            function(t) {
                i.applyToOutlet("imageWidth", t)
            }),
            t = this.imageRow.addCell(),
            t.addLabel("高度"),
            this.imageHeightField = new h({
                units: ["px"],
                negative: !1,
                width: "60px"
            }),
            this.imageHeightField.appendTo(t.getElement()),
            this.imageHeightField.on("change",
            function(t) {
                i.applyToOutlet("imageHeight", t)
            }),
			t = this.addRow().addCell(),
            t.addLabel("显示分页"),
            this.showPageField = new d,
            this.showPageField.appendTo(t.getElement()),
            this.showPageField.on("change",
            function(t) {
                i.applyToOutlet("showPage", t)
            })
        },
        getTitle: function() {
            return "显示设置"
        },
        getClasses: function() {
            return f
        },
        syncParamTemplate: function(t) {
            this.templateField.value(t),
            1 == t ? (this.summaryNumRow.hide(), this.imageLabelRow.hide(), this.imageRow.hide(), this.timeRow.show(), this.showTimeField.value() && this.timeFormatRow.show()) : 2 == t ? (this.summaryNumRow.show(), this.imageLabelRow.show(), this.imageRow.show(), this.timeRow.show(), this.showTimeField.value() && this.timeFormatRow.show()) : 3 == t && (this.summaryNumRow.hide(), this.imageLabelRow.show(), this.imageRow.show(), this.timeRow.hide(), this.timeFormatRow.hide())
        },
        syncParamTitleNum: function(t) {
            this.titleNumField.value(t)
        },
        syncParamSummaryNum: function(t) {
            this.summaryNumField.value(t)
        },
        syncParamShowCategory: function(t) {
            this.showCategoryField.value(t)
        },
        syncParamShowTime: function(t) {
            this.showTimeField.value(t),
            1 == t ? this.timeFormatRow.show() : this.timeFormatRow.hide()
        },
        syncParamTimeFormat: function(t) {
            this.timeFormatField.value(t)
        },
        syncParamImageWidth: function(t) {
            this.imageWidthField.value(t)
        },
        syncParamImageHeight: function(t) {
            this.imageHeightField.value(t)
        },
        syncParamShowPage: function(t) {
            this.showPageField.value(t)
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
        setParamTemplate: function(t) {
            this.template = parseInt(t, 10),
            this.emit("paramset", "template", this.template),
            this.getWidget().callController("loadData")
        },
        getParamTemplate: function() {
            return this.template || 1
        },
        setParamTitleNum: function(t) {
            this.titleNum = parseInt(t, 10),
            this.emit("paramset", "titleNum", this.titleNum),
            this.getWidget().callController("loadData")
        },
        getParamTitleNum: function() {
            return this.titleNum || 3 != this.getParamTemplate() ? this.titleNum || 0 : 16
        },
        setParamSummaryNum: function(t) {
            this.summaryNum = parseInt(t, 10),
            this.emit("paramset", "summaryNum", this.summaryNum),
            this.getWidget().callController("loadData")
        },
        getParamSummaryNum: function() {
            return this.summaryNum || 0
        },
        setParamShowCategory: function(t) {
            this.showCategory = parseInt(t, 10),
            this.emit("paramset", "showCategory", this.showCategory),
            this.getWidget().callController("loadData")
        },
        getParamShowCategory: function() {
            return this.showCategory || 0
        },
        setParamShowTime: function(t) {
            this.showTime = parseInt(t, 10),
            this.emit("paramset", "showTime", this.showTime),
            this.getWidget().callController("loadData")
        },
        getParamShowTime: function() {
            return this.showTime || 0
        },
        setParamTimeFormat: function(t) {
            this.timeFormat = t,
            this.emit("paramset", "timeFormat", this.timeFormat),
            this.getWidget().callController("loadData")
        },
        getParamTimeFormat: function() {
            return this.timeFormat || "Y-m-d H:i"
        },
        setParamImageWidth: function(t) {
            this.imageWidth = t,
            this.emit("paramset", "imageWidth", this.imageWidth),
            this.getWidget().callController("loadData")
        },
        getParamImageWidth: function() {
            return this.imageWidth ? this.imageWidth || "": 3 == this.getParamTemplate() ? 200 : 120
        },
        setParamImageHeight: function(t) {
            this.imageHeight = t,
            this.emit("paramset", "imageHeight", this.imageHeight),
            this.getWidget().callController("loadData")
        },
        getParamImageHeight: function() {
            return this.imageHeight || ""
        },
        setParamShowPage: function(t) {
            this.showPage = parseInt(t, 10),
            this.emit("paramset", "showPage", this.showPage),
            this.getWidget().callController("showPage")
        },
        getParamShowPage: function() {
            return this.showPage || 0
        },
        toJSON: function() {
            return {
                template: this.getParamTemplate(),
                titleNum: this.getParamTitleNum(),
                summaryNum: this.getParamSummaryNum(),
                showCategory: this.getParamShowCategory(),
                showTime: this.getParamShowTime(),
                timeFormat: this.getParamTimeFormat(),
                imageWidth: this.getParamImageWidth(!0),
                imageHeight: this.getParamImageHeight(),
				showPage: this.getParamShowPage()
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
            this.content = $('<ul class="w-articlelist-container">loading...</ul>'),
            i.append(this.content),
            this.settingFilter = new w(e, t.params),
            this.settingDisplay = new y(e, t.params),
            e.addOutlet(this.settingFilter),
            e.addOutlet(this.settingDisplay),
            this.dataLoading = !1,
            this.loadData(),
			this.showPage()
        },
        toJSON: function() {
            return {
                params: $.extend(this.settingFilter.toJSON(), this.settingDisplay.toJSON())
            }
        },
        getParam: function(t) {
            var e = this.toJSON().params;
            return t ? e[t] || "": e
        },
        loadData: function() {
            var t = this;
            //if (1 == t.dataLoading) return ! 1;
            t.dataLoading = !0;
            var e = ("datalist_" + g + "_" + t.getParam("catid") + "_" + t.getParam("num") + "_" + t.getParam("timeFormat"),
            function(e) {
                //if (t.dataLoading = !1, e.code) return ! 1;
                if (t.content.empty(), e.data) {
                    var i = new m(t.buildTpl()),
                    a = 0;
                    $.each(e.data,
                    function(e, n) {
                        var s = $.extend({},
                        n);
                        a = parseInt(t.getParam("titleNum"), 10),
                        a && (s.title = s.title.substr(0, a)),
                        a = parseInt(t.getParam("summaryNum"), 10),
                        a && (s.summary = s.summary.substr(0, a)),
                        t.content.append(i.render(s))
                    })
                } else t.content.html("暂无内容。");
                return ! 0
            });
            return $.getJSON(c.getArticleList + "&jsoncallback=?", {
                projectid: g,
                catid: this.getParam("catid"),
                num: this.getParam("num"),
                timeformat: this.getParam("timeFormat")
            },
            function(t) {
                e(t)
            }),
            !0
        },
		showPage: function(){
			var i = this.getParam();
			if(i.showPage){
				var html = '<div class="pagination"><ul><li><a href="javascript:;">« 上一页</a></li><li><a href="javascript:;">1</a></li><li><a href="javascript:;">2</a></li><li><em>...</em></li><li><a href="javascript:;">4</a></li><li class="active"><a href="javascript:;">5</a></li><li><a href="javascript:;">6</a></li><li><em>...</em></li><li><a href="javascript:;">9</a></li><li><a href="javascript:;">10</a></li><li><a href="javascript:;">下一页 »</a></li></ul></div>';
				this.content.parent().append(html);
			}else{
				this.content.parent().find(".pagination").remove();
			}
		},
        buildTpl: function() {
            var t, e, i = this.getParam(),
            a = i.template,
            n = "li-text";
            if (2 == a ? n = "li-image": 3 == a && (n = "li-group"), e = "", t = '<li class="' + n + '" style="' + e + '">', a > 1) {
                var s = "";
                t += '<div class="image"><a href="article-view.{%id%}.html"><img src="{%image%}"',
                i.imageWidth && (t += ' width="' + i.imageWidth + '"'),
                i.imageHeight && (t += ' height="' + i.imageHeight + '"'),
                t += ' style="' + s + '"/></a></div>'
            }
            return t += '<div class="text"><div class="title">',
            i.showCategory && (t += '<a class="category" href="article-list-{%catid%}.html">[{%catname%}]</a>'),
            t += '<a href="article-view-{%id%}.html">{%title%}</a>',
            3 > a && i.showTime && (t += '<span class="time">{%addtime%}</span>'),
            t += "</div>",
            2 == a && (t += "<p>{%summary%}</p>"),
            t += "</div></li>"
        }
    },
    a);
    return F
});