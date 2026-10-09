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
				huoniao.operaJson("?action=updateState", "id="+id+"&arcrank="+arcrank, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						var title = '';
						if(typeof data.info == 'string'){
							title = data.info;
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
							title = '<strong>以下信息修改失败：</strong><br />' + info.join("<br />");
						}
						$.dialog.alert("<div class='errInfo'>" + title + "</div>", function(){
							getList();
						});
					}
				});
				$("#selectBtn a:eq(1)").click();
			}
		}
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

				huoniao.operaJson("?action=del", "id="+id.join(","), function(data){
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
	}
$(function(){
	$('.icon-question-sign').tooltip();
	huoniao.choseCity($(".choseCity"),$("#cityid"));
	$(".chosen-select").chosen();

	//开始、结束时间
	// $("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});


	//初始加载
	getList();

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if(isCheck.attr('data-id') == 0){
			return;
		}
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

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//新增
	$("#addBtn").bind("click", function(){
		var uid = $("#userid").val();
		if(uid){
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("?action=add", 'id='+uid, function(res){
				if(res && res.state == 100){
					$("#list").attr("data-atpage", "1");
					getList();
				}else{
					huoniao.showTip("error", res.info, 'auto');
				}
			})
		}
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

	$("#list").delegate(".child", "click", function(){
		var t = $(this), id = t.attr("data-id"), name = t.attr("data-name");
		try {
			event.preventDefault();
			parent.addPage("fenxiaoUser_"+id, "member", name+"的下线", "member/fenxiaoUserChild.php?pid="+id);
		} catch(e) {}
	})

	$('#list').delegate('.backcount', 'click', function(){
		var t = $(this), id = t.closest('tr').attr('data-id'), total = t.attr('data-total'), back = t.attr('data-back'), count = t.attr('data-count'), level = t.attr('data-level');

		$.dialog({
			fixed: true,
			title: '设置',
			content: $("#quickEdit").html(),
			width: 400,
			ok: function(){
				//提交
				var level = self.parent.$("#fenxiaoLevel_").val();
				var count = self.parent.$("#count").val();

				huoniao.operaJson("fenxiaoUser.php?action=updateCount", "id="+id+"&level="+level+"&count="+count, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});

			},
			cancel: true
		});

		//填充信息
		self.parent.$("#fenxiaoLevel_").val(level);
		self.parent.$("#total_").html(total + '次（'+(total*back)+echoCurrency('short')+'）');
		self.parent.$("#count_").html(count + '次（'+(count*back)+echoCurrency('short')+'）');
		self.parent.$("#count").val(count);

	});

	$("#list").delegate(".commissionCount", "click", function(event){
		var id = $(this).attr("data-id"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("fenxiaoList", "member", "分销明细", "member/"+href);
		} catch(e) {}
	});



	// 导出
	$("#export").click(function(e){
		// e.preventDefault();
		var sKeyword = encodeURIComponent($("#sKeyword").html()),
			cityid   = $("#cityid").val(),
			type     = $("#ctype").val(),
			state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

		var data = [];
			data.push("sKeyword="+sKeyword);
			data.push("cityid="+cityid);
			data.push("type="+type);
			data.push("state="+state);
			data.push("pagestep=200000");
			data.push("page=1");
            data.push("pid="+pid);
		huoniao.showTip("loading", "正在导出，请稍候...", "auto");
		$(this).attr('href', '?action=getList&do=export&'+data.join('&'));

	})


})

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		// cityid   = $("#cityid").val(),
		// start    = $("#start").html(),
		// end      = $("#end").html(),
		cityid    = $("#cityid").val(),
		type      = $("#ctype").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("cityid="+cityid);
		data.push("type="+type);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("pid="+pid);

	huoniao.operaJson("?action=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, fenxiaoUser = val.fenxiaoUser;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < fenxiaoUser.length; i++){
				var mtype = '';

				var state = "";
				switch (fenxiaoUser[i].state) {
					case 0:
						state = '<span class="gray">待审核</span>';
						break;
					case 1:
						state = '<span class="audit">已审核</span>';
						break;
					case 2:
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}

				list.push('<tr data-id="'+fenxiaoUser[i].id+'">');
				if(fenxiaoUser[i].id){
					list.push('  <td class="row3"><span class="check"></span></td>');
				}else{
					list.push('  <td class="row3">&nbsp;</td>');
				}
				list.push('  <td class="row10 left">'+fenxiaoUser[i].city+'</td>');
				list.push('  <td class="row15 left"><small style="display: inline-block;"><a href="javascript:;" data-id="'+fenxiaoUser[i].userid+'" class="audit userinfo">ID:'+fenxiaoUser[i].userid+'</a></small><br /><small>'+fenxiaoUser[i].phone+'</small></td>');
				list.push('  <td class="row15 left">'+fenxiaoUser[i].nickname+'<br><small>'+fenxiaoUser[i].realname+'</small></td>');
				if(fenxiaoUser[i].id){
					list.push('  <td class="row15 left">'+huoniao.transTimes(fenxiaoUser[i].pubdate, 1)+'</td>');
				}else{
					list.push('  <td class="row15 left"><span class="gray">-</span></td>');
				}
				var fromuser = '', child = '';
				if(fenxiaoUser[i].recuser != null){
					fromuser = '<a href="javascript:;" data-id="'+fenxiaoUser[i].from_uid+'" class="userinfo">'+fenxiaoUser[i].recuser+'</a>';
				}else{
					fromuser = '<span class="gray">无</span>';
				}
				if(fenxiaoUser[i].child){
					child = '<a href="javascript:;" data-id="'+fenxiaoUser[i].userid+'" data-name="'+fenxiaoUser[i].username+'" class="audit child">'+fenxiaoUser[i].child+'</a>';
				}else{
					if(fenxiaoUser[i].id){
						child = '<span class="gray">0</span>';
					}else{
						child = '<span class="gray">-</span>';
					}
				}

				list.push('  <td class="row10 left aaa">'+fromuser+'<span class="gray">&nbsp;&nbsp;|&nbsp;&nbsp;</span>'+child+'</td>');
				if(fenxiaoUser[i].id){
					list.push('  <td class="row10"><a href="fenxiaoList.php?fenxiaouid='+fenxiaoUser[i].userid+'" title="分销金额明细" class="commissionCount">'+fenxiaoUser[i].amount+'</a></td>');
					list.push('  <td class="row10 state">'+(state+'<span class="more"><s></s></span>')+'</td>');
				}else{
					list.push('  <td class="row10"><span class="gray">-</span></td>');
					list.push('  <td class="row10 state"><span class="gray">非分销商</span></td>');
				}
				list.push('  <td class="row12"><a href="javascript:;" title="删除" class="del">删除</a></td>');
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

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
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
		$("#list tr[data-id=0]").removeClass('selected');

	});

	//批量审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('确定要删除该信息吗？', function(){
			init.del();
		});
	});

	//批量删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});
};
