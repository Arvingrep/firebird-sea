$(function(){
	
	var defaultBtn = $("#delBtn, #batchAudit"),
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
				
				if(checkLength > 0){
					defaultBtn.css('display', 'inline-block');
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
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
					
					huoniao.operaJson("tuanList.php?dopost=del", "id="+id, function(data){
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
			//下架
			,offshelf: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("tuanList.php?dopost=offshelf", "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息下架失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}
			,onshelf:function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("tuanList.php?dopost=onshelf", "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息上架失败：</strong><br />" + info.join("<br />") + '</div>', function(){
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
					if(type == "等待审核"){
						arcrank = 0;
					}else if(type == "审核通过"){
						arcrank = 1;
					}else if(type == "审核拒绝"){
						arcrank = 2;
					}else if(type == "商品下架"){
						arcrank = 6;
					}
					
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("tuanList.php?dopost=updateState", "id="+id+"&arcrank="+arcrank, function(data){
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
			
		};
	
	//菜单递归分类
	$("#typeBtn").append(init.selectTypeList("type"));
	
	//地区递归分类
	$("#addrBtn").append(init.selectTypeList("addr"));

    $(".chosen-select").chosen();
	//填充分站列表
	huoniao.choseCity($(".choseCity"),$("#cityid"));
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
	
	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});
	
	//二级菜单点击事件
	$("#addrBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#addrBtn").attr("data-id", id);
		$("#addrBtn button").html(title+'<span class="caret"></span>');
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
			obj.find("button").html(title+'<span class="caret"></span>');
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
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");
			
			defaultBtn.css('display', 'inline-block');
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");
			
			defaultBtn.hide();
			checkedBtn.css('display', 'inline-block');
		}
	});

	//发布信息
	$("#addNew").bind("click", function(){
		var href = $(this).attr("href");
			
		try {
			event.preventDefault();
			parent.addPage("tuanAddphp", "tuan", "新增团购", "tuan/"+href);
		} catch(e) {}
	});
	
	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");
			
		try {
			event.preventDefault();
			parent.addPage("edittuan"+id, "tuan", title, "tuan/"+href);
		} catch(e) {}
	});
	
	//退款
	$("#list").delegate(".refund", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("tuanList.php?dopost=refund", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() { 
						getList();
					}, 800);
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
			$("#selectBtn a:eq(1)").click();
		}
	});
	
	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('确定后将会删除所有订单和评论。<br />如果此商品下有未消费的团购券或订单请先进行退款操作，以免产生用户投诉。', function(){
			init.del();
		});
	});
	
	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('确定后将会删除所有订单和评论。<br />如果此商品下有未消费的团购券或订单请先进行退款操作，以免产生用户投诉。', function(){
			init.del();
		});
	});

	//单条下架
	$("#list").delegate(".offshelf","click",function (){
		$.dialog.confirm('确定要下架吗？', function(){
			init.offshelf();
		});
	});

	//单条上架
	$("#list").delegate(".onshelf","click",function (){
		$.dialog.confirm('确定要上架吗？', function(){
			init.onshelf();
		});
	});
	
	//批量操作
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).data('id'));
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
	
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
        cityid   = $("#cityid").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sType="+sType);
    	data.push("cityid="+cityid);
		data.push("state="+state);
		data.push("property="+property);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
	
	huoniao.operaJson("tuanList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, tuanList = val.tuanList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);
		$(".finish").html(val.pageInfo.finish);
		$(".fail").html(val.pageInfo.fail);
		$(".refund").html(val.pageInfo.refund);
		$(".offshelf").html(val.pageInfo.offshelf);
			
		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < tuanList.length; i++){
				list.push('<tr data-id="'+tuanList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var img = '<img src="'+cfg_attachment+tuanList[i].litpic+'&type=small" class="litpic" />';
				list.push('  <td class="row30 left">'+img+'<span><a href="'+tuanList[i].url+'" target="_blank">'+tuanList[i].title+'</a></span><br><small>【'+tuanList[i].addrname+'】</small></td>');
				list.push('  <td class="row12 left"><a href="javascript:;" data-id="'+tuanList[i].typeid+'" class="type">'+tuanList[i].type+'</a></td>');
				var state = "";
				switch (tuanList[i].state) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">出售中</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse">审核拒绝</span>';
						break;
					case "已下架":
						state = '<span class="offshelf refuse">已下架</span>';
				}
				list.push('  <td class="row10 left">'+state+'&nbsp;&nbsp;<span class="refuse">'+tuanList[i].property+'</span></td>');
				list.push('  <td class="row15 left">'+tuanList[i].startdate+'<br />'+tuanList[i].enddate+'</td>');
				var tuantype = "";
				switch (tuanList[i].tuantype) {
					case "0":
						tuantype = '团购券';
						break;
					case "1":
						tuantype = '充值卡';
						break;
					case "2":
						tuantype = '快递';
						break;
				}
				list.push('  <td class="row7 left">'+tuantype+'</td>');
				list.push('  <td class="row13">'+tuanList[i].totalbuy+"/"+tuanList[i].maxnum+'</td>');
				
				var tui = "";
				if(tuanList[i].property == "失败" && tuanList[i].buynum > 0){
					tui = '<a href="javascript:;" data-id="'+tuanList[i].id+'" title="退还款项" class="refund">退款</a>';
				}
				if(tuanList[i].state == '审核通过'){
					tui += '&nbsp;<a href="javascript:;" title="下架" class="offshelf link" style="color: red; display: inline-block; vertical-align: middle;">立即下架</a>';
				}
				else if(tuanList[i].state == '已下架'){
					tui += '&nbsp;<a href="javascript:;" title="上架" class="onshelf link" style="display: inline-block; vertical-align: middle;">立即上架</a>';
				}
				list.push('  <td class="row10"><a data-id="'+tuanList[i].id+'" data-title="'+tuanList[i].title+'" href="tuanAdd.php?dopost=edit&id='+tuanList[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a>'+tui+'</td>');

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