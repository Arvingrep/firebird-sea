define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    t = require("diy/emitter"),
    r = e({
        initialize: function(e, t) {
            this.properties = {},
            this.selector = t,
            this.rule = r.createCSSRule(e, t)
        },
        getSelector: function() {
            return this.selector
        },
        getRule: function() {
            return this.rule
        },
        getProperties: function() {
            return this.properties
        },
        getProperty: function(e) {
            return this.properties[e] || ""
        },
        setProperty: function(e, t) {
            null == t || "" === t ? this.rule.style.removeProperty(e) : this.rule.style.setProperty(e, t, "important");
            var r = this.getProperty(e);
            this.properties[e] = t,
            this.emit("propertychange", this.selector, e, t, r)
        },
        isSupport: function(e) {
            return e = $.camelCase(e),
            e in this.rule.style
        }
    });
    return r.implement(t),
    $.extend(r, {
        getCSSRule: function(e, t) {
            for (var r, i = e.cssRules,
            n = i.length; n-->0;) if ((r = i[n]) && r.selectorText == t) return r;
            return this.createCSSRule(e, t)
        },
        createCSSRule: function(e, t) {
            var r = e.cssRules;
            return e.insertRule(t + "{}", r.length),
            r[r.length - 1]
        },
        removeCSSRule: function(e, t) {
            for (var r, i = e.cssRules,
            n = i.length; n-->0 && (!(r = i[n]) || r !== t););
            n > -1 && e.deleteRule(n)
        }
    }),
    r
});