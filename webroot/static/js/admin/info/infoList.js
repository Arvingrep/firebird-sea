var houseTop = 6;
var topPlanData = [];
$(function(){

	var defaultBtn = $("#delBtn, #fullyDelBtn, #refreshBtn, #batchAudit"),
		rDefaultBtn = $("#revertBtn, #fullyDelBtn"),
		checkedBtn = $("#stateBtn, #grayObj,#stateBtnn"),
		recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "",

		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}

				var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

				if(checkLength > 0){
					if(recycle != ""){
						rDefaultBtn.css('display', 'inline-block');
					}else{
						defaultBtn.css('display', 'inline-block');
					}
					checkedBtn.hide();
				}else{
					if(recycle != ""){
						rDefaultBtn.hide();
					}else{
						defaultBtn.hide();
					}
					checkedBtn.css('display', 'inline-block');
				}
			}

			//菜单递归分类
			,selectTypeList: function(type){
				var typeList = [], title = "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = typeListArr;
				for(var i = 0; i < l.length; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
						if(jArray.length > 0){
							cl = ' class="dropdown-submenu"';
						}
						typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">['+jsonArray["id"]+']'+jsonArray["typename"]+'</a>');
						if(jArray.length > 0){
							typeList.push('<ul class="dropdown-menu">');
						}
						for(var k = 0; k < jArray.length; k++){
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">['+jArray[k]["id"]+']'+jArray[k]["typename"]+'</a></li>');
							}
						}
						if(jArray.length > 0){
							typeList.push('</ul></li>');
						}else{
							typeList.push('</li>');
						}
					})(l[i]);
				}

				typeList.push('</ul>');
				return typeList.join("");
			}

			//删除
			,del: function(type){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("infoList.php?doaction="+type+"&dopost=del", "id="+id, function(data){
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

			//还原
			,revert: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("infoList.php?doaction=revert", "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}


			//更新信息状态
			,updateState: function(type, note = ''){
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
					}else if(type == "取消显示"){
						arcrank = 3;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("infoList.php?dopost=updateState", "id="+id+"&arcrank="+arcrank+"&note=" + encodeURIComponent(note), function(data){
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
										info.push("▪ "+tr.find("td:eq(1) a").text());
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

	//菜单递归分类
	$("#typeBtn").append(init.selectTypeList("type"));

	//地区递归分类
	$("#addrBtn").append(init.selectTypeList("addr"));

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

    //填充分站列表
	huoniao.choseCity($(".choseCity"),$("#cityList"));
    // huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    $(".chosen-select").chosen();

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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
		}else if (e.which) {
			code = e.which;
		}
		if (code === 13) {
			$("#searchBtn").click();
		}
	});

	//一键删除待审核
	$("#delAllGray").bind("click", function(){
		var t = $(this);
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			t.attr("disabled", true).html("删除中...");

			huoniao.operaJson("infoList.php?dopost=delAllGray", "", function(data){
				huoniao.showTip("success", "操作成功！", "auto");
				t.attr("disabled", false).html("一键删除待审核");
				setTimeout(function() {
					getList();
				}, 800);
			});
		});
	});

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

	//待审核
	$("#grayObj").bind("click", function(){
		$("#stateBtn").attr("data-id", 0);
		$("#stateBtn button").html($(this).html()+'<span class="caret"></span>');
		$("#list").attr("data-atpage", 1);
		getList();
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

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	$("#stateBtnn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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

			if(recycle != ""){
				rDefaultBtn.css('display', 'inline-block');
			}else{
				defaultBtn.css('display', 'inline-block');
			}
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			if(recycle != ""){
				rDefaultBtn.hide();
			}else{
				defaultBtn.hide();
			}
			checkedBtn.css('display', 'inline-block');
		}
	});

	//发布信息
	$("#addNew").bind("click", function(){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("infoAdd", "info", "发布信息", "info/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".modify", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editinfo"+id, "info", title, "info/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('您确定要将选中的信息放入回收站吗？', function(){
			init.del("del");
		});
	});

	//彻底删除
	$("#fullyDelBtn").bind("click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的所有图片，此操作不可恢复，您确定要删除吗？', function(){
			init.del("fullyDel");
		});
	});

	//还原
	$("#revertBtn").bind("click", function(){
		init.revert();
	});

	//单条还原
	$("#list").delegate(".huanyuan", "click", function(){
		init.revert();
		return false;
	});




	//单条删除
	$("#list").delegate(".delete", "click", function(){
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
		if(recycle != ""){
			$.dialog.confirm('删除信息将会删除信息下面的所有图片，此操作不可恢复，您确定要删除吗？', function(){
				init.del("fullyDel");
			});
		}else{
			$.dialog.confirm('您确定要将此条信息放入回收站吗？', function(){
				init.del("del");
			});
		}
	});
	//批量审核
	$("#batchAudit a").bind("click", function(){
        var t = $(this), text = t.text();
        if(text == '拒绝审核'){
            var ret = prompt('请输入审核拒绝的原因');
            if(ret !== null && ret != '') {
                init.updateState(text, ret);
            }else{
                huoniao.showTip("warning", "操作失败，您没有输入审核拒绝的原因", "auto");
            }
        }else{
            init.updateState(text);
        }
	});

	//更新时间
	$("#refreshBtn").bind("click", function(){
		var checked = $("#list tbody tr.selected");
		if(checked.length < 1){
			huoniao.showTip("warning", "未选中任何信息！", "auto");
		}else{
			huoniao.showTip("loading", "正在操作，请稍候...");
			var id = [];
			for(var i = 0; i < checked.length; i++){
				id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
			}

			huoniao.operaJson("infoList.php?dopost=updateTime", "id="+id, function(data){
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
					$.dialog.alert("<div class='errInfo'><strong>以下信息更新失败：</strong><br />" + info.join("<br />") + '</div>', function(){
						getList();
					});
				}
			});
			$("#selectBtn a:eq(1)").click();
		}
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
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1 || event.target.className.indexOf("huanyuan") > -1) {
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
	// $("#list tbody").selectable({
	// 	distance: 3,
	// 	cancel: '.check, a',
	// 	start: function(){
	// 		$("#smartMenu_state").remove();
	// 	},
	// 	stop: function() {
	// 		init.funTrStyle();
	// 	}
	// });

	//分类链接点击
	$("#list").delegate(".type", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();

		$("#typeBtn")
			.attr("data-id", id)
			.find("button").html(txt+'<span class="caret"></span>');

		$("#sType").html(id);

		$("#list").attr("data-atpage", 1);
		getList();

		$("#selectBtn a:eq(1)").click();
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
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">取消显示</a></li>');
			htmlMenu.push('    </ul>');
			htmlMenu.push('  </div>');
			htmlMenu.push('</div>');

			return htmlMenu.join("");
		}

		$("body").append(htmlCreateStateMenu());

		$("#"+obj).find("a").bind("click", function(event){
			event.preventDefault();
            var t = $(this), text = t.text();
            if(text == '拒绝审核'){
                var ret = prompt('请输入审核拒绝的原因');
                if(ret !== null && ret != '') {
                    init.updateState(text, ret);
                }else{
                    huoniao.showTip("warning", "操作失败，您没有输入审核拒绝的原因", "auto");
                }
            }else{
                init.updateState(text);
            }
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

});

//置顶

$("#list").delegate(".topping", "click", function(){
	var t = $(this), par = t.closest(".item"), id = par.attr("data-id"),  tr = t.closest('tr'),id = tr.attr('data-id'),title = par.attr("data-title");
	$('#editform #id').val(id);
	refreshTopFunc.init('topping', 'info', 'detail',  t, title);
});


//刷新
$("#list").delegate(".refresh", "click", function(){
	var t = $(this), par = t.closest(".item"), id = par.attr("data-id"),  tr = t.closest('tr'),id = tr.attr('data-id'), title = par.attr("data-title");
	$('#editform #id').val(id);
	refreshTopFunc.init('refresh', 'info', 'detail', t, title);
});

refreshTopFunc = {

	//初始加载
	// type: refresh、top
	// mod: 系统模块
	// act: 类目
	// aid: 信息ID
	// btn: 触发元素  非必传
	init: function (type, mod, act,  btn, title) {

		if (!type || !mod || !act ) return false;
		btn ? btn.addClass('load') : null;  //给触发元素增加load样式;
		//
		// var userid = $.cookie( + "login_user");
		// if (userid == null || userid == "") {
		// 	location.reload();
		// 	return false;
		// }

		//初始加载配置信息，包括会员相关信息
		$.ajax({
			type: "POST",
			url: masterDomain + "/include/ajax.php",
			dataType: "jsonp",
			data: {
				'service': 'siteConfig',
				'action': 'refreshTopConfig',
				'module': mod,
				'act': act,
				'userid' : '29'
			},
			success: function (data) {
				if (data && data.state == 100) {

					refreshTopConfig = data.info;
					refreshTopFunc.show(type, title);
					if (type == 'topping'){
						refreshTopFunc.toppingPlan();
					}else{
						// refreshTopAmount = parseFloat(refreshSmart[index].price);
						// $('#refreshTopForm #amount').val(refreshTopAmount);
						$('#editform #type').val('refresh');
						$('#editform #refreConfig').val(0);
						$('#editform #refreshSmart').val('1');
					}
				} else {
					alert(data.info);
				}
				btn ? btn.removeClass('load') : null;
			},
			error: function () {
				alert(langData['siteConfig'][20][227]);//'网络错误，加载失败！'
				btn ? btn.removeClass('load') : null;
			}
		});

		refreshTopModule = mod;
		refreshTopAction = act;
		$('#refreshTopForm #type').val(type);
		// $('#refreshTopForm #useBalance').val(userTotalBalance > 0 ? 1 : 0);

		//关闭窗口
		$('.refreshTopPopup .rtClose').bind('click', function () {
			refreshTopFunc.close('refresh');
		});
	},


	//显示业务窗口，以及填充初始数据
	show: function(type, title){

		$('.rtRefresh, .rtTopping, .rtBody .paytypeObj').hide();
		var rtConfig = refreshTopConfig.config;

		// 房产模块、经纪人、后台配置了经纪人套餐
		// if(refreshTopModule == 'house' && rtConfig.zjuserMeal.iszjuser == "1" && rtConfig.zjuserMeal.meal_check.state != 101){
		// 	check_zjuser = true;
		// 	$('.refreshTopPopup').addClass('check_zjuser');
		//
		// 	if(type == "refresh"){
		// 		$('.freeRefresh, .normalRefresh, .rtPayObj').addClass('hide_impt');
		// 		this.update_zjuser_btn(type, 1);
		// 	}else{
		// 		houseTop = 0;
		// 		$('.rtPayObj').addClass('hide_impt');
		// 		$("#topPlanEndObj").val($("#topPlanBeganObj").val())
		// 		this.update_zjuser_btn(type, 1);
		// 	}
		// }else{
		// 	$('.zjuser_tj, .zjuser_info').remove();
		// }

		//刷新业务
		if(type == 'refresh'){

			$('.rtRefresh').show();
			$('.rtHeader h5').html(langData['siteConfig'][16][70]);//刷新
			var smart = $('#type').val();
			//初始化默认选中普通刷新
			$('.rtTab li').removeClass('curr');
			$('.rtTab li:eq(1)').addClass('curr');
			// $('.rtCon .rtItem, .rtPayObj').hide();
			// $('.rtCon .rtItem:eq(1)').show();

			refreshFreeTimes = rtConfig.refreshFreeTimes;  //可免费刷新次数
			refreshNormalPrice = rtConfig.refreshNormalPrice;  //普通刷新价格
			refreshSmart = rtConfig.refreshSmart;  //智能刷新配置
			memberFreeCount = refreshTopConfig.memberFreeCount;
			surplusFreeRefresh = parseInt(refreshFreeTimes - memberFreeCount);

			if(refreshSmart && refreshSmart.length > 0){
				var unit = refreshSmart[refreshSmart.length - 1].unit;
				$('.normalTips .smartUnit').html(unit);
			}

			//如果还有免费次数
			if(surplusFreeRefresh > 0){
				$('.freeRefresh').show();
				$('.normalRefresh').hide();
				$('.refreshFreeSurplus').html(surplusFreeRefresh);
				refreshTopAmount = 0;
			}else{
				$('.freeRefresh').hide();
				$('.normalRefresh').show();

				refreshTopAmount = refreshNormalPrice;
				$('#refreshTopForm #amount').val(refreshTopAmount);

				// $('.rtPayObj').show();
			}

			//拼接智能刷新方案
			if(refreshSmart.length > 0){
				var smartHtml = [];
				for (var i = 0; i < refreshSmart.length; i++) {
					smartHtml.push('<li class="fn-clear'+(i == 0 ? ' checked' : '')+'">');
					smartHtml.push('<i class="radio"><s></s></i>');
					smartHtml.push('<span class="sm-tit">'+langData['siteConfig'][16][70]+refreshSmart[i].times+langData['siteConfig'][13][26]+'<em>（'+refreshSmart[i].day+langData['siteConfig'][13][6]+'）</em></span>');
					//刷新---次 ----天
					smartHtml.push('<span class="sm-pri"><strong>'+refreshSmart[i].price+'</strong>'+echoCurrency('short')+'（<em>'+refreshSmart[i].discount+'</em>，'+langData['siteConfig'][30][73]+refreshSmart[i].unit+echoCurrency('short')+'/'+langData['siteConfig'][13][26]+'）</span>');
					//仅---元/次
					if(refreshSmart[i].offer > 0){
						smartHtml.push('<span class="sm-off">'+langData['siteConfig'][30][74]+'<strong>'+refreshSmart[i].offer+'</strong>'+echoCurrency('short')+'</span>');  //省
					}
					smartHtml.push('</li>');

				}
				0
				$('.rtSmart').html(smartHtml.join(''));

				//没有智能刷新方案
			}else{
				$('.rtRefresh .rtTab li:eq(0)').hide();
			}


			//置顶业务
		}else if(type == 'topping'){

			$('.rtTopping').show();
			$('.rtHeader h5').html(langData['siteConfig'][19][762]);  //置顶

			$('.rtTopping .topTit').html(title);

			//初始化默认选中普通刷新
			$('.topType label').removeClass('checked');
			$('.topType label:eq(0)').addClass('checked');
			// $('.rtTopping .topPlan').hide();
			// $('.rtTopping .topNormal').show();

			topPlan = rtConfig.topPlan;  //计划置顶
			if(!topPlan) {
				alert(rtConfig);
				return false;
			}
			//将周日的数据移到第一位
			topPlan.unshift(1);
			topPlan[0] = topPlan[7];
			topPlan.pop();

			//拼接普通置顶时长
			var	topNormalHtml = [];
			// if(topNormal.length > 0){
			// 	for (var i = 0; i < topNormal.length; i++) {
			// 		if(i == 0){
			// 			refreshTopAmount = parseFloat(topNormal[i].price);
			// 			$('#refreshTopForm #amount').val(refreshTopAmount);
			// 		}
			// 		topNormalHtml.push('<li'+(i == 0 ? ' class="checked"' : '')+'>'+(topNormal[i].offer > 0 ? '<sup>'+topNormal[i].discount+'</sup>' : '')+'<p>'+topNormal[i].day+langData['siteConfig'][13][6]+'</p><strong><small>&yen;</small>'+topNormal[i].price+'</strong><em></em><img src="'+masterDomain+'/templates/member/images/refreshTop_checked.png"></li>');//天
			// 	}
			// }
			$('.rtTopping .topDays').html(topNormalHtml.join(''));
			$('#refreshTopForm #config').val(0);

			//显示支付
			// $('.rtPayObj').show();

			// 房产经纪人操作
			// if(check_zjuser){
			//
			// 	$('.topType label:eq(1)').click();
			// 	$('.topType label:eq(1)').hide();
			// 	$('.rtTopping .topPlan').show().children('dl:eq(1)').hide();
			// 	$('.topType label:eq(0)').addClass('checked').show();
			// 	$('.rtTopping .topNormal').hide();
			// 	$('#refreshTopForm #type').val('topping');
			// }

		}

		//余额选项
		if(userTotalBalance){
			var rtUseBalance = userTotalBalance > refreshTopAmount ? refreshTopAmount.toFixed(2) : userTotalBalance.toFixed(2);
			$('.rtBody .reduce-yue').text(rtUseBalance);
			$('.rtBody .pay-total').text((refreshTopAmount - rtUseBalance).toFixed(2));
		}

		// if(check_zjuser){
		// 	$('.normalRefresh, .rtPayObj').hide();
		// 	$('.freeRefresh').show();
		// }else{
		//
		// }

		//显示浮动窗口
		$('.refreshTopPopup, .refreshTopMask').show();
		resetRefreshPopupPos();

	},


	//关闭
	close: function(){

		$('.refreshTopPopup, .refreshTopMask').hide();
		// 重置数据
		$(".paySubmit").text('提交').removeAttr('disabled');
		$('#editform #config,#editform #isbid,#editform #refreConfig,#editform #refreConfig #type,#editform #refreshSmart,#editform #bid_type').val('')
	},


	//计算计划置顶费用
	toppingPlan: function(){
		var beganDate = $('#topPlanBeganObj').val(),
			endDate = $('#topPlanEndObj').val();
		var diffDays = parseInt(getRtDays(beganDate, endDate)) + 1;

		//统计费用明细
		if(topPlan){

			refreshTopAmount = 0;

			//获取已选时段
			var rtPlanSelected = [];
			$('.rtPlanList td').each(function(){
				var t = $(this), week = t.data('week'), type = t.data('type');
				if(type && t.hasClass('curr')){
					rtPlanSelected[week] = type;
				}
			});

			//根据时长计算每天的费用
			for (var i = 0; i < diffDays; i++) {
				var date = getRtDate(beganDate, i);
				var dateFormat = new Date(Date.parse(date.replace(/\-/g,"/")));
				var week = dateFormat.getDay();

				if(rtPlanSelected[week]){
					refreshTopAmount += topPlan[week][rtPlanSelected[week]];
				}
			}


			//将配置信息写入表单
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('#editform #config').val(beganDate+'|'+endDate+'|'+rtPlanSelected.join(','));
			$('#editform #isbid').val('1');
			$('#editform #bid_type').val('plan');



		}

	},


}

//选择智能刷新方案
$('.rtSmart').delegate('li', 'click', function(){
	var t = $(this), index = t.index(), times = parseInt(refreshSmart[index].times);
	t.addClass('checked').siblings('li').removeClass('checked');
	// refreshTopAmount = parseFloat(refreshSmart[index].price);
	// $('#refreshTopForm #amount').val(refreshTopAmount);
	$('#editform #type').val('refresh');
	$('#editform #refreConfig').val(index);
	$('#editform #refreshSmart').val('1');

	console.log(index)

});

//结束时间最少是一周的时间
$("#topPlanEnd").click(function(){
	var endDate = $("#topPlanEndObj").val(); //'#F{$dp.$D(\'topPlanBeganObj\',{d:6});}'
	WdatePicker({
		el: 'topPlanEndObj',
		doubleCalendar: true,
		isShowClear: false,
		isShowOK: false,
		isShowToday: false,
		minDate: endDate,
		onpicked: function(dp){
			var beganDate = $('#topPlanBeganObj').val();
			var endDate = dp.cal.getNewDateStr();

			if(!checkRtDate(beganDate)){
				beganDate = getRtDate(0, 1);
				$('#topPlanBeganObj').val(beganDate);
			}
			var diffDays = getRtDays(beganDate, endDate);
			if(diffDays < houseTop){
				$('#topPlanEndObj').val(getRtDate(beganDate, houseTop));
			}
			refreshTopFunc.toppingPlan();

			// if(check_zjuser){
			// 	refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
			// }
		}
	});
});

//选择置顶时段
$('.rtTopping .rtPlanList').delegate('em', 'click', function(){
	var t = $(this), td = t.closest('td'), tr = t.closest('tr'),id = tr.attr('data-id'), index = td.index(), trIndex = tr.index();
	if(!td.hasClass('curr')){
		td.addClass('curr');
		tr.siblings('tr').each(function(){
			$(this).find('td:eq('+index+')').removeClass('curr');
		});
		refreshTopFunc.toppingPlan();
	}
});
//获取客户端当前时间
function getRtDate(date, day){
	var time = date ? new Date(date) : new Date();//获取当前时间
	if(day){
		time.setDate(time.getDate()+day);
	}
	var m = time.getMonth() + 1;
	var d = time.getDate();
	var t = time.getFullYear() + "-" + (m < 10 ? '0' + m : m) + "-" + (d < 10 ? '0' + d : d);
	return t;
}

//支付
$('.rtBody .paySubmit').bind('click', function(){
	var t = $(this);
		id           = $("#id").val(),
	t.attr("disabled", true).html("提交中...");

	$.ajax({
		type: "POST",
		url: "infoList.php?action=info",
		data: $("#editform").serialize() + "&submit=" + encodeURI("提交"),
		dataType: "json",
		success: function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){

					huoniao.parentTip("success", "信息发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.href = "infoAdd.php?typeid="+$("#typeid").val();
				}else{

					huoniao.parentTip("success", "信息修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false).html("确认提交");

				}
			}else{

				if(data.state == 200){
					$.dialog({
					    lock: true,
						title: '提示',
					    content: data.info,
					    icon: 'success.png',
					    ok: function () {
					        getList();
					    },
					    cancel: false
					});
				}else{
					$.dialog.alert(data.info);
				}
				t.attr("disabled", false);
			};
		},
		error: function(msg){
			$.dialog.alert("网络错误，请刷新页面重试！");
			t.attr("disabled", false);
		}
	});

	$('.rtClose').click();
});

//重置浮动层位置
function resetRefreshPopupPos(){
	var top = $('.refreshTopPopup').height() / 2;
	$('.refreshTopPopup').css({'margin-top': -top + 'px'});
}
//置顶方式切换
$('.rtTopping .topType').delegate('label', 'click', function(){
	var t = $(this), index = t.index();
	if(!t.hasClass('checked')){
		t.addClass('checked').siblings('label').removeClass('checked');

		if(index == 0){
			$('.rtTopping .topPlan').hide();
			$('.rtTopping .topNormal').show();
			$('#refreshTopForm #type').val('topping');
			var rtTopNormalIndex = $('.topNormal .topDays .checked').index();
			refreshTopAmount = parseFloat(topNormal[rtTopNormalIndex].price);
			$('#refreshTopForm #amount').val(refreshTopAmount);
			$('#refreshTopForm #config').val(rtTopNormalIndex);

		}else{
			$('.rtTopping .topPlan').show();
			$('.rtTopping .topNormal').hide();
			$('#refreshTopForm #type').val('toppingPlan');
			refreshTopFunc.toppingPlan();
		}

	}
});

//选择置顶时长
$('.rtTopping .topDays').delegate('li', 'click', function(){
	var t = $(this), index = t.index();
	if(!t.hasClass('checked')){
		t.addClass('checked').siblings('li').removeClass('checked');
		var rtTopNormalIndex = $('.topNormal .topDays .checked').index();
		refreshTopAmount = parseFloat(topNormal[rtTopNormalIndex].price);
		$('#refreshTopForm #amount').val(refreshTopAmount);
		$('#refreshTopForm #config').val(rtTopNormalIndex);

	}
});

//选择计划置顶日期
$("#topPlanBegan").click(function(){
	WdatePicker({
		el: 'topPlanBeganObj',
		doubleCalendar: true,
		isShowClear: false,
		isShowOK: false,
		isShowToday: false,
		minDate: '%y-%M-{%d}',
		onpicked: function(dp){
			var beganDate = dp.cal.getNewDateStr();
			var endDate = $('#topPlanEndObj').val();

			var diffDays = parseInt(getRtDays(beganDate, endDate));
			if(diffDays < houseTop){
				$('#topPlanEndObj').val(getRtDate(beganDate, houseTop));
			}
			refreshTopFunc.toppingPlan();

			if(check_zjuser){
				refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
			}
		}
	});
});

//结束时间最少是一周的时间
$("#topPlanEnd").click(function(){
	var endDate = $("#topPlanEndObj").val(); //'#F{$dp.$D(\'topPlanBeganObj\',{d:6});}'
	WdatePicker({
		el: 'topPlanEndObj',
		doubleCalendar: true,
		isShowClear: false,
		isShowOK: false,
		isShowToday: false,
		minDate: endDate,
		onpicked: function(dp){
			var beganDate = $('#topPlanBeganObj').val();
			var endDate = dp.cal.getNewDateStr();

			if(!checkRtDate(beganDate)){
				beganDate = getRtDate(0, 1);
				$('#topPlanBeganObj').val(beganDate);
			}
			var diffDays = getRtDays(beganDate, endDate);
			if(diffDays < houseTop){
				$('#topPlanEndObj').val(getRtDate(beganDate, houseTop));
			}
			refreshTopFunc.toppingPlan();

			if(check_zjuser){
				refreshTopFunc.update_zjuser_btn('topping', diffDays + 1);
			}
		}
	});
});

//使用正则表达式去判断日期格式是否正确
function checkRtDate(date){
	var regExp = /^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])(\-)([0][1-9]|[1][0-2])(\-)([0-2][1-9]|[3][0-1])$/g;
	if(regExp.test(date)){
		return true;
	}else{
		return false;
	}
}
//获得两个日期之间相差的天数
function getRtDays(date1 , date2){
	var date1Str = date1.split("-"); //将日期字符串分隔为数组,数组元素分别为年.月.日
	//根据年 . 月 . 日的值创建Date对象
	var date1Obj = new Date(date1Str[0],(date1Str[1]-1),date1Str[2]);
	var date2Str = date2.split("-");
	var date2Obj = new Date(date2Str[0],(date2Str[1]-1),date2Str[2]);
	var t1 = date1Obj.getTime();
	var t2 = date2Obj.getTime();
	var dateTime = 1000*60*60*24; //每一天的毫秒数
	var minusDays = Math.floor(((t2-t1)/dateTime));//计算出两个日期的天数差
	var days = minusDays;//取绝对值
	return days;
}


//选择置顶时段
$('.rtTopping .rtPlanList').delegate('em', 'click', function(){
	var t = $(this), td = t.closest('td'), tr = t.closest('tr'), index = td.index(), trIndex = tr.index();
	if(!td.hasClass('curr')){
		td.addClass('curr');
		tr.siblings('tr').each(function(){
			$(this).find('td:eq('+index+')').removeClass('curr');
		});
		refreshTopFunc.toppingPlan();
	}
});
//置顶开始时间
$("#bid_start").datetimepicker({
	format: 'yyyy-mm-dd',
	autoclose: true,
	language: 'ch',
	todayBtn: true,
	minView: 2
});
//置顶结束时间
$("#bid_end").datetimepicker({
	format: 'yyyy-mm-dd',
	autoclose: true,
	language: 'ch',
	todayBtn: true,
	minView: 2
});
//刷新开始时间
$("#refreshBegan").datetimepicker({
	format: 'yyyy-mm-dd',
	autoclose: true,
	language: 'ch',
	todayBtn: true,
	minView: 2
});

//刷新结束时间
$("#refreshNext").datetimepicker({
	format: 'yyyy-mm-dd',
	autoclose: true,
	language: 'ch',
	todayBtn: true,
	minView: 2
});

//查看计划置顶详情
$('body').delegate('.topPlanDetail', 'click', function(){
	var t = $(this), module = 'info', aid = t.attr('data-id'),tr = t.closest('tr'),id = tr.attr('data-id');
	topPlanCalUtil.setMonthAndDay();
	topPlanCalUtil.init(topPlanData[module][id]);
});
// 日历加载主要代码
var topPlanCalUtil = {

	eventName:"load",
	//初始化日历
	init:function(signList){
		topPlanCalUtil.eventName="load";
		topPlanCalUtil.draw(signList);
		topPlanCalUtil.bindEnvent(signList);
	},
	draw:function(signList){
		//绑定日历
		var str = topPlanCalUtil.drawCal(topPlanCalUtil.showYear,topPlanCalUtil.showMonth,signList);
		$(".topCalendar").html(str);
		$('.topCalendar, .topCalendarBg').show();
		//绑定日历表头
		var calendarName=topPlanCalUtil.showYear+"/"+topPlanCalUtil.showMonth;
		$(".calendar_month_span").html(calendarName);
	},
	//绑定事件
	bindEnvent:function(signList){

		//绑定上个月事件
		$(".calendar_month_prev").click(function(){
			var t = $(this);
			if(t.hasClass("disabled")) return false;
			topPlanCalUtil.eventName="prev";
			topPlanCalUtil.setMonthAndDay();
			topPlanCalUtil.init(signList);
		});

		//绑定下个月事件
		$(".calendar_month_next").click(function(){
			var t = $(this);
			if(t.hasClass("disabled")) return false;
			topPlanCalUtil.eventName="next";
			topPlanCalUtil.setMonthAndDay();
			topPlanCalUtil.init(signList);
		});

		//关闭
		$(".calendar_close").click(function(){
			$('.topCalendar, .topCalendarBg').hide();
		})

	},
	//获取当前选择的年月
	setMonthAndDay:function(){
		switch(topPlanCalUtil.eventName)
		{
			case "load":
				topPlanCalUtil.showYear=currentYear;
				topPlanCalUtil.showMonth=currentMonth < 10 ? "0" + currentMonth : currentMonth;
				break;
			case "prev":
				var nowMonth=$(".calendar_month_span").html().split("/")[1];
				var newMonth = parseInt(nowMonth)-1;
				topPlanCalUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
				if(topPlanCalUtil.showMonth==0)
				{
					topPlanCalUtil.showMonth=12;
					topPlanCalUtil.showYear-=1;
				}
				break;
			case "next":
				var nowMonth=$(".calendar_month_span").html().split("/")[1];
				var newMonth = parseInt(nowMonth)+1;
				topPlanCalUtil.showMonth=newMonth < 10 ? "0" + newMonth : newMonth;
				if(topPlanCalUtil.showMonth==13)
				{
					topPlanCalUtil.showMonth="01";
					topPlanCalUtil.showYear+=1;
				}
				break;
		}
	},
	getDaysInmonth : function(iMonth, iYear){
		var dPrevDate = new Date(iYear, iMonth, 0);
		return dPrevDate.getDate();
	},
	bulidCal : function(iYear, iMonth) {
		var aMonth = new Array();
		aMonth[0] = new Array(7);
		aMonth[1] = new Array(7);
		aMonth[2] = new Array(7);
		aMonth[3] = new Array(7);
		aMonth[4] = new Array(7);
		aMonth[5] = new Array(7);
		aMonth[6] = new Array(7);
		var dCalDate = new Date(iYear, iMonth - 1, 1);
		var iDayOfFirst = dCalDate.getDay();
		var iDaysInMonth = topPlanCalUtil.getDaysInmonth(iMonth, iYear);
		var iVarDate = 1;
		var d, w;
		aMonth[0][0] = langData['siteConfig'][13][25];//日
		aMonth[0][1] = langData['siteConfig'][30][61];//一
		aMonth[0][2] = langData['siteConfig'][30][62];//二
		aMonth[0][3] = langData['siteConfig'][30][63];//三
		aMonth[0][4] = langData['siteConfig'][30][64];//四
		aMonth[0][5] = langData['siteConfig'][30][65];//五
		aMonth[0][6] = langData['siteConfig'][30][66];//六
		for (d = iDayOfFirst; d < 7; d++) {
			aMonth[1][d] = iVarDate;
			iVarDate++;
		}
		for (w = 2; w < 7; w++) {
			for (d = 0; d < 7; d++) {
				if (iVarDate <= iDaysInMonth) {
					aMonth[w][d] = iVarDate;
					iVarDate++;
				}
			}
		}
		return aMonth;
	},
	ifHasSigned : function(signList, day){
		var ret;
		if(day != undefined){
			$.each(signList,function(index,item){
				if(item.date == day) {
					ret = {
						'type': item.type == 'day' ? langData['siteConfig'][30][79] : langData['siteConfig'][14][11] ,//早8-晚8--全天
						'state': item.state
					};
				}
			});
		}
		return ret;
	},
	Retroactive : function(RetroList,day){
		var Retro = false;
		$.each(RetroList,function(index,item){
			if(item == day) {
				Retro = true;
				return false;
			}
		});
		return Retro ;
	},
	SpecialData : function(SpecialList, Year, Month, day){
		var data = [], day = day < 10 ? "0" + day : day;
		$.each(SpecialList,function(index,item){
			if (item['date'] == Year + "-" + Month + "-" + day) {
				data = {'title': item.title, 'color': item.color}
			}
		});
		return data;
	},
	TodayData : function(TrueYear, TrueMonth, TrueDay, Year, Month, day){
		var Retro = false;
		if(TrueYear == Year && TrueMonth == Month && TrueDay == day) {
			Retro = true;
		}
		return Retro;
	},
	drawCal : function(iYear,iMonth ,signList) {
		var myMonth = topPlanCalUtil.bulidCal(iYear, iMonth);
		var htmls = new Array();
		htmls.push("<div class='sign_main' id='sign_layer'>");
		htmls.push("<div class='sign_succ_calendar_title'>");
		htmls.push("<div class='calendar_month_prev'>◀</div>");
		htmls.push("<div class='calendar_month_span'></div>");
		htmls.push("<div class='calendar_month_next'>▶</div>");
		htmls.push("<div class='calendar_close'></div>");
		htmls.push("</div>");
		htmls.push("<div class='sign' id='sign_cal'>");
		htmls.push("<table valign='top'>");
		htmls.push("<tr>");
		htmls.push("<th>" + langData['siteConfig'][14][10] + "</th>");//星期日
		htmls.push("<th>" + langData['siteConfig'][14][4] + "</th>");//星期一
		htmls.push("<th>" + langData['siteConfig'][14][5] + "</th>");//星期二
		htmls.push("<th>" + langData['siteConfig'][14][6] + "</th>");//星期三
		htmls.push("<th>" + langData['siteConfig'][14][7] + "</th>");//星期四
		htmls.push("<th>" + langData['siteConfig'][14][8] + "</th>");//星期五
		htmls.push("<th>" + langData['siteConfig'][14][9] + "</th>");//星期六
		htmls.push("</tr>");
		var d, w;

		for (w = 1; w < 7; w++) {
			htmls.push("<tr  class='WeekDay'>");
			for (d = 0; d < 7; d++) {

				// 当前日期高亮提示
				var TodayData = topPlanCalUtil.TodayData(currentYear, currentMonth, currentDay, iYear, iMonth, myMonth[w][d]);
				// 已置顶日期循环对号
				var ifHasSigned = topPlanCalUtil.ifHasSigned(signList, iYear + '-' + (iMonth < 10 ? "0" + parseInt(iMonth) : iMonth) + '-' + (myMonth[w][d] < 10 ? "0" + myMonth[w][d] : myMonth[w][d]));

				if(ifHasSigned){
					if(TodayData) {
						htmls.push("<td data-id='" + myMonth[w][d] + "' class='today isTop" + ifHasSigned.state + "' title='" + ifHasSigned.type + "'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>"+ifHasSigned.type+"</span></td>");
					}else {
						htmls.push("<td data-id='" + myMonth[w][d] + "' class='isTop" + ifHasSigned.state + "' title='" + ifHasSigned.type + "'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>"+ifHasSigned.type+"</span></td>");
					}
				}else{
					if(TodayData){
						htmls.push("<td data-id='"+myMonth[w][d]+"' class='today'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] : " ") + " <span>" + langData['siteConfig'][32][43] + "</span></td>");//不置顶
					}else{
						htmls.push("<td class='empty'>" + (!isNaN(myMonth[w][d]) ? myMonth[w][d] + "<span>" + langData['siteConfig'][32][43] + "</span>" : "") + " </td>");//不置顶
					}
				}
			}
			htmls.push("</tr>");
		}
		htmls.push("</table>");
		htmls.push("</div>");
		htmls.push("</div>");
		return htmls.join('');
	}
};



//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		stateInfo = $("#stateBtnn").attr("data-id") ? $("#stateBtnn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
		aType    = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("stateInfo="+stateInfo);
		data.push("start="+start);
		data.push("end="+end);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("aType="+aType);


	huoniao.operaJson("infoList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, articleList = val.articleList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);
		$(".totalNoshow").html(val.pageInfo.totalNoshow);
		$(".totalValid").html(val.pageInfo.totalValid);
		$(".totalIsSale").html(val.pageInfo.totalIsSale);
		$(".totalBid").html(val.pageInfo.totalBid);
		$(".totalRefresh").html(val.pageInfo.totalRefresh);
		$(".totalReadInfo").html(val.pageInfo.totalReadInfo);
		$(".totalShareInfo").html(val.pageInfo.totalShareInfo);
		$(".totalReadPrice").html(val.pageInfo.totalReadPrice);
		$(".totalSharePrice").html(val.pageInfo.totalSharePrice);
		$(".totalsurRead").html(val.pageInfo.totalsurRead);
		$(".totalsurShare").html(val.pageInfo.totalsurShare);


		$(".valid").html(val.pageInfo.valid);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < articleList.length; i++){
				id = articleList[i].id,
				list.push('<tr data-id="'+articleList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var color = "";
				if(articleList[i].color != ""){
					color = " style='color:"+articleList[i].color+"'";
				}

				var valid = "";
				if(articleList[i].isvalid){
					valid = '<span class="label label-warning">已过期</span>';
				}
				var sold = "";
				if(articleList[i].is_valid){
					sold = '<code>已售出</code>';
				}
				//置顶
				var isbid = "";
				if(articleList[i].isbid == 1){
					isbid = '<code>计划置顶</code>';
				}
				//刷新
				var refreshSmart = "";
				if(articleList[i].refreshSmart == 1){
					refreshSmart = '<code>智能刷新</code>';
				}

				//是否设置阅读红包
				var readInfo = '';
				if(articleList[i].readInfo == 1){
					readInfo = '<code>阅读红包</code>';
				}
				//是否设置分享红包
				var shareInfo = '';
				if(articleList[i].shareInfo == 1){
					shareInfo = '<code>分享红包</code>';
				}

				list.push('  <td class="row25 left"><a href="'+articleList[i].url+'" style="width: auto;" target="_blank"'+color+' class="lj">'+articleList[i].title+'</a><br /><code style="display: inline-block; line-height: 12px; margin-right: 5px;">ID:'+articleList[i].id+'</code>'+sold+isbid+refreshSmart+readInfo+shareInfo+valid+'</td>');
				list.push('  <td class="row12 left">'+articleList[i].type+'</td>');
				list.push('  <td class="row12 left">'+articleList[i].cityname+'</td>');
				var state = "";
				switch (articleList[i].state) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">已审核</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="'+articleList[i].review+'">审核拒绝 <i class="icon-question-sign" style="margin-top: 3px;"></i></span>';
						break;
					case "取消显示":
						state = '<span class="refuse">取消显示</span>';
						break;
				}
				list.push('  <td class="row14 left"><a href="javascript:;" class="userinfo lj" data-id="'+articleList[i].userid+'">'+articleList[i].username+'</a></td>');
				list.push('  <td class="row10 left">'+articleList[i].dateArr[1]+'<small>'+articleList[i].dateArr[0]+'</small></td>');
				list.push('  <td class="row12 state">'+state+'<span class="more"><s></s></span></td>');

				list.push('  <td class="row12">');

				var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
				if(recycle != ""){
					list.push('<a href="javascript:;" title="还原" class="huanyuan">还原</a>&nbsp;&nbsp;&nbsp;&nbsp;');
				}else{
					// list.push('<a data-id="'+articleList[i].id+'" data-title="'+articleList[i].title+'" href="quanjingAdd.php?dopost=edit&id='+articleList[i].id+'&action='+action+'" title="修改" class="edit">修改</a>');
					list.push('<a href="javascript:;" title="置顶" class="topping">置顶</a>&nbsp;&nbsp;&nbsp;&nbsp;');
					list.push('<a href="javascript:;" title="刷新" class="refresh">刷新</a><br />');

					list.push('<a data-id="'+articleList[i].id+'" data-title="'+articleList[i].title+'" href="infoAdd.php?dopost=edit&id='+articleList[i].id+'" title="修改" class="modify">修改</a>&nbsp;&nbsp;&nbsp;&nbsp;');
				}


				list.push('<a href="javascript:;" title="删除" class="delete">删除</a></td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();

            $('.statusTips1').tooltip();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
