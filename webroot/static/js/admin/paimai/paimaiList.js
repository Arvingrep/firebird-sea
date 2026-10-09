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
					
					huoniao.operaJson("paimaiList.php?dopost=del", "id="+id, function(data){
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
			//结束
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

					huoniao.operaJson("paimaiList.php?dopost=offshelf", "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息结束失败：</strong><br />" + info.join("<br />") + '</div>', function(){
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

					huoniao.operaJson("paimaiList.php?dopost=onshelf", "id="+id, function(data){
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
					}else if(type == "结束拍卖"){
						arcrank = 3;
					}else if(type == "交易成功"){
						arcrank = 4;
					}else if(type == "交易失败"){
						arcrank = 5;
					}
					
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("paimaiList.php?dopost=updateState", "id="+id+"&arcrank="+arcrank, function(data){
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

	//批量删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('确定后将会删除相关拍卖信息。<br />如果此商品有未退款操作，请先进行退款操作，以免产生用户投诉。', function(){
			init.del();
		});
	});
	
	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('确定后将会删除相关拍卖信息。<br />如果此商品有未退款操作，请先进行退款操作，以免产生用户投诉。', function(){
			init.del();
		});
	});

	//单条结束
	$("#list").delegate(".offshelf","click",function (){
		$.dialog.confirm('确定要结束吗？<br>1.开始退还保证金.<br>2.通知中拍者及时付款.<br>3.结束拍卖后，无法再恢复.', function(){
			init.offshelf();
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
	
	huoniao.operaJson("paimaiList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, paimaiList = val.paimaiList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);
		$(".totalOffShelf").html(val.pageInfo.totalOffShelf);
		$(".totalSuccess").html(val.pageInfo.totalSuccess);
		$(".totalFail").html(val.pageInfo.totalFail);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < paimaiList.length; i++){
				list.push('<tr data-id="'+paimaiList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var img = '<img src="'+cfg_attachment+paimaiList[i].litpic+'&type=small" class="litpic" />';
				list.push('  <td class="row30 left">'+img+'<span><a href="'+paimaiList[i].url+'" target="_blank">'+paimaiList[i].title+'</a></span><br><small>【'+paimaiList[i].addrname+'】</small></td>');
				list.push('  <td class="row12 left"><a href="javascript:;" data-id="'+paimaiList[i].typeid+'" class="type">'+paimaiList[i].type+'</a></td>');
				var state = "";
				switch (paimaiList[i].state) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">拍卖中</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse">审核拒绝</span>';
						break;
					case "拍卖结束":
						state = '<span class="refuse">拍卖结束</span>';
						break;
					case "交易成功":
						state = '<span class="text-success">交易成功</span>';
						break;
					case "交易失败":
						state = '<span class="refuse">交易失败</span>';
						break;
				}
				if(paimaiList[i].state==="审核通过"){
					list.push('  <td class="row10 left">'+state+'&nbsp;&nbsp;<span class="refuse">'+paimaiList[i].property+'</span></td>');
				}else if(paimaiList[i].state==="拍卖结束"){
					let ss=  "未中拍";
					if(paimaiList[i].sale_num>0){
						ss = "中拍"+paimaiList[i].sale_num+", 待交易";
					}
					list.push('  <td class="row10 left">'+state+'&nbsp;&nbsp;<span class="text-info">'+ss+'</span></td>');
				}else if(paimaiList[i].state==="交易成功"){
					let ss=  "中拍"+paimaiList[i].sale_num+", 交易"+paimaiList[i].buy_num;
					list.push('  <td class="row10 left">'+state+'&nbsp;&nbsp;<span class="text-info">'+ss+'</span></td>');
				}else if(paimaiList[i].state==="交易失败"){
					let ss=  "未中拍";
					if(paimaiList[i].sale_num>0){
						ss = "中拍"+paimaiList[i].sale_num+", 交易"+paimaiList[i].buy_num;
					}
					list.push('  <td class="row10 left">'+state+'&nbsp;&nbsp;<span class="text-info">'+ss+'</span></td>');
				}else{
					list.push('  <td class="row10 left">'+state+'</span></td>');
				}
				list.push('  <td class="row10 left">'+paimaiList[i].startdate+'<br />'+paimaiList[i].enddate+'</td>');
				list.push('  <td class="row12 left">'+paimaiList[i].amount + ' / '+ paimaiList[i].start_money+' / '+paimaiList[i].add_money+' / '+paimaiList[i].min_money+'元'+'</td>');
				list.push('  <td class="row13">'+paimaiList[i].pai_count+"/"+paimaiList[i].pai_max+'</td>');
				
				var tui = "";
				if(paimaiList[i].state == '审核通过'){
					tui += '&nbsp;<a href="javascript:;" title="立刻结束" class="offshelf link" style="color: red; display: inline-block; vertical-align: middle;">立即结束</a>';
				}
				list.push('  <td class="row10"><a href="javascript:;" title="删除" class="del">删除</a>'+tui+'</td>');

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