$(function(){

	var defaultBtn = $("#delBtn, #batchAudit, #fullyDelBtn"),
		checkedBtn = $("#stateBtn, #propertyBtn"),
		rDefaultBtn = $("#revertBtn, #fullyDelBtn"),
		checkedBtn = $("#stateBtn, #propertyBtn"),

		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}
				var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

				if(checkLength > 0){
					if(recycle != ""){
						rDefaultBtn.css('display', 'inline-block');
					}else{
						defaultBtn.css('display', 'inline-block');
					}
					checkedBtn.hide();
				}else{
					if(recycle != ""){
						rDefaultBtn.hide();
					}else{
						defaultBtn.hide();
					}
					checkedBtn.css('display', 'inline-block');
				}
			}

			//菜单递归分类
			,selectTypeList: function(type){
				var typeList = [], title = type == "addr" ? "全部地区" : "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = type == "addr" ? addrListArr : typeListArr;
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
			,del: function(type){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("tiebaList.php?action="+type+"&dopost="+action, "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
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

			//还原
			,revert: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("tiebaList.php?action=revert&dopost="+action, "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find(".row2 a").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//更新信息状态
			,updateState: function(type){
				huoniao.showTip("loading", "正在操作，请稍候...");
				$("#smartMenu_state").remove();

				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var state = "";
					if(type == "待审核"){
						state = 0;
					}else if(type == "已审核"){
						state = 1;
					}else if(type == "拒绝审核"){
						state = 2;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("tiebaList.php?dopost=updateState", "id="+id+"&state="+state, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() {
								getList();
							}, 800);
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//树形递归分类
			,treeTypeList: function(){
				var l=typeListArr.length, typeList = [], cl = "";
				typeList.push('<option value="">选择分类</option>');
				for(var i = 0; i < l; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower;
						typeList.push('<option value="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</option>');
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != null){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<option value="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</option>');
							}
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					})(typeListArr[i]);
				}
				return typeList.join("");
			}

			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("tiebaList.php?dopost=getDetail", "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
							huoniao.showTip("success", "获取成功！", "auto");
							$.dialog({
								fixed: true,
								title: '快速编辑',
								content: $("#quickEdit").html(),
								width: 670,
								ok: function(){
									//提交
									var typeid   = self.parent.$("#typeid").val(),
										title    = self.parent.$("#title").val(),
										content   = self.parent.$("#content").val(),
										serialize = self.parent.$(".quick-editForm").serialize();

									if(typeid == ""){
										$.dialog.alert("请选择所属栏目");
										return false;
									}

									if(content == ""){
										$.dialog.alert("请填写帖子内容");
										return false;
									}

									huoniao.operaJson("tiebaList.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
										if(data.state == 100){
											huoniao.showTip("success", data.info, "auto");
											$("#selectBtn a:eq(1)").click();
											setTimeout(function() {
												getList();
											}, 800);
										}else if(data.state == 101){
											$.dialog.alert(data.info);
											return false;
										}else{
											huoniao.showTip("error", data.info, "auto");
											$("#selectBtn a:eq(1)").click();
											setTimeout(function() {
												getList();
											}, 800);
										}
									});

								},
								cancel: true
							});

							//填充信息
							self.parent.$("#typeid").html(init.treeTypeList());
							self.parent.$("#typeid").find("option").each(function(){
								if($(this).val() == data.typeid){
									$(this).attr("selected", true);
								}
							});
							self.parent.$("#title").html(data.title);
							self.parent.$("#click").val(data.click);
							self.parent.$("#weight").val(data.weight);
							self.parent.$("#color").val(data.color);
							self.parent.$("#content").val(data.content);

							if(data.bold == 1){
								self.parent.$(".quick-editForm input[name=bold]").attr("checked", true);
							}

							if(data.isreply == 1){
								self.parent.$(".quick-editForm input[name=isreply]").attr("checked", true);
							}

							if(data.jinghua == 1){
								self.parent.$(".quick-editForm input[name=jinghua]").attr("checked", true);
							}

							if(data.top == 1){
								self.parent.$(".quick-editForm input[name=top]").attr("checked", true);
							}

							if(data.color != ""){
								self.parent.$(".quick-editForm .color_pick em").css({"background": data.color});
							}

							self.parent.$("#state").find("option").each(function(){
								if($(this).val() == data.state){
									$(this).attr("selected", true);
								}
							});

							self.parent.$(".color_pick").colorPicker({
								callback: function(color) {
									var color = color.length === 7 ? color : '';
									self.parent.$("#color").val(color);
									self.parent.$(this).find("em").css({"background": color});
								}
							});


						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}

			}

		};

	//地区递归分类
	$("#typeBtn").append(init.selectTypeList());

   //填充分站列表
   huoniao.choseCity($(".choseCity"),$("#cityList"));  //城市分站选择初始化

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #propertyBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{

			// $("#addrBtn")
			// 	.attr("data-id", "")
			// 	.find("button").html('全部地区<span class="caret"></span>');

			// $("#sAddr").html("");

			//if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			//}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			if(recycle != ""){
				rDefaultBtn.css('display', 'inline-block');
			}else{
				defaultBtn.css('display', 'inline-block');
			}
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			if(recycle != ""){
				rDefaultBtn.hide();
			}else{
				defaultBtn.hide();
			}
			checkedBtn.css('display', 'inline-block');
		}
	});

	//新增信息
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), type = "tieba";
		try {
			event.preventDefault();
			parent.addPage("tiebaListphpdopostAdd", type, "新增贴子", "tieba/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".modify", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("tiebaEdit"+id, "tieba", title, "tieba/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的评论信息。<br />此操作不可恢复，您确定要删除吗？', function(){
			init.del("del");
		});
	});

	//彻底删除
	$("#fullyDelBtn").bind("click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的所有图片和评论，此操作不可恢复，您确定要删除吗？', function(){
			init.del("fullyDel");
		});
	});

//还原
	$("#revertBtn").bind("click", function(){
		init.revert();
	});
	//单条删除
	$("#list").delegate(".delete", "click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的评论信息。<br />此操作不可恢复，您确定要删除吗？', function(){
			init.del('del');
		});
	});

	//单条还原
	$("#list").delegate(".revert", "click", function(){
		init.revert();
	});


	//查看回复
	$("#list").delegate(".reply", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("tiebaReply"+id, "tieba", "查看"+title+"帖子回复", "tieba/"+href);
		} catch(e) {}
	});


	//批量审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
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
	$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
			$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});

	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

		var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
		if($("#"+obj).html() != undefined){
			$("#"+obj).remove();
		}

		t.parent().parent().removeClass("selected").addClass("selected");

		var htmlCreateStateMenu = function(){
			var htmlMenu = [];
			htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
			htmlMenu.push('  <div class="smart_menu_body">');
			htmlMenu.push('    <ul class="smart_menu_ul">');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">已审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">拒绝审核</a></li>');
			htmlMenu.push('    </ul>');
			htmlMenu.push('  </div>');
			htmlMenu.push('</div>');

			return htmlMenu.join("");
		}

		$("body").append(htmlCreateStateMenu());

		$("#"+obj).find("a").bind("click", function(event){
			event.preventDefault();
			init.updateState($(this).text());
		});

		$("#"+obj).css({
			top: top,
			left: left - $("#"+obj).width()/2
		}).show();

		return false;
	});

	$(document).click(function (e) {
		var s = e.target;
		if ($("#smartMenu_state").html() != undefined) {
			if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
				if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
					$("#smartMenu_state").remove();
				}
			}
		}
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
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		aType    = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";


	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("start="+start);
		data.push("end="+end);
		data.push("property="+property);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("aType="+aType);


	huoniao.operaJson("tiebaList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, tiebaList = val.tiebaList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < tiebaList.length; i++){
				list.push('<tr data-id="'+tiebaList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var append = [];
				if(tiebaList[i].top == 1){
					append.push('<span class="label label-inverse">置顶</span>');
				}
				if(tiebaList[i].jinghua == 1){
					append.push('<span class="label label-warning">精华</span>');
				}
				if(tiebaList[i].isreply == 0){
					append.push('<span class="label">不可评论</span>');
				}

				var style = [];
				if(tiebaList[i].bold == 1){
					style.push('font-weight: 700;');
				}
				if(tiebaList[i].color != ""){
					style.push('color: '+tiebaList[i].color+';');
				}

				list.push('  <td class="row20 left"><a href="'+tiebaList[i].url+'" target="_blank" style="'+style.join(" ")+'">'+tiebaList[i].title+'</a>&nbsp;&nbsp;'+append.join(" ")+'</td>');
				list.push('  <td class="row10">'+tiebaList[i].typename+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" class="userinfo" data-id="'+tiebaList[i].uid+'">'+tiebaList[i].username+'</a></td>');
				list.push('  <td class="row15">'+tiebaList[i].pubdate+'<br />'+tiebaList[i].ip+'</td>');
				list.push('  <td class="row9">'+tiebaList[i].click+'/'+tiebaList[i].reply+'</td>');
				var state = "";
				switch (tiebaList[i].state) {
					case "0":
						state = '<span class="gray">待审核</span>';
						break;
					case "1":
						state = '<span class="audit">已审核</span>';
						break;
					case "2":
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}
				list.push('  <td class="row10 state">'+state+'<span class="more"><s></s></span></td>');
				list.push('  <td class="row10">'+(tiebaList[i].reward.count > 0 ? (tiebaList[i].reward.count+'次 共'+tiebaList[i].reward.amount+echoCurrency('short')) : '暂无打赏')+'</td>');
				list.push('  <td class="row13">');

				var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
				if(recycle != ""){
					list.push('<a href="javascript:;" title="还原" class="revert">还原</a>');
				}else{
					list.push('<a data-id="'+tiebaList[i].id+'" data-title="'+tiebaList[i].title+'" href="tiebaList.php?dopost=Edit&id='+tiebaList[i].id+'" title="编辑" class="link modify">编辑</a>&nbsp;|&nbsp;');
					list.push('<a href="javascript:;" title="删除" class="link delete">删除</a>');
				}
				if(tiebaList[i].reply > 0){
					list.push('&nbsp;|&nbsp;<a href="tiebaReply.php?tid='+tiebaList[i].id+'" data-id="'+tiebaList[i].id+'" data-title="'+tiebaList[i].title+'" title="查看回复" class="link reply">查看回复</a>');
				}

				list.push('</td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
