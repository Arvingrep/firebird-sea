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
		,selectTypeList: function(){
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="">全部类型</a></li>');

			var l=typeListArr.length;
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
				})(typeListArr[i]);
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

		//快速编辑
		,quickEdit: function(){

		}

		//添加、删除属性
		,propertyForm: function(type, title){

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

				huoniao.operaJson("articleJson.php?action=delSelfmedia", "id="+id, function(data){
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
						$.dialog.alert("<div class='errInfo'><strong>以下自媒体删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
							getList();
						});
					}
				});
				$("#selectBtn a:eq(1)").click();
			}
		}

		//更新信息状态
		,updateState: function(type, what){
			huoniao.showTip("loading", "正在操作，请稍候...");
			$("#smartMenu_state").remove();

			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				var arcrank = "";
				var what = what == "update" || type.indexOf('资料更新') == 0 ? 'update' : "join";


				if(type == "待审核" || type == "入驻待审核" || type == "资料更新待审核"){
					arcrank = 0;
				}else if(type == "已审核" || type == "入驻已审核" || type == "资料更新审核通过"){
					arcrank = 1;
				}else if(type == "拒绝审核" || type == "入驻拒绝审核" || type == "资料更新审核拒绝"){
					arcrank = 2;
				}

				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}
				huoniao.operaJson("articleJson.php?action=updateSelfmediaState&dopost="+action, "id="+id+"&type="+what+"&arcrank="+arcrank, function(data){
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

	};

$(function(){

    //填充分站列表
    // huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
	huoniao.choseCity($(".choseCity"),$("#cityid"));
    $(".chosen-select").chosen();

    //菜单递归分类
	$("#typeBtn").append(init.selectTypeList());

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



	//发布信息
	$("#addNew").bind("click", function(){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage(action+"Add", "article", "添加自媒体", "article/"+href);
		} catch(e) {}
	});
	//管理领域
	$("#manageField").bind("click", function(){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("selfmediaField", "article", "自媒体领域", "article/"+href);
		} catch(e) {}
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
		$.dialog.confirm('您确定要将选中的信息删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
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

		var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state", type = t.hasClass('update') ? 'update' : '';
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
			init.updateState($(this).text(), type);
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
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		aType    = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityid").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("property="+property);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("aType="+aType);

	huoniao.operaJson("articleJson.php?action=selfmediaList&dopost="+action, data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, selfmediaList = val.selfmediaList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalGray_join").html(val.pageInfo.totalGray_join);
		$(".totalAudit_join").html(val.pageInfo.totalAudit_join);
		$(".totalRefuse_join").html(val.pageInfo.totalRefuse_join);
		$(".totalGray_update").html(val.pageInfo.totalGray_update);
		$(".totalRefuse_update").html(val.pageInfo.totalRefuse_update);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < selfmediaList.length; i++){
				list.push('<tr data-id="'+selfmediaList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var url = selfmediaList[i].state == 1 ? selfmediaList[i].url : 'javascript:;';
				list.push('  <td class="row17 left"><a href="'+url+'" target="_blank" class="m"><img src="'+selfmediaList[i].ac_photo+'" class="photo" style="width: 50px;" />【'+selfmediaList[i].type+'】<br>&nbsp;'+selfmediaList[i].ac_name+'</a></td>');

				list.push('  <td class="row10"><a href="javascript:;" class="userinfo" data-id="'+selfmediaList[i].admin+'">'+selfmediaList[i].adminame+'</a></td>');
				list.push('<td class="row10">'+selfmediaList[i].cityname+'</td>');
				var state = "";
				switch (selfmediaList[i].state) {
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
				var editstate = "暂无";
				switch (selfmediaList[i].editstate) {
					case "0":
						editstate = '<span class="gray">待审核</span>';
						break;
					default :
						editstate = '暂无';
				}
				list.push('  <td class="row15 state">'+state+'<span class="more"><s></s></span></td>');

				if(selfmediaList[i].state == "0" || editstate == "暂无"){
					list.push('  <td class="row15 state"><span class="gray">-</span></td>');
				}else{
					list.push('  <td class="row15 state">'+editstate+'<span class="more update"><s></s></span></td>');
				}
				list.push('  <td class="row15">'+selfmediaList[i].pubdate+'</td>');
				list.push('  <td class="row15">');
				list.push('<a data-id="'+selfmediaList[i].id+'" data-title="'+selfmediaList[i].ac_name+'" href="selfmediaAdd.php?dopost=edit&id='+selfmediaList[i].id+'" title="修改" class="edit">修改</a>');
				if(selfmediaList[i].typeid == 3 || selfmediaList[i].typeid == 4){
					list.push('<a data-id="'+selfmediaList[i].id+'" data-title="'+selfmediaList[i].ac_name+'" href="selfmediaArticleType.php?id='+selfmediaList[i].id+'" title="栏目" class="item">栏目</a>');
				}
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

	//维护栏目
	$("#list").delegate(".item", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editMediaArticleType"+id, "article", title+"-栏目", "article/"+href);
		} catch(e) {}
	});

};
