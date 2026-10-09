$(function(){

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn, #pendBtn"),
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

					huoniao.operaJson("memberLoginLog.php?dopost=del", "id="+id, function(data){
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

			//更新信息状态
			,updateState: function(type){
				huoniao.showTip("loading", "正在操作，请稍候...");
				$("#smartMenu_state").remove();

				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var arcrank = "";
					if(type == "待审核"){
						arcrank = 0;
					}else if(type == "正常"){
						arcrank = 1;
					}else if(type == "审核拒绝"){
						arcrank = 2;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("memberLoginLog.php?action=updateState", "id="+id+"&arcrank="+arcrank, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

		};

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#mtype").html($("#ctype").attr("data-id"));
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
	$("#ctype").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#ctype").attr("data-id", id);
		$("#ctype button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pendBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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

	//新增会员
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");
		try {
			event.preventDefault();
			parent.addPage("memberAdd", "member", "添加新会员", "member/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("memberLoginLogEdit"+id, "member", title, "member/"+href);
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

	//拖选功能
	/*$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
			$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});*/

	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

		var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
		if($("#"+obj).html() != undefined){
			$("#"+obj).remove();
		}

		t.parent().parent().removeClass("selected").addClass("selected");

		var htmlCreateStateMenu = function(){
			var htmlMenu = [];
			htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
			htmlMenu.push('  <div class="smart_menu_body">');
			htmlMenu.push('    <ul class="smart_menu_ul">');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">正常</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">审核拒绝</a></li>');
			htmlMenu.push('    </ul>');
			htmlMenu.push('  </div>');
			htmlMenu.push('</div>');

			return htmlMenu.join("");
		}

		$("body").append(htmlCreateStateMenu());

		$("#"+obj).find("a").bind("click", function(event){
			event.preventDefault();
			init.updateState($(this).text());
		});

		$("#"+obj).css({
			top: top,
			left: left - $("#"+obj).width()/2
		}).show();

		return false;
	});

	$(document).click(function (e) {
		var s = e.target;
		if ($("#smartMenu_state").html() != undefined) {
			if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
				if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
					$("#smartMenu_state").remove();
				}
			}
		}
	});

	$("#export").click(function(e){
	var t = $(this), 
		sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		mtype    = $("#mtype").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : ""

	
	var url = '?do=export&sKeyword='+sKeyword+'&start='+start+'&end='+end+'&state='+state+'&mtype = '+mtype;
	console.log(url);

	t.attr('href', url);

	})

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
		mtype    = $("#mtype").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pend    = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("mtype="+mtype);
		data.push("state="+state);
		data.push("pend="+pend);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("memberLoginLog.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, memberLoginLog = val.memberLoginLog;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < memberLoginLog.length; i++){
				list.push('<tr data-id="'+memberLoginLog[i].id+'">');
				list.push('  <td class="row8 left">&nbsp;'+memberLoginLog[i].userid+'</td>');
				list.push('  <td class="row12 left"><a href="javascript:;" class="userinfo" data-id="'+memberLoginLog[i].userid+'">'+memberLoginLog[i].nickname+'</a></td>');
				list.push('  <td class="row15 left">'+memberLoginLog[i].logintime+'</td>');
				list.push('  <td class="row15 left">'+memberLoginLog[i].loginip+'</td>');
				list.push('  <td class="row20 left">'+memberLoginLog[i].ipaddr+'</td>');
				list.push('  <td class="row20 left">'+memberLoginLog[i].platform+'</td>');

                var copy = '<a href="javascript:;" title="'+memberLoginLog[i].useragent+'" class="copy btn_copy'+memberLoginLog[i].id+'" data-clipboard-target="#link_txt'+memberLoginLog[i].id+'" data-clipboard-action="copy" id="copy'+memberLoginLog[i].id+'" data-id="'+memberLoginLog[i].id+'" data-title="'+memberLoginLog[i].useragent+'" data-type="'+memberLoginLog[i].class+'">复制设备信息</a>';

                copy += '<textarea style="font-size: 0; display: inline-block; opacity: 0; width: 0; height: 0; padding: 0; margin: 0;" id="link_txt'+memberLoginLog[i].id+'">用户ID：'+memberLoginLog[i].userid+'\r\n用户信息：'+memberLoginLog[i].nickname+'\r\n登录时间：'+memberLoginLog[i].logintime+'\r\登录IP：'+memberLoginLog[i].loginip+'\r\IP归属地：'+memberLoginLog[i].ipaddr+'\r\登录方式：'+memberLoginLog[i].platform+'\r\n设备信息：'+memberLoginLog[i].useragent+'</textarea>';

				list.push('  <td class="row10 left">'+copy+'</td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();

            $("#list .copy").each(function(){
				var t = $(this), id = t.data("id"), type = t.data("type"), tit = t.data("title");

				var clipboardShare = new ClipboardJS('.btn_copy'+id);
				clipboardShare.on('success', function(e) {
					huoniao.showTip("success", "复制成功", "auto");
				});

				clipboardShare.on('error', function(e) {
					huoniao.showTip("error", "复制失败", "auto");
				});
			});

			huoniao.showPageInfo();
		}else{
			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
