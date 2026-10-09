define(function(require) {
    require("./controller.css");
    var t = require("class"),
    $ = require("jquery"),
    e = require("diy/widget/controller"),
    i = require("diy/panel/panel"),
    a = require("diy/panel/tabview/setting"),
    n = require("diy/widget/setting"),
    g = require("control/switcher"),
    s = require("control/text-align"),
    l = require("control/input"),
    r = require("control/length"),
    o = require("control/options"),
    h = require("control/color"),
    d = require("ui/imageditor"),
    m = require("ui/linkdialog"),
    c = require("ui/explorer"),
    p = require("ui/imageresizer"),
    u = "image.image";
    a.createSection(u, {
        initView: function() {
            var t, e, i = this;
            t = this.addRow("empty"),
            e = t.addCell(),
            this.btnSet = $('<input type="button" class="btn btn-primary btn-block" value="设置图片" />'),
            this.btnSet.appendTo(e.getElement()),
            this.btnSet.click(function() {
                i.getOutlet().getWidget().callController("pickImage")
            }),
            // t = this.addRow("not-empty"),
            // e = t.addCell(),
            // this.btnEdit = $('<input type="button" class="btn btn-primary btn-block" value="编辑图片" />'),
            // this.btnEdit.appendTo(e.getElement()),
            // this.btnEdit.click(function() {
            //     var t = new d(i.getOutlet().getParamImage());
            //     t.bind("saved",
            //     function(t) {
            //         t && t.file && i.applyToOutlet("image", t.file)
            //     })
            // }),
            t = this.addRow("not-empty"),
            e = t.addCell(),
            this.btnRepick = $('<input type="button" class="btn btn-block" value="重新选择" />'),
            this.btnRepick.appendTo(e.getElement()),
            this.btnRepick.click(function() {
                i.getOutlet().getWidget().callController("pickImage")
            }),
            e = t.addCell(),
            this.btnLink = $('<input type="button" class="btn btn-block" value="设置链接" />'),
            this.btnLink.appendTo(e.getElement()),
            this.btnLink.click(function() {
                i.getOutlet().getWidget().callController("setLink")
            }),
            t = this.addRow("not-empty width-height"),
            e = t.addCell(),
            e.addLabel("宽度"),
            this.fieldWidth = new r({
                width: 62
            }),
            this.fieldWidth.appendTo(e.getElement()),
            this.fieldWidth.on("change",
            function(t) {
                i.applyToOutlet("width", t)
            }),
            e = t.addCell(),
            e.addLabel("高度"),
            this.fieldHeight = new r({
                width: 62
            }),
            this.fieldHeight.appendTo(e.getElement()),
            this.fieldHeight.on("change",
            function(t) {
                i.applyToOutlet("height", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell("options"),
            e.addLabel("图片对齐"),
            this.fieldAlign = new s({
                width: 157
            }),
            this.fieldAlign.appendTo(e.getElement()),
            this.fieldAlign.on("change",
            function(t) {
                i.applyToOutlet("align", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell(),
            e.addLabel("点击放大"),
            this.fieldLightbox = new g,
            this.fieldLightbox.appendTo(e.getElement()),
            this.fieldLightbox.on("change",
            function(t) {
                i.applyToOutlet("lightbox", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell(),
            e.addLabel("标题文字"),
            this.fieldTitle = new l({
                width: 157
            }),
            this.fieldTitle.appendTo(e.getElement()),
            this.fieldTitle.on("change",
            function(t) {
                i.applyToOutlet("title", t)

            }),
            t = this.addRow("not-empty"),
            e = t.addCell("options"),
            e.addLabel("相框厚度"),
            this.fieldPadding = new o({
                width: 157,
                value: "",
                options: [{
                    label: "无",
                    value: ""
                },
                {
                    label: "细",
                    value: "1px"
                },
                {
                    label: "中",
                    value: "3px"
                },
                {
                    label: "粗",
                    value: "6px"
                }],
                uncheck: !1
            }),
            this.fieldPadding.appendTo(e.getElement()),
            this.fieldPadding.on("change",
            function(t) {
                i.applyToOutlet("padding", t)
            }),
            t = this.addRow("not-empty"),
            e = t.addCell(),
            e.addLabel("相框颜色"),
            this.fieldBorderColor = new h({
                width: 157
            }),
            this.fieldBorderColor.appendTo(e.getElement()),
            this.fieldBorderColor.on("change",
            function(t) {
                i.applyToOutlet("borderColor", t)
            }),
            this.empties = this.element.find(".empty"),
            this.notEmpties = this.element.find(".not-empty")
        },
        getTitle: function() {
            return "图片设置"
        },
        getClasses: function() {
            return "image"
        },
        syncParamImage: function(t) {
            t ? (this.notEmpties.appendTo(this.content), this.empties.detach()) : (this.notEmpties.detach(), this.empties.appendTo(this.content))
        },
        syncParamWidth: function(t) {
            this.fieldWidth.value(t)
        },
        syncParamHeight: function(t) {
            this.fieldHeight.value(t)
        },
        syncParamAlign: function(t) {
            this.fieldAlign.value(t)
        },
        syncParamLightbox: function(t) {
            this.fieldLightbox.value(Number(t))
        },
        syncParamTitle: function(t) {
            this.fieldTitle.value(t)
        },
        syncParamPadding: function(t) {
            this.fieldPadding.value(t)
        },
        syncParamBorderColor: function(t) {
            this.fieldBorderColor.value(t)
        }
    });
    var f = t({
        setup: function(t) {
            t && ("image" in t && this.setParamImage(t.image), "width" in t && this.setParamWidth(t.width), "height" in t && this.setParamHeight(t.height), "align" in t && this.setParamAlign(t.align), "lightbox" in t && this.setParamLightbox(t.lightbox), "link" in t && this.setParamLink(t.link), "title" in t && this.setParamTitle(t.title), "padding" in t && this.setParamPadding(t.padding), "borderColor" in t && this.setParamBorderColor(t.borderColor))
        },
        getName: function() {
            return u
        },
        getLink: function() {
            return this.link || (this.link = this.getWidget().getPage().createElement("<a></a>").click(function(t) {
                t.preventDefault()
            }))
        },
        getImage: function() {
            return this.image || (this.image = this.getWidget().getPage().createElement("<img />"))
        },
        getResizer: function() {
            if (this.resizer) return this.resizer;
            var t = this,
            e = new p(this.getPage(), this.getImage());
            return e.on("resize",
            function(e, i) {
                t.captureStart(),
                t.setParam("width", e),
                t.setParam("height", i),
                t.captureEnd()
            }),
            this.resizer = e
        },
        isResizing: function() {
            return this.resizer && this.resizer.isResizing()
        },
        getTitle: function() {
            return this.title || (this.title = this.getWidget().getPage().createElement('<p class="caption"></p>'))
        },
        setParamImage: function(t) {
            var e, i = this.getWidget(),
            a = i.getElement();
            t = (t || "").toString(),
            t ? (e = this.getImage(), e.attr("src", t), this.getParamLink() ? (this.getLink().appendTo(a), e.appendTo(this.getLink())) : e.appendTo(a), this.getResizer().getElement().insertAfter(e), this.title && this.title.appendTo(a), a.data("image", t)) : (this.link && this.link.detach(), this.image && this.image.removeAttr("src").detach(), this.title && this.title.detach(), a.removeData("image")),
            this.emit("paramset", "image", t)
        },
        getParamImage: function() {
            return this.getWidget().getElement().data("image") || ""
        },
        setParamWidth: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            this.getImage().css("width", t),
            i.data("width", t),
            this.emit("paramset", "width", t)
        },
        getParamWidth: function() {
            return this.getWidget().getElement().data("width") || ""
        },
        setParamHeight: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            this.getImage().css("height", t),
            i.data("height", t),
            this.emit("paramset", "height", t)
        },
        getParamHeight: function() {
            return this.getWidget().getElement().data("height") || ""
        },
        setParamAlign: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            i.css("text-align", t),
            i.data("align", t),
            this.emit("paramset", "align", t)
        },
        getParamAlign: function() {
            return this.getWidget().getElement().data("align")
        },
        setParamLightbox: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            t ? i.attr("data-lightbox", t) : i.removeAttr("data-lightbox"),
            this.emit("paramset", "lightbox", t)
        },
        getParamLightbox: function() {
            return this.getWidget().getElement().attr("data-lightbox") || ""
        },
        setParamLink: function(t) {
            var e, i, a = this.getWidget(),
            n = a.getElement();
            e = t && t.href || "",
            i = t && t.target || "",
            e && (t = {
                href: e,
                target: i
            }),
            e ? (this.getLink().attr(t), this.getParamImage() ? (this.getImage().appendTo(this.link), this.link.appendTo(n)) : this.link && this.link.detach(), n.data("link", t)) : (this.link && this.link.removeAttr("href").removeAttr("target").removeData("link").detach(), this.getParamImage() && this.getImage().appendTo(n), n.removeData("link")),
            this.emit("paramset", "link", t)
        },
        getParamLink: function() {
            return this.getWidget().getElement().data("link") || null
        },
        setParamTitle: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t + "").toString(),
            t ? (this.getTitle().text(t).appendTo(i), i.data("title", t)) : (this.title && this.title.text("").removeData("title").detach(), i.removeData("title")),
            this.emit("paramset", "title", t)
        },
        getParamTitle: function() {
            return this.getWidget().getElement().data("title") || ""
        },
        setParamPadding: function(t) {
            var e, i = this.getWidget(),
            a = i.getElement();
            $.inArray(t, ["", "1px", "3px", "6px"]) || (t = ""),
            this.getImage().css("padding", t),
            a.data("padding", t),
            e = this.getParamBorderColor(),
            e && this.setParamBorderColor(e),
            this.emit("paramset", "padding", t)
        },
        getParamPadding: function() {
            return this.getWidget().getElement().data("padding")
        },
        setParamBorderColor: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            t = (t || "").toString(),
            t && this.getParamPadding() ? this.getImage().css("border", "solid 1px " + t) : this.image && this.image.css("border", ""),
            i.data("borderColor", t),
            this.emit("paramset", "borderColor", t)
        },
        getParamBorderColor: function() {
            return this.getWidget().getElement().data("borderColor")
        },
        toJSON: function() {
            return {
                image: this.getParamImage(),
                width: this.getParamWidth(),
                height: this.getParamHeight(),
                align: this.getParamAlign(),
                lightbox: this.getParamLightbox(),
                link: this.getParamLink(),
                title: this.getParamTitle(),
                padding: this.getParamPadding(),
                borderColor: this.getParamBorderColor()
            }
        }
    },
    n),
    b = t({
        setup: function(t) {
            var e = this.getWidget();
            t.params || (t.params = {
                align: "center",
                padding: ""
            }),
            this.imageSetting = new f(e, t.params),
            e.addOutlet(this.imageSetting),
            e.on("dblclick",
            function() {
                i.toSettingTab()
            })
        },
        isEmpty: function() {
            return this.imageSetting.getParamImage() ? !1 : !0
        },
        isResizing: function() {
            return this.imageSetting.isResizing()
        },
        handleMouseDown: function() {
            return this.isEmpty() ? (this.pickImage(), !1) : this.isResizing() ? !1 : !0
        },
        pickImage: function() {
            var t = this;
            c.open({
                filter: "image",
                success: function(e) {
                    t.imageSetting.setParam("image", e)
                }
            })
        },
        setLink: function() {
            var t = this;
            m.edit(this.imageSetting.getParamLink(),
            function(e) {
                t.imageSetting.setParam("link", e)
            })
        },
        toJSON: function() {
            return {
                params: this.imageSetting.toJSON()
            }
        }
    },
    e);
    return b
});
