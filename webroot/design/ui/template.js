define(function() {
    function e(e) {
        return "'" + e.replace(u, "\\\\").replace(f, "\\'").replace(h, " ") + "'"
    }
    function t(e) {
        return "(function(){try{return(" + e + ')}catch(e){return""}})()'
    }
    function s(s) {
        var c, u = ["var __O=[];"];
        for (s = s.split(o), u.push("__O.push(" + e(s.shift()) + ");"); c = s.shift();) {
            var f, h = c.split(p);
            if (h.length > 1 && (f = _(h.shift()))) switch (!0) {
            case "endif" == f: u.push("}");
                break;
            case "endforeach" == f: case "endeach" == f: u.push("});");
                break;
            case "else" == f: u.push("}else{");
                break;
            case n.test(f):
                u.push("if(" + t(RegExp.$1) + "){");
                break;
            case r.test(f):
                u.push("}else if(" + t(RegExp.$1) + "){");
                break;
            case i.test(f):
                u.push("this.each(" + t(RegExp.$1) + ",function(" + RegExp.$2 + "," + (RegExp.$3 || "__index") + "){");
                break;
            case a.test(f):
                u.push("var " + RegExp.$1 + "=" + t(RegExp.$2) + ";");
                break;
            default:
                u.push("__O.push(" + t(f) + ");")
            }
            u.push("__O.push(" + e(h.join(p)) + ");")
        }
        return u.push('return __O.join("");'),
        u.join("")
    }
    var n = /^if\s+(.+)$/,
    r = /^(?:elif|else\s*if)\s+(.+)$/,
    i = /^(?:for)?each\s+(.+)\s+as\s+(\w+)(?:\s*,\s*(\w+))?$/,
    a = /^(\w+)\s*=\s*(.+)$/,
    c = /\S/.test(" ") ? /^[\s\xA0]+|[\s\xA0]+$/g: /^\s+|\s+$/g,
    u = /\\/g,
    f = /'/g,
    h = /[\t\b\f\r\n]/g,
    o = "{%",
    p = "%}",
    l = {}.toString,
    _ = "".trim ?
    function(e) {
        return e.trim()
    }: function(e) {
        return e.replace(c, "")
    },
    g = function(e) {
        this.template = s(e)
    };
    return g.each = function(e, t) {
        if (e) {
            var s = 0,
            n = e.length;
            if ("[object Function]" == l.call(e.forEach)) e.forEach(t);
            else if (void 0 === n || "[object Function]" == l.call(e)) for (s in e) t(e[s], s, e);
            else for (; n > s;) t(e[s], s++, e)
        }
    },
    g.prototype.render = function(e) {
        var t = ["with(__I){", this.template, "}"].join("");
        return new Function("__I", t).call(g, e)
    },
    g
});