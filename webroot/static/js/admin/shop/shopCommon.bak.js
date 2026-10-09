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

			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("shopCommon.php?dopost=getDetail", "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
							huoniao.hideTip();
							//huoniao.showTip("success", "获取成功！", "auto");
							$.dialog({
								fixed: true,
								title: '快速编辑',
								content: $("#quickEdit").html(),
								width: 870,
								ok: function(){
									//提交
									var serialize = self.parent.$(".quick-editForm").serialize();

									//图集
									var imglist = [], imgli = self.parent.$("#listSection li");
									if(imgli.length > 0){
										for(var i = 0; i < imgli.length; i++){
											var imgsrc = self.parent.$("#listSection li:eq("+i+")").find(".li-thumb img").attr("data-val");
											imglist.push(imgsrc);
										}
									}
									serialize = serialize+"&pics="+imglist.join(",");

									huoniao.operaJson("shopCommon.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
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

							//填充信息
							self.parent.$("#tuanTitle").html('<a href="'+data.prourl+'" target="_blank">'+data.protitle+'</a>');
							self.parent.$("#commonUser").html(data.username);
							self.parent.$("#commonContent").val(data.content);
							self.parent.$("#commonTime").val(huoniao.transTimes(data.dtime, 1));
							self.parent.$("#commonIp").val(data.ip);
							self.parent.$("#commonGood").val(data.good);
							self.parent.$("#commonBad").val(data.bad);
							self.parent.$("#rating").val(data.rating);
							self.parent.$("#score1").val(data.score1);
							self.parent.$("#score2").val(data.score2);
							self.parent.$("#score3").val(data.score3);

							if(data.pics != ""){
								var picsObj = self.parent.$("#pics");
								var imglist = data.pics;
								var picList = [];
								for(var i = 0; i < imglist.length; i++){
									picList.push('<li class="clearfix" style="cursor: default;">');
									picList.push('  <a class="li-rm" href="javascript:;">×</a>');
									picList.push('  <div class="li-thumb" style="display:block;">');
									picList.push('    <span class="ibtn">');
									picList.push('      <a href="'+cfg_attachment+imglist[i].val+'&type=large" target="_blank" class="enlarge" title="放大"></a>');
									picList.push('    </span>');
									picList.push('    <span class="ibg"></span>');
									picList.push('    <img data-val="'+imglist[i].val+'" src="'+cfg_attachment+imglist[i].val+'" style="cursor: default;" />');
									picList.push('  </div>');
									picList.push('</li>');
								}
								self.parent.$("#listSection").html(picList.join(""));
								self.parent.$("#deleteAllAtlas").show();
								picsObj.show();

								self.parent.$("#listSection").delegate(".li-rm", "click", function(){
									if(confirm("确定要删除吗？")){
										$(this).closest("li").remove();
									}
								});
							}

							self.parent.$("#commonIsCheck").find("option").each(function(){
								if($(this).val() == data.ischeck){
									$(this).attr("selected", true);
								}
							});

						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
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

					huoniao.operaJson("shopCommon.php?dopost=delCommon", "id="+id, function(data){
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
					}else if(type == "已审核"){
						arcrank = 1;
					}else if(type == "拒绝审核"){
						arcrank = 2;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("shopCommon.php?dopost=updateState", "id="+id+"&arcrank="+arcrank, function(data){
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

    //填充分站列表
    huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    $(".chosen-select").chosen();

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sType").html($("#typeBtn").attr("data-id"));
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
		init.del("del");
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		init.del("del");
	});

	//审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
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
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">已审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">拒绝审核</a></li>');
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

	//点击IP查找此IP的所有评论
	$("#list").delegate(".ip", "click", function(){
		var txt = $(this).text();
		$("#keyword").val(txt);
		$("#typeBtn").attr("data-id", 3);
		$("#typeBtn").find("button").html('评论IP<span class="caret"></span>');
		$("#searchBtn").click();
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType = $("#sType").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("shopCommon.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, commonList = val.commonList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			huoniao.hideTip();
			//huoniao.showTip("success", "获取成功！", "auto");

			for(i; i < commonList.length; i++){
				list.push('<tr data-id="'+commonList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row35 title left">商品：<a href="'+commonList[i].prourl+'" target="_blank">'+commonList[i].protitle+'</a><br />内容：'+commonList[i].commonContent+'</td>');

				var user = '<a href="javascript:;" data-id="'+commonList[i].commonUserId+'" class="userinfo">'+commonList[i].commonUserName+'</a>';
				if(commonList[i].commonUserId == 0){
					user = commonList[i].commonUserName;
				}

				list.push('  <td class="row12 left">'+user+'</td>');
				list.push('  <td class="row17 left"><a href="javascript:;" data-id="'+commonList[i].commonIp+'" class="ip">'+commonList[i].commonIp+'</a>（'+commonList[i].commonIpAddr+'）</td>');
				list.push('  <td class="row13 left">'+commonList[i].commonTime+'</td>');
				var state = "";
				switch (commonList[i].commonIsCheck) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">已审核</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}
				list.push('  <td class="row9 state">'+state+'<span class="more"><s></s></span></td>');
				list.push('  <td class="row10"><a href="javascript:;" data-id='+commonList[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" data-id='+commonList[i].id+'" title="删除" class="del">删除</a></td>');
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
