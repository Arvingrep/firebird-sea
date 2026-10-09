$(function(){
	
	var defaultBtn = $("#approve, #refusal"),
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
			
			//操作
			,operaJson: function(type){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					
					huoniao.operaJson("tuanInvite.php?dopost="+type, "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}
			
		};

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
	
	//订单详情
	$("#list").delegate(".order", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).text(),
			href = $(this).attr("href");
			
		try {
			event.preventDefault();
			parent.addPage("edittuanorder"+id, "tuan", title, "tuan/"+href);
		} catch(e) {}
	});
	
	//批准
	$("#approve").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要操作吗？', function(){
			init.operaJson("approve");
		});
	});
	
	//批准
	$("#refusal").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要操作吗？', function(){
			init.operaJson("refusal");
		});
	});
	
	//单条批准
	$("#list").delegate(".approve", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要操作吗？', function(){
			init.operaJson("approve");
		});
	});
	
	//单条拒绝
	$("#list").delegate(".refusal", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要操作吗？', function(){
			init.operaJson("refusal");
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
		}else if(event.target.className.indexOf("approve") > -1 || event.target.className.indexOf("refusal") > -1) {
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
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("tuanInvite.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, tuanOrderList = val.tuanOrderList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".pending").html(val.pageInfo.pending);
		$(".approved").html(val.pageInfo.approved);
		$(".rejected").html(val.pageInfo.rejected);
			
		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < tuanOrderList.length; i++){
				list.push('<tr data-id="'+tuanOrderList[i].userid+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var user = '<a href="javascript:;" data-id="'+tuanOrderList[i].userid+'" class="member">'+tuanOrderList[i].username+'</a>';
				if(tuanOrderList[i].userid == 0){
					user = tuanOrderList[i].username;
				}
				list.push('  <td class="row12 left">'+user+'</td>');
				var user = '<a href="javascript:;" data-id="'+tuanOrderList[i].recuserid+'" class="member">'+tuanOrderList[i].recusername+'</a>';
				if(tuanOrderList[i].recuserid == 0){
					user = tuanOrderList[i].recusername;
				}
				list.push('  <td class="row12 left">'+user+'</td>');
				list.push('  <td class="row13 left"><a href="tuanOrderEdit.php?dopost=edit&id='+tuanOrderList[i].orderid+'" data-id="'+tuanOrderList[i].orderid+'" class="order">'+tuanOrderList[i].ordernum+'</a></td>');
				list.push('  <td class="row15 left">'+tuanOrderList[i].orderdate+'</td>');
				list.push('  <td class="row10 left">&yen;'+tuanOrderList[i].orderprice+'</td>');
				var state = "";
				switch (tuanOrderList[i].recfan){
					case "0":
						state = "等待审核";
						break;
					case "1":
						state = "已批准";
						break;
					case "2":
						state = "已拒绝";
						break;
					
				}
				list.push('  <td class="row10 left">'+state+'</td>');
				list.push('  <td class="row15 left">'+tuanOrderList[i].rectime+'</td>');
				var btn = "";
				if(tuanOrderList[i].recfan == 0){
					btn = '<a href="javascript:;" title="批准" class="approve">批准</a>&nbsp;&nbsp;<a href="javascript:;" title="拒绝" class="refusal">拒绝</a>';
				}
				list.push('  <td class="row10 left">'+btn+'</td>');
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