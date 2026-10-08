define(function(require) {
    function e(e) {
        return e ? e.split(".").pop() : e
    }
    function t(t, i) {
        if (!t) return ! 0;
        var r = i.name.toLocaleLowerCase();
        switch (!0) {
        case "image" == t && v[t].exts.indexOf(e(r)) > -1 : return ! 0;
        case "flash" == t && v[t].exts.indexOf(e(r)) > -1 : return ! 0;
        case "audio" == t && v[t].exts.indexOf(e(r)) > -1 : return ! 0;
        case ! t || "file" == t: return ! 0
        }
        return ! 1
    }
    function i(e, i) {
        for (var r, a = [], l = 0; r = i.item(l++);) t(e, r) && a.push(r);
        return a
    }
    function r(e) {
        var t = e.filter && v[e.filter] && v[e.filter].name || "资源",
        i = e.filter ? "." + v[e.filter].exts.join(", .").toUpperCase() : "",
        r = e.filter && v[e.filter] && v[e.filter].accept || "",
        a = $('<div class="ui-explorer-tabs draggable"><a class="ui-explorer-tab ui-explorer-tab-active" data-target="upload">上传' + t + '</a><a class="ui-explorer-tab" data-target="mine">我的' + t + '</a><a class="ui-explorer-tab" data-target="remote">远程' + t + '</a></div><div class="ui-explorer-content ui-explorer-content-active ui-explorer-upload" data-name="upload"><div class="ui-explorer-upload-droparea"><table><tr><td><input type="file" id="explorer-file"' + (e.multiple ? " multiple": "") + (r ? ' accept="' + r + '"': "") + ' /><label for="explorer-file">从本地选择' + t + '上传</label><p class="ui-explorer-message ui-explorer-message-dragdrop">将' + t + '拖动到此区域快速上传</p><p class="ui-explorer-message ui-explorer-message-release">松开鼠标开始上传</p></td></tr></table></div></div><div class="ui-explorer-content ui-explorer-mine" data-name="mine"><div class="ui-explorer-search"><form><input type="text" name="keyword" class="input ui-explorer-search-text" /><input type="submit" class="ui-explorer-search-submit" value="" /></form></div><div class="ui-explorer-mine-filters"><a class="ui-explorer-mine-filter ui-explorer-mine-filter-active" data-filter="">全部</a><a class="ui-explorer-mine-filter" data-filter="image">图片</a><a class="ui-explorer-mine-filter" data-filter="flash">Flash</a><a class="ui-explorer-mine-filter" data-filter="audio">音频</a><a class="ui-explorer-mine-filter" data-filter="file">附件</a></div><script type="text/template" class="ui-explorer-filetpl"><div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-{%type%}" data-url="{%url%}" data-name="{%name%}"><a><img src="{%if thumb%}{%thumb%}{%else%}/design/ui/explorer/images/default-{%type%}.png{%endif%}" onload="this.style.visibility=\'visible\';" /></a><span>{%name%}</span><div></div></div></script><div class="ui-explorer-mine-filelist"></div><div class="ui-explorer-mine-footer"><button class="btn btn-primary">确定</button><span>已选 <strong></strong> 个，<a>取消选择</a></span></div></div><div class="ui-explorer-content ui-explorer-remote" data-name="remote"><table><tr><td><form><p data-filter="image">请输入' + t + "的链接地址，格式仅限 " + i + '</p><p data-filter="flash">请输入' + t + "的链接地址，格式仅限 " + i + '</p><p data-filter="audio">请输入' + t + "的链接地址，格式仅限 " + i + '</p><p data-filter="">请输入' + t + '的链接地址</p><input type="text" name="url" class="input ui-explorer-remote-text" /><input type="submit" value="确定" class="btn btn-primary" /></form></td></tr></table></div>');
        return a
    }
    function a(e, t) {
        var i = new XMLHttpRequest;
        return "withCredentials" in i ? (i.open(e, t, !0), i.withCredentials = !0) : "undefined" != typeof XDomainRequest && (i = new XDomainRequest, i.open(e, t)),
        i
    }
    function l(e, t, r) {
        function a(e, t, i) {
            if (e.addClass("ui-explorer-tab-active"), l.not(e[0]).removeClass("ui-explorer-tab-active"), t.addClass("ui-explorer-content-active"), s.not(t[0]).removeClass("ui-explorer-content-active"), !t.data("inited")) {
                var r = "init" + i.substr(0, 1).toUpperCase() + i.substr(1) + "View";
                $.isFunction(o[r]) && (o[r](t), t.data("inited", !0))
            }
        }
        t.jquery || (t = $(t));
        var l = t.find(".ui-explorer-tab"),
        s = t.find(".ui-explorer-content"),
        o = {
            initUploadView: function(e) {
                var t = e.find(".ui-explorer-upload-droparea");
                n.enableDragAndDropUpload(t, {
                    multiple: r.multiple,
                    filter: r.filter
                },
                function(e) {
                    n.close(),
                    n.executeUpload(e, r.success, r.filter)
                }),
                e.find("input:file").change(function() {
                    n.close(),
                    n.executeUpload(i(r.filter, this.files), r.success, r.filter)
                }),
                r.filter && t.addClass("ui-explorer-upload-droparea-" + r.filter)
            },
            initMineView: function(t) {
                function i(e) {
                    var t = e.data("url");
                    e.addClass(x),
                    h.push({
                        url: t,
                        name: e.data("name")
                    }),
                    g[t] = e,
                    w.find("strong").text(h.length),
                    w.find("span").show()
                }
                function a(e) {
                    var t = e.data("url");
                    e.removeClass(x);
                    var i = -1;
                    h.every(function(e, r) {
                        return e.url === t ? (delete g[t], i = r, !1) : !0
                    }),
                    i > -1 && (h.splice(i, 1), w.find("strong").text(h.length), !h.length && w.find("span").hide())
                }
                function l(e) {
                    e && (h = [], g = {},
                    w.find("span").hide()),
                    o.load({
                        filter: v
                    },
                    e)
                }
                function s() {
                    f.css({
                        top: b,
                        height: f.parent().innerHeight() - b - y - 10
                    }),
                    f.css("visibility", "visible")
                }
                var o, u, f = t.find(".ui-explorer-mine-filelist").css("visibility", "hidden"),
                m = "ui-explorer-mine-fileitem",
                x = "ui-explorer-mine-fileitem-checked",
                v = r.filter,
                h = [],
                g = {};
                u = new d(f),
                $.isFunction(r.success) && u.getBody().click(function(e) {
                    var t = $(e.target);
                    if (t.hasClass(m) || (t = t.parents().filter("." + m)), t.length) {
                        if (!r.multiple) return n.close(),
                        r.success(t.data("url"), t.data("name")),
                        !1;
                        t.hasClass(x) ? a(t) : i(t)
                    }
                    return ! 0
                }),
                o = new p(u.getBody(), {
                    baseUrl: "/include/"+Module+".inc.php?action=filemanage&projectid=" + c.getWorkspace().getProjectId(),
                    itemTemplate: t.find(".ui-explorer-filetpl").html(),
                    pagesize: 24,
                    scrollElement: u.getInner()
                });
                var b = 0,
                y = 0,
                w = t.find(".ui-explorer-mine-footer");
                r.multiple && (w.show(), y = w.outerHeight(!0), w.find("button").click(function() {
                    n.close(),
                    $.isFunction(r.success) && h.length && h.forEach(function(e) {
                        r.success(e.url, e.name)
                    })
                }), w.find("a").click(function() {
                    $.each(g,
                    function(e, t) {
                        a(t)
                    })
                }));
                var C = t.find(".ui-explorer-mine-filters");
                e.bind("resize", s),
                v ? (C.hide(), s(), l()) : (b += C.outerHeight(!0), C = C.find(".ui-explorer-mine-filter").click(function() {
                    var e = $(this);
                    return C.not(this).removeClass("ui-explorer-mine-filter-active"),
                    e.addClass("ui-explorer-mine-filter-active"),
                    v = e.data("filter"),
                    l(!0),
                    !1
                }), v = C.eq(0).data("filter"), s(), l())
            },
            initRemoteView: function(e) {
                e.find("p[data-filter=" + (r.filter || "") + "]").show(),
                e.find("form").submit(function() {
                    return n.close(),
                    $.isFunction(r.success && r.success(this.url.value)),
                    !1
                })
            }
        };
        l.each(function(e) {
            var t = $(this),
            i = t.data("target"),
            r = s.filter("[data-name=" + i + "]");
            t.click(function() {
                return t.hasClass("ui-explorer-tab-active") || a(t, r, i),
                !1
            }),
            0 == e && a(t, r, i)
        })
    }
    function n() {}
    function s(e, t) {
        b || (b = $('<div class="ui-explorer-uploader"><div class="explorer-uploader-header"><span class="explorer-uploader-title">上传中</span><span class="explorer-uploader-count"></span></div><div class="explorer-uploader-bar"><div class="explorer-uploader-barsize"></div></div><div class="explorer-uploader-percent"></div></div>').appendTo(x.body)),
        g && clearTimeout(g),
        b.show(),
        h.length ? b.find(".explorer-uploader-count").text("，剩余 " + h.length + " 个") : b.find(".explorer-uploader-count").text(""),
        b.find(".explorer-uploader-barsize").css("width", t),
        b.find(".explorer-uploader-percent").text(t),
        "100%" == t && o()
    }
    function o() {
        b && (g && clearTimeout(g), g = setTimeout(function() {
            b.hide()
        },
        1500))
    }
    var $ = require("jquery"),
    u = require("./dialog"),
    p = require("./scrollist"),
    d = require("./scroller"),
    c = require("diy/runtime"),
    f = require("ui/message");
    require("./explorer/style.css");
    var m, x = document,
    v = {
        image: {
            name: "图片",
            exts: ["jpg", "jpeg", "png", "gif"],
            accept: "image/*"
        },
        flash: {
            name: "Flash",
            exts: ["swf"],
            accept: ".swf"
        },
        audio: {
            name: "音频",
            exts: ["mp3"],
            accept: ".mp3"
        },
        file: {
            name: "其他",
            exts: null
        }
    };
    n.open = function(e) {
        return m && m.remove(),
        e = $.extend({
            width: null,
            height: null,
            filter: null,
            multiple: !1
        },
        e),
        m = new u({
            width: e.width || 840,
            height: e.height || (e.multiple ? 560 : 500)
        }),
        m.setContent(r(e)),
        m.bind("ready",
        function(t) {
            $.isFunction(e.ready) && e.ready(m.getDialog()),
            l(m, t, e)
        }),
        $.isFunction(e.close) && m.bind("close",
        function() {
            e.close(m.getDialog())
        }),
        m.open(),
        this
    },
    n.close = function() {
        return m.close(),
        self
    },
    n.enableDragAndDropUpload = function(e, t, r, a) {
        $.isFunction(t) && (a = t, t = null, r = null),
        $.isFunction(r) && (a = r, r = null),
        t = $.extend({
            multiple: !1,
            filter: null
        },
        t),
        r || (r = "ui-explorer-upload-dragover"),
        e.bind("dragover",
        function(t) {
            t.stopPropagation(),
            t.preventDefault(),
            t.originalEvent.dataTransfer.dropEffect = "copy",
            e.addClass(r)
        }),
        e.bind("drop",
        function(r) {
            r.stopPropagation(),
            r.preventDefault();
            var l = i(t.filter, r.originalEvent.dataTransfer.files);
            l.length && $.isFunction(a) && a(t.multiple ? l: l.slice(0, 1)),
            e.trigger("dragleave")
        }),
        e.bind("dragleave",
        function() {
            e.removeClass(r)
        })
    };
    var h = [];
    n.executeUpload = function(e, t, i) {
        function r() {
            e && e.length && (h.push.apply(h, e), e = []);
            var l = h.shift();
            if (!l) return o(),
            void 0;
            var n = a("POST", "/include/upload.inc.php"),
            u = new FormData;
            u.append("aid", c.getWorkspace().getProjectId()),
			u.append("mod", Module),
			u.append("type", "thumb"),
			u.append("filetype", i == null ? "file" : i),
			u.append("o", "true"),
            u.append("Filedata", l),
            n.upload.onprogress = function(e) {
                e.lengthComputable && s(l, 100 * (e.loaded / l.size).toFixed(2) + "%", e.loaded)
            },
            $.isFunction(i) || (i = function(e, t) {
                f.error(e.name + " 上传失败" + (t ? "：" + t: ""), 5)
            }),
            n.onload = function(e) {
                if (200 == this.status) {
                    s(l, "100%", e.loaded);
                    try {
                        var a = JSON.parse(e.target.responseText);
                        a && "SUCCESS" === a.state ? t(cfg_attachment+a.url+"&name="+l.name, l.name) : i(l, a && a.state || null)
                    } catch(n) {
                        i(l, n && n.state || null)
                    }
                } else o(),
                i(l, this.statusText || null);
                h.length && r()
            },
            n.send(u),
            s(l, "1%")
        }
        return function() {
            r()
        } ()
    };
    var g, b;
    return n
});
