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
					defaultBtn.css('display', 'inline-block');
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
					checkedBtn.css('display', 'inline-block');
				}
			}

			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");

					$.dialog({
						fixed: true,
						title: '处理结果',
						content: $("#quickEdit").html(),
						width: 600,
						ok: function(){
							//提交
							var serialize = self.parent.$(".quick-editForm").serialize();

							huoniao.operaJson("suggestion.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
								if(data.state == 100){
									huoniao.showTip("success", data.info, "auto");
									setTimeout(function() {
										getList();
									}, 800);
								}else if(data.state == 101){
									alert(data.info);
									return false;
								}else{
									huoniao.showTip("error", data.info, "auto");
									//getList();
								}
							});

						},
						cancel: true
					});


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

					huoniao.operaJson("suggestion.php?dopost=delComplain", "id="+id, function(data){
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
										info.push("▪ "+tr.find(".row2 a").text());
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
	//huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
	//$(".chosen-select").chosen();

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

			defaultBtn.css('display', 'inline-block');
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.css('display', 'inline-block');
		}
	});

	//详情、修改
	$("#list").delegate(".edit", "click", function(){
		init.quickEdit();
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm("确认要删除吗？", function(){
			init.del("del");
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm("确认要删除吗？", function(){
			init.del("del");
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
		sType     = $("#typeList").val(),
		adminCity = $("#cityList").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sType="+sType);
		data.push("adminCity="+adminCity);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("suggestion.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, complainList = val.complainList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);

		if(val.state == "100"){
			huoniao.hideTip();
			//huoniao.showTip("success", "获取成功！", "auto");

			for(i; i < complainList.length; i++){
				list.push('<tr data-id="'+complainList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var info = [];
				//info.push('<strong>举报信息：</strong><a href="'+complainList[i].url+'" target="_blank">'+complainList[i].title+'</a>');
				//if(complainList[i].commonid>0){
					//info.push('<strong>举报评论：</strong><a href="'+complainList[i].url+'" target="_blank">'+complainList[i].commoncontent+'</a>');
				//}
				info.push('<strong>留言时间：</strong>'+complainList[i].pubdate);
				info.push('<strong>留言反馈：</strong>' + complainList[i].desc);

				list.push('  <td class="row30 left">'+info.join("<br />")+'</td>');

				var user = '<a href="javascript:;" data-id="'+complainList[i].userid+'" class="userinfo">'+complainList[i].username+'</a>';
				if(complainList[i].userid == -1){
					user = complainList[i].username;
				}

				var info = [];
				info.push('<strong>反馈人：</strong>' + user);
				info.push('<strong>联系方式：</strong>' + complainList[i].phone);
				info.push('<strong>IP地址：</strong>' + complainList[i].ip + '<small style="display: inline-block">（'+complainList[i].ipaddr+'）</small>');

				list.push('  <td class="row15 left">'+info.join("<br />")+'</td>');

				var state = '';
				if(complainList[i].state == "已回复"){
					state = '<span class="audit">' + complainList[i].state + '</span>';
				}else{
					state = '<span class="gray">' + complainList[i].state + '</span>';
				}
				list.push('  <td class="row12">'+state+'</td>');

				var info = [];
				if(complainList[i].state == "已回复"){
					info.push('回复人：' + complainList[i].opname);
					info.push('回复时间：' + complainList[i].optime);
					info.push('回复结果：' + complainList[i].note);
				}
				list.push('  <td class="row30 left">'+info.join("<br />")+'</td>');
				list.push('  <td class="row10">'+(complainList[i].state == "未回复" ? '<a href="javascript:;" data-id='+complainList[i].id+'" title="修改" class="edit">修改</a>' : '')+'<a href="javascript:;" data-id='+complainList[i].id+'" title="删除" class="del">删除</a></td>');
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
