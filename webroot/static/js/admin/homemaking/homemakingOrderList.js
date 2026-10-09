$(function(){
	
	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn"),
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
					
					huoniao.operaJson("homemakingOrderList.php?dopost=del", "id="+id, function(data){
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
			
		};

    //填充分站列表
     huoniao.choseCity($(".choseCity"),$("#cityList"));
	 
    $(".chosen-select").chosen();

	//初始加载
	getList();
	
	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});
	
	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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
	
	$("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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
			
			$("#addrBtn")
				.attr("data-id", "")
				.find("button").html('全部地区<span class="caret"></span>');
			
			$("#sAddr").html("");
		
			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
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
			parent.addPage("edithomemakingorder"+id, "homemaking", title, "homemaking/"+href);
		} catch(e) {}
	});
	
	//付款
	$("#list").delegate(".payment", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，您确定要付款吗？', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("homemakingOrderList.php?dopost=payment", "id="+id, function(data){
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
			});
		}
	});
	
	//退款
	$("#list").delegate(".refund", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，您确定要退款吗？', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("homemakingOrderList.php?dopost=refund", "id="+id, function(data){
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
			});
		}
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
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("homemakingOrderList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, homemakingOrderList = val.homemakingOrderList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalPrice").html(val.totalPrice);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state6").html(val.pageInfo.state6);
		$(".state7").html(val.pageInfo.state7);
		$(".state8").html(val.pageInfo.state8);
		$(".state9").html(val.pageInfo.state9);
		$(".state10").html(val.pageInfo.state10);
		$(".state11").html(val.pageInfo.state11);
			
		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < homemakingOrderList.length; i++){
				list.push('<tr data-id="'+homemakingOrderList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var ordertext = '<small style="display: inline-block;"><span class="audit">（家政订单）</span></small>';
				if(homemakingOrderList[i].onlinepay == 1){
					ordertext = '<small style="display: inline-block;"><span class="audit">（线上收费）</span></small>';
				}
				list.push('  <td class="row15 left">'+homemakingOrderList[i].ordernum+ordertext+'</td>');
				list.push('  <td class="row10 left"><a href="javascript:;" data-id="'+homemakingOrderList[i].userid+'" class="userinfo">'+homemakingOrderList[i].username+'</a></td>');
				list.push('  <td class="row20 left"><a href="'+homemakingOrderList[i].prourl+'" target="_blank" data-id="'+homemakingOrderList[i].proid+'" class="product">'+homemakingOrderList[i].proname+'</a></td>');
				list.push('  <td class="row8 left">&yen;'+homemakingOrderList[i].orderprice+'</td>');
				list.push('  <td class="row15 left">'+homemakingOrderList[i].orderdate+'</td>');
				list.push('  <td class="row10 left">'+homemakingOrderList[i].paytype+'</td>');
				var state = "&nbsp;";
				switch (homemakingOrderList[i].orderstate) {
					case "0":
						state = '<span class="gray">未付款</span>';
						break;
					case "1":
						if(homemakingOrderList[i].onlinepay == 1){
							state = '已付款';
						}else{
							state = '已付款，待确认';
						}
						break;
					case "2":
						state = '待服务';
						break;
					case "3":
						state = '<span class="refuse">服务无效</span>';
						break;
					case "4":
						state = '已确认，待服务';
						break;
					case "5":
						state = '已服务，待客户验收';
						break;
					case "6":
						state = '<span class="audit">服务完成</span>';
						break;
					case "7":
						state = '<span class="refuse">已取消</span>';
						break;
					case "8":
						state = '<span class="refuse">退款中</span>';
						break;
					case "9":
						state = '<span class="audit">退款成功</span>';
						break;
				}
				list.push('  <td class="row9 left">'+state+'</td>');
				var btn = "";
				if(homemakingOrderList[i].orderstate == "0"){
					btn = '<a href="javascript:;" data-id="'+homemakingOrderList[i].id+'" class="payment" title="付款">付款</a>';
				}
				if(homemakingOrderList[i].homemakingtype!=0 && homemakingOrderList[i].onlinepay==0){
					if(homemakingOrderList[i].orderstate == "1" || homemakingOrderList[i].orderstate == "2" || homemakingOrderList[i].orderstate == "4"  || homemakingOrderList[i].orderstate == "5" || homemakingOrderList[i].orderstate == "8"){
						btn = '<a href="javascript:;" data-id="'+homemakingOrderList[i].id+'" class="refund" title="退款">退款</a>';
					}
				}
				list.push('  <td class="row10 left"><a data-id="'+homemakingOrderList[i].id+'" data-title="'+homemakingOrderList[i].ordernum+'" href="homemakingOrderEdit.php?dopost=edit&id='+homemakingOrderList[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a>'+btn+'</td>');
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