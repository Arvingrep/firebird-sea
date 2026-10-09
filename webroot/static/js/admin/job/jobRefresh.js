$(function(){
	// $("body").delegate('.add-page','click',function(e){
	// 	let url = $(this).attr('href');
	// 	let id = $(this).attr('data-id')
	// 	let title = $(this).attr('data-title')
	// 	try {
	// 		e.preventDefault();
	// 		parent.addPage(id, "job", title, "job/"+url);
	// 	} catch(e) {}
	// })
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

			// $("#sAddr").html("");

			//if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			//}
			$("#list").attr("data-atpage", 1);
		}
		getList();
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
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条上架
	$("#list").delegate(".onShell", "click", function(){
		$.dialog.confirm('您确定要上架吗？', function(){
			init.onShell();
		});
	});

	//单条下架
	$("#list").delegate(".offShell", "click", function(){
		$.dialog.confirm('您确定要下架吗？', function(){
			init.offShell();
		});
	});

	//批量审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
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
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		searchType     = $("#searchType").val() ? $("#searchType").val() : "";

	var data = [];
	data.push("sKeyword="+sKeyword);
	data.push("adminCity="+$("#cityList").val());
	data.push("sType="+sType);
	data.push("state="+state);
	data.push("start="+start);
	data.push("end="+end);
	data.push("pagestep=200000");
	data.push("page="+page);
	data.push("searchType="+searchType);

	huoniao.showTip("loading", "正在导出，请稍候...", "auto");
	$(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));
});


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
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		searchType     = $("#searchType").val() ? $("#searchType").val() : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("start="+start);
		data.push("end="+end);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("searchType="+searchType);

	huoniao.operaJson("jobRefresh.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, jobPost = val.jobPost;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < jobPost.length; i++){
				list.push('<tr data-id="'+jobPost[i].id+'">');
				list.push('  <td class="row7 left">'+jobPost[i].typename+"<br>"+(jobPost[i].amount==0 ? "<code>免费</code>" : '<span style="color: #0BB20C;">'+jobPost[i].amount+'元</span>')+'</td>');
				list.push('  <td class="row20 left"><a href="'+jobPost[i].curl+'" class="link" target="_blank">'+jobPost[i].title+'</a><br/><a href="javascript:;" class="userinfo" data-id="'+jobPost[i].userid+'">'+jobPost[i].nickname+'</a></td>');
				let postList= "";
				for (let j = 0; j < jobPost[i].postList.length; j++) {
                    postList += "<a target='_blank' class='link' href='"+jobPost[i].postList[j].url+"'>"+jobPost[i].postList[j].title+"</a>"+"<br>";
				}
                list.push('  <td class="row19 left">'+postList+'</td>');
                list.push('  <td class="row15 left">'+jobPost[i].ordernum+"<br>"+jobPost[i].pubdate+'</td>');
				if(jobPost[i].type==1){
					list.push('  <td class="row15 left">'+jobPost[i].pubdate+'</td>');
					list.push('  <td class="row15 left">'+jobPost[i].interval+"<br>"+jobPost[i].next+"<br>"+jobPost[i].last+'</td>');
					list.push('  <td class="row10 left"></td>');
				}else{
					list.push('  <td class="row15 left">'+jobPost[i].start_date+"<br>"+jobPost[i].end_date+'</td>');
					list.push('  <td class="row15 left">'+jobPost[i].interval+"<br>"+jobPost[i].next+"<br>"+jobPost[i].last+'</td>');
					list.push('  <td class="row9 ">'+jobPost[i].less+' / '+jobPost[i].refresh_count+'</td>');
				}
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
            $('.tooltips').tooltip();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
