!function(t) {
    var e = t.document,
    n = [function() {
        return void 0 === e.documentMode || e.documentMode > 10
    },
    function() {
        return "JSON" in t && "onhashchange" in t && !!t.postMessage && ("MutationObserver" in t || "WebKitMutationObserver" in t || "MozMutationObserver" in t || "oMutationObserver" in t || "msMutationObserver" in t)
    },
    function() {
        var t = e.createElement("div"),
        n = t.style;
        return t.setAttribute("data-a-b", "c"),
        n.cssText = "pointer-events:auto;",
        t.dataset && "c" === t.dataset.aB && "classList" in t && "auto" === n.pointerEvents && ("boxSizing" in n || "webkitBoxSizing" in n || "MozBoxSizing" in n || "msBoxSizing" in n) && t.getBoundingClientRect && "nextElementSibling" in t && "contentEditable" in t
    },
    function() {
        var t = [],
        e = "",
        n = function() {};
        return Object.keys && Array.isArray && t.forEach && t.map && t.filter && t.indexOf && t.lastIndexOf && e.trim && n.bind
    },
    function() {
        try {
            return localStorage.setItem("detect", "a"),
            localStorage.removeItem("detect"),
            !0
        } catch(t) {
            return ! 1
        }
    },
    function() {
        var t = e.createElement("canvas");
        return ! (!t.getContext || !t.getContext("2d"))
    }];
    "every" in n && n.every(function(t) {
        return t()
    }) || (t.location = "/error/browsers")
} (window);