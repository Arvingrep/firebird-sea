define(function(require) {
    function t(t) {
        h.open({
            filter: "image",
            success: t,
            multiple: !0
        })
    }
    function e(t, e, i) {
        c.edit({
            href: /^https?:\/\/.+/i.test(e) ? e: "",
            target: "_blank" == i ? i: "_self"
        },
        t)
    }
    function i(t) {
        if (!t.hasClass("hover")) {
            var e = t.parents(".w-gallery").attr("data-alt"),
            i = $("#" + e),
            a = t[0].ownerDocument,
            n = a.defaultView,
            l = n.frameElement,
            r = l.getBoundingClientRect().left,
            s = l.getBoundingClientRect().top,
            o = t.outerHeight() + t[0].getBoundingClientRect().top + s,
            d = t[0].getBoundingClientRect().left + r;
            d + i.width() > $(n).width() && (d = r + $(l).innerWidth() - i.width() - 40),
            o + i.height() > $(n).height() && (o = o - i.height() - t.height() - 10),
            i.show().css({
                left: d,
                top: o
            });
            var h = t.parents(".item");
            $("textarea", i).val(h.data("item").title).focus(),
            h.siblings().find(".alt").removeClass("hover"),
            t.addClass("hover"),
            i.data("touch", h)
        }
    }
    function a(t, e) {
        t[(e.length > 0 ? "add": "remove") + "Class"]("active")
    }
    function n() {
        var t = $(".altwrap"),
        e = t.data("touch"),
        i = $(".alt", e);
        $("textarea", t).val(""),
        i.removeClass("hover"),
        t.removeData("touch"),
        t.hide()
    }
    var l = require("class"),
    r = require("diy/widget/controller"),
    s = require("diy/widget/setting"),
    o = require("diy/panel/tabview/setting"),
    d = require("diy/runtime"),
    $ = require("jquery"),
    h = require("ui/explorer"),
    c = require("ui/linkdialog"),
    g = require("ui/imageditor"),
    u = require("diy/panel/panel"),
    m = require("control/options"),
    p = require("control/switcher");
    require("./controller.css"),
    h.projectid = d.getProjectId();
    var f = "gallery.set";
    o.createSection(f, {
        initView: function() {
            var e, i = this,
            a = this.addRow("gallery-panel-add"),
            n = $('<input value="添加图片" class="add" type="button" />');
            a.getElement().append(n),
            n.on("click",
            function(e) {
                e.preventDefault(),
                t(function(t, e) {
                    var a = i.getOutlet();
                    a.isRecord = 1,
                    a.newItem({
                        image: t,
                        name: e,
                        url: "",
                        title: ""
                    })
                })
            }),
            e = this.addRow().addCell("options cols"),
            e.addLabel("列数");
            var l = new m({
                options: [1, 2, 3, 4, 5, 6, 7, 8],
                uncheck: !1,
                width: 140
            });
            l.appendTo(e.getElement()),
            l.on("change",
            function(t) {
                i.applyToOutlet("column", t)
            }),
            this.columnField = l,
            e = this.addRow().addCell("options"),
            e.addLabel("裁切");
            var r = new m({
                options: [{
                    label: "无",
                    value: "none"
                },
                {
                    label: "长方形",
                    value: "oblong"
                },
                {
                    label: "正方形",
                    value: "square"
                }],
                uncheck: !1,
                width: 140
            });
            r.appendTo(e.getElement()),
            r.on("change",
            function(t) {
                i.applyToOutlet("clip", t)
            }),
            this.clipField = r,
            e = this.addRow().addCell("options"),
            e.addLabel("间距");
            var s = new m({
                options: [{
                    label: "无",
                    value: 0
                },
                {
                    label: "小",
                    value: 4
                },
                {
                    label: "中",
                    value: 8
                },
                {
                    label: "大",
                    value: 12
                }],
                uncheck: !1,
                width: 140
            });
            s.appendTo(e.getElement()),
            s.on("change",
            function(t) {
                i.applyToOutlet("margin", t)
            }),
            this.marginField = s,
            e = this.addRow().addCell("options"),
            e.addLabel("相框");
            var o = new m({
                options: [{
                    label: "无",
                    value: 0
                },
                {
                    label: "薄",
                    value: 2
                },
                {
                    label: "中",
                    value: 4
                },
                {
                    label: "厚",
                    value: 7
                }],
                uncheck: !1,
                width: 140
            });
            o.appendTo(e.getElement()),
            o.on("change",
            function(t) {
                i.applyToOutlet("border", t)
            }),
            this.borderField = o,
            e = this.addRow().addCell("options"),
            e.addLabel("标题位置");
            var d = new m({
                options: [{
                    label: "底部",
                    value: "bottom"
                },
                {
                    label: "覆盖",
                    value: "over"
                }],
                uncheck: !1,
                width: 140
            });
            d.appendTo(e.getElement()),
            d.on("change",
            function(t) {
                i.applyToOutlet("titlepos", t)
            }),
            this.titleposField = d,
            e = this.addRow().addCell("options"),
            e.addLabel("点击放大");
            var h = new p;
            h.appendTo(e.getElement()),
            h.on("change",
            function(t) {
                i.applyToOutlet("lightbox", t)
            }),
            this.lightboxField = h
        },
        getTitle: function() {
            return "图片设置"
        },
        getClasses: function() {
            return "gallery-panel-edit"
        },
        syncParamColumn: function(t) {
            this.columnField.value(t)
        },
        syncParamGallery: function() {},
        syncParamClip: function(t) {
            this.clipField.value(t)
        },
        syncParamMargin: function(t) {
            this.marginField.value(t)
        },
        syncParamBorder: function(t) {
            this.borderField.value(t)
        },
        syncParamTitlepos: function(t) {
            this.titleposField.value(t)
        },
        syncParamLightbox: function(t) {
            this.lightboxField.value(t)
        }
    });
    var v = l({
        setup: function(t) {
            {
                var e = this,
                i = this.getWidget();
                i.getElement(),
                i.getTheme()
            }
            this.isInit = 1,
            this.initContainer(),
            t = t || {},
            this.setParamColumn(t.column || 3),
            this.setParamClip(t.clip || "none"),
            this.setParamMargin(t.margin || 4),
            this.setParamBorder(t.border || 2),
            this.setParamTitlepos(t.titlepos || "bottom"),
            this.setParamLightbox(t.lightbox || !1),
            this.setParamGallery(t.gallery || []),
            this._gallery.length && (this.initGallery(), this.dimensions()),
            i.on("placed",
            function() {
                e.dimensions()
            }),
            this.isInit = 0
        },
        getParamColumn: function() {
            return this._column
        },
        getParamClip: function() {
            return this._clip
        },
        getParamMargin: function() {
            return this._margin
        },
        getParamBorder: function() {
            return this._border
        },
        getParamTitlepos: function() {
            return this._titlepos
        },
        getParamLightbox: function() {
            return this._lightbox
        },
        getParamGallery: function() {
            return this._gallery
        },
        setParamColumn: function(t) {
            this._column = t,
            1 !== this.isInit && (this.dimensions(), this.emit("paramset", "column", t))
        },
        setParamClip: function(t) {
            this._clip = t,
            1 !== this.isInit && (this.dimensions(), this.emit("paramset", "clip", t))
        },
        setParamMargin: function(t) {
            this._margin = t,
            1 !== this.isInit && (this.dimensions(), this.margin(), this.emit("paramset", "margin", t))
        },
        setParamBorder: function(t) {
            this._border = t,
            1 !== this.isInit && (this.dimensions(), this.padding(), this.emit("paramset", "border", t))
        },
        setParamTitlepos: function(t) {
            this._titlepos = t,
            this.title("change"),
            this.emit("paramset", "titlepos", t)
        },
        setParamLightbox: function(t) {
            this._lightbox = t,
            this.emit("paramset", "lightbox", t)
        },
        setParamGallery: function(t) {
            this._gallery = t,
            0 === this.isRecord && ($(">.imageGallery", this.container).empty(), this.initGallery(), this.dimensions()),
            this.emit("paramset", "gallery", t)
        },
        _setParamGallery: function(t, e, i, a) {
            var n = JSON.parse(JSON.stringify(t));
            "add" == e ? n.push(i) : "update" == e ? n[a] = i: n = i,
            this.isRecord = 1,
            this.setParam("gallery", n),
            this.isRecord = 0
        },
        getName: function() {
            return f
        },
        initGallery: function() {
            var t = this;
            $.each(t.getParamGallery(),
            function(e, i) {
                t.newItem(i)
            })
        },
        initContainer: function() {
            var t = this;
            if (!this.container) {
                this.container = $('<div class="imageGalleryContainer"><ul class="imageGallery" data-istitle="false" style="overflow:hidden;zoom:1;"></ul></div>').appendTo(this.getWidget().getElement()),
                this.container.on("click", "a",
                function(t) {
                    t.preventDefault()
                });
                var e = "altwrap" + +new Date;
                this.getWidget().getElement().attr("data-alt", e);
                var i = $('<div class="altwrap" style="display:none;" id="' + e + '"><div class="title">标题</div><form action=""><textarea class="input" name="alt" id="alt" cols="30" rows="10"></textarea><div><input type="submit" value="保存" /><input type="reset" value="取消" /></div></form></div>').appendTo(document.body);
                $("#" + e).find("form").submit(function(e) {
                    e.preventDefault();
                    var l = $(this).find("textarea").val(),
                    r = i.data("touch"),
                    s = JSON.parse(JSON.stringify(r.data("item")));
                    s.title = l,
                    t._setParamGallery(t._gallery, "update", s, r.index()),
                    r.data("item", s);
                    var o = $(".alt", r);
                    a(o, l),
                    n(),
                    t.title(r, s.title)
                }),
                $('input[type="reset"]', i).click(function() {
                    n()
                }),
                1 !== this.isInit && this.dragSort()
            }
            return this.container
        },
        newItem: function(t) {
            var e = this.container,
            i = $('<li class="item" style="vertical-align:top;"><div class="marginItem"><div class="borderItem"></div></div><p class="bottom-title" style="display:none;"><a href="" class="gallerylink"></a></p></li>'),
            n = $('<img src="' + t.image + '" alt="" class="thumb" style="cursor:move;border:none;max-width:none;position:absolute;visibility:hidden;opacity:0;" />'),
            l = $('<a target="' + t.target + '" href="' + t.url + '" style="position:relative;display:block;overflow:hidden;zoom:1;" title="" class="gallerylink fancybox" data-fancybox-group="gallery"><p style="display:none;" class="over-title"></p></a>'),
            // r = $('<div class="toolbar" style="position:absolute;right:5px;top:0;"><a class="link" href="" title="链接"></a><a class="alt" href="" title="描述"></a><a class="edit" href="" title="编辑"></a><a class="remove" href="" title="删除"></a></div>'),
            r = $('<div class="toolbar" style="position:absolute;right:5px;top:0;"><a class="link" href="" title="链接"></a><a class="alt" href="" title="描述"></a><a class="remove" href="" title="删除"></a></div>'),
            s = $(".borderItem", i).append(l).addClass("loading");
            i.appendTo($(">.imageGallery", e)).append(r),
            1 === this.isInit && r.hide(),
            l.append(n),
            n.load(function() {
                s.removeClass("loading").css("minHeight", 0)
            }),
            this.dimensions(),
            this.padding(),
            this.margin(),
            this.addToolbarEvent(i),
            i.data("item", [t].concat()[0]),
            this.title(i, i.data("item").title),
            a($(".link", r), i.data("item").url),
            a($(".alt", r), i.data("item").title),
            1 !== this.isInit && 1 === this.isRecord && this._setParamGallery(this._gallery, "add", i.data("item"))
        },
        padding: function() {
            var t = this._border,
            e = this.container.find(".borderItem");
            e.css(0 === parseInt(t, 10) ? {
                padding: 0,
                borderWidth: 0
            }: {
                border: "1px solid #ccc",
                padding: t + "px"
            })
        },
        margin: function() {
            $(".marginItem", this.container).css("padding", this._margin)
        },
        dimensions: function() {
            var t, e = this._column,
            i = this.container.innerWidth(),
            a = this._clip,
            n = i / e,
            l = 1.3,
            r = n / i * 100;
            "oblong" == a || "none" == a ? t = n / l: "square" == a && (t = n);
            var s = this.container;
            $(".item", this.container).css({
                width: r + "%"
            }),
            $(".gallerylink", s).css({
                paddingBottom: "oblong" == a || "none" == a ? "75%": "100%"
            }),
            this.drawImage()
        },
        drawImage: function() {
            var t = this._clip,
            e = function(e) {
                var a = e,
                n = a.parent(),
                l = function() {
                    var e, l = n.innerWidth(),
                    r = n.innerHeight(),
                    s = l / a.attr("_width"),
                    o = r / a.attr("_height"),
                    d = a.attr("_width"),
                    h = a.attr("_height");
                    e = "none" == t ? l > d && r > h ? 1 : Math.min(s, o) : Math.max(s, o);
                    var c = d * e;
                    a.css({
                        width: c / l * 100 + "%",
                        visibility: "visible"
                    }),
                    i(a),
                    a.animate({
                        opacity: 1
                    })
                };
                if (a.attr("_width") && a.attr("_height")) l();
                else {
                    var r = new Image;
                    $(r).load(function() {
                        a.attr({
                            _width: this.width,
                            _height: this.height
                        }),
                        l()
                    }),
                    r.src = a.attr("src")
                }
            },
            i = function(t) {
                var e = t.parent(),
                i = e.innerWidth(),
                a = e.innerHeight(),
                n = (i - t.width()) / 2,
                l = (a - t.height()) / 2;
                t.css({
                    left: n / i * 100 + "%",
                    top: l / a * 100 + "%"
                })
            };
            $(".thumb", this.container).each(function(t, i) {
                e($(i))
            })
        },
        addToolbarEvent: function(t) {
            var n = this;
            $(".link", t).click(function(t) {
                t.preventDefault();
                var i = $(t.target),
                l = i.parents(".item"),
                r = $(".gallerylink", l);
                e(function(t) {
                    t || (t = {
                        href: ""
                    });
                    var e = t.href;
                    r.attr("href", e);
                    var s = "_blank" == t.target ? "_blank": "_self";
                    r.attr("target", s),
                    a(i, e);
                    var o = JSON.parse(JSON.stringify(l.data("item")));
                    o.url = e,
                    o.target = s,
                    l.data("item", o),
                    n._setParamGallery(n._gallery, "update", o, l.index())
                },
                r.attr("href"), r.attr("target"))
            }),
            $(".remove", t).click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item"),
                a = i.index(),
                l = JSON.parse(JSON.stringify(n._gallery));
                l.splice(a, 1),
                n.setParam("gallery", l),
                i.remove()
            }),
            $(".alt", t).click(function(t) {
                t.preventDefault();
                var e = $(t.target);
                i(e)
            }),
            $(".edit", t).click(function(t) {
                t.preventDefault();
                var e = $(t.target),
                i = e.parents(".item"),
                a = JSON.parse(JSON.stringify(i.data("item"))),
                l = new g(a.image);
                l.bind("saved",
                function(t) {
                    a.image = t.file,
                    n._setParamGallery(n._gallery, "update", a, i.index()),
                    i.find(".thumb").attr("src", a.image)
                })
            })
        },
        displayToolbar: function(t) {
            $(".toolbar", this.container)[t]()
        },
        dragSort: function() {
            var t = this,
            e = this.container,
            i = $;
            this.getPage().use("ui/dragsort").done(function($) {
                var a = function() {
                    return ! 1
                },
                n = $(e[0]).find(".imageGallery"),
                l = n.find(".item").first(),
                r = l.clone();
                $("img", r).css("visibility", "hidden");
                var s = '<li class="placeHolder" style="display:inline-block;visibility:hidden;">' + r.html() + "</li>",
                o = n.dragsort({
                    dragSelector: ".item",
                    placeHolderTemplate: s,
                    dragStart: function() {
                        if (this.placeHolderItem) {
                            this.placeHolderItem.empty();
                            var t = this.draggedItem.clone();
                            t.find("img").css("visibility", "hidden"),
                            this.placeHolderItem.html(t.html())
                        }
                    },
                    dragEnd: function() {
                        var n = this.find(".marginItem a");
                        n.bind("click", a),
                        setTimeout(function() {
                            n.unbind("click", a)
                        },
                        500);
                        var l = [];
                        $.each(e.find(".item"),
                        function(t, e) {
                            l.push(i(e).data("item"))
                        }),
                        t._setParamGallery(t._gallery, 1, l)
                    }
                });
                t._dragsort = $(o.selector)
            })
        },
        title: function(t, e) {
            var i = this._titlepos;
            if ("change" === t) {
                var a = this.container,
                n = $(".item", a);
                n.length && n.each(function(t, e) {
                    var a = $(".over-title", $(e)),
                    n = $(".bottom-title", $(e));
                    "bottom" === i ? (a.hide(), n.show()) : (a.text().length > 0 && a.show(), n.hide())
                })
            } else {
                var l = $(".over-title", t),
                r = $(".bottom-title", t);
                l.text(e),
                r.find("a").text(e),
                r.show(),
                t.attr("data-bottom-title-height", r.find(">a").height()),
                r.hide();
                var s = [],
                o = t.parent().find(".item");
                o.each(function() {
                    s.push(parseInt($(this).attr("data-bottom-title-height"), 10))
                });
                var d = Math.max.apply(null, s),
                h = s.indexOf(d),
                c = o.eq(h).attr("data-bottom-title-height");
                o.each(function() {
                    var t = $(this).find(".bottom-title");
                    t.height(c)
                }),
                "bottom" === i ? (l.hide(), r.show()) : "over" === i && (r.hide(), e.length > 0 ? l.show() : l.hide())
            }
        },
        toJSON: function() {
            var t = this;
            return $.each(this.container.find(".item .thumb"),
            function(e, i) {
                t._gallery[e].thumb_css = i.style.cssText
            }),
            {
                column: this._column,
                margin: this._margin,
                border: this._border,
                clip: this._clip,
                lightbox: this._lightbox,
                gallery: this._gallery,
                titlepos: this._titlepos
            }
        }
    },
    s),
    y = l({
        setup: function(t) {
            {
                var e = this,
                i = this.getWidget();
                i.getPage()
            }
            this.gallerySetting = new v(i, t.params || {}),
            i.addOutlet(this.gallerySetting),
            this.gallerySetting.container.attr("title", "双击，可编辑图片调整图片顺序"),
            this.on("dblclick",
            function() {
                1 != e._isMovable && (e.gallerySetting.container.attr("title", ""), e.gallerySetting.dragSort(), e.gallerySetting.displayToolbar("show"), e._isMovable = 1, u.toSettingTab())
            }),
            this.on("blur",
            function() {
                e.gallerySetting.container.attr("title", "双击，可编辑图片调整图片顺序"),
                e.gallerySetting._dragsort && e.gallerySetting._dragsort.trigger("dragsort-uninit"),
                e.gallerySetting.displayToolbar("hide"),
                n(),
                e._isMovable = 0
            }),
            d.on("designmodechange",
            function(t) {
                0 === t && (e.gallerySetting._dragsort && e.gallerySetting._dragsort.trigger("dragsort-uninit"), e.gallerySetting.displayToolbar("hide"), n(), e._isMovable = 0)
            })
        },
        handleMouseDown: function() {
            return 1 === this._isMovable ? !1 : void 0
        },
        toJSON: function() {
            return {
                params: this.gallerySetting.toJSON()
            }
        }
    },
    r);
    return y
});
