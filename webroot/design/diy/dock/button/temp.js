define(function(require) {
	//加载模板
	function loadTempList(e){
		if(e.body){
			
			var id = e.panel.find("> .category-tabs li.active").attr("data-id");
			$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempList&jsoncallback=?", {projectid: window.PROJECTID, type: id}, function(data) {
				if(data.state == 100 && data.list){
					var list = data.list, div = [];
					for(var ii = 0; ii < list.length; ii++){
						div.push('<div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-image" data-id="'+list[ii].id+'" title="'+list[ii].title+'"><a><img src="'+cfg_attachment+list[ii].litpic+'" onload="this.style.visibility=\'visible\';" style="visibility: visible;"></a><span>'+list[ii].title+'</span></div>');
					}
					e.body.html(div.join(""));
					
				}else{
					e.body.html('<div class="loading">'+data.info+'</div>');
				}
			});

		}
	}
	
	function ee(e, t) {
        var i, n, o = e.lastElementChild;
        if (null == o) return null;
        do
        if (o.dataset.level) {
            if (parseInt(o.dataset.level) <= t) {
                i = o;
                break
            }
            n = o
        }
        while (o = o.previousElementSibling);
        return n || i && (n = i.nextElementSibling) ? n: null
    }
    function t(e) {
        var i = [];
        return e ? (i.push({
            type: e.type,
            theme: e.theme
        }), e.items && e.items.forEach(function(e) {
            i.concat(t(e))
        }), i) : i
    }
	
    require("./temp.css");
    var i = require("class"),
    $ = require("jquery"),
	p = require("ui/scrollist"),
    a = require("ui/scroller"),
    n = require("./button"),
    s = require("ui/message"),
	l = require("control/select"),
    runtime = require("diy/runtime");
    var c = "active",
    doc = $(document);
	
    var f = i({
        setup: function() {
            var e, t = this,
            i = this.getElement();
            i.addClass("icon-temp large"),
            this.setHint("模板"),
            i.click(function() {
                e && clearTimeout(e),
                t.actived ? t.deactive() : t.active()
            }),
            this.ideactive = function(e) {
                t.confirm || e.target.className.indexOf("option") > -1 || t.panel[0].contains(e.target) || i[0].contains(e.target) || t.deactive()
            }
        },
        getName: function() {
            return "page"
        },
        initPanel: function() {
			var e = this;
			this.panel = $('<div class="diy-temp-panel"><h2>'+(Module == "special" ? "专题" : "自助建站")+'模板<i class="icon-close close"></i></h2><div class="category-tabs"><div class="input"><label>模板分类：</label></div><div class="input select"><input name="href" type="hidden" /></div></div><div class="content"></div><script type="text/template" class="list-tpl"><div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-image" data-id="{%id%}" title="{%title%}"><a><img src="'+cfg_attachment+'{%litpic%}&type=small" onload="this.style.visibility=\'visible\';" style="visibility: visible;"></a><span>{%title%}</span></div></script></div>').appendTo(document.body),
			this.content = this.panel.find("> .content"),
			this.scroller = new a(this.content),
			this.body = this.scroller.getBody(),
			this.scrollist = new p(this.body, {
				baseUrl: "/include/"+Module+".inc.php?action="+Module+"TempList&projectid=" + window.PROJECTID,
				itemTemplate: e.panel.find(".list-tpl").html(),
                pagesize: 24,
                scrollElement: e.scroller.getInner()
			}),
			this.pageid = location.hash.replace("#", "").toString();
				
			$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempType&jsoncallback=?", {projectid: window.PROJECTID}, function(t) {
				if(t.state == 100 && t.list){
					var selectFun = new l({}).appendTo(e.panel.find(".input.select"));
					var list = t.list, ul = [];
					for(var ii = 0; ii < list.length; ii++){
						selectFun.addOption({
							label: list[ii].typename,
							value: list[ii].id
						});
					}
					if(list.length > 0){
						e.scrollist.load();
					}else{
						e.body.html('<div class="loading">暂无模板！</div>');
					}
					
					selectFun.on("change", function(data) {
						e.scrollist.load({
							type: data || ""
						});
					});
					
					$("li", e.panel.find("> .category-tabs")).bind("click", function(){
						if(!$(this).hasClass("active")){
							e.panel.find("> .category-tabs li").removeClass("active");
							$(this).addClass("active");
							var type = $(this).attr("data-id");
							e.scrollist.load({
                        		type: type
                    		});
						}
					});
					
				}else{
					e.body.html('<div class="loading">'+t.info+'</div>');
				}
			});
            this.panel.find("i.close").click(function() {
                e.deactive()
            });
			
			this.body.on("click", ".ui-explorer-mine-fileitem", function(){
				var id = $(this).attr("data-id");
				if(id){
					if(confirm("确定要以此模板替换当前风格吗？\n注意：此操作不可恢复！！！")){
						
						e.deactive();
						e.workspace = runtime.workspace;
						var d = e.workspace.getPreloader();
						d.start().message("加载模板数据"),
						d.incr()
						
						$.getJSON("/include/"+Module+".inc.php?action="+Module+"TempReplace&jsoncallback=?", {projectid: window.PROJECTID, tempid: id, pageid: e.pageid}, function(data) {
							if(data.state == 100){
								d.message("替换完成！！！");
								setTimeout(function(){
									window.location.reload();
									d.done();
								}, 500);
							}else{
								d.done();
								s.error(data.info);
							}
						});
					}
				}
			});
			
			runtime.getWorkspace().on("opend", function(t) {})
        },
        active: function() {
            this.actived = 1,
            this.getElement().addClass(c),
            this.panel || this.initPanel(),
            this.panel.addClass("visible").fadeIn(200),
            doc.on("mousedown", this.ideactive)
        },
		remove: function() {
            this.removed = 1,
            this.hide(),
            this.detach()
        },
        deactive: function() {
            var e = this,
            t = $.Deferred();
            return e.actived = 0,
                e.getElement().removeClass(c),
                e.panel && e.panel.removeClass("visible").fadeOut(200),
                doc.off("mousedown", e.ideactive),
            	t.promise()
        },
        beforeSave: function() {
            return this.rootWidget.beforeSave()
        },
        toJSON: function() {
            return this.rootWidget.toJSON()
        }
    },
    n);
    return f
});