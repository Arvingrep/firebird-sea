define(function(require) {
    function a(a) {
        n.open({
            filter: "audio",
            success: a,
            multiple: !1
        })
    }
    var t = require("class"),
    $ = require("jquery"),
    i = require("diy/widget/controller"),
    e = require("diy/widget/setting"),
    o = require("diy/panel/tabview/setting"),
    n = (require("ui/dialog"), require("ui/explorer")),
    u = require("control/options"),
    d = require("control/switcher"),
    l = require("diy/panel/panel");
    require("./controller.css");
    var s = "audio";
    o.createSection(s, {
        initView: function() {
            var t, i = this,
            e = this.addRow("audio-panel-add"),
            o = $('<input value="添加/更改音频" class="add" type="button" />');
            e.getElement().append(o),
            o.on("click",
            function(t) {
                t.preventDefault(),
                a(function(a) {
                    i.applyToOutlet("audio", a)
                })
            }),
            t = this.addRow().addCell("options"),
            t.addLabel("对齐");
            var n = new u({
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
            n.appendTo(t.getElement()),
            n.on("change",
            function(a) {
                i.applyToOutlet("align", a)
            }),
            this.alignField = n,
            t = this.addRow().addCell("options"),
            t.addLabel("自动播放");
            var l = new d({
                value: this.getOutlet()._autoplay
            });
            l.appendTo(t.getElement()),
            l.on("change",
            function(a) {
                i.applyToOutlet("autoplay", a)
            }),
            this.autoplayField = l
        },
        getTitle: function() {
            return "设置"
        },
        syncParamAudio: function() {},
        syncParamAlign: function(a) {
            this.alignField.value(a)
        },
        syncParamAutoplay: function(a) {
            this.autoplayField.value(a)
        }
    });
    var r = t({
        setup: function(a) {
            {
                var t = this;
                t.getWidget()
            }
            this.setParamAudio(a.audio || ""),
            this.setParamAlign(a.align || "center"),
            this.setParamAutoplay(a.autoplay || !1)
        },
        getParamAudio: function() {
            return this._audio
        },
        setParamAudio: function(a) {
            this._audio = a;
            var t = this.getWidget(),
            i = t.getElement(),
            e = this.getAudio(),
            o = t.getRender();
            a && (e.attr("data-audio", a), e.attr("data-type", a.substring(a.lastIndexOf(".") + 1)), e.appendTo(i), o && o(i[0])),
            this.emit("paramset", "audio", a)
        },
        getParamAlign: function() {
            return this._align
        },
        setParamAlign: function(a) {
            this._align = a;
            var t = this.getAudio();
            a ? "center" == a ? t.css({
                marginLeft: "auto",
                marginRight: "auto"
            }) : t.css({
                marginLeft: "left" == a ? 0 : "auto",
                marginRight: "right" == a ? 0 : "auto"
            }) : t.css({
                marginLeft: "",
                marginRight: ""
            }),
            this.emit("paramset", "align", a)
        },
        getParamAutoplay: function() {
            return this._autoplay
        },
        setParamAutoplay: function(a) {
            this._autoplay = a;
            var t = this.getAudio(),
            i = "data-autoplay";
            a ? t.attr(i, "1") : t.removeAttr(i)
        },
        getAudio: function() {
            if (this.audio) return this.audio;
            var a = $('<div class="w-audio-container"><div class="w-audio-shadow-left"></div><div class="w-audio-player"></div><div class="w-audio-control-container"><div class="w-audio-control"><a class="w-audio-icon w-audio-play jp-play" title="播放"></a><a class="w-audio-icon w-audio-pause jp-pause" title="暂停"></a></div><div class="w-audio-track jp-progress"><div class="w-audio-bar w-audio-track-bar jp-seek-bar"><div class="w-audio-percent w-audio-track-percent jp-play-bar"></div></div><span class="w-audio-track-playtime jp-current-time">00:00</span><span class="w-audio-track-totaltime jp-duration">--:--</span></div><div class="w-audio-volume"><a class="w-audio-icon w-audio-volume-normal jp-unmute" title="恢复音量"></a><a class="w-audio-icon w-audio-volume-mute jp-mute" title="静音"></a><div class="w-audio-bar w-audio-volume-bar jp-volume-bar"><div class="w-audio-percent w-audio-volume-percent jp-volume-bar-value"></div></div></div></div><div class="w-audio-shadow-right"></div></div>');
            return this.audio = a.appendTo(this.getWidget().getElement()),
            this.audio.on("mousedown",
            function(a) {
                a.stopPropagation()
            }),
            this.audio
        },
        getName: function() {
            return s
        },
        toJSON: function() {
            return {
                audio: this._audio,
                align: this._align,
                autoplay: this._autoplay
            }
        }
    },
    e),
    c = t({
        setup: function(a) {
            {
                var t = this.getWidget();
                t.getPage()
            }
            this.audioSetting = new r(t, a.params || {}),
            t.addOutlet(this.audioSetting),
            t.on("dblclick",
            function() {
                l.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.audioSetting.toJSON()
            }
        }
    },
    i);
    return c
});