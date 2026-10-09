define(function(require) {
    var $ = require("jquery"),
    cla = require("class"),
    emitter = require("./emitter"),
    readypromise = require("./readypromise"),
    snapshot = require("./snapshot"),
    page = require("./page/page"),
    message = (require("ui/message"), require("ui/mousetrap")),
    shortcut = require("./shortcut"),
    util = require("../util"),
    doc = window.document,
    location = window.location,
    localStorage = window.localStorage,
    g = 5000,
    h = 10000,
    preloader = cla({
        initialize: function(e) {
            this.element = $('<div class="preloader"><div class="box"><div class="message"></div><div class="track"><div class="bar"></div></div></div></div>').appendTo(e),
            this.bar = this.element.find(".bar"),
            this.msg = this.element.find(".message"),
            this.currentPercentage = 0
        },
        percent: function(e) {
            return this.currentPercentage = e,
            this.bar.css("width", 100 * this.currentPercentage + "%"),
            this
        },
        start: function() {
            return this.running || this.reset(),
            this.running = 1,
            this
        },
        reset: function() {
            this.running = 0,
            this.element.removeClass("done"),
            this.percent(0),
            this.message(""),
            this.element.show()
        },
        incr: function(e) {
            return this.percent(this.currentPercentage + (1 - this.currentPercentage) * Math.pow(.1, e || 1)),
            this
        },
        message: function(e) {
            return this.msg.html(e),
            this
        },
        done: function() {
            this.running = 0,
            this.percent(1),
            this.element.addClass("done");
            var e = this.element;
            return setTimeout(function() {
                e.hide()
            },
            400),
            this
        }
    }),
    d = cla({
        initialize: function(e) {
            var t = this;
            t.projectid = e;
            var a = localStorage.getItem(e + ":rescueData");
            if (a) a = JSON.parse(a),
            setTimeout(function() {
                confirm("需要回复上次意外推出而未保存的数据吗？") ? (t.rescueData = a, t.setup()) : t.setup()
            },
            0);
            else {
                var i = localStorage.getItem(e + ":opened");
                i && i + g > util.now() ? setTimeout(function() {
                    confirm("当前项目已在当前浏览器打开，仍然继续？") ? t.setup() : window.close()
                },
                0) : t.setup()
            }
        },
        loadInfo: function(e) {
            var t = this,
            a = $.Deferred();
            return this.rawInfo && !e ? a.resolve(this.rawInfo) : util.ajaxRequestData("/include/"+Module+".inc.php?action=page&projectid=" + this.projectid).done(function(e) {
                if (!e.data || e.data.pages.length <= 0) return t.emit("error", e.message),
				t.getPreloader().message(e.message),
                void 0;
                var i = t.rawInfo = e.data;
				t.setMacros(i.macros),
                t.setPages(i.pages);

				i.templates.forEach(function(e) {
					if(e.name.indexOf("阅读页") < 0){
						t.addPage(e);
					}
				}, t)

                t.setTemplates(i.templates),
                a.resolve(i)
            }),
            a.promise()
        },
        setup: function() {
            function e() {
                localStorage.setItem(n + ":opened", util.now())
            } {
                var t, a = this,
                n = a.projectid,
                c = $(window);
                $(doc)
            }
            e(),
            t = setInterval(e, g),
            c.on("unload",
            function() {
                t && clearInterval(t),
                localStorage.removeItem(n + ":opened")
            }).on("beforeunload",
            function() {
                return ! a.isReady || a.isModified() ? "不保存而离开吗": void 0
            }),
            a.container = $('<div id="workspace"></div>').appendTo(doc.body),
            a.preloader = new preloader(this.container),
            a.preloader.start().message("加载项目"),
            a.macroValueMap = {},
            a.valueMacroMap = {},
            a.pageMap = {},
            a.pageStack = [],
            a.pageOpens = [],
            a.loadInfo().done(function() {
                a.preloader.incr(),
                a.ready()
            }),
            this.ready(function() {
                function e() {
                    a.isModified() && a.saveRescue()
                }
                a.preloader.incr(2);
                var t = util.pageidFromHash() || localStorage.getItem(this.projectid + ":mempageid");
                if (t ? a.openPage(t) : a.openFirstPage(), c.on("unload",
                function() {
                    a.exit()
                }).on("hashchange",
                function() {
                    var e = util.pageidFromHash();
                    a.openPage(e)
                }), h > 0) {
                    var i = setInterval(e, h);
                    c.on("unload",
                    function() {
                        i && clearInterval(i)
                    })
                }
            });
            var d = null;
            this.selectionChange = function(e) {
                e !== d && (d = e, a.emit("selectionchange", d))
            },
            snapshot.on("move",
            function() {
                if (a.currentPage) {
                    var e = a.currentPage,
                    t = e.getWindow()[0],
                    i = t.pageXOffset,
                    n = t.pageYOffset,
                    r = e.getBounds(),
                    s = this.getBounds();
                    s.bottom + 10 > r.bottom ? n += Math.max(20, s.bottom + 10 - r.bottom) : s.top - 10 < r.top && (n -= Math.max(20, 10 + r.top - s.top)),
                    t.scrollTo(i, n)
                }
            }),
            this.shortcut = new shortcut(message)
        },
        getContainer: function() {
            return this.container
        },
        getPreloader: function() {
            return this.preloader
        },
        getProjectId: function() {
            return this.projectid
        },
        getProjectUrl: function() {
            return this.rawInfo.url
        },
        requestData: function(e, t) {
            var a = new RegExp("\\b" + this.projectid + "\\b"),
            i = $.Deferred();
            return e += "&projectid=" + this.projectid,
            $.ajax({
                url: e,
                type: "get",
                dataType: "json"
            }).then(function(e) {
                1401 == e.code ? i.reject() : i.resolve(e)
            },
            function(e, t, a) {
                i.resolve({
                    code: 417,
                    message: a.message || t
                })
            }),
            t && i.done(t),
            i.promise()
        },
        saveData: function(e, t, a) {
            var i = new RegExp("\\b" + this.projectid + "\\b"),
            n = $.Deferred();
            return i.test(e) || (e += (e.indexOf("?") > 0 ? "&": "?") + "projectid=" + this.projectid),
            $.ajax({
                url: e,
                type: "post",
                dataType: "json",
                data: t
            }).then(function(e) {
                1401 == e.code ? n.reject() : n.resolve(e)
            },
            function(e, t, a) {
                n.resolve({
                    code: 417,
                    message: a.message || t
                })
            }),
            a && n.done(a),
            n.promise()
        },
        setMacros: function(e) {
            if (null != e) {
                for (var t in e) this.macroValueMap[t] = e[t],
                this.valueMacroMap[e[t]] = t;
                this.macroValuePattern = new RegExp("\\{(" + Object.keys(this.macroValueMap).map(function(e) {
                    return util.regexpQuote(e)
                }).join("|") + ")\\}", "ig"),
                this.valueMacroPattern = new RegExp("\\b(" + Object.keys(this.valueMacroMap).map(function(e) {
                    return util.regexpQuote(e)
                }).join("|") + ")\\b", "ig")

            }
        },
        getValueByMacro: function(e) {
            return this.macroValueMap[e]
        },
        getMacroByValue: function(e) {
            return this.valueMacroMap[e]
        },
        toMacro: function(e) {
            var t = this,
            a = typeof e;
            if (null == e) return e;
            if ("string" === a) return e.replace(this.valueMacroPattern,
            function(e, a) {
                return "{" + t.getMacroByValue(a) + "}"
            });
            if ("object" === a) {
                var i = Array.isArray(e) ? new Array(e.length) : {};
                return $.each(e,
                function(e, a) {
                    i[e] = t.toMacro(a)
                }),
                i
            }
            return e
        },
        trMacro: function(e) {
            var t = this,
            a = typeof e;
            if (null == e) return e;
            if ("string" === a) return e.replace(this.macroValuePattern,
            function(e, a) {
                return t.getValueByMacro(a)
            });
            if ("object" === a) {
                var i = Array.isArray(e) ? new Array(e.length) : {};
                return $.each(e,
                function(e, a) {
                    i[e] = t.trMacro(a)
                }),
                i
            }
            return e
        },
        getCurrentPage: function() {
            return this.currentPage
        },
        getPageInfo: function(e) {
            return e = e.toString(),
            e in this.pageMap ? this.pageMap[e].info: null
        },
        getPages: function() {
            return this.pages
        },
        setPages: function(e) {
            this.pages = e.sort(util.pagesorter),
            this.pageStack = new Array(e.length),
            e.forEach(function(e, t) {
                var a = e.pageid.toString();
                this.pageStack[t] = a,
                this.pageMap[a] = {
                    info: e
                }
            },
            this)
        },
        getTemplates: function() {
            return this.templates
        },
        setTemplates: function(e) {
            this.templates = e,
            e.forEach(function(e) {
                var t = e.pageid.toString();
                this.pageMap[t] = {
                    info: e
                }
            },
            this)
        },
        openPage: function(e) {
            if (e = e.toString(), !this.currentPage || this.currentPage.getPageId() != e) if (this.currentPage && (this.currentPage.hide(), this.currentPage.off("selectionchange", this.selectionChange), this.selectionChange(null)), this.currentPage = this.getPage(e)) {
                var t = this.pageOpens.indexOf(e);
                t > -1 && this.pageOpens.splice(t, 1),
                this.pageOpens.push(e),
                this.currentPage.on("selectionchange", this.selectionChange),
                this.currentPage.show(),
                location.hash = e,
                localStorage.setItem(this.projectid + ":mempageid", e),
                this.emit("opend", e)
            } else this.openLatestPage()
        },
        openFirstPage: function() {
            this.pageStack.length && this.openPage(this.pageStack[0])
        },
        openLatestPage: function() {
            this.pageOpens.length ? this.openPage(this.pageOpens.pop()) : this.openFirstPage()
        },
        getPage: function(e) {
            if (e = e.toString(), !(e in this.pageMap)) return null;
            var t = null;
            return this.rescueData && (t = this.rescueData[e]),
            this.pageMap[e].page || (this.pageMap[e].page = new page(this, e, t))
        },
        addPage: function(e) {
            for (var t = this.pages.length,
            a = e.pageid.toString(); t-->0 && util.pagesorter(this.pages[t], e) > 0;);
            return this.pages.splice(++t, 0, e),
            this.pageStack.splice(t, 0, a),
            this.pageMap[a] = {
                info: e
            },
            this.emit("pageupdate"),
            t
        },
        updatePage: function(e) {
            var t = e.pageid.toString(),
            a = this.pageMap[t];
            if (a) {
                e = $.extend(a.info, e);
                var i = this.pageStack.indexOf(t);
                for (i > -1 && (this.pageStack.splice(i, 1), this.pages.splice(i, 1)), i = this.pages.length; i-->0 && util.pagesorter(this.pages[i], e) > 0;);
                return this.pages.splice(++i, 0, e),
                this.pageStack.splice(i, 0, t),
                this.emit("pageupdate"),
                i
            }
        },
        updatePagesSort: function(e) {
            Array.isArray(e) || (e = []),
            e.forEach(function(e) {
                var t = this.pageMap[e.pageid];
                t && (t.info.sort = e.sort)
            },
            this),
            e.length && (this.pages.sort(util.pagesorter), this.pageStack = new Array(this.pages.length), this.pages.forEach(function(e, t) {
                this.pageStack[t] = e.pageid.toString()
            },
            this), this.emit("pageupdate"))
        },
        deletePage: function(e) {
            e = String(e),
            e == this.getCurrentPage().getPageId() && this.openFirstPage();
            var t = this.pageOpens.indexOf(e);
            t > -1 && this.pageOpens.splice(t, 1),
            t = this.pageStack.indexOf(e),
            t > -1 && (this.pageStack.splice(t, 1), this.pages.splice(t, 1)),
            this.pageMap[e].page && (this.pageMap[e].page.remove(), this.pageMap[e].page = null),
            delete this.pageMap[e],
            this.emit("pageupdate")
        },
        isModified: function() {
            var e;
            for (var t in this.pageMap) if ((e = this.pageMap[t].page) && e.isModified()) return 1;
            return 0
        },
        savePoint: function() {
            var e;
            for (var t in this.pageMap)(e = this.pageMap[t].page) && e.savePoint()
        },
        toJSON: function() {
            var e, t = {};
            for (var a in this.pageMap)(e = this.pageMap[a].page) && e.isModified() && (t[a] = JSON.stringify(this.toMacro(e.toJSON())));
            return t
        },
        beforeSave: function() {
            var e, t = [];
            for (var a in this.pageMap)(e = this.pageMap[a].page) && e.isModified() && t.push(e.beforeSave());
            return $.when.apply($, t)
        },
        save: function() {
            if (this.saveDfd) return this.saveDfd.promise();
            var e = $.Deferred();
            if (this.isModified()) {
                this.saveDfd = e;
                var t = this;
                this.beforeSave().then(function() {
                    var e = {
                        pages: t.toJSON(),
                        version: DESIGN_VERSION
                    };
                    return util.ajaxSaveData("/include/"+Module+".inc.php?action=save&projectid=" + t.projectid, e)
                },
                function() {
                    e.reject()
                }).then(function(a) {
                    a.code || t.savePoint(),
                    e.resolve(a)
                },
                function() {
                    e.reject()
                }).always(function() {
                    t.saveDfd = null
                })
            } else e.resolve({
                code: 0,
                message: "已保存"
            });
            return e.promise()
        },
		source: function() {
			if (this.saveDfd) return this.saveDfd.promise();
            var e = $.Deferred();
            if (this.isModified()) {
                this.saveDfd = e;
                var t = this;
                this.beforeSave().then(function() {
                    return t.toJSON()
                },
                function() {
                    e.reject()
                }).then(function(a) {
                    e.resolve(a)
                },
                function() {
                    e.reject()
                }).always(function() {
                    t.saveDfd = null
                })
            } else {

				$.getJSON("/include/"+Module+".inc.php?action=pagedata", {projectid: window.PROJECTID, pageid: location.hash.replace("#", "").toString()}, function(d) {
					var data = "";
					if(d && d.data){
						var data = d.data;
					}
					e.resolve({data: data});
				});
			}
            return e.promise()
        },
        saveRescue: function() {
            var e = {};
            for (var t in this.pageMap) {
                var a = this.pageMap[t].page;
                a && a.isModified() ? e[t] = this.toMacro(a.toJSON()) : this.rescueData && t in this.rescueData && (e[t] = this.rescueData[t])
            }
            var i = JSON.stringify(e);
            localStorage.setItem(this.projectid + ":rescueData", i)
        },
        exit: function() {
            localStorage.removeItem(this.projectid + ":rescueData")
        }
    });
    return d.implement(readypromise),
    d.implement(emitter),
    d
});
