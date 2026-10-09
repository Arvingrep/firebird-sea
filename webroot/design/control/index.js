define(function(require) {
    function t(t, e) {
        return t = (t + "").toLowerCase(),
        t in w ? new w[t](e) : new g(e)
    }
    var e = require("./background"),
    n = require("./border"),
    o = require("./color"),
    i = require("./font-family"),
    r = require("./font-style"),
    f = require("./font-weight"),
    a = require("./image"),
    g = require("./input"),
    l = require("./offset"),
    c = require("./size"),
    d = require("./length"),
    s = require("./text-align"),
    u = require("./text-decoration"),
    w = {
        background: e,
        border: n,
        color: o,
        "font-family": i,
        "font-style": r,
        "font-weight": f,
        image: a,
        offset: l,
        size: c,
        length: d,
        "text-align": s,
        "text-decoration": u
    };
    return t
});