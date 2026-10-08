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
					defaultBtn.css('display', 'inline-block');
				}else{
					defaultBtn.hide();
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

					huoniao.operaJson("siteSubway.php?dopost=del", "id="+id, function(data){
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


	//初始加载
	getList();

	//搜索回车提交
  $("#tit").keyup(function (e) {
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
      $("#save").click();
    }
  });

	//保存配置
	$('#save').bind('click', function(){
		var state = $('input[name=state]:checked').val(),
				title = $.trim($('#tit').val());
		if(state == '' || state == undefined || state == null){
			$.dialog.alert('请选择状态');
			return false;
		}
		if(title == ''){
			$.dialog.alert('请输入文案');
			return false;
		}

		huoniao.operaJson("siteConfig.php?action=subway", "&subway_state="+state+"&subway_title="+title+"&token="+token, function(data){
			huoniao.showTip("success", "保存成功", "auto");
		});


	});


	//新增信息
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("siteSubwayAdd", "siteConfig", "新增地铁线路", "siteConfig/"+href);
		} catch(e) {}
	});

	//二级菜单点击事件
	$("#pBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#pBtn").attr("data-id", id);
		$("#pBtn button").html(title+'<span class="caret"></span>');
		if(id != 0 || id != ""){
			huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
				if(data){
					var li = [];
					for(var i = 0; i < data.length; i++){
						li.push('<li><a href="javascript:;" data-id="'+data[i].id+'">'+data[i].typename+'</a></li>')
					}
					$("#cBtn ul").html('<li><a href="javascript:;" data-id="">--城市--</a></li>'+li.join(""));
					$("#cBtn").attr('data-id', 0);
					$("#cBtn button").html('--城市--<span class="caret"></span>');
					$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>');
					$("#xBtn").attr('data-id', 0);
					$("#xBtn button").html('--区县--<span class="caret"></span>');
				}else{
					$("#cBtn ul").html('<li><a href="javascript:;" data-id="">--城市--</a></li>');
					$("#cBtn").attr('data-id', 0);
					$("#cBtn button").html('--城市--<span class="caret"></span>');
					$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>');
					$("#xBtn").attr('data-id', 0);
					$("#xBtn button").html('--区县--<span class="caret"></span>');
				}
				getList();
			});
		}else{
			$("#cBtn ul").html('<li><a href="javascript:;" data-id="">--城市--</a></li>');
			$("#cBtn").attr('data-id', 0);
			$("#cBtn button").html('--城市--<span class="caret"></span>');
			$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>');
			$("#xBtn").attr('data-id', 0);
			$("#xBtn button").html('--区县--<span class="caret"></span>');
			getList();
		}
	});

	$("#cBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#cBtn").attr("data-id", id);
		$("#cBtn button").html(title+'<span class="caret"></span>');
		if(id != 0 || id != ""){
			huoniao.operaJson("siteSubway.php?dopost=getCity", "id="+id, function(data){
				if(data){
					var li = [];
					for(var i = 0; i < data.length; i++){
						li.push('<li><a href="javascript:;" data-id="'+data[i].id+'">'+data[i].typename+'</a></li>')
					}
					$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>'+li.join(""));
					$("#xBtn").attr('data-id', 0);
					$("#xBtn button").html('--城市--<span class="caret"></span>');
				}else{
					$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>');
					$("#xBtn").attr('data-id', 0);
					$("#xBtn button").html('--区县--<span class="caret"></span>');
				}
				getList();
			});
		}else{
			$("#xBtn ul").html('<li><a href="javascript:;" data-id="">--区县--</a></li>');
			$("#xBtn").attr('data-id', 0);
			$("#xBtn button").html('--区县--<span class="caret"></span>');
			getList();
		}
	});

	$("#xBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#xBtn").attr("data-id", id);
		$("#xBtn button").html(title+'<span class="caret"></span>');
		getList();
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
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
		}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("siteSubwayEdit"+id, "siteConfig", title, "siteConfig/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('确定要删除吗？', function(){
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
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("del") > -1) {
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
	var pid    = $("#pBtn").attr("data-id") ? $("#pBtn").attr("data-id") : "",
		cid    = $("#cBtn").attr("data-id") ? $("#cBtn").attr("data-id") : "",
		xid    = $("#xBtn").attr("data-id") ? $("#xBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("pid="+pid);
		data.push("cid="+cid);
		data.push("xid="+xid);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("siteSubway.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, siteSubway = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < siteSubway.length; i++){
				list.push('<tr data-id="'+siteSubway[i].cid+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row25 left">'+siteSubway[i].area+'</a></td>');
				list.push('  <td class="row60 left">'+siteSubway[i].title+'</td>');
				list.push('  <td class="row12 left"><a data-id="'+siteSubway[i].id+'" data-title="'+siteSubway[i].area+'地铁配置" href="siteSubway.php?dopost=edit&sid='+siteSubway[i].id+'&id='+siteSubway[i].cid+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a>');
				list.push('</td>');
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
