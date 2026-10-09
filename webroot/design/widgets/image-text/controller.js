define(function(require) {
    var t = require("class"),
    e = require("diy/widget/controller"),
    i = require("diy/panel/panel"),
    a = require("diy/panel/tabview/setting"),
    n = require("diy/widget/setting"),
    o = require("control/options"),
    $ = require("jquery"),
    s = "imagetext.image";
    a.createSection(s, {
        initView: function() {
            var t, e, i = this;
            t = this.addRow(),
            e = t.addCell("options"),
            e.addLabel("图片位置"),
            this.fieldPosition = new o({
                width: 157,
                value: "left",
                options: [{
                    label: "左",
                    value: "left"
                },
                {
                    label: "右",
                    value: "right"
                },
                {
                    label: "上",
                    value: "top"
                },
                {
                    label: "下",
                    value: "bottom"
                }],
                uncheck: !1
            }),
            this.fieldPosition.appendTo(e.getElement()),
            this.fieldPosition.on("change",
            function(t) {
                i.applyToOutlet("imagePosition", t)
            })
        },
        getTitle: function() {
            return "图文设置"
        },
        getClasses: function() {
            return "image-text"
        },
        syncParamImagePosition: function(t) {
            this.fieldPosition.value(t)
        }
    });
    var l = t({
        initialize: function(t, e, i) {
            this.image = i,
            l.superclass.initialize.call(this, t, e)
        },
        setup: function(t) {
            t && "imagePosition" in t && this.setParamImagePosition(t.imagePosition)
        },
        getName: function() {
            return s
        },
        setParamImagePosition: function(t) {
            var e = this.getWidget(),
            i = e.getElement();
            switch (t = (t || "").toString()) {
            case "right":
                this.image.getElement().css("float", "right").prependTo(i);
                break;
            case "top":
                this.image.getElement().css("float", "none").prependTo(i);
                break;
            case "bottom":
                this.image.getElement().css("float", "none").appendTo(i);
                break;
            default:
                this.image.getElement().css("float", "left").prependTo(i)
            }
            i.data("imagePosition", t),
            this.emit("paramset", "imagePosition", t)
        },
        getParamImagePosition: function() {
            return this.getWidget().getElement().data("imagePosition")
        },
        toJSON: function() {
            return {
                imagePosition: this.getParamImagePosition()
            }
        }
    },
    n),
    g = t({
        setup: function(t) {
            t.image || (t.image = {
                theme: {
                    style: {
                        margin: {
                            right: "6px",
                            bottom: "6px"
                        },
                        "font-size": "12px",
                        "line-height": "24px"
                    }
                },
                params: {
                    padding: "6px",
                    borderColor: "#d3d3d3"
                }
            }),
            t.text || (t.text = {
                theme: {
                    style: {
                        "line-height": 1.6
                    }
                }
            }),
            t.params || (t.params = {
                imagePosition: "left"
            });
            var e = this.getWidget(),
            a = e.getPage();
            this.image = a.createWidget($.extend({},
            t.image, {
                type: "image",
                operable: !1,
                movable: !1
            })),
            e.addChild(this.image),
            this.text = a.createWidget($.extend({},
            t.text, {
                type: "text",
                operable: !1,
                movable: !1
            })),
            e.addChild(this.text),
            this.imageTextSetting = new l(e, t.params, this.image),
            e.addOutlet(this.imageTextSetting),
            e.on("dblclick",
            function() {
                i.toSettingTab()
            })
        },
        handleMouseDown: function(t) {
            if (this.text.callController("isEditing")) return ! 1;
            if (this.image.getElement()[0].contains(t.target)) {
                if (this.image.callController("isEmpty")) return this.image.callController("pickImage"),
                !1;
                if (this.image.callController("isResizing")) return ! 1
            }
            return ! 0
        },
        toJSON: function() {
            return {
                image: this.image.toJSON(),
                text: this.text.toJSON(),
                params: this.imageTextSetting.toJSON()
            }
        }
    },
    e);
    return g
});