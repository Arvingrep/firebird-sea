var defaultBtn = $("#delBtn, #fullyDelBtn, #addProperty, #delProperty, #moveBtn, #batchAudit"),
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
		,selectTypeList: function(dataArr, def){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="">'+(def ? def : '全部分类')+'</a></li>');

			var l=dataArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">['+jsonArray["id"]+']'+jsonArray["typename"]+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">['+jsonArray[k]["id"]+']'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(dataArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
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

		//浏览
		,showDetail: function(){
			var href = $("#list tbody tr.selected").find("td:eq(1) a").attr("href");
			window.open(href);
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

				huoniao.operaJson("?dopost="+type, "id="+id, function(data){
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
		//更新信息状态
		,updateState: function(type){
			huoniao.showTip("loading", "正在操作，请稍候...");

			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				var arcrank = "";
				if(type == "待审核"){
					arcrank = 0;
				}else if(type == "已审核"){
					arcrank = 1;
				}else if(type == "拒绝审核"){
					arcrank = 2;
				}

				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}
				huoniao.operaJson("?dopost=updateState", "id="+id+"&state="+arcrank, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						var title = '';
						if(typeof data.info == 'string'){
							title = data.info;
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
							title = '<strong>以下信息修改失败：</strong><br />' + info.join("<br />");
						}
						$.dialog.alert("<div class='errInfo'>" + title + "</div>", function(){
							getList();
						});
					}
				});
				$("#selectBtn a:eq(1)").click();
			}
		}

		//右键菜单
		,smartMenu: function(){
			//右键菜单功能
			var objShow = {
				text: "浏览",
				func: function() {
					init.showDetail();
				}
			},objEdit = {
				text: "快速编辑",
				func: function() {
					init.quickEdit();
				}
			}, objAddProperty = {
				text: "添加属性",
				func: function() {
					init.propertyForm("add", "添加属性");
				}
			}, objDelProperty = {
				text: "删除属性",
				func: function() {
					init.propertyForm("del", "删除属性");
				}
			}, objDel = {
				text: "删除",
				func: function() {
					init.del("del");
				}
			}, objMove = {
				text: "移动",
				func: function() {
					init.move();
				}
			}, objAudit = {
				text: "审核",
				func: function() {
					init.updateState("已审核");
				}
			};
		}

	};

$(function(){

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
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



	//新增分类
	$("#addType").bind("click", function(){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage(action+"zhuantiAdd"+pid, "article", "添加专题分类:"+pid, "article/"+href);
		} catch(e) {}
	});


	//二级菜单点击事件
	$("#typeBtn").delegate("a", "click", function(){
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

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("edit"+action+id, "article", title, "article/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('您确定要删除选中信息吗？', function(){
			init.del("del");
		});
	});


	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('您确定要删除此信息吗？', function(){
			init.del("del");
		});
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
			$.smartMenu.remove();
			$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});

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

	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

		$.smartMenu.remove();

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
		mType    = $("#mType").html(),
		sType    = $("#sType").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		aType    = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("state="+state);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList&pid="+pid, data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, zhuantiList = val.zhuantiList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < zhuantiList.length; i++){
				list.push('<tr data-id="'+zhuantiList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var img = "";
				if(zhuantiList[i].litpic){
					img = '<img src="'+cfg_attachment+zhuantiList[i].litpic+'&type=small" class="litpic" />';
				}

				list.push('  <td class="row50 left">'+img+'<span><a href="'+zhuantiList[i].url+'" target="_blank">'+zhuantiList[i].typename+'</a></span></td>');
				var state = "";
				switch (zhuantiList[i].state) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">已审核</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}

				list.push('  <td class="row15 state">'+state+'<span class="more"><s></s></span>'+'</td>');
				list.push('  <td class="row20">'+zhuantiList[i].date+'</td>');

				list.push('  <td class="row15">');
				list.push('<a href="articleAdd.php?action=article&zhuanti_par='+pid+'&zhuanti='+zhuantiList[i].id+'" title="发布信息" class="put" data-id="'+pid+'_'+zhuantiList[i].id+'">发布</a>');
				list.push('<a data-id="'+zhuantiList[i].id+'" data-title="'+zhuantiList[i].typename+'" href="zhuantiAdd.php?dopost=Edit&id='+zhuantiList[i].id+'" title="修改" class="edit">修改</a>')
				list.push('<a href="javascript:;" title="删除" class="del">删除</a></td>');
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

	//维护专题子分类
	$("#list").delegate(".item", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editZhuantiType"+id, "article", title+"的子分类", "article/"+href);
		} catch(e) {}
	});

	//发布信息
	$("#list").delegate(".put", "click", function(event){
		var href = $(this).attr("href"), id = $(this).attr("data-id");

		try {
			event.preventDefault();
			parent.addPage(action+"Add_"+id, "article", "添加专题"+(action == "article" ? "新闻" : "图片"), "article/"+href);
		} catch(e) {}
	});
};
