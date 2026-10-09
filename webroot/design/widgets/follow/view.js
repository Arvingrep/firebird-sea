define(function(require) {
    {
        require("jquery")
    }
    return require("./tiptip"),
    function(i) {
        var t = i.find("[data-weixin]");
        t.length && t.tipTip({
            maxWidth: "400px",
            edgeOffset: 10,
            content: '<img src="' + t.data("weixin") + '" />'
        })
    }
});