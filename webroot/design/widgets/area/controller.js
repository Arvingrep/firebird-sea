define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("diy/widget/controller"),
    n = e({
        setup: function(e) {
            function t(e) {
                $.isPlainObject(e) && "height" in e && "" !== e.height ? i.getElement().addClass("affected") : i.getElement().removeClass("affected")
            }
            var n = e.items,
            i = this.getWidget(),
            o = i.getPage();
            n && n.forEach(function(e) {
                i.addChild(o.createWidget(e))
            }),
            i.on("remove",
            function() {
                i.getChildWidgets().forEach(function(e) {
                    e.remove(1)
                })
            }),
            i.on("restore",
            function() {
                i.getChildWidgets().forEach(function(e) {
                    e.restore()
                })
            }),
            i.setAreable(!0),
            "body" != i.getTagName().toLowerCase() && (i.getTheme().on("stylechange", t), t(i.getTheme().getStyles()))
        },
        handleMouseDown: function() {},
        beforeSave: function() {
            return $.when.apply($, this.getWidget().getChildWidgets().map(function(e) {
                return e.beforeSave()
            }))
        },
        toJSON: function() {
            return {
                items: this.getWidget().getChildWidgets().map(function(e) {
                    return e.toJSON()
                })
            }
        }
    },
    t);
    return n
});