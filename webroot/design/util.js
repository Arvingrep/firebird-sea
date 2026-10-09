define(function(require) {
    var $ = require("jquery"),
    e = /^#(\d+)$/,
    r = /[.\\+*?\[\^\]$(){}=!<>,|:\-]/g,
    t = /\s+/g,
    a = {
        now: function() {
            return (new Date).getTime()
        },
        pageidFromHash: function() {
            return location.hash.replace(e, "$1")
        },
        regexpQuote: function(e) {
            return e.replace(r, "\\$&").replace(t, "\\s+")
        },
        pagesorter: function(e, r) {
            return parseInt(e.sort) - parseInt(r.sort) || parseInt(e.pageid) - parseInt(r.pageid)
        },
        ajaxRequestData: function(e) {
            var r = $.Deferred();
            return e || r.reject(),
            $.ajax({
                url: e,
                type: "get",
                dataType: "json"
            }).then(function(e) {
                1401 == e.code ? r.reject() : r.resolve(e)
            },
            function(e, t, a) {
                r.resolve({
                    code: 417,
                    message: a.message || t
                })
            }),
            r.promise()
        },
        ajaxSaveData: function(e, r) {
            var t = $.Deferred();
            return e || t.reject(),
            $.ajax({
                url: e,
                type: "post",
                dataType: "json",
                data: r
            }).then(function(e) {
                1401 == e.code ? t.reject() : t.resolve(e)
            },
            function(e, r, a) {
                t.resolve({
                    code: 417,
                    message: a.message || r
                })
            }),
            t.promise()
        }
    };
    return a
});