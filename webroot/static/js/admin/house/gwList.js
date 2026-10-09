$(function(){
	
	var defaultBtn = $("#delBtn, #batchAudit"),
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
					defaultBtn.css('display', 'inline-block');
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
					checkedBtn.css('display', 'inline-block');
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
					
					huoniao.operaJson("?dopost=del", "id="+id, function(data){
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

    $(".chosen-select").chosen();

    //初始加载
	getList();
	
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
	
	$("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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
			
			//$("#sAddr").html("");
		
			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "addrBtn"){
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
	
	//添加
	$("#addNew").bind("click", function(event){
		var href = $(this).attr("href");
			
		try {
			event.preventDefault();
			parent.addPage("gwListAdd"+loupanid, "house", '新增' + loupaname + '顾问', "house/"+href);
		} catch(e) {}
	});
	
	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");
			
		try {
			event.preventDefault();
			parent.addPage("gwListEdit"+id, "house", title, "house/"+href);
		} catch(e) {}
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
	var pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		
	var data = [];
		data.push("loupanid="+loupanid);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
	
	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, gwList = val.gwList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
			
		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			
			for(i; i < gwList.length; i++){
				list.push('<tr data-id="'+gwList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row20 left"><img src="'+(gwList[i].photo ? gwList[i].photo : gwList[i].mphoto)+'" style="width: 50px; height: 50px;" onerror="this.src=\'/static/images/noPhoto_100.jpg\'" class="litpic" />'+gwList[i].name+'</td>');
				list.push('  <td class="row15 left"><a href="javascript:;" data-id="'+gwList[i].userid+'" class="userinfo">'+gwList[i].nickname+'</a></td>');
				list.push('  <td class="row15 left">'+(gwList[i].phone ? gwList[i].phone : gwList[i].mphone)+'</td>');
				list.push('  <td class="row10 left">'+gwList[i].post+'</td>');
				list.push('  <td class="row10 left">'+gwList[i].dknum+'/'+gwList[i].cjnum+'</td>');
				list.push('  <td class="row15 left">'+gwList[i].pubdate+'</td>');
				list.push('  <td class="row12"><a data-id="'+gwList[i].id+'" data-title="'+gwList[i].nickname+' 顾问" href="loupanGw.php?dopost=edit&action=edit&loupanid='+loupanid+'&id='+gwList[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a></td>');
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