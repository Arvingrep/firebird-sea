$(function(){
	
	var defaultBtn = $("#reg, #cangelreg"),
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
					
					huoniao.operaJson("homemakingQuanList.php?dopost="+type, "id="+id, function(data){
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
										info.push("▪ "+tr.find("td:eq(1)").text());
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
			parent.addPage("edithomemakingorder"+id, "homemaking", title, "homemaking/"+href);
		} catch(e) {}
	});
	
	//消费登记
	$("#reg").bind("click", function(){
		$.dialog.confirm('您确定要操作吗？', function(){
			init.operaJson("reg");
		});
	});
	
	//取消登记
	$("#cangelreg").bind("click", function(){
		$.dialog.confirm('您确定要操作吗？', function(){
			init.operaJson("cangelreg");
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

	huoniao.operaJson("homemakingQuanList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, homemakingQuanList = val.homemakingQuanList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".effective").html(val.pageInfo.effective);
		$(".expired").html(val.pageInfo.expired);
		$(".spend").html(val.pageInfo.spend);
			
		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < homemakingQuanList.length; i++){
				list.push('<tr data-id="'+homemakingQuanList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row10 left">'+homemakingQuanList[i].cardnum+'</td>');
				list.push('  <td class="row12 left"><a href="homemakingOrderEdit.php?dopost=edit&id='+homemakingQuanList[i].orderid+'" data-id="'+homemakingQuanList[i].orderid+'" class="order">'+homemakingQuanList[i].ordernum+'</a></td>');
				list.push('  <td class="row20 left"><a href="'+homemakingQuanList[i].prourl+'" target="_blank" data-id="'+homemakingQuanList[i].proid+'">'+homemakingQuanList[i].proname+'</a></td>');
				list.push('  <td class="row13 left">'+homemakingQuanList[i].orderdate+'</td>');
				list.push('  <td class="row10 left">&yen;'+homemakingQuanList[i].orderprice+'</td>');
				list.push('  <td class="row12 left">'+homemakingQuanList[i].expireddate+'</td>');
				var state = "";
				if(homemakingQuanList[i].state == 0){
					state = "<span class='audit'>可使用</span>";
				}else if(homemakingQuanList[i].state == 1){
					state = "<span class='gray'>已过期</span>";
				}else if(homemakingQuanList[i].state == 2){
					state = "<span class='refuse'>已消费&nbsp;消费于："+homemakingQuanList[i].usedate+"</span>";
				}
				list.push('  <td class="row20 left">'+state+'</td>');
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