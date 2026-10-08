define(function(require) {
    function t(t, i) {
        var e = o.getInstance();
        e.rebind("save", i),
        e.open(t)
    }
    var i = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    n = require("diy/widget/setting"),
    a = require("diy/panel/tabview/setting"),
    o = (require("diy/runtime"), require("ui/dialog"), require("ui/videodialog")),
    h = require("control/options"),
    s = require("control/length"),
    d = require("diy/panel/panel");
    require("./controller.css");
    var r = "video";
    a.createSection(r, {
        initView: function() {
            var i, e = this,
            n = this.addRow("video-panel-add"),
            a = $('<input value="添加/更改视频" class="add" type="button" />');
            n.getElement().append(a),
            a.on("click",
            function(i) {
                i.preventDefault(),
                t(e.video,
                function(t) {
                    e.applyToOutlet("video", t)
                })
            });
            var n = this.addRow();
            i = n.addCell("options"),
            i.addLabel("宽度");
            var o = new s({
                width: "60px"
            });
            o.appendTo(i.getElement()),
            o.on("change",
            function(t) {
                e.applyToOutlet("width", t)
            }),
            this.widthField = o,
            i = n.addCell("options"),
            i.addLabel("高度");
            var d = new s({
                width: "60px"
            });
            d.appendTo(i.getElement()),
            d.on("change",
            function(t) {
                e.applyToOutlet("height", t)
            }),
            this.heightField = d,
            i = this.addRow().addCell("options"),
            i.addLabel("对齐");
            var r = new h({
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
            });
            r.appendTo(i.getElement()),
            r.on("change",
            function(t) {
                e.applyToOutlet("align", t)
            }),
            this.alignField = r
        },
        syncParamVideo: function(t) {
            this.video = t
        },
        syncParamWidth: function(t) {
            this.widthField.value(t)
        },
        syncParamHeight: function(t) {
            this.heightField.value(t)
        },
        syncParamAlign: function(t) {
            this.alignField.value(t)
        },
        getTitle: function() {
            return "设置"
        }
    });
    var l = i({
        setup: function(t) {
            {
                var i = this;
                i.getWidget()
            }
            this.setParamVideo(t.video || ""),
            this.setParamAlign(t.align || "center"),
            this.setParamWidth(t.width || "500px"),
            this.setParamHeight(t.height || "300px"),
            this._video || this.empty()
        },
        getParamVideo: function() {
            return this._video
        },
        setParamVideo: function(t) {
            this._video = t;
            var i = this.getVideo();
            t ? (i.find('source').attr("src", t), this.setParamAlign(this._align), this.setParamWidth(this._width), this.setParamHeight(this._height)) : this.empty(),
            this.emit("paramset", "video", t)
        },
        getParamAlign: function() {
            return this._align
        },
        setParamAlign: function(t) {
            if (this._align = t, t) {
                var i = this.getVideo();
                "center" == t ? i.css("margin", "0 auto") : i.css("margin", ""),
                i.attr("align", t)
            } else this.getVideo().removeAttr("align");
            this.emit("paramset", "align", t)
        },
        getParamWidth: function() {
            return this._width
        },
        setParamWidth: function(t) {
            this._width = t,
            this.getVideo().css("width", t || ""),
            this.emit("paramset", "width", t)
        },
        getParamHeight: function() {
            return this._height
        },
        setParamHeight: function(t) {
            this._height = t,
            this.getVideo().css("height", t || ""),
            this.emit("paramset", "height", t)
        },
        empty: function() {
            this.video.remove(),
            this.video = null
        },
        getVideo: function() {
            if (this.video) return this.video;
            var t = this.getWidget().getElement(),
            i = $("<video></video>").appendTo(t);
            return i.attr("autoplay", "autoplay"),
            i.attr("controls", "controls"),
            i.attr("preload", "auto"),
            i.attr("data-setup", "{}"),
            i.append('<source>'),
            this.video = i
        },
        getName: function() {
            return r
        },
        toJSON: function() {
            return {
                video: this._video,
                align: this._align,
                width: this._width,
                height: this._height
            }
        }
    },
    n),
    g = i({
        setup: function(t) {
            {
                var i = this.getWidget();
                i.getPage()
            }
            this.videoSetting = new l(i, t.params || {}),
            i.addOutlet(this.videoSetting),
            i.on("dblclick",
            function() {
                d.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.videoSetting.toJSON()
            }
        }
    },
    e);
    return g
});
