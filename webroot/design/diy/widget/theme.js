define(function(require) {
    function e(e) {
        if (!$.isPlainObject(e)) return ! 0;
        for (var t in e) return ! 1;
        return ! 0
    }
    function t(e) {
        if (!$.isPlainObject(e)) return "";
        var t = Object.keys(e).sort(),
        s = {};
        return t.forEach(function(t) {
            s[t] = JSON.stringify(e[t])
        }),
        JSON.stringify(s)
    }
    function s(e) {
        var t = typeof e;
        if (null == e) return e;
        if ("object" === t || "function" === t) {
            "toJSON" in e && (e = e.toJSON());
            var i = Array.isArray(e) ? new Array(e.length) : {};
            return $.each(e,
            function(e, t) {
                i[e] = s(t)
            }),
            i
        }
        return e
    }
    var i = require("class"),
    $ = require("jquery"),
    n = require("../emitter"),
    a = require("../readypromise"),
    r = require("lib/style"),
    h = require("lib/less"),
    u = require("lib/md5"),
    l = require("diy/page/mutationhistory").Record,
    o = require("diy/runtime"),
    c = "default",
	floder = "",
    f = 10001,
    p = i({
        initialize: function(e, t, s) {
            this.type = e,
            this.name = t,
            this.page = s,
            this.refcount = 0,
            this.detached = !0;
            var i = this;
            g.getLessTheme(e, t, s).done(function(e) {
                i.thumb = e.thumb,
                i.render = e.render,
                i.info = e,
                i.ready()
            }).fail(function() {
                g.getTheme(e, t).done(function(t) {
                    i.thumb = t.thumb,
                    i.render = null,
                    i.info = t,
                    t.base ? g.getLessTheme(e, t.base, s).done(function(e) {
                        i.render = e.render,
                        i.base = e,
                        i.ready()
                    }).fail(function() {
                        i.ready()
                    }) : i.ready()
                })
            })
        },
        getType: function() {
            return this.type
        },
        getName: function() {
            return this.name
        },
        getClasses: function() {
            return this.classes || (this.classes = p.normalizeClassName("t-" + this.type + "-" + this.name))
        },
        getThumb: function() {
            return this.thumb
        },
        getRender: function() {
            return this.render
        },
        getStyles: function() {
            return this.styles || (this.styles = $.extend(!0, {},
            this.base && this.base.style || {},
            this.info.style)),
            $.extend(!0, {},
            this.styles)
        },
        getValues: function() {
            return this.values || (this.values = $.extend(!0, {},
            this.base && this.base.value || {},
            this.info.value)),
            $.extend(!0, {},
            this.values)
        },
        insertNode: function(e) {
            var t, s = this.page.getDocument()[0],
            i = parseInt(e.dataset.level, 10),
            n = s.head.getElementsByTagName("link");
            n.length ? ($.each(n,
            function(e, s) {
                return s.dataset.level && parseInt(s.dataset.level, 10) > i ? (t = s, !1) : !0
            }), t ? s.head.insertBefore(e, t) : s.head.appendChild(e)) : s.head.appendChild(e)
        },
        apply: function() {
            function e() {
                g.renderLess(t, i, s, r).done(function(e) {
                    n.node.innerHTML = e,
                    a.resolve()
                })
            }
            var t, s, i, n = this,
            a = $.Deferred(),
            r = this.getValues();
            return this.info && this.info.source ? (t = this.getClasses(), s = g.getLessThemeUrl(this.type, this.name), i = this.info.source, e()) : this.base ? (t = this.getClasses(), s = g.getLessThemeUrl(this.type, this.base.name), i = this.base.source, e()) : a.reject(),
            a.promise()
        },
        attach: function() {
            var e = $.Deferred(),
            t = this.getClasses(),
            s = this.page.getDocument()[0];
            if (this.node) this.detached && this.insertNode(this.node),
            e.resolve();
            else {
                var i = s.createElement("style");
                i.dataset.theme = t,
                i.dataset.level = f++,
                i.type = "text/css",
                this.insertNode(i),
                this.detached = !1,
                this.node = i,
                this.apply().then(function() {
                    e.resolve()
                })
            }
            return this.refcount++,
            e.promise()
        },
        detach: function() {
            return this.node && --this.refcount <= 0 && (this.page.recycle(this.node), this.refcount = 0, this.detached = !0),
            this
        }
    });
    p.implement(a),
    $.extend(p, {
        normalizeClassName: function(e) {
            return String(e).replace(/[\._]/g, "-")
        }
    });
    var d = i(p);
    $.extend(d, {
        instances: {},
        create: function(e, t, s) {
            var i = [e, t, s.getPageId()].join("-");
            return i in this.instances ? this.instances[i] : this.instances[i] = new d(e, t, s)
        }
    });
    var m = i({
        initialize: function(e, t, s, i) {
            m.superclass.initialize.call(this, e, t, s),
            this.extraValues = i
        },
        getClasses: function() {
            if (this.classes) return this.classes;
            var e = m.getIndex(this.type, this.name);
            return this.classes = p.normalizeClassName("t-" + this.type + "-" + this.name + "-" + e)
        },
        getValues: function() {
            if (this.values) return this.values;
            var e = m.superclass.getValues.call(this);
            return this.values = $.extend(!0, {},
            e, this.extraValues)
        }
    },
    p);
    $.extend(m, {
        instances: {},
        create: function(e, s, i, n) {
            var a = u(JSON.stringify([e, s, i.getPageId(), t(n)]));
            return a in this.instances ? this.instances[a] : this.instances[a] = new m(e, s, i, n)
        },
        indexes: {},
        getIndex: function(e, t) {
            return this.indexes[e] || (this.indexes[e] = {}),
            this.indexes[e][t] ? ++this.indexes[e][t] : this.indexes[e][t] = 1
        }
    });
    var g = i({
        initialize: function(e, t) {
            this.id = e.getId(),
            this.type = e.getType(),
            this.widget = e,
            this.element = e.getElement(),
            this.page = e.getPage(),
            this.captureBaseDepth = 0,
            this.captureValuesDepth = 0,
            this.captureStylesDepth = 0,
            this.snapshotBase = null,
            this.snapshotValues = null,
            this.snapshotStyles = null;
            var s = this;
            $.isPlainObject(t) || (t = {}),
            this.apply(t.base, t.style || {},
            t.value || {}).then(function() {
                s.ready()
            })
        },
        getName: function() {
            return this.theme && this.theme.getName()
        },
        getThumb: function() {
            return this.theme && this.theme.getThumb()
        },
        getPrevious: function() {
            return this.previous
        },
        getClasses: function() {
            return this.theme && this.theme.getClasses() || ""
        },
        disableCapture: function() {
            this.captureDisabled = 1
        },
        enableCapture: function() {
            this.captureDisabled = 0
        },
        apply: function(t, s, i) {
            var n, a, r = this,
            h = $.Deferred(),
            u = b[this.type],
            l = this.widget.getRender(),
            o = l && $.isFunction(l.destory) ? l.destory: null;
            return o && o(this.widget.getElement()),
            n = t == c ? u && u[c] ? t: "": t || (u && u[c] ? c: ""),
            n ? (a = e(i) ? d.create(this.type, n, this.page) : m.create(this.type, n, this.page, i), a.ready(function() {
                a.attach().done(function() {
                    r.element.addClass(a.getClasses()),
                    r.theme && r.theme.detach(),
                    r.theme && r.theme !== a && r.element.removeClass(r.theme.getClasses()),
                    r.previous = r.theme,
                    r.theme = a,
                    r.base = n,
                    r.styles = $.extend(!0, {},
                    s),
                    r.applyStyles($.extend(!0, {},
                    a.getStyles(), r.styles)),
                    r.values = a instanceof d ? {}: $.extend(!0, {},
                    i),
                    h.resolve()
                })
            })) : (this.styles = $.extend(!0, {},
            s), this.values = {},
            r.applyStyles(this.styles), r.theme && (r.element.removeClass(r.theme.getClasses()), r.theme.detach(), r.previous = r.theme, r.theme = null), h.resolve()),
            h.promise()
        },
        applyStyles: function(t) {
            var s = this;
            this.cssrule && this.page.removeCSSRule(this.cssrule),
            e(t) || (this.cssrule = this.page.getCSSRule("#" + this.id), $.each(t,
            function(e, t) {
                r(e, s.cssrule).setValue(t)
            }))
        },
        getBase: function() {
            return this.base
        },
        setBase: function(e) {
            var t = this;
            return e !== this.base && (this.captureBaseStart(), this.apply(e, {},
            {}).done(function() {
                t.captureBaseEnd(),
                t.emit("themechange", t.base),
                t.emit("stylechange", t.styles),
                t.emit("valuechange", t.values)
            })),
            this
        },
        captureBaseStart: function() {
            this.captureDisabled || (this.captureBaseDepth++, this.snapshotBase || (this.snapshotBase = {
                base: this.base,
                styles: s(this.styles),
                values: s(this.values)
            }))
        },
        captureBaseEnd: function() {
            if (! (this.captureDisabled || --this.captureBaseDepth > 0)) {
                var e = this,
                t = {},
                i = {
                    base: this.base,
                    styles: s(this.styles),
                    values: s(this.values)
                },
                n = 0;
                JSON.stringify(this.snapshotBase) != JSON.stringify(i) && (n = 1, t = s(this.snapshotBase)),
                e.snapshotBase = null,
                e.captureBaseDepth = 0,
                1 > n || e.page.getMutationHistory().log(new l(e.type + ".theme.base " + JSON.stringify(t) + " => " + JSON.stringify(i),
                function(t) {
                    e.apply(t.base, t.styles, t.values).then(function() {
                        e.emit("themechange", e.base),
                        e.emit("stylechange", e.styles),
                        e.emit("valuechange", e.values)
                    })
                },
                t, i))
            }
        },
        getRender: function() {
            return this.theme && this.theme.getRender()
        },
        getStyles: function() {
            return $.extend(!0, {},
            this.styles)
        },
        setStyles: function(e) {
            var t = this;
            return JSON.stringify(e) != JSON.stringify(this.styles) && (this.captureStylesStart(), this.apply(this.base, e, this.values).done(function() {
                t.captureStylesEnd(),
                t.emit("stylechange", t.styles)
            })),
            this
        },
        captureStylesStart: function() {
            this.captureDisabled || (this.captureStylesDepth++, this.snapshotStyles || (this.snapshotStyles = s(this.styles)))
        },
        captureStylesEnd: function() {
            if (! (this.captureDisabled || --this.captureStylesDepth > 0)) {
                var e, t, i = this,
                n = 0;
                JSON.stringify(this.snapshotStyles) != JSON.stringify(this.styles) && (e = s(this.snapshotStyles), t = s(this.styles), n = 1),
                i.snapshotStyles = null,
                i.captureStylesDepth = 0,
                1 > n || i.page.getMutationHistory().log(new l(i.type + ".theme.style " + JSON.stringify(e) + " => " + JSON.stringify(t),
                function(e) {
                    i.apply(i.base, e, i.values).then(function() {
                        i.emit("stylechange", i.styles)
                    })
                },
                e, t))
            }
        },
        getValues: function() {
            return $.extend(!0, {},
            this.values)
        },
        setValues: function(e) {
            var t = this;
            return JSON.stringify(e) != JSON.stringify(this.values) && (this.captureValuesStart(), this.apply(this.base, this.styles, e).done(function() {
                t.captureValuesEnd(),
                t.emit("valuechange", t.values)
            })),
            this
        },
        captureValuesStart: function() {
            this.captureDisabled || (this.captureValuesDepth++, this.snapshotValues || (this.snapshotValues = s(this.values)))
        },
        captureValuesEnd: function() {
            if (! (this.captureDisabled || --this.captureValuesDepth > 0)) {
                var e = this,
                t = {},
                i = {},
                n = 0;
                JSON.stringify(this.snapshotValues) != JSON.stringify(this.values) && (t = s(this.snapshotValues), i = s(this.values), n = 1),
                e.snapshotValues = null,
                e.captureValuesDepth = 0,
                1 > n || e.page.getMutationHistory().log(new l(e.type + ".theme.value " + JSON.stringify(t) + " => " + JSON.stringify(i),
                function(t) {
                    e.apply(e.base, e.styles, t).then(function() {
                        e.emit("valuechange", e.values)
                    })
                },
                t, i))
            }
        },
        isChanged: function() {
            return e(this.styles) && e(this.values) ? !1 : !0
        },
        toJSON: function() {
            var t = {};
            return this.base && (t.base = this.base),
            e(this.styles) || (t.style = this.styles),
            this.base && !e(this.values) && (t.value = this.values),
            t
        }
    });
    g.implement(n),
    g.implement(a);
    var y = {},
    v = {},
    b = {},
    S = ".png",
    T = {},
    D = {},
    x = {},
    N = {};
    return $.extend(g, {
        info: function(e, t, s) {
            var i = $.Deferred(),
            n = i.reject.bind(i);
            return t ? g.getLessTheme(e, t, s).done(function(e) {
                i.resolve(e)
            }).fail(function() {
                g.getTheme(e, t).done(function(t) {
                    t.base ? g.getLessTheme(e, t.base, s).done(function(e) {
                        t.param = e.param,
                        t.source = e.source,
                        i.resolve(t)
                    }).fail(n) : i.resolve(t)
                }).fail(n)
            }) : i.reject(),
            i.promise()
        },
        preload: function(t, s, i) {
            var n, a = $.Deferred();
            return s && s.base ? (n = e(s.value) ? d.create(t, s.base, i) : m.create(t, s.base, i, s.value), n.ready(function() {
                n.attach().then(function() {
                    a.resolve()
                })
            })) : a.resolve(),
            a.promise()
        },
        levelOf: function() {
            return 30
        },
        fixThemeThumb: function(e) {
            e.thumb || (e.thumb = e.view && e.view.length && e.view.indexOf("png") > -1 ? e.root + "view" + S: "/design/widgets/" + floder + "/theme/" + e.name + "/view.png")
        },
        registerLessThemeUrl: function(e, t) {
            return y[e] ? y[e] : y[e] = t
        },
        getLessThemeUrl: function(e, t) {
            return y[e] + "/theme/" + t + "/"
        },
        registerLessThemes: function(e, t) {
            return e in v ? v[e] : (Array.isArray(t) || (t = []), t.forEach(function(t) {
                b[e] || (b[e] = {}),
                t.thumb = t.view && t.view.length && t.view.indexOf("png") > -1 ? g.getLessThemeUrl(e, t.name) + "view" + S: "",
                b[e][t.name] = t
            }), v[e] = t)
        },
        getLessThemes: function(e) {
            return e in v ? v[e] : []
        },
        getLessTheme: function(e, t, s) {
            var i, n = $.Deferred();
            return e in b ? (i = b[e][t], i || (t = c, i = b[e][t]), i ? i.view && i.view.indexOf("js") > -1 && "render" in i ? n.resolve(i) : g.loadLessTheme(e, t, i, s).done(function(e) {
                i.render = e,
                n.resolve(i)
            }).fail(function() {
                i.render = null,
                n.resolve(i)
            }) : n.reject()) : n.reject(),
            n.promise()
        },
        loadLessTheme: function(e, t, s, i) {
            function n() {
                i && i.isRemoved() ? r.reject() : r.resolve(a)
            }
            var a, r = $.Deferred(),
            h = r.reject.bind(r),
            u = [],
            l = 0,
            o = g.getLessThemeUrl(e, t);
            return s.view && s.view.indexOf("js") > -1 && (l = u.push(o + "/view.js")),
            u.length ? i.use(u, g.levelOf(e)).then(function() {
                l > 0 && (a = arguments[l - 1]),
                n()
            },
            h) : n(),
            r.promise()
        },
        renderLess: function(e, t, s, i) {
            var n = $.Deferred();
            $.each(i || {},
            function(e, s) {
                t += "\n@" + e + ": " + s + ";"
            }),
            t += "\n@theme-name: " + e + ";";
            var a = new h.Parser({
                rootpath: s
            });
            return a.parse(t,
            function(e, t) {
                n.resolve(e ? "": t.toCSS())
            }),
            n.promise()
        },
        registerThemes: function(e, t) {
            if (e in T) return T[e];
            Array.isArray(t) || (t = []);
            var s = this;
            return t.forEach(function(t) {
                D[e] || (D[e] = {}),
                s.fixThemeThumb(t),
                D[e][t.name] = t
            }),
            T[e] = t
        },
        getThemes: function(e, t) {
            t = parseInt(t, 10) || 1;
            var s = e + "-" + t;
            if (!x[s]) {
				floder = e;
                var i = $.Deferred(),
                n = "/include/"+Module+".inc.php?action=widgetthemes&widgetType=" + e;
                o.getWorkspace().requestData(n).done(function(t) {
                    i.resolve(g.registerThemes(e, t && t.themes || []))
                }).fail(function() {
                    i.resolve(g.registerThemes(e, {}))
                }),
                x[s] = i
            }
            return x[s].promise()
        },
        registerTheme: function(t, s, i) {
            if (!i || e(i)) return ! 1;
            if (T[t] || (T[t] = []), D[t] || (D[t] = {}), D[t][s]) {
                var n = T[t].indexOf(s);
                n > -1 && T[t].splice(n, 1)
            }
            return T[t].unshift(i),
            this.fixThemeThumb(i),
            D[t][s] = i,
            i
        },
        getTheme: function(e, t) {
            var s, i;
            return D[e] && D[e][t] ? (s = $.Deferred(), s.resolve(D[e][t]), s.promise()) : (N[e + t] || (i = "/project/widgettheme?widgetType=" + e + "&themeName=" + t, s = $.Deferred(), o.getWorkspace().requestData(i).done(function(i) {
                s.resolve(g.registerTheme(e, t, i && i.theme))
            }).fail(function() {
                s.reject(g.registerTheme(e, t, null))
            }), N[e + t] = s), N[e + t].promise())
        }
    }),
    g.AvailableColors = ["white", "black", "red", "orange", "yellow", "green", "blue", "cyan", "purple"],
    g
});