define(function(require) {
    function t(t, fun) {
        dopen || (dopen = new dialog({
            width: 700
        })),
		mdialog = $('<div class="ui-datasource-dialog"><div class="ui-dialog-title">编辑HTML代码</div><div class="ui-source-content"><textarea id="htmlsource"></textarea><textarea id="code" name="code"></textarea></div><div class="ui-dialog-footer"><a href="javascript:;"class="save">保存</a></div></div>');
		
		mdialog.find("#code").html(t);
		mdialog.find("#htmlsource").html(t);

		//确定保存
		var s = $(".save", mdialog);
        s.off().bind("click", function(t) {
            t.preventDefault();
            var source = mdialog.find("#htmlsource").val();
			fun(source);
			dopen.close()
            
        })
			
		dopen.open(mdialog);
		
		var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
			mode: "text/html",lineNumbers: true, tabMode: "indent", onChange:function(){
				mdialog.find("#htmlsource").html(editor.getValue());
			}
		});
    }
    var dopen, mdialog,
	e = require("class"),
	dialog = require("ui/dialog"),
    n = require("diy/widget/controller"),
    i = require("diy/widget/setting"),
    l = require("diy/panel/tabview/setting"),
    m = require("diy/runtime"),
    $ = require("jquery"),
    r = require("diy/panel/panel");
	require("./edithtml.js")
    require("./controller.css");
    var o = "html.content";
    l.createSection(o, {
        initView: function() {
            var e = this,
            n = this.addRow("html-panel"),
            i = $('<input value="HTML 内容" class="editor" type="button" />');
            n.getElement().append(i),
            i.click(function() {
                t(e.getOutlet().getWidget().getElement().html(),
                function(t) {
                    e.applyToOutlet("html", t)
                })
            })
        },
        getTitle: function() {
            return "内容"
        },
        syncParamHtml: function(t) {
            this.html = t
        }
    });
    var c = e({
        setup: function(t) {
            this.setParamHtml(t.html)
        },
        getName: function() {
            return o
        },
        setParamHtml: function(t) {
            var e = this.getWidget().getElement();
            t ? e.html(t) : e.empty()
        },
        getParamHtml: function() {
            return this.getWidget().getElement().html()
        },
        toJSON: function() {
            return {
                html: this.getParamHtml()
            }
        }
    },
    i),
    u = e({
        setup: function(e) {
            {
                var n = this,
                i = this.getWidget();
                i.getElement()
            }
            this.htmlSetting = new c(i, e.params || {
                html: ""
            }),
            i.addOutlet(this.htmlSetting),
            n.on("dblclick",
            function() {
                t(n.htmlSetting.getParamHtml(),
                function(t) {
                    n.htmlSetting.setParam("html", t)
                })
            }),
            i.on("dblclick",
            function() {
                r.toSettingTab()
            })
        },
        toJSON: function() {
            return {
                params: this.htmlSetting.toJSON()
            }
        }
    },
    n);
    return u
});