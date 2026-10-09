define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("diy/widget/controller"),
    a = e({
        setup: function(e) {
            var t = this,
            a = (e.items, this.getWidget()),
            n = a.getPage(),
            i = a.getElement();
            this.heading = n.createWidget($.extend(e.heading, {
                type: "heading",
                name: "标题",
                operable: !1,
                movable: !1
            })),
            this.heading.getElement().appendTo(i),
            this.area = n.createWidget($.extend(e.items && e.items[0], {
                type: "area",
                operable: !1,
                movable: !1,
                areable: !0
            })),
            this.area.setDisableStyles(["width"]),
            this.area.getElement().appendTo(i),
            a.on("remove",
            function() {
                t.area.remove(1)
            }),
            a.on("restore",
            function() {
                t.area.restore()
            })
        },
        handleMouseDown: function() {},
        beforeSave: function() {
            return $.when.apply($, this.getWidget().getChildWidgets().map(function(e) {
                return e.beforeSave()
            }))
        },
        toJSON: function() {
            return {
                items: [this.area.toJSON()],
                heading: this.heading.toJSON()
            }
        }
    },
    t);
    return a
});