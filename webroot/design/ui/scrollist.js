define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = require("./template"),
    i = require("diy/emitter"),
    a = {
        baseUrl: null,
        dataSource: null,
        pageName: "page",
        pagesize: 10,
        pagesizeName: "pagesize",
        totalName: "total",
        dataName: "data",
        itemTemplate: null,
        itemRender: null,
        scrollElement: null,
        scrollOffset: 20
    },
    s = {
        message: "ui-scrollist-message",
        empty: "ui-scrollist-empty",
        error: "ui-scrollist-error",
        loading: "ui-scrollist-loading"
    },
    o = {
        empty: "暂无内容",
        error: "加载失败",
        loading: "加载中..."
    },
    l = t({
        initialize: function(t, i) {
            var s = this;
            if (this.options = $.extend({},
            a, i), t && !t.jquery && (t = $(t)), !t || !t.length) throw "Invalid Scrollist container";
            this.container = t;
            var o = this.options.itemTemplate,
            l = this.options.itemRender;
            if ($.isFunction(l)) this.itemRender = l;
            else {
                if (!o) throw new Error("Invalid Scrollist itemRender or itemTemplate");
                this.itemTemplate = o instanceof e ? o: new e(o)
            }
            this.message = $("<div></div>").hide().appendTo(t),
            this.page = 1,
            this.total = 0,
            this.loaded = 0;
            var r = this.options.scrollElement || t;
            r.on("scroll",
            function() {
                s.locked || s.loaded >= s.total || r.scrollTop() + r.height() > r[0].scrollHeight - s.options.scrollOffset && s.load()
            }),
            this.clear(),
            this.stack = []
        },
        showMessage: function(t) {
            this.message.css({
                position: "absolute",
                margin: "auto",
                height: 50,
                lineHeight: "50px",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                textAlign: "center"
            }),
            this.message.removeClass().addClass(s.message + " " + s[t]).html(o[t]).show()
        },
        load: function(t, e) {
            function i() {
                0 == l.loaded && (l.showMessage("error"), l.emit("error"))
            }
            function a(t) {
                var e, a;
                t && !isNaN(e = parseInt(t[r.totalName])) ? (a = t[r.dataName], l.total = e, l.loaded = l.loaded + a.length, l.page += 1, l.message.hide(), l.emit("dataReady", e, a), $.each(a,
                function(t, e) {
                    var i;
                    i = l.itemRender ? l.itemRender(e, t) : $(l.itemTemplate.render(e)),
                    i.data("item", e),
                    l.emit("itemReady", i, e),
                    l.container.append(i),
                    l.stack.push(i)
                })) : i()
            }
            function o() {
                l.locked = !1,
                0 != l.loaded || l.container.hasClass(s.error) || (l.showMessage("empty"), l.emit("empty")),
                l.emit("ready")
            }
            var l = this,
            r = this.options;
            this.locked || (this.locked = !0, "[object Boolean]" == Object.prototype.toString.call(t) && (e = t), ($.isPlainObject(t) || e) && (this.clear(), t && (this.data = t), this.emit("init", this.data)), this.data[r.pageName] = this.page, this.data[r.pagesizeName] = r.pagesize, 0 == this.loaded && this.showMessage("loading"), this.emit("loading", this.data), $.isFunction(r.dataSource) ? r.dataSource(r, this.data,
            function(t) {
                a(t),
                o()
            }) : (this.xhr && this.xhr.abort(), this.xhr = $.ajax({
                url: r.baseUrl,
                data: this.data,
                type: "GET",
                dataType: "json"
            }), this.xhr.error(i), this.xhr.done(a), this.xhr.always(o)))
        },
        abort: function() {
            this.xhr && this.xhr.abort()
        },
        clear: function() {
            this.loaded = 0,
            this.total = 0,
            this.page = 1;
            for (var t in this.stack) this.stack[t] && this.stack[t].remove && this.stack[t].remove();
            this.stack = [],
            this.data = {},
            this.showMessage("empty"),
            this.emit("empty")
        }
    });
    return l.implement(i),
    l
});