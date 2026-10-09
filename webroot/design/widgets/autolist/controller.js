define(function(require) {
	function expopen(r, fun) {
		r = (r.mytag == undefined && r.temp == undefined) ? param : r;
		dopen || (dopen = new dialog({
            width: 600
        })),
		mdialog = $('<div class="ui-datasource-dialog"><div class="ui-dialog-title">数据源配置</div><div class="ui-datamanage-content"><div class="mytag-form"><input class="input text"type="text"name="mytag_"value="'+r.mytag+'"placeholder="标记 id"/><a href="javascript:;"class="btn"id="mytagBtn">确定</a><span>请先在管理中心生成标记</span></div><div class="mytag-temp"><ul class="ui-tab-triggers"><li class="ui-tab-trigger active" data-id="1">系统默认</li><li class="ui-tab-trigger" data-id="0">自定义</li></ul><div class="ui-tab-content"></div></div></div><div class="ui-dialog-footer"><div class="num-setting"'+(r.mytag ? ' style="display:block"+' : "")+'><label>显示数量：<input class="input text"type="text"name="num"value="'+(r.num ? r.num : 10)+'"/></label>条</div><a href="javascript:;"class="save">保存</a></div><input type="hidden"name="mytag"value="'+r.mytag+'"/><input type="hidden"name="temp"value="'+r.temp+'"/></div>');
		
		//模板列表
		var tempObj = mdialog.find(".ui-tab-content");
		this.sc = new scroller(tempObj),
		this.body = this.sc.getBody();
		$('<div class="ui-tab-item active"></div><div class="ui-tab-item"></div>').appendTo(this.body);
		
		//TAB切换
		var tempTab  = mdialog.find(".mytag-temp li.ui-tab-trigger"),
			tempBody = mdialog.find(".mytag-temp .ui-tab-item");
			
		if(r.temp != 0){
			loadTemp(tempBody, mdialog.find("input[name='mytag_']").val(), r.temp);
		}
		
		tempTab.on("click", function(){
			var index = $(this).index();
			tempTab.each(function() {
                $(this).removeClass("active");
				$(tempTab[index]).addClass("active");
            });
			tempBody.each(function() {
                $(this).removeClass("active");
				$(tempBody[index]).addClass("active");
            });
		});
		
		//确定标记
		var b = $("#mytagBtn", mdialog);
        b.off().bind("click", function(t) {
            t.preventDefault();
			var mytagObj = mdialog.find("input[name='mytag_']");
			if($.trim(mytagObj.val()) == ""){
				message.error("请输入标签ID");
				mytagObj.focus();
				return false;
			}
			
			mdialog.find("input[name='mytag']").val(mytagObj.val());
			mdialog.find(".num-setting").show();
			mdialog.find("input[name='temp']").val("");  //重置已选模板ID
			
			loadTemp(tempBody, mytagObj.val(), 0);
			
        });
		
		//选择模板
		mdialog.find(".ui-tab-content").delegate(".ui-explorer-mine-fileitem", "click", function(event){
			var t = $(this);
			if(event.target.nodeName.toLowerCase() != "i"){
				mdialog.find(".ui-explorer-mine-fileitem").removeClass("ui-explorer-mine-fileitem-checked");
				t.addClass("ui-explorer-mine-fileitem-checked");
				mdialog.find("input[name='temp']").val(t.data("id"));
			}else{
				var cla = event.target.className;
				var id = t.attr("data-id");
				if(cla == "copy"){
					$.getJSON(c.mytagTempCopy + "&jsoncallback=?", {tempid: id}, function(t) {
						if(t.state == 100){
							b.click();
							tempTab.eq(1).click();
						}else{
							message.error(t.info);
						}
					});
					
				}else if(cla == "edit"){
					designTemp(id);
					
				}else if(cla == "del"){
					if(confirm("操作不可恢复, 确定要删除该模板吗？")){
						$.getJSON(c.mytagTempDel + "&jsoncallback=?", {tempid: id}, function(data) {
							if(data.state == 100){
								t.remove();
							}else{
								message.error(data.info);
							}
						});
					}
					
				}
			}
		});
		
		//确定保存
		var s = $(".save", mdialog);
        s.off().bind("click", function(t) {
            t.preventDefault();
            var m = $.trim(mdialog.find("input[name='mytag']").val()),
            	t = $.trim(mdialog.find("input[name='temp']").val()),
            	n = $.trim(mdialog.find("input[name='num']").val()),
				data = {
					mytag: m,
					temp: t,
					num: n
				}
				
			if(m != "" && t != ""){
				param = data;
				fun(param);
				dopen.close()
			}else{
				message.error("请选择要使用的模板！");
			}
            
        })
			
		dopen.open(mdialog);
    }
	
	
	//自定义模板
	function designTemp(id){
		var ret = function(data){
			if(data.state == 100){
				
				eopen || (eopen = new dialog({
					width: 600
				})),
				edialog = $('<div class="ui-datasource-dialog"><div class="ui-dialog-title">修改自定义模板</div><div class="ui-datamanage-content"><div class="mytag-form"><input class="input text"type="text"name="title"value="'+data.info[0].title+'"placeholder="模板名称"style="width:200px;"/><span class="has-button"><label class="btn"><b class="pick">修改图片</b></label><a class="result" href="'+cfg_attachment+data.info[0].litpic+'" target="_blank" data-hint="'+cfg_attachment+data.info[0].litpic+'">缩略图：'+data.info[0].litpic+'</a></span></div><div class="mytag-temp"style="display:block;"><ul class="ui-tab-triggers"><li class="ui-tab-trigger active">HTML</li><li class="ui-tab-trigger">CSS</li></ul><div class="ui-tab-content"><div class="ui-tab-item active"><textarea class="input"name="html">'+data.info[0].html+'</textarea></div><div class="ui-tab-item"><textarea class="input"name="css">'+data.info[0].css+'</textarea></div></div></div></div><div class="ui-dialog-footer"><a href="javascript:;"class="save">保存</a></div><input type="hidden"name="litpic"value="'+data.info[0].litpic+'"/></div>');
				
				//选择图片
				var btn = edialog.find(".pick"),
					spa = edialog.find(".result"),
					inp = edialog.find("input[name='litpic']");
				btn.bind("click", function(){
					explorer.open({
                        filter: "image",
                        success: function(t) {
                            inp.val(t.replace(cfg_attachment, "")),
                            spa.text("缩略图："+t.replace(cfg_attachment, "")).attr("data-hint", t).attr("href", t)
                        }
                    })
				});
				
				//TAB切换
				var tempTab  = edialog.find(".mytag-temp li.ui-tab-trigger"),
					tempBody = edialog.find(".mytag-temp .ui-tab-item");
					
				tempTab.on("click", function(){
					var index = $(this).index();
					tempTab.each(function() {
						$(this).removeClass("active");
						$(tempTab[index]).addClass("active");
					});
					tempBody.each(function() {
						$(this).removeClass("active");
						$(tempBody[index]).addClass("active");
					});
				});
				
				//保存
				var save = edialog.find(".save");
				save.off().bind("click", function(){
					
					var title = edialog.find("input[name='title']").val(),
						litpic = edialog.find("input[name='litpic']").val(),
						html = edialog.find("textarea[name='html']").val(),
						css = edialog.find("textarea[name='css']").val();
						
					if($.trim(title) == ""){
						message.error("请输入模板名称");
						return false;
					}
					
					if($.trim(litpic) == ""){
						message.error("请选择模板缩略图");
						return false;
					}
					
					if($.trim(html) == ""){
						message.error("请输入模板HTML内容");
						return false;
					}
					
					var data = {
							tempid: id,
							dopost: "edit",
							title: title,
							litpic: litpic,
							html: html,
							css: css
						}
					$.getJSON(c.mytagTempEdit + "&jsoncallback=?", data, function(data) {
						if(data.state == 100){
							eopen.close();
							message.ok(data.info);
							
							var b = $("#mytagBtn", mdialog),
								tempTab  = mdialog.find(".mytag-temp li.ui-tab-trigger");
							
							b.click();
							tempTab.eq(1).click();
						}else{
							message.error(data.info);
						}
					});
				});
				
				eopen.open(edialog);
				
			}else{
				message.error(data.info);
			}
		}
		return $.getJSON(c.mytagTempEdit + "&jsoncallback=?", {tempid: id}, function(data) {
			ret(data);
		}), !0;
	}
	
	
	//加载标签模板
	function loadTemp(tempBody, mytag, temp){
		$.getJSON(c.getMytagTemp + "&jsoncallback=?", {mytag: mytag}, function(t) {
			if(t.state == 100){
				if(t.list && t.list.length > 0){
					var isSystemLi = [], notSystemLi = [], list = t.list, active;
					for(var i = 0; i < list.length; i++){
						if(list[i].isSystem == 1){
							var checked = "";
							if(temp == list[i].id){
								active = 0;
								checked = " ui-explorer-mine-fileitem-checked";
							}
							isSystemLi.push('<div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-image'+checked+'" data-id="'+list[i].id+'" title="'+list[i].title+'"><a><img src="'+cfg_attachment+list[i].litpic+'" onload="this.style.visibility=\'visible\';" style="visibility: visible;"></a><span>'+list[i].title+'</span><div></div><i class="copy" data-hint="复制"></i></div>');
						}else{
							var checked = "";
							if(temp == list[i].id){
								active = 1;
								checked = " ui-explorer-mine-fileitem-checked";
							}
							notSystemLi.push('<div class="ui-explorer-mine-fileitem ui-explorer-mine-fileitem-image'+checked+'" data-id="'+list[i].id+'" title="'+list[i].title+'"><a><img src="'+cfg_attachment+list[i].litpic+'" onload="this.style.visibility=\'visible\';" style="visibility: visible;"></a><span>'+list[i].title+'</span><div></div><i class="copy" data-hint="复制"></i><i class="edit" data-hint="修改"></i><i class="del" data-hint="删除"></i></div>');
						}
					}
					
					$(tempBody[0]).html(isSystemLi);
					$(tempBody[1]).html(notSystemLi);
					
					if(active != undefined){
						mdialog.find(".mytag-temp .ui-tab-triggers li").removeClass("active");
						mdialog.find(".mytag-temp .ui-tab-item").removeClass("active");
						mdialog.find(".mytag-temp .ui-tab-triggers li:eq("+active+")").addClass("active");
						mdialog.find(".mytag-temp .ui-tab-item:eq("+active+")").addClass("active");
					}
					
					mdialog.find(".mytag-temp").show();
					
					dopen.resize();
					
				}else{
					message.error('暂无可用模板！');
				}
				
			}else{
				$(tempBody[0]).html("");
				$(tempBody[1]).html("");
				mdialog.find(".mytag-temp").hide();
				dopen.resize();
				message.error(t.info);
			}
		})
	}
	
    function t(t) {
        return t += "",
        t.substr(0, 1).toUpperCase() + t.substr(1)
    }

    var dopen, eopen, mdialog, edialog, param = [], getElement, i = require("class"),
    a = require("widgets/area/controller"),
	dialog = require("ui/dialog"),
    n = require("diy/panel/panel"),
    s = require("diy/panel/tabview/setting"),
    l = require("diy/widget/setting"),
    m = require("ui/template"),
    $ = require("jquery"),
	explorer = require("ui/explorer"),
	scroller = require("ui/scroller"),
	message = require("ui/message");
    require("./controller.css");
    var u = (require.resolve("./"), require.resolve("../../")),
    g = window.PROJECTID,
    c = {
		getMytagTemp: "/include/"+Module+".inc.php?action=mytagTemp&projectid="+g,
        getDataList: "/include/"+Module+".inc.php?action=mytagDataList&projectid="+g,
        mytagTempCopy: "/include/"+Module+".inc.php?action=mytagTempCopy&projectid="+g,
        mytagTempEdit: "/include/"+Module+".inc.php?action=mytagTempEdit&projectid="+g,
        mytagTempDel: "/include/"+Module+".inc.php?action=mytagTempDel&projectid="+g
    };
	
	
	p = "app-datalist-filter";
    s.createSection(p, {
        initView: function() {
            var t = this,
            e = this.addRow("not-empty").addCell();
            var il = $('<input type="button" class="btn btn-primary btn-block" value="点击配置" />');
            il.appendTo(e.getElement()),
            il.click(function() {
				var e = t.getOutlet().getWidget(),
            		i = e.getElement();
				getElement = i;
				t.getOutlet().manageData();
            })
        },
        getTitle: function() {
            return "数据源设置"
        },
        getClasses: function() {
            return p
        }
    });
    var w = i({
        setup: function(r) {
			var t = this,
			e = t.getWidget(),
            i = e.getElement();
			
            t.setParamMytag(r.mytag || ""),
            t.setParamTemp(r.temp || "0"),
            t.setParamNum(r.num || "10"),
			
			param = t.toJSON();
			
			getElement = i;
			this.content = $(''),
            i.append(t.content),
			
			e.on("dblclick", function() {
				getElement = i;
				t.manageData();
            })
			
			if(r.mytag == undefined && r.temp == undefined){
				expopen(r, function(data){
					t._mytag = data.mytag;
					t._temp = data.temp;
					t._num = data.num;
					t.setParam("autolist", JSON.parse(JSON.stringify(data)));
					t.loadData(getElement);
				});
			}else{
				t.loadData(getElement);
			}
        },
		
		getParamAutolist: function() {
            return this._autolist
        },
		getParamMytag: function() {
            return this._mytag
        },
        getParamTemp: function() {
            return this._temp
        },
        getParamNum: function() {
            return this._num
        },
        setParamAutolist: function(t) {
            this._autolist = t
        },
		setParamMytag: function(t) {
            this._mytag = t
        },
        setParamTemp: function(t) {
            this._temp = t
        },
        setParamNum: function(t) {
            this._num = t
        },
        getName: function() {
            return p
        },
		manageData: function(){
			var e = this;
			n.toSettingTab();
			expopen(e.toJSON(), function(data){
				e._mytag = data.mytag;
				e._temp = data.temp;
				e._num = data.num;
				e.setParam("autolist", JSON.parse(JSON.stringify(data)));
				e.loadData(getElement);
			});
		},
        loadData: function(o) {
            var t = this;
			if(t.getParam("mytag") != ""){
				var e = ("autolist_" + g + "_" + t.getParam("mytag") + "_" + t.getParam("temp") + "_" + t.getParam("num"), function(obj, e) {
					if(e.state == 100){
						var css = '<style type="text/css">\n'+e.css+'\n</style>';
						obj.html(css+e.list);
					}else{
						obj.html(e.info);
					}
					return ! 0
				});
				return $.getJSON(c.getDataList + "&jsoncallback=?", param, function(t) {
					e(o, t);
				}), !0
			}else{
				return "";
			}
        },
        toJSON: function() {
            return {
                mytag: this._mytag,
                temp: this._temp,
                num: this._num
            }
        }
    },
    l),

    _ = i({
        setup: function(t) {
            {
                var e = this.getWidget();
                e.getPage()
				
				param = t.params || {
						mytag: "",
						temp: "",
						num: ""
					}
            }
			getElement = e.getElement();
            this.autolistSetting = new w(e, t.params || {}),
            e.addOutlet(this.autolistSetting)
        },
        toJSON: function() {
            return {
                params: this.autolistSetting.toJSON()
            }
        }
    },
    a);
    return _
});