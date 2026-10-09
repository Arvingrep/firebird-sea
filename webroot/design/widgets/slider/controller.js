define(function(require) {
    function t(t, a) {
        p || (p = new h({
            width: 836
        })),
        w ? (y.detach(), w.find(".item").remove()) : (w = $('<div class="ui-manageimage-dialog"><div class="ui-dialog-title">管理图片</div><div class="ui-manageimage-content"><ul class="w-manageimage-list sortable"><li class="addItem"><span>添加图片</span></li></ul><div class="altwrap"><div class="title">描述</div><form action=""><textarea class="input" name="alt" id="alt" cols="30" rows="10"></textarea><div><input type="submit" value="保存" /><input type="reset" value="取消" /></div></form></div></div><div class="ui-dialog-footer"><a href="" class="save">保 存</a></div></div>'), b = $(".addItem", w), b.click(function(t) {
            t.preventDefault(),
            e()
        }), y = $(".altwrap", w), $("form", y).submit(function(t) {
            t.preventDefault();
            var e = y.find("textarea").val(),
            i = y.parent(),
            a = JSON.parse(JSON.stringify(i.data("item")));
            a.alt = e,
            i.data("item", a),
            y.hide();
            var n = i.find(".alt");
            r(n, e),
            n.removeClass("hover")
        }), $("input[type=reset]", y).click(function(t) {
            t.preventDefault(),
            y.hide(),
            y.parents(".item").find(".alt").removeClass("hover")
        }), n(w));
        var s = $(".save", w);
        s.off().one("click",
        function(t) {
            t.preventDefault();
            var e = [];
            $.each(w.find(".item"),
            function(t, i) {
                var a = $(i);
                e.push(a.data("item"))
            }),
            a(e.concat()),
            p.close()
        }),
        p.open(0 === S ? w: null),
        i(t),
        S = 1
    }
    function e() {
        u.open({
            filter: "image",
            multiple: !0,
            success: function(t, e) {
                i([{
                    url: "",
                    src: t,
                    alt: "",
                    name: e
                }])
            }
        })
    }
    function i(t) {
        t && $.each(t,
        function(t, e) {
            // var i = $('<li class="item"><div class="thumb"><img style="display:none;cursor:move;" src="' + e.src + '" /></div><div class="toolbar" style="display:none"><a class="link" href="" title="链接"></a><a class="alt" href="" title="描述"></a><a class="edit" href="" title="编辑"></a><a class="remove" href="" title="删除"></a></div></li>');
            var i = $('<li class="item"><div class="thumb"><img style="display:none;cursor:move;" src="' + e.src + '" /></div><div class="toolbar" style="display:none"><a class="link" href="" title="链接"></a><a class="alt" href="" title="描述"></a><a class="remove" href="" title="删除"></a></div></li>');
            b.before(i);
            var n = i.find(".thumb>img");
            a(n),
            i.mouseenter(function() {
                $(".toolbar").fadeOut("fast"),
                $(".toolbar", $(this)).stop().fadeIn("fast")
            }).mouseleave(function() {
                $(".toolbar", $(this)).stop().fadeOut("fast")
            });
            var s = (i.find(".toolbar"), i.find(".toolbar>.link")),
            l = i.find(".toolbar>.alt"),
            d = i.find(".toolbar>.edit"),
            o = i.find(".toolbar>.remove");
            s.click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item"),
                a = i.data("item");
                f.edit({
                    href: a.url,
                    target: "target" in a ? a.target: "_blank"
                },
                function(t) {
                    t || (t = {
                        href: ""
                    });
                    var a = t.href;
                    r(e, a);
                    var n = JSON.parse(JSON.stringify(i.data("item")));
                    n.url = a,
                    n.target = t.target || "",
                    i.data("item", n)
                })
            }),
            r(l, e.alt),
            l.click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item"),
                a = i.data("item").alt;
                y.find("textarea").val(a),
                w.find(".alt").removeClass("hover"),
                y.show(),
                i.append(y),
                e.addClass("hover"),
                i.siblings().find(".toolbar").hide()
            }),
            d.click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item"),
                a = JSON.parse(JSON.stringify(i.data("item"))),
                n = new g(a.src);
                n.bind("saved",
                function(t) {
                    a.src = t.file,
                    i.find(".thumb img").attr("src", a.src),
                    i.data("item", a)
                })
            }),
            o.click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item");
                i.remove()
            }),
            i.data("item", e)
        })
    }
    function a(t) {
        var e = t.parent(),
        i = new Image;
        $(i).load(function() {
            var i = e.width(),
            a = e.height(),
            n = this.width,
            r = this.height,
            s = i / n,
            l = a / r,
            d = i > n || a > r ? 1 : Math.max(s, l);
            t.css({
                width: n * d,
                height: r * d
            }),
            t.css({
                marginTop: (a - t.height()) / 2
            }),
            t.fadeIn(),
            e.addClass("loaded")
        }),
        i.setAttribute("src", t.attr("src"))
    }
    function n(t) {
        t.find(".sortable").dragsort({
            dragSelector: ".item",
            placeHolderTemplate: "<li class='placeHolder'></li>",
            dragEnd: function() {
                b.next() && b.parent().append(b)
            }
        })
    }
    function r(t, e) {
        t[(e.length > 0 ? "add": "remove") + "Class"]("active")
    }
    var s = require("class"),
    $ = require("jquery"),
    l = require("diy/widget/controller"),
    d = require("diy/widget/setting"),
    o = require("diy/panel/tabview/setting"),
    c = require("diy/runtime"),
    h = require("ui/dialog"),
    u = require("ui/explorer"),
    f = require("ui/linkdialog"),
    g = (require("ui/dragsort"), require("ui/imageditor")),
    m = (require("ui/hint"), require("control/length")),
    v = require("diy/panel/panel");
    require("ui/compo-updown"),
    require("./controller.css"),
    u.projectid = c.getProjectId();
    var p, w, b, y, S = 0,
    O = "slider";
    o.createSection(O, {
        initView: function() {
            var t, e = this,
            i = this.addRow("slider-panel-edit"),
            a = $('<input value="管理图片" class="edit" type="button" />');
            i.getElement().append(a),
            a.on("click",
            function(t) {
                t.preventDefault(),
                e.getOutlet().manageImage()
            });
            var i = this.addRow();
            t = i.addCell("options"),
            t.addLabel("宽度");
            var n = new m({
                value: this.getOutlet()._width
            });
            n.appendTo(t.getElement()),
            n.on("change",
            function(t) {
                e.getOutlet().setParam("width", t)
            });
            var i = this.addRow();
            t = i.addCell("options"),
            t.addLabel("高度");
            var r = new m({
                value: this.getOutlet()._height
            });
            r.appendTo(t.getElement()),
            r.on("change",
            function(t) {
                e.getOutlet().setParam("height", t)
            })
        },
        getTitle: function() {
            return "设置"
        }
    });
    var _ = s({
        setup: function(i) {
            var a = this,
            n = this.getWidget(),
            r = n.getElement(),
            s = n.getTheme();
            this.inited = 1,
            this.setParamSlider(i.slider || []),
            this.setParamWidth(i.width || "100%"),
            this.setParamHeight(i.height || "300"),
            this.inited = 0,
            this.render(),
            s.on("themechange",
            function() {
                a.render()
            }),
            s.on("stylechange",
            function() {
                a.render()
            }),
            n.on("placed",
            function() {
                a.render()
            }),
            r.on("click",
            function(t) {
                t.preventDefault()
            }),
            i.slider || (t(i.slider || [],
            function(t) {
                a.setParam("slider", JSON.parse(JSON.stringify(t)))
            }), e())
        },
        getParamSlider: function() {
            return this._slider
        },
        getParamWidth: function() {
            return this._width
        },
        getParamHeight: function() {
            return this._height
        },
        setParamSlider: function(t) {
            this._slider = t,
            1 !== this.inited && this.render()
        },
        setParamWidth: function(t) {
            this._width = t,
            1 !== this.inited && this.render()
        },
        setParamHeight: function(t) {
            this._height = t,
            1 !== this.inited && this.render()
        },
        render: function() {
            var t = this._slider,
            e = this.getWidget(),
            i = e.getRender(),
            a = e.getElement();
            return t.length ? (a.attr({
                "data-width": this._width,
                "data-height": this._height
            }), void i(!0, a.empty(), t, a)) : void a.empty()
        },
        getName: function() {
            return O
        },
        manageImage: function() {
            var e = this,
            i = this._slider.concat();
            t(i,
            function(t) {
                e.setParam("slider", JSON.parse(JSON.stringify(t)))
            })
        },
        toJSON: function() {
            return {
                slider: this._slider,
                width: this._width,
                height: this._height
            }
        }
    },
    d),
    P = s({
        setup: function(t) {
            {
                var e = this.getWidget();
                e.getPage()
            }
            this.sliderSetting = new _(e, t.params || {}),
            e.addOutlet(this.sliderSetting),
            e.on("dblclick",
            function() {
                v.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.sliderSetting.toJSON()
            }
        }
    },
    l);
    return P
});
