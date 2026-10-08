define(function(require) {
    require("./linkdialog/style.css");
    var $ = require("jquery"),
    e = require("class"),
    i = require("ui/dialog"),
    t = require("ui/radio"),
    a = require("ui/explorer"),
    n = require("ui/message"),
    l = require("control/select"),
    c = require("diy/runtime");
    $.fn.serializeObject || ($.fn.serializeObject = function() {
        var e = {},
        i = this.serializeArray();
        return $.each(i,
        function() {
            void 0 !== e[this.name] ? (e[this.name].push || (e[this.name] = [e[this.name]]), e[this.name].push(this.value || "")) : e[this.name] = this.value || ""
        }),
        e
    });
    var r = e({
        edit: function(e, i) {
            if (this.getDialog().open(), $.isPlainObject(e) || (e = {
                href: "",
                target: "_blank"
            }), e.href || (e.href = ""), e.href) {
                var a = PAGES_URL + c.getWorkspace().getProjectId();
                switch (e.href = decodeURI(e.href) || e.href, !0) {
                case 0 == e.href.indexOf(cfg_attachment) : e.type = "file",
                    this.rowFile.trigger("changed", [e.href]);
                    break;
                case 0 == e.href.indexOf(a) : e.type = "page",
                    this.rowPage.trigger("changed", [e.href]);
                    break;
                case 0 == e.href.indexOf("mailto:") : e.type = "email",
                    this.rowEmail.trigger("changed", [e.href.substr(7)])
                }
            }
            e.type && "url" != e.type || this.rowUrl.trigger("changed", [e.href]),
            "target" in e ? "_blank" != e.target && delete e.target: e.target = "_blank",
            "_blank" != e.target ? this.uncheckTarget() : this.checkTarget(),
            this.callback = i
        },
        getDialog: function() {
            if (this.dialog) return this.dialog;
            var e = this;
            return this.wrapper = $('<div class="ui-link-dialog"><form><div class="ui-dialog-title draggable">链接到</div><div class="ui-link-dialog-content"><div class="ui-link-dialog-row" data-type="url"><div class="radio" style="padding-top: 30px;"></div><div class="input"><label for="link-dialog-url">网页 URL</label><input id="link-dialog-url" class="input" type="text" name="href" placeholder="例如 http://www.ikuman.cn/" /></div></div><div class="ui-link-dialog-row" data-type="page"><div class="radio" style="padding-top: 28px;"></div><div class="input"><label for="link-dialog-pages">项目中的页面</label></div><div class="input select"><input name="href" type="hidden" /></div></div><div class="ui-link-dialog-row" data-type="file"><div class="radio" style="padding-top: 30px;"></div><div class="input"><label>资源文件</label><div class="link-dialog-file"><input name="href" type="hidden" /><input type="button" class="btn pick" value="选择文件" /><input type="button" class="btn repick" style="display: none;" value="重新选择" /><span class="link-dialog-label" style="display: none;"></span></div></div></div><div class="ui-link-dialog-row" data-type="email"><div class="radio" style="padding-top: 30px;"></div><div class="input"><label for="link-dialog-email">电子邮件地址</label><input name="href" id="link-dialog-email" class="input block" type="text" /></div></div></div><div class="ui-dialog-footer"><label style="font-size:12px;float:left;margin-top:5px;"><input type="checkbox" name="target" value="_blank" checked /> 在新窗口中打开链接</label><i class="clear" data-hint="清除链接"></i><input type="submit" class="btn btn-primary" value="确定" /></div></form></div>'),
            this.form = this.wrapper.find("form:first"),
            this.rows = this.wrapper.find(".ui-link-dialog-row"),
            this.pages = this.wrapper.find("#link-dialog-pages"),
            this.footer = this.wrapper.find(".ui-dialog-footer"),
            this.target = this.footer.find('[name="target"]'),
            this.initUrlRow(),
            this.initPageRow(),
            this.initFileRow(),
            this.initEmailRow(),
            this.rows.click(function() {
                $(this).trigger("check")
            }),
            this.footer.find("i.clear").click(function() {
                e.callback && e.callback(null),
                e.getDialog().close()
            }),
            this.form.submit(function() {
                var i, t, a;
                if (e.selected && (t = e.selected.find("[name=href]").val())) {
                    if (i = e.selected.data("type"), t = encodeURI(t) || t, "email" == i && (t = "mailto:" + t), "url" == i && !/^https?:\/\/.+/i.test(t)) return n.error("链接地址必须以 http:// 或 https:// 开头"),
                    !1;
                    e.target.prop("checked") && (a = "_blank"),
                    e.callback && e.callback({
                        href: t.replace('%7BPROJECT_PAGES_BASE%7D', '{PROJECT_PAGES_BASE}'),
                        target: a
                    }),
                    e.getDialog().close()
                } else n.error("链接地址不能为空");
                return ! 1
            }),
            this.dialog = new i({
                width: 425
            }),
            this.dialog.setContent(this.wrapper),
            this.dialog.bind("close", this.clear.bind(this)),
            this.dialog
        },
        initUrlRow: function() {
            var e, i, a, n, l = this;
            e = this.rowUrl = this.rows.filter('[data-type="url"]'),
            i = e.data("type"),
            a = new t(e.find(".radio"), {
                name: "type",
                value: i
            }),
            n = e.find("input"),
            e.on("check",
            function() {
                l.selected && l.selected.trigger("uncheck"),
                a.check(),
                e.addClass("check"),
                l.selected = e
            }),
            e.on("uncheck",
            function() {
                a.uncheck(),
                e.removeClass("check")
            }),
            e.on("changed",
            function(i, t) {
                e.trigger("check"),
                n.val(t || "")
            }),
            e.on("clear",
            function() {
                e.trigger("uncheck"),
                n.val("")
            })
        },
        initPageRow: function() {
            function e() {
                c.getWorkspace().getPages().forEach(function(e) {
                    s.addOption({
                        label: e.name,
                        value: e.url
                    })
                })
            }
            var i, a, n, r, s, o = this;
            i = this.rowPage = this.rows.filter('[data-type="page"]'),
            a = i.data("type"),
            n = new t(i.find(".radio"), {
                name: "type",
                value: a
            }),
            r = i.find("[name=href]"),
            s = new l({}).appendTo(i.find(".input.select")),
            c.getWorkspace().on("pageupdate",
            function() {
                s.clearOptions(),
                e()
            }),
            e(),
            s.on("change",
            function(e) {
                r.val(e || "")
            }),
            i.on("check",
            function() {
                o.selected && o.selected.trigger("uncheck"),
                n.check(),
                i.addClass("check"),
                o.selected = i
            }),
            i.on("uncheck",
            function() {
                n.uncheck(),
                i.removeClass("check")
            }),
            i.on("changed",
            function(e, t) {
                i.trigger("check"),
                r.val(t || ""),
                s.value(t || "")
            }),
            i.on("clear",
            function() {
                i.trigger("uncheck"),
                r.val(""),
                s.value("")
            })
        },
        initFileRow: function() {
            function e(e) {
				var base = c.getWorkspace().getValueByMacro("PROJECT_ATTACHMENTS_BASE"), src = e;
				e = e.replace(base, "");
                o.val(base + e),
                d.text(e),
                d.css("text-overflow", "'..." + (e + "").substr( - 10) + "'"),
                d.attr("data-hint", e),
                e ? (r.hide(), s.show(), d.show()) : (r.show(), s.hide(), d.hide())
            }
            function i() {
                return n.trigger("check"),
                a.open({
                    success: e
                }),
                !1
            }
            var n, l, cr, r, s, o, d, h = this;
            n = this.rowFile = this.rows.filter('[data-type="file"]'),
            l = n.data("type"),
            cr = new t(n.find(".radio"), {
                name: "type",
                value: l
            }),
            r = n.find(".btn.pick"),
            s = n.find(".btn.repick"),
            o = n.find("[name=href]"),
            d = n.find(".link-dialog-label"),
            r.click(i),
            s.click(i),
            n.on("check",
            function() {
                h.selected && h.selected.trigger("uncheck"),
                cr.check(),
                n.addClass("check"),
                h.selected = n
            }),
            n.on("uncheck",
            function() {
                cr.uncheck(),
                n.removeClass("check")
            }),
            n.on("changed",
            function(i, t) {
                n.trigger("check"),
                e(t || "")
            }),
            n.on("clear",
            function() {
                n.trigger("uncheck"),
                d.text("").hide(),
                o.val(""),
                r.show(),
                s.hide()
            })
        },
        initEmailRow: function() {
            var e, i, a, n, l = this;
            e = this.rowEmail = this.rows.filter('[data-type="email"]'),
            i = e.data("type"),
            a = new t(e.find(".radio"), {
                name: "type",
                value: i
            }),
            n = e.find("input"),
            e.on("check",
            function() {
                l.selected && l.selected.trigger("uncheck"),
                a.check(),
                e.addClass("check"),
                l.selected = e
            }),
            e.on("uncheck",
            function() {
                a.uncheck(),
                e.removeClass("check")
            }),
            e.on("changed",
            function(i, t) {
                e.trigger("check"),
                n.val(t || "")
            }),
            e.on("clear",
            function() {
                e.trigger("uncheck"),
                n.val("")
            })
        },
        checkTarget: function() {
            this.target.prop("checked", !0)
        },
        uncheckTarget: function() {
            this.target.prop("checked", !1)
        },
        clear: function() {
            this.selected = null,
            this.callback = null,
            this.rows.trigger("clear")
        }
    });
    return new r
});

