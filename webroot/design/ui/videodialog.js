define(function(require) {
    function i(i) {
        if (!i) return null;
        a || (a = document.createElement("a"));
        try {
            if (a.href = i, a.href.match(/\.swf$/i)) return a.href
        } catch(e) {}
        return null
    }
    var $ = require("jquery"),
    e = require("class"),
    t = require("ui/dialog"),
    r = require("ui/message");
    require("./videodialog/style.css");
    var a, s, n = e({
        initialize: function(e) {
            $.isPlainObject(e) || (e = {}),
            e.width = 450,
            this.wrapper = $('<div class="ui-video-dialog"><form><div class="ui-dialog-title draggable">视频地址</div><div class="ui-video-dialog-content"><input class="input text" type="text" name="video" placeholder="请输入远程视频地址，mp4格式！" /></div><div class="ui-dialog-footer"><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>'),
            this.form = this.wrapper.find("form:first"),
            this.footer = this.wrapper.find(".ui-dialog-footer"),
            this.initialized = !1;
            var t = this,
            a = !1;
            this.form = this.wrapper.find("form").submit(function(a) {
                a.preventDefault();
                var e = t.form[0].video.value;
                return /^https?:\/\/.+/i.test(e) ? (t.saveCallback ? t.saveCallback(e) : t.container.trigger("dialog.save", [e]), t.close(), void 0) : (r.error("视频地址必须以 http:// 或 https:// 开头"), !1)
            }),
            // this.form.submit(function() {
            //     function e(i) {
            //         t.container.trigger("dialog.save", [i]);
            //         t.close();
            //     }
            //     if (a) return ! 1;
            //     a = !0;
            //     var s = t.form[0].video.value;
            //     if (s) {
            //         var n = i(s);
            //         return e(s);
            //         n ? (a = !1, e(n)) : (t.xhr = $.ajax({
            //             type: "POST",
            //             url: "/attachments/video",
            //             data: {
            //                 video: s
            //             },
            //             dataType: "json"
            //         }), t.xhr.done(function(i) {
            //             i && 0 === i.code ? e(i.url) : r.error(i && i.message || "视频 Flash 地址解析失败")
            //         }), t.xhr.fail(function() {
            //             r.error("视频 Flash 地址解析失败")
            //         }), t.xhr.always(function() {
            //             a = !1
            //         }))
            //     } else a = !1,
            //     r.error("视频地址不正确");
            //     return ! 1
            // }),
            n.superclass.initialize.apply(this, [e])
        },
        open: function(e) {
            e = i(e),
            e && (this.form[0].video.value = e),
            n.superclass.open.apply(this, [this.initialized ? null: this.wrapper]),
            this.initialized = !0
        },
        close: function() {
            this.xhr && this.xhr.abort(),
            this.form[0].video.value = "",
            n.superclass.close.apply(this)
        }
    },
    t);
    return n.getInstance = function() {
        return s || (s = new n)
    },
    n
});
