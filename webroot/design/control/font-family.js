define(function(require) {
    var e = require("class"),
    $ = require("jquery"),
    a = require("./select"),
    i = [{
        label: "Arial, Helvetica, 微软雅黑",
        value: "arial, helvetica, microsoft yahei"
    },
    {
        label: "Arial, Helvetica, 黑体",
        value: "arial, helvetica, simhei"
    },
    {
        label: "Comic Sans MS, 微软雅黑",
        value: "comic sans ms, microsoft yahei"
    },
    {
        label: "Comic Sans MS, 黑体",
        value: "comic sans ms, simhei"
    },
    {
        label: "Impact, 微软雅黑",
        value: "impact, microsoft yahei"
    },
    {
        label: "Impact, 黑体",
        value: "impact, simhei"
    },
    {
        label: "Lucida Sans Unicode, 微软雅黑",
        value: "lucida sans unicode, microsoft yahei"
    },
    {
        label: "Lucida Sans Unicode, 黑体",
        value: "lucida sans unicode, simhei"
    },
    {
        label: "Trebuchet MS, 微软雅黑",
        value: "trebuchet ms, microsoft yahei"
    },
    {
        label: "Trebuchet MS, 黑体",
        value: "trebuchet ms, simhei"
    },
    {
        label: "Verdana, 微软雅黑",
        value: "verdana, microsoft yahei"
    },
    {
        label: "Verdana, 黑体",
        value: "verdana, simhei"
    },
    {
        label: "Georgia, 微软雅黑",
        value: "georgia, microsoft yahei"
    },
    {
        label: "Georgia, 黑体",
        value: "georgia, simhei"
    },
    {
        label: "Palatino Linotype, 微软雅黑",
        value: "palatino linotype, microsoft yahei"
    },
    {
        label: "Palatino Linotype, 黑体",
        value: "palatino linotype, simhei"
    },
    {
        label: "Times New Roman, 微软雅黑",
        value: "times new roman, microsoft yahei"
    },
    {
        label: "Times New Roman, 黑体",
        value: "times new roman, simhei"
    },
    {
        label: "Courier New, 微软雅黑",
        value: "courier new, microsoft yahei"
    },
    {
        label: "Courier New, 黑体",
        value: "courier new, simhei"
    },
    {
        label: "Lucida Console, 微软雅黑",
        value: "lucida console, microsoft yahei"
    },
    {
        label: "Lucida Console, 黑体",
        value: "lucida console, simhei"
    }],
    l = e({
        initialize: function(e) {
            $.isPlainObject(e) || (e = {}),
            e.options || (e.options = i),
            e.height || (e.height = 300),
            l.superclass.initialize.call(this, e)
        }
    },
    a);
    return l
});