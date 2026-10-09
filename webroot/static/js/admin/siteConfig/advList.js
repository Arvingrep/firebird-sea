$(function(){

	var defaultBtn = $("#delBtn"),
        checkedBtn = $("#addNew, #importDefaultData, #deleteRepeat"),
		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}

				if(checkLength > 0){
					defaultBtn.show();
                    checkedBtn.hide();
				}else{
					defaultBtn.hide();
                    checkedBtn.show();
				}
			}

			//菜单递归分类
			,selectTypeList: function(){
				var typeList = [], title = "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = typeListArr;
				for(var i = 0; i < l.length; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
						if(jArray.length > 0){
							cl = ' class="dropdown-submenu"';
						}
						typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
						if(jArray.length > 0){
							typeList.push('<ul class="dropdown-menu">');
						}
						for(var k = 0; k < jArray.length; k++){
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
							}
						}
						if(jArray.length > 0){
							typeList.push('</ul></li>');
						}else{
							typeList.push('</li>');
						}
					})(l[i]);
				}

				typeList.push('</ul>');
				return typeList.join("");
			}

			//删除
			,del: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("advList.php?dopost=del&action="+action+"&type="+atype, "id="+id, function(data){
						if(data.state == 100){
							//huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							getList();
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find("td:eq(1) a").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//更新信息状态
			,updateState: function(t){
				huoniao.showTip("loading", "正在操作，请稍候...");

				var id = t.attr("data-id"), pid = t.closest("tr").attr("data-id");

				var arcrank = id == 1 ? 0 : 1, title = id == 1 ? "隐藏" : "显示", cla = id == 1 ? "gray" : "audit";

				huoniao.operaJson("advList.php?dopost=updateState&action="+action, "id="+pid+"&state="+arcrank, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						t.attr("data-id", arcrank).text(title).removeClass().addClass(cla);
					}else{
						huoniao.showTip("error", "修改失败，请重试！");
					}
				});
				$("#selectBtn a:eq(1)").click();
			}

		};

	//菜单递归分类
	if(atype && typeListArr){
		var list = [];
		list.push('<ul class="dropdown-menu">');
		for (var i = 0; i < typeListArr.length; i++) {
			list.push('<li><a href="javascript:;" data-id="'+typeListArr[i]["directory"]+'">'+typeListArr[i]["tplname"]+'</a></li>');
		};
		list.push('</ul>');
		$("#typeBtn").append(list.join(""));
	}else{
		$("#typeBtn").append(init.selectTypeList());
	}

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sType").html($("#typeBtn").attr("data-id"));
		$("#list").attr("data-atpage", 1);
		getList();
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

	//广告分类管理
	$("#typeManage").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), type = action == "pic" ? "article" : action;

		try {
			event.preventDefault();
			parent.addPage("advType"+action+atype, type, "广告分类管理", "siteConfig/"+href);
		} catch(e) {}
	});

	//新增广告
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), type = action == "pic" ? "article" : action;
		try {
			event.preventDefault();
			parent.addPage("addNewAdv"+action+atype, type, "新增广告", "siteConfig/"+href);
		} catch(e) {}
	});

	//一键删除重复广告
    var selectDelType;
	$("#deleteRepeat").bind("click", function(){

        //系统广告提供两个删除选项：1. 删除系统所有模块中的重复广告，2. 只删除当前列表中的重复广告
        if(action == 'siteConfig'){

            selectDelType = $.dialog({
                title: '请选择：',
                width: '550px',
                height: '250px',
                content: '<div style="text-align: center;"><button class="btn btn-large btn-primary" id="deleteRepeatList" type="button">只删除当前列表中重复的广告</button><br /><br /><br /><button class="btn btn-large btn-danger" id="deleteRepeatAll" type="button">删除系统所有模块重复的广告</button></div><br /><br />'
            });

            self.parent.$('#deleteRepeatList').bind('click', function(){
                selectDelType.close();
                $.dialog.confirm('确认删除当前列表中重复的广告吗？<br />说明：该操作不可恢复，确认后将删除ID值小的重复广告！', function(){
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    huoniao.operaJson("?dopost=deleteRepeat&action=" + action, "", function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }
                    });
                });
            });

            self.parent.$('#deleteRepeatAll').bind('click', function(){
                selectDelType.close();
                $.dialog.confirm('确认删除系统所有模块重复的广告吗？<br />说明：该操作不可恢复，确认后将删除ID值小的重复广告！', function(){
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    huoniao.operaJson("?dopost=deleteRepeat", "", function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }
                    });
                });
            });

        }
        else{
            $.dialog.confirm('确认删除重复的广告吗？<br />说明：该操作不可恢复，确认后将删除ID值小的重复广告！', function(){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("?dopost=deleteRepeat&action=" + action, "", function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            location.reload();
                        }, 800);
                    }
                });
            });
        }
	});

	//一键导入默认广告
    var selectDelType;
	$("#importDefaultData").bind("click", function(){

        //系统广告提供两个删除选项：1. 删除系统所有模块中的重复广告，2. 只删除当前列表中的重复广告
        if(action == 'siteConfig'){

            selectDelType = $.dialog({
                title: '请选择：',
                width: '550px',
                height: '250px',
                content: '<div style="text-align: center;"><button class="btn btn-large btn-primary" id="importDefaultDataList" type="button">导入系统首页和公共区域广告</button><br /><br /><br /><button class="btn btn-large btn-danger" id="importDefaultDataAll" type="button">导入系统所有模块的默认广告</button></div><br /><br />'
            });

            self.parent.$('#importDefaultDataList').bind('click', function(){
                selectDelType.close();
                $.dialog.confirm('确认导入系统首页和公共区域的默认广告吗？<br />说明：此操作不会删除现有广告，导入后可能会出现重复广告，可以通过【删除重复广告功能】清理旧广告。', function(){
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    huoniao.operaJson("?dopost=importDefaultData&action=" + action, "", function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }
                    });
                });
            });

            self.parent.$('#importDefaultDataAll').bind('click', function(){
                selectDelType.close();
                $.dialog.confirm('确认导入系统所有模块的默认广告吗？<br />说明：此操作不会删除现有广告，导入后可能会出现重复广告，可以通过【删除重复广告功能】清理旧广告。', function(){
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    huoniao.operaJson("?dopost=importDefaultData", "", function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                location.reload();
                            }, 800);
                        }
                    });
                });
            });

        }
        else{
            $.dialog.confirm('确认要导入默认广告吗？<br />说明：此操作不会删除现有广告，导入后可能会出现重复广告，可以通过【删除重复广告功能】清理旧广告。', function(){
                huoniao.showTip("loading", "正在操作，请稍候...");
                huoniao.operaJson("?dopost=importDefaultData&action=" + action, "", function(data){
                    if(data.state == 100){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            location.reload();
                        }, 800);
                    }
                });
            });
        }
	});

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	$("#pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{

			$("#typeBtn")
				.attr("data-id", "")
				.find("button").html('全部分类<span class="caret"></span>');

			$("#sType").html("");

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			defaultBtn.show();
            checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
            checkedBtn.show();
		}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editAdv"+action+id, action, title, "siteConfig/"+href);
		} catch(e) {}
	});

	//分站城市
	$("#list").delegate(".cityAd", "click", function(event){
		var id = $(this).closest('tr').attr("data-id"), title = $(this).closest('tr').attr("data-title");

		try {
			event.preventDefault();
			parent.addPage("cityAdv"+action+id, action, title, "siteConfig/advCityList.php?aid="+id+"&action="+action);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if(event.target.className.indexOf("check") > -1) {
			if(isCheck.hasClass("selected")){
				isCheck.removeClass("selected");
			}else{
				isCheck.addClass("selected");
			}
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
			$("#list tr").removeClass("selected");
			isCheck.addClass("selected");
		}else{
			if(checkLength > 1){
				$("#list tr").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list tr").removeClass("selected");
					isCheck.addClass("selected");
				}
			}
		}

		init.funTrStyle();
	});

	//拖选功能
	// $("#list tbody").selectable({
	// 	distance: 3,
	// 	cancel: '.check, a',
	// 	start: function(){
	// 		//$("#smartMenu_state").remove();
	// 	},
	// 	stop: function() {
	// 		init.funTrStyle();
	// 	}
	// });

	//分类链接点击
	$("#list").delegate(".type", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();

		$("#typeBtn")
			.attr("data-id", id)
			.find("button").html(txt+'<span class="caret"></span>');

		$("#sType").html(id);

		$("#list").attr("data-atpage", 1);
		getList();

		$("#selectBtn a:eq(1)").click();
	});

	$("#list").delegate(".state a", "click", function(){
		var t = $(this);
		init.updateState(t);
	});

	//广告预览
	$("#list").delegate(".preview-ad", "click", function(){
		var id = $(this).closest("tr").attr("data-id"), cla = $(this).closest("tr").attr("data-class");
		var width = height = "auto";

		if(cla == "对联广告"){
			width = "1480px";
			height = "600px";
		}else if(cla == "多图广告"){
			height = '500px';
		}else if(cla == "拉伸广告"){
			width = '1215px';
			height = '600px';
		}

		$.dialog({
			fixed: true,
			title: '广告预览',
			width: width,
			height: height,
			content: 'url:siteConfig/advList.php?dopost=preview&action='+action+'&id='+id
		});

	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("advList.php?dopost=getList&action="+action+"&type="+atype, data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, adList = val.adList;
		if(val.state == "100"){
			huoniao.hideTip();

			obj.attr("data-totalpage", val.pageInfo.totalPage);

			for(i; i < adList.length; i++){

				var title = action == "tuan" ? adList[i].title.split("：")[1] : adList[i].title;
				list.push('<tr data-id="'+adList[i].id+'" data-class="'+adList[i].class+'" data-title="'+adList[i].title+'">');
				list.push('  <td class="row3">'+(userType != 3 ? '<span class="check"></span>' : '')+'</td>');
				var id = '';
				//if(action != 'tuan'){
					id = '【'+adList[i].id+'】：';
				//}
				list.push('  <td class="row30 left"><a href="javascript:;" class="preview-ad" title="预览"><i class="icon-eye-open"></i></a>'+id+adList[i].title+'</td>');
				list.push('  <td class="'+(userType != 3 ? 'row10' : 'row14')+'"><a href="javascript:;" data-id="'+adList[i].typeid+'" class="type">'+adList[i].type+'</a></td>');
				list.push('  <td class="'+(userType != 3 ? 'row10' : 'row14')+'">'+adList[i].class+'</td>');
				list.push('  <td class="'+(userType != 3 ? 'row13' : 'row14')+'">'+adList[i].start+'<br />'+adList[i].end+'</td>');
				list.push('  <td class="'+(userType != 3 ? 'row13' : 'row25')+'"><a href="javascript:;" class="audit cityAd">分站广告</a></td>');

				if(userType != 3){
					var state = "";
					switch (adList[i].state) {
						case "0":
							state = '<a href="javascript:;" class="gray" data-id="0">隐藏</a>';
							break;
						case "1":
							state = '<a href="javascript:;" class="audit" data-id="1">显示</a>';
							break;
					}
					list.push('  <td class="row9 state">'+state+'</td>');
					var copy = "";
					//if(action != 'tuan'){
						copy = '<a href="javascript:;" title="复制广告位" class="copy btn_copy'+adList[i].id+'" data-clipboard-target="#link_txt'+adList[i].id+'" data-clipboard-action="copy" id="copy'+adList[i].id+'" data-id="'+adList[i].id+'" data-title="'+title+'" data-type="'+adList[i].class+'">复制广告位</a>';
					//}

					copy += '<textarea style="font-size: 0; display: inline-block; opacity: 0; width: 0; height: 0; padding: 0; margin: 0;" id="link_txt'+adList[i].id+'">动态普通调用：{#myad id="'+adList[i].id+'"#}\r\n\r\n异步普通调用：<script src="/include/json.php?action=adjs&id='+adList[i].id+'" language="javascript"></script>\r\n\r\n\r\n将以上任意一种代码格式粘贴到模板相应的广告位置即可！</textarea>';

					list.push('  <td class="row12">'+copy+'<a data-id="'+adList[i].id+'" data-title="'+adList[i].title+'" href="advAdd.php?dopost=edit&action='+action+'&id='+adList[i].id+'&type='+atype+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a></td>');
				}

				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();

			$("#list .copy").each(function(){
				var t = $(this), id = t.data("id"), type = t.data("type"), tit = t.data("title");

				var clipboardShare = new ClipboardJS('.btn_copy'+id);
				clipboardShare.on('success', function(e) {
					huoniao.showTip("success", "复制成功", "auto");
				});

				clipboardShare.on('error', function(e) {
					huoniao.showTip("error", "复制失败", "auto");
				});
			});

			huoniao.showPageInfo();
		}else{
			obj.attr("data-totalpage", "1");

			huoniao.showPageInfo();

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
