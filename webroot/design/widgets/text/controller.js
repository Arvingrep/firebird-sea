define(function(require) {
    function t() {
        return s || (s = new r)
    }
    var e = require("class"),
    i = require("diy/widget/controller"),
    n = require("diy/widget/setting"),
    r = require("ui/inlineditor"),
    u = require("diy/runtime"),
    s = null,
    o = "text.edit",
    g = e({
        setup: function(t) {
            this.setParamText(t.text || "双击编辑文本内容")
        },
        getParamText: function() {
            return this._text
        },
        setParamText: function(t) {
            this._text = t;
            var e = this.getWidget().getElement();
            t ? e.html(t) : e.empty()
        },
        toJSON: function() {
            return {
                text: this._text
            }
        },
        getName: function() {
            return o
        }
    },
    n),
    d = e({
        setup: function(e) {
            var i = this,
            n = this.getWidget(),
            r = n.getElement();
            this.textSetting = new g(n, e.params || {
                text: ""
            }),
            n.addOutlet(this.textSetting),
            this.on("blur",
            function() {
                i.editing = 0,
                n.setOperable(1),
                t().exit(),
                i.textSetting.setParam("text", i.getWidget().getElement().html())
            }).on("dblclick",
            function(e) {
                i.isEditing() || (i.editing = 1, n.setOperable(0), t().edit(r), t().setCaret(e))
            }),
            r.on("click",
            function(t) {
                t.preventDefault()
            }),
            u.on("designmodechange",
            function(e) {
                1 !== e && t().exit()
            })
        },
        isEditing: function() {
            return this.editing
        },
        handleMouseDown: function() {
            return this.editing ? !1 : void 0
        },
        toJSON: function() {
            return {
                params: this.textSetting.toJSON()
            }
        }
    },
    i);
    return d
});