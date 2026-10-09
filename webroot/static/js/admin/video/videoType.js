$(function(){
	var treeLevel = 1;
	var init = {

		//拼接分类
		printTypeTree: function(){
			var typeList = [], l=typeListArr.length, cl = -45, level = 0, addType = '';
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<li class="li'+level+'">');
					if(level < treeLevel){
						addType = '<a href="javascript:;" class="add-type" data-level="'+level+'">添加下级分类</a>';
					}else{
						addType = '';
					}

					typeList.push('<div class="tr clearfix tr_'+jsonArray["id"]+'">');
					if(jsonArray["parentid"] == 0){
						typeList.push('  <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
						typeList.push('  <div class="row50 left"><em>['+jsonArray["id"]+']</em><input type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["typename"]+'">'+addType+'</div>');
					}else{
						typeList.push('  <div class="row3"></div>');
						typeList.push('  <div class="row50 left"><span class="plus-icon" style="margin-left:'+cl+'px;"></span><em>['+jsonArray["id"]+']</em><input type="text" data-id="'+jsonArray["id"]+'" value="'+jsonArray["typename"]+'">'+addType+'</div>');
					}
					typeList.push('  <div class="row15"><a href="javascript:;" class="ad">广告</a></div>');
					typeList.push('  <div class="row15"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
					typeList.push('  <div class="row17 left"><a href="javascript:;" class="edit">编辑</a><a href=javascript:;" class="del">删除</a></div>');
					typeList.push('</div>');


					if(jArray.length > 0){
						typeList.push('<ul class="subnav ul'+level+'">');
					}
					for(var k = 0; k < jArray.length; k++){

						cl = cl + 45, level = level + 1;

						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}
					}
					if(jsonArray["parentid"] == 0){
						cl = -45, level = 0;
					}else{
						cl = cl - 45, level = level - 1;
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(typeListArr[i]);
			}
			$(".root").html(typeList.join(""));
			init.dragsort();
		}

		//树形递归分类
		,treeTypeList: function(id, parentid, rank){
			var l=typeListArr.length, typeList = [], cl = "", level = 0;
			typeList.push('<option value="0">顶级分类</option>');
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					//移动分类限制：下级往上级移，不可上级往下级或同级移
					if(id == jsonArray["id"] || rank == level){
						cl = cl.replace("&nbsp;&nbsp;&nbsp;&nbsp;", ""), level = level - 1;
						return;
					}
					//选中
					if(parentid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '&nbsp;&nbsp;&nbsp;&nbsp;', level = level + 1;
						var selected = "";
						if(parentid == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
					}
					if(jsonArray["lower"] == null){
						cl = "", level = 0;
					}else{
						cl = cl.replace("&nbsp;&nbsp;&nbsp;&nbsp;", ""), level = level - 1;
					}
				})(typeListArr[i]);
			}
			return typeList.join("");
		}

		//树形递归分类
		,treeTypeList_: function(){
			var typeList = [], cl = "";
			var l=typeListArr;
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower;
					typeList.push('<option value="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}

		//快速编辑
		,quickEdit: function(id, rank){
			if(id == ""){
				huoniao.showTip("warning", "请选择要修改的分类！", "auto");
			}else{
				huoniao.showTip("loading", "正在获取信息，请稍候...");

				huoniao.operaJson("videoType.php?dopost=getTypeDetail&action="+action, "id="+id, function(data){
					if(data != null){
						data = data[0];
						huoniao.hideTip();
						//huoniao.showTip("success", "获取成功！", "auto");
						$.dialog({
							fixed: true,
							title: '修改分类',
							content: $("#editForm").html(),
							width: 460,
							ok: function(){
								//提交
								var typename  = self.parent.$("#typename").val(),
									pinyin    = self.parent.$("#pinyin").val(),
									py        = self.parent.$("#py").val(),
									parentid  = self.parent.$("#parentid").val(),
									weight    = self.parent.$("#weight").val(),
									serialize = self.parent.$(".quick-editForm").serialize();


								if($.trim(typename) == ""){
									alert("请输入分类名称");
									return false;
								}else{
									if(!/^.{2,30}$/.test(typename)){
										alert("请正确填写分类名称\n2-30个汉字");
										return false;
									}
								}

								if(typename == ""){
									alert("请选择上级分类");
									return false;
								}

								huoniao.operaJson("videoType.php?dopost=updateType&action="+action, "id="+id+"&"+serialize, function(data){
									if(data.state == 100){
										huoniao.showTip("success", data.info, "auto");
										setTimeout(function() {
											location.reload();
										}, 800);
									}else if(data.state == 101){
										alert(data.info);
										return false;
									}else{
										huoniao.showTip("error", data.info, "auto");
									}
								});

							},
							cancel: true
						});

						//填充信息
						self.parent.$("#typename").val(data.typename);
						self.parent.$("#pinyin").val(data.pinyin);
						self.parent.$("#py").val(data.py);
						self.parent.$("#parentid").html(init.treeTypeList(data.id, data.parentid, rank));
						if(data.parentid != 0){
							self.parent.$("#parentid").parent().parent().show();
						}
						self.parent.$("#seotitle").val(data.seotitle);
						self.parent.$("#keywords").val(data.keywords);
						self.parent.$("#description").val(data.description);

					}else{
						huoniao.showTip("error", "信息获取失败！", "auto");
					}
				});
			}

		}

		//拖动排序
		,dragsort: function(){
			//一级
			$('.root').sortable({
	            items: '>li.li0',
				placeholder: 'placeholder',
	            orientation: 'vertical',
	            axis: 'y',
				handle:'>div.tr',
	            opacity: .5,
	            revert: 0,
				stop:function(){
					//saveOpera(1);
					huoniao.stopDrag();
				}
	        });
			for(var i = 0; i <= treeLevel; i++){
				$('.root .li'+i).sortable({
					items: '.li'+(i+1),
					placeholder: 'placeholder',
					orientation: 'vertical',
					axis: 'y',
					handle:'>div.tr',
					opacity: .5,
					revert: 0,
					stop:function(){
						//saveOpera(1);
						huoniao.stopDrag();
					}
				});
			}
		}
	};

	//拼接现有分类
	if(typeListArr != ""){
		init.printTypeTree();
	};

	//搜索
	$("#searchBtn").bind("click", function(){
		var keyword = $("#keyword").val(), typeList = [], l=typeListArr.length, addType = '';
		if(keyword == "") {
			$("#keyword").focus(); return false;
		}
		$("#list .tr").removeClass("light");
		for(var i = 0; i < l; i++){
			(function(){
				var jsonArray =arguments[0], jArray = jsonArray.lower;
				if(jsonArray["typename"].indexOf(keyword) > -1){
					$(".tr_"+jsonArray["id"]).addClass("light");
				}
				for(var k = 0; k < jArray.length; k++){
					if(jArray[k]['lower'] != null){
						arguments.callee(jArray[k]);
					}
				}

			})(typeListArr[i]);
		}
		//定位第一个
		if($('#list .light').length > 0){
			$(document).scrollTop(Number($('#list .light:first').offset().top));
		}
	});

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

	//头部添加新分类
	$("#addNew_").bind("click", function(){
		var html = [];

		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
		html.push('    <div class="row50 left"><input data-id="0" type="text" value=""><a href="javascript:;" class="add-type" data-level="0">添加下级分类</a></div>');
		html.push('    <div class="row15">&nbsp;</div>');
		html.push('    <div class="row15"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');

		$(".root").prepend(html.join(""));
	});

	//底部添加新分类
	$("#addNew").bind("click", function(){
		var html = [];

		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"><a href="javascript:;" class="fold">折叠</a></div>');
		html.push('    <div class="row50 left"><input data-id="0" type="text" value=""><a href="javascript:;" class="add-type" data-level="0">添加下级分类</a></div>');
		html.push('    <div class="row15">&nbsp;</div>');
		html.push('    <div class="row15"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');

		$(this).parent().parent().prev(".root").append(html.join(""));
	});

	//全部展开
	$("#unfold").bind("click", function(){
		$(".root .li0 .fold").removeClass("unfold");
		$(".root .subnav").show();
	});

	//全部收起
	$("#away").bind("click", function(){
		$(".root .li0 .fold").addClass("unfold");
		$(".root .subnav").hide();
	});

	//添加下级分类
	$(".root").delegate(".add-type", "click", function(){
		var parent = $(this).parent().parent(), level = Number($(this).attr("data-level")), m = $(this).siblings(".plus-icon").css("margin-left"), margin = Number(m == undefined ? -45 : m.replace("px", "")), html = [], addType = '';
		if(level < treeLevel - 1){
			addType = '<a href="javascript:;" class="add-type" data-level="'+Number(level+1)+'">添加下级分类</a>';
		}else{
			addType = '';
		};
		html.push('<li class="li'+Number(level+1)+'">');
		html.push('  <div class="tr clearfix">');
		html.push('    <div class="row3"></div>');
		html.push('    <div class="row50 left"><span class="plus-icon" style="margin-left:'+Number(margin+45)+'px"></span><input data-id="" type="text" value="">'+addType+'</div>');
		html.push('    <div class="row15">&nbsp;</div>');
		html.push('    <div class="row15"><a href="javascript:;" class="up">向上</a><a href="javascript:;" class="down">向下</a></div>');
		html.push('    <div class="row17 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');
		if(parent.next("ul").html() != undefined){
			parent.next("ul").append(html.join(""));
		}else{
			parent.after('<ul class="subnav">'+html.join("")+'</ul>');
		}

		$(this).parent().siblings(".row3").find(".fold").removeClass("unfold");
		parent.next("ul").show();
		//parent.next("ul").find("input:last").focus();
	});

	//折叠、展开
	$(".root").delegate(".fold", "click", function(){
		if($(this).hasClass("unfold")){
			$(this).removeClass("unfold");
			$(this).parent().parent().parent().find("ul").show();
		}else{
			$(this).addClass("unfold");
			$(this).parent().parent().parent().find("ul").hide();
		}
	});

	//表单回车提交
	$("#list").delegate("input", "keyup", function(e){
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            //$("#saveBtn").click();
        }
    });

	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val();
		if(id != "" && id != 0){
			huoniao.operaJson("videoType.php?dopost=updateType&id="+id+"&action="+action, "type=single&typename="+value, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else if(data.state == 101){
					//huoniao.showTip("warning", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}
	});

	//鼠标经过li
	$("#list").delegate(".tr", "mouseover", function(){
		$(this).parent().addClass("hover");
	});
	$("#list").delegate(".tr", "mouseout", function(){
		$(this).parent().removeClass("hover");
	});

	//广告
	$(".root").delegate(".ad", "click", function(){
		var id = $(this).parent().parent().find("input").attr("data-id"), txt = $(this).parent().parent().find("input").val();
		var type = action;
		try {
			event.preventDefault();
			parent.addPage("videoTypeAd"+id, type, "图片"+txt+"广告", "siteConfig/advList.php?action="+type+"&type="+id);
		} catch(e) {}
	});

	//排序向上
	$(".root").delegate(".up", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != 0){
			parent.after(parent.prev("li"));
			// saveOpera(1);
			huoniao.stopDrag();
		}
	});

	//排序向下
	$(".root").delegate(".down", "click", function(){
		var t = $(this), parent = t.parent().parent().parent(), index = parent.index(), length = parent.siblings("li").length;
		if(index != length){
			parent.before(parent.next("li"));
			//saveOpera(1);
			huoniao.stopDrag();
		}
	});

	//修改
	$(".root").delegate(".edit", "click", function(){
		var id = $(this).parent().parent().find("input").attr("data-id"), rank = $(this).parent().parent().find(".add-type").attr("data-level");
		rank = rank == undefined ? treeLevel : rank;
		init.quickEdit(id, rank);
	});

	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();

		// if(t.parent().parent().next("ul").html() != undefined && t.parent().parent().next("ul").html() != ""){
		// 	$.dialog.alert("该分类下含有子级分类，请先删除(或转移)子级内容！");
		// }else{
			//从数据库删除
			if(type.indexOf("编辑") > -1){
				$.dialog.confirm("确定后，此分类下的子级和文章、图片信息也将同时删除！<br />删除后无法恢复，请谨慎操作！！！", function(){
					huoniao.showTip("loading", "正在删除，，请稍候...");
					huoniao.operaJson("videoType.php?dopost=del&action="+action, "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								location.reload();
							}, 800);
						}else{
							alert(data.info);
							return false;
						}
					});
				}, function(){});
				//跳转到对应删除页面
			}else{
				t.parent().parent().parent().remove();
			}
		//}
	});

	//保存
	$("#saveBtn").bind("click", function(){
		saveOpera("");
	});

	//批量删除
	$("#batch").bind("click", function(){
		$.dialog({
			fixed: false,
			title: "批量删除",
			content: '<div class="batch-data"><p class="muted">选择要删除的分类，多个按【ctrl+点击】选择</p><select id="category" multiple>'+init.treeTypeList_()+'</select></div>',
			width: 310,
			ok: function(){
				var ids = [];
				self.parent.$("#category option:selected").each(function(){
					ids.push($(this).val());
				});
				if(ids.length <= 0){
					alert("请选择要删除的分类");
					return false;
				}else{

					$.dialog.confirm("确定后，此分类下的子级和文章、图片信息也将同时删除！<br />删除后无法恢复，请谨慎操作！！！", function(){

						huoniao.showTip("loading", "正在删除，，请稍候...");
						huoniao.operaJson("videoType.php?dopost=del&action="+action, "id="+ids.join(","), function(data){
							if(data.state == 100){

								huoniao.showTip("success", data.info, "auto");
								setTimeout(function() {
									location.reload();
								}, 800);

							}else{
								alert(data.info);
								return false;
							}
						});

					}, function(){});

				}
			},
			cancel: true
		});
	});

	//返回最近访问的位置
	huoniao.scrollTop();

});

//保存
function saveOpera(type){
	var first = $("ul.root>li"), json = '[';
	for(var i = 0; i < first.length; i++){
		(function(){
			var html =arguments[0], count = 0, jArray = $(html).find(">ul>li"), tr = $(html).find(".tr input"), id = tr.attr("data-id"), val = tr.val();

			if(jArray.length > 0 && val != ""){
				json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "lower": [';
				for(var k = 0; k < jArray.length; k++){
					if($(jArray[k]).find(">ul>li").length > 0){
						arguments.callee(jArray[k]);
					}else{
						var tr = $(jArray[k]).find(".tr input"), id = tr.attr("data-id"), val = tr.val();
						if(val != ""){
							json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "lower": null},';
						}else{
							count++;
						}
					}
				}
				json = json.substr(0, json.length-1);
				if(count == jArray.length){
					json = json + 'null},';
				}else{
					json = json + ']},';
				}
			}else{
				if(val != ""){
					json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "lower": null},';
				}
			}
		})(first[i]);
	}
	json = json.substr(0, json.length-1);
	json = json + ']';

	if(json == "]") return false;

	var scrolltop = $(document).scrollTop();
	var href = huoniao.changeURLPar(location.href, "scrolltop", scrolltop);

	huoniao.showTip("loading", "正在保存，请稍候...");
	huoniao.operaJson("videoJson.php?action=typeAjax&dopost="+action, "data="+json, function(data){
		if(data.state == 100){
			huoniao.showTip("success", data.info, "auto");
			if(type == ""){
				//window.scroll(0, 0);
				//setTimeout(function() {
					location.href = href;
				//}, 800);
			}
		}else{
			huoniao.showTip("error", data.info, "auto");
		}
	});
}
