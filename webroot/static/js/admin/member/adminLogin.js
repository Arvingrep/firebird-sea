$(function(){
	
	var defaultBtn = $("#delBtn"),
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
				}else{
					defaultBtn.hide();
				}
			}
			
			//删除
			,del: function(type){
				
				//清空
				if(type == "all"){
					huoniao.operaJson("adminLogin.php?dopost=delAllLogs", "admin="+$("#admin").html(), function(data){
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else{
							huoniao.showTip("error", data.info, "auto");
						}
					});
					$("#selectBtn a:eq(1)").click();
					
				//逐条删除
				}else{
					var checked = $("#list tbody tr.selected");
					if(checked.length < 1){
						huoniao.showTip("warning", "未选中任何信息！", "auto");
					}else{
						huoniao.showTip("loading", "正在操作，请稍候...");
						var id = [];
						for(var i = 0; i < checked.length; i++){
							id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
						}
						
						huoniao.operaJson("adminLogin.php?dopost=delLogs", "id="+id, function(data){
							if(data.state == 100){
								$("#selectBtn a:eq(1)").click();
								getList();
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
								$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
									getList();
								});
							}
						});
						$("#selectBtn a:eq(1)").click();
					}
				}
			}
			
		};
		
	//初始加载
	getList();
	
	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});
		
	//搜索回车提交
    $("#sKeyword").keyup(function (e) {
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
	$("#pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{
			
			$("#cadmin")
				.attr("data-id", "")
				.find("button").html('操作人<span class="caret"></span>');
			
			$("#admin").html("");
			$("#stime, #etime").val("");
			$("#start, #end").html("");
			
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
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");
			
			defaultBtn.hide();
		}
	});
	
	//删除
	$("#delBtn").bind("click", function(){
		init.del();
	});
	
	//清空
	$("#delAll").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del("all");
		});
	});
	
	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		if($("#admin").html() == "") return false;
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
	var sKeyword = $("#sKeyword").html(),
		admin    = $("#admin").html(),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("admin="+admin);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
	
	huoniao.operaJson("adminLogin.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, logsList = val.logsList;
		if(val.state == "100"){
			huoniao.hideTip();
			
			obj.attr("data-totalpage", val.pageInfo.totalPage);
			
			for(i; i < logsList.length; i++){
				list.push('<tr data-id="'+logsList[i].id+'">');
				var check = "";
				if($("#admin").html() != ""){
					check = '<span class="check"></span>';
				}
				list.push('  <td class="row3">'+check+'</td>');
				list.push('  <td class="row17 left">'+logsList[i].admin+'</td>');
				list.push('  <td class="row20 left">'+logsList[i].logintime+'</td>');
				var ipaddr = "";
				if(logsList[i].ipaddr != ""){
					ipaddr = "（"+logsList[i].ipaddr+"）";
				}
				list.push('  <td class="row50 left">'+logsList[i].loginip+ipaddr+'</td>');
				list.push('  <td class="row10 left">'+logsList[i].type+'</td>');
				list.push('</tr>');
			}
			
			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
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