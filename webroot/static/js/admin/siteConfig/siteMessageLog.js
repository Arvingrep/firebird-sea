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
			
			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");
					
					huoniao.operaJson("siteMessageLog.php?dopost=getDetail&action="+action, "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
							huoniao.hideTip();
							$.dialog({
								fixed: true,
								title: '内容明细',
								content: $("#quickEdit").html(),
								width: 600,
								ok: function(){
									getList();
								}
							});
							
							//填充信息
							self.parent.$("#user").html(data.user);
							self.parent.$("#time").html(data.pubdate);
							self.parent.$("#ip").html(data.ip);
							
							if(data.state == 0){
								self.parent.$("#state").html("成功");
							}else{
								self.parent.$("#state").html("<font color='#ff0000'>失败</font>&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:;' data-id="+id+" class='replay' data-action='"+action+"'>重新发送</a><small style='margin-left: 15px;color: #999;'>注意：使用模板ID发送的短信不可以重新发送！</small>" + (data.reason ? '<br />失败原因：' + data.reason : ''));
							}
							self.parent.$("#title").html(data.title);
							self.parent.$("#content").html(data.body);

							//重新发送
							self.parent.$(".replay").live("click", function(){
								var t = $(this), id = t.attr("data-id"), action = t.attr("data-action");
								if(id != "" && t.html() == "重新发送"){
									replaySend(t, action, id);
									
								}
							});
							
						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}
				
			}
			
			//删除
			,del: function(type){
				if(type == "del"){
					var checked = $("#list tbody tr.selected");
					if(checked.length < 1){
						huoniao.showTip("warning", "未选中任何信息！", "auto");
					}else{
						huoniao.showTip("loading", "正在操作，请稍候...");
						var id = [];
						for(var i = 0; i < checked.length; i++){
							id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
						}
						
						huoniao.operaJson("siteMessageLog.php?dopost=del&action="+action, "id="+id, function(data){
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
											info.push("▪ "+tr.find(".row12").text());
										}
									}
								}
								$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
									getList();
								});
							}
						});
					}
				}else{
					huoniao.operaJson("siteMessageLog.php?dopost=delAll&action="+action, "", function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function() { 
								getList();
							}, 800);
						}else{
							$.dialog.alert(data.info);
						}
					});
				}
			}
			
		};
	
	//初始加载
	getList();
	
	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sState").html($("#stateBtn").attr("data-id"));
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
	
	//搜索分类菜单点击事件
	$("#stateBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#stateBtn").attr("data-id", id);
		$("#stateBtn button").html(title+'<span class="caret"></span>');
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
	
	//详情、修改
	$("#list").delegate(".edit", "click", function(){
		init.quickEdit();
	});
	
	//删除
	$("#delBtn").bind("click", function(){
		init.del("del");
	});
	
	//单条删除
	$("#list").delegate(".del", "click", function(){
		init.del("del");
	});
	
	//清空
	$("#delAll").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del("delAll");
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

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sState = $("#sState").html(),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sState="+sState);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
	
	huoniao.operaJson("siteMessageLog.php?dopost=getList&action="+action, data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, messageList = val.messageList;
		if(val.state == "100"){
			huoniao.hideTip();
			//huoniao.showTip("success", "获取成功！", "auto");
			
			obj.attr("data-totalpage", val.pageInfo.totalPage);
			
			for(i; i < messageList.length; i++){
				list.push('<tr data-id="'+messageList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row15 left">'+messageList[i].user+'</td>');
				list.push('  <td class="row35 left">'+messageList[i].title+'</td>');
				list.push('  <td class="row10">'+messageList[i].by+'</td>');
				list.push('  <td class="row15">'+messageList[i].date+'</td>');
				var state = "";
				switch (messageList[i].state) {
					case "0":
						state = '成功';
						break;
					case "1":
						state = '<span class="refuse">失败</span>';
						break;
				}
				list.push('  <td class="row12">'+state+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" data-id='+messageList[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" data-id='+messageList[i].id+'" title="删除" class="del">删除</a></td>');
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


//重新发送
function replaySend(t, action, id){
	t.html("发送中...");
	
	huoniao.operaJson("siteMessageLog.php?dopost=replay&action="+action, "id="+id, function(data){
		if(data.state == 100){
			t.parent().html("成功");
		}else{
			$.dialog.alert(data.info);
			t.html("重新发送");
		}
	});
}