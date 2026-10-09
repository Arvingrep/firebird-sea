$(function(){

	var defaultBtn = $("#delBtn, #batchAudit"),
		checkedBtn = $("#stateBtn, #updateBtn, #updateFabuTime"),
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

			//菜单递归分类
			,selectTypeList: function(type){
				var typeList = [], title = type == "addr" ? "全部地区" : "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = type == "addr" ? addrListArr : typeListArr;
				for(var i = 0; i < l.length; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
						if(jArray != undefined && jArray.length > 0){
							cl = ' class="dropdown-submenu"';
						}
						typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
						if(jArray != undefined && jArray.length > 0){
							typeList.push('<ul class="dropdown-menu">');
						}
						if(jArray != undefined){
							for(var k = 0; k < jArray.length; k++){
								if(jArray[k]['lower'] != ""){
									arguments.callee(jArray[k]);
								}else{
									typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
								}
							}
						}
						if(jArray != undefined && jArray.length > 0){
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

					huoniao.operaJson("jobPost.php?dopost=del", "id="+id, function(data){
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

			//上架
			,onShell: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("jobPost.php?dopost=offState", "off=0&id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							$.dialog.alert(data.info, function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//下架
			,offShell: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("jobPost.php?dopost=offState", "off=1&id="+id, function(data){
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

			//抖音端展示状态
			,douyin: function(_state){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("jobPost.php?dopost=douyin", "state="+_state+"&id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							$.dialog.alert(data.info, function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//更新信息状态
			,updateState: function(type){
				$("#smartMenu_state").remove();

				var refuse_msg = "";
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var state = "";
					if(type == "待审核"){
						state = 0;
					}else if(type == "已审核"){
						state = 1;
					}else if(type == "拒绝审核"){
						state = 2;
						refuse_msg = prompt("请说明拒绝原因");
						if(!refuse_msg){
							return;
						}
					}
					console.log(refuse_msg)

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("jobPost.php?dopost=updateState", "id="+id+"&state="+state+"&refuse_msg="+refuse_msg, function(data){
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

	//地区递归分类
	$("#typeBtn").append(init.selectTypeList("type"));

    //填充分站列表
    // huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    // $(".chosen-select").chosen();
		huoniao.choseCity($(".choseCity"),$("#cityList"));  //城市分站选择初始化
	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

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
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pageBtn, #paginationBtn, #natureBtn").delegate("a", "click", function(){
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

			// $("#sAddr").html("");

			//if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			//}
			$("#list").attr("data-atpage", 1);
		}
		var nolist = $(this).data("nolist");
		if(!nolist){
			getList();
		}
	});

	//延长截止时间
	$("#updateBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();

		if($.dialog.confirm('确定要把当前筛选数据'+title+'吗？', function(){
			var sKeyword = encodeURIComponent($("#sKeyword").html()),
				sType    = $("#sType").html(),
				start    = $("#start").html(),
				end      = $("#end").html(),
				state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

			var data = [];
				data.push("sKeyword="+sKeyword);
		    	data.push("adminCity="+$("#cityList").val());
				data.push("sType="+sType);
				data.push("state="+state);
				data.push("start="+start);
				data.push("end="+end);
				data.push("time="+id);

			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("jobPost.php?dopost=updateTime", data.join("&"), function(val){
				if(val.state == 100){
					huoniao.hideTip();
					huoniao.showTip("success", "操作成功！");

					setTimeout(function(){
						getList();
					}, 2000);
				}else{
					huoniao.showTip("error", val.info);
				}
			});

		}));

	});


	//刷新发布时间
	$("#updateFabuTime").bind("click", function(){
		var id = $(this).attr("data-id");

		if($.dialog.confirm('确定要刷新当前筛选数据的发布时间吗？', function(){
			var sKeyword = encodeURIComponent($("#sKeyword").html()),
				sType    = $("#sType").html(),
				start    = $("#start").html(),
				end      = $("#end").html(),
				state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

			var data = [];
				data.push("sKeyword="+sKeyword);
		    	data.push("adminCity="+$("#cityList").val());
				data.push("sType="+sType);
				data.push("state="+state);
				data.push("start="+start);
				data.push("end="+end);
				data.push("time="+id);

			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("jobPost.php?dopost=updateFabuTime", data.join("&"), function(val){
				if(val.state == 100){
					huoniao.hideTip();
					huoniao.showTip("success", "操作成功！");

					setTimeout(function(){
						getList();
					}, 2000);
				}else{
					huoniao.showTip("error", val.info);
				}
			});

		}));

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
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.css('display', 'inline-block');
		}
	});

	//新增
	$("#addNew").bind("click", function(event){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("jobPostAdd", "job", "新增招聘职位", "job/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("jobPostEdit"+id, "job", title, "job/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".delete", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条上架
	$("#list").delegate(".onShell", "click", function(){
		$.dialog.confirm('您确定要上架该职位吗？', function(){
			init.onShell();
		});
	});

	//单条下架
	$("#list").delegate(".offShell", "click", function(){
		$.dialog.confirm('您确定要下架该职位吗？', function(){
			init.offShell();
		});
	});

	//单条在抖音上展示/隐藏
	$("#list").delegate(".douyin", "click", function(){
        var t = $(this), _id = t.attr('data-id');
        var _title = _id == 0 ? '确认要将该职位在抖音上展示吗？' : '确认要将该职位在抖音上隐藏吗？';
		$.dialog.confirm(_title, function(){
			init.douyin(!_id);
		});
	});

	//批量审核
	$("#batchAudit a").bind("click", function(){
        if($(this).text() == '上架'){
            $.dialog.confirm('您确定要上架选中的职位吗？', function(){
                init.onShell();
            });
        }else if($(this).text() == '下架'){
            $.dialog.confirm('您确定要下架选中的职位吗？', function(){
                init.offShell();
            });
        }else if($(this).text() == '抖音展示'){
            $.dialog.confirm('确认要将选中的职位在抖音上展示吗？', function(){
                init.douyin(1);
            });
        }else if($(this).text() == '抖音隐藏'){
            $.dialog.confirm('确认要将选中的职位在抖音上隐藏吗？', function(){
                init.douyin(0);
            });
        }else{
		    init.updateState($(this).text());
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

});

// 导出
$("#export").click(function(e){
	// e.preventDefault();
	huoniao.showTip("loading", "正在操作，请稍候...");
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
	data.push("sKeyword="+sKeyword);
	data.push("adminCity="+$("#cityList").val());
	data.push("sType="+sType);
	data.push("state="+state);
	data.push("start="+start);
	data.push("end="+end);
	data.push("pagestep=200000");
	data.push("page="+page);

	huoniao.showTip("loading", "正在导出，请稍候...", "auto");
	$(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));
})


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
		nature  = $("#natureBtn").attr("data-id") ? $("#natureBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("nature="+nature);
		data.push("state="+state);
		data.push("start="+start);
		data.push("end="+end);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("jobPost.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, jobPost = val.jobPost;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state5").html(val.pageInfo.state5);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < jobPost.length; i++){
				list.push('<tr data-id="'+jobPost[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row20 left"><a href="'+jobPost[i].url+'" class="link" target="_blank">'+jobPost[i].title+'</a><br/><a href="'+jobPost[i].typeurl+'" target="_blank">'+jobPost[i].type+'</a><br><code style="padding: 1px 4px; margin-right: 5px; display: inline-block; vertical-align: middle; line-height: 16px; background: #F7FAFF; border: 1px solid #CED9ED; border-radius: 4px; color: #7D8FB3;">'+jobPost[i].nature+'</code>'+jobPost[i].show_salary+'</td>');
				list.push('  <td class="row20 left"><a href="'+jobPost[i].companyurl+'" class="link" target="_blank">'+jobPost[i].company+'</a><br/><code>'+jobPost[i].cityName+'</code> <a class="userinfo" href="javascript:;" data-id="'+jobPost[i].userid+'">'+jobPost[i].nickname+'</a></td>');
				list.push('  <td class="row10 left">'+jobPost[i].number+'&nbsp;-&nbsp;'+jobPost[i].interview+'&nbsp;-&nbsp;'+jobPost[i].click+'</td>');
				let topTil = "";
				if(jobPost[i].is_topping==1){
					topTil = jobPost[i].topDetail.info;
				}
				let refreshTil = "";
				if(jobPost[i].is_refreshing){
					refreshTil = jobPost[i].refreshDetail.info;
				}
				list.push('  <td class="row13 left">刷新：'+(jobPost[i].is_refreshing==1 ? '<span class="audit tooltips" data-toggle="tooltip" data-html="true" data-placement="bottom" title="" data-original-title="<p align=\'left\' style=\'margin-bottom:0;\'>'+(refreshTil && refreshTil != undefined ? refreshTil.replace(/，/g, "<br />") : "")+'</p>">是 <i class="icon-question-sign" style="margin-top: 3px;"></i></span>' : '<span class="gray">否</span>')+'<br/>置顶：'+(jobPost[i].is_topping==1 ? '<span class="audit tooltips" data-toggle="tooltip" data-html="true" data-placement="bottom" title="" data-original-title="<p align=\'left\' style=\'margin-bottom:0;\'>'+(topTil && topTil != undefined ? topTil.replace(/，/g, "<br />") : "")+'</p>">是 <i class="icon-question-sign" style="margin-top: 3px;"></i></span>' : '<span class="gray">否</span>')+'</td>');
				var valid = jobPost[i].show_valid;
				if(jobPost[i].long_valid!=1 && jobPost[i].valid < val.pageInfo.time){
					valid = '<font color="ff0000">'+valid+'</font>';
				}
				list.push('  <td class="row17 left">'+jobPost[i].pubdate+'<br/>'+jobPost[i].update_time+'<br/>'+valid+'</td>');
				var state = "";
				switch (jobPost[i].state) {
					case "0":
						state = '<span class="gray">待审核</span>';
						break;
					case "1":
						state = '<span class="audit">已审核</span>';
						break;
					case "2":
						state = '<span class="refuse statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="'+jobPost[i].refuse_msg+'"><i class="icon-question-sign" style="margin-top: 3px;"></i>拒绝</span>';
						break;
				}
				if(jobPost[i].del==1){
					state += '<span class="label label-warning" style="margin-left:3px; background: #FFF0F2!important; text-indent: 0; border: 1px solid #FFDEE3!important; color: #FF4C6A!important;" title="该职位已被删除">删</span>';
				}

                var douyinState = '';
                if(douyin){
                    if(jobPost[i].douyin == 1){
                        douyinState = '<br /><a href="javascript:;" class="douyin douyin'+jobPost[i].douyin+'" data-id="'+jobPost[i].douyin+'" title="该状态表示职位在抖音端没有隐藏&#10;是否显示依赖该职位是否已审核并且是上架状态而且没有删除掉&#10;点击该按钮修改职位在抖音端的状态为隐藏">抖音端展示中</a>';
                    }else{
                        douyinState = '<br /><a href="javascript:;" class="douyin douyin'+jobPost[i].douyin+'" data-id="'+jobPost[i].douyin+'" title="点击该按钮修改职位在抖音端的状态为展示中">抖音端已隐藏</a>';
                    }
                }

				list.push('  <td class="row10 left state">'+state+(jobPost[i].off ? ' <code title="该职位已经下架\r下上架时间：'+jobPost[i].offdate+'">下架</code>' : '')+'<span class="more"><s></s></span>'+douyinState+'</td>');
				list.push('  <td class="row7">');
				/*list.push('<a data-id="'+jobPost[i].id+'" data-title="'+jobPost[i].title+'" href="jobPostAdd.php?dopost=edit&id='+jobPost[i].id+'" title="修改" class="edit">修改</a>');*/
				list.push('<a href="javascript:;" title="删除" class="delete link">删除</a><br/>');
				if(jobPost[i].off===1){
					list.push('<a href="javascript:;" style="color: green;" class="onShell" title="上架职位">上架</a>');
				}
				else{
					list.push('<a href="javascript:;" style="color: red;" class="offShell" title="下架职位">下架</a>');
				}
				list.push('</td></tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
            $('.tooltips').tooltip();
            
            $('.statusTips1').tooltip();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
