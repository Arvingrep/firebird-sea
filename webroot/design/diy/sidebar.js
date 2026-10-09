define(function(require) {
    require("./sidebar.css");
    var n = require("class"),
    t = require("./dock/dock"),
    e = require("./panel/panel"),
    i = require("./runtime"),
    o = n({
        init: function(n) {
            this.workspace = n,
            this.dock = t.init(this).appendTo(document.body),
            this.panel = e.init(this).appendTo(document.body),
            setTimeout(function() {
                i.setDesignMode(1)
            },
            16);
            var o = this;
            n.on("selectionchange",
            function(n) {
                o.panel.point(n)
            })
        },
        getWorkspace: function() {
            return this.workspace
        },
        getDock: function() {
            return this.dock
        },
        getPanel: function() {
            return this.panel
        }
    });
    return new o
});