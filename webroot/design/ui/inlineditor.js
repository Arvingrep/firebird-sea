define(function(require) {
    function e(e) {
        var t = this;
        require.async("control/color",
        function(n) {
            var i = t.color = n.Picker.getInstance();
            e.click(function() {
                i.edit(e, null,
                function(e) {
                    t.execCommand("forecolor", e)
                })
            })
        })
    }
    function t(e) {
        require.async("ui/linkdialog", $.proxy(function(t) {
            e.click($.proxy(function(e) {
                e.stopPropagation();
                var n = this,
                i = s(this.window, this.element[0], "a"),
                o = {};
                i && (o.href = i.getAttribute("href"), o.target = i.getAttribute("target")),
                t.edit(o,
                function(e) {
                    e && e.href ? (n.execCommand("createlink", e.href), i = s(n.window, n.element[0], "a"), e.target && i && i.setAttribute("target", e.target)) : (i = s(n.window, n.element[0], "a"), n.execCommand("unlink", !1))
                })
            },
            this))
        },
        this))
    }
    function n(e, t) {
        var n = function() {
            var e = this.doc,
            n = this.element[0].nodeName.toLowerCase(),
            i = parseInt(e.queryCommandValue("FontSize"), 10);
            i || (i = "h1" == n || "h2" == n ? "decreasefontsize" == t ? 5 : 4 : "decreasefontsize" == t ? 2 : 3),
            "decreasefontsize" == t ? this.execCommand("FontSize", Math.max(i - 1, 1)) : this.execCommand("FontSize", Math.min(i + 1, 7))
        };
        e.click($.proxy(function(e) {
            return e.stopPropagation(),
            n.call(this),
            !0
        },
        this))
    }
    function i(e, t) {
        e.click($.proxy(function() {
            if ("h2" == this.element[0].nodeName.toLowerCase() && /firefox/.test(navigator.userAgent.toLowerCase())) {
                var e;
                "justifyleft" == t && (e = "left"),
                "justifycenter" == t && (e = "center"),
                "justifyright" == t && (e = "right"),
                this.element.css("text-align", e)
            }
        },
        this))
    }
    function o(e) {
        return e.getSelection ? e.getSelection() : e.document.selection
    }
    function a(e) {
        var t = o(e);
        if (t && 0 !== t.rangeCount) return t.rangeCount > 0 ? t.getRangeAt(0) : t.createRange()
    }
    function r(e, t, n) {
        var i = a(e),
        o = i.createContextualFragment(t);
        i.deleteContents(),
        i.insertNode(o),
        n && n.normalize(),
        i.collapse(!1)
    }
    function s(e, t, n) {
        for (var i = a(e), o = i.commonAncestorContainer; 3 == o.nodeType;) o = o.parentNode;
        for (; o != t;) {
            if (o.nodeName.toLowerCase() == n) return o;
            o = o.parentNode
        }
    }
    function c(e) {
        if ("A" != e.target.nodeName) return c.div && c.div.hide(),
        void 0; {
            var t, n = e.target.ownerDocument,
            i = n.defaultView,
            o = s(i, $(this)[0], "a");
            $(this)
        }
        if (c.div) t = c.div,
        t.show();
        else {
            t = c.div = $('<div class="ui-inlineditor-linkmini">'),
            t.appendTo(document.body),
            t.html('链接到: <a href="' + o.href + '" class="linktohref">' + o.href + '</a><a href="" class="modlink">修改</a><a href="" class="remove">删除</a>');
            t.find(".modlink").click(function() {
                return ! 1
            })
        }
    }
    function l(e, t, n) {
        var i = $("ul", e),
        o = $("span", e);
        o.text(t || $(":first", i).text()),
        o.on("click",
        function() {
            i.toggle(),
            $(this).parents(".dropmenu").siblings().find("ul").hide()
        }),
        i.on("click", "li",
        function(e) {
            var t = $(e.target);
            n(t.attr("data-command"));
            var o = t.text();
            t.parents(".dropmenu").find("span").html(o),
            i.hide()
        })
    }
    function d(e, t) {
        var n = e,
        i = $("<div class='dropmenu'><span></span></div>").addClass(t),
        o = $("<ul>");
        o.appendTo(i);
        for (var a = 0,
        r = n.length; r > a; a++) $('<li data-command="' + n[a][1] + '">' + n[a][0] + "</li>").appendTo(o);
        return i
    }
    function f(e, t) {
        var n, i = e.clientX,
        o = e.clientY;
        if (t.caretPositionFromPoint) {
            var a = t.caretPositionFromPoint(i, o);
            n = t.createRange(),
            n.setStart(a.offsetNode, a.offset),
            n.collapse(!0)
        } else t.caretRangeFromPoint && (n = t.caretRangeFromPoint(i, o));
        return n
    }
    function u(e, t) {
        if (e) if ("undefined" != typeof e.select) e.select();
        else if ("undefined" != typeof t.getSelection) {
            var n = t.getSelection();
            n.removeAllRanges(),
            n.addRange(e)
        }
    }
    function h(e, t, n) {
        var i = f(e, t);
        u(i, n),
        setTimeout(function() {
            u(i, n)
        },
        1)
    }
    function m(e, t) {
        var n = this;
        this.clear = t && "pasteclear" == t ? !0 : !1;
        var i = [];
        e ? e.forEach(function(e) {
            e in b && i.push(e)
        }) : i = Object.getOwnPropertyNames(b),
        this.enableButtons = i,
        this.toolbar = $('<div class="ui-inlineditor-toolbar event-masker"></div>').hide().appendTo(document.body);
        var n = this;
        this.toolbar.mousedown(function() {
            return ! 1
        }).click(function(e) {
            "forecolor" != e.target.getAttribute("data-command") && n.color && n.color.hide(),
            e.target.hasAttribute("data-command") && n.execCommand(e.target.dataset.command),
            n.element && n.element.focus()
        }),
        this.enableButtons.forEach(function(e) {
            n.addButtonToToolbar(b[e])
        })
    }
    var $ = require("jquery");
    require("./inlineditor/style.css");
    var g = [["微软雅黑", "Microsoft YaHei"], ["宋体", "SimSun"], ["楷体", "SimKai"], ["黑体", "SimHei"], ["隶书", "SimLi"], ["Arial", "arial, helvetica,sans-serif"], ["Courier New", "Courier New"], ["sans-serif", "sans-serif"], ["andale mono", "andale mono"], ["comic sans ms", "comic sans ms"]],
    p = [["普通文本", "p"], ["一级标题", "h1"], ["二级标题", "h2"], ["三级标题", "h3"], ["四级标题", "h4"], ["五级标题", "h5"]],
    b = {
        formatblock: "formatblock",
        fontfamily: "fontname",
        bold: "bold",
        italic: "italic",
        underline: "underline",
        increasefontsize: "increasefontsize",
        decreasefontsize: "decreasefontsize",
        forecolor: "forecolor",
        justifyleft: "justifyleft",
        justifycenter: "justifycenter",
        justifyright: "justifyright",
        ul: "insertunorderedlist",
        ol: "insertorderedlist",
        createlink: "createlink",
        removeformat: "removeformat",
        undo: "undo",
        redo: "redo"
    },
    v = {
        bold: "加粗",
        italic: "斜体",
        underline: "下划线",
        increasefontsize: "增加字号",
        decreasefontsize: "减小字号",
        forecolor: "颜色",
        justifyleft: "左对齐",
        justifycenter: "居中对齐",
        justifyright: "右对齐",
        insertunorderedlist: "无序列表",
        insertorderedlist: "有序列表",
        createlink: "添加链接",
        removeformat: "清除格式",
        undo: "撤销",
        redo: "重做"
    };
    return m.prototype = {
        addButtonToToolbar: function(o, a) {
            var r, s = this;
            switch ("fontname" == o ? (r = d(g, "fontname"), l(r, "字体",
            function(e) {
                s.execCommand("fontname", e)
            })) : "formatblock" == o ? (r = d(p, "formatblock"), l(r, "标题",
            function(e) {
                s.execCommand("formatblock", e)
            })) : r = $('<a class="toolbar-item toolbar-item-' + o + '" data-hint="' + v[o] + '|bottom" data-command="' + o + '"></a>'), a ? r.insertAfter(a) : r.appendTo(this.toolbar), this.toolbar.is(":hidden") && this.toolbar.show(), o) {
            case "forecolor":
                ;
                e.call(this, r);
                break;
            case "createlink":
                t.call(this, r);
                break;
            case "increasefontsize":
            case "decreasefontsize":
                n.call(this, r, o);
                break;
            case "justifyleft":
            case "justifycenter":
            case "justifyright":
                i.call(this, r, o)
            }
            return r
        },
        getToolbar: function() {
            return this.toolbar
        },
        edit: function(e) {
            this.element = e.jquery ? e: $(e),
            this.doc = this.element[0].ownerDocument,
            this.window = this.doc.defaultView,
            this.iframe = this.window.frameElement,
            this.element.attr("contentEditable", !0).focus(),
            this.touch(),
            this.toolbar.css("visibility", "visible"),
            "true" != this.element.attr("data-bind-paste") && (this.element.attr("data-bind-paste", !0), this.element.bind("paste", $.proxy(function(e) {
                this.paste(e),
                e.preventDefault()
            },
            this))),
            this.element.keydown($.proxy(function(e) {
                13 == e.keyCode
            },
            this))
        },
        setCaret: function(e) {
            h(e, this.doc, this.window)
        },
        paste: function(e) {
            var t = this.window,
            n = (this.doc, e.originalEvent),
            i = n.clipboardData;
            r(t, i.getData("text/plain").replace(/\n/g, "<br />"))
        },
        resize: function() {
            var e = 0;
            this.toolbar.children().each(function() {
                e += $(this).outerWidth()
            })
        },
        touch: function() {
            if (this.element) {
                this.resize();
                var e, t, n = this.toolbar[0].getBoundingClientRect(),
                i = this.iframe.getBoundingClientRect(),
                o = this.element[0].getBoundingClientRect();
                t = o.top + i.top >= n.height + 12 ? o.top + i.top - n.height - 12 : Math.min(document.documentElement.clientHeight - n.height - 5, o.bottom + i.top + 5),
                e = o.left + i.left + (o.width - n.width) / 2,
                e + n.width > document.documentElement.clientWidth - 5 && (e = document.documentElement.clientWidth - n.width - 5),
                this.toolbar.css({
                    left: e,
                    top: t
                })
            }
        },
        exit: function() {
            this.element && this.element.attr("contenteditable", !1).blur(),
            this.element = null,
            this.toolbar.css("visibility", "hidden").find(".dropmenu ul").hide(),
            this.color && this.color.hide()
        },
        execCommand: function(e, t) {
            this.doc && this.doc.execCommand(e, !1, t || null)
        }
    },
    m
});