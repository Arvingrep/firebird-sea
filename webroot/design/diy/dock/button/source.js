define(function(require) {
	function oo(t) {
        dopen || (dopen = new dialog({
            width: 700
        })),
		mdialog = $('<div class="ui-datasource-dialog"><div class="ui-dialog-title">当前页面源码</div><div class="ui-source-content" style="padding:1%;"><textarea id="source" style="width:100%; height:500px;"></textarea></div></div>');
		
		mdialog.find("#source").html(t);

		dopen.open(mdialog);
    }
	
    require("./source.css");
    var dopen, mdialog,
	e = require("class"),
	$ = require("jquery"),
	dialog = require("ui/dialog"),
	m = require("ui/message"),
    t = require("./button"),
    i = require("diy/runtime"),
    s = e({
        setup: function() {
            var e = this.getElement(),
				n = i.getWorkspace();
            e.addClass("icon-source"),
            this.setHint("页面源码");
            var t = this;
            e.click(function() {
				e.hasClass("spinner") || (e.addClass("spinner"), n.source().done(function(e) {
					if(e && e.data){
						oo(JSON.stringify(e.data));
					}else{
						var data = "";
						for(var param in e){
							data = e[param];
						}
						oo(data);
					}
				}).fail(function() {
					m.error("获取失败！")
				}).always(function() {
					e.removeClass("spinner")
				}))
            })
        },
        getName: function() {
            return "source"
        }
    },
    t);
    return s
});