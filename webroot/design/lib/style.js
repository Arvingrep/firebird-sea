define(function(require) {
    function t(t) {
        return null == t || "" === t
    }
    function e(t) {
        return t.length < 2 ? "0" + t: t
    }
    function i(t, i, n) {
        return "#" + (e(parseInt(t).toString(16)) + e(parseInt(i).toString(16)) + e(parseInt(n).toString(16))).toUpperCase()
    }
    function n(t) {
        if (null == t || "" === (t = t.toString().trim().toLowerCase())) return t;
        var e, n;
        if ((n = l.Names.indexOf(t)) > -1) return t;
        if ("transparent" === t) return t;
        if (e = b.exec(t)) return "rgba(" + e[1] + ", " + e[2] + ", " + e[3] + ", " + e[4] + ")";
        if (e = V.exec(t)) t = i(e[1], e[2], e[3]);
        else if (w.test(t)) t = t.toUpperCase();
        else {
            if (! (e = R.exec(t))) return "";
            t = "#" + (e[1] + e[1] + e[2] + e[2] + e[3] + e[3]).toUpperCase()
        }
        return (n = l.HexValues.indexOf(t)) > -1 && (t = l.Names[n]),
        t
    }
    function s(t) {
        return t.replace(/(?:^|_|\-)(\w)/g,
        function(t, e) {
            return e.toUpperCase()
        })
    }
    function r(t) {
        return t.replace(/([A-Z])/g,
        function(t, e, i) {
            return (i > 0 ? "-": "") + t.toLowerCase()
        })
    }
    function o(t, e, i) {
        var n = s(t);
        return n in J ? new J[n](e, i) : new M(r(t), e, i)
    }
    var u = require("class"),
    l = require("lib/svgcolor"),
    a = u({
        initialize: function(t, e) {
            this.cssRule = t,
            this.setValue(e)
        },
        getName: function() {
            return "style"
        },
        getValue: function() {
            return this.cssRule.getProperty(this.getName())
        },
        setValue: function(t) {
            null != t && (t = t.toString().trim().toLowerCase(), this.cssRule.setProperty(this.getName(), t))
        },
        isEmpty: function() {
            return t(this.getValue())
        },
        toJSON: function() {
            return this.getValue()
        }
    }),
    c = /(large|x\-large|xx\-large|larger|smaller|small|x\-small|xx\-small|medium)/,
    h = /(thin|thick|medium)/,
    g = /(none|solid|dotted|dashed|double|hidden|groove|ridge|inset|outset)/,
    f = /(center|left|top|right|bottom)/,
    m = /(no\-repeat|repeat\-x|repeat\-y|repeat)/,
    p = /(scroll|fixed)/,
    d = /(left|center|right|justify)/,
    x = /((?:\d*\.)?\d+)(em|ex|px|in|cm|mm|pt|pc|%)?/,
    y = /(\-?(?:\d*\.)?\d+)(em|ex|px|in|cm|mm|pt|pc|%)?/,
    V = /rgb *\( *(\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *\)/,
    b = /rgba *\( *(\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *, *([1|0]|[1|0]?(?:\.\d+)) *\)/,
    w = /#[0-9a-f]{6}/,
    R = /#([0-9a-f])([0-9a-f])([0-9a-f])/,
    I = /(none|[\w\-]+ *\(.+\))/i,
    C = / +/,
    P = u({
        getName: function() {
            return "font-family"
        },
        getValue: function() {
            return this.family
        },
        setValue: function(t) {
            null != t && (t = t.toString().trim().toLowerCase(), this.family = t, this.cssRule.setProperty(this.getName(), t))
        }
    },
    a),
    S = u({
        getName: function() {
            return "font-size"
        },
        setValue: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && (t = (e = x.exec(t)) ? e[1] + (e[2] || "px") : (e = c.exec(t)) ? e[1] : ""),
                S.superclass.setValue.call(this, t)
            }
        }
    },
    a),
    v = u({
        getName: function() {
            return "text-align"
        },
        setValue: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && (t = (e = d.exec(t)) ? e[1] : ""),
                v.superclass.setValue.call(this, t)
            }
        }
    },
    a),
    L = u({
        getName: function() {
            return "width"
        },
        setValue: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && ((e = x.exec(t)) ? t = e[1] + (e[2] || "px") : "auto" != t && (t = "")),
                L.superclass.setValue.call(this, t)
            }
        }
    },
    a),
    N = u({
        getName: function() {
            return "height"
        }
    },
    L),
    k = u({
        getName: function() {
            return "line-height"
        },
        setValue: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && ((e = x.exec(t)) ? t = e[1] + (e[2] || "") : "normal" != t && (t = "")),
                k.superclass.setValue.call(this, t)
            }
        }
    },
    a),
    E = u({
        getName: function() {
            return "min-width"
        },
        setValue: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && (t = (e = x.exec(t)) ? e[1] + (e[2] || "px") : ""),
                E.superclass.setValue.call(this, t)
            }
        }
    },
    a),
    z = (u({
        getName: function() {
            return "max-width"
        }
    },
    L), u({
        getName: function() {
            return "color"
        },
        getValue: function() {
            return n(z.superclass.getValue.call(this))
        },
        setValue: function(t) {
            null != t && z.superclass.setValue.call(this, n(t))
        }
    },
    a));
    z.normalizeColor = n;
    var A = u({
        getName: function() {
            return "background-color"
        }
    },
    z),
    O = u({
        setTop: function(t) {
            this.setItem("top", t)
        },
        getTop: function() {
            return this.getItem("top")
        },
        setRight: function(t) {
            this.setItem("right", t)
        },
        getRight: function() {
            return this.getItem("right")
        },
        setBottom: function(t) {
            this.setItem("bottom", t)
        },
        getBottom: function() {
            return this.getItem("bottom")
        },
        setLeft: function(t) {
            this.setItem("left", t)
        },
        getLeft: function() {
            return this.getItem("left")
        },
        setItem: function() {},
        getItem: function(t) {
            return this.cssRule.getProperty("around-" + t)
        },
        setValue: function(t) {
            if (null != t) if ("" === t) this.setTop(""),
            this.setRight(""),
            this.setBottom(""),
            this.setLeft("");
            else {
                "object" != typeof t && (t = t.toString().trim().split(C));
                var e = this; ["top", "right", "bottom", "left"].forEach(function(i, n) {
                    null == t[n] && null == t[i] ? n > 0 && null != t[n > 2 ? 1 : 0] && (t[n] = "", e.setItem(i, e.getItem(n > 2 ? "right": "top"))) : e.setItem(i, null == t[n] ? t[i] : t[n])
                })
            }
        },
        isSame: function() {
            var t = this,
            e = !1;
            return ["top", "right", "bottom", "left"].every(function(i) {
                var n = t.getItem(i) || "";
                if (e === !1) e = n;
                else if (n != e) return e = !1;
                return ! 0
            }),
            e
        },
        isEmpty: function() {
            return t(this.getTop()) && t(this.getRight()) && t(this.getBottom()) && t(this.getLeft())
        },
        getValue: function() {
            return {
                top: this.getTop(),
                right: this.getRight(),
                bottom: this.getBottom(),
                left: this.getLeft()
            }
        }
    },
    a),
    B = u({
        getItem: function(t) {
            return this.cssRule.getProperty("padding-" + t)
        },
        setItem: function(t, e) {
            if (null != e) {
                var i;
                "" !== (e = e.toString().trim().toLowerCase()) && ((i = y.exec(e)) ? (e = parseFloat(i[1]), 0 > e && (e = 0), e += i[2] || "px") : e = ""),
                this.cssRule.setProperty("padding-" + t, e)
            }
        }
    },
    O),
    j = u({
        getItem: function(t) {
            return this.cssRule.getProperty("margin-" + t)
        },
        setItem: function(t, e) {
            if (null != e) {
                var i;
                "" !== (e = e.toString().trim().toLowerCase()) && ((i = y.exec(e)) ? e = i[1] + (i[2] || "px") : "auto" != e && (e = "")),
                this.cssRule.setProperty("margin-" + t, e)
            }
        }
    },
    O),
    T = u({
        getItem: function(t) {
            return n(this.cssRule.getProperty("border-" + t + "-color"))
        },
        setItem: function(t, e) {
            null != e && this.cssRule.setProperty("border-" + t + "-color", n(e))
        }
    },
    O),
    F = u({
        getItem: function(t) {
            return this.cssRule.getProperty("border-" + t + "-width")
        },
        setItem: function(t, e) {
            if (null != e) {
                var i;
                "" !== (e = e.toString().trim().toLowerCase()) && (e = (i = x.exec(e)) ? i[1] + (i[2] || "px") : (i = h.exec(e)) ? i[1] : ""),
                this.cssRule.setProperty("border-" + t + "-width", e)
            }
        }
    },
    O),
    U = u({
        getItem: function(t) {
            return this.cssRule.getProperty("border-" + t + "-style")
        },
        setItem: function(t, e) {
            if (null != e) {
                var i;
                "" !== (e = e.toString().trim().toLowerCase()) && (e = (i = g.exec(e)) ? i[1] : ""),
                this.cssRule.setProperty("border-" + t + "-style", e)
            }
        }
    },
    O),
    W = u({
        initialize: function(t, e) {
            this.width = new F(t),
            this.style = new U(t),
            this.color = new T(t),
            this.setValue(e)
        },
        setColor: function(t) {
            this.color.setValue(t)
        },
        getColor: function() {
            return this.color
        },
        setWidth: function(t) {
            this.width.setValue(t)
        },
        getWidth: function() {
            return this.width
        },
        setStyle: function(t) {
            this.style.setValue(t)
        },
        getStyle: function() {
            return this.style
        },
        setValue: function(t) {
            if (null != t) if ("object" == typeof t) this.width.setValue(t.width),
            this.style.setValue(t.style),
            this.color.setValue(t.color);
            else {
                t = t.toString().toLowerCase();
                var e, i = x.exec(t) || h.exec(t);
                i ? (this.width.setValue(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.width.setValue(""),
                i = g.exec(t),
                i ? (this.style.setValue(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.style.setValue(""),
                this.color.setValue(t)
            }
        },
        isEmpty: function() {
            return this.color.isEmpty() && this.width.isEmpty() && this.style.isEmpty()
        },
        getValue: function() {
            return {
                color: this.color.getValue(),
                width: this.width.getValue(),
                style: this.style.getValue()
            }
        }
    },
    a),
    H = u({
        initialize: function(t) {
            this.color = new A(t),
            H.superclass.initialize.apply(this, arguments)
        },
        setImage: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim()) && (t = (e = I.exec(t)) ? e[1] : 'url("' + t + '")'),
                this.cssRule.setProperty("background-image", t)
            }
        },
        getImage: function() {
            return this.cssRule.getProperty("background-image")
        },
        setRepeat: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && (t = (e = m.exec(t)) ? e[1] : ""),
                this.cssRule.setProperty("background-repeat", t)
            }
        },
        getRepeat: function() {
            return this.cssRule.getProperty("background-repeat")
        },
        setAttachment: function(t) {
            if (null != t) {
                var e;
                "" !== (t = t.toString().trim().toLowerCase()) && (t = (e = p.exec(t)) ? e[1] : ""),
                this.cssRule.setProperty("background-attachment", t)
            }
        },
        getAttachment: function() {
            return this.cssRule.getProperty("background-attachment")
        },
        setPosition: function(t) {
            if (null != t) {
                "object" != typeof t && (t = t.toString().trim().split(C));
                var e = []; ["x", "y"].forEach(function(i, n) {
                    var s, r = null == t[i] ? t[n] : t[i];
                    null != r && "" !== (r = r.toString().trim().toLowerCase()) && ((s = y.exec(r)) ? e.push(s[1] + (s[2] || "px")) : (s = f.exec(r)) && e.push(s[1]))
                }),
                t = e.join(" "),
                this.cssRule.setProperty("background-position", t)
            }
        },
        getPosition: function() {
            return this.cssRule.getProperty("background-position")
        },
        setColor: function(t) {
            this.color.setValue(t)
        },
        getColor: function() {
            return this.color.getValue() || ""
        },
        setValue: function(t) {
            if (null != t) if ("object" == typeof t) this.setColor(t.color),
            this.setImage(t.image),
            this.setAttachment(t.attachment),
            this.setPosition(t.position),
            this.setRepeat(t.repeat);
            else {
                t = t.toString();
                var e, i = I.exec(t);
                i ? (this.setImage(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.setImage(""),
                t = t.toLowerCase(),
                (i = m.exec(t)) ? (this.setRepeat(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.setRepeat(""),
                (i = p.exec(t)) ? (this.setAttachment(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.setAttachment(""),
                t = " " + t,
                (i = /( (?:\-?(?:\d*\.)?\d+(px|em|%)?|center|left|top|right|bottom)){1,2}/.exec(t)) ? (this.setPosition(i[0]), e = t.indexOf(i[0]), t = t.substring(0, e) + t.substr(e + i[0].length)) : this.setPosition(""),
                this.setColor(t)
            }
        },
        isEmpty: function() {
            return this.color.isEmpty() && t(this.getImage()) && t(this.getPosition()) && t(this.getRepeat()) && t(this.getAttachment())
        },
        getValue: function() {
            return {
                color: this.getColor(),
                image: this.getImage(),
                repeat: this.getRepeat(),
                attachment: this.getAttachment(),
                position: this.getPosition()
            }
        }
    },
    a),
    M = u({
        initialize: function(t, e, i) {
            M.superclass.initialize.call(this, e, i),
            this.name = t
        },
        getName: function() {
            return this.name
        },
        isEmpty: function() {
            return ! this.cssRule.isSupport(this.getName()) || t(this.getValue())
        }
    },
    a),
    J = {
        FontFamily: P,
        FontSize: S,
        Color: z,
        TextAlign: v,
        Width: L,
        Height: N,
        LineHeight: k,
        MinWidth: E,
        Padding: B,
        Margin: j,
        Border: W,
        Background: H
    };
    for (var Z in J) o[Z] = J[Z];
    return o
});