define(function(require) {
    function t(t) {
        return t = parseFloat(t),
        isNaN(t) ? 0 : t
    }
    function i(t) {
        return Math.round(100 * t) / 100
    }
    var e = require("class"),
    $ = require("jquery");
    require("./hud.css");
    var s = ["top", "right", "bottom", "left"],
    n = e({
        initialize: function(t, i, e) {
            this.element = $('<div class="dim ' + i + '"><div class="line"><i></i><label></label></div></div>').appendTo(t),
            this.label = this.element.find("label"),
            this.direct = i,
            this.twoside = e,
            this.isVertical = "top" == this.direct || "bottom" == this.direct
        },
        setWidth: function(i) {
            return i = t(i),
            this.element.css(this.isVertical ? "height": "width", Math.abs(i)),
            this.twoside && (this.element.css(this.direct, i > 0 ? -i: 0), this.element[i >= 0 ? "removeClass": "addClass"]("negative")),
            this
        },
        setLabel: function(t) {
            this.label.html("<span>" + t + "</span>")
        },
        hide: function() {
            this.visibility = 0,
            this.element.hide()
        },
        show: function() {
            this.visibility = 1,
            this.element.show()
        },
        isVisible: function() {
            return this.visibility
        }
    }),
    h = e({
        initialize: function(t) {
            this.element = $('<div class="dim aliquot"><div class="line"><i class="left"></i><label></label><i class="right"></i></div></div>').appendTo(t),
            this.label = this.element.find("label")
        },
        setLeft: function(t) {
            return this.element.css("left", t),
            this
        },
        setWidth: function(t) {
            return this.element.css("width", t),
            this
        },
        setLabel: function(t) {
            this.label.html("<span>" + t + "</span>")
        }
    }),
    l = e({
        initialize: function(t) {
            this.window = t.getWindow()[0],
            this.element = $('<div class="hud"><div class="margin-box"></div><div class="padding-box"></div></div>').appendTo(t.getMasker()),
            this.marginBox = this.element.find(".margin-box"),
            this.paddingBox = this.element.find(".padding-box"),
            this.marginDims = {},
            this.paddingDims = {};
            var i = this;
            s.forEach(function(t) {
                i.marginDims[t] = new n(i.marginBox, t, 1),
                i.paddingDims[t] = new n(i.paddingBox, t)
            })
        },
        point: function(t) {
            this.placement = t
        },
        show: function(t) {
            return this.mode == t ? (this.element.show(), void 0) : (this.mode = "padding" == t ? "padding": "margin", "padding" == this.mode ? (this.marginBox.hide(), this.paddingBox.show()) : (this.paddingBox.hide(), this.marginBox.show()), this.element.show(), void 0)
        },
        enable: function(t) {
            this.enabledDims = t;
            var i = "padding" == this.mode ? this.paddingDims: this.marginDims;
            s.forEach(function(e) {
                i[e][t.indexOf(e) > -1 ? "show": "hide"]()
            }),
            this.touch()
        },
        touch: function() {
            var t = this,
            i = this.placement,
            e = i.getBounds();
            if (this.element.css({
                width: e.width,
                height: e.height,
                top: this.window.pageYOffset + e.top,
                left: e.left
            }), "padding" == this.mode) {
                var s = this.placement.getInner(),
                n = s[0].getBoundingClientRect(),
                h = i.getParamStylePadding().getValue();
                this.paddingBox.css({
                    left: n.left - e.left,
                    top: n.top - e.top,
                    width: n.width,
                    height: n.height
                }),

                this.enabledDims.forEach(function(i) {
                    t.paddingDims[i].setWidth(s.css("padding-" + i)).setLabel(h[i])
                })
            } else {
                var l = this.placement.getElement(),
                h = i.getParamStyleMargin().getValue();
                this.enabledDims.forEach(function(i) {
                    t.marginDims[i].setWidth(l.css("margin-" + i)).setLabel(h[i])
                })
            }
        },
        hide: function() {
            this.element.hide()
        }
    }),
    d = e({
        initialize: function(t) {
            this.window = t.getWindow()[0],
            this.element = $('<div class="hud"></div>').appendTo(t.getOverlay()),
            this.leftDim = new h(this.element),
            this.rightDim = new h(this.element)
        },
        point: function(t, i) {
            return this.leftCol = t,
            this.rightCol = i,
            this
        },
        show: function() {
            this.element.show(),
            this.touch()
        },
        touch: function(t) {
            var e = this.leftCol.getColElement()[0].getBoundingClientRect(),
            s = this.rightCol.getColElement()[0].getBoundingClientRect();
            this.element.css({
                top: e.top,
                left: e.left,
                width: s.right - e.left,
                height: Math.max(e.height, s.height)
            });
            var n, h;
            t ? (n = i(this.leftCol.getAliquot()) + "/12", h = i(this.rightCol.getAliquot()) + "/12") : (n = i(e.width) + "px " + i(100 * this.leftCol.getAliquot() / 12) + "%", h = i(s.width) + "px " + i(100 * this.rightCol.getAliquot() / 12) + "%"),
            this.leftDim.setLeft(0).setWidth(e.width).setLabel(n),
            this.rightDim.setLeft(s.left - e.left).setWidth(s.width).setLabel(h)
        },
        hide: function() {
            this.element.hide()
        }
    });
    return l.Aliquot = d,
    l
});