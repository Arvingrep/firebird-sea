define(function(require) {
    var cla = require("class"),
    emitter = require("./emitter"),
    runtime = cla({
        setWorkspace: function(e) {
            this.workspace = e
        },
        getWorkspace: function() {
            return this.workspace
        },
        getProjectId: function() {
            return this.workspace.getProjectId()
        },
        setDesignMode: function(e) {
            null == e && (e = 1),
            this.designMode = e,
            document.documentElement.classList[this.designMode ? "add": "remove"]("diy-design-mode"),
            this.emit("designmodechange", this.designMode)
        },
        isDesignMode: function() {
            return this.designMode
        },
        setPreviewMode: function() {
            this.setDesignMode(0)
        },
        setMoveMode: function(e) {
            null == e && (e = 1),
            this.moveMode = e,
            document.documentElement.classList[this.moveMode ? "add": "remove"]("diy-move-mode"),
            this.emit("movemodechange", this.moveMode)
        },
        isMoveMode: function() {
            return this.moveMode
        }
    });
    return runtime.implement(emitter),
    new runtime
});