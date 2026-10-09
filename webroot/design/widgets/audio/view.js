define(function(require) {
    function e() {
        return "w-audio-" + (new Date).getTime().toString(36)
    }
    function a(e) {
        return r || (r = document.createElement("a")),
        r.setAttribute("href", e),
        r.href
    }
    function t(e, t, i, n) {
        var r = {};
        r[t] = a(i),
        e.jPlayer("stop"),
        e.jPlayer("setMedia", r),
        n && e.jPlayer("play")
    }
    var $ = require("jquery"),
    i = require("./jplayer/jplayer.swf"),
    n = ["mp3"];
    require("./jplayer/jplayer.js");
    var r;
    return function(a) {
        a.jquery || (a = $(a));
        var r = a.data("audio"),
        o = "mp3";
        if (r) {
            var d = e(),
            u = d + "-player",
            f = d + "-controls",
            l = a.find(".w-audio-player"),
            p = a.find(".w-audio-control-container"),
            c = a.find(".w-audio-play"),
            s = a.find(".w-audio-pause"),
            y = parseInt(a.data("autoplay"), 10);
            if (a.data("audio-inited")) return t(l, o, r, y),
            void 0;
            a.data("audio-inited", !0),
            l.attr("id", u),
            p.attr("id", f),
            l.jPlayer({
                cssSelectorAncestor: "#" + f,
                ready: function() {
                    t(l, o, r, y)
                },
                play: function() {
                    c.hide(),
                    s.show()
                },
                pause: function() {
                    c.show(),
                    s.hide()
                },
                ended: function() {
                    c.show(),
                    s.hide()
                },
                swfPath: i,
                supplied: n.join(", "),
                wmode: "window"
            })
        }
    }
});