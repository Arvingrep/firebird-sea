$(function(){

	var isOper = false;

	//拼接列表
	if(domainArr.length > 0){
		var list = [];
		for(var i = 0; i < domainArr.length; i++){
			list.push('<tr data-id="'+domainArr[i].id+'" data-name="'+domainArr[i].name+'" data-type="'+domainArr[i].type+'" data-domain="'+domainArr[i].domain+'">');
			list.push('<td class="row3">&nbsp;</td>');
			list.push('<td class="row12 left"><strong>'+domainArr[i].name+'</strong></td>');
			list.push('<td class="row10 left">'+getSelect(domainArr[i].type)+'</td>');
			list.push('<td class="row25 left">'+getInput(domainArr[i].type, domainArr[i].domain)+'</td>');

			var index = '<a href="javascript:;" class="link index">设为默认城市</a>';
			if(domainArr[i].id == defaultCity){
				index = '<a href="javascript:;" class="index curr" style="color: #f00;">默认城市</a>';
			}
			list.push('<td class="row50 left"><a href="javascript:;" class="link save">保存</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link delete">删除</a>&nbsp;&nbsp;|&nbsp;&nbsp;<a href="javascript:;" class="link business">商圈</a>&nbsp;&nbsp;|&nbsp;&nbsp;'+index+'</td>');
			list.push('</tr>');
		}
		$("#list tbody").html(list.join(""));
	}else{
		$("#list tbody td").html('请先开通城市！');
	}

	//设置默认城市
	$("#list").delegate(".index", "click", function(){
		var t = $(this), tr = t.closest("tr"), id = tr.attr("data-id");
		if(!t.hasClass("curr")){
			huoniao.operaJson("tuanConfig.php?type=defaultCity", "&defaultCity="+id+"&token="+token, function(data){
				location.reload();
			});
		}
	});

	//类型切换改变域名规则
	$("#list").delegate("select", "change", function(){
		var t = $(this), par = t.closest("tr"), id = t.find("option:selected").val(), domain = par.attr("data-domain");
		par.find("td:eq(3)").html(getInput(id, domain));
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
		var t = $(this), par = t.closest("tr"), type = par.find("select option:selected").val(), domain = par.find("input").val();
		var id = par.attr("data-id"), oType = par.attr("data-type"), oDomain = par.attr("data-domain");

		//判断是否有变化
		if(oType == type && oDomain == domain) return false;

		if(t.html() != "保存" && t.html() != "保存失败，点击重试！") return false;
		t.html("<img src='/static/images/loadgray.gif' style='width: auto; height: auto;' />");

		var data = [];
		data.push("id="+id);
		data.push("type="+type);
		data.push("domain="+domain);
		data.push("token="+token);

		huoniao.operaJson("tuanCity.php?dopost=update", data.join("&"), function(data){
			if(data.state != 100){
				t.html("保存").removeClass().addClass("save refuse");
				$.dialog.alert(data.info);
				setTimeout(function(){
					t.html("保存").addClass("link save");
				}, 2000);
			}else{
				par.attr("data-domain", domain);
				par.attr("data-type", type);
				t.html("<span class='text-success'>保存</span>").removeClass();
				setTimeout(function(){
					t.html("保存").addClass("link save");
				}, 2000);
			}
		});

	});

	//删除
	$("#list").delegate(".delete", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");

		if(t.html() != "删除") return false;

		$.dialog.confirm("确定要删除吗？", function(){
			t.html("<img src='/static/images/loadgray.gif' style='width: auto; height: auto;' />");
			huoniao.operaJson("tuanCity.php?dopost=del", "id="+id, function(data){
				if(data.state != 100){
					t.html("删除").removeClass().addClass("save refuse");
					$.dialog.alert(data.info);
					setTimeout(function(){
						t.html("删除").addClass("link save");
					}, 2000);
				}else{
					par.remove();
				}
			});
		});

	});

	//商圈
	$("#list").delegate(".business", "click", function(){
		var t = $(this), tr = t.closest("tr"), name = tr.data("name"), id = tr.data("id");
		parent.addPage("tuanCityBusiness"+id, "tuan", name+"商圈", "tuan/tuanCityBusiness.php?cid="+id);
	});


	//开通城市
	$(".btn-primary").bind("click", function(){
		$.dialog({
			fixed: true,
			title: '开通团购城市',
			content: $("#addCity").html(),
			width: 570,
			init: function(){

				parent.$("#pBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
						getCity(id);
					}else{
						parent.$("#cBtn").html('<option value="0">--城市--</option>');
						parent.$("#xBtn").html('<option value="0">--区县--</option>');
					}
				});

				parent.$("#cBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
						getCounty(id);
					}else{
						parent.$("#xBtn").html('<option value="0">--区县--</option>');
					}
				});

				parent.$("#xBtn").change(function(){
					var id = $(this).val(), pinyin = $(this).find("option:selected").data("pinyin");
					if(id != 0 && id != ""){
						parent.$("#domain").val(pinyin);
					}else{
						parent.$("#xBtn").html('<option value="0">--区县--</option>');
					}
				});


				//开启、关闭交互
				parent.$("input[name=domaintype]").bind("click", function(){
					var t = $(this), input = parent.$("#domain");
					if(t.val() == 0){
						input.removeClass().addClass("input-large");
						input.prev(".add-on").html("http://");
						input.next(".add-on").hide();
					}else if(t.val() == 1){
						input.removeClass().addClass("input-mini");
						input.prev(".add-on").html("http://");
						input.next(".add-on").html("."+subdomain).show();
					}else{
						input.removeClass().addClass("input-mini");
						input.prev(".add-on").html("http://"+subdomain+"/");
						input.next(".add-on").hide();
					}
				});

			},
			ok: function(){

				var cid = 0, xBtn = parent.$("#xBtn").val(), cBtn = parent.$("#cBtn").val(), pBtn = parent.$("#pBtn").val(),
						type = parent.$("input[name=domaintype]:checked").val(),
						domain = $.trim(parent.$("#domain").val());
				if(xBtn != "" && xBtn != 0){
					cid = xBtn;
				}else if(cBtn != "" && cBtn != 0){
					cid = cBtn;
				}else if(pBtn != "" && pBtn != 0){
					cid = pBtn;
				}

				if(cid == 0){
					alert("请选择要开通的城市！");
					return false;
				}

				if(domain == ""){
					alert("请输入要绑定的域名");
					return false;
				}

				var data = [],
				t = this;
				data.push("cid="+cid);
				data.push("type="+type);
				data.push("domain="+domain);

				huoniao.operaJson("tuanCity.php?dopost=add", data.join("&"), function(data){
					if(data && data['state'] == 100){
						t.close();
						location.reload();
					}else{
						alert(data.info);
					}
				});
				return false;

			}
		});
	});


	function getCity(id){
		huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					li.push('<option value="'+data[i].id+'" data-pinyin="'+data[i].pinyin+'">'+data[i].typename+'</option>');
				}
				parent.$("#cBtn").html('<option value="0">--城市--</option>'+li.join(""));
				parent.$("#xBtn").html('<option value="0">--区县--</option>');
			}else{
				parent.$("#cBtn").html('<option value="0">--城市--</option>');
				parent.$("#xBtn").html('<option value="0">--区县--</option>');
			}
		});
	}


	function getCounty(id){
		huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getCity", "id="+id, function(data){
			if(data){
				var li = [];
				for(var i = 0; i < data.length; i++){
					li.push('<option value="'+data[i].id+'" data-pinyin="'+data[i].pinyin+'">'+data[i].typename+'</option>');
					parent.$("#xBtn").html('<option value="0">--区县--</option>'+li.join(""));
				}
			}
		});
	}


	//域名类型
	function getSelect(id){
		var l = [];
		l.push('<select class="input-small">');
		//l.push('<option value="0"'+(id == 0 ? 'selected' : "")+'>主域名</option>');
		if(customSubDomain != 2){
			l.push('<option value="1"'+(id == 1 ? 'selected' : "")+'>子域名</option>');
		}
		l.push('<option value="2"'+(id == 2 ? 'selected' : "")+'>子目录</option>');
		l.push('</select>');
		return l.join("");
	}

	//域名配置表单
	function getInput(id, name){
		var i = [];
		i.push('<div class="input-prepend input-append" style="margin:0;">');

		//主域名
		if(id == 0){
			i.push('<span class="add-on">http://</span>');
			i.push('<input class="input-large" type="text" value="'+name+'">');

		//子域名
		}else if(id == 1){
			i.push('<span class="add-on">http://</span>');
			i.push('<input class="input-mini" type="text" value="'+name+'">');
			i.push('<span class="add-on">.'+subdomain+'</span>');

		//子目录
		}else if(id == 2){
			i.push('<span class="add-on">http://'+subdomain+'/</span>');
			i.push('<input class="input-mini" type="text" value="'+name+'">');
		}
		return i.join("");
	}

});
