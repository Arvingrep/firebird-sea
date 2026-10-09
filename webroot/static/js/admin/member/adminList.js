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

					huoniao.operaJson("adminList.php?dopost=del", "id="+id, function(data){
						huoniao.hideTip();
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else if(data.state == 101){
							$.dialog.alert(data.info);
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

		};

	$(".chosen-select").chosen();
	
	//填充城市列表
	huoniao.choseCity($(".choseCity"),$("#cityadmin"));
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
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
		}
	});

	//登录记录
	$("#list").delegate(".records", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("adminLogin"+id, "member", title+"登录记录", "member/"+href);
		} catch(e) {}
	});
	$("#list").delegate(".commissionCount", "click", function(event){
		var id = $(this).attr("data-id"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("commissionCount", "member", "佣金统计", "member/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("adminListEdit"+id, "member", title, "member/"+href);
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
		admin    = $("#cadmin").val() ? $("#cadmin").val() : '',
		city     = $("#cityadmin").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("admin="+admin);
		data.push("city="+city);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("adminList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, adminList = val.adminList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".normal").html(val.pageInfo.normal);
		$(".lock").html(val.pageInfo.lock);
		if(val.state == "100"){
			huoniao.hideTip();
			console.log(adminList);
			for(i; i < adminList.length; i++){
				var yue ='';
				if(adminList[i].mtype==3){
				var yue =   '<br /><small><a href="commissionCount.php?cityid='+adminList[i].mgroupid+'" title="佣金统计" class="link commissionCount"><code>余额：'+adminList[i].ctmoney+'</code></a></small>'; 
				}
				list.push('<tr data-id="'+adminList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row20 left">'+adminList[i].username+(adminList[i].discount ? '<br /><code>'+adminList[i].discount+'</code>' : '')+'</td>');
				list.push('  <td class="row20 left">'+adminList[i].nickname+'<br /><small>'+adminList[i].phone+'</small></td>');
				list.push('  <td class="row15 left">'+adminList[i].groupname+yue+'</td>');
				list.push('  <td class="row15 left">'+adminList[i].regtime+'<br /><small>'+adminList[i].expired+'</small></td>');
				var state = "";
				switch(adminList[i].state){
					case "0":
						state = "正常";
						break;
					case "1":
						state = "<span class='refuse'>锁定</span>";
						break;
				}
                if(adminList[i].isExpired){
                    state = "<span class='refuse'>已过期</span>";
                }
				list.push('  <td class="row12">'+state+'</td>');
                list.push('  <td class="row15"><a href="adminLogin.php?id='+adminList[i].id+'" title="查看登录记录" data-id="'+adminList[i].id+'" class="records" data-title="'+adminList[i].username+'">登录记录</a><a href="adminListAdd.php?dopost=edit&id='+adminList[i].id+'" data-id="'+adminList[i].id+'" class="edit" data-title="'+adminList[i].username+'" title="修改管理员信息">修改</a><a href="javascript:;" class="del" title="删除管理员">删除</a></td>');
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
