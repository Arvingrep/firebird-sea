define(function(require) {
    var t = require("class"),
    e = require("./runtime"),
    n = require("./clipboard"),
    i = t({
        initialize: function(t) {
            this.mousetrap = t,
            this.bind()
        },
        oncopy: function() {
            var t, n, i = e.getWorkspace().getCurrentPage(); (t = i.getActiveWidget()) && (n = i.findMovable(t.getElement()[0])),
            n && i.cloneWidget(n)
        },
        onpaste: function() {
            var t = n.getData();
            t && e.getWorkspace().getCurrentPage().paste(t)
        },
        onundo: function() {
            e.getWorkspace().getCurrentPage().getMutationHistory().back()
        },
        onredo: function() {
            e.getWorkspace().getCurrentPage().getMutationHistory().forward()
        },
        bind: function() {
            this.mousetrap.bind(["ctrl+c", "meta+c"], this.oncopy),
            this.mousetrap.bind(["ctrl+v", "meta+v"], this.onpaste),
            this.mousetrap.bind(["ctrl+z", "meta+z"], this.onundo),
            this.mousetrap.bind(["ctrl+shift+z", "meta+shift+z"], this.onredo)
        },
        unbind: function() {
            this.mousetrap.unbind(["ctrl+c", "meta+c"]),
            this.mousetrap.unbind(["ctrl+v", "meta+v"]),
            this.mousetrap.unbind(["ctrl+z", "meta+z"]),
            this.mousetrap.unbind(["ctrl+shift+z", "meta+shift+z"])
        }
    });
    return i
});