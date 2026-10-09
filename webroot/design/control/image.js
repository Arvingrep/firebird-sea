define(function(require) {
    function e(e) {
        return e += "",
        e.substr(0, 1).toUpperCase() + e.substr(1)
    }
    require("./image.css");
    var t = require("class"),
    $ = require("jquery"),
    i = require("./control"),
    s = require("../ui/explorer"),
    a = require("../ui/imageditor"),
    n = t({
        setup: function() {
            n.superclass.setup.call(this),
            this.element.addClass("image"),
            this._preview = $('<div class="preview"></div>').appendTo(this.element),
            this._actions = $('<div class="actions"><a class="edit" data-action="edit">编辑</a><a class="select" data-action="select">选择</a><a class="delete" data-action="delete">清除</a></div>').appendTo(this.element),
            this._setImage(this.options.value || ""),
            this._initImageEvent()
        },
        _initImageEvent: function() {
            var t = this;
            this._preview.click(function() {
                t._actionSelect()
            }),
            this._actions.on("click", "[data-action]",
            function() {
                var i = this.dataset.action,
                s = "_action" + e(i);
                s in t && t[s]()
            })
        },
        _actionSelect: function() {
            var e = this;
            s.open({
                filter: "image",
                success: function(t) {
                    e._setImage(t)
                }
            })
        },
        _actionEdit: function() {
            var e = this,
            t = new a(this._value);
            t.bind("saved",
            function(t) {
                e._setImage(t && t.file || "")
            })
        },
        _actionDelete: function() {
            this._setImage("")
        },
        _setImage: function(e, t) {
            e ? (this._preview.css("background-image", "url(" + e + ")"), this.element.addClass("has-image")) : (this._preview.css("background-image", ""), this.element.removeClass("has-image")),
            e != this._value && (this._value = e, t || this.emit("change", e))
        },
        value: function() {
            return arguments.length ? (this._setImage(arguments[0], !0), this) : this._value
        },
        reset: function() {
            this.value(this._defaultValue),
            this.emit("change", this.value())
        }
    },
    i);
    return n
});