$(function(){

	var isOper = false, basehost = cfg_basehost.replace("http://", "").replace("https://", "");

	//拼接列表
	if(moduleArr.length > 0){
		var list = [];
		for(var i = 0; i < moduleArr.length; i++){
			list.push('<tr data-module="'+moduleArr[i].module+'" data-name="'+moduleArr[i].name+'" data-type="'+moduleArr[i].type+'" data-domain="'+moduleArr[i].domain+'">');
			list.push('<td class="row3">&nbsp;</td>');
			list.push('<td class="row12 left"><strong>'+moduleArr[i].name+'</strong></td>');
			list.push('<td class="row10 left">'+getSelect(moduleArr[i].type, moduleArr[i].module)+'</td>');
			list.push('<td class="row35 left">'+getInput(moduleArr[i].type, moduleArr[i].domain, moduleArr[i].module)+'</td>');
			list.push('<td class="row40 left"><a href="javascript:;" class="link save">保存</a></td>');
			list.push('</tr>');
		}
		$("#list tbody").html(list.join(""));
	}

	//类型切换改变域名规则
	$("#list").delegate("select", "change", function(){
		var t = $(this), par = t.closest("tr"), id = t.find("option:selected").val(), domain = par.attr("data-domain"), module = par.attr("data-module");
		par.find("td:eq(3)").html(getInput(id, domain, module));
	});

	//批量修改
	$(".dropdown-menu a").bind("click", function(){
		var id = $(this).attr("data-id");
		$("#list").find("tr").each(function(){
			$(this).find("select option:eq("+(id-1)+")").attr("selected", true);
			$(this).find("select").change();
		});

	});

	//全部保存
	$(".btn-success").bind("click", function(){
		$.dialog.confirm('确定要修改吗？', function(){

			//保存
			$("#list").find("tr").each(function(){
				$(this).find(".save").click();
			});

		});
	});

	//保存
	$("#list").delegate(".save", "click", function(){
		var t = $(this), par = t.closest("tr"), module = par.attr("data-module"), name = par.attr("data-name"), type = par.find("select option:selected").val(), domain = par.find("input").val();
		var oType = par.attr("data-type"), oDomain = par.attr("data-domain");

		//判断是否有变化
		//if(oType == type && oDomain == domain) return false;

		if(t.html() != "保存" && t.html() != "保存失败，点击重试！") return false;
		t.html("<img src='/static/images/loadgray.gif' style='width: auto; height: auto;' />");

		var mod = module == "pic" ? "article" : module;
		var name = name == "个人会员" ? "user" : name == "企业会员" ? "busi" : "config";
		var href = '../'+mod+'/'+mod+'Config.php?action='+module+'&name='+name+'&type=domain', data = [];
		data.push("subdomain="+type);
		data.push("channeldomain="+domain);
		data.push("token="+token);

		huoniao.operaJson(href, data.join("&"), function(data){
			if(data.state != 100){
				t.html("保存失败，点击重试！").removeClass().addClass("save refuse");
				$.dialog.alert(data.info);
			}else{
				par.attr("data-domain", domain);
				par.attr("data-type", type);
				t.html("<span class='text-success'>保存成功！</span>").removeClass();
				setTimeout(function(){
					t.html("保存").addClass("link save");
				}, 2000);
				parent.getPreviewInfo();
			}
		});

	});

	//域名类型
	function getSelect(id, module){
		var l = [];
		l.push('<select class="input-small"'+(module == 'member' ? 'disabled' : '')+'>');
		if(module == 'member'){
			l.push('<option value="2"'+(id == 2 ? 'selected' : "")+'>子目录</option>');
		}else{
			l.push('<option value="1"'+(id == 1 ? 'selected' : "")+'>子域名</option>');
			l.push('<option value="2"'+(id == 2 ? 'selected' : "")+'>子目录</option>');
		}
		l.push('</select>');
		return l.join("");
	}

	//域名配置表单
	function getInput(id, name, module){
		var i = [];
		i.push('<div class="input-prepend input-append" style="margin:0;">');

		if(module == 'member'){
			i.push('<span class="add-on">http://'+basehost+'/</span>');
			i.push('<input class="input-mini" type="text" value="'+name+'">');
		}else{
			//主域名
			if(id == 0 && module == 'member'){
				i.push('<span class="add-on">http://</span>');
				i.push('<input class="input-large" type="text" value="'+name+'">');

			//子域名
			}else if(id == 1){
				i.push('<span class="add-on">http://</span>');
				i.push('<input class="input-mini" type="text" value="'+name+'">');
				i.push('<span class="add-on">.'+basehost+'</span>');

			//子目录
			}else if(id == 2){
				i.push('<span class="add-on">http://'+basehost+'/</span>');
				i.push('<input class="input-mini" type="text" value="'+name+'">');
			}
		}

        i.push('</div>');
		return i.join("");
	}

});
