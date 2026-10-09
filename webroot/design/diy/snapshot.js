define(function(require) {
    require("./snapshot.css");
    var cls = require("class"),
    $ = require("jquery"),
    emitter = require("./emitter"),
    widget = require("./widget/widget"),
    snapshot = cls({
        initialize: function() {
            this.element = $('<div class="diy-snapshot"><i></i><label></label></div>').appendTo(document.body),
            this.icon = this.element.find("i"),
            this.text = this.element.find("label")
        },
        getBounds: function() {
            return this.element[0].getBoundingClientRect()
        },
        show: function(e, t) {
            if (e != this.currentType) {
                var n = this;
                this.icon.css("backgroundImage", ""),
                widget.info(e).done(function(e) {
                    n.icon.css("backgroundImage", 'url("' + e.icon + '")'),
                    n.text.html(e.name)
                }),
                this.currentType = e
            }
            t ? this.element.css({
                marginTop: t.y,
                marginLeft: t.x
            }) : this.element.css({
                marginTop: "",
                marginLeft: ""
            }),
            this.element.show()
        },
        move: function(e) {
            this.element.css({
                left: "globalX" in e ? e.globalX: e.clientX,
                top: "globalY" in e ? e.globalY: e.clientY
            }),
            this.emit("move", [e])
        },
        hide: function() {
            this.element.hide()
        }
    });
    return snapshot.implement(emitter),
    new snapshot
});