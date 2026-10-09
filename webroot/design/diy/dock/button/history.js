define(function(require) {
    var t = require("class"),
    $ = require("jquery"),
    e = require("./button"),
    n = require("diy/runtime"),
    i = require("diy/emitter");
    require("./history.css");
    var a = "disable",
    s = t({
        initialize: function(t, e) {
            var n = this,
            i = this.element = $('<a class="button"></a>');
            this.hint = e,
            t && i.addClass(t),
            i.on("click",
            function() {
                i.hasClass(a) || n.emit("click")
            }),
            this.disable()
        },
        enable: function() {
            this.hint && this.element.attr("data-hint", this.hint),
            this.element.removeClass(a)
        },
        disable: function() {
            this.hint && this.element.removeAttr("data-hint"),
            this.element.addClass(a)
        },
        appendTo: function(t) {
            return this.element.appendTo(t),
            this
        }
    });
    s.implement(i);
    var o = t({
        getElement: function() {
            return this.element || (this.element = $('<span class="group group-history"></span>'))
        },
        setup: function() {
            function t() {
                var t = i.getCurrentPage().getMutationHistory();
                t.off("statechange", a),
                t.on("statechange", a),
                a()
            }
            var e = this.getElement(),
            i = n.getWorkspace();
            this.actionUndo = new s("icon-undo", "撤消").appendTo(e),
            this.actionRedo = new s("icon-redo", "重做").appendTo(e),
            this.actionUndo.on("click",
            function() {
                i.getCurrentPage().getMutationHistory().back()
            }),
            this.actionRedo.on("click",
            function() {
                i.getCurrentPage().getMutationHistory().forward()
            });
            var a = this.change.bind(this);
            i.on("opend", t),
            i.ready(t)
        },
        change: function() {
            var t = n.getWorkspace().getCurrentPage().getMutationHistory(),
            e = t.getState();
            this.actionUndo[1 & e ? "enable": "disable"](),
            this.actionRedo[2 & e ? "enable": "disable"]()
        }
    },
    e);
    return o
});