define(function(require) {
    require("./outline.css");
    var t = require("class"),
    $ = require("jquery"),
    e = t({
        initialize: function(t) {
            this.out = t,
            t.registerTouch(this.touch.bind(this))
        },
        getType: function() {
            return "outline"
        },
        point: function(t) {
            if (this.pointment !== t) {
                if (this.pointment && this.pointment.getElement().removeClass("diy-outline-" + this.getType()), this.pointment = t, !t || t.isRemoved()) return this.hide();
                t.getElement().addClass("diy-outline-" + this.getType()),
                this.visible || (this.visible = 1, this.getElement().addClass("visible")),
                this.touch()
            }
        },
        getPage: function() {
            return this.page
        },
        getPointment: function() {
            return this.pointment
        },
        getElement: function() {
            return this.element || (this.element = $('<div class="diy-outline ' + this.getType() + '"></div>').appendTo(this.out.getContainer()))
        },
        touch: function() {
            if (this.visible) {
                if (!this.pointment || this.pointment.isRemoved()) return this.hide();
                var t = this.pointment.getBounds();
                this.getElement().css({
                    width: t.width,
                    height: t.height,
                    top: t.top,
                    left: t.left
                })
            }
        },
        hide: function() {
            this.pointment && this.pointment.getElement().removeClass("diy-outline-" + this.getType()),
            this.pointment = null,
            this.visible && (this.visible = 0, this.getElement().removeClass("visible"))
        }
    }),
    i = t({
        touch: function() {
            if (i.superclass.touch.call(this), this.visible && this.pointment) {
                var t = this.getElement();
                t[this.pointment.isOperable() ? "addClass": "removeClass"]("operable"),
                "BODY" == this.pointment.getTagName() && t.css({
                    right: 0,
                    bottom: 0,
                    top: 0,
                    left: 0,
                    width: "auto",
                    height: "auto"
                })
            }
        },
        getElement: function() {
            var t = i.superclass.getElement.call(this);
            if (!this.outlineInited) {
                this.outlineInited = 1;
                var e, n = this;
                $('<i class="diy-ctrl remove" data-hint="移除"></i>').appendTo(t).click(function() { (e = n.getPointment()) && e.getPage().removeWidget(e)
                }),
                $('<i class="diy-ctrl copy" data-hint="复制"></i>').appendTo(t).click(function() { (e = n.getPointment()) && e.getPage().cloneWidget(e)
                }),
                $('<i class="diy-ctrl move" data-hint="拖动"></i>').appendTo(t).mousedown(function(t) { ! t.button && (e = n.getPointment()) && e.getPage().dragWidget(t, e)
                })
            }
            return t
        },
        getType: function() {
            return "selector"
        }
    },
    e),
    n = t({
        getType: function() {
            return "hover"
        },
        isMouseOut: function(t) {
            var e = this.getElement()[0].getBoundingClientRect(),
            i = t.globalX,
            n = t.globalY;
            return e.left <= i && e.right >= i && e.top <= n && e.bottom >= n ? 0 : 1
        }
    },
    i),
    s = t({
        getType: function() {
            return "masker"
        }
    },
    e),
    o = t({
        getType: function() {
            return "droparea"
        }
    },
    e),
    h = t({
        initialize: function(t) {
            this.page = t
        },
        getContainer: function() {
            return this.page.getOverlay()
        },
        registerTouch: function(t) {
            this.page.getRepainting().take(t)
        },
        getHover: function() {
            return this.hover || (this.hover = new n(this))
        },
        getSelector: function() {
            return this.selector || (this.selector = new i(this))
        },
        getMasker: function() {
            return this.masker || (this.masker = new s(this))
        },
        getDropArea: function() {
            return this.dropArea || (this.dropArea = new o(this))
        }
    });
    return h
});