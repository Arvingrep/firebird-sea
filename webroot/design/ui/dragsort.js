define(function(require) {
    var $ = require("jquery"),
    e = {
        itemSelector: "",
        dragSelector: "",
        dragSelectorExclude: "input, textarea, object, a, .player, .cancel",
        dragStart: function() {},
        dragEnd: function() {},
        dragBetween: !1,
        placeHolderTemplate: "",
        scrollContainer: window,
        scrollSpeed: 5
    };
    return $.fn.dragsort = function(t) {
        if ($.browser = {},
        $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase()), "destroy" == t) return $(this.selector).trigger("dragsort-uninit"),
        void 0;
        var r = $.extend({},
        e, t),
        o = [],
        a = null,
        i = null;
        return this.each(function(e, t) {
            $(t).is("table") && 1 == $(t).children().size() && $(t).children().is("tbody") && (t = $(t).children().get(0));
            var l = {
                draggedItem: null,
                placeHolderItem: null,
                pos: null,
                offset: null,
                offsetLimit: null,
                scroll: null,
                container: t,
                init: function() {
                    var t = 0 == $(this.container).children().size() ? "li": $(this.container).children(":first").get(0).tagName.toLowerCase();
                    "" == r.itemSelector && (r.itemSelector = t),
                    "" == r.dragSelector && (r.dragSelector = t),
                    "" == r.placeHolderTemplate && (r.placeHolderTemplate = "<" + t + ">&nbsp;</" + t + ">"),
                    $(this.container).attr("data-listidx", e).mousedown(this.grabItem).bind("dragsort-uninit", this.uninit),
                    this.styleDragHandlers(!0)
                },
                uninit: function() {
                    var e = o[$(this).attr("data-listidx")];
                    $(e.container).unbind("mousedown", e.grabItem).unbind("dragsort-uninit"),
                    e.styleDragHandlers(!1)
                },
                getItems: function() {
                    return $(this.container).children(r.itemSelector)
                },
                styleDragHandlers: function(e) {
                    this.getItems().map(function() {
                        return $(this).is(r.dragSelector) ? this: $(this).find(r.dragSelector).get()
                    }).css("cursor", e ? "pointer": "")
                },
                grabItem: function(e) {
                    if (! (1 != e.which || $(e.target).is(r.dragSelectorExclude) || $(e.target).closest(r.dragSelectorExclude).size() > 0 || 0 == $(e.target).closest(r.itemSelector).size())) {
                        e.preventDefault();
                        for (var t = e.target; ! $(t).is(r.dragSelector);) {
                            if (t == this) return;
                            t = t.parentNode
                        }
                        $(t).attr("data-cursor", $(t).css("cursor")),
                        $(t).css("cursor", "move");
                        var a = o[$(this).attr("data-listidx")],
                        i = this,
                        l = function() {
                            a.dragStart.call(i, e),
                            $(a.container).unbind("mousemove", l)
                        };
                        $(a.container).mousemove(l).mouseup(function() {
                            $(a.container).unbind("mousemove", l),
                            $(t).css("cursor", $(t).attr("data-cursor"))
                        })
                    }
                },
                dragStart: function(e) {
                    null != a && null != a.draggedItem && a.dropItem(),
                    a = o[$(this).attr("data-listidx")],
                    a.draggedItem = $(e.target).closest(r.itemSelector),
                    a.draggedItem.attr("data-origpos", $(this).attr("data-listidx") + "-" + a.getItems().index(a.draggedItem));
                    var t = parseInt(a.draggedItem.css("marginTop")),
                    i = parseInt(a.draggedItem.css("marginLeft"));
                    if (a.offset = a.draggedItem.offset(), a.offset.top = e.pageY - a.offset.top + (isNaN(t) ? 0 : t) - 1, a.offset.left = e.pageX - a.offset.left + (isNaN(i) ? 0 : i) - 1, !r.dragBetween) {
                        var l = 0 == $(a.container).outerHeight() ? Math.max(1, Math.round(.5 + a.getItems().size() * a.draggedItem.outerWidth() / $(a.container).outerWidth())) * a.draggedItem.outerHeight() : $(a.container).outerHeight();
                        a.offsetLimit = $(a.container).offset(),
                        a.offsetLimit.right = a.offsetLimit.left + $(a.container).outerWidth() - a.draggedItem.outerWidth(),
                        a.offsetLimit.bottom = a.offsetLimit.top + l - a.draggedItem.outerHeight()
                    }
                    var s = a.draggedItem[0].getBoundingClientRect(),
                    n = s.height,
                    d = s.width;
                    if ("tr" == r.itemSelector ? (a.draggedItem.children().each(function() {
                        $(this).width($(this).width())
                    }), a.placeHolderItem = a.draggedItem.clone().attr("data-placeholder", !0), a.draggedItem.after(a.placeHolderItem), a.placeHolderItem.children().each(function() {
                        $(this).css({
                            borderWidth: 0,
                            width: $(this).width() + 1,
                            height: $(this).height() + 1
                        }).html("&nbsp;")
                    })) : (a.draggedItem.after(r.placeHolderTemplate), a.placeHolderItem = a.draggedItem.next().css({
                        height: n,
                        width: d
                    }).attr("data-placeholder", !0)), "td" == r.itemSelector) {
                        var c = a.draggedItem.closest("table").get(0);
                        $("<table id='" + c.id + "' style='border-width: 0px;' class='dragSortItem " + c.className + "'><tr></tr></table>").appendTo("body").children().append(a.draggedItem)
                    }
                    var g = a.draggedItem.attr("style");
                    a.draggedItem.attr("data-origstyle", g ? g: ""),
                    a.draggedItem.css({
                        position: "absolute",
                        opacity: 1,
                        "z-index": 999,
                        height: n,
                        width: d
                    }),
                    a.scroll = {
                        moveX: 0,
                        moveY: 0,
                        maxX: $(document).width() - $(window).width(),
                        maxY: $(document).height() - $(window).height()
                    },
                    a.scroll.scrollY = window.setInterval(function() {
                        if (r.scrollContainer != window) return $(r.scrollContainer).scrollTop($(r.scrollContainer).scrollTop() + a.scroll.moveY),
                        void 0;
                        var e = $(r.scrollContainer).scrollTop(); (a.scroll.moveY > 0 && e < a.scroll.maxY || a.scroll.moveY < 0 && e > 0) && ($(r.scrollContainer).scrollTop(e + a.scroll.moveY), a.draggedItem.css("top", a.draggedItem.offset().top + a.scroll.moveY + 1))
                    },
                    10),
                    a.scroll.scrollX = window.setInterval(function() {
                        if (r.scrollContainer != window) return $(r.scrollContainer).scrollLeft($(r.scrollContainer).scrollLeft() + a.scroll.moveX),
                        void 0;
                        var e = $(r.scrollContainer).scrollLeft(); (a.scroll.moveX > 0 && e < a.scroll.maxX || a.scroll.moveX < 0 && e > 0) && ($(r.scrollContainer).scrollLeft(e + a.scroll.moveX), a.draggedItem.css("left", a.draggedItem.offset().left + a.scroll.moveX + 1))
                    },
                    10),
                    r.dragStart.call(a),
                    $(o).each(function(e, t) {
                        t.createDropTargets(),
                        t.buildPositionTable()
                    }),
                    a.setPos(e.pageX, e.pageY),
                    $(document).bind("mousemove", a.swapItems),
                    $(document).bind("mouseup", a.dropItem),
                    r.scrollContainer != window && $(window).bind("DOMMouseScroll mousewheel", a.wheel)
                },
                setPos: function(e, t) {
                    var o = t - this.offset.top,
                    i = e - this.offset.left;
                    if (r.dragBetween || (o = Math.min(this.offsetLimit.bottom, Math.max(o, this.offsetLimit.top)), i = Math.min(this.offsetLimit.right, Math.max(i, this.offsetLimit.left))), this.draggedItem.parents().each(function() {
                        if ("static" != $(this).css("position") && (!$.browser.mozilla || "table" != $(this).css("display"))) {
                            var e = $(this).offset();
                            return o -= e.top,
                            i -= e.left,
                            !1
                        }
                    }), r.scrollContainer == window) t -= $(window).scrollTop(),
                    e -= $(window).scrollLeft(),
                    t = Math.max(0, t - $(window).height() + 5) + Math.min(0, t - 5),
                    e = Math.max(0, e - $(window).width() + 5) + Math.min(0, e - 5);
                    else {
                        var l = $(r.scrollContainer),
                        s = l.offset();
                        t = Math.max(0, t - l.height() - s.top) + Math.min(0, t - s.top),
                        e = Math.max(0, e - l.width() - s.left) + Math.min(0, e - s.left)
                    }
                    a.scroll.moveX = 0 == e ? 0 : e * r.scrollSpeed / Math.abs(e),
                    a.scroll.moveY = 0 == t ? 0 : t * r.scrollSpeed / Math.abs(t),
                    this.draggedItem.css({
                        top: o,
                        left: i
                    })
                },
                wheel: function(e) {
                    if (($.browser.safari || $.browser.mozilla) && a && r.scrollContainer != window) {
                        var t = $(r.scrollContainer),
                        o = t.offset();
                        if (e.pageX > o.left && e.pageX < o.left + t.width() && e.pageY > o.top && e.pageY < o.top + t.height()) {
                            var i = e.detail ? 5 * e.detail: e.wheelDelta / -2;
                            t.scrollTop(t.scrollTop() + i),
                            e.preventDefault()
                        }
                    }
                },
                buildPositionTable: function() {
                    var e = [];
                    this.getItems().not([a.draggedItem[0], a.placeHolderItem[0]]).each(function(t) {
                        var r = $(this).offset();
                        r.right = r.left + $(this).outerWidth(),
                        r.bottom = r.top + $(this).outerHeight(),
                        r.elm = this,
                        e[t] = r
                    }),
                    this.pos = e
                },
                dropItem: function() {
                    if (null != a.draggedItem) {
                        var e = a.draggedItem.attr("data-origstyle");
                        return a.draggedItem.attr("style", e),
                        "" == e && a.draggedItem.removeAttr("style"),
                        a.draggedItem.removeAttr("data-origstyle"),
                        a.styleDragHandlers(!0),
                        a.placeHolderItem.before(a.draggedItem),
                        a.placeHolderItem.remove(),
                        $("[data-droptarget], .dragSortItem").remove(),
                        window.clearInterval(a.scroll.scrollY),
                        window.clearInterval(a.scroll.scrollX),
                        a.draggedItem.attr("data-origpos") != $(o).index(a) + "-" + a.getItems().index(a.draggedItem) && r.dragEnd.apply(a.draggedItem),
                        a.draggedItem.removeAttr("data-origpos"),
                        a.draggedItem = null,
                        $(document).unbind("mousemove", a.swapItems),
                        $(document).unbind("mouseup", a.dropItem),
                        r.scrollContainer != window && $(window).unbind("DOMMouseScroll mousewheel", a.wheel),
                        !1
                    }
                },
                swapItems: function(e) {
                    if (null == a.draggedItem) return ! 1;
                    a.setPos(e.pageX, e.pageY);
                    for (var t = a.findPos(e.pageX, e.pageY), l = a, s = 0; - 1 == t && r.dragBetween && s < o.length; s++) t = o[s].findPos(e.pageX, e.pageY),
                    l = o[s];
                    if ( - 1 == t) return ! 1;
                    var n = function() {
                        return $(l.container).children().not(l.draggedItem)
                    },
                    d = n().not(r.itemSelector).each(function() {
                        this.idx = n().index(this)
                    });
                    return null == i || i.top > a.draggedItem.offset().top || i.left > a.draggedItem.offset().left ? $(l.pos[t].elm).before(a.placeHolderItem) : $(l.pos[t].elm).after(a.placeHolderItem),
                    d.each(function() {
                        var e = n().eq(this.idx).get(0);
                        this != e && n().index(this) < this.idx ? $(this).insertAfter(e) : this != e && $(this).insertBefore(e)
                    }),
                    $(o).each(function(e, t) {
                        t.createDropTargets(),
                        t.buildPositionTable()
                    }),
                    i = a.draggedItem.offset(),
                    !1
                },
                findPos: function(e, t) {
                    for (var r = 0; r < this.pos.length; r++) if (this.pos[r].left < e && this.pos[r].right > e && this.pos[r].top < t && this.pos[r].bottom > t) return r;
                    return - 1
                },
                createDropTargets: function() {
                    r.dragBetween && $(o).each(function() {
                        var e = $(this.container).find("[data-placeholder]"),
                        t = $(this.container).find("[data-droptarget]");
                        e.size() > 0 && t.size() > 0 ? t.remove() : 0 == e.size() && 0 == t.size() && ("td" == r.itemSelector ? $(r.placeHolderTemplate).attr("data-droptarget", !0).appendTo(this.container) : $(this.container).append(a.placeHolderItem.removeAttr("data-placeholder").clone().attr("data-droptarget", !0)), a.placeHolderItem.attr("data-placeholder", !0))
                    })
                }
            };
            l.init(),
            o.push(l)
        }),
        this
    },
    $
});
